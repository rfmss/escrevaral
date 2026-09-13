// Playwright é usado apenas no teste, nunca distribuído com o aplicativo.
// NODE_PATH=... CHROMIUM_PATH=... node tests/cadernos-browser.cjs
const {chromium} = require('playwright');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const root = path.join(__dirname,'..');
const server = http.createServer((req,res)=>{const f=path.join(root,req.url==='/'?'index.html':req.url.split('?')[0]); if(!f.startsWith(root)||!fs.existsSync(f)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':'text/html');res.end(fs.readFileSync(f));});
let browser;
const errors=[];
async function makePage(options={}) { const context=await browser.newContext({serviceWorkers:'block',acceptDownloads:true,viewport:{width:1366,height:768},...options});const page=await context.newPage();page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.stack));page.on('dialog',d=>d.accept());return page; }
async function create(page,name) {await page.click('#project-new');await page.fill('#project-name',name);await page.click('#project-create');assert.equal(await page.locator('#cabinet-heading').textContent(),name);}
async function write(page,title,body) {await page.click('#cabinet-new');await page.fill('#titulo',title);await page.fill('#manuscrito',body);await page.click('#desk-minimize');}
async function download(page,selector) {const event=page.waitForEvent('download');await page.click(selector);const d=await event;return {name:d.suggestedFilename(),buffer:fs.readFileSync(await d.path())};}
async function settings(page) {await page.click('#os-start');await page.click('#start-settings');}
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
  const p=await makePage();await p.goto(url);assert.equal(await p.locator('#cabinet-window').isVisible(),false);
  await p.locator('#notebook-area').dblclick({position:{x:400,y:100}});assert.equal(await p.locator('#notebook-dialog').isVisible(),true);await p.keyboard.press('Escape');assert.equal(await p.locator('#notebook-dialog').isVisible(),false);
  await create(p,'Romance do mar');await write(p,'Capítulo um','O mar bateu três vezes à porta.');
  await create(p,'Contos');assert.equal(await p.locator('.cabinet-note').count(),0);await write(p,'Outro mundo','Uma chave perdida.');
  await p.getByRole('button',{name:'Abrir caderno Romance do mar',exact:true}).click();assert.equal(await p.locator('#manuscrito').inputValue(),'O mar bateu três vezes à porta.');
  await p.click('#back-cabinet');await p.fill('#cabinet-search','chave');await p.waitForTimeout(250);assert.equal(await p.locator('.cabinet-note').count(),0);await p.click('#cabinet-clear');
  await p.click('#notebook-rename');await p.fill('#project-name','Mar & <livro>');await p.click('#project-create');assert.equal(await p.locator('#cabinet-heading').textContent(),'Mar & <livro>');assert.equal(await p.locator('.cabinet-note').count(),1);
  await p.click('#os-start');await p.click('#start-calendar');await p.fill('#calendar-text','Revisar o primeiro capítulo');await p.click('#calendar-form button');await p.click('#utility-close');
  const packet=await download(p,'#notebook-export');const payload=JSON.parse(packet.buffer);assert.equal(payload.documents.length,1);assert.ok(JSON.stringify(payload.notebooks[0].data.planner).includes('Revisar o primeiro capítulo'));assert.equal(payload.scope,'notebook');
  await p.screenshot({path:'/tmp/cadernos-aberto.png'});
  await p.click('#window-minimize');await p.reload();assert.equal(await p.locator('#cabinet-window').isVisible(),false);assert.equal(await p.locator('.notebook-cover').count(),2);
  await p.click('#reminder-new');await p.fill('#reminder-list textarea','Lembrete geral da mesa');
  await settings(p);const full=await download(p,'#export-backup');const all=JSON.parse(full.buffer);assert.equal(all.scope,'all');assert.equal(all.notebooks.length,2);assert.equal(all.documents.length,3);
  await p.click('#mesa-close');await p.screenshot({path:'/tmp/cadernos-mesa.png'});
  const target=await makePage();await target.goto(url);await settings(target);await target.setInputFiles('#import-file',{name:packet.name,mimeType:'application/json',buffer:packet.buffer});await target.waitForFunction(()=>document.querySelectorAll('.notebook-cover').length===1);
  await target.getByRole('button',{name:'Abrir caderno Mar & <livro>',exact:true}).click();assert.equal(await target.locator('.cabinet-note').count(),1);
  await target.click('#notebook-export'); // export remains available after importing
  await settings(target);await target.setInputFiles('#import-file',{name:packet.name,mimeType:'application/json',buffer:packet.buffer});await target.waitForFunction(()=>document.querySelectorAll('.notebook-cover').length===2);assert.ok((await target.locator('#notebook-list').textContent()).includes('cópia 1'));
  await target.getByRole('button',{name:'Abrir caderno Mar & <livro>',exact:true}).click();await target.click('#notebook-trash');assert.equal(await target.locator('.notebook-cover').count(),1);
  await target.click('#os-start');await target.click('#start-trash');await target.getByRole('button',{name:'Restaurar caderno completo'}).click();assert.equal(await target.locator('.notebook-cover').count(),2);
  const restore=await makePage();await restore.goto(url);await settings(restore);await restore.setInputFiles('#import-file',{name:full.name,mimeType:'application/json',buffer:full.buffer});await restore.waitForFunction(()=>document.querySelectorAll('.notebook-cover').length===2);await restore.waitForTimeout(200);assert.equal(await restore.locator('#reminder-list textarea').inputValue(),'Lembrete geral da mesa');
  const legacy=await makePage();await legacy.goto(url);const legacyRaw=await legacy.evaluate(()=>{const d=Escr.freshDocument();d.project='Projeto anterior';d.title='Folha antiga';d.text='Não mudar os meus registros.';const saved=Escr.createArchive(localStorage).save(d).document;return {id:saved.id,raw:localStorage.getItem('escrevaral.astra.v1.doc.'+saved.id)};});await legacy.reload();assert.equal(await legacy.locator('.notebook-cover').count(),1);assert.equal(await legacy.locator('#cabinet-window').isVisible(),false);assert.equal(await legacy.evaluate(id=>localStorage.getItem('escrevaral.astra.v1.doc.'+id),legacyRaw.id),legacyRaw.raw);
  // Falha real no navegador: minimizar não esconde texto que não foi salvo.
  await p.getByRole('button',{name:'Abrir caderno Contos',exact:true}).click();assert.equal(await p.locator('#writing-space').isVisible(),true);
  await p.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.indexOf('escrevaral.astra.v1.doc.')===0){throw new DOMException('quota','QuotaExceededError');}return original.call(this,k,v);};});
  await p.fill('#manuscrito','Texto ainda não salvo');await p.click('#desk-minimize');assert.equal(await p.locator('#writing-space').isVisible(),true);assert.equal(await p.locator('#manuscrito').inputValue(),'Texto ainda não salvo');
  // Toque em tela estreita e abertura pelo menu Início.
  const mobile=await makePage({viewport:{width:375,height:667},hasTouch:true,isMobile:true});await mobile.goto(url);await mobile.click('#os-start');await mobile.click('#start-new-notebook');await mobile.fill('#project-name','Caderno de bolso');await mobile.click('#project-create');await write(mobile,'Nota','Texto no aparelho pequeno.');
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await mobile.screenshot({path:'/tmp/cadernos-mobile.png'});
  const offline=await makePage({serviceWorkers:'allow'});await offline.goto(url);await offline.evaluate(()=>navigator.serviceWorker.ready);await offline.waitForFunction(()=>!!navigator.serviceWorker.controller);await create(offline,'Sem rede');await write(offline,'Anotação','O caderno abre sem conexão.');await offline.context().setOffline(true);await offline.reload();await offline.getByRole('button',{name:'Abrir caderno Sem rede',exact:true}).click();assert.equal(await offline.locator('#manuscrito').inputValue(),'O caderno abre sem conexão.');
  assert.deepEqual(errors,[]);console.log('OK: duplo clique, teclado, criação, isolamento, renomeação, calendário, exportação, importação, cópia, lixeira, recarga, falha de gravação tela de 375 px e recarga offline.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser){await browser.close();}server.close();});
