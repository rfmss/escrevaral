/* Lente existente: correspondência literal, acentos preservados, offsets originais. */
(function(root){
  'use strict';var E=root.Escr,S=E.instruments;
  (E.extensions=E.extensions||[]).push(function(register){
    register({id:'expressoes',analyze:function(text,cap){
      var clean=E.protectedText(text),ts=E.reading.tokens(clean),out=[],i,match,entry,recurring,local;
      for(i=0;i<ts.length&&out.length<cap;i++){
        match=E.localLanguageRules.expressionAt(clean,ts,i,E.styleData.index);if(!match)continue;
        entry=E.styleData.entries[match.index];local=entry.id==='PTBR-EST-003';recurring=entry.id==='PTBR-EST-001'||local;
        out.push(S.finding('expressoes',entry.id,text,match.start,match.end,
          recurring?'Uma expressão do repertório compartilhado.':'Uma aproximação de sentidos para observar.',
          'A sequência corresponde à entrada “'+entry.term+'” do catálogo, preservando sua posição na folha.',
          recurring?'A expressão pode dar familiaridade, marcar frequência ou servir como contraste no texto.':'A aproximação pode funcionar como ênfase, contraste, precisão contextual ou ritmo.',
          'A ocorrência não demonstra clichê nem redundância. Sua função depende da passagem.',
          'Correspondência de palavras contíguas separadas por espaços ou tabulação. Ignora caixa, compõe acentos equivalentes e preserva diacríticos. Aspas, código, endereços, pontuação e quebras de linha interrompem a expressão.',
          {title:local?'Inclusão editorial local de 25/09/2026, solicitada no briefing: de vez em quando.':'Catálogo de expressões já presente na main 9d16740; classificação herdada usada como observação.',url:null},
          {severity:'informação',confidence:'alta',feature:entry.kind}));i=match.last;
      }
      return out;
    }});
  });
}(typeof window!=='undefined'?window:this));
