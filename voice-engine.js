(function voiceEngine(global) {
  const stopwords = new Set(
    "a o as os um uma uns umas de do da dos das em no na nos nas por para com sem sob sobre entre e ou mas que se como quando onde quem qual quais cujo cuja seus suas seu sua meu minha meus minhas ao aos à às é são foi eram ser ter tem tinha há havia não sim mais menos muito muita muitos muitas pouco pouca poucos poucas todo toda todos todas este esta esse essa aquele aquela isso isto aquilo eu tu ele ela nós nos vos eles elas me te lhe lhes".split(
      /\s+/
    )
  );

  const emotionLexicons = {
    melancolia: ["saudade", "silêncio", "perda", "ausência", "noite", "vazio", "memória", "choro", "triste", "longe", "sombra"],
    tensao: ["medo", "sangue", "grito", "pressa", "risco", "ameaça", "culpa", "segredo", "fuga", "corte", "queda"],
    luminosidade: ["luz", "sol", "claro", "riso", "alegria", "manhã", "brilho", "flor", "aberto", "leve", "calma"],
    ironia: ["claro", "óbvio", "ridículo", "quase", "fingir", "ninguém", "todos", "perfeito", "sério", "sorriso"],
    contemplacao: ["olhar", "tempo", "vento", "água", "terra", "janela", "casa", "corpo", "mundo", "devagar", "espera"],
  };

  const semanticFields = {
    corpo: ["corpo", "mão", "olho", "rosto", "boca", "pele", "sangue", "peito", "braço", "perna", "cabeça"],
    casa: ["casa", "porta", "janela", "mesa", "quarto", "cozinha", "parede", "chão", "telhado", "cama"],
    natureza: ["terra", "água", "rio", "mar", "vento", "sol", "chuva", "árvore", "folha", "barro", "céu"],
    memoria: ["memória", "lembrança", "infância", "ontem", "passado", "antigo", "voltar", "recordar", "saudade"],
    conflito: ["medo", "culpa", "segredo", "briga", "guerra", "dívida", "ameaça", "perigo", "morte", "fuga"],
    pensamento: ["penso", "ideia", "verdade", "talvez", "sentido", "mundo", "tempo", "pergunta", "entender"],
    cidade: ["rua", "praça", "ônibus", "prédio", "cidade", "calçada", "mercado", "trânsito", "bairro"],
  };

  function analyze(text) {
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
      punctuation,
      repetitions,
      emotional,
      fields,
      voice: createVoiceReading(gesture, { avgSentence, lexicalDensity, sentenceVariation, emotional, fields }),
      strengths: getStrengths({ avgSentence, lexicalDensity, ttr, sentenceVariation, repetitions, punctuation }),
      blindSpots: getBlindSpots({ words, avgSentence, lexicalDensity, ttr, sentenceVariation, repetitions, paragraphs }),
      audience: getAudience(gesture, { avgSentence, lexicalDensity, fields, emotional }),
      exercises: getExercises(gesture, repetitions),
      disclaimer:
        "Métricas como TTR, extensão de frase e repetição são calculadas localmente. Voz, público e ecos literários são leituras heurísticas, úteis como hipótese de trabalho, não como diagnóstico definitivo.",
    };
  }

  function createVoiceReading(gesture, context) {
    const field = getTopItem(context.fields)?.label || "experiência";
    const emotion = getTopItem(context.emotional)?.label || "atenção";
    const titles = {
      introspectivo: "Voz de interior aceso",
      oral: "Voz de conversa em movimento",
      imagético: "Voz de imagem concreta",
      ensaístico: "Voz de pensamento em marcha",
      seco: "Voz de corte limpo",
      barroco: "Voz de acúmulo e vertigem",
      contemplativo: "Voz de demora sensível",
      narrativo: "Voz de cena em avanço",
    };

    return {
      gesture,
      title: titles[gesture],
      description: `Seu texto tende ao gesto ${gesture}: trabalha ${field} sob temperatura de ${emotion}. Esta leitura nasce de padrões locais de vocabulário, frase, repetição e pontuação.`,
      echoes: getEchoes(gesture),
    };
  }

  function inferGesture({ avgSentence, lexicalDensity, ttr, punctuation, emotional, fields, repetitions }) {
    const topEmotion = getTopItem(emotional)?.label;
    const topField = getTopItem(fields)?.label;

    if (avgSentence > 24 && lexicalDensity > 0.58) return "barroco";
    if (avgSentence < 11 && repetitions.length < 6) return "seco";
    if (topField === "pensamento" && lexicalDensity > 0.52) return "ensaístico";
    if (topEmotion === "contemplacao" || topField === "natureza") return "contemplativo";
    if (topField === "corpo" || topField === "casa") return "imagético";
    if (punctuation.dialogue >= 2) return "oral";
    if (topEmotion === "melancolia" || topField === "memoria") return "introspectivo";
    return "narrativo";
  }

  function getEchoes(gesture) {
    const map = {
      introspectivo: ["introspecção brasileira", "prosa de memória", "romance psicológico"],
      oral: ["tradição oral", "crônica conversada", "narrativa de voz forte"],
      imagético: ["conto imagético", "prosa sensorial", "realismo de detalhe"],
      ensaístico: ["ensaio literário", "crônica reflexiva", "não ficção autoral"],
      seco: ["prosa concisa", "conto de tensão", "realismo direto"],
      barroco: ["prosa torrencial", "romance de linguagem", "voz ornamental"],
      contemplativo: ["crônica lírica", "poesia em prosa", "narrativa atmosférica"],
      narrativo: ["ficção de cena", "romance de enredo", "conto clássico"],
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

  function getBlindSpots({ words, avgSentence, lexicalDensity, ttr, sentenceVariation, repetitions, paragraphs }) {
    const spots = [];
    if (words.length < 500) spots.push("Corpus ainda curto: a leitura da voz fica instável abaixo de 500 palavras.");
    if (ttr < 0.34 && words.length > 120) spots.push("Riqueza vocabular baixa: há risco de repetição não intencional.");
    if (avgSentence > 28) spots.push("Frases muito longas podem criar opacidade e cansaço.");
    if (avgSentence < 8 && words.length > 120) spots.push("Frases muito curtas podem reduzir nuance e música interna.");
    if (sentenceVariation < 4 && words.length > 120) spots.push("Ritmo pouco variado: o texto pode soar plano.");
    if (lexicalDensity < 0.42 && words.length > 120) spots.push("Densidade lexical baixa: muitos conectores e palavras funcionais podem diluir imagem e ação.");
    if (paragraphs.length <= 1 && words.length > 180) spots.push("Pouca respiração em parágrafos: o leitor pode perder orientação visual.");
    repetitions.slice(0, 2).forEach((item) => spots.push(`Verifique a repetição de "${item.word}" (${item.count} ocorrências).`));
    return spots.slice(0, 5);
  }

  function getAudience(gesture, { avgSentence, lexicalDensity, fields, emotional }) {
    const topField = getTopItem(fields)?.label || "voz autoral";
    const topEmotion = getTopItem(emotional)?.label || "ambiguidade";
    const demanding = avgSentence > 24 || lexicalDensity > 0.6;

    return {
      core: demanding
        ? `Leitores de prosa literária que aceitam densidade, ambiguidade e atenção ao gesto verbal.`
        : `Leitores que buscam narrativa legível com marca de voz e imagens recorrentes.`,
      secondary: `Pessoas interessadas em ${topField} e em textos com temperatura de ${topEmotion}.`,
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
    };
    const repetitionExercise = repetitions.length
      ? `Faça uma versão substituindo metade das ocorrências de "${repetitions[0].word}" por imagem, ação ou silêncio.`
      : "Faça uma versão destacando três palavras-chave que deveriam voltar como motivo.";
    return [base[gesture] || base.narrativo, repetitionExercise];
  }

  function scoreLexicons(words, lexicons) {
    const stripped = words.map(stripAccent);
    return Object.entries(lexicons)
      .map(([label, items]) => {
        const keys = items.map(stripAccent);
        const hits = stripped.filter((word) => keys.includes(word)).length;
        return { label, hits, score: Math.min(100, hits * 14) };
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
