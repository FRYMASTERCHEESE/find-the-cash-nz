# Find The Cash NZ launch checklist

## Website
- [ ] Verify GitHub Actions source in repository **Settings → Pages**.
- [ ] GitHub "Publish Find The Cash NZ website" completes successfully.
- [ ] Public URL https://frymastercheese.github.io/find-the-cash-nz/ loads with correct graphics.
- [ ] On phone: test menu, official Facebook/reel links, checklist, offline behavior and policy pages.
- [ ] Test installing the PWA (browser support varies) and verify install icons.

## Native Android
- [ ] The Android debug APK GitHub workflow completes and produces the APK artifact.
- [ ] Install debug APK on a real Android phone; test 4 tabs, rotation, device-local checklist, external links, offline behavior.
- [ ] Verify \`nz.findthecash.app\` as desired Google Play package name.
- [ ] Create Google Play App Signing, build signed release AAB, provide Play listing/privacy link/screenshots and pass policy/testing review.
- [ ] Debug APK is not a live Play Store release.

## Facebook
- [ ] Only if wanted, connect official Page token with Meta access and place it in GitHub secrets.
- [ ] Verify that synced updates are authentic before telling users it is live.
- [ ] Never publish unverified winners, exact hidden cash locations or third-party photos without consent.

## Find The Cash NZ — Closed testing only

- [ ] In your **existing** Play Console app, set **Store listing contact details** email to **findthecashnz@gmail.com**, then Save.
- [ ] Set **Closed testing → Testers** feedback email to **findthecashnz@gmail.com**.
- [ ] Provide a private upload key to GitHub Actions secrets; do **not** commit it to GitHub files or paste it into chat.
- [ ] Build the **FindTheCashNZ-CLOSED-TEST-AAB-v1** signed bundle via the manual GitHub Actions workflow.
- [ ] Upload the signed bundle to **Closed testing → Create new release** only; do not create Internal, Open or Production releases.
- [ ] Add your email-list testers or Google Group in **Closed testing → Testers**, then share Google's opt-in link.
- [ ] Verify the closed test release is approved and testers can install the app. Do not promote it to Production.
