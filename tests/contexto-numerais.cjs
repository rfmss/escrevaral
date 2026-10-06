'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),asset=require('../build/assets.json').assets.find(a=>a.id==='cofre');
const E=require(path.join(root,asset.path)).createRuntime(),engine=E.contextualMorphology,lookup=E.lookupMorphology;
const report={version:engine.version,sets:{}};
for(const set of ['desenvolvimento','avaliacao']){
 const counts={useful:0,wrong:0,abstentions:0,missing:0};
 for(const c of require('../ptbr/corpus/numerais-1/'+set+'.json').cases){
  const found=engine.inspect(c.text).items.some(x=>x.rule==='PTBR-CTX-015');
  counts[found?(c.expected?'useful':'wrong'):(c.expected?'missing':'abstentions')]++;
  assert.equal(found,c.expected,c.id+': '+c.text);
 }
 assert.deepEqual(counts,{useful:6,wrong:0,abstentions:10,missing:0});report.sets[set]=counts;
}
// Resultado inclui os dois apoios e alternativas, sem atribuir quantidade ou sintaxe.
const vault=E.createVault(E.knowledge),source='Três casas.',findings=vault.analyze('morfologia',source).findings.filter(x=>x.id==='PTBR-CTX-015');
assert.equal(findings.length,2);assert.equal(findings[0].feature,'numeral');assert.equal(findings[1].feature,'substantivo');
assert.equal(findings[0].confidence,'moderada');assert.equal(findings[0].nominalNumeral.numeralGenderMarked,false);
assert.equal(findings[0].nominalNumeral.quantityResolved,false);assert.equal(findings[0].nominalNumeral.syntaxResolved,false);
assert.ok(findings[1].candidates.portilexicon.some(x=>x.pos==='VERB'));
assert.equal(engine.inspect('Duas casas.').items[0].nominalNumeral.numeralGenderMarked,true);
for(const f of findings){assert.equal(source.slice(f.start,f.end),f.snippet);assert.equal(f.context.length,2);for(const p of f.context)assert.equal(source.slice(p.start,p.end),p.snippet);}
for(const w of ['dois','duas','três'])assert.ok(lookup(w).some(r=>r.pos==='NUM'&&r.features.includes('NumType=Card')&&!r.features.includes('Number=')));
// Fonte ausente ou incompleta: inventário legado não substitui o dado requerido.
for(const altered of [
 (k,rows)=>rows.filter(r=>r.pos!=='NUM'),
 (k,rows)=>rows.map(r=>r.pos==='NUM'?{...r,features:r.features.replace('NumType=Card','NumType=Ord')}:r),
 (k,rows)=>rows.map(r=>r.pos==='NOUN'?{...r,features:r.features.replace('Number=Plur','Number=Sing')}:r),
 (k,rows)=>rows.map(r=>r.pos==='NUM'?{...r,features:r.features.replace('Gender=Fem|','')}:r),
 (k,rows)=>rows.map(r=>r.pos==='NOUN'?{...r,features:r.features.replace('Gender=Fem|','')}:r)
]){E.lookupMorphology=k=>altered(k,lookup(k));assert.ok(!engine.inspect('Duas casas.').items.some(x=>x.rule==='PTBR-CTX-015'));}
E.lookupMorphology=lookup;
for(const s of ['“Dois” livros.','Dois `livros`.','Dois https://livros.com.','Dois\nlivros.','Dois livros,','Eu dois livros.','Dois livros e casas.','Dois livros de poesia.','Três revistas.','Três metros.','Dois reais.'])assert.ok(!engine.inspect(s).items.some(x=>x.rule==='PTBR-CTX-015'),s);
assert.equal(engine.inspect('Dois\tlivros.').items.filter(x=>x.rule==='PTBR-CTX-015').length,2);
assert.equal(engine.inspect('Ela chegou. Dois\u00a0livros.').items.filter(x=>x.rule==='PTBR-CTX-015').length,2);
const ctx=vm.createContext({Escr:E});for(const file of ['src/storage/documentos.js','src/editor/contrato-analise.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const text='😀 cafe\u0301. Tre\u0302s casas.',doc=E.freshDocument();doc.text=text;
const r=E.analysisContract.analyze(vault,'morfologia',E.analysisContract.request(doc,text,text.indexOf('Tre'),text.length));
assert.equal(doc.text,text);assert.equal(r.findings.filter(x=>x.id==='PTBR-CTX-015').length,2);
for(const f of r.findings){assert.equal(text.slice(f.start,f.end),f.snippet);for(const p of f.context)assert.equal(text.slice(p.start,p.end),p.snippet);}
assert.ok(!engine.inspect(' '.repeat(7991)+'Dois livros.').items.some(x=>x.rule==='PTBR-CTX-015'),'token cortado não dá apoio');
assert.ok(!engine.inspect('x '.repeat(1598)+'. Dois livros novos.').items.some(x=>x.rule==='PTBR-CTX-015'),'teto de tokens não cria unidade completa');
let calls=0;E.lookupMorphology=k=>{calls++;return lookup(k);};const bounded=engine.inspect('Dois livros. '.repeat(2000));assert.ok(bounded.scope.partial);assert.ok(bounded.work.characters<=8000&&bounded.work.tokens<=1600);assert.equal(calls,bounded.work.tokens);E.lookupMorphology=lookup;
require('acorn').parse(fs.readFileSync(path.join(root,'ptbr/morfologia-contextual.js'),'utf8'),{ecmaVersion:5});
const {setup}=require('../ptbr/teste-painel.js'),a=setup(source,[],E);a.panel.hidden=false;a.panel.focus();a.wheel.childNodes.find(b=>b.getAttribute('data-ptbr-lens')==='morfologia').click();a.flush();assert.deepEqual(a.calls,['morfologia']);assert.equal(a.manuscript.value,source);assert.ok(a.board.textContent.includes('cardinal'));
if(process.argv.includes('--report'))fs.writeFileSync(path.join(root,'ptbr/corpus/numerais-1/depois.json'),JSON.stringify(report,null,2)+'\n');
console.log('NUMERAIS OK: 32 alvos (12 úteis, 20 abstenções, zero erradas/lacunas), dados reais, traços ausentes, homógrafos, proteção, seleção/NFD, truncamento, autoria, custo, ES5 e painel.');
