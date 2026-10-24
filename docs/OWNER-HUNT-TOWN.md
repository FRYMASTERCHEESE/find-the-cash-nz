# CEO guide — Publish a hunt town automatically

## One owner-only action

Owner account: **FRYMASTERCHEESE** (signed into GitHub). This is the **only**
account allowed by the publishing workflow. Website visitors and app users can
**see** your chosen town, but cannot edit, pin or clear it.

[Open the Publish Hunt Town workflow](https://github.com/FRYMASTERCHEESE/find-the-cash-nz/actions/workflows/publish-hunt-town.yml)

1. Click **Run workflow**. Leave the branch set to **main**.
2. Choose **pin**. Type the town or city, e.g. **Matamata** or **Tokoroa**.
3. Click **Run workflow**. GitHub automatically looks up that one NZ town,
   sets an approximate town-centre pin and publishes the updated website.
   No coordinates, GPS access, API key or editing code is required.

Use **clear** to remove the public pin; the town input can be left empty then.
Pins **expire automatically after 12 hours** on both the public website and
Android app, even if you forget to clear them.

**Public read-only map:**
https://frymastercheese.github.io/find-the-cash-nz/hunt-map.html

**Website home:** also displays the owner-pinned town and a map when one is
active. Both pages check for updates while open. The Android **Hunt map** tab
loads the same web page after you upload and Google approves the next
Closed testing build. The previously submitted 1.0.0 (1) Alpha build is
unchanged; the map app build is staged as **1.0.1 (2)**.

## Safety and privacy

- The town pin is a **broad town centre**, NOT your live GPS, a private address,
  or the precise location of any hidden cash.
- Choose a town only when you want it **publicly visible to everyone**.
- To end a hunt early, run the **clear** action. The map will also hide
  expired pins even if the site has not yet deployed a new file.
- Public viewers **never** get a publishing form, account credentials or
  permission to change the marker. GitHub authenticates your account and
  the workflow explicitly refuses any actor other than FRYMASTERCHEESE.
- Only verified Facebook posts describe active hunts, actual rules and prizes.
  Do not treat this town marker as a verified hidden-$50 location.
- Your support email remains **findthecashnz@gmail.com**.

## Free geocoding service, deliberately limited

This owner-operated action makes **one request for one owner-typed NZ town**
to the public Nominatim service only on a cache miss. It is not public search,
address search, autocomplete, polling geocoding or a generic API proxy.
It uses an identifying User-Agent and contact and caches results in
`data/nz-town-cache.json` to avoid repeat requests.

Before making regular or high-volume use of this service, review its
**[Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)**:
maximum **one request per second**, identify your app, cache results, no
autocomplete and no systematic queries. The owner is responsible for this
compliance; use another provider if usage grows or OSM asks for changes.
OpenStreetMap map embeds are attributed on the public map.

## Automation mechanics

The workflow publishes `site/hunt-location.json` and uses an explicit
GitHub Pages deployment in the **same GitHub Actions run**. This is necessary
because a GitHub Actions commit created with `GITHUB_TOKEN` **does not**
trigger a second push-based Pages workflow. All writes use HTTPS and
GitHub permissions. Neither the private Play upload key nor customer data
is involved. No Google Play track or release is modified by this action.

If a town cannot be verified unambiguously as being in New Zealand, the
workflow fails without changing the existing public pin.
