/* Service Worker — Gestione Ore notifications */
const CACHE = 'gestione-ore-sw-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
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
