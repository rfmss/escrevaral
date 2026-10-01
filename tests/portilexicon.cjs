'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),asset=require('../build/assets.json').assets.find(a=>a.id==='cofre');
const E=require(path.join(root,asset.path)).createRuntime(),meta=require('../resources/pt-BR/portilexicon/ORIGEM.json');let count=0;
function test(name,fn){fn();count++;}
function readings(word){return E.lookupLexeme(word).morphology;}
test('plural exato leva a lema e sentidos sem flexão por sufixo',()=>{
 const r=E.lookupLexeme('carros');assert.equal(r.state,'found');assert.deepEqual(r.morphology,[{lemma:'carro',pos:'NOUN',features:'Gender=Masc|Number=Plur'}]);assert.equal(r.total,4);assert.ok(r.senses.every(s=>s.lemma==='carro'));
 assert.equal(E.lookupLexeme('carrozzs').state,'uncovered');
});
test('homógrafos conservados inclusive lemas não usados na seleção inicial',()=>{
 assert.deepEqual([...new Set(readings('fui').map(r=>r.lemma))],['ir','ser']);
 assert.deepEqual(readings('canto').map(r=>[r.lemma,r.pos]),[['cantar','VERB'],['canto','NOUN']]);
 assert.deepEqual(readings('casas').map(r=>r.lemma),['casa','casar']);
 assert.ok(E.lookupLexeme('casas').missingSenseLemmas.includes('casar'));
});
test('dupla leitura temporal e diacríticos preservados',()=>{
 const rs=readings('lemos');assert.ok(rs.some(r=>/Tense=Pres/.test(r.features)));assert.ok(rs.some(r=>/Tense=Past/.test(r.features)));
 assert.ok(readings('pode').some(r=>r.lemma==='poder'&&/Tense=Pres/.test(r.features)));
 assert.ok(readings('pôde').every(r=>r.lemma==='poder'&&/Tense=Past/.test(r.features)));
 assert.deepEqual(E.lookupLexeme('PO\u0302DE'),E.lookupLexeme('pôde'));
});
test('forma com morfologia mas sem sentidos continua coberta parcialmente',()=>{
 const r=E.lookupLexeme('fui');assert.equal(r.state,'found');assert.equal(r.total,0);assert.deepEqual(r.missingSenseLemmas,['ir','ser']);assert.ok(r.morphologySource);assert.ok(r.morphologyVersion);
});
test('todo recorte cabe nos limites; triplas únicas e isoladas',()=>{
 let n=0;for(const key of Object.keys(E.portiLexicon.entries)){
  const rs=E.lookupMorphology(key);assert.ok(rs.length<=32&&rs.length>0);n+=rs.length;
  assert.equal(new Set(rs.map(r=>JSON.stringify(r))).size,rs.length);
  assert.ok(Buffer.byteLength(E.portiLexicon.entries[key])<=4096);
 }
 assert.equal(n,meta.readings);assert.equal(Object.keys(E.portiLexicon.entries).length,meta.forms);
 const r=E.lookupMorphology('fui');r[0].lemma='injetado';assert.equal(E.lookupMorphology('fui')[0].lemma,'ir');
});
test('tamanho, hash, ES5 e licença no artefato portátil',()=>{
 const data=fs.readFileSync(path.join(root,'resources/pt-BR/portilexicon/flexoes.js'),'utf8');assert.equal(Buffer.byteLength(data),meta.outputBytes);
 assert.equal(crypto.createHash('sha256').update(data).digest('hex'),meta.outputSha256);assert.ok(Buffer.byteLength(data)<=256*1024);
 for(const p of ['resources/pt-BR/portilexicon/flexoes.js','packages/cofre/src/consulta-morfologica.js','packages/cofre/src/consulta-lexical.js','ptbr/painel.js'])acorn.parse(fs.readFileSync(path.join(root,p),'utf8'),{ecmaVersion:5});
 assert.ok(data.includes('Copyright (c) 2023 Lucelene Lopes'));assert.ok(fs.readFileSync(path.join(root,'escrevaral.html'),'utf8').includes(data));
});
test('consulta desserializa só forma pedida e até oito lemas, saída até 24 sentidos',()=>{
 let calls=0;const c={Escr:{reading:E.reading},JSON:{parse:s=>{calls++;return JSON.parse(s);}}};
 for(const p of ['resources/pt-BR/own-pt/lexico.js','resources/pt-BR/portilexicon/flexoes.js','packages/cofre/src/consulta-morfologica.js','packages/cofre/src/consulta-lexical.js'])vm.runInNewContext(fs.readFileSync(path.join(root,p),'utf8'),c);
 assert.equal(calls,0);c.Escr.lookupLexeme('carros');assert.equal(calls,2);
 c.Escr.lookupLexeme('zzcarrozz');assert.equal(calls,2);
 for(const key of ['passo','canto','casas','fui','pode']){const before=calls;const r=c.Escr.lookupLexeme(key);assert.ok(calls-before<=9);assert.ok(r.senses.length<=24);}
});
const {setup}=require('../ptbr/teste-painel.js');
function nodes(n){return [n].concat(...n.childNodes.map(nodes));}
function field(a,c){return nodes(a.board).find(n=>n.className===c);}
test('painel mostra flexão, lacuna e autoria intacta',()=>{
 const a=setup('😀 fui de carro',[],E);a.manuscript.selectionStart=3;a.manuscript.selectionEnd=6;a.panel.hidden=false;a.panel.focus();
 field(a,'ptbr-lexical').childNodes.find(n=>n.tagName==='button').click();a.flush();
 const result=field(a,'ptbr-results').textContent;assert.match(result,/ir —/);assert.match(result,/ser —/);assert.match(result,/Sem sentidos\/definições/);assert.equal(a.manuscript.value,'😀 fui de carro');assert.deepEqual(a.calls,[]);
 a.reset();assert.equal(field(a,'ptbr-results').textContent,'');
});
console.log('PORTILEXICON OK: '+count+' grupos; '+meta.forms+' formas/'+meta.readings+' leituras, ambiguidades, limites, ES5 e painel.');
