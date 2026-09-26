/* Regras observáveis de expressão e repetição; compartilham sinais e achados. ES5. */
(function(root){
  'use strict';
  var E=root.Escr,own=Object.prototype.hasOwnProperty;
  function expressionIndex(entries){
    var trie={},i,j,parts,node;
    for(i=0;i<entries.length;i++){
      parts=E.reading.tokens(entries[i].term);node=trie;
      for(j=0;j<parts.length;j++){var k='$'+parts[j].value;node=node[k]||(node[k]={});}
      if(parts.length)node.entry=i;
    }
    return trie;
  }
  function expressionAt(text,ts,i,trie){
    var node=trie,j,best=null;
    for(j=i;j<ts.length&&j<i+16;j++){
      if(j>i&&!/^[ \t\u00a0]+$/.test(text.slice(ts[j-1].end,ts[j].start)))break;
      node=node['$'+ts[j].value];if(!node)break;
      if(typeof node.entry==='number')best={index:node.entry,start:ts[i].start,end:ts[j].end,last:j};
    }
    return best;
  }
  var stop={};E.maturationData.stopwords.forEach(function(w){stop['$'+w]=true;});
  function repetitionProbe(){
    var recent=[],reported=[],index=0,previousEnd=0;
    function feed(t,text,clean){
      var gap=text.slice(previousEnd,t.start),i,prior=recent[recent.length-1],before=recent[recent.length-2],kind=null,occurrences=[],already=false;
      if(/(?:\r?\n)[ \t\r]*(?:\r?\n)/.test(gap)||clean.slice(previousEnd,t.start)!==gap){recent=[];reported=[];prior=null;before=null;}
      previousEnd=t.end;
      while(recent.length&&index-recent[0].index>=E.maturationData.repeatWindow)recent.shift();
      while(reported.length&&index-reported[0].index>=E.maturationData.repeatWindow)reported.shift();
      for(i=0;i<reported.length;i++)if(reported[i].word===t.value)already=true;
      if(!already&&t.value.length>=2&&!/[0-9]/.test(t.value)){
        if(prior&&prior.token.value===t.value&&/^[ \t\u00a0]+$/.test(gap)){
          kind='adjacente';occurrences=[prior.token,t];
        }else if(before&&prior.token.value==='que'&&before.token.value===t.value&&t.value.length>=4&&!stop['$'+t.value]&&
          /^[ \t\u00a0]+que[ \t\u00a0]+$/i.test(clean.slice(before.token.end,t.start))){
          kind='retorno';occurrences=[before.token,t];
        }else if(t.value.length>=4&&!stop['$'+t.value]){
          for(i=0;i<recent.length;i++)if(recent[i].token.value===t.value)occurrences.push(recent[i].token);
          occurrences.push(t);
          if(occurrences.length>=E.maturationData.repeatMinimum){kind='proxima';occurrences=occurrences.slice(-E.maturationData.repeatMinimum);}
        }
      }
      recent.push({index:index,token:t});
      if(kind)reported.push({index:index,word:t.value});index++;
      return kind?{kind:kind,token:t,occurrences:occurrences}:null;
    }
    return{feed:feed};
  }
  E.localLanguageRules={expressionIndex:expressionIndex,expressionAt:expressionAt,repetitionProbe:repetitionProbe};
  // Inclusão editorial local, sem importar o inventário do anexo.
  var data=E.styleData,exists=false;
  data.entries.forEach(function(e){if(e.term==='de vez em quando')exists=true;});
  if(!exists)data.entries.push({term:'de vez em quando',kind:'expressão de frequência',id:'PTBR-EST-003'});
  data.index=expressionIndex(data.entries);
  E.lensCatalog.forEach(function(policy){if(policy.id==='repeticao'){
    policy.minimum=2;policy.scope='Repetição adjacente, retorno X que X ou três ocorrências em até 40 palavras; observações descritivas, sem julgar a intenção.';
  }});
}(typeof window!=='undefined'?window:this));
