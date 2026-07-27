const CACHE_NAME = "vereda-offline-v965";
const ASSET_VERSION = "20260726-archive-actionbutton-low-risk-v1";

const CORE_ASSETS = [
  "./",
  "./index.html",
  `./css/00-tokens.css?v=${ASSET_VERSION}`,
  `./css/01-base.css?v=${ASSET_VERSION}`,
  `./css/02-shell-navigation.css?v=${ASSET_VERSION}`,
  `./styles.css?v=${ASSET_VERSION}`,
  "./css/13-editor-quiet.css?v=20260726-archive-actionbutton-low-risk-v1",
  `./css/20-product-clarity-desktop.css?v=${ASSET_VERSION}`,
  `./css/20-product-clarity-desktop-controls.css?v=${ASSET_VERSION}`,
  `./css/21-product-clarity-archive.css?v=${ASSET_VERSION}`,
  `./css/21-product-clarity-archive-refine.css?v=${ASSET_VERSION}`,
  `./css/22-product-clarity-workshop-authorship.css?v=${ASSET_VERSION}`,
  `./css/22-product-clarity-workshop-refine.css?v=${ASSET_VERSION}`,
  "./css/14-archive-inspector.css?v=20260726-archive-actionbutton-low-risk-v1",
  `./css/16-entry-argila.css?v=${ASSET_VERSION}`,
  `./css/17-editor-status-argila.css?v=${ASSET_VERSION}`,
  `./css/18-editor-status-layout.css?v=${ASSET_VERSION}`,
  `./css/19-oficina-navigation.css?v=${ASSET_VERSION}`,
  `./css/15-brand-argila.css?v=${ASSET_VERSION}`,
  `./css/wood-icons.css?v=${ASSET_VERSION}`,
  `./css/03-editor-layout.css?v=${ASSET_VERSION}`,
  `./css/04-cronograma.css?v=${ASSET_VERSION}`,
  `./css/03-editor-modes.css?v=${ASSET_VERSION}`,
  `./css/03-writing-area.css?v=${ASSET_VERSION}`,
  `./css/03-guide-reference.css?v=${ASSET_VERSION}`,
  `./css/03-inspector-precision.css?v=${ASSET_VERSION}`,
  `./css/03-editor-toolbar.css?v=${ASSET_VERSION}`,
  `./css/05-archive.css?v=${ASSET_VERSION}`,
  `./css/07-enem.css?v=${ASSET_VERSION}`,
  `./css/09-print.css?v=${ASSET_VERSION}`,
  `./css/04-analysis-academy.css?v=${ASSET_VERSION}`,
  `./css/06-academy-tools.css?v=${ASSET_VERSION}`,
  `./css/08-responsive.css?v=${ASSET_VERSION}`,
  `./css/10-mobile-nav.css?v=${ASSET_VERSION}`,
  `./css/11-badges.css?v=${ASSET_VERSION}`,
  `./css/12-training-modes.css?v=${ASSET_VERSION}`,
  `./app.js?v=${ASSET_VERSION}`,
  `./lexical-view-controller.js?v=${ASSET_VERSION}`,
  `./document-engine.js?v=${ASSET_VERSION}`,
  `./pagination-engine.js?v=${ASSET_VERSION}`,
  `./lexical-engine.js?v=${ASSET_VERSION}`,
  `./proof-engine.js?v=${ASSET_VERSION}`,
  `./vrda-engine.js?v=${ASSET_VERSION}`,
  `./backup-engine.js?v=${ASSET_VERSION}`,
  `./filesystem-backup-engine.js?v=${ASSET_VERSION}`,
  `./archive-engine.js?v=${ASSET_VERSION}`,
  `./badges-engine.js?v=${ASSET_VERSION}`,
  `./version-engine.js?v=${ASSET_VERSION}`,
  `./export-engine.js?v=${ASSET_VERSION}`,
  `./template-engine.js?v=${ASSET_VERSION}`,
  `./precision-engine.js?v=${ASSET_VERSION}`,
  `./voice-engine.js?v=${ASSET_VERSION}`,
  `./rimalab-engine.js?v=${ASSET_VERSION}`,
  `./decolonial-engine.js?v=${ASSET_VERSION}`,
  `./rights-engine.js?v=${ASSET_VERSION}`,
  `./typewriter-engine.js?v=${ASSET_VERSION}`,
  `./js/data/criterios-data.js?v=${ASSET_VERSION}`,
  `./syntax-engine.js?v=${ASSET_VERSION}`,
  `./punctuation-engine.js?v=${ASSET_VERSION}`,
  `./analise-engine.js?v=${ASSET_VERSION}`,
  `./js/data/synonym-data.js?v=${ASSET_VERSION}`,
  `./state-integrity.js?v=${ASSET_VERSION}`,
  `./screenplay-codec.js?v=${ASSET_VERSION}`,
  `./state-store.js?v=${ASSET_VERSION}`,
  `./cronograma-controller.js?v=${ASSET_VERSION}`,
  `./editor-modes.js?v=${ASSET_VERSION}`,
  `./editor-controller.js?v=${ASSET_VERSION}`,
  `./proof-controller.js?v=${ASSET_VERSION}`,
  `./ui-dialog.js?v=${ASSET_VERSION}`,
  `./academia-controller.js?v=${ASSET_VERSION}`,
  `./backup-controller.js?v=${ASSET_VERSION}`,
  `./archive-controller.js?v=${ASSET_VERSION}`,
  `./grammar-controller.js?v=${ASSET_VERSION}`,
  `./js/controllers/reader-controller.js?v=${ASSET_VERSION}`,
  `./js/controllers/pomodoro-controller.js?v=${ASSET_VERSION}`,
  `./js/controllers/editor-status-controller.js?v=${ASSET_VERSION}`,
  `./js/controllers/oficina-navigation-controller.js?v=${ASSET_VERSION}`,
  `./workshop-authorship-clarity-controller.js?v=${ASSET_VERSION}`,
  `./product-clarity-controller.js?v=${ASSET_VERSION}`,
  `./archive-clarity-controller.js?v=${ASSET_VERSION}`,
  `./syntax-controller.js?v=${ASSET_VERSION}`,
  `./js/controllers/tooltip-controller.js?v=${ASSET_VERSION}`,
  `./combo-detector.js?v=${ASSET_VERSION}`,
  `./deriva-mode.js?v=${ASSET_VERSION}`,
  `./perseguicao-mode.js?v=${ASSET_VERSION}`,
  `./js/controllers/training-controller.js?v=${ASSET_VERSION}`,
  `./print-engine.js?v=${ASSET_VERSION}`,
  "./syntax-data.json",
  "./norma-data.json",
  "./lexical-data.json",
  "./rimalab-data.json",
  "./analise-data.json",
  "./decolonial-data.json",
  "./templates-data.json",
  "./vereda-editorial.css",
  `./js/data/quotes-data.js?v=${ASSET_VERSION}`,
  "./vereda-biblioteca-escrita.html",
  `./manifest.webmanifest?v=${ASSET_VERSION}`,
  `./fonts/material-symbols-outlined.woff2`,
  `./icons/escrevaral-aba-dark.svg?v=${ASSET_VERSION}`,
  `./icons/escrevaral-aba-light.svg?v=${ASSET_VERSION}`,
  `./icons/escrevaral-nav-dark.svg?v=${ASSET_VERSION}`,
  `./icons/escrevaral-nav-light.svg?v=${ASSET_VERSION}`,
  `./favicon.svg?v=${ASSET_VERSION}`,
  `./favicon_io/site.webmanifest?v=${ASSET_VERSION}`,
  `./favicon_io/favicon.ico?v=${ASSET_VERSION}`,
  `./favicon_io/tab-favicon-16x16.png?v=${ASSET_VERSION}`,
  `./favicon_io/tab-favicon-32x32.png?v=${ASSET_VERSION}`,
  `./favicon_io/tab-favicon-48x48.png?v=${ASSET_VERSION}`,
  `./favicon_io/tab-favicon-180x180.png?v=${ASSET_VERSION}`,
  `./favicon_io/apple-touch-icon.png?v=${ASSET_VERSION}`,
  `./favicon_io/android-chrome-192x192.png?v=${ASSET_VERSION}`,
  `./favicon_io/android-chrome-512x512.png?v=${ASSET_VERSION}`,
  "./sounds/typewriter.wav",
  "./sounds/backspace.wav",
  "./sounds/Enter.wav",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // `addAll` tornava a oficina inteira indisponível offline quando um único
      // áudio, ícone ou material opcional falhava. O documento é obrigatório;
      // os demais recursos são tentados individualmente e podem ser completados
      // pela estratégia de runtime cache no próximo acesso online.
      .then(async (cache) => {
        await cache.addAll(["./", "./index.html"]);
        const optionalAssets = CORE_ASSETS.filter((asset) => asset !== "./" && asset !== "./index.html");
        await Promise.allSettled(optionalAssets.map((asset) => cache.add(asset)));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith("vereda-offline-") && cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", responseClone));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status >= 400) {
            return response;
          }

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => cachedResponse || new Response("", { status: 503, statusText: "Offline" }));
    })
  );
});