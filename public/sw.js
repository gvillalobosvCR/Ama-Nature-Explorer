// AMA Nature Explorer Service Worker
// Increment this version to force reinstall on all clients
const CACHE_VERSION = 'v5';
const CACHE_NAME = `ama-static-${CACHE_VERSION}`;
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

// Install Event - Pre-cache core shells resiliently
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shells');
      const promises = PRECACHE_ASSETS.map((asset) =>
        cache.add(asset).catch((err) =>
          console.warn(`[SW] Failed to precache: ${asset}`, err)
        )
      );
      return Promise.all(promises);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches and claim all clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name !== MEDIA_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip: non-GET, chrome extensions, HMR websockets, API routes
  if (
    request.method !== 'GET' ||
    url.protocol === 'chrome-extension:' ||
    url.pathname.includes('_next/webpack-hmr') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // 1. Next.js static bundles - Cache First (they are content-hashed, safe forever)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // 2. Next.js server-rendered data chunks (_next/data/) - Network first, fallback to cache
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 3. Images (Supabase Storage or any image file) - Cache First
  const isImage =
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|avif)$/) ||
    (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/'));

  if (isImage) {
    event.respondWith(
      caches.open(MEDIA_CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request, { mode: 'cors' }).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          }).catch(() =>
            new Response(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#1e293b"/>
                <text x="50" y="50" dominant-baseline="middle" text-anchor="middle"
                  fill="#64748b" font-size="10" font-family="sans-serif">Offline</text>
              </svg>`,
              { headers: { 'Content-Type': 'image/svg+xml' } }
            )
          );
        })
      )
    );
    return;
  }

  // 4. HTML Navigation requests - Network first, offline fallback to cached shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the actual page HTML for future offline use
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          // Offline: try to serve the exact cached page first
          const exactMatch = await caches.match(request);
          if (exactMatch) return exactMatch;

          // For /explore/N routes, serve the /explore shell
          // Next.js will hydrate and the [id] component will load from localStorage
          if (url.pathname.startsWith('/explore/')) {
            const exploreShell = await caches.match('/explore');
            if (exploreShell) return exploreShell;
          }

          // For /map, /prepare fallback
          if (url.pathname.startsWith('/map')) {
            const mapShell = await caches.match('/map');
            if (mapShell) return mapShell;
          }

          // Generic fallback
          const rootShell = await caches.match('/');
          if (rootShell) return rootShell;

          return new Response('Offline - Please reload when connected', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  }

  // 5. Default: Network with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
