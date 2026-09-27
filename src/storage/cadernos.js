/* Cadernos: dados ES5, independente da apresentação. */
(function (root) {
  'use strict';
  var E = root.Escr, key = 'escrevaral.astra.notebooks.v1', prefix = 'escrevaral.astra.v1.doc.';
  var originalKey = 'escrevaral.astra.originais.v1';
  var journalKey = 'escrevaral.astra.notebooks.transaction.v1';
  var globals = ['vrda-planner', 'escrevaral.astra.theme', 'escrevaral.astra.focus', 'escrevaral.astra.letter', 'escrevaral.astra.font-size', 'escrevaral.astra.restricted-paste', 'escrevaral.astra.pomodoro.v1', 'escrevaral.astra.session.v1', 'escrevaral.astra.current'];
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function array(value) { return Object.prototype.toString.call(value) === '[object Array]'; }
  function name(value) { return String(value || '').replace(/^\s+|\s+$/g, '').slice(0, 120); }
  function id() { return 'book-' + E.freshDocument().id; }
  function validBook(book) {
    return book && /^[a-z0-9-]+$/.test(book.id) && typeof book.id === 'string' && typeof book.name === 'string' && !!name(book.name) && book.name.length <= 120 &&
      array(book.aliases) && book.aliases.every(function (n) { return typeof n === 'string' && n.length <= 120; }) &&
      /^#[0-9a-f]{6}$/i.test(book.color) && book.data && typeof book.data === 'object' && !array(book.data) &&
      (typeof book.trashed === 'undefined' || typeof book.trashed === 'boolean') &&
      (typeof book.originalId === 'undefined' || book.originalId === null || (typeof book.originalId === 'string' && /^orig-[a-z0-9-]+$/.test(book.originalId)));
  }
  function validOriginal(o) {
    return o && typeof o.id === 'string' && /^orig-[a-z0-9-]+$/.test(o.id) && typeof o.name === 'string' && !!name(o.name) && o.name.length <= 120 && /^#[0-9a-f]{6}$/i.test(o.color) && (typeof o.trashed === 'undefined' || typeof o.trashed === 'boolean');
  }
  function create(storage) {
    var originals = [], books = [], colors = ['#c4cfc2', '#b2826a', '#859480', '#c2a649', '#a39b8b', '#997382'];
    function recover() {
      var raw = storage.getItem(journalKey); if (!raw) { return; }
      var journal = JSON.parse(raw);
      if (!journal || !array(journal.before) || !journal.before.every(function (p) { return array(p) && p.length === 2 && typeof p[0] === 'string' && (p[0] === key || p[0] === originalKey || p[0].indexOf(prefix) === 0 || globals.indexOf(p[0]) !== -1) && (p[1] === null || typeof p[1] === 'string'); })) { throw new Error('Registro de recuperação inválido. Preserve uma cópia dos dados.'); }
      /* Libera primeiro as chaves novas, inclusive sob falta de espaço. */
      journal.before.forEach(function (p) { if (p[1] === null) { storage.removeItem(p[0]); } });
      journal.before.forEach(function (p) { if (p[1] !== null) { storage.setItem(p[0], p[1]); } });
      storage.removeItem(journalKey);
    }
    function reload() {
      var raw = storage.getItem(key), next = raw ? JSON.parse(raw) : [];
      if (!array(next) || !next.every(validBook)) { throw new Error('Não foi possível ler os cadernos. Os dados foram preservados.'); }
      var rawOriginals = storage.getItem(originalKey), nextOriginals = rawOriginals ? JSON.parse(rawOriginals) : [];
      if (!array(nextOriginals) || !nextOriginals.every(validOriginal)) { throw new Error('Não foi possível ler as gavetas. Os dados foram preservados.'); }
      var seen = Object.create(null), seenBooks = Object.create(null);
      nextOriginals.forEach(function (o) { if (seen[o.id]) { throw new Error('Gaveta repetida no acervo.'); } seen[o.id] = o; });
      next.forEach(function (b) { if (seenBooks[b.id] || (b.originalId && !seen[b.originalId])) { throw new Error('Vínculo de caderno incompleto. Preserve uma cópia do acervo.'); } seenBooks[b.id] = true; });
      originals = nextOriginals; books = next; return books;
    }
    function commit(next) { if (storage.getItem(journalKey)) { throw new Error('Há uma recuperação pendente. Reabra o aplicativo.'); } storage.setItem(key, JSON.stringify(next)); books = next; }
    function transaction(writes) {
      if (storage.getItem(journalKey)) { throw new Error('Há uma recuperação pendente. Reabra o aplicativo.'); }
      var before = writes.map(function (p) { return [p[0], storage.getItem(p[0])]; });
      storage.setItem(journalKey, JSON.stringify({ before: before }));
      try { writes.forEach(function (p) { storage.setItem(p[0], p[1]); }); reload(); storage.removeItem(journalKey); }
      catch (e) { try { recover(); reload(); } catch (rollback) { throw new Error('A importação foi interrompida. Reabra o aplicativo para recuperar o estado anterior.'); } throw e; }
    }
    function original(origId) { for (var i = 0; i < originals.length; i += 1) { if (originals[i].id === origId) { return originals[i]; } } return null; }
    function parentId(origId) {
      if (origId === null || typeof origId === 'undefined') { return null; }
      if (typeof origId !== 'string' || !original(origId) || original(origId).trashed) { throw new Error('Escolha uma gaveta disponível.'); }
      return origId;
    }
    function duplicate(list, title, origId, except) { return list.some(function (b) { return b.id !== except && !b.trashed && (b.originalId || null) === (origId || null) && b.name.toLowerCase() === title.toLowerCase(); }); }
    function makeOriginal(title) { return { id: 'orig-' + E.freshDocument().id, name: name(title), color: '#2e382d', created: new Date().toISOString(), trashed: false }; }
    function addOriginal(title) {
      reload(); title = name(title); if (!title) { throw new Error('Dê um nome à gaveta.'); }
      if (originals.some(function (o) { return !o.trashed && o.name.toLowerCase() === title.toLowerCase(); })) { throw new Error('Já existe uma gaveta com esse nome.'); }
      var o = makeOriginal(title); transaction([[originalKey, JSON.stringify(originals.concat([o]))]]); return clone(o);
    }
    function updateOriginal(origId, changes) {
      reload(); var next = clone(originals), found = null;
      next.forEach(function (o) { if (o.id === origId) { found = o; } });
      if (!found) { throw new Error('Gaveta não encontrada.'); }
      if (typeof changes.name !== 'undefined') { found.name = name(changes.name); }
      if (typeof changes.trashed !== 'undefined') { found.trashed = changes.trashed; }
      if (!validOriginal(found) || next.some(function (o) { return o.id !== origId && !o.trashed && !found.trashed && o.name.toLowerCase() === found.name.toLowerCase(); })) { throw new Error('Confira o nome da gaveta; ele deve ser único.'); }
      /* A lixeira da gaveta conserva o estado individual de cada caderno. */
      transaction([[originalKey, JSON.stringify(next)]]); return clone(found);
    }
    function repairExperiment() {
      var raw = storage.getItem(key), next = raw ? JSON.parse(raw) : [], rawOriginals = storage.getItem(originalKey), os = rawOriginals ? JSON.parse(rawOriginals) : [], changed = false, seen = Object.create(null);
      if (!array(next) || !array(os) || !os.every(validOriginal)) { throw new Error('Acervo inválido. Os dados foram preservados.'); }
      os.forEach(function (o) { seen[o.id] = o; });
      next.forEach(function (b) {
        if (!b || typeof b !== 'object') { throw new Error('Caderno inválido.'); }
        if (b.originalId && typeof b.originalId === 'object' && Object.keys(b.originalId).length === 1 && typeof b.originalId.originalId === 'string') { b.originalId = b.originalId.originalId; changed = true; }
        if (!validBook(b)) { throw new Error('Caderno inválido. Os dados foram preservados.'); }
        if (b.originalId && !seen[b.originalId]) {
          var o = makeOriginal(b.name + ' — recuperado'); o.id = b.originalId; os.push(o); seen[o.id] = o; changed = true;
        }
      });
      if (changed) { transaction([[originalKey, JSON.stringify(os)], [key, JSON.stringify(next)]]); }
    }
    function make(title, origId) { return { id: id(), name: name(title), originalId: origId || null, aliases: [], color: colors[books.length % colors.length], data: {}, created: new Date().toISOString() }; }
    function find(bookId) { for (var i = 0; i < books.length; i += 1) { if (books[i].id === bookId) { return books[i]; } } return null; }
    function resolve(doc) {
      if (doc.projectId) { return find(doc.projectId); }
      var title = name(doc.project), i;
      if (!title && doc.kind === 'reminder') { return null; }
      for (i = 0; i < books.length; i += 1) { if (books[i].aliases.indexOf(title) !== -1 || (title && books[i].name === title)) { return books[i]; } }
      return null;
    }
    function decorate(doc) { var book = resolve(doc); if (book) { doc.projectId = book.id; doc.project = book.name; } return doc; }
    function migrate(documents) {
      reload(); var next = clone(books), changed = false;
      documents.forEach(function (doc) {
        if (resolve(doc) || (!doc.projectId && !name(doc.project) && doc.kind === 'reminder')) { return; }
        var title = name(doc.project), book = make(title || 'Avulsos');
        if (doc.projectId && /^[a-z0-9-]+$/.test(doc.projectId)) { book.id = doc.projectId; }
        book.aliases = [title]; next.push(book); books = next; changed = true;
      });
      if (changed) { try { commit(next); } catch (e) { reload(); throw e; } }
    }
    function add(title, origId) {
      reload(); title = name(title); if (!title) { throw new Error('Dê um nome ao caderno.'); }
      origId = parentId(origId);
      if (duplicate(books, title, origId)) { throw new Error('Já existe um caderno com esse nome.'); }
      var book = make(title, origId); commit(books.concat([book])); return book;
    }
    function update(bookId, changes) {
      reload(); var next = clone(books), book = null;
      next.forEach(function (b) { if (b.id === bookId) { book = b; } });
      if (!book) { throw new Error('Caderno não encontrado.'); }
      Object.keys(changes).forEach(function (k) { if (k !== 'id' && k !== 'aliases') { book[k] = clone(changes[k]); } });
      book.originalId = parentId(book.originalId);
      if (duplicate(next, book.name, book.originalId, book.id)) { throw new Error('Já existe um caderno com esse nome nesta gaveta ou mesa.'); }
      if (!validBook(book)) { throw new Error('Dados do caderno inválidos.'); } commit(next); return book;
    }
    function pack(documents, bookId, origId) {
      reload(); var selected = bookId ? books.filter(function (b) { return b.id === bookId; }) : origId ? books.filter(function (b) { return b.originalId === origId; }) : books;
      if (origId && !original(origId)) { throw new Error('Gaveta não encontrada.'); }
      var selectedIds = Object.create(null), parentIds = Object.create(null);
      selected.forEach(function (b) { selectedIds[b.id] = true; if (b.originalId) { parentIds[b.originalId] = true; } });
      if (origId) { parentIds[origId] = true; }
      var selectedOriginals = originals.filter(function (o) { return (!bookId && !origId) || parentIds[o.id]; });
      if (bookId && !selected.length) { throw new Error('Abra um caderno para exportar.'); }
      var docs = documents.map(function (d) { return decorate(clone(d)); }).filter(function (d) { return (!bookId && !origId) || !!selectedIds[d.projectId]; });
      var payload = { format: 'escrevaral-cadernos', version: 2, scope: bookId ? 'notebook' : origId ? 'original' : 'all', originals: clone(selectedOriginals), notebooks: clone(selected), documents: docs, globals: {} };
      if (!bookId && !origId) { globals.forEach(function (k) { var v = storage.getItem(k); if (v !== null) { payload.globals[k] = v; } }); }
      payload.inventory = { originals: selectedOriginals.length, notebooks: selected.length, documents: docs.length };
      return payload;
    }
    function validate(payload) {
      var ids = Object.create(null), records = Object.create(null);
      if (!payload || payload.format !== 'escrevaral-cadernos' || [1, 2].indexOf(payload.version) === -1 || (payload.version === 1 ? ['all', 'notebook'] : ['all', 'notebook', 'original']).indexOf(payload.scope) === -1 || !array(payload.notebooks) || !array(payload.documents) || !payload.notebooks.every(validBook) || !payload.documents.every(E.validDocument) || !payload.inventory || payload.inventory.notebooks !== payload.notebooks.length || payload.inventory.documents !== payload.documents.length || (payload.scope === 'notebook' && payload.notebooks.length !== 1)) { throw new Error('Pacote de caderno inválido ou incompleto.'); }
      var parents = Object.create(null);
      if (payload.version === 2) {
        if (!array(payload.originals) || !payload.originals.every(validOriginal) || payload.inventory.originals !== payload.originals.length || (payload.scope === 'original' && payload.originals.length !== 1)) { throw new Error('Cadastro de gavetas incompleto.'); }
        payload.originals.forEach(function (o) { if (parents[o.id]) { throw new Error('Gaveta repetida no pacote.'); } parents[o.id] = true; });
        payload.notebooks.forEach(function (b) { if ((b.originalId && !parents[b.originalId]) || (payload.scope === 'original' && b.originalId !== payload.originals[0].id)) { throw new Error('Vínculo de gaveta incompleto.'); } });
        if (payload.scope === 'notebook' && (payload.originals.length !== (payload.notebooks[0].originalId ? 1 : 0))) { throw new Error('Gavetas fora do caderno selecionado.'); }
      }
      payload.notebooks.forEach(function (b) { if (ids[b.id]) { throw new Error('Caderno repetido no pacote.'); } ids[b.id] = true; if (b.data.planner && !E.validPlanner(b.data.planner)) { throw new Error('Calendário inválido no caderno.'); } if (typeof b.data.chalk !== 'undefined' && !E.chalk.valid(b.data.chalk)) { throw new Error('Desenho inválido no caderno.'); } if (typeof b.data.story !== 'undefined' && !E.story.valid(b.data.story)) { throw new Error('Fichas ou cenas inválidas no caderno.'); } });
      payload.documents.forEach(function (d) {
        if (records[d.id] || (d.projectId && !ids[d.projectId]) || (!d.projectId && (payload.scope !== 'all' || d.kind !== 'reminder'))) { throw new Error('Vínculos incompletos no pacote.'); } records[d.id] = true;
      });
      if (!payload.globals || typeof payload.globals !== 'object' || array(payload.globals) || (payload.scope !== 'all' && Object.keys(payload.globals).length)) { throw new Error('Dados gerais inválidos.'); }
      Object.keys(payload.globals).forEach(function (k) { if (globals.indexOf(k) === -1 || typeof payload.globals[k] !== 'string') { throw new Error('Preferência desconhecida no pacote.'); } });
      if (payload.globals['vrda-planner'] && !E.validPlanner(JSON.parse(payload.globals['vrda-planner']))) { throw new Error('Calendário geral inválido.'); }
      return payload;
    }
    function bring(payload) {
      validate(payload); reload();
      var next = clone(books), mapping = Object.create(null), noteIds = Object.create(null), recordIds = Object.create(null), writes = [], copied = 0;
      var nextOriginals = clone(originals), parentMapping = Object.create(null);
      (payload.version === 2 ? payload.originals : []).forEach(function (source) {
        var o = clone(source), conflict = nextOriginals.some(function (n) { return n.id === o.id || (!n.trashed && n.name.toLowerCase() === o.name.toLowerCase()); });
        if (conflict) { o.sourceOriginalId = source.id; o.id = makeOriginal(o.name).id; var base = name(o.name).slice(0, 95), n = 1; do { o.name = base + ' — cópia ' + n; n += 1; } while (nextOriginals.some(function (p) { return p.name.toLowerCase() === o.name.toLowerCase(); })); }
        parentMapping[source.id] = o.id; nextOriginals.push(o);
      });
      payload.notebooks.forEach(function (source) {
        var b = clone(source); b.originalId = parentMapping[source.originalId] || null;
        var conflict = !!find(b.id) || duplicate(next, b.name, b.originalId);
        if (conflict) { b.sourceNotebookId = source.id; b.id = id(); var base = name(source.name).slice(0, 95), n = 1; do { b.name = base + ' — cópia ' + n; n += 1; } while (duplicate(next, b.name, b.originalId)); copied += 1; }
        /* Importados têm vínculos explícitos; aliases não capturam folhas antigas locais. */
        b.aliases = []; mapping[source.id] = b; next.push(b);
      });
      payload.documents.forEach(function (source) {
        var d = clone(source), b = mapping[d.projectId], conflict = storage.getItem(prefix + d.id) !== null || (b && b.id !== source.projectId), logical = d.noteId || d.id;
        if (conflict) { if (!noteIds[logical]) { noteIds[logical] = E.freshDocument().id; } d.sourceRecordId = source.id; d.sourceNoteId = logical; d.id = E.freshDocument().id; d.noteId = noteIds[logical]; }
        recordIds[source.id] = d.id;
        if (b) { d.projectId = b.id; d.project = b.name; }
        writes.push([prefix + d.id, JSON.stringify(d)]);
      });
      Object.keys(mapping).forEach(function (k) { var b = mapping[k]; if (b.resume && noteIds[b.resume.noteId]) { b.resume.noteId = noteIds[b.resume.noteId]; } if (b.data.story) { b.data.story = E.story.remap(b.data.story, noteIds); } });
      writes.push([originalKey, JSON.stringify(nextOriginals)]);
      writes.push([key, JSON.stringify(next)]);
      Object.keys(payload.globals).forEach(function (k) {
        var value = payload.globals[k];
        if (k === 'escrevaral.astra.current') { value = recordIds[value] || value; }
        if (k === 'escrevaral.astra.session.v1') { return; } /* A mesa mostra os cadernos importados. */
        writes.push([k, value]);
      });
      transaction(writes); return { notebooks: payload.notebooks.length, documents: payload.documents.length, copies: copied };
    }
    recover(); repairExperiment(); reload();
    var originalModel = { list: function () { reload(); return clone(originals); }, get: function (origId) { reload(); var o = original(origId); return o ? clone(o) : null; }, add: addOriginal, update: updateOriginal };
    return { originals: originalModel, list: function () { return clone(reload()); }, get: function (bookId) { reload(); var b = find(bookId); return b ? clone(b) : null; }, add: add, update: update, resolve: resolve, decorate: decorate, migrate: migrate, pack: pack, validate: validate, bring: bring };
  }
  E.createNotebooks = create;
  E.createOriginals = function (storage) { return create(storage).originals; };

}(typeof window !== 'undefined' ? window : this));
