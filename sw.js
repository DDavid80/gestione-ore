/* Gestione Ore: PWA cache con priorita' alla rete e fallback offline.
   Mantiene intatto il sistema notifiche push gia' configurato. */
const CACHE='gestione-ore-app-v12';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg','./aurora.css','./mobile-app.css','./mobile-app.js','./mobile-work.js','./mobile-work.css','./cover-extras.js','./notifications.js','./rep-summary.js'];
const PARTS=Array.from({length:21},(_,i)=>'./parts/dashboard-'+String(i).padStart(2,'0')+'.part');
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(async cache=>{
    await Promise.allSettled([...CORE,...PARTS].map(url=>cache.add(new Request(url,{cache:'reload'}))));
    await self.skipWaiting();
  }));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('gestione-ore-app-')&&key!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const response=await fetch(event.request);
      if(response.ok)cache.put(event.request,response.clone()).catch(()=>{});
      return response;
    }catch(err){
      const cached=await cache.match(event.request,{ignoreSearch:true});
      if(cached)return cached;
      if(event.request.mode==='navigate'){
        const fallback=await cache.match('./index.html');if(fallback)return fallback;
      }
      throw err;
    }
  })());
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification && event.notification.data && event.notification.data.url) || './';
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of all) {
      if ('focus' in client) {
        client.focus();
        if ('navigate' in client) try { client.navigate(target); } catch (e) {}
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});

self.addEventListener('push', (event) => {
  let payload = { title: 'Gestione Ore', body: 'Hai un aggiornamento', url: './' };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch (e) {
    try { payload.body = event.data.text(); } catch (e2) {}
  }
  event.waitUntil(self.registration.showNotification(payload.title || 'Gestione Ore', {
    body: payload.body || '',
    icon: './icon.svg',
    badge: './icon.svg',
    data: { url: payload.url || './' },
    vibrate: [120, 60, 120]
  }));
});
