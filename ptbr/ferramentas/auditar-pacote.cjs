/* Auditoria externa: não copia dados nem executa o motor dentro do aplicativo.
 * exit 1 significa pacote bloqueado para integração; relatório JSON vai para stdout.
 * Dependência de QA: acorn@8.15.0. */
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process'),acorn=require('acorn');
const dir=path.resolve(process.argv[2]||'PTBR'),read=n=>fs.readFileSync(path.join(dir,n),'utf8');
const hashes=JSON.parse(read('dados/_proveniencia.json')).resultados.map(r=>({name:r.name,expected:r.sha256,actual:crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,'dados',r.name))).digest('hex')}));
const es5=fs.readdirSync(path.join(dir,'motor')).filter(n=>n.endsWith('.js')).map(name=>{try{acorn.parse(read('motor/'+name),{ecmaVersion:5});return{name,ok:true};}catch(e){return{name,ok:false,error:e.message};}});
function suite(corrected,inject){
 const child=cp.spawnSync(process.execPath,['-e',`
 const fs=require('fs'),Module=require('module'),path=require('path');
 const file=process.argv[1];let src=fs.readFileSync(file,'utf8');
 if(process.argv[2]==='true')src=src.replace('var pass = 0, fail = 0;','var pass = 0, fail = 0, totalFail = 0;').replace('var f = fail; pass = 0; fail = 0; return f;','var f = fail; totalFail += fail; pass = 0; fail = 0; return f;');
 if(process.argv[2]==='true')src=src.replace(/fail === 0/g,'totalFail === 0').replace('"FALHAS: " + fail','"FALHAS: " + totalFail');
 if(process.argv[3]==='true')src=src.replace('summary("corpus-ouro");','ok(false,"FALHA INJETADA PARA TESTAR O EXECUTOR"); summary("corpus-ouro");');
 const m=new Module(file);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(src,file);
 `,path.join(dir,'testes/run.js'),String(corrected),String(inject)],{encoding:'utf8',timeout:20000});
 return{exitCode:child.status,stdout:child.stdout,stderr:child.stderr};
}
const original=suite(false,false),originalInjected=suite(false,true),corrected=suite(true,false),correctedInjected=suite(true,true);
const integration=cp.spawnSync(process.execPath,[path.join(dir,'testes/integracao.js')],{encoding:'utf8',timeout:20000});
// Motor inspecionado em subprocesso: efeitos sobre protótipos não atingem este auditor.
const probe=cp.spawnSync(process.execPath,['-e',`const p=require(process.argv[1]+'/motor/index.js');p.env.boot({dir:process.argv[1]+'/dados'});console.log(JSON.stringify({missing:p.expressoes.scan('de vez em quando'),punctuation:p.expressoes.scan('No final. Das contas')}));`,dir],{encoding:'utf8',timeout:20000});
const report={hashes:hashes.map(r=>({...r,ok:r.actual===r.expected})),es5,suites:{original,originalInjected,corrected,correctedInjected,integration:{exitCode:integration.status,stdout:integration.stdout,stderr:integration.stderr}},coverage:JSON.parse(probe.stdout),license:'Não validada: integridade não comprova permissão de redistribuição.',status:'Integração completa adiada; falhas de cobertura, compatibilidade e proveniência exigem etapa própria.'};
console.log(JSON.stringify(report,null,2));
if(hashes.some(r=>r.actual!==r.expected)||es5.some(r=>!r.ok)||corrected.exitCode!==0||correctedInjected.exitCode!==1||report.coverage.punctuation.length)process.exitCode=1;
