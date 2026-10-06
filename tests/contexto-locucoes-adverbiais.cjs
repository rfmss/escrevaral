'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),asset=require('../build/assets.json').assets.find(a=>a.id==='cofre'),E=require(path.join(root,asset.path)).createRuntime(),engine=E.contextualMorphology,lookup=E.lookupMorphology;
const report={version:engine.version,sets:{}};
for(const set of ['desenvolvimento','avaliacao']){
 const counts={useful:0,wrong:0,abstentions:0,missing:0};
 for(const c of require('../ptbr/corpus/locucoes-adverbiais-1/'+set+'.json').cases){const found=engine.inspect(c.text).locutions.length>0;counts[found?(c.expected?'useful':'wrong'):(c.expected?'missing':'abstentions')]++;assert.equal(found,c.expected,c.id+': '+c.text);}
 assert.deepEqual(counts,{useful:6,wrong:0,abstentions:10,missing:0});report.sets[set]=counts;
}
const vault=E.createVault(E.knowledge),source='Eu canto de vez em quando.',r=engine.inspect(source),f=vault.analyze('morfologia',source).findings.find(x=>x.id==='PTBR-CTX-017');
assert.ok(f);assert.equal(f.feature,'locução adverbial');assert.equal(f.snippet,'de vez em quando');assert.equal(f.locution.syntaxResolved,false);assert.equal(f.locution.frequencyResolved,false);assert.equal(f.context.length,6);assert.equal(f.candidates.components.length,4);
for(const x of r.items.slice(2)){assert.notEqual(x.selected,'advérbio','classe do grupo não se propaga ao componente');assert.equal(x.rule,null);}
assert.ok(f.candidates.components[3].readings.some(x=>x.pos==='SCONJ'));for(const p of [f,...f.context])assert.equal(source.slice(p.start,p.end),p.snippet);
for(const word of ['de','vez','em','quando']){E.lookupMorphology=k=>k===word?[]:lookup(k);assert.equal(engine.inspect(source).locutions.length,0,word+' sem dado real');}E.lookupMorphology=lookup;
for(const s of ['Eu canto de vez em quando\nmais.','Ontem eu canto de vez em quando.','Eu canto de vez em quando e canto.','De vez em quando; eu canto.','De vez em quando,\neu canto.','Eu canto de vez em “quando”.','Eu canto de vez em quando, eu canto.'])assert.equal(engine.inspect(s).locutions.length,0,s);
assert.equal(engine.inspect('Ela chegou. De vez em quando, eu canto.').locutions.length,1);
const ctx=vm.createContext({Escr:E});for(const file of ['src/storage/documentos.js','src/editor/contrato-analise.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const text='😀 cafe\u0301. No\u0301s cantamos de vez em quando.',doc=E.freshDocument();doc.text=text;
const selected=E.analysisContract.analyze(vault,'morfologia',E.analysisContract.request(doc,text,text.indexOf('No'),text.length));assert.equal(doc.text,text);assert.ok(selected.findings.some(x=>x.id==='PTBR-CTX-017'));for(const x of selected.findings)for(const p of [x,...x.context])assert.equal(text.slice(p.start,p.end),p.snippet);
assert.equal(engine.inspect(' '.repeat(7980)+source).locutions.length,0,'locução truncada');assert.equal(engine.inspect('x '.repeat(1595)+'. '+source+' Mais.').locutions.length,0,'teto corta o último componente');
let calls=0;E.lookupMorphology=k=>{calls++;return lookup(k);};const bounded=engine.inspect((source+' ').repeat(2000));assert.ok(bounded.scope.partial);assert.ok(bounded.work.characters<=8000&&bounded.work.tokens<=1600);assert.equal(calls,bounded.work.tokens);E.lookupMorphology=lookup;
assert.ok(vault.analyze('morfologia',(source+' ').repeat(50)).findings.length<=100);
for(const file of ['ptbr/morfologia-contextual.js','ptbr/leitura-visual.js'])require('acorn').parse(fs.readFileSync(path.join(root,file),'utf8'),{ecmaVersion:5});
const {setup}=require('../ptbr/teste-painel.js');for(const s of [source,'De vez em quando, eu canto.']){
 const a=setup(s,[],E);a.panel.hidden=false;a.panel.focus();a.wheel.childNodes.find(b=>b.getAttribute('data-ptbr-lens')==='morfologia').click();a.flush();assert.deepEqual(a.calls,['morfologia']);assert.equal(a.manuscript.value,s);assert.ok(a.board.textContent.includes('locução adverbial'));
 function all(n){return [n,...n.childNodes.flatMap(all)];}const paragraphs=all(a.board).filter(n=>n.className==='ptbr-fragment-original');assert.equal(paragraphs.map(n=>n.textContent).join(''),s.slice(0,-1),'anotação não repete os componentes');
 const tags=all(a.board).filter(n=>n.getAttribute('data-word-class')==='locução adverbial');assert.equal(tags.length,1);
}
if(process.argv.includes('--report'))fs.writeFileSync(path.join(root,'ptbr/corpus/locucoes-adverbiais-1/depois.json'),JSON.stringify(report,null,2)+'\n');
console.log('LOCUÇÃO ADVERBIAL OK: 32 alvos, 12 úteis/20 abstenções, zero erradas/lacunas; grupo/componentes separados, inventário real, apoios/seleção, proteção/truncamento/custo, cap, ES5 e painel sem duplicação.');
