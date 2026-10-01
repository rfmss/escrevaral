'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),asset=require('../build/assets.json').assets.find(a=>a.id==='cofre');
const E=require(path.join(root,asset.path)).createRuntime(),engine=E.contextualMorphology,vault=E.createVault(E.knowledge);
// A amostra foi fixada antes do motor; após a primeira avaliação, também vira regressão.
for(const set of ['desenvolvimento','avaliacao'])for(const c of require('../ptbr/corpus/nominal-1/'+set+'.json').cases){
 const actual=engine.inspect(c.text).items.find(x=>x.snippet===c.target).selected;
 assert.equal(actual,c.expected,c.id+' '+c.text);
}
const text='😀 cafe\u0301. O filho da vizinha chegou. O livro de o homem chegou.';
const ctx=vm.createContext({Escr:E});for(const file of ['src/storage/documentos.js','src/editor/contrato-analise.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const doc=E.freshDocument();doc.text=text;const request=E.analysisContract.request(doc,text,text.indexOf('O filho'),text.length);
const report=E.analysisContract.analyze(vault,'morfologia',request);
assert.equal(doc.text,text);
for(const f of report.findings){assert.equal(text.slice(f.start,f.end),f.snippet);for(const p of f.context)assert.equal(text.slice(p.start,p.end),p.snippet);}
const filho=report.findings.find(f=>f.snippet==='filho');assert.equal(filho.feature,'substantivo');assert.ok(filho.candidates.portilexicon.some(r=>r.lemma==='filhar'));assert.equal(filho.nominalComplement.complementFeaturesChecked,false);
assert.equal(report.findings.find(f=>f.snippet==='da').feature,'contração (preposição + artigo)');
assert.ok(!engine.inspect('O filho da mulher chegou.').items.find(x=>x.snippet==='chegou').selected,'apoio verbal não prova sujeito nem decide sua classe contextual');
for(const t of ['O filha da mulher chegou.','Os filhos da mulheres chegaram.','O filho da mulher, chegou.','O filho da mulher cantando.','O filho da mulher casas.','O filho da mulher de papel chegou.'])assert.ok(!engine.inspect(t).items.some(x=>x.rule==='PTBR-CTX-007'),t);
const lookup=E.lookupMorphology;E.lookupMorphology=k=>lookup(k).map(r=>k==='filho'?Object.assign({},r,{features:r.features.replace(/Gender=[^|]+\|?/,'')}):r);
assert.ok(!engine.inspect('O filho da vizinha chegou.').items.some(x=>x.rule==='PTBR-CTX-007'));E.lookupMorphology=lookup;
let calls=0;E.lookupMorphology=k=>{calls++;return lookup(k);};const bounded=engine.inspect('O filho da vizinha chegou. '.repeat(2000));assert.ok(bounded.scope.partial);assert.ok(bounded.work.characters<=8000&&bounded.work.tokens<=1600);assert.equal(calls,bounded.work.tokens);E.lookupMorphology=lookup;
require('acorn').parse(fs.readFileSync(path.join(root,'ptbr/morfologia-contextual.js'),'utf8'),{ecmaVersion:5});
console.log('PREPOSICIONAL OK: amostra de 40 alvos (duas lacunas v6.37 resolvidas), fronteiras/traços, candidatos, seleção UTF-16 e limite de trabalho.');
