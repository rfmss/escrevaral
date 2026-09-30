/* Consulta exata do recorte PortiLexicon-UD. Não classifica a palavra no contexto. */
(function(root){
  'use strict';
  var E=root.Escr,own=Object.prototype.hasOwnProperty,data=E.portiLexicon;
  var pos={ADJ:'adjetivo',ADP:'preposição',ADV:'advérbio',AUX:'possível verbo auxiliar',CCONJ:'conjunção coordenativa',DET:'determinante',INTJ:'interjeição',NOUN:'substantivo',NUM:'numeral',PRON:'pronome',SCONJ:'conjunção subordinativa',VERB:'verbo'};
  var traits={
    'Gender=Masc':'masculino','Gender=Fem':'feminino','Number=Sing':'singular','Number=Plur':'plural',
    'Person=1':'1ª pessoa','Person=2':'2ª pessoa','Person=3':'3ª pessoa',
    'Mood=Ind':'indicativo','Mood=Sub':'subjuntivo','Mood=Imp':'imperativo','Mood=Cnd':'condicional',
    'Tense=Pres':'presente','Tense=Past':'pretérito','Tense=Imp':'pretérito imperfeito','Tense=Pqp':'mais-que-perfeito','Tense=Fut':'futuro',
    'VerbForm=Fin':'forma finita','VerbForm=Inf':'infinitivo','VerbForm=Ger':'gerúndio','VerbForm=Part':'particípio',
    'NumType=Card':'cardinal','NumType=Ord':'ordinal','Degree=Sup':'superlativo','Degree=Cmp':'comparativo',
    'Definite=Def':'definido','Definite=Ind':'indefinido','PronType=Art':'artigo','PronType=Dem':'demonstrativo','PronType=Ind':'indefinido','PronType=Int':'interrogativo','PronType=Rel':'relativo','PronType=Prs':'pessoal','Poss=Yes':'possessivo','Reflex=Yes':'reflexivo','Polarity=Neg':'negativo'
  };
  E.lookupMorphology=function(key){
    var rows,out=[],i,r;
    if(typeof key!=='string'||key.length>64||!own.call(data.entries,key)){return [];}
    rows=JSON.parse(data.entries[key]);
    for(i=0;i<rows.length&&i<32;i++){r=rows[i];out.push({lemma:data.lemmas[r[0]],pos:data.tags[r[1]],features:data.features[r[2]]});}
    return out;
  };
  E.describeMorphology=function(reading){
    var out=[pos[reading.pos]||reading.pos],parts=reading.features.split('|'),i;
    for(i=0;i<parts.length;i++){if(parts[i]!=='_'){out.push(traits[parts[i]]||('traço da fonte: '+parts[i]));}}
    return out.join(' · ');
  };
}(typeof window!=='undefined'?window:this));
