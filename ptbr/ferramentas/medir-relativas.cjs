/* Medição local reproduzível; não certifica tempo de interface ou aparelhos. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),os=require('node:os'),{performance}=require('node:perf_hooks');
const root=path.resolve(__dirname,'../..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),ctx=vm.createContext({});
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){if(m[1].includes('root.Escr.mountUtilities'))break;vm.runInContext(m[1],ctx);}
const E=ctx.Escr,original=E.syntaxRelations.analyze;let probes=0;
E.syntaxRelations.analyze=function(){probes++;return original.apply(this,arguments);};
const patterns={positivos:'As meninas que estão cantando trabalham. ',adversarial:'A menina que canta canta canta canta canta canta canta canta canta canta canta canta canta canta canta canta canta canta canta canta canta. '};
const results=[];
for(const [pattern,unit] of Object.entries(patterns))for(const size of [8000,200000,800000]){
 const input=unit.repeat(Math.ceil(size/unit.length)).slice(0,size);
 for(let i=0;i<3;i++)E.relativeClauses.analyze(input);
 const times=[];let r,calls;
 for(let i=0;i<30;i++){probes=0;const begin=performance.now();r=E.relativeClauses.analyze(input);times.push(performance.now()-begin);calls=probes;}
 const sorted=times.slice().sort((a,b)=>a-b);
 results.push({pattern,inputUTF16:input.length,samplesMs:times,p50Ms:sorted[Math.ceil(.5*times.length)-1],p95Ms:sorted[Math.ceil(.95*times.length)-1],maxMs:sorted.at(-1),syntacticProbes:calls,findings:r.length,work:r.coverageInfo.work});
}
const report={date:new Date().toISOString(),engine:E.relativeClauses.version,node:process.version,platform:os.platform(),architecture:os.arch(),cpu:os.cpus()[0]?.model||null,method:'3 aquecimentos; 30 amostras por caso; percentil por nearest rank. Motor direto em Node, sem DOM, sem throttling. Entrada grande não aumenta o recorte de 8 mil unidades UTF-16/1600 tokens.',limits:'Não mede latência da interface, memória ou aparelho físico. Não é avaliação linguística independente.',results};
const target=process.argv[2];if(target)fs.writeFileSync(path.resolve(target),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(results.map(({pattern,inputUTF16,p50Ms,p95Ms,maxMs,syntacticProbes})=>({pattern,inputUTF16,p50Ms,p95Ms,maxMs,syntacticProbes})),null,2));
