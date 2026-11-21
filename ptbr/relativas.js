/* Relativas restritivas: que-sujeito, que-objeto direto e onde locativo. ES5, sem acesso ao editor. */
(function (root) {
  'use strict';
  var E = root.Escr, version = 'relativas-2';
  var source = { title: 'Cunha/Cintra, 7ª ed., 2ª impressão, 2017, pp. 358, 614–618; Bechara, Lições, arquivo recebido, páginas PDF 236–239, 244–246 e 253. Recorte computacional local; não é algoritmo dos autores.', url: null };
  var limit = 'Somente artigo + substantivo registrado como sujeito da principal, seguido de relativa restritiva sem vírgulas com que-sujeito, que-objeto direto (com sujeito interno explícito) ou onde locativo (antecedente de lugar). Principal inteira também deve ser reconhecida. Não decide explicativas, preposições relativas, cujo, inversão ou encaixamentos. Ausência de leitura não indica erro.';
  var LOCATIVE_NOUNS = [
    'casa', 'casas', 'cidade', 'cidades', 'rua', 'ruas', 'sala', 'salas', 'quarto', 'quartos',
    'jardim', 'jardins', 'praça', 'praças', 'escola', 'escolas', 'biblioteca', 'bibliotecas',
    'oficina', 'oficinas', 'ilha', 'ilhas', 'praia', 'praias', 'floresta', 'florestas',
    'estrada', 'estradas', 'ponte', 'pontes', 'estação', 'estações', 'porto', 'portos',
    'lugar', 'lugares', 'espaço', 'espaços', 'campo', 'campos', 'mundo', 'mundos', 'terra', 'cozinha'
  ];
  function span(text, a, b, role) { return { start: a, end: b, snippet: text.slice(a, b), role: role }; }
  function one(findings, feature) { var found = findings.filter(function (f) { return f.feature === feature; }); return found.length === 1 ? found[0] : null; }
  function probeSubject(prefix, predicate) {
    /* Cópia de trabalho para testar relações; nunca devolvida como trecho do autor. */
    var text = prefix + ' ' + predicate, findings = E.syntaxRelations.analyze(text, 100);
    var subject = one(findings, 'Sujeito'), verb = one(findings, 'Núcleo verbal') || one(findings, 'Verbo de ligação') || one(findings, 'Locução verbal');
    return findings.coverageInfo.constructions === 1 && subject && subject.start === 0 && subject.end === prefix.length && verb ? { findings: findings, verb: verb, subject: subject } : null;
  }
  function probeObject(innerText, prefix) {
    var objLower = prefix.toLowerCase();
    var text = innerText + ' ' + objLower, findings = E.syntaxRelations.analyze(text, 100);
    if (findings.coverageInfo.constructions !== 1) { return null; }
    var subject = one(findings, 'Sujeito');
    var verb = one(findings, 'Núcleo verbal') || one(findings, 'Locução verbal');
    var obj = one(findings, 'Objeto direto');
    if (!subject || subject.start !== 0 || !verb || !obj) { return null; }
    if (obj.start !== innerText.length + 1 || obj.end !== text.length) { return null; }
    return { findings: findings, verb: verb, subject: subject };
  }
  function probeLocative(innerText) {
    var findings = E.syntaxRelations.analyze(innerText, 100);
    if (findings.coverageInfo.constructions !== 1) { return null; }
    var subject = one(findings, 'Sujeito');
    var verb = one(findings, 'Núcleo verbal') || one(findings, 'Verbo de ligação') || one(findings, 'Locução verbal');
    if (!subject || subject.start !== 0 || !verb) { return null; }
    if (findings.some(function (f) { return f.feature === 'Adjunto adverbial'; })) { return null; }
    return { findings: findings, verb: verb, subject: subject };
  }
  function match(text, ts) {
    var i, q = -1, relWord = '', matches = [], n = ts.length;
    if (n > 24 || n < 5) { return null; }
    for (i = 0; i < n; i++) {
      if (ts[i].value === 'que' || ts[i].value === 'onde') {
        if (q >= 0) { return null; }
        q = i; relWord = ts[i].value;
      }
    }
    if (q !== 2 || ['o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas'].indexOf(ts[0].value) < 0) { return null; }
    var prefix = text.slice(ts[0].start, ts[1].end);
    for (i = q + 2; i < n; i++) {
      var outer = probeSubject(prefix, text.slice(ts[i].start, ts[n - 1].end));
      if (!outer) { continue; }
      var innerText = text.slice(ts[q + 1].start, ts[i - 1].end);
      if (relWord === 'que') {
        /* 1. que-sujeito (sem objeto expresso na relativa para evitar ambiguidade de ordem) */
        var innerSubj = probeSubject(prefix, innerText);
        if (innerSubj && !innerSubj.findings.some(function (f) { return f.feature === 'Objeto direto' || f.feature === 'Objeto indireto'; })) {
          matches.push({ q: q, end: i, kind: 'sujeito', relWord: 'que', inner: innerSubj, outer: outer, prefixLength: prefix.length, innerShift: ts[q + 1].start - prefix.length - 1 });
        }
        /* 2. que-objeto direto (sujeito interno explícito + verbo transitivo direto retomando o antecedente) */
        if (i - (q + 1) >= 2) {
          var innerObj = probeObject(innerText, prefix);
          if (innerObj) {
            matches.push({ q: q, end: i, kind: 'objeto direto', relWord: 'que', inner: innerObj, outer: outer, prefixLength: prefix.length, innerShift: ts[q + 1].start });
          }
        }
      } else if (relWord === 'onde') {
        /* 3. onde locativo (antecedente de lugar explícito + oração interna completa) */
        if (LOCATIVE_NOUNS.indexOf(ts[1].value) >= 0 && i - (q + 1) >= 2) {
          var innerLoc = probeLocative(innerText);
          if (innerLoc) {
            matches.push({ q: q, end: i, kind: 'adjunto adverbial de lugar', relWord: 'onde', inner: innerLoc, outer: outer, prefixLength: prefix.length, innerShift: ts[q + 1].start });
          }
        }
      }
    }
    return matches.length === 1 ? matches[0] : null;
  }
  function analyze(text, cap) {
    if (typeof text !== 'string') { throw new Error('A análise precisa receber texto.'); }
    cap = typeof cap === 'number' && cap > 0 ? Math.min(100, Math.floor(cap)) : 100;
    var cut = text.slice(0, 8000), tokens = E.reading.tokens(cut), partial = cut.length < text.length;
    if (tokens.length > 1600) { cut = cut.slice(0, tokens[1600].start); partial = true; }
    var clean = E.protectedText(cut), out = [], unsupported = 0, truncated = 0, capped = false;
    E.reading.sentences(cut).forEach(function (segment) {
      var raw = cut.slice(segment.start, segment.end), stop = segment.end, tail = cut.slice(segment.end);
      var complete = /[\r\n]/.test(tail) || /[.!?…;]$/.test(raw) && (segment.end < cut.length || /^[\s.!?…;]/.test(text.charAt(cut.length)));
      if (partial && /^\s*$/.test(tail) && !complete) { truncated++; return; }
      if (raw.length > 1000 || clean.slice(segment.start, segment.end) !== raw) { unsupported++; return; }
      var terminal = raw.match(/[.!?…;]+\s*$/); if (terminal) { stop = segment.start + terminal.index; }
      var ts = E.reading.tokens(cut.slice(segment.start, stop)); if (!ts.length) { return; }
      ts.forEach(function (t) { t.start += segment.start; t.end += segment.start; });
      var usable = /^\s*$/.test(cut.slice(segment.start, ts[0].start)) && /^\s*$/.test(cut.slice(ts[ts.length - 1].end, stop));
      for (var j = 1; j < ts.length; j++) { if (!/^[ \t\u00a0]+$/.test(cut.slice(ts[j - 1].end, ts[j].start))) { usable = false; } }
      var r = usable && match(cut, ts); if (!r) { unsupported++; return; }
      if (out.length >= cap) { capped = true; return; }
      var rel = ts[r.q], ante = span(text, ts[0].start, ts[1].end, 'Antecedente'), head = span(text, ts[1].start, ts[1].end, 'Núcleo do antecedente');
      var outerShift = ts[r.end].start - r.prefixLength - 1;
      var iv = r.inner.verb, ov = r.outer.verb;
      var verb = span(text, iv.start + r.innerShift, iv.end + r.innerShift, 'Verbo da relativa');
      var mainVerb = span(text, ov.start + outerShift, ov.end + outerShift, 'Verbo da principal');
      var roleTag = r.kind === 'objeto direto' ? 'Relativo: objeto direto' : (r.kind === 'adjunto adverbial de lugar' ? 'Relativo: lugar' : 'Relativo: sujeito');
      var ruleId = r.kind === 'objeto direto' ? 'PTBR-ORA-002' : (r.kind === 'adjunto adverbial de lugar' ? 'PTBR-ORA-003' : 'PTBR-ORA-001');
      var pronoun = span(text, rel.start, rel.end, roleTag), end = ts[r.end - 1].end;
      var obs = r.kind === 'objeto direto'
        ? '“' + text.slice(rel.start, end) + '” delimita o antecedente “' + ante.snippet + '”. Nesta hipótese, “que” retoma “' + head.snippet + '” e atua como objeto direto de “' + verb.snippet + '”.'
        : r.kind === 'adjunto adverbial de lugar'
          ? '“' + text.slice(rel.start, end) + '” delimita o antecedente de lugar “' + ante.snippet + '”. Nesta hipótese, “onde” retoma “' + head.snippet + '” como adjunto adverbial de lugar junto a “' + verb.snippet + '”.'
          : '“' + text.slice(rel.start, end) + '” delimita o antecedente “' + ante.snippet + '”. Nesta hipótese, “que” retoma “' + head.snippet + '” e é sujeito de “' + verb.snippet + '”.';
      out.push(E.instruments.finding('relativas', ruleId, text, rel.start, end,
        'Oração adjetiva restritiva: uma leitura possível.', obs,
        'O antecedente integra o sujeito da principal, cujo verbo é “' + mainVerb.snippet + '”. A função do relativo foi verificada separadamente dentro da subordinada. Os dois predicados e uma única fronteira foram compatíveis com o recorte.',
        'A leitura restritiva considera o vínculo com o antecedente e a construção sem vírgulas; não corrige a pontuação nem presume a intenção do autor. Outros contextos ou sentidos podem exigir outra análise.',
        limit, source, {
          feature: 'Oração adjetiva restritiva', analysisStatus: 'contextual', relativeFunction: r.kind, relativeType: 'restritiva',
          nodeId: 'rel-' + rel.start, parentId: 'periodo-' + ts[0].start,
          head: span(text, rel.start, rel.end, roleTag), clause: span(text, ts[0].start, ts[ts.length - 1].end, 'Período examinado'),
          components: [pronoun, span(text, verb.start, verb.end, verb.role)], context: [ante, head, verb, mainVerb]
        }));
    });
    out.coverageInfo = {
      version: version, scope: { start: 0, end: cut.length, total: text.length, partial: partial },
      work: { characters: cut.length, tokens: Math.min(tokens.length, 1600), maxCharacters: 8000, maxTokens: 1600 },
      relatives: out.length, unsupported: unsupported, truncated: truncated, outputLimited: capped,
      summary: 'Relativas: ' + out.length + ' ocorrência(s) no recorte (que-sujeito, que-objeto direto e onde locativo); ' + unsupported + ' segmento(s) sem decisão; ' + truncated + ' segmento(s) cortado(s). Recorte 0–' + cut.length + ' de ' + text.length + ' unidades UTF-16.' + (partial ? ' Exame parcial: selecione outro trecho para continuar.' : '') + (capped ? ' Limite de apresentação atingido.' : '')
    };
    return out;
  }
  E.relativeClauses = { version: version, analyze: analyze };
  (E.extensions = E.extensions || []).push(function (register) { register({ id: 'relativas', analyze: analyze }); });
  E.lensCatalog.push({ id: 'relativas', group: 'Gramática', minimum: 5, scope: limit });
}(typeof window !== 'undefined' ? window : this));
