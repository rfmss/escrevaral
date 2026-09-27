(function (root) {
  'use strict';
  var E = root.Escr;
  function tokens(text) {
    var regex = /[A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f]+(?:[-'’][A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f]+)*|[0-9]+/g, out = [], m;
    while ((m = regex.exec(text))) { out.push({ value: m[0].toLowerCase(), start: m.index, end: m.index + m[0].length }); }
    return out;
  }
  function finding(lens, id, text, start, end, message, observation, interpretation, ambiguity, limit, source, extra) {
    var f = { id: id, lens: lens, feature: lens, severity: 'informação', confidence: 'moderada', message: message,
      start: start, end: end, snippet: text.slice(start, end), reference: null,
      evidence: { observation: observation, interpretation: interpretation, ambiguity: ambiguity, limit: limit, source: source } };
    if (extra) { Object.keys(extra).forEach(function (key) { f[key] = extra[key]; }); }
    return f;
  }
  function contextSilence(text, start, end) {
    var before = text.slice(Math.max(0, text.lastIndexOf('\n', start) + 1), start);
    var boundary = Math.max(before.lastIndexOf('.'), before.lastIndexOf('!'), before.lastIndexOf('?'));
    before = before.slice(boundary + 1).toLowerCase();
    /* Não atribuir ao narrador o que pode ser fala, negação, discussão ou autodesignação. */
    return /^\s*[—–-]/.test(before) || /(^|\s)(não|nunca|jamais|sem|critica|criticam|criticou|rejeita|rejeitam|rejeitou|condena|condenam|condenou|combate|combatem|combateu|expressão|termo|palavra|rótulo|chamado|chamada|disse|diz|afirmou|sou|somos)(\s|$)/.test(before);
  }
  function matches(text, trie, entries, cap, guard) {
    var clean = E.protectedText(text), ts = tokens(clean), out = [], i, j, node, best, candidate;
    for (i = 0; i < ts.length; i += 1) {
      node = trie; best = null;
      for (j = i; j < ts.length && j < i + 16; j += 1) {
        if (j > i && !/^[ \t\u00a0]+$/.test(clean.slice(ts[j - 1].end, ts[j].start))) { break; }
        node = node['$' + ts[j].value]; if (!node) { break; }
        if (typeof node.entry === 'number') { best = { index: node.entry, start: ts[i].start, end: ts[j].end, last: j }; }
      }
      if (best) {
        candidate = entries[best.index];
        if (!guard || !guard(text, best.start, best.end)) { out.push({ entry: candidate, start: best.start, end: best.end }); }
        i = best.last;
        if (out.length >= cap) { break; }
      }
    }
    return out;
  }
  E.instruments = { tokens: tokens, finding: finding, matches: matches, contextSilence: contextSilence };
}(typeof window !== 'undefined' ? window : this));
