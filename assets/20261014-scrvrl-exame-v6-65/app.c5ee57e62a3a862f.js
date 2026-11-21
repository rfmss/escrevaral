/* Gerado; fontes em src/, ptbr/ e build/modules.json. */
(function(root){'use strict';root.Escr=root.EscrCofre.createRuntime();}(window));
/* Fonte: src/storage/documentos.js */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};
  var prefix = 'escrevaral.astra.v1.doc.', counter = 0;
  function uid() { counter += 1; return new Date().getTime().toString(36) + '-' + Math.random().toString(36).slice(2, 10) + '-' + counter; }
  function isPlainObject(v) { return !!v && typeof v === 'object' && Object.prototype.toString.call(v) === '[object Object]'; }
  function validMeta(doc) {
    return (typeof doc.starred === 'undefined' || typeof doc.starred === 'boolean') &&
      (typeof doc.archived === 'undefined' || typeof doc.archived === 'boolean') &&
      (typeof doc.locked === 'undefined' || typeof doc.locked === 'boolean') &&
      (typeof doc.format === 'undefined' || doc.format === 'plain' || doc.format === 'rich') &&
      (typeof doc.richHtml === 'undefined' || (typeof doc.richHtml === 'string' && doc.richHtml.length <= 2000000)) &&
      (typeof doc.folder === 'undefined' || (typeof doc.folder === 'string' && doc.folder.length <= 120)) &&
      (typeof doc.role === 'undefined' || (typeof doc.role === 'string' && doc.role.length <= 60)) &&
      (typeof doc.category === 'undefined' || (typeof doc.category === 'string' && doc.category.length <= 40)) &&
      (typeof doc.sonnetSettings === 'undefined' || isPlainObject(doc.sonnetSettings));
  }
  function valid(doc) {
    return doc && validMeta(doc) && (typeof doc.cartorio==='undefined'||(root.Escr.cartorio&&root.Escr.cartorio.validDocLedger(doc.cartorio))) && (typeof doc.lineage==='undefined'||(root.Escr.lineage&&root.Escr.lineage.valid(doc.lineage))) && (typeof doc.linguistics==='undefined'||(doc.linguistics&&doc.linguistics.version===1&&Object.prototype.toString.call(doc.linguistics.records)==='[object Array]'&&doc.linguistics.records.length<=3&&root.Escr.linguistics&&doc.linguistics.records.every(root.Escr.linguistics.valid))) && (typeof doc.projectId === 'undefined' || (typeof doc.projectId === 'string' && /^[a-z0-9-]+$/.test(doc.projectId))) && (typeof doc.trashed === 'undefined' || typeof doc.trashed === 'boolean') && (typeof doc.kind === 'undefined' || doc.kind === 'reminder') && (typeof doc.project === 'undefined' || (typeof doc.project === 'string' && doc.project.length <= 120)) && typeof doc.id === 'string' && /^[a-z0-9-]+$/.test(doc.id) && (typeof doc.noteId === 'undefined' || (typeof doc.noteId === 'string' && /^[a-z0-9-]+$/.test(doc.noteId))) && typeof doc.title === 'string' && typeof doc.text === 'string' && typeof doc.updated === 'string' && isFinite(Date.parse(doc.updated)) && (typeof doc.created === 'undefined' || (typeof doc.created === 'string' && isFinite(Date.parse(doc.created)))) && (typeof doc.createdApproximate === 'undefined' || typeof doc.createdApproximate === 'boolean') && typeof doc.revision === 'number' && doc.revision >= 0 && doc.revision % 1 === 0 && Object.prototype.toString.call(doc.dismissed) === '[object Array]' && doc.dismissed.every(function (x) { return typeof x === 'string'; });
  }
  function fresh() { var now = new Date().toISOString(), id = uid(); return { id: id, noteId: id, title: '', text: '', created: now, updated: now, revision: 0, dismissed: [] }; }
  function dateOf(doc) { return doc.created || doc.updated; }
  function createArchive(storage) {
    function get(id) { var raw = storage.getItem(prefix + id), doc = raw ? JSON.parse(raw) : null; if (doc && !valid(doc)) { throw new Error('Esta folha não pôde ser lida. Sua cópia guardada foi preservada.'); } return doc; }
    function list(includeAll) {
      var docs = [], unreadable = 0, i, key, doc;
      for (i = 0; i < storage.length; i += 1) {
        key = storage.key(i);
        if (key && key.indexOf(prefix) === 0) {
          try { doc = get(key.slice(prefix.length)); if (doc && (includeAll || (!doc.trashed && doc.kind !== 'reminder'))) { docs.push(doc); } } catch (e) { unreadable += 1; }
        }
      }
      docs.sort(function (a, b) { return Date.parse(dateOf(b)) - Date.parse(dateOf(a)) || ((a.noteId || a.id) < (b.noteId || b.id) ? -1 : (a.noteId || a.id) > (b.noteId || b.id) ? 1 : 0); });
      return { documents: docs, unreadable: unreadable };
    }
    function save(doc, forceHistory) {
      if (!valid(doc)) { throw new Error('A folha não pôde ser guardada. Baixe uma cópia do texto.'); }
      var current = get(doc.id), copy = JSON.parse(JSON.stringify(doc)), conflict = false;
      if ((current && current.revision !== doc.revision) || (!current && doc.revision !== 0)) {
        copy.title = (copy.title || 'Sem título') + ' — versão preservada'; conflict = true;
      }
      if(root.Escr.lineage){copy.lineage=root.Escr.lineage.capture(current,copy,forceHistory);}
      /* Folhas antigas só tinham a última gravação: preservar essa data sem inventar a criação. */
      if (!copy.created) { copy.created = copy.updated; copy.createdApproximate = true; }
      copy.noteId = copy.noteId || copy.id; copy.id = uid(); copy.revision += 1; copy.updated = new Date().toISOString();
      if (root.Escr.cartorio) { copy.cartorio = root.Escr.cartorio.sealDocument(current, copy); }
      /* Chave nova por gravação: duas abas nunca escrevem sobre a mesma chave. */
      storage.setItem(prefix + copy.id, JSON.stringify(copy));
      /* Só retirar a antecessora depois da nova gravação. Falha aqui deixa uma cópia extra. */
      if (current && !conflict) { try { storage.removeItem(prefix + doc.id); } catch (e) { /* Cópia extra no acervo. */ } }
      return { document: copy, conflict: conflict };
    }
    function trash(doc, value) {
      var copy = JSON.parse(JSON.stringify(doc)); copy.trashed = value !== false; return save(copy);
    }
    function purge(doc) {
      var current = get(doc.id);
      if (!current || !current.trashed || current.revision !== doc.revision) { throw new Error('A folha mudou. Abra a lixeira novamente antes de excluir.'); }
      storage.removeItem(prefix + doc.id);
      if (storage.getItem(prefix + doc.id) !== null) { throw new Error('A exclusão não foi concluída.'); }
    }
    return { get: get, list: list, save: save, fresh: fresh, trash: trash, purge: purge };
  }
  function dateKey(entry) {
    var d = new Date(dateOf(entry));
    function pad(n) { return n < 10 ? '0' + n : String(n); }
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function searchKey(value) {
    return String(value || '').toLowerCase().replace(/[àáâãä]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/ç/g, 'c');
  }
  function browseNotes(entries, options) {
    options = options || {};
    var query = searchKey(options.query).replace(/^\s+|\s+$/g, ''), months = {}, days = {}, notes = [];
    entries.forEach(function (entry) {
      var day = dateKey(entry), month = day.slice(0, 7);
      months[month] = (months[month] || 0) + 1;
      if (month === options.month) { days[day] = (days[day] || 0) + 1; }
      if (query ? searchKey(entry.title + '\n' + entry.text).indexOf(query) !== -1 : day === options.day) { notes.push(entry); }
    });
    notes.sort(function (a, b) { return Date.parse(dateOf(a)) - Date.parse(dateOf(b)) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0); });
    function groups(map) { return Object.keys(map).sort().reverse().map(function (key) { return { key: key, count: map[key] }; }); }
    return { query: query, months: groups(months), days: groups(days), notes: notes };
  }
  root.Escr.noteDateKey = dateKey;
  root.Escr.browseNotes = browseNotes;
  root.Escr.createArchive = createArchive;
  root.Escr.freshDocument = fresh;
  root.Escr.validDocument = valid;
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/editor/contrato-analise.js */
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
  function analyze(vault, lens, req, target) {
    var s = req.source, localTarget;
    if (typeof target !== 'undefined') {
      if (!target || typeof target.start !== 'number' || typeof target.end !== 'number') { throw new Error('Ocorrência inválida para análise.'); }
      localTarget = {start:target.start-s.start,end:target.end-s.start,snippet:target.snippet};
    }
    var result = vault.analyze(lens, req.text.slice(s.start, s.end), localTarget);
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
    if (result.coverageInfo && result.coverageInfo.target) {
      result.coverageInfo.target.start += s.start; result.coverageInfo.target.end += s.start;
    }
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

;
/* Fonte: src/app/utilitarios.js */
(function (root) {
  'use strict';
  var E = root.Escr;
  /* Calendário adaptado de main/cronograma-controller.js: mesmas datas,
     fases aproximadas e chave vrda-planner. Sem DOM ou dependências modernas. */
  E.calendarMonths = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  E.calendarKey = function (y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); };
  E.calendarMonth = function (y, m) {
    var date = new Date(y, m, 1), a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,n=Math.floor((a+11*h+22*l)/451);
    var easter = new Date(y,Math.floor((h+l-7*n+114)/31)-1,((h+l-7*n+114)%31)+1);
    /* A main misturava DD-MM e MM-DD nas datas fixas; aqui todas usam MM-DD. */
    var dates = {'01-01':'Confraternização Universal','04-21':'Tiradentes','05-01':'Dia do Trabalhador','09-07':'Independência do Brasil','10-12':'Nossa Senhora Aparecida','11-02':'Finados','11-15':'Proclamação da República','11-20':'Dia da Consciência Negra','12-25':'Natal'};
    [[-47,'Carnaval'],[-2,'Sexta-feira Santa'],[60,'Corpus Christi']].forEach(function (item) { var dt = new Date(easter.getTime()); dt.setDate(dt.getDate()+item[0]); dates[pad(dt.getMonth()+1)+'-'+pad(dt.getDate())] = item[1]; });
    var moons = [], synodic = 29.530588853, dayMs = 86400000, reference = Date.UTC(2000,0,6,18,14), start = Date.UTC(y,m,1,12), cycle = Math.floor((start-reference)/(synodic*dayMs))-1, j;
    for (j=cycle; j<cycle+4; j+=1) {
      ['Nova','Crescente','Cheia','Minguante'].forEach(function (name, phase) { var t = reference+(j+phase/4)*synodic*dayMs, dt = new Date(t); if (dt.getFullYear()===y && dt.getMonth()===m) { moons.push({day:dt.getDate(),name:name,time:t}); } });
    }
    moons.sort(function (x,z) { return x.time-z.time; });
    return { year:y, month:m, first:date.getDay(), days:new Date(y,m+1,0).getDate(), dates:dates, moons:moons };
  };
  E.validPlanner = function (data) {
    if (!data || typeof data !== 'object' || Object.prototype.toString.call(data) === '[object Array]') { return false; }
    return Object.keys(data).every(function (key) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !Array.isArray(data[key])) { return false; }
      return data[key].every(function (item) { return item && (typeof item.id === 'number' || typeof item.id === 'string') && typeof item.text === 'string' && (item.type==='task' || item.type==='note') && typeof item.completed==='boolean'; });
    });
  };
  /* Analisador aritmético delimitado. Nunca executa a expressão como código. */
  E.calculate = function (input) {
    var s=String(input).replace(/\s/g,'').replace(/,/g,'.').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-'), p=0;
    if (!s || s.length>160 || /[^0-9.+*/()%\-]/.test(s)) { throw new Error('Confira a conta.'); }
    function atom() { var sign=1, value, match; if(s.charAt(p)==='+' || s.charAt(p)==='-'){ if(s.charAt(p++)==='-'){sign=-1;} } if(s.charAt(p)==='('){p+=1;value=sum();if(s.charAt(p++)!==')'){throw new Error('Feche os parênteses.');}}else{match=/^(?:\d+(?:\.\d*)?|\.\d+)/.exec(s.slice(p));if(!match){throw new Error('Confira a conta.');}p+=match[0].length;value=Number(match[0]);}if(s.charAt(p)==='%'){p+=1;value/=100;}return sign*value; }
    function product() {var value=atom(),op,right;while(s.charAt(p)==='*'||s.charAt(p)==='/'){op=s.charAt(p++);right=atom();if(op==='/'&&right===0){throw new Error('Não é possível dividir por zero.');}value=op==='*'?value*right:value/right;}return value;}
    function sum() {var value=product(),op;while(s.charAt(p)==='+'||s.charAt(p)==='-'){op=s.charAt(p++);value+= (op==='+'?1:-1)*product();}return value;}
    var result=sum(); if(p!==s.length || !isFinite(result)){throw new Error('Confira a conta.');} return Number(result.toPrecision(12));
  };
  E.pomodoroRemaining = function (state, now) { return Math.max(0, Math.ceil((state.paused ? state.remaining : state.target-now)/1000)); };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/digito-relogio.js */
/* Relógio mecânico: repouso -> meia troca -> destino; sem animação contínua. */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};
  root.Escr.setClockDigit = function (node, next, visible) {
    if (node.getAttribute('data-digit') === next) { return; }
    if (node._escrDigitTimer) { root.clearTimeout(node._escrDigitTimer); node._escrDigitTimer = null; }
    var generation = (node._escrDigitGeneration || 0) + 1; node._escrDigitGeneration = generation;
    var old = node.getAttribute('data-digit'), selectors = ['.static-top span', '.static-bottom span', '.flap-front span', '.flap-back span'], parts = [], i;
    for (i = 0; i < selectors.length; i += 1) { parts.push(node.querySelector(selectors[i])); }
    node.setAttribute('data-digit', next);
    function finish() {
      // Uma troca mais recente invalida o callback, mesmo se voltou ao mesmo dígito.
      if (node._escrDigitGeneration !== generation) { return; }
      node._escrDigitTimer = null;
      for (var j = 0; j < parts.length; j += 1) { parts[j].textContent = next; }
      node.setAttribute('data-digit-phase', 'rest');
    }
    var reduced = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!old || reduced || root.document.hidden || visible === false) { finish(); return; }
    parts[0].textContent = next; parts[1].textContent = old;
    parts[2].textContent = next; parts[3].textContent = next;
    node.setAttribute('data-digit-phase', 'middle');
    node._escrDigitTimer = root.setTimeout(finish, 70);
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/utilitarios.js */
(function (root) {
  'use strict';
  root.Escr.mountUtilities = function (bridge) {
    var E=root.Escr, document=root.document, storage=bridge.storage, byId=function(id){return document.getElementById(id);};
    function text(node,value){node.textContent=String(value);}
    function on(node,event,fn){node.addEventListener(event,fn,false);}
    function el(tag,parent,value){var node=document.createElement(tag);if(typeof value!=='undefined'){text(node,value);}if(parent){parent.appendChild(node);}return node;}
    function button(parent,label,fn){var node=el('button',parent,label);node.type='button';on(node,'click',fn);return node;}
    function pad(n){return n<10?'0'+n:String(n);}
    function status(value){text(byId('pomodoro-state'),value);}
    var state={mode:'idle',target:0,paused:false,remaining:0,work:50,rest:6,quote:0}, tickTimer=null, timerKey='escrevaral.astra.pomodoro.v1';
    var quotes=[{q:'Penso, logo existo.',a:'René Descartes'},{q:'Tudo vale a pena se a alma não é pequena.',a:'Fernando Pessoa'},{q:'Ser ou não ser, eis a questão.',a:'William Shakespeare'}];
    function saveTimer(){try{if(!storage){throw new Error('storage');}storage.setItem(timerKey,JSON.stringify(state));}catch(e){status('O relógio segue nesta sessão; não foi possível guardar seu estado.');}}
    function formatTime(seconds){return pad(Math.floor(seconds/60))+':'+pad(seconds%60);}
    function showFocus(){if(E.dialog&&E.dialog.isOpen()||document.body.getAttribute('data-locked')==='true'||!byId('chalkboard').hidden){return;}bridge.show('focus-pause','pomodoro-task');byId('focus-close').focus();byId('focus-pause').scrollTop=0;}
    function paintTimer(){
      var remaining=state.mode==='idle'?state.work*60:E.pomodoroRemaining(state,Date.now()), display=formatTime(remaining), digits=display.replace(':',''), j;
      text(byId('pomodoro-display'),display);text(byId('focus-time'),display);
      for(j=0;j<4;j+=1){E.setClockDigit(byId('focus-digit-'+j),digits.charAt(j),!byId('focus-pause').hidden);}
      byId('pomodoro-task').hidden=state.mode==='idle';text(byId('pomodoro-task'),(state.mode==='work'?'Escrita ':'Pausa ')+display+(state.paused?' · pausado':''));
      byId('pomodoro-start').hidden=state.mode!=='idle';byId('pomodoro-stop').hidden=state.mode==='idle';byId('pomodoro-pause').hidden=state.mode==='idle'||state.mode==='ready';
      byId('pomodoro-work').disabled=byId('pomodoro-break').disabled=state.mode!=='idle';text(byId('pomodoro-pause'),state.paused?'Retomar contagem':'Pausar contagem');
      text(byId('focus-status'),state.mode==='ready'?'A pausa terminou. Volte quando quiser.':'Afaste os olhos da tela. A escrita pode esperar.');
      byId('focus-pause').setAttribute('data-mode',state.mode);byId('focus-challenge').hidden=state.mode!=='ready';
      if(state.mode==='ready'){text(byId('focus-quote'),'“'+quotes[state.quote].q+'”');text(byId('focus-author'),quotes[state.quote].a);}
    }
    function tick(){
      root.clearTimeout(tickTimer);tickTimer=null;if(document.hidden){return;}
      if(!state.paused&&state.mode==='work'&&state.target<=Date.now()){
        if(!bridge.checkpoint()){tickTimer=root.setTimeout(tick,1000);return;}
        state.mode='break';state.target=Date.now()+state.rest*60000;state.quote=Math.floor(Math.random()*quotes.length);status('Tempo de escrita encerrado. Hora da pausa.');saveTimer();paintTimer();showFocus();
      }else if(!state.paused&&state.mode==='break'&&state.target<=Date.now()){
        state.mode='ready';state.target=0;status('Pausa concluída.');saveTimer();
      }
      paintTimer();if((state.mode==='work'||state.mode==='break')&&!state.paused){tickTimer=root.setTimeout(tick,1000);}
    }
    function startWork(){
      var work=Number(byId('pomodoro-work').value),rest=Number(byId('pomodoro-break').value);
      if(work!==Math.floor(work)||rest!==Math.floor(rest)||work<1||work>99||rest<1||rest>30){status('Escolha de 1 a 99 minutos de escrita e de 1 a 30 de pausa.');return;}
      if(!bridge.checkpoint()){return;}state={mode:'work',target:Date.now()+work*60000,remaining:0,paused:false,work:work,rest:rest,quote:state.quote};status('Tempo de escrita em andamento.');saveTimer();bridge.write();tick();
    }
    function stop(){state.mode='idle';state.paused=false;state.target=0;state.remaining=0;status('Pronto para começar.');saveTimer();tick();}
    byId('pomodoro-work').value='50';byId('pomodoro-break').value='6';
    ['pomodoro-panel','calculator-panel','calendar-panel','focus-pause','utilidades'].forEach(function(id){byId(id).hidden=true;});
    try{var saved=storage&&JSON.parse(storage.getItem(timerKey)||'null');if(saved&&/^(idle|work|break|ready)$/.test(saved.mode)&&typeof saved.target==='number'&&isFinite(saved.target)&&typeof saved.remaining==='number'&&isFinite(saved.remaining)&&saved.remaining>=0&&saved.remaining<=5940000&&typeof saved.paused==='boolean'&&saved.work>=1&&saved.work<=99&&saved.work===Math.floor(saved.work)&&saved.rest>=1&&saved.rest<=30&&saved.rest===Math.floor(saved.rest)&&saved.quote>=0&&saved.quote<quotes.length&&saved.quote===Math.floor(saved.quote)){state=saved;byId('pomodoro-work').value=String(state.work);byId('pomodoro-break').value=String(state.rest);}}catch(ignore){status('O relógio anterior não pôde ser recuperado.');}
    on(byId('pomodoro-start'),'click',startWork);
    on(byId('pomodoro-stop'),'click',stop);
    on(byId('pomodoro-pause'),'click',function(){if(state.paused){state.target=Date.now()+state.remaining;state.paused=false;}else{state.remaining=E.pomodoroRemaining(state,Date.now())*1000;state.paused=true;}status(state.paused?'Contagem pausada.':'Contagem retomada.');saveTimer();tick();});
    on(byId('focus-close'),'click',function(){bridge.write();});
    on(byId('focus-finish'),'click',function(){stop();bridge.write();});
    on(byId('focus-form'),'submit',function(event){event.preventDefault();if(state.mode!=='ready'){return;}var answer=byId('focus-answer').value.toLowerCase().replace(/^\s+|\s+$/g,'').replace(/[éêè]/g,'e');var wanted=quotes[state.quote].a.split(' ')[0].toLowerCase().replace(/[éêè]/g,'e');if(answer===wanted){byId('focus-answer').value='';text(byId('focus-answer-status'),'');startWork();}else{text(byId('focus-answer-status'),'Use o primeiro nome que aparece abaixo da frase.');}});
    on(document,'visibilitychange',tick);on(root,'pageshow',tick);on(byId('manuscrito'),'compositionend',function(){if(state.mode==='work'&&state.target<=Date.now()){tick();}});
    on(byId('pomodoro-task'),'click',function(){if(state.mode==='break'||state.mode==='ready'){showFocus();}else{open('pomodoro');}});

    var calc=byId('calculator-input'),result=byId('calculator-result');
    function calculate(){try{text(result,String(E.calculate(calc.value)).replace('.',','));}catch(e){text(result,e.message);}}
    on(byId('calculator-form'),'submit',function(event){event.preventDefault();calculate();});
    byId('calculator-keys').textContent = ''; /* Uma única montagem; remove o conjunto estático. */
    ['C','⌫','(',')','7','8','9','÷','4','5','6','×','1','2','3','−','0',',','%','+','='].forEach(function(key){var b=button(byId('calculator-keys'),key,function(){if(key==='C'){calc.value='';text(result,'0');}else if(key==='⌫'){calc.value=calc.value.slice(0,-1);}else if(key==='='){calculate();}else if(calc.value.length<160){calc.value+=key;}calc.focus();});if(key==='⌫'){b.setAttribute('aria-label','Apagar último caractere');}if(key==='C'){b.setAttribute('aria-label','Limpar conta');}var labels={'×':'Multiplicar','−':'Subtrair','÷':'Dividir','+':'Somar','=':'Calcular','%':'Porcentagem'};if(labels[key]){b.setAttribute('aria-label',labels[key]);}});

    var today=new Date(),year=today.getFullYear(),month=today.getMonth(),selected=E.calendarKey(year,month,today.getDate()),planner={},plannerValid=true,calendarDocs=[];
    function loadPlanner(){try{planner=storage?JSON.parse(storage.getItem('vrda-planner')||'{}'):{};if(!E.validPlanner(planner)){throw new Error('invalid');}plannerValid=true;}catch(e){plannerValid=false;text(byId('calendar-status'),'Não foi possível ler o calendário salvo. Os dados anteriores foram preservados.');planner={};}}
    function savePlanner(next){if(!plannerValid||!storage){text(byId('calendar-status'),'Não foi possível guardar. Copie sua anotação antes de sair.');return false;}try{storage.setItem('vrda-planner',JSON.stringify(next));planner=next;text(byId('calendar-status'),'Calendário guardado neste aparelho.');return true;}catch(e){text(byId('calendar-status'),'Não foi possível guardar. A anotação permanece no campo.');return false;}}
    function docKey(entry){var date=new Date(entry.created||entry.updated);return E.calendarKey(date.getFullYear(),date.getMonth(),date.getDate());}
    function renderDay(){
      var list=byId('calendar-items'),day=Number(selected.slice(8)),model=E.calendarMonth(year,month);list.textContent='';
      text(byId('calendar-day-heading'),day+' de '+E.calendarMonths[month]+' de '+year);text(byId('calendar-date-label'),model.dates[selected.slice(5)]||'');
      calendarDocs.filter(function(entry){return docKey(entry)===selected;}).forEach(function(entry){var b=button(list,entry.title||'Sem título',function(){bridge.openNote(entry);});b.className='calendar-document';});
      (planner[selected]||[]).forEach(function(item,index){var row=el('div',list);row.className='calendar-item'+(item.completed?' is-done':'');if(item.type==='task'){var check=button(row,item.completed?'✓':'○',function(){var next=JSON.parse(JSON.stringify(planner));next[selected][index].completed=!item.completed;if(savePlanner(next)){renderCalendar();}});check.setAttribute('aria-label',(item.completed?'Desmarcar: ':'Concluir: ')+item.text);check.setAttribute('aria-pressed',item.completed?'true':'false');}el('span',row,item.text);var remove=button(row,'×',function(){var next=JSON.parse(JSON.stringify(planner));next[selected].splice(index,1);if(savePlanner(next)){renderCalendar();byId('calendar-day-heading').focus();}});remove.setAttribute('aria-label','Remover do calendário: '+item.text);});
      if(!list.childNodes.length){el('p',list,'Nenhuma anotação neste dia.').className='quiet';}
    }
    function renderCalendar(){
      var model=E.calendarMonth(year,month),grid=byId('calendar-grid'),nav=byId('calendar-months'),row=null,j,todayKey=E.calendarKey(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());
      text(byId('calendar-month'),E.calendarMonths[month]+' '+year);grid.textContent='';nav.textContent='';
      E.calendarMonths.forEach(function(name,index){var b=button(nav,name.slice(0,3),function(){month=index;selected=E.calendarKey(year,month,1);renderCalendar();});b.setAttribute('aria-pressed',index===month?'true':'false');});
      for(j=0;j<Math.ceil((model.first+model.days)/7)*7;j+=1){if(j%7===0){row=el('tr',grid);}var cell=el('td',row),day=j-model.first+1;if(day>=1&&day<=model.days){(function(d){var key=E.calendarKey(year,month,d),has=(planner[key]||[]).length||calendarDocs.some(function(entry){return docKey(entry)===key;}),b=button(cell,String(d),function(){selected=key;renderCalendar();byId('calendar-day-heading').focus();});b.setAttribute('aria-label',d+' de '+E.calendarMonths[month]+(has?', com registros':''));b.setAttribute('aria-pressed',key===selected?'true':'false');if(key===todayKey){b.setAttribute('aria-current','date');}if(has){b.className='has-activity';}if(model.dates[key.slice(5)]){b.setAttribute('title',model.dates[key.slice(5)]);}}(day));}}
      text(byId('calendar-moons'),'Lua · estimativa: '+model.moons.map(function(phase){return phase.day+' '+phase.name.toLowerCase();}).join(' · '));renderDay();
    }
    function move(delta){var next=new Date(year,month+delta,1);if(next.getFullYear()<1900||next.getFullYear()>2100){return;}year=next.getFullYear();month=next.getMonth();selected=E.calendarKey(year,month,1);renderCalendar();}
    on(byId('calendar-prev'),'click',function(){move(-1);});on(byId('calendar-next'),'click',function(){move(1);});on(byId('calendar-year-prev'),'click',function(){move(-12);});on(byId('calendar-year-next'),'click',function(){move(12);});
    on(byId('calendar-today'),'click',function(){var date=new Date();year=date.getFullYear();month=date.getMonth();selected=E.calendarKey(year,month,date.getDate());renderCalendar();});
    on(byId('calendar-form'),'submit',function(event){event.preventDefault();var value=byId('calendar-text').value.replace(/^\s+|\s+$/g,'');if(!value){return;}var next=JSON.parse(JSON.stringify(planner));if(!next[selected]){next[selected]=[];}next[selected].push({id:Date.now()+'-'+Math.random().toString(36).slice(2,8),text:value.slice(0,500),type:byId('calendar-kind').value==='note'?'note':'task',completed:false});if(savePlanner(next)){byId('calendar-text').value='';renderCalendar();byId('calendar-text').focus();}});
    on(byId('calendar-export'),'click',function(){if(plannerValid){bridge.download(JSON.stringify(planner,null,2),'application/json','escrevaral-calendario.json');}});
    on(byId('calendar-import'),'change',function(){
      var file=this.files&&this.files[0];if(!file){return;}if(file.size>1000000||!root.FileReader){text(byId('calendar-status'),'Traga um calendário JSON de até 1 MB.');return;}
      var reader=new root.FileReader();reader.onerror=function(){text(byId('calendar-status'),'Não foi possível ler o arquivo.');};reader.onload=function(){
        try{var incoming=JSON.parse(reader.result);if(!E.validPlanner(incoming)){throw new Error('invalid');}var next=JSON.parse(JSON.stringify(planner));Object.keys(incoming).forEach(function(day){if(!next[day]){next[day]=[];}incoming[day].forEach(function(item){if(!next[day].some(function(current){return String(current.id)===String(item.id)&&current.text===item.text&&current.type===item.type;})){next[day].push(item);}});});if(savePlanner(next)){renderCalendar();text(byId('calendar-status'),'Calendário trazido. Registros anteriores preservados.');}}
        catch(e){text(byId('calendar-status'),'O arquivo não contém um calendário válido. Os registros anteriores permanecem.');}
      };reader.readAsText(file,'UTF-8');this.value='';
    });
    function open(kind){
      if(!bridge.checkpoint()){return;}bridge.hideStart();['pomodoro','calculator','calendar'].forEach(function(name){byId(name+'-panel').hidden=name!==kind;});
      byId('utilidades').setAttribute('data-tool',kind);text(byId('utility-heading'),kind==='pomodoro'?'Pomodoro':kind==='calculator'?'Calculadora':'Calendário');
      if(kind==='calendar'){loadPlanner();try{calendarDocs=bridge.documents();}catch(e){calendarDocs=[];text(byId('calendar-status'),'Não foi possível ler as folhas.');}renderCalendar();}
      bridge.show('utilidades','start-'+kind);if(kind==='calculator'){calc.focus();}else{byId('utilidades').focus();}paintTimer();
    }
    on(byId('utility-close'),'click',function(){bridge.close();});
    ['pomodoro','calculator','calendar'].forEach(function(kind){on(byId('start-'+kind),'click',function(){open(kind);});});
    if(state.mode==='work'){status(state.paused?'Contagem pausada.':'Tempo de escrita em andamento.');}
    paintTimer();if(state.mode==='break'||state.mode==='ready'){if(bridge.checkpoint()){showFocus();}}tick();
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/storage/universo.js */
/* Universo do caderno: ES5, dados locais e vínculos estáveis. */
(function (root) {
  'use strict';
  var E = root.Escr;
  function copy(v) { return JSON.parse(JSON.stringify(v)); }
  function arr(v) { return Object.prototype.toString.call(v) === '[object Array]'; }
  function id(v) { return typeof v === 'string' && /^[a-z0-9-]+$/.test(v); }
  function str(v, n) { return typeof v === 'string' && v.length <= n; }
  function ids(v) { return arr(v) && v.length <= 5000 && v.every(id) && v.every(function (x, i) { return v.indexOf(x) === i; }); }
  function empty() { return { version:1, characters:[], settings:[], scenes:[], chapters:[] }; }
  function valid(s) {
    if (!s || s.version !== 1 || !arr(s.characters) || !arr(s.settings) || !arr(s.scenes) || !arr(s.chapters)) { return false; }
    var seen = Object.create(null), characters = Object.create(null), settings = Object.create(null), chapters = Object.create(null);
    function unique(x) { if (!x || !id(x.id) || seen[x.id]) { return false; } seen[x.id] = true; return true; }
    function card(x) { return unique(x) && str(x.name,120) && !!x.name.replace(/\s/g,'') && str(x.description,4000); }
    if (s.characters.length > 5000 || s.settings.length > 5000 || s.scenes.length > 10000 || s.chapters.length > 10000) { return false; }
    if (!s.characters.every(function(x){if(!card(x)){return false;}characters[x.id]=true;return true;}) || !s.settings.every(function(x){if(!card(x)){return false;}settings[x.id]=true;return true;})) { return false; }
    function refs(x) { return ids(x.characters) && x.characters.every(function(k){return !!characters[k];}) && ids(x.settings) && x.settings.every(function(k){return !!settings[k];}); }
    return s.scenes.every(function(x){return unique(x) && str(x.title,120) && !!x.title.replace(/\s/g,'') && str(x.summary,4000) && str(x.when,120) && (x.chapter === '' || id(x.chapter)) && refs(x);}) && s.chapters.every(function(x){if(!x || !id(x.noteId) || chapters[x.noteId] || !refs(x)){return false;}chapters[x.noteId]=true;return true;});
  }
  function read(data) { var s = data.story; if (typeof s === 'undefined') { return empty(); } if (!valid(s)) { throw new Error('Não foi possível ler as fichas deste caderno. Os dados foram preservados.'); } return copy(s); }
  function remap(s, mapping) { var next=copy(s); next.chapters.forEach(function(x){x.noteId=mapping[x.noteId]||x.noteId;});next.scenes.forEach(function(x){x.chapter=mapping[x.chapter]||x.chapter;});return next; }
  function remove(s, kind, key) {
    var next=copy(s); next[kind]=next[kind].filter(function(x){return x.id!==key;});
    if(kind==='characters'||kind==='settings'){next.scenes.concat(next.chapters).forEach(function(x){x[kind]=x[kind].filter(function(k){return k!==key;});});}
    return next;
  }
  function members(s, noteId, kind) { var found=[];s.chapters.filter(function(x){return x.noteId===noteId;}).concat(s.scenes.filter(function(x){return x.chapter===noteId;})).forEach(function(x){x[kind].forEach(function(k){if(found.indexOf(k)<0){found.push(k);}});});return s[kind].filter(function(x){return found.indexOf(x.id)>=0;}); }
  E.story = { empty:empty, valid:valid, read:read, remap:remap, remove:remove, members:members };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/dialogos.js */
/* Confirmação ES5: continuação explícita, sem substituir window.confirm. */
(function (root) {
 'use strict';
 var E=root.Escr,D=root.document,layer=D.getElementById('app-dialog'),card=layer.querySelector('.app-dialog-card');
 var cancel=D.getElementById('app-dialog-cancel'),accept=D.getElementById('app-dialog-accept');
 var pending=null,previous=null,hidden=[];
 function visible(n){return n&&D.documentElement.contains(n)&&n.getClientRects().length&&!n.disabled;}
 function disclosureFor(n){var p=n&&n.parentNode;return p&&p.id?D.querySelector('[aria-controls="'+p.id+'"]'):null;}
 function fit(){
  if(layer.hidden){return;}
  var v=root.visualViewport,h=v?v.height:root.innerHeight,y=v?v.offsetTop:0;
  layer.style.top=y+'px';layer.style.height=h+'px';layer.style.bottom='auto';
  layer.style.paddingTop=Math.max(16,Math.floor((h-card.offsetHeight)/2))+'px';
 }
 function finish(ok){
  if(!pending){return;}
  var done=pending;pending=null;layer.hidden=true;
  hidden.forEach(function(p){if(p[1]===null){p[0].removeAttribute('aria-hidden');}else{p[0].setAttribute('aria-hidden',p[1]);}});
  hidden=[];
  var returnTo=visible(previous)?previous:disclosureFor(previous);
  if(visible(returnTo)){returnTo.focus();}else{D.getElementById('os-start').focus();}
  previous=null;done(ok);
 }
 E.dialog={
  isOpen:function(){return !!pending;},
  ask:function(options,done){
   if(pending){done(false);return;}
   if(D.body.getAttribute('data-locked')==='true'){done(false);return;}
   previous=D.activeElement;pending=done;
   D.getElementById('app-dialog-heading').textContent=options.title||'Confirmar ação';
   D.getElementById('app-dialog-message').textContent=options.message;
   accept.textContent=options.accept||'Confirmar';
   layer.hidden=false;fit();layer.scrollTop=0;cancel.focus();
   hidden=[];
   for(var i=0;i<D.body.children.length;i+=1){
    var n=D.body.children[i];
    if(n!==layer&&n.tagName!=='SCRIPT'&&n.tagName!=='STYLE'){
     hidden.push([n,n.getAttribute('aria-hidden')]);n.setAttribute('aria-hidden','true');
    }
   }
  }
 };
 /* Captura no window: o diálogo tem precedência sobre os atalhos do app e do universo. */
 function trap(e){
  if(!pending){return;}
  var inside=card.contains(e.target),key=e.keyCode;
  if(e.type==='focusin'){
   if(!inside){e.stopImmediatePropagation();cancel.focus();}return;
  }
  if(e.type==='keydown'){
   e.stopImmediatePropagation();
   if(key===27){e.preventDefault();finish(false);return;}
   if(key===9){e.preventDefault();(D.activeElement===cancel?accept:cancel).focus();return;}
   if(key===13||key===32){e.preventDefault();if(D.activeElement===accept){finish(true);}else if(D.activeElement===cancel){finish(false);}return;}
   if(e.ctrlKey||e.metaKey){e.preventDefault();}return;
  }
  if(e.type==='click'){
   e.preventDefault();e.stopImmediatePropagation();
   if(e.target===cancel){finish(false);}else if(e.target===accept){finish(true);}return;
  }
  if(!inside){e.preventDefault();e.stopImmediatePropagation();}
  else if(e.type==='keyup'||e.type==='keypress'){e.stopImmediatePropagation();}
 }
 ['keydown','keyup','keypress','click','dblclick','mousedown','touchstart','focusin'].forEach(function(k){root.addEventListener(k,trap,true);});
 root.addEventListener('resize',fit,false);
 if(root.visualViewport){root.visualViewport.addEventListener('resize',fit,false);root.visualViewport.addEventListener('scroll',fit,false);}
}(window));

;
/* Fonte: src/ui/universo.js */
/* Apresentação do universo: apenas a consulta aberta ocupa o DOM. */
(function (root) {
 'use strict';
 root.Escr.mountFinish = function (bridge) {
  var E=root.Escr, D=root.document, panel=D.getElementById('story-screen'), curtain=D.getElementById('lock-curtain'), book=null, story=null, docs=[], mode='chapters', page=0, revision='', editing=null, returnFocus=null, lockFocus=null, hiddenNodes=[], metrics=Object.create(null), locked=false;
  function byId(k){return D.getElementById(k);}
  function text(n,v){n.textContent=String(v);}
  function on(n,k,fn){n.addEventListener(k,fn,false);}
  function el(tag,parent,value,cl){var n=D.createElement(tag);if(typeof value!=='undefined'){text(n,value);}if(cl){n.className=cl;}parent.appendChild(n);return n;}
  function button(parent,label,fn,cl){var b=el('button',parent,label,cl);b.type='button';on(b,'click',fn);return b;}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function key(d){return d.noteId||d.id;}
  function named(list){return list.map(function(x){return x.name;}).join(', ');}
  function getDoc(noteId){for(var i=0;i<docs.length;i+=1){if(key(docs[i])===noteId){return docs[i];}}return null;}
  function current(){var b=bridge.book();if(!b||!book||b.id!==book.id){throw new Error('O caderno mudou. Feche esta consulta e abra novamente.');}return b;}
  function reload(){book=current();story=E.story.read(book.data);revision=JSON.stringify(story);docs=bridge.documents();var live=Object.create(null);docs.forEach(function(d){live[d.id]=true;});Object.keys(metrics).forEach(function(k){if(!live[k]){delete metrics[k];}});}
  function save(next){
   try {var b=current();if(JSON.stringify(E.story.read(b.data))!==revision){throw new Error('As fichas mudaram em outra aba. Seu formulário permanece aqui; reabra a consulta antes de guardar.');}if(!E.story.valid(next)){throw new Error('Confira os campos e os vínculos.');}b.data.story=next;bridge.save(b);story=next;book=b;revision=JSON.stringify(next);return true;}
   catch(e){text(byId('story-form-status'),e.message);text(byId('story-status'),e.message);return false;}
  }
  function formVisible(show){byId('story-editor').hidden=!show;byId('story-list').hidden=show;byId('story-actions').hidden=show;byId('story-pagination').hidden=show;byId('story-chapters').disabled=byId('story-events').disabled=byId('story-records').disabled=show;}
  function cancelEdit(){editing=null;formVisible(false);byId('story-form').textContent='';render();panel.focus();}
  function closeNow(){panel.hidden=true;editing=null;byId('story-form').textContent='';byId('story-list').textContent='';docs=[];if(returnFocus&&D.documentElement.contains(returnFocus)&&returnFocus.getClientRects().length){returnFocus.focus();}else{byId('os-start').focus();}return true;}
  function discardEdit(done){var pendingEdit=editing;E.dialog.ask({title:'Descartar alterações?',message:'As alterações desta ficha ainda não foram guardadas.',accept:'Descartar'},function(ok){if(ok&&editing===pendingEdit){done();}});}
  function close(){if(editing){discardEdit(closeNow);return false;}return closeNow();}
  function open(){if(!bridge.checkpoint()){return;}var b=bridge.book();if(!b){bridge.message('Abra um caderno para consultar capítulos, acontecimentos e fichas.');return;}try{story=E.story.read(b.data);}catch(e){bridge.message(e.message);return;}returnFocus=D.activeElement;bridge.prepare();book=b;mode='chapters';page=0;editing=null;reload();panel.hidden=false;formVisible(false);text(byId('story-heading'),book.name);render();byId('story-chapters').focus();}
  function openChapter(d){if(close()){bridge.open(d);}}
  function orderedDocs(){var order=story.chapters.map(function(x){return x.noteId;});return docs.slice().sort(function(a,b){var ai=order.indexOf(key(a)),bi=order.indexOf(key(b));if(ai>=0||bi>=0){return (ai<0?order.length:ai)-(bi<0?order.length:bi);}return Date.parse(a.created||a.updated)-Date.parse(b.created||b.updated);});}
  function count(d){if(!metrics[d.id]){metrics[d.id]=E.countManuscript(d.text||'');}return metrics[d.id].words;}
  function shift(kind, itemId, delta){var next=clone(story),list=kind==='chapters'?orderedDocs().map(function(d){return next.chapters.filter(function(x){return x.noteId===key(d);})[0]||{noteId:key(d),characters:[],settings:[]};}):next.scenes;var at=-1;list.forEach(function(x,i){if((x.noteId||x.id)===itemId){at=i;}});if(at<0||at+delta<0||at+delta>=list.length){return;}var item=list.splice(at,1)[0];list.splice(at+delta,0,item);next[kind]=list;if(save(next)){render();panel.focus();}}
  function reorder(parent,kind,k,index,length){var prev=button(parent,'← Antes',function(){shift(kind,k,-1);});prev.disabled=index===0;prev.setAttribute('aria-label','Mover para antes');var next=button(parent,'Depois →',function(){shift(kind,k,1);});next.disabled=index===length-1;next.setAttribute('aria-label','Mover para depois');}
  function chapterCard(list,d,index,total,max){
   var card=el('article',list,undefined,'polaroid'),open=button(card,'',function(){openChapter(d);},'story-open');el('small',open,'CAPÍTULO '+(index<9?'0':'')+(index+1));el('h3',open,d.title||'Sem título');el('p',open,(d.text||'').slice(0,240)||'Este capítulo espera suas primeiras palavras.');el('small',open,'ABRIR CAPÍTULO →');
   var meta=el('div',card,undefined,'story-meta'),words=count(d);el('div',meta,words+(words===1?' palavra · ':' palavras · ')+story.scenes.filter(function(x){return x.chapter===key(d);}).length+(story.scenes.filter(function(x){return x.chapter===key(d);}).length===1?' cena':' cenas'));var meter=el('span',meta,undefined,'story-density');meter.setAttribute('aria-label','Extensão: '+words+' palavras; maior capítulo: '+max+' palavras.');el('span',meter).style.width=(max?Math.round(words/max*100):0)+'%';el('div',meta,'Personagens: '+(named(E.story.members(story,key(d),'characters'))||'nenhum vinculado'));var places=named(E.story.members(story,key(d),'settings'));if(places){el('div',meta,'Cenários: '+places);}var actions=el('div',card,undefined,'card-actions');button(actions,'Vincular fichas',function(){edit('chapters',key(d));});reorder(actions,'chapters',key(d),index,total);
  }
  function sceneCard(list,s,index,total){var card=el('article',list,undefined,'polaroid');el('small',card,(s.when||'ACONTECIMENTO '+(index+1)));el('h3',card,s.title);el('p',card,s.summary||'Sem resumo.');var meta=el('div',card,undefined,'story-meta');el('div',meta,'Personagens: '+(named(story.characters.filter(function(x){return s.characters.indexOf(x.id)>=0;}))||'nenhum vinculado'));el('div',meta,'Cenários: '+(named(story.settings.filter(function(x){return s.settings.indexOf(x.id)>=0;}))||'nenhum vinculado'));var d=getDoc(s.chapter);if(d){button(meta,d.title||'Abrir capítulo',function(){openChapter(d);});}else{el('div',meta,s.chapter?'Capítulo indisponível neste caderno':'Ainda sem capítulo');}var actions=el('div',card,undefined,'card-actions');button(actions,'Editar cena',function(){edit('scenes',s.id);});reorder(actions,'scenes',s.id,index,total);}
  function recordCard(list,x,kind){var card=el('article',list,undefined,'polaroid');el('small',card,kind==='characters'?'PERSONAGEM':'CENÁRIO');el('h3',card,x.name);el('p',card,x.description||'Sem descrição.');button(card,'Editar ficha',function(){edit(kind,x.id);});}
  function render(){
   if(panel.hidden){return;}var list=byId('story-list'),actions=byId('story-actions'),pagination=byId('story-pagination');list.textContent='';actions.textContent='';pagination.textContent='';list.setAttribute('data-mode',mode);['chapters','events','records'].forEach(function(k){byId('story-'+k).setAttribute('aria-pressed',k===mode?'true':'false');});
   var all=mode==='chapters'?orderedDocs():mode==='events'?story.scenes:story.characters.map(function(x){return {item:x,kind:'characters'};}).concat(story.settings.map(function(x){return {item:x,kind:'settings'};}));var pageSize=12;page=Math.min(page,Math.max(0,Math.ceil(all.length/pageSize)-1));var start=page*pageSize;
   text(byId('story-status'),mode==='chapters'?'Extensão dos capítulos · comparação por palavras.':mode==='events'?'Ordem dos acontecimentos da história · independente da ordem dos capítulos.':'Fichas deste caderno · selecione seus nomes nos capítulos e cenas.');
   if(mode==='events'){button(actions,'+ Nova cena',function(){edit('scenes');});}else if(mode==='records'){button(actions,'+ Personagem',function(){edit('characters');});button(actions,'+ Cenário',function(){edit('settings');});}
   if(!all.length){el('p',list,mode==='chapters'?'Crie uma folha no caderno. Seu título aparecerá aqui.':mode==='events'?'Cadastre a primeira cena para começar a cronologia.':'Cadastre personagens e cenários para vincular à sua história.','story-empty');}
   var max=0;if(mode==='chapters'){all.forEach(function(d){max=Math.max(max,count(d));});}
   all.slice(start,start+pageSize).forEach(function(x,i){if(mode==='chapters'){chapterCard(list,x,start+i,all.length,max);}else if(mode==='events'){sceneCard(list,x,start+i,all.length);}else{recordCard(list,x.item,x.kind);}});
   if(all.length>pageSize){var previous=button(pagination,'← Anteriores',function(){page-=1;render();panel.scrollTop=0;panel.focus();});previous.disabled=page===0;el('span',pagination,' '+(page+1)+' / '+Math.ceil(all.length/pageSize)+' ');var next=button(pagination,'Próximos →',function(){page+=1;render();panel.scrollTop=0;panel.focus();});next.disabled=start+pageSize>=all.length;}
  }
  function field(form,label,name,value,multiline,max){var wrap=el('label',form,label),input=el(multiline?'textarea':'input',wrap);input.name=name;input.id='story-field-'+name;input.value=value||'';input.maxLength=max||120;return input;}
  function tags(form,kind,values){var set=el('fieldset',form);el('legend',set,kind==='characters'?'Personagens':'Cenários');if(!story[kind].length){el('p',set,'Cadastre primeiro em Fichas.');}story[kind].forEach(function(x){var label=el('label',set,undefined,'story-tag'),input=el('input',label);input.type='checkbox';input.name=kind;input.value=x.id;input.checked=values.indexOf(x.id)>=0;el('span',label,x.name);});}
  function edit(kind,k){
   editing={kind:kind,id:k||null};var form=byId('story-form'),item=kind==='chapters'?story.chapters.filter(function(x){return x.noteId===k;})[0]:story[kind].filter(function(x){return x.id===k;})[0];item=item||{};form.textContent='';text(byId('story-form-status'),'');text(byId('story-editor-heading'),kind==='characters'?'Ficha de personagem':kind==='settings'?'Ficha de cenário':kind==='scenes'?'Cena':'Fichas do capítulo');formVisible(true);
   if(kind==='characters'||kind==='settings'){field(form,'Nome','name',item.name).required=true;field(form,'Descrição (opcional)','description',item.description,true,4000);}
   if(kind==='scenes'){field(form,'Título da cena','title',item.title).required=true;field(form,'Resumo (opcional)','summary',item.summary,true,4000);field(form,'Quando na história (opcional)','when',item.when);var label=el('label',form,'Capítulo'),select=el('select',label);select.name='chapter';select.id='story-field-chapter';var opt=el('option',select,'Ainda sem capítulo');opt.value='';orderedDocs().forEach(function(d){var option=el('option',select,d.title||'Sem título');option.value=key(d);});select.value=getDoc(item.chapter)?item.chapter:'';}
   if(kind==='scenes'||kind==='chapters'){tags(form,'characters',item.characters||[]);tags(form,'settings',item.settings||[]);}
   var submit=el('button',form,'Guardar');submit.type='submit';submit.className='material-key';button(form,'Cancelar',cancelEdit);
   if(k&&kind!=='chapters'){button(form,'Excluir ficha',function(){E.dialog.ask({title:'Excluir ficha?',message:'Este registro e seus vínculos serão excluídos. O texto dos capítulos será preservado.',accept:'Excluir ficha'},function(ok){if(ok&&save(E.story.remove(story,kind,k))){cancelEdit();}});});}
   var first=form.querySelector('input,select,textarea,button');if(first){first.focus();}
  }
  on(byId('story-form'),'submit',function(event){event.preventDefault();if(!editing){return;}var form=this,kind=editing.kind,next=clone(story),item={},k=editing.id;
   function value(name){var n=form.querySelector('[name="'+name+'"]');return n?n.value.replace(/^\s+|\s+$/g,''):'';}
   if(kind==='characters'||kind==='settings'){item={id:k||('entity-'+E.freshDocument().id),name:value('name'),description:value('description')};}
   else {item=kind==='chapters'?{noteId:k}:{id:k||('scene-'+E.freshDocument().id),title:value('title'),summary:value('summary'),when:value('when'),chapter:value('chapter')};['characters','settings'].forEach(function(t){var checks=form.querySelectorAll('input[name="'+t+'"]'),j;item[t]=[];for(j=0;j<checks.length;j+=1){if(checks[j].checked){item[t].push(checks[j].value);}}});}
   var found=false;next[kind]=next[kind].map(function(x){if((x.id||x.noteId)===k){found=true;return item;}return x;});if(!found){next[kind].push(item);}if(save(next)){cancelEdit();text(byId('story-status'),'Guardado neste caderno.');}
  });
  ['chapters','events','records'].forEach(function(k){on(byId('story-'+k),'click',function(){try{reload();mode=k;page=0;render();}catch(e){text(byId('story-status'),e.message);}});});
  on(byId('story-close'),'click',close);on(byId('start-universe'),'click',open);on(byId('notebook-universe'),'click',open);
  var LOCK_HINT_KEY = 'escrevaral.lock.hintHidden';
  function isHintHidden(){try{return root.localStorage&&root.localStorage.getItem(LOCK_HINT_KEY)==='1';}catch(ignore){return false;}}
  function syncLockHint(){var w=byId('lock-hint-wrap');if(w){w.hidden=isHintHidden();}}
  function lock(){if(!bridge.checkpoint()){return;}lockFocus=D.activeElement;bridge.prepareLock();locked=true;D.body.setAttribute('data-locked','true');text(byId('keychain-name'),(bridge.book()||{}).name||'ESCREVARAL');byId('lock-password').value='';text(byId('lock-message'),'');syncLockHint();curtain.hidden=false;hiddenNodes=[];for(var i=0;i<D.body.children.length;i+=1){var n=D.body.children[i];if(n!==curtain&&n.tagName!=='SCRIPT'){hiddenNodes.push([n,n.getAttribute('aria-hidden')]);n.setAttribute('aria-hidden','true');}}try{root.sessionStorage.setItem('escrevaral.curtain','on');}catch(ignore){}byId('keychain-ring').focus();}
  function unlock(){locked=false;curtain.hidden=true;D.body.removeAttribute('data-locked');hiddenNodes.forEach(function(p){if(p[1]===null){p[0].removeAttribute('aria-hidden');}else{p[0].setAttribute('aria-hidden',p[1]);}});hiddenNodes=[];byId('lock-password').value='';try{root.sessionStorage.removeItem('escrevaral.curtain');}catch(ignore){}if(lockFocus&&D.documentElement.contains(lockFocus)){lockFocus.focus();}}
  on(byId('screen-lock'),'click',lock);on(byId('keychain-ring'),'click',unlock);
  if(byId('lock-hide-hint')){on(byId('lock-hide-hint'),'click',function(){try{if(root.localStorage){root.localStorage.setItem(LOCK_HINT_KEY,'1');}}catch(ignore){}syncLockHint();text(byId('lock-message'),'');byId('keychain-ring').focus();});}
  on(byId('lock-form'),'submit',function(e){e.preventDefault();byId('lock-password').value='';text(byId('lock-message'),isHintHidden()?'Senha incorreta.':'Para abrir, toque ou clique na argola do chaveiro.');});
  /* Captura antes dos atalhos existentes; sem inert/dialog obrigatórios. */
  function trap(event){if(E.dialog.isOpen()){return;}var modal=locked?curtain:!panel.hidden?panel:null;if(!modal){return;}var inside=modal.contains(event.target);
   if(!inside){event.preventDefault();event.stopImmediatePropagation();if(event.type==='focusin'){(locked?byId('keychain-ring'):byId('story-close')).focus();}return;}
   if(event.type==='keydown'){
    event.stopPropagation();var code=event.keyCode;
    if(code===27){event.preventDefault();if(!locked){if(editing){discardEdit(cancelEdit);}else{close();}}}
    if(code===9){D.body.setAttribute('data-input','keyboard');var nodes=modal.querySelectorAll('button,input,select,textarea,[tabindex="0"]'),items=[],j;for(j=0;j<nodes.length;j+=1){if(!nodes[j].disabled&&nodes[j].getClientRects().length){items.push(nodes[j]);}}var first=items[0],last=items[items.length-1];if(event.shiftKey&&(D.activeElement===first||D.activeElement===modal)){event.preventDefault();last.focus();}else if(!event.shiftKey&&(D.activeElement===last||D.activeElement===modal)){event.preventDefault();first.focus();}}
    if((event.ctrlKey||event.metaKey)&&[13,75,83].indexOf(code)>=0){event.preventDefault();}
   }
  }
  ['keydown','keypress','keyup','click','dblclick','mousedown','touchstart','focusin'].forEach(function(k){D.addEventListener(k,trap,true);});
  on(root,'storage',function(e){if(e.key==='escrevaral.astra.notebooks.v1'&&!panel.hidden){text(byId('story-status'),'O caderno mudou em outra aba. Reabra a consulta para atualizar.');}});
  try{if(root.sessionStorage.getItem('escrevaral.curtain')==='on'){lock();}}catch(ignore){}
 };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/storage/quadro.js */
/* Quadro do caderno: dados ES5, tamanho limitado e gravação por revisão. */
(function(root){
 'use strict';
 var E=root.Escr,types=['fino','giz','grosso','borracha'];
 function arr(v){return Object.prototype.toString.call(v)==='[object Array]';}
 function copy(v){return JSON.parse(JSON.stringify(v));}
 function empty(){return {version:1,grid:false,strokes:[]};}
 function valid(v){
  if(!v||v.version!==1||typeof v.grid!=='boolean'||!arr(v.strokes)||v.strokes.length>500){return false;}
  var count=0;
  return v.strokes.every(function(s){
   if(!s||types.indexOf(s.tool)<0||!arr(s.points)||!s.points.length||s.points.length>2048){return false;}
   count+=s.points.length;if(count>12000){return false;}
   return s.points.every(function(p){return arr(p)&&p.length===2&&p.every(function(n){return typeof n==='number'&&isFinite(n)&&n>=0&&n<=10000&&Math.floor(n)===n;});});
  });
 }
 function clean(v){return {version:1,grid:v.grid,strokes:v.strokes.map(function(s){return {tool:s.tool,points:s.points.map(function(p){return [p[0],p[1]];})};})};}
 function read(data){if(typeof data.chalk==='undefined'){return empty();}if(!valid(data.chalk)){throw new Error('Este quadro não pôde ser lido. Os dados foram preservados.');}return clean(data.chalk);}
 function write(model,id,revision,next){
  if(!valid(next)){throw new Error('O desenho ultrapassou os limites do quadro ou contém dados inválidos.');}
  var b=model.get(id);if(!b||b.trashed){throw new Error('Este caderno não está disponível. Baixe seu desenho antes de fechar.');}
  if(JSON.stringify(read(b.data))!==revision){throw new Error('O quadro mudou em outra aba. Baixe seu desenho antes de fechar e reabrir.');}
  b.data.chalk=clean(next);model.update(id,{data:b.data});return JSON.stringify(b.data.chalk);
 }
 function pack(title,drawing){if(!valid(drawing)){throw new Error('Desenho inválido.');}return JSON.stringify({format:'escrevaral-giz',version:1,notebook:String(title).slice(0,120),drawing:clean(drawing)});}
 function parse(raw){if(typeof raw!=='string'||raw.length>524288){throw new Error('O arquivo é grande demais para este quadro.');}var p=JSON.parse(raw);if(!p||p.format!=='escrevaral-giz'||p.version!==1||!valid(p.drawing)){throw new Error('Este arquivo não é um desenho válido do Escrevaral.');}return clean(p.drawing);}
 E.chalk={empty:empty,valid:valid,read:read,write:write,pack:pack,parse:parse,copy:copy,types:types,maxStrokes:500,maxPoints:12000,maxStrokePoints:2048};
}(typeof window!=='undefined'?window:this));

;
/* Fonte: src/ui/quadro.js */
/* Quadro aberto: Canvas 2D sob demanda; Pointer OU mouse/toque. */
(function(root){
 'use strict';
 root.Escr.mountChalk=function(bridge){
  var E=root.Escr,C=E.chalk,D=root.document,panel=D.getElementById('chalkboard'),canvas=D.getElementById('chalk-canvas'),frame=D.getElementById('chalk-frame');
  var ctx=null,book=null,drawing=null,revision='',dirty=false,stroke=null,pointer=null,tool='giz',total=0,previous=null,hidden=[],resizeTimer=null,reader=null,epoch=0,lastTouch=0,kpos=[5000,5000],keyboard=false;
  function byId(id){return D.getElementById(id);}
  function on(n,k,f){n.addEventListener(k,f,false);}
  function status(t){byId('chalk-status').textContent=t;fit();}
  function active(){return !panel.hidden;}
  function blocked(){return E.dialog.isOpen()||D.body.getAttribute('data-locked')==='true';}
  function count(){total=0;drawing.strokes.forEach(function(s){total+=s.points.length;});}
  function controls(){
   C.types.forEach(function(t){byId('chalk-'+t).setAttribute('aria-pressed',tool===t?'true':'false');});
   byId('chalk-grid').setAttribute('aria-pressed',drawing.grid?'true':'false');frame.setAttribute('data-grid',drawing.grid?'true':'false');
   byId('chalk-count').textContent=drawing.strokes.length+(drawing.strokes.length===1?' traço':' traços');
   byId('chalk-undo').disabled=byId('chalk-clear').disabled=!drawing.strokes.length;
   byId('chalk-retry').hidden=byId('chalk-discard').hidden=!dirty;
   if(tool!=='borracha'){byId('chalk-pen').value=tool;}fit();
  }
  function paint(s,from){
   if(!ctx){return;}
   var w=canvas.width,h=canvas.height,points=s.points,p=points[from||0],size={fino:1.5,giz:3.5,grosso:7.5,borracha:24}[s.tool],ink=D.body.getAttribute('data-theme')==='escuro'?'#dce5da':'#192019';
   ctx.globalCompositeOperation=s.tool==='borracha'?'destination-out':'source-over';ctx.lineWidth=Math.max(s.tool==='borracha'?6:1,size*w/1000);ctx.strokeStyle=ink;ctx.fillStyle=ink;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
   if(points.length===1){ctx.arc(p[0]*w/10000,p[1]*h/10000,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();}
   else{ctx.moveTo(p[0]*w/10000,p[1]*h/10000);for(var i=(from||0)+1;i<points.length;i+=1){p=points[i];ctx.lineTo(p[0]*w/10000,p[1]*h/10000);}ctx.stroke();}
   ctx.globalCompositeOperation='source-over';
  }
  function redraw(){if(!ctx||!drawing){return;}ctx.clearRect(0,0,canvas.width,canvas.height);drawing.strokes.forEach(function(s){paint(s,0);});}
  function fit(){
   if(!active()){return;}var v=root.visualViewport,viewHeight=v?v.height:root.innerHeight;
   panel.style.top=(v?v.offsetTop:0)+'px';panel.style.bottom='auto';panel.style.height=viewHeight+'px';panel.setAttribute('data-short',viewHeight<=450?'true':'false');
   var slate=frame.parentNode,style=root.getComputedStyle(slate),spaceW=slate.clientWidth-(parseFloat(style.paddingLeft)||0)-(parseFloat(style.paddingRight)||0),spaceH=slate.clientHeight-(parseFloat(style.paddingTop)||0)-(parseFloat(style.paddingBottom)||0);
   var displayWidth=Math.max(1,Math.floor(spaceW-2)),displayHeight=Math.max(1,Math.floor(spaceH-2));
   frame.style.width=(displayWidth+2)+'px';frame.style.height=(displayHeight+2)+'px';canvas.style.width=displayWidth+'px';canvas.style.height=displayHeight+'px';
   var width=Math.min(1600,displayWidth),height=Math.max(1,Math.round(width*(displayHeight/displayWidth)));
   if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;redraw();}
  }
  function save(){
   if(!dirty){return true;}
   try{
    var current=bridge.book();if(!current||current.id!==book.id){throw new Error('O caderno mudou. Baixe seu desenho antes de fechar.');}
    revision=bridge.save(book.id,revision,drawing);dirty=false;status('Guardado neste caderno.');controls();return true;
   }catch(e){status(e.name==='QuotaExceededError'?'Faltou espaço para guardar. Seu desenho continua aqui. Baixe uma cópia ou tente guardar novamente.':e.message||'Não foi possível guardar. Baixe uma cópia antes de fechar.');controls();return false;}
  }
  function end(){var had=!!stroke;stroke=null;pointer=null;keyboard=false;if(had){save();controls();}return !dirty;}
  function flush(){if(!active()){return true;}end();return save();}
  function begin(p,type){
   if(!ctx||!active()||blocked()||stroke){return false;}
   if(total>=C.maxPoints||drawing.strokes.length>=C.maxStrokes){status('Este quadro chegou ao limite de traços. Baixe uma cópia antes de limpar ou desfazer.');return false;}
   stroke={tool:type||tool,points:[p]};drawing.strokes.push(stroke);total+=1;dirty=true;paint(stroke,0);return true;
  }
  function move(p){
   if(!stroke){return;}var last=stroke.points[stroke.points.length-1],dx=p[0]-last[0],dy=p[1]-last[1];if(dx*dx+dy*dy<225){return;}
   if(total>=C.maxPoints||stroke.points.length>=C.maxStrokePoints){end();status('O traço chegou ao limite. Continue em um novo traço ou baixe uma cópia.');return;}
   stroke.points.push(p);total+=1;paint(stroke,stroke.points.length-2);
  }
  function point(event){var r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(10000,Math.round((event.clientX-r.left)/r.width*10000))),Math.max(0,Math.min(10000,Math.round((event.clientY-r.top)/r.height*10000)))];}
  function restore(){hidden.forEach(function(p){if(p[1]===null){p[0].removeAttribute('aria-hidden');}else{p[0].setAttribute('aria-hidden',p[1]);}});hidden=[];}
  function closeNow(){
   epoch+=1;if(reader&&reader.readyState===1){reader.abort();}reader=null;root.clearTimeout(resizeTimer);resizeTimer=null;
   panel.hidden=true;restore();stroke=null;pointer=null;dirty=false;drawing=null;book=null;ctx=null;canvas.width=canvas.height=1;
   byId('chalk-copy').value='';byId('chalk-copy').hidden=true;byId('chalk-copy-close').hidden=true;byId('chalk-cursor').hidden=true;
   if(previous&&D.documentElement.contains(previous)&&previous.getClientRects().length){previous.focus();}else{byId('os-start').focus();}previous=null;
  }
  function close(){if(flush()){closeNow();}}
  function open(){
   if(active()||blocked()||!bridge.checkpoint()){return;}
   try{var b=bridge.book();if(!b||b.trashed){bridge.message('Abra um caderno para usar seu quadro de giz.');return;}drawing=C.read(b.data);book=b;}catch(e){bridge.message(e.message);return;}
   previous=D.activeElement;bridge.prepare();revision=JSON.stringify(drawing);dirty=false;stroke=null;pointer=null;epoch+=1;panel.hidden=false;panel.scrollTop=0;
   byId('chalk-heading').textContent=book.name;byId('chalk-copy').value='';byId('chalk-copy').hidden=true;byId('chalk-copy-close').hidden=true;byId('chalk-cursor').hidden=true;tool='giz';count();controls();
   try{ctx=canvas.getContext('2d');}catch(ignore){ctx=null;}fit();redraw();status(ctx?'Pronto para desenhar.':'Este navegador não desenha em Canvas. Você pode baixar ou copiar o quadro preservado.');
   for(var i=0;i<D.body.children.length;i+=1){var n=D.body.children[i];if(n!==panel&&n.tagName!=='SCRIPT'){hidden.push([n,n.getAttribute('aria-hidden')]);n.setAttribute('aria-hidden','true');}}
   byId('chalk-close').focus();
  }
  function undo(){if(!drawing.strokes.length){return;}end();drawing.strokes.pop();count();dirty=true;redraw();save();controls();}
  C.types.forEach(function(t){on(byId('chalk-'+t),'click',function(){end();tool=t;controls();});});
  on(byId('chalk-pen'),'change',function(){end();tool=this.value;controls();});
  on(byId('chalk-copy-close'),'click',function(){byId('chalk-copy').hidden=true;this.hidden=true;canvas.focus();});
  on(byId('chalk-grid'),'click',function(){end();drawing.grid=!drawing.grid;dirty=true;controls();save();});
  on(byId('chalk-undo'),'click',undo);
  on(byId('chalk-clear'),'click',function(){end();E.dialog.ask({title:'Limpar o quadro?',message:'Todos os traços deste caderno serão apagados. Baixe uma cópia se quiser conservar o desenho.',accept:'Limpar quadro'},function(ok){if(ok&&active()){drawing.strokes=[];total=0;dirty=true;redraw();save();controls();}});});
  on(byId('chalk-retry'),'click',flush);
  on(byId('chalk-discard'),'click',function(){E.dialog.ask({title:'Descartar alterações do quadro?',message:'Os traços que não foram guardados serão descartados. O quadro já salvo no caderno será preservado.',accept:'Descartar e fechar'},function(ok){if(ok){closeNow();}});});
  on(byId('chalk-close'),'click',close);on(byId('start-chalkboard'),'click',open);on(byId('notebook-chalkboard'),'click',open);
  function textCopy(){end();byId('chalk-copy').value=C.pack(book.name,drawing);byId('chalk-copy').hidden=false;byId('chalk-copy-close').hidden=false;byId('chalk-copy').focus();byId('chalk-copy').select();status('Copie este texto inteiro para conservar o desenho.');}
  on(byId('chalk-copy-show'),'click',textCopy);
  on(byId('chalk-download'),'click',function(){end();var raw=C.pack(book.name,drawing);if(bridge.download(raw,'text/plain','quadro-'+book.id+'.giz.txt',panel)){status('Cópia preparada. Confira o arquivo salvo; os traços continuam aqui.');}else{textCopy();status('Não foi possível baixar. Copie o texto do desenho abaixo.');}});
  on(byId('chalk-import'),'change',function(){
   var file=this.files&&this.files[0],opened=epoch;this.value='';if(!file){return;}end();
   if(file.size>524288){status('O arquivo é grande demais para este quadro.');return;}if(!root.FileReader){status('Este navegador não consegue ler este arquivo.');return;}
   if(reader&&reader.readyState===1){reader.abort();}reader=new root.FileReader();
   reader.onload=function(){if(!active()||opened!==epoch){return;}var next;try{next=C.parse(String(this.result));}catch(e){status(e.message);return;}
    E.dialog.ask({title:'Trazer desenho para este caderno?',message:'O desenho do arquivo substituirá o quadro atual. Os capítulos e as fichas serão preservados.',accept:'Trazer desenho'},function(ok){if(ok&&active()&&opened===epoch){drawing=next;count();dirty=true;redraw();save();controls();}});
   };reader.onerror=function(){if(active()&&opened===epoch){status('Não foi possível ler o arquivo. O quadro foi preservado.');}};reader.readAsText(file);
  });
  if(root.PointerEvent){
   on(canvas,'pointerdown',function(e){if(e.button!==0||e.isPrimary===false||stroke){return;}e.preventDefault();canvas.focus();byId('chalk-cursor').hidden=true;if(begin(point(e),e.ctrlKey?'borracha':tool)){pointer=e.pointerId;try{canvas.setPointerCapture(pointer);}catch(ignore){}}});
   on(root,'pointermove',function(e){if(stroke&&e.pointerId===pointer){e.preventDefault();move(point(e));}});
   ['pointerup','pointercancel','lostpointercapture'].forEach(function(k){on(root,k,function(e){if(e.pointerId===pointer){end();}});});
  }else{
   on(canvas,'mousedown',function(e){if(e.button!==0||Date.now()-lastTouch<800||stroke){return;}e.preventDefault();canvas.focus();byId('chalk-cursor').hidden=true;if(begin(point(e),e.ctrlKey?'borracha':tool)){pointer='mouse';}});
   on(root,'mousemove',function(e){if(pointer==='mouse'&&stroke){e.preventDefault();move(point(e));}});on(root,'mouseup',function(){if(pointer==='mouse'){end();}});
   on(canvas,'touchstart',function(e){lastTouch=Date.now();if(e.touches.length!==1||stroke){end();return;}e.preventDefault();canvas.focus();byId('chalk-cursor').hidden=true;var t=e.touches[0];if(begin(point(t))){pointer=t.identifier;}});
   on(canvas,'touchmove',function(e){if(!stroke){return;}e.preventDefault();for(var i=0;i<e.changedTouches.length;i+=1){if(e.changedTouches[i].identifier===pointer){move(point(e.changedTouches[i]));}}});
   ['touchend','touchcancel'].forEach(function(k){on(canvas,k,function(e){lastTouch=Date.now();for(var i=0;i<e.changedTouches.length;i+=1){if(e.changedTouches[i].identifier===pointer){end();}}});});
  }
  function cursor(){var n=byId('chalk-cursor');n.hidden=false;n.style.left=kpos[0]/100+'%';n.style.top=kpos[1]/100+'%';}
  function key(e){
   var code=e.keyCode;if(code===32){e.preventDefault();if(e.repeat){return;}if(stroke){end();status(dirty?'O traço continua sem guardar.':'Traço encerrado.');}else{keyboard=begin(kpos.slice());cursor();status('Traço iniciado. Use as setas; Espaço termina.');}return;}
   if(code>=37&&code<=40){e.preventDefault();var step=e.shiftKey?300:60;kpos[0]=Math.max(0,Math.min(10000,kpos[0]+(code===37?-step:code===39?step:0)));kpos[1]=Math.max(0,Math.min(10000,kpos[1]+(code===38?-step:code===40?step:0)));if(keyboard){move(kpos.slice());}cursor();}
  }
  function trap(e){
   if(!active()||blocked()){return;}var inside=panel.contains(e.target);
   if(!inside){e.preventDefault();e.stopImmediatePropagation();if(e.type==='focusin'){byId('chalk-close').focus();}return;}
   if(e.type==='keydown'){
    e.stopPropagation();var code=e.keyCode;
    if(code===27){e.preventDefault();if(stroke){end();}else{close();}return;}
    if((e.ctrlKey||e.metaKey)&&code===90&&e.target!==byId('chalk-copy')){e.preventDefault();undo();return;}
    if((e.ctrlKey||e.metaKey)&&[13,75,83].indexOf(code)>=0){e.preventDefault();if(code===83){flush();}return;}
    if(e.target===canvas){key(e);}
    if(code===9){if(stroke){end();}var nodes=panel.querySelectorAll('button,input,select,textarea,[tabindex="0"]'),items=[];for(var j=0;j<nodes.length;j+=1){if(!nodes[j].disabled&&nodes[j].getClientRects().length){items.push(nodes[j]);}}var first=items[0],last=items[items.length-1];if(e.shiftKey&&(D.activeElement===first||D.activeElement===panel)){e.preventDefault();last.focus();}else if(!e.shiftKey&&(D.activeElement===last||D.activeElement===panel)){e.preventDefault();first.focus();}}
   }
  }
  ['keydown','keypress','keyup','click','dblclick','mousedown','touchstart','focusin'].forEach(function(k){D.addEventListener(k,trap,true);});
  function resizeBoard(){if(!active()){return;}end();root.clearTimeout(resizeTimer);resizeTimer=root.setTimeout(fit,100);}
  on(root,'resize',resizeBoard);
  if(root.visualViewport){on(root.visualViewport,'resize',resizeBoard);on(root.visualViewport,'scroll',fit);}
  on(root,'blur',function(){if(active()){end();}});
  on(root,'storage',function(e){if(e.key==='escrevaral.astra.notebooks.v1'&&active()){status('O caderno mudou em outra aba. Feche e reabra o quadro para atualizar; baixe uma cópia se houver traços pendentes.');}});
  return {flush:flush,isOpen:active};
 };
}(window));

;
/* Fonte: src/storage/pacotes.js */
/* Infraestrutura experimental de pacotes. Não abre banco até uma chamada explícita.
 * Não interpreta léxico, não baixa arquivos e nunca acessa o banco dos manuscritos. */
(function (root) {
  'use strict';
  var E = root.Escr, serial = 0;
  function error(code) { var e = new Error(code); e.code = code; return e; }
  function id(value) { return typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(value); }
  function integer(value) { return typeof value === 'number' && isFinite(value) && value >= 0 && value % 1 === 0; }
  function key(m) { return m.id + '/' + m.version; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function digest(bytes, done) {
    try {
      if (!root.crypto || !root.crypto.subtle) { done(error('INTEGRITY_UNAVAILABLE')); return; }
      root.crypto.subtle.digest('SHA-256', bytes).then(function (buffer) {
        var a = new Uint8Array(buffer), hex = '', i;
        for (i = 0; i < a.length; i += 1) { hex += ('0' + a[i].toString(16)).slice(-2); }
        done(null, hex);
      }, function () { done(error('INTEGRITY_UNAVAILABLE')); });
    } catch (e) { done(error('INTEGRITY_UNAVAILABLE')); }
  }
  E.createPackageStore = function (options) {
    options = options || {};
    var limits = options.limits, db = null, closed = false, busy = null;
    var hash = options.digest || digest;
    if (!limits || !['blockBytes','packageBytes','blocks','metadataChars'].every(function (k) { return integer(limits[k]) && limits[k] > 0; })) { throw error('LIMITS_REQUIRED'); }
    limits = clone(limits);
    function manifest(input) {
      var m = clone(input), seen = {}, total = 0;
      if (!m || typeof m !== 'object' || JSON.stringify(m).length > limits.metadataChars || m.schema !== 'scrvrl.package-stage' || m.schemaVersion !== 1 || !id(m.id) || !id(m.version) ||
          Object.prototype.toString.call(m.blocks) !== '[object Array]' || !m.blocks.length || m.blocks.length > limits.blocks ||
          Object.prototype.toString.call(m.dependencies) !== '[object Array]' || m.dependencies.length > limits.blocks) { throw error('INVALID_MANIFEST'); }
      m.blocks.forEach(function (b) {
        if (!b || !id(b.id) || seen['$'+b.id] || !integer(b.bytes) || b.bytes > limits.blockBytes || typeof b.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(b.sha256)) { throw error('INVALID_BLOCK'); }
        seen['$'+b.id] = true; total += b.bytes;
      });
      if (total > limits.packageBytes) { throw error('PACKAGE_LIMIT'); }
      seen = {};
      m.dependencies.forEach(function (d) {
        if (!d || !id(d.id) || !id(d.version) || d.id === m.id || seen['$'+d.id]) { throw error('INVALID_DEPENDENCY'); }
        seen['$'+d.id] = true;
      });
      return m;
    }
    function open(done) {
      if (db) { done(null, db); return; }
      var request, settled = false, timer;
      function settle(e, value) {
        if (settled) { if (value) { value.close(); } return; }
        settled = true; root.clearTimeout(timer);
        if (closed && value) { value.close(); value = null; e = error('CLOSED'); }
        db = value || null; done(e, db);
      }
      try {
        if (!root.indexedDB) { settle(error('STORAGE_UNAVAILABLE')); return; }
        request = root.indexedDB.open('escrevaral-pacotes', 1);
        timer = root.setTimeout(function () { settle(error('STORAGE_TIMEOUT')); }, 1500);
        request.onupgradeneeded = function () {
          var d = request.result;
          ['versions','receipts','blocks','active'].forEach(function (name) { if (!d.objectStoreNames.contains(name)) { d.createObjectStore(name); } });
        };
        request.onsuccess = function () {
          var d = request.result;
          d.onversionchange = function () { d.close(); db = null; closed = true; };
          settle(null, d);
        };
        request.onerror = function () { settle(request.error || error('STORAGE_UNAVAILABLE')); };
        request.onblocked = function () { settle(error('STORAGE_BLOCKED')); };
      } catch (e) { settle(e); }
    }
    function operation(done, work) {
      var finished = false, cancelled = false, tx = null, failure = null, result, afterCommit = null;
      var handle = { cancel: function () { if (!finished) { cancelled = true; if (tx) { try { tx.abort(); } catch (ignore) {} } } } };
      function finish(e, value) {
        if (finished) { return; } finished = true;
        if (busy === handle) { busy = null; }
        done(cancelled ? error('CANCELLED') : e, cancelled ? undefined : value);
      }
      function fail(e) { failure = e; if (tx) { try { tx.abort(); } catch (ignore) { finish(e); } } else { finish(e); } }
      function transaction(names, mode, action) {
        open(function (e, d) {
          if (e || cancelled) { finish(e || error('CANCELLED')); return; }
          try {
            tx = d.transaction(names, mode);
            tx.oncomplete = function () {
              tx = null;
              try { if (afterCommit && !cancelled) { afterCommit(result, finish); } else { finish(null, result); } } catch (ex) { finish(ex); }
            };
            tx.onabort = function () { finish(failure || tx.error || error('ABORTED')); };
            action(tx);
          } catch (ex) { fail(ex); }
        });
      }
      function get(store, k, next) {
        var r = tx.objectStore(store).get(k);
        r.onsuccess = function () { try { next(r.result); } catch (e) { fail(e); } };
      }
      var op = { tx: transaction, get: get, fail: fail, finish: finish, value: function (v) { result = v; }, afterCommit: function (fn) { afterCommit = fn; }, cancelled: function () { return cancelled; } };
      if (closed || busy) { finish(error(closed ? 'CLOSED' : 'BUSY')); return handle; }
      busy = handle;
      try { work(op); } catch (e) { fail(e); }
      return handle;
    }
    function version(op, ticket, next) {
      if (!ticket || typeof ticket.key !== 'string' || typeof ticket.token !== 'string') { throw error('INVALID_TICKET'); }
      op.get('versions', ticket.key, function (record) {
        if (!record || record.token !== ticket.token) { throw error('STALE_TICKET'); }
        next(record);
      });
    }
    function descriptor(record, blockId) {
      var list = record.manifest.blocks, i;
      for (i = 0; i < list.length; i += 1) { if (list[i].id === blockId) { return list[i]; } }
      throw error('UNKNOWN_BLOCK');
    }
    function ticket(record) { return { key: key(record.manifest), token: record.token }; }
    function stage(input, done) {
      return operation(done, function (op) {
        var m = manifest(input), k = key(m);
        op.tx(['versions'], 'readwrite', function (tx) {
          op.get('versions', k, function (record) {
            if (record && JSON.stringify(record.manifest) !== JSON.stringify(m)) { throw error('VERSION_CONFLICT'); }
            if (!record) {
              record = {manifest:m, token:new Date().getTime().toString(36)+'-'+(++serial)+'-'+Math.random().toString(36).slice(2), state:'staged'};
              tx.objectStore('versions').add(record, k);
            }
            op.value({ticket:ticket(record), state:record.state});
          });
        });
      });
    }
    function put(ticketValue, blockId, buffer, done) {
      return operation(done, function (op) {
        if (Object.prototype.toString.call(buffer) !== '[object ArrayBuffer]' || buffer.byteLength > limits.blockBytes) { throw error('BLOCK_LIMIT'); }
        var bytes = new Uint8Array(buffer.byteLength); bytes.set(new Uint8Array(buffer));
        var hashed = false;
        hash(bytes.buffer, function (e, sha) {
          if (hashed) { return; } hashed = true;
          if (e || op.cancelled()) { op.finish(e || error('CANCELLED')); return; }
          op.tx(['versions','receipts','blocks'], 'readwrite', function (tx) {
            version(op, ticketValue, function (record) {
              if (record.state !== 'staged') { throw error('IMMUTABLE_VERSION'); }
              var b = descriptor(record, blockId), k = ticketValue.key+'/'+blockId;
              if (b.bytes !== bytes.byteLength || b.sha256 !== sha) { throw error('INTEGRITY_FAILED'); }
              tx.objectStore('blocks').put(bytes.buffer, k);
              tx.objectStore('receipts').put({bytes:b.bytes, sha256:sha}, k);
              op.value({id:blockId, bytes:b.bytes});
            });
          });
        });
      });
    }
    function activate(ticketValue, done) {
      return operation(done, function (op) {
        op.tx(['versions','receipts','active'], 'readwrite', function (tx) {
          version(op, ticketValue, function (record) {
            var pending = record.manifest.blocks.length + record.manifest.dependencies.length;
            function checked() {
              pending -= 1; if (pending) { return; }
              record.state = 'ready'; tx.objectStore('versions').put(record, ticketValue.key);
              tx.objectStore('active').put(ticketValue, record.manifest.id); op.value(ticketValue);
            }
            record.manifest.blocks.forEach(function (b) {
              op.get('receipts', ticketValue.key+'/'+b.id, function (r) { if (!r || r.bytes !== b.bytes || r.sha256 !== b.sha256) { throw error('INCOMPLETE_VERSION'); } checked(); });
            });
            record.manifest.dependencies.forEach(function (dep) {
              op.get('versions', key(dep), function (r) { if (!r || r.state !== 'ready') { throw error('DEPENDENCY_UNAVAILABLE'); } checked(); });
            });
          });
        });
      });
    }
    function active(packageId, done) {
      return operation(done, function (op) {
        if (!id(packageId)) { throw error('INVALID_ID'); }
        op.tx(['active','versions'], 'readonly', function () {
          op.get('active', packageId, function (t) {
            if (!t) { op.value(null); return; }
            version(op, t, function (record) { if (record.state !== 'ready') { throw error('INCOMPLETE_VERSION'); } op.value({ticket:t, manifest:record.manifest}); });
          });
        });
      });
    }
    function read(ticketValue, blockId, done) {
      // Uma leitura pontual; não carrega os demais blocos nem o léxico inteiro.
      return operation(done, function (op) {
        op.afterCommit(function (value, finish) {
          hash(value.bytes, function (failure, sha) { finish(failure || (sha !== value.sha256 ? error('INTEGRITY_FAILED') : null), failure || sha !== value.sha256 ? undefined : value.bytes); });
        });
        op.tx(['versions','blocks'], 'readonly', function () {
          version(op, ticketValue, function (record) {
            if (record.state !== 'ready') { throw error('INCOMPLETE_VERSION'); }
            var b = descriptor(record, blockId);
            if (b.bytes > limits.blockBytes) { throw error('BLOCK_LIMIT'); }
            op.get('blocks', ticketValue.key+'/'+blockId, function (bytes) {
              if (!bytes || bytes.byteLength !== b.bytes) { throw error('BLOCK_UNAVAILABLE'); }
              op.value({bytes:bytes, sha256:b.sha256});
            });
          });
        });
      });
    }
    function inspect(ticketValue, done) {
      return operation(done, function (op) {
        op.tx(['versions','receipts'], 'readonly', function () {
          version(op, ticketValue, function (record) {
            var pending = record.manifest.blocks.length, present = [];
            record.manifest.blocks.forEach(function (b) {
              op.get('receipts', ticketValue.key+'/'+b.id, function (r) {
                if (r && r.bytes === b.bytes && r.sha256 === b.sha256) { present.push(b.id); }
                pending -= 1;
                if (!pending) { op.value({state:record.state, manifest:record.manifest, stored:present}); }
              });
            });
          });
        });
      });
    }
    function discard(ticketValue, done) {
      return operation(done, function (op) {
        op.tx(['versions','receipts','blocks'], 'readwrite', function (tx) {
          version(op, ticketValue, function (record) {
            if (record.state !== 'staged') { throw error('IMMUTABLE_VERSION'); }
            record.manifest.blocks.forEach(function (b) { var k = ticketValue.key+'/'+b.id; tx.objectStore('receipts').delete(k); tx.objectStore('blocks').delete(k); });
            tx.objectStore('versions').delete(ticketValue.key); op.value(true);
          });
        });
      });
    }
    return {stage:stage, put:put, activate:activate, active:active, read:read, inspect:inspect, discard:discard,
      close:function () { closed = true; if (busy) { busy.cancel(); } if (db) { db.close(); db = null; } }};
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/storage/leitor-pacotes.js */
/* Transporte local opcional. Recebe arquivos já escolhidos pelo hospedeiro;
 * lê somente um bloco limitado, sem rede nem interpretação do conteúdo. */
(function (root) {
  'use strict';
  var E = root.Escr;
  function error(code) { var e = new Error(code); e.code = code; return e; }
  function integer(n) { return typeof n === 'number' && isFinite(n) && n >= 0 && n <= 9007199254740991 && n % 1 === 0; }
  function id(s) { return typeof s === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(s); }
  E.createPackageFileReader = function (options) {
    options = options || {};
    var resolve = options.resolveFile, limit = options.maxBlockBytes, timeout = options.timeoutMs;
    var busy = null, closed = false, disabled = false;
    if (typeof resolve !== 'function' || !integer(limit) || !limit || !integer(timeout) || !timeout || timeout > 2147483647) { throw error('FILE_READER_OPTIONS'); }
    function readBlock(input, done) {
      if (typeof done !== 'function') { throw error('CALLBACK_REQUIRED'); }
      var reader = null, timer = null, finished = false, request, inputError = null;
      var refused = closed ? 'CLOSED' : disabled ? 'FILE_READER_DISABLED' : busy ? 'BUSY' : null;
      try {
        if (!input || !id(input.id) || !id(input.version) || !input.block || !id(input.block.id) || !integer(input.block.bytes) || typeof input.block.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(input.block.sha256)) { throw error('INVALID_BLOCK_REQUEST'); }
        if (input.block.bytes > limit) { throw error('BLOCK_LIMIT'); }
        request = {id:input.id, version:input.version, block:{id:input.block.id, bytes:input.block.bytes, sha256:input.block.sha256}};
      } catch (e) { inputError = e; }
      function detach(r) { if (r) { r.onload = r.onerror = r.onabort = r.onloadend = null; } }
      function finish(e, bytes) {
        if (finished) { return; } finished = true;
        root.clearTimeout(timer);
        if (reader && reader.readyState === 1) { disabled = true; }
        detach(reader); reader = null; request = null;
        if (busy === handle) { busy = null; }
        root.setTimeout(function () { done(e || null, e ? undefined : bytes); }, 0);
      }
      function stop(reason) {
        if (finished || refused) { return false; }
        if (reader) {
          // Desligar eventos antes de abortar evita dupla conclusão síncrona.
          detach(reader);
          try { if (reader.readyState === 1) { reader.abort(); } } catch (ignore) { disabled = true; }
          // Se o ambiente não confirmou a interrupção, não iniciar nova leitura
          // nesta instância. Timeout não é licença para sobrepor alocações.
          if (reader.readyState === 1) { disabled = true; }
        }
        finish(error(reason)); return true;
      }
      var handle = {cancel:function () { return stop('CANCELLED'); }};
      if (!refused) { busy = handle; }
      root.setTimeout(function () {
        if (finished) { return; }
        if (refused || inputError) { finish(inputError && !refused ? inputError : error(refused)); return; }
        try {
          if (typeof root.FileReader !== 'function') { throw error('FILE_READER_UNAVAILABLE'); }
          var expected = request.block.bytes;
          // O resolvedor é confiável, mas recebe sua própria cópia do descritor.
          var source = resolve({id:request.id, version:request.version, block:{id:request.block.id, bytes:expected, sha256:request.block.sha256}});
          if (finished) { return; }
          if (!source || !source.file || !integer(source.offset) || !integer(source.file.size) || source.offset > source.file.size || expected > source.file.size-source.offset) { throw error('FILE_RANGE'); }
          var file = source.file, blob, slice;
          if (source.offset === 0 && file.size === expected) { blob = file; }
          else {
            slice = file.slice || file.webkitSlice || file.mozSlice;
            if (typeof slice !== 'function') { throw error('SLICE_UNAVAILABLE'); }
            blob = slice.call(file, source.offset, source.offset+expected);
          }
          if (!blob || blob.size !== expected || blob.size > limit) { throw error('BLOCK_LIMIT'); }
          reader = new root.FileReader();
          if (typeof reader.readAsArrayBuffer !== 'function') { throw error('FILE_READER_UNAVAILABLE'); }
          reader.onload = function () {
            if (finished) { return; }
            var bytes = reader.result;
            if (Object.prototype.toString.call(bytes) !== '[object ArrayBuffer]' || bytes.byteLength !== expected) { finish(error('BLOCK_UNAVAILABLE')); return; }
            finish(null, bytes);
          };
          reader.onerror = function () { if (!finished) { finish(reader.error || error('READ_FAILED')); } };
          reader.onabort = function () { finish(error('READ_ABORTED')); };
          reader.onloadend = function () { finish(error('READ_FAILED')); };
          timer = root.setTimeout(function () { stop('READ_TIMEOUT'); }, timeout);
          reader.readAsArrayBuffer(blob);
        } catch (e) {
          // Falha síncrona após início também deve interromper a leitura.
          if (reader && reader.readyState === 1) {
            detach(reader);
            try { reader.abort(); } catch (ignore) { disabled = true; }
          }
          finish(e);
        }
      }, 0);
      return handle;
    }
    return {readBlock:readBlock, close:function () { closed = true; if (busy) { busy.cancel(); } }};
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/storage/instalador-pacotes.js */
/* Coordenador opcional. O hospedeiro fornece armazenamento e leitor limitado;
 * não escolhe URLs, não abre a rede e não recebe o manuscrito. */
(function (root) {
  'use strict';
  var E = root.Escr;
  function error(code) { var e = new Error(code); e.code = code; return e; }
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  E.createPackageInstaller = function (options) {
    options = options || {};
    var store = options.store, reader = options.readBlock, busy = false;
    if (!store || typeof reader !== 'function' || !['stage','inspect','put','activate'].every(function (name) { return typeof store[name] === 'function'; })) { throw error('INSTALLER_OPTIONS'); }
    function install(input, progress, done) {
      var manifest, ticket = null, pending = null, finished = false, cancelled = false;
      var phase = 'staging', stored = {}, count = 0, size = 0, total = 0, index = 0;
      var accepted = !busy, inputError = null;
      if (typeof done !== 'function') { throw error('CALLBACK_REQUIRED'); }
      if (accepted) {
        busy = true;
        try { manifest = copy(input); } catch (e) { inputError = error('INVALID_MANIFEST'); }
      }
      function report() {
        return {phase:phase, ticket:ticket ? copy(ticket) : null,
          storedBlocks:count, storedBytes:size, totalBlocks:manifest && manifest.blocks ? manifest.blocks.length : 0, totalBytes:total};
      }
      function finish(e) {
        if (finished) { return; }
        finished = true;
        phase = e ? (e.code === 'CANCELLED' ? 'cancelled' : 'failed') : 'installed';
        if (accepted) { busy = false; }
        done(e || null, report());
      }
      function later(fn) {
        root.setTimeout(function () {
          if (finished) { return; }
          if (cancelled) { finish(error('CANCELLED')); return; }
          try { fn(); } catch (e) { finish(e); }
        }, 0);
      }
      function notify(nextPhase) {
        phase = nextPhase;
        if (typeof progress === 'function') { progress(report()); }
        if (cancelled) { finish(error('CANCELLED')); return false; }
        return true;
      }
      // A resposta pode ser síncrona; a continuação sempre cede a execução.
      // Duplicatas/respostas tardias não iniciam a próxima unidade.
      function invoke(start, next) {
        var call = {handle:null, settled:false}; pending = call;
        function receive(e, value) {
          if (call.settled || finished) { return; }
          call.settled = true;
          root.setTimeout(function () {
            if (finished) { return; }
            pending = null;
            if (cancelled) { value = null; finish(error('CANCELLED')); return; }
            try { if (e) { finish(e); } else { next(value); } } catch (ex) { finish(ex); }
            value = null;
          }, 0);
        }
        try { call.handle = start(receive); } catch (e) { receive(e); }
      }
      function nextBlock() {
        var block;
        while (index < manifest.blocks.length && stored['$'+manifest.blocks[index].id]) { index += 1; }
        if (index === manifest.blocks.length) {
          // A partir daqui cancelar retorna false: aguardar o resultado atômico
          // evita anunciar cancelamento depois de uma ativação já confirmada.
          if (!notify('activating')) { return; }
          invoke(function (cb) { return store.activate(ticket, cb); }, function () { finish(null); });
          return;
        }
        block = manifest.blocks[index];
        if (!notify('receiving')) { return; }
        invoke(function (cb) {
          return reader({id:manifest.id, version:manifest.version, block:copy(block)}, cb);
        }, function (bytes) {
          if (!notify('storing')) { return; }
          invoke(function (cb) { return store.put(ticket, block.id, bytes, cb); }, function () {
            count += 1; size += block.bytes; index += 1;
            if (notify('stored')) { later(nextBlock); }
          });
        });
      }
      var handle = {cancel:function () {
        if (finished || !accepted || phase === 'activating') { return false; }
        cancelled = true;
        if (pending && pending.handle && typeof pending.handle.cancel === 'function') {
          try { pending.handle.cancel(); } catch (ignore) {}
        }
        // O leitor precisa concluir também após cancelamento. Não liberar o
        // orçamento enquanto a unidade física ainda pode estar em andamento.
        return true;
      }};
      later(function () {
        if (!accepted) { finish(error('BUSY')); return; }
        if (inputError) { finish(inputError); return; }
        if (!notify('staging')) { return; }
        invoke(function (cb) { return store.stage(manifest, cb); }, function (value) {
          ticket = value.ticket;
          if (!notify('inspecting')) { return; }
          invoke(function (cb) { return store.inspect(ticket, cb); }, function (state) {
            manifest = state.manifest;
            state.stored.forEach(function (id) { stored['$'+id] = true; });
            manifest.blocks.forEach(function (b) { total += b.bytes; if (stored['$'+b.id]) { count += 1; size += b.bytes; } });
            if (notify('resumed')) { later(nextBlock); }
          });
        });
      });
      return handle;
    }
    return {install:install};
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/storage/analises.js */
/* Persistência linguística: IndexedDB opcional; documento e corpus portátil são fallback. */
(function(root){
 'use strict';
 var E=root.Escr;
 function version(){return ['5.0.0',E.knowledge.version,E.maturationData.version,E.studioData.version].join('/');}
 function clone(v){return JSON.parse(JSON.stringify(v));}
 function valid(record){return record&&record.version===1&&typeof record.text==='string'&&record.text.length<=200000&&typeof record.lens==='string'&&typeof record.corpus==='string'&&record.result&&record.result.schema==='scrvrl.analysis-result'&&record.result.source&&typeof record.result.source.start==='number'&&typeof record.result.source.end==='number'&&Object.prototype.toString.call(record.result.findings)==='[object Array]'&&record.result.findings.length<=100&&record.result.findings.every(function(f){return f&&typeof f.start==='number'&&typeof f.end==='number'&&f.start>=0&&f.end<=record.text.length&&f.end>f.start&&record.text.slice(f.start,f.end)===f.snippet&&f.evidence&&f.evidence.source;});}
 function match(record,lens,request){return valid(record)&&record.corpus===version()&&record.lens===lens&&record.text===request.text&&record.result.source.start===request.source.start&&record.result.source.end===request.source.end;}
 function remember(doc,request,result){
  var record={version:1,corpus:version(),lens:result.lens,text:request.text,at:new Date().toISOString(),result:clone(result)};
  if(!valid(record)){return null;}var records=doc.linguistics&&doc.linguistics.version===1?doc.linguistics.records.filter(valid):[];
  records=records.filter(function(r){return r.lens!==record.lens;});records.push(record);
  var size=0;records.forEach(function(r){size+=r.text.length;});while(records.length>3||size>200000){size-=records.shift().text.length;}
  doc.linguistics={version:1,records:records};return record;
 }
 function fromDoc(doc,lens,request){var records=doc.linguistics&&doc.linguistics.version===1?doc.linguistics.records:[];for(var i=records.length-1;i>=0;i-=1){if(match(records[i],lens,request)){return clone(records[i]);}}return null;}
 E.linguistics={version:version,valid:valid,match:match,remember:remember,fromDoc:fromDoc};
 E.createLinguisticStore=function(){
  var db=null,opening=false,disabled=false,queue=[],epoch=0;
  function open(done){
   if(db){done(db);return;}if(disabled){done(null);return;}queue.push(done);if(opening){return;}opening=true;
   var generation=++epoch,request,timer;
   function settle(value){if(generation!==epoch){if(value){value.close();}return;}epoch+=1;root.clearTimeout(timer);opening=false;db=value;disabled=!value;var waiting=queue;queue=[];waiting.forEach(function(f){f(value);});}
   try{
    if(!root.indexedDB){settle(null);return;}request=root.indexedDB.open('escrevaral-linguistica',1);
    timer=root.setTimeout(function(){settle(null);},1500);
    request.onupgradeneeded=function(){var d=request.result;if(!d.objectStoreNames.contains('cache')){d.createObjectStore('cache');}};
    request.onsuccess=function(){var d=request.result;d.onversionchange=function(){d.close();db=null;disabled=true;};settle(d);};request.onerror=request.onblocked=function(){settle(null);};
   }catch(ignore){settle(null);}
  }
  function get(key,done){
   open(function(d){if(!d){done(null);return;}var finished=false,timer;
    function finish(value){if(finished){return;}finished=true;root.clearTimeout(timer);done(value);}
    try{var tx=d.transaction('cache','readonly'),r=tx.objectStore('cache').get(key);timer=root.setTimeout(function(){finish(null);},1000);r.onsuccess=function(){finish(r.result||null);};r.onerror=tx.onabort=function(){finish(null);};}catch(ignore){finish(null);}
   });
  }
  function put(key,record){
   open(function(d){if(!d){return;}try{var tx=d.transaction('cache','readwrite'),s=tx.objectStore('cache'),r=s.get('recent');
    r.onsuccess=function(){var ids=Object.prototype.toString.call(r.result)==='[object Array]'?r.result:[];ids=ids.filter(function(x){return typeof x==='string'&&x!==key;}).slice(-20);ids.push(key);while(ids.length>20){s.delete(ids.shift());}s.put(record,key);s.put(ids,'recent');};
    tx.onerror=tx.onabort=function(){/* Derivados opcionais; a cópia do documento permanece. */};
   }catch(ignore){}});
  }
  function corpus(){open(function(d){if(!d){return;}try{var tx=d.transaction('cache','readwrite'),s=tx.objectStore('cache'),r=s.get('corpus');r.onsuccess=function(){if(!r.result||r.result.version!==version()){s.put({version:version(),knowledge:E.knowledge,maturation:E.maturationData,studio:E.studioData,style:E.styleData||null,poetry:E.poetryData||null,grammar:E.grammarData||null,verbs:E.verbData||null,decolonial:E.decolonialData||null},'corpus');}};}catch(ignore){}});}
  function removeDocument(prefix){open(function(d){if(!d){return;}try{var tx=d.transaction('cache','readwrite'),s=tx.objectStore('cache'),r=s.get('recent');r.onsuccess=function(){var ids=Object.prototype.toString.call(r.result)==='[object Array]'?r.result:[],keep=[];ids.forEach(function(k){if(typeof k!=='string'){return;}if(k.indexOf(prefix)===0){s.delete(k);}else{keep.push(k);}});s.put(keep,'recent');};}catch(ignore){}});}
  return {get:get,put:put,corpus:corpus,removeDocument:removeDocument};
 };
}(typeof window!=='undefined'?window:this));

;
/* Fonte: src/storage/cartorio.js */
/* Cartório do Escrevaral: SHA-256 puro ES5, cadeia encadeada de criação e verificação de pacotes .scrvrl. */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};
  var E = root.Escr;

  var ZERO_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
  var MAX_TRAIL = 200;
  var HEX_64 = /^[0-9a-f]{64}$/;

  /* ── SHA-256 puro ES5 (FIPS 180-4) sobre bytes UTF-8 ── */
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function utf8Bytes(input) {
    var str = String(input === undefined || input === null ? '' : input);
    var out = [], i, len = str.length, c, c2, cp;
    for (i = 0; i < len; i += 1) {
      c = str.charCodeAt(i);
      if (c < 0x80) {
        out.push(c);
      } else if (c < 0x800) {
        out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      } else if ((c & 0xfc00) === 0xd800 && i + 1 < len && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
        c2 = str.charCodeAt(i + 1);
        i += 1;
        cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
        out.push(
          0xf0 | (cp >> 18),
          0x80 | ((cp >> 12) & 0x3f),
          0x80 | ((cp >> 6) & 0x3f),
          0x80 | (cp & 0x3f)
        );
      } else {
        out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      }
    }
    return out;
  }

  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  function sha256(str) {
    var bytes = utf8Bytes(str);
    var bitLen = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) { bytes.push(0); }
    var hi = Math.floor(bitLen / 0x100000000);
    var lo = bitLen >>> 0;
    bytes.push((hi >>> 24) & 0xff, (hi >>> 16) & 0xff, (hi >>> 8) & 0xff, hi & 0xff);
    bytes.push((lo >>> 24) & 0xff, (lo >>> 16) & 0xff, (lo >>> 8) & 0xff, lo & 0xff);

    var h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    var h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    var w = new Array(64);
    var i, j, a, b, c, d, e, f, g, h, s0, s1, ch, maj, t1, t2;

    for (i = 0; i < bytes.length; i += 64) {
      for (j = 0; j < 16; j += 1) {
        w[j] = ((bytes[i + j * 4] << 24) |
          (bytes[i + j * 4 + 1] << 16) |
          (bytes[i + j * 4 + 2] << 8) |
          (bytes[i + j * 4 + 3])) >>> 0;
      }
      for (j = 16; j < 64; j += 1) {
        s0 = (rotr(w[j - 15], 7) ^ rotr(w[j - 15], 18) ^ (w[j - 15] >>> 3)) >>> 0;
        s1 = (rotr(w[j - 2], 17) ^ rotr(w[j - 2], 19) ^ (w[j - 2] >>> 10)) >>> 0;
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
      }
      a = h0; b = h1; c = h2; d = h3; e = h4; f = h5; g = h6; h = h7;
      for (j = 0; j < 64; j += 1) {
        s1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
        ch = ((e & f) ^ ((~e) & g)) >>> 0;
        t1 = (h + s1 + ch + K[j] + w[j]) >>> 0;
        s0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
        maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
        t2 = (s0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
    }

    var words = [h0, h1, h2, h3, h4, h5, h6, h7], hex = '';
    for (i = 0; i < 8; i += 1) {
      var part = words[i].toString(16);
      while (part.length < 8) { part = '0' + part; }
      hex += part;
    }
    return hex;
  }

  function isArray(v) { return Object.prototype.toString.call(v) === '[object Array]'; }
  function isNonNegInt(v) { return typeof v === 'number' && isFinite(v) && v >= 0 && v % 1 === 0; }
  function isIsoDate(v) { return typeof v === 'string' && v.length > 0 && isFinite(Date.parse(v)); }

  function canonical(value) {
    if (value === null || typeof value !== 'object') {
      return JSON.stringify(value);
    }
    if (isArray(value)) {
      var arrParts = [], i;
      for (i = 0; i < value.length; i += 1) {
        arrParts.push(value[i] === undefined ? 'null' : canonical(value[i]));
      }
      return '[' + arrParts.join(',') + ']';
    }
    var keys = Object.keys(value).sort(), objParts = [], k, v;
    for (i = 0; i < keys.length; i += 1) {
      k = keys[i];
      v = value[k];
      if (v === undefined) { continue; }
      objParts.push(JSON.stringify(k) + ':' + canonical(v));
    }
    return '{' + objParts.join(',') + '}';
  }

  function countWords(text) {
    if (E.countManuscript) { return E.countManuscript(text || '').words || 0; }
    var m = String(text || '').match(/[A-Za-zÀ-ÿ0-9]+/g);
    return m ? m.length : 0;
  }

  function contentHash(doc) {
    return sha256(String((doc && doc.title) || '') + '\n' + String((doc && doc.text) || ''));
  }

  function computeLinkHash(prevHash, doc, ledger) {
    return sha256(canonical({
      v: 1,
      prev: prevHash,
      rev: doc.revision,
      title: doc.title || '',
      text: doc.text || '',
      origin: ledger.origin,
      keys: ledger.keystrokes,
      extPastes: ledger.externalPastes,
      extChars: ledger.externalPasteChars,
      intPastes: ledger.internalPastes,
      blockedPastes: ledger.blockedPastes
    }));
  }

  /* ── Buffer transitório de telemetria antes da gravação ── */
  var pendingSignals = Object.create(null);

  function docKey(doc) {
    if (!doc) { return ''; }
    return String(doc.noteId || doc.id || '');
  }

  function ensurePending(key) {
    if (!pendingSignals[key]) {
      pendingSignals[key] = { keys: 0, extPastes: 0, extChars: 0, intPastes: 0, blockedPastes: 0 };
    }
    return pendingSignals[key];
  }

  function recordSignal(doc, kind, amount) {
    var key = docKey(doc);
    if (!key) { return; }
    var p = ensurePending(key);
    var n = typeof amount === 'number' && isFinite(amount) && amount > 0 ? Math.floor(amount) : 1;
    if (kind === 'key') { p.keys += n; }
    else if (kind === 'extPaste') { p.extPastes += 1; p.extChars += n; }
    else if (kind === 'intPaste') { p.intPastes += 1; }
    else if (kind === 'blockedPaste') { p.blockedPastes += n; }
  }

  function peekPending(doc) {
    var key = docKey(doc);
    return key && pendingSignals[key] ? pendingSignals[key] : { keys: 0, extPastes: 0, extChars: 0, intPastes: 0, blockedPastes: 0 };
  }

  function consumePending(doc) {
    var key = docKey(doc);
    if (!key || !pendingSignals[key]) {
      return { keys: 0, extPastes: 0, extChars: 0, intPastes: 0, blockedPastes: 0 };
    }
    var out = pendingSignals[key];
    delete pendingSignals[key];
    return out;
  }

  function validTrailEntry(item) {
    return !!item && typeof item === 'object' && !isArray(item) &&
      isNonNegInt(item.rev) &&
      typeof item.prev === 'string' && HEX_64.test(item.prev) &&
      typeof item.hash === 'string' && HEX_64.test(item.hash) &&
      isNonNegInt(item.len) &&
      isNonNegInt(item.words) &&
      isNonNegInt(item.keys) &&
      isNonNegInt(item.extPastes) &&
      isNonNegInt(item.extChars) &&
      isIsoDate(item.at);
  }

  function validDocLedger(ledger) {
    if (!ledger || typeof ledger !== 'object' || isArray(ledger)) { return false; }
    if (ledger.version !== 1) { return false; }
    if (ledger.origin !== 'escrevaral' && ledger.origin !== 'imported') { return false; }
    if (typeof ledger.headHash !== 'string' || !HEX_64.test(ledger.headHash)) { return false; }
    if (!isNonNegInt(ledger.chainLength) || !isNonNegInt(ledger.keystrokes) ||
        !isNonNegInt(ledger.externalPastes) || !isNonNegInt(ledger.externalPasteChars) ||
        !isNonNegInt(ledger.internalPastes) || !isNonNegInt(ledger.blockedPastes) ||
        !isNonNegInt(ledger.sessions)) { return false; }
    if (!isIsoDate(ledger.createdAt) || !isIsoDate(ledger.lastSealedAt)) { return false; }
    if (!isArray(ledger.trail) || ledger.trail.length > MAX_TRAIL) { return false; }
    for (var i = 0; i < ledger.trail.length; i += 1) {
      if (!validTrailEntry(ledger.trail[i])) { return false; }
    }
    return true;
  }

  function validPackageSeal(seal) {
    return !!seal && typeof seal === 'object' && !isArray(seal) &&
      seal.version === 1 &&
      seal.algorithm === 'SHA-256' &&
      typeof seal.packageHash === 'string' && HEX_64.test(seal.packageHash) &&
      isNonNegInt(seal.sealedDocuments) &&
      isNonNegInt(seal.totalDocuments);
  }

  function sealDocument(previousDoc, nextDoc, originHint, previewOnly) {
    var base = (previousDoc && validDocLedger(previousDoc.cartorio)) ? JSON.parse(JSON.stringify(previousDoc.cartorio)) :
      (nextDoc && validDocLedger(nextDoc.cartorio)) ? JSON.parse(JSON.stringify(nextDoc.cartorio)) : null;
    var delta = previewOnly ? peekPending(nextDoc) : consumePending(nextDoc);
    var now = nextDoc.updated || new Date().toISOString();
    var origin = base ? base.origin : (originHint === 'imported' ? 'imported' : 'escrevaral');
    var prevHash = base ? base.headHash : ZERO_HASH;

    var ledger = base ? base : {
      version: 1,
      origin: origin,
      headHash: ZERO_HASH,
      chainLength: 0,
      keystrokes: 0,
      externalPastes: 0,
      externalPasteChars: 0,
      internalPastes: 0,
      blockedPastes: 0,
      sessions: 0,
      createdAt: nextDoc.created || now,
      lastSealedAt: now,
      trail: []
    };

    ledger.keystrokes += delta.keys;
    ledger.externalPastes += delta.extPastes;
    ledger.externalPasteChars += delta.extChars;
    ledger.internalPastes += delta.intPastes;
    ledger.blockedPastes += delta.blockedPastes;
    ledger.sessions += 1;
    ledger.lastSealedAt = now;

    var hash = computeLinkHash(prevHash, nextDoc, ledger);
    ledger.headHash = hash;
    ledger.chainLength += 1;
    ledger.trail.push({
      rev: nextDoc.revision,
      prev: prevHash,
      hash: hash,
      len: String(nextDoc.text || '').length,
      words: countWords(nextDoc.text || ''),
      keys: ledger.keystrokes,
      extPastes: ledger.externalPastes,
      extChars: ledger.externalPasteChars,
      at: now
    });
    while (ledger.trail.length > MAX_TRAIL) {
      ledger.trail.shift();
    }
    return ledger;
  }

  function packageBodyForHash(payload) {
    var body = {
      format: payload.format,
      version: payload.version,
      scope: payload.scope,
      notebooks: payload.notebooks,
      documents: payload.documents,
      globals: payload.globals,
      inventory: payload.inventory
    };
    if (typeof payload.originals !== 'undefined') {
      body.originals = payload.originals;
    }
    return body;
  }

  function sealPackage(payload) {
    var docs = isArray(payload && payload.documents) ? payload.documents : [];
    var sealed = 0, total = 0, i;
    for (i = 0; i < docs.length; i += 1) {
      if (docs[i] && docs[i].kind === 'reminder') { continue; }
      total += 1;
      if (validDocLedger(docs[i] && docs[i].cartorio)) { sealed += 1; }
    }
    return {
      version: 1,
      algorithm: 'SHA-256',
      packageHash: sha256(canonical(packageBodyForHash(payload))),
      sealedDocuments: sealed,
      totalDocuments: total
    };
  }

  function verifyDocument(doc) {
    var words = countWords(doc && doc.text);
    var chars = String((doc && doc.text) || '').length;
    var cHash = contentHash(doc);
    var base = {
      id: (doc && (doc.noteId || doc.id)) || '',
      title: (doc && doc.title) || 'Sem título',
      project: (doc && doc.project) || 'Textos avulsos',
      revision: (doc && typeof doc.revision === 'number') ? doc.revision : 0,
      words: words,
      chars: chars,
      contentHash: cHash,
      createdAt: (doc && (doc.created || doc.updated)) || '',
      updatedAt: (doc && doc.updated) || '',
      lineageEntries: (doc && doc.lineage && isArray(doc.lineage.entries)) ? doc.lineage.entries.length : 0
    };

    if (!doc || typeof doc.cartorio === 'undefined') {
      base.status = 'unsealed';
      base.label = 'Sem selo do Cartório';
      base.detail = 'Documento criado antes do selo do Cartório ou ainda não gravado.';
      base.origin = 'unknown';
      base.headHash = '';
      base.chainLength = 0;
      base.keystrokes = 0;
      base.externalPastes = 0;
      base.externalPasteChars = 0;
      base.internalPastes = 0;
      base.blockedPastes = 0;
      base.trail = [];
      return base;
    }

    if (!validDocLedger(doc.cartorio)) {
      base.status = 'tampered';
      base.label = 'Registro adulterado ou inválido';
      base.detail = 'A estrutura criptográfica do Cartório neste documento está corrompida.';
      base.origin = 'unknown';
      base.headHash = '';
      base.chainLength = 0;
      base.keystrokes = 0;
      base.externalPastes = 0;
      base.externalPasteChars = 0;
      base.internalPastes = 0;
      base.blockedPastes = 0;
      base.trail = [];
      return base;
    }

    var ledger = doc.cartorio;
    base.origin = ledger.origin;
    base.headHash = ledger.headHash;
    base.chainLength = ledger.chainLength;
    base.keystrokes = ledger.keystrokes;
    base.externalPastes = ledger.externalPastes;
    base.externalPasteChars = ledger.externalPasteChars;
    base.internalPastes = ledger.internalPastes;
    base.blockedPastes = ledger.blockedPastes;
    base.createdAt = ledger.createdAt;
    base.updatedAt = ledger.lastSealedAt;
    base.trail = ledger.trail.slice();

    var trail = ledger.trail;
    if (!trail.length) {
      base.status = 'tampered';
      base.label = 'Cadeia incompleta';
      base.detail = 'O registro declara selo, mas a trilha encadeada está vazia.';
      return base;
    }

    var i;
    for (i = 1; i < trail.length; i += 1) {
      if (trail[i].prev !== trail[i - 1].hash) {
        base.status = 'tampered';
        base.label = 'Quebra na cadeia de hashes';
        base.detail = 'A revisão ' + trail[i].rev + ' não encadeia com o hash da revisão anterior.';
        return base;
      }
    }

    var last = trail[trail.length - 1];
    if (last.hash !== ledger.headHash || last.rev !== doc.revision) {
      base.status = 'tampered';
      base.label = 'Revisão divergente do selo';
      base.detail = 'A última revisão da trilha não confere com a cabeça do selo ou com a revisão atual do documento.';
      return base;
    }

    var expectedHead = computeLinkHash(last.prev, doc, ledger);
    if (expectedHead !== ledger.headHash) {
      base.status = 'tampered';
      base.label = 'Conteúdo alterado fora do selo';
      base.detail = 'O texto, título ou contadores de processo foram modificados depois que o Escrevaral selou este documento.';
      return base;
    }

    if (ledger.origin === 'imported') {
      base.status = 'verified_imported';
      base.label = 'Cadeia íntegra · Origem importada';
      base.detail = 'O arquivo manteve integridade após a entrada, mas o texto original entrou por importação externa.';
      return base;
    }

    if (ledger.externalPastes > 0 || ledger.externalPasteChars > 0) {
      base.status = 'verified_with_paste';
      base.label = 'Cadeia íntegra · Com colagem externa';
      base.detail = 'A cadeia está íntegra, mas houve ' + ledger.externalPastes + ' colagem(ns) externa(s) (' + ledger.externalPasteChars + ' caracteres) durante a escrita.';
      return base;
    }

    base.status = 'verified_clean';
    base.label = 'Cadeia íntegra · Construído no Escrevaral';
    base.detail = 'Texto, título e histórico conferem com o selo criptográfico, com zero colagens externas registradas.';
    return base;
  }

  function verifyPackage(rawOrObject) {
    var payload;
    if (typeof rawOrObject === 'string') {
      try { payload = JSON.parse(rawOrObject); }
      catch (e) { throw new Error('O arquivo não contém JSON válido do Escrevaral (.scrvrl).'); }
    } else {
      payload = rawOrObject;
    }

    if (!payload || typeof payload !== 'object') {
      throw new Error('Pacote vazio ou ilegível.');
    }

    var isDeskPack = payload.format === 'escrevaral-cadernos' && isArray(payload.documents);
    var isLegacyPack = payload.format === 'escrevaral-astra' && isArray(payload.documents);
    if (!isDeskPack && !isLegacyPack) {
      throw new Error('Formato não reconhecido. Envie uma cópia exportada pelo Escrevaral (.scrvrl ou .json).');
    }

    var packageIntegrity = 'unsealed';
    var storedPackageHash = '';
    var computedPackageHash = isDeskPack ? sealPackage(payload).packageHash : sha256(canonical(payload));

    if (isDeskPack && typeof payload.cartorio !== 'undefined') {
      if (!validPackageSeal(payload.cartorio)) {
        packageIntegrity = 'tampered';
      } else {
        storedPackageHash = payload.cartorio.packageHash;
        packageIntegrity = (storedPackageHash === computedPackageHash) ? 'intact' : 'tampered';
      }
    }

    var reports = [];
    var totals = {
      documents: 0,
      clean: 0,
      withPaste: 0,
      imported: 0,
      tampered: 0,
      unsealed: 0,
      words: 0,
      revisions: 0,
      keystrokes: 0,
      externalPastes: 0,
      externalPasteChars: 0,
      internalPastes: 0,
      blockedPastes: 0,
      earliestAt: '',
      latestAt: ''
    };

    var i, doc, r;
    for (i = 0; i < payload.documents.length; i += 1) {
      doc = payload.documents[i];
      if (!doc || doc.kind === 'reminder') { continue; }
      r = verifyDocument(doc);
      reports.push(r);
      totals.documents += 1;
      totals.words += r.words;
      totals.revisions += r.chainLength || r.revision || 0;
      totals.keystrokes += r.keystrokes;
      totals.externalPastes += r.externalPastes;
      totals.externalPasteChars += r.externalPasteChars;
      totals.internalPastes += r.internalPastes;
      totals.blockedPastes += r.blockedPastes;

      if (r.status === 'verified_clean') { totals.clean += 1; }
      else if (r.status === 'verified_with_paste') { totals.withPaste += 1; }
      else if (r.status === 'verified_imported') { totals.imported += 1; }
      else if (r.status === 'tampered') { totals.tampered += 1; }
      else { totals.unsealed += 1; }

      if (r.createdAt && (!totals.earliestAt || r.createdAt < totals.earliestAt)) { totals.earliestAt = r.createdAt; }
      if (r.updatedAt && (!totals.latestAt || r.updatedAt > totals.latestAt)) { totals.latestAt = r.updatedAt; }
    }

    var verdict, verdictTitle, verdictSummary;
    if (packageIntegrity === 'tampered' || totals.tampered > 0) {
      verdict = 'adulterado';
      verdictTitle = 'Adulteração detectada na verificação';
      verdictSummary = packageIntegrity === 'tampered'
        ? 'O selo criptográfico do arquivo não confere com o conteúdo atual. O pacote foi alterado depois de exportado.'
        : (totals.tampered + ' documento(s) apresentam divergência entre o texto e o selo criptográfico.');
    } else if (totals.documents === 0) {
      verdict = 'vazio';
      verdictTitle = 'Pacote íntegro sem manuscritos';
      verdictSummary = 'O arquivo está estruturalmente íntegro, mas não contém folhas de texto.';
    } else if (totals.unsealed === totals.documents) {
      verdict = 'legado_sem_selo';
      verdictTitle = 'Arquivo anterior ao Cartório (sem selo encadeado)';
      verdictSummary = 'Os textos foram lidos normalmente, mas foram exportados antes da ativação do Cartório. A impressão digital SHA-256 atual foi calculada abaixo.';
    } else if (totals.withPaste > 0 || totals.imported > 0 || totals.unsealed > 0) {
      verdict = 'integro_com_ressalvas';
      verdictTitle = 'Pacote íntegro · Com ressalvas de origem registradas';
      verdictSummary = 'Nenhuma adulteração pós-exportação foi detectada. Confira no livro de folhas abaixo os registros de colagem externa, importação ou folhas sem selo.';
    } else {
      verdict = 'integro_sem_colagem';
      verdictTitle = 'Certificado íntegro · Construído no Escrevaral sem colagem externa';
      verdictSummary = 'Todos os manuscritos deste pacote apresentam cadeia criptográfica íntegra, origem nativa na oficina e zero colagens externas registradas.';
    }

    return {
      verifiedAt: new Date().toISOString(),
      scope: payload.scope || 'all',
      notebooksCount: isArray(payload.notebooks) ? payload.notebooks.length : 0,
      packageIntegrity: packageIntegrity,
      packageHash: computedPackageHash,
      storedPackageHash: storedPackageHash,
      verdict: verdict,
      verdictTitle: verdictTitle,
      verdictSummary: verdictSummary,
      totals: totals,
      documents: reports
    };
  }

  function formatDateBr(iso) {
    if (!iso) { return '—'; }
    try { return new Date(iso).toLocaleString('pt-BR'); }
    catch (e) { return iso; }
  }

  function formatCertificateText(report, fileName) {
    var lines = [];
    lines.push('====================================================================');
    lines.push('CARTÓRIO DO ESCREVARAL — CERTIFICADO DE ORIGEM E PROCESSO DE ESCRITA');
    lines.push('====================================================================');
    if (fileName) { lines.push('Arquivo analisado: ' + fileName); }
    lines.push('Verificado em (relógio local): ' + formatDateBr(report.verifiedAt));
    lines.push('Veredito: ' + report.verdictTitle);
    lines.push('Resumo: ' + report.verdictSummary);
    lines.push('--------------------------------------------------------------------');
    lines.push('Impressão digital do pacote (SHA-256): ' + report.packageHash);
    lines.push('Integridade do pacote: ' + (report.packageIntegrity === 'intact' ? 'ÍNTEGRO' : report.packageIntegrity === 'tampered' ? 'ADULTERADO' : 'SEM SELO DE PACOTE'));
    lines.push('Folhas analisadas: ' + report.totals.documents + ' | Palavras: ' + report.totals.words);
    lines.push('Revisões encadeadas: ' + report.totals.revisions + ' | Toques registrados: ' + report.totals.keystrokes);
    lines.push('Colagens externas: ' + report.totals.externalPastes + ' (' + report.totals.externalPasteChars + ' caracteres) | Bloqueadas: ' + report.totals.blockedPastes);
    lines.push('Período registrado no aparelho: ' + formatDateBr(report.totals.earliestAt) + ' até ' + formatDateBr(report.totals.latestAt));
    lines.push('--------------------------------------------------------------------');
    lines.push('LIVRO DE FOLHAS:');
    var i, d;
    for (i = 0; i < report.documents.length; i += 1) {
      d = report.documents[i];
      lines.push((i + 1) + '. ' + d.title + ' [' + d.project + ']');
      lines.push('   Estado: ' + d.label);
      lines.push('   Palavras: ' + d.words + ' | Revisões: ' + (d.chainLength || d.revision) + ' | Toques: ' + d.keystrokes + ' | Colagens externas: ' + d.externalPastes);
      lines.push('   SHA-256 do texto: ' + d.contentHash);
      if (d.headHash) { lines.push('   SHA-256 da cadeia: ' + d.headHash); }
    }
    lines.push('--------------------------------------------------------------------');
    lines.push('ESCOPO E TRANSPARÊNCIA:');
    lines.push('Camada 1 (offline): comprova integridade criptográfica do pacote e da');
    lines.push('cadeia de criação registrada dentro do Escrevaral, incluindo a ausência');
    lines.push('ou ocorrência de colagens externas.');
    lines.push('Camada 2 (anterioridade jurídica externa): datas locais dependem do');
    lines.push('relógio do aparelho. Use o código SHA-256 acima para ancoragem externa');
    lines.push('de data (Biblioteca Nacional, carimbo de tempo ou protocolo editorial).');
    return lines.join('\n');
  }

  E.cartorio = {
    ZERO_HASH: ZERO_HASH,
    sha256: sha256,
    canonical: canonical,
    contentHash: contentHash,
    recordSignal: recordSignal,
    peekPending: peekPending,
    validDocLedger: validDocLedger,
    validPackageSeal: validPackageSeal,
    sealDocument: sealDocument,
    sealPackage: sealPackage,
    verifyDocument: verifyDocument,
    verifyPackage: verifyPackage,
    formatCertificateText: formatCertificateText
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/storage/linhagem.js */
/* Linhagem local: versões recentes autocontidas, sem promessa de data externa. */
(function(root){
 'use strict';
 var E=root.Escr,limit=400000,max=20;
 function arr(v){return Object.prototype.toString.call(v)==='[object Array]';}
 function valid(h){
  if(!h||h.version!==1||!arr(h.entries)||h.entries.length>max){return false;}var size=0,seen=Object.create(null);
  return h.entries.every(function(v){if(!v||typeof v.id!=='string'||!/^[a-z0-9-]+$/.test(v.id)||seen[v.id]||typeof v.title!=='string'||typeof v.text!=='string'||typeof v.at!=='string'||!isFinite(Date.parse(v.at))||typeof v.revision!=='number'||v.revision<0||v.revision%1){return false;}seen[v.id]=true;size+=v.text.length+v.title.length;return size<=limit;});
 }
 function read(doc){if(typeof doc.lineage==='undefined'){return {version:1,entries:[]};}if(!valid(doc.lineage)){throw new Error('O histórico desta folha não pôde ser lido. Preserve uma cópia antes de continuar.');}return JSON.parse(JSON.stringify(doc.lineage));}
 function capture(previous,next,force){
  var h=read(next);if(!previous){return h;}var last=h.entries[h.entries.length-1],changed=previous.text!==next.text||previous.title!==next.title;
  if(!force&&!changed){return h;}
  var elapsed=last?Date.parse(previous.updated)-Date.parse(last.at):Infinity,large=previous.text.length-next.text.length>Math.max(30,previous.text.length*.2);
  if(!force&&last&&elapsed<60000&&!large&&previous.title===next.title){return h;}
  if(h.entries.some(function(v){return v.id===previous.id;})){return h;}
  if(previous.text.length+previous.title.length>limit){return h;}
  h.entries.push({id:previous.id,title:previous.title,text:previous.text,at:previous.updated,revision:previous.revision});
  var size=0;h.entries.forEach(function(v){size+=v.text.length+v.title.length;});while(h.entries.length>max||size>limit){var old=h.entries.shift();size-=old.text.length+old.title.length;}
  return h;
 }
 function difference(before,after){
  var start=0,end=0;while(start<before.length&&start<after.length&&before.charAt(start)===after.charAt(start)){start+=1;}
  while(end<before.length-start&&end<after.length-start&&before.charAt(before.length-end-1)===after.charAt(after.length-end-1)){end+=1;}
  return {start:start,removed:before.slice(start,before.length-end),added:after.slice(start,after.length-end)};
 }
 E.lineage={valid:valid,read:read,capture:capture,difference:difference,limit:limit,max:max};
}(typeof window!=='undefined'?window:this));

;
/* Fonte: src/ui/linhagem.js */
/* Colaboração: consulta de versões locais, restauração como nova gravação. */
(function(root){
 'use strict';
 root.Escr.mountLineage=function(bridge){
  var E=root.Escr,D=root.document,panel=D.getElementById('lineage-panel'),list=D.getElementById('lineage-list'),active=null,selected=null;
  function byId(id){return D.getElementById(id);}
  function el(tag,parent,text){var n=D.createElement(tag);if(typeof text!=='undefined'){n.textContent=text;}parent.appendChild(n);return n;}
  function status(t){byId('lineage-status').textContent=t;}
  function versionRow(v,now,index){
   var row=el('li',list),b=el('button',row);b.type='button';b.className='lineage-version';b.setAttribute('aria-pressed',selected===v.id?'true':'false');
   el('strong',b,now?'Agora na folha':'Versão '+v.revision);el('span',b,new Date(v.at).toLocaleString('pt-BR'));el('small',b,v.title||'Sem título');el('small',b,E.countManuscript(v.text).words+' palavras');
   b.addEventListener('click',function(){selected=v.id;show(v,now,index);},false);
  }
  function show(v,now,index){
   var current=bridge.document(),h=E.lineage.read(active),previous=index>0?h.entries[index-1]:null,diff=E.lineage.difference(previous?previous.text:'',v.text);
   byId('lineage-preview').value=v.text;byId('lineage-preview-title').textContent=v.title||'Sem título';byId('lineage-diff').textContent=now?'Texto atual.':previous?diff.added.length+' caracteres inseridos · '+diff.removed.length+' removidos desde a versão anterior.':'Primeira versão disponível neste histórico.';
   byId('lineage-added').textContent=diff.added.slice(0,3000);byId('lineage-removed').textContent=diff.removed.slice(0,3000);byId('lineage-changes').hidden=now||!previous;
   byId('lineage-restore').hidden=now;byId('lineage-restore').onclick=function(){
    E.dialog.ask({title:'Restaurar esta versão?',message:'O texto escolhido será uma nova gravação. O texto atual será preservado no histórico dentro do limite de espaço.',accept:'Restaurar versão'},function(ok){if(!ok){return;}try{if(!current||bridge.document().id!==current.id||bridge.document().text!==current.text){throw new Error('A folha mudou. Reabra a linhagem antes de restaurar.');}bridge.restore(v);open(true);status('Versão restaurada como nova gravação.');}catch(e){status(e.message);}});
   };
   var buttons=list.querySelectorAll('button');for(var j=0;j<buttons.length;j+=1){buttons[j].setAttribute('aria-pressed',j===index?'true':'false');}
  }
  function open(already){
   if(!bridge.checkpoint()){return;}active=bridge.document();if(!active||!active.projectId){bridge.message('Abra uma folha de um caderno para consultar sua linhagem.');return;}
   try{
    var h=E.lineage.read(active);list.textContent='';selected=active.id;h.entries.forEach(function(v,i){versionRow(v,false,i);});var now={id:active.id,title:active.title,text:active.text,at:active.updated,revision:active.revision};versionRow(now,true,h.entries.length);
    byId('lineage-heading').textContent=active.title||'Sem título';byId('lineage-book').textContent='Caderno: '+active.project;show(now,true,h.entries.length);status(h.entries.length?'Versões locais recentes. Datas fornecidas por este aparelho.':'Ainda não há versões anteriores. A linhagem começa nas próximas alterações ou ao guardar um marco.');
    if(!already){bridge.show();}
   }catch(e){bridge.message(e.message);}
  }
  byId('start-lineage').addEventListener('click',function(){open(false);},false);
  byId('lineage-close').addEventListener('click',bridge.close,false);
  byId('lineage-mark').addEventListener('click',function(){try{bridge.mark();open(true);status('Marco guardado no histórico desta folha.');}catch(e){status(e.message);}},false);
 };
}(window));

;
/* Fonte: src/storage/cadernos.js */
/* Cadernos: dados ES5, independente da apresentação. */
(function (root) {
  'use strict';
  var E = root.Escr, key = 'escrevaral.astra.notebooks.v1', prefix = 'escrevaral.astra.v1.doc.';
  var originalKey = 'escrevaral.astra.originais.v1';
  var journalKey = 'escrevaral.astra.notebooks.transaction.v1';
  var globals = ['vrda-planner', 'escrevaral.astra.theme', 'escrevaral.astra.focus', 'escrevaral.astra.letter', 'escrevaral.astra.font-size', 'escrevaral.astra.restricted-paste', 'escrevaral.astra.pomodoro.v1', 'escrevaral.astra.session.v1', 'escrevaral.astra.current'];
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function array(value) { return Object.prototype.toString.call(value) === '[object Array]'; }
  function name(value) { return String(value || '').replace(/^\s+|\s+$/g, '').slice(0, 120); }
  function id() { return 'book-' + E.freshDocument().id; }
  function validBook(book) {
    return book && /^[a-z0-9-]+$/.test(book.id) && typeof book.id === 'string' && typeof book.name === 'string' && !!name(book.name) && book.name.length <= 120 &&
      array(book.aliases) && book.aliases.every(function (n) { return typeof n === 'string' && n.length <= 120; }) &&
      /^#[0-9a-f]{6}$/i.test(book.color) && book.data && typeof book.data === 'object' && !array(book.data) &&
      (typeof book.trashed === 'undefined' || typeof book.trashed === 'boolean') &&
      (typeof book.originalId === 'undefined' || book.originalId === null || (typeof book.originalId === 'string' && /^orig-[a-z0-9-]+$/.test(book.originalId)));
  }
  function validOriginal(o) {
    return o && typeof o.id === 'string' && /^orig-[a-z0-9-]+$/.test(o.id) && typeof o.name === 'string' && !!name(o.name) && o.name.length <= 120 && /^#[0-9a-f]{6}$/i.test(o.color) && (typeof o.trashed === 'undefined' || typeof o.trashed === 'boolean');
  }
  function create(storage) {
    var originals = [], books = [], colors = ['#c4cfc2', '#b2826a', '#859480', '#c2a649', '#a39b8b', '#997382'];
    function recover() {
      var raw = storage.getItem(journalKey); if (!raw) { return; }
      var journal = JSON.parse(raw);
      if (!journal || !array(journal.before) || !journal.before.every(function (p) { return array(p) && p.length === 2 && typeof p[0] === 'string' && (p[0] === key || p[0] === originalKey || p[0].indexOf(prefix) === 0 || globals.indexOf(p[0]) !== -1) && (p[1] === null || typeof p[1] === 'string'); })) { throw new Error('Registro de recuperação inválido. Preserve uma cópia dos dados.'); }
      /* Libera primeiro as chaves novas, inclusive sob falta de espaço. */
      journal.before.forEach(function (p) { if (p[1] === null) { storage.removeItem(p[0]); } });
      journal.before.forEach(function (p) { if (p[1] !== null) { storage.setItem(p[0], p[1]); } });
      storage.removeItem(journalKey);
    }
    function reload() {
      var raw = storage.getItem(key), next = raw ? JSON.parse(raw) : [];
      if (!array(next) || !next.every(validBook)) { throw new Error('Não foi possível ler os cadernos. Os dados foram preservados.'); }
      var rawOriginals = storage.getItem(originalKey), nextOriginals = rawOriginals ? JSON.parse(rawOriginals) : [];
      if (!array(nextOriginals) || !nextOriginals.every(validOriginal)) { throw new Error('Não foi possível ler as gavetas. Os dados foram preservados.'); }
      var seen = Object.create(null), seenBooks = Object.create(null);
      nextOriginals.forEach(function (o) { if (seen[o.id]) { throw new Error('Gaveta repetida no acervo.'); } seen[o.id] = o; });
      next.forEach(function (b) { if (seenBooks[b.id] || (b.originalId && !seen[b.originalId])) { throw new Error('Vínculo de caderno incompleto. Preserve uma cópia do acervo.'); } seenBooks[b.id] = true; });
      originals = nextOriginals; books = next; return books;
    }
    function commit(next) { if (storage.getItem(journalKey)) { throw new Error('Há uma recuperação pendente. Reabra o aplicativo.'); } storage.setItem(key, JSON.stringify(next)); books = next; }
    function transaction(writes) {
      if (storage.getItem(journalKey)) { throw new Error('Há uma recuperação pendente. Reabra o aplicativo.'); }
      var before = writes.map(function (p) { return [p[0], storage.getItem(p[0])]; });
      storage.setItem(journalKey, JSON.stringify({ before: before }));
      try { writes.forEach(function (p) { storage.setItem(p[0], p[1]); }); reload(); storage.removeItem(journalKey); }
      catch (e) { try { recover(); reload(); } catch (rollback) { throw new Error('A importação foi interrompida. Reabra o aplicativo para recuperar o estado anterior.'); } throw e; }
    }
    function original(origId) { for (var i = 0; i < originals.length; i += 1) { if (originals[i].id === origId) { return originals[i]; } } return null; }
    function parentId(origId) {
      if (origId === null || typeof origId === 'undefined') { return null; }
      if (typeof origId !== 'string' || !original(origId) || original(origId).trashed) { throw new Error('Escolha uma gaveta disponível.'); }
      return origId;
    }
    function duplicate(list, title, origId, except) { return list.some(function (b) { return b.id !== except && !b.trashed && (b.originalId || null) === (origId || null) && b.name.toLowerCase() === title.toLowerCase(); }); }
    function makeOriginal(title) { return { id: 'orig-' + E.freshDocument().id, name: name(title), color: '#2e382d', created: new Date().toISOString(), trashed: false }; }
    function addOriginal(title) {
      reload(); title = name(title); if (!title) { throw new Error('Dê um nome à gaveta.'); }
      if (originals.some(function (o) { return !o.trashed && o.name.toLowerCase() === title.toLowerCase(); })) { throw new Error('Já existe uma gaveta com esse nome.'); }
      var o = makeOriginal(title); transaction([[originalKey, JSON.stringify(originals.concat([o]))]]); return clone(o);
    }
    function updateOriginal(origId, changes) {
      reload(); var next = clone(originals), found = null;
      next.forEach(function (o) { if (o.id === origId) { found = o; } });
      if (!found) { throw new Error('Gaveta não encontrada.'); }
      if (typeof changes.name !== 'undefined') { found.name = name(changes.name); }
      if (typeof changes.trashed !== 'undefined') { found.trashed = changes.trashed; }
      if (!validOriginal(found) || next.some(function (o) { return o.id !== origId && !o.trashed && !found.trashed && o.name.toLowerCase() === found.name.toLowerCase(); })) { throw new Error('Confira o nome da gaveta; ele deve ser único.'); }
      /* A lixeira da gaveta conserva o estado individual de cada caderno. */
      transaction([[originalKey, JSON.stringify(next)]]); return clone(found);
    }
    function repairExperiment() {
      var raw = storage.getItem(key), next = raw ? JSON.parse(raw) : [], rawOriginals = storage.getItem(originalKey), os = rawOriginals ? JSON.parse(rawOriginals) : [], changed = false, seen = Object.create(null);
      if (!array(next) || !array(os) || !os.every(validOriginal)) { throw new Error('Acervo inválido. Os dados foram preservados.'); }
      os.forEach(function (o) { seen[o.id] = o; });
      next.forEach(function (b) {
        if (!b || typeof b !== 'object') { throw new Error('Caderno inválido.'); }
        if (b.originalId && typeof b.originalId === 'object' && Object.keys(b.originalId).length === 1 && typeof b.originalId.originalId === 'string') { b.originalId = b.originalId.originalId; changed = true; }
        if (!validBook(b)) { throw new Error('Caderno inválido. Os dados foram preservados.'); }
        if (b.originalId && !seen[b.originalId]) {
          var o = makeOriginal(b.name + ' — recuperado'); o.id = b.originalId; os.push(o); seen[o.id] = o; changed = true;
        }
      });
      if (changed) { transaction([[originalKey, JSON.stringify(os)], [key, JSON.stringify(next)]]); }
    }
    function make(title, origId) { return { id: id(), name: name(title), originalId: origId || null, aliases: [], color: colors[books.length % colors.length], data: {}, created: new Date().toISOString() }; }
    function find(bookId) { for (var i = 0; i < books.length; i += 1) { if (books[i].id === bookId) { return books[i]; } } return null; }
    function resolve(doc) {
      if (doc.projectId) { return find(doc.projectId); }
      var title = name(doc.project), i;
      if (!title && doc.kind === 'reminder') { return null; }
      for (i = 0; i < books.length; i += 1) { if (books[i].aliases.indexOf(title) !== -1 || (title && books[i].name === title)) { return books[i]; } }
      return null;
    }
    function decorate(doc) { var book = resolve(doc); if (book) { doc.projectId = book.id; doc.project = book.name; } return doc; }
    function migrate(documents) {
      reload(); var next = clone(books), changed = false;
      documents.forEach(function (doc) {
        if (resolve(doc) || (!doc.projectId && !name(doc.project) && doc.kind === 'reminder')) { return; }
        var title = name(doc.project), book = make(title || 'Avulsos');
        if (doc.projectId && /^[a-z0-9-]+$/.test(doc.projectId)) { book.id = doc.projectId; }
        book.aliases = [title]; next.push(book); books = next; changed = true;
      });
      if (changed) { try { commit(next); } catch (e) { reload(); throw e; } }
    }
    function add(title, origId) {
      reload(); title = name(title); if (!title) { throw new Error('Dê um nome ao caderno.'); }
      origId = parentId(origId);
      if (duplicate(books, title, origId)) { throw new Error('Já existe um caderno com esse nome.'); }
      var book = make(title, origId); commit(books.concat([book])); return book;
    }
    function update(bookId, changes) {
      reload(); var next = clone(books), book = null;
      next.forEach(function (b) { if (b.id === bookId) { book = b; } });
      if (!book) { throw new Error('Caderno não encontrado.'); }
      Object.keys(changes).forEach(function (k) { if (k !== 'id' && k !== 'aliases') { book[k] = clone(changes[k]); } });
      book.originalId = parentId(book.originalId);
      if (duplicate(next, book.name, book.originalId, book.id)) { throw new Error('Já existe um caderno com esse nome nesta gaveta ou mesa.'); }
      if (!validBook(book)) { throw new Error('Dados do caderno inválidos.'); } commit(next); return book;
    }
    function purge(bookId) {
      reload();
      var next = books.filter(function (b) { return b.id !== bookId; });
      if (next.length === books.length) { return false; }
      commit(next);
      return true;
    }
    function pack(documents, bookId, origId) {
      reload(); var selected = bookId ? books.filter(function (b) { return b.id === bookId; }) : origId ? books.filter(function (b) { return b.originalId === origId; }) : books;
      if (origId && !original(origId)) { throw new Error('Gaveta não encontrada.'); }
      var selectedIds = Object.create(null), parentIds = Object.create(null);
      selected.forEach(function (b) { selectedIds[b.id] = true; if (b.originalId) { parentIds[b.originalId] = true; } });
      if (origId) { parentIds[origId] = true; }
      var selectedOriginals = originals.filter(function (o) { return (!bookId && !origId) || parentIds[o.id]; });
      if (bookId && !selected.length) { throw new Error('Abra um caderno para exportar.'); }
      var docs = documents.map(function (d) { return decorate(clone(d)); }).filter(function (d) { return (!bookId && !origId) || !!selectedIds[d.projectId]; });
      var payload = { format: 'escrevaral-cadernos', version: 2, scope: bookId ? 'notebook' : origId ? 'original' : 'all', originals: clone(selectedOriginals), notebooks: clone(selected), documents: docs, globals: {} };
      if (!bookId && !origId) { globals.forEach(function (k) { var v = storage.getItem(k); if (v !== null) { payload.globals[k] = v; } }); }
      payload.inventory = { originals: selectedOriginals.length, notebooks: selected.length, documents: docs.length };
      if (E.cartorio && E.cartorio.sealPackage) { payload.cartorio = E.cartorio.sealPackage(payload); }
      return payload;
    }
    function validate(payload) {
      var ids = Object.create(null), records = Object.create(null);
      if (!payload || payload.format !== 'escrevaral-cadernos' || [1, 2].indexOf(payload.version) === -1 || (payload.version === 1 ? ['all', 'notebook'] : ['all', 'notebook', 'original']).indexOf(payload.scope) === -1 || !array(payload.notebooks) || !array(payload.documents) || !payload.notebooks.every(validBook) || !payload.documents.every(E.validDocument) || !payload.inventory || payload.inventory.notebooks !== payload.notebooks.length || payload.inventory.documents !== payload.documents.length || (payload.scope === 'notebook' && payload.notebooks.length !== 1)) { throw new Error('Pacote de caderno inválido ou incompleto.'); }
      var parents = Object.create(null);
      if (payload.version === 2) {
        if (!array(payload.originals) || !payload.originals.every(validOriginal) || payload.inventory.originals !== payload.originals.length || (payload.scope === 'original' && payload.originals.length !== 1)) { throw new Error('Cadastro de gavetas incompleto.'); }
        payload.originals.forEach(function (o) { if (parents[o.id]) { throw new Error('Gaveta repetida no pacote.'); } parents[o.id] = true; });
        payload.notebooks.forEach(function (b) { if ((b.originalId && !parents[b.originalId]) || (payload.scope === 'original' && b.originalId !== payload.originals[0].id)) { throw new Error('Vínculo de gaveta incompleto.'); } });
        if (payload.scope === 'notebook' && (payload.originals.length !== (payload.notebooks[0].originalId ? 1 : 0))) { throw new Error('Gavetas fora do caderno selecionado.'); }
      }
      payload.notebooks.forEach(function (b) { if (ids[b.id]) { throw new Error('Caderno repetido no pacote.'); } ids[b.id] = true; if (b.data.planner && !E.validPlanner(b.data.planner)) { throw new Error('Calendário inválido no caderno.'); } if (typeof b.data.chalk !== 'undefined' && !E.chalk.valid(b.data.chalk)) { throw new Error('Desenho inválido no caderno.'); } if (typeof b.data.story !== 'undefined' && !E.story.valid(b.data.story)) { throw new Error('Fichas ou cenas inválidas no caderno.'); } });
      payload.documents.forEach(function (d) {
        if (records[d.id] || (d.projectId && !ids[d.projectId]) || (!d.projectId && (payload.scope !== 'all' || d.kind !== 'reminder'))) { throw new Error('Vínculos incompletos no pacote.'); } records[d.id] = true;
      });
      if (!payload.globals || typeof payload.globals !== 'object' || array(payload.globals) || (payload.scope !== 'all' && Object.keys(payload.globals).length)) { throw new Error('Dados gerais inválidos.'); }
      Object.keys(payload.globals).forEach(function (k) { if (globals.indexOf(k) === -1 || typeof payload.globals[k] !== 'string') { throw new Error('Preferência desconhecida no pacote.'); } });
      if (payload.globals['vrda-planner'] && !E.validPlanner(JSON.parse(payload.globals['vrda-planner']))) { throw new Error('Calendário geral inválido.'); }
      if (typeof payload.cartorio !== 'undefined' && E.cartorio && E.cartorio.validPackageSeal && !E.cartorio.validPackageSeal(payload.cartorio)) { throw new Error('Selo do Cartório inválido no pacote.'); }
      return payload;
    }
    function bring(payload) {
      validate(payload); reload();
      var next = clone(books), mapping = Object.create(null), noteIds = Object.create(null), recordIds = Object.create(null), writes = [], copied = 0;
      var nextOriginals = clone(originals), parentMapping = Object.create(null);
      (payload.version === 2 ? payload.originals : []).forEach(function (source) {
        var o = clone(source), conflict = nextOriginals.some(function (n) { return n.id === o.id || (!n.trashed && n.name.toLowerCase() === o.name.toLowerCase()); });
        if (conflict) { o.sourceOriginalId = source.id; o.id = makeOriginal(o.name).id; var base = name(o.name).slice(0, 95), n = 1; do { o.name = base + ' — cópia ' + n; n += 1; } while (nextOriginals.some(function (p) { return p.name.toLowerCase() === o.name.toLowerCase(); })); }
        parentMapping[source.id] = o.id; nextOriginals.push(o);
      });
      payload.notebooks.forEach(function (source) {
        var b = clone(source); b.originalId = parentMapping[source.originalId] || null;
        var conflict = !!find(b.id) || duplicate(next, b.name, b.originalId);
        if (conflict) { b.sourceNotebookId = source.id; b.id = id(); var base = name(source.name).slice(0, 95), n = 1; do { b.name = base + ' — cópia ' + n; n += 1; } while (duplicate(next, b.name, b.originalId)); copied += 1; }
        /* Importados têm vínculos explícitos; aliases não capturam folhas antigas locais. */
        b.aliases = []; mapping[source.id] = b; next.push(b);
      });
      payload.documents.forEach(function (source) {
        var d = clone(source), b = mapping[d.projectId], conflict = storage.getItem(prefix + d.id) !== null || (b && b.id !== source.projectId), logical = d.noteId || d.id;
        if (conflict) { if (!noteIds[logical]) { noteIds[logical] = E.freshDocument().id; } d.sourceRecordId = source.id; d.sourceNoteId = logical; d.id = E.freshDocument().id; d.noteId = noteIds[logical]; }
        recordIds[source.id] = d.id;
        if (b) { d.projectId = b.id; d.project = b.name; }
        writes.push([prefix + d.id, JSON.stringify(d)]);
      });
      Object.keys(mapping).forEach(function (k) { var b = mapping[k]; if (b.resume && noteIds[b.resume.noteId]) { b.resume.noteId = noteIds[b.resume.noteId]; } if (b.data.story) { b.data.story = E.story.remap(b.data.story, noteIds); } });
      writes.push([originalKey, JSON.stringify(nextOriginals)]);
      writes.push([key, JSON.stringify(next)]);
      Object.keys(payload.globals).forEach(function (k) {
        var value = payload.globals[k];
        if (k === 'escrevaral.astra.current') { value = recordIds[value] || value; }
        if (k === 'escrevaral.astra.session.v1') { return; } /* A mesa mostra os cadernos importados. */
        writes.push([k, value]);
      });
      transaction(writes); return { notebooks: payload.notebooks.length, documents: payload.documents.length, copies: copied };
    }
    recover(); repairExperiment(); reload();
    var originalModel = { list: function () { reload(); return clone(originals); }, get: function (origId) { reload(); var o = original(origId); return o ? clone(o) : null; }, add: addOriginal, update: updateOriginal };
    return { originals: originalModel, list: function () { return clone(reload()); }, get: function (bookId) { reload(); var b = find(bookId); return b ? clone(b) : null; }, add: add, update: update, purge: purge, resolve: resolve, decorate: decorate, migrate: migrate, pack: pack, validate: validate, bring: bring };
  }
  E.createNotebooks = create;
  E.createOriginals = function (storage) { return create(storage).originals; };

}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/storage/modelos.js */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var TEMPLATES = [
    {
      id: 'livro-ficcao',
      title: '1. Livro de ficção',
      defaultProjectName: 'Meu Romance',
      description: 'Uma história pode começar por uma pessoa, uma cena ou uma ideia. Encontre espaço para desenvolvê-la.',
      folders: [
        {
          name: '01 · Estrutura',
          notes: [
            {
              title: '01. A história em poucas palavras',
              content: '# A história em poucas palavras\n\nPode começar pela parte que você já imagina: uma pessoa, um lugar ou algo que aconteceu. As outras ideias podem vir depois.\n\n## Quem está no centro da história?\n« Quem vamos acompanhar? Pode ser uma pessoa, um grupo ou alguém que você ainda está inventando. »\n\n## O que põe a história em movimento?\n« Algo chama a atenção, muda uma rotina ou desperta uma vontade. Por exemplo: alguém recebe uma carta enviada há muitos anos. O que acontece na sua história? »\n\n## O que você quer explorar?\n« Há uma pergunta ou um assunto que volta às suas ideias? Pode ser amizade, uma mudança de lugar, um segredo — ou algo que ainda não tem nome. »\n\n## A história contada por você\n« Como você contaria essa ideia para alguém? Algumas frases já bastam. O final pode ficar em aberto por enquanto. »'
            },
            {
              title: '02. Um caminho em três atos',
              content: '# Um caminho em três atos\n\nTrês atos são uma possibilidade de organizar a história: começo, mudanças e desfecho. Você pode experimentar essa ordem, mudar tudo ou voltar aqui depois de escrever.\n\n## Ato I — O começo\n- Uma primeira cena: « Onde encontramos quem está no centro da história? Um gesto ou uma conversa pode mostrar como é sua vida. »\n- Algo muda: « O que faz essa pessoa sair da rotina ou olhar para ela de outro jeito? »\n\n## Ato II — As mudanças\n- Tentativas: « O que essa pessoa faz a partir daí? »\n- Um encontro ou uma descoberta: « O que muda a direção da história? Por exemplo: quem parecia distante oferece ajuda. »\n- Uma escolha: « Há algo que fica difícil de decidir? Se não houver, o que você gostaria de acompanhar nessa parte? »\n\n## Ato III — O desfecho\n- O que acontece: « Onde você imagina que essa história chega? Algumas coisas podem se resolver e outras continuar abertas. »\n- Uma última cena: « Que imagem, gesto ou conversa poderia ficar com quem leu? »'
            }
          ]
        },
        {
          name: '02 · Personagens',
          notes: [
            {
              title: '03. Quem está no centro',
              content: '# Quem está no centro\n\nPode começar por alguém que você já imagina. Outros detalhes podem aparecer enquanto escreve.\n\n## Um primeiro retrato\n- Nome: « Como essa pessoa se chama? Um nome provisório também serve. »\n- Vida cotidiana: « Como é um dia comum para essa pessoa? »\n- Um detalhe: « O que você percebe nela? Por exemplo: guarda os bilhetes no bolso ou canta enquanto espera. »\n\n## O que essa pessoa quer?\n« Pode ser algo pequeno ou algo que mude sua vida: devolver uma carta, reencontrar alguém, aprender a dizer não. Qual vontade combina com ela? »\n\n## O que dificulta isso?\n« Talvez outra pessoa, uma distância, uma dúvida — ou algo que você ainda vai descobrir. »'
            },
            {
              title: '04. Pessoas e obstáculos',
              content: '# Pessoas e obstáculos\n\nA história pode encontrar resistência numa pessoa, numa situação ou no próprio lugar onde acontece. Nem toda história precisa de um vilão.\n\n## O que se coloca no caminho?\n« Quem ou o que dificulta as coisas? Pode ser uma disputa, uma regra, uma tempestade ou uma vontade diferente. »\n\n## Se houver alguém do outro lado\n« O que essa pessoa quer? Como isso se cruza com a vontade de quem estamos acompanhando? »'
            }
          ]
        },
        {
          name: '03 · Universo',
          notes: [
            {
              title: '05. Universo da história',
              content: '# Universo da história\n\nUm lugar pode começar com um único detalhe. Guarde aqui o que ajuda você a imaginá-lo.\n\n## Onde e quando?\n« Em que lugar e tempo a história acontece? Pode ser um bairro conhecido, outra época ou um mundo inventado. »\n\n## O que se percebe ali?\n« Que som, cheiro ou sensação aparece primeiro? Por exemplo: o portão range antes de alguém chegar. »\n\n## Costumes, regras e descobertas\n« O que você quer lembrar sobre esse mundo? Anote também o que precisa pesquisar e onde encontrou uma informação. »'
            }
          ]
        },
        {
          name: '04 · Manuscrito',
          notes: [
            {
              title: '06. Capítulo 01',
              content: '# Capítulo 01 — « Um título para este capítulo »\n\n« Uma voz, uma ação pequena ou um detalhe do lugar: por onde sua história começa? »'
            },
            {
              title: '07. Capítulo 02',
              content: '# Capítulo 02 — « Um título para este capítulo »\n\n« Qual parte da história você tem vontade de contar agora? »'
            },
            {
              title: '08. Capítulo 03',
              content: '# Capítulo 03 — « Um título para este capítulo »\n\n« Continue pela cena, conversa ou lembrança que está mais viva para você. »'
            }
          ]
        },
        {
          name: '05 · Revisão',
          notes: [
            {
              title: '09. Um novo olhar sobre o livro',
              content: '# Um novo olhar sobre o livro\n\nDepois de escrever, uma pausa pode ajudar a perceber o texto de outro jeito. Estas perguntas são pontos de atenção; você decide o que faz sentido mudar.\n\n- [ ] Consigo acompanhar o que acontece e quem participa?\n- [ ] Há algum trecho em que me falta uma informação — ou em que explico mais do que gostaria?\n- [ ] Ao ler um diálogo em voz alta, reconheço o jeito de falar de cada pessoa?\n- [ ] Conferi nomes, datas e detalhes que reaparecem?\n- [ ] Fiz uma leitura final de ortografia e pontuação, preservando as escolhas de linguagem do texto?'
            }
          ]
        }
      ]
    },
    {
      id: 'livro-nao-ficcao',
      title: '2. Livro de não ficção',
      defaultProjectName: 'Meu livro de não ficção',
      description: 'Investigue uma pergunta, conte uma experiência ou compartilhe o que você conhece.',
      folders: [
        {
          name: '01 · Estrutura',
          notes: [
            {
              title: '01. Ideia e leitor',
              content: '# Ideia e leitor\n\nUm livro pode nascer de uma pergunta, uma experiência ou algo que você quer compartilhar.\n\n## O que você quer explorar?\n« Qual assunto ou lembrança pede mais espaço? Por exemplo: como uma receita mudou ao passar de uma pessoa para outra. »\n\n## Com quem você quer conversar?\n« Quem pode se interessar por esse assunto? O que essa pessoa talvez já conheça ou queira descobrir? »\n\n## Uma ordem possível\n1. Introdução: « Por onde essa conversa pode começar? »\n2. Primeira parte: « Que assunto você quer explorar primeiro? »\n3. Próxima parte: « O que se liga a esse assunto? »\n4. Fechamento: « Que descoberta, reflexão ou pergunta pode ficar com quem leu? »'
            }
          ]
        },
        {
          name: '02 · Pesquisa',
          notes: [
            {
              title: '02. Pesquisa e fontes',
              content: '# Pesquisa e fontes\n\nGuarde a informação junto de sua origem. Isso ajuda a reencontrá-la e a distinguir suas palavras das de outra pessoa.\n\n## Uma informação que vale guardar\n« Que dado, trecho ou descoberta pode ajudar seu texto? Ao copiar palavras de alguém, indique que são uma citação. »\n\nDe onde veio?\n« Anote autoria, título e página ou endereço. Se for uma conversa, registre com quem foi e a data. »'
            }
          ]
        },
        {
          name: '03 · Manuscrito',
          notes: [
            {
              title: '03. Introdução',
              content: '# Introdução\n\n## De onde nasce este livro?\n« Comece por uma lembrança, uma observação ou uma pergunta que trouxe você até este assunto. »'
            },
            {
              title: '04. Capítulo 01',
              content: '# Capítulo 01 — « Um título para este capítulo »\n\n« Que pergunta, experiência ou ideia você quer desenvolver nesta parte? Comece pelo que já tem vontade de contar. »'
            }
          ]
        }
      ]
    },
    {
      id: 'coletanea',
      title: '3. Coletânea',
      defaultProjectName: 'Minha Coletânea',
      description: 'Reúna contos, crônicas ou poemas. As ligações e a ordem podem aparecer depois.',
      folders: [
        {
          name: '01 · Conceito',
          notes: [
            {
              title: '01. O que aproxima os textos',
              content: '# O que aproxima os textos\n\nVocê pode reunir os textos primeiro e descobrir depois o que os aproxima.\n\n## Uma ligação possível\n« Há um lugar, um assunto ou um jeito de olhar que aparece mais de uma vez? Por exemplo: lembranças de uma rua, em épocas diferentes. »'
            }
          ]
        },
        {
          name: '02 · Ideias',
          notes: [
            {
              title: '02. Ideias e fragmentos',
              content: '# Ideias e fragmentos\n\nUma frase ouvida, uma imagem, um título provisório: cabe aqui mesmo que você ainda não saiba o que fazer com isso.\n\n- Uma ideia: « O que chamou sua atenção? Pode ser uma imagem simples, como uma cadeira na calçada depois da chuva. »\n- Outra ideia: « Há uma palavra, uma fala ou uma lembrança que você quer guardar? »'
            }
          ]
        },
        {
          name: '03 · Em escrita',
          notes: [
            {
              title: '03. Texto 01',
              content: '# « Um título para este conto, crônica ou poema »\n\n« Comece pela imagem, pela frase ou pelo ritmo que você tem em mente. O texto pode encontrar sua forma enquanto cresce. »'
            }
          ]
        }
      ]
    },
    {
      id: 'roteiro',
      title: '4. Roteiro',
      defaultProjectName: 'Meu Roteiro',
      description: 'Imagine cenas, ações e conversas. Pequenos exemplos ajudam a começar.',
      folders: [
        {
          name: '01 · Estrutura',
          notes: [
            {
              title: '01. A história em cenas',
              content: '# A história em cenas\n\nUma cena mostra algo acontecendo num lugar e num momento.\n\n## A ideia do roteiro\n« O que você gostaria de ver acontecer na tela? Algumas palavras já podem guardar essa ideia. »'
            }
          ]
        },
        {
          name: '02 · Cenas',
          notes: [
            {
              title: '02. Primeiras cenas',
              content: '# Primeiras cenas\n\n« INT. indica um espaço interno; EXT., um espaço ao ar livre. O cabeçalho situa a cena. Na ação, vale o que podemos ver ou ouvir. »\n\nCENA 01 — INT. « LUGAR DA PRIMEIRA CENA » — DIA\n\n« O que vemos ou ouvimos aqui? Por exemplo: Lia fecha o guarda-chuva. Uma poça se forma junto à porta. »\n\n« NOME DE QUEM FALA PRIMEIRO »\n« O que essa pessoa diz? Por exemplo: Você guardou um lugar para mim? »\n\n« NOME DE QUEM RESPONDE »\n« Qual é a resposta? Um silêncio ou um gesto também pode fazer parte da cena. »'
            }
          ]
        }
      ]
    },
    {
      id: 'nota-avulsa',
      title: '5. Texto avulso',
      defaultProjectName: 'Meus textos',
      description: 'Dê espaço a uma observação, pergunta ou lembrança, no tamanho que ela pedir.',
      folders: [
        {
          name: 'Textos',
          notes: [
            {
              title: '01. Novo texto',
              content: '# « Um título para este texto »\n\n« Uma observação, uma pergunta ou uma lembrança já pode ser um começo. Use as partes que ajudarem; um texto curto pode caber numa só. »\n\n## Abertura\n« O que você quer trazer para esta conversa? Pode partir de uma situação pequena, como encontrar um objeto esquecido. »\n\n## Fechamento\n« O que você quer deixar com quem leu? Pode ser uma imagem, uma pergunta ou uma ideia. »'
            }
          ]
        }
      ]
    },
    {
      id: 'soneto',
      title: '6. Soneto',
      defaultProjectName: 'Meu soneto',
      description: 'Escreva com métrica e rimas acompanhadas na página, verso a verso, e explore finais semelhantes.',
      folders: [
        {
          name: '01 · Preparação',
          notes: [
            {
              title: '01. A ideia e a forma',
              content: '# A ideia e a forma\n\nVocê pode começar por uma imagem, um som ou um verso. Para escrever diretamente com acompanhamento automático, abra 03. Meu soneto.\n\n## O que pede um poema?\n« Que imagem, lembrança ou pergunta você quer explorar neste soneto? »\n\n## Quem fala, e para quem?\n« De onde vem esta voz? Ela conversa com alguém, observa uma cena ou pensa consigo? »'
            },
            {
              title: '02. Métrica e rimas',
              content: '# Métrica e rimas\n\nLeia o verso em voz alta, no ritmo que ele pede. Conte os sons até a última sílaba tônica: as sílabas que vêm depois dela não entram na medida.\n\nExemplo: Meu verso nasce lento nesta tarde (10 sílabas poéticas — decassílabo heroico).'
            }
          ]
        },
        {
          name: '02 · Poema',
          notes: [
            {
              title: '03. Meu soneto',
              role: 'sonnet',
              sonnetSettings: { structure: 'italian', scheme: 'ABBA ABBA CDC DCD', target: 10, rhythm: 'none' },
              content: ''
            }
          ]
        },
        {
          name: '03 · Revisão',
          notes: [
            {
              title: '04. Escansão dos versos',
              content: '# Escansão dos versos\n\nUse esta folha depois de escrever para conferir sua leitura em voz alta.\n\n- [ ] Conferi os 14 versos e a divisão 4–4–3–3 escolhida?\n- [ ] A medida e os apoios correspondem à leitura que quero fazer?\n- [ ] As rimas se confirmam pelo som?'
            }
          ]
        }
      ]
    },
    {
      id: 'redacao-enem',
      title: '7. Redação do Enem',
      defaultProjectName: 'Minha redação do Enem',
      description: 'Do tema à revisão: organize a tese, desenvolva argumentos e construa sua proposta de intervenção.',
      folders: [
        {
          name: '01 · Planejamento',
          notes: [
            {
              title: '01. Tema e ponto de vista',
              content: '# Tema e ponto de vista\n\nComece pelo tema, reúna argumentos e escreva em 04. Minha redação.\n\n## Proposta de redação\n« Registre a frase temática completa e a origem da proposta. »\n\n## Minha tese\n« Em uma ou duas frases, o que você defende sobre esse problema? Vá além de dizer que ele é importante. »'
            },
            {
              title: '02. Argumentos e repertório',
              content: '# Argumentos e repertório\n\n## Primeiro argumento\n« Qual é a ideia central deste argumento? »\n\n## Segundo argumento\n« Qual é a ideia central do segundo argumento? O que ela acrescenta à primeira? »'
            },
            {
              title: '03. Proposta de intervenção',
              content: '# Proposta de intervenção\n\n- Ação: « Que medida você propõe? »\n- Agente: « Quem tem condições e responsabilidade para executar essa ação? »\n- Meio: « Por quais recursos ou canais a ação será realizada? »\n- Efeito: « Que resultado essa medida busca alcançar? »\n- Detalhamento: « Aprofunde um dos elementos acima. »'
            }
          ]
        },
        {
          name: '02 · Redação',
          notes: [
            {
              title: '04. Minha redação',
              content: '« Introdução: apresente o recorte do tema e seu ponto de vista. Se usar uma referência, explique sua relação com o problema. »\n\n« Desenvolvimento 1: apresente o primeiro argumento, explique como ele funciona e sustente-o com um exemplo ou conhecimento pertinente. Relacione a análise à sua tese. »\n\n« Desenvolvimento 2: acrescente o segundo argumento, desenvolva a explicação e mostre o que a evidência escolhida ajuda a compreender. Conecte esta parte à anterior. »\n\n« Conclusão: retome sua posição e apresente uma intervenção ligada ao problema discutido. Deixe claros ação, agente, meio, efeito pretendido e um detalhamento, respeitando os direitos humanos. »'
            }
          ]
        },
        {
          name: '03 · Revisão',
          notes: [
            {
              title: '05. Revisão da redação',
              content: '# Revisão da redação\n\n- [ ] Competência 1: Revisei ortografia, pontuação e concordância?\n- [ ] Competência 2: Respondo ao recorte completo da proposta?\n- [ ] Competência 3: Minha tese está clara e os argumentos sustentam?\n- [ ] Competência 4: Os parágrafos se conectam com clareza?\n- [ ] Competência 5: Explicitei ação, agente, meio, efeito e detalhamento?'
            }
          ]
        },
        {
          name: '04 · Referências',
          notes: [
            {
              title: '06. Referência · Redação nota 1000',
              category: 'reference',
              locked: true,
              content: 'Redação nota 1000 — Enem 2023\nAmanda Teixeira Zampiris\nTema: Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil.\n\nNa obra intitulada “Brasil, País do Futuro”, Stefan Zweig, autor austríaco, em sua visita ao Brasil, defendeu a ideia de que o país estava destinado a ser um dos mais importantes países do mundo no futuro. No entanto, 80 anos depois, as previsões do autor ainda não se concretizaram e os desafios para enfrentar a invisibilidade do trabalho de cuidado — realizado por mulheres — são entraves para isso. Observa-se, assim, que isso ocorre porque a negligência governamental e a permanência histórica impedem a resolução da questão.\n\nSob este viés, é preciso atentar para a omissão estatal presente nessa problemática. Nessa perspectiva, o pensador Thomas Hobbes afirma que o Estado é responsável por garantir o bem-estar da população. Entretanto, isso não ocorre no Brasil, pois a falta de atuação das autoridades corrobora a permanência do trabalho de cuidado não remunerado e mal pago realizado, principalmente, por mulheres — que inclui cuidar de crianças e idosos, bem como os afazeres domésticos —, visto que o Governo não tem cumprido seu papel no sentido de assegurar os direitos básicos a esse grupo social, como o direito a um salário digno. Assim, as funções sociais e estatais são descumpridas, agravando o problema.\n\nOutrossim, a permanência histórica é fator importante como constituinte desse imbróglio. Nesse sentido, consoante ao pensamento do antropólogo Claude Lévi-Strauss, só é possível compreender adequadamente as ações coletivas por meio do entendimento dos eventos históricos. Desse modo, a questão da invisibilidade do trabalho de cuidado feito por mulheres majoritariamente pobres e vítimas de discriminação de gênero, mesmo que fortemente presente no século XXI, apresenta raízes indissociáveis à história brasileira — que foi marcada pelo machismo e pelo patriarcado —, uma vez que as atividades domésticas não pagas ainda são delegadas às pessoas do sexo feminino de forma quase que exclusiva.\n\nFaz-se necessário, portanto, que meios sejam criados para intervir nesse óbice. Logo, o Governo Federal — órgão responsável pela administração federal em todo território nacional — deve estabelecer políticas públicas que garantam a remuneração e a valorização do trabalho de cuidado, por meio da utilização de verbas governamentais para o pagamento de salários. Tal ação deve ser realizada com a finalidade de mitigar a invisibilidade dos afazeres domésticos realizados pela mulher na sociedade brasileira e, consequentemente, combater as raízes históricas presentes nessa questão. Dessarte, o Brasil poderá se tornar um “País do Futuro”, como defendido por Stefan Zweig.\n\n---\nFonte: INEP/MEC. A redação do Enem 2024: cartilha do(a) participante. Reprodução integral autorizada com citação da fonte.'
            }
          ]
        }
      ]
    }
  ];

  var EXTRA_PLACEHOLDERS = [
    '« Um título para o seu soneto »',
    '« CLIQUE AQUI: LOCAL DA CENA 02 »',
    '« CLIQUE AQUI: LOCAL DA CENA »',
    '« CLIQUE AQUI: NOME DO PERSONAGEM »',
    '« CLIQUE AQUI: SEGUNDO PERSONAGEM »'
  ];

  var PLACEHOLDER_MAP = {};
  (function buildPlaceholders() {
    var i, j, k, re, m;
    for (i = 0; i < EXTRA_PLACEHOLDERS.length; i += 1) {
      PLACEHOLDER_MAP[EXTRA_PLACEHOLDERS[i]] = true;
    }
    for (i = 0; i < TEMPLATES.length; i += 1) {
      var folders = TEMPLATES[i].folders || [];
      for (j = 0; j < folders.length; j += 1) {
        var notes = folders[j].notes || [];
        for (k = 0; k < notes.length; k += 1) {
          re = /«[^«»]+»/g;
          while ((m = re.exec(notes[k].content || ''))) {
            PLACEHOLDER_MAP[m[0]] = true;
          }
        }
      }
    }
  }());

  function findTemplate(id) {
    var i;
    for (i = 0; i < TEMPLATES.length; i += 1) {
      if (TEMPLATES[i].id === id) { return TEMPLATES[i]; }
    }
    return null;
  }

  function placeholderAt(text, position) {
    if (typeof text !== 'string' || typeof position !== 'number') { return null; }
    var start = text.lastIndexOf('«', position);
    if (start < 0) { return null; }
    var closeIdx = text.indexOf('»', start);
    if (closeIdx < 0) { return null; }
    var end = closeIdx + 1;
    if (position < start || position >= end) { return null; }
    var value = text.slice(start, end);
    return Object.prototype.hasOwnProperty.call(PLACEHOLDER_MAP, value) ? { start: start, end: end, value: value } : null;
  }

  function clearTextareaPlaceholder(target) {
    if (!target || target.readOnly || target.disabled || target.selectionStart !== target.selectionEnd) { return false; }
    var match = placeholderAt(target.value || '', target.selectionStart);
    if (!match) { return false; }
    if (target.focus) { target.focus(); }
    if (target.setSelectionRange) { target.setSelectionRange(match.start, match.end); }
    var deleted = false;
    try {
      if (typeof document !== 'undefined' && document.execCommand) {
        deleted = document.execCommand('delete', false);
      }
    } catch (ignore) {}
    if (!deleted) {
      if (target.setRangeText) {
        target.setRangeText('', match.start, match.end, 'start');
      } else {
        target.value = target.value.slice(0, match.start) + target.value.slice(match.end);
        if (target.setSelectionRange) { target.setSelectionRange(match.start, match.start); }
      }
      try {
        target.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (ignore) {}
    }
    return true;
  }

  function createProjectFromTemplate(notebooks, archive, templateId, projectName, paletteId, originalId, noteFormat) {
    var tpl = findTemplate(templateId);
    if (!tpl) { throw new Error('Modelo não encontrado.'); }
    if (!notebooks || !archive) { throw new Error('Armazenamento indisponível.'); }

    var name = String(projectName || '').replace(/^\s+|\s+$/g, '') || tpl.defaultProjectName;
    var book = notebooks.add(name, originalId || null);

    var folderNames = [], i, j;
    for (i = 0; i < tpl.folders.length; i += 1) {
      folderNames.push(tpl.folders[i].name);
    }

    var nextData = book.data ? JSON.parse(JSON.stringify(book.data)) : {};
    nextData.template = tpl.id;
    nextData.folders = folderNames;
    if (paletteId && root.Escr.projectColors) {
      var pal = root.Escr.projectColors.byId(paletteId);
      if (pal) { nextData.palette = pal.id; book = notebooks.update(book.id, { color: pal.color, data: nextData }); }
      else { book = notebooks.update(book.id, { data: nextData }); }
    } else {
      book = notebooks.update(book.id, { data: nextData });
    }

    var createdNotes = [], firstPreferred = null;
    for (i = 0; i < tpl.folders.length; i += 1) {
      var folder = tpl.folders[i];
      for (j = 0; j < folder.notes.length; j += 1) {
        var spec = folder.notes[j];
        var d = root.Escr.freshDocument();
        d.projectId = book.id;
        d.project = book.name;
        d.folder = folder.name;
        d.title = spec.title;
        d.text = spec.content || '';
        if (spec.role) { d.role = spec.role; }
        if (spec.category) { d.category = spec.category; }
        if (spec.locked) { d.locked = true; }
        if (noteFormat === 'rich' && !spec.locked && spec.category !== 'reference' && spec.role !== 'sonnet') {
          d.format = 'rich';
          if (root.Escr.richCore && root.Escr.richCore.plainToSafeHtml) { d.richHtml = root.Escr.richCore.plainToSafeHtml(d.text); }
        } else {
          d.format = 'plain';
        }
        if (spec.sonnetSettings) { d.sonnetSettings = JSON.parse(JSON.stringify(spec.sonnetSettings)); }
        var saved = archive.save(d, false).document;
        createdNotes.push(saved);
        if (spec.role === 'sonnet') { firstPreferred = saved; } else if (!firstPreferred && spec.title.indexOf('01.') === 0) { firstPreferred = saved; }
      }
    }
    return { book: book, notes: createdNotes, firstNote: firstPreferred || createdNotes[0] || null };
  }

  root.Escr.templates = {
    list: function () { return TEMPLATES.slice(); },
    find: findTemplate,
    placeholderAt: placeholderAt,
    isPlaceholder: function (val) { return Object.prototype.hasOwnProperty.call(PLACEHOLDER_MAP, val); },
    clearTextareaPlaceholder: clearTextareaPlaceholder,
    createProject: createProjectFromTemplate
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/storage/lexico-p01.js */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var MAX_CACHE = 4;
  var CLASSES = {
    NOUN: 'substantivo',
    VERB: 'verbo',
    ADJ: 'adjetivo',
    ADV: 'advérbio',
    ADP: 'preposição',
    CCONJ: 'conjunção',
    SCONJ: 'conjunção',
    PRON: 'pronome',
    DET: 'determinante',
    NUM: 'numeral',
    INTJ: 'interjeição'
  };

  var LINKS = [
    ['wikt:casa:NOUN:0:0', 'construção que serve de moradia', 'own:03259505-n', ['lar', 'moradia', 'residência']],
    ['wikt:carro:NOUN:0:0', 'veículo com a capacidade de se movimentar guiado por um motorista, geralmente com a finalidade de transportar pessoas', 'own:02958343-n', ['automóvel', 'veículo', 'viatura']],
    ['wikt:ônibus:NOUN:0:0', 'veículo automóvel para transporte coletivo', 'escrevaral:onibus', ['coletivo']],
    ['wikt:bonito:ADJ:0:0', 'possuidor de beleza, agradável aos olhos', 'own:00217728-a', ['belo', 'formoso', 'lindo']],
    ['wikt:feliz:ADJ:0:0', 'que sente ou transmite felicidade', 'own:01048406-s', ['contente']],
    ['wikt:escrever:VERB:0:0', 'redigir', 'own:00993014-v', ['redigir']],
    ['wikt:começar:VERB:0:0', 'dar início a alguma coisa', 'own:00345761-v', ['iniciar', 'principiar']],
    ['wikt:terminar:VERB:0:0', 'acabar, encerrar, chegar ao fim', 'own:00352826-v', ['concluir', 'encerrar', 'finalizar']]
  ];

  function canonical(word) {
    var w = String(word || '');
    if (w.normalize) { w = w.normalize('NFC'); }
    return w.toLowerCase().replace(/^\s+|\s+$/g, '');
  }

  function bucketFor(word) {
    var hash = 0, i;
    for (i = 0; i < word.length; i += 1) {
      hash = (((hash << 5) - hash) + word.charCodeAt(i)) >>> 0;
    }
    var hex = (hash % 64).toString(16);
    return hex.length < 2 ? '0' + hex : hex;
  }

  function isValidWord(word) {
    var q = canonical(word);
    return q.length > 0 && q.length <= 64 && /^[a-zà-öø-ÿ]+(?:[-'’][a-zà-öø-ÿ]+)*$/.test(q);
  }

  function createService(opts) {
    opts = opts || {};
    var cache = {};
    var order = [];
    var inflight = {};
    var sessionPos = {};
    var sessionOrder = [];
    var MAX_SESSION_POS = 256;
    var baseUrl = opts.baseUrl || 'resources/pt-BR/lexico-ptbr/partes/';

    function putCache(id, part) {
      var idx = order.indexOf(id);
      if (idx >= 0) { order.splice(idx, 1); }
      cache[id] = part;
      order.push(id);
      while (order.length > MAX_CACHE) {
        var old = order.shift();
        delete cache[old];
      }
    }

    function defaultBrowserLoad(id, done) {
      if (typeof document === 'undefined' || !document.createElement) {
        done(new Error('Carregamento indisponível.'));
        return;
      }
      var g = typeof globalThis !== 'undefined' ? globalThis : root;
      g.EscrevaralLexicoDados = g.EscrevaralLexicoDados || {};
      if (g.EscrevaralLexicoDados[id]) {
        var existing = g.EscrevaralLexicoDados[id];
        delete g.EscrevaralLexicoDados[id];
        done(null, existing);
        return;
      }
      var script = document.createElement('script');
      var finished = false;
      var timer = null;
      function finish(err, data) {
        if (finished) { return; }
        finished = true;
        if (timer) { clearTimeout(timer); }
        script.onload = null;
        script.onerror = null;
        if (script.parentNode) { script.parentNode.removeChild(script); }
        done(err, data);
      }
      timer = setTimeout(function () { finish(new Error('Tempo esgotado.')); }, 6000);
      script.async = true;
      script.src = baseUrl + id + '.js';
      script.onload = function () {
        var data = g.EscrevaralLexicoDados && g.EscrevaralLexicoDados[id];
        if (g.EscrevaralLexicoDados) { delete g.EscrevaralLexicoDados[id]; }
        if (!data) { finish(new Error('Bloco incompleto.')); }
        else { finish(null, data); }
      };
      script.onerror = function () { finish(new Error('Bloco offline indisponível.')); };
      (document.head || document.body || document.documentElement).appendChild(script);
    }

    var loadPartFn = opts.loadPart || defaultBrowserLoad;

    function fetchPart(id, cb) {
      if (Object.prototype.hasOwnProperty.call(cache, id)) {
        putCache(id, cache[id]);
        cb(null, cache[id]);
        return;
      }
      if (inflight[id]) {
        inflight[id].push(cb);
        return;
      }
      inflight[id] = [cb];
      loadPartFn(id, function (err, part) {
        var waiters = inflight[id] || [];
        delete inflight[id];
        if (!err && part) { putCache(id, part); }
        var i;
        for (i = 0; i < waiters.length; i += 1) {
          waiters[i](err, part);
        }
      });
    }

    function recordFor(word, cb) {
      var id = bucketFor(word);
      fetchPart(id, function (err, part) {
        if (err || !part) { cb(err || new Error('Erro de leitura.'), null); return; }
        var rec = Object.prototype.hasOwnProperty.call(part, word) ? part[word] : null;
        cb(null, rec);
      });
    }

    function present(query, gathered) {
      var seenIds = {};
      var uniq = [], i;
      for (i = 0; i < gathered.length; i += 1) {
        var s = gathered[i];
        var uid = (s.id || '') + '\0' + (s.lemma || '');
        if (!seenIds[uid]) { seenIds[uid] = true; uniq.push(s); }
      }

      var synGroups = [], dictSenses = [];
      for (i = 0; i < uniq.length; i += 1) {
        if (uniq[i].kind === 'synonyms') { synGroups.push(uniq[i]); }
        else if (uniq[i].kind === 'dictionary') { dictSenses.push(uniq[i]); }
      }

      function collectAlts(primary, pos, lemma) {
        var seenW = {};
        seenW[query] = true;
        if (lemma) { seenW[canonical(lemma)] = true; }
        var out = [], j, k, terms;
        function push(w) {
          var key = canonical(w);
          if (!key || seenW[key]) { return; }
          seenW[key] = true;
          out.push(w);
        }
        for (j = 0; j < primary.length; j += 1) { push(primary[j]); }
        for (j = 0; j < synGroups.length; j += 1) {
          if (synGroups[j].pos === pos && synGroups[j].lemma === lemma) {
            terms = synGroups[j].terms || [];
            for (k = 0; k < terms.length; k += 1) { push(terms[k]); }
          }
        }
        for (j = 0; j < synGroups.length; j += 1) {
          if (synGroups[j].pos === pos && synGroups[j].lemma !== lemma) {
            terms = synGroups[j].terms || [];
            for (k = 0; k < terms.length; k += 1) { push(terms[k]); }
          }
        }
        for (j = 0; j < synGroups.length; j += 1) {
          if (synGroups[j].pos !== pos) {
            terms = synGroups[j].terms || [];
            for (k = 0; k < terms.length; k += 1) { push(terms[k]); }
          }
        }
        return out.slice(0, 3);
      }

      var entries = [];
      for (i = 0; i < dictSenses.length; i += 1) {
        var d = dictSenses[i];
        var def = d.definitions && d.definitions[0] ? d.definitions[0] : '';
        var link = null, li;
        for (li = 0; li < LINKS.length; li += 1) {
          if (LINKS[li][0] === d.id && LINKS[li][1] === def) { link = LINKS[li]; break; }
        }
        var primary = link ? link[3] : [];
        entries.push({
          lemma: d.lemma,
          pos: d.pos,
          posLabel: CLASSES[d.pos] || d.pos || '',
          definition: def,
          synonyms: collectAlts(primary, d.pos, d.lemma),
          source: d.source || 'Wikcionário / OpenWordNet-PT'
        });
      }
      if (!entries.length && synGroups.length) {
        var g0 = synGroups[0];
        entries.push({
          lemma: g0.lemma,
          pos: g0.pos,
          posLabel: CLASSES[g0.pos] || g0.pos || '',
          definition: '',
          synonyms: collectAlts([], g0.pos, g0.lemma),
          source: g0.source || 'OpenWordNet-PT'
        });
      }
      entries.sort(function (a, b) {
        return (b.synonyms.length ? 1 : 0) - (a.synonyms.length ? 1 : 0);
      });
      return entries;
    }

    function fallbackCofreLookup(query) {
      if (!root.Escr.lookupLexeme) { return null; }
      var lex = root.Escr.lookupLexeme(query);
      if (!lex || lex.state !== 'found') { return null; }
      var entries = [], i;
      for (i = 0; i < (lex.senses || []).length; i += 1) {
        var s = lex.senses[i];
        var alts = (s.terms || []).filter(function (t) { return canonical(t) !== query; }).slice(0, 3);
        entries.push({
          lemma: s.lemma,
          pos: s.pos,
          posLabel: CLASSES[s.pos] || s.pos || '',
          definition: s.definitions && s.definitions[0] ? s.definitions[0] : '',
          synonyms: alts,
          source: 'OpenWordNet-PT (léxico base)'
        });
      }
      return entries.length ? { state: 'found', query: query, entries: entries, fallback: true } : null;
    }

    function lookup(rawWord, cb) {
      var q = canonical(rawWord);
      if (!isValidWord(q)) {
        cb({ state: 'invalid', query: q, entries: [] });
        return;
      }
      recordFor(q, function (err, direct) {
        if (err) {
          var fb = fallbackCofreLookup(q);
          if (fb) { cb(fb); }
          else { cb({ state: 'unavailable', query: q, entries: [] }); }
          return;
        }
        if (!direct) {
          cb({ state: 'uncovered', query: q, entries: [] });
          return;
        }
        var gathered = (direct.s || []).slice();
        var fList = direct.f || [];
        var lemmas = [], seenL = {}, i;
        seenL[q] = true;
        for (i = 0; i < fList.length && lemmas.length < 6; i += 1) {
          var l = fList[i].lemma;
          if (l && !seenL[l]) { seenL[l] = true; lemmas.push(l); }
        }
        if (!lemmas.length) {
          var ents = present(q, gathered);
          cb({ state: ents.length ? 'found' : 'uncovered', query: q, entries: ents, lemmas: [q] });
          return;
        }
        var remaining = lemmas.length;
        for (i = 0; i < lemmas.length; i += 1) {
          recordFor(lemmas[i], function (_e, entry) {
            if (entry && entry.s && entry.s.length) {
              var j;
              for (j = 0; j < entry.s.length; j += 1) { gathered.push(entry.s[j]); }
            }
            remaining -= 1;
            if (remaining === 0) {
              var ents2 = present(q, gathered);
              cb({ state: ents2.length ? 'found' : 'uncovered', query: q, entries: ents2, lemmas: [q].concat(lemmas) });
            }
          });
        }
      });
    }

    function putSessionPos(word, info) {
      var idx = sessionOrder.indexOf(word);
      if (idx >= 0) { sessionOrder.splice(idx, 1); }
      sessionPos[word] = info;
      sessionOrder.push(word);
      while (sessionOrder.length > MAX_SESSION_POS) {
        var oldW = sessionOrder.shift();
        delete sessionPos[oldW];
      }
    }

    function extractPosInfo(word, rec) {
      if (!rec) { return null; }
      var classes = [], seen = {}, lemma = word, def = '', i, item, lbl;
      function addPos(code) {
        lbl = CLASSES[code];
        if (lbl && !seen[lbl]) { seen[lbl] = true; classes.push(lbl); }
      }
      var sList = rec.s || [];
      for (i = 0; i < sList.length; i += 1) {
        item = sList[i];
        if (item.pos) { addPos(item.pos); }
        if (!def && item.definitions && item.definitions[0]) { def = item.definitions[0]; }
        if (lemma === word && item.lemma) { lemma = item.lemma; }
      }
      var fList = rec.f || [];
      for (i = 0; i < fList.length; i += 1) {
        item = fList[i];
        if (item.pos) { addPos(item.pos); }
        if (lemma === word && item.lemma) { lemma = item.lemma; }
      }
      if (!classes.length) { return null; }
      return { classes: classes, lemma: lemma, definition: def };
    }

    function warmWords(words, done) {
      var list = words || [], unique = [], seen = {}, buckets = {}, bucketIds = [], i, q, bid;
      for (i = 0; i < list.length && unique.length < 160; i += 1) {
        q = canonical(list[i]);
        if (!isValidWord(q) || seen[q] || Object.prototype.hasOwnProperty.call(sessionPos, q)) { continue; }
        seen[q] = true;
        unique.push(q);
        bid = bucketFor(q);
        if (!buckets[bid]) { buckets[bid] = []; bucketIds.push(bid); }
        buckets[bid].push(q);
      }
      if (!bucketIds.length) {
        if (done) { done(0); }
        return;
      }
      var cursor = 0, loaded = 0;
      function nextBatch() {
        if (cursor >= bucketIds.length) {
          if (done) { done(loaded); }
          return;
        }
        var batch = bucketIds.slice(cursor, cursor + 4);
        cursor += batch.length;
        var pending = batch.length;
        var bi;
        for (bi = 0; bi < batch.length; bi += 1) {
          (function (id) {
            fetchPart(id, function (err, part) {
              if (!err && part) {
                var ws = buckets[id], wi, w, info;
                for (wi = 0; wi < ws.length; wi += 1) {
                  w = ws[wi];
                  info = Object.prototype.hasOwnProperty.call(part, w) ? extractPosInfo(w, part[w]) : null;
                  if (info) { putSessionPos(w, info); loaded += 1; }
                }
              }
              pending -= 1;
              if (pending === 0) { nextBatch(); }
            });
          }(batch[bi]));
        }
      }
      nextBatch();
    }

    function peekPos(rawWord) {
      var q = canonical(rawWord);
      if (!q || !Object.prototype.hasOwnProperty.call(sessionPos, q)) { return null; }
      var info = sessionPos[q];
      return { classes: info.classes.slice(), lemma: info.lemma, definition: info.definition };
    }

    function clearSession() {
      sessionPos = {};
      sessionOrder = [];
    }

    return {
      canonical: canonical,
      bucketFor: bucketFor,
      isValidWord: isValidWord,
      lookup: lookup,
      warmWords: warmWords,
      peekPos: peekPos,
      clearSession: clearSession
    };
  }

  var sharedService = null;
  root.Escr.createLexicoP01 = createService;
  root.Escr.getLexicoP01 = function () {
    if (!sharedService) { sharedService = createService(); }
    return sharedService;
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/transferencia.js */
/* Transporte explícito de texto/pacotes. ES5; sem rede e sem acesso ao manuscrito. */
(function (root) {
  'use strict';
  var E = root.Escr;
  function selectRange(field, start, end) {
    if (!field || typeof field.value !== 'string' || typeof start !== 'number' || typeof end !== 'number' ||
        !isFinite(start) || !isFinite(end) || start % 1 || end % 1 || start < 0 || end < start || end > field.value.length) { return false; }
    try { if (field.setSelectionRange) { field.setSelectionRange(start, end); return typeof field.selectionStart !== 'number' || (field.selectionStart === start && field.selectionEnd === end); } } catch (ignore) {}
    try {
      if (typeof field.selectionStart === 'number') {
        field.selectionStart = start; field.selectionEnd = end;
        return field.selectionStart === start && field.selectionEnd === end;
      }
    } catch (ignore2) {}
    return false;
  }
  function download(contents, mime, name, fallback, host) {
    var D = root.document, urlAPI = root.URL || root.webkitURL, url, a;
    try {
      if (!root.Blob) { throw new Error('blob'); }
      var blob = new root.Blob([contents], { type: mime + ';charset=utf-8' });
      if (root.navigator.msSaveBlob && root.navigator.msSaveBlob(blob, name) !== false) { return true; }
      a = D.createElement('a');
      if (!('download' in a) || !a.click || !urlAPI || !urlAPI.createObjectURL) { throw new Error('download'); }
      url = urlAPI.createObjectURL(blob); a.href = url; a.download = name;
      (host || D.body).appendChild(a); a.click();
      return true;
    } catch (error) { fallback(contents, name); return false; }
    finally {
      if (a && a.parentNode) { a.parentNode.removeChild(a); }
      if (url && urlAPI.revokeObjectURL) { root.setTimeout(function () { urlAPI.revokeObjectURL(url); }, 120000); }
    }
  }
  function read(file, done) {
    var reader, ended = false;
    function finish(error, value) { if (!ended) { ended = true; done(error, value); } }
    try {
      if (!root.FileReader) { throw new Error('Este navegador não lê arquivos. Use “Trazer conteúdo copiado”.'); }
      reader = new root.FileReader();
      reader.onerror = function () { finish(new Error('O arquivo não pôde ser lido. O acervo permanece.')); };
      reader.onabort = function () { finish(new Error('Leitura cancelada. O acervo permanece.')); };
      reader.onload = function () { finish(null, String(reader.result)); };
      reader.readAsText(file, 'UTF-8');
    } catch (error) { finish(error); }
  }
  E.transfer = { selectRange: selectRange, download: download, read: read };
}(window));

;
/* Fonte: src/ui/cores-projeto.js */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var PALETTES = [
    { id: 'salvia', name: 'Sálvia', color: '#a3b899', paper: '#f0f4ee', edge: '#435439' },
    { id: 'areia', name: 'Areia', color: '#c2b69d', paper: '#f6f3ed', edge: '#574c35' },
    { id: 'pessego', name: 'Pêssego', color: '#cfae97', paper: '#f8f1eb', edge: '#634732' },
    { id: 'rosa', name: 'Rosa', color: '#c5a5a5', paper: '#f7efef', edge: '#5f3c3c' },
    { id: 'lavanda', name: 'Lavanda', color: '#b2a8be', paper: '#f3f1f6', edge: '#4e435b' },
    { id: 'nevoa', name: 'Névoa', color: '#9eb4b8', paper: '#edf3f4', edge: '#374e53' }
  ];

  var DEFAULT_PALETTE = {
    id: 'padrao',
    name: 'Sálvia padrão',
    color: '#c4cfc2',
    paper: '#ccd5c7',
    edge: '#354231'
  };

  function byId(id) {
    var i;
    for (i = 0; i < PALETTES.length; i += 1) {
      if (PALETTES[i].id === id) { return PALETTES[i]; }
    }
    return null;
  }

  function resolveBookPalette(book) {
    if (!book) { return DEFAULT_PALETTE; }
    var key = book.data && typeof book.data.palette === 'string' ? book.data.palette : '';
    if (key === 'padrao') { return DEFAULT_PALETTE; }
    var found = key ? byId(key) : null;
    if (found) { return found; }
    if (book.color) {
      var i;
      for (i = 0; i < PALETTES.length; i += 1) {
        if (PALETTES[i].color.toLowerCase() === String(book.color).toLowerCase()) {
          return PALETTES[i];
        }
      }
      return { id: 'custom', name: book.name || 'Projeto', color: book.color, paper: '#e6ece3', edge: '#354231' };
    }
    return PALETTES[0];
  }

  function applyToDocument(docEl, book) {
    if (!docEl || !docEl.style) { return DEFAULT_PALETTE; }
    var p = resolveBookPalette(book);
    if (docEl.style.setProperty) {
      docEl.style.setProperty('--esc-project-color', p.color);
      docEl.style.setProperty('--esc-project-paper', p.paper);
      docEl.style.setProperty('--esc-project-edge', p.edge);
    }
    if (docEl.setAttribute) {
      docEl.setAttribute('data-project-palette', p.id);
    }
    return p;
  }

  function assignPalette(notebooks, bookId, paletteId) {
    if (!notebooks || !bookId) { return null; }
    var book = notebooks.get(bookId), pal = paletteId === 'padrao' ? DEFAULT_PALETTE : byId(paletteId);
    if (!book || !pal) { return null; }
    var nextData = book.data ? JSON.parse(JSON.stringify(book.data)) : {};
    nextData.palette = pal.id;
    return notebooks.update(bookId, { color: pal.color, data: nextData });
  }

  root.Escr.projectColors = {
    list: function () { return PALETTES.slice(); },
    byId: byId,
    resolve: resolveBookPalette,
    apply: applyToDocument,
    assign: assignPalette
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/modelos.js */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }

  function renderReferenceMarkdown(container, titleText, rawText, onDeleteRef) {
    if (!container) { return; }
    container.textContent = '';

    var head = document.createElement('header');
    head.className = 'esc-reference-head';
    var badge = document.createElement('span');
    badge.className = 'esc-reference-badge';
    badge.textContent = 'Referência · conteúdo fixo para consulta';
    head.appendChild(badge);
    if (typeof onDeleteRef === 'function') {
      var delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'esc-reference-delete';
      delBtn.textContent = 'Excluir referência';
      on(delBtn, 'click', onDeleteRef);
      head.appendChild(delBtn);
    }
    container.appendChild(head);

    var article = document.createElement('div');
    article.className = 'esc-reference-body';
    if (titleText) {
      var h1 = document.createElement('h1');
      h1.textContent = titleText;
      article.appendChild(h1);
    }
    var lines = String(rawText || '').split(/\r?\n/);
    var i, line, trimmed;
    for (i = 0; i < lines.length; i += 1) {
      line = lines[i];
      trimmed = line.replace(/^\s+|\s+$/g, '');
      if (!trimmed) { continue; }
      if (/^###\s+/.test(trimmed)) {
        var h3 = document.createElement('h3');
        h3.textContent = trimmed.replace(/^###\s+/, '');
        article.appendChild(h3);
      } else if (/^##\s+/.test(trimmed)) {
        var h2 = document.createElement('h2');
        h2.textContent = trimmed.replace(/^##\s+/, '');
        article.appendChild(h2);
      } else if (/^#\s+/.test(trimmed)) {
        var topH = document.createElement('h2');
        topH.textContent = trimmed.replace(/^#\s+/, '');
        article.appendChild(topH);
      } else if (/^>\s+/.test(trimmed)) {
        var bq = document.createElement('blockquote');
        bq.textContent = trimmed.replace(/^>\s+/, '');
        article.appendChild(bq);
      } else if (/^---+$/.test(trimmed)) {
        article.appendChild(document.createElement('hr'));
      } else {
        var p = document.createElement('p');
        var parts = trimmed.split(/(https?:\/\/[^\s)]+)/g);
        var j;
        for (j = 0; j < parts.length; j += 1) {
          if (/^https?:\/\//.test(parts[j])) {
            var a = document.createElement('a');
            a.href = parts[j];
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = parts[j];
            p.appendChild(a);
          } else if (parts[j]) {
            p.appendChild(document.createTextNode(parts[j]));
          }
        }
        article.appendChild(p);
      }
    }
    container.appendChild(article);
  }

  root.Escr.renderReferenceView = renderReferenceMarkdown;

  root.Escr.mountTemplatesModal = function (opts) {
    var modalEl = null;
    var selectedTemplateId = 'livro-ficcao';
    var selectedPaletteId = 'salvia';
    var selectedFormat = 'rich';
    var customNameEdited = false;

    function buildModal() {
      if (modalEl) { return modalEl; }
      var overlay = document.createElement('div');
      overlay.id = 'esc-template-modal';
      overlay.hidden = true;
      overlay.innerHTML =
        '<section class="esc-template-dialog" role="dialog" aria-modal="true" aria-labelledby="esc-tpl-heading">' +
          '<header class="esc-template-header">' +
            '<div><p class="esc-template-eyebrow">ESCREVARAL · NOVO PROJETO</p><h1 id="esc-tpl-heading">Escolha um modelo para começar</h1></div>' +
            '<button id="esc-tpl-close" type="button" class="material-key" aria-label="Fechar modelos">×</button>' +
          '</header>' +
          '<form id="esc-tpl-form">' +
            '<div class="esc-template-body">' +
              '<p id="esc-tpl-intro">Cada modelo cria pastas e folhas iniciais com instruções clicáveis. Você pode renomear, mover ou apagar qualquer parte.</p>' +
              '<fieldset class="esc-tpl-fieldset">' +
                '<legend>O que você quer escrever?</legend>' +
                '<div id="esc-tpl-grid" class="esc-tpl-list"></div>' +
              '</fieldset>' +
              '<div class="esc-tpl-fields">' +
                '<label for="esc-tpl-name">Nome do projeto<input id="esc-tpl-name" type="text" maxlength="120" autocomplete="off"></label>' +
                '<div class="esc-tpl-format-row">' +
                  '<span>Formato dos textos</span>' +
                  '<div class="esc-tpl-format-options" role="radiogroup" aria-label="Formato dos textos">' +
                    '<label class="esc-tpl-format-choice"><input type="radio" name="esc-tpl-format" value="rich" checked> Texto formatado (padrão)</label>' +
                    '<label class="esc-tpl-format-choice"><input type="radio" name="esc-tpl-format" value="plain"> Texto simples</label>' +
                  '</div>' +
                '</div>' +
                '<div class="esc-tpl-palette-row"><span>Cor da lombada</span><div id="esc-tpl-palettes" class="esc-color-swatches"></div></div>' +
              '</div>' +
              '<p id="esc-tpl-error" class="esc-tpl-error" role="status"></p>' +
            '</div>' +
            '<footer class="esc-template-footer">' +
              '<button id="esc-tpl-blank" type="button" class="esc-tpl-quiet">Criar caderno em branco…</button>' +
              '<button id="esc-tpl-cancel" type="button">Cancelar</button>' +
              '<button id="esc-tpl-submit" type="submit" class="esc-tpl-primary">Criar projeto</button>' +
            '</footer>' +
          '</form>' +
        '</section>';
      document.body.appendChild(overlay);
      modalEl = overlay;

      on(byId('esc-tpl-close'), 'click', hide);
      on(byId('esc-tpl-cancel'), 'click', hide);
      on(modalEl, 'click', function (ev) { if (ev.target === modalEl) { hide(); } });
      on(modalEl, 'keydown', function (ev) {
        if (ev.keyCode === 27) { ev.preventDefault(); ev.stopPropagation(); hide(); }
      });
      on(byId('esc-tpl-blank'), 'click', function () {
        hide();
        if (opts.onBlankProject) { opts.onBlankProject(); }
      });
      var nameInput = byId('esc-tpl-name');
      on(nameInput, 'input', function () { customNameEdited = true; });
      var fmtRadios = modalEl.querySelectorAll('input[name="esc-tpl-format"]');
      var fi;
      for (fi = 0; fi < fmtRadios.length; fi += 1) {
        (function (r) {
          on(r, 'change', function () { if (r.checked) { selectedFormat = r.value; } });
        }(fmtRadios[fi]));
      }
      on(byId('esc-tpl-form'), 'submit', function (ev) {
        ev.preventDefault();
        var errEl = byId('esc-tpl-error');
        errEl.textContent = '';
        try {
          var created = root.Escr.templates.createProject(
            opts.notebooks,
            opts.archive,
            selectedTemplateId,
            nameInput.value,
            selectedPaletteId,
            opts.originalId ? opts.originalId() : null,
            selectedFormat
          );
          hide();
          if (opts.onCreated) { opts.onCreated(created); }
        } catch (e) {
          errEl.textContent = e && e.message ? e.message : 'Não foi possível criar este projeto.';
        }
      });

      return modalEl;
    }

    function renderGrid() {
      var grid = byId('esc-tpl-grid');
      var nameInput = byId('esc-tpl-name');
      if (!grid || !root.Escr.templates) { return; }
      grid.textContent = '';
      var list = root.Escr.templates.list();
      list.forEach(function (tpl) {
        var lbl = document.createElement('label');
        var active = tpl.id === selectedTemplateId;
        lbl.className = 'esc-template-option' + (active ? ' is-selected' : '');

        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'esc-tpl-choice';
        radio.value = tpl.id;
        radio.checked = active;
        on(radio, 'change', function () {
          if (!radio.checked) { return; }
          selectedTemplateId = tpl.id;
          if (!customNameEdited && nameInput) { nameInput.value = tpl.defaultProjectName || ''; }
          renderGrid();
        });
        lbl.appendChild(radio);

        var body = document.createElement('div');
        body.className = 'esc-tpl-option-body';
        var top = document.createElement('div');
        top.className = 'esc-tpl-option-top';
        var strong = document.createElement('strong');
        strong.textContent = tpl.title;
        top.appendChild(strong);

        if (tpl.id === 'redacao-enem' || /enem/i.test(tpl.id) || /enem/i.test(tpl.title)) {
          var logo = document.createElement('img');
          logo.className = 'esc-template-enem-logo';
          logo.src = 'assets/study/enem-logo.png';
          logo.alt = 'Enem';
          logo.onerror = function () { logo.style.display = 'none'; };
          top.appendChild(logo);
        }
        body.appendChild(top);

        var desc = document.createElement('span');
        desc.className = 'esc-tpl-option-desc';
        desc.textContent = tpl.description || '';
        body.appendChild(desc);

        lbl.appendChild(body);
        grid.appendChild(lbl);
      });
    }

    function renderPalettes() {
      var wrap = byId('esc-tpl-palettes');
      if (!wrap || !root.Escr.projectColors) { return; }
      wrap.textContent = '';
      root.Escr.projectColors.list().forEach(function (pal) {
        var sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'esc-swatch';
        sw.title = pal.name;
        sw.setAttribute('aria-label', 'Cor ' + pal.name);
        sw.setAttribute('aria-pressed', pal.id === selectedPaletteId ? 'true' : 'false');
        sw.style.backgroundColor = pal.color;
        on(sw, 'click', function () { selectedPaletteId = pal.id; renderPalettes(); });
        wrap.appendChild(sw);
      });
    }

    function open() {
      buildModal();
      customNameEdited = false;
      var tpl = root.Escr.templates && root.Escr.templates.find(selectedTemplateId);
      var nameInput = byId('esc-tpl-name');
      if (nameInput && tpl) { nameInput.value = tpl.defaultProjectName || ''; }
      var errEl = byId('esc-tpl-error');
      if (errEl) { errEl.textContent = ''; }
      renderGrid();
      renderPalettes();
      modalEl.hidden = false;
      if (nameInput && nameInput.focus) { nameInput.focus(); }
    }

    function hide() {
      if (modalEl) { modalEl.hidden = true; }
    }

    if (opts.manuscriptEl && root.Escr.templates) {
      on(opts.manuscriptEl, 'click', function () {
        var ta = opts.manuscriptEl;
        if (ta.readOnly || ta.disabled || ta.selectionStart !== ta.selectionEnd) { return; }
        var hit = root.Escr.templates.placeholderAt(ta.value, ta.selectionStart);
        if (hit) { root.Escr.templates.clearTextareaPlaceholder(ta, hit); }
      });
    }

    return {
      open: open,
      hide: hide,
      isOpen: function () { return !!(modalEl && !modalEl.hidden); }
    };
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/soneto.js */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var SCHEMES = [
    'ABBA ABBA CDC DCD',
    'ABBA ABBA CDE CDE',
    'ABAB ABAB CDC DCD',
    'ABAB CDCD EFEF GG',
    'ABAB BCBC CDCD EE',
    'AABB AABB CDC DCD',
    'Livre'
  ];

  var SCHEME_NAMES = {
    'ABBA ABBA CDC DCD': 'Italiano / petrarquiano',
    'ABBA ABBA CDE CDE': 'Italiano · outra terminação',
    'ABAB ABAB CDC DCD': 'Quartetos alternados',
    'ABAB CDCD EFEF GG': 'Inglês / shakespeariano',
    'ABAB BCBC CDCD EE': 'Spenseriano',
    'AABB AABB CDC DCD': 'Quartetos emparelhados'
  };

  var RHYTHMS = {
    none: 'Livre · conferir contagem apenas',
    heroic: 'Decassílabo heroico · apoios 6ª e 10ª',
    sapphic: 'Decassílabo sáfico · apoios 4ª, 8ª e 10ª',
    alexandrine: 'Alexandrino · dois hemistíquios de 6'
  };

  var GUIDANCE = [
    'Uma imagem para abrir o poema.',
    'O que se move nessa imagem?',
    'Um detalhe que a transforma.',
    'Onde o primeiro movimento pousa?',
    'Retome ou contraste a imagem inicial.',
    'Que tensão ganha força?',
    'Que som ou detalhe merece ficar?',
    'Prepare a passagem para outro olhar.',
    'Experimente uma mudança de perspectiva.',
    'O que essa mudança permite perceber?',
    'Leve a imagem um pouco além.',
    'Aproxime o poema do seu desfecho.',
    'O que ainda precisa ressoar?',
    'Encontre o último verso.'
  ];

  var rhymeIndex = null;

  function buildRhymeIndex() {
    if (rhymeIndex) { return rhymeIndex; }
    rhymeIndex = {};
    var lex = root.Escr.portiLexicon;
    var poetry = root.Escr.poetry;
    if (!lex || !lex.entries || !poetry) { return rhymeIndex; }
    var keys = Object.keys(lex.entries);
    var i, w, r, key;
    for (i = 0; i < keys.length; i += 1) {
      w = keys[i];
      if (w.length < 2 || w.length > 24) { continue; }
      r = poetry.wordReading(w);
      if (!r || !r.rhyme) { continue; }
      key = '$' + r.rhyme;
      if (!rhymeIndex[key]) { rhymeIndex[key] = []; }
      rhymeIndex[key].push(w);
    }
    return rhymeIndex;
  }

  function findRhymesFor(word) {
    var poetry = root.Escr.poetry;
    if (!poetry || !word) { return []; }
    var clean = String(word).replace(/^[^a-záàâãéêíóôõúüç]+|[^a-záàâãéêíóôõúüç]+$/gi, '').toLowerCase();
    if (!clean) { return []; }
    var r = poetry.wordReading(clean);
    if (!r || !r.rhyme) { return []; }
    var idx = buildRhymeIndex();
    var list = idx['$' + r.rhyme] || [];
    var out = [], i;
    for (i = 0; i < list.length && out.length < 30; i += 1) {
      if (list[i] !== clean) { out.push(list[i]); }
    }
    return out;
  }

  function structureOf(scheme) {
    if (scheme === 'Livre') { return 'italian'; }
    var clean = String(scheme || '').replace(/\s+/g, '');
    if (clean.indexOf('GG') === 12 || clean.indexOf('EE') === 12 || clean.slice(8, 12) === 'EFEF' || clean.slice(8, 12) === 'CDCD') {
      if (clean.slice(0, 12) === 'ABABCDCD' + 'EFEF' || clean.slice(0, 12) === 'ABABBCBC' + 'CDCD') {
        return 'english';
      }
    }
    if (clean === 'ABABCDCD' + 'EFEFGG' || clean === 'ABABBCBC' + 'CDCDEE') { return 'english'; }
    return 'italian';
  }

  function defaultSettings() {
    return { structure: 'italian', scheme: 'ABBA ABBA CDC DCD', target: 10, rhythm: 'none' };
  }

  function normalizeSettings(raw) {
    var base = defaultSettings();
    if (!raw || typeof raw !== 'object') { return base; }
    if (raw.structure === 'italian' || raw.structure === 'english') { base.structure = raw.structure; }
    if (typeof raw.scheme === 'string' && raw.scheme) { base.scheme = raw.scheme; }
    if (typeof raw.target === 'number' && raw.target >= 2 && raw.target <= 20) { base.target = raw.target; }
    if (typeof raw.rhythm === 'string' && Object.prototype.hasOwnProperty.call(RHYTHMS, raw.rhythm)) { base.rhythm = raw.rhythm; }
    return base;
  }

  function analyzeText(text, activeLineIdx, settings) {
    var poetry = root.Escr.poetry;
    var linesRaw = String(text || '').split(/\r?\n/);
    var rows = [];
    var stanzas = [];
    var currentStanza = 0;
    var i, count = 0;

    for (i = 0; i < linesRaw.length && rows.length < 200; i += 1) {
      var trimmed = linesRaw[i].replace(/^\s+|\s+$/g, '');
      if (!trimmed) {
        if (currentStanza > 0) { stanzas.push(currentStanza); currentStanza = 0; }
        continue;
      }
      var isPlaceholder = root.Escr.templates && root.Escr.templates.isPlaceholder(trimmed);
      var isHeading = trimmed.indexOf('#') === 0;
      if (isHeading && rows.length === 0) { continue; }
      count += 1;
      currentStanza += 1;
      var scan = !isPlaceholder && poetry ? poetry.scan(trimmed) : null;
      rows.push({
        number: count,
        lineIndex: i,
        text: trimmed,
        placeholder: isPlaceholder,
        reading: scan,
        lastWord: scan && scan.words.length ? scan.words[scan.words.length - 1].word : ''
      });
    }
    if (currentStanza > 0) { stanzas.push(currentStanza); }

    var current = null;
    for (i = 0; i < rows.length; i += 1) {
      if (rows[i].lineIndex === activeLineIdx) { current = rows[i]; break; }
    }
    if (!current && rows.length) {
      for (i = rows.length - 1; i >= 0; i -= 1) {
        if (rows[i].lineIndex <= activeLineIdx) { current = rows[i]; break; }
      }
      if (!current) { current = rows[0]; }
    }

    var rhymeReference = null;
    var letters = String(settings.scheme || '').replace(/\s+/g, '');
    if (current && settings.scheme !== 'Livre' && current.number <= letters.length) {
      var myLetter = letters.charAt(current.number - 1);
      for (i = 0; i < rows.length; i += 1) {
        if (rows[i].number === current.number) { break; }
        if (rows[i].number <= letters.length && letters.charAt(rows[i].number - 1) === myLetter && !rows[i].placeholder) {
          rhymeReference = {
            number: rows[i].number,
            word: rows[i].lastWord,
            possible: !!(current.reading && rows[i].reading && current.reading.rhyme === rows[i].reading.rhyme)
          };
          break;
        }
      }
    }

    var refWord = current && current.lastWord ? current.lastWord : '';
    return {
      written: rows.filter(function (r) { return !r.placeholder; }).length,
      stanzas: stanzas,
      rows: rows,
      current: current,
      rhymeReference: rhymeReference,
      suggestionWord: refWord
    };
  }

  function cursorLineOf(el) {
    if (!el || typeof el.value !== 'string') { return 0; }
    var pos = typeof el.selectionStart === 'number' ? el.selectionStart : 0;
    return el.value.slice(0, pos).split(/\r?\n/).length - 1;
  }

  function isSonnetDoc(doc) {
    if (!doc || doc.trashed) { return false; }
    return doc.role === 'sonnet' || doc.folder === '02 · Poema';
  }

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el) { el.addEventListener(ev, fn, false); } }
  function createEl(tag, className, textValue) {
    var el = document.createElement(tag);
    if (className) { el.className = className; }
    if (typeof textValue === 'string') { el.textContent = textValue; }
    return el;
  }

  root.Escr.sonnetCore = {
    schemes: SCHEMES,
    rhythms: RHYTHMS,
    analyze: analyzeText,
    findRhymes: findRhymesFor,
    normalizeSettings: normalizeSettings
  };

  root.Escr.mountSonnetAssistant = function (opts) {
    var container = byId(opts.containerId || 'esc-sonnet-panel');
    var manuscript = opts.manuscriptEl;
    var activeDoc = null;
    var collapsed = false;
    var manualLine = null;
    var rhymeQuery = '';
    var showMoreRhymes = false;
    var draftScheme = '';
    var draftError = '';
    var renderTimer = null;

    function measureStr(reading) {
      return reading.min === reading.max ? String(reading.max) : reading.min + '–' + reading.max;
    }

    function saveSettings(next) {
      if (!activeDoc) { return; }
      activeDoc.sonnetSettings = next;
      if (opts.onSaveSettings) { opts.onSaveSettings(next); }
      render();
    }

    function chooseSetting(key, val) {
      var cur = normalizeSettings(activeDoc && activeDoc.sonnetSettings);
      var next = { structure: cur.structure, scheme: cur.scheme, target: cur.target, rhythm: cur.rhythm };
      next[key] = val;
      if (key === 'structure' && next.scheme !== 'Livre' && structureOf(next.scheme) !== val) {
        next.scheme = val === 'english' ? 'ABAB CDCD EFEF GG' : SCHEMES[0];
      }
      if (key === 'scheme' && val !== 'Livre') { next.structure = structureOf(val); }
      if (key === 'rhythm' && val !== 'none') { next.target = val === 'alexandrine' ? 12 : 10; }
      if (key === 'target') { next.rhythm = 'none'; }
      draftError = '';
      saveSettings(next);
    }

    function render() {
      if (!container) { return; }
      var hintEl = byId('esc-sonnet-editor-hint');
      if (!isSonnetDoc(activeDoc)) {
        container.hidden = true;
        if (hintEl) { hintEl.hidden = true; }
        container.textContent = '';
        return;
      }
      container.hidden = false;
      if (hintEl) {
        var rawTxt = manuscript ? String(manuscript.value || '').replace(/^\s+|\s+$/g, '') : '';
        var hasRealVerse = rawTxt.length > 0 && rawTxt.indexOf('«') !== 0;
        hintEl.hidden = hasRealVerse;
      }
      var settings = normalizeSettings(activeDoc.sonnetSettings);
      var lineIdx = manualLine !== null ? manualLine : cursorLineOf(manuscript);
      var res = analyzeText(manuscript ? manuscript.value : activeDoc.text, lineIdx, settings);
      var row = res.current;
      var r = row ? row.reading : null;
      var stanzaPlan = settings.structure === 'english' ? [4, 4, 4, 2] : [4, 4, 3, 3];

      container.textContent = '';
      var aside = createEl('aside', 'esc-sonnet');
      aside.setAttribute('aria-label', 'Assistente do soneto');

      var top = createEl('header', 'esc-sonnet-top');
      var headLeft = createEl('div');
      headLeft.appendChild(createEl('strong', '', 'Seu soneto'));
      headLeft.appendChild(createEl('span', 'esc-sonnet-progress', res.written + ' de 14 versos'));
      top.appendChild(headLeft);

      var toggleBtn = createEl('button', 'esc-sonnet-quiet', collapsed ? 'Mostrar' : 'Recolher');
      toggleBtn.type = 'button';
      toggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      on(toggleBtn, 'click', function () { collapsed = !collapsed; render(); });
      top.appendChild(toggleBtn);
      aside.appendChild(top);

      if (collapsed) {
        container.appendChild(aside);
        return;
      }

      var body = createEl('div', 'esc-sonnet-body');
      body.appendChild(createEl('p', 'esc-sonnet-intro', 'Escreva um verso por linha. Acompanhe aqui a medida e as rimas.'));

      // Acompanhamento do verso
      var curSec = createEl('section', 'esc-sonnet-current');
      var curTitle = createEl('div', 'esc-sonnet-current-title');
      curTitle.appendChild(createEl('strong', '', row ? 'Verso ' + row.number : 'Escolha um verso'));
      curTitle.appendChild(createEl('small', '', manualLine !== null ? 'Em consulta' : 'Verso do cursor'));
      curSec.appendChild(curTitle);

      if (manualLine !== null) {
        var resumeBtn = createEl('button', 'esc-sonnet-quiet', 'Acompanhar o cursor');
        resumeBtn.type = 'button';
        on(resumeBtn, 'click', function () { manualLine = null; rhymeQuery = ''; showMoreRhymes = false; render(); });
        curSec.appendChild(resumeBtn);
      }

      if (row) {
        if (row.placeholder) {
          curSec.appendChild(createEl('p', 'esc-sonnet-prompt', res.written === 0 ? 'Comece com uma imagem ou pergunta.' : (GUIDANCE[row.number - 1] || 'Continue seu poema.')));
        } else {
          curSec.appendChild(createEl('p', 'esc-sonnet-excerpt', row.text));
          if (r) {
            var measureBox = createEl('div', 'esc-sonnet-measure');
            measureBox.appendChild(createEl('span', 'esc-sonnet-caption', 'Contagem estimada'));
            var big = createEl('strong', '', measureStr(r) + ' ');
            big.appendChild(createEl('small', '', 'sílabas poéticas'));
            measureBox.appendChild(big);
            measureBox.appendChild(createEl('p', '', 'Referência escolhida: ' + settings.target + ' sílabas.'));
            if (settings.rhythm !== 'none') {
              measureBox.appendChild(createEl('p', '', RHYTHMS[settings.rhythm]));
            }
            curSec.appendChild(measureBox);

            var scansion = createEl('section', 'esc-sonnet-scansion');
            scansion.appendChild(createEl('h3', '', 'Sílabas e tônicas'));
            var sylP = createEl('p', 'esc-sonnet-syllables');
            r.words.forEach(function (word, wi) {
              if (wi > 0) { sylP.appendChild(document.createTextNode(' / ')); }
              var wSpan = createEl('span', 'esc-sonnet-word');
              word.syllables.forEach(function (syl, si) {
                if (si > 0) { wSpan.appendChild(document.createTextNode('·')); }
                if (wi === r.words.length - 1 && si > word.tonic) {
                  wSpan.appendChild(createEl('span', 'esc-sonnet-after-tonic', '(' + syl + ')'));
                } else if (si === word.tonic) {
                  wSpan.appendChild(createEl('strong', '', syl));
                } else {
                  wSpan.appendChild(document.createTextNode(syl));
                }
              });
              sylP.appendChild(wSpan);
            });
            scansion.appendChild(sylP);
            scansion.appendChild(createEl('p', 'esc-sonnet-caption', 'Tônicas em negrito; finais após a última tônica ficam fora da métrica.'));
            curSec.appendChild(scansion);
          } else {
            curSec.appendChild(createEl('p', '', 'Leia este verso em voz alta para conferir a medida.'));
          }
        }

        var rhymeSec = createEl('section', 'esc-sonnet-rhyme');
        rhymeSec.appendChild(createEl('h3', '', 'Rima deste verso'));
        var rhymeMsg = settings.scheme === 'Livre'
          ? 'Rimas livres escolhidas.'
          : res.rhymeReference
            ? 'Neste esquema, o verso ' + row.number + ' rima com o verso ' + res.rhymeReference.number + ' (“' + res.rhymeReference.word + '”).'
            : 'Este verso inicia um grupo de rimas.';
        rhymeSec.appendChild(createEl('p', '', rhymeMsg));
        if (res.rhymeReference && r) {
          rhymeSec.appendChild(createEl('p', 'esc-sonnet-caption', res.rhymeReference.possible ? 'Terminação compatível encontrada.' : 'Confira a sonoridade destes finais em voz alta.'));
        }
        curSec.appendChild(rhymeSec);
      }
      body.appendChild(curSec);

      // Mapa do poema
      var mapSec = createEl('section', 'esc-sonnet-map');
      mapSec.appendChild(createEl('h3', '', 'Mapa do poema'));
      mapSec.appendChild(createEl('p', 'esc-sonnet-caption', 'Forma · ' + stanzaPlan.join(' / ') + ' versos.'));
      var stanzasGrid = createEl('div', 'esc-sonnet-stanzas');
      var offset = 0, si2, vi;
      for (si2 = 0; si2 < stanzaPlan.length; si2 += 1) {
        var size = stanzaPlan[si2];
        var stBox = createEl('div', 'esc-sonnet-stanza');
        stBox.appendChild(createEl('small', '', 'Estrofe ' + (si2 + 1)));
        var slots = createEl('div', 'esc-sonnet-slots');
        for (vi = 0; vi < size; vi += 1) {
          (function (vRow, num) {
            if (vRow && !vRow.placeholder) {
              var slotBtn = createEl('button', '', String(num));
              slotBtn.type = 'button';
              slotBtn.setAttribute('aria-pressed', row && row.lineIndex === vRow.lineIndex ? 'true' : 'false');
              on(slotBtn, 'click', function () { manualLine = vRow.lineIndex; rhymeQuery = ''; showMoreRhymes = false; render(); });
              slots.appendChild(slotBtn);
            } else {
              slots.appendChild(createEl('span', 'esc-sonnet-empty-slot', String(num)));
            }
          }(res.rows[offset + vi], offset + vi + 1));
        }
        offset += size;
        stBox.appendChild(slots);
        stanzasGrid.appendChild(stBox);
      }
      mapSec.appendChild(stanzasGrid);
      body.appendChild(mapSec);

      // Explorar rimas
      var sugDet = createEl('details', 'esc-sonnet-suggestions');
      var sugSum = createEl('summary', '', 'Explorar rimas');
      sugDet.appendChild(sugSum);
      var targetWord = rhymeQuery || res.suggestionWord;
      if (targetWord) {
        var hits = findRhymesFor(targetWord);
        sugDet.appendChild(createEl('small', '', 'Próximos de “' + targetWord + '” (PortiLexicon)'));
        var shown = hits.slice(0, showMoreRhymes ? 24 : 6);
        sugDet.appendChild(createEl('p', '', shown.length ? shown.join(' · ') : 'Sem sugestões para esta palavra.'));
        if (hits.length > 6) {
          var moreBtn = createEl('button', 'esc-sonnet-quiet', showMoreRhymes ? 'Ver menos' : 'Mais finais');
          moreBtn.type = 'button';
          on(moreBtn, 'click', function () { showMoreRhymes = !showMoreRhymes; render(); });
          sugDet.appendChild(moreBtn);
        }
      }
      var qWrap = createEl('div', 'esc-sonnet-search');
      var qLabel = createEl('label', '', 'Outra palavra de referência');
      var qInput = createEl('input');
      qInput.type = 'text';
      qInput.maxLength = 60;
      qInput.placeholder = 'Ex.: amor';
      qInput.value = rhymeQuery;
      on(qInput, 'change', function () { rhymeQuery = qInput.value.trim(); showMoreRhymes = false; render(); });
      qLabel.appendChild(qInput);
      qWrap.appendChild(qLabel);
      sugDet.appendChild(qWrap);
      body.appendChild(sugDet);

      // Forma do soneto
      var formDet = createEl('details', 'esc-sonnet-settings');
      formDet.appendChild(createEl('summary', '', 'Forma do soneto'));
      var controls = createEl('div', 'esc-sonnet-controls');

      var lStruct = createEl('label', '', 'Estrutura');
      var sStruct = createEl('select');
      [['italian', 'Italiano · 4 / 4 / 3 / 3'], ['english', 'Inglês · 4 / 4 / 4 / 2']].forEach(function (pair) {
        var o = createEl('option', '', pair[1]);
        o.value = pair[0];
        if (settings.structure === pair[0]) { o.selected = true; }
        sStruct.appendChild(o);
      });
      on(sStruct, 'change', function () { chooseSetting('structure', sStruct.value); });
      lStruct.appendChild(sStruct);
      controls.appendChild(lStruct);

      var lScheme = createEl('label', '', 'Esquema de rimas');
      var sScheme = createEl('select');
      var optsList = SCHEMES.slice();
      if (optsList.indexOf(settings.scheme) === -1) { optsList.push(settings.scheme); }
      optsList.filter(function (sc) { return sc === 'Livre' || structureOf(sc) === settings.structure; }).forEach(function (sc) {
        var o = createEl('option', '', sc === 'Livre' ? 'Rimas livres' : (SCHEME_NAMES[sc] || 'Personalizado') + ' · ' + sc);
        o.value = sc;
        if (settings.scheme === sc) { o.selected = true; }
        sScheme.appendChild(o);
      });
      on(sScheme, 'change', function () { chooseSetting('scheme', sScheme.value); });
      lScheme.appendChild(sScheme);
      controls.appendChild(lScheme);

      var lTarget = createEl('label', '', 'Medida');
      var sTarget = createEl('select');
      [[10, 'Decassílabo · 10'], [12, 'Dodecassílabo · 12'], [7, 'Redondilha maior · 7'], [5, 'Redondilha menor · 5']].forEach(function (pair) {
        var o = createEl('option', '', pair[1]);
        o.value = String(pair[0]);
        if (settings.target === pair[0]) { o.selected = true; }
        sTarget.appendChild(o);
      });
      on(sTarget, 'change', function () { chooseSetting('target', Number(sTarget.value)); });
      lTarget.appendChild(sTarget);
      controls.appendChild(lTarget);

      var lRhythm = createEl('label', '', 'Ritmo');
      var sRhythm = createEl('select');
      Object.keys(RHYTHMS).forEach(function (k) {
        var o = createEl('option', '', RHYTHMS[k]);
        o.value = k;
        if (settings.rhythm === k) { o.selected = true; }
        sRhythm.appendChild(o);
      });
      on(sRhythm, 'change', function () { chooseSetting('rhythm', sRhythm.value); });
      lRhythm.appendChild(sRhythm);
      controls.appendChild(lRhythm);

      var customWrap = createEl('div', 'esc-sonnet-custom');
      var cLabel = createEl('label', '', 'Personalizar rimas (14 letras A–N)');
      var cInput = createEl('input');
      cInput.type = 'text';
      cInput.maxLength = 30;
      cInput.value = draftScheme;
      cInput.placeholder = settings.structure === 'english' ? 'ABAB BCBC CDCD EE' : 'AABB AABB CDC DCD';
      on(cInput, 'input', function () { draftScheme = cInput.value; draftError = ''; });
      cLabel.appendChild(cInput);
      customWrap.appendChild(cLabel);
      var cBtn = createEl('button', '', 'Aplicar');
      cBtn.type = 'button';
      on(cBtn, 'click', function () {
        var lettersOnly = String(cInput.value || '').toUpperCase().replace(/\s+/g, '');
        if (!/^[A-N]{14}$/.test(lettersOnly)) {
          draftError = 'Use 14 letras de A a N.';
          render();
          return;
        }
        var pos = 0, chunks = [], si3;
        for (si3 = 0; si3 < stanzaPlan.length; si3 += 1) {
          chunks.push(lettersOnly.slice(pos, pos + stanzaPlan[si3]));
          pos += stanzaPlan[si3];
        }
        chooseSetting('scheme', chunks.join(' '));
      });
      customWrap.appendChild(cBtn);
      if (draftError) { customWrap.appendChild(createEl('p', '', draftError)); }
      controls.appendChild(customWrap);

      formDet.appendChild(controls);
      body.appendChild(formDet);

      aside.appendChild(body);
      container.appendChild(aside);
    }

    function schedule() {
      window.clearTimeout(renderTimer);
      renderTimer = window.setTimeout(render, 120);
    }

    if (manuscript) {
      on(manuscript, 'input', function () { manualLine = null; schedule(); });
      on(manuscript, 'keyup', function () { if (isSonnetDoc(activeDoc)) { manualLine = null; schedule(); } });
      on(manuscript, 'mouseup', function () { if (isSonnetDoc(activeDoc)) { manualLine = null; schedule(); } });
    }

    return {
      sync: function (doc) {
        activeDoc = doc || null;
        manualLine = null;
        rhymeQuery = '';
        showMoreRhymes = false;
        draftError = '';
        render();
      },
      refresh: render,
      isSonnetDoc: isSonnetDoc
    };
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/editor/formatado-leve.js */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var ALLOWED_TAGS = {
    P: 1, DIV: 1, BR: 1, B: 1, STRONG: 1, I: 1, EM: 1, U: 1,
    S: 1, STRIKE: 1, DEL: 1, H1: 1, H2: 1, H3: 1, UL: 1, OL: 1,
    LI: 1, BLOCKQUOTE: 1, PRE: 1, CODE: 1, HR: 1, SPAN: 1
  };
  var BLOCK_TAGS = {
    P: 1, DIV: 1, H1: 1, H2: 1, H3: 1, LI: 1, BLOCKQUOTE: 1, PRE: 1, HR: 1
  };

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function sanitizeNode(node, doc) {
    if (!node) { return null; }
    if (node.nodeType === 3) {
      return doc.createTextNode(node.nodeValue || '');
    }
    if (node.nodeType !== 1) { return null; }
    var tag = String(node.tagName || '').toUpperCase();
    var frag = doc.createDocumentFragment();
    var child = node.firstChild;
    while (child) {
      var cleanChild = sanitizeNode(child, doc);
      if (cleanChild) { frag.appendChild(cleanChild); }
      child = child.nextSibling;
    }
    if (!ALLOWED_TAGS[tag]) {
      return frag;
    }
    if (tag === 'BR' || tag === 'HR') {
      return doc.createElement(tag.toLowerCase());
    }
    var out = doc.createElement(tag === 'STRIKE' ? 's' : tag.toLowerCase());
    out.appendChild(frag);
    return out;
  }

  function sanitizeHtml(html) {
    if (typeof document === 'undefined' || !document.createElement) {
      return String(html || '');
    }
    var sandbox = document.createElement('div');
    sandbox.innerHTML = String(html || '');
    var holder = document.createElement('div');
    var child = sandbox.firstChild;
    while (child) {
      var clean = sanitizeNode(child, document);
      if (clean) { holder.appendChild(clean); }
      child = child.nextSibling;
    }
    return holder.innerHTML;
  }

  function plainToSafeHtml(text) {
    var lines = String(text || '').split(/\r?\n/);
    if (!lines.length || (lines.length === 1 && !lines[0])) {
      return '<p><br></p>';
    }
    var out = [], i, line, escaped;
    for (i = 0; i < lines.length; i += 1) {
      line = lines[i];
      if (!line) {
        out.push('<p><br></p>');
      } else if (/^###\s+(.*)$/.test(line)) {
        out.push('<h3>' + escapeHtml(line.replace(/^###\s+/, '')) + '</h3>');
      } else if (/^##\s+(.*)$/.test(line)) {
        out.push('<h2>' + escapeHtml(line.replace(/^##\s+/, '')) + '</h2>');
      } else if (/^#\s+(.*)$/.test(line)) {
        out.push('<h1>' + escapeHtml(line.replace(/^#\s+/, '')) + '</h1>');
      } else if (/^---+$/.test(line.replace(/^\s+|\s+$/g, ''))) {
        out.push('<hr>');
      } else if (/^>\s+(.*)$/.test(line)) {
        out.push('<blockquote>' + escapeHtml(line.replace(/^>\s+/, '')) + '</blockquote>');
      } else {
        escaped = escapeHtml(line);
        out.push('<p>' + escaped + '</p>');
      }
    }
    return out.join('');
  }

  function projectDomToPlain(rootEl) {
    var text = '';
    var map = [];
    if (!rootEl) { return { text: '', map: [] }; }

    function appendNewlineIfNeeded() {
      if (text.length > 0 && text.charAt(text.length - 1) !== '\n') {
        text += '\n';
      }
    }

    function walk(node, inList) {
      if (!node) { return; }
      if (node.nodeType === 3) {
        var val = node.nodeValue || '';
        if (val.length > 0) {
          map.push({
            node: node,
            plainStart: text.length,
            plainEnd: text.length + val.length
          });
          text += val;
        }
        return;
      }
      if (node.nodeType !== 1) { return; }
      var tag = String(node.tagName || '').toUpperCase();
      if (tag === 'BR') {
        var parentTag = node.parentNode && node.parentNode.tagName ? String(node.parentNode.tagName).toUpperCase() : '';
        if (parentTag && BLOCK_TAGS[parentTag] && node.parentNode.childNodes.length === 1) {
          // Empty block <p><br></p> already terminates via block exit
          return;
        }
        text += '\n';
        return;
      }
      if (tag === 'HR') {
        appendNewlineIfNeeded();
        text += '---\n';
        return;
      }
      if (tag === 'LI') {
        appendNewlineIfNeeded();
        if (inList === 'OL') {
          var siblings = node.parentNode ? node.parentNode.children : null;
          var idx = 1, k;
          if (siblings) {
            for (k = 0; k < siblings.length; k += 1) {
              if (siblings[k] === node) { idx = k + 1; break; }
            }
          }
          text += idx + '. ';
        } else {
          text += '- ';
        }
      }
      var listKind = tag === 'OL' ? 'OL' : tag === 'UL' ? 'UL' : inList;
      var child = node.firstChild;
      while (child) {
        walk(child, listKind);
        child = child.nextSibling;
      }
      if (BLOCK_TAGS[tag] && text.length > 0) {
        if (node.nextSibling) {
          if (text.charAt(text.length - 1) !== '\n') {
            text += '\n';
          }
        }
      }
    }

    var child = rootEl.firstChild;
    while (child) {
      walk(child, '');
      child = child.nextSibling;
    }
    return { text: text, map: map };
  }

  function htmlToPlainText(html) {
    if (typeof document === 'undefined' || !document.createElement) {
      return String(html || '').replace(/<[^>]+>/g, '');
    }
    var div = document.createElement('div');
    div.innerHTML = sanitizeHtml(html);
    return projectDomToPlain(div).text;
  }

  function mapPlainRangeToDom(rootEl, start, end) {
    var proj = projectDomToPlain(rootEl);
    var map = proj.map;
    if (!map.length || typeof document === 'undefined' || !document.createRange) { return null; }
    start = Math.max(0, Math.min(proj.text.length, start || 0));
    end = Math.max(start, Math.min(proj.text.length, end || start));

    var startEntry = map[map.length - 1], endEntry = map[map.length - 1], i;
    for (i = 0; i < map.length; i += 1) {
      if (start < map[i].plainEnd || (start === end && start === map[i].plainEnd)) { startEntry = map[i]; break; }
    }
    for (i = 0; i < map.length; i += 1) {
      if (end <= map[i].plainEnd) { endEntry = map[i]; break; }
    }
    var sOff = Math.max(0, Math.min(startEntry.node.nodeValue.length, start - startEntry.plainStart));
    var eOff = Math.max(0, Math.min(endEntry.node.nodeValue.length, end - endEntry.plainStart));
    var range = document.createRange();
    range.setStart(startEntry.node, sOff);
    range.setEnd(endEntry.node, eOff);
    return range;
  }

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el) { el.addEventListener(ev, fn, false); } }

  root.Escr.richEditor = {
    sanitizeHtml: sanitizeHtml,
    plainToSafeHtml: plainToSafeHtml,
    htmlToPlainText: htmlToPlainText,
    projectDomToPlain: projectDomToPlain,
    mapPlainRangeToDom: mapPlainRangeToDom
  };

  root.Escr.mountRichEditor = function (opts) {
    var manuscript = opts.manuscriptEl;
    var richEl = byId(opts.richId || 'esc-rich-editor');
    var toolbarEl = byId(opts.toolbarId || 'esc-rich-toolbar');
    var modeBtn = byId(opts.modeToggleId || 'esc-format-toggle');
    var richActive = false;
    var readOnly = false;

    function syncProjection() {
      if (!richActive || !richEl || !manuscript) { return; }
      var proj = projectDomToPlain(richEl);
      manuscript.value = proj.text;
      if (opts.onSync) {
        opts.onSync(proj.text, sanitizeHtml(richEl.innerHTML));
      }
    }

    function applyMode(isRich, doc) {
      richActive = !!isRich;
      if (document.body) {
        document.body.setAttribute('data-editor-format', richActive ? 'rich' : 'plain');
      }
      if (modeBtn) {
        modeBtn.setAttribute('aria-pressed', richActive ? 'true' : 'false');
        var lbl = modeBtn.querySelector ? modeBtn.querySelector('.esc-btn-label') : null;
        if (lbl) { lbl.textContent = richActive ? 'Formatado' : 'Texto simples'; }
        else { modeBtn.textContent = richActive ? 'Formatado' : 'Texto simples'; }
      }
      if (toolbarEl) { toolbarEl.hidden = !richActive || readOnly; }
      if (richEl) {
        richEl.hidden = !richActive;
        richEl.setAttribute('contenteditable', readOnly ? 'false' : 'true');
        if (richActive) {
          var rawHtml = doc && doc.richHtml ? sanitizeHtml(doc.richHtml) : plainToSafeHtml(manuscript ? manuscript.value : '');
          richEl.innerHTML = rawHtml || '<p><br></p>';
          var proj = projectDomToPlain(richEl);
          if (manuscript) { manuscript.value = proj.text; }
        }
      }
      if (manuscript) { manuscript.hidden = richActive; }
    }

    function execCmd(cmd, val) {
      if (!richActive || readOnly || !richEl) { return; }
      richEl.focus();
      try {
        if (cmd === 'checklist') {
          document.execCommand('insertText', false, '\u2610 ');
        } else if (cmd === 'hr') {
          document.execCommand('insertHorizontalRule', false);
        } else if (cmd === 'code') {
          document.execCommand('formatBlock', false, 'pre');
        } else {
          document.execCommand(cmd, false, val || null);
        }
      } catch (ignore) {}
      syncProjection();
    }

    if (toolbarEl) {
      var btns = toolbarEl.querySelectorAll('[data-rich-cmd]');
      var i;
      for (i = 0; i < btns.length; i += 1) {
        (function (btn) {
          on(btn, 'mousedown', function (ev) { ev.preventDefault(); });
          on(btn, 'click', function () {
            execCmd(btn.getAttribute('data-rich-cmd'), btn.getAttribute('data-rich-val'));
          });
        }(btns[i]));
      }
    }

    if (richEl) {
      on(richEl, 'input', syncProjection);
      on(richEl, 'mouseup', function (ev) {
        if (readOnly || ev.button !== 0 || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) { return; }
        if (!root.Escr.templates || !window.getSelection) { return; }
        var sel = window.getSelection();
        if (!sel || !sel.isCollapsed || !sel.anchorNode || sel.anchorNode.nodeType !== 3) { return; }
        var match = root.Escr.templates.placeholderAt(sel.anchorNode.nodeValue || '', sel.anchorOffset);
        if (!match) { return; }
        var r = document.createRange();
        r.setStart(sel.anchorNode, match.start);
        r.setEnd(sel.anchorNode, match.end);
        sel.removeAllRanges();
        sel.addRange(r);
        try { document.execCommand('delete', false); } catch (ignore) {}
        syncProjection();
      });
    }

    return {
      isRich: function () { return richActive; },
      sync: syncProjection,
      loadDoc: function (doc) {
        readOnly = !!(doc && (doc.locked || doc.category === 'reference'));
        applyMode(doc && doc.format === 'rich', doc);
      },
      toggleMode: function () {
        if (readOnly) { return; }
        var nextRich = !richActive;
        if (nextRich) {
          applyMode(true, { format: 'rich', richHtml: plainToSafeHtml(manuscript ? manuscript.value : '') });
          if (opts.onFormatChange) { opts.onFormatChange('rich', richEl ? sanitizeHtml(richEl.innerHTML) : ''); }
          if (richEl && richEl.focus) { richEl.focus(); }
        } else {
          var plain = richEl ? projectDomToPlain(richEl).text : (manuscript ? manuscript.value : '');
          if (manuscript) { manuscript.value = plain; }
          applyMode(false, { format: 'plain', text: plain });
          if (opts.onFormatChange) { opts.onFormatChange('plain', ''); }
          if (manuscript && manuscript.focus) { manuscript.focus(); }
        }
      },
      revealRange: function (start, end) {
        if (!richActive || !richEl || !window.getSelection) { return false; }
        var range = mapPlainRangeToDom(richEl, start, end);
        if (!range) { return false; }
        var sel = window.getSelection();
        richEl.focus();
        sel.removeAllRanges();
        sel.addRange(range);
        return true;
      },
      html: function () {
        return richActive && richEl ? sanitizeHtml(richEl.innerHTML) : '';
      }
    };
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/ornamentos.js */
/* Ornamentos das Belas Letras: cantoneiras, varão vitoriano e colofão em SVG puro ES5.
 * Sempre periféricos, sem bloquear cliques, leitura ou escrita; zero rede e custo mínimo. */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};
  var NS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs) {
    var el = document.createElementNS ? document.createElementNS(NS, tag) : document.createElement(tag);
    if (attrs) {
      var k;
      for (k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) {
          el.setAttribute(k, String(attrs[k]));
        }
      }
    }
    return el;
  }

  /* Cantoneira filigranada inspirada em livros ilustrados / AFK Journey (48x48, espelhável via CSS) */
  function createCorner(position) {
    var wrap = document.createElement('span');
    wrap.className = 'esc-bl-corner esc-bl-corner-' + (position || 'tl');
    wrap.setAttribute('aria-hidden', 'true');
    var svg = svgEl('svg', { viewBox: '0 0 56 56', fill: 'none', 'aria-hidden': 'true', focusable: 'false' });
    /* Moldura dupla em L com recuo delicado */
    svg.appendChild(svgEl('path', { d: 'M4 52 L4 12 Q4 4 12 4 L52 4', stroke: 'currentColor', 'stroke-width': '1.2', 'stroke-linecap': 'round' }));
    svg.appendChild(svgEl('path', { d: 'M9 44 L9 15 Q9 9 15 9 L44 9', stroke: 'currentColor', 'stroke-width': '0.75', opacity: '0.72', 'stroke-linecap': 'round' }));
    /* Estrela-losango de 4 pontas no vértice (detalhe joia) */
    svg.appendChild(svgEl('path', { d: 'M15.5 11.5 L17.3 15.5 L21.3 17.3 L17.3 19.1 L15.5 23.1 L13.7 19.1 L9.7 17.3 L13.7 15.5 Z', fill: 'currentColor', opacity: '0.82' }));
    /* Pequenas volutas botânicas nos terminais */
    svg.appendChild(svgEl('path', { d: 'M24 4 Q27 9 32 7.5', stroke: 'currentColor', 'stroke-width': '0.9', 'stroke-linecap': 'round' }));
    svg.appendChild(svgEl('path', { d: 'M4 24 Q9 27 7.5 32', stroke: 'currentColor', 'stroke-width': '0.9', 'stroke-linecap': 'round' }));
    /* Pontos de arremate nas pontas (estilo varão torneado) */
    svg.appendChild(svgEl('circle', { cx: '52', cy: '4', r: '1.4', fill: 'currentColor' }));
    svg.appendChild(svgEl('circle', { cx: '4', cy: '52', r: '1.4', fill: 'currentColor' }));
    wrap.appendChild(svg);
    return wrap;
  }

  /* Anexa as 4 cantoneiras silenciosas a um contêiner (position: relative) */
  function attachCorners(parent, variant) {
    if (!parent || !document.createElement) { return; }
    var frame = document.createElement('div');
    frame.className = 'esc-bl-frame' + (variant ? ' esc-bl-frame-' + variant : '');
    frame.setAttribute('aria-hidden', 'true');
    var positions = ['tl', 'tr', 'bl', 'br'], i;
    for (i = 0; i < positions.length; i += 1) {
      frame.appendChild(createCorner(positions[i]));
    }
    parent.appendChild(frame);
    return frame;
  }

  /* Varão Vitoriano (stair rod): barra finíssima com pináculos torneados nas pontas e losango central */
  function createStairRod(variant) {
    var wrap = document.createElement('div');
    wrap.className = 'esc-bl-rod' + (variant ? ' esc-bl-rod-' + variant : '');
    wrap.setAttribute('aria-hidden', 'true');
    var svg = svgEl('svg', { viewBox: '0 0 360 16', preserveAspectRatio: 'xMidYMid meet', fill: 'none', 'aria-hidden': 'true', focusable: 'false' });
    /* Pináculo esquerdo (bola + anéis torneados) */
    svg.appendChild(svgEl('circle', { cx: '5', cy: '8', r: '2.5', fill: 'currentColor', opacity: '0.85' }));
    svg.appendChild(svgEl('path', { d: 'M10 4.8 L10 11.2 M13 5.8 L13 10.2', stroke: 'currentColor', 'stroke-width': '1.1', 'stroke-linecap': 'round' }));
    /* Haste esquerda */
    svg.appendChild(svgEl('line', { x1: '13', y1: '8', x2: '158', y2: '8', stroke: 'currentColor', 'stroke-width': '0.95', opacity: '0.78' }));
    /* Medalhão central (losango + 2 pontos laterais) */
    svg.appendChild(svgEl('circle', { cx: '165', cy: '8', r: '1.3', fill: 'currentColor', opacity: '0.7' }));
    svg.appendChild(svgEl('path', { d: 'M180 2.5 L186.5 8 L180 13.5 L173.5 8 Z', stroke: 'currentColor', 'stroke-width': '1.05', fill: 'none' }));
    svg.appendChild(svgEl('path', { d: 'M180 5.4 L182.6 8 L180 10.6 L177.4 8 Z', fill: 'currentColor', opacity: '0.85' }));
    svg.appendChild(svgEl('circle', { cx: '195', cy: '8', r: '1.3', fill: 'currentColor', opacity: '0.7' }));
    /* Haste direita */
    svg.appendChild(svgEl('line', { x1: '202', y1: '8', x2: '347', y2: '8', stroke: 'currentColor', 'stroke-width': '0.95', opacity: '0.78' }));
    /* Pináculo direito */
    svg.appendChild(svgEl('path', { d: 'M347 5.8 L347 10.2 M350 4.8 L350 11.2', stroke: 'currentColor', 'stroke-width': '1.1', 'stroke-linecap': 'round' }));
    svg.appendChild(svgEl('circle', { cx: '355', cy: '8', r: '2.5', fill: 'currentColor', opacity: '0.85' }));
    wrap.appendChild(svg);
    return wrap;
  }

  /* Colofão de encerramento de capítulo / leitura (ramo tipográfico simétrico) */
  function createColophon() {
    var wrap = document.createElement('div');
    wrap.className = 'esc-bl-colophon';
    wrap.setAttribute('aria-hidden', 'true');
    var svg = svgEl('svg', { viewBox: '0 0 180 26', fill: 'none', 'aria-hidden': 'true', focusable: 'false' });
    /* Ramos laterais */
    svg.appendChild(svgEl('path', { d: 'M18 13 C34 13, 44 6, 62 13 C48 16, 36 17, 18 13 Z', stroke: 'currentColor', 'stroke-width': '0.85', opacity: '0.68' }));
    svg.appendChild(svgEl('path', { d: 'M162 13 C146 13, 136 6, 118 13 C132 16, 144 17, 162 13 Z', stroke: 'currentColor', 'stroke-width': '0.85', opacity: '0.68' }));
    svg.appendChild(svgEl('line', { x1: '62', y1: '13', x2: '78', y2: '13', stroke: 'currentColor', 'stroke-width': '0.9' }));
    svg.appendChild(svgEl('line', { x1: '102', y1: '13', x2: '118', y2: '13', stroke: 'currentColor', 'stroke-width': '0.9' }));
    /* Estrela central de belas letras */
    svg.appendChild(svgEl('path', { d: 'M90 3.5 L93 10.2 L99.5 13 L93 15.8 L90 22.5 L87 15.8 L80.5 13 L87 10.2 Z', stroke: 'currentColor', 'stroke-width': '1', fill: 'currentColor', 'fill-opacity': '0.2' }));
    svg.appendChild(svgEl('circle', { cx: '90', cy: '13', r: '1.6', fill: 'currentColor' }));
    svg.appendChild(svgEl('circle', { cx: '12', cy: '13', r: '1.4', fill: 'currentColor', opacity: '0.7' }));
    svg.appendChild(svgEl('circle', { cx: '168', cy: '13', r: '1.4', fill: 'currentColor', opacity: '0.7' }));
    wrap.appendChild(svg);
    return wrap;
  }

  root.Escr.ornaments = {
    attachCorners: attachCorners,
    createCorner: createCorner,
    createStairRod: createStairRod,
    createColophon: createColophon
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/modo-leitor.js */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var PREFS_KEY = 'escrevaral.reader.prefs.v1';

  function clamp(val, min, max, fallback) {
    var n = Number(val);
    if (!isFinite(n)) { return fallback; }
    return Math.max(min, Math.min(max, n));
  }

  function normalizePrefs(raw) {
    var p = raw && typeof raw === 'object' ? raw : {};
    var okPalette = p.palette === 'white' || p.palette === 'night' || p.palette === 'linen' || p.palette === 'mist';
    return {
      palette: okPalette ? p.palette : 'paper',
      face: p.face === 'sans' ? 'sans' : 'serif',
      size: clamp(p.size, 17, 28, 21),
      leading: clamp(p.leading, 1.5, 2.0, 1.82),
      width: clamp(p.width, 50, 74, 62),
      breakMin: p.breakMin === 15 || p.breakMin === 25 || p.breakMin === 45 ? p.breakMin : 0
    };
  }

  function formatEditionDate() {
    try {
      var d = new Date();
      var months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      return d.getDate() + ' de ' + months[d.getMonth()] + ' de ' + d.getFullYear();
    } catch (e) { return ''; }
  }

  function readingMinutes(text) {
    var words = root.Escr.countManuscript ? root.Escr.countManuscript(text || '').words : 0;
    return { words: words, minutes: words ? Math.max(1, Math.round(words / 200)) : 0 };
  }

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el) { el.addEventListener(ev, fn, false); } }

  root.Escr.readerCore = {
    normalizePrefs: normalizePrefs,
    readingMinutes: readingMinutes
  };

  root.Escr.mountReaderMode = function (opts) {
    var storage = opts.storage;
    var overlayEl = null;
    var prefs = normalizePrefs(null);
    var breakTimer = null;
    var settingsOpen = false;
    var previousFocus = null;

    try {
      if (storage) {
        prefs = normalizePrefs(JSON.parse(storage.getItem(PREFS_KEY) || 'null'));
      }
    } catch (ignore) {}

    function savePrefs() {
      try {
        if (storage) { storage.setItem(PREFS_KEY, JSON.stringify(prefs)); }
      } catch (ignore) {}
    }

    function applyPrefs() {
      if (!overlayEl) { return; }
      overlayEl.setAttribute('data-palette', prefs.palette);
      overlayEl.setAttribute('data-face', prefs.face);
      if (overlayEl.style && overlayEl.style.setProperty) {
        overlayEl.style.setProperty('--reader-size', prefs.size + 'px');
        overlayEl.style.setProperty('--reader-leading', String(prefs.leading));
        overlayEl.style.setProperty('--reader-width', prefs.width + 'ch');
      }
    }

    function stopBreakTimer() {
      window.clearTimeout(breakTimer);
      breakTimer = null;
    }

    function scheduleBreak() {
      stopBreakTimer();
      var pauseEl = byId('esc-reader-pause');
      var bodyEl = byId('esc-reader-page');
      if (pauseEl) { pauseEl.hidden = true; }
      if (bodyEl) { bodyEl.hidden = false; }
      if (!prefs.breakMin || !overlayEl || overlayEl.hidden) { return; }
      breakTimer = window.setTimeout(function () {
        if (!overlayEl || overlayEl.hidden) { return; }
        if (pauseEl && bodyEl) {
          bodyEl.hidden = true;
          pauseEl.hidden = false;
        }
      }, prefs.breakMin * 60000);
    }

    function buildOverlay() {
      if (overlayEl) { return overlayEl; }
      var sec = document.createElement('section');
      sec.id = 'esc-reader-overlay';
      sec.className = 'esc-reader';
      sec.setAttribute('role', 'dialog');
      sec.setAttribute('aria-modal', 'true');
      sec.setAttribute('aria-label', 'Modo leitura');
      sec.hidden = true;
      sec.innerHTML =
        '<header class="esc-reader-bar">' +
          '<button id="esc-reader-close" type="button">← Voltar à escrita</button>' +
          '<span id="esc-reader-stats" class="esc-reader-mode"></span>' +
          '<button id="esc-reader-prev" type="button" aria-label="Página anterior">Anterior</button>' +
          '<button id="esc-reader-next" type="button" aria-label="Próxima página">Próxima</button>' +
          (opts && typeof opts.onOpenAcademy === 'function' ? '<button id="esc-reader-anatomy" type="button" title="Explorar a anatomia do livro na Academia">Objeto livro</button>' : '') +
          '<button id="esc-reader-settings-btn" type="button" aria-expanded="false">Papel e letra</button>' +
        '</header>' +
        '<div id="esc-reader-settings" class="esc-reader-settings" hidden>' +
          '<label>Papel<select id="esc-reader-palette"><option value="paper">Jornal (Marfim)</option><option value="linen">Creme suave</option><option value="mist">Névoa clara</option><option value="white">Galeria</option><option value="night">Noturno</option></select></label>' +
          '<label>Letra<select id="esc-reader-face"><option value="serif">Literária (Serifada)</option><option value="sans">Sem serifa</option></select></label>' +
          '<label>Tamanho<select id="esc-reader-size"><option value="18">18 px</option><option value="20">20 px</option><option value="21">21 px</option><option value="24">24 px</option><option value="28">28 px</option></select></label>' +
          '<label>Entrelinha<select id="esc-reader-leading"><option value="1.6">Compacta</option><option value="1.82">Editorial</option><option value="2">Ampla</option></select></label>' +
          '<label>Pausa de leitura<select id="esc-reader-break"><option value="0">Sem pausa</option><option value="15">A cada 15 min</option><option value="25">A cada 25 min</option><option value="45">A cada 45 min</option></select></label>' +
        '</div>' +
        '<div id="esc-reader-viewport" class="esc-reader-viewport" tabindex="0">' +
          '<div id="esc-reader-page" class="esc-reader-page">' +
            '<div class="esc-reader-masthead"><span id="esc-reader-date"></span><strong class="esc-reader-brand">ESCREVARAL</strong><span id="esc-reader-project-tag"></span></div>' +
            '<article id="esc-reader-article" class="esc-reader-article"></article>' +
          '</div>' +
          '<div id="esc-reader-pause" class="esc-reader-pause" hidden>' +
            '<h2>Pausa para os olhos</h2>' +
            '<p>Descanse um instante longe da tela antes de retomar a leitura.</p>' +
            '<button id="esc-reader-resume" type="button">Retomar leitura</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(sec);
      if (root.Escr.ornaments && root.Escr.ornaments.attachCorners) {
        root.Escr.ornaments.attachCorners(sec, 'viewport');
      }
      overlayEl = sec;

      on(byId('esc-reader-close'), 'click', close);
      on(byId('esc-reader-settings-btn'), 'click', function () {
        settingsOpen = !settingsOpen;
        byId('esc-reader-settings').hidden = !settingsOpen;
        this.setAttribute('aria-expanded', settingsOpen ? 'true' : 'false');
      });
      on(byId('esc-reader-prev'), 'click', function () {
        var vp = byId('esc-reader-viewport');
        if (vp) { vp.scrollTop = Math.max(0, vp.scrollTop - Math.max(120, vp.clientHeight * 0.85)); }
      });
      on(byId('esc-reader-next'), 'click', function () {
        var vp = byId('esc-reader-viewport');
        if (vp) { vp.scrollTop += Math.max(120, vp.clientHeight * 0.85); }
      });
      if (byId('esc-reader-anatomy') && opts && typeof opts.onOpenAcademy === 'function') {
        on(byId('esc-reader-anatomy'), 'click', function () {
          close();
          opts.onOpenAcademy('objeto-livro');
        });
      }
      on(byId('esc-reader-resume'), 'click', scheduleBreak);
      on(byId('esc-reader-palette'), 'change', function () { prefs.palette = this.value; applyPrefs(); savePrefs(); });
      on(byId('esc-reader-face'), 'change', function () { prefs.face = this.value; applyPrefs(); savePrefs(); });
      on(byId('esc-reader-size'), 'change', function () { prefs.size = clamp(this.value, 17, 28, 22); applyPrefs(); savePrefs(); });
      on(byId('esc-reader-leading'), 'change', function () { prefs.leading = clamp(this.value, 1.5, 2.0, 1.7); applyPrefs(); savePrefs(); });
      on(byId('esc-reader-break'), 'change', function () { prefs.breakMin = Number(this.value) || 0; savePrefs(); scheduleBreak(); });
      on(overlayEl, 'keydown', function (ev) {
        if (ev.keyCode === 27) { ev.preventDefault(); ev.stopPropagation(); close(); }
      });

      return overlayEl;
    }

    function open(doc) {
      buildOverlay();
      previousFocus = document.activeElement;
      byId('esc-reader-palette').value = prefs.palette;
      byId('esc-reader-face').value = prefs.face;
      byId('esc-reader-size').value = String(prefs.size);
      byId('esc-reader-leading').value = String(prefs.leading);
      byId('esc-reader-break').value = String(prefs.breakMin);
      applyPrefs();

      var text = doc && typeof doc.text === 'string' ? doc.text : '';
      var stats = readingMinutes(text);
      var statLine = stats.words + (stats.words === 1 ? ' palavra' : ' palavras') + (stats.minutes ? ' · ' + stats.minutes + ' min de leitura' : '');
      byId('esc-reader-stats').textContent = '';
      if (byId('esc-reader-date')) { byId('esc-reader-date').textContent = formatEditionDate(); }
      byId('esc-reader-project-tag').textContent = doc && doc.project ? doc.project : 'EDIÇÃO DE LEITURA';

      var article = byId('esc-reader-article');
      article.textContent = '';
      var h1 = document.createElement('h1');
      h1.className = 'esc-reader-title';
      h1.textContent = doc && doc.title ? doc.title : 'Sem título';
      article.appendChild(h1);

      var byline = document.createElement('p');
      byline.className = 'esc-reader-byline';
      byline.textContent = statLine;
      article.appendChild(byline);
      if (root.Escr.ornaments && root.Escr.ornaments.createStairRod) {
        article.appendChild(root.Escr.ornaments.createStairRod('left'));
      }

      if (doc && doc.format === 'rich' && doc.richHtml && root.Escr.richEditor) {
        var richWrap = document.createElement('div');
        richWrap.className = 'esc-reader-body';
        richWrap.innerHTML = root.Escr.richEditor.sanitizeHtml(doc.richHtml);
        article.appendChild(richWrap);
      } else {
        var plain = document.createElement('div');
        plain.className = 'esc-reader-plain esc-reader-body';
        var blocks = text.replace(/\r\n?/g, '\n').split(/\n{2,}/);
        var hasDropCap = text.replace(/\s+/g, '').length >= 80;
        var pIdx = 0, bi, blockText, pEl;
        for (bi = 0; bi < blocks.length; bi += 1) {
          blockText = blocks[bi].replace(/^\n+|\n+$/g, '');
          if (!blockText) { continue; }
          pEl = document.createElement('p');
          if (pIdx === 0 && hasDropCap && /^[A-Za-zÀ-ÖØ-öø-ÿ]/.test(blockText)) {
            pEl.className = 'esc-reader-dropcap';
          }
          pEl.textContent = blockText;
          plain.appendChild(pEl);
          pIdx += 1;
        }
        if (!pIdx) {
          pEl = document.createElement('p');
          pEl.className = 'esc-reader-empty';
          pEl.textContent = 'Folha em branco.';
          plain.appendChild(pEl);
        }
        article.appendChild(plain);
      }

      var endMark = document.createElement('footer');
      endMark.className = 'esc-reader-end';
      if (root.Escr.ornaments && root.Escr.ornaments.createColophon) {
        endMark.appendChild(root.Escr.ornaments.createColophon());
      } else {
        var fleuron = document.createElement('span');
        fleuron.className = 'esc-reader-fleuron';
        fleuron.setAttribute('aria-hidden', 'true');
        fleuron.textContent = '— ❦ —';
        endMark.appendChild(fleuron);
      }
      var endText = document.createElement('span');
      endText.textContent = 'Fim da leitura · Esc para retornar à edição';
      endMark.appendChild(endText);
      article.appendChild(endMark);

      overlayEl.hidden = false;
      byId('esc-reader-viewport').scrollTop = 0;
      scheduleBreak();
      byId('esc-reader-close').focus();
    }

    function close() {
      stopBreakTimer();
      if (overlayEl) { overlayEl.hidden = true; }
      if (previousFocus && previousFocus.focus) { previousFocus.focus(); }
    }

    return {
      open: open,
      close: close,
      isOpen: function () { return !!(overlayEl && !overlayEl.hidden); }
    };
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/maquina-som.js */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  /* 8 amostras MP3 mono (24 kHz) masterizadas com timbre quente e volume nivelado — compativel com Android, iPad/iOS, Linux e Desktop */
  var SOUNDS_B64 = {
    key: 'SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYyLjMuMTAwAAAAAAAAAAAAAAD/84TAAAAAAAAAAAAASW5mbwAAAA8AAAAHAAAGAABAQEBAQEBAQEBAQEBAQGBgYGBgYGBgYGBgYGBggICAgICAgICAgICAgICgoKCgoKCgoKCgoKCgoKDAwMDAwMDAwMDAwMDAwODg4ODg4ODg4ODg4ODg//////////////////8AAAAATGF2YzYyLjExAAAAAAAAAAAAAAAAJAQ4AAAAAAAABgDtBqpuAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/84TEAByJumgXTxgACgBnGmaajjH4LYJoeA+wAgBMGIwkrFvHrQuQ0zrZ8Uze+AMDA30RC4iJu+7u5/+ie7nHfhbvu7u5//8/dEL3/656IlABA0H38uOB8ocy7xANBCoEBIGP5d8TjgfU5Jd5wTvB9/UcE58H/6gffl/B8+oMKgE00o9nc3L0oASVJcpRxsIMcgBuibkLXCLPdUD8jE4MYoBooJWKAFmA2kQOAMY3hc0vEZyaMxCUKJUS4fSCsyH/84TEQDfr5sZXj3gBpnW5u1CdLee7JdRXVrArGRV7pBQ45o6cHzWLJY9mmPfbPPEQ+FBeK3SdtZvm3dx6rxm91i/YMvdNpysTNG+f/7W/eRH8fv38dkzHiQtwWVDfmDbGbffr////90+3kSmImv/ikLGIUKZ8+rqS+t2jW97WhR/vWa/58SzxkVcCJuBEj3+b7pjWb7xBlo6lZcsr3FXuLXvrP9ojho+h78X63UAPbWeoK8iX0VIQh8FOI0zhRaD/84TEEySSFpwl2EgACUPM90ogyB5rViOU9rOsPkUwNzaYUFBNIIgmCwgT9M6ck60BgnNoikWzeF0V50kIyrWQaalKBhnXr9Kkv6tK7zwVhLI1F/qa6U2LYz+Pzb2rTuoSy3lWCzxA8EyBsuJiRNRJTRRutIyucYfxQ0gNDSrwBNKYg1xxAUbraNc/c5UA07xE8M6mNSREIk4gkGGgyCl0yFfwWAKav4WuX+w1rrouK1qJMpfWDn9TVh+QxqURG9f/84TEMy1q+ogE0kc0XRhhgssaFHh8AwNGmSAqOsgMDQkDYlQogWIjRGXB5sgIdSYbISVdHZKXYJSw0TJMziSuhmTdL3I6gRSk3BiUsMYKoNLComktDKLBqQSXBYZBOKjT8tgWAqdBbWef5T++RQzynsXJrVDRg9YSNBZACe4aME8qiL9pJ7gbvBZpwxvFUUoEKLxMCyOrMOKmABkyhELMgOCY04Jd1UKAJpMAO9G4qIhclUaOsjQHk0WZxg0h2aH/84TEMCd7poAG0kq8ETSzyUKkAVJSLWQsRD5ihDAl9xdqIVSWNIZbH7IhYFUpIq7GeRlQpWdqB4WnAGKlMapSipWblLGO1WeZ2ltlKWtHQ1lLUpVKKlK0ti9StdWrKrG7dSsr1KQ2ro9HmzGlRy9rYeNsJFnh2RzSXSUSwoSZA5qWns+xwtKYMRFsZiK91uorDWeN0HlAqSURkZPmKQSqEonNmK1bhdMj74LAKrIlkSIocEgwlAUTCTk5wkkaicv/84TERSLB8kgEywx0IxpRJrRbZap8kSKPfAZTo1XfK75XqWs4klv//Y7ZzkQEZLD+IhKAiIa+RLLAQFSdBUZ3N+sS5YqCUSuqUe8qo8pZCuJXkQkZGRkf8IkRCWKnC5RGeDIWEI0B4wIxQJxMKREMh4bEBGSMNRlllVgoIGCdBxQUMFBAwjoTLLKjmUssslllhkoYKCBgg6CxShgYIGEdE//1VlBAwTo7KwMEDR0I7LLL//5ssssciayyo5//8Zb/84TEbST0OQQACkawWWOQkMFDAwQdBYpWBggaOhH//2WWVDNZZZU///ssspGyhgYIGEcZTEFNRTMuMTAxIChiZXRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=',
    key2: 'SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYyLjMuMTAwAAAAAAAAAAAAAAD/84TAAAAAAAAAAAAASW5mbwAAAA8AAAAHAAAGAABAQEBAQEBAQEBAQEBAQGBgYGBgYGBgYGBgYGBggICAgICAgICAgICAgICgoKCgoKCgoKCgoKCgoKDAwMDAwMDAwMDAwMDAwODg4ODg4ODg4ODg4ODg//////////////////8AAAAATGF2YzYyLjExAAAAAAAAAAAAAAAAJAQgAAAAAAAABgCIW1mgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/84TEAB7J3mQFT0AAhv3v4DArGTTxWIYoJmND3M/BCxczLnYFYyROkh2DceHACgeDQBAAACgeULg3D+Abh+ff/D5ApRYueMBuDcXuESvRK3d4Fxd7//hK3e4d/5d4d9K3fLPf8QHIYWD/E44H+Dji4fUD/5RwIflHAg4uHxGHygIDQQ/EA0EHKv9gO8esMes9/78uhPISqT5QiyF2E3WC5qQOkHUYRMzXW2QXUvR4p8dwvGVMNrToiLxhISnSpuH/84TENzWTZsGVj3gA0IRGpoQ8bp2H2fJVkmwT9meLwsBLyDknq2F/uPxcK+C1umVtUGnh1s8dnYkOePHDDY4I5VJ1rgwd0hTeBBsztkNXMOzdetzW5lgc4MRnvtgv9wNfPj/7tPvMmc0bVmFkt6cfv1GxyvXN6/rnv4ERDHV3kTLh/SmG2dQ5bXBuzb51//Xy4gZj0vXW6/H/pvV9Y18xwH1KB4SnosDXQWODagTNg+07Xf9meQNNI2IV6sRlTBH/84TEEyiiBqAH2HgALZgbmRp9n2V0vt3bFuUJ8voAlDhATQHUgponSmEKYGq8aGdpfYatVqAenKnWFWoJ3SNSWArlcw6o2MT5itSkSNCcp4SugSzSqV7FxPZhcYbjmnrbH1iN601r3vq8J8zPXu9Z1WstoUYikkRBUFQVOMLFUDlPdiUAnUqPaf7Y0eoC61YUBpopUtxRNkGqhya6BUzYqi/FyAcQhZWClGoXotgEmKW3E/PoHmjB4DrHoLoUJ/r/84TEIym6BpwGew0RaIIvmCLsLCehJRci6CxyIAUE0K1Ebgz12B+q44Zw8SrxIdP7oVXqXpVu5+cVS4BPD45VPXGk1YRsgeX/RbUwXBnwmQtFOyaC1bF+KkhZT0gmkhpqQqaGLfdx/i6aVeTbUqn25mMKO2939gTmJGufh8iVN//99DNTLmEhlVIQren//T/3oIAIZuXj0JResZWcs20AMB4nYdHS90lGT7AlLz1MfGq0lyw2kqRcotBLQUsbRqP/84TELyC6qq32YYbwVdzcckjuTCP7HUj/gMTBwqBRIYGJDOqmsb4OrH7f2GpNkwU1BCtuNSa/keWqz1yzIod1z7y5NSDDqITx2ZpOr9QCJJdCQ8EiUCltWFQKAlqsQ9ksBtuTw3i9EhLCSIkxPVGJqlcqYbwKYYx/FkCwGvq1eBdEExRElocSwOwIgqTDM1Mjo+OicmPmjJdCetF0+nVJkUyy0ZUet9q8yYrtau4ZN0eCgMFL3tDDrSZUwYCR99n/84TEXyJp9lgEewa8oyoKs/jMwEBXRKFRY9sItDsRYx/ctxYRPTTyu37SLc7KuU/U9YNHuIq8jUSFZU4dUbMhkLAqDwHg4C4KA+CoLAqCwOg4C4UC4GI9ZUMUFDAwTo6SyyyyK0sW1qRONKLKPKLEihIoDECxAsSKEigMCFiDz2dnZ4t27OztJpxpxZR5h5ZxpxZR5h47+XTEqr6RVVVV0000/yqqsJppA6qqqh//////iVpppv9VX//0gxKqqun/84TEiCRZ+SgASMztppA0tNNNFVVVSkxBTUUzLjEwMSAoYmV0YSAzKaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=',
    key3: 'SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYyLjMuMTAwAAAAAAAAAAAAAAD/84TAAAAAAAAAAAAASW5mbwAAAA8AAAAHAAAGAABAQEBAQEBAQEBAQEBAQGBgYGBgYGBgYGBgYGBggICAgICAgICAgICAgICgoKCgoKCgoKCgoKCgoKDAwMDAwMDAwMDAwMDAwODg4ODg4ODg4ODg4ODg//////////////////8AAAAATGF2YzYyLjExAAAAAAAAAAAAAAAAJAMeAAAAAAAABgDYccSvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/84TEACcCbkgDTMAAETzNf+UowSAbk9oQAQA4IgkCQDcG5PjKgNBEPQTQkIBEwHkZGWrAQ0c18GU5nChvA8Qch3JZuMP4/kOXpXDdG+ip11xeYdhyHcnJWzhrkUxlb/w/flDO3Ll9yURiWWN0lJhhhhhz8MP//w/Okw3nnqphukpMPzzz7rPP/ww//w/+/hUwzjFJzPPv8/Dm8/wpMN0lIND8o7/8Mf/psx6PdiK5XEla5QgASKiDxKWHAIx4SGP/84TEFy1S/qwBmXgADAOtyihFF0T5ylGDbPw4VctBsqtCA6B1IMyRXGxw7HYdRM350RyIUJyJw0IGJo6sZCeA0zjDVMhN2w6gJl8lVI7gRM71ENsva7esUNv52MzMqUMMv+sfxNe7ZKmWx/3B3uWRji52rEZGveJm7+99Q38SkWDBudzfJqD1Fp9mFaen+a6rHo81e+///796pIUOLiu/9f/+LaYM7u3/1VpVgQUgycvKGySojYGQawnQwsjMD7n/84TEFB6SnsV3yUACC0jJTR9F8LCACoAMBI6TRU6k+xtNZxRxwsfcqzDVX/VVWZVfWv4VbpUtv427n5iGa3U2BU2qma5YW3UlVVmZr/79aJJVfr//hm1qGuuTQVOqPEraJvyAifiU6E/+rDQaAL+aa4Ma1QCoo8u0AFhRY5gxM0BfgbgUHMsc4ZQ6dOsQoJznGCsg1CkxkaUi7bPlB2HJPKkABDJgCO1pdiR5J3MxFWXBVjDMUyXZbDDPMk5lnVD/84TETC3KSoQGy9MQl0OsTMl5qOKGKRXvHqEvIKTOdHn4RkG+ujrKRTIafq7XDM/lEZGMviRnE0wfNpGSM2GCEnoEDpMMYN7MwzIEHI1+JCwYuUZpJrzSdP+N15r/a1qEHA5YXErYROCQBhRN2B292Xhj5T/v9XeqAU8qry1SotkhUulI0SCAGtwAxomiios68BJnO8XZCh1mqArxQpegs8pFZTV2mwNLouis/S5YBiTOQ9BiB8PNH0/cXmImlZP/84TERynp2owGww0sNFt1akQ5s0ZNlJb9R5PCobm6EYmQg2EgS1gCCTk6I5po6nRlE3m6S21H4ammU9xVoo8ahAOwqgqnYBDKxqCQ4HCY3ZUObKpWCbLlFgGFg2ZBl/WoDJSjUpJFNKakDDOrVQHK2xC3EGHqQq5fRJQjx5kFQlMCFDiOpiBEeCOIrRVQF1uOiUDYtHR2BEGoJGYixFYCRmakpZHzS5sSYqEkSSawffl3TlSdPTCpXSVVP0eWoSP/84TEUiKBsnAGewa8dCoKCiYeoMSs4dXjWGgoKHjyVHmREHRFbkctzr1EivU88SrUkqROrdQKgWlTXLO/VoCqP5aRbgUAiLlsoCCcjJgoYE6WVDJY5GTKCBOhkZMtjkZGrSz9lkqOXLJZZyyWfywFUP5Z/+ygpZ/LJ//2yz7LZf+Wxydv/oikdjFMDVNUVFUj91T3KYGCQ//8pgaiPFW/qFhX+oVxUUbiykxBTUUzLjEwMSAoYmV0YSAzKaqqqqr/84TEexkbQfxWGMUcqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=',
    key4: 'SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYyLjMuMTAwAAAAAAAAAAAAAAD/84TAAAAAAAAAAAAASW5mbwAAAA8AAAAGAAAFQABJSUlJSUlJSUlJSUlJSUlJbW1tbW1tbW1tbW1tbW1tbW2SkpKSkpKSkpKSkpKSkpKStra2tra2tra2tra2tra2trbb29vb29vb29vb29vb29vb2/////////////////////8AAAAATGF2YzYyLjExAAAAAAAAAAAAAAAAJALFAAAAAAAABUAS27wKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/84TEACPSkmAHTDAAACpmZma/DgSAaA0AmB8n2JANAaEyEQBIPO2795u9//u4jvd3sEyd+IQyyCHvTCBByBCO0EEPERnu79nk7YgACDggAIIc8mTvPd3faLu9gwggeACGdiAAIFgAIQfwQIYYQjHPJpmAMLT/sncAMLTaCCGWQIHAff8H4gDAkDCz5QH3ghKf3iM/lwQcJw+Iw+UVBFJTf/qAABb/JmTYKMPgvJujEZQgrQb5Wn2hAnyrZy1PMtj/84TEIzEC2rmVj3gAqE2yNiFIBKnIlGeCN5Hm+qICehqpVsCuRivjGlYly6mkh3sqID8yILOmHNqUzM2Y1LiddQVftV4frCHRozxTK5RQ8Ug4xBL+j1fahbDIlOhRNr1ZuxHMX7/Mam/AYquD9oV7OwnXIq2xUOX1CZm2NV7Be4x/vW60/+fMzur/cCkCsesem/beMVrVuo+LPKightIuXKnwIEAG4M+EQVKCn+sBOXVrg4bW0ZS8bDyFEFOY/sn/84TEEiU7qqQH2EAC2TS6zG4lSRKKxucsSi5SXA4CouaHZBEuYXAwG4cCVBN662UkWOORiJeMtrjh0FhkxNVuh5VIM59m6VuI4dbpYh5hiTnUcwvf33HUxt209X3Fdr9XxN//XF+O5NH3F0ro8PMW0yzrxUxCjz4ofxxM501dj41WO5r7uLvgkALGHhS5XzAAvsLAlpihns4WEQQkpUa9IqBGFY0BAIJglVZIpxnCKohEojJC+obOgdb5ovmuwsr/84TEMCfqNowGywysoujqcpCRoS5dC1knKCkgcJYkXVF4TQ0wX+dM45JzkxB48ssaEpO4ScpX8a7tIBgkSxPkAIxMORMJI6kkyitROqPpVbf3qtLvH0ECKYKIJ0LN7wnEjmIeqKCYByQoZBZyHlnCWzQHgVNDRYxM57fuVWBOdu5hkJvoJqj5mCZkBJghokZam85alXrsxBQJdTvT7wqGcSJlmxSAYTNLFwzGNMxQkJLlTQyRIpLNSKiWKT4Ijpn/84TEQyeidngm0ka5tDrNLSokKAt5MzYUCNS9mOMzBYa7NSgYCAhTUSwMSqqzhRPSOKTHBTfxjWH1m6WGFAShRMx+fpI5E7vhQy41iL+MoqDC9twU8b+jfiu/EVoJdlCalN/qngpv8mUMEk6FhkQQCBD9CwHGLmqKMrdN/JeUBoWcJAzExpJ8k6EpOLQSNZi4pS7IxgIJyy1DUju21JvVoaz///ak0ak1JgtL/Jr/5NSUvqtS9gpEJC4CB0jFdrP/84TEVxtqCjAuwYZ0/V9SP9ZFqCMsR7WnnBXLCUgR4qkZ8KpMQU1FMy4xMDEgKGJldGEgMymqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=',
    key5: 'SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYyLjMuMTAwAAAAAAAAAAAAAAD/84TAAAAAAAAAAAAASW5mbwAAAA8AAAAHAAAGAABAQEBAQEBAQEBAQEBAQGBgYGBgYGBgYGBgYGBggICAgICAgICAgICAgICgoKCgoKCgoKCgoKCgoKDAwMDAwMDAwMDAwMDAwODg4ODg4ODg4ODg4ODg//////////////////8AAAAATGF2YzYyLjExAAAAAAAAAAAAAAAAJAPVAAAAAAAABgA2G+9zAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/84TEABW4Ung3SRgCEapm/Rz/85yIABgbNqCgUEjE0CA5DAkCIPvBAH34jPqdBApBAM1l4Pvy5+CA0EHQwUOcMco6UcCHy9YILD/5+GC/rBCD/1A+oEJQEHLf/qB8Pzn/lAQcEALQIIAxTl22RvAxaDpwrueWdX0WQaksAhuxlOdl6KLyIAEm3JUHdceE87GXBTakrOWb6hgv0IUiIrPgc9ZwSJgDsPxFmsQJTr4rww4t1g1uAp5nb99oWdz860n/84TEXD7jkqj3mcADf1/3tlGMAyNaLmRyX1pY+jXMYpVcKBotLpc/0qta1bx1ep5ty4HlleXzkrZDDS6n6s1rc1LpXacGTUv3r92NupNy+Wbz3n/xqLVKbU1PY67z9S6/39fvv8+URSmfyclFjOx/9w5+E68EIkVBZrWNZ4VbOvxwpn+kdim5f3j3fefycyvd53/z1////389b5cybGsMiPQWI+ZJJaS8OXw5agpy6DH5NIY7h0K0dGsk7o8k35L/84TEEybR8pwP2XgCgFA6kUB8pLWPw/jtKC00vV6xeHF6qTPJjiRVYdJfh+ogR5kOMfqTQxrjKF4nWx2yNcj5kcKODW3QZvSFZyh2xGhYtfDv+Tf1i1bWrJPbG65tbMsavq+zWa182/zr6x4vtFwhwe00oYLCzRCIIjvzICVK3/9hnSxzoD305VrCTIdcZWsqgQNthuoPbJzGsxRlMkFHgzofAVGVAk0sdbsZSGGQjhh40d+BdRxMJDNjRCYiSrH/84TEKi3hwnQG3hh8jR05BG4H6LhGsDuhlkT3lS9YkrO6rmrHUpZkpihi4reOvAz0PtFXepYfaBGoFUqh12XkSARXieQCGOxgfFUmki5yuLa5ps6LRkmVJXdhZW1xa6SmYH3aYho60XqI7drzV4kgkWPujBi2qyoaPaHKuuwuSFRNC6A3AISQXGoW8VdYdtvahT6MmnrC+Ou+6jLKDAMxMnOCmT7oE0d6NfCAQmG0iyOQgiBwpkiTDeB9lBk3V6P/84TEJSi5omgG3hhUDW1XK0gxgAJDCBmzLo67rkuUymkAUyFQHhBJq1IbrR6HtWhDmBk0OyUEwhEQyPrGR+IpNcOTxetWreqVTYku/LPTZlbn0/7baZt7MVnlzR89MeDVYKnSzDwNO+qAmOng2skOsePW7coYZuc5sZ0JdX5PIpB2xsykXReoiugb+ZaZrKZyAJsZQZiBw0xKQDPgALUHLQvKfy28NJ3pOuCedl9OE3hxN4yKBMKSwfHQSKgqKBP/84TENR6BDkAE09JsYRPIYTkiKjoDDwVQAGQE0pbeSkqk1EsDQTIjHlSoKiISsPToFEh78sIjU8oGg7LfBoO/dPQVO+twlBU7w1rBX4se//wVTEFNRTMuMTAxIChiZXRhIDMpVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMSAoYmV0YSAzKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/84TETAAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=',
    space: 'SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYyLjMuMTAwAAAAAAAAAAAAAAD/84TAAAAAAAAAAAAASW5mbwAAAA8AAAAHAAAGAABAQEBAQEBAQEBAQEBAQGBgYGBgYGBgYGBgYGBggICAgICAgICAgICAgICgoKCgoKCgoKCgoKCgoKDAwMDAwMDAwMDAwMDAwODg4ODg4ODg4ODg4ODg//////////////////8AAAAATGF2YzYyLjExAAAAAAAAAAAAAAAAJAK4AAAAAAAABgDeYUiKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/84TEACMh3jwFT3gAAfCcIIPQXCKn1HCLedbnAViGKBWMivQ801G1EoE0JYviEC4IRWPuBEhoYoJrv77o8fx9/5vuAr2fdHjyms018QGBWOENDFBEhsbO/swIez2YHmWOOwE7OtzgMDyJSA/f3xAePHmqazvFHkTLx4Aw/KAgcB8+D8Tg+Iz8uOB/JiM//Ln+CH5eD//99UEFcB/V8INl5wcV+4QPbSEX+j2/99tYsmakUxuUUnTHlVnIolREzBP/84TEJjFjkqgBmHgApUZpsJNkaZhO1ftXucRkTaoQ58kjkulTSZ99ntovB1KRDDjitLerITM5PXOi3najLatl6M46RHB44gI5WtRpOTkyMCgqrJrvRYhhgZhNYieN00BXZEJXDBDVThHeM+2fETFNY/5djzVyqU8ksWJFxa0F81b96VtX/3vu+d3///+7v2RbZnsa3+9eLTf14cuM71/X4///////////8fZatQA9eirSDEVzEdFpE6V7Ub4N8/v/84TEEydaarAH2GAAA8tbyzjJINvUzww9TQS4Ta+q2IpkheaGB8KjNomtnCuAtFlM+w3AneYs+TVzPbR9ldFuV9E0PJoubStR/uPO548khaysPnVPNGVHvhMWjK8U+7aV1+m7lruR7l71Ye2ubkVr9s/1s2nzvLmdUJB5E8JDQFyMJDP0kgUgWe+VZdxxEJGjwBZ/Q9gxCgFfASA80mN9kOY6GBmDwUmMpU+a5oGa8ptBdSTSWtTPvCoGkU4NBqj/84TEKChDdpgGwkr82NE4iC4qUisTEq1mFjhuQp1c6TQYJjariz4ACYNsrNSxNi1mV1NkmcKTi0k9FbZtzXjH9I42n2r18nEKjSqU2SFNdg0SDzuciGRTvVyobYiKu7dH3/kZnaww5JSq1lVPT8sb5DujG3W2UdJWFVEIgQKkY5h1ksuxzQaGQYNMmyMH+YiBYPCgYBFgzHmRqJMilJdZ+nOZ2x15WsuDmzp7IHkqXzTXJceERNhrgL3abKKN43X/84TEOixDQnwE0wc2QIoZAYAk7pWFx8OynZH1DbuDVr9PdyNdp1WE6cOTpUZH30o1aBczVyAzfqWlrSSaNf5zFRfE6mXdMB9XF7LKKoMjNApU0Ofr0j1RmuXf2DCpcv9Q1h3FcrM19mP8svzzr5GkbCsMljKRYTLamRKiM6tfpR3BpxIbxERNIvM0kPLSA0pXKq4GI0S+VqygEl2CaKI4AJ4pCpAGnoUSJGJRVAEmyELGgFDLioEpFURE3EKhl0j/84TEPCVB3mQE0kx8iUFTaIodVUyUzOHJMxJZoBG/Kr16qtnmkYr+WlrRyTUZLR/dq8mooKhoKAUFQVdgsHXvDRESvcp551BY7XEISu+1BEs2wcJmLIkslnjq2HhYlDS2SUQllgIGOnkyZ/Bqrg9k10AsSSADoKla9HzpJ6M3pVbprs7DQsaSLjK9AoEHk0tGpKucORBiaNGnJovlGwlOejYSfNkUgSeXZKwCJVVFwkROMtRJ5wCp+qNYFBoees3/84TEWiRbXhQAyYbcYeqNr+sbUlJvVGplKTHV1z/LWH1WNWUv///6TbHSY15S//1jBUFUMHnKAuFRliwEBSXa62oCsXVMQU1FMy4xMDEgKGJldGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=',
    backspace: 'SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYyLjMuMTAwAAAAAAAAAAAAAAD/84TAAAAAAAAAAAAASW5mbwAAAA8AAAAHAAAGAABAQEBAQEBAQEBAQEBAQGBgYGBgYGBgYGBgYGBggICAgICAgICAgICAgICgoKCgoKCgoKCgoKCgoKDAwMDAwMDAwMDAwMDAwODg4ODg4ODg4ODg4ODg//////////////////8AAAAATGF2YzYyLjExAAAAAAAAAAAAAAAAJAMwAAAAAAAABgBjh85vAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/84TEAB5JlmQnSEgAQAjHe+XdhQBcF58CgokligoZU3wk5//+kArFbdIBQKGFwQJMXmoQEi4IBhic6UYsgQZc5/3CHnNGjnBG2ogYXIydQEw23UPPYI0YEBA4UdwfeUDBRwf4IAg4HAwJwfUD72deD8QBgSBj6w+XD///lHQfeH+XPqBCCCoggGt/IoOKStSu2///8/BJDuDbTgFc4GkVIymYKsHIsjtBjmEDOTJb0LajXAPzSVY5HB/OQh8r1KH/84TEOTZzlspfj3gBzrlILSiQiK2q862AgKlQ48C3I59Loml37XH6FH6diwWxVvyRn0aJ+w0PnozVYJ73srWVO5fIVpqfNvjHQqomn9om9uUKJRPM2swMQYj6XGq4yoJn8RjjzZxZ+rJHruExd4/vR03WtvV3loUuM7lj43mHW8eHHpeP7//Lc5Qvj3zWDi31m1sfed5z/4ce//3//90/3/+y4hgxYsaM7/2/nK5OXx5ry7neFihRDT2LN1huAlb/84TEEiVh6pwH2GAABiLcl5LSXcsSTuIuSBKeUwGu97ReDxZBnYGp0dik5NkhYOjRmo40MTTYeMlTT6mAnFaSyX4mlvGpmt6WWrrrrpim1u/Ld7G/017b1pXotnMmb5ecr0zOWvGAQVaPM30TaRg4lYKAr3rCZ3Sp7usVFxK4NvSoNLSm9PVHJdVW/ZQWWlq6BTt8aSmCRgAGZYgANphgJaFS0eBmEImSAL3SJQRGDOA5WY4OmSKDUoFitJa004b/84TELywLNnwG0wVsAauXXZFTr2gNylYl+tyWajygBZov+lmHCeK7Yms5iW3n1Y7BUN2ngxgTg2O1xycoQhakDNG66WbHqxq0Mk59M3/xR7E4v9pIndel96OlnZ6mX4+t6UQ6s5np1LV/XmfZnK//r/lZrKzfsm/ttogrInVkkB27epUlDoIocO6mCl6EVQk7AYhKGrRGjZA4WBLhqRZth6MqBwCDIOqIPcQBR46GCQsRLZmEAorNwi7WuraHA7H/84TEMS7rpmgG0wWJdkS7kATLqZ9WKNaZ8y9LZykdnmZyzl0IIa02fCNQVJ5fRSR8LcUXdHn+p7FNHZCurGxeNi7U6MjLEcCt1oDx8rTScnrN5vTWon6Ueq7rvNZtrzWveqsx0NdaGd2Fa0MBIKvZ6qhjFKtOvytTvfT90Nm+ah2dDshWmftpt013HpEy//JTJTawXcb/2gtyR9bCwIAGZChAWFJ1P87LOYFyrq2p0zElp39ZTCXkJkBgKVQoSEn/84TEKB6KMlwOwkbMYCoLAk60LkSJ8UKyLVWMoYBAUAjBAVIKTc2Ajqlt+rUqTMx+pVWqt7N//Ol+ux7MxxmP1L4aiemd+RrASfQqGpK8KgZT/1ukb9GRyssSOniOtFUG0MkmBPzQPNoYSVCPDLIQVxwqJDT+LqYJ2J9WP3keBK1wJ4sKWNn7JxZi0aaTjSj4coo9VPiRE4o9ni42ZZ2/+az5uVJxZcOz1JxZcWzs7O///p2/2ak40UBHoLmpONL/84TEYCOjsdQAeYUczE1OUwUECOzt63Z1RURWf/6mVUOzs6on/+ion//+zlMFDAg4ZM8YLCwjM+EhYWVMQU1FMy4xMDEgKGJldGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=',
    return: 'SUQzBAAAAAAAIlRTU0UAAAAOAAADTGF2ZjYyLjMuMTAwAAAAAAAAAAAAAAD/84TAAAAAAAAAAAAASW5mbwAAAA8AAAAQAAAMwAAeHh4eHh4tLS0tLS08PDw8PDxLS0tLS0taWlpaWlpaaWlpaWlpeHh4eHh4h4eHh4eHlpaWlpaWlqWlpaWlpbS0tLS0tMPDw8PDw9LS0tLS0tLh4eHh4eHw8PDw8PD///////8AAAAATGF2YzYyLjExAAAAAAAAAAAAAAAAJAPAAAAAAAAADMDUVhLxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/84TEACBZokQHT2AAAZpczrUe2BOKCZPk4JwXBwU5BxNyXvi3lzZ8Uy/jwBLJ/007Es/KgAYH1aQSBIMIl4kEyJszMz+xwDcRz/DgwPHGzAwWU1evfYMz/6U7fxevv9FixzqU6ZpTmzA86758MZcPiM+CBz5QEIPhYH35d//1A+/LvKBj5Q5///w/y5+CCmyrPQlswFHhu3Ef4lGZQlpHneV51YFlICF6TzsOIzp3Glpc0KwUX7SMMhaPyBj6NTn/84TEMTQ6uqABmMAAAzpucVh+Zh+0TFcJlymDWXYlDyQI1p2JZj2URR63TjUQh584Mh6JSmE1WXz9ivG7buZrmdx8YqtWGFwvbKKNrEUUoxt9hiclD+RRr7D2lbiLEXCZVNWmuSWifufgmC68Rl/d556wwt18/u0OpFErtuaq2K2VakpqTda/jb3Td7//////////OYgMkARuXDoVGiR6REIEf/eekvzJg+pQK0KABCwXb/EPk9iZL4+mNBqnM2L/84TEExsxqsovzzAAE2d5WaXW4j+WeD2NowLMyrMI2WYQTqS3eFTZdfqu4iGzYf/2yHjP/toTkSdhK+1ev/cW9yeTIBwesLOf0LYy8Imz73iwQdqunwy7cs18uyA1n/3t9Rknt9A1BahHQiEBAUEQAWnYbKwJNQDNe5DCUK3oXt3j6eLA3cf9/YLfiSvg2jHX4isGMXeYaYpq5IiA/jMwNdleMxcztViGNKfSK0fyiPM2SduDVCW16K3QobihLOr/84TEWTCqVpwEw9kwEn86ePEu7emrKw0E6wvFap0CrFATM0SFKQXI9lEjslYyAbCoCUYCCSykrKZmcjWyScBgcurmKKKtMQdfjRyq112YF7/5lkK7PwSREwnwPc9i3GIufIGJMwjrJFiwkJGQCsWSk8/iTuKfSgCZTqaAEKBgwgtCutTRdbXUjmlsplsdYRauQ0ytr1+SS+CX9ut2gqKtlYDMs+bs7CmVIg601+1Xw+78+3GrQctDolEs8Q1C4Rz/84TESTMMEqQGwwVZCZXTW1e2QRLjMDUmCcBUqlowOF4jLyyrJY7tPHQwEmIujgoHslieFZycrCvD5fbLFSMPKcwk2Ep4n3VQXP34GIodeeX3Yqvfvzlzd7vgscUf+vZbum2dRiZmZ7K0hS+8zM1ZWra+zUq90qQjd6np/swOMIudWZ3QqpPYQh1OOZHN4evVBk+U8Q0dghQYSibFep10dDE5pwrVWrY7ZDiwIjji9o7+d9CitbjMWFkVA8Ltct//84TELymUArgGeks5TB5CZxY+xS0XM3iT9VVQkpUoNOOHVfNHFlRkVtGCFtEoZEJHrBKwgIrks2VQ4/1Od4p1YwyMXSvHb0pVcclkt1xIhSlFTPZHdvu73/ct1ow1XecxLpkb33QlzUR+nMaen/MLAKOAAOgOacguhCqzI7DhVS56m/XVIBUkq5CqG8aIVyqBYTASJZNVkoUl9eRhgUX9GiEH0kyJZxCYmDhAGgoDIWBtEbSozNnycbRtR5NNbH7/84TEOyRxwrSmexIwTkncWcbUTFZASSEbTKzJCTCBsEXmB4ZUPgiTkFiEmIJIkuu00pjodcWDp0cVeGA0YiwJMNCxEgbLVbFjrcWcUPsFaWdEEz544Na1JNgR9SWijxCkyxRlGvLAGaHIUhjGXD2wIgmzhYPwtQ2ESZCu8tSp1tZfOS+UxWJJ8mE09NsTRKwOpJTiseQQX2FIX36pacWpUggicIJRKYZICEVHVFl0KJYnNxIJIQ0mxcYd77Sp+KX/84TEXCLR5rgEexJ2Z5dL/rKCYlitKHiobBwePeZ9yL4sgasEGtHpPM4x4xo0v6v0jCoZCIkB0iCy+jsVACgFN9FR8Dx4SQ+J0A9kxevMhzACE1WdX8wvqA0Qes1Fy7YlgJTzDYeHEO+KKjTifSdFkrLN7l2W10m6yJiJ+fHsT6IowY2alWXaL7rxOmekJfd1y+Xhd1/1BgNLOsTp9MFFKtTCy0IAmOQAy7WFCqhQBiDHZjBw09BDkIAIFS/Tezn/84TEgx8BzsVmYkzohlSShHPtwmJW1Y1WWp3LajOdQuopzJnLs7APtogqiNBM2qCaGsumDKsVnWdVfKo7C9szbEaav6Qzzff3bmrdwi440otFFAdFZxjowx3mYgd7xnI9719/sIiVKQxDK6vbVXp9m/KvsvdGaR8v7uRmfRqmpu3p+p1okODgRBICnQwPj/pVTEFNRTMuMTAxIChiZXRhgAF3Y0pD+P4nze9XMM6TDRTArFSeBOiTHAW9mne+rDP/84TEuiKTvsFmekTcPY0ZJnCvzPXa8g44DAYQk+CQImiJQHylUqrD20mZ33zYGmY1HeYRSVB6PxYUEv0GJ0KTqWk3K9itSZ2fbbflqhqOYKCOyd/2T2+j9937KyeV1lfKpQiCAI2knr971EREBXCAetxRKgC5cqqZN8cQKf7VmioMqVJFoHQMwlGZ0Eulyq/R8Ti+LN9GXGbtatPu/rIVmKCpWwe1muLGs1KIVgZCkwPYRYTC8NwbEISRyzGz2zr/84TE0yGbOrhGeYUwcRx3dgTUWmQlDgIRVG66hNXqxKZIZ04Ofj66NkFMdHcrYkUssTKs9bEXmhhIhgipMlKC6pnZrb5+EJu+IfKcWVmWwIwSptZsWKFjXY0cQJSTEi5AREnqeh48tPHaA6osVLMQLjhEfAzO56YAqfUSdOyxQRM5cMyCAopJ3vEsMupr6wq4XGgSAHKjz9SJbKms/L2VROKsxaykMWiZGzwv+RBwgd3Ych643GBGBFUDxysHWMn/84TE/y2ySpgGyxMw8Q9Kn6rYS4sgkuliNwm3GsSSsbtIvLJ2DV1AJoTEIKgsGYTC6TJk5ZYQzKOFhdFLV9Xdv51xlIgooUjkRyDhWVinspSlYNxW2Xt9aGXNS/zUVl3327rVkv9aP83//9UOoZp0CwlQn21MQU1FMy4xMDEgKGJldGEgM4AIAEnbbaHJMKIAoEQpqnAi4Vi0mfLwNh1Kyo6XLiqYkmM5MVhOKoNSbpKIIUtHNF11K0korkkmutT/84TE+yvr1ogGwwVQN+zSKLHEiM+YeNNS51momqsGCgZMixqIkGHSx1OVNVAVTwrVVAV7wMBH363GJukoCjHxurQsAjUvbXzvl7dExjpbdjUBEqR0MVBRTSFDM3Biym9S6m/xop/uyf5NgKZQ34N4M+FNUhZgI4nJIjvUCnPY+TdJEQEoC3mQbZLTeViqe2SsR1nLnpKTuXg1kvHaAWj0nBKDw0CWYG56umbnxVOEZ61C6Skz/Q0XQuroH0ROJKT/84TE7Sgq+nl2YYdpV0hfWpl6I+OVBOOl6x9SfMggoMQzBRApYCcTGqwz2BjClgUGIFLrD5qQYOJArSaqGddf9Z7UoatYh9JqRtUNYZQmqGrVIas5HwmozUmW+wMQKVM6TUoc5Sal9g4WGWdLhrG21nDAakxBTUUzLjEwMSAoYmV0YSAzKaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/84TE/yyUOhAEewbcqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxBTUUzLjEwMSAoYmV0YSAzKaqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/84TETAAAA0gAAAAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo='
  };

  var KEY_SAMPLES = ['key', 'key2', 'key3', 'key4', 'key5'];
  var GAIN_BY_KIND = {
    key: 0.60,
    space: 0.62,
    backspace: 0.54,
    'return': 0.58
  };

  var PREF_KEY = 'escrevaral.typewriter.sound.v1';
  var audioCtx = null;
  var decodedBuffers = {};
  var decodingStarted = false;
  var decodeFailed = false;
  var activeVoice = null;
  var lastKeySample = '';
  var lastKeyStrikeAt = 0;
  var lastKeyStrikeKind = '';
  var lastCompLen = 0;
  var isEnabled = false;
  var listeners = [];
  var strikeListeners = [];

  function nowMs() {
    return (typeof Date !== 'undefined' && Date.now) ? Date.now() : (+new Date());
  }

  function getAudioContext() {
    if (!audioCtx) {
      var Ctx = root.AudioContext || root.webkitAudioContext;
      if (Ctx) {
        try { audioCtx = new Ctx({ latencyHint: 'interactive' }); }
        catch (e) { try { audioCtx = new Ctx(); } catch (ignore) {} }
      }
    }
    return audioCtx;
  }

  function base64ToArrayBuffer(b64) {
    var binary = root.atob ? root.atob(b64) : '';
    var bytes = new Uint8Array(binary.length);
    var i;
    for (i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function loadBuffers() {
    if (decodingStarted || decodeFailed) { return; }
    var ctx = getAudioContext();
    if (!ctx || !ctx.decodeAudioData) { decodeFailed = true; return; }
    decodingStarted = true;
    var keys = Object.keys(SOUNDS_B64);
    var failures = 0;
    keys.forEach(function (name) {
      try {
        var ab = base64ToArrayBuffer(SOUNDS_B64[name]);
        var onFail = function () {
          failures += 1;
          if (failures >= keys.length) { decodeFailed = true; }
        };
        var res = ctx.decodeAudioData(ab, function (buf) {
          decodedBuffers[name] = buf;
        }, onFail);
        if (res && typeof res.catch === 'function') {
          res.catch(onFail);
        }
      } catch (e) {
        failures += 1;
        if (failures >= keys.length) { decodeFailed = true; }
      }
    });
  }

  function unlock() {
    if (!isEnabled) { return; }
    var ctx = getAudioContext();
    if (!ctx) { return; }
    if (ctx.state === 'suspended' && ctx.resume) {
      try {
        var p = ctx.resume();
        if (p && typeof p.catch === 'function') { p.catch(function () {}); }
      } catch (ignore) {}
    }
    if (!decodingStarted) { loadBuffers(); }
  }

  function stopVoice(now) {
    if (!activeVoice) { return; }
    try {
      var v = activeVoice;
      v.gain.gain.cancelScheduledValues(now);
      v.gain.gain.setValueAtTime(v.gain.gain.value || 0.01, now);
      v.gain.gain.linearRampToValueAtTime(0.0001, now + 0.0055);
      v.source.stop(now + 0.006);
    } catch (ignore) {}
    activeVoice = null;
  }

  function playFallbackClick(ctx, kind, now) {
    try {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = kind === 'return' ? 280 : kind === 'backspace' ? 170 : kind === 'space' ? 210 : (340 + Math.random() * 60);
      gain.gain.setValueAtTime(0.014, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.025);
      var voice = { source: osc, gain: gain };
      activeVoice = voice;
      osc.onended = function () {
        if (activeVoice === voice) { activeVoice = null; }
        try { osc.disconnect(); gain.disconnect(); } catch (ignore) {}
      };
    } catch (ignore) {}
  }

  function pickKeySample(previous) {
    var pool = [];
    var i, name;
    for (i = 0; i < KEY_SAMPLES.length; i += 1) {
      name = KEY_SAMPLES[i];
      if (decodedBuffers[name] && name !== previous) {
        pool.push(name);
      }
    }
    if (!pool.length) {
      for (i = 0; i < KEY_SAMPLES.length; i += 1) {
        name = KEY_SAMPLES[i];
        if (decodedBuffers[name]) { pool.push(name); }
      }
    }
    if (!pool.length) { return 'key'; }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function play(kind) {
    if (!isEnabled) { return; }
    var ctx = getAudioContext();
    if (!ctx) { return; }
    if (ctx.state === 'suspended' && ctx.resume) {
      try {
        var r = ctx.resume();
        if (r && typeof r.catch === 'function') { r.catch(function () {}); }
      } catch (ignore) {}
    }
    var now = ctx.currentTime;
    stopVoice(now);

    var sampleName = kind;
    if (kind === 'key') {
      sampleName = pickKeySample(lastKeySample);
      lastKeySample = sampleName;
    }

    var buffer = decodedBuffers[sampleName] || decodedBuffers.key;
    if (!buffer) {
      loadBuffers();
      playFallbackClick(ctx, kind, now);
      return;
    }

    try {
      var source = ctx.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = 0.985 + (Math.random() * 0.03);

      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = kind === 'space' ? 2800 : 3400;
      filter.Q.value = 0.707;

      var baseGain = GAIN_BY_KIND[kind] || 0.58;
      var humanGain = baseGain * (0.94 + Math.random() * 0.12);
      var gain = ctx.createGain();
      gain.gain.setValueAtTime(humanGain, now);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(now);

      var voice = { source: source, gain: gain };
      activeVoice = voice;
      source.onended = function () {
        if (activeVoice === voice) { activeVoice = null; }
        try { source.disconnect(); filter.disconnect(); gain.disconnect(); } catch (ignore) {}
      };
    } catch (ignore) {
      playFallbackClick(ctx, kind, now);
    }
  }

  function notifyStrike(kind, ev) {
    var i;
    for (i = 0; i < strikeListeners.length; i += 1) {
      try { strikeListeners[i](kind, ev); } catch (ignore) {}
    }
  }

  function classifyKey(ev) {
    if (!ev || ev.ctrlKey || ev.metaKey || ev.altKey) { return null; }
    if (ev.isComposing && ev.key !== 'Dead') { return null; }
    var key = ev.key || '', code = ev.keyCode;
    if (key === 'Unidentified' || key === 'Process' || code === 229) { return null; }
    if (key === 'Enter' || code === 13) { return 'return'; }
    if (key === ' ' || code === 32) { return 'space'; }
    if (key === 'Backspace' || key === 'Delete' || code === 8 || code === 46) { return 'backspace'; }
    if (key === 'Dead' || key.length === 1 || (!key && code >= 32 && code <= 222)) { return 'key'; }
    return null;
  }

  function classifyInput(ev) {
    if (!ev) { return null; }
    var type = ev.inputType || '';
    var data = typeof ev.data === 'string' ? ev.data : '';

    if (type !== 'insertCompositionText') {
      lastCompLen = 0;
    }

    if (type) {
      if (type.indexOf('Paste') >= 0 || type.indexOf('Drop') >= 0 || type.indexOf('history') === 0 || type === 'insertReplacementText') {
        return null;
      }
      if (type === 'insertLineBreak' || type === 'insertParagraph') {
        return 'return';
      }
      if (type.indexOf('delete') === 0) {
        return 'backspace';
      }
      if (type === 'insertCompositionText') {
        var len = data.length;
        var prev = lastCompLen;
        lastCompLen = len;
        if (len === 0) { return prev > 0 ? 'backspace' : null; }
        if (len < prev) { return 'backspace'; }
        if (len > prev) {
          var tail = data.charAt(len - 1);
          return tail === ' ' ? 'space' : 'key';
        }
        return null;
      }
      if (type === 'insertText') {
        if (!data) { return null; }
        if (data === ' ' || data.charAt(data.length - 1) === ' ') { return 'space'; }
        return 'key';
      }
      return null;
    }

    if (data.length === 1) {
      return data === ' ' ? 'space' : 'key';
    }
    return null;
  }

  function resetComposition() {
    lastCompLen = 0;
  }

  function setEnabled(val, storage, silent) {
    isEnabled = !!val;
    if (storage) {
      try { storage.setItem(PREF_KEY, isEnabled ? 'true' : 'false'); } catch (ignore) {}
    }
    var i;
    for (i = 0; i < listeners.length; i += 1) {
      try { listeners[i](isEnabled); } catch (ignore) {}
    }
    if (isEnabled && !silent) {
      loadBuffers();
      play('key');
    } else if (!isEnabled && audioCtx) {
      stopVoice(audioCtx.currentTime || 0);
    }
  }

  function syncPreference(storage) {
    if (!storage) { return; }
    try {
      var stored = storage.getItem(PREF_KEY);
      if (stored !== null) { isEnabled = stored === 'true'; }
    } catch (ignore) {}
  }

  root.Escr.machineSound = {
    PREF_KEY: PREF_KEY,
    KEY_SAMPLES: KEY_SAMPLES,
    play: play,
    unlock: unlock,
    loadBuffers: loadBuffers,
    pickKeySample: pickKeySample,
    classifyKey: classifyKey,
    classifyInput: classifyInput,
    resetComposition: resetComposition,
    handleKey: function (ev) {
      if (isEnabled) { unlock(); }
      var kind = classifyKey(ev);
      if (!kind) {
        if (ev && (ev.key === 'Unidentified' || ev.key === 'Process' || ev.keyCode === 229)) {
          lastKeyStrikeAt = 0;
          lastKeyStrikeKind = '';
        }
        return null;
      }
      lastKeyStrikeAt = nowMs();
      lastKeyStrikeKind = kind;
      notifyStrike(kind, ev);
      if (isEnabled) { play(kind); }
      return kind;
    },
    handleInput: function (ev) {
      if (isEnabled) { unlock(); }
      var kind = classifyInput(ev);
      if (!kind) { return null; }
      var elapsed = nowMs() - lastKeyStrikeAt;
      if (elapsed >= 0 && elapsed < 80 && (lastKeyStrikeKind === kind || (lastKeyStrikeKind === 'key' && kind === 'space'))) {
        lastKeyStrikeAt = 0;
        lastKeyStrikeKind = '';
        return null;
      }
      notifyStrike(kind, ev);
      if (isEnabled) { play(kind); }
      return kind;
    },
    setEnabled: setEnabled,
    isEnabled: function () { return isEnabled; },
    syncPreference: syncPreference,
    getActiveVoice: function () { return activeVoice; },
    onStrike: function (fn) {
      strikeListeners.push(fn);
      return function () {
        var idx = strikeListeners.indexOf(fn);
        if (idx >= 0) { strikeListeners.splice(idx, 1); }
      };
    },
    subscribe: function (fn) {
      listeners.push(fn);
      return function () {
        var idx = listeners.indexOf(fn);
        if (idx >= 0) { listeners.splice(idx, 1); }
      };
    }
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/maquina-visual.js */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var RATIO = 296 / 1222;
  var PLATEN = 0.60;
  var ROLLER_TOP = 70 / 296;
  var MIN_VISIBLE = 0.62;
  var MAX_SHARE = 0.38;
  var STRIKE = { lift: 1.7, ms: 92 };
  var CARRIAGE = { lift: 2.4, sweep: -12, ms: 215 };
  var IDLE_TIMEOUT_MS = 135;
  var PREF_KEY = 'escrevaral.typewriter.machine.v1';
  var FRAME_FILES = [
    'typewriter-machine-idle',
    'typewriter-machine-strike-1',
    'typewriter-machine-strike-2',
    'typewriter-machine-strike-3',
    'typewriter-machine-strike-4',
    'typewriter-machine-strike-5',
    'typewriter-machine-strike-6',
    'typewriter-machine-strike-7',
    'typewriter-machine-strike-8',
    'typewriter-machine-strike-9'
  ];
  var WEBP_PROBE = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=' ;
  var webpSupport = null;

  function makeFallbackSvg(idx) {
    var spark = idx > 0
      ? '<line x1="' + (480 + idx * 26) + '" y1="242" x2="611" y2="96" stroke="#9ea7a3" stroke-width="4" stroke-linecap="round"/><rect x="606" y="88" width="10" height="14" rx="1.5" fill="#4b534f"/>'
      : '';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1222 242">' +
      '<rect x="64" y="61" width="1094" height="58" rx="18" fill="#242d23"/>' +
      '<rect x="18" y="68" width="54" height="44" rx="8" fill="#182018"/>' +
      '<rect x="1150" y="68" width="54" height="44" rx="8" fill="#182018"/>' +
      '<rect x="206" y="54" width="810" height="10" rx="3" fill="#4f5c4e"/>' +
      '<rect x="0" y="114" width="1222" height="128" fill="#2c352b"/>' +
      '<rect x="214" y="102" width="794" height="16" rx="4" fill="#182018"/>' +
      '<polygon points="592,102 630,102 618,64 604,64" fill="#141914"/>' +
      spark + '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function isPortableDoc() {
    try {
      if (typeof document !== 'undefined' && document.querySelector) {
        var meta = document.querySelector('meta[name="distribution-mode"]');
        if (meta && meta.getAttribute('content') === 'portable') { return true; }
      }
      if (typeof location !== 'undefined' && location.protocol === 'file:') { return true; }
    } catch (ignore) {}
    return false;
  }

  function frameUrl(idx, ext, baseUrl) {
    var base = baseUrl || 'assets/typewriter/';
    var file = FRAME_FILES[idx] || FRAME_FILES[0];
    return base + file + '.' + (ext || 'webp');
  }

  function detectWebp(done) {
    if (webpSupport !== null) { done(webpSupport); return; }
    if (typeof Image === 'undefined') { webpSupport = true; done(true); return; }
    var probe = new Image();
    probe.onload = function () {
      webpSupport = !!(probe.width > 0 && probe.height > 0);
      done(webpSupport);
    };
    probe.onerror = function () {
      webpSupport = false;
      done(false);
    };
    probe.src = WEBP_PROBE;
  }

  function pickNextStrike(lastIdx) {
    var count = FRAME_FILES.length - 1;
    var pool = [];
    var i;
    for (i = 1; i <= count; i += 1) {
      if (i !== lastIdx) { pool.push(i); }
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function createStrikeBag(count) {
    var total = count || (FRAME_FILES.length - 1);
    var bag = [];
    var last = 0;

    function refill() {
      var i, j, tmp;
      bag = [];
      for (i = 1; i <= total; i += 1) { bag.push(i); }
      for (i = bag.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        tmp = bag[i];
        bag[i] = bag[j];
        bag[j] = tmp;
      }
      if (bag.length > 1 && bag[bag.length - 1] === last) {
        tmp = bag[0];
        bag[0] = bag[bag.length - 1];
        bag[bag.length - 1] = tmp;
      }
    }

    return function next() {
      if (!bag.length) { refill(); }
      last = bag.pop();
      return last;
    };
  }

  function computeGeometry(columnWidth, columnLeft, vw, vh, line) {
    if (!columnWidth || !vh) { return null; }
    var width = Math.min(columnWidth / PLATEN, vw);
    var height = width * RATIO;
    var baseSink = height * (6 / 242);
    var shown = Math.min(height, Math.max(vh * MAX_SHARE, height * MIN_VISIBLE));
    var center = columnLeft + columnWidth / 2;
    var left = center - width / 2;
    var bottom = shown - height - baseSink;
    var rollerTop = vh - shown + baseSink + height * ROLLER_TOP;
    var anchorY = rollerTop - line * 2.9;
    return {
      width: width,
      height: height,
      left: left,
      bottom: bottom,
      rollerTop: rollerTop,
      anchorY: anchorY,
      topInset: Math.max(0, anchorY - line / 2)
    };
  }

  root.Escr.machineCore = {
    RATIO: RATIO,
    PLATEN: PLATEN,
    ROLLER_TOP: ROLLER_TOP,
    IDLE_TIMEOUT_MS: IDLE_TIMEOUT_MS,
    STRIKE: STRIKE,
    CARRIAGE: CARRIAGE,
    FRAME_FILES: FRAME_FILES,
    frameUrl: frameUrl,
    makeFallbackSvg: makeFallbackSvg,
    pickNextStrike: pickNextStrike,
    createStrikeBag: createStrikeBag,
    computeGeometry: computeGeometry
  };

  root.Escr.mountVisualMachine = function (opts) {
    var storage = opts.storage;
    var columnEl = opts.columnEl;
    var baseUrl = opts.baseUrl || 'assets/typewriter/';
    var wrap = null;
    var frames = [];
    var framesLoaded = false;
    var isEnabled = true;
    var activeFocus = false;
    var visible = false;
    var anchorY = null;
    var activeIndex = 0;
    var nextStrike = createStrikeBag(FRAME_FILES.length - 1);
    var idleTimer = null;
    var bounceTimer = null;
    var reflowTimer = null;
    var animObj = null;

    try {
      if (storage) {
        var raw = storage.getItem(PREF_KEY);
        if (raw !== null) { isEnabled = raw === 'true'; }
      }
    } catch (ignore) {}

    function assignFrameSources(ext) {
      var i, portable = isPortableDoc();
      for (i = 0; i < frames.length; i += 1) {
        (function (img, idx) {
          var fallbackSrc = makeFallbackSvg(idx);
          if (portable) {
            img.src = fallbackSrc;
            return;
          }
          var triedPng = ext === 'png';
          img.onerror = function () {
            if (!triedPng) {
              triedPng = true;
              img.src = frameUrl(idx, 'png', baseUrl);
            } else {
              img.onerror = null;
              img.src = fallbackSrc;
            }
          };
          img.src = frameUrl(idx, ext, baseUrl);
        }(frames[i], i));
      }
    }

    function buildWrap() {
      if (wrap) { return wrap; }
      wrap = document.createElement('div');
      wrap.id = 'esc-typewriter-visual';
      wrap.className = 'esc-machine';
      wrap.setAttribute('aria-hidden', 'true');
      var i;
      for (i = 0; i < FRAME_FILES.length; i += 1) {
        var img = document.createElement('img');
        img.className = 'esc-machine-frame' + (i === 0 ? ' esc-machine-active' : '');
        img.alt = '';
        img.draggable = false;
        wrap.appendChild(img);
        frames.push(img);
      }
      document.body.appendChild(wrap);
      if (!framesLoaded) {
        framesLoaded = true;
        detectWebp(function (ok) {
          assignFrameSources(ok ? 'webp' : 'png');
        });
      }
      return wrap;
    }

    function setActiveFrame(idx) {
      if (!frames.length || idx === activeIndex) { return; }
      if (frames[activeIndex]) { frames[activeIndex].classList.remove('esc-machine-active'); }
      if (frames[idx]) { frames[idx].classList.add('esc-machine-active'); }
      activeIndex = idx;
    }

    function reducedMotion() {
      try {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      } catch (e) {
        return false;
      }
    }

    function layout() {
      var show = isEnabled && activeFocus && columnEl && document.body;
      if (!show) {
        visible = false;
        anchorY = null;
        if (document.body) {
          document.body.removeAttribute('data-esc-machine');
          if (document.body.style && document.body.style.removeProperty) {
            document.body.style.removeProperty('--esc-machine-top');
          }
        }
        return null;
      }
      buildWrap();
      var rect = columnEl.getBoundingClientRect ? columnEl.getBoundingClientRect() : { width: 700, left: 100 };
      var vh = window.innerHeight || 720;
      var vw = window.innerWidth || 1280;
      var style = window.getComputedStyle ? window.getComputedStyle(columnEl) : null;
      var fontSize = style ? (parseFloat(style.fontSize) || 21) : 21;
      var line = style ? (parseFloat(style.lineHeight) || fontSize * 1.7) : fontSize * 1.7;
      var geom = computeGeometry(rect.width || 700, rect.left || 0, vw, vh, line);
      if (!geom) { return null; }

      wrap.style.width = geom.width.toFixed(2) + 'px';
      wrap.style.height = geom.height.toFixed(2) + 'px';
      wrap.style.left = geom.left.toFixed(2) + 'px';
      wrap.style.bottom = geom.bottom.toFixed(2) + 'px';

      anchorY = geom.anchorY;
      visible = true;
      document.body.setAttribute('data-esc-machine', 'on');
      if (document.body.style && document.body.style.setProperty) {
        var colTop = typeof rect.top === 'number' && isFinite(rect.top) ? rect.top : 0;
        var topInset = Math.max(0, geom.anchorY - colTop - line / 2);
        document.body.style.setProperty('--esc-machine-top', topInset.toFixed(1) + 'px');
      }
      return anchorY;
    }

    function strike(kind) {
      if (!visible || !wrap) { return; }
      if (kind === 'return') {
        window.clearTimeout(idleTimer);
        idleTimer = null;
        setActiveFrame(0);
      } else {
        setActiveFrame(nextStrike());
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(function () {
          setActiveFrame(0);
        }, IDLE_TIMEOUT_MS);
      }

      if (reducedMotion()) { return; }
      var spec = kind === 'return' ? CARRIAGE : STRIKE;
      if (typeof wrap.animate === 'function') {
        try { if (animObj) { animObj.cancel(); } } catch (ignore) {}
        try {
          var framesAnim = kind === 'return'
            ? [
                { transform: 'translate3d(0,0,0)', easing: 'cubic-bezier(0.22, 0.85, 0.3, 1)' },
                { transform: 'translate3d(' + spec.sweep + 'px,' + spec.lift + 'px,0)', offset: 0.34, easing: 'cubic-bezier(0.32, 0, 0.22, 1)' },
                { transform: 'translate3d(1.4px,0,0)', offset: 0.78, easing: 'ease-out' },
                { transform: 'translate3d(0,0,0)' }
              ]
            : kind === 'backspace'
              ? [
                  { transform: 'translate3d(0,0,0)', easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' },
                  { transform: 'translate3d(2.5px,0.8px,0)', offset: 0.4, easing: 'ease-out' },
                  { transform: 'translate3d(0,0,0)' }
                ]
              : [
                  { transform: 'translate3d(0,0,0)', easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)' },
                  { transform: 'translate3d(0,' + spec.lift + 'px,0)', offset: 0.32, easing: 'cubic-bezier(0.35, 0, 0.25, 1)' },
                  { transform: 'translate3d(0,0,0)' }
                ];
          animObj = wrap.animate(framesAnim, { duration: spec.ms });
          return;
        } catch (ignore) {}
      }
      window.clearTimeout(bounceTimer);
      wrap.style.webkitTransform = 'translate3d(0,' + spec.lift + 'px,0)';
      wrap.style.transform = 'translate3d(0,' + spec.lift + 'px,0)';
      bounceTimer = window.setTimeout(function () {
        if (wrap) {
          wrap.style.webkitTransform = 'translate3d(0,0,0)';
          wrap.style.transform = 'translate3d(0,0,0)';
        }
      }, Math.round(spec.ms * 0.6));
    }

    if (root.Escr.machineSound && root.Escr.machineSound.onStrike) {
      root.Escr.machineSound.onStrike(strike);
    }
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('resize', layout, false);
    }

    return {
      setFocusActive: function (on) {
        activeFocus = !!on;
        if (reflowTimer) { clearTimeout(reflowTimer); reflowTimer = null; }
        var res = layout();
        if (activeFocus && typeof setTimeout === "function") { reflowTimer = setTimeout(function () { reflowTimer = null; layout(); }, 40); }
        return res;
      },
      setEnabled: function (on) {
        isEnabled = !!on;
        try {
          if (storage) { storage.setItem(PREF_KEY, isEnabled ? 'true' : 'false'); }
        } catch (ignore) {}
        return layout();
      },
      isEnabled: function () { return isEnabled; },
      anchorY: function () { return anchorY; },
      layout: layout,
      strike: strike,
      activeFrame: function () { return activeIndex; }
    };
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/superfoco.js */
/* Superfoco automático (2 palavras + 30 s), barra dedicada e fluxo ancorado no rolo — ES5 */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var AUTO_KEY = 'escrevaral.writing.automatic.v1';
  var IDLE_MS = 30000;
  var WORD_RE = /[A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F]/;
  var JOIN_RE = /['\u2019\-]/;

  function on(el, ev, fn, capture) {
    if (el && el.addEventListener) { el.addEventListener(ev, fn, !!capture); }
  }
  function off(el, ev, fn, capture) {
    if (el && el.removeEventListener) { el.removeEventListener(ev, fn, !!capture); }
  }

  function svgEl(paths) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS ? document.createElementNS(ns, 'svg') : document.createElement('svg');
    svg.setAttribute('viewBox', '0 0 256 256');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '18');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    var i;
    for (i = 0; i < paths.length; i += 1) {
      var p = document.createElementNS ? document.createElementNS(ns, 'path') : document.createElement('path');
      p.setAttribute('d', paths[i]);
      svg.appendChild(p);
    }
    return svg;
  }

  var ICON_SOUND_ON = [
    'M80 168H32a8 8 0 0 1-8-8V96a8 8 0 0 1 8-8h48l72-56v192Z',
    'M192 106.8a32 32 0 0 1 0 42.4',
    'M218.6 80a72 72 0 0 1 0 96'
  ];
  var ICON_SOUND_OFF = [
    'M80 168H32a8 8 0 0 1-8-8V96a8 8 0 0 1 8-8h48l72-56v192Z',
    'M240 104l-48 48',
    'M192 104l48 48'
  ];
  var ICON_MACHINE = [
    'M48 112V64a8 8 0 0 1 8-8h144a8 8 0 0 1 8 8v48',
    'M24 112h208a8 8 0 0 1 8 8v72a8 8 0 0 1-8 8H24a8 8 0 0 1-8-8v-72a8 8 0 0 1 8-8Z',
    'M64 148h16',
    'M108 148h16',
    'M152 148h16',
    'M80 176h96'
  ];
  var ICON_FULLSCREEN = [
    'M48 96V48h48',
    'M208 96V48h-48',
    'M48 160v48h48',
    'M208 160v48h-48'
  ];

  function createAutomaticPreference(storage) {
    var enabled = true;
    var listeners = [];
    try {
      if (storage) {
        var raw = storage.getItem(AUTO_KEY);
        if (raw === 'false' || raw === '0' || raw === 'off') { enabled = false; }
        else if (raw === 'true' || raw === '1' || raw === 'on') { enabled = true; }
      }
    } catch (ignore) {}

    return {
      get: function () { return enabled; },
      set: function (value) {
        enabled = !!value;
        var saved = true;
        try {
          if (storage) { storage.setItem(AUTO_KEY, enabled ? 'true' : 'false'); }
        } catch (ignore) { saved = false; }
        var i;
        for (i = 0; i < listeners.length; i += 1) {
          try { listeners[i](enabled); } catch (ignore) {}
        }
        return saved;
      },
      subscribe: function (fn) {
        if (typeof fn === 'function') { listeners.push(fn); }
        return function () {
          var idx = listeners.indexOf(fn);
          if (idx >= 0) { listeners.splice(idx, 1); }
        };
      }
    };
  }

  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
  }

  function toggleFullscreen() {
    try {
      if (isFullscreen()) {
        if (document.exitFullscreen) { document.exitFullscreen(); }
        else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
        else if (document.mozCancelFullScreen) { document.mozCancelFullScreen(); }
      } else {
        var el = document.documentElement;
        if (el.requestFullscreen) { el.requestFullscreen(); }
        else if (el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); }
        else if (el.mozRequestFullScreen) { el.mozRequestFullScreen(); }
      }
    } catch (ignore) {}
  }

  root.Escr.superfocoCore = {
    AUTO_KEY: AUTO_KEY,
    IDLE_MS: IDLE_MS,
    createAutomaticPreference: createAutomaticPreference,
    toggleFullscreen: toggleFullscreen,
    isFullscreen: isFullscreen
  };

  root.Escr.mountSuperfoco = function (opts) {
    opts = opts || {};
    var storage = opts.storage || null;
    var manuscriptEl = opts.manuscriptEl || null;
    var richEl = opts.richEl || null;
    var clock = opts.clock || (typeof window !== 'undefined' ? window : { setTimeout: setTimeout, clearTimeout: clearTimeout });
    var getActive = opts.isActive || function () { return false; };
    var onOpen = opts.onOpen || function () {};
    var onClose = opts.onClose || function () {};
    var onToggleFace = opts.onToggleFace || function () {};
    var getFace = opts.getFace || function () { return 'maquina'; };
    var onToggleMachine = opts.onToggleMachine || function () {};
    var getMachineEnabled = opts.getMachineEnabled || function () { return true; };
    var getMachineAnchor = opts.getMachineAnchor || function () { return null; };
    var isSonnetActive = opts.isSonnetActive || function () { return false; };
    var isEditable = opts.isEditable || function () { return true; };

    var pref = createAutomaticPreference(storage);
    var idleTimer = null;
    var words = 0;
    var inWord = false;
    var suppressed = false;
    var composing = false;
    var openedAutomatically = false;
    var disposed = false;

    var barEl = null;
    var backBtn = null;
    var faceBtn = null;
    var soundBtn = null;
    var machineBtn = null;
    var idleNote = null;
    var fullBtn = null;
    var switchBtn = opts.switchBtn || (typeof document !== 'undefined' ? document.getElementById('esc-superfocus-auto-toggle') : null);

    function isConsultaOpen() {
      try {
        return !!(document.body && document.body.getAttribute('data-esc-consulta-open') === 'true');
      } catch (e) { return false; }
    }

    function clearIdle() {
      if (idleTimer !== null) {
        clock.clearTimeout(idleTimer);
        idleTimer = null;
      }
    }

    function resetCounter() {
      words = 0;
      inWord = false;
      suppressed = false;
    }

    function armIdle() {
      clearIdle();
      if (disposed || !getActive() || !openedAutomatically || !pref.get()) { return; }
      if (isConsultaOpen()) { return; }
      idleTimer = clock.setTimeout(function () {
        idleTimer = null;
        if (disposed || !getActive() || !openedAutomatically) { return; }
        if (composing || isConsultaOpen()) {
          armIdle();
          return;
        }
        openedAutomatically = false;
        resetCounter();
        onClose('idle');
      }, IDLE_MS);
    }

    function isTargetInEditor(target) {
      if (!target) { return false; }
      if (manuscriptEl && !manuscriptEl.hidden && target === manuscriptEl) {
        return !manuscriptEl.readOnly && !manuscriptEl.disabled;
      }
      if (richEl && !richEl.hidden && (target === richEl || (richEl.contains && richEl.contains(target)))) {
        return richEl.getAttribute('contenteditable') === 'true';
      }
      return false;
    }

    function feedText(data, target) {
      if (disposed || !data || !isEditable() || !isTargetInEditor(target)) { return; }
      if (!pref.get() || isConsultaOpen()) { return; }
      if (getActive()) {
        armIdle();
        return;
      }
      if (suppressed) { return; }
      var i, ch;
      for (i = 0; i < data.length; i += 1) {
        ch = data.charAt(i);
        if (WORD_RE.test(ch)) {
          if (!inWord) { words += 1; }
          inWord = true;
        } else if (!JOIN_RE.test(ch)) {
          inWord = false;
        }
        if (words >= 2) {
          suppressed = true;
          openedAutomatically = true;
          onOpen({ automatic: true });
          armIdle();
          syncBar();
          break;
        }
      }
    }

    function updateRichParagraphFocus() {
      if (!richEl || richEl.hidden || !getActive()) { return; }
      var children = richEl.children || [];
      var activeBlock = null;
      var caretRect = null;
      var collapsed = false;
      try {
        if (window.getSelection) {
          var sel = window.getSelection();
          if (sel && sel.rangeCount) {
            collapsed = !!sel.isCollapsed;
            var range = sel.getRangeAt(0);
            var node = range.startContainer;
            while (node && node !== richEl) {
              if (node.parentNode === richEl && node.nodeType === 1) {
                activeBlock = node;
                break;
              }
              node = node.parentNode;
            }
            if (collapsed && range.getBoundingClientRect) {
              var r = range.getBoundingClientRect();
              if (r && r.height > 0) { caretRect = r; }
            }
          }
        }
      } catch (ignore) {}
      var i;
      for (i = 0; i < children.length; i += 1) {
        if (children[i] === activeBlock) {
          children[i].setAttribute('data-esc-active-para', 'true');
        } else {
          children[i].removeAttribute('data-esc-active-para');
        }
      }
      if (collapsed && activeBlock && activeBlock.getBoundingClientRect) {
        var anchor = getMachineAnchor();
        if (typeof anchor === 'number' && anchor > 60) {
          var rect = caretRect || activeBlock.getBoundingClientRect();
          var diff = (rect.top + rect.height / 2) - anchor;
          if (Math.abs(diff) > 6 && richEl.scrollTop !== undefined) {
            richEl.scrollTop = Math.max(0, Math.round(richEl.scrollTop + diff));
          }
        }
      }
    }

    function syncFlow() {
      if (!getActive()) {
        if (richEl && richEl.children) {
          var i;
          for (i = 0; i < richEl.children.length; i += 1) {
            richEl.children[i].removeAttribute('data-esc-active-para');
          }
        }
        return;
      }
      if (richEl && !richEl.hidden) { updateRichParagraphFocus(); }
    }

    function syncSwitch() {
      if (!switchBtn) { return; }
      var onVal = pref.get();
      switchBtn.setAttribute('aria-checked', onVal ? 'true' : 'false');
      switchBtn.setAttribute('data-auto', onVal ? 'on' : 'off');
      var lbl = switchBtn.querySelector ? switchBtn.querySelector('.esc-switch-state') : null;
      if (lbl) { lbl.textContent = onVal ? 'ON' : 'OFF'; }
    }

    function buildBar() {
      if (barEl || typeof document === 'undefined' || !document.body) { return; }
      barEl = document.createElement('header');
      barEl.id = 'esc-writing-bar';
      barEl.className = 'esc-writing-bar';
      barEl.setAttribute('aria-label', 'Controles do Superfoco');
      barEl.hidden = true;

      var left = document.createElement('div');
      left.className = 'esc-writing-bar-group';

      backBtn = document.createElement('button');
      backBtn.id = 'esc-writing-back';
      backBtn.type = 'button';
      backBtn.className = 'esc-writing-btn esc-writing-back';
      backBtn.textContent = '\u2190 Voltar ao aplicativo \u00B7 Esc';
      on(backBtn, 'click', function () {
        openedAutomatically = false;
        clearIdle();
        resetCounter();
        onClose('manual');
      });
      left.appendChild(backBtn);

      faceBtn = document.createElement('button');
      faceBtn.id = 'esc-writing-face';
      faceBtn.type = 'button';
      faceBtn.className = 'esc-writing-btn';
      on(faceBtn, 'click', function () {
        onToggleFace();
        syncBar();
      });
      left.appendChild(faceBtn);

      var right = document.createElement('div');
      right.className = 'esc-writing-bar-group';

      idleNote = document.createElement('span');
      idleNote.className = 'esc-writing-idle-note';
      idleNote.textContent = 'Volta ap\u00F3s 30 s sem atividade';
      right.appendChild(idleNote);

      soundBtn = document.createElement('button');
      soundBtn.id = 'esc-writing-sound';
      soundBtn.type = 'button';
      soundBtn.className = 'esc-writing-icon-btn';
      soundBtn.title = 'Som da m\u00E1quina de escrever';
      soundBtn.setAttribute('aria-label', 'Som da m\u00E1quina de escrever');
      on(soundBtn, 'click', function () {
        if (root.Escr.machineSound) {
          root.Escr.machineSound.setEnabled(!root.Escr.machineSound.isEnabled(), storage, false);
        }
        syncBar();
      });
      right.appendChild(soundBtn);

      machineBtn = document.createElement('button');
      machineBtn.id = 'esc-writing-machine';
      machineBtn.type = 'button';
      machineBtn.className = 'esc-writing-icon-btn';
      machineBtn.title = 'Mostrar ou esconder m\u00E1quina de escrever';
      machineBtn.setAttribute('aria-label', 'Mostrar ou esconder m\u00E1quina de escrever');
      on(machineBtn, 'click', function () {
        onToggleMachine();
        syncBar();
        syncFlow();
      });
      right.appendChild(machineBtn);

      fullBtn = document.createElement('button');
      fullBtn.id = 'esc-writing-fullscreen';
      fullBtn.type = 'button';
      fullBtn.className = 'esc-writing-btn';
      fullBtn.title = 'Alternar tela cheia (F11)';
      on(fullBtn, 'click', function () {
        toggleFullscreen();
        syncBar();
      });
      right.appendChild(fullBtn);

      barEl.appendChild(left);
      barEl.appendChild(right);
      document.body.appendChild(barEl);
    }

    function syncBar() {
      var active = !!getActive();
      if (active) { buildBar(); }
      if (document.body) {
        if (active && isSonnetActive()) {
          document.body.setAttribute('data-esc-writing-sonnet', 'true');
        } else {
          document.body.removeAttribute('data-esc-writing-sonnet');
        }
      }
      if (!barEl) { return; }
      barEl.hidden = !active;
      if (!active) { return; }

      var face = getFace();
      if (faceBtn) {
        faceBtn.textContent = face === 'maquina' ? 'Letra: m\u00E1quina' : 'Letra: livro';
      }
      if (idleNote) {
        idleNote.hidden = !(openedAutomatically && pref.get());
      }
      if (soundBtn) {
        var soundOn = !!(root.Escr.machineSound && root.Escr.machineSound.isEnabled());
        soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
        soundBtn.textContent = '';
        soundBtn.appendChild(svgEl(soundOn ? ICON_SOUND_ON : ICON_SOUND_OFF));
      }
      if (machineBtn) {
        var machOn = !!getMachineEnabled();
        machineBtn.setAttribute('aria-pressed', machOn ? 'true' : 'false');
        machineBtn.textContent = '';
        machineBtn.appendChild(svgEl(ICON_MACHINE));
      }
      if (fullBtn) {
        var fs = isFullscreen();
        fullBtn.setAttribute('aria-pressed', fs ? 'true' : 'false');
        fullBtn.textContent = '';
        fullBtn.appendChild(svgEl(ICON_FULLSCREEN));
        var sp = document.createElement('span');
        sp.textContent = fs ? 'Sair da tela cheia' : 'Tela cheia';
        fullBtn.appendChild(sp);
      }
    }

    function onInput(ev) {
      if (disposed) { return; }
      if (!isTargetInEditor(ev.target)) { return; }
      if (getActive()) { armIdle(); syncFlow(); }
      if (composing || ev.isComposing) { return; }
      var inputType = ev.inputType || '';
      if (inputType) {
        if (inputType === 'insertText') {
          var chunk = ev.data || '';
          if (chunk.length <= 3) { feedText(chunk, ev.target); } else { resetCounter(); }
        } else if (inputType === 'insertLineBreak' || inputType === 'insertParagraph') {
          inWord = false;
        } else if (inputType.indexOf('Paste') >= 0 || inputType.indexOf('history') === 0 || inputType.indexOf('delete') === 0) {
          resetCounter();
        }
      } else if (typeof ev.data === 'string' && ev.data.length === 1) {
        feedText(ev.data, ev.target);
      }
    }

    function onCompStart(ev) {
      if (isTargetInEditor(ev.target)) {
        composing = true;
        if (getActive()) { armIdle(); }
      }
    }
    function onCompEnd(ev) {
      if (isTargetInEditor(ev.target)) {
        composing = false;
        feedText(ev.data || '', ev.target);
        if (getActive()) { syncFlow(); }
      }
    }
    function onActivity() {
      if (getActive() && openedAutomatically) { armIdle(); }
    }
    function onKeyDown(ev) {
      if (getActive() && openedAutomatically) { armIdle(); }
      if (ev.keyCode === 122) { // F11
        ev.preventDefault();
        toggleFullscreen();
        syncBar();
        return;
      }
      if (!getActive() && isTargetInEditor(ev.target)) {
        if (ev.ctrlKey || ev.metaKey || ev.altKey || (ev.keyCode >= 33 && ev.keyCode <= 40)) {
          resetCounter();
        }
      }
    }

    if (typeof document !== 'undefined') {
      on(document, 'input', onInput, true);
      on(document, 'compositionstart', onCompStart, true);
      on(document, 'compositionend', onCompEnd, true);
      on(document, 'keydown', onKeyDown, true);
      on(document, 'mousedown', onActivity, true);
      on(document, 'wheel', onActivity, true);
      on(document, 'selectionchange', syncFlow, false);
      on(document, 'fullscreenchange', syncBar, false);
      on(document, 'webkitfullscreenchange', syncBar, false);
    }

    if (switchBtn) {
      on(switchBtn, 'click', function () {
        pref.set(!pref.get());
        resetCounter();
        syncSwitch();
        syncBar();
      });
      syncSwitch();
    }
    if (root.Escr.machineSound && root.Escr.machineSound.subscribe) {
      root.Escr.machineSound.subscribe(syncBar);
    }

    return {
      preference: pref,
      syncBar: syncBar,
      syncFlow: syncFlow,
      notifyState: function (active, reason) {
        if (!active) {
          openedAutomatically = false;
          clearIdle();
          resetCounter();
        } else {
          if (reason === 'manual') { openedAutomatically = false; clearIdle(); }
          else if (reason === 'automatic') { openedAutomatically = true; armIdle(); }
        }
        syncBar();
        syncFlow();
      },
      resetDocument: function () {
        clearIdle();
        resetCounter();
        openedAutomatically = false;
        syncBar();
      },
      isAutomaticOpen: function () { return openedAutomatically; },
      destroy: function () {
        disposed = true;
        clearIdle();
        if (typeof document !== 'undefined') {
          off(document, 'input', onInput, true);
          off(document, 'compositionstart', onCompStart, true);
          off(document, 'compositionend', onCompEnd, true);
          off(document, 'keydown', onKeyDown, true);
          off(document, 'mousedown', onActivity, true);
          off(document, 'wheel', onActivity, true);
          off(document, 'selectionchange', syncFlow, false);
          off(document, 'fullscreenchange', syncBar, false);
          off(document, 'webkitfullscreenchange', syncBar, false);
        }
      }
    };
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/temas-e-chrome.js */
/* Tema único calibrado (Papel digital E-Ink Sálvia #c4cfc2), Leitura confortável, Piscar E-Ink e Tela cheia — ES5 */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var THEME_KEY = 'escrevaral.theme.v2';
  var READING_KEY = 'escrevaral.reading.comfortable.v1';
  var LOCKED_THEME = 'eink';
  var LABELS = {
    eink: 'Papel digital (E-Ink S\u00E1lvia)'
  };

  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }

  function reducedMotion() {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) { return false; }
  }

  var flashTimer = null;
  function flashEink(node) {
    if (!node || !node.setAttribute || reducedMotion()) { return; }
    if (flashTimer) { window.clearTimeout(flashTimer); flashTimer = null; }
    node.removeAttribute('data-eink-flash');
    node.setAttribute('data-eink-flash', 'true');
    flashTimer = window.setTimeout(function () {
      flashTimer = null;
      if (node && node.removeAttribute) { node.removeAttribute('data-eink-flash'); }
    }, 150);
  }

  root.Escr.einkFlash = flashEink;

  root.Escr.mountThemeChrome = function (opts) {
    opts = opts || {};
    var storage = opts.storage || null;
    var onNewNote = opts.onNewNote || function () {};
    var currentTheme = LOCKED_THEME;
    var comfortable = false;

    try {
      if (storage) {
        comfortable = storage.getItem(READING_KEY) === 'true';
      }
    } catch (ignore) {}

    function applyTheme(name, persistPref) {
      currentTheme = LOCKED_THEME;
      if (document.body) {
        document.body.setAttribute('data-esc-theme', LOCKED_THEME);
        document.body.setAttribute('data-theme', 'claro');
      }
      var meta = document.querySelector ? document.querySelector('meta[name="theme-color"]') : null;
      if (meta) { meta.setAttribute('content', '#c4cfc2'); }
      var lightBtn = document.getElementById && document.getElementById('theme-light');
      var darkBtn = document.getElementById && document.getElementById('theme-dark');
      if (lightBtn) { lightBtn.setAttribute('aria-pressed', 'true'); }
      if (darkBtn) { darkBtn.setAttribute('aria-pressed', 'false'); }
      if (persistPref !== false && storage) {
        try {
          storage.setItem(THEME_KEY, LOCKED_THEME);
          storage.setItem('escrevaral.astra.theme', 'claro');
        } catch (ignore) {}
      }
      try {
        var frame = document.querySelector && document.querySelector('iframe.esc-academy-frame');
        if (frame && frame.contentWindow && frame.contentWindow.postMessage) {
          frame.contentWindow.postMessage({ channel: 'escrevaral-theme', theme: LOCKED_THEME, dark: false }, '*');
        }
      } catch (ignore) {}
    }

    function applyReading(onVal, persistPref) {
      comfortable = !!onVal;
      if (document.body) {
        if (comfortable) { document.body.setAttribute('data-esc-reading', 'comfortable'); }
        else { document.body.removeAttribute('data-esc-reading'); }
      }
      var btn = document.getElementById && document.getElementById('esc-reading-toggle');
      if (btn) { btn.setAttribute('aria-pressed', comfortable ? 'true' : 'false'); }
      if (persistPref !== false && storage) {
        try { storage.setItem(READING_KEY, comfortable ? 'true' : 'false'); } catch (ignore) {}
      }
    }

    function bindControls() {
      var readBtn = document.getElementById && document.getElementById('esc-reading-toggle');
      if (readBtn) {
        on(readBtn, 'click', function () { applyReading(!comfortable, true); });
      }
      var fullBtn = document.getElementById && document.getElementById('esc-fullscreen-btn');
      if (fullBtn) {
        on(fullBtn, 'click', function () {
          if (root.Escr.superfocoCore) { root.Escr.superfocoCore.toggleFullscreen(); }
        });
      }
      on(document, 'keydown', function (ev) {
        if (ev.altKey && ev.shiftKey && !ev.ctrlKey && !ev.metaKey && ev.keyCode === 78) {
          ev.preventDefault();
          onNewNote();
        }
      });
    }

    applyTheme(LOCKED_THEME, true);
    applyReading(comfortable, false);
    bindControls();

    return {
      setTheme: function (name) { applyTheme(name, true); },
      getTheme: function () { return currentTheme; },
      setComfortable: function (v) { applyReading(v, true); },
      isComfortable: function () { return comfortable; },
      flash: flashEink,
      LABELS: LABELS
    };
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/pomodoro-dock.js */
/* Pomodoro Dock fixo na base da Coluna 1 (50/6 min configuráveis) — ES5 estrito */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var KEY = 'escrevaral.pomodoro.dock.v1';

  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }
  function clamp(n, min, max, fallback) {
    var v = parseInt(n, 10);
    if (!isFinite(v)) { return fallback; }
    return Math.max(min, Math.min(max, v));
  }
  function fmt(sec) {
    var s = Math.max(0, Math.floor(sec));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? '0' + m : String(m)) + ':' + (r < 10 ? '0' + r : String(r));
  }

  function createPomodoroEngine(opts) {
    opts = opts || {};
    var storage = opts.storage || null;
    var writeMin = 50;
    var breakMin = 6;
    var phase = 'write'; // 'write' | 'break'
    var running = false;
    var remaining = writeMin * 60;
    var listeners = [];

    try {
      if (storage) {
        var raw = storage.getItem(KEY);
        if (raw) {
          var saved = JSON.parse(raw);
          writeMin = clamp(saved.writeMin, 1, 180, 50);
          breakMin = clamp(saved.breakMin, 1, 60, 6);
          remaining = writeMin * 60;
        }
      }
    } catch (ignore) {}

    function save() {
      if (!storage) { return; }
      try { storage.setItem(KEY, JSON.stringify({ writeMin: writeMin, breakMin: breakMin })); } catch (ignore) {}
    }

    function emit(eventName) {
      var snap = snapshot();
      var i;
      for (i = 0; i < listeners.length; i += 1) {
        try { listeners[i](snap, eventName || 'update'); } catch (ignore) {}
      }
    }

    function snapshot() {
      return {
        phase: phase,
        running: running,
        remaining: remaining,
        formatted: fmt(remaining),
        writeMin: writeMin,
        breakMin: breakMin,
        label: phase === 'write' ? 'Escrita' : 'Pausa'
      };
    }

    function tick() {
      if (!running) { return; }
      remaining -= 1;
      if (remaining <= 0) {
        if (phase === 'write') {
          phase = 'break';
          remaining = breakMin * 60;
          emit('break-start');
        } else {
          phase = 'write';
          remaining = writeMin * 60;
          running = false;
          emit('cycle-complete');
        }
      } else {
        emit('tick');
      }
    }

    return {
      snapshot: snapshot,
      tick: tick,
      start: function () { running = true; emit('start'); },
      pause: function () { running = false; emit('pause'); },
      toggle: function () { running = !running; emit(running ? 'start' : 'pause'); },
      reset: function () {
        running = false;
        phase = 'write';
        remaining = writeMin * 60;
        emit('reset');
      },
      configure: function (wMin, bMin) {
        writeMin = clamp(wMin, 1, 180, writeMin);
        breakMin = clamp(bMin, 1, 60, breakMin);
        save();
        if (!running) {
          remaining = (phase === 'write' ? writeMin : breakMin) * 60;
        }
        emit('config');
      },
      subscribe: function (fn) {
        if (typeof fn === 'function') { listeners.push(fn); }
        return function () {
          var idx = listeners.indexOf(fn);
          if (idx >= 0) { listeners.splice(idx, 1); }
        };
      }
    };
  }

  root.Escr.pomodoroCore = {
    KEY: KEY,
    formatTime: fmt,
    createEngine: createPomodoroEngine
  };

  root.Escr.mountPomodoroDock = function (opts) {
    opts = opts || {};
    var hostEl = opts.containerEl || (typeof document !== 'undefined' ? document.getElementById('esc-pomodoro-dock') : null);
    var engine = createPomodoroEngine({ storage: opts.storage || null });
    var timerId = null;
    var configOpen = false;

    function startInterval() {
      if (timerId !== null) { return; }
      timerId = window.setInterval(function () { engine.tick(); }, 1000);
    }
    function stopInterval() {
      if (timerId !== null) { window.clearInterval(timerId); timerId = null; }
    }

    function render() {
      if (!hostEl) { return; }
      var s = engine.snapshot();
      hostEl.textContent = '';

      var row = document.createElement('div');
      row.className = 'esc-pomo-row';

      var info = document.createElement('div');
      info.className = 'esc-pomo-info';
      var ph = document.createElement('span');
      ph.className = 'esc-pomo-phase';
      ph.textContent = s.label;
      var tm = document.createElement('strong');
      tm.className = 'esc-pomo-time';
      tm.textContent = s.formatted;
      info.appendChild(ph);
      info.appendChild(tm);
      row.appendChild(info);

      var btns = document.createElement('div');
      btns.className = 'esc-pomo-btns';

      var toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'esc-pomo-btn';
      toggleBtn.textContent = s.running ? 'Pausar' : 'Iniciar';
      toggleBtn.setAttribute('aria-pressed', s.running ? 'true' : 'false');
      on(toggleBtn, 'click', function () { engine.toggle(); });
      btns.appendChild(toggleBtn);

      var resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.className = 'esc-pomo-btn';
      resetBtn.title = 'Encerrar e reiniciar ciclo';
      resetBtn.textContent = '\u21BA';
      on(resetBtn, 'click', function () { engine.reset(); });
      btns.appendChild(resetBtn);

      var cfgBtn = document.createElement('button');
      cfgBtn.type = 'button';
      cfgBtn.className = 'esc-pomo-btn';
      cfgBtn.title = 'Ajustar tempos do Pomodoro';
      cfgBtn.setAttribute('aria-expanded', configOpen ? 'true' : 'false');
      cfgBtn.textContent = '\u2699';
      on(cfgBtn, 'click', function () { configOpen = !configOpen; render(); });
      btns.appendChild(cfgBtn);

      row.appendChild(btns);
      hostEl.appendChild(row);

      if (configOpen) {
        var form = document.createElement('form');
        form.className = 'esc-pomo-config';
        var wLbl = document.createElement('label');
        wLbl.textContent = 'Escrita (min)';
        var wInp = document.createElement('input');
        wInp.type = 'number'; wInp.min = '1'; wInp.max = '180'; wInp.value = String(s.writeMin);
        wLbl.appendChild(wInp);

        var bLbl = document.createElement('label');
        bLbl.textContent = 'Pausa (min)';
        var bInp = document.createElement('input');
        bInp.type = 'number'; bInp.min = '1'; bInp.max = '60'; bInp.value = String(s.breakMin);
        bLbl.appendChild(bInp);

        var saveBtn = document.createElement('button');
        saveBtn.type = 'submit';
        saveBtn.className = 'esc-pomo-save';
        saveBtn.textContent = 'Aplicar';

        on(form, 'submit', function (ev) {
          ev.preventDefault();
          engine.configure(wInp.value, bInp.value);
          configOpen = false;
          render();
        });
        form.appendChild(wLbl);
        form.appendChild(bLbl);
        form.appendChild(saveBtn);
        hostEl.appendChild(form);
      }
    }

    engine.subscribe(function (snap, evName) {
      if (snap.running) { startInterval(); }
      else { stopInterval(); }
      if (evName === 'break-start' && opts.onBreakStart) { opts.onBreakStart(snap); }
      render();
    });

    render();

    return {
      engine: engine,
      render: render,
      destroy: stopInterval
    };
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/calculadora-editorial.js */
/* Calculadora Editorial Flutuante (4 modos: Conta, Páginas/Laudas, Orçamento, Tempo) — ES5 estrito */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }

  // Parser aritmético recursivo puro (zero eval / Function)
  function evalExpr(raw) {
    var src = String(raw || '').replace(/\s+/g, '').replace(/,/g, '.').replace(/\u00D7/g, '*').replace(/\u00F7/g, '/').replace(/\u2212/g, '-');
    if (!src) { throw new Error('Digite uma conta para calcular.'); }
    if (src.length > 160) { throw new Error('Use uma conta de at\u00E9 160 caracteres.'); }
    if (/[^0-9.+\-*/()]/.test(src)) { throw new Error('Use apenas n\u00FAmeros, par\u00EAnteses e os sinais + - \u00D7 \u00F7.'); }

    var pos = 0;
    function parseExpr() {
      var left = parseTerm();
      while (pos < src.length && (src.charAt(pos) === '+' || src.charAt(pos) === '-')) {
        var op = src.charAt(pos); pos += 1;
        var right = parseTerm();
        left = op === '+' ? left + right : left - right;
      }
      return left;
    }
    function parseTerm() {
      var left = parseFactor();
      while (pos < src.length && (src.charAt(pos) === '*' || src.charAt(pos) === '/')) {
        var op = src.charAt(pos); pos += 1;
        var right = parseFactor();
        if (op === '/') {
          if (right === 0) { throw new Error('N\u00E3o \u00E9 poss\u00EDvel dividir por zero.'); }
          left = left / right;
        } else {
          left = left * right;
        }
      }
      return left;
    }
    function parseFactor() {
      if (pos < src.length && src.charAt(pos) === '+') { pos += 1; return parseFactor(); }
      if (pos < src.length && src.charAt(pos) === '-') { pos += 1; return -parseFactor(); }
      if (pos < src.length && src.charAt(pos) === '(') {
        pos += 1;
        var val = parseExpr();
        if (src.charAt(pos) !== ')') { throw new Error('Feche os par\u00EAnteses da conta.'); }
        pos += 1;
        return val;
      }
      var start = pos;
      var dots = 0;
      while (pos < src.length && ((src.charAt(pos) >= '0' && src.charAt(pos) <= '9') || src.charAt(pos) === '.')) {
        if (src.charAt(pos) === '.') { dots += 1; }
        pos += 1;
      }
      if (pos === start || dots > 1 || src.slice(start, pos) === '.') {
        throw new Error('Confira os n\u00FAmeros da conta.');
      }
      var num = Number(src.slice(start, pos));
      if (!isFinite(num)) { throw new Error('N\u00FAmero inv\u00E1lido.'); }
      return num;
    }
    var res = parseExpr();
    if (pos !== src.length || !isFinite(res) || Math.abs(res) > 9007199254740991) {
      throw new Error('Express\u00E3o inv\u00E1lida ou grande demais.');
    }
    // Elimina ruído clássico de ponto flutuante (ex: 0.1 + 0.2)
    return Math.round(res * 1e10) / 1e10;
  }

  function parseNumber(val, label, positive) {
    var txt = String(val || '').replace(/^\s+|\s+$/g, '');
    if (!txt || txt.length > 24 || !/^\d+(?:[.,]\d+)?$/.test(txt)) {
      throw new Error('Preencha \u201C' + label + '\u201D com um n\u00FAmero, sem separador de milhares.');
    }
    var n = Number(txt.replace(',', '.'));
    if (!isFinite(n) || n > 1e12 || (positive && n <= 0)) {
      throw new Error('Confira \u201C' + label + '\u201D: use um valor ' + (positive ? 'maior que zero' : 'v\u00E1lido') + '.');
    }
    return n;
  }

  function fmtNum(v) {
    try {
      if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
        return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 }).format(v);
      }
    } catch (ignore) {}
    return String(Math.round(v * 10000) / 10000).replace('.', ',');
  }

  function fmtMoney(v) {
    try {
      if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
      }
    } catch (ignore) {}
    return 'R$ ' + v.toFixed(2).replace('.', ',');
  }

  function roundUp(v) {
    var nearest = Math.round(v);
    if (nearest > 0 && Math.abs(v - nearest) <= 1e-11 * Math.max(1, v)) { return nearest; }
    return Math.ceil(v);
  }

  var mathApi = {
    calculate: function (expr) {
      var val = evalExpr(expr);
      return { value: val, text: String(val).replace('.', ','), detail: '' };
    },
    pages: function (opts) {
      var unit = opts && opts.unit === 'characters' ? 'characters' : 'words';
      var total = parseNumber(opts && opts.amount, unit === 'characters' ? 'Caracteres com espa\u00E7os' : 'Palavras', false);
      var per = parseNumber(opts && opts.perPage, unit === 'characters' ? 'Caracteres por lauda' : 'Palavras por p\u00E1gina', true);
      var value = total / per;
      var noun = unit === 'characters' ? 'laudas' : 'p\u00E1ginas';
      return {
        value: value,
        text: fmtNum(value) + ' ' + noun,
        detail: 'Arredondando para cima: ' + fmtNum(roundUp(value)) + '. Estimativa; a diagrama\u00E7\u00E3o altera a pagina\u00E7\u00E3o.'
      };
    },
    budget: function (opts) {
      var qty = parseNumber(opts && opts.quantity, 'Quantidade', false);
      var rate = parseNumber(opts && opts.rate, 'Valor por unidade', false);
      var value = qty * rate;
      return {
        value: value,
        text: fmtMoney(value),
        detail: 'Quantidade \u00D7 valor por unidade. Sem impostos ou despesas adicionais.'
      };
    },
    time: function (opts) {
      var amount = parseNumber(opts && opts.amount, 'Palavras a trabalhar', false);
      var pace = parseNumber(opts && opts.pace, 'Palavras por hora', true);
      var daily = parseNumber(opts && opts.daily, 'Horas por dia', true);
      if (daily > 24) { throw new Error('Horas por dia deve ser no m\u00E1ximo 24.'); }
      var hours = amount / pace;
      var mins = roundUp(hours * 60);
      var days = roundUp(hours / daily);
      return {
        value: hours,
        text: fmtNum(Math.floor(mins / 60)) + ' h ' + (mins % 60) + ' min',
        detail: fmtNum(days) + ' dia(s) de trabalho a ' + fmtNum(daily) + ' h/dia.'
      };
    }
  };

  root.Escr.calculatorMath = mathApi;

  root.Escr.mountCalculator = function (opts) {
    opts = opts || {};
    var getCounts = opts.getCounts || function () { return { words: 0, characters: 0 }; };
    var el = null;
    var activeTab = 'conta';
    var state = {
      expr: '',
      unit: 'words',
      amount: '1000',
      perPage: '250',
      quantity: '10',
      rate: '45,00',
      tAmount: '5000',
      tPace: '500',
      tDaily: '2',
      resultText: '',
      resultDetail: '',
      errorText: ''
    };

    function createEl(tag, cls, txt) {
      var n = document.createElement(tag);
      if (cls) { n.className = cls; }
      if (typeof txt === 'string') { n.textContent = txt; }
      return n;
    }

    function ensureEl() {
      if (el || typeof document === 'undefined' || !document.body) { return el; }
      el = createEl('section', 'esc-calculator');
      el.id = 'esc-calculator';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-label', 'Calculadora editorial');
      el.hidden = true;
      document.body.appendChild(el);
      on(document, 'keydown', function (ev) {
        if (ev.keyCode === 27 && el && !el.hidden) { close(); }
      });
      return el;
    }

    function makeDraggable(handle) {
      var dragging = false, ox = 0, oy = 0;
      on(handle, 'mousedown', function (ev) {
        if (ev.target && ev.target.tagName === 'BUTTON') { return; }
        dragging = true;
        var rect = el.getBoundingClientRect ? el.getBoundingClientRect() : { left: 80, top: 80 };
        ox = ev.clientX - rect.left;
        oy = ev.clientY - rect.top;
      });
      on(document, 'mousemove', function (ev) {
        if (!dragging || !el) { return; }
        el.style.right = 'auto';
        el.style.left = Math.max(8, Math.min((window.innerWidth || 1000) - 340, ev.clientX - ox)) + 'px';
        el.style.top = Math.max(44, Math.min((window.innerHeight || 700) - 120, ev.clientY - oy)) + 'px';
      });
      on(document, 'mouseup', function () { dragging = false; });
    }

    function compute() {
      state.errorText = '';
      try {
        var r;
        if (activeTab === 'conta') { r = mathApi.calculate(state.expr); }
        else if (activeTab === 'paginas') { r = mathApi.pages({ amount: state.amount, perPage: state.perPage, unit: state.unit }); }
        else if (activeTab === 'orcamento') { r = mathApi.budget({ quantity: state.quantity, rate: state.rate }); }
        else { r = mathApi.time({ amount: state.tAmount, pace: state.tPace, daily: state.tDaily }); }
        state.resultText = r.text;
        state.resultDetail = r.detail || '';
      } catch (e) {
        state.resultText = '';
        state.resultDetail = '';
        state.errorText = e && e.message ? e.message : 'Erro no c\u00E1lculo.';
      }
      render();
    }

    function render() {
      if (!el || el.hidden) { return; }
      el.textContent = '';

      var head = createEl('header', 'esc-calc-head');
      head.appendChild(createEl('strong', '', 'Calculadora editorial'));
      var closeBtn = createEl('button', 'esc-calc-close', '\u00D7');
      closeBtn.type = 'button';
      closeBtn.setAttribute('aria-label', 'Fechar calculadora');
      on(closeBtn, 'click', close);
      head.appendChild(closeBtn);
      el.appendChild(head);
      makeDraggable(head);

      var tabs = createEl('div', 'esc-calc-tabs');
      tabs.setAttribute('role', 'tablist');
      [['conta', 'Conta'], ['paginas', 'P\u00E1ginas'], ['orcamento', 'Or\u00E7amento'], ['tempo', 'Tempo']].forEach(function (pair) {
        var b = createEl('button', 'esc-calc-tab', pair[1]);
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', activeTab === pair[0] ? 'true' : 'false');
        on(b, 'click', function () {
          activeTab = pair[0];
          state.errorText = '';
          state.resultText = '';
          state.resultDetail = '';
          render();
        });
        tabs.appendChild(b);
      });
      el.appendChild(tabs);

      var form = createEl('form', 'esc-calc-body');
      on(form, 'submit', function (ev) { ev.preventDefault(); compute(); });

      function field(labelTxt, val, onChange, ph) {
        var l = createEl('label', 'esc-calc-field');
        l.appendChild(createEl('span', '', labelTxt));
        var inp = createEl('input');
        inp.type = 'text';
        inp.value = val;
        if (ph) { inp.placeholder = ph; }
        on(inp, 'input', function () { onChange(inp.value); });
        l.appendChild(inp);
        return l;
      }

      if (activeTab === 'conta') {
        form.appendChild(field('Express\u00E3o', state.expr, function (v) { state.expr = v; }, 'Ex.: (120 + 45) * 2'));
        var pad = createEl('div', 'esc-calc-pad');
        ['7','8','9','\u00F7','4','5','6','\u00D7','1','2','3','-','0',',','C','+'].forEach(function (k) {
          var kb = createEl('button', 'esc-calc-key', k);
          kb.type = 'button';
          on(kb, 'click', function () {
            if (k === 'C') { state.expr = ''; state.resultText = ''; state.errorText = ''; }
            else { state.expr += k; }
            render();
          });
          pad.appendChild(kb);
        });
        form.appendChild(pad);
      } else if (activeTab === 'paginas') {
        var uRow = createEl('div', 'esc-calc-unit-row');
        [['words', 'Palavras \u2192 p\u00E1ginas'], ['characters', 'Caracteres \u2192 laudas']].forEach(function (p) {
          var ub = createEl('button', 'esc-filter-chip', p[1]);
          ub.type = 'button';
          ub.setAttribute('aria-pressed', state.unit === p[0] ? 'true' : 'false');
          on(ub, 'click', function () {
            state.unit = p[0];
            state.perPage = p[0] === 'characters' ? '2100' : '250';
            render();
          });
          uRow.appendChild(ub);
        });
        form.appendChild(uRow);
        var useDocBtn = createEl('button', 'esc-item-act', 'Usar contagem do texto aberto');
        useDocBtn.type = 'button';
        on(useDocBtn, 'click', function () {
          var c = getCounts();
          state.amount = String(state.unit === 'characters' ? (c.characters || 0) : (c.words || 0));
          compute();
        });
        form.appendChild(useDocBtn);
        form.appendChild(field(state.unit === 'characters' ? 'Caracteres com espa\u00E7os' : 'Palavras', state.amount, function (v) { state.amount = v; }));
        form.appendChild(field(state.unit === 'characters' ? 'Caracteres por lauda' : 'Palavras por p\u00E1gina', state.perPage, function (v) { state.perPage = v; }));
      } else if (activeTab === 'orcamento') {
        form.appendChild(field('Quantidade (palavras / laudas / p\u00E1ginas)', state.quantity, function (v) { state.quantity = v; }));
        form.appendChild(field('Valor por unidade (R$)', state.rate, function (v) { state.rate = v; }));
      } else {
        form.appendChild(field('Palavras a trabalhar', state.tAmount, function (v) { state.tAmount = v; }));
        form.appendChild(field('Ritmo (palavras por hora)', state.tPace, function (v) { state.tPace = v; }));
        form.appendChild(field('Horas por dia', state.tDaily, function (v) { state.tDaily = v; }));
      }

      var submitBtn = createEl('button', 'esc-btn-primary esc-calc-submit', 'Calcular');
      submitBtn.type = 'submit';
      form.appendChild(submitBtn);

      if (state.errorText) {
        form.appendChild(createEl('p', 'esc-inline-err', state.errorText));
      } else if (state.resultText) {
        var out = createEl('div', 'esc-calc-result');
        out.appendChild(createEl('strong', '', state.resultText));
        if (state.resultDetail) { out.appendChild(createEl('p', '', state.resultDetail)); }
        form.appendChild(out);
      }

      el.appendChild(form);
    }

    function open(tabName, autoFillFromDoc) {
      ensureEl();
      if (!el) { return; }
      if (tabName === 'conta' || tabName === 'paginas' || tabName === 'orcamento' || tabName === 'tempo') {
        activeTab = tabName;
        state.errorText = '';
        state.resultText = '';
        state.resultDetail = '';
      }
      el.hidden = false;
      if (autoFillFromDoc && activeTab === 'paginas') {
        var c = getCounts();
        var countVal = state.unit === 'characters' ? (c.characters || 0) : (c.words || 0);
        if (countVal > 0) {
          state.amount = String(countVal);
          compute();
          return;
        }
      }
      render();
    }
    function close() {
      if (el) { el.hidden = true; }
    }

    return {
      open: open,
      close: close,
      toggle: function () { if (el && !el.hidden) { close(); } else { open(); } },
      isOpen: function () { return !!(el && !el.hidden); }
    };
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/cartao-sinonimos.js */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el) { el.addEventListener(ev, fn, false); } }

  function matchCasing(original, replacement) {
    if (!original || !replacement) { return replacement; }
    var first = original.charAt(0);
    if (first === first.toUpperCase() && first !== first.toLowerCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  }

  function trimWordSelection(raw, start) {
    if (!raw || raw.length > 64) { return null; }
    var leading = raw.match(/^\s*/)[0].length;
    var trailing = raw.match(/[\s.,;:!?()[\]"'«»—–-]*$/)[0].length;
    var end = raw.length - trailing;
    if (end <= leading) { return null; }
    var word = raw.slice(leading, end);
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[-'’][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/.test(word)) { return null; }
    return { word: word, start: start + leading, end: start + end };
  }

  root.Escr.mountWordCard = function (opts) {
    var service = opts.service || (root.Escr.getLexicoP01 ? root.Escr.getLexicoP01() : (root.Escr.createLexicoP01 ? root.Escr.createLexicoP01() : null));
    var manuscript = opts.manuscriptEl;
    var richEl = opts.richEl || null;
    var cardEl = null;
    var debounceTimer = null;
    var requestToken = 0;
    var currentState = null;

    function buildCard() {
      if (cardEl) { return cardEl; }
      var el = document.createElement('aside');
      el.id = 'esc-word-card';
      el.className = 'esc-palavra';
      el.setAttribute('role', 'region');
      el.setAttribute('aria-label', 'Definição e sinônimos');
      el.hidden = true;
      document.body.appendChild(el);
      cardEl = el;
      return cardEl;
    }

    function hide(restoreFocus, keepSelectionBar) {
      var wasSelection = !!(currentState && currentState.mode !== 'manual');
      requestToken += 1;
      window.clearTimeout(debounceTimer);
      currentState = null;
      if (cardEl) {
        cardEl.hidden = true;
        if (document.body) { document.body.removeAttribute('data-esc-consulta-open'); }
        cardEl.textContent = '';
      }
      if (wasSelection && !keepSelectionBar && opts.onDismissSelection) {
        try { opts.onDismissSelection(); } catch (ignore) {}
      }
      if (restoreFocus) {
        if (richEl && !richEl.hidden && richEl.focus) { richEl.focus(); }
        else if (manuscript && !manuscript.hidden && manuscript.focus) { manuscript.focus(); }
      }
    }


    var showSources = false;
    function openManual(initialWord) {
      if (!service) { return; }
      buildCard();
      showSources = false;
      var q = String(initialWord || '').replace(/^\s+|\s+$/g, '');
      currentState = {
        mode: 'manual',
        textNode: null,
        originalWord: q,
        replaceStart: 0,
        replaceEnd: 0,
        canReplace: false,
        loading: !!q,
        replacedWith: null,
        index: 0,
        result: q ? null : { state: 'idle', entries: [] }
      };
      renderCard();
      if (q) {
        var token = ++requestToken;
        service.lookup(q, function (res) {
          if (token !== requestToken || !currentState) { return; }
          currentState.loading = false;
          currentState.result = res;
          renderCard();
        });
      }
    }

    function renderCard() {
      buildCard();
      if (!currentState) { hide(false); return; }
      cardEl.textContent = '';

      var header = document.createElement('header');
      header.className = 'esc-palavra-header';
      var title = document.createElement('strong');
      title.className = 'esc-palavra-title';
      title.textContent = currentState.originalWord;
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'esc-palavra-icon';
      closeBtn.textContent = '×';
      closeBtn.setAttribute('aria-label', 'Fechar consulta');
      on(closeBtn, 'click', function () { hide(true); });
      header.appendChild(title);
      header.appendChild(closeBtn);
      cardEl.appendChild(header);

      var content = document.createElement('div');
      content.className = 'esc-palavra-content';

      if (currentState.loading) {
        var waitP = document.createElement('p');
        waitP.className = 'esc-palavra-status';
        waitP.textContent = 'Consultando léxico PT-BR…';
        content.appendChild(waitP);
      } else if (!currentState.result || currentState.result.state !== 'found' || !currentState.result.entries.length) {
        var msgP = document.createElement('p');
        msgP.className = 'esc-palavra-status';
        msgP.textContent = currentState.result && currentState.result.state === 'unavailable'
          ? 'Pacote P01 indisponível nesta cópia.'
          : 'Palavra fora do recorte de sinônimos; isso não indica erro.';
        content.appendChild(msgP);
      } else {
        var entries = currentState.result.entries;
        var idx = Math.max(0, Math.min(entries.length - 1, currentState.index || 0));
        var entry = entries[idx];

        if (entry.posLabel || entry.lemma) {
          var cls = document.createElement('p');
          cls.className = 'esc-palavra-class';
          cls.textContent = (entry.posLabel ? entry.posLabel : '') + (entry.lemma && entry.lemma !== currentState.originalWord.toLowerCase() ? ' · lema: ' + entry.lemma : '');
          content.appendChild(cls);
        }
        if (entry.definition) {
          var def = document.createElement('p');
          def.className = 'esc-palavra-definition';
          def.textContent = entry.definition;
          content.appendChild(def);
        }
        if (entry.synonyms && entry.synonyms.length && currentState.canReplace) {
          var wordsWrap = document.createElement('div');
          wordsWrap.className = 'esc-palavra-words';
          entry.synonyms.slice(0, 3).forEach(function (syn) {
            var applied = currentState.replacedWith === syn;
            var btn = document.createElement('button');
            btn.type = 'button';
            function applyText(nextWord, nextReplaced) {
              if (currentState.mode === 'rich' && currentState.textNode) {
                var val = currentState.textNode.nodeValue || '';
                currentState.textNode.nodeValue = val.slice(0, currentState.replaceStart) + nextWord + val.slice(currentState.replaceEnd);
                currentState.replaceEnd = currentState.replaceStart + nextWord.length;
                currentState.replacedWith = nextReplaced;
                if (opts.onRichSync) { opts.onRichSync(); }
                renderCard();
              } else if (opts.onReplace && manuscript) {
                opts.onReplace(currentState.replaceStart, currentState.replaceEnd, nextWord);
                currentState.replaceEnd = currentState.replaceStart + nextWord.length;
                currentState.replacedWith = nextReplaced;
                renderCard();
              }
            }
            if (applied) {
              btn.className = 'esc-palavra-undo';
              btn.textContent = 'Desfazer (' + matchCasing(currentState.originalWord, syn) + ')';
              on(btn, 'click', function () { applyText(currentState.originalWord, null); });
            } else {
              btn.className = 'esc-palavra-word';
              btn.textContent = matchCasing(currentState.originalWord, syn);
              on(btn, 'click', function () { applyText(matchCasing(currentState.originalWord, syn), syn); });
            }
            wordsWrap.appendChild(btn);
          });
          content.appendChild(wordsWrap);
        } else if (entry.synonyms && entry.synonyms.length) {
          var ro = document.createElement('p');
          ro.className = 'esc-palavra-status';
          ro.textContent = 'Sinônimos: ' + entry.synonyms.slice(0, 3).join(', ');
          content.appendChild(ro);
        }
        if (entries.length > 1) {
          var nav = document.createElement('div');
          nav.className = 'esc-palavra-nav';
          var prev = document.createElement('button');
          prev.type = 'button';
          prev.textContent = '‹';
          prev.disabled = idx === 0;
          on(prev, 'click', function () { currentState.index = idx - 1; renderCard(); });
          var pos = document.createElement('span');
          pos.textContent = (idx + 1) + ' de ' + entries.length;
          var next = document.createElement('button');
          next.type = 'button';
          next.textContent = '›';
          next.disabled = idx >= entries.length - 1;
          on(next, 'click', function () { currentState.index = idx + 1; renderCard(); });
          nav.appendChild(prev);
          nav.appendChild(pos);
          nav.appendChild(next);
          content.appendChild(nav);
        }
      }

      if (!currentState.loading) {
      /* Quando aberto por seleção no texto, integra Copiar / Recortar / Analisar no mesmo menu único */
      if (currentState.mode !== 'manual') {
        var selActions = document.createElement('div');
        selActions.className = 'esc-palavra-sel-actions';
        var copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.textContent = 'Copiar';
        on(copyBtn, 'click', function () {
          var nativeCopy = byId('selection-copy');
          if (nativeCopy) { nativeCopy.click(); }
          copyBtn.textContent = 'Copiado';
          window.setTimeout(function () { if (copyBtn) { copyBtn.textContent = 'Copiar'; } }, 900);
        });
        selActions.appendChild(copyBtn);
        if (currentState.canReplace) {
          var cutBtn = document.createElement('button');
          cutBtn.type = 'button';
          cutBtn.textContent = 'Recortar';
          on(cutBtn, 'click', function () {
            var nativeCut = byId('selection-cut');
            if (nativeCut) { nativeCut.click(); }
            hide(true);
          });
          selActions.appendChild(cutBtn);
        }
        var exBtn = document.createElement('button');
        exBtn.type = 'button';
        exBtn.textContent = 'Analisar';
        on(exBtn, 'click', function () {
          var nativeEx = byId('selection-examine');
          hide(false);
          if (nativeEx) { nativeEx.click(); }
        });
        selActions.appendChild(exBtn);
        content.appendChild(selActions);
      }

      var toolsRow = document.createElement('div');
      toolsRow.className = 'esc-palavra-tools';
      var form = document.createElement('form');
      form.className = 'esc-palavra-search-form';
      var sInp = document.createElement('input');
      sInp.type = 'search';
      sInp.className = 'esc-palavra-search-input';
      sInp.placeholder = 'Consultar palavra';
      sInp.value = currentState.mode === 'manual' ? (currentState.originalWord || '') : '';
      var sBtn = document.createElement('button');
      sBtn.type = 'submit';
      sBtn.className = 'esc-palavra-search-btn';
      sBtn.textContent = 'Buscar';
      on(form, 'submit', function (ev) {
        ev.preventDefault();
        var w = String(sInp.value || '').replace(/^\s+|\s+$/g, '');
        if (w) { openManual(w); }
      });
      form.appendChild(sInp);
      form.appendChild(sBtn);
      toolsRow.appendChild(form);

      var infoBtn = document.createElement('button');
      infoBtn.type = 'button';
      infoBtn.className = 'esc-palavra-info-btn';
      infoBtn.title = 'Fontes da consulta lexical';
      infoBtn.setAttribute('aria-pressed', showSources ? 'true' : 'false');
      infoBtn.textContent = 'i';
      on(infoBtn, 'click', function () { showSources = !showSources; renderCard(); });
      toolsRow.appendChild(infoBtn);
      content.appendChild(toolsRow);

      if (showSources) {
        var srcBox = document.createElement('p');
        srcBox.className = 'esc-palavra-sources';
        srcBox.textContent = 'Acervo local P01 (7.661 lemas, 92.148 chaves): Wikcionário em português (CC-BY-SA 4.0), OpenWordNet-PT (CC-BY-SA 4.0) e PortiLexicon-UD (MIT). Consulta 100% offline.';
        content.appendChild(srcBox);
      }

      }
      cardEl.appendChild(content);
      cardEl.hidden = false;
      if (document.body) { document.body.setAttribute('data-esc-consulta-open', 'true'); }
    }

    function inspectSelection() {
      if (!service) { return; }
      var mode = 'plain', clean = null, textNode = null, canReplace = false;
      if (richEl && !richEl.hidden && document.activeElement && (document.activeElement === richEl || (richEl.contains && richEl.contains(document.activeElement))) && typeof window !== 'undefined' && window.getSelection) {
        var sel = window.getSelection();
        if (sel && sel.rangeCount && !sel.isCollapsed) {
          var range = sel.getRangeAt(0);
          if (range.startContainer === range.endContainer && range.startContainer.nodeType === 3 && richEl.contains(range.startContainer)) {
            clean = trimWordSelection((range.startContainer.nodeValue || '').slice(range.startOffset, range.endOffset), range.startOffset);
            textNode = range.startContainer;
            mode = 'rich';
            canReplace = richEl.getAttribute('contenteditable') === 'true';
          }
        }
      } else if (manuscript && !manuscript.hidden && document.activeElement === manuscript) {
        var start = manuscript.selectionStart, end = manuscript.selectionEnd;
        if (typeof start === 'number' && typeof end === 'number' && end > start) {
          clean = trimWordSelection(manuscript.value.slice(start, end), start);
          canReplace = !manuscript.readOnly && !manuscript.disabled;
        }
      } else {
        return;
      }
      if (!clean) {
        if (currentState) { hide(false, true); }
        return;
      }
      if (currentState && currentState.mode === mode && currentState.replaceStart === clean.start && currentState.originalWord === clean.word) {
        return;
      }
      var token = ++requestToken;
      currentState = {
        mode: mode,
        textNode: textNode,
        originalWord: clean.word,
        replaceStart: clean.start,
        replaceEnd: clean.end,
        canReplace: canReplace,
        loading: true,
        replacedWith: null,
        index: 0,
        result: null
      };
      renderCard();
      service.lookup(clean.word, function (res) {
        if (token !== requestToken || !currentState) { return; }
        currentState.loading = false;
        currentState.result = res;
        renderCard();
      });
    }

    function scheduleInspect() {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(inspectSelection, 140);
    }

    function bindTarget(el) {
      if (!el) { return; }
      on(el, 'mouseup', scheduleInspect);
      on(el, 'touchend', scheduleInspect);
      on(el, 'keyup', function (ev) {
        if (ev.shiftKey && ev.keyCode >= 33 && ev.keyCode <= 40) { scheduleInspect(); }
      });
      on(el, 'input', function () {
        if (currentState) { hide(false); }
      });
    }
    bindTarget(manuscript);
    bindTarget(richEl);

    on(document, 'keydown', function (ev) {
      if (ev.keyCode === 27 && cardEl && !cardEl.hidden) {
        ev.preventDefault();
        ev.stopPropagation();
        hide(true);
      }
    });
    on(document, 'mousedown', function (ev) {
      if (!cardEl || cardEl.hidden) { return; }
      if (cardEl.contains(ev.target) || ev.target === manuscript || (richEl && (ev.target === richEl || (richEl.contains && richEl.contains(ev.target))))) { return; }
      hide(false);
    });

    return {
      hide: hide,
      inspectSelection: inspectSelection,
      trimWordSelection: trimWordSelection,
      openManual: openManual
    };
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/academia.js */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var LAST_GUIDE_KEY = 'escrevaral.academy.last.v1';

  var CATALOG = [
    { id: 'objeto-livro', title: 'Objeto livro', group: 'Objeto livro', description: 'Da capa ao colofão, explore cada parte.', file: 'anatomia-do-livro.html',
      bridge: { action: 'reader', label: 'Ver folha no Modo Leitura', hint: 'Experimente seu texto como página impressa.' } },
    { id: 'literatura-mundial', title: 'Literatura mundial', group: 'Literatura', description: 'Percorra épocas e leia textos que abrem caminhos para escrever.', file: 'literatura-mundial.html', module: 'literature',
      bridge: { action: 'write', label: 'Voltar à folha para escrever', hint: 'Leve o ritmo da leitura de volta para a bancada.' } },
    { id: 'primeiras-linhas', title: 'Começar um livro', group: 'Escrita e revisão', description: 'Da primeira linha ao primeiro capítulo.', file: 'primeiras-linhas.html',
      bridge: { action: 'superfoco', label: 'Começar na folha (Superfoco)', hint: 'Limpe a mesa e escreva a primeira linha.' } },
    { id: 'titulo-do-livro', title: 'Escolher o título', group: 'Escrita e revisão', description: 'Explore caminhos para dar nome à obra.', file: 'titulo-do-livro.html',
      bridge: { action: 'focus-title', label: 'Editar título da folha', hint: 'Teste títulos direto no cabeçalho do manuscrito.' } },
    { id: 'bloqueio-criativo', title: 'Bloqueio criativo', group: 'Escrita e revisão', description: 'Encontre uma forma de retomar a escrita.', file: 'bloqueio-criativo.html',
      bridge: { action: 'superfoco', label: 'Destravar no Superfoco', hint: 'Feche o ruído e deixe a escrita fluir sem censura.' } },
    { id: 'revisao-manuscrito', title: 'Revisar o manuscrito', group: 'Escrita e revisão', description: 'Revise em camadas, sem perder o fio.', file: 'revisao-manuscrito.html',
      bridge: { action: 'examine', label: 'Abrir Examinar na Oficina', hint: 'Revise a folha por camadas com as lentes locais.' } },
    { id: 'biblioteca-escrita', title: 'Biblioteca da escrita', group: 'Escrita e revisão', description: 'Conheça referências e critérios de leitura.', file: 'biblioteca-escrita.html',
      bridge: { action: 'write', label: 'Voltar à oficina', hint: 'Aplique os critérios de leitura direto no seu rascunho.' } },
    { id: 'mapa-lancamento-editorial', title: 'Mapa de lançamento', group: 'Publicação e carreira', description: 'Guia para transformar manuscrito em projeto de publicação, com decisão entre caminho independente e editorial.', file: 'mapa-lancamento-editorial.html',
      bridge: { action: 'calculator', label: 'Estimar páginas e ritmo', hint: 'Calcule páginas, laudas e tempo até o lançamento.' } },
    { id: 'autopublicacao-independente', title: 'Autopublicação independente', group: 'Publicação e carreira', description: 'Guia para publicar por conta própria com revisão, capa, distribuição, preço e audiência.', file: 'autopublicacao-independente.html',
      bridge: { action: 'calculator', label: 'Estimar páginas do livro', hint: 'Projete a extensão editorial do manuscrito.' } },
    { id: 'submissao-editoras', title: 'Submissão a editoras', group: 'Publicação e carreira', description: 'Guia para preparar manuscrito, sinopse, proposta editorial e abordagem a editoras.', file: 'submissao-editoras.html',
      bridge: { action: 'cartorio', label: 'Abrir Cartório da obra', hint: 'Gere o selo SHA-256 e audite a origem antes de enviar.' } },
    { id: 'comparativo-publicacao', title: 'Comparativo de publicação', group: 'Publicação e carreira', description: 'Guia para comparar publicação independente, tradicional e híbrida.', file: 'comparativo-publicacao.html',
      bridge: { action: 'cartorio', label: 'Conferir Cartório da obra', hint: 'Revise a certificação de autoria antes de decidir o caminho.' } },
    { id: 'checklist-lancamento', title: 'Checklist de lançamento', group: 'Publicação e carreira', description: 'Guia para conferir manuscrito, capa, ISBN, sinopse e comunicação.', file: 'checklist-lancamento.html',
      bridge: { action: 'cartorio', label: 'Auditar mesa no Cartório', hint: 'Verifique selo e integridade da mesa antes de publicar.' } },
    { id: 'mentalidade-autor-publicado', title: 'Mentalidade de autor', group: 'Publicação e carreira', description: 'Guia para lidar com perfeccionismo, rejeição e continuidade de carreira.', file: 'mentalidade-autor-publicado.html',
      bridge: { action: 'write', label: 'Retomar a escrita', hint: 'Volte para a folha no seu próprio ritmo.' } },
    { id: 'publicar-kdp', title: 'Publicar no Amazon KDP', group: 'Publicação e carreira', description: 'Guia para publicar seu livro no Kindle Direct Publishing, do título à precificação.', file: 'publicar-kdp.html',
      bridge: { action: 'calculator', label: 'Calcular páginas do livro', hint: 'Estime extensão e páginas para publicação independente.' } }
  ];

  var GROUP_ICONS = {
    'Objeto livro': 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20',
    'Literatura': 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
    'Escrita e revisão': 'M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z',
    'Publicação e carreira': 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5'
  };

  function makeGroupIcon(groupName) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS ? document.createElementNS(ns, 'svg') : document.createElement('svg');
    svg.setAttribute('class', 'esc-ui-ico');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.75');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var d = GROUP_ICONS[groupName] || GROUP_ICONS['Objeto livro'];
    var parts = d.split(' M');
    var i;
    for (i = 0; i < parts.length; i += 1) {
      var p = document.createElementNS ? document.createElementNS(ns, 'path') : document.createElement('path');
      p.setAttribute('d', (i === 0 ? '' : 'M') + parts[i]);
      svg.appendChild(p);
    }
    return svg;
  }

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }

  function findEntry(id) {
    var i;
    for (i = 0; i < CATALOG.length; i += 1) {
      if (CATALOG[i].id === id) { return CATALOG[i]; }
    }
    return null;
  }

  function recommendForContext(ctx) {
    var info = ctx && typeof ctx === 'object' ? ctx : {};
    var words = Number(info.words) || 0;
    var hasTitle = !!info.hasTitle;
    var stageId, stageLabel, stageNote, ids;

    if (words <= 0) {
      stageId = 'blank';
      stageLabel = 'Folha em branco';
      stageNote = 'A bancada está limpa para começar do zero — escolha um arranque ou aqueça o ritmo.';
      ids = ['primeiras-linhas', 'bloqueio-criativo'];
    } else if (words < 600 && !hasTitle) {
      stageId = 'untitled';
      stageLabel = 'Primeiras páginas sem título';
      stageNote = 'Seu texto já nasceu (' + words + (words === 1 ? ' palavra' : ' palavras') + '). Você pode batizar a folha ou aprofundar a abertura.';
      ids = ['titulo-do-livro', 'primeiras-linhas'];
    } else if (words < 600) {
      stageId = 'drafting';
      stageLabel = 'Rascunho em formação';
      stageNote = 'Esta folha tem ' + words + (words === 1 ? ' palavra' : ' palavras') + '. Bom momento para sustentar o fôlego ou ler em busca de ressonância.';
      ids = ['bloqueio-criativo', 'literatura-mundial'];
    } else if (words < 2500) {
      stageId = 'revising';
      stageLabel = 'Texto em desenvolvimento';
      stageNote = 'Com ' + words + ' palavras na folha, já vale observar estrutura em camadas e o corpo editorial do livro.';
      ids = ['revisao-manuscrito', 'objeto-livro'];
    } else {
      stageId = 'manuscript';
      stageLabel = 'Manuscrito encorpado';
      stageNote = 'Esta folha já soma ' + words + ' palavras — hora de lapidar em camadas e planejar o caminho da publicação.';
      ids = ['revisao-manuscrito', 'mapa-lancamento-editorial'];
    }

    var guides = [], i, entry;
    for (i = 0; i < ids.length; i += 1) {
      entry = findEntry(ids[i]);
      if (entry) { guides.push(entry); }
    }
    return {
      stageId: stageId,
      stageLabel: stageLabel,
      stageNote: stageNote,
      guides: guides
    };
  }

  root.Escr.academy = {
    catalog: function () { return CATALOG.slice(); },
    find: findEntry,
    recommendForContext: recommendForContext
  };

  root.Escr.mountAcademy = function (opts) {
    opts = opts || {};
    var storage = opts.storage || null;
    var getContext = typeof opts.getContext === 'function' ? opts.getContext : null;
    var onAction = typeof opts.onAction === 'function' ? opts.onAction : null;
    var modalEl = null;
    var currentMode = null;
    var activeEntry = null;
    var prevFocus = null;

    function readLastGuideId() {
      try {
        var saved = storage ? storage.getItem(LAST_GUIDE_KEY) : null;
        return saved && findEntry(saved) ? saved : null;
      } catch (ignore) { return null; }
    }

    function writeLastGuideId(id) {
      try {
        if (storage && id) { storage.setItem(LAST_GUIDE_KEY, String(id)); }
      } catch (ignore) {}
    }

    function buildModal() {
      if (modalEl) { return modalEl; }
      var sec = document.createElement('section');
      sec.id = 'esc-academy-overlay';
      sec.className = 'esc-academy-overlay';
      sec.setAttribute('role', 'dialog');
      sec.setAttribute('aria-modal', 'true');
      sec.setAttribute('aria-label', 'Academia Escrevaral');
      sec.hidden = true;
      document.body.appendChild(sec);
      modalEl = sec;

      on(document, 'keydown', function (ev) {
        if (!modalEl || modalEl.hidden) { return; }
        if (ev.keyCode === 27) {
          ev.preventDefault();
          ev.stopPropagation();
          close();
        }
      });

      on(window, 'message', function (ev) {
        if (!modalEl || modalEl.hidden || !ev.data || ev.data.channel !== 'escrevaral-academia') { return; }
        if (ev.data.action === 'close') { close(); }
        else if (ev.data.action === 'back') { openList(); }
        else if (ev.data.action === 'open' && ev.data.id) { openGuide(ev.data.id); }
      });

      return modalEl;
    }

    function openList() {
      buildModal();
      if (!prevFocus) { prevFocus = document.activeElement; }
      currentMode = 'list';
      activeEntry = null;
      modalEl.textContent = '';

      var card = document.createElement('div');
      card.className = 'esc-academy-list-card';
      if (root.Escr.ornaments && root.Escr.ornaments.attachCorners) {
        root.Escr.ornaments.attachCorners(card, 'subtle');
      }

      var head = document.createElement('header');
      head.className = 'esc-academy-head';
      var h2 = document.createElement('h2');
      h2.textContent = 'Academia e Literatura Mundial';
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'esc-academy-close';
      closeBtn.textContent = '← Voltar · Esc';
      on(closeBtn, 'click', close);
      head.appendChild(h2);
      head.appendChild(closeBtn);
      card.appendChild(head);

      var intro = document.createElement('p');
      intro.className = 'esc-academy-intro';
      intro.textContent = 'Guias editoriais offline, anatomia do livro e acervo de literatura mundial com leitor próprio.';
      card.appendChild(intro);

      var body = document.createElement('div');
      body.className = 'esc-academy-groups';

      /* Ponte contextual Academia ↔ Oficina (lê apenas resumo métrico local, jamais exposto aos iframes) */
      var lastId = readLastGuideId();
      var lastEntry = lastId ? findEntry(lastId) : null;
      var rec = getContext ? recommendForContext(getContext()) : null;
      if (rec || lastEntry) {
        var bridgeBox = document.createElement('section');
        bridgeBox.className = 'esc-academy-bridge-box';
        bridgeBox.setAttribute('aria-label', 'Sugestões para o momento da sua oficina');

        var bHead = document.createElement('div');
        bHead.className = 'esc-academy-bridge-head';
        var bKicker = document.createElement('span');
        bKicker.className = 'esc-academy-bridge-kicker';
        bKicker.textContent = rec ? ('Na sua oficina · ' + rec.stageLabel) : 'Na sua oficina';
        bHead.appendChild(bKicker);
        if (lastEntry) {
          var resumeBtn = document.createElement('button');
          resumeBtn.type = 'button';
          resumeBtn.className = 'esc-academy-resume-btn';
          resumeBtn.setAttribute('data-academy-resume', lastEntry.id);
          resumeBtn.textContent = 'Continuar: ' + lastEntry.title + ' →';
          on(resumeBtn, 'click', function () { openGuide(lastEntry.id); });
          bHead.appendChild(resumeBtn);
        }
        bridgeBox.appendChild(bHead);

        if (rec) {
          var bNote = document.createElement('p');
          bNote.className = 'esc-academy-bridge-note';
          bNote.textContent = rec.stageNote;
          bridgeBox.appendChild(bNote);

          var recRow = document.createElement('div');
          recRow.className = 'esc-academy-rec-row';
          var ri;
          for (ri = 0; ri < rec.guides.length; ri += 1) {
            (function (g) {
              var rBtn = document.createElement('button');
              rBtn.type = 'button';
              rBtn.className = 'esc-academy-rec-btn';
              rBtn.setAttribute('data-academy-rec', g.id);
              var rTitle = document.createElement('strong');
              rTitle.textContent = g.title;
              var rHint = document.createElement('span');
              rHint.textContent = (g.bridge && g.bridge.hint) ? g.bridge.hint : g.description;
              rBtn.appendChild(rTitle);
              rBtn.appendChild(rHint);
              on(rBtn, 'click', function () { openGuide(g.id); });
              recRow.appendChild(rBtn);
            }(rec.guides[ri]));
          }
          bridgeBox.appendChild(recRow);
        }

        body.appendChild(bridgeBox);
        if (root.Escr.ornaments && root.Escr.ornaments.createStairRod) {
          body.appendChild(root.Escr.ornaments.createStairRod('wide'));
        }
      }

      var lastGroup = '', ul = null, groupCount = 0;
      CATALOG.forEach(function (entry) {
        if (entry.group !== lastGroup) {
          if (groupCount > 0 && root.Escr.ornaments && root.Escr.ornaments.createStairRod) {
            body.appendChild(root.Escr.ornaments.createStairRod('wide'));
          }
          groupCount += 1;
          lastGroup = entry.group;
          var gh = document.createElement('h3');
          gh.className = 'esc-academy-group';
          gh.appendChild(makeGroupIcon(lastGroup));
          var gt = document.createElement('span');
          gt.textContent = lastGroup;
          gh.appendChild(gt);
          body.appendChild(gh);
          ul = document.createElement('ul');
          ul.className = 'esc-academy-list';
          body.appendChild(ul);
        }
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'esc-academy-item';
        btn.setAttribute('data-academy-id', entry.id);
        var strong = document.createElement('strong');
        strong.textContent = entry.title;
        var desc = document.createElement('span');
        desc.textContent = entry.description;
        btn.appendChild(strong);
        btn.appendChild(desc);
        on(btn, 'click', function () { openGuide(entry.id); });
        li.appendChild(btn);
        ul.appendChild(li);
      });
      card.appendChild(body);
      modalEl.appendChild(card);
      modalEl.hidden = false;
      closeBtn.focus();
    }

    function openGuide(id) {
      var entry = findEntry(id);
      if (!entry) { return; }
      buildModal();
      if (!prevFocus) { prevFocus = document.activeElement; }
      currentMode = 'guide';
      activeEntry = entry;
      writeLastGuideId(entry.id);
      modalEl.textContent = '';

      var shell = document.createElement('div');
      shell.className = 'esc-academy-guide-shell';

      var bar = document.createElement('header');
      bar.className = 'esc-academy-bar';
      var backBtn = document.createElement('button');
      backBtn.type = 'button';
      backBtn.textContent = '← Voltar à Academia';
      on(backBtn, 'click', openList);
      var titleSpan = document.createElement('strong');
      titleSpan.textContent = entry.title;
      var actions = document.createElement('div');
      actions.className = 'esc-academy-bar-actions';
      if (entry.bridge && onAction) {
        var actBtn = document.createElement('button');
        actBtn.type = 'button';
        actBtn.className = 'esc-academy-bridge-act';
        actBtn.setAttribute('data-academy-action', entry.bridge.action);
        actBtn.title = entry.bridge.hint || '';
        actBtn.textContent = entry.bridge.label + ' →';
        on(actBtn, 'click', function () {
          var actionId = entry.bridge.action;
          var guideEntry = entry;
          close();
          onAction(actionId, guideEntry);
        });
        actions.appendChild(actBtn);
      }
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.textContent = 'Fechar · Esc';
      on(closeBtn, 'click', close);
      actions.appendChild(closeBtn);
      bar.appendChild(backBtn);
      bar.appendChild(titleSpan);
      bar.appendChild(actions);
      shell.appendChild(bar);

      var frame = document.createElement('iframe');
      frame.className = 'esc-academy-frame';
      frame.title = entry.title;
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      on(frame, 'load', function () {
        try {
          var body = document.body;
          var cs = window.getComputedStyle && body ? window.getComputedStyle(body) : null;
          var paper = cs ? (cs.getPropertyValue('--esc-bg') || '#c4cfc2').replace(/^\s+|\s+$/g, '') : '#c4cfc2';
          var ink = cs ? (cs.getPropertyValue('--esc-ink') || '#212921').replace(/^\s+|\s+$/g, '') : '#212921';
          var accent = cs ? (cs.getPropertyValue('--esc-weave-bg') || '#242d23').replace(/^\s+|\s+$/g, '') : '#242d23';
          if (frame.contentWindow && frame.contentWindow.postMessage) {
            frame.contentWindow.postMessage({ channel: 'escrevaral-academia-theme', colors: { paper: paper, ink: ink, accent: accent }, comfortable: !!(body && body.getAttribute('data-esc-reading') === 'comfortable') }, '*');
          }
        } catch (ignore) {}
      });
      frame.src = 'academia/' + entry.file;
      shell.appendChild(frame);

      modalEl.appendChild(shell);
      modalEl.hidden = false;
      backBtn.focus();
    }

    function close() {
      currentMode = null;
      activeEntry = null;
      if (modalEl) {
        modalEl.hidden = true;
        modalEl.textContent = '';
      }
      if (prevFocus && prevFocus.focus) { prevFocus.focus(); }
      prevFocus = null;
    }

    return {
      openList: openList,
      openGuide: openGuide,
      close: close,
      isOpen: function () { return !!(modalEl && !modalEl.hidden); }
    };
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/cartorio.js */
/* Interface do Cartório do Escrevaral: selo ao vivo da mesa e verificação de arquivos .scrvrl. ES5. */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};
  var E = root.Escr;

  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }
  function mk(tag, cls, txt) {
    var el = document.createElement(tag);
    if (cls) { el.className = cls; }
    if (typeof txt !== 'undefined' && txt !== null) { el.textContent = String(txt); }
    return el;
  }
  function fmtDate(iso) {
    if (!iso) { return '—'; }
    try { return new Date(iso).toLocaleString('pt-BR'); }
    catch (e) { return iso; }
  }
  function fmtNum(n) {
    try { return Number(n || 0).toLocaleString('pt-BR'); }
    catch (e) { return String(n || 0); }
  }
  function shortHash(h) {
    if (!h || h.length < 16) { return h || '—'; }
    return h.slice(0, 12) + '…' + h.slice(-12);
  }
  function copyText(text, onDone) {
    var done = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { onDone(true); }, function () { fallbackCopy(text, onDone); });
        done = true;
      }
    } catch (ignore) {}
    if (!done) { fallbackCopy(text, onDone); }
  }
  function fallbackCopy(text, onDone) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand && document.execCommand('copy');
      document.body.removeChild(ta);
      onDone(!!ok);
    } catch (e) { onDone(false); }
  }

  function statusTone(status) {
    if (status === 'verified_clean' || status === 'integro_sem_colagem') { return 'clean'; }
    if (status === 'tampered' || status === 'adulterado') { return 'danger'; }
    if (status === 'verified_with_paste' || status === 'verified_imported' || status === 'integro_com_ressalvas') { return 'warn'; }
    return 'neutral';
  }

  E.mountCartorio = function (opts) {
    opts = opts || {};
    var overlay = null, activeTab = 'desk', lastReport = null, lastFileName = '';
    var deskBody = null, verifyBody = null, tabDeskBtn = null, tabVerifyBtn = null, statusBanner = null;
    var dropZone = null, fileInput = null, pasteBox = null, pasteToggleBtn = null, pasteWrap = null;
    var verifyOutput = null;

    function announce(msg) {
      if (statusBanner) { statusBanner.textContent = msg || ''; }
    }

    function openPrintWindow(report, fileName) {
      var textCert = E.cartorio.formatCertificateText(report, fileName);
      var win = null;
      try { win = root.open('', '_blank', 'width=860,height=920'); } catch (ignore) {}
      if (!win) {
        if (opts.download) {
          opts.download(textCert, 'text/plain', 'certificado-cartorio-escrevaral.txt');
          announce('Certificado baixado como texto (.txt).');
        }
        return;
      }
      var doc = win.document;
      doc.open();
      doc.write(
        '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
        '<title>Certificado do Cartório — Escrevaral</title>' +
        '<style>' +
        'body{font-family:Georgia,"Times New Roman",serif;background:#f8f5ef;color:#1e2320;margin:0;padding:36px 24px;}' +
        '.sheet{max-width:760px;margin:0 auto;background:#fffdf9;border:1px solid #c9c2b2;padding:38px 44px;box-shadow:0 6px 24px rgba(0,0,0,.06);}' +
        '.masthead{border-top:3px double #1e2320;border-bottom:1px solid #1e2320;padding:10px 0;margin-bottom:22px;display:flex;justify-content:space-between;font:600 11px/1.3 Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase;}' +
        'h1{margin:0 0 6px;font:700 24px/1.2 Georgia,serif;}' +
        '.sub{margin:0 0 20px;color:#4a544c;font-size:14px;}' +
        'pre{white-space:pre-wrap;word-break:break-word;font:12.5px/1.65 "Courier New",Courier,monospace;background:#f7f4ec;border:1px solid #dcd5c5;padding:18px;border-radius:3px;}' +
        '.actions{margin-top:18px;text-align:right;}' +
        '.actions button{padding:8px 16px;font:600 13px Arial,sans-serif;cursor:pointer;background:#1e2320;color:#f8f5ef;border:0;border-radius:3px;}' +
        '@media print{body{background:#fff;padding:0;}.sheet{border:0;box-shadow:none;padding:0;}.actions{display:none;}}' +
        '</style></head><body><div class="sheet">' +
        '<div class="masthead"><span>CARTÓRIO DO ESCREVARAL</span><span>CERTIFICADO DE ORIGEM E PROCESSO</span></div>' +
        '<h1>Certificado de Verificação</h1>' +
        '<p class="sub">Emitido offline pela oficina Escrevaral — conferência criptográfica SHA-256.</p>' +
        '<pre id="cert-pre"></pre>' +
        '<div class="actions"><button type="button" onclick="window.print()">Imprimir / Salvar em PDF</button></div>' +
        '</div></body></html>'
      );
      doc.close();
      var pre = doc.getElementById('cert-pre');
      if (pre) { pre.textContent = textCert; }
    }

    function renderReportCard(container, report, fileName, isLiveDesk) {
      container.textContent = '';
      var tone = statusTone(report.verdict);

      var cert = mk('article', 'cart-cert cart-tone-' + tone);
      if (E.ornaments && E.ornaments.attachCorners) {
        E.ornaments.attachCorners(cert, 'subtle');
      }
      var mast = mk('div', 'cart-cert-mast');
      mast.appendChild(mk('span', '', 'CARTÓRIO DO ESCREVARAL'));
      mast.appendChild(mk('span', '', isLiveDesk ? 'AUDITORIA AO VIVO DA MESA' : 'CONFERÊNCIA DE ARQUIVO'));
      cert.appendChild(mast);

      var badgeRow = mk('div', 'cart-verdict-row');
      var stamp = mk('span', 'cart-stamp cart-stamp-' + tone,
        tone === 'clean' ? 'SELO ÍNTEGRO' :
        tone === 'danger' ? 'ADULTERADO' :
        tone === 'warn' ? 'ÍNTEGRO · COM RESSALVAS' : 'SEM SELO'
      );
      badgeRow.appendChild(stamp);
      if (fileName) {
        badgeRow.appendChild(mk('span', 'cart-file-chip', fileName));
      }
      cert.appendChild(badgeRow);

      cert.appendChild(mk('h3', 'cart-verdict-title', report.verdictTitle));
      cert.appendChild(mk('p', 'cart-verdict-summary', report.verdictSummary));
      if (E.ornaments && E.ornaments.createStairRod) {
        cert.appendChild(E.ornaments.createStairRod('compact'));
      }

      /* Grade de métricas principais */
      var metrics = mk('div', 'cart-metrics');
      var items = [
        { k: 'Folhas verificadas', v: fmtNum(report.totals.documents) },
        { k: 'Palavras', v: fmtNum(report.totals.words) },
        { k: 'Revisões encadeadas', v: fmtNum(report.totals.revisions) },
        { k: 'Toques registrados', v: fmtNum(report.totals.keystrokes) },
        { k: 'Colagens externas', v: fmtNum(report.totals.externalPastes) + (report.totals.externalPasteChars ? ' (' + fmtNum(report.totals.externalPasteChars) + ' car.)' : '') },
        { k: 'Colagens bloqueadas', v: fmtNum(report.totals.blockedPastes) }
      ];
      var i;
      for (i = 0; i < items.length; i += 1) {
        var box = mk('div', 'cart-metric');
        box.appendChild(mk('span', 'cart-metric-k', items[i].k));
        box.appendChild(mk('strong', 'cart-metric-v', items[i].v));
        metrics.appendChild(box);
      }
      cert.appendChild(metrics);

      /* Bloco SHA-256 */
      var hashBox = mk('div', 'cart-hash-box');
      var hashTop = mk('div', 'cart-hash-top');
      hashTop.appendChild(mk('span', 'cart-hash-label', isLiveDesk ? 'IMPRESSÃO DIGITAL DA MESA (SHA-256)' : 'IMPRESSÃO DIGITAL DO PACOTE (SHA-256)'));
      var copyBtn = mk('button', 'cart-mini-btn', 'Copiar SHA-256');
      copyBtn.type = 'button';
      on(copyBtn, 'click', function () {
        copyText(report.packageHash, function (ok) {
          announce(ok ? 'Código SHA-256 copiado para a área de transferência.' : 'Selecione o código SHA-256 para copiar.');
        });
      });
      hashTop.appendChild(copyBtn);
      hashBox.appendChild(hashTop);
      hashBox.appendChild(mk('code', 'cart-hash-code', report.packageHash));
      cert.appendChild(hashBox);

      /* Ações do certificado */
      var actions = mk('div', 'cart-actions');
      if (isLiveDesk && opts.onExportSealed) {
        var expBtn = mk('button', 'cart-btn-primary', 'Exportar mesa selada (.scrvrl)');
        expBtn.type = 'button';
        on(expBtn, 'click', function () {
          opts.onExportSealed();
          announce('Mesa selada exportada (.scrvrl). Ela já pode ser conferida na aba “Verificar arquivo” ou enviada a um editor.');
        });
        actions.appendChild(expBtn);
      }
      var printBtn = mk('button', 'cart-btn-secondary', 'Imprimir / Guardar certificado');
      printBtn.type = 'button';
      on(printBtn, 'click', function () { openPrintWindow(report, fileName); });
      actions.appendChild(printBtn);

      var copyCertBtn = mk('button', 'cart-btn-secondary', 'Copiar relatório em texto');
      copyCertBtn.type = 'button';
      on(copyCertBtn, 'click', function () {
        copyText(E.cartorio.formatCertificateText(report, fileName), function (ok) {
          announce(ok ? 'Relatório completo do Cartório copiado.' : 'Não foi possível copiar automaticamente.');
        });
      });
      actions.appendChild(copyCertBtn);
      cert.appendChild(actions);

      /* Livro de folhas */
      if (report.documents.length) {
        var ledgerHead = mk('h4', 'cart-section-h', 'Livro de folhas verificadas (' + report.documents.length + ')');
        cert.appendChild(ledgerHead);

        var list = mk('div', 'cart-doc-list');
        for (i = 0; i < report.documents.length; i += 1) {
          (function (d) {
            var dTone = statusTone(d.status);
            var row = mk('div', 'cart-doc-row cart-doc-' + dTone);

            var top = mk('div', 'cart-doc-top');
            var titleWrap = mk('div', 'cart-doc-title-wrap');
            titleWrap.appendChild(mk('strong', 'cart-doc-title', d.title));
            titleWrap.appendChild(mk('span', 'cart-doc-project', d.project));
            top.appendChild(titleWrap);
            top.appendChild(mk('span', 'cart-doc-badge cart-stamp-' + dTone, d.label));
            row.appendChild(top);

            row.appendChild(mk('p', 'cart-doc-detail', d.detail));

            var stats = mk('div', 'cart-doc-stats');
            stats.appendChild(mk('span', '', fmtNum(d.words) + ' palavras'));
            stats.appendChild(mk('span', '', fmtNum(d.chainLength || d.revision) + ' revisões'));
            stats.appendChild(mk('span', '', fmtNum(d.keystrokes) + ' toques'));
            stats.appendChild(mk('span', '', 'Colagens externas: ' + fmtNum(d.externalPastes)));
            stats.appendChild(mk('span', '', 'Texto SHA-256: ' + shortHash(d.contentHash)));
            row.appendChild(stats);

            if (d.trail && d.trail.length) {
              var details = mk('details', 'cart-trail-details');
              details.appendChild(mk('summary', '', 'Ver trilha criptográfica (' + d.trail.length + ' elo' + (d.trail.length === 1 ? '' : 's') + ')'));
              var ol = mk('ol', 'cart-trail-list');
              var tIdx, item, li;
              var startIdx = Math.max(0, d.trail.length - 12);
              for (tIdx = startIdx; tIdx < d.trail.length; tIdx += 1) {
                item = d.trail[tIdx];
                li = mk('li', '');
                li.appendChild(mk('strong', '', 'Rev. ' + item.rev));
                li.appendChild(mk('span', '', ' · ' + fmtDate(item.at) + ' · ' + fmtNum(item.words) + ' pal. · ' + fmtNum(item.keys) + ' toques · ext: ' + fmtNum(item.extPastes) + ' · '));
                li.appendChild(mk('code', '', shortHash(item.hash)));
                ol.appendChild(li);
              }
              details.appendChild(ol);
              row.appendChild(details);
            }

            list.appendChild(row);
          }(report.documents[i]));
        }
        cert.appendChild(list);
      }

      /* Nota de transparência jurídica (Camada 1 + Camada 2) */
      var legal = mk('footer', 'cart-transparency');
      legal.appendChild(mk('strong', '', 'Transparência e escopo da verificação'));
      legal.appendChild(mk('p', '',
        'Camada 1 (100% offline): a cadeia SHA-256 comprova a integridade do arquivo exportado e a trilha de criação registrada dentro do Escrevaral, distinguindo escrita nativa, colagens externas e importações.'
      ));
      legal.appendChild(mk('p', '',
        'Camada 2 (anterioridade jurídica externa): as datas provêm do relógio do aparelho. Quando uma editora ou registro jurídico exigir prova independente de data, utilize o código SHA-256 acima para ancoragem externa (Biblioteca Nacional, carimbo de tempo ou protocolo editorial).'
      ));
      if (typeof opts.onOpenAcademy === 'function') {
        var studyRow = mk('div', 'cart-academy-bridge');
        studyRow.appendChild(mk('span', 'cart-academy-bridge-label', 'Na Academia:'));
        var subBtn = mk('button', 'cart-academy-link', 'Submissão a editoras →');
        subBtn.type = 'button';
        on(subBtn, 'click', function () { close(); opts.onOpenAcademy('submissao-editoras'); });
        var chkBtn = mk('button', 'cart-academy-link', 'Checklist de lançamento →');
        chkBtn.type = 'button';
        on(chkBtn, 'click', function () { close(); opts.onOpenAcademy('checklist-lancamento'); });
        studyRow.appendChild(subBtn);
        studyRow.appendChild(chkBtn);
        legal.appendChild(studyRow);
      }
      cert.appendChild(legal);

      container.appendChild(cert);
    }

    function refreshDeskTab() {
      if (!deskBody) { return; }
      deskBody.textContent = '';

      /* Cartão rápido de proteção da oficina (modo colagem restrita) */
      var guardBar = mk('div', 'cart-guard-bar');
      var guardText = mk('div', 'cart-guard-text');
      guardText.appendChild(mk('strong', '', 'Modo colagem restrita na oficina'));
      guardText.appendChild(mk('span', '', 'Quando ligado, impede colagens de fora do Escrevaral para manter o manuscrito 100% digitado na oficina.'));
      guardBar.appendChild(guardText);

      var restrictedOn = opts.isRestrictedPaste ? !!opts.isRestrictedPaste() : false;
      var guardBtn = mk('button', 'cart-guard-toggle', restrictedOn ? 'Restrição ativa · ON' : 'Permitindo colagem · OFF');
      guardBtn.type = 'button';
      guardBtn.setAttribute('aria-pressed', restrictedOn ? 'true' : 'false');
      on(guardBtn, 'click', function () {
        if (opts.onToggleRestrictedPaste) {
          var next = !!opts.onToggleRestrictedPaste();
          guardBtn.setAttribute('aria-pressed', next ? 'true' : 'false');
          guardBtn.textContent = next ? 'Restrição ativa · ON' : 'Permitindo colagem · OFF';
          announce(next ? 'Colagem externa bloqueada. Tudo que você escrever agora fica sob regime puro do Cartório.' : 'Colagem externa permitida (continuará sendo registrada com transparência no Cartório).');
        }
      });
      guardBar.appendChild(guardBtn);
      deskBody.appendChild(guardBar);

      /* Gera pacote selado em memória (sem modificar nada) e verifica */
      var reportHost = mk('div', 'cart-report-host');
      deskBody.appendChild(reportHost);
      try {
        if (opts.checkpoint) { opts.checkpoint(); }
        var pack = opts.buildCurrentPackage ? opts.buildCurrentPackage() : null;
        if (!pack) {
          reportHost.appendChild(mk('p', 'cart-empty', 'Escreva e salve uma folha para gerar o primeiro selo criptográfico do Cartório.'));
          return;
        }
        var report = E.cartorio.verifyPackage(pack);
        lastReport = report;
        lastFileName = 'Mesa atual do Escrevaral';
        renderReportCard(reportHost, report, lastFileName, true);
      } catch (e) {
        reportHost.appendChild(mk('p', 'cart-error', e && e.message ? e.message : 'Não foi possível auditar a mesa atual.'));
      }
    }

    function runFileVerification(rawText, fileName) {
      if (!verifyOutput) { return; }
      verifyOutput.textContent = '';
      try {
        var report = E.cartorio.verifyPackage(rawText);
        lastReport = report;
        lastFileName = fileName || 'Arquivo enviado';
        renderReportCard(verifyOutput, report, lastFileName, false);
        announce('Verificação concluída: ' + report.verdictTitle + '.');
      } catch (e) {
        verifyOutput.appendChild(mk('p', 'cart-error', e && e.message ? e.message : 'Não foi possível verificar este arquivo.'));
        announce('O arquivo não pôde ser verificado.');
      }
    }

    function handleFile(file) {
      if (!file) { return; }
      if (file.size > 50000000) {
        announce('Envie arquivos de até 50 MB.');
        return;
      }
      E.transfer.read(file, function (err, content) {
        if (err) {
          announce(err.message || 'Erro ao ler o arquivo.');
          return;
        }
        runFileVerification(content, file.name);
      });
    }

    function setTab(name) {
      activeTab = name;
      if (tabDeskBtn) { tabDeskBtn.setAttribute('aria-pressed', name === 'desk' ? 'true' : 'false'); }
      if (tabVerifyBtn) { tabVerifyBtn.setAttribute('aria-pressed', name === 'verify' ? 'true' : 'false'); }
      if (deskBody) { deskBody.hidden = name !== 'desk'; }
      if (verifyBody) { verifyBody.hidden = name !== 'verify'; }
      announce('');
      if (name === 'desk') { refreshDeskTab(); }
    }

    function buildOverlay() {
      if (overlay) { return overlay; }
      overlay = mk('div', 'esc-cartorio-overlay');
      overlay.id = 'esc-cartorio-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'cart-heading');
      overlay.hidden = true;

      var card = mk('div', 'esc-cartorio-card');

      var head = mk('header', 'cart-head');
      var headText = mk('div', '');
      headText.appendChild(mk('small', 'cart-eyebrow', 'ESCREVARAL · PROVA DE ORIGEM E PROCESSO'));
      var h2 = mk('h2', '', 'Cartório');
      h2.id = 'cart-heading';
      headText.appendChild(h2);
      head.appendChild(headText);

      var closeBtn = mk('button', 'cart-close', '← Voltar à escrita');
      closeBtn.type = 'button';
      closeBtn.id = 'cartorio-close';
      on(closeBtn, 'click', close);
      head.appendChild(closeBtn);
      card.appendChild(head);

      var nav = mk('nav', 'cart-tabs');
      nav.setAttribute('aria-label', 'Modos do Cartório');
      tabDeskBtn = mk('button', 'cart-tab', 'Esta mesa (selo ao vivo)');
      tabDeskBtn.type = 'button';
      tabDeskBtn.id = 'cartorio-tab-desk';
      tabDeskBtn.setAttribute('aria-pressed', 'true');
      on(tabDeskBtn, 'click', function () { setTab('desk'); });

      tabVerifyBtn = mk('button', 'cart-tab', 'Verificar arquivo (.scrvrl)');
      tabVerifyBtn.type = 'button';
      tabVerifyBtn.id = 'cartorio-tab-verify';
      tabVerifyBtn.setAttribute('aria-pressed', 'false');
      on(tabVerifyBtn, 'click', function () { setTab('verify'); });

      nav.appendChild(tabDeskBtn);
      nav.appendChild(tabVerifyBtn);
      card.appendChild(nav);

      statusBanner = mk('p', 'cart-status', '');
      statusBanner.id = 'cartorio-status';
      statusBanner.setAttribute('role', 'status');
      statusBanner.setAttribute('aria-live', 'polite');
      card.appendChild(statusBanner);

      var scroll = mk('div', 'cart-scroll');

      deskBody = mk('section', 'cart-pane');
      deskBody.id = 'cartorio-desk-pane';
      scroll.appendChild(deskBody);

      verifyBody = mk('section', 'cart-pane');
      verifyBody.id = 'cartorio-verify-pane';
      verifyBody.hidden = true;

      /* Drop-zone para despejar arquivo .scrvrl */
      dropZone = mk('div', 'cart-dropzone');
      dropZone.id = 'cartorio-dropzone';
      dropZone.appendChild(mk('strong', 'cart-drop-title', 'Despeje uma mesa exportada (.scrvrl) para verificar'));
      dropZone.appendChild(mk('p', 'cart-drop-sub', 'Leitura somente de conferência: seus textos atuais não são alterados nem misturados. Ideal para escritores e editores conferirem origem e integridade.'));

      var dropBtns = mk('div', 'cart-drop-actions');
      var fileLabel = mk('label', 'cart-btn-primary cart-file-btn', 'Escolher arquivo .scrvrl');
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'cartorio-file-input';
      fileInput.accept = '.scrvrl,.json,application/json';
      on(fileInput, 'change', function () {
        if (fileInput.files && fileInput.files[0]) {
          handleFile(fileInput.files[0]);
          fileInput.value = '';
        }
      });
      fileLabel.appendChild(fileInput);
      dropBtns.appendChild(fileLabel);

      pasteToggleBtn = mk('button', 'cart-btn-secondary', 'Ou colar conteúdo JSON');
      pasteToggleBtn.type = 'button';
      on(pasteToggleBtn, 'click', function () {
        pasteWrap.hidden = !pasteWrap.hidden;
        if (!pasteWrap.hidden) { pasteBox.focus(); }
      });
      dropBtns.appendChild(pasteToggleBtn);
      dropZone.appendChild(dropBtns);

      on(dropZone, 'dragover', function (ev) {
        ev.preventDefault();
        dropZone.classList.add('is-dragover');
      });
      on(dropZone, 'dragleave', function () {
        dropZone.classList.remove('is-dragover');
      });
      on(dropZone, 'drop', function (ev) {
        ev.preventDefault();
        dropZone.classList.remove('is-dragover');
        if (ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]) {
          handleFile(ev.dataTransfer.files[0]);
        }
      });

      verifyBody.appendChild(dropZone);

      pasteWrap = mk('div', 'cart-paste-wrap');
      pasteWrap.hidden = true;
      pasteBox = document.createElement('textarea');
      pasteBox.id = 'cartorio-paste-input';
      pasteBox.rows = 5;
      pasteBox.placeholder = 'Cole aqui o conteúdo completo de um arquivo .scrvrl…';
      pasteBox.spellcheck = false;
      pasteWrap.appendChild(pasteBox);
      var runPasteBtn = mk('button', 'cart-btn-primary', 'Conferir conteúdo colado');
      runPasteBtn.type = 'button';
      runPasteBtn.id = 'cartorio-paste-run';
      on(runPasteBtn, 'click', function () {
        runFileVerification(pasteBox.value || '', 'Conteúdo colado');
      });
      pasteWrap.appendChild(runPasteBtn);
      verifyBody.appendChild(pasteWrap);

      verifyOutput = mk('div', 'cart-verify-output');
      verifyOutput.id = 'cartorio-verify-output';
      verifyBody.appendChild(verifyOutput);

      scroll.appendChild(verifyBody);
      card.appendChild(scroll);
      overlay.appendChild(card);

      on(overlay, 'click', function (ev) {
        if (ev.target === overlay) { close(); }
      });
      on(document, 'keydown', function (ev) {
        if (ev.keyCode === 27 && overlay && !overlay.hidden) {
          ev.preventDefault();
          close();
        }
      });

      document.body.appendChild(overlay);
      return overlay;
    }

    function open(initialTab) {
      buildOverlay();
      overlay.hidden = false;
      setTab(initialTab === 'verify' ? 'verify' : 'desk');
      if (tabDeskBtn) { tabDeskBtn.focus(); }
    }

    function close() {
      if (overlay) { overlay.hidden = true; }
      if (opts.onClose) { opts.onClose(); }
    }

    return {
      open: open,
      close: close,
      verifyText: function (raw, name) { open('verify'); runFileVerification(raw, name || 'Arquivo'); }
    };
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/storage/atalhos.js */
/* Atalhos salvos (visões dinâmicas com filtros e contador ao vivo) — ES5 */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var KEY = 'escrevaral.shortcuts.v1';
  var OPERATORS = [
    ['includes', 'Cont\u00E9m'],
    ['startsWith', 'Come\u00E7a com'],
    ['=', '\u00C9 igual a']
  ];

  function norm(s) {
    var v = String(s || '').replace(/^\s+|\s+$/g, '');
    if (v.normalize) { try { v = v.normalize('NFC'); } catch (ignore) {} }
    return v.toLowerCase();
  }

  function validRule(r) {
    if (!r || typeof r !== 'object') { return false; }
    if (r.kind === 'starred') { return true; }
    if (r.kind === 'folder' || r.kind === 'project') { return typeof r.value === 'string' && r.value.length > 0; }
    if (r.kind === 'title') {
      var opOk = r.operator === 'includes' || r.operator === 'startsWith' || r.operator === '=';
      return opOk && typeof r.value === 'string' && norm(r.value).length > 0 && r.value.indexOf('.ago') < 0;
    }
    return false;
  }

  function matchRule(rule, doc) {
    if (!rule || !doc) { return false; }
    if (rule.kind === 'starred') { return !!doc.starred; }
    if (rule.kind === 'folder' || rule.kind === 'project') {
      return doc.projectId === rule.value || doc.folder === rule.value;
    }
    if (rule.kind === 'title') {
      var t = norm(doc.title || '');
      var q = norm(rule.value || '');
      if (!q) { return false; }
      if (rule.operator === 'includes') { return t.indexOf(q) >= 0; }
      if (rule.operator === 'startsWith') { return t.indexOf(q) === 0; }
      if (rule.operator === '=') { return t === q; }
    }
    return false;
  }

  function filterDocs(shortcut, docs) {
    var list = Object.prototype.toString.call(docs) === '[object Array]' ? docs : [];
    if (!shortcut || !shortcut.rules || !shortcut.rules.length) { return []; }
    var isOr = shortcut.mode === 'or';
    return list.filter(function (d) {
      if (!d || d.trashed || d.archived) { return false; }
      var i, hit;
      if (isOr) {
        for (i = 0; i < shortcut.rules.length; i += 1) {
          if (matchRule(shortcut.rules[i], d)) { return true; }
        }
        return false;
      }
      for (i = 0; i < shortcut.rules.length; i += 1) {
        hit = matchRule(shortcut.rules[i], d);
        if (!hit) { return false; }
      }
      return true;
    });
  }

  function createShortcutsStore(storage) {
    var counter = 0;
    function read() {
      if (!storage) { return []; }
      try {
        var raw = storage.getItem(KEY);
        if (!raw) { return []; }
        var parsed = JSON.parse(raw);
        if (Object.prototype.toString.call(parsed) !== '[object Array]') { return []; }
        return parsed.filter(function (item) {
          return item && typeof item.id === 'string' && typeof item.title === 'string' &&
            Object.prototype.toString.call(item.rules) === '[object Array]' && item.rules.length > 0;
        });
      } catch (e) { return []; }
    }
    function write(list) {
      if (!storage) { return; }
      storage.setItem(KEY, JSON.stringify(list));
    }
    return {
      list: read,
      get: function (id) {
        var all = read(), i;
        for (i = 0; i < all.length; i += 1) {
          if (all[i].id === id) { return all[i]; }
        }
        return null;
      },
      save: function (spec) {
        var title = String(spec && spec.title || '').replace(/^\s+|\s+$/g, '');
        if (!title) { throw new Error('D\u00EA um nome ao atalho para encontr\u00E1-lo depois.'); }
        var rules = spec && Object.prototype.toString.call(spec.rules) === '[object Array]' ? spec.rules : [];
        if (!rules.length) { throw new Error('Escolha quais textos quer reunir.'); }
        var i;
        for (i = 0; i < rules.length; i += 1) {
          if (!validRule(rules[i])) {
            throw new Error('Preencha todos os crit\u00E9rios do atalho (sem usar ".ago").');
          }
        }
        var all = read();
        var lower = norm(title);
        var id = spec && spec.id ? String(spec.id) : '';
        for (i = 0; i < all.length; i += 1) {
          if (all[i].id !== id && norm(all[i].title) === lower) {
            throw new Error('Voc\u00EA j\u00E1 tem um atalho com esse nome. Escolha outro.');
          }
        }
        counter += 1;
        var entry = {
          id: id || ('sc-' + new Date().getTime().toString(36) + '-' + counter),
          title: title.slice(0, 80),
          mode: spec && spec.mode === 'or' ? 'or' : 'and',
          rules: rules.slice(0, 8)
        };
        var replaced = false;
        for (i = 0; i < all.length; i += 1) {
          if (all[i].id === entry.id) { all[i] = entry; replaced = true; break; }
        }
        if (!replaced) { all.push(entry); }
        write(all);
        return entry;
      },
      remove: function (id) {
        var next = read().filter(function (item) { return item.id !== id; });
        write(next);
      }
    };
  }

  root.Escr.shortcutsCore = {
    KEY: KEY,
    OPERATORS: OPERATORS,
    validRule: validRule,
    matchRule: matchRule,
    filterDocs: filterDocs,
    createStore: createShortcutsStore
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/ui/tres-colunas.js */
/* Interface de três colunas fiel ao Escrevaral Linux — ES5 estrito */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var STORAGE_KEY = 'escrevaral.astra.workspace.v1';

  function byId(id) { return document.getElementById(id); }
  function setText(el, str) { if (el) { el.textContent = str; } }
  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }

  function createEl(tag, className, textValue) {
    var el = document.createElement(tag);
    if (className) { el.className = className; }
    if (typeof textValue === 'string') { el.textContent = textValue; }
    return el;
  }

  function svgIcon(pathD, viewBox) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS ? document.createElementNS(ns, 'svg') : document.createElement('svg');
    svg.setAttribute('class', 'esc-icon');
    svg.setAttribute('viewBox', viewBox || '0 0 256 256');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var p = document.createElementNS ? document.createElementNS(ns, 'path') : document.createElement('path');
    p.setAttribute('d', pathD);
    svg.appendChild(p);
    return svg;
  }

  var ICONS = {
    folder: 'M216,74H130L101.73,52.8a14,14,0,0,0-8.4-2.8H40A14,14,0,0,0,26,64V200a14,14,0,0,0,14,14H216.89A13.12,13.12,0,0,0,230,200.89V88A14,14,0,0,0,216,74Zm2,126.89a1.11,1.11,0,0,1-1.11,1.11H40a2,2,0,0,1-2-2V64a2,2,0,0,1,2-2H93.33a2,2,0,0,1,1.2.4L124.4,84.8A6,6,0,0,0,128,86h88a2,2,0,0,1,2,2Z',
    star: 'M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z',
    archive: 'M224,50H32A14,14,0,0,0,18,64V88a14,14,0,0,0,14,14h2v90a14,14,0,0,0,14,14H208a14,14,0,0,0,14-14V102h2a14,14,0,0,0,14-14V64A14,14,0,0,0,224,50ZM210,192a2,2,0,0,1-2,2H48a2,2,0,0,1-2-2V102H210ZM226,88a2,2,0,0,1-2,2H32a2,2,0,0,1-2-2V64a2,2,0,0,1,2-2H224a2,2,0,0,1,2,2ZM98,136a6,6,0,0,1,6-6h48a6,6,0,0,1,0,12H104A6,6,0,0,1,98,136Z',
    trash: 'M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192Z',
    tagless: 'M40,86H74.6a30,30,0,0,0,58.8,0H216a6,6,0,0,0,0-12H133.4a30,30,0,0,0-58.8,0H40a6,6,0,0,0,0,12Zm64-24A18,18,0,1,1,86,80,18,18,0,0,1,104,62ZM216,170H197.4a30,30,0,0,0-58.8,0H40a6,6,0,0,0,0,12h98.6a30,30,0,0,0,58.8,0H216a6,6,0,0,0,0-12Zm-48,24a18,18,0,1,1,18-18A18,18,0,0,1,168,194Z',
    allNotes: 'M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z',
    shortcut: 'M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216ZM184,96a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,96Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,128Zm-32,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h64A8,8,0,0,1,152,160Z'
  };

  function snippetFrom(doc) {
    var raw = String(doc && doc.text ? doc.text : '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
    if (!raw) { return 'Folha em branco'; }
    return raw.length > 96 ? raw.slice(0, 96) + '\u2026' : raw;
  }

  function formatShortDate(iso) {
    if (!iso) { return ''; }
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return ''; }
    var now = new Date();
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) {
      var h = d.getHours(), m = d.getMinutes();
      return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
    }
    var months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return d.getDate() + ' ' + months[d.getMonth()];
  }

  root.Escr.mountWorkspace = function (opts) {
    opts = opts || {};
    var storage = opts.storage || null;
    var shortcutsStore = root.Escr.shortcutsCore ? root.Escr.shortcutsCore.createStore(storage) : null;
    var state = {
      scope: 'library', // 'library' | 'project' | 'shortcut'
      libraryFilter: 'all', // 'all' | 'starred' | 'untagged' | 'archived' | 'trashed'
      projectId: null,
      folder: '',
      shortcutId: null,
      folderQuery: '',
      filterStarred: false,
      filterFormat: 'all', // 'all' | 'rich' | 'plain'
      sortBy: 'recent', // 'recent' | 'title'
      filtersOpen: false,
      navCollapsed: false,
      listsCollapsed: false,
      expandedProjects: {},
      mobilePane: 'editor'
    };

    var flashTimer = null;

    function loadState() {
      if (!storage) { return; }
      try {
        var raw = storage.getItem(STORAGE_KEY);
        if (!raw) { return; }
        var saved = JSON.parse(raw);
        if (!saved || typeof saved !== 'object') { return; }
        if (saved.scope === 'project' || saved.scope === 'library' || saved.scope === 'shortcut') { state.scope = saved.scope; }
        if (typeof saved.libraryFilter === 'string') { state.libraryFilter = saved.libraryFilter; }
        if (typeof saved.projectId === 'string') { state.projectId = saved.projectId; }
        if (typeof saved.folder === 'string') { state.folder = saved.folder; }
        if (typeof saved.shortcutId === 'string') { state.shortcutId = saved.shortcutId; }
        if (typeof saved.navCollapsed === 'boolean') { state.navCollapsed = saved.navCollapsed; }
        if (typeof saved.listsCollapsed === 'boolean') { state.listsCollapsed = saved.listsCollapsed; }
        if (saved.expandedProjects && typeof saved.expandedProjects === 'object') { state.expandedProjects = saved.expandedProjects; }
      } catch (ignore) {}
    }

    function saveState() {
      if (!storage) { return; }
      try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (ignore) {}
    }

    function flashEink() {
      var target = byId('writing-space');
      if (!target) { return; }
      if (root.Escr.einkFlash) {
        root.Escr.einkFlash(target);
        return;
      }
      if (flashTimer) { window.clearTimeout(flashTimer); flashTimer = null; }
      target.removeAttribute('data-eink-flash');
      target.setAttribute('data-eink-flash', 'true');
      flashTimer = window.setTimeout(function () {
        target.removeAttribute('data-eink-flash');
        flashTimer = null;
      }, 150);
    }

    function applyColumnState() {
      if (!document.body) { return; }
      document.body.setAttribute('data-nav-collapsed', state.navCollapsed ? 'true' : 'false');
      document.body.setAttribute('data-lists-collapsed', state.listsCollapsed ? 'true' : 'false');
      document.body.setAttribute('data-mobile-pane', state.mobilePane || 'editor');
      var navBtn = byId('esc-nav-toggle');
      var listBtn = byId('esc-lists-toggle');
      if (navBtn) { navBtn.setAttribute('aria-pressed', state.navCollapsed ? 'true' : 'false'); }
      if (listBtn) { listBtn.setAttribute('aria-pressed', state.listsCollapsed ? 'true' : 'false'); }
    }

    function allDocs() {
      if (!opts.archive) { return []; }
      try {
        var listed = opts.archive.list(true).documents || [];
        return listed.filter(function (d) { return d && d.kind !== 'reminder'; });
      } catch (e) { return []; }
    }

    function allBooks() {
      if (!opts.notebooks) { return []; }
      try { return opts.notebooks.list(true) || []; } catch (e) { return []; }
    }

    function availableBooks() {
      return allBooks().filter(function (b) { return b && !b.trashed; });
    }

    function trashedBooks() {
      return allBooks().filter(function (b) { return b && !!b.trashed; });
    }

    function isBookStarred(book) {
      return !!(book && book.data && book.data.starred);
    }

    function closePopovers() {
      var pop = byId('esc-color-popover');
      if (pop) { pop.hidden = true; }
      var fm = byId('esc-folder-menu');
      if (fm) { fm.hidden = true; }
    }

    function openColorMenu(book, anchorEl) {
      closePopovers();
      var pop = byId('esc-color-popover');
      if (!pop || !root.Escr.projectColors) { return; }
      pop.textContent = '';
      var activePal = root.Escr.projectColors.resolve(book);
      pop.appendChild(createEl('p', 'esc-color-popover-title', 'Cor de "' + book.name + '"'));
      var row = createEl('div', 'esc-color-swatches');

      // Opção Sem cor (padrão Sálvia)
      var noneBtn = createEl('button', 'esc-swatch esc-swatch-none', '\u00D7');
      noneBtn.type = 'button';
      noneBtn.title = 'Sem cor (padr\u00E3o)';
      noneBtn.setAttribute('aria-label', 'Sem cor');
      noneBtn.setAttribute('aria-pressed', activePal.id === 'padrao' ? 'true' : 'false');
      on(noneBtn, 'click', function (ev) {
        ev.stopPropagation();
        root.Escr.projectColors.assign(opts.notebooks, book.id, 'padrao');
        closePopovers();
        render();
        if (opts.refreshParent) { opts.refreshParent(); }
      });
      row.appendChild(noneBtn);

      root.Escr.projectColors.list().forEach(function (pal) {
        var sw = createEl('button', 'esc-swatch');
        sw.type = 'button';
        sw.title = pal.name;
        sw.setAttribute('aria-label', 'Cor ' + pal.name);
        sw.setAttribute('aria-pressed', activePal.id === pal.id ? 'true' : 'false');
        sw.style.backgroundColor = pal.color;
        on(sw, 'click', function (ev) {
          ev.stopPropagation();
          root.Escr.projectColors.assign(opts.notebooks, book.id, pal.id);
          closePopovers();
          render();
          if (opts.refreshParent) { opts.refreshParent(); }
        });
        row.appendChild(sw);
      });
      pop.appendChild(row);
      pop.hidden = false;
      if (anchorEl && anchorEl.getBoundingClientRect) {
        var r = anchorEl.getBoundingClientRect();
        pop.style.left = Math.max(8, Math.min((window.innerWidth || 900) - 240, r.left)) + 'px';
        pop.style.top = Math.max(48, Math.min((window.innerHeight || 600) - 120, r.bottom + 4)) + 'px';
      }
    }

    function openFolderPrompt(titleText, initialValue, acceptLabel, onAccept) {
      var ov = byId('esc-inline-modal');
      if (!ov) {
        ov = createEl('div', 'esc-inline-modal');
        ov.id = 'esc-inline-modal';
        ov.setAttribute('role', 'dialog');
        ov.setAttribute('aria-modal', 'true');
        document.body.appendChild(ov);
      }
      ov.textContent = '';
      var card = createEl('div', 'esc-inline-modal-card');
      card.appendChild(createEl('h3', '', titleText));
      var form = createEl('form');
      var inp = createEl('input', 'esc-inline-input');
      inp.type = 'text';
      inp.value = initialValue || '';
      inp.maxLength = 120;
      inp.placeholder = 'Nome da pasta ou projeto';
      var errP = createEl('p', 'esc-inline-err');
      errP.hidden = true;
      var bar = createEl('div', 'esc-inline-actions');
      var cancelBtn = createEl('button', '', 'Cancelar');
      cancelBtn.type = 'button';
      var okBtn = createEl('button', 'esc-btn-primary', acceptLabel || 'Salvar');
      okBtn.type = 'submit';
      bar.appendChild(cancelBtn);
      bar.appendChild(okBtn);
      form.appendChild(inp);
      form.appendChild(errP);
      form.appendChild(bar);
      card.appendChild(form);
      ov.appendChild(card);
      ov.hidden = false;

      function closeM() { ov.hidden = true; ov.textContent = ''; }
      on(cancelBtn, 'click', closeM);
      on(ov, 'click', function (ev) { if (ev.target === ov) { closeM(); } });
      on(form, 'submit', function (ev) {
        ev.preventDefault();
        var val = String(inp.value || '').replace(/^\s+|\s+$/g, '');
        if (!val) { errP.textContent = 'Digite um nome para continuar.'; errP.hidden = false; inp.focus(); return; }
        try {
          onAccept(val);
          closeM();
        } catch (e) {
          errP.textContent = e && e.message ? e.message : 'N\u00E3o foi poss\u00EDvel concluir.';
          errP.hidden = false;
        }
      });
      if (inp.focus) { inp.focus(); }
      if (inp.select) { inp.select(); }
    }

    function openFolderMenu(book, anchorEl) {
      closePopovers();
      var menu = byId('esc-folder-menu');
      if (!menu) {
        menu = createEl('div', 'esc-folder-menu');
        menu.id = 'esc-folder-menu';
        menu.setAttribute('role', 'menu');
        document.body.appendChild(menu);
      }
      menu.textContent = '';
      var starred = isBookStarred(book);
      var items = [
        {
          label: 'Renomear pasta',
          action: function () {
            openFolderPrompt('Renomear pasta', book.name, 'Renomear', function (nextName) {
              if (opts.renameProject) { opts.renameProject(book, nextName); }
              else if (opts.notebooks) { opts.notebooks.update(book.id, { name: nextName }); render(); }
            });
          }
        },
        {
          label: 'Cor do projeto',
          action: function () { openColorMenu(book, anchorEl); }
        },
        {
          label: starred ? 'Remover estrela da pasta' : 'Marcar pasta com estrela',
          action: function () {
            if (opts.notebooks) {
              var nextData = book.data ? JSON.parse(JSON.stringify(book.data)) : {};
              nextData.starred = !starred;
              opts.notebooks.update(book.id, { data: nextData });
              render();
              if (opts.refreshParent) { opts.refreshParent(); }
            }
          }
        },
        {
          label: 'Abrir quadro de giz',
          action: function () {
            if (opts.openProjectBoard) { opts.openProjectBoard(book); }
          }
        },
        {
          label: 'Mover textos para a lixeira',
          action: function () {
            if (opts.trashProjectDocs) { opts.trashProjectDocs(book); }
          }
        },
        {
          label: 'Mover pasta para a lixeira',
          danger: true,
          action: function () {
            if (opts.trashProject) { opts.trashProject(book); }
          }
        }
      ];

      items.forEach(function (it) {
        var btn = createEl('button', 'esc-folder-menu-item' + (it.danger ? ' is-danger' : ''), it.label);
        btn.type = 'button';
        btn.setAttribute('role', 'menuitem');
        on(btn, 'click', function (ev) {
          ev.stopPropagation();
          closePopovers();
          it.action();
        });
        menu.appendChild(btn);
      });
      menu.hidden = false;
      if (anchorEl && anchorEl.getBoundingClientRect) {
        var r = anchorEl.getBoundingClientRect();
        menu.style.left = Math.max(8, Math.min((window.innerWidth || 900) - 220, r.left)) + 'px';
        menu.style.top = Math.max(48, Math.min((window.innerHeight || 600) - 240, r.bottom + 4)) + 'px';
      }
    }

    function openShortcutModal(existingShortcut) {
      if (!shortcutsStore || !root.Escr.shortcutsCore) { return; }
      var ov = byId('esc-inline-modal');
      if (!ov) {
        ov = createEl('div', 'esc-inline-modal');
        ov.id = 'esc-inline-modal';
        ov.setAttribute('role', 'dialog');
        ov.setAttribute('aria-modal', 'true');
        document.body.appendChild(ov);
      }
      var docs = allDocs();
      var books = availableBooks();
      var draftTitle = existingShortcut ? existingShortcut.title : '';
      var draftMode = existingShortcut ? existingShortcut.mode : 'and';
      var draftRules = existingShortcut
        ? JSON.parse(JSON.stringify(existingShortcut.rules))
        : [{ kind: 'title', operator: 'includes', value: '' }];

      function closeM() { ov.hidden = true; ov.textContent = ''; }

      function renderModal() {
        ov.textContent = '';
        var card = createEl('div', 'esc-inline-modal-card esc-shortcut-card');
        card.appendChild(createEl('h3', '', existingShortcut ? 'Editar atalho salvo' : 'Criar atalho salvo'));
        var form = createEl('form');

        var nameLbl = createEl('label', 'esc-field-label', 'Nome do atalho');
        var nameInp = createEl('input', 'esc-inline-input');
        nameInp.type = 'text';
        nameInp.value = draftTitle;
        nameInp.placeholder = 'Ex.: Cap\u00EDtulos revisados';
        on(nameInp, 'input', function () { draftTitle = nameInp.value; });
        nameLbl.appendChild(nameInp);
        form.appendChild(nameLbl);

        var rulesBox = createEl('div', 'esc-shortcut-rules');
        draftRules.forEach(function (rule, idx) {
          var row = createEl('div', 'esc-shortcut-rule-row');
          var kindSel = createEl('select', 'esc-inline-select');
          [['title', 'T\u00EDtulo'], ['project', 'Pasta / Projeto'], ['starred', 'Com estrela']].forEach(function (pair) {
            var opt = createEl('option', '', pair[1]);
            opt.value = pair[0];
            if (rule.kind === pair[0]) { opt.selected = true; }
            kindSel.appendChild(opt);
          });
          on(kindSel, 'change', function () {
            rule.kind = kindSel.value;
            if (rule.kind === 'title') { rule.operator = 'includes'; rule.value = ''; }
            else if (rule.kind === 'project') { rule.operator = '='; rule.value = books[0] ? books[0].id : ''; }
            else { rule.operator = '='; rule.value = ''; }
            renderModal();
          });
          row.appendChild(kindSel);

          if (rule.kind === 'title') {
            var opSel = createEl('select', 'esc-inline-select');
            root.Escr.shortcutsCore.OPERATORS.forEach(function (pair) {
              var opt = createEl('option', '', pair[1]);
              opt.value = pair[0];
              if (rule.operator === pair[0]) { opt.selected = true; }
              opSel.appendChild(opt);
            });
            on(opSel, 'change', function () { rule.operator = opSel.value; updatePreview(); });
            row.appendChild(opSel);

            var valInp = createEl('input', 'esc-inline-input');
            valInp.type = 'text';
            valInp.value = rule.value || '';
            valInp.placeholder = 'Palavra no t\u00EDtulo';
            on(valInp, 'input', function () { rule.value = valInp.value; updatePreview(); });
            row.appendChild(valInp);
          } else if (rule.kind === 'project') {
            var bkSel = createEl('select', 'esc-inline-select');
            books.forEach(function (b) {
              var opt = createEl('option', '', b.name);
              opt.value = b.id;
              if (rule.value === b.id) { opt.selected = true; }
              bkSel.appendChild(opt);
            });
            on(bkSel, 'change', function () { rule.value = bkSel.value; updatePreview(); });
            row.appendChild(bkSel);
          }

          if (draftRules.length > 1) {
            var rmBtn = createEl('button', 'esc-item-act', '\u00D7');
            rmBtn.type = 'button';
            rmBtn.title = 'Remover regra';
            on(rmBtn, 'click', function () { draftRules.splice(idx, 1); renderModal(); });
            row.appendChild(rmBtn);
          }
          rulesBox.appendChild(row);
        });
        form.appendChild(rulesBox);

        var addRuleBtn = createEl('button', 'esc-item-act', '+ Adicionar crit\u00E9rio');
        addRuleBtn.type = 'button';
        on(addRuleBtn, 'click', function () {
          if (draftRules.length < 8) {
            draftRules.push({ kind: 'starred', operator: '=', value: '' });
            renderModal();
          }
        });
        form.appendChild(addRuleBtn);

        if (draftRules.length > 1) {
          var modeRow = createEl('div', 'esc-shortcut-mode');
          var modeSel = createEl('select', 'esc-inline-select');
          [['and', 'Cumprir TODOS os crit\u00E9rios'], ['or', 'Cumprir QUALQUER crit\u00E9rio']].forEach(function (p) {
            var o = createEl('option', '', p[1]);
            o.value = p[0];
            if (draftMode === p[0]) { o.selected = true; }
            modeSel.appendChild(o);
          });
          on(modeSel, 'change', function () { draftMode = modeSel.value; updatePreview(); });
          modeRow.appendChild(modeSel);
          form.appendChild(modeRow);
        }

        var previewEl = createEl('p', 'esc-shortcut-preview');
        form.appendChild(previewEl);

        var errP = createEl('p', 'esc-inline-err');
        errP.hidden = true;
        form.appendChild(errP);

        function updatePreview() {
          var valid = draftRules.every(root.Escr.shortcutsCore.validRule);
          if (!valid) {
            previewEl.textContent = 'Preencha os crit\u00E9rios para ver quantos textos correspondem.';
            return;
          }
          var matched = root.Escr.shortcutsCore.filterDocs({ mode: draftMode, rules: draftRules }, docs);
          previewEl.textContent = matched.length === 1
            ? '1 texto corresponde a este atalho.'
            : matched.length + ' textos correspondem a este atalho.';
        }
        updatePreview();

        var bar = createEl('div', 'esc-inline-actions');
        if (existingShortcut) {
          var delBtn = createEl('button', 'esc-item-act is-danger', 'Excluir atalho');
          delBtn.type = 'button';
          on(delBtn, 'click', function () {
            shortcutsStore.remove(existingShortcut.id);
            if (state.scope === 'shortcut' && state.shortcutId === existingShortcut.id) {
              state.scope = 'library';
              state.libraryFilter = 'all';
              state.shortcutId = null;
            }
            closeM();
            render();
          });
          bar.appendChild(delBtn);
        }
        var cancelBtn = createEl('button', '', 'Cancelar');
        cancelBtn.type = 'button';
        on(cancelBtn, 'click', closeM);
        var saveBtn = createEl('button', 'esc-btn-primary', 'Salvar atalho');
        saveBtn.type = 'submit';
        bar.appendChild(cancelBtn);
        bar.appendChild(saveBtn);
        form.appendChild(bar);

        on(form, 'submit', function (ev) {
          ev.preventDefault();
          try {
            var saved = shortcutsStore.save({
              id: existingShortcut ? existingShortcut.id : '',
              title: draftTitle,
              mode: draftMode,
              rules: draftRules
            });
            state.scope = 'shortcut';
            state.shortcutId = saved.id;
            saveState();
            closeM();
            render();
          } catch (e) {
            errP.textContent = e && e.message ? e.message : 'N\u00E3o foi poss\u00EDvel salvar o atalho.';
            errP.hidden = false;
          }
        });

        card.appendChild(form);
        ov.appendChild(card);
        ov.hidden = false;
      }

      on(ov, 'click', function (ev) { if (ev.target === ov) { closeM(); } });
      renderModal();
    }

    function collectFoldersForBook(book, docs) {
      var map = {};
      var result = [];
      var bookFolders = book.data && Object.prototype.toString.call(book.data.folders) === '[object Array]' ? book.data.folders : [];
      bookFolders.forEach(function (f) {
        if (typeof f === 'string' && f.replace(/^\s+|\s+$/g, '') && !map[f.replace(/^\s+|\s+$/g, '')]) {
          var clean = f.replace(/^\s+|\s+$/g, '');
          map[clean] = true;
          result.push(clean);
        }
      });
      docs.forEach(function (d) {
        if (d.projectId === book.id && !d.trashed && !d.archived && d.folder && !map[d.folder]) {
          map[d.folder] = true;
          result.push(d.folder);
        }
      });
      result.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });
      return result;
    }

    function renderProjectRow(container, book, docs, perProject, activeDocId, isStarredSection) {
      var pal = root.Escr.projectColors ? root.Escr.projectColors.resolve(book) : { color: '#a3b899', edge: '#354231' };
      var folders = collectFoldersForBook(book, docs);
      var bookDocs = docs.filter(function (d) { return d.projectId === book.id && !d.trashed && !d.archived; });
      var canExpand = folders.length > 0 || bookDocs.length > 0;
      var expandKey = (isStarredSection ? 'star:' : '') + book.id;
      var expanded = !!state.expandedProjects[expandKey] || (!isStarredSection && !!state.expandedProjects[book.id]);
      var isBookSelected = state.scope === 'project' && state.projectId === book.id && !state.folder;

      var wrap = createEl('div', 'esc-project-node');
      wrap.setAttribute('data-project-id', book.id);
      if (pal.id !== 'padrao') {
        wrap.setAttribute('data-esc-project-color', pal.id);
      }

      var row = createEl('div', 'esc-project-row' + (isBookSelected ? ' is-active' : ''));
      row.style.borderLeftColor = pal.id !== 'padrao' ? pal.color : 'transparent';

      var expBtn = createEl('button', 'esc-tree-expand', canExpand ? (expanded ? '\u25BE' : '\u25B8') : '\u00B7');
      expBtn.type = 'button';
      expBtn.setAttribute('aria-label', expanded ? 'Recolher ' + book.name : 'Expandir ' + book.name);
      expBtn.disabled = !canExpand;
      on(expBtn, 'click', function (ev) {
        ev.stopPropagation();
        if (!canExpand) { return; }
        state.expandedProjects[book.id] = !expanded;
        if (isStarredSection) { state.expandedProjects[expandKey] = !expanded; }
        saveState();
        render();
      });

      var selBtn = createEl('button', 'esc-project-select');
      selBtn.type = 'button';
      selBtn.appendChild(createEl('span', 'esc-project-name', book.name));
      selBtn.appendChild(createEl('span', 'esc-nav-count', String(perProject[book.id] || 0)));
      on(selBtn, 'click', function () {
        state.scope = 'project';
        state.projectId = book.id;
        state.folder = '';
        state.mobilePane = 'items';
        saveState();
        render();
      });

      var menuBtn = createEl('button', 'esc-project-color-btn', '\u22EF');
      menuBtn.type = 'button';
      menuBtn.title = 'A\u00E7\u00F5es de ' + book.name;
      menuBtn.setAttribute('aria-label', 'A\u00E7\u00F5es de ' + book.name);
      on(menuBtn, 'click', function (ev) {
        ev.stopPropagation();
        openFolderMenu(book, menuBtn);
      });
      on(row, 'contextmenu', function (ev) {
        ev.preventDefault();
        openFolderMenu(book, menuBtn);
      });

      row.appendChild(expBtn);
      row.appendChild(selBtn);
      row.appendChild(menuBtn);
      wrap.appendChild(row);

      if (expanded && canExpand) {
        var subList = createEl('div', 'esc-folder-list');
        // Subpastas
        folders.forEach(function (folderName) {
          var folderDocs = bookDocs.filter(function (d) { return d.folder === folderName; });
          var fBtn = createEl('button', 'esc-folder-item');
          fBtn.type = 'button';
          var fSel = state.scope === 'project' && state.projectId === book.id && state.folder === folderName;
          fBtn.setAttribute('aria-current', fSel ? 'true' : 'false');
          fBtn.appendChild(svgIcon(ICONS.folder));
          fBtn.appendChild(createEl('span', 'esc-folder-name', folderName));
          fBtn.appendChild(createEl('span', 'esc-nav-count', String(folderDocs.length)));
          on(fBtn, 'click', function () {
            state.scope = 'project';
            state.projectId = book.id;
            state.folder = folderName;
            state.mobilePane = 'items';
            saveState();
            render();
          });
          subList.appendChild(fBtn);

          // Notas filhas desta subpasta na árvore (NoteRows do Linux!)
          if (folderDocs.length) {
            var fnList = createEl('div', 'esc-tree-notes is-nested-notes');
            folderDocs.forEach(function (note) {
              var nb = createEl('button', 'esc-tree-note' + (note.id === activeDocId ? ' is-selected' : ''));
              nb.type = 'button';
              nb.appendChild(svgIcon(ICONS.allNotes));
              nb.appendChild(createEl('span', 'esc-tree-note-title', note.title || 'Sem t\u00EDtulo'));
              on(nb, 'click', function (ev) {
                ev.stopPropagation();
                state.scope = 'project';
                state.projectId = book.id;
                state.folder = folderName;
                state.mobilePane = 'editor';
                saveState();
                if (opts.openDoc) { opts.openDoc(note); }
                flashEink();
                render();
              });
              fnList.appendChild(nb);
            });
            subList.appendChild(fnList);
          }
        });

        // Notas soltas na raiz deste projeto
        var rootDocs = bookDocs.filter(function (d) { return !d.folder; });
        if (rootDocs.length) {
          var rnList = createEl('div', 'esc-tree-notes');
          rootDocs.forEach(function (note) {
            var nb = createEl('button', 'esc-tree-note' + (note.id === activeDocId ? ' is-selected' : ''));
            nb.type = 'button';
            nb.appendChild(svgIcon(ICONS.allNotes));
            nb.appendChild(createEl('span', 'esc-tree-note-title', note.title || 'Sem t\u00EDtulo'));
            on(nb, 'click', function (ev) {
              ev.stopPropagation();
              state.scope = 'project';
              state.projectId = book.id;
              state.folder = '';
              state.mobilePane = 'editor';
              saveState();
              if (opts.openDoc) { opts.openDoc(note); }
              flashEink();
              render();
            });
            rnList.appendChild(nb);
          });
          subList.appendChild(rnList);
        }
        wrap.appendChild(subList);
      }

      container.appendChild(wrap);
    }

    function renderNavigation(docs, books) {
      var navLib = byId('esc-library-filters');
      var tree = byId('esc-project-tree');
      if (!navLib || !tree) { return; }

      var activeDoc = opts.currentDoc ? opts.currentDoc() : null;
      var activeDocId = activeDoc ? activeDoc.id : '';
      var trashBooks = trashedBooks();

      var counts = { all: 0, starred: 0, untagged: 0, archived: 0, trashed: trashBooks.length };
      var perProject = {};
      docs.forEach(function (d) {
        if (d.trashed) { counts.trashed += 1; return; }
        if (d.archived) { counts.archived += 1; return; }
        counts.all += 1;
        if (d.starred) { counts.starred += 1; }
        if (!d.projectId) { counts.untagged += 1; }
        else { perProject[d.projectId] = (perProject[d.projectId] || 0) + 1; }
      });

      var defs = [
        { id: 'all', label: 'Todos os textos', icon: ICONS.allNotes, count: counts.all },
        { id: 'starred', label: 'Com estrela', icon: ICONS.star, count: counts.starred },
        { id: 'untagged', label: 'Sem pasta', icon: ICONS.tagless, count: counts.untagged },
        { id: 'archived', label: 'Arquivados', icon: ICONS.archive, count: counts.archived },
        { id: 'trashed', label: 'Lixeira', icon: ICONS.trash, count: counts.trashed }
      ];

      navLib.textContent = '';
      defs.forEach(function (item) {
        var btn = createEl('button', 'esc-nav-item');
        btn.type = 'button';
        var selected = state.scope === 'library' && state.libraryFilter === item.id;
        btn.setAttribute('aria-current', selected ? 'true' : 'false');
        btn.setAttribute('data-lib-filter', item.id);
        btn.appendChild(svgIcon(item.icon));
        btn.appendChild(createEl('span', 'esc-nav-label', item.label));
        btn.appendChild(createEl('span', 'esc-nav-count', String(item.count)));
        on(btn, 'click', function () {
          state.scope = 'library';
          state.libraryFilter = item.id;
          state.projectId = null;
          state.folder = '';
          state.shortcutId = null;
          state.mobilePane = 'items';
          saveState();
          render();
        });
        navLib.appendChild(btn);
      });

      // Atalhos salvos
      var scWrap = byId('esc-shortcuts-list');
      if (scWrap && shortcutsStore) {
        scWrap.textContent = '';
        var scList = shortcutsStore.list();
        scList.forEach(function (sc) {
          var row = createEl('div', 'esc-shortcut-item-row');
          var matched = root.Escr.shortcutsCore.filterDocs(sc, docs);
          var btn = createEl('button', 'esc-nav-item');
          btn.type = 'button';
          var sel = state.scope === 'shortcut' && state.shortcutId === sc.id;
          btn.setAttribute('aria-current', sel ? 'true' : 'false');
          btn.appendChild(svgIcon(ICONS.shortcut));
          btn.appendChild(createEl('span', 'esc-nav-label', sc.title));
          btn.appendChild(createEl('span', 'esc-nav-count', String(matched.length)));
          on(btn, 'click', function () {
            state.scope = 'shortcut';
            state.shortcutId = sc.id;
            state.projectId = null;
            state.folder = '';
            state.mobilePane = 'items';
            saveState();
            render();
          });
          var editBtn = createEl('button', 'esc-project-color-btn', '\u22EF');
          editBtn.type = 'button';
          editBtn.title = 'Editar atalho ' + sc.title;
          on(editBtn, 'click', function (ev) { ev.stopPropagation(); openShortcutModal(sc); });
          row.appendChild(btn);
          row.appendChild(editBtn);
          scWrap.appendChild(row);
        });
      }

      // Pastas com estrela
      var starSec = byId('esc-starred-folders');
      if (starSec) {
        var starredBooks = books.filter(isBookStarred);
        starSec.textContent = '';
        starSec.hidden = !starredBooks.length;
        if (starredBooks.length) {
          var det = createEl('details', 'esc-starred-details');
          det.open = true;
          det.appendChild(createEl('summary', 'esc-nav-section-label', 'Pastas com estrela'));
          starredBooks.forEach(function (bk) {
            renderProjectRow(det, bk, docs, perProject, activeDocId, true);
          });
          starSec.appendChild(det);
        }
      }

      // Projetos e pastas (filtrados por busca de pastas)
      var fQuery = String(state.folderQuery || '').replace(/^\s+|\s+$/g, '').toLowerCase();
      var visibleBooks = books.filter(function (bk) {
        if (!fQuery) { return true; }
        if (String(bk.name || '').toLowerCase().indexOf(fQuery) >= 0) { return true; }
        var flds = collectFoldersForBook(bk, docs);
        return flds.some(function (f) { return f.toLowerCase().indexOf(fQuery) >= 0; });
      });

      tree.textContent = '';
      if (!visibleBooks.length) {
        tree.appendChild(createEl('p', 'esc-tree-empty', fQuery ? 'Nenhuma pasta encontrada.' : 'Nenhum projeto criado ainda.'));
      } else {
        visibleBooks.forEach(function (bk) {
          renderProjectRow(tree, bk, docs, perProject, activeDocId, false);
        });
      }
    }

    function activeFilterCount() {
      var c = 0;
      if (state.filterStarred) { c += 1; }
      if (state.filterFormat !== 'all') { c += 1; }
      if (state.sortBy !== 'recent') { c += 1; }
      return c;
    }

    function renderFilterPanel() {
      var panel = byId('esc-items-filters-panel');
      var badge = byId('esc-items-filter-badge');
      var btn = byId('esc-items-filter-btn');
      var count = activeFilterCount();
      if (badge) {
        badge.textContent = String(count);
        badge.hidden = count === 0;
      }
      if (btn) { btn.setAttribute('aria-expanded', state.filtersOpen ? 'true' : 'false'); }
      if (!panel) { return; }
      panel.hidden = !state.filtersOpen;
      if (!state.filtersOpen) { return; }

      panel.textContent = '';
      var topRow = createEl('div', 'esc-filters-top');
      var starLbl = createEl('label', 'esc-filter-check');
      var starCb = createEl('input');
      starCb.type = 'checkbox';
      starCb.checked = !!state.filterStarred;
      on(starCb, 'change', function () { state.filterStarred = starCb.checked; render(); });
      starLbl.appendChild(starCb);
      starLbl.appendChild(createEl('span', '', 'Somente com estrela'));
      topRow.appendChild(starLbl);

      if (count > 0) {
        var clearLink = createEl('button', 'esc-filters-clear', 'Limpar todos os filtros');
        clearLink.type = 'button';
        on(clearLink, 'click', function () {
          state.filterStarred = false;
          state.filterFormat = 'all';
          state.sortBy = 'recent';
          render();
        });
        topRow.appendChild(clearLink);
      }
      panel.appendChild(topRow);

      var fmtRow = createEl('div', 'esc-filters-row');
      [['all', 'Todos'], ['rich', 'Formatado'], ['plain', 'Simples']].forEach(function (p) {
        var b = createEl('button', 'esc-filter-chip', p[1]);
        b.type = 'button';
        b.setAttribute('aria-pressed', state.filterFormat === p[0] ? 'true' : 'false');
        on(b, 'click', function () { state.filterFormat = p[0]; render(); });
        fmtRow.appendChild(b);
      });
      panel.appendChild(fmtRow);

      var sortRow = createEl('div', 'esc-filters-row');
      [['recent', 'Mais recentes'], ['title', 'T\u00EDtulo A\u2013Z']].forEach(function (p) {
        var b = createEl('button', 'esc-filter-chip', p[1]);
        b.type = 'button';
        b.setAttribute('aria-pressed', state.sortBy === p[0] ? 'true' : 'false');
        on(b, 'click', function () { state.sortBy = p[0]; render(); });
        sortRow.appendChild(b);
      });
      panel.appendChild(sortRow);
    }

    function renderItemsColumn(docs, books) {
      var titleEl = byId('esc-items-title');
      var countEl = byId('esc-items-count');
      var listEl = byId('esc-items-list');
      var emptyTrashBtn = byId('esc-empty-trash');
      var searchInput = byId('esc-items-search');
      var clearBtn = byId('esc-items-search-clear');
      if (!listEl) { return; }

      var query = searchInput ? String(searchInput.value || '').replace(/^\s+|\s+$/g, '').toLowerCase() : '';
      if (clearBtn) { clearBtn.hidden = !query; }

      var currentBook = null;
      var i;
      if (state.scope === 'project' && state.projectId) {
        for (i = 0; i < books.length; i += 1) {
          if (books[i].id === state.projectId) { currentBook = books[i]; break; }
        }
        if (!currentBook) {
          state.scope = 'library';
          state.projectId = null;
          state.folder = '';
        }
      }

      if (root.Escr.projectColors && document.body) {
        root.Escr.projectColors.apply(document.body, currentBook);
      }

      var filtered = [];
      var heading = 'Todos os textos';
      var inTrash = state.scope === 'library' && state.libraryFilter === 'trashed';

      if (state.scope === 'project' && currentBook) {
        heading = state.folder ? (currentBook.name + ' \u203A ' + state.folder) : currentBook.name;
        filtered = docs.filter(function (d) {
          if (d.trashed || d.archived) { return false; }
          if (d.projectId !== currentBook.id) { return false; }
          if (state.folder && d.folder !== state.folder) { return false; }
          return true;
        });
      } else if (state.scope === 'shortcut' && shortcutsStore && state.shortcutId) {
        var sc = shortcutsStore.get(state.shortcutId);
        if (sc) {
          heading = sc.title;
          filtered = root.Escr.shortcutsCore.filterDocs(sc, docs);
        } else {
          state.scope = 'library';
          state.libraryFilter = 'all';
        }
      }

      if (state.scope === 'library') {
        if (state.libraryFilter === 'starred') {
          heading = 'Com estrela';
          filtered = docs.filter(function (d) { return !d.trashed && !d.archived && !!d.starred; });
        } else if (state.libraryFilter === 'untagged') {
          heading = 'Sem pasta';
          filtered = docs.filter(function (d) { return !d.trashed && !d.archived && !d.projectId; });
        } else if (state.libraryFilter === 'archived') {
          heading = 'Arquivados';
          filtered = docs.filter(function (d) { return !d.trashed && !!d.archived; });
        } else if (state.libraryFilter === 'trashed') {
          heading = 'Lixeira';
          filtered = docs.filter(function (d) { return !!d.trashed; });
        } else {
          heading = 'Todos os textos';
          filtered = docs.filter(function (d) { return !d.trashed && !d.archived; });
        }
      }

      // Filtros do acordeão (Coluna 2)
      if (!inTrash) {
        if (state.filterStarred) { filtered = filtered.filter(function (d) { return !!d.starred; }); }
        if (state.filterFormat === 'rich') { filtered = filtered.filter(function (d) { return d.format === 'rich'; }); }
        else if (state.filterFormat === 'plain') { filtered = filtered.filter(function (d) { return d.format !== 'rich'; }); }
      }

      if (query) {
        filtered = filtered.filter(function (d) {
          var hay = ((d.title || '') + ' ' + (d.text || '') + ' ' + (d.folder || '') + ' ' + (d.project || '')).toLowerCase();
          return hay.indexOf(query) >= 0;
        });
      }

      if (state.sortBy === 'title') {
        filtered.sort(function (a, b) { return String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR'); });
      } else {
        filtered.sort(function (a, b) { return (Date.parse(b.updated || 0) || 0) - (Date.parse(a.updated || 0) || 0); });
      }

      var trashFolders = inTrash ? trashedBooks() : [];
      var totalCount = filtered.length + trashFolders.length;
      setText(titleEl, heading);
      setText(countEl, totalCount === 1 ? '1 item' : totalCount + ' itens');
      if (emptyTrashBtn) { emptyTrashBtn.hidden = !(inTrash && totalCount > 0); }

      renderFilterPanel();

      listEl.textContent = '';
      var activeDoc = opts.currentDoc ? opts.currentDoc() : null;
      var activeId = activeDoc ? activeDoc.id : '';

      // Seção LIX-01: Pastas/Projetos recuperáveis na Lixeira
      if (inTrash && trashFolders.length) {
        var fHead = createEl('p', 'esc-trash-group-title', 'Pastas e projetos na lixeira');
        listEl.appendChild(fHead);
        trashFolders.forEach(function (bk) {
          var insideCount = docs.filter(function (d) { return d.projectId === bk.id && !!d.trashed; }).length;
          var card = createEl('article', 'esc-item-card esc-trashed-folder-card');
          var top = createEl('div', 'esc-item-top');
          top.appendChild(createEl('strong', 'esc-item-title', bk.name));
          top.appendChild(createEl('span', 'esc-item-date', insideCount + (insideCount === 1 ? ' texto' : ' textos')));
          card.appendChild(top);
          var acts = createEl('div', 'esc-item-actions');
          var restBtn = createEl('button', 'esc-item-act', 'Restaurar pasta e textos');
          restBtn.type = 'button';
          on(restBtn, 'click', function (ev) {
            ev.stopPropagation();
            if (opts.restoreProject) { opts.restoreProject(bk); }
          });
          acts.appendChild(restBtn);
          var purgeBtn = createEl('button', 'esc-item-act is-danger', 'Excluir definitivamente');
          purgeBtn.type = 'button';
          on(purgeBtn, 'click', function (ev) {
            ev.stopPropagation();
            if (opts.purgeProject) { opts.purgeProject(bk, insideCount); }
          });
          acts.appendChild(purgeBtn);
          card.appendChild(acts);
          listEl.appendChild(card);
        });
      }

      if (!filtered.length && !trashFolders.length) {
        var empty = createEl('p', 'esc-items-empty', query ? 'Nenhum texto encontrado para "' + query + '".' : 'Nenhum texto neste espaço.');
        listEl.appendChild(empty);
        return;
      }

      filtered.forEach(function (entry) {
        var isCurrent = entry.id === activeId;
        var card = createEl('article', 'esc-item-card' + (isCurrent ? ' is-selected' : ''));
        card.setAttribute('data-doc-id', entry.id);

        var mainBtn = createEl('button', 'esc-item-open');
        mainBtn.type = 'button';
        var top = createEl('div', 'esc-item-top');
        top.appendChild(createEl('strong', 'esc-item-title', entry.title || 'Sem t\u00EDtulo'));
        top.appendChild(createEl('span', 'esc-item-date', formatShortDate(entry.updated)));
        mainBtn.appendChild(top);
        mainBtn.appendChild(createEl('p', 'esc-item-snippet', snippetFrom(entry)));

        var meta = createEl('div', 'esc-item-meta');
        if (entry.project) { meta.appendChild(createEl('span', 'esc-item-badge', entry.project)); }
        if (entry.folder) { meta.appendChild(createEl('span', 'esc-item-badge is-folder', entry.folder)); }
        if (entry.category === 'reference') { meta.appendChild(createEl('span', 'esc-item-badge is-ref', 'Refer\u00EAncia')); }
        if (entry.starred) { meta.appendChild(createEl('span', 'esc-item-badge is-star', '\u2605')); }
        if (meta.children.length) { mainBtn.appendChild(meta); }

        on(mainBtn, 'click', function () {
          state.mobilePane = 'editor';
          applyColumnState();
          if (opts.openDoc) { opts.openDoc(entry); }
          if (!isCurrent) { flashEink(); }
          render();
        });
        card.appendChild(mainBtn);

        var actions = createEl('div', 'esc-item-actions');
        if (entry.trashed) {
          var restBtn = createEl('button', 'esc-item-act', 'Restaurar');
          restBtn.type = 'button';
          on(restBtn, 'click', function (ev) {
            ev.stopPropagation();
            if (opts.restoreDoc) { opts.restoreDoc(entry); }
          });
          actions.appendChild(restBtn);
          var delBtn = createEl('button', 'esc-item-act is-danger', 'Excluir definitivamente');
          delBtn.type = 'button';
          on(delBtn, 'click', function (ev) {
            ev.stopPropagation();
            if (opts.purgeDoc) { opts.purgeDoc(entry); }
          });
          actions.appendChild(delBtn);
        } else {
          var starBtn = createEl('button', 'esc-item-act', entry.starred ? '\u2605' : '\u2606');
          starBtn.type = 'button';
          starBtn.title = entry.starred ? 'Remover estrela' : 'Marcar com estrela';
          starBtn.setAttribute('aria-label', starBtn.title);
          on(starBtn, 'click', function (ev) {
            ev.stopPropagation();
            if (opts.updateDocMeta) { opts.updateDocMeta(entry, { starred: !entry.starred }); }
          });
          actions.appendChild(starBtn);

          var archBtn = createEl('button', 'esc-item-act', entry.archived ? 'Desarquivar' : 'Arquivar');
          archBtn.type = 'button';
          on(archBtn, 'click', function (ev) {
            ev.stopPropagation();
            if (opts.updateDocMeta) { opts.updateDocMeta(entry, { archived: !entry.archived }); }
          });
          actions.appendChild(archBtn);

          var trashBtn = createEl('button', 'esc-item-act', 'Lixeira');
          trashBtn.type = 'button';
          on(trashBtn, 'click', function (ev) {
            ev.stopPropagation();
            if (opts.trashDoc) { opts.trashDoc(entry); }
          });
          actions.appendChild(trashBtn);
        }
        card.appendChild(actions);
        listEl.appendChild(card);
      });
    }

    function render() {
      var docs = allDocs();
      var books = availableBooks();
      applyColumnState();
      renderNavigation(docs, books);
      renderItemsColumn(docs, books);
    }

    loadState();
    applyColumnState();

    on(byId('esc-nav-toggle'), 'click', function () {
      state.navCollapsed = !state.navCollapsed;
      saveState();
      applyColumnState();
    });
    on(byId('esc-lists-toggle'), 'click', function () {
      state.listsCollapsed = !state.listsCollapsed;
      saveState();
      applyColumnState();
    });
    on(byId('esc-new-project'), 'click', function () {
      if (opts.newProject) { opts.newProject(); }
    });
    on(byId('esc-new-folder-btn'), 'click', function () {
      openFolderPrompt('Nova pasta ou projeto', '', 'Criar pasta', function (name) {
        if (opts.createBlankFolder) { opts.createBlankFolder(name); }
        else if (opts.notebooks) {
          var created = opts.notebooks.add(name);
          state.scope = 'project';
          state.projectId = created.id;
          state.folder = '';
          saveState();
          render();
        }
      });
    });
    on(byId('esc-folder-search'), 'input', function () {
      var inp = byId('esc-folder-search');
      state.folderQuery = inp ? inp.value : '';
      render();
    });
    on(byId('esc-new-shortcut'), 'click', function () {
      openShortcutModal(null);
    });
    on(byId('esc-new-note'), 'click', function () {
      state.mobilePane = 'editor';
      applyColumnState();
      if (opts.newNote) {
        opts.newNote({
          projectId: state.scope === 'project' ? state.projectId : null,
          folder: state.scope === 'project' ? state.folder : ''
        });
      }
    });
    on(byId('esc-items-search'), 'input', function () { render(); });
    on(byId('esc-items-search-clear'), 'click', function () {
      var inp = byId('esc-items-search');
      if (inp) { inp.value = ''; inp.focus(); }
      render();
    });
    on(byId('esc-items-filter-btn'), 'click', function (ev) {
      ev.stopPropagation();
      state.filtersOpen = !state.filtersOpen;
      renderFilterPanel();
    });
    on(byId('esc-empty-trash'), 'click', function () {
      if (opts.emptyTrash) { opts.emptyTrash(); }
    });
    on(byId('esc-open-mesa'), 'click', function () {
      if (opts.onOpenNotebookTable) { opts.onOpenNotebookTable(); }
    });
    on(byId('esc-mobile-nav'), 'click', function () { state.mobilePane = 'nav'; applyColumnState(); });
    on(byId('esc-mobile-items'), 'click', function () { state.mobilePane = 'items'; applyColumnState(); });
    on(byId('esc-mobile-editor'), 'click', function () { state.mobilePane = 'editor'; applyColumnState(); });

    on(document, 'click', function (ev) {
      var pop = byId('esc-color-popover');
      if (pop && !pop.hidden && !pop.contains(ev.target)) { pop.hidden = true; }
      var fm = byId('esc-folder-menu');
      if (fm && !fm.hidden && !fm.contains(ev.target)) { fm.hidden = true; }
      var fp = byId('esc-items-filters-panel');
      var fb = byId('esc-items-filter-btn');
      if (fp && !fp.hidden && !fp.contains(ev.target) && (!fb || !fb.contains(ev.target))) {
        state.filtersOpen = false;
        renderFilterPanel();
      }
    });
    on(document, 'keydown', function (ev) {
      if (ev.keyCode === 27) {
        closePopovers();
        if (state.filtersOpen) {
          state.filtersOpen = false;
          renderFilterPanel();
        }
      }
    });

    return {
      render: render,
      flashEink: flashEink,
      openShortcutModal: openShortcutModal,
      selectProject: function (bookId, folder) {
        state.scope = bookId ? 'project' : 'library';
        state.projectId = bookId || null;
        state.folder = folder || '';
        state.shortcutId = null;
        if (bookId) { state.expandedProjects[bookId] = true; }
        saveState();
        render();
      },
      selectLibrary: function (filter) {
        state.scope = 'library';
        state.libraryFilter = filter || 'all';
        state.projectId = null;
        state.folder = '';
        state.shortcutId = null;
        saveState();
        render();
      },
      getSelection: function () { return JSON.parse(JSON.stringify(state)); },
      setMobilePane: function (pane) {
        state.mobilePane = pane || 'editor';
        applyColumnState();
      }
    };
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: src/editor/controlador.js */
(function () {
  'use strict';
  var E = window.Escr, vault = E.createVault(E.knowledge), storage = null, archive = null;
  var doc = E.freshDocument(), dirty = false, timer = null, pendingAnalysis = null, snapshot = '', activeLens = '', composing = false, audio = null;
  var title = byId('titulo'), manuscript = byId('manuscrito'), saveStatus = byId('save-status'), analysisStatus = byId('analysis-status');
  var activePanel = '', panelTrigger = null, panelIds = ['oficina', 'acervo', 'mesa', 'utilidades', 'focus-pause', 'lineage-panel'], panelToggles = ['examinar-toggle', 'acervo-toggle', 'mesa-toggle', 'start-pomodoro', 'pomodoro-task', 'start-lineage'];
  var projectScope = false, readingSize = 21, chalkUI = null, forceHistory=false, linguisticStore=E.createLinguisticStore(), analysisEpoch=0;
  var restrictedPaste = false, internalClipboard = '', copiedSelection = null, dismissedSelection = null, analysisRange = null;
  var trashView = false, sessionReady = false, sessionTimer = null, sessionKey = 'escrevaral.astra.session.v1';
  var immersion = false, machineEnabled = false, machinePreviousFocus = false, machineTimer = null, machineFeedTimer = null, machineCarriage = 0, machineLastLength = 0, machinePendingStrike = false;
  var focusEnabled = true, focusTimer = null, focusMeasure = null, typewriterTimer = null;
  var lensButtons = document.querySelectorAll('[data-lens]');
  var navDay = E.noteDateKey(doc), navMonth = navDay.slice(0, 7), searchTimer = null, timelineTotal = 0, timelineUnreadable = 0;
  var timelineEntries = [], timelineCount = 40, timelineRendering = false, months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  /* A capa é a entrada do projeto; o editor continua compartilhado. */
  var notebooks = null, activeNotebookId = null, notebookEditing = null, notebookReturn = null, notebookReady = false, showingAbout = false, deferredInstallPrompt = null;
  var originals = null, activeOriginalId = null, formTarget = 'volume', workspaceUI = null, templatesUI = null, sonnetUI = null, richUI = null, readerUI = null, visualMachine = null, superfocoUI = null, themeChromeUI = null, wordCardUI = null, academyUI = null;
  function availableBook(b) { var o = b && b.originalId && originals ? originals.get(b.originalId) : null; return b && !b.trashed && (!b.originalId || (o && !o.trashed)); }
  function activeNotebook() { var b = notebooks && activeNotebookId ? notebooks.get(activeNotebookId) : null; return availableBook(b) ? b : null; }
  function activeOriginal() { return originals && activeOriginalId ? originals.get(activeOriginalId) : null; }
  function rememberNotebook() {
    if (!notebooks || !activeNotebookId || !doc.projectId || doc.projectId !== activeNotebookId) { return true; }
    try {
      if (!activeNotebook()) { return true; }
      notebooks.update(activeNotebookId, { resume: { noteId: doc.noteId || doc.id, start: manuscript.selectionStart || 0, end: manuscript.selectionEnd || 0, scroll: manuscript.scrollTop || 0, view: cabinetOpen ? 'files' : 'writing' } }); return true;
    } catch (e) { message('O texto está guardado, mas não foi possível guardar a posição no caderno.'); return false; }
  }
  function notebookLabels() {
    var book = activeNotebook(), label = book ? book.name : 'Todos os textos';
    text(byId('notebook-window-name'), label); text(byId('os-window-task'), label);
    byId('os-window-task').setAttribute('data-notebook', book ? 'true' : 'false'); byId('os-window-task').setAttribute('title', label);
    if (book) { byId('os-window-task').style.borderLeftColor = book.color; }
    byId('cabinet-search').placeholder = book ? 'Buscar neste caderno' : 'Buscar em todos os textos';
    byId('cabinet-search').setAttribute('aria-label', byId('cabinet-search').placeholder);
    byId('notebook-rename').hidden = byId('notebook-export').hidden = byId('notebook-trash').hidden = !book;
    byId('notebook-more').hidden = !book; byId('notebook-more-menu').hidden = true; byId('notebook-more').setAttribute('aria-expanded','false');
    byId('start-universe').hidden = byId('start-chalkboard').hidden = byId('start-lineage').hidden = !book;
    byId('export-notebook').disabled = !book;
    text(byId('notebook-back'), book && book.originalId ? '← Voltar à gaveta' : '← Mesa de cadernos');
    byId('notebook-organization').hidden = !book;
    var parentSelect = byId('notebook-parent'); parentSelect.textContent = '';
    var loose = document.createElement('option'); loose.value = ''; text(loose, 'Na mesa, sem gaveta'); parentSelect.appendChild(loose);
    if (originals) { originals.list().filter(function (o) { return !o.trashed; }).forEach(function (o) { var opt = document.createElement('option'); opt.value = o.id; text(opt, o.name); parentSelect.appendChild(opt); }); }
    parentSelect.value = book ? book.originalId || '' : '';
    byId('cabinet-window').setAttribute('data-scope', book ? 'notebook' : 'all');
    text(byId('cabinet-context-label'), book ? 'SUAS FOLHAS' : 'CONSULTA · TODOS OS TEXTOS');
    byId('cabinet-window').setAttribute('aria-label', book ? 'Caderno aberto: ' + book.name : 'Consulta de todos os textos');
    byId('notebook-universe').hidden = byId('notebook-chalkboard').hidden = !book;
    byId('note-project').textContent = '';
    if (notebooks) { notebooks.list().filter(availableBook).forEach(function (b) { var option = document.createElement('option'); option.value = b.id; text(option, (b.originalId && originals ? originals.get(b.originalId).name + ' / ' : '') + b.name); byId('note-project').appendChild(option); }); }
    byId('note-project').value = doc.projectId || activeNotebookId || '';
  }
  function renderNotebooks() {
    var list = byId('notebook-list'); list.textContent = '';
    if (!notebooks || !originals) { return; }
    var boxes = originals.list(), books = notebooks.list(), parents = Object.create(null), groups = Object.create(null), counts = Object.create(null), current;
    var existing = archive && archive.list(true), firstRun = byId('first-run');
    firstRun.hidden = !(books.length === 0 && boxes.length === 0 && existing && existing.documents.length === 0 && !existing.unreadable);
    boxes.forEach(function (o) { parents[o.id] = o; groups[o.id] = []; });
    books.forEach(function (b) { if (b.originalId && groups[b.originalId] && !b.trashed) { groups[b.originalId].push(b); } });
    if (archive) { archive.list().documents.forEach(function (d) { if (d.kind !== 'reminder') { counts[d.projectId] = (counts[d.projectId] || 0) + 1; } }); }
    current = parents[activeOriginalId]; if (!current || current.trashed) { activeOriginalId = null; current = null; }
    byId('original-header').hidden = !current;
    byId('original-new').hidden = !!current;
    byId('project-new').hidden = !!current;
    byId('desktop-organize').hidden = !!current;
    byId('desktop-organize-menu').hidden = true; byId('desktop-organize').setAttribute('aria-expanded','false');
    byId('volume-new').hidden = !current;
    byId('original-more-menu').hidden = true; byId('original-more').setAttribute('aria-expanded','false');
    byId('notebook-area').setAttribute('data-drawer-open',current?'true':'false');
    text(byId('original-title-label'), current ? current.name : 'GAVETA');
    byId('notebook-hint').innerHTML = '<span class="pointer-hint">Dê dois cliques aqui para criar um caderno.</span><span class="touch-hint">Toque em + Novo caderno para começar.</span>';
    function cover(book) {
      var b = button(list, '', function () { openNotebook(book.id); });
      b.className = 'notebook-cover'; b.setAttribute('title', book.name); b.setAttribute('data-notebook-id', book.id); b.setAttribute('aria-label', 'Abrir caderno ' + book.name);
      b.setAttribute('aria-pressed', activeNotebookId === book.id ? 'true' : 'false');
      var face = document.createElement('span'); face.className = 'notebook-front'; face.setAttribute('aria-hidden', 'true'); b.appendChild(face);
      var strap = document.createElement('span'); strap.className = 'notebook-strap'; strap.style.backgroundColor = book.color; text(strap, book.name); face.appendChild(strap);
      var woven = document.createElement('span'); woven.className = 'woven-tab'; woven.setAttribute('aria-hidden', 'true'); woven.innerHTML = 'ESCREVA<b>RAL</b>'; face.appendChild(woven);
      var elastic = document.createElement('span'); elastic.className = 'notebook-elastic'; elastic.setAttribute('aria-hidden', 'true'); face.appendChild(elastic);
    }
    if (!current) {
      boxes.filter(function (o) { return !o.trashed; }).forEach(function (o) {
        var b = button(list, '', function () { openOriginal(o.id); }); b.className = 'original-box'; b.setAttribute('data-original-id', o.id); b.setAttribute('aria-label', 'Abrir gaveta ' + o.name);
        var lid = document.createElement('span'); lid.className = 'box-lid'; b.appendChild(lid);
        var stack = document.createElement('span'); stack.className = 'drawer-stack'; stack.setAttribute('aria-hidden','true'); b.appendChild(stack);
        var shown = Math.min(groups[o.id].length,4), spineIndex;
        for (spineIndex=0;spineIndex<shown;spineIndex+=1) { var spine=document.createElement('span'); spine.className='drawer-book-spine'; spine.style.borderLeftColor=groups[o.id][spineIndex].color; text(spine,groups[o.id][spineIndex].name); stack.appendChild(spine); }
        var label = document.createElement('span'); label.className = 'box-label'; b.appendChild(label);
        var tag = document.createElement('span'); tag.className = 'box-tag'; text(tag, 'GAVETA'); label.appendChild(tag);
        var titleNode = document.createElement('span'); titleNode.className = 'box-title'; text(titleNode, o.name); label.appendChild(titleNode);
        var count = 0, volumes = groups[o.id]; volumes.forEach(function (book) { count += counts[book.id] || 0; });
        var meta = document.createElement('span'); meta.className = 'box-meta'; text(meta, volumes.length + (volumes.length === 1 ? ' caderno' : ' cadernos') + ' · ' + count + (count === 1 ? ' texto' : ' textos')); label.appendChild(meta);
        var pull = document.createElement('span'); pull.className = 'box-pull'; b.appendChild(pull);
      });
    }
    books.filter(function (book) { return !book.trashed && (current ? book.originalId === current.id : !book.originalId); }).forEach(cover);
    byId('notebook-hint').hidden = false;
    notebookLabels();
  }
  function openOriginal(origId) {
    if (!originals || composing || !persist() || !rememberNotebook()) { return false; }
    var orig = originals.get(origId); if (!orig || orig.trashed) { message('Esta gaveta não está disponível.'); return false; }
    if (!closeNotebook()) { return false; }
    activeOriginalId = orig.id;
    activeNotebookId = null;
    cabinetProject = null;
    byId('cabinet-window').hidden = true;
    byId('os-window-task').hidden = true;
    renderNotebooks(); renderReminders(); updatePath(); queueSession();
    return true;
  }
  function closeOriginal() {
    if (composing || !persist() || !rememberNotebook()) { return false; }
    var previous = activeOriginalId;
    if (!closeNotebook()) { return false; }
    activeOriginalId = null;
    renderNotebooks(); renderReminders(); updatePath(); queueSession();
    var box = previous ? byId('notebook-list').querySelector('[data-original-id="' + previous + '"]') : null;
    (box || byId('project-new')).focus();
    byId('notebook-area').scrollTop = 0; byId('desktop-surface').scrollTop = 0;
    return true;
  }
  function closeNotebook() {
    if (composing || !persist() || !rememberNotebook()) { return false; }
    var previous = activeNotebookId;
    if (!cabinetOpen && !openCabinet(false)) { return false; }
    closePanels(false); toggleStart(false); activeNotebookId = null; cabinetProject = null; showingAbout = false;
    byId('cabinet-window').hidden = true; byId('os-window-task').hidden = true;
    byId('os-window-task').setAttribute('aria-pressed', 'false');
    renderNotebooks(); renderReminders(); updatePath(); queueSession();
    var cover = previous ? byId('notebook-list').querySelector('[data-notebook-id="' + previous + '"]') : null;
    (cover || (activeOriginalId ? byId('volume-new') : byId('project-new'))).focus(); return true;
  }
  function openNotebook(bookId) {
    if (!notebooks || composing || !persist() || !rememberNotebook()) { return false; }
    var book = notebooks.get(bookId); if (!availableBook(book)) { message('Este caderno está na lixeira ou não está disponível.'); return false; }
    activeNotebookId = book.id;
    activeOriginalId = book.originalId || null;
    cabinetProject = book.name; projectScope = true; showingAbout = false;
    byId('cabinet-search').value = ''; byId('note-search').value = ''; cabinetLimit = 40;
    var entries = archive.list().documents.filter(function (d) { return d.projectId === book.id && d.kind !== 'reminder'; }), next = null;
    entries.forEach(function (d) { if (book.resume && (d.noteId || d.id) === book.resume.noteId) { next = d; } });
    next = next || entries[0];
    if (next) { loadDocument(next); } else { next = E.freshDocument(); next.projectId = book.id; next.project = book.name; loadDocument(next); }
    if (!openCabinet(false)) { return false; }
    cabinetSelection = null;
    if (book.resume && (doc.noteId || doc.id) === book.resume.noteId) {
      cabinetSelection = { noteId: book.resume.noteId, start: Math.max(0, Math.min(doc.text.length, Number(book.resume.start) || 0)), end: Math.max(0, Math.min(doc.text.length, Number(book.resume.end) || 0)), scroll: Math.max(0, Number(book.resume.scroll) || 0) };
      if (book.resume.view === 'writing') { enterDesk(true); }
    }
    renderNotebooks(); renderReminders(); notebookLabels(); return true;
  }
  function showNotebookForm(id, target) {
    if (!notebooks) { message('A gravação está indisponível.'); return; }
    if (!checkpoint()) { return; }
    notebookReturn = document.activeElement;
    formTarget = target || 'volume';
    notebookEditing = id || null;
    var heading = '';
    if (formTarget === 'original') {
      var orig = id && originals ? originals.get(id) : null;
      heading = orig ? 'Renomear gaveta' : 'Nova gaveta';
      byId('project-name').value = orig ? orig.name : '';
    } else {
      var book = id ? notebooks.get(id) : null;
      heading = book ? 'Renomear caderno' : 'Novo caderno';
      byId('project-name').value = book ? book.name : '';
    }
    text(byId('notebook-form-heading'), heading);
    text(byId('project-error'), '');
    toggleStart(false); byId('notebook-dialog').hidden = false; byId('project-form').hidden = false; byId('project-name').focus();
  }
  function hideNotebookForm() { byId('notebook-dialog').hidden = true; byId('project-form').hidden = true; if (notebookReturn) { notebookReturn.focus(); } }
  function submitNotebook(event) {
    event.preventDefault();
    try {
      var value = projectName(byId('project-name').value); if (!value) { throw new Error('Dê um nome para continuar.'); }
      if (formTarget === 'original') {
        var orig;
        if (notebookEditing) {
          orig = originals.update(notebookEditing, { name: value });
          hideNotebookForm(); renderNotebooks(); updatePath();
        } else {
          orig = originals.add(value);
          hideNotebookForm(); openOriginal(orig.id);
        }
      } else {
        var book;
        if (notebookEditing) {
          book = notebooks.update(notebookEditing, { name: value });
          if (doc.projectId === book.id) { doc.project = book.name; }
          if (activeNotebookId === book.id) { cabinetProject = book.name; }
          hideNotebookForm(); renderNotebooks(); renderCabinet(); updatePath(); renderTimeline(false, null, true);
          if (workspaceUI) { workspaceUI.render(); }
        } else {
          book = notebooks.add(value, activeOriginalId || null);
          hideNotebookForm(); renderNotebooks(); openNotebook(book.id);
          if (workspaceUI) { workspaceUI.selectProject(book.id, ''); }
        }
      }
    } catch (e) { text(byId('project-error'), e.message || 'Não foi possível guardar.'); }
  }
  function exportNotebook(all) {
    if (!notebooks || composing || (chalkUI && !chalkUI.flush())) { return; }
    try {
      var book = activeNotebook(); if (!all && !book) { throw new Error('Abra o caderno que deseja exportar.'); }
      var payload = notebooks.pack(exportedDocuments(), all ? null : book.id); notebooks.validate(payload);
      download(JSON.stringify(payload), 'application/json', all ? 'escrevaral-todos.scrvrl' : (book.name.replace(/[^A-Za-z0-9À-ÿ_-]+/g, '-').slice(0, 80) || 'volume') + '.scrvrl');
    } catch (e) { message(e.message || 'Não foi possível reunir o caderno.'); }
  }
  function notebookStorage() {
    return {
      getItem: function (k) { var b = activeNotebook(); return k === 'vrda-planner' && b ? JSON.stringify(b.data.planner || {}) : storage.getItem(k); },
      setItem: function (k, value) { var b = activeNotebook(); if (k === 'vrda-planner' && b) { b.data.planner = JSON.parse(value); notebooks.update(b.id, { data: b.data }); } else { storage.setItem(k, value); } }
    };
  }
  function wireNotebooks() {
    listen(byId('desktop-organize'), 'click', function () { var open=byId('desktop-organize-menu').hidden; closeContextMenus(false); setDisclosure('desktop-organize','desktop-organize-menu',open); });
    listen(byId('original-more'), 'click', function () { var open=byId('original-more-menu').hidden; closeContextMenus(false); setDisclosure('original-more','original-more-menu',open); });
    listen(byId('notebook-more'), 'click', function () { var open=byId('notebook-more-menu').hidden; closeContextMenus(false); setDisclosure('notebook-more','notebook-more-menu',open); });
    listen(byId('start-tools-toggle'), 'click', function () { toggleDisclosure('start-tools-toggle','start-tools-items'); });
    listen(byId('start-system-toggle'), 'click', function () { toggleDisclosure('start-system-toggle','start-system-items'); });
    listen(byId('desktop-organize-menu'), 'click', function () { setDisclosure('desktop-organize','desktop-organize-menu',false); });
    listen(byId('original-more-menu'), 'click', function () { setDisclosure('original-more','original-more-menu',false); });
    listen(byId('notebook-more-menu'), 'click', function () { setDisclosure('notebook-more','notebook-more-menu',false); });
    listen(byId('project-new'), 'click', function () { showNotebookForm(null, 'volume'); });
    listen(byId('original-new'), 'click', function () { showNotebookForm(null, 'original'); });
    listen(byId('start-new-original'), 'click', function () { showNotebookForm(null, 'original'); });
    listen(byId('original-rename'), 'click', function () { showNotebookForm(activeOriginalId, 'original'); });
    listen(byId('original-export'), 'click', function () {
      if (!notebooks || composing || !activeOriginalId || (chalkUI && !chalkUI.flush())) { return; }
      try { var o = activeOriginal(), payload = notebooks.pack(exportedDocuments(), null, o.id); notebooks.validate(payload); download(JSON.stringify(payload), 'application/json', (o.name.replace(/[^A-Za-z0-9À-ÿ_-]+/g, '-').slice(0, 80) || 'original') + '.scrvrl'); }
      catch (e) { message(e.message || 'Não foi possível exportar a gaveta.'); }
    });
    listen(byId('original-trash'), 'click', function () {
      if (!checkpoint() || !rememberNotebook()) { return; } var o = activeOriginal(); if (!o) { return; }
      E.dialog.ask({title:'Mover gaveta para a lixeira?',message:'A gaveta “' + o.name + '” irá com seus cadernos. Você poderá restaurar tudo pelo menu Início.',accept:'Mover para a lixeira'},function (ok) {
        if (!ok || activeOriginalId !== o.id || !checkpoint() || !rememberNotebook()) { return; }
        try { originals.update(o.id, {trashed:true}); activeNotebookId = null; activeOriginalId = null; loadDocument(E.freshDocument()); closeNotebook(); renderNotebooks(); message('Gaveta guardada na lixeira com seus cadernos.'); } catch (e) { message(e.message); }
      });
    });
    listen(byId('notebook-parent-save'), 'click', function () {
      if (!checkpoint() || !rememberNotebook()) { return; } var b = activeNotebook(); if (!b) { return; }
      try { b = notebooks.update(b.id, {originalId:byId('notebook-parent').value || null}); activeOriginalId = b.originalId; renderNotebooks(); updatePath(); saveSession(); message('Organização do caderno guardada.'); } catch (e) { message(e.message); }
    });
    listen(byId('volume-new'), 'click', function () { showNotebookForm(null, 'volume'); });
    listen(byId('original-back'), 'click', closeOriginal);
    listen(byId('path-original'), 'click', function () {
      if (activeNotebook() && activeNotebook().originalId) {
        var oid = activeNotebook().originalId;
        openOriginal(oid);
      } else {
        closeNotebook();
      }
    });
    listen(byId('project-cancel'), 'click', hideNotebookForm);
    listen(byId('start-new-notebook'), 'click', function () { showNotebookForm(); });
    listen(byId('project-form'), 'submit', submitNotebook);
    listen(byId('notebook-dialog'), 'keydown', function (event) {
      if (event.keyCode === 27) { event.preventDefault(); event.stopPropagation(); hideNotebookForm(); }
      if (event.keyCode === 9) { var first = byId('project-name'), last = byId('project-cancel'); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } event.stopPropagation(); }
    });
    listen(byId('desktop-surface'), 'dblclick', function (event) { if (event.target === this || event.target === byId('notebook-list') || event.target === byId('notebook-area') || byId('notebook-hint').contains(event.target)) { showNotebookForm(); } });
    listen(byId('notebook-rename'), 'click', function () { showNotebookForm(activeNotebookId, 'volume'); });
    listen(byId('notebook-export'), 'click', function () { exportNotebook(false); });
    listen(byId('export-notebook'), 'click', function () { exportNotebook(false); });
    listen(byId('desk-minimize'), 'click', closeNotebook);
    listen(byId('notebook-trash'), 'click', function () {
      if (!checkpoint()) { return; } var b = activeNotebook(); if (!b) { return; }
      E.dialog.ask({title:'Mover caderno para a lixeira?',message:'O caderno “' + b.name + '” irá com todos os seus textos. Você poderá restaurá-lo pelo menu Início.',accept:'Mover para a lixeira'},function(ok){
        if (!ok || activeNotebookId !== b.id || !notebooks.get(b.id)) { return; }
        try { if (!checkpoint() || !rememberNotebook()) { return; } notebooks.update(b.id, { trashed: true }); activeNotebookId = null; loadDocument(E.freshDocument()); closeNotebook(); message('Caderno movido para a lixeira.'); } catch (e) { message('Não foi possível mover o caderno.'); }
      });
    });
    listen(window, 'storage', function (event) { if (event.key === 'escrevaral.astra.notebooks.v1' || event.key === 'escrevaral.astra.originais.v1' || event.key === 'escrevaral.astra.notebooks.transaction.v1') { if (storage.getItem('escrevaral.astra.notebooks.transaction.v1')) { return; } renderNotebooks(); var b = activeNotebook(); if (b) { cabinetProject = b.name; if (doc.projectId === b.id) { doc.project = b.name; } updatePath(); } } });
    renderNotebooks(); notebookReady = true;
  }

  function byId(id) { return document.getElementById(id); }
  function text(node, value) { node.textContent = value; }
  function listen(node, event, fn) { node.addEventListener(event, fn, false); }
  function paragraph(parent, value, className) { var p = document.createElement('p'); if (className) { p.className = className; } text(p, value); parent.appendChild(p); return p; }
  function button(parent, label, fn) { var b = document.createElement('button'); b.type = 'button'; text(b, label); listen(b, 'click', fn); parent.appendChild(b); return b; }
  var toastTimer = null;
  function showToast(value) {
    var toast = byId('esc-toast');
    if (!toast || !value) { return; }
    var v = String(value);
    if (v === 'Guardado neste aparelho.' || v === 'A folha é sua.' || v === 'Folha aberta.') { return; }
    text(toast, v);
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.hidden = true; }, 2800);
  }
  function message(value) { text(saveStatus, value); text(byId('cabinet-status'), value); text(byId('panel-status'), value); if (activePanel === 'acervo') { text(byId('archive-status'), value); } showToast(value); }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function timeLabel(date) { return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds()); }
  function noteDate(entry) { return entry.created || entry.updated; }
  function metadata(entry) { return { id: entry.id, noteId: entry.noteId || entry.id, kind: entry.kind, title: entry.title, text: entry.text || '', project: entry.project || '', projectId: entry.projectId || '', created: noteDate(entry), updated: entry.updated, createdApproximate: !entry.created || !!entry.createdApproximate }; }
  function monthLabel(key) { return months[Number(key.slice(5, 7)) - 1] + ' ' + key.slice(0, 4); }
  function dayLabel(key) { var d = new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, Number(key.slice(8, 10))); return d.getDate() + ' · ' + ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][d.getDay()]; }
  function openNote(entry) {
    if (composing || entry.id === doc.id || !persist()) { return; }
    try {
      var next = archive && archive.get(entry.id);
      if (!next) { renderTimeline(true); message('Esta nota mudou. Abra a versão guardada no acervo.'); return; }
      loadDocument(next); collapseTimeline(); showPanel('oficina', 'examinar-toggle', false);
      try { storage.setItem('escrevaral.astra.current', doc.id); } catch (ignore) { /* Preferência opcional. */ }
    } catch (e) { message('Não foi possível abrir esta nota. Sua escrita permanece aqui.'); }
  }
  function browseDate(month, day) {
    projectScope = false; navMonth = month; navDay = day; timelineCount = 40; byId('timeline-list').scrollTop = 0; renderTimeline(false);
  }
  var drawerRouteSignature = '';
  function renderDrawerRoute() {
    if (!notebooks || !originals) { return; }
    var books = notebooks.list().filter(availableBook), drawers = originals.list().filter(function (o) { return !o.trashed; });
    var signature = JSON.stringify([activeNotebookId, books.map(function (b) { return [b.id,b.name,b.originalId,b.color]; }), drawers.map(function (o) { return [o.id,o.name]; })]);
    if (signature === drawerRouteSignature) { return; }
    drawerRouteSignature = signature;
    var route = byId('drawer-route'); route.textContent = '';
    function group(id, name) {
      var children = books.filter(function (b) { return (b.originalId || '') === id; });
      if (!id && !children.length) { return; }
      var tray = document.createElement('details'), front = document.createElement('summary'), contents = document.createElement('div');
      tray.className = 'route-drawer'; tray.open = children.some(function (b) { return b.id === activeNotebookId; });
      front.title = name; text(front, name); tray.appendChild(front); contents.className = 'route-books'; tray.appendChild(contents);
      children.forEach(function (book) {
        var link = button(contents, book.name, function () {
          if (book.id === activeNotebookId) { collapseTimeline(); manuscript.focus(); return; }
          if (openNotebook(book.id)) { enterDesk(true); collapseTimeline(); }
        });
        link.setAttribute('data-route-book', book.id); link.setAttribute('title', book.name); link.setAttribute('aria-label', 'Escrever no caderno ' + book.name);
        link.setAttribute('aria-current', book.id === activeNotebookId ? 'true' : 'false');
        var spine = document.createElement('span'); spine.className = 'route-spine'; spine.style.backgroundColor = book.color; spine.setAttribute('aria-hidden','true'); link.insertBefore(spine,link.firstChild);
      });
      if (!children.length) { paragraph(contents, 'Nenhum caderno nesta gaveta.', 'quiet'); }
      route.appendChild(tray);
    }
    drawers.forEach(function (o) { group(o.id,o.name); }); group('', 'Na mesa');
  }
  function renderTimeline(refresh, previousId, reveal) {
    renderDrawerRoute();
    var list = byId('timeline-list'), date = new Date(noteDate(doc)), active = null, oldScroll = list.scrollTop, result;
    timelineRendering = true;
    text(byId('manuscript-date'), timeLabel(date) + ' · ' + date.getDate() + ' de ' + months[date.getMonth()] + ' de ' + date.getFullYear());
    byId('manuscript-date').setAttribute('datetime', noteDate(doc));
    byId('manuscript-date').setAttribute('aria-label', doc.created && !doc.createdApproximate ? 'Data de criação da folha' : 'Data preservada da folha antiga; criação desconhecida');
    if (refresh && archive) {
      try { result = archive.list(); timelineEntries = result.documents.map(metadata); timelineUnreadable = result.unreadable; } catch (ignore) { timelineUnreadable = 1; }
    }
    timelineEntries = timelineEntries.filter(function (entry) { return entry.id !== doc.id && entry.id !== previousId; });
    var current = metadata(doc); current.title = title.value; current.text = manuscript.value; timelineEntries.push(current);
    var inProject = projectScope && !byId('note-search').value;
    var entries = timelineEntries.filter(function (entry) { return entry.kind !== 'reminder' && (!activeNotebookId || entry.projectId === activeNotebookId); });
    var model = E.browseNotes(entries, { month: navMonth, day: navDay, query: byId('note-search').value });
    if (inProject) { model.notes = entries.slice().sort(function (a, b) { return a.created < b.created ? -1 : a.created > b.created ? 1 : 0; }); }
    text(byId('desk-project'), doc.project || 'Folhas avulsas');
    byId('scope-project').setAttribute('aria-pressed', projectScope ? 'true' : 'false');
    byId('scope-dates').setAttribute('aria-pressed', projectScope ? 'false' : 'true');
    var path = byId('date-path'); path.textContent = ''; path.hidden = inProject;
    byId('clear-search').hidden = !byId('note-search').value;
    if (inProject) { paragraph(path, doc.project || 'Folhas avulsas', 'path-label'); }
    else if (model.query) { paragraph(path, 'Resultados em todas as notas', 'path-label'); }
    else {
      button(path, 'Meses', function () { browseDate('', ''); });
      if (navMonth) { button(path, monthLabel(navMonth), function () { browseDate(navMonth, ''); }); }
      if (navDay) { var day = paragraph(path, dayLabel(navDay), 'path-label'); day.setAttribute('aria-current', 'page'); }
    }
    list.textContent = '';
    var groups = !inProject && !model.query && !navDay ? (navMonth ? model.days : model.months) : null;
    timelineTotal = groups ? 0 : model.notes.length;
    if (groups) {
      groups.forEach(function (group) {
        var b = button(list, '', function () { if (navMonth) { browseDate(navMonth, group.key); } else { browseDate(group.key, ''); } });
        b.className = 'date-folder';
        noteLabel(b, navMonth ? dayLabel(group.key) : monthLabel(group.key), group.count + (group.count === 1 ? ' nota' : ' notas'));
      });
      text(byId('navigator-status'), groups.length ? (navMonth ? 'Escolha um dia' : 'Escolha um mês') : 'Nenhuma nota nesta data.');
    } else {
      if (reveal) { model.notes.forEach(function (entry, i) { if (entry.id === doc.id) { timelineCount = Math.max(timelineCount, model.notes.length - i); } }); }
      var visible = model.notes.slice(-timelineCount);
      if (visible.length < model.notes.length) { var older = button(list, 'Anteriores ↑', olderNotes); older.className = 'timeline-older'; }
      visible.forEach(function (entry) {
        var when = new Date(entry.created), b = button(list, '', function () { openNote(entry); });
        noteLabel(b, entry.title, timeLabel(when) + (model.query ? ' · ' + when.toLocaleDateString('pt-BR') : ''));
        if (entry.id === doc.id) { active = b; }
        b.className = 'timeline-entry'; b.setAttribute('aria-current', entry.id === doc.id ? 'true' : 'false');
        b.setAttribute('aria-label', (entry.title || 'Sem título') + ', ' + when.toLocaleDateString('pt-BR') + ', ' + timeLabel(when) + (entry.createdApproximate ? '; data antiga preservada, criação desconhecida' : ''));
        b.setAttribute('title', entry.title || 'Sem título');
      });
      text(byId('navigator-status'), model.notes.length ? model.notes.length + (model.notes.length === 1 ? ' nota' : ' notas') : model.query ? 'Nenhuma nota encontrada.' : 'Nenhuma nota neste dia.');
    }
    if (timelineUnreadable) { text(byId('navigator-status'), byId('navigator-status').textContent + ' Algumas notas não puderam ser lidas.'); }
    list.scrollTop = reveal && active ? Math.max(0, active.offsetTop - list.clientHeight / 2 + active.offsetHeight / 2) : oldScroll;
    timelineRendering = false;
  }
  function olderNotes() {
    if (timelineRendering || timelineCount >= timelineTotal) { return; }
    var list = byId('timeline-list'), oldHeight = list.scrollHeight, oldScroll = list.scrollTop;
    timelineCount += 40; renderTimeline(false);
    list.scrollTop = oldScroll + list.scrollHeight - oldHeight;
  }
  function persist() {
    window.clearTimeout(timer);
    if (!dirty) { return true; }
    doc.title = title.value; doc.text = manuscript.value;
    if (!archive) { message('Sem gravação neste navegador. Baixe uma cópia em Ajustes.'); return false; }
    try {
      var previousId = doc.id, saved = archive.save(doc,forceHistory); doc = saved.document; dirty = false; forceHistory=false;
      message(saved.conflict ? 'Outra versão foi preservada no acervo.' : 'Guardado neste aparelho.');
      try { storage.setItem('escrevaral.astra.current', doc.id); } catch (ignore) { /* Só a preferência de abertura falhou. */ }
      if (!byId('acervo').hidden) { renderArchive(); }
      renderTimeline(false, previousId); refreshCounts(); saveSession();
      if (workspaceUI) { workspaceUI.render(); }
      checkPostWritePwa();
      if (E.ptbrPanelSaved) { E.ptbrPanelSaved(saved.conflict); }
      return true;
    } catch (e) { message('Não foi possível guardar. Seu texto está na folha; baixe uma cópia em Ajustes.'); return false; }
  }
  function isStandaloneApp() {
    var standalone = false;
    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        standalone = true;
      }
      if (typeof navigator.standalone === 'boolean' && navigator.standalone) {
        standalone = true;
      }
    } catch (ignore) {}
    return standalone;
  }
  function checkPostWritePwa() {
    if (isStandaloneApp() || !deferredInstallPrompt) { return; }
    try {
      if (storage && storage.getItem('escrevaral.pwa.dismissed') === '1') { return; }
    } catch (ignore) {}
    if (doc && doc.revision >= 1 && (doc.text || '').trim().length > 20) {
      var banner = byId('post-write-pwa');
      if (banner && banner.hidden) {
        banner.hidden = false;
        var actionBtn = byId('post-write-pwa-action');
        if (actionBtn && deferredInstallPrompt) { actionBtn.hidden = false; }
      }
    }
  }
  function invalidate() {
    if (pendingAnalysis === null && !activeLens && !byId('findings').childNodes.length) { return; }
    analysisEpoch+=1;window.clearTimeout(pendingAnalysis); pendingAnalysis = null;
    byId('findings').textContent = ''; snapshot = ''; activeLens = '';
    for (var i = 0; i < lensButtons.length; i += 1) { lensButtons[i].disabled = false; lensButtons[i].setAttribute('aria-pressed', 'false'); }
    text(analysisStatus, 'O manuscrito mudou. Escolha uma lente quando quiser examinar de novo.');
  }
  function changed() {
    analysisRange = null;
    growManuscript();
    dirty = true; invalidate(); text(byId('desk-count-status'), 'Texto alterado · contagem será atualizada ao guardar.'); window.clearTimeout(timer);
    if (!composing) { timer = window.setTimeout(persist, 1000); }
  }
  function noteLabel(parent, name, when) {
    var label = document.createElement('span'), stamp = document.createElement('small');
    label.className = 'note-name'; stamp.className = 'note-time';
    text(label, name || 'Sem título'); text(stamp, when); parent.appendChild(label); parent.appendChild(stamp);
  }
  function paragraphBounds(value, start, end) {
    start = Math.max(0, Math.min(value.length, start || 0)); end = Math.max(start, Math.min(value.length, end || start));
    var left = start ? value.lastIndexOf('\n', start - 1) + 1 : 0, right = value.indexOf('\n', end);
    return { start: left, end: right === -1 ? value.length : right };
  }
  function textPosition(offset) {
    var mirror = document.createElement('div'), marker = document.createElement('span'), style = window.getComputedStyle(manuscript);
    mirror.className = 'editor-measure'; mirror.style.width = manuscript.clientWidth + 'px';
    mirror.style.boxSizing = style.boxSizing || 'border-box';
    mirror.style.font = style.font; mirror.style.fontFamily = style.fontFamily; mirror.style.fontSize = style.fontSize;
    mirror.style.lineHeight = style.lineHeight; mirror.style.letterSpacing = style.letterSpacing;
    mirror.style.paddingTop = style.paddingTop; mirror.style.paddingRight = style.paddingRight;
    mirror.style.paddingBottom = style.paddingBottom; mirror.style.paddingLeft = style.paddingLeft;
    var line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.7;
    marker.style.display = 'inline-block'; marker.style.width = '0'; marker.style.height = line + 'px'; marker.style.verticalAlign = 'top';
    text(mirror, manuscript.value.slice(0, offset)); text(marker, '\u200b');
    mirror.appendChild(marker); document.body.appendChild(mirror);
    var top = marker.offsetTop, left = marker.offsetLeft;
    document.body.removeChild(mirror); return { top: top, left: left, line: line };
  }
  function updateFocus() {
    if (!window.getComputedStyle || !manuscript.style) { return; }
    var before = byId('focus-before'), after = byId('focus-after');
    if (!focusEnabled || !manuscript.value) { before.hidden = true; after.hidden = true; return; }
    /* A composição tem texto/seleção provisórios. Conservar a geometria estável,
       sem apagar as máscaras; a rolagem ainda desloca essa mesma geometria. */
    if (!composing) {
      var bounds = paragraphBounds(manuscript.value, manuscript.selectionStart, manuscript.selectionEnd);
      if (!focusMeasure || focusMeasure.value !== manuscript.value || focusMeasure.width !== manuscript.clientWidth || focusMeasure.start !== bounds.start || focusMeasure.end !== bounds.end) {
        focusMeasure = { value: manuscript.value, width: manuscript.clientWidth, start: bounds.start, end: bounds.end, first: textPosition(bounds.start), last: textPosition(bounds.end) };
      }
    }
    if (!focusMeasure) { return; }
    var first = focusMeasure.first, last = focusMeasure.last, height = manuscript.clientHeight;
    var top = Math.max(0, Math.min(height, first.top - manuscript.scrollTop));
    var bottom = Math.max(0, Math.min(height, last.top + last.line - manuscript.scrollTop));
    before.style.height = top + 'px'; after.style.top = bottom + 'px';
    before.hidden = top === 0; after.hidden = bottom >= height;
  }
  function growManuscript() {
    if (!window.getComputedStyle) { return; }
    window.clearTimeout(focusTimer); focusTimer = window.setTimeout(updateFocus, 40);
  }
  function cancelTypewriter() { window.clearTimeout(typewriterTimer); typewriterTimer = null; }
  function typingLineTarget() {
    if (immersion && visualMachine && visualMachine.anchorY() !== null && manuscript.getBoundingClientRect) {
      var rect = manuscript.getBoundingClientRect();
      var anchorOffset = visualMachine.anchorY() - rect.top;
      if (isFinite(anchorOffset) && anchorOffset > 40 && anchorOffset < manuscript.clientHeight) {
        return anchorOffset;
      }
    }
    return manuscript.clientHeight * 0.42;
  }
  function typewriterInsets() {
    if (!window.getComputedStyle || !manuscript.style || !manuscript.clientHeight) { return; }
    var style = window.getComputedStyle(manuscript), line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.7;
    var target = typingLineTarget();
    manuscript.style.paddingTop = Math.max(0, target - line / 2) + 'px';
    manuscript.style.paddingBottom = Math.max(0, manuscript.clientHeight - target - line / 2) + 'px';
    focusMeasure = null;
  }
  function centerTypingLine() {
    typewriterTimer = null;
    if (!window.getComputedStyle || composing || document.activeElement !== manuscript || manuscript.selectionStart !== manuscript.selectionEnd) { return; }
    var position = textPosition(manuscript.selectionStart);
    var nextScroll = Math.max(0, Math.round(position.top + position.line / 2 - typingLineTarget()));
    if (Math.abs(manuscript.scrollTop - nextScroll) > 1) {
      manuscript.scrollTop = nextScroll;
    }
    updateFocus();
    if (machineEnabled) { aimMachineStrike(position); }
  }
  function followTyping() {
    cancelTypewriter();
    if (!window.getComputedStyle || composing || document.activeElement !== manuscript) { return; }
    typewriterTimer = window.setTimeout(centerTypingLine, 20);
  }
  function dismissSelection() { dismissedSelection = copiedSelection; byId('selection-tools').hidden = true; }
  function captureSelection() {
    if (composing || activePanel || cabinetOpen || !byId('start-menu').hidden || document.activeElement !== manuscript) { return; }
    var start = manuscript.selectionStart, end = manuscript.selectionEnd;
    if (typeof start !== 'number' || typeof end !== 'number' || end <= start) { copiedSelection = null; dismissedSelection = null; byId('selection-tools').hidden = true; return; }
    if (dismissedSelection && dismissedSelection.documentId === (doc.noteId || doc.id) && dismissedSelection.text === manuscript.value && dismissedSelection.start === start && dismissedSelection.end === end) { return; }
    dismissedSelection = null;
    copiedSelection = { documentId: doc.noteId || doc.id, text: manuscript.value, start: start, end: end };
    if (wordCardUI && wordCardUI.trimWordSelection && wordCardUI.trimWordSelection(manuscript.value.slice(start, end), start)) {
      byId('selection-tools').hidden = true;
      return;
    }
    byId('selection-tools').hidden = false; text(byId('clipboard-status'), 'Trecho selecionado');
  }
  function copyInternal() {
    if (composing || !copiedSelection || copiedSelection.text !== manuscript.value || copiedSelection.documentId !== (doc.noteId || doc.id)) { return false; }
    internalClipboard = manuscript.value.slice(copiedSelection.start, copiedSelection.end);
    byId('desk-paste').hidden = false; byId('selection-paste').disabled = false;
    text(byId('clipboard-status'), 'Cópia interna guardada'); return true;
  }
  function pasteInternal() {
    if (composing || !internalClipboard) { return; }
    var start = manuscript.selectionStart || 0, end = manuscript.selectionEnd || start;
    manuscript.value = manuscript.value.slice(0, start) + internalClipboard + manuscript.value.slice(end);
    if (E.cartorio) { E.cartorio.recordSignal(doc, 'intPaste', internalClipboard.length); }
    E.transfer.selectRange(manuscript, start + internalClipboard.length, start + internalClipboard.length); manuscript.focus();
    copiedSelection = null; byId('selection-tools').hidden = true; changed(); queueSession();
  }
  function toggleStart(open) {
    if (open) { analysisRange = null; dismissSelection(); closePanels(false); }
    if (open) { setDisclosure('start-tools-toggle','start-tools-items',false); setDisclosure('start-system-toggle','start-system-items',false); }
    byId('start-menu').hidden = !open;
    byId('os-start').setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { byId('start-projects').focus(); }
  }
  function setDisclosure(toggleId,panelId,open) {
    var toggle=byId(toggleId),panel=byId(panelId); if(!toggle||!panel){return;}
    panel.hidden=!open;toggle.setAttribute('aria-expanded',open?'true':'false');
  }
  function toggleDisclosure(toggleId,panelId) {
    var panel=byId(panelId);if(!panel){return;}setDisclosure(toggleId,panelId,panel.hidden);
  }
  function closeContextMenus(restoreFocus) {
    var pairs=[['desktop-organize','desktop-organize-menu'],['original-more','original-more-menu'],['notebook-more','notebook-more-menu']],changed=false,focus=null,i;
    for(i=0;i<pairs.length;i+=1){if(!byId(pairs[i][1]).hidden){changed=true;focus=focus||byId(pairs[i][0]);setDisclosure(pairs[i][0],pairs[i][1],false);}}
    if(changed&&restoreFocus&&focus&&!focus.hidden){focus.focus();}return changed;
  }
  function saveSession() {
    if (!sessionReady || !storage) { return; }
    try {
      storage.setItem(sessionKey, JSON.stringify({ version: 1, view: cabinetOpen ? 'gabinete' : 'mesa', documentId: doc.noteId || doc.id,
        recordId: doc.id, start: manuscript.selectionStart || 0, end: manuscript.selectionEnd || 0, scroll: manuscript.scrollTop || 0,
        notebookId: activeNotebookId, originalId: activeOriginalId, project: cabinetProject, panel: activePanel, immersion: immersion, month: navMonth, day: navDay, projectScope: projectScope,
        search: byId('cabinet-search').value, noteSearch: byId('note-search').value,
        windowHidden: byId('cabinet-window').hidden, maximized: byId('cabinet-window').getAttribute('data-maximized') === 'true',
        left: byId('cabinet-window').style.left || '', top: byId('cabinet-window').style.top || '' }));
    } catch (e) { message('O estado da tela não foi guardado. Confira sua cópia do acervo.'); }
  }
  function checkpoint() { if (chalkUI && !chalkUI.flush()) { return false; } if (composing) { return false; } window.clearTimeout(sessionTimer); var ok = persist(); if (ok) { saveSession(); } return ok; }
  function queueSession() {
    if (!sessionReady || composing) { return; }
    window.clearTimeout(sessionTimer); sessionTimer = window.setTimeout(checkpoint, 350);
  }
  function restoreSession() {
    if (!storage) { return; }
    try {
      var state = JSON.parse(storage.getItem(sessionKey) || 'null'), saved;
      if (!state || state.version !== 1) { return; }
      activeNotebookId = notebooks && state.notebookId && availableBook(notebooks.get(state.notebookId)) ? state.notebookId : null;
      activeOriginalId = originals && state.originalId && originals.get(state.originalId) && !originals.get(state.originalId).trashed ? state.originalId : null;
      saved = typeof state.recordId === 'string' ? archive.get(state.recordId) : null;
      if (saved && !saved.trashed && saved.kind !== 'reminder' && (!saved.projectId || availableBook(notebooks.get(saved.projectId)))) { loadDocument(saved); }
      if (state.windowHidden) { activeNotebookId = null; activeOriginalId = originals && state.originalId && originals.get(state.originalId) && !originals.get(state.originalId).trashed ? state.originalId : null; }
      cabinetProject = typeof state.project === 'string' ? projectName(state.project) : null;
      byId('cabinet-search').value = typeof state.search === 'string' ? state.search.slice(0, 1000) : '';
      byId('note-search').value = typeof state.noteSearch === 'string' ? state.noteSearch.slice(0, 1000) : '';
      if (/^\d{4}-\d{2}$/.test(state.month)) { navMonth = state.month; }
      if (/^\d{4}-\d{2}-\d{2}$/.test(state.day)) { navDay = state.day; }
      projectScope = state.projectScope === true; renderCabinet(); renderTimeline(false);
      if (state.view === 'mesa' && state.documentId === (doc.noteId || doc.id)) {
        enterDesk(false);
        if (state.immersion === true) { immersion = true; document.body.setAttribute('data-immersion', 'true'); byId('immersion-toggle').setAttribute('aria-pressed', 'true'); byId('leave-focus').hidden = false; sizeWorkspace(); }
        var start = typeof state.start === 'number' && isFinite(state.start) ? Math.max(0, Math.min(doc.text.length, Math.floor(state.start))) : 0;
        var end = typeof state.end === 'number' && isFinite(state.end) ? Math.max(start, Math.min(doc.text.length, Math.floor(state.end))) : start;
        E.transfer.selectRange(manuscript, start, end); manuscript.scrollTop = typeof state.scroll === 'number' && isFinite(state.scroll) ? Math.max(0, state.scroll) : 0;
      } else {
        desktopWindow(state.windowHidden ? 'minimize' : 'open', false);
        setDesktopMaximized(state.maximized !== false);
        if (state.maximized === false && window.innerWidth > 760) {
          if (/^\d+(\.\d+)?px$/.test(state.left)) { byId('cabinet-window').style.left = Math.min(parseFloat(state.left), Math.max(0, window.innerWidth - 640)) + 'px'; byId('cabinet-window').style.right = 'auto'; }
          if (/^\d+(\.\d+)?px$/.test(state.top)) { byId('cabinet-window').style.top = Math.min(parseFloat(state.top), Math.max(0, window.innerHeight - 280)) + 'px'; }
        }
      }
      if (['oficina', 'acervo', 'mesa'].indexOf(state.panel) !== -1) { if (state.panel === 'acervo') { renderArchive(); } showPanel(state.panel, panelToggles[panelIds.indexOf(state.panel)], true); }
      if (state.documentId === (doc.noteId || doc.id)) {
        var savedStart = typeof state.start === 'number' && isFinite(state.start) ? Math.max(0, Math.min(doc.text.length, Math.floor(state.start))) : 0;
        var savedEnd = typeof state.end === 'number' && isFinite(state.end) ? Math.max(savedStart, Math.min(doc.text.length, Math.floor(state.end))) : savedStart;
        E.transfer.selectRange(manuscript, savedStart, savedEnd); manuscript.scrollTop = typeof state.scroll === 'number' && isFinite(state.scroll) ? Math.max(0, state.scroll) : 0;
        cabinetSelection = { noteId: doc.noteId || doc.id, start: savedStart, end: savedEnd, scroll: manuscript.scrollTop };
      }
      updatePath();
    } catch (e) { message('Não foi possível retomar a tela anterior. O acervo foi preservado.'); }
  }
  function renderReminders() {
    var list = byId('reminder-list'); list.textContent = '';
    if (!archive) { return; }
    try {
      archive.list(true).documents.filter(function (entry) { return entry.kind === 'reminder' && !entry.trashed && (activeNotebookId ? entry.projectId === activeNotebookId : !entry.projectId); }).forEach(function (entry) {
        var card = document.createElement('div'), field = document.createElement('textarea'), saved = entry;
        card.className = 'desktop-reminder'; field.value = entry.text; field.setAttribute('aria-label', 'Post-it'); field.setAttribute('maxlength', '2000');
        field.rows = 4; card.appendChild(field);
        listen(field, 'input', function () {
          var next = JSON.parse(JSON.stringify(saved)); next.text = field.value; next.title = field.value.split(/\r?\n/)[0].slice(0, 60) || 'Post-it';
          try { saved = archive.save(next).document; text(byId('reminder-status'), 'Post-it guardado.'); }
          catch (e) { text(byId('reminder-status'), 'Não foi possível guardar. Copie este post-it antes de sair.'); }
        });
        var discard = button(card, '', function () { E.dialog.ask({title:'Mover post-it para a lixeira?',message:'Você poderá restaurá-lo pelo menu Início.',accept:'Mover para a lixeira'},function(ok){ if(ok){ trashEntry(saved); byId('reminder-new').focus(); } }); });
        discard.className = 'reminder-trash'; discard.setAttribute('aria-label', 'Mover post-it para a lixeira'); discard.setAttribute('title', 'Mover para a lixeira');
        discard.innerHTML = '<svg class="reminder-trash-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7"/></svg>'; list.appendChild(card);
      });
    } catch (e) { text(byId('reminder-status'), 'Não foi possível ler os post-its.'); }
  }
  function trashEntry(entry) {
    if (!archive || !persist()) { return; }
    if (entry && entry.locked) { message('Esta folha de referência está protegida contra exclusão.'); return; }
    var isCurrent = entry.id === doc.id || (entry.noteId || entry.id) === (doc.noteId || doc.id);
    try {
      archive.trash(isCurrent ? doc : entry);
      if (isCurrent) { var next = archive.list().documents[0] || E.freshDocument(); loadDocument(next); cabinetSelection = null; }
      renderArchive(); renderReminders(); renderCabinet(); renderTimeline(false); saveSession();
      if (workspaceUI) { workspaceUI.render(); }
      message('Movido para a lixeira. Você pode restaurar pela Biblioteca.');
    } catch (e) { message('Não foi possível mover para a lixeira. A folha foi preservada.'); }
  }
  function askDelete(entry) {
    E.dialog.ask({title:'Excluir definitivamente?',message:'“' + (entry.title || 'Sem título') + '” será apagada definitivamente do acervo deste aparelho. Não será possível restaurar esta cópia. Arquivos exportados e versões em outras abas não são apagados.',accept:'Excluir definitivamente'},function(ok){
      if (!ok) { return; }
      try { archive.purge(entry); linguisticStore.removeDocument('analysis/'+(entry.projectId||'avulsos')+'/'+(entry.noteId||entry.id)+'/'); renderArchive(); byId('trash-toggle').focus(); message('Cópia excluída definitivamente deste acervo.'); }
      catch (e) { text(byId('archive-status'),e.message); }
    });
  }

  function updatePath() {
    var project = cabinetOpen ? cabinetProject : projectName(doc.project), currentId, names = { oficina: 'Examinar', acervo: 'Acervo', mesa: 'Ajustes', 'lineage-panel':'Versões' };
    var orig = activeOriginal();
    if (!orig && activeNotebook() && activeNotebook().originalId && originals) {
      orig = originals.get(activeNotebook().originalId);
    }
    if (orig && (activeOriginalId || project !== null)) {
      byId('path-original-separator').hidden = false;
      byId('path-original').hidden = false;
      text(byId('path-original'), orig.name);
      byId('path-original').setAttribute('title', 'Gaveta: ' + orig.name);
    } else {
      byId('path-original-separator').hidden = true;
      byId('path-original').hidden = true;
    }
    byId('path-project').hidden = byId('path-project-separator').hidden = project === null;
    text(byId('path-project'), project || 'Textos avulsos');
    byId('path-project').setAttribute('title', project || 'Textos avulsos');
    if (byId('path-folder')) { var hasFolder = !cabinetOpen && !!(doc.folder && doc.folder.length); byId('path-folder').hidden = byId('path-folder-separator').hidden = !hasFolder; text(byId('path-folder'), doc.folder || ''); }
    byId('path-document').hidden = byId('path-document-separator').hidden = cabinetOpen;
    text(byId('path-document'), title.value || 'Sem título');
    byId('path-document').setAttribute('title', title.value || 'Sem título');
    var showEstanteCrumb = cabinetOpen && !activePanel && project === null && !activeOriginalId;
    byId('path-panel').hidden = byId('path-panel-separator').hidden = !activePanel && !showEstanteCrumb;
    text(byId('path-panel'), activePanel ? (activePanel === 'utilidades' ? byId('utility-heading').textContent : activePanel === 'focus-pause' ? 'Pausa' : names[activePanel] || '') : showEstanteCrumb ? 'Estante de cadernos' : '');
    var pathRet = byId('esc-path-return');
    if (pathRet) {
      var showReturn = !!(cabinetOpen || activePanel);
      pathRet.hidden = !showReturn;
      if (showReturn) {
        text(pathRet, activePanel ? '← Fechar painel' : '← Voltar à escrita');
      }
    }
    currentId = activePanel || showEstanteCrumb ? 'path-panel' : !cabinetOpen ? 'path-document' : project !== null ? 'path-project' : activeOriginalId ? 'path-original' : 'path-projects';
    ['path-home', 'path-projects', 'path-original', 'path-project', 'path-document', 'path-panel'].forEach(function (id) {
      var el = byId(id);
      if (el) { el.removeAttribute('aria-current'); if (id === currentId) { el.setAttribute('aria-current', 'location'); } }
    });
  }
  function pathToProjects(all) {
    if (cabinetOpen) {
      if (all) { closeOriginal(); return; }
      var selected = cabinetProject;
      cabinetProject = selected; byId('cabinet-search').value = ''; renderCabinet();
      return;
    }
    if (workspaceUI) {
      if (all) { workspaceUI.selectLibrary('all'); }
      else if (doc.projectId) { workspaceUI.selectProject(doc.projectId, doc.folder || ''); }
      else { workspaceUI.selectLibrary('all'); }
    }
  }
  function sizeWorkspace() {
    var area = byId('writing-space');
    if (area.style && window.innerHeight) {
      var height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      area.style.height = Math.max(0, height - byId('location-path').offsetHeight - byId('system-bar').offsetHeight) + 'px'; byId('gabinete').style.height = Math.max(0, height - byId('location-path').offsetHeight - byId('system-bar').offsetHeight) + 'px';
      byId('machine-shell').style.height = height + 'px';
      var topBar=byId('location-path').offsetHeight,bottomBar=byId('system-bar').offsetHeight;
      sizePanels(height,topBar,bottomBar);
      document.body.setAttribute('data-viewport', height < 360 ? 'small' : height < 480 ? 'compact' : 'full');
      var browser = byId('note-browser');
      if (browser.style) { browser.style.height = window.innerWidth <= 760 && height < 480 ? Math.max(84, height - 108) + 'px' : ''; }
    }
    typewriterInsets(); growManuscript(); followTyping(); renderTimeline(false, null, true);
  }
  function sizePanels(height,topBar,bottomBar) {
    var desktop = window.innerWidth > 760;
    panelIds.forEach(function(id){var p=byId(id),margin=desktop?0:8,available=Math.max(0,height-topBar-bottomBar-margin*2),width=id==='utilidades'?(p.getAttribute('data-tool')==='calculator'?340:p.getAttribute('data-tool')==='calendar'?420:380):id==='lineage-panel'?560:440;
      p.style.bottom='auto';p.style.top=(topBar+(id==='focus-pause'?0:margin))+'px';
      if(id==='focus-pause'){p.style.height=Math.max(0,height-topBar-bottomBar)+'px';p.style.maxHeight='none';return;}
      p.style.width=(!desktop?Math.max(0,window.innerWidth-margin*2):Math.min(width,Math.max(0,window.innerWidth-margin*2)))+'px';
      p.style.right=margin+'px';
      p.style.height=desktop?available+'px':'auto';
      p.style.maxHeight=available+'px';
    });
  }
  function revealSelection(start, end, fallbackMessage) {
    returnToWriting();
    if (typeof richUI !== 'undefined' && richUI && richUI.isRich()) {
      if (!richUI.revealRange(start, end)) { message(fallbackMessage || 'Selecione o trecho manualmente no manuscrito.'); return false; }
      return true;
    }
    if (!E.transfer.selectRange(manuscript, start, end)) { message(fallbackMessage || 'Selecione o trecho manualmente no manuscrito.'); return false; }
    if (!window.getComputedStyle) { return true; }
    manuscript.scrollTop = Math.max(0, textPosition(start).top - manuscript.clientHeight / 3); updateFocus(); return true;
  }
  function collapseTimeline() {
    byId('desk-documents').setAttribute('aria-expanded', 'false');
    byId('timeline-toggle').setAttribute('aria-expanded', 'false');
    byId('timeline-toggle').parentNode.parentNode.setAttribute('data-expanded', 'false');
  }
  function closePanels(restore) {
    if (E.ptbrPanelReset) { E.ptbrPanelReset(); }
    invalidate();
    var trigger = panelTrigger;
    if (trigger && trigger.setAttribute) { trigger.setAttribute('aria-expanded', 'false'); }
    panelIds.forEach(function (id, i) { byId(id).hidden = true; byId(panelToggles[i]).setAttribute('aria-expanded', 'false'); });
    activePanel = ''; panelTrigger = null; updatePath();
    byId('panel-backdrop').hidden = true; document.body.setAttribute('data-panel', 'closed');
    byId('writing-space').removeAttribute('aria-hidden'); byId('gabinete').removeAttribute('aria-hidden');
    if (restore && trigger && trigger.focus) { if (/^start-/.test(trigger.id || '') && byId('start-menu').hidden) { byId('os-start').focus(); } else { trigger.focus(); } } queueSession();
  }
  function showPanel(id, toggle, open) {
    dismissSelection();
    if (!open) { if (activePanel === id) { if (id === 'oficina') { analysisRange = null; } closePanels(true); } return; }
    closePanels(false); collapseTimeline();
    panelTrigger = byId(toggle); activePanel = id; text(byId('panel-status'), '');
    byId(id).hidden = false; byId(toggle).setAttribute('aria-expanded', 'true');
    byId('panel-backdrop').hidden = false; document.body.setAttribute('data-panel', 'open');
    byId(id).focus(); byId('writing-space').setAttribute('aria-hidden', 'true'); byId('gabinete').setAttribute('aria-hidden', 'true');
    if (id === 'mesa') { notebookLabels(); }sizePanels(window.visualViewport?window.visualViewport.height:window.innerHeight,byId('location-path').offsetHeight,byId('system-bar').offsetHeight);
    updatePath(); queueSession();
  }
  function openExaminePanel(options) {
    options = options || {};
    if (dirty && archive && !composing) { persist(); }
    analysisRange = options.range || null;
    showPanel('oficina', options.toggle || 'examinar-toggle', true);
    if (E.ptbrPanelOpen) { E.ptbrPanelOpen({ group: options.group, lens: options.lens }); return; }
    if (options.lens) { examine(options.lens); return; }
    if (options.legacyLens) {
      for (var j = 0; j < lensButtons.length; j += 1) {
        if (lensButtons[j].getAttribute('data-lens') === options.legacyLens) { lensButtons[j].focus(); break; }
      }
      return;
    }
    if (E.ptbrPanelFocus) { E.ptbrPanelFocus(); } else { lensButtons[0].focus(); }
  }
  function setImmersion(enabled, reason) {
    var start = manuscript.selectionStart, end = manuscript.selectionEnd, scroll = manuscript.scrollTop;
    var oldInset = manuscript.style ? parseFloat(manuscript.style.paddingTop) || 0 : 0;
    cancelTypewriter(); closePanels(false); collapseTimeline();
    document.body.setAttribute('data-counts', 'false'); byId('desk-counts').setAttribute('aria-expanded', 'false');
    immersion = enabled; document.body.setAttribute('data-immersion', enabled ? 'true' : 'false');
    byId('immersion-toggle').setAttribute('aria-pressed', enabled ? 'true' : 'false');
    byId('leave-focus').hidden = !enabled;
    if (visualMachine) { visualMachine.setFocusActive(enabled); }
    if (superfocoUI) { superfocoUI.notifyState(enabled, reason || (enabled ? 'manual' : 'manual')); }
    if (richUI && richUI.isRich() && byId('esc-rich-editor')) {
      byId('esc-rich-editor').focus();
    } else {
      manuscript.focus();
    }
    sizeWorkspace();
    if (!(richUI && richUI.isRich())) {
      if (typeof start === 'number') { E.transfer.selectRange(manuscript, start, end); }
      manuscript.scrollTop = Math.max(0, scroll + (manuscript.style ? parseFloat(manuscript.style.paddingTop) || 0 : 0) - oldInset);
    }
    growManuscript();
  }
  function stopMachineStrike() {
    window.clearTimeout(machineTimer); machineTimer = null; machinePendingStrike = false;
    byId('machine-hammer').setAttribute('data-strike', 'false');
  }
  function aimMachineStrike(position) {
    if (!manuscript.getBoundingClientRect || !byId('machine-shell').getBoundingClientRect) { return; }
    var rect = manuscript.getBoundingClientRect(), shell = byId('machine-shell').getBoundingClientRect();
    var x = rect.left + (position.left || 0) - (manuscript.scrollLeft || 0) - shell.left;
    var y = rect.top + position.top - manuscript.scrollTop + position.line / 2 - shell.top;
    var height = shell.bottom - shell.top, hammer = byId('machine-hammer');
    if (y < 0 || y > height - 12 || x < 0 || x > shell.right - shell.left) { stopMachineStrike(); return; }
    hammer.style.left = x + 'px'; hammer.style.top = y + 'px'; hammer.style.height = Math.max(0, height - 12 - y) + 'px';
    if (machinePendingStrike) { machinePendingStrike = false; machineStrike(true); }
  }
  function machineStrike(ready) {
    if (!machineEnabled || composing || document.hidden || machineTimer !== null) { return; }
    if (!ready && window.getComputedStyle && manuscript.getBoundingClientRect) { machinePendingStrike = true; return; }
    byId('machine-hammer').setAttribute('data-strike', 'true');
    machineTimer = window.setTimeout(stopMachineStrike, 90);
  }
  function paintMachineCarriage(feed) {
    var paperTransform = 'translate(' + (-machineCarriage) + 'px,' + (feed ? -3 : 0) + 'px)';
    var paper = byId('writing-paper'), platen = byId('machine-platen');
    paper.style.webkitTransform = paperTransform; paper.style.transform = paperTransform;
    platen.style.webkitTransform = 'translateX(' + (-machineCarriage) + 'px)'; platen.style.transform = platen.style.webkitTransform;
    platen.setAttribute('data-feed', feed ? 'true' : 'false');
  }
  function finishMachineFeed() {
    window.clearTimeout(machineFeedTimer); machineFeedTimer = null; paintMachineCarriage(false);
  }
  function machineInput(event) {
    if (!machineEnabled || composing || document.hidden) { return; }
    var delta = manuscript.value.length - machineLastLength, caret = manuscript.selectionStart || 0;
    var newline = (delta === 1 && manuscript.value.charAt(caret - 1) === '\n') ||
      (event && (event.inputType === 'insertLineBreak' || event.inputType === 'insertParagraph'));
    machineLastLength = manuscript.value.length;
    if (newline) {
      machineCarriage = 0; window.clearTimeout(machineFeedTimer); paintMachineCarriage(true);
      machineFeedTimer = window.setTimeout(finishMachineFeed, 120);
    } else {
      machineCarriage = Math.max(0, Math.min(6, machineCarriage + (delta > 0 ? 0.75 : delta < 0 ? -0.75 : 0)));
      paintMachineCarriage(false);
    }
    machineStrike();
  }
  function setMachine(enabled) {
    if (visualMachine) {
      visualMachine.setEnabled(enabled);
      byId('machine-toggle').setAttribute('aria-pressed', enabled ? 'true' : 'false');
      text(byId('machine-toggle'), enabled ? 'Desativar' : 'Ativar');
      sizeWorkspace();
      return;
    }
    if (enabled === machineEnabled) { return; }
    if (enabled) { machinePreviousFocus = immersion; }
    machineEnabled = enabled; stopMachineStrike(); machineCarriage = 0; machineLastLength = manuscript.value.length; finishMachineFeed();
    document.body.setAttribute('data-machine', enabled ? 'true' : 'false');
    byId('machine-shell').hidden = !enabled;
    byId('machine-toggle').setAttribute('aria-pressed', enabled ? 'true' : 'false');
    text(byId('machine-toggle'), enabled ? 'Desativar' : 'Ativar');
    byId('leave-focus').setAttribute('aria-label', enabled ? 'Sair da máquina antiga' : 'Sair do modo foco');
    byId('leave-focus').setAttribute('title', enabled ? 'Sair da máquina antiga (Esc)' : 'Sair do foco (Esc)');
    if (!enabled) {
      byId('writing-paper').style.transform = ''; byId('writing-paper').style.webkitTransform = '';
      byId('machine-platen').style.transform = ''; byId('machine-platen').style.webkitTransform = '';
    }
    setImmersion(enabled || machinePreviousFocus);
  }
  function leaveImmersion() { if (machineEnabled) { setMachine(false); } else { setImmersion(false); } }
  function preparePrint() {
    text(byId('print-title'), title.value); byId('print-title').hidden = !title.value;
    text(byId('print-text'), manuscript.value);
  }
  function finishPrint() {
    text(byId('print-title'), ''); text(byId('print-text'), '');
  }
  function returnToWriting() { analysisRange = null; if (cabinetOpen) { enterDesk(); } closePanels(false); collapseTimeline(); manuscript.focus(); }
  function loadDocument(next) {
    if(E.ptbrPanelReset){E.ptbrPanelReset();}
    analysisRange = null; copiedSelection = null; byId('selection-tools').hidden = true;
    doc = next; if (doc.projectId) { activeNotebookId = doc.projectId; cabinetProject = doc.project || ''; var loadedBook = notebooks && notebooks.get(doc.projectId); activeOriginalId = loadedBook ? loadedBook.originalId || null : null; } navDay = E.noteDateKey(doc); navMonth = navDay.slice(0, 7); timelineCount = 40; title.value = doc.title; manuscript.value = doc.text; dirty = false; manuscript.scrollTop = 0; E.transfer.selectRange(manuscript, 0, 0); growManuscript();
    invalidate(); text(analysisStatus, 'Nenhuma análise iniciada.');
    byId('reset-dismissed').hidden = !doc.dismissed.length;
    var isLockedRef = !!(doc.locked || doc.category === 'reference');
    title.readOnly = isLockedRef;
    manuscript.readOnly = isLockedRef;
    if (byId('esc-reference-banner')) { byId('esc-reference-banner').hidden = !isLockedRef; }
    var refView = byId('esc-reference-view');
    if (refView) {
      if (isLockedRef && E.renderReferenceView) {
        refView.hidden = false;
        if (byId('editor-viewport')) { byId('editor-viewport').hidden = true; }
        E.renderReferenceView(refView, doc.title, doc.text, function () { trashEntry(doc); });
      } else {
        refView.hidden = true;
        if (byId('editor-viewport')) { byId('editor-viewport').hidden = false; }
      }
    }
    if (richUI) { richUI.loadDoc(doc); }
    if (wordCardUI) { wordCardUI.hide(false); }
    if (sonnetUI) { sonnetUI.sync(doc); }
    if (superfocoUI) { superfocoUI.resetDocument(); }
    message(doc.revision ? 'Guardado neste aparelho.' : 'A folha é sua.'); updatePath();
    renderTimeline(true, null, true); refreshCounts();
    if (workspaceUI) { workspaceUI.render(); }
  }
  function renderArchive() {
    var list = byId('document-list'); list.textContent = '';
    if (!archive) { text(byId('archive-status'), 'O acervo não está disponível. Sua folha continua aberta.'); return; }
    try {
      var result = archive.list(trashView);
      if (trashView) { result.documents = result.documents.filter(function (entry) { return !!entry.trashed; }); }
      else if (activeNotebookId) { result.documents = result.documents.filter(function (entry) { return entry.projectId === activeNotebookId; }); }
      if (trashView && originals) { originals.list().filter(function (o) { return o.trashed; }).forEach(function (o) { var li = document.createElement('li'); paragraph(li, 'Gaveta: ' + o.name); button(li, 'Restaurar gaveta completa', function () { try { originals.update(o.id, {trashed:false}); renderNotebooks(); renderArchive(); message('Gaveta restaurada com seus cadernos.'); } catch (e) { message(e.message); } }); list.appendChild(li); }); }
      if (trashView && notebooks) { notebooks.list().filter(function (b) { return b.trashed && (!b.originalId || !originals.get(b.originalId).trashed); }).forEach(function (b) { var li = document.createElement('li'); paragraph(li, 'Caderno: ' + b.name); button(li, 'Restaurar caderno completo', function () { try { notebooks.update(b.id, { trashed: false }); renderNotebooks(); renderArchive(); message('Caderno restaurado com todo o conteúdo.'); } catch (e) { message(e.message); } }); list.appendChild(li); }); }
      text(byId('acervo-heading'), trashView ? 'Lixeira' : 'Acervo');
      text(byId('trash-toggle'), trashView ? 'Voltar ao acervo' : 'Lixeira'); byId('trash-toggle').setAttribute('aria-pressed', trashView ? 'true' : 'false');
      text(byId('archive-status'), result.unreadable ? 'Algumas folhas não puderam ser lidas. Os registros originais foram preservados.' : result.documents.length ? '' : 'Sua primeira folha começa aqui.');
      result.documents.forEach(function (entry) {
        var li = document.createElement('li');
        if (trashView) {
          paragraph(li, entry.title || (entry.kind === 'reminder' ? 'Post-it' : 'Sem título'));
          button(li, 'Restaurar', function () { try { archive.trash(entry, false); renderArchive(); renderReminders(); renderCabinet(); message('Restaurado.'); } catch (e) { message('Não foi possível restaurar. A cópia permanece na lixeira.'); } });
          button(li, 'Excluir definitivamente', function () { askDelete(entry); }); list.appendChild(li); return;
        }
        var b = button(li, '', function () {
          var isCurrent = entry.id === doc.id;
          if (!persist()) { return; }
          loadDocument(isCurrent ? doc : entry); showPanel('acervo', 'acervo-toggle', false);
          try { storage.setItem('escrevaral.astra.current', doc.id); } catch (ignore) { /* Preferência opcional. */ }
          enterDesk(); message('Folha aberta.');
        });
        noteLabel(b, entry.title, timeLabel(new Date(noteDate(entry))) + ' · ' + new Date(noteDate(entry)).toLocaleDateString('pt-BR'));
        b.setAttribute('aria-current', entry.id === doc.id ? 'true' : 'false'); button(li, 'Mover para a lixeira', function () { trashEntry(entry); }); list.appendChild(li);
      });
    } catch (e) { text(byId('archive-status'), 'Não foi possível ler o acervo. Nenhum registro foi alterado.'); }
  }
  function findingKey(f) { return f.id + '|' + f.snippet; }
  /* A revisão progressiva respeita as escolhas já mantidas no caderno. */
  E.ptbrPanelDocument=function(){return doc.noteId||doc.id;};
  E.ptbrPanelTitle=function(){return (title&&title.value?title.value:(doc.title||''))||'Nota sem título';};
  E.ptbrPanelRevision=function(){return doc.id+'|'+doc.revision;};
  E.ptbrPanelRequest=function(snapshot,start,end){return E.analysisContract.request(doc,snapshot,start,end);};
  E.ptbrPanelCurrent=function(request){return E.analysisContract.current(request,doc,manuscript.value);};
  E.ptbrPanelKeep=function(f,source,key){
    if(source!==manuscript.value||key!==(doc.noteId||doc.id)){return false;}
    var choice=findingKey(f),added=doc.dismissed.indexOf(choice)<0,wasDirty=dirty;if(added){doc.dismissed.push(choice);dirty=true;}
    var saved=persist();if(!saved&&added){doc.dismissed.splice(doc.dismissed.indexOf(choice),1);dirty=wasDirty;}byId("reset-dismissed").hidden=!doc.dismissed.length;return saved;
  };
  E.ptbrPanelChoices=function(){ return (doc.dismissed||[]).slice(); };
  E.ptbrPanelReveal=revealSelection;
  E.ptbrPanelFlush=function(){if(dirty&&archive&&!composing){return persist();}return true;};
  E.ptbrPanelSelection=function(){return analysisRange&&analysisRange.documentId===(doc.noteId||doc.id)&&analysisRange.text===manuscript.value?analysisRange:null;};
  function renderResult(result) {
    var list = byId('findings'), visible = 0; list.textContent = '';
    result.findings.forEach(function (f) {
      if (doc.dismissed.indexOf(findingKey(f)) !== -1) { return; }
      visible += 1;
      var li = document.createElement('li'); li.className = 'finding';
      paragraph(li, f.id + ' · ' + f.severity + ' · confiança ' + f.confidence, 'meta');
      var heading = document.createElement('h3'); text(heading, f.message); li.appendChild(heading);
      var quote = document.createElement('blockquote'); text(quote, snapshot.slice(Math.max(0, f.start - 40), Math.min(snapshot.length, f.end + 40))); li.appendChild(quote);
      var details = document.createElement('div'); details.className = 'evidence'; details.hidden = true;
      ['observation', 'interpretation', 'ambiguity', 'limit'].forEach(function (key, i) { paragraph(details, ['Observação: ', 'Interpretação: ', 'Ambiguidade: ', 'Limite: '][i] + f.evidence[key]); });
      paragraph(details, 'Referência: ' + f.evidence.source.title + '. A consulta desta lente usa somente a base guardada na mesa.');
      var detailButton = button(li, 'Ver evidência', function () { details.hidden = !details.hidden; detailButton.setAttribute('aria-expanded', details.hidden ? 'false' : 'true'); text(detailButton, details.hidden ? 'Ver evidência' : 'Fechar evidência'); });
      detailButton.setAttribute('aria-expanded', 'false');
      button(li, 'Ver na folha', function () { if (snapshot !== manuscript.value) { invalidate(); return; } revealSelection(f.start, f.end); });
      button(li, 'Manter minha escolha', function () {
        if (snapshot !== manuscript.value) { invalidate(); return; }
        doc.dismissed.push(findingKey(f)); dirty = true; persist(); renderResult(result);
        byId('reset-dismissed').focus();
      });
      li.appendChild(details); list.appendChild(li);
    });
    text(analysisStatus, (visible ? visible + (visible === 1 ? ' observação para você examinar.' : ' observações para você examinar.') : 'Nenhum apontamento novo nesta base limitada.') + (result.limited ? ' A leitura foi limitada aos primeiros 100 apontamentos encontrados.' : ''));
    if (result.status === 'insuficiente') { text(analysisStatus, result.assessment.reason); }
    text(byId('analysis-coverage'), (result.source && (result.source.start || result.source.end < snapshot.length) ? 'Trecho selecionado. ' : '') + result.coverage);
    byId('reset-dismissed').hidden = !doc.dismissed.length;
  }
  E.ptbrLegacyCancel = invalidate;
  function examine(lens) {
    if (composing) { return; }
    if (E.ptbrPanelReset) { E.ptbrPanelReset(); }
    invalidate();
    if(dirty&&archive){persist();}snapshot = manuscript.value; activeLens = lens;
    var selected = analysisRange && analysisRange.documentId === (doc.noteId || doc.id) && analysisRange.text === snapshot ? analysisRange : null;
    var request = E.analysisContract.request(doc, snapshot, selected ? selected.start : 0, selected ? selected.end : snapshot.length);
    byId('findings').textContent = '';
    text(analysisStatus, 'Observando o manuscrito…');
    for (var i = 0; i < lensButtons.length; i += 1) { lensButtons[i].disabled = false; lensButtons[i].setAttribute('aria-pressed', lensButtons[i].getAttribute('data-lens') === lens ? 'true' : 'false'); }
    var token=++analysisEpoch;
    pendingAnalysis=window.setTimeout(function(){
      function complete(record){
        if(token!==analysisEpoch){return;}pendingAnalysis=null;
        try{
          if(!E.analysisContract.current(request,doc,manuscript.value)){invalidate();return;}
          var cached=E.linguistics.match(record,lens,request),result=cached?JSON.parse(JSON.stringify(record.result)):E.analysisContract.analyze(vault,lens,request);
          if(cached){result.source=JSON.parse(JSON.stringify(request.source));result.processing={mode:'persistido'};}
          if(!cached||!E.linguistics.fromDoc(doc,lens,request)){var saved=E.linguistics.remember(doc,request,result);if(saved){dirty=true;persist();linguisticStore.put('analysis/'+(doc.projectId||'avulsos')+'/'+(doc.noteId||doc.id)+'/'+lens,saved);}}
          renderResult(result);linguisticStore.corpus();
        }catch(e){text(analysisStatus,e.message);}
        for(var j=0;j<lensButtons.length;j+=1){lensButtons[j].disabled=false;}
      }
      var record=E.linguistics.fromDoc(doc,lens,request);if(record){complete(record);}else{linguisticStore.get('analysis/'+(doc.projectId||'avulsos')+'/'+(doc.noteId||doc.id)+'/'+lens,complete);}
    },20);
  }

  function showTransfer(contents, name, importing) {
    showPanel('mesa', 'mesa-toggle', true);
    byId('transfer-box').hidden = false;
    byId('transfer-content').value = contents; byId('transfer-content').readOnly = !importing;
    byId('transfer-name').value = name; byId('transfer-name').readOnly = !importing;
    byId('transfer-import').hidden = !importing;
    text(byId('transfer-help'), importing ? 'Cole o conteúdo completo do arquivo. Ele será conferido antes de pedir sua confirmação.' : 'O download não ficou disponível. Copie todo este conteúdo e guarde em um arquivo de texto com o nome indicado. Esta cópia contém exatamente o que seria baixado.');
    byId('transfer-content').focus();
  }
  function download(contents, mime, name, host) {
    var saved = E.transfer.download(contents, mime, name, function (value, filename) { showTransfer(value, filename, false); }, host);
    message(saved ? 'Cópia preparada. Confira o arquivo salvo.' : 'Cópia disponível em Ajustes para selecionar e guardar.');
    return saved;
  }
  function exportedDocuments() {
    var result = archive ? archive.list(true) : { documents: [], unreadable: 0 };
    if (result.unreadable) { throw new Error('Há folhas ilegíveis no acervo.'); }
    var entries = result.documents, current = JSON.parse(JSON.stringify(doc)), found = false;
    var draftChanged = current.title !== title.value || current.text !== manuscript.value;
    current.title = title.value; current.text = manuscript.value;
    if (draftChanged && E.cartorio && E.cartorio.sealDocument) {
      current.revision = (current.revision || 0) + 1;
      current.updated = new Date().toISOString();
      current.cartorio = E.cartorio.sealDocument(doc, current, null, true);
    }
    entries = entries.map(function (entry) { if (entry.id === current.id) { found = true; return current; } return entry; });
    if (!found && (current.revision || dirty || current.title || current.text)) { entries.push(current); }
    return entries;
  }
  function importFile(file) {
    if (!file) { return; }
    if (file.size > 50000000) { message('Traga pacotes de até 50 MB por vez.'); return; }
    if (!notebooks || !archive || !checkpoint()) { message('A gravação precisa estar disponível para importar um caderno.'); return; }
    E.transfer.read(file, function (error, contents) {
      if (error) { message(error.message); return; }
      importContents(contents, file.name, file.type);
    });
  }
  function importContents(contents, name, type) {
    if (typeof contents !== 'string' || contents.length > 50000000) { message('Traga uma cópia menor, em partes de até 50 milhões de unidades de texto.'); return; }
    if (!notebooks || !archive || !checkpoint()) { message('A gravação precisa estar disponível para importar um caderno.'); return; }
    function importError(e) { message((e.name === 'QuotaExceededError' ? 'Faltou espaço para importar o pacote.' : e instanceof SyntaxError ? 'O arquivo não contém uma cópia válida.' : e.message) + ' O acervo anterior foi preservado.'); }
    try {
      var payload, docs, converted = [], i;
      if (/\.(scrvrl|json)$/i.test(name)) {
        payload = JSON.parse(contents);
        if (payload && payload.format === 'escrevaral-astra' && payload.version === 1 && Object.prototype.toString.call(payload.documents) === '[object Array]' && payload.documents.every(E.validDocument)) {
          docs = payload.documents; payload = null;
        }
      } else if (/\.txt$/i.test(name) || type === 'text/plain') {
        var entry = E.freshDocument(); entry.title = name.replace(/\.txt$/i, ''); entry.text = String(contents); entry.project = activeNotebook() ? activeNotebook().name + ' — importado' : 'Texto importado';
        if (E.cartorio) { entry.cartorio = E.cartorio.sealDocument(null, entry, 'imported'); }
        docs = [entry];
      } else { throw new Error('Traga um caderno .scrvrl, uma cópia .json ou um texto .txt.'); }
      if (docs) {
        docs = JSON.parse(JSON.stringify(docs));
        docs.forEach(function (d) {
          if (d.kind === 'reminder' && !projectName(d.project)) { delete d.projectId; return; }
          var title = projectName(d.project) || 'Avulsos', book = null;
          converted.forEach(function (b) { if (b.name === title) { book = b; } });
          if (!book) { book = { id: 'book-' + E.freshDocument().id, name: title, aliases: [], color: '#c4cfc2', data: {} }; converted.push(book); }
          d.projectId = book.id; d.project = book.name;
        });
        payload = { format: 'escrevaral-cadernos', version: 1, scope: 'all', notebooks: converted, documents: docs, globals: {}, inventory: { notebooks: converted.length, documents: docs.length } };
      }
      notebooks.validate(payload);
      var incomingGlobals = Object.keys(payload.globals).filter(function (k) { return k !== sessionKey && k !== 'escrevaral.astra.current'; });
      var notice = 'Importar ' + payload.notebooks.length + ' caderno(s) e ' + payload.documents.length + ' registro(s)? Cadernos já existentes serão preservados; os repetidos entrarão como cópias.';
      if (incomingGlobals.length) { notice += ' Esta cópia completa também restaura as preferências e o calendário geral do arquivo, substituindo os atuais.'; }
      E.dialog.ask({title:'Importar cadernos?',message:notice,accept:'Importar'},function(ok){
        if (!ok) { return; }
        try {
          if (!checkpoint() || !rememberNotebook()) { return; }
          var result = notebooks.bring(payload);
          activeNotebookId = null; activeOriginalId = null; cabinetProject = null; loadDocument(E.freshDocument());
          closeNotebook(); renderNotebooks(); renderReminders(); renderCabinet(); byId('cabinet-window').hidden = true;
          if (incomingGlobals.length) { window.location.reload(); return; }
          message(result.notebooks + ' caderno(s) importado(s), ' + result.documents + ' registro(s)' + (result.copies ? '; ' + result.copies + ' como cópia' : '') + '.');
        } catch (e) { importError(e); }
      });
    } catch (e) { importError(e); }
  }
  function stopSound() {
    if (E.machineSound) { E.machineSound.setEnabled(false, storage, true); }
    byId('som').checked = false;
    text(byId('sound-status'), 'Som desligado.');
    if (audio) { try { if (audio.close) { audio.close(); } else if (audio.suspend) { audio.suspend(); } } catch (ignore) {} audio = null; }
  }
  function playKey(event) {
    if (E.machineSound) { E.machineSound.handleKey(event); }
  }
  function playInput(event) {
    if (E.machineSound && E.machineSound.handleInput) { E.machineSound.handleInput(event); }
  }
  function resetCompSound() {
    if (E.machineSound && E.machineSound.resetComposition) { E.machineSound.resetComposition(); }
  }
  function unlockAudio() {
    if (E.machineSound && E.machineSound.unlock) { E.machineSound.unlock(); }
  }
  /* Gabinete: apresentação do acervo real; o editor e as engines permanecem os mesmos. */
  var cabinetOpen = false, cabinetProject = null, cabinetLimit = 40, cabinetTimer = null, cabinetSelection = null;
  var desktopDrag = null;
  function desktopWindow(action, focus) {
    if (notebookReady && action !== 'open') { return closeNotebook(); }
    var open = action === 'open', win = byId('cabinet-window');
    win.hidden = !open;
    byId('os-window-task').hidden = action === 'close';
    byId('os-window-task').setAttribute('aria-pressed', open ? 'true' : 'false');
    queueSession();
    if (focus !== false) { (open ? byId('cabinet-heading') : action === 'minimize' ? byId('os-window-task') : byId('os-start')).focus(); }
    desktopDrag = null;
  }
  function setDesktopMaximized(maximized) {
    var control = byId('window-maximize');
    byId('cabinet-window').setAttribute('data-maximized', maximized ? 'true' : 'false');
    control.setAttribute('aria-pressed', maximized ? 'true' : 'false');
    control.setAttribute('aria-label', maximized ? 'Restaurar tamanho da janela' : 'Ampliar janela');
    control.setAttribute('title', maximized ? 'Restaurar tamanho da janela' : 'Ampliar janela');
    desktopDrag = null; queueSession();
  }
  function resetDesktopWindow() {
    var win = byId('cabinet-window');
    win.style.left = ''; win.style.top = ''; win.style.right = ''; win.style.bottom = ''; win.style.width = ''; win.style.height = '';
    setDesktopMaximized(false);
  }
  function startDesktopDrag(event) {
    var target = event.target, win = byId('cabinet-window'), surface = byId('desktop-surface');
    while (target && target !== byId('cabinet-window-handle')) { if (String(target.tagName).toLowerCase() === 'button') { return; } target = target.parentNode; }
    if (!cabinetOpen || window.innerWidth <= 760 || win.getAttribute('data-maximized') === 'true' || (typeof event.button === 'number' && event.button !== 0)) { return; }
    var point = event.touches ? event.touches[0] : event;
    if (!point || !win.getBoundingClientRect || !surface.getBoundingClientRect) { return; }
    var rect = win.getBoundingClientRect(), parent = surface.getBoundingClientRect();
    desktopDrag = { x: point.clientX, y: point.clientY, left: rect.left - parent.left, top: rect.top - parent.top, width: rect.right - rect.left, height: rect.bottom - rect.top, maxX: Math.max(0, parent.right - parent.left - (rect.right - rect.left)), maxY: Math.max(0, parent.bottom - parent.top - (rect.bottom - rect.top)) };
    win.style.width = desktopDrag.width + 'px'; win.style.height = desktopDrag.height + 'px'; win.style.right = 'auto'; win.style.bottom = 'auto';
    moveDesktopDrag(event); event.preventDefault();
  }
  function moveDesktopDrag(event) {
    if (!desktopDrag) { return; }
    var point = event.touches ? event.touches[0] : event; if (!point) { return; }
    var win = byId('cabinet-window');
    win.style.left = Math.max(0, Math.min(desktopDrag.maxX, desktopDrag.left + point.clientX - desktopDrag.x)) + 'px';
    win.style.top = Math.max(0, Math.min(desktopDrag.maxY, desktopDrag.top + point.clientY - desktopDrag.y)) + 'px';
    event.preventDefault();
  }
  function projectName(value) { return String(value || '').replace(/^\s+|\s+$/g, '').slice(0, 120); }
  function cabinetDocuments() {
    var result = archive ? archive.list() : { documents: [], unreadable: 0 }, found = false;
    result.documents = result.documents.map(function (entry) { if (entry.id === doc.id) { found = true; return doc; } return entry; });
    if (!found && (doc.revision || dirty || title.value || manuscript.value) && (!doc.projectId || (notebooks && availableBook(notebooks.get(doc.projectId))))) { result.documents.unshift(doc); }
    return result;
  }
  function renderCabinet() {
    updatePath(); queueSession();
    var result, list = byId('cabinet-notes'), projects = byId('cabinet-projects'), groups = [], query = byId('cabinet-search').value;
    try { result = cabinetDocuments(); } catch (e) { message('Não foi possível ler o acervo. Seus registros foram preservados.'); return; }
    list.textContent = ''; projects.textContent = '';
    if (notebooks) { notebooks.list().filter(availableBook).forEach(function (book) {
      var b = button(projects, book.name, function () { openNotebook(book.id); }); b.className = 'project-link'; b.setAttribute('aria-pressed', activeNotebookId === book.id ? 'true' : 'false');
    }); }
    notebookLabels();
    byId('cabinet-all').setAttribute('aria-pressed', cabinetProject === null ? 'true' : 'false');
    var scoped = result.documents.filter(function (entry) { return !activeNotebookId || entry.projectId === activeNotebookId; });
    var entries = query ? E.browseNotes(scoped, { query: query }).notes.reverse() : scoped;
    text(byId('cabinet-heading'), query ? (activeNotebookId ? 'Busca neste caderno' : 'Busca no gabinete') : cabinetProject === null ? 'Seus textos' : cabinetProject || 'Textos avulsos');
    text(byId('cabinet-count'), entries.length + (entries.length === 1 ? ' texto' : ' textos'));
    byId('cabinet-clear').hidden = !query;
    var showWelcome = (entries.length === 0 && !query && activeNotebookId === null) || showingAbout;
    byId('cabinet-window').setAttribute('data-welcome', showWelcome ? 'true' : 'false');
    var welcomeEl = byId('welcome-reception');
    if (welcomeEl) {
      welcomeEl.hidden = !showWelcome;
      var backNotesBtn = byId('welcome-back-notes');
      if (backNotesBtn) {
        backNotesBtn.hidden = !showingAbout || entries.length === 0;
      }
      var pwaBtn = byId('welcome-pwa-btn');
      if (pwaBtn) {
        pwaBtn.hidden = !deferredInstallPrompt || isStandaloneApp();
      }
      var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      var iosHint = byId('welcome-ios-hint');
      if (iosHint) {
        iosHint.hidden = !isIOS || isStandaloneApp();
      }
    }
    byId('cabinet-notes').hidden = showWelcome;
    var filesLabel = document.querySelector('.files-label');
    if (filesLabel) { filesLabel.hidden = showWelcome; }
    var cabinetContext = document.querySelector('#cabinet-window .cabinet-context');
    if (cabinetContext) { cabinetContext.hidden = showWelcome; }
    var cabinetHeading = document.querySelector('.cabinet-heading');
    if (cabinetHeading) { cabinetHeading.hidden = showWelcome; }
    byId('cabinet-empty').hidden = showWelcome || entries.length > 0;
    text(byId('cabinet-empty'), query ? 'Nenhum texto encontrado. Tente outro título ou trecho.' : 'Seu caderno está pronto. Crie um texto para começar.');
    byId('cabinet-more').hidden = showWelcome || entries.length <= cabinetLimit;
    byId('cabinet-resume').hidden = showWelcome || !(doc.revision || title.value || manuscript.value) || !!query || (cabinetProject !== null && cabinetProject !== projectName(doc.project));
    text(byId('resume-title'), title.value || 'Sem título');
    text(byId('resume-date'), projectName(doc.project) || 'Texto avulso');
    entries.slice(0, cabinetLimit).forEach(function (entry) {
      var row = document.createElement('div'); row.className = 'cabinet-note-row'; list.appendChild(row);
      var b = button(row, '', function () {
        var isCurrent = entry.id === doc.id;
        if (!persist()) { return; }
        if (!isCurrent) {
          try { var next = archive && archive.get(entry.id); if (!next) { renderCabinet(); message('Esta folha mudou. Escolha sua versão atual no gabinete.'); return; } loadDocument(next); } catch (e) { message('Não foi possível abrir esta folha. O texto atual permanece.'); return; }
          cabinetSelection = null;
        }
        enterDesk();
      });
      b.className = 'cabinet-note'; b.setAttribute('aria-current', entry.id === doc.id ? 'true' : 'false');
      noteLabel(b, entry.title, timeLabel(new Date(noteDate(entry))) + ' · ' + new Date(noteDate(entry)).toLocaleDateString('pt-BR'));
      paragraph(b, projectName(entry.project) || 'Folha avulsa', 'note-project-label');
      var discard = button(row, '', function () { trashEntry(entry); byId('cabinet-heading').focus(); });
      discard.className = 'note-trash';
      discard.setAttribute('aria-label', 'Mover para a lixeira: ' + (entry.title || 'Sem título'));
      discard.setAttribute('title', 'Mover para a lixeira');
      discard.innerHTML = '<svg class="reminder-trash-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7"/></svg>';
    });
    if (result.unreadable) { message('Algumas folhas não puderam ser lidas. Os registros originais permanecem.'); }
  }
  function enterDesk(focusEditor) {
    if (notebookReady && !activeNotebookId && doc.projectId && notebooks && availableBook(notebooks.get(doc.projectId))) { openNotebook(doc.projectId); }
    toggleStart(false);
    closePanels(false); collapseTimeline(); desktopDrag = null; cabinetOpen = false; byId('gabinete').hidden = true; byId('writing-space').hidden = false;
    document.body.setAttribute('data-view', 'workspace'); updatePath(); refreshCounts();
    sizeWorkspace(); cancelTypewriter();
    if (focusEditor !== false) { manuscript.focus(); }
    if (cabinetSelection && cabinetSelection.noteId === (doc.noteId || doc.id)) {
      E.transfer.selectRange(manuscript, cabinetSelection.start, cabinetSelection.end); manuscript.scrollTop = cabinetSelection.scroll;
    }
    growManuscript();
    if (workspaceUI) { workspaceUI.render(); }
    queueSession();
    try { if (storage && doc.revision) { storage.setItem('escrevaral.astra.current', doc.id); } } catch (ignore) { /* Preferência facultativa. */ }
  }
  function openCabinet(initial) {
    toggleStart(false);
    if (!initial && (composing || !persist())) { return false; }
    cabinetSelection = { noteId: doc.noteId || doc.id, start: manuscript.selectionStart || 0, end: manuscript.selectionEnd || 0, scroll: manuscript.scrollTop };
    if (machineEnabled) { setMachine(false); }
    if (immersion) { setImmersion(false); }
    cancelTypewriter(); closePanels(false); collapseTimeline();
    cabinetOpen = true; byId('writing-space').hidden = true; byId('gabinete').hidden = false;
    byId('leave-focus').hidden = true; document.body.setAttribute('data-view', 'gabinete');
    if (doc.projectId && !activeNotebookId && availableBook(notebooks.get(doc.projectId))) { activeNotebookId = doc.projectId; }
    if (activeNotebookId) { var openedBook = notebooks.get(activeNotebookId); if (openedBook) { cabinetProject = openedBook.name; } }
    desktopWindow('open', false); renderCabinet(); if (!initial) { byId('cabinet-heading').focus(); } return true;
  }
  function cabinetPanel(id, trigger) {
    if (id === 'acervo') { renderArchive(); }
    showPanel(id, trigger, true);
  }
  function chooseFont(value) {
    var style = value === 'maquina' ? 'maquina' : 'literaria';
    var start = manuscript.selectionStart, end = manuscript.selectionEnd;
    document.body.setAttribute('data-letter', style);
    byId('font-literary').setAttribute('aria-pressed', style === 'literaria' ? 'true' : 'false');
    byId('font-typewriter').setAttribute('aria-pressed', style === 'maquina' ? 'true' : 'false');
    var dfBtn = byId('desk-font'), dfLbl = dfBtn && dfBtn.querySelector ? dfBtn.querySelector('.esc-btn-label') : null;
    text(dfLbl || dfBtn, style === 'maquina' ? 'Courier Prime' : 'Noto Serif');
    focusMeasure = null; typewriterInsets(); growManuscript();
    if (typeof start === 'number') { E.transfer.selectRange(manuscript, start, end); }
    try { if (storage) { storage.setItem('escrevaral.astra.letter', style); } } catch (ignore) { /* Préférence facultativa. */ }
  }

  try {
    storage = window.localStorage; notebooks = E.createNotebooks(storage);
    originals = notebooks.originals;
    var rawArchive = E.createArchive(storage);
    notebooks.migrate(rawArchive.list(true).documents);
    archive = {
      get: function (id) { var d = rawArchive.get(id); return d ? notebooks.decorate(d) : null; },
      list: function (all) { var hidden = Object.create(null), hiddenOriginals = Object.create(null); originals.list().forEach(function (o) { if (o.trashed) { hiddenOriginals[o.id] = true; } }); notebooks.list().forEach(function (b) { if (b.trashed || hiddenOriginals[b.originalId]) { hidden[b.id] = true; } }); var r = rawArchive.list(all); r.documents = r.documents.map(notebooks.decorate).filter(function (d) { return all || !hidden[d.projectId]; }); return r; },
      save: function (d, forceHistory) { return rawArchive.save(notebooks.decorate(d), forceHistory); },
      trash: rawArchive.trash, purge: rawArchive.purge
    };
    var currentId = storage.getItem('escrevaral.astra.current'), current = currentId ? archive.get(currentId) : null;
    if (!current || current.trashed || current.kind === 'reminder' || (current.projectId && !availableBook(notebooks.get(current.projectId)))) { current = archive.list().documents[0]; }
    loadDocument(current || E.freshDocument());
    applyTheme(storage.getItem('escrevaral.astra.theme'));
    focusEnabled = storage.getItem('escrevaral.astra.focus') !== 'off'; byId('focus-toggle').setAttribute('aria-pressed', focusEnabled ? 'true' : 'false');
  } catch (e) { message('A gravação pode estar indisponível. Seu texto está aberto; baixe uma cópia em Ajustes.'); }
  renderTimeline(true, null, true); sizeWorkspace();
  listen(window, 'resize', function () { if (byId('cabinet-window').getAttribute('data-maximized') !== 'true') { resetDesktopWindow(); } sizeWorkspace(); });
  listen(window, 'load', sizeWorkspace);
  if (window.visualViewport) { listen(window.visualViewport, 'resize', sizeWorkspace); }
  listen(byId('timeline-toggle'), 'click', function () { document.body.setAttribute('data-counts', 'false'); byId('desk-counts').setAttribute('aria-expanded', 'false'); var open = this.getAttribute('aria-expanded') !== 'true'; this.setAttribute('aria-expanded', open ? 'true' : 'false'); byId('timeline-toggle').parentNode.parentNode.setAttribute('data-expanded', open ? 'true' : 'false'); if (open) { renderTimeline(false, null, true); } });
  listen(byId('mesa-close'), 'click', function () { closePanels(true); });
  listen(byId('acervo-close'), 'click', function () { closePanels(true); });
  listen(byId('panel-backdrop'), 'click', function () { closePanels(true); });
  listen(document, 'mousedown', function () { document.body.setAttribute('data-input', 'pointer'); });
  listen(document, 'touchstart', function () { document.body.setAttribute('data-input', 'pointer'); });
  listen(byId('note-search'), 'input', function () {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(function () {
      timelineCount = 40; byId('timeline-list').scrollTop = 0; renderTimeline(true);
      byId('timeline-toggle').setAttribute('aria-expanded', 'true'); byId('timeline-toggle').parentNode.parentNode.setAttribute('data-expanded', 'true');
    }, 150);
  });
  listen(byId('note-search'), 'keydown', function (event) { if (event.keyCode === 27 && this.value) { event.preventDefault(); this.value = ''; window.clearTimeout(searchTimer); renderTimeline(false); } });
  listen(byId('clear-search'), 'click', function () { window.clearTimeout(searchTimer); byId('note-search').value = ''; renderTimeline(false); byId('note-search').focus(); });
  listen(byId('timeline-list'), 'scroll', function () { if (this.scrollTop < 24) { olderNotes(); } });
  listen(manuscript, 'input', followTyping);
  listen(manuscript, 'blur', cancelTypewriter);
  listen(manuscript, 'blur', function () { stopMachineStrike(); finishMachineFeed(); });
  listen(manuscript, 'mousedown', cancelTypewriter);
  listen(manuscript, 'touchstart', cancelTypewriter);
  listen(manuscript, 'wheel', cancelTypewriter);
  listen(manuscript, 'mousewheel', cancelTypewriter);
  listen(manuscript, 'keyup', function (event) { if (event.keyCode >= 33 && event.keyCode <= 40 && !event.shiftKey) { followTyping(); } });
  listen(manuscript, 'scroll', updateFocus);
  listen(manuscript, 'click', growManuscript);
  listen(manuscript, 'keyup', growManuscript);
  listen(manuscript, 'select', growManuscript);
  listen(manuscript, 'focus', function () { collapseTimeline(); growManuscript(); });
  listen(title, 'focus', collapseTimeline);
  listen(document, 'selectionchange', function () { if (document.activeElement === manuscript) { growManuscript(); } });
  listen(byId('immersion-toggle'), 'click', function () { setImmersion(!immersion); });
  listen(byId('leave-focus'), 'click', leaveImmersion);
  listen(byId('machine-toggle'), 'click', function () { setMachine(visualMachine ? !visualMachine.isEnabled() : !machineEnabled); });
  listen(manuscript, 'input', machineInput);
  listen(byId('focus-toggle'), 'click', function () { focusEnabled = !focusEnabled; this.setAttribute('aria-pressed', focusEnabled ? 'true' : 'false'); byId('desk-paragraph').setAttribute('aria-pressed', focusEnabled ? 'true' : 'false'); updateFocus(); try { if (storage) { storage.setItem('escrevaral.astra.focus', focusEnabled ? 'on' : 'off'); } } catch (ignore) { /* Préférence facultativa. */ } });
  listen(title, 'input', changed); listen(manuscript, 'input', changed);
  listen(manuscript, 'compositionstart', function () {
    cancelTypewriter(); window.clearTimeout(focusTimer); updateFocus();
    composing = true; window.clearTimeout(timer);
  });
  listen(manuscript, 'compositionend', function () {
    composing = false; focusMeasure = null; updateFocus(); changed(); followTyping(); machineInput();
  });
  listen(byId('acervo-toggle'), 'click', function () { if (!persist()) { return; } var open = byId('acervo').hidden; showPanel('acervo', 'acervo-toggle', open); if (open) { renderArchive(); } });
  listen(byId('mesa-toggle'), 'click', function () { showPanel('mesa', 'mesa-toggle', byId('mesa').hidden); });
  listen(byId('examinar-toggle'), 'click', function () { var open = byId('oficina').hidden; if (open) { openExaminePanel({ toggle: 'examinar-toggle' }); } else { showPanel('oficina', 'examinar-toggle', false); } });
  listen(byId('back-writing'), 'click', returnToWriting);
  function createNewNote(opts) {
    opts = opts || {};
    if (!persist()) { return; }
    var targetId = typeof opts.projectId === 'string' && opts.projectId ? opts.projectId : (opts.projectId === null ? '' : (activeNotebook() ? activeNotebookId : ''));
    var book = targetId && notebooks ? notebooks.get(targetId) : null;
    if (book && !availableBook(book)) { book = null; }
    var next = E.freshDocument();
    if (book) { next.projectId = book.id; next.project = book.name; activeNotebookId = book.id; }
    if (opts.folder) { next.folder = String(opts.folder).slice(0, 120); }
    loadDocument(next);
    dirty = true;
    persist();
    cabinetSelection = null;
    enterDesk(false);
    if (workspaceUI) { workspaceUI.flashEink(); workspaceUI.render(); }
    manuscript.focus();
  }
  function newDocument() { createNewNote(); }
  function startFirstText() {
    showingAbout = false;
    if (!notebooks || !originals || !archive) { text(byId('first-run-status'), 'O armazenamento não está disponível. Verifique as permissões do navegador.'); return; }
    var existing;
    try { existing = archive.list(true); } catch (e) { text(byId('first-run-status'), 'Não foi possível conferir os textos existentes. Nenhum caderno foi criado.'); return; }
    if (notebooks.list().length || originals.list().length || existing.documents.length || existing.unreadable) { newDocument(); return; }
    if (composing || !checkpoint()) { return; }
    try {
      var book = notebooks.add('Meu primeiro caderno', null);
      if (!openNotebook(book.id)) { text(byId('first-run-status'), 'O caderno foi criado, mas não foi possível abri-lo. Encontre-o na mesa.'); return; }
      newDocument();
      if (!byId('writing-space').hidden) { manuscript.focus(); }
    } catch (e) { text(byId('first-run-status'), 'Não foi possível criar o caderno. Nenhum texto anterior foi alterado.'); renderNotebooks(); }
  }
  listen(byId('first-run-write'), 'click', startFirstText);
  listen(byId('new-document'), 'click', newDocument);
  listen(byId('timeline-new'), 'click', newDocument);
  for (var i = 0; i < lensButtons.length; i += 1) { listen(lensButtons[i], 'click', function () { examine(this.getAttribute('data-lens')); }); }
  listen(byId('reset-dismissed'), 'click', function () { doc.dismissed = []; dirty = true; persist(); byId('reset-dismissed').hidden = true; invalidate(); text(analysisStatus, 'Escolhas liberadas. Escolha uma lente para examinar de novo.'); if(E.ptbrPanelLiberate){E.ptbrPanelLiberate('Escolhas liberadas. Escolha uma lente para examinar de novo.');}else if(E.ptbrPanelFocus){E.ptbrPanelFocus();}else{lensButtons[0].focus();} });
  function applyTheme(value) {
    var theme = value === 'escuro' ? 'escuro' : 'claro';
    document.body.setAttribute('data-theme', theme); byId('tema').value = theme;
    byId('theme-light').setAttribute('aria-pressed', theme === 'claro' ? 'true' : 'false');
    byId('theme-dark').setAttribute('aria-pressed', theme === 'escuro' ? 'true' : 'false');
  }
  function chooseTheme(value) { applyTheme(value); try { if (storage) { storage.setItem('escrevaral.astra.theme', byId('tema').value); } } catch (ignore) { /* Tema não bloqueia a escrita. */ } }
  listen(byId('theme-light'), 'click', function () { chooseTheme('claro'); if (themeChromeUI) { themeChromeUI.setTheme('eink'); } });
  listen(byId('theme-dark'), 'click', function () { chooseTheme('escuro'); if (themeChromeUI) { themeChromeUI.setTheme('escuro'); } });
  listen(byId('tema'), 'change', function () { chooseTheme(this.value); });
  listen(byId('som'), 'change', function () {
    if (E.machineSound) {
      E.machineSound.setEnabled(this.checked, storage, false);
      text(byId('sound-status'), this.checked ? 'Som mecânico ligado.' : 'Som desligado.');
      return;
    }
    if (!this.checked) { stopSound(); return; }
    try { var Audio = window.AudioContext || window.webkitAudioContext; audio = new Audio(); if (audio.resume) { audio.resume(); } text(byId('sound-status'), 'Som ligado, em volume discreto.'); } catch (e) { stopSound(); text(byId('sound-status'), 'O som não está disponível neste navegador.'); }
  });
  listen(manuscript, 'keydown', playKey);
  listen(manuscript, 'input', playInput);
  listen(manuscript, 'compositionstart', resetCompSound);
  listen(manuscript, 'compositionend', resetCompSound);
  listen(manuscript, 'pointerdown', unlockAudio);
  listen(manuscript, 'touchstart', unlockAudio);
  listen(byId('print-document'), 'click', function () {
    preparePrint();
    if (window.print) { window.print(); } else { message('Use a opção de impressão do navegador.'); }
  });
  listen(window, 'beforeprint', preparePrint);
  listen(window, 'afterprint', finishPrint);
  if (window.matchMedia) {
    var printMedia = window.matchMedia('print');
    if (printMedia.addListener) { printMedia.addListener(function (event) { if (event.matches) { preparePrint(); } else { finishPrint(); } }); }
  }
  listen(byId('export-text'), 'click', function () { download((title.value ? title.value + '\n\n' : '') + manuscript.value, 'text/plain', 'manuscrito.txt'); });
  listen(byId('export-backup'), 'click', function () { exportNotebook(true); });
  listen(byId('import-file'), 'focus', function () { this.parentNode.setAttribute('data-focus', 'true'); });
  listen(byId('import-file'), 'blur', function () { this.parentNode.setAttribute('data-focus', 'false'); });
  listen(byId('import-file'), 'change', function () { importFile(this.files && this.files[0]); this.value = ''; });
  listen(byId('import-copied'), 'click', function () { showTransfer('', 'copia.scrvrl', true); });
  listen(byId('transfer-import'), 'click', function () { importContents(byId('transfer-content').value, byId('transfer-name').value, ''); });
  listen(byId('transfer-select'), 'click', function () {
    var field = byId('transfer-content'); field.focus();
    if (!E.transfer.selectRange(field, 0, field.value.length)) { message('Use Selecionar tudo e Copiar no campo da cópia.'); }
  });
  listen(byId('transfer-close'), 'click', function () { byId('transfer-content').value = ''; byId('transfer-box').hidden = true; byId('import-copied').focus(); });
  listen(document, 'keydown', function (event) {
    var code = event.keyCode;
    if (code === 27 && composing) { return; }
    if (code === 27 && !byId('start-menu').hidden) { event.preventDefault(); toggleStart(false); byId('os-start').focus(); return; }
    if (code === 27 && !activePanel && !byId('selection-tools').hidden) { event.preventDefault(); byId('selection-close').click(); return; }
    if (code === 27 && closeContextMenus(true)) { event.preventDefault(); return; }
    if (code === 9) {
      document.body.setAttribute('data-input', 'keyboard');
      if (activePanel) {
        var controls = byId(activePanel).querySelectorAll('button, input, textarea, select, a[href], [tabindex="0"]'), focusable = [], j;
        for (j = 0; j < controls.length; j += 1) { if (!controls[j].disabled && !controls[j].hidden && controls[j].getClientRects().length) { focusable.push(controls[j]); } }
        var paths = byId('location-path').querySelectorAll('button'), pathControls = [];
        for (j = 0; j < paths.length; j += 1) { if (!paths[j].hidden) { pathControls.push(paths[j]); } }
        focusable = pathControls.concat(focusable); focusable.push(byId('os-start'));
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (!first) { event.preventDefault(); byId(activePanel).focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === byId(activePanel))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === byId(activePanel))) { event.preventDefault(); first.focus(); }
      }
    }
    if ((event.ctrlKey || event.metaKey) && code === 75) { event.preventDefault(); closePanels(false); (cabinetOpen ? byId('cabinet-search') : byId('note-search')).focus(); }
    else if ((event.ctrlKey || event.metaKey) && code === 13) { event.preventDefault(); if (cabinetOpen) { enterDesk(); } openExaminePanel({ toggle: 'examinar-toggle' }); panelTrigger = manuscript; }
    else if ((event.ctrlKey || event.metaKey) && code === 83) { event.preventDefault(); persist(); }
    else if (code === 27 && document.body.getAttribute('data-counts') === 'true') { byId('desk-counts-close').click(); }
    else if (code === 27) {
      var hasOverlay = (byId('esc-word-card') && !byId('esc-word-card').hidden) ||
        (byId('esc-academy-overlay') && !byId('esc-academy-overlay').hidden) ||
        (byId('esc-calculator') && !byId('esc-calculator').hidden) ||
        (byId('esc-template-modal') && !byId('esc-template-modal').hidden) ||
        (byId('esc-inline-modal') && !byId('esc-inline-modal').hidden) ||
        (byId('esc-reader-overlay') && !byId('esc-reader-overlay').hidden) ||
        (byId('esc-items-filters-panel') && !byId('esc-items-filters-panel').hidden) ||
        (byId('esc-folder-menu') && !byId('esc-folder-menu').hidden) ||
        (byId('esc-color-popover') && !byId('esc-color-popover').hidden);
      if (hasOverlay) { return; }
      if (activePanel) { if (activePanel === 'oficina') { analysisRange = null; } closePanels(true); }
      else if (immersion) { leaveImmersion(); }
      else if (!cabinetOpen) { if (byId('timeline-toggle').getAttribute('aria-expanded') === 'true') { collapseTimeline(); } else if (document.body.getAttribute('data-view') !== 'workspace') { openCabinet(false); } }
      else if (!byId('project-form').hidden) { byId('project-cancel').click(); }
      else if (cabinetOpen && byId('start-menu').hidden) { enterDesk(true); }
    }
  });

  listen(byId('os-files'), 'click', function () { desktopWindow('open'); renderCabinet(); });
  listen(byId('os-desk'), 'click', enterDesk);
  listen(byId('os-arrange'), 'click', function () { resetDesktopWindow(); desktopWindow('open'); });
  listen(byId('os-start'), 'click', function () { toggleStart(byId('start-menu').hidden); });
  function outsideStart(event) {
    if (byId('start-menu').hidden) { return; }
    var node = event.target;
    while (node) { if (node === byId('start-menu') || node === byId('os-start')) { return; } node = node.parentNode; }
    toggleStart(false);
  }
  listen(document, 'click', outsideStart);
  listen(document, 'touchstart', outsideStart);
  listen(document, 'focusin', outsideStart);
  function outsideContextMenus(event) {
    var node=event.target;
    while(node){if(node===byId('desktop-organize')||node===byId('desktop-organize-menu')||node===byId('original-more')||node===byId('original-more-menu')||node===byId('notebook-more')||node===byId('notebook-more-menu')){return;}node=node.parentNode;}
    closeContextMenus(false);
  }
  listen(document,'click',outsideContextMenus);
  listen(document,'touchstart',outsideContextMenus);
  listen(byId('os-window-task'), 'click', function () { if (!cabinetOpen) { openCabinet(false); } else { if(byId('cabinet-window').hidden){desktopWindow('open');}else{closeNotebook();} } });
  listen(byId('window-minimize'), 'click', function () { desktopWindow('minimize'); });
  listen(byId('window-close'), 'click', function () { desktopWindow('close'); });
  listen(byId('window-maximize'), 'click', function () {
    setDesktopMaximized(this.getAttribute('aria-pressed') !== 'true');
  });
  listen(byId('cabinet-window-handle'), 'dblclick', function (event) {
    var target = event.target;
    while (target && target !== this) {
      if (String(target.tagName).toLowerCase() === 'button') { return; }
      target = target.parentNode;
    }
    desktopWindow('minimize');
  });
  listen(byId('cabinet-window-handle'), 'mousedown', startDesktopDrag);
  listen(byId('cabinet-window-handle'), 'touchstart', startDesktopDrag);
  listen(document, 'mousemove', moveDesktopDrag);
  listen(document, 'touchmove', moveDesktopDrag);
  listen(document, 'mouseup', function () { desktopDrag = null; });
  listen(document, 'touchend', function () { desktopDrag = null; });
  listen(document, 'touchcancel', function () { desktopDrag = null; });
  listen(window, 'blur', function () { desktopDrag = null; });
  listen(byId('skip-writing'), 'click', function (event) { event.preventDefault(); enterDesk(); });
  listen(byId('back-cabinet'), 'click', function () { openCabinet(false); });
  listen(byId('cabinet-return'), 'click', enterDesk);
  if (byId('gabinete-back-write')) { listen(byId('gabinete-back-write'), 'click', function () { enterDesk(true); }); }
  if (byId('esc-path-return')) {
    listen(byId('esc-path-return'), 'click', function () {
      if (activePanel) { if (activePanel === 'oficina') { analysisRange = null; } closePanels(true); }
      else if (cabinetOpen) { enterDesk(true); }
    });
  }
  listen(byId('cabinet-resume'), 'click', enterDesk);
  listen(byId('cabinet-write'), 'click', enterDesk);
  listen(byId('cabinet-new'), 'click', newDocument);
  listen(byId('welcome-start-btn'), 'click', startFirstText);
  listen(byId('welcome-back-notes'), 'click', function () { showingAbout = false; renderCabinet(); });
  listen(byId('welcome-donate-link'), 'click', function (event) { event.preventDefault(); message('Oficina independente mantida pela comunidade que escreve.'); });
  listen(byId('welcome-pwa-btn'), 'click', function () {
    if (!deferredInstallPrompt) { return; }
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(function () {
      deferredInstallPrompt = null;
      var btn = byId('welcome-pwa-btn');
      if (btn) { btn.hidden = true; }
    });
  });
  listen(byId('post-write-pwa-action'), 'click', function () {
    if (!deferredInstallPrompt) { return; }
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(function () {
      deferredInstallPrompt = null;
      var banner = byId('post-write-pwa');
      if (banner) { banner.hidden = true; }
    });
  });
  listen(byId('post-write-pwa-dismiss'), 'click', function () {
    var banner = byId('post-write-pwa');
    if (banner) { banner.hidden = true; }
    try { if (storage) { storage.setItem('escrevaral.pwa.dismissed', '1'); } } catch (ignore) {}
  });
  listen(window, 'beforeinstallprompt', function (event) {
    event.preventDefault();
    deferredInstallPrompt = event;
    var btn = byId('welcome-pwa-btn');
    if (btn && !isStandaloneApp()) { btn.hidden = false; }
    var actionBtn = byId('post-write-pwa-action');
    if (actionBtn && !isStandaloneApp()) { actionBtn.hidden = false; }
  });
  listen(byId('cabinet-settings'), 'click', function () { cabinetPanel('mesa', 'cabinet-settings'); });
  listen(byId('cabinet-archive'), 'click', function () { toggleStart(false); openCabinet(false); });
  listen(byId('cabinet-backup'), 'click', function () { byId('export-backup').click(); });
  listen(byId('start-export-text'), 'click', function () { toggleStart(false); if (!activeNotebook()) { message('Abra um caderno para baixar seu texto.'); return; } byId('export-text').click(); });
  listen(byId('cabinet-examine'), 'click', function () { enterDesk(); openExaminePanel({ toggle: 'examinar-toggle' }); });
  listen(byId('cabinet-poetry'), 'click', function () { enterDesk(); openExaminePanel({ toggle: 'examinar-toggle', group: 3, legacyLens: 'rima' }); });
  listen(byId('notebook-back'),'click',closeNotebook);
  listen(byId('cabinet-all'), 'click', function () { if (!checkpoint() || !rememberNotebook()) { return; } activeNotebookId = null; cabinetProject = null; cabinetLimit = 40; byId('cabinet-search').value = ''; showingAbout = false; renderCabinet(); });
  listen(byId('cabinet-more'), 'click', function () { cabinetLimit += 40; renderCabinet(); });
  listen(byId('cabinet-search'), 'input', function () { showingAbout = false; window.clearTimeout(cabinetTimer); cabinetTimer = window.setTimeout(function () { cabinetLimit = 40; desktopWindow('open', false); renderCabinet(); }, 180); });
  listen(byId('cabinet-clear'), 'click', function () { window.clearTimeout(cabinetTimer); byId('cabinet-search').value = ''; showingAbout = false; renderCabinet(); byId('cabinet-search').focus(); });
  listen(byId('paste-mode'), 'click', function () { restrictedPaste = !restrictedPaste; this.setAttribute('aria-pressed', restrictedPaste ? 'true' : 'false'); try { if (storage) { storage.setItem('escrevaral.astra.restricted-paste', restrictedPaste ? 'on' : 'off'); } } catch (ignore) {} });
  function handleEditorPaste(event) {
    if (restrictedPaste) {
      event.preventDefault();
      if (E.cartorio) { E.cartorio.recordSignal(doc, 'blockedPaste', 1); }
      message('Colagem externa restrita. Use Colar cópia interna ou Trazer arquivo em Ajustes.');
      return;
    }
    if (E.cartorio) {
      var pasted = '';
      try { pasted = (event.clipboardData && event.clipboardData.getData('text/plain')) || ''; } catch (ignore) {}
      if (pasted && internalClipboard && pasted === internalClipboard) {
        E.cartorio.recordSignal(doc, 'intPaste', pasted.length);
      } else if (pasted.length > 0) {
        E.cartorio.recordSignal(doc, 'extPaste', pasted.length);
      }
    }
  }
  listen(manuscript, 'paste', handleEditorPaste);
  if (byId('esc-rich-editor')) { listen(byId('esc-rich-editor'), 'paste', handleEditorPaste); }
  function recordTypingSignal(event) {
    if (!E.cartorio) { return; }
    if (event && event.inputType && String(event.inputType).indexOf('Paste') !== -1) { return; }
    E.cartorio.recordSignal(doc, 'key', 1);
  }
  listen(manuscript, 'input', recordTypingSignal);
  if (byId('esc-rich-editor')) { listen(byId('esc-rich-editor'), 'input', recordTypingSignal); }
  listen(manuscript, 'mouseup', captureSelection); listen(manuscript, 'keyup', function (event) { if (event.keyCode !== 27) { captureSelection(); } }); listen(manuscript, 'touchend', captureSelection);
  listen(manuscript, 'select', captureSelection);
  listen(byId('selection-close'), 'click', function () { dismissSelection(); manuscript.focus(); });
  listen(manuscript, 'mousedown', function () { dismissedSelection = null; });
  listen(manuscript, 'touchstart', function () { dismissedSelection = null; });
  listen(byId('selection-copy'), 'click', copyInternal);
  listen(byId('desk-paste'), 'click', pasteInternal);
  listen(manuscript, 'copy', function () { captureSelection(); copyInternal(); });
  listen(manuscript, 'cut', function () { captureSelection(); copyInternal(); });
  listen(manuscript, 'input', function () { copiedSelection = null; byId('selection-tools').hidden = true; });
  listen(byId('selection-paste'), 'click', pasteInternal);
  listen(byId('selection-cut'), 'click', function () {
    if (composing || !copiedSelection || copiedSelection.text !== manuscript.value || copiedSelection.documentId !== (doc.noteId || doc.id)) { return; }
    if (!copyInternal()) { return; }
    var s = copiedSelection; byId('selection-tools').hidden = true; manuscript.value = s.text.slice(0, s.start) + s.text.slice(s.end); E.transfer.selectRange(manuscript, s.start, s.start); manuscript.focus(); copiedSelection = null; changed(); queueSession();
  });
  listen(byId('selection-examine'), 'click', function () {
    if (!copiedSelection || copiedSelection.text !== manuscript.value || copiedSelection.documentId !== (doc.noteId || doc.id)) { message('Selecione novamente o trecho para analisar.'); return; }
    openExaminePanel({ toggle: 'examinar-toggle', range: copiedSelection });
  });
  listen(byId('selection-external'), 'click', function () {
    if (!copiedSelection || copiedSelection.text !== manuscript.value || copiedSelection.documentId !== (doc.noteId || doc.id)) { message('Selecione novamente o trecho para copiar.'); return; }
    manuscript.focus(); if (!E.transfer.selectRange(manuscript, copiedSelection.start, copiedSelection.end)) { text(byId('clipboard-status'), 'Selecione o trecho manualmente e use Copiar.'); return; }
    try { if (document.execCommand && document.execCommand('copy')) { text(byId('clipboard-status'), 'Copiado para outros aplicativos'); return; } } catch (ignore) { /* Cópia interna já disponível. */ }
    text(byId('clipboard-status'), 'Use Ctrl+C ou o comando Copiar do aparelho.');
  });
  listen(byId('start-settings'), 'click', function () { toggleStart(false); showPanel('mesa', 'mesa-toggle', true); });
  listen(byId('start-projects'), 'click', function () { pathToProjects(true); });
  listen(byId('start-trash'), 'click', function () { toggleStart(false); trashView = true; renderArchive(); showPanel('acervo', 'acervo-toggle', true); });
  listen(byId('start-about'), 'click', function () { toggleStart(false); showingAbout = true; openCabinet(false); });
  listen(byId('trash-toggle'), 'click', function () { trashView = !trashView; renderArchive(); });
  listen(byId('trash-current'), 'click', function () { trashEntry(doc); });
  listen(byId('reminder-new'), 'click', function () { if (!archive) { message('Armazenamento indisponível.'); return; } try { var note = E.freshDocument(); note.kind = 'reminder'; note.title = 'Post-it'; if (activeNotebookId) { note.projectId = activeNotebookId; note.project = activeNotebook().name; } archive.save(note); renderReminders(); } catch (e) { message('Não foi possível guardar o post-it.'); } });
  listen(manuscript, 'input', queueSession); listen(manuscript, 'keyup', queueSession); listen(manuscript, 'scroll', queueSession); listen(manuscript, 'click', queueSession);
  listen(title, 'input', queueSession);
  listen(byId('start-menu'), 'click', function (event) {
    var node = event.target;
    while (node && node !== byId('start-menu')) {
      if (String(node.tagName).toLowerCase() === 'button') { if(node.getAttribute('data-start-disclosure')==='true'){return;} toggleStart(false); return; }
      node = node.parentNode;
    }
  });
  listen(byId('path-home'), 'click', function () { pathToProjects(true); });
  listen(byId('path-projects'), 'click', function () { pathToProjects(true); });
  listen(byId('path-project'), 'click', function () { pathToProjects(false); });
  listen(byId('path-document'), 'click', function () { returnToWriting(); updatePath(); });
  listen(title, 'input', updatePath);
  listen(byId('note-project-save'), 'click', function () { var b = notebooks && notebooks.get(byId('note-project').value); if (!availableBook(b) || !checkpoint()) { return; } doc.projectId = b.id; doc.project = b.name; activeNotebookId = b.id; activeOriginalId = b.originalId || null; cabinetProject = b.name; dirty = true; if (persist()) { updatePath(); renderNotebooks(); renderCabinet(); message('Texto guardado em ' + b.name + '.'); } });
  listen(byId('font-literary'), 'click', function () { chooseFont('literaria'); });
  listen(byId('font-typewriter'), 'click', function () { chooseFont('maquina'); });
  try { chooseFont(storage ? storage.getItem('escrevaral.astra.letter') : 'literaria'); } catch (ignore) { chooseFont('literaria'); }
  try { restrictedPaste = !!storage && storage.getItem('escrevaral.astra.restricted-paste') === 'on'; byId('paste-mode').setAttribute('aria-pressed', restrictedPaste ? 'true' : 'false'); } catch (ignore) {}

  function refreshCounts() {
    var counts = E.countManuscript(manuscript.value);
    text(byId('desk-words'), counts.words.toLocaleString('pt-BR'));
    text(byId('desk-characters'), counts.characters.toLocaleString('pt-BR'));
    text(byId('desk-paragraphs'), counts.paragraphs);
    text(byId('desk-count-status'), 'Corpo do texto · caracteres incluem espaços; cada linha não vazia conta como parágrafo.');
  }
  function resizeLetter(value) {
    readingSize = Math.max(16, Math.min(30, Number(value) || 21));
    manuscript.style.fontSize = readingSize + 'px';
    if (byId('esc-rich-editor')) { byId('esc-rich-editor').style.fontSize = readingSize + 'px'; }
    text(byId('type-size'), readingSize);
    byId('type-smaller').disabled = readingSize <= 16; byId('type-larger').disabled = readingSize >= 30;
    focusMeasure = null; typewriterInsets(); growManuscript();
    try { if (storage) { storage.setItem('escrevaral.astra.font-size', String(readingSize)); } } catch (ignore) {}
  }
  function inspectWith(lens) {
    openExaminePanel({ toggle: 'examinar-toggle', lens: lens || '' });
  }
  listen(byId('desk-project'), 'click', function () { pathToProjects(false); });
  listen(byId('scope-project'), 'click', function () { projectScope = true; timelineCount = 40; renderTimeline(true, null, true); queueSession(); });
  listen(byId('scope-dates'), 'click', function () { projectScope = false; renderTimeline(true, null, true); queueSession(); });
  listen(byId('desk-documents'), 'click', function () { byId('timeline-toggle').click(); this.setAttribute('aria-expanded', byId('timeline-toggle').getAttribute('aria-expanded')); if(this.getAttribute('aria-expanded') === 'true' && byId('drawer-route-close').offsetWidth){ byId('drawer-route-close').focus(); } });
  listen(byId('drawer-route-close'), 'click', function () { collapseTimeline(); manuscript.focus(); });
  listen(byId('desk-font'), 'click', function () { chooseFont(document.body.getAttribute('data-letter') === 'maquina' ? 'literaria' : 'maquina'); });
  listen(byId('type-smaller'), 'click', function () { resizeLetter(readingSize - 1); });
  listen(byId('type-larger'), 'click', function () { resizeLetter(readingSize + 1); });
  listen(byId('desk-paragraph'), 'click', function () { byId('focus-toggle').click(); this.setAttribute('aria-pressed', focusEnabled ? 'true' : 'false'); });
  listen(byId('desk-print'), 'click', function () { byId('print-document').click(); });
  listen(byId('desk-export'), 'click', function () { byId('export-text').click(); });
  listen(byId('desk-counts'), 'click', function () { var open = this.getAttribute('aria-expanded') !== 'true'; this.setAttribute('aria-expanded', open ? 'true' : 'false'); document.body.setAttribute('data-counts', open ? 'true' : 'false'); if (open) { collapseTimeline(); refreshCounts(); } });
  listen(byId('desk-counts-close'), 'click', function () { document.body.setAttribute('data-counts', 'false'); byId('desk-counts').setAttribute('aria-expanded', 'false'); byId('desk-counts').focus(); });
  listen(byId('desk-refresh'), 'click', refreshCounts);
  listen(byId('desk-conventions'), 'click', function () { inspectWith(''); });
  listen(byId('desk-rhythm'), 'click', function () { inspectWith('ritmo'); });
  listen(byId('desk-dialogue'), 'click', function () { inspectWith('dialogo'); });
  listen(byId('desk-project-change'), 'click', function () { showPanel('mesa', 'mesa-toggle', true); byId('note-project').focus(); });
  listen(byId('desk-trash'), 'click', function () { trashEntry(doc); });
  try { resizeLetter(storage ? storage.getItem('escrevaral.astra.font-size') : 21); } catch (ignore) { resizeLetter(21); }
  byId('desk-paragraph').setAttribute('aria-pressed', focusEnabled ? 'true' : 'false');

  setDesktopMaximized(true); openCabinet(true); renderReminders(); restoreSession(); sessionReady = true;
  wireNotebooks();
  var notebookSession = null; try { notebookSession = storage && JSON.parse(storage.getItem(sessionKey) || 'null'); } catch (ignore) {}
  if (!notebookSession || !notebookSession.notebookId || (notebookSession.view === 'gabinete' && notebookSession.windowHidden)) { activeNotebookId = null; closeNotebook(); }
  else if (!activeNotebookId) { closeNotebook(); }
  notebookLabels();

  if (E.mountWorkspace) {
    workspaceUI = E.mountWorkspace({
      storage: storage,
      archive: archive,
      notebooks: notebooks,
      originals: originals,
      currentDoc: function () { return doc; },
      activeNotebookId: function () { return activeNotebookId; },
      checkpoint: checkpoint,
      openDoc: function (entry) {
        if (!entry || composing || !persist()) { return; }
        var isCurrent = entry.id === doc.id;
        if (!isCurrent) {
          try {
            var next = archive && archive.get(entry.id);
            if (!next) { workspaceUI.render(); message('Esta folha não foi encontrada.'); return; }
            loadDocument(next);
          } catch (e) { message('Não foi possível abrir esta folha.'); return; }
        }
        cabinetSelection = null;
        enterDesk(false);
        workspaceUI.flashEink();
      },
      newNote: function (noteOpts) { createNewNote(noteOpts); },
      newProject: function () { if (templatesUI) { templatesUI.open(); } else { showNotebookForm(null, 'volume'); } },
      onProjectSelect: function (bookId) {
        if (bookId && notebooks && availableBook(notebooks.get(bookId))) { openNotebook(bookId); }
      },
      onOpenNotebookTable: function () { openCabinet(false); },
      trashDoc: function (entry) { trashEntry(entry); },
      restoreDoc: function (entry) {
        if (!archive) { return; }
        try {
          archive.trash(entry, false);
          renderArchive(); renderCabinet(); renderTimeline(false);
          workspaceUI.render();
          message('Folha restaurada da lixeira.');
        } catch (e) { message('Não foi possível restaurar esta folha.'); }
      },
      purgeDoc: function (entry) {
        if (!archive) { return; }
        askDelete(entry);
      },
      emptyTrash: function () {
        if (!archive) { return; }
        var trashed = archive.list(true).documents.filter(function (d) { return !!d.trashed; });
        var trashedProjects = notebooks ? notebooks.list().filter(function (b) { return !!b.trashed; }) : [];
        if (!trashed.length && !trashedProjects.length) { return; }
        E.dialog.ask({
          title: 'Esvaziar lixeira?',
          message: 'Remover definitivamente ' + trashed.length + (trashed.length === 1 ? ' item da lixeira?' : ' itens da lixeira?') + ' Não será possível restaurar.',
          accept: 'Esvaziar lixeira'
        }, function (ok) {
          if (!ok) { return; }
          trashedProjects.forEach(function (bk) { try { notebooks.purge(bk.id); } catch (ignore) {} });
          trashed.forEach(function (entry) {
            try { archive.purge(entry); linguisticStore.removeDocument('analysis/' + (entry.projectId || 'avulsos') + '/' + (entry.noteId || entry.id) + '/'); } catch (ignore) {}
          });
          renderArchive(); renderCabinet(); renderTimeline(false);
          workspaceUI.render();
          message('Lixeira esvaziada.');
        });
      },
      updateDocMeta: function (entry, patch) {
        if (!archive || !entry || !patch) { return; }
        var isCurrent = entry.id === doc.id || (entry.noteId || entry.id) === (doc.noteId || doc.id);
        var key;
        if (isCurrent) {
          for (key in patch) { if (Object.prototype.hasOwnProperty.call(patch, key)) { doc[key] = patch[key]; } }
          dirty = true;
          persist();
        } else {
          try {
            var target = archive.get(entry.id);
            if (!target) { return; }
            for (key in patch) { if (Object.prototype.hasOwnProperty.call(patch, key)) { target[key] = patch[key]; } }
            archive.save(target, false);
          } catch (e) { message('Não foi possível atualizar a nota.'); return; }
        }
        renderArchive(); renderCabinet(); renderTimeline(false);
        workspaceUI.render();
      },
      createBlankFolder: function (name) {
        if (!notebooks) { return; }
        var created = notebooks.add(name);
        activeNotebookId = created.id;
        renderNotebooks(); renderCabinet();
        if (workspaceUI) { workspaceUI.selectProject(created.id, ''); }
        message('Pasta “' + created.name + '” criada.');
      },
      renameProject: function (book, nextName) {
        if (!notebooks || !book) { return; }
        var updated = notebooks.update(book.id, { name: nextName });
        if (archive) {
          (archive.list(true).documents || []).forEach(function (d) {
            if (d.projectId === book.id) {
              d.project = updated.name;
              if (d.id === doc.id) { doc.project = updated.name; dirty = true; persist(); }
              else { try { archive.save(d, false); } catch (ignore) {} }
            }
          });
        }
        renderNotebooks(); renderCabinet(); renderTimeline(false); updatePath();
        if (workspaceUI) { workspaceUI.render(); }
        message('Pasta renomeada para “' + updated.name + '”.');
      },
      openProjectBoard: function (book) {
        if (!book) { return; }
        activeNotebookId = book.id;
        if (chalkUI && chalkUI.open) { chalkUI.open(); }
        else if (byId('start-chalk')) { byId('start-chalk').click(); }
      },
      trashProjectDocs: function (book) {
        if (!archive || !book) { return; }
        var list = (archive.list(true).documents || []).filter(function (d) { return d.projectId === book.id && !d.trashed; });
        if (!list.length) { message('Não há textos ativos nesta pasta.'); return; }
        list.forEach(function (d) { try { archive.trash(d, true); } catch (ignore) {} });
        renderArchive(); renderCabinet(); renderTimeline(false);
        if (workspaceUI) { workspaceUI.render(); }
        message(list.length + (list.length === 1 ? ' texto movido' : ' textos movidos') + ' para a lixeira.');
      },
      trashProject: function (book) {
        if (!notebooks || !book) { return; }
        var inside = archive ? (archive.list(true).documents || []).filter(function (d) { return d.projectId === book.id && !d.trashed; }) : [];
        notebooks.update(book.id, { trashed: true });
        inside.forEach(function (d) { try { archive.trash(d, true); } catch (ignore) {} });
        if (activeNotebookId === book.id) { activeNotebookId = null; }
        renderNotebooks(); renderArchive(); renderCabinet(); renderTimeline(false); updatePath();
        if (workspaceUI) { workspaceUI.selectLibrary('all'); }
        message('Pasta “' + book.name + '” e ' + inside.length + ' texto(s) movidos para a lixeira.');
      },
      restoreProject: function (book) {
        if (!notebooks || !book) { return; }
        notebooks.update(book.id, { trashed: false });
        var inside = archive ? (archive.list(true).documents || []).filter(function (d) { return d.projectId === book.id && !!d.trashed; }) : [];
        inside.forEach(function (d) { try { archive.trash(d, false); } catch (ignore) {} });
        renderNotebooks(); renderArchive(); renderCabinet(); renderTimeline(false);
        if (workspaceUI) { workspaceUI.render(); }
        message('Pasta “' + book.name + '” restaurada com ' + inside.length + ' texto(s).');
      },
      purgeProject: function (book, insideCount) {
        if (!notebooks || !book) { return; }
        E.dialog.ask({
          title: 'Excluir pasta definitivamente?',
          message: 'A pasta “' + book.name + '” e ' + insideCount + (insideCount === 1 ? ' texto associado serão removidos' : ' textos associados serão removidos') + ' definitivamente deste aparelho. Não será possível restaurar.',
          accept: 'Excluir definitivamente'
        }, function (ok) {
          if (!ok) { return; }
          if (archive) {
            (archive.list(true).documents || []).filter(function (d) { return d.projectId === book.id; }).forEach(function (d) {
              try { archive.purge(d); linguisticStore.removeDocument('analysis/' + (d.projectId || 'avulsos') + '/' + (d.noteId || d.id) + '/'); } catch (ignore) {}
            });
          }
          notebooks.purge(book.id);
          renderNotebooks(); renderArchive(); renderCabinet(); renderTimeline(false);
          if (workspaceUI) { workspaceUI.render(); }
          message('Pasta excluída definitivamente.');
        });
      },
      refreshParent: function () { renderNotebooks(); renderCabinet(); renderTimeline(false); updatePath(); }
    });
    enterDesk(false);
    workspaceUI.render();
  }

  if (E.mountTemplatesModal) {
    templatesUI = E.mountTemplatesModal({
      notebooks: notebooks,
      archive: archive,
      manuscriptEl: manuscript,
      originalId: function () { return activeOriginalId; },
      onBlankProject: function () { showNotebookForm(null, 'volume'); },
      onCreated: function (created) {
        if (created && created.book) {
          openNotebook(created.book.id);
          if (created.firstNote) { loadDocument(created.firstNote); }
          enterDesk(false);
          if (workspaceUI) { workspaceUI.selectProject(created.book.id, created.firstNote && created.firstNote.folder || ''); workspaceUI.flashEink(); }
          renderNotebooks(); renderCabinet();
          message('Projeto “' + created.book.name + '” criado.');
        }
      }
    });
  }

  if (E.mountSonnetAssistant) {
    sonnetUI = E.mountSonnetAssistant({
      containerId: 'esc-sonnet-panel',
      manuscriptEl: manuscript,
      onSaveSettings: function (nextSettings) {
        doc.sonnetSettings = nextSettings;
        dirty = true;
        persist();
      }
    });
    sonnetUI.sync(doc);
  }

  if (E.mountRichEditor) {
    richUI = E.mountRichEditor({
      manuscriptEl: manuscript,
      onSync: function (plainText, safeHtml) {
        doc.text = plainText;
        doc.format = 'rich';
        doc.richHtml = safeHtml;
        if (sonnetUI && sonnetUI.isSonnetDoc(doc)) { sonnetUI.refresh(); }
        changed();
      },
      onFormatChange: function (fmt, html) {
        doc.format = fmt;
        doc.richHtml = fmt === 'rich' ? html : undefined;
        changed();
      }
    });
    richUI.loadDoc(doc);
    if (byId('esc-format-toggle')) {
      listen(byId('esc-format-toggle'), 'click', function () {
        if (richUI) { richUI.toggleMode(); }
      });
    }
  }

  if (E.mountReaderMode) {
    readerUI = E.mountReaderMode({
      storage: storage,
      onOpenAcademy: function (guideId) {
        if (academyUI && academyUI.openGuide) { academyUI.openGuide(guideId || 'objeto-livro'); }
      }
    });
    if (byId('esc-reader-toggle')) {
      listen(byId('esc-reader-toggle'), 'click', function () {
        if (readerUI) {
          doc.title = title.value;
          doc.text = manuscript.value;
          if (richUI && richUI.isRich()) { doc.richHtml = richUI.html(); }
          readerUI.open(doc);
        }
      });
    }
  }

  if (E.mountVisualMachine) {
    visualMachine = E.mountVisualMachine({
      storage: storage,
      columnEl: byId('writing-paper') || manuscript
    });
    if (byId('machine-toggle')) {
      var mOn = visualMachine.isEnabled();
      byId('machine-toggle').setAttribute('aria-pressed', mOn ? 'true' : 'false');
      text(byId('machine-toggle'), mOn ? 'Desativar' : 'Ativar');
    }
  }

  if (E.machineSound) {
    E.machineSound.syncPreference(storage);
    var syncSoundUI = function (enabled) {
      if (byId('som')) { byId('som').checked = !!enabled; }
      if (byId('esc-sound-btn')) { byId('esc-sound-btn').setAttribute('aria-pressed', enabled ? 'true' : 'false'); }
      text(byId('sound-status'), enabled ? 'Som mecânico ligado.' : 'Som desligado.');
    };
    syncSoundUI(E.machineSound.isEnabled());
    E.machineSound.subscribe(syncSoundUI);
    if (byId('esc-sound-btn')) {
      listen(byId('esc-sound-btn'), 'click', function () {
        E.machineSound.setEnabled(!E.machineSound.isEnabled(), storage, false);
      });
    }
    if (byId('esc-rich-editor')) {
      listen(byId('esc-rich-editor'), 'keydown', playKey);
      listen(byId('esc-rich-editor'), 'input', playInput);
      listen(byId('esc-rich-editor'), 'compositionstart', resetCompSound);
      listen(byId('esc-rich-editor'), 'compositionend', resetCompSound);
      listen(byId('esc-rich-editor'), 'pointerdown', unlockAudio);
      listen(byId('esc-rich-editor'), 'touchstart', unlockAudio);
    }
  }

  
  if (E.mountSuperfoco) {
    superfocoUI = E.mountSuperfoco({
      storage: storage,
      manuscriptEl: manuscript,
      richEl: byId('esc-rich-editor'),
      isActive: function () { return immersion; },
      onOpen: function (info) { setImmersion(true, info && info.automatic ? 'automatic' : 'manual'); },
      onClose: function (why) { setImmersion(false, why || 'manual'); },
      getFace: function () { return document.body.getAttribute('data-letter') || 'maquina'; },
      onToggleFace: function () {
        var cur = document.body.getAttribute('data-letter') || 'maquina';
        chooseFont(cur === 'maquina' ? 'literaria' : 'maquina');
      },
      getMachineEnabled: function () { return visualMachine ? visualMachine.isEnabled() : false; },
      onToggleMachine: function () { setMachine(visualMachine ? !visualMachine.isEnabled() : !machineEnabled); },
      getMachineAnchor: function () { return visualMachine ? visualMachine.anchorY() : null; },
      isSonnetActive: function () { return !!(sonnetUI && sonnetUI.isSonnetDoc && sonnetUI.isSonnetDoc(doc)); },
      isEditable: function () { return !(doc && (doc.locked || doc.category === 'reference')); }
    });
  }

  if (E.mountThemeChrome) {
    themeChromeUI = E.mountThemeChrome({
      storage: storage,
      onNewNote: function () { createNewNote(); }
    });
  }

  if (byId('path-folder')) {
    listen(byId('path-folder'), 'click', function () {
      if (workspaceUI && doc.projectId) {
        workspaceUI.selectProject(doc.projectId, doc.folder || '');
      }
    });
  }

  if (E.mountWordCard) {
    wordCardUI = E.mountWordCard({
      manuscriptEl: manuscript,
      richEl: byId('esc-rich-editor'),
      onDismissSelection: dismissSelection,
      onRichSync: function () {
        if (richUI) { richUI.sync(); }
      },
      onReplace: function (start, end, replacement) {
        if (manuscript.readOnly || manuscript.disabled) { return; }
        manuscript.value = manuscript.value.slice(0, start) + replacement + manuscript.value.slice(end);
        E.transfer.selectRange(manuscript, start, start + replacement.length);
        changed();
      }
    });
  }

  if (byId('esc-synonyms-btn') && wordCardUI && wordCardUI.openManual) {
    listen(byId('esc-synonyms-btn'), 'click', function () { wordCardUI.openManual(''); });
  }
  E.ptbrOpenWordCard = function (word) {
    if (wordCardUI && wordCardUI.openManual) { wordCardUI.openManual(word || ''); }
  };

  var pomodoroDockUI = null, calcUI = null;
  if (E.mountPomodoroDock) {
    pomodoroDockUI = E.mountPomodoroDock({
      storage: storage,
      onBreakStart: function () { message("Tempo de escrita concluído. Pausa iniciada."); }
    });
  }
  if (E.mountCalculator) {
    calcUI = E.mountCalculator({
      getCounts: function () {
        var c = E.countManuscript ? E.countManuscript(manuscript.value || "") : { words: 0, characters: (manuscript.value || "").length };
        return { words: c.words || 0, characters: c.characters || (manuscript.value || "").length };
      }
    });
    if (byId("esc-open-calculator")) {
      listen(byId("esc-open-calculator"), "click", function () { calcUI.toggle(); });
    }
  }
  if (byId("esc-open-calendar")) {
    listen(byId("esc-open-calendar"), "click", function () { if (byId("start-calendar")) { byId("start-calendar").click(); } });
  }
  function ensureNotebookForTool(toolTitle, toolSubject, needsDocInBook, onReady) {
    var book = activeNotebook();
    if (book && (!needsDocInBook || doc.projectId)) {
      onReady();
      return;
    }
    var available = notebooks ? notebooks.list().filter(availableBook) : [];
    if (available.length > 0 && !needsDocInBook) {
      activeNotebookId = available[0].id;
      notebookLabels();
      if (workspaceUI) { workspaceUI.render(); }
      onReady();
      return;
    }
    var targetBook = book || (available.length > 0 ? available[0] : null);
    var askTitle = targetBook
      ? 'Vincular esta folha a "' + targetBook.name + '"?'
      : 'Criar projeto para abrir ' + toolTitle + '?';
    var askMsg = targetBook
      ? toolSubject + ' Podemos vincular a folha atual ao projeto "' + targetBook.name + '" agora e abrir imediatamente.'
      : toolSubject + ' Podemos criar seu primeiro projeto ("Meu projeto") e vincular esta folha agora para abrir imediatamente.';
    var askBtn = targetBook ? 'Vincular e abrir' : 'Criar projeto e abrir';
    if (E.dialog && E.dialog.ask) {
      E.dialog.ask({ title: askTitle, message: askMsg, accept: askBtn }, function (ok) {
        if (!ok) { return; }
        try {
          var chosen = targetBook;
          if (!chosen && notebooks) {
            chosen = notebooks.add('Meu projeto', null);
          }
          if (!chosen) { return; }
          activeNotebookId = chosen.id;
          doc.projectId = chosen.id;
          doc.project = chosen.name;
          dirty = true;
          persist();
          notebookLabels();
          renderNotebooks();
          if (workspaceUI) { workspaceUI.selectProject(chosen.id, doc.folder || ''); }
          updatePath();
          onReady();
        } catch (e) {
          message(e && e.message ? e.message : 'Não foi possível preparar o projeto.');
        }
      });
    } else {
      message('Crie ou selecione um projeto na coluna esquerda para abrir ' + toolTitle + '.');
    }
  }
  if (byId("esc-open-chalk")) {
    listen(byId("esc-open-chalk"), "click", function () {
      ensureNotebookForTool('o Quadro de giz', 'O Quadro de giz acompanha um projeto.', false, function () {
        if (chalkUI && chalkUI.open) { chalkUI.open(); }
        else if (byId("start-chalkboard")) { byId("start-chalkboard").click(); }
      });
    });
  }
  if (byId("esc-open-lineage")) {
    listen(byId("esc-open-lineage"), "click", function () {
      ensureNotebookForTool('as Versões do texto', 'O histórico de versões acompanha um projeto.', true, function () {
        if (byId("start-lineage")) { byId("start-lineage").click(); }
      });
    });
  }
  if (byId("esc-open-universe")) {
    listen(byId("esc-open-universe"), "click", function () {
      ensureNotebookForTool('o Universo do projeto', 'O Universo do projeto acompanha um projeto.', false, function () {
        if (byId("start-universe")) { byId("start-universe").click(); }
      });
    });
  }
  if (byId("esc-open-packages")) {
    listen(byId("esc-open-packages"), "click", function () { showPanel("mesa", "mesa-toggle", true); });
  }

  if (E.mountAcademy) {
    academyUI = E.mountAcademy({
      storage: storage,
      getContext: function () {
        var raw = manuscript.value || '';
        var counts = E.countManuscript ? E.countManuscript(raw) : { words: 0 };
        var cleanTitle = (title.value || '').replace(/^\s+|\s+$/g, '');
        return {
          words: counts.words || 0,
          hasTitle: !!(cleanTitle && cleanTitle !== 'Sem título'),
          title: cleanTitle
        };
      },
      onAction: function (action) {
        if (action === 'reader') {
          if (readerUI) {
            doc.title = title.value;
            doc.text = manuscript.value;
            if (richUI && richUI.isRich()) { doc.richHtml = richUI.html(); }
            readerUI.open(doc);
          }
        } else if (action === 'superfoco') {
          if (cabinetOpen) { enterDesk(true); }
          setImmersion(true, 'manual');
        } else if (action === 'focus-title') {
          if (cabinetOpen) { enterDesk(true); }
          if (title && title.focus) {
            title.focus();
            if (title.select) { title.select(); }
          }
        } else if (action === 'examine') {
          if (cabinetOpen) { enterDesk(true); }
          showPanel('oficina', 'examinar-toggle', true);
        } else if (action === 'calculator') {
          if (cabinetOpen) { enterDesk(true); }
          if (calcUI && calcUI.open) { calcUI.open('paginas', true); }
        } else if (action === 'cartorio') {
          if (cartorioUI && cartorioUI.open) { cartorioUI.open('desk'); }
        } else {
          if (cabinetOpen) { enterDesk(true); }
          if (richUI && richUI.isRich() && byId('esc-rich-editor')) { byId('esc-rich-editor').focus(); }
          else if (manuscript && manuscript.focus) { manuscript.focus(); }
        }
      }
    });
    E.openAcademyGuide = function (guideId) {
      if (!academyUI) { return; }
      if (guideId) { academyUI.openGuide(guideId); }
      else { academyUI.openList(); }
    };
    if (byId('esc-open-academy')) {
      listen(byId('esc-open-academy'), 'click', function () { academyUI.openList(); });
    }
    if (byId('start-academy')) {
      listen(byId('start-academy'), 'click', function () { toggleStart(false); academyUI.openList(); });
    }
  }

  var cartorioUI = null;
  if (E.mountCartorio) {
    cartorioUI = E.mountCartorio({
      checkpoint: checkpoint,
      download: download,
      isRestrictedPaste: function () { return !!restrictedPaste; },
      onToggleRestrictedPaste: function () {
        restrictedPaste = !restrictedPaste;
        if (byId('paste-mode')) { byId('paste-mode').setAttribute('aria-pressed', restrictedPaste ? 'true' : 'false'); }
        try { if (storage) { storage.setItem('escrevaral.astra.restricted-paste', restrictedPaste ? 'on' : 'off'); } } catch (ignore) {}
        return restrictedPaste;
      },
      buildCurrentPackage: function () {
        if (!notebooks) { return null; }
        var entries = exportedDocuments();
        if (!entries.length) { return null; }
        return notebooks.pack(entries, null);
      },
      onExportSealed: function () { exportNotebook(true); },
      onOpenAcademy: function (guideId) {
        if (academyUI && academyUI.openGuide) { academyUI.openGuide(guideId || 'submissao-editoras'); }
      },
      onClose: function () { if (!cabinetOpen) { manuscript.focus(); } }
    });
    if (byId('esc-open-cartorio')) {
      listen(byId('esc-open-cartorio'), 'click', function () { cartorioUI.open('desk'); });
    }
    if (byId('start-cartorio')) {
      listen(byId('start-cartorio'), 'click', function () { toggleStart(false); cartorioUI.open('desk'); });
    }
  }

  ['window-close','window-minimize','window-maximize','mesa-close','acervo-close','utility-close','desk-counts-close'].forEach(function(id){byId(id).classList.add('material-key');});
  E.mountFinish({
    book: activeNotebook, checkpoint: checkpoint, message: message,
    prepare: function(){closePanels(false);toggleStart(false);},
    prepareLock: function(){toggleStart(false);stopSound();stopMachineStrike();finishMachineFeed();},
    save: function(book){notebooks.update(book.id,{data:book.data});},
    documents: function(){return cabinetDocuments().documents.filter(function(d){return d.projectId===activeNotebookId&&!d.trashed&&d.kind!=='reminder';});},
    open: function(entry){if(!checkpoint()){return;}try{var next=archive.get(entry.id);if(!next||next.trashed||next.projectId!==activeNotebookId){message('Este capítulo não está disponível.');return;}loadDocument(next);cabinetSelection=null;enterDesk(true);}catch(e){message('Não foi possível abrir o capítulo.');}}
  });

  chalkUI = E.mountChalk({book:activeNotebook, checkpoint:checkpoint, message:message, download:download,
    prepare:function(){closePanels(false);toggleStart(false);},
    save:function(id,revision,next){return E.chalk.write(notebooks,id,revision,next);}
  });

  E.mountLineage({checkpoint:checkpoint,message:message,document:function(){return JSON.parse(JSON.stringify(doc));},
    show:function(){toggleStart(false);showPanel('lineage-panel','start-lineage',true);},close:function(){closePanels(true);},
    mark:function(){if(!checkpoint()){throw new Error('Guarde a folha antes de criar um marco.');}forceHistory=true;dirty=true;if(!persist()){throw new Error('Não foi possível guardar o marco.');}},
    restore:function(version){title.value=version.title;manuscript.value=version.text;forceHistory=true;dirty=true;invalidate();if(!persist()){throw new Error('Não foi possível guardar a restauração. O texto escolhido permanece na folha.');}growManuscript();}
  });

  E.mountUtilities({
    storage: storage ? notebookStorage() : null, checkpoint: checkpoint, download: download,
    hideStart: function () { toggleStart(false); },
    show: function (id, trigger) { if (document.body.getAttribute('data-locked') === 'true' || !byId('story-screen').hidden || !byId('chalkboard').hidden) { return; } toggleStart(false); showPanel(id, trigger, true); },
    close: function () { closePanels(true); },
    write: function () { if (cabinetOpen) { enterDesk(true); } else { closePanels(false); manuscript.focus(); growManuscript(); } },
    documents: function () { return cabinetDocuments().documents.filter(function (d) { return !activeNotebookId || d.projectId === activeNotebookId; }); },
    openNote: function (entry) {
      if (!checkpoint()) { return; }
      try { var next = archive.get(entry.id); if (!next || next.trashed) { return; } loadDocument(next); cabinetSelection = null; enterDesk(true); }
      catch (e) { message('Não foi possível abrir esta folha.'); }
    }
  });

  listen(document, 'visibilitychange', function () { if (document.hidden) { if (checkpoint()) { rememberNotebook(); } stopSound(); stopMachineStrike(); finishMachineFeed(); } });
  listen(window, 'pagehide', function () { if (checkpoint()) { rememberNotebook(); } });
  listen(window, 'beforeunload', function (event) { if (!checkpoint()) { event.preventDefault(); event.returnValue = 'Há escrita que não foi guardada.'; } });
}());

;
/* Fonte: ptbr/leitura-visual.js */
/* Leitura anotada. Apenas apresentação de findings; não executa motores nem edita texto. ES5. */
(function (root) {
  'use strict';
  var E = root.Escr, D = root.document, serial = 0;
  if (!E || !D) { return; }
  function el(tag, parent, cls, text) {
    var n = D.createElement(tag); n.className = cls || '';
    if (typeof text === 'string') { n.textContent = text; }
    if (parent) { parent.appendChild(n); } return n;
  }
  function svgEl(tag, parent, attrs, text) {
    var n = D.createElementNS ? D.createElementNS('http://www.w3.org/2000/svg', tag) : D.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, String(attrs[k])); });
    }
    if (typeof text === 'string') { n.textContent = text; }
    if (parent) { parent.appendChild(n); }
    return n;
  }
  function valid(s, f) { return f && typeof f.start === 'number' && typeof f.end === 'number' && f.start >= 0 && f.end > f.start && f.end <= s.length && s.slice(f.start, f.end) === f.snippet; }
  function label(f) {
    var c = f.candidates && f.candidates.classes || [];
    if (f.analysisStatus === 'contextual') { return f.feature; }
    if (f.analysisStatus === 'desconhecido') { return 'sem leitura'; }
    if (f.analysisStatus === 'ambiguo') { return 'ambígua'; }
    if (f.analysisStatus === 'lexical') { return (c[0] || 'classe') + ' · léxico'; }
    return f.feature || 'observação';
  }
  function normalizeClassKey(cls) {
    if (!cls) { return 'incerta'; }
    return String(cls).toLowerCase().replace(/[áàâã]/g, 'a').replace(/[éê]/g, 'e').replace(/[í]/g, 'i').replace(/[óôõ]/g, 'o').replace(/[ú]/g, 'u').replace(/ç/g, 'c');
  }
  function classDisplayName(key) {
    var names = {
      substantivo: 'Substantivo', verbo: 'Verbo', adjetivo: 'Adjetivo', adverbio: 'Advérbio',
      artigo: 'Artigo', pronome: 'Pronome', preposicao: 'Preposição', conjuncao: 'Conjunção',
      numeral: 'Numeral', interjeicao: 'Interjeição', 'locucao verbal': 'Locução verbal',
      incerta: 'Ambígua / sem leitura'
    };
    return names[key] || (key.charAt(0).toUpperCase() + key.slice(1));
  }
  function syntaxRoleKey(feature) {
    var s = String(feature || '').toLowerCase();
    if (s.indexOf('sujeito') !== -1) { return 'sujeito'; }
    if (s.indexOf('verbo') !== -1 || s.indexOf('verbal') !== -1 || s.indexOf('locução') !== -1) { return 'verbo'; }
    if (s.indexOf('indireto') !== -1) { return 'indireto'; }
    if (s.indexOf('agente') !== -1) { return 'agente'; }
    if (s.indexOf('objeto') !== -1 || s.indexOf('complemento') !== -1 || s.indexOf('predicativo') !== -1) { return 'objeto'; }
    if (s.indexOf('conjunç') !== -1) { return 'conjuncao'; }
    if (s.indexOf('adjunto') !== -1 || s.indexOf('advérb') !== -1 || s.indexOf('negaç') !== -1) { return 'adjunto'; }
    if (s.indexOf('predicado') !== -1) { return 'predicado'; }
    return 'outro';
  }

  /* 1. Análise sintática frase a frase, em ordem natural, com setas SVG rotuladas (estilo displaCy editorial) */
  function syntaxMap(parent, options) {
    var snapshot = options.snapshot;
    var arr = options.findings.filter(function (f) { return valid(snapshot, f) && valid(snapshot, f.clause); });
    var uid = 'ptbr-reading-' + (++serial), dead = false, timer = null, active = null, buttons = {}, groups = {}, order = [];
    var stepMode = false, stepIndex = 0;

    var box = el('div', parent, 'ptbr-reading'), main = el('div', box, 'ptbr-reading-paper');
    el('p', main, 'ptbr-overline', 'RELAÇÕES DA ORAÇÃO · FRASE POR FRASE');
    el('p', main, 'ptbr-reading-help', 'Os termos aparecem na ordem exata da sua frase. Clique em qualquer bloco colorido para ver as setas de relação e a explicação.');

    arr.forEach(function (f) {
      var key = '$' + f.clause.start;
      if (!groups[key]) { groups[key] = { items: [], clause: f.clause }; order.push(key); }
      groups[key].items.push(f);
    });
    order.sort(function (a, b) { return groups[a].clause.start - groups[b].clause.start; });

    /* Navegação frase-a-frase quando houver 2+ construções */
    var navCounter = null, btnPrev = null, btnNext = null, btnAll = null, btnOne = null;
    if (order.length > 1) {
      var nav = el('div', main, 'ptbr-syntax-nav');
      btnAll = el('button', nav, 'ptbr-nav-pill', 'Todas (' + order.length + ')');
      btnAll.type = 'button'; btnAll.setAttribute('aria-pressed', 'true');
      btnOne = el('button', nav, 'ptbr-nav-pill', 'Uma frase por vez');
      btnOne.type = 'button'; btnOne.setAttribute('aria-pressed', 'false');
      btnPrev = el('button', nav, 'ptbr-nav-pill', '← Anterior');
      btnPrev.type = 'button'; btnPrev.hidden = true;
      navCounter = el('span', nav, 'ptbr-nav-counter', '');
      navCounter.hidden = true;
      btnNext = el('button', nav, 'ptbr-nav-pill', 'Próxima →');
      btnNext.type = 'button'; btnNext.hidden = true;

      btnAll.addEventListener('click', function () { setStepMode(false, stepIndex); }, false);
      btnOne.addEventListener('click', function () { setStepMode(true, stepIndex); }, false);
      btnPrev.addEventListener('click', function () { if (stepIndex > 0) { setStepMode(true, stepIndex - 1); } }, false);
      btnNext.addEventListener('click', function () { if (stepIndex < order.length - 1) { setStepMode(true, stepIndex + 1); } }, false);
    }

    var canvas = el('div', main, 'ptbr-reading-canvas'), aside = el('aside', box, 'ptbr-reading-aside');
    aside.id = uid; aside.setAttribute('aria-label', 'Explicação da relação selecionada');
    el('p', aside, 'ptbr-overline', 'POR DENTRO DO TEXTO');
    var selected = el('p', aside, 'ptbr-reading-selection'), links = el('p', aside, 'ptbr-syntax-links'), details = el('div', aside, 'ptbr-reading-details');
    selected.setAttribute('aria-live', 'polite');

    function button(f, target, cls) {
      var b = el('button', target, cls); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-controls', uid);
      b.setAttribute('data-syntax-node', f.nodeId);
      b.setAttribute('data-syntax-role', syntaxRoleKey(f.feature));
      b.setAttribute('aria-label', f.feature + ': ' + f.snippet + '. Ver explicação.');
      el('span', b, 'ptbr-word-tag', f.feature);
      el('span', b, 'ptbr-word-text', f.snippet);
      if (f.components && f.components.length) {
        f.components.forEach(function (c) { if (valid(snapshot, c)) { el('span', b, 'ptbr-syntax-head', c.role + ': ' + c.snippet); } });
      } else if (f.head && f.head.snippet !== f.snippet) {
        el('span', b, 'ptbr-syntax-head', 'Núcleo: ' + f.head.snippet);
      }
      b.addEventListener('click', function () { select(f); }, false);
      buttons['$' + f.nodeId] = { button: b, finding: f };
    }

    order.forEach(function (key, index) {
      var g = groups[key], s = el('section', canvas, 'ptbr-reading-fragment');
      g.section = s;
      el('p', s, 'ptbr-fragment-number', 'FRASE ' + ('0' + (index + 1)).slice(-2) + ' DE ' + ('0' + order.length).slice(-2));
      var scroll = el('div', s, 'ptbr-word-scroll'); scroll.setAttribute('tabindex', '0'); scroll.setAttribute('aria-label', 'Grupos da oração; role para ver todas as relações');
      g.row = el('div', scroll, 'ptbr-syntax-row');
      if (D.createElementNS) {
        g.svg = svgEl('svg', g.row, { 'class': 'ptbr-relation-arcs', 'aria-hidden': 'true' });
      }

      /* Termos na ordem exata em que aparecem na frase (f.start crescente) */
      var orderedTerms = g.items.filter(function (f) { return f.feature !== 'Predicado'; });
      orderedTerms.sort(function (a, b) { return a.start - b.start || a.end - b.end; });
      var predicates = g.items.filter(function (f) { return f.feature === 'Predicado'; });

      var strip = el('div', g.row, 'ptbr-syntax-order');
      orderedTerms.forEach(function (f) { button(f, strip, 'ptbr-syntax-term'); });

      if (predicates.length) {
        var predWrap = el('div', g.row, 'ptbr-syntax-scope-bar');
        predicates.forEach(function (f) { button(f, predWrap, 'ptbr-syntax-whole'); });
      }

      el('p', s, 'ptbr-fragment-original', g.clause.snippet);
    });

    if (!arr.length) {
      el('p', main, 'ptbr-reading-empty', 'Nenhuma construção recebeu uma leitura neste recorte. Isso indica o limite desta lente, não um erro no texto.');
    }

    function setStepMode(oneByOne, idx) {
      stepMode = !!oneByOne;
      stepIndex = Math.max(0, Math.min(order.length - 1, idx || 0));
      if (btnAll) { btnAll.setAttribute('aria-pressed', stepMode ? 'false' : 'true'); }
      if (btnOne) { btnOne.setAttribute('aria-pressed', stepMode ? 'true' : 'false'); }
      if (btnPrev) { btnPrev.hidden = !stepMode; btnPrev.disabled = stepIndex <= 0; }
      if (btnNext) { btnNext.hidden = !stepMode; btnNext.disabled = stepIndex >= order.length - 1; }
      if (navCounter) { navCounter.hidden = !stepMode; navCounter.textContent = 'Frase ' + (stepIndex + 1) + ' de ' + order.length; }
      order.forEach(function (key, i) {
        if (groups[key].section) { groups[key].section.hidden = stepMode && i !== stepIndex; }
      });
      if (stepMode && order[stepIndex]) {
        var firstItem = groups[order[stepIndex]].items[0];
        if (firstItem) { select(firstItem); }
      } else {
        resize();
      }
    }

    function draw() {
      if (dead || !active || (options.isCurrent && !options.isCurrent())) { return; }
      order.forEach(function (key) { if (groups[key].svg) { groups[key].svg.textContent = ''; } });
      var g = groups['$' + active.clause.start];
      if (!g || !g.svg || !g.row.getBoundingClientRect) { return; }
      var row = g.row.getBoundingClientRect();
      if (!row.width) { return; }
      var svgH = 88;
      g.svg.setAttribute('width', row.width);
      g.svg.setAttribute('height', svgH);
      g.svg.setAttribute('viewBox', '0 0 ' + row.width + ' ' + svgH);

      var lane = 0;
      (active.relations || []).forEach(function (edge) {
        if (edge.from !== active.nodeId && edge.to !== active.nodeId) { return; }
        var a = buttons['$' + edge.from], b = buttons['$' + edge.to];
        if (!a || !b || lane >= 4) { return; }
        var ar = a.button.getBoundingClientRect(), br = b.button.getBoundingClientRect();
        var x1 = ar.left - row.left + ar.width / 2;
        var x2 = br.left - row.left + br.width / 2;
        var yBase = svgH - 8;
        var span = Math.abs(x2 - x1);
        var arch = Math.min(svgH - 22, Math.max(30, span * 0.24) + lane * 14);
        var cy = Math.max(14, yBase - arch);
        var mx = (x1 + x2) / 2;

        /* 1 <path> por vínculo (preserva contrato de testes) + ponta de seta <polygon> + rótulo <rect>/<text> */
        svgEl('path', g.svg, {
          d: 'M ' + x1.toFixed(1) + ' ' + yBase + ' Q ' + mx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + (yBase - 4),
          fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round'
        });
        /* Seta apontando para o destino x2 */
        svgEl('polygon', g.svg, {
          points: x2.toFixed(1) + ',' + yBase + ' ' + (x2 - 4.5).toFixed(1) + ',' + (yBase - 8) + ' ' + (x2 + 4.5).toFixed(1) + ',' + (yBase - 8),
          fill: 'currentColor'
        });
        /* Ponto na origem x1 */
        svgEl('circle', g.svg, { cx: x1.toFixed(1), cy: (yBase - 2).toFixed(1), r: '2.8', fill: 'currentColor' });

        /* Rótulo da relação no topo do arco (estilo displaCy) */
        if (edge.label) {
          var lblText = String(edge.label).slice(0, 26);
          var apexY = 0.25 * yBase + 0.5 * cy + 0.25 * (yBase - 4);
          var pillW = Math.max(46, lblText.length * 6.4 + 14);
          var pillX = Math.max(2, Math.min(row.width - pillW - 2, mx - pillW / 2));
          var pillY = Math.max(2, apexY - 12);
          svgEl('rect', g.svg, {
            x: pillX.toFixed(1), y: pillY.toFixed(1), width: pillW.toFixed(1), height: '18', rx: '9',
            'class': 'ptbr-arc-pill'
          });
          svgEl('text', g.svg, {
            x: (pillX + pillW / 2).toFixed(1), y: (pillY + 12.5).toFixed(1), 'text-anchor': 'middle',
            'class': 'ptbr-arc-label'
          }, lblText);
        }
        lane++;
      });
    }

    function select(f) {
      if (dead || (options.isCurrent && !options.isCurrent())) { return; }
      active = f;
      Object.keys(buttons).forEach(function (k) {
        buttons[k].button.setAttribute('aria-pressed', buttons[k].finding === f ? 'true' : 'false');
        buttons[k].button.setAttribute('data-syntax-linked', 'false');
      });
      selected.textContent = f.feature + ' · “' + f.snippet + '”';
      var descriptions = [];
      (f.relations || []).forEach(function (edge) {
        var a = buttons['$' + edge.from], b = buttons['$' + edge.to];
        if (a && b && (edge.from === f.nodeId || edge.to === f.nodeId)) {
          if (a.finding !== f) { a.button.setAttribute('data-syntax-linked', 'true'); }
          if (b.finding !== f) { b.button.setAttribute('data-syntax-linked', 'true'); }
          descriptions.push(edge.label + ': “' + a.finding.snippet + '” ↔ “' + b.finding.snippet + '”');
        }
      });
      links.textContent = descriptions.join('. ');
      options.onSelect(f, details, true);
      resize();
    }

    function resize() { if (!dead) { root.clearTimeout(timer); timer = root.setTimeout(draw, 0); } }
    if (root.addEventListener) { root.addEventListener('resize', resize, false); }
    if (D.fonts && D.fonts.ready) { D.fonts.ready.then(resize); }
    if (arr.length) { select(arr[0]); }
    return {
      select: function (i) { if (arr[i]) { select(arr[i]); } },
      destroy: function () { dead = true; root.clearTimeout(timer); if (root.removeEventListener) { root.removeEventListener('resize', resize, false); } }
    };
  }

  function meterName(min, max) {
    if (min !== max) { return min + '–' + max + ' sílabas'; }
    var names = {
      1: '1 · monossílabo', 2: '2 · dissílabo', 3: '3 · trissílabo', 4: '4 · tetrassílabo',
      5: '5 · redondilha menor', 6: '6 · hexassílabo', 7: '7 · redondilha maior',
      8: '8 · octossílabo', 9: '9 · eneassílabo', 10: '10 · decassílabo',
      11: '11 · hendecassílabo', 12: '12 · alexandrino'
    };
    return names[max] || (max + ' sílabas');
  }
  function lineBounds(snapshot, pos) {
    var s = pos, e = pos;
    while (s > 0 && !/[\r\n]/.test(snapshot.charAt(s - 1))) { s--; }
    while (e < snapshot.length && !/[\r\n]/.test(snapshot.charAt(e))) { e++; }
    return { start: s, end: e };
  }
  function sentenceWindow(snapshot, start, end) {
    var lb = lineBounds(snapshot, start);
    var s = Math.max(lb.start, start - 55), e = Math.min(lb.end, end + 55);
    if (s > lb.start) { while (s > lb.start && !/\s/.test(snapshot.charAt(s - 1))) { s--; } }
    if (e < lb.end) { while (e < lb.end && !/\s/.test(snapshot.charAt(e))) { e++; } }
    return { start: s, end: e, prefixEllipsis: s > lb.start, suffixEllipsis: e < lb.end };
  }
  function appendMarkedText(container, snapshot, winStart, winEnd, spans, markCls, prefixEllipsis, suffixEllipsis) {
    var sorted = spans.slice().sort(function (a, b) { return a.start - b.start; });
    var cursor = winStart;
    if (prefixEllipsis) { el('span', container, 'ptbr-ctx-ellipsis', '…'); }
    sorted.forEach(function (sp) {
      if (sp.end <= cursor || sp.start >= winEnd) { return; }
      var a = Math.max(cursor, sp.start), b = Math.min(winEnd, sp.end);
      if (a > cursor) { el('span', container, 'ptbr-ctx-plain', snapshot.slice(cursor, a)); }
      if (b > a) { el('mark', container, markCls, snapshot.slice(a, b)); }
      cursor = b;
    });
    if (cursor < winEnd) { el('span', container, 'ptbr-ctx-plain', snapshot.slice(cursor, winEnd)); }
    if (suffixEllipsis) { el('span', container, 'ptbr-ctx-ellipsis', '…'); }
  }

  /* 1b. Orações relativas com arco SVG ligando "que ..." ao antecedente (estilo displaCy editorial) */
  function relativeMap(parent, options) {
    var snapshot = options.snapshot;
    var arr = options.findings.filter(function (f) { return valid(snapshot, f); }).slice(0, 100);
    var uid = 'ptbr-reading-' + (++serial), dead = false, timer = null, active = -1;
    var box = el('div', parent, 'ptbr-reading'), main = el('div', box, 'ptbr-reading-paper');
    box.setAttribute('data-reading-lens', 'relativas');
    el('p', main, 'ptbr-overline', 'ORAÇÕES RELATIVAS · VÍNCULO COM O ANTECEDENTE');
    el('p', main, 'ptbr-reading-help', 'Cada frase mostra o antecedente, a oração relativa encaixada e o verbo principal na ordem de leitura, com seta indicando o que “que” retoma.');
    var canvas = el('div', main, 'ptbr-reading-canvas'), aside = el('aside', box, 'ptbr-reading-aside');
    aside.id = uid; aside.setAttribute('aria-label', 'Explicação da relativa selecionada');
    el('p', aside, 'ptbr-overline', 'POR DENTRO DO TEXTO');
    var selected = el('p', aside, 'ptbr-reading-selection'), details = el('div', aside, 'ptbr-reading-details');
    selected.setAttribute('aria-live', 'polite');
    if (!arr.length) { el('p', main, 'ptbr-reading-empty', 'Nenhuma relativa restritiva no recorte inicial. Ausência de leitura indica o limite desta lente, não erro no texto.'); }

    var rows = [], rowButtons = [];
    arr.forEach(function (f, index) {
      var s = el('section', canvas, 'ptbr-reading-fragment');
      el('p', s, 'ptbr-fragment-number', 'PERÍODO ' + ('0' + (index + 1)).slice(-2) + ' DE ' + ('0' + arr.length).slice(-2));
      var scroll = el('div', s, 'ptbr-word-scroll'); scroll.setAttribute('tabindex', '0');
      var row = el('div', scroll, 'ptbr-syntax-row');
      var svg = D.createElementNS ? svgEl('svg', row, { 'class': 'ptbr-relation-arcs', 'aria-hidden': 'true' }) : null;
      var strip = el('div', row, 'ptbr-syntax-order');
      var ante = f.context && f.context[0] && valid(snapshot, f.context[0]) ? f.context[0] : null;
      var mainVerb = f.context && f.context[3] && valid(snapshot, f.context[3]) ? f.context[3] : null;

      var anteBtn = null;
      if (ante) {
        anteBtn = el('button', strip, 'ptbr-syntax-term'); anteBtn.type = 'button';
        anteBtn.setAttribute('data-syntax-role', 'sujeito'); anteBtn.setAttribute('aria-pressed', 'false');
        el('span', anteBtn, 'ptbr-word-tag', 'Antecedente');
        el('span', anteBtn, 'ptbr-word-text', ante.snippet);
        anteBtn.addEventListener('click', function () { select(index); }, false);
      }

      var relBtn = el('button', strip, 'ptbr-syntax-term'); relBtn.type = 'button';
      relBtn.setAttribute('data-syntax-role', 'objeto'); relBtn.setAttribute('aria-pressed', 'false');
      relBtn.setAttribute('aria-controls', uid);
      el('span', relBtn, 'ptbr-word-tag', 'Oração relativa · que-sujeito');
      el('span', relBtn, 'ptbr-word-text', f.snippet);
      if (f.components && f.components.length) {
        f.components.forEach(function (c) { if (valid(snapshot, c)) { el('span', relBtn, 'ptbr-syntax-head', c.role + ': ' + c.snippet); } });
      }
      relBtn.addEventListener('click', function () { select(index); }, false);

      var mvBtn = null;
      if (mainVerb) {
        mvBtn = el('button', strip, 'ptbr-syntax-term'); mvBtn.type = 'button';
        mvBtn.setAttribute('data-syntax-role', 'verbo'); mvBtn.setAttribute('aria-pressed', 'false');
        el('span', mvBtn, 'ptbr-word-tag', 'Verbo da principal');
        el('span', mvBtn, 'ptbr-word-text', mainVerb.snippet);
        mvBtn.addEventListener('click', function () { select(index); }, false);
      }

      if (f.clause && valid(snapshot, f.clause)) { el('p', s, 'ptbr-fragment-original', f.clause.snippet); }
      rows.push({ row: row, svg: svg, anteBtn: anteBtn, relBtn: relBtn, mvBtn: mvBtn });
      rowButtons.push(relBtn);
    });

    function draw() {
      if (dead || active < 0 || (options.isCurrent && !options.isCurrent())) { return; }
      rows.forEach(function (r) { if (r.svg) { r.svg.textContent = ''; } });
      var r = rows[active];
      if (!r || !r.svg || !r.anteBtn || !r.relBtn || !r.row.getBoundingClientRect) { return; }
      var rb = r.row.getBoundingClientRect(); if (!rb.width) { return; }
      var svgH = 88;
      r.svg.setAttribute('width', rb.width); r.svg.setAttribute('height', svgH); r.svg.setAttribute('viewBox', '0 0 ' + rb.width + ' ' + svgH);
      var ar = r.anteBtn.getBoundingClientRect(), rr = r.relBtn.getBoundingClientRect();
      var xFrom = rr.left - rb.left + rr.width / 2, xTo = ar.left - rb.left + ar.width / 2, yBase = svgH - 8;
      var mx = (xFrom + xTo) / 2, cy = 22;
      svgEl('path', r.svg, { d: 'M ' + xFrom.toFixed(1) + ' ' + yBase + ' Q ' + mx.toFixed(1) + ' ' + cy + ' ' + xTo.toFixed(1) + ' ' + (yBase - 4), fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round' });
      svgEl('polygon', r.svg, { points: xTo.toFixed(1) + ',' + yBase + ' ' + (xTo - 4.5).toFixed(1) + ',' + (yBase - 8) + ' ' + (xTo + 4.5).toFixed(1) + ',' + (yBase - 8), fill: 'currentColor' });
      svgEl('circle', r.svg, { cx: xFrom.toFixed(1), cy: (yBase - 2).toFixed(1), r: '2.8', fill: 'currentColor' });
      var lbl = 'que retoma antecedente';
      var pillW = lbl.length * 6.4 + 14, pillX = Math.max(2, Math.min(rb.width - pillW - 2, mx - pillW / 2));
      svgEl('rect', r.svg, { x: pillX.toFixed(1), y: '18', width: pillW.toFixed(1), height: '18', rx: '9', 'class': 'ptbr-arc-pill' });
      svgEl('text', r.svg, { x: (pillX + pillW / 2).toFixed(1), y: '30.5', 'text-anchor': 'middle', 'class': 'ptbr-arc-label' }, lbl);
    }

    function select(index) {
      if (dead || !arr[index] || (options.isCurrent && !options.isCurrent())) { return; }
      active = index;
      rowButtons.forEach(function (b, j) { b.setAttribute('aria-pressed', j === index ? 'true' : 'false'); });
      selected.textContent = 'Relativa · “' + arr[index].snippet + '”';
      options.onSelect(arr[index], details, true);
      resize();
    }
    function resize() { if (!dead) { root.clearTimeout(timer); timer = root.setTimeout(draw, 0); } }
    if (root.addEventListener) { root.addEventListener('resize', resize, false); }
    if (D.fonts && D.fonts.ready) { D.fonts.ready.then(resize); }
    if (arr.length) { select(0); }
    return { select: select, destroy: function () { dead = true; root.clearTimeout(timer); if (root.removeEventListener) { root.removeEventListener('resize', resize, false); } } };
  }

  /* 2. Classes de palavras em pílulas coloridas + visuais próprios para Ritmo, Repetição, Poesia (Rimas/Métrica) e Convenções */
  E.renderReadingMap = function (parent, options) {
    if (options.lens === 'sintaxe') { return syntaxMap(parent, options); }
    if (options.lens === 'relativas') { return relativeMap(parent, options); }
    var snapshot = options.snapshot, arr = options.findings.filter(function (f) { return valid(snapshot, f); }).slice(0, 100);
    /* Uma locução ocupa um cartão; leituras dos componentes seguem no achado.
     * Evita repetir as palavras no original reconstruído da anotação. */
    if (options.lens === 'morfologia') {
      var compoundGroups = arr.filter(function (f) { return !!f.locution; });
      arr = arr.filter(function (f) { return f.locution || !compoundGroups.some(function (g) { return f.start >= g.start && f.end <= g.end; }); });
    }
    var morph = options.lens === 'morfologia';
    var isRitmo = options.lens === 'ritmo';
    var isRepeat = options.lens === 'repeticao';
    var isRima = options.lens === 'rima';
    var isMetrica = options.lens === 'metrica';
    var active = -1, dead = false, timer = null, activeClassFilter = '';
    var uid = 'ptbr-reading-' + (++serial), buttons = [], rows = [], rowFor = [], diagrams = [], wordClasses = [];
    var box = el('div', parent, 'ptbr-reading'), main = el('div', box, 'ptbr-reading-paper');
    box.setAttribute('data-reading-lens', options.lens || 'geral');

    el('p', main, 'ptbr-overline',
      morph ? 'CLASSES NO TEXTO · PÍLULAS COLORIDAS'
        : isRitmo ? 'PARTITURA RÍTMICA DAS FRASES'
        : isRepeat ? 'ECOS E REPETIÇÕES NO CONTEXTO'
        : isRima ? 'ESQUEMA DE RIMAS · FAMÍLIAS SONORAS'
        : isMetrica ? 'ESCANSÃO SILÁBICA DOS VERSOS'
        : 'LEITURA ANOTADA NO CONTEXTO');
    el('p', main, 'ptbr-reading-help', morph
      ? 'Cada palavra veste a cor da sua classe. Filtre uma classe acima para acender só ela no texto, ou clique numa pílula para ver sua evidência.'
      : isRitmo
        ? 'Cada barra mostra a extensão relativa da frase para enxergar cadência e variação num relance.'
        : isRepeat
          ? 'As repetições aparecem grifadas dentro da própria passagem, na mesma cor. Clique para conferir ou abrir sinônimos.'
          : isRima
            ? 'Versos com terminação sonora aproximada compartilham a mesma letra (A, B, C…) e cor.'
            : isMetrica
              ? 'Divisão estimada em sílabas poéticas, com a sílaba tônica em destaque e a medida clássica à direita.'
              : 'Cada ocorrência aparece destacada dentro da sua própria frase. Clique para ver explicação ou localizar no texto.');

    /* Barra de filtros por classe + alternador "Só cores" para Classes de palavras */
    var filterButtons = [];
    if (morph && arr.length) {
      var classCounts = {}, classOrder = [];
      arr.forEach(function (f) {
        var rawCls = f.analysisStatus === 'contextual' ? f.feature : (f.candidates && f.candidates.classes.length === 1 ? f.candidates.classes[0] : 'incerta');
        var k = normalizeClassKey(rawCls);
        if (!classCounts['$' + k]) { classCounts['$' + k] = 0; classOrder.push(k); }
        classCounts['$' + k]++;
      });
      var bar = el('div', main, 'ptbr-class-bar');
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Filtrar palavras por classe');

      var allBtn = el('button', bar, 'ptbr-class-chip', 'Todas (' + arr.length + ')');
      allBtn.type = 'button'; allBtn.setAttribute('aria-pressed', 'true'); allBtn.setAttribute('data-filter-class', '');
      filterButtons.push(allBtn);
      allBtn.addEventListener('click', function () { applyClassFilter(''); }, false);

      classOrder.forEach(function (k) {
        var cb = el('button', bar, 'ptbr-class-chip', classDisplayName(k) + ' (' + classCounts['$' + k] + ')');
        cb.type = 'button'; cb.setAttribute('aria-pressed', 'false'); cb.setAttribute('data-filter-class', k);
        cb.setAttribute('data-word-class', k);
        filterButtons.push(cb);
        cb.addEventListener('click', function () { applyClassFilter(activeClassFilter === k ? '' : k); }, false);
      });

      var compactBtn = el('button', bar, 'ptbr-pill-mode-btn', 'Só cores');
      compactBtn.type = 'button'; compactBtn.setAttribute('aria-pressed', 'false');
      compactBtn.title = 'Esconder os rótulos e deixar apenas as pílulas coloridas nas palavras';
      compactBtn.addEventListener('click', function () {
        var next = box.getAttribute('data-pills-compact') !== 'true';
        box.setAttribute('data-pills-compact', next ? 'true' : 'false');
        compactBtn.setAttribute('aria-pressed', next ? 'true' : 'false');
        compactBtn.textContent = next ? 'Mostrar rótulos' : 'Só cores';
        resize();
      }, false);
    }

    var canvas = el('div', main, 'ptbr-reading-canvas');
    var aside = el('aside', box, 'ptbr-reading-aside'); aside.id = uid; aside.setAttribute('aria-label', 'Explicação da leitura selecionada');
    el('p', aside, 'ptbr-overline', 'POR DENTRO DO TEXTO');
    var selected = el('p', aside, 'ptbr-reading-selection'); selected.setAttribute('aria-live', 'polite');
    var details = el('div', aside, 'ptbr-reading-details');
    if (!arr.length) { el('p', main, 'ptbr-reading-empty', 'Nenhuma observação nova neste recorte. Isso não certifica ausência de problemas.'); }

    /* Dados auxiliares para Ritmo (maior comprimento), Repetição (grupos de cor) e Rima (letras A/B/C...) */
    var maxWords = 1, repeatGroups = {}, nextRepeatColor = 0, rhymeGroups = {}, nextRhymeIdx = 0;
    var rhymeLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (isRitmo) {
      arr.forEach(function (f) {
        var wc = f.snippet.replace(/^\s+|\s+$/g, '').split(/\s+/).length;
        if (wc > maxWords) { maxWords = wc; }
      });
    }

    var row, sentence, previous = null;
    arr.forEach(function (f, index) {
      var gap = previous ? snapshot.slice(previous.end, f.start) : '';
      if (!morph || !row || /[\r\n]/.test(gap) || /[.!?]\s/.test(gap) || gap.length > 100) {
        var section = el('section', canvas, 'ptbr-reading-fragment');
        el('p', section, 'ptbr-fragment-number', morph ? ('FRASE ' + ('0' + (rows.length + 1)).slice(-2)) : ('TRECHO ' + ('0' + (rows.length + 1)).slice(-2)));
        var scroll = el('div', section, 'ptbr-word-scroll'); scroll.setAttribute('tabindex', '0'); scroll.setAttribute('aria-label', 'Trecho anotado');
        row = el('div', scroll, morph ? 'ptbr-word-row' : 'ptbr-excerpt-row'); rows.push(row);
        if (morph && D.createElementNS) {
          var svg = svgEl('svg', row, { 'class': 'ptbr-relation-arcs', 'aria-hidden': 'true' });
          diagrams.push(svg);
        } else { diagrams.push(null); }
        sentence = el('p', section, 'ptbr-fragment-original');
        sentence.textContent = f.snippet;
      } else {
        /* Preserva pontuação/espaços entre pílulas no fluxo natural do texto */
        var cleanGap = gap.replace(/^\s+|\s+$/g, '');
        if (morph && cleanGap) {
          el('span', row, 'ptbr-punct', cleanGap);
        }
        sentence.textContent += gap + f.snippet;
      }

      var b = el('button', row, morph ? 'ptbr-word' : 'ptbr-excerpt'); b.type = 'button';
      b.setAttribute('data-reading-index', index); b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-controls', uid);
      b.setAttribute('aria-label', f.snippet + ': ' + label(f) + '. Ver explicação.');
      b.setAttribute('data-reading-state', f.analysisStatus || 'observacao');
      var rawCls = f.analysisStatus === 'contextual' ? f.feature : (f.candidates && f.candidates.classes.length === 1 ? f.candidates.classes[0] : 'incerta');
      var normCls = normalizeClassKey(rawCls);
      b.setAttribute('data-word-class', rawCls || 'incerta');
      b.setAttribute('data-word-class-norm', normCls);

      if (isRepeat) {
        var rKey = '$' + String(f.snippet || '').toLowerCase();
        if (typeof repeatGroups[rKey] !== 'number') { repeatGroups[rKey] = (nextRepeatColor++) % 5; }
        b.setAttribute('data-repeat-group', String(repeatGroups[rKey]));
      }

      if (morph) {
        el('span', b, 'ptbr-word-text', f.snippet);
        el('span', b, 'ptbr-word-tag', label(f));
      } else if (isMetrica && f.measurements && f.measurements.words && f.measurements.words.length) {
        var scanRow = el('span', b, 'ptbr-scansion-row');
        var scanVerse = el('span', scanRow, 'ptbr-scansion-verse');
        var wList = f.measurements.words;
        wList.forEach(function (wObj, wi) {
          if (wi > 0) { el('span', scanVerse, 'ptbr-syl-sep', ' / '); }
          var isLastWord = wi === wList.length - 1;
          wObj.syllables.forEach(function (syl, si) {
            if (si > 0) { el('span', scanVerse, 'ptbr-syl-dot', '·'); }
            var sCls = si === wObj.tonic ? 'ptbr-syl-tonic' : (isLastWord && si > wObj.tonic ? 'ptbr-syl-tail' : 'ptbr-syl');
            el('span', scanVerse, sCls, syl);
          });
        });
        el('span', scanRow, 'ptbr-meter-badge', meterName(f.measurements.min, f.measurements.max));
      } else if (isRima && f.related && valid(snapshot, f.related)) {
        var rk = '$' + f.related.start;
        if (typeof rhymeGroups[rk] !== 'number') { rhymeGroups[rk] = nextRhymeIdx++; }
        var rIdx = rhymeGroups[rk];
        var rLetter = rhymeLetters.charAt(rIdx % rhymeLetters.length);
        b.setAttribute('data-repeat-group', String(rIdx % 5));
        var rHead = el('span', b, 'ptbr-rhyme-head');
        el('span', rHead, 'ptbr-rhyme-badge', 'RIMA ' + rLetter);
        el('span', rHead, 'ptbr-rhyme-pair', '“' + f.related.snippet + '” ↔ “' + f.snippet + '”');
        var l1 = lineBounds(snapshot, f.related.start), l2 = lineBounds(snapshot, f.start);
        var v1 = el('span', b, 'ptbr-rhyme-line');
        appendMarkedText(v1, snapshot, l1.start, l1.end, [f.related], 'ptbr-inline-hit', false, false);
        var v2 = el('span', b, 'ptbr-rhyme-line');
        appendMarkedText(v2, snapshot, l2.start, l2.end, [f], 'ptbr-inline-hit', false, false);
      } else if (isRepeat && f.occurrences && f.occurrences.length > 1) {
        var repStart = typeof f.contextStart === 'number' ? Math.max(0, f.contextStart - 28) : Math.max(0, f.start - 40);
        var repEnd = Math.min(snapshot.length, f.end + 36);
        var lbRep = lineBounds(snapshot, f.start);
        repStart = Math.max(lbRep.start, repStart); repEnd = Math.min(lbRep.end, repEnd);
        var repCtx = el('span', b, 'ptbr-ctx-line');
        appendMarkedText(repCtx, snapshot, repStart, repEnd, f.occurrences, 'ptbr-inline-hit', repStart > lbRep.start, repEnd < lbRep.end);
        el('span', b, 'ptbr-word-tag', f.occurrences.length + '× “' + f.snippet + '” no trecho');
      } else if (isRitmo) {
        el('span', b, 'ptbr-word-text', f.snippet);
        var wc = f.snippet.replace(/^\s+|\s+$/g, '').split(/\s+/).length;
        var pct = Math.max(10, Math.round((wc / maxWords) * 100));
        var meter = el('span', b, 'ptbr-rhythm-meter');
        var fill = el('span', meter, 'ptbr-rhythm-bar');
        if (fill.style) { fill.style.width = pct + '%'; }
        el('span', meter, 'ptbr-rhythm-count', wc + (wc === 1 ? ' palavra' : ' palavras'));
      } else {
        /* Convenções e escolhas de escrita: exibe o trecho destacado dentro da frase real */
        var win = sentenceWindow(snapshot, f.start, f.end);
        var ctxLine = el('span', b, 'ptbr-ctx-line');
        appendMarkedText(ctxLine, snapshot, win.start, win.end, [f], 'ptbr-inline-hit', win.prefixEllipsis, win.suffixEllipsis);
        el('span', b, 'ptbr-word-tag', f.message || label(f));
      }

      b.addEventListener('click', function () { select(index, true); }, false);
      buttons.push(b); wordClasses.push(normCls); rowFor.push(rows.length - 1); previous = f;
    });

    function applyClassFilter(cls) {
      activeClassFilter = cls || '';
      filterButtons.forEach(function (fb) {
        fb.setAttribute('aria-pressed', fb.getAttribute('data-filter-class') === activeClassFilter ? 'true' : 'false');
      });
      buttons.forEach(function (b, idx) {
        var dim = !!activeClassFilter && wordClasses[idx] !== activeClassFilter;
        b.setAttribute('data-dimmed', dim ? 'true' : 'false');
      });
    }

    function draw() {
      if (dead || active < 0) { return; }
      diagrams.forEach(function (svg) { if (svg) { svg.textContent = ''; } });
      var f = arr[active], ri = rowFor[active], svg = diagrams[ri], b = buttons[active], curRow = rows[ri];
      if (!svg || !b.getBoundingClientRect || f.analysisStatus !== 'contextual') { return; }
      var rb = curRow.getBoundingClientRect(), bb = b.getBoundingClientRect();
      if (!rb.width) { return; }
      var rowH = typeof rb.height === 'number' && rb.height > 0 ? rb.height : 66;
      var x = bb.left - rb.left + bb.width / 2;
      var y1 = typeof bb.top === 'number' && typeof rb.top === 'number' ? Math.max(18, bb.top - rb.top) : 60;
      svg.setAttribute('width', rb.width);
      svg.setAttribute('height', Math.max(66, rowH));
      svg.setAttribute('viewBox', '0 0 ' + rb.width + ' ' + Math.max(66, rowH));
      var lane = 0;
      (f.context || []).forEach(function (support) {
        if (!valid(snapshot, support) || lane >= 3) { return; }
        for (var j = 0; j < arr.length; j++) {
          if (j === active || rowFor[j] !== ri || arr[j].start !== support.start || arr[j].end !== support.end) { continue; }
          var r = buttons[j].getBoundingClientRect();
          var x2 = r.left - rb.left + r.width / 2;
          var y2 = typeof r.top === 'number' && typeof rb.top === 'number' ? Math.max(18, r.top - rb.top) : 60;
          var topY = Math.min(y1, y2) - (20 + lane * 10);
          svgEl('path', svg, {
            d: 'M ' + x.toFixed(1) + ' ' + y1.toFixed(1) + ' Q ' + ((x + x2) / 2).toFixed(1) + ' ' + Math.max(4, topY).toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1),
            fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-dasharray': '3 3'
          });
          buttons[j].setAttribute('data-reading-support', 'true');
          lane++;
          break;
        }
      });
    }

    function select(index, user) {
      if (dead || !arr[index] || (options.isCurrent && !options.isCurrent())) { return; }
      active = index;
      buttons.forEach(function (b, j) { b.setAttribute('aria-pressed', j === index ? 'true' : 'false'); b.setAttribute('data-reading-support', 'false'); });
      selected.textContent = '“' + arr[index].snippet + '” · ' + label(arr[index]);
      options.onSelect(arr[index], details, user);
      root.clearTimeout(timer); timer = root.setTimeout(draw, 0);
    }

    function resize() { if (!dead) { root.clearTimeout(timer); timer = root.setTimeout(draw, 0); } }
    if (root.addEventListener) { root.addEventListener('resize', resize, false); }
    if (D.fonts && D.fonts.ready) { D.fonts.ready.then(resize); }

    var first = 0;
    for (var i = 0; i < arr.length; i++) { if (arr[i].analysisStatus === 'contextual') { first = i; break; } }
    if (options.initialTarget) {
      first = -1;
      for (var targetAt = 0; targetAt < arr.length; targetAt++) {
        if (arr[targetAt].start <= options.initialTarget.start && arr[targetAt].end >= options.initialTarget.end) { first = targetAt; break; }
      }
    }
    if (first >= 0 && arr.length) { select(first, false); }
    return {
      select: select,
      destroy: function () { dead = true; root.clearTimeout(timer); if (root.removeEventListener) { root.removeEventListener('resize', resize, false); } }
    };
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: ptbr/preparacao.js */
/* Preparação leve: um recorte junto ao cursor, uma pausa, nenhum exame completo. ES5.
 * O hospedeiro fornece somente até 2.001 unidades UTF-16, nunca a folha inteira.
 * Sem fila, persistência, rede ou cache cumulativo. */
(function(root){
  'use strict';
  function create(E,host){
    var timer=null,generation=0,cached=null,scanner=null;
    var limits={delay:700,characters:2000,tokens:400,snapshotCharacters:2001,cacheEntries:1,occurrences:24,lexicalTokens:200,signalTokens:200};
    var supported={ortografia:true,acentuacao:true,pontuacao:true,crase:true,concordancia:true,
      morfologia:true,expressoes:true,repeticao:true,adverbios:true,dialogo:true,ritmo:true,rima:true,metrica:true};
    function reserve(input){
      var check=input.head.slice(0,limits.characters),items=[],visited=0,matched=0,m,rows,classes,j,label,item,worst;
      var anchor=typeof input.anchor==='number'?input.anchor:(input.start||0),lexStart=Math.max(0,anchor-(input.start||0)-256);
      var word=/[A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f]+(?:[-'’][A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f]+)*|[0-9]+/g;
      var continuation=/[A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f0-9'’\-]/;
      if(!E.lookupMorphology||!E.reading||!E.reading.canonical){return{items:items,visited:0,available:false,limited:false};}
      word.lastIndex=lexStart;
      while(visited<limits.lexicalTokens&&(m=word.exec(check))){
        visited++;
        if(m[0].length>64||m.index===lexStart&&(lexStart?continuation.test(check.charAt(lexStart-1)):input.leftContinues)||word.lastIndex===check.length&&continuation.test(input.head.charAt(check.length))){continue;}
        rows=E.lookupMorphology(E.reading.canonical(m[0]));classes=[];
        for(j=0;j<rows.length&&j<32;j++){
          label=E.describeMorphology?E.describeMorphology(rows[j]).split(' · ')[0]:rows[j].pos;
          if(classes.indexOf(label)===-1){classes.push(label);}
        }
        if(classes.length){
          matched++;item={start:(input.start||0)+m.index,end:(input.start||0)+word.lastIndex,snippet:m[0],classes:classes};
          if(items.length<limits.occurrences){items.push(item);}else{
            worst=0;for(j=1;j<items.length;j++){if(Math.abs(items[j].start-anchor)>Math.abs(items[worst].start-anchor)){worst=j;}}
            if(Math.abs(item.start-anchor)<Math.abs(items[worst].start-anchor)){items[worst]=item;}
          }
        }
      }
      items.sort(function(a,b){return a.start-b.start;});
      return{items:items,visited:visited,available:true,limited:matched>limits.occurrences||visited===limits.lexicalTokens||lexStart>0};
    }
    function cancel(clear){generation++;if(timer!==null){host.clearTimeout(timer);timer=null;}if(clear){cached=null;}}
    function request(){
      cancel(false);if(!host.active()){return;}
      var ticket=generation;
      timer=host.setTimeout(function(){
        timer=null;if(ticket!==generation||!host.active()){return;}
        var input=host.read(limits.snapshotCharacters),result;
        if(!input||typeof input.head!=='string'||input.head.length>limits.snapshotCharacters){host.deliver(null);return;}
        if(cached&&cached.document===input.document&&cached.revision===input.revision&&cached.head===input.head&&cached.length===input.length&&cached.start===(input.start||0)&&cached.leftContinues===!!input.leftContinues&&cached.anchor===input.anchor){host.deliver(cached.result);return;}
        try{
          var lexical=reserve(input),start=input.start||0;
          /* Contexto anterior desconhecido: não rodar heurísticas de frase no meio da folha. */
          if(start===0){
            if(!scanner){scanner=E.createSignalTriage(E,{maxChars:limits.characters,maxTokens:limits.signalTokens});}
            result=scanner.scan(input.head);
          }else{result={signals:{},read:Math.min(input.head.length,limits.characters),work:{characters:Math.min(input.head.length,limits.characters),tokens:0}};}
          result={signals:result.signals,signalsVerified:start===0,read:result.read,scope:{start:start,end:start+Math.min(input.head.length,limits.characters)},
            partial:start>0||result.read<input.length||lexical.limited,work:{characters:Math.min(input.head.length,limits.characters),tokens:result.work.tokens+lexical.visited},
            document:input.document,revision:input.revision,occurrences:lexical.items,lexicalAvailable:lexical.available,lexicalLimited:lexical.limited};

        }catch(error){cached=null;host.deliver(null);return;}
        if(ticket!==generation||!host.active()){return;}
        cached={document:input.document,revision:input.revision,head:input.head,length:input.length,start:input.start||0,leftContinues:!!input.leftContinues,anchor:input.anchor,result:result};host.deliver(result);
      },limits.delay);
    }
    function state(result,lens){
      if(!result||!supported[lens]){return 'nao-verificado';}
      if(lens==='morfologia'&&result.occurrences&&result.occurrences.length){return 'encontrado';}
      if(!result.signalsVerified){return 'nao-verificado';}
      return result.signals[lens]?'encontrado':'nao-encontrado-no-recorte';
    }
    return{request:request,cancel:cancel,state:state,limits:limits};
  }
  root.Escr=root.Escr||{};root.Escr.createPreparation=create;
  if(typeof module!=='undefined'&&module.exports){module.exports=create;}
}(typeof window!=='undefined'?window:this));

;
/* Fonte: ptbr/pertinencia.js */
/* Seleção de lentes pelos estados já preparados. ES5; sem texto, DOM ou motores. */
(function(root){
  'use strict';
  function select(lenses,states,onlySignals){
    var visible=[],found=0,absent=0,unknown=0,i,id,state;
    for(i=0;i<lenses.length;i++){
      id=lenses[i];state=states[id];
      if(state==='encontrado'){found++;}
      else if(state==='nao-encontrado-no-recorte'){absent++;}
      else{unknown++;}
      if(!onlySignals||state==='encontrado'){visible.push(id);}
    }
    return{visible:visible,found:found,absent:absent,unknown:unknown};
  }
  root.Escr=root.Escr||{};root.Escr.selectPreparedLenses=select;
  if(typeof module!=='undefined'&&module.exports){module.exports=select;}
}(typeof window!=='undefined'?window:this));

;
/* Fonte: ptbr/painel.js */
/* Painel de análise da main. ES5, sem rede, sem alterar manuscritos nem o cofre.
 * O editor existente permanece a origem da escrita e das escolhas persistidas.
 * Uma lente por escolha; preparação limitada após pausa, suspensa na digitação.
 */
(function (root) {
  'use strict';
  var D = root.document, E = root.Escr;
  if (!E || !E.createVault || !E.reading || !E.knowledge) { return; }
  var panel = D.getElementById('oficina'), manuscript = D.getElementById('manuscrito');
  if (!panel || !manuscript || D.getElementById('ptbr-dashboard')) { return; }
  var own = Object.prototype.hasOwnProperty, epoch = 0, debounce = null, draft = null, busy = false, composing = false;
  var fullScope = 200000, maxFindings = 100, lastLens = null, readingView = null, currentGroup = null, screen = 'home';
  var labels = {
    ortografia:'Ortografia', acentuacao:'Acentuação', pontuacao:'Pontuação',
    crase:'Crase', concordancia:'Concordância', morfologia:'Classes de palavras',
    expressoes:'Expressões', repeticao:'Repetição próxima', adverbios:'Formas em -mente',
    dialogo:'Linhas de diálogo', ritmo:'Ritmo', rima:'Rimas', metrica:'Métrica',
    sintaxe:'Relações da oração', relativas:'Orações relativas · recorte inicial', decolonial:'Vocabulário decolonial'
  };
  var descriptions={
    ortografia:'Grafias previstas no acervo local; palavra desconhecida não significa erro.',
    acentuacao:'Acentos nos casos cobertos pelas regras locais.',
    pontuacao:'Sinais e sequências de pontuação previstos nas regras.',
    crase:'Uso do acento grave nos casos cobertos; não é uma revisão geral de regência.',
    concordancia:'Casos delimitados de haver, existir e fazer.',
    morfologia:'Classes gramaticais: possibilidades do léxico e hipóteses no contexto.',
    sintaxe:'Funções e vínculos entre termos em construções cobertas.',
    relativas:'Orações adjetivas relativas: hipóteses de vínculo com um antecedente.',
    expressoes:'Expressões do acervo, com leitura de uso e estilo.',
    repeticao:'Palavras repetidas perto umas das outras; podem ser uma escolha de estilo.',
    adverbios:'Formas em -mente do acervo; a terminação não decide sozinha a função.',
    dialogo:'Linhas com marcas de diálogo; não identifica toda fala narrativa.',
    ritmo:'Medidas da extensão das frases; não atribui qualidade à escrita.',
    rima:'Aproximações sonoras entre finais de versos.',
    metrica:'Estimativa de sílabas poéticas; a leitura em voz alta pode variar.',
    decolonial:'Vocabulário do acervo para reflexão sobre o uso; não infere intenção.'
  };
  function el(tag, parent, cls, value) {
    var n = D.createElement(tag);
    if (cls) { n.className = cls; }
    if (typeof value === 'string') { n.textContent = value; }
    if (parent) { parent.appendChild(n); }
    return n;
  }
  function documentKey(){return E.ptbrPanelDocument?E.ptbrPanelDocument():null;}
  function currentSelection(snapshot){
    var sel=E.ptbrPanelSelection?E.ptbrPanelSelection():null;
    if(!sel||sel.text!==snapshot||typeof sel.start!=='number'||typeof sel.end!=='number'||sel.start<0||sel.end<=sel.start||sel.end>snapshot.length){return null;}
    return sel;
  }
  function activeScopeLength(s){var sel=currentSelection(s);return sel?(sel.end-sel.start):s.length;}
  var style=el('style',D.head,null,
    '#oficina #back-writing{width:auto;min-width:110px;flex-basis:auto;font-size:12px;padding:8px;line-height:1.4}#oficina .sheet-heading{margin-bottom:18px}' +
    '#ptbr-dashboard{font-family:inherit;color:inherit;margin:12px 0 22px;min-width:0}' +
    '#oficina[data-ptbr-dashboard="true"]>.lens-group-label,' +
    '#oficina[data-ptbr-dashboard="true"]>.lenses,' +
    '#oficina[data-ptbr-dashboard="true"]>#findings,' +
    '#oficina[data-ptbr-dashboard="true"]>#analysis-status,' +
    '#oficina[data-ptbr-dashboard="true"]>#analysis-coverage,' +
    '#oficina[data-ptbr-dashboard="true"]>#ptbr-dashboard+p.quiet{display:none!important}' +
    '#oficina[data-ptbr-dashboard="true"]>#reset-dismissed{display:block;margin:12px 0}' +
    '#ptbr-dashboard [hidden]{display:none!important}.ptbr-goals button{display:block;width:100%;text-align:left;padding:12px;margin:8px 0;font:inherit;color:inherit;background:transparent;border:1px solid currentColor;cursor:pointer}.ptbr-goals strong,.ptbr-goals span{display:block}.ptbr-goals span{font-size:12px;line-height:1.5;margin-top:4px}.ptbr-wheel button{display:block;width:100%;margin:8px 0;min-height:42px;cursor:pointer}.ptbr-intro{font-size:14px;line-height:1.6}.ptbr-back{font:inherit;font-size:12px;margin:0 0 12px;padding:8px;color:inherit;background:transparent;border:1px solid currentColor}.ptbr-count{display:none}.ptbr-details{margin:12px 0}.ptbr-details-content{font-size:12px;line-height:1.5}' +
    '#oficina[data-ptbr-dashboard="true"]>#reset-dismissed[hidden]{display:none!important}' +
    '.ptbr-rule{border:0;border-top:1px solid currentColor;opacity:.2;margin:14px 0}' +
    '.ptbr-overline{font-size:11px;letter-spacing:.065em;text-transform:uppercase;opacity:.73;font-weight:700;margin:0 0 9px}' +
    '.ptbr-count{display:block}' +
    '.ptbr-stat{display:inline-block;vertical-align:baseline;min-width:0;padding:5px 0}' +
    '.ptbr-stat strong{font-size:19px;line-height:1.15;font-weight:700;font-variant-numeric:tabular-nums;word-wrap:break-word;overflow-wrap:break-word}' +
    '.ptbr-stat span{font-size:11px;line-height:1.5;opacity:.75}' +
    '.ptbr-stat-major strong{font-size:36px;letter-spacing:-.055em;line-height:1;font-weight:750}' +
    '.ptbr-wheel{display:block;margin:9px 0}' +
    '.ptbr-wheel button{max-width:100%;padding:7px 10px;border:1px solid currentColor;border-radius:2px;background:transparent;color:inherit;text-align:left;font:inherit;font-size:12px;opacity:.87}' +
    '.ptbr-wheel button[aria-current="true"]{background:currentColor;opacity:1}' +
    '.ptbr-wheel button[aria-current="true"] span{color:var(--paper,#eceee5)}' +
    '.ptbr-action{display:block;width:100%;margin:12px 0 8px;min-height:38px;padding:7px 12px;border:1px solid currentColor;background:transparent;color:inherit;font:inherit;font-weight:700;cursor:pointer}' +
    '.ptbr-action:disabled{opacity:.45;cursor:default}' +
    '.ptbr-lexical label{display:block}.ptbr-lexical-input{display:block;box-sizing:border-box;width:100%;padding:7px;border:1px solid currentColor;background:transparent;color:inherit;font:inherit}' +
    '.ptbr-reserve-filter label{display:block}.ptbr-reserve-filter select{display:block;width:100%;max-width:100%;box-sizing:border-box;font:inherit;color:inherit;background:transparent}' +
    '.ptbr-lens-description,.ptbr-signal{display:block;white-space:normal;font-size:12px;line-height:1.5;margin-top:5px}.ptbr-signal{font-style:italic;opacity:.8}' +
    '.ptbr-status{font-size:12px;line-height:1.5;opacity:.8;min-height:20px}' +
    '.ptbr-outcome{padding:10px 0;border-top:1px dotted currentColor}' +
    '.ptbr-outcome h3{font:inherit;font-weight:700;margin:0 0 5px}' +
    '.ptbr-outcome p{margin:5px 0;font-size:12px;line-height:1.5}' +
    '.ptbr-outcome blockquote{margin:8px 0;padding:4px 8px;border-left:2px solid currentColor;font-size:12px;word-wrap:break-word;overflow-wrap:break-word}' +
    '.ptbr-outcome button{font:inherit;font-size:12px;padding:6px;margin:5px 5px 2px 0}' +
    '.ptbr-academy-link{margin-left:auto;padding:3px 9px;font:600 11px/1.25 Arial,Helvetica,sans-serif;border:1px solid currentColor;border-radius:2px;background:transparent;color:inherit;opacity:.78;cursor:pointer;white-space:nowrap}' +
    '.ptbr-academy-link:hover,.ptbr-academy-link:focus-visible{opacity:1;text-decoration:underline}' +
    '@media(max-width:760px){#ptbr-dashboard{padding-bottom:env(safe-area-inset-bottom,0px)}.ptbr-stat-major strong{font-size:36px}}'
  );
  var view=el('div',null,'');view.id='ptbr-dashboard';
  var heading=panel.querySelector('.sheet-heading');panel.insertBefore(view,heading?heading.nextSibling:panel.firstChild);
  var activeNoteBar=el('div',view,'ptbr-active-note');
  var activeNoteBadge=el('span',activeNoteBar,'ptbr-active-note-badge','Nota ativa');
  var activeNoteName=el('strong',activeNoteBar,'ptbr-active-note-title','Nota sem título');
  var activeNoteMeta=el('span',activeNoteBar,'ptbr-active-note-meta','0 palavras');
  if(typeof E.openAcademyGuide==='function'){
    var academyGuideBtn=el('button',activeNoteBar,'ptbr-academy-link','Guia de revisão · Academia');
    academyGuideBtn.type='button';
    academyGuideBtn.setAttribute('data-ptbr-academy','revisao-manuscrito');
    academyGuideBtn.addEventListener('click',function(){E.openAcademyGuide('revisao-manuscrito');},false);
  }
  var ribbon=el('nav',view,'ptbr-ribbon');ribbon.setAttribute('aria-label','Atalhos rápidos de exame');
  var quickLenses=['morfologia','sintaxe','relativas','ritmo','repeticao','ortografia','crase','rima','metrica'];
  var quickShort={morfologia:'Classes de palavras',sintaxe:'Sintaxe',relativas:'Relativas',ritmo:'Ritmo',repeticao:'Repetição',ortografia:'Ortografia',crase:'Crase',rima:'Rimas',metrica:'Métrica'};
  var ribbonButtons={};
  for(var qi=0;qi<quickLenses.length;qi++){
    (function(id){
      var qb=el('button',ribbon,'ptbr-ribbon-btn',quickShort[id]||labels[id]);
      qb.type='button';qb.setAttribute('data-ptbr-quick',id);qb.setAttribute('aria-current','false');
      qb.addEventListener('click',function(){run(id);},false);
      ribbonButtons[id]=qb;
    }(quickLenses[qi]));
  }
  var ribbonLexBtn=null;
  if(E.lookupLexeme){
    ribbonLexBtn=el('button',ribbon,'ptbr-ribbon-btn','Léxico');
    ribbonLexBtn.type='button';ribbonLexBtn.setAttribute('data-ptbr-quick','lexical');ribbonLexBtn.setAttribute('aria-current','false');
    ribbonLexBtn.addEventListener('click',function(){showScreen('lexical',null,true);},false);
  }
  function updateActiveNoteStrip(){
    var s=manuscript.value||'',sel=currentSelection(s);
    var noteTitle=E.ptbrPanelTitle?E.ptbrPanelTitle():'Nota ativa';
    activeNoteName.textContent=noteTitle;
    if(sel){
      activeNoteBadge.textContent='Trecho selecionado';
      activeNoteMeta.textContent=(sel.end-sel.start)+' caracteres';
    }else{
      activeNoteBadge.textContent='Nota ativa';
      var words=s.replace(/^\s+|\s+$/g,'');
      var wc=words?words.split(/\s+/).length:0;
      activeNoteMeta.textContent=wc+(wc===1?' palavra':' palavras');
    }
    var dis=composing||!s.length||activeScopeLength(s)>fullScope;
    for(var id in ribbonButtons){if(own.call(ribbonButtons,id)){
      ribbonButtons[id].disabled=dis;
      ribbonButtons[id].setAttribute('aria-current',(screen==='result'&&lastLens===id)?'true':'false');
    }}
    if(ribbonLexBtn){ribbonLexBtn.setAttribute('aria-current',screen==='lexical'?'true':'false');}
  }
  var groups = [
    {title:'Revisar a escrita',hint:'Grafia, acentos, pontuação, crase e concordância.',lenses:['ortografia','acentuacao','pontuacao','crase','concordancia']},
    {title:'Entender uma frase',hint:'Classes de palavras e relações entre partes da oração.',lenses:['morfologia','sintaxe','relativas']},
    {title:'Observar o estilo',hint:'Repetições, expressões, advérbios, diálogo e vocabulário.',lenses:['expressoes','repeticao','adverbios','dialogo','decolonial']},
    {title:'Ler como poesia',hint:'Ritmo, rimas e métrica.',lenses:['ritmo','rima','metrica']}
  ];
  var backMenu=el('button',view,'ptbr-back','Voltar às opções');backMenu.type='button';backMenu.hidden=true;
  var title=el('h3',view,'ptbr-title','O que você quer observar?');title.setAttribute('tabindex','-1');
  var intro=el('p',view,'ptbr-intro','Escolha uma tarefa para olhar seu texto. Você decide o que examinar e o que manter.');
  var goals=el('div',view,'ptbr-goals');
  for(var gi=0;gi<groups.length;gi++){
    var goal=el('button',goals,'');goal.type='button';
    el('strong',goal,'',groups[gi].title);el('span',goal,'',groups[gi].hint);
    (function(index){goal.addEventListener('click',function(){showScreen('group',index,true);},false);}(gi));
  }
  if(E.lookupLexeme){var lookupGoal=el('button',goals,'');lookupGoal.type='button';
    el('strong',lookupGoal,'','Consultar uma palavra');el('span',lookupGoal,'','Ver significados e flexões no acervo local.');
    lookupGoal.addEventListener('click',function(){showScreen('lexical',null,true);},false);
  }
  var prepStatus=el('p',view,'ptbr-status','');prepStatus.setAttribute('aria-live','polite');
  var reservedButton=el('button',view,'ptbr-reserved-button','Ver palavras reconhecidas');reservedButton.type='button';reservedButton.hidden=true;
  var lensFilterBox=el('div',view,'ptbr-reserve-filter');lensFilterBox.hidden=true;
  var lensFilterLabel=el('label',lensFilterBox,'ptbr-status','Mostrar análises desta tarefa');lensFilterLabel.setAttribute('for','ptbr-lens-filter');
  var lensFilter=el('select',lensFilterBox,'');lensFilter.id='ptbr-lens-filter';lensFilter.setAttribute('aria-controls','ptbr-lens-list');
  el('option',lensFilter,'','Todas as análises').value='all';
  el('option',lensFilter,'','Com indícios neste recorte').value='signals';lensFilter.value='all';
  var lensFilterStatus=el('p',lensFilterBox,'ptbr-status','');lensFilterStatus.setAttribute('role','status');
  var wheel=el('div',view,'ptbr-wheel');
  wheel.id='ptbr-lens-list';
  var preparation=null,prepared=null,signalLabels={};
  lensFilter.addEventListener('change',paintLensFilter,false);
  var lexicalInput=null, lexicalButton=null;
  if(E.lookupLexeme){
    var lexicalBox=el('div',view,'ptbr-lexical');
    var lexicalLabel=el('label',lexicalBox,'ptbr-status','Palavra selecionada ou digitada');
    lexicalLabel.setAttribute('for','ptbr-lexical-word');
    lexicalInput=el('input',lexicalBox,'ptbr-lexical-input');lexicalInput.id='ptbr-lexical-word';
    lexicalInput.type='text';lexicalInput.maxLength=64;lexicalInput.setAttribute('autocomplete','off');
    lexicalInput.setAttribute('placeholder','Ex.: carros, fui, canto');
    lexicalButton=el('button',lexicalBox,'ptbr-action','Consultar palavra');lexicalButton.type='button';
    lexicalButton.addEventListener('click',consultLexeme,false);
    lexicalInput.addEventListener('keydown',function(e){if(e.keyCode===13&&!e.isComposing){if(e.preventDefault){e.preventDefault();}consultLexeme();}},false);
    lexicalInput.addEventListener('compositionstart',function(){lexicalButton.disabled=true;},false);
    lexicalInput.addEventListener('compositionend',function(){lexicalButton.disabled=false;},false);
  }
  var action=el('button',view,'ptbr-action','Examinar novamente');action.type='button';
  var cancel=el('button',view,'ptbr-cancel','Cancelar análise');cancel.type='button';cancel.hidden=true;
  backMenu.addEventListener('click',function(){
    var target=screen==='result'||screen==='reserved'?'group':'home';
    E.ptbrPanelReset();showScreen(target,currentGroup,true);
  },false);
  var status=el('p',view,'ptbr-status','A análise começa somente quando você pedir.');status.setAttribute('role','status');

  var results=el('div',view,'ptbr-results');
  var empty=el('div',results,'ptbr-empty','Seu texto, por dentro. Escolha uma lente para abrir a leitura anotada.');
  var note=el('p',view,'ptbr-status','O silêncio de uma lente não certifica o texto. A escrita permanece sua.');
  function paintLensFilter(){
    var lenses=groups[currentGroup||0].lenses,states={},id,at,selection,buttons=wheel.querySelectorAll('button');
    lensFilterBox.hidden=screen!=='group'||!E.selectPreparedLenses;
    for(at=0;at<lenses.length;at++){id=lenses[at];states[id]=preparation?preparation.state(prepared,id):'nao-verificado';}
    selection=E.selectPreparedLenses?E.selectPreparedLenses(lenses,states,lensFilter.value==='signals'):{visible:lenses};
    for(at=0;at<buttons.length;at++){buttons[at].hidden=selection.visible.indexOf(buttons[at].getAttribute('data-ptbr-lens'))===-1;}
    if(!E.selectPreparedLenses){return;}
    lensFilterStatus.textContent='Nesta tarefa: '+selection.found+' com indícios; '+selection.absent+' sem indícios no recorte; '+selection.unknown+' com pertinência não verificada.'+
      (lensFilter.value==='signals'?(selection.visible.length?'':' Nenhuma análise com indícios neste recorte.')+' Use Todas as análises para acessar as demais.':'')+
      ' Filtrar não executa análises.';
  }
  function paintPreparation(result){
    prepared=result;reservedButton.hidden=screen!=='group'||currentGroup!==1||!result||!result.lexicalAvailable;reservedButton.disabled=!result||!result.occurrences||!result.occurrences.length;
    reservedButton.textContent=result&&result.occurrences?'Ver palavras reconhecidas ('+result.occurrences.length+')':'Ver palavras reconhecidas';
    for(var id in signalLabels){if(own.call(signalLabels,id)){
      var state=preparation?preparation.state(result,id):'nao-verificado';
      signalLabels[id].textContent=state==='encontrado'?(id==='morfologia'?'Há palavras no léxico; classe contextual a examinar.':'Há indícios para examinar.'):
        state==='nao-encontrado-no-recorte'?'Sem indícios neste recorte; análise disponível.':'Pertinência ainda não verificada.';
      signalLabels[id].setAttribute('data-signal-state',state);
    }}
    prepStatus.textContent=result?'Preparação leve: trecho entre as posições '+(result.scope.start+1)+' e '+result.scope.end+(result.partial?'; o restante não foi verificado.':'.')+' Indícios não são classificações nem erros.':'A preparação aguarda uma pausa na escrita. Nenhuma análise completa é automática.';
    paintLensFilter();
  }
  if(E.createPreparation&&E.createSignalTriage){preparation=E.createPreparation(E,{
    setTimeout:function(fn,ms){return root.setTimeout(fn,ms);},clearTimeout:function(id){root.clearTimeout(id);},
    active:function(){return !panel.hidden&&!D.hidden&&!composing&&!busy&&(screen==='home'||screen==='group')&&!!manuscript.value;},
    read:function(limit){var s=manuscript.value,caret=typeof manuscript.selectionStart==='number'?manuscript.selectionStart:0,start=Math.max(0,Math.min(caret,s.length)-1000);return{head:s.slice(start,start+limit),start:start,anchor:caret,leftContinues:start>0&&/[A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f0-9'’\-]/.test(s.charAt(start-1)),length:s.length,document:documentKey(),revision:E.ptbrPanelRevision?E.ptbrPanelRevision():null};},
    deliver:function(result){paintPreparation(result);if(!result){prepStatus.textContent='Preparação indisponível. Você pode escolher qualquer análise.';}}
  });}
  function showScreen(next,group,focus){
    screen=next;view.setAttribute('data-ptbr-screen',next);prepStatus.hidden=next!=='group';if(typeof group==='number'){currentGroup=group;}
    goals.hidden=next!=='home';wheel.hidden=next!=='group';
    if(lexicalBox){lexicalBox.hidden=next!=='lexical';}
    results.hidden=next!=='result'&&next!=='lexical'&&next!=='reserved';
    action.hidden=next!=='result';note.hidden=next==='home'||next==='group';
    backMenu.hidden=next==='home';
    backMenu.textContent=next==='result'||next==='reserved'?'Escolher outra análise':'Voltar às opções';
    title.textContent=next==='home'?'O que você quer observar?':next==='lexical'?'Consultar uma palavra':next==='result'?(labels[lastLens]||'Resultado'):next==='reserved'?'Palavras reconhecidas':groups[currentGroup||0].title;
    intro.hidden=next==='result'||next==='reserved';
    intro.textContent=next==='home'?'Escolha uma tarefa para olhar seu texto. Você decide o que examinar e o que manter.':next==='lexical'?'Digite uma palavra ou selecione-a no texto antes de abrir este painel. A consulta mostra possibilidades; o sentido depende da frase.':'Escolha um aspecto abaixo para examinar a folha atual. Seu texto permanece intacto.';
    paintLensFilter();
    if(next==='home'||next==='group'){
      var sel=currentSelection(manuscript.value),scopeLen=activeScopeLength(manuscript.value);
      status.textContent=scopeLen>fullScope?(sel?'O trecho selecionado ultrapassa o limite de 200 mil caracteres para análise. A consulta de palavras continua disponível.':'Esta folha ultrapassa o limite de 200 mil caracteres para análise. A consulta de palavras continua disponível.'):!manuscript.value?'Escreva na folha para começar. Você pode consultar uma palavra mesmo com a folha vazia.':sel?'Trecho selecionado para análise ('+scopeLen+' caracteres). A análise completa começa quando você escolhe um aspecto.':'A análise completa começa quando você escolhe um aspecto.';
    }
    reservedButton.hidden=next!=='group'||currentGroup!==1||!prepared||!prepared.lexicalAvailable;
    updateActiveNoteStrip();
    if(preparation){if(next==='home'||next==='group'){preparation.request();}else{preparation.cancel(false);}}
    if(focus){if(next==='lexical'&&lexicalInput){lexicalInput.focus();}else{title.focus();}panel.scrollTop=0;}
  }
  reservedButton.addEventListener('click',function(){
    if(!prepared||!prepared.occurrences.length||panel.hidden){return;}
    if(E.ptbrPanelRevision&&prepared.revision!==E.ptbrPanelRevision()){
      prepared=null;paintPreparation(null);if(preparation){preparation.request();}
      status.textContent='O texto foi guardado; aguarde preparar as ocorrências novamente.';return;
    }
    var reservation=prepared,reservationEpoch=epoch;clearResults();showScreen('reserved',1,true);
    el('p',results,'ptbr-status','Estas palavras estão no acervo. As classes abaixo são possibilidades do léxico, inclusive em citações; não classificam a sua frase.');
    if(reservation.lexicalLimited){el('p',results,'ptbr-status','Limite de preparação atingido. Há outras palavras que ainda não foram verificadas.');}
    function current(item){return epoch===reservationEpoch&&!panel.hidden&&!D.hidden&&!composing&&screen==='reserved'&&prepared===reservation&&documentKey()===reservation.document&&(!E.ptbrPanelRevision||E.ptbrPanelRevision()===reservation.revision)&&manuscript.value.slice(item.start,item.end)===item.snippet;}
    var filterBox=el('div',results,'ptbr-reserve-filter'),filterLabel=el('label',filterBox,'ptbr-status','Filtrar por classe possível no léxico');
    filterLabel.setAttribute('for','ptbr-reserve-class');
    var filter=el('select',filterBox,'');filter.id='ptbr-reserve-class';
    var all=el('option',filter,'','Todas as ocorrências ('+reservation.occurrences.length+')');all.value='';
    var classes=[],counts={},rows=[],ci,ri,cls;
    for(ri=0;ri<reservation.occurrences.length;ri++){
      for(ci=0;ci<reservation.occurrences[ri].classes.length;ci++){
        cls=reservation.occurrences[ri].classes[ci];
        if(classes.indexOf(cls)===-1){classes.push(cls);counts['$'+cls]=0;}counts['$'+cls]++;
      }
    }
    classes.sort();
    for(ci=0;ci<classes.length;ci++){cls=classes[ci];var option=el('option',filter,'',cls+' ('+counts['$'+cls]+')');option.value=cls;}
    el('p',filterBox,'ptbr-status','Contagens apenas desta reserva. Uma palavra pode aparecer em mais de uma classe; a frase ainda precisa ser examinada.');
    filter.addEventListener('change',function(){
      if(!reservation.occurrences.length||!current(reservation.occurrences[0])){staleReset('O texto mudou. Abra as opções para preparar novamente.');return;}
      var visible=0;
      for(var at=0;at<rows.length;at++){
        rows[at].hidden=!!filter.value&&reservation.occurrences[at].classes.indexOf(filter.value)===-1;
        if(!rows[at].hidden){visible++;}
      }
      status.textContent='Mostrando '+visible+' de '+rows.length+' ocorrências reservadas'+(filter.value?' com possibilidade de '+filter.value:': todas as classes')+'. Nenhuma nova análise foi executada.';
    },false);
    for(var i=0;i<reservation.occurrences.length;i++){
      (function(item){
        var row=el('section',results,'ptbr-outcome');rows.push(row);el('h3',row,'',item.snippet);
        el('p',row,'','Possibilidades no léxico: '+item.classes.join(', ')+'.');
        var locate=el('button',row,'','Ver no texto');locate.type='button';
        locate.addEventListener('click',function(){
          if(!current(item)){staleReset('O texto mudou. Abra as opções para preparar novamente.');return;}
          locateInText(item.start,item.end,'Selecione a palavra manualmente no manuscrito.');
        },false);
        if(E.analysisContract&&E.ptbrPanelRequest&&E.ptbrPanelCurrent){
          var examine=el('button',row,'ptbr-reserve-examine','Examinar este contexto');examine.type='button';
          examine.addEventListener('click',function(){if(current(item)){runReserved(reservation,item);}else{staleReset('O texto mudou. Abra as opções para preparar novamente.');}},false);
        }
        if(lexicalInput){var consult=el('button',row,'','Consultar palavra');consult.type='button';consult.addEventListener('click',function(){
          if(!current(item)){staleReset('O texto mudou. Abra as opções para preparar novamente.');return;}lexicalInput.value=item.snippet;consultLexeme();
        },false);}
      }(reservation.occurrences[i]));
    }
    status.textContent=reservation.occurrences.length+' ocorrências reservadas neste trecho. Nenhum exame completo foi executado.';
  },false);
  function details(parent,label){
    var wrap=el('div',parent,'ptbr-details'),button=el('button',wrap,'',label),content=el('div',wrap,'ptbr-details-content');
    button.type='button';button.setAttribute('aria-expanded','false');content.hidden=true;
    button.addEventListener('click',function(){content.hidden=!content.hidden;button.setAttribute('aria-expanded',content.hidden?'false':'true');},false);return content;
  }
  function clearResults(){if(readingView){readingView.destroy();readingView=null;}results.textContent='';}
  function locateInText(start,end,fallback){
    if(E.ptbrPanelReveal){if(!E.ptbrPanelReveal(start,end,fallback)){status.textContent=fallback;}return;}
    var back=D.getElementById('back-writing');if(back){back.click();}manuscript.focus();
    if(!E.transfer.selectRange(manuscript,start,end)){var notice=D.getElementById('save-status')||status;notice.textContent=fallback;}
  }
  function staleReset(msg){
    E.ptbrPanelReset();
    if(screen==='result'||screen==='reserved'){showScreen('group',currentGroup||0,false);}
    status.textContent=msg||'O texto mudou. Escolha ou prepare novamente.';
  }
  function refresh(force) {
    if(composing||busy||panel.hidden&&!force){return;}
    var selKey=currentSelection(manuscript.value),selTag=selKey?selKey.start+':'+selKey.end:'';
    if(!force&&draft&&draft.text===manuscript.value&&draft.document===documentKey()&&draft.selection===selTag){return;}
    if(preparation){preparation.cancel(true);}prepared=null;
    epoch++;root.clearTimeout(debounce);busy=false;clearResults();
    el('div',results,'ptbr-empty','Seu texto, por dentro. Escolha uma lente para abrir a leitura anotada.');
    var s=manuscript.value,scopeLen=activeScopeLength(s);draft={text:s,document:documentKey(),selection:selTag};
    if(lexicalInput){
      var selectionStart=manuscript.selectionStart,selectionEnd=manuscript.selectionEnd;
      lexicalInput.value=typeof selectionStart==='number'&&selectionEnd>selectionStart&&selectionEnd-selectionStart<=64?s.slice(selectionStart,selectionEnd):'';
    }
    wheel.textContent='';signalLabels={};lensFilter.value='all';var chosen=[],id,btn,k;
    for(k in labels){if(own.call(labels,k)){chosen.push(k);}}
    for(var i=0;i<chosen.length;i++){id=chosen[i];
      btn=el('button',wheel,'',null);btn.type='button';el('span',btn,'',labels[id]);btn.setAttribute('data-ptbr-lens',id);
      el('small',btn,'ptbr-lens-description',descriptions[id]);signalLabels[id]=el('small',btn,'ptbr-signal','Pertinência ainda não verificada.');
      btn.setAttribute('aria-label','Examinar '+labels[id]);btn.disabled=!s.length||scopeLen>fullScope;
      btn.addEventListener('click',function(){run(this.getAttribute('data-ptbr-lens'));},false);}
    action.disabled=!lastLens||!s.length||scopeLen>fullScope;
    paintPreparation(prepared);showScreen('home',null,false);
    note.textContent='A análise tem cobertura parcial. Ausência de apontamentos não garante ausência de problemas.';

  }
  function resultCard(lens, result, snapshot, request, target) {
    var card=el('section',results,'ptbr-outcome'), h=el('h3',card,'',labels[lens]||lens);
    var documentAtResult=documentKey(),resultEpoch=epoch,revisionAtResult=E.ptbrPanelRevision?E.ptbrPanelRevision():null;
    function currentResult(){return epoch===resultEpoch&&!panel.hidden&&!D.hidden&&!composing&&manuscript.value===snapshot&&documentKey()===documentAtResult&&(!E.ptbrPanelRevision||E.ptbrPanelRevision()===revisionAtResult)&&(!request||E.ptbrPanelCurrent(request));}
    var arr=result.findings||[],i,f,entry,b,detail,ignored=E.ptbrPanelChoices?E.ptbrPanelChoices():[],visible=0;
    function suppressed(f){return ignored.indexOf(f.id+'|'+f.snippet)!==-1&&!(target&&f.start<=target.start&&f.end>=target.end);}
    for(i=0;i<arr.length;i++){if(!suppressed(arr[i])){visible++;}}
    var accepted=[],observations=[],stash=el('div',card,'ptbr-observation-list');
    var countLabel=el('p',card,'',visible?visible+' '+(visible===1?'observação nova':'observações novas')+' neste recorte.':'Nenhuma observação nova neste recorte.');
    for(i=0;i<arr.length&&accepted.length<maxFindings;i++){
      f=arr[i];if(suppressed(f)){continue;}
      entry=el('div',stash,'ptbr-observation');accepted.push(f);observations.push(entry);
      el('p',entry,'',f.message);
      el('blockquote',entry,'',f.snippet);
      detail=el('div',entry,'ptbr-evidence');detail.hidden=true;
      el('p',detail,'','Confiança: '+f.confidence);
      if(f.evidence){
        el('p',entry,'ptbr-reading-summary',f.evidence.observation);
        el('p',detail,'','Observação: '+f.evidence.observation);
        el('p',detail,'','Interpretação: '+f.evidence.interpretation);
        el('p',detail,'','Ambiguidade: '+f.evidence.ambiguity);
        el('p',detail,'','Limite: '+f.evidence.limit);
        if(f.evidence.source){el('p',detail,'','Fonte: '+(f.evidence.source.title||f.evidence.source));}
      }
      b=el('button',entry,'','Ver evidência');b.type='button';
      b.setAttribute('aria-expanded','false');
      (function(target,button){button.addEventListener('click',function(){
        target.hidden=!target.hidden;button.textContent=target.hidden?'Ver evidência':'Fechar evidência';
        button.setAttribute('aria-expanded',target.hidden?'false':'true');
      },false);}(detail,b));
      b=el('button',entry,'','Ver no texto');b.type='button';
      (function(start,end){b.addEventListener('click',function(){
        if(!currentResult()){staleReset('Os resultados perderam a validade porque o texto ou a revisão mudou.');return;}
        locateInText(start,end,'Selecione o trecho manualmente no manuscrito.');
      },false);}(f.start,f.end));
      if((lens==='repeticao'||lens==='adverbios'||lens==='decolonial'||(lens==='morfologia'&&!/\s/.test(f.snippet)))&&E.ptbrOpenWordCard){
        b=el('button',entry,'',lens==='morfologia'?'Definição e sinônimos':'Sinônimos');b.type='button';
        (function(word){b.addEventListener('click',function(){E.ptbrOpenWordCard(word);},false);}(f.snippet));
      }
      if(E.ptbrPanelKeep&&!request){
        b=el('button',entry,'','Manter minha escolha');b.type='button';
        (function(finding,button){button.addEventListener('click',function(){
          if(!currentResult()){staleReset('Os resultados perderam a validade porque o texto ou a revisão mudou.');return;}
          if(E.ptbrPanelKeep(finding,snapshot,documentAtResult)){
            clearResults();resultCard(lens,result,snapshot,request,target);status.textContent='Escolha mantida nesta folha.';
            var reset=D.getElementById('reset-dismissed');if(reset){reset.focus();}
          }else{status.textContent='Não foi possível guardar a escolha. Tente novamente.';}
        },false);}(f,b));
      }
    }
    if(E.renderReadingMap){
      stash.hidden=true;
      readingView=E.renderReadingMap(card,{lens:lens,snapshot:snapshot,findings:accepted,
        initialTarget:target,isCurrent:currentResult,
        onSelect:function(finding,target,user){
          for(var at=0;at<observations.length;at++){stash.appendChild(observations[at]);}
          target.textContent='';var at=accepted.indexOf(finding);
          if(at>=0){target.appendChild(observations[at]);}
        }
      });
      el('p',details(card,'Como ler esta análise'),'ptbr-legend',lens==='morfologia'?'Etiqueta contínua: hipótese contextual. Tracejada: possibilidade no léxico. Sem leitura: fora da cobertura. Arcos pontilhados: apoios, não uma árvore sintática completa.':lens==='sintaxe'?'Os grupos podem se conter: o predicado inclui verbo e complementos. Os arcos mostram vínculos da hipótese selecionada; as mesmas relações aparecem por escrito.':'Os trechos pertencem à lente escolhida. Selecione um para consultar a explicação.');
    }
    if(result.limited){el('p',card,'','O cofre limitou a apresentação aos primeiros 100 apontamentos.');}
    if(result.coverageInfo){
      el('p',details(card,'Alcance desta análise'),'ptbr-scope',result.coverageInfo.summary);
    }
    if(result.assessment&&!result.assessment.eligible){el('p',card,'',result.assessment.reason);}
    return h;
  }
  function consultLexeme(){
    if(composing||panel.hidden||!lexicalInput||lexicalButton.disabled){return;}
    var query=lexicalInput.value,result,i,j,entry,row,heading,link;
    if(E.ptbrLegacyCancel){E.ptbrLegacyCancel();}
    E.ptbrPanelReset();lastLens=null;
    var buttons=wheel.querySelectorAll('button');
    for(i=0;i<buttons.length;i++){buttons[i].setAttribute('aria-current','false');}
    try{result=E.lookupLexeme(query);}catch(error){status.textContent='Não foi possível consultar o léxico local.';return;}
    showScreen('lexical',null,false);
    var card=el('section',results,'ptbr-outcome');
    var sources=details(card,'Fontes e limites da consulta');
    el('h3',card,'','Léxico · '+(result.query||'consulta'));
    function loadP01Senses(emptyFallbackMsg){
      var p01Epoch=++epoch;
      var p01Wait=el('p',card,'','Consultando o léxico offline completo (P01)…');
      status.textContent='Consultando o léxico offline completo (P01)…';
      E.getLexicoP01().lookup(query,function(p01Res){
        if(p01Epoch!==epoch||panel.hidden){return;}
        if(p01Wait.parentNode){p01Wait.parentNode.removeChild(p01Wait);}
        if(!p01Res||p01Res.state!=='found'||!p01Res.entries||!p01Res.entries.length){
          if(emptyFallbackMsg){el('p',card,'',emptyFallbackMsg);}
          status.textContent='Consulta concluída sem sentidos no léxico local.';return;
        }
        el('p',card,'','Sentidos encontrados no acervo offline completo (P01). A consulta não escolhe qual sentido vale na sua frase.');
        var pi,pe,prow;
        for(pi=0;pi<p01Res.entries.length&&pi<12;pi++){
          pe=p01Res.entries[pi];prow=el('div',card,'ptbr-observation');
          el('h4',prow,'',(pi+1)+'. '+(pe.lemma||p01Res.query)+(pe.posLabel?' · '+pe.posLabel:''));
          if(pe.definition){el('p',prow,'',pe.definition);}
          if(pe.synonyms&&pe.synonyms.length){el('p',prow,'','Sinônimos sugeridos pelo acervo: '+pe.synonyms.join(', ')+'.');}
        }
        el('p',sources,'','Fonte: Léxico offline P01 do Escrevaral (Wikcionário / OpenWordNet-PT · 92 mil formas).');
        status.textContent='Consulta offline (P01) concluída: '+p01Res.entries.length+' sentido(s) encontrado(s).';
        note.textContent='Consulta 100% offline. Nenhuma palavra do manuscrito foi alterada.';
      });
    }
    var canP01=!!(E.getLexicoP01&&root.location&&/^https?:$/i.test(root.location.protocol));
    if(result.state!=='found'){
      if(result.state==='uncovered'&&canP01){loadP01Senses(result.message);return;}
      el('p',card,'',result.message);status.textContent='Consulta concluída sem leitura lexical.';return;
    }
    if(result.morphology&&result.morphology.length){
      el('h4',card,'','Lemas e flexões possíveis');
      el('p',card,'','Estas leituras pertencem ao léxico. A consulta não decide qual classe ou função vale na sua frase.');
      for(i=0;i<result.morphology.length;i++){
        entry=result.morphology[i];el('p',card,'',entry.lemma+' — '+E.describeMorphology(entry));
      }
      el('p',sources,'','Fonte das flexões: PortiLexicon-UD · Lopes, Duran, Fernandes e Pardo (2022). Recorte e compactação: Escrevaral.');
      link=el('a',sources,'','Origem e licença das flexões (internet)');link.href='https://github.com/LuceleneL/PortiLexicon-UD/tree/315e063da1f89c89e2097c6e72428ebefb9ab1d1';link.target='_blank';link.rel='noopener noreferrer';
    }
    if(!result.senses.length&&canP01){loadP01Senses('');return;}
    if(result.missingSenseLemmas&&result.missingSenseLemmas.length){el('p',card,'','Sem sentidos/definições neste recorte para: '+result.missingSenseLemmas.join(', ')+'.');}
    el('p',card,'','Sentidos da fonte; a consulta não escolhe qual vale na sua frase. A ordem não indica frequência.');
    var pos={n:'substantivo',v:'verbo',a:'adjetivo',r:'advérbio'};
    for(i=0;i<result.senses.length;i++){
      entry=result.senses[i];row=el('div',card,'ptbr-observation');
      heading=(i+1)+'. '+entry.lemma+' · '+(pos[entry.pos]||entry.pos);
      el('h4',row,'',heading);
      if(entry.definitions.length){for(j=0;j<entry.definitions.length;j++){el('p',row,'',entry.definitions[j]);}}
      else{el('p',row,'','Definição em português indisponível na fonte para este sentido.');}
      el('p',row,'','Termos agrupados pela fonte: '+entry.terms.join(', ')+'.');
      el('p',sources,'ptbr-status','Referência do sentido '+(i+1)+': '+entry.id);
    }
    if(result.limited){el('p',card,'','Mostrados '+result.senses.length+' de '+result.total+' sentidos consultados. A consulta limita a busca a oito lemas.');}
    el('p',sources,'','Os termos do grupo não são intercambiáveis em qualquer frase. A fonte inclui outras variedades do português; este recorte não é um dicionário geral. As flexões vêm de uma fonte separada e também têm cobertura parcial.');
    el('p',sources,'','Fonte: OpenWordNet-PT · Alexandre Rademaker, Valeria de Paiva, Fredson Aguiar e colaboradores · CC BY 4.0. Recorte e organização: Escrevaral.');
    link=el('a',sources,'','Consultar origem e licença (internet)');link.href='https://github.com/own-pt/openWordnet-PT/tree/264016d5899e6969f6f7cb4f1d75fa06037c1fd7';link.target='_blank';link.rel='noopener noreferrer';
    link=el('a',sources,'ptbr-status',' · Licença CC BY 4.0 (internet)');link.href='https://creativecommons.org/licenses/by/4.0/';link.target='_blank';link.rel='noopener noreferrer';
    status.textContent='Consulta local concluída: '+(result.morphology||[]).length+' leituras morfológicas e '+result.total+' sentidos consultados.';
    note.textContent='Consulta offline. Nenhuma palavra do manuscrito foi alterada.';
  }
  function runReserved(reservation,item){
    if(E.ptbrLegacyCancel){E.ptbrLegacyCancel();}
    if(E.ptbrPanelFlush){E.ptbrPanelFlush();}
    var snapshot=manuscript.value,scope=E.analysisContract.reservedScope(snapshot,reservation.scope,item),request=null;
    E.ptbrPanelReset();lastLens='morfologia';showScreen('result',1,true);action.hidden=true;
    var token=epoch,documentAtRun=documentKey(),revisionAtRun=E.ptbrPanelRevision?E.ptbrPanelRevision():null;
    function current(){return token===epoch&&!panel.hidden&&!D.hidden&&!composing&&manuscript.value===snapshot&&documentKey()===documentAtRun&&(!E.ptbrPanelRevision||E.ptbrPanelRevision()===revisionAtRun)&&(!request||E.ptbrPanelCurrent(request));}
    var header=el('section',results,'ptbr-outcome');
    el('h3',header,'','Ocorrência escolhida: '+item.snippet);
    el('p',header,'','Possibilidades no léxico: '+item.classes.join(', ')+'. Elas não são uma decisão contextual.');
    var locate=el('button',header,'','Ver ocorrência no texto');locate.type='button';
    locate.addEventListener('click',function(){
      if(!current()){staleReset('Os resultados perderam a validade porque o texto ou a revisão mudou.');return;}
      locateInText(item.start,item.end,'Selecione a ocorrência manualmente no manuscrito.');
    },false);
    if(scope.reason){el('p',header,'ptbr-context-limit',scope.reason);status.textContent='Contexto não verificado. Nenhuma lente foi executada.';return;}
    try{request=E.ptbrPanelRequest(snapshot,scope.start,scope.end);}catch(error){status.textContent='O pedido não pôde ser vinculado à folha atual.';return;}
    el('p',header,'ptbr-context-scope','Contexto escolhido: posições '+(scope.start+1)+' a '+scope.end+' do original. A leitura destaca a ocorrência escolhida e seus apoios nesta linha.');
    el('blockquote',header,'ptbr-context-original',snapshot.slice(scope.start,scope.end));
    busy=true;cancel.hidden=false;status.textContent='Examinando as classes neste contexto…';
    var boundaryScan=scope.needsBoundary?E.analysisContract.createBoundaryScan(snapshot,scope.start):null;
    function step(){
      if(!current()){if(token===epoch){E.ptbrPanelReset();status.textContent='O pedido perdeu a validade. Abra as opções para preparar novamente.';}return;}
      try{
        if(boundaryScan){
          var boundary=boundaryScan.step();
          if(!boundary.done){status.textContent='Conferindo as proteções anteriores: '+boundary.offset+' de '+scope.start+' caracteres. Você pode cancelar.';debounce=root.setTimeout(step,0);return;}
          scope=E.analysisContract.reservedScope(snapshot,reservation.scope,item,boundary);boundaryScan=null;
          if(scope.reason){el('p',header,'ptbr-context-limit',scope.reason);status.textContent='Contexto não verificado. Nenhuma lente foi executada.';busy=false;cancel.hidden=true;return;}
        }
        var result=E.analysisContract.analyze(E.createVault(E.knowledge),'morfologia',request,item),found=false;
        if(!current()){return;}
        for(var at=0;at<result.findings.length;at++){
          var f=result.findings[at];if(f.start<=item.start&&f.end>=item.end){found=true;break;}
        }
        resultCard('morfologia',result,snapshot,request,item);
        if(!found){el('p',header,'ptbr-context-limit',result.limited?'A ocorrência escolhida ficou além do limite de resultados desta lente. Sua classe contextual não foi verificada.':'A lente não devolveu leitura para a ocorrência escolhida. Isso não significa erro no texto.');}
        status.textContent='Exame do contexto concluído. As possibilidades lexicais e os limites permanecem visíveis.';
      }catch(error){el('p',header,'ptbr-context-limit','Esta lente não concluiu o exame: '+error.message);status.textContent='Não foi possível concluir este contexto.';}
      busy=false;cancel.hidden=true;
    }
    debounce=root.setTimeout(step,0);
  }
  function run(selected) {
    if(composing||panel.hidden||D.hidden||!selected||!own.call(labels,selected)){return;}
    if(E.ptbrLegacyCancel){E.ptbrLegacyCancel();}
    if(E.ptbrPanelFlush){E.ptbrPanelFlush();}
    epoch++;busy=false;lastLens=selected;refresh(true);
    var activeSel=draft?currentSelection(draft.text):null,scopeLen=activeSel?(activeSel.end-activeSel.start):(draft&&draft.text?draft.text.length:0);
    if(!draft||!draft.text||scopeLen<=0||scopeLen>fullScope){status.textContent=scopeLen>fullScope?'Esta folha ultrapassa o limite de 200 mil caracteres para análise.':'Escreva na folha antes de examinar.';return;}
    for(var g=0;g<groups.length;g++){if(groups[g].lenses.indexOf(selected)!==-1){currentGroup=g;}}
    showScreen('result',currentGroup,true);
    var snapshot=draft.text,selAtRun=currentSelection(snapshot),documentAtRun=documentKey(),revisionAtRun=E.ptbrPanelRevision?E.ptbrPanelRevision():null,token=++epoch,vault;
    function current(){return token===epoch&&!panel.hidden&&!D.hidden&&!composing&&manuscript.value===snapshot&&documentKey()===documentAtRun&&(!E.ptbrPanelRevision||E.ptbrPanelRevision()===revisionAtRun);}
    function discard(){if(token===epoch){E.ptbrPanelReset();status.textContent='O pedido perdeu a validade. Escolha outra análise para recomeçar.';}}
    clearResults();
    try{vault=E.createVault(E.knowledge);}catch(e){status.textContent='O cofre não pôde iniciar: '+e.message;return;}
    busy=true;action.disabled=true;cancel.hidden=false;
    var buttons=wheel.querySelectorAll('button');
    for(var i=0;i<buttons.length;i++){buttons[i].setAttribute('aria-current',buttons[i].getAttribute('data-ptbr-lens')===selected?'true':'false');}
    status.textContent='Examinando '+labels[selected]+'…';
    /* Um pedido, um timer cancelável, uma lente. Sem a antiga fila unitária. */
    function executeLens(){
      if(!current()){discard();return;}
      try{
        var result=selAtRun&&E.ptbrPanelRequest&&E.analysisContract?E.analysisContract.analyze(vault,selected,E.ptbrPanelRequest(snapshot,selAtRun.start,selAtRun.end)):vault.analyze(selected,snapshot);
        if(!current()){discard();return;}
        resultCard(selected,result,snapshot);
        status.textContent='Análise concluída. Uma lente examinada: '+labels[selected]+(selAtRun?' (trecho selecionado).':'.');
      }catch(e){
        if(!current()){discard();return;}
        clearResults();var box=el('section',results,'ptbr-outcome');el('h3',box,'',labels[selected]);
        el('p',box,'','Esta lente não concluiu o exame: '+e.message);
        status.textContent='Não foi possível concluir esta análise. Você pode tentar novamente.';
      }
      busy=false;cancel.hidden=true;action.disabled=false;updateActiveNoteStrip();
    }
    debounce=root.setTimeout(function(){
      if(!current()){discard();return;}debounce=null;
      if(selected==='morfologia'&&E.getLexicoP01&&E.contextualMorphology&&root.location&&/^https?:$/i.test(root.location.protocol)){
        var scopeText=selAtRun?snapshot.slice(selAtRun.start,selAtRun.end):snapshot.slice(0,8000);
        var toks=E.reading.tokens(E.protectedText(scopeText)),unknowns=[],seenU={},ti,tv;
        for(ti=0;ti<toks.length&&unknowns.length<160;ti++){
          tv=toks[ti].value;
          if(seenU[tv]){continue;}
          seenU[tv]=true;
          if(!E.contextualMorphology.lexicalReadings(tv).classes.length){unknowns.push(tv);}
        }
        if(unknowns.length){
          status.textContent='Consultando léxico offline P01 para '+unknowns.length+' palavra(s)…';
          E.getLexicoP01().warmWords(unknowns,function(){
            if(!current()){discard();return;}
            executeLens();
          });
          return;
        }
      }
      executeLens();
    },0);
  }
  action.addEventListener('click',function(){run(lastLens);},false);
  cancel.addEventListener('click',function(){
    E.ptbrPanelReset();
    action.disabled=composing||!lastLens||!manuscript.value||activeScopeLength(manuscript.value)>fullScope;
    status.textContent='Análise cancelada. Escolha outra análise ou clique em Examinar novamente.';
  },false);
  manuscript.addEventListener('input',function(){
    if(preparation){preparation.cancel(true);}paintPreparation(null);
    epoch++;busy=false;root.clearTimeout(debounce);action.disabled=true;clearResults();
    status.textContent='O texto mudou. Os resultados anteriores foram retirados.';
    cancel.hidden=true;draft=null;action.disabled=composing||!lastLens||!manuscript.value||manuscript.value.length>fullScope;
    var buttons=wheel.querySelectorAll('button');for(var j=0;j<buttons.length;j++){buttons[j].disabled=composing||!manuscript.value||manuscript.value.length>fullScope;}
    updateActiveNoteStrip();
    if(preparation){preparation.request();}
  },false);
  manuscript.addEventListener('compositionstart',function(){composing=true;if(preparation){preparation.cancel(true);}paintPreparation(null);root.clearTimeout(debounce);epoch++;busy=false;draft=null;action.disabled=true;cancel.hidden=true;clearResults();updateActiveNoteStrip();},false);
  manuscript.addEventListener('compositionend',function(){composing=false;root.clearTimeout(debounce);action.disabled=!lastLens||!manuscript.value||manuscript.value.length>fullScope;var buttons=wheel.querySelectorAll('button');for(var j=0;j<buttons.length;j++){buttons[j].disabled=!manuscript.value||manuscript.value.length>fullScope;}updateActiveNoteStrip();if(preparation){preparation.request();}},false);
  panel.addEventListener('focus',function(){if(!panel.hidden){refresh(true);}},false);
  var openers=['examinar-toggle','cabinet-examine'];
  for(var i=0;i<openers.length;i++){var b=D.getElementById(openers[i]);if(b){b.addEventListener('click',function(){root.setTimeout(function(){if(!panel.hidden&&!busy&&screen==='home'){refresh(false);}},0);},false);}}
  D.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.keyCode===13){root.setTimeout(function(){if(!panel.hidden&&!busy&&screen==='home'){refresh(false);}},0);}},false);
  E.ptbrPanelReset=function(){if(preparation){preparation.cancel(true);}paintPreparation(null);epoch++;busy=false;draft=null;root.clearTimeout(debounce);clearResults();action.disabled=true;cancel.hidden=true;updateActiveNoteStrip();};
  E.ptbrPanelSaved=function(conflict){
    if(conflict){
      E.ptbrPanelReset();
      if(!panel.hidden){refresh(true);status.textContent='Outra versão foi preservada no acervo. Prepare ou examine novamente.';}
      return;
    }
    if((screen==='home'||screen==='group')&&prepared&&E.ptbrPanelRevision&&prepared.revision!==E.ptbrPanelRevision()){
      prepared=null;paintPreparation(null);
      if(!panel.hidden&&preparation){preparation.request();}
    }
  };
  E.ptbrPanelLiberate=function(msg){
    if(E.getLexicoP01){E.getLexicoP01().clearSession();}
    E.ptbrPanelReset();
    if(!panel.hidden){
      if(screen==='result'||screen==='reserved'){showScreen('group',currentGroup||0,true);}
      else{title.focus();}
      if(msg){status.textContent=msg;}
    }
  };
  E.ptbrPanelOpen=function(options){
    options=options||{};
    if(!panel.hidden){refresh(false);}
    if(options.lens&&own.call(labels,options.lens)){run(options.lens);return;}
    if(typeof options.group==='number'&&groups[options.group]){showScreen('group',options.group,true);return;}
    title.focus();
  };
  D.addEventListener('visibilitychange',function(){
    if(D.hidden){
      var wasResult=screen==='result'||screen==='reserved';
      E.ptbrPanelReset();
      if(wasResult){showScreen('group',currentGroup||0,false);status.textContent='Os resultados foram recolhidos ao ocultar a aba. Escolha uma análise quando voltar.';}
    }else if(preparation){preparation.request();}
  },false);
  E.ptbrPanelFocus=function(){title.focus();};
  /* Reutiliza o painel nativo, mantendo os botões originais se a inicialização falhar. */
  panel.setAttribute('data-ptbr-dashboard','true');
  if(!panel.hidden){refresh(true);}
}(typeof window!=='undefined'?window:this));

;
/* Fonte: src/app/offline.js */
/* O arquivo portátil é autossuficiente. Cache do site é um recurso opcional. */
(function (root) {
  'use strict';
  var D = root.document, status = D.getElementById('offline-status');
  var mode = D.querySelector('meta[name="distribution-mode"]');
  function show(state, message) {
    if (status) { status.setAttribute('data-offline-state', state); status.textContent = message; }
  }
  function fallback() {
    show('portable-needed', 'A cópia automática do site não está disponível. Guarde a mesa portátil e uma cópia dos seus textos seguindo os passos abaixo.');
  }
  if (root.location.protocol === 'file:' || mode && mode.getAttribute('content') === 'portable') {
    show('portable', 'Você está na mesa portátil. Este arquivo contém o editor e as lentes para abrir sem internet. Guarde seus textos separadamente em “Exportar tudo”.');
    return;
  }
  /* Analíticas sem cookies e sem JS externo (GoatCounter pixel, respeitando Do Not Track). */
  (function countVisit() {
    try {
      var host = root.location && root.location.hostname ? String(root.location.hostname).toLowerCase() : '';
      if (host !== 'escrevaral.com' && host !== 'www.escrevaral.com') { return; }
      if ((root.navigator && root.navigator.doNotTrack === '1') || root.doNotTrack === '1') { return; }
      if (root.navigator && root.navigator.onLine === false) { return; }
      var p = (root.location.pathname || '/') + (root.location.search || '');
      var ref = D.referrer || '';
      var s = root.screen ? (root.screen.width + ',' + root.screen.height + ',' + (root.devicePixelRatio || 1)) : '';
      var q = 'p=' + encodeURIComponent(p.slice(0, 240)) +
        '&t=' + encodeURIComponent(D.title || 'ESCREVARAL') +
        (ref ? '&r=' + encodeURIComponent(ref.slice(0, 240)) : '') +
        (s ? '&s=' + encodeURIComponent(s) : '') +
        '&rnd=' + Math.random().toString(36).slice(2, 8);
      var img = new root.Image();
      img.src = 'https://escrevaral.goatcounter.com/count?' + q;
    } catch (ignore) {}
  }());
  var N = root.navigator, sw = N && N.serviceWorker;
  if (!/^https?:$/.test(root.location.protocol) || root.isSecureContext === false || !sw || !sw.register ||
      !root.Promise || !root.caches || !root.crypto || !root.crypto.subtle || !root.crypto.subtle.digest) {
    fallback(); return;
  }
  show('preparing', 'Preparando uma cópia do site neste navegador. Para guardar uma mesa independente, use o arquivo portátil abaixo.');
  try {
    sw.register('service-worker.js').then(function (registration) {
      function available() {
        show('cached', 'Uma cópia do site está preparada neste navegador para voltar sem internet. O navegador pode removê-la; guarde também a mesa portátil e seus textos.');
      }
      function inspect() {
        if (registration.active && registration.active.state === 'activated') { available(); return; }
        var worker = registration.installing || registration.waiting || registration.active;
        if (!worker) { fallback(); return; }
        function changed() {
          if (worker.state === 'activated') { available(); }
          else if (worker.state === 'redundant') { fallback(); }
        }
        if (worker.addEventListener) { worker.addEventListener('statechange', changed, false); }
        changed();
      }
      inspect();
    }, fallback);
  } catch (error) { fallback(); }
}(window));
