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

      // 3. Após palavra gramatical (conjunção, advérbio, preposição) → Conjunção
      //    causal ("corre, que é tarde"), temporal, final, consecutiva, concessiva
      const _GRAM = new Set([
        "e","ou","mas","porem","contudo","todavia","entretanto","portanto","logo","pois",
        "quando","embora","porque","como","se","onde","enquanto","alem","desde","ate",
        "mais","menos","tao","tanto","nao","ja","para","por","sem","ante","entre",
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

    return "Substantivo";
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
