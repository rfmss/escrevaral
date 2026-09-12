'use strict';
module.exports = function (h) {
  var a = h.assert, E = h.E, v = h.vault;
  h.test('Contagem da Mesa: compostos, números, emoji, linhas vazias e corpo literal', function () {
    var c = E.countManuscript('guarda-chuva 42 café 😀\r\n\r\n— bom dia');
    a.strictEqual(c.words, 5); a.strictEqual(c.paragraphs, 2);
    a.strictEqual(E.countManuscript('😀 ').characters, 2);
    a.strictEqual(E.countManuscript('\n  \n').paragraphs, 0);
    a.strictEqual(E.countManuscript('“texto citado”').words, 2);
    a.strictEqual(E.countManuscript('').words, 0);
  });
  h.test('Estilo: formas registradas, NFD e fronteiras; não classifica qualquer -mente', function () {
    var text = '😀 rapidamente, FACILMENTE e sile\u0302nciomente. mente semente demente Clemente inventadamente. “lentamente”';
    var fs = v.analyze('adverbios', text).findings;
    a.deepStrictEqual(fs.map(function (f) { return f.snippet; }).join('|'), 'rapidamente|FACILMENTE');
    a.strictEqual(v.analyze('adverbios', 'unicamente').findings.length, 1);
    a.strictEqual(v.analyze('adverbios', 'u\u0301nicamente').findings.length, 0);
    fs.forEach(function (f) { a.strictEqual(text.slice(f.start, f.end), f.snippet); a.strictEqual(f.severity, 'informação'); });
  });
  h.test('Estilo: teto de achados e palavras desconhecidas preservadas', function () {
    var r = v.analyze('adverbios', new Array(104).join('lentamente '));
    a.strictEqual(r.findings.length, 100); a.strictEqual(r.limited, true);
    a.strictEqual(v.analyze('adverbios', 'semente mente demente').findings.length, 0);
  });
  h.test('Diálogo: mede linhas marcadas; não deduz narração nem tensão', function () {
    var f = v.analyze('dialogo', '— Bom dia.\r\nEla saiu.\nEle — sozinho — voltou.').findings[0];
    a.strictEqual(f.metrics.markedLineWords, 2); a.strictEqual(f.metrics.totalWords, 7);
    a.strictEqual(f.metrics.markedLines, 1); a.strictEqual(f.metrics.lines, 3);
    a.strictEqual(f.metrics.markedPercent, 200 / 7);
    a.strictEqual(v.analyze('dialogo', 'Uma narração.').findings[0].metrics.markedPercent, 0);
    a.strictEqual(v.analyze('dialogo', '“Uma fala.”').status, 'insuficiente');
    a.strictEqual(v.analyze('dialogo', '— “citação”.\nOutra linha.').findings[0].metrics.excludedLines, 1);
  });
  h.test('Contrato: trecho tem offsets do original e identifica a revisão', function () {
    var d = E.freshDocument(); d.text = '😀 início\nrapidamente aqui';
    var start = d.text.indexOf('rapidamente'), req = E.analysisContract.request(d, d.text, start), before = JSON.stringify(req);
    var result = E.analysisContract.analyze(v, 'adverbios', req);
    a.strictEqual(result.findings[0].start, start); a.strictEqual(result.source.documentId, d.noteId);
    a.strictEqual(result.source.recordId, d.id); a.strictEqual(result.source.draft, false);
    a.strictEqual(result.engineVersion, '4.0.0'); a.strictEqual(JSON.stringify(req), before);
    a.ok(E.analysisContract.current(req, d, d.text)); a.ok(!E.analysisContract.current(req, d, d.text + '!'));
    d.revision += 1; a.ok(!E.analysisContract.current(req, d, d.text));
    a.throws(function () { E.analysisContract.request(d, d.text, NaN); });
    a.throws(function () { E.analysisContract.request(d, d.text, 4, 1); });
  });
  h.test('Contrato: ocorrências múltiplas preservam posições no documento', function () {
    var d = E.freshDocument(), text = '😀 prefácio\nmemória memória memória';
    var result = E.analysisContract.analyze(v, 'repeticao', E.analysisContract.request(d, text, text.indexOf('memória')));
    a.strictEqual(result.source.draft, true);
    result.findings[0].occurrences.forEach(function (p) { a.strictEqual(text.slice(p.start, p.end), 'memória'); });
  });
  h.test('Lixeira: restauração, exclusão com revisão conferida e falha de espaço', function () {
    var s = new h.Storage(), ar = E.createArchive(s), d = E.freshDocument(); d.text = 'Não perder'; d = ar.save(d).document;
    s.fail = true; a.throws(function () { ar.trash(d); }); a.strictEqual(ar.list().documents[0].text, 'Não perder'); s.fail = false;
    var deleted = ar.trash(d).document; a.strictEqual(ar.list().documents.length, 0); a.strictEqual(ar.list(true).documents.length, 1);
    var restored = ar.trash(deleted, false).document; a.strictEqual(ar.list().documents.length, 1); a.throws(function () { ar.purge(restored); });
    deleted = ar.trash(restored).document; ar.purge(deleted); a.strictEqual(ar.list(true).documents.length, 0); a.throws(function () { ar.purge(deleted); });
  });
  h.test('Lembretes: separados das folhas, incluídos no conjunto exportável', function () {
    var ar = E.createArchive(new h.Storage()), d = E.freshDocument(); d.kind = 'reminder'; d.text = 'Rever final'; ar.save(d);
    a.strictEqual(ar.list().documents.length, 0); a.strictEqual(ar.list(true).documents.length, 1);
    a.ok(!E.validDocument({ kind: 'imagem' }));
  });
};
