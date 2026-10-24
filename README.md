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
