'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),asset=require('../build/assets.json').assets.find(a=>a.id==='cofre');
const E=require(path.join(root,asset.path)).createRuntime(),engine=E.contextualMorphology,vault=E.createVault(E.knowledge);
// Metas preservadas: revista/revistas também têm ADJ; as duas ordens seguem abertas.
const gaps=new Set(['AVA04','AVA06']);
for(const set of ['desenvolvimento','avaliacao']){
 let useful=0,wrong=0,abstentions=0,missing=0;
 for(const c of require('../ptbr/corpus/nominal-7/'+set+'.json').cases){
  const item=engine.inspect(c.text).items.find(x=>x.snippet===c.target),found=!!(item&&item.rule==='PTBR-CTX-013');
  if(found){if(c.coordination)useful++;else wrong++;}else if(c.coordination)missing++;else abstentions++;
  assert.equal(found,c.coordination&&!gaps.has(c.id),c.id+': '+c.text);
 }
 assert.equal(missing,set==='avaliacao'?2:0);assert.equal(wrong,0);
 console.log(set+': '+useful+' úteis, '+wrong+' erradas, '+abstentions+' abstenções esperadas, '+missing+' lacunas.');
}
const source='A casa branca e os jardins bonitos.',report=vault.analyze('morfologia',source);
assert.deepEqual(report.findings.map(f=>f.nominalCoordination.role),['artigo','constituinte','modificador','conectivo','artigo','constituinte','modificador']);
assert.deepEqual(report.findings.map(f=>f.feature),['artigo','substantivo','adjetivo','conjunção','artigo','substantivo','adjetivo']);
for(const f of report.findings){
 assert.equal(f.confidence,'moderada');assert.equal(f.context.length,7);assert.equal(f.nominalCoordination.syntaxResolved,false);
 assert.equal(f.nominalCoordination.featuresChecked,true);assert.equal(f.nominalCoordination.postposedAdjectives,true);
 assert.equal(source.slice(f.start,f.end),f.snippet);
}
assert.ok(report.findings[1].candidates.portilexicon.some(r=>r.pos==='VERB'));
assert.equal(engine.inspect(source).items[0].nominalAgreement.gender,'Fem');
assert.equal(engine.inspect(source).items[4].nominalAgreement.number,'Plur');
// Nenhum dos quatro termos pode tomar traço emprestado do vizinho.
const lookup=E.lookupMorphology;
for(const [word,pos] of [['casa','NOUN'],['jardim','NOUN'],['branca','ADJ'],['bonito','ADJ']])for(const feature of ['Gender','Number']){
 E.lookupMorphology=k=>lookup(k).map(r=>k===word&&r.pos===pos?Object.assign({},r,{features:r.features.split('|').filter(f=>!f.startsWith(feature+'=')).join('|')}):r);
 assert.ok(!engine.inspect('A casa branca e o jardim bonito.').items.some(x=>x.rule==='PTBR-CTX-013'),word+feature);
}E.lookupMorphology=lookup;
// Até uma leitura verbal não finita no adjetivo impede a hipótese nova.
E.lookupMorphology=k=>lookup(k).concat(k==='bonito'?[{lemma:'verbo-teste',pos:'VERB',features:'Gender=Masc|Number=Sing|VerbForm=Part'}]:[]);
assert.ok(!engine.inspect('A casa branca e o jardim bonito.').items.some(x=>x.rule==='PTBR-CTX-013'));
E.lookupMorphology=lookup;
for(const text of ['A casa branca e o jardim bonito, a mesa.','A casa branca e o jardim bonito — chegaram.','A casa branca e o jardim bonito `chegou`.','A casa `branca` e o jardim bonito.','A casa branca “e” o jardim bonito.','A casa branca e o jardim bonito\nchegaram.','A casa muito branca e o jardim bonito.','A casa branca e o jardim bem bonito.','A casa branca e a mesa branca e o jardim bonito.'])assert.ok(!engine.inspect(text).items.some(x=>x.rule==='PTBR-CTX-013'),text);
// A abstenção da coordenação conserva a leitura local preexistente.
const open=engine.inspect('A casa aberta e o jardim bonito.');assert.equal(open.items[2].rule,'PTBR-CTX-006');
assert.equal(engine.inspect('A casa branca.').items.filter(x=>x.rule==='PTBR-CTX-006').length,3);
assert.equal(engine.inspect('A casa e o jardim.').items.filter(x=>x.rule==='PTBR-CTX-012').length,5);
assert.equal(engine.inspect('Casa e jardim.').items.filter(x=>x.rule==='PTBR-CTX-011').length,3);
assert.equal(engine.inspect('A casa branca e o jardim bonito. Uma mesa pequena ou um livro branco.').items.filter(x=>x.rule==='PTBR-CTX-013').length,14);
assert.equal(engine.inspect('A\tcasa\u00a0branca e o jardim bonito.').items.filter(x=>x.rule==='PTBR-CTX-013').length,7);
const ctx=vm.createContext({Escr:E});
for(const file of ['src/storage/documentos.js','src/editor/contrato-analise.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const text='😀 cafe\u0301. A a\u0301gua clara e a flor branca.',doc=E.freshDocument();doc.text=text;
const result=E.analysisContract.analyze(vault,'morfologia',E.analysisContract.request(doc,text,text.indexOf('A a'),text.length));
assert.equal(doc.text,text);assert.equal(result.findings.length,7);
for(const f of result.findings){assert.equal(f.nominalCoordination.postposedAdjectives,true);assert.equal(text.slice(f.start,f.end),f.snippet);for(const p of f.context)assert.equal(text.slice(p.start,p.end),p.snippet);}
const phrase='A casa branca e o jardim bonito';
for(const tail of [' chegaram.','zinho.'])assert.ok(!engine.inspect(' '.repeat(8000-phrase.length)+phrase+tail).items.some(x=>x.rule==='PTBR-CTX-013'));
assert.ok(!engine.inspect('x '.repeat(1593)+'. '+phrase+' chegaram.').items.some(x=>x.rule==='PTBR-CTX-013'));
let calls=0;E.lookupMorphology=k=>{calls++;return lookup(k);};const bounded=engine.inspect((phrase+'. ').repeat(2000));
assert.ok(bounded.scope.partial);assert.ok(bounded.work.characters<=8000&&bounded.work.tokens<=1600);assert.equal(calls,bounded.work.tokens);E.lookupMorphology=lookup;
require('acorn').parse(fs.readFileSync(path.join(root,'ptbr/morfologia-contextual.js'),'utf8'),{ecmaVersion:5});
const {setup}=require('../ptbr/teste-painel.js'),a=setup(source,[],E);a.panel.hidden=false;a.panel.focus();a.wheel.childNodes.find(b=>b.getAttribute('data-ptbr-lens')==='morfologia').click();a.flush();assert.deepEqual(a.calls,['morfologia']);assert.equal(a.manuscript.value,source);assert.ok(a.board.textContent.includes('coordenação nominal com adjetivos'));
console.log('COORDENAÇÃO COM ADJETIVOS OK: 36 alvos, papéis, traços, homógrafos verbais, fronteiras, Unicode, truncamento, autoria, custo, ES5 e painel.');
