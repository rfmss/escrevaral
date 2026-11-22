/* Gerado: editar src/app/service-worker.template.js. */
const CACHE_NAME = "{{CACHE_NAME}}";
const RUNTIME_CACHE = "scrvrl-runtime-{{GENERATION}}";
const ASSET_VERSION = "{{ASSET_VERSION}}";
const REQUIRED_ASSETS = {{ASSETS}};
const BUNKER_ASSETS = {{BUNKER_ASSETS}};
const scopeURL = new URL('./', self.registration.scope);
const appPaths = [scopeURL.pathname, new URL('index.html', scopeURL).pathname];
const RUNTIME_PREFIXES = [
  new URL('resources/pt-BR/lexico-ptbr/', scopeURL).pathname,
  new URL('academia/', scopeURL).pathname,
  new URL('assets/typewriter/', scopeURL).pathname,
  new URL('assets/study/', scopeURL).pathname,
  new URL('assets/library/', scopeURL).pathname
];
const ACADEMIA_PREFIX = new URL('academia/', scopeURL).pathname;
function isRuntimeCacheable(pathname) {
  for (let i = 0; i < RUNTIME_PREFIXES.length; i += 1) {
    if (pathname.indexOf(RUNTIME_PREFIXES[i]) === 0) return true;
  }
  return false;
}
async function checkedAsset(asset) {
  const response = await fetch(new Request(asset.url, { cache: 'reload' }));
  if (!response.ok) throw new Error('Recurso indisponível: ' + asset.url);
  const digest = await crypto.subtle.digest('SHA-256', await response.clone().arrayBuffer());
  const actual = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('');
  if (actual !== asset.sha256) throw new Error('Recurso de outra versão: ' + asset.url);
  return response;
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const index = await checkedAsset({ url: './index.html', sha256: '{{INDEX_SHA256}}' });
    if (!index.ok || (await index.clone().text()).indexOf('content="' + ASSET_VERSION + '"') < 0) throw new Error('Documento de outra versão');
    await Promise.all(REQUIRED_ASSETS.map(async asset => cache.put(asset.url, await checkedAsset(asset))));
    await cache.put('./index.html', index.clone()); await cache.put('./', index);
    // Ícone, logo ENEM e arquivo portátil não impedem o editor de funcionar offline.
    await Promise.all(['./escrevaral.html', './manifest.webmanifest', './icons/icon.svg', './assets/study/enem-logo.png'].map(p => cache.add(p).catch(() => null)));
    // Pré-cache opcional dos guias da Academia, ilustrações do Real Gabinete e sprites WebP da máquina para modo bunker.
    try {
      const runtime = await caches.open(RUNTIME_CACHE);
      await Promise.all(BUNKER_ASSETS.map(p => runtime.add(new Request(p, { cache: 'reload' })).catch(() => null)));
    } catch (ignore) {}
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if ((name.startsWith('scrvrl-offline-') && name !== CACHE_NAME) ||
          (name.startsWith('scrvrl-runtime-') && name !== RUNTIME_CACHE)) {
        await caches.delete(name);
      }
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url); if (url.origin !== scopeURL.origin) return;
  const isApp = event.request.mode === 'navigate' && appPaths.includes(url.pathname);
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (isApp) { const page = await cache.match('./index.html'); if (page) return page; }
    const cached = await cache.match(event.request); if (cached) return cached;
    if (isRuntimeCacheable(url.pathname)) {
      const runtime = await caches.open(RUNTIME_CACHE);
      const rtCached = await runtime.match(event.request);
      if (url.pathname.indexOf(ACADEMIA_PREFIX) === 0) {
        try {
          const fresh = await fetch(event.request);
          if (fresh && fresh.ok) {
            try { await runtime.put(event.request, fresh.clone()); } catch (ignore) {}
            return fresh;
          }
          if (rtCached) return rtCached;
          return fresh;
        } catch (error) {
          if (rtCached) return rtCached;
          return new Response('Guia indisponível offline. Abra o Escrevaral conectado uma vez para atualizar o acervo.', { status: 503 });
        }
      }
      if (rtCached) return rtCached;
      try {
        const fresh = await fetch(event.request);
        if (fresh && fresh.ok) { try { await runtime.put(event.request, fresh.clone()); } catch (ignore) {} }
        return fresh;
      } catch (error) {
        return new Response('Recurso indisponível offline.', { status: 503 });
      }
    }
    try { return await fetch(event.request); } catch (error) { return new Response('Recurso indisponível offline.', { status: 503 }); }
  })());
});
