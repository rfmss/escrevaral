/* Gerado: editar src/app/service-worker.template.js. */
const CACHE_NAME = "scrvrl-offline-v6-37-3f6c9859d1fc";
const ASSET_VERSION = "20260930-scrvrl-nominal-v6-37";
const REQUIRED_ASSETS = [
  {
    "url": "./assets/20260930-scrvrl-nominal-v6-37/cofre.179b1b2edd20510b.js",
    "sha256": "179b1b2edd20510b5e3a823b1fe7c3b7e758126a6c1c6d626530770c82e7f7da"
  },
  {
    "url": "./assets/20260930-scrvrl-nominal-v6-37/app.12f32b398bd0007e.js",
    "sha256": "12f32b398bd0007ee66b9b3fe3f027d35f7d84ba328bcdeed96726c263fe673f"
  },
  {
    "url": "./assets/20260930-scrvrl-nominal-v6-37/styles.200ed33cf9f86d6b.css",
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
  const index=await checkedAsset({url:'./index.html',sha256:'83f7c9cc87d41c86c543b6cb75e28a5b3bb9793d8ca3f0e1b85eed17c679d1ee'});
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
