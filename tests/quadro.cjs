const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8'),scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]),context=vm.createContext({});
for(const marker of ["var prefix = 'escrevaral.astra.v1.doc.'",'E.validPlanner =','/* Universo do caderno:','/* Quadro do caderno:','/* Cadernos: dados ES5'])vm.runInContext(scripts.find(s=>s.includes(marker)),context);
const E=context.Escr,C=E.chalk;
class Storage{constructor(){this.data=new Map();this.fail=false;}getItem(k){return this.data.get(k)||null;}setItem(k,v){if(this.fail)throw new Error('quota');this.data.set(k,v);}removeItem(k){this.data.delete(k);}}
const store=new Storage(),model=E.createNotebooks(store),a=model.add('Marés'),b=model.add('Outro livro'),empty=JSON.stringify(C.empty());
let drawing=C.empty();drawing.grid=true;drawing.strokes=[{tool:'giz',points:[[0,0],[5000,5000],[10000,10000]]},{tool:'borracha',points:[[5000,5000]]}];
let revision=C.write(model,a.id,empty,drawing);
assert.equal(JSON.stringify(C.read(model.get(b.id).data)),empty,'isolamento');
model.update(a.id,{data:{...model.get(a.id).data,planner:{},attachments:[{name:'outra ficha'}]}});
drawing.strokes.push({tool:'fino',points:[[10,20]]});revision=C.write(model,a.id,revision,drawing);assert.equal(model.get(a.id).data.attachments.length,1);
const packet=model.pack([],a.id),target=E.createNotebooks(new Storage());target.bring(packet);target.bring(packet);
assert.equal(JSON.stringify(target.list()[1].data.chalk),JSON.stringify(drawing),'cópia importada conserva desenho');
model.update(a.id,{trashed:true});assert.equal(model.pack([],a.id).notebooks[0].data.chalk.strokes.length,3);assert.throws(()=>C.write(model,a.id,revision,drawing));model.update(a.id,{trashed:false});
assert.equal(model.pack([]).notebooks[0].data.chalk.strokes.length,3);
const raw=store.getItem('escrevaral.astra.notebooks.v1');store.fail=true;assert.throws(()=>C.write(model,a.id,revision,drawing));assert.equal(store.getItem('escrevaral.astra.notebooks.v1'),raw);store.fail=false;
assert.throws(()=>C.write(model,a.id,empty,drawing),'revisão conflitante');
for(const invalid of [{version:2,grid:false,strokes:[]},{version:1,grid:false,strokes:[{tool:'giz',points:[[NaN,0]]}]},{version:1,grid:false,strokes:[{tool:'giz',points:[[10001,0]]}]},{version:1,grid:false,strokes:[{tool:'giz',points:Array(2049).fill([0,0])}]},{version:1,grid:false,strokes:Array(501).fill({tool:'giz',points:[[0,0]]})}]){
 assert.equal(C.valid(invalid),false);const bad=JSON.parse(JSON.stringify(packet));bad.notebooks[0].data.chalk=invalid;assert.throws(()=>target.bring(bad));
}
const max={version:1,grid:false,strokes:Array(6).fill(null).map(()=>({tool:'grosso',points:Array(2000).fill([10000,10000])}))};
assert.ok(C.valid(max));assert.equal(JSON.stringify(C.parse(C.pack('Limite',max))),JSON.stringify(max));max.strokes[0].points.push([0,0]);assert.equal(C.valid(max),false);
assert.equal(JSON.stringify(C.parse(C.pack('Marés',drawing))),JSON.stringify(drawing));
console.log('OK: quadro isolado; ida/volta e cópia; lixeira; quota; conflito; limites e validação antes de gravar.');
