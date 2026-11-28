/* Localizar e substituir dentro do manuscrito (texto simples e formatado leve) — ES5 */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var WORD_CHAR = /[A-Za-z0-9À-ÖØ-öø-ÿ_]/;

  function isWordBoundary(text, pos) {
    if (pos <= 0 || pos >= text.length) { return true; }
    var before = WORD_CHAR.test(text.charAt(pos - 1));
    var after = WORD_CHAR.test(text.charAt(pos));
    return before !== after;
  }

  function findMatches(text, query, opts) {
    var src = String(text || '');
    var needle = String(query || '');
    if (!needle) { return []; }
    var caseSensitive = !!(opts && opts.caseSensitive);
    var wholeWord = !!(opts && opts.wholeWord);
    var hay = caseSensitive ? src : src.toLowerCase();
    var q = caseSensitive ? needle : needle.toLowerCase();
    var out = [];
    var idx = 0, step = Math.max(1, q.length);

    while (idx <= hay.length - q.length) {
      var found = hay.indexOf(q, idx);
      if (found === -1) { break; }
      var end = found + q.length;
      if (!wholeWord || (isWordBoundary(src, found) && isWordBoundary(src, end))) {
        out.push({ start: found, end: end });
      }
      idx = found + step;
    }
    return out;
  }

  function replaceOne(text, match, replacement) {
    var src = String(text || '');
    if (!match || typeof match.start !== 'number' || typeof match.end !== 'number') { return src; }
    if (match.start < 0 || match.end < match.start || match.end > src.length) { return src; }
    return src.slice(0, match.start) + String(replacement || '') + src.slice(match.end);
  }

  function replaceAll(text, query, replacement, opts) {
    var src = String(text || '');
    var matches = findMatches(src, query, opts);
    if (!matches.length) { return { text: src, count: 0 }; }
    var rep = String(replacement || '');
    var out = [], cursor = 0, i;
    for (i = 0; i < matches.length; i += 1) {
      out.push(src.slice(cursor, matches[i].start));
      out.push(rep);
      cursor = matches[i].end;
    }
    out.push(src.slice(cursor));
    return { text: out.join(''), count: matches.length };
  }

  root.Escr.findReplaceCore = {
    findMatches: findMatches,
    replaceOne: replaceOne,
    replaceAll: replaceAll
  };

  root.Escr.mountFindReplace = function (opts) {
    var host = opts && opts.hostEl;
    var manuscript = opts && opts.manuscriptEl;
    if (!host || !manuscript) { return null; }

    var bar = document.createElement('div');
    bar.id = 'esc-find-bar';
    bar.className = 'esc-find-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Localizar e substituir no texto');
    bar.hidden = true;
    bar.innerHTML =
      '<div class="esc-find-row">' +
        '<input id="esc-find-input" class="esc-find-input" type="search" placeholder="Localizar no texto..." autocomplete="off" spellcheck="false" aria-label="Localizar">' +
        '<span id="esc-find-count" class="esc-find-count" aria-live="polite">0 / 0</span>' +
        '<button id="esc-find-case" type="button" class="esc-find-opt" aria-pressed="false" title="Diferenciar maiúsculas e minúsculas">Aa</button>' +
        '<button id="esc-find-word" type="button" class="esc-find-opt" aria-pressed="false" title="Somente palavra inteira">ab</button>' +
        '<button id="esc-find-prev" type="button" class="esc-find-nav" aria-label="Ocorrência anterior" title="Anterior (Shift+Enter)">↑</button>' +
        '<button id="esc-find-next" type="button" class="esc-find-nav" aria-label="Próxima ocorrência" title="Próxima (Enter)">↓</button>' +
        '<button id="esc-find-close" type="button" class="esc-find-close" aria-label="Fechar localizar">×</button>' +
      '</div>' +
      '<div class="esc-find-row esc-replace-row">' +
        '<input id="esc-replace-input" class="esc-find-input" type="text" placeholder="Substituir por..." autocomplete="off" spellcheck="false" aria-label="Substituir por">' +
        '<button id="esc-replace-one" type="button" class="esc-find-act">Substituir</button>' +
        '<button id="esc-replace-all" type="button" class="esc-find-act">Todas</button>' +
        '<span id="esc-find-feedback" class="esc-find-feedback" role="status" aria-live="polite"></span>' +
      '</div>';

    if (host.parentNode) {
      host.parentNode.insertBefore(bar, host);
    }

    var findInput = bar.querySelector('#esc-find-input');
    var replaceInput = bar.querySelector('#esc-replace-input');
    var countEl = bar.querySelector('#esc-find-count');
    var feedbackEl = bar.querySelector('#esc-find-feedback');
    var btnCase = bar.querySelector('#esc-find-case');
    var btnWord = bar.querySelector('#esc-find-word');
    var btnPrev = bar.querySelector('#esc-find-prev');
    var btnNext = bar.querySelector('#esc-find-next');
    var btnClose = bar.querySelector('#esc-find-close');
    var btnOne = bar.querySelector('#esc-replace-one');
    var btnAll = bar.querySelector('#esc-replace-all');

    var matches = [];
    var currentIdx = -1;
    var caseSensitive = false;
    var wholeWord = false;

    function getText() {
      if (opts.getText) { return String(opts.getText() || ''); }
      return manuscript.value || '';
    }

    function isReadOnly() {
      return !!(opts.isReadOnly && opts.isReadOnly()) || !!manuscript.readOnly;
    }

    function syncReadOnly() {
      var ro = isReadOnly();
      if (replaceInput) { replaceInput.disabled = ro; }
      if (btnOne) { btnOne.disabled = ro || !matches.length; }
      if (btnAll) { btnAll.disabled = ro || !matches.length; }
    }

    function highlightCurrent(focusEditor) {
      if (!matches.length || currentIdx < 0 || currentIdx >= matches.length) {
        countEl.textContent = findInput.value ? '0 / 0' : '0 / 0';
        syncReadOnly();
        return;
      }
      var m = matches[currentIdx];
      countEl.textContent = (currentIdx + 1) + ' / ' + matches.length;
      if (opts.onReveal) {
        opts.onReveal(m.start, m.end, !!focusEditor);
      } else if (manuscript.setSelectionRange) {
        if (focusEditor && manuscript.focus) { manuscript.focus(); }
        manuscript.setSelectionRange(m.start, m.end);
      }
      syncReadOnly();
    }

    function refresh(keepNearPos) {
      var q = findInput.value || '';
      matches = findMatches(getText(), q, { caseSensitive: caseSensitive, wholeWord: wholeWord });
      if (!matches.length) {
        currentIdx = -1;
        countEl.textContent = q ? '0 / 0' : '0 / 0';
        syncReadOnly();
        return;
      }
      if (typeof keepNearPos === 'number') {
        currentIdx = 0;
        for (var i = 0; i < matches.length; i += 1) {
          if (matches[i].start >= keepNearPos) { currentIdx = i; break; }
        }
      } else if (currentIdx < 0 || currentIdx >= matches.length) {
        currentIdx = 0;
      }
      highlightCurrent(false);
    }

    function step(dir) {
      if (!matches.length) { refresh(); if (!matches.length) { return; } }
      currentIdx = (currentIdx + dir + matches.length) % matches.length;
      highlightCurrent(false);
    }

    function doReplaceOne() {
      if (isReadOnly() || !matches.length || currentIdx < 0) { return; }
      var m = matches[currentIdx];
      var rep = replaceInput.value || '';
      var ok = false;
      if (opts.onReplaceRange) {
        ok = opts.onReplaceRange(m.start, m.end, rep);
      } else {
        manuscript.value = replaceOne(manuscript.value, m, rep);
        ok = true;
      }
      if (ok) {
        feedbackEl.textContent = '1 substituição feita.';
        refresh(m.start + rep.length);
      }
    }

    function doReplaceAll() {
      if (isReadOnly() || !matches.length) { return; }
      var q = findInput.value || '';
      var rep = replaceInput.value || '';
      var total = matches.length;
      var run = function (confirmed) {
        if (!confirmed) { return; }
        var res = replaceAll(getText(), q, rep, { caseSensitive: caseSensitive, wholeWord: wholeWord });
        if (!res.count) { return; }
        if (opts.onReplaceAll) {
          opts.onReplaceAll(res.text, res.count);
        } else {
          manuscript.value = res.text;
        }
        feedbackEl.textContent = res.count + (res.count === 1 ? ' substituição feita.' : ' substituições feitas.');
        refresh(0);
      };
      if (root.Escr.dialog && root.Escr.dialog.ask && total > 1) {
        root.Escr.dialog.ask({
          title: 'Substituir todas as ocorrências?',
          message: 'Trocar ' + total + ' ocorrências de “' + q + '” por “' + rep + '” nesta folha?',
          accept: 'Substituir todas'
        }, run);
      } else {
        run(true);
      }
    }

    function open(initialQuery) {
      bar.hidden = false;
      feedbackEl.textContent = '';
      if (typeof initialQuery === 'string' && initialQuery) {
        findInput.value = initialQuery;
      } else if (!findInput.value && manuscript && typeof manuscript.selectionStart === 'number' && manuscript.selectionEnd > manuscript.selectionStart) {
        var sel = manuscript.value.slice(manuscript.selectionStart, manuscript.selectionEnd);
        if (sel.length <= 60 && sel.indexOf('\n') === -1) { findInput.value = sel; }
      }
      refresh(manuscript ? (manuscript.selectionStart || 0) : 0);
      findInput.focus();
      if (findInput.select) { findInput.select(); }
    }

    function close() {
      bar.hidden = true;
      feedbackEl.textContent = '';
      if (opts.onClose) { opts.onClose(); }
    }

    findInput.addEventListener('input', function () { feedbackEl.textContent = ''; refresh(); }, false);
    findInput.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.keyCode === 13) { ev.preventDefault(); step(ev.shiftKey ? -1 : 1); }
      else if (ev.key === 'Escape' || ev.keyCode === 27) { ev.preventDefault(); close(); }
    }, false);
    replaceInput.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.keyCode === 13) { ev.preventDefault(); doReplaceOne(); }
      else if (ev.key === 'Escape' || ev.keyCode === 27) { ev.preventDefault(); close(); }
    }, false);
    btnCase.addEventListener('click', function () {
      caseSensitive = !caseSensitive;
      btnCase.setAttribute('aria-pressed', caseSensitive ? 'true' : 'false');
      refresh();
    }, false);
    btnWord.addEventListener('click', function () {
      wholeWord = !wholeWord;
      btnWord.setAttribute('aria-pressed', wholeWord ? 'true' : 'false');
      refresh();
    }, false);
    btnPrev.addEventListener('click', function () { step(-1); }, false);
    btnNext.addEventListener('click', function () { step(1); }, false);
    btnClose.addEventListener('click', close, false);
    btnOne.addEventListener('click', doReplaceOne, false);
    btnAll.addEventListener('click', doReplaceAll, false);

    return {
      open: open,
      close: close,
      isOpen: function () { return !bar.hidden; },
      refresh: refresh
    };
  };
}(typeof window !== 'undefined' ? window : this));
