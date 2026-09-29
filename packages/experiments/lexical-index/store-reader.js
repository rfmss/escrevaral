/* ES5. Ponte experimental sobre uma instância dedicada de createPackageStore.
 * Não resolve versão ativa, não instala pacotes e não acessa o editor. */
'use strict';
var utf8 = require('./utf8');
var defaults = {maxPackages:8,maxDescriptors:128,maxMetadataChars:32768,
  maxBlockEncodedBytes:4096,maxBlockDecodedBytes:8192,maxPendingReads:8};
function error(code) { var e = new Error(code); e.code = code; return e; }
function integer(n) { return typeof n === 'number' && isFinite(n) && n >= 0 && n % 1 === 0 && n <= 9007199254740991; }
function id(s) { return typeof s === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(s); }
function ticket(t) { return {key:t.key,token:t.token}; }

// Uma vaga inclui a operação física e a entrega pendente. Cancelar não a libera.
function serialQueue(limit) {
  var queue = [], active = null, closed = false, timer = null;
  function pump() {
    if (active || timer !== null || !queue.length) { return; }
    timer = setTimeout(function () {
      timer = null; if (active || !queue.length) { return; }
      var job = queue.shift(); active = job;
      function receive(e, value) {
        if (job.settled) { return; } job.settled = true;
        setTimeout(function () {
          active = null; job.finished = true;
          try { job.done(job.cancelled ? error('CANCELLED') : e, job.cancelled ? undefined : value); }
          finally { value = null; pump(); }
        }, 0);
      }
      try { job.handle = job.start(receive); } catch (e) { receive(e); }
    }, 0);
  }
  function cancel(job) {
    if (job.finished || job.cancelled) { return false; }
    job.cancelled = true;
    var index = queue.indexOf(job);
    if (index >= 0) {
      queue.splice(index, 1); job.finished = true;
      setTimeout(function () { job.done(error('CANCELLED')); }, 0);
    } else if (active === job && !job.settled && job.handle && typeof job.handle.cancel === 'function') {
      try { job.handle.cancel(); } catch (ignore) { /* Aguardar conclusão física. */ }
    }
    return true;
  }
  return {
    run:function (start, done) {
      if (closed || queue.length + (active ? 1 : 0) >= limit) {
        var e = error(closed ? 'CLOSED' : 'READ_QUEUE_LIMIT');
        setTimeout(function () { done(e); }, 0); return {cancel:function () { return false; }};
      }
      var job = {start:start,done:done,handle:null,settled:false,finished:false,cancelled:false};
      queue.push(job); pump(); return {cancel:function () { return cancel(job); }};
    },
    close:function () { closed = true; queue.slice().forEach(cancel); if (active) { cancel(active); } },
    pending:function () { return queue.length + (active ? 1 : 0); }
  };
}

exports.open = function (options, done) {
  options = options || {};
  var store = options.store, addressed = options.addressed === true, limits = {}, resources = [], bindings = Object.create(null), index = 0;
  var descriptors = 0, metadata = 0, cancelled = false, finished = false, pending = null, closed = false;
  if (typeof done !== 'function') { throw error('CALLBACK_REQUIRED'); }
  if (!store || (addressed ? typeof store.snapshot !== 'function' || typeof store.readVerified !== 'function' :
      typeof store.inspect !== 'function' || typeof store.read !== 'function')) { throw error('STORE_REQUIRED'); }
  Object.keys(defaults).forEach(function (k) { limits[k] = defaults[k]; });
  Object.keys(options.limits || {}).forEach(function (k) {
    if (!Object.prototype.hasOwnProperty.call(limits,k) || !integer(options.limits[k]) || !options.limits[k]) { throw error('INVALID_LIMIT'); }
    limits[k] = options.limits[k];
  });
  if (!Array.isArray(options.resources) || !options.resources.length || options.resources.length > limits.maxPackages) { throw error('RESOURCE_LIMIT'); }
  options.resources.forEach(function (r) {
    if (!r || !id(r.packageId) || !id(r.version) || !r.ticket || r.ticket.key !== r.packageId+'/'+r.version ||
        typeof r.ticket.token !== 'string' || !r.ticket.token.length || r.ticket.token.length > 160) { throw error('INVALID_RESOURCE'); }
    var key = r.ticket.key;
    if (bindings[key]) { throw error('DUPLICATE_RESOURCE'); }
    var copy = {packageId:r.packageId,version:r.version,ticket:ticket(r.ticket),blocks:Object.create(null),dependencies:[]};
    bindings[key] = copy; resources.push(copy);
  });
  var queue = serialQueue(limits.maxPendingReads);
  function close() { closed = true; queue.close(); bindings = Object.create(null); resources = []; }
  function fail(e) { if (finished) { return; } finished = true; close(); done(e); }
  function inspectNext() {
    if (cancelled) { fail(error('CANCELLED')); return; }
    if (index === resources.length) {
      try {
        resources.forEach(function (r) { r.dependencies.forEach(function (d) {
          if (!bindings[d.id+'/'+d.version]) { throw error('DEPENDENCY_NOT_PINNED'); }
        }); });
      } catch (e) { fail(e); return; }
      finished = true;
      done(null,{readBlock:readBlock,close:close,stats:function () { return {descriptors:descriptors,metadataChars:metadata,pending:queue.pending()}; }});
      return;
    }
    var r = resources[index++];
    pending = queue.run(function (cb) { return store[addressed ? 'snapshot' : 'inspect'](ticket(r.ticket),cb); }, function (e, state) {
      pending = null;
      if (cancelled) { fail(error('CANCELLED')); return; }
      if (e) { fail(e); return; }
      try {
        var m = state && state.manifest;
        if (!state || state.state !== 'ready' || !m || m.id !== r.packageId || m.version !== r.version ||
            m.schema !== 'scrvrl.package-stage' || m.schemaVersion !== (addressed ? 2 : 1) ||
            (!addressed && !Array.isArray(m.blocks)) || !Array.isArray(m.dependencies)) { throw error('INVALID_BINDING'); }
        if (addressed && (m.blocks !== undefined || !integer(m.blockCount) || !m.blockCount || !integer(m.totalBytes) ||
            typeof m.catalogHash !== 'string' || !/^[a-f0-9]{64}$/.test(m.catalogHash))) { throw error('INVALID_BINDING'); }
        // inspect já materializou o envelope: limitação conhecida do store v1.
        if ((!addressed && m.blocks.length > limits.maxDescriptors - descriptors) || m.dependencies.length > limits.maxPackages) { throw error('DESCRIPTOR_LIMIT'); }
        metadata += JSON.stringify(m).length;
        if (metadata > limits.maxMetadataChars) { throw error('METADATA_LIMIT'); }
        if (!addressed) { m.blocks.forEach(function (b) {
          if (!b || !id(b.id) || r.blocks[b.id] || !integer(b.bytes) || b.bytes > limits.maxBlockEncodedBytes ||
              typeof b.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(b.sha256)) { throw error('INVALID_DESCRIPTOR'); }
          r.blocks[b.id] = {bytes:b.bytes,sha256:b.sha256}; descriptors += 1;
        }); }
        r.dependencies = m.dependencies.map(function (d) {
          if (!d || !id(d.id) || !id(d.version)) { throw error('INVALID_DEPENDENCY'); } return {id:d.id,version:d.version};
        });
      } catch (ex) { fail(ex); return; }
      inspectNext();
    });
  }
  function readBlock(packageId, version, blockId, callback, expected) {
    if (typeof callback !== 'function') { throw error('CALLBACK_REQUIRED'); }
    var r = bindings[packageId+'/'+version], b = r && r.blocks[blockId], decodedBytes, failure = null;
    if (addressed && expected && integer(expected.encodedBytes) && expected.encodedBytes <= limits.maxBlockEncodedBytes &&
        typeof expected.sha256 === 'string' && /^[a-f0-9]{64}$/.test(expected.sha256)) { b = {bytes:expected.encodedBytes,sha256:expected.sha256}; }
    if (closed) { failure = error('CLOSED'); }
    else if (!id(packageId) || !id(version) || !id(blockId) || !r || !b) { failure = error('BLOCK_UNAVAILABLE'); }
    else if (!expected || expected.id !== blockId || expected.encodedBytes !== b.bytes || expected.sha256 !== b.sha256 ||
        !integer(expected.decodedBytes) || expected.decodedBytes > limits.maxBlockDecodedBytes) { failure = error('DESCRIPTOR_MISMATCH'); }
    if (failure) { setTimeout(function () { callback(failure); }, 0); return {cancel:function () { return false; }}; }
    decodedBytes = expected.decodedBytes;
    // No modo endereçado, o próprio store confronta o descritor por chave antes
    // de ler/verificar o payload; a ponte não retém uma lista de descritores.
    return queue.run(function (cb) {
      return addressed ? store.readVerified(ticket(r.ticket),blockId,{bytes:b.bytes,sha256:b.sha256},cb) : store.read(ticket(r.ticket),blockId,cb);
    }, function (e, buffer) {
      var text, payload;
      if (!e) {
        try {
          if (Object.prototype.toString.call(buffer) !== '[object ArrayBuffer]' || buffer.byteLength !== b.bytes) { throw error('LENGTH_MISMATCH'); }
          text = utf8.decode(buffer,limits.maxBlockEncodedBytes,limits.maxBlockDecodedBytes);
          if (text.length * 2 !== decodedBytes) { throw error('LENGTH_MISMATCH'); }
          payload = {text:text,byteLength:b.bytes,sha256:b.sha256};
        } catch (ex) { e = ex; }
      }
      callback(e || null,e ? undefined : payload);
    });
  }
  setTimeout(inspectNext,0);
  return {cancel:function () {
    if (finished || cancelled) { return false; } cancelled = true;
    if (pending) { pending.cancel(); } return true;
  }};
};
