'use strict';
// Provas isoladas verificadas no CI; não entram no bundle do aplicativo.
const path=require('node:path'),cp=require('node:child_process');
for(const suite of ['test.cjs','test-paged.cjs','test-stream.cjs','test-store-reader.cjs','test-addressed-store.cjs']){
  const result=cp.spawnSync(process.execPath,[path.join(__dirname,'../packages/experiments/lexical-index/',suite)],{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status===null?1:result.status);
}
