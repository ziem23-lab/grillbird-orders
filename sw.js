// Network-first service worker.
// Always fetches fresh content; falls back to cache only when offline.
// On install/activate, takes control immediately so updates apply on next open.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e =>
  e.waitUntil(clients.claim())
);

self.addEventListener('fetch', e => {
  // Only handle same-origin GET requests for HTML/CSS/JS/fonts.
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache a clone for offline fallback.
        const clone = res.clone();
        caches.open('grillbird-v1').then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
