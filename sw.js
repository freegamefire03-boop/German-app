// ─── CACHE CONFIG ─────────────────────────────────────────────────────────────
// Bump this version string whenever you push new content to force a cache refresh
const CACHE_VERSION = 'v5';
const CACHE_NAME    = `deutsch-lernen-${CACHE_VERSION}`;

// Every file the app needs to work offline.
// Add or remove paths here whenever you add a new sub-app or asset.
const PRECACHE_URLS = [
  // ── Root ──
  './',
  './index.html',
  './apps.json',
  './manifest.json',

  // ── Shared ──
  './shared/js/config.js',
  './shared/data/words.json',

  // ── Icons ──
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',

  // ── Flashcards ──
  './apps/flashcards/',
  './apps/flashcards/index.html',
  './apps/flashcards/js/app.js',
  './apps/flashcards/css/style.css',

  // ── Verbs ──
  './apps/verbs/',
  './apps/verbs/index.html',
  './apps/verbs/js/app.js',
  './apps/verbs/css/style.css',

  // ── Cases ──
  './apps/cases/',
  './apps/cases/index.html',
  './apps/cases/quiz.html',
  './apps/cases/js/landing.js',
  './apps/cases/js/script.js',
  './apps/cases/css/style.css',
  './apps/cases/data/themes.json',

  // ── QCM ──
  './apps/QCM/',
  './apps/QCM/index.html',
  './apps/QCM/js/app.js',
  './apps/QCM/css/style.css',
];

// ─── INSTALL: pre-cache everything ────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // cache.addAll fails entirely if even one URL 404s.
      // We add them individually so one missing file doesn't break everything.
      return Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => {
            console.warn(`[SW] Could not pre-cache: ${url}`, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE: delete old caches ──────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('deutsch-lernen-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH: cache-first, fall back to network, then cached fallback ────────────
self.addEventListener('fetch', event => {
  const { request } = event;

  // Only handle GET requests within our origin
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  // Skip chrome-extension and non-http(s) URLs
  if (!request.url.startsWith('http')) return;

  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const cache = await caches.open(CACHE_NAME);

  // 1. Try cache first
  const cached = await cache.match(request);
  if (cached) {
    // Revalidate in the background (stale-while-revalidate)
    revalidateInBackground(cache, request);
    return cached;
  }

  // 2. Not in cache → try network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Store a clone so we can both return it and cache it
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (_) {
    // 3. Network failed → try a navigation fallback
    if (request.mode === 'navigate') {
      // For any sub-app navigation, return its cached index.html
      // e.g.  /German-app/apps/cases/ → try apps/cases/index.html
      const url = new URL(request.url);
      const indexUrl = new URL(url.pathname.replace(/\/$/, '') + '/index.html', self.location.origin);
      const subIndexCached = await cache.match(indexUrl);
      if (subIndexCached) return subIndexCached;

      // Final fallback: serve the root index.html so the hub still loads
      const rootFallback = await cache.match('./index.html')
                        || await cache.match(new URL('./index.html', self.location.origin));
      if (rootFallback) return rootFallback;
    }

    // Nothing we can do — return a minimal offline error response
    return new Response(
      '<html><body style="font-family:sans-serif;background:#0D0C14;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center"><p>📵<br><br>You are offline and this page is not yet cached.<br>Open the app online once to cache all pages.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Silently update the cache in the background without affecting the response
function revalidateInBackground(cache, request) {
  fetch(request).then(response => {
    if (response.ok) cache.put(request, response);
  }).catch(() => {});
}

// ─── MESSAGE: handle SKIP_WAITING from the update bar ─────────────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
