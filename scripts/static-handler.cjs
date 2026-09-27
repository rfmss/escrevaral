'use strict';
const fs=require('node:fs'),path=require('node:path');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.txt':'text/plain'};
module.exports=function(root){
 root=fs.realpathSync(root);
 return function(req,res){
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
  try{
   const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   let file=path.resolve(root,'.'+name);
   if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   file=fs.realpathSync(file);
   if(!file.startsWith(root+path.sep)||!fs.statSync(file).isFile())throw Error('outside');
   res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
   res.setHeader('Cache-Control','no-cache');res.setHeader('X-Content-Type-Options','nosniff');
   if(req.method==='HEAD')return res.end();fs.createReadStream(file).pipe(res);
  }catch(e){res.writeHead(404);res.end('Não encontrado.');}
 };
};
