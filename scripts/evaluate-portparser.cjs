'use strict';
const fs=require('node:fs');
const [textFile,conlluFile]=process.argv.slice(2);
if(!textFile||!conlluFile){console.error('Uso: node scripts/evaluate-portparser.cjs texto.txt saida.conllu');process.exit(2);}
const result=require('../packages/connectors/portparser/import-conllu.cjs').importConllu(fs.readFileSync(textFile,'utf8'),fs.readFileSync(conlluFile,'utf8'));
console.log(JSON.stringify(result,null,2));if(result.status!=='alinhado')process.exitCode=1;
