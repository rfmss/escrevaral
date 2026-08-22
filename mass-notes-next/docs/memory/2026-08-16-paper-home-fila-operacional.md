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

O `App` é dono de uma única `LibraryQuery`; `Library` é controlado por `query` + `onQueryChange`; busca do topo, rail e drawer usam `queryLibraryDocuments`. Filtros e busca descrevem o mesmo recorte nos dois sentidos, sem store global nem bridge de dados.

Gate: run `31982950132`, head `37ed8ece9b1b8a3f46002e332d36e8e4ef0da2fa`, **24/24**, build/publicação/smoke verdes.

### T1 — Tipografia e promessa offline

Objetivo fechado: preservar Anton, Oswald e Literata sem chamada de rede em runtime.

Entregue:
- TTFs vendorados em `src/assets/fonts/` a partir do repositório oficial `google/fonts`;
- Git blob SHAs dos binários locais idênticos aos oficiais usados na importação;
- OFLs e `PROVENANCE.md` junto dos ativos;
- `theme-escrevaral-fonts.css` define `@font-face` local;
- `@import` de `fonts.googleapis.com` removido;
- CI falha se `fonts.googleapis.com` ou `fonts.gstatic.com` reaparecerem no `dist`;
- CI prova presença/tamanho dos TTF;
- Playwright prova carregamento local das três famílias e ausência de requests ao Google Fonts.

Bootstrap de ativos:
- run `31983310996`: baixou/verificou binários, adicionou licenças/proveniência e removeu o workflow efêmero;
- run `31983423267`: removeu import remoto e o segundo bootstrap efêmero.

Falhas intermediárias:
- run `31983487995`: banca esperava hash no nome dos assets; o Vite preservou os nomes exatos;
- run `31983539259`: 24/25; expôs race antigo no resumo do Espelho de Voz.

Correção de robustez descoberta durante T1:
- `WritingVoiceBridge` observa mutações de `#panel-voz` e captura o resultado no ciclo de render;
- polling de 250 ms permanece apenas como fallback;
- engine de Voz não foi alterada.

Gate final: run `31985024414`, head funcional `e710ce6cb31d3513213bb71a4b3d77727eaf0e17`, **25/25**, build/prova offline/publicação/smoke verdes.

### T2 — Bundle principal

Objetivo: reduzir o caminho inicial por **fronteiras naturais**, sem `manualChunks` cosmético, sem alterar engines e sem depender de rede.

#### Linha de base T1

- `index.js`: aproximadamente `2.210.880 B`;
- gzip: aproximadamente `638.760 B`.

#### Medição antes do corte

Massas opcionais encontradas no boot:
- Léxico/Palavras: ~699 KB crus (`lexical-engine.js` + `lexical-data.json` + `norma-data.json`);
- Revisão: ~199 KB crus (`analise`, `syntax`, `punctuation`, `criterios`);
- Contexto/decolonial: ~275 KB de dados + engine pequena;
- RimaLab e Voz: menores.

#### T2a — Revisão sob demanda

Mudanças:
- imports `?raw` da revisão passaram para `dynamic import()` em `reviewAdapter.ts`;
- `ensureReviewEngine()` virou carregador assíncrono idempotente;
- `App` deixou de inicializar revisão no boot;
- `tests/reference-lazy-review.spec.ts` prova ausência dos quatro scripts no boot e instalação somente após `Pesquisa`.

Gate: run `31985686591`, **26/26**, publicação/smoke verdes.

Medida após T2a:
- `index.js`: `2.013.010 B`;
- gzip: `577.239 B`;
- quatro chunks locais de revisão gerados sob demanda.

#### T2b — Palavras/Léxico sob demanda

Mudanças:
- `LexicalPanel` passou a `React.lazy` + `Suspense` dentro da aba `palavras` já condicional;
- engine lexical e dados não foram reescritos;
- foi restaurada uma rota desktop canônica **Consultar palavras** dentro de Linguagem, usando o mesmo `RightRail` real;
- fluxo validado: selecionar no Tiptap → foco total → `Escape` → Consultar palavras → seleção continua disponível;
- Gate 10 completo voltou à banca: consulta, seleção viva, nenhuma substituição automática, fallback seguro e drawer móvel.

Falhas intermediárias registradas:
- run `31985918681`: **27/31**; revelou que Palavras não tinha rota desktop canônica visível;
- run `31986244244`: **27/31**; rota já existia, mas os testes tinham nome `Consultar` ambíguo e ignoravam o modo foco;
- run `31986446376`: **30/31**; produto verde, único erro era `getByRole('status')` colidindo com o status do Espelho de Voz;
- seletores foram ancorados no próprio painel lexical; nenhuma gambiarra no produto para satisfazer a banca.

Gate final T2b:
- run `31986614621`;
- head `b038ab829963da73cd2f439337fe3181921333d9`;
- **31/31 testes verdes**;
- build, prova offline, publicação e smoke público verdes.

Medida final T2:
- `index.js`: **1.098.042 B**;
- gzip medido: **307.233 B**;
- `LexicalPanel.js`: `917.020 B` / ~`271,69 kB` gzip, carregado sob demanda;
- revisão permanece em quatro chunks sob demanda.

Resultado contra a linha de base T1:
- redução minificada do chunk inicial: **50,3%**;
- redução gzip do chunk inicial: **51,9%**.

O Vite ainda avisa sobre chunks acima de 500 kB (`index.js` e `LexicalPanel.js`). Isso permanece documentado, mas T2 atingiu o critério de saída: redução material comprovada, sem regressão de comportamento e sem nova dependência de rede. Não continuar fragmentando apenas para eliminar warning.

## FILA PRONTA

A fila funcional adicional permanece vazia sem novas entidades. Próxima tranche técnica: **T3 — reduzir bridges de transição**, uma integração consolidada por vez.

### Próximo: T3 — Bridges de transição

Objetivo:
1. inventariar bridges atuais e classificar `estável / transitório / ainda necessário`;
2. promover para ownership React somente integrações cujo comportamento já esteja consolidado;
3. começar pelo bridge mais simples/baixo risco;
4. não reescrever shell, engines ou domínio;
5. manter os 31 contratos atuais verdes.

Critério de saída da primeira tranche T3: menos manipulação imperativa de DOM para um circuito já consolidado, mesma UX e mesma fonte de dados.

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
Run `31985024414`, 25/25, smoke verde.

### T2 — Bundle principal — **CONCLUÍDO**
Run `31986614621`, 31/31, ~50% de redução no chunk inicial, smoke verde.

### T3 — Bridges de transição — **PRÓXIMO**
Promover integrações consolidadas ao React proprietário do shell e reduzir manipulação imperativa de DOM, sem refactor amplo.

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
