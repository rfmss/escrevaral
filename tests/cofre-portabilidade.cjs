'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),asset=require('../build/assets.json').assets.find(a=>a.id==='cofre');
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'escrevaral-cofre-'));
try{
 const file=path.join(folder,'cofre.cjs');fs.copyFileSync(path.join(root,asset.path),file);
 const api=require(file),first=api.createRuntime(),second=api.createRuntime();
 assert.notEqual(first,second);assert.notEqual(first.knowledge,second.knowledge);
 assert.equal(first.createArchive,undefined);assert.equal(first.analysisContract,undefined);
 const context=vm.createContext({});
 // Carregamento original das fontes serve como oráculo da mudança de ordem do bundle.
 for(const s of require('./helpers/sources.cjs').scripts()){if(s.includes('root.Escr.mountUtilities'))break;vm.runInContext(s,context);}
 const original=context.Escr.createVault(context.Escr.knowledge,{incremental:false}),standalone=api.create({incremental:false});
 function normalize(result){const copy=JSON.parse(JSON.stringify(result));delete copy.knowledgeVersion;return copy;}
 let count=0;
 for(const [name,lens]of [['contexto','morfologia'],['sintaxe','sintaxe'],['locucoes','sintaxe'],['relativas','relativas']]){
  const cases=require('../ptbr/corpus/'+name+'-1.json').cases;
  for(const item of cases){const text=item.text;
   if(typeof text!=='string')throw Error('Caso sem texto');
   assert.deepEqual(normalize(standalone.analyze(lens,text)),normalize(original.analyze(lens,text)),item.id);count++;
  }
 }
 const browser=vm.createContext({});vm.runInContext(fs.readFileSync(file,'utf8'),browser);
 assert.equal(browser.Escr,undefined,'Não vaza o namespace da instância');
 assert.equal(browser.EscrCofre.locale,'pt-BR');
 const value='😀 A menina leu a carta.';
 for(const f of browser.EscrCofre.create().analyze('sintaxe',value).findings)assert.equal(value.slice(f.start,f.end),f.snippet);
 console.log('COFRE OK: arquivo transportado; instâncias isoladas; Node/VM sem DOM; '+count+' casos equivalentes.');
}finally{fs.rmSync(folder,{recursive:true,force:true});}
