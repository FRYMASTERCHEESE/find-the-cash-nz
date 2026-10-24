# Find The Cash NZ 💚🇳🇿

Independent website and native Android app for the [Find The Cash NZ Facebook Page](https://www.facebook.com/FindTheCashNz/). Separate from the Find The Cash NZ Fudge project.

**Website after deployment:** https://frymastercheese.github.io/find-the-cash-nz/  
**Contact:** findthecashnz@gmail.com

## Project contents

- `site/`: responsive green-and-gold website, news and official Facebook links, winners/community stories, privacy, safety, support, and an optional device-only hunt checklist.
- `android/`: native Android app with Home, Updates, Hunt Kit and About; the same verified Page feed as the website.
- `site/updates.json`: initial disconnected feed. Never guesses a current drop, location, winner or prize.
- `scripts/sync-facebook.mjs`: optional owner-approved, read-only Meta Graph API importer.
- `.github/workflows/`: automatic website tests, Android debug APK compilation, GitHub Pages deployment, and optional Facebook updates.
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
