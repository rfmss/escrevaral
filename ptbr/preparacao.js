/* Preparação leve: um recorte junto ao cursor, uma pausa, nenhum exame completo. ES5.
 * O hospedeiro fornece somente até 2.001 unidades UTF-16, nunca a folha inteira.
 * Sem fila, persistência, rede ou cache cumulativo. */
(function(root){
  'use strict';
  function create(E,host){
    var timer=null,generation=0,cached=null,scanner=null;
    var limits={delay:700,characters:2000,tokens:400,snapshotCharacters:2001,cacheEntries:1,occurrences:24,lexicalTokens:200,signalTokens:200};
    var supported={ortografia:true,acentuacao:true,pontuacao:true,crase:true,concordancia:true,
      morfologia:true,expressoes:true,repeticao:true,adverbios:true,dialogo:true,ritmo:true,rima:true,metrica:true};
    function reserve(input){
      var check=input.head.slice(0,limits.characters),items=[],visited=0,matched=0,m,rows,classes,j,label,item,worst;
      var anchor=typeof input.anchor==='number'?input.anchor:(input.start||0),lexStart=Math.max(0,anchor-(input.start||0)-256);
      var word=/[A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f]+(?:[-'’][A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f]+)*|[0-9]+/g;
      var continuation=/[A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f0-9'’\-]/;
      if(!E.lookupMorphology||!E.reading||!E.reading.canonical){return{items:items,visited:0,available:false,limited:false};}
      word.lastIndex=lexStart;
      while(visited<limits.lexicalTokens&&(m=word.exec(check))){
        visited++;
        if(m[0].length>64||m.index===lexStart&&(lexStart?continuation.test(check.charAt(lexStart-1)):input.leftContinues)||word.lastIndex===check.length&&continuation.test(input.head.charAt(check.length))){continue;}
        rows=E.lookupMorphology(E.reading.canonical(m[0]));classes=[];
        for(j=0;j<rows.length&&j<32;j++){
          label=E.describeMorphology?E.describeMorphology(rows[j]).split(' · ')[0]:rows[j].pos;
          if(classes.indexOf(label)===-1){classes.push(label);}
        }
        if(classes.length){
          matched++;item={start:(input.start||0)+m.index,end:(input.start||0)+word.lastIndex,snippet:m[0],classes:classes};
          if(items.length<limits.occurrences){items.push(item);}else{
            worst=0;for(j=1;j<items.length;j++){if(Math.abs(items[j].start-anchor)>Math.abs(items[worst].start-anchor)){worst=j;}}
            if(Math.abs(item.start-anchor)<Math.abs(items[worst].start-anchor)){items[worst]=item;}
          }
        }
      }
      items.sort(function(a,b){return a.start-b.start;});
      return{items:items,visited:visited,available:true,limited:matched>limits.occurrences||visited===limits.lexicalTokens||lexStart>0};
    }
    function cancel(clear){generation++;if(timer!==null){host.clearTimeout(timer);timer=null;}if(clear){cached=null;}}
    function request(){
      cancel(false);if(!host.active()){return;}
      var ticket=generation;
      timer=host.setTimeout(function(){
        timer=null;if(ticket!==generation||!host.active()){return;}
        var input=host.read(limits.snapshotCharacters),result;
        if(!input||typeof input.head!=='string'||input.head.length>limits.snapshotCharacters){host.deliver(null);return;}
        if(cached&&cached.document===input.document&&cached.head===input.head&&cached.length===input.length&&cached.start===(input.start||0)&&cached.leftContinues===!!input.leftContinues&&cached.anchor===input.anchor){host.deliver(cached.result);return;}
        try{
          var lexical=reserve(input),start=input.start||0;
          /* Contexto anterior desconhecido: não rodar heurísticas de frase no meio da folha. */
          if(start===0){
            if(!scanner){scanner=E.createSignalTriage(E,{maxChars:limits.characters,maxTokens:limits.signalTokens});}
            result=scanner.scan(input.head);
          }else{result={signals:{},read:Math.min(input.head.length,limits.characters),work:{characters:Math.min(input.head.length,limits.characters),tokens:0}};}
          result={signals:result.signals,signalsVerified:start===0,read:result.read,scope:{start:start,end:start+Math.min(input.head.length,limits.characters)},
            partial:start>0||result.read<input.length||lexical.limited,work:{characters:Math.min(input.head.length,limits.characters),tokens:result.work.tokens+lexical.visited},
            document:input.document,occurrences:lexical.items,lexicalAvailable:lexical.available,lexicalLimited:lexical.limited};

        }catch(error){cached=null;host.deliver(null);return;}
        if(ticket!==generation||!host.active()){return;}
        cached={document:input.document,head:input.head,length:input.length,start:input.start||0,leftContinues:!!input.leftContinues,anchor:input.anchor,result:result};host.deliver(result);
      },limits.delay);
    }
    function state(result,lens){
      if(!result||!supported[lens]){return 'nao-verificado';}
      if(lens==='morfologia'&&result.occurrences&&result.occurrences.length){return 'encontrado';}
      if(!result.signalsVerified){return 'nao-verificado';}
      return result.signals[lens]?'encontrado':'nao-encontrado-no-recorte';
    }
    return{request:request,cancel:cancel,state:state,limits:limits};
  }
  root.Escr=root.Escr||{};root.Escr.createPreparation=create;
  if(typeof module!=='undefined'&&module.exports){module.exports=create;}
}(typeof window!=='undefined'?window:this));
