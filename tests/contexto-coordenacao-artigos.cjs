'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),asset=require('../build/assets.json').assets.find(a=>a.id==='cofre');
const E=require(path.join(root,asset.path)).createRuntime(),engine=E.contextualMorphology,vault=E.createVault(E.knowledge);
for(const set of ['desenvolvimento','avaliacao']){
 let useful=0,wrong=0,abstentions=0,missing=0;
 for(const c of require('../ptbr/corpus/nominal-6/'+set+'.json').cases){
  const item=engine.inspect(c.text).items.find(x=>x.snippet===c.target),found=!!(item&&item.rule==='PTBR-CTX-012');
  if(found){if(c.coordination)useful++;else wrong++;}else if(c.coordination)missing++;else abstentions++;
  assert.equal(found,c.coordination,c.id+': '+c.text);
 }
 console.log(set+': '+useful+' úteis, '+wrong+' erradas, '+abstentions+' abstenções esperadas, '+missing+' lacunas.');
}
const source='Um livro ou uma revista.',report=vault.analyze('morfologia',source);
assert.deepEqual(report.findings.map(f=>f.nominalCoordination.role),['artigo','constituinte','conectivo','artigo','constituinte']);
assert.deepEqual(report.findings.map(f=>f.feature),['artigo','substantivo','conjunção','artigo','substantivo']);
for(const f of report.findings){assert.equal(f.confidence,'moderada');assert.equal(f.context.length,5);assert.equal(f.nominalCoordination.syntaxResolved,false);assert.equal(f.nominalCoordination.featuresChecked,true);assert.equal(source.slice(f.start,f.end),f.snippet);}
assert.ok(report.findings[0].evidence.observation.includes('quantitativos'));assert.ok(report.findings[1].candidates.portilexicon.some(r=>r.pos==='VERB'));
// Apoios ausentes não se tornam traços inventados.
const lookup=E.lookupMorphology;
for(const word of ['casa','jardim'])for(const feature of ['Gender','Number']){
 E.lookupMorphology=k=>lookup(k).map(r=>k===word&&r.pos==='NOUN'?Object.assign({},r,{features:r.features.split('|').filter(f=>!f.startsWith(feature+'=')).join('|')}):r);
 assert.ok(!engine.inspect('A casa e o jardim.').items.some(x=>x.rule==='PTBR-CTX-012'),word+feature);
}E.lookupMorphology=lookup;
for(const text of ['A casa e o jardim, a mesa.','A casa e o jardim — chegaram.','A casa e o jardim `chegou`.','A casa e o "jardim".','A casa “e” o jardim.','A casa e o jardim\nchegaram.','A velha casa e o jardim.','Minha casa e o jardim.','A casa e uma linda mesa.','Eu a casa e o jardim.','A casa e o jardim e a mesa.'])assert.ok(!engine.inspect(text).items.some(x=>x.rule==='PTBR-CTX-012'),text);
assert.equal(engine.inspect('Eu o canto e o trabalho.').items[2].selected,'verbo');
assert.equal(engine.inspect('Casa e jardim.').items.filter(x=>x.rule==='PTBR-CTX-011').length,3);
assert.equal(engine.inspect('A casa e o jardim. Uma mesa ou um livro.').items.filter(x=>x.rule==='PTBR-CTX-012').length,10);
assert.equal(engine.inspect('A\tcasa\u00a0e o jardim.').items.filter(x=>x.rule==='PTBR-CTX-012').length,5);
// Offsets de seleção e dos cinco apoios, incluindo Unicode decomposto.
const ctx=vm.createContext({Escr:E});
for(const file of ['src/storage/documentos.js','src/editor/contrato-analise.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const text='😀 cafe\u0301. A a\u0301gua e a flor. Um livro ou uma revista.',doc=E.freshDocument();doc.text=text;
const result=E.analysisContract.analyze(vault,'morfologia',E.analysisContract.request(doc,text,text.indexOf('A a'),text.length));
assert.equal(doc.text,text);assert.equal(result.findings.filter(x=>x.rule==='PTBR-CTX-012'||x.id==='PTBR-CTX-012').length,10);
for(const f of result.findings){assert.equal(text.slice(f.start,f.end),f.snippet);for(const p of f.context)assert.equal(text.slice(p.start,p.end),p.snippet);}
const phrase='A casa e o jardim';
for(const tail of [' chegaram.','zinho.'])assert.ok(!engine.inspect(' '.repeat(8000-phrase.length)+phrase+tail).items.some(x=>x.rule==='PTBR-CTX-012'));
assert.ok(!engine.inspect('x '.repeat(1595)+'. '+phrase+' chegaram.').items.some(x=>x.rule==='PTBR-CTX-012'));
let calls=0;E.lookupMorphology=k=>{calls++;return lookup(k);};const bounded=engine.inspect((phrase+'. ').repeat(2000));assert.ok(bounded.scope.partial);assert.ok(bounded.work.characters<=8000&&bounded.work.tokens<=1600);assert.equal(calls,bounded.work.tokens);E.lookupMorphology=lookup;
require('acorn').parse(fs.readFileSync(path.join(root,'ptbr/morfologia-contextual.js'),'utf8'),{ecmaVersion:5});
const {setup}=require('../ptbr/teste-painel.js'),a=setup(source,[],E);a.panel.hidden=false;a.panel.focus();a.wheel.childNodes.find(b=>b.getAttribute('data-ptbr-lens')==='morfologia').click();a.flush();assert.deepEqual(a.calls,['morfologia']);assert.equal(a.manuscript.value,source);assert.ok(a.board.textContent.includes('coordenação nominal com artigos'));
console.log('COORDENAÇÃO COM ARTIGOS OK: 32 alvos, papéis, traços, fronteiras, Unicode, truncamento, autoria, custo, ES5 e painel.');
