/* Atalhos salvos (visões dinâmicas com filtros e contador ao vivo) — ES5 */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var KEY = 'escrevaral.shortcuts.v1';
  var OPERATORS = [
    ['includes', 'Cont\u00E9m'],
    ['startsWith', 'Come\u00E7a com'],
    ['=', '\u00C9 igual a']
  ];

  function norm(s) {
    var v = String(s || '').replace(/^\s+|\s+$/g, '');
    if (v.normalize) { try { v = v.normalize('NFC'); } catch (ignore) {} }
    return v.toLowerCase();
  }

  function validRule(r) {
    if (!r || typeof r !== 'object') { return false; }
    if (r.kind === 'starred') { return true; }
    if (r.kind === 'folder' || r.kind === 'project') { return typeof r.value === 'string' && r.value.length > 0; }
    if (r.kind === 'title') {
      var opOk = r.operator === 'includes' || r.operator === 'startsWith' || r.operator === '=';
      return opOk && typeof r.value === 'string' && norm(r.value).length > 0 && r.value.indexOf('.ago') < 0;
    }
    return false;
  }

  function matchRule(rule, doc) {
    if (!rule || !doc) { return false; }
    if (rule.kind === 'starred') { return !!doc.starred; }
    if (rule.kind === 'folder' || rule.kind === 'project') {
      return doc.projectId === rule.value || doc.folder === rule.value;
    }
    if (rule.kind === 'title') {
      var t = norm(doc.title || '');
      var q = norm(rule.value || '');
      if (!q) { return false; }
      if (rule.operator === 'includes') { return t.indexOf(q) >= 0; }
      if (rule.operator === 'startsWith') { return t.indexOf(q) === 0; }
      if (rule.operator === '=') { return t === q; }
    }
    return false;
  }

  function filterDocs(shortcut, docs) {
    var list = Object.prototype.toString.call(docs) === '[object Array]' ? docs : [];
    if (!shortcut || !shortcut.rules || !shortcut.rules.length) { return []; }
    var isOr = shortcut.mode === 'or';
    return list.filter(function (d) {
      if (!d || d.trashed || d.archived) { return false; }
      var i, hit;
      if (isOr) {
        for (i = 0; i < shortcut.rules.length; i += 1) {
          if (matchRule(shortcut.rules[i], d)) { return true; }
        }
        return false;
      }
      for (i = 0; i < shortcut.rules.length; i += 1) {
        hit = matchRule(shortcut.rules[i], d);
        if (!hit) { return false; }
      }
      return true;
    });
  }

  function createShortcutsStore(storage) {
    var counter = 0;
    function read() {
      if (!storage) { return []; }
      try {
        var raw = storage.getItem(KEY);
        if (!raw) { return []; }
        var parsed = JSON.parse(raw);
        if (Object.prototype.toString.call(parsed) !== '[object Array]') { return []; }
        return parsed.filter(function (item) {
          return item && typeof item.id === 'string' && typeof item.title === 'string' &&
            Object.prototype.toString.call(item.rules) === '[object Array]' && item.rules.length > 0;
        });
      } catch (e) { return []; }
    }
    function write(list) {
      if (!storage) { return; }
      storage.setItem(KEY, JSON.stringify(list));
    }
    return {
      list: read,
      get: function (id) {
        var all = read(), i;
        for (i = 0; i < all.length; i += 1) {
          if (all[i].id === id) { return all[i]; }
        }
        return null;
      },
      save: function (spec) {
        var title = String(spec && spec.title || '').replace(/^\s+|\s+$/g, '');
        if (!title) { throw new Error('D\u00EA um nome ao atalho para encontr\u00E1-lo depois.'); }
        var rules = spec && Object.prototype.toString.call(spec.rules) === '[object Array]' ? spec.rules : [];
        if (!rules.length) { throw new Error('Escolha quais textos quer reunir.'); }
        var i;
        for (i = 0; i < rules.length; i += 1) {
          if (!validRule(rules[i])) {
            throw new Error('Preencha todos os crit\u00E9rios do atalho (sem usar ".ago").');
          }
        }
        var all = read();
        var lower = norm(title);
        var id = spec && spec.id ? String(spec.id) : '';
        for (i = 0; i < all.length; i += 1) {
          if (all[i].id !== id && norm(all[i].title) === lower) {
            throw new Error('Voc\u00EA j\u00E1 tem um atalho com esse nome. Escolha outro.');
          }
        }
        counter += 1;
        var entry = {
          id: id || ('sc-' + new Date().getTime().toString(36) + '-' + counter),
          title: title.slice(0, 80),
          mode: spec && spec.mode === 'or' ? 'or' : 'and',
          rules: rules.slice(0, 8)
        };
        var replaced = false;
        for (i = 0; i < all.length; i += 1) {
          if (all[i].id === entry.id) { all[i] = entry; replaced = true; break; }
        }
        if (!replaced) { all.push(entry); }
        write(all);
        return entry;
      },
      remove: function (id) {
        var next = read().filter(function (item) { return item.id !== id; });
        write(next);
      }
    };
  }

  root.Escr.shortcutsCore = {
    KEY: KEY,
    OPERATORS: OPERATORS,
    validRule: validRule,
    matchRule: matchRule,
    filterDocs: filterDocs,
    createStore: createShortcutsStore
  };
}(typeof window !== 'undefined' ? window : this));
