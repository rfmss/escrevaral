(function (root) {
  'use strict';
  var E = root.Escr;
  E.studioData = {
    version: '2.0.0',
    source: { title: 'Protocolo descritivo SCRVRL 2.0: catálogo explícito de formas em -mente e contagem por linhas de diálogo; revisão linguística independente pendente.', url: null },
    adverbs: [
      'abertamente', 'absolutamente', 'abruptamente', 'acaso', 'acidentalmente', 'actualmente', 'atualmente',
      'admiravelmente', 'afetuosamente', 'alegremente', 'alternadamente', 'amargamente', 'amavelmente', 'amplamente',
      'angustiosamente', 'ansiosamente', 'antigamente', 'aparentemente', 'apenas', 'apressadamente', 'ardentemente',
      'atentamente', 'automaticamente', 'baixinho', 'basicamente', 'brevemente', 'bruscamente', 'caladamente',
      'calmamente', 'carinhosamente', 'certamente', 'claramente', 'completamente', 'constantemente', 'continuamente',
      'corajosamente', 'corretamente', 'cuidadosamente', 'curiosamente', 'decididamente', 'definitivamente',
      'delicadamente', 'demasiadamente', 'densamente', 'devidamente', 'diariamente', 'dificilmente', 'diretamente',
      'discretamente', 'distraidamente', 'docemente', 'dolorosamente', 'efetivamente', 'emocionalmente',
      'enormemente', 'especialmente', 'espontaneamente', 'essencialmente', 'eternamente', 'eventualmente',
      'evidentemente', 'exatamente', 'excessivamente', 'exclusivamente', 'expressamente', 'extremamente',
      'facilmente', 'felizmente', 'fielmente', 'finalmente', 'firmemente', 'fisicamente', 'fortemente', 'francamente',
      'frequentemente', 'friamente', 'furiosamente', 'generalizadamente', 'generosamente', 'gentilmente',
      'gradualmente', 'gravemente', 'habitualmente', 'honestamente', 'imediatamente', 'impacientemente',
      'incessantemente', 'inesperadamente', 'infelizmente', 'infinitamente', 'inicialmente', 'instantaneamente',
      'inteiramente', 'intensamente', 'intencionalmente', 'internamente', 'intimamente', 'invariavelmente',
      'involuntariamente', 'justamente', 'lentamente', 'levemente', 'livremente', 'literalmente', 'longamente',
      'melancolicamente', 'mentalmente', 'meramente', 'misteriosamente', 'modestamente', 'momentaneamente',
      'mutuamente', 'naturalmente', 'necessariamente', 'nervosamente', 'nitidamente', 'normalmente', 'notavelmente',
      'novamente', 'obviamente', 'ocasionalmente', 'oficialmente', 'originalmente', 'pacientemente', 'parcialmente',
      'particularmente', 'pausadamente', 'perfeitamente', 'permanentemente', 'pessoalmente', 'plenamente',
      'poeticamente', 'possivelmente', 'praticamente', 'precisamente', 'preferencialmente', 'prematuramente',
      'primeiramente', 'principalmente', 'profundamente', 'prontamente', 'provavelmente', 'puramente', 'rapidamente',
      'raramente', 'realmente', 'recentemente', 'repentinamente', 'respectivamente', 'rigorosamente', 'secretamente',
      'seguramente', 'semanalmente', 'sensivelmente', 'separadamente', 'serenamente', 'seriamente', 'severamente',
      'silenciosamente', 'simplesmente', 'simultaneamente', 'sinceramente', 'sobriamente', 'solenemente',
      'solitariamente', 'somente', 'suavemente', 'subitamente', 'sucessivamente', 'suficientemente', 'supostamente',
      'surpreendentemente', 'sutilmente', 'tacitamente', 'tardiamente', 'temporariamente', 'ternamente', 'timidamente',
      'tipicamente', 'totalmente', 'tranquilamente', 'tristemente', 'ultimamente', 'unicamente', 'urgentemente',
      'vagamente', 'verdadeiramente', 'visivelmente', 'vivamente', 'voluntariamente'
    ].filter(function (w) { return /mente$/.test(w); }),
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
    { id: 'adverbios', group: 'Escolhas de escrita', minimum: 1, scope: 'Formas em -mente de uma lista explícita (~180 advérbios reais) e concentração por parágrafo. Presença não implica excesso; desconhecidas não são classificadas.' },
    { id: 'dialogo', group: 'Escolhas de escrita', minimum: 1, scope: 'Proporção de palavras em linhas iniciadas por travessão (—), meia-risca (–) ou hífen seguido de espaço (- ). É uma aproximação gráfica, não separação semântica entre fala e narração.' }
  );
}(typeof window !== 'undefined' ? window : this));
