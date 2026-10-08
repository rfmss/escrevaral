'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({});
for(const source of require('./helpers/sources.cjs').scripts()){
  if(source.includes('root.Escr.mountUtilities'))break;
  vm.runInContext(source,ctx);
}
const E=ctx.Escr,setup=require('../ptbr/teste-painel').setup;
function nodes(n,p){return (p(n)?[n]:[]).concat(...n.childNodes.map(c=>nodes(c,p)));}
function button(n,label){return nodes(n,x=>x.tagName==='button'&&x.textContent===label)[0];}
function opened(text,at){
  const p=setup(text,[],E);p.manuscript.selectionStart=at;p.panel.hidden=false;p.panel.focus();p.flush();
  p.goals.childNodes[1].click();p.flush();nodes(p.board,x=>x.className==='ptbr-reserved-button')[0].click();
  return p;
}
function row(p,word,index=0){return p.results.childNodes.filter(n=>n.className==='ptbr-outcome'&&n.childNodes[0].textContent===word)[index];}
function examine(p,r){button(r,'Examinar este contexto').click();}
const prefix='Introdução.\n'.repeat(420),text=prefix+'Eu canto. O canto terminou.',at=prefix.length+12;
let p=opened(text,at);const chosen=row(p,'canto',1);assert(chosen);assert.deepEqual(p.calls,[]);
examine(p,chosen);assert.deepEqual(p.calls,[],'pedido aguardando permite cancelamento');p.flush();
assert.deepEqual(p.calls,['morfologia']);assert(p.results.textContent.includes('Leitura contextual: substantivo.'));
assert.match(p.results.childNodes[0].textContent,/Possibilidades no léxico: (?=[^.]*substantivo)(?=[^.]*verbo)/);
assert.equal(nodes(p.results,n=>n.className==='ptbr-context-original')[0].textContent,'Eu canto. O canto terminou.');
const active=nodes(p.results,n=>n.className==='ptbr-word'&&n.getAttribute('aria-pressed')==='true')[0];
assert(active.textContent.includes('canto'));assert(active.textContent.includes('substantivo'),'seleciona a segunda ocorrência, não o verbo anterior');
const locate=button(p.results,'Ver ocorrência no texto');locate.click();assert.equal(p.manuscript.selectionStart,at);assert.equal(p.manuscript.selectionEnd,at+5);assert.equal(p.manuscript.value,text);
// O contrato desloca os apoios, não somente a palavra principal.
const scope=E.analysisContract.reservedScope(text,{start:at-1000,end:text.length},{start:at,end:at+5,snippet:'canto'});
const request=E.analysisContract.request(p.record,text,scope.start,scope.end),result=E.analysisContract.analyze(E.createVault(E.knowledge),'morfologia',request);
for(const f of result.findings){for(const span of [f,...(f.context||[])]){assert.equal(text.slice(span.start,span.end),span.snippet);}}
// Mesmo texto/folha não revalida handlers depois de cancelar, voltar ou mudar revisão.
for(const operation of ['input','ime','back','cancel','hidden','off','document','revision']){
  p=opened(text,at);const old=row(p,'canto',1);examine(p,old);
  if(operation==='input'){p.manuscript.value+='!';p.manuscript.emit('input');}
  if(operation==='ime')p.manuscript.emit('compositionstart');
  if(operation==='back')p.back.click();
  if(operation==='cancel')button(p.board,'Cancelar análise').click();
  if(operation==='hidden'){p.document.hidden=true;p.document.emit('visibilitychange');}
  if(operation==='off'){p.panel.hidden=true;p.reset();}
  if(operation==='document')p.record.noteId='outra-folha';
  if(operation==='revision')p.record.revision++;
  p.flush();assert.deepEqual(p.calls,[],operation+' cancela pedido pendente');
  examine(p,old);p.flush();assert.deepEqual(p.calls,[],operation+' invalida botão da reserva');
}
p=opened(text,at);examine(p,row(p,'canto',1));p.flush();
const stale=button(p.results,'Ver no texto'),exact=button(p.results,'Ver ocorrência no texto');p.back.click();
p.manuscript.setSelectionRange(0,0);stale.click();exact.click();assert.equal(p.manuscript.selectionEnd,0,'voltar invalida os dois handlers de seleção');
// Cortes da janela, inclusive em sentença/palavra, não viram início/fim de contexto.
for(const [sample,target] of [
  ['x'.repeat(1200)+' eu canto.',1204],
  ['Eu canto '+'x'.repeat(2200),3],
  ['texto '.repeat(1500)+'\nEu canto.',9004],
  ['“'+prefix+'Eu canto.”',prefix.length+4],
  ['```\n'+prefix+'Eu canto.\n```',prefix.length+7],
  ['“Eu canto.”',4],
  ['https://exemplo/canto',16]
]){
  p=opened(sample,target);const r=row(p,'canto');assert(r,'reserva lexical preservada: '+sample.slice(-30));
  examine(p,r);p.flush();assert.deepEqual(p.calls,[],'contexto insuficiente/protegido não executa lente');
  assert(nodes(p.results,n=>n.className==='ptbr-context-limit').length);
  assert.equal(p.manuscript.value,sample);
}
// Proteção fechada antes da linha não bloqueia o contexto posterior.
p=opened('“citação\nlonga”\nEu canto.',20);examine(p,row(p,'canto'));p.flush();assert.deepEqual(p.calls,['morfologia']);
assert(p.results.textContent.includes('Leitura contextual: verbo.'));
// CRLF real delimita o recorte; locução abre o grupo e localiza só o componente.
const crlf='Introdução.\r\nEu posso cantar.\r\nFinal.';
p=opened(crlf,crlf.indexOf('posso'));examine(p,row(p,'posso'));p.flush();
assert.equal(nodes(p.results,n=>n.className==='ptbr-context-original')[0].textContent,'Eu posso cantar.');
assert(nodes(p.results,n=>n.className==='ptbr-word'&&n.getAttribute('aria-pressed')==='true')[0].textContent.includes('locução verbal'));
button(p.results,'Ver ocorrência no texto').click();assert.equal(p.manuscript.value.slice(p.manuscript.selectionStart,p.manuscript.selectionEnd),'posso');
// Uma reserva feita antes de nova revisão não autoriza o exame.
p=opened('Eu canto.',4);const outdated=row(p,'canto');p.record.revision++;examine(p,outdated);p.flush();assert.deepEqual(p.calls,[]);
// Acentos decompostos/UTF-16 agora atravessam o exame, não apenas a reserva.
const unicode=prefix+'😀 cafe\u0301\nEu canto.',unicodeAt=unicode.lastIndexOf('canto');
p=opened(unicode,unicodeAt);examine(p,row(p,'canto'));p.flush();button(p.results,'Ver ocorrência no texto').click();
assert.equal(p.manuscript.selectionStart,unicodeAt);assert.equal(p.manuscript.value,unicode);
const lookup=E.lookupMorphology;E.lookupMorphology=k=>k==='café'?[{lemma:'café',pos:'NOUN',features:'_'}]:lookup(k);
p=opened(prefix+'😀 cafe\u0301.',prefix.length+4);examine(p,row(p,'cafe\u0301'));p.flush();button(p.results,'Ver ocorrência no texto').click();
assert.equal(p.manuscript.value.slice(p.manuscript.selectionStart,p.manuscript.selectionEnd),'cafe\u0301');E.lookupMorphology=lookup;
// Ambiguidade não vira classe contextual; limite de apresentação não vira ausência.
p=opened('Canto.',1);examine(p,row(p,'Canto'));p.flush();assert(p.results.textContent.includes('Possibilidades lexicais:'));assert(!p.results.textContent.includes('Leitura contextual:'));
const dense='a '.repeat(120)+'Eu canto.';p=opened(dense,243);examine(p,row(p,'canto'));p.flush();assert(p.results.textContent.includes('além do limite de resultados'));assert.equal(nodes(p.results,n=>n.className==='ptbr-word'&&n.getAttribute('aria-pressed')==='true').length,0,'não abre outra ocorrência como substituto');
for(const file of ['ptbr/painel.js','ptbr/preparacao.js','ptbr/leitura-visual.js','src/editor/contrato-analise.js','src/editor/controlador.js'])require('acorn').parse(fs.readFileSync(file,'utf8'),{ecmaVersion:5});
console.log('CONTEXTO DA RESERVA OK: lente real, origem/apoios UTF-16, repetidas, NFD, fronteiras, proteções herdadas, limites e oito transições de invalidação; ES5.');
