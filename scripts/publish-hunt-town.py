#!/usr/bin/env python3
"""Owner-initiated, single-town New Zealand map publication.

Run ONLY from the trusted, owner-gated GitHub Actions workflow.
Public OSMF Nominatim is consulted at most once per new, manually submitted
town name. Repeat queries are served from the repository's local cache.
https://operations.osmfoundation.org/policies/nominatim/
"""
import json
import math
import os
from pathlib import Path
import re
import sys
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_FILE = ROOT / "site" / "hunt-location.json"
CACHE_FILE = ROOT / "data" / "nz-town-cache.json"
SUPPORT_EMAIL = "findthecashnz@gmail.com"
NOMINATIM = "https://nominatim.openstreetmap.org/search"
ACTIVE_HOURS = 12
# One or two words plus optional region, including Māori macrons.
WORD = r"[^\W\d_]+(?:[ '\u2019-][^\W\d_]+)*"
TOWN_PATTERN = re.compile(rf"^{WORD}(?:,\s*{WORD})?$", re.UNICODE)
ALLOWED_TYPES = {"city", "town", "village", "hamlet", "locality",
                 "municipality", "administrative", "suburb"}


def clean_town(raw):
    if not isinstance(raw, str):
        raise ValueError("Enter a town or city, e.g. Matamata")
    town = " ".join(raw.strip().split())
    if not 2 <= len(town) <= 70 or not TOWN_PATTERN.fullmatch(town):
        raise ValueError("Enter only an NZ town/city name (optionally ', region'); no street addresses")
    return town


def normalize(value):
    return " ".join(value.strip().casefold().split())


def safe_coordinates(lat, lon):
    return (isinstance(lat, (float, int)) and not isinstance(lat, bool) and
            isinstance(lon, (float, int)) and not isinstance(lon, bool) and
            math.isfinite(lat) and math.isfinite(lon) and
            -48.5 <= lat <= -33.0 and 165.0 <= lon <= 180.0)


def choose_settlement(results, requested):
    wanted = normalize(requested.split(",")[0])
    for result in results:
        if not isinstance(result, dict):
            continue
        location_type = str(result.get("type", "")).lower()
        category = str(result.get("category") or result.get("class") or "").lower()
        address = result.get("address") or {}
        if (location_type not in ALLOWED_TYPES or category not in {"place", "boundary"}
                or address.get("country_code") != "nz"):
            continue
        label = str(result.get("name") or str(result.get("display_name", "")).split(",")[0]).strip()
        if normalize(label) != wanted:
            continue
        try:
            lat = float(result["lat"])
            lon = float(result["lon"])
        except (TypeError, ValueError, KeyError):
            continue
        if safe_coordinates(lat, lon):
            return {"town": label, "lat": round(lat, 5), "lon": round(lon, 5)}
    raise ValueError(f"No unambiguous New Zealand town/city found for {requested!r}. Public location left unchanged.")


def lookup_one_town(town, opener=urlopen):
    # Manually triggered, single request, no autocomplete, no geocoding on public visits.
    query = urlencode({
        "q": f"{town}, New Zealand",
        "format": "jsonv2",
        "addressdetails": "1",
        "countrycodes": "nz",
        "limit": "5",
        "email": SUPPORT_EMAIL
    })
    request = Request(
        f"{NOMINATIM}?{query}",
        headers={
            "User-Agent": f"FindTheCashNZ-HuntTownOwnerPublisher/1.0 (contact: {SUPPORT_EMAIL})",
            "Accept": "application/json",
            "Accept-Language": "en-NZ"
        }
    )
    with opener(request, timeout=15) as response:
        results = json.load(response)
    if not isinstance(results, list):
        raise ValueError("Unexpected geocoding response. Public location left unchanged.")
    return choose_settlement(results, town)


def public_record(action, now, town=None, resolver=lookup_one_town, cache=None):
    stamp = now.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    empty = {
        "active": False,
        "town": None,
        "lat": None,
        "lon": None,
        "published_at": None,
        "expires_at": None,
        "accuracy": "approximate_town_centre",
        "source": "owner_published"
    }
    if action == "clear":
        return empty
    if action != "pin":
        raise ValueError("Action must be pin or clear")
    town = clean_town(town)
    key = normalize(town)
    places = (cache or {}).get("towns", {})
    place = places.get(key) if isinstance(places, dict) else None
    if (not isinstance(place, dict) or
            not safe_coordinates(place.get("lat"), place.get("lon")) or
            not isinstance(place.get("town"), str)):
        place = resolver(town)
        if not safe_coordinates(place.get("lat"), place.get("lon")):
            raise ValueError("No valid New Zealand town centre found")
        if cache is not None:
            cache.setdefault("towns", {})[key] = place
    expiry = (now.astimezone(timezone.utc) + timedelta(hours=ACTIVE_HOURS))
    return {
        **empty, "active": True,
        "town": place["town"],
        "lat": place["lat"], "lon": place["lon"],
        "published_at": stamp,
        "expires_at": expiry.isoformat(timespec="seconds").replace("+00:00", "Z")
    }


def main():
    action = os.environ.get("HUNT_ACTION", "pin").strip().lower()
    town = os.environ.get("HUNT_TOWN", "")
    now = datetime.now(timezone.utc)
    if action not in {"pin", "clear"}:
        raise ValueError("Action must be pin or clear")
    cache = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
    if cache.get("version") != 1 or not isinstance(cache.get("towns"), dict):
        raise ValueError("Unexpected town cache format")
    new_record = public_record(action, now, town, cache=cache)
    # After all validation/geocoding, write both outputs. No public changes on lookup failures.
    PUBLIC_FILE.write_text(json.dumps(new_record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CACHE_FILE.write_text(json.dumps(cache, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    if action == "pin":
        print(f"Pinned APPROXIMATE NZ town centre: {new_record['town']} until {new_record['expires_at']} (no prize location)")
    else:
        print("Cleared the public town pin; no location displayed.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"OWNER PIN NOT PUBLISHED: {error}", file=sys.stderr)
        sys.exit(1)
