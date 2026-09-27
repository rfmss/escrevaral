/* Só lê JSONs externos. Executa exclusivamente o HTML da base indicada pelo operador. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const [folder,base,output]=process.argv.slice(2);if(!folder||!base||!output)throw Error('Uso: node reproduzir-devolucao-gemini.cjs <pasta-jsons> <base-congelada> <saida.json>');
const read=name=>JSON.parse(fs.readFileSync(path.join(folder,name),'utf8')),sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const corpus=read('corpus-reservado.json'),comparison=read('comparacao.json'),manifest=read('manifest.json'),htmlPath=path.join(base,'index.html'),html=fs.readFileSync(htmlPath,'utf8'),ctx=vm.createContext({});
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){if(m[1].includes('root.Escr.mountUtilities'))break;vm.runInContext(m[1],ctx,{timeout:1000});}
const E=ctx.Escr,vault=E.createVault(E.knowledge),declared=new Map(comparison.resultados.map(r=>[r.caso_id,r])),spanErrors=[],rows=[];
for(const c of corpus.casos){
 const t=c.texto,d=declared.get(c.id);if(typeof t!=='string'||!d)throw Error('Caso inválido '+c.id);
 for(const [i,s]of c.trechos.entries()){const actual=t.slice(s.inicio,s.fim);if(!Number.isInteger(s.inicio)||!Number.isInteger(s.fim)||s.inicio<0||s.fim>t.length||s.inicio>=s.fim||actual!==s.trecho)spanErrors.push({id:c.id,index:i,declared:s,actual});}
 const selection=c.selecao;let result,error=null;
 try{
  if(selection){if(!Number.isInteger(selection.inicio)||!Number.isInteger(selection.fim)||selection.inicio<0||selection.fim>t.length||selection.inicio>=selection.fim)throw Error('Seleção inválida');const doc=E.freshDocument();doc.text=t;result=E.analysisContract.analyze(vault,d.lente,E.analysisContract.request(doc,t,selection.inicio,selection.fim));}
  else result=vault.analyze(d.lente,t);
 }catch(e){error=e.message;}
 const findings=result?.findings||[];
 for(const f of findings)for(const s of [f,f.head,f.clause,...(f.context||[]),...(f.components||[])].filter(Boolean))if(t.slice(s.start,s.end)!==s.snippet)throw Error('Posição incorreta na execução: '+c.id);
 rows.push({id:c.id,text:t,selection,declaredClass:d.classe_resultado,declaredRaw:d.saida_bruta,declaredExecuted:d.executado,expectedDecision:c.decisao,error,actualFindings:findings.length,actualResult:result||null});
}
const count=values=>values.reduce((a,x)=>(a[x]=(a[x]||0)+1,a),{});
const report={date:new Date().toISOString(),node:process.version,method:'Reexecução do motor real, em Node VM, sobre o HTML congelado. Não é teste de navegador. Corpus recebido preservado.',hashes:{corpus:sha(path.join(folder,'corpus-reservado.json')),html:sha(htmlPath),declaredCorpus:manifest.corpus_sha256,declaredHtml:manifest.base.html_sha256},
 summary:{cases:rows.length,actualWithFindings:rows.filter(r=>r.actualFindings>0).length,actualWithoutFindings:rows.filter(r=>!r.actualFindings&&!r.error).length,errors:rows.filter(r=>r.error).length,declaredCounts:count(rows.map(r=>r.declaredClass)),declaredCorrectButEmpty:rows.filter(r=>r.declaredClass==='acerto_leitura'&&!r.actualFindings).map(r=>r.id),declaredAbstentionButNonempty:rows.filter(r=>r.declaredClass.startsWith('abstencao')&&r.actualFindings).map(r=>r.id),allReportedRawAreStrings:rows.every(r=>typeof r.declaredRaw==='string'),annotationSpanErrors:spanErrors.length,annotationCasesWithSpanErrors:new Set(spanErrors.map(e=>e.id)).size},annotationSpanErrors:spanErrors,results:rows};
fs.writeFileSync(path.resolve(output),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({hashes:report.hashes,summary:report.summary},null,2));
