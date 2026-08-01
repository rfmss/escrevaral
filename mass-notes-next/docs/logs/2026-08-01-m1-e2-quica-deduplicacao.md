# M1 E2 — deduplicação segura de `quica`

Data: 2026-08-01  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Estado: **alteração mínima aplicada; matriz integral em validação**

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
- `main`, aplicação pública ou service worker público.

A auditoria e o adaptador Mass Notes consomem a fonte única `lexical-engine.js`. Não existe uma segunda cópia versionada dessa engine dentro de `mass-notes-next`.

## A — Ação mínima

1. removida uma única ocorrência idêntica de `quica` em `lexical-engine.js`;
2. preservada byte a byte a redação retida;
3. regenerada a auditoria lexical;
4. atualizados os snapshots documentais;
5. criado contrato estático de fonte;
6. delegados build e matriz integral ao workflow oficial Mass Notes.

## R — Resultado técnico aplicado

Cabeça da alteração lexical: `8d34b69bed9ce573108e01fcb409e3c0d4d7093b`.

Contagens reproduzidas pelo auditor:

- 1.010 declarações brutas;
- 936 chaves efetivas;
- 68 grupos repetidos;
- 74 declarações sobrescritas;
- 0 grupos idênticos;
- 68 grupos conflitantes.

Executor efêmero final: `30723436245` — verde.

Dentro do executor:

- remoção exata: verde;
- snapshots: verdes;
- `npm run audit:lexicon`: verde;
- E2-V evidência e proveniência: verdes;
- contrato estático em Chromium e Firefox: `2/2`;
- executor removido no próprio commit final.

Uma tentativa anterior (`30723389788`) executou auditoria e teste com sucesso, mas o build isolado encontrou a fronteira já conhecida da fonte direta da Anatomia. O executor não mascarou a falha: o passo foi retirado, e build/publicação permanecem sob responsabilidade do workflow oficial Mass Notes, que prepara os assets segundo o contrato do projeto.

Este documento não declara a matriz integral verde antes do encerramento dos workflows da cabeça documental final.

## O — O que permanece aberto

- validação da cabeça documental final em build e matriz integral;
- 68 conflitos editoriais de definições;
- oito autorreferências de sinônimos;
- quatro aliases técnicos;
- `leitor_modelo` vazio;
- cartões de polissemia ausentes;
- expansão lexical bloqueada.

## Parecer Eva — parcial

- dimensão: Léxico e polissemia, nota 6,5;
- ganho demonstrado: integridade mecânica e auditabilidade;
- nota mantida: a remoção de uma duplicata idêntica não comprova qualidade lexical nova;
- falsos positivos/negativos linguísticos: não se aplicam, pois o runtime efetivo foi preservado;
- decisão: `PROSSEGUIR COM CONDIÇÕES`;
- condição principal: fechar a matriz oficial e não tocar nos 68 conflitos neste lote.
