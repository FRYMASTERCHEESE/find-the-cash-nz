# Owner-authorized Facebook Page sync

**Current status: not connected.** Real hunt details are only confirmed on the [official Page](https://www.facebook.com/FindTheCashNz/). The website and Android app share the same public file at \`site/updates.json\`, initially empty.

## Secure, official setup
1. The Find The Cash NZ Page owner obtains appropriate Meta app/Page access and a token permitted to read the Page's published posts. This is subject to Meta's access review and current Page rules.
2. In this repository open **Settings → Secrets and variables → Actions** and add two repository secrets: \`META_PAGE_ID\` (public page ID) and \`META_PAGE_ACCESS_TOKEN\` (secret access token). Never put tokens in chat, app sources, browser files or issues.
3. Trigger **Actions → Sync official Facebook Page posts → Run workflow** to test. With valid credentials, the workflow reads and sanitizes at most six public Page posts, retaining only HTTPS Facebook permalink URLs and safe messages, and updates \`site/updates.json\`.
4. A scheduled run checks every four hours; it skips silently when credentials are not configured. When posts change, GitHub Pages republishes the website.

## Limits
- No real Meta account/API access is connected automatically just from knowing the public Page URL.
- Import does not publish on Facebook, send messages, collect personal data, create new hunts, verify winners or reveal private spots.
- Read-only API access may be restricted by permissions and app review; if it fails the last public feed remains unchanged.
- Public posts can become stale. Link back to official Facebook for the most current status.
- Website and Android app checklists are **device-local**, not account-synced.
