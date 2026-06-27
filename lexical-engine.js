(function lexicalEngine(global) {
  let localLexicon = {};
  let functionWords = { artigos:[], contracoes:[], conjuncoes:[], preposicoes:[], pronomes:[], adverbios:[] };
  let _loaded = false;
  let _loadError = false;
  let _VERBOS_PRES_SET = null;  // Set de formas do presente (3ª p.) — carregado de norma-data.json
  let _FORMAS_IRR_SET  = null;  // Set de formas verbais irregulares

  async function ensureLoaded() {
    if (_loaded || _loadError) return;
    try {
      const [lex, norma] = await Promise.all([
        fetch('lexical-data.json').then(r => r.json()),
        fetch('norma-data.json').then(r => r.json()).catch(() => ({})),
      ]);
      localLexicon  = lex.localLexicon  || {};
      functionWords = lex.functionWords || functionWords;
      if (norma.verbos_pres_reg)  _VERBOS_PRES_SET = new Set(norma.verbos_pres_reg);
      if (norma.formas_verbais_irr) _FORMAS_IRR_SET = new Set(norma.formas_verbais_irr);
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
    "haja":      [{ loc:"haja vista",     classe:"Conjunção"  }],
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
    "tanto":     [{ loc:"tanto quanto",   classe:"Advérbio"   }],
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

  // Verbos que desencadeiam "se" integrante — Bechara MGP §conj. integrante
  // (dúvida, verificação, descoberta, percepção indireta)
  const VERBOS_PERGUNTA = new Set([
    // saber — todas as formas
    "sei","sabe","sabemos","sabem","saber","sabia","sabias","sabiamos","sabiam",
    "soube","soubeste","soubemos","souberam","soubera","souberas","souberams",
    "sabera","saberas","saberao","soubesse","soubesses","soubessem",
    // perguntar
    "pergunto","pergunta","perguntamos","perguntam","perguntou","perguntar",
    "perguntava","perguntei","perguntaste","perguntaram","perguntara",
    // ignorar
    "ignoro","ignora","ignoramos","ignoram","ignorou","ignorar",
    "ignorava","ignorei","ignoraram","ignorava",
    // descobrir
    "descubro","descobre","descobrimos","descobrem","descobriu","descobrir",
    "descobria","descobrimos","descobriram","descobrira",
    // investigar
    "investigo","investiga","investigamos","investigam","investigou","investigar",
    "investigava","investigaram","investigara",
    // verificar
    "verifico","verifica","verificamos","verificam","verificou","verificar",
    "verificava","verificaram","verificara","verifiquei",
    // notar / perceber
    "noto","nota","notamos","notam","notou","notar","notava","notaram","notara","notei",
    "percebo","percebe","percebemos","percebem","percebeu","perceber",
    "percebia","perceberam","percebera","percebi",
    // ver (vejo se funciona)
    "vejo","ve","vemos","veem","viu","ver","via","vias","viamos","viam","vira",
    // duvidar
    "duvido","duvida","duvidamos","duvidam","duvidou","duvidar",
    "duvidava","duvidarão","duvidara","duvidei","duvidaram","duvidasse",
    // imaginar
    "imagino","imagina","imaginamos","imaginam","imaginou","imaginar",
    "imaginava","imaginaram","imaginara","imaginei","imaginasse",
    // lembrar (lembro se ele veio)
    "lembro","lembra","lembramos","lembram","lembrou","lembrar",
    "lembrava","lembraram","lembrara","lembrei","lembrasse",
    // conferir / checar
    "confiro","confere","conferimos","conferem","conferiu","conferir",
    "conferia","conferiram","conferira",
    // entender (não entendo se...)
    "entendo","entende","entendemos","entendem","entendeu","entender",
    "entendia","entenderam","entendera","entendi",
    // decidir (decido se...)
    "decido","decide","decidimos","decidem","decidiu","decidir",
    "decidia","decidiram","decidira","decidi",
    // questionar
    "questiono","questiona","questionamos","questionam","questionou","questionar",
    "questionava","questionaram","questionara",
    // averiguar
    "averiguo","averigua","averiguamos","averiguam","averiguou","averiguar",
    "averiguava","averiguaram",
  ]);

  // ── Desambiguação contextual — algoritmo em cascata (Bechara MGP + Cunha&Cintra) ──
  const POLISSEMIA = {
    "que": (prev, next, prev2) => {
      // Exclamativo/interrogativo — sem antecedente (DESAM-QUE-03)
      // "Que saudade!" / "Que horas são?" / "Que belo espetáculo!"
      if (!prev) return "Pronome";

      // 1. Após verbo de cognição/dicção/vontade → Conjunção integrante (DESAM-QUE-01)
      if (VERBOS_COGNICAO.has(prev)) return "Conjunção";

      // 2. "do que" / "da que" / "dos que" / "das que" → Conjunção comparativa (DESAM-QUE-04)
      if (["do","da","dos","das"].includes(prev)) return "Conjunção";
      if (prev === "tal") return "Conjunção"; // consecutiva "A dor era tal que não podia falar"

      // 2b. "por que" — interrogativo ou relativo (Cunha&Cintra §pronomes interrogativos)
      //   !prev2 ou verbo anterior → interrogativo ("Por que?"; "não sei por que")
      //   substantivo antes de "por" → relativo ("a razão por que veio")
      if (prev === "por") {
        if (!prev2 || VERBOS_COGNICAO.has(prev2) || VERBOS_PERGUNTA.has(prev2))
          return "Pronome interrogativo";
        return "Pronome relativo";
      }

      // 3. Após palavra gramatical (conjunção, advérbio, preposição) → Conjunção
      //    causal ("corre, que é tarde"), temporal, final, consecutiva, concessiva
      const _GRAM = new Set([
        "e","ou","mas","porem","contudo","todavia","entretanto","portanto","logo","pois",
        "quando","embora","porque","como","se","onde","enquanto","alem","desde","ate",
        "mais","menos","tao","tanto","nao","ja","para","sem","ante","entre",
        "assim","bem","sempre","nunca","talvez","caso","posto","senao",
        "ainda","nem","mesmo","so","ora","antes","depois","agora","ali","aqui","la"
      ]);
      if (_GRAM.has(prev)) return "Conjunção";

      // 4. Detecção de antecedente comparativo dois tokens antes (DESAM-QUE-05)
      //    "mais rápido que", "tão belo que", "menos grave que"
      if (prev2) {
        const _COMP = new Set([
          "mais","menos","maior","menor","melhor","pior","tao","tanto","tanta",
          "igual","diferente","superior","inferior","semelhante","tamanho","tamanha"
        ]);
        if (_COMP.has(prev2)) return "Conjunção";
      }

      // 5. Após forma verbal de 3sg presente / imperativo → Conjunção causal (DESAM-QUE-07)
      //    "Anda, que está tarde" / "Corre, que é longe"
      const _PRES3 = new Set([
        // 1ª conjugação — 3sg presente e imperativo informal
        "anda","fala","chora","canta","calla","espera","olha","para","chega","entra",
        "volta","passa","pega","pula","leva","traz","gosta","importa","basta","resta",
        "sobra","falta","fica","toca","pensa","sente","vira","sobe","desce","sai",
        "liga","lembra","nota","escuta","ouve","chama","dura","muda","junta","separa",
        "conta","custa","mostra","encontra","guarda","deixa","manda","acaba",
        // 2ª/3ª conjugação — 3sg presente e imperativo informal/formal
        "corre","parte","segue","escreve","lute","venha","chegue","pare","saiba",
        "ouça","diga","veja","tenha","leia","faça","traga","venha","siga","parta",
        // Formas breves comuns
        "vai","vem","tem","e","ha","da","pe","ve","le","ri","oe",
      ]);
      if (_PRES3.has(prev)) return "Conjunção";

      // 6. Após desinência verbal de passado → Conjunção causal/integrante (DESAM-QUE-06)
      //    Pret. perfeito: -ou, -eu, -iu; Imperfeito: -ava, -ia; PP3pl: -aram/-eram/-iram
      if (prev.length > 3 && /(ou|eu|iu|aram|eram|iram|ava|ia)$/.test(prev)) return "Conjunção";

      // 6. Após pronome oblíquo átono → Pronome relativo ("o que me deu")
      if (PRON_OBLIQUOS_ATONOS.has(prev)) return "Pronome relativo";

      // 7. Após pronome pessoal reto → Pronome relativo ("ela que o fez")
      if (PRON_PESSOAIS_RETOS.has(prev)) return "Pronome relativo";

      // 8. Caso geral: antecedente nominal (substantivo, adj, pronome demonstrativo)
      //    → Pronome relativo (Bechara MGP §pronomes relativos)
      return "Pronome relativo";
    },
    "como": (prev, next) => {
      if (!prev) return "Advérbio";
      const _p = normalizeWord(prev);
      // Após pronome pessoal reto → Verbo (1ª pessoa "eu como", "eles comem")
      if (PRON_PESSOAIS_RETOS.has(_p)) return "Verbo flexionado";
      // Após verbo de cognição ou "saber" → Advérbio integrante
      if (VERBOS_COGNICAO.has(_p) || _p === "saber") return "Advérbio";
      return "Conjunção";
    },
    "quando": (prev, next) => {
      // Início de período → advérbio interrogativo (DESAM-QUANDO-01)
      if (!prev) return "Advérbio";
      // No interior → conjunção temporal (DESAM-QUANDO-02)
      return "Conjunção";
    },

    // Pronomes relativos possessivos — sempre Pronome relativo (Bechara MGP §pronomes relativos)
    "cujo":  () => "Pronome relativo",
    "cuja":  () => "Pronome relativo",
    "cujos": () => "Pronome relativo",
    "cujas": () => "Pronome relativo",

    // "onde" — advérbio relativo de lugar (Bechara §354; Cunha&Cintra §pronome relativo)
    //   !prev → interrogativo ("Onde você vai?")
    //   prev → pronome relativo de lugar ("a cidade onde nasceu")
    "onde": (prev) => {
      if (!prev) return "Advérbio";
      return "Pronome relativo";
    },

    // "qual/quais" — pronome relativo (após artigo o/a/os/as) ou interrogativo
    "qual": (prev) => {
      if (prev && ["o","a","os","as"].includes(prev)) return "Pronome relativo";
      return "Pronome interrogativo";
    },
    "quais": (prev) => {
      if (prev && ["o","a","os","as"].includes(prev)) return "Pronome relativo";
      return "Pronome interrogativo";
    },
    "se": (prev, next) => {
      // 1. Após verbo de dúvida/investigação → Conjunção integrante (DESAM-SE-02)
      if (prev && VERBOS_PERGUNTA.has(prev)) return "Conjunção";
      // 2. Início de cláusula → Conjunção condicional (DESAM-SE-01)
      if (!prev) return "Conjunção";
      // 3. No interior — pronome reflexivo/recíproco (DESAM-SE-03)
      //    Bechara MGP §pronomes oblíquos: "se" reflexivo é pronome pessoal oblíquo 3ª pessoa
      return "Pronome reflexivo";
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
    "senao": () => "Conjunção", // adversativa/condicional negativa (DESAM-SENAO-01)
    // P0.2 — artigo/preposição/pronome: `a` antes de noun → artigo; antes de nome → preposição
    "a": (prev, next) => {
      if (!next) return "Pronome pessoal"; // posição final: clítico
      const _n = normalizeWord(next);
      // Antes de substantivo comum (qualquer palavra que não seja preposição/conjunção/artigo)
      if (_n && !/^(de|em|a|o|os|as|para|por|com|sem|sobre|ante|entre|após|até|desde|perante|segundo|conforme|mediante|exceto|salvo|ou|e|mas|pois|que|se|quando|como|porque|porém|contudo|todavia|portanto|logo|senão|embora|ora|quer)$/.test(_n)) {
        // Antes de nome próprio → preposição (ex: "Entreguei a Maria")
        if (next && /^\p{Lu}/u.test(next)) return "Preposição";
        // Antes de infinitivo → preposição (a + inf = aspecto)
        if (/^.+(ar|er|ir)$/.test(_n)) return "Preposição";
        return "Artigo"; // caso geral: antes de substantivo/adjetivo
      }
      return "Artigo"; // default seguro
    },
    // "mais" como advérbio de intensidade vs indefinido
    "mais": (prev, next) => {
      if (next) {
        const _n = normalizeWord(next);
        // "mais nada/ninguém" → Advérbio de negação aspectual
        if (PRON_INDEF_SUBST.has(_n) || ["nada","ninguem","nenhum","nenhuma","nada"].includes(_n))
          return "Advérbio";
        // Antes de substantivo/adjetivo concreto → Pronome indefinido
        if (_n && !/^(do|dos|da|das|de|em|a|o|os|as|que|para|por|com)$/.test(_n)
            && !/^.+(mente|ar|er|ir)$/.test(_n))
          return "Pronome indefinido";
      }
      return "Advérbio";
    },
    "menos": () => "Advérbio",

    // ── Polissemia de palavras com múltiplas classes frequentes ──
    "bem": (prev, next) => {
      // Início de frase (sem prev) → Interjeição ou Advérbio de afirmação
      if (!prev) return "Interjeição";
      // Após artigo ou preposição → Substantivo ("o bem", "do bem", "pelo bem")
      const ARTIGOS_PREP = new Set(["o","a","um","uma","do","da","no","na","ao","á","pelo","pela","todo","toda","pelo","por"]);
      if (ARTIGOS_PREP.has(prev)) return "Substantivo";
      // "bem como" e "bem que" → Conjunção (já capturado por LOCUCOES, mas como fallback)
      if (next === "como" || next === "que") return "Conjunção";
      return "Advérbio";
    },

    "mal": (prev, next) => {
      // Após artigo, preposição ou determinante → Substantivo ("o mal", "do mal", "todo mal")
      const ARTIGOS_PREP = new Set(["o","a","um","uma","do","da","no","na","ao","á","pelo","pela","todo","toda"]);
      if (prev && ARTIGOS_PREP.has(prev)) return "Substantivo";
      return "Advérbio";
    },

    "dado": (prev, next) => {
      // Após verbos auxiliares → Verbo (particípio) ("havia dado", "tinha dado", "foi dado")
      const AUX = new Set(["havia","tinha","teria","ter","tenho","tens","tem","temos","tinham","foram","foi","era","sendo","tendo","haviamos","tinhamos"]);
      if (prev && AUX.has(prev)) return "Verbo (particípio)";
      // Sem auxiliar → Substantivo ("o dado de jogar", "dados disponíveis")
      return "Substantivo";
    },

    "certa": (prev, next) => {
      // Antes de "vez" ou "vezes" → Pronome indefinido ("certa vez")
      if (next && (next === "vez" || next === "vezes")) return "Pronome indefinido";
      // Após artigo definido ou demonstrativo → Adjetivo ("a certa altura")
      const DET = new Set(["a","essa","esta","aquela","nessa","nesta","uma"]);
      if (prev && DET.has(prev)) return "Adjetivo";
      return "Adjetivo";
    },

    "certo": (prev, next) => {
      // Antes de "vez"/"vezes" → Pronome indefinido ("certo dia", "certo lugar")
      if (next && (next === "vez" || next === "vezes")) return "Pronome indefinido";
      // Após artigo ou demonstrativo → Adjetivo
      const DET = new Set(["o","esse","este","aquele","nesse","neste","um"]);
      if (prev && DET.has(prev)) return "Adjetivo";
      return "Adjetivo";
    },

    "quer": (prev, next) => {
      // "quer...quer" correlativa (início ou após conjunção) → Conjunção
      if (!prev) return "Conjunção";
      const CONJ_COORD = new Set(["ou","e","mas","nem","quer","seja"]);
      if (CONJ_COORD.has(prev)) return "Conjunção";
      // Após pronome ou substantivo → Verbo ("ele quer", "o menino quer")
      return "Verbo flexionado";
    },

    "pronto": (prev, next) => {
      // Início de frase ou após pausa → Interjeição ("Pronto! Acabei.")
      if (!prev) return "Interjeição";
      // Após "estar"/"ficar"/"estar" → Adjetivo predicativo
      const ESTAR = new Set(["esta","fica","ficou","estava","ficara","fico"]);
      if (prev && ESTAR.has(prev)) return "Adjetivo";
      return "Adjetivo";
    },

    "alto": (prev, next) => {
      // Após artigo → Substantivo ("o alto da montanha")
      const ART = new Set(["o","um","do","no","ao","pelo"]);
      if (prev && ART.has(prev)) return "Substantivo";
      // Como modificador de verbo (sem artigo, após vírgula) → Advérbio ("fala alto")
      return "Adjetivo";
    },

    "baixo": (prev, next) => {
      const ART = new Set(["o","um","do","no","ao","pelo"]);
      if (prev && ART.has(prev)) return "Substantivo";
      return "Adjetivo";
    },

    // ── Polissemia estendida — camada literária ────────────────────────────
    "mesmo": (prev, next) => {
      // "ele mesmo" / "ela mesma" / "eles mesmos" → após pronome → Pronome reflexivo-enfático
      if (prev && PRON_PESSOAIS_RETOS.has(prev)) return "Pronome";
      // "o mesmo lugar" / "a mesma coisa" → após artigo/determinante → Adjetivo
      const DET = new Set(["o","a","os","as","um","uma","do","da","no","na","ao"]);
      if (prev && DET.has(prev)) return "Adjetivo";
      // "mesmo assim" / "mesmo que" / início → Advérbio concessivo
      return "Advérbio";
    },

    "so": (prev, next) => {
      // "estava só" / "ficou só" / "vive só" → após cópula → Adjetivo predicativo
      const COPULAS = new Set(["estava","estou","fiquei","ficou","ficara","era","senti","sente","vive","anda","parecia","permanecia","ficasse"]);
      if (prev && COPULAS.has(prev)) return "Adjetivo";
      // "só ele" / "só uma vez" → antes de pronome pessoal/artigo → Advérbio exclusivo
      if (next) {
        const _n = normalizeWord(next);
        if (PRON_PESSOAIS_RETOS.has(_n) || ["o","a","um","uma","os","as","nos","nao","apenas"].includes(_n))
          return "Advérbio";
      }
      // Início sem cópula → Advérbio
      if (!prev) return "Advérbio";
      return "Adjetivo";
    },

    "ainda": (prev, next) => {
      // "ainda que" → Conjunção concessiva
      if (next && normalizeWord(next) === "que") return "Conjunção";
      // "ainda assim" / "ainda não" / default → Advérbio temporal/aditivo
      return "Advérbio";
    },

    "caso": (prev, next) => {
      // Após artigo/determinante/contração → Substantivo
      const ART = new Set(["o","a","os","as","um","uma","do","da","dos","das","no","na","nos","nas","num","numa","ao","aos","este","esse","aquele","neste","nesse","naquele","nesta","nessa","naquela","tal","cada","meu","seu","nosso","teu","qualquer"]);
      if (prev && ART.has(prev)) return "Substantivo";
      // Default → Conjunção condicional
      return "Conjunção";
    },

    "visto": (prev, next) => {
      // Após auxiliar de voz passiva / perfeito composto → Verbo (particípio)
      const AUX = new Set(["havia","tinha","teria","tenho","tem","temos","tinham","foram","foi","era","sendo","tendo","haviamos","tinhamos","fosse","sera","sido","ser","ter"]);
      if (prev && AUX.has(prev)) return "Verbo (particípio)";
      // Após artigo/contração/determinante → Substantivo (documento de viagem)
      const ART = new Set(["o","a","os","as","um","uma","do","da","dos","das","no","na","nos","nas","ao","meu","seu","nosso","teu","este","esse","aquele","neste","nesse","naquele"]);
      if (prev && ART.has(prev)) return "Substantivo";
      return "Verbo (particípio)";
    },

    "posto": (prev, next) => {
      // "posto que" → Conjunção causal/concessiva
      if (next && normalizeWord(next) === "que") return "Conjunção";
      // Após auxiliar de voz passiva → Verbo (particípio)
      const AUX = new Set(["foi","sera","era","fora","fosse","sendo","sido","foram","ser","ter","tendo"]);
      if (prev && AUX.has(prev)) return "Verbo (particípio)";
      // Após artigo/contração/determinante → Substantivo (local físico ou cargo)
      const ART = new Set(["o","a","os","as","um","uma","do","da","dos","das","no","na","nos","nas","num","numa","ao","aos","meu","seu","nosso","teu","este","esse","aquele","neste","nesse","naquele","nesta","nessa","naquela","cada","qualquer"]);
      if (prev && ART.has(prev)) return "Substantivo";
      return "Verbo (particípio)";
    },

    "tanto": (prev, next) => {
      // Antes de substantivo/adjetivo concreto → Pronome indefinido (quantificador)
      if (next) {
        const _n = normalizeWord(next);
        if (_n && !["de","do","da","dos","das","que","e","mas","ou","nem","pois","a","o"].includes(_n)
            && !/(ar|er|ir|ando|endo|indo|ou|eu|iu|ava|ia|mente)$/.test(_n))
          return "Pronome indefinido";
      }
      // Após verbo ou em posição de modificador → Advérbio de intensidade
      return "Advérbio";
    },

    "ora": (prev, next) => {
      // "ora...ora" → Conjunção correlativa alternativa
      if (next && normalizeWord(next) === "ora") return "Conjunção";
      if (prev && normalizeWord(prev) === "ora") return "Conjunção";
      // Início + próxima palavra é partícula negativa ou advérbio modal → Interjeição
      const PART_NEG_MODAL = new Set(["nao","nem","ja","bem","la","ve","olha","eis","basta","veja","xii"]);
      if (!prev && next && PART_NEG_MODAL.has(normalizeWord(next))) return "Interjeição";
      // Início e próxima palavra é verbo → Conjunção (correlativa implícita)
      if (!prev) return "Conjunção";
      return "Advérbio";
    },

    "morto": (prev, next) => {
      // Após artigo → Substantivo nominalizado ("um morto", "o morto")
      const ART = new Set(["um","uma","o","a","os","as","do","da","dos","das","no","na","nos","nas","ao","aos"]);
      if (prev && ART.has(prev)) return "Substantivo";
      // Após cópula → Adjetivo predicativo ("estava morto", "caiu morto")
      const COPULAS = new Set(["estava","estou","ficou","ficara","era","parecia","caiu","caira","cai"]);
      if (prev && COPULAS.has(prev)) return "Adjetivo";
      return "Verbo (particípio)";
    },
  };

  // ── Pronomes/advérbios relativos e interrogativos — extensão pós-POLISSEMIA literal ──
  (function() {
    // "quem" — pronome relativo ou interrogativo (Bechara §pronomes relativos + interrogativos)
    POLISSEMIA["quem"] = (prev) => {
      if (!prev) return "Pronome interrogativo";
      if (VERBOS_COGNICAO.has(prev) || VERBOS_PERGUNTA.has(prev)) return "Pronome interrogativo";
      // Após preposição ou artigo → "a quem me refiro", "de quem falei"
      const PREP_ART = new Set(["a","de","em","para","por","com","sobre","ante","entre","sem",
        "apos","perante","o","os","ao","da","na","no","pelo","pela","em"]);
      if (PREP_ART.has(prev)) return "Pronome relativo";
      return "Pronome interrogativo";
    };

    // "quanto/quanta/quantos/quantas" — relativo, interrogativo ou conjunção comparativa
    const _COMP_QUANTO = new Set(["tanto","tanta","tantos","tantas","mais","menos","tao",
      "maior","menor","melhor","pior"]);
    function _classifQuanto(prev) {
      if (prev && _COMP_QUANTO.has(prev)) return "Conjunção"; // "tanto quanto"
      if (!prev) return "Pronome interrogativo"; // "Quanto custa?"
      return "Pronome relativo"; // "tudo quanto ela escreveu"
    }
    POLISSEMIA["quanto"]  = _classifQuanto;
    POLISSEMIA["quanta"]  = _classifQuanto;
    POLISSEMIA["quantos"] = _classifQuanto;
    POLISSEMIA["quantas"] = _classifQuanto;

    // "nos" — pronome oblíquo vs contração "em + os" (Bechara §contrações)
    POLISSEMIA["nos"] = (prev, next) => {
      // "nos" antes de substantivo/adjetivo (sem morfologia verbal) → contração "em + os"
      if (next && next.length > 2) {
        const _verbSfx = /(ou|eu|iu|avam|iam|ava|ia|ar|er|ir|ando|endo|indo|aram|eram|iram)$/.test(next);
        if (!_verbSfx && !PRON_PESSOAIS_RETOS.has(next)) return "Preposição/Artigo";
      }
      return "Pronome pessoal";
    };

    // "presente" — adjetivo predicativo vs substantivo temporal (Bechara §adjetivo)
    POLISSEMIA["presente"] = (prev) => {
      const ART = new Set(["o","a","os","as","um","uma","do","da","dos","das","no","na","ao","num","numa"]);
      if (prev && ART.has(prev)) return "Substantivo";
      return "Adjetivo"; // "estava presente", "ficou presente", "dia presente"
    };

    // "seguinte/seguintes" — quase sempre adjetivo em norma padrão
    POLISSEMIA["seguinte"]  = () => "Adjetivo";
    POLISSEMIA["seguintes"] = () => "Adjetivo";

    // "próximo/próxima" — adjetivo ordinal; como substantivo apenas com artigo isolado
    function _classifProximo(prev, next) {
      // "o próximo a falar" / "o dia próximo" / "na próxima vez" → Adjetivo
      return "Adjetivo";
    }
    POLISSEMIA["proximo"]  = _classifProximo;
    POLISSEMIA["proxima"]  = _classifProximo;
    POLISSEMIA["proximos"] = _classifProximo;
    POLISSEMIA["proximas"] = _classifProximo;

    // "tal" — pronome indefinido atributivo/correlativo (DESAM-TAL-01)
    // "tal qual"/"tal como" já capturados por LOCUCOES; "tal que" capturado por POLISSEMIA["que"]
    POLISSEMIA["tais"] = () => "Pronome indefinido";
    POLISSEMIA["tal"]  = (prev, next) => {
      // "tal qual" / "tal como" → tratados por LOCUCOES (retornam Conjunção antes de chegar aqui)
      return "Pronome indefinido"; // "tal pai", "Tal pai tal filho", "nunca vi tal arrogância"
    };

    // "vez" — substantivo, exceto em "uma vez que" → Conjunção
    POLISSEMIA["vez"] = (prev, next) => {
      if (prev === "uma" && next === "que") return "Conjunção";
      return "Substantivo";
    };

    // ── Grupo C — Conjunções temporais com forma de advérbio ──

    // "quando" — temporal (Conjunção) vs interrogativo (Advérbio) (Bechara §conjunção temporal)
    POLISSEMIA["quando"] = (prev, next) => {
      // next é infinitivo ou verbo → "Quando chegar, avise" → Conjunção temporal
      if (next && /^.{2,}(ar|er|ir|or|arem|erem|irem|asse|esse|isse)$/.test(next))
        return "Conjunção";
      // Após substantivo/pronome → pronome relativo temporal ("o dia quando aconteceu")
      if (prev && !["e","ou","mas","que","se","porque","pois"].includes(prev) &&
          !/^(e|de|em|a|ao|da|do|na|no)$/.test(prev) && prev.length > 2)
        return "Conjunção";
      // Início de frase ou após punt/conj → interrogativo ("Quando você vem?")
      return "Advérbio";
    };

    // "mal" — Advérbio vs Substantivo vs Conjunção temporal ("mal chegou, saiu")
    POLISSEMIA["mal"] = (prev, next) => {
      // Início de frase + next é verbo passado → "Mal chegou, saiu" → Conjunção
      if (!prev && next && /(ou|eu|iu|ava|ia|aram|eram|iram)$/.test(next)) return "Conjunção";
      // Após artigo → Substantivo ("o mal", "um grande mal")
      const _ART = new Set(["o","a","os","as","um","uma","do","da","dos","das","no","na"]);
      if (prev && _ART.has(prev)) return "Substantivo";
      return "Advérbio"; // "escreveu mal", "dormiu mal"
    };

    // ── Grupo D — Polissemia léxica específica ──

    // "pois" — Conjunção causal/explicativa vs Advérbio de afirmação ("pois sim")
    POLISSEMIA["pois"] = (prev, next) => {
      if (next && ["sim","nao","bem","e","nao"].includes(next)) return "Advérbio";
      if (!next) return "Advérbio"; // "Pois." isolado
      return "Conjunção";
    };

    // "segundo" — Conjunção conformativa vs Adjetivo numeral ordinal
    POLISSEMIA["segundo"] = (prev, next) => {
      const _ARTS = new Set(["o","a","os","as","um","uma","do","da","no","na","ao","em"]);
      if (prev && _ARTS.has(prev)) return "Adjetivo"; // "o segundo capítulo", "em segundo lugar"
      return "Conjunção"; // "Segundo ela disse", "segundo Bechara"
    };
    POLISSEMIA["segunda"] = (prev) => {
      const _ARTS = new Set(["a","as","da","na","uma"]);
      if (prev && _ARTS.has(prev)) return "Adjetivo";
      return "Conjunção";
    };

    // "nossa/nosso" — Pronome possessivo vs Interjeição
    POLISSEMIA["nossa"] = (prev, next) => {
      // Antes de substantivo (next é conteúdo, não punct nem "que" exclamativo) → possessivo
      const _INTERJ_NEXT = new Set(["que","!","como","quanto","de","tao","mas"]);
      if (!next || _INTERJ_NEXT.has(next) || !prev) {
        // Verificar se não é possessivo pré-nominal com "nossa" + subst
        // Heurística: se prev é nulo ou pontuação e next é "que" → Interjeição
        if (!next || _INTERJ_NEXT.has(next)) return "Interjeição";
      }
      return "Pronome possessivo";
    };
    POLISSEMIA["nosso"] = (prev, next) => "Pronome possessivo"; // "nosso lar" — sempre possessivo (masc.)

    // ── Grupo A — Adjetivos que funcionam como advérbios de modo ──
    // Bechara §advérbio: adjetivo após verbo de ação = advérbio de modo
    (function() {
      const _verbPast = /^.{2,}(ou|eu|iu|ava|ia|ando|endo|indo|aram|eram|iram)$/;
      function _adjAdv(prev, next) {
        if (prev && _verbPast.test(prev)) return "Advérbio"; // "voou alto", "custou caro"
        return "Adjetivo";
      }
      for (const w of ["alto","baixo","rapido","lento","duro","forte","barato","errado"]) {
        POLISSEMIA[w] = _adjAdv;
      }
      // "caro" — também "Adjetivo" predicativo ("livro caro")
      POLISSEMIA["caro"] = _adjAdv;
      POLISSEMIA["cara"] = _adjAdv;
      // "claro" — Advérbio de afirmação no início ("Claro que sim") + após verbo
      POLISSEMIA["claro"] = (prev, next) => {
        if (!prev && next === "que") return "Advérbio"; // "Claro que sim"
        if (!prev && !next) return "Advérbio"; // "Claro!" isolado
        if (prev && _verbPast.test(prev)) return "Advérbio";
        return "Adjetivo";
      };
      POLISSEMIA["clara"] = POLISSEMIA["claro"];
      // "fácil/difícil" — Advérbio após verbo ("não é fácil" já é predicativo; "fez fácil" = Adv)
      POLISSEMIA["facil"] = _adjAdv;
      POLISSEMIA["dificil"] = _adjAdv;
    })();
  })();

  // ── Pronomes indefinidos quantificadores — Advérbio vs Pronome (Bechara §253) ──
  // "muito belo" → Advérbio de intensidade; "muito trabalho" → Pronome indefinido adjetivo
  // "andou muito" → Advérbio; "muitos chegaram" → Pronome indefinido substantivo
  (function() {
    // Sufixos de adjetivo que tornam "muito/pouco" advérbio de intensidade
    const _ADJ_SFX = /(oso|osa|avel|ivel|ente|ante|ivo|iva|ico|ica|ino|ina|ado|ido|al|el|il|oz|iz)$/;
    // Advérbios conhecidos que "muito/pouco" pode intensificar
    const _ADV_C   = new Set(["antes","depois","cedo","tarde","longe","perto","bem","mal","mais","menos",
      "ja","ainda","logo","nunca","sempre","aqui","ali","la","agora","assim","alem","acima","abaixo"]);
    // Palavras gramaticais que seguem advérbio de quantidade
    const _GRAM_N  = new Set(["e","ou","mas","que","se","quando","como","porque","pois","nem","para","por"]);

    function _intens(prev, next) {
      // Posição de sujeito (sem prev + next é verbo) → Pronome indefinido ("Pouco restava")
      if (!prev && next && next.length > 3 && /(ou|eu|iu|avam|iam|ava|ia|a|e|am)$/.test(next))
        return "Pronome indefinido";
      // Sem próxima palavra → Advérbio ("andou muito")
      if (!next) return "Advérbio";
      // Antes de -mente (outro advérbio) → Advérbio ("muito rapidamente")
      if (/mente$/.test(next)) return "Advérbio";
      // Antes de palavra gramatical → Advérbio ("dormiu pouco e acordou")
      if (_GRAM_N.has(next)) return "Advérbio";
      // Antes de advérbio conhecido → Advérbio ("muito antes", "pouco depois")
      if (_ADV_C.has(next)) return "Advérbio";
      // Antes de adjetivo por sufixo → Advérbio de intensidade ("muito pesado")
      if (_ADJ_SFX.test(next)) return "Advérbio";
      // Antes de desinência verbal → Advérbio ("cansa muito", "pouco importa")
      if (next.length > 3 && /(ar|er|ir|ou|eu|iu|ava|ia)$/.test(next)) return "Advérbio";
      // Caso geral: antes de substantivo → Pronome indefinido adjetivo ("muito trabalho")
      return "Pronome indefinido";
    }

    // "muito" (sing. masc.) — pode ser advérbio antes de adj/adv/verbo
    POLISSEMIA["muito"]  = _intens;
    // "muita" (sing. fem.) — quase sempre antes de substantivo fem. em norma padrão
    POLISSEMIA["muita"]  = () => "Pronome indefinido";
    // Plurais — uso substantivado ou adjetivo antes de noun (Pronome indefinido)
    POLISSEMIA["muitos"] = (prev, next) => {
      // "muitos chegaram" → Pronome indefinido (sujeito antes de verbo)
      if (next && next.length > 3 && /(ou|eu|iu|avam|iam|ava|ia|am|em)$/.test(next))
        return "Pronome indefinido";
      return "Pronome indefinido";
    };
    POLISSEMIA["muitas"] = () => "Pronome indefinido";

    // "pouco" (sing. masc.) — mesma lógica de "muito"
    POLISSEMIA["pouco"]  = _intens;
    // "pouca" (sing. fem.) — antes de substantivo fem.
    POLISSEMIA["pouca"]  = () => "Pronome indefinido";
    // Plurais de pouco
    POLISSEMIA["poucos"] = () => "Pronome indefinido";
    POLISSEMIA["poucas"] = () => "Pronome indefinido";

    // "la" (normalização de "lá") — advérbio de lugar quando standalone
    // O clítico "la" só ocorre após hífen (levá-la, fazê-la) — esses são tratados por P0.6
    // Standalone: "Ele foi lá", "que lá sei eu" → sempre Advérbio
    POLISSEMIA["la"] = () => "Advérbio";

    // "ai" — advérbio de lugar "aí" vs. interjeição de dor "ai"
    // "aí" (lugar/tempo): "Fica aí", "E aí?" → Advérbio
    // "ai" (dor/susto): "Ai, que dor!" — next="que" é o marcador mais confiável
    POLISSEMIA["ai"] = (prev, next) => {
      if (next === "que") return "Interjeição";
      return "Advérbio";
    };

    // "alem" (normalização de "além") — está em conjuncoes E adverbios; conjuncoes dispara primeiro
    // Como standalone, "além" é Advérbio de lugar ("foi além") ou Preposição ("além de/disso")
    POLISSEMIA["alem"] = (prev, next) => {
      // "além de" → Preposição
      if (next && ["de","do","da","dos","das","disso","disto"].includes(next)) return "Preposição";
      return "Advérbio";
    };

    // "durante" — preposição temporal; está erroneamente em functionWords.conjuncoes
    // "Durante o dia", "durante a noite" → sempre Preposição (Bechara MGP §preposições)
    POLISSEMIA["durante"] = () => "Preposição";

    // "ja" (normalização de "já") — em conjuncoes E adverbios; conjuncoes dispara primeiro
    // "Já escrevi", "Já não sei" → Advérbio temporal; "já que" → Conjunção causal
    POLISSEMIA["ja"] = (prev, next) => {
      if (next === "que") return "Conjunção";
      return "Advérbio";
    };

    // "assim" — em conjuncoes E adverbios; conjuncoes dispara primeiro
    // "Faz assim", "fique assim" → Advérbio de modo; "assim que/como" → Conjunção
    POLISSEMIA["assim"] = (prev, next) => {
      if (next && ["que","como"].includes(next)) return "Conjunção";
      return "Advérbio";
    };

    // "conforme" — está em conjuncoes; é preposição ou advérbio na maioria dos contextos
    // "Conforme pedido" / "Conforme o acordo" → Preposição; "conforme que" → Conjunção
    POLISSEMIA["conforme"] = (prev, next) => {
      if (next === "que") return "Conjunção";
      return "Preposição";
    };

    // "segundo" — está em conjuncoes; é preposição discursiva ou numeral ordinal
    // "Segundo ela/o autor/os dados" → Preposição; "o segundo capítulo" → Adjetivo (ordinal)
    POLISSEMIA["segundo"] = (prev, next) => {
      // Após artigo definido → ordinal ("o segundo filho")
      if (prev && ["o","a","os","as","um","uma"].includes(prev)) return "Adjetivo";
      return "Preposição";
    };
  })();

  // ── Leituras alternativas para palavras polissêmicas — exibidas no card ──────
  const ALTERNATIVAS = {
    "bem":    ["Advérbio — 'fez bem demais'", "Substantivo — 'o bem e o mal'", "Interjeição — 'Bem! Pode ir.'"],
    "mal":    ["Advérbio — 'fez mal feito'", "Substantivo — 'o mal que o cercava'"],
    "canto":  ["Substantivo — 'canto da sala'", "Verbo — 'eu canto no coral'"],
    "porto":  ["Substantivo — 'porto de abrigo'", "Verbo — 'eu porto a mochila'"],
    "como":   ["Conjunção — 'como se a mão fosse'", "Verbo — 'eu como pão'", "Advérbio — 'como é tarde!'"],
    "quer":   ["Verbo — 'ele quer sair'", "Conjunção — 'quer chova, quer faça sol'"],
    "visto":  ["Verbo (particípio) — 'havia sido visto'", "Substantivo — 'o visto expirou'"],
    "dado":   ["Verbo (particípio) — 'havia dado tudo'", "Substantivo — 'o dado de jogar'"],
    "pronto": ["Adjetivo — 'o jantar está pronto'", "Interjeição — 'Pronto! Acabou.'"],
    "alto":   ["Adjetivo — 'voz alta'", "Substantivo — 'o alto da serra'", "Advérbio — 'falar alto'"],
    "baixo":  ["Adjetivo — 'tom baixo'", "Substantivo — 'o baixo do violão'", "Advérbio — 'falar baixo'"],
    "ainda":  ["Advérbio — 'ainda não chegou'", "Conjunção — 'ainda que soubesse'"],
    "livre":  ["Adjetivo — 'tempo livre'", "Verbo — 'que ele livre os reféns'"],
    "certa":  ["Adjetivo — 'a certa altura'", "Pronome indefinido — 'certa vez'"],
    "certo":  ["Adjetivo — 'no momento certo'", "Advérbio — 'certo, entendi'", "Pronome — 'certo dia'"],
    "vez":    ["Substantivo — 'uma vez por semana'", "Conjunção — 'uma vez que saiu'"],
    "ante":   ["Preposição — 'ante o juiz'", "Prefixo — 'antepassado'"],
    "posto":  ["Verbo (particípio) — 'foi posto de lado'", "Substantivo — 'o posto de gasolina'", "Conjunção — 'posto que'"],
    "ora":    ["Conjunção — 'ora chora, ora ri'", "Interjeição — 'Ora, não exagere!'", "Advérbio — 'ora chegou'"],
    "logo":   ["Advérbio — 'logo mais cedo'", "Conjunção — 'logo, está certo'"],
    "caso":   ["Substantivo — 'o caso era grave'", "Conjunção — 'caso chova'"],
    "tanto":  ["Pronome indefinido — 'tanto silêncio'", "Advérbio — 'não chore tanto'"],
    "menos":  ["Advérbio — 'fez menos'", "Preposição — 'todos menos ele'"],
    "mesmo":  ["Advérbio — 'mesmo assim, foi'", "Adjetivo — 'o mesmo lugar'", "Pronome — 'ele mesmo'"],
    "so":     ["Advérbio — 'só ele sabia'", "Adjetivo — 'estava só, em silêncio'"],
    "morto":  ["Verbo (particípio) — 'havia morrido'", "Substantivo — 'um morto não fala'", "Adjetivo — 'estava morto'"],
    "que":    ["Pronome relativo — 'o livro que li'", "Conjunção — 'disse que viria'", "Pronome — 'Que saudade!'"],
    "se":     ["Conjunção condicional — 'se chover, fico'", "Conjunção integrante — 'perguntou se vinha'", "Pronome reflexivo — 'ela se machucou'"],
    "cujo":   ["Pronome relativo possessivo — 'o autor cujo livro li'"],
    "cuja":   ["Pronome relativo possessivo — 'a autora cuja obra marcou'"],
    "cujos":  ["Pronome relativo possessivo — 'os poetas cujos versos ecoam'"],
    "cujas":  ["Pronome relativo possessivo — 'as palavras cujas raízes vêm do latim'"],
    "onde":   ["Pronome relativo — 'a cidade onde nasceu'", "Advérbio interrogativo — 'onde você vai?'"],
    "qual":   ["Pronome relativo — 'o livro o qual ele leu'", "Pronome interrogativo — 'qual livro você quer?'"],
    "quais":  ["Pronome relativo — 'os livros os quais ela escolheu'", "Pronome interrogativo — 'quais você prefere?'"],
    "quem":   ["Pronome interrogativo — 'quem disse isso?'", "Pronome relativo — 'a pessoa a quem me refiro'"],
    "quanto": ["Pronome interrogativo — 'quanto custa?'", "Pronome relativo — 'tudo quanto ela sabia'", "Conjunção — 'tanto quanto possível'"],
    "nos":    ["Pronome pessoal — 'ela nos deu o livro'", "Preposição/Artigo — 'nos arredores da cidade'"],
    "presente": ["Adjetivo — 'estava presente na cerimônia'", "Substantivo — 'no presente, tudo muda'"],
    "seguinte": ["Adjetivo — 'no dia seguinte'"],
    "proximo":  ["Adjetivo — 'o próximo capítulo'"],
    "quando": ["Conjunção temporal — 'quando chegar, avise'", "Advérbio interrogativo — 'quando você vem?'"],
    "mal":    ["Advérbio — 'escreveu mal'", "Substantivo — 'o mal do século'", "Conjunção — 'mal chegou, saiu'"],
    "pois":   ["Conjunção causal — 'ficou, pois estava cansada'", "Advérbio — 'Pois sim, claro.'"],
    "segundo":["Conjunção conformativa — 'segundo Bechara'", "Adjetivo numeral — 'o segundo capítulo'"],
    "nossa":  ["Pronome possessivo — 'nossa casa'", "Interjeição — 'Nossa! Que susto!'"],
    "claro":  ["Adjetivo — 'dia claro'", "Advérbio — 'Claro que sim'"],
    "alto":   ["Adjetivo — 'voz alta'", "Substantivo — 'o alto da serra'", "Advérbio — 'voou alto'"],
    "caro":   ["Adjetivo — 'livro caro'", "Advérbio — 'custou caro'"],
    "muito":  ["Advérbio — 'era muito belo'", "Pronome indefinido — 'havia muito trabalho'"],
    "muita":  ["Pronome indefinido — 'muita gente veio'"],
    "muitos": ["Pronome indefinido — 'muitos chegaram cedo'"],
    "muitas": ["Pronome indefinido — 'muitas foram embora'"],
    "pouco":  ["Advérbio — 'andou pouco hoje'", "Pronome indefinido — 'pouco restava'"],
    "pouca":  ["Pronome indefinido — 'pouca água sobrou'"],
    "poucos": ["Pronome indefinido — 'poucos permaneceram'"],
    "poucas": ["Pronome indefinido — 'poucas conseguiram'"],
  };

  // P0.3 — formas acentuadas com acento distintivo (não stripped) → classe correta
  // "dá"≠"da"; "vê"≠"ve"; "pôr"≠"por"; "pôde"≠"pode"; "há"≠"ha"
  const VERBOS_ACENTUADOS = new Map([
    ["dá","Verbo flexionado"],   // DAR 3sg pres
    ["dão","Verbo flexionado"],  // DAR 3pl pres
    ["dê","Verbo (subjuntivo)"], // DAR subj pres
    ["vê","Verbo flexionado"],   // VER 3sg pres
    ["vêem","Verbo flexionado"], // VER 3pl pres (PE)
    ["vêm","Verbo flexionado"],  // VIR 3pl pres
    ["pôr","Verbo no infinitivo"],
    ["pôs","Verbo flexionado"],  // PÔR pret 3sg
    ["pôde","Verbo flexionado"], // PODER pret 3sg
    ["há","Verbo flexionado"],   // HAVER 3sg pres
    ["hão","Verbo flexionado"],  // HAVER 3pl pres
    ["fê-lo","Verbo flexionado"],
    ["pé","Substantivo"],        // não confundir com "pe"
    ["sê","Verbo (imperativo)"], // SER imperativo
    ["lê","Verbo flexionado"],   // LER 3sg pres
    ["lêem","Verbo flexionado"], // LER 3pl (PE)
    ["crê","Verbo flexionado"],  // CRER 3sg pres
    ["vós","Pronome pessoal"],
    ["nós","Pronome pessoal"],
  ]);

  // ── Classificação contextual (definição única — P0.1) ─────────────────────

  function analyze(word, text) {
    if (!word?.trim()) return null;
    const selectedWord = word.trim();
    // P0.3: acento distintivo vence normalização — checar antes de strip
    if (VERBOS_ACENTUADOS.has(selectedWord)) {
      const fixedClass = VERBOS_ACENTUADOS.get(selectedWord);
      const normalized = normalizeWord(selectedWord);
      const lexiconEntry = localLexicon[normalized];
      return {
        word: normalized,
        displayWord: lexiconEntry?.label || selectedWord,
        className: lexiconEntry?.className || fixedClass,
        functionName: inferFunctionName(fixedClass),
        field: lexiconEntry?.field || inferSemanticField(normalized, fixedClass),
        note: lexiconEntry?.note || createLocalNote(fixedClass, normalized),
        definicao: lexiconEntry?.definicao || inferDefinicao(normalized, fixedClass),
        funcaoSintatica: inferFuncaoSintatica(selectedWord, fixedClass, text),
        count: countWordOccurrences(text, normalized),
      };
    }
    const normalized = normalizeWord(selectedWord);
    // P0.6: clitico hifenizado — extrair base verbal + cliticos (me/te/se/o/a/lo/la/lhe/nos/vos/lhes)
    const _CLITICOS = new Set(["me","te","se","o","a","lo","la","lhe","nos","vos","lhes","los","las","mo","to","lho","no","vo"]);
    const _parts = selectedWord.split("-");
    const _isCliticizado = _parts.length >= 2 && _parts.slice(1).every(p => _CLITICOS.has(p.toLowerCase()) || /^(ei|as|a|emos|eis|ao|aria|arias|ariam|ariamos)$/.test(p.toLowerCase()));
    const _baseVerb = _isCliticizado ? _parts[0] : null;
    const lexiconEntry = localLexicon[normalized];
    // Usar classificação contextual quando há texto disponível
    const className = lexiconEntry?.className
      || (_isCliticizado ? (VERBOS_ACENTUADOS.has(_baseVerb) ? VERBOS_ACENTUADOS.get(_baseVerb)
          : /^.+(ar|er|ir|or)$/.test(normalizeWord(_baseVerb)) ? "Verbo no infinitivo" : "Verbo flexionado")
         : (text ? inferWordClassContextual(selectedWord, text) : inferWordClass(normalized, selectedWord)));

    const alternatives = (ALTERNATIVAS[normalized] || []).filter(alt => {
      const altClass = alt.split(" — ")[0];
      // Exclui alternativas idênticas ou que sejam prefixo da classe atual (ex: "Verbo" vs "Verbo (particípio)")
      return altClass !== className && !className.startsWith(altClass) && !altClass.startsWith(className);
    });

    return {
      word: normalized,
      displayWord: lexiconEntry?.label || selectedWord,
      className,
      functionName: inferFunctionName(className),
      field: lexiconEntry?.field || inferSemanticField(normalized, className),
      note: lexiconEntry?.note || createLocalNote(className, normalized),
      definicao: lexiconEntry?.definicao || inferDefinicao(normalized, className),
      funcaoSintatica: inferFuncaoSintatica(selectedWord, className, text),
      count: countWordOccurrences(text, normalized),
      alternatives,
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
    if (/(ado|ada|ados|adas|ido|ida|idos|idas)$/.test(normalized) && normalized.length >= 4
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

    // 19. Presente do indicativo (3ª pessoa) — norma-data.json verbos_pres_reg
    // Cobre formas como "escreve/fala/canta" que as desinências -e/-a não distinguem sem contexto
    if (_VERBOS_PRES_SET && _VERBOS_PRES_SET.has(normalized)) return "Verbo flexionado";
    // 19b. Formas irregulares (foi/fez/veio…) não capturadas por sufixos acima
    if (_FORMAS_IRR_SET && _FORMAS_IRR_SET.has(normalized)) return "Verbo flexionado";

    // 20. Infinitivo — VERB-INF-PESS-01
    // -ar/-er/-ir: sufixos canônicos do infinitivo (Bechara MGP §conjugação)
    if (/^.+(ar|er|ir)$/.test(normalized) && normalized.length > 3) return "Verbo no infinitivo";
    // -por: compostos de "pôr" — compor/dispor/expor/impor/opor/propor/repor/transpor
    // Substantivos agentivos em -or (escritor/autor/diretor/ator…) são Substantivo — ver regra 22
    if (/por$/.test(normalized) && normalized.length > 4) return "Verbo no infinitivo";

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

    // 23. Interjeições canônicas — INTERJ-01
    if (_INTERJEICOES.has(normalized)) return "Interjeição";

    // 24. Numerais cardinais — NUM-CARD-01
    if (_NUMERAIS_CARD.has(normalized)) return "Numeral";

    // 25. Numerais ordinais — NUM-ORD-01 (funcionam como adjetivo em contexto nominal)
    if (_ORDINAIS.has(normalized)) return "Adjetivo";

    return "Substantivo";
  }

  const _INTERJEICOES = new Set([
    "ah","oh","ai","ui","oi","ei","eh","hm","hmm","ah","aha","haha","ops","opa","ufa","ufa",
    "xi","xi","xii","caramba","puxa","poxa","nossa","droga","eca","eca","ixi","ixi",
    "arre","oxe","eita","vixe","bah","tchau","oba","olha","veja","ora",
    "uau","wow","hei","vamos","psiu","shh","zzz","bravo","bis"
  ]);

  const _NUMERAIS_CARD = new Set([
    "zero","dois","duas","tres","quatro","cinco","seis","sete","oito","nove",
    "dez","onze","doze","treze","quatorze","catorze","quinze","dezesseis","dezessete","dezoito","dezenove",
    "vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa",
    "cem","cento","duzentos","duzentas","trezentos","trezentas","quatrocentos","quatrocentas",
    "quinhentos","quinhentas","seiscentos","seiscentas","setecentos","setecentas",
    "oitocentos","oitocentas","novecentos","novecentas","mil","milhao","bilhao"
  ]);

  // Ordinais funcionam como Adjetivo quando acompanham substantivo (Bechara MGP §numerais)
  // Excluídos: primeiro/segunda/segundo/ultimo — já em adjetivos_comuns ou POLISSEMIA
  const _ORDINAIS = new Set([
    "terceiro","terceira","terceiros","terceiras",
    "quarta","quartas",                    // "quarto" = substantivo (cômodo) — excluído
    "quinto","quinta","quintos","quintas",
    "sexto","sexta","sextos","sextas",
    "setimo","setima","setimos","setimas",
    "oitavo","oitava","oitavos","oitavas",
    "nono","nona","nonos","nonas",
    "decimo","decima","decimos","decimas",
    "vigesimo","trigesimo","centesimo","milesimo",
    "penultimo","penultima","antepenultimo","antepenultima"
  ]);

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

    // Calcular vizinhos a partir do texto quando não fornecidos (P0.1 — duplicata removida)
    let prev2Norm = null;
    if (text && (prevNorm === undefined || nextNorm === undefined)) {
      const _tks = tokenizeWords(text);
      const _idx = _tks.findIndex(t => normalizeWord(t) === normalized);
      if (_idx !== -1) {
        if (prevNorm === undefined) prevNorm = _idx > 0 ? normalizeWord(_tks[_idx - 1]) : null;
        if (nextNorm === undefined) nextNorm = _idx < _tks.length - 1 ? normalizeWord(_tks[_idx + 1]) : null;
        prev2Norm = _idx > 1 ? normalizeWord(_tks[_idx - 2]) : null;
      }
    }

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
      const result = POLISSEMIA[normalized](prevNorm, nextNorm, prev2Norm);
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

    // 4. Morfologia base + particípio após cópula → Adjetivo predicativo (Bechara §adjetivo verbal)
    const _rawClass = inferWordClass(normalized, original);
    if (_rawClass.startsWith("Verbo (particípio)") && prevNorm) {
      // Cópulas que introduzem predicativo: estar/ficar/ser/parecer — NOT ter/haver (auxiliares)
      const _COPULAS_LINK = new Set([
        "estava","estou","esta","estamos","estao","estavam","estivera","esteve",
        "ficou","fica","ficava","ficara","ficavam","fique","ficam",
        "era","eram","e","sou","somos","sao","foi","fosse",
        "parecia","parece","pareceu","pareciam","parecessem",
        "mostrava","mostrou","revela","revelou",
        "permanecia","permanece","permaneceu","continuava","continua",
        "encontrava","encontra","achava","acha"
      ]);
      if (_COPULAS_LINK.has(prevNorm)) return "Adjetivo";
    }
    return _rawClass;
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

  // ── DEFINICOES — dicionário de escritor (Bechara + Cunha&Cintra + uso literário BR) ───────
  const DEFINICOES = {
    // ARCAÍSMOS — uso literário, jurídico ou formal arcaizante
    "outrossim":    "Conjunção aditiva formal equivalente a 'além disso', 'igualmente'. Arcaísmo frequente em textos jurídicos e na prosa do século XIX; soa antiquado na ficção contemporânea.",
    "mormente":     "Advérbio de especificação: 'principalmente', 'sobretudo'. Uso erudito; intercambiável com 'especialmente' ou 'sobretudo' em registro contemporâneo.",
    "quica":        "Advérbio de dúvida equivalente a 'talvez'. Literário e formal; mais raro que 'talvez' no português brasileiro atual.",
    "quica":        "Advérbio de dúvida equivalente a 'talvez'. Literário e formal; mais raro que 'talvez' no português brasileiro atual.",
    "hodierno":     "Adjetivo formal que significa 'atual', 'do tempo presente', 'contemporâneo'. Registro erudito; raro e arcaizante na prosa narrativa moderna.",
    "doravante":    "Advérbio temporal formal: 'daqui em diante', 'a partir de agora'. Frequente em textos jurídicos e normativos; funcional em diálogos formais.",
    "destarte":     "Advérbio de modo arcaico: 'deste modo', 'assim sendo'. Quase exclusivo da prosa literária do século XIX e de paródia formal.",
    "dessarte":     "Advérbio equivalente a 'dessa forma', 'desse jeito'. Variante de 'destarte'; igualmente arcaico fora do registro formal literário.",
    "conquanto":    "Conjunção concessiva equivalente a 'embora', 'ainda que'. Arcaísmo literário; substituível por 'embora' sem perda de sentido.",
    "porquanto":    "Conjunção causal formal: 'porque', 'uma vez que'. Uso jurídico e literário; raro na prosa contemporânea comum.",
    "porventura":   "Advérbio de dúvida: 'talvez', 'por acaso'. Literário; comum em interrogativas retóricas ('Porventura você acredita nisso?').",
    "outrem":       "Pronome indefinido: 'outra pessoa', 'os outros'. Uso literário e formal; mais específico que 'alguém'. Ex.: 'não prejudicar outrem'.",
    "deveras":      "Advérbio de afirmação e intensidade: 'verdadeiramente', 'de fato', 'muito'. Registro literário; mais expressivo que 'muito' quando a ênfase importa.",
    "sobremaneira": "Advérbio de intensidade: 'em demasia', 'excessivamente', 'muito'. Uso literário e formal; evitar em prosa coloquial.",
    "malgrado":     "Preposição ou conjunção concessiva: 'apesar de', 'não obstante'. Uso literário formal; intercambiável com 'apesar de'.",
    "alhures":      "Advérbio de lugar: 'em outro lugar', 'em outra parte'. Arcaísmo literário; raro em prosa contemporânea.",
    "algures":      "Advérbio de lugar: 'em algum lugar', 'em alguma parte'. Literário; mais raro que 'em algum lugar' no uso corrente.",
    "antanho":      "Advérbio de tempo: 'outrora', 'em tempos passados', 'antigamente'. Literário e arcaizante; frequente em poesia.",
    "outrora":      "Advérbio de tempo: 'em outro tempo', 'antigamente', 'antes'. Literário; mais comum que 'antanho' e ainda funcional na ficção histórica.",
    "dantes":       "Advérbio de tempo: 'antes', 'anteriormente'. Arcaísmo; usado com efeito historicizante ou irônico.",
    "ademais":      "Advérbio aditivo: 'além disso', 'também', 'ainda mais'. Registro formal; mais vivo que 'outrossim' no uso culto contemporâneo.",
    "mister":       "Substantivo formal: 'necessidade', 'precisão'. 'É mister que...' = 'É necessário que...'. Uso jurídico e formal literário.",
    "avante":       "Advérbio de lugar e direção: 'para a frente', 'adiante'. Literário; comum em narrativa histórica e poesia de cunho épico.",
    "donde":        "1. Advérbio relativo: 'de onde' (ex: 'a terra donde veio'). 2. Conjunção conclusiva: 'daí que', 'portanto'. Uso formal e literário.",
    "nomeadamente": "Advérbio especificativo: 'especialmente', 'a saber', 'em particular'. Uso formal e jurídico; pode soar lusitano no Brasil.",
    "sobretudo":    "Advérbio de especificação: 'principalmente', 'acima de tudo'. Formal mas ainda corrente; não é arcaísmo, é registro elevado.",
    "maxime":       "Advérbio latino-formal: 'especialmente', 'principalmente'. Latinismo jurídico e erudito; raro na prosa narrativa contemporânea.",
    "consoante":    "Preposição/Conjunção conformativa: 'conforme', 'segundo', 'de acordo com'. Uso jurídico e formal; arcaizante em prosa literária.",
    "merce":        "Substantivo: 'graça', 'favor', 'misericórdia'. Arcaísmo literário; 'à mercê de' = 'ao poder de' — esta locução ainda se usa.",
    "oxala":        "Partícula optativa ou conjunção: exprime desejo intenso ('tomara que', 'espero que'). De origem árabe; bem integrada ao português brasileiro.",
    "tampouco":     "Advérbio negativo: 'também não', 'nem'. Formal; preciso e elegante; menos corrente que 'também não' na fala espontânea.",
    "afim":         "Adjetivo: 'semelhante', 'aparentado', 'relacionado'. Não confundir com 'a fim de' (locução prepositiva final).",
    "jaez":         "Substantivo: 'tipo', 'qualidade', 'espécie'. 'Da mesma jaez' = 'do mesmo tipo'. Uso coloquial ou arcaico; produtivo na ficção de época.",
    "algures":      "Advérbio de lugar: 'em algum lugar indefinido'. Literário; mais preciso que 'em algum lugar' quando a indeterminação é o efeito.",
    "ato":          "Substantivo polissêmico. 1. Ação realizada. 2. Parte de uma peça teatral. 3. 'No ato' = imediatamente. 4. 'Ato contínuo' = logo em seguida (locução formal).",
    "suso":         "Advérbio arcaico: 'acima', 'anteriormente' (em texto). Uso exclusivamente jurídico ou paródico; substituível por 'acima'.",
    "infra":        "Advérbio formal (do latim): 'abaixo', 'a seguir' (em texto). Uso jurídico, acadêmico e técnico.",
    "outrora":      "Advérbio temporal literário: 'em outro tempo', 'antes', 'antigamente'. Útil em ficção histórica e narrativas de memória.",
    // CONTEMPORÂNEO — neologismos e registro de uso
    "impactar":     "Verbo de neologismo corporativo: 'causar impacto em', 'afetar fortemente'. Em prosa literária, prefira 'afetar', 'transformar', 'abalar' — mais precisos.",
    "alavancar":    "Verbo do vocabulário de negócios: 'impulsionar', 'potencializar'. Em prosa literária, use verbos mais específicos ao contexto da ação.",
    "deletar":      "Verbo de origem inglesa (delete): 'apagar', 'excluir'. Registro informal/digital; em prosa, prefira 'apagar', 'excluir' ou 'apagar do mapa'.",
    "empoderar":    "Verbo derivado do inglês 'empower': 'dar poder a', 'fortalecer', 'fazer sentir capaz'. Neologismo de uso político e social corrente.",
    "ressignificar": "Verbo: 'dar novo significado a', 'reinterpretar'. Neologismo acadêmico e psicológico; pouco recomendável em prosa literária formal.",
    "protagonizar": "Verbo com uso em disputa: 'ser o protagonista de' é o significado original. Uso consagrado 'protagonizar um escândalo' é criticado por gramáticos clássicos mas largamente aceito.",
    "visibilizar":  "Verbo neológico ativista: 'tornar visível', 'dar visibilidade a'. Registro político e social contemporâneo; pode soar artificial em prosa literária.",
    "curadoria":    "Substantivo: 'seleção e organização de conteúdo com critério'. Originalmente restrito a museus; hoje usado amplamente em cultura digital.",
    "vivencia":     "Substantivo: 'experiência pessoal intensa e acumulada'. Palavra viva e rica; diferente de 'experiência' (mais neutro) por implicar transformação interior.",
    // LITERÁRIOS — palavras com uso específico na escrita criativa
    "silencio":     "Ausência de som; estado de quem não fala. Na ficção, o silêncio é tão expressivo quanto a palavra — pode ser personagem, escolha ou ausência. Use-o com intenção.",
    "saudade":      "Sentimento de ausência com afeto: sentir falta de alguém ou algo amado. Palavra de difícil tradução; marca a afetividade brasileira e a narrativa de memória.",
    "solidao":      "Estado de estar só; mas também sensação de desconexão mesmo entre pessoas. Diferente de 'isolamento' (físico) e de 'abandono' (relacional).",
    "crepusculo":   "Momento entre o dia e a noite; o período de luz difusa antes do escurecer completo. Na ficção, é metáfora de transição, fim e ambiguidade.",
    "alvorecer":    "Substantivo e verbo: o momento do amanhecer; o surgimento da luz. Literário; mais expressivo que 'amanhecer' por carregar a ideia de um começo que emerge.",
    "penumbra":     "Meia-sombra; zona de luz difusa entre o claro e o escuro. Na ficção, é o espaço do não-dito, do pressentimento, do que está prestes a acontecer.",
    "lusco-fusco":  "Hora do crepúsculo quando a luz está ambígua entre o dia e a noite. Expressão popular brasileira; mais sensorial que 'crepúsculo'.",
    "aprazivel":    "Adjetivo: 'agradável', 'que apraz', 'ameno'. Literário e formal; mais sofisticado que 'agradável' quando o contexto é refinado.",
    "melindroso":   "Adjetivo: 'sensível ao ponto de se ofender facilmente'; mas também 'delicado', 'que exige cuidado'. Útil para personagens ou situações frágeis.",
    "vociferar":    "Verbo: 'gritar', 'bradar', 'falar em voz muito alta com ira'. Mais específico que 'gritar' por implicar agitação e perda de controle.",
    "soçobrar":     "Verbo: 'afundar', 'naufragar', 'fracassar'. Literário; 'o navio soçobrou' / 'o plano soçobrou'. Raro na prosa comum.",
    "fulgor":       "Substantivo: 'brilho intenso', 'claridade ofuscante'. Literário; mais carregado que 'brilho' por implicar beleza perturbadora.",
    "latejo":       "Substantivo: 'pulsação', 'batida rítmica' (veias, coração). Onomatopéico e sensorial; útil em cenas de tensão física.",
    "fremito":      "Substantivo: 'frêmito', 'tremor', 'vibração'. Literário; descreve o estado do corpo quando a emoção não encontra palavras.",
    "furtivo":      "Adjetivo: 'que age às escondidas', 'sorrateiro', 'dissimulado'. Preciso em cenas de segredo, vigilância ou transgressão.",
    "ensejar":      "Verbo: 'proporcionar oportunidade', 'dar ensejo a', 'possibilitar'. Formal; mais elegante que 'permitir' em registro literário elevado.",
    "obnubilar":    "Verbo: 'obscurecer', 'turvar', 'confundir a mente'. Literário e médico; 'a dor obnubilava seu raciocínio'.",
    "alvissaras":   "Substantivo plural: 'recompensa dada a quem traz boa notícia'. Arcaísmo; 'Alvíssaras!' como interjeição de alegria ainda aparece na literatura.",
    "inopinado":    "Adjetivo: 'inesperado', 'repentino', 'que veio sem aviso'. Literário; mais contundente que 'inesperado' por implicar total falta de sinal.",
    "arguto":       "Adjetivo: 'perspicaz', 'aguçado', 'de raciocínio rápido e preciso'. Literário; elogio à inteligência que percebe detalhes imperceptíveis.",
    "labirinto":    "Substantivo: estrutura ou situação sem saída clara. Na ficção, metáfora da mente, da burocracia, do amor, da memória — use com consciência do eco borgiano.",
    "testemunho":   "Substantivo: 'declaração de quem viu'; mas também 'o que resta de uma experiência' (o corpo como testemunho, a cicatriz como testemunho). Palavra de peso em narrativa.",
    "lacuna":       "Substantivo: 'falta', 'espaço vazio', 'o que não foi dito'. Na ficção, as lacunas são tão poderosas quanto o que está escrito — o que o leitor preenche.",
    "palimpsesto":  "Manuscrito antigo apagado para receber novo texto, mas onde os rastros do anterior ainda transparecem. Metáfora da memória, da reescrita, da identidade.",
    "epifania":     "Revelação súbita e intensa; momento em que algo se torna claro de modo inesperado. Conceito de James Joyce adaptado à narrativa: o instante que condensa o todo.",
    "incipiente":   "Adjetivo: 'que está começando', 'em estágio inicial', 'rudimentar'. Formal; indica início sem garantia de desenvolvimento.",
    "efemero":      "Adjetivo: 'que dura pouco', 'passageiro', 'transitório'. Palavra literária rica; implica beleza na brevidade.",
    "perene":       "Adjetivo: 'que dura sempre', 'permanente', 'que não se esgota'. Oposto de 'efêmero'; útil em reflexões sobre memória, natureza e amor.",
    "vernacular":   "Adjetivo ou substantivo: 'próprio da língua materna', 'nativo de uma região'. 'Português vernacular' = português original, sem termos estrangeiros.",
    "altissonante": "Adjetivo: 'de som elevado'; no sentido figurado, 'pomposo', 'grandiloquente', 'que soa mais do que significa'. Útil para criticar linguagem afetada.",
    "circunloquio": "Substantivo: 'uso de muitas palavras para dizer o que poderia ser dito com poucas'. Vício do discurso que a revisão deve combater.",
    "eufemismo":    "Figura de linguagem: substituição de palavra ou ideia desagradável por outra mais suave. Ex.: 'passou dessa para melhor' em vez de 'morreu'. Cuidado: o excesso apaga a realidade.",
    "perifirase":   "Figura de linguagem: expressão de muitas palavras para substituir uma simples. 'O astro-rei' em vez de 'sol'. Pode ser elegante ou afetada.",
    "anacoluto":    "Figura de sintaxe: ruptura da estrutura gramatical da frase, geralmente para expressar emoção ou pensamento fragmentado. Recurso de voz e oralidade.",
    "elipse":       "1. Figura de sintaxe: omissão de elemento que se subentende ('Eu fui ao mercado; [eu] comprei pão.'). 2. Recurso narrativo: salto no tempo ou na ação — o que não é mostrado.",
    "zeugma":       "Figura de sintaxe: omissão de uma palavra já expressa antes. 'Uns votaram sim; outros, [votaram] não.' Cria ritmo e concisão.",
    "assindeto":    "Figura de construção: omissão de conjunções para dar velocidade ('Vim, vi, venci'). Ritmo acelerado; cria urgência e energia.",
    "polissindeto": "Figura de construção: uso excessivo de conjunções ('e... e... e...'). Cria ritmo acumulativo, peso emocional ou oralidade.",
    "anafora":      "Figura de repetição: repetição de uma palavra no início de versos ou orações consecutivas. Cria ênfase e ritmo litânico.",
    "epiifora":     "Figura de repetição: repetição de palavra ao final de orações sucessivas. Efeito de insistência, eco, obsessão.",
    "catafora":     "Referência que aponta para algo que ainda virá no texto ('Ele disse isso: a verdade dói.'). Cria expectativa e suspense.",
    "analepse":     "Recurso narrativo: retorno ao passado dentro da narrativa (flashback). Não confundir com 'prolepse' (antecipação do futuro).",
    "prolepse":     "Recurso narrativo: antecipação de evento futuro dentro da narrativa (flash-forward). Cria ironia, pressentimento ou suspense.",
    "diegese":      "O mundo da história narrada; tudo que existe dentro da ficção. Oposto de 'extradiegético' (narrador fora do mundo da história).",
    "verossimilhanca": "Grau em que a ficção parece credível ao leitor dentro de suas próprias regras. Não é verdade, é credibilidade interna ao mundo criado.",
    "cronotopo":    "Conceito de Bakhtin: a relação entre tempo e espaço numa obra. Cada gênero literário tem seu cronotopo próprio (o da estrada, o da sala de estar, etc.).",
    // REGISTRO — palavras comuns com uso específico na escrita
    "cunho":        "Substantivo: 'marca', 'caráter', 'natureza'. 'De cunho político' = 'de caráter político'. Uso formal; produtivo em ensaios e análises.",
    "enseada":      "Substantivo geográfico: pequena reentrância da costa marítima protegida do vento. Mais específico que 'baía'; útil em ficção que usa o mar.",
    "cerne":        "Substantivo: 'parte central', 'núcleo', 'essência'. 'O cerne da questão' = 'o ponto central'. Mais preciso que 'centro' em sentido figurado.",
    "vertente":     "Substantivo: 1. lado de uma montanha (geografia). 2. corrente, tendência de um movimento ('vertente romântica'). 3. aspecto, ângulo ('vertente emocional').",
    "arco":         "Substantivo: 1. forma curva. 2. Na narrativa, 'arco do personagem' = a transformação que ele sofre ao longo da história. Conceito central de estrutura narrativa.",
    // FIGURAS DE LINGUAGEM
    "metafora":     "Figura de comparação implícita: atribui a um elemento as qualidades de outro sem usar 'como'. 'Sua voz era seda' ≠ 'Sua voz era como seda' (símile). Bechara: a metáfora é a figura central de toda criação literária.",
    "hiperbole":    "Figura de exagero: amplifica ou diminui além do real para dar intensidade. 'Já te disse mil vezes.' Usada com medida, gera força; usada com excesso, perde credibilidade.",
    "metonimia":    "Substituição de uma palavra por outra com relação de contiguidade: o autor pela obra ('Leio Machado'), o todo pela parte, a causa pelo efeito. Diferente da metáfora, que é por semelhança.",
    "simile":       "Comparação explícita usando 'como', 'tal como', 'assim como'. 'Sua voz era como seda.' Mais didática que a metáfora; a distância entre os termos cria a potência da imagem.",
    "ironia":       "Dizer o contrário do que se quer comunicar, esperando que o leitor perceba a divergência. Exige conivência; sem ela, vira confusão ou ofensa. Difere do sarcasmo por ser mais sutil.",
    "sarcasmo":     "Ironia mais agressiva, com intenção de ferir ou desmoralizar. O tom é mais explícito que na ironia; o alvo é claramente apontado. Em ficção, revela o personagem mais do que a situação.",
    "paradoxo":     "Afirmação aparentemente contraditória que contém uma verdade profunda. 'O silêncio gritou.' 'Quanto mais aprendo, menos sei.' Força o leitor a reconciliar dois polos opostos.",
    "antitese":     "Aproximação de ideias contrárias em estrutura paralela. 'Amei e odiei; construí e destruí.' Cria contraste e tensão sem a aparente contradição do paradoxo.",
    "oximoro":      "Fusão de dois termos contraditórios em uma só expressão: 'alegria triste', 'claridade negra', 'silêncio ensurdecedor'. Vai além da antítese — os termos coexistem, não se opõem.",
    "sinestesia":   "Mistura de sentidos: descrever uma sensação com linguagem de outro sentido. 'Grito azul', 'cheiro doce do medo', 'silêncio quente'. Usada com intenção, cria imagens densas e originais.",
    "aliteracao":   "Repetição de sons consonantais para criar efeito sonoro ou rítmico. 'Pedro pedreiro penseiro.' Em poesia, é recurso de musicalidade; em prosa, pode criar atmosfera ou oralidade.",
    "onomatopeia":  "Palavra que imita o som da coisa que designa: 'sussurro', 'murmúrio', 'fragor', 'tic-tac'. Na prosa, podem criar presença sensorial; em excesso, parecem artificiosas.",
    "prosopopeia":  "Atribuição de qualidades humanas a seres inanimados, abstratos ou não humanos. 'O mar reclamou.' 'O tempo engoliu tudo.' Também chamada personificação. Bechara: a mais comum das figuras de pensamento.",
    "hiperbato":    "Inversão da ordem direta dos termos da oração para ênfase ou efeito sonoro. 'Da vida no mais escuro fundo' em vez de 'No fundo mais escuro da vida'. Recurso poético clássico.",
    "gradacao":     "Sequência de termos em intensidade crescente ou decrescente. 'Um suspiro, uma lágrima, um soluço, um grito.' Cria ritmo acumulativo e direciona a emoção do leitor.",
    "eufemismo":    "Substituição de palavra ou ideia desagradável por outra mais suave. 'Passou dessa para melhor.' 'Terceira idade.' Cuidado: o excesso de eufemismo apaga a realidade — escolha com consciência.",
    // NARRATIVA
    "narrador":     "Instância que conta a história; não confundir com o autor. Homodiegético: narrador dentro da história (1ª pessoa). Heterodiegético: narrador fora da história (3ª pessoa). A voz do narrador define o tom de tudo.",
    "personagem":   "Ser de ficção que habita o mundo da história. Protagonista: conduz a ação. Antagonista: opõe-se. Personagem plana: uma dimensão. Personagem redonda (E. M. Forster): múltipla, surpreende.",
    "protagonista": "Personagem principal que conduz a ação da narrativa. Não é necessariamente herói — pode ser antero, neutro, antipatético. Sua trajetória define o arco da obra.",
    "antagonista":  "Força ou personagem que se opõe ao protagonista. Não precisa ser malvado: pode ser uma ideia, o ambiente, o próprio protagonista (conflito interno). Quanto mais complex, mais viva a narrativa.",
    "enredo":       "Sequência de eventos da narrativa, com relação de causa e efeito. Diferente da história (o que aconteceu) e do discurso (como se conta). Um bom enredo convence que os eventos não poderiam ser de outra forma.",
    "trama":        "Estrutura profunda de relações e tensões que sustenta a narrativa. A 'trama' é mais ampla que o 'enredo': inclui motivações, segredos, subplots. Um enredo pobre pode ter trama rica.",
    "cena":         "Unidade dramática da narrativa: momento mostrado em tempo real, com ação, diálogo e presença física. Oposto de 'sumário' (resumo do tempo passado). A cena é onde o leitor vive, não lê.",
    "climax":       "Ponto de maior tensão ou intensidade da narrativa; o momento em que o conflito central atinge seu ápice. Após o clímax, começa a resolução. Em narrativas não lineares, pode estar deslocado.",
    "desfecho":     "Resolução final da narrativa após o clímax; o estado das coisas ao final. Não precisa ser 'feliz' nem 'explicativo' — um bom desfecho é inevitável e ainda assim surpreendente.",
    "conflito":     "Tensão entre forças opostas que move a narrativa: homem vs. homem, homem vs. natureza, homem vs. sociedade, homem vs. si mesmo. Sem conflito, não há história — apenas registro.",
    "ponto":        "Em 'ponto de vista': posição do narrador ou da câmera narrativa; de onde e como a história é percebida. Define o que o leitor sabe, quando sabe e em que medida confia.",
    "voz":          "Em narrativa: a personalidade que emerge da escrita — o ritmo, a seleção de palavras, o que se diz e o que se omite. A voz é o que faz dois textos sobre o mesmo assunto parecerem mundos diferentes.",
    "ritmo":        "Padrão de velocidade, variação e ênfase ao longo do texto. Controlado por extensão das frases, pontuação, escolha de palavras, alternância de cenas e sumários. O ritmo é a respiração da prosa.",
    "cadencia":     "Em prosa: o movimento musical das frases — como os sons e pausas se sucedem. Em poesia: o padrão de sílabas e acentos. Uma cadência bem trabalhada é sentida antes de ser analisada.",
    "dialogo":      "Reprodução da fala entre personagens. Em ficção, o diálogo precisa fazer mais de uma coisa ao mesmo tempo: revelar personagem, avançar conflito, fornecer informação — nunca só conversa.",
    "rascunho":     "Versão inicial de um texto, não destinada a leitores. O rascunho é o espaço de liberdade — onde se pode errar e descobrir. A diferença entre escritores e não-escritores está na disposição de reescrever.",
    "revisao":      "Processo de releitura crítica e reescrita do texto. Diferente de correção (erros formais): a revisão questiona estrutura, ritmo, necessidade de cada palavra. Boa revisão é nova escritura.",
    "estilo":       "Conjunto de escolhas que tornam um texto reconhecível como de determinado autor: sintaxe, vocabulário, ritmo, imagens recorrentes. O estilo não se aprende — se descobre pela prática intensa.",
    // CULTURA BRASILEIRA
    "sertao":       "Região do interior árido do Nordeste e de partes do Centro-Oeste brasileiro; mas também símbolo literário de isolamento, resistência e identidade. Em Guimarães Rosa, o sertão é o mundo e a alma humana.",
    "quilombo":     "Originalmente: comunidade de pessoas escravizadas que fugiam e se organizavam em resistência. Hoje: também símbolo de resistência cultural afro-brasileira. Quilombo dos Palmares = maior da história.",
    "cerrado":      "Savana tropical do Brasil Central; bioma de grande biodiversidade e rico repertório cultural indígena e sertanejo. Na ficção, espaço de resistência silenciosa e beleza não-óbvia.",
    "caatinga":     "Bioma semiárido do Nordeste, com vegetação adaptada à seca. 'Caatinga' vem do tupi: 'mata branca'. Espaço literário de escassez, determinação e delicadeza no adverso.",
    "favela":       "Assentamento urbano de baixa renda, especialmente no Rio de Janeiro e São Paulo. Espaço de grande produção cultural; evite tratar como sinônimo de violência ou pobreza apenas — é comunidade.",
    "cordel":       "Literatura de cordel: gênero popular brasileiro em versos rimados e metrificados, originário do Nordeste. Temas: heróis, batalhas, fé, humor, política. Formato impresso em folhetos pendurados em cordas.",
    "saudosismo":   "Tendência a idealizar o passado com afeto e melancolia. No Brasil, por vezes associado ao pessimismo cultural ('o Brasil foi melhor'); na literatura, pode ser recurso criativo ou vício de perspectiva.",
    "mangue":       "Ecossistema costeiro de transição entre mar e terra; berçário de biodiversidade. No Manguebeat (Recife, anos 90): símbolo de resistência cultural e miscigenação sonora.",
    "pampa":        "Planície gaúcha do Sul do Brasil; paisagem de campo aberto, gado, gauchismo. Na ficção, espaço de honra, liberdade e solidão. 'Pampa' vem do quéchua: 'planície'.",
    "varzea":       "Terra periodicamente alagada às margens de rios na Amazônia. Símbolo de fertilidade e de tempo lento; espaço de literatura ribeirinha e indígena amazônica.",
    // EMOÇÃO / CORPO / SENSAÇÃO
    "melancolia":   "Estado de tristeza difusa, profunda e prolongada, sem causa imediata identificável. Mais rica que 'tristeza': implica reflexão, memória, uma qualidade contemplativa. Humour negro dos antigos.",
    "nostalgia":    "Sentimento de afeto doloroso pelo passado — por um tempo, lugar ou pessoa que não existe mais. Do grego nóstos (retorno) + álgos (dor). Em narrativa, é sempre seletiva: o que lembramos diz mais que o passado real.",
    "euforia":      "Estado de exaltação e bem-estar intenso; pode ser real, artificial ou maníaco. Em personagens, desconfie da euforia — ela raramente sustenta. Como recurso narrativo, a euforia prepara a queda.",
    "angustia":     "Ansiedade profunda sem objeto definido; sensação de ameaça iminente sem nome. Diferente do medo (tem objeto) e da tristeza (olha ao passado) — a angústia é presente e difusa.",
    "vertigem":     "Sensação de instabilidade, de que o chão gira ou falta. Literal e metafórica. Em prosa, pode descrever tanto o estado físico quanto o impacto de uma revelação, uma decisão impossível.",
    "arrepio":      "Contração involuntária da pele, com pelos eriçados; resposta ao frio, ao medo ou à beleza intensa. Palavra corporal e precisa; mais viva que 'calafrio' em cenas de susto ou emoção estética.",
    "calafrio":     "Tremor do corpo por frio ou por medo intenso. Diferente de 'arrepio' por ser mais profundo — envolve o corpo inteiro. Em ficção, indica limiar entre o mundo comum e o ameaçador.",
    "tremor":       "Agitação involuntária do corpo; sinal de medo, frio, emoção intensa ou doença. Em cenas de tensão, o tremor localiza fisicamente a emoção abstrata — prefira a especificidade: mão, voz, queixo.",
    "pulsacao":     "Batida rítmica do coração ou do sangue nas veias. Em prosa, metáfora de vida, urgência, desejo. 'A pulsação da cidade' = o ritmo vital do lugar. Mais orgânico que 'ritmo' em contextos corporais.",
    // ESTILO / REGISTRO
    "laconico":     "Adjetivo: que diz muito em poucas palavras; conciso ao extremo. Da cidade de Lacedemônia (Esparta), onde a brevidade era virtude militar. Modelo estilístico: cada palavra carrega peso.",
    "prolixo":      "Adjetivo: que usa muitas palavras onde poucas bastariam; difuso, excessivo. Vício a evitar na prosa narrativa; às vezes intencional como voz de personagem.",
    "eloquente":    "Adjetivo: que se expressa com eficácia, clareza e força persuasiva. Pode ser um orador, um gesto, um silêncio — a eloquência não é necessariamente verborrágica.",
    "contundente":  "Adjetivo: que atinge com força; que causa impacto. 'Argumento contundente', 'cena contundente'. Mais específico que 'forte' por implicar que o golpe encontrou o alvo.",
    "plausivel":    "Adjetivo: que pode ser verdade dentro do contexto dado; crível, convincente. Diferente de 'verossímil' (parece real) — o plausível refere-se à lógica interna; o verossímil, à aparência.",
    "ambiguo":      "Adjetivo: que admite mais de uma interpretação; de sentido duplo ou incerto. A ambiguidade bem controlada é riqueza literária; mal controlada, é falta de precisão.",
    "explicito":    "Adjetivo: expresso claramente, sem deixar margem de dúvida. Em narrativa, o excesso de explicação mata a ambiguidade criativa. 'Show, don't tell' = preferir o implícito ao explícito.",
    "implicito":    "Adjetivo: que está subentendido, não dito diretamente. A literatura trabalha muito com o implícito — o que o personagem não diz revela mais do que o que diz.",
    "didatico":     "Adjetivo: que ensina, explica, conduz o leitor pela mão. Necessário em não-ficção; perigoso em ficção — excesso de didatismo retira o leitor da experiência e o coloca na condição de aluno.",
    // PROCESSOS DE ESCRITA
    "intertextualidade": "Relação entre um texto e outros textos, explícita ou implícita. Citação, paráfrase, paródia, alusão. Todo texto fala com outros textos — a questão é se o escritor controla isso ou não.",
    "pastiche":     "Imitação do estilo de outro autor ou época, geralmente sem intenção crítica (diferente da paródia, que subverte). Pode ser exercício legítimo ou mera cópia sem propósito.",
    "parafraseio":  "Reescrita de um texto com palavras diferentes, mantendo o sentido. Útil para testar a compreensão; na revisão, serve para encontrar a forma mais clara de dizer o mesmo.",
    "subplote":     "Trama secundária que corre paralela à principal. Um bom subplote ilumina o protagonista de outro ângulo ou contradiz a tese principal — ele existe em relação, não por adorno.",
    "foreshadowing": "Antecipação sutil de eventos futuros; semeadura de pistas. Em português: 'prenúncio', 'sinalização'. O leitor não percebe na primeira leitura, mas reconhece na segunda como inevitável.",
    "suspense":     "Estado de incerteza e expectativa que mantém o leitor em tensão. Criado pela pergunta 'o que vai acontecer?' — diferente do mistério ('o que aconteceu?'). Hitchcock: suspense = bomba sob a mesa.",
    "flashback":    "Retorno ao passado dentro da narrativa; analepse. Em português: 'retrospectiva'. Funciona melhor quando motivado por algo no presente — não como enciclopédia de fundo do personagem.",
    "corte":        "Mudança abrupta de cena, ponto de vista ou tempo na narrativa, sem transição explicada. O corte cinematográfico adaptado à prosa cria velocidade e exige leitor ativo. Use para acelerar ou surpreender.",
    // LÍNGUA BRASILEIRA
    "lusofonia":    "Comunidade de países e povos que têm o português como língua oficial ou de referência. Não homogeneidade: o português falado no Brasil, em Portugal, em Moçambique, no Timor-Leste são realidades distintas.",
    "oralidade":    "Característica de um texto que reproduz ou evoca a língua falada. Na ficção brasileira, é recurso de identidade e voz: de Guimarães Rosa a Carolina Maria de Jesus, a oralidade é estilo, não erro.",
    "coloquial":    "Adjetivo: pertencente ao registro informal da língua, da conversa cotidiana. Em ficção, o coloquial pode ser marca de voz, de personagem, de lugar — não é equivalente a 'errado'.",
    "neologismo":   "Palavra ou expressão nova na língua, por criação ou empréstimo. A língua viva produz neologismos constantemente. Na prosa literária, um bom neologismo ilumina; um ruim soa afetado.",
    "arcaismo":     "Palavra, expressão ou construção que saiu de uso corrente. Pode ser recurso intencional (ficção histórica, ironia, humor) ou vício (estilo embolorado). O critério é a intenção e o efeito.",
    "registro":     "Variedade de língua adaptada à situação de comunicação: formal/informal, técnico/cotidiano, oral/escrito. Misturar registros com intenção é recurso poderoso; misturar sem intenção é ruído.",
    "diaspora":     "Dispersão de um povo para fora de seu território de origem. Literatura de diáspora: textos que lidam com o deslocamento, a identidade fragmentada, a saudade e a criação de pertencimento em outro lugar.",
    // PROCESSO DE ESCRITA — verbos do ofício
    "rascunhar":    "Verbo: fazer o primeiro jato de um texto, sem comprometimento com a forma definitiva. O rascunho é território livre — o julgamento vem depois, na revisão. Escrever mal de propósito para ter com o que trabalhar.",
    "revisar":      "Verbo: reler o texto com distância crítica para corrigir, apurar e lapidar. A revisão é diferente da correção: não se trata só de erros, mas de ritmo, clareza, intenção e coerência de voz.",
    "narrar":       "Verbo: contar uma história, relatar eventos em sequência com ponto de vista. Narrar implica escolha: o que incluir, o que omitir, a que velocidade revelar — cada escolha é estilo.",
    "publicar":     "Verbo: dar o texto ao público, finalizar o ciclo da escrita. Publicar é um ato irreversível — depois que saiu, o texto pertence ao leitor. Daí a importância de não publicar antes de estar pronto.",
    // NARRATIVA — conceitos estruturais
    "cliche":       "Expressão ou recurso narrativo tão repetido que perdeu força expressiva. 'Coração partido', 'silêncio ensurdecedor', 'olhos como estrelas'. O clichê não é errado — é fraco; o escritor o usa sem pensar. A saída: torcer a imagem, achá-la de novo.",
    "climax":       "Ponto de maior tensão dramática de uma narrativa; o momento em que o conflito central se resolve ou se agudiza ao máximo. Após o clímax, a história pode caminhar para o desfecho. Não confundir com o fim: o clímax é a crise, não a solução.",
    "catarse":      "Liberação emocional intensa que a obra provoca no leitor ou espectador. Conceito de Aristóteles: a tragédia purifica as paixões pela piedade e pelo terror. Na prosa: o leitor chora, ri, sente alívio — a obra tocou algo real.",
    "dialogo":      "Fala dos personagens — um dos recursos mais difíceis da ficção. Um bom diálogo não é transcrição de conversa real: é seleção e condensação. Cada fala revela caráter, oculta intenção ou tensiona a cena.",
    // POESIA — formas e elementos
    "estrofe":      "Grupo de versos organizado como unidade; o 'parágrafo' do poema. A divisão em estrofes cria ritmo visual e pausas de sentido. Quadra (4), quintilha (5), sextilha (6), oitava (8), terzina (3).",
    "verso":        "Linha do poema; unidade mínima de composição poética. O verso pode ser metrificado (número fixo de sílabas) ou livre (sem métrica regular). O retorno a cada linha é uma escolha do poeta, não acidente tipográfico.",
    "rima":         "Correspondência de sons entre o final de dois ou mais versos. Rima consoante: identidade de vogal e consoantes finais. Toante: só a vogal tônica. A rima cria expectativa, satisfação e memória auditiva.",
    "soneto":       "Forma fixa de 14 versos: dois quartetos (ABBA ABBA) e dois tercetos (CDC DCD ou variação). Originário da Itália, consolidado por Petrarca. No Brasil: Camões, Cruz e Sousa, Drummond, Adélia Prado usaram e subverteram a forma.",
    "cronica":      "Gênero híbrido entre jornalismo e literatura: texto breve, de tema cotidiano, com liberdade de forma e voz pessoal. No Brasil, a crônica tem tradição forte (Rubem Braga, Paulo Mendes Campos, Clarice Lispector) — não é 'notícia literária', é observação que dura.",
    "haiku":        "Forma japonesa de poema brevíssimo: 17 sílabas em três versos (5-7-5). Origem na escola de Matsuo Bashō. Capta um instante sensorial com precisão. Em português, a contagem silábica é adaptada. O haiku não explica — apenas mostra.",
    // FIGURAS DE LINGUAGEM
    "metafora":     "Figura de linguagem que transfere o sentido de uma palavra para outra por semelhança implícita, sem 'como': 'a vida é uma batalha', 'o tempo passou rápido'. A boa metáfora ilumina o que a explicação direta não alcança.",
    "ironia":       "Figura de linguagem que diz o oposto do que quer significar, criando duplo sentido. Requer cumplicidade do leitor para ser decodificada. Ironia mal sinalizada pode ser tomada ao pé da letra — o contexto é tudo.",
    "hiperbole":    "Exagero expressivo deliberado para intensificar um efeito: 'chorei um rio', 'esperei uma eternidade'. Não é mentira: é amplificação poética. A hipérbole bem colocada cria humor, emoção ou ênfase.",
    "aliteracao":   "Repetição de consoantes próximas para criar efeito sonoro: 'o rato roeu a roupa'. Na prosa poética, a aliteração cria musicalidade e reforça o sentido — o som imita o conteúdo.",
    "sinestesia":   "Figura que mistura percepções de sentidos diferentes: 'voz doce', 'silêncio frio', 'luz gritante'. Cria imagens sensoriais complexas e inesperadas. Frequente em poesia modernista e surrealista brasileira.",
    // EDITORIAL
    "manuscrito":   "O texto original do autor antes da edição e publicação. Pode ser literalmente escrito à mão ou em versão digital. O manuscrito é a obra bruta — o que vira livro é resultado de um diálogo entre autor e editor.",
    "versao":       "Instância de um texto em determinado momento do processo de escrita. 'Segunda versão', 'versão final'. Manter versões é prática saudável: permitem recuar e recuperar escolhas descartadas.",
    "prefacio":     "Texto de abertura de um livro, escrito pelo autor ou por outra pessoa. Apresenta a obra, contextualiza, convida à leitura. Diferente de 'introdução' (que já é parte do texto) e de 'posfácio' (que comenta após a leitura).",
    "epilogo":      "Texto que vem após o fim da narrativa principal; desfecho complementar ou comentário posterior aos acontecimentos. Permite ao autor situar o que aconteceu depois, ou ao narrador se despedir do leitor.",
    "capitulo":     "Divisão de uma obra em unidade narrativa com relativa autonomia. O capítulo tem começo, meio e fim próprios — mas serve ao todo. A escolha de onde cortar e recomeçar é uma das decisões mais importantes da estrutura.",

    // Emoções — v823
    "vergonha":     "Sentimento de exposição do que se julga inferior ou errado em si mesmo. Na narrativa, é força interna de grande potência: esconde, mente, paralisa e, às vezes, liberta.",
    "culpa":        "Consciência dolorosa de ter causado um dano — real ou imaginado. Diferente de vergonha (o que os outros veem), a culpa é o que a personagem sabe de si. Motor narrativo silencioso.",
    "rancor":       "Mágoa que o tempo não dissolve — ao contrário, azeda. Personagens com rancor carregam o passado como peso vivo. Diferente de raiva: o rancor é calmo, paciente e perigoso.",
    "desespero":    "Estado em que todas as saídas parecem fechadas. No texto literário, o desespero não é fraqueza — é o ponto em que a personagem vai mais fundo em si mesma. É limiar.",
    "comocao":      "Abalo emocional que perturba a compostura. Na escrita, comoção é o efeito que o texto quer produzir no leitor — e que a cena deve justificar, não anunciar.",
    "cumplicidade": "Vínculo que une duas pessoas em algo que não se diz em voz alta. Na ficção, a cumplicidade se constrói em gestos pequenos, olhares, silencios — não em declarações.",
    "inveja":       "Desejo do que o outro tem, acompanhado de dor por não tê-lo. Na narrativa, a inveja é rara como tema declarado — mas frequente como motor disfarçado de ação.",

    // Verbos de conflito/movimento interior — v823
    "hesitar":      "Paralisar diante de uma escolha — não por fraqueza, mas por peso real das alternativas. Personagens que hesitam têm profundidade; a hesitação é o espaço onde o caráter se revela.",
    "perseguir":    "Mover-se em direção a algo ou alguém com obstinação. Na narrativa, o perseguidor pode ser um antagonista, mas também um objetivo, um fantasma, uma ideia — e a perseguição é estrutura.",
    "trair":        "Romper um pacto implícito ou explícito de confiança. A traição é um dos maiores catalisadores narrativos: ela muda o estado moral de todos os personagens envolvidos.",
    "redimir":      "Reparar, recuperar o valor perdido — de si mesmo ou de outro. A redenção é arco narrativo clássico; no texto contemporâneo, pode ser irônica, incompleta ou negada.",
    "sucumbir":     "Ceder ao peso de uma força maior — física, emocional ou moral. A personagem que sucumbe não é necessariamente fraca: às vezes, sucumbir é a única resposta honesta.",
    "rebelar":      "Recusar-se a obedecer ao que é esperado — pela família, pela sociedade, pela narrativa. A rebeldia de uma personagem define onde ela coloca sua liberdade.",
    "ceder":        "Dar espaço ao outro, desistir de uma posição — por cansaço, generosidade ou cálculo. Ceder não é sinônimo de fraqueza; pode ser o gesto mais difícil da cena.",
    "confrontar":   "Colocar-se diante de outra força para medir diferença ou conflito. O confronto é momento de alta tensão dramática; revela quem cada personagem é sob pressão.",

    // Natureza brasileira — v823
    "rio":          "Curso de água que atravessa territórios e histórias. Na literatura brasileira, o rio é personagem: o São Francisco, o Amazonas, o Paraíba — cada um carrega seu próprio tempo e seus mortos.",
    "floresta":     "Ecossistema denso, de alta biodiversidade e linguagem própria. Na narrativa brasileira, a floresta não é cenário: é força ativa, com leis que personagens urbanos não entendem.",
    "montanha":     "Elevação de terreno que impõe limite e perspectiva. Na ficção, a montanha é obstáculo, refúgio e horizonte — o que se vê do alto muda o que a personagem quer.",
    "mar":          "Extensão de água salgada que separa e conecta. Na literatura, o mar é fronteira, memória e infinito. Em Clarice, em Guimarães Rosa, em Jorge Amado — o mar é língua própria.",
    "brejo":        "Área úmida entre terra firme e água corrente. Paisagem de transição e lama — no texto literário brasileiro, o brejo é lugar de abandono, fertilidade e ambiguidade.",
    "rocha":        "Formação geológica dura, permanente, anterior a tudo. Na ficção, a rocha é contraste com a fragilidade humana — e às vezes, refúgio que nenhuma tempestade apaga.",
    "neblina":      "Névoa densa que apaga contornos e distâncias. Na narrativa, a neblina é recurso atmosférico e moral: esconde intenções, cria suspense, deixa o leitor na dúvida do que é real.",

    // Qualidades textuais — v823
    "lacunar":      "Diz-se de um texto com lacunas intencionais — o que não está dito faz parte do sentido. Narrador não-confiável, elipse emocional, silêncio calculado: tudo pode ser estratégia lacunar.",
    "denso":        "Texto que concentra muita informação, sensação ou significado em pouco espaço. Densidade é virtude quando equilibrada com clareza; excesso de densidade cansa e afasta o leitor.",
    "fluido":       "Texto que se move sem atrito — as frases se encadeiam, o leitor avança sem perceber. Fluidez não é simplicidade: é domínio do ritmo, da transição e da respiração da prosa.",
    "digressao":    "Desvio intencional do tema ou da ação principal para explorar um pensamento lateral. A digressão, bem usada, aprofunda personagem e mundo; mal usada, é procrastinação narrativa.",

    // Figuras de linguagem adicionais — v824
    "anafora":      "Repetição de uma palavra ou expressão no início de versos ou orações consecutivas. Cria ritmo e ênfase. 'Quero a paz. Quero o silêncio. Quero o sono.' A anáfora não é tique — é escolha.",
    "catafora":     "Referência que aponta para algo que ainda vai ser dito. 'Vou te contar: ela desapareceu.' O 'isso' antes do 'isso' — suspense de sintaxe.",
    "eufonismo":    "Substituição de uma palavra por outra de sentido suavizado. 'Faleceu' por 'morreu'; 'passou para a outra' por 'morreu'. Na ficção, eufemismos revelam quem evita o que.",
    "eufemismo":    "Substituição de uma palavra por outra de sentido suavizado. 'Faleceu' por 'morreu'; 'passou para a outra' por 'morreu'. Na ficção, eufemismos revelam quem evita o que.",
    "gradacao":     "Encadeamento de ideias em ordem crescente ou decrescente de intensidade. 'Chorou, gritou, implorou.' A gradação é escada narrativa — sobe ou desce, nunca fica no mesmo degrau.",
    "antitese":     "Aproximação de ideias contrárias numa mesma frase. 'Amor é fogo que arde sem se ver' (Camões). A antítese não contradiz — ilumina tensão.",
    "paradoxo":     "Afirmação que parece contraditória mas contém verdade profunda. 'A morte é o começo.' Diferente da antítese: o paradoxo mantém os opostos convivendo, sem resolver.",
    "apostrofe":    "Vocativo dirigido a alguém ou algo ausente, abstrato ou imaginário. 'Ó morte, onde está tua vitória?' Na prosa literária, a apóstrofe marca voz em extremo emocional.",
    "perífrase":    "Substituição de um nome por uma expressão descritiva. 'A cidade maravilhosa' por 'Rio de Janeiro'. Na ficção, a perífrrase é escolha de perspectiva — quem nomeia assim, vê assim.",
    "anacolutoo":   "Ruptura da construção gramatical esperada, deixando um termo em suspenso. 'Eu, aquele assunto... prefiro não falar.' Revela perturbação, pudor, memória incompleta.",
    "anacoluto":    "Ruptura da construção gramatical esperada, deixando um termo em suspenso. 'Eu, aquele assunto... prefiro não falar.' Revela perturbação, pudor, memória incompleta.",
    "zeugma":       "Omissão de um termo que apareceu antes e está subentendido. 'Ela amou a música; eu, a poesia.' Cria ritmo econômico — o que não é dito une as partes.",

    // Termos de narrativa e ponto de vista — v824
    "focalizacao":  "Perspectiva pela qual a história é narrada — quem vê, o quê e quanto. Genette distingue: focalização zero (narrador onisciente), interna (personagem vê) e externa (câmera fria). A focalização determina o que o leitor sabe.",
    "perspectiva":  "Em narrativa: posição de visão do narrador ou personagem. Em poesia: ângulo de tratamento do tema. A perspectiva não é neutra — toda escolha revela quem conta.",
    "onisciente":   "Narrador que sabe tudo: pensamentos, emoções, passado e futuro de todos os personagens. Também chamado 'narrador Deus'. Pode criar distância ou, quando bem usado, cumplicidade universal.",
    "autodiegetico":"Narrador que é ao mesmo tempo personagem principal. Conta sua própria história em primeira pessoa. Memória, parcialidade e voz íntima são as marcas desse modo.",
    "homodiegetico":"Narrador que é personagem da história que narra, sem ser o protagonista. Vê de perto, mas de lado — Nuno, o amigo que observa; o vizinho que testemunha.",
    "heterodiegetico":"Narrador que está fora da história — não é personagem. Pode ser onisciente ou limitado à perspectiva de um personagem.",

    // Gêneros literários — v824
    "terror":       "Gênero que visa provocar medo intenso — não apenas inquietação, mas ameaça à integridade. Na ficção brasileira, mescla-se ao realismo mágico, ao folclore e ao horror social.",
    "suspense":     "Tensão mantida pela incerteza sobre o que vai acontecer. O leitor sabe menos do que quer, ou sabe algo que o personagem não sabe — e isso é o gatilho da virada de página.",
    "saga":         "Narrativa longa que acompanha personagens ou famílias por longos períodos ou gerações. Exige domínio de tempo, genealogia e coerência de mundo. Desafio técnico e emocional maior.",
    "ficção":       "Narrativa construída por invenção — mesmo quando inspirada em fatos reais. Não é sinônimo de mentira: é pacto entre autor e leitor para explorar verdades que o real não alcança sozinho.",

    // Recursos de estilo — v824
    "mostrar":      "No ensino de escrita criativa: presentar a cena de modo que o leitor viva, não apenas entenda. 'Ela tremia' vs. 'ela estava com medo.' A escolha de mostrar exige imagem concreta.",
    "contar":       "No ensino de escrita criativa: narrar os fatos em resumo, sem cena. Útil para compressão, transição e ritmo — não é defeito, mas escolha. Alterar entre mostrar e contar é técnica.",
    "ritmo":        "No texto em prosa: a cadência das frases — curtas e longas, pausa e velocidade. No verso: o padrão de sílabas e acentos. O ritmo é o pulso do texto; o leitor o sente antes de perceber.",
    "cena":         "Unidade narrativa com tempo real e presença dos personagens. A cena acontece 'agora' — diálogo, ação, sensação. É o oposto do sumário, que comprime o tempo.",
    "sumario":      "Narração condensada de um período de tempo sem entrar em cena. 'Durante anos, ela tentou esquecer.' O sumário é elipse controlada — não fuga, mas escolha de o que não mostrar.",
    "climax":       "O ponto de maior tensão ou virada decisiva de uma narrativa. Não é o final — é o momento em que a pergunta central do texto encontra seu pico de intensidade.",
    "anticlimax":   "Resolução de tensão de modo surpreendentemente menor do que o esperado. Pode ser decepção narrativa ou, quando intencional, ironia — o real raramente tem finais cinematográficos.",

    // Emoções adicionais — v824
    "extase":       "Estado de exaltação extrema — alegria que ultrapassa o comum. Na ficção, o êxtase é raro e perigoso: narrativa que leva o leitor até lá precisa ter ganhado o direito de fazer isso.",
    "indignicao":   "Revolta moral diante do que se considera injusto. A indignação é força política e emocional — e no texto literário, pode ser o motor de um personagem ou a voz implícita do narrador.",
    "indignacao":   "Revolta moral diante do que se considera injusto. A indignação é força política e emocional — e no texto literário, pode ser o motor de um personagem ou a voz implícita do narrador.",
    "ternura":      "Afeto suave, cuidadoso — quase físico em sua delicadeza. Na prosa, a ternura é difícil: exige precision sem sentimentalismo, presença sem exposição.",
    "decepção":     "Sentimento que segue uma expectativa não cumprida. Diferente da frustração (bloqueio de meta), a decepção é sobre a pessoa ou coisa que falhou. Muda relações de forma permanente.",
    "decepcao":     "Sentimento que segue uma expectativa não cumprida. Diferente da frustração (bloqueio de meta), a decepção é sobre a pessoa ou coisa que falhou. Muda relações de forma permanente.",
    "alivio":       "Liberação de uma tensão que durava. Na ficção, o alívio pode ser clímax silencioso — uma cena sem drama, mas carregada pelo que veio antes.",
    "susto":        "Reação imediata e involuntária a algo inesperado. Diferente do medo (que se prolonga), o susto é instante — mas deixa rastro emocional na cena e no leitor.",

    // Crítica literária e teoria — v827
    "canonico":     "Que pertence ao cânone — o conjunto de obras consideradas essenciais ou modelares numa tradição. No Brasil, o cânone é debatido: quem escolheu, quem ficou fora, por quê.",
    "paratexto":    "Tudo que envolve o texto sem ser o texto: título, epígrafe, dedicatória, prefácio, orelha, capa. Genette cunhou o termo. O paratexto enquadra a leitura antes de ela começar.",
    "intertexto":   "Referência implícita ou explícita a outros textos dentro de um texto. Pode ser citação, alusão, paródia ou pastiche. Todo texto conversa com textos anteriores — a questão é como.",
    "dialogismo":   "Conceito de Bakhtin: todo texto é habitado por outras vozes. A linguagem é sempre dialógica — uma resposta ao que já foi dito, uma antecipação do que será respondido.",
    "recepcao":     "O modo como o público, a crítica ou a história lê e reage a uma obra. A teoria da recepção (Iser, Jauss) colocou o leitor no centro do sentido — a obra se completa na leitura.",
    "autor":        "Instância real ou implícita de quem escreve. Em teoria literária, o 'autor implícito' (Booth) é distinto da pessoa real: é a voz construída pelo texto. 'A morte do autor' (Barthes) propõe que o texto existe sem precisar de explicação do autor.",
    "leitor":       "Destinatário da escrita — real, implícito ou modelo. Umberto Eco distinguiu o 'leitor-modelo': aquele para quem o texto foi construído. Escrever é construir também quem vai ler.",

    // Editoração e produção do livro — v827
    "orelha":       "Texto impresso na aba da sobrecapa, ao lado da capa e da quarta capa. Apresenta o livro e o autor em linguagem que convida à leitura — não é sinopse, é convite.",
    "quarta":       "Face oposta à capa. Contém geralmente sinopse, depoimentos críticos, código de barras e ISBN. A quarta capa é o segundo contato do leitor com o livro após a capa.",
    "frontispicio": "Página de rosto ilustrada ou decorada, no início do livro. Pode mostrar o título, o nome do autor e um elemento visual. Hoje raramente usado; foi essencial nos séculos XVIII e XIX.",
    "colofao":      "Nota ao final do livro com dados técnicos: tipografia, papel, impressão, encadernação, data. Herança dos incunábulos; hoje raro, mas volta em edições de arte.",
    "errata":       "Lista de erros tipográficos encontrados após a impressão, com as correções. Folha solta ou página extra, colocada no exemplar. Testemunha o processo — nenhum texto sai perfeito.",
    "diagramacao":  "Organização visual do texto na página: margens, entrelinhamento, colunas, disposição de títulos e imagens. A diagramação é leitura silenciosa — boa diagramação não se nota.",
    "copidesque":   "Revisão editorial que vai além dos erros: reorganiza, reescreve trechos, corta redundâncias, padroniza o texto. Em inglês, 'copyediting'. O copidesque é quem cuida do escritor.",
    "galera":       "Prova tipográfica para revisão — colunas longas de texto antes da diagramação. Na era digital, o termo migrou para 'prova' ou 'PDF de revisão'. Ver erros na galera é a última defesa.",

    // Termos de personagem — v827
    "antagonista":  "Força que se opõe ao protagonista. Não é necessariamente o vilão — pode ser um sistema, a natureza, o próprio protagonista. O antagonismo é a pressão que revela o caráter.",
    "foil":         "Personagem que contrasta com outra para destacar suas qualidades. Sancho Pança e Dom Quixote; Watson e Holmes. Em português: 'contraponto' ou 'personagem-espelho'.",
    "antiheroi":    "Protagonista que carece das qualidades heroicas tradicionais. Pode ser covarde, egoísta, imoral — mas captura algo verdadeiro sobre o humano. Macabéa, de Clarice, é anti-heroína.",
    "narrador":     "Instância que conta a história — não confundir com o autor. O narrador tem perspectiva, voz, posição no mundo narrado e grau de confiabilidade. Escolher o narrador é escolher o que pode ser visto.",

    // Registros de linguagem — v827
    "coloquial":    "Registro informal e espontâneo da língua — o da conversa, da intimidade, da proximidade social. Na ficção, o coloquial diz o nível de confiança entre personagens e o universo social do texto.",
    "erudito":      "Registro formal e letrado da língua. Na ficção, o erudito pode marcar distinção de classe, ironia narrativa ou distância emocional — quando o texto 'fala difícil', isso é sempre escolha.",
    "registro":     "Variedade da língua usada de acordo com o contexto: formal/informal, oral/escrito, técnico/poético. Misturar registros intencionalmente é recurso literário; misturar sem perceber é ruído.",
    "voz":          "Na narrativa: o estilo e a personalidade que marcam como o texto fala. A voz é o que faz um parágrafo soar como Guimarães Rosa e não como qualquer outro. É o que não se imita — só se desenvolve.",
    "tom":          "A atitude do texto diante do que narra: irônico, melancólico, urgente, distante, íntimo. O tom é o que o leitor sente antes de analisar. Mudar o tom muda o texto todo.",

    // Gêneros e subgêneros — v827
    "autoficção":   "Escrita em que o autor usa a si mesmo como personagem, mas sem compromisso estrito com os fatos reais. Diferente da autobiografia: na autoficção, a ficção é declarada. Sebald, Angot, Scliar.",
    "autoficcao":   "Escrita em que o autor usa a si mesmo como personagem, mas sem compromisso estrito com os fatos reais. Diferente da autobiografia: na autoficção, a ficção é declarada.",
    "noir":         "Gênero que mistura crime, atmosfera sombria e personagens moralmente ambíguos. Vem do cinema dos anos 1940. Na prosa, o noir tem frases curtas, ritmo tenso e um mundo sem saída clara.",
    "distopia":     "Narrativa que imagina uma sociedade futura opressiva e desumanizadora. Orwell, Huxley, Atwood. Na ficção brasileira, distopia se mistura ao real tão frequentemente que a linha fica borrada.",
    "utopia":       "Narrativa que imagina uma sociedade ideal — e as contradições internas que a tornam impossível. Thomas More cunhou o termo (do grego 'não lugar'). A utopia é mais trágica do que parece.",
  };

  function inferDefinicao(word, className) {
    const n = normalizeWord(word) || word;
    if (DEFINICOES[n]) return DEFINICOES[n];
    // Fallback por classe
    if (className.includes("Verbo (gerúndio)"))    return "Verbo no gerúndio — exprime ação em curso ou modo.";
    if (className.includes("Verbo (subjuntivo)"))  return "Verbo no modo subjuntivo — exprime dúvida, hipótese, desejo ou subordinação.";
    if (className.includes("Verbo (particípio)"))  return "Verbo no particípio — funciona como adjetivo verbal ou em tempos compostos.";
    if (className.includes("Verbo"))               return "Verbo — núcleo do predicado; exprime ação, estado ou fenômeno.";
    if (className === "Adjetivo")                  return "Adjetivo — atribui qualidade, estado ou característica ao substantivo.";
    if (className === "Advérbio")                  return "Advérbio — modifica verbo, adjetivo ou outro advérbio; indica circunstância.";
    if (className === "Conjunção")                 return "Conjunção — conecta orações ou termos, estabelecendo relação de sentido.";
    if (className === "Preposição" || className === "Preposição/Artigo") return "Preposição — liga termos da oração, subordinando o segundo ao primeiro.";
    if (className === "Artigo")                    return "Artigo — determina o substantivo (definido: 'o/a'; indefinido: 'um/uma').";
    if (className.includes("Pronome relativo"))    return "Pronome relativo — retoma o antecedente e introduz oração adjetiva.";
    if (className.includes("Pronome interrogativo")) return "Pronome interrogativo — introduz pergunta direta ou indireta.";
    if (className.includes("Pronome pessoal"))     return "Pronome pessoal — substitui o nome de uma pessoa do discurso.";
    if (className.includes("Pronome"))             return "Pronome — substitui ou acompanha o substantivo.";
    if (className.includes("Interjeição"))         return "Interjeição — expressão de sentimento ou reação espontânea; não integra sintaticamente a frase.";
    if (className.includes("Substantivo próprio")) return "Substantivo próprio — nome de pessoa, lugar ou entidade específica; sempre com maiúscula.";
    if (className.includes("Substantivo"))         return "Substantivo — nomeia seres, objetos, sentimentos, ações e conceitos.";
    if (className.includes("Numeral"))             return "Numeral — indica quantidade, ordem ou proporção.";
    return "";
  }

  // ── Função sintática heurística — orientação ao escritor (não substituição de parser completo)
  function inferFuncaoSintatica(word, className, sentence) {
    if (!sentence || !className) return "";
    const tokens   = tokenizeWords(sentence);
    const norm     = normalizeWord(word);
    const idx      = tokens.findIndex(t => normalizeWord(t) === norm);
    if (idx === -1) return "";

    // Normalizar className: entradas do lexicon local podem ter classe semântica (lex-*/narrativa/…)
    // em vez de classe gramatical; nesse caso, usar morfologia para inferir a classe real
    const _GRAM_PFX = ["Substantivo","Verbo","Adjetivo","Advérbio","Conjunção","Preposição","Pronome","Artigo","Interjeição","Numeral"];
    const effectiveClass = _GRAM_PFX.some(p => className.startsWith(p))
      ? className
      : inferWordClass(norm, word);

    // Classes com função fixa
    if (effectiveClass.startsWith("Verbo") && !effectiveClass.includes("particípio") && !effectiveClass.includes("gerúndio"))
      return "Predicado";
    if (effectiveClass === "Verbo (gerúndio)") return "Adjunto adverbial de modo";
    if (effectiveClass.startsWith("Conjunção")) return "Conectivo";
    if (effectiveClass.startsWith("Advérbio"))  return "Adjunto adverbial";
    if (["Preposição","Preposição/Artigo"].includes(effectiveClass)) return "Elemento prepositivo";
    if (effectiveClass === "Artigo") return "Determinante";
    if (effectiveClass.includes("Interjeição")) return "Vocativo / Expressão";
    if (effectiveClass.includes("Pronome relativo")) return "Conector de oração relativa";
    if (effectiveClass.includes("Pronome interrogativo")) return "Introdutor de pergunta";

    // Adjetivo / particípio — predicativo vs adnominal
    if (effectiveClass.startsWith("Adjetivo") || effectiveClass === "Verbo (particípio)") {
      const prevNorm = idx > 0 ? normalizeWord(tokens[idx-1]) : null;
      const _COP = new Set(["estava","estou","esta","era","e","sou","sao","foi","fica","ficou","parecia","parece"]);
      if (prevNorm && _COP.has(prevNorm)) return "Predicativo do sujeito";
      return "Adjunto adnominal";
    }

    // Substantivo / pronome — posição relativa ao verbo
    // Formas finitas irregulares de alta frequência não capturadas por morfologia sufixal
    const _VBF = new Set([
      "e","sou","somos","sao","era","eras","eram","eramos","foi","foram","sera","serao","seria","serias","seriam","fosse","fossem",
      "esta","estou","estamos","estao","estava","estavas","estavam","estavamos","esteve","estiveram","estaria","estivesse","estivessem",
      "tem","tenho","temos","tinha","tinhas","tinham","tinhamos","teve","tiveram","teria","tivesse","tivessem",
      "ha","hei","houve","haveria","houvesse","houvessem","havera","haverao",
      "vou","vai","vamos","vao","ia","ias","iam","iamos","ira","irao","iria","irias","iriam",
      "faz","faco","fazemos","fazem","fazia","faziam","fez","fizeram","faria","fizesse","fizessem",
      "pode","posso","podemos","podem","podia","podiam","pude","puderam","poderia","pudesse","pudessem",
      "quer","quero","queremos","querem","queria","queriam","quis","quiseram","quisesse","quisessem",
      "sabe","sei","sabemos","sabem","sabia","sabiam","soube","souberam","saberia","soubesse","soubessem",
      "vem","venho","vimos","veem","vinha","vinhas","vinham","veio","vieram","viria","viesse","viessem",
      "da","dou","damos","dao","dava","davamos","deu","deram","daria","desse","dessem",
      "diz","digo","dizemos","dizem","dizia","diziam","disse","disseram","diria","dissesse","dissessem",
      "ve","vejo","vemos","veem","via","viam","viu","viram","veria","visse","vissem",
      "le","leio","lemos","leem","lia","liam","leu","leram","leria","lesse","lessem",
      "ri","rio","rimos","riem","ria","riam","riu","riram","riria","risse","rissem",
      "ouve","ouco","ouvimos","ouvem","ouvia","ouviam","ouviu","ouviram","ouviria","ouvisse","ouvissem",
      "traz","trago","trazemos","trazem","trazia","traziam","trouxe","trouxeram","traria","trouxesse","trouxessem",
      "fica","fico","ficamos","ficam","ficava","ficavam","ficou","ficaram","ficaria","ficasse","ficassem",
      "cai","caio","caimos","caem","caia","caiam","caiu","cairam","cairia","caisse","caissem",
    ]);

    // Sufixos de pretérito perfeito seguros para posição 0 (não colidem com nomes próprios como Maria/-ia)
    const _PERF_SFX = /^.{3,}(ou|eu|iu|aram|eram|iram|ando|endo|indo|asse|esse|isse)$/;

    let verbIdx = -1;
    for (let i = 0; i < tokens.length; i++) {
      if (i === idx) continue;
      const n = normalizeWord(tokens[i]);
      // 1. Irregular finitas de alta frequência (cobre "foi","era","leu","deu"…)
      if (_VBF.has(n)) { verbIdx = i; break; }
      if (i === 0) {
        // Posição inicial: sufixos seguros + lista de presentes (sem colisão com prenomes — verificado)
        if (_PERF_SFX.test(n)) { verbIdx = 0; break; }
        if (_VERBOS_PRES_SET && _VERBOS_PRES_SET.has(n)) { verbIdx = 0; break; }
        continue;
      }
      // Posições > 0: morfologia contextual com original capitalizado
      // (rule 9 protege nomes próprios não-iniciais como "Maria" no meio da frase)
      const prevN = normalizeWord(tokens[i-1]);
      const nextN = i < tokens.length-1 ? normalizeWord(tokens[i+1]) : null;
      const tc = inferWordClassContextual(tokens[i], sentence, prevN, nextN);
      if (tc && tc.startsWith("Verbo") && tc !== "Verbo no infinitivo") { verbIdx = i; break; }
    }
    if (verbIdx === -1) return "";

    // Preposições puras (sem "a"/"o" artigos, sem contrações duplas já cobertas abaixo)
    const PURE_PREPS = new Set(["de","em","para","por","com","sem","sobre","ao","da","do","na","no","pelo","pela","nos","nas","aos","ate","apos","perante","ante","entre","desde","durante","mediante","conforme"]);
    const prevNorm = idx > 0 ? normalizeWord(tokens[idx-1]) : null;
    const prevPrev = idx > 1 ? normalizeWord(tokens[idx-2]) : null;
    // inPrepPhrase: prev é preposição, OU prev é artigo e prev2 é preposição ("para a cidade")
    const _ARTS_PT = new Set(["a","o","os","as","um","uma"]);
    const inPrepPhrase = (prevNorm && PURE_PREPS.has(prevNorm))
                      || (prevNorm && _ARTS_PT.has(prevNorm) && prevPrev && PURE_PREPS.has(prevPrev));

    if (effectiveClass.startsWith("Substantivo") || effectiveClass.includes("Pronome pessoal") ||
        effectiveClass.includes("Pronome demonstrativo") || effectiveClass.includes("Pronome indefinido")) {
      if (idx < verbIdx) return inPrepPhrase ? "Adjunto adnominal" : "Sujeito";
      if (idx > verbIdx) {
        // Prep phrase é determinante: nunca é sujeito posposto
        if (inPrepPhrase) return "Objeto indireto / adjunto adverbial";
        // Sujeito posposto: verbo é precoce — nenhum token nominal antes dele
        const _GRAM_SYN = new Set(["a","o","os","as","um","uma","de","em","para","por","com","sem",
          "nao","ja","so","ate","apos","aqui","ali","la","entao","assim","talvez","logo","ainda",
          "sempre","nunca","ontem","hoje","amanha","tambem","nem","pois","mais","menos","mui","bem",
          "mal","ai","ca","cedo","tarde","agora","depois","antes","tambem","ate","nao","se","ja"]);
        const contentBeforeVerb = tokens.slice(0, verbIdx).filter(t => !_GRAM_SYN.has(normalizeWord(t))).length;
        if (contentBeforeVerb === 0) return "Sujeito posposto";
        return "Objeto direto";
      }
    }
    return "";
  }

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
    if (!text) return 0;
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
