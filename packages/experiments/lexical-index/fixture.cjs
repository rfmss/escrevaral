'use strict';
// Fixture própria de engenharia. Não é um dicionário, corpus reservado ou material importado.
const base = [
  ['carro','carro','NOUN','Gender=Masc|Number=Sing'],
  ['carros','carro','NOUN','Gender=Masc|Number=Plur'],
  ['carta','carta','NOUN','Gender=Fem|Number=Sing'],
  ['canto','canto','NOUN','Gender=Masc|Number=Sing'],
  ['canto','cantar','VERB','Mood=Ind|Number=Sing|Person=1|Tense=Pres'],
  ['cantou','cantar','VERB','Mood=Ind|Number=Sing|Person=3|Tense=Past'],
  ['nos','nós','PRON','Number=Plur|Person=1'],
  ['nos','em+os','CONTRACTION','Parts=em,os'],
  ['da','de+a','CONTRACTION','Parts=de,a'],
  ['ação','ação','NOUN','Gender=Fem|Number=Sing'],
  ['avó','avó','NOUN','Gender=Fem|Number=Sing'],
  ['avô','avô','NOUN','Gender=Masc|Number=Sing'],
  ['pelo','pelo','NOUN','Gender=Masc|Number=Sing'],
  ['pelo','por+o','CONTRACTION','Parts=por,o'],
  ['que','que','PRON',''], ['que','que','SCONJ',''],
  ['__proto__','__proto__','TEST','EngineeringOnly=Yes'],
  ['constructor','constructor','TEST','EngineeringOnly=Yes']
];
exports.entries = function (extra = 0, dense = 0) {
  const rows = base.map((r,i)=>({id:'own-'+i,form:r[0],lemma:r[1],pos:r[2],features:r[3]}));
  // Formas artificiais; volume conhecido e concentrado no mesmo prefixo CAR.
  for (let i=0;i<extra;i++) rows.push({id:'stress-'+i,form:'car'+String(i).padStart(7,'0'),lemma:'artificial',pos:'TEST',features:'EngineeringOnly=Yes'});
  for (let i=0;i<dense;i++) rows.push({id:'dense-'+i,form:'carregado',lemma:'artificial-'+i,pos:'TEST',features:'EngineeringOnly=Yes'});
  return rows;
};
