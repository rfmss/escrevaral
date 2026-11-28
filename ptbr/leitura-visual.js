/* Leitura anotada. Apenas apresentação de findings; não executa motores nem edita texto. ES5. */
(function (root) {
  'use strict';
  var E = root.Escr, D = root.document, serial = 0;
  if (!E) { return; }
  function el(tag, parent, cls, text) {
    var n = D.createElement(tag); n.className = cls || '';
    if (typeof text === 'string') { n.textContent = text; }
    if (parent) { parent.appendChild(n); } return n;
  }
  function svgEl(tag, parent, attrs, text) {
    var n = D.createElementNS ? D.createElementNS('http://www.w3.org/2000/svg', tag) : D.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, String(attrs[k])); });
    }
    if (typeof text === 'string') { n.textContent = text; }
    if (parent) { parent.appendChild(n); }
    return n;
  }
  /* Formata rótulo direcional coerente com a geometria esquerda/direita da seta */
  function formatDirectionalLabel(raw, x1, x2) {
    var txt = String(raw || '').replace(/^\s+|\s+$/g, '');
    if (!txt) { return ''; }
    var parts = txt.split(/\s*\u2194\s*/);
    if (parts.length === 2) {
      txt = x2 >= x1 ? (parts[0] + ' \u2192 ' + parts[1]) : (parts[1] + ' \u2190 ' + parts[0]);
    }
    return txt.length > 30 ? (txt.slice(0, 29) + '\u2026') : txt;
  }
  /* Desenha conector arquitetônico com saída e chegada verticais (90°), ombros arredondados,
   * pino duplo de origem, ponta de seta afiada e cartela centralizada sobre o trilho horizontal.
   * Mantém estritamente 1 <path> por vínculo para preservar o contrato dos testes. */
  function drawArchitecturalArc(svg, opts) {
    var x1 = opts.x1, x2 = opts.x2, yAnchor = opts.yAnchor, yTop = opts.yTop;
    var rowW = opts.rowWidth || 800;
    var dir = x2 >= x1 ? 1 : -1;
    var span = Math.abs(x2 - x1);
    var rise = Math.max(16, yAnchor - yTop);
    var r = Math.min(13, span / 2.4, Math.max(5, (rise - 8) * 0.45));
    var d;
    if (span < 8) {
      d = 'M ' + x1.toFixed(1) + ' ' + (yAnchor - 3).toFixed(1) + ' L ' + x2.toFixed(1) + ' ' + (yAnchor - 6.2).toFixed(1);
    } else {
      d = 'M ' + x1.toFixed(1) + ' ' + (yAnchor - 3).toFixed(1) +
        ' L ' + x1.toFixed(1) + ' ' + (yTop + r).toFixed(1) +
        ' Q ' + x1.toFixed(1) + ' ' + yTop.toFixed(1) + ' ' + (x1 + dir * r).toFixed(1) + ' ' + yTop.toFixed(1) +
        ' L ' + (x2 - dir * r).toFixed(1) + ' ' + yTop.toFixed(1) +
        ' Q ' + x2.toFixed(1) + ' ' + yTop.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + (yTop + r).toFixed(1) +
        ' L ' + x2.toFixed(1) + ' ' + (yAnchor - 6.2).toFixed(1);
    }
    var pathAttrs = {
      d: d,
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': opts.dashed ? '1.5' : '1.75',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    };
    if (opts.dashed) { pathAttrs['stroke-dasharray'] = '4 3'; }
    svgEl('path', svg, pathAttrs);

    /* Pino de origem em anel duplo encostado na borda superior do bloco de partida */
    svgEl('circle', svg, { cx: x1.toFixed(1), cy: (yAnchor - 2.5).toFixed(1), r: '3.6', 'class': 'ptbr-arc-origin' });
    svgEl('circle', svg, { cx: x1.toFixed(1), cy: (yAnchor - 2.5).toFixed(1), r: '1.4', fill: 'currentColor' });

    /* Ponta de seta editorial afiada (dardo côncavo 100% alinhado à haste vertical) */
    var tipY = yAnchor;
    var wingY = yAnchor - 8.8;
    var notchY = yAnchor - 6.0;
    svgEl('polygon', svg, {
      points: x2.toFixed(1) + ',' + tipY.toFixed(1) + ' ' +
        (x2 - 4.5).toFixed(1) + ',' + wingY.toFixed(1) + ' ' +
        x2.toFixed(1) + ',' + notchY.toFixed(1) + ' ' +
        (x2 + 4.5).toFixed(1) + ',' + wingY.toFixed(1),
      'class': 'ptbr-arc-head',
      fill: 'currentColor'
    });

    /* Cartela de rótulo centralizada exatamente no eixo horizontal do trilho */
    if (opts.label) {
      var lblText = formatDirectionalLabel(opts.label, x1, x2);
      var pillW = Math.min(Math.max(48, rowW - 8), Math.max(60, lblText.length * 6.5 + 22));
      var pillX = Math.max(4, Math.min(rowW - pillW - 4, (x1 + x2) / 2 - pillW / 2));
      var pillY = Math.max(2, yTop - 10);
      svgEl('rect', svg, {
        x: pillX.toFixed(1), y: pillY.toFixed(1), width: pillW.toFixed(1), height: '20', rx: '10',
        'class': 'ptbr-arc-pill'
      });
      svgEl('text', svg, {
        x: (pillX + pillW / 2).toFixed(1), y: (pillY + 13.8).toFixed(1), 'text-anchor': 'middle',
        'class': 'ptbr-arc-label'
      }, lblText);
    }
  }
  function valid(s, f) { return f && typeof f.start === 'number' && typeof f.end === 'number' && f.start >= 0 && f.end > f.start && f.end <= s.length && s.slice(f.start, f.end) === f.snippet; }
  var FEATURE_LABELS = {
    adverbios: 'Advérbio em -mente', ortografia: 'Grafia', acentuacao: 'Acentuação',
    pontuacao: 'Pontuação', crase: 'Crase', concordancia: 'Concordância',
    expressoes: 'Expressão', repeticao: 'Repetição', dialogo: 'Diálogo',
    ritmo: 'Ritmo', rima: 'Rima', metrica: 'Métrica', decolonial: 'Contexto cultural'
  };
  function cleanClassName(raw) {
    if (!raw) { return ''; }
    return String(raw).replace(/\s*\(UD\)/gi, '').replace(/^\s+|\s+$/g, '');
  }
  function label(f) {
    var c = f.candidates && f.candidates.classes || [];
    if (f.analysisStatus === 'contextual') { return cleanClassName(f.feature); }
    if (f.analysisStatus === 'desconhecido') { return 'fora do acervo'; }
    if (f.analysisStatus === 'ambiguo') { return 'ver contexto'; }
    if (f.analysisStatus === 'lexical') { return cleanClassName(c[0] || 'classe'); }
    if (f.feature && Object.prototype.hasOwnProperty.call(FEATURE_LABELS, f.feature)) { return FEATURE_LABELS[f.feature]; }
    return f.feature || 'observação';
  }
  function normalizeClassKey(cls) {
    if (!cls) { return 'incerta'; }
    return String(cls).replace(/\s*\(UD\)/gi, '').toLowerCase().replace(/^\s+|\s+$/g, '').replace(/[áàâã]/g, 'a').replace(/[éê]/g, 'e').replace(/[í]/g, 'i').replace(/[óôõ]/g, 'o').replace(/[ú]/g, 'u').replace(/ç/g, 'c');
  }
  function classDisplayName(key) {
    var names = {
      substantivo: 'Substantivo', verbo: 'Verbo', adjetivo: 'Adjetivo', adverbio: 'Advérbio',
      artigo: 'Artigo', pronome: 'Pronome', preposicao: 'Preposição', conjuncao: 'Conjunção',
      numeral: 'Numeral', interjeicao: 'Interjeição', determinante: 'Determinante', 'locucao verbal': 'Locução verbal',
      incerta: 'Depende do contexto'
    };
    return names[key] || (key.charAt(0).toUpperCase() + key.slice(1));
  }
  function syntaxRoleKey(feature) {
    var s = String(feature || '').toLowerCase();
    if (s.indexOf('sujeito') !== -1) { return 'sujeito'; }
    if (s.indexOf('verbo') !== -1 || s.indexOf('verbal') !== -1 || s.indexOf('locução') !== -1) { return 'verbo'; }
    if (s.indexOf('indireto') !== -1) { return 'indireto'; }
    if (s.indexOf('agente') !== -1) { return 'agente'; }
    if (s.indexOf('aposto') !== -1) { return 'aposto'; }
    if (s.indexOf('vocativo') !== -1) { return 'vocativo'; }
    if (s.indexOf('objeto') !== -1 || s.indexOf('complemento') !== -1 || s.indexOf('predicativo') !== -1) { return 'objeto'; }
    if (s.indexOf('conjunç') !== -1) { return 'conjuncao'; }
    if (s.indexOf('adjunto') !== -1 || s.indexOf('advérb') !== -1 || s.indexOf('negaç') !== -1) { return 'adjunto'; }
    if (s.indexOf('predicado') !== -1) { return 'predicado'; }
    return 'outro';
  }

  /* Exemplos educativos sobre direitos humanos, minorias, combate ao preconceito e geopolítica cooperativa.
   * Preenchidos automaticamente quando não há ocorrências no trecho; nunca alteram o manuscrito do autor. */
  var LENS_EXAMPLES = {
    relativas: [
      { theme: 'Direitos humanos', text: 'A mulher que trabalha escreveu a carta.', note: 'Observe “que” retomando “mulher” como sujeito da oração encaixada.' },
      { theme: 'Minorias e memória', text: 'A cidade onde a menina viveu cresceu.', note: 'Observe “onde” retomando o lugar “cidade” dentro do período.' },
      { theme: 'Geopolítica e cooperação', text: 'O livro que a escritora leu chegou.', note: 'Observe “que” retomando “livro” como objeto direto do verbo “leu”.' }
    ],
    sintaxe: [
      { theme: 'Direitos humanos', text: 'Na janela, a escritora contou a história às meninas.', note: 'Adjunto adverbial deslocado no início e verbo bitransitivo com dois objetos.' },
      { theme: 'Geopolítica e memória', text: 'A carta foi escrita pela escritora na cidade.', note: 'Voz passiva analítica com sujeito paciente e agente da passiva explícito.' },
      { theme: 'Cooperação e paz', text: 'Ao abrir a porta, encontramos a paz.', note: 'Oração reduzida de infinitivo (“ao abrir”) seguida de sujeito oculto (“nós”).' }
    ],
    morfologia: [
      { theme: 'Direitos humanos', text: 'Toda pessoa merece escola, abrigo e voz livre.', note: 'Veja como cada palavra assume sua classe gramatical na frase.' },
      { theme: 'Geopolítica e paz', text: 'A fronteira fecha o passo, mas o diálogo abre pontes entre povos.', note: 'Observe a alternância entre nomes, verbos e conjunção adversativa.' },
      { theme: 'Combate ao preconceito', text: 'A escuta devolve respeito a cada rosto.', note: 'Veja como artigo, substantivo, verbo e preposição se organizam.' }
    ],
    ritmo: [
      { theme: 'Direitos humanos', text: 'A cidade calou. O bairro resistiu. A escola abriu as portas. A leitura devolveu futuro a quem sempre esperou na margem e transformou o silêncio antigo das ruas em conversa coletiva, memória compartilhada e coragem para imaginar outra vida possível juntos.', note: 'Contraste entre três frases curtas de impacto e uma frase extensa de fôlego.' },
      { theme: 'Geopolítica e paz', text: 'O muro divide duas casas. O rio atravessa dois países. O vento cruza toda fronteira.', note: 'Três frases seguidas com extensão muito parecida criam cadência regular.' },
      { theme: 'Combate ao preconceito', text: 'O olhar julga rápido. A escuta pede tempo. A justiça nasce devagar, quando cada pessoa ocupa seu lugar inteiro na conversa.', note: 'Variação gradual da medida das frases acompanha a abertura do raciocínio.' }
    ],
    repeticao: [
      { theme: 'Direitos humanos', text: 'A dignidade de um povo nasce quando a dignidade das crianças guia o cuidado e protege a dignidade de toda família.', note: 'Repetição próxima de “dignidade” pode ser ênfase intencional ou ponto de revisão.' },
      { theme: 'Geopolítica e paz', text: 'Nenhuma fronteira apaga a memória de quem atravessa a fronteira em busca de paz além da fronteira.', note: 'O eco de “fronteira” no mesmo período aparece grifado para audição em voz alta.' },
      { theme: 'Cooperação', text: 'O povo que povo escuta constrói justiça sem apagar ninguém.', note: 'Retorno imediato em torno de “que” destacado dentro do contexto.' }
    ],
    dialogo: [
      { theme: 'Direitos humanos', text: '— Aqui ninguém fica de fora da escola, disse a professora.\n— Toda criança tem direito ao livro, respondeu o avô.\nA turma abriu os cadernos em silêncio.', note: 'Proporção entre linhas iniciadas por travessão (—) e o restante da cena.' },
      { theme: 'Minorias e memória', text: '– Nossa língua guarda o nome dos rios, explicou a anciã.\n– Vamos escrever cada palavra antes que se perca, prometeu a jovem.', note: 'Reconhecimento de falas marcadas com meia-risca (–).' },
      { theme: 'Geopolítica e cooperação', text: '— A água deste vale pertence aos dois lados do mapa.\n— Então vamos cuidar da nascente juntos, propôs o mediador.', note: 'Desenho gráfico do diálogo em cenas de mediação e escuta.' }
    ],
    adverbios: [
      { theme: 'Direitos humanos', text: 'As comunidades lutaram firmemente e conquistaram lentamente o direito à moradia digna.', note: 'Duas formas em -mente no mesmo parágrafo destacam a cadência para revisão.' },
      { theme: 'Combate ao preconceito', text: 'Ela respondeu serenamente e explicou atentamente o seu ponto de vista na assembleia.', note: 'Observe o peso de cada advérbio no tom e no ritmo da cena.' },
      { theme: 'Geopolítica e paz', text: 'Os vizinhos trabalharam pacientemente e reconstruíram coletivamente a ponte.', note: 'Concentração de advérbios em -mente sinalizada sem impor cortes.' }
    ],
    rima: [
      { theme: 'Direitos humanos', text: 'Cada mão ergue uma ponte sobre o chão\nPara caber toda gente no mesmo pão', note: 'Rima consoante exata entre finais de verso (“chão” ↔ “pão”).' },
      { theme: 'Minorias e memória', text: 'O vento guarda a fala antiga na casa\nE acende a memória viva na estrada', note: 'Rima toante (assonante) pelas vogais a partir da tônica (“casa” ↔ “estrada”).' },
      { theme: 'Geopolítica e paz', text: 'Não há muro que detenha a maré\nNem fronteira que cale quem anda a pé', note: 'Aproximação sonora em versos curtos de ritmo firme.' }
    ],
    metrica: [
      { theme: 'Direitos humanos', text: 'A terra é casa de quem nela mora\nE o pão partido vence toda dor', note: 'Escansão silábica com tônica destacada e medida clássica de dez sílabas.' },
      { theme: 'Minorias e memória', text: 'Na voz antiga do povo\nNasce o canto de amanhã', note: 'Versos de sete sílabas (redondilha maior) muito comuns na lírica brasileira.' },
      { theme: 'Geopolítica e paz', text: 'Sem muros no horizonte\nA paz atravessa o mar', note: 'Observe elisões vocálicas possíveis e a tônica final de cada verso.' }
    ],
    crase: [
      { theme: 'Direitos humanos', text: 'O projeto começou à falar de justiça com toda a comunidade.', note: 'Antes de verbo no infinitivo (“falar”), a referência convencional não leva crase.' },
      { theme: 'Combate ao preconceito', text: 'A assembleia deu voz à ela no debate do bairro.', note: 'Antes de pronome pessoal (“ela”), vale conferir o acento grave.' },
      { theme: 'Geopolítica e paz', text: 'O tratado abriu caminhos à tempo para evitar o conflito.', note: 'Antes de substantivo masculino (“tempo”), a forma de referência é “a tempo”.' }
    ],
    concordancia: [
      { theme: 'Direitos humanos', text: 'Haviam muitos livros na biblioteca.', note: '“Haver” no sentido de existir costuma ficar no singular (“Havia”).' },
      { theme: 'Minorias e memória', text: 'Existe muitas cartas na mesa.', note: '“Existir” concorda com o sujeito plural (“Existem muitas cartas”).' },
      { theme: 'Geopolítica e paz', text: 'Fazem dois anos que o acordo começou.', note: '“Fazer” indicando tempo decorrido costuma permanecer no singular (“Faz”).' }
    ],
    ortografia: [
      { theme: 'Combate ao preconceito', text: 'Educação de qualidade é direito de todos, não previlégio de poucos.', note: 'Grafia de referência no acervo: “privilégio”.' },
      { theme: 'Direitos humanos', text: 'A proteção à infância deve valer para todos, sem excessão.', note: 'Grafia de referência no acervo: “exceção”.' },
      { theme: 'Justiça social', text: 'A distância não pode ser impecilho para frequentar a escola.', note: 'Grafia de referência no acervo: “empecilho”.' }
    ],
    acentuacao: [
      { theme: 'Direitos humanos', text: 'Em uma sociedade justa, ninguem fica para trás por sua origem.', note: 'Conferência de acento agudo em “ninguém”.' },
      { theme: 'Minorias e memória', text: 'A cultura de cada povo tambem pertence à memória de todos.', note: 'Conferência de acento agudo em “também”.' },
      { theme: 'Geopolítica e paz', text: 'A paz se constrói atraves da escuta e da cooperação entre nações.', note: 'Conferência de acento agudo em “através”.' }
    ],
    pontuacao: [
      { theme: 'Direitos humanos', text: 'Saúde,, moradia e educação formam a base da cidadania.', note: 'Sinaliza vírgula duplicada acidentalmente durante a revisão.' },
      { theme: 'Combate ao preconceito', text: 'Ouvir antes de julgar;; reconhecer a humanidade em cada pessoa.', note: 'Sinaliza ponto e vírgula duplicado.' },
      { theme: 'Geopolítica e cooperação', text: 'Quando países cooperam na ciência,, toda a humanidade avança.', note: 'Identifica sinais repetidos sem alterar a frase automaticamente.' }
    ],
    expressoes: [
      { theme: 'Direitos humanos', text: 'Nos dias de hoje, garantir acesso à água potável continua sendo urgente.', note: 'Destaca fórmula pronta (“nos dias de hoje”) para avaliar se vale tornar mais precisa.' },
      { theme: 'Geopolítica e paz', text: 'Por outro lado, a diplomacia cooperativa evita custos humanos irreparáveis.', note: 'Localiza conector recorrente (“por outro lado”) para equilibrar o estilo.' },
      { theme: 'Minorias e memória', text: 'Ao longo do tempo, os povos indígenas preservaram florestas inteiras.', note: 'Mostra expressão temporal usual para decidir entre manter ou condensar.' }
    ],
    decolonial: [
      { theme: 'Combate ao preconceito', text: 'O antigo catálogo classificava as esculturas africanas como arte primitiva.', note: 'Convida a refletir sobre o peso histórico da expressão “arte primitiva”.' },
      { theme: 'Inclusão e direitos', text: 'Na revisão do texto oficial, trocamos portador de deficiência por pessoa com deficiência.', note: 'Destaca termos ligados à deficiência para checar o alinhamento com a linguagem atual.' },
      { theme: 'Geopolítica e memória', text: 'Mapas antigos chamavam de terra de ninguém territórios habitados há séculos.', note: 'Convida a situar historicamente a expressão “terra de ninguém” no contexto narrativo.' }
    ]
  };
  /* Guias rápidos em linguagem direta e contemporânea (recolhidos por padrão: quem já sabe nem abre; quem quer aprender descobre em 3 segundos). */
  var LENS_GUIDES = {
    morfologia: { title: 'O que são classes de palavras?', summary: 'Cada palavra cumpre um papel na cena: substantivo dá nome às coisas e pessoas; verbo coloca a cena em movimento; adjetivo pinta características; advérbio ajusta o jeito, o tempo ou a intensidade da ação.' },
    sintaxe: { title: 'O que é análise sintática?', summary: 'É o mapa de quem faz o quê na frase: o sujeito conduz a ação, o verbo é o motor, os objetos completam o sentido e os adjuntos situam lugar, tempo ou modo. Também mostra quando duas frases se ligam por coordenação (ideias independentes) ou por subordinação (uma ideia que depende da principal para fechar o sentido).' },
    relativas: { title: 'O que são orações relativas (subordinadas)?', summary: 'São trechos encaixados dentro de uma frase — quase sempre começando com “que” ou “onde” — para especificar melhor de quem ou de que lugar você está falando, sem precisar abrir outro ponto final.' },
    adverbios: { title: 'O que é um advérbio?', summary: 'É a palavra que dá o tom da ação: mostra como, quando, onde ou com que força algo acontece (como “calmamente”, “ontem”, “muito”). Os terminados em -mente são expressivos, mas vários seguidos no mesmo parágrafo podem pesar no ritmo.' },
    ritmo: { title: 'O que é ritmo na escrita?', summary: 'É a respiração do texto ao ser lido em voz alta. Alternar frases curtas (impacto, urgência) e frases longas (mergulho, reflexão) cria movimento; frases sempre do mesmo tamanho produzem batida regular.' },
    repeticao: { title: 'Por que observar repetições?', summary: 'Quando a mesma palavra reaparece perto demais, chama a atenção do ouvido. Às vezes é um efeito intencional de força; em outros momentos, um sinônimo ou um corte deixa a passagem mais limpa.' },
    dialogo: { title: 'O que mostra a lente de diálogo?', summary: 'Mede quanto do trecho está em falas marcadas (travessão, meia-risca ou hífen) em comparação com o restante da cena — ajuda a sentir se a narrativa está mais falada ou mais descritiva.' },
    rima: { title: 'O que é rima consoante e toante?', summary: 'Rima é o eco sonoro no final dos versos. Na consoante, tudo coincide a partir da vogal forte (“chão” / “pão”); na toante, só as vogais combinam (“casa” / “estrada”), recurso muito vivo na poesia e na música brasileira.' },
    metrica: { title: 'O que é métrica de versos?', summary: 'É a contagem das sílabas cantadas de cada verso até a última sílaba forte. Serve para ouvir a batida do poema e testar medidas tradicionais, como a redondilha (7 sílabas) ou o decassílabo (10).' },
    crase: { title: 'O que é crase?', summary: 'É a fusão de dois “as” (a preposição “a” + o artigo feminino “a”). Em geral não ocorre antes de verbo, pronome pessoal ou palavra masculina — por isso vale conferir cada ocorrência destacada.' },
    concordancia: { title: 'O que é concordância verbal?', summary: 'É o ajuste entre o verbo e quem conduz a frase. Alguns verbos têm comportamento próprio: “haver” com sentido de existir e “fazer” marcando tempo passado ficam no singular (“havia livros”, “faz dois anos”).' },
    ortografia: { title: 'O que confere a ortografia?', summary: 'Sinaliza deslizes comuns de grafia na pressa do rascunho (como “exceção”, “privilégio” e “empecilho”), deixando sempre a palavra final com você.' },
    acentuacao: { title: 'O que confere a acentuação?', summary: 'Aponta palavras frequentes em que um acento faz falta para a leitura ou para a norma (como “ninguém”, “também” e “através”).' },
    pontuacao: { title: 'O que observa a pontuação?', summary: 'Captura sinais repetidos sem querer durante cortes e revisões (como vírgulas ou pontos e vírgulas duplicados).' },
    expressoes: { title: 'O que são expressões cristalizadas?', summary: 'São fórmulas prontas muito comuns no dia a dia (“nos dias de hoje”, “por outro lado”). Destacá-las ajuda a decidir se funcionam bem ali ou se vale buscar uma formulação mais pessoal.' },
    decolonial: { title: 'Por que observar o vocabulário decolonial?', summary: 'Algumas expressões carregam marcas históricas de exclusão que passam despercebidas no automático. A lente apenas ilumina esses trechos para que você escolha com consciência.' }
  };

  var TERM_GLOSSARY = {
    substantivo: 'Substantivo: dá nome a pessoas, lugares, objetos, sentimentos ou ideias.',
    verbo: 'Verbo: move a cena — indica ação, estado ou acontecimento no tempo.',
    'locucao verbal': 'Locução verbal: dois verbos trabalhando juntos como uma única ação.',
    adjetivo: 'Adjetivo: dá cor, qualidade ou contorno a um nome.',
    adverbio: 'Advérbio: ajusta o tom da ação — diz como, quando, onde ou com que força ela acontece.',
    artigo: 'Artigo: apresenta o nome, mostrando se falamos de algo específico (“o/a”) ou aberto (“um/uma”).',
    determinante: 'Determinante: acompanha e situa o nome (como “este”, “meu”, “cada”, “toda”).',
    pronome: 'Pronome: substitui ou acompanha um nome para evitar repetições e costurar a frase.',
    preposicao: 'Preposição: conecta palavras indicando lugar, direção, posse, causa ou companhia.',
    conjuncao: 'Conjunção: amarra ideias e orações, marcando soma, contraste, tempo, causa ou condição.',
    numeral: 'Numeral: indica quantidade, ordem ou proporção.',
    interjeicao: 'Interjeição: expressa saudação, surpresa ou emoção de forma direta.',
    sujeito: 'Sujeito: sobre quem ou o que a frase declara a ação ou o estado.',
    objeto: 'Objeto direto: completa o sentido do verbo de forma direta, sem preposição obrigatória.',
    indireto: 'Objeto indireto: completa o verbo ligado por uma preposição (“a”, “de”, “em”, “com”) ou por pronome oblíquo (“lhe”, “me”).',
    predicativo: 'Predicativo: característica atribuída ao sujeito por meio de um verbo de ligação.',
    adjunto: 'Adjunto adverbial: situa a cena no tempo, no espaço ou no modo, sem ser complemento obrigatório do verbo.',
    agente: 'Agente da passiva: mostra quem pratica a ação quando a frase está na voz passiva.',
    aposto: 'Aposto: trecho entre vírgulas que explica ou detalha quem é o termo anterior.',
    vocativo: 'Vocativo: chamamento direto a alguém na frase, isolado por vírgula.',
    predicado: 'Predicado: tudo o que a frase declara a respeito do sujeito, organizado em torno do verbo.',
    subordinada: 'Oração subordinada: ideia que depende da oração principal para completar o sentido (tempo, causa, condição, conteúdo ou especificação).',
    coordenada: 'Oração coordenada: ideia com estrutura própria ligada a outra por soma, contraste, escolha ou conclusão.',
    reduzida: 'Oração reduzida: oração subordinada enxuta, sem conjunção, puxada por gerúndio (“abrindo…”) ou “ao + infinitivo” (“ao abrir…”).'
  };

  E.lensExamples = LENS_EXAMPLES;
  E.lensGuides = LENS_GUIDES;
  E.termGlossary = TERM_GLOSSARY;
  if (!D) { return; }

  function renderLensGuide(parent, lens) {
    var g = LENS_GUIDES[lens];
    if (!g) { return; }
    var wrap = el('div', parent, 'ptbr-guide-wrap');
    var btn = el('button', wrap, 'ptbr-guide-toggle', g.title);
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('data-guide-lens', lens);
    var card = el('p', wrap, 'ptbr-guide-card', g.summary);
    card.hidden = true;
    btn.addEventListener('click', function () {
      var open = card.hidden;
      card.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }, false);
  }

  function glossForSyntaxFinding(f) {
    if (!f) { return ''; }
    if (f.reducedKind) { return TERM_GLOSSARY.reduzida; }
    if (f.subordKind) { return TERM_GLOSSARY.subordinada; }
    if (f.coordKind) { return TERM_GLOSSARY.coordenada; }
    var rk = syntaxRoleKey(f.feature);
    return TERM_GLOSSARY[rk] || '';
  }

  function glossForMorphFinding(f) {
    if (!f || f.analysisStatus === 'ambiguo' || f.analysisStatus === 'desconhecido') { return ''; }
    var raw = f.analysisStatus === 'contextual' ? f.feature : (f.candidates && f.candidates.classes && f.candidates.classes[0]);
    var key = normalizeClassKey(raw);
    return TERM_GLOSSARY[key] || '';
  }

  function renderExampleBanner(parent, options) {
    if (!options || !options.exampleMode) { return; }
    var bar = el('div', parent, 'ptbr-example-banner');
    var info = el('span', bar, 'ptbr-example-banner-text',
      'Exemplo demonstrativo — seu manuscrito permanece intacto');
    if (typeof options.onExitExample === 'function') {
      var back = el('button', bar, 'ptbr-example-exit', '← Voltar ao meu texto');
      back.type = 'button';
      back.addEventListener('click', function () { options.onExitExample(); }, false);
    }
    return info;
  }

  function renderExamplesGallery(main, asideSelected, asideDetails, lens, options) {
    var list = LENS_EXAMPLES[lens] || [];
    if (asideSelected) { asideSelected.textContent = 'Espaço de exemplos'; }
    if (asideDetails) {
      asideDetails.textContent = '';
      el('p', asideDetails, 'ptbr-reading-summary',
        'Sem ocorrências neste trecho do seu texto. Clique em qualquer exemplo ao lado para ver esta lente funcionando na prática — seu manuscrito não será alterado.');
    }
    if (!list.length) { return; }
    var wrap = el('section', main, 'ptbr-examples-box');
    wrap.setAttribute('aria-label', 'Exemplos para observar nesta lente');
    el('p', wrap, 'ptbr-overline', 'EXEMPLOS PARA OBSERVAR NESTA LENTE');
    el('p', wrap, 'ptbr-examples-sub', 'Veja como esta análise funciona na prática — clique em qualquer exemplo sem alterar o seu texto:');
    var grid = el('div', wrap, 'ptbr-examples-grid');
    list.forEach(function (ex, idx) {
      var card = el('article', grid, 'ptbr-example-card');
      el('p', card, 'ptbr-example-text', ex.text);
      el('p', card, 'ptbr-example-note', ex.note);
      if (options && typeof options.onTryExample === 'function') {
        var btn = el('button', card, 'ptbr-example-btn', 'Simular análise →');
        btn.type = 'button';
        btn.setAttribute('data-example-lens', lens);
        btn.setAttribute('data-example-index', String(idx));
        btn.addEventListener('click', function () { options.onTryExample(ex); }, false);
      }
    });
  }

  /* Cartão inline compacto (padrão fechado -> aberto dos Anexos 2 e 3):
   * abre ancorado logo abaixo da marcação clicada, na mesma tonalidade creme, sem empurrar linhas. */
  function createInlinePeek(box, aside) {
    var pop = el('div', box, 'ptbr-inline-peek');
    pop.setAttribute('role', 'region');
    pop.setAttribute('aria-label', 'Resumo rápido da observação');
    pop.hidden = true;
    var activeAnchor = null;

    function hide() {
      pop.hidden = true;
      pop.textContent = '';
      if (activeAnchor) {
        activeAnchor.setAttribute('data-peek-open', 'false');
        activeAnchor = null;
      }
    }

    function positionAt(anchor) {
      if (!pop.style || !anchor || !anchor.getBoundingClientRect || !box.getBoundingClientRect) { return; }
      var br = box.getBoundingClientRect();
      var ar = anchor.getBoundingClientRect();
      if (!br || !br.width) { return; }
      var popW = Math.min(340, Math.max(220, br.width - 16));
      pop.style.width = popW + 'px';
      var relTop = (typeof ar.bottom === 'number' && typeof br.top === 'number') ? (ar.bottom - br.top + 6) : 36;
      var relLeft = (typeof ar.left === 'number' && typeof br.left === 'number') ? (ar.left - br.left) : 0;
      relLeft = Math.max(4, Math.min(Math.max(4, br.width - popW - 4), relLeft));
      pop.style.top = Math.round(Math.max(4, relTop)) + 'px';
      pop.style.left = Math.round(relLeft) + 'px';
    }

    function show(anchor, info) {
      if (!anchor || !info) { hide(); return; }
      if (activeAnchor && activeAnchor !== anchor) {
        activeAnchor.setAttribute('data-peek-open', 'false');
      }
      activeAnchor = anchor;
      anchor.setAttribute('data-peek-open', 'true');
      pop.textContent = '';

      var iconEl = el('span', pop, 'ptbr-inline-peek-ico', info.badge || '◆');
      iconEl.setAttribute('aria-hidden', 'true');

      var body = el('div', pop, 'ptbr-inline-peek-body');
      el('strong', body, 'ptbr-inline-peek-title', info.title || 'Observação');
      el('p', body, 'ptbr-inline-peek-summary', info.summary || 'Veja os detalhes desta marcação.');
      if (info.usoId && typeof E.openUsosLingua === 'function') {
        var usoBtn = el('button', body, 'ptbr-inline-peek-uso', 'Usos da língua: ' + (info.usoTitle || 'entender este uso') + ' \u2192');
        usoBtn.type = 'button';
        usoBtn.style.marginTop = '6px';
        usoBtn.style.padding = '3px 8px';
        usoBtn.style.border = '1px solid rgba(40, 48, 38, 0.25)';
        usoBtn.style.borderRadius = '4px';
        usoBtn.style.background = 'transparent';
        usoBtn.style.font = '600 11px/1.3 Inter, Arial, sans-serif';
        usoBtn.style.cursor = 'pointer';
        usoBtn.addEventListener('click', function (ev) {
          if (ev && ev.stopPropagation) { ev.stopPropagation(); }
          hide();
          E.openUsosLingua(info.usoId);
        }, false);
      }

      var actions = el('div', pop, 'ptbr-inline-peek-actions');
      var goBtn = el('button', actions, 'ptbr-inline-peek-go', '›');
      goBtn.type = 'button';
      goBtn.setAttribute('aria-label', 'Abrir explicação completa');
      goBtn.title = 'Abrir explicação completa';
      goBtn.addEventListener('click', function (ev) {
        if (ev && ev.stopPropagation) { ev.stopPropagation(); }
        hide();
        if (aside && aside.scrollIntoView) {
          aside.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, false);

      var closeBtn = el('button', actions, 'ptbr-inline-peek-close', '×');
      closeBtn.type = 'button';
      closeBtn.setAttribute('aria-label', 'Fechar resumo');
      closeBtn.addEventListener('click', function (ev) {
        if (ev && ev.stopPropagation) { ev.stopPropagation(); }
        hide();
      }, false);

      pop.hidden = false;
      positionAt(anchor);
    }

    function onDocKey(ev) {
      if (ev && ev.keyCode === 27 && !pop.hidden) { hide(); }
    }
    function onDocDown(ev) {
      if (pop.hidden || !ev || !ev.target) { return; }
      if (pop.contains && pop.contains(ev.target)) { return; }
      if (activeAnchor && activeAnchor.contains && activeAnchor.contains(ev.target)) { return; }
      hide();
    }
    if (D && D.addEventListener) {
      D.addEventListener('keydown', onDocKey, false);
      D.addEventListener('mousedown', onDocDown, false);
    }
    return {
      show: show,
      hide: hide,
      destroy: function () {
        hide();
        if (D && D.removeEventListener) {
          D.removeEventListener('keydown', onDocKey, false);
          D.removeEventListener('mousedown', onDocDown, false);
        }
      }
    };
  }

  function summaryForFinding(f, fallback) {
    if (!f) { return fallback || ''; }
    var text = '';
    if (f.message) { text = String(f.message); }
    else if (f.evidence && f.evidence.observation) { text = String(f.evidence.observation); }
    else if (fallback) { text = String(fallback); }
    if (f.reference && text.indexOf(f.reference) === -1) {
      text += (text ? ' · ' : '') + 'Ref.: “' + f.reference + '”';
    }
    if (text.length > 140) { text = text.slice(0, 139) + '…'; }
    return text || 'Clique na seta para ver os detalhes completos.';
  }

  /* 1. Análise sintática frase a frase, em ordem natural, com setas SVG rotuladas (estilo displaCy editorial) */
  function syntaxMap(parent, options) {
    var snapshot = options.snapshot;
    var arr = options.findings.filter(function (f) { return valid(snapshot, f) && valid(snapshot, f.clause); });
    var uid = 'ptbr-reading-' + (++serial), dead = false, timer = null, active = null, buttons = {}, groups = {}, order = [];
    var stepMode = false, stepIndex = 0;

    var box = el('div', parent, 'ptbr-reading'), main = el('div', box, 'ptbr-reading-paper');
    renderExampleBanner(main, options);
    el('p', main, 'ptbr-overline', 'RELAÇÕES DA ORAÇÃO · FRASE POR FRASE');
    el('p', main, 'ptbr-reading-help', 'Os termos aparecem na ordem exata da sua frase. Clique em qualquer bloco colorido para ver as setas de relação e a explicação.');
    renderLensGuide(main, 'sintaxe');

    arr.forEach(function (f) {
      var key = '$' + f.clause.start;
      if (!groups[key]) { groups[key] = { items: [], clause: f.clause }; order.push(key); }
      groups[key].items.push(f);
    });
    order.sort(function (a, b) { return groups[a].clause.start - groups[b].clause.start; });

    /* Navegação frase-a-frase quando houver 2+ construções */
    var navCounter = null, btnPrev = null, btnNext = null, btnAll = null, btnOne = null;
    if (order.length > 1) {
      var nav = el('div', main, 'ptbr-syntax-nav');
      btnAll = el('button', nav, 'ptbr-nav-pill', 'Todas (' + order.length + ')');
      btnAll.type = 'button'; btnAll.setAttribute('aria-pressed', 'true');
      btnOne = el('button', nav, 'ptbr-nav-pill', 'Uma frase por vez');
      btnOne.type = 'button'; btnOne.setAttribute('aria-pressed', 'false');
      btnPrev = el('button', nav, 'ptbr-nav-pill', '← Anterior');
      btnPrev.type = 'button'; btnPrev.hidden = true;
      navCounter = el('span', nav, 'ptbr-nav-counter', '');
      navCounter.hidden = true;
      btnNext = el('button', nav, 'ptbr-nav-pill', 'Próxima →');
      btnNext.type = 'button'; btnNext.hidden = true;

      btnAll.addEventListener('click', function () { setStepMode(false, stepIndex); }, false);
      btnOne.addEventListener('click', function () { setStepMode(true, stepIndex); }, false);
      btnPrev.addEventListener('click', function () { if (stepIndex > 0) { setStepMode(true, stepIndex - 1); } }, false);
      btnNext.addEventListener('click', function () { if (stepIndex < order.length - 1) { setStepMode(true, stepIndex + 1); } }, false);
    }

    var canvas = el('div', main, 'ptbr-reading-canvas'), aside = el('aside', box, 'ptbr-reading-aside');
    var peek = createInlinePeek(box, aside);
    aside.id = uid; aside.setAttribute('aria-label', 'Explicação da relação selecionada');
    el('p', aside, 'ptbr-overline', 'POR DENTRO DO TEXTO');
    var navList = [];
    order.forEach(function (key) {
      var terms = groups[key].items.filter(function (f) { return f.feature !== 'Predicado'; });
      terms.sort(function (a, b) { return a.start - b.start || a.end - b.end; });
      terms.forEach(function (f) { navList.push(f); });
    });
    var asidePrev = null, asideNext = null, asideCounter = null;
    if (navList.length > 1) {
      var asideNav = el('div', aside, 'ptbr-aside-nav');
      asidePrev = el('button', asideNav, 'ptbr-aside-step', '← Anterior');
      asidePrev.type = 'button'; asidePrev.setAttribute('data-aside-step', 'prev');
      asideCounter = el('span', asideNav, 'ptbr-aside-counter', '1 / ' + navList.length);
      asideNext = el('button', asideNav, 'ptbr-aside-step', 'Próxima →');
      asideNext.type = 'button'; asideNext.setAttribute('data-aside-step', 'next');
      asidePrev.addEventListener('click', function () { stepSyntax(-1); }, false);
      asideNext.addEventListener('click', function () { stepSyntax(1); }, false);
    }
    var selected = el('p', aside, 'ptbr-reading-selection'), termGloss = el('p', aside, 'ptbr-term-gloss'), links = el('p', aside, 'ptbr-syntax-links'), details = el('div', aside, 'ptbr-reading-details');
    termGloss.hidden = true;
    selected.setAttribute('aria-live', 'polite');

    function stepSyntax(dir) {
      if (!navList.length) { return; }
      var cur = navList.indexOf(active);
      if (cur < 0) { cur = 0; }
      var nextIdx = Math.max(0, Math.min(navList.length - 1, cur + dir));
      if (navList[nextIdx]) { select(navList[nextIdx]); }
    }

    function button(f, target, cls) {
      var b = el('button', target, cls); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-controls', uid);
      b.setAttribute('data-syntax-node', f.nodeId);
      b.setAttribute('data-syntax-role', syntaxRoleKey(f.feature));
      var subrole = '';
      if (f.reducedKind) { subrole = 'reduzida'; }
      else if (f.nodeId && f.nodeId.indexOf('-adjunto-ini') !== -1) { subrole = 'deslocado'; }
      else if (f.evidence && f.evidence.observation && f.evidence.observation.indexOf('próclise') !== -1) { subrole = 'clitico'; }
      if (subrole) { b.setAttribute('data-syntax-subrole', subrole); }
      b.setAttribute('aria-label', f.feature + ': ' + f.snippet + '. Ver explicação.');
      el('span', b, 'ptbr-word-tag', f.feature);
      el('span', b, 'ptbr-word-text', f.snippet);
      if (f.components && f.components.length) {
        f.components.forEach(function (c) { if (valid(snapshot, c)) { el('span', b, 'ptbr-syntax-head', c.role + ': ' + c.snippet); } });
      } else if (f.head && f.head.snippet !== f.snippet) {
        el('span', b, 'ptbr-syntax-head', 'Núcleo: ' + f.head.snippet);
      }
      if (f.groupKind) {
        el('span', b, 'ptbr-syntax-subtag', f.groupKind);
      } else if (subrole === 'deslocado') {
        el('span', b, 'ptbr-syntax-subtag', 'deslocado');
      } else if (subrole === 'clitico') {
        el('span', b, 'ptbr-syntax-subtag', 'próclise');
      } else if (subrole === 'reduzida') {
        el('span', b, 'ptbr-syntax-subtag', 'reduzida · ' + f.reducedKind);
      }
      if (f.implicitSubject && f.implicitSubject.label) {
        el('span', b, 'ptbr-syntax-head', f.implicitSubject.label);
      }
      b.addEventListener('click', function () { select(f, true); }, false);
      b.addEventListener('keydown', function (ev) {
        if (ev.keyCode === 39) { if (ev.preventDefault) { ev.preventDefault(); } stepSyntax(1); }
        else if (ev.keyCode === 37) { if (ev.preventDefault) { ev.preventDefault(); } stepSyntax(-1); }
      }, false);
      buttons['$' + f.nodeId] = { button: b, finding: f };
    }

    order.forEach(function (key, index) {
      var g = groups[key], s = el('section', canvas, 'ptbr-reading-fragment');
      g.section = s;
      var fragHead = el('div', s, 'ptbr-fragment-head');
      el('p', fragHead, 'ptbr-fragment-number', 'FRASE ' + ('0' + (index + 1)).slice(-2) + ' DE ' + ('0' + order.length).slice(-2));
      var clauseKind = '';
      g.items.forEach(function (item) {
        if (clauseKind) { return; }
        if (item.reducedKind) { clauseKind = 'Oração reduzida · ' + item.reducedKind; }
        else if (item.groupKind === 'passiva analítica') { clauseKind = 'Voz passiva analítica'; }
        else if (item.implicitSubject && item.implicitSubject.pronoun) { clauseKind = 'Sujeito oculto (' + item.implicitSubject.pronoun + ')'; }
      });
      if (clauseKind) { el('span', fragHead, 'ptbr-clause-badge', clauseKind); }
      var scroll = el('div', s, 'ptbr-word-scroll'); scroll.setAttribute('tabindex', '0'); scroll.setAttribute('aria-label', 'Grupos da oração; role para ver todas as relações');
      g.row = el('div', scroll, 'ptbr-syntax-row');
      if (D.createElementNS) {
        g.svg = svgEl('svg', g.row, { 'class': 'ptbr-relation-arcs', 'aria-hidden': 'true' });
      }

      /* Termos na ordem exata em que aparecem na frase (f.start crescente) */
      var orderedTerms = g.items.filter(function (f) { return f.feature !== 'Predicado'; });
      orderedTerms.sort(function (a, b) { return a.start - b.start || a.end - b.end; });
      var predicates = g.items.filter(function (f) { return f.feature === 'Predicado'; });

      var strip = el('div', g.row, 'ptbr-syntax-order');
      orderedTerms.forEach(function (f) { button(f, strip, 'ptbr-syntax-term'); });

      if (predicates.length) {
        var predWrap = el('div', g.row, 'ptbr-syntax-scope-bar');
        predicates.forEach(function (f) { button(f, predWrap, 'ptbr-syntax-whole'); });
      }

      el('p', s, 'ptbr-fragment-original', g.clause.snippet);
    });

    if (!arr.length) {
      el('p', main, 'ptbr-reading-empty', 'Nenhuma construção analisada neste trecho. Isso indica apenas o recorte desta lente, não um erro no seu texto.');
      renderExamplesGallery(main, selected, details, 'sintaxe', options);
    }

    function setStepMode(oneByOne, idx) {
      stepMode = !!oneByOne;
      stepIndex = Math.max(0, Math.min(order.length - 1, idx || 0));
      if (btnAll) { btnAll.setAttribute('aria-pressed', stepMode ? 'false' : 'true'); }
      if (btnOne) { btnOne.setAttribute('aria-pressed', stepMode ? 'true' : 'false'); }
      if (btnPrev) { btnPrev.hidden = !stepMode; btnPrev.disabled = stepIndex <= 0; }
      if (btnNext) { btnNext.hidden = !stepMode; btnNext.disabled = stepIndex >= order.length - 1; }
      if (navCounter) { navCounter.hidden = !stepMode; navCounter.textContent = 'Frase ' + (stepIndex + 1) + ' de ' + order.length; }
      order.forEach(function (key, i) {
        if (groups[key].section) { groups[key].section.hidden = stepMode && i !== stepIndex; }
      });
      if (stepMode && order[stepIndex]) {
        var firstItem = groups[order[stepIndex]].items[0];
        if (firstItem) { select(firstItem); }
      } else {
        resize();
      }
    }

    function draw() {
      if (dead || !active || (options.isCurrent && !options.isCurrent())) { return; }
      order.forEach(function (key) { if (groups[key].svg) { groups[key].svg.textContent = ''; } });
      var g = groups['$' + active.clause.start];
      if (!g || !g.svg || !g.row.getBoundingClientRect) { return; }
      var row = g.row.getBoundingClientRect();
      if (!row.width) { return; }

      /* Coleta e ordena vínculos do menor ao maior vão (empilhamento arquitetônico limpo, até 6 arcos) */
      var activeEdges = [];
      (active.relations || []).forEach(function (edge) {
        if (edge.from !== active.nodeId && edge.to !== active.nodeId) { return; }
        var a = buttons['$' + edge.from], b = buttons['$' + edge.to];
        if (!a || !b) { return; }
        var ar = a.button.getBoundingClientRect(), br = b.button.getBoundingClientRect();
        var x1 = ar.left - row.left + ar.width / 2;
        var x2 = br.left - row.left + br.width / 2;
        activeEdges.push({ edge: edge, x1: x1, x2: x2, w1: ar.width, w2: br.width, span: Math.abs(x2 - x1) });
      });
      activeEdges.sort(function (u, v) { return u.span - v.span; });
      if (activeEdges.length > 6) { activeEdges = activeEdges.slice(0, 6); }

      /* Distribui suavemente pontos de saída/chegada quando múltiplas setas compartilham o mesmo bloco */
      var byFrom = {};
      activeEdges.forEach(function (item) {
        var k = '$' + item.edge.from;
        if (!byFrom[k]) { byFrom[k] = []; }
        byFrom[k].push(item);
      });
      Object.keys(byFrom).forEach(function (k) {
        var grp = byFrom[k];
        if (grp.length < 2) { return; }
        grp.sort(function (u, v) { return u.x2 - v.x2; });
        var step = Math.min(12, Math.max(6, ((grp[0].w1 || 90) - 32) / Math.max(1, grp.length - 1)));
        var mid = (grp.length - 1) / 2;
        grp.forEach(function (item, idx) {
          item.x1 = item.x1 + (idx - mid) * step;
        });
      });

      var tierStep = 28;
      var svgH = Math.max(72, 34 + activeEdges.length * tierStep);
      if (g.row.style) { g.row.style.paddingTop = (svgH + 2) + 'px'; }
      g.svg.setAttribute('width', row.width);
      g.svg.setAttribute('height', svgH);
      g.svg.setAttribute('viewBox', '0 0 ' + row.width + ' ' + svgH);

      var yAnchor = svgH;
      activeEdges.forEach(function (item, lane) {
        var yTop = Math.max(14, yAnchor - 30 - lane * tierStep);
        drawArchitecturalArc(g.svg, {
          x1: item.x1,
          x2: item.x2,
          yAnchor: yAnchor,
          yTop: yTop,
          rowWidth: row.width,
          label: item.edge.label
        });
      });
    }

    function select(f, user) {
      if (dead || (options.isCurrent && !options.isCurrent())) { return; }
      active = f;
      Object.keys(buttons).forEach(function (k) {
        buttons[k].button.setAttribute('aria-pressed', buttons[k].finding === f ? 'true' : 'false');
        buttons[k].button.setAttribute('data-syntax-linked', 'false');
      });
      selected.textContent = f.feature + ' · “' + f.snippet + '”';
      var sGloss = glossForSyntaxFinding(f);
      termGloss.textContent = sGloss;
      termGloss.hidden = !sGloss;
      var descriptions = [];
      (f.relations || []).forEach(function (edge) {
        var a = buttons['$' + edge.from], b = buttons['$' + edge.to];
        if (a && b && (edge.from === f.nodeId || edge.to === f.nodeId)) {
          if (a.finding !== f) { a.button.setAttribute('data-syntax-linked', 'true'); }
          if (b.finding !== f) { b.button.setAttribute('data-syntax-linked', 'true'); }
          descriptions.push(edge.label + ': “' + a.finding.snippet + '” ↔ “' + b.finding.snippet + '”');
        }
      });
      links.textContent = descriptions.join('. ');
      if (asideCounter) {
        var pos = navList.indexOf(f);
        asideCounter.textContent = (pos >= 0 ? (pos + 1) : 1) + ' / ' + navList.length;
        if (asidePrev) { asidePrev.disabled = pos <= 0; }
        if (asideNext) { asideNext.disabled = pos < 0 || pos >= navList.length - 1; }
      }
      options.onSelect(f, details, true);
      if (user && buttons['$' + f.nodeId]) {
        peek.show(buttons['$' + f.nodeId].button, {
          badge: '§',
          title: f.feature + ' · “' + f.snippet + '”',
          summary: summaryForFinding(f, sGloss || descriptions[0])
        });
      }
      resize();
    }

    function resize() { if (!dead) { root.clearTimeout(timer); timer = root.setTimeout(draw, 0); } }
    if (root.addEventListener) { root.addEventListener('resize', resize, false); }
    if (D.fonts && D.fonts.ready) { D.fonts.ready.then(resize); }
    if (arr.length) { select(arr[0], false); }
    return {
      select: function (i) { if (arr[i]) { select(arr[i], false); } },
      destroy: function () { dead = true; peek.destroy(); root.clearTimeout(timer); if (root.removeEventListener) { root.removeEventListener('resize', resize, false); } }
    };
  }

  function meterName(min, max) {
    if (min !== max) { return min + '–' + max + ' sílabas'; }
    var names = {
      1: '1 · monossílabo', 2: '2 · dissílabo', 3: '3 · trissílabo', 4: '4 · tetrassílabo',
      5: '5 · redondilha menor', 6: '6 · hexassílabo', 7: '7 · redondilha maior',
      8: '8 · octossílabo', 9: '9 · eneassílabo', 10: '10 · decassílabo',
      11: '11 · hendecassílabo', 12: '12 · alexandrino'
    };
    return names[max] || (max + ' sílabas');
  }
  function lineBounds(snapshot, pos) {
    var s = pos, e = pos;
    while (s > 0 && !/[\r\n]/.test(snapshot.charAt(s - 1))) { s--; }
    while (e < snapshot.length && !/[\r\n]/.test(snapshot.charAt(e))) { e++; }
    return { start: s, end: e };
  }
  function sentenceWindow(snapshot, start, end) {
    var lb = lineBounds(snapshot, start);
    var s = Math.max(lb.start, start - 55), e = Math.min(lb.end, end + 55);
    if (s > lb.start) { while (s > lb.start && !/\s/.test(snapshot.charAt(s - 1))) { s--; } }
    if (e < lb.end) { while (e < lb.end && !/\s/.test(snapshot.charAt(e))) { e++; } }
    return { start: s, end: e, prefixEllipsis: s > lb.start, suffixEllipsis: e < lb.end };
  }
  function appendMarkedText(container, snapshot, winStart, winEnd, spans, markCls, prefixEllipsis, suffixEllipsis) {
    var sorted = spans.slice().sort(function (a, b) { return a.start - b.start; });
    var cursor = winStart;
    if (prefixEllipsis) { el('span', container, 'ptbr-ctx-ellipsis', '…'); }
    sorted.forEach(function (sp) {
      if (sp.end <= cursor || sp.start >= winEnd) { return; }
      var a = Math.max(cursor, sp.start), b = Math.min(winEnd, sp.end);
      if (a > cursor) { el('span', container, 'ptbr-ctx-plain', snapshot.slice(cursor, a)); }
      if (b > a) { el('mark', container, markCls, snapshot.slice(a, b)); }
      cursor = b;
    });
    if (cursor < winEnd) { el('span', container, 'ptbr-ctx-plain', snapshot.slice(cursor, winEnd)); }
    if (suffixEllipsis) { el('span', container, 'ptbr-ctx-ellipsis', '…'); }
  }

  /* 1b. Orações relativas com arco SVG ligando "que ..." ao antecedente (estilo displaCy editorial) */
  function relativeMap(parent, options) {
    var snapshot = options.snapshot;
    var arr = options.findings.filter(function (f) { return valid(snapshot, f); }).slice(0, 100);
    var uid = 'ptbr-reading-' + (++serial), dead = false, timer = null, active = -1;
    var box = el('div', parent, 'ptbr-reading'), main = el('div', box, 'ptbr-reading-paper');
    box.setAttribute('data-reading-lens', 'relativas');
    renderExampleBanner(main, options);
    el('p', main, 'ptbr-overline', 'ORAÇÕES RELATIVAS · VÍNCULO COM O ANTECEDENTE');
    el('p', main, 'ptbr-reading-help', 'Cada frase mostra o antecedente, a oração relativa encaixada e o verbo principal na ordem de leitura, com seta indicando o que “que” ou “onde” retoma.');
    renderLensGuide(main, 'relativas');
    var canvas = el('div', main, 'ptbr-reading-canvas'), aside = el('aside', box, 'ptbr-reading-aside');
    aside.id = uid; aside.setAttribute('aria-label', 'Explicação da relativa selecionada');
    el('p', aside, 'ptbr-overline', 'POR DENTRO DO TEXTO');
    var selected = el('p', aside, 'ptbr-reading-selection'), details = el('div', aside, 'ptbr-reading-details');
    selected.setAttribute('aria-live', 'polite');
    if (!arr.length) {
      el('p', main, 'ptbr-reading-empty', 'Nenhuma oração relativa identificada neste trecho. Ausência de marcação não indica erro no texto.');
      renderExamplesGallery(main, selected, details, 'relativas', options);
    }

    var rows = [], rowButtons = [];
    arr.forEach(function (f, index) {
      var s = el('section', canvas, 'ptbr-reading-fragment');
      el('p', s, 'ptbr-fragment-number', 'PERÍODO ' + ('0' + (index + 1)).slice(-2) + ' DE ' + ('0' + arr.length).slice(-2));
      var scroll = el('div', s, 'ptbr-word-scroll'); scroll.setAttribute('tabindex', '0');
      var row = el('div', scroll, 'ptbr-syntax-row');
      var svg = D.createElementNS ? svgEl('svg', row, { 'class': 'ptbr-relation-arcs', 'aria-hidden': 'true' }) : null;
      var strip = el('div', row, 'ptbr-syntax-order');
      var ante = f.context && f.context[0] && valid(snapshot, f.context[0]) ? f.context[0] : null;
      var mainVerb = f.context && f.context[3] && valid(snapshot, f.context[3]) ? f.context[3] : null;

      var anteBtn = null;
      if (ante) {
        anteBtn = el('button', strip, 'ptbr-syntax-term'); anteBtn.type = 'button';
        anteBtn.setAttribute('data-syntax-role', 'sujeito'); anteBtn.setAttribute('aria-pressed', 'false');
        el('span', anteBtn, 'ptbr-word-tag', 'Antecedente');
        el('span', anteBtn, 'ptbr-word-text', ante.snippet);
        anteBtn.addEventListener('click', function () { select(index); }, false);
      }

      var relHead = f.head && f.head.snippet ? f.head.snippet : 'que';
      var relFn = f.relativeFunction === 'objeto direto' ? 'objeto' : (f.relativeFunction === 'adjunto adverbial de lugar' ? 'lugar' : 'sujeito');
      var relBtn = el('button', strip, 'ptbr-syntax-term'); relBtn.type = 'button';
      relBtn.setAttribute('data-syntax-role', 'objeto'); relBtn.setAttribute('aria-pressed', 'false');
      relBtn.setAttribute('aria-controls', uid);
      el('span', relBtn, 'ptbr-word-tag', 'Oração relativa · ' + relHead + '-' + relFn);
      el('span', relBtn, 'ptbr-word-text', f.snippet);
      if (f.components && f.components.length) {
        f.components.forEach(function (c) { if (valid(snapshot, c)) { el('span', relBtn, 'ptbr-syntax-head', c.role + ': ' + c.snippet); } });
      }
      relBtn.addEventListener('click', function () { select(index); }, false);

      var mvBtn = null;
      if (mainVerb) {
        mvBtn = el('button', strip, 'ptbr-syntax-term'); mvBtn.type = 'button';
        mvBtn.setAttribute('data-syntax-role', 'verbo'); mvBtn.setAttribute('aria-pressed', 'false');
        el('span', mvBtn, 'ptbr-word-tag', 'Verbo da principal');
        el('span', mvBtn, 'ptbr-word-text', mainVerb.snippet);
        mvBtn.addEventListener('click', function () { select(index); }, false);
      }

      if (f.clause && valid(snapshot, f.clause)) { el('p', s, 'ptbr-fragment-original', f.clause.snippet); }
      rows.push({ row: row, svg: svg, anteBtn: anteBtn, relBtn: relBtn, mvBtn: mvBtn, relHead: relHead });
      rowButtons.push(relBtn);
    });

    function draw() {
      if (dead || active < 0 || (options.isCurrent && !options.isCurrent())) { return; }
      rows.forEach(function (r) { if (r.svg) { r.svg.textContent = ''; } });
      var r = rows[active];
      if (!r || !r.svg || !r.anteBtn || !r.relBtn || !r.row.getBoundingClientRect) { return; }
      var rb = r.row.getBoundingClientRect(); if (!rb.width) { return; }
      var svgH = 72;
      if (r.row.style) { r.row.style.paddingTop = (svgH + 2) + 'px'; }
      r.svg.setAttribute('width', rb.width); r.svg.setAttribute('height', svgH); r.svg.setAttribute('viewBox', '0 0 ' + rb.width + ' ' + svgH);
      var ar = r.anteBtn.getBoundingClientRect(), rr = r.relBtn.getBoundingClientRect();
      var xFrom = rr.left - rb.left + rr.width / 2, xTo = ar.left - rb.left + ar.width / 2;
      var lbl = (r.relHead || 'que') + ' retoma antecedente';
      drawArchitecturalArc(r.svg, {
        x1: xFrom,
        x2: xTo,
        yAnchor: svgH,
        yTop: 32,
        rowWidth: rb.width,
        label: lbl
      });
    }

    function select(index) {
      if (dead || !arr[index] || (options.isCurrent && !options.isCurrent())) { return; }
      active = index;
      rowButtons.forEach(function (b, j) { b.setAttribute('aria-pressed', j === index ? 'true' : 'false'); });
      selected.textContent = 'Relativa · “' + arr[index].snippet + '”';
      options.onSelect(arr[index], details, true);
      resize();
    }
    function resize() { if (!dead) { root.clearTimeout(timer); timer = root.setTimeout(draw, 0); } }
    if (root.addEventListener) { root.addEventListener('resize', resize, false); }
    if (D.fonts && D.fonts.ready) { D.fonts.ready.then(resize); }
    if (arr.length) { select(0); }
    return { select: select, destroy: function () { dead = true; root.clearTimeout(timer); if (root.removeEventListener) { root.removeEventListener('resize', resize, false); } } };
  }

  /* 2. Classes de palavras em pílulas coloridas + visuais próprios para Ritmo, Repetição, Poesia (Rimas/Métrica) e Convenções */
  E.renderReadingMap = function (parent, options) {
    if (options.lens === 'sintaxe') { return syntaxMap(parent, options); }
    if (options.lens === 'relativas') { return relativeMap(parent, options); }
    var snapshot = options.snapshot, arr = options.findings.filter(function (f) { return valid(snapshot, f); }).slice(0, 100);
    /* Uma locução ocupa um cartão; leituras dos componentes seguem no achado.
     * Evita repetir as palavras no original reconstruído da anotação. */
    if (options.lens === 'morfologia') {
      var compoundGroups = arr.filter(function (f) { return !!f.locution; });
      arr = arr.filter(function (f) { return f.locution || !compoundGroups.some(function (g) { return f.start >= g.start && f.end <= g.end; }); });
    }
    var morph = options.lens === 'morfologia';
    var isRitmo = options.lens === 'ritmo';
    var isDialogo = options.lens === 'dialogo';
    var isAdverbios = options.lens === 'adverbios';
    var isRepeat = options.lens === 'repeticao';
    var isRima = options.lens === 'rima';
    var isMetrica = options.lens === 'metrica';
    var active = -1, dead = false, timer = null, activeClassFilter = '';
    var uid = 'ptbr-reading-' + (++serial), buttons = [], rows = [], rowFor = [], diagrams = [], wordClasses = [];
    var box = el('div', parent, 'ptbr-reading'), main = el('div', box, 'ptbr-reading-paper');
    box.setAttribute('data-reading-lens', options.lens || 'geral');
    renderExampleBanner(main, options);

    el('p', main, 'ptbr-overline',
      morph ? 'CLASSES DE PALAVRAS'
        : isRitmo ? 'RITMO DAS FRASES'
        : isDialogo ? 'LINHAS DE DIÁLOGO'
        : isRepeat ? 'REPETIÇÕES PRÓXIMAS'
        : isRima ? 'RIMAS ENTRE VERSOS'
        : isMetrica ? 'MÉTRICA DOS VERSOS'
        : 'LEITURA DO TEXTO');
    el('p', main, 'ptbr-reading-help', morph
      ? 'Filtre por classe acima ou clique em qualquer palavra para ver o contexto.'
      : isRitmo
        ? 'Extensão das frases, fôlego e sequências de cadência parecida.'
        : isDialogo
          ? 'Proporção de palavras e linhas com travessão (—), meia-risca (–) ou hífen (- ).'
          : isRepeat
            ? 'Palavras repetidas perto umas das outras. Clique para localizar ou abrir sinônimos.'
            : isRima
              ? 'Versos com final sonoro próximo compartilham a mesma letra (A, B, C…).'
              : isMetrica
                ? 'Sílabas poéticas estimadas, tônica destacada e medida do verso à direita.'
                : 'Clique em qualquer trecho para ler a observação ou localizar no texto.');
    renderLensGuide(main, options.lens);

    /* Barra de filtros por classe + alternador "Só cores" para Classes de palavras */
    var filterButtons = [];
    if (morph && arr.length) {
      var classCounts = {}, classOrder = [];
      arr.forEach(function (f) {
        var rawCls = f.analysisStatus === 'contextual' ? f.feature : (f.candidates && f.candidates.classes.length === 1 ? f.candidates.classes[0] : 'incerta');
        var k = normalizeClassKey(rawCls);
        if (!classCounts['$' + k]) { classCounts['$' + k] = 0; classOrder.push(k); }
        classCounts['$' + k]++;
      });
      var bar = el('div', main, 'ptbr-class-bar');
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Filtrar palavras por classe');

      var allBtn = el('button', bar, 'ptbr-class-chip', 'Todas (' + arr.length + ')');
      allBtn.type = 'button'; allBtn.setAttribute('aria-pressed', 'true'); allBtn.setAttribute('data-filter-class', '');
      filterButtons.push(allBtn);
      allBtn.addEventListener('click', function () { applyClassFilter(''); }, false);

      classOrder.forEach(function (k) {
        var cb = el('button', bar, 'ptbr-class-chip', classDisplayName(k) + ' (' + classCounts['$' + k] + ')');
        cb.type = 'button'; cb.setAttribute('aria-pressed', 'false'); cb.setAttribute('data-filter-class', k);
        cb.setAttribute('data-word-class', k);
        filterButtons.push(cb);
        cb.addEventListener('click', function () { applyClassFilter(activeClassFilter === k ? '' : k); }, false);
      });

      var compactBtn = el('button', bar, 'ptbr-pill-mode-btn', 'Só cores');
      compactBtn.type = 'button'; compactBtn.setAttribute('aria-pressed', 'false');
      compactBtn.title = 'Esconder os rótulos e deixar apenas as pílulas coloridas nas palavras';
      compactBtn.addEventListener('click', function () {
        var next = box.getAttribute('data-pills-compact') !== 'true';
        box.setAttribute('data-pills-compact', next ? 'true' : 'false');
        compactBtn.setAttribute('aria-pressed', next ? 'true' : 'false');
        compactBtn.textContent = next ? 'Mostrar rótulos' : 'Só cores';
        resize();
      }, false);
    }

    var canvas = el('div', main, 'ptbr-reading-canvas');
    var aside = el('aside', box, 'ptbr-reading-aside'); aside.id = uid; aside.setAttribute('aria-label', 'Explicação da leitura selecionada');
    var peek = createInlinePeek(box, aside);
    el('p', aside, 'ptbr-overline', 'POR DENTRO DO TEXTO');
    var asidePrev = null, asideNext = null, asideCounter = null;
    if (arr.length > 1) {
      var asideNav = el('div', aside, 'ptbr-aside-nav');
      asidePrev = el('button', asideNav, 'ptbr-aside-step', '← Anterior');
      asidePrev.type = 'button'; asidePrev.setAttribute('data-aside-step', 'prev');
      asideCounter = el('span', asideNav, 'ptbr-aside-counter', '1 / ' + arr.length);
      asideNext = el('button', asideNav, 'ptbr-aside-step', 'Próxima →');
      asideNext.type = 'button'; asideNext.setAttribute('data-aside-step', 'next');
      asidePrev.addEventListener('click', function () { stepOccurrence(-1); }, false);
      asideNext.addEventListener('click', function () { stepOccurrence(1); }, false);
    }
    var selected = el('p', aside, 'ptbr-reading-selection'); selected.setAttribute('aria-live', 'polite');
    var termGloss = el('p', aside, 'ptbr-term-gloss'); termGloss.hidden = true;
    var details = el('div', aside, 'ptbr-reading-details');
    if (!arr.length) {
      el('p', main, 'ptbr-reading-empty', 'Nenhuma ocorrência encontrada neste trecho. Ausência de marcação não indica erro no texto.');
      renderExamplesGallery(main, selected, details, options.lens, options);
    }

    function visibleIndices() {
      var list = [], idx;
      for (idx = 0; idx < arr.length; idx++) {
        if (!activeClassFilter || wordClasses[idx] === activeClassFilter) { list.push(idx); }
      }
      return list;
    }

    function updateAsideStepper() {
      if (!asideCounter) { return; }
      var vis = visibleIndices();
      var pos = vis.indexOf(active);
      asideCounter.textContent = vis.length ? ((pos >= 0 ? pos + 1 : 1) + ' / ' + vis.length) : '0 / 0';
      if (asidePrev) { asidePrev.disabled = pos <= 0; }
      if (asideNext) { asideNext.disabled = pos < 0 || pos >= vis.length - 1; }
    }

    function stepOccurrence(dir) {
      var vis = visibleIndices();
      if (!vis.length) { return; }
      var pos = vis.indexOf(active);
      if (pos < 0) { select(vis[0], true); return; }
      var targetPos = Math.max(0, Math.min(vis.length - 1, pos + dir));
      select(vis[targetPos], true);
    }

    /* Dados auxiliares para Ritmo (maior comprimento), Repetição (grupos de cor) e Rima (letras A/B/C...) */
    var maxWords = 1, repeatGroups = {}, nextRepeatColor = 0, rhymeGroups = {}, nextRhymeIdx = 0;
    var rhymeLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (isRitmo) {
      arr.forEach(function (f) {
        var wc = f.snippet.replace(/^\s+|\s+$/g, '').split(/\s+/).length;
        if (wc > maxWords) { maxWords = wc; }
      });
    }

    var row, sentence, previous = null;
    arr.forEach(function (f, index) {
      var gap = previous ? snapshot.slice(previous.end, f.start) : '';
      if (!morph || !row || /[\r\n]/.test(gap) || /[.!?]\s/.test(gap) || gap.length > 100) {
        var section = el('section', canvas, 'ptbr-reading-fragment');
        el('p', section, 'ptbr-fragment-number', morph ? ('FRASE ' + ('0' + (rows.length + 1)).slice(-2)) : ('TRECHO ' + ('0' + (rows.length + 1)).slice(-2)));
        var scroll = el('div', section, 'ptbr-word-scroll'); scroll.setAttribute('tabindex', '0'); scroll.setAttribute('aria-label', 'Trecho anotado');
        row = el('div', scroll, morph ? 'ptbr-word-row' : 'ptbr-excerpt-row'); rows.push(row);
        if (morph && D.createElementNS) {
          var svg = svgEl('svg', row, { 'class': 'ptbr-relation-arcs', 'aria-hidden': 'true' });
          diagrams.push(svg);
        } else { diagrams.push(null); }
        sentence = el('p', section, 'ptbr-fragment-original');
        sentence.textContent = f.snippet;
      } else {
        /* Preserva pontuação/espaços entre pílulas no fluxo natural do texto */
        var cleanGap = gap.replace(/^\s+|\s+$/g, '');
        if (morph && cleanGap) {
          el('span', row, 'ptbr-punct', cleanGap);
        }
        sentence.textContent += gap + f.snippet;
      }

      var b = el('button', row, morph ? 'ptbr-word' : 'ptbr-excerpt'); b.type = 'button';
      b.setAttribute('data-reading-index', index); b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-controls', uid);
      b.setAttribute('aria-label', f.snippet + ': ' + label(f) + '. Ver explicação.');
      b.setAttribute('data-reading-state', f.analysisStatus || 'observacao');
      var rawCls = f.analysisStatus === 'contextual' ? f.feature : (f.candidates && f.candidates.classes.length === 1 ? f.candidates.classes[0] : 'incerta');
      var normCls = normalizeClassKey(rawCls);
      b.setAttribute('data-word-class', rawCls || 'incerta');
      b.setAttribute('data-word-class-norm', normCls);

      if (isRepeat) {
        var rKey = '$' + String(f.snippet || '').toLowerCase();
        if (typeof repeatGroups[rKey] !== 'number') { repeatGroups[rKey] = (nextRepeatColor++) % 5; }
        b.setAttribute('data-repeat-group', String(repeatGroups[rKey]));
      }

      if (morph) {
        el('span', b, 'ptbr-word-text', f.snippet);
        el('span', b, 'ptbr-word-tag', label(f));
      } else if (isMetrica && f.measurements && f.measurements.words && f.measurements.words.length) {
        var scanRow = el('span', b, 'ptbr-scansion-row');
        var scanVerse = el('span', scanRow, 'ptbr-scansion-verse');
        var wList = f.measurements.words;
        wList.forEach(function (wObj, wi) {
          if (wi > 0) { el('span', scanVerse, 'ptbr-syl-sep', ' / '); }
          var isLastWord = wi === wList.length - 1;
          wObj.syllables.forEach(function (syl, si) {
            if (si > 0) { el('span', scanVerse, 'ptbr-syl-dot', '·'); }
            var sCls = si === wObj.tonic ? 'ptbr-syl-tonic' : (isLastWord && si > wObj.tonic ? 'ptbr-syl-tail' : 'ptbr-syl');
            el('span', scanVerse, sCls, syl);
          });
        });
        var meterWrap = el('span', scanRow, 'ptbr-meter-badges');
        el('span', meterWrap, 'ptbr-meter-badge', meterName(f.measurements.min, f.measurements.max));
        if (f.measurements.possibleFusions > 0) {
          el('span', meterWrap, 'ptbr-metric-chip', f.measurements.possibleFusions + (f.measurements.possibleFusions === 1 ? ' elisão possível' : ' elisões possíveis'));
        }
      } else if (isRima && f.related && valid(snapshot, f.related)) {
        var rk = '$' + f.related.start;
        if (typeof rhymeGroups[rk] !== 'number') { rhymeGroups[rk] = nextRhymeIdx++; }
        var rIdx = rhymeGroups[rk];
        var rLetter = rhymeLetters.charAt(rIdx % rhymeLetters.length);
        b.setAttribute('data-repeat-group', String(rIdx % 5));
        var rHead = el('span', b, 'ptbr-rhyme-head');
        el('span', rHead, 'ptbr-rhyme-badge', 'RIMA ' + rLetter);
        if (f.rhymeKind) {
          el('span', rHead, 'ptbr-metric-chip' + (f.rhymeKind === 'toante' ? ' ptbr-chip-dashed' : ''), f.rhymeKind);
        }
        el('span', rHead, 'ptbr-rhyme-pair', '“' + f.related.snippet + '” ↔ “' + f.snippet + '”');
        var l1 = lineBounds(snapshot, f.related.start), l2 = lineBounds(snapshot, f.start);
        var v1 = el('span', b, 'ptbr-rhyme-line');
        appendMarkedText(v1, snapshot, l1.start, l1.end, [f.related], 'ptbr-inline-hit', false, false);
        var v2 = el('span', b, 'ptbr-rhyme-line');
        appendMarkedText(v2, snapshot, l2.start, l2.end, [f], 'ptbr-inline-hit', false, false);
      } else if (isRepeat && f.occurrences && f.occurrences.length > 1) {
        var repStart = typeof f.contextStart === 'number' ? Math.max(0, f.contextStart - 28) : Math.max(0, f.start - 40);
        var repEnd = Math.min(snapshot.length, f.end + 36);
        var lbRep = lineBounds(snapshot, f.start);
        repStart = Math.max(lbRep.start, repStart); repEnd = Math.min(lbRep.end, repEnd);
        var repCtx = el('span', b, 'ptbr-ctx-line');
        appendMarkedText(repCtx, snapshot, repStart, repEnd, f.occurrences, 'ptbr-inline-hit', repStart > lbRep.start, repEnd < lbRep.end);
        el('span', b, 'ptbr-word-tag', f.occurrences.length + '× “' + f.snippet + '” no trecho');
      } else if (isDialogo && f.metrics) {
        var dm = f.metrics;
        var dPct = Math.max(0, Math.min(100, Math.round(dm.markedPercent || 0)));
        el('span', b, 'ptbr-word-text', f.message);
        var prop = el('span', b, 'ptbr-proportion-bar');
        var pFill = el('span', prop, 'ptbr-proportion-fill');
        if (pFill.style) { pFill.style.width = dPct + '%'; }
        var dChips = el('span', b, 'ptbr-metric-chips');
        el('span', dChips, 'ptbr-metric-chip', dm.markedLines + ' de ' + dm.lines + ' linhas');
        el('span', dChips, 'ptbr-metric-chip', dm.markedLineWords + ' de ' + dm.totalWords + ' palavras');
        if (dm.markers) {
          if (dm.markers.emDash) { el('span', dChips, 'ptbr-metric-chip', '— travessão: ' + dm.markers.emDash); }
          if (dm.markers.enDash) { el('span', dChips, 'ptbr-metric-chip', '– meia-risca: ' + dm.markers.enDash); }
          if (dm.markers.hyphen) { el('span', dChips, 'ptbr-metric-chip', '- hífen: ' + dm.markers.hyphen); }
        }
      } else if (isRitmo && f.id === 'PTBR-RIT-001' && f.metrics) {
        var rm = f.metrics;
        el('span', b, 'ptbr-rhyme-badge', 'PANORAMA');
        el('span', b, 'ptbr-word-text', f.message);
        var rChips = el('span', b, 'ptbr-metric-chips');
        el('span', rChips, 'ptbr-metric-chip', rm.sentences + ' frases');
        el('span', rChips, 'ptbr-metric-chip', 'média ' + rm.mean.toFixed(1) + ' pal.');
        el('span', rChips, 'ptbr-metric-chip', 'faixa ' + rm.shortest + '–' + rm.longest);
        el('span', rChips, 'ptbr-metric-chip', 'desvio ' + rm.deviation.toFixed(1));
      } else if (isRitmo && f.id === 'PTBR-RIT-003' && f.metrics && f.metrics.lengths) {
        var rHead3 = el('span', b, 'ptbr-rhyme-head');
        el('span', rHead3, 'ptbr-rhyme-badge', 'CADÊNCIA REGULAR');
        el('span', rHead3, 'ptbr-rhyme-pair', f.metrics.runLength + ' frases (' + f.metrics.minWords + '–' + f.metrics.maxWords + ' palavras)');
        el('span', b, 'ptbr-word-text', f.snippet);
        var pulse = el('span', b, 'ptbr-pulse-strip');
        f.metrics.lengths.forEach(function (len) {
          var chip = el('span', pulse, 'ptbr-pulse-bar', len + ' pal.');
          if (chip.style) { chip.style.minWidth = Math.max(44, Math.min(120, len * 6)) + 'px'; }
        });
      } else if (isRitmo) {
        if (f.id === 'PTBR-RIT-002') {
          var rHead2 = el('span', b, 'ptbr-rhyme-head');
          el('span', rHead2, 'ptbr-rhyme-badge', 'FRASE EXTENSA');
          if (f.metrics && typeof f.metrics.mean === 'number') {
            el('span', rHead2, 'ptbr-metric-chip', 'média do trecho: ' + f.metrics.mean.toFixed(1) + ' pal.');
          }
        }
        el('span', b, 'ptbr-word-text', f.snippet);
        var wc = (f.metrics && typeof f.metrics.words === 'number') ? f.metrics.words : f.snippet.replace(/^\s+|\s+$/g, '').split(/\s+/).length;
        var pct = Math.max(10, Math.round((wc / maxWords) * 100));
        var meter = el('span', b, 'ptbr-rhythm-meter');
        var fill = el('span', meter, 'ptbr-rhythm-bar');
        if (fill.style) { fill.style.width = pct + '%'; }
        el('span', meter, 'ptbr-rhythm-count', wc + (wc === 1 ? ' palavra' : ' palavras'));
      } else {
        /* Convenções e escolhas de escrita: exibe o trecho destacado dentro da frase real */
        var win = sentenceWindow(snapshot, f.start, f.end);
        var ctxLine = el('span', b, 'ptbr-ctx-line');
        appendMarkedText(ctxLine, snapshot, win.start, win.end, [f], 'ptbr-inline-hit', win.prefixEllipsis, win.suffixEllipsis);
        var metaRow = el('span', b, 'ptbr-metric-chips');
        el('span', metaRow, 'ptbr-word-tag', f.message || label(f));
        if (isAdverbios && f.metrics && f.metrics.paragraphCount >= 2) {
          el('span', metaRow, 'ptbr-metric-chip', f.metrics.paragraphCount + '× neste parágrafo');
        }
        if (f.reference) {
          el('span', metaRow, 'ptbr-metric-chip ptbr-ref-chip', 'Ref.: “' + f.reference + '”');
        }
      }

      b.addEventListener('click', function () { select(index, true); }, false);
      buttons.push(b); wordClasses.push(normCls); rowFor.push(rows.length - 1); previous = f;
    });

    function applyClassFilter(cls) {
      activeClassFilter = cls || '';
      filterButtons.forEach(function (fb) {
        fb.setAttribute('aria-pressed', fb.getAttribute('data-filter-class') === activeClassFilter ? 'true' : 'false');
      });
      buttons.forEach(function (b, idx) {
        var dim = !!activeClassFilter && wordClasses[idx] !== activeClassFilter;
        b.setAttribute('data-dimmed', dim ? 'true' : 'false');
      });
      var vis = visibleIndices();
      if (vis.length && vis.indexOf(active) === -1) { select(vis[0], false); }
      else { updateAsideStepper(); }
    }

    function draw() {
      if (dead || active < 0) { return; }
      diagrams.forEach(function (svg) { if (svg) { svg.textContent = ''; } });
      var f = arr[active], ri = rowFor[active], svg = diagrams[ri], b = buttons[active], curRow = rows[ri];
      if (!svg || !b.getBoundingClientRect || f.analysisStatus !== 'contextual') { return; }
      var rb = curRow.getBoundingClientRect(), bb = b.getBoundingClientRect();
      if (!rb.width) { return; }
      var rowH = typeof rb.height === 'number' && rb.height > 0 ? rb.height : 66;
      var x = bb.left - rb.left + bb.width / 2;
      var y1 = typeof bb.top === 'number' && typeof rb.top === 'number' ? Math.max(18, bb.top - rb.top) : 60;
      svg.setAttribute('width', rb.width);
      svg.setAttribute('height', Math.max(66, rowH));
      svg.setAttribute('viewBox', '0 0 ' + rb.width + ' ' + Math.max(66, rowH));
      var lane = 0;
      (f.context || []).forEach(function (support) {
        if (!valid(snapshot, support) || lane >= 3) { return; }
        for (var j = 0; j < arr.length; j++) {
          if (j === active || rowFor[j] !== ri || arr[j].start !== support.start || arr[j].end !== support.end) { continue; }
          var r = buttons[j].getBoundingClientRect();
          var x2 = r.left - rb.left + r.width / 2;
          var y2 = typeof r.top === 'number' && typeof rb.top === 'number' ? Math.max(18, r.top - rb.top) : 60;
          buttons[j].setAttribute('data-reading-support', 'true');
          if (Math.abs(y1 - y2) >= 8) { break; }
          var yAnchor = Math.max(20, Math.min(y1, y2) - 2);
          var topY = Math.max(6, yAnchor - (16 + lane * 10));
          drawArchitecturalArc(svg, {
            x1: x,
            x2: x2,
            yAnchor: yAnchor,
            yTop: topY,
            rowWidth: rb.width,
            dashed: true
          });
          lane++;
          break;
        }
      });
    }

    function select(index, user) {
      if (dead || !arr[index] || (options.isCurrent && !options.isCurrent())) { return; }
      active = index;
      buttons.forEach(function (b, j) { b.setAttribute('aria-pressed', j === index ? 'true' : 'false'); b.setAttribute('data-reading-support', 'false'); });
      var itemStatus = arr[index].analysisStatus;
      selected.textContent = (morph && (itemStatus === 'ambiguo' || itemStatus === 'desconhecido'))
        ? ('“' + arr[index].snippet + '”')
        : ('“' + arr[index].snippet + '” · ' + label(arr[index]));
      var mGloss = morph ? glossForMorphFinding(arr[index]) : (options.lens === 'adverbios' ? TERM_GLOSSARY.adverbio : '');
      termGloss.textContent = mGloss;
      termGloss.hidden = !mGloss;
      updateAsideStepper();
      options.onSelect(arr[index], details, user);
      if (user && buttons[index]) {
        var btnEl = buttons[index];
        var hitAnchor = (btnEl.querySelector && btnEl.querySelector('.ptbr-inline-hit')) || btnEl;
        var usoHit = (E.dificuldades && typeof E.dificuldades.lookupWord === 'function')
          ? E.dificuldades.lookupWord(arr[index].snippet)
          : null;
        peek.show(hitAnchor, {
          badge: morph ? '¶' : '◆',
          title: label(arr[index]) + ' · “' + arr[index].snippet + '”',
          summary: summaryForFinding(arr[index], mGloss),
          usoId: usoHit ? usoHit.id : '',
          usoTitle: usoHit ? usoHit.titulo : ''
        });
      }
      root.clearTimeout(timer); timer = root.setTimeout(draw, 0);
    }

    function resize() { if (!dead) { root.clearTimeout(timer); timer = root.setTimeout(draw, 0); } }
    if (root.addEventListener) { root.addEventListener('resize', resize, false); }
    if (D.fonts && D.fonts.ready) { D.fonts.ready.then(resize); }

    var first = 0;
    for (var i = 0; i < arr.length; i++) { if (arr[i].analysisStatus === 'contextual') { first = i; break; } }
    if (options.initialTarget) {
      first = -1;
      for (var targetAt = 0; targetAt < arr.length; targetAt++) {
        if (arr[targetAt].start <= options.initialTarget.start && arr[targetAt].end >= options.initialTarget.end) { first = targetAt; break; }
      }
    }
    if (first >= 0 && arr.length) { select(first, false); }
    return {
      select: select,
      destroy: function () { dead = true; peek.destroy(); root.clearTimeout(timer); if (root.removeEventListener) { root.removeEventListener('resize', resize, false); } }
    };
  };
}(typeof window !== 'undefined' ? window : this));
