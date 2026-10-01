'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),asset=require('../build/assets.json').assets.find(a=>a.id==='cofre');
const E=require(path.join(root,asset.path)).createRuntime(),engine=E.contextualMorphology,vault=E.createVault(E.knowledge);
for(const set of ['desenvolvimento','avaliacao'])for(const c of require('../ptbr/corpus/nominal-4/'+set+'.json').cases){
 const item=engine.inspect(c.text).items.find(x=>x.snippet===c.target);assert.equal(item?item.selected:null,c.expected,c.id);
 assert.equal(!!(item&&item.standaloneUse&&item.standaloneUse.resolution==='open'),c.expectedOpenUse,c.id);
}
const mine=vault.analyze('morfologia','O meu caiu.').findings.find(f=>f.snippet==='meu');assert.equal(mine.analysisStatus,'ambiguo');assert.equal(mine.confidence,'insuficiente');assert.equal(mine.standaloneUse.referenceResolved,false);assert.ok(mine.message.includes('leitura em aberto'));assert.ok(mine.candidates.portilexicon.some(r=>r.pos==='NOUN'));assert.ok(mine.candidates.portilexicon.some(r=>r.pos==='PRON'));assert.ok(JSON.stringify(mine.evidence).includes('elipse'));
const that=vault.analyze('morfologia','Aquele chegou.').findings[0];assert.equal(that.feature,'pronome');assert.equal(that.confidence,'moderada');assert.ok(that.candidates.portilexicon.some(r=>r.lemma==='aquelar'));assert.equal(that.standaloneUse.referenceResolved,false);
// A pessoa do possuidor não é a pessoa da forma verbal apoiadora.
for(const text of ['O meu caí.','Os nossos caímos.','A meu caiu.','O minha caiu.','O meu, caiu.','O meu\ncaiu.','O meu `caiu`.','O meu e o seu caíram.','Ontem este chegou.','Isto chegou.'])assert.ok(!engine.inspect(text).items.some(x=>x.standaloneUse),text);
for(const text of ['Este canto.','Minha casa caiu.','O meu livro caiu.'])assert.ok(!engine.inspect(text).items.some(x=>x.standaloneUse),text);
const clause=engine.inspect('Chegou. Este não caiu.').items.find(x=>x.snippet==='Este');assert.equal(clause.selected,'pronome');
// Seleção é o próprio recorte; seus apoios continuam no original.
const text='😀 cafe\u0301. Este chegou. O meu na\u0303o caiu.',ctx=vm.createContext({Escr:E});
for(const file of ['src/storage/documentos.js','src/editor/contrato-analise.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const doc=E.freshDocument();doc.text=text;const result=E.analysisContract.analyze(vault,'morfologia',E.analysisContract.request(doc,text,text.indexOf('Este'),text.length));assert.equal(doc.text,text);assert.equal(result.findings.filter(x=>x.standaloneUse).length,2);
for(const f of result.findings){assert.equal(text.slice(f.start,f.end),f.snippet);for(const p of f.context)assert.equal(text.slice(p.start,p.end),p.snippet);}
const lookup=E.lookupMorphology;E.lookupMorphology=k=>lookup(k).map(r=>k==='este'&&r.pos==='PRON'?Object.assign({},r,{features:r.features.replace(/Number=[^|]+\|?/,'')}):r);assert.ok(!engine.inspect('Este chegou.').items[0].standaloneUse);E.lookupMorphology=lookup;
let calls=0;E.lookupMorphology=k=>{calls++;return lookup(k);};const bounded=engine.inspect('Este chegou. O meu caiu. '.repeat(2000));assert.ok(bounded.scope.partial);assert.ok(bounded.work.characters<=8000&&bounded.work.tokens<=1600);assert.equal(calls,bounded.work.tokens);E.lookupMorphology=lookup;
require('acorn').parse(fs.readFileSync(path.join(root,'ptbr/morfologia-contextual.js'),'utf8'),{ecmaVersion:5});
const {setup}=require('../ptbr/teste-painel.js'),a=setup('O meu caiu.',[],E);a.panel.hidden=false;a.panel.focus();a.wheel.childNodes.find(b=>b.getAttribute('data-ptbr-lens')==='morfologia').click();a.flush();assert.deepEqual(a.calls,['morfologia']);assert.equal(a.manuscript.value,'O meu caiu.');assert.ok(a.board.textContent.includes('leitura em aberto'));
console.log('SEM NOME OK: 20 alvos, observações separadas de decisões, pessoa/número, candidatos, posições e painel.');
