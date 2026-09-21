
// Regressões de interface: confirmação nunca executa a ação antes da escolha.
// QA apenas; Playwright não faz parte do aplicativo.
const {chromium,webkit}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),out=process.env.QA_OUTPUT||'/tmp',engine=process.env.BROWSER_ENGINE||'chromium';
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
 const file=path.join(root,req.url==='/'?'index.html':req.url.split('?')[0]);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/html');res.end(fs.readFileSync(file));
});
let browser;const errors=[];
async function create(p,name){await p.click('#project-new');await p.fill('#project-name',name);await p.click('#project-create');}
async function universe(p){await p.click('#os-start');await p.click('#start-universe');}
async function settings(p){await p.click('#os-start');await p.click('#start-settings');}
async function snapshot(p,name){await p.screenshot({path:path.join(out,engine+'-'+name+'.png')});}
async function noOverflow(p,selector){
 const measures=await p.locator(selector).evaluate(n=>({scroll:n.scrollWidth,client:n.clientWidth}));
 assert.ok(measures.scroll<=measures.client+1,selector+' horizontal overflow: '+JSON.stringify(measures));
}
async function withinViewport(p,selector){
 const r=await p.locator(selector).boundingBox(),v=p.viewportSize();
 assert.ok(r&&r.width>0&&r.height>0,selector+' visible');
 assert.ok(r.x>=-1&&r.y>=-1&&r.x+r.width<=v.width+1&&r.y+r.height<=v.height+1,selector+' clipped: '+JSON.stringify(r));
}
async function footer(p){
 const ids=['#os-start','#os-window-task','#pomodoro-task','#cabinet-return','#screen-lock'];
 const rects=[];
 for(const id of ids){if(await p.locator(id).isVisible()){await withinViewport(p,id);rects.push({id,r:await p.locator(id).boundingBox()});}}
 rects.sort((a,b)=>a.r.x-b.r.x);
 for(let i=1;i<rects.length;i++)assert.ok(rects[i-1].r.x+rects[i-1].r.width<=rects[i].r.x+1,'Footer collision: '+rects[i-1].id+' / '+rects[i].id);
 const start=await p.locator('#os-start').boundingBox();assert.ok(start.height>=44);
}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:engine==='chromium'?['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:[]});
 const context=await browser.newContext({viewport:{width:1366,height:650},serviceWorkers:'block',hasTouch:true});
 const p=await context.newPage();p.setDefaultTimeout(10000);
 p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>{errors.push('Native dialog '+d.type());d.dismiss();});
 await p.goto(url);await p.locator('#os-start').screenshot({path:path.join(out,engine+'-inicio.png')});await create(p,'Meu primeiro livro');
 // Real notebook trash: no write on open/cancel, explicit action on confirm.
 const original=await p.evaluate(()=>localStorage.getItem('escrevaral.astra.notebooks.v1'));
 await p.click('#notebook-trash');
 assert.equal(await p.locator('#app-dialog').isVisible(),true);
 assert.equal(await p.evaluate(()=>document.activeElement.id),'app-dialog-cancel');
 assert.equal(await p.evaluate(()=>localStorage.getItem('escrevaral.astra.notebooks.v1')),original);
 await p.keyboard.press('Shift+Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'app-dialog-accept');
 await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'app-dialog-cancel');
 await p.keyboard.press('Escape');
 assert.equal(await p.evaluate(()=>localStorage.getItem('escrevaral.astra.notebooks.v1')),original);
 assert.equal(await p.evaluate(()=>document.activeElement.id),'notebook-trash');
 await p.click('#notebook-trash');await snapshot(p,'confirmacao-claro');await p.click('#app-dialog-cancel');
 // Nested dialog in the universe: Escape cancels only the confirmation and preserves form.
 await universe(p);await p.click('#story-records');await p.getByRole('button',{name:'+ Personagem',exact:true}).click();
 await p.fill('#story-field-name','Ana');await p.click('#story-close');
 await p.keyboard.press('Escape');assert.equal(await p.locator('#story-field-name').inputValue(),'Ana');
 await p.click('#story-close');await p.click('#app-dialog-accept');assert.equal(await p.locator('#story-screen').isVisible(),false);
 await universe(p);await p.click('#story-records');await p.getByRole('button',{name:'+ Personagem',exact:true}).click();
 await p.fill('#story-field-name','Ana');await p.locator('#story-form button[type=submit]').click();
 await p.getByRole('button',{name:'Editar ficha',exact:true}).click();await p.getByRole('button',{name:'Excluir ficha',exact:true}).click();
 await p.click('#app-dialog-cancel');assert.equal(await p.locator('#story-field-name').inputValue(),'Ana');
 await p.getByRole('button',{name:'Excluir ficha',exact:true}).click();await p.click('#app-dialog-accept');
 assert.equal(await p.locator('#story-list .polaroid').count(),0);await p.click('#story-close');
 // Export/import: cancellation retains package count; failed write is reported asynchronously.
 const download=p.waitForEvent('download');await p.click('#notebook-export');const packet=fs.readFileSync(await (await download).path());
 await settings(p);await p.setInputFiles('#import-file',{name:'teste.scrvrl',mimeType:'application/json',buffer:packet});
 await p.click('#app-dialog-cancel');assert.equal(await p.locator('.notebook-cover').count(),1);
 await p.setInputFiles('#import-file',{name:'teste.scrvrl',mimeType:'application/json',buffer:packet});
 await p.waitForSelector('#app-dialog:not([hidden])');
 await p.evaluate(()=>{window.savedSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='escrevaral.astra.notebooks.transaction.v1')throw new DOMException('quota','QuotaExceededError');return window.savedSetItem.call(this,k,v);};});
 await p.click('#app-dialog-accept');
 assert.ok((await p.locator('#cabinet-status').textContent()).includes('Faltou espaço'));
 await p.evaluate(()=>{Storage.prototype.setItem=window.savedSetItem;});
 assert.equal(await p.locator('.notebook-cover').count(),1);
 await p.click('#mesa-close');
 await p.click('#notebook-trash');await p.click('#app-dialog-accept');assert.equal(await p.locator('.notebook-cover').count(),0);
 await p.click('#os-start');await p.click('#start-trash');await p.getByRole('button',{name:'Restaurar caderno completo'}).click();
 assert.equal(await p.locator('.notebook-cover').count(),1);await p.click('#acervo-close');await create(p,'Outro projeto com nome longo');
 // Long content, narrow displays, themes: dialogs scroll inside the viewport.
 for(const dark of [false,true]){
  await p.evaluate(dark=>document.body.setAttribute('data-theme',dark?'escuro':'claro'),dark);
  for(const [w,h] of [[1366,650],[820,600],[390,844],[320,568],[667,375],[683,325],[320,260]]){
   await p.setViewportSize({width:w,height:h});
   await p.evaluate(()=>Escr.dialog.ask({title:'Mover caderno para a lixeira?',message:'O caderno “'+new Array(31).join('Maré ')+'” irá com todo o conteúdo. Você poderá restaurá-lo pelo menu Início.',accept:'Mover para a lixeira'},function(){}));
   await noOverflow(p,'#app-dialog');await noOverflow(p,'.app-dialog-card');
   await p.locator('#app-dialog-accept').scrollIntoViewIfNeeded();await withinViewport(p,'#app-dialog-accept');
   await snapshot(p,'dialogo-'+w+'x'+h+(dark?'-escuro':''));
   await p.click('#app-dialog-cancel');await footer(p);
  }
 }
 // Ready timer is restored from real persisted state, not just toggled HTML.
 await p.setViewportSize({width:1366,height:650});
 await p.evaluate(()=>localStorage.setItem('escrevaral.astra.pomodoro.v1',JSON.stringify({mode:'ready',target:0,paused:false,remaining:0,work:50,rest:6,quote:1})));
 await p.reload();assert.equal(await p.locator('#focus-challenge').isVisible(),true);await p.waitForFunction(()=>document.querySelectorAll('.focus-digit.flipping').length===0);
 for(const [w,h] of [[1366,650],[820,600],[390,844],[320,568],[667,375],[683,325],[320,260]]){
  await p.setViewportSize({width:w,height:h});await p.click('#pomodoro-task');
  const top=await p.locator('#location-path').boundingBox(),bottom=await p.locator('#system-bar').boundingBox(),panel=await p.locator('#focus-pause').boundingBox();
  assert.ok(panel.y>=top.y+top.height-1);assert.ok(panel.y+panel.height<=bottom.y+1);
  assert.equal(await p.locator('#focus-pause').evaluate(n=>n.scrollTop),0);
  if(h<500)await p.locator('.focus-clock-shell').scrollIntoViewIfNeeded();await withinViewport(p,'.focus-clock-shell');await noOverflow(p,'#focus-pause');await footer(p);
  await p.locator('#focus-form button').scrollIntoViewIfNeeded();await withinViewport(p,'#focus-form button');
  await p.fill('#focus-answer','Pessoa');await p.locator('#focus-form button').click();
  assert.ok((await p.locator('#focus-answer-status').textContent()).includes('primeiro nome'));
  await p.locator('#focus-pause').evaluate(n=>n.scrollTop=0);
  await snapshot(p,'pausa-'+w+'x'+h);
  await p.click('#pomodoro-task');assert.equal(await p.locator('#focus-pause').evaluate(n=>n.scrollTop),0);
 }
 // All existing sheet entry points use the visible height; body stays within viewport.
 await p.setViewportSize({width:320,height:568});await p.click('#focus-close');
 for(const [trigger,panel] of [['#start-settings','#mesa'],['#start-calendar','#utilidades'],['#start-calculator','#utilidades'],['#start-trash','#acervo']]){
  await p.click('#os-start');await p.click(trigger);await withinViewport(p,panel);await noOverflow(p,panel);await p.keyboard.press('Escape');
 }
 // Actual dialog on touch, and Start key pressed state, after mobile layout.
 await p.click('#os-start');assert.equal(await p.locator('#os-start').getAttribute('aria-expanded'),'true');
 assert.equal(await p.locator('#os-start .os-rocker').isVisible(),true);
 await p.keyboard.press('Escape');await p.locator('#screen-lock').tap();await p.locator('#keychain-ring').tap();
 await p.evaluate(()=>Escr.dialog.ask({title:'Confirmar ação',message:'Teste de toque.',accept:'Confirmar'},function(ok){window.touchResult=ok;}));
 await p.locator('#app-dialog-accept').tap();assert.equal(await p.evaluate(()=>window.touchResult),true);
 assert.deepEqual(errors,[]);console.log('OK '+engine+': confirmações reais, cancelamento, foco, teclado/toque, importação/quota, 7 tamanhos, pausa encerrada e painéis.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
