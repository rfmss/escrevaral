'use strict';
// Conversor experimental em memória; runtime carrega somente a raiz e páginas necessárias.
const crypto=require('node:crypto'),flat=require('./build.cjs');
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
exports.build=function(source,options={}){
  const limits={maxBlockEncodedBytes:4096,maxBlockDecodedBytes:8192,maxRows:64,maxKeyUnits:128,...options.limits};
  const b=flat.build(source,{...options,version:options.version||'2-paged',limits:{...limits,maxIndexDecodedBytes:64*1024*1024}});
  const flatIndexEncodedBytes=Buffer.byteLength(b.text),blocks=b.blocks;
  let layer=b.manifest.index.map(d=>({...d,kind:'data',level:0})),serial=0,depth=0;
  const fits=rows=>{const s=JSON.stringify(rows);return rows.length<=limits.maxRows&&Buffer.byteLength(s)<=limits.maxBlockEncodedBytes&&s.length*2<=limits.maxBlockDecodedBytes;};
  if(limits.maxRows<2)throw Error('index-fanout');
  while(layer.length){
    const next=[];let batch=[];depth++;
    if(depth>8)throw Error('index-depth');
    function flush(){
      if(!batch.length)return;
      const text=JSON.stringify(batch),id='p'+String(serial++).padStart(6,'0');blocks[id]=text;
      next.push({id,kind:'index',level:depth,min:batch[0].min,max:batch[batch.length-1].max,rows:batch.length,
        encodedBytes:Buffer.byteLength(text),decodedBytes:text.length*2,sha256:hash(text)});batch=[];
    }
    for(const d of layer){if(!fits([d]))throw Error('descriptor-too-large');if(!fits([...batch,d]))flush();batch.push(d);}flush();
    if(next.length===1){layer=next;break;}
    if(next.length>=layer.length)throw Error('index-fanout');
    layer=next;
  }
  const manifest={...b.manifest,schemaVersion:2,limits,root:layer[0]||null};
  delete manifest.index;manifest.source={...manifest.source,converterVersion:'a01-paged-1'};
  const text=JSON.stringify(manifest);if(text.length*2>8192)throw Error('root-budget');
  return {manifest,text,blocks,buildStats:{flatIndexEncodedBytes,indexPages:serial,depth}};
};
exports.write=flat.write;
if(require.main===module){const dir=process.argv[2];if(!dir)throw Error('Uso: node build-paged.cjs /saida [formas-artificiais]');
  const b=exports.build(require('./fixture.cjs').entries(Number(process.argv[3]||10000),80));exports.write(b,dir);
  console.log(JSON.stringify({rootBytes:Buffer.byteLength(b.text),...b.buildStats}));}
