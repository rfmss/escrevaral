'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const asset=require('../build/assets.json').assets.find(a=>a.id==='cofre'),E=require(path.resolve(__dirname,'..',asset.path)).createRuntime();
const engine=E.contextualMorphology,vault=E.createVault(E.knowledge);
for(const set of ['desenvolvimento','avaliacao'])for(const c of require('../ptbr/corpus/nominal-2/'+set+'.json').cases){
 const item=engine.inspect(c.text).items.find(x=>x.snippet===c.target);assert.equal(item?item.selected:null,c.expected,c.id+' '+c.text);
 for(const f of vault.analyze('morfologia',c.text).findings){assert.equal(c.text.slice(f.start,f.end),f.snippet);for(const p of f.context)assert.equal(c.text.slice(p.start,p.end),p.snippet);}
}
const r=vault.analyze('morfologia','Uma mulher feliz chegou.').findings.find(f=>f.snippet==='Uma');assert.equal(r.feature,'artigo');assert.ok(r.candidates.classes.includes('numeral'));assert.ok(JSON.stringify(r.evidence).includes('também podem expressar quantidade'));
for(const text of ['Eu um canto.','Eu uma canto.','Eu uns canto.','Eu umas canto.'])assert.ok(!engine.inspect(text).items.some(x=>x.rule==='PTBR-CTX-003'),'indefinido não é clítico: '+text);
assert.equal(engine.inspect('Eu o canto.').items[1].selected,'pronome');
for(const [word,lemma]of [['caiu','cair'],['caíram','cair'],['chegávamos','chegar'],['terminavam','terminar']]){const readings=E.lookupLexeme(word).morphology;assert.ok(readings.some(r=>r.lemma===lemma&&r.pos==='VERB'));}
assert.equal(E.portiLexicon.version,'315e063da1f8-recorte-2');
const {setup}=require('../ptbr/teste-painel.js'),a=setup('Uma filha de uma mulher chegou.',[],E);a.panel.hidden=false;a.panel.focus();a.wheel.childNodes.find(b=>b.getAttribute('data-ptbr-lens')==='morfologia').click();a.flush();assert.deepEqual(a.calls,['morfologia']);assert.equal(a.manuscript.value,'Uma filha de uma mulher chegou.');
console.log('INDEFINIDOS OK: 20 alvos, numeral preservado, clíticos separados, novas flexões e painel.');
