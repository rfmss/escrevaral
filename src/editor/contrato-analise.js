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
   * conhecido; acima de 8.000 a prova é retomável, somente sob comando. */
  function reservedScope(text, scope, item, boundary) {
    var start=item.start,end=item.end,part,clean;
    if(start<scope.start||end>scope.end||text.slice(start,end)!==item.snippet){return {reason:'A ocorrência não pertence mais a este trecho.'};}
    while(start>scope.start&&!/[\r\n]/.test(text.charAt(start-1))){start--;}
    while(end<scope.end&&!/[\r\n]/.test(text.charAt(end))){end++;}
    if(start>0&&!/[\r\n]/.test(text.charAt(start-1))||end<text.length&&!/[\r\n]/.test(text.charAt(end))){
      return {reason:'Contexto cortado pela janela de preparação. A linha inteira precisa caber no trecho reservado; a classe permanece em aberto.'};
    }
    if(end-start>2000||end>200000){return {reason:'Contexto não verificado: a linha não cabe na janela ou está além do limite de 200 mil caracteres do exame. As possibilidades lexicais continuam disponíveis.'};}
    if(end>8000&&!boundary){return {start:start,end:end,needsBoundary:true};}
    if(boundary&&(!boundary.done||boundary.offset!==start||boundary.reason||boundary.closer)){
      return {reason:boundary.reason||'Proteção iniciada antes desta linha (citação ou código). Nenhuma classe contextual foi atribuída.'};
    }
    part=text.slice(start,end);clean=boundary?E.protectedText(part):E.protectedText(text.slice(0,end)).slice(start,end);
    if(clean.slice(item.start-start,item.end-start)!==item.snippet||clean!==E.protectedText(part)){
      return {reason:'Trecho protegido ou proteção iniciada antes desta linha (citação, código ou endereço). Nenhuma classe contextual foi atribuída.'};
    }
    return {start:start,end:end};
  }
  /* Um estado e até 2.000 unidades por passo explícito. Nenhum cache do livro.
   * Usa exatamente a gramática de proteção do cofre, sem classificá-lo.
   * Fatias terminam em LF real: marcadores não se partem entre passos.
   * O sentinela impede que $ invente o fechamento de aspas/código inline. */
  function createBoundaryScan(text, end) {
    var offset=0,closer=null,reason=null;
    if(typeof text!=='string'||typeof end!=='number'||!isFinite(end)||end%1||end<0||end>text.length||end>200000){throw new Error('Fronteira inválida para conferência.');}
    if(end>0&&text.charAt(end-1)!=='\n'){reason='A fronteira anterior usa uma quebra de linha ainda não coberta por esta conferência. Contexto não verificado.';}
    function state(){return {done:!!reason||offset===end,offset:offset,closer:closer,reason:reason};}
    function step(){
      if(reason||offset===end){return state();}
      var stop=Math.min(end,offset+2000),part=text.slice(offset,stop),last,from=0,at,re,m,body,close,scan;
      if(stop<end){
        last=part.lastIndexOf('\n');
        if(last<0){reason='Uma linha anterior ultrapassa a fatia de 2.000 caracteres. Sua proteção ainda não foi verificada; nenhuma classe contextual foi atribuída.';return state();}
        part=part.slice(0,last+1);stop=offset+part.length;
      }
      if(closer){
        at=part.indexOf(closer);
        if(at<0){offset=stop;return state();}
        from=at+closer.length;closer=null;
      }
      scan=part+'\u0000';re=E.protectionPattern();re.lastIndex=from;
      while((m=re.exec(scan))){
        body=m[0];close=body.slice(0,3)==='```'?'```':body.charAt(0)==='“'?'”':body.charAt(0)==='‘'?'’':body.charAt(0)==='«'?'»':null;
        if(close&&(body.length<close.length*2||body.slice(-close.length)!==close)){closer=close;break;}
      }
      offset=stop;return state();
    }
    return {step:step};
  }
  E.analysisContract = { version: 1, request: request, current: current, analyze: analyze, reservedScope: reservedScope, createBoundaryScan: createBoundaryScan };
}(typeof window !== 'undefined' ? window : this));
