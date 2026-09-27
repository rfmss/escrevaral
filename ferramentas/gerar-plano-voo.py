"""Atualiza somente a árvore demarcada do Plano Mestre; fonte: plano-voo.json."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
d=json.loads((root/'docs/jornada/plano-voo.json').read_text())
items=[i for t in d['tracks'] for i in t['items']]
assert len({i['id'] for i in items})==len(items)
assert all(i['state'] in ('TODO','DONE') and i['acceptance'] for i in items)
assert all(i['evidence'] for i in items if i['state']=='DONE')
assert d['next'] in {i['id'] for i in items if i['state']=='TODO'}
done=sum(i['state']=='DONE' for i in items)
a='<!-- PLANO-VOO:INICIO -->';b='<!-- PLANO-VOO:FIM -->'
lines=[a,'## Árvore de execução — plano v'+str(d['planVersion']),'',f"**{done}/{len(items)} marcos DONE · nesta entrega +{len(d['lastDelivery']['completed'])} ({', '.join(d['lastDelivery']['completed'])}) · próximo {d['next']}**",'',d['scope'],'','`DONE` = critério delimitado atendido. `TODO` pode conter implementação parcial; sua caixa só fecha quando o critério inteiro for atendido. Publicação e homologação real são estados separados.','']
for t in d['tracks']:
 n=sum(i['state']=='DONE' for i in t['items']);lines += ['### '+t['title']+f' — {n}/{len(t["items"])}','']
 for i in t['items']:
  lines += ['- ['+('x' if i['state']=='DONE' else ' ')+'] **'+i['id']+' — '+i['title']+'** — '+i['state']+'. '+i['acceptance']+' Evidência: '+', '.join('['+p+']('+('../'+p if not p.startswith('docs/') else p[5:])+')' for p in i['evidence'])+'.']
 lines += ['']
lines += ['**Formato fixo das entregas:** `Plano vN: X/Y DONE | entrega +Z (IDs) | próximo ID | publicação: SHA/estado | limite: pendência relevante`. A árvore resumida usa uma linha por ramo. Não somar marcos como se tivessem o mesmo custo. Ao dividir/ampliar o plano, incrementar sua versão e explicar a mudança do denominador.','',b]
p=root/'docs/PLANO-MESTRE.md';s=p.read_text();assert s.count(a)==s.count(b)==1
start=s.index(a);end=s.index(b)+len(b);p.write_text(s[:start]+'\n'.join(lines)+s[end:])
print(f'Plano v{d["planVersion"]}: {done}/{len(items)} DONE; próximo {d["next"]}.')
