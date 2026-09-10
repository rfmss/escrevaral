(function (root) {
  'use strict';
  root.Escr = root.Escr || {};
  var prefix = 'escrevaral.astra.v1.doc.', counter = 0;
  function uid() { counter += 1; return new Date().getTime().toString(36) + '-' + Math.random().toString(36).slice(2, 10) + '-' + counter; }
  function valid(doc) {
    return doc && typeof doc.id === 'string' && /^[a-z0-9-]+$/.test(doc.id) && (typeof doc.noteId === 'undefined' || (typeof doc.noteId === 'string' && /^[a-z0-9-]+$/.test(doc.noteId))) && typeof doc.title === 'string' && typeof doc.text === 'string' && typeof doc.updated === 'string' && isFinite(Date.parse(doc.updated)) && (typeof doc.created === 'undefined' || (typeof doc.created === 'string' && isFinite(Date.parse(doc.created)))) && (typeof doc.createdApproximate === 'undefined' || typeof doc.createdApproximate === 'boolean') && typeof doc.revision === 'number' && doc.revision >= 0 && doc.revision % 1 === 0 && Object.prototype.toString.call(doc.dismissed) === '[object Array]' && doc.dismissed.every(function (x) { return typeof x === 'string'; });
  }
  function fresh() { var now = new Date().toISOString(), id = uid(); return { id: id, noteId: id, title: '', text: '', created: now, updated: now, revision: 0, dismissed: [] }; }
  function dateOf(doc) { return doc.created || doc.updated; }
  function createArchive(storage) {
    function get(id) { var raw = storage.getItem(prefix + id), doc = raw ? JSON.parse(raw) : null; if (doc && !valid(doc)) { throw new Error('Esta folha não pôde ser lida. Sua cópia guardada foi preservada.'); } return doc; }
    function list() {
      var docs = [], unreadable = 0, i, key, doc;
      for (i = 0; i < storage.length; i += 1) {
        key = storage.key(i);
        if (key && key.indexOf(prefix) === 0) {
          try { doc = get(key.slice(prefix.length)); if (doc) { docs.push(doc); } } catch (e) { unreadable += 1; }
        }
      }
      docs.sort(function (a, b) { return Date.parse(dateOf(b)) - Date.parse(dateOf(a)) || ((a.noteId || a.id) < (b.noteId || b.id) ? -1 : (a.noteId || a.id) > (b.noteId || b.id) ? 1 : 0); });
      return { documents: docs, unreadable: unreadable };
    }
    function save(doc) {
      if (!valid(doc)) { throw new Error('A folha não pôde ser guardada. Baixe uma cópia do texto.'); }
      var current = get(doc.id), copy = JSON.parse(JSON.stringify(doc)), conflict = false;
      if ((current && current.revision !== doc.revision) || (!current && doc.revision !== 0)) {
        copy.title = (copy.title || 'Sem título') + ' — versão preservada'; conflict = true;
      }
      /* Folhas antigas só tinham a última gravação: preservar essa data sem inventar a criação. */
      if (!copy.created) { copy.created = copy.updated; copy.createdApproximate = true; }
      copy.noteId = copy.noteId || copy.id; copy.id = uid(); copy.revision += 1; copy.updated = new Date().toISOString();
      /* Chave nova por gravação: duas abas nunca escrevem sobre a mesma chave. */
      storage.setItem(prefix + copy.id, JSON.stringify(copy));
      /* Só retirar a antecessora depois da nova gravação. Falha aqui deixa uma cópia extra. */
      if (current && !conflict) { try { storage.removeItem(prefix + doc.id); } catch (e) { /* Cópia extra no acervo. */ } }
      return { document: copy, conflict: conflict };
    }
    return { get: get, list: list, save: save, fresh: fresh };
  }
  function dateKey(entry) {
    var d = new Date(dateOf(entry));
    function pad(n) { return n < 10 ? '0' + n : String(n); }
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function searchKey(value) {
    return String(value || '').toLowerCase().replace(/[àáâãä]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/ç/g, 'c');
  }
  function browseNotes(entries, options) {
    options = options || {};
    var query = searchKey(options.query).replace(/^\s+|\s+$/g, ''), months = {}, days = {}, notes = [];
    entries.forEach(function (entry) {
      var day = dateKey(entry), month = day.slice(0, 7);
      months[month] = (months[month] || 0) + 1;
      if (month === options.month) { days[day] = (days[day] || 0) + 1; }
      if (query ? searchKey(entry.title + '\n' + entry.text).indexOf(query) !== -1 : day === options.day) { notes.push(entry); }
    });
    notes.sort(function (a, b) { return Date.parse(dateOf(a)) - Date.parse(dateOf(b)) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0); });
    function groups(map) { return Object.keys(map).sort().reverse().map(function (key) { return { key: key, count: map[key] }; }); }
    return { query: query, months: groups(months), days: groups(days), notes: notes };
  }
  root.Escr.noteDateKey = dateKey;
  root.Escr.browseNotes = browseNotes;
  root.Escr.createArchive = createArchive;
  root.Escr.freshDocument = fresh;
  root.Escr.validDocument = valid;
}(typeof window !== 'undefined' ? window : this));
