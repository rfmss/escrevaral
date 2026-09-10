(function (root) {
  'use strict';
  var E = root.Escr, S = E.instruments, D = E.maturationData;
  /* Mantém posições no original; a composição é feita apenas sobre o token. */
  function canonical(value) {
    var pairs = { 'a\u0300': 'à', 'a\u0301': 'á', 'a\u0302': 'â', 'a\u0303': 'ã', 'e\u0301': 'é', 'e\u0302': 'ê', 'i\u0301': 'í', 'o\u0301': 'ó', 'o\u0302': 'ô', 'o\u0303': 'õ', 'u\u0301': 'ú', 'u\u0308': 'ü', 'c\u0327': 'ç' };
    return value.toLowerCase().replace(/[aeiouc][\u0300-\u0303\u0308\u0327]/g, function (s) { return pairs[s] || s; });
  }
  function tokens(text) {
    var ts = S.tokens(text);
    ts.forEach(function (t) { t.value = canonical(t.value); });
    return ts;
  }
  function sentences(text) {
    var out = [], start = 0, i = 0, ch, left, last, end;
    function add(stop, closed) {
      var a = start, b = stop;
      while (a < b && /\s/.test(text.charAt(a))) { a += 1; }
      while (b > a && /\s/.test(text.charAt(b - 1))) { b -= 1; }
      if (b > a) { out.push({ start: a, end: b, closed: closed }); }
    }
    while (i < text.length) {
      ch = text.charAt(i);
      if (ch === '\n' || ch === '\r') { add(i, false); start = i + 1; i += 1; continue; }
      if (/[.!?…;]/.test(ch)) {
        left = text.slice(Math.max(start, i - 25), i); last = left.match(/([A-Za-zÀ-ÖØ-öø-ÿ]+)$/);
        if (ch === '.' && ((last && (D.abbreviations.indexOf(canonical(last[1])) !== -1 || last[1].length === 1)) || /[0-9]/.test(text.charAt(i - 1)) && /[0-9]/.test(text.charAt(i + 1)))) { i += 1; continue; }
        end = i + 1; while (end < text.length && /[.!?…;]/.test(text.charAt(end))) { end += 1; }
        if (end === text.length || /\s/.test(text.charAt(end))) { add(end, ch !== ';'); start = end; }
        i = end; continue;
      }
      i += 1;
    }
    add(text.length, false); return out;
  }
  function assess(policy, text) {
    var clean = E.protectedText(text), count = 0, tokenPattern = /[A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f]+(?:[-'’][A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f]+)*|[0-9]+/g, reason = '', lines, slices;
    /* A triagem para ao atingir o mínimo; não duplica a tokenização do livro. */
    while (count < policy.minimum && tokenPattern.exec(clean)) { count += 1; }
    if (!clean.replace(/\s/g, '')) { reason = 'Não há trecho disponível fora de citações, código e endereços.'; }
    else if (count < policy.minimum) { reason = 'Esta lente precisa de pelo menos ' + policy.minimum + ' palavras disponíveis.'; }
    else if (policy.lines) {
      lines = clean.split(/\r\n|\n|\r/).filter(function (line) { return tokens(line).length > 0; });
      if (lines.length < policy.lines) { reason = 'Separe pelo menos duas linhas para comparar terminações. Uma linha não permite procurar pares de rima.'; }
    } else if (policy.sentences) {
      slices = sentences(text).filter(function (s) { return s.closed && clean.slice(s.start, s.end) === text.slice(s.start, s.end) && tokens(text.slice(s.start, s.end)).length > 0; });
      if (slices.length < policy.sentences) { reason = 'O ritmo precisa de pelo menos três frases delimitadas fora das regiões protegidas. O trecho ainda é insuficiente para comparação.'; }
    }
    return { eligible: !reason, reason: reason, scope: policy.scope, group: policy.group, minimumTokensChecked: count };
  }
  E.reading = { tokens: tokens, canonical: canonical, sentences: sentences };
  E.lensPolicies = {};
  E.lensCatalog.forEach(function (policy) { E.lensPolicies[policy.id] = function (text) { return assess(policy, text); }; });
}(typeof window !== 'undefined' ? window : this));
