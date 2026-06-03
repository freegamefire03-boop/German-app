const CACHE = 'hub-v3';

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/apps.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/shared/js/config.js',
  '/shared/js/timer.js',
  '/shared/data/words.json',
  '/apps/flashcards/index.html',
  '/apps/flashcards/css/style.css',
  '/apps/flashcards/js/app.js',
  '/apps/verbs/index.html',
  '/apps/verbs/css/style.css',
  '/apps/verbs/js/app.js',
  '/apps/cases/index.html',
  '/apps/cases/quiz.html',
  '/apps/cases/css/style.css',
  '/apps/cases/js/landing.js',
  '/apps/cases/js/script.js',
  '/apps/cases/data/themes.json',
  '/apps/QCM/index.html',
  '/apps/QCM/css/style.css',
  '/apps/QCM/js/app.js',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&display=swap'
];

const OFFLINE_PAGE = '/index.html';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(response => {
        if (response && response.ok && e.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match(OFFLINE_PAGE);
        }
        return new Response('Offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});
