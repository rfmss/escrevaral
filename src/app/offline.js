/* O arquivo portátil é autossuficiente. Cache do site é um recurso opcional. */
(function (root) {
  'use strict';
  var D = root.document, status = D.getElementById('offline-status');
  var mode = D.querySelector('meta[name="distribution-mode"]');
  function show(state, message) {
    if (status) { status.setAttribute('data-offline-state', state); status.textContent = message; }
  }
  function fallback() {
    show('portable-needed', 'A cópia automática do site não está disponível. Guarde a mesa portátil e uma cópia dos seus textos seguindo os passos abaixo.');
  }
  if (root.location.protocol === 'file:' || mode && mode.getAttribute('content') === 'portable') {
    show('portable', 'Você está na mesa portátil. Este arquivo contém o editor e as lentes para abrir sem internet. Guarde seus textos separadamente em “Exportar tudo”.');
    return;
  }
  var N = root.navigator, sw = N && N.serviceWorker;
  if (!/^https?:$/.test(root.location.protocol) || root.isSecureContext === false || !sw || !sw.register ||
      !root.Promise || !root.caches || !root.crypto || !root.crypto.subtle || !root.crypto.subtle.digest) {
    fallback(); return;
  }
  show('preparing', 'Preparando uma cópia do site neste navegador. Para guardar uma mesa independente, use o arquivo portátil abaixo.');
  try {
    sw.register('service-worker.js').then(function (registration) {
      function available() {
        show('cached', 'Uma cópia do site está preparada neste navegador para voltar sem internet. O navegador pode removê-la; guarde também a mesa portátil e seus textos.');
      }
      function inspect() {
        if (registration.active && registration.active.state === 'activated') { available(); return; }
        var worker = registration.installing || registration.waiting || registration.active;
        if (!worker) { fallback(); return; }
        function changed() {
          if (worker.state === 'activated') { available(); }
          else if (worker.state === 'redundant') { fallback(); }
        }
        if (worker.addEventListener) { worker.addEventListener('statechange', changed, false); }
        changed();
      }
      inspect();
    }, fallback);
  } catch (error) { fallback(); }
}(window));
