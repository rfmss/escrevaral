'use strict';
const path=require('node:path'),http=require('node:http');
const port=Number(process.env.PORT||8080);
http.createServer(require('./static-handler.cjs')(path.resolve(__dirname,'../dist/site'))).listen(port,'127.0.0.1',()=>console.log('Escrevaral: http://127.0.0.1:'+port));
