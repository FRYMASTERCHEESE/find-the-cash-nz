import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {cleanPosts,verifiedFacebookUrl,syncFacebook} from '../scripts/sync-facebook.mjs';

const base=new URL('../site/',import.meta.url);
const read=path=>readFile(new URL(path,base),'utf8');
test('Page homepage contains proper landmarks and researched official links',async()=>{
 const h=await read('index.html');
 for(const token of ['location.html','<html lang="en-NZ">','<main id="main">','Find The Cash NZ','https://www.facebook.com/FindTheCashNz/','https://www.instagram.com/findthecashnz/','findthecashnz@gmail.com','privacy.html','safety.html','terms.html'])
 assert.ok(h.includes(token),token);
});
test('public site links to Facebook and Instagram only, not YouTube or TikTok',async()=>{
 const html=await read('index.html');
 assert.match(html,/https:\/\/www\.facebook\.com\/FindTheCashNz\//);
 assert.match(html,/https:\/\/www\.instagram\.com\/findthecashnz\//);
 assert.doesNotMatch(html,/youtube|tiktok/i);
});
test('No fake live hunts: Page updates are disconnected until owner approved',async()=>{
 const feed=JSON.parse(await read('updates.json'));
 assert.equal(feed.connected,false);assert.deepEqual(feed.posts,[]);
});
test('Valid PWA manifest and static app shell exist',async()=>{
 const manifest=JSON.parse(await read('manifest.webmanifest'));
 assert.equal(manifest.display,'standalone');assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
 for(const ico of manifest.icons)assert.ok((await stat(new URL(ico.src,base))).size>0);
 assert.ok((await read('sw.js')).includes('CACHE'));
});
test('Page URL validation prevents javascript, HTTP and untrusted hosts',()=>{
 for(const u of ['https://www.facebook.com/FindTheCashNz/posts/abc','https://m.facebook.com/reel/12'])assert.ok(verifiedFacebookUrl(u));
 for(const u of ['javascript:alert(1)','http://www.facebook.com','https://facebook.com.bad.example/x','https://example.com'])assert.equal(verifiedFacebookUrl(u),null);
});
test('Meta output requires valid message, date and Facebook URL',()=>{
 const p=cleanPosts({data:[
 {message:'Kindness day!',permalink_url:'https://www.facebook.com/FindTheCashNz/posts/abc',created_time:'2026-10-24T02:00:00Z'},
 {message:'   ',permalink_url:'https://www.facebook.com/',created_time:'2026-10-24T02:00:00Z'},
 {message:'bad link',permalink_url:'https://evil.example',created_time:'2026-10-24T02:00:00Z'},
 {message:'bad date',permalink_url:'https://www.facebook.com/',created_time:'invalid'}
 ]});
 assert.equal(p.length,1);assert.equal(p[0].message,'Kindness day!');
});
test('Missing Meta token fails; no secret is exposed by site',async()=>{
 await assert.rejects(syncFacebook({pageId:'61583631681786',token:''}),/missing/);
 for(const page of ['index.html','app.js','updates.json'])assert.ok(!(await read(page)).includes('META_PAGE_ACCESS_TOKEN'));
});
test('Synthetic approved Meta response generates sanitized posts but never token',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'fctnz-')),outputFile=join(dir,'feed.json');
 try{
  await writeFile(outputFile,'{"connected":false,"posts":[]}');
  const fetchFn=async(url,options)=>{
   assert.ok(url.startsWith('https://graph.facebook.com/'));
   assert.equal(options.headers.Authorization,'Bearer synthetic-token');
   return {ok:true,json:async()=>({data:[{message:'Community update',permalink_url:'https://www.facebook.com/FindTheCashNz/posts/ok',created_time:'2026-10-24T02:00:00Z'}]})};
  };
  const options={pageId:'61583631681786',token:'synthetic-token',fetchFn,outputFile};
  assert.deepEqual(await syncFacebook(options),{changed:true,count:1});
  const content=await readFile(outputFile,'utf8');assert.ok(!content.includes('synthetic-token'));assert.equal(JSON.parse(content).connected,true);
  assert.deepEqual(await syncFacebook(options),{changed:false,count:1});
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('HTTP 403 preserves existing public posts unchanged',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'fctnz-')),outputFile=join(dir,'feed.json'),raw='{"connected":false,"posts":[]}';
 try{
  await writeFile(outputFile,raw);
  await assert.rejects(syncFacebook({pageId:'61583631681786',token:'synthetic',outputFile,fetchFn:async()=>({ok:false,status:403})}),/HTTP 403/);
  assert.equal(await readFile(outputFile,'utf8'),raw);
 }finally{await rm(dir,{recursive:true,force:true})}
});
test('Legal pages contain owner contact',async()=>{
 for(const p of ['privacy.html','safety.html','terms.html'])assert.ok((await read(p)).includes('findthecashnz@gmail.com'));
});
test('Android targets API 36 and asks for no sensitive permissions',async()=>{
 const gradle=await readFile(new URL('../android/app/build.gradle',import.meta.url),'utf8');
 const manifest=await readFile(new URL('../android/app/src/main/AndroidManifest.xml',import.meta.url),'utf8');
 assert.match(gradle,/compileSdk 36/);assert.match(gradle,/targetSdk 36/);
 assert.match(manifest,/android\.permission\.INTERNET/);
 assert.doesNotMatch(manifest,/(ACCESS_FINE_LOCATION|READ_CONTACTS|CAMERA|RECORD_AUDIO|ACCESS_BACKGROUND_LOCATION)/);
});
