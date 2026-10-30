/* Glice Operator App — service worker (offline caching)
 *
 * IMPORTANT: change CACHE_VERSION on every release you upload to GitHub
 * (e.g. 'v2' -> 'v3'). That makes devices download the new files and drop the old cache.
 *
 * What is cached:
 *  - the app's own files (HTML, CSS, JS, icons, logo): the app opens without a connection
 *  - Google Fonts CSS and font files: the typeface also works offline
 * What is NOT cached: Vimeo videos (they always need a connection).
 */

var CACHE_VERSION = 'v5';
var CACHE_NAME = 'glice-operator-' + CACHE_VERSION;

var APP_SHELL = [
  './',
  'index.html',
  'manifest.json',
  'css/styles.css',
  'js/app.js',
  'js/vendor/jspdf.umd.min.js',
  'assets/logo-silver.png',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

var FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      // cache: 'reload' bypasses the browser's HTTP cache so a new version is really fresh
      return Promise.all(APP_SHELL.map(function (url) {
        return fetch(new Request(url, { cache: 'reload' })).then(function (response) {
          if (!response.ok) throw new Error('Could not cache ' + url);
          return cache.put(url, response);
        });
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys
        .filter(function (key) { return key.indexOf('glice-operator-') === 0 && key !== CACHE_NAME; })
        .map(function (key) { return caches.delete(key); }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Stale-while-revalidate: answer from cache right away, refresh the cache in the background.
function staleWhileRevalidate(request, cacheKey) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(cacheKey || request).then(function (cached) {
      var network = fetch(request).then(function (response) {
        // Opaque responses (cross-origin fonts) have status 0 and are still safe to store.
        // Redirected responses are never stored (browsers refuse to serve them to navigations).
        if (response && !response.redirected && (response.ok || response.type === 'opaque')) {
          cache.put(cacheKey || request, response.clone());
        }
        return response;
      }).catch(function () {
        return cached;
      });
      return cached || network;
    });
  });
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url = new URL(request.url);

  // Fonts (cross-origin): cache so the typeface works offline.
  if (FONT_HOSTS.indexOf(url.hostname) !== -1) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Anything else cross-origin (Vimeo, etc.): let the browser handle it.
  if (url.origin !== self.location.origin) return;

  // Page navigations: serve the cached app, and keep it fresh.
  if (request.mode === 'navigate') {
    event.respondWith(
      staleWhileRevalidate(request, 'index.html').then(function (response) {
        return response || caches.match('index.html');
      })
    );
    return;
  }

  // The app's own files.
  event.respondWith(staleWhileRevalidate(request));
});
