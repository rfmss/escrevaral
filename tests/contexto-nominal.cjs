'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const asset=require('../build/assets.json').assets.find(a=>a.id==='cofre');
const E=require(path.resolve(__dirname,'..',asset.path)).createRuntime(),engine=E.contextualMorphology,vault=E.createVault(E.knowledge);
const positives=[
 ['As casas brancas.',['artigo','substantivo','adjetivo'],true],
 ['Os carros vermelhos.',['artigo','substantivo','adjetivo'],true],
 ['O velho homem.',['artigo','adjetivo','substantivo'],true],
 ['O grande homem.',['artigo','adjetivo','substantivo'],false],
 ['A mulher feliz.',['artigo','substantivo','adjetivo'],false]
];
for(const [text,classes,marked]of positives){
 const report=engine.inspect(text);assert.deepEqual(report.items.map(x=>x.selected),classes,text);
 for(const item of report.items){assert.equal(item.rule,'PTBR-CTX-006');assert.equal(item.nominalAgreement.adjectiveGenderMarked,marked);}
 const result=vault.analyze('morfologia',text);assert.equal(result.findings.length,3);
 for(const f of result.findings){assert.equal(f.confidence,'moderada');assert.equal(f.context.length,3);assert.equal(text.slice(f.start,f.end),f.snippet);for(const p of f.context)assert.equal(text.slice(p.start,p.end),p.snippet);}
 if(!marked)assert.ok(JSON.stringify(result).includes('A fonte não informa gênero'));
}
const negatives=['As casas branco.','As casas branca.','Os casas brancas.','As casas, brancas.','As casas\nbrancas.','As casas “brancas”.','As `casas` brancas.','As casas muito brancas.','A mulher baixa.','As qwerty brancas.','Tu as casas brancas.'];
for(const text of negatives)assert.ok(!engine.inspect(text).items.some(x=>x.rule==='PTBR-CTX-006'),text);
const ambiguous=engine.inspect('A bela menina.').items;assert.ok(ambiguous.every(x=>x.nominalAmbiguity&&!x.selected));
assert.ok(JSON.stringify(vault.analyze('morfologia','A bela menina.')).includes('duas distribuições'));
assert.equal(engine.inspect('Tu as casas brancas.').items[2].selected,'verbo');
// Lacunas de traços: não completar gênero/número do nome ou número do adjetivo.
const lookup=E.lookupMorphology;
for(const [key,feature]of [['casas','Gender'],['casas','Number'],['brancas','Number']]){
 E.lookupMorphology=k=>lookup(k).map(r=>k===key?Object.assign({},r,{features:r.features.split('|').filter(f=>!f.startsWith(feature+'=')).join('|')}):r);
 assert.ok(!engine.inspect('As casas brancas.').items.some(x=>x.rule==='PTBR-CTX-006'),key+feature);
}
E.lookupMorphology=lookup;
// Valores combinados da fonte são conjuntos; não exigem igualdade textual.
E.lookupMorphology=k=>lookup(k).map(r=>k==='brancas'&&r.pos==='ADJ'?Object.assign({},r,{features:r.features.replace('Gender=Fem','Gender=Fem,Masc')}):r);
assert.equal(engine.inspect('As casas brancas.').items[2].selected,'adjetivo');E.lookupMorphology=lookup;
const vm=require('node:vm'),fs=require('node:fs'),ctx=vm.createContext({Escr:E});
for(const file of ['src/storage/documentos.js','src/editor/contrato-analise.js'])vm.runInContext(fs.readFileSync(path.resolve(__dirname,'..',file),'utf8'),ctx);
const text='😀 cafe\u0301. As casas brancas. O velho homem.',start=text.indexOf('As'),doc=E.freshDocument();doc.text=text;
const request=E.analysisContract.request(doc,text,start,text.length),result=E.analysisContract.analyze(vault,'morfologia',request);
assert.equal(doc.text,text);assert.equal(result.findings.length,6);
for(const f of result.findings){assert.equal(text.slice(f.start,f.end),f.snippet);for(const p of f.context)assert.equal(text.slice(p.start,p.end),p.snippet);}
let calls=0;E.lookupMorphology=k=>{calls++;return lookup(k);};const limited=engine.inspect('As casas brancas. '.repeat(2000));assert.ok(limited.scope.partial);assert.ok(limited.work.characters<=8000&&limited.work.tokens<=1600);assert.equal(calls,limited.work.tokens);E.lookupMorphology=lookup;
const {setup}=require('../ptbr/teste-painel.js'),a=setup('As casas brancas.',[],E);a.panel.hidden=false;a.panel.focus();a.wheel.childNodes.find(b=>b.getAttribute('data-ptbr-lens')==='morfologia').click();a.flush();assert.deepEqual(a.calls,['morfologia']);assert.equal(a.manuscript.value,'As casas brancas.');
console.log('CONTEXTO NOMINAL OK: 17 contrastes, traços ausentes/combinados, clítico, seleção UTF-16, teto de consultas e painel.');
