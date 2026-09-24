/* Executar: node ptbr/teste-triagem.js (não requer o pacote PTBR). */
'use strict';
var assert = require('assert'), create = require('./triagem');
var engine = {
  dados: { lexico: { localLexicon: { rua: { className: 'Substantivo' } }, functionWords: { artigos: ['a', 'o'] } } },
  core: {
    tokenizeWithOffsets: function (s) {
      var m, a = [], re = /[A-Za-zÀ-ÖØ-öø-ÿ]+/g;
      while ((m = re.exec(s))) { a.push({ token: m[0], start: m.index, end: m.index + m[0].length }); }
      return a;
    },
    validateFinding: function (f) { return !!(f && f.id === 'PTBR-MORFOLOGIA-001'); }
  },
  dificuldades: { resolve: function (w) { return w === 'para' ? { nota: 'homógrafo' } : null; } },
  expressoes: { has: function (s) { return s === 'rua'; } }
};
var tr = create(engine), source = 'A rua para que o tempo passe ao longo.', t = tr.triage(source);
assert.strictEqual(t.status, 'pronto');
assert.deepStrictEqual(Object.keys(t.signals).sort(), ['dificuldades', 'expressoes', 'morfologia', 'que-contextual']);
assert.strictEqual(t.examples['que-contextual'].start, 11);
assert.strictEqual(Object.prototype.hasOwnProperty.call(t, 'findings'), false);
assert.strictEqual(tr.triage('').signals.morfologia, undefined);
assert.strictEqual(tr.triage(new Array(40002).join('a')).status, 'limite');
assert.throws(function () { tr.run(source.replace('rua', 'sol'), t, [], function () {}); }, /corresponder/);
var queue = [], seen = [], ended = 0;
tr.run(source, t, ['expressoes', 'nao-existe', 'morfologia', 'morfologia'], function (id) {
  seen.push(id);
  return [{ id: 'PTBR-MORFOLOGIA-001', start: 2, end: 5, snippet: 'rua' }];
}, function (id, f) { assert.strictEqual(f.length, 1); }, function () { ended++; }, function (fn) { queue.push(fn); });
while (queue.length) { queue.shift()(); }
assert.deepStrictEqual(seen, ['expressoes', 'morfologia']);
assert.strictEqual(ended, 1);
queue = []; seen = []; ended = 0;
var cancel = tr.run(source, t, ['morfologia', 'expressoes'], function (id) {
  seen.push(id); return [];
}, null, function () { ended++; }, function (fn) { queue.push(fn); });
queue.shift()(); cancel();
while (queue.length) { queue.shift()(); }
assert.deepStrictEqual(seen, ['morfologia']);
assert.strictEqual(ended, 0);
queue = []; seen = [];
tr.run(source, t, ['morfologia'], function () { return [{ id: 'invalido' }]; }, function (id, f, e) {
  assert.ok(e); seen.push(id);
}, null, function (fn) { queue.push(fn); });
while (queue.length) { queue.shift()(); }
assert.deepStrictEqual(seen, ['morfologia']);
console.log('TRIAGEM OK: sinais, offsets, silêncio, limite, texto atual, serial, cancelamento, Finding inválido');
