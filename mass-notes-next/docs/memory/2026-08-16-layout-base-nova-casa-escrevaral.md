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

### 5 — Tags
O `+` de Tags abre `DocumentMetadataEditor`; usa `draft.tags`, `parseLibraryTags`, os limites reais, `onTags`, autosave e conflito existentes. Tags persistem após reload.

### 6 — Integridade da casa
A passada de integridade removeu ou tornou estática toda affordance sem domínio: projeto fictício, pastas de pesquisa fictícias, dropzone, distribuição inventada, versões sem histórico, timer inexistente, seletores sem contrato e `Notas` sem domínio. O recolhimento do painel de análise passou a ser real.

### 7 — Estado editorial
`Rascunho / Em corte / Pronto` e favorito foram promovidos para o painel canônico usando os mesmos metadados do documento, sem segundo autosave.

### 8 — Espelho de Voz
A seção Linguagem ganhou `Escutar voz`, que abre a aba `voz` real. A análise só roda por ação explícita em `Escutar minha voz`; confiança, hipótese, métricas e disclaimer continuam pertencendo à engine existente. O resumo canônico é apenas projeção transitória e é invalidado quando o texto/título muda.

Durante T1, a banca expôs um race do bridge: o resultado podia renderizar e o drawer fechar antes do polling de 250 ms capturar o resumo. `WritingVoiceBridge` agora observa somente mutações de `#panel-voz`, captura a leitura no ciclo de render e mantém o polling apenas como fallback. A engine de Voz não foi alterada.

### 9 — Biblioteca local avançada
A área **Biblioteca local / Documentos locais** abre o `Library` real com busca, status, favoritas, tag e ordenação.

### 10 — Ownership único de `LibraryQuery`
O `App` passou a possuir uma única `LibraryQuery`. `Library` é controlado por `query`/`onQueryChange`; a busca do topo e o rail canônico usam o mesmo objeto e `queryLibraryDocuments`. Filtros no drawer e busca no topo descrevem o mesmo recorte nos dois sentidos.

### 11 — Tipografia offline da casa

A tipografia canônica deixou de depender de Google Fonts em runtime sem trocar a linguagem visual aprovada:
- Anton, Oswald e Literata estão vendoradas em `src/assets/fonts/`;
- as licenças OFL e a proveniência ficam junto dos binários;
- os Git blob SHAs locais são idênticos aos arquivos oficiais usados como origem;
- `paper-home-fonts.css` define `@font-face` local;
- `theme-escrevaral-reference.css` não contém mais `@import` remoto;
- o CI falha se `fonts.googleapis.com` ou `fonts.gstatic.com` reaparecerem no build;
- Playwright confirma que as três famílias carregam localmente.

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
- tipografia offline + robustez do Espelho — run `31985024414`, head funcional `e710ce6cb31d3513213bb71a4b3d77727eaf0e17`: **25/25**.

Todos os gates finais acima preservaram build TypeScript/Vite, publicação da preview e smoke público verdes. O gate T1 acrescentou prova explícita de ausência de Google Fonts no `dist` e presença dos três TTF locais.

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

A fila funcional liberada está vazia. A próxima frente lógica é **T2 — bundle principal**: medir e reduzir o chunk inicial (~2,21 MB minificado / ~639 kB gzip no gate T1) por fronteiras naturais de `dynamic import()`, sem alterar UX, offline ou os 25 contratos verdes.

Depois de T2 vem **T3 — reduzir bridges de transição** promovendo integrações consolidadas para ownership React onde isso realmente diminuir risco.

Poda de branches e Cofre permanecem registrados e deferidos.
