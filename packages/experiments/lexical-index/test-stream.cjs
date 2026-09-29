'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const stream=require('./build-stream.cjs'),reference=require('./build-paged.cjs'),fixture=require('./fixture.cjs'),reader=require('./reader.cjs'),{create}=require('./lookup');
const source=fixture.entries(41,12).reverse(),options={source:stream.fixtureSource,version:'2-paged'};
let cases=0,queries=0,filesCompared=0;
async function test(name,fn){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'a01-stream-test-'));
  try{await fn(dir);cases++;console.log('ok '+name);}finally{fs.rmSync(dir,{recursive:true,force:true});}}
function input(dir,rows=source){const file=path.join(dir,'source.jsonl');fs.writeFileSync(file,rows.map(r=>JSON.stringify(r)+'\n').join(''));return file;}
function compare(result,out,expected){
  assert.deepEqual(fs.readdirSync(out).sort(),['manifest.json',...Object.keys(expected.blocks).map(id=>id+'.json')].sort());
  for(const [id,text] of Object.entries(expected.blocks)){assert.equal(fs.readFileSync(path.join(out,id+'.json'),'utf8'),text,id);filesCompared++;}
  const actual=JSON.parse(result.text);actual.source.converterVersion=expected.manifest.source.converterVersion;
  assert.deepEqual(actual,expected.manifest);assert.equal(fs.readFileSync(path.join(out,'manifest.json'),'utf8'),result.text+'\n');
}
async function main(){
  await test('gerador incremental produz a mesma fixture',()=>{assert.deepEqual([...fixture.iterate(100,80)],fixture.entries(100,80));});
  await test('saída equivalente byte a byte, independente das corridas de ordenação',dir=>{
    const file=input(dir);const expected=reference.build(source,{version:'2-paged'});
    for(const budgets of [{},{sortRows:3,sortBytes:1024,fanIn:2}]){
      const out=path.join(dir,budgets.fanIn?'small':'default'),result=stream.convert(file,out,{...options,budgets});compare(result,out,expected);
      assert.ok(result.stats.maxRunBytes<=(budgets.sortBytes||262144));assert.ok(result.stats.maxRunRows<=(budgets.sortRows||2048));
      assert.ok(result.stats.maxMergeReaders<=(budgets.fanIn||8));assert.equal(result.stats.tempBytes,0);
      if(budgets.fanIn)assert.ok(result.stats.mergePasses>=4);
    }assert.deepEqual(fs.readdirSync(dir).sort(),['default','small','source.jsonl']);
  });
  await test('páginas densas e várias camadas mantêm bytes do conversor anterior',dir=>{
    const rows=fixture.entries(100,80),file=input(dir,rows),out=path.join(dir,'out'),limits={maxRows:4};
    const result=stream.convert(file,out,{...options,limits,budgets:{sortRows:7,fanIn:2}});compare(result,out,reference.build(rows,{version:'2-paged',limits}));assert.ok(result.stats.depth>=3);
  });
  await test('duplicatas distantes e em chaves diferentes são rejeitadas',dir=>{
    for(const sameForm of [true,false]){const rows=[...source,{...source[0],form:sameForm?source[0].form:'zzzz'}],file=input(dir,rows),out=path.join(dir,'out');
      assert.throws(()=>stream.convert(file,out,{...options,budgets:{sortRows:2,fanIn:2}}),/duplicate-id/);assert.ok(!fs.existsSync(out));}
    assert.deepEqual(fs.readdirSync(dir),['source.jsonl']);
  });
  await test('entrada vazia e última linha sem LF são suportadas',dir=>{
    const empty=input(dir,[]),out=path.join(dir,'empty'),r=stream.convert(empty,out,options);compare(r,out,reference.build([],{version:'2-paged'}));
    fs.writeFileSync(empty,JSON.stringify(source[0]));const last=path.join(dir,'last'),s=stream.convert(empty,last,options);compare(s,last,reference.build([source[0]],{version:'2-paged'}));
  });
  await test('UTF-8 válido dividido entre buffers preserva texto e hash de fonte',dir=>{
    const a={id:'a',form:'carro',lemma:'carro',pos:'TEST',features:''},b={id:'b',form:'é',lemma:'é',pos:'TEST',features:''};
    const first=JSON.stringify(a)+'\n',second=JSON.stringify(b),padding=4095-Buffer.byteLength(first)-second.indexOf('é');
    const file=path.join(dir,'source.jsonl');fs.writeFileSync(file,first+' '.repeat(padding)+second);const out=path.join(dir,'out');
    const r=stream.convert(file,out,{...options,budgets:{lineBytes:8192}});compare(r,out,reference.build([a,b],{version:'2-paged'}));
  });
  await test('linha excessiva, UTF-8 inválido e JSON quebrado falham sem saída parcial',dir=>{
    for(const [bytes,pattern] of [[Buffer.from('x'.repeat(5000)),/line-budget/],[Buffer.from([0xc3,0x28]),/invalid-utf8/],[Buffer.from('{'),/JSON|Unexpected|property/i]]){
      const file=path.join(dir,'source.jsonl');fs.writeFileSync(file,bytes);const out=path.join(dir,'out');assert.throws(()=>stream.convert(file,out,options),pattern);assert.ok(!fs.existsSync(out));
    }
  });
  await test('orçamentos de disco falham com limpeza e não sobrescrevem saída existente',dir=>{
    const file=input(dir);for(const budgets of [{maxTempBytes:64},{maxOutputBytes:1}]){
      const out=path.join(dir,'out');assert.throws(()=>stream.convert(file,out,{...options,budgets}),/temp-budget|output-budget/);assert.ok(!fs.existsSync(out));}
    const out=path.join(dir,'existing');fs.mkdirSync(out);fs.writeFileSync(path.join(out,'keep'),'keep');assert.throws(()=>stream.convert(file,out,options),/EEXIST/);
    assert.equal(fs.readFileSync(path.join(out,'keep'),'utf8'),'keep');assert.deepEqual(fs.readdirSync(dir).sort(),['existing','source.jsonl']);
  });
  await test('falha física durante escrita limpa apenas diretório criado pelo conversor',dir=>{
    const file=input(dir),out=path.join(dir,'out'),open=fs.openSync,write=fs.writeSync,close=fs.closeSync,files=new Map();let interrupted=false;
    fs.openSync=function(name,...args){const fd=open(name,...args);files.set(fd,String(name));return fd;};
    fs.closeSync=function(fd){files.delete(fd);return close(fd);};
    fs.writeSync=function(fd,...args){if((files.get(fd)||'').startsWith(out+path.sep+'b')){assert.ok(!fs.existsSync(path.join(out,'manifest.json')));interrupted=true;throw Error('SIMULATED_ENOSPC');}return write(fd,...args);};
    try{assert.throws(()=>stream.convert(file,out,options),/SIMULATED_ENOSPC/);}finally{fs.openSync=open;fs.writeSync=write;fs.closeSync=close;}
    assert.equal(interrupted,true);assert.equal(files.size,0);assert.deepEqual(fs.readdirSync(dir),['source.jsonl']);
  });
  await test('procedência obrigatória e registros fora do esquema não recebem licença inventada',dir=>{
    const file=input(dir),out=path.join(dir,'out');assert.throws(()=>stream.convert(file,out),/source-required/);assert.ok(!fs.existsSync(out));
    input(dir,[{...source[0],extra:'rejeitar'}]);assert.throws(()=>stream.convert(file,out,options),/invalid-source/);assert.ok(!fs.existsSync(out));
    assert.throws(()=>stream.convert(file,out,{...options,budgets:{fanIn:1}}),/invalid-fanout/);
    assert.throws(()=>stream.convert(file,out,{...options,coverage:'x'.repeat(2049)}),/invalid-coverage/);
    assert.throws(()=>stream.convert(file,out,{...options,dependencies:Array(9).fill({packageId:'x',version:'1'})}),/invalid-dependencies/);
    input(dir,[{...source[0],form:'á'.repeat(100)}]);assert.throws(()=>stream.convert(file,out,options),/key-too-large/);assert.ok(!fs.existsSync(out));
    input(dir,[{...source[0],lemma:'x'.repeat(5000)}]);assert.throws(()=>stream.convert(file,out,{...options,budgets:{lineBytes:8192}}),/entry-too-large/);assert.ok(!fs.existsSync(out));
  });
  await test('consulta local dos arquivos gerados equivale ao oráculo independente',async dir=>{
    const out=path.join(dir,'out'),r=stream.convert(input(dir),out,options),host=reader.create([{manifest:r.manifest,directory:out}]);
    const e=create({manifests:[r.text],readBlock:host.readBlock,isCurrent:()=>true,limits:{maxIndexDecodedBytes:8192}});
    for(const word of [...new Set(source.map(x=>x.form)),'CARRO','AC\u0327A\u0303O','ausente','😀']){
      const request={schemaVersion:1,requestId:'q1',documentId:'d1',recordId:'n1',revision:1,textGeneration:1,engineId:'a01',engineVersion:'1',
        snapshot:word,baseOffset:0,scope:{start:0,end:word.length},contextScope:{start:0,end:word.length},resources:[{packageId:r.manifest.packageId,version:r.manifest.version}]};
      const result=await new Promise(resolve=>e.lookup(request,resolve));assert.equal(result.complete,true);
      const expected=source.filter(row=>row.form.normalize('NFD').toLowerCase()===word.normalize('NFD').toLowerCase()).map(row=>row.id).sort();
      assert.deepEqual(result.candidates.map(row=>row.id).sort(),expected);queries++;
    }e.dispose();
  });
  console.log(JSON.stringify({result:'passed',cases,queries,filesCompared}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
