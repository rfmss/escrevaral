// ui-dialog.js — diálogos customizados e fundação modal acessível
// Depende apenas do DOM já declarado em index.html.

const MODAL_FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

let _activeModal = null;
let _modalReturnFocus = null;

function _isVisibleModal(modal) {
  if (!(modal instanceof HTMLElement)) return false;
  if (modal.hidden || modal.closest('[hidden]')) return false;
  const style = getComputedStyle(modal);
  const rect = modal.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
}

function _getOpenModal() {
  return [...document.querySelectorAll('[aria-modal="true"]')]
    .reverse()
    .find(_isVisibleModal) || null;
}

function _getModalFocusables(modal) {
  if (!modal) return [];
  return [...modal.querySelectorAll(MODAL_FOCUSABLE_SELECTOR)].filter((element) => {
    if (!(element instanceof HTMLElement)) return false;
    if (element.hidden || element.closest('[hidden]')) return false;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  });
}

function _focusModalStart(modal) {
  const first = _getModalFocusables(modal)[0];
  if (first) {
    first.focus({ preventScroll: true });
    first.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    return;
  }
  if (!modal.hasAttribute('tabindex')) modal.setAttribute('tabindex', '-1');
  modal.focus({ preventScroll: true });
}

function _syncActiveModal() {
  const nextModal = _getOpenModal();
  if (nextModal === _activeModal) return;

  if (_activeModal && !nextModal) {
    const returnTarget = _modalReturnFocus;
    _activeModal = null;
    _modalReturnFocus = null;
    if (returnTarget instanceof HTMLElement && returnTarget.isConnected && !returnTarget.closest('[hidden]')) {
      requestAnimationFrame(() => returnTarget.focus({ preventScroll: true }));
    }
    return;
  }

  if (nextModal) {
    if (!_activeModal) {
      _modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    _activeModal = nextModal;
    requestAnimationFrame(() => {
      if (_activeModal && !_activeModal.contains(document.activeElement)) {
        _focusModalStart(_activeModal);
      }
    });
  }
}

function _trapModalTab(event) {
  const modal = _getOpenModal();
  if (!modal || event.key !== 'Tab') return;

  const focusables = _getModalFocusables(modal);
  if (!focusables.length) {
    event.preventDefault();
    _focusModalStart(modal);
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;

  if (!modal.contains(active)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
    return;
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  } else if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  }
}

document.addEventListener('keydown', _trapModalTab, true);
document.addEventListener('focusin', (event) => {
  const modal = _getOpenModal();
  if (!modal || modal.contains(event.target)) return;
  _focusModalStart(modal);
});

const modalObserver = new MutationObserver(_syncActiveModal);
modalObserver.observe(document.documentElement, {
  attributes: true,
  childList: true,
  subtree: true,
  attributeFilter: ['hidden', 'aria-hidden', 'class'],
});
requestAnimationFrame(_syncActiveModal);

const vrdaDialogOverlay = document.getElementById('vrda-dialog-overlay');
const vrdaDialogMsg = document.getElementById('vrda-dialog-msg');
const vrdaDialogInput = document.getElementById('vrda-dialog-input');
const vrdaDialogCancel = document.getElementById('vrda-dialog-cancel');
const vrdaDialogOk = document.getElementById('vrda-dialog-ok');
let _vrdaDialogCb = null;
let _vrdaDialogIsPrompt = false;

function vrdaPrompt(message, defaultValue, callback) {
  vrdaDialogMsg.textContent = message;
  vrdaDialogInput.hidden = false;
  vrdaDialogInput.value = defaultValue || '';
  _vrdaDialogIsPrompt = true;
  _vrdaDialogCb = callback;
  vrdaDialogOverlay.hidden = false;
  vrdaDialogOverlay.removeAttribute('aria-hidden');
  _syncActiveModal();
  setTimeout(() => {
    vrdaDialogInput.focus();
    vrdaDialogInput.select();
  }, 40);
}

function vrdaConfirm(message, callback) {
  vrdaDialogMsg.textContent = message;
  vrdaDialogInput.hidden = true;
  _vrdaDialogIsPrompt = false;
  _vrdaDialogCb = callback;
  vrdaDialogOverlay.hidden = false;
  vrdaDialogOverlay.removeAttribute('aria-hidden');
  _syncActiveModal();
  setTimeout(() => vrdaDialogOk.focus(), 40);
}

function _closeVrdaDialog(ok) {
  const value = _vrdaDialogIsPrompt ? (ok ? vrdaDialogInput.value : null) : ok;
  vrdaDialogOverlay.hidden = true;
  vrdaDialogOverlay.setAttribute('aria-hidden', 'true');
  const callback = _vrdaDialogCb;
  _vrdaDialogCb = null;
  _syncActiveModal();
  if (callback) callback(value);
}

if (vrdaDialogOk) vrdaDialogOk.addEventListener('click', () => _closeVrdaDialog(true));
if (vrdaDialogCancel) vrdaDialogCancel.addEventListener('click', () => _closeVrdaDialog(false));
if (vrdaDialogInput) {
  vrdaDialogInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') _closeVrdaDialog(true);
    if (event.key === 'Escape') _closeVrdaDialog(false);
  });
}
if (vrdaDialogOverlay) {
  vrdaDialogOverlay.addEventListener('click', (event) => {
    if (event.target === vrdaDialogOverlay) _closeVrdaDialog(false);
  });
}

// ── LEITOR EDITORIAL (iframe embutido) ──────────────────────────────────────
const editorialOverlay = document.getElementById('editorial-overlay');
const editorialFrame = document.getElementById('editorial-frame');
const editorialBarTitle = document.getElementById('editorial-bar-title');
const editorialBack = document.getElementById('editorial-back');
const editorialExternal = document.getElementById('editorial-external');

window.VeredaDialog = {
  prompt: (message, defaultValue, callback) => vrdaPrompt(message, defaultValue, callback),
  confirm: (message, callback) => vrdaConfirm(message, callback),
  init: true,
};

window.VeredaModalFocus = {
  getOpen: _getOpenModal,
  sync: _syncActiveModal,
};

function _createMesaPortatilLink(className, locationName) {
  const link = document.createElement('a');
  link.href = '/pegar/';
  link.className = className;
  link.style.textDecoration = 'none';
  link.dataset.mesaPortatilEntry = locationName;
  link.setAttribute('aria-label', 'Mesa no celular — levar e trazer textos entre dispositivos');
  link.title = 'Leve e traga seus textos entre dispositivos, sem conta e sem servidor';
  link.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">smartphone</span><span>Mesa no celular</span>';
  link.addEventListener('click', async (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const saved = typeof persistState === 'function'
      ? await persistState('Texto guardado antes de abrir a mesa no celular')
      : true;
    if (saved === false) {
      if (typeof saveStatus !== 'undefined' && saveStatus) {
        saveStatus.textContent = 'Não foi possível guardar o texto antes de sair';
      }
      return;
    }
    window.location.assign(link.href);
  });
  return link;
}

function _installMesaPortatilEntries() {
  const mobileNav = document.querySelector('#mobile-bandeja .bandeja-nav');
  if (mobileNav && !mobileNav.querySelector('[data-mesa-portatil-entry="bandeja"]')) {
    const link = _createMesaPortatilLink('bandeja-item', 'bandeja');
    const backupItem = mobileNav.querySelector('[data-action="open-backup-from-bandeja"]');
    if (backupItem) backupItem.insertAdjacentElement('afterend', link);
    else mobileNav.appendChild(link);
  }

  const archiveActions = document.querySelector('.archive-backup-actions');
  if (archiveActions && !archiveActions.querySelector('[data-mesa-portatil-entry="acervo"]')) {
    const link = _createMesaPortatilLink('secondary-button', 'acervo');
    archiveActions.insertAdjacentElement('afterbegin', link);
  }
}

_installMesaPortatilEntries();

// Controladores que dependem das funções globais declaradas em app.js entram
// somente após todos os scripts deferidos terminarem sua inicialização.
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('script[data-post-app-controller="palavras"]')) return;
  const script = document.createElement('script');
  script.src = './lexical-view-controller.js?v=20260725-release-candidate';
  script.defer = true;
  script.dataset.postAppController = 'palavras';
  document.body.appendChild(script);
}, { once: true });
