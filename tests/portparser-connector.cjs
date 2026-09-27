'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {importConllu}=require('../packages/connectors/portparser/import-conllu.cjs');
// Anotação manual própria para testar transporte. Não é saída nem avaliação do modelo.
const fixture=[['1','Ana','Ana','PROPN','_','_','2','nsubj','_','_'],['2','canta','cantar','VERB','_','_','0','root','_','_'],['3','.','.','PUNCT','_','_','2','punct','_','_']].map(r=>r.join('\t')).join('\n');
const text='Ana canta.',r=importConllu(text,fixture);assert.equal(r.status,'alinhado');for(const t of r.sentences[0])assert.equal(text.slice(t.start,t.end),t.form);
assert.equal(importConllu('Ana x canta.',fixture).status,'sem-cobertura');
assert.equal(importConllu(text,fixture.replace('1\tAna','1-2\tAna')).status,'sem-cobertura');
assert.equal(importConllu(text,fixture.replace('\t0\troot','\t1\troot')).status,'sem-cobertura');
assert.equal(importConllu(text,fixture.replace('\t2\tnsubj','\t9\tnsubj')).status,'sem-cobertura');
assert.equal(importConllu('Ana canta. Ana canta.',fixture+'\n\n'+fixture).sentences[1][0].start,11);
const emoji=fixture.replaceAll('Ana','😀');assert.equal(importConllu('😀 canta.',emoji).sentences[0][0].end,2);
const lock=require('../packages/connectors/portparser/upstream.lock.json');
for(const f of lock.files){const bytes=fs.readFileSync(path.join(__dirname,'../packages/connectors/portparser/vendor',f.path));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),f.sha256);}
console.log('PORTPARSER: snapshot íntegro e adaptador literal/abstenções; inferência do modelo não executada.');
