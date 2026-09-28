'use strict';
// Ferramenta Node de medição, separada do runtime ES5 e do aplicativo.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawnSync}=require('node:child_process'),{performance}=require('node:perf_hooks');
const assert=require('node:assert/strict');
const memory=()=>{const m=process.memoryUsage();return {heapUsed:m.heapUsed,rss:m.rss,external:m.external,arrayBuffers:m.arrayBuffers};};
const hash=s=>require('node:crypto').createHash('sha256').update(s).digest('hex');
function summarize(values){const a=values.slice().sort((a,b)=>a-b);return {n:a.length,min:a[0],median:a[Math.floor(a.length/2)],p95:a[Math.ceil(a.length*.95)-1],max:a[a.length-1]};}
function worker(mode,dir,count,word){
  const r=spawnSync(process.execPath,['--expose-gc',__filename,mode,dir,String(count),word||''],{encoding:'utf8'});
  if(r.status!==0) throw Error(r.stderr||r.stdout);return JSON.parse(r.stdout);
}
async function main(){
  const [mode,dir,count,word]=process.argv.slice(2);
  if(mode==='convert'){
    const {build,write}=require('./build.cjs'),fixture=require('./fixture.cjs');
    global.gc();const before=memory(),t=performance.now(),source=fixture.entries(Number(count),80);
    const b=build(source),conversionMs=performance.now()-t;write(b,dir);
    console.log(JSON.stringify({rows:source.length,conversionMs,conversionAndWriteMs:performance.now()-t,
      sourceJsonBytes:Buffer.byteLength(JSON.stringify(source)),indexEncodedBytes:Buffer.byteLength(b.text),indexDecodedStringBytes:b.text.length*2,
      indexSha256:hash(b.text),blockCount:b.manifest.index.length,blockEncodedBytes:b.manifest.index.reduce((s,d)=>s+d.encodedBytes,0),
      maxBlockEncodedBytes:Math.max(...b.manifest.index.map(d=>d.encodedBytes)),maxBlockDecodedStringBytes:Math.max(...b.manifest.index.map(d=>d.decodedBytes)),
      memoryBefore:before,memoryAfter:memory(),processPeakRssKiB:process.resourceUsage().maxRSS}));return;
  }
  if(mode==='query'){
    const {create}=require('./lookup'),reader=require('./reader.cjs');
    global.gc();const baseline=memory();let peak={...baseline};
    function sample(){const m=memory();for(const k of Object.keys(m)) peak[k]=Math.max(peak[k],m[k]);}
    const sampler=setInterval(sample,1),t=performance.now();
    const text=fs.readFileSync(path.join(dir,'manifest.json'),'utf8').trimEnd(),manifest=JSON.parse(text);
    const loadManifestMs=performance.now()-t;
    const cold=[],warm=[],init=[],observations=[];let memoryFirstEngine=null,retainedAfterQuery=null;
    for(let i=0;i<15;i++){
      const host=reader.create([{manifest,directory:dir}]);const start=performance.now();
      const e=create({manifests:[text],readBlock:host.readBlock,isCurrent:()=>true,now:()=>performance.now()});init.push(performance.now()-start);
      if(i===0){global.gc();memoryFirstEngine=memory();}sample();
      function query(requestId){return new Promise(resolve=>e.lookup({schemaVersion:1,requestId,documentId:'d1',recordId:'r1',revision:1,textGeneration:1,
        snapshot:word,baseOffset:0,scope:{start:0,end:word.length},contextScope:{start:0,end:word.length},engineId:'a01',engineVersion:'1',
        resources:[{packageId:manifest.packageId,version:manifest.version}]},resolve));}
      const a=performance.now(),first=await query('cold');cold.push(performance.now()-a);
      const cstats=e.stats(),hstats={...host.stats},b=performance.now(),second=await query('warm');warm.push(performance.now()-b);
      assert.equal(first.complete,true);assert.equal(first.status,word==='zzzz-ausente'?'ausente-no-pacote':'encontrado');
      assert.equal(first.candidates.length,word==='carregado'?80:word==='zzzz-ausente'?0:1);
      assert.deepEqual(first.candidates,second.candidates);assert.equal(host.stats.reads,hstats.reads);
      sample();if(i===0){global.gc();retainedAfterQuery=memory();}
      observations.push({cold:cstats,warm:e.stats(),host:hstats});e.dispose();sample();
    }
    clearInterval(sampler);global.gc();
    console.log(JSON.stringify({word,iterations:15,loadManifestMs,engineInitMs:summarize(init),coldWallMs:summarize(cold),warmWallMs:summarize(warm),
      coldReadMs:summarize(observations.map(x=>x.host.readMs)),coldVerifyMs:summarize(observations.map(x=>x.host.verifyMs)),
      coldDecodeMs:summarize(observations.map(x=>x.cold.decodeMs)),warmDecodeMs:summarize(observations.map(x=>x.warm.decodeMs-x.cold.decodeMs)),
      coldSearchMs:summarize(observations.map(x=>x.cold.searchMs)),warmSearchMs:summarize(observations.map(x=>x.warm.searchMs-x.cold.searchMs)),
      blocksReadPerCold:observations[0].host.reads,encodedBytesPerCold:observations[0].host.bytesRead,
      retainedCachePayloadBytes:observations[0].warm.residentPayloadBytes,peakDecodeMs:Math.max(...observations.map(x=>x.warm.maxDecodeMs)),
      peakSearchMs:Math.max(...observations.map(x=>x.warm.maxSearchMs)),sliceOverruns:observations.reduce((s,x)=>s+x.warm.sliceOverruns,0),
      memory:{baseline,firstEngineAfterGc:memoryFirstEngine,firstWarmAfterGc:retainedAfterQuery,sampledPeak:peak,afterDisposalsAndGc:memory(),processPeakRssKiB:process.resourceUsage().maxRSS}}));return;
  }
  const report={schemaVersion:1,measuredAt:new Date().toISOString(),environment:{node:process.version,platform:process.platform,arch:process.arch,cpu:os.cpus()[0]?.model},
    method:{fixture:'own engineering entries plus artificial CAR prefix and 80 same-key rows; no external lexicon',
      isolation:'conversion and each query scenario in separate Node processes; --expose-gc; 15 recreated engines with one cold and one warm lookup each',
      cold:'engine cache empty; filesystem/OS cache is NOT flushed',
      time:'performance.now milliseconds; wall includes timer yields; read includes fs callbacks/UTF8 conversion, verify SHA256, decode includes validation; cold validation decodes twice',
      memory:'process.memoryUsage in bytes sampled every 1 ms plus explicit samples; may miss transient allocations; process.resourceUsage.maxRSS in KiB is process high-water, not engine-only',
      accounting:'decoded string bytes are UTF16 units times 2, not measured JS heap; host catalog and engine index both retained; maxCachePayloadBytes bounds only cached payload strings',
      scope:'Node Linux demonstration only; no browser/legacy certification, no 1 GB or external engine benchmark'},datasets:[]};
  for(const n of [1000,10000]){
    const temp=fs.mkdtempSync(path.join(os.tmpdir(),'a01-benchmark-'));
    try{report.datasets.push({artificialRows:n,conversion:worker('convert',temp,n),queries:['CARRO','carregado','zzzz-ausente'].map(w=>worker('query',temp,n,w))});}
    finally{fs.rmSync(temp,{recursive:true,force:true});}
  }
  console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
