/* Gerado: editar src/app/service-worker.template.js. */
const CACHE_NAME = "scrvrl-offline-v6-52-02c870ceacc8";
const ASSET_VERSION = "20261006-scrvrl-se-v6-52";
const REQUIRED_ASSETS = [
  {
    "url": "./assets/20261006-scrvrl-se-v6-52/cofre.28c891426c96aab8.js",
    "sha256": "28c891426c96aab88c2e0fcbfd6d7f9890538cf2d2367e4e943583ef39cab498"
  },
  {
    "url": "./assets/20261006-scrvrl-se-v6-52/app.25fab6c7650f4623.js",
    "sha256": "25fab6c7650f46235643a848742cb8126b9b8238477579f8a9e3dc6232446a63"
  },
  {
    "url": "./assets/20261006-scrvrl-se-v6-52/styles.200ed33cf9f86d6b.css",
    "sha256": "200ed33cf9f86d6b6d9e0658e99e16d74439c38d499693bcdcfe3c77494cbb90"
  }
];
const scopeURL = new URL('./', self.registration.scope);
const appPaths = [scopeURL.pathname, new URL('index.html',scopeURL).pathname];
async function checkedAsset(asset) {
  const response=await fetch(new Request(asset.url,{cache:'reload'}));
  if(!response.ok)throw new Error('Recurso indisponível: '+asset.url);
  const digest=await crypto.subtle.digest('SHA-256',await response.clone().arrayBuffer());
  const actual=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
  if(actual!==asset.sha256)throw new Error('Recurso de outra versão: '+asset.url);
  return response;
}
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE_NAME);
  const index=await checkedAsset({url:'./index.html',sha256:'30c36c41c7be7318a8897abaae2c1e94dff91fb383ca9c9c2f784d30fff5b6c9'});
  if(!index.ok||(await index.clone().text()).indexOf('content="'+ASSET_VERSION+'"')<0)throw new Error('Documento de outra versão');
  await Promise.all(REQUIRED_ASSETS.map(async asset=>cache.put(asset.url,await checkedAsset(asset))));
  await cache.put('./index.html',index.clone());await cache.put('./',index);
  // Ícone e arquivo portátil não impedem o editor de funcionar offline.
  await Promise.allSettled(['./escrevaral.html','./manifest.webmanifest','./icons/icon.svg'].map(p=>cache.add(p)));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  for(const name of await caches.keys())if(name.startsWith('scrvrl-offline-')&&name!==CACHE_NAME)await caches.delete(name);
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==scopeURL.origin)return;
 const isApp=event.request.mode==='navigate'&&appPaths.includes(url.pathname);
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME);
  // Uma geração completa permanece consistente até a ativação do próximo worker.
  if(isApp){const page=await cache.match('./index.html');if(page)return page;}
  const cached=await cache.match(event.request);if(cached)return cached;
  try{return await fetch(event.request);}catch(error){return new Response('Recurso indisponível offline.',{status:503});}
 })());
});
