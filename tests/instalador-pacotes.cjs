'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {IDBFactory,IDBObjectStore}=require('fake-indexeddb');
const bytes=text=>new TextEncoder().encode(text).buffer;
const sha=buffer=>crypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');
const limits={blockBytes:1024,packageBytes:16384,blocks:128,metadataChars:32768};
const root={Escr:{},indexedDB:new IDBFactory(),setTimeout,clearTimeout};
['pacotes','instalador-pacotes'].forEach(name=>vm.runInNewContext(fs.readFileSync('src/storage/'+name+'.js','utf8'),root));
const store=root.Escr.createPackageStore({limits,digest:(buffer,done)=>setImmediate(()=>done(null,sha(buffer)))});
const call=(method,...args)=>new Promise((resolve,reject)=>store[method](...args,(e,v)=>e?reject(e):resolve(v)));
const manifest=(version,n=3)=>({schema:'scrvrl.package-stage',schemaVersion:1,id:'lexico',version,dependencies:[],blocks:Array.from({length:n},(_,i)=>({id:'b'+i,bytes:bytes('ação'+i).byteLength,sha256:sha(bytes('ação'+i))}))});
const payload=req=>bytes('ação'+req.block.id.slice(1));
const create=readBlock=>root.Escr.createPackageInstaller({store,readBlock});
const install=(runner,m,progress)=>new Promise(resolve=>runner.install(m,progress,(error,result)=>resolve({error,result})));
const turn=()=>new Promise(r=>setImmediate(r));
async function until(fn){for(let i=0;i<1000&&!fn();i++)await new Promise(r=>setTimeout(r,1));assert.ok(fn(),'condição não alcançada');}
(async()=>{
 let reads=[],events=[],simultaneous=0,peak=0;
 const runner=create((request,done)=>{reads.push(request.block.id);simultaneous++;peak=Math.max(peak,simultaneous);setImmediate(()=>{simultaneous--;done(null,payload(request));done(new Error('duplicada'));});return {cancel(){}};});
 let outcome=await install(runner,manifest('1'),event=>events.push(event));
 assert.equal(outcome.error,null);assert.equal(outcome.result.phase,'installed');assert.equal(peak,1);
 assert.deepEqual(reads,['b0','b1','b2']);assert.equal(outcome.result.storedBlocks,3);
 assert.deepEqual(events.filter(e=>e.phase==='stored').map(e=>e.storedBlocks),[1,2,3]);
 assert.equal(events.at(-1).phase,'activating');
 const first=await call('active','lexico');assert.equal(first.manifest.version,'1');
 // Uma falha conserva o recibo do primeiro bloco e a versão anterior ativa.
 const broken=create((request,done)=>setImmediate(()=>request.block.id==='b1'?done(new Error('OFFLINE')):done(null,payload(request))));
 outcome=await install(broken,manifest('2'));assert.equal(outcome.error.message,'OFFLINE');assert.equal(outcome.result.storedBlocks,1);
 assert.equal((await call('active','lexico')).manifest.version,'1');
 reads=[];outcome=await install(runner,manifest('2'));assert.equal(outcome.error,null);assert.deepEqual(reads,['b1','b2']);
 assert.equal(outcome.result.storedBytes,outcome.result.totalBytes);
 // Retomar versão pronta não baixa de novo. A ativação dessa versão é explícita.
 reads=[];outcome=await install(runner,manifest('2'));assert.equal(outcome.error,null);assert.deepEqual(reads,[]);
 // Hash inválido nunca faz progresso persistido nem substitui versão ativa.
 const corrupt=create((request,done)=>done(null,bytes('errado')));
 outcome=await install(corrupt,manifest('3'));assert.equal(outcome.error.code,'INTEGRITY_FAILED');assert.equal(outcome.result.storedBlocks,0);
 assert.equal((await call('active','lexico')).manifest.version,'2');
 // Falha de quota chega ao hospedeiro e não cria recibo nem ativa a atualização.
 const put=IDBObjectStore.prototype.put;
 IDBObjectStore.prototype.put=function(value,key){if(this.name==='receipts')throw new DOMException('quota','QuotaExceededError');return put.call(this,value,key);};
 try{outcome=await install(runner,manifest('3'));assert.equal(outcome.error.name,'QuotaExceededError');assert.equal(outcome.result.storedBlocks,0);}finally{IDBObjectStore.prototype.put=put;}
 assert.equal((await call('active','lexico')).manifest.version,'2');
 // Cancelamento durante leitura mantém BUSY até a resposta; callback tardio/duplo
 // não grava, não dispara outro bloco e não interfere numa instalação posterior.
 let respond,cancelCalls=0,doneCalls=0,handle;
 const slow=create((request,done)=>{respond=()=>done(null,payload(request));return {cancel(){cancelCalls++;}};});
 const cancelled=new Promise(resolve=>{handle=slow.install(manifest('4'),null,(error,result)=>{doneCalls++;resolve({error,result});});});
 await until(()=>respond);assert.equal(handle.cancel(),true);
 outcome=await install(slow,manifest('5'));assert.equal(outcome.error.code,'BUSY');assert.equal(cancelCalls,1);
 respond();outcome=await cancelled;assert.equal(outcome.error.code,'CANCELLED');assert.equal(outcome.result.storedBlocks,0);
 respond();await turn();assert.equal(doneCalls,1);
 assert.equal((await call('inspect',outcome.result.ticket)).stored.length,0);
 outcome=await install(runner,manifest('4'));assert.equal(outcome.error,null);
 // Callback de progresso pode cancelar entre blocos; cancelamento na fase de
 // ativação não anuncia falsamente que uma transação confirmada foi revertida.
 let activationCancel;
 outcome=await new Promise(resolve=>{handle=runner.install(manifest('5'),event=>{if(event.phase==='stored'&&event.storedBlocks===1)handle.cancel();},(error,result)=>resolve({error,result}));});
 assert.equal(outcome.error.code,'CANCELLED');assert.equal(outcome.result.storedBlocks,1);
 outcome=await new Promise(resolve=>{handle=runner.install(manifest('5'),event=>{if(event.phase==='activating')activationCancel=handle.cancel();},(error,result)=>resolve({error,result}));});
 assert.equal(outcome.error,null);assert.equal(activationCancel,false);assert.equal((await call('active','lexico')).manifest.version,'5');
 // Dependências não são baixadas silenciosamente. Falha na ativação é distinta
 // de bloco ausente, preserva staging completo e permite nova tentativa.
 const needs=manifest('6');needs.dependencies=[{id:'base',version:'1'}];reads=[];
 outcome=await install(runner,needs);assert.equal(outcome.error.code,'DEPENDENCY_UNAVAILABLE');assert.equal(outcome.result.storedBlocks,3);
 assert.equal((await call('active','lexico')).manifest.version,'5');
 const base=manifest('1',1);base.id='base';await install(runner,base);reads=[];
 outcome=await install(runner,needs);assert.equal(outcome.error,null);assert.deepEqual(reads,[]);
 // Entrada é snapshot; callbacks síncronos não recursam nem permitem que o
 // hospedeiro mude os descritores já validados pelo armazenamento.
 const sync=create((request,done)=>{const b=payload(request);request.block.sha256='alterado';done(null,b);});
 const mutable=manifest('7',40);const installing=install(sync,mutable);mutable.version='outra';mutable.blocks=[];
 outcome=await installing;assert.equal(outcome.error,null);assert.equal(outcome.result.storedBlocks,40);assert.equal((await call('active','lexico')).manifest.version,'7');
 outcome=await install(runner,null);assert.equal(outcome.error.code,'INVALID_MANIFEST');
 const cyclic={};cyclic.self=cyclic;outcome=await install(runner,cyclic);assert.equal(outcome.error.code,'INVALID_MANIFEST');
 outcome=await install(runner,manifest('8'),()=>{throw new Error('PROGRESS_FAILURE');});assert.equal(outcome.error.message,'PROGRESS_FAILURE');
 const throwing=create(()=>{throw new Error('READ_FAILURE');});outcome=await install(throwing,manifest('8'));assert.equal(outcome.error.message,'READ_FAILURE');
 // Cancelamento imediato acontece antes de qualquer acesso ao banco/leitor.
 outcome=await new Promise(resolve=>runner.install(manifest('9'),null,(error,result)=>resolve({error,result})).cancel());
 assert.equal(outcome.error.code,'CANCELLED');assert.equal(outcome.result.ticket,null);
 store.close();
 console.log('INSTALADOR OK: sequência limitada, progresso persistido, falha/retomada, quota, integridade, dependências, cancelamento e callbacks tardios/síncronos.');
})().catch(e=>{console.error(e);process.exitCode=1;});
