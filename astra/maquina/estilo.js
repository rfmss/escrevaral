(function (root) {
  'use strict';
  var E = root.Escr, S = E.instruments;
  (E.extensions = E.extensions || []).push(function (register) {
    register({ id: 'expressoes', analyze: function (text, cap) {
      var data = E.styleData;
      return S.matches(text, data.index, data.entries, cap).map(function (match) {
        var recurring = match.entry.id === 'PTBR-EST-001';
        return S.finding('expressoes', match.entry.id, text, match.start, match.end,
          recurring ? 'Uma expressão do repertório compartilhado.' : 'Uma aproximação de sentidos para observar.',
          'O trecho corresponde literalmente a uma entrada do catálogo herdado: ' + match.entry.kind + '.',
          recurring ? 'A expressão pode dar familiaridade, marcar um registro ou servir como contraste no texto.' : 'As palavras podem aproximar sentidos; isso pode funcionar como ênfase, contraste, precisão contextual ou ritmo.',
          'Frequência no catálogo não mede frequência no português brasileiro. Sobreposição não implica redundância dispensável. A função depende da passagem.',
          'Não há nota, instrução para cortar, substituição nem avaliação da originalidade. A lente identifica locuções contíguas e preserva diacríticos.',
          { title: 'Listas CLIQUES_PT e PLEONASMOS do analise-engine.js recebido; classificação herdada tratada somente como observação.', url: null },
          { severity: 'estilo', confidence: 'alta', feature: match.entry.kind });
      });
    } });
  });
}(typeof window !== 'undefined' ? window : this));
