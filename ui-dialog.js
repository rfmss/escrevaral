// ui-dialog.js — diálogo customizado (substitui prompt/confirm nativos)
// Depende de: state-store.js (via globals DOM abaixo)

const vrdaDialogOverlay = document.getElementById("vrda-dialog-overlay");
const vrdaDialogMsg     = document.getElementById("vrda-dialog-msg");
const vrdaDialogInput   = document.getElementById("vrda-dialog-input");
const vrdaDialogCancel  = document.getElementById("vrda-dialog-cancel");
const vrdaDialogOk      = document.getElementById("vrda-dialog-ok");
let _vrdaDialogCb       = null;
let _vrdaDialogIsPrompt = false;
let _vrdaDialogReturnFocus = null;
let _vrdaDialogInertedElements = [];

function _setDialogBackgroundInert(inert) {
  if (inert) {
    _vrdaDialogInertedElements = [...document.querySelectorAll("body > :not(#vrda-dialog-overlay)")]
      .filter((element) => !element.hasAttribute("inert"));
    _vrdaDialogInertedElements.forEach((element) => element.setAttribute("inert", ""));
    return;
  }
  _vrdaDialogInertedElements.forEach((element) => element.removeAttribute("inert"));
  _vrdaDialogInertedElements = [];
}

function _openVrdaDialog() {
  _vrdaDialogReturnFocus = document.activeElement;
  _setDialogBackgroundInert(true);
  vrdaDialogOverlay.hidden = false;
  vrdaDialogOverlay.removeAttribute("aria-hidden");
}

function vrdaPrompt(message, defaultValue, callback) {
  vrdaDialogMsg.textContent = message;
  vrdaDialogInput.hidden = false;
  vrdaDialogInput.value = defaultValue || "";
  _vrdaDialogIsPrompt = true;
  _vrdaDialogCb = callback;
  _openVrdaDialog();
  setTimeout(() => { vrdaDialogInput.focus(); vrdaDialogInput.select(); }, 40);
}

function vrdaConfirm(message, callback) {
  vrdaDialogMsg.textContent = message;
  vrdaDialogInput.hidden = true;
  _vrdaDialogIsPrompt = false;
  _vrdaDialogCb = callback;
  _openVrdaDialog();
  setTimeout(() => vrdaDialogOk.focus(), 40);
}

function _closeVrdaDialog(ok) {
  const val = _vrdaDialogIsPrompt ? (ok ? vrdaDialogInput.value : null) : ok;
  vrdaDialogOverlay.hidden = true;
  vrdaDialogOverlay.setAttribute("aria-hidden", "true");
  _setDialogBackgroundInert(false);
  const cb = _vrdaDialogCb;
  _vrdaDialogCb = null;
  if (cb) cb(val);
  if (_vrdaDialogReturnFocus?.isConnected) _vrdaDialogReturnFocus.focus();
  _vrdaDialogReturnFocus = null;
}

function _handleVrdaDialogKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    _closeVrdaDialog(false);
    return;
  }
  if (event.key !== "Tab") return;
  const controls = [...vrdaDialogOverlay.querySelectorAll(
    'button:not([disabled]), input:not([disabled]):not([hidden]), [tabindex]:not([tabindex="-1"])'
  )].filter((element) => element.offsetParent !== null);
  if (!controls.length) return;
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}


// ── LEITOR EDITORIAL (iframe embutido) ──────────────────────────────────────
const editorialOverlay  = document.getElementById("editorial-overlay");
const editorialFrame    = document.getElementById("editorial-frame");
const editorialBarTitle = document.getElementById("editorial-bar-title");
const editorialBack     = document.getElementById("editorial-back");
const editorialExternal = document.getElementById("editorial-external");
// ── Event listeners do diálogo ──────────────────────────────────────────────
if (vrdaDialogOk)     vrdaDialogOk.addEventListener("click", () => _closeVrdaDialog(true));
if (vrdaDialogCancel) vrdaDialogCancel.addEventListener("click", () => _closeVrdaDialog(false));
if (vrdaDialogInput)  vrdaDialogInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter")  _closeVrdaDialog(true);
});
if (vrdaDialogOverlay) {
  vrdaDialogOverlay.addEventListener("keydown", _handleVrdaDialogKeydown);
  vrdaDialogOverlay.addEventListener("click", (event) => {
    if (event.target === vrdaDialogOverlay) _closeVrdaDialog(false);
  });
}

window.VeredaDialog = {
  prompt:  (msg, def, cb) => vrdaPrompt(msg, def, cb),
  confirm: (msg, cb)      => vrdaConfirm(msg, cb),
  init: true,
};
