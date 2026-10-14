'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function load(file, args = []) {
  return vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {})(...args);
}
const model = load('src/editor/documento.js');
const repositoryFactory = load('src/storage/rascunho.js', [model]);
const sessions = load('src/editor/sessao.js', [model]);
function memory() {
  const data = new Map();
  return { data, fail: null,
    get length() { return data.size; }, key(i) { return [...data.keys()][i]; },
    getItem(k) { return data.has(k) ? data.get(k) : null; },
    setItem(k, v) { if (this.fail && this.fail(k)) throw Error('quota'); data.set(k, v); }
  };
}
let cases = 0;
function test(name, fn) { fn(); cases++; console.log('PASS: ' + name); }
test('grava e reabre texto Unicode sem alteração', () => {
  const storage = memory(), repo = repositoryFactory.create(storage, 'a');
  const session = sessions.create(repo, () => 1000), text = 'Eu canto. O canto.\nac\u0327a\u0303o 🌊';
  session.change('Minha folha', text); assert(session.save().ok);
  const reopened = sessions.create(repositoryFactory.create(storage, 'b'), () => 2000);
  assert.equal(reopened.snapshot().text, text); assert.equal(reopened.dirty(), false);
});
test('falha de gravação mantém rascunho, versão anterior e cópia recuperável', () => {
  const storage = memory(), repo = repositoryFactory.create(storage, 'a');
  const session = sessions.create(repo, () => 1000);
  session.change('Título', 'primeiro'); session.save();
  storage.fail = key => key === repo.key;
  session.change('Título', 'segundo'); assert.equal(session.save().ok, false);
  assert.equal(session.snapshot().text, 'segundo'); assert(session.dirty());
  assert.equal(repo.read().record.text, 'primeiro');
  assert(repo.recoveries().items.some(x => x.record.text === 'segundo'));
});
test('duas sessões não sobrescrevem silenciosamente e preservam conflito', () => {
  const storage = memory(), aRepo = repositoryFactory.create(storage, 'a'), bRepo = repositoryFactory.create(storage, 'b');
  const a = sessions.create(aRepo, () => 1000), b = sessions.create(bRepo, () => 2000);
  a.change('', 'aba A'); assert(a.save().ok);
  b.change('', 'aba B'); assert.equal(b.save().reason, 'conflict');
  assert.equal(aRepo.read().record.text, 'aba A');
  assert(bRepo.recoveries().items.some(x => x.record.text === 'aba B'));
});
test('composição IME suspende salvamento e conserva o texto final', () => {
  const storage = memory(), repo = repositoryFactory.create(storage, 'a'), session = sessions.create(repo, () => 1000);
  session.compose(true); session.change('', 'a');
  assert.equal(session.save().reason, 'composing'); assert.equal(repo.read().raw, null);
  session.change('', 'ã'); session.compose(false); assert(session.save().ok);
  assert.equal(repo.read().record.text, 'ã');
});
test('origem corrompida é preservada; rascunho continua disponível para exportar', () => {
  const storage = memory(), repo = repositoryFactory.create(storage, 'a');
  storage.setItem(repo.key, '{corrompido');
  const session = sessions.create(repo, () => 1000); session.change('', 'novo rascunho');
  assert.equal(session.save().reason, 'unreadable');
  assert.equal(storage.getItem(repo.key), '{corrompido'); assert.equal(session.snapshot().text, 'novo rascunho');
  assert(session.restore({ schema: 1, title: 'cópia', text: 'resgatado', updated: 1, revision: 1 }));
  assert.equal(session.snapshot().text, 'resgatado');
  assert.equal(session.save().reason, 'unreadable'); assert.equal(storage.getItem(repo.key), '{corrompido');
});
test('restaurar é explícito e não grava antes do comando', () => {
  const storage = memory(), repo = repositoryFactory.create(storage, 'a'), session = sessions.create(repo, () => 1000);
  session.change('', 'primeiro'); session.save(); session.change('', 'segundo'); session.save();
  const record = repo.recoveries().items[0].record;
  assert(session.restore(record)); assert.equal(repo.read().record.text, 'segundo');
  assert.equal(session.snapshot().text, 'primeiro'); assert(session.save().ok);
  assert.equal(repo.read().record.text, 'primeiro');
});
test('armazenamento negado mantém o rascunho em memória', () => {
  const session = sessions.create(repositoryFactory.create(null, 'a'), () => 1000);
  session.change('', 'não perder'); assert.equal(session.save().reason, 'unavailable');
  assert.equal(session.snapshot().text, 'não perder'); assert(session.dirty());
});
console.log('Concluído: ' + cases + ' cenários de risco. Sem auditoria ampla.');
