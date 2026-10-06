'use strict';
// Offline, fora do bundle. Mede alvos dos gabaritos existentes; não estima acurácia da língua.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const definitions=[
 ['contexto-1.json','legado'],
 ...[1,2,3,4,5].map(n=>['nominal-'+n,'nominal-'+n]),
 ['nominal-6','coordenação com artigos','PTBR-CTX-012','conjunção'],
 ['nominal-7','coordenação com adjetivos','PTBR-CTX-013','conjunção'],
 ['adverbios-1','negação','PTBR-CTX-014','advérbio'],
 ['numerais-1','cardinais','PTBR-CTX-015','numeral'],
 ['interjeicoes-1','interjeições','PTBR-CTX-016','interjeição'],
 ['locucoes-adverbiais-1','locuções adverbiais',null,'locução adverbial','adverbial'],
 ['locucoes-verbais-classes-1','locuções verbais',null,'locução verbal','verbal'],
 ['locucoes-prepositivas-1','locuções prepositivas',null,'locução prepositiva','prepositional'],
 ['locucoes-conjuntivas-1','locuções conjuntivas',null,'locução conjuntiva','conjunctive'],
 ['contrastes-1','como interrogativo','PTBR-CTX-021','advérbio'],
 ['se-pronominal-1','se pronominal','PTBR-CTX-022','pronome'],
 ['que-integrante-1','que integrante','PTBR-CTX-023','conjunção']
];
function empty(){return {useful:0,wrong:0,abstentions:0,missing:0,observations:0};}
function outcome(expected,actual,observationExpected,observationFound){
 if(actual)return expected===actual?'useful':'wrong';
 if(expected)return 'missing';
 if(observationExpected)return observationFound?'observations':'missing';
 return 'abstentions';
}
function collect(E){
 const report={schemaVersion:1,kind:'Consolidação de corpus próprio; sem cegamento, independência ou estimativa de acurácia geral.',runtimeVersion:E.contextualMorphology.version,lexiconVersion:E.portiLexicon.version,policy:'Um registro por alvo original. Repetições entre corpora preservadas; totais não contam frases únicas. Controles booleanos avaliam somente a regra/família indicada. Abstenções sem classe desejada não são atribuídas artificialmente a uma classe. Observações esperadas não contam como decisões.',inputs:[],families:{},classes:{},totals:empty(),cases:[]};
 for(const [name,family,rule,cls,kind] of definitions){
  const files=name.endsWith('.json')?[name]:['desenvolvimento','avaliacao'].map(s=>name+'/'+s+'.json');
  for(const file of files){
   const raw=fs.readFileSync(path.join(root,'ptbr/corpus',file),'utf8'),data=JSON.parse(raw);
   report.inputs.push({path:'ptbr/corpus/'+file,sha256:crypto.createHash('sha256').update(raw).digest('hex'),cases:data.cases.length});
   for(const c of data.cases){
    const r=E.contextualMorphology.inspect(c.text),item=c.target?r.items.filter(x=>x.snippet===c.target)[c.occurrence||0]:null;
    let expected,actual,found;
    if(kind){expected=c.expected?cls:null;found=r.locutions.find(g=>g.kind===kind);actual=found?cls:null;}
    else if(rule){expected=(Object.hasOwn(c,'coordination')?c.coordination:c.expected)?cls:null;found=c.target?(item&&item.rule===rule?item:null):r.items.find(x=>x.rule===rule&&x.selected===cls);actual=found?found.selected:null;}
    else{expected=c.expected&&typeof c.expected==='object'?c.expected.selected:c.expected;found=item;actual=item&&item.selected||null;}
    const observationFound=!!(item&&item.rule==='PTBR-CTX-010'),result=outcome(expected,actual,!!c.expectedOpenUse,observationFound),bucket=cls||expected||(c.expectedOpenUse?'observação possessiva':'controle sem classe-alvo');
    if(!report.families[family])report.families[family]=empty();if(!report.classes[bucket])report.classes[bucket]=empty();
    report.families[family][result]++;report.classes[bucket][result]++;report.totals[result]++;
    report.cases.push({file,id:c.id,text:c.text,target:c.target||null,expected:expected||null,actual,observationExpected:!!c.expectedOpenUse,observationFound,outcome:result,rule:found&&found.rule||null,checkedRule:rule||null,family,classBucket:bucket});
   }
  }
 }
 const probeRaw=fs.readFileSync(path.join(root,'ptbr/corpus/cobertura-m02/sondas.json'),'utf8'),probes=JSON.parse(probeRaw);report.probes={path:'ptbr/corpus/cobertura-m02/sondas.json',sha256:crypto.createHash('sha256').update(probeRaw).digest('hex'),policy:'Metas diagnósticas separadas dos gabaritos; aberto não significa abstenção aprovada.',classes:{},cases:[]};
 for(const c of probes.cases){const item=E.contextualMorphology.inspect(c.text).items.find(x=>x.snippet===c.target),selected=item&&item.selected||null,result=selected===c.class?'useful':selected?'wrong':'open';if(!report.probes.classes[c.class])report.probes.classes[c.class]={useful:0,wrong:0,open:0};report.probes.classes[c.class][result]++;report.probes.cases.push({...c,selected,outcome:result});}
 return report;
}
function markdown(r){const lines=['# M02 — relatório consolidado','',r.kind,'',r.policy,'','Motor: `'+r.runtimeVersion+'`; léxico: `'+r.lexiconVersion+'`.','','## Famílias dos gabaritos','','| Família | Úteis | Erradas | Abstenções | Lacunas | Observações |','|---|---:|---:|---:|---:|---:|'];for(const [key,v] of Object.entries(r.families))lines.push('| '+key+' | '+Object.values(v).join(' | ')+' |');lines.push('','## Classes dos alvos','','Abstenções sem classe-alvo ficam em linha própria. Grupos não são contados como palavras. Determinante UD permanece separado das dez classes.','','| Classe/alvo | Úteis | Erradas | Abstenções | Lacunas | Observações |','|---|---:|---:|---:|---:|---:|');for(const [key,v] of Object.entries(r.classes))lines.push('| '+key+' | '+Object.values(v).join(' | ')+' |');lines.push('','## Sondas diagnósticas por classe','','| Classe | Desejadas | Diferentes | Abertas |','|---|---:|---:|---:|');for(const [key,v] of Object.entries(r.probes.classes))lines.push('| '+key+' | '+Object.values(v).join(' | ')+' |');lines.push('','## Metas não atendidas ou decisões diferentes','');for(const c of r.cases.filter(c=>c.outcome==='missing'||c.outcome==='wrong'))lines.push('- '+c.file+' / '+c.id+': “'+c.text+'”; alvo '+c.target+'; esperado '+c.expected+'; obtido '+c.actual+' ('+c.outcome+').');lines.push('','## Reprodução e limites','','`node ferramentas/consolidar-m02.cjs --write` gera JSON e este documento. `--check` compara com o runtime atual. O JSON conserva os alvos e hashes dos gabaritos; nenhum gabarito foi reescrito. Testes técnicos e casos inline das suítes continuam próprios; não foram convertidos em corpus linguístico independente. As sondas e os gabaritos não se somam em uma taxa.','','Escopo e critérios pendentes: [COBERTURA-M02](COBERTURA-M02.md) e [escopo de locuções](ESCOPO-LOCUCOES-M02.md).','');return lines.join('\n');}
if(require.main===module){const E=require(path.join(root,require('../build/assets.json').assets.find(a=>a.id==='cofre').path)).createRuntime(),r=collect(E),outputs={'docs/jornada/CONSOLIDACAO-M02.json':JSON.stringify(r,null,2)+'\n','docs/jornada/CONSOLIDACAO-M02.md':markdown(r)};for(const [file,text]of Object.entries(outputs)){if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,file),text);if(process.argv.includes('--check')&&fs.readFileSync(path.join(root,file),'utf8')!==text)throw Error('Relatório desatualizado: '+file);}console.log(JSON.stringify({inputs:r.inputs.length,targets:r.cases.length,totals:r.totals,missing:r.cases.filter(c=>c.outcome==='missing'||c.outcome==='wrong')},null,2));}
module.exports={collect,outcome,markdown};
