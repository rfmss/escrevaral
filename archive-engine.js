(function archiveEngine(global) {
  const DOCUMENT_TYPES = [
    "projeto",
    "manuscrito",
    "pesquisa",
    "glossário",
    "submissão",
    "revisão",
    "personagem",
    "cena",
    "mundo",
    "lugar",
    "instituição",
    "objeto",
    "cronologia",
    "capítulo",
    "tema",
    "escaleta",
    "cena-roteiro",
    "ato",
    "personagem-roteiro",
    "pauta",
    "fonte",
    "entrevista",
    "fato",
    "poema",
    "série-poética",
    "argumento",
    "crônica",
  ];

  const TYPE_ALIASES = {
    "fonte-jorn": "fonte",
  };

  const TYPE_FAMILY = {
    projeto: "base",
    manuscrito: "base",
    pesquisa: "base",
    glossário: "base",
    submissão: "base",
    revisão: "base",
    personagem: "ficção",
    cena: "ficção",
    mundo: "ficção",
    lugar: "ficção",
    instituição: "ficção",
    objeto: "ficção",
    cronologia: "ficção",
    capítulo: "ficção",
    tema: "ficção",
    escaleta: "roteiro",
    "cena-roteiro": "roteiro",
    ato: "roteiro",
    "personagem-roteiro": "roteiro",
    pauta: "jornalismo",
    fonte: "jornalismo",
    entrevista: "jornalismo",
    fato: "jornalismo",
    poema: "poesia",
    "série-poética": "poesia",
    argumento: "ensaio",
    crônica: "ensaio",
    livro: "pausado",
    direitos: "pausado",
  };

  const ARCHIVE_ORDER = ["base", "ficção", "roteiro", "jornalismo", "poesia", "ensaio", "pausado"];

  const FAMILY_LABEL = {
    base: "Projeto e base",
    ficção: "Ficção literária",
    roteiro: "Roteiro",
    jornalismo: "Jornalismo",
    poesia: "Poesia",
    ensaio: "Ensaio e crônica",
    pausado: "Pausados",
  };

  const META_TEMPLATES = {
    projeto: {
      description: "A obra em si - sinopse, público, estágio e tom geral.",
      fields: [
        { key: "título", label: "Título de trabalho", hint: "Pode mudar - é para orientação interna", type: "string" },
        { key: "gênero", label: "Gênero", hint: "Romance, conto, roteiro, poesia, reportagem...", type: "string" },
        { key: "sinopse", label: "Sinopse", hint: "Do que se trata - uma ou duas frases", type: "string" },
        { key: "público", label: "Público-alvo", hint: "Repertório, sensibilidade e onde circula", type: "string" },
        { key: "tom", label: "Tom geral", hint: "Como o projeto soa - seco, lírico, urgente, irônico...", type: "string" },
        { key: "estágio", label: "Estágio", hint: "Ideia, rascunho, revisão, finalizado, publicado", type: "string" },
        { key: "prazo", label: "Prazo", hint: "Data alvo - submissão, publicação, entrega", type: "string" },
        { key: "promessa", label: "Promessa de leitura", hint: "O que o leitor vai sentir ou saber ao terminar", type: "string" },
      ],
    },
    manuscrito: {
      description: "Texto principal - corpo livre sem painel de meta.",
      fields: [],
    },
    pesquisa: {
      description: "Fonte absorvida pelo projeto - também cobre bibliografia.",
      fields: [
        { key: "fonte", label: "Fonte", hint: "Livro, artigo, entrevista, link", type: "string" },
        { key: "autor", label: "Autor", hint: "Para referências formais", type: "string" },
        { key: "ano", label: "Ano", hint: "Ano de publicação", type: "string" },
        { key: "editora", label: "Editora / publicação", hint: "Para referências formais", type: "string" },
        { key: "tema", label: "Tema", hint: "Assunto central", type: "string" },
        { key: "trecho", label: "Trecho / dado", hint: "O que vale guardar", type: "string" },
        { key: "confiabilidade", label: "Confiabilidade", hint: "Alta, média, baixa, verificar", type: "string" },
        { key: "uso", label: "Como usar", hint: "Em que parte do projeto entra", type: "string" },
      ],
    },
    glossário: {
      description: "Termo do mundo - definição, origem e uso.",
      fields: [
        { key: "termo", label: "Termo", hint: "A palavra ou expressão", type: "string" },
        { key: "definição", label: "Definição", hint: "O que significa neste mundo", type: "string" },
        { key: "origem", label: "Origem", hint: "De onde vem", type: "string" },
        { key: "uso", label: "Exemplo de uso", hint: "Trecho em contexto", type: "string" },
      ],
    },
    submissão: {
      description: "Envio editorial - editora, prazo, situação e resposta.",
      fields: [
        { key: "editora", label: "Editora / revista", hint: "Para onde vai", type: "string" },
        { key: "chamada", label: "Chamada pública", hint: "Nome do edital ou chamada", type: "string" },
        { key: "prazo", label: "Prazo", hint: "Data limite de envio", type: "string" },
        { key: "formato", label: "Formato exigido", hint: "Extensão, arquivo, normas da editora", type: "string" },
        { key: "status", label: "Situação", hint: "A enviar, enviado, aguardando, aceito, recusado", type: "string" },
        { key: "resposta", label: "Resposta", hint: "O que a editora disse", type: "string" },
        { key: "versão", label: "Versão enviada", hint: "ID do manuscrito ou snapshot enviado", type: "ref" },
        { key: "link", label: "Link", hint: "Edital, formulário, página da chamada", type: "string" },
      ],
    },
    revisão: {
      description: "Nota de processo - problema recorrente, decisão e situação.",
      fields: [
        { key: "tipo", label: "Tipo de revisão", hint: "Ortográfica, gramatical, estilística, estrutural, de conteúdo", type: "string" },
        { key: "problema", label: "Problema recorrente", hint: "O padrão que aparece - não a ocorrência isolada", type: "string" },
        { key: "trecho", label: "Trecho afetado", hint: "Exemplo ou localização no manuscrito", type: "string" },
        { key: "decisão", label: "Decisão", hint: "O que foi resolvido e por quê", type: "string" },
        { key: "status", label: "Situação", hint: "Identificado, em revisão, resolvido, adiado", type: "string" },
      ],
    },
    personagem: {
      description: "Ser vivo no projeto - nome, desejo, conflito e arco.",
      fields: [
        { key: "nome", label: "Nome", hint: "Como é chamado no texto", type: "string" },
        { key: "papel", label: "Papel", hint: "Protagonista, antagonista, coadjuvante...", type: "string" },
        { key: "desejo", label: "O que quer", hint: "Objetivo consciente", type: "string" },
        { key: "conflito", label: "O que impede", hint: "Obstáculo central", type: "string" },
        { key: "arco", label: "Como muda", hint: "Transformação ao longo da narrativa", type: "string" },
        { key: "voz", label: "Voz", hint: "Tom, vocabulário, modo de falar", type: "string" },
        { key: "segredo", label: "Segredo", hint: "O que esconde", type: "string" },
        { key: "relações", label: "Relações", hint: "IDs de personagens ligados", type: "array" },
      ],
    },
    cena: {
      description: "Unidade dramática - onde, quem e objetivo dramático.",
      fields: [
        { key: "capítulo", label: "Capítulo", hint: "Título ou número do capítulo pai", type: "string" },
        { key: "lugar", label: "Lugar", hint: "ID de documento tipo lugar", type: "ref" },
        { key: "personagens", label: "Personagens", hint: "IDs dos presentes", type: "array" },
        { key: "objetivo", label: "Objetivo dramático", hint: "O que a cena resolve ou avança", type: "string" },
        { key: "clima", label: "Clima emocional", hint: "Tensão, leveza, medo...", type: "string" },
        { key: "pov", label: "Ponto de vista", hint: "Quem narra ou focaliza", type: "string" },
      ],
    },
    mundo: {
      description: "Sistema amplo - regras, sociedade e tensão estrutural.",
      fields: [
        { key: "nome", label: "Nome do mundo", hint: "Como é chamado no projeto", type: "string" },
        { key: "regra", label: "Regra fundamental", hint: "O que este mundo permite ou proíbe que o nosso não", type: "string" },
        { key: "sociedade", label: "Sociedade", hint: "Como o poder está organizado", type: "string" },
        { key: "tensão", label: "Tensão central", hint: "Conflito estrutural que permeia o cenário", type: "string" },
        { key: "lugares", label: "Lugares", hint: "IDs de documentos tipo lugar neste mundo", type: "array" },
        { key: "instituições", label: "Instituições", hint: "IDs de documentos tipo instituição", type: "array" },
      ],
    },
    lugar: {
      description: "Espaço específico - casa, cidade, nave, redação, praça.",
      fields: [
        { key: "nome", label: "Nome", hint: "Como aparece no texto", type: "string" },
        { key: "mundo", label: "Mundo pai", hint: "ID do mundo a que pertence, se aplicável", type: "ref" },
        { key: "tipo", label: "Tipo", hint: "Interior, exterior, urbano, rural, espacial, virtual...", type: "string" },
        { key: "atmosfera", label: "Atmosfera", hint: "Como se sente estar aqui - cheiro, luz, som, textura", type: "string" },
        { key: "função", label: "Função narrativa", hint: "O que acontece aqui na história", type: "string" },
        { key: "personagens", label: "Personagens frequentes", hint: "IDs de quem habita ou frequenta", type: "array" },
      ],
    },
    instituição: {
      description: "Grupo de poder - governo, facção, corporação, culto.",
      fields: [
        { key: "nome", label: "Nome", hint: "Como é chamada no texto", type: "string" },
        { key: "tipo", label: "Tipo", hint: "Estado, corporação, facção, culto, resistência, guilda...", type: "string" },
        { key: "objetivo", label: "Objetivo", hint: "O que quer - poder, sobrevivência, crença, lucro", type: "string" },
        { key: "método", label: "Método", hint: "Como age para alcançar o objetivo", type: "string" },
        { key: "contradição", label: "Contradição interna", hint: "O que a divide ou enfraquece", type: "string" },
        { key: "membros", label: "Membros", hint: "IDs de personagens ligados", type: "array" },
        { key: "mundo", label: "Mundo", hint: "ID do mundo onde opera", type: "ref" },
      ],
    },
    objeto: {
      description: "Item com peso simbólico ou narrativo.",
      fields: [
        { key: "nome", label: "Nome", hint: "Como é chamado no texto", type: "string" },
        { key: "aparência", label: "Aparência", hint: "Como se vê, cheira, pesa", type: "string" },
        { key: "história", label: "História", hint: "De onde veio, o que já viveu", type: "string" },
        { key: "dono", label: "Dono atual", hint: "ID do personagem que o possui", type: "ref" },
        { key: "significado", label: "Significado", hint: "O que representa no plano simbólico", type: "string" },
      ],
    },
    cronologia: {
      description: "Evento no tempo - antes, depois, consequência.",
      fields: [
        { key: "data", label: "Data / época", hint: "Pode ser relativa: ano 3 da Queda", type: "string" },
        { key: "evento", label: "Evento", hint: "O que aconteceu - uma frase", type: "string" },
        { key: "antes", label: "O que causou", hint: "Evento ou condição anterior", type: "string" },
        { key: "depois", label: "Consequência", hint: "O que este evento desencadeou", type: "string" },
        { key: "personagens", label: "Envolvidos", hint: "IDs de personagens ligados ao evento", type: "array" },
      ],
    },
    capítulo: {
      description: "Estrutura intermediária entre cena e manuscrito.",
      fields: [
        { key: "número", label: "Número", hint: "Posição na sequência", type: "number" },
        { key: "título", label: "Título provisório", hint: "Para orientação interna", type: "string" },
        { key: "arco", label: "Arco do capítulo", hint: "O que muda entre a primeira e a última cena", type: "string" },
        { key: "pov", label: "POV dominante", hint: "Quem focaliza, se houver foco único", type: "string" },
        { key: "cenas", label: "Cenas filhas", hint: "IDs de cenas que compõem este capítulo", type: "array" },
      ],
    },
    tema: {
      description: "Intenção autoral - o que o projeto quer dizer.",
      fields: [
        { key: "enunciado", label: "Enunciado", hint: "O tema em uma frase - o que o livro diz sobre a vida", type: "string" },
        { key: "tensão", label: "Tensão temática", hint: "O que o tema questiona ou recusa", type: "string" },
        { key: "imagem", label: "Imagem central", hint: "Metáfora ou cena que encarna o tema", type: "string" },
      ],
    },
    escaleta: {
      description: "Sequência de cenas com função dramática.",
      fields: [
        { key: "título", label: "Título do projeto", hint: "Nome do roteiro ou episódio", type: "string" },
        { key: "formato", label: "Formato", hint: "Longa, curta, série, novela, episódio", type: "string" },
        { key: "total-cenas", label: "Total de cenas", hint: "Estimativa antes de detalhar", type: "number" },
      ],
    },
    "cena-roteiro": {
      description: "Unidade com slug line, ação e personagens.",
      fields: [
        { key: "slug", label: "Slug line", hint: "INT./EXT. LUGAR - DIA/NOITE", type: "string" },
        { key: "número", label: "Número", hint: "Posição na escaleta", type: "number" },
        { key: "ação", label: "Linha de ação", hint: "Resumo do que acontece", type: "string" },
        { key: "personagens", label: "Personagens", hint: "IDs dos presentes", type: "array" },
        { key: "objetivo", label: "Objetivo dramático", hint: "O que a cena resolve", type: "string" },
        { key: "nota-produção", label: "Nota de produção", hint: "Efeito especial, figurino ou locação específica", type: "string" },
      ],
    },
    ato: {
      description: "Divisão estrutural do roteiro.",
      fields: [
        { key: "número", label: "Número", hint: "Posição na estrutura", type: "number" },
        { key: "função", label: "Função dramática", hint: "O que este ato precisa realizar", type: "string" },
        { key: "virada", label: "Virada de ato", hint: "O evento que fecha ou abre este ato", type: "string" },
        { key: "cenas", label: "Cenas do ato", hint: "IDs de cenas-roteiro que compõem", type: "array" },
      ],
    },
    "personagem-roteiro": {
      description: "Personagem adaptado ao formato audiovisual.",
      fields: [
        { key: "nome", label: "Nome", hint: "Como aparece nos diálogos", type: "string" },
        { key: "função", label: "Função", hint: "Protagonista, deuteragonista, antagonista...", type: "string" },
        { key: "desejo", label: "O que quer", hint: "Motor da ação na história", type: "string" },
        { key: "conflito", label: "O que impede", hint: "Obstáculo central", type: "string" },
        { key: "descrição-física", label: "Descrição física", hint: "Como aparece na primeira apresentação no roteiro", type: "string" },
        { key: "voz", label: "Voz e maneirismo", hint: "Como fala - registros, tiques, ritmo", type: "string" },
      ],
    },
    pauta: {
      description: "Proposta de reportagem - gancho, angulação e fontes.",
      fields: [
        { key: "gancho", label: "Gancho", hint: "Por que esta história agora", type: "string" },
        { key: "angulação", label: "Angulação", hint: "Qual o recorte - não o tema, o ponto de vista", type: "string" },
        { key: "veículo", label: "Veículo alvo", hint: "Para quem é pensada esta pauta", type: "string" },
        { key: "prazo", label: "Prazo", hint: "Data de entrega ou publicação", type: "string" },
        { key: "fontes-necessárias", label: "Fontes necessárias", hint: "Quem precisa ser ouvido", type: "string" },
        { key: "status", label: "Situação", hint: "Ideia, aprovada, em apuração, entregue", type: "string" },
      ],
    },
    fonte: {
      description: "Pessoa real ouvida na apuração.",
      fields: [
        { key: "nome", label: "Nome", hint: "Nome completo", type: "string" },
        { key: "cargo", label: "Cargo e instituição", hint: "Função e onde trabalha", type: "string" },
        { key: "contato", label: "Contato", hint: "E-mail, telefone, canal preferido", type: "string" },
        { key: "credibilidade", label: "Credibilidade", hint: "Por que esta fonte", type: "string" },
        { key: "o-que-sabe", label: "O que sabe", hint: "Qual informação pode fornecer", type: "string" },
        { key: "status", label: "Situação", hint: "A contatar, contatada, entrevistada, off", type: "string" },
      ],
    },
    entrevista: {
      description: "Perguntas, respostas brutas e trechos selecionados.",
      fields: [
        { key: "fonte", label: "Fonte", hint: "ID do documento tipo fonte", type: "ref" },
        { key: "data", label: "Data", hint: "Quando foi realizada", type: "string" },
        { key: "meio", label: "Meio", hint: "Presencial, telefone, e-mail, vídeo", type: "string" },
        { key: "perguntas", label: "Perguntas planejadas", hint: "O roteiro antes da conversa", type: "string" },
        { key: "trechos", label: "Trechos selecionados", hint: "O que vai para o texto", type: "string" },
        { key: "off", label: "Off the record", hint: "Para contexto interno", type: "string" },
      ],
    },
    fato: {
      description: "Dado verificável - enunciado, fonte primária e situação.",
      fields: [
        { key: "enunciado", label: "Enunciado", hint: "O fato em uma frase objetiva", type: "string" },
        { key: "quando", label: "Quando", hint: "Data ou período", type: "string" },
        { key: "onde", label: "Onde", hint: "Local, se aplicável", type: "string" },
        { key: "fonte-primária", label: "Fonte primária", hint: "Documento ou pessoa que confirma", type: "string" },
        { key: "status", label: "Situação", hint: "Não verificado, confirmado, contestado, falso", type: "string" },
        { key: "pauta", label: "Pauta relacionada", hint: "ID da pauta onde este fato é usado", type: "ref" },
      ],
    },
    poema: {
      description: "Composição poética - forma, metro e campo semântico.",
      fields: [
        { key: "forma", label: "Forma", hint: "Soneto, haiku, ode, verso livre...", type: "string" },
        { key: "metro", label: "Metro", hint: "Decassílabo, alexandrino, livre", type: "string" },
        { key: "rimas", label: "Esquema de rimas", hint: "ABAB, ABBA, sem rimas...", type: "string" },
        { key: "campo-semântico", label: "Campo semântico central", hint: "O universo de imagens que o poema habita", type: "string" },
        { key: "série", label: "Série / ciclo", hint: "ID de uma série-poética", type: "ref" },
        { key: "notas", label: "Notas de revisão", hint: "Versos em dúvida, alternativas", type: "string" },
      ],
    },
    "série-poética": {
      description: "Conjunto de poemas com fio temático ou formal.",
      fields: [
        { key: "título", label: "Título da série", hint: "Nome do ciclo", type: "string" },
        { key: "fio", label: "Fio condutor", hint: "O que une - tema, forma, voz, personagem", type: "string" },
        { key: "ordem", label: "Princípio de ordem", hint: "Cronológico, temático, formal, livre", type: "string" },
        { key: "poemas", label: "Poemas", hint: "IDs dos poemas", type: "array" },
      ],
    },
    argumento: {
      description: "Tese, evidências e contra-argumento para ensaio.",
      fields: [
        { key: "tese", label: "Tese", hint: "A afirmação central", type: "string" },
        { key: "evidências", label: "Evidências", hint: "O que sustenta a tese", type: "string" },
        { key: "contra-argumento", label: "Contra-argumento", hint: "A objeção mais forte e como respondê-la", type: "string" },
        { key: "conclusão", label: "Conclusão", hint: "Para onde o argumento leva", type: "string" },
      ],
    },
    crônica: {
      description: "Gancho cotidiano, tom e conexão com o universal.",
      fields: [
        { key: "gancho", label: "Gancho", hint: "O fato ou momento que dispara a crônica", type: "string" },
        { key: "tom", label: "Tom", hint: "Lírico, irônico, saudoso, urgente...", type: "string" },
        { key: "virada", label: "Virada", hint: "Quando o cotidiano toca o universal", type: "string" },
        { key: "veículo", label: "Veículo alvo", hint: "Coluna, blog, jornal, antologia", type: "string" },
      ],
    },
  };

  const DEFAULT_METADATA = {
    type: "manuscrito",
    kind: "Rascunho",
    status: "Em escrita",
    chapter: "Primeira cena",
    progress: 0,
    description: "Sem descrição ainda.",
    tags: [],
    pinned: false,
  };

  function normalizeManuscript(manuscript) {
    const type = normalizeType(manuscript.type);

    return {
      ...manuscript,
      type,
      kind: manuscript.kind || DEFAULT_METADATA.kind,
      status: manuscript.status || inferStatus(manuscript.kind),
      chapter: manuscript.chapter || DEFAULT_METADATA.chapter,
      progress: normalizeProgress(manuscript.progress),
      description: manuscript.description ?? createDescription(manuscript.text),
      tags: normalizeTags(manuscript.tags),
      pinned: Boolean(manuscript.pinned),
      meta: normalizeMeta(type, manuscript.meta),
      templateId: manuscript.templateId || undefined,
    };
  }

  function normalizeManuscripts(manuscripts) {
    return manuscripts.map(normalizeManuscript);
  }

  function createManuscript({ id, title, text, ...metadata }) {
    const createdAt = metadata.createdAt || new Date().toISOString();

    return normalizeManuscript({
      id,
      title,
      text,
      kind: metadata.kind || DEFAULT_METADATA.kind,
      type: normalizeType(metadata.type),
      status: metadata.status || DEFAULT_METADATA.status,
      chapter: metadata.chapter || DEFAULT_METADATA.chapter,
      progress: metadata.progress ?? DEFAULT_METADATA.progress,
      description: metadata.description ?? DEFAULT_METADATA.description,
      tags: normalizeTags(metadata.tags),
      pinned: Boolean(metadata.pinned),
      templateId: metadata.templateId,
      meta: metadata.meta,
      folder: metadata.folder || undefined,
      parentId: metadata.parentId || undefined,
      createdAt,
      updatedAt: new Date().toISOString(),
    });
  }

  function updateMetadata(manuscript, metadata) {
    return normalizeManuscript({
      ...manuscript,
      ...metadata,
      type: normalizeType(metadata.type ?? manuscript.type),
      progress: normalizeProgress(metadata.progress),
      tags: normalizeTags(metadata.tags),
      pinned: metadata.pinned ?? manuscript.pinned,
      meta: metadata.meta ?? manuscript.meta,
      updatedAt: new Date().toISOString(),
    });
  }

  function defaultMeta(type) {
    const template = getMetaTemplate(type);

    return template.fields.reduce((meta, field) => {
      meta[field.key] = field.type === "array" ? [] : "";
      return meta;
    }, {});
  }

  function getMetaTemplate(type) {
    return META_TEMPLATES[normalizeType(type)] || META_TEMPLATES.manuscrito;
  }

  function normalizeMeta(type, value) {
    const normalizedType = normalizeType(type);
    const defaults = defaultMeta(normalizedType);
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const migratedSource = migrateMeta(normalizedType, source);

    return Object.keys(defaults).reduce((meta, key) => {
      const defaultValue = defaults[key];
      const nextValue = migratedSource[key];

      if (Array.isArray(defaultValue)) {
        meta[key] = Array.isArray(nextValue) ? [...nextValue] : [];
        return meta;
      }

      meta[key] = typeof nextValue === "string" ? nextValue : defaultValue;
      return meta;
    }, preserveUnknownMeta(defaults, migratedSource));
  }

  function migrateMeta(type, source) {
    if (normalizeType(type) !== "mundo") {
      return source;
    }

    return {
      ...source,
      nome: source.nome || source.lugar || "",
    };
  }

  function preserveUnknownMeta(defaults, source) {
    return Object.keys(source).reduce((unknown, key) => {
      if (Object.prototype.hasOwnProperty.call(defaults, key)) {
        return unknown;
      }

      unknown[key] = source[key];
      return unknown;
    }, {});
  }

  function createDescription(text = "") {
    const cleanText = text.replace(/\s+/g, " ").trim();
    return cleanText ? truncate(cleanText, 120) : DEFAULT_METADATA.description;
  }

  function inferStatus(kind = "") {
    if (kind.toLowerCase().includes("andamento")) {
      return "Em escrita";
    }

    return DEFAULT_METADATA.status;
  }

  function normalizeProgress(value) {
    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      return DEFAULT_METADATA.progress;
    }

    return Math.min(100, Math.max(0, Math.round(numberValue)));
  }

  function normalizeType(value) {
    const aliasedValue = TYPE_ALIASES[value] || value;
    return DOCUMENT_TYPES.includes(aliasedValue) ? aliasedValue : DEFAULT_METADATA.type;
  }

  function normalizeTags(value) {
    const rawTags = Array.isArray(value) ? value : String(value || "").split(",");

    return [...new Set(
      rawTags
        .map((tag) => tag.trim())
        .filter(Boolean)
    )].slice(0, 12);
  }

  function truncate(value, limit) {
    return value.length > limit ? `${value.slice(0, limit - 3)}...` : value;
  }

  function createDocument({ id, title, type, text = "", ...metadata }) {
    const documentId = id || createId(type);

    return createManuscript({
      ...metadata,
      id: documentId,
      title,
      type,
      text,
    });
  }

  function createId(type) {
    const prefix = normalizeType(type);

    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return `${prefix}-${global.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }

  function docSummary(doc) {
    const meta = doc.meta || {};

    switch (normalizeType(doc.type)) {
      case "projeto":
        return joinSummary(meta.gênero, meta.estágio);
      case "personagem":
        return joinSummary(meta.papel, meta.desejo && `quer ${meta.desejo}`);
      case "personagem-roteiro":
        return joinSummary(meta.função, meta.desejo && `quer ${meta.desejo}`);
      case "cena":
        return joinSummary(meta.pov && `POV: ${meta.pov}`, meta.objetivo);
      case "cena-roteiro":
        return joinSummary(meta.slug, meta.objetivo);
      case "mundo":
        return joinSummary(meta.nome, meta.tensão);
      case "lugar":
        return joinSummary(meta.tipo, truncateValue(meta.atmosfera, 50));
      case "instituição":
        return joinSummary(meta.tipo, truncateValue(meta.objetivo, 60));
      case "objeto":
        return truncateValue(meta.significado, 70);
      case "cronologia":
        return joinSummaryWith(" — ", meta.data, meta.evento);
      case "capítulo":
        return joinSummary(meta.número && `Cap. ${meta.número}`, meta.arco);
      case "tema":
        return truncateValue(meta.enunciado, 80);
      case "glossário":
        return truncateValue(meta.definição, 70);
      case "pesquisa":
        return joinSummary(meta.autor, meta.ano, meta.tema);
      case "submissão":
        return joinSummary(meta.editora, meta.status);
      case "revisão":
        return joinSummary(meta.tipo, meta.status);
      case "escaleta":
        return joinSummary(meta.formato, meta["total-cenas"] && `${meta["total-cenas"]} cenas`);
      case "ato":
        return joinSummary(meta.número && `Ato ${meta.número}`, meta.função);
      case "pauta":
        return joinSummary(meta.veículo, meta.status);
      case "fonte":
        return joinSummaryWith(" — ", meta.nome, meta.cargo);
      case "entrevista":
        return joinSummary(meta.data, meta.meio);
      case "fato":
        return joinSummary(meta.status, truncateValue(meta.enunciado, 60));
      case "poema":
        return joinSummary(meta.forma, meta.metro);
      case "série-poética":
        return truncateValue(meta.fio, 70);
      case "argumento":
        return truncateValue(meta.tese, 80);
      case "crônica":
        return joinSummary(meta.tom, meta.veículo);
      default:
        return "";
    }
  }

  function joinSummary(...values) {
    return joinSummaryWith(" · ", ...values);
  }

  function joinSummaryWith(separator, ...values) {
    return values.filter(Boolean).join(separator);
  }

  function truncateValue(value = "", limit = 70) {
    return value.length > limit ? `${value.slice(0, limit - 3)}...` : value;
  }

  global.VeredaArchive = {
    ALL_TYPES: Object.keys(TYPE_FAMILY),
    ARCHIVE_ORDER,
    createManuscript,
    createDocument,
    DOCUMENT_TYPES,
    defaultMeta,
    docSummary,
    FAMILY_LABEL,
    getMetaTemplate,
    META_TEMPLATES,
    normalizeManuscript,
    normalizeManuscripts,
    normalizeMeta,
    TYPE_ALIASES,
    TYPE_FAMILY,
    updateMetadata,
  };
})(window);
