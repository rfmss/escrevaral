(function rightsEngine(global) {
  const updatedAt = "2026-04-30";

  const sources = [
    {
      label: "Lei 9.610/1998 - Planalto",
      url: "https://www.planalto.gov.br/Ccivil_03/LEIS/L9610.htm",
      note: "Base legal brasileira sobre direitos autorais.",
    },
    {
      label: "EDA/FBN - Direitos Autorais",
      url: "https://www.gov.br/bn/pt-br/atuacao/direitos-autorais-1/direitos-autorais",
      note: "Registro de obras intelectuais na Biblioteca Nacional.",
    },
    {
      label: "Serviço gov.br de registro",
      url: "https://www.gov.br/pt-br/servicos/registrar-ou-averbar-direitos-autorais-na-biblioteca-nacional",
      note: "Fluxo oficial para registrar ou averbar direitos autorais.",
    },
    {
      label: "CBL - ISBN",
      url: "https://www.cbl.org.br/isbn/",
      note: "Agência brasileira do ISBN e serviços editoriais.",
    },
  ];

  const cards = [
    {
      id: "escrevendo",
      icon: "edit_document",
      eyebrow: "Estou escrevendo",
      title: "Seu texto já nasce protegido, mas rastro vale ouro.",
      body:
        "A proteção autoral nasce com a criação expressa. Ideia solta, método e gênero não são protegidos; texto, roteiro, poema, ensaio e versão concreta são.",
      do: ["Guarde rascunhos e versões.", "Mantenha datas de criação.", "Separe referência de cópia."],
      watch: "Registro ajuda como prova, mas não é requisito para a proteção existir.",
      source: "Lei 9.610/1998, arts. 7º e 8º",
    },
    {
      id: "submissao",
      icon: "outbox",
      eyebrow: "Vou submeter",
      title: "Envio editorial pede memória do que foi mandado.",
      body:
        "Submissão não transfere direitos. Ainda assim, edital, e-mail, versão enviada e regras de exclusividade viram parte prática da sua defesa.",
      do: ["Exporte a versão enviada.", "Guarde o edital ou chamada.", "Registre data, destinatário e resposta."],
      watch: "Submissões simultâneas, ineditismo e exclusividade mudam por editora.",
      source: "LDA + política de cada edital/editora",
    },
    {
      id: "contrato",
      icon: "contract",
      eyebrow: "Recebi contrato",
      title: "Contrato bom diz prazo, território, mídia e reversão.",
      body:
        "Direitos patrimoniais podem ser licenciados ou cedidos. O risco nasce quando o contrato captura mais do que precisa: audiovisual, tradução, audiobook, território mundial ou prazo indefinido.",
      do: ["Leia escopo de direitos.", "Procure reversão por obra fora de catálogo.", "Observe preferência pelo próximo livro."],
      watch: "Contrato de valor alto ou cessão ampla merece advogado especializado.",
      source: "Lei 9.610/1998, arts. 29, 49 e 53",
    },
    {
      id: "registro",
      icon: "fingerprint",
      eyebrow: "Quero provar autoria",
      title: "Prova é conjunto, não talismã.",
      body:
        "A Prova de Autoria da Vereda registra processo localmente. Ela ajuda a contar a história da escrita, mas não substitui registro oficial, cartório, contrato ou orientação jurídica.",
      do: ["Exporte o .proof.json.", "Faça backup .vrda.", "Consulte o EDA/FBN para registro formal."],
      watch: "Serviços, tabela e atendimento do EDA podem mudar. Confira a fonte oficial no dia.",
      source: "EDA/FBN e serviço gov.br",
    },
    {
      id: "autoedicao",
      icon: "storefront",
      eyebrow: "Vou autopublicar",
      title: "Quando você edita, você também administra direitos.",
      body:
        "ISBN, ficha, plataforma, gráfica e distribuição são camadas de mercado. Prestador de serviço não deve ficar com direito autoral do seu texto por acidente contratual.",
      do: ["Confira ISBN na CBL.", "Leia termos de plataforma.", "Separe serviço de cessão de direitos."],
      watch: "Valores e procedimentos da CBL mudam. Não confie em preço antigo salvo em fonte atual.",
      source: "CBL - Agência Brasileira do ISBN",
    },
    {
      id: "coautoria",
      icon: "groups",
      eyebrow: "Escrevi com alguém",
      title: "Coautoria precisa de combinado antes da alegria virar atrito.",
      body:
        "Obra em coautoria, obra coletiva, ghostwriting e oficina literária têm consequências diferentes. O nome na capa não resolve sozinho quem pode explorar a obra.",
      do: ["Anote percentuais e funções.", "Combine uso de pseudônimo.", "Guarde consentimentos por escrito."],
      watch: "Direitos morais são irrenunciáveis; a prática de mercado nem sempre respeita isso bem.",
      source: "Lei 9.610/1998, art. 5º",
    },
    {
      id: "citacao",
      icon: "format_quote",
      eyebrow: "Quero citar ou adaptar",
      title: "Citação, paródia e domínio público têm regra própria.",
      body:
        "Plágio é problema ético e autoralidade mal atribuída. Violação autoral é uso sem autorização quando a lei exige. Os dois podem se cruzar, mas não são sinônimos.",
      do: ["Cite autoria e fonte.", "Use trecho necessário, não decorativo.", "Confira se a tradução também é protegida."],
      watch: "Domínio público libera uso patrimonial, mas não apaga autoria.",
      source: "Lei 9.610/1998, arts. 41, 46 e 47",
    },
    {
      id: "ia",
      icon: "neurology",
      eyebrow: "Usei IA",
      title: "Ferramenta não assina livro; processo humano precisa aparecer.",
      body:
        "O debate sobre IA muda rápido. O caminho prudente é documentar intervenção humana: escolhas, cortes, revisão, reescrita, fontes e responsabilidade final.",
      do: ["Guarde rascunhos humanos.", "Declare uso quando edital pedir.", "Evite colar obra protegida em serviço externo."],
      watch: "Treinamento, scraping, opt-out e autoria assistida ainda são fronteiras instáveis.",
      source: "Debate jurídico em atualização",
    },
    {
      id: "comunidades",
      icon: "diversity_3",
      eyebrow: "Narrativas e comunidades",
      title: "Nem toda autorização cabe só na LDA.",
      body:
        "Narrativas orais, conhecimentos tradicionais, povos originários e comunidades tradicionais exigem cuidado ético e consulta. A lei autoral não esgota o assunto.",
      do: ["Registre contexto e autorização.", "Evite extrair história coletiva como se fosse material livre.", "Procure fontes e lideranças adequadas."],
      watch: "Direitos coletivos e patrimônio imaterial pedem atualização constante.",
      source: "LDA, Convenção 169/OIT e normas correlatas",
    },
  ];

  const bots = [
    {
      id: "fontes-oficiais",
      title: "Bot de fontes oficiais",
      scope: "Verificar links e datas de LDA, EDA/FBN, CBL, ISBN, depósito legal e serviços gov.br.",
      cadence: "mensal",
    },
    {
      id: "conteudo-juridico",
      title: "Bot de revisão jurídico-editorial",
      scope: "Abrir issue quando uma fonte oficial muda procedimento, preço, atendimento ou norma citada.",
      cadence: "mensal ou sob gatilho",
    },
    {
      id: "qa-visual",
      title: "Bot de QA visual",
      scope: "Gerar screenshots de Editor, Arquivo, Autoria e Academia em desktop/mobile e comparar quebras de layout.",
      cadence: "por pull request",
    },
    {
      id: "cache-pwa",
      title: "Bot de cache e PWA",
      scope: "Checar manifest, service worker, assets versionados, favicons e rotas de atalhos.",
      cadence: "por release",
    },
    {
      id: "dependencias",
      title: "Bot de integridade local",
      scope: "Rodar node --check, validar JSON, mapear referências quebradas e registrar resultado no QA.",
      cadence: "por commit significativo",
    },
  ];

  global.VeredaRights = {
    getCards: () => cards,
    getSources: () => sources,
    getBots: () => bots,
    updatedAt,
  };
})(window);
