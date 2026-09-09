'use strict';
module.exports = function (h) {
  var assert = h.assert, P = h.E.poetry;
  var words = [
    ['casa', ['ca', 'sa'], 0], ['amor', ['a', 'mor'], 1], ['flor', ['flor'], 0],
    ['carro', ['car', 'ro'], 0], ['passo', ['pas', 'so'], 0], ['nascer', ['nas', 'cer'], 1],
    ['campo', ['cam', 'po'], 0], ['ritmo', ['rit', 'mo'], 0], ['ombro', ['om', 'bro'], 0],
    ['prato', ['pra', 'to'], 0], ['filho', ['fi', 'lho'], 0], ['sonho', ['so', 'nho'], 0],
    ['chave', ['cha', 've'], 0], ['saúde', ['sa', 'ú', 'de'], 1], ['saída', ['sa', 'í', 'da'], 1],
    ['água', ['á', 'gua'], 0], ['pátria', ['pá', 'tria'], 0], ['poeta', ['po', 'e', 'ta'], 1],
    ['rio', ['ri', 'o'], 0], ['caiu', ['ca', 'iu'], 1], ['herói', ['he', 'rói'], 1],
    ['homem', ['ho', 'mem'], 0], ['jovem', ['jo', 'vem'], 0], ['também', ['tam', 'bém'], 1],
    ['coração', ['co', 'ra', 'ção'], 2], ['órfão', ['ór', 'fão'], 0], ['bênção', ['bên', 'ção'], 0],
    ['música', ['mú', 'si', 'ca'], 0], ['saudade', ['sau', 'da', 'de'], 1], ['guerra', ['guer', 'ra'], 0],
    ['queijo', ['quei', 'jo'], 0], ['linguiça', ['lin', 'gui', 'ça'], 1], ['exceção', ['ex', 'ce', 'ção'], 2]
  ];
  words.forEach(function (entry) {
    h.test('Poesia: ' + entry[0], function () {
      var r = P.wordReading(entry[0]); assert.deepStrictEqual(Array.from(r.syllables), entry[1]); assert.strictEqual(r.tonic, entry[2]);
      assert.strictEqual(r.syllables.join(''), entry[0]);
    });
  });
  h.test('Poesia: composição canônica não altera o manuscrito ou os offsets', function () {
    var text = '😀 sau\u0301de';
    assert.deepStrictEqual(Array.from(P.syllables('sau\u0301de')), ['sa', 'ú', 'de']);
    var r = h.vault.analyze('metrica', text).findings[0]; assert.strictEqual(r.snippet, text); assert.strictEqual(r.end, text.length);
  });
  h.test('Poesia: tonicidade final limita a contagem', function () {
    assert.strictEqual(P.scan('casa').max, 1); assert.strictEqual(P.scan('amor').max, 2); assert.strictEqual(P.scan('música').max, 1);
    assert.strictEqual(P.scan('a casa').max, 2); assert.strictEqual(P.scan('o amor').min, 2); assert.strictEqual(P.scan('o amor').max, 3);
  });
  h.test('Poesia: pausa bloqueia a fusão, verso livre não recebe erro', function () {
    assert.strictEqual(P.scan('o, amor').possibleFusions, 0);
    var r = h.vault.analyze('metrica', 'o amor\nexiste\nno intervalo').findings;
    assert.strictEqual(r.length, 3); r.forEach(function (f) { assert.strictEqual(f.severity, 'informação'); assert.strictEqual(f.confidence, 'baixa'); assert.strictEqual(f.reference, null); });
  });
  h.test('Poesia: diferença de acento mantém distintas as candidatas', function () {
    assert.notStrictEqual(P.wordReading('avó').rhyme, P.wordReading('avô').rhyme);
    assert.notStrictEqual(P.wordReading('sabia').rhyme, P.wordReading('sabiá').rhyme);
    assert.strictEqual(h.vault.analyze('rima', 'avó\navô').findings.length, 0);
  });
  h.test('Poesia: candidata a rima aponta só o final certo, com referência verificável', function () {
    var text = 'um amor\nna flor\ncom dor'; var r = h.vault.analyze('rima', text).findings;
    assert.strictEqual(r.length, 2); assert.strictEqual(r[0].snippet, 'flor'); assert.strictEqual(r[0].start, 11);
    assert.strictEqual(r[0].related.snippet, 'amor'); assert.strictEqual(text.slice(r[0].related.start, r[0].related.end), 'amor');
  });
  h.test('Poesia: desconhecido, código, citação e linha vazia', function () {
    assert.strictEqual(P.syllables('xyz'), null); assert.strictEqual(P.syllables('dar-te-ia'), null);
    assert.strictEqual(h.vault.analyze('metrica', 'xyz').findings[0].confidence, 'insuficiente');
    ['rima', 'metrica'].forEach(function (lens) {
      ['', '  \n\n', '```\namor\nflor\n```', '"amor"\n"flor"', 'https://exemplo.test/amor'].forEach(function (text) { assert.strictEqual(h.vault.analyze(lens, text).findings.length, 0); });
    });
  });
  h.test('Poesia: teto de resultados e isolamento da lente', function () {
    var r = h.vault.analyze('metrica', new Array(120).join('amor\n'));
    assert.strictEqual(r.findings.length, 100); assert.ok(r.limited);
    assert.strictEqual(h.vault.analyze('ortografia', 'casa\nasa').findings.length, 0);
  });
  h.test('Poesia: fragmentos literários creditados continuam observações, com medidas explícitas', function () {
    [['Não consultes dicionários.', 8, 8], ['Liberdade é pouco.', 5, 6], ['O correr da vida embrulha tudo', 9, 10]].forEach(function (entry) {
      var f = h.vault.analyze('metrica', entry[0]).findings[0];
      assert.strictEqual(f.severity, 'informação'); assert.strictEqual(f.measurements.min, entry[1]); assert.strictEqual(f.measurements.max, entry[2]);
      assert.strictEqual(h.vault.analyze('rima', entry[0]).findings.length, 0);
    });
  });
};
