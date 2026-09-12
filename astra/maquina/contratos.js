(function (root) {
  'use strict';
  var E = root.Escr;
  function request(doc, text, start, end) {
    if (!E.validDocument(doc) || typeof text !== 'string') { throw new Error('Documento inválido para análise.'); }
    start = typeof start === 'undefined' ? 0 : start; end = typeof end === 'undefined' ? text.length : end;
    if (typeof start !== 'number' || typeof end !== 'number' || !isFinite(start) || !isFinite(end) || start % 1 || end % 1 || start < 0 || end < start || end > text.length) { throw new Error('Trecho inválido para análise.'); }
    return { schema: 'scrvrl.analysis-request', version: 1, text: text,
      source: { documentId: doc.noteId || doc.id, recordId: doc.id, revision: doc.revision, projectLabel: doc.project || '', start: start, end: end, draft: doc.text !== text } };
  }
  function current(req, doc, text) {
    return !!req && !!doc && req.source.documentId === (doc.noteId || doc.id) && req.source.recordId === doc.id && req.source.revision === doc.revision && req.text === text;
  }
  function analyze(vault, lens, req) {
    var s = req.source, result = vault.analyze(lens, req.text.slice(s.start, s.end));
    /* O cofre usa posições no trecho; consumidores recebem posições no original. */
    result.findings.forEach(function (f) {
      f.start += s.start; f.end += s.start;
      if (typeof f.contextStart === 'number') { f.contextStart += s.start; }
      if (typeof f.contextEnd === 'number') { f.contextEnd += s.start; }
      if (f.occurrences) { f.occurrences.forEach(function (p) { p.start += s.start; p.end += s.start; }); }
      if (req.text.slice(f.start, f.end) !== f.snippet) { throw new Error('A posição do resultado não corresponde ao original.'); }
    });
    result.schema = 'scrvrl.analysis-result'; result.version = 1;
    result.source = { documentId: s.documentId, recordId: s.recordId, revision: s.revision, projectLabel: s.projectLabel, start: s.start, end: s.end, draft: s.draft };
    result.engineVersion = '4.0.0';
    result.dataVersions = { base: E.knowledge.version, maturation: E.maturationData.version, studio: E.studioData.version };
    return result;
  }
  E.analysisContract = { version: 1, request: request, current: current, analyze: analyze };
}(typeof window !== 'undefined' ? window : this));
