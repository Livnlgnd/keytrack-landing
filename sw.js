self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function () {
  // Intentionally empty: lets the marketing site be installable without
  // intercepting requests, so the /app/ service worker stays in control there.
});
