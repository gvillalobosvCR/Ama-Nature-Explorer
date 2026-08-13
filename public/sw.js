// AMA Nature Explorer Service Worker
const CACHE_NAME = 'ama-static-cache-v1';
const MEDIA_CACHE_NAME = 'ama-media-cache';

const PRECACHE_ASSETS = [
  '/',
  '/explore',
  '/map',
  '/prepare',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

// Install Event - Pre-cache core shells
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching app shells');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== MEDIA_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension, internal next dev server HMR websockets, or api / admin requests
  if (
    url.protocol === 'chrome-extension:' ||
    url.pathname.includes('_next/webpack-hmr') ||
    url.pathname.startsWith('/api/') ||
    request.method !== 'GET'
  ) {
    return;
  }

  // 1. Navigation Requests (HTML documents like clicking links or direct QR URL loading)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If online, clone and save in static cache for subsequent offline loads
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseCopy);
          });
          return response;
        })
        .catch(() => {
          // OFFLINE FALLBACK: If offline, return cached /explore shell.
          // The Next.js client-side router will take over, read the route, 
          // and load data locally from localStorage.
          return caches.match('/explore').then((exploreRes) => {
            if (exploreRes) return exploreRes;
            return caches.match('/').then((rootRes) => {
              if (rootRes) return rootRes;
              return caches.match('/prepare');
            });
          });
        })
    );
    return;
  }

  // 2. Supabase Storage & Remote Images Caching
  const isSupabaseStorage = url.hostname.includes('supabase.co') && url.pathname.includes('/storage/v1/object');
  const isImageFile = request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/);

  if (isSupabaseStorage || isImageFile) {
    event.respondWith(
      caches.open(MEDIA_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Cache First with Network Fallback
          if (cachedResponse) {
            // Optional: update in background (Stale-While-Revalidate)
            fetch(request).then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put(request, networkResponse);
              }
            }).catch(() => {});
            return cachedResponse;
          }

          return fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Offline fallback for missing images: return a clean placeholder SVG
            return new Response(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
                <rect width="100" height="100" fill="#1e293b"/>
                <text x="50" y="50" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-size="10" font-family="sans-serif">Offline</text>
              </svg>`,
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          });
        });
      })
    );
    return;
  }

  // 3. Static Assets (Next JS Bundles, CSS, local fonts)
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/static/'))
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 4. Default Strategy: Cache with network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request);
    })
  );
});
