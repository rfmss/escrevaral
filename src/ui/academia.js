(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var CATALOG = [
    { id: 'objeto-livro', title: 'Objeto livro', group: 'Objeto livro', description: 'Da capa ao colofão, explore cada parte.', file: 'anatomia-do-livro.html' },
    { id: 'literatura-mundial', title: 'Literatura mundial', group: 'Literatura', description: 'Percorra épocas e leia textos que abrem caminhos para escrever.', file: 'literatura-mundial.html', module: 'literature' },
    { id: 'primeiras-linhas', title: 'Começar um livro', group: 'Escrita e revisão', description: 'Da primeira linha ao primeiro capítulo.', file: 'primeiras-linhas.html' },
    { id: 'titulo-do-livro', title: 'Escolher o título', group: 'Escrita e revisão', description: 'Explore caminhos para dar nome à obra.', file: 'titulo-do-livro.html' },
    { id: 'bloqueio-criativo', title: 'Bloqueio criativo', group: 'Escrita e revisão', description: 'Encontre uma forma de retomar a escrita.', file: 'bloqueio-criativo.html' },
    { id: 'revisao-manuscrito', title: 'Revisar o manuscrito', group: 'Escrita e revisão', description: 'Revise em camadas, sem perder o fio.', file: 'revisao-manuscrito.html' },
    { id: 'biblioteca-escrita', title: 'Biblioteca da escrita', group: 'Escrita e revisão', description: 'Conheça referências e critérios de leitura.', file: 'biblioteca-escrita.html' },
    { id: 'mapa-lancamento-editorial', title: 'Mapa de lançamento', group: 'Publicação e carreira', description: 'Guia para transformar manuscrito em projeto de publicação, com decisão entre caminho independente e editorial.', file: 'mapa-lancamento-editorial.html' },
    { id: 'autopublicacao-independente', title: 'Autopublicação independente', group: 'Publicação e carreira', description: 'Guia para publicar por conta própria com revisão, capa, distribuição, preço e audiência.', file: 'autopublicacao-independente.html' },
    { id: 'submissao-editoras', title: 'Submissão a editoras', group: 'Publicação e carreira', description: 'Guia para preparar manuscrito, sinopse, proposta editorial e abordagem a editoras.', file: 'submissao-editoras.html' },
    { id: 'comparativo-publicacao', title: 'Comparativo de publicação', group: 'Publicação e carreira', description: 'Guia para comparar publicação independente, tradicional e híbrida.', file: 'comparativo-publicacao.html' },
    { id: 'checklist-lancamento', title: 'Checklist de lançamento', group: 'Publicação e carreira', description: 'Guia para conferir manuscrito, capa, ISBN, sinopse e comunicação.', file: 'checklist-lancamento.html' },
    { id: 'mentalidade-autor-publicado', title: 'Mentalidade de autor', group: 'Publicação e carreira', description: 'Guia para lidar com perfeccionismo, rejeição e continuidade de carreira.', file: 'mentalidade-autor-publicado.html' },
    { id: 'publicar-kdp', title: 'Publicar no Amazon KDP', group: 'Publicação e carreira', description: 'Guia para publicar seu livro no Kindle Direct Publishing, do título à precificação.', file: 'publicar-kdp.html' }
  ];

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }

  function findEntry(id) {
    var i;
    for (i = 0; i < CATALOG.length; i += 1) {
      if (CATALOG[i].id === id) { return CATALOG[i]; }
    }
    return null;
  }

  root.Escr.academy = {
    catalog: function () { return CATALOG.slice(); },
    find: findEntry
  };

  root.Escr.mountAcademy = function () {
    var modalEl = null;
    var currentMode = null;
    var activeEntry = null;
    var prevFocus = null;

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

      var head = document.createElement('header');
      head.className = 'esc-academy-head';
      var h2 = document.createElement('h2');
      h2.textContent = 'Academia e Literatura Mundial';
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'esc-academy-close';
      closeBtn.textContent = 'Fechar · Esc';
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
      var lastGroup = '', ul = null;
      CATALOG.forEach(function (entry) {
        if (entry.group !== lastGroup) {
          lastGroup = entry.group;
          var gh = document.createElement('h3');
          gh.className = 'esc-academy-group';
          gh.textContent = lastGroup;
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
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.textContent = 'Fechar · Esc';
      on(closeBtn, 'click', close);
      bar.appendChild(backBtn);
      bar.appendChild(titleSpan);
      bar.appendChild(closeBtn);
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
