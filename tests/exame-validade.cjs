'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const setup=require('../ptbr/teste-painel').setup;
const text='A rua excessão,, que é ao longo do tempo';
function nodes(n,p){return(p(n)?[n]:[]).concat(...n.childNodes.map(c=>nodes(c,p)));}
function button(a,label){return nodes(a.board,n=>n.tagName==='button'&&n.textContent===label)[0];}
function open(){
  const a=setup(text);a.identity={note:'folha-a',record:'registro-a',revision:1};
  a.engine.ptbrPanelDocument=()=>a.identity.note;
  a.engine.ptbrPanelRevision=()=>a.identity.record+'|'+a.identity.revision;
  a.panel.hidden=false;a.panel.focus();a.goals.childNodes[0].click();
  a.status=a.board.childNodes.find(n=>n.getAttribute('role')==='status');
  return a;
}
function start(a){a.wheel.childNodes[0].click();}
for(const operation of ['revision','record','document','input','ime','hidden','off','back','cancel']){
  const a=open();start(a);
  if(operation==='revision')a.identity.revision++;
  if(operation==='record')a.identity.record='registro-b';
  if(operation==='document')a.identity.note='folha-b';
  if(operation==='input'){a.manuscript.value+='!';a.manuscript.emit('input');}
  if(operation==='ime')a.manuscript.emit('compositionstart');
  if(operation==='hidden'){a.document.hidden=true;a.document.emit('visibilitychange');}
  if(operation==='off'){a.panel.hidden=true;a.reset();}
  if(operation==='back')a.back.click();
  if(operation==='cancel')button(a,'Cancelar análise').click();
  a.flush();assert.deepEqual(a.calls,[],operation+' invalida exame pendente');
  assert.ok(!a.results.textContent.includes('Grafia para conferir'));
  assert.equal(button(a,'Cancelar análise').hidden,true);
}
for(const operation of ['revision','record','document']){
  const a=open();let kept=0;a.engine.ptbrPanelKeep=()=>{kept++;return true;};
  start(a);a.flush();const locate=button(a,'Ver no texto'),keep=button(a,'Manter minha escolha');
  if(operation==='revision')a.identity.revision++;
  if(operation==='record')a.identity.record='registro-b';
  if(operation==='document')a.identity.note='folha-b';
  a.manuscript.setSelectionRange(0,0);locate.click();keep.click();
  assert.equal(a.manuscript.selectionEnd,0,operation+' invalida localização');
  assert.equal(kept,0,operation+' invalida escolha');assert.equal(a.manuscript.value,text);
}
const a=open(),create=a.engine.createVault;let fail=true;
a.engine.createVault=function(){const vault=create();return{analyze(lens,s){if(fail)throw Error('falha simulada');return vault.analyze(lens,s);}};};
start(a);a.flush();assert.match(a.status.textContent,/Não foi possível concluir/);
assert.ok(!a.status.textContent.includes('Análise concluída'));assert.equal(a.action.disabled,false);
assert.equal(button(a,'Cancelar análise').hidden,true);assert.equal(a.manuscript.value,text);
fail=false;a.action.click();a.flush();assert.deepEqual(a.calls,['ortografia']);assert.match(a.status.textContent,/Análise concluída/);
// Salvar a própria dispensa muda a revisão; o resultado reapresentado pertence à nova revisão.
const b=open();let kept=0;
b.engine.ptbrPanelKeep=()=>{kept++;b.identity.revision++;return true;};
start(b);b.flush();button(b,'Manter minha escolha').click();
button(b,'Ver no texto').click();assert.equal(kept,1);assert.equal(b.manuscript.selectionStart,6);assert.equal(b.manuscript.selectionEnd,14);
const c=open();start(c);button(c,'Cancelar análise').click();
assert.equal(c.timers.filter(t=>!t.cancelled).length,0,'cancelamento retira o timer, sem callback órfão');
c.flush();assert.deepEqual(c.calls,[]);
require('acorn').parse(fs.readFileSync('ptbr/painel.js','utf8'),{ecmaVersion:5});
console.log('EXAME OK: revisão/registro/folha, cancelamento, IME, retorno, falha recuperável, dispensa válida e texto intacto.');
