# Plano vivo — Mass Notes Next

Atualizado em: 2026-07-28

## Norte do produto

Construir uma oficina de escrita feita para português brasileiro, preservando as engines e a identidade do Escrevaral sobre infraestrutura consolidada de edição.

O diferencial do produto não é fabricar cursor, seleção ou histórico. É oferecer leitura linguística local, fluxo de escrita e repertório brasileiro.

## Fundação atual

- React + TypeScript + Vite;
- Tiptap / ProseMirror;
- IndexedDB por `idb`;
- revisão condicional e conflito entre abas;
- engines legadas por adaptadores;
- contrato comum de posições textuais;
- primeira decoration ProseMirror somente de leitura;
- tokens visuais semânticos;
- skin Blueprint Tokon isolada e reversível;
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

Evidência final: workflow `30367072054`, 67 cenários por navegador, 134 execuções, zero falhas, zero flakiness; build, Chromium, Firefox, publicação, limpeza de cache e smoke test público aprovados.

Documentação detalhada:

- `docs/logs/2026-07-28-gate-7-review-decorations.md`;
- `../docs/product/MASS_NOTES_TIPTAP_GATE_7.md`.

## Lote atual — avaliação manual do Gate 7

Nenhum novo gate começa automaticamente. O próximo passo é avaliação manual na preview isolada:

1. abrir a preview e confirmar que a oficina carrega, sem tela branca;
2. colar ou escrever um texto representativo em português brasileiro;
3. executar Revisão e conferir se as marcas apontam para os trechos corretos;
4. usar “Ir ao trecho” em ocorrências simples e repetidas;
5. ocultar e restaurar as marcas sem perder a lista de observações;
6. editar o texto e confirmar que a leitura antiga desaparece;
7. conferir papel e noite, desktop e mobile;
8. avaliar densidade visual e sobreposição em textos com muitas ocorrências;
9. registrar qualquer falha P0/P1 antes de autorizar ampliação.

Sem falha bloqueadora e somente após autorização explícita, o lote seguinte poderá ser proposto. A integração de novas engines com decorations, aplicação de sugestões ou promoção para `main` não está autorizada por este gate.

## Fora dos próximos gates

- aplicação automática de sugestões;
- correção em massa;
- tooltips dentro do editor;
- áudio ou leitura em voz alta;
- paginação física;
- service worker;
- Tauri/SQLite;
- promoção para `main`.
