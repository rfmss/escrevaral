'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),acorn=require('acorn');
const {IDBFactory,IDBObjectStore}=require('fake-indexeddb');
const addressed=require('./addressed-store'),bridge=require('./store-reader'),builder=require('./build-paged.cjs'),fixture=require('./fixture.cjs'),lookup=require('./lookup');
const limits={blockBytes:4096,packageBytes:16*1024*1024,blocks:10000,headerChars:2048,dependencies:8};
const bytes=s=>{const b=Buffer.from(s);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);};
const sha=b=>crypto.createHash('sha256').update(Buffer.from(b)).digest('hex');
const digest=(b,done)=>setImmediate(()=>done(null,sha(b)));
const call=(s,k,...a)=>new Promise((ok,no)=>s[k](...a,(e,v)=>e?no(e):ok(v)));
const is=c=>e=>e.code===c;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function waitFor(fn){for(let i=0;i<500;i++){if(fn())return;await sleep(2);}throw Error('test-timeout');}
function plan(texts=['ação','🎼'],version='1',id='pkg',dependencies=[]){
 const list=texts.map((text,i)=>({id:'b'+i,bytes:Buffer.byteLength(text),sha256:sha(bytes(text))}));
 return prepare(list,Object.fromEntries(texts.map((t,i)=>['b'+i,t])),version,id,dependencies);
}
function prepare(list,blocks,version,id,dependencies=[]){
 let chain='0'.repeat(64);for(const d of list)chain=sha(bytes('scrvrl-descriptor-chain-v1\n'+chain+'\n'+JSON.stringify({id:d.id,bytes:d.bytes,sha256:d.sha256})));
 return {list,blocks,manifest:{schema:'scrvrl.package-stage',schemaVersion:2,id,version,dependencies,blockCount:list.length,totalBytes:list.reduce((s,d)=>s+d.bytes,0),catalogHash:chain}};
}
function setup(factory=new IDBFactory(),hash=digest){return addressed.create({indexedDB:factory,limits,digest:hash});}
async function fill(s,p,activate=true){const t=(await call(s,'stage',p.manifest)).ticket;for(let i=0;i<p.list.length;i++){const d=p.list[i];await call(s,'append',t,i,d);await call(s,'put',t,d.id,bytes(p.blocks[d.id]));}if(activate)await call(s,'activate',t);return t;}
const read=(s,t,d)=>call(s,'readVerified',t,d.id,{bytes:d.bytes,sha256:d.sha256});
async function raw(factory,stores,action){const req=factory.open('escrevaral-pacotes-addressed-experiment',1);const db=await new Promise((ok,no)=>{req.onsuccess=()=>ok(req.result);req.onerror=()=>no(req.error);});try{await new Promise((ok,no)=>{const tx=db.transaction(stores,'readwrite');tx.oncomplete=ok;tx.onabort=()=>no(tx.error);action(tx);});}finally{db.close();}}
function request(word,b){return {schemaVersion:1,requestId:'r',documentId:'d',recordId:'n',revision:1,textGeneration:1,baseOffset:0,snapshot:word,scope:{start:0,end:word.length},contextScope:{start:0,end:word.length},engineId:'a02',engineVersion:'1',resources:[{packageId:b.manifest.packageId,version:b.manifest.version}]};}
let cases=0;const measurements=[];
async function test(name,fn){await fn();cases++;console.log('ok '+name);}
(async()=>{
 await test('cadeia canônica, cabeçalho compacto, instalação completa e leitura pontual',async()=>{
  const p=plan(),s=setup(),t=await fill(s,p);const h=await call(s,'snapshot',t);
  assert.equal(h.manifest.blocks,undefined);assert.equal(h.chain,p.manifest.catalogHash);assert.equal(h.received,2);assert.equal(h.state,'ready');
  assert.equal(Buffer.from(await read(s,t,p.list[0])).toString(),'ação');assert.equal((await call(s,'active','pkg')).ticket.token,t.token);
  assert.equal(Buffer.from(addressed.chainInput('0'.repeat(64),p.list[0])).toString(),'scrvrl-descriptor-chain-v1\n'+'0'.repeat(64)+'\n'+JSON.stringify(p.list[0]));
  await assert.rejects(call(s,'put',t,'b0',bytes('ação')),is('IMMUTABLE_VERSION'));s.close();
 });
 await test('retomada usa ordinal e repetição não infla recibos ou contadores',async()=>{
  const f=new IDBFactory(),p=plan();let s=setup(f);const t=(await call(s,'stage',p.manifest)).ticket;
  await call(s,'append',t,0,p.list[0]);await call(s,'put',t,'b0',bytes('ação'));s.close();s=setup(f);
  assert.equal((await call(s,'stage',p.manifest)).ticket.token,t.token);await call(s,'append',t,0,p.list[0]);await call(s,'put',t,'b0',bytes('ação'));
  let h=await call(s,'snapshot',t);assert.equal(h.nextOrdinal,1);assert.equal(h.received,1);
  await call(s,'append',t,1,p.list[1]);await call(s,'put',t,'b1',bytes('🎼'));await call(s,'activate',t);h=await call(s,'snapshot',t);assert.equal(h.received,2);s.close();
 });
 await test('descritor e recibo pontuais permitem retomada sem carregar payload',async()=>{
  const s=setup(),p=plan(),t=(await call(s,'stage',p.manifest)).ticket;
  await assert.rejects(call(s,'describe',t,'b0'),is('UNKNOWN_BLOCK'));await call(s,'append',t,0,p.list[0]);
  const before=s.stats(),d=await call(s,'describe',t,'b0');assert.equal(d.stored,false);assert.deepEqual(d.descriptor,p.list[0]);assert.equal(s.stats().metadataReads-before.metadataReads,3);assert.equal(s.stats().payloadReads,before.payloadReads);
  d.descriptor.sha256='0'.repeat(64);await call(s,'put',t,'b0',bytes('ação'));assert.equal((await call(s,'describe',t,'b0')).stored,true);s.close();
 });
 await test('hash final divergente, ordinal e duplicatas falham sem confirmar catálogo',async()=>{
  const p=plan(),s=setup(),t=(await call(s,'stage',p.manifest)).ticket;
  await assert.rejects(call(s,'append',t,1,p.list[1]),is('INVALID_ORDINAL'));await call(s,'append',t,0,p.list[0]);
  await assert.rejects(call(s,'append',t,0,{...p.list[0],sha256:'f'.repeat(64)}),is('ORDINAL_CONFLICT'));
  await assert.rejects(call(s,'append',t,1,p.list[0]),is('DUPLICATE_BLOCK'));
  await assert.rejects(call(s,'append',t,1,{...p.list[1],sha256:'f'.repeat(64)}),is('CATALOG_INTEGRITY'));
  assert.equal((await call(s,'snapshot',t)).nextOrdinal,1);await assert.rejects(call(s,'activate',t),is('INCOMPLETE_VERSION'));s.close();
  const bad=plan(['x']),other=setup();bad.manifest.totalBytes+=1;const ticket=(await call(other,'stage',bad.manifest)).ticket;await assert.rejects(call(other,'append',ticket,0,bad.list[0]),is('CATALOG_INTEGRITY'));assert.equal((await call(other,'snapshot',ticket)).nextOrdinal,0);other.close();
 });
 await test('limites e versões conflitantes recusados antes de crescer o catálogo',async()=>{
  const p=plan(),s=setup();await call(s,'stage',p.manifest);
  await assert.rejects(call(s,'stage',{...p.manifest,totalBytes:1}),is('VERSION_CONFLICT'));
  for(const m of [{...p.manifest,blocks:[]},{...p.manifest,blockCount:10001},{...p.manifest,totalBytes:limits.packageBytes+1}])await assert.rejects(call(s,'stage',m),is('INVALID_MANIFEST'));
  const small=addressed.create({indexedDB:new IDBFactory(),limits:{...limits,headerChars:10},digest});await assert.rejects(call(small,'stage',p.manifest),is('HEADER_LIMIT'));small.close();s.close();
 });
 await test('versão anterior preservada durante instalação parcial e após atualização',async()=>{
  const s=setup(),a=plan(['velho']),old=await fill(s,a),p=plan(['novo'],'2'),t=(await call(s,'stage',p.manifest)).ticket;
  await assert.rejects(call(s,'activate',t),is('INCOMPLETE_VERSION'));await call(s,'append',t,0,p.list[0]);await assert.rejects(call(s,'activate',t),is('INCOMPLETE_VERSION'));
  assert.equal((await call(s,'active','pkg')).ticket.token,old.token);await call(s,'put',t,'b0',bytes('novo'));await call(s,'activate',t);
  assert.equal(Buffer.from(await read(s,old,a.list[0])).toString(),'velho');assert.equal(Buffer.from(await read(s,t,p.list[0])).toString(),'novo');s.close();
 });
 await test('quota no catálogo reverte descritor e cursor juntos',async()=>{
  const s=setup(),p=plan(),t=(await call(s,'stage',p.manifest)).ticket,original=IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put=function(v,k){if(this.name==='headers')throw new DOMException('quota','QuotaExceededError');return original.call(this,v,k);};
  try{await assert.rejects(call(s,'append',t,0,p.list[0]),e=>e.name==='QuotaExceededError');}finally{IDBObjectStore.prototype.put=original;}
  assert.equal((await call(s,'snapshot',t)).nextOrdinal,0);await call(s,'append',t,0,p.list[0]);s.close();
 });
 await test('quota em recibo e ativação não produzem versão pronta falsa',async()=>{
  const s=setup(),oldPlan=plan(['old']),old=await fill(s,oldPlan),p=plan(['new'],'2'),t=(await call(s,'stage',p.manifest)).ticket;await call(s,'append',t,0,p.list[0]);
  const original=IDBObjectStore.prototype.put;
  for(const target of ['receipts','active']){
   IDBObjectStore.prototype.put=function(v,k){if(this.name===target)throw new DOMException('quota','QuotaExceededError');return original.call(this,v,k);};
   try{await assert.rejects(target==='receipts'?call(s,'put',t,'b0',bytes('new')):call(s,'activate',t),e=>e.name==='QuotaExceededError');}finally{IDBObjectStore.prototype.put=original;}
   const h=await call(s,'snapshot',t);assert.equal(h.state,'staged');if(target==='receipts'){assert.equal(h.received,0);await call(s,'put',t,'b0',bytes('new'));}
   assert.equal((await call(s,'active','pkg')).ticket.token,old.token);
  }await call(s,'activate',t);s.close();
 });
 await test('duas instâncias não sobrescrevem cursor após hashes concorrentes',async()=>{
  const f=new IDBFactory(),pending=[],hash=(b,cb)=>pending.push(()=>cb(null,sha(b))),a=setup(f,hash),b=setup(f,hash),p=plan(),t=(await call(a,'stage',p.manifest)).ticket;
  const one=call(a,'append',t,0,p.list[0]).then(()=>null,e=>e),two=call(b,'append',t,0,p.list[0]).then(()=>null,e=>e);
  await waitFor(()=>pending.length===2);pending.forEach(fn=>fn());const result=await Promise.all([one,two]);assert.equal(result.filter(x=>x===null).length,1);assert.equal(result.find(Boolean).code,'CATALOG_CONFLICT');assert.equal((await call(a,'snapshot',t)).nextOrdinal,1);a.close();b.close();
 });
 await test('cancelar hash de catálogo e payload mantém BUSY até conclusão física',async()=>{
  let finishHash;const s=setup(new IDBFactory(),(b,cb)=>{finishHash=()=>cb(null,sha(b));}),p=plan(),t=(await call(s,'stage',p.manifest)).ticket;
  for(const kind of ['append','put']){
   finishHash=null;let handle;const operation=new Promise(resolve=>{handle=kind==='append'?s.append(t,0,p.list[0],e=>resolve(e)):s.put(t,'b0',bytes('ação'),e=>resolve(e));});
   await waitFor(()=>finishHash);handle.cancel();await assert.rejects(call(s,'snapshot',t),is('BUSY'));finishHash();assert.equal((await operation).code,'CANCELLED');
   const h=await call(s,'snapshot',t);if(kind==='append'){assert.equal(h.nextOrdinal,0);finishHash=null;const again=call(s,'append',t,0,p.list[0]);await waitFor(()=>finishHash);finishHash();await again;}else assert.equal(h.received,0);
  }s.close();
 });
 await test('cancelar verificação de leitura não libera hash em curso',async()=>{
  const f=new IDBFactory(),writer=setup(f),p=plan(['one']),t=await fill(writer,p);writer.close();let finishHash;
  const s=setup(f,(b,cb)=>{finishHash=()=>cb(null,sha(b));});let handle;const reading=new Promise(resolve=>{handle=s.readVerified(t,'b0',p.list[0],e=>resolve(e));});
  await waitFor(()=>finishHash);handle.cancel();await assert.rejects(call(s,'snapshot',t),is('BUSY'));finishHash();assert.equal((await reading).code,'CANCELLED');s.close();
 });
 await test('dependências prontas obrigatórias e tickets não mutáveis durante a operação',async()=>{
  const f=new IDBFactory(),s=setup(f),p=plan(['dep'],'1','pkg',[{id:'base',version:'1'}]),t=await fill(s,p,false);
  await assert.rejects(call(s,'activate',t),is('DEPENDENCY_UNAVAILABLE'));await fill(s,plan(['base'],'1','base'));await call(s,'activate',t);
  const changed={...t},result=read(s,changed,p.list[0]);changed.token='wrong';assert.equal(Buffer.from(await result).toString(),'dep');await assert.rejects(read(s,changed,p.list[0]),is('STALE_TICKET'));s.close();
 });
 await test('hash divergente, descritor forjado e corrupção nunca viram leitura válida',async()=>{
  const f=new IDBFactory(),s=setup(f),p=plan(['right']),t=await fill(s,p);
  const before=s.stats();await assert.rejects(read(s,t,{...p.list[0],sha256:'0'.repeat(64)}),is('DESCRIPTOR_MISMATCH'));assert.equal(s.stats().payloadReads,before.payloadReads);
  await raw(f,['blocks'],tx=>tx.objectStore('blocks').put(bytes('wrong'),t.key+'/b0'));await assert.rejects(read(s,t,p.list[0]),is('INTEGRITY_FAILED'));s.close();
 });
 await test('consultas por chave não usam catálogo integral em tamanhos distintos',async()=>{
  const getAll=IDBObjectStore.prototype.getAll,cursor=IDBObjectStore.prototype.openCursor;
  IDBObjectStore.prototype.getAll=IDBObjectStore.prototype.openCursor=function(){throw Error('full-catalog-forbidden');};
  try{for(const extra of [40,5000]){
   const f=new IDBFactory(),source=fixture.entries(extra,80),b=builder.build(source),list=Object.keys(b.blocks).sort().map(id=>({id,bytes:Buffer.byteLength(b.blocks[id]),sha256:sha(bytes(b.blocks[id]))})),p=prepare(list,b.blocks,b.manifest.version,b.manifest.packageId);
   let s=setup(f);const t=await fill(s,p);s.close();s=setup(f);
   const reader=await new Promise((ok,no)=>bridge.open({store:s,addressed:true,resources:[{packageId:b.manifest.packageId,version:b.manifest.version,ticket:t}]},(e,v)=>e?no(e):ok(v)));
   assert.equal(reader.stats().descriptors,0);const e=lookup.create({manifests:[b.text],readBlock:reader.readBlock,isCurrent:()=>true,limits:{maxIndexDecodedBytes:8192}});
   const before=s.stats(),out=await new Promise(resolve=>e.lookup(request('carregado',b),resolve));assert.equal(out.complete,true);assert.equal(out.candidates.length,80);
   const after=s.stats();assert.equal(after.metadataReads-before.metadataReads,2*(after.payloadReads-before.payloadReads));
   assert.ok(after.maxMetadataRecordChars<1024);assert.ok(reader.stats().metadataChars<512);
   measurements.push({entries:source.length,descriptors:list.length,openingMetadataReads:before.metadataReads,queryMetadataReads:after.metadataReads-before.metadataReads,queryPayloadReads:after.payloadReads-before.payloadReads,maxMetadataRecordChars:after.maxMetadataRecordChars,retainedHeaderChars:reader.stats().metadataChars,retainedDescriptors:reader.stats().descriptors});
   e.dispose();reader.close();s.close();
  }}finally{IDBObjectStore.prototype.getAll=getAll;IDBObjectStore.prototype.openCursor=cursor;}
 });
 await test('API ausente, limites, ES5 e isolamento do banco publicado',async()=>{
  const s=addressed.create({limits,digest});await assert.rejects(call(s,'stage',plan().manifest),is('STORAGE_UNAVAILABLE'));s.close();await assert.rejects(call(s,'stage',plan().manifest),is('CLOSED'));
  const source=fs.readFileSync(__dirname+'/addressed-store.js','utf8');acorn.parse(source,{ecmaVersion:5});assert.ok(!JSON.stringify(require('../../../build/modules.json')).includes('addressed-store.js'));assert.ok(!source.includes("open('escrevaral-pacotes',"));
 });
 console.log(JSON.stringify({result:'passed',cases,measurements}));
})().catch(e=>{console.error(e);process.exitCode=1;});
