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

## FILA PRONTA

Nenhuma tranche funcional adicional está liberada sem nova entidade/contrato. A ordem lógica passa para as dívidas técnicas resolvíveis sem inventar produto.

### Próximo: T1 — Tipografia e promessa offline

Objetivo: remover o `@import` de Google Fonts em runtime **sem perder a linguagem tipográfica da referência**.

Plano preferencial:
1. vendorizar Anton, Oswald e Literata sob licença OFL;
2. adicionar `@font-face` local;
3. remover qualquer dependência de `fonts.googleapis.com` / `fonts.gstatic.com` em runtime;
4. testar que CSS e fontes servem pela preview e que a casa continua visualmente estável.

Plano de contingência — somente se a vendorização binária não for segura/reprodutível: stack local equivalente, com a perda visual explicitamente registrada. Não aplicar silenciosamente.

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

### T1 — Tipografia/offline — **EM EXECUÇÃO**
O CSS canônico ainda importa Google Fonts em runtime. Prioridade máxima entre as dívidas porque contradiz a promessa offline.

### T2 — Bundle principal
O build continua avisando que o chunk JS principal ultrapassa 500 kB. Abrir rodada própria de code splitting depois de T1.

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
