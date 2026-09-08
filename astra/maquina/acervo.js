(function (root) {
  'use strict';
  root.Escr = root.Escr || {};
  var prefix = 'escrevaral.astra.v1.doc.', counter = 0;
  function uid() { counter += 1; return new Date().getTime().toString(36) + '-' + Math.random().toString(36).slice(2, 10) + '-' + counter; }
  function valid(doc) {
    return doc && typeof doc.id === 'string' && /^[a-z0-9-]+$/.test(doc.id) && typeof doc.title === 'string' && typeof doc.text === 'string' && typeof doc.updated === 'string' && isFinite(Date.parse(doc.updated)) && typeof doc.revision === 'number' && doc.revision >= 0 && doc.revision % 1 === 0 && Object.prototype.toString.call(doc.dismissed) === '[object Array]' && doc.dismissed.every(function (x) { return typeof x === 'string'; });
  }
  function fresh() { return { id: uid(), title: '', text: '', updated: new Date().toISOString(), revision: 0, dismissed: [] }; }
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
      docs.sort(function (a, b) { return a.updated < b.updated ? 1 : a.updated > b.updated ? -1 : a.id < b.id ? -1 : 1; });
      return { documents: docs, unreadable: unreadable };
    }
    function save(doc) {
      if (!valid(doc)) { throw new Error('A folha não pôde ser guardada. Baixe uma cópia do texto.'); }
      var current = get(doc.id), copy = JSON.parse(JSON.stringify(doc)), conflict = false;
      if ((current && current.revision !== doc.revision) || (!current && doc.revision !== 0)) {
        copy.title = (copy.title || 'Sem título') + ' — versão preservada'; conflict = true;
      }
      copy.id = uid(); copy.revision += 1; copy.updated = new Date().toISOString();
      /* Chave nova por gravação: duas abas nunca escrevem sobre a mesma chave. */
      storage.setItem(prefix + copy.id, JSON.stringify(copy));
      /* Só retirar a antecessora depois da nova gravação. Falha aqui deixa uma cópia extra. */
      if (current && !conflict) { try { storage.removeItem(prefix + doc.id); } catch (e) { /* Cópia extra no acervo. */ } }
      return { document: copy, conflict: conflict };
    }
    return { get: get, list: list, save: save, fresh: fresh };
  }
  root.Escr.createArchive = createArchive;
  root.Escr.freshDocument = fresh;
  root.Escr.validDocument = valid;
}(typeof window !== 'undefined' ? window : this));
