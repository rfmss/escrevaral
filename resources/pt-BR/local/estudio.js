(function (root) {
  'use strict';
  var E = root.Escr;
  E.studioData = {
    version: '1.0.0',
    source: { title: 'Protocolo descritivo SCRVRL 1.0: catálogo explícito de formas e contagem por linhas; revisão linguística independente pendente.', url: null },
    adverbs: ['abertamente', 'absolutamente', 'antigamente', 'aparentemente', 'atentamente', 'automaticamente', 'brevemente', 'calmamente', 'certamente', 'claramente', 'completamente', 'cuidadosamente', 'delicadamente', 'dificilmente', 'diretamente', 'docemente', 'especialmente', 'exatamente', 'facilmente', 'felizmente', 'finalmente', 'fortemente', 'francamente', 'frequentemente', 'gentilmente', 'imediatamente', 'infelizmente', 'inteiramente', 'lentamente', 'levemente', 'literalmente', 'naturalmente', 'normalmente', 'novamente', 'pacientemente', 'perfeitamente', 'possivelmente', 'praticamente', 'provavelmente', 'rapidamente', 'raramente', 'realmente', 'recentemente', 'silenciosamente', 'simplesmente', 'somente', 'suavemente', 'totalmente', 'tristemente', 'unicamente'],
    families: [
      { id: 'fonetica', lenses: ['rima', 'metrica'] },
      { id: 'estilo', lenses: ['expressoes', 'repeticao', 'adverbios'] },
      { id: 'ritmo', lenses: ['ritmo', 'dialogo'] },
      { id: 'lexico', lenses: [] },
      { id: 'convencoes', lenses: ['ortografia', 'acentuacao', 'pontuacao'] },
      { id: 'morfossintaxe', lenses: ['morfologia', 'sintaxe', 'crase', 'concordancia'] },
      { id: 'contextos', lenses: ['decolonial'] }
    ]
  };
  E.lensCatalog.push(
    { id: 'adverbios', group: 'Escolhas de escrita', minimum: 1, scope: 'Formas em -mente de uma lista explícita. Presença não implica excesso; desconhecidas não são classificadas.' },
    { id: 'dialogo', group: 'Escolhas de escrita', minimum: 1, scope: 'Proporção de palavras em linhas iniciadas por travessão. É uma aproximação gráfica, não separação semântica entre fala e narração.' }
  );
}(typeof window !== 'undefined' ? window : this));
