/* Executa apenas os três arquivos inspecionados, em VM sem rede/DOM, para avaliação. Não importa código no produto. */
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=path.resolve(process.argv[2]||''),names=['index.html','worker-nlp.js','dicionario-compilado.js'];
if(!process.argv[2])throw Error('Informe a pasta extraída do pacote SET26.');
const files=Object.fromEntries(names.map(n=>[n,fs.readFileSync(path.join(root,n),'utf8')]));
const report={artifact:'Gemini SET26',scope:'Inspeção estática e execução do Worker em Node VM; não certifica navegador, offline ou dispositivos.',files:names.map(name=>({name,sha256:crypto.createHash('sha256').update(files[name]).digest('hex')})),observations:[]};
const c=vm.createContext({self:{},importScripts:name=>{if(name!=='dicionario-compilado.js')throw Error('Importação fora do recorte');vm.runInContext(files[name],c,{timeout:1000});}});
vm.runInContext('self.postMessage=function(r){self.result=r;};',c);
vm.runInContext(files['worker-nlp.js'],c,{timeout:1000});
for(const text of ['A menina canta.','Eu estou lendo o livro.','Eu canto.','qwertyer','']){
 c.inputText=text;vm.runInContext('self.onmessage({data:{text:inputText}})',c,{timeout:1000});const r=c.self.result;
 report.observations.push({input:text,tokens:r.tokens.map(t=>({surface:t.surface,pos:t.pos,head:t.head,deprel:t.deprel})),syntax:r.syntaxSummary,poeticCount:r.rhythmSummary.poeticCount});
}
report.lexicalCollisions={a:c.LexiconHash.a,esta:c.LexiconHash.esta,nos:c.LexiconHash.nos};
report.syllables={voo:c.syllabify('voo'),'água':c.syllabify('água')};
report.integrationDecision='Não importar o motor: inferência por sufixo, colisões lexicais, saídas fixas, ausência de spans/revisão e análise automática incompatíveis com o contrato atual. Aproveitar casos de regressão e estudar transporte Worker cancelável em etapa própria.';
console.log(JSON.stringify(report,null,2));
