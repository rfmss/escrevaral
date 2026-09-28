'use strict';
// A prova isolada deve continuar verificável na main, sem entrar no bundle.
const path=require('node:path'),cp=require('node:child_process');
const result=cp.spawnSync(process.execPath,[path.join(__dirname,'../packages/experiments/lexical-index/test.cjs')],{stdio:'inherit'});
if(result.error)throw result.error;
if(result.status!==0)process.exit(result.status===null?1:result.status);
