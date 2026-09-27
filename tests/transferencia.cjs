'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),acorn=require('acorn');
const source=fs.readFileSync('src/ui/transferencia.js','utf8');
function setup(options={}) {
 const fallback=[],timers=[],revoked=[],links=[];
 const body={appendChild(a){a.parentNode=this;links.push(a);},removeChild(a){a.parentNode=null;links.splice(links.indexOf(a),1);}};
 const root={Escr:{},navigator:{},document:{body,createElement(){const a={click(){if(options.clickFail)throw Error('click');}};if(!options.noDownload)a.download='';return a;}},
  Blob:function(parts){this.parts=parts;},URL:{createObjectURL(){return 'blob:copy';},revokeObjectURL(url){revoked.push(url);}},setTimeout(fn){timers.push(fn);}};
 if(options.noBlob)delete root.Blob;if(options.noURL)delete root.URL;
 if(options.msSave)root.navigator.msSaveBlob=()=>true;
 vm.runInNewContext(source,{window:root});
 return {root,api:root.Escr.transfer,fallback,timers,revoked,links,save(text){return root.Escr.transfer.download(text,'application/json','copia.scrvrl',(s,n)=>fallback.push([s,n]));}};
}
const literal=JSON.stringify({text:'ação 🎼 cafe\u0301\r\n</textarea> & <script>',choices:['a','b']});
for(const options of [{noBlob:true},{noURL:true},{noDownload:true},{clickFail:true}]) {
 const h=setup(options);assert.equal(h.save(literal),false);assert.deepEqual(h.fallback,[[literal,'copia.scrvrl']]);assert.equal(h.links.length,0);
 h.timers.forEach(fn=>fn());if(options.clickFail)assert.deepEqual(h.revoked,['blob:copy']);
}
let h=setup();assert.equal(h.save(literal),true);assert.equal(h.fallback.length,0);assert.equal(h.links.length,0);h.timers.forEach(fn=>fn());assert.deepEqual(h.revoked,['blob:copy']);
h=setup({msSave:true,noURL:true});assert.equal(h.save(literal),true);
let field={value:'a🎼b',selectionStart:0,selectionEnd:0};assert.equal(h.api.selectRange(field,1,3),true);assert.equal(field.value,'a🎼b');assert.equal(field.selectionEnd,3);
field.setSelectionRange=()=>{throw Error('unsupported');};assert.equal(h.api.selectRange(field,0,1),true);
assert.equal(h.api.selectRange({value:'abc'},0,2),false);assert.equal(h.api.selectRange(field,-1,3),false);
let responses=[];h.api.read({},(e,v)=>responses.push([!!e,v]));assert.deepEqual(responses,[[true,undefined]]);
let reader;h.root.FileReader=function(){reader=this;this.readAsText=(f,encoding)=>assert.equal(encoding,'UTF-8');};
responses=[];h.api.read({},(e,v)=>responses.push([!!e,v]));reader.result=literal;reader.onload();reader.onerror();assert.deepEqual(responses,[[false,literal]]);
h.root.FileReader=function(){throw Error('blocked');};responses=[];h.api.read({},e=>responses.push(!!e));assert.deepEqual(responses,[true]);
// Exercita as funções reais do controlador, sem inicializar o editor inteiro.
const controller=fs.readFileSync('src/editor/controlador.js','utf8');
const nodes=acorn.parse(controller,{ecmaVersion:5}).body[0].expression.callee.body.body;
const functions=['exportNotebook','exportedDocuments','importContents'].map(name=>{const n=nodes.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);return controller.slice(n.start,n.end);}).join('\n');
let packed,downloaded,confirmed=0,brought=0,writes=0;
const stored={id:'doc',revision:1,title:'Antigo',text:'salvo'},current=JSON.parse(JSON.stringify(stored));
const sandbox={JSON,Object,SyntaxError,doc:current,title:{value:'Novo'},manuscript:{value:'rascunho 🎼 cafe\u0301'},dirty:true,composing:false,chalkUI:null,
 archive:{list(){return {documents:[stored],unreadable:0};}},activeNotebook:()=>({id:'livro',name:'Livro'}),
 notebooks:{pack(entries){packed=entries;return {documents:entries};},validate(){},bring(){brought++;return {notebooks:1,documents:1};}},
 download(s){downloaded=s;},message(){},checkpoint(){writes++;return false;},rememberNotebook(){return true;},
 E:{dialog:{ask(options,fn){confirmed++;sandbox.answer=fn;}},freshDocument(){return {};},validDocument(){return true;}},sessionKey:'session',
 loadDocument(){},closeNotebook(){},renderNotebooks(){},renderReminders(){},renderCabinet(){},byId(){return {};},window:{location:{reload(){}}}};
vm.createContext(sandbox);vm.runInContext(functions,sandbox);
sandbox.exportNotebook(true);assert.equal(writes,0,'exportação não exige nova gravação');assert.equal(packed[0].text,sandbox.manuscript.value);assert.equal(JSON.parse(downloaded).documents[0].title,'Novo');assert.equal(stored.text,'salvo');assert.equal(current.text,'salvo');
sandbox.checkpoint=()=>true;sandbox.notebooks.validate=p=>{if(!p||!p.notebooks)throw Error('invalid');};
sandbox.importContents('{quebrado','copia.scrvrl','');assert.equal(confirmed,0);assert.equal(brought,0);
const payload=JSON.stringify({notebooks:[],documents:[],globals:{}});
sandbox.importContents(payload,'copia.scrvrl','');assert.equal(confirmed,1);assert.equal(brought,0);sandbox.answer(false);assert.equal(brought,0);
sandbox.importContents(payload,'copia.scrvrl','');sandbox.answer(true);assert.equal(brought,1);
assert.equal(sandbox.manuscript.value,'rascunho 🎼 cafe\u0301');
console.log('TRANSPORTE OK: fallback literal, URLs liberadas, seleção sem edição, FileReader ausente/falha, exportação sem gravação e importação confirmada.');
