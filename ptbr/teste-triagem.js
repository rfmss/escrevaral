/* Testes da triagem contra os módulos reais da main. */
'use strict';
var assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
var html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),scripts=[],re=/<script\b[^>]*>([\s\S]*?)<\/script>/g,m,ctx=vm.createContext({});
while((m=re.exec(html)))scripts.push(m[1]);
for(var i=0;i<scripts.length;i++){if(scripts[i].indexOf('root.Escr.mountUtilities')>=0)break;vm.runInContext(scripts[i],ctx);}
var E=ctx.Escr,tr=E.createSignalTriage(E);
var cases=[
 ['De vez em quando, volto.','expressoes',true],
 ['No final. Das contas, volto.','expressoes',false],
 ['No\tfinal\u00a0das contas, volto.','expressoes',true],
 ['Em u\u0301ltima ana\u0301lise, volto.','expressoes',true],
 ['“No final das contas”','expressoes',false],
 ['“No final das contas','expressoes',false],
 ['No final\ndas contas','expressoes',false],
 ['muito muito','repeticao',true],
 ['falou que falou','repeticao',true],
 ['falou que escreveu','repeticao',false],
 ['muito, muito','repeticao',false],
 ['pomodoro pomodoro pomodoro','repeticao',true],
 ['casa\n“citação”\ncasa casa','repeticao',true],
 ['casa casa\n\ncasa','repeticao',true],
 ['casa\n\ncasa','repeticao',false],
 ['casa “citada” casa','repeticao',false]
];
cases.forEach(function(c){var r=tr.scan(c[0]);assert.strictEqual(!!r.signals[c[1]],c[2],JSON.stringify(c));assert.strictEqual(r.findings,undefined);});
assert.strictEqual(tr.scan('“muito muito” casa').words,3,'contagem inclui palavras protegidas, sem analisá-las');
var many=new Array(100001).join('palavra '),r=tr.scan(many);
assert.ok(r.work.characters<=8000&&r.work.tokens<=1600);assert.ok(r.partial);assert.ok(r.words<=1600);
var tail=tr.scan(new Array(8001).join(' ')+ 'de vez em quando');assert.strictEqual(!!tail.signals.expressoes,false,'sinal fora do recorte não é anunciado');
var quote=tr.scan('“'+new Array(7901).join(' ')+'de vez em quando'+new Array(101).join(' ')+'”');assert.strictEqual(!!quote.signals.expressoes,false,'corte no meio de citação permanece protegido');
var repeatedNFD=tr.scan('café cafe\u0301');assert.strictEqual(repeatedNFD.signals.repeticao,true);
var accents=tr.scan('pode pôde');assert.strictEqual(!!accents.signals.repeticao,false);
console.log('TRIAGEM OK: '+cases.length+' casos; acentos e posições; limite de 8.000 caracteres/1.600 tokens; sem Findings; citações cortadas protegidas.');
