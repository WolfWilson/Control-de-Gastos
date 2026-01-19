// Service Worker - Complete offline support
const CACHE_NAME = 'expense-tracker-v2.1';
const STATIC_CACHE = 'static-v2.1';
const DYNAMIC_CACHE = 'dynamic-v2.1';

const urlsToCache = [
  '/',
  '/manifest.json',
  // CSS
  '/css/variables.css',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/animations.css',
  '/css/debug-contrast.css',
  '/css/auth-tabs.css',
  '/css/user-menu.css',
  // JavaScript
  '/js/app.js',
  '/js/db.js',
  '/js/auth.js',
  '/js/utils.js',
  '/js/data-backup.js',
  '/js/confirm-dialog.js',
  // PWA Icons
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/apple-touch-icon.png',
  // External resources
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Cache-first strategy for app shell and fonts
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
  // Network-first strategy for API calls (though we don't have any now)
  else if (isApiCall(url)) {
    event.respondWith(networkFirst(request));
  }
  // Stale-while-revalidate for everything else
  else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

/**
 * Check if URL is a static asset
 */
function isStaticAsset(url) {
  return url.pathname.startsWith('/css/') ||
    url.pathname.startsWith('/js/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/' ||
    url.pathname === '/manifest.json' ||
    url.href.includes('fonts.googleapis.com') ||
    url.href.includes('fontawesome') ||
    url.href.includes('chart.js');
}

/**
 * Check if URL is an API call (not used currently, but useful for future)
 */
function isApiCall(url) {
  return url.pathname.startsWith('/api/');
}

/**
 * Cache-first strategy
 * Try cache first, fallback to network
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Fetch failed; returning offline page instead.', error);
    // Could return a custom offline page here
    return new Response('Offline - No hay conexión disponible', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Network-first strategy
 * Try network first, fallback to cache
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network request failed, trying cache...', error);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy
 * Return cache immediately, update cache in background
 */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then(async (response) => {
    if (response && response.status === 200) {
      // Clone BEFORE using the response
      const responseToCache = response.clone();
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, responseToCache);
    }
    return response;
  }).catch((error) => {
    console.log('[SW] Fetch failed in staleWhileRevalidate:', error);
    // Return cached version if fetch fails
    return cached;
  });

  return cached || fetchPromise;
}

// Background sync for future use (optional)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-expenses') {
    event.waitUntil(syncExpenses());
  }
});

async function syncExpenses() {
  // Placeholder for future background sync functionality
  console.log('[SW] Syncing expenses in background...');
}

// Push notifications for future use (optional)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-192.png',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('Control de Gastos', options)
  );
});
