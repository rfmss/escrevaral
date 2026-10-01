'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),asset=require('../build/assets.json').assets.find(a=>a.id==='cofre');
const E=require(path.join(root,asset.path)).createRuntime(),engine=E.contextualMorphology,vault=E.createVault(E.knowledge);
for(const set of ['desenvolvimento','avaliacao'])for(const c of require('../ptbr/corpus/nominal-5/'+set+'.json').cases){
 const item=engine.inspect(c.text).items.find(x=>x.snippet===c.target);assert.equal(item?item.selected:null,c.expected,c.id);
}
const findings=vault.analyze('morfologia','Casa ou apartamento.').findings;
assert.deepEqual(findings.map(f=>f.nominalCoordination.role),['constituinte','conectivo','constituinte']);
assert.ok(findings.every(f=>f.nominalCoordination.syntaxResolved===false&&f.confidence==='moderada'));
assert.ok(findings[0].candidates.portilexicon.some(r=>r.lemma==='casar'));assert.equal(findings[1].feature,'conjunção');
assert.ok(findings[1].message.includes('conectivo ou'));assert.equal(findings[2].feature,'substantivo');
for(const text of ['Casa e jardim e mesa.','Casa ou jardim ou mesa.','Casa e jardim, mesa.','Eu canto e trabalho.','O canto e jardim.','Casa e jardim chegaram.','Casa e jardim `chegaram`.','Casa e jardim\nchegaram.','Casa e <b>jardim</b>.','Casa e jardim — mesa.'])assert.ok(!engine.inspect(text).items.some(x=>x.nominalCoordination),text);
// Regras anteriores não perdem a decisão verbal e determinantes não viram nomes.
assert.equal(engine.inspect('Eu canto e trabalho.').items[1].selected,'verbo');
assert.equal(engine.inspect('Minha casa ou apartamento.').items[0].selected,'determinante (UD)');
assert.equal(engine.inspect('Casa e jardim. Mesa ou livro.').items.filter(x=>x.nominalCoordination).length,6);
// Seleção: emoji, acento decomposto e apoios continuam apontando ao manuscrito original.
const text='😀 cafe\u0301. Casa e jardim. Mar ou rio.',ctx=vm.createContext({Escr:E});
for(const file of ['src/storage/documentos.js','src/editor/contrato-analise.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const doc=E.freshDocument();doc.text=text;const result=E.analysisContract.analyze(vault,'morfologia',E.analysisContract.request(doc,text,text.indexOf('Casa'),text.length));assert.equal(doc.text,text);assert.equal(result.findings.filter(x=>x.nominalCoordination).length,6);
for(const f of result.findings){assert.equal(text.slice(f.start,f.end),f.snippet);for(const p of f.context)assert.equal(text.slice(p.start,p.end),p.snippet);}
// Fim truncado não serve como limite de unidade, nem quando corta entre tokens.
const phrase='Casa e jardim';
for(const tail of [' chegou.','zinho.'])assert.ok(!engine.inspect(' '.repeat(8000-phrase.length)+phrase+tail).items.some(x=>x.nominalCoordination));
assert.ok(!engine.inspect(('x '.repeat(1597))+'. Casa e jardim chegaram.').items.some(x=>x.nominalCoordination));
const lookup=E.lookupMorphology;let calls=0;E.lookupMorphology=k=>{calls++;return lookup(k);};const bounded=engine.inspect('Casa e jardim. '.repeat(2000));assert.ok(bounded.scope.partial);assert.ok(bounded.work.characters<=8000&&bounded.work.tokens<=1600);assert.equal(calls,bounded.work.tokens);E.lookupMorphology=lookup;
// Sem leitura NOUN externa, o apoio legado sozinho não libera a regra.
E.lookupMorphology=k=>k==='jardim'?[]:lookup(k);assert.ok(!engine.inspect('Casa e jardim.').items.some(x=>x.nominalCoordination));E.lookupMorphology=lookup;
require('acorn').parse(fs.readFileSync(path.join(root,'ptbr/morfologia-contextual.js'),'utf8'),{ecmaVersion:5});
const {setup}=require('../ptbr/teste-painel.js'),a=setup('Casa e jardim.',[],E);a.panel.hidden=false;a.panel.focus();a.wheel.childNodes.find(b=>b.getAttribute('data-ptbr-lens')==='morfologia').click();a.flush();assert.deepEqual(a.calls,['morfologia']);assert.equal(a.manuscript.value,'Casa e jardim.');assert.ok(a.board.textContent.includes('coordenação nominal'));
console.log('COORDENAÇÃO OK: 28 alvos, papéis, homógrafos, fronteiras, truncamento, UTF-16, custo, ES5 e painel.');
