const CACHE = 'trocafig-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// Network-first com fallback para cache
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Exibe notificação push recebida do servidor
self.addEventListener('push', (e) => {
  const data = e.data?.json() ?? {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Troca Figurinha', {
      body: data.body || 'Você tem uma nova notificação.',
      icon: '/icon-192.svg',
      badge: '/favicon.ico',
      tag: data.tag || 'default',
      data: { url: data.url || '/' },
      vibrate: [100, 50, 100],
    })
  );
});

// Abre o app na aba de trocas ao clicar na notificação
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'OPEN_TRADES' });
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
