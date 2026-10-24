import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {isValidPoint,mapLink,locationEmail,SUPPORT_EMAIL} from '../site/location.js';

const read = path => readFile(new URL('../' + path,import.meta.url),'utf8');

test('manual map location is valid for NZ and world coordinates',()=>{
 assert.equal(isValidPoint(-37.81,175.78),true);
 assert.equal(isValidPoint(0,0),true);
 for (const pair of [[91,0],[-91,0],[0,181],[0,-181],[NaN,174],[null,174],['-37',175],[Infinity,175]]) {
  assert.equal(isValidPoint(...pair),false,String(pair));
 }
 assert.throws(()=>mapLink(100,200),RangeError);
});

test('map URL has the chosen pin and no unexpected destinations',()=>{
 const url=mapLink(-37.80732,175.77006);
 assert.equal(url,'https://www.openstreetmap.org/?mlat=-37.80732&mlon=175.77006#map=15/-37.80732/175.77006');
 const parsed=new URL(url);
 assert.equal(parsed.protocol,'https:');
 assert.equal(parsed.hostname,'www.openstreetmap.org');
});

test('sharing requires email client action, always to official support address',()=>{
 assert.equal(SUPPORT_EMAIL,'findthecashnz@gmail.com');
 const mail=locationEmail(-37.80732,175.77006);
 const url=new URL(mail);
 assert.equal(url.protocol,'mailto:');
 assert.equal(url.pathname,SUPPORT_EMAIL);
 assert.equal(url.searchParams.get('subject'),'Find The Cash NZ - My selected location');
 assert.match(url.searchParams.get('body'),/Latitude: -37.80732/);
 assert.match(url.searchParams.get('body'),/Longitude: 175.77006/);
 assert.match(url.searchParams.get('body'),/www.openstreetmap.org/);
 assert.match(url.searchParams.get('body'),/do not post my exact location publicly/i);
 assert.throws(()=>locationEmail(99,200),RangeError);
});

test('new map page works on website and in Android without location permission',async()=>{
 const [html,js,css,home,sw,android,manifest,privacy] = await Promise.all([
  read('site/location.html'),read('site/location.js'),read('site/location.css'),read('site/index.html'),
  read('site/sw.js'),read('android/app/src/main/java/nz/findthecash/app/MainActivity.java'),
  read('android/app/src/main/AndroidManifest.xml'),read('site/privacy.html')
 ]);
 for(const token of ['location-map','email-location','copy-location','clear-location','centre-location','findthecashnz@gmail.com','OpenStreetMap'])assert.ok(html.includes(token),token);
 assert.match(html,/leaflet@1\.9\.4/);
 assert.match(html,/sha256-20nQCchB9co0qIjJZRGuk2\/Z9VM\+kNiyxNV1lvTlZBo=/);
 assert.match(js,/map\.on\('click'/);
 assert.match(js,/draggable: true/);
 assert.doesNotMatch(js,/navigator\.geolocation|watchPosition|getCurrentPosition|fetch\(|localStorage/);
 assert.match(css,/#location-map/);
 assert.match(home,/\.\/location\.html/);
 assert.match(sw,/location\.html/);
 assert.match(android,/mapWebView\.loadUrl\(SITE \+ "location\.html"\)/);
 assert.match(android,/setGeolocationEnabled\(false\)/);
 assert.match(android,/getString\(R\.string\.support_email\)/);
 assert.doesNotMatch(manifest,/android\.permission\.ACCESS_FINE_LOCATION|android\.permission\.ACCESS_COARSE_LOCATION/);
 assert.match(privacy,/Optional map and sharing/);
 assert.match(privacy,/findthecashnz@gmail\.com/);
});
