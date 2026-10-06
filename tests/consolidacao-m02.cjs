'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {collect,outcome,markdown}=require('../ferramentas/consolidar-m02.cjs'),root=path.resolve(__dirname,'..');
assert.equal(outcome('pronome','pronome',false,false),'useful');
assert.equal(outcome(null,'pronome',false,false),'wrong');
assert.equal(outcome('pronome','verbo',false,false),'wrong');
assert.equal(outcome('pronome',null,false,false),'missing');
assert.equal(outcome(null,null,false,false),'abstentions');
assert.equal(outcome(null,null,true,true),'observations');
assert.equal(outcome(null,null,true,false),'missing');
const E=require(path.join(root,require('../build/assets.json').assets.find(a=>a.id==='cofre').path)).createRuntime(),r=collect(E);
assert.equal(r.cases.length,589);assert.deepEqual(r.totals,{useful:258,wrong:0,abstentions:323,missing:2,observations:6});
assert.deepEqual(r.cases.filter(c=>c.outcome==='missing').map(c=>[c.file,c.id]),[['nominal-7/avaliacao.json','AVA04'],['nominal-7/avaliacao.json','AVA06']]);
for(const category of Object.keys(r.totals)){assert.equal(Object.values(r.families).reduce((s,c)=>s+c[category],0),r.totals[category]);assert.equal(Object.values(r.classes).reduce((s,c)=>s+c[category],0),r.totals[category]);}
for(const family of ['locuções verbais','locuções adverbiais','locuções prepositivas','locuções conjuntivas'])assert.equal(r.families[family].useful,12);
assert.equal(Object.keys(r.probes.classes).length,10);assert.equal(r.probes.cases.filter(c=>c.outcome==='open').length,8);
assert.equal(JSON.stringify(r,null,2)+'\n',fs.readFileSync(path.join(root,'docs/jornada/CONSOLIDACAO-M02.json'),'utf8'));
assert.equal(markdown(r),fs.readFileSync(path.join(root,'docs/jornada/CONSOLIDACAO-M02.md'),'utf8'));
console.log('CONSOLIDAÇÃO M02 OK: 589 alvos, contagens conciliadas, observações e duas lacunas preservadas; relatório reproduzível.');
