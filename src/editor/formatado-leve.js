(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var ALLOWED_TAGS = {
    P: 1, DIV: 1, BR: 1, B: 1, STRONG: 1, I: 1, EM: 1, U: 1,
    S: 1, STRIKE: 1, DEL: 1, H1: 1, H2: 1, H3: 1, UL: 1, OL: 1,
    LI: 1, BLOCKQUOTE: 1, PRE: 1, CODE: 1, HR: 1, SPAN: 1
  };
  var BLOCK_TAGS = {
    P: 1, DIV: 1, H1: 1, H2: 1, H3: 1, LI: 1, BLOCKQUOTE: 1, PRE: 1, HR: 1
  };

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function sanitizeNode(node, doc) {
    if (!node) { return null; }
    if (node.nodeType === 3) {
      return doc.createTextNode(node.nodeValue || '');
    }
    if (node.nodeType !== 1) { return null; }
    var tag = String(node.tagName || '').toUpperCase();
    var frag = doc.createDocumentFragment();
    var child = node.firstChild;
    while (child) {
      var cleanChild = sanitizeNode(child, doc);
      if (cleanChild) { frag.appendChild(cleanChild); }
      child = child.nextSibling;
    }
    if (!ALLOWED_TAGS[tag]) {
      return frag;
    }
    if (tag === 'BR' || tag === 'HR') {
      return doc.createElement(tag.toLowerCase());
    }
    var out = doc.createElement(tag === 'STRIKE' ? 's' : tag.toLowerCase());
    out.appendChild(frag);
    return out;
  }

  function sanitizeHtml(html) {
    if (typeof document === 'undefined' || !document.createElement) {
      return String(html || '');
    }
    var sandbox = document.createElement('div');
    sandbox.innerHTML = String(html || '');
    var holder = document.createElement('div');
    var child = sandbox.firstChild;
    while (child) {
      var clean = sanitizeNode(child, document);
      if (clean) { holder.appendChild(clean); }
      child = child.nextSibling;
    }
    return holder.innerHTML;
  }

  function plainToSafeHtml(text) {
    var lines = String(text || '').split(/\r?\n/);
    if (!lines.length || (lines.length === 1 && !lines[0])) {
      return '<p><br></p>';
    }
    var out = [], i, line, escaped;
    for (i = 0; i < lines.length; i += 1) {
      line = lines[i];
      if (!line) {
        out.push('<p><br></p>');
      } else if (/^###\s+(.*)$/.test(line)) {
        out.push('<h3>' + escapeHtml(line.replace(/^###\s+/, '')) + '</h3>');
      } else if (/^##\s+(.*)$/.test(line)) {
        out.push('<h2>' + escapeHtml(line.replace(/^##\s+/, '')) + '</h2>');
      } else if (/^#\s+(.*)$/.test(line)) {
        out.push('<h1>' + escapeHtml(line.replace(/^#\s+/, '')) + '</h1>');
      } else if (/^---+$/.test(line.replace(/^\s+|\s+$/g, ''))) {
        out.push('<hr>');
      } else if (/^>\s+(.*)$/.test(line)) {
        out.push('<blockquote>' + escapeHtml(line.replace(/^>\s+/, '')) + '</blockquote>');
      } else {
        escaped = escapeHtml(line);
        out.push('<p>' + escaped + '</p>');
      }
    }
    return out.join('');
  }

  function projectDomToPlain(rootEl) {
    var text = '';
    var map = [];
    if (!rootEl) { return { text: '', map: [] }; }

    function appendNewlineIfNeeded() {
      if (text.length > 0 && text.charAt(text.length - 1) !== '\n') {
        text += '\n';
      }
    }

    function walk(node, inList) {
      if (!node) { return; }
      if (node.nodeType === 3) {
        var val = node.nodeValue || '';
        if (val.length > 0) {
          map.push({
            node: node,
            plainStart: text.length,
            plainEnd: text.length + val.length
          });
          text += val;
        }
        return;
      }
      if (node.nodeType !== 1) { return; }
      var tag = String(node.tagName || '').toUpperCase();
      if (tag === 'BR') {
        var parentTag = node.parentNode && node.parentNode.tagName ? String(node.parentNode.tagName).toUpperCase() : '';
        if (parentTag && BLOCK_TAGS[parentTag] && node.parentNode.childNodes.length === 1) {
          // Empty block <p><br></p> already terminates via block exit
          return;
        }
        text += '\n';
        return;
      }
      if (tag === 'HR') {
        appendNewlineIfNeeded();
        text += '---\n';
        return;
      }
      if (tag === 'LI') {
        appendNewlineIfNeeded();
        if (inList === 'OL') {
          var siblings = node.parentNode ? node.parentNode.children : null;
          var idx = 1, k;
          if (siblings) {
            for (k = 0; k < siblings.length; k += 1) {
              if (siblings[k] === node) { idx = k + 1; break; }
            }
          }
          text += idx + '. ';
        } else {
          text += '- ';
        }
      }
      var listKind = tag === 'OL' ? 'OL' : tag === 'UL' ? 'UL' : inList;
      var child = node.firstChild;
      while (child) {
        walk(child, listKind);
        child = child.nextSibling;
      }
      if (BLOCK_TAGS[tag] && text.length > 0) {
        if (node.nextSibling) {
          if (text.charAt(text.length - 1) !== '\n') {
            text += '\n';
          }
        }
      }
    }

    var child = rootEl.firstChild;
    while (child) {
      walk(child, '');
      child = child.nextSibling;
    }
    return { text: text, map: map };
  }

  function htmlToPlainText(html) {
    if (typeof document === 'undefined' || !document.createElement) {
      return String(html || '').replace(/<[^>]+>/g, '');
    }
    var div = document.createElement('div');
    div.innerHTML = sanitizeHtml(html);
    return projectDomToPlain(div).text;
  }

  function mapPlainRangeToDom(rootEl, start, end) {
    var proj = projectDomToPlain(rootEl);
    var map = proj.map;
    if (!map.length || typeof document === 'undefined' || !document.createRange) { return null; }
    start = Math.max(0, Math.min(proj.text.length, start || 0));
    end = Math.max(start, Math.min(proj.text.length, end || start));

    var startEntry = map[map.length - 1], endEntry = map[map.length - 1], i;
    for (i = 0; i < map.length; i += 1) {
      if (start < map[i].plainEnd || (start === end && start === map[i].plainEnd)) { startEntry = map[i]; break; }
    }
    for (i = 0; i < map.length; i += 1) {
      if (end <= map[i].plainEnd) { endEntry = map[i]; break; }
    }
    var sOff = Math.max(0, Math.min(startEntry.node.nodeValue.length, start - startEntry.plainStart));
    var eOff = Math.max(0, Math.min(endEntry.node.nodeValue.length, end - endEntry.plainStart));
    var range = document.createRange();
    range.setStart(startEntry.node, sOff);
    range.setEnd(endEntry.node, eOff);
    return range;
  }

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el) { el.addEventListener(ev, fn, false); } }

  root.Escr.richEditor = {
    sanitizeHtml: sanitizeHtml,
    plainToSafeHtml: plainToSafeHtml,
    htmlToPlainText: htmlToPlainText,
    projectDomToPlain: projectDomToPlain,
    mapPlainRangeToDom: mapPlainRangeToDom
  };

  root.Escr.mountRichEditor = function (opts) {
    var manuscript = opts.manuscriptEl;
    var richEl = byId(opts.richId || 'esc-rich-editor');
    var toolbarEl = byId(opts.toolbarId || 'esc-rich-toolbar');
    var modeBtn = byId(opts.modeToggleId || 'esc-format-toggle');
    var richActive = false;
    var readOnly = false;

    function syncProjection() {
      if (!richActive || !richEl || !manuscript) { return; }
      var proj = projectDomToPlain(richEl);
      manuscript.value = proj.text;
      if (opts.onSync) {
        opts.onSync(proj.text, sanitizeHtml(richEl.innerHTML));
      }
    }

    function applyMode(isRich, doc) {
      richActive = !!isRich;
      if (document.body) {
        document.body.setAttribute('data-editor-format', richActive ? 'rich' : 'plain');
      }
      if (modeBtn) {
        modeBtn.setAttribute('aria-pressed', richActive ? 'true' : 'false');
        var lbl = modeBtn.querySelector ? modeBtn.querySelector('.esc-btn-label') : null;
        if (lbl) { lbl.textContent = richActive ? 'Formatado' : 'Texto simples'; }
        else { modeBtn.textContent = richActive ? 'Formatado' : 'Texto simples'; }
      }
      if (toolbarEl) { toolbarEl.hidden = !richActive || readOnly; }
      if (richEl) {
        richEl.hidden = !richActive;
        richEl.setAttribute('contenteditable', readOnly ? 'false' : 'true');
        if (richActive) {
          var rawHtml = doc && doc.richHtml ? sanitizeHtml(doc.richHtml) : plainToSafeHtml(manuscript ? manuscript.value : '');
          richEl.innerHTML = rawHtml || '<p><br></p>';
          var proj = projectDomToPlain(richEl);
          if (manuscript) { manuscript.value = proj.text; }
        }
      }
      if (manuscript) { manuscript.hidden = richActive; }
    }

    function execCmd(cmd, val) {
      if (!richActive || readOnly || !richEl) { return; }
      richEl.focus();
      try {
        if (cmd === 'checklist') {
          document.execCommand('insertText', false, '\u2610 ');
        } else if (cmd === 'hr') {
          document.execCommand('insertHorizontalRule', false);
        } else if (cmd === 'code') {
          document.execCommand('formatBlock', false, 'pre');
        } else {
          document.execCommand(cmd, false, val || null);
        }
      } catch (ignore) {}
      syncProjection();
    }

    if (toolbarEl) {
      var btns = toolbarEl.querySelectorAll('[data-rich-cmd]');
      var i;
      for (i = 0; i < btns.length; i += 1) {
        (function (btn) {
          on(btn, 'mousedown', function (ev) { ev.preventDefault(); });
          on(btn, 'click', function () {
            execCmd(btn.getAttribute('data-rich-cmd'), btn.getAttribute('data-rich-val'));
          });
        }(btns[i]));
      }
    }

    if (richEl) {
      on(richEl, 'input', syncProjection);
      on(richEl, 'mouseup', function (ev) {
        if (readOnly || ev.button !== 0 || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) { return; }
        if (!root.Escr.templates || !window.getSelection) { return; }
        var sel = window.getSelection();
        if (!sel || !sel.isCollapsed || !sel.anchorNode || sel.anchorNode.nodeType !== 3) { return; }
        var match = root.Escr.templates.placeholderAt(sel.anchorNode.nodeValue || '', sel.anchorOffset);
        if (!match) { return; }
        var r = document.createRange();
        r.setStart(sel.anchorNode, match.start);
        r.setEnd(sel.anchorNode, match.end);
        sel.removeAllRanges();
        sel.addRange(r);
        try { document.execCommand('delete', false); } catch (ignore) {}
        syncProjection();
      });
    }

    return {
      isRich: function () { return richActive; },
      sync: syncProjection,
      loadDoc: function (doc) {
        readOnly = !!(doc && (doc.locked || doc.category === 'reference'));
        applyMode(doc && doc.format === 'rich', doc);
      },
      toggleMode: function () {
        if (readOnly) { return; }
        var nextRich = !richActive;
        if (nextRich) {
          applyMode(true, { format: 'rich', richHtml: plainToSafeHtml(manuscript ? manuscript.value : '') });
          if (opts.onFormatChange) { opts.onFormatChange('rich', richEl ? sanitizeHtml(richEl.innerHTML) : ''); }
          if (richEl && richEl.focus) { richEl.focus(); }
        } else {
          var plain = richEl ? projectDomToPlain(richEl).text : (manuscript ? manuscript.value : '');
          if (manuscript) { manuscript.value = plain; }
          applyMode(false, { format: 'plain', text: plain });
          if (opts.onFormatChange) { opts.onFormatChange('plain', ''); }
          if (manuscript && manuscript.focus) { manuscript.focus(); }
        }
      },
      revealRange: function (start, end) {
        if (!richActive || !richEl || !window.getSelection) { return false; }
        var range = mapPlainRangeToDom(richEl, start, end);
        if (!range) { return false; }
        var sel = window.getSelection();
        richEl.focus();
        sel.removeAllRanges();
        sel.addRange(range);
        return true;
      },
      html: function () {
        return richActive && richEl ? sanitizeHtml(richEl.innerHTML) : '';
      }
    };
  };
}(typeof window !== 'undefined' ? window : this));
