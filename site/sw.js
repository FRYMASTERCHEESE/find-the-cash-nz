/* Offline app shell. Live Facebook links and fresh data always require network. */
const CACHE='findcashnz-github-v6';
const ASSETS=['./','./index.html','./styles.css','./app.js','./assets/logo.svg','./assets/icon-192.png','./assets/icon-512.png','./manifest.webmanifest','./hunt-map.html','./hunt-map.js','./hunt-map.css','./safety.html','./privacy.html','./terms.html'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const url=new URL(e.request.url);if(url.origin!==location.origin||!url.pathname.startsWith(new URL('./',self.registration.scope).pathname))return;
 if(url.pathname.endsWith('/updates.json')||url.pathname.endsWith('/hunt-location.json')){e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));return}
 // Prefer fresh HTML so retired social links don't remain pinned in the offline cache.
 if(e.request.mode==='navigate'){
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
  return;
 }
 e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)));
});