(function () {
  'use strict';
  function create(doc) {
    function byId(id) { return doc.getElementById(id); }
    var title = byId('titulo'), text = byId('manuscrito'), activePanel = null, trigger = null;
    var recovery = byId('painel-recuperacao'), exportPanel = byId('painel-exportacao');
    function status(message, kind) {
      byId('estado').textContent = message;
      byId('estado').setAttribute('data-kind', kind || 'normal');
    }
    function updateCount() {
      byId('caracteres').textContent = text.value ? 'Texto em edição' : 'Folha em branco';
    }
    function closePanel() {
      if (!activePanel) { return; }
      activePanel.setAttribute('hidden', 'hidden'); activePanel = null;
      if (trigger) { trigger.focus(); }
    }
    function openPanel(panel) {
      if (activePanel) { closePanel(); }
      trigger = doc.activeElement; activePanel = panel;
      panel.removeAttribute('hidden'); panel.focus();
    }
    function bind(actions) {
      function changed() { updateCount(); actions.change(title.value, text.value); }
      title.addEventListener('input', changed, false);
      text.addEventListener('input', changed, false);
      text.addEventListener('compositionstart', function () { actions.compose(true); }, false);
      text.addEventListener('compositionend', function () { changed(); actions.compose(false); }, false);
      title.addEventListener('compositionstart', function () { actions.compose(true); }, false);
      title.addEventListener('compositionend', function () { changed(); actions.compose(false); }, false);
      byId('salvar').addEventListener('click', actions.save, false);
      byId('exportar').addEventListener('click', actions.exportText, false);
      byId('recuperar').addEventListener('click', actions.recover, false);
      byId('fechar-recuperacao').addEventListener('click', closePanel, false);
      byId('fechar-exportacao').addEventListener('click', closePanel, false);
      byId('selecionar-copia').addEventListener('click', function () { byId('copia').focus(); byId('copia').select(); }, false);
      doc.addEventListener('keydown', function (event) {
        var key = event.keyCode, items, first, last;
        if ((event.ctrlKey || event.metaKey) && key === 83) { event.preventDefault(); actions.save(); }
        if (key === 27) { closePanel(); }
        if (key === 9 && activePanel) {
          items = activePanel.querySelectorAll('button, textarea, a[href]');
          first = items[0]; last = items[items.length - 1];
          if (event.shiftKey && (doc.activeElement === first || doc.activeElement === activePanel)) {
            event.preventDefault(); last.focus();
          } else if (!event.shiftKey && (doc.activeElement === last || doc.activeElement === activePanel)) {
            event.preventDefault(); first.focus();
          }
        }
      }, false);
      doc.addEventListener('visibilitychange', function () { if (doc.hidden) { actions.save(); } }, false);
      text.addEventListener('blur', actions.save, false);
      title.addEventListener('blur', actions.save, false);
    }
    function fill(record) { title.value = record.title; text.value = record.text; updateCount(); }
    function showRecoveries(result, choose) {
      var list = byId('versoes'), i;
      while (list.firstChild) { list.removeChild(list.firstChild); }
      function item(entry) {
        var li = doc.createElement('li'), button = doc.createElement('button'), detail = doc.createElement('span');
        button.type = 'button'; button.textContent = entry.record.title || 'Sem título';
        detail.textContent = entry.record.text.slice(0, 100) || '(Folha vazia)';
        li.appendChild(button); li.appendChild(detail); list.appendChild(li);
        button.addEventListener('click', function () {
          if (choose(entry.record)) { closePanel(); text.focus(); }
        }, false);
      }
      for (i = 0; i < result.items.length; i += 1) { item(result.items[i]); }
      if (!result.items.length || result.unreadable) {
        var empty = doc.createElement('li');
        empty.textContent = result.unreadable ? 'Há cópias que não puderam ser lidas. Elas foram preservadas.' : 'Ainda não há outra versão do texto.';
        list.appendChild(empty);
      }
      openPanel(recovery);
    }
    return {
      bind: bind, fill: fill, status: status, showRecoveries: showRecoveries,
      enable: function () {
        title.readOnly = false; text.readOnly = false;
        byId('salvar').disabled = byId('exportar').disabled = byId('recuperar').disabled = false;
      },
      exportCopy: function (record, initiated) {
        byId('copia').value = record.text;
        byId('ajuda-exportacao').textContent = initiated ? 'O download foi solicitado. Se não aparecer, selecione e copie o texto abaixo.' : 'Este navegador não oferece o download direto. Selecione e copie o texto abaixo.';
        openPanel(exportPanel);
      }
    };
  }
  return { create: create };
})
