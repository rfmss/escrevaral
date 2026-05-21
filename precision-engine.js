(function precisionEngine(global) {
  function analyze(template, text) {
    const normalizedText = normalize(text);
    const words = countWords(normalizedText);

    if (template.id === "flash-fiction") {
      return analyzeFlashFiction(normalizedText, words);
    }

    if (template.id === "cronica") {
      return analyzeCronica(normalizedText, words);
    }

    if (template.id === "conto-curto") {
      return analyzeContoCurto(normalizedText, words);
    }

    if (template.id === "ensaio") {
      return analyzeEnsaio(normalizedText, words);
    }

    if (template.oficio === "estudo-vestibular" || template.id === "redacao-enem") {
      return analyzeEnem(normalizedText, words);
    }

    return analyzeGeneric(template, normalizedText, words);
  }

  function analyzeFlashFiction(text, words) {
    const firstSentence = getFirstSentence(text);
    const lastSentence = getLastSentence(text);
    const sentences = splitSentences(text);
    const paragraphs = text.split(/\n+/).map((item) => item.trim()).filter(Boolean);
    const sensoryHits = countMatches(text, /\b(cheiro|som|ruído|luz|sombra|gosto|frio|calor|mão|olho|porta|mesa|xícara|café|janela|roupa|casaco|sangue|água|terra|pele)\b/gi);
    const turnHits = countMatches(text, /\b(mas|porém|então|quando|até que|só que|de repente|na verdade|descobriu|percebeu)\b/gi);
    const explanationHits = countMatches(text, /\b(porque|pois|significava|sentia|pensava|lembrava|explicou|entendeu que)\b/gi);
    const repeatedRatio = getTopWordRatio(text);
    const firstLastEcho = getEchoScore(firstSentence, lastSentence);

    const checks = [
      createCheck("Limite do subformato", words > 0 && words <= 500, getRangeScore(words, 80, 500), "Até 500 palavras mantém a compressão do flash."),
      createCheck("Imagem âncora", sensoryHits >= 2, Math.min(100, sensoryHits * 28), "Procure um objeto, gesto ou detalhe sensorial que carregue peso."),
      createCheck("Abertura com pergunta", firstSentence.length > 20 && firstSentence.length < 180, scoreOpening(firstSentence), "A primeira frase precisa abrir tensão, não explicar o mundo."),
      createCheck("Virada perceptível", turnHits > 0, Math.min(100, turnHits * 34), "Uma mudança de leitura ajuda o texto a fechar com força."),
      createCheck("Fechamento em eco", firstLastEcho >= 20, firstLastEcho, "O fim pode espelhar, contrariar ou iluminar a abertura."),
      createCheck("Compressão", explanationHits <= 3 && repeatedRatio < 0.18, scoreCompression(explanationHits, repeatedRatio), "Ficção-relâmpago perde força quando explica ou repete demais."),
      createCheck("Respiração do texto", paragraphs.length >= 2 && sentences.length >= 3, Math.min(100, paragraphs.length * 22 + sentences.length * 8), "Blocos e frases precisam dar ritmo sem virar resumo."),
    ];

    return summarize(checks, words, 500);
  }

  function analyzeCronica(text, words) {
    const firstSentence = getFirstSentence(text);
    const lastSentence = getLastSentence(text);
    const everydayHits = countMatches(text, /\b(rua|casa|janela|mesa|ônibus|metro|fila|padaria|café|cozinha|praça|vizinho|chuva|calçada|telefone|mercado|porta)\b/gi);
    const reflectionHits = countMatches(text, /\b(talvez|parece|penso|percebo|lembro|como se|no fundo|afinal|ninguém|todo mundo|a gente)\b/gi);
    const toneHits = countMatches(text, /\b(riso|sorriso|silêncio|saudade|ironia|estranho|bonito|triste|leve|pequeno|delicado)\b/gi);
    const paragraphs = text.split(/\n+/).map((item) => item.trim()).filter(Boolean);
    const echo = getEchoScore(firstSentence, lastSentence);

    const checks = [
      createCheck("Tamanho de crônica", words >= 180 && words <= 1200, getRangeScore(words, 180, 1200), "A crônica costuma respirar melhor entre recorte breve e desenvolvimento suficiente."),
      createCheck("Cena cotidiana", everydayHits >= 2, Math.min(100, everydayHits * 24), "O texto precisa encostar em uma cena comum antes de abrir reflexão."),
      createCheck("Olhar autoral", reflectionHits >= 2, Math.min(100, reflectionHits * 24), "A crônica ganha assinatura quando o olhar aparece sem virar sermão."),
      createCheck("Tom perceptível", toneHits >= 2, Math.min(100, toneHits * 26), "Humor, afeto, melancolia ou ironia ajudam a sustentar a voz."),
      createCheck("Fecho com eco", echo >= 16, echo, "O final deve deixar uma ressonância, não apenas encerrar o assunto."),
      createCheck("Respiração em blocos", paragraphs.length >= 3, Math.min(100, paragraphs.length * 22), "Parágrafos curtos ajudam a crônica a andar com leveza."),
    ];

    return summarize(checks, words, 1200);
  }

  function analyzeContoCurto(text, words) {
    const firstSentence = getFirstSentence(text);
    const sentences = splitSentences(text);
    const actionHits = countMatches(text, /\b(pegou|olhou|disse|entrou|saiu|correu|parou|abriu|fechou|sentou|levantou|tocou|esperou|voltou|caminhou)\b/gi);
    const conflictHits = countMatches(text, /\b(mas|porém|medo|segredo|dívida|culpa|perda|ameaça|mentira|escolha|impossível|nunca|último|contra)\b/gi);
    const characterHits = countMatches(text, /\b(ela|ele|eu|mãe|pai|filho|filha|irmão|irmã|mulher|homem|menino|menina|velho|velha)\b/gi);
    const turnHits = countMatches(text, /\b(então|quando|até que|de repente|percebeu|descobriu|naquela hora|só então)\b/gi);
    const dialogueHits = countMatches(text, /[—"]/g);

    const checks = [
      createCheck("Tamanho de conto curto", words >= 500 && words <= 3500, getRangeScore(words, 500, 3500), "O conto curto precisa de espaço para cena, conflito e consequência."),
      createCheck("Personagem em cena", characterHits >= 4, Math.min(100, characterHits * 12), "Alguém precisa atravessar o acontecimento, não só uma ideia."),
      createCheck("Conflito ativo", conflictHits >= 2, Math.min(100, conflictHits * 26), "O conto precisa de resistência, risco ou escolha."),
      createCheck("Ação concreta", actionHits >= 4, Math.min(100, actionHits * 14), "Cenas ganham força quando algo acontece diante do leitor."),
      createCheck("Virada ou mudança", turnHits >= 1, Math.min(100, turnHits * 34), "Alguma coisa deve mudar de estado no percurso."),
      createCheck("Voz em cena", dialogueHits >= 2 || firstSentence.length < 170, dialogueHits >= 2 ? 86 : scoreOpening(firstSentence), "Diálogo ou abertura precisa puxar o leitor para dentro da cena."),
      createCheck("Progressão narrativa", sentences.length >= 10, Math.min(100, sentences.length * 8), "O texto precisa avançar em etapas, não só descrever uma situação."),
    ];

    return summarize(checks, words, 3500);
  }

  function analyzeEnsaio(text, words) {
    const paragraphs = text.split(/\n+/).map((item) => item.trim()).filter(Boolean);
    const thesisHits = countMatches(text, /\b(defendo|proponho|acredito|tese|ideia|questão|problema|argumento|sustento|pretendo)\b/gi);
    const connectorHits = countMatches(text, /\b(portanto|porém|assim|além disso|no entanto|contudo|porque|pois|desse modo|por outro lado|em primeiro lugar)\b/gi);
    const counterpointHits = countMatches(text, /\b(por outro lado|no entanto|contudo|ainda assim|embora|mas|objeção|contraponto|limite)\b/gi);
    const evidenceHits = countMatches(text, /\b(exemplo|caso|dados|história|experiência|autor|livro|pesquisa|cena|episódio)\b/gi);
    const questionHits = countMatches(text, /\?/g);

    const checks = [
      createCheck("Tamanho de ensaio", words >= 700 && words <= 5000, getRangeScore(words, 700, 5000), "O ensaio precisa desenvolver uma ideia sem perder direção."),
      createCheck("Tese identificável", thesisHits >= 1 || questionHits >= 1, Math.min(100, thesisHits * 38 + questionHits * 18), "Uma tese ou pergunta central orienta a leitura."),
      createCheck("Progressão argumentativa", connectorHits >= 4, Math.min(100, connectorHits * 16), "Conectores ajudam o pensamento a avançar com clareza."),
      createCheck("Contraponto", counterpointHits >= 1, Math.min(100, counterpointHits * 34), "Reconhecer tensão deixa o ensaio mais confiável."),
      createCheck("Exemplos ou evidências", evidenceHits >= 2, Math.min(100, evidenceHits * 24), "Ideias ficam mais fortes quando encostam em exemplos."),
      createCheck("Organização em blocos", paragraphs.length >= 4, Math.min(100, paragraphs.length * 18), "Parágrafos bem marcados dão percurso ao raciocínio."),
    ];

    return summarize(checks, words, 5000);
  }

  function analyzeEnem(text, words) {
    const paragraphs = text.split(/\n+/).map((item) => item.trim()).filter(Boolean);
    const sentences = splitSentences(text);
    const connectorHits = countMatches(text, /\b(além disso|ademais|outrossim|soma-se a isso|nesse sentido|isso ocorre porque|haja vista|no entanto|contudo|todavia|portanto|dessa forma|desse modo|diante do exposto|a fim de|para que|por meio de)\b/gi);
    const repertoryHits = countMatches(text, /\b(segundo|de acordo com|conforme|filósofo|sociólogo|constituição|lei|ibge|onu|unesco|obra|livro|filme|história|pesquisa|dados)\b/gi);
    const thesisHits = countMatches(text, /\b(problema|persistência|desafio|decorre|deve-se|causa|consequência|necessário|torna-se)\b/gi);
    const informalHits = countMatches(text, /\b(tipo|né|pra|tá|coisa|legal|muito top|aí|daí)\b/gi);
    const copiedMotivatorHits = countMatches(text, /\b(texto motivador|como mostra o texto|na coletânea)\b/gi);
    const agentHits = countMatches(text, /\b(estado|governo|ministério|escola|mídia|empresas|sociedade civil|família|ongs|poder público)\b/gi);
    const actionHits = countMatches(text, /\b(deve|devem|promover|criar|ampliar|fiscalizar|implementar|garantir|realizar|desenvolver|regulamentar)\b/gi);
    const meansHits = countMatches(text, /\b(por meio de|mediante|através de|com campanhas|por intermédio|em parceria)\b/gi);
    const purposeHits = countMatches(text, /\b(a fim de|para que|com o objetivo de|com a finalidade de|visando)\b/gi);
    const effectHits = countMatches(text, /\b(com isso|assim|desse modo|dessa forma|resultado|efeito|reduzir|mitigar|combater|assegurar)\b/gi);
    const interventionScore = [agentHits, actionHits, meansHits, purposeHits, effectHits].filter(Boolean).length;

    const checks = [
      createCheck("C1 - norma padrão", informalHits === 0 && words >= 80, Math.max(0, 96 - informalHits * 22), "Evite informalidade, marcas de fala e deslizes acumulados de registro."),
      createCheck("C2 - proposta e recorte", words >= 120 && copiedMotivatorHits === 0, getRangeScore(words, 120, 450) - copiedMotivatorHits * 18, "Mostre que entendeu o tema real sem copiar os textos motivadores."),
      createCheck("C3 - tese e argumentos", thesisHits >= 3 && repertoryHits >= 1, Math.min(100, thesisHits * 12 + repertoryHits * 24), "Tese, repertório e argumentos precisam trabalhar juntos."),
      createCheck("C4 - coesão", connectorHits >= 4 && paragraphs.length >= 3, Math.min(100, connectorHits * 13 + paragraphs.length * 10), "Use conectivos com função clara e parágrafos em progressão."),
      createCheck("C5 - intervenção", interventionScore >= 4, interventionScore * 20, "Inclua agente, ação, meio, finalidade e efeito respeitando direitos humanos."),
      createCheck("Arquitetura ENEM", paragraphs.length >= 4 && sentences.length >= 8, Math.min(100, paragraphs.length * 18 + sentences.length * 4), "Introdução, dois desenvolvimentos e proposta final deixam a correção mais legível."),
    ];

    return summarize(checks, words, 450);
  }

  function analyzeGeneric(template, text, words) {
    const checks = [
      createCheck("Texto iniciado", words > 0, words > 0 ? 100 : 0, "Comece com um primeiro bloco de escrita."),
      createCheck("Forma escolhida", Boolean(template?.id), 100, "O texto está ligado a um guia de escrita."),
      createCheck("Tamanho útil", words >= 50, Math.min(100, words * 2), "Um rascunho maior permite análise melhor."),
    ];

    return summarize(checks, words, 0);
  }

  function summarize(checks, words, limit) {
    const score = Math.round(checks.reduce((total, check) => total + check.score, 0) / checks.length);

    return {
      score,
      status: score >= 82 ? "Pronto para leitura editorial" : score >= 60 ? "Boa base" : "Em formação",
      words,
      limit,
      checks,
    };
  }

  function createCheck(label, passed, score, hint) {
    return {
      label,
      passed,
      score: Math.max(0, Math.min(100, Math.round(score))),
      hint,
    };
  }

  function normalize(text) {
    return (text || "").replace(/\u00a0/g, " ").trim();
  }

  function countWords(text) {
    return text ? text.split(/\s+/).filter(Boolean).length : 0;
  }

  function splitSentences(text) {
    return text.split(/[.!?]+/).map((item) => item.trim()).filter(Boolean);
  }

  function getFirstSentence(text) {
    return splitSentences(text)[0] || "";
  }

  function getLastSentence(text) {
    const sentences = splitSentences(text);
    return sentences[sentences.length - 1] || "";
  }

  function countMatches(text, pattern) {
    return (text.match(pattern) || []).length;
  }

  function getRangeScore(value, idealMin, max) {
    if (!value) {
      return 0;
    }

    if (value > max) {
      return Math.max(0, 100 - (value - max));
    }

    if (value < idealMin) {
      return Math.round((value / idealMin) * 72);
    }

    return 100;
  }

  function scoreOpening(sentence) {
    if (!sentence) {
      return 0;
    }

    let score = 45;
    if (sentence.length <= 150) score += 20;
    if (/[?]/.test(sentence)) score += 15;
    if (/\b(hoje|quando|antes|depois|ninguém|ela|ele|eu|ainda)\b/i.test(sentence)) score += 10;
    if (/\b(era|foi|estava)\b/i.test(sentence) && sentence.length > 120) score -= 10;
    return score;
  }

  function scoreCompression(explanationHits, repeatedRatio) {
    const explanationScore = Math.max(0, 100 - explanationHits * 18);
    const repetitionScore = Math.max(0, 100 - repeatedRatio * 420);
    return Math.round((explanationScore + repetitionScore) / 2);
  }

  function getTopWordRatio(text) {
    const words = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .match(/[a-z]{4,}/g) || [];

    if (!words.length) {
      return 0;
    }

    const counts = words.reduce((map, word) => {
      map[word] = (map[word] || 0) + 1;
      return map;
    }, {});
    const top = Math.max(...Object.values(counts));
    return top / words.length;
  }

  function getEchoScore(firstSentence, lastSentence) {
    const firstWords = getRelevantWords(firstSentence);
    const lastWords = getRelevantWords(lastSentence);

    if (!firstWords.length || !lastWords.length) {
      return 0;
    }

    const shared = firstWords.filter((word) => lastWords.includes(word)).length;
    return Math.min(100, shared * 32 + Math.min(firstWords.length, lastWords.length) * 3);
  }

  function getRelevantWords(value) {
    return (
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .match(/[a-z]{4,}/g) || []
    ).slice(0, 12);
  }

  global.VeredaPrecision = {
    analyze,
  };
})(window);
