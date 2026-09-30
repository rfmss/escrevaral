/* Consulta explícita; sentidos e flexões continuam fontes distintas, sem desambiguação. */
(function(root){
  'use strict';
  var E=root.Escr,own=Object.prototype.hasOwnProperty,data=E.ownPtLexicon;
  E.lookupLexeme=function(value){
    var key,morphology,lemmas=[],seen={},senses=[],total=0,missing=[],i,j,lemma,rows,limited=false;
    if(typeof value!=='string'||value.length>64){return {state:'invalid',message:'Consulte uma palavra de até 64 caracteres.'};}
    key=E.reading.canonical(value.replace(/^\s+|\s+$/g,''));
    if(!/^[a-zà-öø-ÿ]+(?:[-'’][a-zà-öø-ÿ]+)*$/.test(key)){return {state:'invalid',message:'Selecione ou digite uma única palavra.'};}
    morphology=E.lookupMorphology?E.lookupMorphology(key):[];
    function add(s){if(!own.call(seen,'$'+s)){seen['$'+s]=true;lemmas.push(s);}}
    // Preserva consulta literal e todas as possibilidades morfológicas do recorte.
    if(own.call(data.entries,key)){add(key);}
    for(i=0;i<morphology.length;i++){add(morphology[i].lemma);}
    if(!lemmas.length){return {state:'uncovered',query:key,message:'Esta forma não está no recorte local. Isso não indica erro de escrita; nem todas as palavras e flexões estão cobertas.'};}
    if(lemmas.length>8){limited=true;}
    for(i=0;i<lemmas.length&&i<8;i++){
      lemma=lemmas[i];
      if(!own.call(data.entries,lemma)){missing.push(lemma);continue;}
      // Um parse por lema consultado, sem índice adicional ou cache residente.
      rows=JSON.parse(data.entries[lemma]);total+=rows.length;
      for(j=0;j<rows.length&&senses.length<24;j++){rows[j].lemma=lemma;senses.push(rows[j]);}
    }
    return {state:'found',query:key,morphology:morphology,lemmas:lemmas,senses:senses,total:total,
      limited:limited||total>senses.length,missingSenseLemmas:missing,
      source:data.source,version:data.version,license:data.license,
      morphologySource:E.portiLexicon?E.portiLexicon.source:null,morphologyVersion:E.portiLexicon?E.portiLexicon.version:null};
  };
}(typeof window!=='undefined'?window:this));
