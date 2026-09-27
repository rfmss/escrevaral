'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),acorn=require('acorn'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),portable=read('escrevaral.html'),sources=require('./helpers/sources.cjs').scripts();
sources.forEach(s=>acorn.parse(s,{ecmaVersion:5}));
assert.equal([...html.matchAll(/<script\b[^>]*src=/g)].length,2);
assert.ok([...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].every(m=>!m[1].trim()),'Sem scripts inline');
assert.ok(!/<style\b/.test(html),'CSS fora da index');
for(const asset of require('../build/assets.json').assets){
 const body=read(asset.path);
 assert.equal(crypto.createHash('sha256').update(body).digest('hex'),asset.sha256);
 assert.ok(html.includes(asset.path));assert.ok(portable.includes(body));
 if(asset.path.endsWith('.js'))acorn.parse(body,{ecmaVersion:5});
}
assert.ok(!/\b(?:window|root)\.(?:alert|confirm|prompt)\s*\(/.test(portable));
const version=html.match(/name="asset-version" content="([^"]+)"/)[1];
assert.ok(read('service-worker.js').includes(version));assert.ok(portable.includes(version));
console.log('OK: fontes ES5; index sem código inline; hashes e versões site/portátil.');
