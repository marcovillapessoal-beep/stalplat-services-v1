const CACHE='stalplat-export-v1';
const SHELL=['./','./index.html','./styles.css','./script.js','./manifest.webmanifest','./posts.json','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-180.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('stalplat-app-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin||req.headers.has('range')||url.pathname.endsWith('.mp4'))return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(async response=>{if(response.ok){const c=await caches.open(CACHE);await c.put('./index.html',response.clone());}return response;}).catch(async()=>await caches.match('./index.html')||Response.error()));return;
 }
 if(/\/(?:assets\/.*\.webp|icons\/.*\.png)$/.test(url.pathname)){
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(async response=>{if(response.ok){const c=await caches.open(CACHE);await c.put(req,response.clone());const keys=await c.keys();const images=keys.filter(k=>new URL(k.url).pathname.includes('/assets/'));if(images.length>110)await Promise.all(images.slice(0,images.length-110).map(k=>c.delete(k)));}return response;})));return;
 }
 if(SHELL.some(p=>new URL(p,self.registration.scope).pathname===url.pathname))event.respondWith(fetch(req).then(async response=>{if(response.ok){const c=await caches.open(CACHE);await c.put(req,response.clone());}return response;}).catch(()=>caches.match(req)));
});
