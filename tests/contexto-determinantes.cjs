'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),asset=require('../build/assets.json').assets.find(a=>a.id==='cofre');
const E=require(path.join(root,asset.path)).createRuntime(),engine=E.contextualMorphology,vault=E.createVault(E.knowledge);
for(const set of ['desenvolvimento','avaliacao'])for(const c of require('../ptbr/corpus/nominal-3/'+set+'.json').cases){
 const item=engine.inspect(c.text).items.find(x=>x.snippet===c.target);assert.equal(item?item.selected:null,c.expected,c.id+' '+c.text);
}
for(const [text,kind]of [['Minha casa.','possessivo'],['Esta casa.','demonstrativo'],['As minhas casas.','possessivo']]){
 const result=vault.analyze('morfologia',text),f=result.findings.find(x=>x.feature==='determinante (UD)');
 assert.equal(f.nominalDeterminer.kind,kind);assert.equal(f.nominalDeterminer.sourcePos,'DET');assert.ok(f.candidates.portilexicon.some(x=>x.pos==='PRON'));assert.ok(f.candidates.portilexicon.some(x=>x.pos==='DET'));assert.ok(f.message.includes(kind+' acompanhando um nome'));
 for(const item of result.findings)for(const p of item.context)assert.equal(text.slice(p.start,p.end),p.snippet);
}
// Novos homógrafos ficam disponíveis; artigo + possessivo isolado não vira substantivo.
assert.ok(E.lookupMorphology('aquele').some(x=>x.lemma==='aquelar'&&x.pos==='VERB'));
assert.ok(E.lookupMorphology('meu').some(x=>x.pos==='NOUN'));
for(const text of ['O meu.','O meu velho livro.','A minha.','As minhas casa.','O minha casa.','Minha madeira.'])assert.ok(!engine.inspect(text).items.some(x=>x.rule==='PTBR-CTX-008'),text);
// Madeira não tem Gender no snapshot: não inventar um traço para obter cobertura.
const lookup=E.lookupMorphology;E.lookupMorphology=k=>lookup(k).map(r=>k==='minha'?Object.assign({},r,{features:r.features.replace(/Gender=[^|]+\|?/,'')}):r);
assert.ok(!engine.inspect('Minha casa.').items.some(x=>x.rule==='PTBR-CTX-008'));E.lookupMorphology=lookup;
const text='😀 cafe\u0301. As minhas casas. Esta casa.',ctx=vm.createContext({Escr:E});
for(const file of ['src/storage/documentos.js','src/editor/contrato-analise.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const doc=E.freshDocument();doc.text=text;const report=E.analysisContract.analyze(vault,'morfologia',E.analysisContract.request(doc,text,text.indexOf('As'),text.length));
assert.equal(doc.text,text);assert.ok(report.findings.some(x=>x.nominalDeterminer));
for(const f of report.findings){assert.equal(text.slice(f.start,f.end),f.snippet);for(const p of f.context)assert.equal(text.slice(p.start,p.end),p.snippet);}
let calls=0;E.lookupMorphology=k=>{calls++;return lookup(k);};const bounded=engine.inspect('As minhas casas. '.repeat(2000));assert.ok(bounded.scope.partial);assert.ok(bounded.work.characters<=8000&&bounded.work.tokens<=1600);assert.equal(calls,bounded.work.tokens);E.lookupMorphology=lookup;
require('acorn').parse(fs.readFileSync(path.join(root,'ptbr/morfologia-contextual.js'),'utf8'),{ecmaVersion:5});
const {setup}=require('../ptbr/teste-painel.js'),a=setup('Minha casa.',[],E);a.panel.hidden=false;a.panel.focus();a.wheel.childNodes.find(b=>b.getAttribute('data-ptbr-lens')==='morfologia').click();a.flush();assert.deepEqual(a.calls,['morfologia']);assert.equal(a.manuscript.value,'Minha casa.');assert.ok(a.board.textContent.includes('possessivo acompanhando um nome'));
console.log('DETERMINANTES OK: 30 alvos, categoria/fonte, elipse e homógrafos, traços ausentes, seleção UTF-16, limite de trabalho e painel.');
