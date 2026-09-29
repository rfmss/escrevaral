'use strict';
// Ferramenta de construção Node. Sem dependências externas; não integra o runtime.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),norm=require('./normalize');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const compareId=(a,b)=>a.id<b.id?-1:a.id>b.id?1:0;
const compareKey=(a,b)=>a.key<b.key?-1:a.key>b.key?1:compareId(a,b);

function* lines(file,maxBytes){
  const fd=fs.openSync(file,'r'),buffer=Buffer.alloc(4096);let parts=[],size=0;
  function decode(){const bytes=Buffer.concat(parts,size),text=bytes.toString('utf8');
    if(!Buffer.from(text,'utf8').equals(bytes))throw Error('invalid-utf8');parts=[];size=0;return text;}
  try{let n;while((n=fs.readSync(fd,buffer,0,buffer.length,null))){let start=0;
    for(let i=0;i<n;i++){if(buffer[i]!==10)continue;
      const length=i-start;if(size+length>maxBytes)throw Error('line-budget');
      if(length){parts.push(Buffer.from(buffer.subarray(start,i)));size+=length;}yield decode();start=i+1;
    }
    if(start<n){const length=n-start;if(size+length>maxBytes)throw Error('line-budget');parts.push(Buffer.from(buffer.subarray(start,n)));size+=length;}
  }if(size)yield decode();}finally{fs.closeSync(fd);}
}

exports.convert=function(input,output,options={}){
  const limits={maxBlockEncodedBytes:4096,maxBlockDecodedBytes:8192,maxRows:64,maxKeyUnits:128,...options.limits};
  const budgets={sortBytes:262144,sortRows:2048,fanIn:8,lineBytes:4096,maxTempBytes:268435456,maxOutputBytes:268435456,...options.budgets};
  for(const group of [limits,budgets])for(const value of Object.values(group))if(!Number.isSafeInteger(value)||value<=0)throw Error('invalid-budget');
  if(budgets.fanIn<2||budgets.fanIn>32||limits.maxRows<2)throw Error('invalid-fanout');
  const provenance=options.source;
  if(!provenance||['kind','license','generator'].some(k=>typeof provenance[k]!=='string'||!provenance[k]||provenance[k].length>200))throw Error('source-required');
  const packageId=options.packageId||'a01-own-fixture',version=options.version||'3-stream';
  if(![packageId,version].every(s=>typeof s==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(s)))throw Error('invalid-package');
  const suppliedDependencies=options.dependencies||[];
  if(!Array.isArray(suppliedDependencies)||suppliedDependencies.length>8||suppliedDependencies.some(d=>!d||![d.packageId,d.version].every(s=>typeof s==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(s))))throw Error('invalid-dependencies');
  const dependencies=suppliedDependencies.map(d=>({packageId:d.packageId,version:d.version}));
  const coverage=options.coverage===undefined?'Fixture própria e dados artificiais de engenharia; não é dicionário geral nem definições.':options.coverage;
  if(typeof coverage!=='string'||!coverage||coverage.length>2048)throw Error('invalid-coverage');
  const stats={entries:0,initialIdRuns:0,initialKeyRuns:0,mergePasses:0,maxRunRows:0,maxRunBytes:0,maxMergeReaders:0,
    tempBytes:0,peakTempBytes:0,tempBytesWritten:0,outputBytes:0,dataBlocks:0,indexPages:0,depth:0};
  let writes=0;
  function checkpoint(phase){if(typeof options.onCheckpoint==='function')options.onCheckpoint(phase,{...stats});}
  // Reserva exclusiva: jamais sobrescrever uma saída existente, mesmo incompleta.
  fs.mkdirSync(output);let temp=null,success=false;
  try{
    temp=fs.mkdtempSync(path.join(path.dirname(output),'.a01-sort-'));
    function writer(file,temporary){
      const fd=fs.openSync(file,'wx');let closed=false;
      return {write(text){const bytes=Buffer.from(text,'utf8');
        const field=temporary?'tempBytes':'outputBytes',cap=temporary?budgets.maxTempBytes:budgets.maxOutputBytes;
        if(stats[field]+bytes.length>cap)throw Error(temporary?'temp-budget':'output-budget');
        let offset=0;while(offset<bytes.length){const n=fs.writeSync(fd,bytes,offset,bytes.length-offset);if(!n)throw Error('write-stalled');offset+=n;stats[field]+=n;
          if(temporary){stats.tempBytesWritten+=n;stats.peakTempBytes=Math.max(stats.peakTempBytes,stats.tempBytes);}}
        writes++;if(writes%2048===0)checkpoint('write');
      },close(){if(!closed){closed=true;fs.closeSync(fd);}}};
    }
    function remove(file){const size=fs.statSync(file).size;fs.unlinkSync(file);stats.tempBytes-=size;}
    function* rows(file){for(const text of lines(file,budgets.lineBytes))yield JSON.parse(text);}
    function makeRuns(iterable,prefix,compare){
      let batch=[],bytes=0,count=0;
      function flush(){if(!batch.length)return;batch.sort(compare);const w=writer(path.join(temp,prefix+'-'+count+'.jsonl'),true);
        try{for(const row of batch)w.write(JSON.stringify(row)+'\n');}finally{w.close();}
        stats.maxRunRows=Math.max(stats.maxRunRows,batch.length);stats.maxRunBytes=Math.max(stats.maxRunBytes,bytes);checkpoint('run');count++;batch=[];bytes=0;}
      for(const row of iterable){const size=Buffer.byteLength(JSON.stringify(row))+1;
        if(size>budgets.lineBytes||size>budgets.sortBytes)throw Error('sort-record-budget');
        if(batch.length&&(batch.length>=budgets.sortRows||bytes+size>budgets.sortBytes))flush();batch.push(row);bytes+=size;
      }flush();return count;
    }
    function sorted(prefix,count,compare){
      if(!count){const name=path.join(temp,prefix+'-0.jsonl'),w=writer(name,true);w.close();return name;}
      let pass=0;
      while(count>1){const nextPrefix=prefix+'m'+pass,nextCount=Math.ceil(count/budgets.fanIn);
        for(let first=0,group=0;first<count;first+=budgets.fanIn,group++){
          const files=[];for(let i=first;i<Math.min(first+budgets.fanIn,count);i++)files.push(path.join(temp,prefix+'-'+i+'.jsonl'));
          const iterators=files.map(f=>rows(f)),heads=[];const w=writer(path.join(temp,nextPrefix+'-'+group+'.jsonl'),true);
          try{iterators.forEach(it=>heads.push(it.next()));stats.maxMergeReaders=Math.max(stats.maxMergeReaders,files.length);
            while(true){let pick=-1;for(let i=0;i<heads.length;i++)if(!heads[i].done&&(pick<0||compare(heads[i].value,heads[pick].value)<0))pick=i;
              if(pick<0)break;w.write(JSON.stringify(heads[pick].value)+'\n');heads[pick]=iterators[pick].next();}
          }finally{w.close();iterators.forEach(it=>it.return());}
          files.forEach(remove);
        }prefix=nextPrefix;count=nextCount;pass++;stats.mergePasses++;
      }return path.join(temp,prefix+'-0.jsonl');
    }
    const sourceHash=crypto.createHash('sha256');sourceHash.update('[');
    function fits(part){const s=JSON.stringify(part);return part.length<=limits.maxRows&&Buffer.byteLength(s)<=limits.maxBlockEncodedBytes&&s.length*2<=limits.maxBlockDecodedBytes;}
    function* source(){
      for(const text of lines(input,budgets.lineBytes)){
        const row=JSON.parse(text);
        if(!row||Array.isArray(row)||Object.keys(row).length!==5||['id','form','lemma','pos','features'].some(k=>typeof row[k]!=='string')||!row.form)throw Error('invalid-source');
        if(stats.entries)sourceHash.update(',');sourceHash.update(JSON.stringify(row));stats.entries++;
        const key=norm.key(row.form);if(key.length>limits.maxKeyUnits)throw Error('key-too-large');
        const out={...row,key};if(!fits([out]))throw Error('entry-too-large');yield out;
      }sourceHash.update(']');
    }
    stats.initialIdRuns=makeRuns(source(),'id',compareId);const byId=sorted('id',stats.initialIdRuns,compareId);
    function* unique(){let previous=null;for(const row of rows(byId)){if(row.id===previous)throw Error('duplicate-id');previous=row.id;yield row;}}
    stats.initialKeyRuns=makeRuns(unique(),'key',compareKey);remove(byId);const ordered=sorted('key',stats.initialKeyRuns,compareKey);
    let layerPath=path.join(temp,'level-0.jsonl'),layerCount=0,batch=[];
    function block(text,id){const w=writer(path.join(output,id+'.json'),false);try{w.write(text);}finally{w.close();}}
    function serial(prefix,n){if(n>=1000000)throw Error('block-id-budget');return prefix+String(n).padStart(6,'0');}
    const dw=writer(layerPath,true);
    function flushData(){if(!batch.length)return;const text=JSON.stringify(batch),id=serial('b',stats.dataBlocks++);block(text,id);
      dw.write(JSON.stringify({id,min:batch[0].key,max:batch[batch.length-1].key,rows:batch.length,encodedBytes:Buffer.byteLength(text),decodedBytes:text.length*2,sha256:hash(text),kind:'data',level:0})+'\n');
      layerCount++;batch=[];}
    try{for(const row of rows(ordered)){if(!fits([...batch,row]))flushData();batch.push(row);}flushData();}finally{dw.close();}remove(ordered);
    let root=null;
    while(layerCount){
      stats.depth++;if(stats.depth>8)throw Error('index-depth');
      const nextPath=path.join(temp,'level-'+stats.depth+'.jsonl'),pw=writer(nextPath,true);let page=[],nextCount=0;
      function flushPage(){if(!page.length)return;const text=JSON.stringify(page),id=serial('p',stats.indexPages++);block(text,id);
        const d={id,kind:'index',level:stats.depth,min:page[0].min,max:page[page.length-1].max,rows:page.length,encodedBytes:Buffer.byteLength(text),decodedBytes:text.length*2,sha256:hash(text)};
        pw.write(JSON.stringify(d)+'\n');root=d;page=[];nextCount++;}
      try{for(const d of rows(layerPath)){if(!fits([d]))throw Error('descriptor-too-large');if(!fits([...page,d]))flushPage();page.push(d);}flushPage();}finally{pw.close();}
      remove(layerPath);if(nextCount===1){remove(nextPath);layerPath=null;break;}
      if(nextCount>=layerCount)throw Error('index-fanout');layerPath=nextPath;layerCount=nextCount;
    }
    if(layerPath)remove(layerPath);
    const manifest={schema:'scrvrl.lexical-package',schemaVersion:2,packageId,version,normalization:norm.id,variety:'pt-BR',
      coverage,
      source:{kind:provenance.kind,license:provenance.license,generator:provenance.generator,converterVersion:'a01-stream-1',entries:stats.entries,sha256:sourceHash.digest('hex')},dependencies,limits,root};
    const text=JSON.stringify(manifest);if(text.length*2>8192)throw Error('root-budget');
    checkpoint('before-manifest');
    const mw=writer(path.join(output,'manifest.partial'),false);try{mw.write(text+'\n');}finally{mw.close();}
    fs.renameSync(path.join(output,'manifest.partial'),path.join(output,'manifest.json'));success=true;
    return {manifest,text,stats};
  }finally{if(temp)fs.rmSync(temp,{recursive:true,force:true});if(!success)fs.rmSync(output,{recursive:true,force:true});}
};

exports.writeFixture=function(file,extra=0,dense=80){
  if(!Number.isSafeInteger(extra)||extra<0||!Number.isSafeInteger(dense)||dense<0)throw Error('invalid-fixture-count');
  const fd=fs.openSync(file,'wx');
  try{for(const row of require('./fixture.cjs').iterate(extra,dense))fs.writeFileSync(fd,JSON.stringify(row)+'\n');}finally{fs.closeSync(fd);}
};
exports.fixtureSource={kind:'original-engineering-fixture',license:'CC0-1.0',generator:'fixture.cjs'};
if(require.main===module){
  const [command,input,output]=process.argv.slice(2);
  if(command==='fixture'){exports.writeFixture(input,Number(output||10000));console.log('fixture escrita');}
  else if(command==='convert-own-fixture'){console.log(JSON.stringify(exports.convert(input,output,{source:exports.fixtureSource})));}
  else throw Error('Uso: build-stream.cjs fixture /entrada.jsonl [quantidade] | convert-own-fixture /entrada.jsonl /saida-nova');
}
