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
assert.equal(c.action.disabled,false,'cancelamento permite examinar novamente');
c.flush();assert.deepEqual(c.calls,[]);

// visibilitychange ao ocultar durante resultado volta ao grupo e prepara ao retornar.
const vis=open();start(vis);vis.flush();assert.equal(vis.results.hidden,false);
vis.document.hidden=true;vis.document.emit('visibilitychange');
assert.equal(vis.results.hidden,true,'resultado oculto ao sair da aba');
assert.equal(vis.wheel.hidden,false,'volta à escolha de análises do grupo, não tela vazia');
vis.document.hidden=false;vis.document.emit('visibilitychange');
assert.equal(vis.timers.filter(t=>!t.cancelled&&t.delay===700).length,1,'retomar visibilidade reativa preparação');

// Acima de 100 ocorrências com as 100 primeiras dispensadas: renderiza a restante sem truncar pelo índice bruto.
const many=setup(text,[],null);
const findings=[];
for(let idx=0;idx<102;idx++){
  findings.push({id:'PTBR-ORT-'+idx,snippet:'excessão',start:6,end:14,message:'Item '+idx,confidence:'moderada',
    evidence:{observation:'obs',interpretation:'interp',ambiguity:'amb',limit:'lim'}});
}
many.engine.ptbrPanelChoices=()=>findings.slice(0,100).map(f=>f.id+'|'+f.snippet);
many.engine.createVault=()=>({analyze(lens){many.calls.push(lens);return {findings:findings,limited:false};}});
many.panel.hidden=false;many.panel.focus();many.goals.childNodes[0].click();many.wheel.childNodes[0].click();many.flush();
assert.equal(many.results.textContent.includes('Item 100'),true,'renderiza itens não dispensados após o índice 100');

// Seleção explícita (Analisar trecho), abertura direta (poesia / ritmo), liberação de escolhas, reveal e autosave sem conflito.
const vm=require('node:vm');
const fullCtx=vm.createContext({});
for(const s of require('./helpers/sources.cjs').scripts()){
  if(s.includes('root.Escr.mountUtilities'))break;
  vm.runInContext(s,fullCtx);
}
const longDoc='a '.repeat(100500)+'A rua excessão,, aqui.';
const selStart=longDoc.lastIndexOf('A rua'),selEnd=longDoc.length;
const selPanel=setup(longDoc,[],fullCtx.Escr);
selPanel.identity={note:'folha-sel',record:'rec-1',revision:1};
selPanel.engine.ptbrPanelDocument=()=>selPanel.identity.note;
selPanel.engine.ptbrPanelRevision=()=>selPanel.identity.record+'|'+selPanel.identity.revision;
let revealed=null,flushed=0;
selPanel.engine.ptbrPanelReveal=(a,b)=>{revealed=[a,b];return true;};
selPanel.engine.ptbrPanelFlush=()=>{flushed++;return true;};
selPanel.engine.ptbrPanelSelection=()=>({documentId:'folha-sel',text:selPanel.manuscript.value,start:selStart,end:selEnd});
selPanel.panel.hidden=false;selPanel.panel.focus();selPanel.goals.childNodes[0].click();
assert.equal(selPanel.wheel.childNodes[0].disabled,false,'trecho <=200k habilitado mesmo em folha >200k');
selPanel.wheel.childNodes[0].click();selPanel.flush();
assert.ok(flushed>=1,'flush de gravação antes de iniciar exame');
assert.ok(selPanel.results.textContent.includes('excessão'));
button(selPanel,'Ver no texto').click();
assert.deepEqual(revealed,[longDoc.lastIndexOf('excessão'),longDoc.lastIndexOf('excessão')+8],'Ver no texto desloca posição e aciona hook de rolagem');

// Abertura direta de grupo poesia e lente específica + liberação + persistência sem conflito.
const nav=open();
nav.engine.ptbrPanelOpen({group:3});
assert.equal(nav.wheel.hidden,false);
assert.equal(nav.board.childNodes.find(n=>n.className==='ptbr-title').textContent,'Ler como poesia');
assert.deepEqual(nav.calls,[],'abrir poesia não executa lente');
nav.engine.ptbrPanelOpen({lens:'ritmo'});nav.flush();
assert.deepEqual(nav.calls,['ritmo'],'desk-rhythm executa ritmo no painel');
nav.engine.ptbrPanelLiberate('Escolhas liberadas.');
assert.equal(nav.results.hidden,true);assert.equal(nav.wheel.hidden,false);assert.equal(nav.status.textContent,'Escolhas liberadas.');

const sync=setup('Eu canto. O canto terminou.',[],fullCtx.Escr);
sync.identity={note:'folha-sync',record:'rec-sync',revision:1};
sync.engine.ptbrPanelDocument=()=>sync.identity.note;
sync.engine.ptbrPanelRevision=()=>sync.identity.record+'|'+sync.identity.revision;
sync.status=sync.board.childNodes.find(n=>n.getAttribute('role')==='status');
sync.panel.hidden=false;sync.panel.focus();sync.flush();
sync.goals.childNodes[1].click();
sync.identity.revision++;
const reserveBtn=sync.board.childNodes.find(n=>n.className==='ptbr-reserved-button');
assert.equal(reserveBtn.hidden,false);
reserveBtn.click();
assert.equal(sync.wheel.hidden,false,'reserva de revisão antiga não abre lista já inválida');
assert.match(sync.status.textContent,/aguarde preparar/);
sync.flush();
sync.identity.revision++;sync.engine.ptbrPanelSaved(false);
assert.equal(sync.timers.filter(t=>!t.cancelled&&t.delay===700).length,1,'autosave sem conflito agenda nova preparação em home/group');
sync.engine.ptbrPanelSaved(true);
assert.match(sync.status.textContent,/Outra versão foi preservada/);

// Ponte real em src/editor/controlador.js: parser ES5 e execução isolada de openExaminePanel / revealSelection.
const ctrlSrc=fs.readFileSync('src/editor/controlador.js','utf8');
const acorn=require('acorn');
const ctrlNodes=acorn.parse(ctrlSrc,{ecmaVersion:5}).body[0].expression.callee.body.body;
const ctrlFns=['openExaminePanel','revealSelection'].map(name=>{
  const node=ctrlNodes.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);
  assert(node,'função encontrada no controlador: '+name);
  return ctrlSrc.slice(node.start,node.end);
}).join('\n');
let ctrlPersisted=0,ctrlFocused=0,ctrlOpened=null,ctrlReturns=0,ctrlMessages=[],ctrlRange={start:6,end:14};
const ctrlBox={dirty:true,archive:{},composing:false,analysisRange:null,manuscript:{scrollTop:0,clientHeight:300},
  lensButtons:[{getAttribute:()=>'rima',focus:()=>{}}],window:{getComputedStyle:()=>({})},
  persist(){ctrlPersisted++;ctrlBox.dirty=false;return true;},
  showPanel(){},returnToWriting(){ctrlBox.analysisRange=null;ctrlReturns++;},
  textPosition:()=>({top:900,left:0,line:20}),updateFocus(){ctrlFocused++;},
  message(m){ctrlMessages.push(m);},examine(){},
  E:{transfer:{selectRange:(m,a,b)=>a>=0&&b>a},ptbrPanelOpen(opt){ctrlOpened=opt;}}};
vm.createContext(ctrlBox);vm.runInContext(ctrlFns,ctrlBox);
ctrlBox.openExaminePanel({toggle:'examinar-toggle',range:ctrlRange,group:3});
assert.equal(ctrlPersisted,1,'abrir oficina grava pendência antes da preparação');
assert.equal(ctrlBox.analysisRange,ctrlRange);
assert.equal(ctrlOpened.group,3);assert.equal(ctrlOpened.lens,undefined);
assert.equal(ctrlBox.revealSelection(6,14),true);
assert.equal(ctrlReturns,1);assert.equal(ctrlBox.analysisRange,null);
assert.equal(ctrlBox.manuscript.scrollTop,800,'Ver no texto rola o manuscrito ao trecho');
assert.equal(ctrlFocused,1,'Ver no texto atualiza a máscara de foco');

for(const hook of ['E.ptbrPanelReveal','E.ptbrPanelFlush','E.ptbrPanelSelection','E.ptbrPanelOpen','E.ptbrPanelLiberate','E.ptbrPanelSaved']){
  assert.ok(ctrlSrc.includes(hook),'controlador integra '+hook);
}

acorn.parse(fs.readFileSync('ptbr/painel.js','utf8'),{ecmaVersion:5});
console.log('EXAME OK: revisão/registro/folha, cancelamento, IME, retorno, falha recuperável, dispensa válida e texto intacto.');
