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
- tokens visuais semânticos;
- skin Blueprint Tokon isolada e reversível;
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

## Lote atual — auditoria manual do contrato de posições

Nenhuma decoration será criada neste lote.

Objetivo: auditar o contrato aprovado com textos brasileiros reais e estruturas mais complexas antes de permitir marcações dentro do editor.

Plano:

1. montar corpus de prosa, ensaio, diálogo, poesia, cordel e letra;
2. incluir emoji, acentos precompostos, acentos combinantes, travessões, aspas e pontuação brasileira;
3. experimentar listas aninhadas, citações, títulos consecutivos, `hardBreak` e múltiplos blocos vazios;
4. gerar ranges conhecidos no texto derivado;
5. converter para ProseMirror e confirmar o trecho textual correspondente;
6. testar round-trip nos dois sentidos;
7. testar início e fim de bloco com afinidade `backward` e `forward`;
8. incluir documentos extensos;
9. registrar ambiguidades, P0 e P1;
10. manter HTML, seleção, histórico e manuscrito intactos;
11. não mostrar sublinhados, highlights ou tooltips;
12. não oferecer substituição automática;
13. atualizar documentação e evidências antes de decidir o próximo gate.

Critérios de parada:

- qualquer range aponta para texto diferente do esperado;
- comportamento diverge entre Chromium e Firefox;
- consulta altera seleção, HTML ou histórico;
- estrutura válida precisa ser descartada para o teste passar;
- offset não declara claramente UTF-16.

## Gate posterior proposto — decorations ProseMirror

Somente após a auditoria manual e nova autorização explícita.

Escopo preliminar:

- uma única engine inicial;
- plugin ProseMirror isolado;
- decorations somente de leitura;
- identidade de documento e assinatura verificadas;
- descarte de ranges obsoletos;
- navegação acessível entre issue e trecho;
- nenhuma substituição automática;
- Chromium e Firefox;
- documentação e log próprios.

## Fora dos próximos gates

- aplicação automática de sugestões;
- correção em massa;
- áudio ou leitura em voz alta;
- paginação física;
- service worker;
- Tauri/SQLite;
- promoção para `main`.