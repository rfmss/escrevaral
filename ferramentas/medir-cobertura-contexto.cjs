'use strict';
// Sondas por classe. Diagnóstico explícito, não gate estatístico nem cobertura geral.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),asset=require('../build/assets.json').assets.find(x=>x.id==='cofre');
const E=require(path.join(root,asset.path)).createRuntime();
const corpus=require('../ptbr/corpus/cobertura-m02/sondas.json'),classes={};
const cases=corpus.cases.map(c=>{
 const item=E.contextualMorphology.inspect(c.text).items.find(x=>x.snippet===c.target);
 const selected=item&&item.selected,outcome=selected===c.class?'useful':selected?'different':'open';
 if(!classes[c.class])classes[c.class]={useful:0,different:0,open:0};classes[c.class][outcome]++;
 return {...c,status:item?item.status:'ausente',selected:selected||null,rule:item&&item.rule||null,outcome,candidates:item?item.candidates.classes:[]};
});
const report={schemaVersion:1,kind:corpus.kind,runtimeVersion:E.contextualMorphology.version,lexiconVersion:E.portiLexicon.version,classes,cases};
const output=process.argv[2];if(output)fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({runtimeVersion:report.runtimeVersion,classes},null,2));
