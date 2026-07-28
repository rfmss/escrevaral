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

Aprovado funcionalmente em Chromium e Firefox:

- snapshot criado diretamente de `editor.state.doc`;
- identidade do documento separada da assinatura estrutural;
- assinatura baseada no JSON estrutural, não em `revision` ou apenas no texto;
- offsets declarados em unidades UTF-16;
- conversão de pontos e ranges entre texto derivado e posições ProseMirror;
- afinidade `backward` e `forward` para separadores virtuais;
- ranges exclusivamente virtuais colapsam com segurança;
- títulos, parágrafos, listas, `hardBreak`, acentos, emoji e blocos vazios cobertos;
- parágrafo vazio final do Tiptap preservado como estrutura válida;
- consultas não alteram HTML, seleção, histórico ou manuscrito;
- nenhuma decoration, marcação ou ação automática criada;
- build falho não pode mais ser mascarado por `tee` no workflow.

Evidência funcional: workflow `30323402744`, 40 cenários no Chromium e 40 no Firefox, 80 execuções.

## Lote atual — revisão manual do contrato de posições

Antes de iniciar decorations:

1. auditar offsets com textos reais extensos;
2. incluir combinações de emoji, acentos combinantes e pontuação;
3. experimentar listas aninhadas, citações e múltiplos blocos vazios;
4. comparar ranges devolvidos pelas engines com o trecho textual esperado;
5. confirmar afinidade em início e fim de bloco;
6. registrar qualquer mapeamento ambíguo ou P0/P1;
7. não mostrar sublinhados, highlights ou tooltips ainda;
8. não oferecer substituição automática.

## Próximo lote proposto — decorations ProseMirror

Somente após revisão manual ou nova autorização explícita.

Objetivo previsto: usar o contrato aprovado para apresentar issues linguísticas ancoradas no editor, começando por uma única engine e mantendo leitura, edição e desfazer intactos.

Escopo preliminar:

- plugin ProseMirror isolado;
- decorations somente de leitura;
- identidade de documento e assinatura verificadas antes de aplicar;
- descarte de ranges obsoletos;
- navegação acessível entre issue e trecho;
- nenhuma substituição automática;
- Chromium e Firefox;
- documentação e log próprios.

## Fora do próximo gate

- aplicação automática de sugestões;
- correção em massa;
- áudio ou leitura em voz alta;
- paginação física;
- service worker;
- Tauri/SQLite;
- promoção para `main`.

## Sequência posterior planejada

1. revisão manual do Gate 6;
2. decorations ProseMirror em gate próprio;
3. PWA/offline em nova sessão;
4. avaliação de promoção arquitetural.

O gate de decorations só começa após revisão manual ou autorização explícita do mantenedor.