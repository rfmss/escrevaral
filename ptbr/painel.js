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
    '.ptbr-lens-description,.ptbr-signal{display:block;white-space:normal;font-size:12px;line-height:1.5;margin-top:5px}.ptbr-signal{font-style:italic;opacity:.8}' +
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
  var prepStatus=el('p',view,'ptbr-status','');prepStatus.setAttribute('role','status');
  var wheel=el('div',view,'ptbr-wheel');
  var preparation=null,prepared=null,signalLabels={};
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
    var target=screen==='result'?'group':'home';
    E.ptbrPanelReset();showScreen(target,currentGroup,true);
  },false);
  var status=el('p',view,'ptbr-status','A análise começa somente quando você pedir.');status.setAttribute('role','status');

  var results=el('div',view,'ptbr-results');
  var empty=el('div',results,'ptbr-empty','Seu texto, por dentro. Escolha uma lente para abrir a leitura anotada.');
  var note=el('p',view,'ptbr-status','O silêncio de uma lente não certifica o texto. A escrita permanece sua.');
  function paintPreparation(result){
    prepared=result;
    for(var id in signalLabels){if(own.call(signalLabels,id)){
      var state=preparation?preparation.state(result,id):'nao-verificado';
      signalLabels[id].textContent=state==='encontrado'?(id==='morfologia'?'Há palavras no léxico; classe contextual a examinar.':'Há indícios para examinar.'):
        state==='nao-encontrado-no-recorte'?'Sem indícios neste recorte; análise disponível.':'Pertinência ainda não verificada.';
      signalLabels[id].setAttribute('data-signal-state',state);
    }}
    prepStatus.textContent=result?'Preparação leve: '+result.read+' caracteres iniciais observados'+(result.partial?'; o restante não foi verificado.':'.')+' Indícios não são classificações nem erros.':'A preparação aguarda uma pausa na escrita. Nenhuma análise completa é automática.';
  }
  if(E.createPreparation&&E.createSignalTriage){preparation=E.createPreparation(E,{
    setTimeout:function(fn,ms){return root.setTimeout(fn,ms);},clearTimeout:function(id){root.clearTimeout(id);},
    active:function(){return !panel.hidden&&!D.hidden&&!composing&&!busy&&(screen==='home'||screen==='group')&&!!manuscript.value;},
    read:function(limit){return{head:manuscript.value.slice(0,limit),length:manuscript.value.length,document:documentKey()};},
    deliver:function(result){paintPreparation(result);if(!result){prepStatus.textContent='Preparação indisponível. Você pode escolher qualquer análise.';}}
  });}
  function showScreen(next,group,focus){
    screen=next;prepStatus.hidden=next!=='group';if(typeof group==='number'){currentGroup=group;}
    goals.hidden=next!=='home';wheel.hidden=next!=='group';
    if(lexicalBox){lexicalBox.hidden=next!=='lexical';}
    results.hidden=next!=='result'&&next!=='lexical';
    action.hidden=next!=='result';note.hidden=next==='home'||next==='group';
    backMenu.hidden=next==='home';
    backMenu.textContent=next==='result'?'Escolher outra análise':'Voltar às opções';
    title.textContent=next==='home'?'O que você quer observar?':next==='lexical'?'Consultar uma palavra':next==='result'?(labels[lastLens]||'Resultado'):groups[currentGroup||0].title;
    intro.hidden=next==='result';
    intro.textContent=next==='home'?'Escolha uma tarefa para olhar seu texto. Você decide o que examinar e o que manter.':next==='lexical'?'Digite uma palavra ou selecione-a no texto antes de abrir este painel. A consulta mostra possibilidades; o sentido depende da frase.':'Escolha um aspecto abaixo para examinar a folha atual. Seu texto permanece intacto.';
    var buttons=wheel.querySelectorAll('button');
    for(var at=0;at<buttons.length;at++){buttons[at].hidden=groups[currentGroup||0].lenses.indexOf(buttons[at].getAttribute('data-ptbr-lens'))===-1;}
    if(next==='home'||next==='group'){status.textContent=manuscript.value.length>fullScope?'Esta folha ultrapassa o limite de 200 mil caracteres para análise. A consulta de palavras continua disponível.':manuscript.value?'A análise completa começa quando você escolhe um aspecto.':'Escreva na folha para começar. Você pode consultar uma palavra mesmo com a folha vazia.';}
    if(preparation){if(next==='home'||next==='group'){preparation.request();}else{preparation.cancel(false);}}
    if(focus){if(next==='lexical'&&lexicalInput){lexicalInput.focus();}else{title.focus();}panel.scrollTop=0;}
  }
  function details(parent,label){
    var wrap=el('div',parent,'ptbr-details'),button=el('button',wrap,'',label),content=el('div',wrap,'ptbr-details-content');
    button.type='button';button.setAttribute('aria-expanded','false');content.hidden=true;
    button.addEventListener('click',function(){content.hidden=!content.hidden;button.setAttribute('aria-expanded',content.hidden?'false':'true');},false);return content;
  }
  function clearResults(){if(readingView){readingView.destroy();readingView=null;}results.textContent='';}
  function refresh(force) {
    if(composing||busy||panel.hidden&&!force){return;}
    if(!force&&draft&&draft.text===manuscript.value&&draft.document===documentKey()){return;}
    if(preparation){preparation.cancel(true);}prepared=null;
    epoch++;root.clearTimeout(debounce);busy=false;clearResults();
    el('div',results,'ptbr-empty','Seu texto, por dentro. Escolha uma lente para abrir a leitura anotada.');
    var s=manuscript.value;draft={text:s,document:documentKey()};
    if(lexicalInput){
      var selectionStart=manuscript.selectionStart,selectionEnd=manuscript.selectionEnd;
      lexicalInput.value=typeof selectionStart==='number'&&selectionEnd>selectionStart&&selectionEnd-selectionStart<=64?s.slice(selectionStart,selectionEnd):'';
    }
    wheel.textContent='';signalLabels={};var chosen=[],id,btn,k;
    for(k in labels){if(own.call(labels,k)){chosen.push(k);}}
    for(var i=0;i<chosen.length;i++){id=chosen[i];
      btn=el('button',wheel,'',null);btn.type='button';el('span',btn,'',labels[id]);btn.setAttribute('data-ptbr-lens',id);
      el('small',btn,'ptbr-lens-description',descriptions[id]);signalLabels[id]=el('small',btn,'ptbr-signal','Pertinência ainda não verificada.');
      btn.setAttribute('aria-label','Examinar '+labels[id]);btn.disabled=!s.length||s.length>fullScope;
      btn.addEventListener('click',function(){run(this.getAttribute('data-ptbr-lens'));},false);}
    action.disabled=!lastLens||!s.length||s.length>fullScope;
    paintPreparation(prepared);showScreen('home',null,false);
    note.textContent='A análise tem cobertura parcial. Ausência de apontamentos não garante ausência de problemas.';

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
    if(result.state!=='found'){el('p',card,'',result.message);status.textContent='Consulta concluída sem leitura lexical.';return;}
    if(result.morphology&&result.morphology.length){
      el('h4',card,'','Lemas e flexões possíveis');
      el('p',card,'','Estas leituras pertencem ao léxico. A consulta não decide qual classe ou função vale na sua frase.');
      for(i=0;i<result.morphology.length;i++){
        entry=result.morphology[i];el('p',card,'',entry.lemma+' — '+E.describeMorphology(entry));
      }
      el('p',sources,'','Fonte das flexões: PortiLexicon-UD · Lopes, Duran, Fernandes e Pardo (2022). Recorte e compactação: Escrevaral.');
      link=el('a',sources,'','Origem e licença das flexões (internet)');link.href='https://github.com/LuceleneL/PortiLexicon-UD/tree/315e063da1f89c89e2097c6e72428ebefb9ab1d1';link.target='_blank';link.rel='noopener noreferrer';
    }
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
  function run(selected) {
    if(composing||panel.hidden||!selected||!own.call(labels,selected)){return;}
    if(E.ptbrLegacyCancel){E.ptbrLegacyCancel();}
    epoch++;busy=false;lastLens=selected;refresh(true);if(!draft||!draft.text||draft.text.length>fullScope){status.textContent=draft&&draft.text.length>fullScope?'Esta folha ultrapassa o limite de 200 mil caracteres para análise.':'Escreva na folha antes de examinar.';return;}
    for(var g=0;g<groups.length;g++){if(groups[g].lenses.indexOf(selected)!==-1){currentGroup=g;}}
    showScreen('result',currentGroup,true);
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
    if(preparation){preparation.cancel(true);}paintPreparation(null);
    epoch++;busy=false;root.clearTimeout(debounce);action.disabled=true;clearResults();
    status.textContent='O texto mudou. Os resultados anteriores foram retirados.';
    cancel.hidden=true;draft=null;action.disabled=composing||!lastLens||!manuscript.value||manuscript.value.length>fullScope;
    var buttons=wheel.querySelectorAll('button');for(var j=0;j<buttons.length;j++){buttons[j].disabled=composing||!manuscript.value||manuscript.value.length>fullScope;}
    if(preparation){preparation.request();}
  },false);
  manuscript.addEventListener('compositionstart',function(){composing=true;if(preparation){preparation.cancel(true);}paintPreparation(null);root.clearTimeout(debounce);epoch++;busy=false;draft=null;action.disabled=true;cancel.hidden=true;clearResults();},false);
  manuscript.addEventListener('compositionend',function(){composing=false;root.clearTimeout(debounce);action.disabled=!lastLens||!manuscript.value||manuscript.value.length>fullScope;var buttons=wheel.querySelectorAll('button');for(var j=0;j<buttons.length;j++){buttons[j].disabled=!manuscript.value||manuscript.value.length>fullScope;}if(preparation){preparation.request();}},false);
  panel.addEventListener('focus',function(){if(!panel.hidden){refresh(true);}},false);
  var openers=['examinar-toggle','cabinet-examine'];
  for(var i=0;i<openers.length;i++){var b=D.getElementById(openers[i]);if(b){b.addEventListener('click',function(){root.setTimeout(function(){if(!panel.hidden){refresh(true);}},0);},false);}}
  D.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&e.keyCode===13){root.setTimeout(function(){if(!panel.hidden){refresh(true);}},0);}},false);
  E.ptbrPanelReset=function(){if(preparation){preparation.cancel(true);}paintPreparation(null);epoch++;busy=false;draft=null;root.clearTimeout(debounce);clearResults();action.disabled=true;cancel.hidden=true;};
  D.addEventListener('visibilitychange',function(){if(preparation){if(D.hidden){preparation.cancel(true);paintPreparation(null);}else{preparation.request();}}},false);
  E.ptbrPanelFocus=function(){title.focus();};
  /* Reutiliza o painel nativo, mantendo os botões originais se a inicialização falhar. */
  panel.setAttribute('data-ptbr-dashboard','true');
  if(!panel.hidden){refresh(true);}
}(typeof window!=='undefined'?window:this));
