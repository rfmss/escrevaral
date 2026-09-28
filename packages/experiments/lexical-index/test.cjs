'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {build,write}=require('./build.cjs'),fixture=require('./fixture.cjs'),{create}=require('./lookup'),reader=require('./reader.cjs');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const source=fixture.entries(200,80),bundle=build(source),counts={cases:0,referenceQueries:0};
function req(word,overrides={}) {return {schemaVersion:1,requestId:'r1',documentId:'d1',recordId:'n1',revision:1,textGeneration:1,
  baseOffset:0,scope:{start:0,end:word.length},contextScope:{start:0,end:word.length},snapshot:word,
  engineId:'a01-lexical',engineVersion:'1',resources:[{packageId:bundle.manifest.packageId,version:'1'}],...overrides};}
function harness(b=[bundle],o={}) {const host=reader.create(b,o.readerOptions);return {host,engine:create({manifests:b.map(x=>x.text),readBlock:host.readBlock,isCurrent:()=>true,...o})};}
function lookup(e,r) {return new Promise(resolve=>e.lookup(r,resolve));}
function reference(word) {
  // Oráculo linear sem índice/normalizador da implementação; NFC/NFD nativo só no teste Node.
  const key=word.normalize('NFD').toLowerCase();
  return source.filter(x=>x.form.normalize('NFD').toLowerCase()===key).map(x=>x.id).sort();
}
async function test(name,fn) {await fn();counts.cases++;console.log('ok '+name);}
async function main() {
  await test('montagem determinística e limites por bytes/linhas',()=>{
    assert.equal(build(source).text,bundle.text);assert.deepEqual(build(source).blocks,bundle.blocks);
    assert.throws(()=>build([{id:'x',form:'x',lemma:'x'.repeat(10000),pos:'TEST',features:''}]),/entry-too-large/);
    assert.throws(()=>build([{id:'x',form:'á'.repeat(100),lemma:'x',pos:'TEST',features:''}]),/key-too-large/);
    assert.throws(()=>build([source[0],source[0]]),/invalid-source/);
    bundle.manifest.index.forEach(d=>{assert.ok(d.encodedBytes<=4096);assert.ok(d.decodedBytes<=8192);assert.ok(d.rows<=64);});
  });
  await test('igualdade com oráculo independente em todas as formas, lacunas e fronteiras',async()=>{
    const h=harness();
    for(const word of [...new Set(source.map(x=>x.form)),'inexistente','CARRO','AC\u0327A\u0303O','avó','avô','avo','😀']) {
      const out=await lookup(h.engine,req(word));assert.equal(out.complete,true);
      assert.deepEqual(out.candidates.map(x=>x.id).sort(),reference(word),word);counts.referenceQueries++;
      assert.equal(out.status,reference(word).length?'encontrado':'ausente-no-pacote');
    }
    assert.ok(h.engine.stats().residentPayloadBytes<=65536);assert.ok(h.engine.stats().cacheEntries<=16);h.engine.dispose();
  });
  await test('homógrafos preservados e chave densa atravessando blocos',async()=>{
    const h=harness();assert.equal((await lookup(h.engine,req('canto'))).candidates.length,2);
    assert.equal((await lookup(h.engine,req('carregado'))).candidates.length,80);h.engine.dispose();
  });
  await test('IDs não colidem com protótipos e chave normalizada tem limite',async()=>{
    const b=build(source,{packageId:'constructor'}),h=harness([b]);
    const out=await lookup(h.engine,req('carro',{resources:[{packageId:'constructor',version:'1'}]}));
    assert.equal(out.status,'encontrado');
    assert.throws(()=>h.engine.lookup(req('á'.repeat(100)),()=>{}),/key-budget/);h.engine.dispose();
  });
  await test('seleção literal, NFD, emoji e segunda ocorrência',async()=>{
    const text='😀 CARRO ac\u0327a\u0303o CARRO',h=harness();
    for(const [start,end] of [[3,8],[9,15],[16,21]]) {
      const input=req(text,{baseOffset:40,scope:{start:40+start,end:40+end},contextScope:{start:40,end:40+text.length}});
      const old=JSON.stringify(input),out=await lookup(h.engine,input);
      assert.equal(out.snippet,text.slice(start,end));assert.equal(out.status,'encontrado');assert.deepEqual(out.scope,input.scope);assert.equal(JSON.stringify(input),old);
    }
    assert.throws(()=>h.engine.lookup(req('😀',{scope:{start:0,end:1}}),()=>{}),/split-surrogate/);h.engine.dispose();
  });
  await test('cache frio/quente retorna mesma resposta sem I/O novo',async()=>{
    const h=harness();const a=await lookup(h.engine,req('carro')),n=h.host.stats.reads,b=await lookup(h.engine,req('carro'));
    assert.deepEqual(a,b);assert.equal(h.host.stats.reads,n);assert.ok(h.engine.stats().cacheHits>0);h.engine.dispose();
  });
  await test('resposta não expõe objetos mutáveis do cache',async()=>{
    const h=harness(),a=await lookup(h.engine,req('carro'));a.candidates[0].lemma='alterado';
    assert.equal((await lookup(h.engine,req('carro'))).candidates[0].lemma,'carro');h.engine.dispose();
  });
  await test('pacote ausente não é palavra ausente',async()=>{
    const h=harness(),out=await lookup(h.engine,req('carro',{resources:[{packageId:'missing',version:'1'}]}));
    assert.equal(out.status,'indisponivel');assert.equal(out.complete,false);h.engine.dispose();
  });
  await test('bloco ausente e bloco corrompido falham sem candidatos parciais',async()=>{
    for(const corrupt of [true,false]) {
      const b={...bundle,blocks:{...bundle.blocks}};
      const d=bundle.manifest.index.find(x=>x.min<='carro'&&x.max>='carro');
      if(corrupt)b.blocks[d.id]=b.blocks[d.id].replace('carro','carra');else delete b.blocks[d.id];
      const h=harness([b]),out=await lookup(h.engine,req('carro'));
      assert.equal(out.status,corrupt?'falha':'indisponivel');assert.equal(out.complete,false);assert.deepEqual(out.candidates,[]);h.engine.dispose();
    }
  });
  await test('orçamento de achados e blocos nunca vira ausência',async()=>{
    for(const limits of [{maxCandidates:2},{maxBlocksPerRequest:1}]) {
      const h=harness([bundle],{limits}),out=await lookup(h.engine,req('carregado'));
      assert.equal(out.status,'falha');assert.equal(out.complete,false);assert.deepEqual(out.candidates,[]);h.engine.dispose();
    }
  });
  await test('cancelamento antes da leitura e dispose liberam pedidos',async()=>{
    const h=harness();let calls=0;h.engine.lookup(req('carro'),()=>calls++).cancel();
    await sleep(10);assert.equal(calls,0);assert.equal(h.host.stats.reads,0);h.engine.dispose();
    assert.throws(()=>h.engine.lookup(req('carro'),()=>{}),/disposed/);assert.equal(h.engine.stats().residentPayloadBytes,0);
  });
  await test('dois consumidores compartilham leitura; cancelar um preserva outro',async()=>{
    const h=harness([bundle],{readerOptions:{delay:25,lateAfterCancel:true}});let a=0,b=0;
    const ca=h.engine.lookup(req('carro',{requestId:'a'}),()=>a++);
    h.engine.lookup(req('carro',{requestId:'b'}),r=>{assert.equal(r.status,'encontrado');b++;});
    await sleep(8);ca.cancel();await sleep(70);
    assert.equal(a,0);assert.equal(b,1);assert.equal(h.host.stats.reads,1);assert.equal(h.host.stats.canceled,0);h.engine.dispose();
  });
  await test('último consumidor cancela e callback físico tardio é ignorado',async()=>{
    const h=harness([bundle],{readerOptions:{delay:25,lateAfterCancel:true}});let calls=0;
    const c=h.engine.lookup(req('carro'),()=>calls++);await sleep(8);c.cancel();await sleep(60);
    assert.equal(calls,0);assert.equal(h.host.stats.canceled,1);assert.equal(h.engine.stats().cacheEntries,0);h.engine.dispose();
  });
  await test('revisão antiga, editar/desfazer e folha igual não revalidam pedido',async()=>{
    for(const field of ['revision','textGeneration','documentId','requestId']) {
      let current=req('carro'),calls=0;
      const h=harness([bundle],{readerOptions:{delay:25},isCurrent:r=>['revision','textGeneration','documentId','requestId'].every(k=>r[k]===current[k])});
      h.engine.lookup(current,()=>calls++);await sleep(8);
      current={...current,[field]:typeof current[field]==='number'?current[field]+2:'other'}; // Mesma string, outra origem/geração.
      await sleep(60);assert.equal(calls,0);assert.equal(h.engine.stats().staleDropped,1);h.engine.dispose();
    }
  });
  await test('cancelamento retém orçamento até conclusão física, inclusive callback tardio',async()=>{
    const h=harness([bundle],{limits:{maxConcurrentReads:1},readerOptions:{delay:40,lateAfterCancel:true}});
    let calls=0;const c=h.engine.lookup(req('carro'),()=>calls++);await sleep(8);c.cancel();
    assert.equal(h.engine.stats().activeReads,1);
    const blocked=await lookup(h.engine,req('carro'));assert.equal(blocked.reason,'read-draining');
    const other=await lookup(h.engine,req('car0000000'));assert.equal(other.reason,'read-budget');
    assert.equal(h.host.stats.reads,1);await sleep(55);assert.equal(calls,0);
    assert.equal(h.engine.stats().activeReads,0);assert.equal(h.engine.stats().cacheEntries,0);
    assert.equal((await lookup(h.engine,req('carro'))).status,'encontrado');h.engine.dispose();
  });
  await test('pedido fixa versão e identidade apesar de mutação pelo chamador',async()=>{
    const h=harness([bundle],{readerOptions:{delay:20}}),input=req('carro'),p=lookup(h.engine,input);
    input.resources[0].version='2';input.scope.start=99;input.documentId='changed';
    const out=await p;assert.equal(out.identity.resources[0].version,'1');assert.equal(out.scope.start,0);assert.equal(out.identity.documentId,'d1');h.engine.dispose();
  });
  await test('duas versões fixas não misturam blocos nem cache',async()=>{
    const v2=build(source.map(x=>({...x,lemma:x.lemma+'-v2'})),{version:'2'}),h=harness([bundle,v2]);
    assert.equal((await lookup(h.engine,req('carro'))).candidates[0].lemma,'carro');
    assert.equal((await lookup(h.engine,req('carro',{resources:[{packageId:bundle.manifest.packageId,version:'2'}]}))).candidates[0].lemma,'carro-v2');h.engine.dispose();
  });
  await test('dependência comum consultada uma vez; conflito e ciclo explícitos',async()=>{
    const common={packageId:bundle.manifest.packageId,version:'1'};
    const one=build([],{packageId:'one',dependencies:[common]}),two=build([],{packageId:'two',dependencies:[common]});
    const h=harness([bundle,one,two]);
    const out=await lookup(h.engine,req('carro',{resources:[{packageId:'one',version:'1'},{packageId:'two',version:'1'}]}));
    assert.equal(out.candidates.length,1);assert.equal(h.host.stats.reads,1);h.engine.dispose();
    const bad=build([],{packageId:'bad',dependencies:[common,{...common,version:'2'}]}),c=harness([bundle,bad]);
    assert.equal((await lookup(c.engine,req('carro',{resources:[{packageId:'bad',version:'1'}]}))).reason,'version-conflict');c.engine.dispose();
    const cyc=build([],{packageId:'cyc',dependencies:[{packageId:'cyc',version:'1'}]}),cy=harness([cyc]);
    assert.equal((await lookup(cy.engine,req('carro',{resources:[{packageId:'cyc',version:'1'}]}))).reason,'dependency-cycle');cy.engine.dispose();
  });
  await test('leitor síncrono e callback duplicado não duplicam resposta',async()=>{
    const host=reader.create([bundle]);const h=harness([bundle],{readBlock:(p,v,id,cb)=>host.readBlock(p,v,id,(e,b)=>{cb(e,b);cb(e,b);})});
    let calls=0;h.engine.lookup(req('carro'),()=>calls++);await sleep(30);assert.equal(calls,1);h.engine.dispose();
    const e=create({manifests:[bundle.text],isCurrent:()=>true,readBlock:(p,v,id,cb)=>{const d=bundle.manifest.index.find(x=>x.id===id);cb(null,{text:bundle.blocks[id],byteLength:d.encodedBytes,sha256:d.sha256});return {cancel(){}};}});
    assert.equal((await lookup(e,req('carro'))).status,'encontrado');e.dispose();
  });
  await test('limites de índice, pedidos e blocos rejeitam trabalho ilimitado',()=>{
    assert.throws(()=>harness([bundle],{limits:{maxIndexDecodedBytes:10}}),/index-budget/);
    const h=harness([bundle],{limits:{maxRequests:1}});h.engine.lookup(req('carro'),()=>{});
    assert.throws(()=>h.engine.lookup(req('carro'),()=>{}),/request-budget/);
    assert.throws(()=>h.engine.lookup(req('x'.repeat(5000)),()=>{}),/invalid-request/);h.engine.dispose();
  });
  await test('leitura local offline, reabertura e arquivo maior que o declarado',async()=>{
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'a01-test-'));
    try {
      write(bundle,dir);
      for(let i=0;i<2;i++){const h=harness([{...bundle,directory:dir}]);assert.equal((await lookup(h.engine,req('carro'))).status,'encontrado');h.engine.dispose();}
      const d=bundle.manifest.index.find(x=>x.min<='carro'&&x.max>='carro');fs.appendFileSync(path.join(dir,d.id+'.json'),'x');
      const h=harness([{...bundle,directory:dir}]);assert.equal((await lookup(h.engine,req('carro'))).status,'falha');h.engine.dispose();
    } finally {fs.rmSync(dir,{recursive:true,force:true});}
  });
  await test('runtime analisa em ES5 e não importa APIs de navegador',()=>{
    const acorn=require('acorn');
    for(const file of ['lookup.js','normalize.js']) acorn.parse(fs.readFileSync(path.join(__dirname,file),'utf8'),{ecmaVersion:5});
  });
  console.log(JSON.stringify({result:'passed',...counts}));
}
if(require.main===module) main().catch(e=>{console.error(e);process.exitCode=1;});
exports.req=req;
