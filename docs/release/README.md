# Lançamentos do Escrevaral

Este diretório é a fonte de verdade para preparação e encerramento de versões públicas.

## Versão estável

- versão: `1.0.0`;
- codinome: Argila;
- notas públicas: `RELEASE_NOTES_1.0.0.md`;
- checklist de saída: `LAUNCH_CHECKLIST.md`;
- baseline técnica: `BASELINE_1.0.0_RC1_2026-07-26.md`;
- candidata e evidências anteriores: `ARGILA_RELEASE_CANDIDATE_2026-07-25.md`.

## Política de versão

O Escrevaral usa versionamento semântico para versões públicas:

- correção: mudança compatível que corrige defeito reproduzido;
- menor: recurso compatível ou ampliação relevante;
- maior: mudança incompatível em formato, persistência, rotas ou contrato público.

Os identificadores de assets e cache do service worker são mecanismos técnicos de invalidação. Eles não substituem a versão pública registrada em `VERSION`.

## Contrato de publicação

Uma versão pública só pode ser encerrada quando:

1. não houver P0 ou P1 reproduzido;
2. a candidata de lançamento estiver verde;
3. o teste de atualização e recarga offline da PWA estiver verde;
4. `README.md`, `CHANGELOG.md`, `VERSION` e esta documentação estiverem coerentes;
5. não houver PR ou issue bloqueadora aberta;
6. o workflow de publicação apontar a tag para o SHA exato incorporado em `main`;
7. a produção permanecer acessível após a publicação.

Mudanças estruturais posteriores voltam a ocorrer em lotes isolados e versionados. Uma versão estável não deve ser usada para reorganizações cosméticas ou para perseguir uma raiz artificialmente vazia.
