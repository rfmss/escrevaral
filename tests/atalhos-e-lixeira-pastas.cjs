/* Executar: node tests/atalhos-e-lixeira-pastas.cjs */
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

const ctx = vm.createContext({ window: null, document: {} });
ctx.window = ctx;
for (const marker of [
  "var prefix = 'escrevaral.astra.v1.doc.'",
  'E.countManuscript =',
  '/* Cadernos: dados ES5',
  'root.Escr.shortcutsCore ='
]) {
  vm.runInContext(scripts.find(s => s.includes(marker)), ctx);
}

const E = ctx.Escr;
const store = createStorage();
const archive = E.createArchive(store);
const books = E.createNotebooks(store);
const scStore = E.shortcutsCore.createStore(store);

// 1. Criar pasta + 2 notas
const bk = books.add('Romance Sombra');
let n1 = E.freshDocument(); n1.title = 'Capítulo 1 · Neblina'; n1.text = 'Texto 1'; n1.projectId = bk.id; n1.project = bk.name; n1.starred = true; n1 = archive.save(n1).document;
let n2 = E.freshDocument(); n2.title = 'Notas soltas'; n2.text = 'Texto 2'; n2.projectId = bk.id; n2.project = bk.name; n2 = archive.save(n2).document;

// 2. Atalhos salvos: criar, rejeitar ".ago", rejeitar duplicado, filtrar com AND/OR
assert.throws(() => scStore.save({ title: 'Ruim', rules: [{ kind: 'title', operator: 'includes', value: '1.ago' }] }));
const sc = scStore.save({
  title: 'Capítulos favoritos',
  mode: 'and',
  rules: [
    { kind: 'title', operator: 'startsWith', value: 'Capítulo' },
    { kind: 'starred', operator: '=', value: '' }
  ]
});
assert.throws(() => scStore.save({ title: 'capítulos favoritos', rules: [{ kind: 'starred', operator: '=', value: '' }] }));
const matched = E.shortcutsCore.filterDocs(sc, archive.list(true).documents);
assert.equal(matched.length, 1);
assert.equal(matched[0].id, n1.id);

// 3. LIX-01: mover pasta para lixeira, restaurar e excluir definitivamente (purge)
books.update(bk.id, { trashed: true });
assert.equal(books.get(bk.id).trashed, true);
books.update(bk.id, { trashed: false });
assert.equal(books.get(bk.id).trashed, false);
books.update(bk.id, { trashed: true });
assert.equal(books.purge(bk.id), true);
assert.equal(books.get(bk.id), null);

// 4. Remover atalho
scStore.remove(sc.id);
assert.equal(scStore.list().length, 0);

console.log('OK: Atalhos salvos (regras, validação, contador) e LIX-01 (lixeira/restauração/purge de pastas) verificados.');
