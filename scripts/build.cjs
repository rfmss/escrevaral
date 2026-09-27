'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const manifest=require('../build/modules.json'),release=require('../build/release.json');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const check=process.argv.includes('--check'),outputs=new Map();
function emit(p,s){outputs.set(p,s);}
function source(p){if(!/^(src|ptbr|packages|resources)\/[a-zA-Z0-9/_.-]+$/.test(p)||p.includes('..'))throw Error('Caminho inválido: '+p);return read(p);}
function join(paths){return paths.map(p=>'/* Fonte: '+p+' */\n'+source(p)).join('\n;\n');}
if(new Set(manifest.sourceOrder).size!==manifest.sourceOrder.length)throw Error('Módulo duplicado');
if(manifest.sourceOrder.some(p=>manifest.cofre.includes(p)===manifest.app.includes(p)))throw Error('Cada módulo deve pertencer ao cofre ou aplicativo');
const partition=manifest.cofre.concat(manifest.app);
if(partition.length!==manifest.sourceOrder.length||new Set(partition).size!==partition.length||partition.some(p=>!manifest.sourceOrder.includes(p)))throw Error('Partição de módulos incompleta ou duplicada');
if(new Set(manifest.styles).size!==manifest.styles.length)throw Error('Estilo duplicado');
const cofre=`/* Gerado por scripts/build.cjs. Editar fontes em build/modules.json. */
(function(host,factory){
  if(typeof module==='object'&&module.exports){module.exports=factory();}
  else{host.EscrCofre=factory();}
}(typeof self!=='undefined'?self:this,function(){
  'use strict';
  function createRuntime(){
    /* Namespace privado de cada instância; não é a janela do navegador. */
    var window={};
${join(manifest.cofre)}
    window.Escr.knowledge.version=${JSON.stringify(release.knowledgeVersion)};
    return window.Escr;
  }
  return {version:'1.0.0',locale:'pt-BR',createRuntime:createRuntime,
    create:function(options){var E=createRuntime();return E.createVault(E.knowledge,options);}
  };
}));
`;
const app="/* Gerado; fontes em src/, ptbr/ e build/modules.json. */\n(function(root){'use strict';root.Escr=root.EscrCofre.createRuntime();}(window));\n"+join(manifest.app);
const css=manifest.styles.map(p=>'/* Fonte: '+p+' */\n'+source(p)).join('\n');
const dir='assets/'+release.assetVersion;
const assets=[['cofre',cofre,'js'],['app',app,'js'],['styles',css,'css']].map(([id,content,ext])=>({id,path:dir+'/'+id+'.'+hash(content).slice(0,16)+'.'+ext,sha256:hash(content),bytes:Buffer.byteLength(content),content}));
const template=read('src/index.template.html');
function render(portable){
 let s=template.replace('{{ASSET_VERSION}}',release.assetVersion)
 .replace('{{SCRIPT_POLICY}}',portable?"'self' 'unsafe-inline'":"'self'")
 .replace('{{STYLES}}',()=>portable?'<style>\n'+css+'\n</style>':'<link rel="stylesheet" href="'+assets[2].path+'">')
 .replace('{{SCRIPTS}}',()=>portable?'<script>\n'+cofre+'\n</script>\n<script>\n'+app+'\n</script>':assets.slice(0,2).map(a=>'<script src="'+a.path+'"></script>').join('\n'));
 if(/{{[A-Z_]+}}/.test(s))throw Error('Marcador de build não resolvido');
 return '<!-- Gerado por npm run build; editar src/index.template.html. -->\n'+s;
}
const site=render(false),portable=render(true);
emit('index.html',site);emit('escrevaral.html',portable);
assets.forEach(a=>emit(a.path,a.content));
emit('build/assets.json',JSON.stringify({schemaVersion:1,version:release.assetVersion,assets:assets.map(({content,...a})=>a)},null,2)+'\n');
const generation=hash(assets.map(a=>a.sha256).join('')+site).slice(0,12);
const sw=read('src/app/service-worker.template.js')
 .replace('{{CACHE_NAME}}',release.cacheName+'-'+generation)
 .replace('{{ASSET_VERSION}}',release.assetVersion)
 .replace('{{INDEX_SHA256}}',hash(site))
 .replace('{{ASSETS}}',JSON.stringify(assets.map(a=>({url:'./'+a.path,sha256:a.sha256})),null,2));
emit('service-worker.js',sw);
if(check){
 const bad=[];for(const[p,s]of outputs){if(!fs.existsSync(path.join(root,p))||read(p)!==s)bad.push(p);}
 if(bad.length)throw Error('Distribuição desatualizada: '+bad.join(', '));
 console.log('Build reproduzível: '+outputs.size+' arquivos conferidos.');
}else{
 for(const[p,s]of outputs){fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),s);}
 // dist é exclusivamente gerado. A publicação na raiz preserva o GitHub Pages atual.
 const dist=path.join(root,'dist');fs.rmSync(dist,{recursive:true,force:true});
 for(const[p,s]of outputs){if(p.startsWith('build/'))continue;const target=path.join(dist,'site',p);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,s);}
 for(const p of ['manifest.webmanifest','icons','jornada','404.html','CNAME','robots.txt','sitemap.xml','.nojekyll'])fs.cpSync(path.join(root,p),path.join(dist,'site',p),{recursive:true});
 fs.mkdirSync(path.join(root,'packages/cofre/dist'),{recursive:true});fs.writeFileSync(path.join(root,'packages/cofre/dist/cofre.cjs'),cofre);
 console.log('Build: index '+Buffer.byteLength(site)+' bytes; portátil '+Buffer.byteLength(portable)+'; cofre independente '+Buffer.byteLength(cofre)+'.');
}
module.exports={manifest,release};
