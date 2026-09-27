'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('src/app/offline.js');
function harness(options={}) {
 let calls=0,resolve,reject;
 const status={state:null,textContent:'',setAttribute(k,v){this.state=v;}};
 const win={document:{getElementById(){return status;},querySelector(){return {getAttribute(){return options.mode||'site';}};}},
  location:{protocol:options.protocol||'https:'},Promise,caches:{},crypto:{subtle:{digest(){}}},
  navigator:{serviceWorker:{register(){calls++;if(options.throws)throw Error('blocked');return {then(a,b){resolve=a;reject=b;}};}}}};
 if(options.missing)delete win[options.missing];
 if(options.noWorker)win.navigator={};
 if(options.insecure)win.isSecureContext=false;
 vm.runInNewContext(source,{window:win});
 return {status,get calls(){return calls;},success(r){resolve(r);},fail(){reject(Error('offline'));}};
}
function worker(state){let listener;return {state,addEventListener(name,fn){assert.equal(name,'statechange');listener=fn;},change(next){this.state=next;listener();}};}
for(const options of [{protocol:'file:'},{mode:'portable'}]) {
 const h=harness(options);assert.equal(h.calls,0);assert.equal(h.status.state,'portable');
}
for(const options of [{noWorker:true},{missing:'Promise'},{missing:'caches'},{missing:'crypto'},{insecure:true},{protocol:'data:'}]) {
 const h=harness(options);assert.equal(h.calls,0);assert.equal(h.status.state,'portable-needed');
}
assert.equal(harness({throws:true}).status.state,'portable-needed');
let h=harness();h.fail();assert.equal(h.status.state,'portable-needed');
h=harness();h.success({});assert.equal(h.status.state,'portable-needed');
h=harness();let w=worker('installing');h.success({installing:w});assert.equal(h.status.state,'preparing');
w.change('installed');assert.equal(h.status.state,'preparing');w.change('activated');assert.equal(h.status.state,'cached');
h=harness();w=worker('installing');h.success({installing:w});w.change('redundant');assert.equal(h.status.state,'portable-needed');
h=harness();w=worker('activating');h.success({active:w});assert.equal(h.status.state,'preparing');w.change('activated');assert.equal(h.status.state,'cached');
h=harness();h.success({active:worker('activated')});assert.equal(h.status.state,'cached');
// O portátil depende somente dos conteúdos incorporados; nenhum script/CSS externo essencial.
const portable=read('escrevaral.html'),site=read('index.html');
assert.ok(portable.includes('name="distribution-mode" content="portable"'));
assert.ok(site.includes('name="distribution-mode" content="site"'));
assert.ok(!/<script[^>]+src=/.test(portable));assert.ok(!/<link[^>]+rel="stylesheet"/.test(portable));
for(const match of portable.matchAll(/url\(([^)]+)\)/g)) {
 const url=match[1].trim().replace(/^["']|["']$/g,'');
 assert.ok(url.startsWith('data:')||url.startsWith('#'),'Recurso CSS externo no portátil: '+url.slice(0,80));
}
console.log('OFFLINE ACESSO OK: arquivo sem registro/cache/APIs modernas, fallback de falha, ativação real e recursos essenciais incorporados.');
