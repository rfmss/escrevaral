const CACHE_NAME = "vereda-offline-v492";
const ASSET_VERSION = "20260617-sinonimos-117";

const CORE_ASSETS = [
  "./",
  "./index.html",
  `./css/00-tokens.css?v=${ASSET_VERSION}`,
  `./css/01-base.css?v=${ASSET_VERSION}`,
  `./css/02-shell-navigation.css?v=${ASSET_VERSION}`,
  `./styles.css?v=${ASSET_VERSION}`,
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
  `./criterios-data.js?v=${ASSET_VERSION}`,
  `./syntax-engine.js?v=${ASSET_VERSION}`,
  `./punctuation-engine.js?v=${ASSET_VERSION}`,
  `./analise-engine.js?v=${ASSET_VERSION}`,
  `./synonym-data.js?v=${ASSET_VERSION}`,
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
  `./reader-controller.js?v=${ASSET_VERSION}`,
  `./pomodoro-controller.js?v=${ASSET_VERSION}`,
  `./syntax-controller.js?v=${ASSET_VERSION}`,
  `./tooltip-controller.js?v=${ASSET_VERSION}`,
  `./combo-detector.js?v=${ASSET_VERSION}`,
  `./deriva-mode.js?v=${ASSET_VERSION}`,
  `./perseguicao-mode.js?v=${ASSET_VERSION}`,
  `./training-controller.js?v=${ASSET_VERSION}`,
  `./print-engine.js?v=${ASSET_VERSION}`,
  "./syntax-data.json",
  "./norma-data.json",
  "./lexical-data.json",
  "./rimalab-data.json",
  "./analise-data.json",
  "./decolonial-data.json",
  "./templates-data.json",
  "./vereda-editorial.css",
  "./quotes-data.js",
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
      .then((cache) => cache.addAll(CORE_ASSETS))
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
