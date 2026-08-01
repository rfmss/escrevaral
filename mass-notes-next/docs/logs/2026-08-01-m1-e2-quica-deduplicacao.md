# M1 E2 — deduplicação segura de `quica`

Data: 2026-08-01  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Estado: **alteração lexical aprovada; matriz integral vermelha por uma ocorrência não relacionada em Firefox; preview bloqueada**

> **Eva Chara, entre em banca.**

## C — Cenário observado

O bloco `DEFINICOES` de `lexical-engine.js` continha duas declarações consecutivas e textualmente idênticas para a chave `quica`:

```js
"quica": "Advérbio de dúvida equivalente a 'talvez'. Literário e formal; mais raro que 'talvez' no português brasileiro atual.",
"quica": "Advérbio de dúvida equivalente a 'talvez'. Literário e formal; mais raro que 'talvez' no português brasileiro atual.",
```

A semântica de objeto JavaScript mantinha apenas a última ocorrência. Portanto, a primeira declaração não acrescentava cobertura nem informação editorial.

Baseline reproduzível:

- 1.011 declarações brutas;
- 936 chaves efetivas;
- 69 grupos de chaves repetidas;
- 75 declarações sobrescritas;
- 1 grupo idêntico: `quica`;
- 68 grupos conflitantes.

O teste de produto `tests/m1-e2-quica-regression.spec.ts` preserva a definição efetiva e a não mutação do manuscrito. O teste de fonte `tests/m1-e2-quica-source.spec.ts` exige uma única declaração literal no arquivo auditado.

## L — Limite e impacto

Este lote não revisa conflitos editoriais.

Não foram alterados:

- a redação de `quica`;
- qualquer outra definição;
- sinônimos, aliases ou regras de polissemia;
- componentes, interface, seleção ou persistência;
- comportamento efetivo da engine;
- `main` ou aplicação pública.

A auditoria e o adaptador Mass Notes consomem a fonte única `lexical-engine.js`. Não existe uma segunda cópia versionada dessa engine dentro de `mass-notes-next`.

Como `lexical-engine.js` é um asset público do Escrevaral legado, a alteração exigiu renovação mecânica da distribuição na branch experimental:

- `ASSET_VERSION`: `20260801-lexical-quica-dedup-v1`;
- `CACHE_NAME`: `vereda-offline-v970`;
- lista e estratégia do service worker preservadas;
- nenhuma mudança aplicada em `main`.

## A — Ação mínima

1. removida uma única ocorrência idêntica de `quica` em `lexical-engine.js`;
2. preservada byte a byte a redação retida;
3. regenerada a auditoria lexical;
4. atualizados os snapshots documentais;
5. criado contrato estático de fonte;
6. renovados somente os identificadores públicos exigidos pelo gate de distribuição;
7. delegados build e matriz integral ao workflow oficial Mass Notes.

## R — Resultado lexical e de distribuição

Cabeça da alteração lexical: `8d34b69bed9ce573108e01fcb409e3c0d4d7093b`.

Cabeça final anterior a este registro documental: `6b27991d60194e8dad42aeae0503956c8717b097`.

Contagens reproduzidas pelo auditor:

- 1.010 declarações brutas;
- 936 chaves efetivas;
- 68 grupos repetidos;
- 74 declarações sobrescritas;
- 0 grupos idênticos;
- 68 grupos conflitantes.

Executor efêmero lexical `30723436245`: verde.

Dentro do executor:

- remoção exata: verde;
- snapshots: verdes;
- `npm run audit:lexicon`: verde;
- E2-V evidência e proveniência: verdes;
- contrato estático em Chromium e Firefox: `2/2`;
- executor removido do repositório.

Na cabeça final anterior ao registro:

- coerência de versões `30723668260`: verde;
- candidata Argila `30723668286`: verde;
- banca E2-V `30723668297`: verde;
- fronteira pública `30723668263`: verde;
- build Mass Notes: verde;
- auditoria lexical: verde;
- testes específicos de `quica`: verdes nos dois navegadores.

## Matriz integral vermelha preservada

Workflow Mass Notes: `30723668283`.

Resultado:

- Chromium: `177/177`;
- Firefox: `176/177`;
- total: `353/354`;
- alteração lexical, auditorias, build e contratos de `quica`: verdes;
- preview, cache da preview e smoke público: corretamente ignorados após a falha;
- artifact ID: `8825709424`;
- digest: `sha256:ff44c814a764ac21426457e7436f504821928b692b99cae4ecd8b5303c796fad`.

Única falha:

```text
tests/m0-9-integrated.spec.ts
conflito misto entre manuscrito e metadados preserva as duas versões
Firefox: alerta de conflito não encontrado em 12 segundos
```

O mesmo cenário passou em Chromium. A falha não envolve a engine lexical, `quica`, o inventário, a distribuição ou o E2-V. Ela ocorreu na coordenação assíncrona entre duas abas e ainda não está classificada como intermitência ou defeito reproduzível.

Decisão metodológica:

- não aumentar timeout;
- não alterar a engine lexical;
- não publicar preview vermelha;
- registrar a ocorrência;
- reexecutar a mesma cabeça funcional por um commit somente documental;
- somente alterar teste ou produto se a fronteira entre abas falhar novamente.

## O — O que permanece aberto

- reexecução integral após este registro documental;
- classificação da falha entre abas como ocorrência isolada ou risco reproduzível;
- 68 conflitos editoriais de definições;
- oito autorreferências de sinônimos;
- quatro aliases técnicos;
- `leitor_modelo` vazio;
- cartões de polissemia ausentes;
- expansão lexical bloqueada.

## Parecer Eva — banca vermelha

- dimensão: Léxico e polissemia, nota 6,5;
- ganho demonstrado: integridade mecânica e auditabilidade;
- nota mantida: a remoção de uma duplicata idêntica não comprova qualidade lexical nova;
- resultado lexical: aprovado dentro do lote;
- resultado integrado: ainda não fechado por uma falha não relacionada;
- decisão: `PAUSAR` fechamento e publicação até a nova matriz;
- condição principal: não tocar nos 68 conflitos nem mascarar a falha entre abas.
