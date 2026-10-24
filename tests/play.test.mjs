import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const base = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, base), 'utf8');

test('Google Play release keeps the expected package and Android 16 target', async () => {
  const gradle = await read('android/app/build.gradle');
  for (const value of ["applicationId 'nz.findthecash.app'", 'compileSdk 36', 'targetSdk 36', 'versionCode 1']) {
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
});
