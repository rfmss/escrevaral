const {chromium,webkit}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),out=process.env.QA_OUTPUT||'/tmp',engine=process.env.BROWSER_ENGINE||'chromium';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(fs.readFileSync(path.join(root,'index.html')));});let browser;const errors=[];
const key='escrevaral.astra.notebooks.v1';
async function create(p,name){await p.click('#project-new');await p.fill('#project-name',name);await p.click('#project-create');}
async function board(p){await p.click('#os-start');await p.click('#start-chalkboard');await p.waitForSelector('#chalkboard:not([hidden])');}
async function draw(p){await p.locator('#chalk-canvas').scrollIntoViewIfNeeded();const r=await p.locator('#chalk-canvas').boundingBox();await p.mouse.move(r.x+r.width*.2,r.y+r.height*.3);await p.mouse.down();await p.mouse.move(r.x+r.width*.7,r.y+r.height*.6,{steps:10});await p.mouse.up();}
async function saved(p){return p.evaluate(key=>JSON.parse(localStorage.getItem(key))[0].data.chalk,key);}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,args:engine==='chromium'?['--no-sandbox']:[]});
 const context=await browser.newContext({viewport:{width:1366,height:768},hasTouch:true,serviceWorkers:'block'}),p=await context.newPage();p.setDefaultTimeout(10000);p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>{errors.push('diálogo nativo');d.dismiss();});await p.goto('http://127.0.0.1:'+server.address().port);
 await p.click('#os-start');await p.click('#start-chalkboard');assert.equal(await p.locator('#chalkboard').isVisible(),false);
 await p.keyboard.press('Escape');await create(p,'Marés');await board(p);await draw(p);assert.equal((await saved(p)).strokes.length,1);
 await p.click('#chalk-borracha');await p.locator('#chalk-canvas').tap();assert.equal((await saved(p)).strokes[1].tool,'borracha');await p.click('#chalk-undo');assert.equal((await saved(p)).strokes.length,1);
 await p.click('#chalk-grid');assert.equal((await saved(p)).grid,true);
 await p.click('#chalk-clear');await p.click('#app-dialog-cancel');assert.equal((await saved(p)).strokes.length,1);
 await p.locator('#chalk-canvas').focus();await p.keyboard.press('Space');await p.keyboard.press('ArrowDown');await p.keyboard.press('ArrowRight');await p.keyboard.press('Space');assert.equal((await saved(p)).strokes.length,2);
 let ev=p.waitForEvent('download');await p.click('#chalk-download');const raw=fs.readFileSync(await(await ev).path(),'utf8');assert.equal(JSON.parse(raw).drawing.strokes.length,2);
 await p.click('#chalk-clear');await p.click('#app-dialog-accept');assert.equal((await saved(p)).strokes.length,0);
 await p.setInputFiles('#chalk-import',{name:'mares.giz.txt',mimeType:'text/plain',buffer:Buffer.from(raw)});await p.click('#app-dialog-accept');assert.equal((await saved(p)).strokes.length,2);
 await p.setInputFiles('#chalk-import',{name:'errado.txt',mimeType:'text/plain',buffer:Buffer.from('{}')});assert.equal((await saved(p)).strokes.length,2);await p.waitForFunction(()=>document.getElementById('chalk-status').textContent.includes('não é'));
 await p.click('#chalk-close');assert.equal(await p.locator('#chalk-canvas').getAttribute('width'),'1');await p.click('#window-minimize');await create(p,'Outro livro');await board(p);assert.equal(await p.locator('#chalk-count').textContent(),'0 traços');await p.click('#chalk-close');await p.click('#window-minimize');await p.getByRole('button',{name:'Abrir caderno Marés',exact:true}).click();await board(p);assert.equal(await p.locator('#chalk-count').textContent(),'2 traços');
 // Failed save retains work and blocks close; successful retry persists it.
 await p.evaluate(()=>{window.oldSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='escrevaral.astra.notebooks.v1')throw new DOMException('quota','QuotaExceededError');return window.oldSet.call(this,k,v);};});await draw(p);await p.click('#chalk-close');assert.equal(await p.locator('#chalkboard').isVisible(),true);assert.ok((await p.locator('#chalk-status').textContent()).includes('Faltou espaço'));
 await p.click('#chalk-copy-show');assert.equal(JSON.parse(await p.locator('#chalk-copy').inputValue()).drawing.strokes.length,3);
 await p.evaluate(()=>{Storage.prototype.setItem=window.oldSet;});await p.click('#chalk-retry');assert.equal((await saved(p)).strokes.length,3);await p.click('#chalk-close');
 // Notebook package export/import carries drawing.
 ev=p.waitForEvent('download');await p.click('#notebook-export');const packet=fs.readFileSync(await(await ev).path());assert.equal(JSON.parse(packet).notebooks[0].data.chalk.strokes.length,3);
 await p.click('#os-start');await p.click('#start-settings');await p.setInputFiles('#import-file',{name:'mares.scrvrl',mimeType:'application/json',buffer:packet});await p.click('#app-dialog-accept');await p.click('#mesa-close');await p.getByRole('button',{name:'Abrir caderno Marés — cópia 1',exact:true}).click();await board(p);assert.equal(await p.locator('#chalk-count').textContent(),'3 traços');
 for(const dark of [false,true])for(const [w,h]of [[1366,768],[820,600],[390,844],[320,568],[667,375]]){
  await p.evaluate(d=>document.body.setAttribute('data-theme',d?'escuro':'claro'),dark);await p.setViewportSize({width:w,height:h});await p.waitForTimeout(150);await p.locator('#chalkboard').evaluate(n=>n.scrollTop=0);
  assert.equal(await p.locator('#chalkboard').evaluate(n=>n.scrollWidth>n.clientWidth),false);assert.equal(await p.locator('#chalk-frame').evaluate(n=>n.scrollWidth>n.clientWidth+1),false);
  await p.screenshot({path:path.join(out,engine+'-quadro-'+w+(dark?'-escuro':'')+'.png')});await p.locator('#chalk-download').scrollIntoViewIfNeeded();const r=await p.locator('#chalk-download').boundingBox();assert.ok(r.y>=0&&r.y+r.height<=h+1);
 }
 await p.click('#chalk-close');await p.reload();await board(p);assert.equal(await p.locator('#chalk-count').textContent(),'3 traços');await p.click('#chalk-close');
 // Fallback without PointerEvent: actual mouse and synthetic legacy touch sequence, no duplicate stroke.
 const legacy=await browser.newContext({viewport:{width:820,height:600},hasTouch:true,serviceWorkers:'block'});await legacy.addInitScript(()=>{window.PointerEvent=undefined;});const l=await legacy.newPage();l.on('pageerror',e=>errors.push(e.message));await l.goto('http://127.0.0.1:'+server.address().port);await create(l,'Legado');await board(l);await draw(l);assert.equal((await saved(l)).strokes.length,1);
 await l.locator('#chalk-canvas').evaluate(c=>{const r=c.getBoundingClientRect();function send(type,x,y){const e=new Event(type,{bubbles:true,cancelable:true});e.changedTouches=[{identifier:7,clientX:r.x+x*r.width,clientY:r.y+y*r.height}];e.touches=type==='touchend'?[]:e.changedTouches;c.dispatchEvent(e);}send('touchstart',.3,.3);send('touchmove',.5,.4);send('touchend',.5,.4);});assert.equal((await saved(l)).strokes.length,2);
 assert.deepEqual(errors,[]);console.log('OK '+engine+': desenho, toque, teclado, borracha, desfazer, confirmação, quota/retry, arquivos, pacotes, isolamento, recarga, 5 viewports e fallback mouse/toque.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
