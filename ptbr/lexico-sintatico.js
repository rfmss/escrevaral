/* Inventário do recorte sintático e literário: dados locais, sem acesso ao manuscrito. ES5. */
(function (root) {
  'use strict';
  var E = root.Escr, own = Object.prototype.hasOwnProperty;
  var nouns = {}, frames = {}, extraVerbs = {}, adjectives = {}, passiveParticiples = {};
  var articles = {
    o: ['m', 'singular'], a: ['f', 'singular'], os: ['m', 'plural'], as: ['f', 'plural'],
    um: ['m', 'singular'], uma: ['f', 'singular'], uns: ['m', 'plural'], umas: ['f', 'plural']
  };
  var determiners = {
    o: { gender: 'm', number: 'singular', kind: 'artigo' },
    a: { gender: 'f', number: 'singular', kind: 'artigo' },
    os: { gender: 'm', number: 'plural', kind: 'artigo' },
    as: { gender: 'f', number: 'plural', kind: 'artigo' },
    um: { gender: 'm', number: 'singular', kind: 'artigo' },
    uma: { gender: 'f', number: 'singular', kind: 'artigo' },
    uns: { gender: 'm', number: 'plural', kind: 'artigo' },
    umas: { gender: 'f', number: 'plural', kind: 'artigo' },
    meu: { gender: 'm', number: 'singular', kind: 'possessivo' },
    minha: { gender: 'f', number: 'singular', kind: 'possessivo' },
    meus: { gender: 'm', number: 'plural', kind: 'possessivo' },
    minhas: { gender: 'f', number: 'plural', kind: 'possessivo' },
    teu: { gender: 'm', number: 'singular', kind: 'possessivo' },
    tua: { gender: 'f', number: 'singular', kind: 'possessivo' },
    teus: { gender: 'm', number: 'plural', kind: 'possessivo' },
    tuas: { gender: 'f', number: 'plural', kind: 'possessivo' },
    seu: { gender: 'm', number: 'singular', kind: 'possessivo' },
    sua: { gender: 'f', number: 'singular', kind: 'possessivo' },
    seus: { gender: 'm', number: 'plural', kind: 'possessivo' },
    suas: { gender: 'f', number: 'plural', kind: 'possessivo' },
    nosso: { gender: 'm', number: 'singular', kind: 'possessivo' },
    nossa: { gender: 'f', number: 'singular', kind: 'possessivo' },
    nossos: { gender: 'm', number: 'plural', kind: 'possessivo' },
    nossas: { gender: 'f', number: 'plural', kind: 'possessivo' },
    este: { gender: 'm', number: 'singular', kind: 'demonstrativo' },
    esta: { gender: 'f', number: 'singular', kind: 'demonstrativo' },
    estes: { gender: 'm', number: 'plural', kind: 'demonstrativo' },
    estas: { gender: 'f', number: 'plural', kind: 'demonstrativo' },
    esse: { gender: 'm', number: 'singular', kind: 'demonstrativo' },
    essa: { gender: 'f', number: 'singular', kind: 'demonstrativo' },
    esses: { gender: 'm', number: 'plural', kind: 'demonstrativo' },
    essas: { gender: 'f', number: 'plural', kind: 'demonstrativo' },
    aquele: { gender: 'm', number: 'singular', kind: 'demonstrativo' },
    aquela: { gender: 'f', number: 'singular', kind: 'demonstrativo' },
    aqueles: { gender: 'm', number: 'plural', kind: 'demonstrativo' },
    aquelas: { gender: 'f', number: 'plural', kind: 'demonstrativo' }
  };
  var prepositions = {
    a: { base: 'a', det: null },
    ao: { base: 'a', det: ['m', 'singular'] },
    'à': { base: 'a', det: ['f', 'singular'] },
    aos: { base: 'a', det: ['m', 'plural'] },
    'às': { base: 'a', det: ['f', 'plural'] },
    para: { base: 'para', det: null },
    de: { base: 'de', det: null },
    do: { base: 'de', det: ['m', 'singular'] },
    da: { base: 'de', det: ['f', 'singular'] },
    dos: { base: 'de', det: ['m', 'plural'] },
    das: { base: 'de', det: ['f', 'plural'] },
    em: { base: 'em', det: null },
    no: { base: 'em', det: ['m', 'singular'] },
    na: { base: 'em', det: ['f', 'singular'] },
    nos: { base: 'em', det: ['m', 'plural'] },
    nas: { base: 'em', det: ['f', 'plural'] },
    num: { base: 'em', det: ['m', 'singular'] },
    numa: { base: 'em', det: ['f', 'singular'] },
    nuns: { base: 'em', det: ['m', 'plural'] },
    numas: { base: 'em', det: ['f', 'plural'] },
    por: { base: 'por', det: null },
    pelo: { base: 'por', det: ['m', 'singular'] },
    pela: { base: 'por', det: ['f', 'singular'] },
    pelos: { base: 'por', det: ['m', 'plural'] },
    pelas: { base: 'por', det: ['f', 'plural'] },
    com: { base: 'com', det: null },
    sem: { base: 'sem', det: null },
    sobre: { base: 'sobre', det: null },
    sob: { base: 'sob', det: null },
    entre: { base: 'entre', det: null },
    'até': { base: 'até', det: null }
  };
  var coordConjs = {
    e: 'aditiva',
    mas: 'adversativa',
    'porém': 'adversativa',
    contudo: 'adversativa',
    todavia: 'adversativa',
    entretanto: 'adversativa',
    ou: 'alternativa',
    pois: 'explicativa',
    logo: 'conclusiva',
    portanto: 'conclusiva'
  };
  var subordConjs = {
    quando: 'temporal',
    enquanto: 'temporal',
    porque: 'causal',
    se: 'condicional'
  };
  var properNames = { ana: 'f', maria: 'f', 'joão': 'm', pedro: 'm' };
  var vocativeNouns = [
    'amigo', 'amiga', 'amigos', 'amigas', 'mãe', 'pai', 'irmão', 'irmã', 'avô', 'avó',
    'filho', 'filha', 'filhos', 'filhas', 'leitor', 'leitora', 'leitores', 'leitoras',
    'escritor', 'escritora', 'escritores', 'escritoras', 'mestre', 'poeta', 'menina', 'menino',
    'meninas', 'meninos', 'mulher', 'homem', 'criança', 'senhor', 'senhora', 'amor', 'coração',
    'vida', 'lua', 'noite', 'sol', 'mar', 'vento'
  ];
  var finalAdverbs = [
    'hoje', 'ontem', 'amanhã', 'aqui', 'ali', 'lá', 'cedo', 'tarde', 'lentamente', 'rapidamente',
    'agora', 'sempre', 'nunca', 'jamais', 'depressa', 'devagar', 'longe', 'perto', 'antes', 'depois', 'ainda',
    'suavemente', 'silenciosamente', 'calmamente', 'docemente', 'levemente', 'tristemente', 'felizmente',
    'novamente', 'finalmente', 'brevemente', 'caladamente'
  ];
  var origin = 'Inventário local preservado e ampliado (sintaxe-4-literaria); não é transcrição de dicionário nem cobertura geral.';

  function nominal(words, gender, number) {
    words.split(' ').forEach(function (form) {
      if (!form) { return; }
      var key = '$' + form;
      if (!nouns[key]) { nouns[key] = []; }
      nouns[key].push({ form: form, wordClass: 'substantivo', gender: gender, number: number, origin: origin });
    });
  }
  /* Formas explícitas; não inferir flexão por sufixo nem sobrescrever candidatos. */
  nominal('livro menino homem escritor poema canto mar pão silêncio tempo fogo dia vento jogo sonho trabalho olho filho pagamento caminho caderno papel texto verso capítulo conto romance diário autor leitor editor amigo pai irmão avô coração corpo rosto sorriso passo gesto segredo destino rio sol céu jardim muro telhado quarto relógio espelho café trem barco navio porto campo ferro ouro vidro casaco chapéu sapato trovão relâmpago inverno verão outono minuto segundo mês ano século mundo lugar espaço ruído som eco brilho medo plano assunto tema título parágrafo rascunho manuscrito arquivo documento selo certificado futuro passado presente horizonte abraço mestre poeta senhor amor', 'm', 'singular');
  nominal('livros meninos homens escritores poemas cantos pães silêncios tempos jogos sonhos trabalhos olhos filhos caminhos cadernos papéis textos versos capítulos contos romances diários autores leitores editores amigos pais irmãos avôs corações corpos rostos sorrisos passos gestos segredos destinos rios sóis céus jardins muros telhados quartos relógios espelhos cafés trens barcos navios portos campos casacos chapéus sapatos trovões relâmpagos invernos verões outonos minutos segundos meses anos séculos mundos lugares espaços ruídos sons ecos medos planos assuntos temas títulos parágrafos rascunhos manuscritos arquivos documentos selos certificados horizontes abraços mestres poetas senhores amores', 'm', 'plural');
  nominal('casa menina mulher escritora carta porta revista opinião rosa flor água mesa vida música notícia família noite cobra vizinha chuva cidade rua janela manhã tarde voz história palavra cadeira luz sombra estrada pessoa amiga mãe irmã avó criança mente ideia memória saudade dor alegria esperança estrela lua árvore folha pedra chave página linha frase crônica cama parede sala cozinha praça estação ilha praia floresta terra areia poeira fumaça cinza prata roupa lágrima viagem resposta pergunta biblioteca escola ponte montanha nuvem tempestade hora semana primavera infância juventude velhice oficina obra língua escrita leitura revisão calma paz brisa neblina filha leitora senhora', 'f', 'singular');
  nominal('casas meninas mulheres escritoras cartas portas revistas opiniões rosas flores águas mesas vidas cobras vizinhas chuvas cidades ruas janelas manhãs tardes vozes histórias palavras cadeiras luzes sombras estradas pessoas amigas mães irmãs avós crianças mentes ideias memórias saudades dores alegrias esperanças estrelas luas árvores folhas pedras chaves páginas linhas frases crônicas camas paredes salas cozinhas praças estações ilhas praias florestas terras areias roupas lágrimas viagens respostas perguntas bibliotecas escolas pontes montanhas nuvens tempestades horas semanas primaveras oficinas obras línguas escritas leituras revisões brisas filhas leitoras senhoras', 'f', 'plural');

  /* Adjetivos explícitos com gênero/número (m, f, ou u=uniforme) para concordância estrita */
  function addAdjBiform(stems) {
    stems.split(' ').forEach(function (stem) {
      if (!stem) { return; }
      adjectives['$' + stem + 'o'] = { gender: 'm', number: 'singular' };
      adjectives['$' + stem + 'a'] = { gender: 'f', number: 'singular' };
      adjectives['$' + stem + 'os'] = { gender: 'm', number: 'plural' };
      adjectives['$' + stem + 'as'] = { gender: 'f', number: 'plural' };
    });
  }
  function addAdjUniform(pairs) {
    pairs.forEach(function (pair) {
      adjectives['$' + pair[0]] = { gender: 'u', number: 'singular' };
      adjectives['$' + pair[1]] = { gender: 'u', number: 'plural' };
    });
  }
  addAdjBiform('bonit velh nov larg públic abert sec clar antig silencios long escur calm seren fri alt baix profund vazi chei lent rápid pequen frac viv mort rar pur solitári dourad pratead branc negr vermelh cansad atent quiet imens etern secret noturn querid car');
  adjectives.$bom = { gender: 'm', number: 'singular' };
  adjectives.$boa = { gender: 'f', number: 'singular' };
  adjectives.$bons = { gender: 'm', number: 'plural' };
  adjectives.$boas = { gender: 'f', number: 'plural' };
  addAdjUniform([
    ['feliz', 'felizes'], ['triste', 'tristes'], ['leve', 'leves'], ['breve', 'breves'],
    ['doce', 'doces'], ['suave', 'suaves'], ['grande', 'grandes'], ['forte', 'fortes'],
    ['alegre', 'alegres'], ['livre', 'livres'], ['quente', 'quentes'], ['verde', 'verdes'],
    ['azul', 'azuis'], ['matinal', 'matinais'], ['simples', 'simples'], ['frágil', 'frágeis']
  ]);
  adjectives['$são'] = { gender: 'm', number: 'singular' };

  /* Paradigmas verbais explícitos do recorte literário (somente indicativo; nunca infere de lemas desconhecidos) */
  function addVerb(form, lemma, tense, person, number) {
    var key = '$' + form;
    if (!extraVerbs[key]) { extraVerbs[key] = []; }
    extraVerbs[key].push([lemma, tense, person, number]);
  }
  function regAr(lemma, perf1s) {
    var stem = lemma.slice(0, -2);
    var p1 = perf1s || (stem + 'ei');
    addVerb(stem + 'o', lemma, 'indicativo:presente', 1, 'singular');
    addVerb(stem + 'as', lemma, 'indicativo:presente', 2, 'singular');
    addVerb(stem + 'a', lemma, 'indicativo:presente', 3, 'singular');
    addVerb(stem + 'amos', lemma, 'indicativo:presente', 1, 'plural');
    addVerb(stem + 'am', lemma, 'indicativo:presente', 3, 'plural');
    addVerb(p1, lemma, 'indicativo:pretérito perfeito', 1, 'singular');
    addVerb(stem + 'aste', lemma, 'indicativo:pretérito perfeito', 2, 'singular');
    addVerb(stem + 'ou', lemma, 'indicativo:pretérito perfeito', 3, 'singular');
    addVerb(stem + 'amos', lemma, 'indicativo:pretérito perfeito', 1, 'plural');
    addVerb(stem + 'aram', lemma, 'indicativo:pretérito perfeito', 3, 'plural');
    addVerb(stem + 'ava', lemma, 'indicativo:pretérito imperfeito', 1, 'singular');
    addVerb(stem + 'avas', lemma, 'indicativo:pretérito imperfeito', 2, 'singular');
    addVerb(stem + 'ava', lemma, 'indicativo:pretérito imperfeito', 3, 'singular');
    addVerb(stem + 'ávamos', lemma, 'indicativo:pretérito imperfeito', 1, 'plural');
    addVerb(stem + 'avam', lemma, 'indicativo:pretérito imperfeito', 3, 'plural');
    addVerb(lemma + 'ei', lemma, 'indicativo:futuro do presente', 1, 'singular');
    addVerb(lemma + 'ás', lemma, 'indicativo:futuro do presente', 2, 'singular');
    addVerb(lemma + 'á', lemma, 'indicativo:futuro do presente', 3, 'singular');
    addVerb(lemma + 'emos', lemma, 'indicativo:futuro do presente', 1, 'plural');
    addVerb(lemma + 'ão', lemma, 'indicativo:futuro do presente', 3, 'plural');
  }
  function regEr(lemma, pres1s) {
    var stem = lemma.slice(0, -2);
    var p1 = pres1s || (stem + 'o');
    addVerb(p1, lemma, 'indicativo:presente', 1, 'singular');
    addVerb(stem + 'es', lemma, 'indicativo:presente', 2, 'singular');
    addVerb(stem + 'e', lemma, 'indicativo:presente', 3, 'singular');
    addVerb(stem + 'emos', lemma, 'indicativo:presente', 1, 'plural');
    addVerb(stem + 'em', lemma, 'indicativo:presente', 3, 'plural');
    addVerb(stem + 'i', lemma, 'indicativo:pretérito perfeito', 1, 'singular');
    addVerb(stem + 'este', lemma, 'indicativo:pretérito perfeito', 2, 'singular');
    addVerb(stem + 'eu', lemma, 'indicativo:pretérito perfeito', 3, 'singular');
    addVerb(stem + 'emos', lemma, 'indicativo:pretérito perfeito', 1, 'plural');
    addVerb(stem + 'eram', lemma, 'indicativo:pretérito perfeito', 3, 'plural');
    addVerb(stem + 'ia', lemma, 'indicativo:pretérito imperfeito', 1, 'singular');
    addVerb(stem + 'ias', lemma, 'indicativo:pretérito imperfeito', 2, 'singular');
    addVerb(stem + 'ia', lemma, 'indicativo:pretérito imperfeito', 3, 'singular');
    addVerb(stem + 'íamos', lemma, 'indicativo:pretérito imperfeito', 1, 'plural');
    addVerb(stem + 'iam', lemma, 'indicativo:pretérito imperfeito', 3, 'plural');
    addVerb(lemma + 'ei', lemma, 'indicativo:futuro do presente', 1, 'singular');
    addVerb(lemma + 'ás', lemma, 'indicativo:futuro do presente', 2, 'singular');
    addVerb(lemma + 'á', lemma, 'indicativo:futuro do presente', 3, 'singular');
    addVerb(lemma + 'emos', lemma, 'indicativo:futuro do presente', 1, 'plural');
    addVerb(lemma + 'ão', lemma, 'indicativo:futuro do presente', 3, 'plural');
  }
  function regIr(lemma, pres1s) {
    var stem = lemma.slice(0, -2);
    var p1 = pres1s || (stem + 'o');
    addVerb(p1, lemma, 'indicativo:presente', 1, 'singular');
    addVerb(stem + 'es', lemma, 'indicativo:presente', 2, 'singular');
    addVerb(stem + 'e', lemma, 'indicativo:presente', 3, 'singular');
    addVerb(stem + 'imos', lemma, 'indicativo:presente', 1, 'plural');
    addVerb(stem + 'em', lemma, 'indicativo:presente', 3, 'plural');
    addVerb(stem + 'i', lemma, 'indicativo:pretérito perfeito', 1, 'singular');
    addVerb(stem + 'iste', lemma, 'indicativo:pretérito perfeito', 2, 'singular');
    addVerb(stem + 'iu', lemma, 'indicativo:pretérito perfeito', 3, 'singular');
    addVerb(stem + 'imos', lemma, 'indicativo:pretérito perfeito', 1, 'plural');
    addVerb(stem + 'iram', lemma, 'indicativo:pretérito perfeito', 3, 'plural');
    addVerb(stem + 'ia', lemma, 'indicativo:pretérito imperfeito', 1, 'singular');
    addVerb(stem + 'ias', lemma, 'indicativo:pretérito imperfeito', 2, 'singular');
    addVerb(stem + 'ia', lemma, 'indicativo:pretérito imperfeito', 3, 'singular');
    addVerb(stem + 'íamos', lemma, 'indicativo:pretérito imperfeito', 1, 'plural');
    addVerb(stem + 'iam', lemma, 'indicativo:pretérito imperfeito', 3, 'plural');
    addVerb(lemma + 'ei', lemma, 'indicativo:futuro do presente', 1, 'singular');
    addVerb(lemma + 'ás', lemma, 'indicativo:futuro do presente', 2, 'singular');
    addVerb(lemma + 'á', lemma, 'indicativo:futuro do presente', 3, 'singular');
    addVerb(lemma + 'emos', lemma, 'indicativo:futuro do presente', 1, 'plural');
    addVerb(lemma + 'ão', lemma, 'indicativo:futuro do presente', 3, 'plural');
  }

  'guardar procurar achar criar pintar desenhar contar narrar lembrar levar segurar fechar preparar ensinar mostrar revelar inventar imaginar observar admirar visitar enviar assinar revisar recitar acordar chorar caminhar passear viajar voltar retornar descansar silenciar brilhar escapar entrar parar terminar continuar precisar acreditar confiar sonhar cuidar concordar duvidar navegar passar notar'.split(' ').forEach(function (w) { regAr(w); });
  regAr('dedicar', 'dediquei');
  regAr('explicar', 'expliquei');
  regAr('ficar', 'fiquei');
  regAr('tocar', 'toquei');
  regAr('chegar', 'cheguei');
  regAr('entregar', 'entreguei');
  regAr('pegar', 'peguei');
  regAr('apagar', 'apaguei');
  regAr('começar', 'comecei');

  'escolher aprender entender compreender esconder receber devolver prometer acender viver morrer correr perceber'.split(' ').forEach(function (w) { regEr(w); });
  regEr('esquecer', 'esqueço');
  regEr('conhecer', 'conheço');
  regEr('oferecer', 'ofereço');
  regEr('parecer', 'pareço');
  regEr('permanecer', 'permaneço');
  regEr('florescer', 'floresço');
  regEr('nascer', 'nasço');
  regEr('crescer', 'cresço');
  regEr('descer', 'desço');
  regEr('pertencer', 'pertenço');
  regEr('obedecer', 'obedeço');

  'resistir assistir insistir decidir dividir permitir'.split(' ').forEach(function (w) { regIr(w); });
  regIr('sentir', 'sinto');
  regIr('ouvir', 'ouço');
  regIr('dormir', 'durmo');
  regIr('descobrir', 'descubro');
  regIr('seguir', 'sigo');
  regIr('subir', 'subo');
  regIr('fugir', 'fujo');
  /* Verbo cair (formas literárias frequentes no indicativo) */
  addVerb('caio', 'cair', 'indicativo:presente', 1, 'singular');
  addVerb('cais', 'cair', 'indicativo:presente', 2, 'singular');
  addVerb('cai', 'cair', 'indicativo:presente', 3, 'singular');
  addVerb('caímos', 'cair', 'indicativo:presente', 1, 'plural');
  addVerb('caem', 'cair', 'indicativo:presente', 3, 'plural');
  addVerb('caí', 'cair', 'indicativo:pretérito perfeito', 1, 'singular');
  addVerb('caiu', 'cair', 'indicativo:pretérito perfeito', 3, 'singular');
  addVerb('caímos', 'cair', 'indicativo:pretérito perfeito', 1, 'plural');
  addVerb('caíram', 'cair', 'indicativo:pretérito perfeito', 3, 'plural');
  addVerb('caía', 'cair', 'indicativo:pretérito imperfeito', 1, 'singular');
  addVerb('caía', 'cair', 'indicativo:pretérito imperfeito', 3, 'singular');
  addVerb('caíam', 'cair', 'indicativo:pretérito imperfeito', 3, 'plural');
  /* Verbo sorrir */
  addVerb('sorrio', 'sorrir', 'indicativo:presente', 1, 'singular');
  addVerb('sorri', 'sorrir', 'indicativo:presente', 3, 'singular');
  addVerb('sorrimos', 'sorrir', 'indicativo:presente', 1, 'plural');
  addVerb('sorriem', 'sorrir', 'indicativo:presente', 3, 'plural');
  addVerb('sorri', 'sorrir', 'indicativo:pretérito perfeito', 1, 'singular');
  addVerb('sorriu', 'sorrir', 'indicativo:pretérito perfeito', 3, 'singular');
  addVerb('sorrimos', 'sorrir', 'indicativo:pretérito perfeito', 1, 'plural');
  addVerb('sorriram', 'sorrir', 'indicativo:pretérito perfeito', 3, 'plural');
  addVerb('sorria', 'sorrir', 'indicativo:pretérito imperfeito', 1, 'singular');
  addVerb('sorria', 'sorrir', 'indicativo:pretérito imperfeito', 3, 'singular');
  addVerb('sorriam', 'sorrir', 'indicativo:pretérito imperfeito', 3, 'plural');

  /* Particípios explícitos concordantes para voz passiva analítica (sem inferir por sufixo em palavras desconhecidas) */
  function addPassiveBiform(lemma, stem) {
    passiveParticiples['$' + stem + 'o'] = { lemma: lemma, gender: 'm', number: 'singular' };
    passiveParticiples['$' + stem + 'a'] = { lemma: lemma, gender: 'f', number: 'singular' };
    passiveParticiples['$' + stem + 'os'] = { lemma: lemma, gender: 'm', number: 'plural' };
    passiveParticiples['$' + stem + 'as'] = { lemma: lemma, gender: 'f', number: 'plural' };
  }
  [
    ['amar', 'amad'], ['comprar', 'comprad'], ['ler', 'lid'], ['escrever', 'escrit'], ['publicar', 'publicad'],
    ['ver', 'vist'], ['abrir', 'abert'], ['cortar', 'cortad'], ['encontrar', 'encontrad'], ['trazer', 'trazid'],
    ['ouvir', 'ouvid'], ['sentir', 'sentid'], ['guardar', 'guardad'], ['procurar', 'procurad'], ['perder', 'perdid'],
    ['achar', 'achad'], ['construir', 'construíd'], ['criar', 'criad'], ['pintar', 'pintad'], ['desenhar', 'desenhad'],
    ['contar', 'contad'], ['narrar', 'narrad'], ['lembrar', 'lembrad'], ['esquecer', 'esquecid'], ['escolher', 'escolhid'],
    ['seguir', 'seguid'], ['deixar', 'deixad'], ['levar', 'levad'], ['segurar', 'segurad'], ['fechar', 'fechad'],
    ['preparar', 'preparad'], ['ensinar', 'ensinad'], ['aprender', 'aprendid'], ['entender', 'entendid'],
    ['compreender', 'compreendid'], ['explicar', 'explicad'], ['mostrar', 'mostrad'], ['esconder', 'escondid'],
    ['revelar', 'revelad'], ['descobrir', 'descobert'], ['inventar', 'inventad'], ['imaginar', 'imaginad'],
    ['observar', 'observad'], ['admirar', 'admirad'], ['visitar', 'visitad'], ['conhecer', 'conhecid'],
    ['receber', 'recebid'], ['enviar', 'enviad'], ['assinar', 'assinad'], ['revisar', 'revisad'],
    ['corrigir', 'corrigid'], ['traduzir', 'traduzid'], ['recitar', 'recitad'], ['acender', 'aces'],
    ['apagar', 'apagad'], ['devolver', 'devolvid'], ['oferecer', 'oferecid'], ['dedicar', 'dedicad'],
    ['prometer', 'prometid'], ['tocar', 'tocad'], ['cantar', 'cantad'], ['perceber', 'percebid'], ['notar', 'notad']
  ].forEach(function (pair) { addPassiveBiform(pair[0], pair[1]); });
  passiveParticiples.$entregue = { lemma: 'entregar', gender: 'u', number: 'singular' };
  passiveParticiples.$entregues = { lemma: 'entregar', gender: 'u', number: 'plural' };

  function pattern(words, kind) {
    words.split(' ').forEach(function (lemma) {
      if (!lemma) { return; }
      var key = '$' + lemma;
      if (!frames[key]) { frames[key] = []; }
      frames[key].push({ id: 'REG-' + lemma + '-' + kind, lemma: lemma, pattern: kind, status: 'implementado-no-recorte', origin: origin });
    });
  }
  /* Usos reconhecidos, nunca classificação permanente do verbo. */
  pattern('amar comprar ler escrever publicar ver abrir cortar encontrar trazer ouvir sentir guardar procurar perder achar construir criar pintar desenhar contar narrar lembrar esquecer escolher seguir deixar levar pegar segurar fechar beber comer preparar estudar ensinar aprender entender compreender explicar mostrar esconder revelar descobrir inventar imaginar observar admirar visitar conhecer receber enviar entregar assinar revisar corrigir traduzir recitar acender apagar devolver oferecer dedicar prometer tocar começar perceber notar', 'objeto-direto');
  pattern('ser estar parecer ficar continuar permanecer', 'predicativo');
  pattern('dar entregar enviar mostrar contar escrever trazer devolver oferecer dedicar prometer ensinar explicar revelar', 'direto-e-indireto-a');
  pattern('precisar cuidar duvidar', 'objeto-indireto-de');
  pattern('pensar acreditar confiar insistir', 'objeto-indireto-em');
  pattern('sonhar concordar', 'objeto-indireto-com');
  pattern('pertencer obedecer resistir assistir', 'objeto-indireto-a');
  pattern('dizer saber ver ouvir sentir pensar acreditar descobrir entender compreender perceber notar lembrar esquecer prometer revelar contar explicar imaginar', 'oracao-objetiva-direta');
  pattern('cantar andar correr sair partir trabalhar chegar terminar dormir acordar sorrir chorar rir cair nascer morrer crescer viver esperar caminhar passear viajar voltar retornar descansar silenciar brilhar florescer escapar fugir entrar descer subir parar navegar passar ficar permanecer', 'sem-complemento');

  function copy(record) { var out = {}; Object.keys(record).forEach(function (k) { out[k] = record[k]; }); return out; }
  function framesFor(lemma) { return (frames['$' + lemma] || []).map(copy); }
  function verbReadings(form) {
    var base = E.contextualMorphology ? E.contextualMorphology.readings(form).verbs : [];
    var more = extraVerbs['$' + form] || [];
    if (!more.length) { return base.map(function (f) { return f.slice(); }); }
    var out = [], seen = {}, i, k, f;
    for (i = 0; i < base.length; i += 1) {
      f = base[i]; k = f.join('|');
      if (!seen[k]) { seen[k] = true; out.push(f.slice()); }
    }
    for (i = 0; i < more.length; i += 1) {
      f = more[i]; k = f.join('|');
      if (!seen[k]) { seen[k] = true; out.push(f.slice()); }
    }
    return out;
  }

  E.syntaxLexicon = {
    version: 'lexico-sintatico-6',
    nounReadings: function (form) { return (nouns['$' + form] || []).map(copy); },
    articleReading: function (form) { return own.call(articles, form) ? articles[form].slice() : null; },
    determinerReading: function (form) { return own.call(determiners, form) ? copy(determiners[form]) : null; },
    adjectiveReading: function (form) { return own.call(adjectives, '$' + form) ? copy(adjectives['$' + form]) : null; },
    passiveParticipleReading: function (form) { return own.call(passiveParticiples, '$' + form) ? copy(passiveParticiples['$' + form]) : null; },
    prepReading: function (form) {
      if (!own.call(prepositions, form)) { return null; }
      var p = prepositions[form];
      return { base: p.base, det: p.det ? p.det.slice() : null };
    },
    coordReading: function (form) { return own.call(coordConjs, form) ? coordConjs[form] : null; },
    subordReading: function (form) { return own.call(subordConjs, form) ? subordConjs[form] : null; },
    isFinalAdverb: function (form) { return finalAdverbs.indexOf(form) >= 0; },
    isProperName: function (form) { return own.call(properNames, form); },
    properNameGender: function (form) { return own.call(properNames, form) ? properNames[form] : null; },
    isVocativeNoun: function (form) { return vocativeNouns.indexOf(form) >= 0; },
    verbReadings: verbReadings,
    framesFor: framesFor,
    frame: function (lemma, kind) {
      var candidates = framesFor(lemma).filter(function (f) { return f.pattern === kind; });
      return candidates.length === 1 ? candidates[0] : null;
    }
  };
}(typeof window !== 'undefined' ? window : this));
