const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),ctx=vm.createContext({});
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){if(m[1].includes('root.Escr.mountUtilities'))break;vm.runInContext(m[1],ctx);}
const E=ctx.Escr,vault=E.createVault(E.knowledge),corpus=require('../ptbr/corpus/relativas-1.json'),failures=[];
function exact(text,findings){for(const f of findings){for(const s of [f,f.head,f.clause,...f.context,...f.components])assert.equal(text.slice(s.start,s.end),s.snippet,'posição UTF-16');assert.ok(f.start>=f.clause.start&&f.end<=f.clause.end);for(const c of f.components)assert.ok(c.start>=f.start&&c.end<=f.end);}}
for(const c of corpus.cases){try{
 const r=vault.analyze('relativas',c.text);exact(c.text,r.findings);
 if(c.expect==='abstencao'){assert.equal(r.findings.length,0,c.reason);continue;}
 assert.equal(r.findings.length,1);const f=r.findings[0];assert.equal(f.snippet,c.relative);assert.equal(f.relativeFunction,c.function);assert.equal(f.relativeType,c.type);
 for(const [role,value] of [['Antecedente',c.antecedent],['Verbo da relativa',c.relativeVerb],['Verbo da principal',c.matrixVerb]])assert.equal(f.context.find(s=>s.role===role).snippet,value);
 assert.equal(f.head.snippet,'que');assert.equal(r.coverageInfo.relatives,1);
}catch(e){failures.push(c.id+' '+e.message);}}
assert.deepEqual(failures,[]);
const sentence='As meninas que te\u0302m sai\u0301do trabalham.',text='🎼 cafe\u0301. '+sentence+' '+sentence,doc=E.freshDocument();doc.text=text;
const start=text.indexOf('As'),req=E.analysisContract.request(doc,text,start,text.length),r=E.analysisContract.analyze(vault,'relativas',req);exact(text,r.findings);
assert.equal(r.findings.length,2);assert.equal(new Set(r.findings.map(f=>f.nodeId)).size,2);assert.equal(doc.text,text);assert.equal(r.findings[0].start,text.indexOf('que'));
assert.equal(vault.analyze('relativas',text.slice(text.indexOf('que'),text.indexOf('trabalham'))).findings.length,0,'seleção sem antecedente/principal não inventa contexto');
const apparent='A menina que canta trabalha',cut=' '.repeat(8000-apparent.length)+apparent+' o livro.';
assert.equal(E.relativeClauses.analyze(cut).length,0,'corte não certifica oração principal');
assert.equal(E.relativeClauses.analyze(cut).coverageInfo.truncated,1);
const unfinished=' '.repeat(7980)+'A menina que canta trabalha.';assert.equal(E.relativeClauses.analyze(unfinished).length,0);
const tokenCut='x '.repeat(1596)+'A menina que canta trabalha.';assert.equal(E.relativeClauses.analyze(tokenCut).length,0);assert.equal(E.relativeClauses.analyze(tokenCut).coverageInfo.truncated,1);
const quote='“'+' '.repeat(7970)+'A menina que canta trabalha.”';assert.equal(E.relativeClauses.analyze(quote).length,0);
const many='A menina que canta trabalha. '.repeat(400),limited=E.relativeClauses.analyze(many,3);exact(many,limited);assert.equal(limited.length,3);assert.ok(limited.coverageInfo.outputLimited);assert.ok(limited.coverageInfo.scope.partial);assert.ok(limited.coverageInfo.work.characters<=8000&&limited.coverageInfo.work.tokens<=1600);
assert.equal(E.relativeClauses.analyze('A menina que canta trabalha. O menino que corre canta.').length,2);
assert.ok(html.includes(fs.readFileSync(path.join(root,'ptbr/relativas.js'),'utf8')));
const arrived=E.contextualMorphology.readings('chegaram').verbs;assert.equal(arrived.length,2);assert.ok(arrived.every(v=>v[0]==='chegar'&&v[2]===3&&v[3]==='plural'));
console.log('RELATIVAS OK: '+corpus.cases.length+' casos; antecedente, função, fronteira, principal, locuções, abstenções, seleção UTF-16/NFD, proteção e limites. Sem revisão independente.');
