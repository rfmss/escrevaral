(function syntaxEngine(global) {
  "use strict";

  let _ptc       = null;
  let _data      = null;
  let _norma     = null;
  let _loadError = false;

  let _PRENOMES_F  = new Set();
  let _PRENOMES_M  = new Set();
  let _VERBOS_IRR  = new Set();
  let _TOPONIMOS   = new Set();
  let _SIGLAS      = new Set();
  let _SUBST_IA    = new Set();
  let _VERBOS_PRES = new Set();
  let _ADJ_EXT     = new Set();

  // Remove acentos para lookup de prenomes — "Vitória" → "vitoria"
  function _stripDiac(s) {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  async function init() {
    if (_data) return true;          // dados já carregados (ptc é opcional)
    if (_loadError) return false;    // tentativa anterior falhou — não retenta
    try {
      [_data, _norma] = await Promise.all([
        fetch('syntax-data.json').then(r => r.json()),
        fetch('norma-data.json').then(r => r.json()).catch(() => null),
      ]);
      _ptc = global.ptCompromise || null;
      if (_norma) {
        _PRENOMES_F = new Set(_norma.prenomes_femininos || []);
        _PRENOMES_M = new Set(_norma.prenomes_masculinos || []);
        _VERBOS_IRR = new Set(_norma.formas_verbais_irr || []);
        _TOPONIMOS  = new Set(_norma.toponimos_pt_br || []);
        _SIGLAS     = new Set(_norma.siglas_pt_br || []);
        _SUBST_IA   = new Set(_norma.substantivos_ia || []);
        _VERBOS_PRES = new Set(_norma.verbos_pres_reg || []);
        _ADJ_EXT    = new Set(_norma.adjetivos_comuns || []);
      }
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
    "me","te","lhe","lhes","mim","ti","si","conosco","convosco","vos",
    "comigo","contigo","consigo",
  ]);
  const PRONOMES_INDF = new Set([
    "alguém","ninguém","tudo","nada","algo","qualquer","todo","toda","todos","todas",
    "outrem","outro","outra","outros","outras","cada","nenhum","nenhuma",
    "algum","alguma","alguns","algumas",
    "muitos","muitas","poucos","poucas","tantos","tantas",
    "certo","certa","tal","tais",
    "mesmo","mesma","mesmos","mesmas",
    "próprio","própria","próprios","próprias",
  ]);
  const PRONOMES_DEM = new Set([
    "este","esta","estes","estas","esse","essa","esses","essas",
    "aquele","aquela","aqueles","aquelas","isto","isso","aquilo"
  ]);

  // Contrações PREP+DEM (Cunha&Cintra cap.9) — classificadas como Preposition
  // para manter compatibilidade com a regra bigram Preposition→Noun
  const CONTRACOES_PREP_DEM = new Set([
    "deste","desta","destes","destas","desse","dessa","desses","dessas",
    "daquele","daquela","daqueles","daquelas","disto","disso","daquilo",
    "neste","nesta","nestes","nestas","nesse","nessa","nesses","nessas",
    "naquele","naquela","naqueles","naquelas","nisto","nisso","naquilo",
    "àquele","àquela","àqueles","àquelas","àquilo",
  ]);

  // Pronomes possessivos — Cunha&Cintra cap.11 — antes das regras de sufixo
  // Impede "meu/teu/seu" (terminam em -eu) de serem classificados como Verbo
  const PRONOMES_POSS = new Set([
    "meu","minha","meus","minhas",
    "teu","tua","teus","tuas",
    "seu","sua","seus","suas",
    "nosso","nossa","nossos","nossas",
    "vosso","vossa","vossos","vossas",
  ]);

  // Numerais cardinais inequívocos — Cunha&Cintra cap.12 p.382-390
  // Excluídos: um/uma (já em ARTIGOS_DEF) e ordinais (ambíguos com adjetivos)
  const NUM_CARDINAIS = new Set([
    "dois","duas","três","quatro","cinco","seis","sete","oito","nove","dez",
    "onze","doze","treze","quatorze","catorze","quinze",
    "dezesseis","dezessete","dezoito","dezenove",
    "vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa",
    "cem","cento","mil","ambos","ambas",
  ]);

  // Adjetivos primitivos de alta frequência (Cunha&Cintra cap.10 — sem sufixo detectável)
  const ADJETIVOS_PRIM = new Set([
    "bom","boa","bons","boas","mau","má","maus","más",
    "belo","bela","belos","belas","lindo","linda","lindos","lindas",
    "feio","feia","feios","feias","livre","livres",
    "triste","tristes","forte","fortes","fraco","fraca","fracos","fracas",
    "novo","nova","novos","novas","velho","velha","velhos","velhas",
    "rico","rica","ricos","ricas","pobre","pobres",
    "frio","fria","frios","frias","quente","quentes",
    "raro","rara","raros","raras","claro","clara","claros","claras",
    "escuro","escura","escuros","escuras","quieto","quieta","quietos","quietas",
    "leve","leves","suave","suaves","grave","graves","breve","breves",
    "jovem","jovens","simples","único","única","únicos","únicas",
    "sério","séria","sérios","sérias","feliz","felizes",
    "difícil","difíceis","fácil","fáceis","ruim","ruins",
    "ótimo","ótima","ótimos","ótimas","alto","alta","altos","altas",
    "baixo","baixa","baixos","baixas","grande","grandes",
    "largo","larga","largos","largas","longo","longa","longos","longas",
    "curto","curta","curtos","curtas","duro","dura","duros","duras",
    "doce","doces","calmo","calma","calmos","calmas",
    "bravo","brava","bravos","bravas","fino","fina","finos","finas",
    "nobre","nobres","ágil","ágeis","fértil","férteis","útil","úteis",
    "certos","certas","leal","leais","fiel","fiéis","frugal","frugais",
    "bonito","bonita","bonitos","bonitas","atrasado","atrasada",
    "animado","animada","animados","animadas","fechado","fechada",
    "pensativo","pensativa","pensativos","pensativas",
    "rápido","rápida","rápidos","rápidas","lento","lenta","lentos","lentas",
    "complexo","complexa","complexos","complexas","justa","justo","justos","justas",
    "úmido","úmida","úmidos","úmidas","imediato","imediata","imediatos","imediatas",
    "próximo","próxima","próximos","próximas","eficaz","eficazes",
    "público","pública","públicos","públicas","chato","chata","chatos","chatas",
    "gostoso","gostosa","gostosos","gostosas","cansativo","cansativa",
    "preocupante","rigoroso","rigorosa","solidário","solidária",
    "detalhado","detalhada","coletado","coletada","coletados","coletadas",
    "obrigado","obrigada",
    "social","sociais","federal","federais","natural","naturais",
    "cultural","culturais","nacional","nacionais","regional","regionais",
    "global","globais","formal","formais","normal","normais",
    "oficial","oficiais","especial","especiais","pessoal","pessoais",
    "atual","atuais","fundamental","fundamentais","central","centrais",
    "digital","digitais","ambiental","ambientais","judicial","judiciais",
    "legal","legais","moral","morais","mental","mentais","visual","visuais",
    "verbal","verbais","horizontal","horizontais","vertical","verticais",
    "tropical","tropicais","rural","rurais","vital","vitais",
    "total","totais","real","reais","local","locais",
    "original","originais","parcial","parciais","racial","raciais",
    "brutal","brutais","criminal","criminais","leal","leais",
    "banal","banais","fatal","fatais","ideal","ideais",
    "comercial","comerciais","industrial","industriais","material","materiais",
  ]);

  // Interjeições inequívocas (Cunha&Cintra cap.16); ambíguas como "puxa" (=verbo) e "nossa" (=pronome) excluídas
  const INTERJEICOES = new Set([
    "ah","oh","ih","uh","eh","ei",
    "oba","ufa","xi","vixe","epa","ué","opa","poxa","bah","hem","hein",
    "caramba","eita","eta","arre","ena","uai","credo","ave",
    "alô","tchau","psiu","oxalá",
  ]);

  // Ordinais canônicos sem ambiguidade de substantivo (Cunha&Cintra cap.12)
  // Excluídos por ambiguidade: segundo (preposição), quarto (cômodo), quinto/quinta (quinta-feira), sexta (sexta-feira), nono (avô informal)
  const NUM_ORDINAIS = new Set([
    "primeiro","primeira","primeiros","primeiras",
    "terceiro","terceira","terceiros","terceiras",
    "sétimo","sétima","sétimos","sétimas",
    "oitavo","oitava","oitavos","oitavas",
    "décimo","décima","décimos","décimas",
    "vigésimo","vigésima","vigésimos","vigésimas",
    "trigésimo","trigésima","trigésimos","trigésimas",
    "centésimo","centésima","centésimos","centésimas",
    "milésimo","milésima","milésimos","milésimas",
  ]);

  // ── Desambiguação contextual — segunda passagem sobre o array completo ──────
  // Aplicada após o fallback individual, quando vizinhos já têm tags.
  // Três regras ordenadas por impacto:
  // R1 — sufixos nominais inequívocos → Substantivo
  // R2 — token vazio após Determinante/Preposição → Substantivo
  // R3 — único Verb após Determinante → nominalização (o falar, o poder, o ser)
  // Sufixos nominais inequívocos — Cunha&Cintra cap.5
  // "-oes": plurais de -ção/-são (soluções, ações, nações)
  // "-ao" e "-i" excluídos: ambíguos com verbos (vão, saí)
  const _SUFIXOS_NOM = /(?:cao|sao|oes|dade|tude|eza|ez|ismo|ncia|mento|agem|ista|ura|aria|orio)$/;

  // Transições de alta confiança extraídas do Mac-Morpho (1.17M tokens, NLTK)
  // Só transições com P >= 0.70 entram como regra determinística
  // P(curr | prev): Determiner→Noun 0.76, Numeral→Noun 0.87
  const _BIGRAM_NOUN_PREV = new Set(["Determiner", "Numeral"]);
  const _DIACRITICO_ADJ_AMBIG = new Set(["publica", "publicas", "publico", "publicos"]);
  const _SERIA_ADJ_AMBIG = new Set(["seria", "serias"]);
  const _ADV_INTENS_ADJ_CTX = new Set(["demais", "muito", "muita", "pouco", "pouca", "bastante", "mais", "menos", "tao", "tão", "quase"]);
  const _COPULAS_ADJ_CTX = new Set([
    "ficar", "fica", "ficou", "ficava", "ficavam", "ficara", "ficaram", "ficará", "ficaria", "ficasse", "fique",
    "estar", "esta", "está", "estao", "estão", "estava", "estavam", "esteve", "estivera", "estaria", "estivesse",
    "parecer", "parece", "pareceu", "parecia", "continuar", "continua", "continuava",
    "permanecer", "permanece", "permanecia", "tornar", "tornou", "tornava",
  ]);
  const _PARTICIPIOS_IRR_CTX = new Set([
    "aberto", "aberta", "abertos", "abertas",
    "coberto", "coberta", "cobertos", "cobertas",
    "dito", "dita", "ditos", "ditas",
    "escrito", "escrita", "escritos", "escritas",
    "feito", "feita", "feitos", "feitas",
    "pago", "paga", "pagos", "pagas",
    "posto", "posta", "postos", "postas",
    "visto", "vista", "vistos", "vistas",
    "preso", "presa", "presos", "presas",
    "expulso", "expulsa", "expulsos", "expulsas",
    "aceito", "aceita", "aceitos", "aceitas",
    "oculto", "oculta", "ocultos", "ocultas",
  ]);

  function _isParticipleLike(normNoAccent) {
    return _PARTICIPIOS_IRR_CTX.has(normNoAccent) ||
      /(?:ado|ada|ados|adas|ido|ida|idos|idas)$/.test(normNoAccent);
  }

  function _addUniqueTag(tags, tag) {
    if (!tags.includes(tag)) tags.push(tag);
  }

  function resolverAmbiguidade(tks) {
    for (let i = 0; i < tks.length; i++) {
      const t = tks[i];
      if (!t || /^[.,;:!?—]$/.test(t.text)) continue;
      const na        = _stripDiac(t.normal);
      const prevNorm  = i > 0 ? _stripDiac(tks[i - 1]?.normal || "") : "";
      const nextNorm  = i + 1 < tks.length ? _stripDiac(tks[i + 1]?.normal || "") : "";
      const prevTags  = i > 0 ? (tks[i - 1]?.tags || []) : [];
      const nextTags  = i + 1 < tks.length ? (tks[i + 1]?.tags || []) : [];
      const prevIsDet = prevTags.includes("Determiner");
      const prevIsCtx = prevIsDet || prevTags.includes("Preposition");
      const prevHighNoun = prevTags.some(pt => _BIGRAM_NOUN_PREV.has(pt));
      const prevLooksNominal = prevTags.includes("Noun") || prevTags.includes("Pronoun") || prevTags.includes("Adjective");

      // R1 — sufixos nominais inequívocos: tag vazio → Substantivo
      if (t.tags.length === 0 && na.length > 4 && _SUFIXOS_NOM.test(na))
        t.tags.push("Noun");

      // R2 — após Determinante ou Preposição, ainda sem tag → Substantivo
      if (t.tags.length === 0 && prevIsCtx)
        t.tags.push("Noun");

      // R3 — apenas [Verb] após Determinante → nominalização (o falar, o poder)
      if (t.tags.length === 1 && t.tags[0] === "Verb" && prevIsDet)
        t.tags[0] = "Noun";

      // R4 (Mac-Morpho) — após Determiner ou Numeral, qualquer tag Verb → rebaixar para Noun
      // P(Noun|Determiner)=0.76, P(Noun|Numeral)=0.87
      if (prevHighNoun && t.tags.includes("Verb") && !t.tags.includes("Noun")) {
        t.tags = t.tags.filter(tt => tt !== "Verb");
        t.tags.push("Noun");
      }

      // R5 — locuções temporais: "por enquanto" e "enquanto isso" não devem
      // cair como conjunção isolada.
      if (na === "por" && nextNorm === "enquanto") {
        t.tags = t.tags.filter(tt => tt !== "Noun");
      }
      if (na === "enquanto" && (prevNorm === "por" || nextNorm === "isso")) {
        t.tags = t.tags.filter(tt => tt !== "Conjunction" && tt !== "Noun");
        _addUniqueTag(t.tags, "Adverb");
      }

      // R6 — diacríticos distintivos sem acento: preservar a leitura verbal,
      // mas registrar a leitura adjetiva quando o contexto nominal pede alerta
      // ortográfico ("opinião pública", "conversa séria").
      if (_DIACRITICO_ADJ_AMBIG.has(na) && t.tags.includes("Verb") && prevTags.includes("Noun") && nextTags.includes("Verb")) {
        _addUniqueTag(t.tags, "Adjective");
      }
      if (_SERIA_ADJ_AMBIG.has(na) && t.tags.includes("Verb") && prevTags.includes("Noun") && !prevTags.includes("Pronoun") && _ADV_INTENS_ADJ_CTX.has(nextNorm)) {
        _addUniqueTag(t.tags, "Adjective");
      }

      // R7 — particípio adjetivado: depois de nome ou de cópula predicativa,
      // a forma precisa carregar também leitura adjetiva.
      if (t.tags.includes("Verb") && _isParticipleLike(na)) {
        if ((prevLooksNominal && !prevTags.includes("Preposition")) || _COPULAS_ADJ_CTX.has(prevNorm)) {
          _addUniqueTag(t.tags, "Adjective");
        }
      }
    }
    return tks;
  }

  function analisarMorfologiaFallback(texto) {
    const tokens = texto.match(/[\p{L}'-]+|[.,;:!?—]/gu) || [];
    const resultado = tokens.map((word, i) => {
      const norm = word.toLowerCase();
      const tags = [];
      if (ARTIGOS_DEF.has(norm)) {
        tags.push("Determiner");
      } else if (norm === "a") {
        // "a" ambíguo: artigo feminino ou preposição
        // Heurística: se próximo token inicia com maiúscula mid-sentence → preposição; senão → artigo
        const _nextTok = i + 1 < tokens.length ? tokens[i + 1] : null;
        const _nextIsProper = _nextTok !== null && /^\p{Lu}/u.test(_nextTok) && i > 0;
        tags.push(_nextIsProper ? "Preposition" : "Determiner");
      } else if (PREPS_OI.has(norm)) {
        tags.push("Preposition");
      } else if (CONTRACOES_PREP_DEM.has(norm)) {
        tags.push("Preposition");
      }
      if (_data && identificarConjuncao(word, { posInicio: i === 0 })) tags.push("Conjunction");
      // Pronomes pessoais antes dos padrões verbais — evita falso-positivo em "qualquer", "todos"
      if (PRONOMES_SUBJ.has(norm))      { tags.push("Pronoun"); tags.push("Noun"); }
      else if (PRONOMES_OBL.has(norm))  { tags.push("Pronoun"); }
      else if (PRONOMES_INDF.has(norm)) { tags.push("Pronoun"); tags.push("Noun"); }
      else if (PRONOMES_DEM.has(norm))  { tags.push("Pronoun"); }
      else if (PRONOMES_POSS.has(norm)) { tags.push("Pronoun"); tags.push("Possessive"); }
      else if (NUM_CARDINAIS.has(norm)) { tags.push("Noun"); tags.push("Numeral"); }
      else if (NUM_ORDINAIS.has(norm)) { tags.push("Adjective"); tags.push("Numeral"); }
      else if (INTERJEICOES.has(norm)) { tags.push("Interjection"); }
      // P0.4: verificar verbos irregulares e presentes ANTES de adjetivos — evita sequestro
      else if (VERBOS_AUX.has(norm)) { tags.push("Verb"); }
      else if (_VERBOS_IRR.size > 0 && !PREPS_OI.has(norm) && _VERBOS_IRR.has(_stripDiac(norm))) { tags.push("Verb"); }
      else if (_VERBOS_PRES.size > 0 && _VERBOS_PRES.has(_stripDiac(norm)) && i > 0 && !PREPS_OI.has(tokens[i-1].toLowerCase()) && !ARTIGOS_DEF.has(tokens[i-1].toLowerCase()) && !(i >= 2 && (ARTIGOS_DEF.has(tokens[i-2].toLowerCase()) || tokens[i-2].toLowerCase() === "a"))) { tags.push("Verb"); }
      else if (ADJETIVOS_PRIM.has(norm) || (_ADJ_EXT.size > 0 && _ADJ_EXT.has(_stripDiac(norm)))) { tags.push("Adjective"); }
      else if (ADV_NEGACAO.has(norm)) { tags.push("Adverb"); tags.push("Negative"); }
      else if (ADV_AFIRM.has(norm))   { tags.push("Adverb"); }
      else if (ADV_TEMPO.has(norm))   { tags.push("Adverb"); }
      else if (ADV_LUGAR.has(norm))   { tags.push("Adverb"); }
      else if (ADV_MODO.has(norm))    { tags.push("Adverb"); }
      else if (ADV_INTENS.has(norm))  { tags.push("Adverb"); }
      else if (ADV_DUVIDA.has(norm))  { tags.push("Adverb"); }
      else {
        // Nome próprio: inicial maiúscula após token que não encerra sentença
        const prevToken = i > 0 ? tokens[i - 1] : null;
        const prevEndsSentence = prevToken !== null && /^[.!?]$/.test(prevToken);
        const midSentenceProper = /^\p{Lu}/u.test(word) && i > 0 && !prevEndsSentence;
        if (midSentenceProper) {
          tags.push("ProperNoun");
          tags.push("Noun");
        } else if (i === 0 && /^\p{Lu}/u.test(word)) {
          // Posição 0: prenomes → topônimos/siglas → verbos irr → sufixos seguros → ambíguo
          const normNacc = _stripDiac(norm);
          const isFemNome = _PRENOMES_F.has(normNacc);
          const isMascNome = _PRENOMES_M.has(normNacc);
          if (isFemNome || isMascNome) {
            tags.push("ProperNoun"); tags.push("Noun");
            if (isFemNome) tags.push("FemaleName");
            if (isMascNome) tags.push("MaleName");
          } else if (_TOPONIMOS.has(normNacc) || _SIGLAS.has(normNacc)) {
            tags.push("ProperNoun"); tags.push("Noun");
          } else if (_SUBST_IA.size > 0 && _SUBST_IA.has(normNacc)) {
            tags.push("Noun");
          } else if (VERBOS_LIGACAO.has(norm) || (_VERBOS_IRR.size > 0 && !PREPS_OI.has(norm) && _VERBOS_IRR.has(normNacc))) {
            tags.push("Verb");
          } else if (/(?:oso|osa|avel|ivel)$/.test(normNacc) && normNacc.length > 5) {
            tags.push("Adjective");
          } else if (_VERBOS_PRES.size > 0 && _VERBOS_PRES.has(normNacc)) {
            tags.push("Verb");
          } else {
            if (/(?:ando|endo|indo)$/.test(norm)) { tags.push("Verb"); tags.push("Gerund"); }
            else if (norm.length > 4 && /(?:aram|eram|iram|ava|avam|ará|erá|irá|asse|esse|isse|ou|eu|iu|ei)$/.test(norm)) tags.push("Verb");
            else tags.push("Noun");
          }
        } else {
          if (/mente$/.test(norm) && norm.length > 6) tags.push("Adverb");
          const _na = _stripDiac(norm);
          if (/(?:oso|osa)$/.test(_na) && _na.length > 5) tags.push("Adjective");
          if (/(?:avel|ivel)$/.test(_na) && _na.length > 5) tags.push("Adjective");
          if (/(?:ante|ente)$/.test(_na) && _na.length > 6) tags.push("Adjective");
          if (/(?:udo|uda|udos|udas)$/.test(_na) && _na.length > 5) tags.push("Adjective");
          if (/(?:ento|enta)$/.test(_na) && _na.length > 6) tags.push("Adjective");
          if (/(?:ivo|iva|ivos|ivas)$/.test(_na) && _na.length > 5) tags.push("Adjective");
          // P0.6: clitico hifenizado → base verbal + clitico
          const _cliSet = new Set(["me","te","se","o","a","lo","la","lhe","nos","vos","lhes","los","las"]);
          const _clParts = norm.split("-");
          if (_clParts.length >= 2 && _clParts.slice(1).every(p => _cliSet.has(p))) {
            tags.push("Verb"); // base + clítico = verbo
          } else if (/(?:ando|endo|indo)$/.test(norm)) { tags.push("Verb"); tags.push("Gerund"); }
          else if (/(?:ar|er|ir|or)$/.test(norm) && norm.length > 3 && !PREPS_OI.has(norm)) tags.push("Verb");
          // P0.5: flexões acentuadas — usar _na (sem acento) para reconhecer -arão/-erão/-irão etc
          else if (/(?:arao|erao|irao|avamos|iamos|ariamos|eriamos|iriamos|assemos|essemos|issemos|aramos|eramos|iramos|ado|ada|ados|adas|ido|ida|idos|idas)$/.test(_na) && _na.length > 4) {
            // Particípios: verificar se não é substantivo
            if (/(?:ado|ada|idos|idas)$/.test(_na) && _SUBST_IA.size > 0) tags.push("Verb");
            else tags.push("Verb");
          } else if (/(?:ou|eu|iu|ei|aram|eram|iram|ava|avam|ia|iam|ará|erá|irá|aria|eria|iria|asse|esse|isse)$/.test(norm) && norm.length > 3) {
            // Substantivos femininos terminados em -ia não são verbos (notícia, história, família…)
            const nacc = _stripDiac(norm);
            if (/ia$/.test(norm) && _SUBST_IA.size > 0 && _SUBST_IA.has(nacc)) tags.push("Noun");
            else tags.push("Verb");
          } else if (VERBOS_LIGACAO.has(norm)) tags.push("Verb");
          else if (_VERBOS_IRR.size > 0 && !PREPS_OI.has(norm) && _VERBOS_IRR.has(_na)) tags.push("Verb");
          else if (_VERBOS_PRES.size > 0 && _VERBOS_PRES.has(_na)) {
            // Guarda contextual: após artigo ou preposição, a forma presente é provavelmente substantivo
            const _prevNorm = prevToken ? prevToken.toLowerCase() : null;
            const _prevIsNounCtx = _prevNorm !== null && (ARTIGOS_DEF.has(_prevNorm) || _prevNorm === "a" || PREPS_OI.has(_prevNorm));
            if (!_prevIsNounCtx) tags.push("Verb");
          }
        }
      }
      return { text: word, tags, normal: norm };
    });
    return resolverAmbiguidade(resultado);
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
      Possessive:"Possessivo", Numeral:"Numeral", Negative:"Negação", Interjection:"Interjeição",
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
    "permanece","permaneceu","permanecia","permanecerá",
    "são","eram","foram","serão","seriam","fossem","sejam",
  ]);

  // Verbos auxiliares e existenciais — têm/ter/haver: tag Verb sem função de ligação
  const VERBOS_AUX = new Set([
    "ter","tem","têm","tinha","tinham","tive","teve","tivemos","tiveram",
    "terá","terão","teria","teriam","tivesse","tivessem","tenha","tenham",
    "haver","há","havia","houve","houveram","haverá","haveria","haja",
  ]);

  // ── Preposições essenciais — Cunha&Cintra cap.15 + Bechara Lições §OI ────────
  // PREPS_OI: contrações de a/de/em/por com artigo (já estavam) + preposições
  // essenciais sem contração. Usado como guarda anti-verbo e como tag Preposição.
  const PREPS_OI = new Set([
    "a","ao","à","aos","às","de","do","da","dos","das","em","no","na","nos","nas",
    "para","por","pelo","pela","pelos","pelas",
    "com","sem","sobre","sob","entre","contra","ante","após","desde","até","perante","durante",
  ]);

  // ── Artigos definidos/indefinidos inequívocos — Bechara §§ 128-130 ─────────
  // "a" excluído: ambíguo com preposição — tratado separadamente na posição 0
  const ARTIGOS_DEF = new Set(["o","os","as","um","uma","uns","umas"]);

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
  const ADV_TEMPO   = new Set(["ontem","hoje","amanhã","agora","antes","depois","cedo","tarde","logo","já","sempre","nunca","jamais","antigamente","outrora","então","enfim","finalmente","ainda","brevemente","imediatamente"]);
  const ADV_LUGAR   = new Set(["aqui","ali","lá","cá","aí","abaixo","acima","dentro","fora","atrás","adiante","perto","longe","onde","alhures","algures","acolá"]);
  const ADV_MODO    = new Set(["assim","bem","mal","melhor","pior","devagar","depressa","rapidamente","lentamente","facilmente","dificilmente","calmamente"]);
  const ADV_NEGACAO = new Set(["não","nem","jamais","nunca","tampouco"]);
  const ADV_AFIRM   = new Set(["sim","certamente","decerto","efetivamente","realmente","também","inclusive"]);
  const ADV_INTENS  = new Set(["muito","muita","pouco","pouca","bastante","mais","menos","tão","tanto","quão","quase","demais","apenas","somente","só"]);
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
      const isPrep = tags.includes("Preposition") || (PREPS_OI.has(norm) && norm !== "a");
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
    const locucoesAdverbiais = [
      { locucao: "por enquanto", relacao: "tempo", descricao: "locução adverbial temporal: por ora, até este momento", classe: "adverbial" },
      { locucao: "enquanto isso", relacao: "tempo", descricao: "conector temporal de simultaneidade", classe: "adverbial" },
    ];

    for (const item of locucoesAdverbiais) {
      if (norm.includes(item.locucao)) encontradas.push(item);
    }

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
    PRONOMES_POSS,
    CONTRACOES_PREP_DEM,
    NUM_CARDINAIS,
    NUM_ORDINAIS,
    INTERJEICOES,
    ADJETIVOS_PRIM,
    ADV_TEMPO, ADV_LUGAR, ADV_MODO, ADV_NEGACAO, ADV_AFIRM, ADV_INTENS, ADV_DUVIDA,
    VERBOS_AUX,
  };

})(window);
