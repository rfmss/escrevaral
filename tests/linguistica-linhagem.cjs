const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]),context=vm.createContext({setTimeout,clearTimeout});
for(const s of scripts){if(s.includes('root.Escr.mountUtilities'))break;vm.runInContext(s,context);}
for(const marker of ['/* Universo do caderno:','/* Quadro do caderno:','/* Reuso lexical:','/* Persistência linguística:','/* Linhagem local:','/* Cadernos: dados ES5'])vm.runInContext(scripts.find(s=>s.includes(marker)),context);
const E=context.Escr,full=E.createVault(E.knowledge,{incremental:false}),inc=E.createVault(E.knowledge),plain=v=>JSON.parse(JSON.stringify(v));
function normalized(v){const c=plain(v);delete c.processing;return c;}
let forms=[];E.knowledge.rules.forEach(r=>{if(r.forms)forms.push(...Object.keys(r.forms));});assert.ok(forms.length);
const samples=[forms.join(' '),forms.join('\n'),forms.join(' ')+'\n“'+forms.join('\n')+'”\n'+forms.join('\n'), '```\n'+forms.join('\n')+'\n```\n'+forms.join(' '), forms.join('\n')+'\nhttps://abc.com/teste\n',Array(150).fill(forms[0]).join('\n'), '“aberto\n'+forms.join('\n'),Array(100).fill('Este trecho permanece.').join('\n')];
for(const lens of ['ortografia','acentuacao'])for(const source of samples){for(const text of [source,source.replace(/\n/,'\nOutra linha.\n'),source+'\n'+forms[0],source.slice(3),source.replace(/“/,'')])assert.deepEqual(normalized(inc.analyze(lens,text)),normalized(full.analyze(lens,text)),lens+' deve equivaler ao motor integral');}
let source=Array(1000).fill(null).map((_,i)=>'Parágrafo '+i+' '+forms[i%forms.length]+'.').join('\n');inc.analyze('ortografia',source);const result=inc.analyze('ortografia',source.replace('Parágrafo 700','Alteração 700'));assert.ok(result.processing.reused>0);assert.deepEqual(normalized(result),normalized(full.analyze('ortografia',source)),'prefixo sem apontamento conserva posições quando comprimento igual');
const exact=Array(30).fill('Trecho estável.').join('\n')+'\n'+forms[0];inc.analyze('acentuacao',exact);const change=inc.analyze('acentuacao',exact+' outro');assert.ok(change.processing.reused>=30);assert.equal(change.processing.processed,1);
class Storage{constructor(){this.data=new Map();this.fail=false;}get length(){return this.data.size;}key(i){return [...this.data.keys()][i]||null;}getItem(k){return this.data.get(k)||null;}setItem(k,v){if(this.fail)throw new Error('quota');this.data.set(k,String(v));}removeItem(k){this.data.delete(k);}}
const storage=new Storage(),archive=E.createArchive(storage),books=E.createNotebooks(storage),book=books.add('Livro');let doc=E.freshDocument();doc.projectId=book.id;doc.project=book.name;doc.title='Capítulo';doc.text='Primeira versão.';doc=archive.save(doc).document;
doc.text='Segunda versão, ampliada.';doc=archive.save(doc,true).document;assert.equal(doc.lineage.entries[0].text,'Primeira versão.');
doc.text='Terceira versão.';doc=archive.save(doc,true).document;assert.equal(doc.lineage.entries[1].text,'Segunda versão, ampliada.');
const req=E.analysisContract.request(doc,doc.text),analysis=E.analysisContract.analyze(inc,'ortografia',req);const record=E.linguistics.remember(doc,req,analysis);assert.ok(E.linguistics.match(record,'ortografia',req));assert.equal(E.linguistics.match(record,'acentuacao',req),false);doc=archive.save(doc).document;
assert.equal(doc.lineage.entries.length,2,'guardar análise não cria nova versão textual');
const packet=books.pack(archive.list(true).documents,book.id),targetStore=new Storage(),target=E.createNotebooks(targetStore);target.bring(packet);target.bring(packet);const imported=E.createArchive(targetStore).list(true).documents;
assert.equal(imported.length,2);assert.equal(imported[1].lineage.entries[0].text,'Primeira versão.');assert.equal(imported[0].linguistics.records.length,1);
const original=storage.getItem('escrevaral.astra.v1.doc.'+doc.id);storage.fail=true;doc.text='Não perder anterior';assert.throws(()=>archive.save(doc,true));assert.equal(storage.getItem('escrevaral.astra.v1.doc.'+doc.id),original);storage.fail=false;doc=archive.get(doc.id);
for(let i=0;i<30;i++){doc.text='Marco '+i;doc=archive.save(doc,true).document;}assert.equal(doc.lineage.entries.length,20);
const bad=plain(packet);bad.documents[0].lineage.entries[0].text='x'.repeat(400001);assert.throws(()=>target.bring(bad));
assert.deepEqual(plain(E.lineage.difference('O mar voltou.','O vento voltou.')),{start:2,removed:'mar',added:'vento'});
let called=0;E.createLinguisticStore().get('missing',value=>{assert.equal(value,null);called++;});assert.equal(called,1,'fallback sem IndexedDB');
console.log('OK: corpus incremental equivalente, reuso parcial, regiões protegidas, limite de apontamentos; análises persistíveis; linhagem, limite, quota e pacotes.');
