'use strict';
module.exports = function (h) {
  var assert = h.assert, E = h.E;
  var cases = JSON.parse(h.source('testes/corpus-transplante.json'));
  cases.forEach(function (entry) {
    h.test(entry.id + ' ' + entry.category, function () {
      var r = h.vault.analyze(entry.lens, entry.text);
      assert.deepStrictEqual(JSON.parse(JSON.stringify(r.findings.map(function (f) { return { id: f.id, snippet: f.snippet, start: f.start, end: f.end }; }))), entry.expected);
      r.findings.forEach(function (f) { assert.ok(['estilo', 'informação'].indexOf(f.severity) >= 0); assert.strictEqual(f.reference, null); });
      assert.strictEqual(JSON.stringify(r), JSON.stringify(h.vault.analyze(entry.lens, entry.text)));
    });
  });
  h.test('Integridade: todas as 18 expressões decoloniais estão no índice', function () {
    E.decolonialData.entries.forEach(function (e) { assert.ok(h.vault.analyze('decolonial', e.term).findings.some(function (f) { return f.id === e.id && f.snippet === e.term; })); });
  });
  h.test('Integridade: todas as expressões de estilo são alcançáveis no índice', function () {
    E.styleData.entries.forEach(function (e) { assert.ok(h.vault.analyze('expressoes', e.term).findings.some(function (f) { return f.id === e.id && f.snippet.toLowerCase() === e.term.toLowerCase(); }), e.term); });
  });
  h.test('Texto de 200 mil caracteres preserva limite e termina', function () {
    var text = new Array(10001).join('uma folha sem juízo. ').slice(0, 200000);
    assert.strictEqual(text.length, 200000);
    assert.strictEqual(h.vault.analyze('decolonial', text).findings.length, 0);
    assert.throws(function () { h.vault.analyze('expressoes', text + 'a'); });
  });
  h.test('Repetições extensas respeitam o teto do cofre', function () {
    var result = h.vault.analyze('decolonial', new Array(130).join('cabelo ruim. '));
    assert.strictEqual(result.findings.length, 100); assert.ok(result.limited);
  });
  h.test('Bibliografia e origens controversas não foram promovidas', function () {
    ['criado mudo', 'feito nas coxas', 'denegrir', 'negro', 'índio', 'autista', 'bicha', 'folclore', 'favela'].forEach(function (text) { assert.strictEqual(h.vault.analyze('decolonial', text).findings.length, 0); });
  });
  h.test('Lentes adicionais não ativam outra lente e não modificam os dados', function () {
    var before = JSON.stringify([E.decolonialData, E.styleData]);
    assert.strictEqual(h.vault.analyze('decolonial', 'no final das contas').findings.length, 0);
    assert.strictEqual(JSON.stringify([E.decolonialData, E.styleData]), before);
  });
};
