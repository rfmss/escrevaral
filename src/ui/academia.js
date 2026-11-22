(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var LAST_GUIDE_KEY = 'escrevaral.academy.last.v1';

  function isPortableDoc() {
    try {
      if (typeof document !== 'undefined' && document.querySelector) {
        var meta = document.querySelector('meta[name="distribution-mode"]');
        if (meta && meta.getAttribute('content') === 'portable') { return true; }
      }
      if (typeof location !== 'undefined' && location.protocol === 'file:') { return true; }
    } catch (ignore) {}
    return false;
  }

  /* Aplica as pinturas WebP do Real Gabinete em modo site (sem quebrar o portátil autocontido). */
  function cssAsset(path) {
    return ['u', 'rl("', path, '")'].join('');
  }
  function bindLibraryAtmosphere() {
    try {
      if (isPortableDoc()) { return; }
      if (typeof document === 'undefined' || !document.documentElement || !document.documentElement.style) { return; }
      var st = document.documentElement.style;
      st.setProperty('--esc-rg-hero-art', cssAsset('assets/library/real-gabinete-hero.webp'));
      st.setProperty('--esc-rg-book-art', cssAsset('assets/library/tome-objeto-livro.webp'));
      st.setProperty('--esc-rg-lit-art', cssAsset('assets/library/tome-literatura-mundial.webp'));
    } catch (ignore) {}
  }
  bindLibraryAtmosphere();

  var CATALOG = [
    { id: 'objeto-livro', title: 'Objeto livro', group: 'Objeto livro', description: 'Da capa ao colofão, explore cada parte.', file: 'anatomia-do-livro.html',
      bridge: { action: 'reader', label: 'Ver folha no Modo Leitura', hint: 'Experimente seu texto como página impressa.' } },
    { id: 'literatura-mundial', title: 'Literatura mundial', group: 'Literatura', description: 'Percorra épocas e leia textos que abrem caminhos para escrever.', file: 'literatura-mundial.html', module: 'literature',
      bridge: { action: 'write', label: 'Voltar à folha para escrever', hint: 'Leve o ritmo da leitura de volta para a bancada.' } },
    { id: 'primeiras-linhas', title: 'Começar um livro', group: 'Escrita e revisão', description: 'Da primeira linha ao primeiro capítulo.', file: 'primeiras-linhas.html',
      bridge: { action: 'superfoco', label: 'Começar na folha (Superfoco)', hint: 'Limpe a mesa e escreva a primeira linha.' } },
    { id: 'titulo-do-livro', title: 'Escolher o título', group: 'Escrita e revisão', description: 'Explore caminhos para dar nome à obra.', file: 'titulo-do-livro.html',
      bridge: { action: 'focus-title', label: 'Editar título da folha', hint: 'Teste títulos direto no cabeçalho do manuscrito.' } },
    { id: 'bloqueio-criativo', title: 'Bloqueio criativo', group: 'Escrita e revisão', description: 'Encontre uma forma de retomar a escrita.', file: 'bloqueio-criativo.html',
      bridge: { action: 'superfoco', label: 'Destravar no Superfoco', hint: 'Feche o ruído e deixe a escrita fluir sem censura.' } },
    { id: 'revisao-manuscrito', title: 'Revisar o manuscrito', group: 'Escrita e revisão', description: 'Revise em camadas, sem perder o fio.', file: 'revisao-manuscrito.html',
      bridge: { action: 'examine', label: 'Abrir Examinar na Oficina', hint: 'Revise a folha por camadas com as lentes locais.',
        lenses: [
          { id: 'sintaxe', label: 'Sintaxe' },
          { id: 'ritmo', label: 'Ritmo' },
          { id: 'repeticao', label: 'Repetição' }
        ] } },
    { id: 'biblioteca-escrita', title: 'Biblioteca da escrita', group: 'Escrita e revisão', description: 'Conheça referências e critérios de leitura.', file: 'biblioteca-escrita.html',
      bridge: { action: 'write', label: 'Voltar à oficina', hint: 'Aplique os critérios de leitura direto no seu rascunho.' } },
    { id: 'mapa-lancamento-editorial', title: 'Mapa de lançamento', group: 'Publicação e carreira', description: 'Guia para transformar manuscrito em projeto de publicação, com decisão entre caminho independente e editorial.', file: 'mapa-lancamento-editorial.html',
      bridge: { action: 'calculator', label: 'Estimar páginas e ritmo', hint: 'Calcule páginas, laudas e tempo até o lançamento.' } },
    { id: 'autopublicacao-independente', title: 'Autopublicação independente', group: 'Publicação e carreira', description: 'Guia para publicar por conta própria com revisão, capa, distribuição, preço e audiência.', file: 'autopublicacao-independente.html',
      bridge: { action: 'calculator', label: 'Estimar páginas do livro', hint: 'Projete a extensão editorial do manuscrito.' } },
    { id: 'submissao-editoras', title: 'Submissão a editoras', group: 'Publicação e carreira', description: 'Guia para preparar manuscrito, sinopse, proposta editorial e abordagem a editoras.', file: 'submissao-editoras.html',
      bridge: { action: 'cartorio', label: 'Abrir Cartório da obra', hint: 'Gere o selo SHA-256 e audite a origem antes de enviar.' } },
    { id: 'comparativo-publicacao', title: 'Comparativo de publicação', group: 'Publicação e carreira', description: 'Guia para comparar publicação independente, tradicional e híbrida.', file: 'comparativo-publicacao.html',
      bridge: { action: 'cartorio', label: 'Conferir Cartório da obra', hint: 'Revise o selo de origem e integridade (SHA-256) antes de decidir o caminho.' } },
    { id: 'checklist-lancamento', title: 'Checklist de lançamento', group: 'Publicação e carreira', description: 'Guia para conferir manuscrito, capa, ISBN, sinopse e comunicação.', file: 'checklist-lancamento.html',
      bridge: { action: 'cartorio', label: 'Auditar mesa no Cartório', hint: 'Verifique selo e integridade da mesa antes de publicar.' } },
    { id: 'mentalidade-autor-publicado', title: 'Mentalidade de autor', group: 'Publicação e carreira', description: 'Guia para lidar com perfeccionismo, rejeição e continuidade de carreira.', file: 'mentalidade-autor-publicado.html',
      bridge: { action: 'write', label: 'Retomar a escrita', hint: 'Volte para a folha no seu próprio ritmo.' } },
    { id: 'publicar-kdp', title: 'Publicar no Amazon KDP', group: 'Publicação e carreira', description: 'Guia para publicar seu livro no Kindle Direct Publishing, do título à precificação.', file: 'publicar-kdp.html',
      bridge: { action: 'calculator', label: 'Calcular páginas do livro', hint: 'Estime extensão e páginas para publicação independente.' } }
  ];

  var GROUP_ICONS = {
    'Objeto livro': 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20',
    'Literatura': 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
    'Escrita e revisão': 'M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z',
    'Publicação e carreira': 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5'
  };

  function makeSvg(tag, attrs) {
    var ns = 'http://www.w3.org/2000/svg';
    var node = document.createElementNS ? document.createElementNS(ns, tag) : document.createElement(tag);
    if (attrs) {
      var k;
      for (k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) {
          node.setAttribute(k, String(attrs[k]));
        }
      }
    }
    return node;
  }

  function makeGroupIcon(groupName) {
    var svg = makeSvg('svg', {
      'class': 'esc-ui-ico', viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      'aria-hidden': 'true'
    });
    var d = GROUP_ICONS[groupName] || GROUP_ICONS['Objeto livro'];
    var parts = d.split(' M');
    var i;
    for (i = 0; i < parts.length; i += 1) {
      svg.appendChild(makeSvg('path', { d: (i === 0 ? '' : 'M') + parts[i] }));
    }
    return svg;
  }

  /* Brasão ilustrado para o Hero e para os 2 tomos de destaque (SVG puro, offline) */
  function makeEmblemSvg(kind) {
    var svg = makeSvg('svg', { viewBox: '0 0 72 48', fill: 'none', 'aria-hidden': 'true', focusable: 'false' });
    if (kind === 'objeto-livro') {
      /* Livro aberto em perspectiva com raio dourado central */
      svg.appendChild(makeSvg('path', { d: 'M10 35 C18 32, 27 32, 36 37 C45 32, 54 32, 62 35 L62 15 C54 12, 45 12, 36 17 C27 12, 18 12, 10 15 Z', stroke: 'currentColor', 'stroke-width': '1.4', fill: 'currentColor', 'fill-opacity': '0.08' }));
      svg.appendChild(makeSvg('line', { x1: '36', y1: '17', x2: '36', y2: '37', stroke: 'currentColor', 'stroke-width': '1.2' }));
      svg.appendChild(makeSvg('path', { d: 'M15 20 C21 19, 26 20, 31 22 M15 25 C21 24, 26 25, 31 27 M57 20 C51 19, 46 20, 41 22 M57 25 C51 24, 46 25, 41 27', stroke: 'currentColor', 'stroke-width': '0.9', opacity: '0.68', 'stroke-linecap': 'round' }));
      svg.appendChild(makeSvg('path', { d: 'M36 4 L37.8 9 L42.5 10.6 L37.8 12.2 L36 17 L34.2 12.2 L29.5 10.6 L34.2 9 Z', fill: 'currentColor', opacity: '0.88' }));
    } else if (kind === 'literatura-mundial') {
      /* Astrolábio literário e constelação de páginas */
      svg.appendChild(makeSvg('circle', { cx: '36', cy: '24', r: '15', stroke: 'currentColor', 'stroke-width': '1.2', opacity: '0.85' }));
      svg.appendChild(makeSvg('ellipse', { cx: '36', cy: '24', rx: '24', ry: '8.5', stroke: 'currentColor', 'stroke-width': '1', opacity: '0.55', transform: 'rotate(-16 36 24)' }));
      svg.appendChild(makeSvg('ellipse', { cx: '36', cy: '24', rx: '7.5', ry: '15', stroke: 'currentColor', 'stroke-width': '0.9', opacity: '0.52' }));
      svg.appendChild(makeSvg('path', { d: 'M36 15 L38.2 21.8 L45 24 L38.2 26.2 L36 33 L33.8 26.2 L27 24 L33.8 21.8 Z', fill: 'currentColor', opacity: '0.88' }));
      svg.appendChild(makeSvg('circle', { cx: '56', cy: '14', r: '1.8', fill: 'currentColor', opacity: '0.75' }));
      svg.appendChild(makeSvg('circle', { cx: '16', cy: '32', r: '1.6', fill: 'currentColor', opacity: '0.75' }));
    } else {
      /* Brasão principal da Academia: estrela de 4 pontas + coroa de folhas */
      svg.appendChild(makeSvg('path', { d: 'M12 24 C20 18, 26 20, 30 24 C26 28, 20 30, 12 24 Z', stroke: 'currentColor', 'stroke-width': '1', fill: 'currentColor', 'fill-opacity': '0.12' }));
      svg.appendChild(makeSvg('path', { d: 'M60 24 C52 18, 46 20, 42 24 C46 28, 52 30, 60 24 Z', stroke: 'currentColor', 'stroke-width': '1', fill: 'currentColor', 'fill-opacity': '0.12' }));
      svg.appendChild(makeSvg('path', { d: 'M36 6 L39.5 19.5 L53 24 L39.5 28.5 L36 42 L32.5 28.5 L19 24 L32.5 19.5 Z', stroke: 'currentColor', 'stroke-width': '1.2', fill: 'currentColor', 'fill-opacity': '0.24' }));
      svg.appendChild(makeSvg('circle', { cx: '36', cy: '24', r: '2.5', fill: 'currentColor' }));
    }
    return svg;
  }

  /* Cena panorâmica leve em 2 camadas (Real Gabinete Português de Leitura · Biblioteca do Liceu):
   * ilustração pintada em WebP leve (120 KB) + moldura arquitetônica dourada, zero partículas animadas em loop. */
  function buildHeroScene() {
    var stage = document.createElement('div');
    stage.className = 'esc-ac-scene';
    stage.setAttribute('aria-hidden', 'true');

    /* Camada 0: Pintura panorâmica do Real Gabinete (guache/giz, claraboia octogonal, galerias e candelabros) */
    var dome = document.createElement('div');
    dome.className = 'esc-ac-layer esc-ac-layer-dome';
    dome.setAttribute('data-depth', '0.22');
    if (!isPortableDoc()) {
      var heroImg = document.createElement('img');
      heroImg.className = 'esc-ac-art-img';
      heroImg.src = 'assets/library/real-gabinete-hero.webp';
      heroImg.alt = '';
      heroImg.setAttribute('aria-hidden', 'true');
      heroImg.setAttribute('decoding', 'async');
      on(heroImg, 'error', function () { heroImg.hidden = true; });
      dome.appendChild(heroImg);
    }
    stage.appendChild(dome);

    /* Camada 1: Moldura leve em ouro envelhecido com arcos neomanuelinos e estrelas de 4 pontas */
    var hall = document.createElement('div');
    hall.className = 'esc-ac-layer esc-ac-layer-hall';
    hall.setAttribute('data-depth', '0.52');
    var hallSvg = makeSvg('svg', { viewBox: '0 0 1000 240', preserveAspectRatio: 'xMidYMid slice', fill: 'none' });
    hallSvg.appendChild(makeSvg('path', {
      d: 'M24 232 L24 68 Q24 18 96 10 M976 232 L976 68 Q976 18 904 10',
      stroke: 'currentColor', 'stroke-width': '1.3', opacity: '0.42'
    }));
    hallSvg.appendChild(makeSvg('path', {
      d: 'M184 54 L186.5 59.5 L192 62 L186.5 64.5 L184 70 L181.5 64.5 L176 62 L181.5 59.5 Z' +
         ' M816 54 L818.5 59.5 L824 62 L818.5 64.5 L816 70 L813.5 64.5 L808 62 L813.5 59.5 Z',
      fill: 'currentColor', opacity: '0.68'
    }));
    hallSvg.appendChild(makeSvg('path', { d: 'M16 228 L984 228', stroke: 'currentColor', 'stroke-width': '1', opacity: '0.32' }));
    hall.appendChild(hallSvg);
    stage.appendChild(hall);

    return { stage: stage, layers: [dome, hall] };
  }

  var ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV'];

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }

  function findEntry(id) {
    var i;
    for (i = 0; i < CATALOG.length; i += 1) {
      if (CATALOG[i].id === id) { return CATALOG[i]; }
    }
    return null;
  }

  function recommendForContext(ctx) {
    var info = ctx && typeof ctx === 'object' ? ctx : {};
    var words = Number(info.words) || 0;
    var hasTitle = !!info.hasTitle;
    var stageId, stageLabel, stageNote, ids;

    if (words <= 0) {
      stageId = 'blank';
      stageLabel = 'Folha em branco';
      stageNote = 'A bancada está limpa para começar do zero — escolha um arranque ou aqueça o ritmo.';
      ids = ['primeiras-linhas', 'bloqueio-criativo'];
    } else if (words < 600 && !hasTitle) {
      stageId = 'untitled';
      stageLabel = 'Primeiras páginas sem título';
      stageNote = 'Seu texto já nasceu (' + words + (words === 1 ? ' palavra' : ' palavras') + '). Você pode batizar a folha ou aprofundar a abertura.';
      ids = ['titulo-do-livro', 'primeiras-linhas'];
    } else if (words < 600) {
      stageId = 'drafting';
      stageLabel = 'Rascunho em formação';
      stageNote = 'Esta folha tem ' + words + (words === 1 ? ' palavra' : ' palavras') + '. Bom momento para sustentar o fôlego ou ler em busca de ressonância.';
      ids = ['bloqueio-criativo', 'literatura-mundial'];
    } else if (words < 2500) {
      stageId = 'revising';
      stageLabel = 'Texto em desenvolvimento';
      stageNote = 'Com ' + words + ' palavras na folha, já vale observar estrutura em camadas e o corpo editorial do livro.';
      ids = ['revisao-manuscrito', 'objeto-livro'];
    } else {
      stageId = 'manuscript';
      stageLabel = 'Manuscrito encorpado';
      stageNote = 'Esta folha já soma ' + words + ' palavras — hora de lapidar em camadas e planejar o caminho da publicação.';
      ids = ['revisao-manuscrito', 'mapa-lancamento-editorial'];
    }

    var guides = [], i, entry;
    for (i = 0; i < ids.length; i += 1) {
      entry = findEntry(ids[i]);
      if (entry) { guides.push(entry); }
    }
    return {
      stageId: stageId,
      stageLabel: stageLabel,
      stageNote: stageNote,
      guides: guides
    };
  }

  root.Escr.academy = {
    catalog: function () { return CATALOG.slice(); },
    find: findEntry,
    recommendForContext: recommendForContext
  };

  root.Escr.mountAcademy = function (opts) {
    opts = opts || {};
    var storage = opts.storage || null;
    var getContext = typeof opts.getContext === 'function' ? opts.getContext : null;
    var onAction = typeof opts.onAction === 'function' ? opts.onAction : null;
    var modalEl = null;
    var currentMode = null;
    var activeEntry = null;
    var prevFocus = null;
    var cleanupParallax = null;

    function stopParallax() {
      if (cleanupParallax) {
        cleanupParallax();
        cleanupParallax = null;
      }
    }

    function prefersReducedMotion() {
      try {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      } catch (ignore) { return false; }
    }

    function readLastGuideId() {
      try {
        var saved = storage ? storage.getItem(LAST_GUIDE_KEY) : null;
        return saved && findEntry(saved) ? saved : null;
      } catch (ignore) { return null; }
    }

    function writeLastGuideId(id) {
      try {
        if (storage && id) { storage.setItem(LAST_GUIDE_KEY, String(id)); }
      } catch (ignore) {}
    }

    function buildModal() {
      if (modalEl) { return modalEl; }
      var sec = document.createElement('section');
      sec.id = 'esc-academy-overlay';
      sec.className = 'esc-academy-overlay';
      sec.setAttribute('role', 'dialog');
      sec.setAttribute('aria-modal', 'true');
      sec.setAttribute('aria-label', 'Academia Escrevaral');
      sec.hidden = true;
      document.body.appendChild(sec);
      modalEl = sec;

      on(document, 'keydown', function (ev) {
        if (!modalEl || modalEl.hidden) { return; }
        if (ev.keyCode === 27) {
          ev.preventDefault();
          ev.stopPropagation();
          close();
        }
      });

      function postThemeToFrame(frameEl, entryObj) {
        if (!frameEl || !frameEl.contentWindow || !frameEl.contentWindow.postMessage) { return; }
        try {
          var body = document.body;
          var isDark = !!(body && body.getAttribute('data-theme') === 'escuro');
          var paper = isDark ? '#211a14' : '#cfc3ae';
          var ink = isDark ? '#d9cebc' : '#1f130b';
          var accent = isDark ? '#c49a58' : (entryObj && entryObj.id === 'literatura-mundial' ? '#3a2013' : '#8b5a1e');
          frameEl.contentWindow.postMessage({ channel: 'escrevaral-academia-theme', dark: isDark, colors: { paper: paper, ink: ink, accent: accent }, comfortable: !!(body && body.getAttribute('data-esc-reading') === 'comfortable') }, '*');
        } catch (ignore) {}
      }

      on(window, 'message', function (ev) {
        if (!modalEl || modalEl.hidden || !ev.data || ev.data.channel !== 'escrevaral-academia') { return; }
        if (ev.data.action === 'close') { close(); }
        else if (ev.data.action === 'back') { openList(); }
        else if (ev.data.action === 'open' && ev.data.id) { openGuide(ev.data.id); }
        else if (ev.data.action === 'theme') {
          var activeFrame = modalEl.querySelector ? modalEl.querySelector('iframe.esc-academy-frame') : null;
          postThemeToFrame(activeFrame, activeEntry);
        }
      });

      return modalEl;
    }

    function openList() {
      buildModal();
      stopParallax();
      if (!prevFocus) { prevFocus = document.activeElement; }
      currentMode = 'list';
      activeEntry = null;
      modalEl.textContent = '';

      var card = document.createElement('div');
      card.className = 'esc-academy-list-card';
      if (root.Escr.ornaments && root.Escr.ornaments.attachCorners) {
        root.Escr.ornaments.attachCorners(card, 'gilded');
      }

      var scrollBody = document.createElement('div');
      scrollBody.className = 'esc-academy-groups';

      /* Hero panorâmico estilo livro ilustrado com 4 camadas parallax */
      var hero = document.createElement('header');
      hero.className = 'esc-academy-hero';
      var sceneInfo = buildHeroScene();
      hero.appendChild(sceneInfo.stage);

      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'esc-academy-close';
      closeBtn.textContent = '← Voltar · Esc';
      on(closeBtn, 'click', close);
      hero.appendChild(closeBtn);

      var heroInner = document.createElement('div');
      heroInner.className = 'esc-academy-hero-inner';
      var crest = document.createElement('div');
      crest.className = 'esc-academy-crest';
      crest.appendChild(makeEmblemSvg('crest'));
      heroInner.appendChild(crest);
      var heroKicker = document.createElement('span');
      heroKicker.className = 'esc-academy-hero-kicker';
      heroKicker.textContent = 'Oficina de Belas Letras · Acervo Offline';
      heroInner.appendChild(heroKicker);
      var h2 = document.createElement('h2');
      h2.textContent = 'Academia e Literatura Mundial';
      heroInner.appendChild(h2);
      var intro = document.createElement('p');
      intro.className = 'esc-academy-intro';
      intro.textContent = 'Anatomia do livro, clássicos da literatura mundial e guias editoriais para cada passo da sua obra.';
      heroInner.appendChild(intro);
      hero.appendChild(heroInner);
      scrollBody.appendChild(hero);

      var contentWrap = document.createElement('div');
      contentWrap.className = 'esc-academy-content';

      /* Ponte contextual Academia ↔ Oficina (lê apenas resumo métrico local, jamais exposto aos iframes) */
      var lastId = readLastGuideId();
      var lastEntry = lastId ? findEntry(lastId) : null;
      var rec = getContext ? recommendForContext(getContext()) : null;
      if (rec || lastEntry) {
        var bridgeBox = document.createElement('section');
        bridgeBox.className = 'esc-academy-bridge-box';
        bridgeBox.setAttribute('aria-label', 'Sugestões para o momento da sua oficina');

        var bHead = document.createElement('div');
        bHead.className = 'esc-academy-bridge-head';
        var bKicker = document.createElement('span');
        bKicker.className = 'esc-academy-bridge-kicker';
        bKicker.textContent = rec ? ('Na sua oficina · ' + rec.stageLabel) : 'Na sua oficina';
        bHead.appendChild(bKicker);
        if (lastEntry) {
          var resumeBtn = document.createElement('button');
          resumeBtn.type = 'button';
          resumeBtn.className = 'esc-academy-resume-btn';
          resumeBtn.setAttribute('data-academy-resume', lastEntry.id);
          resumeBtn.textContent = 'Continuar: ' + lastEntry.title + ' →';
          on(resumeBtn, 'click', function () { openGuide(lastEntry.id); });
          bHead.appendChild(resumeBtn);
        }
        bridgeBox.appendChild(bHead);

        if (rec) {
          var bNote = document.createElement('p');
          bNote.className = 'esc-academy-bridge-note';
          bNote.textContent = rec.stageNote;
          bridgeBox.appendChild(bNote);

          var recRow = document.createElement('div');
          recRow.className = 'esc-academy-rec-row';
          var ri;
          for (ri = 0; ri < rec.guides.length; ri += 1) {
            (function (g) {
              var rBtn = document.createElement('button');
              rBtn.type = 'button';
              rBtn.className = 'esc-academy-rec-btn';
              rBtn.setAttribute('data-academy-rec', g.id);
              var rTitle = document.createElement('strong');
              rTitle.textContent = g.title;
              var rHint = document.createElement('span');
              rHint.textContent = (g.bridge && g.bridge.hint) ? g.bridge.hint : g.description;
              rBtn.appendChild(rTitle);
              rBtn.appendChild(rHint);
              on(rBtn, 'click', function () { openGuide(g.id); });
              recRow.appendChild(rBtn);
            }(rec.guides[ri]));
          }
          bridgeBox.appendChild(recRow);
        }

        contentWrap.appendChild(bridgeBox);
        if (root.Escr.ornaments && root.Escr.ornaments.createStairRod) {
          contentWrap.appendChild(root.Escr.ornaments.createStairRod('wide'));
        }
      }

      /* Vitrine em destaque: os 2 grandes tomos interativos (Objeto livro + Literatura mundial) */
      var featuredIds = ['objeto-livro', 'literatura-mundial'];
      var featuredMeta = {
        'objeto-livro': { seal: 'Exploração visual', cta: 'Abrir anatomia →', art: 'assets/library/tome-objeto-livro.webp' },
        'literatura-mundial': { seal: 'Leitor próprio', cta: 'Entrar na biblioteca →', art: 'assets/library/tome-literatura-mundial.webp' }
      };
      var featWrap = document.createElement('section');
      featWrap.className = 'esc-academy-featured';
      featWrap.setAttribute('aria-label', 'Coleções em destaque');
      var featHead = document.createElement('h3');
      featHead.className = 'esc-academy-group';
      featHead.appendChild(makeGroupIcon('Literatura'));
      var featTitle = document.createElement('span');
      featTitle.textContent = 'Salão Principal · Livro e Literatura';
      featHead.appendChild(featTitle);
      featWrap.appendChild(featHead);

      var featGrid = document.createElement('div');
      featGrid.className = 'esc-academy-featured-grid';
      var fi;
      for (fi = 0; fi < featuredIds.length; fi += 1) {
        (function (entry) {
          if (!entry) { return; }
          var meta = featuredMeta[entry.id] || { seal: 'Guia', cta: 'Abrir →', art: '' };
          var fBtn = document.createElement('button');
          fBtn.type = 'button';
          fBtn.className = 'esc-academy-tome';
          fBtn.setAttribute('data-academy-id', entry.id);
          fBtn.setAttribute('data-tome', entry.id);
          if (meta.art && !isPortableDoc()) {
            var fArt = document.createElement('img');
            fArt.className = 'esc-academy-tome-art';
            fArt.src = meta.art;
            fArt.alt = '';
            fArt.setAttribute('aria-hidden', 'true');
            fArt.setAttribute('decoding', 'async');
            on(fArt, 'error', function () { fArt.hidden = true; });
            fBtn.appendChild(fArt);
          }
          var fTop = document.createElement('div');
          fTop.className = 'esc-academy-tome-top';
          var fEmb = document.createElement('span');
          fEmb.className = 'esc-academy-tome-emblem';
          fEmb.appendChild(makeEmblemSvg(entry.id));
          fTop.appendChild(fEmb);
          var fSeal = document.createElement('span');
          fSeal.className = 'esc-academy-tome-seal';
          fSeal.textContent = meta.seal;
          fTop.appendChild(fSeal);
          fBtn.appendChild(fTop);
          var fStrong = document.createElement('strong');
          fStrong.textContent = entry.title;
          fBtn.appendChild(fStrong);
          var fDesc = document.createElement('span');
          fDesc.className = 'esc-academy-tome-desc';
          fDesc.textContent = entry.description;
          fBtn.appendChild(fDesc);
          var fCta = document.createElement('span');
          fCta.className = 'esc-academy-tome-cta';
          fCta.textContent = meta.cta;
          fBtn.appendChild(fCta);
          on(fBtn, 'click', function () { openGuide(entry.id); });
          featGrid.appendChild(fBtn);
        }(findEntry(featuredIds[fi])));
      }
      featWrap.appendChild(featGrid);
      contentWrap.appendChild(featWrap);

      /* Demais guias organizados como capítulos iluminados com numeração romana */
      var lastGroup = '', ul = null, chapIdx = 0;
      CATALOG.forEach(function (entry) {
        if (featuredIds.indexOf(entry.id) !== -1) { return; }
        if (entry.group !== lastGroup) {
          if (root.Escr.ornaments && root.Escr.ornaments.createStairRod) {
            contentWrap.appendChild(root.Escr.ornaments.createStairRod('wide'));
          }
          lastGroup = entry.group;
          var gh = document.createElement('h3');
          gh.className = 'esc-academy-group';
          gh.appendChild(makeGroupIcon(lastGroup));
          var gt = document.createElement('span');
          gt.textContent = lastGroup;
          gh.appendChild(gt);
          contentWrap.appendChild(gh);
          ul = document.createElement('ul');
          ul.className = 'esc-academy-list';
          contentWrap.appendChild(ul);
        }
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'esc-academy-item';
        btn.setAttribute('data-academy-id', entry.id);
        var num = document.createElement('em');
        num.className = 'esc-academy-roman';
        num.setAttribute('aria-hidden', 'true');
        num.textContent = ROMAN[chapIdx] || String(chapIdx + 1);
        chapIdx += 1;
        btn.appendChild(num);
        var strong = document.createElement('strong');
        strong.textContent = entry.title;
        var desc = document.createElement('span');
        desc.textContent = entry.description;
        btn.appendChild(strong);
        btn.appendChild(desc);
        on(btn, 'click', function () { openGuide(entry.id); });
        li.appendChild(btn);
        ul.appendChild(li);
      });

      if (root.Escr.ornaments && root.Escr.ornaments.createColophon) {
        var foot = document.createElement('footer');
        foot.className = 'esc-academy-colophon';
        foot.appendChild(root.Escr.ornaments.createColophon());
        contentWrap.appendChild(foot);
      }

      scrollBody.appendChild(contentWrap);
      card.appendChild(scrollBody);
      modalEl.appendChild(card);
      modalEl.hidden = false;

      /* Motor leve de parallax em mouse + scroll (respeita prefers-reduced-motion e limpa ao fechar) */
      if (!prefersReducedMotion() && hero.addEventListener && scrollBody.addEventListener) {
        var targetX = 0, targetY = 0, scrollY = 0, rafId = 0;
        function paintParallax() {
          rafId = 0;
          var li2, layer, depth, tx, ty;
          for (li2 = 0; li2 < sceneInfo.layers.length; li2 += 1) {
            layer = sceneInfo.layers[li2];
            if (!layer.style) { continue; }
            depth = Number(layer.getAttribute('data-depth')) || 0.25;
            tx = (targetX * 18 * depth).toFixed(1);
            ty = (targetY * 12 * depth + Math.min(180, scrollY) * 0.28 * depth).toFixed(1);
            layer.style.transform = 'translate3d(' + tx + 'px, ' + ty + 'px, 0)';
          }
        }
        function scheduleParallax() {
          if (rafId) { return; }
          if (window.requestAnimationFrame) { rafId = window.requestAnimationFrame(paintParallax); }
          else { paintParallax(); }
        }
        function onMouseMove(ev) {
          if (!hero.getBoundingClientRect) { return; }
          var r = hero.getBoundingClientRect();
          if (!r.width || !r.height) { return; }
          targetX = Math.max(-1, Math.min(1, ((ev.clientX - r.left) / r.width) * 2 - 1));
          targetY = Math.max(-1, Math.min(1, ((ev.clientY - r.top) / r.height) * 2 - 1));
          scheduleParallax();
        }
        function onMouseLeave() {
          targetX = 0; targetY = 0;
          scheduleParallax();
        }
        function onScroll() {
          scrollY = scrollBody.scrollTop || 0;
          scheduleParallax();
        }
        hero.addEventListener('mousemove', onMouseMove, false);
        hero.addEventListener('mouseleave', onMouseLeave, false);
        scrollBody.addEventListener('scroll', onScroll, false);
        cleanupParallax = function () {
          if (rafId && window.cancelAnimationFrame) { window.cancelAnimationFrame(rafId); rafId = 0; }
          if (hero.removeEventListener) {
            hero.removeEventListener('mousemove', onMouseMove, false);
            hero.removeEventListener('mouseleave', onMouseLeave, false);
          }
          if (scrollBody.removeEventListener) {
            scrollBody.removeEventListener('scroll', onScroll, false);
          }
        };
      }

      closeBtn.focus();
    }

    function openGuide(id) {
      var entry = findEntry(id);
      if (!entry) { return; }
      buildModal();
      stopParallax();
      if (!prevFocus) { prevFocus = document.activeElement; }
      currentMode = 'guide';
      activeEntry = entry;
      writeLastGuideId(entry.id);
      modalEl.textContent = '';

      var shell = document.createElement('div');
      shell.className = 'esc-academy-guide-shell';

      var bar = document.createElement('header');
      bar.className = 'esc-academy-bar';
      var backBtn = document.createElement('button');
      backBtn.type = 'button';
      backBtn.textContent = '← Voltar à Academia';
      on(backBtn, 'click', openList);
      var titleSpan = document.createElement('strong');
      titleSpan.textContent = entry.title;
      var actions = document.createElement('div');
      actions.className = 'esc-academy-bar-actions';
      if (entry.bridge && onAction) {
        if (entry.bridge.lenses && entry.bridge.lenses.length) {
          entry.bridge.lenses.forEach(function (lensOpt) {
            var lb = document.createElement('button');
            lb.type = 'button';
            lb.className = 'esc-academy-lens-jump';
            lb.setAttribute('data-academy-lens', lensOpt.id);
            lb.title = 'Examinar sua folha com a lente ' + lensOpt.label;
            lb.textContent = lensOpt.label;
            on(lb, 'click', function () {
              var guideEntry = entry;
              var chosenLens = lensOpt.id;
              close();
              onAction('examine-lens', guideEntry, chosenLens);
            });
            actions.appendChild(lb);
          });
        }
        var actBtn = document.createElement('button');
        actBtn.type = 'button';
        actBtn.className = 'esc-academy-bridge-act';
        actBtn.setAttribute('data-academy-action', entry.bridge.action);
        actBtn.title = entry.bridge.hint || '';
        actBtn.textContent = entry.bridge.label + ' →';
        on(actBtn, 'click', function () {
          var actionId = entry.bridge.action;
          var guideEntry = entry;
          close();
          onAction(actionId, guideEntry);
        });
        actions.appendChild(actBtn);
      }
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.textContent = 'Fechar · Esc';
      on(closeBtn, 'click', close);
      actions.appendChild(closeBtn);
      bar.appendChild(backBtn);
      bar.appendChild(titleSpan);
      bar.appendChild(actions);
      shell.appendChild(bar);

      if (isPortableDoc()) {
        var portBox = document.createElement('div');
        portBox.className = 'esc-academy-portable-note';
        var portH = document.createElement('h3');
        portH.textContent = entry.title;
        var portP1 = document.createElement('p');
        portP1.textContent = 'Você está usando a mesa portátil autocontida (escrevaral.html). Ela traz o editor completo, as lentes de revisão, o Cartório e o Modo Leitura para trabalhar 100% sem internet.';
        var portP2 = document.createElement('p');
        portP2.textContent = 'Os 14 guias ilustrados da Academia e Literatura ficam disponíveis na versão instalada do site (escrevaral.com), que também guarda os guias no navegador para leitura offline.';
        portBox.appendChild(portH);
        portBox.appendChild(portP1);
        portBox.appendChild(portP2);
        shell.appendChild(portBox);
      } else {
        var frame = document.createElement('iframe');
        frame.className = 'esc-academy-frame';
        frame.title = entry.title;
        frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
        on(frame, 'load', function () {
          try {
            var body = document.body;
            var isDark = !!(body && body.getAttribute('data-theme') === 'escuro');
            var paper = isDark ? '#211a14' : '#cfc3ae';
            var ink = isDark ? '#d9cebc' : '#1f130b';
            var accent = isDark ? '#c49a58' : (entry.id === 'literatura-mundial' ? '#3a2013' : '#8b5a1e');
            if (frame.contentWindow && frame.contentWindow.postMessage) {
              frame.contentWindow.postMessage({ channel: 'escrevaral-academia-theme', dark: isDark, colors: { paper: paper, ink: ink, accent: accent }, comfortable: !!(body && body.getAttribute('data-esc-reading') === 'comfortable') }, '*');
            }
          } catch (ignore) {}
        });
        frame.src = 'academia/' + entry.file;
        shell.appendChild(frame);
      }

      modalEl.appendChild(shell);
      modalEl.hidden = false;
      backBtn.focus();
    }

    function close() {
      stopParallax();
      currentMode = null;
      activeEntry = null;
      if (modalEl) {
        modalEl.hidden = true;
        modalEl.textContent = '';
      }
      if (prevFocus && prevFocus.focus) { prevFocus.focus(); }
      prevFocus = null;
    }

    return {
      openList: openList,
      openGuide: openGuide,
      close: close,
      isOpen: function () { return !!(modalEl && !modalEl.hidden); }
    };
  };
}(typeof window !== 'undefined' ? window : this));
