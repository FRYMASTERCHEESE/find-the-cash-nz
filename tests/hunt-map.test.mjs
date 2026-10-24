import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {isVisibleTownPin, embedUrl, fullMapUrl} from '../site/hunt-map.js';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const now = Date.parse('2026-10-24T08:00:00Z');
const active = {
  active:true, town:'Matamata', lat:-37.81, lon:175.78,
  source:'owner_published', accuracy:'approximate_town_centre',
  published_at:'2026-10-24T07:00:00Z', expires_at:'2099-10-24T19:00:00Z'
};

test('Only fresh owner-published town centres are shown', () => {
  assert.equal(isVisibleTownPin(active, now), true);
  assert.equal(isVisibleTownPin({...active, active:false}, now), false);
  assert.equal(isVisibleTownPin({...active, source:'public_user'}, now), false);
  assert.equal(isVisibleTownPin({...active, accuracy:'precise_GPS'}, now), false);
  assert.equal(isVisibleTownPin({...active, lat:NaN}, now), false);
  assert.equal(isVisibleTownPin({...active, lon:200}, now), false);
  assert.equal(isVisibleTownPin({...active, town:'x'}, now), false);
  assert.equal(isVisibleTownPin(active, Date.parse(active.expires_at)), false);
});

test('Map link is OSM only and pin is approximate', () => {
  const link = embedUrl(active);
  const url = new URL(link);
  assert.equal(url.protocol,'https:');
  assert.equal(url.hostname,'www.openstreetmap.org');
  assert.equal(url.pathname,'/export/embed.html');
  assert.equal(url.searchParams.get('marker'),'-37.81,175.78');
  assert.equal(url.searchParams.get('layer'),'mapnik');
  assert.match(fullMapUrl(active),/^https:\/\/www\.openstreetmap\.org\/\?mlat=-37\.81000&mlon=175\.78000/);
  assert.equal(new URL(embedUrl(null)).searchParams.has('marker'),false);
});

test('No unapproved live hunt, private location, GPS or edit endpoint on public page', async () => {
  const [html, home, script, privacy, manifest, workflow, doc, data] = await Promise.all([
    read('site/hunt-map.html'), read('site/index.html'), read('site/hunt-map.js'),
    read('site/privacy.html'), read('android/app/src/main/AndroidManifest.xml'),
    read('.github/workflows/publish-hunt-town.yml'), read('docs/OWNER-HUNT-TOWN.md'),
    read('site/hunt-location.json')
  ]);
  assert.match(html,/id="town-map-frame"/);
  assert.match(html,/not live GPS/i);
  assert.match(html,/findthecashnz@gmail\.com/);
  assert.match(home,/id="home-town-status"/);
  assert.match(home,/hunt-map\.html/);
  assert.match(privacy,/Owner-published town map/);
  assert.doesNotMatch(script,/navigator\.geolocation|watchPosition|getCurrentPosition|localStorage|sessionStorage/);
  assert.doesNotMatch(manifest,/(ACCESS_FINE_LOCATION|ACCESS_COARSE_LOCATION|ACCESS_BACKGROUND_LOCATION)/);
  assert.match(workflow,/TRIGGER_ACTOR.*FRYMASTERCHEESE/);
  assert.match(workflow,/workflow_dispatch/);
  assert.match(workflow,/actions\/deploy-pages@v4/);
  assert.match(workflow,/HUNT_TOWN/);
  assert.match(doc,/Nominatim Usage Policy/);
  const pin = JSON.parse(data);
  assert.equal(pin.active,false);
  assert.equal(pin.town,null);
});

test('Android map is for public read-only viewing; owner key never embedded', async () => {
  const java = await read('android/app/src/main/java/nz/findthecash/app/MainActivity.java');
  const gradle = await read('android/app/build.gradle');
  const contact = await read('android/app/src/main/res/values/strings.xml');
  assert.match(java,/townMapWebView\.loadUrl\(SITE \+ "hunt-map\.html"\)/);
  assert.match(java,/setGeolocationEnabled\(false\)/);
  assert.match(java,/setAllowFileAccess\(false\)/);
  assert.doesNotMatch(java,/GITHUB_TOKEN|ghp_|dispatches|personal_access_token/);
  assert.match(gradle,/versionCode 2/);
  assert.match(contact,/findthecashnz@gmail\.com/);
});
