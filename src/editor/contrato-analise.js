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
      if (f.clause) { f.clause.start += s.start; f.clause.end += s.start; }
      if (f.head) { f.head.start += s.start; f.head.end += s.start; }
      if (f.components) { f.components.forEach(function (p) { p.start += s.start; p.end += s.start; }); }
      if (f.context) { f.context.forEach(function (p) { p.start += s.start; p.end += s.start; }); }
      if (f.occurrences) { f.occurrences.forEach(function (p) { p.start += s.start; p.end += s.start; }); }
      if (req.text.slice(f.start, f.end) !== f.snippet) { throw new Error('A posição do resultado não corresponde ao original.'); }
    });
    if (result.coverageInfo) { result.coverageInfo.scope.start += s.start; result.coverageInfo.scope.end += s.start; result.coverageInfo.scope.total = req.text.length; }
    result.schema = 'scrvrl.analysis-result'; result.version = 1;
    result.source = { documentId: s.documentId, recordId: s.recordId, revision: s.revision, projectLabel: s.projectLabel, start: s.start, end: s.end, draft: s.draft };
    result.engineVersion = '5.0.0';
    result.dataVersions = { base: E.knowledge.version, maturation: E.maturationData.version, studio: E.studioData.version };
    return result;
  }
  /* Pedido explícito da reserva. Nunca tratar a borda da janela como frase.
   * A linha inteira deve caber na janela. Proteções herdadas exigem prefixo
   * conhecido; 8.000 é o teto já existente da lente, não trabalho por pausa. */
  function reservedScope(text, scope, item) {
    var start=item.start,end=item.end,part,clean;
    if(start<scope.start||end>scope.end||text.slice(start,end)!==item.snippet){return {reason:'A ocorrência não pertence mais a este trecho.'};}
    while(start>scope.start&&!/[\r\n]/.test(text.charAt(start-1))){start--;}
    while(end<scope.end&&!/[\r\n]/.test(text.charAt(end))){end++;}
    if(start>0&&!/[\r\n]/.test(text.charAt(start-1))||end<text.length&&!/[\r\n]/.test(text.charAt(end))){
      return {reason:'Contexto cortado pela janela de preparação. A linha inteira precisa caber no trecho reservado; a classe permanece em aberto.'};
    }
    if(end-start>2000||end>8000){return {reason:'Contexto não verificado: não foi possível conferir as proteções anteriores dentro do limite de 8.000 caracteres. As possibilidades lexicais continuam disponíveis.'};}
    part=text.slice(start,end);clean=E.protectedText(text.slice(0,end)).slice(start,end);
    if(clean.slice(item.start-start,item.end-start)!==item.snippet||clean!==E.protectedText(part)){
      return {reason:'Trecho protegido ou proteção iniciada antes desta linha (citação, código ou endereço). Nenhuma classe contextual foi atribuída.'};
    }
    return {start:start,end:end};
  }
  E.analysisContract = { version: 1, request: request, current: current, analyze: analyze, reservedScope: reservedScope };
}(typeof window !== 'undefined' ? window : this));
