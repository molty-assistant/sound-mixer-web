const CACHE_NAME = 'sound-mixer-v2';
const ASSETS = [
  '/sound-mixer-web/',
  '/sound-mixer-web/index.html',
  '/sound-mixer-web/sounds/rain.mp3',
  '/sound-mixer-web/sounds/thunder.mp3',
  '/sound-mixer-web/sounds/ocean.mp3',
  '/sound-mixer-web/sounds/forest.mp3',
  '/sound-mixer-web/sounds/wind.mp3',
  '/sound-mixer-web/sounds/fireplace.mp3',
  '/sound-mixer-web/sounds/birds.mp3',
  '/sound-mixer-web/sounds/creek.mp3',
  '/sound-mixer-web/sounds/fan.mp3',
];

// Install: cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for assets, network-first for HTML
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache-first for sound files
  if (url.pathname.endsWith('.mp3')) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // Network-first for HTML (so updates propagate), fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
