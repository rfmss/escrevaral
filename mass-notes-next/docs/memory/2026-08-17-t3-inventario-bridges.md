# T3 — inventário de bridges da Paper Home

- Registrado em: 2026-08-17
- Branch: `feat/escrevaral-paper-home`
- Princípio: promover apenas circuitos consolidados para ownership React; **não** reescrever engines/domínio nem trocar um bridge simples por uma abstração maior.

## PROMOVIDO

### T3a — Estado editorial

Antes:
- `WritingEditorialStateBridge` criava a seção por DOM imperativo;
- fazia polling a cada 300 ms;
- clicava controles escondidos de `#panel-pulso` para status/favorito.

Depois:
- `.reference-editorial-state` é JSX do `App`;
- `Rascunho / Em corte / Pronto` chama `mutateDraft(..., 'metadata')` diretamente;
- favorito altera `draft.favorite` diretamente;
- `WritingEditorialStateBridge.tsx` foi removido.

Falhas intermediárias:
- `31986992006`: patch textual procurou ponto antigo; nenhum commit de produto;
- `31987048305`: workflow efêmero não iniciou corretamente; nenhum commit de produto;
- `31987159791`: bootstrap simplificado executou e se removeu.

Gate final:
- run `31987285323`;
- head `641f0afab5eb8653814a268b129142640848c3de`;
- **32/32**;
- build, offline, publicação e smoke verdes.

A prova remove o conteúdo de `#panel-pulso` e status/favorito continuam salvando.

### T3b — Biblioteca

Antes:
- `WritingLibraryBridge` fazia polling de `#document-library.open`;
- sincronizava ARIA/body class por DOM;
- abria a Biblioteca clicando em `.mobile-menu`, um gatilho móvel escondido no desktop;
- `WritingIntegrityBridge` ainda reescrevia `ROMANCE DE FICÇÃO` para Biblioteca local.

Depois:
- `App` já nasce com **BIBLIOTECA LOCAL / DOCUMENTOS LOCAIS**;
- o botão canônico chama `setSidebarOpen(true)` diretamente;
- `aria-controls="document-library"` e `aria-expanded={sidebarOpen}` pertencem ao JSX;
- `reference-library-open` deriva de `sidebarOpen` em `useEffect` React;
- a reescrita do bloco `current-project` saiu do `WritingIntegrityBridge`;
- `WritingLibraryBridge.tsx` foi removido do repo;
- `LibraryQuery`, filtros e drawer permaneceram inalterados.

Falhas intermediárias:
- `31987548190`: primeiro patcher falhou antes do commit de produto porque o literal multilinha perdeu indentação;
- `31987605476`: segundo bootstrap estrutural executou e se removeu corretamente;
- `31987647482`: produto abriu a Biblioteca nos dois testes, mas o locator por nome deixou de resolver quando o `aria-label` mudou no estado aberto; corrigida apenas a banca, ancorando pelo `aria-controls` estável.

Gate final:
- run `31987876116`;
- head `7c2b5f4d6cbfb95bafc6c0efe7d62ecc65f1b337`;
- **33/33 testes verdes**;
- build, tipografia offline, publicação e smoke público verdes;
- `index.js`: `1.094.923 B`, gzip `306.571 B`.

Prova forte:
- o teste remove `.mobile-menu` do DOM;
- o gatilho canônico continua abrindo/fechando o `Library` real e sincronizando `aria-expanded`/body class;
- portanto a dependência do bridge móvel morreu de fato.

## PRÓXIMO — T3c: retirar cenografia morta da fonte

`WritingIntegrityBridge` continua necessário, mas ainda gasta polling para neutralizar markup que já sabemos que não deve existir funcionalmente.

Tranche aprovada por lógica de baixo risco:
1. `Modo` nasce estático/desabilitado no JSX;
2. `Notas` nasce desabilitado e sem `onClick`;
3. remover da fonte as pastas/contagens fictícias de Pesquisa e a Caixa rápida sem domínio;
4. remover a distribuição `18/41/41` da fonte;
5. remover tags-fallback fictícias;
6. `VERSÕES` nasce como **ESTADO LOCAL / rev. N**, sem `Ver todas`;
7. `FOCO` nasce como `Pronto / Ativo`, sem `60 min`;
8. idioma nasce como texto fixo, sem seletor;
9. retirar do `WritingIntegrityBridge` somente os blocos correspondentes.

Não mexer nesta tranche:
- recolher/expandir análise, que ainda é comportamento implementado pelo bridge;
- controles tipográficos sem contrato Tiptap;
- bridges de Metas/Exportar/Config/Pesquisa/Tags/Voz/Palavras.

Critério de saída T3c:
- os valores cenográficos deixam de existir no DOM de origem, não apenas ficam escondidos;
- comportamento/geometry continuam verdes;
- **33 contratos atuais + uma prova de ausência na fonte**.

## CANDIDATOS POSTERIORES — auditar antes de promover

### Metas — `WritingGoalsBridge`
Tem preferência local, modal e snapshot real, mas ainda encontra gatilho e altera statusbar por DOM. Exige definir ownership da meta no `App` antes de remover.

### Exportar — `WritingExportBridge`
Modal/pipeline reais, mas intercepta botão e lê snapshot/título por bridges. Exige props/callbacks explícitos.

### Config. — `WritingConfigBridge`
Modal real, mas aciona tema/foco/fullscreen/Anatomia clicando controles existentes. Exige callbacks explícitos.

## AINDA NECESSÁRIO NESTA FASE

### `WritingIntegrityBridge`
Não remover como bloco. T3c deve apenas reduzir as responsabilidades cujo markup cenográfico já pode ser corrigido na fonte. O bridge continua protegendo recolhimento de análise e controles tipográficos sem contrato.

## Regra de T3

Um bridge só sai quando:
1. a fonte de estado já pertence a React/domínio real;
2. não há polling/clique em controle escondido necessário;
3. comportamento visível é igual ou mais honesto;
4. gate completo permanece verde;
5. arquivo substituído é removido do repo;
6. esta memória registra falhas intermediárias e gate final.
