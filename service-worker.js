/* Gerado: editar src/app/service-worker.template.js. */
const CACHE_NAME = "scrvrl-offline-v6-65-d62038f014be";
const RUNTIME_CACHE = "scrvrl-runtime-d62038f014be";
const ASSET_VERSION = "20261014-scrvrl-exame-v6-65";
const REQUIRED_ASSETS = [
  {
    "url": "./assets/20261014-scrvrl-exame-v6-65/cofre.d6cd9da15371a34f.js",
    "sha256": "d6cd9da15371a34f5b69d5a91a907cf30116c3b496ca45907eed8c1422548e64"
  },
  {
    "url": "./assets/20261014-scrvrl-exame-v6-65/app.775af06b12760a8e.js",
    "sha256": "775af06b12760a8ebcc7728804a83dae45dd32ba35adf16f7264b5817d429584"
  },
  {
    "url": "./assets/20261014-scrvrl-exame-v6-65/styles.f1c7f0ee1da05a56.css",
    "sha256": "f1c7f0ee1da05a5638802c2b365966bc8477bbf53451fe7042a5f87dc9625203"
  }
];
const BUNKER_ASSETS = [
  "./academia/anatomia-do-livro.html",
  "./academia/autopublicacao-independente.html",
  "./academia/biblioteca-escrita.html",
  "./academia/bloqueio-criativo.html",
  "./academia/checklist-lancamento.html",
  "./academia/comparativo-publicacao.html",
  "./academia/embedded.css",
  "./academia/favicon.svg",
  "./academia/literatura-mundial.html",
  "./academia/mapa-lancamento-editorial.html",
  "./academia/mentalidade-autor-publicado.html",
  "./academia/primeiras-linhas.html",
  "./academia/publicar-kdp.html",
  "./academia/revisao-manuscrito.html",
  "./academia/submissao-editoras.html",
  "./academia/titulo-do-livro.html",
  "./assets/library/banner-criacao.webp",
  "./assets/library/banner-oficio.webp",
  "./assets/library/banner-publicacao.webp",
  "./assets/library/real-gabinete-hero.webp",
  "./assets/library/tome-literatura-mundial.webp",
  "./assets/library/tome-objeto-livro.webp"
];
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
    const index = await checkedAsset({ url: './index.html', sha256: '513e3982627d07202510c5924fb039d4f12898b447af119eb17916e7a5070958' });
    if (!index.ok || (await index.clone().text()).indexOf('content="' + ASSET_VERSION + '"') < 0) throw new Error('Documento de outra versão');
    await Promise.all(REQUIRED_ASSETS.map(async asset => cache.put(asset.url, await checkedAsset(asset))));
    await cache.put('./index.html', index.clone()); await cache.put('./', index);
    // Ícone, logo ENEM e arquivo portátil não impedem o editor de funcionar offline.
    await Promise.allSettled(['./escrevaral.html', './manifest.webmanifest', './icons/icon.svg', './assets/study/enem-logo.png'].map(p => cache.add(p)));
    // Pré-cache opcional dos guias da Academia e ilustrações do Real Gabinete para modo bunker.
    try {
      const runtime = await caches.open(RUNTIME_CACHE);
      await Promise.allSettled(BUNKER_ASSETS.map(p => runtime.add(new Request(p, { cache: 'reload' }))));
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
          if (fresh && fresh.ok) { try { await runtime.put(event.request, fresh.clone()); } catch (ignore) {} }
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
