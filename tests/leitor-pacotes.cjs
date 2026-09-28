'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {IDBFactory}=require('fake-indexeddb');
const bytes=text=>new TextEncoder().encode(text).buffer;
const sha=buffer=>crypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');
const descriptor=(id,text)=>({id,bytes:bytes(text).byteLength,sha256:sha(bytes(text))});
const request={id:'lexico',version:'1',block:descriptor('a','ação')};
let reads=[],instances=[],mode='normal';
class Reader {
 constructor(){this.readyState=0;instances.push(this);}
 readAsArrayBuffer(blob){
  reads.push(blob.size);this.readyState=1;
  if(mode==='throw')throw new Error('READ_THROW');
  if(mode==='hold'||mode==='abort-broken')return;
  const saved=this.onload;
  blob.arrayBuffer().then(value=>{
   if(this.readyState!==1)return;
   this.readyState=2;
   if(mode==='error'){this.error=new Error('FILE_GONE');if(this.onerror)this.onerror();return;}
   this.result=mode==='short'?new ArrayBuffer(0):value;
   if(this.onload)this.onload();if(saved)saved();if(this.onloadend)this.onloadend();
  });
 }
 abort(){if(mode==='abort-broken')throw new Error('ABORT_THROW');this.readyState=2;this.result=null;if(this.onabort)this.onabort();if(this.onloadend)this.onloadend();}
}
const root={Escr:{},FileReader:Reader,indexedDB:new IDBFactory(),setTimeout,clearTimeout};
['pacotes','instalador-pacotes','leitor-pacotes'].forEach(name=>vm.runInNewContext(fs.readFileSync('src/storage/'+name+'.js','utf8'),root));
const create=(resolveFile,timeoutMs=1000)=>root.Escr.createPackageFileReader({resolveFile,maxBlockBytes:64,timeoutMs});
const read=(source,r=request)=>new Promise(resolve=>source.readBlock(r,(error,value)=>resolve({error,value})));
const turn=()=>new Promise(r=>setTimeout(r,1));
async function until(fn){for(let i=0;i<1000&&!fn();i++)await turn();assert.ok(fn());}
(async()=>{
 // Arquivo virtual de 1 GiB: somente o recorte de seis bytes chega ao leitor.
 // Isso mede seleção de faixa, não memória real de um navegador.
 let ranges=[];
 const huge={size:1073741824,slice(start,end){ranges.push([start,end]);return new Blob(['ação']);}};
 let source=create(()=>({file:huge,offset:500000000}));
 let outcome=await read(source);assert.equal(outcome.error,null);assert.equal(new TextDecoder().decode(outcome.value),'ação');
 assert.deepEqual(ranges,[[500000000,500000006]]);assert.deepEqual(reads,[6]);
 // Limites e faixa validados antes de construir leitor ou carregar o arquivo.
 const before=reads.length;
 outcome=await read(source,{...request,block:{...request.block,bytes:65}});assert.equal(outcome.error.code,'BLOCK_LIMIT');
 source=create(()=>({file:huge,offset:1073741823}));outcome=await read(source);assert.equal(outcome.error.code,'FILE_RANGE');
 source=create(()=>({file:huge,offset:-1}));outcome=await read(source);assert.equal(outcome.error.code,'FILE_RANGE');
 source=create(()=>({file:{size:100},offset:0}));outcome=await read(source);assert.equal(outcome.error.code,'SLICE_UNAVAILABLE');
 source=create(()=>({file:{size:100,slice(){return new Blob(['demasiado']);}},offset:0}));outcome=await read(source);assert.equal(outcome.error.code,'BLOCK_LIMIT');
 assert.equal(reads.length,before);
 // Um arquivo já limitado ao bloco dispensa slice; prefixo antigo é opcional.
 const small={size:6,arrayBuffer:()=>Promise.resolve(bytes('ação'))};source=create(()=>({file:small,offset:0}));assert.equal((await read(source)).error,null);
 const legacy={size:100,webkitSlice:()=>new Blob(['ação'])};source=create(()=>({file:legacy,offset:20}));assert.equal((await read(source)).error,null);
 mode='short';outcome=await read(source);assert.equal(outcome.error.code,'BLOCK_UNAVAILABLE');
 mode='error';outcome=await read(source);assert.equal(outcome.error.message,'FILE_GONE');
 mode='throw';outcome=await read(source);assert.equal(outcome.error.message,'READ_THROW');assert.equal(instances.at(-1).readyState,2);
 // Cancelamento conclui uma vez, aborta a leitura e descarta evento capturado.
 mode='hold';let handle,calls=0;
 const initial=instances.length;const cancelled=new Promise(resolve=>{handle=source.readBlock(request,(error,value)=>{calls++;resolve({error,value});});});
 await until(()=>instances.length>initial);const held=instances.at(-1),late=held.onload;
 outcome=await read(source);assert.equal(outcome.error.code,'BUSY');assert.equal(handle.cancel(),true);
 outcome=await cancelled;assert.equal(outcome.error.code,'CANCELLED');assert.equal(held.readyState,2);late();await turn();assert.equal(calls,1);
 // Timeout aborta. Se o ambiente não consegue abortar, bloqueia novas leituras
 // nessa instância; não finge que um trabalho físico terminou.
 source=create(()=>({file:small,offset:0}),10);outcome=await read(source);assert.equal(outcome.error.code,'READ_TIMEOUT');assert.equal(instances.at(-1).readyState,2);
 mode='normal';assert.equal((await read(source)).error,null);
 mode='abort-broken';source=create(()=>({file:small,offset:0}),10);outcome=await read(source);assert.equal(outcome.error.code,'READ_TIMEOUT');
 const disabledCount=reads.length;outcome=await read(source);assert.equal(outcome.error.code,'FILE_READER_DISABLED');assert.equal(reads.length,disabledCount);
 // Ausência da API e fechamento não chegam a resolver/ler arquivo algum.
 mode='normal';root.FileReader=null;source=create(()=>{throw new Error('não deve resolver');});outcome=await read(source);assert.equal(outcome.error.code,'FILE_READER_UNAVAILABLE');root.FileReader=Reader;
 source=create(()=>({file:small,offset:0}));source.close();assert.equal((await read(source)).error.code,'CLOSED');
 source=create(()=>{source.close();return {file:small,offset:0};});const closeCount=reads.length;outcome=await read(source);assert.equal(outcome.error.code,'CANCELLED');assert.equal(reads.length,closeCount);
 // Integração leitor → coordenador → persistência: Blob com dois blocos,
 // offsets em bytes (UTF-8), hash e consulta pontual após fechar/reabrir conexão.
 const texts=['ação','🎼'];const blob=new Blob(texts);const m={schema:'scrvrl.package-stage',schemaVersion:1,id:'lexico',version:'1',dependencies:[],blocks:texts.map((s,i)=>descriptor('b'+i,s))};
 source=create(r=>({file:blob,offset:r.block.id==='b0'?0:bytes(texts[0]).byteLength}));
 const limits={blockBytes:64,packageBytes:1024,blocks:4,metadataChars:4096};
 let store=root.Escr.createPackageStore({limits,digest:(data,done)=>done(null,sha(data))});
 const installer=root.Escr.createPackageInstaller({store,readBlock:source.readBlock});
 const installed=await new Promise(resolve=>installer.install(m,null,(error,result)=>resolve({error,result})));
 assert.equal(installed.error,null);assert.equal(installed.result.storedBytes,blob.size);store.close();
 store=root.Escr.createPackageStore({limits,digest:(data,done)=>done(null,sha(data))});
 const recovered=await new Promise((resolve,reject)=>store.read(installed.result.ticket,'b1',(e,v)=>e?reject(e):resolve(v)));
 assert.equal(new TextDecoder().decode(recovered),'🎼');store.close();source.close();
 console.log('LEITOR OK: faixas limitadas antes da leitura, Blob/FileReader, APIs ausentes, cancelamento, timeout e integração com instalação/persistência simulada.');
})().catch(e=>{console.error(e);process.exitCode=1;});
