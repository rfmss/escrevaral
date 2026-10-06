'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),asset=require('../build/assets.json').assets.find(a=>a.id==='cofre'),E=require(path.join(root,asset.path)).createRuntime(),engine=E.contextualMorphology,lookup=E.lookupMorphology;
const report={version:engine.version,sets:{}};
for(const set of ['desenvolvimento','avaliacao']){
 const counts={useful:0,wrong:0,abstentions:0,missing:0};for(const c of require('../ptbr/corpus/locucoes-verbais-classes-1/'+set+'.json').cases){const found=engine.inspect(c.text).locutions.some(g=>g.kind==='verbal');counts[found?(c.expected?'useful':'wrong'):(c.expected?'missing':'abstentions')]++;assert.equal(found,c.expected,c.id+': '+c.text);}assert.deepEqual(counts,{useful:6,wrong:0,abstentions:10,missing:0});report.sets[set]=counts;
}
const vault=E.createVault(E.knowledge),source='Ela pode abrir.',f=vault.analyze('morfologia',source).findings.find(x=>x.id==='PTBR-CTX-018');
assert.ok(f);assert.equal(f.snippet,'pode abrir');assert.equal(f.feature,'locução verbal');assert.equal(f.locution.modalityResolved,false);assert.equal(f.locution.auxiliaryFunctionResolved,false);assert.equal(f.locution.syntaxResolved,false);assert.equal(f.context.length,3);assert.equal(f.candidates.components.length,2);
assert.ok(f.candidates.components[0].readings.some(x=>x.lemma==='podar'));assert.ok(f.candidates.components[1].readings.some(x=>x.pos==='NOUN'));for(const p of [f,...f.context])assert.equal(source.slice(p.start,p.end),p.snippet);
assert.equal(engine.inspect(source).items[1].rule,'PTBR-CTX-001');assert.equal(engine.inspect(source).items[2].selected,null,'grupo não substitui leitura do componente');
for(const mutate of [
 (k,r)=>r.filter(x=>x.lemma!=='poder'),
 (k,r)=>r.map(x=>x.lemma==='poder'?{...x,features:x.features.replace('Person=3','Person=1')}:x),
 (k,r)=>r.map(x=>x.lemma==='poder'?{...x,features:x.features.replace('Mood=Ind','Mood=Sub')}:x),
 (k,r)=>r.filter(x=>x.features!=='VerbForm=Inf'),
 (k,r)=>r.map(x=>x.lemma==='poder'?{...x,features:x.features.replace('Number=Sing|','')}:x),
 (k,r)=>r.map(x=>x.lemma==='poder'?{...x,features:x.features.replace('VerbForm=Fin','VerbForm=Inf')}:x),
 (k,r)=>r.map(x=>x.features==='VerbForm=Inf'?{...x,pos:'NOUN'}:x)
 ]){E.lookupMorphology=k=>mutate(k,lookup(k));assert.ok(!engine.inspect(source).locutions.some(g=>g.kind==='verbal'),'dados reais ausentes/incompatíveis não são substituídos');}E.lookupMorphology=lookup;
const mixed='Eu posso ler. Eu canto de vez em quando. Ela pode abrir.';
assert.deepEqual(engine.inspect(mixed).locutions.map(g=>g.kind),['verbal','adverbial','verbal']);assert.deepEqual(vault.analyze('morfologia',mixed).findings.filter(x=>x.locution).map(x=>x.id),['PTBR-CTX-018','PTBR-CTX-017','PTBR-CTX-018']);
const ctx=vm.createContext({Escr:E});for(const file of ['src/storage/documentos.js','src/editor/contrato-analise.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const text='😀 cafe\u0301. Ela po\u0302de sair.',doc=E.freshDocument();doc.text=text;const r=E.analysisContract.analyze(vault,'morfologia',E.analysisContract.request(doc,text,text.indexOf('Ela'),text.length));assert.equal(doc.text,text);assert.ok(r.findings.some(x=>x.id==='PTBR-CTX-018'));for(const x of r.findings)for(const p of [x,...x.context])assert.equal(text.slice(p.start,p.end),p.snippet);
for(const s of ['Eu posso\nsair.','Eu posso https://sair.com.','Eu posso `sair`.','Eu posso cantar,','Ontem eu posso ler.','Eu posso cantar de vez em quando.','Eu posso ser.','Eu posso haver.','Eu posso ir.'])assert.ok(!engine.inspect(s).locutions.some(g=>g.kind==='verbal'),s);
assert.ok(!engine.inspect(' '.repeat(7990)+'Eu posso cantar.').locutions.some(g=>g.kind==='verbal'));assert.ok(!engine.inspect('x '.repeat(1598)+'. Eu posso cantar.').locutions.some(g=>g.kind==='verbal'));
let calls=0;E.lookupMorphology=k=>{calls++;return lookup(k);};const bound=engine.inspect('Eu posso ler. '.repeat(2000));assert.ok(bound.scope.partial);assert.ok(bound.work.characters<=8000&&bound.work.tokens<=1600);assert.equal(calls,bound.work.tokens);E.lookupMorphology=lookup;assert.ok(vault.analyze('morfologia','Eu posso ler. '.repeat(100)).findings.length<=100);
require('acorn').parse(fs.readFileSync(path.join(root,'ptbr/morfologia-contextual.js'),'utf8'),{ecmaVersion:5});
const {setup}=require('../ptbr/teste-painel.js'),a=setup(source,[],E);a.panel.hidden=false;a.panel.focus();a.wheel.childNodes.find(b=>b.getAttribute('data-ptbr-lens')==='morfologia').click();a.flush();assert.deepEqual(a.calls,['morfologia']);assert.equal(a.manuscript.value,source);function all(n){return [n,...n.childNodes.flatMap(all)];}assert.equal(all(a.board).filter(n=>n.className==='ptbr-fragment-original').map(n=>n.textContent).join(''),source.slice(0,-1));assert.equal(all(a.board).filter(n=>n.getAttribute('data-word-class')==='locução verbal').length,1);
if(process.argv.includes('--report'))fs.writeFileSync(path.join(root,'ptbr/corpus/locucoes-verbais-classes-1/depois.json'),JSON.stringify(report,null,2)+'\n');
console.log('MODAL OK: 32 alvos, 12 úteis/20 abstenções, zero erradas/lacunas; fonte real, homógrafos/traços, grupo/componentes, ordem mista, proteção, seleção, tetos/custo, autoria, ES5, painel de lente única.');
