(function (root) {
  'use strict';
  var E = root.Escr;
  E.maturationData = {
    version: '3.0.0',
    craseSource: { title: 'Senado Federal, Manual de Comunicação, Crase, itens 1 e 4 de Não ocorre crase; consultado em 10/09/2026', url: 'https://www12.senado.leg.br/manualdecomunicacao/estilos/crase' },
    verbSource: { title: 'Recorte local de concordância; corpus C2 e normativeVerbSupplement.ts de rfmss/escrevaral, main 816ca7e. Regra escolar de haver existencial, existir pessoal e fazer temporal; revisão bibliográfica individual pendente', url: null },
    styleSource: { title: 'Critério descritivo local v1, adaptado de analise-engine.js e voz-estilistica.js do legado. Limiares operacionais, sem validação como medida de qualidade literária', url: null },
    crasePronouns: ['ele', 'ela', 'eles', 'elas', 'você', 'vocês', 'mim', 'ti', 'si', 'nós', 'vós'],
    craseInfinitives: ['partir', 'ler', 'escrever', 'fazer', 'falar', 'pensar', 'trabalhar', 'estudar', 'caminhar', 'dormir', 'comer', 'viver'],
    /* Só estes substantivos entram na concordância; nunca deduzir plural pelo sufixo s. */
    pluralNouns: ['problemas', 'livros', 'cartas', 'pessoas', 'autores', 'autoras', 'escritores', 'escritoras', 'leitores', 'leitoras', 'meninos', 'meninas', 'crianças', 'casas', 'poemas', 'textos', 'palavras', 'páginas', 'capítulos', 'exemplos', 'dúvidas', 'erros', 'motivos', 'razões', 'possibilidades', 'diferenças', 'mudanças', 'reuniões', 'vagas', 'flores', 'notícias', 'perdas', 'livrarias', 'opções'],
    quantifiers: ['os', 'as', 'uns', 'umas', 'muitos', 'muitas', 'vários', 'várias', 'alguns', 'algumas', 'dois', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'],
    pluralAdjectives: ['novos', 'novas', 'antigos', 'antigas', 'abertos', 'abertas', 'fechados', 'fechadas', 'importantes', 'diferentes'],
    adjuncts: ['hoje', 'ontem', 'amanhã', 'aqui', 'ali', 'lá', 'na mesa', 'sobre a mesa', 'no texto', 'no livro', 'no manuscrito', 'na sala', 'na cidade', 'na escola', 'na reunião', 'no jardim', 'na biblioteca'],
    haver: { houveram: 'houve', haviam: 'havia', 'haverão': 'haverá', haveriam: 'haveria' },
    existir: { existe: 'existem', existia: 'existiam', 'existirá': 'existirão', existiria: 'existiriam' },
    haverAux: { devem: 'deve', deveriam: 'deveria', podem: 'pode', poderiam: 'poderia' },
    existirAux: { deve: 'devem', deveria: 'deveriam', pode: 'podem', poderia: 'poderiam' },
    fazer: { fazem: 'faz', faziam: 'fazia', 'farão': 'fará', fariam: 'faria' },
    timeUnits: ['anos', 'meses', 'semanas', 'dias', 'horas', 'minutos', 'segundos'],
    amounts: ['dois', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'vinte', 'trinta', 'muitos', 'muitas', 'vários', 'várias'],
    repeatWindow: 40, repeatMinimum: 3,
    stopwords: ['a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'sem', 'sob', 'sobre', 'entre', 'e', 'ou', 'mas', 'que', 'se', 'como', 'quando', 'onde', 'quem', 'qual', 'quais', 'cujo', 'cuja', 'seus', 'suas', 'seu', 'sua', 'meu', 'minha', 'meus', 'minhas', 'esse', 'essa', 'este', 'esta', 'isso', 'isto', 'aquele', 'aquela', 'porque', 'também', 'muito', 'muita', 'muitos', 'muitas', 'pouco', 'pouca', 'poucos', 'poucas', 'todos', 'todas', 'todo', 'toda', 'eles', 'elas', 'você', 'vocês'],
    abbreviations: ['sr', 'sra', 'dr', 'dra', 'prof', 'profa', 'etc', 'vs', 'vol', 'cap', 'fig', 'pág', 'art', 'av'],
    infinitiveLemmas: ['abrir', 'acabar', 'achar', 'ajudar', 'amar', 'analisar', 'andar', 'aprender', 'buscar', 'cantar', 'carregar', 'chamar', 'chegar', 'chover', 'começar', 'comer', 'concluir', 'conhecer', 'continuar', 'correr', 'cortar', 'criar', 'deixar', 'dever', 'dormir', 'escrever', 'esperar', 'estudar', 'evitar', 'falar', 'fechar', 'ficar', 'gostar', 'largar', 'ler', 'lembrar', 'morar', 'mover', 'nascer', 'olhar', 'ouvir', 'partir', 'passar', 'pensar', 'perceber', 'perder', 'permanecer', 'precisar', 'procurar', 'publicar', 'receber', 'resolver', 'responder', 'revisar', 'sair', 'seguir', 'sentir', 'tentar', 'terminar', 'trabalhar', 'usar', 'vender', 'viver', 'voltar', 'varrer'],
    infinitivePrepositions: ['para', 'sem', 'por', 'de', 'após', 'até'],
    infinitiveEndings: [['mos', 1, 'plural'], ['des', 2, 'plural'], ['es', 2, 'singular'], ['em', 3, 'plural']],
    subjects: { eu: [1, 'singular'], tu: [2, 'singular'], ele: [3, 'singular'], ela: [3, 'singular'], 'você': [3, 'singular'], 'nós': [1, 'plural'], 'vós': [2, 'plural'], eles: [3, 'plural'], elas: [3, 'plural'], 'vocês': [3, 'plural'] }
  };
  E.lensCatalog = [
    { id: 'ortografia', group: 'Convenções', minimum: 1, scope: 'Grafias da lista local; palavras desconhecidas ficam sem julgamento.' },
    { id: 'acentuacao', group: 'Convenções', minimum: 1, scope: 'Acentos da lista local; pares ambíguos ficam sem julgamento.' },
    { id: 'pontuacao', group: 'Convenções', minimum: 0, scope: 'Somente sequências mecânicas de vírgulas e pontos e vírgulas.' },
    { id: 'crase', group: 'Convenções', minimum: 2, scope: 'Acento grave diante de pronomes pessoais e infinitivos registrados; não procura crases ausentes.' },
    { id: 'concordancia', group: 'Convenções', minimum: 3, scope: 'Haver, existir e fazer em construções delimitadas. Orações fora desse recorte ficam sem julgamento.' },
    { id: 'morfologia', group: 'Gramática', minimum: 1, scope: 'Leituras lexicais e infinitivos em contexto; desconhecidos e ambiguidades são preservados.' },
    { id: 'sintaxe', group: 'Gramática', minimum: 2, scope: 'Só orações simples inteiras reconhecidas pelo vocabulário local.' },
    { id: 'decolonial', group: 'Escolhas de escrita', minimum: 2, scope: '18 expressões para reflexão contextual; não atribui intenção nem etimologia.' },
    { id: 'expressoes', group: 'Escolhas de escrita', minimum: 1, scope: 'Expressões do catálogo; presença não implica clichê ou corte necessário.' },
    { id: 'repeticao', group: 'Escolhas de escrita', minimum: 3, scope: 'Três ocorrências da mesma grafia em até 40 palavras, dentro do mesmo parágrafo; pode ser um motivo intencional.' },
    { id: 'ritmo', group: 'Escolhas de escrita', minimum: 3, sentences: 3, scope: 'Extensão e variação de pelo menos três frases delimitadas; não mede qualidade ou voz.' },
    { id: 'rima', group: 'Poesia', minimum: 2, lines: 2, scope: 'Terminações gráficas de duas ou mais linhas; a confirmação depende da leitura em voz alta.' },
    { id: 'metrica', group: 'Poesia', minimum: 1, scope: 'Escansão aproximada por linha; sinaliza alternativas de leitura.' }
  ];
}(typeof window !== 'undefined' ? window : this));
