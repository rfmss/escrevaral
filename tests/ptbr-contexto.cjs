const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),ctx=vm.createContext({});
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){if(m[1].includes('root.Escr.mountUtilities'))break;vm.runInContext(m[1],ctx);}
const E=ctx.Escr,engine=E.contextualMorphology,vault=E.createVault(E.knowledge),corpus=require('../ptbr/corpus/contexto-1.json'),failures=[];
for(const c of corpus.cases){
 try{
  const report=engine.inspect(c.text),item=report.items.filter(x=>x.snippet===c.target)[c.occurrence];
  if(c.expected.status==='protegido'){assert.equal(item,undefined,c.id);continue;}
  assert.ok(item,c.id+' ausente: '+c.target);assert.equal(item.status,c.expected.status,c.id+' '+c.text);assert.equal(item.selected,c.expected.selected,c.id);
  const findings=vault.analyze('morfologia',c.text).findings;
  for(const f of findings){assert.equal(c.text.slice(f.start,f.end),f.snippet);for(const p of f.context)assert.equal(c.text.slice(p.start,p.end),p.snippet);}
 }catch(e){failures.push(e.message);}
}
// Sem atalhos por terminação e sem mutação dos protótipos compartilhados.
assert.equal(engine.inspect('qwertyer').items[0].status,'desconhecido');
for(const n of [20000,200000]){const text='Eu canto. '.repeat(Math.ceil(n/10)).slice(0,n),r=engine.inspect(text),result=vault.analyze('morfologia',text);assert.ok(r.work.characters<=8000&&r.work.tokens<=1600);assert.ok(r.scope.partial);assert.ok(result.coverageInfo.scope.partial);assert.equal(result.findings.length,100);assert.equal(result.limited,true);}
const cutoff=' '.repeat(7997)+'cantar';assert.equal(engine.inspect(cutoff).items.length,0,'não classificar token cortado');
const many='a '.repeat(8000);assert.equal(engine.inspect(many).work.tokens,1600);
const protectedTail='“'+' '.repeat(7995)+'Eu canto”';assert.equal(engine.inspect(protectedTail).items.length,0);
// Seleção desloca também os apoios contextuais, inclusive depois de emoji/NFD.
const doc=E.freshDocument(),text='🎼 cafe\u0301. Eu canto. O canto terminou.',start=text.indexOf('Eu');
doc.text=text;const req=E.analysisContract.request(doc,text,start,text.length),result=E.analysisContract.analyze(vault,'morfologia',req);
for(const f of result.findings){assert.equal(text.slice(f.start,f.end),f.snippet);for(const p of f.context)assert.equal(text.slice(p.start,p.end),p.snippet);}
assert.equal(result.coverageInfo.scope.start,start);assert.equal(result.coverageInfo.scope.end,text.length);
assert.ok(html.includes(fs.readFileSync(path.join(root,'ptbr/morfologia-contextual.js'),'utf8')));
const resultPath=process.env.QA_OUTPUT&&path.join(process.env.QA_OUTPUT,'contexto-1.json');
if(resultPath){fs.mkdirSync(path.dirname(resultPath),{recursive:true});fs.writeFileSync(resultPath,JSON.stringify({corpus:corpus.kind,cases:corpus.cases.length,failures,independentReview:false},null,2)+'\n');}
assert.deepEqual(failures,[]);
console.log('CONTEXTO OK: '+corpus.cases.length+' casos de desenvolvimento/regressão; limites, proteção, posições UTF-16 e seleção. Sem certificação linguística independente.');
