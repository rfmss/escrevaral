/* Repetição descritiva. Confiança alta refere-se à contagem, nunca a um erro. */
(function(root){
  'use strict';var E=root.Escr,S=E.instruments;
  E.analyzeLocalRepetition=function(text,cap){
    var clean=E.protectedText(text),ts=E.reading.tokens(clean),probe=E.localLanguageRules.repetitionProbe(),out=[],i,hit,t,id,message,rule;
    for(i=0;i<ts.length&&out.length<cap;i++){
      hit=probe.feed(ts[i],text,clean);if(!hit)continue;t=hit.token;
      if(hit.kind==='adjacente'){id='002';message='“'+text.slice(t.start,t.end)+'” aparece em duas posições consecutivas.';rule='Duas ocorrências contíguas da mesma palavra, separadas apenas por espaço ou tabulação.';}
      else if(hit.kind==='retorno'){id='003';message='“'+text.slice(t.start,t.end)+'” retorna na construção “'+text.slice(hit.occurrences[0].start,t.end)+'”.';rule='A mesma palavra aparece dos dois lados de “que”, sem pontuação entre elas.';}
      else{id='001';message='“'+text.slice(t.start,t.end)+'” aparece três vezes em um trecho próximo.';rule='Três ocorrências em uma janela de até 40 palavras do mesmo parágrafo.';}
      out.push(S.finding('repeticao','PTBR-REP-'+id,text,t.start,t.end,message,rule,
        'Observe como o retorno funciona nesta passagem: pode marcar ritmo, insistência, oralidade ou uma retomada a rever.',
        'Repetição pode ser intencional. A contagem não indica erro nem exige troca por sinônimo.',
        'Ignora caixa e compõe acentos equivalentes, sem remover diacríticos nem reunir flexões. Citações e parágrafos interrompem a janela. Palavras funcionais entram apenas na repetição adjacente. Um apontamento por palavra a cada 40 tokens.',
        {title:'Critério descritivo local v2, documentado em ptbr/README.md; limiares operacionais, sem medida de qualidade literária.',url:null},
        {confidence:'alta',occurrences:hit.occurrences.map(function(x){return{start:x.start,end:x.end};}),contextStart:hit.occurrences[0].start}));
    }
    return out;
  };
}(typeof window!=='undefined'?window:this));
