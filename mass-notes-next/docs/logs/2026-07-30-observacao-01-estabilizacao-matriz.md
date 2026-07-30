# OBS-01 — Estabilização da matriz após o fechamento funcional

Data: 2026-07-30

Método: **CLARO — adendo de evidência**

## Cenário

A cabeça funcional `e281b6cbee6d458b1f01bf6adcf35998ee016950` passou **324/324**, publicação, cache e smoke público.

Ao adicionar somente o registro documental de fechamento, duas tentativas da mesma cabeça apresentaram falhas diferentes, ambas no Firefox e em jornadas antigas do M0.9:

1. uma leitura do IndexedDB ocorreu antes de o `plainText` convergir;
2. uma disputa entre abas não apresentou o banner no lado esperado antes do timeout.

Em ambas as tentativas:

- os quinze cenários da OBS-01 passaram;
- a exportação integral passou;
- auditoria e build passaram;
- a falha migrou entre superfícies independentes.

## Limite e diagnóstico

A matriz usava múltiplos workers contra um único servidor de preview. Jornadas pesadas de persistência, BroadcastChannel, IndexedDB, downloads, cinco engines e paginação competiam por CPU no runner.

Esse paralelismo não representa uma promessa de produto: cada teste cria seu próprio contexto e a concorrência relevante entre abas já é exercitada dentro das jornadas específicas.

Não foi encontrado um defeito determinístico novo na paginação ou na exportação.

## Ação escolhida

O Playwright passa a usar:

```ts
workers: process.env.CI ? 1 : undefined
```

Consequências deliberadas:

- todas as 324 execuções permanecem;
- nenhuma assertion é removida;
- nenhum teste recebe `skip`;
- nenhum retry automático é adicionado;
- nenhum timeout é ampliado;
- Chromium e Firefox permanecem obrigatórios;
- os cenários multitab continuam testando concorrência real dentro do próprio caso;
- o tempo total de CI aumenta em troca de ordem reproduzível e menor disputa artificial.

## Alternativas rejeitadas

- adicionar retries para ocultar falhas migratórias;
- ampliar timeouts indiscriminadamente;
- remover as jornadas antigas;
- excluir Firefox;
- reduzir a banca de paginação;
- declarar verde apenas com base na cabeça funcional anterior.

## Critério de aceite

A decisão só é aceita quando a mesma cabeça documental passar:

- auditoria lexical;
- TypeScript e build;
- **324/324**;
- publicação da preview;
- renovação de cache;
- smoke público;
- Argila;
- coerência.

## Fronteira

A serialização vale somente para o ambiente de CI. O desenvolvimento local continua usando a configuração padrão do Playwright.

Ela não altera editor, manuscrito, persistência, engines, exportações, paginação ou comportamento da preview.
