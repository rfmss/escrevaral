/* Painel de análise da main. ES5, sem rede, sem alterar manuscritos nem o cofre.
 * O editor existente permanece a origem da escrita e das escolhas persistidas.
 * Integração visual progressiva: só a ação Análise executa lentes.
 */
(function (root) {
  'use strict';
  var D = root.document, E = root.Escr;
  if (!E || !E.createVault || !E.reading || !E.knowledge) { return; }
  var panel = D.getElementById('oficina'), manuscript = D.getElementById('manuscrito');
  if (!panel || !manuscript || D.getElementById('ptbr-dashboard')) { return; }
  var own = Object.prototype.hasOwnProperty, epoch = 0, debounce = null, draft = null, busy = false;
  var fullScope = 200000, idleScope = 40000, maxFindings = 100;
  var labels = {
    ortografia:'Ortografia', acentuacao:'Acentuação', pontuacao:'Pontuação',
    crase:'Crase', concordancia:'Concordância', morfologia:'Classes de palavras',
    expressoes:'Expressões', repeticao:'Repetição próxima', adverbios:'Formas em -mente',
    dialogo:'Linhas de diálogo', ritmo:'Ritmo', rima:'Rimas', metrica:'Métrica'
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
  function count(s) {
    var re=/[A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f]+(?:[-'’][A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f]+)*|[0-9]+/g,m,n=0;
    while ((m=re.exec(s))) { n+=1; }
    return n;
  }
  /* Índice de primeiros termos, construído uma vez. Nenhuma busca integral
   * para cada verbete durante a escrita, mesmo num aparelho antigo. */
  var expressionHeads={};
  var expressionList=E.styleData&&E.styleData.entries||[];
  for(var ei=0;ei<expressionList.length;ei+=1){
    var phrase=String(expressionList[ei].term||'').toLowerCase(),first=phrase.split(/\s+/)[0];
    if(first){var ek='$'+first;(expressionHeads[ek]||(expressionHeads[ek]=[])).push(phrase);}
  }
  function indexed(s,limit) {
    var check=s.slice(0,limit), clean=E.protectedText?E.protectedText(check):check;
    var ts=E.reading.tokens(clean), keys={}, signals={}, i,t,w,parts,rule,key,prior,alts,term,jj,end;
    var rules=E.knowledge.rules||[], styles=E.studioData||{}, maturity=E.maturationData||{};
    var format=E.reading.canonical||function(x){return x.toLowerCase();};
    for(i=0;i<rules.length;i+=1){rule=rules[i];if(!rule.forms){continue;}for(key in rule.forms){if(own.call(rule.forms,key)){keys['$'+format(key)]=rule.lens;}}}
    var adv={},j,word,phrase,seen={};
    for(i=0;i<(styles.adverbs||[]).length;i+=1){adv['$'+format(styles.adverbs[i])]=true;}
    for(i=0;i<ts.length;i+=1){
      t=ts[i];w=t.value;key='$'+w;
      if(own.call(keys,key)){signals[keys[key]]=true;}
      if(!signals.adverbios&&own.call(adv,key)){signals.adverbios=true;}
      if(w==='que'){signals['que-contextual']=true;}
      if(!signals.expressoes&&(alts=expressionHeads[key])){
        for(jj=0;jj<alts.length;jj++){
          term=alts[jj];end=t.start+term.length;
          if(clean.slice(t.start,end).toLowerCase()===term&&
             !/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(clean.charAt(end))){signals.expressoes=true;break;}
        }
      }
      if(!signals.morfologia&&E.grammar&&E.grammar.readings&&E.grammar.readings(w).classes.length){signals.morfologia=true;}
      if(!signals.crase&&(w==='à'||w==='às')&&i+1<ts.length&&
         ((maturity.crasePronouns||[]).indexOf(ts[i+1].value)!==-1||(maturity.craseInfinitives||[]).indexOf(ts[i+1].value)!==-1)){signals.crase=true;}
      if(!signals.concordancia&&i+1<ts.length&&
         (own.call(maturity.haver||{},w)||own.call(maturity.existir||{},w)||own.call(maturity.fazer||{},w))){signals.concordancia=true;}
    }
    if(/,{2,}|;{2,}/.test(clean)){signals.pontuacao=true;}
    if(/(^|[\r\n])[ \t]*[—–-][ \t]+\S/m.test(clean)){signals.dialogo=true;}
    parts=clean.split(/\r\n|\n|\r/);
    for(i=0;i<parts.length&&!signals.repeticao;i+=1){
      var words=E.reading.tokens(parts[i]),stop=maturity.stopwords||[];
      seen={};
      for(j=0;j<words.length;j+=1){word=words[j].value;
        if(word.length<4||stop.indexOf(word)!==-1){continue;}
        prior=seen['$'+word]||(seen['$'+word]=[]);
        prior.push(j);if(prior.length>=3&&j-prior[prior.length-3]<=40){signals.repeticao=true;break;}
        if(prior.length>3){prior.shift();}
      }
    }
    if(E.reading.sentences){var slices=E.reading.sentences(clean),closed=0;
      for(i=0;i<slices.length;i+=1){if(slices[i].closed){closed++;}if(closed>=3){signals.ritmo=true;break;}}
    }
    var lines=[],last=[],bits;
    for(i=0;i<parts.length;i+=1){if(!parts[i].replace(/\s/g,'')){continue;}
      if(parts[i].length<=90){lines.push(parts[i]);bits=E.reading.tokens(parts[i]);
        if(bits.length){last.push(bits[bits.length-1].value);}}
    }
    if(lines.length>=2&&parts.length>=2){signals.metrica=true;
      for(i=0;i<last.length&&!signals.rima;i+=1){for(j=i+1;j<last.length;j+=1){
        var a=last[i],b=last[j];if(a.length>=3&&b.length>=3&&a!==b&&a.slice(-2)===b.slice(-2)){signals.rima=true;break;}
      }}
    }
    return { text:s, read:check.length, signals:signals, words:count(s), chars:s.length };
  }
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
    '.ptbr-count{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:end}' +
    '.ptbr-stat{display:flex;flex-direction:column;min-width:0;padding:5px 0}' +
    '.ptbr-stat strong{font-size:19px;line-height:1.15;font-weight:700;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}' +
    '.ptbr-stat span{font-size:11px;line-height:1.5;opacity:.75}' +
    '.ptbr-stat-major{grid-column:1/-1}.ptbr-stat-major strong{font-size:clamp(36px,10vw,56px);letter-spacing:-.055em;line-height:1;font-weight:750}' +
    '.ptbr-wheel{display:flex;flex-wrap:wrap;gap:6px;margin:9px 0}' +
    '.ptbr-wheel button{max-width:100%;padding:7px 10px;border:1px solid currentColor;border-radius:2px;background:transparent;color:inherit;text-align:left;font:inherit;font-size:12px;opacity:.87}' +
    '.ptbr-wheel button[aria-current="true"]{background:currentColor;opacity:1}' +
    '.ptbr-wheel button[aria-current="true"] span{color:var(--paper,#eceee5)}' +
    '.ptbr-action{display:block;width:100%;margin:12px 0 8px;min-height:38px;padding:7px 12px;border:1px solid currentColor;background:transparent;color:inherit;font:inherit;font-weight:700;cursor:pointer}' +
    '.ptbr-action:disabled{opacity:.45;cursor:default}' +
    '.ptbr-status{font-size:12px;line-height:1.5;opacity:.8;min-height:20px}' +
    '.ptbr-outcome{padding:10px 0;border-top:1px dotted currentColor}' +
    '.ptbr-outcome h3{font:inherit;font-weight:700;margin:0 0 5px}' +
    '.ptbr-outcome p{margin:5px 0;font-size:12px;line-height:1.5}' +
    '.ptbr-outcome blockquote{margin:8px 0;padding:4px 8px;border-left:2px solid currentColor;font-size:12px;overflow-wrap:anywhere}' +
    '.ptbr-outcome button{font:inherit;font-size:12px;padding:6px;margin:5px 5px 2px 0}' +
    '@media(max-width:760px){#ptbr-dashboard{padding-bottom:env(safe-area-inset-bottom,0px)}.ptbr-stat-major strong{font-size:clamp(36px,11vw,52px)}}'
  );
  var view=el('div',null,'');view.id='ptbr-dashboard';
  var heading=panel.querySelector('.sheet-heading');panel.insertBefore(view,heading?heading.nextSibling:panel.firstChild);
  el('p',view,'ptbr-overline','CONTAGEM');
  var stats=el('div',view,'ptbr-count'), wordStat=stat(stats,'0','palavras',true),
    charStat=stat(stats,'0','unidades de texto',false);
  el('hr',view,'ptbr-rule');
  el('p',view,'ptbr-overline','O QUE PODE SER EXAMINADO');
  var wheel=el('div',view,'ptbr-wheel'), intro=el('p',view,'ptbr-status','Sinais da escrita, não diagnósticos.');
  var action=el('button',view,'ptbr-action','Análise');action.type='button';
  var legacy=el('button',view,'ptbr-action ptbr-secondary','Consultar lentes individualmente');
  legacy.type='button';legacy.setAttribute('aria-expanded','false');
  legacy.addEventListener('click',function(){
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
  var note=el('p',view,'ptbr-status','O silêncio de uma lente não certifica o texto. A escrita permanece sua.');
  function clearResults(){results.textContent='';}
  function refresh(force) {
    if(busy||panel.hidden&&!force){return;}
    if(!force&&draft&&draft.text===manuscript.value){return;}
    epoch++;root.clearTimeout(debounce);busy=false;clearResults();
    var s=manuscript.value;draft=indexed(s,force?fullScope:idleScope);
    wordStat.firstChild.textContent=draft.words.toLocaleString('pt-BR');
    charStat.firstChild.textContent=draft.chars.toLocaleString('pt-BR');
    wheel.textContent='';var chosen=[],id,btn,k;
    for(k in labels){if(own.call(labels,k)&&draft.signals[k]){chosen.push(k);}}
    for(var i=0;i<chosen.length;i++){id=chosen[i];
      btn=el('button',wheel,'',null);btn.type='button';el('span',btn,'',labels[id]);btn.setAttribute('data-ptbr-lens',id);
      btn.setAttribute('aria-label','Examinar sinal de '+labels[id]);
      btn.addEventListener('click',function(){run(this.getAttribute('data-ptbr-lens'));},false);}
    action.disabled=!chosen.length||s.length>fullScope;
    intro.textContent=s.length>fullScope?'Texto longo: exame limitado a 200 mil unidades. O manuscrito fica intacto.':
      draft.read<s.length?'Triagem parcial dos primeiros 40 mil caracteres. Abra o painel para ampliar.':
      chosen.length?'Sinais presentes no texto. A análise verificará cada um.':'Nenhum sinal disponível nesta triagem limitada.';
    status.textContent='A análise começa somente quando você pedir.';
    if(draft.signals['que-contextual']){intro.textContent+=' Ocorrência de “que”: função sintática ainda não confirmada.';}
    note.textContent='Leituras possíveis não são correções. O autor decide.';
  }
  function resultCard(lens, result, snapshot) {
    var card=el('section',results,'ptbr-outcome'), h=el('h3',card,'',labels[lens]||lens);
    var arr=result.findings||[],i,f,entry,b,detail,ignored=E.ptbrPanelChoices?E.ptbrPanelChoices():[],visible=0;
    for(i=0;i<arr.length;i++){if(ignored.indexOf(arr[i].id+'|'+arr[i].snippet)===-1){visible+=1;}}
    el('p',card,'',visible?visible+' observação'+(visible!==1?'ões':'')+' nova(s) neste recorte.':'Nenhuma observação nova neste recorte.');
    for(i=0;i<arr.length&&i<maxFindings;i++){
      f=arr[i];if(ignored.indexOf(f.id+'|'+f.snippet)!==-1){continue;}
      entry=el('div',card,'ptbr-observation');
      el('p',entry,'',f.message+' · confiança '+f.confidence);
      el('blockquote',entry,'',snapshot.slice(Math.max(0,f.start-35),Math.min(snapshot.length,f.end+35)));
      detail=el('div',entry,'ptbr-evidence');detail.hidden=true;
      if(f.evidence){
        el('p',detail,'','Observação: '+f.evidence.observation);
        el('p',detail,'','Interpretação: '+f.evidence.interpretation);
        el('p',detail,'','Ambiguidade: '+f.evidence.ambiguity);
        el('p',detail,'','Limite: '+f.evidence.limit);
      }
      b=el('button',entry,'','Ver evidência');b.type='button';
      b.setAttribute('aria-expanded','false');
      (function(target,button){button.addEventListener('click',function(){
        target.hidden=!target.hidden;button.textContent=target.hidden?'Ver evidência':'Fechar evidência';
        button.setAttribute('aria-expanded',target.hidden?'false':'true');
      },false);}(detail,b));
      b=el('button',entry,'','Ver no texto');b.type='button';
      (function(start,end,textAtRun){b.addEventListener('click',function(){
        if(manuscript.value!==textAtRun){refresh(true);return;}
        var back=D.getElementById('back-writing');if(back){back.click();}
        manuscript.focus();manuscript.setSelectionRange(start,end);
      },false);}(f.start,f.end,snapshot));
    }
    if(result.limited){el('p',card,'','O cofre limitou a apresentação aos primeiros 100 apontamentos.');}
    if(result.assessment&&!result.assessment.eligible){el('p',card,'',result.assessment.reason);}
    return h;
  }
  function run(selected) {
    if(busy){return;}refresh(true);if(!draft||!draft.text||action.disabled){return;}
    var snapshot=draft.text, candidates=[],k,token=++epoch,vault;
    for(k in labels){if(own.call(labels,k)&&draft.signals[k]&&(!selected||selected===k)){candidates.push(k);}}
    if(!candidates.length){return;}
    try{vault=E.createVault(E.knowledge);}catch(e){status.textContent='O cofre não pôde iniciar: '+e.message;return;}
    busy=true;action.disabled=true;clearResults();var cursor=0;
    function step(){
      if(token!==epoch||manuscript.value!==snapshot||panel.hidden){
        busy=false;action.disabled=false;
        if(manuscript.value!==snapshot){refresh(true);}return;
      }
      if(cursor>=candidates.length){
        busy=false;action.disabled=false;status.textContent='Análise concluída. '+candidates.length+' lente(s) examinada(s).';return;
      }
      var lens=candidates[cursor++],buttons=wheel.querySelectorAll('button'),i;
      for(i=0;i<buttons.length;i++){buttons[i].setAttribute('aria-current',buttons[i].getAttribute('data-ptbr-lens')===lens?'true':'false');}
      status.textContent='Examinando '+(labels[lens]||lens)+' · '+cursor+' de '+candidates.length+'.';
      root.setTimeout(function(){
        if(token!==epoch||manuscript.value!==snapshot||panel.hidden){busy=false;return;}
        try{resultCard(lens,vault.analyze(lens,snapshot),snapshot);}
        catch(e){var box=el('section',results,'ptbr-outcome');el('h3',box,'',labels[lens]||lens);el('p',box,'','Esta lente não concluiu o exame: '+e.message);}
        root.setTimeout(step,0);
      },0);
    }
    step();
  }
  action.addEventListener('click',function(){run(null);},false);
  manuscript.addEventListener('input',function(){
    epoch++;busy=false;root.clearTimeout(debounce);action.disabled=true;clearResults();
    status.textContent='O texto mudou. Os resultados anteriores foram retirados.';
    if(!panel.hidden){debounce=root.setTimeout(function(){refresh(true);},700);}
    else{debounce=root.setTimeout(function(){draft=indexed(manuscript.value,idleScope);},700);}
  },false);
  manuscript.addEventListener('compositionstart',function(){root.clearTimeout(debounce);epoch++;busy=false;},false);
  manuscript.addEventListener('compositionend',function(){root.clearTimeout(debounce);debounce=root.setTimeout(function(){if(!panel.hidden){refresh(true);}else{draft=indexed(manuscript.value,idleScope);}},700);},false);
  panel.addEventListener('focus',function(){if(!panel.hidden){refresh(true);}},false);
  var openers=['examinar-toggle','cabinet-examine'];
  for(var i=0;i<openers.length;i++){var b=D.getElementById(openers[i]);if(b){b.addEventListener('click',function(){root.setTimeout(function(){if(!panel.hidden){refresh(true);}},0);},false);}}
  D.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.keyCode===13){root.setTimeout(function(){if(!panel.hidden){refresh(true);}},0);}},false);
  /* Reutiliza o painel nativo, mantendo os botões originais se a inicialização falhar. */
  panel.setAttribute('data-ptbr-dashboard','true');
  refresh(true);
}(typeof window!=='undefined'?window:this));
