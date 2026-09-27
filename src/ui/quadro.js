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
