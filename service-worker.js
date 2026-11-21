/* Gerado: editar src/app/service-worker.template.js. */
const CACHE_NAME = "scrvrl-offline-v6-65-bbecbefa04e5";
const RUNTIME_CACHE = "scrvrl-runtime-v1";
const ASSET_VERSION = "20261014-scrvrl-exame-v6-65";
const REQUIRED_ASSETS = [
  {
    "url": "./assets/20261014-scrvrl-exame-v6-65/cofre.169f365706dced48.js",
    "sha256": "169f365706dced4886d96d5115282b8200bae09932d5a931229f424ce4e01044"
  },
  {
    "url": "./assets/20261014-scrvrl-exame-v6-65/app.651233f527a52489.js",
    "sha256": "651233f527a524890c3e903b6f846185d9ecb7e8d3d32c5c94a298b4cd97f9d1"
  },
  {
    "url": "./assets/20261014-scrvrl-exame-v6-65/styles.5719719ebe9c7240.css",
    "sha256": "5719719ebe9c7240b706c66f579f023f9d4fd35e9bcea6354689e786f1b95ccd"
  }
];
const scopeURL = new URL('./', self.registration.scope);
const appPaths = [scopeURL.pathname, new URL('index.html', scopeURL).pathname];
const RUNTIME_PREFIXES = [
  new URL('resources/pt-BR/lexico-ptbr/', scopeURL).pathname,
  new URL('academia/', scopeURL).pathname,
  new URL('assets/typewriter/', scopeURL).pathname,
  new URL('assets/study/', scopeURL).pathname
];
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
    const index = await checkedAsset({ url: './index.html', sha256: 'c82e673e5589e5e5606e16f7d4e99a1f16577a34be1861bc7c3d7edc75c4e19b' });
    if (!index.ok || (await index.clone().text()).indexOf('content="' + ASSET_VERSION + '"') < 0) throw new Error('Documento de outra versão');
    await Promise.all(REQUIRED_ASSETS.map(async asset => cache.put(asset.url, await checkedAsset(asset))));
    await cache.put('./index.html', index.clone()); await cache.put('./', index);
    // Ícone, logo ENEM e arquivo portátil não impedem o editor de funcionar offline.
    await Promise.allSettled(['./escrevaral.html', './manifest.webmanifest', './icons/icon.svg', './assets/study/enem-logo.png'].map(p => cache.add(p)));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith('scrvrl-offline-') && name !== CACHE_NAME) await caches.delete(name);
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
