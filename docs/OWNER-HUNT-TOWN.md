# CEO guide — Pin any map location for everyone to see

**Who can publish?** Only the GitHub owner `FRYMASTERCHEESE` running the
authenticated workflow on `main`. **Who can view?** Everyone on the website,
including visitors who do not have a GitHub account. The Android Hunt map tab
also reads this public map after its next Closed testing release.

- [Choose any spot on the world map](https://frymastercheese.github.io/find-the-cash-nz/owner-pin-picker.html)
- [Owner-only GitHub publish/clear control](https://github.com/FRYMASTERCHEESE/find-the-cash-nz/actions/workflows/publish-hunt-town.yml)
- [Public Find The Cash NZ map](https://frymastercheese.github.io/find-the-cash-nz/hunt-map.html)

## Pin any exact location (anywhere in the world)

1. Open the **Choose any spot** map above on your laptop or phone.
   Zoom or move it anywhere; **tap the exact place**, then drag the marker
   if you need to adjust it.
2. Click **Copy coordinates**. You will get one value, e.g.
   `-37.809563, 175.773279`.
3. Open **Owner-only publish/clear control** while signed in as
   **FRYMASTERCHEESE**.
4. Select **Run workflow** on the **main** branch, choose **pin**,
   **leave Town empty**, paste the value into **Coordinates**, optionally type
   the **public label** (e.g. `Near the lake`), and press **Run workflow**.

GitHub validates the coordinates and updates the public website automatically.
No API key, command line or GPS permission is required. A coordinate pin can
mark an exact, owner-selected spot in **any country** (excluding the polar
latitudes that world maps cannot display).

This owner-picker page helps select a position; it does not contain passwords,
tokens, backend write access or a way to publish as a visitor. Anyone with
the link could use the helper, but only your authenticated GitHub account can
**publish**, **replace**, or **clear** a public marker.

## Original automatic NZ town mode still works

Instead of using the Coordinates field, leave it empty and enter a New Zealand
town or city in **Town**, for example `Matamata` or `Ōtorohanga`.
GitHub uses the owner-triggered, rate-limited one-request Nominatim lookup and
caches the resulting **approximate town centre**. No coordinates are needed.

**Do not enter both Town and Coordinates together.** If either coordinate is
incorrect, choose another point and copy it again.

## Clear and expiry

Choose **clear** from the same owner workflow to immediately remove the public
pin. The map automatically hides any marker **12 hours after publication** even
if you forget to clear it. Open public maps check for new owner updates about
every 45 seconds (plus reload when a viewer returns to the page). GitHub Pages
publishing still depends on its deployment completing successfully.

## Privacy and safety — exact pins are PUBLIC

**Be sure you actually want this exact location to be public before pressing
Run workflow.** The published coordinates are written to a **public GitHub
repository** and can remain discoverable in Git history even after you clear
the pin. Avoid sharing private home addresses, shelters, vulnerable people's
locations or anyone else's sensitive location without their permission.
This is a deliberate public pin, **not live GPS tracking**; the app never
tracks your device.

The public map alone does **not** confirm that a $50 prize is available at the
marked spot. The real hunt rules, current status, clues and whether a prize is
hidden remain on the official
[Find The Cash NZ Facebook Page](https://www.facebook.com/FindTheCashNz/).
Always consider trespass, traffic and local safety.

Public support: **findthecashnz@gmail.com**.

## Free provider limits and implementation

The **exact coordinate picker never calls a geocoding API**. It simply reads
your map click and prepares latitude/longitude for manual entry in the
authenticated GitHub workflow. The map itself uses Leaflet and OpenStreetMap
tiles with proper attribution. No new map key or paid service is required.

The optional original NZ town lookup uses OpenStreetMap Nominatim only when
manually run by the owner, with an identifying User-Agent, cache, one lookup,
no autocomplete and a strict NZ settlement check. Its
[Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)
requires avoiding heavy use (at most one request per second), proper
identification, caching and no public generic geocoding or autocomplete.
Do not convert the town lookup into a general address search through the
public Nominatim server.

The `workflow_dispatch` publish action validates the GitHub actor
`FRYMASTERCHEESE` and branch `main` before writing
`site/hunt-location.json`. When successful, it deploys GitHub Pages in
the same run. A new owner-selected pin replaces the last one. Visitors'
browsers read this static public feed, but do not write it.

**Android:** This is a website-side pin publishing change. The staged
Android 1.0.1 (2) app loads the same public map; the existing Google Play
Alpha 1.0.0 (1) bundle does not include that tab, and Google Play review and
a later Closed testing update are separate.
