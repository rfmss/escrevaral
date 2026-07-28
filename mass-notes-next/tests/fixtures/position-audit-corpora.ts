export type PositionAuditTarget = {
  label: string
  value: string
  occurrence?: number
}

export type PositionAuditCorpus = {
  id: string
  title: string
  html: string
  targets: PositionAuditTarget[]
}

export const positionAuditCorpora: PositionAuditCorpus[] = [
  {
    id: 'prosa-dialogo',
    title: 'A rua depois da chuva',
    html: [
      '<h2>A rua depois da chuva</h2>',
      '<p>Às seis e vinte, o ônibus dobrou a esquina da Rua do Catete — lento, amarelo, espirrando água nas calçadas.</p>',
      '<p>Joana fechou o guarda-chuva, respirou fundo e pensou: “Hoje eu volto para casa antes do café esfriar.”</p>',
      '<h3>Conversa na cozinha</h3>',
      '<p>— Você trouxe o coentro? — perguntou Dandara.</p>',
      '<p>— Trouxe. E também pimenta-de-cheiro, porque comida sem coragem vira silêncio.</p>',
      '<p>“Então acenda o fogo”, disse a avó, rindo.</p>',
    ].join(''),
    targets: [
      { label: 'acento inicial', value: 'Às seis e vinte' },
      { label: 'travessão interno', value: 'Rua do Catete — lento' },
      { label: 'aspas curvas', value: '“Hoje eu volto para casa antes do café esfriar.”' },
      { label: 'fala com travessões', value: '— Você trouxe o coentro? — perguntou Dandara.' },
      { label: 'hífen lexical', value: 'pimenta-de-cheiro' },
      { label: 'travessia entre blocos', value: 'calçadas.\n\nJoana' },
    ],
  },
  {
    id: 'ensaio-estrutura',
    title: 'Escutar a cidade',
    html: [
      '<h2>Escutar a cidade</h2>',
      '<p>Escrever em português brasileiro exige escutar o país sem fingir que existe uma única voz nacional.</p>',
      '<blockquote><p>A norma organiza parte da conversa; a experiência cotidiana inventa o restante.</p><p>Nenhuma escolha de linguagem é neutra, mas toda escolha pode ser consciente.</p></blockquote>',
      '<ol>',
      '<li><p>Observar o ritmo da frase.</p><ul><li><p>Marcar pausas que ajudam a leitura.</p></li><li><p>Preservar oralidades sem caricatura.</p></li></ul></li>',
      '<li><p>Revisar sem apagar a pessoa que escreve.</p></li>',
      '</ol>',
      '<p>O texto final deve continuar pertencendo a quem o escreveu.</p>',
    ].join(''),
    targets: [
      { label: 'português brasileiro', value: 'português brasileiro' },
      { label: 'citação primeira', value: 'A norma organiza parte da conversa' },
      { label: 'citação segunda', value: 'NENHUMA ESCOLHA', occurrence: 0 },
      { label: 'lista principal', value: 'Observar o ritmo da frase.' },
      { label: 'lista aninhada', value: 'Preservar oralidades sem caricatura.' },
      { label: 'travessia citação-lista', value: 'consciente.\n\nObservar' },
      { label: 'fecho autoral', value: 'pertencendo a quem o escreveu' },
    ],
  },
  {
    id: 'poesia-estofes',
    title: 'Quintal em duas estrofes',
    html: [
      '<h2>Quintal em duas estrofes</h2>',
      '<p>No quintal a tarde ferve</p>',
      '<p>e a mangueira guarda o céu.</p>',
      '<p></p>',
      '<p>Minha mãe costura a noite</p>',
      '<p>com linha, reza e papel.</p>',
      '<p>O cachorro late ao longe;</p>',
      '<p>a lua aprende o meu nome.</p>',
    ].join(''),
    targets: [
      { label: 'verso inicial', value: 'No quintal a tarde ferve' },
      { label: 'céu acentuado', value: 'guarda o céu.' },
      { label: 'fronteira de estrofe', value: 'céu.\n\n\n\nMinha mãe' },
      { label: 'pontuação de verso', value: 'O cachorro late ao longe;' },
      { label: 'verso final', value: 'a lua aprende o meu nome.' },
    ],
  },
  {
    id: 'cordel',
    title: 'Folheto da palavra',
    html: [
      '<h2>Folheto da palavra</h2>',
      '<p>No terreiro do sertão</p>',
      '<p>vento aprende a soletrar;</p>',
      '<p>cada rima é um clarão</p>',
      '<p>que não cabe no olhar.</p>',
      '<p></p>',
      '<p>Quando a feira abre a lona</p>',
      '<p>todo nome ganha estrada;</p>',
      '<p>uma história puxa a outra,</p>',
      '<p>feito rede bem trançada.</p>',
    ].join(''),
    targets: [
      { label: 'sertão', value: 'No terreiro do sertão' },
      { label: 'ponto e vírgula', value: 'vento aprende a soletrar;' },
      { label: 'não e clarão', value: 'cada rima é um clarão\n\nque não cabe no olhar.' },
      { label: 'fronteira de sextilha', value: 'olhar.\n\n\n\nQuando a feira' },
      { label: 'cedilha ausente e til', value: 'feito rede bem trançada.' },
    ],
  },
  {
    id: 'cancao-hardbreak',
    title: 'Batida da rua',
    html: [
      '<h2>Batida da rua</h2>',
      '<p>Bate lata, bate palma,<br>deixa a rua responder;</p>',
      '<p>quando a noite muda a calma,<br>todo corpo quer dizer.</p>',
      '<p>No refrão ninguém se esconde:<br>cada voz encontra onde.</p>',
    ].join(''),
    targets: [
      { label: 'quebra interna um', value: 'palma,\ndeixa' },
      { label: 'quebra interna dois', value: 'calma,\ntodo corpo' },
      { label: 'dois-pontos', value: 'No refrão ninguém se esconde:' },
      { label: 'quebra final', value: 'esconde:\ncada voz' },
    ],
  },
  {
    id: 'unicode-brasileiro',
    title: 'Unicode brasileiro',
    html: [
      '<h2>Unicode brasileiro</h2>',
      '<p>café e café parecem iguais, mas usam sequências diferentes.</p>',
      '<p>João escreveu “ação”, “pão” e “órgão” antes do almoço.</p>',
      '<p>A programadora 👩🏽‍💻 enviou um alô do Brasil 🇧🇷 e marcou a ideia com 🌿.</p>',
      '<p>O sinal de reticências… não é o mesmo que três pontos...</p>',
    ].join(''),
    targets: [
      { label: 'acento precomposto', value: 'café' },
      { label: 'acento combinante', value: 'café' },
      { label: 'til e cedilha', value: 'João escreveu “ação”, “pão” e “órgão”' },
      { label: 'emoji com tom e zwj', value: '👩🏽‍💻' },
      { label: 'bandeira brasileira', value: '🇧🇷' },
      { label: 'emoji simples', value: '🌿' },
      { label: 'reticências unicode', value: 'reticências…' },
      { label: 'três pontos ascii', value: 'pontos...' },
    ],
  },
]
