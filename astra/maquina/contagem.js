(function (root) {
  'use strict';
  /* Contagem descritiva, sem diagnóstico. Um composto hifenizado conta como
     palavra; números contam. Caracteres são pontos de código, com espaços. */
  root.Escr.countManuscript = function (value) {
    var words = 0, characters = 0, i, code;
    var pattern = /[A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f]+(?:[-'’][A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f]+)*|[0-9]+/g;
    while (pattern.exec(value)) { words += 1; }
    for (i = 0; i < value.length; i += 1) {
      code = value.charCodeAt(i); characters += 1;
      if (code >= 55296 && code <= 56319 && i + 1 < value.length && value.charCodeAt(i + 1) >= 56320 && value.charCodeAt(i + 1) <= 57343) { i += 1; }
    }
    return { words: words, characters: characters, paragraphs: value.split(/\r\n|\r|\n/).filter(function (line) { return /\S/.test(line); }).length };
  };
}(typeof window !== 'undefined' ? window : this));
