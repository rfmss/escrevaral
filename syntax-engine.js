(function syntaxEngine(global) {
  "use strict";

  let _ptc       = null;
  let _data      = null;
  let _loadError = false;

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    if (_data) return true;          // dados já carregados (ptc é opcional)
    if (_loadError) return false;    // tentativa anterior falhou — não retenta
    try {
      _data = await fetch('syntax-data.json').then(r => r.json());
      _ptc  = global.ptCompromise || null;
      return true;
    } catch (e) {
      console.warn("[syntax-engine] init falhou:", e);
      _loadError = true;
      return false;
    }
  }

  // ── Morfologia via pt-compromise ──────────────────────────────────────────

  // Pronomes pessoais — para fallback morfológico (Cunha&Cintra cap.8)
  const PRONOMES_SUBJ = new Set([
    "eu","tu","ele","ela","nós","vós","vocês","eles","elas","você"
  ]);
  const PRONOMES_OBL = new Set([
    "me","te","lhe","lhes","mim","ti","si","conosco","convosco","vos"
  ]);
  const PRONOMES_INDF = new Set([
    "alguém","ninguém","tudo","nada","algo","qualquer","todo","toda","todos","todas",
    "outrem","outro","outra","outros","outras","cada","nenhum","nenhuma",
    "algum","alguma","alguns","algumas"
  ]);
  const PRONOMES_DEM = new Set([
    "este","esta","estes","estas","esse","essa","esses","essas",
    "aquele","aquela","aqueles","aquelas","isto","isso","aquilo"
  ]);

  function analisarMorfologiaFallback(texto) {
    const tokens = texto.match(/[\p{L}'-]+|[.,;:!?—]/gu) || [];
    return tokens.map((word, i) => {
      const norm = word.toLowerCase();
      const tags = [];
      if (PREPS_OI.has(norm)) tags.push("Preposition");
      if (_data && identificarConjuncao(word, { posInicio: i === 0 })) tags.push("Conjunction");
      // Pronomes pessoais antes dos padrões verbais — evita falso-positivo em "qualquer", "todos"
      if (PRONOMES_SUBJ.has(norm))      { tags.push("Pronoun"); tags.push("Noun"); }
      else if (PRONOMES_OBL.has(norm))  { tags.push("Pronoun"); }
      else if (PRONOMES_INDF.has(norm)) { tags.push("Pronoun"); tags.push("Noun"); }
      else if (PRONOMES_DEM.has(norm))  { tags.push("Pronoun"); }
      else {
        // Nome próprio: inicial maiúscula após token que não encerra sentença
        const prevToken = i > 0 ? tokens[i - 1] : null;
        const prevEndsSentence = prevToken !== null && /^[.!?]$/.test(prevToken);
        const midSentenceProper = /^\p{Lu}/u.test(word) && i > 0 && !prevEndsSentence;
        if (midSentenceProper) {
          tags.push("ProperNoun");
          tags.push("Noun");
        } else if (i === 0 && /^\p{Lu}/u.test(word)) {
          // Posição 0 com maiúscula: sempre ambíguo (nome próprio vs verbo inicial).
          // Não classifica como verbo por terminação — evita Vitória/Maria/Sabia=Verb.
        } else {
          if (/mente$/.test(norm) && norm.length > 6) tags.push("Adverb");
          if (/(?:ando|endo|indo)$/.test(norm)) { tags.push("Verb"); tags.push("Gerund"); }
          else if (/(?:ar|er|ir|or)$/.test(norm) && norm.length > 3 && !PREPS_OI.has(norm)) tags.push("Verb");
          else if (/(?:ou|eu|iu|ei|aram|eram|iram|ava|avam|ia|iam|ará|erá|irá|aria|eria|iria|asse|esse|isse)$/.test(norm) && norm.length > 3) tags.push("Verb");
          else if (VERBOS_LIGACAO.has(norm)) tags.push("Verb");
        }
      }
      return { text: word, tags, normal: norm };
    });
  }

  function analisarMorfologia(texto) {
    if (_ptc) return _ptc(texto).json()[0]?.terms || [];
    return analisarMorfologiaFallback(texto);
  }

  function mapearTag(tags = []) {
    const m = {
      Noun:"Substantivo", ProperNoun:"Nome próprio", Person:"Pessoa",
      Verb:"Verbo", Adjective:"Adjetivo", Adverb:"Advérbio",
      Preposition:"Preposição", Conjunction:"Conjunção",
      Determiner:"Artigo/Determinante", Pronoun:"Pronome",
      Possessive:"Possessivo", Negative:"Negação",
      FutureTense:"Futuro", PastTense:"Pretérito perfeito",
      PresentTense:"Presente", Infinitive:"Infinitivo",
      Gerund:"Gerúndio", Imperative:"Imperativo",
      FirstPerson:"1ª pessoa", SecondPerson:"2ª pessoa", ThirdPerson:"3ª pessoa",
      Singular:"Singular", Plural:"Plural",
      FemaleName:"Nome feminino", MaleName:"Nome masculino",
    };
    return tags.filter(t => m[t]).map(t => m[t]);
  }

  // ── Tempo verbal ──────────────────────────────────────────────────────────

  const PARTICÍPIOS_IRR = {
    aberto:1, coberto:1, dito:1, escrito:1, feito:1, pago:1, posto:1,
    visto:1, vindo:1, ganho:1, gasto:1, preso:1, expulso:1, aceito:1,
    aceso:1, eleito:1, entregue:1, impresso:1, limpo:1, morto:1,
    salvo:1, solto:1, tinto:1,
  };

  function identificarTempoVerbal(palavra, tags = [], contexto = {}) {
    // pt-compromise
    const tagMap = {
      FutureTense: "Futuro do presente",
      PastTense:   "Pretérito perfeito",
      PresentTense:"Presente do indicativo",
      Infinitive:  "Infinitivo",
      Gerund:      "Gerúndio",
      Imperative:  "Imperativo",
    };
    for (const [t, n] of Object.entries(tagMap)) {
      if (tags.includes(t)) return n;
    }

    const w = palavra.toLowerCase();

    // Particípio irregular
    if (PARTICÍPIOS_IRR[w]) return "Particípio";

    // Gerúndio
    if (/(?:ando|endo|indo)$/.test(w)) return "Gerúndio";

    // Particípio regular
    if (/(?:ados?|idas?|idos?)$/.test(w) && !tags.includes("Noun")) return "Particípio";

    // Futuro do pretérito (condicional)
    if (/(?:aria|arias|ariam|eria|erias|eriam|iria|irias|iriam)$/.test(w))
      return "Futuro do pretérito (condicional)";

    // Futuro do presente
    if (/(?:arei|arás|ará|aremos|arão|erei|erás|erá|eremos|erão|irei|irás|irá|iremos|irão)$/.test(w))
      return "Futuro do presente";

    // Subjuntivo imperfeito
    if (/(?:asse|asses|assem|esse|esses|essem|isse|isses|issem)$/.test(w))
      return "Pretérito imperfeito do subjuntivo";

    // Subjuntivo futuro vs infinitivo pessoal — desambiguação por contexto
    if (/(?:armos|ardes|arem|ermos|erdes|erem|irmos|irdes|irem)$/.test(w)) {
      if (contexto.conjTempCond) return "Futuro do subjuntivo";
      if (contexto.posPrep)      return "Infinitivo pessoal";
      return "Futuro do subjuntivo / Infinitivo pessoal";
    }
    if (/(?:ar|er|ir|or)$/.test(w) && w.length > 3) {
      if (contexto.conjTempCond) return "Futuro do subjuntivo";
      return "Infinitivo";
    }

    // Pretérito imperfeito
    if (/(?:ava|avas|avam|ia|ias|iam)$/.test(w)) return "Pretérito imperfeito";

    // Pretérito perfeito
    if (/(?:ou|eu|iu|ei|aste|este|iste|aram|eram|iram)$/.test(w)) return "Pretérito perfeito";

    return null;
  }

  // ── Conjunções ────────────────────────────────────────────────────────────

  function identificarConjuncao(texto, contexto = {}) {
    const norm = texto.toLowerCase().trim();

    // Verificar em subordinativas (locuções longas primeiro)
    const subord = _data.conjuncoes.subordinativas;
    for (const [tipo, grupo] of Object.entries(subord)) {
      if (tipo.startsWith("_")) continue;
      const lista = grupo.palavras || [];
      const match = lista.find(p => norm === p || norm.startsWith(p + " ") || norm.endsWith(" " + p));
      if (match) {
        // Desambiguação contextual para polissêmicas
        if (match === "desde que") {
          if (contexto.posInicio) return { palavra: match, classe: "subordinativa", tipo: "temporal", relacao: "tempo", descricao: "início de período temporal" };
          return { palavra: match, classe: "subordinativa", tipo: "condicional", relacao: "condição", descricao: "= contanto que" };
        }
        if (match === "como") {
          if (contexto.posInicio && !contexto.temCorrelato) return { palavra: match, classe: "subordinativa", tipo: "causais", relacao: "causa", descricao: "causal — no início da oração" };
        }
        return { palavra: match, classe: "subordinativa", tipo, relacao: grupo.relacao, funcao: grupo.funcao, descricao: grupo.descricao };
      }
      // Verificar valor_especial
      if (grupo.valor_especial?.[norm]) {
        return { palavra: norm, classe: "subordinativa", tipo, relacao: grupo.relacao, descricao: grupo.valor_especial[norm] };
      }
    }

    // Coordenativas
    const coord = _data.conjuncoes.coordenativas;
    for (const [tipo, grupo] of Object.entries(coord)) {
      if (tipo.startsWith("_")) continue;
      const lista = grupo.palavras || [];
      const match = lista.find(p => norm === p);
      if (match) return { palavra: match, classe: "coordenativa", tipo, relacao: grupo.relacao, descricao: grupo.descricao };
    }

    return null;
  }

  // ── Desambiguação do "se" ─────────────────────────────────────────────────

  function analisarSe(termos, idx) {
    // Olha o verbo seguinte para determinar transitividade
    const proximo = termos.slice(idx + 1).find(t => t.tags?.includes("Verb"));
    if (!proximo) return { funcao: "partícula (se)", tipo: "indeterminado ou apassivador" };

    const vtags = proximo.tags || [];
    // Contexto anterior: há conjunção temporal/condicional?
    const anterior = termos.slice(0, idx).map(t => (t.text || "").toLowerCase());
    const conjTempCond = ["quando","enquanto","assim que","logo que","antes que","após"].some(c => anterior.includes(c));
    if (conjTempCond) return { funcao: "Conjunção condicional", tipo: "condicional" };

    return { funcao: "partícula (se)", tipo: "apassivador / indeterminação — verificar transitividade" };
  }

  // ── Verbos de ligação — Bechara Lições cap.XIII + syntax-data.json ──────────
  const VERBOS_LIGACAO = new Set([
    "ser","estar","ficar","parecer","continuar","permanecer",
    "tornar","revelar","mostrar","andar","viver","acabar","chegar",
    "é","foi","era","será","seria","fosse","seja","estou","está","estão",
    "estava","esteve","estará","estaria","estivesse","esteja",
    "fica","ficou","ficava","ficará","ficaria","ficasse","fique",
    "parece","pareceu","parecia","parecerá","pareceria","parecesse","pareça",
    "continua","continuou","continuava","continuará","continuaria",
    "permanece","permaneceu","permanecia","permanecerá"
  ]);

  // ── Preposições que introduzem OI — Bechara Lições §OI ────────────────────
  const PREPS_OI = new Set(["a","ao","à","aos","às","de","do","da","dos","das","em","no","na","nos","nas","para","por","pelo","pela","pelos","pelas"]);

  // ── Verbos que exigem predicativo do objeto — predicativos §do_objeto ──────
  // Bechara Lições cap.XIV; Cunha&Cintra cap.6
  const VERBOS_PRED_OBJ = new Set([
    "chamar","chamar de","intitular","denominar","apelidar",
    "eleger","nomear","constituir","declarar","proclamar",
    "considerar","julgar","achar","crer","supor","imaginar",
    "tornar","fazer","deixar","manter","ter","tomar",
    "reconhecer","designar","qualificar","classificar",
    // formas flexionadas comuns
    "chamou","chamava","chamará","chamaram",
    "elegeu","elegeram","nomeou","nomearam",
    "considerou","considerava","consideraram",
    "deixou","deixava","deixaram","deixará",
    "tornou","tornava","tornaram","tornará",
  ]);

  // ── Verbos VTI por subtipo de OI — Bechara Lições §OI subtipos ────────────
  const VERBOS_OI_DATIVO = new Set([
    "dar","dei","deu","davam","darão","entregou","entregaram","enviou","enviaram",
    "mandou","mandaram","oferecer","ofereceu","ofereceram","passar","passou","passaram",
    "mostrar","mostrou","mostraram","contar","contou","contaram",
    "revelar","revelou","revelaram","explicar","explicou","explicaram",
    "dizer","disse","disseram","pedir","pediu","pediram",
  ]);
  const VERBOS_OI_POSSE = new Set([
    "tirar","tirou","tiraram","cortar","cortou","cortaram",
    "roubar","roubou","roubaram","arrancar","arrancou","arrancaram",
    "tomar","tomou","tomaram","retirar","retirou","retiraram",
  ]);
  const VERBOS_OI_INTERESSE = new Set([
    "prejudicar","prejudicou","prejudicaram","beneficiar","beneficiou","beneficiaram",
    "servir","serviu","serviram","ajudar","ajudou","ajudaram",
    "convir","conveio","convieram","interessar","interessou","interessaram",
    "bastar","bastou","bastaram","faltar","faltou","faltaram",
    "acontecer","aconteceu","aconteceram","ocorrer","ocorreu","ocorreram",
  ]);

  function subtipoOI(verbAnteriorNorm) {
    if (VERBOS_OI_DATIVO.has(verbAnteriorNorm))     return "Objeto indireto — dativo (destinatário/beneficiário)";
    if (VERBOS_OI_POSSE.has(verbAnteriorNorm))      return "Objeto indireto — dativo de posse";
    if (VERBOS_OI_INTERESSE.has(verbAnteriorNorm))  return "Objeto indireto — dativo de interesse";
    return "Objeto indireto (provável)";
  }

  // ── Concordância de gênero — artigo + substantivo (heurística) ────────────
  // Bechara Lições §concordância nominal; Cunha&Cintra cap.6
  function verificarConcordanciaGenero(artigo, substantivo) {
    if (!artigo || !substantivo) return null;
    const art = artigo.toLowerCase();
    const sub = substantivo.toLowerCase();
    // artigo feminino + substantivo masculino típico
    const artFem = ["a","as","uma","umas","da","das","na","nas","à","às","pela","pelas"].includes(art);
    const artMasc = ["o","os","um","uns","do","dos","no","nos","ao","aos","pelo","pelos"].includes(art);
    const subTermMasc = /[^a](or|ão|ão|or|ar|er|ir|ês|il|ol|ul|al)$/.test(sub) && !/ora$/.test(sub);
    const subTermFem = /(a|ã|oa|eira|essa|esa|isa|ista|triz|dade|ção|são|gem|agem)$/.test(sub);
    if (artFem && subTermMasc && sub.length > 3)
      return { tipo: "concordância de gênero", descricao: `Possível discordância: artigo feminino '${artigo}' com substantivo '${substantivo}'` };
    if (artMasc && subTermFem && sub.length > 3 && !/(tema|dia|mapa|cinema|planeta|cometa|dilema|programa)$/.test(sub))
      return { tipo: "concordância de gênero", descricao: `Possível discordância: artigo masculino '${artigo}' com substantivo '${substantivo}'` };
    return null;
  }

  // ── Advérbios por tipo — Cunha&Cintra cap.14 + syntax-data ────────────────
  const ADV_TEMPO   = new Set(["ontem","hoje","amanhã","agora","antes","depois","cedo","tarde","logo","já","sempre","nunca","jamais","antigamente","outrora","entao","enfim","finalmente","ainda","brevemente","imediatamente"]);
  const ADV_LUGAR   = new Set(["aqui","ali","la","ca","aí","aí","abaixo","acima","dentro","fora","atrás","adiante","perto","longe","onde","alhures","algures"]);
  const ADV_MODO    = new Set(["assim","bem","mal","melhor","pior","devagar","depressa","rapidamente","lentamente","facilmente","dificilmente","calmamente"]);
  const ADV_NEGACAO = new Set(["não","nem","jamais","nunca","tampouco"]);
  const ADV_AFIRM   = new Set(["sim","certamente","decerto","efetivamente","realmente"]);
  const ADV_INTENS  = new Set(["muito","pouco","bastante","mais","menos","tão","tanto","quão","quase","demais","apenas","somente","só"]);
  const ADV_DUVIDA  = new Set(["talvez","provavelmente","possivelmente","porventura","quiçá","eventualmente"]);

  function tipoAdvérbio(norm) {
    if (ADV_NEGACAO.has(norm))  return "Adjunto adverbial de negação";
    if (ADV_AFIRM.has(norm))    return "Adjunto adverbial de afirmação";
    if (ADV_TEMPO.has(norm))    return "Adjunto adverbial de tempo";
    if (ADV_LUGAR.has(norm))    return "Adjunto adverbial de lugar";
    if (ADV_MODO.has(norm))     return "Adjunto adverbial de modo";
    if (ADV_INTENS.has(norm))   return "Adjunto adverbial de intensidade";
    if (ADV_DUVIDA.has(norm))   return "Adjunto adverbial de dúvida";
    if (/mente$/.test(norm))    return "Adjunto adverbial de modo";
    return "Adjunto adverbial";
  }

  // ── Verificação de concordância verbal básica — Bechara Lições §concordância
  function verificarConcordancia(sujeito, verbo) {
    if (!sujeito || !verbo) return null;
    const sNorm = sujeito.toLowerCase();
    const vNorm = verbo.toLowerCase();
    // Sujeito plural + verbo singular (heurística de terminação)
    const sujPlural = /[^ã](s|ns|is|ões|ães|ãos)$/.test(sNorm);
    const verbPlural = /(am|em|im|iam|eram|eram|aram|estão|são|vão|têm|vêm|foram|estavam|serão)$/.test(vNorm);
    const verbSing = /(ou|eu|iu|ei|ava|ia|á|a|e|o|á)$/.test(vNorm) && !verbPlural;
    if (sujPlural && verbSing) return { tipo: "concordância", descricao: `Possível erro: sujeito '${sujeito}' parece plural; verbo '${verbo}' singular` };
    return null;
  }

  // ── Análise de funções sintáticas (reescrita) ─────────────────────────────

  function analisarFuncoes(termos) {
    const resultado = [];
    let estado = "inicio";
    let verboVisto = false;
    let ultimoVerboIsLigacao = false;
    let ultimoSujeito = null;
    let ultimoVerboText = null;
    let prepVistaAntes = false; // rastreia se havia preposição antes do SN atual

    // Pré-detectar vocativo: primeiro token real seguido de vírgula
    // que não seja conjunção, advérbio ou preposição conhecida
    const vocativoPosicoes = new Set();
    {
      let i0 = 0;
      while (i0 < termos.length && /^[.,;:!?—]$/.test((termos[i0].text || "").trim())) i0++;
      if (i0 + 1 < termos.length) {
        const cand = termos[i0];
        const prox = termos[i0 + 1];
        if ((prox.text || "").trim() === ",") {
          const txt = (cand.text || "").trim();
          const norm = txt.toLowerCase();
          const tags = cand.tags || [];
          const isConj = _data ? !!identificarConjuncao(txt, { posInicio: true }) : false;
          const isAdv = tags.includes("Adverb") || ADV_TEMPO.has(norm) || ADV_LUGAR.has(norm) ||
                        ADV_MODO.has(norm) || ADV_NEGACAO.has(norm) || ADV_AFIRM.has(norm) ||
                        ADV_INTENS.has(norm) || ADV_DUVIDA.has(norm);
          if (!isConj && !isAdv && !PREPS_OI.has(norm)) vocativoPosicoes.add(i0);
        }
      }
    }

    const textoPeriodo = termos.map(t => (t.text || "").toLowerCase()).join(" ");
    const conjTempCond = [
      ...(_data.conjuncoes.subordinativas?.temporais?.palavras || []),
      ...(_data.conjuncoes.subordinativas?.condicionais?.palavras || [])
    ].some(c => textoPeriodo.includes(c));

    for (let i = 0; i < termos.length; i++) {
      const t    = termos[i];
      const tags = t.tags || [];
      const txt  = (t.text || "").trim();
      const norm = txt.toLowerCase();

      if (!txt || /^[.,;:!?—]$/.test(txt)) {
        resultado.push({ ...t, funcao: null });
        prepVistaAntes = false;
        continue;
      }

      // ── Vocativo
      if (vocativoPosicoes.has(i)) {
        resultado.push({ ...t, funcao: "Vocativo", tagsLegíveis: mapearTag(tags) });
        continue;
      }

      // ── "se" — desambiguação especial
      if (norm === "se") {
        const info = analisarSe(termos, i);
        resultado.push({ ...t, funcao: info.funcao, tipo_se: info.tipo, tagsLegíveis: mapearTag(tags) });
        continue;
      }

      // ── Conjunção
      const conj = identificarConjuncao(txt, { posInicio: i === 0 || estado === "inicio", conjTempCond });
      if (conj || tags.includes("Conjunction")) {
        resultado.push({ ...t, funcao: "Conjunção", conjuncao: conj, tagsLegíveis: mapearTag(tags) });
        estado = "inicio";
        prepVistaAntes = false;
        continue;
      }

      // ── Preposição / artigo / contração — rastreia prepVistaAntes
      const isPrep = PREPS_OI.has(norm) || tags.includes("Preposition");
      if (isPrep || (tags.includes("Determiner") && !tags.includes("Pronoun"))) {
        resultado.push({ ...t, funcao: isPrep && !["o","a","os","as","um","uma","uns","umas"].includes(norm) ? "Preposição" : "Artigo / contração", tagsLegíveis: mapearTag(tags) });
        if (isPrep) prepVistaAntes = true;
        continue;
      }

      // ── Advérbio — com tipo classificado
      if (tags.includes("Adverb") && !tags.includes("Verb")) {
        resultado.push({ ...t, funcao: tipoAdvérbio(norm), tagsLegíveis: mapearTag(tags) });
        prepVistaAntes = false;
        continue;
      }

      // ── Verbo — fix: usar VERBOS_LIGACAO local em vez de _data.verbos_ligacao
      if (tags.includes("Verb") && !tags.includes("Negative")) {
        verboVisto = true;
        const ctx = { conjTempCond, posPrep: prepVistaAntes };
        const tempo = identificarTempoVerbal(txt, tags, ctx);
        const verbBase = norm.replace(/(ar|er|ir|ou|eu|iu|ei|ava|ia|ará|erá|irá|aria|eria|iria)$/, "");
        const isLig = VERBOS_LIGACAO.has(norm) || VERBOS_LIGACAO.has(verbBase);

        // ── Voz passiva analítica: verbo_ligacao + particípio anterior ou posterior
        const proxTermos = termos.slice(i + 1, i + 3).map(t => (t.text || "").toLowerCase());
        const isParticipioNext = proxTermos.some(p => /(ado|ada|ados|adas|ido|ida|idos|idas|to|ta|tos|tas)$/.test(p) && p.length > 3);
        if ((norm === "foi" || norm === "é" || norm === "era" || norm === "será" || norm === "está" || norm === "estava" || norm === "ficou") && isParticipioNext) {
          resultado.push({ ...t, funcao: "Voz passiva — auxiliar", tempo, tagsLegíveis: mapearTag(tags) });
          ultimoVerboIsLigacao = false;
          ultimoVerboText = txt;
          estado = "voz_passiva";
          prepVistaAntes = false;
          continue;
        }

        ultimoVerboIsLigacao = isLig;
        ultimoVerboText = txt;
        resultado.push({ ...t, funcao: isLig ? "Verbo de ligação" : "Núcleo do predicado", tempo, tagsLegíveis: mapearTag(tags) });
        estado = "apos_verbo";
        prepVistaAntes = false;
        continue;
      }

      // ── "que" após substantivo → pronome relativo (oração adjetiva)
      if (norm === "que" && estado === "apos_sujeito") {
        resultado.push({ ...t, funcao: "Pronome relativo (oração adjetiva)", tagsLegíveis: mapearTag(tags) });
        estado = "oração_adjetiva";
        continue;
      }

      // ── Nomes, pronomes, adjetivos
      if (tags.includes("Noun") || tags.includes("Pronoun") || tags.includes("Person") || tags.includes("Adjective")) {
        if (!verboVisto) {
          resultado.push({ ...t, funcao: "Sujeito (provável)", tagsLegíveis: mapearTag(tags) });
          ultimoSujeito = txt;
          estado = "apos_sujeito";
        } else if (estado === "voz_passiva") {
          resultado.push({ ...t, funcao: "Sujeito paciente (voz passiva)", tagsLegíveis: mapearTag(tags) });
        } else if (ultimoVerboIsLigacao) {
          resultado.push({ ...t, funcao: "Predicativo do sujeito", tagsLegíveis: mapearTag(tags) });
        } else if (prepVistaAntes) {
          // OI com subtipo baseado no verbo que o rege
          const funcaoOI = subtipoOI(ultimoVerboText?.toLowerCase() || "");
          resultado.push({ ...t, funcao: funcaoOI, tagsLegíveis: mapearTag(tags) });
        } else if (estado === "apos_od" && VERBOS_PRED_OBJ.has(ultimoVerboText?.toLowerCase() || "")) {
          // Predicativo do objeto: após OD de verbo que exige predicativo — Bechara Lições cap.XIV
          resultado.push({ ...t, funcao: "Predicativo do objeto", tagsLegíveis: mapearTag(tags) });
        } else {
          // OD; se for adjetivo após OD → predicativo do objeto
          if (tags.includes("Adjective") && estado === "apos_od") {
            resultado.push({ ...t, funcao: "Predicativo do objeto (adjetivo)", tagsLegíveis: mapearTag(tags) });
          } else {
            resultado.push({ ...t, funcao: "Objeto direto (provável)", tagsLegíveis: mapearTag(tags) });
            estado = "apos_od";
          }
        }
        prepVistaAntes = false;
        continue;
      }

      resultado.push({ ...t, funcao: null, tagsLegíveis: mapearTag(tags) });
      prepVistaAntes = false;
    }

    // ── Pós-análise: concordância verbal + concordância de gênero ────────────
    const concord = verificarConcordancia(ultimoSujeito, ultimoVerboText);
    // Concordância de gênero: varrer pares artigo + próximo substantivo
    const alertasGenero = [];
    for (let i = 0; i < resultado.length - 1; i++) {
      const r = resultado[i];
      const prox = resultado[i + 1];
      if (r.funcao === "Artigo / contração" && prox?.funcao?.includes("Sujeito")) {
        const alert = verificarConcordanciaGenero(r.text, prox.text);
        if (alert) alertasGenero.push(alert);
      }
    }

    return { resultado, concordancia: concord, alertasGenero };
  }

  // ── Detectar locuções multi-palavra ───────────────────────────────────────

  function detectarLocucoes(texto) {
    const norm = texto.toLowerCase();
    const encontradas = [];
    const todos = [
      ...Object.values(_data.conjuncoes.subordinativas),
      ...Object.values(_data.conjuncoes.coordenativas),
    ].filter(g => !g.startsWith?.("_"));

    for (const grupo of todos) {
      for (const p of (grupo.palavras || [])) {
        if (p.includes(" ") && norm.includes(p)) {
          encontradas.push({ locucao: p, relacao: grupo.relacao, descricao: grupo.descricao });
        }
      }
    }
    return encontradas;
  }

  // ── Análise do período completo ───────────────────────────────────────────

  // ── Detectar apostos no texto — Bechara Lições §aposto + Cunha&Cintra cap.6 ─
  function detectarApostos(texto) {
    const apostos = [];
    // Padrão: Nome Próprio, artigo + substantivo/adjetivo (aposto explicativo)
    // Ex: "Pedro, o rei, chegou" / "Maria, minha amiga, partiu"
    const re = /([A-ZÁÉÍÓÚ][a-záàâãéèêíîóòôõúùûç]+),\s+(o|a|os|as|meu|minha|meu|minha|seu|sua|nosso|nossa)\s+([a-záàâãéèêíîóòôõúùûç]{3,})/g;
    let m;
    while ((m = re.exec(texto)) !== null) {
      apostos.push({ antecedente: m[1], aposto: `${m[2]} ${m[3]}`, pos: m.index });
    }
    // Padrão: substantivo, substantivo próprio (aposto especificativo invertido)
    const re2 = /\b(o presidente|a presidente|o ministro|a ministra|o escritor|a escritora|o poeta|a poetisa|o rei|a rainha|o general|o coronel)\s+([A-ZÁÉÍÓÚ][a-záàâãéèêíîóòôõúùûç]+(?:\s+[A-ZÁÉÍÓÚ][a-záàâãéèêíîóòôõúùûç]+)*)/g;
    while ((m = re2.exec(texto)) !== null) {
      apostos.push({ antecedente: m[1], aposto: m[2], tipo: "especificativo", pos: m.index });
    }
    return apostos;
  }

  // ── Classificar tipo de período composto — Bechara Lições cap.XV ──────────
  function classificarPeriodo(nOracoes, conjuncoes, locucoes) {
    if (nOracoes <= 1) return "Período simples";
    // conjuncoes já vêm extraídos como {classe, relacao, ...}
    const todasConj = [...conjuncoes, ...locucoes];
    const temSubord = todasConj.some(c => c?.classe === "subordinativa" || c?.relacao);
    const temCoord  = todasConj.some(c => c?.classe === "coordenativa");
    if (temSubord && temCoord) return "Período composto misto (coordenação + subordinação)";
    if (temSubord) return "Período composto por subordinação";
    if (temCoord)  return "Período composto por coordenação";
    return "Período composto (assindético)"; // sem conjunção explícita
  }

  function analisarPeriodo(texto) {
    const morfologia   = analisarMorfologia(texto);
    const { resultado: termos, concordancia, alertasGenero } = analisarFuncoes(morfologia);
    const locucoes     = detectarLocucoes(texto);
    const apostos      = detectarApostos(texto);

    const verbos      = termos.filter(t => t.tags?.includes("Verb") && !t.tags?.includes("Negative"));
    const conjuncoes  = termos.filter(t => t.conjuncao);
    const vocativos   = termos.filter(t => t.funcao === "Vocativo").map(v => v.text);
    const nOracoes    = Math.max(1, verbos.length);
    const temPassiva  = termos.some(t => t.funcao?.includes("passiva"));
    const temRelativa = termos.some(t => t.funcao?.includes("adjetiva"));
    const tipoPeriodo = classificarPeriodo(nOracoes, conjuncoes.map(c => c.conjuncao ? { ...c.conjuncao } : null).filter(Boolean), locucoes);

    // Consolidar alertas
    const alertas = [
      ...(concordancia ? [concordancia] : []),
      ...(alertasGenero || []),
    ];

    return {
      texto,
      termos,
      locucoes,
      apostos,
      resumo: {
        nOracoes,
        tipo: tipoPeriodo,
        vozePassiva: temPassiva,
        temRelativa,
        vocativos,
        verbos: verbos.map(v => ({
          forma: v.text,
          tempo: v.tempo,
          pessoa: v.tagsLegíveis?.find(t => t.includes("pessoa")),
          funcao: v.funcao,
        })),
        conjuncoes: conjuncoes.map(c => ({ palavra: c.text, ...c.conjuncao })),
        locucoes,
        apostos,
        alertas,
      },
    };
  }

  // ── API pública ───────────────────────────────────────────────────────────

  global.syntaxEngine = {
    init,
    analisarPeriodo,
    analisarMorfologia,
    analisarFuncoes,
    detectarApostos,
    classificarPeriodo,
    identificarConjuncao,
    identificarTempoVerbal,
    tipoAdvérbio,
    verificarConcordancia,
    verificarConcordanciaGenero,
    subtipoOI,
    mapearTag,
    _isReady:     () => _data !== null,
    _hasLoadError: () => _loadError,
    VERBOS_LIGACAO,
    VERBOS_PRED_OBJ,
    PRONOMES_SUBJ,
    PRONOMES_OBL,
    PRONOMES_INDF,
    PRONOMES_DEM,
  };

})(window);
