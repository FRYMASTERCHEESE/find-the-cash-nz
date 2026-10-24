# Find The Cash NZ — Google Play release guide

App name: **Find The Cash NZ**
Package: **nz.findthecash.app**
First version: **1.0.0 / versionCode 1**
Android target: **API 36**, minimum API 26.
Website: https://frymastercheese.github.io/find-the-cash-nz/
Privacy policy: https://frymastercheese.github.io/find-the-cash-nz/privacy.html
Contact: findthecashnz@gmail.com

## Prepared

This repository has a native Android app with Home, official Facebook Updates, a private hunt checklist, offline kindness suggestions and About/contact. CI builds a debug APK, runs release lint and validates an **unsigned** App Bundle. The new manually triggered Play build signs an App Bundle **only** with private owner-provided credentials, never with a sample key.

There is Play listing copy in store-listing/en-NZ.md. Media can be built from real app screenshots and a 512px store icon with the media workflow.

## Support email — Google Play Console

The support and closed-test feedback email is **findthecashnz@gmail.com**. This address is already used by the website and now appears in the native Android app. The owner must also **save it in the existing app's Play Console settings**: **Grow users → Store presence → Store settings → Store listing contact details**, then **Save**. GitHub code cannot directly change that account-level Google Play form.

## Owner steps in Google Play

1. The owner **has already created Find The Cash NZ in Play Console**. Use that existing app; do not create a duplicate. Confirm the package name is **nz.findthecash.app** when uploading the first AAB. Package names cannot be changed after the first upload. The app is **Free**.
2. Accept Play App Signing; use a Google-generated signing key if suitable and create a **separate upload key** that you own. Do not reuse keys from your other apps.
3. In Android Studio use Build > Generate Signed Bundle/APK > Create new keystore, or use Java keytool. Save the .jks, alias and passwords securely outside GitHub. Never paste any secrets into chat.
4. In this new repository go to **Settings > Secrets and variables > Actions**, create these **FOUR GitHub Actions secrets**:
    - FTCNZ_UPLOAD_KEYSTORE_BASE64 : one-line base64 of the private .jks bytes. Base64 is encoding, not encryption; store only in GitHub Secrets. Linux: base64 -w0 findthecash-upload.jks; PowerShell: [Convert]::ToBase64String([IO.File]::ReadAllBytes('findthecash-upload.jks'))
    - FTCNZ_UPLOAD_STORE_PASSWORD : the keystore password
    - FTCNZ_UPLOAD_KEY_ALIAS : upload key alias
    - FTCNZ_UPLOAD_KEY_PASSWORD : private key alias password
5. Run GitHub Actions > **Build Find The Cash NZ CLOSED TESTING signed AAB** > Run workflow, on the `main` branch. It fails safely if signing credentials are missing. Download the **FindTheCashNZ-CLOSED-TEST-AAB-v1** artifact, extract the signed `.aab`, and back up the keystore separately.
6. **CLOSED TESTING ONLY:** In the existing Google Play Console app open **Test and release → Testing → Closed testing → Manage track → Create new release**. Upload the signed `.aab` there, not to Internal testing, Open testing, or Production. Complete required app setup and store listing with genuine icon, feature graphic, real screenshots, privacy URL, content rating, Data safety, App access and age declarations.
7. **Closed test participant access:** Open the Closed testing track's **Testers** tab. Add the tester email list or an opted-in Google Group, set the feedback address to **findthecashnz@gmail.com**, save, and use the opt-in link Google generates. Test on real Android phones: app launch, support email, local checklist, kindness prompts, external links, rotation, poor network and privacy.
8. For newer personal developer accounts, Google requires **12 testers opted into a closed test continuously for at least 14 days** to become eligible to apply for Production later. Your current request is **only Closed testing**: do not apply for or start a Production release. Verify tester participation and any account-specific Play Console setup.
9. Roll out the release **to the Closed testing track only** after completing required reviews. Do not promote to Open testing or Production. For later closed-test updates, increase `versionCode` and use the same upload key.

## Important

This workflow **does not automatically submit** to Google Play. It prepares a signed AAB intended **only for Closed testing**, which the owner manually uploads to that track. Do not upload a debug APK or unsigned AAB as a Play release. No step in the workflow calls the Google Play Developer API or can promote the app to Production.

The app does not provide guaranteed cash prizes, a betting product, precise location tracking, payments, automatic account sync or live Facebook sync. The public updates file only shows posts after owner-authorized Meta access is connected. Checklist/knock-on kindness progress stays on the phone. The app fetches public data from GitHub Pages, and external Facebook links are handled outside the app. Verify the Play Data Safety form against the final release.

## Google documentation (October 2026)

https://support.google.com/googleplay/android-developer/answer/9859152
https://support.google.com/googleplay/android-developer/answer/9866151
https://support.google.com/googleplay/android-developer/answer/14151465
https://support.google.com/googleplay/android-developer/answer/11926878
https://developer.android.com/studio/publish/app-signing
