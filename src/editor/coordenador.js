(function () {
  'use strict';
  function start(session, repository, view, platform, exporter) {
    var pause = null, deadline = null, composing = false;
    function clearTimers() {
      platform.clear(pause); platform.clear(deadline); pause = null; deadline = null;
    }
    function save() {
      var result, time;
      if (composing) { return; }
      clearTimers(); result = session.save();
      if (result.ok && !result.unchanged) {
        time = new Date(session.snapshot().updated);
        view.status('Guardado neste navegador às ' + ('0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2) + '.', 'saved');
      } else if (!result.ok) {
        if (result.reason === 'conflict') {
          view.status('Outra aba alterou a folha. Sua cópia foi preservada; baixe o texto antes de continuar.', 'error');
        } else if (result.reason === 'unreadable') {
          view.status('A folha guardada não pôde ser lida. Ela não será sobrescrita. Baixe uma cópia do rascunho.', 'error');
        } else {
          view.status('Não foi possível guardar. O rascunho continua na Mesa; baixe uma cópia.', 'error');
        }
      }
    }
    function schedule() {
      if (composing) { return; }
      platform.clear(pause); pause = platform.later(save, 900);
      if (deadline === null) { deadline = platform.later(save, 3000); }
    }
    function exportText() {
      var snapshot = session.snapshot();
      view.exportCopy(snapshot, exporter.download(snapshot));
    }
    view.fill(session.snapshot());
    view.bind({
      change: function (title, text) {
        if (session.change(title, text)) { view.status('Rascunho com alterações por guardar.'); schedule(); }
      },
      compose: function (value) {
        composing = value; session.compose(value);
        if (value) { clearTimers(); } else if (session.dirty()) { schedule(); }
      },
      save: save, exportText: exportText,
      recover: function () {
        view.showRecoveries(repository.recoveries(), function (record) {
          if (!platform.confirm('Abrir esta cópia na Mesa? Se houver alterações sem guardar, baixe-as antes.')) { return false; }
          clearTimers();
          if (!session.restore(record)) { view.status('Não foi possível abrir esta cópia com segurança.', 'error'); return false; }
          view.fill(session.snapshot());
          view.status(session.problem() ? 'Cópia recuperada na Mesa. Baixe o texto; a origem ilegível continua preservada.' : 'Cópia aberta como rascunho. Você pode guardar ou baixar o texto.');
          return true;
        });
      }
    });
    platform.listen('storage', function (event) {
      if (event.key === repository.key || event.key === null) {
        clearTimers(); session.externalChange();
        view.status('O armazenamento mudou em outra aba. Baixe sua cópia antes de continuar.', 'error');
      }
    });
    platform.listen('pagehide', save);
    platform.listen('beforeunload', function (event) {
      save();
      if (session.dirty()) { event.preventDefault(); event.returnValue = ''; }
    });
    if (session.problem() === 'unreadable') {
      view.status('Há dados que não puderam ser lidos. Preservamos a origem; este rascunho só pode ser exportado.', 'error');
    } else if (session.problem()) {
      view.status('Armazenamento indisponível. Esta mesa é temporária: baixe seu texto.', 'error');
    } else { view.status('Mesa aberta. As alterações serão guardadas neste navegador.'); }
    view.enable();
  }
  return { start: start };
})
