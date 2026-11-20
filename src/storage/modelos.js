(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var TEMPLATES = [
    {
      id: 'livro-ficcao',
      title: '1. Livro de ficção',
      defaultProjectName: 'Meu Romance',
      description: 'Uma história pode começar por uma pessoa, uma cena ou uma ideia. Encontre espaço para desenvolvê-la.',
      folders: [
        {
          name: '01 · Estrutura',
          notes: [
            {
              title: '01. A história em poucas palavras',
              content: '# A história em poucas palavras\n\nPode começar pela parte que você já imagina: uma pessoa, um lugar ou algo que aconteceu. As outras ideias podem vir depois.\n\n## Quem está no centro da história?\n« Quem vamos acompanhar? Pode ser uma pessoa, um grupo ou alguém que você ainda está inventando. »\n\n## O que põe a história em movimento?\n« Algo chama a atenção, muda uma rotina ou desperta uma vontade. Por exemplo: alguém recebe uma carta enviada há muitos anos. O que acontece na sua história? »\n\n## O que você quer explorar?\n« Há uma pergunta ou um assunto que volta às suas ideias? Pode ser amizade, uma mudança de lugar, um segredo — ou algo que ainda não tem nome. »\n\n## A história contada por você\n« Como você contaria essa ideia para alguém? Algumas frases já bastam. O final pode ficar em aberto por enquanto. »'
            },
            {
              title: '02. Um caminho em três atos',
              content: '# Um caminho em três atos\n\nTrês atos são uma possibilidade de organizar a história: começo, mudanças e desfecho. Você pode experimentar essa ordem, mudar tudo ou voltar aqui depois de escrever.\n\n## Ato I — O começo\n- Uma primeira cena: « Onde encontramos quem está no centro da história? Um gesto ou uma conversa pode mostrar como é sua vida. »\n- Algo muda: « O que faz essa pessoa sair da rotina ou olhar para ela de outro jeito? »\n\n## Ato II — As mudanças\n- Tentativas: « O que essa pessoa faz a partir daí? »\n- Um encontro ou uma descoberta: « O que muda a direção da história? Por exemplo: quem parecia distante oferece ajuda. »\n- Uma escolha: « Há algo que fica difícil de decidir? Se não houver, o que você gostaria de acompanhar nessa parte? »\n\n## Ato III — O desfecho\n- O que acontece: « Onde você imagina que essa história chega? Algumas coisas podem se resolver e outras continuar abertas. »\n- Uma última cena: « Que imagem, gesto ou conversa poderia ficar com quem leu? »'
            }
          ]
        },
        {
          name: '02 · Personagens',
          notes: [
            {
              title: '03. Quem está no centro',
              content: '# Quem está no centro\n\nPode começar por alguém que você já imagina. Outros detalhes podem aparecer enquanto escreve.\n\n## Um primeiro retrato\n- Nome: « Como essa pessoa se chama? Um nome provisório também serve. »\n- Vida cotidiana: « Como é um dia comum para essa pessoa? »\n- Um detalhe: « O que você percebe nela? Por exemplo: guarda os bilhetes no bolso ou canta enquanto espera. »\n\n## O que essa pessoa quer?\n« Pode ser algo pequeno ou algo que mude sua vida: devolver uma carta, reencontrar alguém, aprender a dizer não. Qual vontade combina com ela? »\n\n## O que dificulta isso?\n« Talvez outra pessoa, uma distância, uma dúvida — ou algo que você ainda vai descobrir. »'
            },
            {
              title: '04. Pessoas e obstáculos',
              content: '# Pessoas e obstáculos\n\nA história pode encontrar resistência numa pessoa, numa situação ou no próprio lugar onde acontece. Nem toda história precisa de um vilão.\n\n## O que se coloca no caminho?\n« Quem ou o que dificulta as coisas? Pode ser uma disputa, uma regra, uma tempestade ou uma vontade diferente. »\n\n## Se houver alguém do outro lado\n« O que essa pessoa quer? Como isso se cruza com a vontade de quem estamos acompanhando? »'
            }
          ]
        },
        {
          name: '03 · Universo',
          notes: [
            {
              title: '05. Universo da história',
              content: '# Universo da história\n\nUm lugar pode começar com um único detalhe. Guarde aqui o que ajuda você a imaginá-lo.\n\n## Onde e quando?\n« Em que lugar e tempo a história acontece? Pode ser um bairro conhecido, outra época ou um mundo inventado. »\n\n## O que se percebe ali?\n« Que som, cheiro ou sensação aparece primeiro? Por exemplo: o portão range antes de alguém chegar. »\n\n## Costumes, regras e descobertas\n« O que você quer lembrar sobre esse mundo? Anote também o que precisa pesquisar e onde encontrou uma informação. »'
            }
          ]
        },
        {
          name: '04 · Manuscrito',
          notes: [
            {
              title: '06. Capítulo 01',
              content: '# Capítulo 01 — « Um título para este capítulo »\n\n« Uma voz, uma ação pequena ou um detalhe do lugar: por onde sua história começa? »'
            },
            {
              title: '07. Capítulo 02',
              content: '# Capítulo 02 — « Um título para este capítulo »\n\n« Qual parte da história você tem vontade de contar agora? »'
            },
            {
              title: '08. Capítulo 03',
              content: '# Capítulo 03 — « Um título para este capítulo »\n\n« Continue pela cena, conversa ou lembrança que está mais viva para você. »'
            }
          ]
        },
        {
          name: '05 · Revisão',
          notes: [
            {
              title: '09. Um novo olhar sobre o livro',
              content: '# Um novo olhar sobre o livro\n\nDepois de escrever, uma pausa pode ajudar a perceber o texto de outro jeito. Estas perguntas são pontos de atenção; você decide o que faz sentido mudar.\n\n- [ ] Consigo acompanhar o que acontece e quem participa?\n- [ ] Há algum trecho em que me falta uma informação — ou em que explico mais do que gostaria?\n- [ ] Ao ler um diálogo em voz alta, reconheço o jeito de falar de cada pessoa?\n- [ ] Conferi nomes, datas e detalhes que reaparecem?\n- [ ] Fiz uma leitura final de ortografia e pontuação, preservando as escolhas de linguagem do texto?'
            }
          ]
        }
      ]
    },
    {
      id: 'livro-nao-ficcao',
      title: '2. Livro de não ficção',
      defaultProjectName: 'Meu livro de não ficção',
      description: 'Investigue uma pergunta, conte uma experiência ou compartilhe o que você conhece.',
      folders: [
        {
          name: '01 · Estrutura',
          notes: [
            {
              title: '01. Ideia e leitor',
              content: '# Ideia e leitor\n\nUm livro pode nascer de uma pergunta, uma experiência ou algo que você quer compartilhar.\n\n## O que você quer explorar?\n« Qual assunto ou lembrança pede mais espaço? Por exemplo: como uma receita mudou ao passar de uma pessoa para outra. »\n\n## Com quem você quer conversar?\n« Quem pode se interessar por esse assunto? O que essa pessoa talvez já conheça ou queira descobrir? »\n\n## Uma ordem possível\n1. Introdução: « Por onde essa conversa pode começar? »\n2. Primeira parte: « Que assunto você quer explorar primeiro? »\n3. Próxima parte: « O que se liga a esse assunto? »\n4. Fechamento: « Que descoberta, reflexão ou pergunta pode ficar com quem leu? »'
            }
          ]
        },
        {
          name: '02 · Pesquisa',
          notes: [
            {
              title: '02. Pesquisa e fontes',
              content: '# Pesquisa e fontes\n\nGuarde a informação junto de sua origem. Isso ajuda a reencontrá-la e a distinguir suas palavras das de outra pessoa.\n\n## Uma informação que vale guardar\n« Que dado, trecho ou descoberta pode ajudar seu texto? Ao copiar palavras de alguém, indique que são uma citação. »\n\nDe onde veio?\n« Anote autoria, título e página ou endereço. Se for uma conversa, registre com quem foi e a data. »'
            }
          ]
        },
        {
          name: '03 · Manuscrito',
          notes: [
            {
              title: '03. Introdução',
              content: '# Introdução\n\n## De onde nasce este livro?\n« Comece por uma lembrança, uma observação ou uma pergunta que trouxe você até este assunto. »'
            },
            {
              title: '04. Capítulo 01',
              content: '# Capítulo 01 — « Um título para este capítulo »\n\n« Que pergunta, experiência ou ideia você quer desenvolver nesta parte? Comece pelo que já tem vontade de contar. »'
            }
          ]
        }
      ]
    },
    {
      id: 'coletanea',
      title: '3. Coletânea',
      defaultProjectName: 'Minha Coletânea',
      description: 'Reúna contos, crônicas ou poemas. As ligações e a ordem podem aparecer depois.',
      folders: [
        {
          name: '01 · Conceito',
          notes: [
            {
              title: '01. O que aproxima os textos',
              content: '# O que aproxima os textos\n\nVocê pode reunir os textos primeiro e descobrir depois o que os aproxima.\n\n## Uma ligação possível\n« Há um lugar, um assunto ou um jeito de olhar que aparece mais de uma vez? Por exemplo: lembranças de uma rua, em épocas diferentes. »'
            }
          ]
        },
        {
          name: '02 · Ideias',
          notes: [
            {
              title: '02. Ideias e fragmentos',
              content: '# Ideias e fragmentos\n\nUma frase ouvida, uma imagem, um título provisório: cabe aqui mesmo que você ainda não saiba o que fazer com isso.\n\n- Uma ideia: « O que chamou sua atenção? Pode ser uma imagem simples, como uma cadeira na calçada depois da chuva. »\n- Outra ideia: « Há uma palavra, uma fala ou uma lembrança que você quer guardar? »'
            }
          ]
        },
        {
          name: '03 · Em escrita',
          notes: [
            {
              title: '03. Texto 01',
              content: '# « Um título para este conto, crônica ou poema »\n\n« Comece pela imagem, pela frase ou pelo ritmo que você tem em mente. O texto pode encontrar sua forma enquanto cresce. »'
            }
          ]
        }
      ]
    },
    {
      id: 'roteiro',
      title: '4. Roteiro',
      defaultProjectName: 'Meu Roteiro',
      description: 'Imagine cenas, ações e conversas. Pequenos exemplos ajudam a começar.',
      folders: [
        {
          name: '01 · Estrutura',
          notes: [
            {
              title: '01. A história em cenas',
              content: '# A história em cenas\n\nUma cena mostra algo acontecendo num lugar e num momento.\n\n## A ideia do roteiro\n« O que você gostaria de ver acontecer na tela? Algumas palavras já podem guardar essa ideia. »'
            }
          ]
        },
        {
          name: '02 · Cenas',
          notes: [
            {
              title: '02. Primeiras cenas',
              content: '# Primeiras cenas\n\n« INT. indica um espaço interno; EXT., um espaço ao ar livre. O cabeçalho situa a cena. Na ação, vale o que podemos ver ou ouvir. »\n\nCENA 01 — INT. « LUGAR DA PRIMEIRA CENA » — DIA\n\n« O que vemos ou ouvimos aqui? Por exemplo: Lia fecha o guarda-chuva. Uma poça se forma junto à porta. »\n\n« NOME DE QUEM FALA PRIMEIRO »\n« O que essa pessoa diz? Por exemplo: Você guardou um lugar para mim? »\n\n« NOME DE QUEM RESPONDE »\n« Qual é a resposta? Um silêncio ou um gesto também pode fazer parte da cena. »'
            }
          ]
        }
      ]
    },
    {
      id: 'nota-avulsa',
      title: '5. Texto avulso',
      defaultProjectName: 'Meus textos',
      description: 'Dê espaço a uma observação, pergunta ou lembrança, no tamanho que ela pedir.',
      folders: [
        {
          name: 'Textos',
          notes: [
            {
              title: '01. Novo texto',
              content: '# « Um título para este texto »\n\n« Uma observação, uma pergunta ou uma lembrança já pode ser um começo. Use as partes que ajudarem; um texto curto pode caber numa só. »\n\n## Abertura\n« O que você quer trazer para esta conversa? Pode partir de uma situação pequena, como encontrar um objeto esquecido. »\n\n## Fechamento\n« O que você quer deixar com quem leu? Pode ser uma imagem, uma pergunta ou uma ideia. »'
            }
          ]
        }
      ]
    },
    {
      id: 'soneto',
      title: '6. Soneto',
      defaultProjectName: 'Meu soneto',
      description: 'Escreva com métrica e rimas acompanhadas na página, verso a verso, e explore finais semelhantes.',
      folders: [
        {
          name: '01 · Preparação',
          notes: [
            {
              title: '01. A ideia e a forma',
              content: '# A ideia e a forma\n\nVocê pode começar por uma imagem, um som ou um verso. Para escrever diretamente com acompanhamento automático, abra 03. Meu soneto.\n\n## O que pede um poema?\n« Que imagem, lembrança ou pergunta você quer explorar neste soneto? »\n\n## Quem fala, e para quem?\n« De onde vem esta voz? Ela conversa com alguém, observa uma cena ou pensa consigo? »'
            },
            {
              title: '02. Métrica e rimas',
              content: '# Métrica e rimas\n\nLeia o verso em voz alta, no ritmo que ele pede. Conte os sons até a última sílaba tônica: as sílabas que vêm depois dela não entram na medida.\n\nExemplo: Meu verso nasce lento nesta tarde (10 sílabas poéticas — decassílabo heroico).'
            }
          ]
        },
        {
          name: '02 · Poema',
          notes: [
            {
              title: '03. Meu soneto',
              role: 'sonnet',
              sonnetSettings: { structure: 'italian', scheme: 'ABBA ABBA CDC DCD', target: 10, rhythm: 'none' },
              content: ''
            }
          ]
        },
        {
          name: '03 · Revisão',
          notes: [
            {
              title: '04. Escansão dos versos',
              content: '# Escansão dos versos\n\nUse esta folha depois de escrever para conferir sua leitura em voz alta.\n\n- [ ] Conferi os 14 versos e a divisão 4–4–3–3 escolhida?\n- [ ] A medida e os apoios correspondem à leitura que quero fazer?\n- [ ] As rimas se confirmam pelo som?'
            }
          ]
        }
      ]
    },
    {
      id: 'redacao-enem',
      title: '7. Redação do Enem',
      defaultProjectName: 'Minha redação do Enem',
      description: 'Do tema à revisão: organize a tese, desenvolva argumentos e construa sua proposta de intervenção.',
      folders: [
        {
          name: '01 · Planejamento',
          notes: [
            {
              title: '01. Tema e ponto de vista',
              content: '# Tema e ponto de vista\n\nComece pelo tema, reúna argumentos e escreva em 04. Minha redação.\n\n## Proposta de redação\n« Registre a frase temática completa e a origem da proposta. »\n\n## Minha tese\n« Em uma ou duas frases, o que você defende sobre esse problema? Vá além de dizer que ele é importante. »'
            },
            {
              title: '02. Argumentos e repertório',
              content: '# Argumentos e repertório\n\n## Primeiro argumento\n« Qual é a ideia central deste argumento? »\n\n## Segundo argumento\n« Qual é a ideia central do segundo argumento? O que ela acrescenta à primeira? »'
            },
            {
              title: '03. Proposta de intervenção',
              content: '# Proposta de intervenção\n\n- Ação: « Que medida você propõe? »\n- Agente: « Quem tem condições e responsabilidade para executar essa ação? »\n- Meio: « Por quais recursos ou canais a ação será realizada? »\n- Efeito: « Que resultado essa medida busca alcançar? »\n- Detalhamento: « Aprofunde um dos elementos acima. »'
            }
          ]
        },
        {
          name: '02 · Redação',
          notes: [
            {
              title: '04. Minha redação',
              content: '« Introdução: apresente o recorte do tema e seu ponto de vista. Se usar uma referência, explique sua relação com o problema. »\n\n« Desenvolvimento 1: apresente o primeiro argumento, explique como ele funciona e sustente-o com um exemplo ou conhecimento pertinente. Relacione a análise à sua tese. »\n\n« Desenvolvimento 2: acrescente o segundo argumento, desenvolva a explicação e mostre o que a evidência escolhida ajuda a compreender. Conecte esta parte à anterior. »\n\n« Conclusão: retome sua posição e apresente uma intervenção ligada ao problema discutido. Deixe claros ação, agente, meio, efeito pretendido e um detalhamento, respeitando os direitos humanos. »'
            }
          ]
        },
        {
          name: '03 · Revisão',
          notes: [
            {
              title: '05. Revisão da redação',
              content: '# Revisão da redação\n\n- [ ] Competência 1: Revisei ortografia, pontuação e concordância?\n- [ ] Competência 2: Respondo ao recorte completo da proposta?\n- [ ] Competência 3: Minha tese está clara e os argumentos sustentam?\n- [ ] Competência 4: Os parágrafos se conectam com clareza?\n- [ ] Competência 5: Explicitei ação, agente, meio, efeito e detalhamento?'
            }
          ]
        },
        {
          name: '04 · Referências',
          notes: [
            {
              title: '06. Referência · Redação nota 1000',
              category: 'reference',
              locked: true,
              content: 'Redação nota 1000 — Enem 2023\nAmanda Teixeira Zampiris\nTema: Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil.\n\nNa obra intitulada “Brasil, País do Futuro”, Stefan Zweig, autor austríaco, em sua visita ao Brasil, defendeu a ideia de que o país estava destinado a ser um dos mais importantes países do mundo no futuro. No entanto, 80 anos depois, as previsões do autor ainda não se concretizaram e os desafios para enfrentar a invisibilidade do trabalho de cuidado — realizado por mulheres — são entraves para isso. Observa-se, assim, que isso ocorre porque a negligência governamental e a permanência histórica impedem a resolução da questão.\n\nSob este viés, é preciso atentar para a omissão estatal presente nessa problemática. Nessa perspectiva, o pensador Thomas Hobbes afirma que o Estado é responsável por garantir o bem-estar da população. Entretanto, isso não ocorre no Brasil, pois a falta de atuação das autoridades corrobora a permanência do trabalho de cuidado não remunerado e mal pago realizado, principalmente, por mulheres — que inclui cuidar de crianças e idosos, bem como os afazeres domésticos —, visto que o Governo não tem cumprido seu papel no sentido de assegurar os direitos básicos a esse grupo social, como o direito a um salário digno. Assim, as funções sociais e estatais são descumpridas, agravando o problema.\n\nOutrossim, a permanência histórica é fator importante como constituinte desse imbróglio. Nesse sentido, consoante ao pensamento do antropólogo Claude Lévi-Strauss, só é possível compreender adequadamente as ações coletivas por meio do entendimento dos eventos históricos. Desse modo, a questão da invisibilidade do trabalho de cuidado feito por mulheres majoritariamente pobres e vítimas de discriminação de gênero, mesmo que fortemente presente no século XXI, apresenta raízes indissociáveis à história brasileira — que foi marcada pelo machismo e pelo patriarcado —, uma vez que as atividades domésticas não pagas ainda são delegadas às pessoas do sexo feminino de forma quase que exclusiva.\n\nFaz-se necessário, portanto, que meios sejam criados para intervir nesse óbice. Logo, o Governo Federal — órgão responsável pela administração federal em todo território nacional — deve estabelecer políticas públicas que garantam a remuneração e a valorização do trabalho de cuidado, por meio da utilização de verbas governamentais para o pagamento de salários. Tal ação deve ser realizada com a finalidade de mitigar a invisibilidade dos afazeres domésticos realizados pela mulher na sociedade brasileira e, consequentemente, combater as raízes históricas presentes nessa questão. Dessarte, o Brasil poderá se tornar um “País do Futuro”, como defendido por Stefan Zweig.\n\n---\nFonte: INEP/MEC. A redação do Enem 2024: cartilha do(a) participante. Reprodução integral autorizada com citação da fonte.'
            }
          ]
        }
      ]
    }
  ];

  var EXTRA_PLACEHOLDERS = [
    '« Um título para o seu soneto »',
    '« CLIQUE AQUI: LOCAL DA CENA 02 »',
    '« CLIQUE AQUI: LOCAL DA CENA »',
    '« CLIQUE AQUI: NOME DO PERSONAGEM »',
    '« CLIQUE AQUI: SEGUNDO PERSONAGEM »'
  ];

  var PLACEHOLDER_MAP = {};
  (function buildPlaceholders() {
    var i, j, k, re, m;
    for (i = 0; i < EXTRA_PLACEHOLDERS.length; i += 1) {
      PLACEHOLDER_MAP[EXTRA_PLACEHOLDERS[i]] = true;
    }
    for (i = 0; i < TEMPLATES.length; i += 1) {
      var folders = TEMPLATES[i].folders || [];
      for (j = 0; j < folders.length; j += 1) {
        var notes = folders[j].notes || [];
        for (k = 0; k < notes.length; k += 1) {
          re = /«[^«»]+»/g;
          while ((m = re.exec(notes[k].content || ''))) {
            PLACEHOLDER_MAP[m[0]] = true;
          }
        }
      }
    }
  }());

  function findTemplate(id) {
    var i;
    for (i = 0; i < TEMPLATES.length; i += 1) {
      if (TEMPLATES[i].id === id) { return TEMPLATES[i]; }
    }
    return null;
  }

  function placeholderAt(text, position) {
    if (typeof text !== 'string' || typeof position !== 'number') { return null; }
    var start = text.lastIndexOf('«', position);
    if (start < 0) { return null; }
    var closeIdx = text.indexOf('»', start);
    if (closeIdx < 0) { return null; }
    var end = closeIdx + 1;
    if (position < start || position >= end) { return null; }
    var value = text.slice(start, end);
    return Object.prototype.hasOwnProperty.call(PLACEHOLDER_MAP, value) ? { start: start, end: end, value: value } : null;
  }

  function clearTextareaPlaceholder(target) {
    if (!target || target.readOnly || target.disabled || target.selectionStart !== target.selectionEnd) { return false; }
    var match = placeholderAt(target.value || '', target.selectionStart);
    if (!match) { return false; }
    if (target.focus) { target.focus(); }
    if (target.setSelectionRange) { target.setSelectionRange(match.start, match.end); }
    var deleted = false;
    try {
      if (typeof document !== 'undefined' && document.execCommand) {
        deleted = document.execCommand('delete', false);
      }
    } catch (ignore) {}
    if (!deleted) {
      if (target.setRangeText) {
        target.setRangeText('', match.start, match.end, 'start');
      } else {
        target.value = target.value.slice(0, match.start) + target.value.slice(match.end);
        if (target.setSelectionRange) { target.setSelectionRange(match.start, match.start); }
      }
      try {
        target.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (ignore) {}
    }
    return true;
  }

  function createProjectFromTemplate(notebooks, archive, templateId, projectName, paletteId, originalId, noteFormat) {
    var tpl = findTemplate(templateId);
    if (!tpl) { throw new Error('Modelo não encontrado.'); }
    if (!notebooks || !archive) { throw new Error('Armazenamento indisponível.'); }

    var name = String(projectName || '').replace(/^\s+|\s+$/g, '') || tpl.defaultProjectName;
    var book = notebooks.add(name, originalId || null);

    var folderNames = [], i, j;
    for (i = 0; i < tpl.folders.length; i += 1) {
      folderNames.push(tpl.folders[i].name);
    }

    var nextData = book.data ? JSON.parse(JSON.stringify(book.data)) : {};
    nextData.template = tpl.id;
    nextData.folders = folderNames;
    if (paletteId && root.Escr.projectColors) {
      var pal = root.Escr.projectColors.byId(paletteId);
      if (pal) { nextData.palette = pal.id; book = notebooks.update(book.id, { color: pal.color, data: nextData }); }
      else { book = notebooks.update(book.id, { data: nextData }); }
    } else {
      book = notebooks.update(book.id, { data: nextData });
    }

    var createdNotes = [], firstPreferred = null;
    for (i = 0; i < tpl.folders.length; i += 1) {
      var folder = tpl.folders[i];
      for (j = 0; j < folder.notes.length; j += 1) {
        var spec = folder.notes[j];
        var d = root.Escr.freshDocument();
        d.projectId = book.id;
        d.project = book.name;
        d.folder = folder.name;
        d.title = spec.title;
        d.text = spec.content || '';
        if (spec.role) { d.role = spec.role; }
        if (spec.category) { d.category = spec.category; }
        if (spec.locked) { d.locked = true; }
        if (noteFormat === 'rich' && !spec.locked && spec.category !== 'reference' && spec.role !== 'sonnet') {
          d.format = 'rich';
          if (root.Escr.richCore && root.Escr.richCore.plainToSafeHtml) { d.richHtml = root.Escr.richCore.plainToSafeHtml(d.text); }
        } else {
          d.format = 'plain';
        }
        if (spec.sonnetSettings) { d.sonnetSettings = JSON.parse(JSON.stringify(spec.sonnetSettings)); }
        var saved = archive.save(d, false).document;
        createdNotes.push(saved);
        if (spec.role === 'sonnet') { firstPreferred = saved; } else if (!firstPreferred && spec.title.indexOf('01.') === 0) { firstPreferred = saved; }
      }
    }
    return { book: book, notes: createdNotes, firstNote: firstPreferred || createdNotes[0] || null };
  }

  root.Escr.templates = {
    list: function () { return TEMPLATES.slice(); },
    find: findTemplate,
    placeholderAt: placeholderAt,
    isPlaceholder: function (val) { return Object.prototype.hasOwnProperty.call(PLACEHOLDER_MAP, val); },
    clearTextareaPlaceholder: clearTextareaPlaceholder,
    createProject: createProjectFromTemplate
  };
}(typeof window !== 'undefined' ? window : this));
