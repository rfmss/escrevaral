/* Relações em construções simples. ES5; recebe texto, nunca o editor. */
(function (root) {
  'use strict';
  var E = root.Escr, D = E.grammarData, version = 'sintaxe-2-locucoes';
  var source = { title: 'Cunha e Cintra, 7ª ed., 2ª impressão, 2017, pp. 136–140, 145–152 e 154; Bechara, Lições de Português pela Análise Sintática, arquivo recebido, páginas PDF 22, 48, 75–76, 94–96 e 103. Terminologia tradicional; critérios computacionais locais, não algoritmos dos autores.', url: null };
  var groupSource={title:source.title+' Locuções: Cunha/Cintra, pp. 408–411; Bechara, páginas PDF 318, 322 e 340–343. Limites de auxiliaridade preservados.',url:null};
  var nouns = {}, articles = { o:['m','singular'], a:['f','singular'], os:['m','plural'], as:['f','plural'], um:['m','singular'], uma:['f','singular'], uns:['m','plural'], umas:['f','plural'] };
  function has(a, s) { return a.indexOf(s) >= 0; }
  function put(words, gender, number) { words.split(' ').forEach(function (w) { nouns['$' + w] = [gender, number]; }); }
  /* Flexões explícitas: não inferir número pelo último caractere. */
  put('livro menino homem escritor poema canto mar pão silêncio tempo fogo dia vento jogo sonho trabalho olho filho pagamento caminho', 'm', 'singular');
  put('livros meninos homens escritores poemas cantos pães silêncios tempos jogos sonhos trabalhos olhos filhos', 'm', 'plural');
  put('casa menina mulher escritora carta porta revista opinião rosa flor água mesa vida música notícia família noite cobra vizinha', 'f', 'singular');
  put('casas meninas mulheres escritoras cartas portas revistas opiniões rosas flores águas mesas vidas cobras vizinhas', 'f', 'plural');
  function span(text, a, b) { return { start:a, end:b, snippet:text.slice(a,b) }; }
  function parse(text, ts) {
    var n = ts.length, v, firstVerb, forms, lemma, subject, object, end = n, adv = -1, neg = -1, split, roles, group, verbEnd;
    if(n>24){return null;}
    function nominal(a, b, isSubject) {
      var p = a, article, noun, head, pronoun;
      if (b <= a) { return null; }
      pronoun = E.maturationData.subjects[ts[a].value];
      if (isSubject && b === a + 1 && pronoun) { return {head:a, person:pronoun[0], number:pronoun[1]}; }
      article = articles[ts[p].value]; if (article) { p++; }
      if (p >= b) { return null; }
      head = p; noun = nouns['$' + ts[p].value];
      if (!noun) {
        if (p === a && b === a + 1 && has(['ana','maria','joão','pedro'],ts[p].value) && /^[A-ZÀ-ÖØ-Þ]/.test(text.charAt(ts[p].start))) { return {head:p,person:3,number:'singular'}; }
        return null;
      }
      if (article && (article[0] !== noun[0] || article[1] !== noun[1])) { return null; }
      /* Um homógrafo sem determinante fica sem decisão neste recorte. */
      if (!article && E.contextualMorphology.readings(ts[p].value).classes.length > 1) { return null; }
      p++;
      if(!isSubject && p<b){return null;} /* Adjetivo pode ser predicativo do objeto. */
      if (b - p > 2) { return null; }
      for (; p < b; p++) { if (!has(D.classes.adjetivo,ts[p].value)) { return null; } }
      return {head:head,person:3,number:noun[1]};
    }
    /* A fronteira sujeito/verbo deve permitir a análise de todo o segmento. */
    var matches = [];
    for (v = 1; v < n; v++) {
      neg = ts[v-1].value === 'não' ? v-1 : -1; firstVerb = neg < 0 ? v : neg;
      subject = nominal(0, firstVerb, true); if (!subject) { continue; }
      forms = E.contextualMorphology.readings(ts[v].value).verbs.filter(function (f) { return f[1].indexOf('indicativo:') === 0 && f[2] === subject.person && f[3] === subject.number; });
      if (!forms.length) { continue; }
      lemma = forms[0][0]; if (forms.some(function (f) { return f[0] !== lemma; })) { continue; }
      group=E.verbGroups&&E.verbGroups.match(ts,v,lemma);verbEnd=group?group.last+1:v+1;
      if(group){lemma=group.lemma;}
      end = n; adv = -1;
      if (end > verbEnd && has(D.finalAdverbs, ts[end-1].value)) { adv=--end; }
      roles = [{key:'sujeito',role:'Sujeito',a:0,b:firstVerb,head:subject.head}, {key:'predicado',role:'Predicado',a:firstVerb,b:n}, {key:'verbo',role:group?'Locução verbal':'Núcleo verbal',a:v,b:verbEnd,head:group?group.main:v}];
      object = nominal(verbEnd,end,false);
      if (has(D.directVerbs,lemma) && object) {
        roles.push({key:'objeto',role:'Objeto direto',a:verbEnd,b:end,head:object.head});
      } else if (!group && has(D.linkingVerbs,lemma) && end === v+2 && has(D.classes.adjetivo,ts[v+1].value) && !has(['aberto','aberta','abertos','abertas'],ts[v+1].value)) {
        roles[2].role = 'Verbo de ligação';
        roles.push({key:'predicativo',role:'Predicativo do sujeito',a:v+1,b:end,head:v+1});
      } else if (lemma === 'dar') {
        split = -1;
        for (var j=verbEnd+1;j<end;j++) { if (ts[j].value === 'a') { if (split >= 0) { split=-2; break; } split=j; } }
        object = split >= 0 && nominal(verbEnd,split,false);
        var indirect = split >= 0 && nominal(split+1,end,false);
        if (!object || !indirect) { continue; }
        roles.push({key:'objeto',role:'Objeto direto',a:verbEnd,b:split,head:object.head});
        roles.push({key:'indireto',role:'Objeto indireto',a:split,b:end,head:indirect.head});
      } else if (!((has(D.intransitiveVerbs,lemma) || has(['chegar','terminar'],lemma)) && end === verbEnd)) { continue; }
      if (neg >= 0) { roles.push({key:'negacao',role:'Negação',a:neg,b:neg+1,head:neg}); }
      if (adv >= 0) { roles.push({key:'adjunto',role:'Adjunto adverbial',a:adv,b:adv+1,head:adv}); }
      matches.push({roles:roles,verb:v,verbEnd:verbEnd,lemma:lemma,forms:forms,group:group||null});
    }
    return matches.length === 1 ? matches[0] : null;
  }
  function analyze(text, cap) {
    if (typeof text !== 'string') { throw new Error('A análise precisa receber texto.'); }
    cap = typeof cap === 'number' && cap > 0 ? Math.min(100,Math.floor(cap)) : 100;
    var cut = text.slice(0,8000), tokens = E.reading.tokens(cut), partial = cut.length < text.length;
    if (tokens.length > 1600) { cut=cut.slice(0,tokens[1600].start); partial=true; }
    var clean=E.protectedText(cut), segments=E.reading.sentences(cut), out=[], analyzed=0, skipped=0, truncated=0, capped=false, groups=0;
    var limit='Hipótese tradicional para construção inteira em ordem direta, sujeito explícito e indicativo compatível, isolado ou auxiliar em padrão delimitado: estar + gerúndio/a + infinitivo, ter/haver + particípio, ir + infinitivo. Não resolve passiva, cadeias de auxiliares, modais, elipse, inversão, clíticos, coordenação ou subordinação. Ausência de leitura não indica erro. Até 8.000 unidades UTF-16 e 1.600 tokens; segmentos cortados não são analisados.';
    segments.forEach(function (segment) {
      var raw=cut.slice(segment.start,segment.end), stop=segment.end;
      var tail=cut.slice(segment.end), completeBoundary=/[\r\n]/.test(tail) || /[.!?…;]$/.test(raw) && (segment.end<cut.length || /^[\s.!?…;]/.test(text.charAt(cut.length)));
      if (partial && /^\s*$/.test(tail) && !completeBoundary) { truncated++; return; }
      if (raw.length>1000 || clean.slice(segment.start,segment.end)!==raw) { skipped++; return; }
      var terminal=raw.match(/[.!?…;]+\s*$/);
      if (terminal) { stop=segment.start+terminal.index; }
      var ts=E.reading.tokens(cut.slice(segment.start,stop));
      if (!ts.length) { return; }
      ts.forEach(function (t) { t.start+=segment.start; t.end+=segment.start; });
      var usable=/^\s*$/.test(cut.slice(segment.start,ts[0].start)) && /^\s*$/.test(cut.slice(ts[ts.length-1].end,stop));
      for(var j=1;j<ts.length;j++){if(!/^[ \t\u00a0]+$/.test(cut.slice(ts[j-1].end,ts[j].start))){usable=false;}}
      var result=usable && parse(cut,ts);
      if(!result){skipped++;return;}
      /* Nunca entregar metade das relações de uma construção. */
      if(out.length+result.roles.length>cap){capped=true;return;}
      analyzed++;
      if(result.group){groups++;}
      var id='sin-'+ts[0].start, verb=ts[result.verb], clause=span(text,ts[0].start,ts[ts.length-1].end);
      var verbText=text.slice(verb.start,ts[result.verbEnd-1].end);
      var edges=[{from:id+'-sujeito',to:id+'-verbo',type:'sujeito-verbo',label:'sujeito ↔ verbo'}];
      result.roles.forEach(function(p){if(has(['objeto','indireto','predicativo','adjunto','negacao'],p.key)){edges.push({from:id+'-verbo',to:id+'-'+p.key,type:p.key,label:'verbo ↔ '+p.role.toLowerCase()});}});
      result.roles.forEach(function(p){
        var a=ts[p.a].start,b=ts[p.b-1].end,head=typeof p.head==='number'?span(text,ts[p.head].start,ts[p.head].end):null;
        var subjectText=text.slice(ts[0].start,ts[result.roles[0].b-1].end), predText=text.slice(ts[result.roles[1].a].start,clause.end);
        var explanations={
          sujeito:'“'+subjectText+'” é o grupo sobre o qual esta construção declara “'+predText+'”. Seu núcleo é “'+text.slice(ts[result.roles[0].head].start,ts[result.roles[0].head].end)+'”; há uma forma verbal compatível em pessoa e número.',
          predicado:'O predicado reúne o que esta oração declara a respeito de “'+subjectText+'”, incluindo o verbo e os termos que o acompanham.',
          verbo:result.group?'“'+verbText+'” funciona como um grupo verbal nesta hipótese. “'+text.slice(verb.start,verb.end)+'” é o auxiliar flexionado; “'+text.slice(ts[result.group.main].start,ts[result.group.main].end)+'” é o principal no '+result.group.form+'. As duas formas não são contadas como duas orações.':p.role==='Verbo de ligação'?'“'+verb.value+'” liga o sujeito ao predicativo nesta construção; não é apresentado como núcleo de um predicado verbal.':'“'+verb.value+'” organiza o predicado nesta leitura. O sujeito e os complementos são identificados em relação a esse uso.',
          objeto:'“'+text.slice(a,b)+'” completa o emprego de “'+verbText+'” sem preposição necessária nesta construção. A leitura não se baseia apenas em vir depois do verbo.',
          indireto:'“'+text.slice(a,b)+'” completa, com a preposição a, o destinatário de dar nesta construção.',
          predicativo:'“'+text.slice(a,b)+'” atribui uma característica ao sujeito por meio do verbo de ligação.',
          negacao:'“'+text.slice(a,b)+'” nega o predicado; pertence ao grupo do predicado.',
          adjunto:'“'+text.slice(a,b)+'” acrescenta uma circunstância ao predicado; não recebe o rótulo de objeto direto.'
        };
        var ruleIds={sujeito:'001',predicado:'002',verbo:'003',objeto:'004',indireto:'005',predicativo:'006',negacao:'007',adjunto:'008'};
        var components=[];
        if(result.group&&p.key==='verbo'){
          components=[span(text,verb.start,verb.end),span(text,ts[result.group.main].start,ts[result.group.main].end)];components[0].role='Auxiliar';components[1].role='Principal';
          if(result.group.connector!==null){var ct=ts[result.group.connector],cs=span(text,ct.start,ct.end);cs.role='Preposição';components.splice(1,0,cs);}
        }
        out.push(E.instruments.finding('sintaxe',result.group&&p.key==='verbo'?'PTBR-LOC-001':'PTBR-REL-'+ruleIds[p.key],text,a,b,p.role+': uma leitura possível.',explanations[p.key],
          'A construção inteira foi compatível com o recorte. Os vínculos representam esta hipótese, não uma árvore sintática geral.',
          'O contexto discursivo e outros sentidos podem mudar a leitura. Sujeito não é necessariamente quem pratica uma ação. Auxiliaridade depende da abordagem e do contexto; não se deduz voz passiva da presença de duas formas. A compatibilidade formal não certifica correção nem intenção.',limit,result.group?groupSource:source,
          {feature:p.role,analysisStatus:'contextual',nodeId:id+'-'+p.key,parentId:p.key==='sujeito'||p.key==='predicado'?id:id+'-predicado',
            clause:span(text,clause.start,clause.end),head:head,relations:edges.map(function(e){return{from:e.from,to:e.to,type:e.type,label:e.label};}),
            components:components,groupKind:result.group&&p.key==='verbo'?result.group.kind:null,
            context:[span(text,verb.start,ts[result.verbEnd-1].end)],compatibleVerbs:result.forms.map(function(f){return f.slice();})}));
      });
    });
    out.coverageInfo={version:version,scope:{start:0,end:cut.length,total:text.length,partial:partial},work:{characters:cut.length,tokens:Math.min(tokens.length,1600),maxCharacters:8000,maxTokens:1600},
      constructions:analyzed,verbGroups:groups,unsupported:skipped,truncated:truncated,outputLimited:capped,
      summary:'Relações sintáticas: '+analyzed+' construção(ões) com leitura; '+groups+' locução(ões) verbal(is); '+skipped+' segmento(s) fora da cobertura; '+truncated+' segmento(s) cortado(s) sem leitura. Recorte 0–'+cut.length+' de '+text.length+' unidades UTF-16.'+(partial?' Análise parcial: selecione outro trecho para continuar.':'')+(capped?' Limite de apresentação atingido; nenhuma construção foi dividida.':'')};
    return out;
  }
  E.syntaxRelations={version:version,analyze:analyze};
}(typeof window !== 'undefined' ? window : this));
