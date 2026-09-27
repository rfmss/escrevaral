const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=require('./helpers/sources.cjs').scripts().join('\n'),ctx=vm.createContext({});
for(const source of require('./helpers/sources.cjs').scripts()){if(source.includes('root.Escr.mountUtilities'))break;vm.runInContext(source,ctx);}
const E=ctx.Escr,vault=E.createVault(E.knowledge),corpus=require('../ptbr/corpus/sintaxe-1.json'),failures=[];
function validate(text,findings){
 const nodes=new Map(findings.map(f=>[f.nodeId,f]));
 for(const f of findings){
  for(const s of [f,f.clause,f.head,...f.context].filter(Boolean))assert.equal(text.slice(s.start,s.end),s.snippet,'posição exata');
  assert.ok(f.start>=f.clause.start&&f.end<=f.clause.end);
  if(f.head)assert.ok(f.head.start>=f.start&&f.head.end<=f.end,'núcleo dentro do grupo');
  for(const e of f.relations){assert.ok(nodes.has(e.from)&&nodes.has(e.to),'nenhum vínculo órfão');assert.equal(nodes.get(e.from).clause.start,nodes.get(e.to).clause.start,'sem vínculo entre orações');}
  if(f.parentId.endsWith('-predicado')){const p=nodes.get(f.parentId);assert.ok(p&&f.start>=p.start&&f.end<=p.end,'termo pertence ao predicado');}
 }
}
for(const c of corpus.cases){try{
 const r=vault.analyze('sintaxe',c.text);validate(c.text,r.findings);
 if(c.expect==='abstencao'){assert.equal(r.findings.length,0,c.id+' '+c.text);continue;}
 assert.ok(r.findings.length,c.id+' sem leitura '+c.text);
 if(c.constructions)assert.equal(r.coverageInfo.constructions,c.constructions);
 for(const [role,snippet] of Object.entries(c.roles)){const f=r.findings.find(f=>role==='Verbo'?['Núcleo verbal','Verbo de ligação'].includes(f.feature):f.feature===role);assert.ok(f,c.id+' '+role);assert.equal(f.snippet,snippet,c.id+' '+role);}
}catch(e){failures.push(e.message);}}
const text='🎼 cafe\u0301. Eu leio o livro. Eu leio o livro.',start=text.indexOf('Eu'),doc=E.freshDocument();doc.text=text;
const req=E.analysisContract.request(doc,text,start,text.length),result=E.analysisContract.analyze(vault,'sintaxe',req);validate(text,result.findings);
assert.equal(result.findings.filter(f=>f.feature==='Sujeito').length,2);assert.equal(new Set(result.findings.map(f=>f.nodeId)).size,result.findings.length);assert.equal(doc.text,text);assert.equal(result.coverageInfo.scope.start,start);
assert.equal(E.syntaxRelations.analyze('Eu canto.',2).length,0,'não dividir construção por limite de saída');
for(const n of [20000,200000]){const s='Eu leio o livro. '.repeat(Math.ceil(n/17)).slice(0,n),r=vault.analyze('sintaxe',s);validate(s,r.findings);assert.ok(r.limited);assert.ok(r.findings.length<=100);assert.ok(r.coverageInfo.scope.partial);assert.ok(r.coverageInfo.work.tokens<=1600&&r.coverageInfo.work.characters<=8000);}
// O limite pode cortar depois de um verbo completo: ainda não é uma oração completa.
const cut=' '.repeat(7992)+'Eu canto o poema.';assert.equal(E.syntaxRelations.analyze(cut,100).length,0);
const many='Eu canto. '.repeat(532)+'Eu canto o poema. '+ 'fim '.repeat(600);const r=E.syntaxRelations.analyze(many,100);assert.ok(r.coverageInfo.work.tokens<=1600);validate(many,r);
const tokenTail='x '.repeat(1598)+'Eu canto o poema.';assert.equal(E.syntaxRelations.analyze(tokenTail,100).coverageInfo.truncated,1,'espaço antes do corte não encerra construção');
const dotTail=' '.repeat(7991)+'Eu canto.x';assert.equal(E.syntaxRelations.analyze(dotTail,100).length,0,'ponto cortado sem fronteira no original');
assert.equal(E.syntaxRelations.analyze('“'+' '.repeat(7990)+'Eu canto.”',100).length,0);
const f=vault.analyze('sintaxe','A menina não leu a carta ontem.').findings;assert.equal(f.find(x=>x.feature==='Sujeito').head.snippet,'menina');assert.equal(f.find(x=>x.feature==='Objeto direto').head.snippet,'carta');assert.ok(f.some(x=>x.feature==='Negação'));assert.ok(f.some(x=>x.feature==='Adjunto adverbial'));
assert.ok(html.includes(fs.readFileSync(path.join(root,'ptbr/relacoes-sintaticas.js'),'utf8')));
assert.ok(html.includes(fs.readFileSync(path.join(root,'ptbr/lexico-sintatico.js'),'utf8')));
assert.ok(f.every(x=>x.valencyFrame&&x.valencyFrame.lemma==='ler'&&x.valencyFrame.pattern==='objeto-direto'));
const copy=E.syntaxLexicon.nounReadings('menina');copy[0].number='plural';
assert.equal(E.syntaxLexicon.nounReadings('menina')[0].number,'singular','consultas não alteram o inventário');
assert.equal(E.syntaxLexicon.framesFor('inventado').length,0);
assert.equal(E.syntaxLexicon.articleReading('constructor'),null);
assert.deepEqual(failures,[]);
console.log('SINTAXE OK: '+corpus.cases.length+' casos de desenvolvimento/regressão; relações, núcleos, contenção, repetição, seleção UTF-16, proteção e recorte. Revisão independente pendente.');
