(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }

  function renderReferenceMarkdown(container, titleText, rawText, onDeleteRef) {
    if (!container) { return; }
    container.textContent = '';

    var head = document.createElement('header');
    head.className = 'esc-reference-head';
    var badge = document.createElement('span');
    badge.className = 'esc-reference-badge';
    badge.textContent = 'Referência · conteúdo fixo para consulta';
    head.appendChild(badge);
    if (typeof onDeleteRef === 'function') {
      var delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'esc-reference-delete';
      delBtn.textContent = 'Excluir referência';
      on(delBtn, 'click', onDeleteRef);
      head.appendChild(delBtn);
    }
    container.appendChild(head);

    var article = document.createElement('div');
    article.className = 'esc-reference-body';
    if (titleText) {
      var h1 = document.createElement('h1');
      h1.textContent = titleText;
      article.appendChild(h1);
    }
    var lines = String(rawText || '').split(/\r?\n/);
    var i, line, trimmed;
    for (i = 0; i < lines.length; i += 1) {
      line = lines[i];
      trimmed = line.replace(/^\s+|\s+$/g, '');
      if (!trimmed) { continue; }
      if (/^###\s+/.test(trimmed)) {
        var h3 = document.createElement('h3');
        h3.textContent = trimmed.replace(/^###\s+/, '');
        article.appendChild(h3);
      } else if (/^##\s+/.test(trimmed)) {
        var h2 = document.createElement('h2');
        h2.textContent = trimmed.replace(/^##\s+/, '');
        article.appendChild(h2);
      } else if (/^#\s+/.test(trimmed)) {
        var topH = document.createElement('h2');
        topH.textContent = trimmed.replace(/^#\s+/, '');
        article.appendChild(topH);
      } else if (/^>\s+/.test(trimmed)) {
        var bq = document.createElement('blockquote');
        bq.textContent = trimmed.replace(/^>\s+/, '');
        article.appendChild(bq);
      } else if (/^---+$/.test(trimmed)) {
        article.appendChild(document.createElement('hr'));
      } else {
        var p = document.createElement('p');
        var parts = trimmed.split(/(https?:\/\/[^\s)]+)/g);
        var j;
        for (j = 0; j < parts.length; j += 1) {
          if (/^https?:\/\//.test(parts[j])) {
            var a = document.createElement('a');
            a.href = parts[j];
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = parts[j];
            p.appendChild(a);
          } else if (parts[j]) {
            p.appendChild(document.createTextNode(parts[j]));
          }
        }
        article.appendChild(p);
      }
    }
    container.appendChild(article);
  }

  root.Escr.renderReferenceView = renderReferenceMarkdown;

  root.Escr.mountTemplatesModal = function (opts) {
    var modalEl = null;
    var selectedTemplateId = 'livro-ficcao';
    var selectedPaletteId = 'salvia';
    var selectedFormat = 'rich';
    var customNameEdited = false;

    function buildModal() {
      if (modalEl) { return modalEl; }
      var overlay = document.createElement('div');
      overlay.id = 'esc-template-modal';
      overlay.hidden = true;
      overlay.innerHTML =
        '<section class="esc-template-dialog" role="dialog" aria-modal="true" aria-labelledby="esc-tpl-heading">' +
          '<header class="esc-template-header">' +
            '<div><p class="esc-template-eyebrow">ESCREVARAL · NOVO PROJETO</p><h1 id="esc-tpl-heading">Escolha um modelo para começar</h1></div>' +
            '<button id="esc-tpl-close" type="button" class="material-key" aria-label="Fechar modelos">×</button>' +
          '</header>' +
          '<form id="esc-tpl-form">' +
            '<div class="esc-template-body">' +
              '<p id="esc-tpl-intro">Cada modelo cria pastas e folhas iniciais com instruções clicáveis. Você pode renomear, mover ou apagar qualquer parte.</p>' +
              '<fieldset class="esc-tpl-fieldset">' +
                '<legend>O que você quer escrever?</legend>' +
                '<div id="esc-tpl-grid" class="esc-tpl-list"></div>' +
              '</fieldset>' +
              '<div class="esc-tpl-fields">' +
                '<label for="esc-tpl-name">Nome do projeto<input id="esc-tpl-name" type="text" maxlength="120" autocomplete="off"></label>' +
                '<div class="esc-tpl-format-row">' +
                  '<span>Formato dos textos</span>' +
                  '<div class="esc-tpl-format-options" role="radiogroup" aria-label="Formato dos textos">' +
                    '<label class="esc-tpl-format-choice"><input type="radio" name="esc-tpl-format" value="rich" checked> Texto formatado (padrão)</label>' +
                    '<label class="esc-tpl-format-choice"><input type="radio" name="esc-tpl-format" value="plain"> Texto simples</label>' +
                  '</div>' +
                '</div>' +
                '<div class="esc-tpl-palette-row"><span>Cor da lombada</span><div id="esc-tpl-palettes" class="esc-color-swatches"></div></div>' +
              '</div>' +
              '<p id="esc-tpl-error" class="esc-tpl-error" role="status"></p>' +
            '</div>' +
            '<footer class="esc-template-footer">' +
              '<button id="esc-tpl-blank" type="button" class="esc-tpl-quiet">Criar caderno em branco…</button>' +
              '<button id="esc-tpl-cancel" type="button">Cancelar</button>' +
              '<button id="esc-tpl-submit" type="submit" class="esc-tpl-primary">Criar projeto</button>' +
            '</footer>' +
          '</form>' +
        '</section>';
      document.body.appendChild(overlay);
      modalEl = overlay;

      on(byId('esc-tpl-close'), 'click', hide);
      on(byId('esc-tpl-cancel'), 'click', hide);
      on(modalEl, 'click', function (ev) { if (ev.target === modalEl) { hide(); } });
      on(modalEl, 'keydown', function (ev) {
        if (ev.keyCode === 27) { ev.preventDefault(); ev.stopPropagation(); hide(); }
      });
      on(byId('esc-tpl-blank'), 'click', function () {
        hide();
        if (opts.onBlankProject) { opts.onBlankProject(); }
      });
      var nameInput = byId('esc-tpl-name');
      on(nameInput, 'input', function () { customNameEdited = true; });
      var fmtRadios = modalEl.querySelectorAll('input[name="esc-tpl-format"]');
      var fi;
      for (fi = 0; fi < fmtRadios.length; fi += 1) {
        (function (r) {
          on(r, 'change', function () { if (r.checked) { selectedFormat = r.value; } });
        }(fmtRadios[fi]));
      }
      on(byId('esc-tpl-form'), 'submit', function (ev) {
        ev.preventDefault();
        var errEl = byId('esc-tpl-error');
        errEl.textContent = '';
        try {
          var created = root.Escr.templates.createProject(
            opts.notebooks,
            opts.archive,
            selectedTemplateId,
            nameInput.value,
            selectedPaletteId,
            opts.originalId ? opts.originalId() : null,
            selectedFormat
          );
          hide();
          if (opts.onCreated) { opts.onCreated(created); }
        } catch (e) {
          errEl.textContent = e && e.message ? e.message : 'Não foi possível criar este projeto.';
        }
      });

      return modalEl;
    }

    function renderGrid() {
      var grid = byId('esc-tpl-grid');
      var nameInput = byId('esc-tpl-name');
      if (!grid || !root.Escr.templates) { return; }
      grid.textContent = '';
      var list = root.Escr.templates.list();
      list.forEach(function (tpl) {
        var lbl = document.createElement('label');
        var active = tpl.id === selectedTemplateId;
        lbl.className = 'esc-template-option' + (active ? ' is-selected' : '');

        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'esc-tpl-choice';
        radio.value = tpl.id;
        radio.checked = active;
        on(radio, 'change', function () {
          if (!radio.checked) { return; }
          selectedTemplateId = tpl.id;
          if (!customNameEdited && nameInput) { nameInput.value = tpl.defaultProjectName || ''; }
          renderGrid();
        });
        lbl.appendChild(radio);

        var body = document.createElement('div');
        body.className = 'esc-tpl-option-body';
        var top = document.createElement('div');
        top.className = 'esc-tpl-option-top';
        var strong = document.createElement('strong');
        strong.textContent = tpl.title;
        top.appendChild(strong);

        if (tpl.id === 'redacao-enem' || /enem/i.test(tpl.id) || /enem/i.test(tpl.title)) {
          var logo = document.createElement('img');
          logo.className = 'esc-template-enem-logo';
          logo.src = 'assets/study/enem-logo.png';
          logo.alt = 'Enem';
          logo.onerror = function () { logo.style.display = 'none'; };
          top.appendChild(logo);
        }
        body.appendChild(top);

        var desc = document.createElement('span');
        desc.className = 'esc-tpl-option-desc';
        desc.textContent = tpl.description || '';
        body.appendChild(desc);

        lbl.appendChild(body);
        grid.appendChild(lbl);
      });
    }

    function renderPalettes() {
      var wrap = byId('esc-tpl-palettes');
      if (!wrap || !root.Escr.projectColors) { return; }
      wrap.textContent = '';
      root.Escr.projectColors.list().forEach(function (pal) {
        var sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'esc-swatch';
        sw.title = pal.name;
        sw.setAttribute('aria-label', 'Cor ' + pal.name);
        sw.setAttribute('aria-pressed', pal.id === selectedPaletteId ? 'true' : 'false');
        sw.style.backgroundColor = pal.color;
        on(sw, 'click', function () { selectedPaletteId = pal.id; renderPalettes(); });
        wrap.appendChild(sw);
      });
    }

    function open() {
      buildModal();
      customNameEdited = false;
      var tpl = root.Escr.templates && root.Escr.templates.find(selectedTemplateId);
      var nameInput = byId('esc-tpl-name');
      if (nameInput && tpl) { nameInput.value = tpl.defaultProjectName || ''; }
      var errEl = byId('esc-tpl-error');
      if (errEl) { errEl.textContent = ''; }
      renderGrid();
      renderPalettes();
      modalEl.hidden = false;
      if (nameInput && nameInput.focus) { nameInput.focus(); }
    }

    function hide() {
      if (modalEl) { modalEl.hidden = true; }
    }

    if (opts.manuscriptEl && root.Escr.templates) {
      on(opts.manuscriptEl, 'click', function () {
        var ta = opts.manuscriptEl;
        if (ta.readOnly || ta.disabled || ta.selectionStart !== ta.selectionEnd) { return; }
        var hit = root.Escr.templates.placeholderAt(ta.value, ta.selectionStart);
        if (hit) { root.Escr.templates.clearTextareaPlaceholder(ta, hit); }
      });
    }

    return {
      open: open,
      hide: hide,
      isOpen: function () { return !!(modalEl && !modalEl.hidden); }
    };
  };
}(typeof window !== 'undefined' ? window : this));
