// Teste do aplicativo real: análise explícita, autoria, cancelamento e uso offline.
const {chromium,webkit}=require('playwright'),fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.QA_OUTPUT||path.join(root,'../qa-output'),engine=process.env.BROWSER_ENGINE||'chromium';
fs.mkdirSync(out,{recursive:true});let browser;const errors=[],evidence={engine,viewports:[],performance:[]};
const server=http.createServer(require('../scripts/static-handler.cjs')(root));
async function start(p,url){p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.click('#first-run-write');}
async function open(p){if(await p.locator('#oficina').isHidden())await p.click('#examinar-toggle');await p.waitForFunction(()=>document.querySelector('#ptbr-dashboard .ptbr-wheel button'));}
async function lens(p,id){await open(p);await p.evaluate(id=>{const b=document.querySelector('.ptbr-back');while(b&&!b.hidden){b.click();}const groups=[['ortografia','acentuacao','pontuacao','crase','concordancia'],['morfologia','sintaxe','relativas'],['expressoes','repeticao','adverbios','dialogo','decolonial'],['ritmo','rima','metrica']];document.querySelectorAll('.ptbr-goals button')[groups.findIndex(g=>g.includes(id))].click();},id);await p.click('[data-ptbr-lens="'+id+'"]');await p.waitForFunction(()=>/Análise concluída/.test(document.querySelector('#ptbr-dashboard [role=status]').textContent));}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined,args:engine==='chromium'?['--no-sandbox']:[]});
 const context=await browser.newContext({viewport:{width:1366,height:768},serviceWorkers:'allow'}),p=await context.newPage();p.setDefaultTimeout(15000);await start(p,url);
 await p.evaluate(()=>{window.lensCalls=0;const make=Escr.createVault;Escr.createVault=function(k){const v=make(k),analyze=v.analyze;v.analyze=function(){window.lensCalls++;return analyze.apply(v,arguments);};return v;};});
 // Abrir/editar/desligar não dispara lentes nem triagem linguística.
 await p.evaluate(()=>{window.triageCalls=0;const make=Escr.createSignalTriage;Escr.createSignalTriage=function(){const t=make.apply(this,arguments),scan=t.scan;t.scan=function(){window.triageCalls++;return scan.apply(t,arguments);};return t;};});
 await p.fill('#manuscrito','Eu canto. O canto terminou.');await open(p);await p.waitForTimeout(800);
 assert.equal(await p.evaluate(()=>window.lensCalls),0);assert.equal(await p.evaluate(()=>window.triageCalls),0);
 await lens(p,'morfologia');
 assert.equal(await p.locator('.ptbr-observation').filter({hasText:'Leitura contextual: verbo.'}).locator('blockquote').first().textContent(),'canto');
 assert.equal(await p.locator('.ptbr-observation').filter({hasText:'Leitura contextual: substantivo.'}).locator('blockquote').first().textContent(),'canto');
 assert.equal(await p.locator('#manuscrito').inputValue(),'Eu canto. O canto terminou.');
 // A mesma ocorrência alimenta etiqueta, arcos e explicação lateral; sem outro motor.
 const cantoWords=p.locator('.ptbr-word').filter({has:p.locator('.ptbr-word-text',{hasText:/^canto$/})});
 await cantoWords.nth(1).click();assert.ok((await p.locator('.ptbr-reading-selection').textContent()).includes('substantivo'));
 assert.equal(await p.locator('.ptbr-reading-details .ptbr-observation').count(),1);
 await p.waitForFunction(()=>document.querySelectorAll('.ptbr-relation-arcs path').length>0);
 for(const [w,h] of [[1366,768],[390,844],[320,568]]){
   await p.setViewportSize({width:w,height:h});
   assert.equal(await p.locator('#oficina').evaluate(n=>n.scrollWidth>n.clientWidth+1),false);
   const b=await p.locator('.ptbr-reading').boundingBox();assert.ok(b.x>=0&&b.x+b.width<=w+1);
   await p.screenshot({path:path.join(out,engine+'-leitura-'+w+'.png')});
 }
 await p.setViewportSize({width:1366,height:768});
 assert.equal(await p.locator('#manuscrito').inputValue(),'Eu canto. O canto terminou.');
 await p.click('#back-writing');await p.fill('#manuscrito','A menina não leu a carta ontem.');await lens(p,'sintaxe');
 const objectButton=p.getByRole('button',{name:'Objeto direto: a carta. Ver explicação.',exact:true});
 await objectButton.focus();await p.keyboard.press('Enter');
 assert.equal(await objectButton.getAttribute('aria-pressed'),'true');
 assert.ok((await p.locator('.ptbr-syntax-links').textContent()).includes('“leu” ↔ “a carta”'));
 await p.waitForFunction(()=>document.querySelectorAll('.ptbr-relation-arcs path').length===1);
 assert.equal(await p.locator('.ptbr-reading-details .ptbr-observation').count(),1);
 for(const width of [1366,390,320]){await p.setViewportSize({width,height:844});assert.equal(await p.locator('#oficina').evaluate(n=>n.scrollWidth>n.clientWidth+1),false);await p.screenshot({path:path.join(out,engine+'-sintaxe-'+width+'.png')});}
 assert.equal(await p.locator('#manuscrito').inputValue(),'A menina não leu a carta ontem.');
 await p.setViewportSize({width:1366,height:768});
 await p.click('#back-writing');await p.fill('#manuscrito','Eu estou lendo o livro.');await lens(p,'sintaxe');
 const groupButton=p.getByRole('button',{name:'Locução verbal: estou lendo. Ver explicação.',exact:true});await groupButton.focus();await p.keyboard.press('Enter');
 assert.ok((await groupButton.textContent()).includes('Auxiliar: estou'));assert.ok((await groupButton.textContent()).includes('Principal: lendo'));
 assert.ok((await p.locator('.ptbr-reading-details').textContent()).includes('não são contadas como duas orações'));
 assert.equal(await p.locator('#manuscrito').inputValue(),'Eu estou lendo o livro.');
 await p.click('#back-writing');await p.fill('#manuscrito','A menina que está cantando trabalha.');await lens(p,'relativas');
 assert.ok((await p.locator('.ptbr-reading-details').textContent()).includes('retoma “menina” e é sujeito de “está cantando”'));
 await p.locator('.ptbr-reading-details').getByRole('button',{name:'Ver no texto',exact:true}).click();
 assert.equal(await p.locator('#manuscrito').evaluate(n=>n.value.slice(n.selectionStart,n.selectionEnd)),'que está cantando');
 assert.equal(await p.locator('#manuscrito').inputValue(),'A menina que está cantando trabalha.');await open(p);
 await p.evaluate(()=>{window.lensCalls=0;document.querySelector('[data-ptbr-lens="morfologia"]').click();document.querySelector('[data-ptbr-lens="repeticao"]').click();});
 await p.waitForFunction(()=>/Análise concluída/.test(document.querySelector('#ptbr-dashboard [role=status]').textContent));
 assert.equal(await p.evaluate(()=>window.lensCalls),1,'troca cancela a lente anterior');
 await p.evaluate(()=>{window.lensCalls=0;document.querySelector('[data-ptbr-lens="morfologia"]').click();document.querySelector('.ptbr-cancel').click();});
 await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>window.lensCalls),0,'cancelamento explícito');
 await p.evaluate(()=>{document.querySelector('[data-ptbr-lens="morfologia"]').click();document.getElementById('back-writing').click();});
 await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>window.lensCalls),0,'desligar cancela');
 const sample='Em u\u0301ltima ana\u0301lise, volto. De vez em quando, escrevo muito muito. Falou que falou.';
 await p.fill('#manuscrito',sample);await p.waitForTimeout(800);assert.equal(await p.evaluate(()=>window.lensCalls),0,'digitar não executa lentes');
 await lens(p,'expressoes');assert.equal(await p.locator('.ptbr-observation').count(),2);
 await p.getByRole('button',{name:'Ver no texto',exact:true}).first().click();
 assert.equal(await p.locator('#manuscrito').evaluate(n=>n.value.slice(n.selectionStart,n.selectionEnd)),'Em u\u0301ltima ana\u0301lise');assert.equal(await p.evaluate(()=>document.activeElement.id),'manuscrito');
 await lens(p,'repeticao');assert.equal(await p.locator('.ptbr-observation').count(),2);assert.equal(await p.locator('#manuscrito').inputValue(),sample);
 await p.getByRole('button',{name:'Manter minha escolha',exact:true}).first().click();assert.ok((await p.evaluate(()=>Escr.ptbrPanelChoices())).includes('PTBR-REP-002|muito'));
 await lens(p,'repeticao');assert.equal(await p.locator('.ptbr-observation').count(),1);
 await p.getByRole('button',{name:'Consultar lentes individualmente',exact:true}).click();assert.equal(await p.locator('[data-lens="expressoes"]').isVisible(),true);
 // O mesmo armazenamento alimenta o fluxo individual.
 await p.click('[data-lens="repeticao"]');await p.waitForFunction(()=>!document.querySelector('[data-lens="repeticao"]').disabled);
 assert.equal(await p.locator('#findings').getByText('“muito” aparece em duas posições consecutivas.',{exact:true}).count(),0);
 await p.reload();if(await p.locator('#cabinet-resume').isVisible())await p.click('#cabinet-resume');
 assert.equal(await p.locator('#manuscrito').inputValue(),sample);await lens(p,'repeticao');assert.equal(await p.locator('.ptbr-observation').count(),1,'escolha persiste após recarga');
 for(const [width,height]of [[1366,768],[390,844],[320,568]]){await p.setViewportSize({width,height});await lens(p,'expressoes');assert.equal(await p.locator('#oficina').evaluate(n=>n.scrollWidth>n.clientWidth+1),false);const box=await p.locator('#oficina').boundingBox();assert.ok(box.x>=-1&&box.x+box.width<=width+1);await p.screenshot({path:path.join(out,engine+'-ptbr-'+width+'.png')});evidence.viewports.push({width,height,box});}
 // Interrompe a fila antes do primeiro callback e retira resultados obsoletos.
 await p.evaluate(()=>{document.querySelector('#ptbr-dashboard .ptbr-action').click();const m=document.getElementById('manuscrito');m.value='Um texto novo.';m.dispatchEvent(new Event('input',{bubbles:true}));});await p.waitForTimeout(100);assert.equal(await p.locator('.ptbr-outcome').count(),0);
 await p.evaluate(()=>{const m=document.getElementById('manuscrito');m.dispatchEvent(new CompositionEvent('compositionstart'));m.value='muito muito';m.dispatchEvent(new Event('input',{bubbles:true}));});await p.waitForTimeout(800);assert.equal(await p.locator('#ptbr-dashboard .ptbr-action').first().isDisabled(),true);assert.equal(await p.locator('.ptbr-outcome').count(),0);
 await p.evaluate(()=>document.getElementById('manuscrito').dispatchEvent(new CompositionEvent('compositionend')));await p.waitForTimeout(800);await lens(p,'repeticao');
 const priorKey=await p.evaluate(()=>Escr.ptbrPanelDocument());await p.evaluate(()=>{document.querySelector('#ptbr-dashboard .ptbr-action').click();document.getElementById('new-document').click();});await p.waitForTimeout(100);assert.notEqual(await p.evaluate(()=>Escr.ptbrPanelDocument()),priorKey);assert.equal(await p.locator('.ptbr-outcome').count(),0);
 // Tamanho do documento não amplia o recorte automático. Cronometria é evidência, não promessa de hardware.
 let cdp;if(engine==='chromium'){cdp=await context.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});}
 evidence.performance=await p.evaluate(()=>{const tr=Escr.createSignalTriage(Escr);return[200000,800000].map(size=>{const text=('palavra diferente muito muito. ').repeat(Math.ceil(size/31)).slice(0,size),times=[];let r;for(let i=0;i<7;i++){const t=performance.now();r=tr.scan(text);times.push(performance.now()-t);}times.sort((a,b)=>a-b);return{inputCharacters:text.length,work:r.work,partial:r.partial,medianMs:times[3],maxMs:times[6]};});});for(const r of evidence.performance){assert.ok(r.work.characters<=8000&&r.work.tokens<=1600);assert.ok(r.partial);}
 if(cdp)await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
 if(engine==='chromium'||process.env.PTBR_PWA_WEBKIT==='1'){
 await p.evaluate(()=>navigator.serviceWorker.ready);await p.reload();await p.waitForFunction(()=>!!navigator.serviceWorker.controller);await context.setOffline(true);await p.reload();if(await p.locator('#cabinet-resume').isVisible())await p.click('#cabinet-resume');await p.fill('#manuscrito','De vez em quando. muito muito');await lens(p,'expressoes');assert.equal(await p.locator('.ptbr-observation').count(),1);await p.fill('#manuscrito','Eu canto. O canto terminou.');await lens(p,'morfologia');assert.equal(await p.locator('.ptbr-observation').filter({hasText:'Leitura contextual: verbo.'}).count(),1);evidence.offline=true;
 }else{evidence.offline='Não validado: falha de recarga também reproduzida na base 9d16740 em WebKit/WPE.';}
 const portable=await browser.newContext({offline:engine==='chromium',serviceWorkers:'block'});if(engine==='webkit')await portable.route(/^https?:/,route=>route.abort());const f=await portable.newPage();await start(f,'file://'+path.join(root,'escrevaral.html'));await f.fill('#manuscrito','muito muito');await lens(f,'repeticao');assert.equal(await f.locator('.ptbr-observation').count(),1);await f.fill('#manuscrito','Eu canto. O canto terminou.');await lens(f,'morfologia');assert.equal(await f.locator('.ptbr-observation').filter({hasText:'Leitura contextual: substantivo.'}).count(),1);evidence.portableOffline=true;evidence.portableMethod=engine==='chromium'?'context-offline':'requisições HTTP/HTTPS bloqueadas';
 assert.deepEqual(errors,[]);evidence.errors=errors;fs.writeFileSync(path.join(out,engine+'-ptbr.json'),JSON.stringify(evidence,null,2)+'\n');console.log('PTBR BROWSER OK '+engine+': posições NFD, autoria persistida, lentes manuais, IME, edição, troca de folha, 3 larguras, triagem limitada e HTML portátil. PWA offline: '+(evidence.offline===true?'OK':'não validado')+'.');console.log(JSON.stringify(evidence.performance));
})().catch(e=>{evidence.failure=e.message;fs.writeFileSync(path.join(out,engine+'-ptbr.json'),JSON.stringify(evidence,null,2)+'\n');console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
