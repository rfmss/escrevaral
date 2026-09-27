'use strict';
// Adaptador de avaliação local. Não executa modelos nem produz diagnósticos escolares.
function importConllu(text,conllu){
 if(typeof text!=='string'||typeof conllu!=='string')throw TypeError('Texto e CoNLL-U devem ser strings.');
 if(text.length>200000||conllu.length>4000000)throw RangeError('Recorte de avaliação excedido.');
 const sentences=[];let rows=[],cursor=0;
 function unsupported(reason){return {schema:'scrvrl.ud-evaluation',version:1,locale:'pt-BR',status:'sem-cobertura',reason,sentences:[]};}
 function finish(){
  if(!rows.length)return;
  const ids=new Set(rows.map(r=>r.id));
  if(rows.filter(r=>r.head===0).length!==1)throw Error('Raiz inválida.');
  for(let i=0;i<rows.length;i++){
   const r=rows[i];if(r.id!==i+1||r.head===r.id||(r.head!==0&&!ids.has(r.head)))throw Error('Vínculo UD inválido.');
   const visited=new Set();let current=r;
   while(current.head!==0){if(visited.has(current.id))throw Error('Ciclo UD.');visited.add(current.id);current=rows[current.head-1];if(!current)throw Error('Cabeça ausente.');}
  }
  sentences.push(rows);rows=[];
 }
 try{
  for(const line of conllu.split(/\r?\n/)){
   if(!line.trim()){finish();continue;}if(line.startsWith('#'))continue;
   const c=line.split('\t');if(c.length!==10)throw Error('São necessárias dez colunas.');
   if(/^\d+[-.]\d+$/.test(c[0]))return unsupported('Contração/multiword token ou nó vazio: alinhamento ainda não implementado.');
   if(!/^[1-9]\d*$/.test(c[0])||!/^\d+$/.test(c[6])||!c[1]||c[1]==='_')throw Error('Token UD inválido.');
   // Alinhamento sequencial literal, sem normalização, busca aproximada ou salto de palavras.
   while(cursor<text.length&&/\s/.test(text.charAt(cursor)))cursor++;
   if(text.slice(cursor,cursor+c[1].length)!==c[1])return unsupported('Tokens não correspondem literalmente ao texto original.');
   rows.push({id:Number(c[0]),form:c[1],lemma:c[2],upos:c[3],xpos:c[4],features:c[5],head:Number(c[6]),deprel:c[7],deps:c[8],misc:c[9],start:cursor,end:cursor+c[1].length});cursor+=c[1].length;
  }
  finish();if(text.slice(cursor).trim())return unsupported('O arquivo não cobre o texto inteiro.');
  return {schema:'scrvrl.ud-evaluation',version:1,locale:'pt-BR',status:'alinhado',sentences};
 }catch(error){return unsupported(error.message);}
}
module.exports={importConllu};
