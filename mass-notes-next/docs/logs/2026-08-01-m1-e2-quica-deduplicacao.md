# M1 E2 — deduplicação segura de `quica`

Data: 2026-08-01  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Estado: **fechado e validado na matriz integral**

> **Eva Chara, entre em banca.**

## C — Cenário observado

O bloco `DEFINICOES` de `lexical-engine.js` continha duas declarações consecutivas e textualmente idênticas para `quica`. A semântica de objeto JavaScript mantinha apenas a última ocorrência; a primeira era uma declaração morta, sem cobertura ou informação editorial adicional.

Baseline:

- 1.011 declarações brutas;
- 936 chaves efetivas;
- 69 grupos repetidos;
- 75 declarações sobrescritas;
- um grupo idêntico: `quica`;
- 68 grupos conflitantes.

## L — Limite

O lote não revisou redações conflitantes e não alterou:

- a definição efetiva de `quica`;
- qualquer outro verbete;
- sinônimos, aliases ou polissemia;
- interface ou comportamento linguístico;
- `main` ou a aplicação pública.

Como `lexical-engine.js` é asset público do legado, a branch experimental recebeu somente a renovação mecânica exigida pela distribuição:

- `ASSET_VERSION`: `20260801-lexical-quica-dedup-v1`;
- `CACHE_NAME`: `vereda-offline-v970`;
- lista e estratégia do service worker preservadas.

## A — Ação mínima

1. remoção de uma ocorrência idêntica;
2. preservação literal da definição retida;
3. contrato estático de fonte;
4. regressão do comportamento efetivo;
5. regeneração do inventário;
6. renovação mecânica da versão pública;
7. matriz integral em Chromium e Firefox.

A primeira matriz revelou uma corrida preexistente na fila de salvamento. A preview vermelha foi bloqueada, a corrida foi reproduzida, corrigida em tranche própria e revalidada antes do fechamento deste lote.

## R — Resultado reproduzível

Cabeça funcional integrada: `a90f7a11151b962d183f74e4ee32dbccacd1913f`.  
Cabeça documental validada: `2302c90be43c116d600c0e6d18027c12a48988f9`.

Inventário final:

- 1.010 declarações brutas;
- 936 chaves efetivas;
- 68 grupos repetidos;
- 74 declarações sobrescritas;
- zero grupos idênticos;
- 68 grupos conflitantes.

Executor lexical `30723436245`:

- remoção exata e snapshots: verdes;
- auditoria lexical e E2-V: verdes;
- contrato de fonte: `2/2`;
- executor removido do repositório.

Matriz oficial final `30724861899`:

- **356/356** em Chromium e Firefox;
- testes de fonte e produto de `quica`: verdes nos dois navegadores;
- inventário lexical: verde;
- TypeScript e build: verdes;
- publicação, renovação de cache e smoke público: verdes;
- artefato `mass-notes-tiptap-30724861899`;
- artifact ID `8826061044`;
- digest `sha256:a44a6fd373dbb01dc1a3787b452b9228dfdab65a493bb93b2841fe01f5719846`.

## O — O que permanece aberto

- 68 conflitos editoriais de definições;
- oito autorreferências de sinônimos;
- quatro aliases técnicos;
- `leitor_modelo` vazio;
- cartões de polissemia ausentes;
- expansão lexical bloqueada até a integridade mínima.

## Parecer Eva — fechamento

- dimensão: Léxico e polissemia;
- nota: **6,5**, mantida;
- ganho: integridade mecânica, distribuição coerente e proteção de regressão;
- limite: remover uma duplicata idêntica não prova nova qualidade lexical;
- decisão: `PROSSEGUIR COM CONDIÇÕES` para o primeiro pequeno lote editorial;
- condição: não consolidar os 68 conflitos automaticamente e não abrir Sintaxe em paralelo.
