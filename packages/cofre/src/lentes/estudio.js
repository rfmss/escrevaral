(function (root) {
  'use strict';
  var E = root.Escr, D = E.studioData, R = E.reading, S = E.instruments, words = {};
  D.adverbs.forEach(function (word) { words['$' + word] = true; });

  function paragraphBounds(text) {
    var bounds = [], start = 0, re = /\r?\n[ \t]*\r?\n/g, m;
    while ((m = re.exec(text))) {
      bounds.push({ start: start, end: m.index });
      start = m.index + m[0].length;
    }
    bounds.push({ start: start, end: text.length });
    return bounds;
  }
  function paragraphOf(bounds, pos) {
    for (var i = 0; i < bounds.length; i += 1) {
      if (pos >= bounds[i].start && pos <= bounds[i].end) { return i; }
    }
    return 0;
  }

  function adverbs(text, cap) {
    var ts = R.tokens(E.protectedText(text)), hits = [], counts = {}, bounds = paragraphBounds(text), out = [], i, t, pIdx;
    for (i = 0; i < ts.length && hits.length < cap; i += 1) {
      t = ts[i]; if (!words['$' + t.value]) { continue; }
      pIdx = paragraphOf(bounds, t.start);
      counts[pIdx] = (counts[pIdx] || 0) + 1;
      hits.push({ token: t, paragraph: pIdx });
    }
    for (i = 0; i < hits.length; i += 1) {
      t = hits[i].token;
      var pCount = counts[hits[i].paragraph] || 1;
      var obs = 'A grafia está no catálogo local de ' + D.adverbs.length + ' formas em -mente.' +
        (pCount >= 2 ? ' Há ' + pCount + ' formas em -mente neste mesmo parágrafo — vale ouvir a cadência em voz alta.' : '');
      out.push(S.finding('adverbios', 'PTBR-ADV-001', text, t.start, t.end,
        'Uma forma em -mente para observar: “' + text.slice(t.start, t.end) + '”.',
        obs,
        'Observe o que a palavra acrescenta ao gesto, ao tempo ou à voz nesta passagem.',
        'Advérbios podem ser indispensáveis. A presença não indica erro, excesso ou necessidade de corte.',
        'Não classifica pela terminação sozinha (palavras como semente ou demente ficam de fora); flexões, nomes próprios e usos inventados podem ficar fora. Código e citações protegidos.', D.source,
        { metrics: { paragraphCount: pCount } }));
    }
    return out;
  }

  function dialogue(text) {
    var clean = E.protectedText(text), line = /[^\r\n]+/g, m, ts, total = 0, marked = 0, lines = 0, markedLines = 0, first = null, excluded = 0;
    var byMarker = { emDash: 0, enDash: 0, hyphen: 0 };
    while ((m = line.exec(text))) {
      /* Excluir a linha inteira se contiver região protegida: não somar fragmentos como fala. */
      if (clean.slice(m.index, m.index + m[0].length) !== m[0]) { excluded += 1; continue; }
      ts = R.tokens(m[0]); if (!ts.length) { continue; }
      if (!first) { first = { start: m.index + ts[0].start, end: m.index + ts[0].end }; }
      total += ts.length; lines += 1;
      if (/^[ \t\u00a0]*—/.test(m[0])) { marked += ts.length; markedLines += 1; byMarker.emDash += 1; }
      else if (/^[ \t\u00a0]*–/.test(m[0])) { marked += ts.length; markedLines += 1; byMarker.enDash += 1; }
      else if (/^[ \t\u00a0]*-[ \t\u00a0]+/.test(m[0])) { marked += ts.length; markedLines += 1; byMarker.hyphen += 1; }
    }
    if (!total) { return []; }
    var markerNotes = [];
    if (byMarker.emDash) { markerNotes.push(byMarker.emDash + ' com travessão (—)'); }
    if (byMarker.enDash) { markerNotes.push(byMarker.enDash + ' com meia-risca (–)'); }
    if (byMarker.hyphen) { markerNotes.push(byMarker.hyphen + ' com hífen (- )'); }
    var markerSummary = markerNotes.length ? ' Marcas encontradas: ' + markerNotes.join(', ') + '.' : '';
    return [S.finding('dialogo', 'PTBR-DIA-001', text, first.start, first.end,
      (100 * marked / total).toFixed(1) + '% das palavras disponíveis estão em linhas com marca de diálogo.',
      marked + ' de ' + total + ' palavras; ' + markedLines + ' de ' + lines + ' linhas.' + markerSummary + ' ' + excluded + ' linhas protegidas excluídas.',
      'Use a proporção para comparar o desenho gráfico das falas entre passagens.',
      'A linha pode conter fala e intervenção do narrador. Travessões e hífens iniciais também têm outros usos (como listas); não há proporção ideal.',
      'Reconhece —, – e hífen seguido de espaço (- ) no início da linha. Palavras hifenizadas, falas com aspas e continuações sem marca não são classificadas. O restante não é automaticamente narração.', D.source,
      { metrics: { totalWords: total, markedLineWords: marked, unmarkedLineWords: total - marked, markedPercent: 100 * marked / total, lines: lines, markedLines: markedLines, excludedLines: excluded, markers: byMarker }, method: 'linhas-travessao-v2' })];
  }

  (E.extensions = E.extensions || []).push(function (register) {
    register({ id: 'adverbios', analyze: adverbs }); register({ id: 'dialogo', analyze: dialogue });
  });
}(typeof window !== 'undefined' ? window : this));
