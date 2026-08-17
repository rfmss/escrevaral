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

Objetivo: retirar toda affordance que prometia capacidade inexistente.

Resolvido:
- `Modo: Escrita` virou estado estático, não seletor falso;
- `ROMANCE DE FICÇÃO` virou **Biblioteca local / Documentos locais**;
- pastas e contagens fictícias de pesquisa foram removidas da experiência efetiva;
- Caixa rápida/dropzone foi ocultada enquanto não houver domínio de notas/anexos;
- distribuição fictícia `18 / 41 / 41` foi retirada;
- tags de exemplo foram removidas e documento sem tags mostra estado vazio honesto;
- `VERSÕES` virou **ESTADO LOCAL / rev. N**; `Ver todas` foi retirado porque `revision` não é histórico recuperável;
- `FOCO 60 min` virou estado real `Pronto / Ativo`;
- seletor de idioma foi retirado; `Português (BR)` continua como locale real;
- fonte/tamanho sem contrato Tiptap foram desabilitados;
- recolher/expandir análise passou a funcionar de verdade;
- `Notas` ficou explicitamente indisponível enquanto o domínio estiver bloqueado.

Gate:
- run `31981328908`;
- head `7d679e9e49af388e15524ab9ed71bd762d8e0fee`;
- **20/20 testes verdes**;
- build, publicação e smoke público verdes.

### A1 — Estado editorial canônico

Base reutilizada: `DocumentStatus`, `favorite`, `DocumentMetadataEditor`, autosave, IndexedDB e conflito.

Entregue:
- `Rascunho / Em corte / Pronto` no painel canônico;
- favorito `☆ / ★` no painel canônico;
- nenhuma segunda fonte de estado: os controles delegam aos mesmos handlers reais de metadados;
- reload preserva estado e favorito.

Gate:
- run `31981555309`;
- head `12884a16639b088fde1b0666368571ed3a3e77ac`;
- **21/21 testes verdes**;
- build, publicação e smoke público verdes.

### A2 — Espelho de Voz na análise canônica

Base reutilizada: `src/engines/voiceAdapter.ts` e a aba `voz` real do `RightRail`.

Entregue:
- lançador **Escutar voz** dentro de Linguagem;
- abrir o Espelho não executa análise automaticamente;
- somente `Escutar minha voz` dispara a leitura local;
- confiança, hipótese, métricas e disclaimer continuam vindos da engine existente;
- resumo canônico apenas projeta o resultado real;
- o último resumo permanece enquanto título/texto não mudarem e é invalidado quando o conteúdo muda.

Falhas intermediárias registradas:
- run `31981905728`: leitura funcionou, mas o fechamento reabria o rail porque a classe do `<body>` também satisfazia o seletor do lançador;
- run `31982071581`: fechamento corrigido; o resumo canônico era perdido quando a aba interna voltava a `pulso`;
- ambos foram corrigidos antes do gate final, sem alteração da engine.

Gate final:
- run `31982237519`;
- head `ea3e9fb4bde5d0981b92d5927e0e8f10e2acff98`;
- **22/22 testes verdes**;
- build, publicação e smoke público verdes.

## EM VALIDAÇÃO

### A3a — Biblioteca avançada real acessível pela casa

Motivo do desdobramento: a `Library` já possui `queryLibraryDocuments`, filtros de status, favoritos, tags e ordenação. Já o rail canônico mantém uma filtragem simplificada própria. Expor a Biblioteca real pode ser feito agora; fundir os dois ownerships exige refactor no `App` e fica em A3b.

Implementado para validação:
- botão da área **Biblioteca local / Documentos locais** agora abre o `Library` real;
- no desktop, o mesmo drawer real recebe a linguagem de papel da casa;
- filtros testados: estado, somente favoritas, tag e ordenação;
- nenhuma segunda query foi criada.

Gate em execução:
- run `31982558518`;
- head `eebc7c57d800520f62b649a45a2cbf762cba6284`;
- expectativa: **23 contratos**.

Só mover para CONCLUÍDO se Playwright, build, publicação e smoke público fecharem verdes.

## FILA PRONTA

### A3b — Unificar ownership da busca/biblioteca canônica

Base: `library/libraryQuery.ts`.

Problema atual:
- `Library` usa `queryLibraryDocuments` e `collectLibraryTags`;
- o rail canônico ainda filtra somente uma string simplificada de título + texto no `App`.

Objetivo:
- fazer a casa consumir uma única `LibraryQuery`;
- eliminar duplicação de normalização/filtro;
- preservar busca por título/texto/tag/status, favoritos e ordenação determinística pt-BR.

Critério: não resolver por mais um bridge de filtro. Esta tranche deve mexer no ownership React/`App`.

## BLOQUEADO POR MODELO — não implementar cenograficamente

### B1 — Notas / Caixa rápida

Falta entidade de nota, relação nota ↔ documento/projeto, persistência, política para texto/imagem/arquivo, recuperação, conflito e exportação. `Notas` permanece desabilitado.

### B2 — Projetos

Falta entidade `Project`, membership documento ↔ projeto, criação/seleção, metadados e migração. Até lá, a casa é uma biblioteca local de documentos.

### B3 — Biblioteca de pesquisa documental

Faltam entidades e persistência para personagem, locação, referência, inspiração e anexos. A revisão linguística local não deve ser confundida com essa futura biblioteca.

### B4 — Histórico real de versões

Estado atual:
- IndexedDB guarda o documento corrente;
- `saveDocument` sobrescreve o registro e incrementa `revision`;
- live snapshot é memória transitória.

Para `Ver todas` existir corretamente será necessário store/schema de snapshots, política de retenção, restauração segura, migração e testes de espaço/conflito.

### B5 — Distribuição narrativa

Falta engine aprovada para classificar diálogo / descrição / narração. Não usar regex simples como verdade editorial.

### B6 — Fonte, tamanho, alinhamento e task list completos

Faltam extensões Tiptap correspondentes, atributos serializáveis, contrato de paste/import/export e compatibilidade com documentos existentes.

### B7 — Seletor de modo

Hoje há um único modo real: Escrita. Só reabrir este controle quando houver pelo menos dois modos com contrato claro.

### B8 — Seletor de idioma

Locale atual: `pt-BR`. Internacionalização é decisão separada e não nasce de uma seta visual.

## DÍVIDA TÉCNICA

### T1 — Tipografia e promessa offline — prioridade alta

`theme-escrevaral-reference.css` ainda importa Google Fonts em runtime. Isso conflita com a promessa offline.

Fechamento necessário:
- empacotar fontes com licença adequada; **ou**
- aprovar stack local equivalente e aceitar diferença visual.

### T2 — Bundle principal

O build continua avisando que o chunk JS principal ultrapassa 500 kB. Abrir rodada própria de code splitting quando a superfície estabilizar.

### T3 — Bridges de transição

Os bridges são aceitáveis durante estabilização. Depois dos circuitos consolidados, promover integrações estáveis ao React proprietário do shell e reduzir manipulação transitória de DOM.

## Fora desta fila

- **Cofre**: arquitetura linguística separada; não misturar nesta branch.
- **Poda de branches**: registrada e deferida; não executar como efeito colateral.

## Regra para tirar um item da fila

1. destino de domínio real;
2. nenhuma segunda fonte de dados;
3. teste Playwright do comportamento visível;
4. TypeScript/Vite verde;
5. Tiptap, autosave, recuperação e conflito continuam verdes;
6. preview pública + smoke verdes;
7. esta memória e o PR registram run/head comprovados.
