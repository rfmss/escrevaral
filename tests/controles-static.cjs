
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),acorn=require('acorn');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
scripts.forEach((m,i)=>{try{acorn.parse(m[1],{ecmaVersion:5});}catch(e){throw new Error('Script '+i+': '+e.message);}});
assert.equal(html,fs.readFileSync(path.join(root,'escrevaral.html'),'utf8'),'O arquivo portátil deve acompanhar o site.');
assert.ok(!/\b(?:window|root)\.(?:alert|confirm|prompt)\s*\(/.test(html),'Sem diálogos nativos nos fluxos do app.');
const version=html.match(/name="asset-version" content="([^"]+)"/)[1];
assert.ok(fs.readFileSync(path.join(root,'service-worker.js'),'utf8').includes(version),'Cache com a mesma versão.');
console.log('OK: '+scripts.length+' scripts ES5, versão offline e HTML portátil sincronizados.');
