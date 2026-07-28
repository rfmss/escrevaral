# Plano vivo — Mass Notes Next

Atualizado em: 2026-07-27

## Norte do produto

Construir uma oficina de escrita feita para português brasileiro, preservando as engines e a identidade do Escrevaral sobre infraestrutura consolidada de edição.

O diferencial do produto não é fabricar cursor, seleção ou histórico. É oferecer leitura linguística local, fluxo de escrita e repertório brasileiro.

## Fundação atual

- React + TypeScript + Vite;
- Tiptap / ProseMirror;
- IndexedDB por `idb`;
- revisão condicional e conflito entre abas;
- engines legadas por adaptadores;
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
- termo, categoria, motivo, contexto, alternativas e contagem apresentados;
- linguagem não acusatória e decisão humana explícita;
- vazio, ausência de termos, múltiplas ocorrências, invalidação e falha cobertos;
- nomes de termos preservados integralmente no rail;
- Chromium e Firefox verdes.

Evidência: workflow `30316983906`, 21 cenários em cada navegador, 42 execuções.

### Gate 5 — RimaLab

Aprovado funcionalmente em Chromium e Firefox:

- `rimalab-engine.js` e `rimalab-data.json` permanecem intactos;
- engine e base são carregadas por adaptador tipado e ponte temporária de `fetch`;
- prosa e verso possuem contratos e apresentações diferentes;
- JSON Tiptap é convertido em fonte sonora sem alterar o documento;
- blocos vazios preservam fronteiras de estrofe;
- prosa apresenta ecos internos sem falsa escansão;
- verso apresenta resumo, metro dominante, variação, esquema, estrofes, escansão e pares percebidos;
- ausência de rima recebe retorno neutro;
- nota sobre sinalefa, dicção regional e intenção musical permanece visível;
- resultados são invalidados somente após mudança de documento ou conteúdo;
- falha do RimaLab não quebra editor nem engines anteriores;
- seis abas cabem em grade 3 × 2 no desktop e mobile;
- nenhuma ação altera o manuscrito.

Evidência funcional: workflow `30319511220`, 30 cenários em cada navegador, 60 execuções.

## Lote atual — revisão manual do Gate 5

Antes de iniciar positions/decorations:

1. experimentar prosa, poesia, cordel, repente, letra de música e verso livre;
2. comparar a escansão com leitura humana e variações regionais;
3. observar falsos pares de rima e omissões úteis;
4. confirmar que prosa poética recebe linguagem adequada;
5. avaliar legibilidade de textos com 20 ou mais versos;
6. testar rail e rolagem em desktop e mobile;
7. registrar qualquer P0/P1;
8. não iniciar marcação inline nem aplicação automática.

## Próximo lote proposto — contrato de posições

Somente após a revisão manual ou nova autorização explícita.

Objetivo previsto: criar um contrato comum entre texto derivado, posições ProseMirror e resultados das engines, ainda sem aplicar decorations automaticamente.

Escopo preliminar:

- snapshot textual com mapeamento de offsets;
- identificação estável de documento e conteúdo;
- conversão segura entre offsets de texto e posições ProseMirror;
- casos com acentos, emoji, listas, títulos e quebras;
- nenhuma alteração automática;
- Chromium e Firefox;
- documentação e log próprios.

## Fora do próximo lote

- decorations inline já visíveis;
- substituição automática;
- áudio ou leitura em voz alta;
- paginação física;
- service worker;
- Tauri/SQLite;
- promoção para `main`.

## Sequência posterior planejada

1. revisão manual do Gate 5;
2. contrato de posições para issues linguísticas;
3. decorations ProseMirror;
4. PWA/offline em nova sessão;
5. avaliação de promoção arquitetural.

O próximo gate só começa após revisão manual ou autorização explícita do mantenedor.