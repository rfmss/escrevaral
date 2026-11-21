(function (root) {
  'use strict';
  var E = root.Escr, S = E.instruments, R = E.reading, D = E.maturationData;
  function has(a, v) { return a && a.indexOf(v) !== -1; }
  function get(map, key) { return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null; }
  function contiguous(text, ts, a, b) {
    for (var i = a + 1; i < b; i += 1) { if (!/^[ \t\u00a0]+$/.test(text.slice(ts[i - 1].end, ts[i].start))) { return false; } }
    return true;
  }
  function crase(text, cap) {
    var clean = E.protectedText(text), ts = R.tokens(clean), out = [], i, t, next, infinitive, masculine, start, ruleId, reason;
    for (i = 0; i + 1 < ts.length && out.length < cap; i += 1) {
      t = ts[i]; next = ts[i + 1];
      if (!has(['à', 'às'], t.value) || !contiguous(text, ts, i, i + 2)) { continue; }
      infinitive = t.value === 'à' && has(D.craseInfinitives, next.value);
      masculine = t.value === 'à' && has(D.craseMasculines, next.value);
      if (!infinitive && !masculine && !has(D.crasePronouns, next.value)) { continue; }
      if (S.contextSilence(text, t.start, next.end)) { continue; }
      /* Nomes, títulos e rótulos no lugar de pronomes/verbos/substantivos exigem outra leitura. */
      if (text.slice(next.start, next.end) !== text.slice(next.start, next.end).toLowerCase()) { continue; }
      start = t.start;
      if (infinitive) { ruleId = 'PTBR-CRA-001'; reason = 'um infinitivo registrado'; }
      else if (masculine) { ruleId = 'PTBR-CRA-003'; reason = 'um substantivo masculino registrado'; }
      else { ruleId = 'PTBR-CRA-002'; reason = 'um pronome pessoal registrado'; }
      out.push(S.finding('crase', ruleId, text, start, next.end,
        'Um acento grave para conferir.', 'Há acento grave antes de ' + reason + '.',
        'Na leitura convencional desse trecho, a referência é “a ' + text.slice(next.start, next.end) + '”.',
        'Pode ser nome, fala, citação sem marcação ou uso substantivado (ou elipse como “à moda de”). A observação não determina sua intenção.',
        'Só examina este encontro local. Não identifica crase obrigatória, facultativa, elipse de à moda de nem regência geral.', D.craseSource,
        { severity: 'aviso', confidence: 'moderada', reference: 'a ' + text.slice(next.start, next.end) }));
    }
    return out;
  }
  function nominalTail(ts, start) {
    var i = start, values = ts.map(function (t) { return t.value; });
    if (has(D.quantifiers, values[i]) || /^[0-9]+$/.test(values[i] || '')) { i += 1; }
    if (!has(D.pluralNouns, values[i])) { return false; }
    i += 1;
    if (has(D.pluralAdjectives, values[i])) { i += 1; }
    return i === values.length || has(D.adjuncts, values.slice(i).join(' '));
  }
  function agreement(text, cap) {
    var clean = E.protectedText(text), slices = R.sentences(text), out = [], i, s, raw, ts, v, replacement, id, kind, startIdx, endIdx, at, headIdx;
    for (i = 0; i < slices.length && out.length < cap; i += 1) {
      s = slices[i]; raw = text.slice(s.start, s.end);
      if (raw.length > 1000 || raw !== clean.slice(s.start, s.end) || /^\s*[—–-]/.test(raw)) { continue; }
      ts = R.tokens(raw); if (ts.length < 3 || !/^\s*$/.test(raw.slice(0, ts[0].start)) || !contiguous(raw, ts, 0, ts.length) || !/^[.!?…;\s]*$/.test(raw.slice(ts[ts.length - 1].end))) { continue; }
      headIdx = (ts.length >= 4 && has(D.agreementPrefixes, ts[0].value)) ? 1 : 0;
      v = ts[headIdx].value; replacement = ''; id = ''; kind = ''; startIdx = headIdx; endIdx = headIdx + 1;
      if (get(D.haver, v) && nominalTail(ts, headIdx + 1)) { replacement = get(D.haver, v); id = '001'; kind = 'haver no sentido de existir'; }
      else if (get(D.existir, v) && nominalTail(ts, headIdx + 1)) { replacement = get(D.existir, v); id = '002'; kind = 'existir com sujeito plural'; }
      else if (ts.length > headIdx + 2 && get(D.haverAux, v) && ts[headIdx + 1].value === 'haver' && nominalTail(ts, headIdx + 2)) { replacement = get(D.haverAux, v) + ' haver'; id = '003'; kind = 'auxiliar de haver existencial'; endIdx = headIdx + 2; }
      else if (ts.length > headIdx + 2 && get(D.existirAux, v) && ts[headIdx + 1].value === 'existir' && nominalTail(ts, headIdx + 2)) { replacement = get(D.existirAux, v) + ' existir'; id = '004'; kind = 'auxiliar de existir com sujeito plural'; endIdx = headIdx + 2; }
      else {
        at = has(D.agreementPrefixes, ts[0].value) ? 1 : 0;
        v = ts[at].value;
        if (get(D.fazer, v) && ts.length > at + 4 && (has(D.amounts, ts[at + 1].value) || /^[0-9]+$/.test(ts[at + 1].value)) && has(D.timeUnits, ts[at + 2].value) && ts[at + 3].value === 'que') {
          replacement = get(D.fazer, v); id = '005'; kind = 'fazer indicando tempo decorrido'; startIdx = at; endIdx = at + 1;
        }
      }
      if (!id) { continue; }
      out.push(S.finding('concordancia', 'PTBR-CON-' + id, text, s.start + ts[startIdx].start, s.start + ts[endIdx - 1].end,
        'Concordância para conferir: “' + replacement + '”.',
        'O trecho cabe no padrão local de ' + kind + '.',
        'Se esse é o sentido pretendido, a forma de referência é “' + replacement + '”.',
        'Fala brasileira, elipse, personificação e usos pessoais de haver podem sustentar outra leitura. Não é uma ordem de correção.',
        'Recorte de início de frase (com advérbio/conjunção inicial opcional), vocabulário nominal explícito e complementos delimitados. Não faz concordância geral nem condena ter existencial.', D.verbSource,
        { severity: 'aviso', confidence: 'moderada', reference: replacement }));
    }
    return out;
  }
  (E.extensions = E.extensions || []).push(function (register) { register({ id: 'crase', analyze: crase }); register({ id: 'concordancia', analyze: agreement }); });
}(typeof window !== 'undefined' ? window : this));
