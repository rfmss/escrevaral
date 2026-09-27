/* Gerado; fontes em src/, ptbr/ e build/modules.json. */
(function(root){'use strict';root.Escr=root.EscrCofre.createRuntime();}(window));
/* Fonte: src/storage/documentos.js */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};
  var prefix = 'escrevaral.astra.v1.doc.', counter = 0;
  function uid() { counter += 1; return new Date().getTime().toString(36) + '-' + Math.random().toString(36).slice(2, 10) + '-' + counter; }
  function valid(doc) {
    return doc && (typeof doc.lineage==='undefined'||(root.Escr.lineage&&root.Escr.lineage.valid(doc.lineage))) && (typeof doc.linguistics==='undefined'||(doc.linguistics&&doc.linguistics.version===1&&Object.prototype.toString.call(doc.linguistics.records)==='[object Array]'&&doc.linguistics.records.length<=3&&root.Escr.linguistics&&doc.linguistics.records.every(root.Escr.linguistics.valid))) && (typeof doc.projectId === 'undefined' || (typeof doc.projectId === 'string' && /^[a-z0-9-]+$/.test(doc.projectId))) && (typeof doc.trashed === 'undefined' || typeof doc.trashed === 'boolean') && (typeof doc.kind === 'undefined' || doc.kind === 'reminder') && (typeof doc.project === 'undefined' || (typeof doc.project === 'string' && doc.project.length <= 120)) && typeof doc.id === 'string' && /^[a-z0-9-]+$/.test(doc.id) && (typeof doc.noteId === 'undefined' || (typeof doc.noteId === 'string' && /^[a-z0-9-]+$/.test(doc.noteId))) && typeof doc.title === 'string' && typeof doc.text === 'string' && typeof doc.updated === 'string' && isFinite(Date.parse(doc.updated)) && (typeof doc.created === 'undefined' || (typeof doc.created === 'string' && isFinite(Date.parse(doc.created)))) && (typeof doc.createdApproximate === 'undefined' || typeof doc.createdApproximate === 'boolean') && typeof doc.revision === 'number' && doc.revision >= 0 && doc.revision % 1 === 0 && Object.prototype.toString.call(doc.dismissed) === '[object Array]' && doc.dismissed.every(function (x) { return typeof x === 'string'; });
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
  E.analysisContract = { version: 1, request: request, current: current, analyze: analyze };
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
  function lock(){if(!bridge.checkpoint()){return;}lockFocus=D.activeElement;bridge.prepareLock();locked=true;D.body.setAttribute('data-locked','true');text(byId('keychain-name'),(bridge.book()||{}).name||'ESCREVA[RAL]');byId('lock-password').value='';text(byId('lock-message'),'');curtain.hidden=false;hiddenNodes=[];for(var i=0;i<D.body.children.length;i+=1){var n=D.body.children[i];if(n!==curtain&&n.tagName!=='SCRIPT'){hiddenNodes.push([n,n.getAttribute('aria-hidden')]);n.setAttribute('aria-hidden','true');}}try{root.sessionStorage.setItem('escrevaral.curtain','on');}catch(ignore){}byId('keychain-ring').focus();}
  function unlock(){locked=false;curtain.hidden=true;D.body.removeAttribute('data-locked');hiddenNodes.forEach(function(p){if(p[1]===null){p[0].removeAttribute('aria-hidden');}else{p[0].setAttribute('aria-hidden',p[1]);}});hiddenNodes=[];byId('lock-password').value='';try{root.sessionStorage.removeItem('escrevaral.curtain');}catch(ignore){}if(lockFocus&&D.documentElement.contains(lockFocus)){lockFocus.focus();}}
  on(byId('screen-lock'),'click',lock);on(byId('keychain-ring'),'click',unlock);on(byId('lock-form'),'submit',function(e){e.preventDefault();byId('lock-password').value='';text(byId('lock-message'),'Para abrir, toque ou clique na argola do chaveiro.');});
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
   var displayWidth=Math.max(1,Math.floor(Math.min(spaceW-2,(spaceH-2)/.6))),displayHeight=Math.max(1,Math.floor(displayWidth*.6));
   frame.style.width=(displayWidth+2)+'px';frame.style.height=(displayHeight+2)+'px';canvas.style.width=displayWidth+'px';canvas.style.height=displayHeight+'px';
   var width=Math.min(1000,displayWidth),height=Math.max(1,Math.round(width*.6));
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
    return { originals: originalModel, list: function () { return clone(reload()); }, get: function (bookId) { reload(); var b = find(bookId); return b ? clone(b) : null; }, add: add, update: update, resolve: resolve, decorate: decorate, migrate: migrate, pack: pack, validate: validate, bring: bring };
  }
  E.createNotebooks = create;
  E.createOriginals = function (storage) { return create(storage).originals; };

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
  var originals = null, activeOriginalId = null, formTarget = 'volume';
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
        } else {
          book = notebooks.add(value, activeOriginalId || null);
          hideNotebookForm(); renderNotebooks(); openNotebook(book.id);
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
  function message(value) { text(saveStatus, value); text(byId('cabinet-status'), value); text(byId('panel-status'), value); if (activePanel === 'acervo') { text(byId('archive-status'), value); } }
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
      checkPostWritePwa();
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
    mirror.style.font = style.font; mirror.style.fontFamily = style.fontFamily; mirror.style.fontSize = style.fontSize;
    mirror.style.lineHeight = style.lineHeight; mirror.style.letterSpacing = style.letterSpacing;
    mirror.style.paddingTop = style.paddingTop; mirror.style.paddingBottom = style.paddingBottom;
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
  function typingLineTarget() { return manuscript.clientHeight * 0.42; }
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
    manuscript.scrollTop = Math.max(0, position.top + position.line / 2 - typingLineTarget());
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
    E.transfer.selectRange(manuscript, start + internalClipboard.length, start + internalClipboard.length); manuscript.focus();
    copiedSelection = null; byId('selection-tools').hidden = true; changed(); queueSession();
  }
  function toggleStart(open) {
    if (open) { dismissSelection(); closePanels(false); }
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
    var isCurrent = entry.id === doc.id || (entry.noteId || entry.id) === (doc.noteId || doc.id);
    try {
      archive.trash(isCurrent ? doc : entry);
      if (isCurrent) { var next = archive.list().documents[0] || E.freshDocument(); loadDocument(next); cabinetSelection = null; }
      renderArchive(); renderReminders(); renderCabinet(); renderTimeline(false); saveSession(); message('Movido para a lixeira. Você pode restaurar pelo menu Início.');
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
    var project = cabinetOpen ? cabinetProject : projectName(doc.project), currentId, names = { oficina: 'Examinar', acervo: 'Acervo', mesa: 'Ajustes', 'lineage-panel':'Colaboração' };
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
    byId('path-document').hidden = byId('path-document-separator').hidden = cabinetOpen;
    text(byId('path-document'), title.value || 'Sem título');
    byId('path-document').setAttribute('title', title.value || 'Sem título');
    byId('path-panel').hidden = byId('path-panel-separator').hidden = !activePanel;
    text(byId('path-panel'), activePanel === 'utilidades' ? byId('utility-heading').textContent : activePanel === 'focus-pause' ? 'Pausa' : names[activePanel] || '');
    currentId = activePanel ? 'path-panel' : !cabinetOpen ? 'path-document' : project !== null ? 'path-project' : activeOriginalId ? 'path-original' : 'path-projects';
    ['path-home', 'path-projects', 'path-original', 'path-project', 'path-document', 'path-panel'].forEach(function (id) {
      var el = byId(id);
      if (el) { el.removeAttribute('aria-current'); if (id === currentId) { el.setAttribute('aria-current', 'location'); } }
    });
  }
  function pathToProjects(all) {
    var selected = cabinetOpen ? cabinetProject : projectName(doc.project);
    if (!openCabinet(false)) { return; }
    if (all) { closeOriginal(); return; }
    cabinetProject = selected; byId('cabinet-search').value = ''; renderCabinet();
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
    panelIds.forEach(function(id){var p=byId(id),margin=window.innerWidth<=760?8:16,available=Math.max(0,height-topBar-bottomBar-margin*2),width=id==='utilidades'?(p.getAttribute('data-tool')==='calculator'?340:p.getAttribute('data-tool')==='calendar'?420:380):id==='lineage-panel'?620:440;
      p.style.bottom='auto';p.style.top=(topBar+(id==='focus-pause'?0:margin))+'px';
      if(id==='focus-pause'){p.style.height=Math.max(0,height-topBar-bottomBar)+'px';p.style.maxHeight='none';return;}
      p.style.width=(window.innerWidth<=760?Math.max(0,window.innerWidth-margin*2):Math.min(width,Math.max(0,window.innerWidth-margin*2)))+'px';p.style.right=margin+'px';p.style.height='auto';p.style.maxHeight=available+'px';
    });
  }
  function revealSelection(start, end) {
    returnToWriting(); if (!E.transfer.selectRange(manuscript, start, end)) { message('Selecione o trecho manualmente no manuscrito.'); return; }
    if (!window.getComputedStyle) { return; }
    manuscript.scrollTop = Math.max(0, textPosition(start).top - manuscript.clientHeight / 3); updateFocus();
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
    if (!open) { if (activePanel === id) { closePanels(true); } return; }
    closePanels(false); collapseTimeline();
    panelTrigger = byId(toggle); activePanel = id; text(byId('panel-status'), '');
    byId(id).hidden = false; byId(toggle).setAttribute('aria-expanded', 'true');
    byId('panel-backdrop').hidden = false; document.body.setAttribute('data-panel', 'open');
    byId(id).focus(); byId('writing-space').setAttribute('aria-hidden', 'true'); byId('gabinete').setAttribute('aria-hidden', 'true');
    if (id === 'mesa') { notebookLabels(); }sizePanels(window.visualViewport?window.visualViewport.height:window.innerHeight,byId('location-path').offsetHeight,byId('system-bar').offsetHeight);
    updatePath(); queueSession();
  }
  function setImmersion(enabled) {
    var start = manuscript.selectionStart, end = manuscript.selectionEnd, scroll = manuscript.scrollTop;
    var oldInset = manuscript.style ? parseFloat(manuscript.style.paddingTop) || 0 : 0;
    cancelTypewriter(); closePanels(false); collapseTimeline();
    document.body.setAttribute('data-counts', 'false'); byId('desk-counts').setAttribute('aria-expanded', 'false');
    immersion = enabled; document.body.setAttribute('data-immersion', enabled ? 'true' : 'false');
    byId('immersion-toggle').setAttribute('aria-pressed', enabled ? 'true' : 'false');
    byId('leave-focus').hidden = !enabled;
    manuscript.focus(); sizeWorkspace();
    if (typeof start === 'number') { E.transfer.selectRange(manuscript, start, end); }
    manuscript.scrollTop = Math.max(0, scroll + (manuscript.style ? parseFloat(manuscript.style.paddingTop) || 0 : 0) - oldInset);
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
  function returnToWriting() { if (cabinetOpen) { enterDesk(); } closePanels(false); collapseTimeline(); manuscript.focus(); }
  function loadDocument(next) {
    if(E.ptbrPanelReset){E.ptbrPanelReset();}
    analysisRange = null; copiedSelection = null; byId('selection-tools').hidden = true;
    doc = next; if (doc.projectId) { activeNotebookId = doc.projectId; cabinetProject = doc.project || ''; var loadedBook = notebooks && notebooks.get(doc.projectId); activeOriginalId = loadedBook ? loadedBook.originalId || null : null; } navDay = E.noteDateKey(doc); navMonth = navDay.slice(0, 7); timelineCount = 40; title.value = doc.title; manuscript.value = doc.text; dirty = false; manuscript.scrollTop = 0; E.transfer.selectRange(manuscript, 0, 0); growManuscript();
    invalidate(); text(analysisStatus, 'Nenhuma análise iniciada.');
    byId('reset-dismissed').hidden = !doc.dismissed.length;
    message(doc.revision ? 'Guardado neste aparelho.' : 'A folha é sua.'); updatePath();
    renderTimeline(true, null, true); refreshCounts();
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
  E.ptbrPanelKeep=function(f,source,key){
    if(source!==manuscript.value||key!==(doc.noteId||doc.id)){return false;}
    var choice=findingKey(f),added=doc.dismissed.indexOf(choice)<0,wasDirty=dirty;if(added){doc.dismissed.push(choice);dirty=true;}
    var saved=persist();if(!saved&&added){doc.dismissed.splice(doc.dismissed.indexOf(choice),1);dirty=wasDirty;}byId("reset-dismissed").hidden=!doc.dismissed.length;return saved;
  };
  E.ptbrPanelChoices=function(){ return (doc.dismissed||[]).slice(); };
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
    current.title = title.value; current.text = manuscript.value;
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
        var entry = E.freshDocument(); entry.title = name.replace(/\.txt$/i, ''); entry.text = String(contents); entry.project = activeNotebook() ? activeNotebook().name + ' — importado' : 'Texto importado'; docs = [entry];
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
    byId('som').checked = false;
    text(byId('sound-status'), 'Som desligado.');
    if (audio) { try { if (audio.close) { audio.close(); } else if (audio.suspend) { audio.suspend(); } } catch (ignore) { /* Áudio opcional. */ } audio = null; }
  }
  function playKey(event) {
    if (!audio || !byId('som').checked || event.ctrlKey || event.metaKey || event.altKey || composing || event.isComposing || event.repeat) { return; }
    var key = event.key || '', code = event.keyCode;
    if (!(key.length === 1 || code === 8 || code === 13 || (!key && code >= 32 && code <= 222))) { return; }
    try {
      var oscillator = audio.createOscillator(), gain = audio.createGain(), now = audio.currentTime;
      oscillator.type = 'triangle'; oscillator.frequency.value = code === 13 ? 420 : code === 8 ? 160 : 850;
      gain.gain.setValueAtTime(0.018, now); gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(now); oscillator.stop(now + 0.04);
      oscillator.onended = function () { oscillator.disconnect(); gain.disconnect(); };
    } catch (e) { stopSound(); text(byId('sound-status'), 'O som não está disponível neste navegador.'); }
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
    if (notebookReady && !activeNotebookId) { if (doc.projectId && notebooks && availableBook(notebooks.get(doc.projectId))) { if (!openNotebook(doc.projectId)) { return false; } } else { showNotebookForm(); return false; } }
    toggleStart(false);
    closePanels(false); collapseTimeline(); desktopDrag = null; cabinetOpen = false; byId('gabinete').hidden = true; byId('writing-space').hidden = false;
    document.body.setAttribute('data-view', 'mesa'); updatePath(); refreshCounts();
    sizeWorkspace(); cancelTypewriter();
    if (focusEditor !== false) { manuscript.focus(); }
    if (cabinetSelection && cabinetSelection.noteId === (doc.noteId || doc.id)) {
      E.transfer.selectRange(manuscript, cabinetSelection.start, cabinetSelection.end); manuscript.scrollTop = cabinetSelection.scroll;
    }
    growManuscript();
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
    text(byId('desk-font'), style === 'maquina' ? 'Courier Prime' : 'Noto Serif');
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
  listen(byId('machine-toggle'), 'click', function () { setMachine(!machineEnabled); });
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
  listen(byId('examinar-toggle'), 'click', function () { var open = byId('oficina').hidden; showPanel('oficina', 'examinar-toggle', open); if (open) { if(E.ptbrPanelFocus){E.ptbrPanelFocus();}else{lensButtons[0].focus();} } });
  listen(byId('back-writing'), 'click', returnToWriting);
  function newDocument() { if (!activeNotebook()) { showNotebookForm(); return; } if (!persist()) { return; } var next = E.freshDocument(); next.projectId = activeNotebookId; next.project = activeNotebook().name; loadDocument(next); dirty = true; if (!persist()) { enterDesk(true); return; } renderTimeline(false, null, true); cabinetSelection = null; enterDesk(false); byId('path-document').focus(); }
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
  listen(byId('reset-dismissed'), 'click', function () { doc.dismissed = []; dirty = true; persist(); byId('reset-dismissed').hidden = true; invalidate(); text(analysisStatus, 'Escolhas liberadas. Escolha uma lente para examinar de novo.'); if(E.ptbrPanelFocus){E.ptbrPanelFocus();}else{lensButtons[0].focus();} });
  function applyTheme(value) {
    var theme = value === 'escuro' ? 'escuro' : 'claro';
    document.body.setAttribute('data-theme', theme); byId('tema').value = theme;
    byId('theme-light').setAttribute('aria-pressed', theme === 'claro' ? 'true' : 'false');
    byId('theme-dark').setAttribute('aria-pressed', theme === 'escuro' ? 'true' : 'false');
  }
  function chooseTheme(value) { applyTheme(value); try { if (storage) { storage.setItem('escrevaral.astra.theme', byId('tema').value); } } catch (ignore) { /* Tema não bloqueia a escrita. */ } }
  listen(byId('theme-light'), 'click', function () { chooseTheme('claro'); });
  listen(byId('theme-dark'), 'click', function () { chooseTheme('escuro'); });
  listen(byId('tema'), 'change', function () { chooseTheme(this.value); });
  listen(byId('som'), 'change', function () {
    if (!this.checked) { stopSound(); return; }
    try { var Audio = window.AudioContext || window.webkitAudioContext; audio = new Audio(); if (audio.resume) { audio.resume(); } text(byId('sound-status'), 'Som ligado, em volume discreto.'); } catch (e) { stopSound(); text(byId('sound-status'), 'O som não está disponível neste navegador.'); }
  });
  listen(manuscript, 'keydown', playKey);
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
    else if ((event.ctrlKey || event.metaKey) && code === 13) { event.preventDefault(); if (cabinetOpen) { enterDesk(); } showPanel('oficina', 'examinar-toggle', true); panelTrigger = manuscript; if(E.ptbrPanelFocus){E.ptbrPanelFocus();}else{lensButtons[0].focus();} }
    else if ((event.ctrlKey || event.metaKey) && code === 83) { event.preventDefault(); persist(); }
    else if (code === 27 && document.body.getAttribute('data-counts') === 'true') { byId('desk-counts-close').click(); }
    else if (code === 27) { if (activePanel) { closePanels(true); } else if (immersion) { leaveImmersion(); } else if (!cabinetOpen) { if (byId('timeline-toggle').getAttribute('aria-expanded') === 'true') { collapseTimeline(); } else { openCabinet(false); } } else if (!byId('project-form').hidden) { byId('project-cancel').click(); } }
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
  listen(byId('cabinet-examine'), 'click', function () { enterDesk(); showPanel('oficina', 'examinar-toggle', true); if(E.ptbrPanelFocus){E.ptbrPanelFocus();}else{lensButtons[0].focus();} });
  listen(byId('cabinet-poetry'), 'click', function () { enterDesk(); showPanel('oficina', 'examinar-toggle', true); for (var j = 0; j < lensButtons.length; j += 1) { if (lensButtons[j].getAttribute('data-lens') === 'rima') { lensButtons[j].focus(); break; } } });
  listen(byId('notebook-back'),'click',closeNotebook);
  listen(byId('cabinet-all'), 'click', function () { if (!checkpoint() || !rememberNotebook()) { return; } activeNotebookId = null; cabinetProject = null; cabinetLimit = 40; byId('cabinet-search').value = ''; showingAbout = false; renderCabinet(); });
  listen(byId('cabinet-more'), 'click', function () { cabinetLimit += 40; renderCabinet(); });
  listen(byId('cabinet-search'), 'input', function () { showingAbout = false; window.clearTimeout(cabinetTimer); cabinetTimer = window.setTimeout(function () { cabinetLimit = 40; desktopWindow('open', false); renderCabinet(); }, 180); });
  listen(byId('cabinet-clear'), 'click', function () { window.clearTimeout(cabinetTimer); byId('cabinet-search').value = ''; showingAbout = false; renderCabinet(); byId('cabinet-search').focus(); });
  listen(byId('paste-mode'), 'click', function () { restrictedPaste = !restrictedPaste; this.setAttribute('aria-pressed', restrictedPaste ? 'true' : 'false'); try { if (storage) { storage.setItem('escrevaral.astra.restricted-paste', restrictedPaste ? 'on' : 'off'); } } catch (ignore) {} });
  listen(manuscript, 'paste', function (event) {
    if (!restrictedPaste) { return; }
    event.preventDefault(); message('Colagem externa restrita. Use Colar cópia interna ou Trazer arquivo em Ajustes.');
  });
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
    analysisRange = copiedSelection; showPanel('oficina', 'examinar-toggle', true); if(E.ptbrPanelFocus){E.ptbrPanelFocus();}else{lensButtons[0].focus();}
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
    manuscript.style.fontSize = readingSize + 'px'; text(byId('type-size'), readingSize);
    byId('type-smaller').disabled = readingSize <= 16; byId('type-larger').disabled = readingSize >= 30;
    focusMeasure = null; typewriterInsets(); growManuscript();
    try { if (storage) { storage.setItem('escrevaral.astra.font-size', String(readingSize)); } } catch (ignore) {}
  }
  function inspectWith(lens) {
    analysisRange = null; showPanel('oficina', 'examinar-toggle', true); if (lens) { examine(lens); }
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

  ['window-close','window-minimize','window-maximize','desk-minimize','mesa-close','acervo-close','utility-close','desk-counts-close'].forEach(function(id){byId(id).classList.add('material-key');});
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
  function valid(s, f) { return f && typeof f.start === 'number' && typeof f.end === 'number' && f.start >= 0 && f.end > f.start && f.end <= s.length && s.slice(f.start, f.end) === f.snippet; }
  function label(f) {
    var c = f.candidates && f.candidates.classes || [];
    if (f.analysisStatus === 'contextual') { return f.feature; }
    if (f.analysisStatus === 'desconhecido') { return 'sem leitura'; }
    if (f.analysisStatus === 'ambiguo') { return 'ambígua'; }
    if (f.analysisStatus === 'lexical') { return (c[0] || 'classe') + ' · léxico'; }
    return f.feature || 'observação';
  }
  function syntaxMap(parent, options) {
    var snapshot=options.snapshot, arr=options.findings.filter(function(f){return valid(snapshot,f)&&valid(snapshot,f.clause);});
    var uid='ptbr-reading-'+(++serial), dead=false, timer=null, active=null, buttons={}, groups={}, order=[];
    var box=el('div',parent,'ptbr-reading'), main=el('div',box,'ptbr-reading-paper');
    el('p',main,'ptbr-overline','RELAÇÕES DA ORAÇÃO');
    el('p',main,'ptbr-reading-help','Escolha um grupo ou núcleo. Os arcos mostram os vínculos desta hipótese; a frase original aparece abaixo.');
    var canvas=el('div',main,'ptbr-reading-canvas'), aside=el('aside',box,'ptbr-reading-aside');
    aside.id=uid;aside.setAttribute('aria-label','Explicação da relação selecionada');
    el('p',aside,'ptbr-overline','POR DENTRO DO TEXTO');
    var selected=el('p',aside,'ptbr-reading-selection'), links=el('p',aside,'ptbr-syntax-links'),details=el('div',aside,'ptbr-reading-details');
    selected.setAttribute('aria-live','polite');
    arr.forEach(function(f){var key='$'+f.clause.start;if(!groups[key]){groups[key]={items:[],clause:f.clause};order.push(key);}groups[key].items.push(f);});
    function button(f, target, cls) {
      var b=el('button',target,cls);b.type='button';b.setAttribute('aria-pressed','false');b.setAttribute('aria-controls',uid);
      b.setAttribute('data-syntax-node',f.nodeId);b.setAttribute('aria-label',f.feature+': '+f.snippet+'. Ver explicação.');
      el('span',b,'ptbr-word-tag',f.feature);el('span',b,'ptbr-word-text',f.snippet);
      if(f.components&&f.components.length){f.components.forEach(function(c){if(valid(snapshot,c)){el('span',b,'ptbr-syntax-head',c.role+': '+c.snippet);}});}
      else if(f.head&&f.head.snippet!==f.snippet){el('span',b,'ptbr-syntax-head','Núcleo: '+f.head.snippet);}
      b.addEventListener('click',function(){select(f);},false);buttons['$'+f.nodeId]={button:b,finding:f};
    }
    order.forEach(function(key,index){
      var g=groups[key],s=el('section',canvas,'ptbr-reading-fragment');
      el('p',s,'ptbr-fragment-number','CONSTRUÇÃO '+('0'+(index+1)).slice(-2));
      var scroll=el('div',s,'ptbr-word-scroll');scroll.setAttribute('tabindex','0');scroll.setAttribute('aria-label','Grupos da oração; role para ver todas as relações');
      g.row=el('div',scroll,'ptbr-syntax-row');
      if(D.createElementNS){g.svg=D.createElementNS('http://www.w3.org/2000/svg','svg');g.svg.setAttribute('class','ptbr-relation-arcs');g.svg.setAttribute('aria-hidden','true');g.row.appendChild(g.svg);}
      var left=el('div',g.row,'ptbr-syntax-subject'),right=el('div',g.row,'ptbr-syntax-predicate'),inside=el('div',null,'ptbr-syntax-parts');
      g.items.forEach(function(f){if(f.feature==='Sujeito'){button(f,left,'ptbr-syntax-term');}else if(f.feature==='Predicado'){button(f,right,'ptbr-syntax-whole');}});
      right.appendChild(inside);
      g.items.forEach(function(f){if(f.feature!=='Sujeito'&&f.feature!=='Predicado'){button(f,inside,'ptbr-syntax-term');}});
      el('p',s,'ptbr-fragment-original',g.clause.snippet);
    });
    if(!arr.length){el('p',main,'ptbr-reading-empty','Nenhuma construção recebeu uma leitura neste recorte. Isso indica o limite desta lente, não um erro no texto.');}
    function draw(){
      if(dead||!active||options.isCurrent&&!options.isCurrent()){return;}
      order.forEach(function(key){if(groups[key].svg){groups[key].svg.textContent='';}});
      var g=groups['$'+active.clause.start];if(!g||!g.svg||!g.row.getBoundingClientRect){return;}
      var row=g.row.getBoundingClientRect();if(!row.width){return;}
      g.svg.setAttribute('width',row.width);g.svg.setAttribute('height',66);g.svg.setAttribute('viewBox','0 0 '+row.width+' 66');
      var lane=0;
      (active.relations||[]).forEach(function(edge){
        if(edge.from!==active.nodeId&&edge.to!==active.nodeId){return;}
        var a=buttons['$'+edge.from],b=buttons['$'+edge.to];if(!a||!b||lane>=4){return;}
        var ar=a.button.getBoundingClientRect(),br=b.button.getBoundingClientRect(),x=ar.left-row.left+ar.width/2,x2=br.left-row.left+br.width/2;
        var p=D.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d','M '+x+' 60 Q '+((x+x2)/2)+' '+(4+lane*10)+' '+x2+' 60');
        p.setAttribute('fill','none');p.setAttribute('stroke','currentColor');p.setAttribute('stroke-width','1.5');p.setAttribute('stroke-dasharray','3 3');g.svg.appendChild(p);lane++;
      });
    }
    function select(f){
      if(dead||options.isCurrent&&!options.isCurrent()){return;}
      active=f;Object.keys(buttons).forEach(function(k){buttons[k].button.setAttribute('aria-pressed',buttons[k].finding===f?'true':'false');});
      selected.textContent=f.feature+' · “'+f.snippet+'”';
      var descriptions=[];(f.relations||[]).forEach(function(edge){
        var a=buttons['$'+edge.from],b=buttons['$'+edge.to];
        if(a&&b&&(edge.from===f.nodeId||edge.to===f.nodeId)){descriptions.push(edge.label+': “'+a.finding.snippet+'” ↔ “'+b.finding.snippet+'”');}
      });
      links.textContent=descriptions.join('. ');options.onSelect(f,details,true);resize();
    }
    function resize(){if(!dead){root.clearTimeout(timer);timer=root.setTimeout(draw,0);}}
    if(root.addEventListener){root.addEventListener('resize',resize,false);}
    if(D.fonts&&D.fonts.ready){D.fonts.ready.then(resize);}
    if(arr.length){select(arr[0]);}
    return{select:function(i){if(arr[i]){select(arr[i]);}},destroy:function(){dead=true;root.clearTimeout(timer);if(root.removeEventListener){root.removeEventListener('resize',resize,false);}}};
  }
  E.renderReadingMap = function (parent, options) {
    if(options.lens==='sintaxe'){return syntaxMap(parent,options);}
    var snapshot = options.snapshot, arr = options.findings.filter(function (f) { return valid(snapshot, f); }).slice(0, 100);
    var morph = options.lens === 'morfologia', active = -1, dead = false, timer = null;
    var uid = 'ptbr-reading-' + (++serial), buttons = [], rows = [], rowFor = [], diagrams = [];
    var box = el('div', parent, 'ptbr-reading'), main = el('div', box, 'ptbr-reading-paper');
    el('p', main, 'ptbr-overline', 'LEITURA ANOTADA');
    el('p', main, 'ptbr-reading-help', morph ? 'Toque em uma palavra para entender sua leitura. Os arcos mostram os apoios da hipótese selecionada.' : 'Escolha um trecho para ver a observação e seus limites.');
    var canvas = el('div', main, 'ptbr-reading-canvas');
    var aside = el('aside', box, 'ptbr-reading-aside'); aside.id = uid; aside.setAttribute('aria-label', 'Explicação da leitura selecionada');
    el('p', aside, 'ptbr-overline', 'POR DENTRO DO TEXTO');
    var selected = el('p', aside, 'ptbr-reading-selection'); selected.setAttribute('aria-live', 'polite');
    var details = el('div', aside, 'ptbr-reading-details');
    if (!arr.length) { el('p', main, 'ptbr-reading-empty', 'Nenhuma observação nova neste recorte. Isso não certifica ausência de problemas.'); }
    var row, sentence, previous = null, n = 0;
    arr.forEach(function (f, index) {
      var gap = previous ? snapshot.slice(previous.end, f.start) : '';
      if (!morph || !row || /[.!?;\r\n]/.test(gap) || n >= 12 || gap.length > 80) {
        var section = el('section', canvas, 'ptbr-reading-fragment');
        el('p', section, 'ptbr-fragment-number', 'TRECHO ' + ('0' + (rows.length + 1)).slice(-2));
        var scroll = el('div', section, 'ptbr-word-scroll'); scroll.setAttribute('tabindex', '0'); scroll.setAttribute('aria-label', 'Trecho anotado; role para ver todas as palavras');
        row = el('div', scroll, morph ? 'ptbr-word-row' : 'ptbr-excerpt-row'); rows.push(row); n = 0;
        if (morph && D.createElementNS) {
          var svg = D.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'ptbr-relation-arcs'); svg.setAttribute('aria-hidden', 'true'); row.appendChild(svg); diagrams.push(svg);
        } else { diagrams.push(null); }
        sentence = el('p', section, 'ptbr-fragment-original');
        sentence.textContent = f.snippet;
      } else { sentence.textContent += gap + f.snippet; }
      var b = el('button', row, morph ? 'ptbr-word' : 'ptbr-excerpt'); b.type = 'button';
      b.setAttribute('data-reading-index', index); b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-controls', uid);
      b.setAttribute('aria-label', f.snippet + ': ' + label(f) + '. Ver explicação.');
      b.setAttribute('data-reading-state', f.analysisStatus || 'observacao');
      var cls = f.analysisStatus === 'contextual' ? f.feature : (f.candidates && f.candidates.classes.length === 1 ? f.candidates.classes[0] : 'incerta');
      b.setAttribute('data-word-class', cls || 'incerta');
      el('span', b, 'ptbr-word-text', f.snippet);
      el('span', b, 'ptbr-word-tag', label(f));
      b.addEventListener('click', function () { select(index, true); }, false);
      buttons.push(b); rowFor.push(rows.length - 1); previous = f; n++;
    });
    function draw() {
      if (dead || active < 0) { return; }
      diagrams.forEach(function (svg) { if (svg) { svg.textContent = ''; } });
      var f = arr[active], ri = rowFor[active], svg = diagrams[ri], b = buttons[active], row = rows[ri];
      if (!svg || !b.getBoundingClientRect || f.analysisStatus !== 'contextual') { return; }
      var rb = row.getBoundingClientRect(), bb = b.getBoundingClientRect(), x = bb.left - rb.left + bb.width / 2;
      if (!rb.width) { return; }
      svg.setAttribute('width', rb.width); svg.setAttribute('height', 66); svg.setAttribute('viewBox', '0 0 ' + rb.width + ' 66');
      var lane = 0;
      (f.context || []).forEach(function (support) {
        if (!valid(snapshot, support) || lane >= 3) { return; }
        for (var j = 0; j < arr.length; j++) {
          if (j === active || rowFor[j] !== ri || arr[j].start !== support.start || arr[j].end !== support.end) { continue; }
          var r = buttons[j].getBoundingClientRect(), y = 60, x2 = r.left - rb.left + r.width / 2;
          var p = D.createElementNS('http://www.w3.org/2000/svg', 'path');
          p.setAttribute('d', 'M ' + x + ' ' + y + ' Q ' + ((x + x2) / 2) + ' ' + (4 + lane * 12) + ' ' + x2 + ' ' + y);
          p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor'); p.setAttribute('stroke-width', '1.5'); p.setAttribute('stroke-dasharray', '3 3'); svg.appendChild(p);
          buttons[j].setAttribute('data-reading-support', 'true'); lane++; break;
        }
      });
    }
    function select(index, user) {
      if (dead || !arr[index] || options.isCurrent && !options.isCurrent()) { return; }
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
    if (arr.length) { select(first, false); }
    return { select: select, destroy: function () { dead = true; root.clearTimeout(timer); if (root.removeEventListener) { root.removeEventListener('resize', resize, false); } } };
  };
}(typeof window !== 'undefined' ? window : this));

;
/* Fonte: ptbr/painel.js */
/* Painel de análise da main. ES5, sem rede, sem alterar manuscritos nem o cofre.
 * O editor existente permanece a origem da escrita e das escolhas persistidas.
 * Uma lente por escolha explícita; sem triagem enquanto o escritor digita.
 */
(function (root) {
  'use strict';
  var D = root.document, E = root.Escr;
  if (!E || !E.createVault || !E.reading || !E.knowledge || !E.createSignalTriage) { return; }
  var panel = D.getElementById('oficina'), manuscript = D.getElementById('manuscrito');
  if (!panel || !manuscript || D.getElementById('ptbr-dashboard')) { return; }
  var own = Object.prototype.hasOwnProperty, epoch = 0, debounce = null, draft = null, busy = false, composing = false;
  var fullScope = 200000, maxFindings = 100, lastLens = null, readingView = null;
  var labels = {
    ortografia:'Ortografia', acentuacao:'Acentuação', pontuacao:'Pontuação',
    crase:'Crase', concordancia:'Concordância', morfologia:'Classes de palavras',
    expressoes:'Expressões', repeticao:'Repetição próxima', adverbios:'Formas em -mente',
    dialogo:'Linhas de diálogo', ritmo:'Ritmo', rima:'Rimas', metrica:'Métrica',
    sintaxe:'Relações da oração', relativas:'Orações relativas · recorte inicial', decolonial:'Vocabulário decolonial'
  };
  function el(tag, parent, cls, value) {
    var n = D.createElement(tag);
    if (cls) { n.className = cls; }
    if (typeof value === 'string') { n.textContent = value; }
    if (parent) { parent.appendChild(n); }
    return n;
  }
  function stat(parent, value, label, major) {
    var item=el('div',parent,major?'ptbr-stat ptbr-stat-major':'ptbr-stat');
    el('strong',item,'',String(value));el('span',item,'',label);return item;
  }
  function documentKey(){return E.ptbrPanelDocument?E.ptbrPanelDocument():null;}
  var style=el('style',D.head,null,
    '#ptbr-dashboard{font-family:inherit;color:inherit;margin:12px 0 22px;min-width:0}' +
    '#oficina[data-ptbr-dashboard="true"]:not([data-ptbr-legacy="true"])>.lens-group-label,' +
    '#oficina[data-ptbr-dashboard="true"]:not([data-ptbr-legacy="true"])>.lenses,' +
    '#oficina[data-ptbr-dashboard="true"]:not([data-ptbr-legacy="true"])>#findings,' +
    '#oficina[data-ptbr-dashboard="true"]:not([data-ptbr-legacy="true"])>#analysis-status,' +
    '#oficina[data-ptbr-dashboard="true"]:not([data-ptbr-legacy="true"])>#analysis-coverage,' +
    '#oficina[data-ptbr-dashboard="true"]:not([data-ptbr-legacy="true"])>#ptbr-dashboard+p.quiet{display:none!important}' +
    '#oficina[data-ptbr-dashboard="true"]>#reset-dismissed{display:block;margin:12px 0}' +
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
    '.ptbr-status{font-size:12px;line-height:1.5;opacity:.8;min-height:20px}' +
    '.ptbr-outcome{padding:10px 0;border-top:1px dotted currentColor}' +
    '.ptbr-outcome h3{font:inherit;font-weight:700;margin:0 0 5px}' +
    '.ptbr-outcome p{margin:5px 0;font-size:12px;line-height:1.5}' +
    '.ptbr-outcome blockquote{margin:8px 0;padding:4px 8px;border-left:2px solid currentColor;font-size:12px;word-wrap:break-word;overflow-wrap:break-word}' +
    '.ptbr-outcome button{font:inherit;font-size:12px;padding:6px;margin:5px 5px 2px 0}' +
    '@media(max-width:760px){#ptbr-dashboard{padding-bottom:env(safe-area-inset-bottom,0px)}.ptbr-stat-major strong{font-size:36px}}'
  );
  var view=el('div',null,'');view.id='ptbr-dashboard';
  var heading=panel.querySelector('.sheet-heading');panel.insertBefore(view,heading?heading.nextSibling:panel.firstChild);
  el('p',view,'ptbr-overline','ESCREVARAL · UMA LENTE POR VEZ');
  var stats=el('div',view,'ptbr-count'), wordStat=stat(stats,'—','palavras no recorte analisado',true),
    charStat=stat(stats,'0','unidades de texto',false);
  el('hr',view,'ptbr-rule');
  el('p',view,'ptbr-overline','O QUE PODE SER EXAMINADO');
  var wheel=el('div',view,'ptbr-wheel'), intro=el('p',view,'ptbr-status','Escolha o que deseja examinar.');
  var action=el('button',view,'ptbr-action','Reexaminar lente escolhida');action.type='button';
  var cancel=el('button',view,'ptbr-cancel','Cancelar análise');cancel.type='button';cancel.hidden=true;
  var legacy=el('button',view,'ptbr-action ptbr-secondary','Consultar lentes individualmente');
  legacy.type='button';legacy.setAttribute('aria-expanded','false');
  legacy.addEventListener('click',function(){
    E.ptbrPanelReset();if(E.ptbrLegacyCancel){E.ptbrLegacyCancel();}
    var expanded=panel.getAttribute('data-ptbr-legacy')!=='true';
    panel.setAttribute('data-ptbr-legacy',expanded?'true':'false');
    legacy.setAttribute('aria-expanded',expanded?'true':'false');
    legacy.textContent=expanded?'Recolher lentes individuais':'Consultar lentes individualmente';
    if(!expanded){legacy.focus();}
  },false);
  var status=el('p',view,'ptbr-status','A análise começa somente quando você pedir.');status.setAttribute('role','status');
  el('hr',view,'ptbr-rule');
  el('p',view,'ptbr-overline','OBSERVAÇÕES');
  var results=el('div',view,'ptbr-results');
  var empty=el('div',results,'ptbr-empty','Seu texto, por dentro. Escolha uma lente para abrir a leitura anotada.');
  var note=el('p',view,'ptbr-status','O silêncio de uma lente não certifica o texto. A escrita permanece sua.');
  function clearResults(){if(readingView){readingView.destroy();readingView=null;}results.textContent='';}
  function refresh(force) {
    if(composing||busy||panel.hidden&&!force){return;}
    if(!force&&draft&&draft.text===manuscript.value&&draft.document===documentKey()){return;}
    epoch++;root.clearTimeout(debounce);busy=false;clearResults();
    el('div',results,'ptbr-empty','Seu texto, por dentro. Escolha uma lente para abrir a leitura anotada.');
    var s=manuscript.value;draft={text:s,document:documentKey()};
    wordStat.firstChild.textContent='—';
    charStat.firstChild.textContent=s.length.toLocaleString('pt-BR');
    wheel.textContent='';var chosen=[],id,btn,k;
    for(k in labels){if(own.call(labels,k)){chosen.push(k);}}
    for(var i=0;i<chosen.length;i++){id=chosen[i];
      btn=el('button',wheel,'',null);btn.type='button';el('span',btn,'',labels[id]);btn.setAttribute('data-ptbr-lens',id);
      btn.setAttribute('aria-label','Examinar '+labels[id]);
      btn.addEventListener('click',function(){run(this.getAttribute('data-ptbr-lens'));},false);}
    action.disabled=!lastLens||!s.length||s.length>fullScope;
    intro.textContent=s.length>fullScope?'O exame aceita até 200 mil caracteres por vez. Selecione um trecho e consulte as lentes individualmente.':
      'Escolha uma lente. Abrir este painel e digitar não executa análises. Classes em contexto examina até 8.000 unidades de texto e informa o recorte.';
    status.textContent='A análise começa somente quando você pedir.';
    note.textContent='Leituras possíveis não são correções. O autor decide.';
  }
  function resultCard(lens, result, snapshot) {
    var card=el('section',results,'ptbr-outcome'), h=el('h3',card,'',labels[lens]||lens);
    var documentAtResult=documentKey();
    var arr=result.findings||[],i,f,entry,b,detail,ignored=E.ptbrPanelChoices?E.ptbrPanelChoices():[],visible=0;
    for(i=0;i<arr.length;i++){if(ignored.indexOf(arr[i].id+'|'+arr[i].snippet)===-1){visible+=1;}}
    var accepted=[],observations=[],stash=el('div',card,'ptbr-observation-list');
    var countLabel=el('p',card,'',visible?visible+' '+(visible===1?'observação nova':'observações novas')+' neste recorte.':'Nenhuma observação nova neste recorte.');
    for(i=0;i<arr.length&&i<maxFindings;i++){
      f=arr[i];if(ignored.indexOf(f.id+'|'+f.snippet)!==-1){continue;}
      entry=el('div',stash,'ptbr-observation');accepted.push(f);observations.push(entry);
      el('p',entry,'',f.message+' · confiança '+f.confidence);
      el('blockquote',entry,'',f.snippet);
      detail=el('div',entry,'ptbr-evidence');detail.hidden=true;
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
      (function(start,end,textAtRun){b.addEventListener('click',function(){
        if(manuscript.value!==textAtRun||documentKey()!==documentAtResult){refresh(true);return;}
        var back=D.getElementById('back-writing');if(back){back.click();}
        manuscript.focus();
        if(!E.transfer.selectRange(manuscript,start,end)){
          var notice=D.getElementById('save-status')||status;notice.textContent='Selecione o trecho manualmente no manuscrito.';
        }
      },false);}(f.start,f.end,snapshot));
      if(E.ptbrPanelKeep){
        b=el('button',entry,'','Manter minha escolha');b.type='button';
        (function(finding,row,button){button.addEventListener('click',function(){
          if(manuscript.value!==snapshot||documentKey()!==documentAtResult){refresh(true);return;}
          if(E.ptbrPanelKeep(finding,snapshot,documentAtResult)){
            clearResults();resultCard(lens,result,snapshot);status.textContent='Escolha mantida nesta folha.';
            var reset=D.getElementById('reset-dismissed');if(reset){reset.focus();}
          }else{status.textContent='Não foi possível guardar a escolha. Tente novamente.';}
        },false);}(f,entry,b));
      }
    }
    if(E.renderReadingMap){
      stash.hidden=true;
      readingView=E.renderReadingMap(card,{lens:lens,snapshot:snapshot,findings:accepted,
        isCurrent:function(){return !panel.hidden&&manuscript.value===snapshot&&documentKey()===documentAtResult;},
        onSelect:function(finding,target,user){
          for(var at=0;at<observations.length;at++){stash.appendChild(observations[at]);}
          target.textContent='';var at=accepted.indexOf(finding);
          if(at>=0){target.appendChild(observations[at]);}
        }
      });
      el('p',card,'ptbr-legend',lens==='morfologia'?'Etiqueta contínua: hipótese contextual. Tracejada: possibilidade no léxico. Sem leitura: fora da cobertura. Arcos pontilhados: apoios, não uma árvore sintática completa.':lens==='sintaxe'?'Os grupos podem se conter: o predicado inclui verbo e complementos. Os arcos mostram vínculos da hipótese selecionada; as mesmas relações aparecem por escrito.':'Os trechos pertencem à lente escolhida. Selecione um para consultar a explicação.');
    }
    if(result.limited){el('p',card,'','O cofre limitou a apresentação aos primeiros 100 apontamentos.');}
    if(result.coverageInfo){
      el('p',card,'ptbr-scope',result.coverageInfo.summary);
      wordStat.firstChild.textContent=String(result.coverageInfo.work.tokens);
    }
    if(result.assessment&&!result.assessment.eligible){el('p',card,'',result.assessment.reason);}
    return h;
  }
  function run(selected) {
    if(composing||panel.hidden||!selected||!own.call(labels,selected)){return;}
    if(E.ptbrLegacyCancel){E.ptbrLegacyCancel();}
    epoch++;busy=false;lastLens=selected;refresh(true);if(!draft||!draft.text||draft.text.length>fullScope){return;}
    var snapshot=draft.text, documentAtRun=documentKey(), candidates=[],k,token=++epoch,vault;
    candidates.push(selected);
    if(!candidates.length){return;}
    try{vault=E.createVault(E.knowledge);}catch(e){status.textContent='O cofre não pôde iniciar: '+e.message;return;}
    busy=true;action.disabled=true;cancel.hidden=false;clearResults();var cursor=0;
    function step(){
      if(token!==epoch){return;}
      if(manuscript.value!==snapshot||panel.hidden||documentKey()!==documentAtRun){
        busy=false;action.disabled=composing;
        if(manuscript.value!==snapshot){refresh(true);}return;
      }
      if(cursor>=candidates.length){
        busy=false;cancel.hidden=true;action.disabled=false;status.textContent='Análise concluída. Uma lente examinada: '+labels[selected]+'.';return;
      }
      var lens=candidates[cursor++],buttons=wheel.querySelectorAll('button'),i;
      for(i=0;i<buttons.length;i++){buttons[i].setAttribute('aria-current',buttons[i].getAttribute('data-ptbr-lens')===lens?'true':'false');}
      status.textContent='Examinando '+(labels[lens]||lens)+' · '+cursor+' de '+candidates.length+'.';
      root.setTimeout(function(){
        if(token!==epoch){return;}
        if(manuscript.value!==snapshot||panel.hidden||documentKey()!==documentAtRun){busy=false;return;}
        try{resultCard(lens,vault.analyze(lens,snapshot),snapshot);}
        catch(e){var box=el('section',results,'ptbr-outcome');el('h3',box,'',labels[lens]||lens);el('p',box,'','Esta lente não concluiu o exame: '+e.message);}
        root.setTimeout(step,0);
      },0);
    }
    step();
  }
  action.addEventListener('click',function(){run(lastLens);},false);
  cancel.addEventListener('click',function(){E.ptbrPanelReset();status.textContent='Análise cancelada. Escolha uma lente para recomeçar.';},false);
  manuscript.addEventListener('input',function(){
    epoch++;busy=false;root.clearTimeout(debounce);action.disabled=true;clearResults();
    status.textContent='O texto mudou. Os resultados anteriores foram retirados.';
    cancel.hidden=true;draft=null;wordStat.firstChild.textContent='—';
  },false);
  manuscript.addEventListener('compositionstart',function(){composing=true;root.clearTimeout(debounce);epoch++;busy=false;draft=null;action.disabled=true;cancel.hidden=true;wordStat.firstChild.textContent='—';clearResults();},false);
  manuscript.addEventListener('compositionend',function(){composing=false;root.clearTimeout(debounce);},false);
  panel.addEventListener('focus',function(){if(!panel.hidden){refresh(true);}},false);
  var openers=['examinar-toggle','cabinet-examine'];
  for(var i=0;i<openers.length;i++){var b=D.getElementById(openers[i]);if(b){b.addEventListener('click',function(){root.setTimeout(function(){if(!panel.hidden){refresh(true);}},0);},false);}}
  D.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.keyCode===13){root.setTimeout(function(){if(!panel.hidden){refresh(true);}},0);}},false);
  E.ptbrPanelReset=function(){epoch++;busy=false;draft=null;root.clearTimeout(debounce);clearResults();action.disabled=true;cancel.hidden=true;};
  E.ptbrPanelFocus=function(){var first=wheel.querySelectorAll('button')[0];if(first){first.focus();}};
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
