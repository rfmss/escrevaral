// ui-dialog.js — diálogo customizado (substitui prompt/confirm nativos)
// Depende de: state-store.js (via globals DOM abaixo)

const vrdaDialogOverlay = document.getElementById("vrda-dialog-overlay");
const vrdaDialogMsg     = document.getElementById("vrda-dialog-msg");
const vrdaDialogInput   = document.getElementById("vrda-dialog-input");
const vrdaDialogCancel  = document.getElementById("vrda-dialog-cancel");
const vrdaDialogOk      = document.getElementById("vrda-dialog-ok");
let _vrdaDialogCb       = null;
let _vrdaDialogIsPrompt = false;

function vrdaPrompt(message, defaultValue, callback) {
  vrdaDialogMsg.textContent = message;
  vrdaDialogInput.hidden = false;
  vrdaDialogInput.value = defaultValue || "";
  _vrdaDialogIsPrompt = true;
  _vrdaDialogCb = callback;
  vrdaDialogOverlay.hidden = false;
  vrdaDialogOverlay.removeAttribute("aria-hidden");
  setTimeout(() => { vrdaDialogInput.focus(); vrdaDialogInput.select(); }, 40);
}

function vrdaConfirm(message, callback) {
  vrdaDialogMsg.textContent = message;
  vrdaDialogInput.hidden = true;
  _vrdaDialogIsPrompt = false;
  _vrdaDialogCb = callback;
  vrdaDialogOverlay.hidden = false;
  vrdaDialogOverlay.removeAttribute("aria-hidden");
  setTimeout(() => vrdaDialogOk.focus(), 40);
}

function _closeVrdaDialog(ok) {
  const val = _vrdaDialogIsPrompt ? (ok ? vrdaDialogInput.value : null) : ok;
  vrdaDialogOverlay.hidden = true;
  vrdaDialogOverlay.setAttribute("aria-hidden", "true");
  const cb = _vrdaDialogCb;
  _vrdaDialogCb = null;
  if (cb) cb(val);
}

vrdaDialogOk.addEventListener("click", () => _closeVrdaDialog(true));
vrdaDialogCancel.addEventListener("click", () => _closeVrdaDialog(false));
vrdaDialogInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter")  _closeVrdaDialog(true);
  if (e.key === "Escape") _closeVrdaDialog(false);
});
vrdaDialogOverlay.addEventListener("click", (e) => {
  if (e.target === vrdaDialogOverlay) _closeVrdaDialog(false);
});


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
  if (e.key === "Escape") _closeVrdaDialog(false);
});

window.VeredaDialog = {
  prompt:  (msg, def, cb) => vrdaPrompt(msg, def, cb),
  confirm: (msg, cb)      => vrdaConfirm(msg, cb),
  init: true,
};

