/* Preparação leve: um recorte inicial, uma pausa, nenhum exame completo. ES5.
 * O hospedeiro fornece somente até 2.001 unidades UTF-16, nunca a folha inteira.
 * Sem fila, persistência, rede ou cache cumulativo. */
(function(root){
  'use strict';
  function create(E,host){
    var timer=null,generation=0,cached=null,scanner=null;
    var limits={delay:700,characters:2000,tokens:400,snapshotCharacters:2001,cacheEntries:1};
    var supported={ortografia:true,acentuacao:true,pontuacao:true,crase:true,concordancia:true,
      morfologia:true,expressoes:true,repeticao:true,adverbios:true,dialogo:true,ritmo:true,rima:true,metrica:true};
    function cancel(clear){generation++;if(timer!==null){host.clearTimeout(timer);timer=null;}if(clear){cached=null;}}
    function request(){
      cancel(false);if(!host.active()){return;}
      var ticket=generation;
      timer=host.setTimeout(function(){
        timer=null;if(ticket!==generation||!host.active()){return;}
        var input=host.read(limits.snapshotCharacters),result;
        if(!input||typeof input.head!=='string'||input.head.length>limits.snapshotCharacters){host.deliver(null);return;}
        if(cached&&cached.document===input.document&&cached.head===input.head&&cached.length===input.length){host.deliver(cached.result);return;}
        try{
          if(!scanner){scanner=E.createSignalTriage(E,{maxChars:limits.characters,maxTokens:limits.tokens});}
          result=scanner.scan(input.head);
          /* Não reter a cópia interna da triagem nem inferir cobertura da folha. */
          result={signals:result.signals,read:result.read,partial:result.read<input.length,work:result.work};
        }catch(error){cached=null;host.deliver(null);return;}
        if(ticket!==generation||!host.active()){return;}
        cached={document:input.document,head:input.head,length:input.length,result:result};host.deliver(result);
      },limits.delay);
    }
    function state(result,lens){
      if(!result||!supported[lens]){return 'nao-verificado';}
      return result.signals[lens]?'encontrado':'nao-encontrado-no-recorte';
    }
    return{request:request,cancel:cancel,state:state,limits:limits};
  }
  root.Escr=root.Escr||{};root.Escr.createPreparation=create;
  if(typeof module!=='undefined'&&module.exports){module.exports=create;}
}(typeof window!=='undefined'?window:this));
