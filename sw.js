const CACHE_NAME = 'scratch-king-v1';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './attached_assets/header-logo.png',
  './attached_assets/tutorial-flame.png',
  './attached_assets/tutorial-star.png',
  './attached_assets/left-arrow.png',
  './attached_assets/right-arrow.png',
  './attached_assets/confetti.gif',
  './attached_assets/paper-ball.png',
  './attached_assets/fire-flame.gif',
  './attached_assets/fire-flame2.gif',
  './attached_assets/measles-ball-spritesheet.png',
  './attached_assets/bowling-ball-spritesheet.png',
  './attached_assets/jeffree-ball.png',
  './attached_assets/snowflake-ball.png',
  './attached_assets/success.mp3',
  './attached_assets/hit.mp3',
  './attached_assets/game-over-voice.mp3',
  './attached_assets/hooray.wav',
  './attached_assets/times-up.wav',
  './attached_assets/sad-fail.wav',
  './attached_assets/new-unlock.wav',
  './attached_assets/ball-in-hand.wav',
  './attached_assets/puddle-jumper-unlock.wav',
  './attached_assets/rackingsfx2.m4a',
  './attached_assets/hazard-chase.mp3',
  './attached_assets/hazard-chase-2.mp3',
  './attached_assets/laundry-day.mp3',
  './attached_assets/chalk-it-up.mp3',
  './attached_assets/whispers-in-the-fog.mp3',
  './attached_assets/cue-ball-symphony.mp3',
  './attached_assets/background.mp3'
];

// Install event - cache all assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching all assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] All assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(networkResponse => {
          // Cache new requests dynamically
          if (event.request.method === 'GET' && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
      .catch(() => {
        console.log('[Service Worker] Fetch failed for:', event.request.url);
      })
  );
});
