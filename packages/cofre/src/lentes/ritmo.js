(function (root) {
  'use strict';
  var E = root.Escr, S = E.instruments, R = E.reading, D = E.maturationData, stop = {};
  D.stopwords.forEach(function (w) { stop['$' + w] = true; });
  function repetition(text, cap) { return E.analyzeLocalRepetition(text, cap); }
  function rhythm(text) {
    var clean = E.protectedText(text), slices = R.sentences(text), count = 0, sum = 0, sumSquares = 0, min = Infinity, max = 0, first = null, last = null;
    slices.forEach(function (s) {
      var raw = text.slice(s.start, s.end), n;
      if (!s.closed || clean.slice(s.start, s.end) !== raw) { return; }
      n = R.tokens(raw).length; if (!n) { return; }
      if (!first) { first = s; } last = s; count += 1; sum += n; sumSquares += n * n; min = Math.min(min, n); max = Math.max(max, n);
    });
    if (count < 3) { return []; }
    var mean = sum / count, deviation = Math.sqrt(Math.max(0, sumSquares / count - mean * mean));
    return [S.finding('ritmo', 'PTBR-RIT-001', text, first.start, first.end,
      'Ritmo de ' + count + ' frases: de ' + min + ' a ' + max + ' palavras.',
      'Média de ' + mean.toFixed(1) + ' palavras; desvio-padrão de ' + deviation.toFixed(1) + '. Foram contadas ' + sum + ' palavras nas frases disponíveis.',
      'A diferença de extensão mostra uma parte do desenho das pausas. Leia em voz alta para decidir como ela funciona na passagem.',
      'Frases curtas, longas ou do mesmo tamanho podem ser escolhas deliberadas. A contagem não mede clareza, emoção, voz nem qualidade.',
      'Segmentação por pontuação com abreviações conhecidas e números decimais protegidos. Trechos sem fechamento e citações ficam fora. Abreviações não registradas podem mudar a contagem.', D.styleSource,
      { confidence: 'moderada', metrics: { sentences: count, words: sum, shortest: min, longest: max, mean: mean, deviation: deviation }, contextEnd: last.end })];
  }
  (E.extensions = E.extensions || []).push(function (register) { register({ id: 'repeticao', analyze: repetition }); register({ id: 'ritmo', analyze: rhythm }); });
}(typeof window !== 'undefined' ? window : this));
