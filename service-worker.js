/* Gerado: editar src/app/service-worker.template.js. */
const CACHE_NAME = "scrvrl-offline-v6-65-6e81337dace8";
const RUNTIME_CACHE = "scrvrl-runtime-6e81337dace8";
const ASSET_VERSION = "20261014-scrvrl-exame-v6-65";
const REQUIRED_ASSETS = [
  {
    "url": "./assets/20261014-scrvrl-exame-v6-65/cofre.d6cd9da15371a34f.js",
    "sha256": "d6cd9da15371a34f5b69d5a91a907cf30116c3b496ca45907eed8c1422548e64"
  },
  {
    "url": "./assets/20261014-scrvrl-exame-v6-65/app.01164a180d4a3e9c.js",
    "sha256": "01164a180d4a3e9cd21c484e75d5dc7746bd8e089b7ea2338b81b5fcc05fc909"
  },
  {
    "url": "./assets/20261014-scrvrl-exame-v6-65/styles.b9cf0ebddfc70da4.css",
    "sha256": "b9cf0ebddfc70da4f91191425bf9b89d02cffa7522587dc2c44e675e0b256e33"
  }
];
const BUNKER_ASSETS = [
  "./academia/anatomia-do-livro.html",
  "./academia/autopublicacao-independente.html",
  "./academia/biblioteca-escrita.html",
  "./academia/bloqueio-criativo.html",
  "./academia/cena-tempo-e-personagem.html",
  "./academia/checklist-lancamento.html",
  "./academia/comparativo-publicacao.html",
  "./academia/embedded.css",
  "./academia/favicon.svg",
  "./academia/literatura-mundial.html",
  "./academia/mapa-lancamento-editorial.html",
  "./academia/mentalidade-autor-publicado.html",
  "./academia/poesia-ritmo-e-cancao.html",
  "./academia/ponto-de-vista-e-voz.html",
  "./academia/primeiras-linhas.html",
  "./academia/publicar-kdp.html",
  "./academia/revisao-manuscrito.html",
  "./academia/submissao-editoras.html",
  "./academia/titulo-do-livro.html",
  "./assets/library/banner-abl.webp",
  "./assets/library/banner-bloqueio.webp",
  "./assets/library/banner-cabaceiras.webp",
  "./assets/library/banner-casa-rosas.webp",
  "./assets/library/banner-cena-tempo.webp",
  "./assets/library/banner-criacao.webp",
  "./assets/library/banner-graciliano.webp",
  "./assets/library/banner-jose-alencar.webp",
  "./assets/library/banner-lancamento.webp",
  "./assets/library/banner-oficio.webp",
  "./assets/library/banner-poesia-cancao.webp",
  "./assets/library/banner-ponto-de-vista.webp",
  "./assets/library/banner-publicacao.webp",
  "./assets/library/banner-rui-barbosa.webp",
  "./assets/library/banner-titulo.webp",
  "./assets/library/estante-cafe-bistro.webp",
  "./assets/library/estante-livros-outono.webp",
  "./assets/library/estante-trepadeira-outono.webp",
  "./assets/library/reader-biblioteca-nacional.webp",
  "./assets/library/reader-cinemateca-acervo.webp",
  "./assets/library/real-gabinete-hero.webp",
  "./assets/library/tome-literatura-mundial.webp",
  "./assets/library/tome-objeto-livro.webp",
  "./assets/typewriter/typewriter-machine-idle.webp",
  "./assets/typewriter/typewriter-machine-strike-1.webp",
  "./assets/typewriter/typewriter-machine-strike-2.webp",
  "./assets/typewriter/typewriter-machine-strike-3.webp",
  "./assets/typewriter/typewriter-machine-strike-4.webp",
  "./assets/typewriter/typewriter-machine-strike-5.webp",
  "./assets/typewriter/typewriter-machine-strike-6.webp",
  "./assets/typewriter/typewriter-machine-strike-7.webp",
  "./assets/typewriter/typewriter-machine-strike-8.webp",
  "./assets/typewriter/typewriter-machine-strike-9.webp"
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
    const index = await checkedAsset({ url: './index.html', sha256: 'bd12a8b09bab62c196842fb3489d0cf860d4b0876329e458629f5322b749c428' });
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
