# Find The Cash NZ 💚🇳🇿

Independent website and native Android app for the [Find The Cash NZ Facebook Page](https://www.facebook.com/FindTheCashNz/). Separate from the Find The Cash NZ Fudge project.

**Website after deployment:** https://frymastercheese.github.io/find-the-cash-nz/  
**Contact:** findthecashnz@gmail.com

## Project contents

- `site/`: public website, safety/support, device-only checklist, and read-only **owner-pinned NZ town or exact worldwide location map** shared with Android (no public edit permissions).
- `android/`: native Android app with Home, Updates, Hunt Kit, Hunt Map and About; the same read-only public map and updates as the website.
- `site/updates.json`: initial disconnected Facebook feed. No invented clues or prizes.
- `site/hunt-location.json`: owner-published location pin; only published through the authenticated owner-only GitHub Actions workflow, expires after 12 hours, and only shows an exact location if the owner deliberately chooses one.
- `scripts/sync-facebook.mjs`: optional owner-approved, read-only Meta Graph API importer.
- `.github/workflows/`: automatic website tests, Android builds, Pages deployment, and an owner-initiated **Publish Hunt Town Pin** workflow that converts a typed NZ town into a broad pin or publishes owner-chosen coordinates anywhere on the map. Owner account must be **FRYMASTERCHEESE**, public users cannot publish.
- [Owner location publishing and map-click instructions](docs/OWNER-HUNT-TOWN.md) · [Public hunt map](https://frymastercheese.github.io/find-the-cash-nz/hunt-map.html).
- `docs/`: launch and Meta setup information.

The website requires a successful GitHub Pages deployment, and GitHub Settings → Pages should use **GitHub Actions** as its source. Android debug APKs are for testing only; a Google Play release still requires device tests, a signed AAB and Play Console review. Meta Page updates do not sync until the owner authorizes Page access.

**Public research snapshot (24 October 2026):** 23K Facebook followers, 94% recommendations (15 reviews), community kindness from NZ to the USA. These figures are not live and no active drop is implied.

To test: `npm run check` with Node 20+. To build Android: import `android/` in Android Studio or let GitHub Actions compile the debug APK. [Release checklist](docs/LAUNCH-CHECKLIST.md) · [Facebook sync setup](docs/FACEBOOK-SYNC.md).

## Google Play — Closed testing only

The owner has created **Find The Cash NZ** in Google Play Console. This repository is configured to prepare the native Android app for **Closed testing only**, not Internal, Open or Production. The Google Play listing support email and tester feedback email are **findthecashnz@gmail.com**. The same support address appears inside the app.

- [Closed-testing setup and private signing instructions](docs/GOOGLE-PLAY-RELEASE.md)
- [Closed-test signed AAB workflow](.github/workflows/play-release.yml)
- [Play Store listing copy](store-listing/en-NZ.md)

The signed AAB can be built once the owner securely configures upload signing. GitHub does **not** automatically upload to Play Console or change the Console's support email field. The owner must save that field manually in the app's Store settings.
