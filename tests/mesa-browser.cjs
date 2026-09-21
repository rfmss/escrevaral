// Regressões do percurso visual: estado, persistência e espaço útil da escrita.
const {chromium,webkit}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),out=process.env.QA_OUTPUT||'/tmp',engine=process.env.BROWSER_ENGINE||'chromium';fs.mkdirSync(out,{recursive:true});let browser;const errors=[];
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(fs.readFileSync(path.join(root,'index.html')));});
async function form(p,id,name){await p.click(id);await p.fill('#project-name',name);await p.click('#project-create');}
async function current(p){return p.evaluate(()=>JSON.parse(localStorage.getItem('escrevaral.astra.v1.doc.'+localStorage.getItem('escrevaral.astra.current'))));}
async function shot(p,name){await p.screenshot({path:path.join(out,engine+'-'+name+'.png')});}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,args:engine==='chromium'?['--no-sandbox']:[]});
 const c=await browser.newContext({viewport:{width:1366,height:768},serviceWorkers:'block'}),p=await c.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+server.address().port);
 // Shape and text position remain stable, including pressed and dark states.
 for(const theme of ['claro','escuro']){
  await p.evaluate(t=>document.body.setAttribute('data-theme',t),theme);
  const shell=await p.locator('#os-start').boundingBox(),label=await p.locator('.start-key').boundingBox();
  await p.locator('#os-start').hover();await p.mouse.down();assert.deepEqual(await p.locator('#os-start').boundingBox(),shell);assert.deepEqual(await p.locator('.start-key').boundingBox(),label);await p.mouse.up();
  assert.deepEqual(await p.locator('#os-start').boundingBox(),shell);assert.deepEqual(await p.locator('.start-key').boundingBox(),label);await p.keyboard.press('Escape');
 }
 await p.evaluate(()=>document.body.setAttribute('data-theme','claro'));
 assert.ok((await p.locator('#notebook-hint').textContent()).includes('dois cliques'));
 await p.locator('#notebook-hint .pointer-hint').dblclick();await p.fill('#project-name','Rascunhos');await p.click('#project-create');await p.click('#notebook-back');assert.equal(await p.locator('#notebook-hint').isVisible(),true);assert.equal(await p.locator('.notebook-state').count(),0);
 await p.click('#desktop-organize');await form(p,'#original-new','Romance');await form(p,'#volume-new','Primeiro caderno');await p.click('#cabinet-new');await p.fill('#titulo','Cena um');await p.fill('#manuscrito','Uma folha guardada no primeiro caderno.');await p.keyboard.press('Control+s');const first=await current(p);await p.click('#desk-minimize');
 await form(p,'#volume-new','Segundo caderno');await p.click('#cabinet-new');await p.fill('#titulo','Cena dois');await p.fill('#manuscrito','Uma segunda folha.');await p.keyboard.press('Control+s');const second=await current(p);
 assert.equal(await p.locator('#desk-inspector').isVisible(),false);await p.click('#desk-counts');assert.equal(await p.locator('#desk-inspector').isVisible(),true);await p.keyboard.press('Escape');assert.equal(await p.locator('#desk-inspector').isVisible(),false);
 assert.equal(await p.locator('#back-cabinet .escrevaral-mark path').getAttribute('fill'),'currentColor');
 // Navigation commits the current text before opening a different book.
 await p.fill('#manuscrito','Texto alterado antes da troca.');await p.locator('[data-route-book="'+first.projectId+'"]').click();assert.equal(await p.locator('#manuscrito').inputValue(),first.text);await p.locator('[data-route-book="'+second.projectId+'"]').click();assert.equal(await p.locator('#manuscrito').inputValue(),'Texto alterado antes da troca.');
 // IME and storage failures must keep the active sheet intact.
 await p.locator('#manuscrito').dispatchEvent('compositionstart');await p.locator('[data-route-book="'+first.projectId+'"]').click();assert.equal(await p.locator('#titulo').inputValue(),'Cena dois');await p.locator('#manuscrito').dispatchEvent('compositionend');
 await p.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.indexOf('escrevaral.astra.v1.doc.')===0)throw new DOMException('quota','QuotaExceededError');return window.originalSetItem.call(this,k,v);};});
 await p.fill('#manuscrito','Ainda não salvo.');await p.locator('[data-route-book="'+first.projectId+'"]').click();assert.equal(await p.locator('#manuscrito').inputValue(),'Ainda não salvo.');assert.equal(await p.locator('#titulo').inputValue(),'Cena dois');await p.evaluate(()=>{Storage.prototype.setItem=window.originalSetItem;});await p.keyboard.press('Control+s');
 for(const [width,height]of [[1366,768],[820,600],[390,844],[320,568],[667,375]]){
  await p.setViewportSize({width,height});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const paper=await p.locator('#editor-viewport').boundingBox();assert.ok(paper.width>200&&paper.height>80,JSON.stringify(paper));
  if(await p.locator('#desk-documents').isVisible())await p.click('#desk-documents');
  await shot(p,'mesa-g2-'+width);assert.equal(await p.locator('[data-route-book="'+second.projectId+'"]').isVisible(),true);const leaves=await p.locator('#timeline-list').boundingBox();assert.ok(leaves.height>=45,'folhas acessíveis em '+width+'x'+height+' '+JSON.stringify(leaves));
  if(await p.locator('#desk-documents').isVisible())await p.click('#desk-documents');
 }
 await p.setViewportSize({width:1366,height:768});await p.evaluate(()=>document.body.setAttribute('data-theme','escuro'));await shot(p,'mesa-g2-escuro');await p.evaluate(()=>document.body.setAttribute('data-theme','claro'));
 await p.click('#desk-minimize');await p.click('#original-back');await p.click('#reminder-new');await p.locator('.desktop-reminder textarea').fill('Rever a chegada.');await p.reload();assert.equal(await p.locator('.desktop-reminder textarea').inputValue(),'Rever a chegada.');await p.click('.reminder-trash');await p.click('#app-dialog-cancel');assert.equal(await p.locator('.desktop-reminder').count(),1);await shot(p,'gavetas-postit-g2');await p.click('.reminder-trash');await p.click('#app-dialog-accept');assert.equal(await p.locator('.desktop-reminder').count(),0);
 const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block'}),q=await touch.newPage();await q.goto('http://127.0.0.1:'+server.address().port);assert.equal(await q.locator('.touch-hint').isVisible(),true);assert.equal(await q.locator('.pointer-hint').isVisible(),false);await form(q,'#project-new','Caderno de bolso');assert.equal(await q.locator('#cabinet-window').isVisible(),true);
 assert.deepEqual(errors,[]);console.log('OK '+engine+': Início estável; duplo clique/toque; logo; percurso salva, retoma e bloqueia falha/IME; contagem recolhida; 5 telas; post-it persiste e confirma lixeira.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
