(function (root) {
  'use strict';
  var E = root.Escr, S = E.instruments, D = E.grammarData, V = E.verbData, lexicon = {};
  function has(list, value) { return list.indexOf(value) !== -1; }
  function add(word, cls) {
    var key = '$' + word, list = lexicon[key] || (lexicon[key] = []);
    if (!has(list, cls)) { list.push(cls); }
  }
  Object.keys(D.classes).forEach(function (cls) { D.classes[cls].forEach(function (word) { add(word, cls); }); });
  Object.keys(V.forms).forEach(function (key) { add(key.slice(1), 'verbo'); });
  Object.keys(D.ambiguousVerbs).forEach(function (word) { add(word, 'verbo'); });
  D.nonFinite.forEach(function (word) { add(word, 'verbo'); add(word, 'substantivo'); });
  function readings(word) {
    var key = '$' + word.toLowerCase();
    return { classes: (lexicon[key] || []).slice(), verbs: (V.forms[key] || []).map(function (r) { return r.slice(); }) };
  }
  function morphology(text, cap) {
    var ts = S.tokens(E.protectedText(text)), out = [], i, r, ambiguous;
    for (i = 0; i < ts.length && out.length < cap; i += 1) {
      r = readings(ts[i].value); if (!r.classes.length) { continue; }
      ambiguous = r.classes.length > 1 || r.verbs.length > 1;
      out.push(S.finding('morfologia', ambiguous ? 'PTBR-MOR-002' : 'PTBR-MOR-001', text, ts[i].start, ts[i].end,
        'Leituras no léxico local: ' + r.classes.join(', ') + '.',
        'A forma escrita consta do recorte local. ' + (r.verbs.length ? 'Paradigmas possíveis: ' + r.verbs.map(function (v) { return v[0] + ', ' + v[1] + ', ' + v[2] + 'ª pessoa do ' + v[3]; }).join('; ') + '.' : 'Não foi deduzida uma classe pela terminação.'),
        'Estas são possibilidades lexicais para observar no contexto, não uma classificação definitiva da passagem.',
        'A mesma forma pode assumir outras classes e funções; formas não finitas também podem ser substantivadas. A lista não esgota a língua.',
        'Dez classes representadas em um léxico pequeno. Palavras desconhecidas ficam sem classificação. Não há correção de concordância ou acentuação por esta lente.',
        D.source, { confidence: ambiguous ? 'insuficiente' : 'moderada', candidates: r }));
    }
    return out;
  }
  function nounPhrase(ts, start, end, subject) {
    if (end <= start) { return false; }
    if (subject && end === start + 1 && has(D.subjectPronouns, ts[start].value)) { return true; }
    if (has(D.classes.artigo, ts[start].value)) { start += 1; }
    if (start >= end || !has(D.classes.substantivo, ts[start].value)) { return false; }
    start += 1;
    if (end - start > 2) { return false; }
    for (; start < end; start += 1) { if (!has(D.classes.adjetivo, ts[start].value)) { return false; } }
    return true;
  }
  function clause(ts) {
    var verbs = [], i, forms, lemmas, v, lemma, end = ts.length, parts, split;
    for (i = 0; i < ts.length; i += 1) {
      forms = V.forms['$' + ts[i].value] || [];
      if (forms.length) { verbs.push({ position: i, forms: forms }); }
    }
    if (verbs.length !== 1) { return []; }
    v = verbs[0].position; forms = verbs[0].forms; lemmas = [];
    forms.forEach(function (r) { if (!has(lemmas, r[0])) { lemmas.push(r[0]); } });
    if (lemmas.length !== 1 || !forms.some(function (r) { return r[1].indexOf('indicativo:') === 0; }) || !nounPhrase(ts, 0, v, true)) { return []; }
    lemma = lemmas[0]; parts = [{ id: '001', role: 'Sujeito', first: 0, last: v }, { id: '002', role: 'Predicado', first: v, last: end }];
    if (end > v + 1 && has(D.finalAdverbs, ts[end - 1].value)) {
      parts.push({ id: '005', role: 'Adjunto adverbial', first: end - 1, last: end }); end -= 1;
    }
    if (has(D.directVerbs, lemma) && nounPhrase(ts, v + 1, end, false)) {
      parts.push({ id: '003', role: 'Objeto direto', first: v + 1, last: end });
    } else if (has(D.linkingVerbs, lemma) && end === v + 2 && has(D.classes.adjetivo, ts[v + 1].value)) {
      parts.push({ id: '004', role: 'Predicativo do sujeito', first: v + 1, last: end });
    } else if (lemma === 'dar') {
      split = -1;
      for (i = v + 2; i < end; i += 1) { if (ts[i].value === 'a') { if (split !== -1) { return []; } split = i; } }
      if (split < 0 || !nounPhrase(ts, v + 1, split, false) || !nounPhrase(ts, split + 1, end, false)) { return []; }
      parts.push({ id: '003', role: 'Objeto direto', first: v + 1, last: split });
      parts.push({ id: '006', role: 'Objeto indireto', first: split, last: end });
    } else if (!(has(D.intransitiveVerbs, lemma) && end === v + 1)) { return []; }
    return parts;
  }
  function syntax(text, cap) {
    var clean = E.protectedText(text), regex = /[^.!?;\n\r]+/g, match, ts, out = [], parts, i, j, usable;
    while ((match = regex.exec(text)) && out.length < cap) {
      /* Uma região protegida invalida a oração inteira, sem juntar os lados da lacuna. */
      if (match[0].length > 1000 || clean.slice(match.index, match.index + match[0].length) !== match[0]) { continue; }
      ts = S.tokens(match[0]); if (!ts.length) { continue; }
      usable = /^\s*$/.test(match[0].slice(0, ts[0].start)) && /^\s*$/.test(match[0].slice(ts[ts.length - 1].end));
      for (j = 1; j < ts.length; j += 1) { if (!/^[ \t\u00a0]+$/.test(match[0].slice(ts[j - 1].end, ts[j].start))) { usable = false; } }
      if (!usable) { continue; }
      parts = clause(ts);
      for (i = 0; i < parts.length && out.length < cap; i += 1) {
        out.push(S.finding('sintaxe', 'PTBR-SIN-' + parts[i].id, text, match.index + ts[parts[i].first].start, match.index + ts[parts[i].last - 1].end,
          parts[i].role + ': uma leitura possível.',
          'A oração inteira cabe no recorte local de sujeito expresso, um verbo finito e complementação conhecida.',
          'Neste arranjo simples, o trecho pode funcionar como ' + parts[i].role.toLowerCase() + '.',
          'A função depende do sentido do verbo e do contexto. Ordem, elipse e criação literária podem sustentar outras leituras.',
          'Não analisa voz passiva, sujeito oculto, coordenação, subordinação, concordância nem palavras desconhecidas. Silêncio significa limite do recorte.',
          D.source, { feature: parts[i].role }));
      }
    }
    return out;
  }
  E.grammar = { readings: readings };
  (E.extensions = E.extensions || []).push(function (register) {
    register({ id: 'morfologia', analyze: morphology }); register({ id: 'sintaxe', analyze: syntax });
  });
}(typeof window !== 'undefined' ? window : this));
