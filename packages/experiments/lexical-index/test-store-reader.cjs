'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const {IDBFactory}=require('fake-indexeddb'),acorn=require('acorn');
const bridge=require('./store-reader'),utf8=require('./utf8'),builder=require('./build-paged.cjs'),fixture=require('./fixture.cjs'),lookup=require('./lookup');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const buffer=s=>{const b=Buffer.from(s);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);};
const sha=b=>crypto.createHash('sha256').update(Buffer.from(b)).digest('hex');
const call=(o,k,...args)=>new Promise((ok,no)=>o[k](...args,(e,v)=>e?no(e):ok(v)));
const open=o=>new Promise((ok,no)=>bridge.open(o,(e,v)=>e?no(e):ok(v)));
const read=(b,d,p='pkg',v='1')=>new Promise((ok,no)=>b.readBlock(p,v,d.id,(e,x)=>e?no(e):ok(x),d));
const is=code=>e=>e.code===code;
async function waitFor(fn){for(let i=0;i<500;i++){if(fn())return;await sleep(2);}throw Error('test-timeout');}
const dtext=(text,id='b0')=>({id,encodedBytes:Buffer.byteLength(text),decodedBytes:text.length*2,sha256:sha(buffer(text))});
function fake(text='ação 🎼'){
 const d=dtext(text),ticket={key:'pkg/1',token:'fixed'};
 const manifest={schema:'scrvrl.package-stage',schemaVersion:1,id:'pkg',version:'1',dependencies:[],blocks:[{id:d.id,bytes:d.encodedBytes,sha256:d.sha256}]};
 return {d,ticket,manifest,resources:[{packageId:'pkg',version:'1',ticket}],store:{inspect(t,cb){cb(null,{state:'ready',manifest});return {cancel(){}};},read(t,id,cb){cb(null,buffer(text));return {cancel(){}};}}};
}
function real(){
 const root={Escr:{},indexedDB:new IDBFactory(),setTimeout,clearTimeout};
 for(const f of ['pacotes','instalador-pacotes'])vm.runInNewContext(fs.readFileSync('src/storage/'+f+'.js','utf8'),root);
 const limits={blockBytes:4096,packageBytes:524288,blocks:128,metadataChars:32768};
 const createStore=()=>root.Escr.createPackageStore({limits,digest:(b,cb)=>setImmediate(()=>cb(null,sha(b)))});
 async function install(store,b){
  const envelope={schema:'scrvrl.package-stage',schemaVersion:1,id:b.manifest.packageId,version:b.manifest.version,dependencies:b.manifest.dependencies.map(d=>({id:d.packageId,version:d.version})),blocks:Object.keys(b.blocks).map(id=>({id,bytes:Buffer.byteLength(b.blocks[id]),sha256:sha(buffer(b.blocks[id]))}))};
  const installer=root.Escr.createPackageInstaller({store,readBlock:(r,cb)=>{setImmediate(()=>cb(null,buffer(b.blocks[r.block.id])));return {cancel(){}};}});
  const report=await new Promise((ok,no)=>installer.install(envelope,null,(e,r)=>e?no(e):ok(r)));
  return {packageId:b.manifest.packageId,version:b.manifest.version,ticket:report.ticket};
 }
 async function raw(key,bytes){const r=root.indexedDB.open('escrevaral-pacotes',1);const db=await new Promise((ok,no)=>{r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});try{await new Promise((ok,no)=>{const tx=db.transaction('blocks','readwrite');tx.objectStore('blocks').put(bytes,key);tx.oncomplete=ok;tx.onabort=()=>no(tx.error);});}finally{db.close();}}
 return {root,createStore,install,raw};
}
function request(word,b,id='r') {return {schemaVersion:1,requestId:id,documentId:'doc',recordId:'folha',revision:1,textGeneration:1,baseOffset:0,snapshot:word,scope:{start:0,end:word.length},contextScope:{start:0,end:word.length},engineId:'a01',engineVersion:'1',resources:[{packageId:b.manifest.packageId,version:b.manifest.version}]};}
let cases=0,utf8Vectors=0;const evidence={};
async function test(name,fn){await fn();cases++;console.log('ok '+name);}
(async()=>{
 await test('UTF-8 estrito preserva NUL, BOM, acentos, NFD e planos suplementares',()=>{
  const texts=['','\0','ação','ac\u0327a\u0303o','🎼','\uFEFFx',String.fromCodePoint(0x7f,0x80,0x7ff,0x800,0xd7ff,0xe000,0xffff,0x10000,0x10ffff)];
  for(let cp=0;cp<=0x10ffff;cp+=997)if(cp<0xd800||cp>0xdfff)texts.push(String.fromCodePoint(cp));
  for(const text of texts){assert.equal(utf8.decode(buffer(text),4096,8192),text);utf8Vectors++;}
  const native=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true});
  const bad=[[0xc0,0x80],[0xc1,0xbf],[0xe0,0x80,0x80],[0xf0,0x80,0x80,0x80],[0xed,0xa0,0x80],[0xed,0xbf,0xbf],[0xf4,0x90,0x80,0x80],[0xf5,0x80,0x80,0x80],[0xff],[0xc2],[0xe2,0x82],[0xf0,0x90,0x80],[0xc2,0x41],[0xe2,0x28,0xa1]];
  for(let i=0;i<256;i++)bad.push([i]);
  let seed=31;for(let i=0;i<1024;i++){let a=[];for(let j=0;j<1+i%5;j++){seed=(seed*1664525+1013904223)>>>0;a.push(seed>>>24);}bad.push(a);}
  for(const a of bad){const b=new Uint8Array(a).buffer;let expected,error;try{expected=native.decode(b);}catch(e){error=e;}
   if(error)assert.throws(()=>utf8.decode(b,4096,8192),is('INVALID_UTF8'));else assert.equal(utf8.decode(b,4096,8192),expected);utf8Vectors++;}
  assert.throws(()=>utf8.decode(buffer('abc'),2,8192),is('ENCODED_LIMIT'));
  assert.throws(()=>utf8.decode(buffer('🎼'),4,2),is('DECODED_LIMIT'));
  assert.throws(()=>utf8.decode(buffer('a'),0,2),is('INVALID_UTF8_LIMIT'));
 });
 await test('tickets e descritores copiados; abertura e leitura sempre assíncronas',async()=>{
  const f=fake();let sync=true,seenTicket;
  const opening=new Promise((ok,no)=>bridge.open(f,(e,b)=>{assert.equal(sync,false);e?no(e):ok(b);}));
  f.resources[0].ticket.token='mutated';sync=false;
  // O ticket foi copiado antes da mutação do chamador.
  f.store.inspect=(t,cb)=>{seenTicket=t.token;cb(null,{state:'ready',manifest:f.manifest});};
  const b=await opening;assert.equal(seenTicket,'fixed');
  const expected={...f.d};const result=read(b,expected);expected.sha256='0'.repeat(64);expected.decodedBytes=999;
  f.manifest.blocks[0].sha256='1'.repeat(64);assert.equal((await result).text,'ação 🎼');b.close();
 });
 await test('vínculo recusa versões, dependências e metadados fora do limite',async()=>{
  let f=fake();f.manifest.version='2';await assert.rejects(open(f),is('INVALID_BINDING'));
  f=fake();f.manifest.dependencies=[{id:'base',version:'1'}];await assert.rejects(open(f),is('DEPENDENCY_NOT_PINNED'));
  f=fake();f.limits={maxMetadataChars:10};await assert.rejects(open(f),is('METADATA_LIMIT'));
  f=fake();f.manifest.blocks.push({...f.manifest.blocks[0],id:'b1'});f.limits={maxDescriptors:1};await assert.rejects(open(f),is('DESCRIPTOR_LIMIT'));
  f=fake();f.store.inspect=(t,cb)=>cb(null,{state:'staged',manifest:f.manifest});await assert.rejects(open(f),is('INVALID_BINDING'));
  assert.throws(()=>bridge.open({...fake(),limits:{maxPendingReads:0}},()=>{}),is('INVALID_LIMIT'));
 });
 await test('descritor divergente e bloco ausente são recusados antes do I/O',async()=>{
  const f=fake();let reads=0;f.store.read=()=>{reads++;};const b=await open(f);
  for(const d of [{...f.d,sha256:'0'.repeat(64)},{...f.d,encodedBytes:999},{...f.d,decodedBytes:9000}])await assert.rejects(read(b,d),is('DESCRIPTOR_MISMATCH'));
  await assert.rejects(read(b,{...f.d,id:'missing'}),is('BLOCK_UNAVAILABLE'));assert.equal(reads,0);b.close();
 });
 await test('fila limita pedidos e mantém a vaga física depois de cancelar',async()=>{
  const f=fake();f.limits={maxPendingReads:2};let pending=[],reads=0,cancels=0;
  f.store.read=(t,id,cb)=>{reads++;pending.push(cb);return {cancel(){cancels++;}};};const b=await open(f);
  let h;const first=new Promise(resolve=>{h=b.readBlock('pkg','1','b0',e=>{assert.equal(e.code,'CANCELLED');resolve();},f.d);});
  await waitFor(()=>reads===1);h.cancel();const second=read(b,f.d);await assert.rejects(read(b,f.d),is('READ_QUEUE_LIMIT'));
  assert.equal(reads,1);assert.equal(b.stats().pending,2);assert.equal(cancels,1);
  pending[0](null,buffer('ação 🎼'));await first;await waitFor(()=>reads===2);pending[1](null,buffer('ação 🎼'));assert.equal((await second).text,'ação 🎼');b.close();
 });
 await test('cancelar na fila não toca o store; fechar aguarda a leitura ativa',async()=>{
  const f=fake();let physical,reads=0;f.store.read=(t,id,cb)=>{reads++;physical=cb;return {cancel(){throw Error('abort-unavailable');}};};const b=await open(f);
  const active=read(b,f.d).catch(e=>e.code);await waitFor(()=>reads===1);
  let h;const queued=new Promise(resolve=>{h=b.readBlock('pkg','1','b0',e=>resolve(e.code),f.d);});h.cancel();assert.equal(await queued,'CANCELLED');assert.equal(reads,1);
  b.close();assert.equal(b.stats().pending,1);await assert.rejects(read(b,f.d),is('CLOSED'));physical(null,buffer('ação 🎼'));assert.equal(await active,'CANCELLED');assert.equal(b.stats().pending,0);
 });
 await test('cancelar abertura espera inspect e ignora callbacks duplicados',async()=>{
  const f=fake();let physical,called=0;f.store.inspect=(t,cb)=>{physical=cb;return {cancel(){}};};
  let h;const p=new Promise(resolve=>{h=bridge.open(f,e=>{called++;assert.equal(e.code,'CANCELLED');resolve();});});
  await waitFor(()=>physical);h.cancel();assert.equal(called,0);physical(null,{state:'ready',manifest:f.manifest});physical(null,{state:'ready',manifest:f.manifest});await p;assert.equal(called,1);
 });
 await test('store síncrono, duplicatas, exceções e códigos nativos não quebram a fila',async()=>{
  const f=fake();let calls=0;f.store.read=(t,id,cb)=>{calls++;if(calls===1)throw Object.assign(Error('io'),{code:'IO_TEST'});cb(null,buffer('ação 🎼'));cb(Error('late'));};
  const b=await open(f);await assert.rejects(read(b,f.d),is('IO_TEST'));assert.equal((await read(b,f.d)).text,'ação 🎼');b.close();
  f.store.inspect=(t,cb)=>cb(Object.assign(Error('quota'),{name:'QuotaExceededError',code:'QUOTA_TEST'}));await assert.rejects(open(f),e=>e.name==='QuotaExceededError'&&e.code==='QUOTA_TEST');
 });
 await test('UTF-8 inválido e tamanho decodificado divergente nunca viram payload',async()=>{
  const f=fake('a');f.store.read=(t,id,cb)=>cb(null,new Uint8Array([255]).buffer);const b=await open(f);await assert.rejects(read(b,f.d),is('INVALID_UTF8'));b.close();
  const g=fake();const c=await open(g);await assert.rejects(read(c,{...g.d,decodedBytes:2}),is('LENGTH_MISMATCH'));c.close();
  for(const value of [new ArrayBuffer(4097),new Uint8Array([1])]){const x=fake();x.store.read=(t,id,cb)=>cb(null,value);const y=await open(x);await assert.rejects(read(y,x.d),is('LENGTH_MISMATCH'));y.close();}
 });
 await test('dependências fixadas são consultadas; API ausente preserva erro',async()=>{
  const r=real(),store=r.createStore(),base=builder.build(fixture.entries(),{packageId:'base',version:'1'}),dependent=builder.build(fixture.entries(),{packageId:'dep',version:'1',dependencies:[{packageId:'base',version:'1'}]});
  const a=await r.install(store,base),d=await r.install(store,dependent);const b=await open({store,resources:[a,d]});
  const e=lookup.create({manifests:[base.text,dependent.text],readBlock:b.readBlock,isCurrent:()=>true});const out=await new Promise(resolve=>e.lookup(request('carro',dependent),resolve));
  assert.equal(out.complete,true);assert.equal(out.candidates.length,2);e.dispose();b.close();store.close();
  r.root.indexedDB=null;const missing=r.createStore();await assert.rejects(open({store:missing,resources:[a]}),is('STORAGE_UNAVAILABLE'));missing.close();
 });
 await test('cancelamento durante hash real mantém fila até conclusão física',async()=>{
  const r=real(),writer=r.createStore(),a=builder.build(fixture.entries()),binding=await r.install(writer,a);writer.close();
  let hashDone,hashes=0;
  const store=r.root.Escr.createPackageStore({limits:{blockBytes:4096,packageBytes:524288,blocks:128,metadataChars:32768},digest:(bytes,cb)=>{hashes++;hashDone=()=>cb(null,sha(bytes));}});
  const b=await open({store,resources:[binding]});let h;
  const p=new Promise(resolve=>{h=b.readBlock(binding.packageId,binding.version,a.manifest.root.id,e=>{assert.equal(e.code,'CANCELLED');resolve();},a.manifest.root);});
  await waitFor(()=>hashDone);h.cancel();const q=read(b,a.manifest.root,binding.packageId,binding.version);assert.equal(hashes,1);assert.equal(b.stats().pending,2);
  hashDone();await p;await waitFor(()=>hashes===2);hashDone();assert.ok((await q).text);b.close();store.close();
 });
 await test('instalador → store reaberto → ponte → lookup paginado preserva resultados e cache',async()=>{
  const r=real(),source=fixture.entries(40,80),bundle=builder.build(source,{limits:{maxRows:8}});let store=r.createStore();
  const binding=await r.install(store,bundle);store.close();store=r.createStore();const b=await open({store,resources:[binding]});
  const e=lookup.create({manifests:[bundle.text],readBlock:b.readBlock,isCurrent:()=>true,limits:{maxIndexDecodedBytes:8192}});
  const query=word=>new Promise(resolve=>e.lookup(request(word,bundle),resolve));
  for(const word of ['CARRO','carregado','AC\u0327A\u0303O','ausente']){const out=await query(word);assert.equal(out.complete,true);assert.deepEqual(out.candidates.map(x=>x.id).sort(),source.filter(x=>x.form.normalize('NFD').toLowerCase()===word.normalize('NFD').toLowerCase()).map(x=>x.id).sort());}
  const before=e.stats().reads;await query('ausente');assert.equal(e.stats().reads,before);
  const cold=await query('CARRO'),reads=e.stats().reads,warm=await query('CARRO');assert.deepEqual(cold,warm);assert.equal(e.stats().reads,reads);
  evidence.integration={entries:source.length,descriptors:b.stats().descriptors,metadataChars:b.stats().metadataChars,rootBytes:Buffer.byteLength(bundle.text),runtime:e.stats()};
  e.dispose();b.close();store.close();
 });
 await test('ticket antigo segue fixado após ativar outra versão; corrupção é falha',async()=>{
  const r=real(),store=r.createStore(),a=builder.build(fixture.entries(),{version:'1'}),z=builder.build([{id:'new',form:'carro',lemma:'novo',pos:'NOUN',features:''}],{version:'2'});
  const old=await r.install(store,a);const b=await open({store,resources:[old]});await r.install(store,z);
  const e=lookup.create({manifests:[a.text],readBlock:b.readBlock,isCurrent:()=>true});const out=await new Promise(resolve=>e.lookup(request('CARRO',a),resolve));assert.equal(out.candidates[0].lemma,'carro');e.dispose();
  await r.raw(old.ticket.key+'/'+a.manifest.root.id,buffer('x'.repeat(a.manifest.root.encodedBytes)));
  const f=lookup.create({manifests:[a.text],readBlock:b.readBlock,isCurrent:()=>true});const bad=await new Promise(resolve=>f.lookup(request('CARRO',a),resolve));assert.equal(bad.complete,false);assert.equal(bad.status,'falha');assert.equal(bad.reason,'INTEGRITY_FAILED');assert.deepEqual(bad.candidates,[]);f.dispose();b.close();store.close();
 });
 await test('consumidores do lookup compartilham leitura; cancelamento não afeta outro',async()=>{
  const r=real(),store=r.createStore(),a=builder.build(fixture.entries());const binding=await r.install(store,a);
  let physical,reads=0;const original=store.read;store.read=(t,id,cb)=>{reads++;if(reads===1){physical=()=>original(t,id,cb);return {cancel(){}};}return original(t,id,cb);};
  const b=await open({store,resources:[binding]}),e=lookup.create({manifests:[a.text],readBlock:b.readBlock,isCurrent:()=>true});let cancelledCalls=0;
  const first=e.lookup(request('carro',a,'one'),()=>cancelledCalls++),second=new Promise(resolve=>e.lookup(request('carro',a,'two'),resolve));await waitFor(()=>physical);first.cancel();physical();assert.equal((await second).status,'encontrado');assert.equal(cancelledCalls,0);assert.equal(e.stats().sharedReads,1);e.dispose();b.close();store.close();
 });
 await test('ponte e UTF-8 em ES5, sem APIs modernas obrigatórias nem bundle',()=>{
  for(const file of ['utf8.js','store-reader.js']){const source=fs.readFileSync(__dirname+'/'+file,'utf8');acorn.parse(source,{ecmaVersion:5});assert.ok(!/\b(?:TextDecoder|Promise|fetch|AbortController)\s*[.(]/.test(source));}
  const modules=JSON.parse(fs.readFileSync('build/modules.json','utf8'));assert.ok(!JSON.stringify(modules).includes('store-reader.js'));
 });
 console.log(JSON.stringify({result:'passed',cases,utf8Vectors,evidence}));
})().catch(e=>{console.error(e);process.exitCode=1;});
