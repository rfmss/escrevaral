/* Executar: node tests/cadernos.cjs. Sem dependências. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const scripts = Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g), m => m[1]);
scripts.forEach((s, i) => new vm.Script(s, {filename:'inline-'+i}));
const context = vm.createContext({});
for (const marker of ["var prefix = 'escrevaral.astra.v1.doc.'", 'E.validPlanner =', '/* Cadernos: dados ES5']) {
  vm.runInContext(scripts.find(s => s.includes(marker)), context);
}
const E = context.Escr;
class Storage {
  constructor() { this.data = new Map(); this.failAt = null; this.writes = 0; }
  get length() { return this.data.size; }
  key(i) { return Array.from(this.data.keys())[i] || null; }
  getItem(k) { return this.data.has(k) ? this.data.get(k) : null; }
  setItem(k,v) { if (++this.writes === this.failAt) { throw Object.assign(new Error('quota'),{name:'QuotaExceededError'}); } this.data.set(k,String(v)); }
  removeItem(k) { this.data.delete(k); }
}
const snapshot = s => JSON.stringify(Array.from(s.data).sort());
const src = new Storage(), archive = E.createArchive(src), books = E.createNotebooks(src);
let old = E.freshDocument(); old.project = 'Livro antigo'; old.title = 'Primeiro'; old.text = 'Texto íntegro: ação, café e mar.';
old.authorship = { hashes:['abc'], events:[{at:'2020-01-01',kind:'writing'}] };
old = archive.save(old).document;
const originalRaw = src.getItem('escrevaral.astra.v1.doc.'+old.id);
books.migrate(archive.list(true).documents);
assert.equal(src.getItem('escrevaral.astra.v1.doc.'+old.id), originalRaw, 'migração não reescreve documento');
const oldBook = books.resolve(old);
books.update(oldBook.id, {name:'Livro renomeado'});
assert.equal(books.decorate(old).project, 'Livro renomeado');
assert.equal(books.decorate(old).projectId, oldBook.id);
const empty = books.add('Vazio');
assert.equal(books.pack(archive.list(true).documents,empty.id).documents.length,0);
assert.throws(()=>books.add('Vazio'));
books.update(oldBook.id,{data:{planner:{}, attachments:[{name:'referência.txt',text:'material'}]}});
let reminder=E.freshDocument(); reminder.kind='reminder';reminder.projectId=oldBook.id;reminder.project='Livro renomeado';reminder.text='Lembrar';archive.save(reminder);
let trashed=E.freshDocument();trashed.projectId=oldBook.id;trashed.project='Livro renomeado';trashed.trashed=true;archive.save(trashed);
let general=E.freshDocument();general.kind='reminder';general.text='Mesa geral';archive.save(general);
src.setItem('vrda-planner','{}'); src.setItem('escrevaral.astra.theme','escuro');
const packet=books.pack(archive.list(true).documents,oldBook.id);
assert.equal(packet.documents.length,3);
assert.equal(Object.keys(packet.globals).length,0);
const all=books.pack(archive.list(true).documents);
assert.equal(all.notebooks.length,2);assert.equal(all.documents.length,4);assert.equal(all.globals['escrevaral.astra.theme'],'escuro');
const dst=new Storage(), imported=E.createNotebooks(dst);
imported.bring(packet);
const round=imported.pack(E.createArchive(dst).list(true).documents,oldBook.id);
assert.deepEqual(JSON.parse(JSON.stringify(round.documents)),JSON.parse(JSON.stringify(packet.documents)),'datas, revisões, autoria e conteúdo preservados');
assert.deepEqual(JSON.parse(JSON.stringify(round.notebooks[0].data)),JSON.parse(JSON.stringify(packet.notebooks[0].data)));
const beforeCopy=snapshot(dst), result=imported.bring(packet);
assert.equal(result.copies,1);assert.equal(imported.list().length,2);assert.equal(E.createArchive(dst).list(true).documents.length,6);
assert.equal(dst.getItem('escrevaral.astra.v1.doc.'+old.id),JSON.stringify(packet.documents.find(d=>d.id===old.id)),'original não sobrescrito');
const bad=JSON.parse(JSON.stringify(packet));bad.documents[0].projectId='missing';const beforeBad=snapshot(dst);assert.throws(()=>imported.bring(bad));assert.equal(snapshot(dst),beforeBad);
const duplicate=JSON.parse(JSON.stringify(packet));duplicate.documents.push(duplicate.documents[0]);duplicate.inventory.documents++;assert.throws(()=>imported.bring(duplicate));assert.equal(snapshot(dst),beforeBad);
// Falha em cada gravação do pacote: nenhuma importação parcial permanece.
for(let fail=1;fail<=packet.documents.length+2;fail++) {
  const store=new Storage();store.setItem('escrevaral.astra.theme','claro');const model=E.createNotebooks(store);const baseline=snapshot(store);store.failAt=store.writes+fail;
  assert.throws(()=>model.bring(packet));assert.equal(snapshot(store),baseline,'rollback no passo '+fail);
}
// Recuperação de encerramento abrupto após escrita parcial.
const interrupted=new Storage(); interrupted.setItem('escrevaral.astra.notebooks.transaction.v1',JSON.stringify({before:[['escrevaral.astra.v1.doc.partial',null]]}));interrupted.setItem('escrevaral.astra.v1.doc.partial','partial');E.createNotebooks(interrupted);assert.equal(interrupted.length,0);
// Caderno removido conserva conteúdo exportável e pode ser restaurado.
books.update(oldBook.id,{trashed:true});assert.equal(books.pack(archive.list(true).documents,oldBook.id).documents.length,3);books.update(oldBook.id,{trashed:false});
console.log('OK: sintaxe; migração; identidade; caderno vazio; pacote completo; ida e volta; autoria; colisões; validação; rollback; recuperação; lixeira.');
