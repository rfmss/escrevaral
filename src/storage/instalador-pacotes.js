/* Coordenador opcional. O hospedeiro fornece armazenamento e leitor limitado;
 * não escolhe URLs, não abre a rede e não recebe o manuscrito. */
(function (root) {
  'use strict';
  var E = root.Escr;
  function error(code) { var e = new Error(code); e.code = code; return e; }
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  E.createPackageInstaller = function (options) {
    options = options || {};
    var store = options.store, reader = options.readBlock, busy = false;
    if (!store || typeof reader !== 'function' || !['stage','inspect','put','activate'].every(function (name) { return typeof store[name] === 'function'; })) { throw error('INSTALLER_OPTIONS'); }
    function install(input, progress, done) {
      var manifest, ticket = null, pending = null, finished = false, cancelled = false;
      var phase = 'staging', stored = {}, count = 0, size = 0, total = 0, index = 0;
      var accepted = !busy, inputError = null;
      if (typeof done !== 'function') { throw error('CALLBACK_REQUIRED'); }
      if (accepted) {
        busy = true;
        try { manifest = copy(input); } catch (e) { inputError = error('INVALID_MANIFEST'); }
      }
      function report() {
        return {phase:phase, ticket:ticket ? copy(ticket) : null,
          storedBlocks:count, storedBytes:size, totalBlocks:manifest && manifest.blocks ? manifest.blocks.length : 0, totalBytes:total};
      }
      function finish(e) {
        if (finished) { return; }
        finished = true;
        phase = e ? (e.code === 'CANCELLED' ? 'cancelled' : 'failed') : 'installed';
        if (accepted) { busy = false; }
        done(e || null, report());
      }
      function later(fn) {
        root.setTimeout(function () {
          if (finished) { return; }
          if (cancelled) { finish(error('CANCELLED')); return; }
          try { fn(); } catch (e) { finish(e); }
        }, 0);
      }
      function notify(nextPhase) {
        phase = nextPhase;
        if (typeof progress === 'function') { progress(report()); }
        if (cancelled) { finish(error('CANCELLED')); return false; }
        return true;
      }
      // A resposta pode ser síncrona; a continuação sempre cede a execução.
      // Duplicatas/respostas tardias não iniciam a próxima unidade.
      function invoke(start, next) {
        var call = {handle:null, settled:false}; pending = call;
        function receive(e, value) {
          if (call.settled || finished) { return; }
          call.settled = true;
          root.setTimeout(function () {
            if (finished) { return; }
            pending = null;
            if (cancelled) { value = null; finish(error('CANCELLED')); return; }
            try { if (e) { finish(e); } else { next(value); } } catch (ex) { finish(ex); }
            value = null;
          }, 0);
        }
        try { call.handle = start(receive); } catch (e) { receive(e); }
      }
      function nextBlock() {
        var block;
        while (index < manifest.blocks.length && stored['$'+manifest.blocks[index].id]) { index += 1; }
        if (index === manifest.blocks.length) {
          // A partir daqui cancelar retorna false: aguardar o resultado atômico
          // evita anunciar cancelamento depois de uma ativação já confirmada.
          if (!notify('activating')) { return; }
          invoke(function (cb) { return store.activate(ticket, cb); }, function () { finish(null); });
          return;
        }
        block = manifest.blocks[index];
        if (!notify('receiving')) { return; }
        invoke(function (cb) {
          return reader({id:manifest.id, version:manifest.version, block:copy(block)}, cb);
        }, function (bytes) {
          if (!notify('storing')) { return; }
          invoke(function (cb) { return store.put(ticket, block.id, bytes, cb); }, function () {
            count += 1; size += block.bytes; index += 1;
            if (notify('stored')) { later(nextBlock); }
          });
        });
      }
      var handle = {cancel:function () {
        if (finished || !accepted || phase === 'activating') { return false; }
        cancelled = true;
        if (pending && pending.handle && typeof pending.handle.cancel === 'function') {
          try { pending.handle.cancel(); } catch (ignore) {}
        }
        // O leitor precisa concluir também após cancelamento. Não liberar o
        // orçamento enquanto a unidade física ainda pode estar em andamento.
        return true;
      }};
      later(function () {
        if (!accepted) { finish(error('BUSY')); return; }
        if (inputError) { finish(inputError); return; }
        if (!notify('staging')) { return; }
        invoke(function (cb) { return store.stage(manifest, cb); }, function (value) {
          ticket = value.ticket;
          if (!notify('inspecting')) { return; }
          invoke(function (cb) { return store.inspect(ticket, cb); }, function (state) {
            manifest = state.manifest;
            state.stored.forEach(function (id) { stored['$'+id] = true; });
            manifest.blocks.forEach(function (b) { total += b.bytes; if (stored['$'+b.id]) { count += 1; size += b.bytes; } });
            if (notify('resumed')) { later(nextBlock); }
          });
        });
      });
      return handle;
    }
    return {install:install};
  };
}(typeof window !== 'undefined' ? window : this));
