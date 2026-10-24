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

## Owner steps in Google Play

1. At https://play.google.com/console create a new **Free App** titled **Find The Cash NZ**, English (NZ), contact **findthecashnz@gmail.com**. Confirm the package name **nz.findthecash.app** is available; package identities cannot be changed/reused once registered.
2. Accept Play App Signing; use a Google-generated signing key if suitable and create a **separate upload key** that you own. Do not reuse keys from your other apps.
3. In Android Studio use Build > Generate Signed Bundle/APK > Create new keystore, or use Java keytool. Save the .jks, alias and passwords securely outside GitHub. Never paste any secrets into chat.
4. In this new repository go to **Settings > Secrets and variables > Actions**, create these **FOUR GitHub Actions secrets**:
    - FTCNZ_UPLOAD_KEYSTORE_BASE64 : one-line base64 of the private .jks bytes. Base64 is encoding, not encryption; store only in GitHub Secrets. Linux: base64 -w0 findthecash-upload.jks; PowerShell: [Convert]::ToBase64String([IO.File]::ReadAllBytes('findthecash-upload.jks'))
    - FTCNZ_UPLOAD_STORE_PASSWORD : the keystore password
    - FTCNZ_UPLOAD_KEY_ALIAS : upload key alias
    - FTCNZ_UPLOAD_KEY_PASSWORD : private key alias password
5. Run GitHub Actions > **Build signed Find The Cash NZ Google Play bundle** > Run workflow. It will fail clearly if credentials are missing, and it verifies the resulting .aab signature. Download the **FindTheCashNZ-SIGNED-Play-AAB-v1** artifact, unzip, and back up the keystore separately.
6. Upload that signed .aab to Google Play Console **Internal testing** first. Fill the Play listing with genuine icon, feature graphic, *actual app screenshots*, privacy URL, content rating, Data Safety, App access, target audience and policy declarations. These answers require your own confirmation about your released app and age suitability.
7. Test on real Android phones; check launch, local checklist, offline kindness ideas, external links, poor connection, device rotation and privacy disclosures.
8. New personal developer accounts created after 13 November 2023 generally require at least **12 testers continuously opted in to closed testing for 14 days** before they can apply for public Production access. This depends on your account status. Finish any other Play Console verification requirements.
9. Publish publicly only when you choose and Google approves. For every app update increase versionCode and sign with the **same upload key**.

## Important

This workflow **does not automatically submit** the app to Google Play. It creates a securely signed AAB for manual upload. Do not upload the debug APK or unsigned AAB as a Play release.

The app does not provide guaranteed cash prizes, a betting product, precise location tracking, payments, automatic account sync or live Facebook sync. The public updates file only shows posts after owner-authorized Meta access is connected. Checklist/knock-on kindness progress stays on the phone. The app fetches public data from GitHub Pages, and external Facebook links are handled outside the app. Verify the Play Data Safety form against the final release.

## Google documentation (October 2026)

https://support.google.com/googleplay/android-developer/answer/9859152
https://support.google.com/googleplay/android-developer/answer/9866151
https://support.google.com/googleplay/android-developer/answer/14151465
https://support.google.com/googleplay/android-developer/answer/11926878
https://developer.android.com/studio/publish/app-signing
