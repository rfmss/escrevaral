'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const select=require('../ptbr/pertinencia'),setup=require('../ptbr/teste-painel').setup;
const lenses=['ortografia','pontuacao','relativas'];
const states={ortografia:'encontrado',pontuacao:'nao-encontrado-no-recorte',relativas:'nao-verificado'};
assert.deepEqual(select(lenses,states,true),{visible:['ortografia'],found:1,absent:1,unknown:1});
assert.deepEqual(select(lenses,states,false).visible,lenses);
assert.deepEqual(select(lenses,{},true),{visible:[],found:0,absent:0,unknown:3});
assert.deepEqual(lenses,['ortografia','pontuacao','relativas'],'não altera catálogo');
require('acorn').parse(fs.readFileSync('ptbr/pertinencia.js','utf8'),{ecmaVersion:5});

function ui(a){
  const box=a.board.childNodes.find(n=>n.className==='ptbr-reserve-filter');
  return{box,filter:box.childNodes.find(n=>n.tagName==='select'),status:box.childNodes.find(n=>n.getAttribute('role')==='status')};
}
function visible(a){return a.wheel.childNodes.filter(n=>!n.hidden).map(n=>n.getAttribute('data-ptbr-lens'));}
const sample='A rua excessão,, que é ao longo do tempo',a=setup(sample);
let scans=0;const triage=a.engine.createSignalTriage;
a.engine.createSignalTriage=function(){const scanner=triage.apply(this,arguments),scan=scanner.scan;scanner.scan=function(){scans++;return scan.apply(scanner,arguments);};return scanner;};
a.panel.hidden=false;a.panel.focus();a.goals.childNodes[0].click();
const controls=ui(a);
assert.equal(controls.filter.value,'all');assert.equal(visible(a).length,5);
controls.filter.value='signals';controls.filter.emit('change');
assert.deepEqual(visible(a),[]);assert.match(controls.status.textContent,/5 com pertinência não verificada/);
a.flush();assert.ok(visible(a).includes('ortografia'));assert.ok(visible(a).includes('pontuacao'));
const preparedScans=scans,timers=a.timers.length;
controls.filter.value='all';controls.filter.emit('change');assert.equal(visible(a).length,5);
controls.filter.value='signals';controls.filter.emit('change');
assert.equal(scans,preparedScans);assert.equal(a.timers.length,timers,'filtrar não agenda preparação');
assert.deepEqual(a.calls,[]);assert.equal(a.manuscript.value,sample);
a.manuscript.emit('compositionstart');assert.deepEqual(visible(a),[]);
assert.match(controls.status.textContent,/5 com pertinência não verificada/);
a.manuscript.emit('compositionend');a.flush();
a.manuscript.value='Outra frase';a.manuscript.emit('input');assert.deepEqual(visible(a),[],'edição invalida os indícios');
a.flush();a.document.hidden=true;a.document.emit('visibilitychange');
assert.deepEqual(visible(a),[]);assert.deepEqual(a.calls,[]);
controls.filter.value='all';controls.filter.emit('change');assert.equal(visible(a).length,5,'acesso manual após invalidação');

const distant=setup('x '.repeat(800)+'casa');distant.manuscript.selectionStart=1600;
distant.panel.hidden=false;distant.panel.focus();distant.goals.childNodes[1].click();distant.flush();
const remote=ui(distant);remote.filter.value='signals';remote.filter.emit('change');
assert.deepEqual(visible(distant),[]);assert.match(remote.status.textContent,/3 com pertinência não verificada/);
assert.match(remote.status.textContent,/0 sem indícios/,'contexto desconhecido não equivale a negativo');
remote.filter.value='all';remote.filter.emit('change');assert.deepEqual(visible(distant),['morfologia','sintaxe','relativas']);
assert.deepEqual(distant.calls,[]);
console.log('PERTINÊNCIA OK: estados distintos, retorno a todas, recorte distante, IME/edição/oculto, nenhum exame ou timer ao filtrar.');
