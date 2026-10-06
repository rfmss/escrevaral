'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),asset=require('../build/assets.json').assets.find(a=>a.id==='cofre');
const E=require(path.join(root,asset.path)).createRuntime(),engine=E.contextualMorphology,lookup=E.lookupMorphology;
const report={version:engine.version,sets:{}};
for(const set of ['desenvolvimento','avaliacao']){
 const counts={useful:0,wrong:0,abstentions:0,missing:0};
 for(const c of require('../ptbr/corpus/interjeicoes-1/'+set+'.json').cases){
  const found=engine.inspect(c.text).items.some(x=>x.rule==='PTBR-CTX-016');
  counts[found?(c.expected?'useful':'wrong'):(c.expected?'missing':'abstentions')]++;
  assert.equal(found,c.expected,c.id+': '+c.text);
 }
 assert.deepEqual(counts,{useful:6,wrong:0,abstentions:10,missing:0});report.sets[set]=counts;
}
const vault=E.createVault(E.knowledge),source='Oh ! Ah?',findings=vault.analyze('morfologia',source).findings.filter(x=>x.id==='PTBR-CTX-016');
assert.equal(findings.length,2);for(const f of findings){assert.equal(f.feature,'interjeição');assert.equal(f.confidence,'moderada');assert.equal(f.interjection.emotionResolved,false);assert.equal(f.interjection.intentionResolved,false);assert.ok(f.candidates.portilexicon.some(x=>x.pos==='INTJ'));assert.equal(f.context.length,2);for(const p of [f,...f.context])assert.equal(source.slice(p.start,p.end),p.snippet);assert.ok(/[!?]/.test(f.context[1].snippet));}
E.lookupMorphology=k=>lookup(k).filter(r=>r.pos!=='INTJ');assert.ok(!engine.inspect('Ah! Oh?').items.some(x=>x.rule==='PTBR-CTX-016'),'classe legada não substitui INTJ real');E.lookupMorphology=lookup;
// INTJ hipotética em outra palavra não estende o recorte a toda exclamação.
E.lookupMorphology=k=>lookup(k).concat([{lemma:k,pos:'INTJ',features:'_'}]);assert.ok(!engine.inspect('Casa!').items.some(x=>x.rule==='PTBR-CTX-016'));E.lookupMorphology=lookup;
for(const s of ['A palavra ah!','Ela disse: “Ah!”','[Ah!](https://example.com)','https://ah.com!','Ah, oh!','Oh;','Oh:','Oh\n!','Ah / !','Ele\nAh!'])assert.ok(!engine.inspect(s).items.some(x=>x.rule==='PTBR-CTX-016'),s);
assert.equal(engine.inspect('Ah\u00a0!').items[0].rule,'PTBR-CTX-016');
const ctx=vm.createContext({Escr:E});for(const file of ['src/storage/documentos.js','src/editor/contrato-analise.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const text='😀 cafe\u0301. Oh ! Ah?',doc=E.freshDocument();doc.text=text;
const r=E.analysisContract.analyze(vault,'morfologia',E.analysisContract.request(doc,text,text.indexOf('Oh'),text.length));assert.equal(doc.text,text);assert.equal(r.findings.filter(x=>x.id==='PTBR-CTX-016').length,2);
for(const f of r.findings){for(const p of [f,...f.context])assert.equal(text.slice(p.start,p.end),p.snippet);}
assert.ok(!engine.inspect(' '.repeat(7998)+'Ah!').items.some(x=>x.rule==='PTBR-CTX-016'),'pontuação fora da janela não é apoio');
assert.ok(!engine.inspect('x '.repeat(1599)+'. Ah! Outro').items.some(x=>x.rule==='PTBR-CTX-016'),'teto de tokens não cria fronteira');
let calls=0;E.lookupMorphology=k=>{calls++;return lookup(k);};const bounded=engine.inspect('Ah! Oh? '.repeat(2000));assert.ok(bounded.scope.partial);assert.ok(bounded.work.characters<=8000&&bounded.work.tokens<=1600);assert.equal(calls,bounded.work.tokens);E.lookupMorphology=lookup;
assert.ok(vault.analyze('morfologia','Ah! '.repeat(150)).findings.length<=100);
require('acorn').parse(fs.readFileSync(path.join(root,'ptbr/morfologia-contextual.js'),'utf8'),{ecmaVersion:5});
const {setup}=require('../ptbr/teste-painel.js'),a=setup(source,[],E);a.panel.hidden=false;a.panel.focus();a.wheel.childNodes.find(b=>b.getAttribute('data-ptbr-lens')==='morfologia').click();a.flush();assert.deepEqual(a.calls,['morfologia']);assert.equal(a.manuscript.value,source);assert.ok(a.board.textContent.includes('interjeição isolada'));
if(process.argv.includes('--report'))fs.writeFileSync(path.join(root,'ptbr/corpus/interjeicoes-1/depois.json'),JSON.stringify(report,null,2)+'\n');
console.log('INTERJEIÇÕES OK: 32 alvos (12 úteis, 20 abstenções, zero erradas/lacunas), INTJ real/ausente, citação, uso nominal, fronteiras, spans/pontuação, seleção/autoria, limites/custo, ES5 e painel.');
