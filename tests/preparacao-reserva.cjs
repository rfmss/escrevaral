'use strict';
const assert=require('node:assert/strict'),vm=require('vm'),fs=require('fs'),create=require('../ptbr/preparacao');
const ctx=vm.createContext({});for(const source of require('./helpers/sources.cjs').scripts()){if(source.includes('root.Escr.mountUtilities'))break;vm.runInContext(source,ctx);}const E=ctx.Escr;
function prepare(text,start=0,left=false,anchor=start){let fn,out;const p=create(E,{active:()=>true,read:()=>({head:text.slice(0,2001),start,anchor,leftContinues:left,length:start+text.length,document:'folha'}),deliver:r=>out=r,setTimeout:f=>(fn=f,1),clearTimeout:()=>{}});p.request();fn();return{p,out};}
let {p,out}=prepare('Eu canto. O canto terminou.');
assert.equal(out.occurrences.filter(x=>x.snippet==='canto').length,2,'repetições preservam posições distintas');
for(const x of out.occurrences){assert.equal('Eu canto. O canto terminou.'.slice(x.start,x.end),x.snippet);}
const canto=out.occurrences.find(x=>x.snippet==='canto');assert(canto.classes.includes('verbo'));assert(canto.classes.includes('substantivo'),'ambiguidade lexical preservada');
({p,out}=prepare('canto que canto',5000));assert.equal(p.state(out,'morfologia'),'encontrado');assert.equal(p.state(out,'relativas'),'nao-verificado');assert.equal(p.state(out,'repeticao'),'nao-verificado','contexto anterior desconhecido não roda heurística');assert(out.occurrences.every(x=>x.start>=5000));
({out}=prepare('canto casa',10,true));assert(!out.occurrences.some(x=>x.snippet==='canto'),'não reserva cauda cortada à esquerda');
({out}=prepare(' '.repeat(1997)+'canto'));assert(!out.occurrences.some(x=>x.snippet==='can'),'não reserva começo cortado à direita');
({out}=prepare('canto '.repeat(1000)));assert.equal(out.occurrences.length,24);assert(out.lexicalLimited);assert(out.work.characters<=2000);assert(out.work.tokens<=400);
({out}=prepare('z'.repeat(64)+' '.repeat(1)+'canto'));assert(out.occurrences.some(x=>x.snippet==='canto'));
({out}=prepare('a '.repeat(500)+'canto '+'a '.repeat(499),7000,false,8000));assert(out.occurrences.some(x=>x.snippet==='canto'&&x.start===8000),'prioriza cursor mesmo com palavras densas antes dele');assert(out.occurrences.length<=24);assert(out.work.tokens<=400);
({out}=prepare('canto '.repeat(166)+'CANTO '+'canto '.repeat(166),7000,false,7996));assert(out.occurrences.some(x=>x.snippet==='CANTO'&&x.start===7996));assert.equal(out.occurrences.length,24,'guarda as24 mais próximas, não as24 primeiras');
// Consulta lexical inclui citação como palavra; não a transforma em análise contextual.
({p,out}=prepare('“canto que canto”',9000));assert(out.occurrences.some(x=>x.snippet==='canto'));assert.equal(p.state(out,'relativas'),'nao-verificado');
// Canonicalização real com offsets UTF-16 e emoji; fonte controlada para a forma NFD.
const lookup=E.lookupMorphology;E.lookupMorphology=k=>k==='café'?[{lemma:'café',pos:'NOUN',features:'_'}]:lookup(k);
const unicode='😀 cafe\u0301 canto';({out}=prepare(unicode,3000));const accent=out.occurrences.find(x=>x.snippet==='cafe\u0301');assert(accent);assert.equal(unicode.slice(accent.start-3000,accent.end-3000),'cafe\u0301');E.lookupMorphology=lookup;
// Integração da reserva: nenhuma lente, seleção exata e invalidação ao editar.
const panel=require('../ptbr/teste-painel').setup('Eu canto. O canto terminou.',[],E);panel.manuscript.selectionStart=20;panel.panel.hidden=false;panel.panel.focus();panel.flush();panel.goals.childNodes[1].click();panel.flush();
const reserveButton=panel.board.childNodes.find(n=>n.className==='ptbr-reserved-button');assert.equal(reserveButton.hidden,false);reserveButton.click();assert.deepEqual(panel.calls,[]);
const rows=panel.results.childNodes.filter(n=>n.className==='ptbr-outcome'),second=rows.filter(n=>n.childNodes[0].textContent==='canto')[1];assert(second);second.childNodes.find(n=>n.tagName==='button').click();assert.equal(panel.manuscript.selectionStart,12);assert.equal(panel.manuscript.selectionEnd,17);assert.equal(panel.manuscript.value,'Eu canto. O canto terminou.');
panel.manuscript.value='Texto novo';panel.manuscript.emit('input');panel.manuscript.setSelectionRange(0,0);second.childNodes.find(n=>n.tagName==='button').click();assert.equal(panel.manuscript.selectionEnd,0,'botão antigo não seleciona resultado obsoleto');
require('acorn').parse(fs.readFileSync('ptbr/preparacao.js','utf8'),{ecmaVersion:5});
console.log('RESERVA OK: regiões, offsets, repetidas, ambiguidades, fronteiras, NFD/emoji, teto24/400, consulta sem análise e resultado obsoleto.');
