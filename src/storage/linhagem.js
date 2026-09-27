/* Linhagem local: versões recentes autocontidas, sem promessa de data externa. */
(function(root){
 'use strict';
 var E=root.Escr,limit=400000,max=20;
 function arr(v){return Object.prototype.toString.call(v)==='[object Array]';}
 function valid(h){
  if(!h||h.version!==1||!arr(h.entries)||h.entries.length>max){return false;}var size=0,seen=Object.create(null);
  return h.entries.every(function(v){if(!v||typeof v.id!=='string'||!/^[a-z0-9-]+$/.test(v.id)||seen[v.id]||typeof v.title!=='string'||typeof v.text!=='string'||typeof v.at!=='string'||!isFinite(Date.parse(v.at))||typeof v.revision!=='number'||v.revision<0||v.revision%1){return false;}seen[v.id]=true;size+=v.text.length+v.title.length;return size<=limit;});
 }
 function read(doc){if(typeof doc.lineage==='undefined'){return {version:1,entries:[]};}if(!valid(doc.lineage)){throw new Error('O histórico desta folha não pôde ser lido. Preserve uma cópia antes de continuar.');}return JSON.parse(JSON.stringify(doc.lineage));}
 function capture(previous,next,force){
  var h=read(next);if(!previous){return h;}var last=h.entries[h.entries.length-1],changed=previous.text!==next.text||previous.title!==next.title;
  if(!force&&!changed){return h;}
  var elapsed=last?Date.parse(previous.updated)-Date.parse(last.at):Infinity,large=previous.text.length-next.text.length>Math.max(30,previous.text.length*.2);
  if(!force&&last&&elapsed<60000&&!large&&previous.title===next.title){return h;}
  if(h.entries.some(function(v){return v.id===previous.id;})){return h;}
  if(previous.text.length+previous.title.length>limit){return h;}
  h.entries.push({id:previous.id,title:previous.title,text:previous.text,at:previous.updated,revision:previous.revision});
  var size=0;h.entries.forEach(function(v){size+=v.text.length+v.title.length;});while(h.entries.length>max||size>limit){var old=h.entries.shift();size-=old.text.length+old.title.length;}
  return h;
 }
 function difference(before,after){
  var start=0,end=0;while(start<before.length&&start<after.length&&before.charAt(start)===after.charAt(start)){start+=1;}
  while(end<before.length-start&&end<after.length-start&&before.charAt(before.length-end-1)===after.charAt(after.length-end-1)){end+=1;}
  return {start:start,removed:before.slice(start,before.length-end),added:after.slice(start,after.length-end)};
 }
 E.lineage={valid:valid,read:read,capture:capture,difference:difference,limit:limit,max:max};
}(typeof window!=='undefined'?window:this));
