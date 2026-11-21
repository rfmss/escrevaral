(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var LAST_GUIDE_KEY = 'escrevaral.academy.last.v1';

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
      bridge: { action: 'cartorio', label: 'Conferir Cartório da obra', hint: 'Revise a certificação de autoria antes de decidir o caminho.' } },
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

  function makeGroupIcon(groupName) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS ? document.createElementNS(ns, 'svg') : document.createElement('svg');
    svg.setAttribute('class', 'esc-ui-ico');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.75');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var d = GROUP_ICONS[groupName] || GROUP_ICONS['Objeto livro'];
    var parts = d.split(' M');
    var i;
    for (i = 0; i < parts.length; i += 1) {
      var p = document.createElementNS ? document.createElementNS(ns, 'path') : document.createElement('path');
      p.setAttribute('d', (i === 0 ? '' : 'M') + parts[i]);
      svg.appendChild(p);
    }
    return svg;
  }

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

      on(window, 'message', function (ev) {
        if (!modalEl || modalEl.hidden || !ev.data || ev.data.channel !== 'escrevaral-academia') { return; }
        if (ev.data.action === 'close') { close(); }
        else if (ev.data.action === 'back') { openList(); }
        else if (ev.data.action === 'open' && ev.data.id) { openGuide(ev.data.id); }
      });

      return modalEl;
    }

    function openList() {
      buildModal();
      if (!prevFocus) { prevFocus = document.activeElement; }
      currentMode = 'list';
      activeEntry = null;
      modalEl.textContent = '';

      var card = document.createElement('div');
      card.className = 'esc-academy-list-card';
      if (root.Escr.ornaments && root.Escr.ornaments.attachCorners) {
        root.Escr.ornaments.attachCorners(card, 'subtle');
      }

      var head = document.createElement('header');
      head.className = 'esc-academy-head';
      var h2 = document.createElement('h2');
      h2.textContent = 'Academia e Literatura Mundial';
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'esc-academy-close';
      closeBtn.textContent = '← Voltar · Esc';
      on(closeBtn, 'click', close);
      head.appendChild(h2);
      head.appendChild(closeBtn);
      card.appendChild(head);

      var intro = document.createElement('p');
      intro.className = 'esc-academy-intro';
      intro.textContent = 'Guias editoriais offline, anatomia do livro e acervo de literatura mundial com leitor próprio.';
      card.appendChild(intro);

      var body = document.createElement('div');
      body.className = 'esc-academy-groups';

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

        body.appendChild(bridgeBox);
        if (root.Escr.ornaments && root.Escr.ornaments.createStairRod) {
          body.appendChild(root.Escr.ornaments.createStairRod('wide'));
        }
      }

      var lastGroup = '', ul = null, groupCount = 0;
      CATALOG.forEach(function (entry) {
        if (entry.group !== lastGroup) {
          if (groupCount > 0 && root.Escr.ornaments && root.Escr.ornaments.createStairRod) {
            body.appendChild(root.Escr.ornaments.createStairRod('wide'));
          }
          groupCount += 1;
          lastGroup = entry.group;
          var gh = document.createElement('h3');
          gh.className = 'esc-academy-group';
          gh.appendChild(makeGroupIcon(lastGroup));
          var gt = document.createElement('span');
          gt.textContent = lastGroup;
          gh.appendChild(gt);
          body.appendChild(gh);
          ul = document.createElement('ul');
          ul.className = 'esc-academy-list';
          body.appendChild(ul);
        }
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'esc-academy-item';
        btn.setAttribute('data-academy-id', entry.id);
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
      card.appendChild(body);
      modalEl.appendChild(card);
      modalEl.hidden = false;
      closeBtn.focus();
    }

    function openGuide(id) {
      var entry = findEntry(id);
      if (!entry) { return; }
      buildModal();
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

      var frame = document.createElement('iframe');
      frame.className = 'esc-academy-frame';
      frame.title = entry.title;
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      on(frame, 'load', function () {
        try {
          var body = document.body;
          var cs = window.getComputedStyle && body ? window.getComputedStyle(body) : null;
          var paper = cs ? (cs.getPropertyValue('--esc-bg') || '#c4cfc2').replace(/^\s+|\s+$/g, '') : '#c4cfc2';
          var ink = cs ? (cs.getPropertyValue('--esc-ink') || '#212921').replace(/^\s+|\s+$/g, '') : '#212921';
          var accent = cs ? (cs.getPropertyValue('--esc-weave-bg') || '#242d23').replace(/^\s+|\s+$/g, '') : '#242d23';
          if (frame.contentWindow && frame.contentWindow.postMessage) {
            frame.contentWindow.postMessage({ channel: 'escrevaral-academia-theme', colors: { paper: paper, ink: ink, accent: accent }, comfortable: !!(body && body.getAttribute('data-esc-reading') === 'comfortable') }, '*');
          }
        } catch (ignore) {}
      });
      frame.src = 'academia/' + entry.file;
      shell.appendChild(frame);

      modalEl.appendChild(shell);
      modalEl.hidden = false;
      backBtn.focus();
    }

    function close() {
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
