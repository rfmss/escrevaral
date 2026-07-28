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

## Lote atual — Gate 6.5: estabilização visual e de experiência

Autorizado em 2026-07-28.

Objetivo: refinar a interface existente antes de qualquer decoration, preservando a identidade editorial e melhorando leitura, hierarquia, contraste, toolbar e responsividade.

Escopo:

1. criar tokens semânticos de texto, superfície, controle, foco e seleção;
2. corrigir contraste do modo noite em abas, toolbar, biblioteca, ações e atalhos;
3. impedir que controles habilitados pareçam desabilitados;
4. reorganizar a toolbar para não ficar cortada no desktop;
5. preservar nomes acessíveis e adicionar ajuda às abreviações;
6. reduzir densidade de linhas e caixas sem apagar a estética de caderno;
7. ajustar larguras dos rails;
8. transformar biblioteca e ferramentas em drawers a partir de 1024 px;
9. manter seleção distinta de análise, alerta e erro;
10. executar toda a matriz anterior em Chromium e Firefox;
11. revisar capturas reais antes de fechar.

Não autoriza:

- decorations, sublinhados, highlights ou tooltips;
- alteração das engines, bases ou schema Tiptap;
- aplicação automática;
- service worker, Tauri, SQLite, DOCX ou paginação física;
- promoção para `main`.

Critérios completos: `docs/logs/2026-07-28-gate-6-5-estabilizacao-visual.md`.

## Próximo lote proposto — auditoria manual de offsets

Somente depois do Gate 6.5 verde.

Antes de iniciar decorations:

1. auditar offsets com textos reais extensos;
2. incluir emoji, acentos combinantes e pontuação;
3. experimentar listas aninhadas, citações e múltiplos blocos vazios;
4. comparar ranges das engines com o trecho esperado;
5. registrar qualquer mapeamento ambíguo ou P0/P1;
6. não mostrar sublinhados, highlights ou tooltips;
7. não oferecer substituição automática.

## Gate posterior proposto — decorations ProseMirror

Somente após revisão manual ou nova autorização explícita.

Escopo preliminar:

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
