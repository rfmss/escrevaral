'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),v8=require('node:v8'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process'),{performance}=require('node:perf_hooks'),stream=require('./build-stream.cjs');
function memory(){const m=process.memoryUsage();return {heapUsed:m.heapUsed,rss:m.rss,external:m.external,arrayBuffers:m.arrayBuffers};}
function child(mode,input,out){const r=spawnSync(process.execPath,['--max-old-space-size=32','--max-semi-space-size=1','--expose-gc',__filename,mode,input,out],{encoding:'utf8'});
  if(r.status!==0)throw Error((r.stderr||r.stdout)+' exit='+r.status+' signal='+r.signal);return JSON.parse(r.stdout);}
async function main(){
  const [mode,input,out]=process.argv.slice(2);
  if(mode==='convert'){
    global.gc();const before=memory(),peak={...before};let checkpoints=0;
    function sample(){const m=memory();checkpoints++;Object.keys(m).forEach(k=>{peak[k]=Math.max(peak[k],m[k]);});}
    const started=performance.now(),result=stream.convert(input,out,{source:stream.fixtureSource,onCheckpoint:sample}),conversionMs=performance.now()-started;
    sample();global.gc();console.log(JSON.stringify({conversionMs,rootEncodedBytes:Buffer.byteLength(result.text),rootDecodedStringBytes:result.text.length*2,
      sourceSha256:result.manifest.source.sha256,stats:result.stats,memory:{before,sampledPeak:peak,afterGc:memory(),checkpoints,processPeakRssKiB:process.resourceUsage().maxRSS,v8HeapSizeLimit:v8.getHeapStatistics().heap_size_limit}}));return;
  }
  if(mode==='query'){
    const text=fs.readFileSync(path.join(out,'manifest.json'),'utf8').trimEnd(),manifest=JSON.parse(text),reader=require('./reader.cjs'),{create}=require('./lookup');
    const results=[];
    for(const word of ['CARRO','carregado','zzzz-ausente']){
      const host=reader.create([{manifest,directory:out}]),e=create({manifests:[text],readBlock:host.readBlock,isCurrent:()=>true,now:()=>performance.now(),limits:{maxIndexDecodedBytes:8192}});
      function lookup(id){return new Promise(resolve=>e.lookup({schemaVersion:1,requestId:id,documentId:'d1',recordId:'n1',revision:1,textGeneration:1,engineId:'a01',engineVersion:'1',
        snapshot:word,baseOffset:0,scope:{start:0,end:word.length},contextScope:{start:0,end:word.length},resources:[{packageId:manifest.packageId,version:manifest.version}]},resolve));}
      const t=performance.now(),first=await lookup('cold'),coldWallMs=performance.now()-t,stats=e.stats(),w=performance.now(),second=await lookup('warm'),warmWallMs=performance.now()-w;
      assert.equal(first.complete,true);assert.equal(first.candidates.length,word==='carregado'?80:word==='CARRO'?1:0);assert.deepEqual(first.candidates,second.candidates);assert.equal(e.stats().reads,stats.reads);
      results.push({word,candidates:first.candidates.length,coldWallMs,warmWallMs,coldStats:stats,warmStats:e.stats()});e.dispose();
    }console.log(JSON.stringify({reopenedInSeparateProcess:true,results}));return;
  }
  const report={schemaVersion:1,measuredAt:new Date().toISOString(),environment:{node:process.version,platform:process.platform,arch:process.arch,cpu:os.cpus()[0]?.model},
    method:{source:'own artificial fixture streamed to NDJSON in parent; converter/query in separate child processes',heapFlags:['--max-old-space-size=32','--max-semi-space-size=1'],
      memory:'process.memoryUsage at bounded run checkpoints and each 2048 writes; synchronous work means timer sampling would not run; samples may miss transient peaks',
      rss:'process.resourceUsage.maxRSS in KiB is full process high water; V8 flags do not cap RSS or all native allocations',
      disk:'peakTempBytes covers generated runs/descriptors; source and final output counted separately; no filesystem metadata or journal overhead',
      precision:'one conversion per size and one cold/warm pair per query; observations, not timing guarantees or statistically controlled speed comparisons',
      limits:'256 KiB encoded run payload, 2048 rows, eight merge readers, 4 KiB line/IO buffer; JS object/VM overhead measured, not covered by payload counter'},datasets:[]};
  for(const n of [10000,400000]){
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'a01-stream-bench-')),file=path.join(dir,'source.jsonl'),output=path.join(dir,'package');
    try{const t=performance.now();stream.writeFixture(file,n,80);const generationMs=performance.now()-t,sourceBytes=fs.statSync(file).size;
      report.datasets.push({artificialRows:n,sourceBytes,generationMs,conversion:child('convert',file,output),lookup:child('query',file,output)});
    }finally{fs.rmSync(dir,{recursive:true,force:true});}
  }
  console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
