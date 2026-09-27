const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=require('./helpers/sources.cjs').scripts().join('\n'),ctx=vm.createContext({});
for(const source of require('./helpers/sources.cjs').scripts()){if(source.includes('root.Escr.mountUtilities'))break;vm.runInContext(source,ctx);}
const E=ctx.Escr,vault=E.createVault(E.knowledge),corpus=require('../ptbr/corpus/locucoes-1.json'),failures=[];
function exact(text,findings){for(const f of findings){for(const s of [f,f.head,f.clause,...f.context,...f.components].filter(Boolean)){assert.equal(text.slice(s.start,s.end),s.snippet);}for(const c of f.components){assert.ok(c.start>=f.start&&c.end<=f.end);}}}
for(const c of corpus.cases){try{const r=vault.analyze('sintaxe',c.text);exact(c.text,r.findings);const groups=r.findings.filter(f=>f.feature==='Locução verbal');
 if(c.group===null){assert.equal(r.findings.length,0,c.id+' fora da cobertura');continue;}
 assert.equal(groups.length,1);assert.equal(groups[0].snippet,c.group);assert.equal(groups[0].groupKind,c.kind);assert.equal(groups[0].components.find(s=>s.role==='Auxiliar').snippet,c.auxiliary);assert.equal(groups[0].components.find(s=>s.role==='Principal').snippet,c.main);assert.equal(r.coverageInfo.constructions,1);assert.equal(r.coverageInfo.verbGroups,1);assert.ok(groups[0].evidence.observation.includes('não são contadas como duas orações'));
}catch(e){failures.push(c.id+': '+e.message);}}
const text='🎼 cafe\u0301. Elas te\u0302m sai\u0301do. Elas te\u0302m sai\u0301do.',start=text.indexOf('Elas'),doc=E.freshDocument();doc.text=text;
const req=E.analysisContract.request(doc,text,start,text.length),r=E.analysisContract.analyze(vault,'sintaxe',req);exact(text,r.findings);assert.equal(r.coverageInfo.verbGroups,2);assert.equal(r.coverageInfo.constructions,2);assert.equal(doc.text,text);
const group=r.findings.find(f=>f.feature==='Locução verbal');assert.equal(group.components[0].start,text.indexOf('te\u0302m'));assert.equal(group.components[1].start,text.indexOf('sai\u0301do'));
const unknown=E.contextualMorphology.inspect('qwertyer');assert.equal(unknown.items[0].status,'desconhecido');assert.equal(vault.analyze('sintaxe','qwertyer').findings.length,0,'regressão do pacote: não inventar sujeito');
for(const ending of ['Eu estou lendo o livro.','Eu tenho lido o livro.']){const prefix=' '.repeat(7999-ending.indexOf(' o ')),cut=prefix+ending;const x=E.syntaxRelations.analyze(cut,100);assert.equal(x.length,0,'não analisar locução antes de complemento cortado');}
assert.ok(html.includes(fs.readFileSync(path.join(root,'ptbr/grupos-verbais.js'),'utf8')));
assert.deepEqual(failures,[]);console.log('LOCUÇÕES OK: '+corpus.cases.length+' casos; auxiliar/principal, 1 construção, abstenções, NFD, seleção e cortes. Sem avaliação independente.');
