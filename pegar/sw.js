const CACHE = 'escrevaral-pegar-v2';
const ASSETS = [
  '/pegar/',
  '/pegar/index.html',
  '/pegar/manifest.json',
  '/pegar/jsqr.min.js',
  '/pegar/lz-string.min.js',
  '/pegar/qrcode.min.js',
  '/icons/escrevaral-192.png',
  '/icons/escrevaral-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
