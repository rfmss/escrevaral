/* ES5. Prova A02: banco separado, cabeçalhos compactos e descritor por chave.
 * Reutiliza o modelo transacional do store v1; não migra nem abre esse banco. */
'use strict';
var ZERO = new Array(65).join('0');
function error(code) { var e = new Error(code); e.code = code; return e; }
function integer(n) { return typeof n === 'number' && isFinite(n) && n >= 0 && n % 1 === 0 && n <= 9007199254740991; }
function id(s) { return typeof s === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(s); }
function sha(s) { return typeof s === 'string' && /^[a-f0-9]{64}$/.test(s); }
function copy(x) { return JSON.parse(JSON.stringify(x)); }
function key(m) { return m.id+'/'+m.version; }
function descriptor(d, cap) {
  if (!d || Object.keys(d).length !== 3 || !id(d.id) || !integer(d.bytes) || d.bytes > cap || !sha(d.sha256)) { throw error('INVALID_DESCRIPTOR'); }
  return {id:d.id,bytes:d.bytes,sha256:d.sha256};
}
exports.chainInput = function (previous, d) {
  if (!sha(previous)) { throw error('INVALID_CHAIN'); }
  var s = 'scrvrl-descriptor-chain-v1\n'+previous+'\n'+JSON.stringify(descriptor(d,9007199254740991));
  var bytes = new Uint8Array(s.length), i;
  for (i=0;i<s.length;i+=1) { bytes[i]=s.charCodeAt(i); }
  return bytes.buffer;
};
exports.initialHash = ZERO;
exports.create = function (options) {
  options = options || {};
  var limits = options.limits, hash = options.digest, db = null, closed = false, busy = null, serial = 0;
  var stats = {metadataReads:0,payloadReads:0,maxMetadataRecordChars:0};
  if (!limits || !['blockBytes','packageBytes','blocks','headerChars','dependencies'].every(function (k) { return integer(limits[k]) && limits[k]>0; }) || typeof hash !== 'function') { throw error('OPTIONS_REQUIRED'); }
  limits = copy(limits);
  function manifest(m) {
    if (!m || Object.keys(m).length!==8 || m.schema!=='scrvrl.package-stage' || m.schemaVersion!==2 || !id(m.id) || !id(m.version) ||
        !integer(m.blockCount) || !m.blockCount || m.blockCount>limits.blocks || !integer(m.totalBytes) || m.totalBytes>limits.packageBytes ||
        !sha(m.catalogHash) || !Array.isArray(m.dependencies) || m.dependencies.length>limits.dependencies) { throw error('INVALID_MANIFEST'); }
    var seen=Object.create(null), deps=m.dependencies.map(function (d) {
      if (!d || Object.keys(d).length!==2 || !id(d.id) || !id(d.version) || d.id===m.id || seen[d.id]) { throw error('INVALID_DEPENDENCY'); }
      seen[d.id]=true; return {id:d.id,version:d.version};
    });
    var out={schema:m.schema,schemaVersion:2,id:m.id,version:m.version,dependencies:deps,blockCount:m.blockCount,totalBytes:m.totalBytes,catalogHash:m.catalogHash};
    if (JSON.stringify(out).length>limits.headerChars) { throw error('HEADER_LIMIT'); } return out;
  }
  function open(done) {
    if (db) { done(null,db); return; }
    var request, settled=false, timer;
    function finish(e,value) {
      if (settled) { if (value) { value.close(); } return; } settled=true; clearTimeout(timer);
      if (closed && value) { value.close(); value=null; e=error('CLOSED'); } db=value||null; done(e,db);
    }
    try {
      if (!options.indexedDB) { finish(error('STORAGE_UNAVAILABLE')); return; }
      request=options.indexedDB.open('escrevaral-pacotes-addressed-experiment',1);
      timer=setTimeout(function () { finish(error('STORAGE_TIMEOUT')); },1500);
      request.onupgradeneeded=function () { var d=request.result; ['headers','descriptors','receipts','blocks','active'].forEach(function (n) { if (!d.objectStoreNames.contains(n)) { d.createObjectStore(n); } }); };
      request.onsuccess=function () { var d=request.result; d.onversionchange=function () { d.close(); db=null; closed=true; }; finish(null,d); };
      request.onerror=function () { finish(request.error||error('STORAGE_UNAVAILABLE')); };
      request.onblocked=function () { finish(error('STORAGE_BLOCKED')); };
    } catch (e) { finish(e); }
  }
  function operation(done,work) {
    if (typeof done!=='function') { throw error('CALLBACK_REQUIRED'); }
    var finished=false,cancelled=false,tx=null,failure=null,result,after=null;
    var handle={cancel:function () { if (finished) { return false; } cancelled=true; if (tx) { try { tx.abort(); } catch (ignore) {} } return true; }};
    function finish(e,v) { if (finished) { return; } finished=true; if (busy===handle) { busy=null; } done(cancelled?error('CANCELLED'):e,cancelled?undefined:v); }
    function fail(e) { failure=e; if (tx) { try { tx.abort(); } catch (ignore) { finish(e); } } else { finish(e); } }
    function transaction(names,mode,action) {
      if (finished || cancelled) { finish(error('CANCELLED')); return; }
      open(function (e,d) {
        if (e || cancelled) { finish(e||error('CANCELLED')); return; }
        try {
          tx=d.transaction(names,mode);
          tx.oncomplete=function () {
            tx=null; var next=after; after=null;
            try { if (next && !cancelled) { next(result,finish); } else { finish(null,result); } } catch (ex) { finish(ex); }
          };
          tx.onabort=function () { finish(failure||tx.error||error('ABORTED')); };
          action(tx);
        } catch (ex) { fail(ex); }
      });
    }
    function get(store,k,next) {
      var r=tx.objectStore(store).get(k);
      if (store==='blocks') { stats.payloadReads+=1; } else { stats.metadataReads+=1; }
      r.onsuccess=function () { try {
        if (store!=='blocks' && r.result!==undefined) { stats.maxMetadataRecordChars=Math.max(stats.maxMetadataRecordChars,JSON.stringify(r.result).length); }
        next(r.result);
      } catch (e) { fail(e); } };
    }
    var op={tx:transaction,get:get,fail:fail,finish:finish,value:function (v) { result=v; },after:function (fn) { after=fn; },cancelled:function () { return cancelled; }};
    if (closed || busy) { finish(error(closed?'CLOSED':'BUSY')); return handle; } busy=handle;
    try { work(op); } catch (e) { fail(e); } return handle;
  }
  function pinned(t) {
    if (!t || typeof t.key!=='string' || t.key.length>161 || typeof t.token!=='string' || !t.token || t.token.length>160) { throw error('INVALID_TICKET'); }
    return {key:t.key,token:t.token};
  }
  function header(op,t,next) { op.get('headers',t.key,function (h) { if (!h || h.token!==t.token) { throw error('STALE_TICKET'); } next(h); }); }
  function hashOnce(bytes,done) { var settled=false; function receive(e,v) { if (settled) { return; } settled=true; done(e||(!sha(v)?error('INVALID_DIGEST'):null),v); } try { hash(bytes,receive); } catch (e) { receive(e); } }
  function stage(input,done) {
    return operation(done,function (op) {
      var m=manifest(input),k=key(m);
      op.tx(['headers'],'readwrite',function (tx) { op.get('headers',k,function (h) {
        if (h && JSON.stringify(h.manifest)!==JSON.stringify(m)) { throw error('VERSION_CONFLICT'); }
        if (!h) {
          h={manifest:m,token:Date.now().toString(36)+'-'+(++serial)+'-'+Math.random().toString(36).slice(2),state:'staged',nextOrdinal:0,catalogBytes:0,chain:ZERO,received:0,receivedBytes:0};
          tx.objectStore('headers').add(h,k);
        } op.value({ticket:{key:k,token:h.token},state:h.state});
      }); });
    });
  }
  function append(ticketValue,ordinal,input,done) {
    return operation(done,function (op) {
      var t=pinned(ticketValue),d=descriptor(input,limits.blockBytes);
      if (!integer(ordinal)) { throw error('INVALID_ORDINAL'); }
      op.after(function (start) {
        if (start.replayed) { op.finish(null,{nextOrdinal:start.nextOrdinal}); return; }
        hashOnce(exports.chainInput(start.chain,d),function (e,chain) {
          if (e || op.cancelled()) { op.finish(e||error('CANCELLED')); return; }
          op.tx(['headers','descriptors'],'readwrite',function (tx) { header(op,t,function (h) {
            if (h.state!=='staged') { throw error('IMMUTABLE_VERSION'); }
            if (h.nextOrdinal!==ordinal || h.chain!==start.chain) { throw error('CATALOG_CONFLICT'); }
            op.get('descriptors',t.key+'/'+d.id,function (existing) {
              if (existing) { throw error('DUPLICATE_BLOCK'); }
              h.nextOrdinal+=1; h.catalogBytes+=d.bytes; h.chain=chain;
              if (h.nextOrdinal>h.manifest.blockCount || h.catalogBytes>h.manifest.totalBytes) { throw error('CATALOG_LIMIT'); }
              if (h.nextOrdinal===h.manifest.blockCount && (h.chain!==h.manifest.catalogHash || h.catalogBytes!==h.manifest.totalBytes)) { throw error('CATALOG_INTEGRITY'); }
              tx.objectStore('descriptors').add({ordinal:ordinal,descriptor:d},t.key+'/'+d.id);
              tx.objectStore('headers').put(h,t.key); op.value({nextOrdinal:h.nextOrdinal});
            });
          }); });
        });
      });
      op.tx(['headers','descriptors'],'readonly',function () { header(op,t,function (h) {
        if (h.state!=='staged') { throw error('IMMUTABLE_VERSION'); }
        if (ordinal<h.nextOrdinal) { op.get('descriptors',t.key+'/'+d.id,function (old) {
          if (!old || old.ordinal!==ordinal || JSON.stringify(old.descriptor)!==JSON.stringify(d)) { throw error('ORDINAL_CONFLICT'); }
          op.value({replayed:true,nextOrdinal:h.nextOrdinal});
        }); }
        else { if (ordinal!==h.nextOrdinal || ordinal>=h.manifest.blockCount) { throw error('INVALID_ORDINAL'); } op.value({chain:h.chain}); }
      }); });
    });
  }
  function put(ticketValue,blockId,buffer,done) {
    return operation(done,function (op) {
      var t=pinned(ticketValue);
      if (!id(blockId) || Object.prototype.toString.call(buffer)!=='[object ArrayBuffer]' || buffer.byteLength>limits.blockBytes) { throw error('BLOCK_LIMIT'); }
      var bytes=new Uint8Array(buffer.byteLength); bytes.set(new Uint8Array(buffer));
      hashOnce(bytes.buffer,function (e,digest) {
        if (e || op.cancelled()) { op.finish(e||error('CANCELLED')); return; }
        op.tx(['headers','descriptors','receipts','blocks'],'readwrite',function (tx) { header(op,t,function (h) {
          if (h.state!=='staged') { throw error('IMMUTABLE_VERSION'); }
          op.get('descriptors',t.key+'/'+blockId,function (record) {
            if (!record) { throw error('UNKNOWN_BLOCK'); } var d=record.descriptor,k=t.key+'/'+blockId;
            if (d.bytes!==bytes.byteLength || d.sha256!==digest) { throw error('INTEGRITY_FAILED'); }
            op.get('receipts',k,function (receipt) {
              if (receipt && (receipt.bytes!==d.bytes || receipt.sha256!==d.sha256)) { throw error('RECEIPT_CORRUPT'); }
              if (!receipt) { h.received+=1; h.receivedBytes+=d.bytes; }
              tx.objectStore('blocks').put(bytes.buffer,k); tx.objectStore('receipts').put({bytes:d.bytes,sha256:d.sha256},k);
              tx.objectStore('headers').put(h,t.key); op.value({id:blockId,bytes:d.bytes});
            });
          });
        }); });
      });
    });
  }
  function snapshot(ticketValue,done) { return operation(done,function (op) { var t=pinned(ticketValue); op.tx(['headers'],'readonly',function () { header(op,t,function (h) { op.value(h); }); }); }); }
  function describe(ticketValue,blockId,done) { return operation(done,function (op) {
    var t=pinned(ticketValue); if (!id(blockId)) { throw error('INVALID_ID'); }
    op.tx(['headers','descriptors','receipts'],'readonly',function () { header(op,t,function () {
      op.get('descriptors',t.key+'/'+blockId,function (record) {
        if (!record) { throw error('UNKNOWN_BLOCK'); }
        var d=descriptor(record.descriptor,limits.blockBytes);
        if (d.id!==blockId) { throw error('DESCRIPTOR_MISMATCH'); }
        op.get('receipts',t.key+'/'+blockId,function (r) {
          if (r && (r.bytes!==d.bytes || r.sha256!==d.sha256)) { throw error('RECEIPT_CORRUPT'); }
          op.value({descriptor:d,ordinal:record.ordinal,stored:!!r});
        });
      });
    }); });
  }); }
  function active(packageId,done) { return operation(done,function (op) {
    if (!id(packageId)) { throw error('INVALID_ID'); }
    op.tx(['active','headers'],'readonly',function () { op.get('active',packageId,function (t) { if (!t) { op.value(null); return; } header(op,t,function (h) { if (h.state!=='ready') { throw error('INCOMPLETE_VERSION'); } op.value({ticket:t,manifest:h.manifest}); }); }); });
  }); }
  function activate(ticketValue,done) { return operation(done,function (op) {
    var t=pinned(ticketValue); op.tx(['headers','active'],'readwrite',function (tx) { header(op,t,function (h) {
      var m=h.manifest;
      if (h.nextOrdinal!==m.blockCount || h.catalogBytes!==m.totalBytes || h.chain!==m.catalogHash || h.received!==m.blockCount || h.receivedBytes!==m.totalBytes) { throw error('INCOMPLETE_VERSION'); }
      var pending=m.dependencies.length;
      function finish() { h.state='ready'; tx.objectStore('headers').put(h,t.key); tx.objectStore('active').put(t,m.id); op.value(t); }
      if (!pending) { finish(); return; }
      m.dependencies.forEach(function (dep) { op.get('headers',key(dep),function (d) { if (!d || d.state!=='ready') { throw error('DEPENDENCY_UNAVAILABLE'); } pending-=1; if (!pending) { finish(); } }); });
    }); });
  }); }
  function readVerified(ticketValue,blockId,expected,done) { return operation(done,function (op) {
    var t=pinned(ticketValue),d=descriptor({id:blockId,bytes:expected && expected.bytes,sha256:expected && expected.sha256},limits.blockBytes);
    op.after(function (bytes,finish) { hashOnce(bytes,function (e,digest) { finish(e||(digest!==d.sha256?error('INTEGRITY_FAILED'):null),e||digest!==d.sha256?undefined:bytes); }); });
    op.tx(['headers','descriptors','blocks'],'readonly',function () { header(op,t,function (h) {
      if (h.state!=='ready') { throw error('INCOMPLETE_VERSION'); }
      op.get('descriptors',t.key+'/'+blockId,function (record) {
        if (!record || record.descriptor.bytes!==d.bytes || record.descriptor.sha256!==d.sha256) { throw error('DESCRIPTOR_MISMATCH'); }
        op.get('blocks',t.key+'/'+blockId,function (bytes) { if (Object.prototype.toString.call(bytes)!=='[object ArrayBuffer]' || bytes.byteLength!==d.bytes) { throw error('BLOCK_UNAVAILABLE'); } op.value(bytes); });
      });
    }); });
  }); }
  return {stage:stage,append:append,put:put,snapshot:snapshot,describe:describe,active:active,activate:activate,readVerified:readVerified,
    stats:function () { return copy(stats); },
    close:function () { closed=true; if (busy) { busy.cancel(); } if (db) { db.close(); db=null; } }};
};
