(function voiceEngine(global) {
  const stopwords = new Set(
    "a o as os um uma uns umas de do da dos das em no na nos nas por para com sem sob sobre entre e ou mas que se como quando onde quem qual quais cujo cuja seus suas seu sua meu minha meus minhas ao aos a as e sao foi eram ser ter tem tinha ha havia nao sim mais menos muito muita muitos muitas pouco pouca poucos poucas todo toda todos todas este esta esse essa aquele aquela isso isto aquilo eu tu ele ela nos vos eles elas me te lhe lhes pois porem todavia contudo entretanto embora enquanto logo assim portanto porque tambem sempre nunca jamais apenas somente ainda ja agora depois antes aqui ali la ca durante atraves mediante ante perante apos ate desde contra alias alias outrossim ademais mesmo proprio propria la ca aqui ali ha faz fez fazem fazer estava estou esta estao estive esteve estiveram vou vai vao vir vim vamos veio foram foste fora fui".split(
      /\s+/
    )
  );

  const emotionLexicons = {
    melancolia: ["saudade", "silêncio", "perda", "ausência", "noite", "vazio", "memória", "choro", "triste", "longe", "sombra", "tarde", "cinza", "ruína", "fim", "esquecimento", "desvanecer", "apagar", "distância", "abandono", "luto", "resto", "vestígio", "espelho", "cinzas", "cansaço", "derrota", "lágrima", "sombrio"],
    tensao: ["medo", "sangue", "grito", "pressa", "risco", "ameaça", "culpa", "segredo", "fuga", "corte", "queda", "tensão", "perigo", "escuro", "susto", "perseguição", "armadilha", "traição", "disparo", "confronto", "urgência", "crise", "navalha", "pânico", "veneno", "emboscada", "cilada", "alarme", "nervoso", "sufoco"],
    luminosidade: ["luz", "sol", "claro", "riso", "alegria", "manhã", "brilho", "flor", "aberto", "leve", "calma", "clareza", "fresco", "verde", "esperança", "amanhecer", "celebração", "leveza", "plenitude", "festa", "graça", "sorte", "vitória", "nascer", "despertar", "glória", "aurora", "radiante", "harmonia", "dançar"],
    ironia: ["claro", "óbvio", "ridículo", "quase", "fingir", "ninguém", "todos", "perfeito", "sério", "sorriso", "naturalmente", "certamente", "evidentemente", "justamente", "realmente", "singular", "curioso", "peculiar", "conveniente", "herói", "exatamente", "perfeitamente", "lógico", "inocente", "coincidentemente", "surpreendentemente", "casualmente", "espantosamente", "felizmente", "incrível"],
    contemplacao: ["olhar", "tempo", "vento", "água", "terra", "janela", "casa", "corpo", "mundo", "devagar", "espera", "pausa", "quieto", "lento", "silêncio", "horizonte", "repouso", "contemplar", "observar", "meditar", "divagar", "profundo", "névoa", "crepúsculo", "bruma", "quietude", "sereno", "tranquilo", "distância", "pensar"],
    ternura: ["gentil", "amor", "carinho", "afeto", "cuidado", "abraço", "beijar", "suave", "doce", "mãe", "filho", "criança", "delicado", "calor", "acolher", "proteção", "ternura", "lar", "família", "pertencer", "bençao", "amparo", "beijo", "sorriso", "gesto", "mimo", "meigo", "afetuoso"],
  };

  const semanticFields = {
    corpo: ["corpo", "mão", "olho", "rosto", "boca", "pele", "sangue", "peito", "braço", "perna", "cabeça", "carne", "ferida", "nervos", "ventre", "pescoço", "ombro", "punho", "veia", "dedo", "joelho", "costas", "língua"],
    casa: ["casa", "porta", "janela", "mesa", "quarto", "cozinha", "parede", "chão", "telhado", "cama", "corredor", "varanda", "quintal", "porão", "escada", "gaveta", "armário", "sala", "fogão", "pia", "espelho", "prateleira", "soleira", "alpendre"],
    natureza: ["terra", "água", "rio", "mar", "vento", "sol", "chuva", "árvore", "folha", "barro", "céu", "floresta", "cerrado", "sertão", "caatinga", "raiz", "pedra", "galho", "seca", "brejo", "savana", "lua", "estrela", "nuvem", "campo", "serra", "vale", "mata", "mangue", "chapada", "pampa", "várzea", "roça", "brisa", "relâmpago"],
    memoria: ["memória", "lembrança", "infância", "ontem", "passado", "antigo", "voltar", "recordar", "saudade", "crescer", "época", "foto", "carta", "diário", "cheiro", "cicatriz", "marca", "história", "reviver", "apagar", "herança", "origem", "trauma"],
    conflito: ["medo", "culpa", "segredo", "briga", "guerra", "dívida", "ameaça", "perigo", "morte", "fuga", "violência", "crime", "faca", "golpe", "sangue", "traição", "ódio", "raiva", "punição", "silêncio", "mentira", "ferida", "desespero", "ruptura", "rancor", "explosão", "colapso", "crise"],
    pensamento: ["penso", "ideia", "verdade", "talvez", "sentido", "mundo", "tempo", "pergunta", "entender", "reflexão", "dúvida", "certeza", "consciência", "razão", "intuição", "dilema", "escolha", "questão", "saber", "argumento", "crença", "princípio", "paradoxo"],
    cidade: ["rua", "praça", "ônibus", "prédio", "cidade", "calçada", "mercado", "trânsito", "bairro", "favela", "morro", "periferia", "beco", "esquina", "asfalto", "metrô", "buzina", "sirene", "multidão", "anonimato", "povo", "movimento", "barulho", "laje"],
    sobrenatural: ["fantasma", "magia", "espírito", "sonho", "encantado", "místico", "visão", "ritual", "oculto", "assombração", "destino", "presságio", "feitiço", "entidade", "sombra", "orixá", "terreiro", "encantaria", "milagre", "benzedura", "encantamento", "aparição"],
  };

  const fieldLabels = {
    corpo: "presença e gestualidade do corpo",
    casa: "intimidade dos espaços domésticos",
    natureza: "elementos naturais e paisagem",
    memoria: "memória e passado",
    conflito: "tensão e confronto",
    pensamento: "reflexão e raciocínio",
    cidade: "espaço urbano e cotidiano",
    sobrenatural: "o inexplicável e o sobrenatural",
  };

  const emotionLabels = {
    melancolia: "melancolia",
    tensao: "tensão",
    luminosidade: "luminosidade",
    ironia: "ironia",
    contemplacao: "contemplação",
    ternura: "ternura",
  };

  function inferVoiceCtx(options = {}) {
    const fmt = `${options.formato || options.oficio || options.editorMode || options.kind || options.type || ""}`.toLowerCase();
    return {
      poesia:  /poema|poesia|soneto|slam|haiku|cordel|verso/.test(fmt),
      roteiro: /roteiro|script|screenplay/.test(fmt),
    };
  }

  function analyze(text, ctx = {}) {
    const voiceCtx = Object.keys(ctx).length ? inferVoiceCtx(ctx) : {};
    const normalized = normalize(text);
    const words = tokenize(normalized);
    const sentences = splitSentences(normalized);
    const paragraphs = splitParagraphs(normalized);
    const contentWords = words.filter((word) => !stopwords.has(stripAccent(word)) && stripAccent(word).length > 2);
    const uniqueWords = new Set(words.map(stripAccent));
    const uniqueContent = new Set(contentWords.map(stripAccent));
    const sentenceLengths = sentences.map((sentence) => tokenize(sentence).length).filter(Boolean);
    const punctuation = getPunctuation(normalized);
    const repetitions = getRepetitions(contentWords);
    const emotional = scoreLexicons(words, emotionLexicons);
    const fields = scoreLexicons(words, semanticFields);
    const ttr = words.length ? uniqueWords.size / words.length : 0;
    const lexicalDensity = words.length ? contentWords.length / words.length : 0;
    const avgSentence = average(sentenceLengths);
    const sentenceVariation = standardDeviation(sentenceLengths);
    const paragraphAverage = paragraphs.length ? sentences.length / paragraphs.length : 0;
    const gesture = inferGesture({ avgSentence, lexicalDensity, ttr, punctuation, emotional, fields, repetitions });

    // Confiança da leitura baseada no tamanho do corpus
    const confianca = words.length >= 500 ? "alta" : words.length >= 200 ? "média" : "baixa";
    const confiancaNote = confianca === "baixa"
      ? "Corpus muito curto: a leitura de voz é instável abaixo de 200 palavras. Resultados como hipótese inicial."
      : confianca === "média"
      ? "Corpus médio: a leitura ganha estabilidade acima de 500 palavras."
      : null;

    return {
      counts: {
        words: words.length,
        uniqueWords: uniqueWords.size,
        sentences: sentences.length,
        paragraphs: paragraphs.length,
      },
      metrics: {
        ttr: round(ttr * 100),
        lexicalDensity: round(lexicalDensity * 100),
        avgSentence: round(avgSentence, 1),
        sentenceVariation: round(sentenceVariation, 1),
        paragraphAverage: round(paragraphAverage, 1),
      },
      confianca,
      confiancaNote,
      punctuation,
      repetitions,
      emotional,
      fields,
      voice: createVoiceReading(gesture, { avgSentence, lexicalDensity, sentenceVariation, emotional, fields }),
      strengths: getStrengths({ avgSentence, lexicalDensity, ttr, sentenceVariation, repetitions, punctuation }),
      blindSpots: getBlindSpots({ words, avgSentence, lexicalDensity, ttr, sentenceVariation, repetitions, paragraphs }, voiceCtx),
      audience: getAudience(gesture, { avgSentence, lexicalDensity, fields, emotional }),
      exercises: getExercises(gesture, repetitions),
      disclaimer:
        "Métricas como TTR, extensão de frase e repetição são calculadas localmente. Voz, público e ecos literários são leituras heurísticas, úteis como hipótese de trabalho, não como diagnóstico definitivo.",
    };
  }

  function createVoiceReading(gesture, context) {
    const topField = getTopItem(context.fields);
    const topEmotion = getTopItem(context.emotional);
    const fieldDesc = topField ? (fieldLabels[topField.label] || topField.label) : null;
    const emotionDesc = topEmotion ? (emotionLabels[topEmotion.label] || topEmotion.label) : null;
    const titles = {
      introspectivo: "Voz de interior aceso",
      oral: "Voz de conversa em movimento",
      imagético: "Voz de imagem concreta",
      ensaístico: "Voz de pensamento em marcha",
      seco: "Voz de corte limpo",
      barroco: "Voz de acúmulo e vertigem",
      contemplativo: "Voz de demora sensível",
      narrativo: "Voz de cena em avanço",
      sobrenatural: "Voz de fronteira e encantamento",
      "irônico": "Voz de distância e comentário velado",
    };

    const fieldPart = fieldDesc ? ` com foco em ${fieldDesc}` : "";
    const emotionPart = emotionDesc ? ` e temperatura de ${emotionDesc}` : "";
    const description = `${titles[gesture]}${fieldPart}${emotionPart}. Leitura heurística — nasce de padrões locais de vocabulário, frase, repetição e pontuação.`;

    return {
      gesture,
      title: titles[gesture],
      description,
      echoes: getEchoes(gesture),
    };
  }

  function inferGesture({ avgSentence, lexicalDensity, ttr, punctuation, emotional, fields, repetitions }) {
    const topEmotion = getTopItem(emotional)?.label;
    const topField   = getTopItem(fields)?.label;

    // Barroco: frases longas + alta densidade — clareza sintática sacrificada por acumulação
    if (avgSentence > 24 && lexicalDensity > 0.58) return "barroco";

    // Ensaístico: campo do pensamento + densidade — antecede seco para não confundir ensaio curto
    if (topField === "pensamento" && lexicalDensity > 0.52) return "ensaístico";

    // Sobrenatural: campo de magia/entidades tem precedência sobre corte seco
    if (topField === "sobrenatural") return "sobrenatural";

    // Seco: frases curtas independente de repetições (Trevisan e Freire usam anáfora como recurso)
    if (avgSentence < 12 && topField !== "pensamento") return "seco";

    // Imagético: corpo, casa, cidade, conflito — superfície concreta, cenas densas
    if (topField === "corpo" || topField === "casa" || topField === "cidade" || topField === "conflito") return "imagético";

    // Oral: texto com diálogo marcado (threshold > 3 para não classificar uma citação como oral)
    if (punctuation.dialogue >= 4) return "oral";

    // Irônico: marcadores de ironia com alta frequência e densidade média — distância entre o dito e o sentido
    if (topEmotion === "ironia" && lexicalDensity > 0.44) return "irônico";

    // Contemplativo: emoção de contemplação ou campo da natureza
    if (topEmotion === "contemplacao" || topField === "natureza") return "contemplativo";

    // Oral leve: algum diálogo presente mas abaixo do threshold principal
    if (punctuation.dialogue >= 2) return "oral";

    // (sobrenatural movido para antes de seco — ver acima)

    // Ternura: afeto e cuidado — interior suave, próximo do contemplativo
    if (topEmotion === "ternura") return "contemplativo";

    // Tensão predominante sem conflito explícito no campo → narrativo com urgência
    if (topEmotion === "tensao" && topField !== "conflito") return "narrativo";

    // Introspectivo: melancolia, memória — interior sem confronto externo
    if (topEmotion === "melancolia" || topField === "memoria") return "introspectivo";

    return "narrativo";
  }

  function getEchoes(gesture) {
    const map = {
      introspectivo: ["Clarice Lispector (A Paixão segundo G.H.)", "Raduan Nassar (Lavoura Arcaica)", "Lygia Fagundes Telles (As Meninas)"],
      oral: ["João Guimarães Rosa (Primeiras Estórias)", "João Antônio (Malagueta, Perus e Bacanaço)", "Carolina Maria de Jesus (Quarto de Despejo)"],
      imagético: ["Dalton Trevisan (O Vampiro de Curitiba)", "Rubem Fonseca (Feliz Ano Novo)", "Caio Fernando Abreu (Morangos Mofados)"],
      ensaístico: ["Graciliano Ramos (Memórias do Cárcere)", "Clarice Lispector (A Descoberta do Mundo)", "Silviano Santiago (Uma Literatura nos Trópicos)"],
      seco: ["Dalton Trevisan (contos)", "Samuel Rawet (O Profeta e Outros Contos)", "Marcelino Freire (Contos Negreiros)"],
      barroco: ["João Guimarães Rosa (Grande Sertão: Veredas)", "Osman Lins (Avalovara)", "Hilda Hilst (A Obscena Senhora D)"],
      contemplativo: ["Lygia Fagundes Telles (Ciranda de Pedra)", "Adélia Prado (Bagagem)", "Manoel de Barros (Poesia Completa)"],
      narrativo: ["Machado de Assis (Dom Casmurro)", "Autran Dourado (Opera dos Mortos)", "Conceição Evaristo (Ponciá Vicêncio)"],
      sobrenatural: ["Mia Couto (Um Rio Chamado Tempo)", "Paulina Chiziane (O Alegre Canto da Perdiz)", "João Guimarães Rosa (A Terceira Margem do Rio)"],
      "irônico": ["Machado de Assis (Memórias Póstumas de Brás Cubas)", "Lima Barreto (Triste Fim de Policarpo Quaresma)", "João Ubaldo Ribeiro (Viva o Povo Brasileiro)"],
    };
    return map[gesture] || map.narrativo;
  }

  function getStrengths({ avgSentence, lexicalDensity, ttr, sentenceVariation, repetitions, punctuation }) {
    const strengths = [];
    if (ttr > 0.48) strengths.push("Vocabulário variado o suficiente para sustentar uma assinatura própria.");
    if (lexicalDensity > 0.54) strengths.push("Boa densidade de palavras de conteúdo: o texto carrega matéria verbal.");
    if (sentenceVariation > 7) strengths.push("Ritmo com alternância perceptível entre frases curtas e longas.");
    if (avgSentence >= 12 && avgSentence <= 22) strengths.push("Frases em faixa confortável para leitura contínua.");
    if (punctuation.dialogue > 0) strengths.push("Presença de fala ou oralidade, útil para aproximar leitor e cena.");
    if (!strengths.length) strengths.push("O texto já oferece matéria suficiente para reconhecer padrões de voz.");
    if (repetitions.length && repetitions[0].count >= 4) strengths.push(`A recorrência de "${repetitions[0].word}" pode funcionar como motivo, se for intencional.`);
    return strengths.slice(0, 4);
  }

  function getBlindSpots({ words, avgSentence, lexicalDensity, ttr, sentenceVariation, repetitions, paragraphs }, ctx = {}) {
    const isPoesia  = Boolean(ctx.poesia);
    const isRoteiro = Boolean(ctx.roteiro);
    const spots = [];
    if (words.length < 500) spots.push("Corpus ainda curto: a leitura da voz fica instável abaixo de 500 palavras.");
    if (ttr < 0.34 && words.length > 120) spots.push("Riqueza vocabular baixa: há risco de repetição não intencional.");
    if (avgSentence > 28 && !isPoesia && !isRoteiro) spots.push("Frases muito longas podem criar opacidade e cansaço.");
    if (avgSentence < 8 && words.length > 120 && !isPoesia && !isRoteiro) spots.push("Frases muito curtas podem reduzir nuance e música interna.");
    if (sentenceVariation < 4 && words.length > 120 && !isPoesia) spots.push("Ritmo pouco variado: o texto pode soar plano.");
    if (lexicalDensity < 0.42 && words.length > 120) spots.push("Densidade lexical baixa: muitos conectores e palavras funcionais podem diluir imagem e ação.");
    if (paragraphs.length <= 1 && words.length > 180 && !isPoesia) spots.push("Pouca respiração em parágrafos: o leitor pode perder orientação visual.");
    repetitions.slice(0, 2).forEach((item) => spots.push(`Verifique a repetição de "${item.word}" (${item.count} ocorrências).`));
    return spots.slice(0, 5);
  }

  function getAudience(gesture, { avgSentence, lexicalDensity, fields, emotional }) {
    const topFieldItem = getTopItem(fields);
    const topEmotionItem = getTopItem(emotional);
    const topFieldLabel = topFieldItem ? (fieldLabels[topFieldItem.label] || topFieldItem.label) : null;
    const topEmotionLabel = topEmotionItem ? (emotionLabels[topEmotionItem.label] || topEmotionItem.label) : null;
    const demanding = avgSentence > 24 || lexicalDensity > 0.6;

    const secondaryParts = [topFieldLabel, topEmotionLabel].filter(Boolean);
    const secondary = secondaryParts.length
      ? `Leitores atraídos por ${secondaryParts.join(" e ")}.`
      : "Leitores com interesse em prosa de voz marcada.";

    return {
      core: demanding
        ? "Leitores de prosa literária que aceitam densidade, ambiguidade e atenção ao gesto verbal."
        : "Leitores que buscam narrativa legível com marca de voz e imagens recorrentes.",
      secondary,
      risk: demanding
        ? "Leitores que procuram ação imediata ou linguagem transparente podem abandonar cedo."
        : "Leitores que esperam alta experimentação formal podem achar a superfície direta demais.",
    };
  }

  function getExercises(gesture, repetitions) {
    const base = {
      introspectivo: "Reescreva um parágrafo inteiro trocando explicação emocional por gesto físico.",
      oral: "Leia uma página em voz alta e corte toda fala que não muda a relação entre as pessoas.",
      imagético: "Escolha uma imagem recorrente e faça ela voltar três vezes com sentido diferente.",
      ensaístico: "Transforme a tese central em uma pergunta e veja se cada parágrafo responde a uma parte dela.",
      seco: "Acrescente uma frase sensorial depois de cada ação decisiva, sem explicar sentimento.",
      barroco: "Corte 20% de um parágrafo longo e observe o que ainda pulsa.",
      contemplativo: "Introduza uma perturbação concreta no meio da atmosfera.",
      narrativo: "Marque o ponto exato em que algo muda de estado na cena.",
      sobrenatural: "Descreva o elemento inexplicável pelos sentidos físicos de quem o vive — sem explicar o que é.",
      "irônico": "Reescreva uma passagem séria como se o narrador soubesse mais do que admite — sem quebrar a cena.",
    };
    const repetitionExercise = repetitions.length
      ? `Faça uma versão substituindo metade das ocorrências de "${repetitions[0].word}" por imagem, ação ou silêncio.`
      : "Faça uma versão destacando três palavras-chave que deveriam voltar como motivo.";
    return [base[gesture] || base.narrativo, repetitionExercise];
  }

  function scoreLexicons(words, lexicons) {
    const stripped = words.map(stripAccent);
    const total = Math.max(1, words.length);
    return Object.entries(lexicons)
      .map(([label, items]) => {
        const keys = items.map(stripAccent);
        const hits = stripped.filter((word) => keys.includes(word)).length;
        // densidade por 100 palavras, máx 100 — evita inflação em textos curtos
        const density = (hits / total) * 100;
        const score = Math.min(100, Math.round(density * 25));
        return { label, hits, score };
      })
      .filter((item) => item.hits > 0)
      .sort((a, b) => b.score - a.score || b.hits - a.hits)
      .slice(0, 6);
  }

  function getPunctuation(text) {
    return {
      commas: countMatches(text, /,/g),
      semicolons: countMatches(text, /;/g),
      colons: countMatches(text, /:/g),
      questions: countMatches(text, /\?/g),
      exclamations: countMatches(text, /!/g),
      dialogue: countMatches(text, /[—"]/g),
    };
  }

  function getRepetitions(words) {
    const counts = words.reduce((map, word) => {
      const key = stripAccent(word);
      if (key.length > 3) map[key] = (map[key] || 0) + 1;
      return map;
    }, {});

    return Object.entries(counts)
      .filter(([, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word, count]) => ({ word, count }));
  }

  function normalize(text) {
    return (text || "").replace(/\u00a0/g, " ").trim();
  }

  function tokenize(text) {
    return (
      normalize(text)
        .toLowerCase()
        .match(/[a-záàâãéêíóôõúüç]+/gi) || []
    );
  }

  function splitSentences(text) {
    return normalize(text)
      .split(/[.!?]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function splitParagraphs(text) {
    return normalize(text)
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function stripAccent(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function average(values) {
    return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
  }

  function standardDeviation(values) {
    if (values.length < 2) return 0;
    const avg = average(values);
    return Math.sqrt(average(values.map((value) => Math.pow(value - avg, 2))));
  }

  function countMatches(text, pattern) {
    return (text.match(pattern) || []).length;
  }

  function round(value, precision = 0) {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }

  function getTopItem(items) {
    return Array.isArray(items) && items.length ? items[0] : null;
  }

  // Análise integrada com analise-engine (se disponível)
  function analyzeComplete(text) {
    const voice = analyze(text);
    const criterios = (global.VeredaAnalise && text.trim().length > 50)
      ? global.VeredaAnalise.analisar(text)
      : null;
    const alertas = criterios ? global.VeredaAnalise.interpretarResultado(criterios) : [];
    return { voice, criterios, alertas };
  }

  global.VeredaVoice = {
    analyze,
    analyzeComplete,
  };
})(window);
