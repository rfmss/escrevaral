'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),create=require('../ptbr/preparacao');
let time=0,next=0,timers=[],active=true,document='a',head='Eu canto.',length=head.length,scans=0,delivered=[];
const E={createSignalTriage(_E,limits){assert.deepEqual(limits,{maxChars:2000,maxTokens:400});return{scan(text){scans++;assert.ok(text.length<=2001);return{signals:{morfologia:true,'que-contextual':true},read:Math.min(text.length,2000),work:{characters:Math.min(text.length,2000),tokens:2}};}}}};
const p=create(E,{active:()=>active,read:limit=>({head:head.slice(0,limit),length,document}),deliver:r=>delivered.push(r),setTimeout(fn,ms){const t={id:++next,at:time+ms,fn};timers.push(t);return t.id;},clearTimeout(id){timers=timers.filter(t=>t.id!==id);}});
function tick(ms){time+=ms;const ready=timers.filter(t=>t.at<=time);timers=timers.filter(t=>t.at>time);ready.forEach(t=>t.fn());}
p.request();tick(699);assert.equal(scans,0);p.request();tick(699);assert.equal(scans,0);tick(1);assert.equal(scans,1);assert.equal(p.state(delivered[0],'morfologia'),'encontrado');assert.equal(p.state(delivered[0],'sintaxe'),'nao-verificado');assert.equal(p.state(delivered[0],'relativas'),'nao-verificado','que não prova relativa');assert.equal(p.state(delivered[0],'pontuacao'),'nao-encontrado-no-recorte');assert.equal(delivered[0].text,undefined,'não retém snapshot da triagem');
p.request();tick(700);assert.equal(scans,1,'mesmo recorte reutilizado');document='b';p.request();tick(700);assert.equal(scans,2,'folha distinta não reaproveita identidade');
p.request();p.cancel(true);tick(1000);assert.equal(scans,2);p.request();active=false;tick(1000);assert.equal(scans,2,'oculto não trabalha');p.request();assert.equal(timers.length,0);active=true;head='x'.repeat(1000000);length=head.length;p.request();tick(700);assert.equal(scans,3);assert.equal(delivered.at(-1).partial,true);assert.ok(delivered.at(-1).read<=2000);assert.equal(timers.length,0,'não encadeia varredura da folha');
for(let i=0;i<1000;i++)p.request();assert.equal(timers.length,1,'um único timer mesmo em rajada');p.cancel(true);assert.equal(timers.length,0);
const failing=create({createSignalTriage(){throw Error('indisponível');}},{active:()=>true,read:()=>({head:'casa',length:4,document:'x'}),deliver:r=>assert.equal(r,null),setTimeout:fn=>{timers.push({at:time,fn});return 99;},clearTimeout:()=>{}});failing.request();tick(0);assert.equal(failing.state(null,'morfologia'),'nao-verificado');
require('acorn').parse(fs.readFileSync('ptbr/preparacao.js','utf8'),{ecmaVersion:5});
console.log('PREPARAÇÃO OK: 700 ms, reinício da pausa, um timer/cache, 2000 caracteres, cancelamento, identidade, falha e estados sem inferência sintática.');

// Trabalho real no léxico embutido; sem chamar vault.analyze.
const vm=require('vm'),ctx=vm.createContext({});
for(const source of require('./helpers/sources.cjs').scripts()){if(source.includes('root.Escr.mountUtilities'))break;vm.runInContext(source,ctx);}
const actual=ctx.Escr.createSignalTriage(ctx.Escr,{maxChars:2000,maxTokens:400});
const bounded=actual.scan('a '.repeat(1000)+'x');assert.ok(bounded.work.characters<=2000);assert.ok(bounded.work.tokens<=400);assert.ok(bounded.partial);
assert.equal(!!actual.scan('“muito muito').signals.repeticao,false);
assert.equal(actual.scan('cafe\u0301 café').signals.repeticao,true);
assert.equal(actual.scan(' '.repeat(2000)+'excessão').signals.ortografia,undefined);
console.log('RECORTE REAL OK: 400 tokens, truncamento, citação aberta e Unicode decomposto.');
