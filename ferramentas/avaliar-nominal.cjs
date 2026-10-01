'use strict';
// Relatório de utilidade, separado de testes que exigem toda hipótese resolvida.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const args=process.argv.slice(2),output=args[0];
if(!output)throw Error('Uso: node ferramentas/avaliar-nominal.cjs caminho-do-relatorio.json');
const asset=require('../build/assets.json').assets.find(a=>a.id==='cofre');
const E=require(path.join(root,asset.path)).createRuntime(),engine=E.contextualMorphology;
const report={engine:engine.version,independent:false,interpretation:'Amostra pequena própria; nenhuma estimativa de precisão geral. Abstenções em alvos úteis contam como lacunas, não como decisões erradas.',sets:{}};
for(const name of ['desenvolvimento','avaliacao']){
 const source=JSON.parse(fs.readFileSync(path.join(root,'ptbr/corpus/nominal-1',name+'.json'),'utf8'));
 const result={cases:source.cases.length,useful:0,wrong:0,missed:0,expectedAbstentions:0,rows:[]};
 for(const c of source.cases){const item=engine.inspect(c.text).items.find(x=>x.snippet===c.target);const actual=item?item.selected:null;
 const kind=actual===c.expected?(actual?'useful':'expectedAbstentions'):actual?'wrong':'missed';result[kind]++;result.rows.push({id:c.id,expected:c.expected,actual,kind});}
 report.sets[name]=result;
}
fs.writeFileSync(path.resolve(output),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(report.sets).map(([k,v])=>[k,{useful:v.useful,wrong:v.wrong,missed:v.missed,expectedAbstentions:v.expectedAbstentions}]))));
