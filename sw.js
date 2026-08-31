/**
 * GT Study Mentor Pro — Service Worker v2.0
 * Provides:
 *  - Offline caching (network-first, cache fallback)
 *  - Push notification click handling
 *  - Background sync ready
 */

const CACHE_NAME = 'gt-mentor-v2.0';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon.svg',
];

// ── Install: cache app shell ──
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ──
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: network-first, cache fallback ──
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Don't cache Gemini API calls
  if (e.request.url.includes('generativelanguage.googleapis.com')) return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

// ── Notification click: focus/open app ──
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const action = e.action;

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url.includes('localhost') || client.url.includes('index.html')) {
          client.focus();
          if (action === 'track') client.postMessage({ type: 'OPEN_PROGRESS' });
          if (action === 'plan') client.postMessage({ type: 'OPEN_PLAN' });
          return;
        }
      }
      return clients.openWindow('./');
    })
  );
});

// ── Message: handle commands from app ──
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
