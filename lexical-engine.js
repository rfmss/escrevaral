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
      const AUX = new Set(["havia","tinha","teria","tenho","tem","temos","tinham","foram","foi","sendo","tendo","haviamos","tinhamos","fosse","sera","sido","ser","ter"]);
      if (prev && AUX.has(prev)) return "Verbo (particípio)";
      // Após cópula predicativa → Adjetivo ("estava visto", "ficou visto")
      const COPULAS_V = new Set(["estava","ficou","fica","esta","e","era","eram","pareceu","parecia","continua"]);
      if (prev && COPULAS_V.has(prev)) return "Adjetivo";
      // Após artigo/contração/determinante → Substantivo (documento de viagem)
      const ART = new Set(["o","a","os","as","um","uma","do","da","dos","das","no","na","nos","nas","ao","meu","seu","nosso","teu","este","esse","aquele","neste","nesse","naquele"]);
      if (prev && ART.has(prev)) return "Substantivo";
      return "Verbo (particípio)";
    },

    "posto": (prev, next) => {
      // "posto que" → Conjunção causal/concessiva
      if (next && normalizeWord(next) === "que") return "Conjunção";
      // Após auxiliar de voz passiva → Verbo (particípio)
      const AUX = new Set(["foi","sera","fora","fosse","sendo","sido","foram","ser","ter","tendo"]);
      if (prev && AUX.has(prev)) return "Verbo (particípio)";
      // Após cópula predicativa → Adjetivo ("ficou posto", "estava posto", "é posto")
      const COPULAS_P = new Set(["ficou","fica","ficava","estava","esta","e","era","eram","pareceu","parecia"]);
      if (prev && COPULAS_P.has(prev)) return "Adjetivo";
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
      // "ora...ora" → Advérbio correlativo alternativo ("ora chora, ora ri")
      if (next && normalizeWord(next) === "ora") return "Advérbio";
      if (prev && normalizeWord(prev) === "ora") return "Advérbio";
      // Próxima palavra é pronome, artigo ou demonstrativo → Interjeição ("Ora, isso não existe!")
      const PART_INTERJ = new Set(["isso","este","esse","aquilo","voce","eles","elas","nos","que","bom"]);
      if (next && PART_INTERJ.has(normalizeWord(next))) return "Interjeição";
      // Início + próxima é modal negativo → Interjeição ("Ora, não!")
      const PART_NEG_MODAL = new Set(["nao","nem","ja","bem","la","ve","olha","eis","basta","veja","xii"]);
      if (!prev && next && PART_NEG_MODAL.has(normalizeWord(next))) return "Interjeição";
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

    // "melhor/pior" — Adjetivo quando precedido por artigo; Advérbio nos demais usos
    // "o melhor texto" → Adjetivo; "escreve melhor" / "ficou pior" → Advérbio
    const _ARTS_COMP = new Set(["o","a","os","as","um","uma","do","da","dos","das","no","na"]);
    POLISSEMIA["melhor"] = (prev) => prev && _ARTS_COMP.has(prev) ? "Adjetivo" : "Advérbio";
    POLISSEMIA["pior"]   = (prev) => prev && _ARTS_COMP.has(prev) ? "Adjetivo" : "Advérbio";
    POLISSEMIA["melhores"] = (prev) => prev && _ARTS_COMP.has(prev) ? "Adjetivo" : "Advérbio";
    POLISSEMIA["piores"]   = (prev) => prev && _ARTS_COMP.has(prev) ? "Adjetivo" : "Advérbio";

    // "antes/depois" — Preposição quando seguido de "de/do/da"; Advérbio caso contrário
    // functionWords.conjuncoes inclui erroneamente "antes/depois" — POLISSEMIA override
    POLISSEMIA["antes"] = (prev, next) => {
      if (next && ["de","do","da","dos","das","disso","disto","daquilo"].includes(next)) return "Preposição";
      return "Advérbio";
    };
    POLISSEMIA["depois"] = (prev, next) => {
      if (next && ["de","do","da","dos","das","disso","disto","daquilo"].includes(next)) return "Preposição";
      return "Advérbio";
    };

    // "junto" — advérbio ("vamos juntos") vs preposição de locução ("junto a/com")
    // functionWords.preposicoes pode incluí-lo; default → Advérbio
    POLISSEMIA["junto"] = () => "Advérbio";
    POLISSEMIA["juntos"] = () => "Advérbio";
    POLISSEMIA["juntas"] = () => "Advérbio";

    // "tarde" — Advérbio vs Substantivo (Bechara §classes §adv de tempo)
    // "A tarde" / "Boa tarde" / "Na tarde" → Substantivo; "Chegou tarde" / "mais tarde" → Advérbio
    const _ARTS_TARDE = new Set(["o","a","os","as","um","uma","uns","umas","do","da","dos","das","no","na","pelo","pela"]);
    POLISSEMIA["tarde"] = (prev) => {
      if (!prev) return "Substantivo";
      if (_ARTS_TARDE.has(prev)) return "Substantivo";
      if (prev === "boa" || prev === "bom") return "Substantivo";
      return "Advérbio";
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
      // "claro" — Advérbio de afirmação no início ("Claro que sim") + após verbo de ação
      // Mas cópulas (ficar/estar/ser/parecer) introduzem predicativo → Adjetivo
      const _COPULAS_CLARO = new Set(["ficou","ficava","ficara","ficavam","fica","fique","ficasse","estava","esteve","estou","estamos","estavam","esta","e","era","eram","foi","fora","fosse","parecia","parece","pareceu","continua","continuava","permanecia"]);
      POLISSEMIA["claro"] = (prev, next) => {
        if (!prev && next === "que") return "Advérbio"; // "Claro que sim"
        if (!prev && !next) return "Advérbio"; // "Claro!" isolado
        if (prev && _COPULAS_CLARO.has(prev)) return "Adjetivo"; // "ficou claro", "estava claro"
        if (prev && _verbPast.test(prev)) return "Advérbio"; // "falou claro", "viu claro"
        return "Adjetivo";
      };
      POLISSEMIA["clara"] = POLISSEMIA["claro"];
      // "fundo/funda" — lexiconEntry classifica como Verbo (de "fundar"); mas é quase sempre Subst./Adj.
      POLISSEMIA["fundo"] = (prev) => {
        const _PREPS_FUNDO = new Set(["no","ao","do","pelo","pelo","um","uma","o","a","os","as","seu","sua","desse","deste","nesse","neste","seu","sua","outro","outra","todo","qualquer"]);
        if (!prev || _PREPS_FUNDO.has(prev)) return "Substantivo";
        return "Adjetivo"; // "voz funda" → Adjetivo
      };
      POLISSEMIA["funda"] = () => "Adjetivo";
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
    // Adjetivos irregulares (sem sufixo canônico) que "muito" intensifica
    const _ADJ_IRR = new Set([
      "bom","boa","bons","boas","grande","grandes","pequeno","pequena",
      "ruim","ruins","mau","ma","maus","mas","belo","bela","feio","feia",
      "forte","fraco","fraca","novo","nova","velho","velha",
      "rico","rica","pobre","livre","triste","alegre","simples",
      "grave","breve","leve","suave","firme","justo","justa",
      "digno","digna","puro","pura","amplo","ampla","denso","densa",
      "profundo","profunda","longo","longa","cheio","cheia"
    ]);
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
      // Antes de adjetivo irregular — "muito bom", "pouco simples"
      if (_ADJ_IRR.has(normalizeWord(next))) return "Advérbio";
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

    // "acaso" — substantivo ("um acaso do destino") vs advérbio ("por acaso?")
    // Quando precedido por "por" → Advérbio; caso contrário → Substantivo
    POLISSEMIA["acaso"] = (prev) => {
      if (prev === "por") return "Advérbio";
      return "Substantivo";
    };

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

    // Gentílicos brasileiros — Adjetivo quando modifica substantivo; Substantivo após artigo
    // "escritora carioca" (prev="escritora") → Adjetivo
    // "O carioca chegou" (prev="o") → Substantivo
    const _ARTS_DEF = new Set(["o","a","os","as","um","uma","uns","umas"]);
    const _gentilicoPol = (prev) => prev && _ARTS_DEF.has(prev) ? "Substantivo" : "Adjetivo";
    const _GENTILICOS = [
      "carioca","cariocas","paulista","paulistas","paulistano","paulistana","paulistanos","paulistanas",
      "mineiro","mineira","mineiros","mineiras","gaucho","gaucha","gauchos","gauchas",
      "baiano","baiana","baianos","baianas","nordestino","nordestina","nordestinos","nordestinas",
      "pernambucano","pernambucana","fluminense","fluminenses","capixaba","capixabas",
      "paranaense","paranaenses","catarinense","catarinenses","goiano","goiana","goianos","goianas",
      "maranhense","maranhenses","cearense","cearenses","potiguar","potiguares",
      "alagoano","alagoana","sergipano","sergipana","paraibano","paraibana",
      "amazonense","amazonenses","paraense","paraenses",
      "brasiliense","brasilienses","sulista","sulistas","nortista","nortistas",
      "nordestino","nordestina","sulino","sulina"
    ];
    for (const g of _GENTILICOS) {
      POLISSEMIA[g] = _gentilicoPol;
    }
  })();

  // Nota: "jovem/pobre/velho" têm substantivação por artigo mas a janela prev/next de 2 tokens
  // não é suficiente para distinguir "o pobre chegou" (Subs.) de "uma pobre alma" (Adj.).
  // A className "Substantivo / Adjetivo" com decisao:"ambiguo" é a representação honesta.
  // Ver HIERARQUIA_GRAMATICAL.md — ambiguo é preferível a classificado falso.

  // ── Colisões diacríticas — acento distingue classe, normalizeWord remove ─────
  // "pública/publica": com acento → Adj; sem acento (3ª sg presente) → Verbo
  // "séria/seria": com acento → Adj; sem acento (imperfeito/cond.) → Verbo
  // Heurística: pronome como prev → Verbo; ausência ou substantivo/artigo → Adjetivo
  (function() {
    const _SUJPRON = new Set(["eu","tu","ele","ela","nos","eles","elas","voce","voces","isso","aquilo","a gente","me","te","se","lhe"]);
    const _COPULAS_ADJ = new Set(["ficou","ficava","ficara","ficavam","fica","fique","ficasse","estava","esteve","estou","estamos","estavam","esta","e","era","eram","foi","fora","fosse","parecia","parece","pareceu","continua","continuava","permanecia","tornava","tornou","se tornou"]);
    const _ARTS_ADJ = new Set(["o","a","os","as","um","uma","uns","umas","do","da","dos","das","ao","aos"]);

    POLISSEMIA["publica"] = function(prev) {
      if (!prev || _SUJPRON.has(prev)) return "Verbo flexionado";
      return "Adjetivo";
    };
    POLISSEMIA["publicas"] = POLISSEMIA["publica"];

    POLISSEMIA["seria"] = function(prev) {
      if (!prev || _SUJPRON.has(prev)) return "Verbo (imperfeito)";
      return "Adjetivo";
    };
    POLISSEMIA["serias"] = POLISSEMIA["seria"];

    // "preso/presa" — após cópula → Adjetivo predicativo; após artigo → Substantivo; else → ambíguo
    POLISSEMIA["preso"] = function(prev) {
      if (prev && _COPULAS_ADJ.has(prev)) return "Adjetivo";
      if (prev && _ARTS_ADJ.has(prev)) return "Substantivo";
      return "Adjetivo"; // default: modificador
    };
    POLISSEMIA["presa"] = POLISSEMIA["preso"];
    POLISSEMIA["presos"] = POLISSEMIA["preso"];
    POLISSEMIA["presas"] = POLISSEMIA["preso"];

    // "cópia/copia" — com acento → Subs. (cópia do arquivo); sem acento → Verbo (ela copia)
    POLISSEMIA["copia"] = function(prev) {
      if (!prev || _SUJPRON.has(prev)) return "Verbo flexionado";
      return "Substantivo";
    };
    POLISSEMIA["copias"] = POLISSEMIA["copia"];

    // "túnica/tunica" — sempre Substantivo; cai em Adjetivo por sufixo -ica
    POLISSEMIA["tunica"] = () => "Substantivo";
    POLISSEMIA["tunicas"] = () => "Substantivo";
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
    // POLISSEMIA ou particípio em lexiconEntry vence lexiconEntry bruto quando há texto disponível
    const _polisOverride = text && (POLISSEMIA[normalized] || lexiconEntry?.className?.startsWith("Verbo (particípio)"));
    const className = (!_polisOverride && lexiconEntry?.className)
      || (_isCliticizado ? (VERBOS_ACENTUADOS.has(_baseVerb) ? VERBOS_ACENTUADOS.get(_baseVerb)
          : /^.+(ar|er|ir|or)$/.test(normalizeWord(_baseVerb)) ? "Verbo no infinitivo" : "Verbo flexionado")
         : (text ? inferWordClassContextual(selectedWord, text) : inferWordClass(normalized, selectedWord)));

    const alternatives = (ALTERNATIVAS[normalized] || []).filter(alt => {
      const altClass = alt.split(" — ")[0];
      // Exclui alternativas idênticas ou que sejam prefixo da classe atual (ex: "Verbo" vs "Verbo (particípio)")
      return altClass !== className && !className.startsWith(altClass) && !altClass.startsWith(className);
    });

    // ── DECISAO DE CONFIANÇA ─────────────────────────────────────────────────
    // Implementa "cravar / provável / ambíguo / indeterminado" (Bechara + UD)
    // Não altera className — é metadado de confiança para a interface e corpus.
    let decisao;
    if (className.includes("/") || className.includes(" ou ")) {
      // Ambiguidade já reconhecida na className (ex: "Substantivo ou Adjetivo")
      decisao = "ambiguo";
    } else if (POLISSEMIA[normalized]) {
      // Palavra polissêmica conhecida: se havia contexto, foi resolvida (provável);
      // sem contexto, qualquer leitura é possível (ambíguo)
      decisao = text ? "provavel" : "ambiguo";
    } else if (lexiconEntry) {
      // Entrada explícita no lexicon local — fonte mais confiável disponível
      decisao = "classificado";
    } else if (!text && className === "Substantivo") {
      // Palavra desconhecida sem contexto que caiu no fallback padrão
      decisao = "indeterminado";
    } else {
      // Inferência morfológica por regra (sufixo, lista, contexto)
      decisao = "provavel";
    }

    return {
      word: normalized,
      displayWord: lexiconEntry?.label || selectedWord,
      className,
      decisao, // "classificado" | "provavel" | "ambiguo" | "indeterminado"
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

    // 7b. Preposições compostas e locucionais — PREP-EXT-01 (Bechara MGP §preposições)
    // "através/acerca" quase sempre com "de": "através do texto", "acerca disso"
    const _PREP_EXT = new Set([
      "atraves","acerca","diante","dentre","perante","mediante","conforme",
      "excetuando","incluindo"
    ]);
    if (_PREP_EXT.has(normalized)) return "Preposição";

    // 8. Advérbios terminados em -mente — ADV-02 (Cunha&Cintra cap.14)
    if (/mente$/.test(normalized) && normalized.length > 6) return "Advérbio";

    // 9. Substantivo próprio — antes de morfologia verbal (ORDEM-01 regra 4)
    if (original && /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(original) && normalized.length > 2
        && !PARTICIPIOS_IRR.has(normalized)) return "Substantivo próprio";

    // 10. Gerúndio — VERB-GER-01 (Cunha&Cintra cap.13)
    if (/(ando|endo|indo)$/.test(normalized) && normalized.length > 4) return "Verbo (gerúndio)";

    // 11. Particípios irregulares — VERB-PART-02 (prioridade sobre sufixos)
    if (PARTICIPIOS_IRR.has(normalized)) return "Verbo (particípio)";

    // 11b. Adjetivos em -ido/-ida que NÃO são particípios — ADJ-IDO-01
    // Estes terminam em -ido mas são adjetivos de qualidade, não formas verbais
    const _ADJ_IDO = new Set([
      "arido","arida","aridos","aridas","umido","umida","umidos","umidas",
      "solido","solida","solidos","solidas","liquido","liquida","liquidos","liquidas",
      "rigido","rigida","rigidos","rigidas","palido","palida","palidos","palidas",
      "valido","valida","validos","validas","invalido","invalida","invalidos","invalidas",
      "lucido","lucida","lucidos","lucidas","frigido","frigida","livido","livida",
      "timido","timida","timidos","timidas","nitido","nitida","nitidos","nitidas",
      "gelido","gelida","gelidos","gelidas","candido","candida","candidos","candidas",
      "placido","placida","hispido","hispida","rancido","rancida","rancidos","rancidas",
      "fluido","fluida","fluidos","fluidas","perfido","perfida","insipido","insipida"
    ]);
    if (_ADJ_IDO.has(normalized)) return "Adjetivo";

    // 12. Particípios regulares — VERB-PART-01
    if (/(ado|ada|ados|adas|ido|ida|idos|idas)$/.test(normalized) && normalized.length >= 4
        && !/^(cada|fiada|morada|parada|jornada|armada|fachada|estrada)$/.test(normalized))
      return "Verbo (particípio)";

    // 12b. Pretérito perfeito irregular com morfologia "-isse" — VERB-PERF-IRR-01
    // "disse" (dizer) termina em "isse" mas é pret. perfeito, não subjuntivo
    const _PERF_IRR_ISSE = new Set(["disse","disseste","dissemos","dissestes","disseram"]);
    if (_PERF_IRR_ISSE.has(normalized)) return "Verbo flexionado";

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
    if (/^.+(ar|er|ir)$/.test(normalized) && normalized.length > 3 && normalized !== "devagar") return "Verbo no infinitivo";
    // -por: compostos de "pôr" — compor/dispor/expor/impor/opor/propor/repor/transpor
    // Substantivos agentivos em -or (escritor/autor/diretor/ator…) são Substantivo — ver regra 22
    if (/por$/.test(normalized) && normalized.length > 4) return "Verbo no infinitivo";

    // 21. Adjetivos por sufixos — Cunha&Cintra cap.5
    if (/(oso|osa|vel|veis|ivo|iva|ico|ica|ino|ina)$/.test(normalized)
        && normalized.length > 4) return "Adjetivo";
    // 21b. Adjetivos comuns sem sufixo canônico — set estendido
    if (_ADJ_EXT.has(normalized)) return "Adjetivo";
    // 21c. Advérbios de lugar/posição — set estendido (não capturados por functionWords)
    if (_ADV_EXT.has(normalized)) return "Advérbio";

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
    // Comparativos irregulares em -or — ADJ-COMP-01 (antes de rule 22 que pega sufixo -or)
    // Bechara MGP §graus do adjetivo: melhor/pior/maior/menor/superior/inferior/interior/exterior
    if (_COMP_IRR.has(normalized)) return "Adjetivo";

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

  // Adjetivos comuns sem sufixo canônico — ADJ-EXT-01
  // Verificado: nenhuma forma colide com verbos_pres_reg ou formas de -ia/-ava/-era
  const _ADJ_EXT = new Set([
    // Adjetivos terminados em -az/-iz: não cobertos por rule 21
    "capaz","capazes","incapaz","incapazes","eficaz","eficazes","sagaz","sagaze","perspicaz",
    "feliz","felizes","infeliz","infelizes","audaz","audazes","voraz","vorazes","tenaz","tenaces",
    // Adjetivos terminados em -il: não cobertos por rule 21
    "fragil","frageis","util","uteis","habil","habeis","sutil","sutis","civil","civis",
    "facil","faceis","dificil","dificeis","agil","ageis","fertil","ferteis",
    // Adjetivos terminados em -orme
    "enorme","enormes","uniforme","uniformes","conforme","conformes","disforme","disformes",
    // Adjetivos comuns de qualidade
    "fraco","fraca","fracos","fracas","forte","fortes",
    "livre","livres","pobre","pobres","nobre","nobres",
    "simples","duplo","dupla","duplos","duplas",
    "breve","breves","leve","leves","grave","graves",
    "suave","suaves","firme","firmes","triste","tristes","alegre","alegres",
    "jovem","jovens","velho","velha","velhos","velhas",
    "cheio","cheia","cheios","cheias","vazio","vazia","vazios","vazias",
    "certo","certa","certos","certas","errado","errada","errados","erradas",
    "justo","justa","justos","justas","injusto","injusta",
    "lindo","linda","lindos","lindas","feio","feia","feios","feias",
    "rico","rica","ricos","ricas","humilde","humildes",
    "quieto","quieta","quietos","quietas","raro","rara","raros","raras",
    "largo","larga","largos","largas","estreito","estreita",
    "antigo","antiga","antigos","antigas","moderno","moderna",
    "curto","curta","curtos","curtas",
    "fundo","funda","fundos","fundas","raso","rasa","rasos","rasa",
    "claro","clara","claros","claras","escuro","escura","escuros","escuras",
    "pesado","pesada","leve","leves","duro","dura","duros","duras","mole","moles",
    "limpo","limpa","limpos","limpas","sujo","suja","sujos","sujas",
    // Adjetivos qualificativos frequentes em -o/-a — sem sufixo canônico
    "espesso","espessa","espessos","espessas","grosso","grossa","grossos","grossas",
    "denso","densa","densos","densas","profundo","profunda","profundos","profundas",
    "fecundo","fecunda","fecundos","fecundas","rotundo","rotunda","rotundos","rotundas",
    "longo","longa","longos","longas","redondo","redonda","redondos","redondas",
    "imundo","imunda","imundos","imundas",
    // Adjetivos em -al (ADJ-AL-01) — Cunha&Cintra §qualificativos
    // Excluídos: jornal/canal/hospital/capital/animal (substantivos com localLexicon cobrindo)
    "atual","atuais","final","finais","total","totais","fatal","fatais",
    "banal","banais","leal","leais","genial","geniais","natural","naturais",
    "cultural","culturais","nacional","nacionais","social","sociais",
    "moral","morais","formal","formais","normal","normais","oral","orais",
    "central","centrais","lateral","laterais","ancestral","ancestrais",
    "brutal","brutais","frontal","frontais","mental","mentais","vital","vitais",
    "plural","plurais","feudal","feudais","racial","raciais",
    "emocional","emocionais","racional","racionais","sensorial","sensoriais",
    "editorial","editoriais","universal","universais","original","originais",
    "habitual","habituais","virtual","virtuais","temporal","temporais",
    "global","globais","surreal","surrealistas","nocturnal","nocturnais",
    "real","reais","liberal","liberais","dual","duais","trivial","triviais",
    // Adjetivos com prefixo negativo im-/il-/ir-/in- + base em -al — ADJ-NEG-01
    "imoral","imorais","informal","informais","ilegal","ilegais","irreal","irreais",
    "irracional","irracionais","irresponsavel","irresponsaveis",
    "imaterial","imateriais","imediato","imediata","imediatos","imediatas",
    // Adjetivos qualificativos frequentes não capturados por sufixos — ADJ-BASE-02
    "amplo","ampla","amplos","amplas","digno","digna","dignos","dignas",
    "reto","reta","retos","retas","pleno","plena","plenos","plenas",
    "pronto","pronta","prontos","prontas","bruto","bruta","brutos","brutas",
    "torto","torta","tortos","tortas","vago","vaga","vagos","vagas",
    "cru","crua","crus","cruas","nu","nua","nus","nuas",
    "apto","apta","aptos","aptas","inato","inata","inatos","inatas",
    "agudo","aguda","agudos","agudas","obtuso","obtusa","obtusas",
    "terno","terna","ternos","ternas","puro","pura","puros","puras",
    "casto","casta","castos","castas","severo","severa","severos","severas",
    "sereno","serena","serenos","serenas","grato","grata","gratos","gratas",
    "pio","pia","pios","pias","lento","lenta","lentos","lentas",
    // Adjetivos em -nte sem sufixo produtivo (agentes em -nte cobertos por localLexicon) — ADJ-NTE-01
    "brilhante","brilhantes","marcante","marcantes","relevante","relevantes",
    "urgente","urgentes","inocente","inocentes","suficiente","suficientes",
    "eloquente","eloquentes","contundente","contundentes","recorrente","recorrentes",
    "evidente","evidentes","permanente","permanentes","temporario","temporaria",
    "abundante","abundantes","constante","constantes","distante","distantes",
    "dominante","dominantes","semelhante","semelhantes","diferente","diferentes",
    "eficiente","eficientes","inteligente","inteligentes","inconsciente","inconscientes",
    "consciente","conscientes","conveniente","convenientes","independente","independentes",
    "interessante","interessantes","importante","importantes","imperante","imperantes",
    "predominante","predominantes","significante","significantes","tolerante","tolerantes",
    "exorbitante","exorbitantes","extravagante","extravagantes","elegante","elegantes",
    // Adjetivos de personagem — ADJ-CARAC-01
    "covarde","covardes","valente","valentes","generoso","generosa","generosos","generosas",
    "mesquinho","mesquinha","mesquinhos","mesquinhas","teimoso","teimosa","teimosos","teimosas",
    "ansioso","ansiosa","ansiosos","ansiosas","orgulhoso","orgulhosa","orgulhosos","orgulhosas",
    "saudoso","saudosa","saudosos","saudosas","ciumento","ciumenta","ciumentos","ciumentas",
    "medroso","medrosa","medrosos","medrosas","ambicioso","ambiciosa","ambiciosos","ambiciosas",
    "arrogante","arrogantes","humildes","paciente","pacientes","impaciente","impacientes",
    "elegante","elegantes","grosseiro","grosseira","grosseiros","grosseiras",
    "corajoso","corajosa","corajosos","corajosas","cauteloso","cautelosa",
    "temeroso","temerosa","audacioso","audaciosa","audaciosos","audaciosas",
    // Particípios irregulares usados como adjetivos — ADJ-PART-IRR-01
    "satisfeito","satisfeita","satisfeitos","satisfeitas",
    "confuso","confusa","confusos","confusas",
    "incluso","inclusa","inclusos","inclusas","excluso","exclusa",
    "difuso","difusa","difusos","difusas","infuso","infusa",
    "corrupto","corrupta","corruptos","corruptas",
    "aceso","acesa","acesos","acesas",
    "preso","presa","presos","presas",
    "solto","solta","soltos","soltas",
    "morto","morta","mortos","mortas",
    "posto","posta","postos","postas",
    "feito","feita","feitos","feitas",
    "visto","vista","vistos","vistas",
    "vindo","vinda","vindos","vindas",
    "perdido","perdida","perdidos","perdidas",
    "escondido","escondida","escondidos","escondidas",
    // Adjetivos em -eto/-eta (não cobertos por rule 21)
    "quieto","quieta","quietos","quietas","inquieto","inquieta",
    "concreto","concreta","concretos","concretas","abstrato","abstrata",
    "discreto","discreta","discretos","discretas","indiscreto","indiscreta",
    "completo","completa","completos","completas","incompleto","incompleta",
    "secreto","secreta","secretos","secretas",
    // Adjetivos em -undo/-unda
    "iracundo","iracunda","fecundo","fecunda","rubicundo","rubicunda",
    "moribundo","moribunda","errabundo","errabunda",
    // Adjetivos de cor e aparência física
    "rubio","rubia","loiro","loira","loiros","loiras",
    "moreno","morena","morenos","morenas","bronzeado","bronzeada",
    "palido","palida","palidos","palidas","roseo","rosea"
  ]);

  // Advérbios de posição/lugar não presentes em functionWords.adverbios — ADV-EXT-01
  const _ADV_EXT = new Set([
    "embaixo","encima","atras","adiante","alem","aquem",
    "jah","eis","cedo","tarde","depressa","devagar","juntos","sozinho","sozinha",
    "repentinamente","subitamente","imediatamente","anteriormente","posteriormente",
    "brevemente","finalmente","certamente","provavelmente","possivelmente",
    "novamente","recentemente","atualmente","frequentemente","raramente",
    "facilmente","dificilmente","rapidamente","lentamente","fortemente",
    "claramente","profundamente","completamente","simplesmente",
    "simplesmente","especialmente","principalmente","geralmente",
    "inclusive","exclusive","exceto","salvo","tampouco","outrossim",
    "demais","ademais","portanto","afinal","alias","enfim","entao"
  ]);

  // Comparativos irregulares — ADJ-COMP-01 (Bechara MGP §graus do adjetivo)
  const _COMP_IRR = new Set([
    "melhor","melhores","pior","piores",
    "maior","maiores","menor","menores",
    "superior","superiores","inferior","inferiores",
    "interior","interiores","exterior","exteriores",
    "anterior","anteriores","posterior","posteriores",
    "ulterior","ulteriores","supremo","suprema","infimo","infima",
    "otimo","otima","otimos","otimas","pessimo","pessima","pessimos","pessimas"
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
    "prologo":      "Texto antes do início da narrativa principal, que situa o leitor antes da ação começar. Pode estar fora do tempo da história (narrador futuro) ou estabelecer contexto, tom e contrato de leitura. Diferente de prefácio: o prólogo já faz parte da ficção.",
    "monologo":     "Fala de uma personagem consigo mesma ou para o leitor, sem interlocutor aparente. No teatro, é convenção que o público ouve o que outros personagens não ouvem. Na ficção, funciona como mergulho na consciência — mais profundo que o diálogo.",
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

    // Gêneros literários fundamentais — v830
    "conto":        "Narrativa breve, de tensão unitária. Tem começo, meio e fim — mas cada palavra carrega peso duplo. O conto não tolera gordura. Tchekhov: se há um rifle na parede no primeiro ato, ele deve disparar.",
    "novela":       "Narrativa de extensão intermediária entre o conto e o romance. Foco em situação ou personagem central, com curva dramática desenvolvida, mas sem a amplitude de subtramas do romance. Gênero vivo no Brasil.",
    "romance":      "Narrativa longa em prosa, com múltiplos personagens e tramas. Permite tempo, contradição, amadurecimento. O romance pode conter um mundo: é o único gênero que precisa de todo o espaço que ocupa.",
    "poesia":       "Linguagem que explora o ritmo, a imagem e a compressão do sentido. Não é sinônimo de verso: poesia pode existir em prosa. O que define a poesia é a atenção ao impossível — dizer o que a prosa não alcança.",
    "poema":        "Unidade de poesia: um texto poético específico, com extensão e forma próprias. Um poema pode ter um verso ou centenas; pode rimar ou não; pode narrar ou apenas soar. O poema é o que acontece quando a língua se dobra sobre si mesma.",
    "lirismo":      "A qualidade poética da escrita que evoca emoção, subjetividade, musicalidade. Na prosa, o lirismo é risco: pode encantar ou afundar. Clarice, Rosa, Hilda Hilst — lirismo que não adorna, que constitui.",
    "fabula":       "Narrativa breve com personagens animais ou alegóricos e moral explícita. Esopo, La Fontaine, Monteiro Lobato. Na escrita contemporânea, a fábula é revisitada com ironia — a moral não é mais simples.",
    "tragedia":     "Gênero dramático que conduz o protagonista à ruína por uma falha (hártia/hamártia). Aristóteles: catarse pelo terror e pela piedade. Na ficção contemporânea, a tragédia se mistura ao cotidiano — não há mais coturno.",
    "comedia":      "Gênero dramático de tom leve, com situações engraçadas, mal-entendidos e desfecho feliz ou neutro. Mas a melhor comédia toca no amargo: rir do que não conseguimos resolver. Machado de Assis sabia disso.",
    "drama":        "1. Gênero teatral que mistura elementos trágicos e cômicos. 2. Na ficção em geral: conflito emocional intenso. 'Tem muito drama' descreve excesso — mas sem drama, não há narrativa.",
    "epico":        "Referente ao épico: narrativa de grandes proporções, ações heroicas, alcance coletivo. Homero, Camões, mas também romances que viram saga de um povo. No Brasil, o épico tem raízes indígenas, africanas e ibéricas.",

    // Termos semânticos para escritores — v830
    "denotacao":    "O sentido literal e direto de uma palavra — o que o dicionário lista primeiro. 'Rosa' = planta com flor. Na ficção, a denotação é o ponto de partida; a conotação é onde a escrita vive.",
    "conotacao":    "Os sentidos secundários, afetivos, culturais ou históricos que uma palavra carrega além do literal. 'Rosa' = amor, fragilidade, feminino em alguns contextos. A conotação varia com o leitor e a época.",
    "polissemia":   "Propriedade de uma palavra ter múltiplos sentidos relacionados. 'Manga' = fruta ou parte da roupa. Diferente de homonímia (palavras sem relação). O bom escritor usa a polissemia — e sabe quando ela atrapalha.",
    "campo":        "Campo semântico: conjunto de palavras de sentido relacionado. O campo do 'mar' inclui onda, maré, abismo, sal, horizonte. Trabalhar dentro de um campo cria coesão; sair dele cria contraste.",

    // Tipos textuais — v830
    "narracao":     "Modalidade de texto que conta eventos em sequência temporal. O texto narrativo tem narrador, personagens, enredo, tempo e espaço. A narração é a forma mais antiga de texto — é anterior à escrita.",
    "descricao":    "Modalidade de texto que apresenta um objeto, lugar, pessoa ou estado. Na ficção, a descrição não é pausa — é revelação: o que se descreve diz o que importa ao narrador.",
    "dissertacao":  "Texto que desenvolve uma argumentação em torno de uma tese. Estrutura clássica: tese, argumentos, conclusão. Na escrita literária, a dissertação aparece disfarçada — no ensaio, na crônica de opinião.",
    "ensaio":       "Texto que pensa em voz alta, sem conclusão definitiva. Montaigne inventou; no Brasil, Sérgio Buarque de Holanda, Darcy Ribeiro, Silviano Santiago o praticam. O ensaio é o único gênero que se permite errar.",

    // Técnicas narrativas e craft — v833
    "inmedias":     "In media res: técnica de começar a narrativa no meio da ação, sem prólogo. O leitor é lançado dentro do mundo já em movimento. Uma das entradas mais eficazes para ficção.",
    "flashback":    "Retorno ao passado dentro da narrativa. Pode ser cena completa ou fragmento de memória. Risco: interromper o ritmo; benefício: criar profundidade temporal e emocional.",
    "flashforward": "Salto ao futuro dentro da narrativa — personagem ou narrador antecipa o que virá. Cria expectativa, ironia ou senso de inevitabilidade. Menos comum que o flashback, mais arriscado.",
    "prolepse":     "Antevisão de eventos futuros dentro da narrativa — o equivalente literário do flashforward. Gera suspense ou ironia trágica: 'Naquela noite foi a última vez que a viu.'",
    "analepse":     "Retorno narrativo ao passado — o equivalente literário do flashback. Pode ser completa (cena em tempo real) ou sumária (resumo do que aconteceu antes).",
    "cronotopo":    "Conceito de Bakhtin: a interconexão entre tempo e espaço na narrativa. O tempo de uma narrativa não existe sem o espaço — e vice-versa. A estrada, o salão, a fronteira são cronotopos.",
    "incipit":      "As primeiras palavras de uma obra — o começo que define o tom, o ritmo e o pacto com o leitor. 'Chama-me Ishmael.' (Melville). Um bom incipit é um contrato: aqui começa o mundo.",
    "desfecho":     "A resolução ou a conclusão da narrativa — o que acontece depois do clímax. Pode ser fechado (tudo resolvido) ou aberto (ambíguo). Desfechos abertos exigem que o texto os justifique.",
    "nos":          "Em dramatologia, o nó da ação: o ponto de máximo entrelaçamento do conflito, antes da resolução. Também chamado de 'complicação'. O escritor precisa saber onde o nó está antes de desatá-lo.",
    "conflito":     "A tensão central que move a narrativa — entre personagem e personagem, personagem e mundo, personagem e si mesmo. Sem conflito, não há história. A escolha do tipo de conflito define o gênero.",
    "enredo":       "A sequência organizada de eventos de uma narrativa. Diferente de 'história' (tudo que aconteceu): o enredo é o que o texto escolhe mostrar, na ordem em que escolhe mostrar.",

    // Técnicas poéticas — v833
    "ode":          "Poema lírico de extensão variável, de tom elevado, dedicado a uma pessoa, ideia ou objeto. No Brasil, a ode ganhou tons irônicos em Drummond: a ode ao bonde, à pedra, à vida.",
    "elegia":       "Poema de lamento — pela morte, pela perda, pelo fim de algo. Tom de saudade e tristeza contida. A elegia pede rigor: exagero vira lamento; contenção vira beleza.",
    "balada":       "Forma poética narrativa, com refrão — vinda da tradição oral. No Brasil, confunde-se com a canção. A balada conta uma história enquanto soa.",
    "ode2":         "Ode, elegia e balada são formas canônicas da tradição lírica ocidental, mas no Brasil foram retrabalhadas com ironia, coloquialidade e sotaque local.",
    "haiku":        "Forma poética japonesa de 17 sílabas — 5-7-5. Busca o instante, a imagem, o silêncio ao redor. No Brasil, o haiku ganhou espaço na Semana de Arte Moderna e nas práticas de escrita contemporânea.",

    // Figuras de som — v833
    "assonancia":   "Repetição de sons vocálicos semelhantes em palavras próximas. 'Amor sabe o amor.' A assonância cria música sem rima — é o tecido sonoro da prosa poética.",
    "consonancia":  "Repetição de sons consonantais em palavras próximas — diferente da aliteração (início) e da assonância (vogais). Cria coesão sonora discreta.",
    "paronomasia":  "Aproximação de palavras sonoramente parecidas mas de sentido diferente. 'Viver e escrever são quase o mesmo sofrimento.' Jogo fonético que carrega significado.",
    "onomatopeia":  "Palavra que imita o som de algo. 'Tic-tac', 'toc-toc', 'zum'. Na literatura brasileira, a onomatopeia é recurso oral poderoso — especialmente no cordel e na poesia concreta.",

    // Verbos expressivos — v835
    "sussurrar":    "Falar em voz muito baixa, quase sem som. Na cena, o sussurro cria intimidade ou segredo — coloca o leitor perto demais para se sentir confortável. O oposto do grito.",
    "murmurar":     "Produzir som suave, quase inaudível — seja a voz, o vento, a água. Na prosa, murmurar indica algo que não se quer dizer completamente. A voz que murmurou carrega o que não pôde ser dito.",
    "gritar":       "Elevar a voz ao máximo — de raiva, medo, alegria ou desespero. O grito é raro numa boa narrativa; exatamente por isso, quando aparece, precisa ser merecido.",
    "contemplar":   "Olhar de modo demorado, atento e silencioso. Na narrativa, a contemplação é pausa que acumula — o personagem que contempla vai mudar de posição interna ao final do olhar.",
    "susspirar":    "Exalar ar lentamente, expressando emoção — alívio, tristeza, desejo, resignação. O suspiro é gesto de transição emocional: o que vem depois já é diferente do que veio antes.",
    "aguardar":     "Esperar com atenção ao que está por vir — com uma qualidade de vigilância que 'esperar' não tem. Quem aguarda já sabe que algo vai acontecer. A diferença entre esperar e aguardar é o quanto a personagem sabe.",
    "ansiar":       "Desejar com força e impaciência — a mistura de querer e temer ao mesmo tempo. Ansiar carrega urgência física. É diferente de querer: tem o corpo junto.",
    "contemplar2":  "Contemplar é diferente de olhar: é processar enquanto se vê. Uma personagem que contempla não está passiva — está trabalhando por dentro.",
    "observar":     "Acompanhar com atenção e distância — com a intenção de entender o que se vê. O narrador que observa não participa; o personagem que observa está aprendendo algo sobre o mundo.",
    "sentir":       "Ter acesso a algo pela experiência direta — emoção, sensação física, intuição. Na ficção, 'sentir' vira fraqueza quando não é corporificado: 'ela sentiu medo' não é cena; 'o estômago virou' é.",

    // Adjetivos de estilo literário — v835
    "laconico":     "De poucas palavras — mas densas. Um personagem lacônico revela muito no que não diz. Um texto lacônico obriga o leitor a trabalhar. 'Uma boa frase é aquela que não pode ser mais curta.'",
    "prolixo":      "Que se estende além do necessário — palavras demais para o que precisa ser dito. A prolixidade esconde insegurança ou preguiça de editar. O oposto do lacônico.",
    "eloquente":    "Que se exprime com facilidade, clareza e poder persuasivo. Na ficção, um personagem eloquente tem autoridade no discurso — mas eloquência demais pode soar artificial.",
    "incisivo":     "Que vai direto ao ponto, com precisão cortante. Um estilo incisivo não desperdiça palavra — cada frase avança. O incisivo é parente do lacônico, mas com borda afiada.",
    "ambiguo":      "Que pode ser entendido de mais de um modo. A ambiguidade pode ser fraqueza (imprecisão) ou virtude (riqueza semântica). Na literatura, o melhor da ambiguidade é quando o leitor não sabe qual leitura é 'correta'.",
    "enigmatico":   "Que resiste a uma interpretação única — obscuro de modo que convida à decifração. Diferente do ambíguo: o enigmático promete uma resposta escondida. Kafka é enigmático; Machado é ambíguo.",
    "vigoroso":     "Que tem força, energia, presença. Um estilo vigoroso soa como alguém que sabe o que quer dizer — e diz sem pedir permissão. Vigor não é barulho: é precisão com energia.",
    "contundente":  "Que impacta com força direta — dói onde bate. Uma frase contundente não deixa espaço para desviar. No jornalismo literário, a contundência é a virtude central.",
    "sutil":        "Que age de modo delicado, quase imperceptível, mas eficaz. O sutil não anuncia — vai ficando. A ironia de Machado é sutil: leva parágrafos para doer.",
    "denso2":       "Diz-se de um texto que concentra muita informação, sensação ou significado em pouco espaço. Densidade é virtude quando equilibrada com clareza.",

    // Termos de análise literária — v835
    "verossimil":   "Que parece verdadeiro dentro do universo que o texto cria. A verossimilhança não é a verdade histórica — é o pacto interno da ficção. Um dragão pode ser verossímil se o mundo do texto o justifica.",
    "plausivel":    "Que pode ser aceito como possível dentro de uma lógica razoável. Diferente de verossímil (que depende do mundo interno do texto): o plausível é medido pelo mundo do leitor.",
    "coerente":     "Que se mantém consistente consigo mesmo — interno ao texto, às personagens, ao estilo. A incoerência narrativa é o maior risco da ficção longa: o personagem que age diferente sem motivo.",
    "universal":    "Que ressoa além de um contexto particular — que toca o que é humano em qualquer cultura ou época. O paradoxo: os textos mais universais são frequentemente os mais específicos em lugar, tempo e voz.",
    "singular":     "Que não se parece com nenhum outro — único na voz, na forma ou na visão. A singularidade é o que separa um livro de uma boa execução de fórmula.",

    // Pontuação para escritores — v838
    "reticencias":  "Os três pontos (...) que indicam suspensão, hesitação ou omissão. Na ficção, as reticências criam o que não é dito — e o que não é dito frequentemente é mais pesado do que o que é. Usar com economia.",
    "travessao":    "O traço longo (—) que introduz fala de personagem, aposto explicativo ou ruptura de pensamento. Na prosa brasileira, o travessão é marca de estilo — Guimarães Rosa o transformou em respiração.",
    "virgula":      "A pausa breve que organiza o fluxo da frase — separa elementos, cria ritmo, muda sentido. 'Vamos comer, João' vs. 'Vamos comer João.' A vírgula salva vidas (e personagens).",
    "ponto":        "O fim de uma frase — e do que ela contém. Na prosa, o ponto não é apenas gramática: é decisão de ritmo. Frases curtas, muitos pontos, respiração rápida. Frases longas, leitura que acumula.",
    "interrogacao": "Sinal que transforma afirmação em pergunta — e que, na ficção, pode ser a pergunta que o personagem não consegue formular em voz alta. A pergunta retórica também merece ponto de interrogação.",
    "exclamacao":   "Sinal de ênfase, espanto ou grito. Na prosa, o ponto de exclamação deve ser raro — o próprio texto deve carregar a intensidade, não o sinal. Quando aparece muito, perde força.",
    "parentese":    "Elemento entre parênteses — uma voz lateral, um detalhe, uma digressão que o autor inclui mas que o texto principal não acomodaria. Na ficção, parentéticos criam intimidade com o leitor.",
    "aspas":        "Marcam citação, ironia ou uso especial de uma palavra. As aspas de ironia ('ela foi muito 'útil'') revelam o ponto de vista do narrador sem precisar dizê-lo.",
    "semicolon":    "O ponto e vírgula — mais do que uma vírgula, menos do que um ponto. Conecta ideias relacionadas com pausa maior. Na prosa, revela cuidado com o ritmo — quem usa ponto e vírgula bem, pensa em frases.",

    // Oficina de escrita — v838
    "rascunho":     "A primeira versão de um texto — sem compromisso com a forma definitiva. O rascunho é permissão: você pode escrever mal, desistir do parágrafo, contradizer-se. O rascunho existe para ser superado.",
    "feedback":     "Em oficinas literárias: o retorno de leitores sobre um texto. Diferente de crítica: o feedback bem dado ajuda o escritor a ver o que o texto faz (ou não faz) no leitor. Não é aprovação — é informação.",
    "leitura":      "O ato de receber o texto. Na oficina literária, leitura em voz alta revela o que a leitura silenciosa esconde: ritmo, respiração, onde o texto tropeça. O escritor que não leu o próprio texto em voz alta não terminou.",
    "releitura":    "Ler de novo — com distância, outro ângulo ou outra questão. A releitura é a principal ferramenta de revisão: o que o escritor não vê na primeira vez, a releitura entrega.",
    "revisao":      "O trabalho de melhorar o texto depois do rascunho — cortar, reorganizar, clarear, aprofundar. A revisão é onde a maior parte da escrita acontece. Hemingway: 'O primeiro rascunho de qualquer coisa é uma merda.'",

    // Estados emocionais adicionais — v838
    "esperanca":    "A expectativa de que algo melhor vai acontecer — mesmo sem garantia. Na ficção brasileira, a esperança é frequentemente irônica: o personagem que espera é o que o narrador protege ou abandona.",
    "resignacao":   "A aceitação de algo inevitável — sem concordar, mas sem mais lutar. Na narrativa, a resignação pode ser ponto final ou armadilha. Distinção importante: resignação ainda carrega o desejo; desesperança o esqueceu.",
    "serenidade":   "Estado de calma estável, interior. A serenidade é rara na ficção de conflito — mas quando aparece, é ponto de virada. A personagem serena no caos é a mais assustadora ou a mais sábia.",
    "euforia":      "Alegria intensa, explosiva — o oposto da melancolia. Na ficção, a euforia é perigosa: ela precede a queda, ou revela que a personagem não sabe o que está por vir.",
    "desesperanca": "A ausência de esperança — não a tristeza, mas o lugar além dela. É estado permanente, não passageiro. A desesperança em Beckett é poética; nas letras de cordel, é combatida com humor.",

    // Emoções complexas — v839
    "ciume":        "Medo de perder algo ou alguém para outro — mistura de amor, insegurança e raiva. Na ficção, o ciúme é motor narrativo clássico; o risco é virar clichê. A personagem que sente ciúme está admitindo que precisa do outro.",
    "cobica":       "Desejo intenso pelo que pertence a outro — não só inveja, mas impulso de ter. A cobiça move personagens históricos, vilões e heróis comuns que encontram uma oportunidade. É irmã próxima da ambição.",
    "orgulho":      "Satisfação com si mesmo ou com o próprio grupo — pode ser virtude (amor-próprio saudável) ou falha (soberba). Na ficção, o orgulho que precede a queda é arco clássico. Mas o orgulho que sustenta o personagem é outro animal.",
    "vaidade":      "Preocupação excessiva com a própria imagem. Diferente do orgulho: a vaidade precisa da aprovação do outro; o orgulho não. A personagem vaidosa é vulnerável ao olhar externo.",
    "compaixao":    "Sentir junto com o sofrimento do outro — ir ao encontro da dor sem precisar resolvê-la. A compaixão na ficção não é fraqueza: é o que faz um personagem parar, quando todos correm. Diferente de pena.",
    "empatia":      "Capacidade de entender a perspectiva do outro, mesmo sem compartilhar a experiência. Na narrativa em primeira pessoa, a empatia do narrador define o quanto o leitor entende os outros personagens.",
    "solidao":      "Estado de estar só — não como fato, mas como sentimento. A solidão de um personagem em multidão é mais densa do que a solidão física. Na literatura brasileira, a solidão é tema central: Lima Barreto, Clarice, Carolina Maria de Jesus.",
    "saudade":      "A palavra portuguesa sem equivalente perfeito em nenhuma outra língua: presença dolorosa do ausente. Na literatura brasileira, saudade não é apenas nostalgia — é um modo de relação com o tempo, com o lugar, com a morte.",

    // Processo criativo — v839
    "bloqueio":     "O momento em que o escritor não consegue avançar no texto. Pode ser medo de errar, falta de direção, excesso de autocrítica. Não é a ausência de palavras — é a recusa de escrever as palavras que estão lá.",
    "fluxo":        "Estado de absorção completa na escrita — quando o tempo some e o texto sai sem esforço consciente. Csikszentmihalyi descreveu o 'flow'. Na oficina, aprender a criar as condições do fluxo é mais útil do que esperar por inspiração.",
    "inspiracao":   "O impulso que inicia ou transforma o texto — uma imagem, uma frase, um encontro. A inspiração existe, mas não é confiável. Escrever por disciplina, não por inspiração: a inspiração aparece quando você já está escrevendo.",
    "disciplina":   "A prática regular de escrever, independente do estado emocional ou da inspiração. Rotina de escrita não é mecânica — é respeito pelo texto. A disciplina protege o escritor de si mesmo.",
    "rotina":       "A sequência de hábitos que prepara o escritor para escrever — horário, lugar, ritual. A rotina de escrita não garante bons textos, mas garante que o texto existe. Sem rotina, o texto espera por condições perfeitas que nunca chegam.",
    "silencio2":    "O silêncio no processo de escrita — o momento antes das palavras, a pausa entre as frases, a releitura sem caneta. O silêncio não é ausência de trabalho. É o trabalho que não aparece no manuscrito.",
    "procrastinar": "Adiar o texto por fazer outras coisas — algumas úteis, a maioria não. A procrastinação é frequentemente medo disfarçado de preguiça. O escritor que procrastina geralmente sabe exatamente o que precisa escrever — e exatamente por que não quer.",
    "rasura":       "A marca da revisão — riscado, apagado, substituído. A rasura é evidência de trabalho vivo. Nos manuscritos de Machado, as rasuras mostram o escritor pensando — não errando. Guardar as rasuras é guardar o processo.",

    // Experiência humana — v840
    "trauma":       "Ferida psíquica profunda que reorganiza a percepção de si e do mundo. Na ficção brasileira, o trauma histórico (escravidão, ditadura, genocídio) se mistura ao trauma individual — raramente é apenas pessoal.",
    "memoria":      "A capacidade de reter e acessar o passado — sempre seletiva, sempre reescrita no presente. Proust soube disso: a memória não é arquivo, é invenção. A memória de uma personagem é política.",
    "identidade":   "Quem se é — construído por cultura, história, corpo, língua e relações. Na narrativa brasileira, a identidade é sempre múltipla e contraditória: nordestino e urbano, negro e brasileiro, mulher e escritora.",
    "alteridade":   "O reconhecimento do outro como diferente — e legítimo. Na ficção, a alteridade é o que impede que todos os personagens pensem como o narrador. Sem alteridade, a ficção é monólogo disfarçado.",
    "pertencimento":"Sensação de fazer parte — de um lugar, grupo, língua ou história. Na literatura brasileira, pertencimento e exclusão andam juntos: quem narra decide quem existe.",
    "exilio":       "O afastamento forçado ou voluntário do lugar de origem — geográfico, cultural ou linguístico. Na tradição literária brasileira, o exílio aparece no corpo dos que foram escravizados, nos retirantes, nos imigrantes.",

    // Oralidade e escrita — v840
    "oralidade":    "A cultura e a linguagem do que é falado — não transcrito. No Brasil, a oralidade carrega saberes que a escrita não fixou. Na ficção, respeitar a oralidade é não transformar a fala do personagem em texto limpo sem razão.",
    "letramento":   "A capacidade de usar a escrita como prática social — não apenas ler tecnicamente, mas participar da cultura escrita. O letramento é político: quem escreve define o que existe.",
    "dicao":        "O conjunto de escolhas de linguagem que definem o estilo: vocabulário, sintaxe, ritmo, registro. A dicção de um escritor é o que o identifica antes mesmo do conteúdo. Machado tem dicção. Clarice tem dicção.",

    // Conceitos de estética — v840
    "beleza":       "No texto literário: não ornamento, mas adequação — a beleza de uma frase está em fazer exatamente o que precisa ser feito, sem sobra. A beleza literária frequentemente vem do que foi tirado, não do que foi acrescentado.",
    "sublime":      "Categoria estética que designa o que excede a capacidade humana de conter — o incomensurável, o avassalador. Na ficção brasileira, o sublime aparece na paisagem do cerrado, no sertão, no Amazonas — e no desamparo humano.",
    "grotesco":     "O que mistura o ridículo com o terrível, o humano com o bestial, o belo com o repugnante. Na literatura brasileira, o grotesco é recurso crítico — Graciliano Ramos, João Guimarães Rosa, Rubem Fonseca.",
    "ironia":       "Dizer o oposto do que se pensa — ou mostrar a distância entre o que parece e o que é. A ironia de Machado de Assis é estrutural: não é a frase que ironiza, é o narrador inteiro.",
    "humor":        "O riso que emerge de incongruência, surpresa ou reconhecimento. Na ficção, o humor não é decoração: é modo de conhecimento. Quem ri de uma personagem também a entende — às vezes melhor do que quem chora.",

    // Adjetivos de paisagem/atmosfera — v852
    "arido":        "Seco ao extremo, sem umidade ou vegetação. No texto literário, o árido não é só paisagem — é estado de espírito, de vida, de silêncio. O sertão de Guimarães Rosa é árido; a mente de certos personagens também.",
    "umido":        "Que contém umidade — névoa, orvalho, suor de medo, cheiro de terra molhada. Adjetivo de atmosfera: o úmido cria sensação antes de criar imagem. Florestas, caves, mangues, porões — o úmido tem presença física.",
    "rigido":       "Sem dobrar, sem ceder. No sentido concreto: o metal, o gelo, o corpo morto. No sentido abstrato: a disciplina, o caráter, a lei. O personagem rígido não é necessariamente mau — é inflexível, e isso pode ser virtude ou tragédia.",
    "timido":       "Que recua por insegurança ou medo do julgamento alheio. A timidez em personagens pode ser falsa humildade, profundidade não revelada ou simplesmente timidez — o texto deve mostrar qual. Diferente de introvertido.",
    "nitido":       "Com contornos claros, sem ambiguidade visual ou semântica. A cena nítida é a que o leitor vê. O personagem nítido é o que o leitor entende. A prosa nítida sabe o que quer dizer — e diz.",
    "solido":       "Com consistência e estabilidade. No texto: o argumento sólido não treme; a personagem sólida não vira caricatura; a prosa sólida carrega o peso do que conta. Sólido é o oposto de frágil, de vago, de oco.",

    // Adjetivos de personagem — v852
    "arrogante":    "Que se crê acima dos outros — e o demonstra. Na ficção, a arrogância é arco clássico: o personagem arrogante precisa aprender a se ver. Mas nem todo arrogante cede: alguns caem sem mudar, e essa tragédia também é literatura.",
    "covarde":      "Que evita o confronto por medo — não pela prudência, mas pelo pavor. Na ficção, a covardia é mais interessante do que a maldade: o covarde sabe o que deveria fazer, e não faz. Essa consciência é a sua punição.",
    "valente":      "Que age apesar do medo. A valentia não é ausência de medo — é ação mesmo com ele. O personagem valente não é invulnerável: é o que avança quando todo o resto recua. Diferente de audacioso, que ignora o risco.",
    "mesquinho":    "Pequeno de espírito — não de posses, mas de visão. O mesquinho vê o mundo em termos de perda e ganho pessoal imediato. Na ficção, é antagonista ideal: não tem grandeza nem tragédia, apenas estreiteza.",
    "brilhante":    "Que ilumina — no sentido intelectual, artístico ou moral. O brilhante é raro: não é apenas competente, mas inventivo, reluzente, que surpreende. Na ficção, brilhante sem falha é caricatura; com uma rachadura, é personagem.",

    // Adjetivos abstratos — v852
    "atual":        "Que pertence ao tempo presente. Em análise literária: o 'atual' de um texto é o que ainda fala ao leitor de hoje, além da época em que foi escrito. A grande ficção é sempre atual — porque toca algo que não muda.",
    "final":        "Que marca o encerramento, o último momento. O 'final' de uma narrativa é o que o leitor carrega — a última impressão, o que sobra. Um final fraco arruína o que veio antes; um final certo revela o que veio antes.",
    "fatal":        "Que leva à morte ou ao desastre inevitável. Na tragédia, o 'fatal' é o erro que a personagem não poderia evitar — ou que poderia, mas não evitou. O adjetivo fatal impõe peso à cena antes de qualquer ação.",
    "imoral":       "Que contraria os valores morais do contexto em que aparece. Na ficção, o imoral não é sempre o vilão: pode ser o herói cujos valores chocam os da sociedade em que vive. Imoralidade depende de ponto de vista — e a literatura sabe disso.",
    "irreal":       "Que não corresponde à realidade — mas pode ser mais verdadeiro do que ela. O irreal na ficção literária não é escapismo: é acesso a camadas que o real não permite. Kafka, Borges, o realismo mágico: o irreal como método de verdade.",

    // Verbos de sensação física e emoção expressiva — v854
    "estremecer":   "Vibrar subitamente — de frio, de susto, de pressentimento. Em prosa, 'estremecer' é mais preciso do que 'tremer': o estremecimento é involuntário, pontual, quase incontrolável. Revela o que a personagem não quer revelar.",
    "palpitar":     "Bater com força e urgência — o coração, a esperança, o medo antecipado. 'O coração palpitou' é clichê; 'o coração palpitou antes mesmo de ela abrir a porta' é cena. O verbo carrega o tempo do sentimento.",
    "sufocar":      "Perder o ar — de emoção, de claustrofobia, de excesso de silêncio. Na narrativa, 'sufocar' é metáfora que o leitor sente no peito. Personagens que sufocam estão num ambiente que as diminui: relação, lugar, silêncio forçado.",
    "ofegar":       "Respirar em curtos solaços — depois de correr, de chorar, de assustarse. Em prosa, o personagem que ofega torna o leitor consciente do próprio ritmo respiratório. É técnica de imersão: escrever ofego gera ofego.",
    "solucar":      "Choro que se parte — o soluço interrompe a voz, corta a fala, revela que a emoção é maior do que a contenção. Na ficção, solucar é detalhe físico que ancora a cena emocional sem precisar nomear o sentimento.",

    // Substantivos de ausência e tempo — v854
    "lacuna":       "O vazio que faz sentido. Na teoria literária, a lacuna é o que o texto não diz e o leitor preenche — com experiência, medo, desejo. Toda história tem lacunas deliberadas; o escritor escolhe o que ocultar tanto quanto o que mostrar.",
    "falta":        "O que não está — mas age sobre tudo que está. Em narrativa, a 'falta' é motor: o pai ausente, a palavra não dita, o amor que partiu. O que falta a uma personagem define quem ela é e o que vai fazer para preencher ou negar esse vazio.",
    "duracao":      "O tempo como experiência, não como calendário. A duração é o quanto algo parece demorar: cinco minutos de espera angustiante podem durar páginas; cinco anos de paz cabem em um parágrafo. A arte de narrar é a arte de controlar a duração.",
    "inimizade":    "Oposição organizada no tempo. A inimizade não é impulso momentâneo — tem história, razão, forma própria. Na ficção, o par de inimigos é tão importante quanto o par de amantes: define o que ambos são, e o que seriam sem o outro.",
    "cansaco":      "Exaustão que vai além do corpo. O cansaço literário é acúmulo — de traições, de luta, de esperança frustrada. Uma personagem cansada não dorme e fica bem: ela muda, desiste ou finalmente rompe. O cansaço é ponto de virada.",

    // Adjetivos de personagem — definições literárias — v871
    "altivo":       "Que não se dobra — mantém a postura mesmo quando o custo é alto. Na ficção, o altivo recusa o que rebaixa, e isso o isola. A altivez pode ser dignidade ou orgulho — o leitor decide, dependendo do que o personagem sacrificou.",
    "soberbo":      "Que se crê acima de tudo e age como se a realidade devesse curvar-se a ele. Na narrativa, a soberba é arco clássico: quem age como se fosse invulnerável aprende da forma mais dura que não é. Mas nem todo soberbo aprende.",
    "rancoroso":    "Que carrega mágoa como carga, sem conseguir largar. O rancor não é raiva — é raiva que endureceu e ficou. Na ficção, o personagem rancoroso age o tempo todo a partir daquilo que não consegue esquecer. Isso o torna previsível para o leitor e perigoso para os outros.",
    "melancolico":  "Que vive com uma tristeza de fundo — não aguda, mas permanente. A melancolia literária tem textura própria: tons baixos, distância, uma beleza que dói. Não confundir com depressão clínica: o personagem melancólico ainda age, ainda observa — mas com peso.",
    "nostalgico":   "Que vive voltado para o que não existe mais. Na ficção, o nostálgico não está apenas no passado — ele compara o presente com um ideal que talvez nunca tenha existido. Essa tensão entre o que foi e o que é alimenta o conflito interior mais que qualquer antagonista externo.",
    "traidor":      "Que quebra um pacto de confiança — com um outro, com um grupo, consigo mesmo. Na narrativa, a traição tem mais força quando o leitor entende a razão dela: trair por medo, por sobrevivência, por amor. O vilão que trai por maldade pura é mais fraco do que o amigo que trai por fraqueza.",
    "ingenuo":      "Que acredita mais do que deveria, porque ainda não aprendeu a desconfiar. O ingênuo na ficção não é idiota: é alguém cujo mundo ainda não o feriu o suficiente. O momento em que isso muda — quando a ingenuidade acaba — é um dos pontos de virada mais poderosos da narrativa.",
    "astuto":       "Que enxerga além do que os outros mostram e usa isso como ferramenta. A astúcia na ficção é moralmente neutra: pode ser defesa de quem tem menos poder, ou manipulação de quem quer mais. O que diferencia o astuto do esperto é que o astuto planeja; o esperto improvisa.",
    "sensato":      "Que pensa antes de agir e rara vez se arrepende. Na narrativa, o sensato é personagem difícil: falta impulso dramático em quem sempre pondera. Por isso, o sensato costuma ser coadjuvante que aconselha o protagonista impulsivo — ou o protagonista que aprende a sensatez depois de errar muito.",
    "obstinado":    "Que não cede, não desvia, não para. A obstinação é virtude que vira defeito dependendo do que persegue. Na ficção, o obstinado chega aonde a maioria não chega — mas costuma destruir o que está ao redor no caminho. Personagens obstinados são difíceis de deter e impossíveis de redirecionar.",
    "impulsivo":    "Que age antes de pensar, movido pelo momento. O impulsivo é motor narrativo: gera conflito, acelera cenas, toma decisões que o leitor não esperava. Mas o impulsivo paga caro — sua maior batalha não é com o antagonista, é com ele mesmo.",
    "furioso":      "Que age sob a força de uma raiva que se tornou maior do que ele. Na ficção, a fúria não é vilania — é a forma mais visível de dor. O personagem furioso foi ferido. Entender isso é entender o personagem. Fúria sem ferida é clichê; fúria com história é personagem.",
    "resignado":    "Que aceitou o que não pode mudar — mas essa aceitação não é paz, é cansaço com forma de serenidade. O personagem resignado interessa quando o leitor percebe o que ele enterrou para chegar a essa quietude. A resignação tem profundidade; a conformidade, não.",
    "amargo":       "Que carrega decepção acumulada ao ponto de ela alterar o sabor de tudo. O amargo não espera nada de bom — e quando algo bom acontece, desconfia. Na ficção, o personagem amargo é difícil de amar e impossível de ignorar: ele diz verdades que os outros evitam porque não tem mais nada a perder.",
    "apaixonado":   "Que age a partir de um desejo ou afeto que domina as outras considerações. A paixão na ficção não é só afeto romântico: é a entrega total a uma causa, uma arte, uma pessoa. O apaixonado é vulnerável — qualquer narrativa que ameace aquilo que ele ama tem poder sobre ele.",
    "ciumento":     "Que sente ameaça onde talvez não haja nenhuma — e age como se houvesse. O ciúme na ficção é lente que distorce: tudo vira evidência, tudo confirma o que o personagem já decidiu acreditar. O ciumento não é irracional do próprio ponto de vista — o problema é que ele raciocina a partir de um medo que não consegue enunciar.",

    // Adjetivos morais de personagem — v872
    "desonesto":    "Que rompe os acordos tácitos do convívio — mente, manipula, trai expectativas. Na ficção, o desonesto não é necessariamente o vilão: pode ser o protagonista numa situação que o empurrou para o limite. A desonestidade como escolha é mais interessante do que a desonestidade como natureza.",
    "vil":          "Que age de forma baixa, sem consideração pelo dano que causa. O 'vil' é adjetivo forte — escolhê-lo é comprometer-se com o julgamento. Na narrativa, reserve para personagens cuja maldade não tem atenuante visível — ou para momentos em que um personagem ordinário faz algo extraordinariamente pequeno.",
    "nobre":        "Que age com generosidade, integridade ou grandeza — mesmo quando isso tem custo. Na ficção, o 'nobre' real não é o título: é o gesto que ninguém viu e que o personagem não contou. Nobreza sem dificuldade é decoração; nobreza diante do sacrifício é caráter.",
    "compassivo":   "Que sente com o outro — não apenas pela dor, mas pela dignidade do outro. A compaixão literária não é pena: quem tem pena se mantém acima; quem tem compaixão desce até onde está o outro. Personagens compassivos carregam o sofrimento alheio como se fosse seu, e isso tem custo.",
    "indiferente":  "Que não é movido pelo que deveria mover. Na narrativa, a indiferença pode ser mecanismo de defesa, anestesia emocional, ou frieza genuína. O personagem indiferente é perturbador porque não reage conforme o esperado — e isso força o leitor a interpretar o que está por trás.",
    "arrependida":  "Que reconhece ter errado e sente o peso disso — mas o arrependimento, na ficção, não apaga nada. A personagem arrependida é interessante quando a questão não é 'ela aprendeu?' mas 'ela pode viver com o que fez?'. O arrependimento pode paralisar ou, paradoxalmente, ser o que permite continuar.",

    // Verbos de processo narrativo — v872
    "fragmentar":   "Verbo: quebrar a continuidade — do tempo, da narrativa, da identidade da personagem. Fragmentar a narrativa não é desordem: é escolha de forma que reflete uma experiência que não cabe em linha reta. A narrativa fragmentada exige que o leitor monte o que o texto desfez.",
    "condensar":    "Verbo: comprimir sem perder — reduzir o tempo ou o espaço sem perder o essencial. Na escrita, condensar é uma das habilidades mais difíceis: é saber o que pode sair sem que o texto perca quem ele é. O que sobra depois de condensar é o que importa de verdade.",
    "relutar":      "Verbo: resistir ao que se sabe que vai acontecer de qualquer jeito. O personagem que reluta antes de agir é mais humano do que o que age sem hesitar: a relutância mostra o custo interno da escolha. Resistir e depois ceder é narrativamente mais rico do que simplesmente ceder.",
    "titubear":     "Verbo: hesitar visivelmente — corpo e voz delimitam a dúvida antes que a decisão venha. O titubeio é diferente da relutância: a relutância é interna; o titubeio aparece. É o gesto de quem não sabe ou não consegue ainda, e o leitor vê.",
    "capitular":    "Verbo: render-se depois de resistir. Na ficção, a capitulação tem peso quando o leitor acompanhou a luta — a entrega do personagem ressoa como fim de uma batalha, não como fraqueza. O que o personagem abandona ao capitular define o quanto perdeu.",

    // Substantivos de estado interno e de atmosfera — v872
    "vacilacao":    "Hesitação que dura tempo demais — não uma pausa, mas um estado. A personagem que vacila não é covarde: é alguém que vê muito claramente as consequências das duas escolhas. Na ficção, a vacilação prolongada cria tensão que a ação não consegue criar.",
    "conformismo":  "Aceitação do que é como se não pudesse ser diferente. O conformismo na narrativa é lento e trágico: não há confronto, não há ruptura — só a vida que vai estreitando. Quando um personagem conformista finalmente recusa algo, esse momento tem força desproporcional ao gesto.",
    "entardecer":   "Substantivo: o momento em que o dia cede — não noite ainda, mas já não dia. Na ficção, o entardecer carrega ambiguidade emocional: tristeza suave, possibilidade de última conversa, luz que muda tudo. É o horário de despedidas e revelações que não se dizem de frente.",
    "nevoa":        "Neblina densa que apaga contornos e distâncias. Na escrita literária, a névoa é metáfora e cenário ao mesmo tempo: o que não se vê com clareza, o que se sabe mas não se admite, o estado mental de quem não sabe mais o que é real. A névoa perturba sem atacar.",
    "clarao":       "Claridade súbita — de luz, de entendimento, de revelação. Na narrativa, o clarão é raro e por isso poderoso: vem depois de escuridão, dura pouco, muda o que foi visto. Um clarão de compreensão num personagem pode ser o ponto de virada que justifica tudo que veio antes.",
    "lampejo":      "Centelha breve de algo — insight, memória, esperança. O lampejo não permanece: é o que aparece por um instante e desaparece. Na prosa, lampejo de lucidez, de beleza, de perigo. A brevidade é o que lhe dá peso: o leitor também só viu por um momento.",
    "paralisia":    "Imobilidade que não é escolha — é o que acontece quando tudo é grande demais para agir. A personagem paralisada não está descansando: está sobrecarregada. Na ficção, a paralisia como estado prolongado cria tensão sem ação — o que está por vir será desproporcional à quietude.",

    // Termos narrativos fundamentais — v879
    "epigrafe":     "Citação que abre um livro ou capítulo — não é ornamento, é proposta de leitura. A epígrafe bem escolhida dobra o sentido do que vem depois. Ela prepara o tom, sugere o tema, convida a uma segunda interpretação que só existirá depois do livro ser lido.",
    "dedicatoria":  "Página ou frase que dedica o livro — a quem, por quê, com que afeto. A dedicatória é o primeiro gesto de relação do autor com o mundo: diz quem importou o suficiente para que o livro existisse. Ela pode ser íntima, política, irônica ou silenciosa.",
    "tensao":       "O que mantém o leitor na página. A tensão não é ação: é a distância entre o que o leitor sabe que pode acontecer e o que ele teme ou deseja. Sem tensão, a narrativa é relatório. Com ela, é urgência. A tensão não precisa ser violenta — pode ser tão suave quanto uma pergunta adiada.",
    "resolucao":    "O momento em que a tensão encontra resposta — não necessariamente solução. A resolução pode ser desfecho, virada ou dissolução. O que não pode é ser arbitrária: o leitor precisa sentir que aquilo estava contido na história desde o começo, mesmo que não soubesse onde.",
    "subversao":    "O gesto de desfazer o que se esperava — na forma, no tema ou no personagem. A subversão literária não é destruição: é revelar que o convencional tinha uma fissura por onde algo mais verdadeiro poderia entrar. Subverter exige conhecer a fundo o que se subverte.",
    "ambiguidade":  "A capacidade de um texto de sustentar mais de uma leitura ao mesmo tempo — sem que uma cancele a outra. A ambiguidade não é imprecisão: é precisão dupla. Nos grandes textos, ela é intencional: o que a personagem quer e o que a personagem faz não é a mesma coisa.",
    "oralizacao":   "Trazer a fala viva para a escrita — ritmo, hesitação, corte, expressão regional, gíria com data. A oralização não é transcrição: é recriação. A prosa oralizada parece falar porque alguém fez escolhas precisas sobre o que manter e o que deixar de fora da conversa real.",
    "diccao":       "O jeito singular que um escritor tem de usar a língua — ritmo próprio, vocabulário preferido, estrutura de frase, temperatura das palavras. A dicção não se imita sem virar pastiche. Ela nasce de leitura ampla, escuta atenta e coragem de escolher.",
    "fronteira":    "Em narrativa: o limite entre o que a personagem conhece e o que ainda não sabe de si mesma. Cruzar uma fronteira — geográfica, social, moral, psicológica — é o motor de muitas histórias. A fronteira não precisa ser dramática para ser significativa.",
    "vulnerabilidade": "O estado de quem pode ser ferido — e que se expõe mesmo assim. A vulnerabilidade em ficção não é fraqueza: é condição para que algo real aconteça entre personagens. O que não pode ser ferido também não pode ser tocado. A cena mais vulnerável é quase sempre a mais memorável.",
    "fragilidade":  "O que se parte com facilidade — mas não é o mesmo que fraqueza. A fragilidade pode ser beleza: o que é frágil exige cuidado, atenção, presença. Na ficção, personagens frágeis revelam o que está em jogo — a ameaça de quebrá-los é suficiente para criar tensão.",
    "coragem":      "Agir apesar do medo — não na ausência dele. A coragem literária tem textura específica: quem age com coragem sabe o que pode perder. Por isso, o gesto corajoso precisa do medo para ter peso. Personagens corajosos sem medo não são corajosos: são invulneráveis, o que é menos interessante.",
    "determinacao": "Vontade que não cede diante do obstáculo. A determinação é arco ou falha: pode levar ao sucesso ou à cegueira de quem não sabe quando parar. Na ficção, a determinação que não questiona seus próprios fins é obsessão — e obsessão é narrativa.",

    // Verbos narrativos fundamentais — v880
    "revelar":      "Mostrar o que estava escondido — no personagem, na trama ou no leitor. A revelação revela mais de quem a recebe do que do que é revelado: o significado de uma verdade depende do momento em que chega. Revelar cedo demais mata a tensão; revelar tarde demais pode não ser crível.",
    "esconder":     "Guardar para depois — ou para nunca. O que uma personagem esconde define seu interior tanto quanto o que ela diz. O segredo move a narrativa; o leitor que sabe o que a personagem esconde está em posição de superioridade dramática, e essa assimetria é poder narrativo.",
    "sugerir":      "Colocar um sentido sem explicitá-lo. Sugerir é a operação mais econômica da ficção: uma imagem, um gesto, um detalhe carregado. O que é sugerido permanece aberto — o leitor completa, e a completude é sua. O que é dito fecha; o que é sugerido continua.",
    "insinuar":     "Plantar uma ideia sem assiná-la. A insinuação é calculada: quem insinua sabe que está fazendo isso. Na ficção, insinuação é traição velada, sedução oblíqua, desconforto que não tem forma. O leitor sente antes de entender, o que é mais eficaz.",
    "enfrentar":    "Ir de encontro ao que amedronta, ao que dói ou ao que foi evitado. O confronto só tem peso quando a personagem tem a opção de fugir e escolhe ficar. Sem essa escolha, não há coragem — há obrigação. A diferença entre enfrentar e ser forçado é a diferença entre ativo e passivo narrativo.",
    "duvidar":      "Suspender a certeza — sobre si mesma, sobre o outro, sobre o que viu. A dúvida em ficção é motor: ela gera perguntas que o leitor também faz. Uma personagem que nunca duvida é menos interessante do que uma que duvida da coisa certa na hora errada.",
    "reconhecer":   "Ver-se no outro, ou ver a verdade que se tinha resistido. O reconhecimento aristotélico (anagnorisis) é um dos motores mais antigos da narrativa: o momento em que o que era desconhecido se torna evidente muda tudo que vem antes e depois.",
    "admitir":      "Dizer o que custou admitir. A admissão é um ato de rendição seletiva: a personagem cede em um ponto para manter alguma coisa intacta. O que ela admite e o que ela ainda guarda depois de admitir revela a diferença entre honestidade e confissão completa.",
    "recuar":       "Dar um passo atrás quando o caminho ficou grande demais. O recuo pode ser estratégia ou covardia — e a ficção frequentemente explora a zona cinza entre os dois. Uma personagem que recua sem culpa é diferente de uma que recua e sabe o que está perdendo.",

    // Estados emocionais — v881
    "tranquilidade": "Ausência de perturbação — mas não de tensão. A personagem tranquila não é necessariamente segura: ela aprendeu a não se perturbar com o que antes a perturbava. Essa diferença importa. A tranquilidade conquistada tem peso; a tranquilidade que nunca foi testada é indiferença com outro nome.",
    "inquietacao":  "Estado de quem não consegue ficar parado — por dentro ou por fora. A inquietação não tem objeto fixo: ela vaga. Na ficção, a personagem inquieta percebe coisas que a calma não deixaria ver. Ela é motriz — mas também autodistrativa.",
    "agitacao":     "Inquietação com velocidade. A agitação ocupa o espaço, interrompe, muda de assunto, não termina o que começa. Em cena, ela pode ser sinal de perigo iminente ou de uma personagem que tenta não pensar. A agitação física e a agitação interior podem apontar em direções opostas.",
    "raiva":        "Resposta ao que foi feito de errado — real ou percebido. A raiva na ficção tem endereço: ela aponta para algo. Personagem com raiva sem causa é fundo de palco; com causa justa e raiva contida, é conflito. A raiva que não encontra saída procura uma. O que ela acha é trama.",
    "furia":        "Raiva que ultrapassou o controle. A fúria é o que acontece quando a raiva não teve espaço de expressão por tempo demais — ou quando o gatilho foi enorme demais. Em ficção, a fúria revela limite: o que finalmente foi demais para a personagem.",
    "indiferenca":  "A ausência que machuca mais do que o ódio. A indiferença é o estado de quem deixou de importar-se — ou que nunca se importou. Na ficção, ela pode ser defesa ou caráter. Uma personagem indiferente é assustadora porque não responde ao que deveria responder; isso cria tensão sem esforço.",
    "solidariedade": "O gesto de estar do lado de quem sofre — sem exigir nada em troca. A solidariedade literária não é perfeita: quem oferece também carrega algo. O que a personagem traz quando está do lado de outra diz tanto sobre ela quanto sobre quem recebe.",
    "desencanto":   "A perda do encantamento — não como evento, mas como estado que fica. O desencanto não é tristeza: é resignação com passado. A personagem desencantada já esperou, e o que esperou não veio. Ela sabe que não vai mais esperar da mesma forma.",
    "amargura":     "Mágoa que virou caráter. A amargura é o que a dor produz quando não é elaborada: azeda. Uma personagem amarga pode ter razão em tudo que diz e ainda assim ser insuportável — porque a amargura não distingue o que merece raiva do que não merece.",

    // Ambiente, tempo e sensorialidade — v882
    "escuridao":    "Ausência de luz — mas também de orientação, de certeza, de presença. Na ficção, a escuridão não é apenas cenário: é condição. O que acontece no escuro tem peso diferente. A personagem que age no escuro não vê o que faz; o leitor às vezes vê, e isso é poder.",
    "luz":          "O oposto da escuridão — mas também atenção, revelação, exposição. A luz em ficção pode ser alívio ou ameaça: iluminar é tornar visível, e nem sempre o que a personagem quer é ser vista. A metáfora da luz como compreensão é antiga, mas na cena concreta ela precisa ter origem e direção.",
    "sombra":       "Zona entre a luz e a escuridão — onde coisas se escondem sem desaparecer. A sombra literária é o lugar do que não foi dito, do que está prestes a aparecer, do que existe mas não se mostra. Um personagem na sombra não está ausente: está presente de outro modo.",
    "vento":        "Movimento do ar — mas também perturbação, presságio, passagem. O vento na ficção é agente: ele carrega cheiro, muda temperatura, interrompe conversa. A personagem que sente o vento está conectada ao espaço externo de uma forma que não é intelectual — é física, e por isso imediata.",
    "chuva":        "Água que cai — mas também tempo que para, passado que volta, estado de suspensão. A chuva na ficção tende a sincronizar o interior com o exterior: a personagem chora quando chove porque a coincidência diz o que ela não consegue. Usar a chuva sem clichê exige especificidade — que chuva é essa?",
    "noite":        "O período em que a visibilidade diminui e a escuta aumenta. A noite na ficção é tempo de segredo, de decisão adiada, de encontro que não poderia acontecer de dia. O que a personagem faz de noite que não faz de dia diz onde ela vive quando ninguém está olhando.",
    "madrugada":    "A hora em que a noite ainda não acabou mas o dia já começou a existir. A madrugada é o tempo da insônia, da decisão impossível, do que não pôde esperar até amanhã. Na ficção, cenas de madrugada têm peso próprio — como se a hora tornasse tudo mais real por ser absurda.",
    "amanhecer":    "O momento em que a noite cede. O amanhecer na ficção é ambíguo: pode ser recomeço ou fim do que só existia no escuro. A personagem que vê o amanhecer depois de uma noite difícil não está apenas vendo o sol — está atravessando uma borda.",
    "tarde":        "A hora em que a luz começa a mudar de ângulo e o dia perde urgência. A tarde na ficção é tempo de desaceleração, de encontros casuais, de memória. O que acontece de tarde pode ser esquecido; o que acontece de noite, não. Essa diferença é tonal e molda o que a cena pode carregar.",
    "barulho":      "Som sem forma — o oposto do silêncio organizado. O barulho na ficção é falta de controle: quando o ambiente faz barulho, a personagem precisa de mais esforço para existir nele. O barulho pode ser proteção (cobre a conversa) ou agressão (impede o pensamento).",
    "cheiro":       "O sentido que mais acessa memória involuntária. O cheiro entra na cena antes da personagem decidir prestar atenção: ela sente antes de pensar. Na ficção, um cheiro específico vale mais do que qualquer adjetivo genérico — e um cheiro que traz passado é um dispositivo de cena quase sempre gratuito.",

    // Corpo, gesto e presença — v883
    "olhar":        "O que o rosto faz antes de falar. O olhar na ficção é o gesto mais carregado: ele pode conter julgamento, desejo, reconhecimento, medo. O que a personagem olha e o que ela desvia o olhar revela hierarquia, afeto e perigo antes de qualquer palavra.",
    "suspiro":      "Expiração com sentido. O suspiro não é apenas ar: é comentário sem voz. Na ficção, um suspiro pode ser alívio, desistência, desejo ou resignação — dependendo do que veio antes. Ele é a reação que o corpo dá quando a palavra ficou pequena demais.",
    "lagrima":      "Água que o corpo produz quando a emoção ultrapassa o que pode ser contido. A lágrima na ficção tem tamanho: ela pode ser discreta (um fio) ou incontrolável. A personagem que chora sem saber por quê está mais próxima da verdade da cena do que a que chora por razão clara.",
    "toque":        "Contato intencional entre corpos. O toque é o gesto mais íntimo porque não tem como ser vago: alguém tocou onde tocou, com a força que teve, no momento que escolheu. Na ficção, o toque quebra a distância e faz a cena mudar de temperatura.",
    "abraco":       "O toque que envolve. O abraço na ficção é gesto de contenção: conter o outro, conter a si mesma, conter o momento. Um abraço prolongado é diferente de um abraço rápido — o tempo que dura diz o que a personagem não consegue dizer em palavras.",
    "pausa":        "O que acontece entre as palavras. A pausa na escrita é tão importante quanto a pausa na fala: ela carrega o que não foi dito, o que veio a seguir, o que custou continuar. Na ficção, a personagem que faz pausa está calculando ou sentindo — e o leitor lê os dois ao mesmo tempo.",
    "hesitacao":    "O momento entre querer e fazer. A hesitação em cena é ouro narrativo: ela revela o que está em jogo antes da decisão. Quem hesita está dividido — e essa divisão tem duas forças que o leitor consegue sentir. A personagem que nunca hesita é menos real.",
    "palavra":      "A unidade básica da presença humana no texto. Mas na ficção, a palavra que a personagem escolhe diz mais do que seu sentido: ela revela classe, educação, emoção, intenção velada. A personagem que usa palavras difíceis num momento de dor está se escondendo atrás delas.",

    // Relações e forças narrativas — v884
    "traicao":      "Quebrar uma lealdade que o outro não sabia que estava frágil. A traição literária tem graus: pode ser um segredo guardado, uma aliança mudada, uma promessa esquecida. O que torna a traição devastadora na ficção não é o ato — é o momento em que o traído percebe que não percebeu.",
    "lealdade":     "Continuar do lado de alguém quando seria mais fácil não continuar. A lealdade na ficção tem custo — e esse custo é o que a define. Uma personagem que é leal sem sacrifício não está sendo leal: está sendo cômoda. A lealdade sob pressão é onde o caráter aparece.",
    "amor":         "O estado de quem faz do outro parte de si mesma. O amor na ficção não é sentimento: é condição — muda o que a personagem vê, escolhe, teme. O que ela faz por amor e o que ela deixa de fazer por amor revelam o peso que essa palavra tem no universo da história.",
    "odio":         "O amor com outro sinal. O ódio em ficção raramente aparece sozinho: ele costuma ser amor que passou por decepção, medo que virou defesa, desejo que não foi correspondido. A personagem que odeia sem razão é plana; a que odeia com razão — e sabe disso — é conflito.",
    "medo":         "A resposta ao que pode tirar algo que importa. O medo literário não é genérico: é sempre medo de perder algo específico — vida, amor, reputação, ilusão. O que a personagem teme define o que ela valoriza, e o que ela valoriza define quem ela é.",
    "desejo":       "A força que move antes da razão. O desejo na ficção é motor: ele explica por que a personagem faz o que não devia, busca o que não pode ter, recusa o que seria mais fácil. O desejo não tem que ser sexual — pode ser de pertencer, de ser visto, de ter paz.",
    "liberdade":    "A condição de poder escolher sem ser forçada. Na ficção, a liberdade quase nunca é total: há o que a personagem pode fazer e o que ela pode fazer sem destruir o que importa. A história de liberdade é quase sempre a história de aprender o que realmente custa ser livre.",
    "abandono":     "Ser deixada por quem deveria ficar. O abandono literário deixa rastro: ele aparece na forma como a personagem entra em relações futuras, no que ela espera do outro, no que ela faz antes de ser deixada novamente. A personagem abandonada está sempre em estado de antecipação.",
    "amizade":      "A relação entre iguais que escolhem continuar. A amizade na ficção é subestimada: ela é o vínculo que sustenta a personagem quando tudo o mais falha. Diferente do amor, ela raramente tem drama próprio — seu valor aparece quando falta.",
    "ausencia":     "A presença do que não está. Na ficção, a ausência pode ser mais ativa do que a presença: o personagem morto que move a trama, o amor que foi embora e é mencionado em tudo, a memória que transforma o que existe. A ausência não é vazio — é pressão.",

    // Estrutura narrativa — v885
    "onisciencia":  "O narrador que sabe mais do que qualquer personagem. A onisciência permite ao texto entrar em múltiplas consciências, saltar no tempo e no espaço, e comentar o que vê. Mas esse poder tem custo: quanto mais o narrador sabe, mais difícil é criar suspense sem parecer que está retendo informação.",
    "compressao":   "Narrar muito tempo em pouco espaço. A compressão é a operação de resumir: 'passaram-se dez anos' é compressão máxima. Usada bem, ela dá à narrativa velocidade e senso de consequência. Usada mal, ela torna os saltos abruptos e deixa o leitor sem chão.",
    "coadjuvante":  "O personagem que importa sem ser o centro. O coadjuvante na ficção revela o protagonista por contraste: é quem define o que a personagem principal é por diferença. Um coadjuvante bem construído tem vida própria, mesmo que o texto não a acompanhe.",
    "figurante":    "O personagem que povoa sem ter arco. Figurantes são o mundo ao redor da protagonista — eles tornam a ficção habitável. O que distingue um figurante bem escrito de um mal escrito é que o primeiro tem um detalhe concreto que o faz real por um momento.",
    "passagem":     "O que o texto usa para saltar no tempo ou no espaço sem explicar o salto. A passagem pode ser breve — uma linha em branco — ou pode ser uma pequena cena de transição. O que ela não pode fazer é chamar mais atenção do que o que vem antes e depois.",
    "perspectiva":  "O ângulo a partir do qual a história é contada. A perspectiva não é apenas técnica: ela governa o que pode ser sabido, o que é distorcido, o que fica fora de campo. Mudar de perspectiva muda a história — o mesmo evento tem peso diferente dependendo de quem o vê.",

    // Ofício editorial — v886
    "devolucao":    "A resposta negativa da editora. A devolução não é o fim — é uma resposta com informação dentro, mesmo quando não tem comentários. O que a escritora faz com a devolução define quanto ela avança: arquivar, revisar, ou enviar para outro lugar sem alterar.",
    "publicacao":   "O momento em que o texto deixa de ser da escritora e passa a ser do leitor. Publicar não é o fim do processo — é o começo de outro, mais público e menos controlável. O que o livro significa depois de publicado não é exatamente o que significava antes.",
    "editor":       "Quem lê o manuscrito como interlocutor antes do leitor. O editor não corrige: ele faz perguntas que a escritora ainda não fez sobre o próprio texto. Um bom editor torna o livro mais ele mesmo — não mais parecido com o que o editor teria escrito.",
    "submissao":    "O gesto de enviar o manuscrito para avaliação de uma editora ou agente. A submissão requer uma habilidade diferente da escrita: síntese, paciência, distância do próprio texto. A carta de submissão é o manuscrito que apresenta o manuscrito.",
    "ficcao":       "Narrativa que inventa — mas não por isso mente. A ficção usa o que não aconteceu para dizer o que é verdadeiro de maneiras que o factual não alcança. O pacto da ficção com o leitor é: aceite que isso não aconteceu para que você possa sentir que é real.",
    "genero":       "A categoria que organiza as expectativas do leitor. O gênero não é prisão — é contrato. Quando uma escritora rompe o contrato, ela precisa que o leitor perceba e concorde com a ruptura. Gênero bem dominado é a condição para a subversão funcionar.",
    "autobiografia": "A narrativa que usa a própria vida como material. A autobiografia não é confissão: é reconstrução. Quem escreve sobre si mesma está escolhendo o que mostrar, quando mostrar, com que tom. O eu da autobiografia é personagem construída, mesmo que se chame pelo nome real.",
    "catalogo":     "O conjunto de títulos que define o que uma editora é. O catálogo fala de valores, de aposta em leitores, de risco estético. Antes de submeter, conhecer o catálogo é saber se há espaço para o que foi escrito — não para copiar, mas para pertencer.",

    // Verbos de fala — v890
    "tagarelar":    "Falar muito, rápido e sem destino claro. A personagem que tagarela está preenchendo um silêncio que a incomoda — ou tentando não ouvir algo. Na ficção, o excesso de fala revela tanto quanto o silêncio: o que ela não para de dizer é aquilo que não consegue admitir.",
    "praguejar":    "Soltar palavras de raiva — xingamentos, maldições, imprecações. Praguejar em cena é gesto de quem perdeu o filtro: a personagem não está mais controlando o que sai. O palavrão certo no momento certo tem peso de cena; o palavrão de hábito é ruído.",
    "cochichar":    "Falar tão baixo que só o destinatário ouve. O cochico na ficção cria cumplicidade ou segredo: duas pessoas no cochico estão se separando do mundo. O que não pode ser dito em voz alta tem outro peso — o cochico sinaliza que algo está em jogo.",

    // Cor, pele e corporalidade — v890 (com carga cultural)
    "moreno":       "Em contexto brasileiro, descreve quem tem pele mais escura ou cabelo escuro — e carrega ambiguidade deliberada. 'Moreno' pode ser elogio ou evasiva; pode descrever fenótipo sem nomear raça. Na ficção, a escolha entre 'moreno' e 'negro' é decisão narrativa: uma nomeia, a outra esquiva.",
    "pardo":        "Categoria do IBGE que designa miscigenação — e que no texto literário raramente aparece. 'Pardo' é burocrático; na cena, a escritora raramente o usa. Quando usa, é para marcar a fricção entre a categoria oficial e a experiência real de quem se enquadra nela.",
    "loiro":        "Cabelo claro, pele clara — e no Brasil, frequentemente portador de privilégio não nomeado. Na ficção brasileira, a loirice pode ser traço neutro ou marcador social, dependendo de como a narrativa o trata. O que o texto faz com a loirice revela a perspectiva de quem narra.",
    "negro":        "Marcador racial e identitário — não apenas de cor de pele. 'Negro' na ficção brasileira é escolha política: afirma uma identidade onde outros textos diriam 'moreno' ou evitariam nomear. A decisão de nomear ou não a raça de uma personagem diz algo sobre o texto antes de dizer algo sobre a personagem.",
    "branco":       "Cor de pele que, em contexto brasileiro, raramente é nomeada — porque a norma implícita a torna invisível. Quando a escritora nomeia a branquitude de uma personagem, ela torna visível o que o texto costuma deixar sem dizer. É gesto de desestabilização da norma.",

    // Estados pós-trauma — v890
    "cicatriz":     "O que fica depois da ferida fechar. A cicatriz literária é memória corporal: ela não dói mais, mas mudou o que havia antes. Na ficção, personagens com cicatrizes carregam história visível — e a história que o texto conta sobre aquela cicatriz decide o quanto ela pesa.",
    "luto":         "O processo de perder algo ou alguém que importava. O luto na ficção não é linear: tem raiva, negação, saudade, alívio culpado. O que a personagem faz com o luto — como o carrega, o esconde, o exibe — diz mais sobre ela do que sobre quem perdeu.",
    "perda":        "A ausência que foi precedida por uma presença. Na ficção, a perda só tem peso se o leitor soube do que existia antes de desaparecer. Por isso, construir o que vai ser perdido é tão importante quanto narrar a perda — sem o primeiro, o segundo é seco.",

    // Percepção sensorial e interior — v891
    "perceber":     "Registrar algo que não estava sendo buscado. Perceber é diferente de observar: é mais involuntário, mais imediato. Na ficção, o que a personagem percebe sem querer revela o que seu corpo e sua consciência estão monitorando mesmo quando ela não sabe.",
    "vislumbrar":   "Ver de relance, por um instante, sem certeza do que se viu. O vislumbre na ficção é ferramenta de suspense e de desejo: o que foi vislumbrado pode ser real ou projeção. Ele instala uma dúvida que o texto pode ou não resolver.",
    "intuir":       "Saber antes de entender por quê. A intuição na ficção é acesso privilegiado ao interior da personagem: ela sabe algo que o texto ainda não revelou, e o leitor percebe a distância entre o que ela sente e o que sabe. Intuição bem usada cria tensão silenciosa.",
    "lembrar":      "Trazer o passado ao presente — mas não sem alterá-lo. A memória literária não é arquivo: ela reconstrói. O que a personagem lembra e o que ela mudou sem perceber revela quem ela é no presente. A memória seletiva é personagem tanto quanto quem lembra.",
    "esquecer":     "Perder acesso — mas não necessariamente o peso. O esquecimento na ficção é ativo: não é ausência de memória, é memória que trabalha por baixo. A personagem que esqueceu pode não saber que carrega; o leitor pode ver o que ela não vê.",
    "sonhar":       "Criar imagens e narrativa enquanto dorme — mas na ficção, sonhar é também desejo e projeção. O sonho literário revela o que a personagem não consegue dizer acordada. Usado com cuidado, é janela; usado em excesso, é muleta para dizer o que a cena deveria mostrar.",
    "imaginar":     "Criar internamente o que não existe no mundo imediato. A imaginação na ficção tem dois usos: a personagem que imagina é interior — o texto a acompanha para dentro. Quando a escritora imagina, ela está construindo o universo que o leitor vai habitar.",
    "temer":        "Antecipar a perda de algo que importa. O medo da perda, ao contrário do medo do desconhecido, é motor narrativo específico: a personagem que teme sabe o que está em jogo. Isso cria cumplicidade com o leitor, que também sabe — e torce ou receia junto.",
    "escutar":      "Ouvir com atenção e intenção. A diferença entre ouvir e escutar é o esforço: escutar é ativo. Na ficção, a personagem que escuta está presente de um modo que a que só ouve não está. Escutar pode ser ato de cuidado, de suspeita ou de esforço para entender.",
    "farejar":      "Buscar pelo olfato — mas também rastrear, intuir, seguir um rastro não visível. Farejar em sentido figurado é a personagem que capta algo que não foi dito, que segue um fio que não é explícito. Esse uso metafórico é mais rico do que o literal na maioria das cenas.",

    // Substantivos nucleares — tempo, vida, morte e afetos — v895
    "tempo":        "Na ficção, o tempo é matéria prima. Não o relógio: a duração vivida, a espera, o instante que se dilata, o passado que não passou. Manipular o tempo é uma das ferramentas mais poderosas da narrativa — acelerar, pausar, retroceder, fragmentar. O tempo da história e o tempo da narração raramente coincidem, e essa tensão é onde a ficção vive.",
    "vida":         "Na ficção, a vida não é conceito: é o que as personagens defendem, perdem, constroem ou não conseguem nomear. A vida literária se define pelo que está em jogo. Uma narrativa ganha peso quando a leitora percebe o que pode ser perdido — e vida é sempre o que está em risco, literal ou metaforicamente.",
    "morte":        "A morte na ficção não precisa ser evento literal: pode ser perda, ruptura, fim de um mundo interior. Quando aparece de verdade, ela organiza a narrativa ao redor — o que veio antes, o que resta depois. A morte literária exige que a autora pense no que significou a vida que ela encerra.",
    "tristeza":     "Emoção de lenta digestão — diferente do choque da dor aguda, a tristeza instala-se e fica. Na ficção, a tristeza revela a personagem pelo que ela perdeu ou nunca teve. Cuidado para não confundir tristeza com melancolia: melancolia não sabe sua própria origem; tristeza, em geral, sabe.",
    "alegria":      "Uma das emoções mais difíceis de escrever — clichê aparece rápido, afetação também. A alegria literária que funciona é específica: não 'ela ficou feliz', mas o que exatamente fez aquele momento sentir como expansão. Alegria legítima na ficção costuma aparecer em contraste com o peso que veio antes.",
    "sonho":        "Na ficção, sonho tem dois usos distintos: o sonho que a personagem tem enquanto dorme (revelador, simbólico, ou literalizador de medo) e o sonho como desejo e projeção acordada. O primeiro exige cuidado para não virar muleta narrativa; o segundo pode mover a história inteira.",
    "destino":      "Na narrativa clássica, destino é o que não pode ser evitado — força que organiza e fecha. Na ficção contemporânea, o destino é mais inquieto: o personagem o percebe, o questiona, o recusa. Escrever destino sem ceder ao fatalismo barato é uma das marcas da boa ficção.",
    "verdade":      "Na ficção, a verdade raramente é uma. Narradores mentem, lembranças distorcem, personagens se contradizem. A verdade literária não é o que aconteceu: é o que a personagem acredita que aconteceu e o que isso significa para ela. Isso é diferente da mentira — e também diferente do fato.",
    "mentira":      "Na ficção, a mentira é dinâmica: quem mente, para quem, sobre o quê, e o que está tentando proteger. A mentira interessante não é a do vilão óbvio: é a da personagem que acredita que está fazendo o certo, ou que mentiu para si mesma por tanto tempo que já não sabe a diferença.",
    "poder":        "Na ficção, o poder aparece em quem decide, em quem cala e em quem não precisa se justificar. Poder não é só político: é também quem fala mais na cena, quem tem o olhar que define a realidade, quem pode ignorar quem. Toda relação entre personagens tem dinâmica de poder — às vezes tênue, às vezes brutal.",
    "guerra":       "A guerra na ficção não é apenas batalha: é o estado em que a violência se torna sistema. Pode ser entre países, entre famílias, dentro de uma pessoa. A ficção de guerra mais honesta não glorifica: ela mostra o custo, o peso, o que as pessoas fazem quando a violência é norma. Cuidado com a guerra como cenário sem consequências.",
    "historia":     "A história que a personagem conta sobre si mesma é sempre diferente do que aconteceu — e ambas são verdadeiras. Na ficção metanarrativa, a história da história aparece: quem conta, por quê, para quem, e o que essa narração faz ao narrado. Escrever sobre história é sempre escrever sobre versão.",

    // Processo criativo, atmosfera e identidade — v918
    "habito":        "O hábito de escrever é o que existe entre a inspiração e a produção. A escritora que espera inspiração para sentar pode esperar semanas; a que senta sem inspiração frequentemente a encontra no processo. O hábito não garante qualidade — mas garante que existe texto onde trabalhar, e o texto medíocre pode ser reescrito enquanto a página em branco não pode.",
    "procrastinacao": "A procrastinação é o espaço entre a intenção de escrever e o ato. Não é preguiça: frequentemente é medo — de que o texto não seja bom o suficiente, de que o esforço não valha o resultado, de que revelar o que se quer dizer seja perigoso. A procrastinação produtiva (ler, pesquisar, caminhar) é diferente da que evita completamente o território.",
    "perfeccionismo": "O perfeccionismo na escrita é o que impede a primeira versão de existir. A escritora perfeccionista não termina porque nenhuma versão está boa o suficiente; às vezes não começa. O perfeccionismo precisa de prazo: a primeira versão não precisa ser boa, precisa existir. A perfeição, se vier, vem na revisão — não na paralisia inicial.",
    "autocritica":   "A autocrítica é a capacidade de ler o próprio texto com distância — de ver o que não funciona, o que é excesso, o que poderia ser mais preciso. A autocrítica bem calibrada é ferramenta; excessiva, é sabotagem. A escritora que não consegue nenhuma autocrítica publica textos sem trabalho; a que tem autocrítica demais não publica nada. O ponto de equilíbrio muda a cada projeto.",
    "atmosfera":     "A atmosfera é o estado emocional que o texto cria no leitor — a sensação que precede a compreensão racional. Uma atmosfera de ameaça pode ser construída sem que nada de ameaçador aconteça ainda; a atmosfera de ternura pode existir antes que personagens se toquem. A atmosfera é construída por escolhas de vocabulário, ritmo, imagem e som das palavras — não por declaração.",
    "clima":         "O clima como elemento narrativo vai além da meteorologia: o tempo que faz organiza o estado emocional da cena. Chuva e opressão, sol e alívio são associações fáceis demais — a ficção que usa essas convenções sem questionar fica previsível. Mas o clima que contradiz a emoção da cena — o dia lindo em que tudo vai mal — cria tensão por contraste.",
    "resiliencia":   "A resiliência na ficção não é a personagem que não dobra — é a que dobra e se recompõe. A personagem invulnerável não tem arco; a que sofre, cai e volta é narrativa. Mas a resiliência na ficção também pode ser questionada: quando a narrativa exige que personagens marginalizadas sejam sempre resilientes, está colocando nelas o peso de um sistema que deveria ser questionado.",
    "superacao":     "A superação na ficção é o movimento de ir além do obstáculo — interno ou externo. A narrativa de superação tem uma estrutura reconhecível: estado inicial, obstáculo, crise, transformação, novo estado. A ficção que usa essa estrutura sem reflexão pode cair no arco de redenção fácil; a que a usa com honestidade mostra o custo real de superar o que foi difícil.",
    "citacao":       "A citação na ficção é a presença de outra voz dentro do texto — uma epígrafe, uma fala de personagem que ecoa um texto real, uma referência que o leitor atento reconhece. A citação pode ser ornamento ou estrutura: quando é estrutura, ela não decora o texto mas o conversa com ele. A citação é intertextualidade explícita — o texto que sabe que não está sozinho.",
    "referencia":    "A referência literária é a conversa silenciosa que um texto trava com outros textos. A escritora que conhece a tradição pode referenciar sem citar — pelo tom, pela estrutura, pela escolha de determinada forma. A referência que só os iniciados percebem não é elitismo se o texto funciona sem ela; é um presente para quem reconhece, não uma porta fechada para quem não reconhece.",
    "interseccionalidade": "A interseccionalidade é a análise de como identidades múltiplas — raça, gênero, classe, sexualidade, deficiência — se combinam para criar experiências únicas de opressão ou privilégio. Na ficção, a interseccionalidade aparece quando a personagem não pode ser entendida por uma única dimensão: a mulher negra pobre não experimenta o mundo como a mulher branca, nem como o homem negro pobre — ela está na interseção de todas essas posições.",
    "mudanca":       "A mudança é o que a narrativa move — o que foi diferente depois de a história acontecer. A personagem que termina o livro exatamente como começou não teve arco; alguma coisa mudou, mesmo que seja só a compreensão do leitor sobre quem ela é. A mudança pode ser positiva, negativa ou ambígua — o que a ficção exige é que seja consequente: que derive do que aconteceu.",

    // Virtudes, criação e formas complementares — v917
    "imaginario":    "O imaginário literário é o conjunto de imagens, figuras e mitos que uma cultura usa para pensar a si mesma. O imaginário brasileiro inclui o sertão, a floresta, o carnaval, o futebol, o sincretismo religioso — mas também o que foi apagado, o que não entrou nos arquivos oficiais. A ficção que dialoga com o imaginário brasileiro pode reproduzi-lo ou fraturá-lo.",
    "exilio":        "O exílio na ficção é o estado de quem não cabe onde está — por expulsão, por escolha forçada, por não pertencer ao lugar que habita. O exílio geográfico e o exílio interior têm estruturas narrativas distintas: o primeiro é a distância física da terra de origem; o segundo é a incapacidade de estar em casa mesmo quando se está nela. O Brasil tem uma longa história de escritoras no exílio.",
    "memoria":       "A memória na ficção é reconstituição, não reprodução. O que a personagem lembra é moldado pelo que ela é agora — ela não acessa o passado puro, acessa o passado filtrado pela experiência subsequente. Por isso a memória literária é sempre parcial, seletiva, emotiva. A ficção que entende isso usa a memória como território de ambiguidade, não de certeza.",
    "esquecimento":  "O esquecimento na ficção é tão significativo quanto a memória — o que a personagem não consegue lembrar, o que apagou ativamente, o que o trauma tornou inacessível. O esquecimento pode ser proteção ou perda. A ficção que olha para o que foi esquecido está muitas vezes fazendo trabalho político: restaurar o que foi deliberadamente apagado da história.",
    "silencio":      "O silêncio na ficção não é ausência — é presença de outra qualidade. O que a personagem não diz é tão revelador quanto o que diz. O silêncio que o texto preserva ao redor de um assunto sinaliza tabu, dor, limite. Na ficção contemporânea, o silêncio pode ser estratégia narrativa: deixar o leitor chegar à conclusão que a narração não quer formular.",
    "gratuidade":    "A gratuidade na ficção é o que acontece sem servir ao enredo — a cena que existe pelo prazer da cena, a descrição que existe pelo prazer da descrição. A ficção que só constrói ação funcional fica seca; a que inclui momentos gratuitos reconhece que a vida tem digressões, desvios, prazeres sem propósito. Mas a gratuidade precisa ser voz, não descuido.",
    "exagero":       "O exagero na ficção é ferramenta, não erro — quando é consciente. A hipérbole amplifica para revelar; o exagero cômico deforma para iluminar. A ficção que exagera deliberadamente está usando o excesso como lente. Mas o exagero não intencional — o melodrama que não percebe que é melodrama, a violência inflada além da necessidade — perde o leitor.",
    "humor":         "O humor na ficção brasileira tem longa tradição — da ironia de Machado de Assis ao absurdo de Murilo Rubião, do grotesco regionalista ao humor periférico contemporâneo. O humor que funciona na ficção não é decoração: é modo de ver, de sobreviver, de resistir. A personagem que tem senso de humor tem uma forma de olhar para o mundo que não se dobra facilmente.",
    "ironia":        "A ironia é a distância entre o que é dito e o que é entendido — a narração que diz o contrário do que significa, ou que coloca numa mesma frase dois sentidos em tensão. A ironia literária exige leitor capaz de ler nas entrelinhas. A ironia dramática, especificamente, é quando o leitor sabe mais do que a personagem sobre o que está acontecendo.",
    "tragedia":      "A tragédia é a forma narrativa em que a personagem, por falha ou destino, vai ao fundo — sem saída, sem redenção fácil. A tragédia clássica exige grandeza no que cai: o tamanho da queda é proporcional ao tamanho do que era antes. A ficção brasileira contemporânea tem suas próprias tragédias — menos aristocráticas, mais urgentes, enraizadas em estruturas sociais concretas.",
    "comedia":       "A comédia não é o gênero menos sério — é o gênero que sobrevive ao que a tragédia não consegue. A comédia termina em integração (casamento, festa, reconciliação) onde a tragédia termina em dissolução. A comédia que leva a sério o que narra é tão exigente quanto a tragédia: o riso precisa de timing, de observação precisa e de humanidade.",
    "satira":        "A sátira usa o riso para criticar — costumes, instituições, figuras de poder. A sátira política tem longa história no Brasil, da imprensa do século XIX às redes sociais contemporâneas. A sátira literária que funciona é específica: sabe exatamente o que está atacando e por quê. A sátira que ataca tudo igualmente perde o fio crítico e vira niilismo.",

    // Identidade da escritora, criação e temas sociais — v916
    "escritora":     "A escritora é quem escreve — e essa afirmação é mais complexa do que parece. Historicamente, escritoras foram apagadas, publicadas sob pseudônimos masculinos, relegadas a gêneros considerados menores. A escritora contemporânea brasileira ocupa um espaço que foi conquistado e que continua sendo disputado. Escrever, para ela, é frequentemente um ato que contraria expectativas e que afirma uma presença.",
    "autora":        "A autora é a pessoa por trás do texto — não a voz narrativa, não a personagem, mas quem fez as escolhas que tornaram o texto o que é. O conceito de autoria é debatido: Barthes declarou a 'morte do autor'; outros insistem na importância de saber quem fala e de onde. Para a autora marginalizada, a autoria é uma questão de sobrevivência cultural.",
    "poeta":         "O poeta é quem escreve poesia — mas a palavra vai além da função. O poeta é quem insiste em dizer o que resiste à prosa, quem encontra a exatidão no incompleto, quem usa o silêncio como parte do que diz. No Brasil, poesia e política sempre andaram juntas — do romantismo ao cordel, da poesia concreta à slam poetry periférica.",
    "imaginacao":    "A imaginação é a faculdade que permite à escritora criar o que não existe ou reunir de forma nova o que existe. A imaginação literária não é fantasia arbitrária: é construção rigorosa de realidades possíveis. A escritora que 'só descreve o que viveu' está usando memória; a que transforma o vivido em algo que nunca aconteceu está usando imaginação — e as duas habilidades são igualmente necessárias.",
    "consciencia":   "A consciência na ficção é o interior da personagem — o fluxo de pensamentos, percepções, memórias e impulsos que compõem o que ela é por dentro. O fluxo de consciência (stream of consciousness) é uma técnica narrativa que tenta replicar esse processo sem mediação racional. A ficção que entra na consciência da personagem revela o que o comportamento externo esconderia.",
    "mae":           "A mãe na ficção é um dos campos de força mais carregados da narrativa — ausente, opressora, protetora, abandonada, idealizada. A figura materna organiza o desenvolvimento da personagem de formas que a ficção brasileira tem explorado com crescente profundidade, especialmente quando a escritora é mulher e carrega sua própria relação com a maternidade para dentro do texto.",
    "pai":           "O pai na ficção é frequentemente o primeiro obstáculo ou o primeiro modelo — a lei, a ausência, o que é preciso superar ou imitar. O pai ausente organiza muitas narrativas de formação brasileiras; o pai presente também. A figura paterna na ficção revela como uma sociedade distribui autoridade, amor e responsabilidade — e o que acontece quando essa distribuição falha.",
    "paixao":        "A paixão é a emoção que suspende o cálculo — que faz a personagem agir de forma que ela não poderia defender racionalmente. A paixão literária não é só romântica: é também a paixão pelo trabalho, pela causa, pela arte, pela revolta. A personagem apaixonada é personagem em risco — porque a paixão compromete a defesa e expõe o que é mais essencial.",
    "violencia":     "A violência na ficção brasileira não é opção temática exótica — é realidade histórica e presente que a literatura tem a responsabilidade de nomear, de situar e de recusar a neutralizar. A violência que a ficção representa sem questionar pode normalizar; a que representa com perspectiva crítica pode iluminar o que a notícia anestesia. A escritora que escreve violência precisa saber a favor de quem está narrando.",
    "justica":       "A justiça na ficção raramente é simples — a lei e o justo frequentemente divergem, e a ficção é o lugar onde essa divergência pode ser explorada sem precisar de resolução fácil. A personagem que busca justiça pode descobrir que o sistema não a prevê; a que encontra justiça pode descobrir que ela vem de formas inesperadas. A ficção brasileira tem muito a dizer sobre essa distância.",
    "brasileiro":    "Ser brasileiro na ficção não é só localização geográfica — é posição num campo de forças históricas, raciais, de classe e de região. A brasileiridade que a ficção contemporânea está construindo é múltipla e contestada: não há uma identidade nacional mas várias identidades em tensão, herdadas da colonização, da escravidão, da migração e da resistência cotidiana.",
    "cronista":      "O cronista é quem escreve crônicas — gênero que a literatura brasileira elevou a forma de arte: a interseção entre jornalismo e ficção, entre o cotidiano e o eterno. Fernando Sabino, Rubem Braga, Clarice Lispector, Paulo Mendes Campos — e hoje vozes periféricas e diversas que levam a crônica para lugares que ela nunca habitou. A crônica é o gênero mais democrático da literatura brasileira.",

    // Estrutura narrativa e identidade brasileira — v915
    "motivacao":     "A motivação é o que move a personagem — o desejo, a necessidade, o medo que a faz agir quando seria mais fácil não agir. Sem motivação clara, a ação da personagem parece arbitrária; com motivação coerente, cada escolha faz sentido mesmo quando o leitor discorda dela. A motivação não precisa ser declarada: pode ser mostrada por comportamento e pela história que a gerou.",
    "objetivo":      "O objetivo é o que a personagem quer alcançar — o alvo concreto ou emocional que organiza suas ações. O objetivo pode ser explícito ('preciso encontrar minha irmã') ou implícito (pertencer, ser amada, provar algo a si mesma). A ficção com objetivos claros para suas personagens tem tração; sem objetivos, as personagens existem mas não se movem.",
    "obstaculo":     "O obstáculo é o que fica entre a personagem e o que ela quer. Sem obstáculo, não há história — só relato de sucesso fácil. O melhor obstáculo não é externo por acidente: revela algo sobre o mundo ou sobre a própria personagem. O obstáculo que a personagem contorna sem custo não é obstáculo; o que a transforma no processo de ser superado é.",
    "mito":          "O mito na ficção não é mentira — é estrutura de sentido compartilhado por uma comunidade. As mitologias indígenas, africanas e afro-brasileiras são sistemas narrativos completos com heróis, deuses, criações e transformações. A ficção brasileira que dialoga com esses mitos (em vez de só com os gregos e romanos) está expandindo o que conta como origem e como possibilidade.",
    "parabola":      "A parábola é a história que ensina por analogia — não declara uma moral, mas coloca o leitor diante de uma situação que ilumina a vida real. A boa parábola não precisa de explicação: o sentido emerge da própria narrativa. A parábola que explica o que acabou de mostrar não confia no leitor.",
    "nordeste":      "O Nordeste na ficção brasileira é um dos territórios literários mais férteis e mais distorcidos ao mesmo tempo. Da ficção regionalista do século XX às vozes contemporâneas que recusam o Nordeste como cenário de miséria exótica — há uma história longa de quem conta o Nordeste, de onde, e com que propósito. A ficção nordestina de autoria nordestina é diferente da ficção sobre o Nordeste feita de fora.",
    "quilombo":      "O quilombo na ficção é ao mesmo tempo espaço histórico e símbolo de resistência. Os quilombos foram comunidades de pessoas escravizadas que resistiram, que criaram cultura e território próprios. Na ficção contemporânea, o quilombo aparece como memória, como herança e como modelo de organização coletiva que a narrativa pode questionar, celebrar ou reinterpretar.",
    "favela":        "A favela na ficção brasileira tem sido frequentemente narrada de fora — como cenário de violência, curiosidade sociológica ou exotismo. A ficção de autoria periférica mudou essa equação: narrar a favela de dentro, com intimidade, humor, amor e a complexidade que qualquer comunidade humana tem. A favela na ficção é, antes de tudo, lugar onde pessoas vivem suas histórias inteiras.",
    "sertanejo":     "O sertanejo na ficção carrega uma longa tradição de representação — frequentemente heroica, às vezes paternalista, quase sempre masculina. A ficção sertaneja contemporânea está expandindo esse arquivo: mulheres sertanejas como protagonistas de sua própria história, sertanejos queer, sertanejos que migram e carregam o sertão dentro de si. O sertão não é só paisagem: é modo de ser e de saber.",
    "carioca":       "O carioca na ficção brasileira é identidade cultural específica — jeito de falar, de habitar o espaço, de lidar com a mistura social e geográfica de uma cidade que comprimiu praias, morros, asfalto e história num mesmo território. A ficção carioca que não cai no cartão-postal está narrando a contradição de uma cidade desigual e ao mesmo tempo extraordinariamente viva.",
    "paulistano":    "O paulistano na ficção brasileira é frequentemente narrado como o habitante de uma cidade que não para — o ritmo, o trabalho, a solidão urbana, as distâncias. Mas a ficção paulistana também é a dos filhos e netos de migrantes que construíram a cidade sem aparecer na sua história oficial: nordestinos, japoneses, italianos, bolivianos, haitianos — São Paulo é um arquivo de chegadas.",
    "presente":      "O presente na ficção é a tensão mais difícil de sustentar: o que está acontecendo agora, sem o distanciamento do passado nem a especulação do futuro. Escrever no tempo presente gramatical é uma escolha formal que aumenta a imediação e reduz a onisciência narrativa. Mas o 'presente' como tema — a personagem que não consegue sair do momento atual, que não consegue planejar nem lembrar — é também um estado psicológico narrativo.",

    // Linguagem, espaços sociais e técnica — v913
    "linguagem":     "A linguagem na ficção não é só meio — é tema, é personagem, é território. A escolha de qual linguagem usar, de qual registrar e silenciar, de qual voz deixar chegar ao texto: tudo isso é decisão literária com consequências políticas. A ficção que escolhe uma linguagem periférica, oral, dialetal ou não-padrão está recusando o apagamento que a norma culta frequentemente pratica.",
    "idioma":        "O idioma na ficção é a casa que a personagem carrega — e que pode ser negada, imposta ou roubada. A ficção sobre personagens que vivem entre idiomas (imigrantes, indígenas forçados ao português, descendentes de diáspora) está falando de poder, de pertencimento e de perda. O idioma que uma personagem não consegue mais falar diz mais sobre ela do que o que consegue.",
    "dialeto":       "O dialeto na ficção é a língua dentro da língua — a forma regional, geracional ou de classe que marca de onde a personagem vem. Escrever dialeto com cuidado e respeito é uma das marcas da boa ficção brasileira: nem caricatura, nem assimilação na norma. O dialeto que a personagem abandona ao entrar na cidade, ao ascender socialmente, é também uma forma de perda identitária.",
    "generosidade":  "A generosidade na ficção raramente é simples — a personagem que dá sem esperar receber está revelando algo sobre o que acredita, o que pode perder e o que valoriza mais que o próprio conforto. Mas a generosidade também pode ser controle disfarçado, culpa disfarçada, poder exercido através do dom. A ficção que examina a generosidade sem romantizá-la está sendo honesta.",
    "praia":         "A praia na ficção brasileira é território carregado — não só lazer, mas fronteira entre continente e oceano, entre passado colonial e presente. A praia é onde o Brasil começa e começa de novo. Na ficção, a praia pode ser festa e tragédia, encontro e despedida, abertura e limite.",
    "ponte":         "A ponte na ficção é a estrutura que conecta o que estava separado — duas margens, dois mundos, duas possibilidades. Atravessar uma ponte é decisão: há um antes e um depois. A personagem que hesita na ponte está no ponto de virada da narrativa. A ponte que foi destruída ou que nunca foi construída é uma ferida no espaço que a ficção pode nomear.",
    "hospital":      "O hospital na ficção é o espaço onde o corpo é exposto, onde o controle é cedido, onde o tempo se distorce. O hospital é fronteira entre vida e morte, entre o eu autônomo e o eu dependente. Cenas de hospital são frequentemente de alta intensidade porque o que está em jogo é sempre mais do que o diagnóstico — é quem vai permanecer e quem vai ir.",
    "escola":        "A escola na ficção é onde o sujeito aprende quem é — e o que pode ou não pode ser. A escola que exclui e a que abre são dois cenários literários distintos. A ficção brasileira sobre escola frequentemente fala de classe, de raça e de como o sistema de ensino reproduz ou rompe essas estruturas. A sala de aula é um microcosmo social com suas próprias hierarquias e violências.",
    "igreja":        "A igreja na ficção é onde o sagrado e o poder se encontram — nem sempre para o bem. A religiosidade brasileira na ficção é múltipla: catolicismo colonial, candomblé, umbanda, pentecostalismo, mistura e conflito. A personagem que acredita, a que perdeu a fé, a que usa a fé como instrumento — são posições narrativas com peso histórico próprio.",
    "mercado":       "O mercado na ficção é o espaço onde o valor se negocia — em todos os sentidos. O mercado como lugar físico (feira, mercadão, quitanda) é presença sensorial forte; como sistema (mercado editorial, mercado de trabalho, mercado da arte) é o que organiza quem consegue o quê e a que preço. A ficção que situa suas personagens em relação ao mercado está sendo honesta sobre economia.",
    "anacronia":     "A anacronia é quando a ordem da narrativa não coincide com a ordem dos eventos — quando a história é contada fora da sequência cronológica. O flashback (analepse) volta ao passado; o flashforward (prolepse) antecipa o futuro. A anacronia não é artifício: é a forma de revelar que a memória, o desejo e o medo reorganizam o tempo segundo a lógica emocional, não o calendário.",
    "panorama":      "O panorama narrativo é a visão de conjunto — quando a narração se afasta da cena imediata e apresenta um período mais longo em resumo. 'Nos três anos seguintes, ela viveu sozinha' é panorama. O panorama cobre distância temporal sem entrar em detalhe; a cena entra no detalhe sem cobrir distância. O equilíbrio entre os dois é um dos ritmos fundamentais da ficção.",

    // Teoria, espaço, emoção e publicação — v912
    "mimese":        "A mimese é a imitação do real que a ficção realiza — não cópia, mas representação. Aristóteles via na mimese a função fundamental da arte: através dela, a experiência humana é ordenada, tornada inteligível. A ficção realista opera pela ilusão de que o mundo narrado poderia ter acontecido; a ficção fantástica recusa ou desloca essa ilusão. Mas ambas imitam algo — mesmo que seja a realidade interior ou a realidade impossível.",
    "esboco":        "O esboço é o texto antes de ser texto — a primeira tentativa, as ideias sem forma ainda, o traço grosso que diz 'aqui tem algo'. O esboço certo não precisa ser bom: precisa existir. A escritora que espera o momento perfeito para começar muitas vezes está esperando substituir o esboço por algo que não existe antes dele.",
    "leitor_modelo": "",  // termo composto — não acessível por lookup de palavra simples
    "antologia":     "A antologia reúne textos de vários autores em torno de um critério — época, tema, forma, origem, gênero. Entrar numa antologia é uma forma de publicação com alcance e prestígio próprios: o livro não é seu, mas sua voz está dentro dele ao lado de outras. Antologias constroem cânones — e também os expandem.",
    "coletanea":     "A coletânea é o livro de textos do próprio autor — contos, poemas ou crônicas reunidos. Diferente da antologia (que mistura vozes), a coletânea é um espaço só seu. Organizar uma coletânea é um gesto curatorial: o que entra, o que fica fora, em que ordem — tudo isso cria uma segunda camada de sentido além dos textos individuais.",
    "remorso":       "O remorso é a culpa com passado específico — não o medo vago de ter errado, mas a certeza de que se errou e a consciência clara do que foi. O remorso literary que funciona não resolve rápido: ele fica, ele volta, ele distorce o presente pela sombra do que aconteceu. A personagem que carrega remorso carrega também uma história que o leitor precisa descobrir.",
    "nome":          "O nome na ficção não é só identificação — é destino, é origem, é escolha. A personagem sem nome tem uma condição narrativa; a com nome carrega o peso do que ele sugere. Mudar de nome na narrativa é ato de transformação identitária. E a escritora que escolhe o nome errado para uma personagem vai sentir isso em cada cena: o nome certo ressoa, o errado resiste.",
    "raiz":          "A raiz na ficção é o que a personagem carrega sem ter escolhido — família, terra, língua, história. A personagem sem raiz está à deriva; a que nega as raízes está em conflito com o que não pode apagar. A ficção brasileira frequentemente trata de raízes como questão urgente: de onde viemos, o que foi cortado, o que ainda nutre.",
    "premio":        "O prêmio literário não é só reconhecimento — é acesso: a catálogos, a tradutores, a leitores que não te encontrariam de outra forma. Para a escritora em início de carreira, concorrer a um prêmio é uma forma de circulação. Para a que está há anos publicando, é validação de uma certa tradição. O prêmio literário brasileiro tem suas próprias histórias de quem ficou de fora.",
    "concurso":      "O concurso literário é uma das poucas portas de entrada para publicação sem precisar de agente ou de contato com editora. A submissão anônima (quando existe) iguala as condições formalmente. Mas o concurso também tem seus limites: o que o júri valoriza em determinado momento define o que parece 'bom', e esse critério muda.",
    "praca":         "A praça na ficção é o espaço do encontro público — onde a comunidade existe, onde o individual se torna coletivo, onde as vidas se cruzam sem aviso. A praça como cenário literário traz consigo política e presença: quem está na praça, quem foi expulso dela, quem a atravessa sem se deter.",
    "lago":          "O lago na ficção é a água parada — espelho possível, profundidade desconhecida, silêncio de superfície. Diferente do oceano (imensidão incontrolável) e do rio (passagem e movimento), o lago convida à contemplação e ao que está submerso. O que está no fundo do lago, na ficção, costuma ser o que a narrativa está prestes a trazer à tona.",

    // Arquétipos, estrutura e emoções — v911
    "heroi":         "O herói é a personagem que age quando seria mais fácil não agir — que enfrenta o que as outras personagens evitam, que carrega o peso da história no corpo e nas escolhas. O herói literário contemporâneo brasileiro não é necessariamente o vitorioso: é quem persiste, quem resiste, quem se transforma no encontro com o obstáculo.",
    "heroina":       "A heroína carrega a mesma carga do herói — ação, persistência, transformação — com o peso adicional de existir num mundo que frequentemente não a imagina como protagonista. A ficção que leva a heroína a sério não a protege do conflito nem a diminui: ela tem a mesma agência, os mesmos erros, a mesma capacidade de mudar o que encontra.",
    "vilao":         "O vilão na ficção não é o mal puro — o mais eficaz é quem acredita ter razão. O vilão com motivação coerente e história que explica (sem justificar) o que ele se tornou é mais perturbador do que o mal abstrato. O melhor vilão faz a leitora pensar: em outras circunstâncias, isso poderia ter sido qualquer um.",
    "mentor":        "O mentor na ficção é quem passa o que sabe para que outro possa ir além. Pode ser figura paterna, professora, amiga mais velha ou qualquer personagem que detenha experiência e a repasse. O mentor clássico é sacrificável — existe para que o herói cresça e frequentemente some quando a aprendizagem termina.",
    "prazer":        "O prazer na ficção é frequentemente subestimado — como se só o sofrimento merecesse atenção literária séria. Mas o prazer revela personagem: o que uma pessoa busca para sentir bem, o que a satisfaz, o que ela não consegue largar mesmo quando sabe que deveria. O prazer como motor narrativo é poderoso e honesto.",
    "dor":           "A dor na ficção não é decoração nem prova de seriedade literária — é informação sobre quem a personagem é e o que o mundo fez com ela. A dor que não muda a personagem é estética vazia; a dor que muda, que a força a agir diferente ou a se tornar outra pessoa, é o que a narrativa estava esperando para acontecer.",
    "revolta":       "A revolta na ficção transita entre o particular e o político — a personagem não está só brava: está brava porque algo que aconteceu com ela não deveria acontecer com ninguém. A revolta como motor narrativo aponta para uma injustiça. A ficção que toma a revolta a sério está falando sobre o mundo, não só sobre a personagem.",
    "sequencia":     "A sequência é um grupo de cenas conectadas por lógica interna — o que começa numa cena e só termina quando a sequência fecha. Pensar em sequências ajuda a estruturar o ritmo médio da narrativa: o quanto de tempo a história vai passar num mesmo arco antes de mudar de registro.",
    "parte":         "A parte é a divisão maior que o capítulo — quando a história tem seções que representam períodos, perspectivas ou movimentos distintos. Dividir em partes é declarar que existe uma virada estrutural significativa entre elas: algo muda de escala ou de natureza. A parte promete ao leitor que o livro vai se transformar.",
    "escuta":        "A escuta na ficção é uma habilidade antes de ser um tema. A personagem que escuta — de verdade, com presença — percebe o que as outras personagens perdem. E a escritora que escuta as vozes que ainda não foram contadas está fazendo uma escolha política e estética ao mesmo tempo. Escutar é preceder o que se vai escrever.",
    "paralelismo":   "O paralelismo é a repetição de estrutura em posições diferentes — 'ela entrou, ele saiu; ela falou, ele calou'. Na ficção, é ferramenta de ritmo e de significado ao mesmo tempo: a semelhança de forma convida o leitor a comparar o conteúdo. Quando bem executado, o paralelismo amplifica; quando excessivo, vira maneirismo.",

    // Ofício, retórica e comunidade de escrita — v910
    "ousadia":       "A ousadia na ficção é a disposição de ir além do esperado — de forma, de tema, de perspectiva. A escritora ousada não é a que choca por choque; é a que vai onde seria mais fácil não ir. A ousadia tem fundamento: é escolha informada, não descuido. Na personagem, a ousadia é o que a faz agir quando seria mais seguro não agir.",
    "timidez":       "A timidez na personagem não é fraqueza — é posição social e história encarnada. A personagem tímida aprendeu que é mais seguro não se expor, não ocupar espaço, não falar primeiro. Mas a narrativa que só descreve a timidez sem questionar por que ela existe está perdendo a camada mais rica: o que fez esse personagem encolher.",
    "envelhecimento": "Envelhecer na ficção é acumular — experiência, perda, perspectiva, corpo que muda. A personagem que envelhece dentro da narrativa está numa das transformações mais honestas que a ficção pode mostrar. O envelhecimento não é declínio: é revisão. O que parecia importante vai perdendo peso; o que parecia menor vai ganhando.",
    "deserto":       "O deserto na ficção é o espaço da despossessão — sem água, sem cobertura, sem o que dá conforto. Mas também é o espaço da clareza: sem distração, a personagem encontra o que carrega de essencial. O deserto como ordálio (prova que transforma) é motivo literário antigo; o deserto como estado interior (a personagem que secou) é contemporâneo.",
    "oficina":       "A oficina literária é o espaço de prática com outros — onde o texto existe antes de estar pronto, onde o erro é parte do processo. Na ficção sobre escritoras, a oficina aparece como comunidade e como tensão: as vozes que ajudam e as que inibem. Para o Escrevaral, a oficina é a metáfora fundadora: o lugar onde se aprende fazendo, em companhia.",
    "editora":       "A editora na ficção aparece raramente como personagem — mas é presença estruturante para quem escreve. A decisão de publicar ou recusar, de apostar em determinada voz, de formatar o que sai: tudo isso é poder sobre o que chega ao leitor. A escritora que navega o mundo editorial está em território de negociação de quem ela é e como quer aparecer.",
    "leitora":       "A leitora é o destino — não o editor, não o prêmio, não a crítica. A escritora que tem sua leitora em mente enquanto escreve está fazendo uma escolha de endereçamento: para quem esse texto existe? Quem vai se ver nele? A leitora imaginada (ou ignorada) molda o tom, o vocabulário, o nível de explicação e o que pode ficar subentendido.",
    "critica":       "A crítica literária não é julgamento de valor — é leitura rigorosa que abre o texto para mais do que ele diz imediatamente. A crítica que funciona ilumina sem substituir a experiência; a que não funciona reduz o texto a confirmação de uma tese. Para a escritora em formação, a crítica é ferramenta de leitura tanto quanto de avaliação.",
    "resenha":       "A resenha é a crítica que apresenta — ela fala do livro para quem não leu e dá ao leitor ferramentas para decidir se vai ler. Uma boa resenha não resume: situa, ilumina, avalia com critério explicitado. Uma boa resenha também é um texto em si, não apenas um relatório sobre outro texto.",
    "personificacao": "A personificação atribui características humanas a seres ou objetos não-humanos — 'o vento gritava', 'a cidade dormia'. Na ficção, a personificação é recurso de animação do ambiente: o mundo ao redor da personagem passa a ter agência e caráter. Usada com discrição, aproxima o leitor; usada em excesso, vira afetação.",
    "alegoria":      "A alegoria conta uma história cujo significado real é outro — a narrativa opera em dois registros ao mesmo tempo. Fábulas são alegorias; algumas ficções científicas também. A alegoria exige consistência interna: a metáfora estrutural precisa se sustentar do começo ao fim, ou a estrutura colapsa. A alegorização forçada (quando o texto claramente quer ser lido de outro jeito) é uma das formas de leitura mais equivocadas da ficção.",
    "interpretacao": "A interpretação é o que o leitor faz — e é legítima mesmo quando difere do que a escritora pretendia. O texto, uma vez publicado, existe além das intenções de quem o criou. A escritora pode escolher ser mais ou menos explícita, mas não pode controlar o que o leitor traz. A interpretação não é erro: é o texto funcionando no encontro com uma outra experiência.",

    // Afeto, dimensões sociais e ambiente — v909
    "geracao":       "A geração na ficção é o tempo compartilhado — a experiência histórica e cultural que molda quem nasceu no mesmo período. Personagens de gerações diferentes entendem o mundo de formas incompatíveis, e esse conflito geracional é motor narrativo poderoso: não é só preferência, é epistemologia.",
    "privilegio":    "O privilégio na ficção é o que uma personagem tem acesso sem precisar lutar por isso — e frequentemente sem perceber. A personagem privilegiada que descobre seu privilégio e a que recusa vê-lo são duas histórias radicalmente diferentes. O privilégio aparece na ficção pelo que a personagem não precisa fazer, não pelo que faz.",
    "diversidade":   "A diversidade na ficção é a presença de múltiplas perspectivas, não como representação decorativa, mas como arquitetura da narrativa. Uma narrativa diversa muda quando diferentes vozes entram — o que é considerado normal, o que é visto como problema, o que é esquecido. Diversidade sem conflito é decoração; diversidade que tensiona o texto é literatura.",
    "representatividade": "Representatividade na ficção é a possibilidade de que grupos historicamente apagados se vejam como protagonistas — não como coadjuvantes, não como problema a ser resolvido. A pergunta que a representatividade coloca é: para quem essa história foi escrita? E: quem poderia se imaginar dentro dela?",
    "afeto":         "O afeto é a economia emocional das relações — o que circula entre pessoas, o que sustenta, o que faz falta quando some. Na ficção contemporânea brasileira, o afeto é frequentemente objeto central: o afeto como forma de resistência, como política do cotidiano, como o que permanece onde o sistema não quis que houvesse.",
    "cuidado":       "Cuidar é ato que a ficção frequentemente subestima por associá-lo ao doméstico e ao feminino. Mas o cuidado na narrativa é poder e responsabilidade: quem cuida detém a vida de quem é cuidado. A ficção que trata o cuidado com seriedade está reconhecendo que atos ordinários têm peso extraordinário.",
    "crueldade":     "A crueldade na ficção não precisa ser física ou espetacular — pode ser a indiferença calculada, a palavra exata para ferir, o silêncio que pune. A personagem cruel que sabe que é cruel é diferente da que não percebe o que faz. Ambas são narrativamente ricas, mas de formas distintas: uma é vilania consciente, a outra é horror cotidiano.",
    "bondade":       "A bondade é difícil de escrever sem cair em santidade ou ingenuidade. A personagem boa que funciona tem custos: ela abre mão, ela sofre pelo que absorve, ela escolhe a bondade quando seria mais fácil não fazê-lo. A bondade que não custou nada não é bondade literária — é convenção de romance de capa.",
    "ambicao":       "A ambição literária é o desejo que excede o que foi dado — querer mais do que o destino prescreveu. Na ficção, a personagem ambiciosa é frequentemente trágica: alcança o que queria e descobre que o preço foi alto demais, ou não alcança e descobre que a busca foi o que a definiu. A ambição sem fricção é fantasia de poder; com fricção é narrativa.",
    "oceano":        "O oceano na ficção é a imensidão que a personagem não controla — o que é mais velho, mais fundo e mais indiferente do que qualquer drama humano. O oceano pode ser liberdade, ameaça, passagem, perda ou testemunha. Na ficção brasileira, o oceano carrega a memória do tráfico, da travessia forçada, do que cruzou o Atlântico sem escolha.",

    // Espaço simbólico, gênero social e ficção — v908
    "porta":         "A porta na ficção é limiar entre estados — entre o dentro e o fora, entre o conhecido e o desconhecido, entre o que é e o que poderia ser. Abrir uma porta é um ato de coragem ou de curiosidade; fechar é proteção ou recusa. A porta que ninguém abre na história é tão narrativa quanto a que é aberta.",
    "espelho":       "O espelho na ficção é reconhecimento, confronto ou ilusão. A personagem diante do espelho está se vendo — mas o que vê é sempre uma interpretação. Na ficção contemporânea, o espelho pode ser literal ou pode ser outra personagem que reflete o que a protagonista não quer ver. O espelho que distorce revela mais do que o que reproduz fielmente.",
    "adolescencia":  "A adolescência na ficção é o tempo em que a personagem descobre que as regras do mundo foram feitas sem ela. É o momento de primeira ruptura, de identidade em construção, de intensidade sem filtro. A ficção de formação clássica (bildungsroman) narra esse arco; a ficção contemporânea brasileira o narra com vozes que a tradição europeia frequentemente ignorou.",
    "sexualidade":   "A sexualidade na ficção não é só o que acontece entre personagens: é como a personagem se relaciona com o próprio desejo. O desejo que não pode ser dito, a sexualidade que é fonte de vergonha ou de alegria, o corpo que quer o que a mente ainda não nomeou — tudo isso é território narrativo rico e frequentemente pouco explorado com honestidade.",
    "feminismo":     "O feminismo na ficção não é pauta declarada — é olhar. A escritora que olha com olhos feministas para sua personagem está perguntando o que ela quer, o que lhe foi negado, como o mundo a vê diferente do que ela é. Ficção feminista não precisa ter manifesto: precisa ter personagens mulheres com interior complexo e direito à contradição.",
    "patriarcado":   "O patriarcado na ficção é o sistema que organiza quem tem poder de nomear, decidir e escapar de consequências. Aparece nas relações familiares, no espaço público, na distribuição do que é contado como importante. A ficção que o expõe não precisa nomeá-lo: precisa mostrar seus efeitos na vida específica de personagens específicas.",
    "narrativa":     "A narrativa é a história organizada para ser contada — não o conjunto de eventos, mas a seleção, ordem e perspectiva com que são apresentados. A mesma história pode ser mil narrativas diferentes dependendo de quem conta, de onde, e para quem. Entender narrativa é entender que toda história é construída, nunca simplesmente transcrita.",
    "realismo":      "O realismo literário é o compromisso com o mundo como ele é — não o registro fotográfico (que é impossível), mas a ilusão de que o texto poderia ter acontecido. O realismo exige verossimilhança: personagens que agem como pessoas agem, consequências que fazem sentido, mundos que obedecem a regras que o leitor reconhece.",
    "fantasia":      "A fantasia literária não é evasão — é outro modo de verdade. Ao tornar impossível o que é, a fantasia frequentemente diz o que o realismo não pode. A magia que opera na ficção fantástica é governada por regras internas consistentes; a fantasia que não obedece às próprias regras é arbitrária, não imaginativa.",
    "sugestao":      "A sugestão é o que o texto deixa que o leitor complete. A ficção que sugere confia no leitor para chegar ao que não foi dito. A sugestão bem calibrada é mais poderosa do que a declaração porque o leitor chega ao significado por si mesmo — e o que o leitor constrói é mais seu do que o que foi simplesmente dito.",
    "ambiguidade":   "A ambiguidade é quando o texto sustenta duas leituras ao mesmo tempo sem decidir por uma. A ficção que sustenta ambiguidade resiste à resolução fácil: não responde onde poderia, deixa aberto onde poderia fechar. A ambiguidade que funciona não é indecisão da escritora — é confiança de que a complexidade não precisa ser simplificada.",
    "prosa":         "Prosa é a forma de escrita que não segue métrica ou rima regulares — e que inclui ficção, ensaio, crônica, memória. A prosa tem ritmo, mas é um ritmo que não obedece a contagem de sílabas: é o ritmo da frase, do parágrafo, da alternância entre longo e curto. A prosa bem escrita é invisível — o leitor não pensa na forma enquanto lê o conteúdo.",

    // Técnica, contexto social e espaço — v907
    "subtexto":     "O subtexto é o que está acontecendo sob o que é dito. Em cena de diálogo, o subtexto é frequentemente mais importante do que o texto: o que os personagens não dizem, o que tentam esconder, o que revelam sem querer. A escrita de alto subtexto confia no leitor para perceber o que não está explícito.",
    "raca":         "Raça na ficção brasileira é presença constante, mesmo quando não é nomeada — e especialmente quando não é. A personagem racializada, o olhar que a avalia, o espaço que a exclui ou inclui de forma condicionada: tudo isso é texto. A ficção que escolhe não nomear raça está fazendo uma escolha política tanto quanto a que nomeia.",
    "classe":       "Classe social na ficção aparece em detalhe: o que a personagem pode comprar, onde mora, como fala, o que imagina como possível para si. A classe não precisa ser declarada — ela aparece na roupa, no vocabulário, no acesso, na expectativa. A ficção que ignora classe está implicitamente assumindo uma.",
    "opressao":     "A opressão literária não precisa ser visível para ser real — pode ser o que se espera de um personagem, o que ela não pode recusar, o que é considerado normal para ela e não para outros. A ficção de opressão mais honesta não é a do grito: é a do cotidiano em que o extraordinário é considerado trivial.",
    "colonialismo": "O colonialismo como estrutura — não só histórica, mas presente na língua, no estético, no que é considerado universal — atravessa a literatura brasileira de formas que a escritora precisa conhecer para entender o que reproduz e o que subverte. Escrever colonialismo é escolher de qual lado do olhar se está.",
    "racismo":      "O racismo na ficção não precisa aparecer como violência explícita — pode ser a ausência, a invisibilidade, o elogio envenenado, o espaço que a personagem não deveria ocupar. A ficção que aborda racismo com honestidade é a que não simplifica: o racismo cotidiano é mais difuso e mais devastador do que o racismo espetacular.",
    "cidade":       "A cidade na ficção é personagem — barulhenta, indiferente, sedutora, violenta. A relação do personagem com a cidade (se ela pertence, se é estrangeira, se encontrou seu lugar ou foi empurrada para a margem) revela classe, raça, geração. A cidade na ficção brasileira carrega a tensão entre visibilidade e exclusão.",
    "rua":          "A rua é o espaço público por excelência — onde tudo se mistura e onde as hierarquias se revelam. Para algumas personagens, a rua é liberdade; para outras, é perigo. A rua à noite é diferente da rua de manhã. A rua que a personagem pode ou não percorrer com segurança diz tudo sobre quem ela é e onde está.",
    "casa":         "A casa na ficção é o espaço da intimidade — mas também da prisão, do abrigo, da herança, da memória. A casa que a personagem habita modela o que ela pensa ser possível. Casas na ficção brasileira são frequentemente palco de afeto e violência ao mesmo tempo: o lugar que deveria ser seguro e às vezes não é.",
    "infancia":     "A infância como tempo narrativo é lugar de formação — o que aconteceu ali molda quem a personagem se tornou. A ficção que retorna à infância está, frequentemente, buscando a origem de uma ferida ou a raiz de um desejo. A criança que a personagem foi é frequentemente mais honesta do que o adulto que ela se tornou.",
    "velhice":      "A velhice na ficção é o tempo em que os balanços se tornam inevitáveis. A personagem velha tem passado denso e futuro estreito — e essa assimetria cria perspectiva única. A ficção que trata a velhice com honestidade não é aquela que romantiza nem a que deplora: é a que mostra o que significa saber que já viveu mais do que vai viver.",
    "janela":       "A janela na ficção é limiar entre dentro e fora — o que a personagem observa sem participar, o que imagina além, o que deixa entrar (luz, chuva, som) sem abrir a porta. A personagem que olha pela janela está em estado de contemplação, desejo ou recusa. A janela que a personagem não consegue abrir é símbolo de confinamento.",

    // Psicologia, caráter e técnica literária — v906
    "depressao":    "A depressão na ficção não é tristeza amplificada — é ausência de cor, de energia, de desejo. A personagem deprimida não sofre de forma intensa: ela sofre de forma apagada. O desafio de escrever depressão é encontrar a linguagem para o que é ausência — o que não acontece, o que não é sentido, o que não importa.",
    "ansiedade":    "A ansiedade literária é o medo sem objeto claro — ou com objeto demais. A personagem ansiosa pensa em loop, antecipa o pior, encontra ameaças onde não há. Escrever ansiedade é desafio de ritmo: a frase ansiosa pode se acelerar, ramificar, recomeçar. A ansiedade como estado narrativo cria leitores ansiosos — use com consciência.",
    "torpor":       "O torpor é o estado entre estar e não estar — o corpo presente, a atenção ausente. Na ficção, a personagem em torpor está sendo arrastada pela narrativa sem agir: ela responde, mas não escolhe. Torpor depois de trauma ou perda é psicologicamente honesto; torpor sem causa é personagem passiva.",
    "apatia":       "A apatia é quando nada importa o suficiente para mover a personagem. Diferente do torpor (que é lentidão), a apatia é ausência de motivação. Uma personagem apática é desafio narrativo: como mover alguém que não quer ser movida? A resposta frequentemente é colocar algo em risco que ela achava que não ligava mais.",
    "tedio":        "O tédio na ficção contemporânea ganhou status — não é mais o anteposto da ação, mas um estado com valor próprio. A personagem entediada está disponível para o que vier, mesmo que não queira nada. O tédio pode ser o estado antes da revelação, da crise, ou da decisão que muda tudo — o silêncio antes do ruído.",
    "carater":      "O caráter não é o que a personagem diz que é: é o que ela faz quando o custo é alto. O personagem de boa índole que, sob pressão, age mal, revela que o caráter é mais frágil do que parecia. A ficção que testa o caráter das personagens é a que confia no conflito para revelar quem elas são.",
    "personalidade": "A personalidade é a soma de hábitos, reações e tendências que fazem uma personagem reconhecível. A personalidade forte é aquela que aparece mesmo nos momentos menores — a forma de segurar o café, a hesitação antes de responder, o jeito de mudar de assunto. Personalidade não precisa ser extrema para ser específica.",
    "dignidade":    "A dignidade na ficção é o que a personagem não abre mão — mesmo quando deveria, ou quando custa. Ela pode ser limitante (a personagem que prefere sofrer a pedir ajuda) ou nobre (a personagem que mantém seus valores quando teria tudo a perder ao perdê-los). A dignidade ferida é um dos motores mais poderosos da narrativa.",
    "honra":        "Honra é o código de comportamento que a personagem segue, frequentemente herdado e raramente questionado — até que a trama force o questionamento. A personagem que age por honra quando o resultado seria melhor sem ela é aquela que o leitor admira e teme ao mesmo tempo. Honra pode ser virtude ou armadilha.",
    "arrogancia":   "A arrogância literária mais interessante não é a do vilão que se sabe mau: é a do personagem que genuinamente acredita saber mais, ser melhor, merecer mais. Essa arrogância cria conflito horizontal (com personagens que discordam) e cria o terreno para a queda — e a queda do arrogante é uma das formas mais antigas de resolução narrativa.",
    "simbolo":      "Um símbolo na ficção é um objeto, imagem ou gesto que carrega significado além do literal. Símbolos que funcionam crescem com a narrativa — o leitor entende depois, não antes. Símbolos que não funcionam são decoração óbvia. A diferença: o símbolo orgânico emerge do que a história já precisa ser; o símbolo decorativo é colocado para parecer profundo.",
    "imagem":       "A imagem literária é a percepção concreta que cria algo além do concreto. 'O sol se punha' é descrição; 'o céu sangrava' é imagem. Imagens funcionam quando ativam sentidos e associações que a descrição direta não alcança. A proliferação de imagens pode ser riqueza ou ruído — depende de quantas a narrativa pode sustentar.",

    // Ofício da escrita e tempo narrativo — v905
    "lingua":        "A língua na literatura não é só veículo — é material. Na ficção brasileira contemporânea, a língua tem sotaque, classe, região, geração. A personagem que fala diferente de quem conta revela a distância social. A escritora que decide como a língua aparece no texto está fazendo escolhas políticas tanto quanto estéticas.",
    "escrever":      "Escrever é o ato que o Escrevaral apoia — mas é também ato que aparece na ficção. A personagem que escreve (diário, carta, livro) está revelando o que não consegue dizer de outra forma. A escrita dentro da ficção é sempre mais íntima do que a fala — e o que é escrito e não enviado tem peso próprio.",
    "ler":           "Ler na ficção tem função narrativa quando muda quem leu. A personagem que termina um livro diferente de quando começou está dentro da tradição mais antiga da ficção: o poder transformador da leitura. Ler pode ser fuga, resistência, formação, ou o encontro com algo que a personagem não tinha palavras para antes.",
    "criar":         "Criar na ficção é o ato de fazer algo que não existia — e a personagem criativa tem uma relação particular com o mundo: vê possibilidade onde outros veem problema, e sofre de forma específica quando a criação falha. A escritora que narra personagens que criam está narrando o processo dela própria de fora.",
    "livro":         "O livro como objeto na ficção é símbolo condensado. O livro que a personagem guarda, que ela queimou, que ela não terminou, que mudou sua vida — cada um desses usos carrega significado além da trama. O livro que aparece na ficção raramente é neutro: é herança, arma, companhia, ou portal.",
    "texto":         "Na ficção metaliterária, o 'texto' aparece como objeto de reflexão. Mas mesmo na ficção mais direta, 'texto' é o que a escritora controla: o que escolhe colocar e como. Toda decisão sobre o texto (o que entra, o que sai, o que fica ambíguo, o que é claro) é uma posição sobre o que importa na história.",
    "sucesso":       "O sucesso na ficção é mais perigoso do que o fracasso. A personagem que consegue o que queria descobre que queria outra coisa, ou que o preço foi alto demais, ou que nada mudou no que importava. O sucesso sem custo é resolução sem tensão; o sucesso com revelação é onde a narrativa fica.",
    "manha":         "A manhã na ficção é o tempo da possibilidade — o que recomeça, o que pode ser diferente. Mas também pode ser o tempo do enfrentamento: o dia que começa e a personagem ainda precisa lidar com o que estava tentando esquecer. A manhã depois de uma crise tem textura própria — luz diferente, corpo diferente.",
    "frase":         "A frase é a unidade básica do ritmo na ficção. Frases curtas aceleram; frases longas dilatam. A mudança de ritmo de frase é um dos instrumentos mais discretos e eficazes de controle do tempo narrativo. Uma frase inesperadamente curta depois de um longo parágrafo chama a atenção sem gritar.",
    "paragrafo":     "O parágrafo é unidade de pensamento na prosa — uma ideia, uma cena, um momento. Parágrafo curto é urgência ou ênfase; parágrafo longo é mergulho. A decisão de onde quebrar o parágrafo é uma das escolhas mais silenciosas e mais rítmicas da escrita. Mudar de parágrafo é respirar.",

    // Corpo, interioridade e impulso narrativo — v904
    "corpo":         "O corpo na ficção é território de experiência — não é só o que a personagem parece, mas o que ela sente por dentro do que parece. O corpo que envelhece, que adoece, que deseja, que treme, que cansa, que resiste, que falha. Escrever com o corpo é escrever antes da racionalização: o que acontece no nervo antes do pensamento.",
    "mente":         "A mente na ficção é o espaço do pensamento — mas pensamento raramente é linear. O monólogo interior, o fluxo de consciência, o pensamento que interrompe a ação — todos são tentativas de capturar o que acontece dentro. A mente de um personagem é onde o leitor mora quando a ficção está funcionando.",
    "alma":          "Na ficção, alma não precisa ser religiosa — é a parte de um personagem que não se explica só pela psicologia. É o que permanece depois de tudo o que aconteceu com ela. A 'alma' literária é frequentemente o que resiste, o que não foi quebrado, ou inversamente, o que foi quebrado de forma irreparável.",
    "coracao":       "O coração na ficção é metonímia do afeto — o que a personagem sente de verdade, antes de filtrar pela razão. 'O coração dela acelerou' pode ser clichê ou pode ser o único jeito honesto de descrever o que aconteceu. O coração que a personagem tenta esconder revela mais do que o que ela decidiu mostrar.",
    "confianca":     "A confiança é construída em cena, não declarada. 'Ela confiava nele' é atalho; 'ela mostrou as cartas' é confiança em ação. Na ficção, a confiança tem história — foi conquistada ou herdada, e a narrativa pode destruí-la. A perda de confiança é uma das rupturas mais difíceis de recuperar na ficção e na vida.",
    "laco":          "Laço é o vínculo que não foi escolhido mas existe — ou que foi escolhido com tanto peso que já não é fácil desfazer. Na ficção, o laço entre personagens é o que está em jogo quando há conflito. Romper um laço custa; manter um laço que deveria ser rompido também. A tensão entre os dois é motor narrativo.",
    "missao":        "A missão dá ao personagem direção e propósito. Pode ser grande (salvar alguém, revelar uma verdade) ou pequena (chegar a tempo, não mentir desta vez) — o que importa é que ela organiza as escolhas. A missão que muda no meio do caminho é quando a história realmente começa.",
    "chamado":       "O chamado é o momento em que a narrativa convida a personagem a ser diferente do que era. Pode ser uma crise, uma perda, uma oportunidade, uma descoberta. O que define o arco é o que a personagem faz com o chamado — atende, recusa, demora. A recusa do chamado adiada é frequentemente mais interessante do que a aceitação imediata.",
    "vontade":       "A vontade é a força que move a personagem quando o ambiente resiste. Na ficção, a personagem sem vontade é passiva — acontece com ela, não age. A vontade pode ser explícita (ela quer algo claro) ou latente (ela se move sem saber bem por quê). A ficção descobre a vontade latente antes da personagem.",
    "fracasso":      "O fracasso define a personagem pelo que ela faz depois. Fracassar não é o fim da narrativa — é o teste. A personagem que desmorona com o fracasso e a que busca recomeçar são duas histórias diferentes. O fracasso interessante na ficção não é injusto: tem lógica interna, mesmo que a personagem não veja qual.",
    "humilhacao":    "A humilhação é a ferida pública — a dor que outros viram. Na ficção, a humilhação cria dívida narrativa: a personagem que foi humilhada vai carregar isso, e o texto vai cobrar. O que ela faz com a humilhação — vingança, superação, paralisia, transformação — define quem ela é.",
    "instinto":      "O instinto é a decisão antes da decisão — o que o corpo sabe antes que a mente processe. Na ficção, o instinto revela o que a personagem não admite saber. A personagem que vai contra o próprio instinto está fazendo uma escolha poderosa — e a ficção precisa mostrar o custo.",

    // Vínculos, pertencimento e processo criativo — v903
    "familia":       "A família na ficção é estrutura de poder, afeto e ferida. Raramente é neutral — ela condiciona, aprisiona, acolhe ou devora. Na literatura brasileira contemporânea, a família é frequentemente onde a classe, a raça e o gênero se manifestam ao mesmo tempo. Escrever família é escrever sistema.",
    "comunidade":    "A comunidade é o que existe entre o indivíduo e a sociedade abstrata. Na ficção, a comunidade pode ser local (uma vila, um bairro, uma aldeia), afetiva (um grupo, uma tribo) ou imaginada (uma diáspora, uma religião). A personagem que pertence a uma comunidade tem obrigações que a personagem isolada não tem.",
    "pertenca":      "Pertencer é ter lugar, ser reconhecida por um grupo, sentir que se é parte de algo. Na ficção, a personagem que não pertence carrega essa ausência como ferida ou como liberdade — às vezes as duas coisas ao mesmo tempo. A busca por pertencimento é um dos motores narrativos mais universais.",
    "isolamento":    "O isolamento pode ser escolhido ou imposto, e a ficção precisa distinguir os dois. A personagem que se isola por escolha tem agência; a que é isolada perde. O isolamento como estado narrativo concentra a atenção: quando a personagem só tem a si mesma, o que ela pensa e faz revela quem ela é sem mediação.",
    "rivalidade":    "Rivais compartilham um objetivo e um espaço — e isso cria tensão horizontal, diferente da relação vertical de antagonista/protagonista. A rivalidade interessante tem respeito junto com a competição: os dois querem o mesmo e reconhecem no outro algo que vale enfrentar. Rivalidade sem respeito vira hostilidade simples.",
    "fluir":         "O estado de fluxo da escrita — quando as palavras chegam sem esforço consciente — é o que toda escritora busca e ninguém controla. Na ficção de escritoras, o fluir aparece como metáfora do estado ideal. O que bloqueia o fluxo (medo, comparação, perfeccionismo) é tão narrativo quanto o que o libera.",

    // Verbos de interação e estados físicos — v902
    "chamar":       "Chamar é evocar a presença do outro — pelo nome, pelo gesto, pelo olhar. Na ficção, quem chama está precisando. O que a personagem chama (e se o chamado é atendido) revela a estrutura de poder e afeto da cena. Chamar sem resposta é solidão; chamar com resposta errada é conflito.",
    "ouvir":        "Diferente de escutar (que é intencional), ouvir acontece ao personagem. O que chega ao ouvido sem ser buscado — o som que vaza pela parede, as palavras que não eram para ela — costuma mudar o rumo da narrativa. A personagem que ouve o que não devia é a mais rica em escolhas.",
    "abracar":      "O abraço na ficção é um dos gestos mais densos. Pode ser consolo, contenção, domínio, despedida, reconciliação — e a ficção precisa decidir qual, porque o mesmo gesto físico carrega significados opostos dependendo de quem abraça e de que forma. Um abraço que a personagem não conseguiu dar é às vezes mais poderoso do que o que aconteceu.",
    "gritar":       "O grito é o limite do suportável — quando o que estava contido precisa sair com força. Na ficção, o grito raro é mais poderoso do que o grito constante. A personagem que finalmente grita depois de páginas de contenção tem mais peso do que aquela que grita em toda cena de tensão. O silêncio antes do grito muitas vezes vale mais do que o próprio grito.",
    "vencer":       "Vencer na ficção não é o mesmo que ganhar. Vencer implica adversário, esforço, custo. A personagem que vence pagou um preço — e a ficção honesta mostra o preço. Vitória sem custo é fantasia de resolução; vitória com custo é narrativa de personagem.",
    "cair":         "Cair é perder o equilíbrio — físico ou metafórico. A queda da personagem (moral, social, emocional) é um dos movimentos narrativos mais antigos. O que a fez cair, como ela cai, e se ela levanta (e como) define o arco. A queda literal pode espelhar a metafórica sem precisar ser óbvio.",
    "subir":        "Subir é esforço, ascensão, ambição. Na ficção, a personagem que sobe (de classe, de posição, de reconhecimento) costuma pagar com algo que antes tinha. O contraste entre o que ela ganhou e o que perdeu é onde a narrativa de ascensão mais importa — e onde mais frequentemente derrapa para a moralidade simples.",

    // Jornada, atmosfera e emoção moral — v901
    "viagem":        "A viagem literária move a personagem no espaço e revela o que ela não sabia sobre si mesma. A viagem clássica tem partida, caminho e chegada — e a chegada raramente é o lugar de onde saiu. Viagem não precisa ser física: pode ser interior (uma psicoterapia, um luto) ou simbólica (um sonho, um livro lido).",
    "jornada":       "Diferente da viagem (que é movimento no espaço), a jornada é narrativa de transformação. A estrutura de jornada do herói de Joseph Campbell (chamado, recusa, partida, provas, retorno) é um mapa que pode ser usado ou subvertido — mas é útil conhecer antes de decidir o que fazer com ele.",
    "amor":          "Amor como substantivo na ficção é o estado — o que a personagem está dentro. Diferente de 'amar' (o ato), o amor é condição. Essa condição molda como a personagem vê, o que tolera, o que arrisca. Na ficção contemporânea, o amor que mais importa raramente é o romântico isolado: é o que existe junto com outros conflitos.",
    "ciume":         "O ciúme é medo de perda vestido de possessividade. A personagem ciumenta raramente sabe que é medo o que está sentindo — e essa falta de consciência é o que torna o ciúme dramaticamente rico. Ciúme sem reflexão interna é comportamento; ciúme com reflexão interna é psicologia.",
    "culpa":         "A culpa na ficção precisa de objeto: a personagem é culpada de algo específico. A culpa difusa (sentir-se culpada sem saber de quê) é estado — e pode ser interessante, mas é mais difícil de narrar. Culpa é o que a personagem não consegue desfazer: ela carrega o peso do que fez e o que isso mudou.",
    "vergonha":      "A vergonha é diferente da culpa: a culpa diz 'fiz uma coisa ruim', a vergonha diz 'sou uma coisa ruim'. Na ficção, a personagem com vergonha faz de tudo para que ninguém veja o que ela sente que é. Essa dinâmica — esconder, evitar, fugir da exposição — é motor narrativo poderoso.",
    "arrependimento": "O arrependimento olha para trás: a personagem vê o que fez e sabe que escolheria diferente. Na ficção, o valor do arrependimento está no que a personagem faz com ele: paralisa, repara, ou recomeça. Arrependimento sem consequência é sentimento sem narrativa.",
    "silencio":      "O silêncio na ficção não é ausência — é presença de outra natureza. O que não é dito carrega tanto quanto o que é dito. O silêncio entre personagens pode ser proteção, punição, cumplicidade ou incomunicabilidade. Aprender a escrever o silêncio — o que o circunda, o que ele pesa — é uma das habilidades mais avançadas da ficção.",
    "luz":           "A luz na ficção é revelação — literal e metafórica. Onde a luz cai (e onde não cai) organiza a percepção da cena. A luz da manhã tem qualidade diferente da da tarde, e ambas são diferentes da luz artificial. A escritora que controla a luz da cena controla o que o leitor pode ver e o que fica na sombra.",
    "terra":         "Terra como chão, como solo, como território de origem. Na literatura brasileira, a terra tem dimensão profunda: campo e cidade, latifúndio e sem-terra, quilombo e aldeia. A personagem que tem terra (ou que perdeu a terra) carrega uma relação com o espaço que não é só geográfica.",

    // Verbos de desejo, conflito e transformação — v900
    "amar":         "O amor na ficção é ação, não sentimento. Mostrar amor é mostrar o que a personagem faz por causa dele — o que ela abre mão, o que suporta, o que arrisca. 'Ela o amava' é um atalho que a ficção pode usar — mas 'ela ficou mesmo assim' é amor em cena.",
    "odiar":        "O ódio literário mais interessante não é o ódio ao vilão: é o ódio com culpa, o ódio que a personagem não quer ter mas tem, o ódio que começa a parecer com algo mais. O ódio sem complexidade é simplificação. O ódio que a personagem tem de si mesma pode ser o mais poderoso de todos.",
    "querer":       "Querer é o motor mais básico da ficção: a personagem quer algo, e a narrativa é o que acontece entre o querer e o obter (ou não). O que a personagem quer na superfície raramente é o que ela quer no fundo — e a distância entre os dois é onde o caráter mora.",
    "desejar":      "Diferente de querer (que é mais objetivo), desejar tem corpo e urgência. O desejo literário é aquele que a personagem não escolheu ter — ele chegou. Desejar outra pessoa, um lugar, uma vida diferente, uma versão de si — todos esses desejos revelam o que está faltando e o que poderia mudar.",
    "buscar":       "A busca organiza a narrativa em torno de uma falta. O que a personagem busca — uma pessoa, uma resposta, uma identidade, um lugar — define seus movimentos e suas escolhas. Mas as buscas mais interessantes são as que mudam de objeto: a personagem começa buscando uma coisa e descobre que queria outra.",
    "fugir":        "A fuga na ficção não é covardia: é decisão. Quem foge está escolhendo — o que deixa para trás, o que ainda quer preservar. Fuga pode ser de uma pessoa, de um lugar, de uma memória, de uma versão de si. A fuga que a personagem não consegue completar é mais reveladora do que a que termina em outro lugar.",
    "lutar":        "Lutar não precisa ser físico — na maioria da ficção, é interno ou relacional. Lutar é persistir apesar da resistência: do mundo, de outra pessoa, de si mesma. A cena de luta bem escrita tem um adversário claro e uma coisa em jogo — quando nem o adversário nem o jogo são claros, a cena perde tensão.",
    "insistir":     "A insistência revela caráter. A personagem que insiste quando deveria parar — ou que não insiste quando deveria — está tomando uma decisão que define quem ela é. A insistência pode ser coragem, pode ser teimosia, pode ser desespero. O contexto decide qual, e é o trabalho da escritora não confundir os três.",
    "desistir":     "Desistir não é fracasso automático na ficção — pode ser sabedoria, exaustão, ou libertação. A personagem que desiste de um jeito ruim e a que desiste do jeito certo chegam ao mesmo ato por caminhos muito diferentes. O peso da desistência depende de quanto a narrativa investiu no que foi abandonado.",
    "perdoar":      "O perdão na ficção é um dos atos mais difíceis de escrever com honestidade. Perdoar cedo demais parece fácil; perdoar tarde parece catarse. O perdão literário que funciona tem custo: a personagem que perdoa mudou algo em si para chegar até ali, e o texto mostra esse caminho.",
    "magoar":       "A mágoa é a ferida que fica — diferente da dor aguda que passa. Na ficção, magoar alguém raramente é intencional: é o que acontece quando duas necessidades incompatíveis se encontram. A personagem que magoou sem querer e a que magoou sabendo são duas histórias diferentes que o texto precisa distinguir.",
    "enganar":      "O engano na ficção é assimetria de informação entre personagens — e às vezes entre leitor e texto. A personagem que engana está operando em dois registros ao mesmo tempo: o que diz e o que sabe. Engano bem construído só funciona quando o leitor, ao descobrir, vê que os sinais estavam lá.",

    // Conceitos de arco e estrutura — v900
    "transformacao": "A transformação é o que o arco do personagem cumpre. A personagem no final é diferente da que começou — mas diferente não é melhor ou pior: é mais completa. A transformação que a ficção contemporânea busca é aquela que parece inevitável em retrospecto, mas surpreendente no momento.",
    "crise":         "A crise é o momento em que o que sustentava não aguenta mais. Pode ser interna (a personagem não consegue mais fingir) ou externa (o mundo ao redor muda de forma irreversível). A crise bem escrita é o ponto em que a narrativa força uma escolha que não podia ser evitada.",
    "redencao":      "A redenção é a possibilidade de que o erro passe por reparação. Na ficção, não precisa ser religiosa nem completa — pode ser parcial, ambígua, conquistada às custas de algo que não será recuperado. A redenção fácil é clichê; a redenção impossível é tragédia; a redenção possível mas difícil é onde a ficção mais honesta mora.",

    // Espaço, tempo e movimento — v899
    "momento":      "O momento é o tempo capturado. Na ficção, o momento importante é aquele em que algo muda — interna ou externamente. A narrativa pode dilatar um momento por páginas (câmera lenta) ou resumir anos em uma frase. A escolha do que recebe mais espaço revela o que a história considera essencial.",
    "instante":     "O instante é menor do que o momento — é o flash, o relance, o que dura um segundo e muda tudo. Na ficção, o instante bem capturado é quando a percepção do personagem se estreita ao detalhe: o som, o gesto, o cheiro. Escrever o instante é dominar a câmera lenta sem perder o ritmo.",
    "espaco":       "O espaço na ficção não é fundo de cena: é personagem. O quarto que sufoca, a floresta que acolhe, a cidade que desorienta — o espaço molda o que é possível sentir e fazer dentro dele. A relação do personagem com o espaço revela algo que o diálogo não alcança.",
    "origem":       "De onde a personagem vem — lugar, família, classe, língua — condiciona como ela vê o mundo e como o mundo a trata. A origem na ficção contemporânea não é destino: a personagem pode ir contra ou ao lado. Mas ignorar a origem é perder uma das camadas mais ricas da psicologia do personagem.",
    "centro":       "O centro narrativo é onde o peso da história está concentrado. Pode ser um personagem, um lugar, uma questão. Tudo o mais orbita ao redor. Deslocar o centro é uma das operações mais poderosas da ficção — quando o leitor percebe que o que parecia central não era, a narrativa abre.",
    "margem":       "A margem é o que fica fora do centro — e na ficção contemporânea brasileira, escrever da margem não é metáfora: é posição. A personagem que vive na margem do sistema, da família, do mapa, tem uma perspectiva que o centro não tem. A literatura de margem não é exceção: é onde muitas das histórias mais necessárias estão.",
    "parar":        "A pausa na narrativa tem peso. Um personagem que para — em meio à ação, à fuga, à conversa — está registrando algo: o que foi dito, o que foi visto, o que não pode continuar. A cena que para respira. Use o parar como sinal de que algo precisa de atenção antes de continuar.",
    "correr":       "Correr na ficção é urgência no corpo. Diferente de caminhar (que é interno), correr é exterior, agressivo, desesperado ou jubiloso. A cena em que a personagem corre tem ritmo diferente — a frase pode encurtar, os detalhes sumem, o corpo domina. A personagem que corre está fugindo, alcançando ou tentando chegar a tempo.",
    "entrar":       "Entrar é cruzar um limiar — e na ficção, todo limiar tem significado. Entrar em um lugar, em uma relação, em um papel social ou em uma conversa é um ato de posicionamento. A entrada bem escrita marca o antes e o depois; a entrada negligenciada é apenas locação.",
    "sair":         "Sair é o lado inverso de entrar — mas carrega frequentemente mais peso. Quem sai de uma cena, de uma relação, de um país, de uma fase, está deixando algo para trás. A cena de saída bem construída é despedida mesmo quando ninguém a nomeia como tal.",
    "tremer":       "O tremor na ficção é o medo no corpo. Antes de gritar, antes de falar, antes de agir, o corpo treme — e a ficção que captura esse momento físico anterior à palavra é mais honesta do que aquela que vai direto ao sentimento nomeado. Tremer pode ser medo, frio, raiva, choque, ou tesão — o contexto decide.",

    // Verbos e conceitos narrativos — v898
    "abrir":        "Abrir na ficção raramente é só mecânico. Uma porta que abre é uma possibilidade, um risco, uma entrada. Uma janela que abre é fuga, ou respiração. Abrir uma conversa, abrir um segredo, abrir o passado — o verbo carrega o peso do que estava fechado e do que muda com a abertura.",
    "fechar":       "Fechar é limite e também proteção. Uma história que termina bem fecha um ciclo — devolve ao leitor a sensação de resolução. Fechar a porta para o outro, fechar os olhos para a dor — o verbo diz o que a personagem não quer mais ver ou o que ela está tentando conter.",
    "perguntar":    "A pergunta move a narrativa. Não precisa ser literal: a personagem que 'não sabe por que aquilo aconteceu' está perguntando internamente. A pergunta que o texto não responde de imediato é suspense; a que responde rápido demais, tensão resolvida antes de amadurecer.",
    "responder":    "A resposta que a personagem dá — e o que ela omite — é revelação de caráter. Responder é escolher o que mostrar. Em diálogo, a não-resposta (mudar de assunto, agir como se não ouviu, sorrir e passar) é mais poderosa do que a resposta direta. O que a personagem não responde define tanto quanto o que diz.",
    "encontrar":    "Encontrar algo ou alguém muda o estado da narrativa. O encontro pode ser casualidade ou destino — e a ficção decide isso pela forma como prepara ou não a cena. Encontrar pode ser redenção (o que estava perdido) ou perturbação (o que não devia estar ali). A ambiguidade do encontro é frequentemente onde a história mora.",
    "perder":       "A perda define o personagem pelo que lhe falta. O que foi perdido (uma pessoa, um objeto, uma crença, uma versão de si mesmo) organiza a narrativa ao redor de uma ausência. A perda que o leitor presencia é diferente da perda que o personagem carrega do passado — ambas são poderosas, mas pedem técnicas distintas.",
    "sorrir":       "Um sorriso na ficção pode ser alegria, defesa, disfarce, crueldade, nervosismo. O contexto decide tudo. Cuidado com 'ela sorriu' como gesto neutro: sorrir é sempre comunicação, e a pergunta é o que esse sorriso está dizendo — ou escondendo.",
    "chorar":       "Chorar é o mais fácil de escrever mal. Lágrimas que aparecem cedo demais não comovem — o leitor não ainda não sente o peso do que foi perdido. Chorar que funciona é o choro que a narrativa preparou, que chegou quando o leitor já sente o custo. A contenção antes do choro costuma ser mais poderosa do que o choro em si.",
    "heranca":      "A herança na ficção é literalmente o que passa de uma geração para outra — mas também é padrão, trauma, dom, maldição, identidade. A personagem que herda algo (um nome, um gesto, um segredo) carrega mais do que o objeto: carrega a relação com quem veio antes.",
    "retorno":      "Voltar para o lugar de origem — ou para a pessoa, ou para a versão anterior de si — é sempre constatar uma diferença. O retorno na ficção revela o quanto a personagem mudou. O lugar parece menor, ou maior; a pessoa parece diferente, ou a mesma e isso é perturbador. O retorno mede o arco.",
    "comeco":       "O início do texto não precisa ser o início da história. A escolha de onde começar é uma decisão de foco: o que o leitor precisa saber primeiro, que tom isso estabelece, qual expectativa é criada. Começos fracos são aqueles que ainda estão se preparando; começos fortes já estão dentro.",
    "fim":          "O fim não é apenas parar. É onde a narrativa deixa o leitor. Um final bem construído ressoa: o leitor não precisa de tudo resolvido, mas precisa sentir que a história soube onde parar. O fim é a última decisão que a escritora toma, e o leitor vai carregá-lo.",

    // Conceitos de arco e marcos narrativos — v896
    "passado":      "O passado na ficção não é o que aconteceu: é o que a personagem carrega. A memória distorce, escolhe, reordena. O passado narrativo não existe como fato — existe como peso que molda decisão, reação e desejo no presente. A escritora que controla como o passado entra na cena controla o ritmo da revelação.",
    "futuro":       "O futuro que uma personagem imagina diz tudo sobre quem ela é agora. Na ficção, o futuro pode ser prolepse (a narração que adianta), esperança (o que a personagem deseja) ou ameaça (o que ela teme). Toda antecipação é também uma promessa: a narrativa vai ou não cumprir o que o futuro prometeu.",
    "segredo":      "O segredo na ficção é motor. Algo é sabido por alguém e não por outros — e essa assimetria de informação cria tensão. O segredo compartilhado com o leitor (mas não com a personagem) é ironia dramática. O segredo que o leitor também não sabe é suspense. Saber quando revelar é uma das decisões mais difíceis da narrativa.",
    "promessa":     "A promessa cria obrigação narrativa: algo foi dito, e o texto vai cobrar. Pode ser explícita (um personagem promete) ou implícita (a narrativa instaura expectativa). A promessa quebrada é tão poderosa quanto a cumprida — mas exige justificativa interna coerente.",
    "decisao":      "A decisão é o momento em que uma personagem poderia ter ido para um lado ou para outro — e foi para um. Na ficção, o valor da decisão está no peso do que ela custou e no que ela revela. Uma decisão sem dilema prévio é apenas ação. Uma decisão com dilema é caráter.",
    "escolha":      "Diferente da decisão (que é o ato), a escolha é o processo — a personagem diante das possibilidades. A escolha narrativa interessante não tem opção claramente certa: revela quem a personagem é pelo que ela prioriza quando precisa abrir mão de algo. A escolha impossível é o coração da tragédia.",
    "encontro":     "O encontro na ficção não é só dois personagens no mesmo lugar: é o momento em que duas histórias se tocam. O encontro que muda algo — uma informação, uma percepção, um afeto — é diferente do encontro que passa. A escritora precisa decidir o que muda com o encontro e para quem.",
    "despedida":    "A despedida carrega o peso de tudo que foi dito e o peso maior do que não foi. Na ficção, a cena de despedida é limiar: depois dela, o mundo da história não é mais o mesmo. Pode ser morte, partida, ruptura, término — em qualquer caso, é o momento em que algo se fecha.",
    "ruptura":      "Ruptura é quando o fio que sustentava algo se parte — relação, expectativa, identidade, aliança. Na narrativa, a ruptura divide o tempo em antes e depois. A ruptura mais interessante é a que já estava a caminho: o leitor percebe que era inevitável, mas a personagem precisou do impacto para ver.",
    "fraqueza":     "Na ficção, a fraqueza revela mais do que a força. O momento em que a personagem não consegue — cede, foge, falha, se contradiz — é o momento em que ela se torna inteira. A fraqueza como defeito dramático clássico (a hamartia) organiza o arco; a fraqueza como humanidade é o que faz o leitor permanecer.",
    "paz":          "A paz na ficção é rara e instável — personagens em paz não têm conflito; narrativa sem conflito para. Mas a paz como desejo (o que a personagem busca), como conquista (o que ela finalmente tem) ou como perda iminente (o momento antes da ruptura) é poderosamente carregada. A paz precede ou segue o que importa.",

    // Verbos de movimento e relação — v895
    "caminhar":     "O ato de caminhar na ficção raramente é só deslocamento: é o personagem em trânsito interno também. A caminhada cria espaço para o monólogo interior, para a percepção do ambiente, para o pensamento que só aparece em movimento. Atenção ao ritmo da cena: uma caminhada lenta pede outro tempo de frase.",
    "tocar":        "O tato é o sentido mais íntimo na ficção. Tocar alguém — ou ser tocado — implica presença, consentimento, e às vezes ruptura de fronteira. A cena de toque bem escrita diz mais sobre os personagens do que qualquer diálogo: ela mostra o que eles se permitem ou não se permitem.",
    "partir":       "A partida na ficção é sempre dupla: quem vai e quem fica. A cena de despedida carrega toda a relação anterior e antecipa o que muda. 'Partir' literário pode ser viagem, morte, ruptura, abandono — em qualquer caso, é uma threshold: linha que, cruzada, não volta ao mesmo.",
    "chegar":       "A chegada revela o olhar de quem chega: ela vê o que quem estava não via mais. A personagem que chega percebe cheiros, detalhes, tensões que se tornaram invisíveis para os que ficaram. Use a chegada para ver o familiar com olhos de fora.",
    "esperar":      "A espera é tempo parado com pensamento em movimento. Na ficção, a cena de espera pode ser onde a personagem mais revela o que teme e o que deseja — porque não há ação que a distraia. Cuidado com a espera como dispositivo de exposição (quando a personagem 'se lembra' de tudo para preencher o tempo narrativo).",

    // Estrutura de livro e prática editorial — v893
    "sinopse":       "Resumo que apresenta o livro para o mercado — editores, livreiros, leitores. A sinopse não spoila: ela seduz. Não começa no começo, não conta o fim, escolhe o conflito central e o apresenta de forma que desperte desejo. Uma boa sinopse é o livro destilado na sua tensão mais essencial.",
    "contracapa":    "O texto no verso da capa — ou quarta capa. Tem função sedutora: em 150 palavras, convence o leitor a abrir o livro. Diferente da sinopse para o editor, a contracapa fala diretamente com quem está na livraria com o livro nas mãos. Tom, ritmo e promessa contam tanto quanto informação.",
    "edicao":        "O processo de transformar o texto em livro — não só a revisão ortográfica, mas o trabalho editorial: cortes, reorganizações, ajustes de ritmo, decisões de estrutura. Editar é uma conversa entre a autora e quem lê como editor: exige confiança e clareza de intenção.",
    "capa":          "A primeira impressão do livro — e um texto visual tão importante quanto o interno. Capa inclui título, autora, imagem, paleta, tipografia. Cada elemento comunica antes que uma palavra seja lida. A capa que corresponde ao interior é rara e poderosa.",
    "indice":        "O mapa do livro: lista de partes, capítulos, seções com paginação. Em não-ficção, é ferramenta de navegação; em ficção, pode ser parte do jogo com o leitor. Um índice bem feito orienta sem revelar; um índice mal feito promete estrutura que o texto não cumpre.",
    "posfacio":      "Texto que vem depois do texto principal — reflexão, nota da autora, contexto de criação, ou leitura crítica por outra voz. O posfácio tem uma vantagem: o leitor chegou até ali. Pode ser mais honesto, mais denso, mais revelador do que qualquer prefácio.",

    // Narratologia clássica — v893
    "peripecia":     "A reviravolta — o momento em que a sorte muda de sentido, para melhor ou para pior. Aristóteles a via como elemento essencial da tragédia. Na ficção contemporânea, a peripécia não precisa ser um golpe dramático: pode ser sutil, uma conversa que muda tudo, uma percepção que inverte o que parecia certo.",
    "anagnorise":    "O reconhecimento — o instante em que uma personagem descobre algo que muda sua compreensão da história. Pode ser a identidade de alguém, uma verdade escondida, um segredo revelado. Aristóteles a considerava mais poderosa quando coincide com a peripécia. Na ficção contemporânea, pode ser interna: a personagem reconhece algo em si mesma.",
    "polifonia":     "Texto em que múltiplas vozes coexistem sem que nenhuma domine. O conceito vem de Bakhtin: em um romance polifônico, as personagens têm pontos de vista autônomos que não são reduzidos à visão da autora. A prosa contemporânea brasileira tem explorado polifonia de formas variadas — capítulos em vozes distintas, cartas, diários, relatos.",
    "focalizacao":   "Quem percebe a história — não quem a conta, mas por qual perspectiva o mundo é filtrado. A distinção entre narrador e focalizador (de Gérard Genette) é útil: em 'ela saiu sem que ninguém visse', o narrador sabe; mas em 'ela saiu, sem avisar ninguém', a focalização pode ser da própria personagem. Toda escolha de foco é uma escolha política.",

    // Identidade, território e literatura brasileira — v892
    "resistencia":   "Continuar existindo apesar de. A resistência literária tem formas variadas: pode ser barulhenta (o grito, o manifesto) ou silenciosa (o cotidiano que insiste, a beleza que permanece onde o sistema não queria que houvesse beleza). A literatura de resistência não é só protesto — é afirmação.",
    "silenciamento": "O processo de calar uma voz — não por ausência, mas por força. O silenciamento literário é mais do que silêncio: é o silêncio produzido. A personagem silenciada existe, tem algo a dizer — o texto que a escuta está fazendo o oposto do que a fez calar.",
    "apagamento":    "Ser retirada da história — não por desaparecer, mas por ser omitida de quem conta. O apagamento literário é diferente do esquecimento: ele é sistemático. A escritora que narra o que foi apagado está fazendo um ato de resistência antes de qualquer outro gesto estético.",
    "migracao":      "Partir de um lugar e chegar em outro — mas sem deixar o primeiro. A migração literária carrega o antes: o sotaque, o cheiro de casa, o que não existe no lugar de chegada. Personagens migrantes vivem simultaneamente em dois lugares, dois tempos, duas línguas.",
    "territorio":    "O espaço que tem história, memória e pertencimento — não apenas coordenadas geográficas. O território literário é íntimo e político ao mesmo tempo: é o lugar de onde a personagem veio, que foi tomado, que foi perdido, que se tenta manter. Território é narrativa.",
    "enraizamento":  "Ter lugar, memória, pertencimento. O enraizamento não é fixidez — é conexão. Uma personagem enraizada sabe de onde vem; isso não a impede de ir, mas muda o que ela carrega. Em contexto de literatura periférica e indígena, o enraizamento é resistência política.",
    "deslocamento":  "Estar entre dois lugares sem pertencer completamente a nenhum. O deslocamento pode ser físico (migração, exílio) ou simbólico (sentir-se estrangeira onde se cresceu). Na ficção, a personagem deslocada tem acesso a perspectivas que quem está enraizado não tem.",
    "corporalidade": "A experiência do mundo pelo e no corpo. A corporalidade literária reconhece que não existe pensamento sem corpo, e que corpos são marcados de formas diferentes — por raça, gênero, deficiência, classe. Escrever com corporalidade é escrever o que o corpo sente antes que a mente explique.",
    "ancestralidade": "A presença dos que vieram antes — não como passado, mas como força viva. A ancestralidade na literatura brasileira é especialmente relevante na escrita afro-brasileira e indígena: a avó, o terreiro, a floresta, o mito fundador que orienta a personagem no presente.",
    "representacao": "Estar presente nas histórias — ser narrada, ser protagonista, existir como sujeito e não como pano de fundo. A discussão de representação não é sobre cota ou obrigação: é sobre o que fica invisível quando determinadas vidas não aparecem nas páginas, e o que muda quando aparecem.",
    "visibilidade":  "Ser vista, reconhecida, existir para o olhar que importa. Na literatura, a visibilidade não é só sobre aparecer: é sobre como se aparece. Ser caricatura não é visibilidade. Ser narrada com complexidade, sim.",
    "invisibilidade": "Existir sem ser vista pelo olhar dominante — não como ausência, mas como apagamento ativo. A invisibilidade na ficção pode ser estratégia (o personagem que age por não ser visto) ou ferida (o personagem que existe mas não conta para o mundo do texto).",
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
