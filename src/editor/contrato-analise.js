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
  /* Cursor de proteção, não análise linguística. Até 2.000 visitas por passo;
   * guarda apenas índices/modo. Marcadores podem atravessar qualquer fatia.
   * A precedência replica protectionPattern: URL antes de email no mesmo início;
   * email mais à esquerda antes de URL embutida; aspas inline exigem fechamento
   * antes de LF. Falha inline retoma após o abridor, sem perder marcas internas. */
  function createBoundaryScan(text, end) {
    var offset=0,high=0,mode='search',closer=null,inline=false,opener=0,urlAt=-1,reason=null;
    var totalVisits=0,stepVisits=0;
    if(typeof text!=='string'||typeof end!=='number'||!isFinite(end)||end%1||end<0||end>text.length||end>200000){throw new Error('Fronteira inválida para conferência.');}
    if(end>0&&text.charAt(end-1)!=='\n'){reason='A fronteira anterior usa uma quebra de linha ainda não coberta por esta conferência. Contexto não verificado.';}
    function state(){return {done:!!reason||offset===end,offset:high,closer:mode==='span'?closer:null,reason:reason,work:stepVisits,totalVisits:totalVisits};}
    function urlSize(at){
      var look=text.slice(at,Math.min(end,at+8));
      return look.slice(0,8)==='https://'?8:look.slice(0,7)==='http://'?7:look.slice(0,4)==='www.'?4:0;
    }
    function move(n){offset+=n;if(offset>high){high=offset;}}
    function step(){
      stepVisits=0;
      while(!reason&&offset<end&&stepVisits<2000){
        var ch=text.charAt(offset),size;
        stepVisits++;totalVisits++;
        if(mode==='span'){
          if(ch===closer.charAt(0)&&text.slice(offset,Math.min(end,offset+closer.length))===closer){
            /* Não avançar mais posições que o orçamento restante deste passo. */
            if(stepVisits+closer.length-1>2000){break;}
            stepVisits+=closer.length-1;totalVisits+=closer.length-1;move(closer.length);mode='search';closer=null;continue;
          }
          if(inline&&ch==='\n'){
            /* O regex integral não mascara uma aspa ou marca de código inline sem fechamento
             * antes de LF. Reexaminar o interior recupera “/``` antes ignorados.
             * Sem o próprio fechamento nesse intervalo, só o outro tipo inline
             * pode causar nova retomada: não há pilha de tamanho do manuscrito. */
            offset=opener+1;mode='search';closer=null;continue;
          }
          move(1);continue;
        }
        if(mode==='url'){
          if(/\s/.test(ch)){mode='search';}else{move(1);}continue;
        }
        if(mode==='email'){
          if(/[\w.-]/.test(ch)){move(1);}else{mode='search';}continue;
        }
        if(mode==='word'){
          if(/[\w.+-]/.test(ch)){
            if(urlAt<0&&(ch==='h'||ch==='w')&&urlSize(offset)){urlAt=offset;}move(1);continue;
          }
          if(ch==='@'&&offset+1<end&&/[\w.-]/.test(text.charAt(offset+1))){mode='email';move(1);continue;}
          /* Sem email, a primeira URL possível no interior volta a competir. */
          if(urlAt>=0){offset=urlAt;}mode='search';urlAt=-1;continue;
        }
        if(ch==='`'||ch==='"'||ch==='“'||ch==='‘'||ch==='«'){
          size=ch==='`'&&text.slice(offset,Math.min(end,offset+3))==='```'?3:1;
          if(stepVisits+size-1>2000){break;}
          closer=size===3?'```':ch==='“'?'”':ch==='‘'?'’':ch==='«'?'»':ch;
          inline=size===1&&(ch==='`'||ch==='"');opener=offset;mode='span';
          stepVisits+=size-1;totalVisits+=size-1;move(size);continue;
        }
        size=ch==='h'||ch==='w'?urlSize(offset):0;
        if(size){
          if(stepVisits+size-1>2000){break;}
          stepVisits+=size-1;totalVisits+=size-1;move(size);mode='url';continue;
        }
        if(/[\w.+-]/.test(ch)){mode='word';urlAt=-1;move(1);continue;}
        move(1);
      }
      return state();
    }
    return {step:step};
  }
  E.analysisContract = { version: 1, request: request, current: current, analyze: analyze, reservedScope: reservedScope, createBoundaryScan: createBoundaryScan };
}(typeof window !== 'undefined' ? window : this));
