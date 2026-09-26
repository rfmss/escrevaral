/* Painel de análise da main. ES5, sem rede, sem alterar manuscritos nem o cofre.
 * O editor existente permanece a origem da escrita e das escolhas persistidas.
 * Integração visual progressiva: só a ação Análise executa lentes.
 */
(function (root) {
  'use strict';
  var D = root.document, E = root.Escr;
  if (!E || !E.createVault || !E.reading || !E.knowledge || !E.createSignalTriage) { return; }
  var panel = D.getElementById('oficina'), manuscript = D.getElementById('manuscrito');
  if (!panel || !manuscript || D.getElementById('ptbr-dashboard')) { return; }
  var own = Object.prototype.hasOwnProperty, epoch = 0, debounce = null, draft = null, busy = false, composing = false;
  var fullScope = 200000, maxFindings = 100;
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
  var triage=E.createSignalTriage(E);
  function documentKey(){return E.ptbrPanelDocument?E.ptbrPanelDocument():null;}
  function indexed(s){var result=triage.scan(s);result.document=documentKey();return result;}
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
    if(composing||busy||panel.hidden&&!force){return;}
    if(!force&&draft&&draft.text===manuscript.value&&draft.document===documentKey()){return;}
    epoch++;root.clearTimeout(debounce);busy=false;clearResults();
    var s=manuscript.value;draft=indexed(s);
    wordStat.firstChild.textContent=draft.words.toLocaleString('pt-BR');
    wordStat.childNodes[1].textContent=draft.partial?'palavras no recorte':'palavras';
    charStat.firstChild.textContent=draft.chars.toLocaleString('pt-BR');
    wheel.textContent='';var chosen=[],id,btn,k;
    for(k in labels){if(own.call(labels,k)&&draft.signals[k]){chosen.push(k);}}
    for(var i=0;i<chosen.length;i++){id=chosen[i];
      btn=el('button',wheel,'',null);btn.type='button';el('span',btn,'',labels[id]);btn.setAttribute('data-ptbr-lens',id);
      btn.setAttribute('aria-label','Examinar sinal de '+labels[id]);
      btn.addEventListener('click',function(){run(this.getAttribute('data-ptbr-lens'));},false);}
    action.disabled=!chosen.length||s.length>fullScope;
    intro.textContent=s.length>fullScope?'O exame aceita até 200 mil caracteres por vez. Selecione um trecho e consulte as lentes individualmente.':
      draft.read<s.length?'Triagem parcial: primeiros '+draft.read+' caracteres. As lentes individuais permitem examinar o restante.':
      chosen.length?'Sinais presentes no texto. A análise verificará cada um.':'Nenhum sinal neste recorte. Você pode consultar as lentes individualmente.';
    status.textContent='A análise começa somente quando você pedir.';
    if(draft.signals['que-contextual']){intro.textContent+=' Ocorrência de “que”: função sintática ainda não confirmada.';}
    note.textContent='Leituras possíveis não são correções. O autor decide.';
  }
  function resultCard(lens, result, snapshot) {
    var card=el('section',results,'ptbr-outcome'), h=el('h3',card,'',labels[lens]||lens);
    var documentAtResult=documentKey();
    var arr=result.findings||[],i,f,entry,b,detail,ignored=E.ptbrPanelChoices?E.ptbrPanelChoices():[],visible=0;
    for(i=0;i<arr.length;i++){if(ignored.indexOf(arr[i].id+'|'+arr[i].snippet)===-1){visible+=1;}}
    var countLabel=el('p',card,'',visible?visible+' '+(visible===1?'observação nova':'observações novas')+' neste recorte.':'Nenhuma observação nova neste recorte.');
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
        manuscript.focus();manuscript.setSelectionRange(start,end);
      },false);}(f.start,f.end,snapshot));
      if(E.ptbrPanelKeep){
        b=el('button',entry,'','Manter minha escolha');b.type='button';
        (function(finding,row,button){button.addEventListener('click',function(){
          if(manuscript.value!==snapshot||documentKey()!==documentAtResult){refresh(true);return;}
          if(E.ptbrPanelKeep(finding,snapshot,documentAtResult)){
            row.hidden=true;visible--;countLabel.textContent=visible?visible+' '+(visible===1?'observação nova':'observações novas')+' neste recorte.':'Nenhuma observação nova neste recorte.';status.textContent='Escolha mantida nesta folha.';
            var reset=D.getElementById('reset-dismissed');if(reset){reset.focus();}
          }else{status.textContent='Não foi possível guardar a escolha. Tente novamente.';}
        },false);}(f,entry,b));
      }
    }
    if(result.limited){el('p',card,'','O cofre limitou a apresentação aos primeiros 100 apontamentos.');}
    if(result.assessment&&!result.assessment.eligible){el('p',card,'',result.assessment.reason);}
    return h;
  }
  function run(selected) {
    if(busy||composing){return;}refresh(true);if(!draft||!draft.text||action.disabled){return;}
    var snapshot=draft.text, documentAtRun=documentKey(), candidates=[],k,token=++epoch,vault;
    for(k in labels){if(own.call(labels,k)&&draft.signals[k]&&(!selected||selected===k)){candidates.push(k);}}
    if(!candidates.length){return;}
    try{vault=E.createVault(E.knowledge);}catch(e){status.textContent='O cofre não pôde iniciar: '+e.message;return;}
    busy=true;action.disabled=true;clearResults();var cursor=0;
    function step(){
      if(token!==epoch){return;}
      if(manuscript.value!==snapshot||panel.hidden||documentKey()!==documentAtRun){
        busy=false;action.disabled=composing;
        if(manuscript.value!==snapshot){refresh(true);}return;
      }
      if(cursor>=candidates.length){
        busy=false;action.disabled=false;status.textContent='Análise concluída. '+candidates.length+' lente(s) examinada(s).';return;
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
  action.addEventListener('click',function(){run(null);},false);
  manuscript.addEventListener('input',function(){
    epoch++;busy=false;root.clearTimeout(debounce);action.disabled=true;clearResults();
    status.textContent='O texto mudou. Os resultados anteriores foram retirados.';
    if(composing){return;}
    if(!panel.hidden){debounce=root.setTimeout(function(){refresh(true);},700);}
    else{debounce=root.setTimeout(function(){draft=indexed(manuscript.value);},700);}
  },false);
  manuscript.addEventListener('compositionstart',function(){composing=true;root.clearTimeout(debounce);epoch++;busy=false;action.disabled=true;clearResults();},false);
  manuscript.addEventListener('compositionend',function(){composing=false;root.clearTimeout(debounce);debounce=root.setTimeout(function(){if(!panel.hidden){refresh(true);}else{draft=indexed(manuscript.value);}},700);},false);
  panel.addEventListener('focus',function(){if(!panel.hidden){refresh(true);}},false);
  var openers=['examinar-toggle','cabinet-examine'];
  for(var i=0;i<openers.length;i++){var b=D.getElementById(openers[i]);if(b){b.addEventListener('click',function(){root.setTimeout(function(){if(!panel.hidden){refresh(true);}},0);},false);}}
  D.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.keyCode===13){root.setTimeout(function(){if(!panel.hidden){refresh(true);}},0);}},false);
  E.ptbrPanelReset=function(){epoch++;busy=false;draft=null;root.clearTimeout(debounce);clearResults();action.disabled=true;};
  /* Reutiliza o painel nativo, mantendo os botões originais se a inicialização falhar. */
  panel.setAttribute('data-ptbr-dashboard','true');
  refresh(true);
}(typeof window!=='undefined'?window:this));
