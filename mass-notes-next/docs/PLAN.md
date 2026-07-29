# Plano vivo — Mass Notes Next

Atualizado em: 2026-07-28

## Norte do produto

Construir uma oficina de escrita feita para português brasileiro, preservando as engines e a identidade do Escrevaral sobre infraestrutura consolidada de edição.

O diferencial do produto não é fabricar cursor, seleção ou histórico. É oferecer leitura linguística local, fluxo de escrita, repertório brasileiro e saída segura para o trabalho de quem escreve.

## Fundação atual

- React + TypeScript + Vite;
- Tiptap / ProseMirror;
- IndexedDB por `idb`;
- revisão condicional e conflito entre abas;
- engines legadas por adaptadores;
- contrato comum de posições textuais;
- primeira decoration ProseMirror somente de leitura;
- exportação estrutural derivada do JSON Tiptap;
- tokens visuais semânticos;
- skin Blueprint Tokon isolada e reversível;
- Anatomia do Livro integrada por runtime gerado na CI;
- dependências reproduzíveis por `package-lock.json` e `npm ci`;
- responsividade estabilizada;
- preview isolada em `preview-mass-notes-tiptap`;
- PR rascunho `#155`.

## Gates concluídos

### Gate 1 — fundação

- documento estruturado;
- histórico isolado por documento;
- conflito entre abas;
- primeira engine real: Revisão;
- Chromium e mobile básico.

### Gate 2 — confiabilidade

- Chromium e Firefox;
- paste representativo de Word e Google Docs;
- seleção, toolbar e listas;
- recuperação antes do autosave;
- preservação de conflito como cópia;
- drawers acessíveis;
- preview somente após gate verde.

### Gate 3 — Espelho de Voz

- `voice-engine.js` intacta e carregada por adaptador;
- aba `Voz` sem decorations inline;
- vazio, corpus curto, corpus médio, falha e obsolescência cobertos;
- resultado preservado quando apenas o autosave avança a revisão;
- Chromium e Firefox verdes.

Evidência: workflow `30315176567`, 15 cenários em cada navegador, 30 execuções.

### Gate 4 — Termos que pedem contexto

- `decolonial-engine.js` e `decolonial-data.json` intactos;
- base original fornecida ao carregamento assíncrono por adaptador;
- aba `Contexto` sem alterar ou marcar o manuscrito;
- linguagem não acusatória e decisão humana explícita;
- nomes de termos preservados integralmente no rail;
- Chromium e Firefox verdes.

Evidência: workflow `30316983906`, 21 cenários em cada navegador, 42 execuções.

### Gate 5 — RimaLab

- `rimalab-engine.js` e `rimalab-data.json` permanecem intactos;
- prosa e verso possuem contratos e apresentações diferentes;
- JSON Tiptap é convertido em fonte sonora sem alterar o documento;
- blocos vazios preservam fronteiras de estrofe;
- ausência de rima recebe retorno neutro;
- falha do RimaLab não quebra editor nem engines anteriores;
- nenhuma ação altera o manuscrito.

Evidência final histórica: workflow `30319966987`. A documentação do gate registrou 30 cenários por navegador; a auditoria agregada do Gate 6 mostrou que a suíte executável anterior já continha 31 por navegador.

### Gate 6 — contrato de posições

- snapshot criado diretamente de `editor.state.doc`;
- identidade do documento separada da assinatura estrutural;
- offsets declarados em unidades UTF-16;
- conversão de pontos e ranges entre texto derivado e posições ProseMirror;
- afinidade para separadores virtuais;
- ranges exclusivamente virtuais colapsam com segurança;
- títulos, listas, `hardBreak`, acentos, emoji e blocos vazios cobertos;
- consultas não alteram HTML, seleção, histórico ou manuscrito;
- nenhuma decoration criada;
- pipeline preserva o código de saída da compilação.

Evidência funcional: workflow `30323402744`, 40 cenários no Chromium e 40 no Firefox, 80 execuções.

### Gate 6.5 — estabilização visual e de experiência

- tokens semânticos para texto, superfície, controle, borda, foco, seleção, ação e futura análise;
- contraste explícito em papel e noite;
- toolbar agrupada, documentada e sem corte silencioso no desktop;
- estados ativo, inativo e desabilitado distinguíveis;
- grain, halftone, blueprint, bordas e sombras refinados;
- rails ajustados sem cortar a marca;
- biblioteca e ferramentas convertidas em drawers em até 1040 px;
- título móvel estabilizado entre Chromium e Firefox;
- troca de tema sem frames intermediários de baixo contraste;
- capturas revisadas em desktop, noite, 1024 px e mobile;
- Gates 1 a 6 novamente verdes.

Evidência funcional e visual: workflow `30327303435`, 45 cenários no Chromium e 45 no Firefox, 90 execuções, zero falhas e zero flakiness.

### Gate 6.75 — fusão visual Blueprint Tokon

- paleta da referência transplantada para tokens próprios;
- blueprint definido como ambiente e o manuscrito como objeto principal;
- canvas com ciano, pontos, diagonais e moldura técnica;
- biblioteca, registro e rail convertidos visualmente em papel técnico;
- folha central preservada como papel quente opaco;
- pauta reconstruída como tile de 48 px para impedir lavagem cromática;
- modo noite recebeu prancha azul profunda e papel técnico escuro;
- nenhuma alteração de DOM, layout, breakpoints, Tiptap, engines, persistência ou dados;
- skin dividida em tokens, aplicação e composição;
- cinco regressões visuais novas por navegador;
- todos os gates anteriores novamente aprovados.

Evidência funcional e visual: workflow `30333192558`, 50 cenários no Chromium e 50 no Firefox, 100 execuções.

Documentação detalhada:

- `docs/design/BLUEPRINT_THEME.md`;
- `docs/logs/2026-07-28-gate-6-75-blueprint-theme.md`;
- `../docs/product/MASS_NOTES_TIPTAP_GATE_6_75.md`.

### Gate 6.9 — auditoria editorial do contrato de posições

- seis corpora originais em português brasileiro: prosa/diálogo, ensaio, poesia, cordel, canção e Unicode;
- 39 ranges editoriais auditados por navegador;
- travessões, aspas curvas, acentos precompostos, acento combinante, emoji, ZWJ, bandeira e reticências cobertos;
- blockquote, lista numerada, lista aninhada, títulos, blocos vazios, estrofes e `hardBreak` cobertos;
- documento extenso com 180 parágrafos, 181 blocos e 23.940 unidades UTF-16;
- equivalência entre texto derivado e oráculo DOM autoral;
- round-trip, monotonicidade, afinidade e posições esperadas aprovados;
- HTML, seleção, assinatura, histórico e manuscrito preservados;
- `ProseMirror-trailingBreak` e `ProseMirror-separator` classificados como placeholders técnicos, não texto autoral;
- zero decorations;
- dependências Tiptap fixadas por overrides;
- `package-lock.json` versionado e CI convertido para `npm ci`.

Evidência detalhada: workflow `30357397681`. Evidência final reproduzível: workflow `30358030907`, 59 cenários por navegador, 118 execuções.

Documentação detalhada:

- `docs/logs/2026-07-28-gate-6-9-auditoria-posicoes-reais.md`;
- `docs/audits/GATE_6_9_POSITION_AUDIT.json`;
- `../docs/product/MASS_NOTES_TIPTAP_GATE_6_9.md`.

### Gate 7 — marcações somente de leitura da Revisão

- a engine inicial é exclusivamente a Revisão;
- ranges localizados são convertidos pelo contrato aprovado e projetados por plugin ProseMirror isolado;
- `documentId`, `contentSignature`, posição e fragmento precisam corresponder ao snapshot atual;
- posições ou fragmentos não verificáveis são descartados;
- qualquer edição ou troca de documento remove imediatamente leitura e marcações obsoletas;
- cada cartão localizado oferece navegação para o trecho exato sem editar o manuscrito;
- Unicode, emoji, `hardBreak` e ocorrências repetidas foram cobertos;
- decorations sobrepostas continuam navegáveis por ocorrência, sem usar a forma do DOM como contrato de produto;
- marcas podem ser ocultadas e restauradas no painel de Revisão sem apagar cartões, ranges ou leitura;
- nenhuma sugestão é aplicada e nenhum botão de correção automática foi criado;
- HTML, texto, assinatura estrutural, histórico e persistência permanecem intactos;
- a cor de análise permanece distinta da seleção e as marcas não recebem eventos de ponteiro;
- desktop e mobile foram validados em Chromium e Firefox;
- o halo cinza ao lado da folha foi removido sem eliminar a sombra gráfica seca;
- a preview usa assets estáveis, fallback visível e verificação do endereço público após a publicação.

Evidência final: workflow `30367072054`, 67 cenários por navegador, 134 execuções; build, Chromium, Firefox, publicação, limpeza de cache e smoke test público aprovados.

Documentação detalhada:

- `docs/logs/2026-07-28-gate-7-review-decorations.md`;
- `../docs/product/MASS_NOTES_TIPTAP_GATE_7.md`.

### Gate 8 — Anatomia do Livro integrada

- o original completo permanece em `anatomia-original.html`;
- `scripts/build-anatomia-runtime.py` gera o runtime leve e assets WebP durante a CI;
- a experiência abre dentro da aplicação sem desmontar o editor;
- o retorno preserva documento, título e estado;
- o guard contra eventos tardios do StPageFlip impede regressão do menu ao voltar do miolo para uma seção exterior;
- a branch de preview permanece produto de build e não recebe correções diretas;
- o workflow oficial é exclusivamente `.github/workflows/mass-notes-tiptap.yml`.

Evidência funcional: workflow `30409965734`, 73 cenários por navegador, 146 execuções; build, publicação, cache e verificação pública aprovados.

Documentação detalhada:

- `docs/logs/2026-07-28-gate-8-anatomia-do-livro.md`.

### Gate 9A — exportação estrutural mínima

- criada camada pura em `src/export/documentExport.ts`;
- criada interface isolada em `src/components/ExportPanel.tsx`;
- estilos ficam em `src/styles/export-panel.css`;
- TXT, Markdown e HTML são derivados diretamente do JSON Tiptap;
- títulos, parágrafos, `hardBreak`, negrito, itálico, sublinhado, tachado, links, citações e listas aninhadas são preservados conforme a capacidade de cada formato;
- HTML escapa conteúdo autoral e só preserva links `http`, `https`, `mailto` e `tel`;
- Markdown inclui frontmatter local com título, situação e tags;
- TXT mantém hierarquia legível sem carregar marcação HTML;
- nomes de arquivo são normalizados de forma segura;
- página vazia ainda exporta título e metadados;
- exportar não altera JSON, HTML do editor, texto, título, biblioteca, conflito ou persistência;
- painel validado em drawer móvel sem overflow horizontal;
- nenhuma engine, base linguística, Anatomia ou branch de preview foi alterada.

Evidência funcional: workflow `30415258895`, 80 cenários por navegador, 160 execuções; build, Chromium, Firefox, publicação, renovação de cache e verificação pública aprovados.

Documentação detalhada:

- `docs/logs/2026-07-28-gate-9-exportacao-estrutural.md`;
- `../docs/product/MASS_NOTES_TIPTAP_GATE_9.md`.

## Próximo lote proposto — Gate 9B: cópia nativa e restauração segura

O próximo passo lógico fecha a saída completa dos dados antes de novas engines ou formatos editoriais.

Escopo proposto:

1. definir um envelope versionado próprio do Mass Notes Next;
2. incluir todos os documentos com JSON Tiptap e metadados necessários;
3. exportar a cópia localmente sem dependência externa;
4. importar sem apagar ou substituir a biblioteca existente;
5. restaurar documentos como cópias quando houver colisão de identidade;
6. validar estrutura, versão e conteúdo antes de escrever no IndexedDB;
7. rejeitar arquivo corrompido sem alterar o estado atual;
8. cobrir Unicode, documentos vazios, listas, links, biblioteca grande e conflitos;
9. manter compatibilidade de leitura com `.esc` legado por adaptador separado, se o contrato puder ser preservado sem ambiguidade.

Fora do Gate 9B:

- DOCX, RTF e ePub;
- exportação múltipla por formato editorial;
- Obsidian em ZIP;
- sincronização em nuvem;
- File System Access automático;
- alteração do schema do editor sem migração explícita.

O Gate 9B não começa automaticamente. Antes de implementá-lo, o contrato do envelope, a política de colisão e a estratégia de compatibilidade com `.esc` precisam ser registrados no menor patch possível.

## Fora dos próximos gates

- aplicação automática de sugestões;
- correção em massa;
- tooltips dentro do editor;
- áudio ou leitura em voz alta;
- paginação física;
- service worker;
- Tauri/SQLite;
- promoção para `main`.
