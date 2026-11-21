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
      el('p',details(card,'Como ler esta análise'),'ptbr-legend',lens==='morfologia'?'Etiqueta contínua: hipótese contextual. Tracejada: possibilidade no léxico. Sem leitura: fora da cobertura. Arcos pontilhados: apoios, não uma árvore sintática completa.':lens==='sintaxe'?'Os grupos podem se conter: o predicado inclui verbo, clíticos e complementos; adjuntos deslocados, vocativos, apostos e orações reduzidas (gerúndio e ao + infinitivo) aparecem destacados na ordem da frase. Os arcos mostram vínculos da hipótese selecionada; as mesmas relações aparecem por escrito.':'Os trechos pertencem à lente escolhida. Selecione um para consultar a explicação.');
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
      if((selected==='morfologia'||selected==='sintaxe'||selected==='relativas')&&E.getLexicoP01&&E.contextualMorphology&&root.location&&/^https?:$/i.test(root.location.protocol)){
        var scopeText=selAtRun?snapshot.slice(selAtRun.start,selAtRun.end):snapshot.slice(0,8000);
        var toks=E.reading.tokens(E.protectedText(scopeText)),unknowns=[],seenU={},ti,tv,SL=E.syntaxLexicon;
        for(ti=0;ti<toks.length&&unknowns.length<160;ti++){
          tv=toks[ti].value;
          if(seenU[tv]){continue;}
          seenU[tv]=true;
          if(selected==='morfologia'){
            if(!E.contextualMorphology.lexicalReadings(tv).classes.length){unknowns.push(tv);}
          }else if(SL){
            if(!SL.nounReadings(tv).length&&!SL.adjectiveReading(tv)&&!SL.determinerReading(tv)&&!SL.prepReading(tv)&&!SL.verbReadings(tv).length){unknowns.push(tv);}
          }
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
