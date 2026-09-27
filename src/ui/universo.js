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
