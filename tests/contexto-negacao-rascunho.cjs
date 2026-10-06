'use strict';
// Prova isolada: não ativa PTBR-CTX-014 na distribuição.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),asset=require('../build/assets.json').assets.find(a=>a.id==='cofre');
const E=require(path.join(root,asset.path)).createRuntime();
const draft=fs.readFileSync(path.join(root,'ptbr/experiments/negacao-preverbal/morfologia-contextual.js'),'utf8'),ctx=vm.createContext({Escr:E});
vm.runInContext(draft,ctx);
const engine=E.contextualMorphology,lookup=E.lookupMorphology;
// Fixture de duas leituras realmente inspecionadas no snapshot fixo. Não é importação.
function fixture(k){return lookup(k).concat(k==='não'?[{lemma:'não',pos:'ADV',features:'_'},{lemma:'não',pos:'NOUN',features:'Gender=Masc|Number=Sing'}]:[]);}
E.lookupMorphology=fixture;
for(const set of ['desenvolvimento','avaliacao']){
 let useful=0,wrong=0,missing=0,abstentions=0;
 for(const c of require('../ptbr/corpus/adverbios-1/'+set+'.json').cases){
  const found=engine.inspect(c.text).items.some(x=>x.rule==='PTBR-CTX-014');
  if(found){if(c.expected)useful++;else wrong++;}else if(c.expected)missing++;else abstentions++;
  assert.equal(found,c.expected,c.id+': '+c.text);
 }
 assert.equal(useful,6);assert.equal(wrong,0);assert.equal(missing,0);assert.equal(abstentions,10);
 console.log(set+': '+useful+' úteis, '+wrong+' erradas, '+abstentions+' abstenções esperadas, '+missing+' lacunas (fixture).');
}
for(const c of require('../ptbr/corpus/contexto-1.json').cases){
 const item=engine.inspect(c.text).items.filter(x=>x.snippet===c.target)[c.occurrence];
 if(c.expected.status==='protegido')assert.equal(item,undefined,c.id);
 else{assert.ok(item,c.id);assert.equal(item.status,c.expected.status,c.id);assert.equal(item.selected,c.expected.selected,c.id);}
}
const vault=E.createVault(E.knowledge),source='Eu não o canto.',f=vault.analyze('morfologia',source).findings.find(x=>x.id==='PTBR-CTX-014');
assert.ok(f);assert.equal(f.feature,'advérbio');assert.equal(f.confidence,'moderada');
assert.equal(f.negation.scopeResolved,false);assert.equal(f.context.length,4);
assert.ok(f.candidates.portilexicon.some(x=>x.pos==='NOUN'));
assert.ok(f.candidates.portilexicon.some(x=>x.pos==='ADV'&&x.features==='_'));
for(const p of [f,...f.context])assert.equal(source.slice(p.start,p.end),p.snippet);
E.lookupMorphology=k=>fixture(k).filter(r=>!(k==='não'&&r.pos==='ADV'));
assert.ok(!engine.inspect('Eu não canto.').items.some(x=>x.rule==='PTBR-CTX-014'),'a classificação legada não substitui ADV externo');
E.lookupMorphology=fixture;
for(const s of ['Eu não cantar.','Eu não o cantar.','Eu não cantas.','Ela não a vi.','Eu não só canto.','Eu não não canto.','Ontem eu não canto.','Eu não `canto`.','Eu “não” canto.','Eu não, canto.','Eu não\ncanto.']){
 assert.ok(!engine.inspect(s).items.some(x=>x.rule==='PTBR-CTX-014'),s);
}
assert.equal(engine.inspect('Ela chegou. Eu não canto.').items.filter(x=>x.rule==='PTBR-CTX-014').length,1);
assert.equal(engine.inspect('Eu\tnão\u00a0canto.').items.filter(x=>x.rule==='PTBR-CTX-014').length,1);
for(const file of ['src/storage/documentos.js','src/editor/contrato-analise.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const text='😀 cafe\u0301. Eu na\u0303o o canto.',doc=E.freshDocument();doc.text=text;
const r=E.analysisContract.analyze(vault,'morfologia',E.analysisContract.request(doc,text,text.indexOf('Eu'),text.length));
assert.equal(doc.text,text);assert.ok(r.findings.some(x=>x.id==='PTBR-CTX-014'));
for(const x of r.findings){assert.equal(text.slice(x.start,x.end),x.snippet);for(const p of x.context)assert.equal(text.slice(p.start,p.end),p.snippet);}
const cut=' '.repeat(7989)+'Eu não canto.';
assert.ok(!engine.inspect(cut).items.some(x=>x.rule==='PTBR-CTX-014'),'verbo incompleto na borda não serve de apoio');
let calls=0;E.lookupMorphology=k=>{calls++;return fixture(k);};
const bounded=engine.inspect('Eu não canto. '.repeat(2000));assert.ok(bounded.scope.partial);
assert.ok(bounded.work.characters<=8000&&bounded.work.tokens<=1600);assert.equal(calls,bounded.work.tokens);
E.lookupMorphology=fixture;
require('acorn').parse(draft,{ecmaVersion:5});
console.log('NEGAÇÃO RASCUNHO OK: 32 contrastes, 63 regressões, fixture explícita, indicativo, proteção, apoio ausente, seleção/NFD, truncamento, autoria, custo e ES5. Sem integração no produto.');
