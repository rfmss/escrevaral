'use strict';
// Relatório de utilidade, separado de testes que exigem toda hipótese resolvida.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const args=process.argv.slice(2),output=args[0],family=args[1]||'nominal-1';
if(!/^nominal-[0-9]+$/.test(family))throw Error('Família inválida');
if(!output)throw Error('Uso: node ferramentas/avaliar-nominal.cjs caminho-do-relatorio.json');
const asset=require('../build/assets.json').assets.find(a=>a.id==='cofre');
const E=require(path.join(root,asset.path)).createRuntime(),engine=E.contextualMorphology;
const report={engine:engine.version,independent:false,interpretation:'Amostra pequena própria; nenhuma estimativa de precisão geral. Abstenções em alvos úteis contam como lacunas, não como decisões erradas.',sets:{}};
for(const name of ['desenvolvimento','avaliacao']){
 const source=JSON.parse(fs.readFileSync(path.join(root,'ptbr/corpus',family,name+'.json'),'utf8'));
 const result={cases:source.cases.length,useful:0,wrong:0,missed:0,expectedAbstentions:0,expectedOpenUses:0,observedOpenUses:0,unexpectedOpenUses:0,rows:[]};
 for(const c of source.cases){const item=engine.inspect(c.text).items.find(x=>x.snippet===c.target);const actual=item?item.selected:null;
 const kind=actual===c.expected?(actual?'useful':'expectedAbstentions'):actual?'wrong':'missed';result[kind]++;
 const open=!!(item&&item.standaloneUse&&item.standaloneUse.resolution==='open');
 if(c.expectedOpenUse){result.expectedOpenUses++;if(open)result.observedOpenUses++;}else if(open&&Object.prototype.hasOwnProperty.call(c,'expectedOpenUse')){result.unexpectedOpenUses++;}
 result.rows.push({id:c.id,expected:c.expected,actual,kind,openUse:open});}
 report.sets[name]=result;
}
fs.writeFileSync(path.resolve(output),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(report.sets).map(([k,v])=>[k,{useful:v.useful,wrong:v.wrong,missed:v.missed,expectedAbstentions:v.expectedAbstentions,observedOpenUses:v.observedOpenUses,expectedOpenUses:v.expectedOpenUses,unexpectedOpenUses:v.unexpectedOpenUses}]))));
