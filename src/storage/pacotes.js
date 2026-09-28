/* Infraestrutura experimental de pacotes. Não abre banco até uma chamada explícita.
 * Não interpreta léxico, não baixa arquivos e nunca acessa o banco dos manuscritos. */
(function (root) {
  'use strict';
  var E = root.Escr, serial = 0;
  function error(code) { var e = new Error(code); e.code = code; return e; }
  function id(value) { return typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(value); }
  function integer(value) { return typeof value === 'number' && isFinite(value) && value >= 0 && value % 1 === 0; }
  function key(m) { return m.id + '/' + m.version; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function digest(bytes, done) {
    try {
      if (!root.crypto || !root.crypto.subtle) { done(error('INTEGRITY_UNAVAILABLE')); return; }
      root.crypto.subtle.digest('SHA-256', bytes).then(function (buffer) {
        var a = new Uint8Array(buffer), hex = '', i;
        for (i = 0; i < a.length; i += 1) { hex += ('0' + a[i].toString(16)).slice(-2); }
        done(null, hex);
      }, function () { done(error('INTEGRITY_UNAVAILABLE')); });
    } catch (e) { done(error('INTEGRITY_UNAVAILABLE')); }
  }
  E.createPackageStore = function (options) {
    options = options || {};
    var limits = options.limits, db = null, closed = false, busy = null;
    var hash = options.digest || digest;
    if (!limits || !['blockBytes','packageBytes','blocks','metadataChars'].every(function (k) { return integer(limits[k]) && limits[k] > 0; })) { throw error('LIMITS_REQUIRED'); }
    limits = clone(limits);
    function manifest(input) {
      var m = clone(input), seen = {}, total = 0;
      if (!m || typeof m !== 'object' || JSON.stringify(m).length > limits.metadataChars || m.schema !== 'scrvrl.package-stage' || m.schemaVersion !== 1 || !id(m.id) || !id(m.version) ||
          Object.prototype.toString.call(m.blocks) !== '[object Array]' || !m.blocks.length || m.blocks.length > limits.blocks ||
          Object.prototype.toString.call(m.dependencies) !== '[object Array]' || m.dependencies.length > limits.blocks) { throw error('INVALID_MANIFEST'); }
      m.blocks.forEach(function (b) {
        if (!b || !id(b.id) || seen['$'+b.id] || !integer(b.bytes) || b.bytes > limits.blockBytes || typeof b.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(b.sha256)) { throw error('INVALID_BLOCK'); }
        seen['$'+b.id] = true; total += b.bytes;
      });
      if (total > limits.packageBytes) { throw error('PACKAGE_LIMIT'); }
      seen = {};
      m.dependencies.forEach(function (d) {
        if (!d || !id(d.id) || !id(d.version) || d.id === m.id || seen['$'+d.id]) { throw error('INVALID_DEPENDENCY'); }
        seen['$'+d.id] = true;
      });
      return m;
    }
    function open(done) {
      if (db) { done(null, db); return; }
      var request, settled = false, timer;
      function settle(e, value) {
        if (settled) { if (value) { value.close(); } return; }
        settled = true; root.clearTimeout(timer);
        if (closed && value) { value.close(); value = null; e = error('CLOSED'); }
        db = value || null; done(e, db);
      }
      try {
        if (!root.indexedDB) { settle(error('STORAGE_UNAVAILABLE')); return; }
        request = root.indexedDB.open('escrevaral-pacotes', 1);
        timer = root.setTimeout(function () { settle(error('STORAGE_TIMEOUT')); }, 1500);
        request.onupgradeneeded = function () {
          var d = request.result;
          ['versions','receipts','blocks','active'].forEach(function (name) { if (!d.objectStoreNames.contains(name)) { d.createObjectStore(name); } });
        };
        request.onsuccess = function () {
          var d = request.result;
          d.onversionchange = function () { d.close(); db = null; closed = true; };
          settle(null, d);
        };
        request.onerror = function () { settle(request.error || error('STORAGE_UNAVAILABLE')); };
        request.onblocked = function () { settle(error('STORAGE_BLOCKED')); };
      } catch (e) { settle(e); }
    }
    function operation(done, work) {
      var finished = false, cancelled = false, tx = null, failure = null, result, afterCommit = null;
      var handle = { cancel: function () { if (!finished) { cancelled = true; if (tx) { try { tx.abort(); } catch (ignore) {} } } } };
      function finish(e, value) {
        if (finished) { return; } finished = true;
        if (busy === handle) { busy = null; }
        done(cancelled ? error('CANCELLED') : e, cancelled ? undefined : value);
      }
      function fail(e) { failure = e; if (tx) { try { tx.abort(); } catch (ignore) { finish(e); } } else { finish(e); } }
      function transaction(names, mode, action) {
        open(function (e, d) {
          if (e || cancelled) { finish(e || error('CANCELLED')); return; }
          try {
            tx = d.transaction(names, mode);
            tx.oncomplete = function () {
              tx = null;
              try { if (afterCommit && !cancelled) { afterCommit(result, finish); } else { finish(null, result); } } catch (ex) { finish(ex); }
            };
            tx.onabort = function () { finish(failure || tx.error || error('ABORTED')); };
            action(tx);
          } catch (ex) { fail(ex); }
        });
      }
      function get(store, k, next) {
        var r = tx.objectStore(store).get(k);
        r.onsuccess = function () { try { next(r.result); } catch (e) { fail(e); } };
      }
      var op = { tx: transaction, get: get, fail: fail, finish: finish, value: function (v) { result = v; }, afterCommit: function (fn) { afterCommit = fn; }, cancelled: function () { return cancelled; } };
      if (closed || busy) { finish(error(closed ? 'CLOSED' : 'BUSY')); return handle; }
      busy = handle;
      try { work(op); } catch (e) { fail(e); }
      return handle;
    }
    function version(op, ticket, next) {
      if (!ticket || typeof ticket.key !== 'string' || typeof ticket.token !== 'string') { throw error('INVALID_TICKET'); }
      op.get('versions', ticket.key, function (record) {
        if (!record || record.token !== ticket.token) { throw error('STALE_TICKET'); }
        next(record);
      });
    }
    function descriptor(record, blockId) {
      var list = record.manifest.blocks, i;
      for (i = 0; i < list.length; i += 1) { if (list[i].id === blockId) { return list[i]; } }
      throw error('UNKNOWN_BLOCK');
    }
    function ticket(record) { return { key: key(record.manifest), token: record.token }; }
    function stage(input, done) {
      return operation(done, function (op) {
        var m = manifest(input), k = key(m);
        op.tx(['versions'], 'readwrite', function (tx) {
          op.get('versions', k, function (record) {
            if (record && JSON.stringify(record.manifest) !== JSON.stringify(m)) { throw error('VERSION_CONFLICT'); }
            if (!record) {
              record = {manifest:m, token:new Date().getTime().toString(36)+'-'+(++serial)+'-'+Math.random().toString(36).slice(2), state:'staged'};
              tx.objectStore('versions').add(record, k);
            }
            op.value({ticket:ticket(record), state:record.state});
          });
        });
      });
    }
    function put(ticketValue, blockId, buffer, done) {
      return operation(done, function (op) {
        if (Object.prototype.toString.call(buffer) !== '[object ArrayBuffer]' || buffer.byteLength > limits.blockBytes) { throw error('BLOCK_LIMIT'); }
        var bytes = new Uint8Array(buffer.byteLength); bytes.set(new Uint8Array(buffer));
        var hashed = false;
        hash(bytes.buffer, function (e, sha) {
          if (hashed) { return; } hashed = true;
          if (e || op.cancelled()) { op.finish(e || error('CANCELLED')); return; }
          op.tx(['versions','receipts','blocks'], 'readwrite', function (tx) {
            version(op, ticketValue, function (record) {
              if (record.state !== 'staged') { throw error('IMMUTABLE_VERSION'); }
              var b = descriptor(record, blockId), k = ticketValue.key+'/'+blockId;
              if (b.bytes !== bytes.byteLength || b.sha256 !== sha) { throw error('INTEGRITY_FAILED'); }
              tx.objectStore('blocks').put(bytes.buffer, k);
              tx.objectStore('receipts').put({bytes:b.bytes, sha256:sha}, k);
              op.value({id:blockId, bytes:b.bytes});
            });
          });
        });
      });
    }
    function activate(ticketValue, done) {
      return operation(done, function (op) {
        op.tx(['versions','receipts','active'], 'readwrite', function (tx) {
          version(op, ticketValue, function (record) {
            var pending = record.manifest.blocks.length + record.manifest.dependencies.length;
            function checked() {
              pending -= 1; if (pending) { return; }
              record.state = 'ready'; tx.objectStore('versions').put(record, ticketValue.key);
              tx.objectStore('active').put(ticketValue, record.manifest.id); op.value(ticketValue);
            }
            record.manifest.blocks.forEach(function (b) {
              op.get('receipts', ticketValue.key+'/'+b.id, function (r) { if (!r || r.bytes !== b.bytes || r.sha256 !== b.sha256) { throw error('INCOMPLETE_VERSION'); } checked(); });
            });
            record.manifest.dependencies.forEach(function (dep) {
              op.get('versions', key(dep), function (r) { if (!r || r.state !== 'ready') { throw error('DEPENDENCY_UNAVAILABLE'); } checked(); });
            });
          });
        });
      });
    }
    function active(packageId, done) {
      return operation(done, function (op) {
        if (!id(packageId)) { throw error('INVALID_ID'); }
        op.tx(['active','versions'], 'readonly', function () {
          op.get('active', packageId, function (t) {
            if (!t) { op.value(null); return; }
            version(op, t, function (record) { if (record.state !== 'ready') { throw error('INCOMPLETE_VERSION'); } op.value({ticket:t, manifest:record.manifest}); });
          });
        });
      });
    }
    function read(ticketValue, blockId, done) {
      // Uma leitura pontual; não carrega os demais blocos nem o léxico inteiro.
      return operation(done, function (op) {
        op.afterCommit(function (value, finish) {
          hash(value.bytes, function (failure, sha) { finish(failure || (sha !== value.sha256 ? error('INTEGRITY_FAILED') : null), failure || sha !== value.sha256 ? undefined : value.bytes); });
        });
        op.tx(['versions','blocks'], 'readonly', function () {
          version(op, ticketValue, function (record) {
            if (record.state !== 'ready') { throw error('INCOMPLETE_VERSION'); }
            var b = descriptor(record, blockId);
            if (b.bytes > limits.blockBytes) { throw error('BLOCK_LIMIT'); }
            op.get('blocks', ticketValue.key+'/'+blockId, function (bytes) {
              if (!bytes || bytes.byteLength !== b.bytes) { throw error('BLOCK_UNAVAILABLE'); }
              op.value({bytes:bytes, sha256:b.sha256});
            });
          });
        });
      });
    }
    function inspect(ticketValue, done) {
      return operation(done, function (op) {
        op.tx(['versions','receipts'], 'readonly', function () {
          version(op, ticketValue, function (record) {
            var pending = record.manifest.blocks.length, present = [];
            record.manifest.blocks.forEach(function (b) {
              op.get('receipts', ticketValue.key+'/'+b.id, function (r) {
                if (r && r.bytes === b.bytes && r.sha256 === b.sha256) { present.push(b.id); }
                pending -= 1;
                if (!pending) { op.value({state:record.state, manifest:record.manifest, stored:present}); }
              });
            });
          });
        });
      });
    }
    function discard(ticketValue, done) {
      return operation(done, function (op) {
        op.tx(['versions','receipts','blocks'], 'readwrite', function (tx) {
          version(op, ticketValue, function (record) {
            if (record.state !== 'staged') { throw error('IMMUTABLE_VERSION'); }
            record.manifest.blocks.forEach(function (b) { var k = ticketValue.key+'/'+b.id; tx.objectStore('receipts').delete(k); tx.objectStore('blocks').delete(k); });
            tx.objectStore('versions').delete(ticketValue.key); op.value(true);
          });
        });
      });
    }
    return {stage:stage, put:put, activate:activate, active:active, read:read, inspect:inspect, discard:discard,
      close:function () { closed = true; if (busy) { busy.cancel(); } if (db) { db.close(); db = null; } }};
  };
}(typeof window !== 'undefined' ? window : this));
