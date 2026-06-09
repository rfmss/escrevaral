// training-controller.js — orquestra os modos de treino (Deriva, Perseguição)
// Depende: deriva-mode.js, combo-detector.js, app.js (addManuscript, setView, VeredaArchive)

(function () {
  'use strict';

  function _palavras(texto) {
    return texto.trim().split(/\s+/).filter(Boolean).length;
  }

  function _formatarDuracao(segundos) {
    if (segundos < 60) return `${segundos}s`;
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return s > 0 ? `${m}min ${s}s` : `${m}min`;
  }

  function _atualizarContador() {
    const textarea = document.getElementById('deriva-textarea');
    const contador = document.getElementById('deriva-contador');
    if (!textarea || !contador) return;
    const n = _palavras(textarea.value);
    contador.textContent = n === 1 ? '1 palavra' : `${n} palavras`;
  }

  function _limparArena() {
    DerivaModo.unmount();
    const textarea = document.getElementById('deriva-textarea');
    const arena    = document.getElementById('deriva-arena');
    const cards    = document.getElementById('training-cards');
    const resumo   = document.getElementById('deriva-resumo');
    if (textarea) {
      textarea.value = '';
      textarea.removeEventListener('input', _atualizarContador);
    }
    if (resumo) resumo.hidden = true;
    if (arena)  arena.hidden  = true;
    if (cards)  cards.hidden  = false;
  }

  function iniciarDeriva() {
    const cards    = document.getElementById('training-cards');
    const arena    = document.getElementById('deriva-arena');
    const textarea = document.getElementById('deriva-textarea');
    const fioBar   = document.getElementById('fio-bar');
    const contador = document.getElementById('deriva-contador');

    if (!arena || !textarea || !fioBar) return;

    cards.hidden = true;
    arena.hidden = false;
    textarea.value = '';
    contador.textContent = '0 palavras';

    DerivaModo.mount(textarea, fioBar);
    textarea.addEventListener('input', _atualizarContador, { passive: true });
    textarea.focus();
  }

  function descartarDeriva() {
    _limparArena();
  }

  function salvarDeriva() {
    const sessao = DerivaModo.getSessao();

    if (!sessao.texto.trim()) {
      _limparArena();
      return;
    }

    const durStr   = _formatarDuracao(sessao.duracao);
    const ruptStr  = sessao.rupturas > 0 ? `, ${sessao.rupturas} ruptura${sessao.rupturas > 1 ? 's' : ''}` : '';
    const descricao = `Deriva — ${sessao.palavras} palavra${sessao.palavras !== 1 ? 's' : ''} em ${durStr}${ruptStr}.`;

    const manuscript = VeredaArchive.createManuscript({
      id: `deriva-${Date.now()}`,
      title: '',
      text: sessao.texto,
      type: 'manuscrito',
      folder: 'Treinos',
      description: descricao,
    });

    _limparArena();
    addManuscript(manuscript, 'Deriva salva');
    setView('editor', { updateRoute: true });
  }

  function init() {
    const btnDeriva    = document.getElementById('btn-modo-deriva');
    const btnDescartar = document.getElementById('deriva-descartar');
    const btnSalvar    = document.getElementById('deriva-salvar');

    if (btnDeriva)    btnDeriva.addEventListener('click', iniciarDeriva);
    if (btnDescartar) btnDescartar.addEventListener('click', descartarDeriva);
    if (btnSalvar)    btnSalvar.addEventListener('click', salvarDeriva);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
