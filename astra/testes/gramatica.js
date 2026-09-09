'use strict';
module.exports = function (h) {
  var assert = h.assert, G = h.E.grammar;
  function plain(value) { return JSON.parse(JSON.stringify(value)); }
  [['casa', 'substantivo'], ['bonita', 'adjetivo'], ['uma', 'artigo'], ['eu', 'pronome'], ['hoje', 'advérbio'], ['com', 'preposição'], ['mas', 'conjunção'], ['oxente', 'interjeição'], ['dois', 'numeral'], ['leu', 'verbo']].forEach(function (entry) {
    h.test('Morfologia: classe representada ' + entry[1], function () {
      assert.ok(G.readings(entry[0]).classes.indexOf(entry[1]) !== -1);
      var f = h.vault.analyze('morfologia', entry[0]).findings[0];
      assert.strictEqual(f.severity, 'informação'); assert.strictEqual(f.snippet, entry[0]);
    });
  });
  ['a', 'um', 'canto', 'seca', 'larga', 'leve', 'revista', 'são', 'nossa', 'que', 'se', 'como', 'cantar', 'escrito'].forEach(function (word) {
    h.test('Morfologia: ambiguidade preservada em ' + word, function () {
      var f = h.vault.analyze('morfologia', word).findings[0];
      assert.strictEqual(f.confidence, 'insuficiente'); assert.strictEqual(f.id, 'PTBR-MOR-002'); assert.ok(f.candidates.classes.length > 1);
    });
  });
  h.test('Verbos: homografia de lema e de tempo não se resolve por pontuação', function () {
    assert.deepStrictEqual(plain(G.readings('fui').verbs.map(function (v) { return v[0]; })), ['ser', 'ir']);
    assert.strictEqual(G.readings('cantamos').verbs.length, 2);
    assert.strictEqual(h.vault.analyze('morfologia', 'fui').findings[0].confidence, 'insuficiente');
  });
  h.test('Verbos: flexões exatas mantêm diacríticos e ajuste de publicar', function () {
    assert.strictEqual(G.readings('publiquei').verbs[0][0], 'publicar');
    assert.strictEqual(G.readings('publicei').verbs.length, 0);
    assert.strictEqual(G.readings('pôde').verbs[0][1], 'indicativo:pretérito perfeito');
    assert.strictEqual(G.readings('pode').verbs[0][1], 'indicativo:presente');
    assert.strictEqual(G.readings('pública').classes.indexOf('verbo'), -1);
    assert.ok(G.readings('publica').classes.indexOf('verbo') !== -1);
  });
  h.test('Morfologia: desconhecidos e neologismos não viram substantivos', function () {
    ['desinventar', 'xyz', 'internetês', 'abc123', 'pré-xyz'].forEach(function (word) { assert.strictEqual(G.readings(word).classes.length, 0); });
    assert.strictEqual(h.vault.analyze('morfologia', 'desinventar xyz internetês').findings.length, 0);
  });
  var cases = [
    ['A escritora leu o livro ontem.', [['Sujeito', 'A escritora'], ['Predicado', 'leu o livro ontem'], ['Objeto direto', 'o livro'], ['Adjunto adverbial', 'ontem']]],
    ['A casa é bonita.', [['Sujeito', 'A casa'], ['Predicado', 'é bonita'], ['Predicativo do sujeito', 'bonita']]],
    ['Ana correu cedo.', [['Sujeito', 'Ana'], ['Predicado', 'correu cedo'], ['Adjunto adverbial', 'cedo']]],
    ['Eu dei flores a Maria.', [['Sujeito', 'Eu'], ['Predicado', 'dei flores a Maria'], ['Objeto direto', 'flores'], ['Objeto indireto', 'a Maria']]],
    ['Eu escrevo poemas.', [['Sujeito', 'Eu'], ['Predicado', 'escrevo poemas'], ['Objeto direto', 'poemas']]],
    ['A menina abriu a porta.', [['Sujeito', 'A menina'], ['Predicado', 'abriu a porta'], ['Objeto direto', 'a porta']]]
  ];
  cases.forEach(function (entry) {
    h.test('Sintaxe: recorte inteiro em ' + entry[0], function () {
      var out = h.vault.analyze('sintaxe', entry[0]).findings;
      assert.deepStrictEqual(plain(out.map(function (f) { return [f.feature, f.snippet]; }).sort()), entry[1].slice().sort());
      out.forEach(function (f) { assert.strictEqual(f.severity, 'informação'); assert.strictEqual(f.confidence, 'moderada'); assert.strictEqual(entry[0].slice(f.start, f.end), f.snippet); });
    });
  });
  ['Vendem casas.', 'Há livros.', 'Eu fui feliz.', 'A casa foi aberta.', 'A menina que corre leu o livro.', 'Ana correu e Maria cantou.', 'Ana, correu cedo.', 'Ana leu "o livro".', 'Ana leu xyz.', 'Ana leu o livro com prazer.', 'Ana parece feliz.', '— Ana correu.', 'A menina não leu o livro.', 'Choveu.', 'Me disseram.', 'o canto da vida', 'Ana escreveu.'].forEach(function (text) {
    h.test('Sintaxe: abstenção em ' + text, function () { assert.strictEqual(h.vault.analyze('sintaxe', text).findings.length, 0); });
  });
  h.test('Gramática: máscaras, offsets UTF-16, teto e determinismo', function () {
    ['morfologia', 'sintaxe'].forEach(function (lens) {
      assert.strictEqual(h.vault.analyze(lens, '```\nAna correu cedo.\n```').findings.length, 0);
      var text = '😀. Ana correu cedo.\nA casa é bonita.', r = h.vault.analyze(lens, text);
      r.findings.forEach(function (f) { assert.strictEqual(text.slice(f.start, f.end), f.snippet); });
      assert.strictEqual(JSON.stringify(r), JSON.stringify(h.vault.analyze(lens, text)));
      var capped = h.vault.analyze(lens, new Array(121).join('Ana correu cedo.\n'));
      assert.strictEqual(capped.findings.length, 100); assert.strictEqual(capped.limited, true);
    });
  });
  h.test('Gramática: literatura não recebe erro nem reescrita', function () {
    ['Não consultes dicionários.', 'Liberdade é pouco.', 'O correr da vida embrulha tudo'].forEach(function (text) {
      ['morfologia', 'sintaxe'].forEach(function (lens) {
        h.vault.analyze(lens, text).findings.forEach(function (f) { assert.strictEqual(f.severity, 'informação'); assert.strictEqual(f.reference, null); });
      });
    });
  });
};
