/* Sinais das lentes atuais. Trabalho limitado por caracteres e tokens, sem Findings.
 * O debounce é do painel; esta camada não agenda nem executa lentes. ES5. */
(function(root){
  'use strict';
  function create(E,options){
    options=options||{};
    var maxChars=Math.min(options.maxChars||8000,8000),maxTokens=Math.min(options.maxTokens||1600,1600);
    var own=Object.prototype.hasOwnProperty,keys={},adverbs={},rules=E.knowledge.rules||[],i,k,j;
    var format=E.reading.canonical||function(x){return x.toLowerCase();};
    for(i=0;i<rules.length;i++)if(rules[i].forms){for(k in rules[i].forms)if(own.call(rules[i].forms,k)){
      var key='$'+format(k),lenses=keys[key]||(keys[key]=[]);if(lenses.indexOf(rules[i].lens)<0)lenses.push(rules[i].lens);
    }}
    (E.studioData.adverbs||[]).forEach(function(w){adverbs['$'+format(w)]=true;});
    function scan(input){
      var s=String(input||''),check=s.slice(0,maxChars),clean=E.protectedText(check),ts=E.reading.tokens(clean),signals={},visits=0;
      if(ts.length>maxTokens){ts=ts.slice(0,maxTokens);check=check.slice(0,ts[ts.length-1].end);clean=clean.slice(0,check.length);}
      else if(check.length<s.length&&ts.length&&ts[ts.length-1].end===check.length&&/[A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f0-9'’\-]/.test(s.charAt(check.length))){
        var last=ts.pop();check=check.slice(0,last.start);clean=clean.slice(0,last.start);
      }
      var probe=E.localLanguageRules.repetitionProbe(),D=E.maturationData,t,w,key,a,hit;
      for(var i=0;i<ts.length;i++){
        visits++;t=ts[i];w=t.value;key='$'+w;a=keys[key]||[];
        for(var j=0;j<a.length;j++)signals[a[j]]=true;
        if(own.call(adverbs,key))signals.adverbios=true;
        if(w==='que')signals['que-contextual']=true;
        if(!signals.expressoes&&E.localLanguageRules.expressionAt(clean,ts,i,E.styleData.index))signals.expressoes=true;
        if(!signals.repeticao&&probe.feed(t,check,clean))signals.repeticao=true;
        if(!signals.morfologia&&E.grammar&&E.grammar.readings(w).classes.length)signals.morfologia=true;
        if(!signals.crase&&(w==='à'||w==='às')&&ts[i+1]&&
          ((D.crasePronouns||[]).indexOf(ts[i+1].value)>=0||(D.craseInfinitives||[]).indexOf(ts[i+1].value)>=0))signals.crase=true;
        if(!signals.concordancia&&ts[i+1]&&(own.call(D.haver||{},w)||own.call(D.existir||{},w)||own.call(D.fazer||{},w)))signals.concordancia=true;
      }
      if(/,{2,}|;{2,}/.test(clean))signals.pontuacao=true;
      if(/(^|[\r\n])[ \t]*[—–-][ \t]+\S/m.test(clean))signals.dialogo=true;
      if(E.reading.sentences){var sentences=E.reading.sentences(clean),closed=0;
        for(i=0;i<sentences.length&&closed<3;i++)if(sentences[i].closed)closed++;
        if(closed>=3)signals.ritmo=true;
      }
      var parts=clean.split(/\r\n|\n|\r/),shortLines=0,ends={},lineWords,end,suffix;
      for(i=0;i<parts.length;i++){
        if(!parts[i].replace(/\s/g,'')||parts[i].length>90)continue;
        shortLines++;lineWords=E.reading.tokens(parts[i]);
        if(!lineWords.length)continue;end=lineWords[lineWords.length-1].value;suffix='$'+end.slice(-2);
        if(end.length>=3){if(own.call(ends,suffix)&&ends[suffix]!==end)signals.rima=true;ends[suffix]=end;}
      }
      if(shortLines>=2)signals.metrica=true;else delete signals.rima;
      return{text:s,read:check.length,signals:signals,words:E.reading.tokens(check).length,chars:s.length,
        partial:check.length<s.length,work:{characters:check.length,tokens:visits,maxCharacters:maxChars,maxTokens:maxTokens}};
    }
    return{scan:scan};
  }
  root.Escr=root.Escr||{};root.Escr.createSignalTriage=create;
  if(typeof module!=='undefined'&&module.exports)module.exports=create;
}(typeof window!=='undefined'?window:this));
