'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),assets=require('../build/assets.json'),asset=assets.assets.find(a=>a.id==='cofre');
const E=require(path.join(root,asset.path)).createRuntime(),cases=[];
function test(name,fn){fn();cases.push(name);}
test('banco mantém sentidos de assento e instituição, sem desambiguar',()=>{
 const r=E.lookupLexeme('BANCO');assert.equal(r.state,'found');assert.equal(r.total,7);
 assert.ok(r.senses.some(s=>s.id==='02828884-n'&&s.definitions.includes('um assento longo para mais de uma pessoa')));
 assert.ok(r.senses.some(s=>s.id==='08420278-n'&&s.definitions[0].includes('instituição financeira')));
});
test('carro: quatro grupos e lacuna explícita de definição',()=>{
 const r=E.lookupLexeme('CARRO');assert.equal(r.total,4);
 assert.ok(r.senses.some(s=>s.terms.includes('automóvel')));assert.ok(r.senses.every(s=>!s.definitions.length));
});
test('acentos compostos e decompostos, sem remoção de diacríticos',()=>{
 assert.deepEqual(E.lookupLexeme('cafe\u0301'),E.lookupLexeme('CAFÉ'));
 assert.equal(E.lookupLexeme('cafe').state,'uncovered');assert.equal(E.lookupLexeme('  saudade ').total,2);
});
test('ausência, flexão, palavra longa e frase não inventam leitura',()=>{
 for(const s of ['zzcarroszz','xpto','constructor','__proto__'])assert.notEqual(E.lookupLexeme(s).state,'found');
 for(const s of ['',null,'a'.repeat(65),'carro azul','<img>','😀'])assert.equal(E.lookupLexeme(s).state,'invalid');
 assert.match(E.lookupLexeme('zzcarroszz').message,/não indica erro/);
});
test('resultado independente dos dados, sem cache mutável',()=>{
 const r=E.lookupLexeme('banco');r.senses[0].terms.push('injetado');assert.ok(!E.lookupLexeme('banco').senses[0].terms.includes('injetado'));
});
test('179 chaves: hash, orçamento e um parse por consulta',()=>{
 const meta=require('../resources/pt-BR/own-pt/ORIGEM.json'),data=fs.readFileSync(path.join(root,'resources/pt-BR/own-pt/lexico.js'));
 assert.equal(crypto.createHash('sha256').update(data).digest('hex'),meta.outputSha256);assert.equal(data.length,meta.outputBytes);assert.ok(data.length<=144*1024);
 let parses=0;const c={Escr:{reading:E.reading},JSON:{parse:s=>{parses++;assert.ok(Buffer.byteLength(s)<=16384);return JSON.parse(s);}}};
 vm.runInNewContext(data.toString(),c);vm.runInNewContext(fs.readFileSync(path.join(root,'packages/cofre/src/consulta-lexical.js'),'utf8'),c);
 assert.equal(parses,0);assert.equal(Object.keys(c.Escr.ownPtLexicon.entries).length,179);
 for(const key of Object.keys(c.Escr.ownPtLexicon.entries)){const r=c.Escr.lookupLexeme(key);assert.equal(r.state,'found');assert.ok(r.senses.length<=24);for(const s of r.senses){assert.match(s.id,/^\d{8}-[nvar]$/);assert.ok(s.terms.length);}}
 assert.equal(parses,179);c.Escr.lookupLexeme('fora-do-recorte');assert.equal(parses,179);
});
test('runtime ES5 e dados incluídos no portátil',()=>{
 for(const p of ['resources/pt-BR/own-pt/lexico.js','packages/cofre/src/consulta-lexical.js','ptbr/painel.js'])acorn.parse(fs.readFileSync(path.join(root,p),'utf8'),{ecmaVersion:5});
 const portable=fs.readFileSync(path.join(root,'escrevaral.html'),'utf8');assert.ok(portable.includes(fs.readFileSync(path.join(root,'resources/pt-BR/own-pt/lexico.js'),'utf8')));
});
// Simulação de eventos do painel existente; sem navegador nem conexão de rede.
const {setup}=require('../ptbr/teste-painel.js');
function nodes(node){return [node].concat(...node.childNodes.map(nodes));}
function field(a,cls){return nodes(a.board).find(n=>n.className===cls);}
function open(text='😀 banco azul',start=3,end=8){const a=setup(text,[],E);a.manuscript.selectionStart=start;a.manuscript.selectionEnd=end;a.panel.hidden=false;a.panel.focus();return a;}
test('seleção preenche campo; consulta conserva manuscrito e não dispara lentes',()=>{
 const a=open(),before=a.manuscript.value;assert.equal(field(a,'ptbr-lexical-input').value,'banco');
 field(a,'ptbr-lexical').childNodes.find(n=>n.tagName==='button').click();a.flush();
 assert.match(field(a,'ptbr-results').textContent,/instituição financeira/);assert.deepEqual(a.calls,[]);assert.equal(a.manuscript.value,before);
});
test('consulta cancela análise pendente e edição invalida o resultado',()=>{
 const a=open();a.wheel.childNodes[0].click();const box=field(a,'ptbr-lexical');box.childNodes.find(n=>n.tagName==='button').click();a.flush();assert.deepEqual(a.calls,[]);
 a.manuscript.value+='!';a.manuscript.emit('input');assert.equal(field(a,'ptbr-results').textContent,'');
});
test('lente substitui consulta; IME e painel fechado não consultam',()=>{
 const a=open(),button=field(a,'ptbr-lexical').childNodes.find(n=>n.tagName==='button'),input=field(a,'ptbr-lexical-input');
 button.click();a.wheel.childNodes[0].click();a.flush();assert.deepEqual(a.calls,['ortografia']);assert.ok(!field(a,'ptbr-results').textContent.includes('instituição financeira'));
 a.manuscript.emit('compositionstart');button.click();assert.equal(field(a,'ptbr-results').textContent,'');a.manuscript.emit('compositionend');
 input.emit('compositionstart');button.click();assert.equal(field(a,'ptbr-results').textContent,'');input.emit('compositionend');
 a.panel.hidden=true;button.click();assert.equal(field(a,'ptbr-results').textContent,'');
});
test('troca de folha usa reset existente, mesmo com texto igual',()=>{
 const a=open(),button=field(a,'ptbr-lexical').childNodes.find(n=>n.tagName==='button');button.click();
 // O controlador chama a mesma rotina ao trocar documento/fechar painel.
 a.reset();assert.equal(field(a,'ptbr-results').textContent,'');assert.equal(a.manuscript.value,'😀 banco azul');
 assert.match(fs.readFileSync(path.join(root,'src/editor/controlador.js'),'utf8'),/if\(E\.ptbrPanelReset\)\{E\.ptbrPanelReset\(\);\}\s*analysisRange = null/);
});
console.log('LÉXICO OWN-PT OK: '+cases.length+' grupos; 179 consultas, integridade, seleção, autoria, cancelamento, IME e ES5.');
