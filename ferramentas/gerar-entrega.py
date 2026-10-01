"""Uma ficha manual gera entrega, estado vigente e resumos. Sem rede/dependências."""
import json, re, subprocess, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
if len(sys.argv)!=2: raise SystemExit('Uso: python3 ferramentas/gerar-entrega.py docs/jornada/entregas/v6-37.json')
record=ROOT/sys.argv[1]; d=json.loads(record.read_text())
required=('version','date','title','summary','task','phase','progress','next','verification','limits','sections','base')
assert all(d.get(k) for k in required), 'Ficha incompleta'
name='ENTREGA-V'+d['version'].replace('.','-')+'.md'
evidence='docs/jornada/'+name
publication='CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy.'
workflow='https://github.com/rfmss/escrevaral/actions?query=branch%3Amain'
state_path=ROOT/'docs/jornada/estado.json';state=json.loads(state_path.read_text())
record_id=str(record.relative_to(ROOT))
if state.get('deliveryRecord')!=record_id: state['version']+=1
state['deliveryRecord']=record_id
state['updated']=d['date'];state['current']=d['summary']+' '+publication
state['next'][0]=d['next'];state['focusDecision']['nextDeliverable']=d['next']
state['focusDecision']['decision']='Coordenação solo aprovada em 30/09/2026. Entregas por capacidades úteis, amostra pré-fixada, fonte única de relato e verificações sem repetição. A02 não bloqueia motores pequenos.'
state['publicationDecision'].update(status=publication,commit=None,deployment=workflow,verification=d['verification'])
state['publicationDecision']['evidencePolicy']='O baseline é a última referência confirmada antes desta ficha. O estado remoto por commit está em Actions; este documento não infere sucesso a partir de implementação.'
phase=next(p for p in state['phases'] if p['id']==d['phase']);phase['status']='Incrementos integrados/testados; publicação por commit em Actions e avaliação ampla pendente';phase['done']=d['progress']
if evidence not in phase['evidence']:phase['evidence'].append(evidence)
state_path.write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n')
plan_path=ROOT/'docs/jornada/plano-voo.json';plan=json.loads(plan_path.read_text())
plan['updated']='-'.join(reversed(d['date'].split('/')))
item=next(i for t in plan['tracks'] for i in t['items'] if i['id']==d['task']);item['progress']=d['progress']
if evidence not in item['evidence']:item['evidence'].append(evidence)
plan['next']=d['task'];done=sum(i['state']=='DONE' for t in plan['tracks'] for i in t['items']);total=sum(len(t['items']) for t in plan['tracks'])
plan['lastDelivery']={'version':d['version']+'.0','completed':[],'baselineDone':done,'publication':publication,'evidence':evidence,'record':str(record.relative_to(ROOT))}
plan_path.write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n')
md=['<!-- Gerado por ferramentas/gerar-entrega.py; editar '+str(record.relative_to(ROOT))+' -->','# '+d['title'],'',d['summary'],'','Base: `'+d['base']+'`. Coordenação solo; data '+d['date']+'.','']
for section in d['sections']:md+=['## '+section['title'],'',section['text'],'']
md+=['## Verificações e publicação','',d['verification'],'',publication+' [Execuções da main]('+workflow+'). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.','', '## Próxima ação','',d['next'],'',f"Plano v{plan['planVersion']}: {done}/{total} DONE | entrega +0 marcos | próximo {d['task']} | publicação: Actions por commit | limite: {d['limits']}",'']
(ROOT/evidence).write_text('\n'.join(md))
p=ROOT/'docs/PLANO-MESTRE.md';s=p.read_text();portrait='**Retrato vigente — '+d['date']+':** '+d['summary']+' [Entrega e limites](jornada/'+name+'). '+publication
s=re.sub(r'^\*\*Retrato conferido[^\n]*|^\*\*Retrato vigente[^\n]*',lambda m:portrait,s,count=1,flags=re.M)
p.write_text(s)
for script in ['gerar-plano-voo.py','gerar-jornada.py']:subprocess.run([sys.executable,str(ROOT/'ferramentas'/script)],check=True)
print('Ficha única aplicada:',evidence)
