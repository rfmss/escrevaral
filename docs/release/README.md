# Lançamentos do Escrevaral

Este diretório é a fonte de verdade para preparação e encerramento de versões públicas.

## Versão em estabilização

- versão: `1.0.0-rc.1`;
- codinome: Argila;
- baseline técnica: `BASELINE_1.0.0_RC1_2026-07-26.md`;
- checklist de saída: `LAUNCH_CHECKLIST.md`;
- candidata anterior e evidências históricas: `ARGILA_RELEASE_CANDIDATE_2026-07-25.md`.

## Política de versão

O Escrevaral usa versionamento semântico para versões públicas:

- correção: mudança compatível que corrige defeito reproduzido;
- menor: recurso compatível ou ampliação relevante;
- maior: mudança incompatível em formato, persistência, rotas ou contrato público.

Os identificadores de assets e cache do service worker são mecanismos técnicos de invalidação. Eles não substituem a versão pública registrada em `VERSION`.

## Regra de promoção

Uma candidata só pode ser promovida quando:

1. não houver P0 ou P1 reproduzido;
2. a candidata de lançamento estiver verde;
3. o checklist de saída estiver integralmente resolvido;
4. `README.md`, `CHANGELOG.md`, `VERSION` e esta documentação estiverem coerentes;
5. não houver PR ou issue bloqueadora aberta;
6. a produção estiver acessível e os principais fluxos funcionarem após a publicação.

Depois da promoção para `1.0.0`, mudanças estruturais voltam a ocorrer em lotes isolados. A versão de lançamento não deve ser usada para esvaziar a raiz ou executar refatorações cosméticas.
