'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto').webcrypto;
const root=path.resolve(__dirname,'..'),origin='https://escrevaral.test/',script=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');
function harness(corrupt){
 const listeners={},stores=new Map([['scrvrl-offline-old',new Map()]]);let skipped=false,offline=false,claimed=false;
 const key=x=>new URL(typeof x==='string'?x:x.url,origin).href;
 const network=async req=>{if(offline)throw Error('offline');const name=new URL(key(req)).pathname.slice(1)||'index.html';return new Response(corrupt===name?'corrompido':fs.readFileSync(path.join(root,name)));};
 const caches={keys:async()=>Array.from(stores.keys()),delete:async n=>stores.delete(n),open:async n=>{
  if(!stores.has(n))stores.set(n,new Map());const map=stores.get(n);
  return {put:async(k,v)=>map.set(key(k),v.clone()),match:async k=>map.get(key(k))?.clone(),add:async k=>map.set(key(k),await network(k))};
 }};
 const self={registration:{scope:origin},addEventListener:(n,f)=>listeners[n]=f,skipWaiting:async()=>{skipped=true;},clients:{claim:async()=>{claimed=true;}}};
 class RelativeRequest extends Request{constructor(url,options){super(key(url),options);}}
 vm.runInNewContext(script,{self,caches,fetch:network,crypto,Request:RelativeRequest,Response,URL,Uint8Array});
 return {stores,get skipped(){return skipped;},get claimed(){return claimed;},goOffline(){offline=true;},
 event:async name=>{let task;listeners[name]({waitUntil:p=>task=p});await task;},
 request:async(url,mode)=>{let task;listeners.fetch({request:{url:key(url),method:'GET',mode},respondWith:p=>task=p});return task;}};
}
(async()=>{
 const assets=require('../build/assets.json').assets;
 for(const bad of ['index.html',assets[0].path]){
  const h=harness(bad);await assert.rejects(()=>h.event('install'));assert.equal(h.skipped,false);assert.ok(h.stores.has('scrvrl-offline-old'));
 }
 const h=harness();await h.event('install');assert.equal(h.skipped,true);await h.event('activate');assert.equal(h.claimed,true);assert.equal(h.stores.has('scrvrl-offline-old'),false);h.goOffline();
 assert.equal(await(await h.request('/','navigate')).text(),fs.readFileSync(path.join(root,'index.html'),'utf8'));
 for(const a of assets)assert.equal(await(await h.request('/'+a.path,'cors')).text(),fs.readFileSync(path.join(root,a.path),'utf8'));
 assert.equal((await h.request('/jornada/','navigate')).status,503,'Não substitui outras páginas pelo editor');
 console.log('OFFLINE OK (simulação): geração completa, rejeição de conteúdo divergente, preservação do cache anterior e rotas.');
})().catch(e=>{console.error(e);process.exitCode=1;});
