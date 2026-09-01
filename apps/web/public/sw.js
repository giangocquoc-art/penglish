// Service Worker with smart cache invalidation
// Version will be updated by build process

const APP_VERSION = '20260518030452';
const CACHE_NAME = `pshare-cache-${APP_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pshare-logo.png',
];

const NO_CACHE_PATTERNS = [
  /\/api\//,
];

const NETWORK_FIRST_PATTERNS = [
  /\/index\.html/,
];

const CACHE_FIRST_PATTERNS = [
  /\/assets\/.*\.[a-zA-Z0-9_-]+\.(js|css)$/,
  /\/assets\/.*\.[a-zA-Z0-9_-]+\.(png|jpg|jpeg|gif|svg|webp|ico)$/,
  /\.(woff|woff2|ttf|eot)$/,
  /\/gif\/.*\.(gif|png|jpg|jpeg|webp)$/,
  /\/images\/.*\.(png|jpg|jpeg|gif|webp|svg)$/,
  /\/background\/.*\.(png|jpg|jpeg|gif|webp|svg)$/,
  /\/pshare-logo\.png$/,
];

function matchesPattern(url, patterns) {
  return patterns.some((pattern) => pattern.test(url));
}

self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version: ${APP_VERSION}`);
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(PRECACHE_URLS);
    }),
  );
});

self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version: ${APP_VERSION}`);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('pshare-cache-')) {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
          return Promise.resolve(false);
        }),
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll())
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: APP_VERSION,
          });
        });
      }),
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const pathname = new URL(url).pathname;

  if (event.request.method !== 'GET') {
    return;
  }

  if (!url.startsWith(self.location.origin)) {
    return;
  }

  if (matchesPattern(pathname, NO_CACHE_PATTERNS)) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request)),
    );
    return;
  }

  if (matchesPattern(pathname, CACHE_FIRST_PATTERNS)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        });
      }),
    );
    return;
  }

  if (matchesPattern(pathname, NETWORK_FIRST_PATTERNS)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(networkFirst(event.request));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);

    if (response.status === 200) {
      const responseToCache = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseToCache);
      });
    }

    return response;
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }

    return new Response(JSON.stringify({
      error: 'Network Error',
      message: 'You are offline and this resource is not cached.',
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches');
    event.waitUntil(
      caches.keys().then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName)),
      )),
    );
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: APP_VERSION });
  }
});

async function notifyOpenClientToPlaySound() {
  const windowClients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  });

  const targetClient = windowClients.find((client) => client.visibilityState === 'visible') || windowClients[0];
  if (!targetClient) return;

  targetClient.postMessage({ type: 'PLAY_NOTIFICATION_SOUND' });
}

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const notifyPromise = (async () => {
    try {
      const data = event.data.json();
      const title = data.title || 'Nhac nho hoc tap';
      const options = {
        body: data.body || 'Dung quen hoc tu vung hom nay!',
        icon: data.icon || '/pshare-logo.png',
        badge: data.badge || '/pshare-logo.png',
        tag: data.tag || 'study-reminder',
        renotify: true,
        vibrate: [200, 100, 200],
        data: data.data || { url: '/' },
        actions: [
          { action: 'open', title: 'Hoc ngay' },
          { action: 'dismiss', title: 'De sau' },
        ],
      };

      await Promise.all([
        self.registration.showNotification(title, options),
        notifyOpenClientToPlaySound(),
      ]);
    } catch {
      const text = event.data.text();

      await Promise.all([
        self.registration.showNotification('Nhac nho hoc tap', {
          body: text,
          icon: '/pshare-logo.png',
          badge: '/pshare-logo.png',
          data: { url: '/' },
        }),
        notifyOpenClientToPlaySound(),
      ]);
    }
  })();

  event.waitUntil(notifyPromise);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }

      return clients.openWindow(urlToOpen);
    }),
  );
});
