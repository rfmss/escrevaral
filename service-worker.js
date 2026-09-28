/* Gerado: editar src/app/service-worker.template.js. */
const CACHE_NAME = "scrvrl-offline-v6-31-5625966eeb98";
const ASSET_VERSION = "20260927-scrvrl-legado-v6-31";
const REQUIRED_ASSETS = [
  {
    "url": "./assets/20260927-scrvrl-legado-v6-31/cofre.4668b55c3a49a07d.js",
    "sha256": "4668b55c3a49a07df52cfaa8574c275dceb554043e8d391dd31b416a21a5f2ea"
  },
  {
    "url": "./assets/20260927-scrvrl-legado-v6-31/app.b3785e99f937f64a.js",
    "sha256": "b3785e99f937f64a13a053fbf17f7b4c2a988b83c1af158754d46cca3efcf53b"
  },
  {
    "url": "./assets/20260927-scrvrl-legado-v6-31/styles.200ed33cf9f86d6b.css",
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
  const index=await checkedAsset({url:'./index.html',sha256:'c843530e955676f7aa8239be6d422dfc611180c3a8414db22cf5cee56d595c69'});
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
