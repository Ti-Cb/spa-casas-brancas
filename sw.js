// Service Worker — Casas Brancas Spa (PWA)
const CACHE = 'spa-cb-v3';
const ASSETS = ['menu.html','painel.html','terapeuta.html','index.html',
  'spa-logo-white.png','icon-spa-192.png','icon-spa-512.png','icon-spa-maskable.png'];

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = e.request.url;
  // Backend (Apps Script) sempre pela rede, nunca em cache.
  if (e.request.method !== 'GET' || u.indexOf('script.google.com') > -1) return;
  e.respondWith(
    fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; })
                    .catch(() => caches.match(e.request))
  );
});
// Clicar na notificação abre/foca o app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || 'terapeuta.html';
  e.waitUntil(clients.matchAll({ type:'window', includeUncontrolled:true }).then(cl => {
    for (const c of cl) { if ('focus' in c) { c.focus(); return; } }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
