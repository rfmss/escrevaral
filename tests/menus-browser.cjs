// Observações de 24/09: cópia independente da seleção e hierarquia com controles acessíveis.
const {chromium,webkit}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),out=process.env.QA_OUTPUT||'/tmp',engine=process.env.BROWSER_ENGINE||'chromium';fs.mkdirSync(out,{recursive:true});let browser;const errors=[];
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(fs.readFileSync(path.join(root,'index.html')));});
async function select(p,a,b){await p.locator('#manuscrito').evaluate((n,[a,b])=>{n.focus();n.setSelectionRange(a,b);n.dispatchEvent(new Event('select'));},[a,b]);}
async function shot(p,name){await p.screenshot({path:path.join(out,engine+'-24set-'+name+'.png')});}
async function fits(p,selector){const b=await p.locator(selector).boundingBox(),v=p.viewportSize();assert.ok(b&&b.x>=-1&&b.y>=-1&&b.x+b.width<=v.width+1&&b.y+b.height<=v.height+1,selector+' '+JSON.stringify(b));}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,args:engine==='chromium'?['--no-sandbox']:[]});
 const c=await browser.newContext({viewport:{width:1366,height:654},serviceWorkers:'block'}),p=await c.newPage();p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+server.address().port);
 assert.equal(await p.locator('#path-home').isVisible(),false);assert.equal(await p.locator('#path-projects').isVisible(),true);
 await p.click('#project-new');await p.fill('#project-name','Caderno das marés');await p.click('#project-create');await p.click('#cabinet-new');await p.fill('#titulo','O cais');await p.fill('#manuscrito','Maré alta. O barco espera.');
 await select(p,0,4);assert.equal(await p.locator('#desk-paste').isVisible(),false);await p.click('#selection-copy');assert.equal(await p.locator('#desk-paste').isVisible(),true);
 // A seleção de destino não substitui a cópia; colar funciona também só com o cursor.
 await select(p,5,9);await p.click('#selection-paste');assert.equal(await p.locator('#manuscrito').inputValue(),'Maré Maré. O barco espera.');
 await select(p,25,25);assert.equal(await p.locator('#selection-tools').isVisible(),false);await p.click('#desk-paste');assert.equal(await p.locator('#manuscrito').inputValue(),'Maré Maré. O barco espera.Maré');
 await select(p,0,4);await p.click('#selection-cut');assert.equal(await p.locator('#manuscrito').inputValue(),' Maré. O barco espera.Maré');await p.click('#desk-paste');assert.equal(await p.locator('#manuscrito').inputValue(),'Maré Maré. O barco espera.Maré');
 await select(p,0,4);await p.locator('#manuscrito').dispatchEvent('compositionstart');await p.locator('#selection-cut').evaluate(n=>n.click());assert.equal(await p.locator('#manuscrito').inputValue(),'Maré Maré. O barco espera.Maré');await p.locator('#manuscrito').dispatchEvent('compositionend');await p.keyboard.press('Escape');assert.equal(await p.locator('#selection-tools').isVisible(),false);
 await p.fill('#manuscrito','A chuva alcançou o cais.\n\nJoana guardou a carta no bolso antes de chamar o barqueiro.');await p.keyboard.press('Control+s');
 for(const [width,height]of [[1366,654],[820,600],[390,844],[320,568],[667,375]]){
  await p.setViewportSize({width,height});
  for(const theme of ['claro','escuro']){
   await p.evaluate(t=>document.body.setAttribute('data-theme',t),theme);await select(p,0,7);await fits(p,'#selection-tools');
   for(const id of ['selection-copy','selection-cut','selection-paste','selection-external','selection-examine','selection-close'])await fits(p,'#'+id);
   await p.click('#selection-close');await fits(p,'#desk-paste');
   const overflow=await p.locator('.writing-toolbar').evaluate(n=>n.scrollWidth>n.clientWidth+1);assert.equal(overflow,false,'barra de escrita '+width+' '+theme);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   if(theme==='claro'&&(width===1366||width===320))await shot(p,'mesa-'+width);
   await p.click('#mesa-toggle');await fits(p,'#mesa');await fits(p,'#mesa-close');
   const switchBox=await p.locator('.switch-track').boundingBox();assert.ok(switchBox.width>=70&&switchBox.height>=28);assert.equal(await p.locator('#mesa').evaluate(n=>n.scrollWidth>n.clientWidth+1),false,'ajustes '+width);
   await p.locator('.switch-track').scrollIntoViewIfNeeded();await p.locator('.switch-track').click();assert.equal(await p.locator('#som').isChecked(),true);await p.locator('.switch-track').click();assert.equal(await p.locator('#som').isChecked(),false);
   if((width===1366&&theme==='claro')||(width===320&&theme==='escuro')){await p.locator('#mesa').evaluate(n=>n.scrollTop=0);await shot(p,'ajustes-'+width);}
   await p.click('#mesa-close');
  }
 }
 await p.setViewportSize({width:1366,height:654});await p.evaluate(()=>document.body.setAttribute('data-theme','claro'));await p.click('#os-start');await p.click('#start-tools-toggle');assert.equal(await p.locator('#start-tools-toggle').getAttribute('aria-expanded'),'true');await shot(p,'inicio');await p.keyboard.press('Escape');
 await select(p,0,7);await shot(p,'selecao');await p.click('#selection-close');await p.click('#screen-lock');assert.ok((await p.locator('#lock-help').textContent()).includes('argola'));assert.equal(await p.evaluate(()=>document.activeElement.id),'keychain-ring');await p.keyboard.press('Enter');assert.equal(await p.locator('#lock-curtain').isVisible(),false);
 await p.click('#timeline-new');await p.fill('#titulo','Outra folha');await select(p,0,0);await p.click('#desk-paste');assert.equal(await p.locator('#manuscrito').inputValue(),'Maré');await p.keyboard.press('Control+s');await p.reload();assert.equal(await p.locator('#manuscrito').inputValue(),'Maré');assert.equal(await p.locator('#desk-paste').isVisible(),false);
 assert.deepEqual(errors,[]);console.log('OK '+engine+': cópia explícita, substituição, cursor, recorte, IME, troca de texto, persistência, menus e ajustes em 5 telas/2 temas, argola por teclado.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
