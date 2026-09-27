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
