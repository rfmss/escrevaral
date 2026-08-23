# Log — Gate 6: contrato de posições

Data: 2026-07-28
Estado: aprovado para avaliação manual
Branch: `experiment/mass-notes-tiptap`
PR: `#155` (rascunho)

## Escopo confirmado

Criar infraestrutura de mapeamento entre texto derivado e posições ProseMirror sem exibir decorations, aplicar sugestões ou alterar o manuscrito.

Não alterar:

- engines originais;
- bases linguísticas;
- schema Tiptap;
- aplicação pública;
- `main`;
- service worker;
- comportamento visual do editor.

## Contrato implementado

O snapshot contém:

- versão do contrato;
- `documentId`;
- assinatura estrutural do JSON Tiptap;
- codificação de offsets `utf-16`;
- texto derivado;
- tamanho do documento ProseMirror;
- blocos textuais;
- segmentos de texto, `hardBreak`, átomos e separadores virtuais.

A API oferece:

- offset textual → posição ProseMirror;
- posição ProseMirror → offset textual;
- range textual → range ProseMirror;
- range ProseMirror → range textual;
- afinidade `backward` ou `forward` em separadores;
- clamp defensivo;
- colapso seguro de ranges exclusivamente virtuais.

## Decisões finais

1. O snapshot nasce do `editor.state.doc`, não de HTML reparseado.
2. Offsets textuais são unidades UTF-16, como strings JavaScript e nós textuais do ProseMirror.
3. Texto derivado usa dois `\n` entre blocos e um `\n` para `hardBreak`.
4. Separadores são segmentos virtuais, não texto editável literal.
5. Blocos vazios mantêm âncora própria.
6. O parágrafo vazio final criado pelo Tiptap depois de lista ou título é estrutura válida.
7. A assinatura usa JSON estrutural estável e independe de `revision`.
8. `documentId` e assinatura estrutural cumprem papéis diferentes.
9. Ranges apenas de separadores colapsam em fronteira segura.
10. Consultas são puras e não disparam transações.
11. A API anexada à instância DOM existe para QA e integração interna; não autoriza engines a manipular DOM.
12. Nenhuma marcação visual foi criada.

## Implementação

- criado `src/editor/textPositionContract.ts`;
- contrato publicado em `onCreate` e `onUpdate` da instância Tiptap;
- callback opcional preparado para consumo futuro pela shell;
- API somente-leitura anexada ao nó `.ProseMirror` atual;
- assinatura FNV-1a sobre serialização estrutural determinística;
- suporte a títulos, parágrafos, citações, listas, `hardBreak`, átomos e vazios;
- nove cenários novos adicionados em `tests/gate6-position-contract.spec.ts`;
- `build.log` incluído no artefato do workflow;
- `set -o pipefail` adicionado antes do pipeline com `tee`.

## Incidentes

### Tipagem estrita da assinatura

As primeiras compilações rejeitaram a possibilidade de `JSON.stringify()` devolver `undefined`.

**Decisão:** a serialização estrutural normaliza esse caso para `null`, mantendo saída determinística.

### Callback `onDestroy`

A primeira integração presumiu que o `onDestroy` do Tiptap 3 recebia `{ editor }`. Nesta versão, o callback não fornece esse objeto.

**Decisão:** remover o cleanup. A propriedade de integração pertence ao próprio nó DOM, que é descartado com a instância.

### Build mascarado por `tee`

Ao registrar `build.log`, o pipeline `npm run build | tee build.log` retornou o código de `tee`, não o da compilação. Os testes abriram uma preview sem `dist` e receberam 404.

**Decisão:** usar `set -o pipefail`. Um build falho volta a interromper o job e a preview permanece bloqueada.

### Parágrafo vazio final

O auditor esperava que lista e título terminassem sem bloco posterior. O Tiptap mantém um parágrafo vazio final para continuidade da escrita.

**Decisão:** preservar o bloco e corrigir o teste. O texto visível permanece igual, mas a estrutura derivada inclui o separador final.

### Contagem histórica

A documentação do Gate 5 registrava 30 cenários por navegador. O relatório agregado mostrou que a suíte executável anterior já continha 31.

**Decisão:** usar a contagem do relatório como fonte de verdade: nove cenários novos elevaram o total a 40 por navegador e 80 execuções.

## Execuções

### Tentativas de compilação

- workflow `30321691059`: falha de TypeScript; preview bloqueada;
- workflow `30321832721`: falha de TypeScript; preview bloqueada.

### Diagnóstico de pipeline

- workflow `30322096821`;
- build falho mascarado por `tee`;
- testes executados contra página 404;
- artefato e `build.log` revelaram a causa;
- preview bloqueada.

### Primeira matriz real

- workflow `30323028371`;
- build aprovado;
- 76 de 80 execuções aprovadas;
- quatro falhas: duas premissas repetidas em Chromium e Firefox sobre parágrafo vazio final;
- contrato preservado; auditor corrigido;
- preview bloqueada.

### Matriz funcional verde

- commit funcional: `59d83c82056db14d898c9a9ca9276807607caeb3`;
- workflow: `30323402744`;
- TypeScript/Vite: aprovado;
- Chromium: 40 de 40 cenários aprovados;
- Firefox: 40 de 40 cenários aprovados;
- total: 80 execuções;
- gates anteriores: aprovados novamente;
- HTML e seleção: preservados;
- decorations: zero;
- preview: publicada após gate verde;
- artefato: relatório Playwright, traces de falha quando existentes e `build.log`.

## Matriz do Gate 6

1. documento vazio com âncora estável;
2. acentos e emoji em UTF-16 com round-trip;
3. afinidade em separador e colapso de range virtual;
4. `hardBreak` com largura unitária;
5. títulos e listas monotônicos através de wrappers;
6. bloco vazio entre separadores consecutivos;
7. assinatura muda quando o mesmo texto ganha outra estrutura;
8. identidade de documento separada da assinatura de conteúdo;
9. clamp, ranges invertidos e pureza de consulta.

## Limites

Ainda não foram aprovados:

- auditoria ampla com textos reais, Unicode combinante e listas profundamente aninhadas;
- decorations inline;
- navegação acessível entre issue e trecho;
- aplicação automática;
- service worker e abertura offline em nova sessão;
- promoção para a aplicação pública.

## Decisão final

**Gate 6 aprovado para avaliação manual e continuidade experimental.**

A aprovação não autoriza decorations, sublinhados, highlights, tooltips ancorados, substituição automática, merge ou publicação pública. O próximo lote permanece bloqueado até revisão manual ou nova autorização explícita.