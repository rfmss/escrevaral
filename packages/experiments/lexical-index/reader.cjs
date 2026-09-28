'use strict';
// Hospedeiro Node de demonstração. O navegador precisará de um adaptador de A1.
const fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');
const {performance}=require('node:perf_hooks');
exports.create=function(bundles, options={}) {
  const catalogs=new Map(bundles.map(b=>[b.manifest.packageId+'@'+b.manifest.version,b]));
  const stats={reads:0,bytesRead:0,readMs:0,verifyMs:0,canceled:0};
  function readBlock(packageId,version,id,done,expected) {
    const bundle=catalogs.get(packageId+'@'+version), d=bundle&&(expected||bundle.manifest.index?.find(x=>x.id===id));
    let canceled=false,finished=false;
    const started=performance.now();
    const handle={cancel(){if(!canceled&&!finished){canceled=true;stats.canceled++;}}};
    function deliver(error,text) {
      if(finished) return;finished=true;stats.readMs+=performance.now()-started;
      if(canceled&&!options.lateAfterCancel) return done({code:'canceled'});
      if(error) return done(error);
      const t=performance.now(), bytes=Buffer.from(text,'utf8'), digest=crypto.createHash('sha256').update(bytes).digest('hex');
      stats.bytesRead+=bytes.length;stats.verifyMs+=performance.now()-t;
      if(bytes.length!==d.encodedBytes||digest!==d.sha256) return done({code:'integrity'});
      done(null,{text,byteLength:bytes.length,sha256:digest});
    }
    stats.reads++;
    if(!d || d.id!==id) {setTimeout(()=>deliver({code:'missing'}),0);return handle;}
    if(!bundle.directory) {
      setTimeout(()=>deliver(bundle.blocks[id]===undefined?{code:'missing'}:null,bundle.blocks[id]),options.delay||0);
      return handle;
    }
    // Leitura limitada a bytes declarados + 1; não aloca pelo tamanho do arquivo.
    if(d.encodedBytes>4096 || !/^[bp]\d{6}$/.test(id)) {setTimeout(()=>deliver({code:'block-budget'}),0);return handle;}
    fs.open(path.join(bundle.directory,id+'.json'),'r',(error,fd)=>{
      if(error) return deliver({code:error.code==='ENOENT'?'missing':'io'});
      const buffer=Buffer.alloc(d.encodedBytes+1);let offset=0;
      function close(err) {
        fs.close(fd,()=>{
          if(err) return deliver(err);
          const bytes=buffer.subarray(0,offset),text=bytes.toString('utf8');
          if(offset!==d.encodedBytes || !Buffer.from(text,'utf8').equals(bytes)) return deliver({code:'invalid-bytes'});
          deliver(null,text);
        });
      }
      function next() {
        if(canceled&&!options.lateAfterCancel) return close({code:'canceled'});
        fs.read(fd,buffer,offset,buffer.length-offset,offset,(err,n)=>{
          if(err) return close({code:'io'});
          offset+=n;
          if(n===0||offset===buffer.length) return close(null);
          next();
        });
      }
      next();
    });
    return handle;
  }
  return {readBlock,stats};
};
