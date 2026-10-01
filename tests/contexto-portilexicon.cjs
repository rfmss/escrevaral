'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),asset=require('../build/assets.json').assets.find(a=>a.id==='cofre');
const E=require(path.join(root,asset.path)).createRuntime(),engine=E.contextualMorphology,vault=E.createVault(E.knowledge);
const cases=[
 ['Tu casas.','casas','contextual','verbo'],
 ['As casas eram brancas.','casas','contextual','substantivo'],
 ['casas','casas','ambiguo',null],
 ['Eu casas.','casas','ambiguo',null],
 ['Nós cantávamos.','cantávamos','contextual','verbo'],
 ['Nós não cantávamos.','cantávamos','contextual','verbo'],
 ['Eu as olhava.','olhava','contextual','verbo'],
 ['Eu as olhava.','as','contextual','pronome'],
 ['Eu dormia.','dormia','contextual','verbo'],
 ['As meninas dormiam.','meninas','contextual','substantivo'],
 ['Os carros chegaram.','carros','contextual','substantivo'],
 ['Carros.','Carros','lexical',null],
 ['Tu dorme.','dorme','lexical',null],
 ['Nós, cantávamos.','cantávamos','lexical',null],
 ['Nós\ncantávamos.','cantávamos','lexical',null],
 ['Nós “cantávamos”.','cantávamos','protegido',null],
 ['Nós `cantávamos`.','cantávamos','protegido',null],
 ['Eu floripava.','floripava','desconhecido',null],
 ['Vi a menina.','menina','contextual','substantivo'],
 ['O filho da vizinha chegou.','filho','contextual','substantivo'],
 ['casa','casa','ambiguo',null],
 ['As casas, eram brancas.','casas','ambiguo',null],
 ['Eu fui.','fui','contextual','verbo'],
 ['Eu o canto.','canto','contextual','verbo'],
 ['O canto terminou.','canto','contextual','substantivo'],
 ['A comida.','comida','contextual','substantivo']
];
for(const [text,target,status,selected]of cases){
 const original=text,report=engine.inspect(text),item=report.items.find(x=>x.snippet===target);
 if(status==='protegido'){assert.equal(item,undefined);continue;}
 assert.ok(item,text);assert.equal(item.status,status,text);assert.equal(item.selected,selected,text);
 const result=vault.analyze('morfologia',text);assert.equal(result.coverageInfo.lexiconVersion,E.portiLexicon.version);
 for(const f of result.findings){assert.equal(text.slice(f.start,f.end),f.snippet);for(const p of f.context)assert.equal(text.slice(p.start,p.end),p.snippet);}
 assert.equal(text,original);
}
// Lema/sentido/auxiliar continuam indecididos mesmo quando a classe verbal é favorecida.
const fui=engine.inspect('Eu fui.').items[1];assert.ok(fui.candidates.portilexicon.some(r=>r.lemma==='ir'));assert.ok(fui.candidates.portilexicon.some(r=>r.lemma==='ser'));
const casa=engine.inspect('Tu casas.').items[1];assert.ok(casa.candidates.classes.includes('substantivo'));
assert.ok(vault.analyze('morfologia','Tu casas.').findings.some(f=>f.evidence.source.title.includes('PortiLexicon-UD')));
const text='😀 cafe\u0301. Nós canta\u0301vamos.',word=engine.inspect(text).items.find(x=>x.snippet==='canta\u0301vamos');assert.equal(word.selected,'verbo');assert.equal(text.slice(word.start,word.end),word.snippet);
// Sintaxe/relativas conservam o inventário legado: nenhum parse do novo léxico nessas lentes.
const originalLookup=E.lookupMorphology;E.lookupMorphology=()=>{throw Error('Propagação indevida para outra lente');};
assert.equal(engine.readings('carros').portilexicon,undefined);
assert.ok(vault.analyze('sintaxe','A menina leu a carta.').findings.length);
vault.analyze('relativas','A menina que leu a carta chegou.');E.lookupMorphology=originalLookup;
// O inventário original continua isolado de resultados mutáveis da lente.
const r=engine.lexicalReadings('casas');r.classes.push('injetado');r.portilexicon[0].lemma='injetado';assert.ok(!engine.lexicalReadings('casas').classes.includes('injetado'));
assert.ok(!engine.lexicalReadings('casas').portilexicon.some(x=>x.lemma==='injetado'));
let lookups=0;E.lookupMorphology=function(k){lookups++;return originalLookup(k);};
const bounded=engine.inspect('Nós cantávamos. '.repeat(2000));assert.ok(bounded.scope.partial);assert.ok(bounded.work.characters<=8000);assert.ok(bounded.work.tokens<=1600);assert.equal(lookups,bounded.work.tokens);E.lookupMorphology=originalLookup;
acorn.parse(fs.readFileSync(path.join(root,'ptbr/morfologia-contextual.js'),'utf8'),{ecmaVersion:5});
const {setup}=require('../ptbr/teste-painel.js');const a=setup('Nós cantávamos.',[],E);a.panel.hidden=false;a.panel.focus();a.wheel.childNodes.find(b=>b.getAttribute('data-ptbr-lens')==='morfologia').click();a.flush();assert.deepEqual(a.calls,['morfologia']);assert.equal(a.manuscript.value,'Nós cantávamos.');
console.log('CONTEXTO PORTILEXICON OK: '+cases.length+' contrastes, origem, ambiguidade, UTF-16/NFD, isolamento das lentes e teto de consultas por token.');
