(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var PALETTES = [
    { id: 'salvia', name: 'Sálvia', color: '#a3b899', paper: '#f0f4ee', edge: '#435439' },
    { id: 'areia', name: 'Areia', color: '#c2b69d', paper: '#f6f3ed', edge: '#574c35' },
    { id: 'pessego', name: 'Pêssego', color: '#cfae97', paper: '#f8f1eb', edge: '#634732' },
    { id: 'rosa', name: 'Rosa', color: '#c5a5a5', paper: '#f7efef', edge: '#5f3c3c' },
    { id: 'lavanda', name: 'Lavanda', color: '#b2a8be', paper: '#f3f1f6', edge: '#4e435b' },
    { id: 'nevoa', name: 'Névoa', color: '#9eb4b8', paper: '#edf3f4', edge: '#374e53' }
  ];

  var DEFAULT_PALETTE = {
    id: 'padrao',
    name: 'Sálvia padrão',
    color: '#c4cfc2',
    paper: '#ccd5c7',
    edge: '#354231'
  };

  function byId(id) {
    var i;
    for (i = 0; i < PALETTES.length; i += 1) {
      if (PALETTES[i].id === id) { return PALETTES[i]; }
    }
    return null;
  }

  function resolveBookPalette(book) {
    if (!book) { return DEFAULT_PALETTE; }
    var key = book.data && typeof book.data.palette === 'string' ? book.data.palette : '';
    if (key === 'padrao') { return DEFAULT_PALETTE; }
    var found = key ? byId(key) : null;
    if (found) { return found; }
    if (book.color) {
      var i;
      for (i = 0; i < PALETTES.length; i += 1) {
        if (PALETTES[i].color.toLowerCase() === String(book.color).toLowerCase()) {
          return PALETTES[i];
        }
      }
      return { id: 'custom', name: book.name || 'Projeto', color: book.color, paper: '#e6ece3', edge: '#354231' };
    }
    return PALETTES[0];
  }

  function applyToDocument(docEl, book) {
    if (!docEl || !docEl.style) { return DEFAULT_PALETTE; }
    var p = resolveBookPalette(book);
    if (docEl.style.setProperty) {
      docEl.style.setProperty('--esc-project-color', p.color);
      docEl.style.setProperty('--esc-project-paper', p.paper);
      docEl.style.setProperty('--esc-project-edge', p.edge);
    }
    if (docEl.setAttribute) {
      docEl.setAttribute('data-project-palette', p.id);
    }
    return p;
  }

  function assignPalette(notebooks, bookId, paletteId) {
    if (!notebooks || !bookId) { return null; }
    var book = notebooks.get(bookId), pal = paletteId === 'padrao' ? DEFAULT_PALETTE : byId(paletteId);
    if (!book || !pal) { return null; }
    var nextData = book.data ? JSON.parse(JSON.stringify(book.data)) : {};
    nextData.palette = pal.id;
    return notebooks.update(bookId, { color: pal.color, data: nextData });
  }

  root.Escr.projectColors = {
    list: function () { return PALETTES.slice(); },
    byId: byId,
    resolve: resolveBookPalette,
    apply: applyToDocument,
    assign: assignPalette
  };
}(typeof window !== 'undefined' ? window : this));
