'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const files=fs.readdirSync(path.join(root,'tests')).filter(p=>p.endsWith('.cjs')&&!p.includes('browser')).sort().map(p=>'tests/'+p).concat(['ptbr/teste-triagem.js','ptbr/teste-painel.js']);
for(const file of files){const result=cp.spawnSync(process.execPath,[file],{cwd:root,stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);}
console.log('OK: '+files.length+' verificações essenciais.');
