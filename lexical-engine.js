(function lexicalEngine(global) {
  let localLexicon = {};
  let functionWords = { artigos:[], contracoes:[], conjuncoes:[], preposicoes:[], pronomes:[], adverbios:[] };
  let _loaded = false;
  let _loadError = false;

  async function ensureLoaded() {
    if (_loaded || _loadError) return;
    try {
      const data = await fetch('lexical-data.json').then(r => r.json());
      localLexicon  = data.localLexicon  || {};
      functionWords = data.functionWords || functionWords;
      _loaded = true;
    } catch (_) {
      _loadError = true;
    }
  }

  // Carregar na inicialização (não bloqueia)
  ensureLoaded();

  // ── Locuções multi-palavra — LOC-PREP-01..E.2 + Cunha&Cintra cap.15-16 ─────────
  const LOCUCOES = {
    // PREPOSITIVAS DE LUGAR
    "abaixo":    [{ loc:"abaixo de",      classe:"Preposição" }],
    "acima":     [{ loc:"acima de",       classe:"Preposição" }],
    "adiante":   [{ loc:"adiante de",     classe:"Preposição" }],
    "ao":        [{ loc:"ao lado de",     classe:"Preposição" }, { loc:"ao longo de", classe:"Preposição" },
                  { loc:"ao redor de",    classe:"Preposição" }, { loc:"ao invés de", classe:"Preposição" },
                  { loc:"ao passo que",   classe:"Conjunção"  }, { loc:"ao mesmo tempo",classe:"Advérbio" }],
    "atras":     [{ loc:"atras de",       classe:"Preposição" }],
    "atraves":   [{ loc:"atraves de",     classe:"Preposição" }],
    "debaixo":   [{ loc:"debaixo de",     classe:"Preposição" }],
    "defronte":  [{ loc:"defronte de",    classe:"Preposição" }],
    "dentro":    [{ loc:"dentro de",      classe:"Preposição" }],
    "diante":    [{ loc:"diante de",      classe:"Preposição" }],
    "em":        [{ loc:"em cima de",     classe:"Preposição" }, { loc:"em frente a",   classe:"Preposição" },
                  { loc:"em torno de",    classe:"Preposição" }, { loc:"em vez de",      classe:"Preposição" },
                  { loc:"em virtude de",  classe:"Preposição" }, { loc:"em razao de",    classe:"Preposição" },
                  { loc:"em funcao de",   classe:"Preposição" }, { loc:"em relacao a",   classe:"Preposição" },
                  { loc:"em prol de",     classe:"Preposição" }, { loc:"em face de",     classe:"Preposição" },
                  { loc:"em vista de",    classe:"Preposição" }, { loc:"em lugar de",    classe:"Preposição" },
                  { loc:"em conformidade com",classe:"Preposição"}],
    "fora":      [{ loc:"fora de",        classe:"Preposição" }],
    "junto":     [{ loc:"junto a",        classe:"Preposição" }, { loc:"junto de", classe:"Preposição" }],
    "perto":     [{ loc:"perto de",       classe:"Preposição" }],
    // PREPOSITIVAS DE CAUSA
    "por":       [{ loc:"por causa de",   classe:"Preposição" }, { loc:"por mais que",  classe:"Conjunção"  },
                  { loc:"por meio de",    classe:"Preposição" }, { loc:"por conta de",  classe:"Preposição" },
                  { loc:"por intermedio de",classe:"Preposição"}, { loc:"por menos que", classe:"Conjunção" }],
    "gracas":    [{ loc:"gracas a",       classe:"Preposição" }],
    // PREPOSITIVAS DE OPOSIÇÃO
    "a":         [{ loc:"a fim de",       classe:"Preposição" }, { loc:"a menos que",   classe:"Conjunção"  },
                  { loc:"a nao ser que",  classe:"Conjunção"  }, { loc:"a despeito de", classe:"Preposição" },
                  { loc:"a par de",       classe:"Preposição" }, { loc:"a respeito de", classe:"Preposição" },
                  { loc:"a custa de",     classe:"Preposição" }, { loc:"a medida que",  classe:"Conjunção"  },
                  { loc:"a proporcao que",classe:"Conjunção"  }, { loc:"a partir de",   classe:"Preposição" }],
    "apesar":    [{ loc:"apesar de",      classe:"Preposição" }, { loc:"apesar de que", classe:"Conjunção"  }],
    // PREPOSITIVAS DE REFERÊNCIA
    "acerca":    [{ loc:"acerca de",      classe:"Preposição" }],
    "quanto":    [{ loc:"quanto a",       classe:"Preposição" }],
    "no":        [{ loc:"no tocante a",   classe:"Preposição" }],
    "face":      [{ loc:"face a",         classe:"Preposição" }],
    "mediante":  [{ loc:"mediante",       classe:"Preposição" }],
    // CONJUNTIVAS CAUSAIS
    "uma":       [{ loc:"uma vez que",    classe:"Conjunção"  }],
    "ja":        [{ loc:"ja que",         classe:"Conjunção"  }],
    "visto":     [{ loc:"visto que",      classe:"Conjunção"  }, { loc:"visto como", classe:"Conjunção" }],
    "dado":      [{ loc:"dado que",       classe:"Conjunção"  }],
    "porquanto": [{ loc:"porquanto",      classe:"Conjunção"  }],
    // CONJUNTIVAS CONCESSIVAS
    "ainda":     [{ loc:"ainda que",      classe:"Conjunção"  }],
    "mesmo":     [{ loc:"mesmo que",      classe:"Conjunção"  }],
    "posto":     [{ loc:"posto que",      classe:"Conjunção"  }],
    "bem":       [{ loc:"bem que",        classe:"Conjunção"  }, { loc:"bem como",  classe:"Conjunção"  }],
    "se":        [{ loc:"se bem que",     classe:"Conjunção"  }],
    // CONJUNTIVAS CONDICIONAIS
    "contanto":  [{ loc:"contanto que",   classe:"Conjunção"  }],
    "salvo":     [{ loc:"salvo se",       classe:"Conjunção"  }],
    "desde":     [{ loc:"desde que",      classe:"Conjunção"  }],
    "a menos":   [{ loc:"a menos que",    classe:"Conjunção"  }],
    // CONJUNTIVAS FINAIS
    "para":      [{ loc:"para que",       classe:"Conjunção"  }],
    // CONJUNTIVAS TEMPORAIS
    "logo":      [{ loc:"logo que",       classe:"Conjunção"  }],
    "assim":     [{ loc:"assim que",      classe:"Conjunção"  }, { loc:"assim como", classe:"Conjunção"  }],
    "antes":     [{ loc:"antes que",      classe:"Conjunção"  }, { loc:"antes de",   classe:"Preposição" }],
    "depois":    [{ loc:"depois que",     classe:"Conjunção"  }, { loc:"depois de",  classe:"Preposição" }],
    "sempre":    [{ loc:"sempre que",     classe:"Conjunção"  }],
    "cada":      [{ loc:"cada vez que",   classe:"Conjunção"  }],
    // CONJUNTIVAS CONSECUTIVAS
    "de":        [{ loc:"de forma que",   classe:"Conjunção"  }, { loc:"de modo que", classe:"Conjunção" },
                  { loc:"de maneira que", classe:"Conjunção"  }, { loc:"de sorte que", classe:"Conjunção" },
                  { loc:"de acordo com",  classe:"Preposição" }],
    // CONJUNTIVAS COMPARATIVAS
    "tal":       [{ loc:"tal qual",       classe:"Conjunção"  }, { loc:"tal como",    classe:"Conjunção"  }],
    "tanto":     [{ loc:"tanto quanto",   classe:"Conjunção"  }],
    "mais":      [{ loc:"mais do que",    classe:"Conjunção"  }],
    "menos":     [{ loc:"menos do que",   classe:"Conjunção"  }],
    "que":       [{ loc:"que nem",        classe:"Conjunção"  }],
    // CONJUNTIVAS PROPORCIONAIS
    "quanto":    [{ loc:"quanto mais",    classe:"Conjunção"  }],
    "nao":       [{ loc:"nao so",         classe:"Conjunção"  }],
  };

  // ── Pronomes pessoais retos (Bechara MGP §pronomes pessoais) ──────────────────
  const PRON_PESSOAIS_RETOS = new Set([
    "eu","tu","ele","ela","nos","vos","eles","elas","voce","voces",
    "a gente"
  ]);

  // Pronomes pessoais oblíquos átonos
  const PRON_OBLIQUOS_ATONOS = new Set([
    "me","te","se","nos","vos","o","a","os","as","lhe","lhes",
    "lo","la","los","las","no","na"
  ]);

  // Pronomes oblíquos tônicos (sempre com preposição)
  const PRON_OBLIQUOS_TONICOS = new Set([
    "mim","ti","si","consigo","conosco","convosco","comigo","contigo"
  ]);

  // Pronomes possessivos (Bechara MGP §pronomes possessivos)
  const PRON_POSSESSIVOS = new Set([
    "meu","minha","meus","minhas",
    "teu","tua","teus","tuas",
    "seu","sua","seus","suas",
    "nosso","nossa","nossos","nossas",
    "vosso","vossa","vossos","vossas"
  ]);

  // Pronomes demonstrativos + contrações (Bechara MGP §pronomes demonstrativos)
  const PRON_DEMONSTRATIVOS = new Set([
    "este","esta","isto","neste","nesta","nisto","deste","desta","disto",
    "esse","essa","isso","nesse","nessa","nisso","desse","dessa","disso",
    "aquele","aquela","aquilo","naquele","naquela","naquilo","daquele","daquela","daquilo"
  ]);

  // Pronomes indefinidos substantivos (Bechara MGP §pronomes indefinidos)
  const PRON_INDEF_SUBST = new Set([
    "alguem","ninguem","tudo","nada","algo","outrem"
  ]);

  // Pronomes indefinidos adjetivos variáveis
  const PRON_INDEF_ADJ = new Set([
    "algum","alguma","alguns","algumas",
    "nenhum","nenhuma","nenhuns","nenhumas",
    "outro","outra","outros","outras",
    "certo","certa","certos","certas",
    "qualquer","quaisquer","cada",
    "muito","muita","muitos","muitas",
    "pouco","pouca","poucos","poucas",
    "todo","toda","todos","todas",
    "tanto","tanta","tantos","tantas",
    "quanto","quanta","quantos","quantas",
    "vario","varia","varios","varias",
    "diverso","diversa","diversos","diversas",
    "mais","menos","ambos","ambas"
  ]);

  // Pronomes relativos (Bechara MGP §pronomes relativos)
  const PRON_RELATIVOS = new Set([
    "que","qual","quais","quem","onde","cujo","cuja","cujos","cujas",
    "o qual","a qual","os quais","as quais","quanto","quanta","quantos","quantas"
  ]);

  // Verbos de cognição/dicção/vontade que desencadeiam "que" integrante
  const VERBOS_COGNICAO = new Set([
    "sei","sabe","sabemos","sabem","soube","sabia","saber",
    "acho","acha","achamos","acham","achou","achar",
    "quero","quer","queremos","querem","quiz","queria","querer",
    "espero","espera","esperamos","esperam","esperou","esperar",
    "disse","diz","dizemos","dizem","dizer","falou","fala","falar",
    "crer","creio","cre","cremos","creem","creu","cria",
    "penso","pensa","pensamos","pensam","pensou","pensar",
    "sinto","sente","sentimos","sentem","sentiu","sentir",
    "vejo","ve","vemos","veem","viu","ver",
    "ouvi","ouve","ouvimos","ouvem","ouvir",
    "temo","teme","tememos","temem","temeu","temer",
    "lembro","lembra","lembramos","lembram","lembrou","lembrar",
    "imagino","imagina","imaginamos","imaginam","imaginou","imaginar",
    "afirmo","afirma","afirmamos","afirmam","afirmou","afirmar",
    "nego","nega","negamos","negam","negou","negar",
    "duvido","duvida","duvidamos","duvidam","duvidou","duvidar",
    "parece","parecem","pareceu","parecia","parecer",
    "noto","nota","notamos","notam","notou","notar"
  ]);

  // Verbos de pergunta que desencadeiam "se" integrante
  const VERBOS_PERGUNTA = new Set([
    "sei","sabe","sabemos","sabem","saber",
    "pergunto","pergunta","perguntamos","perguntam","perguntou","perguntar",
    "ignoro","ignora","ignoramos","ignoram","ignorou","ignorar",
    "descubro","descobre","descobrimos","descobrem","descobriu","descobrir",
    "investigo","investiga","investigamos","investigam","investigou","investigar"
  ]);

  // ── Desambiguação contextual — algoritmo em cascata (Bechara MGP + Cunha&Cintra) ──
  const POLISSEMIA = {
    "que": (prev, next) => {
      // 1. Após substantivo/pronome → relativo (DESAM-QUE-02)
      if (prev && !PRON_OBLIQUOS_ATONOS.has(normalizeWord(prev))) {
        const pNorm = normalizeWord(prev);
        if (VERBOS_COGNICAO.has(pNorm)) return "Conjunção"; // integrante
        // Se veio de uma palavra que pode ser antecedente nominal (não é verbo ou conj)
        if (!/^(e|ou|mas|porem|contudo|todavia|entretanto|porque|quando|se|como|embora|se|que)$/.test(pNorm)) {
          // é provavelmente relativo
          return "Pronome relativo";
        }
      }
      // 2. Após verbo de cognição → integrante (DESAM-QUE-01)
      if (prev && VERBOS_COGNICAO.has(normalizeWord(prev))) return "Conjunção";
      // 3. Início de período → interrogativo ou exclamativo (DESAM-QUE-03)
      if (!prev) return "Pronome interrogativo";
      return "Conjunção";
    },
    "como": (prev, next) => {
      // Início de período + sem correlativo → causal (DESAM-COMO-01)
      if (!prev) return "Conjunção";
      // Em interrogação → advérbio (DESAM-COMO-03)
      return "Advérbio";
    },
    "quando": (prev, next) => {
      // Advérbio interrogativo se em pergunta, senão temporal (DESAM-QUANDO-01/02)
      if (!prev) return "Conjunção"; // início = temporal ou interrogativo
      return "Conjunção";
    },
    "se": (prev, next) => {
      // 1. Após verbo de pergunta → integrante (DESAM-SE-02)
      if (prev && VERBOS_PERGUNTA.has(normalizeWord(prev))) return "Conjunção";
      // 2. Início → condicional (DESAM-SE-01)
      if (!prev) return "Conjunção";
      // 3. No interior → reflexivo/recíproco (DESAM-SE-03)
      return "Pronome pessoal";
    },
    "pois": (prev) => {
      // Início → explicativo; posposto → conclusivo (DESAM-POIS-01/02)
      return "Conjunção";
    },
    "mas": () => "Conjunção",
    "nem": () => "Conjunção",
    "porem": () => "Conjunção",
    "contudo": () => "Conjunção",
    "todavia": () => "Conjunção",
    "entretanto": () => "Conjunção",
    "logo": (prev) => {
      // "logo" conclusivo pode ser substituído por "portanto" (DESAM-LOGO-01)
      // "logo" temporal = "em seguida" (DESAM-LOGO-02)
      if (!prev) return "Conjunção"; // conclusivo no início
      return "Advérbio"; // temporal no interior
    },
    "ora": (prev) => {
      // "ora...ora" alternativo (DESAM-ORA-01)
      return "Conjunção";
    },
    "senao": () => "Conjunção", // adversativa/condicional negativa (DESAM-SENAO-01)
    // "mais" como advérbio de intensidade vs indefinido
    "mais": () => "Advérbio",
    "menos": () => "Advérbio",
  };

  // ── Classificação contextual ──────────────────────────────────────────────────
  function inferWordClassContextual(word, text) {
    const normalized = normalizeWord(word);
    const original   = word;

    // 1. Verificar locuções multi-palavra no texto
    if (text && LOCUCOES[normalized]) {
      const textNorm = normalizeWord(text).toLowerCase();
      const wordPos  = textNorm.indexOf(normalized);
      if (wordPos !== -1) {
        for (const { loc, classe } of LOCUCOES[normalized]) {
          const locNorm = loc.split(" ").map(normalizeWord).join(" ");
          if (textNorm.slice(wordPos).startsWith(locNorm)) {
            return classe;
          }
        }
      }
    }

    // 2. Polissemia com contexto local (janela ±2 palavras)
    if (POLISSEMIA[normalized] && text) {
      const tokens = tokenizeWords(text);
      const idx    = tokens.findIndex(t => normalizeWord(t) === normalized);
      if (idx !== -1) {
        const prev = idx > 0   ? tokens[idx-1] : null;
        const next = idx < tokens.length-1 ? tokens[idx+1] : null;
        const result = POLISSEMIA[normalized](prev, next);
        if (result) return result;
      }
    }

    // 3. Fallback para inferência simples
    return inferWordClass(normalized, original);
  }

  function analyze(word, text) {
    if (!word?.trim()) return null;
    const selectedWord = word.trim();
    const normalized = normalizeWord(selectedWord);
    const lexiconEntry = localLexicon[normalized];
    // Usar classificação contextual quando há texto disponível
    const className = lexiconEntry?.className
      || (text ? inferWordClassContextual(selectedWord, text) : inferWordClass(normalized, selectedWord));

    return {
      word: normalized,
      displayWord: lexiconEntry?.label || selectedWord,
      className,
      functionName: inferFunctionName(className),
      field: lexiconEntry?.field || inferSemanticField(normalized, className),
      note: lexiconEntry?.note || createLocalNote(className, normalized),
      count: countWordOccurrences(text, normalized),
    };
  }

  // ── PARTICÍPIOS IRREGULARES — Cunha&Cintra + Bechara §particípio ──────────────
  const PARTICIPIOS_IRR = new Set([
    "aberto","coberto","descoberto","dito","escrito","feito","posto","visto","vindo",
    "ganho","gasto","pago","aceito","aceso","eleito","entregue","expresso","expulso",
    "impresso","limpo","morto","preso","salvo","solto","tinto"
  ]);

  // ── INFERÊNCIA MORFOLÓGICA COM REGRAS DE BECHARA + CUNHA&CINTRA ──────────────
  function inferWordClass(normalized, original) {
    // 1. Pronomes pessoais retos — PRON-PESS-01
    if (PRON_PESSOAIS_RETOS.has(normalized)) return "Pronome pessoal";

    // 2. Pronomes oblíquos átonos — PRON-PESS-02
    if (PRON_OBLIQUOS_ATONOS.has(normalized) && normalized.length <= 3) return "Pronome pessoal";

    // 3. Pronomes oblíquos tônicos — PRON-PESS-03
    if (PRON_OBLIQUOS_TONICOS.has(normalized)) return "Pronome pessoal";

    // 4. Pronomes possessivos — PRON-POSS-01
    if (PRON_POSSESSIVOS.has(normalized)) return "Pronome possessivo";

    // 5. Pronomes demonstrativos — PRON-DEM-01/02/03
    if (PRON_DEMONSTRATIVOS.has(normalized)) return "Pronome demonstrativo";

    // 6. Pronomes indefinidos — PRON-INDEF-01/02/03
    if (PRON_INDEF_SUBST.has(normalized)) return "Pronome indefinido";
    if (PRON_INDEF_ADJ.has(normalized))   return "Pronome indefinido";

    // 7. Palavras funcionais do lexical-data.json
    if (functionWords.contracoes.includes(normalized))  return "Preposição/Artigo";
    if (functionWords.artigos.includes(normalized))     return "Artigo";
    if (functionWords.preposicoes.includes(normalized)) return "Preposição";
    if (functionWords.conjuncoes.includes(normalized))  return "Conjunção";
    if (functionWords.pronomes.includes(normalized))    return "Pronome";
    if (functionWords.adverbios.includes(normalized))   return "Advérbio";
    if ((functionWords.adjetivos_comuns || []).includes(normalized)) return "Adjetivo";

    // 8. Advérbios terminados em -mente — ADV-02 (Cunha&Cintra cap.14)
    if (/mente$/.test(normalized) && normalized.length > 6) return "Advérbio";

    // 9. Substantivo próprio — antes de morfologia verbal (ORDEM-01 regra 4)
    if (original && /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(original) && normalized.length > 2
        && !PARTICIPIOS_IRR.has(normalized)) return "Substantivo próprio";

    // 10. Gerúndio — VERB-GER-01 (Cunha&Cintra cap.13)
    if (/(ando|endo|indo)$/.test(normalized) && normalized.length > 4) return "Verbo (gerúndio)";

    // 11. Particípios irregulares — VERB-PART-02 (prioridade sobre sufixos)
    if (PARTICIPIOS_IRR.has(normalized)) return "Verbo (particípio)";

    // 12. Particípios regulares — VERB-PART-01
    if (/(ado|ada|ados|adas|ido|ida|idos|idas)$/.test(normalized) && normalized.length > 4
        && !/^(cada|fiada|morada|parada|jornada|armada|fachada|estrada)$/.test(normalized))
      return "Verbo (particípio)";

    // 13. Subjuntivo imperfeito — VERB-SUBJ-IMPERF-01 (mais específico — antes de infinitivo)
    if (/(asse|asses|assem|esse|esses|essem|isse|isses|issem|assemos|essemos|issemos)$/.test(normalized)
        && normalized.length > 4) return "Verbo (subjuntivo)";

    // 14. Futuro do pretérito (condicional) — VERB-IND-FUT-02
    if (/(aria|arias|ariam|eria|erias|eriam|iria|irias|iriam|ariamos|eriamos|iriamos)$/.test(normalized)
        && normalized.length > 5) return "Verbo flexionado";

    // 15. Mais-que-perfeito simples — VERB-IND-MQP-01 (Bechara §derivados do pret. perf.)
    if (/(ara|aras|aram|aramos|era|eras|eram|eramos|ira|iras|iram|iramos)$/.test(normalized)
        && normalized.length > 3
        && !/(para|cara|vara|mara|sara|lara|fara|rara|clara|amara|para)$/.test(normalized))
      return "Verbo (imperfeito)";

    // 16. Indicativo imperfeito — VERB-IND-IMPERF-01/02
    if (/(ava|avas|avam|avamos|ia|ias|iam|iamos)$/.test(normalized) && normalized.length > 4)
      return "Verbo (imperfeito)";

    // 17. Pretérito perfeito — VERB-IND-PERF-01/02/03
    if (/(ou|eu|iu|ei|aste|este|iste|aram|eram|iram)$/.test(normalized) && normalized.length > 3)
      return "Verbo flexionado";

    // 18. Futuro do presente — VERB-IND-FUT-01
    if (/(arei|aras|ara|aremos|areis|arao|erei|eras|era|eremos|ereis|erao|irei|iras|ira|iremos|ireis|irao)$/.test(normalized))
      return "Verbo flexionado";

    // 19. Subjuntivo presente — resolvido via contexto em inferWordClassContextual
    // (desinências -e/-a são ambíguas sem vizinhos — omite-se aqui)

    // 20. Infinitivo — VERB-INF-PESS-01
    if (/^.+(ar|er|ir|or)$/.test(normalized) && normalized.length > 3) return "Verbo no infinitivo";

    // 21. Adjetivos por sufixos — Cunha&Cintra cap.5
    if (/(oso|osa|vel|veis|ivo|iva|ico|ica|ino|ina)$/.test(normalized)
        && normalized.length > 4) return "Adjetivo";

    // 22. Sufixos nominalizadores seguros — Bechara MGP §derivação sufixal
    // -ção/-são/-ssão: substantivos deverbais e deadjetivais
    if (/(cao|sao|ssao|acao|icao|ificacao|izacao)$/.test(normalized) && normalized.length > 4)
      return "Substantivo";
    // -dade/-tude: abstratos de qualidade
    if (/(dade|tude)$/.test(normalized) && normalized.length > 5)
      return "Substantivo";
    // -ismo: doutrina, movimento, tendência
    if (/ismo$/.test(normalized) && normalized.length > 4)
      return "Substantivo";
    // -eza/-ura: abstratos de qualidade ou resultado
    if (/(eza|ura)$/.test(normalized) && normalized.length > 4
        && !/(lura|tura|sura|xura)$/.test(normalized)) // evitar adj como "adura"
      return "Substantivo";
    // -mento: resultado de ação
    if (/mento$/.test(normalized) && normalized.length > 5)
      return "Substantivo";
    // -ncia/-nça: estado, qualidade (Bechara §sufixos -ância/-ência)
    if (/(ncia|nca)$/.test(normalized) && normalized.length > 4)
      return "Substantivo";
    // -or/-ura como substantivos de agente/resultado (quando não verbo já tratado acima)
    if (/or$/.test(normalized) && normalized.length > 3
        && !/^.+(ar|er|ir)or$/.test(normalized)) // não é radical verbal
      return "Substantivo";

    return "Substantivo provável";
  }

  // ── Gatilhos que desencadeiam subjuntivo — VERB-SUBJ-USO-01/02/03/04 (Bechara MGP + Cunha&Cintra) ──
  // "talvez" → subj. independente (Cunha&Cintra §subj. independente c)
  // Conjunções concessivas → subj. obrigatório (Cunha&Cintra cap.16 §concessivas)
  // Conjunções condicionais com hipótese irreal → subj. imperfeito já tratado
  const GATILHOS_SUBJ_PRES = new Set([
    "talvez","oxala","queira","queiram",
    "embora","conquanto","posto","bem","ainda",
    "mesmo","apesar","nem","caso","contanto"
  ]);

  // Verbos de vontade/sentimento que exigem subj. na subordinada (VERB-SUBJ-USO-01/02)
  const VERBOS_VOLITIVOS = new Set([
    "quero","quer","queremos","querem","quiz","queira","queiram",
    "espero","espera","esperamos","esperam","espere","esperem",
    "desejo","deseja","desejamos","desejam","deseje","desejem",
    "peco","pede","pedimos","pedem","peca","pecam",
    "ordeno","ordena","ordenamos","ordenam","ordene","ordenem",
    "proibo","proibe","proibimos","proibem","proiba","proibam",
    "prefiro","prefere","preferimos","preferem","prefira","prefiram",
    "exijo","exige","exigimos","exigem","exija","exijam",
    "temo","teme","tememos","temem","tema","temam",
    "lamento","lamenta","lamentamos","lamentam","lamente","lamentem",
    "duvido","duvida","duvidamos","duvidam","duvide","duvidem",
    "nego","nega","negamos","negam","negue","neguem",
    "peca","pede","peco","pedi",// variantes
    "e preciso","e necessario","e importante","e possivel","e provavel"
  ]);

  // Desinências do subjuntivo presente por conjugação (VERB-SUBJ-PRES-01/02)
  // 1ª conj: -e, -es, -em, -emos, -eis (cante, cantes, cantem, cantemos, canteis)
  // 2ª/3ª conj: -a, -as, -am, -amos, -ais (venda, vendas, vendam; parta, partas, partam)
  // Irregulares do subj. presente — VERB-SUBJ-PRES-01 apêndice
  const SUBJ_PRES_IRR = new Set([
    "haja","hajas","hajam","hajamos","hajais",
    "seja","sejas","sejam","sejamos","sejais",
    "esteja","estejas","estejam","estejamos","estejais",
    "de","des","dem","demos","deis",
    "va","vas","vao","vamos","vades",
    "queira","queiras","queiram","queiramos","queirais",
    "saiba","saibas","saibam","saibamos","saibais",
    "caiba","caibas","caibam","caibamos","caibais",
    "valha","valhas","valham","valhamos","valhais",
    "possa","possas","possam","possamos","possais"
  ]);

  // ── INFERÊNCIA COM CONTEXTO (vizinhos prev/next) — ORDEM-02 ─────────────────
  function inferWordClassContextual(word, text, prevNorm, nextNorm) {
    const normalized = normalizeWord(word);
    const original   = word;

    // 1. Locuções multi-palavra no texto (prioridade máxima — ORDEM-01 passo 1)
    if (text && LOCUCOES[normalized]) {
      const textNorm = normalizeWord(text).toLowerCase();
      const wordPos  = textNorm.indexOf(normalized);
      if (wordPos !== -1) {
        for (const { loc, classe } of LOCUCOES[normalized]) {
          const locNorm = loc.split(" ").map(normalizeWord).join(" ");
          if (textNorm.slice(wordPos).startsWith(locNorm)) return classe;
        }
      }
    }

    // 2. Desambiguação contextual (ORDEM-02) — palavras polissêmicas
    if (POLISSEMIA[normalized]) {
      const result = POLISSEMIA[normalized](prevNorm, nextNorm);
      if (result) return result;
    }

    // 3. Subjuntivo presente via contexto — VERB-SUBJ-PRES-01/02 + USO-01/02/03
    if (prevNorm) {
      // 3a. Irregular do subj. presente — lista exaustiva
      if (SUBJ_PRES_IRR.has(normalized)) return "Verbo (subjuntivo)";

      // 3b. "talvez/oxalá" imediatamente antes → subj. independente (Cunha&Cintra §c)
      if (GATILHOS_SUBJ_PRES.has(prevNorm)) {
        // Desinência 1ª conj subj. pres.: -e com radical ≥2 chars (cante, fale, ame)
        if (/^.{2,}(e|es|em|emos|eis)$/.test(normalized)
            && !functionWords.artigos?.includes(normalized)
            && !functionWords.preposicoes?.includes(normalized))
          return "Verbo (subjuntivo)";
        // Desinência 2ª/3ª conj subj. pres.: -a com radical ≥3 chars (venda, parta, coma)
        // Exige mínimo 4 chars para evitar colisão com "a" artigo
        if (/^.{3,}(a|as|am|amos|ais)$/.test(normalized)
            && !PRON_DEMONSTRATIVOS.has(normalized)
            && !PRON_INDEF_ADJ.has(normalized))
          return "Verbo (subjuntivo)";
      }

      // 3c. "que" após verbo volitivo → subj. presente na próxima oração
      if (prevNorm === "que" && nextNorm && VERBOS_VOLITIVOS.has(nextNorm)) {
        if (SUBJ_PRES_IRR.has(normalized)) return "Verbo (subjuntivo)";
        if (/^.{2,}(e|es|em|emos|eis|a|as|am|amos|ais)$/.test(normalized)
            && normalized.length > 3)
          return "Verbo (subjuntivo)";
      }
    }

    // 4. Morfologia base
    return inferWordClass(normalized, original);
  }

  // ── Campos semânticos para inferSemanticField e createLocalNote ──────────
  const SEM_MOV  = new Set(["andar","caminhar","correr","voar","saltar","deslizar","arrastar","subir","descer","entrar","sair","chegar","partir","vir","ir","voltar","avançar","recuar","fugir","perseguir","escalar","mergulhar"]);
  const SEM_DIC  = new Set(["dizer","falar","gritar","sussurrar","murmurar","responder","perguntar","declarar","afirmar","negar","confessar","contar","narrar","relatar","anunciar","prometer","jurar","chamar","nomear"]);
  const SEM_COG  = new Set(["pensar","saber","lembrar","esquecer","imaginar","sonhar","acreditar","duvidar","reconhecer","perceber","notar","descobrir","compreender","intuir","raciocinar","calcular","decidir","planejar"]);
  const SEM_EMO  = new Set(["amar","odiar","temer","alegrar","entristecer","angustiar","desesperar","chorar","rir","sorrir","suspirar","tremer","estremecer","emocionar","apaixonar","magoar","consolar","agitar"]);
  const SEM_PER  = new Set(["ver","olhar","enxergar","ouvir","escutar","sentir","tocar","cheirar","provar","observar","contemplar","fitar","espreitar","farejar","apalpar","tatear"]);

  const SUBST_TEMPO    = new Set(["tempo","hora","momento","instante","segundo","minuto","dia","noite","manhã","tarde","semana","mes","ano","seculo","epoca","era","eterno","efemero","duraçao","ritmo","prazo","futuro","passado","presente"]);
  const SUBST_ESPACO   = new Set(["lugar","espaço","casa","quarto","sala","rua","cidade","campo","floresta","mar","rio","caminho","estrada","trilha","praia","montanha","vale","deserto","ilha","continente","horizonte","limite","fronteira"]);
  const SUBST_LUZ      = new Set(["luz","sombra","escuridao","claridade","brilho","reflexo","lampejo","trevas","penumbra","aurora","crepusculo","sol","lua","estrela","fogo","chama","brasa","faísca","neon","vela"]);
  const SUBST_CORPO    = new Set(["olho","mao","pe","boca","voz","rosto","pele","cabelo","corpo","coracao","sangue","osso","pulso","respiracao","gesto","postura","olhar","toque","abraco","beijo","lagrima","suor"]);
  const SUBST_NATUREZA = new Set(["terra","agua","vento","chuva","neve","fogo","pedra","areia","lama","barro","arvore","folha","raiz","flor","fruto","semente","mar","onda","correnteza","brisa","tempestade","trovao","relampago"]);
  const SUBST_EMOCAO   = new Set(["amor","medo","raiva","alegria","tristeza","saudade","solidao","esperança","desespero","angustia","ansiedade","calma","paz","tensao","vergonha","orgulho","culpa","alívio","ternura","nostalgia"]);
  const SUBST_ABSTR    = new Set(["vida","morte","tempo","silencio","verdade","mentira","justiça","liberdade","poder","memoria","destino","acaso","sorte","escolha","limite","possibilidade","impossibilidade","vazio","ausencia","presença"]);

  function inferFunctionName(className) {
    if (className.includes("Verbo (gerúndio)"))    return "Ação contínua";
    if (className.includes("Verbo (subjuntivo)"))   return "Ação hipotética";
    if (className.includes("Verbo (particípio)"))   return "Estado resultante";
    if (className.includes("Verbo"))               return "Núcleo de ação";
    if (className.includes("Adjetivo"))             return "Qualificador";
    if (className.includes("Advérbio"))             return "Modificador";
    if (className.includes("Pronome pessoal"))      return "Referente de pessoa";
    if (className.includes("Pronome possessivo"))   return "Marcador de posse";
    if (className.includes("Pronome demonstrativo"))return "Marcador de espaço/discurso";
    if (className.includes("Pronome relativo"))     return "Encadeador de oração";
    if (className.includes("Pronome"))              return "Substituto nominal";
    if (className.includes("Conjunção"))            return "Conector de ideias";
    if (["Artigo","Preposição","Preposição/Artigo"].includes(className)) return "Estrutura gramatical";
    return "Núcleo nominal";
  }

  function inferSemanticField(normalized, className) {
    // Verbos por subtipo semântico
    if (className.includes("Verbo")) {
      if (SEM_MOV.has(normalized))  return "Movimento — deslocamento, trajetória, corporalidade";
      if (SEM_DIC.has(normalized))      return "Dicção — voz, fala, silêncio, comunicação";
      if (VERBOS_COGNICAO.has(normalized))   return "Cognição — pensamento, memória, percepção";
      if (SEM_EMO.has(normalized))     return "Emoção — estado interior, afeto, impulso";
      if (SEM_PER.has(normalized))  return "Percepção — sentidos, observação, presença";
      return "Ação — verbo que move a cena";
    }
    // Substantivos por campo
    if (className.includes("Substantivo") || className.includes("Substantivo próprio")) {
      if (SUBST_TEMPO.has(normalized))    return "Tempo — duração, ritmo, cronologia narrativa";
      if (SUBST_ESPACO.has(normalized))   return "Espaço — lugar, ambiente, paisagem";
      if (SUBST_LUZ.has(normalized))      return "Luz e sombra — atmosfera visual, visibilidade";
      if (SUBST_CORPO.has(normalized))    return "Corpo — gestualidade, presença física, sensação";
      if (SUBST_NATUREZA.has(normalized)) return "Natureza — elementos, mundo físico, clima";
      if (SUBST_EMOCAO.has(normalized))   return "Emoção — sentimento, estado interior, relação";
      if (SUBST_ABSTR.has(normalized))    return "Abstração — conceito, ideia, valor existencial";
      return "Imagem — substantivo que ancora a cena";
    }
    if (className.includes("Adjetivo"))  return "Qualidade — atributo sensorial ou moral";
    if (className.includes("Advérbio"))  return "Circunstância — modo, tempo, lugar, intensidade";
    if (normalized.length <= 3)          return "Estrutura gramatical — palavra funcional";
    return "Imagem — matéria narrativa";
  }

  function createLocalNote(className, normalized) {
    const n = normalized || "";
    if (SEM_MOV.has(n))   return "Verbos de movimento ganham força quando o percurso revela o estado interior do personagem, não apenas sua posição física.";
    if (SEM_DIC.has(n))       return "Prefira verbos de dicção específicos ao genérico 'dizer' — sussurrar, trovejar, morder palavras implica emoção e relação de poder.";
    if (SEM_COG.has(n))    return "Verbos de cognição criam distância entre o personagem e o mundo. Use com parcimônia — o leitor prefere ver, não ser informado.";
    if (SEM_EMO.has(n))      return "Nomeie emoções via ação ou imagem, não via verbo abstrato. 'Ela amava' é fraco; 'ela guardava o bilhete há seis anos' é forte.";
    if (SEM_PER.has(n))   return "Verbos de percepção ancoram a cena no ponto de vista. Prefira o específico: 'espiou' carrega mais que 'viu'.";
    if (SUBST_TEMPO.has(n))        return "Palavras de tempo controlam o ritmo interno da cena. Quanto mais detalhada a unidade temporal, mais lento o tempo narrativo.";
    if (SUBST_ESPACO.has(n))       return "O espaço é um personagem. Descreva-o pelo que ele revela de quem o habita, não apenas pelo que parece ao narrador.";
    if (SUBST_LUZ.has(n))          return "Luz e sombra são os instrumentos mais antigos de atmosfera. Use-os para revelar o que o personagem não verbaliza.";
    if (SUBST_CORPO.has(n))        return "O corpo é o primeiro acesso do leitor ao personagem. Um gesto preciso vale mais que um parágrafo de caracterização.";
    if (SUBST_NATUREZA.has(n))     return "Elementos naturais funcionam como espelhos do estado emocional da cena — mas o espelhamento deve ser oblíquo, não óbvio.";
    if (SUBST_EMOCAO.has(n))       return "Sentimentos nomeados diretamente informam; sentimentos mostrados por ação ou imagem envolvem. Prefira o segundo.";
    if (SUBST_ABSTR.has(n))        return "Abstrações funcionam como âncoras temáticas, não como material cênico. Reserve-as para momentos de densidade reflexiva.";
    if (className.includes("Verbo"))    return "Observe se o verbo impulsiona a cena ou apenas descreve movimento já evidente. Verbos fracos escondem ação.";
    if (className.includes("Adjetivo")) return "Adjetivos fortes revelam percepção do narrador/personagem, não apenas aparência do objeto. 'Vermelho' informa; 'encarnado' posiciona.";
    if (className.includes("Advérbio")) return "Advérbios em -mente frequentemente denunciam um verbo fraco. Teste retirar o advérbio e fortalecer o verbo.";
    if (className.includes("Pronome"))  return "Pronomes criam coesão e evitam repetição. Verifique se a referência está clara a 3 frases de distância.";
    return "Palavra analisada por heurística. Use como pista de revisão — a classificação pode variar por contexto.";
  }

  function createHighlightedContext(text, word, escapeHtml) {
    const cleanText = text.replace(/\s+/g, " ").trim();
    const tokens = cleanText.match(/[\p{L}-]+|[^\p{L}-]+/gu) || [];
    let currentIndex = 0, matchIndex = -1, matchLength = word.length;
    for (const token of tokens) {
      if (normalizeWord(token) === word) { matchIndex = currentIndex; matchLength = token.length; break; }
      currentIndex += token.length;
    }
    if (matchIndex === -1) return escapeHtml(cleanText.slice(0, 420));
    const start = Math.max(0, matchIndex - 180);
    const end   = Math.min(cleanText.length, matchIndex + 240);
    const excerpt = cleanText.slice(start, end);
    const rel = matchIndex - start;
    return `${escapeHtml(excerpt.slice(0,rel))}<mark>${escapeHtml(excerpt.slice(rel, rel+matchLength))}</mark>${escapeHtml(excerpt.slice(rel+matchLength))}`;
  }

  function countWordOccurrences(text, word) {
    return tokenizeWords(text).filter(t => normalizeWord(t) === word).length;
  }

  function tokenizeWords(text) {
    return text.match(/[\p{L}-]+/gu) || [];
  }

  function normalizeWord(value) {
    return String(value).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  global.VeredaLexical = {
    analyze,
    createHighlightedContext,
    normalizeWord,
    inferWordClass,
    inferWordClassContextual,
    tokenizeWords,
    ensureLoaded,
    isLoaded: () => _loaded,
    hasLoadError: () => _loadError,
  };
})(window);
