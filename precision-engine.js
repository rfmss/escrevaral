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

    if (template.oficio === "roteiro" || template.id === "roteiro-tv") {
      return analyzeRoteiro(normalizedText, words);
    }

    if (template.oficio === "poesia" || template.id === "poesia-lirica") {
      return analyzePoesia(normalizedText, words);
    }

    if (template.id === "romance-comercial" || template.id === "romance-literario") {
      return analyzeRomance(normalizedText, words);
    }

    if (template.id === "ficcao-cientifica") {
      return analyzeFiccaoCientifica(normalizedText, words);
    }

    if (template.id === "fantasia-brasileira") {
      return analyzeFanfaziaBrasileira(normalizedText, words);
    }

    if (template.id === "policial-noir") {
      return analyzePolicialNoir(normalizedText, words);
    }

    if (template.id === "terror-horror") {
      return analyzeTerrorHorror(normalizedText, words);
    }

    if (template.id === "memoir") {
      return analyzeMemoir(normalizedText, words);
    }

    if (template.id === "romance-sentimental" || template.id === "fanfiction") {
      return analyzeRomance(normalizedText, words);
    }

    if (template.id === "romantasy" || template.id === "sci-fi-romantico" || template.id === "new-adult") {
      return analyzeRomantasy(normalizedText, words);
    }

    if (template.id === "suspense-psicologico") {
      return analyzeSuspensePsicologico(normalizedText, words);
    }

    if (template.id === "soneto") {
      return analyzeSoneto(normalizedText, words);
    }

    if (template.id === "slam") {
      return analyzeSlam(normalizedText, words);
    }

    if (template.id === "livro-reportagem") {
      return analyzeMemoir(normalizedText, words);
    }

    if (template.oficio === "jornalismo") {
      return analyzeJornalismo(normalizedText, words);
    }

    if (template.oficio === "comercial-tecnica") {
      return analyzeComercialTecnica(template, normalizedText, words);
    }

    if (template.oficio === "mercado-editorial" || template.oficio === "objeto-livro" || template.oficio === "direitos-autorais") {
      return analyzePlanejamento(template, normalizedText, words);
    }

    return analyzeGeneric(template, normalizedText, words);
  }

  function analyzeFlashFiction(text, words) {
    const firstSentence = getFirstSentence(text);
    const lastSentence = getLastSentence(text);
    const sentences = splitSentences(text);
    const paragraphs = text.split(/\n+/).map((item) => item.trim()).filter(Boolean);
    const sensoryHits = countMatches(text, /\b(cheiro|som|ruído|luz|sombra|gosto|frio|calor|mão|olho|porta|mesa|xícara|café|janela|roupa|casaco|sangue|água|terra|pele|voz|chão|madeira|pedra|fumaça|vento|chuva|barulho|silêncio|couro|vela|areia|sal|pão|ferro|barro|neblina|poeira|carne|cinza)\b/gi);
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
    const everydayHits = countMatches(text, /\b(rua|casa|janela|mesa|ônibus|metro|fila|padaria|café|cozinha|praça|vizinho|chuva|calçada|telefone|mercado|porta|feira|quintal|portão|corredor|bairro|esquina|loja|banco|escola|bicicleta|sacada|varanda|boteco|bar|ônibus|moto|sinal|calor)\b/gi);
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
    const actionHits = countMatches(text, /\b(pegou|olhou|disse|entrou|saiu|correu|parou|abriu|fechou|sentou|levantou|tocou|esperou|voltou|caminhou|falou|respondeu|gritou|sussurrou|chorou|riu|sorriu|abraçou|empurrou|puxou|jogou|largou|chegou|partiu|segurou|atirou|derrubou|ergueu|apontou)\b/gi);
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

  function analyzeRoteiro(text, words) {
    const paragraphs = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const actionHits = countMatches(text, /\b(EXT\.|INT\.|CORTE|FADE|CENA|CLOSE|PLANO|PANORÂMICA)\b/gi);
    const dialogueHits = countMatches(text, /[—"]/g);
    const sluglineHits = countMatches(text, /^(EXT\.|INT\.|EXTERIOR|INTERIOR)\s/gm);
    const actionDescHits = countMatches(text, /\b(entra|sai|olha|corre|para|abre|fecha|senta|levanta|caminha|pega|larga|vira)\b/gi);
    const parentheticalHits = countMatches(text, /\([\w\s]+\)/g);
    const sentences = splitSentences(text);

    const checks = [
      createCheck("Cenas marcadas", sluglineHits >= 1, Math.min(100, sluglineHits * 34), "Cada nova cena começa com linha de cabeçalho: INT./EXT. LOCAL — DIA/NOITE."),
      createCheck("Ações visíveis", actionDescHits >= 4, Math.min(100, actionDescHits * 12), "Roteiro descreve o que a câmera vê, não o que o personagem sente."),
      createCheck("Diálogo presente", dialogueHits >= 2, Math.min(100, dialogueHits * 14), "A fala revela relação de poder, necessidade ou segredo — nunca informação pura."),
      createCheck("Frases curtas na ação", sentences.length >= 5, Math.min(100, sentences.length * 10), "Linhas de ação idealmente têm 3 linhas ou menos."),
      createCheck("Ritmo de blocos", paragraphs.length >= 4, Math.min(100, paragraphs.length * 14), "Blocos curtos dão ritmo visual na leitura e agilidade na decupagem."),
      createCheck("Volume de cena", words >= 100, Math.min(100, words), "Uma cena com menos de 100 palavras pode ser curta demais para respirar."),
    ];

    return summarize(checks, words, 0);
  }

  function analyzePoesia(text, words) {
    const lines = text.split(/\n/).map(s => s.trim()).filter(Boolean);
    const stanzas = text.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
    const imageryHits = countMatches(text, /\b(luz|sombra|água|terra|vento|fogo|olho|mão|boca|corpo|noite|pedra|rio|mar|folha|raiz|chuva|voz|silêncio|osso|sangue|pele|chama|brasa|cinza|névoa|bruma|gelo|ardor|tremor|abismo|pétala|espinho|grão|âmago|íris|âncora|faísca|véu|âmbar|musgo|lama|galho|poeira|areia|semente|sussurro)\b/gi);
    const repetitionHits = countMatches(text, /\b(\w{4,})\b(?=.*\b\1\b)/gi);
    const questionHits = countMatches(text, /\?/g);
    const enjambmentHits = lines.filter(l => l.length > 0 && !/[.!?:;,—]$/.test(l)).length;
    const shortLines = lines.filter(l => l.split(/\s+/).length <= 5).length;

    const checks = [
      createCheck("Imagens concretas", imageryHits >= 3, Math.min(100, imageryHits * 16), "Poesia vive de imagens que engancham sentido e sensação ao mesmo tempo."),
      createCheck("Corte de verso ativo", enjambmentHits >= 2, Math.min(100, enjambmentHits * 16), "O encavalgamento (verso que quebra antes da pontuação) cria tensão e ritmo."),
      createCheck("Variação de verso", shortLines >= 1 && lines.length >= 3, Math.min(100, shortLines * 20 + lines.length * 5), "Versos curtos e longos alternados criam música e ênfase."),
      createCheck("Estrofes ou blocos", stanzas.length >= 2 || lines.length >= 4, Math.min(100, stanzas.length * 32 + lines.length * 8), "Divisão em estrofes organiza o movimento do poema."),
      createCheck("Pergunta ou tensão", questionHits >= 1 || repetitionHits >= 1, Math.min(100, questionHits * 38 + repetitionHits * 20), "Perguntas sem resposta e repetições controladas constroem densidade."),
      createCheck("Compressão do dizer", words <= 200, words <= 200 ? 90 : Math.max(30, 120 - words / 5), "Poesia trabalha com o mínimo que carrega o máximo."),
    ];

    return summarize(checks, words, 0);
  }

  function analyzeRomance(text, words) {
    const firstSentence = getFirstSentence(text);
    const lastSentence = getLastSentence(text);
    const sentences = splitSentences(text);
    const paragraphs = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const characterHits = countMatches(text, /\b(ela|ele|eu|mãe|pai|filho|filha|irmão|irmã|nome próprio|homem|mulher|menino|menina)\b/gi);
    const sensoryHits = countMatches(text, /\b(olhou|sentiu|cheirou|ouviu|tocou|percebeu|viu|notou|reconheceu|enxergou)\b/gi);
    const dialogueHits = countMatches(text, /[—"]/g);
    const actionHits = countMatches(text, /\b(pegou|correu|abriu|fechou|entrou|saiu|sentou|levantou|disse|respondeu|virou|puxou)\b/gi);
    const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
    const hasVariety = lengths.length >= 3 && lengths.some(l => l <= 8) && lengths.some(l => l >= 15);
    const echo = getEchoScore(firstSentence, lastSentence);

    const checks = [
      createCheck("Tamanho de capítulo", words >= 800, Math.min(100, words / 8), "Capítulos de romance geralmente têm entre 1.500 e 5.000 palavras."),
      createCheck("Personagem ativo", characterHits >= 4 && actionHits >= 3, Math.min(100, characterHits * 8 + actionHits * 10), "Alguém precisa agir, não apenas existir na cena."),
      createCheck("Âncoras sensoriais", sensoryHits >= 3, Math.min(100, sensoryHits * 22), "Percepção do personagem ancorando a cena deixa o leitor dentro, não fora."),
      createCheck("Ritmo variado", hasVariety, hasVariety ? 90 : Math.min(60, lengths.length * 12), "Alterne frases curtas de ação com longas de reflexão ou descrição."),
      createCheck("Diálogo ou voz", dialogueHits >= 2, Math.min(100, dialogueHits * 14), "Diálogo que muda a relação dos personagens vale mais do que diálogo de exposição."),
      createCheck("Cena com arco", echo >= 12 || sentences.length >= 20, Math.max(echo, Math.min(100, sentences.length * 5)), "Uma cena que começa em um estado e termina em outro — mínimo de mudança."),
    ];

    return summarize(checks, words, 0);
  }

  function analyzeFiccaoCientifica(text, words) {
    const firstSentence = getFirstSentence(text);
    const sentences = splitSentences(text);
    const paragraphs = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const novumHits = countMatches(text, /\b(tecnologia|sistema|nave|planeta|espaço|robô|androide|código|mutação|colônia|rede|algoritmo|vírus|futuro|passado|portal|dimensão|estação|satélite|nanobot|ia|inteligência artificial|realidade virtual)\b/gi);
    const characterHits = countMatches(text, /\b(ela|ele|eu|comandante|cientista|engenheira|piloto|detetive|agente|androide|humano|criatura)\b/gi);
    const tensionHits = countMatches(text, /\b(mas|porém|então|de repente|descobriu|percebeu|falhou|quebrou|explodiu|errou|ameaça|alerta|perigo|risco|colapso)\b/gi);
    const dialogueHits = countMatches(text, /[—"]/g);
    const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
    const hasVariety = lengths.length >= 3 && lengths.some(l => l <= 8) && lengths.some(l => l >= 15);

    const checks = [
      createCheck("Tamanho de cena", words >= 400, Math.min(100, words / 5), "Cenas de FC precisam de espaço para situar o leitor no mundo."),
      createCheck("Novum presente", novumHits >= 2, Math.min(100, novumHits * 18), "O elemento de FC precisa aparecer nas primeiras páginas — não como catálogo, mas como realidade do personagem."),
      createCheck("Abertura com ancoragem", firstSentence.length >= 20 && firstSentence.length <= 200, scoreOpening(firstSentence), "A FC pede uma abertura que coloca o leitor no mundo antes de explicá-lo."),
      createCheck("Personagem em cena", characterHits >= 3, Math.min(100, characterHits * 14), "Tecnologia sem personagem vira manual — coloque alguém em relação com o novum."),
      createCheck("Conflito com o sistema", tensionHits >= 2, Math.min(100, tensionHits * 22), "FC fica sem força quando o mundo funciona perfeitamente. Introduza uma falha ou ameaça."),
      createCheck("Ritmo variado", hasVariety, hasVariety ? 90 : Math.min(60, lengths.length * 12), "Alterne frase técnica com gesto humano para não virar relatório."),
    ];

    return summarize(checks, words, 0);
  }

  function analyzeFanfaziaBrasileira(text, words) {
    const firstSentence = getFirstSentence(text);
    const sentences = splitSentences(text);
    const paragraphs = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const territorioHits = countMatches(text, /\b(cerrado|sertão|caatinga|nordeste|quilombo|favela|terreiro|mata|rio|morro|aldeia|comunidade|roça|mangue)\b/gi);
    const magiaHits = countMatches(text, /\b(encantado|feitiço|magia|bruxo|benzedeira|rezadeira|orixá|entidade|visagem|assombração|cura|ritual|espírito|ancestral|caboclo|encantaria|pajelança)\b/gi);
    const sensoryHits = countMatches(text, /\b(cheiro|som|terra|raiz|sangue|luz|sombra|barro|cinza|fumaça|erva|folha|água|fogo|vento)\b/gi);
    const dialogueHits = countMatches(text, /[—"]/g);
    const tensionHits = countMatches(text, /\b(mas|porém|então|de repente|percebeu|sentiu|ouviu|chamou|respondeu|apareceu|desapareceu|medo|perigo)\b/gi);

    const checks = [
      createCheck("Tamanho de cena", words >= 300, Math.min(100, words / 3.5), "A fantasia brasileira precisa de espaço para ancorar mundo e personagem."),
      createCheck("Território reconhecível", territorioHits >= 1, Math.min(100, territorioHits * 30), "Fantasias enraizadas num território brasileiro concreto têm chão para a magia pousar."),
      createCheck("Magia ou sobrenatural", magiaHits >= 1, Math.min(100, magiaHits * 25), "O elemento fantástico precisa ser tratado como real dentro do mundo, não como adereço."),
      createCheck("Âncoras sensoriais", sensoryHits >= 3, Math.min(100, sensoryHits * 18), "Paisagem e corpo ancoram a fantasia — substitua generalização por cheiro, textura e som."),
      createCheck("Tensão ou movimento", tensionHits >= 2, Math.min(100, tensionHits * 22), "Fantasia sem conflito vira decoração. Introduza uma força que perturba o equilíbrio."),
      createCheck("Voz e diálogo", dialogueHits >= 1 || paragraphs.length >= 3, Math.min(100, dialogueHits * 20 + paragraphs.length * 12), "A voz da comunidade ou do personagem deve aparecer — em fala, narração ou monólogo interior."),
    ];

    return summarize(checks, words, 0);
  }

  function analyzePolicialNoir(text, words) {
    const firstSentence = getFirstSentence(text);
    const sentences = splitSentences(text);
    const paragraphs = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const criminalHits = countMatches(text, /\b(crime|corpo|cadáver|detetive|delegado|suspeito|alibi|pista|evidência|motivo|testemunha|investigação|culpado|delegacia|polícia|assassino|assassinato|morte|sangue|arma|faca|pistola|tiro)\b/gi);
    const noirHits = countMatches(text, /\b(noite|sombra|beco|chuva|fumaça|neon|bar|whisky|cidade|rua|escuro|calçada|sirene|vidro|traíra|traidor|mentira|segredo)\b/gi);
    const dialogueHits = countMatches(text, /[—"]/g);
    const tensionHits = countMatches(text, /\b(mas|porém|então|de repente|descobriu|percebeu|suspeita|virou|fugiu|mentiu|escondeu|revelou|confessou|atirou|correu)\b/gi);
    const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
    const shortSentences = lengths.filter(l => l <= 10).length;
    const hasNoir = shortSentences >= 3;

    const checks = [
      createCheck("Crime ou tensão presente", criminalHits >= 2, Math.min(100, criminalHits * 20), "Policial sem crime ou ameaça explícita perde o centro de gravidade do gênero."),
      createCheck("Atmosfera noir", noirHits >= 2, Math.min(100, noirHits * 22), "Noir vive de atmosfera — cidade noturna, detalhes sombrios, sensação de inevitabilidade."),
      createCheck("Diálogo cortante", dialogueHits >= 3, Math.min(100, dialogueHits * 12), "Falas curtas e parciais são o motor do noir — cada linha esconde mais do que revela."),
      createCheck("Ritmo de suspeita", tensionHits >= 2, Math.min(100, tensionHits * 22), "A história precisa criar, manter e trair expectativas com regularidade."),
      createCheck("Frases de corte", hasNoir, hasNoir ? 90 : Math.min(60, shortSentences * 20), "Frases curtas criam o ritmo sincopado característico do noir."),
      createCheck("Ponto de observação", firstSentence.length >= 15 && firstSentence.length <= 180, scoreOpening(firstSentence), "A abertura precisa colocar o olhar do narrador na cena, não no backstory."),
    ];

    return summarize(checks, words, 0);
  }

  function analyzeTerrorHorror(text, words) {
    const firstSentence = getFirstSentence(text);
    const sentences = splitSentences(text);
    const paragraphs = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const fearHits = countMatches(text, /\b(medo|terror|pavor|horror|assustador|sombra|escuro|frio|arrepio|grito|sangue|morte|cadáver|fantasma|criatura|monstro|perigo|ameaça|correndo|fugindo|preso|armadilha|silêncio|sussurro|passos|porta|chave|trancado|vítima|predador)\b/gi);
    const atmosphereHits = countMatches(text, /\b(noite|escuridão|névoa|chuva|vento|crepúsculo|isolado|abandonado|vazio|podre|mohoso|fétido|gelado|úmido|sussurro|rangeu|estalou|gemeu|rasgou)\b/gi);
    const sensoryHits = countMatches(text, /\b(cheiro|odor|fedor|frio|calor|arrepio|suor|coração|respiração|pulso|tremeu|engoliu|pele|olhos|ouviu|viu|sentiu|tocou)\b/gi);
    const tensionHits = countMatches(text, /\b(mas|porém|então|de repente|percebeu|descobriu|ouviu|viu|notou|parou|congelou|recuou|correu|escondeu|esperou|não|nunca|ninguém|nada)\b/gi);
    const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
    const shortSentences = lengths.filter(l => l <= 8).length;
    const hasRhythm = shortSentences >= 3;

    const checks = [
      createCheck("Atmosfera de medo", fearHits >= 3 || atmosphereHits >= 2, Math.min(100, fearHits * 14 + atmosphereHits * 18), "Terror precisa de um ambiente que ameaça — antes do monstro aparecer, o lugar já assusta."),
      createCheck("Âncoras sensoriais", sensoryHits >= 3, Math.min(100, sensoryHits * 18), "Medo físico: frio na nuca, suor nas mãos, coração acelerado — o corpo do personagem sente antes da mente entender."),
      createCheck("Abertura perturbadora", firstSentence.length >= 15 && firstSentence.length <= 200, scoreOpening(firstSentence), "A primeira frase precisa criar desconforto imediato — algo errado, algo fora do lugar."),
      createCheck("Tensão sustentada", tensionHits >= 3, Math.min(100, tensionHits * 16), "Terror vive de antecipação — o que pode acontecer assusta mais do que o que já aconteceu."),
      createCheck("Ritmo cortante", hasRhythm, hasRhythm ? 90 : Math.min(60, shortSentences * 22), "Frases curtas em momentos de clímax criam o pulso do terror. Frases longas desaceleram e criam tensão diferente."),
      createCheck("Cenário ou presença", atmosphereHits >= 2 || paragraphs.length >= 3, Math.min(100, atmosphereHits * 22 + paragraphs.length * 14), "O espaço em que o perigo existe precisa de detalhes que o escritor escolhe com cuidado."),
    ];

    return summarize(checks, words, 0);
  }

  function analyzeMemoir(text, words) {
    const firstSentence = getFirstSentence(text);
    const sentences = splitSentences(text);
    const paragraphs = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const firstPersonHits = countMatches(text, /\b(eu|meu|minha|meus|minhas|me|mim|comigo|fui|estava|senti|lembro|pensei|via|ouvia|dizia|precisava|queria|sabia)\b/gi);
    const temporalHits = countMatches(text, /\b(quando|naquela|nesse dia|na época|antes|depois|anos|meses|criança|jovem|adulto|hoje|ontem|naquela tarde|naquele momento|àquela hora|de repente|uma vez|sempre|nunca)\b/gi);
    const sceneHits = countMatches(text, /\b(casa|rua|escola|família|mãe|pai|irmão|irmã|avó|avô|cidade|bairro|quarto|mesa|cozinha|janela|porta|cheiro|voz|mão|olho|corpo|sorriso)\b/gi);
    const reflectionHits = countMatches(text, /\b(aprendi|percebi|entendi|hoje sei|olhando para trás|naquela época não sabia|só depois|agora entendo|me pergunto|ainda carrego|nunca esqueci|permanece|ficou)\b/gi);

    const checks = [
      createCheck("Voz em primeira pessoa", firstPersonHits >= 5, Math.min(100, firstPersonHits * 8), "Memória é contada de dentro — o 'eu' que viveu e o 'eu' que narra convivem no texto."),
      createCheck("Cena específica", sceneHits >= 4, Math.min(100, sceneHits * 12), "Memória de qualidade ancora em cenas concretas — não em abstrações, mas em lugares, pessoas e objetos reais."),
      createCheck("Âncoras temporais", temporalHits >= 3, Math.min(100, temporalHits * 18), "O leitor precisa saber quando: época, idade, estação, hora — qualquer âncora que situa a cena no tempo."),
      createCheck("Reflexão sobre a experiência", reflectionHits >= 1, Math.min(100, reflectionHits * 40), "Memória não é só relato — o narrador presente comenta, questiona ou reavalia o que o narrador passado viveu."),
      createCheck("Abertura com cena", firstSentence.length >= 20, scoreOpening(firstSentence), "Boa memória começa em cena, não em declaração. 'Era um dia comum' é fraco; 'O cheiro de naftalina do guarda-roupa da minha avó' abre um mundo."),
      createCheck("Tamanho para desenvolver", words >= 300, Math.min(100, words / 3), "Memória precisa de espaço para a cena respirar e a reflexão aparecer sem pressa."),
    ];

    return summarize(checks, words, 0);
  }

  function analyzeJornalismo(text, words) {
    const firstSentence = getFirstSentence(text);
    const sentences = splitSentences(text);
    const paragraphs = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const sourceHits = countMatches(text, /\b(segundo|de acordo com|afirmou|declarou|disse|informou|confirmou|revelou|explicou|apontou|pesquisa|estudo|relatório|dados|levantamento|instituto|especialista|fonte)\b/gi);
    const factHits = countMatches(text, /\b(\d+%|\d+ mil|\d+ bilhões|\d+ milhões|em \d{4}|janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b/gi);
    const wHits = countMatches(text, /\b(quem|o que|quando|onde|por que|como|qual)\b/gi);
    const shortParas = paragraphs.filter(p => p.split(/\s+/).filter(Boolean).length <= 60).length;
    const hasTightParas = shortParas >= Math.max(2, Math.floor(paragraphs.length * 0.5));

    const checks = [
      createCheck("Lede informativo", firstSentence.length >= 20 && firstSentence.length <= 250, scoreOpening(firstSentence), "O primeiro parágrafo deve responder ao menos duas perguntas fundamentais: quem, o quê, quando ou onde."),
      createCheck("Atribuição de fonte", sourceHits >= 1, Math.min(100, sourceHits * 28), "Informação jornalística precisa de origem: quem disse, quem pesquisou, de onde vieram os dados."),
      createCheck("Dados ou fatos concretos", factHits >= 1, Math.min(100, factHits * 30), "Números, datas e nomes próprios ancoram o texto — generalização sem evidência enfraquece o texto jornalístico."),
      createCheck("Perguntas fundamentais respondidas", wHits >= 3, Math.min(100, wHits * 18), "Quem, o quê, quando, onde, por que e como — responder ao menos quatro orienta o leitor sem deixar lacunas."),
      createCheck("Parágrafos curtos", hasTightParas, hasTightParas ? 88 : Math.min(60, shortParas * 18), "Jornalismo respira melhor em parágrafos de até 4 linhas — facilita leitura em tela e em papel."),
      createCheck("Volume informativo", words >= 200, Math.min(100, words / 2), "Um texto jornalístico com menos de 200 palavras raramente desenvolve argumento, contexto e fonte de forma equilibrada."),
    ];

    return summarize(checks, words, 0);
  }

  function analyzeComercialTecnica(template, text, words) {
    const sentences = splitSentences(text);
    const paragraphs = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const firstSentence = getFirstSentence(text);
    const callHits = countMatches(text, /\b(clique|acesse|saiba|descubra|faça|experimente|cadastre|baixe|veja|aproveite|solicite|reserve|garanta|compre|assine)\b/gi);
    const benefitHits = countMatches(text, /\b(vantagem|benefício|resultado|economia|ganho|melhora|solução|facilidade|segurança|eficiência|praticidade|valor|retorno)\b/gi);
    const concretHits = countMatches(text, /\b(\d+%|\d+ vezes|\d+ anos?|\d+ dias?|\d+ horas?|\d+\s?reais?|\d+\s?R\$)\b/gi);
    const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
    const hasTightSentences = lengths.some(l => l <= 8);
    const hasBullets = /•|-\s|\d+\.\s/.test(text);

    const checks = [
      createCheck("Abertura com proposta clara", firstSentence.length >= 15 && firstSentence.length <= 180, scoreOpening(firstSentence), "A primeira frase deve responder por que o leitor deveria continuar lendo."),
      createCheck("Benefício concreto", benefitHits >= 1, Math.min(100, benefitHits * 30), "O que o leitor ganha? Mostre o resultado, não apenas o processo."),
      createCheck("Dados ou prova", concretHits >= 1, Math.min(100, concretHits * 35), "Números específicos constroem credibilidade — percentual, prazo, preço ou tempo."),
      createCheck("Chamada para ação", callHits >= 1, Math.min(100, callHits * 40), "Textos comerciais precisam dizer explicitamente o que fazer a seguir."),
      createCheck("Frases diretas", hasTightSentences, hasTightSentences ? 88 : Math.min(60, lengths.length * 10), "Frases curtas aumentam clareza e ritmo de leitura em textos comerciais."),
      createCheck("Estrutura escaneável", hasBullets || paragraphs.length >= 3, Math.min(100, (hasBullets ? 50 : 0) + paragraphs.length * 12), "Listas, tópicos ou parágrafos curtos ajudam leitores a encontrar o que precisam."),
    ];

    return summarize(checks, words, 0);
  }

  function analyzePlanejamento(template, text, words) {
    const sentences = splitSentences(text);
    const paragraphs = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const hasBullets = /•|-\s|\d+\.\s/.test(text);
    const dateHits = countMatches(text, /\b(\d{1,2}\/\d{1,2}|\d{4}|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez|janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b/gi);
    const actionHits = countMatches(text, /\b(enviar|contratar|negociar|publicar|registrar|lançar|submeter|revisar|assinar|contatar|pesquisar|verificar)\b/gi);
    const firstSentence = getFirstSentence(text);

    const checks = [
      createCheck("Conteúdo iniciado", words >= 30, Math.min(100, words * 3), "Preencha as seções do guia com as informações reais do seu projeto."),
      createCheck("Itens ou etapas listadas", hasBullets || paragraphs.length >= 3, Math.min(100, (hasBullets ? 50 : 0) + paragraphs.length * 15), "Listas e etapas tornam o planejamento acionável e revisável."),
      createCheck("Datas ou prazos", dateHits >= 1, Math.min(100, dateHits * 30), "Datas concretas transformam intenção em comprometimento."),
      createCheck("Ações concretas", actionHits >= 1, Math.min(100, actionHits * 28), "Verbos de ação (enviar, negociar, publicar) indicam próximos passos reais."),
      createCheck("Abertura descritiva", firstSentence.length >= 15, firstSentence.length >= 15 ? 85 : Math.min(60, firstSentence.length * 4), "A primeira linha deve situar o contexto do planejamento."),
    ];

    return summarize(checks, words, 0);
  }

  function analyzeRomantasy(text, words) {
    const firstSentence = getFirstSentence(text);
    const sentences = splitSentences(text);
    const romanceHits = countMatches(text, /\b(coração|olhares|tensão|sentiu|queria|desejo|pele|mão|beijo|perto|longe|sorriso|raiva|ciúme|proteção|cuidado|ternura|força|frágil|vulnerável)\b/gi);
    const fantasyHits = countMatches(text, /\b(magia|feitiço|encantamento|poder|luz|sombra|reino|dragão|elfo|fada|portal|destino|profecia|sangue|laço|vínculo|ancestral|maldição|dom|herança)\b/gi);
    const tensionHits = countMatches(text, /\b(mas|porém|não podia|precisava|resistiu|cedeu|afastou|aproximou|evitou|buscou|negava|queria|odiava|amava|temia|precisava)\b/gi);
    const dialogueHits = countMatches(text, /[—"]/g);
    const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
    const hasVariety = lengths.length >= 3 && lengths.some(l => l <= 8) && lengths.some(l => l >= 15);

    const checks = [
      createCheck("Romance presente", romanceHits >= 3, Math.min(100, romanceHits * 14), "Romantasy vive da tensão entre dois protagonistas — atração, conflito, aproximação e recuo precisam coexistir no texto."),
      createCheck("Elemento fantástico", fantasyHits >= 2, Math.min(100, fantasyHits * 22), "O mundo com magia precisa tocar a história diretamente — não como cenário neutro, mas como força que complica o arco romântico."),
      createCheck("Tensão interna", tensionHits >= 3, Math.min(100, tensionHits * 18), "A personagem quer o que não pode ter — pelo mundo, pelo passado, pela missão ou pelo próprio coração."),
      createCheck("Voz e diálogo", dialogueHits >= 2, Math.min(100, dialogueHits * 14), "Romantasy precisa de personagens com voz própria — o que dizem revela mais do que o que pensam."),
      createCheck("Ritmo variado", hasVariety, hasVariety ? 88 : Math.min(55, lengths.length * 15), "Alterne frases longas para mundo e emoção com frases curtas para ação e tensão."),
      createCheck("Abertura no mundo", firstSentence.length >= 15 && firstSentence.length <= 200, scoreOpening(firstSentence), "A primeira frase deve situar o leitor — no corpo da personagem, no cheiro do mundo ou no peso de algo que está por acontecer."),
    ];

    return summarize(checks, words, 0);
  }

  function analyzeSuspensePsicologico(text, words) {
    const firstSentence = getFirstSentence(text);
    const sentences = splitSentences(text);
    const internalHits = countMatches(text, /\b(pensou|lembrou|imaginou|duvidou|sabia|não sabia|sentia|desconfiava|percebia|suspeitava|acordou|sonhou|se perguntou|talvez|seria|estaria|e se|como se|parecia)\b/gi);
    const unreliableHits = countMatches(text, /\b(mas não tinha certeza|ou era|talvez fosse|estava errada|não tinha certeza|enganava|mentia|lembrava errado|não conseguia explicar|não fazia sentido|impossível|deve ter sido|achou que)\b/gi);
    const tensionHits = countMatches(text, /\b(silêncio|ninguém|sozinha|sozinho|escuro|trancada|presa|seguia|olhava|observava|descobriu|revelou|escondeu|mentiu|sabia demais|sabia de menos)\b/gi);
    const revelationHits = countMatches(text, /\b(na verdade|só então|então percebeu|foi só quando|finalmente|de repente|tudo mudou|nunca tinha pensado|agora entendia|foi aí que)\b/gi);
    const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
    const hasShortBursts = lengths.filter(l => l <= 8).length >= 2;

    const checks = [
      createCheck("Mente em foco", internalHits >= 4, Math.min(100, internalHits * 12), "Suspense psicológico acontece dentro da cabeça — o texto precisa habitar o pensamento da narradora, não apenas descrever eventos."),
      createCheck("Narradora não confiável", unreliableHits >= 1, Math.min(100, unreliableHits * 45), "A narradora não precisa mentir para o leitor — basta que ela mente para si mesma, que lembre errado, que interprete torto."),
      createCheck("Tensão de ameaça", tensionHits >= 3, Math.min(100, tensionHits * 18), "O perigo pode ser externo ou interno — a sensação de não estar segura, de não poder confiar, é o motor do suspense."),
      createCheck("Preparação para virada", revelationHits >= 1, Math.min(100, revelationHits * 42), "Suspense psicológico vive de revelações que reescrevem o que o leitor achava que sabia."),
      createCheck("Ritmo cortado", hasShortBursts, hasShortBursts ? 88 : 42, "Frases curtas no momento de tensão criam o pulso do suspense — a resposta física antes da explicação."),
      createCheck("Abertura perturbadora", firstSentence.length >= 15, scoreOpening(firstSentence), "Boa abertura de suspense cria imediatamente uma pergunta sem resposta ou um detalhe fora do lugar."),
    ];

    return summarize(checks, words, 0);
  }

  function analyzeSoneto(text, words) {
    const lines = text.split(/\n/).map(s => s.trim()).filter(Boolean);
    const lineCount = lines.length;
    const hasStructure = lineCount >= 12 && lineCount <= 16;
    const hasFourteen = lineCount === 14;
    const rhymeEndHits = lines.map(l => l.split(/\s+/).pop() || "");
    const lastWords = rhymeEndHits.map(w => w.replace(/[^a-záéíóúãõâêôüç]/gi, "").toLowerCase());
    const uniqueEndings = new Set(lastWords).size;
    const rhymeVariety = uniqueEndings <= 6 && uniqueEndings >= 2;
    const volta = lineCount >= 9 ? lines[8] : "";
    const voltaHits = /\b(mas|porém|contudo|entretanto|no entanto|assim|logo|então|e assim|todavia|decerto|por isso|portanto)\b/i.test(volta);
    const hasPunctuation = countMatches(text, /[,;:—.!?]/g) >= 4;

    const checks = [
      createCheck("Catorze versos", hasFourteen, hasFourteen ? 100 : Math.max(10, Math.min(80, 100 - Math.abs(14 - lineCount) * 15)), "O soneto petrarquiano tem exatamente 14 versos — dois quartetos e dois tercetos. Mais ou menos quebra a forma."),
      createCheck("Estrutura de estrofes", hasStructure, hasStructure ? 90 : Math.min(50, lineCount * 5), "A divisão visual em quarteto-quarteto-terceto-terceto é parte da forma — não decore apenas, distribua as ideias nela."),
      createCheck("Virada no 9º verso", voltaHits, voltaHits ? 95 : 35, "A volta: o 9º verso muda o ângulo — introduz uma contradição, uma conclusão, uma surpresa. É o coração do soneto."),
      createCheck("Rima presente", rhymeVariety, rhymeVariety ? 85 : 45, "O soneto vive de rima — o esquema mais comum é ABBA ABBA CDC DCD ou variante. Consistência é mais importante que perfeição."),
      createCheck("Pontuação expressiva", hasPunctuation, hasPunctuation ? 85 : Math.min(55, hasPunctuation ? 85 : 30), "Pontuação em soneto é estrutural — a vírgula sustém, o ponto finaliza, os dois-pontos anunciam. Cada sinal pesa."),
      createCheck("Compressão verbal", words >= 60 && words <= 120, getRangeScore(words, 60, 130), "Um soneto entre 70 e 100 palavras tem densidade: cada termo precisa trabalhar — ornamento sem função ocupa o espaço da imagem."),
    ];

    return summarize(checks, words, 0);
  }

  function analyzeSlam(text, words) {
    const sentences = splitSentences(text);
    const lines = text.split(/\n/).map(s => s.trim()).filter(Boolean);
    const firstSentence = getFirstSentence(text);
    const urgencyHits = countMatches(text, /\b(agora|hoje|preciso|precisa|não pode|não dá|chega|basta|olha|escuta|veja|sente|existe|resiste|persiste|levanta|grita|fala|diz|nega|rompe|rompa|viva|luta|lute|chore|ria)\b/gi);
    const questionHits = countMatches(text, /[?]/g);
    const repetitionPattern = (() => {
      const firstWords = lines.slice(0, -1).map(l => l.split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
      const freq = firstWords.reduce((m, w) => { m[w] = (m[w] || 0) + 1; return m; }, {});
      return Object.values(freq).some(v => v >= 2);
    })();
    const shortLines = lines.filter(l => l.split(/\s+/).filter(Boolean).length <= 8).length;
    const hasRhythm = shortLines >= Math.max(2, lines.length * 0.3);
    const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
    const hasVariety = lengths.some(l => l <= 6) && lengths.some(l => l >= 12);

    const checks = [
      createCheck("Urgência e presença", urgencyHits >= 4, Math.min(100, urgencyHits * 14), "Slam acontece no presente — o poema fala de dentro, com corpo, sem distância. Verbos de ação e interpelação criam presença."),
      createCheck("Pergunta ao público", questionHits >= 1, Math.min(100, questionHits * 35), "A pergunta retórica é a ferramenta central do slam — confronta, convida, incomoda. Sem ela, o poema fecha em si mesmo."),
      createCheck("Repetição rítmica", repetitionPattern, repetitionPattern ? 90 : 40, "Anáfora — repetir a mesma palavra no início de versos seguidos — é o ritmo do slam. Cria ondas, hipnose, ênfase."),
      createCheck("Versos curtos com gesto", hasRhythm, hasRhythm ? 85 : Math.min(55, shortLines * 14), "Slam é falado em voz alta. Verso curto cria pausa natural, espaço para respirar e para o público absorver."),
      createCheck("Ritmo variado", hasVariety, hasVariety ? 85 : 45, "Alterne versos curtos (impacto) com longos (desenvolvimento) — o fluxo entre eles é o que cria o ritmo performático."),
      createCheck("Abertura que chama", firstSentence.length >= 5 && firstSentence.length <= 120, scoreOpening(firstSentence), "Slam começa sem introdução — a primeira linha já está no assunto. Sem preâmbulo: direto ao coração do que precisa ser dito."),
    ];

    return summarize(checks, words, 0);
  }

  function analyzeGeneric(template, text, words) {
    const sentences = splitSentences(text);
    const paragraphs = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const firstSentence = getFirstSentence(text);

    // Variedade de comprimento das frases
    const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
    const avgLen = lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
    const hasVariety = lengths.length >= 3 && lengths.some(l => l <= 8) && lengths.some(l => l >= 15);

    // Densidade de advérbios em -mente
    const menteHits = countMatches(text, /\w+mente\b/gi);
    const menteDensity = words > 0 ? menteHits / words : 0;

    // Proporção de frases interrogativas ou exclamativas (dinamismo)
    const dynamicHits = countMatches(text, /[?!]/g);

    const checks = [
      createCheck("Texto em andamento", words >= 50, Math.min(100, words * 2), "Um rascunho maior permite pistas mais precisas."),
      createCheck("Abertura com força", firstSentence.length >= 20 && firstSentence.length <= 200, scoreOpening(firstSentence), "A primeira frase carrega o convite para o texto inteiro."),
      createCheck("Variedade de ritmo", hasVariety, hasVariety ? 90 : Math.min(60, lengths.length * 15), "Alterne frases curtas e longas para criar fluxo e ênfase."),
      createCheck("Uso moderado de advérbios", menteDensity < 0.04, menteDensity < 0.04 ? 90 : Math.max(20, 90 - Math.round((menteDensity - 0.04) * 1000)), "Advérbios em -mente usados em excesso enfraquecem verbos precisos."),
      createCheck("Paragrafação presente", paragraphs.length >= 2, Math.min(100, paragraphs.length * 30), "Blocos de texto ajudam a respirar entre as ideias."),
      createCheck("Forma escolhida", Boolean(template?.id), template?.id ? 100 : 40, "Abrir um guia de escrita ativa análise mais específica."),
    ];

    return summarize(checks, words, 0);
  }

  function summarize(checks, words, limit) {
    const score = Math.round(checks.reduce((total, check) => total + check.score, 0) / checks.length);
    const gaps = checks.filter(c => c.passed === false);
    const strengths = checks.filter(c => c.passed === true);
    const status = score >= 88 ? "Elementos do guia bem cobertos"
      : score >= 70 ? "Boa base em desenvolvimento"
      : score >= 50 ? "Ainda em formação"
      : "Rascunho inicial";

    return {
      score,
      status,
      words,
      limit,
      checks,
      gaps,
      strengths,
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
