/* Executar: node tests/tres-colunas-e-cores.cjs */
'use strict';
const vm = require('node:vm');
const assert = require('node:assert/strict');
const scripts = require('./helpers/sources.cjs').scripts();

function createStorage() {
  const data = new Map();
  return {
    get length() { return data.size; },
    key(i) { return Array.from(data.keys())[i] || null; },
    getItem(k) { return data.has(k) ? data.get(k) : null; },
    setItem(k, v) { data.set(k, String(v)); },
    removeItem(k) { data.delete(k); }
  };
}

function makeEl(tag, id) {
  const attrs = {};
  const listeners = {};
  const el = {
    tagName: tag.toUpperCase(),
    id: id || '',
    className: '',
    textContent: '',
    value: '',
    hidden: false,
    disabled: false,
    children: [],
    parentNode: null,
    style: {
      vars: {},
      setProperty(k, v) { this.vars[k] = v; },
      getPropertyValue(k) { return this.vars[k] || ''; }
    },
    setAttribute(k, v) { attrs[k] = String(v); },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(attrs, k) ? attrs[k] : null; },
    removeAttribute(k) { delete attrs[k]; },
    appendChild(child) { child.parentNode = el; el.children.push(child); return child; },
    addEventListener(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); },
    click() { (listeners.click || []).forEach(fn => fn({ stopPropagation() {}, preventDefault() {}, target: el })); },
    contains(target) {
      let cur = target;
      while (cur) { if (cur === el) return true; cur = cur.parentNode; }
      return false;
    },
    focus() {}
  };
  return el;
}

const byIdMap = {};
const ids = [
  'esc-library-filters', 'esc-project-tree', 'esc-items-search', 'esc-items-title',
  'esc-items-count', 'esc-items-list', 'esc-empty-trash', 'esc-new-note',
  'esc-items-search-clear', 'esc-nav-toggle', 'esc-lists-toggle', 'esc-new-project',
  'esc-open-mesa', 'esc-mobile-nav', 'esc-mobile-items', 'esc-mobile-editor',
  'esc-color-popover', 'writing-space'
];
ids.forEach(id => { byIdMap[id] = makeEl('div', id); });
byIdMap['esc-items-search'] = makeEl('input', 'esc-items-search');

const docListeners = {};
const timers = [];
const context = vm.createContext({
  document: {
    body: makeEl('body', ''),
    getElementById(id) { return byIdMap[id] || null; },
    createElement(tag) { return makeEl(tag, ''); },
    createElementNS(ns, tag) { return makeEl(tag, ''); },
    addEventListener(ev, fn) { (docListeners[ev] = docListeners[ev] || []).push(fn); }
  },
  window: null,
  setTimeout(fn) { timers.push(fn); return timers.length; },
  clearTimeout() {}
});
context.window = context;

for (const marker of [
  "var prefix = 'escrevaral.astra.v1.doc.'",
  'E.countManuscript =',
  '/* Cadernos: dados ES5',
  'var PALETTES =',
  'root.Escr.mountWorkspace ='
]) {
  vm.runInContext(scripts.find(s => s.includes(marker)), context);
}

const E = context.Escr;
const store = createStorage();
const archive = E.createArchive(store);
const books = E.createNotebooks(store);

// 1. Documento metadata validation & persistence
let doc1 = E.freshDocument();
doc1.title = 'Poema inicial';
doc1.text = 'Verso primeiro\nVerso segundo';
doc1.starred = true;
doc1.archived = false;
doc1.locked = false;
doc1.format = 'rich';
doc1.richHtml = '<p>Verso primeiro</p>';
doc1.folder = '02 · Poema';
doc1.role = 'sonnet';
doc1.category = 'reference';
doc1.sonnetSettings = { scheme: 'ABBA ABBA CDC DCD' };

const book = books.add('Meu Soneto');
doc1.projectId = book.id;
doc1.project = book.name;
doc1 = archive.save(doc1).document;

const reloaded = archive.get(doc1.id);
assert.equal(reloaded.starred, true);
assert.equal(reloaded.folder, '02 · Poema');
assert.equal(reloaded.format, 'rich');
assert.equal(reloaded.sonnetSettings.scheme, 'ABBA ABBA CDC DCD');

const invalidDoc = E.freshDocument();
invalidDoc.starred = 'yes';
assert.throws(() => archive.save(invalidDoc));

// 2. Pantone project colors (6 palettes)
assert.equal(E.projectColors.list().length, 6);
const updatedBook = E.projectColors.assign(books, book.id, 'lavanda');
assert.equal(updatedBook.data.palette, 'lavanda');
assert.equal(updatedBook.color, '#b2a8be');
const applied = E.projectColors.apply(context.document.body, updatedBook);
assert.equal(applied.paper, '#f3f1f6');
assert.equal(context.document.body.style.getPropertyValue('--esc-project-color'), '#b2a8be');

// 3. Three-column UI mounting, Library filters, Tree & E-Ink flash
let current = reloaded;
let flashed = false;
const ws = E.mountWorkspace({
  storage: store,
  archive,
  notebooks: books,
  originals: books.originals,
  currentDoc: () => current,
  openDoc: () => { flashed = true; ws.flashEink(); },
  newNote: () => {},
  newProject: () => {},
  updateDocMeta: () => {}
});
ws.render();

assert.equal(byIdMap['esc-library-filters'].children.length, 5);
assert.equal(byIdMap['esc-items-list'].children.length, 1);
assert.equal(byIdMap['esc-project-tree'].children.length, 1);

ws.flashEink();
assert.equal(byIdMap['writing-space'].getAttribute('data-eink-flash'), 'true');
timers.forEach(fn => fn());
assert.equal(byIdMap['writing-space'].getAttribute('data-eink-flash'), null);

console.log('OK: três colunas, metadados de nota, 6 cores Pantone e flash E-Ink verificados.');
