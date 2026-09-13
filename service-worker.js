const CACHE_NAME = "encore-offline-v1";
const ASSET_VERSION = "20260913-encore-v1";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./src/core/contracts.js",
  "./src/core/runtime.js",
  "./src/data/verbos-seed.js",
  "./src/core/services/tokenizer.js",
  "./src/core/engines/morphology.js",
  "./src/core/engines/relative-clause.js",
  "./src/data/decolonial-data.js",
  "./src/core/engines/decolonial.js",
  "./src/core/engines/rima-metro.js",
  "./src/core/engines/voz-estilistica.js",
  "./src/core/engines/pontuacao.js",
  "./src/data/syntax-data.js",
  "./src/data/norma-data.js",
  "./src/core/engines/sintaxe.js",
  "./src/data/lexical-data.js",
  "./src/data/lexical-norma-data.js",
  "./src/core/engines/lexico-classes.js",
  "./src/core/engines/analise-literaria.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // O documento é obrigatório e tem de ser a versão atual. `cache: "reload"`
      // ignora o cache HTTP heurístico e garante que a instalação só completa
      // quando o HTML carregado é realmente desta versão.
      .then(async (cache) => {
        const guardarDocumento = (caminho) =>
          fetch(new Request(caminho, { cache: "reload" })).then((resposta) => {
            if (!resposta.ok) throw new Error("documento não revalidado: " + caminho);
            return cache.put(caminho, resposta);
          });
        await Promise.all([guardarDocumento("./"), guardarDocumento("./index.html")]);
        const documento = await (await cache.match("./index.html")).text();
        if (documento.indexOf(`content="` + ASSET_VERSION + `"`) === -1) {
          throw new Error("HTML da versão atual não confirmado — instalação abortada");
        }
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
            .filter((cacheName) => cacheName.startsWith("encore-offline-") && cacheName !== CACHE_NAME)
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