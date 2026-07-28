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

- `rimalab-engine.js` e `rimalab-data.json` permanecem intactos;
- prosa e verso possuem contratos e apresentações diferentes;
- JSON Tiptap é convertido em fonte sonora sem alterar o documento;
- blocos vazios preservam fronteiras de estrofe;
- ausência de rima recebe retorno neutro;
- nota sobre sinalefa, dicção regional e intenção musical permanece visível;
- falha do RimaLab não quebra editor nem engines anteriores;
- seis abas cabem em grade 3 × 2;
- nenhuma ação altera o manuscrito.

Evidência final: workflow `30319966987`, 30 cenários em cada navegador, 60 execuções.

## Lote atual — Gate 6: contrato de posições

Autorizado explicitamente pelo mantenedor em 2026-07-28.

Objetivo: criar um contrato comum, puro e reversível entre texto derivado, offsets de resultados linguísticos e posições ProseMirror, ainda sem mostrar decorations ou oferecer aplicação automática.

### Escopo autorizado

1. gerar snapshot textual diretamente do documento ProseMirror real;
2. identificar documento e conteúdo estrutural sem depender da revisão de autosave;
3. declarar offsets como unidades UTF-16, compatíveis com strings JavaScript e posições internas do ProseMirror;
4. mapear offset textual para posição ProseMirror com afinidade anterior ou posterior;
5. mapear posição ProseMirror para offset textual;
6. mapear intervalos nos dois sentidos;
7. preservar títulos, parágrafos, listas, citações, `hardBreak` e blocos vazios;
8. tratar separadores derivados sem fingir que eles existem como texto editável;
9. cobrir acentos, emoji, listas, títulos, quebras, documento vazio e troca de documento;
10. provar que consultas ao contrato não alteram HTML, seleção ou manuscrito;
11. executar Chromium e Firefox;
12. atualizar preview somente após gate verde;
13. manter plano, memória, changelog, log e documentação global sincronizados.

### Contratos obrigatórios

- JSON/Node ProseMirror continua sendo a fonte estrutural de autoridade;
- `document.revision` não identifica conteúdo semântico;
- a assinatura estrutural muda quando a estrutura muda, mesmo com o mesmo texto;
- offsets usam unidades de código UTF-16, não contagem visual de caracteres;
- separadores de blocos recebem afinidade explícita;
- ranges compostos apenas por separadores colapsam com segurança;
- nenhuma API de mapeamento altera editor, seleção ou histórico;
- nenhuma marcação visual aparece neste gate.

### Critérios de parada

Interromper o lote em caso de:

- mapeamento não monotônico;
- perda de correspondência em acentos ou emoji;
- assinatura igual para estruturas diferentes;
- alteração do manuscrito durante consulta;
- criação involuntária de decorations;
- regressão P0/P1 em qualquer gate anterior;
- divergência entre Chromium e Firefox.

## Fora do Gate 6

- decorations inline visíveis;
- sublinhados, highlights ou tooltips ancorados;
- substituição automática;
- aplicação de sugestões;
- áudio ou leitura em voz alta;
- paginação física;
- service worker;
- Tauri/SQLite;
- promoção para `main`.

## Sequência posterior planejada

1. Gate 6 — contrato de posições sem marcações;
2. revisão manual e auditoria de offsets com textos reais;
3. decorations ProseMirror em gate próprio;
4. PWA/offline em nova sessão;
5. avaliação de promoção arquitetural.

O gate de decorations só começa após o contrato de posições ficar verde e receber avaliação ou autorização explícita.