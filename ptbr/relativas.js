/* Relativas restritivas: recorte explícito, ES5, sem acesso ao editor. */
(function (root) {
  'use strict';
  var E=root.Escr,version='relativas-1';
  var source={title:'Cunha/Cintra, 7ª ed., 2ª impressão, 2017, pp. 358, 614–618; Bechara, Lições, arquivo recebido, páginas PDF 236–239, 244–246 e 253. Recorte computacional local; não é algoritmo dos autores.',url:null};
  var limit='Somente artigo + substantivo registrado como sujeito da principal, seguido de uma relativa sem vírgulas com que-sujeito. Predicado relativo intransitivo ou de ligação reconhecido; locuções delimitadas permitidas. Principal inteira também deve ser reconhecida. Não decide que-objeto, integrantes, explicativas, preposições relativas, inversão, coordenação, elipse ou encaixamentos. Ausência de leitura não indica erro.';
  function span(text,a,b,role){return{start:a,end:b,snippet:text.slice(a,b),role:role};}
  function one(findings,feature){var found=findings.filter(function(f){return f.feature===feature;});return found.length===1?found[0]:null;}
  function probe(prefix,predicate){
    /* Cópia de trabalho para testar relações; nunca devolvida como trecho do autor. */
    var text=prefix+' '+predicate,findings=E.syntaxRelations.analyze(text,100);
    var subject=one(findings,'Sujeito'),verb=one(findings,'Núcleo verbal')||one(findings,'Verbo de ligação')||one(findings,'Locução verbal');
    return findings.coverageInfo.constructions===1&&subject&&subject.start===0&&subject.end===prefix.length&&verb?{findings:findings,verb:verb,subject:subject}:null;
  }
  function match(text,ts){
    var i,q=-1,matches=[],n=ts.length;
    if(n>24||n<5){return null;}
    for(i=0;i<n;i++){if(ts[i].value==='que'){if(q>=0){return null;}q=i;}}
    if(q!==2||['o','a','os','as','um','uma','uns','umas'].indexOf(ts[0].value)<0){return null;}
    var prefix=text.slice(ts[0].start,ts[1].end);
    for(i=q+2;i<n;i++){
      var inner=probe(prefix,text.slice(ts[q+1].start,ts[i-1].end));
      if(!inner){continue;}
      /* Que + V + SN também pode admitir que-objeto e sujeito posposto.
       * Não escolher que-sujeito por preferência de ordem neste incremento. */
      if(inner.findings.some(function(f){return f.feature==='Objeto direto'||f.feature==='Objeto indireto';})){continue;}
      var outer=probe(prefix,text.slice(ts[i].start,ts[n-1].end));
      if(!outer){continue;}
      matches.push({q:q,end:i,inner:inner,outer:outer,prefixLength:prefix.length});
    }
    return matches.length===1?matches[0]:null;
  }
  function analyze(text,cap){
    if(typeof text!=='string'){throw new Error('A análise precisa receber texto.');}
    cap=typeof cap==='number'&&cap>0?Math.min(100,Math.floor(cap)):100;
    var cut=text.slice(0,8000),tokens=E.reading.tokens(cut),partial=cut.length<text.length;
    if(tokens.length>1600){cut=cut.slice(0,tokens[1600].start);partial=true;}
    var clean=E.protectedText(cut),out=[],unsupported=0,truncated=0,capped=false;
    E.reading.sentences(cut).forEach(function(segment){
      var raw=cut.slice(segment.start,segment.end),stop=segment.end,tail=cut.slice(segment.end);
      var complete=/[\r\n]/.test(tail)||/[.!?…;]$/.test(raw)&&(segment.end<cut.length||/^[\s.!?…;]/.test(text.charAt(cut.length)));
      if(partial&&/^\s*$/.test(tail)&&!complete){truncated++;return;}
      if(raw.length>1000||clean.slice(segment.start,segment.end)!==raw){unsupported++;return;}
      var terminal=raw.match(/[.!?…;]+\s*$/);if(terminal){stop=segment.start+terminal.index;}
      var ts=E.reading.tokens(cut.slice(segment.start,stop));if(!ts.length){return;}
      ts.forEach(function(t){t.start+=segment.start;t.end+=segment.start;});
      var usable=/^\s*$/.test(cut.slice(segment.start,ts[0].start))&&/^\s*$/.test(cut.slice(ts[ts.length-1].end,stop));
      for(var j=1;j<ts.length;j++){if(!/^[ \t\u00a0]+$/.test(cut.slice(ts[j-1].end,ts[j].start))){usable=false;}}
      var r=usable&&match(cut,ts);if(!r){unsupported++;return;}
      if(out.length>=cap){capped=true;return;}
      var que=ts[r.q],ante=span(text,ts[0].start,ts[1].end,'Antecedente'),head=span(text,ts[1].start,ts[1].end,'Núcleo do antecedente');
      var innerShift=ts[r.q+1].start-r.prefixLength-1,outerShift=ts[r.end].start-r.prefixLength-1;
      var iv=r.inner.verb,ov=r.outer.verb,verb=span(text,iv.start+innerShift,iv.end+innerShift,'Verbo da relativa');
      var mainVerb=span(text,ov.start+outerShift,ov.end+outerShift,'Verbo da principal');
      var pronoun=span(text,que.start,que.end,'Relativo: sujeito'),end=ts[r.end-1].end;
      out.push(E.instruments.finding('relativas','PTBR-ORA-001',text,que.start,end,
        'Oração adjetiva restritiva: uma leitura possível.',
        '“'+text.slice(que.start,end)+'” delimita o antecedente “'+ante.snippet+'”. Nesta hipótese, “que” retoma “'+head.snippet+'” e é sujeito de “'+verb.snippet+'”.',
        'O antecedente integra o sujeito da principal, cujo verbo é “'+mainVerb.snippet+'”. A função do relativo foi verificada separadamente dentro da subordinada. Os dois predicados e uma única fronteira foram compatíveis com o recorte.',
        'A leitura restritiva considera o vínculo com o antecedente e a construção sem vírgulas; não corrige a pontuação nem presume a intenção do autor. Outros contextos ou sentidos podem exigir outra análise.',
        limit,source,{feature:'Oração adjetiva restritiva',analysisStatus:'contextual',relativeFunction:'sujeito',relativeType:'restritiva',nodeId:'rel-'+que.start,parentId:'periodo-'+ts[0].start,
          head:span(text,que.start,que.end,'Relativo: sujeito'),clause:span(text,ts[0].start,ts[ts.length-1].end,'Período examinado'),components:[pronoun,span(text,verb.start,verb.end,verb.role)],context:[ante,head,verb,mainVerb]}));
    });
    out.coverageInfo={version:version,scope:{start:0,end:cut.length,total:text.length,partial:partial},work:{characters:cut.length,tokens:Math.min(tokens.length,1600),maxCharacters:8000,maxTokens:1600},
      relatives:out.length,unsupported:unsupported,truncated:truncated,outputLimited:capped,
      summary:'Relativas: '+out.length+' ocorrência(s) no recorte inicial; '+unsupported+' segmento(s) sem decisão; '+truncated+' segmento(s) cortado(s). Somente relativas restritivas com que-sujeito e antecedente nominal sujeito da principal. Recorte 0–'+cut.length+' de '+text.length+' unidades UTF-16.'+(partial?' Exame parcial: selecione outro trecho para continuar.':'')+(capped?' Limite de apresentação atingido.':'')};
    return out;
  }
  E.relativeClauses={version:version,analyze:analyze};
  (E.extensions=E.extensions||[]).push(function(register){register({id:'relativas',analyze:analyze});});
  E.lensCatalog.push({id:'relativas',group:'Gramática',minimum:5,scope:limit});
}(typeof window!=='undefined'?window:this));
