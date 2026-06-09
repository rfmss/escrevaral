// Deriva — escrita livre para extravasar
// Fio: fica vivo enquanto o usuário digita; quebra após PAUSA_MS sem input

const PAUSA_MS = 4000;

let _textarea = null;
let _fioBar   = null;
let _rafId    = null;
let _lastInputAt  = null;
let _sessaoInicio = null;
let _fioVivo  = false;
let _fioRuptura = 0; // quantas vezes o fio quebrou

function _loopFio() {
  if (!_fioBar || !_lastInputAt) { _rafId = null; return; }
  // Para imediatamente se o painel ficou oculto (troca de aba ou view)
  if (_fioBar.closest('[hidden]') || _fioBar.offsetParent === null) { _rafId = null; return; }
  const elapsed  = Date.now() - _lastInputAt;
  const progress = Math.max(0, 1 - elapsed / PAUSA_MS);

  _fioBar.style.transform = `scaleX(${progress})`;

  if (progress <= 0) {
    _fioBar.dataset.estado = "quebrado";
    _fioVivo = false;
    _rafId = null;
    return;
  }

  _fioBar.dataset.estado = "vivo";
  _rafId = requestAnimationFrame(_loopFio);
}

function _onInput() {
  if (!_sessaoInicio) _sessaoInicio = Date.now();

  if (!_fioVivo) {
    _fioVivo = true;
    _fioRuptura++;
    if (_fioBar) _fioBar.dataset.estado = "vivo";
  }

  _lastInputAt = Date.now();

  if (!_rafId) _rafId = requestAnimationFrame(_loopFio);
}

function mount(textarea, fioBar) {
  _textarea     = textarea;
  _fioBar       = fioBar;
  _lastInputAt  = null;
  _sessaoInicio = null;
  _fioVivo      = false;
  _fioRuptura   = 0;

  if (_fioBar) { _fioBar.style.transform = "scaleX(0)"; _fioBar.dataset.estado = ""; }
  _textarea.addEventListener("input", _onInput);
}

function unmount() {
  if (_textarea) _textarea.removeEventListener("input", _onInput);
  if (_rafId)    { cancelAnimationFrame(_rafId); _rafId = null; }
  _textarea = null;
  _fioBar   = null;
}

function getSessao() {
  return {
    texto:       _textarea?.value || "",
    duracao:     _sessaoInicio ? Math.round((Date.now() - _sessaoInicio) / 1000) : 0,
    rupturas:    Math.max(0, _fioRuptura - 1), // primeira "ruptura" é o início
    palavras:    (_textarea?.value || "").trim().split(/\s+/).filter(Boolean).length,
  };
}

window.DerivaModo = { mount, unmount, getSessao };
