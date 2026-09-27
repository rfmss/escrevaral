/* Reuso lexical: fronteiras de linha, proteção global e comparação exata. */
(function(root){
 'use strict';
 var E=root.Escr;
 E.createIncrementalLexical=function(id,full,knowledge){
  if(['ortografia','acentuacao'].indexOf(id)<0||knowledge.rules.some(function(r){return r.lens===id&&!r.forms;})){return null;}
  var cache=Object.create(null),order=[],chars=0,stats={processed:0,reused:0},rank=Object.create(null);
  knowledge.rules.forEach(function(r,i){rank[r.id]=i;});
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function analyze(text,cap){
   var fresh=Object.create(null);order=[];chars=0;var clean=E.protectedText(text),parts=clean.split('\n'),offset=0,out=[];stats={processed:0,reused:0};
   parts.forEach(function(part){
    var key='$'+part,item=cache[key]||fresh[key],rows;
    if(item){rows=item.rows;stats.reused+=1;}else{
     rows=full(part,cap);stats.processed+=1;
    }
     if(part.length<=200000&&!fresh[key]){
      var cost=part.length+JSON.stringify(rows).length;
      while(order.length&&(order.length>=512||chars+cost>500000)){var old=order.shift();chars-=fresh[old].cost;delete fresh[old];}
      if(cost<=500000){fresh[key]={rows:clone(rows),cost:cost};order.push(key);chars+=cost;}
     }
    rows.forEach(function(f){var copy=clone(f);copy.start+=offset;copy.end+=offset;out.push(copy);});offset+=part.length+1;out.sort(function(a,b){return rank[a.id]-rank[b.id]||a.start-b.start;});if(out.length>cap){out.length=cap;}
   });
   /* O motor integral limita na ordem do corpus antes de ordenar na folha. */
   out.sort(function(a,b){return rank[a.id]-rank[b.id]||a.start-b.start;});
   cache=fresh;return out.slice(0,cap);
  }
  return {analyze:analyze,stats:function(){return {mode:'incremental-lexical',processed:stats.processed,reused:stats.reused};}};
 };
}(typeof window!=='undefined'?window:this));
