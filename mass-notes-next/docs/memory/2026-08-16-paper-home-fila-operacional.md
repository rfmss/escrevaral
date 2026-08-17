# Fila operacional — nova casa do Escrevaral

- Registrada em: 2026-08-16
- Branch: `feat/escrevaral-paper-home`
- Base: `experiment/mass-notes-tiptap`
- Regra: **nenhuma superfície pode parecer funcional sem ter destino real**.

## Estados da fila

- **CONCLUÍDO** — implementado, testado, publicado e com smoke público verde.
- **EM VALIDAÇÃO** — implementação pronta; gate público ainda precisa fechar.
- **FILA PRONTA** — existe infraestrutura real, mas a tranche ainda não foi implementada.
- **BLOQUEADO POR MODELO** — falta entidade, persistência ou engine; não criar cenografia.
- **DÍVIDA TÉCNICA** — não é feature autoral, mas precisa ser fechada antes da estabilização final.

## CONCLUÍDO

### I1 — Passada de integridade

Retirou affordances sem destino real: modo falso, projeto fictício, pastas/contagens fictícias de pesquisa, dropzone sem domínio, distribuição inventada, tags de exemplo, versões sem histórico, cronômetro inexistente, seletor de idioma, fonte/tamanho sem contrato e `Notas` sem domínio. Recolher análise passou a funcionar de verdade.

Gate: run `31981328908`, head `7d679e9e49af388e15524ab9ed71bd762d8e0fee`, **20/20**, build/publicação/smoke verdes.

### A1 — Estado editorial canônico

`Rascunho / Em corte / Pronto` e favorito usam os mesmos metadados, autosave, IndexedDB e conflito já existentes.

Gate: run `31981555309`, head `12884a16639b088fde1b0666368571ed3a3e77ac`, **21/21**, build/publicação/smoke verdes.

### A2 — Espelho de Voz na análise canônica

`Escutar voz` abre a aba `voz` real; a leitura só roda por ação explícita em `Escutar minha voz`; o resumo canônico projeta o resultado da engine existente e é invalidado quando título/texto mudam.

Falhas intermediárias ficaram registradas nos runs `31981905728` e `31982071581` e foram corrigidas sem alterar a engine.

Gate final: run `31982237519`, head `ea3e9fb4bde5d0981b92d5927e0e8f10e2acff98`, **22/22**, build/publicação/smoke verdes.

### A3a — Biblioteca avançada real acessível pela casa

A área **Biblioteca local / Documentos locais** abre o `Library` real com filtros de estado, favorito, tag e ordenação.

Gate: run `31982558518`, head `eebc7c57d800520f62b649a45a2cbf762cba6284`, **23/23**, build/publicação/smoke verdes.

### A3b — Ownership único da busca/biblioteca canônica

Problema eliminado:
- `Library` mantinha `status`, `favoritesOnly`, `tag` e `sort` internamente;
- `App` mantinha outra string `search` e o rail canônico fazia um filtro próprio de título + texto.

Estado final:
- `App` é dono de uma única `LibraryQuery`;
- `Library` é controlado por `query` + `onQueryChange`;
- busca do topo edita `libraryQuery.search`;
- rail canônico e drawer usam `queryLibraryDocuments(documents, libraryQuery)`;
- filtros feitos no drawer aparecem no rail;
- busca feita no topo reaparece no drawer;
- `Limpar filtros` limpa o mesmo estado compartilhado;
- nenhuma store global nem bridge de filtro foi criada.

Gate: run `31982950132`, head `37ed8ece9b1b8a3f46002e332d36e8e4ef0da2fa`, **24/24**, build, publicação e smoke público verdes.

### T1 — Tipografia e promessa offline

Objetivo fechado: preservar Anton, Oswald e Literata sem chamada de rede em runtime.

Entregue:
- `Anton-Regular.ttf`, `Oswald-wght.ttf` e `Literata-opsz-wght.ttf` foram vendorados em `src/assets/fonts/` a partir do repositório oficial `google/fonts`;
- os Git blob SHAs dos binários locais são idênticos aos oficiais usados na importação;
- `OFL-Anton.txt`, `OFL-Oswald.txt`, `OFL-Literata.txt` e `PROVENANCE.md` ficam junto dos ativos;
- `paper-home-fonts.css` define `@font-face` local;
- o `@import` de `fonts.googleapis.com` foi removido do CSS canônico;
- o workflow falha se `fonts.googleapis.com` ou `fonts.gstatic.com` reaparecerem no `dist`;
- o workflow também prova presença e tamanho exato dos três TTF gerados;
- Playwright prova `document.fonts.check()` para Anton, Oswald e Literata e ausência de requests ao Google Fonts.

Bootstrap de ativos:
- run `31983310996`: baixou/verificou os binários oficiais, adicionou licenças/proveniência e removeu o workflow efêmero no mesmo commit;
- run `31983423267`: removeu o import remoto e removeu o segundo bootstrap efêmero no mesmo commit.

Falhas intermediárias registradas:
- run `31983487995`: build verde e ausência de Google Fonts verde; a banca usava glob com hash, mas o Vite preservou os nomes exatos dos TTF;
- run `31983539259`: prova de assets corrigida e 24/25 contratos verdes; o único vermelho expôs um race antigo no resumo do Espelho de Voz, não relacionado às fontes.

Correção de robustez descoberta durante T1:
- `WritingVoiceBridge` agora observa somente mutações de `#panel-voz` e captura o resultado no ciclo em que `voiceReading` é renderizado;
- o polling de 250 ms continua apenas como fallback;
- a engine de Voz não foi alterada.

Gate final:
- run `31985024414`;
- head funcional `e710ce6cb31d3513213bb71a4b3d77727eaf0e17`;
- **25/25 contratos verdes**;
- build, prova offline, publicação e smoke público verdes.

## FILA PRONTA

Nenhuma tranche funcional adicional está liberada sem nova entidade/contrato. A ordem lógica continua pelas dívidas técnicas que reduzem risco sem inventar produto.

### Próximo: T2 — Bundle principal

Problema comprovado no gate T1:
- `dist/assets/index.js`: ~2,21 MB minificado / ~639 kB gzip;
- Vite mantém warning de chunk principal acima de 500 kB.

Objetivo da rodada:
1. medir quais módulos dominam o bundle;
2. separar experiências pesadas que não precisam carregar junto do editor inicial;
3. preferir `dynamic import()` em fronteiras naturais já existentes, sem quebrar offline;
4. preservar Tiptap, autosave, recuperação, conflito, drawers e gates canônicos;
5. não alterar UX só para melhorar métrica.

Critério de saída: redução comprovada do chunk inicial, sem regressão nos 25 contratos e sem nova dependência de rede.

## BLOQUEADO POR MODELO — não implementar cenograficamente

### B1 — Notas / Caixa rápida
Falta entidade de nota, relação nota ↔ documento/projeto, persistência, política para texto/imagem/arquivo, recuperação, conflito e exportação. `Notas` permanece desabilitado.

### B2 — Projetos
Falta entidade `Project`, membership documento ↔ projeto, criação/seleção, metadados e migração. Até lá, a casa é uma biblioteca local de documentos.

### B3 — Biblioteca de pesquisa documental
Faltam entidades e persistência para personagem, locação, referência, inspiração e anexos. A revisão linguística local não deve ser confundida com essa futura biblioteca.

### B4 — Histórico real de versões
IndexedDB guarda o documento corrente; `saveDocument` sobrescreve o registro e incrementa `revision`; live snapshot é memória transitória. Histórico exige store/schema de snapshots, retenção, restauração segura, migração e testes de espaço/conflito.

### B5 — Distribuição narrativa
Falta engine aprovada para classificar diálogo / descrição / narração. Não usar regex simples como verdade editorial.

### B6 — Fonte, tamanho, alinhamento e task list completos
Faltam extensões Tiptap, atributos serializáveis, contrato de paste/import/export e compatibilidade com documentos existentes.

### B7 — Seletor de modo
Hoje há um único modo real: Escrita. Só reabrir quando houver pelo menos dois modos com contrato claro.

### B8 — Seletor de idioma
Locale atual: `pt-BR`. Internacionalização é decisão separada e não nasce de uma seta visual.

## DÍVIDA TÉCNICA

### T1 — Tipografia/offline — **CONCLUÍDO**
Fechado no run `31985024414`, com 25/25 contratos e smoke público verde.

### T2 — Bundle principal — **PRÓXIMO**
Chunk inicial continua acima de 500 kB gzip. Abrir rodada própria de medição e code splitting.

### T3 — Bridges de transição
Depois da estabilização, promover integrações consolidadas ao React proprietário do shell e reduzir manipulação transitória de DOM.

## Fora desta fila

- **Cofre**: arquitetura linguística separada; não misturar nesta branch.
- **Poda de branches**: registrada e deferida; não executar como efeito colateral.

## Regra para tirar um item da fila

1. destino/contrato real;
2. nenhuma segunda fonte de dados;
3. teste Playwright do comportamento visível;
4. TypeScript/Vite verde;
5. Tiptap, autosave, recuperação e conflito continuam verdes;
6. preview pública + smoke verdes;
7. esta memória e o PR registram run/head comprovados.
