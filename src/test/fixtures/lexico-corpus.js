/* lexico-corpus.js — banca congelada do VeredaLexical (lexico-classes).
 * Textos curtos e variados: classes de palavras, polissemia, acentos
 * distintivos (nós/dá/pé), cliticizados, gentílicos, locuções, siglas,
 * particípios, subjuntivos, pronomes etc. `probes` fixos por caso.
 */
exports.cases = [
  {
    id: "narrativa-3p",
    text: "A casa velha ficava abaixo do morro e ao lado do rio. Os meninos corriam rapidamente pelo quintal, enquanto o cachorro latia em volta da mesa. Os pais, que trabalhavam em função do sustento dos filhos, chegavam ao fim do dia.",
    probes: ["casa", "abaixo", "em", "o", "rápido", "segundo", "correr", "nós", "dá", "ontem"]
  },
  {
    id: "epistolar-1p",
    text: "Querida Tia, hoje comemos o bolo que você deixou na geladeira. Nós ficamos muito felizes. Fê-lo sorrir de manhã. Eu a vi no sábado e pensei em comprar-lhe um presente. Talvez se dê o caso de outra visita.",
    probes: ["Nós", "fê-lo", "dê", "comemos", "você", "comprar-lhe", "sábado", "vi", "de", "que"]
  },
  {
    id: "ensaio-argumentativo",
    text: "Ao invés de simplificar, o texto complica. Abaixo de qualquer padrão crítico, o autor se repete. Em vista de tais argumentos, é preciso reescrever com clareza.",
    probes: ["Ao", "invés", "abaixo", "vista", "padrão", "é", "preciso", "reescrever", "com", "clareza"]
  },
  {
    id: "sujeira-geral",
    text: "Meu amigo é brasiliense; o acriano chegou de surpresa. O 2º lote foi liberado após a vistoria. A sigla ONU aparece no início. O problema é grande, porém o gabinete resolve, se preciso for.",
    probes: ["brasiliense", "acriano", "2º", "ONU", "porém", "se", "foi", "chegou", "grande", "gabinete"]
  },
  {
    id: "poema",
    text: "Nós pé, dês de luz. Rumor vê o mar e o vê calar. Canta, canta. A noite vem para nós.",
    probes: ["Nós", "pé", "dês", "vê", "Canta", "noite", "vem", "para", "o", "calar"]
  },
  {
    id: "vocabulario-diverso",
    text: "aberto fechado certeiro segundo tranquilamente razão contrário. A frase abaixo de qualquer linha. Ela o viu rápido e calou-se.",
    probes: ["aberto", "segundo", "tranquilamente", "razão", "abaixo", "viu", "rápido", "calou-se", "contrário", "linha"]
  },
  {
    id: "cozinha-do-quintal",
    text: "De manhã a avó desceu a escada com o café na caneca, abriu a janela e o orvalho molhou o quintal; na mesa, o pão e o mel esperavam o neto que ainda dormia no quarto de cima.",
    probes: ["avó", "escada", "café", "caneca", "orvalho", "pão", "mel", "quarto", "neto", "dormia"]
  },
  {
    id: "descoberta-do-mundo",
    text: "O mundo da dona era pequeno, mas a amiga sabia de toda palavra. Num susto, a pessoa sentiu uma missão crescer: a responsabilidade da descoberta pediu resposta, e a vontade veio antes do sentimento.",
    probes: ["mundo", "dona", "amiga", "palavra", "susto", "pessoa", "missão", "responsabilidade", "descoberta", "vontade"]
  },
  {
    id: "oficio-da-escrita",
    text: "O conto nascia do retrato e da linguagem: a escrita era o esboço guardado, o manuscrito virava obra, e o artista media a relação com a gênese da página.",
    probes: ["conto", "retrato", "linguagem", "escrita", "esboço", "manuscrito", "obra", "artista", "relação", "gênese"]
  }
];