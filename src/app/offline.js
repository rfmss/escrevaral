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
  /* Analíticas sem cookies e sem JS externo (GoatCounter pixel, respeitando Do Not Track). */
  (function countVisit() {
    try {
      var host = root.location && root.location.hostname ? String(root.location.hostname).toLowerCase() : '';
      if (host !== 'escrevaral.com' && host !== 'www.escrevaral.com') { return; }
      if ((root.navigator && root.navigator.doNotTrack === '1') || root.doNotTrack === '1') { return; }
      if (root.navigator && root.navigator.onLine === false) { return; }
      var p = (root.location.pathname || '/') + (root.location.search || '');
      var ref = D.referrer || '';
      var s = root.screen ? (root.screen.width + ',' + root.screen.height + ',' + (root.devicePixelRatio || 1)) : '';
      var q = 'p=' + encodeURIComponent(p.slice(0, 240)) +
        '&t=' + encodeURIComponent(D.title || 'ESCREVARAL') +
        (ref ? '&r=' + encodeURIComponent(ref.slice(0, 240)) : '') +
        (s ? '&s=' + encodeURIComponent(s) : '') +
        '&rnd=' + Math.random().toString(36).slice(2, 8);
      var img = new root.Image();
      img.src = 'https://escrevaral.goatcounter.com/count?' + q;
    } catch (ignore) {}
  }());
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
