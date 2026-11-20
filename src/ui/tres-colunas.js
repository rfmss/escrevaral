/* Interface de três colunas fiel ao Escrevaral Linux — ES5 estrito */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var STORAGE_KEY = 'escrevaral.astra.workspace.v1';

  function byId(id) { return document.getElementById(id); }
  function setText(el, str) { if (el) { el.textContent = str; } }
  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }

  function createEl(tag, className, textValue) {
    var el = document.createElement(tag);
    if (className) { el.className = className; }
    if (typeof textValue === 'string') { el.textContent = textValue; }
    return el;
  }

  function svgIcon(pathD, viewBox) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS ? document.createElementNS(ns, 'svg') : document.createElement('svg');
    svg.setAttribute('class', 'esc-icon');
    svg.setAttribute('viewBox', viewBox || '0 0 256 256');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var p = document.createElementNS ? document.createElementNS(ns, 'path') : document.createElement('path');
    p.setAttribute('d', pathD);
    svg.appendChild(p);
    return svg;
  }

  var ICONS = {
    folder: 'M216,74H130L101.73,52.8a14,14,0,0,0-8.4-2.8H40A14,14,0,0,0,26,64V200a14,14,0,0,0,14,14H216.89A13.12,13.12,0,0,0,230,200.89V88A14,14,0,0,0,216,74Zm2,126.89a1.11,1.11,0,0,1-1.11,1.11H40a2,2,0,0,1-2-2V64a2,2,0,0,1,2-2H93.33a2,2,0,0,1,1.2.4L124.4,84.8A6,6,0,0,0,128,86h88a2,2,0,0,1,2,2Z',
    star: 'M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z',
    archive: 'M224,50H32A14,14,0,0,0,18,64V88a14,14,0,0,0,14,14h2v90a14,14,0,0,0,14,14H208a14,14,0,0,0,14-14V102h2a14,14,0,0,0,14-14V64A14,14,0,0,0,224,50ZM210,192a2,2,0,0,1-2,2H48a2,2,0,0,1-2-2V102H210ZM226,88a2,2,0,0,1-2,2H32a2,2,0,0,1-2-2V64a2,2,0,0,1,2-2H224a2,2,0,0,1,2,2ZM98,136a6,6,0,0,1,6-6h48a6,6,0,0,1,0,12H104A6,6,0,0,1,98,136Z',
    trash: 'M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192Z',
    tagless: 'M40,86H74.6a30,30,0,0,0,58.8,0H216a6,6,0,0,0,0-12H133.4a30,30,0,0,0-58.8,0H40a6,6,0,0,0,0,12Zm64-24A18,18,0,1,1,86,80,18,18,0,0,1,104,62ZM216,170H197.4a30,30,0,0,0-58.8,0H40a6,6,0,0,0,0,12h98.6a30,30,0,0,0,58.8,0H216a6,6,0,0,0,0-12Zm-48,24a18,18,0,1,1,18-18A18,18,0,0,1,168,194Z',
    allNotes: 'M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z',
    shortcut: 'M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216ZM184,96a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,96Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,128Zm-32,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h64A8,8,0,0,1,152,160Z'
  };

  function snippetFrom(doc) {
    var raw = String(doc && doc.text ? doc.text : '').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
    if (!raw) { return 'Folha em branco'; }
    return raw.length > 96 ? raw.slice(0, 96) + '\u2026' : raw;
  }

  function formatShortDate(iso) {
    if (!iso) { return ''; }
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return ''; }
    var now = new Date();
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) {
      var h = d.getHours(), m = d.getMinutes();
      return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
    }
    var months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return d.getDate() + ' ' + months[d.getMonth()];
  }

  root.Escr.mountWorkspace = function (opts) {
    opts = opts || {};
    var storage = opts.storage || null;
    var shortcutsStore = root.Escr.shortcutsCore ? root.Escr.shortcutsCore.createStore(storage) : null;
    var state = {
      scope: 'library', // 'library' | 'project' | 'shortcut'
      libraryFilter: 'all', // 'all' | 'starred' | 'untagged' | 'archived' | 'trashed'
      projectId: null,
      folder: '',
      shortcutId: null,
      folderQuery: '',
      filterStarred: false,
      filterFormat: 'all', // 'all' | 'rich' | 'plain'
      sortBy: 'recent', // 'recent' | 'title'
      filtersOpen: false,
      navCollapsed: false,
      listsCollapsed: false,
      expandedProjects: {},
      mobilePane: 'editor'
    };

    var flashTimer = null;

    function loadState() {
      if (!storage) { return; }
      try {
        var raw = storage.getItem(STORAGE_KEY);
        if (!raw) { return; }
        var saved = JSON.parse(raw);
        if (!saved || typeof saved !== 'object') { return; }
        if (saved.scope === 'project' || saved.scope === 'library' || saved.scope === 'shortcut') { state.scope = saved.scope; }
        if (typeof saved.libraryFilter === 'string') { state.libraryFilter = saved.libraryFilter; }
        if (typeof saved.projectId === 'string') { state.projectId = saved.projectId; }
        if (typeof saved.folder === 'string') { state.folder = saved.folder; }
        if (typeof saved.shortcutId === 'string') { state.shortcutId = saved.shortcutId; }
        if (typeof saved.navCollapsed === 'boolean') { state.navCollapsed = saved.navCollapsed; }
        if (typeof saved.listsCollapsed === 'boolean') { state.listsCollapsed = saved.listsCollapsed; }
        if (saved.expandedProjects && typeof saved.expandedProjects === 'object') { state.expandedProjects = saved.expandedProjects; }
      } catch (ignore) {}
    }

    function saveState() {
      if (!storage) { return; }
      try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (ignore) {}
    }

    function flashEink() {
      var target = byId('writing-space');
      if (!target) { return; }
      if (root.Escr.einkFlash) {
        root.Escr.einkFlash(target);
        return;
      }
      if (flashTimer) { window.clearTimeout(flashTimer); flashTimer = null; }
      target.removeAttribute('data-eink-flash');
      target.setAttribute('data-eink-flash', 'true');
      flashTimer = window.setTimeout(function () {
        target.removeAttribute('data-eink-flash');
        flashTimer = null;
      }, 150);
    }

    function applyColumnState() {
      if (!document.body) { return; }
      document.body.setAttribute('data-nav-collapsed', state.navCollapsed ? 'true' : 'false');
      document.body.setAttribute('data-lists-collapsed', state.listsCollapsed ? 'true' : 'false');
      document.body.setAttribute('data-mobile-pane', state.mobilePane || 'editor');
      var navBtn = byId('esc-nav-toggle');
      var listBtn = byId('esc-lists-toggle');
      if (navBtn) { navBtn.setAttribute('aria-pressed', state.navCollapsed ? 'true' : 'false'); }
      if (listBtn) { listBtn.setAttribute('aria-pressed', state.listsCollapsed ? 'true' : 'false'); }
    }

    function allDocs() {
      if (!opts.archive) { return []; }
      try {
        var listed = opts.archive.list(true).documents || [];
        return listed.filter(function (d) { return d && d.kind !== 'reminder'; });
      } catch (e) { return []; }
    }

    function allBooks() {
      if (!opts.notebooks) { return []; }
      try { return opts.notebooks.list(true) || []; } catch (e) { return []; }
    }

    function availableBooks() {
      return allBooks().filter(function (b) { return b && !b.trashed; });
    }

    function trashedBooks() {
      return allBooks().filter(function (b) { return b && !!b.trashed; });
    }

    function isBookStarred(book) {
      return !!(book && book.data && book.data.starred);
    }

    function closePopovers() {
      var pop = byId('esc-color-popover');
      if (pop) { pop.hidden = true; }
      var fm = byId('esc-folder-menu');
      if (fm) { fm.hidden = true; }
    }

    function openColorMenu(book, anchorEl) {
      closePopovers();
      var pop = byId('esc-color-popover');
      if (!pop || !root.Escr.projectColors) { return; }
      pop.textContent = '';
      var activePal = root.Escr.projectColors.resolve(book);
      pop.appendChild(createEl('p', 'esc-color-popover-title', 'Cor de "' + book.name + '"'));
      var row = createEl('div', 'esc-color-swatches');

      // Opção Sem cor (padrão Sálvia)
      var noneBtn = createEl('button', 'esc-swatch esc-swatch-none', '\u00D7');
      noneBtn.type = 'button';
      noneBtn.title = 'Sem cor (padr\u00E3o)';
      noneBtn.setAttribute('aria-label', 'Sem cor');
      noneBtn.setAttribute('aria-pressed', activePal.id === 'padrao' ? 'true' : 'false');
      on(noneBtn, 'click', function (ev) {
        ev.stopPropagation();
        root.Escr.projectColors.assign(opts.notebooks, book.id, 'padrao');
        closePopovers();
        render();
        if (opts.refreshParent) { opts.refreshParent(); }
      });
      row.appendChild(noneBtn);

      root.Escr.projectColors.list().forEach(function (pal) {
        var sw = createEl('button', 'esc-swatch');
        sw.type = 'button';
        sw.title = pal.name;
        sw.setAttribute('aria-label', 'Cor ' + pal.name);
        sw.setAttribute('aria-pressed', activePal.id === pal.id ? 'true' : 'false');
        sw.style.backgroundColor = pal.color;
        on(sw, 'click', function (ev) {
          ev.stopPropagation();
          root.Escr.projectColors.assign(opts.notebooks, book.id, pal.id);
          closePopovers();
          render();
          if (opts.refreshParent) { opts.refreshParent(); }
        });
        row.appendChild(sw);
      });
      pop.appendChild(row);
      pop.hidden = false;
      if (anchorEl && anchorEl.getBoundingClientRect) {
        var r = anchorEl.getBoundingClientRect();
        pop.style.left = Math.max(8, Math.min((window.innerWidth || 900) - 240, r.left)) + 'px';
        pop.style.top = Math.max(48, Math.min((window.innerHeight || 600) - 120, r.bottom + 4)) + 'px';
      }
    }

    function openFolderPrompt(titleText, initialValue, acceptLabel, onAccept) {
      var ov = byId('esc-inline-modal');
      if (!ov) {
        ov = createEl('div', 'esc-inline-modal');
        ov.id = 'esc-inline-modal';
        ov.setAttribute('role', 'dialog');
        ov.setAttribute('aria-modal', 'true');
        document.body.appendChild(ov);
      }
      ov.textContent = '';
      var card = createEl('div', 'esc-inline-modal-card');
      card.appendChild(createEl('h3', '', titleText));
      var form = createEl('form');
      var inp = createEl('input', 'esc-inline-input');
      inp.type = 'text';
      inp.value = initialValue || '';
      inp.maxLength = 120;
      inp.placeholder = 'Nome da pasta ou projeto';
      var errP = createEl('p', 'esc-inline-err');
      errP.hidden = true;
      var bar = createEl('div', 'esc-inline-actions');
      var cancelBtn = createEl('button', '', 'Cancelar');
      cancelBtn.type = 'button';
      var okBtn = createEl('button', 'esc-btn-primary', acceptLabel || 'Salvar');
      okBtn.type = 'submit';
      bar.appendChild(cancelBtn);
      bar.appendChild(okBtn);
      form.appendChild(inp);
      form.appendChild(errP);
      form.appendChild(bar);
      card.appendChild(form);
      ov.appendChild(card);
      ov.hidden = false;

      function closeM() { ov.hidden = true; ov.textContent = ''; }
      on(cancelBtn, 'click', closeM);
      on(ov, 'click', function (ev) { if (ev.target === ov) { closeM(); } });
      on(form, 'submit', function (ev) {
        ev.preventDefault();
        var val = String(inp.value || '').replace(/^\s+|\s+$/g, '');
        if (!val) { errP.textContent = 'Digite um nome para continuar.'; errP.hidden = false; inp.focus(); return; }
        try {
          onAccept(val);
          closeM();
        } catch (e) {
          errP.textContent = e && e.message ? e.message : 'N\u00E3o foi poss\u00EDvel concluir.';
          errP.hidden = false;
        }
      });
      if (inp.focus) { inp.focus(); }
      if (inp.select) { inp.select(); }
    }

    function openFolderMenu(book, anchorEl) {
      closePopovers();
      var menu = byId('esc-folder-menu');
      if (!menu) {
        menu = createEl('div', 'esc-folder-menu');
        menu.id = 'esc-folder-menu';
        menu.setAttribute('role', 'menu');
        document.body.appendChild(menu);
      }
      menu.textContent = '';
      var starred = isBookStarred(book);
      var items = [
        {
          label: 'Renomear pasta',
          action: function () {
            openFolderPrompt('Renomear pasta', book.name, 'Renomear', function (nextName) {
              if (opts.renameProject) { opts.renameProject(book, nextName); }
              else if (opts.notebooks) { opts.notebooks.update(book.id, { name: nextName }); render(); }
            });
          }
        },
        {
          label: 'Cor do projeto',
          action: function () { openColorMenu(book, anchorEl); }
        },
        {
          label: starred ? 'Remover estrela da pasta' : 'Marcar pasta com estrela',
          action: function () {
            if (opts.notebooks) {
              var nextData = book.data ? JSON.parse(JSON.stringify(book.data)) : {};
              nextData.starred = !starred;
              opts.notebooks.update(book.id, { data: nextData });
              render();
              if (opts.refreshParent) { opts.refreshParent(); }
            }
          }
        },
        {
          label: 'Abrir quadro de giz',
          action: function () {
            if (opts.openProjectBoard) { opts.openProjectBoard(book); }
          }
        },
        {
          label: 'Mover textos para a lixeira',
          action: function () {
            if (opts.trashProjectDocs) { opts.trashProjectDocs(book); }
          }
        },
        {
          label: 'Mover pasta para a lixeira',
          danger: true,
          action: function () {
            if (opts.trashProject) { opts.trashProject(book); }
          }
        }
      ];

      items.forEach(function (it) {
        var btn = createEl('button', 'esc-folder-menu-item' + (it.danger ? ' is-danger' : ''), it.label);
        btn.type = 'button';
        btn.setAttribute('role', 'menuitem');
        on(btn, 'click', function (ev) {
          ev.stopPropagation();
          closePopovers();
          it.action();
        });
        menu.appendChild(btn);
      });
      menu.hidden = false;
      if (anchorEl && anchorEl.getBoundingClientRect) {
        var r = anchorEl.getBoundingClientRect();
        menu.style.left = Math.max(8, Math.min((window.innerWidth || 900) - 220, r.left)) + 'px';
        menu.style.top = Math.max(48, Math.min((window.innerHeight || 600) - 240, r.bottom + 4)) + 'px';
      }
    }

    function openShortcutModal(existingShortcut) {
      if (!shortcutsStore || !root.Escr.shortcutsCore) { return; }
      var ov = byId('esc-inline-modal');
      if (!ov) {
        ov = createEl('div', 'esc-inline-modal');
        ov.id = 'esc-inline-modal';
        ov.setAttribute('role', 'dialog');
        ov.setAttribute('aria-modal', 'true');
        document.body.appendChild(ov);
      }
      var docs = allDocs();
      var books = availableBooks();
      var draftTitle = existingShortcut ? existingShortcut.title : '';
      var draftMode = existingShortcut ? existingShortcut.mode : 'and';
      var draftRules = existingShortcut
        ? JSON.parse(JSON.stringify(existingShortcut.rules))
        : [{ kind: 'title', operator: 'includes', value: '' }];

      function closeM() { ov.hidden = true; ov.textContent = ''; }

      function renderModal() {
        ov.textContent = '';
        var card = createEl('div', 'esc-inline-modal-card esc-shortcut-card');
        card.appendChild(createEl('h3', '', existingShortcut ? 'Editar atalho salvo' : 'Criar atalho salvo'));
        var form = createEl('form');

        var nameLbl = createEl('label', 'esc-field-label', 'Nome do atalho');
        var nameInp = createEl('input', 'esc-inline-input');
        nameInp.type = 'text';
        nameInp.value = draftTitle;
        nameInp.placeholder = 'Ex.: Cap\u00EDtulos revisados';
        on(nameInp, 'input', function () { draftTitle = nameInp.value; });
        nameLbl.appendChild(nameInp);
        form.appendChild(nameLbl);

        var rulesBox = createEl('div', 'esc-shortcut-rules');
        draftRules.forEach(function (rule, idx) {
          var row = createEl('div', 'esc-shortcut-rule-row');
          var kindSel = createEl('select', 'esc-inline-select');
          [['title', 'T\u00EDtulo'], ['project', 'Pasta / Projeto'], ['starred', 'Com estrela']].forEach(function (pair) {
            var opt = createEl('option', '', pair[1]);
            opt.value = pair[0];
            if (rule.kind === pair[0]) { opt.selected = true; }
            kindSel.appendChild(opt);
          });
          on(kindSel, 'change', function () {
            rule.kind = kindSel.value;
            if (rule.kind === 'title') { rule.operator = 'includes'; rule.value = ''; }
            else if (rule.kind === 'project') { rule.operator = '='; rule.value = books[0] ? books[0].id : ''; }
            else { rule.operator = '='; rule.value = ''; }
            renderModal();
          });
          row.appendChild(kindSel);

          if (rule.kind === 'title') {
            var opSel = createEl('select', 'esc-inline-select');
            root.Escr.shortcutsCore.OPERATORS.forEach(function (pair) {
              var opt = createEl('option', '', pair[1]);
              opt.value = pair[0];
              if (rule.operator === pair[0]) { opt.selected = true; }
              opSel.appendChild(opt);
            });
            on(opSel, 'change', function () { rule.operator = opSel.value; updatePreview(); });
            row.appendChild(opSel);

            var valInp = createEl('input', 'esc-inline-input');
            valInp.type = 'text';
            valInp.value = rule.value || '';
            valInp.placeholder = 'Palavra no t\u00EDtulo';
            on(valInp, 'input', function () { rule.value = valInp.value; updatePreview(); });
            row.appendChild(valInp);
          } else if (rule.kind === 'project') {
            var bkSel = createEl('select', 'esc-inline-select');
            books.forEach(function (b) {
              var opt = createEl('option', '', b.name);
              opt.value = b.id;
              if (rule.value === b.id) { opt.selected = true; }
              bkSel.appendChild(opt);
            });
            on(bkSel, 'change', function () { rule.value = bkSel.value; updatePreview(); });
            row.appendChild(bkSel);
          }

          if (draftRules.length > 1) {
            var rmBtn = createEl('button', 'esc-item-act', '\u00D7');
            rmBtn.type = 'button';
            rmBtn.title = 'Remover regra';
            on(rmBtn, 'click', function () { draftRules.splice(idx, 1); renderModal(); });
            row.appendChild(rmBtn);
          }
          rulesBox.appendChild(row);
        });
        form.appendChild(rulesBox);

        var addRuleBtn = createEl('button', 'esc-item-act', '+ Adicionar crit\u00E9rio');
        addRuleBtn.type = 'button';
        on(addRuleBtn, 'click', function () {
          if (draftRules.length < 8) {
            draftRules.push({ kind: 'starred', operator: '=', value: '' });
            renderModal();
          }
        });
        form.appendChild(addRuleBtn);

        if (draftRules.length > 1) {
          var modeRow = createEl('div', 'esc-shortcut-mode');
          var modeSel = createEl('select', 'esc-inline-select');
          [['and', 'Cumprir TODOS os crit\u00E9rios'], ['or', 'Cumprir QUALQUER crit\u00E9rio']].forEach(function (p) {
            var o = createEl('option', '', p[1]);
            o.value = p[0];
            if (draftMode === p[0]) { o.selected = true; }
            modeSel.appendChild(o);
          });
          on(modeSel, 'change', function () { draftMode = modeSel.value; updatePreview(); });
          modeRow.appendChild(modeSel);
          form.appendChild(modeRow);
        }

        var previewEl = createEl('p', 'esc-shortcut-preview');
        form.appendChild(previewEl);

        var errP = createEl('p', 'esc-inline-err');
        errP.hidden = true;
        form.appendChild(errP);

        function updatePreview() {
          var valid = draftRules.every(root.Escr.shortcutsCore.validRule);
          if (!valid) {
            previewEl.textContent = 'Preencha os crit\u00E9rios para ver quantos textos correspondem.';
            return;
          }
          var matched = root.Escr.shortcutsCore.filterDocs({ mode: draftMode, rules: draftRules }, docs);
          previewEl.textContent = matched.length === 1
            ? '1 texto corresponde a este atalho.'
            : matched.length + ' textos correspondem a este atalho.';
        }
        updatePreview();

        var bar = createEl('div', 'esc-inline-actions');
        if (existingShortcut) {
          var delBtn = createEl('button', 'esc-item-act is-danger', 'Excluir atalho');
          delBtn.type = 'button';
          on(delBtn, 'click', function () {
            shortcutsStore.remove(existingShortcut.id);
            if (state.scope === 'shortcut' && state.shortcutId === existingShortcut.id) {
              state.scope = 'library';
              state.libraryFilter = 'all';
              state.shortcutId = null;
            }
            closeM();
            render();
          });
          bar.appendChild(delBtn);
        }
        var cancelBtn = createEl('button', '', 'Cancelar');
        cancelBtn.type = 'button';
        on(cancelBtn, 'click', closeM);
        var saveBtn = createEl('button', 'esc-btn-primary', 'Salvar atalho');
        saveBtn.type = 'submit';
        bar.appendChild(cancelBtn);
        bar.appendChild(saveBtn);
        form.appendChild(bar);

        on(form, 'submit', function (ev) {
          ev.preventDefault();
          try {
            var saved = shortcutsStore.save({
              id: existingShortcut ? existingShortcut.id : '',
              title: draftTitle,
              mode: draftMode,
              rules: draftRules
            });
            state.scope = 'shortcut';
            state.shortcutId = saved.id;
            saveState();
            closeM();
            render();
          } catch (e) {
            errP.textContent = e && e.message ? e.message : 'N\u00E3o foi poss\u00EDvel salvar o atalho.';
            errP.hidden = false;
          }
        });

        card.appendChild(form);
        ov.appendChild(card);
        ov.hidden = false;
      }

      on(ov, 'click', function (ev) { if (ev.target === ov) { closeM(); } });
      renderModal();
    }

    function collectFoldersForBook(book, docs) {
      var map = {};
      var result = [];
      var bookFolders = book.data && Object.prototype.toString.call(book.data.folders) === '[object Array]' ? book.data.folders : [];
      bookFolders.forEach(function (f) {
        if (typeof f === 'string' && f.replace(/^\s+|\s+$/g, '') && !map[f.replace(/^\s+|\s+$/g, '')]) {
          var clean = f.replace(/^\s+|\s+$/g, '');
          map[clean] = true;
          result.push(clean);
        }
      });
      docs.forEach(function (d) {
        if (d.projectId === book.id && !d.trashed && !d.archived && d.folder && !map[d.folder]) {
          map[d.folder] = true;
          result.push(d.folder);
        }
      });
      result.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });
      return result;
    }

    function renderProjectRow(container, book, docs, perProject, activeDocId, isStarredSection) {
      var pal = root.Escr.projectColors ? root.Escr.projectColors.resolve(book) : { color: '#a3b899', edge: '#354231' };
      var folders = collectFoldersForBook(book, docs);
      var bookDocs = docs.filter(function (d) { return d.projectId === book.id && !d.trashed && !d.archived; });
      var canExpand = folders.length > 0 || bookDocs.length > 0;
      var expandKey = (isStarredSection ? 'star:' : '') + book.id;
      var expanded = !!state.expandedProjects[expandKey] || (!isStarredSection && !!state.expandedProjects[book.id]);
      var isBookSelected = state.scope === 'project' && state.projectId === book.id && !state.folder;

      var wrap = createEl('div', 'esc-project-node');
      wrap.setAttribute('data-project-id', book.id);
      if (pal.id !== 'padrao') {
        wrap.setAttribute('data-esc-project-color', pal.id);
      }

      var row = createEl('div', 'esc-project-row' + (isBookSelected ? ' is-active' : ''));
      row.style.borderLeftColor = pal.id !== 'padrao' ? pal.color : 'transparent';

      var expBtn = createEl('button', 'esc-tree-expand', canExpand ? (expanded ? '\u25BE' : '\u25B8') : '\u00B7');
      expBtn.type = 'button';
      expBtn.setAttribute('aria-label', expanded ? 'Recolher ' + book.name : 'Expandir ' + book.name);
      expBtn.disabled = !canExpand;
      on(expBtn, 'click', function (ev) {
        ev.stopPropagation();
        if (!canExpand) { return; }
        state.expandedProjects[book.id] = !expanded;
        if (isStarredSection) { state.expandedProjects[expandKey] = !expanded; }
        saveState();
        render();
      });

      var selBtn = createEl('button', 'esc-project-select');
      selBtn.type = 'button';
      selBtn.appendChild(createEl('span', 'esc-project-name', book.name));
      selBtn.appendChild(createEl('span', 'esc-nav-count', String(perProject[book.id] || 0)));
      on(selBtn, 'click', function () {
        state.scope = 'project';
        state.projectId = book.id;
        state.folder = '';
        state.mobilePane = 'items';
        saveState();
        render();
      });

      var menuBtn = createEl('button', 'esc-project-color-btn', '\u22EF');
      menuBtn.type = 'button';
      menuBtn.title = 'A\u00E7\u00F5es de ' + book.name;
      menuBtn.setAttribute('aria-label', 'A\u00E7\u00F5es de ' + book.name);
      on(menuBtn, 'click', function (ev) {
        ev.stopPropagation();
        openFolderMenu(book, menuBtn);
      });
      on(row, 'contextmenu', function (ev) {
        ev.preventDefault();
        openFolderMenu(book, menuBtn);
      });

      row.appendChild(expBtn);
      row.appendChild(selBtn);
      row.appendChild(menuBtn);
      wrap.appendChild(row);

      if (expanded && canExpand) {
        var subList = createEl('div', 'esc-folder-list');
        // Subpastas
        folders.forEach(function (folderName) {
          var folderDocs = bookDocs.filter(function (d) { return d.folder === folderName; });
          var fBtn = createEl('button', 'esc-folder-item');
          fBtn.type = 'button';
          var fSel = state.scope === 'project' && state.projectId === book.id && state.folder === folderName;
          fBtn.setAttribute('aria-current', fSel ? 'true' : 'false');
          fBtn.appendChild(svgIcon(ICONS.folder));
          fBtn.appendChild(createEl('span', 'esc-folder-name', folderName));
          fBtn.appendChild(createEl('span', 'esc-nav-count', String(folderDocs.length)));
          on(fBtn, 'click', function () {
            state.scope = 'project';
            state.projectId = book.id;
            state.folder = folderName;
            state.mobilePane = 'items';
            saveState();
            render();
          });
          subList.appendChild(fBtn);

          // Notas filhas desta subpasta na árvore (NoteRows do Linux!)
          if (folderDocs.length) {
            var fnList = createEl('div', 'esc-tree-notes is-nested-notes');
            folderDocs.forEach(function (note) {
              var nb = createEl('button', 'esc-tree-note' + (note.id === activeDocId ? ' is-selected' : ''));
              nb.type = 'button';
              nb.appendChild(svgIcon(ICONS.allNotes));
              nb.appendChild(createEl('span', 'esc-tree-note-title', note.title || 'Sem t\u00EDtulo'));
              on(nb, 'click', function (ev) {
                ev.stopPropagation();
                state.scope = 'project';
                state.projectId = book.id;
                state.folder = folderName;
                state.mobilePane = 'editor';
                saveState();
                if (opts.openDoc) { opts.openDoc(note); }
                flashEink();
                render();
              });
              fnList.appendChild(nb);
            });
            subList.appendChild(fnList);
          }
        });

        // Notas soltas na raiz deste projeto
        var rootDocs = bookDocs.filter(function (d) { return !d.folder; });
        if (rootDocs.length) {
          var rnList = createEl('div', 'esc-tree-notes');
          rootDocs.forEach(function (note) {
            var nb = createEl('button', 'esc-tree-note' + (note.id === activeDocId ? ' is-selected' : ''));
            nb.type = 'button';
            nb.appendChild(svgIcon(ICONS.allNotes));
            nb.appendChild(createEl('span', 'esc-tree-note-title', note.title || 'Sem t\u00EDtulo'));
            on(nb, 'click', function (ev) {
              ev.stopPropagation();
              state.scope = 'project';
              state.projectId = book.id;
              state.folder = '';
              state.mobilePane = 'editor';
              saveState();
              if (opts.openDoc) { opts.openDoc(note); }
              flashEink();
              render();
            });
            rnList.appendChild(nb);
          });
          subList.appendChild(rnList);
        }
        wrap.appendChild(subList);
      }

      container.appendChild(wrap);
    }

    function renderNavigation(docs, books) {
      var navLib = byId('esc-library-filters');
      var tree = byId('esc-project-tree');
      if (!navLib || !tree) { return; }

      var activeDoc = opts.currentDoc ? opts.currentDoc() : null;
      var activeDocId = activeDoc ? activeDoc.id : '';
      var trashBooks = trashedBooks();

      var counts = { all: 0, starred: 0, untagged: 0, archived: 0, trashed: trashBooks.length };
      var perProject = {};
      docs.forEach(function (d) {
        if (d.trashed) { counts.trashed += 1; return; }
        if (d.archived) { counts.archived += 1; return; }
        counts.all += 1;
        if (d.starred) { counts.starred += 1; }
        if (!d.projectId) { counts.untagged += 1; }
        else { perProject[d.projectId] = (perProject[d.projectId] || 0) + 1; }
      });

      var defs = [
        { id: 'all', label: 'Todos os textos', icon: ICONS.allNotes, count: counts.all },
        { id: 'starred', label: 'Com estrela', icon: ICONS.star, count: counts.starred },
        { id: 'untagged', label: 'Sem pasta', icon: ICONS.tagless, count: counts.untagged },
        { id: 'archived', label: 'Arquivados', icon: ICONS.archive, count: counts.archived },
        { id: 'trashed', label: 'Lixeira', icon: ICONS.trash, count: counts.trashed }
      ];

      navLib.textContent = '';
      defs.forEach(function (item) {
        var btn = createEl('button', 'esc-nav-item');
        btn.type = 'button';
        var selected = state.scope === 'library' && state.libraryFilter === item.id;
        btn.setAttribute('aria-current', selected ? 'true' : 'false');
        btn.setAttribute('data-lib-filter', item.id);
        btn.appendChild(svgIcon(item.icon));
        btn.appendChild(createEl('span', 'esc-nav-label', item.label));
        btn.appendChild(createEl('span', 'esc-nav-count', String(item.count)));
        on(btn, 'click', function () {
          state.scope = 'library';
          state.libraryFilter = item.id;
          state.projectId = null;
          state.folder = '';
          state.shortcutId = null;
          state.mobilePane = 'items';
          saveState();
          render();
        });
        navLib.appendChild(btn);
      });

      // Atalhos salvos
      var scWrap = byId('esc-shortcuts-list');
      if (scWrap && shortcutsStore) {
        scWrap.textContent = '';
        var scList = shortcutsStore.list();
        scList.forEach(function (sc) {
          var row = createEl('div', 'esc-shortcut-item-row');
          var matched = root.Escr.shortcutsCore.filterDocs(sc, docs);
          var btn = createEl('button', 'esc-nav-item');
          btn.type = 'button';
          var sel = state.scope === 'shortcut' && state.shortcutId === sc.id;
          btn.setAttribute('aria-current', sel ? 'true' : 'false');
          btn.appendChild(svgIcon(ICONS.shortcut));
          btn.appendChild(createEl('span', 'esc-nav-label', sc.title));
          btn.appendChild(createEl('span', 'esc-nav-count', String(matched.length)));
          on(btn, 'click', function () {
            state.scope = 'shortcut';
            state.shortcutId = sc.id;
            state.projectId = null;
            state.folder = '';
            state.mobilePane = 'items';
            saveState();
            render();
          });
          var editBtn = createEl('button', 'esc-project-color-btn', '\u22EF');
          editBtn.type = 'button';
          editBtn.title = 'Editar atalho ' + sc.title;
          on(editBtn, 'click', function (ev) { ev.stopPropagation(); openShortcutModal(sc); });
          row.appendChild(btn);
          row.appendChild(editBtn);
          scWrap.appendChild(row);
        });
      }

      // Pastas com estrela
      var starSec = byId('esc-starred-folders');
      if (starSec) {
        var starredBooks = books.filter(isBookStarred);
        starSec.textContent = '';
        starSec.hidden = !starredBooks.length;
        if (starredBooks.length) {
          var det = createEl('details', 'esc-starred-details');
          det.open = true;
          det.appendChild(createEl('summary', 'esc-nav-section-label', 'Pastas com estrela'));
          starredBooks.forEach(function (bk) {
            renderProjectRow(det, bk, docs, perProject, activeDocId, true);
          });
          starSec.appendChild(det);
        }
      }

      // Projetos e pastas (filtrados por busca de pastas)
      var fQuery = String(state.folderQuery || '').replace(/^\s+|\s+$/g, '').toLowerCase();
      var visibleBooks = books.filter(function (bk) {
        if (!fQuery) { return true; }
        if (String(bk.name || '').toLowerCase().indexOf(fQuery) >= 0) { return true; }
        var flds = collectFoldersForBook(bk, docs);
        return flds.some(function (f) { return f.toLowerCase().indexOf(fQuery) >= 0; });
      });

      tree.textContent = '';
      if (!visibleBooks.length) {
        tree.appendChild(createEl('p', 'esc-tree-empty', fQuery ? 'Nenhuma pasta encontrada.' : 'Nenhum projeto criado ainda.'));
      } else {
        visibleBooks.forEach(function (bk) {
          renderProjectRow(tree, bk, docs, perProject, activeDocId, false);
        });
      }
    }

    function activeFilterCount() {
      var c = 0;
      if (state.filterStarred) { c += 1; }
      if (state.filterFormat !== 'all') { c += 1; }
      if (state.sortBy !== 'recent') { c += 1; }
      return c;
    }

    function renderFilterPanel() {
      var panel = byId('esc-items-filters-panel');
      var badge = byId('esc-items-filter-badge');
      var btn = byId('esc-items-filter-btn');
      var count = activeFilterCount();
      if (badge) {
        badge.textContent = String(count);
        badge.hidden = count === 0;
      }
      if (btn) { btn.setAttribute('aria-expanded', state.filtersOpen ? 'true' : 'false'); }
      if (!panel) { return; }
      panel.hidden = !state.filtersOpen;
      if (!state.filtersOpen) { return; }

      panel.textContent = '';
      var topRow = createEl('div', 'esc-filters-top');
      var starLbl = createEl('label', 'esc-filter-check');
      var starCb = createEl('input');
      starCb.type = 'checkbox';
      starCb.checked = !!state.filterStarred;
      on(starCb, 'change', function () { state.filterStarred = starCb.checked; render(); });
      starLbl.appendChild(starCb);
      starLbl.appendChild(createEl('span', '', 'Somente com estrela'));
      topRow.appendChild(starLbl);

      if (count > 0) {
        var clearLink = createEl('button', 'esc-filters-clear', 'Limpar todos os filtros');
        clearLink.type = 'button';
        on(clearLink, 'click', function () {
          state.filterStarred = false;
          state.filterFormat = 'all';
          state.sortBy = 'recent';
          render();
        });
        topRow.appendChild(clearLink);
      }
      panel.appendChild(topRow);

      var fmtRow = createEl('div', 'esc-filters-row');
      [['all', 'Todos'], ['rich', 'Formatado'], ['plain', 'Simples']].forEach(function (p) {
        var b = createEl('button', 'esc-filter-chip', p[1]);
        b.type = 'button';
        b.setAttribute('aria-pressed', state.filterFormat === p[0] ? 'true' : 'false');
        on(b, 'click', function () { state.filterFormat = p[0]; render(); });
        fmtRow.appendChild(b);
      });
      panel.appendChild(fmtRow);

      var sortRow = createEl('div', 'esc-filters-row');
      [['recent', 'Mais recentes'], ['title', 'T\u00EDtulo A\u2013Z']].forEach(function (p) {
        var b = createEl('button', 'esc-filter-chip', p[1]);
        b.type = 'button';
        b.setAttribute('aria-pressed', state.sortBy === p[0] ? 'true' : 'false');
        on(b, 'click', function () { state.sortBy = p[0]; render(); });
        sortRow.appendChild(b);
      });
      panel.appendChild(sortRow);
    }

    function renderItemsColumn(docs, books) {
      var titleEl = byId('esc-items-title');
      var countEl = byId('esc-items-count');
      var listEl = byId('esc-items-list');
      var emptyTrashBtn = byId('esc-empty-trash');
      var searchInput = byId('esc-items-search');
      var clearBtn = byId('esc-items-search-clear');
      if (!listEl) { return; }

      var query = searchInput ? String(searchInput.value || '').replace(/^\s+|\s+$/g, '').toLowerCase() : '';
      if (clearBtn) { clearBtn.hidden = !query; }

      var currentBook = null;
      var i;
      if (state.scope === 'project' && state.projectId) {
        for (i = 0; i < books.length; i += 1) {
          if (books[i].id === state.projectId) { currentBook = books[i]; break; }
        }
        if (!currentBook) {
          state.scope = 'library';
          state.projectId = null;
          state.folder = '';
        }
      }

      if (root.Escr.projectColors && document.body) {
        root.Escr.projectColors.apply(document.body, currentBook);
      }

      var filtered = [];
      var heading = 'Todos os textos';
      var inTrash = state.scope === 'library' && state.libraryFilter === 'trashed';

      if (state.scope === 'project' && currentBook) {
        heading = state.folder ? (currentBook.name + ' \u203A ' + state.folder) : currentBook.name;
        filtered = docs.filter(function (d) {
          if (d.trashed || d.archived) { return false; }
          if (d.projectId !== currentBook.id) { return false; }
          if (state.folder && d.folder !== state.folder) { return false; }
          return true;
        });
      } else if (state.scope === 'shortcut' && shortcutsStore && state.shortcutId) {
        var sc = shortcutsStore.get(state.shortcutId);
        if (sc) {
          heading = sc.title;
          filtered = root.Escr.shortcutsCore.filterDocs(sc, docs);
        } else {
          state.scope = 'library';
          state.libraryFilter = 'all';
        }
      }

      if (state.scope === 'library') {
        if (state.libraryFilter === 'starred') {
          heading = 'Com estrela';
          filtered = docs.filter(function (d) { return !d.trashed && !d.archived && !!d.starred; });
        } else if (state.libraryFilter === 'untagged') {
          heading = 'Sem pasta';
          filtered = docs.filter(function (d) { return !d.trashed && !d.archived && !d.projectId; });
        } else if (state.libraryFilter === 'archived') {
          heading = 'Arquivados';
          filtered = docs.filter(function (d) { return !d.trashed && !!d.archived; });
        } else if (state.libraryFilter === 'trashed') {
          heading = 'Lixeira';
          filtered = docs.filter(function (d) { return !!d.trashed; });
        } else {
          heading = 'Todos os textos';
          filtered = docs.filter(function (d) { return !d.trashed && !d.archived; });
        }
      }

      // Filtros do acordeão (Coluna 2)
      if (!inTrash) {
        if (state.filterStarred) { filtered = filtered.filter(function (d) { return !!d.starred; }); }
        if (state.filterFormat === 'rich') { filtered = filtered.filter(function (d) { return d.format === 'rich'; }); }
        else if (state.filterFormat === 'plain') { filtered = filtered.filter(function (d) { return d.format !== 'rich'; }); }
      }

      if (query) {
        filtered = filtered.filter(function (d) {
          var hay = ((d.title || '') + ' ' + (d.text || '') + ' ' + (d.folder || '') + ' ' + (d.project || '')).toLowerCase();
          return hay.indexOf(query) >= 0;
        });
      }

      if (state.sortBy === 'title') {
        filtered.sort(function (a, b) { return String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR'); });
      } else {
        filtered.sort(function (a, b) { return (Date.parse(b.updated || 0) || 0) - (Date.parse(a.updated || 0) || 0); });
      }

      var trashFolders = inTrash ? trashedBooks() : [];
      var totalCount = filtered.length + trashFolders.length;
      setText(titleEl, heading);
      setText(countEl, totalCount === 1 ? '1 item' : totalCount + ' itens');
      if (emptyTrashBtn) { emptyTrashBtn.hidden = !(inTrash && totalCount > 0); }

      renderFilterPanel();

      listEl.textContent = '';
      var activeDoc = opts.currentDoc ? opts.currentDoc() : null;
      var activeId = activeDoc ? activeDoc.id : '';

      // Seção LIX-01: Pastas/Projetos recuperáveis na Lixeira
      if (inTrash && trashFolders.length) {
        var fHead = createEl('p', 'esc-trash-group-title', 'Pastas e projetos na lixeira');
        listEl.appendChild(fHead);
        trashFolders.forEach(function (bk) {
          var insideCount = docs.filter(function (d) { return d.projectId === bk.id && !!d.trashed; }).length;
          var card = createEl('article', 'esc-item-card esc-trashed-folder-card');
          var top = createEl('div', 'esc-item-top');
          top.appendChild(createEl('strong', 'esc-item-title', bk.name));
          top.appendChild(createEl('span', 'esc-item-date', insideCount + (insideCount === 1 ? ' texto' : ' textos')));
          card.appendChild(top);
          var acts = createEl('div', 'esc-item-actions');
          var restBtn = createEl('button', 'esc-item-act', 'Restaurar pasta e textos');
          restBtn.type = 'button';
          on(restBtn, 'click', function (ev) {
            ev.stopPropagation();
            if (opts.restoreProject) { opts.restoreProject(bk); }
          });
          acts.appendChild(restBtn);
          var purgeBtn = createEl('button', 'esc-item-act is-danger', 'Excluir definitivamente');
          purgeBtn.type = 'button';
          on(purgeBtn, 'click', function (ev) {
            ev.stopPropagation();
            if (opts.purgeProject) { opts.purgeProject(bk, insideCount); }
          });
          acts.appendChild(purgeBtn);
          card.appendChild(acts);
          listEl.appendChild(card);
        });
      }

      if (!filtered.length && !trashFolders.length) {
        var empty = createEl('p', 'esc-items-empty', query ? 'Nenhum texto encontrado para "' + query + '".' : 'Nenhum texto neste espaço.');
        listEl.appendChild(empty);
        return;
      }

      filtered.forEach(function (entry) {
        var isCurrent = entry.id === activeId;
        var card = createEl('article', 'esc-item-card' + (isCurrent ? ' is-selected' : ''));
        card.setAttribute('data-doc-id', entry.id);

        var mainBtn = createEl('button', 'esc-item-open');
        mainBtn.type = 'button';
        var top = createEl('div', 'esc-item-top');
        top.appendChild(createEl('strong', 'esc-item-title', entry.title || 'Sem t\u00EDtulo'));
        top.appendChild(createEl('span', 'esc-item-date', formatShortDate(entry.updated)));
        mainBtn.appendChild(top);
        mainBtn.appendChild(createEl('p', 'esc-item-snippet', snippetFrom(entry)));

        var meta = createEl('div', 'esc-item-meta');
        if (entry.project) { meta.appendChild(createEl('span', 'esc-item-badge', entry.project)); }
        if (entry.folder) { meta.appendChild(createEl('span', 'esc-item-badge is-folder', entry.folder)); }
        if (entry.category === 'reference') { meta.appendChild(createEl('span', 'esc-item-badge is-ref', 'Refer\u00EAncia')); }
        if (entry.starred) { meta.appendChild(createEl('span', 'esc-item-badge is-star', '\u2605')); }
        if (meta.children.length) { mainBtn.appendChild(meta); }

        on(mainBtn, 'click', function () {
          state.mobilePane = 'editor';
          applyColumnState();
          if (opts.openDoc) { opts.openDoc(entry); }
          if (!isCurrent) { flashEink(); }
          render();
        });
        card.appendChild(mainBtn);

        var actions = createEl('div', 'esc-item-actions');
        if (entry.trashed) {
          var restBtn = createEl('button', 'esc-item-act', 'Restaurar');
          restBtn.type = 'button';
          on(restBtn, 'click', function (ev) {
            ev.stopPropagation();
            if (opts.restoreDoc) { opts.restoreDoc(entry); }
          });
          actions.appendChild(restBtn);
          var delBtn = createEl('button', 'esc-item-act is-danger', 'Excluir definitivamente');
          delBtn.type = 'button';
          on(delBtn, 'click', function (ev) {
            ev.stopPropagation();
            if (opts.purgeDoc) { opts.purgeDoc(entry); }
          });
          actions.appendChild(delBtn);
        } else {
          var starBtn = createEl('button', 'esc-item-act', entry.starred ? '\u2605' : '\u2606');
          starBtn.type = 'button';
          starBtn.title = entry.starred ? 'Remover estrela' : 'Marcar com estrela';
          starBtn.setAttribute('aria-label', starBtn.title);
          on(starBtn, 'click', function (ev) {
            ev.stopPropagation();
            if (opts.updateDocMeta) { opts.updateDocMeta(entry, { starred: !entry.starred }); }
          });
          actions.appendChild(starBtn);

          var archBtn = createEl('button', 'esc-item-act', entry.archived ? 'Desarquivar' : 'Arquivar');
          archBtn.type = 'button';
          on(archBtn, 'click', function (ev) {
            ev.stopPropagation();
            if (opts.updateDocMeta) { opts.updateDocMeta(entry, { archived: !entry.archived }); }
          });
          actions.appendChild(archBtn);

          var trashBtn = createEl('button', 'esc-item-act', 'Lixeira');
          trashBtn.type = 'button';
          on(trashBtn, 'click', function (ev) {
            ev.stopPropagation();
            if (opts.trashDoc) { opts.trashDoc(entry); }
          });
          actions.appendChild(trashBtn);
        }
        card.appendChild(actions);
        listEl.appendChild(card);
      });
    }

    function render() {
      var docs = allDocs();
      var books = availableBooks();
      applyColumnState();
      renderNavigation(docs, books);
      renderItemsColumn(docs, books);
    }

    loadState();
    applyColumnState();

    on(byId('esc-nav-toggle'), 'click', function () {
      state.navCollapsed = !state.navCollapsed;
      saveState();
      applyColumnState();
    });
    on(byId('esc-lists-toggle'), 'click', function () {
      state.listsCollapsed = !state.listsCollapsed;
      saveState();
      applyColumnState();
    });
    on(byId('esc-new-project'), 'click', function () {
      if (opts.newProject) { opts.newProject(); }
    });
    on(byId('esc-new-folder-btn'), 'click', function () {
      openFolderPrompt('Nova pasta ou projeto', '', 'Criar pasta', function (name) {
        if (opts.createBlankFolder) { opts.createBlankFolder(name); }
        else if (opts.notebooks) {
          var created = opts.notebooks.add(name);
          state.scope = 'project';
          state.projectId = created.id;
          state.folder = '';
          saveState();
          render();
        }
      });
    });
    on(byId('esc-folder-search'), 'input', function () {
      var inp = byId('esc-folder-search');
      state.folderQuery = inp ? inp.value : '';
      render();
    });
    on(byId('esc-new-shortcut'), 'click', function () {
      openShortcutModal(null);
    });
    on(byId('esc-new-note'), 'click', function () {
      state.mobilePane = 'editor';
      applyColumnState();
      if (opts.newNote) {
        opts.newNote({
          projectId: state.scope === 'project' ? state.projectId : null,
          folder: state.scope === 'project' ? state.folder : ''
        });
      }
    });
    on(byId('esc-items-search'), 'input', function () { render(); });
    on(byId('esc-items-search-clear'), 'click', function () {
      var inp = byId('esc-items-search');
      if (inp) { inp.value = ''; inp.focus(); }
      render();
    });
    on(byId('esc-items-filter-btn'), 'click', function (ev) {
      ev.stopPropagation();
      state.filtersOpen = !state.filtersOpen;
      renderFilterPanel();
    });
    on(byId('esc-empty-trash'), 'click', function () {
      if (opts.emptyTrash) { opts.emptyTrash(); }
    });
    on(byId('esc-open-mesa'), 'click', function () {
      if (opts.onOpenNotebookTable) { opts.onOpenNotebookTable(); }
    });
    on(byId('esc-mobile-nav'), 'click', function () { state.mobilePane = 'nav'; applyColumnState(); });
    on(byId('esc-mobile-items'), 'click', function () { state.mobilePane = 'items'; applyColumnState(); });
    on(byId('esc-mobile-editor'), 'click', function () { state.mobilePane = 'editor'; applyColumnState(); });

    on(document, 'click', function (ev) {
      var pop = byId('esc-color-popover');
      if (pop && !pop.hidden && !pop.contains(ev.target)) { pop.hidden = true; }
      var fm = byId('esc-folder-menu');
      if (fm && !fm.hidden && !fm.contains(ev.target)) { fm.hidden = true; }
      var fp = byId('esc-items-filters-panel');
      var fb = byId('esc-items-filter-btn');
      if (fp && !fp.hidden && !fp.contains(ev.target) && (!fb || !fb.contains(ev.target))) {
        state.filtersOpen = false;
        renderFilterPanel();
      }
    });
    on(document, 'keydown', function (ev) {
      if (ev.keyCode === 27) {
        closePopovers();
        if (state.filtersOpen) {
          state.filtersOpen = false;
          renderFilterPanel();
        }
      }
    });

    return {
      render: render,
      flashEink: flashEink,
      openShortcutModal: openShortcutModal,
      selectProject: function (bookId, folder) {
        state.scope = bookId ? 'project' : 'library';
        state.projectId = bookId || null;
        state.folder = folder || '';
        state.shortcutId = null;
        if (bookId) { state.expandedProjects[bookId] = true; }
        saveState();
        render();
      },
      selectLibrary: function (filter) {
        state.scope = 'library';
        state.libraryFilter = filter || 'all';
        state.projectId = null;
        state.folder = '';
        state.shortcutId = null;
        saveState();
        render();
      },
      getSelection: function () { return JSON.parse(JSON.stringify(state)); },
      setMobilePane: function (pane) {
        state.mobilePane = pane || 'editor';
        applyColumnState();
      }
    };
  };
}(typeof window !== 'undefined' ? window : this));
