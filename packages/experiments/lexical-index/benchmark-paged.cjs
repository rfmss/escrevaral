'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process'),{performance}=require('node:perf_hooks');
function memory(){const m=process.memoryUsage();return {heapUsed:m.heapUsed,rss:m.rss,external:m.external,arrayBuffers:m.arrayBuffers};}
function summary(values){const a=values.slice().sort((a,b)=>a-b);return {n:a.length,min:a[0],median:a[Math.floor(a.length/2)],max:a[a.length-1]};}
function child(mode,dir,count,word){const r=spawnSync(process.execPath,['--expose-gc',__filename,mode,dir,String(count),word||''],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr||r.stdout);return JSON.parse(r.stdout);}
async function main(){
  const [mode,dir,count,word]=process.argv.slice(2);
  if(mode==='build'){
    const {build,write}=require('./build-paged.cjs'),source=require('./fixture.cjs').entries(Number(count),80);
    const before=memory(),t=performance.now(),b=build(source),conversionMs=performance.now()-t;write(b,dir);
    const pages=Object.entries(b.blocks).filter(([id])=>id[0]==='p'),data=Object.entries(b.blocks).filter(([id])=>id[0]==='b');
    // Estimativa concreta do envelope plano A02 atual, sem instalar nem alterar seu contrato.
    const digest=s=>require('node:crypto').createHash('sha256').update(s).digest('hex');
    const envelope=JSON.stringify({schema:'scrvrl.package-stage',schemaVersion:1,id:b.manifest.packageId,version:b.manifest.version,dependencies:[],
      blocks:Object.entries(b.blocks).map(([id,s])=>({id,bytes:Buffer.byteLength(s),sha256:digest(s)}))});
    console.log(JSON.stringify({rows:source.length,conversionMs,conversionAndWriteMs:performance.now()-t,rootEncodedBytes:Buffer.byteLength(b.text),rootDecodedStringBytes:b.text.length*2,
      flatIndexEncodedBytes:b.buildStats.flatIndexEncodedBytes,depth:b.buildStats.depth,indexPages:pages.length,dataBlocks:data.length,
      a02FlatEnvelopeEncodedBytes:Buffer.byteLength(envelope),a02FlatEnvelopeChars:envelope.length,
      pageEncodedBytes:pages.reduce((n,[,s])=>n+Buffer.byteLength(s),0),dataEncodedBytes:data.reduce((n,[,s])=>n+Buffer.byteLength(s),0),
      memoryBeforeConversion:before,memoryAfterWrite:memory(),processPeakRssKiB:process.resourceUsage().maxRSS}));return;
  }
  if(mode==='query'){
    const {create}=require('./lookup'),reader=require('./reader.cjs');global.gc();const baseline=memory();let peak={...baseline};
    function sample(){const m=memory();Object.keys(m).forEach(k=>{peak[k]=Math.max(peak[k],m[k]);});}
    const timer=setInterval(sample,1),t=performance.now(),text=fs.readFileSync(path.join(dir,'manifest.json'),'utf8').trimEnd(),manifest=JSON.parse(text),loadRootMs=performance.now()-t;
    const cold=[],warm=[],init=[],observations=[];let firstEngineAfterGc,firstWarmAfterGc;
    for(let i=0;i<7;i++){
      const host=reader.create([{manifest,directory:dir}]),t0=performance.now();
      const e=create({manifests:[text],readBlock:host.readBlock,isCurrent:()=>true,now:()=>performance.now(),limits:{maxIndexDecodedBytes:8192}});init.push(performance.now()-t0);
      if(i===0){global.gc();firstEngineAfterGc=memory();}sample();
      const query=id=>new Promise(resolve=>e.lookup({schemaVersion:1,requestId:id,documentId:'d1',recordId:'r1',revision:1,textGeneration:1,engineId:'a01',engineVersion:'1',
        snapshot:word,baseOffset:0,scope:{start:0,end:word.length},contextScope:{start:0,end:word.length},resources:[{packageId:manifest.packageId,version:manifest.version}]},resolve));
      const a=performance.now(),first=await query('cold');cold.push(performance.now()-a);const coldStats=e.stats(),coldHost={...host.stats};
      const b=performance.now(),second=await query('warm');warm.push(performance.now()-b);
      assert.equal(first.complete,true);assert.deepEqual(first.candidates,second.candidates);assert.equal(first.candidates.length,word==='carregado'?80:word==='zzzz-ausente'?0:1);
      assert.equal(host.stats.reads,coldHost.reads);assert.ok(e.stats().residentPayloadBytes<=65536);sample();
      if(i===0){global.gc();firstWarmAfterGc=memory();}
      observations.push({cold:coldStats,warm:e.stats(),host:coldHost});e.dispose();sample();
    }
    clearInterval(timer);global.gc();const first=observations[0];
    console.log(JSON.stringify({word,iterations:7,loadRootMs,initMs:summary(init),coldWallMs:summary(cold),warmWallMs:summary(warm),
      indexPagesPerCold:first.cold.indexReads,dataBlocksPerCold:first.cold.dataReads,indexEncodedBytesPerCold:first.cold.indexBytesRead,dataEncodedBytesPerCold:first.cold.dataBytesRead,
      retainedPayloadBytes:first.warm.residentPayloadBytes,rootStringBytes:first.warm.indexStringBytes,
      coldReadMs:summary(observations.map(x=>x.host.readMs)),coldVerifyMs:summary(observations.map(x=>x.host.verifyMs)),
      coldDecodeMs:summary(observations.map(x=>x.cold.decodeMs)),warmDecodeMs:summary(observations.map(x=>x.warm.decodeMs-x.cold.decodeMs)),
      coldSearchMs:summary(observations.map(x=>x.cold.searchMs)),warmSearchMs:summary(observations.map(x=>x.warm.searchMs-x.cold.searchMs)),
      sliceOverruns:observations.reduce((n,x)=>n+x.warm.sliceOverruns,0),memory:{baseline,firstEngineAfterGc,firstWarmAfterGc,sampledPeak:peak,afterDisposeAndGc:memory(),processPeakRssKiB:process.resourceUsage().maxRSS}}));return;
  }
  const report={schemaVersion:1,measuredAt:new Date().toISOString(),environment:{node:process.version,platform:process.platform,arch:process.arch,cpu:os.cpus()[0]?.model},
    method:{source:'own fixture; 80 artificial same-key alternatives; no external data',isolation:'conversion and each query scenario in separate processes; 7 cold/warm pairs; GC before retained samples',
      cold:'engine cache empty; OS filesystem cache not cleared',time:'performance.now milliseconds; wall includes timers; decode includes validation, twice on cold reads',
      memory:'process bytes sampled each 1 ms and explicit points, may miss transients; maxRSS KiB high-water process-wide, not engine-only',
      budgets:'8 KiB aggregate root strings before parse; 4 KiB encoded pages/data; 64 KiB shared retained payload strings; actual object/VM memory measured separately',
      comparison:'flat index byte count from same conversion; historical A01 timings are not a controlled speed comparison; conversion still holds entire source/blocks in RAM'},datasets:[]};
  for(const n of [10000,100000]){
    const temp=fs.mkdtempSync(path.join(os.tmpdir(),'a01-paged-bench-'));
    try{report.datasets.push({artificialRows:n,conversion:child('build',temp,n),queries:['CARRO','carregado','zzzz-ausente'].map(w=>child('query',temp,n,w))});}
    finally{fs.rmSync(temp,{recursive:true,force:true});}
  }
  console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
