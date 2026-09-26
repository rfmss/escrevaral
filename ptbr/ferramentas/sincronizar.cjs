/* Patch textual pontual: preserva alterações concorrentes fora dos blocos linguísticos. */
const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'../..');
const read=n=>fs.readFileSync(path.join(root,'ptbr',n),'utf8');let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function replaceOne(re,value,label){let count=0;html=html.replace(re,()=>{count++;return value;});if(count!==1)throw Error(label+': esperava um bloco, encontrou '+count);}
const helpers='<!-- PTBR-REGRAS:inicio -->\n<script>\n'+read('regras-locais.js')+'\n</script>\n<script>\n'+read('repeticao.js')+'\n</script>\n<script>\n'+read('triagem.js')+'\n</script>\n<!-- PTBR-REGRAS:fim -->';
if(html.includes('<!-- PTBR-REGRAS:inicio -->'))replaceOne(/<!-- PTBR-REGRAS:inicio -->[\s\S]*?<!-- PTBR-REGRAS:fim -->/,helpers,'regras');
else{const marker="  var E = root.Escr, S = E.instruments, R = E.reading, D = E.maturationData, stop = {};";const at=html.lastIndexOf('<script>',html.indexOf(marker));if(at<0)throw Error('Bloco de repetição não localizado');html=html.slice(0,at)+helpers+'\n'+html.slice(at);}
if(!html.includes('/* Lente existente: correspondência literal')){
 const needle="register({ id: 'expressoes', analyze:";const middle=html.indexOf(needle);const start=html.lastIndexOf('<script>',middle),end=html.indexOf('</script>',middle);if(middle<0)throw Error('Lente de expressões ausente');html=html.slice(0,start)+'<script>\n'+read('expressoes.js')+'\n'+html.slice(end);
}else replaceOne(/\/\* Lente existente: correspondência literal[\s\S]*?\n<\/script>/,read('expressoes.js')+'\n</script>','expressões');
replaceOne(/  function repetition\(text, cap\) \{[\s\S]*?\n  function rhythm/,"  function repetition(text, cap) { return E.analyzeLocalRepetition(text, cap); }\n  function rhythm",'repetição');
replaceOne(/\/\* Painel de análise da main\.[\s\S]*?\n<\/script>/,read('painel.js')+'\n</script>','painel');
// An unfinished quotation is protected too; no false signal at the triage cutoff.
html=html.replace('`[^`\\n]*`','`[^`\\n]*(?:`|$)').replace('"[^"\\n]*"','"[^"\\n]*(?:"|$)').replace('“[^”]*”','“[^”]*(?:”|$)').replace('‘[^’]*’','‘[^’]*(?:’|$)').replace('«[^»]*»','«[^»]*(?:»|$)');
const bridge='  E.ptbrPanelDocument=function(){return doc.noteId||doc.id;};\n  E.ptbrPanelKeep=function(f,source,key){\n    if(source!==manuscript.value||key!==(doc.noteId||doc.id)){return false;}\n    var choice=findingKey(f),added=doc.dismissed.indexOf(choice)<0,wasDirty=dirty;if(added){doc.dismissed.push(choice);dirty=true;}\n    var saved=persist();if(!saved&&added){doc.dismissed.splice(doc.dismissed.indexOf(choice),1);dirty=wasDirty;}byId("reset-dismissed").hidden=!doc.dismissed.length;return saved;\n  };\n';
if(html.includes('E.ptbrPanelDocument=function'))replaceOne(/  E\.ptbrPanelDocument=function[\s\S]*?(?=  E\.ptbrPanelChoices=function)/,bridge,'ponte');
else html=html.replace('  E.ptbrPanelChoices=function()',bridge+'  E.ptbrPanelChoices=function()');
if(!html.includes('if(E.ptbrPanelReset){E.ptbrPanelReset();}'))html=html.replace(/function loadDocument\(([^)]*)\) \{/,(match,args)=> 'function loadDocument('+args+') {\n    if(E.ptbrPanelReset){E.ptbrPanelReset();}');
// Invalidate old cached results after a changed linguistic rule, without changing storage.
html=html.replace(/(root\.Escr\.knowledge = \{\s*version: ')[^']+/,"$1local-20260925-linguistica-1");
html=html.replace(/name="asset-version" content="[^"]+"/,'name="asset-version" content="20260925-scrvrl-linguistica-v6-18"');
fs.writeFileSync(path.join(root,'index.html'),html);fs.writeFileSync(path.join(root,'escrevaral.html'),html);
let sw=fs.readFileSync(path.join(root,'service-worker.js'),'utf8').replace(/const CACHE_NAME = "[^"]+"/,'const CACHE_NAME = "scrvrl-offline-v6-18"').replace(/const ASSET_VERSION = "[^"]+"/,'const ASSET_VERSION = "20260925-scrvrl-linguistica-v6-18"');fs.writeFileSync(path.join(root,'service-worker.js'),sw);
console.log('Patch linguístico sincronizado; '+Buffer.byteLength(html)+' bytes por HTML.');
