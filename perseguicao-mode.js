// Perseguição — escrita com urgência e combos de coesão e ritmo
// Depende: combo-detector.js
// Puro: sem DOM, sem RAF, sem estado de UI — tudo via callback onDetect

(function () {
  'use strict';

  const DEBOUNCE_MS = 150;

  let _textarea     = null;
  let _debounceId   = null;
  let _ultimoCombo  = 0;
  let _sessaoInicio = null;
  let _onDetect     = null;

  function _analisar() {
    if (!_textarea) return;
    const resultado = ComboDetector.detectCombos(_textarea.value);
    const novoCombo = resultado.combo;
    const pulsar    = novoCombo > _ultimoCombo;
    _ultimoCombo    = novoCombo;
    if (_onDetect) _onDetect(novoCombo, pulsar, resultado);
  }

  function _onInput() {
    if (!_sessaoInicio) _sessaoInicio = Date.now();
    clearTimeout(_debounceId);
    _debounceId = setTimeout(_analisar, DEBOUNCE_MS);
  }

  function mount(textarea, onDetect) {
    _textarea     = textarea;
    _onDetect     = onDetect;
    _ultimoCombo  = 0;
    _sessaoInicio = null;
    _debounceId   = null;
    _textarea.addEventListener('input', _onInput, { passive: true });
  }

  function unmount() {
    if (_textarea) _textarea.removeEventListener('input', _onInput);
    clearTimeout(_debounceId);
    _textarea   = null;
    _onDetect   = null;
    _debounceId = null;
  }

  function getSessao() {
    return {
      texto:    _textarea?.value || '',
      duracao:  _sessaoInicio ? Math.round((Date.now() - _sessaoInicio) / 1000) : 0,
      palavras: (_textarea?.value || '').trim().split(/\s+/).filter(Boolean).length,
      combos:   _ultimoCombo,
    };
  }

  window.PerseguicaoModo = { mount, unmount, getSessao };
})();
