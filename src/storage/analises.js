/* Persistência linguística: IndexedDB opcional; documento e corpus portátil são fallback. */
(function(root){
 'use strict';
 var E=root.Escr;
 function version(){return ['5.0.0',E.knowledge.version,E.maturationData.version,E.studioData.version].join('/');}
 function clone(v){return JSON.parse(JSON.stringify(v));}
 function valid(record){return record&&record.version===1&&typeof record.text==='string'&&record.text.length<=200000&&typeof record.lens==='string'&&typeof record.corpus==='string'&&record.result&&record.result.schema==='scrvrl.analysis-result'&&record.result.source&&typeof record.result.source.start==='number'&&typeof record.result.source.end==='number'&&Object.prototype.toString.call(record.result.findings)==='[object Array]'&&record.result.findings.length<=100&&record.result.findings.every(function(f){return f&&typeof f.start==='number'&&typeof f.end==='number'&&f.start>=0&&f.end<=record.text.length&&f.end>f.start&&record.text.slice(f.start,f.end)===f.snippet&&f.evidence&&f.evidence.source;});}
 function match(record,lens,request){return valid(record)&&record.corpus===version()&&record.lens===lens&&record.text===request.text&&record.result.source.start===request.source.start&&record.result.source.end===request.source.end;}
 function remember(doc,request,result){
  var record={version:1,corpus:version(),lens:result.lens,text:request.text,at:new Date().toISOString(),result:clone(result)};
  if(!valid(record)){return null;}var records=doc.linguistics&&doc.linguistics.version===1?doc.linguistics.records.filter(valid):[];
  records=records.filter(function(r){return r.lens!==record.lens;});records.push(record);
  var size=0;records.forEach(function(r){size+=r.text.length;});while(records.length>3||size>200000){size-=records.shift().text.length;}
  doc.linguistics={version:1,records:records};return record;
 }
 function fromDoc(doc,lens,request){var records=doc.linguistics&&doc.linguistics.version===1?doc.linguistics.records:[];for(var i=records.length-1;i>=0;i-=1){if(match(records[i],lens,request)){return clone(records[i]);}}return null;}
 E.linguistics={version:version,valid:valid,match:match,remember:remember,fromDoc:fromDoc};
 E.createLinguisticStore=function(){
  var db=null,opening=false,disabled=false,queue=[],epoch=0;
  function open(done){
   if(db){done(db);return;}if(disabled){done(null);return;}queue.push(done);if(opening){return;}opening=true;
   var generation=++epoch,request,timer;
   function settle(value){if(generation!==epoch){if(value){value.close();}return;}epoch+=1;root.clearTimeout(timer);opening=false;db=value;disabled=!value;var waiting=queue;queue=[];waiting.forEach(function(f){f(value);});}
   try{
    if(!root.indexedDB){settle(null);return;}request=root.indexedDB.open('escrevaral-linguistica',1);
    timer=root.setTimeout(function(){settle(null);},1500);
    request.onupgradeneeded=function(){var d=request.result;if(!d.objectStoreNames.contains('cache')){d.createObjectStore('cache');}};
    request.onsuccess=function(){var d=request.result;d.onversionchange=function(){d.close();db=null;disabled=true;};settle(d);};request.onerror=request.onblocked=function(){settle(null);};
   }catch(ignore){settle(null);}
  }
  function get(key,done){
   open(function(d){if(!d){done(null);return;}var finished=false,timer;
    function finish(value){if(finished){return;}finished=true;root.clearTimeout(timer);done(value);}
    try{var tx=d.transaction('cache','readonly'),r=tx.objectStore('cache').get(key);timer=root.setTimeout(function(){finish(null);},1000);r.onsuccess=function(){finish(r.result||null);};r.onerror=tx.onabort=function(){finish(null);};}catch(ignore){finish(null);}
   });
  }
  function put(key,record){
   open(function(d){if(!d){return;}try{var tx=d.transaction('cache','readwrite'),s=tx.objectStore('cache'),r=s.get('recent');
    r.onsuccess=function(){var ids=Object.prototype.toString.call(r.result)==='[object Array]'?r.result:[];ids=ids.filter(function(x){return typeof x==='string'&&x!==key;}).slice(-20);ids.push(key);while(ids.length>20){s.delete(ids.shift());}s.put(record,key);s.put(ids,'recent');};
    tx.onerror=tx.onabort=function(){/* Derivados opcionais; a cópia do documento permanece. */};
   }catch(ignore){}});
  }
  function corpus(){open(function(d){if(!d){return;}try{var tx=d.transaction('cache','readwrite'),s=tx.objectStore('cache'),r=s.get('corpus');r.onsuccess=function(){if(!r.result||r.result.version!==version()){s.put({version:version(),knowledge:E.knowledge,maturation:E.maturationData,studio:E.studioData,style:E.styleData||null,poetry:E.poetryData||null,grammar:E.grammarData||null,verbs:E.verbData||null,decolonial:E.decolonialData||null},'corpus');}};}catch(ignore){}});}
  function removeDocument(prefix){open(function(d){if(!d){return;}try{var tx=d.transaction('cache','readwrite'),s=tx.objectStore('cache'),r=s.get('recent');r.onsuccess=function(){var ids=Object.prototype.toString.call(r.result)==='[object Array]'?r.result:[],keep=[];ids.forEach(function(k){if(typeof k!=='string'){return;}if(k.indexOf(prefix)===0){s.delete(k);}else{keep.push(k);}});s.put(keep,'recent');};}catch(ignore){}});}
  return {get:get,put:put,corpus:corpus,removeDocument:removeDocument};
 };
}(typeof window!=='undefined'?window:this));
