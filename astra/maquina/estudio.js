(function (root) {
  'use strict';
  var E = root.Escr, D = E.studioData, R = E.reading, S = E.instruments, words = {};
  D.adverbs.forEach(function (word) { words['$' + word] = true; });
  function adverbs(text, cap) {
    var ts = R.tokens(E.protectedText(text)), out = [], i, t;
    for (i = 0; i < ts.length && out.length < cap; i += 1) {
      t = ts[i]; if (!words['$' + t.value]) { continue; }
      out.push(S.finding('adverbios', 'PTBR-ADV-001', text, t.start, t.end,
        'Uma forma em -mente para observar: “' + text.slice(t.start, t.end) + '”.',
        'A grafia está no catálogo local de ' + D.adverbs.length + ' formas em -mente.',
        'Observe o que a palavra acrescenta ao gesto, ao tempo ou à voz nesta passagem.',
        'Advérbios podem ser indispensáveis. A presença não indica erro, excesso ou necessidade de corte.',
        'Não classifica pela terminação sozinha; flexões, nomes próprios e usos inventados podem ficar fora. Código e citações protegidos.', D.source));
    }
    return out;
  }
  function dialogue(text) {
    var clean = E.protectedText(text), line = /[^\r\n]+/g, m, ts, total = 0, marked = 0, lines = 0, markedLines = 0, first = null, excluded = 0;
    while ((m = line.exec(text))) {
      /* Excluir a linha inteira se contiver região protegida: não somar fragmentos como fala. */
      if (clean.slice(m.index, m.index + m[0].length) !== m[0]) { excluded += 1; continue; }
      ts = R.tokens(m[0]); if (!ts.length) { continue; }
      if (!first) { first = { start: m.index + ts[0].start, end: m.index + ts[0].end }; }
      total += ts.length; lines += 1;
      if (/^[ \t\u00a0]*—/.test(m[0])) { marked += ts.length; markedLines += 1; }
    }
    if (!total) { return []; }
    return [S.finding('dialogo', 'PTBR-DIA-001', text, first.start, first.end,
      (100 * marked / total).toFixed(1) + '% das palavras disponíveis estão em linhas iniciadas por travessão.',
      marked + ' de ' + total + ' palavras; ' + markedLines + ' de ' + lines + ' linhas. ' + excluded + ' linhas protegidas excluídas.',
      'Use a proporção para comparar o desenho gráfico das falas entre passagens.',
      'A linha pode conter fala e intervenção do narrador. Travessões também têm outros usos; não há proporção ideal.',
      'Reconhece apenas — no início da linha. Falas com aspas, continuação sem travessão e outras convenções não são classificadas. O restante não é automaticamente narração.', D.source,
      { metrics: { totalWords: total, markedLineWords: marked, unmarkedLineWords: total - marked, markedPercent: 100 * marked / total, lines: lines, markedLines: markedLines, excludedLines: excluded }, method: 'linhas-travessao-v1' })];
  }
  (E.extensions = E.extensions || []).push(function (register) {
    register({ id: 'adverbios', analyze: adverbs }); register({ id: 'dialogo', analyze: dialogue });
  });
}(typeof window !== 'undefined' ? window : this));
