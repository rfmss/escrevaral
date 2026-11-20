(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el) { el.addEventListener(ev, fn, false); } }

  function matchCasing(original, replacement) {
    if (!original || !replacement) { return replacement; }
    var first = original.charAt(0);
    if (first === first.toUpperCase() && first !== first.toLowerCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  }

  function trimWordSelection(raw, start) {
    if (!raw || raw.length > 64) { return null; }
    var leading = raw.match(/^\s*/)[0].length;
    var trailing = raw.match(/[\s.,;:!?()[\]"'«»—–-]*$/)[0].length;
    var end = raw.length - trailing;
    if (end <= leading) { return null; }
    var word = raw.slice(leading, end);
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[-'’][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/.test(word)) { return null; }
    return { word: word, start: start + leading, end: start + end };
  }

  root.Escr.mountWordCard = function (opts) {
    var service = opts.service || (root.Escr.createLexicoP01 ? root.Escr.createLexicoP01() : null);
    var manuscript = opts.manuscriptEl;
    var richEl = opts.richEl || null;
    var cardEl = null;
    var debounceTimer = null;
    var requestToken = 0;
    var currentState = null;

    function buildCard() {
      if (cardEl) { return cardEl; }
      var el = document.createElement('aside');
      el.id = 'esc-word-card';
      el.className = 'esc-palavra';
      el.setAttribute('role', 'region');
      el.setAttribute('aria-label', 'Definição e sinônimos');
      el.hidden = true;
      document.body.appendChild(el);
      cardEl = el;
      return cardEl;
    }

    function hide(restoreFocus) {
      requestToken += 1;
      window.clearTimeout(debounceTimer);
      currentState = null;
      if (cardEl) {
        cardEl.hidden = true;
      if (document.body) { document.body.removeAttribute('data-esc-consulta-open'); }
        cardEl.textContent = '';
      }
      if (restoreFocus) {
        if (richEl && !richEl.hidden && richEl.focus) { richEl.focus(); }
        else if (manuscript && !manuscript.hidden && manuscript.focus) { manuscript.focus(); }
      }
    }


    var showSources = false;
    function openManual(initialWord) {
      if (!service) { return; }
      buildCard();
      showSources = false;
      var q = String(initialWord || '').replace(/^\s+|\s+$/g, '');
      currentState = {
        mode: 'manual',
        textNode: null,
        originalWord: q,
        replaceStart: 0,
        replaceEnd: 0,
        canReplace: false,
        loading: !!q,
        replacedWith: null,
        index: 0,
        result: q ? null : { state: 'idle', entries: [] }
      };
      renderCard();
      if (q) {
        var token = ++requestToken;
        service.lookup(q, function (res) {
          if (token !== requestToken || !currentState) { return; }
          currentState.loading = false;
          currentState.result = res;
          renderCard();
        });
      }
    }

    function renderCard() {
      buildCard();
      if (!currentState) { hide(false); return; }
      cardEl.textContent = '';

      var header = document.createElement('header');
      header.className = 'esc-palavra-header';
      var title = document.createElement('strong');
      title.className = 'esc-palavra-title';
      title.textContent = currentState.originalWord;
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'esc-palavra-icon';
      closeBtn.textContent = '×';
      closeBtn.setAttribute('aria-label', 'Fechar consulta');
      on(closeBtn, 'click', function () { hide(true); });
      header.appendChild(title);
      header.appendChild(closeBtn);
      cardEl.appendChild(header);

      var content = document.createElement('div');
      content.className = 'esc-palavra-content';

      if (currentState.loading) {
        var waitP = document.createElement('p');
        waitP.className = 'esc-palavra-status';
        waitP.textContent = 'Consultando léxico PT-BR…';
        content.appendChild(waitP);
      } else if (!currentState.result || currentState.result.state !== 'found' || !currentState.result.entries.length) {
        var msgP = document.createElement('p');
        msgP.className = 'esc-palavra-status';
        msgP.textContent = currentState.result && currentState.result.state === 'unavailable'
          ? 'Pacote P01 indisponível nesta cópia.'
          : 'Palavra fora do recorte de sinônimos; isso não indica erro.';
        content.appendChild(msgP);
      } else {
        var entries = currentState.result.entries;
        var idx = Math.max(0, Math.min(entries.length - 1, currentState.index || 0));
        var entry = entries[idx];

        if (entry.posLabel || entry.lemma) {
          var cls = document.createElement('p');
          cls.className = 'esc-palavra-class';
          cls.textContent = (entry.posLabel ? entry.posLabel : '') + (entry.lemma && entry.lemma !== currentState.originalWord.toLowerCase() ? ' · lema: ' + entry.lemma : '');
          content.appendChild(cls);
        }
        if (entry.definition) {
          var def = document.createElement('p');
          def.className = 'esc-palavra-definition';
          def.textContent = entry.definition;
          content.appendChild(def);
        }
        if (entry.synonyms && entry.synonyms.length && currentState.canReplace) {
          var wordsWrap = document.createElement('div');
          wordsWrap.className = 'esc-palavra-words';
          entry.synonyms.slice(0, 3).forEach(function (syn) {
            var applied = currentState.replacedWith === syn;
            var btn = document.createElement('button');
            btn.type = 'button';
            function applyText(nextWord, nextReplaced) {
              if (currentState.mode === 'rich' && currentState.textNode) {
                var val = currentState.textNode.nodeValue || '';
                currentState.textNode.nodeValue = val.slice(0, currentState.replaceStart) + nextWord + val.slice(currentState.replaceEnd);
                currentState.replaceEnd = currentState.replaceStart + nextWord.length;
                currentState.replacedWith = nextReplaced;
                if (opts.onRichSync) { opts.onRichSync(); }
                renderCard();
              } else if (opts.onReplace && manuscript) {
                opts.onReplace(currentState.replaceStart, currentState.replaceEnd, nextWord);
                currentState.replaceEnd = currentState.replaceStart + nextWord.length;
                currentState.replacedWith = nextReplaced;
                renderCard();
              }
            }
            if (applied) {
              btn.className = 'esc-palavra-undo';
              btn.textContent = 'Desfazer (' + matchCasing(currentState.originalWord, syn) + ')';
              on(btn, 'click', function () { applyText(currentState.originalWord, null); });
            } else {
              btn.className = 'esc-palavra-word';
              btn.textContent = matchCasing(currentState.originalWord, syn);
              on(btn, 'click', function () { applyText(matchCasing(currentState.originalWord, syn), syn); });
            }
            wordsWrap.appendChild(btn);
          });
          content.appendChild(wordsWrap);
        } else if (entry.synonyms && entry.synonyms.length) {
          var ro = document.createElement('p');
          ro.className = 'esc-palavra-status';
          ro.textContent = 'Sinônimos: ' + entry.synonyms.slice(0, 3).join(', ');
          content.appendChild(ro);
        }
        if (entries.length > 1) {
          var nav = document.createElement('div');
          nav.className = 'esc-palavra-nav';
          var prev = document.createElement('button');
          prev.type = 'button';
          prev.textContent = '‹';
          prev.disabled = idx === 0;
          on(prev, 'click', function () { currentState.index = idx - 1; renderCard(); });
          var pos = document.createElement('span');
          pos.textContent = (idx + 1) + ' de ' + entries.length;
          var next = document.createElement('button');
          next.type = 'button';
          next.textContent = '›';
          next.disabled = idx >= entries.length - 1;
          on(next, 'click', function () { currentState.index = idx + 1; renderCard(); });
          nav.appendChild(prev);
          nav.appendChild(pos);
          nav.appendChild(next);
          content.appendChild(nav);
        }
      }

      if (!currentState.loading) {
      var toolsRow = document.createElement('div');
      toolsRow.className = 'esc-palavra-tools';
      var form = document.createElement('form');
      form.className = 'esc-palavra-search-form';
      var sInp = document.createElement('input');
      sInp.type = 'search';
      sInp.className = 'esc-palavra-search-input';
      sInp.placeholder = 'Consultar palavra';
      sInp.value = currentState.mode === 'manual' ? (currentState.originalWord || '') : '';
      var sBtn = document.createElement('button');
      sBtn.type = 'submit';
      sBtn.className = 'esc-palavra-search-btn';
      sBtn.textContent = 'Buscar';
      on(form, 'submit', function (ev) {
        ev.preventDefault();
        var w = String(sInp.value || '').replace(/^\s+|\s+$/g, '');
        if (w) { openManual(w); }
      });
      form.appendChild(sInp);
      form.appendChild(sBtn);
      toolsRow.appendChild(form);

      var infoBtn = document.createElement('button');
      infoBtn.type = 'button';
      infoBtn.className = 'esc-palavra-info-btn';
      infoBtn.title = 'Fontes da consulta lexical';
      infoBtn.setAttribute('aria-pressed', showSources ? 'true' : 'false');
      infoBtn.textContent = 'i';
      on(infoBtn, 'click', function () { showSources = !showSources; renderCard(); });
      toolsRow.appendChild(infoBtn);
      content.appendChild(toolsRow);

      if (showSources) {
        var srcBox = document.createElement('p');
        srcBox.className = 'esc-palavra-sources';
        srcBox.textContent = 'Acervo local P01 (7.661 lemas, 92.148 chaves): Wikcionário em português (CC-BY-SA 4.0), OpenWordNet-PT (CC-BY-SA 4.0) e PortiLexicon-UD (MIT). Consulta 100% offline.';
        content.appendChild(srcBox);
      }

      }
      cardEl.appendChild(content);
      cardEl.hidden = false;
      if (document.body) { document.body.setAttribute('data-esc-consulta-open', 'true'); }
    }

    function inspectSelection() {
      if (!service) { return; }
      var mode = 'plain', clean = null, textNode = null, canReplace = false;
      if (richEl && !richEl.hidden && document.activeElement && (document.activeElement === richEl || (richEl.contains && richEl.contains(document.activeElement))) && typeof window !== 'undefined' && window.getSelection) {
        var sel = window.getSelection();
        if (sel && sel.rangeCount && !sel.isCollapsed) {
          var range = sel.getRangeAt(0);
          if (range.startContainer === range.endContainer && range.startContainer.nodeType === 3 && richEl.contains(range.startContainer)) {
            clean = trimWordSelection((range.startContainer.nodeValue || '').slice(range.startOffset, range.endOffset), range.startOffset);
            textNode = range.startContainer;
            mode = 'rich';
            canReplace = richEl.getAttribute('contenteditable') === 'true';
          }
        }
      } else if (manuscript && !manuscript.hidden && document.activeElement === manuscript) {
        var start = manuscript.selectionStart, end = manuscript.selectionEnd;
        if (typeof start === 'number' && typeof end === 'number' && end > start) {
          clean = trimWordSelection(manuscript.value.slice(start, end), start);
          canReplace = !manuscript.readOnly && !manuscript.disabled;
        }
      } else {
        return;
      }
      if (!clean) {
        if (currentState) { hide(false); }
        return;
      }
      if (currentState && currentState.mode === mode && currentState.replaceStart === clean.start && currentState.originalWord === clean.word) {
        return;
      }
      var token = ++requestToken;
      currentState = {
        mode: mode,
        textNode: textNode,
        originalWord: clean.word,
        replaceStart: clean.start,
        replaceEnd: clean.end,
        canReplace: canReplace,
        loading: true,
        replacedWith: null,
        index: 0,
        result: null
      };
      renderCard();
      service.lookup(clean.word, function (res) {
        if (token !== requestToken || !currentState) { return; }
        currentState.loading = false;
        currentState.result = res;
        renderCard();
      });
    }

    function scheduleInspect() {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(inspectSelection, 140);
    }

    function bindTarget(el) {
      if (!el) { return; }
      on(el, 'mouseup', scheduleInspect);
      on(el, 'touchend', scheduleInspect);
      on(el, 'keyup', function (ev) {
        if (ev.shiftKey && ev.keyCode >= 33 && ev.keyCode <= 40) { scheduleInspect(); }
      });
      on(el, 'input', function () {
        if (currentState) { hide(false); }
      });
    }
    bindTarget(manuscript);
    bindTarget(richEl);

    on(document, 'keydown', function (ev) {
      if (ev.keyCode === 27 && cardEl && !cardEl.hidden) {
        ev.preventDefault();
        ev.stopPropagation();
        hide(true);
      }
    });
    on(document, 'mousedown', function (ev) {
      if (!cardEl || cardEl.hidden) { return; }
      if (cardEl.contains(ev.target) || ev.target === manuscript || (richEl && (ev.target === richEl || (richEl.contains && richEl.contains(ev.target))))) { return; }
      hide(false);
    });

    return {
      hide: hide,
      inspectSelection: inspectSelection,
      trimWordSelection: trimWordSelection,
      openManual: openManual
    };
  };
}(typeof window !== 'undefined' ? window : this));
