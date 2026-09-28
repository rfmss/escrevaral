'use strict';
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const norm = require('./normalize');
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
exports.build = function (source, options = {}) {
  const limits = {maxBlockEncodedBytes:4096,maxBlockDecodedBytes:8192,maxRows:64,maxIndexDecodedBytes:1048576,maxKeyUnits:128,...options.limits};
  const ids = new Set();
  const rows = source.map(row=>{
    if (!row || ['id','form','lemma','pos','features'].some(k=>typeof row[k]!=='string') || !row.form || ids.has(row.id)) throw Error('invalid-source');
    ids.add(row.id);
    const key=norm.key(row.form);
    if(key.length>limits.maxKeyUnits) throw Error('key-too-large');
    return {...row,key};
  }).sort((a,b)=>a.key<b.key?-1:a.key>b.key?1:a.id<b.id?-1:1);
  const blocks = {}, index = [];
  let batch = [];
  function fits(part) { const text=JSON.stringify(part); return part.length<=limits.maxRows && Buffer.byteLength(text)<=limits.maxBlockEncodedBytes && text.length*2<=limits.maxBlockDecodedBytes; }
  function flush() {
    if (!batch.length) return;
    const text=JSON.stringify(batch), id='b'+String(index.length).padStart(6,'0');
    blocks[id]=text;
    index.push({id,min:batch[0].key,max:batch[batch.length-1].key,rows:batch.length,encodedBytes:Buffer.byteLength(text),decodedBytes:text.length*2,sha256:hash(text)});
    batch=[];
  }
  for (const row of rows) {
    if (!fits([row])) throw Error('entry-too-large');
    if (!fits([...batch,row])) flush();
    batch.push(row);
  }
  flush();
  const manifest={schema:'scrvrl.lexical-package',schemaVersion:1,packageId:options.packageId||'a01-own-fixture',version:options.version||'1',normalization:norm.id,
    variety:'pt-BR',coverage:'Fixture própria e dados artificiais de engenharia; não é dicionário geral nem definições.',
    source:{kind:'original-engineering-fixture',license:'CC0-1.0',generator:'fixture.cjs',converterVersion:'a01-1',entries:source.length,sha256:hash(JSON.stringify(source))},
    dependencies:options.dependencies||[],limits,index};
  const text=JSON.stringify(manifest);
  if (text.length*2>limits.maxIndexDecodedBytes) throw Error('index-too-large');
  return {manifest,text,blocks};
};
exports.write = function (bundle, directory) {
  fs.mkdirSync(directory,{recursive:true});
  fs.writeFileSync(path.join(directory,'manifest.json'),bundle.text+'\n');
  for(const [id,text] of Object.entries(bundle.blocks)) fs.writeFileSync(path.join(directory,id+'.json'),text);
};
if (require.main===module) {
  const directory=process.argv[2];
  if(!directory) throw Error('Uso: node build.cjs /diretorio/saida [quantidade-artificial]');
  const b=exports.build(require('./fixture.cjs').entries(Number(process.argv[3]||0),80));
  exports.write(b,directory);
  console.log(JSON.stringify({blocks:b.manifest.index.length,indexBytes:Buffer.byteLength(b.text),dataBytes:Object.values(b.blocks).reduce((n,s)=>n+Buffer.byteLength(s),0)}));
}
