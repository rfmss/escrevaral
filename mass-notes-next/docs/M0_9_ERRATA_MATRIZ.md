# M0.9 — Errata da contagem da matriz

Data: 2026-07-29

## Correção

A cabeça funcional da tranche 3, `305d0727ddfaee11f3e7680d0f9168023e9a4284`, executou **126 cenários por navegador, 252 execuções**.

Depois dessa evidência, duas fixtures antigas foram consolidadas durante a estabilização final:

- `tests/gate4.spec.ts` — sincronização explícita do documento antes da leitura de Contexto;
- `tests/gate9-export.spec.ts` — consolidação da preparação estruturada usada pelas exportações.

A cobertura semântica permaneceu, mas a quantidade de casos Playwright diminuiu em dois por navegador. Desde a cabeça `4939b3429f166664e377ed2251f28f87345308af`, a matriz consolidada real é:

- **124 cenários por navegador**;
- **248 execuções totais**;
- Chromium e Firefox.

A cabeça `4939b3429f166664e377ed2251f28f87345308af` aprovou 248/248. A cabeça decisória `a092af64ebcb50579ede7d47a3d7c899f7dfaf41` também aprovou 248/248, publicou a preview, renovou o cache e confirmou o smoke público.

## Interpretação

- `252` continua correto apenas como evidência histórica da cabeça funcional `305d0727…`;
- `248` é o número correto da matriz consolidada atual;
- a redução não ocorreu na tranche decisória, que alterou somente documentação;
- nenhum cenário novo da tranche 3 foi removido;
- nenhuma falha foi ignorada ou convertida em verde por redução de asserção;
- documentos que ainda exibam `126/252` como estado **atual** devem ser lidos à luz desta errata até sua sincronização integral.

## Evidência

### Cabeça consolidada anterior

- cabeça: `4939b3429f166664e377ed2251f28f87345308af`;
- Mass Notes `30482560502`: 248/248, publicação, cache e smoke público;
- Argila `30482553803`: verde;
- coerência `30482553920`: verde.

### Cabeça decisória

- cabeça: `a092af64ebcb50579ede7d47a3d7c899f7dfaf41`;
- Mass Notes `30489816417`: 248/248, publicação, cache e smoke público;
- Argila `30489816428`: verde;
- coerência `30489816424`: verde;
- artefato: `mass-notes-tiptap-30489816417`.

## Regra de continuidade

A partir desta errata:

- relatórios executivos devem usar **124/248** como matriz atual;
- `126/252` só pode aparecer acompanhado da indicação de evidência funcional histórica da tranche 3;
- qualquer nova mudança na quantidade de testes exige explicação documental antes de atualizar placar ou PR.