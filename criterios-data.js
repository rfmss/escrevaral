/**
 * criterios-data.js — Vereda v3
 * Dados estruturados dos 42 critérios de análise textual derivados de 21 livros sobre escrita.
 * Fonte: framework editorial curado a partir de King, Strunk, Zinsser, Gardner, Wood,
 * Le Guin, McKee, Klinkenborg, Lamott, Clarice, Salles, Bagno, Estadão, Folha, Lage.
 * Uso: referência visual (Biblioteca da Escrita) + mapeamento de métricas (analise-engine.js).
 */
(function criteriosData(global) {

  // ── LIVROS ────────────────────────────────────────────────────────────────

  const LIVROS = {
    world: [
      { id: "king",    n: "01", titulo: "On Writing",                             autor: "Stephen King",          ano: 2000, tags: ["Ofício","Processo","Voz"],              desc: "Memoir + manual. Honestidade brutal sobre o trabalho diário. Eliminar o advérbio inútil, escrever para o leitor ideal, voz passiva como sinal de insegurança." },
      { id: "strunk",  n: "02", titulo: "The Elements of Style",                  autor: "Strunk & White",        ano: 1959, tags: ["Estilo","Norma"],                         desc: "78 páginas que definiram o padrão anglófono: omitir palavras desnecessárias, preferir o ativo, ser concreto. O mais citado em literatura sobre escrita." },
      { id: "zinsser", n: "03", titulo: "On Writing Well",                        autor: "William Zinsser",       ano: 1976, tags: ["Não-ficção","Clareza"],                   desc: "A bíblia da prosa não-ficcional: clareza, simplicidade, brevidade, humanidade. Os quatro pilares que todo analisador de texto deveria medir." },
      { id: "mckee",   n: "04", titulo: "Story",                                  autor: "Robert McKee",          ano: 1997, tags: ["Narrativa","Estrutura"],                  desc: "Conflito, progressão dramática, coerência de premissa. Critérios de arco e estrutura cena a cena. O vocabulário estrutural da ficção moderna." },
      { id: "gardner", n: "05", titulo: "The Art of Fiction",                     autor: "John Gardner",          ano: 1983, tags: ["Ficção","Técnica avançada"],              desc: "O mais técnico e exigente: sonho ficcional contínuo, distância psíquica (6 níveis), qualidade de atenção. Referência para critérios de imersão e coerência interna." },
      { id: "lamott",  n: "06", titulo: "Bird by Bird",                           autor: "Anne Lamott",           ano: 1994, tags: ["Processo","Psicologia"],                  desc: "O rascunho horrível como etapa necessária, a autocrítica paralisante, escrever cena por cena. O mais humano da lista." },
      { id: "wood",    n: "07", titulo: "How Fiction Works",                      autor: "James Wood",            ano: 2008, tags: ["Crítica","Análise literária"],            desc: "O mais analítico: discurso indireto livre, ponto de vista, detalhe significativo, o adjetivo como aposta do autor. Imprescindível para análise literária séria." },
      { id: "leguin",  n: "08", titulo: "Steering the Craft",                     autor: "Ursula K. Le Guin",     ano: 1998, tags: ["Ritmo","Voz","POV"],                      desc: "Ritmo, voz, ponto de vista, sintaxe da frase. A mais técnica sobre o nível da frase." },
      { id: "pressfield", n: "09", titulo: "The War of Art",                      autor: "Steven Pressfield",     ano: 2002, tags: ["Mentalidade","Disciplina"],              desc: "Resistência como conceito operacional. Informa critérios de consistência e comprometimento." },
      { id: "klink",   n: "10", titulo: "Several Short Sentences About Writing",  autor: "Verlyn Klinkenborg",    ano: 2012, tags: ["Frase","Radical"],                        desc: "A frase como unidade soberana. Cada frase deve poder existir sozinha. Critérios de construção frasal ao nível molecular. O mais subestimado da lista." },
    ],
    brasil: [
      { id: "salles",  n: "01", titulo: "O Processo de Criação",                  autor: "Cecília Almeida Salles", ano: 1992, tags: ["Processo","Teoria"],                   desc: "Crítica genética: rastreia como escritores brasileiros constroem textos via rascunhos. O mais rigoroso sobre o processo criativo no Brasil." },
      { id: "clarice", n: "02", titulo: "A Descoberta do Mundo",                  autor: "Clarice Lispector",      ano: 1984, tags: ["Processo","Voz","Risco"],               desc: "Crônicas do Jornal do Brasil onde Clarice reflete sobre o ato de escrever. Nenhum texto vai tão fundo em voz, instinto e risco." },
      { id: "estadao", n: "03", titulo: "Manual de Redação e Estilo",             autor: "Eduardo Martins / Estadão", ano: 1990, tags: ["Estilo","Jornalismo","Norma"],     desc: "O guia de estilo mais influente da imprensa brasileira. O padrão de referência para ptBR formal culto escrito." },
      { id: "folha",   n: "04", titulo: "Novo Manual de Redação",                 autor: "Folha de S.Paulo",       ano: 1992, tags: ["Estilo","Jornalismo"],                  desc: "O contraponto ao Estadão: mais moderno, prescritivo e adotado em redações atuais." },
      { id: "lage",    n: "05", titulo: "Linguagem Jornalística",                 autor: "Nilson Lage",            ano: 1985, tags: ["Teoria","Estrutura textual"],           desc: "A obra teórica mais sólida sobre como o jornalismo brasileiro usa a língua. Vocabulário técnico para tipologia textual." },
      { id: "bagno",   n: "06", titulo: "Preconceito Linguístico",                autor: "Marcos Bagno",           ano: 1999, tags: ["Sociolinguística","Norma real"],        desc: "Desconstrói mitos sobre o 'português correto'. Essencial para qualquer ferramenta que avalie textos em ptBR sem reproduzir preconceitos normativos." },
      { id: "lima",    n: "07", titulo: "A Arte da Reportagem",                   autor: "Edvaldo Pereira Lima",   ano: 1995, tags: ["Jornalismo literário","Narrativa"],     desc: "A fronteira entre jornalismo literário e ficção. Estrutura de narrativas longas, personagem, cena, diálogo." },
      { id: "werneck", n: "08", titulo: "Por que Escrevo",                        autor: "org. Humberto Werneck",  ano: 2006, tags: ["Processo","Antologia"],                desc: "Ensaios de Rubem Fonseca, Lygia Fagundes Telles, Milton Hatoum e outros sobre o ofício." },
      { id: "salles2", n: "09", titulo: "Crítica Genética: Uma Introdução",       autor: "Cecília Almeida Salles", ano: 2000, tags: ["Metodologia","Análise"],               desc: "Formaliza a metodologia de análise de manuscritos e escolhas criativas. Vocabulário técnico para decisões de linguagem e reescrita." },
      { id: "lajolo",  n: "10", titulo: "Escrever para Quê? Para Quem?",          autor: "Lajolo & Zilberman",     ano: 1988, tags: ["Teoria literária","Recepção"],          desc: "Leitor, mercado editorial e produção literária brasileira. Situa o texto dentro de um sistema cultural." },
      { id: "orwell",  n: "11", titulo: "Por que Escrevo",                        autor: "George Orwell",          ano: 1946, tags: ["Processo","Voz","Clareza moral"],      desc: "Ensaio clássico sobre motivação, impulso autoral, política e clareza. Orwell formula aqui suas quatro regras de prosa — a origem de muito do que Zinsser e King repetiram depois. Não confundir com a antologia brasileira organizada por Humberto Werneck." },
    ]
  };

  // ── DIMENSÕES ─────────────────────────────────────────────────────────────

  const DIMENSOES = [
    { id: "economia",  icon: "✂",  label: "Economia",         sub: "Corte e concisão",       desc: "Todo word que pode ser removido sem perda de significado deve ser removido. Mede o quanto o texto carrega peso morto — a gordura que sufoca a ideia." },
    { id: "clareza",   icon: "👁",  label: "Clareza",          sub: "Legibilidade e ordem",   desc: "O leitor não deveria precisar reler uma frase para entendê-la. Clareza é respeito pelo tempo do leitor — e revela se o autor pensou com clareza antes de escrever." },
    { id: "ritmo",     icon: "〜",  label: "Ritmo",            sub: "Cadência e variação",    desc: "Prosa tem som. Texto com frases de comprimento idêntico entorpece. Variação rítmica é sinal de domínio — monotonia é sinal de automatismo ou medo." },
    { id: "voz",       icon: "🎙",  label: "Voz",              sub: "Presença e identidade",  desc: "O texto tem uma pessoa por trás. Voz é a soma das escolhas que fazem o texto soar como alguém — e não como qualquer um." },
    { id: "estrutura", icon: "⬜",  label: "Estrutura",        sub: "Progressão e coerência", desc: "Todo texto promete algo na abertura e deve cumprir na conclusão. A estrutura é a coluna vertebral — invisível quando saudável, paralisante quando quebrada." },
    { id: "pov",       icon: "△",  label: "Ponto de vista",   sub: "Consistência e distância", desc: "Gardner mapeou 6 níveis de distância psíquica. Wood mapeou o discurso indireto livre. Inconsistência de POV quebra o sonho ficcional silenciosamente." },
    { id: "lexico",    icon: "🔤",  label: "Precisão lexical", sub: "Escolha e adequação",    desc: "A palavra certa não é a mais bonita nem a mais rara — é a que veicula o significado exato sem ruído. Imprecisão lexical é mentira involuntária." },
    { id: "norma",     icon: "⚖",  label: "Norma ptBR",       sub: "Correção sem purismo",   desc: "A norma culta escrita existe — mas não é o 'português correto' de 1940. Bagno é o freio: a ferramenta não deve penalizar o ptBR real, vivo e legítimo." },
  ];

  // ── CRITÉRIOS (39) ────────────────────────────────────────────────────────

  const CRITERIOS = [
    // ECONOMIA
    { dim: "economia",  n: "01", id: "adverbios-mente",   titulo: "Densidade de advérbios em -mente",       detalhe: "Advérbios que enfraquecem verbos fortes: 'correu rapidamente' vs 'disparou'. Cada -mente desnecessário é uma aposta perdida num verbo fraco. Medir proporção sobre total de tokens.", fontes: ["king","strunk"],              implementado: true,  metrica: "economia.adverbiosMente" },
    { dim: "economia",  n: "02", id: "voz-passiva",        titulo: "Proporção de voz passiva",               detalhe: "Passiva sistemática revela insegurança ou distância afetada. Medir % de construções passivas no total de orações verbais. Passiva com agente indicado é diferente de passiva evasiva.", fontes: ["king","strunk","zinsser"],   implementado: true,  metrica: "economia.vozPassiva" },
    { dim: "economia",  n: "03", id: "redundancia",        titulo: "Índice de redundância",                  detalhe: "Pares redundantes ('completamente terminado', 'subir para cima'), pleonasmos e repetição desnecessária de informação já estabelecida no mesmo bloco.", fontes: ["strunk","zinsser"],          implementado: true,  metrica: "economia.redundancia" },
    { dim: "economia",  n: "04", id: "clutter",            titulo: "Palavras por ideia (clutter)",           detalhe: "Quantas palavras são usadas para veicular uma unidade de informação. Alto = texto inflado. Medir por parágrafo comparando densidade por token.", fontes: ["zinsser","klink"],           implementado: false, metrica: null },
    { dim: "economia",  n: "05", id: "negacao-dupla",      titulo: "Frases com negação dupla ou indireta",   detalhe: "'Não é incomum' em vez de 'é frequente'. Negações para afirmar são evasivas e aumentam carga cognitiva desnecessariamente.", fontes: ["strunk"],                   implementado: true,  metrica: "economia.negacaoDupla" },

    // CLAREZA
    { dim: "clareza",   n: "01", id: "comprimento-frase",  titulo: "Comprimento médio de frase",             detalhe: "Acima de 35 palavras: perigo. Abaixo de 8 como padrão: fragmentação. O ideal varia por gênero, mas a média e o desvio padrão devem ser monitorados.", fontes: ["strunk","zinsser","klink"], implementado: true,  metrica: "clareza.comprimentoMedio" },
    { dim: "clareza",   n: "02", id: "ordem-direta",       titulo: "Ordem direta (S > V > O)",               detalhe: "Inversões e intercalações excessivas entre sujeito e verbo aumentam carga cognitiva. Medir distância média entre sujeito e verbo principal da oração. Orações intercaladas longas (mais de 10 palavras) ou mais de duas interrupções no fluxo S-V-O são sinal de frase que precisa ser desmontada.", fontes: ["estadao","folha","lage"],   implementado: false, metrica: null },
    { dim: "clareza",   n: "03", id: "pronome-ambiguo",    titulo: "Referência pronominal ambígua",          detalhe: "Pronomes sem antecedente claro ou com dois antecedentes possíveis. 'Ele disse que ele estava errado' — qual dos dois? Detectável por análise de correferência.", fontes: ["strunk","gardner"],         implementado: true,  metrica: "clareza.pronomeAmbiguo" },
    { dim: "clareza",   n: "04", id: "tempo-verbal",       titulo: "Coerência de tempo verbal",              detalhe: "Saltos não sinalizados entre presente/pretérito perfeito/imperfeito dentro do mesmo bloco narrativo ou argumentativo.", fontes: ["zinsser","estadao"],         implementado: true,  metrica: "clareza.tempoVerbal" },
    { dim: "clareza",   n: "05", id: "subordinacao",       titulo: "Subordinação excessiva",                 detalhe: "Frases com 3+ orações subordinadas encadeadas perdem o fio. Medir profundidade de encaixe sintático — o 'nível de embedding' de cada frase.", fontes: ["klink","strunk"],           implementado: true,  metrica: "clareza.subordinacaoExcessiva" },
    { dim: "clareza",   n: "06", id: "ambiguidade-sintaxe",  titulo: "Ambiguidade de sintaxe",                detalhe: "Adjuntos adverbiais distantes do núcleo que modificam, ou pontuação ausente em orações explicativas, criam frases com duas leituras possíveis. Diferente de subordinacao-excessiva (profundidade de encaixe): aqui o problema é posicionamento de modificadores. Não alertar quando o contexto imediato resolve a ambiguidade sem esforço do leitor.", fontes: ["lage","folha"],             implementado: false, metrica: null },

    // RITMO
    { dim: "ritmo",     n: "01", id: "variacao-frase",     titulo: "Variação de comprimento frasal",         detalhe: "Desvio padrão no número de palavras por frase. Textos com DP baixo soam mecânicos. O ritmo natural mescla frases curtas (impacto), médias (base) e longas (desenvolvimento).", fontes: ["leguin","klink"],           implementado: true,  metrica: "ritmo.variacaoFrase" },
    { dim: "ritmo",     n: "02", id: "distribuicao-frase", titulo: "Proporção curtas / médias / longas",     detalhe: "Frases <8 palavras (impacto), 8–20 (ritmo base), >20 (desenvolvimento). A distribuição revela o pulso do texto.", fontes: ["leguin","klink"],           implementado: true,  metrica: "ritmo.distribuicaoFrases" },
    { dim: "ritmo",     n: "03", id: "paralelismo",        titulo: "Paralelismo sintático",                  detalhe: "Listas e enumerações devem ter estrutura gramatical equivalente. 'Gosto de ler, escrever e que haja silêncio' quebra o paralelismo.", fontes: ["strunk","leguin"],           implementado: false, metrica: null },
    { dim: "ritmo",     n: "04", id: "repeticao-proxima",  titulo: "Repetição lexical próxima",              detalhe: "A mesma palavra ou raiz usada 2x no raio de 3 frases sem intenção estilística. Distinta da repetição deliberada (anáfora), que é recurso retórico legítimo.", fontes: ["king","zinsser"],           implementado: true,  metrica: "ritmo.repeticaoProxima" },
    { dim: "ritmo",     n: "05", id: "abertura-fecho",     titulo: "Abertura e fechamento de parágrafo",     detalhe: "A primeira e última frases de cada parágrafo são as posições de maior ênfase. Palavras fracas, vagas ou subordinadas nessas posições são desperdício de ênfase.", fontes: ["strunk","leguin"],           implementado: true,  metrica: "ritmo.aberturaFracos" },

    // VOZ
    { dim: "voz",       n: "01", id: "especificidade",     titulo: "Especificidade vs. abstração",           detalhe: "Proporção de substantivos concretos e específicos frente a abstratos e genéricos. 'Cadeira de vime marrom' vs 'móvel'. Concretude é o instrumento da voz — e da cena.", fontes: ["king","gardner","lamott"],  implementado: false, metrica: null },
    { dim: "voz",       n: "02", id: "adjetivo-original",  titulo: "Originalidade do adjetivo",              detalhe: "Adjetivos são apostas do autor (Wood). Adjetivos previsíveis ('belo pôr do sol', 'pesada responsabilidade') revelam ausência de visão. O adjetivo banal é uma voz apagada.", fontes: ["wood","king"],              implementado: false, metrica: null },
    { dim: "voz",       n: "03", id: "consistencia-tom",   titulo: "Consistência de tom",                    detalhe: "Saltos entre formal/coloquial, sarcástico/grave sem transição deliberada. O tom é o contrato tácito com o leitor — quando quebra sem intenção, o texto perde credibilidade.", fontes: ["zinsser","lamott"],         implementado: false, metrica: null },
    { dim: "voz",       n: "04", id: "presenca-autoral",   titulo: "Presença autoral",                       detalhe: "O escritor está no texto? Zinsser chama de 'humanidade'. Clarice chama de risco. Orwell, em 'Por que Escrevo', nomeia o impulso político e estético que move todo escritor. Textos que não assumem posição, que não arriscam, são invisíveis.", fontes: ["zinsser","clarice","orwell"], implementado: false, metrica: null },
    { dim: "voz",       n: "05", id: "cliche",             titulo: "Uso de clichê",                          detalhe: "'No final das contas', 'é importante ressaltar', 'diante do exposto'. Cada clichê é uma voz apagada e uma ideia não pensada. Inclui modismos corporativos e jornalísticos brasileiros: 'a nível de', 'agregando valor', 'fechar com chave de ouro'. Detectável por lista de expressões cristalizadas — diferente de neologismos populares expressivos, que são legítimos.", fontes: ["king","gardner","wood","estadao","folha"],   implementado: true,  metrica: "voz.cliches" },
    { dim: "voz",       n: "06", id: "palavra-nua",         titulo: "Palavra nua (minimalismo de adorno)",    detalhe: "Adjetivação ornamental e figuras de linguagem que não aprofundam o sentido — apenas decoram. Inspirado em Clarice Lispector: a palavra deve 'ser', não 'descrever'. Não se confunde com adjetivo-original (que avalia se o adjetivo é previsível): este critério avalia se o adjetivo é necessário. Não alertar em gêneros líricos ou textos onde a sonoridade é o objetivo.", fontes: ["clarice","salles2"],        implementado: false, metrica: null },

    // ESTRUTURA
    { dim: "estrutura", n: "01", id: "unidade-paragrafo",  titulo: "Unidade temática do parágrafo",          detalhe: "Cada parágrafo deve desenvolver uma ideia. Parágrafos que introduzem, desenvolvem e abandonam ideias sem resolução quebram a progressão e desorientam o leitor.", fontes: ["strunk","zinsser","mckee"],  implementado: false, metrica: null },
    { dim: "estrutura", n: "02", id: "progressao",         titulo: "Progressão do argumento ou narrativa",   detalhe: "Cada seção deve avançar o texto — adicionar informação nova, aprofundar ou virar. Seções que repetem sem acrescentar são redundâncias estruturais. Salles mostra que escritores brasileiros revisam justamente para eliminar redundâncias estruturais nos rascunhos.", fontes: ["mckee","gardner","lamott","salles"], implementado: false, metrica: null },
    { dim: "estrutura", n: "03", id: "coerencia-abertura", titulo: "Coerência entre abertura e fechamento",  detalhe: "O texto chega onde prometeu chegar? A tese é respondida, o conflito é resolvido, a pergunta é endereçada? Medir coerência semântica entre parágrafo inicial e final.", fontes: ["mckee","zinsser"],          implementado: false, metrica: null },
    { dim: "estrutura", n: "04", id: "proporcao-partes",   titulo: "Proporção entre partes",                 detalhe: "Introduções longuíssimas e conclusões sumárias (ou vice-versa) revelam desequilíbrio compositivo. Medir % de palavras por seção e comparar com a convenção do gênero.", fontes: ["mckee","lamott","pressfield"],  implementado: true,  metrica: "estrutura.proporcaoPartes" },
    { dim: "estrutura", n: "05", id: "transicoes",         titulo: "Sinais de transição lógica",             detalhe: "A ausência de conectivos lógicos entre parágrafos pode indicar salto de raciocínio não sinalizado. Distinto de ausência estilística intencional em prosa fragmentada.", fontes: ["zinsser","lage","lima"],     implementado: true,  metrica: "estrutura.transicoes" },

    // PONTO DE VISTA
    { dim: "pov",       n: "01", id: "pessoa-narrativa",   titulo: "Consistência de pessoa narrativa",       detalhe: "Mudanças não sinalizadas de 1ª para 3ª pessoa, de narrador onisciente para focal. Em textos argumentativos: alternância não controlada entre 'eu', 'nós' e 'o autor'.", fontes: ["gardner","leguin","wood","salles2"], implementado: true, metrica: "pov.consistenciaPessoa" },
    { dim: "pov",       n: "02", id: "distancia-psiquica", titulo: "Distância psíquica coerente",            detalhe: "Gardner: do relatório distante ('Ele estava irritado') ao fluxo interno ('Merda, de novo'). Variações bruscas sem intenção estética rompem a imersão.", fontes: ["gardner","leguin"],         implementado: false, metrica: null },
    { dim: "pov",       n: "03", id: "intrusao-autoral",   titulo: "Intrusão autoral não sinalizada",        detalhe: "Em ficção: o autor comentando de fora sem assumir que mudou a instância narrativa. Em não-ficção: a voz enunciadora inconsistente com o posicionamento estabelecido.", fontes: ["gardner","wood"],           implementado: false, metrica: null },
    { dim: "pov",       n: "04", id: "focalizacao",        titulo: "Focalização em textos argumentativos",   detalhe: "Mistura não sinalizada entre argumento pessoal, argumento atribuído a outros e argumento do texto como tese — como se fossem a mesma voz com a mesma autoridade.", fontes: ["lage","zinsser"],           implementado: false, metrica: null },

    // PRECISÃO LEXICAL
    { dim: "lexico",    n: "01", id: "eufemismo",          titulo: "Uso de eufemismo desnecessário",         detalhe: "'Faleceu' vs 'morreu'. 'Conflito armado' vs 'guerra'. Eufemismos suavizam onde não deveriam e distorcem a realidade representada.", fontes: ["estadao","zinsser"],         implementado: false, metrica: null },
    { dim: "lexico",    n: "02", id: "jargao",             titulo: "Jargão sem contextualização",            detalhe: "Termos técnicos, anglicismos e neologismos usados sem que o texto garanta que o leitor-alvo os conhece. O jargão deve servir ao texto, não exibi-lo.", fontes: ["zinsser","estadao","folha"], implementado: false, metrica: null },
    { dim: "lexico",    n: "03", id: "verbos-estado",      titulo: "Verbos de ação vs. verbos de estado",    detalhe: "Alta proporção de 'ser', 'estar', 'ter', 'fazer', 'haver' sinaliza prosa anêmica. Verbos de ação constroem cenas; verbos de estado descrevem estados.", fontes: ["strunk","king"],            implementado: true,  metrica: "lexico.verbosEstado" },
    { dim: "lexico",    n: "04", id: "substantivos-vagos", titulo: "Palavras vagas e genéricas",             detalhe: "'Coisa', 'aspecto', 'questão', 'fator', 'situação' como substantivos principais são vazios semânticos. Especificar é o trabalho do escritor.", fontes: ["zinsser","strunk"],         implementado: true,  metrica: "lexico.substantivosVagos" },
    { dim: "lexico",    n: "05", id: "registro",           titulo: "Adequação ao registro",                  detalhe: "Coloquialismo em texto formal, formalismo excessivo em texto conversacional. O registro deve ser coerente com o gênero, o veículo e o leitor-alvo. Lajolo & Zilberman lembram que o texto existe dentro de um sistema cultural com leitor-alvo definido.", fontes: ["bagno","lage","estadao","lajolo"], implementado: false, metrica: null },
    { dim: "lexico",    n: "06", id: "simplicidade-vocabular", titulo: "Simplicidade vocabular",              detalhe: "Termos eruditos, arcaicos ou pedantes onde existem equivalentes diretos e frequentes: 'outrossim', 'sufragar', 'prurido'. Em textos não técnicos, vocabulário de baixa frequência cria distância artificial do leitor sem ganho de precisão. Não se aplica a termos técnicos essenciais nem a diálogos de personagens caracterizados pelo rebuscamento.", fontes: ["estadao","folha","bagno"],  implementado: false, metrica: null },

    // NORMA ptBR
    { dim: "norma",     n: "01", id: "concordancia",       titulo: "Concordância nominal e verbal",          detalhe: "Erros de concordância que comprometem inteligibilidade ou desviam do padrão culto escrito. Distinto de variação regional ou sociolinguística legítima.", fontes: ["estadao","folha"],          implementado: false, metrica: null },
    { dim: "norma",     n: "02", id: "regencia",           titulo: "Regência verbal e nominal",              detalhe: "'Assistir o filme' vs 'assistir ao filme'. Regências estabelecidas pela norma culta escrita — sem purismo arcaizante.", fontes: ["estadao","folha"],          implementado: false, metrica: null },
    { dim: "norma",     n: "03", id: "crase",              titulo: "Uso de crase",                           detalhe: "Crase como marcador de fusão, não ornamento. Erros sistemáticos revelam domínio parcial da regência nominal.", fontes: ["estadao"],                  implementado: false, metrica: null },
    { dim: "norma",     n: "04", id: "pontuacao",          titulo: "Pontuação funcional",                    detalhe: "Vírgula entre sujeito e predicado, ausência de ponto no final de período, uso decorativo de reticências e exclamações. Pontuação com função comunicativa, não estética.", fontes: ["moreno","squarisi","lukeman"], implementado: true, metrica: "VeredaPunctuation.analyze" },
    { dim: "norma",     n: "05", id: "erro-vs-variacao",   titulo: "Distinção entre erro e variação",        detalhe: "Bagno: 'a gente fomos' é variação sociolinguística; 'o livro que eu comprei ele' é calque oral que pode ser legítimo em contextos coloquiais. A ferramenta não pode ser o MOBRAL digital. Construções consagradas no ptBR culto real — 'ter' por 'haver', 'pedir para' em vez de 'pedir que', regências modernas como 'chegar em' — não devem ser sinalizadas como erro. Alertar só quando houver risco real de ruído ou inadequação ao registro.", fontes: ["bagno","lage"],              implementado: false, metrica: null },
  ];

  // ── HELPER: critérios implementados por dimensão ──────────────────────────

  function getCriteriosPorDim(dimId) {
    return CRITERIOS.filter(c => c.dim === dimId);
  }

  function getCriteriosImplementados() {
    return CRITERIOS.filter(c => c.implementado);
  }

  function getLivroPorId(id) {
    return [...LIVROS.world, ...LIVROS.brasil].find(l => l.id === id) || null;
  }

  // ── EXPORT ────────────────────────────────────────────────────────────────

  global.VeredaCriterios = {
    livros: LIVROS,
    dimensoes: DIMENSOES,
    criterios: CRITERIOS,
    getCriteriosPorDim,
    getCriteriosImplementados,
    getLivroPorId,
    totalCriterios: CRITERIOS.length,
    totalImplementados: CRITERIOS.filter(c => c.implementado).length,
  };

})(window);
