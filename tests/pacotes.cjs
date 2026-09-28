'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {IDBFactory,IDBObjectStore}=require('fake-indexeddb');
const source=fs.readFileSync('src/storage/pacotes.js','utf8');
const limits={blockBytes:1024,packageBytes:8192,blocks:16,metadataChars:8192};
const sha=bytes=>crypto.createHash('sha256').update(Buffer.from(bytes)).digest('hex');
const bytes=text=>new TextEncoder().encode(text).buffer;
const decode=buffer=>new TextDecoder().decode(buffer);
const hash=(input,done)=>setImmediate(()=>done(null,sha(input)));
function context(factory=new IDBFactory()) {const root={Escr:{},indexedDB:factory,setTimeout,clearTimeout};vm.runInNewContext(source,root);return root;}
const call=(store,method,...args)=>new Promise((resolve,reject)=>store[method](...args,(e,v)=>e?reject(e):resolve(v)));
function manifest(version,texts=['ação','🎼'],dependencies=[]) {return {schema:'scrvrl.package-stage',schemaVersion:1,id:'lexico',version,dependencies,blocks:texts.map((s,i)=>({id:'b'+i,bytes:bytes(s).byteLength,sha256:sha(bytes(s))}))};}
const code=expected=>e=>e.code===expected;
async function raw(root,action){const r=root.indexedDB.open('escrevaral-pacotes',1);const db=await new Promise((ok,no)=>{r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});try{await new Promise((ok,no)=>{const tx=db.transaction(['versions','receipts','blocks','active'],'readwrite');tx.oncomplete=ok;tx.onabort=()=>no(tx.error);action(tx);});}finally{db.close();}}
(async()=>{
 const root=context();let store=root.Escr.createPackageStore({limits,digest:hash});
 const first=(await call(store,'stage',manifest('1'))).ticket;
 assert.equal(await call(store,'active','lexico'),null);
 await call(store,'put',first,'b0',bytes('ação'));
 await assert.rejects(call(store,'activate',first),code('INCOMPLETE_VERSION'));
 store.close();store=root.Escr.createPackageStore({limits,digest:hash});
 const resumed=await call(store,'stage',manifest('1'));assert.equal(resumed.ticket.token,first.token);
 assert.deepEqual(Array.from((await call(store,'inspect',first)).stored),['b0']);
 await assert.rejects(call(store,'read',first,'b0'),code('INCOMPLETE_VERSION'));
 await assert.rejects(call(store,'put',first,'b1',bytes('x')),code('INTEGRITY_FAILED'));
 await call(store,'put',first,'b1',bytes('🎼'));await call(store,'activate',first);
 assert.equal(decode(await call(store,'read',first,'b0')),'ação');
 await assert.rejects(call(store,'put',first,'b0',bytes('ação')),code('IMMUTABLE_VERSION'));
 const second=(await call(store,'stage',manifest('2',['novo']))).ticket;
 await assert.rejects(call(store,'activate',second),code('INCOMPLETE_VERSION'));
 assert.equal((await call(store,'active','lexico')).ticket.token,first.token);
 // Falha na segunda escrita do bloco reverte também a primeira (não há recibo falso).
 const put=IDBObjectStore.prototype.put;
 IDBObjectStore.prototype.put=function(value,key){if(this.name==='receipts')throw new DOMException('quota','QuotaExceededError');return put.call(this,value,key);};
 try{await assert.rejects(call(store,'put',second,'b0',bytes('novo')),e=>e.name==='QuotaExceededError');}finally{IDBObjectStore.prototype.put=put;}
 assert.equal((await call(store,'inspect',second)).stored.length,0);
 assert.equal(decode(await call(store,'read',first,'b0')),'ação');
 await call(store,'put',second,'b0',bytes('novo'));
 IDBObjectStore.prototype.put=function(value,key){if(this.name==='active')throw new DOMException('quota','QuotaExceededError');return put.call(this,value,key);};
 try{await assert.rejects(call(store,'activate',second),e=>e.name==='QuotaExceededError');}finally{IDBObjectStore.prototype.put=put;}
 assert.equal((await call(store,'inspect',second)).state,'staged','ativação incompleta reverte estado e ponteiro');
 assert.equal((await call(store,'active','lexico')).ticket.token,first.token);
 await call(store,'activate',second);
 assert.equal((await call(store,'active','lexico')).ticket.token,second.token);
 assert.equal(decode(await call(store,'read',first,'b0')),'ação','versão anterior preservada e consultável');
 const third=(await call(store,'stage',manifest('3',['fim'],[{id:'base',version:'1'}]))).ticket;
 await call(store,'put',third,'b0',bytes('fim'));
 await assert.rejects(call(store,'activate',third),code('DEPENDENCY_UNAVAILABLE'));
 const base=manifest('1',['base']);base.id='base';const baseTicket=(await call(store,'stage',base)).ticket;
 await call(store,'put',baseTicket,'b0',bytes('base'));await call(store,'activate',baseTicket);await call(store,'activate',third);
 await assert.rejects(call(store,'discard',baseTicket),code('IMMUTABLE_VERSION'));
 const draft=manifest('draft',['temp']);const old=(await call(store,'stage',draft)).ticket;
 await call(store,'discard',old);const recreated=(await call(store,'stage',draft)).ticket;assert.notEqual(recreated.token,old.token);
 await assert.rejects(call(store,'put',old,'b0',bytes('temp')),code('STALE_TICKET'));
 await assert.rejects(call(store,'stage',manifest('draft',['different'])),code('VERSION_CONFLICT'));
 // Corrupção de mesmo tamanho é detectada na consulta, não vira ausência lexical.
 await raw(root,tx=>tx.objectStore('blocks').put(bytes('ruim'),second.key+'/b0'));
 await assert.rejects(call(store,'read',second,'b0'),code('INTEGRITY_FAILED'));
 await assert.rejects(call(store,'put',recreated,'b0',new ArrayBuffer(1025)),code('BLOCK_LIMIT'));
 store.close();await assert.rejects(call(store,'active','lexico'),code('CLOSED'));
 // Cancelar durante hash conserva o limite de uma operação até o custo em curso terminar.
 let finishHash,callbackCount=0;
 store=root.Escr.createPackageStore({limits,digest:(input,done)=>{finishHash=()=>done(null,sha(input));}});
 const cancelled=new Promise(resolve=>{const h=store.put(recreated,'b0',bytes('temp'),e=>{callbackCount++;assert.equal(e.code,'CANCELLED');resolve();});h.cancel();});
 await assert.rejects(call(store,'active','lexico'),code('BUSY'));finishHash();await cancelled;assert.equal(callbackCount,1);
 assert.equal((await call(store,'inspect',recreated)).stored.length,0);store.close();
 // Cancelar a verificação da leitura também descarta a resposta e mantém o orçamento.
 store=root.Escr.createPackageStore({limits,digest:(input,done)=>{finishHash=()=>done(null,sha(input));}});finishHash=null;
 let handle;const reading=new Promise(resolve=>{handle=store.read(first,'b0',e=>{assert.equal(e.code,'CANCELLED');resolve();});});
 while(!finishHash)await new Promise(r=>setImmediate(r));handle.cancel();await assert.rejects(call(store,'active','lexico'),code('BUSY'));finishHash();await reading;store.close();
 const unsupported=context(null);store=unsupported.Escr.createPackageStore({limits,digest:hash});await assert.rejects(call(store,'stage',manifest('1')),code('STORAGE_UNAVAILABLE'));
 store=root.Escr.createPackageStore({limits});await assert.rejects(call(store,'put',recreated,'b0',bytes('temp')),code('INTEGRITY_UNAVAILABLE'));store.close();
 root.crypto=crypto.webcrypto;store=root.Escr.createPackageStore({limits});
 await call(store,'put',recreated,'b0',bytes('temp'));await call(store,'activate',recreated);
 assert.equal(decode(await call(store,'read',recreated,'b0')),'temp');store.close();
 console.log('PACOTES OK: staging, retomada, ativação atômica, quota/rollback, versões/dependências, reabertura simulada, corrupção e cancelamento sem resposta antiga.');
})().catch(e=>{console.error(e);process.exitCode=1;});
