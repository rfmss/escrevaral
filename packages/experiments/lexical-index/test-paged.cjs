'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {build,write}=require('./build-paged.cjs'),flat=require('./build.cjs'),fixture=require('./fixture.cjs'),reader=require('./reader.cjs'),{create}=require('./lookup');
const source=fixture.entries(200,80),bundle=build(source,{limits:{maxRows:4}});
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let cases=0,referenceQueries=0;
function req(word,b=bundle,id='r1'){return {schemaVersion:1,requestId:id,documentId:'d1',recordId:'n1',revision:1,textGeneration:1,
  baseOffset:0,snapshot:word,scope:{start:0,end:word.length},contextScope:{start:0,end:word.length},engineId:'a01',engineVersion:'1',
  resources:[{packageId:b.manifest.packageId,version:b.manifest.version}]};}
function harness(b=bundle,o={}){const host=reader.create([b],o.readerOptions);return {host,engine:create({manifests:[b.text],readBlock:host.readBlock,isCurrent:()=>true,...o})};}
function lookup(e,word,b=bundle){return new Promise(resolve=>e.lookup(req(word,b),resolve));}
const oracle=word=>source.filter(r=>r.form.normalize('NFD').toLowerCase()===word.normalize('NFD').toLowerCase()).map(r=>r.id).sort();
async function test(name,fn){await fn();cases++;console.log('ok '+name);}
async function main(){
  await test('árvore determinística, hash/limites em todas as páginas e dados',()=>{
    const again=build(source,{limits:{maxRows:4}});assert.equal(again.text,bundle.text);assert.deepEqual(again.blocks,bundle.blocks);
    assert.ok(bundle.buildStats.depth>=3);assert.equal(bundle.manifest.index,undefined);assert.ok(bundle.text.length*2<8192);
    const seen=new Set(),ids=[];
    function walk(d){assert.ok(!seen.has(d.id));seen.add(d.id);const text=bundle.blocks[d.id];assert.equal(hash(text),d.sha256);
      assert.equal(Buffer.byteLength(text),d.encodedBytes);assert.equal(text.length*2,d.decodedBytes);assert.ok(d.encodedBytes<=4096);assert.ok(d.decodedBytes<=8192);
      const rows=JSON.parse(text);assert.equal(rows.length,d.rows);assert.ok(rows.length<=4);
      if(d.kind==='index')rows.forEach(c=>{assert.equal(c.level,d.level-1);walk(c);});else rows.forEach(r=>ids.push(r.id));}
    walk(bundle.manifest.root);assert.deepEqual(ids.sort(),source.map(r=>r.id).sort());assert.equal(seen.size,Object.keys(bundle.blocks).length);
    assert.throws(()=>build(source,{limits:{maxRows:1}}),/index-fanout/);
  });
  await test('equivalência entre índice paginado, plano e referência independente',async()=>{
    const h=harness(),b=flat.build(source),f=harness(b);
    for(const word of [...new Set(source.map(r=>r.form)),'inexistente','CARRO','AC\u0327A\u0303O','avo','😀','car0000000x']){
      const out=await lookup(h.engine,word),old=await lookup(f.engine,word,b),expected=oracle(word);
      assert.equal(out.complete,true);assert.equal(out.status,expected.length?'encontrado':'ausente-no-pacote');
      assert.deepEqual(out.candidates.map(r=>r.id).sort(),expected,word);assert.deepEqual(old.candidates.map(r=>r.id).sort(),expected);referenceQueries++;
    }h.engine.dispose();f.engine.dispose();
  });
  await test('chave densa cruza páginas e orçamento insuficiente não significa ausência',async()=>{
    const h=harness(),out=await lookup(h.engine,'carregado');assert.equal(out.candidates.length,80);assert.ok(h.engine.stats().indexReads>3);h.engine.dispose();
    for(const limits of [{maxIndexPagesPerRequest:1},{maxBlocksPerRequest:1},{maxCandidates:2}]){
      const a=harness(bundle,{limits}),r=await lookup(a.engine,'carregado');assert.equal(r.status,'falha');assert.equal(r.complete,false);assert.deepEqual(r.candidates,[]);a.engine.dispose();
    }
  });
  await test('cache quente e cache mínimo preservam equivalência',async()=>{
    const h=harness();const a=await lookup(h.engine,'CARRO'),reads=h.host.stats.reads,b=await lookup(h.engine,'CARRO');
    assert.deepEqual(a,b);assert.equal(h.host.stats.reads,reads);h.engine.dispose();
    const tiny=harness(bundle,{limits:{maxCachePayloadBytes:64,maxCacheEntries:1}});
    assert.equal((await lookup(tiny.engine,'carregado')).candidates.length,80);assert.ok(tiny.engine.stats().residentPayloadBytes<=64);tiny.engine.dispose();
  });
  await test('página ausente e corrupção não viram ausência lexical',async()=>{
    for(const missing of [true,false]){const b={...bundle,blocks:{...bundle.blocks}},id=b.manifest.root.id;
      if(missing)delete b.blocks[id];else b.blocks[id]+=' ';
      const h=harness(b),r=await lookup(h.engine,'carro',b);assert.equal(r.complete,false);assert.equal(r.status,missing?'indisponivel':'falha');h.engine.dispose();}
  });
  await test('página íntegra porém estruturalmente inválida é recusada',async()=>{
    for(const kind of ['level','range','duplicate']){
      const b={...bundle,manifest:JSON.parse(bundle.text),blocks:{...bundle.blocks}},root=b.manifest.root;
      const rows=JSON.parse(b.blocks[root.id]);
      if(kind==='level')rows[0].level=root.level;
      if(kind==='range')rows[0].min='';
      if(kind==='duplicate')rows[1].id=rows[0].id;
      const text=JSON.stringify(rows);b.blocks[root.id]=text;root.sha256=hash(text);root.encodedBytes=Buffer.byteLength(text);root.decodedBytes=text.length*2;b.text=JSON.stringify(b.manifest);
      const h=harness(b),r=await lookup(h.engine,'carro',b);assert.equal(r.status,'falha');assert.equal(r.complete,false);h.engine.dispose();
    }
  });
  await test('catálogo vazio, raiz/profundidade e rejeição antes de parse',async()=>{
    const b=build([]),h=harness(b);assert.equal((await lookup(h.engine,'carro',b)).status,'ausente-no-pacote');assert.equal(h.host.stats.reads,0);h.engine.dispose();
    assert.throws(()=>harness(bundle,{limits:{maxRootDecodedBytes:10}}),/root-budget/);
    assert.throws(()=>harness(bundle,{limits:{maxIndexDepth:1}}),/invalid-index-descriptor/);
    assert.throws(()=>create({manifests:['x'.repeat(5000)],limits:{maxIndexDecodedBytes:8192},readBlock(){},isCurrent(){}}),/index-budget/);
  });
  await test('página compartilhada, cancelamento de um consumidor e identidade antiga',async()=>{
    const host=reader.create([bundle]);let doneRoot,rootReads=0,old=true,callsA=0;
    const e=create({manifests:[bundle.text],isCurrent:r=>r.requestId!=='a'||old,
      readBlock:(p,v,id,done,d)=>{if(id===bundle.manifest.root.id){rootReads++;doneRoot=()=>host.readBlock(p,v,id,done,d);return {cancel(){}};}return host.readBlock(p,v,id,done,d);}});
    const a=e.lookup(req('carro',bundle,'a'),()=>callsA++),b=new Promise(resolve=>e.lookup(req('carro',bundle,'b'),resolve));
    await sleep(10);a.cancel();old=false;doneRoot();assert.equal((await b).status,'encontrado');assert.equal(rootReads,1);assert.equal(callsA,0);e.dispose();
    let current=true,calls=0;const h=harness(bundle,{readerOptions:{delay:25},isCurrent:()=>current});h.engine.lookup(req('carro'),()=>calls++);
    await sleep(8);current=false;await sleep(50);assert.equal(calls,0);assert.equal(h.engine.stats().staleDropped,1);h.engine.dispose();
  });
  await test('leitura local sem catálogo plano e reabertura offline',async()=>{
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'a01-paged-test-'));
    try{write(bundle,dir);for(let i=0;i<2;i++){const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
      const b={manifest,text:JSON.stringify(manifest),directory:dir},h=harness(b);assert.equal((await lookup(h.engine,'carregado',b)).candidates.length,80);h.engine.dispose();}}
    finally{fs.rmSync(dir,{recursive:true,force:true});}
  });
  console.log(JSON.stringify({result:'passed',cases,referenceQueries,depth:bundle.buildStats.depth}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
