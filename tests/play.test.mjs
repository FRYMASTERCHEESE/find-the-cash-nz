import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const base = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, base), 'utf8');

test('Google Play release keeps the expected package and Android 16 target', async () => {
  const gradle = await read('android/app/build.gradle');
  for (const value of ["applicationId 'nz.findthecash.app'", 'compileSdk 36', 'targetSdk 36', 'versionCode 2']) {
    assert.ok(gradle.includes(value), value);
  }
});

test('store listing short description is within Play metadata limits', async () => {
  const listing = (await read('store-listing/en-NZ.md')).split('\n');
  const at = listing.findIndex(line => line.startsWith('**Short description'));
  assert.ok(at >= 0);
  assert.ok(listing[at+1].length <= 80);
});

test('store screenshots must be captured from a running Android app', async () => {
  const workflow = await read('.github/workflows/play-media.yml');
  const capture = await read('scripts/capture-play-screenshots.sh');
  assert.ok(workflow.includes('android-emulator-runner'));
  assert.ok(capture.includes('adb exec-out screencap -p'));
});

test('public privacy policy does not reintroduce removed social links', async () => {
  const privacy = await read('site/privacy.html');
  assert.doesNotMatch(privacy, /TikTok|YouTube/i);
  assert.ok(privacy.includes('Android app'));
  const activity = await read('android/app/src/main/java/nz/findthecash/app/MainActivity.java');
  assert.ok(activity.includes('Privacy policy ↗'));
  assert.ok(privacy.includes('How long information is kept and how to delete it'));
});


test('closed testing is the only intended Play distribution track', async () => {
 const wf = await read('.github/workflows/play-release.yml');
 const listing = await read('store-listing/en-NZ.md');
 const guide = await read('docs/GOOGLE-PLAY-RELEASE.md');
 assert.match(wf, /CLOSED TESTING signed AAB/);
 assert.match(wf, /github\.ref == 'refs\/heads\/main'/);
 assert.match(wf, /FindTheCashNZ-CLOSED-TEST-AAB-v1/);
 assert.doesNotMatch(wf, /upload-google-play|:app:publish|tracks:.*production|track:\\s*production/);
 assert.match(listing, /Closed testing ONLY/);
 assert.match(guide, /CLOSED TESTING ONLY/);
});

test('support email appears in native app, strings and Google Play listing', async () => {
 const java = await read('android/app/src/main/java/nz/findthecash/app/MainActivity.java');
 const xml = await read('android/app/src/main/res/values/strings.xml');
 const listing = await read('store-listing/en-NZ.md');
 assert.match(java, /getString\(R\.string\.support_email\)/);
 assert.match(java, /Email app support and tester feedback/);
 assert.match(xml, /findthecashnz@gmail\.com/);
 assert.match(listing, /findthecashnz@gmail\.com/);
});
