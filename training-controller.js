// training-controller.js — orquestra Deriva e Perseguição
// Depende: deriva-mode.js, perseguicao-mode.js, combo-detector.js
// Depende (globals app.js): addManuscript, setView, VeredaArchive

(function () {
  'use strict';

  // ── utilitários ────────────────────────────────────────

  function _palavras(texto) {
    return texto.trim().split(/\s+/).filter(Boolean).length;
  }

  function _formatarDuracao(segundos) {
    if (segundos < 60) return `${segundos}s`;
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return s > 0 ? `${m}min ${s}s` : `${m}min`;
  }

  // ── DERIVA ─────────────────────────────────────────────

  function _atualizarContadorDeriva() {
    const textarea = document.getElementById('deriva-textarea');
    const contador = document.getElementById('deriva-contador');
    if (!textarea || !contador) return;
    const n = _palavras(textarea.value);
    contador.textContent = n === 1 ? '1 palavra' : `${n} palavras`;
  }

  function _limparDeriva() {
    DerivaModo.unmount();
    const textarea = document.getElementById('deriva-textarea');
    const arena    = document.getElementById('deriva-arena');
    const cards    = document.getElementById('training-cards');
    if (textarea) {
      textarea.value = '';
      textarea.removeEventListener('input', _atualizarContadorDeriva);
    }
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
    textarea.addEventListener('input', _atualizarContadorDeriva, { passive: true });
    textarea.focus();
  }

  function descartarDeriva() { _limparDeriva(); }

  function salvarDeriva() {
    const sessao = DerivaModo.getSessao();
    if (!sessao.texto.trim()) { _limparDeriva(); return; }

    const durStr  = _formatarDuracao(sessao.duracao);
    const ruptStr = sessao.rupturas > 0 ? `, ${sessao.rupturas} ruptura${sessao.rupturas > 1 ? 's' : ''}` : '';
    const descricao = `Deriva — ${sessao.palavras} palavra${sessao.palavras !== 1 ? 's' : ''} em ${durStr}${ruptStr}.`;

    const manuscript = VeredaArchive.createManuscript({
      id: `deriva-${Date.now()}`,
      title: '', text: sessao.texto, type: 'manuscrito',
      folder: 'Treinos', description: descricao,
    });

    _limparDeriva();
    addManuscript(manuscript, 'Deriva salva');
    setView('editor', { updateRoute: true });
  }

  // ── PERSEGUIÇÃO ────────────────────────────────────────

  function _onComboDetect(count, pulsar) {
    const contador = document.getElementById('perseguicao-contador');
    const fio      = document.getElementById('fio-perseguicao');
    if (contador) contador.textContent = count === 1 ? '1 combo' : `${count} combos`;
    if (pulsar && fio) {
      fio.classList.remove('pulsando');
      void fio.offsetWidth; // força reflow para reiniciar animação
      fio.classList.add('pulsando');
      fio.addEventListener('animationend', () => fio.classList.remove('pulsando'), { once: true });
    }
  }

  function _limparPerseguicao() {
    PerseguicaoModo.unmount();
    const textarea = document.getElementById('perseguicao-textarea');
    const arena    = document.getElementById('perseguicao-arena');
    const cards    = document.getElementById('training-cards');
    const contador = document.getElementById('perseguicao-contador');
    if (textarea) textarea.value = '';
    if (contador) contador.textContent = '0 combos';
    if (arena)  arena.hidden  = true;
    if (cards)  cards.hidden  = false;
  }

  function iniciarPerseguicao() {
    const cards    = document.getElementById('training-cards');
    const arena    = document.getElementById('perseguicao-arena');
    const textarea = document.getElementById('perseguicao-textarea');
    if (!arena || !textarea) return;

    cards.hidden = true;
    arena.hidden = false;
    textarea.value = '';
    document.getElementById('perseguicao-contador').textContent = '0 combos';

    PerseguicaoModo.mount(textarea, _onComboDetect);
    textarea.focus();
  }

  function descartarPerseguicao() { _limparPerseguicao(); }

  function salvarPerseguicao() {
    const sessao = PerseguicaoModo.getSessao();
    if (!sessao.texto.trim()) { _limparPerseguicao(); return; }

    const durStr    = _formatarDuracao(sessao.duracao);
    const comboStr  = sessao.combos === 1 ? '1 combo' : `${sessao.combos} combos`;
    const descricao = `Perseguição — ${sessao.palavras} palavra${sessao.palavras !== 1 ? 's' : ''} em ${durStr}, ${comboStr}.`;

    const manuscript = VeredaArchive.createManuscript({
      id: `perseguicao-${Date.now()}`,
      title: '', text: sessao.texto, type: 'manuscrito',
      folder: 'Treinos', description: descricao,
    });

    _limparPerseguicao();
    addManuscript(manuscript, 'Perseguição salva');
    setView('editor', { updateRoute: true });
  }

  // ── init ───────────────────────────────────────────────

  function init() {
    const btnDeriva       = document.getElementById('btn-modo-deriva');
    const btnDescartar    = document.getElementById('deriva-descartar');
    const btnSalvar       = document.getElementById('deriva-salvar');
    const btnPerseguicao  = document.getElementById('btn-modo-perseguicao');
    const btnPDescartar   = document.getElementById('perseguicao-descartar');
    const btnPSalvar      = document.getElementById('perseguicao-salvar');

    if (btnDeriva)      btnDeriva.addEventListener('click', iniciarDeriva);
    if (btnDescartar)   btnDescartar.addEventListener('click', descartarDeriva);
    if (btnSalvar)      btnSalvar.addEventListener('click', salvarDeriva);
    if (btnPerseguicao) btnPerseguicao.addEventListener('click', iniciarPerseguicao);
    if (btnPDescartar)  btnPDescartar.addEventListener('click', descartarPerseguicao);
    if (btnPSalvar)     btnPSalvar.addEventListener('click', salvarPerseguicao);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
