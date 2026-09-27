(function (root) {
  'use strict';
  var E = root.Escr, D = E.maturationData, known = {};
  D.infinitiveLemmas.forEach(function (lemma) { known['$' + lemma] = true; });
  /* Recorte vindo de experiment/encore-piso-2012: lema conhecido + preposição
     contígua + sujeito opcional. Não escolhe futuro do subjuntivo por sufixo. */
  function candidates(ts, index, text) {
    var word = E.reading.canonical(ts[index].value), previous = ts[index - 1], subject, p, result = [], lemma, ending, i;
    if (!previous) { return result; }
    subject = D.subjects[E.reading.canonical(previous.value)]; p = index - (subject ? 2 : 1);
    if (p < 0 || D.infinitivePrepositions.indexOf(E.reading.canonical(ts[p].value)) < 0) { return result; }
    for (i = p + 1; i <= index; i += 1) { if (!/^[ \t\u00a0]+$/.test(text.slice(ts[i - 1].end, ts[i].start))) { return result; } }
    if (known['$' + word] && (!subject || subject[1] === 'singular' && (subject[0] === 1 || subject[0] === 3))) {
      result.push([word, subject ? 'infinitivo pessoal: forma singular' : 'infinitivo: leitura contextual', subject ? subject[0] : null, subject ? subject[1] : null]);
    }
    for (i = 0; i < D.infinitiveEndings.length; i += 1) {
      ending = D.infinitiveEndings[i];
      if (word.slice(-ending[0].length) !== ending[0]) { continue; }
      lemma = word.slice(0, -ending[0].length);
      if (!known['$' + lemma] || subject && (subject[0] !== ending[1] || subject[1] !== ending[2])) { continue; }
      result.push([lemma, 'infinitivo pessoal', ending[1], ending[2]]);
    }
    return result;
  }
  E.infinitiveCandidates = candidates;
}(typeof window !== 'undefined' ? window : this));
