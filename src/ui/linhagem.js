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
