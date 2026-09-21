/* Contratos de caixas: dados reais, falhas de escrita e ida/volta. Sem dependências. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const c=vm.createContext({});
for(const marker of ["var prefix = 'escrevaral.astra.v1.doc.'",'E.validPlanner =','/* Universo do caderno:','/* Quadro do caderno:','/* Cadernos: dados ES5'])vm.runInContext(scripts.find(s=>s.includes(marker)),c);
const E=c.Escr,plain=v=>JSON.parse(JSON.stringify(v));
class Storage{constructor(){this.data=new Map();this.writes=0;this.failAt=0;}get length(){return this.data.size;}key(i){return [...this.data.keys()][i]||null;}getItem(k){return this.data.get(k)||null;}setItem(k,v){if(++this.writes===this.failAt)throw Error('quota');this.data.set(k,String(v));}removeItem(k){this.data.delete(k);}}
const snapshot=s=>JSON.stringify([...s.data].sort()),s=new Storage(),m=E.createNotebooks(s),o=m.originals;
const loose=m.add('Conto avulso');assert.equal(loose.originalId,null);assert.equal(o.list().length,0,'cadernos antigos não ganham caixas obrigatórias');
const box=o.add('Obra reunida'),b1=m.add('Volume I',box.id),b2=m.add('Volume II',box.id),other=o.add('Outra obra');
assert.equal(m.add('Volume I',other.id).name,'Volume I','nomes locais à caixa');
const before=snapshot(s);assert.throws(()=>m.add('Inválido',{originalId:box.id}));assert.equal(snapshot(s),before,'entrada inválida jamais chega ao armazenamento');
assert.throws(()=>m.update(b1.id,{originalId:'orig-inexistente'}));assert.equal(snapshot(s),before);
const archive=E.createArchive(s);let d=E.freshDocument();d.projectId=b1.id;d.project=b1.name;d.title='Capítulo';d.text='A casa ficou em silêncio.';d=archive.save(d).document;
m.update(b1.id,{data:{chalk:{version:1,grid:false,strokes:[]},planner:{}}});
const pack=m.pack(archive.list(true).documents,null,box.id);m.validate(pack);assert.equal(pack.scope,'original');assert.equal(pack.originals[0].name,'Obra reunida');assert.equal(pack.notebooks.length,2);assert.equal(pack.documents.length,1);
const dst=new Storage(),n=E.createNotebooks(dst);n.bring(pack);const round=n.pack(E.createArchive(dst).list(true).documents,null,box.id);assert.deepEqual(plain(round),plain(pack),'caixa, nomes, cadernos e conteúdo sobrevivem à ida/volta');
n.bring(pack);assert.equal(n.originals.list().length,2);assert.equal(n.list().length,4);const copy=n.originals.list().find(x=>x.id!==box.id);assert.ok(copy.name.includes('cópia'));assert.equal(n.list().filter(x=>x.originalId===copy.id).length,2);
const single=m.pack(archive.list(true).documents,b1.id);m.validate(single);assert.equal(single.originals.length,1);assert.equal(single.notebooks.length,1);
const empty=o.add('Vazia'),emptyPack=m.pack([],null,empty.id);m.validate(emptyPack);assert.equal(emptyPack.notebooks.length,0);
const bad=plain(pack);bad.originals=[];bad.inventory.originals=0;assert.throws(()=>n.bring(bad));
const wrongScope=plain(pack);wrongScope.notebooks[0].originalId=null;assert.throws(()=>n.validate(wrongScope));
const foreign=plain(single);foreign.originals.push(plain(other));foreign.inventory.originals++;assert.throws(()=>n.validate(foreign));
const old=plain(single);old.version=1;delete old.originals;delete old.inventory.originals;delete old.notebooks[0].originalId;const legacy=new Storage(),lm=E.createNotebooks(legacy);lm.bring(old);assert.equal(lm.list()[0].originalId,null);
// Todas as gravações: diário, documento, cadastro de caixas e cadernos.
for(let step=1;step<=4;step++){const st=new Storage(),model=E.createNotebooks(st),before=snapshot(st);st.failAt=step;assert.throws(()=>model.bring(pack));assert.equal(snapshot(st),before,'rollback da importação no passo '+step);}
// Recuperação do ensaio: objeto no lugar do ID, preservando integralmente o documento.
const damaged=new Storage();for(const [k,v]of s.data)damaged.setItem(k,v);const books=JSON.parse(damaged.getItem('escrevaral.astra.notebooks.v1'));books[0].originalId={originalId:box.id};damaged.setItem('escrevaral.astra.notebooks.v1',JSON.stringify(books));const originalDoc=damaged.getItem('escrevaral.astra.v1.doc.'+d.id);const repaired=E.createNotebooks(damaged);assert.equal(repaired.list()[0].originalId,box.id);assert.equal(damaged.getItem('escrevaral.astra.v1.doc.'+d.id),originalDoc);
for(let step=1;step<=3;step++){const st=new Storage();for(const [k,v]of damaged.data)st.setItem(k,v);st.setItem('escrevaral.astra.notebooks.v1',JSON.stringify(books));const before=snapshot(st);st.failAt=st.writes+step;assert.throws(()=>E.createNotebooks(st));assert.equal(snapshot(st),before,'rollback da recuperação no passo '+step);}
// Uma caixa na lixeira não altera a lixeira individual dos cadernos.
m.update(b2.id,{trashed:true});o.update(box.id,{trashed:true});assert.equal(m.get(b1.id).trashed,undefined);assert.equal(m.get(b2.id).trashed,true);o.update(box.id,{trashed:false});assert.equal(m.get(b2.id).trashed,true);
const trashPack=m.pack(archive.list(true).documents);m.validate(trashPack);
// Duas instâncias leem o cadastro atual antes de escrever.
const second=E.createNotebooks(s);o.add('Criada na aba A');second.originals.add('Criada na aba B');assert.ok(o.list().some(x=>x.name==='Criada na aba A'));assert.ok(o.list().some(x=>x.name==='Criada na aba B'));
console.log('OK: caixas opcionais; IDs; nomes por caixa; exportação completa e parcial; legado; colisões; recuperação do ensaio; rollback; lixeira e duas instâncias.');
