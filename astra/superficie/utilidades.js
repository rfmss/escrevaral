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
    function showFocus(){bridge.show('focus-pause','pomodoro-task');byId('focus-close').focus();}
    function paintTimer(){
      var remaining=state.mode==='idle'?state.work*60:E.pomodoroRemaining(state,Date.now()), display=formatTime(remaining), digits=display.replace(':',''), j;
      text(byId('pomodoro-display'),display);text(byId('focus-time'),display);
      for(j=0;j<4;j+=1){if(byId('focus-digit-'+j).textContent!==digits.charAt(j)){text(byId('focus-digit-'+j),digits.charAt(j));}}
      byId('pomodoro-task').hidden=state.mode==='idle';text(byId('pomodoro-task'),(state.mode==='work'?'Escrita ':'Pausa ')+display+(state.paused?' · pausado':''));
      byId('pomodoro-start').hidden=state.mode!=='idle';byId('pomodoro-stop').hidden=state.mode==='idle';byId('pomodoro-pause').hidden=state.mode==='idle'||state.mode==='ready';
      byId('pomodoro-work').disabled=byId('pomodoro-break').disabled=state.mode!=='idle';text(byId('pomodoro-pause'),state.paused?'Retomar contagem':'Pausar contagem');
      text(byId('focus-status'),state.mode==='ready'?'A pausa terminou. Volte quando quiser.':'Afaste os olhos da tela. A escrita pode esperar.');
      byId('focus-challenge').hidden=state.mode!=='ready';
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
    ['C','⌫','(',')','7','8','9','÷','4','5','6','×','1','2','3','−','0',',','%','+','='].forEach(function(key){var b=button(byId('calculator-keys'),key,function(){if(key==='C'){calc.value='';text(result,'0');}else if(key==='⌫'){calc.value=calc.value.slice(0,-1);}else if(key==='='){calculate();}else if(calc.value.length<160){calc.value+=key;}calc.focus();});if(key==='⌫'){b.setAttribute('aria-label','Apagar último caractere');}if(key==='C'){b.setAttribute('aria-label','Limpar conta');}});

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
      text(byId('utility-heading'),kind==='pomodoro'?'Pomodoro':kind==='calculator'?'Calculadora':'Calendário');
      if(kind==='calendar'){loadPlanner();try{calendarDocs=bridge.documents();}catch(e){calendarDocs=[];text(byId('calendar-status'),'Não foi possível ler as folhas.');}renderCalendar();}
      bridge.show('utilidades','start-'+kind);if(kind==='calculator'){calc.focus();}else{byId('utilidades').focus();}paintTimer();
    }
    on(byId('utility-close'),'click',function(){bridge.close();});
    ['pomodoro','calculator','calendar'].forEach(function(kind){on(byId('start-'+kind),'click',function(){open(kind);});});
    if(state.mode==='work'){status(state.paused?'Contagem pausada.':'Tempo de escrita em andamento.');}
    paintTimer();if(state.mode==='break'||state.mode==='ready'){if(bridge.checkpoint()){showFocus();}}tick();
  };
}(typeof window !== 'undefined' ? window : this));
