(function (root) {
  'use strict';
  var E = root.Escr, S = E.instruments;
  (E.extensions = E.extensions || []).push(function (register) {
    register({ id: 'decolonial', analyze: function (text, cap) {
      var data = E.decolonialData;
      return S.matches(text, data.index, data.entries, cap, S.contextSilence).map(function (match) {
        return S.finding('decolonial', match.entry.id, text, match.start, match.end,
          'Uma expressão para situar no contexto: “' + text.slice(match.start, match.end) + '”.',
          'Correspondência literal com o recorte do catálogo recebido, na categoria ' + match.entry.category + '.',
          match.entry.question,
          'Pode ser fala de personagem, citação não marcada, ironia, autodesignação ou crítica ao próprio estereótipo. A ocorrência não demonstra preconceito.',
          'Somente 18 expressões foram ativadas. Origens históricas e alternativas do catálogo não foram adotadas sem revisão. Nenhuma troca é prescrita.',
          { title: 'Catálogo autoral do cofre recebido em 23/08/2026; recorte editorial e perguntas locais de contexto.', url: null },
          { severity: 'informação', confidence: 'moderada', feature: match.entry.category });
      });
    } });
  });
}(typeof window !== 'undefined' ? window : this));
