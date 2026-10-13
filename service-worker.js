/* Gerado: editar src/app/service-worker.template.js. */
const CACHE_NAME = "scrvrl-offline-v6-63-1cc7bf19cf9e";
const ASSET_VERSION = "20261013-scrvrl-alvo-v6-63";
const REQUIRED_ASSETS = [
  {
    "url": "./assets/20261013-scrvrl-alvo-v6-63/cofre.e7e1b3b5699d1a02.js",
    "sha256": "e7e1b3b5699d1a022171a8abb4bc4655cc70aa64e4fedeca9f4f9697a32b65dc"
  },
  {
    "url": "./assets/20261013-scrvrl-alvo-v6-63/app.a778bccb312acf78.js",
    "sha256": "a778bccb312acf78fd26488a3002c226749abcaa33b2b012994d31f7b65966fe"
  },
  {
    "url": "./assets/20261013-scrvrl-alvo-v6-63/styles.79d88716e7951271.css",
    "sha256": "79d88716e79512714f35c93d75498a0f1f336e4af8be2cfdb941c8e875ca0352"
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
  const index=await checkedAsset({url:'./index.html',sha256:'4eedb7f06eee3fbf261c7330265964783e08db0aee646cb94476d32749f6be63'});
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
