/* Relógio mecânico: repouso -> meia troca -> destino; sem animação contínua. */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};
  root.Escr.setClockDigit = function (node, next, visible) {
    if (node.getAttribute('data-digit') === next) { return; }
    if (node._escrDigitTimer) { root.clearTimeout(node._escrDigitTimer); node._escrDigitTimer = null; }
    var generation = (node._escrDigitGeneration || 0) + 1; node._escrDigitGeneration = generation;
    var old = node.getAttribute('data-digit'), selectors = ['.static-top span', '.static-bottom span', '.flap-front span', '.flap-back span'], parts = [], i;
    for (i = 0; i < selectors.length; i += 1) { parts.push(node.querySelector(selectors[i])); }
    node.setAttribute('data-digit', next);
    function finish() {
      // Uma troca mais recente invalida o callback, mesmo se voltou ao mesmo dígito.
      if (node._escrDigitGeneration !== generation) { return; }
      node._escrDigitTimer = null;
      for (var j = 0; j < parts.length; j += 1) { parts[j].textContent = next; }
      node.setAttribute('data-digit-phase', 'rest');
    }
    var reduced = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!old || reduced || root.document.hidden || visible === false) { finish(); return; }
    parts[0].textContent = next; parts[1].textContent = old;
    parts[2].textContent = next; parts[3].textContent = next;
    node.setAttribute('data-digit-phase', 'middle');
    node._escrDigitTimer = root.setTimeout(finish, 70);
  };
}(typeof window !== 'undefined' ? window : this));
