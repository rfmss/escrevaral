# Gate 6.5 — estabilização visual do Mass Notes Tiptap

## Situação

**Aprovado para avaliação manual e continuidade experimental em 2026-07-28.**

- branch: `experiment/mass-notes-tiptap`;
- pull request: `#155` (rascunho);
- workflow final: `30327303435`;
- matriz: 45 cenários em Chromium e 45 em Firefox;
- total: 90 execuções, sem falha e sem flakiness;
- preview: branch `preview-mass-notes-tiptap`;
- aplicação pública, `main`, service worker, engines, bases e schema Tiptap: não alterados.

Esta aprovação não autoriza merge, lançamento, decorations, marcações inline ou alteração automática do manuscrito.

## Motivação

A captura real em 1366 px mostrou que a identidade visual já era reconhecível, mas a execução dificultava a leitura:

- textos quase invisíveis no modo noite;
- controles habilitados parecendo desabilitados;
- toolbar apertada e parcialmente cortada;
- editor comprimido por dois rails;
- excesso de bordas, linhas e caixas;
- pouca separação entre seleção, ação e futura análise.

A decisão foi realizar um refinamento, não um redesign.

## Identidade preservada

- oficina de escrita brasileira;
- papel e pautas;
- azul técnico;
- vermelho de impacto;
- laranja de seleção;
- documentos numerados;
- biblioteca, página central e rail contextual;
- marca Escrevaral;
- linguagem editorial própria.

## Mudanças aprovadas

### Tokens semânticos

Foram definidos papéis separados para:

- canvas;
- painel e painel forte;
- controle e hover;
- texto primário, secundário e silencioso;
- borda e borda suave;
- ativo e texto sobre ativo;
- desabilitado;
- foco;
- seleção;
- ação;
- futura análise linguística.

Papel e noite possuem valores próprios.

### Contraste

- tabs, biblioteca, ações, atalhos e conteúdo receberam cores explícitas;
- controles habilitados e desabilitados são distinguíveis sem depender apenas de opacidade;
- conteúdo autoral possui contraste alto;
- a troca de tema não anima cores, evitando frames intermediários de baixo contraste.

### Toolbar

- controles organizados em grupos;
- abreviações receberam `title` e nomes de grupo;
- desktop usa quebra de linha quando necessário;
- rolagem horizontal permanece somente no mobile;
- estados ativos e desabilitados possuem linguagem própria.

### Layout

- rails foram estreitados com proteção da marca;
- a página recebeu menos ruído e bordas mais leves;
- em até 1040 px, biblioteca e ferramentas viram drawers;
- o manuscrito passa a ocupar a área principal inteira;
- acionadores ficam abaixo do drawer aberto, mas permanecem montados para devolução de foco.

### Mobile

- padding do papel e escala do título foram estabilizados;
- métricas diferentes de fonte em Chromium e Firefox são cobertas;
- ausência de overflow é verificada em 430, 390 e 320 px.

## Matriz do Gate 6.5

Cinco cenários novos por navegador:

1. contraste no modo noite;
2. toolbar completa em 1366 px;
3. manuscrito e drawers em 1024 px;
4. breakpoints e marca sem corte;
5. estados ativo, inativo e desabilitado.

Todos os Gates 1 a 6 são executados novamente no mesmo workflow.

## Incidentes relevantes

### Cascata móvel

Uma regra de 1280 px sobrescreveu o padding móvel e voltou a cortar o título.

**Decisão:** criar correção móvel explícita e preservar o teste existente.

### Métrica do Firefox

Firefox manteve overflow subpixel quando Chromium já passava.

**Decisão:** aumentar a folga tipográfica, não relaxar o teste.

### Medição da marca

`scrollWidth` do bloco não representava precisamente a caixa do texto.

**Decisão:** medir o conteúdo renderizado com `Range` e manter respiro real até a divisória.

### Drawer em movimento

A primeira captura de 1024 px ocorreu antes do fim da transição.

**Decisão:** aguardar a posição geométrica final antes de produzir evidência.

### Contraste durante a animação

Firefox capturou controles no meio da transição de tema, com contraste insuficiente.

**Decisão:** remover transições cromáticas. A interface precisa ser legível em todos os frames.

## Evidências finais

- workflow: `30327303435`;
- commit funcional: `2031f51349f8355b2a847eb49a9c540c55b27674`;
- Chromium: 45/45;
- Firefox: 45/45;
- total: 90/90;
- falhas: zero;
- flakiness: zero;
- preview publicada após gate verde;
- capturas de papel, noite, 1024 px e mobile incluídas no artefato.

Log detalhado: `mass-notes-next/docs/logs/2026-07-28-gate-6-5-estabilizacao-visual.md`.

## Próxima decisão

O próximo lote é a auditoria manual do contrato de posições com textos brasileiros reais e estruturas complexas.

Decorations continuam bloqueadas. Um gate posterior poderá testar uma única engine com marcações somente de leitura, desde que `documentId`, `contentSignature`, offsets UTF-16, obsolescência e navegação acessível sejam comprovados novamente.
