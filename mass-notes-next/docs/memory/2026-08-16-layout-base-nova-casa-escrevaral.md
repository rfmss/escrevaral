# Decisão — layout-base como nova casa do Escrevaral

- Registrada em: 2026-08-16
- Branch: `feat/escrevaral-paper-home`
- Base: `experiment/mass-notes-tiptap`
- Estado: **casa implementada, funcional e em estabilização técnica**

## Decisão

O layout de papel técnico aprovado é a casa visual canônica do Escrevaral. Ele envolve a fundação React/Tiptap existente e preserva documento estruturado, IndexedDB, autosave, recuperação, conflitos entre abas, snapshots/engines/adapters e português brasileiro como locale de produto. O Cofre continua separado e portátil.

A regra operacional consolidada está em `docs/memory/2026-08-16-paper-home-fila-operacional.md`: **nenhuma superfície pode parecer funcional sem ter destino real**.

## Foco automático

Operações reais de escrita (`insert*`, `delete*`, `history*`) entram automaticamente em foco; topbar, rails, toolbar e statusbar saem da superfície; o parágrafo do cursor fica em primeiro plano por Decoration do ProseMirror; `Escape` devolve a casa. Nenhum estado visual é persistido no manuscrito.

## Circuitos funcionais ligados

### 1 — Documento, busca e Metas
Título, documentos, troca de documento e busca usam o estado real. `Ctrl/Cmd + K` foca a busca canônica. A toolbar opera sobre o Tiptap real. **Metas** usa preferência local compartilhada, padrão `1.200` palavras, atualiza o rodapé e não contamina o documento.

### 2 — Exportar
**Exportar** abre escolha explícita e reutiliza `src/export/documentExport.ts` para TXT, Markdown e HTML. Usa o snapshot vivo do Tiptap e o título atual; geração local, sem segundo pipeline.

### 3 — Configurações
**Config.** abre painel real sem trocar tema por acidente. Expõe Papel/Noite, Concentração, Tela cheia, Anatomia do Livro e `Português (BR)`, reaproveitando estados/controles existentes.

### 4 — Pesquisa
**Pesquisa** reutiliza `setRailOpen(true)` + `runReview()`. A revisão usa o contrato estrutural vivo do Tiptap, `reviewTextDetailed`, mapeamento para posições ProseMirror, marcas e navegação. `WritingResearchBridge` só resolve a superfície desktop; não cria engine.

Desde T2, os quatro módulos pesados da revisão são carregados apenas quando `Pesquisa` é solicitada; `App` não inicializa mais a engine no boot.

### 5 — Tags
O `+` de Tags abre `DocumentMetadataEditor`; usa `draft.tags`, `parseLibraryTags`, os limites reais, `onTags`, autosave e conflito existentes. Tags persistem após reload.

### 6 — Integridade da casa
A passada de integridade removeu ou tornou estática toda affordance sem domínio: projeto fictício, pastas de pesquisa fictícias, dropzone, distribuição inventada, versões sem histórico, timer inexistente, seletores sem contrato e `Notas` sem domínio. O recolhimento do painel de análise passou a ser real.

### 7 — Estado editorial
`Rascunho / Em corte / Pronto` e favorito foram promovidos para o painel canônico usando os mesmos metadados do documento, sem segundo autosave.

### 8 — Espelho de Voz
A seção Linguagem ganhou `Escutar voz`, que abre a aba `voz` real. A análise só roda por ação explícita em `Escutar minha voz`; confiança, hipótese, métricas e disclaimer continuam pertencendo à engine existente. O resumo canônico é projeção transitória e é invalidado quando o texto/título muda.

Durante T1, a banca expôs um race do bridge; `WritingVoiceBridge` agora observa somente mutações de `#panel-voz`, captura a leitura no ciclo de render e mantém polling apenas como fallback. A engine de Voz não foi alterada.

### 9 — Biblioteca local avançada
A área **Biblioteca local / Documentos locais** abre o `Library` real com busca, status, favoritas, tag e ordenação.

### 10 — Ownership único de `LibraryQuery`
O `App` possui uma única `LibraryQuery`. `Library` é controlado por `query`/`onQueryChange`; busca do topo e rail canônico usam o mesmo objeto e `queryLibraryDocuments`. Filtros no drawer e busca no topo descrevem o mesmo recorte nos dois sentidos.

### 11 — Tipografia offline da casa

A tipografia canônica deixou de depender de Google Fonts em runtime sem trocar a linguagem visual aprovada:
- Anton, Oswald e Literata estão vendoradas em `src/assets/fonts/`;
- licenças OFL e proveniência ficam junto dos binários;
- Git blob SHAs locais são idênticos aos arquivos oficiais usados como origem;
- `theme-escrevaral-fonts.css` define `@font-face` local;
- `theme-escrevaral-reference.css` não contém mais `@import` remoto;
- CI falha se hosts do Google Fonts reaparecerem no build;
- Playwright confirma as três famílias carregadas localmente.

### 12 — Palavras/Léxico

A consulta lexical continua usando a engine/dados existentes, mas desde T2 o `LexicalPanel` é carregado por `React.lazy` somente quando a aba `palavras` é realmente usada.

A casa canônica expõe **Consultar palavras** em Linguagem. O fluxo selecionado na escrita permanece íntegro mesmo quando a digitação aciona foco total: selecionar → `Escape` → Consultar palavras mantém o recorte disponível para a consulta. Nenhuma substituição automática é oferecida.

## Evidência dos gates

- foco automático: **12/12**;
- Documento/busca/Metas — run `31977140397`: **14/14**;
- Exportar — run `31977786808`: **15/15**;
- Configurações — run `31978656658`: **16/16**;
- Pesquisa — run `31979455640`: **17/17**;
- Tags — run `31979828644`: **18/18**;
- integridade — run `31981328908`, head `7d679e9e49af388e15524ab9ed71bd762d8e0fee`: **20/20**;
- Estado editorial — run `31981555309`, head `12884a16639b088fde1b0666368571ed3a3e77ac`: **21/21**;
- Espelho de Voz — run `31982237519`, head `ea3e9fb4bde5d0981b92d5927e0e8f10e2acff98`: **22/22**;
- Biblioteca avançada — run `31982558518`, head `eebc7c57d800520f62b649a45a2cbf762cba6284`: **23/23**;
- ownership único da biblioteca — run `31982950132`, head `37ed8ece9b1b8a3f46002e332d36e8e4ef0da2fa`: **24/24**;
- tipografia offline + robustez do Espelho — run `31985024414`, head funcional `e710ce6cb31d3513213bb71a4b3d77727eaf0e17`: **25/25**;
- revisão lazy — run `31985686591`: **26/26**;
- bundle + Léxico lazy + rota canônica Palavras — run `31986614621`, head `b038ab829963da73cd2f439337fe3181921333d9`: **31/31**.

Todos os gates finais preservaram TypeScript/Vite, publicação da preview e smoke público verdes.

## T2 — resultado de performance

Linha de base no gate T1:
- `index.js`: ~`2.210.880 B`;
- gzip: ~`638.760 B`.

Após revisão e Léxico saírem do boot:
- `index.js`: **`1.098.042 B`**;
- gzip: **`307.233 B`**;
- `LexicalPanel.js`: `917.020 B` / ~`271,69 kB` gzip, sob demanda;
- revisão: quatro chunks locais sob demanda.

Redução do chunk inicial:
- **50,3% minificada**;
- **51,9% gzip**.

O warning de chunks >500 kB permanece registrado. Não será perseguido por fragmentação artificial: T2 cumpriu sua meta com fronteiras funcionais reais e sem regressão.

## Bloqueios deliberados

Continuam fora da superfície funcional até existir domínio apropriado:
- Notas / Caixa rápida;
- Projetos;
- biblioteca de personagens/locações/referências/anexos;
- histórico real de versões;
- distribuição narrativa;
- fonte/tamanho/alinhamento/task-list editáveis;
- seletor de modo;
- seletor de idioma.

## Próxima frente

A fila funcional liberada está vazia. A próxima frente é **T3 — reduzir bridges de transição**: inventariar os bridges atuais e promover, uma integração por vez, somente circuitos já consolidados para ownership React do shell. Não fazer refactor amplo nem reescrever engine/domínio.

A primeira tranche T3 deve escolher o bridge de menor risco e manter os **31 contratos** atuais verdes.

Poda de branches e Cofre permanecem registrados e deferidos.
