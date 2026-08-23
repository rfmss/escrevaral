const CACHE_PREFIX = 'escrevaral-paper-home-offline-'
const BUILD_ID = '6cd6fa8b230b'
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_ID}`
const PRECACHE_ASSETS = ["./anatomia-do-livro.html","./assets/Anton-Regular.ttf","./assets/AuthorshipProofPanel.js","./assets/FiguresPanel.js","./assets/LexicalPanel.js","./assets/Literata-opsz-wght.ttf","./assets/Oswald-wght.ttf","./assets/PrecisionPanel.js","./assets/advancedDocumentExport.js","./assets/analise-engine.js","./assets/anatomia/anatomia-asset-1.webp","./assets/anatomia/anatomia-asset-2.webp","./assets/blueprint/anatomia-livro-render.webp","./assets/blueprint/anatomia-livro.webp","./assets/criterios-data.js","./assets/export-engine.js","./assets/index.css","./assets/index.js","./assets/punctuation-engine.js","./assets/syntax-engine.js","./brand/escrevaral-favicon.svg","./brand/escrevaral-logo.svg","./brand/escrevaral-symbol.svg","./index.html","./manifest.webmanifest","./norma-data.json","./syntax-data.json"]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(['./', ...PRECACHE_ASSETS])))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names
        .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || request.headers.has('range')) return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            void caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy))
          }
          return response
        })
        .catch(async () => (await caches.match('./index.html')) || Response.error()),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && response.type === 'basic') {
        const copy = response.clone()
        void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
      }
      return response
    })),
  )
})
