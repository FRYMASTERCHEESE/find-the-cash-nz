"""Offline synthetic tests for the owner-published town workflow (no Nominatim calls)."""
import importlib.util
import io
import json
from pathlib import Path
import unittest
from datetime import datetime, timezone, timedelta

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location(
    "owner_town", ROOT / "scripts" / "publish-hunt-town.py"
)
publisher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(publisher)


class OwnerHuntTownTests(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 10, 24, 8, 0, tzinfo=timezone.utc)
        self.town = {
            "name": "Matamata", "display_name": "Matamata, Waikato, New Zealand",
            "lat": "-37.8102", "lon": "175.7748", "category": "place",
            "type": "town", "address": {"country_code": "nz"}
        }

    def test_allow_nz_towns_with_maori_macrons(self):
        for name in ("Matamata", "Cambridge", "Te Awamutu", "Ōtorohanga",
                     "Hāwera", "Palmerston North", "Whangārei, Northland"):
            self.assertEqual(publisher.clean_town(name), name)
        for bad in ("", "a", "123 High Street", "Auckland;rm -rf",
                    "https://example.com", "24 City", "<script>"):
            with self.assertRaises(ValueError, msg=bad):
                publisher.clean_town(bad)

    def test_resolve_exact_nz_settlement_only(self):
        results = [
            {**self.town, "name": "Matamata", "address": {"country_code": "gb"}},
            {**self.town, "name": "Waikato"},
            {**self.town, "category": "shop", "type": "supermarket"},
            self.town
        ]
        loc = publisher.choose_settlement(results, "Matamata")
        self.assertEqual(loc, {"town": "Matamata", "lat": -37.8102, "lon": 175.7748})
        with self.assertRaises(ValueError):
            publisher.choose_settlement(results[:3], "Matamata")

    def test_one_manual_network_request_has_app_identity(self):
        calls = []
        def fake_opener(request, timeout):
            calls.append(request)
            self.assertEqual(timeout, 15)
            self.assertIn("countrycodes=nz", request.full_url)
            self.assertIn("Matamata", request.full_url)
            self.assertIn("FindTheCashNZ", request.get_header("User-agent"))
            self.assertIn("findthecashnz@gmail.com", request.get_header("User-agent"))
            return io.BytesIO(json.dumps([self.town]).encode())
        result = publisher.lookup_one_town("Matamata", opener=fake_opener)
        self.assertEqual(result["town"], "Matamata")
        self.assertEqual(len(calls), 1)

    def test_pin_expires_after_12_hours_and_is_town_level_only(self):
        cache = {"version": 1, "towns": {}}
        calls = []
        def resolver(town):
            calls.append(town)
            return {"town": town, "lat": -37.81, "lon": 175.78}
        record = publisher.public_record(
            "pin", self.now, "Matamata", resolver=resolver, cache=cache
        )
        self.assertTrue(record["active"])
        self.assertEqual(record["source"], "owner_published")
        self.assertEqual(record["accuracy"], "approximate_town_centre")
        self.assertEqual(record["town"], "Matamata")
        self.assertEqual(record["expires_at"], (self.now + timedelta(hours=12)).isoformat().replace("+00:00", "Z"))
        self.assertEqual(calls, ["Matamata"])
        self.assertIn("matamata", cache["towns"])
        record2 = publisher.public_record("pin", self.now, "Matamata", resolver=resolver, cache=cache)
        self.assertTrue(record2["active"])
        self.assertEqual(len(calls), 1, "cache prevents second remote geocoding request")

    def test_clear_does_not_resolve_or_leave_public_location(self):
        def never(town):
            self.fail("clear should never geocode")
        data = publisher.public_record("clear", self.now, resolver=never)
        self.assertFalse(data["active"])
        self.assertIsNone(data["town"])
        self.assertIsNone(data["lat"])
        self.assertIsNone(data["lon"])
        with self.assertRaises(ValueError):
            publisher.public_record("wrong", self.now)


if __name__ == "__main__":
    unittest.main()
