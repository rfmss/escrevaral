/* Quadro do caderno: dados ES5, tamanho limitado e gravação por revisão. */
(function(root){
 'use strict';
 var E=root.Escr,types=['fino','giz','grosso','borracha'];
 function arr(v){return Object.prototype.toString.call(v)==='[object Array]';}
 function copy(v){return JSON.parse(JSON.stringify(v));}
 function empty(){return {version:1,grid:false,strokes:[]};}
 function valid(v){
  if(!v||v.version!==1||typeof v.grid!=='boolean'||!arr(v.strokes)||v.strokes.length>500){return false;}
  var count=0;
  return v.strokes.every(function(s){
   if(!s||types.indexOf(s.tool)<0||!arr(s.points)||!s.points.length||s.points.length>2048){return false;}
   count+=s.points.length;if(count>12000){return false;}
   return s.points.every(function(p){return arr(p)&&p.length===2&&p.every(function(n){return typeof n==='number'&&isFinite(n)&&n>=0&&n<=10000&&Math.floor(n)===n;});});
  });
 }
 function clean(v){return {version:1,grid:v.grid,strokes:v.strokes.map(function(s){return {tool:s.tool,points:s.points.map(function(p){return [p[0],p[1]];})};})};}
 function read(data){if(typeof data.chalk==='undefined'){return empty();}if(!valid(data.chalk)){throw new Error('Este quadro não pôde ser lido. Os dados foram preservados.');}return clean(data.chalk);}
 function write(model,id,revision,next){
  if(!valid(next)){throw new Error('O desenho ultrapassou os limites do quadro ou contém dados inválidos.');}
  var b=model.get(id);if(!b||b.trashed){throw new Error('Este caderno não está disponível. Baixe seu desenho antes de fechar.');}
  if(JSON.stringify(read(b.data))!==revision){throw new Error('O quadro mudou em outra aba. Baixe seu desenho antes de fechar e reabrir.');}
  b.data.chalk=clean(next);model.update(id,{data:b.data});return JSON.stringify(b.data.chalk);
 }
 function pack(title,drawing){if(!valid(drawing)){throw new Error('Desenho inválido.');}return JSON.stringify({format:'escrevaral-giz',version:1,notebook:String(title).slice(0,120),drawing:clean(drawing)});}
 function parse(raw){if(typeof raw!=='string'||raw.length>524288){throw new Error('O arquivo é grande demais para este quadro.');}var p=JSON.parse(raw);if(!p||p.format!=='escrevaral-giz'||p.version!==1||!valid(p.drawing)){throw new Error('Este arquivo não é um desenho válido do Escrevaral.');}return clean(p.drawing);}
 E.chalk={empty:empty,valid:valid,read:read,write:write,pack:pack,parse:parse,copy:copy,types:types,maxStrokes:500,maxPoints:12000,maxStrokePoints:2048};
}(typeof window!=='undefined'?window:this));
