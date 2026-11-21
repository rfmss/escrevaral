(function (root) {
  'use strict';
  var E = root.Escr, S = E.instruments, R = E.reading, D = E.maturationData, stop = {};
  D.stopwords.forEach(function (w) { stop['$' + w] = true; });
  function repetition(text, cap) { return E.analyzeLocalRepetition(text, cap); }
  function rhythm(text, cap) {
    var limitCap = typeof cap === 'number' && cap > 0 ? cap : 100;
    var clean = E.protectedText(text), slices = R.sentences(text), items = [], count = 0, sum = 0, sumSquares = 0, min = Infinity, max = 0, first = null, last = null;
    slices.forEach(function (s) {
      var raw = text.slice(s.start, s.end), n;
      if (!s.closed || clean.slice(s.start, s.end) !== raw) { return; }
      n = R.tokens(raw).length; if (!n) { return; }
      if (!first) { first = s; } last = s; count += 1; sum += n; sumSquares += n * n; min = Math.min(min, n); max = Math.max(max, n);
      items.push({ start: s.start, end: s.end, words: n });
    });
    if (count < 3) { return []; }
    var mean = sum / count, deviation = Math.sqrt(Math.max(0, sumSquares / count - mean * mean));
    var out = [S.finding('ritmo', 'PTBR-RIT-001', text, first.start, first.end,
      'Ritmo de ' + count + ' frases: de ' + min + ' a ' + max + ' palavras.',
      'Média de ' + mean.toFixed(1) + ' palavras; desvio-padrão de ' + deviation.toFixed(1) + '. Foram contadas ' + sum + ' palavras nas frases disponíveis.',
      'A diferença de extensão mostra uma parte do desenho das pausas. Leia em voz alta para decidir como ela funciona na passagem.',
      'Frases curtas, longas ou do mesmo tamanho podem ser escolhas deliberadas. A contagem não mede clareza, emoção, voz nem qualidade.',
      'Segmentação por pontuação com abreviações conhecidas e números decimais protegidos. Trechos sem fechamento e citações ficam fora. Abreviações não registradas podem mudar a contagem.', D.styleSource,
      { confidence: 'moderada', metrics: { sentences: count, words: sum, shortest: min, longest: max, mean: mean, deviation: deviation }, contextEnd: last.end })];

    /* Destaques descritivos de fôlego: frases longas (>= 35 palavras) */
    var i;
    for (i = 0; i < items.length && out.length < limitCap; i += 1) {
      if (items[i].words >= 35) {
        out.push(S.finding('ritmo', 'PTBR-RIT-002', text, items[i].start, items[i].end,
          'Frase extensa com ' + items[i].words + ' palavras.',
          'Esta frase reúne ' + items[i].words + ' palavras (a média do trecho é ' + mean.toFixed(1) + ').',
          'Leia em voz alta para observar a respiração, as pausas internas e o peso dessa curva sintática.',
          'Frases longas são recurso literário legítimo e expressivo; o destaque apenas localiza a extensão sem exigir corte.',
          'Limiar operacional de 35 palavras em frase fechada e fora de região protegida.', D.styleSource,
          { confidence: 'alta', metrics: { words: items[i].words, mean: mean } }));
      }
    }

    /* Sequências de 3+ frases contíguas com extensão muito parecida (variação <= 2 palavras, >= 4 palavras cada) */
    i = 0;
    while (i + 2 < items.length && out.length < limitCap) {
      if (items[i].words >= 4) {
        var runMin = items[i].words, runMax = items[i].words, j = i + 1;
        while (j < items.length && items[j].words >= 4 &&
            Math.max(runMax, items[j].words) - Math.min(runMin, items[j].words) <= 2) {
          runMin = Math.min(runMin, items[j].words);
          runMax = Math.max(runMax, items[j].words);
          j += 1;
        }
        if (j - i >= 3) {
          var lens = [], k;
          for (k = i; k < j; k += 1) { lens.push(items[k].words); }
          out.push(S.finding('ritmo', 'PTBR-RIT-003', text, items[i].start, items[j - 1].end,
            (j - i) + ' frases seguidas com extensão muito parecida (' + runMin + '–' + runMax + ' palavras).',
            'Sequência de medidas: ' + lens.join(', ') + ' palavras.',
            'Alternar frases curtas e longas pode variar o pulso da leitura; manter a simetria também pode ser escolha rítmica.',
            'Paralelismo e cadência regular são recursos estilísticos frequentes; o destaque é puramente descritivo.',
            'Identifica sequências contíguas de 3 ou mais frases fechadas com diferença máxima de 2 palavras entre si.', D.styleSource,
            { confidence: 'alta', metrics: { runLength: j - i, minWords: runMin, maxWords: runMax, lengths: lens } }));
          i = j;
          continue;
        }
      }
      i += 1;
    }

    return out;
  }
  (E.extensions = E.extensions || []).push(function (register) { register({ id: 'repeticao', analyze: repetition }); register({ id: 'ritmo', analyze: rhythm }); });
}(typeof window !== 'undefined' ? window : this));
