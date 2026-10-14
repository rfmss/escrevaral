/* Seleção de lentes pelos estados já preparados. ES5; sem texto, DOM ou motores. */
(function(root){
  'use strict';
  function select(lenses,states,onlySignals){
    var visible=[],found=0,absent=0,unknown=0,i,id,state;
    for(i=0;i<lenses.length;i++){
      id=lenses[i];state=states[id];
      if(state==='encontrado'){found++;}
      else if(state==='nao-encontrado-no-recorte'){absent++;}
      else{unknown++;}
      if(!onlySignals||state==='encontrado'){visible.push(id);}
    }
    return{visible:visible,found:found,absent:absent,unknown:unknown};
  }
  root.Escr=root.Escr||{};root.Escr.selectPreparedLenses=select;
  if(typeof module!=='undefined'&&module.exports){module.exports=select;}
}(typeof window!=='undefined'?window:this));
