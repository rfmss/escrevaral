/* Classes em contexto, incremento 1. ES5; sem DOM, rede ou escrita no manuscrito. */
(function (root) {
  'use strict';
  var E = root.Escr, own = Object.prototype.hasOwnProperty;
  var version = 'contexto-12-numerais', maxChars = 8000, maxTokens = 1600;
  var source = { title: 'Cunha e Cintra, Nova gramática do português contemporâneo, 7ª ed., 2ª impressão, 2017: pp. 191, 219, 289, 314 e 394. Regras computacionais locais de alcance restrito; não são algoritmos da obra.', url: null };
  var extraNouns = ['cobra', 'cobras', 'jogo', 'jogos', 'sonho', 'sonhos', 'trabalho', 'trabalhos', 'olho', 'olhos', 'filho', 'filhos', 'vizinha', 'vizinhas', 'pagamento', 'caminho'];
  var extraForms = {
    '$cobra': [['cobrar', 'indicativo:presente', 3, 'singular']],
    '$cobro': [['cobrar', 'indicativo:presente', 1, 'singular']],
    '$jogo': [['jogar', 'indicativo:presente', 1, 'singular']],
    '$sonho': [['sonhar', 'indicativo:presente', 1, 'singular']],
    '$chegou': [['chegar', 'indicativo:pretérito perfeito', 3, 'singular']],
    '$chegaram': [['chegar', 'indicativo:pretérito perfeito', 3, 'plural'], ['chegar', 'indicativo:pretérito mais-que-perfeito', 3, 'plural']],
    '$terminou': [['terminar', 'indicativo:pretérito perfeito', 3, 'singular']],
    '$atravessou': [['atravessar', 'indicativo:pretérito perfeito', 3, 'singular']]
  };
  var subjects = { '$eu': [1, 'singular'], '$tu': [2, 'singular'], '$ele': [3, 'singular'], '$ela': [3, 'singular'], '$você': [3, 'singular'], '$nós': [1, 'plural'], '$vós': [2, 'plural'], '$eles': [3, 'plural'], '$elas': [3, 'plural'], '$vocês': [3, 'plural'] };
  var articles = ['o', 'a', 'os', 'as'];
  var nominalArticles=articles.concat(['um','uma','uns','umas']);
  var articleFeatures={um:['Masc','Sing'],uma:['Fem','Sing'],uns:['Masc','Plur'],umas:['Fem','Plur'],o:['Masc','Sing'],a:['Fem','Sing'],os:['Masc','Plur'],as:['Fem','Plur']};
  var contractions={do:'o',da:'a',dos:'os',das:'as'};
  var featurePatterns={Gender:/(?:^|\|)Gender=([^|]+)(?:\||$)/,Number:/(?:^|\|)Number=([^|]+)(?:\||$)/,NumType:/(?:^|\|)NumType=([^|]+)(?:\||$)/};
  function has(list, word) { return list.indexOf(word) >= 0; }
  function readings(word) {
    var w = E.reading.canonical(word), r = E.grammar.readings(w), more = extraForms['$' + w] || [];
    if (has(extraNouns, w) && !has(r.classes, 'substantivo')) { r.classes.push('substantivo'); }
    if (more.length) { r.verbs = r.verbs.concat(more); if (!has(r.classes, 'verbo')) { r.classes.push('verbo'); } }
    return r;
  }
  /* A sintaxe/relativas ainda usam readings() legado. A ampliação entra só nesta lente. */
  function lexicalReadings(word) {
    var w=E.reading.canonical(word),r=readings(w),external=E.lookupMorphology?E.lookupMorphology(w):[],i,cls;
    var classes={NOUN:'substantivo',VERB:'verbo',AUX:'verbo',ADJ:'adjetivo',ADV:'advérbio',ADP:'preposição',CCONJ:'conjunção',SCONJ:'conjunção',PRON:'pronome',NUM:'numeral',INTJ:'interjeição'};
    r.portilexicon=external;
    if(own.call(contractions,w)){r.classes.push('contração (preposição + artigo)');}
    for(i=0;i<external.length;i++){
      cls=external[i].pos==='DET'?(/(?:^|\|)PronType=Art(?:\||$)/.test(external[i].features)?'artigo':'determinante (UD)'):classes[external[i].pos];
      if(cls&&!has(r.classes,cls)){r.classes.push(cls);}
    }
    return r;
  }
  function externalFinite(r, agreement) {
    var out=[],rows=r.portilexicon||[],i,row,features,mood,number,person,tense;
    for(i=0;i<rows.length;i++){
      row=rows[i];if(row.pos!=='VERB'&&row.pos!=='AUX'){continue;}
      features='|'+row.features+'|';
      if(features.indexOf('|VerbForm=Fin|')<0){continue;}
      mood=/\|Mood=(Ind|Sub)\|/.exec(features);number=/\|Number=(Sing|Plur)\|/.exec(features);person=/\|Person=([123])\|/.exec(features);
      if(!mood||!number||!person){continue;}
      number=number[1]==='Sing'?'singular':'plural';person=Number(person[1]);
      if(agreement&&(person!==agreement[0]||number!==agreement[1])){continue;}
      tense=/\|Tense=([^|]+)\|/.exec(features);
      var candidate=[row.lemma,(mood[1]==='Ind'?'indicativo':'subjuntivo')+':UD-'+(tense?tense[1]:'sem-tempo'),person,number];
      /* AUX/VERB não escolhem função no contexto nem duplicam a mesma flexão. */
      if(!out.some(function(v){return v.join('|')===candidate.join('|');})){out.push(candidate);}
    }
    return out;
  }
  function finite(r, agreement) {
    return r.verbs.filter(function (v) {
      return /^(indicativo|subjuntivo):/.test(v[1]) && (!agreement || v[2] === agreement[0] && v[3] === agreement[1]);
    }).concat(externalFinite(r,agreement));
  }
  function feature(row,name){var m=featurePatterns[name].exec(row.features);return m?m[1].split(','):[];}
  function nounAgreement(r,article){
    var expected=articleFeatures[article],rows=r.portilexicon||[],i;
    for(i=0;i<rows.length;i++){
      if(rows[i].pos==='NOUN'&&has(feature(rows[i],'Gender'),expected[0])&&has(feature(rows[i],'Number'),expected[1])){return true;}
    }
    return false;
  }
  function nominalAgreement(noun, adjective, article) {
    var expected=articleFeatures[article];
    var ns=noun.portilexicon||[],adjs=adjective.portilexicon||[],i,j,n,a,g;
    for(i=0;i<ns.length;i++){
      n=ns[i];if(n.pos!=='NOUN'||!has(feature(n,'Gender'),expected[0])||!has(feature(n,'Number'),expected[1])){continue;}
      for(j=0;j<adjs.length;j++){
        a=adjs[j];if(a.pos!=='ADJ'||!has(feature(a,'Number'),expected[1])){continue;}
        g=feature(a,'Gender');if(g.length&&!has(g,expected[0])){continue;}
        return {gender:expected[0],number:expected[1],adjectiveGenderMarked:!!g.length};
      }
    }
    return null;
  }
  function pronominalReadings(r,pos){
    return r.portilexicon.filter(function(row){
      return row.pos===pos&&(/(?:^|\|)Poss=Yes(?:\||$)/.test(row.features)||/(?:^|\|)PronType=Dem(?:\||$)/.test(row.features));
    });
  }
  function determinerReadings(r){return pronominalReadings(r,'DET');}
  function determinerAgreement(dets,noun,article){
    var expected=article?articleFeatures[article]:null,rows=noun.portilexicon,i,j,g,n,a,b;
    for(i=0;i<dets.length;i++){
      g=feature(dets[i],'Gender');n=feature(dets[i],'Number');
      for(j=0;j<rows.length;j++){
        if(rows[j].pos!=='NOUN'){continue;}
        for(a=0;a<g.length;a++){for(b=0;b<n.length;b++){
          if(expected&&(expected[0]!==g[a]||expected[1]!==n[b])){continue;}
          if(has(feature(rows[j],'Gender'),g[a])&&has(feature(rows[j],'Number'),n[b])){
            return {kind:/(?:^|\|)Poss=Yes(?:\||$)/.test(dets[i].features)?'possessivo':'demonstrativo',gender:g[a],number:n[b],sourcePos:'DET'};
          }
        }}
      }
    }
    return null;
  }
  function inspect(text) {
    if (typeof text !== 'string') { throw new Error('A análise precisa receber texto.'); }
    var cut = text.slice(0, maxChars), clean = E.protectedText(cut), ts = E.reading.tokens(clean), i, j, k, r, forms, clitic, agreement;
    /* Um token ou contexto truncado não pode produzir leitura contextual. */
    if (cut.length < text.length && ts.length && ts[ts.length - 1].end === cut.length && /[A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f0-9'’\-]/.test(text.charAt(cut.length))) {
      cut = cut.slice(0, ts.pop().start); clean = clean.slice(0, cut.length);
    }
    if (ts.length > maxTokens) { ts = ts.slice(0, maxTokens); cut = cut.slice(0, ts[ts.length - 1].end); clean = clean.slice(0, cut.length); }
    function linked(a, b) { return a >= 0 && b < ts.length && b === a + 1 && /^[ \t\u00a0]+$/.test(text.slice(ts[a].end, ts[b].start)); }
    var blockedNominal = {}, items = ts.map(function (t) {
      var possible = lexicalReadings(t.value);
      return { start: t.start, end: t.end, snippet: text.slice(t.start, t.end), candidates: possible,
        status: possible.classes.length > 1 ? 'ambiguo' : possible.classes.length ? 'lexical' : 'desconhecido',
        selected: null, rule: null, evidence: [] };
    });
    function choose(at, cls, id, evidence, candidates) {
      items[at].status = 'contextual'; items[at].selected = cls; items[at].rule = id;
      items[at].evidence = evidence.map(function (n) { return { start: ts[n].start, end: ts[n].end, snippet: text.slice(ts[n].start, ts[n].end) }; });
      if (candidates) { items[at].compatibleVerbs = candidates; }
    }
    /* Pronome sujeito + [não] + [o/a/os/as] + forma finita compatível. */
    for (i = 0; i < ts.length; i += 1) {
      agreement = subjects['$' + ts[i].value]; if (!agreement) { continue; }
      j = i + 1; clitic = -1; var negativeAt = -1;
      if (!linked(i, j)) { continue; }
      if (ts[j].value === 'não') { negativeAt = j; j += 1; if (!linked(j - 1, j)) { continue; } }
      if (has(articles, ts[j].value)) { clitic = j; j += 1; if (!linked(j - 1, j)) { continue; } }
      forms = finite(items[j].candidates, agreement);
      if (!forms.length) { continue; }
      choose(j, 'verbo', 'PTBR-CTX-001', [i, j], forms);
      if (clitic >= 0) { choose(clitic, 'pronome', 'PTBR-CTX-003', [i, clitic, j]); }
      /* Não pré-verbal: compõe o apoio já reconhecido, sem decidir alcance. */
      if(negativeAt>=0&&unitStart(i)&&forms.some(function(form){return /^indicativo:/.test(form[1]);})&&items[negativeAt].candidates.portilexicon.some(function(row){return row.pos==='ADV';})){
        var negativeSupport=clitic>=0?[i,negativeAt,clitic,j]:[i,negativeAt,j];
        choose(negativeAt,'advérbio','PTBR-CTX-014',negativeSupport);
        items[negativeAt].negation={kind:'preverbal',resolution:'hypothesis',scopeResolved:false};
      }
    }
    /* Possessivo/demonstrativo + nome contíguo; artigo definido opcional.
     * DET é a categoria da fonte, sem converter automaticamente todo pronome. */
    for(i=0;i<ts.length;i++){
      var dets=determinerReadings(items[i].candidates);
      if(!dets.length){continue;}
      var previousArticle=i>0&&linked(i-1,i)&&has(articles,ts[i-1].value)?i-1:-1;
      /* O meu / a minha não viram nome por fallback quando falta o núcleo. */
      if(previousArticle>=0){blockedNominal[previousArticle]=true;}
      j=i+1;
      if(!linked(i,j)||items[i].status==='contextual'||items[j].status==='contextual'||previousArticle>=0&&items[previousArticle].status==='contextual'){continue;}
      r=items[j].candidates;
      /* Não também é NOUN no léxico. Antes de verbo finito (clítico opcional),
       * conservar a leitura aberta/negativa em vez de criar um nome por DET. */
      var negativeVerbAt=j+1;
      if(linked(j,negativeVerbAt)&&has(articles,ts[negativeVerbAt].value)){negativeVerbAt++;}
      if(ts[j].value==='não'&&has(r.classes,'advérbio')&&linked(j,j+1)&&linked(negativeVerbAt-1,negativeVerbAt)&&finite(items[negativeVerbAt].candidates).length){continue;}
      /* Minha velha casa: não escolher o adjetivo como nome intermediário. */
      if(has(r.classes,'adjetivo')&&linked(j,j+1)&&has(items[j+1].candidates.classes,'substantivo')){continue;}
      var detMatch=determinerAgreement(dets,r,previousArticle>=0?ts[previousArticle].value:null);
      if(!detMatch){continue;}
      var detSupport=previousArticle>=0?[previousArticle,i,j]:[i,j];
      choose(i,'determinante (UD)','PTBR-CTX-008',detSupport);
      choose(j,'substantivo','PTBR-CTX-008',detSupport);
      items[i].nominalDeterminer=detMatch;items[j].nominalDeterminer=detMatch;
      if(previousArticle>=0){choose(previousArticle,'artigo','PTBR-CTX-008',detSupport);items[previousArticle].nominalDeterminer=detMatch;}
    }
    /* Sem nome expresso: início do recorte ou após .!?;:.
     * Demonstrativo admite hipótese PRON; artigo + possessivo registra a incerteza. */
    function unitStart(at){
      var gap=text.slice(at?ts[at-1].end:0,ts[at].start);
      return at===0?/^[ \t\r\n\u00a0]*$/.test(gap):/[.!?;:][ \t\r\n\u00a0]*$/.test(gap);
    }
    for(i=0;i<ts.length;i++){
      if(items[i].status==='contextual'){continue;}
      var pronouns=pronominalReadings(items[i].candidates,'PRON');
      if(!pronouns.length){continue;}
      var preceding=i>0&&linked(i-1,i)&&has(articles,ts[i-1].value)?i-1:-1;
      if(!unitStart(preceding>=0?preceding:i)){continue;}
      if(preceding>=0&&items[preceding].status==='contextual'){continue;}
      j=i+1;
      if(!linked(i,j)){continue;}
      var negative=ts[j].value==='não';
      if(negative){j++;if(!linked(j-1,j)){continue;}}
      if(has(items[j].candidates.classes,'substantivo')||items[j].status==='contextual'){continue;}
      for(var pi=0;pi<pronouns.length;pi++){
        var row=pronouns[pi],poss=/(?:^|\|)Poss=Yes(?:\||$)/.test(row.features);
        if(poss?preceding<0:preceding>=0){continue;}
        var nums=feature(row,'Number');
        for(var ni=0;ni<nums.length;ni++){
          if(nums[ni]!=='Sing'&&nums[ni]!=='Plur'){continue;}
          if(poss&&(articleFeatures[ts[preceding].value][1]!==nums[ni]||!has(feature(row,'Gender'),articleFeatures[ts[preceding].value][0]))){continue;}
          forms=finite(items[j].candidates,[3,nums[ni]==='Sing'?'singular':'plural']);
          if(!forms.length){continue;}
          var useSupport=preceding>=0?[preceding,i]:[i];
          if(negative){useSupport.push(i+1);}useSupport.push(j);
          if(poss){
            items[i].status='ambiguo';items[i].rule='PTBR-CTX-010';
            items[i].evidence=useSupport.map(function(at){return {start:ts[at].start,end:ts[at].end,snippet:text.slice(ts[at].start,ts[at].end)};});
          }else{choose(i,'pronome','PTBR-CTX-009',useSupport);}
          items[i].standaloneUse={kind:poss?'possessivo':'demonstrativo',resolution:poss?'open':'hypothesis',number:nums[ni],referenceResolved:false};
          break;
        }
        if(items[i].standaloneUse){break;}
      }
    }
    /* Grupo de três palavras: artigo + nome/adjetivo, nas duas ordens.
     * As duas ordens possíveis ou verbo finito no lugar do adjetivo impedem decisão. */
    for(i=0;i+2<ts.length;i++){
      if(blockedNominal[i]||!has(nominalArticles,ts[i].value)||!linked(i,i+1)||!linked(i+1,i+2)){continue;}
      if(items[i].status==='contextual'||items[i+1].status==='contextual'||items[i+2].status==='contextual'){continue;}
      var left=items[i+1].candidates,right=items[i+2].candidates;
      var post=has(left.classes,'substantivo')&&has(right.classes,'adjetivo');
      var pre=has(left.classes,'adjetivo')&&has(right.classes,'substantivo');
      if(!post&&!pre){continue;}
      if(post&&pre){blockedNominal[i]=true;items[i].nominalAmbiguity=true;items[i+1].nominalAmbiguity=true;items[i+2].nominalAmbiguity=true;continue;}
      var nounAt=post?i+1:i+2,adjAt=post?i+2:i+1;
      if(finite(items[adjAt].candidates).length){continue;}
      var match=nominalAgreement(items[nounAt].candidates,items[adjAt].candidates,ts[i].value);
      if(!match){continue;}
      choose(i,'artigo','PTBR-CTX-006',[i,nounAt,adjAt]);
      choose(nounAt,'substantivo','PTBR-CTX-006',[i,nounAt,adjAt]);
      choose(adjAt,'adjetivo','PTBR-CTX-006',[i,nounAt,adjAt]);
      items[i].nominalAgreement=match;items[nounAt].nominalAgreement=match;items[adjAt].nominalAgreement=match;
    }
    /* Compõe dois grupos já resolvidos por 006, apenas na ordem artigo/nome/adjetivo.
     * Exige gênero explícito também no adjetivo; homógrafos verbais, inclusive
     * particípios, ficam em aberto. Sete tokens e limites completos, sem parser. */
    for(i=0;i+6<ts.length;i++){
      if(!has(['e','ou'],ts[i+3].value)||!unitStart(i)||!unitEnd(i+6)){continue;}
      var modifiedSupport=[],modifiedBlocked=false;
      for(k=i;k<=i+6;k++){
        modifiedSupport.push(k);
        if(blockedNominal[k]||k>i&&!linked(k-1,k)){modifiedBlocked=true;}
        if(k===i+3?items[k].status==='contextual':items[k].rule!=='PTBR-CTX-006'){modifiedBlocked=true;}
      }
      if(modifiedBlocked){continue;}
      for(j=i;j<=i+4;j+=4){
        if(items[j].selected!=='artigo'||items[j+1].selected!=='substantivo'||items[j+2].selected!=='adjetivo'||
          !items[j].nominalAgreement.adjectiveGenderMarked||has(items[j+2].candidates.classes,'verbo')){modifiedBlocked=true;}
      }
      if(modifiedBlocked){continue;}
      for(k=i;k<=i+6;k++){
        var modifiedRole=k===i+3?'conectivo':k===i||k===i+4?'artigo':k===i+2||k===i+6?'modificador':'constituinte';
        choose(k,modifiedRole==='conectivo'?'conjunção':items[k].selected,'PTBR-CTX-013',modifiedSupport);
        items[k].nominalCoordination={connector:ts[i+3].value,role:modifiedRole,articles:true,postposedAdjectives:true,featuresChecked:true,resolution:'hypothesis',syntaxResolved:false};
      }
    }
    /* Artigo + nome + de/[artigo] ou contração + nome + apoio finito.
     * Janela de 5/6 tokens; não atravessa modificadores nem escolhe vínculo sintático. */
    for(i=0;i+4<ts.length;i++){
      if(!has(nominalArticles,ts[i].value)||blockedNominal[i]||!nounAgreement(items[i+1].candidates,ts[i].value)){continue;}
      var bridge=i+2,tail=bridge+1,tailArticle=null,articleAt=-1;
      if(own.call(contractions,ts[bridge].value)){tailArticle=contractions[ts[bridge].value];}
      else if(ts[bridge].value==='de'){
        if(has(nominalArticles,ts[tail].value)){articleAt=tail;tailArticle=ts[tail].value;tail++;}
      }else{continue;}
      var after=tail+1,connected=true,occupied=false,support=[];
      if(after>=ts.length){continue;}
      for(k=i;k<=after;k++){
        support.push(k);
        if(k>i&&!linked(k-1,k)){connected=false;}
        if(k<after&&items[k].status==='contextual'){occupied=true;}
      }
      if(!connected||occupied){continue;}
      var tailReadings=items[tail].candidates;
      if(!has(tailReadings.classes,'substantivo')){continue;}
      var tailHasRows=tailReadings.portilexicon.some(function(row){return row.pos==='NOUN';});
      if(tailArticle&&tailHasRows&&!nounAgreement(tailReadings,tailArticle)){continue;}
      /* Sem traços externos, só aceitar nome lexical sem alternativa verbal. */
      if(!tailHasRows&&(tailReadings.classes.length!==1||finite(tailReadings).length)){continue;}
      agreement=[3,articleFeatures[ts[i].value][1]==='Sing'?'singular':'plural'];
      forms=finite(items[after].candidates,agreement);
      if(!forms.length||has(items[after].candidates.classes,'substantivo')){continue;}
      var details={introducedBy:ts[bridge].value,headFeaturesChecked:true,complementFeaturesChecked:!!tailArticle&&tailHasRows};
      choose(i,'artigo','PTBR-CTX-007',support);
      choose(i+1,'substantivo','PTBR-CTX-007',support);
      choose(bridge,tailArticle&&articleAt<0?'contração (preposição + artigo)':'preposição','PTBR-CTX-007',support);
      if(articleAt>=0){choose(articleAt,'artigo','PTBR-CTX-007',support);}
      choose(tail,'substantivo','PTBR-CTX-007',support);
      for(k=i;k<=tail;k++){items[k].nominalComplement=details;}
    }
    /* Dois constituintes artigo + nome, separados por e/ou. Janela de cinco
     * tokens, completa e sem modificadores. Traços conferidos em cada par,
     * nunca entre os dois núcleos. Não decide concordância do conjunto.
     * Dois artigos definidos com duas classes nominais não exclusivas ficam
     * em aberto (o canto e o trabalho também admite leitura com clíticos). */
    for(i=0;i+4<ts.length;i++){
      if(!has(nominalArticles,ts[i].value)||!has(['e','ou'],ts[i+2].value)||!has(nominalArticles,ts[i+3].value)||!unitStart(i)||!unitEnd(i+4)){continue;}
      var coordSupport=[],coordBlocked=false;
      for(k=i;k<=i+4;k++){
        coordSupport.push(k);
        if(items[k].status==='contextual'||blockedNominal[k]||k>i&&!linked(k-1,k)){coordBlocked=true;}
      }
      if(coordBlocked||!nounAgreement(items[i+1].candidates,ts[i].value)||!nounAgreement(items[i+4].candidates,ts[i+3].value)){continue;}
      if(has(articles,ts[i].value)&&has(articles,ts[i+3].value)&&items[i+1].candidates.classes.length!==1&&items[i+4].candidates.classes.length!==1){continue;}
      for(k=i;k<=i+4;k++){
        var coordRole=k===i+2?'conectivo':k===i||k===i+3?'artigo':'constituinte';
        choose(k,coordRole==='conectivo'?'conjunção':coordRole==='artigo'?'artigo':'substantivo','PTBR-CTX-012',coordSupport);
        items[k].nominalCoordination={connector:ts[i+2].value,role:coordRole,articles:true,featuresChecked:true,resolution:'hypothesis',syntaxResolved:false};
      }
    }
    /* Cardinal + nome plural: unidade completa, inventário nominal delimitado.
     * NumType não é Number: a pluralidade vem apenas do NOUN da fonte.
     * Homógrafos ficam no resultado; nenhum valor ou função sintática é atribuído. */
    for(i=0;i+1<ts.length;i++){
      if(!has(['dois','duas','três'],ts[i].value)||!linked(i,i+1)||!unitStart(i)||!unitEnd(i+1)){continue;}
      if(items[i].status==='contextual'||items[i+1].status==='contextual'||blockedNominal[i]||blockedNominal[i+1]){continue;}
      var numeralRows=items[i].candidates.portilexicon,numberNouns=items[i+1].candidates.portilexicon,numeralMatch=null,ni,nj;
      for(ni=0;ni<numeralRows.length;ni++){
        if(numeralRows[ni].pos!=='NUM'||!has(feature(numeralRows[ni],'NumType'),'Card')){continue;}
        var numeralGender=feature(numeralRows[ni],'Gender');
        for(nj=0;nj<numberNouns.length;nj++){
          var numberNoun=numberNouns[nj];
          if(numberNoun.pos!=='NOUN'||!has(['livro','casa','jardim','flor','mesa','mulher','homem'],numberNoun.lemma)||!has(feature(numberNoun,'Number'),'Plur')){continue;}
          if(numeralGender.length&&!numeralGender.some(function(g){return has(feature(numberNoun,'Gender'),g);})){continue;}
          numeralMatch={numType:'Card',nounNumber:'Plur',numeralGenderMarked:!!numeralGender.length,resolution:'hypothesis',syntaxResolved:false,quantityResolved:false};
          break;
        }
        if(numeralMatch){break;}
      }
      if(!numeralMatch){continue;}
      choose(i,'numeral','PTBR-CTX-015',[i,i+1]);
      choose(i+1,'substantivo','PTBR-CTX-015',[i,i+1]);
      items[i].nominalNumeral=numeralMatch;items[i+1].nominalNumeral=numeralMatch;
    }
    /* Artigo definido + nome conhecido. Homógrafo verbal requer contexto à direita. */
    for (i = 0; i + 1 < ts.length; i += 1) {
      if (blockedNominal[i] || !has(articles, ts[i].value) || items[i].status === 'contextual' || !linked(i, i + 1)) { continue; }
      j = i + 1; r = items[j].candidates;
      if (!has(r.classes, 'substantivo') || has(E.grammarData.nonFinite, ts[j].value) || items[j].status === 'contextual') { continue; }
      if (finite(r).length) {
        k = j + 1;
        if (!linked(j, k) || !finite(items[k].candidates).length || has(items[k].candidates.classes, 'substantivo')) { continue; }
        /* Não transformar a sequência eu o canto em um grupo nominal. */
        if (i > 0 && linked(i - 1, i) && own.call(subjects, '$' + ts[i - 1].value)) { continue; }
      }
      choose(i, 'artigo', 'PTBR-CTX-002', [i, j]);
      choose(j, 'substantivo', 'PTBR-CTX-002', finite(r).length ? [i, j, j + 1] : [i, j]);
    }
    /* Par nominal completo: nome + e/ou + nome, sem modificadores.
     * Um dos nomes precisa ter apenas a classe nominal no inventário.
     * Não encadear pares, absorver orações ou sobrescrever regras anteriores. */
    function unitEnd(at){
      var gap=text.slice(ts[at].end,at+1<ts.length?ts[at+1].start:cut.length);
      return /^[ \t\u00a0]*[.!?;:]/.test(gap)||at===ts.length-1&&cut.length===text.length&&/^[ \t\r\n\u00a0]*$/.test(gap);
    }
    for(i=0;i+2<ts.length;i++){
      if(!has(['e','ou'],ts[i+1].value)||!linked(i,i+1)||!linked(i+1,i+2)||!unitStart(i)||!unitEnd(i+2)){continue;}
      if(items[i].status==='contextual'||items[i+1].status==='contextual'||items[i+2].status==='contextual'){continue;}
      var first=items[i].candidates,last=items[i+2].candidates;
      var firstNoun=first.portilexicon.some(function(row){return row.pos==='NOUN';});
      var lastNoun=last.portilexicon.some(function(row){return row.pos==='NOUN';});
      if(!firstNoun||!lastNoun||first.classes.length!==1&&last.classes.length!==1){continue;}
      for(k=i;k<=i+2;k++){
        choose(k,k===i+1?'conjunção':'substantivo','PTBR-CTX-011',[i,i+1,i+2]);
        items[k].nominalCoordination={connector:ts[i+1].value,role:k===i+1?'conectivo':'constituinte',resolution:'hypothesis',syntaxResolved:false};
      }
    }
    /* Preserva a regra de infinitivos já existente, com sua fonte histórica. */
    for (i = 0; i < ts.length; i += 1) {
      if (items[i].status === 'contextual' || !E.infinitiveCandidates) { continue; }
      forms = E.infinitiveCandidates(ts, i, text);
      if (forms.length) { choose(i, 'verbo', 'PTBR-CTX-005', [i - 1, i], forms); }
    }
    return { version: version, items: items, scope: { start: 0, end: cut.length, total: text.length, partial: cut.length < text.length },
      work: { characters: cut.length, tokens: ts.length, maxCharacters: maxChars, maxTokens: maxTokens } };
  }
  function analyze(text, cap) {
    var report = inspect(text), out = [], i, item, r, contextual, message, reason, occurrenceSource;
    var limit = 'Recorte de até 8.000 unidades UTF-16 e 1.600 tokens. Contexto restrito a artigo definido + nome, grupos de três palavras com artigo definido ou indefinido/nome/adjetivo, sequências nominais com de/do/da/dos/das e apoio verbal finito, possessivo/demonstrativo antes de nome com artigo definido opcional, usos sem nome no início de unidade com apoio finito e não opcional, pares nominais completos com e/ou, sem modificadores e com ao menos um nome sem outra classe no inventário, ou com artigo em cada constituinte e traços explícitos compatíveis (duas alternativas verbais com artigos definidos ficam em aberto), dois grupos artigo + nome + adjetivo posposto unidos por e/ou, com gênero/número explícitos e sem alternativa verbal no adjetivo, dois/duas/três + nome plural de livro/casa/jardim/flor/mesa/mulher/homem em unidade completa, NUM cardinal e Number do nome explícitos, gênero do numeral conferido quando marcado, não pré-verbal entre pronome sujeito no início de unidade e forma indicativa compatível, com clítico opcional, e pronome sujeito + forma finita, com não e clítico opcionais. Pontuação, quebras de linha e trechos protegidos interrompem relações. Não resolve sintaxe geral, regência, sentido ou concordância; formas fora do inventário permanecem desconhecidas. PortiLexicon amplia candidatos, sem escolher sentido ou função auxiliar. Determinante (UD) conserva a categoria da fonte sem convertê-la automaticamente em artigo ou pronome.';
    for (i = 0; i < report.items.length && out.length < cap; i += 1) {
      item = report.items[i]; r = item.candidates; contextual = item.status === 'contextual';
      message = contextual ? 'Leitura contextual: ' + item.selected + '.' : item.status === 'desconhecido' ? 'Sem classificação neste inventário.' : 'Possibilidades lexicais: ' + r.classes.join(', ') + '.';
      if(item.rule==='PTBR-CTX-008'&&item.selected==='determinante (UD)'){message='Leitura contextual: '+item.nominalDeterminer.kind+' acompanhando um nome.';}
      if(item.rule==='PTBR-CTX-009'){message='Leitura contextual: demonstrativo sem nome expresso.';}
      if(item.rule==='PTBR-CTX-010'){message='Possessivo sem nome expresso: leitura em aberto.';}
      if(item.rule==='PTBR-CTX-011'){message=item.nominalCoordination.role==='conectivo'?'Hipótese de coordenação nominal: conectivo '+item.nominalCoordination.connector+'.':'Hipótese de coordenação nominal: substantivo.';}
      if(item.rule==='PTBR-CTX-015'){message='Hipótese de grupo nominal com cardinal: '+item.selected+'.';}
      if(item.rule==='PTBR-CTX-014'){message='Leitura contextual: advérbio de negação antes de verbo.';}
      if(item.rule==='PTBR-CTX-013'){message='Hipótese de coordenação nominal com adjetivos: '+(item.nominalCoordination.role==='conectivo'?'conectivo '+item.nominalCoordination.connector:item.selected)+'.';}
      if(item.rule==='PTBR-CTX-012'){message='Hipótese de coordenação nominal com artigos: '+(item.nominalCoordination.role==='conectivo'?'conectivo '+item.nominalCoordination.connector:item.selected)+'.';}
      reason = item.rule === 'PTBR-CTX-001' ? 'Pronome sujeito próximo e forma verbal finita compatível em pessoa e número.' :
        item.rule === 'PTBR-CTX-002' ? 'Artigo definido antes de nome registrado; homógrafos verbais exigem também uma forma finita à direita.' :
        item.rule === 'PTBR-CTX-003' ? 'A forma aparece entre pronome sujeito (com não opcional) e verbo finito compatível.' :
        item.rule === 'PTBR-CTX-015' ? 'Dois/duas/três com candidato NUM cardinal seguido de nome com Number=Plur em unidade completa de duas palavras. O nome pertence ao recorte livro/casa/jardim/flor/mesa/mulher/homem. NumType=Card não informa Number do numeral; a pluralidade é registrada só no nome.'+(item.nominalNumeral.numeralGenderMarked?' Gênero do numeral marcado e compatível com o nome.':' Gênero do numeral ausente na fonte, sem inferência de concordância.')+' Não resolve quantidade, função sintática, medidas, datas, um/uma ou grupos com modificadores. Homógrafos preservados.' :
        item.rule === 'PTBR-CTX-014' ? 'A forma “não” tem candidato ADV e aparece entre pronome pessoal sujeito no início de unidade e forma indicativa compatível, com clítico opcional. Favorece advérbio de negação neste recorte; não decide alcance semântico, intenção, verdade da frase ou dupla negação. A leitura nominal permanece no inventário.' :
        item.rule === 'PTBR-CTX-013' ? 'Dois grupos artigo + nome + adjetivo posposto já reconhecidos, ligados por e/ou em unidade completa. Gênero e número explícitos e compatíveis dentro de cada grupo; adjetivos sem alternativa verbal no inventário. Não compara os traços entre os grupos, não escolhe sentido e não atribui sujeito, objeto ou concordância do conjunto. Um/uma conservam alternativas quantitativas.' :
        item.rule === 'PTBR-CTX-012' ? 'Dois pares artigo + nome ligados por e/ou, entre limites explícitos, com gênero e número registrados e compatíveis em cada par. Artigo indefinido ou ao menos um nome sem outra classe no inventário dá apoio adicional. A leitura de artigo não elimina usos quantitativos de um/uma. Não determina sujeito, objeto, concordância do conjunto ou sentido de ou; diferenças de gênero e número entre os núcleos são preservadas.' :
        item.rule === 'PTBR-CTX-011' ? 'Dois candidatos nominais ligados por e/ou formam um recorte curto sem modificadores, entre limites explícitos. Ao menos um tem só a classe substantivo no inventário; isso apoia a hipótese, sem provar unicidade na língua. Conectivo e constituintes são distinguidos, sem atribuir sujeito, objeto, concordância do conjunto, sentido exclusivo de ou ou estrutura de oração.' :
        item.rule === 'PTBR-CTX-009' ? 'Candidato pronominal demonstrativo no início do trecho ou após pontuação de limite, seguido de forma finita compatível em terceira pessoa e número, com não opcional. Favorece pronome neste recorte; não identifica referente nem prova função de sujeito.' :
        item.rule === 'PTBR-CTX-010' ? 'Artigo e possessivo compatíveis antes de forma finita de terceira pessoa e mesmo número, sem nome intermediário. Registra uso sem nome expresso; não decide entre leitura pronominal, elipse de nome ou substantivação. Não reconstrói o nome nem identifica o possuidor.' :
        item.rule === 'PTBR-CTX-008' ? 'A fonte registra determinante '+item.nominalDeterminer.kind+' antes de nome contíguo, com gênero e número compatíveis. Determinante (UD) conserva a categoria da fonte; pronome é outra possibilidade lexical. A hipótese não identifica possuidor, referente nem função sintática do grupo.' :
        item.rule === 'PTBR-CTX-007' ? 'Artigo e nome com traços compatíveis, sequência introduzida por de ou sua contração e forma finita à direita compatível com terceira pessoa e número do primeiro nome. Isso apoia classes, sem provar sujeito, posse ou vínculo do complemento.'+(item.nominalComplement.complementFeaturesChecked?' Os traços do segundo nome também correspondem ao artigo que o precede.':' O segundo nome não teve concordância com artigo verificada; traços ausentes não foram inferidos.') :
        item.rule === 'PTBR-CTX-006' ? 'Artigo, nome e adjetivo contíguos com número compatível; gênero do nome compatível com o artigo.'+(item.nominalAgreement.adjectiveGenderMarked?' O gênero do adjetivo também está registrado e é compatível.':' A fonte não informa gênero para este adjetivo; isso não foi tratado como prova de concordância.') :
        item.rule === 'PTBR-CTX-005' ? 'Lema conhecido e preposição contígua, com pronome sujeito opcional: leitura de infinitivo preservada do motor anterior.' :
        item.nominalAmbiguity ? 'Neste grupo, o léxico admite nome + adjetivo e adjetivo + nome. O recorte não escolhe entre as duas distribuições.' :
        r.classes.length ? 'Consulta ao léxico local; nenhuma regra contextual deste incremento decidiu a ocorrência.' : 'A forma não consta do recorte lexical. Nenhuma classe foi deduzida por sufixo.';
      if(contextual&&item.selected==='artigo'&&has(r.classes,'numeral')){reason+=' A leitura de artigo é uma hipótese local; um/uma também podem expressar quantidade, e o recorte não resolve essa intenção.';}
      occurrenceSource=contextual&&item.rule!=='PTBR-CTX-005'?source:E.grammarData.source;
      if(item.rule==='PTBR-CTX-006'){occurrenceSource={title:'Regra computacional local de hipótese nominal. Universal Dependencies: amod em português, Gender e Number; consulta em 30/09/2026. Não é regra geral de desambiguação ou concordância.',url:'https://universaldependencies.org/pt/dep/amod.html'};}
      if(item.rule==='PTBR-CTX-007'){occurrenceSource={title:'Hipótese computacional local para classes em sequência nominal preposicionada. UD português: nmod e case, consultados em 30/09/2026; não equivale a análise de dependências. Contrações de + artigo explicitadas localmente; dados lexicais legados preservados.',url:'https://universaldependencies.org/pt/dep/nmod.html'};}
      if(item.rule==='PTBR-CTX-008'){occurrenceSource={title:'Regra computacional local: determinante possessivo/demonstrativo antes de nome. Universal Dependencies v2, Poss e PronType, consultados em 30/09/2026; não identifica referente nem resolve usos sem nome.',url:'https://universaldependencies.org/u/feat/PronType.html'};}
      if(item.rule==='PTBR-CTX-009'||item.rule==='PTBR-CTX-010'){occurrenceSource={title:'Hipótese/observação computacional local para usos sem nome expresso. UD v2 PRON e Ellipsis in Nominals, consultados em 01/10/2026; distinções entre pronome, determinante e elipse não são decididas só pela ausência do nome.',url:'https://universaldependencies.org/u/pos/PRON.html'};}
      if(item.rule==='PTBR-CTX-011'){occurrenceSource={title:'Hipótese computacional local de coordenação nominal curta. UD v2: conj e cc, consultados em 01/10/2026. Distingue conectivo e constituintes; não implementa árvore de dependências.',url:'https://universaldependencies.org/u/dep/conj.html'};}
      if(item.rule==='PTBR-CTX-015'){occurrenceSource={title:'Hipótese computacional local de cardinal + nome plural. UD v2: nummod em português e NumType, consultados em 06/10/2026; anotação lexical não é algoritmo de desambiguação. Number explícito é do nome, não do numeral.',url:'https://universaldependencies.org/pt/dep/nummod.html'};}
      if(item.rule==='PTBR-CTX-014'){occurrenceSource={title:'Hipótese computacional local para não pré-verbal. UD v2: advmod em português e Polarity, consultados em 05/10/2026; referências de anotação, sem resolver alcance. O dado ADV do PortiLexicon não informa Polarity; negação é a interpretação delimitada da regra.',url:'https://universaldependencies.org/pt/dep/advmod.html'};}
      if(item.rule==='PTBR-CTX-013'){occurrenceSource={title:'Hipótese computacional local de coordenação com adjetivos pospostos. UD v2: amod em português, consultado em 05/10/2026; conj e det retomados da v6.42. Referências de anotação, sem implementar árvore de dependências ou desambiguação geral.',url:'https://universaldependencies.org/pt/dep/amod.html'};}
      if(item.rule==='PTBR-CTX-012'){occurrenceSource={title:'Hipótese computacional local para coordenação com artigos. UD v2: conj e det em português, consultados em 04/10/2026. Referências de anotação; não são algoritmo de desambiguação nem prova de função sintática.',url:'https://universaldependencies.org/pt/dep/det.html'};}
      if(r.portilexicon.length){occurrenceSource={title:(typeof occurrenceSource==='string'?occurrenceSource:occurrenceSource.title)+' Dados lexicais: PortiLexicon-UD, Lopes, Duran, Fernandes e Pardo (2022), recorte '+E.portiLexicon.version+'. Classes UD são candidatos; não equivalem automaticamente à função na frase.',url:'https://github.com/LuceleneL/PortiLexicon-UD/tree/315e063da1f89c89e2097c6e72428ebefb9ab1d1'};}
      out.push(E.instruments.finding('morfologia', item.rule || 'PTBR-CTX-004', text, item.start, item.end, message,
        reason + (item.evidence.length ? ' Apoios no original: ' + item.evidence.map(function (s) { return '“' + s.snippet + '”'; }).join(', ') + '.' : ''),
        contextual ? 'A construção favorece a leitura de ' + item.selected + '; as possibilidades lexicais são preservadas na análise.' : 'Esta ocorrência permanece ' + item.status + '. Isso não é erro de escrita.',
        'Possibilidades lexicais registradas: ' + (r.classes.join(', ') || 'nenhuma') + '. A regra é uma hipótese local. Elipse, nomes próprios, usos literários e outras construções podem exigir leitura diferente. Um inventário com uma só classe não prova unicidade na língua.',
        limit, occurrenceSource,
        { confidence: contextual ? 'moderada' : 'insuficiente', feature: item.selected || item.status, candidates: r,
          nominalNumeral: item.nominalNumeral || null, negation: item.negation || null, nominalCoordination: item.nominalCoordination || null, standaloneUse: item.standaloneUse || null, nominalDeterminer: item.nominalDeterminer || null, nominalComplement: item.nominalComplement || null, nominalAgreement: item.nominalAgreement || null, nominalAmbiguity: !!item.nominalAmbiguity, analysisStatus: item.status, context: item.evidence, compatibleVerbs: item.compatibleVerbs || [] }));
    }
    out.coverageInfo = { scope: report.scope, work: report.work, version: version, lexiconVersion: E.portiLexicon?E.portiLexicon.version:null,
      summary: 'Classes em contexto: recorte ' + report.scope.start + '–' + report.scope.end + ' de ' + text.length + ' unidades UTF-16; ' + report.work.tokens + ' tokens.' + (report.scope.partial ? ' Análise parcial: selecione o restante para continuar.' : '') };
    return out;
  }
  E.contextualMorphology = { version: version, readings: readings, lexicalReadings: lexicalReadings, inspect: inspect, analyze: analyze };
}(typeof window !== 'undefined' ? window : this));
