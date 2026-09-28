/* Transporte local opcional. Recebe arquivos já escolhidos pelo hospedeiro;
 * lê somente um bloco limitado, sem rede nem interpretação do conteúdo. */
(function (root) {
  'use strict';
  var E = root.Escr;
  function error(code) { var e = new Error(code); e.code = code; return e; }
  function integer(n) { return typeof n === 'number' && isFinite(n) && n >= 0 && n <= 9007199254740991 && n % 1 === 0; }
  function id(s) { return typeof s === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(s); }
  E.createPackageFileReader = function (options) {
    options = options || {};
    var resolve = options.resolveFile, limit = options.maxBlockBytes, timeout = options.timeoutMs;
    var busy = null, closed = false, disabled = false;
    if (typeof resolve !== 'function' || !integer(limit) || !limit || !integer(timeout) || !timeout || timeout > 2147483647) { throw error('FILE_READER_OPTIONS'); }
    function readBlock(input, done) {
      if (typeof done !== 'function') { throw error('CALLBACK_REQUIRED'); }
      var reader = null, timer = null, finished = false, request, inputError = null;
      var refused = closed ? 'CLOSED' : disabled ? 'FILE_READER_DISABLED' : busy ? 'BUSY' : null;
      try {
        if (!input || !id(input.id) || !id(input.version) || !input.block || !id(input.block.id) || !integer(input.block.bytes) || typeof input.block.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(input.block.sha256)) { throw error('INVALID_BLOCK_REQUEST'); }
        if (input.block.bytes > limit) { throw error('BLOCK_LIMIT'); }
        request = {id:input.id, version:input.version, block:{id:input.block.id, bytes:input.block.bytes, sha256:input.block.sha256}};
      } catch (e) { inputError = e; }
      function detach(r) { if (r) { r.onload = r.onerror = r.onabort = r.onloadend = null; } }
      function finish(e, bytes) {
        if (finished) { return; } finished = true;
        root.clearTimeout(timer);
        if (reader && reader.readyState === 1) { disabled = true; }
        detach(reader); reader = null; request = null;
        if (busy === handle) { busy = null; }
        root.setTimeout(function () { done(e || null, e ? undefined : bytes); }, 0);
      }
      function stop(reason) {
        if (finished || refused) { return false; }
        if (reader) {
          // Desligar eventos antes de abortar evita dupla conclusão síncrona.
          detach(reader);
          try { if (reader.readyState === 1) { reader.abort(); } } catch (ignore) { disabled = true; }
          // Se o ambiente não confirmou a interrupção, não iniciar nova leitura
          // nesta instância. Timeout não é licença para sobrepor alocações.
          if (reader.readyState === 1) { disabled = true; }
        }
        finish(error(reason)); return true;
      }
      var handle = {cancel:function () { return stop('CANCELLED'); }};
      if (!refused) { busy = handle; }
      root.setTimeout(function () {
        if (finished) { return; }
        if (refused || inputError) { finish(inputError && !refused ? inputError : error(refused)); return; }
        try {
          if (typeof root.FileReader !== 'function') { throw error('FILE_READER_UNAVAILABLE'); }
          var expected = request.block.bytes;
          // O resolvedor é confiável, mas recebe sua própria cópia do descritor.
          var source = resolve({id:request.id, version:request.version, block:{id:request.block.id, bytes:expected, sha256:request.block.sha256}});
          if (finished) { return; }
          if (!source || !source.file || !integer(source.offset) || !integer(source.file.size) || source.offset > source.file.size || expected > source.file.size-source.offset) { throw error('FILE_RANGE'); }
          var file = source.file, blob, slice;
          if (source.offset === 0 && file.size === expected) { blob = file; }
          else {
            slice = file.slice || file.webkitSlice || file.mozSlice;
            if (typeof slice !== 'function') { throw error('SLICE_UNAVAILABLE'); }
            blob = slice.call(file, source.offset, source.offset+expected);
          }
          if (!blob || blob.size !== expected || blob.size > limit) { throw error('BLOCK_LIMIT'); }
          reader = new root.FileReader();
          if (typeof reader.readAsArrayBuffer !== 'function') { throw error('FILE_READER_UNAVAILABLE'); }
          reader.onload = function () {
            if (finished) { return; }
            var bytes = reader.result;
            if (Object.prototype.toString.call(bytes) !== '[object ArrayBuffer]' || bytes.byteLength !== expected) { finish(error('BLOCK_UNAVAILABLE')); return; }
            finish(null, bytes);
          };
          reader.onerror = function () { if (!finished) { finish(reader.error || error('READ_FAILED')); } };
          reader.onabort = function () { finish(error('READ_ABORTED')); };
          reader.onloadend = function () { finish(error('READ_FAILED')); };
          timer = root.setTimeout(function () { stop('READ_TIMEOUT'); }, timeout);
          reader.readAsArrayBuffer(blob);
        } catch (e) {
          // Falha síncrona após início também deve interromper a leitura.
          if (reader && reader.readyState === 1) {
            detach(reader);
            try { reader.abort(); } catch (ignore) { disabled = true; }
          }
          finish(e);
        }
      }, 0);
      return handle;
    }
    return {readBlock:readBlock, close:function () { closed = true; if (busy) { busy.cancel(); } }};
  };
}(typeof window !== 'undefined' ? window : this));
