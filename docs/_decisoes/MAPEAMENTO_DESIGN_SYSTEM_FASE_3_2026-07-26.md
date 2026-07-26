# Mapeamento do Design System — Fase 3

Data: 2026-07-26

Estado: relatório para aprovação. Nenhuma correção visual ou comportamental foi aplicada nesta fase.

## 1. Escopo e baseline

Este documento mapeia as telas Editor, Arquivo/Acervo, Oficina/Ateliê, Palavras, Rimas, Vocabulário, Leituras, Prática, Autoria e painel linguístico contra o Design System já aprovado para Alvorada e Vereda.

A leitura estática foi feita sobre a `main` no commit `8176130650bd3c55639e72605ac2ca3ac862e36a`, com duas correções já autorizadas tratadas como baseline futuro:

- Tarefa 1: em Vereda, `text-muted` deve usar o resultado do PR #134, correspondente ao valor físico temporário `--muted: #b7a996`;
- Tarefa 2: `cerrado-dark`, `mata-dark` e `amazonia-dark` são considerados removidos conforme o PR #135 e não aparecem como dívida desta fase.

Os dois PRs continuam em rascunho e sem merge. Antes da implementação da Fase 4, a branch de cada correção deverá partir da `main` já atualizada e preservar versionamento de cache estritamente crescente.

Este relatório não reabre a definição dos tokens aprovados. Quando o CSS ainda usa nomes físicos legados, a equivalência funcional é:

| Papel aprovado | Nome físico predominante hoje |
| --- | --- |
| `surface-canvas` | `--paper` ou fundo raiz, exceto Objeto Livro |
| `surface-secondary` | `--surface-low` |
| `surface-input` | fundos de `input`, `textarea` e `select`, hoje dispersos |
| `surface-disabled` | fundos e opacidades de estados desabilitados, hoje dispersos |
| `surface-callout` | `--tip-bg` ou misturas locais |
| `text-primary` | `--ink` |
| `text-secondary` | `--soft-ink` |
| `text-muted` | `--muted` |
| `text-callout` | `--tip-ink` |
| `text-on-accent` | `--on-primary` |
| `accent-primary` | `--primary` |
| `border-subtle` | parte dos usos de `--line` |
| `border-default` | parte dos usos de `--line` e bordas literais |
| `overlay-scrim` | `--overlay-bg` e variantes locais |
| `font-interface` | `--argila-font-ui` e famílias sans dispersas |
| `font-editorial` | `--argila-font-reading`, `--ff-serif` e famílias serifadas dispersas |

A substituição final deve usar os nomes e valores do documento de tokens aprovado, não apenas renomear automaticamente os aliases acima.

## 2. Método e limites

Foram inspecionados:

- `index.html`, para identificar raízes, componentes e estados de cada tela;
- 35 arquivos CSS distribuídos entre base, tema, responsividade, refinamentos e páginas editoriais;
- controllers que renderizam ou formatam a interface;
- ocorrências de tokens, cores literais, famílias tipográficas, tamanhos, espaçamentos, componentes de botão, formulários, estatísticas, avisos, breakpoints e formatação numérica.

O inventário automático foi revisado manualmente. Correspondências por substring que geravam falso positivo foram descartadas; por exemplo, “rima” dentro de `primary`. As telas menores foram remapeadas por prefixos reais como `.rimalab-*`, `.decolonial-*`, `.training-*`, `.proof-*`, `.precision-*` e `.syntax-*`.

Limites deliberados:

- não há auditoria funcional de engines de linguagem neste documento;
- referências a `grammar-controller.js` e `syntax-controller.js` dizem respeito apenas à camada de apresentação;
- valores do Objeto Livro aprovados como invariáveis não são classificados como dívida;
- a existência de um literal não implica defeito por si só: somente os que duplicam ou contradizem papéis aprovados são candidatos de migração;
- nenhum arquivo foi corrigido nesta fase.

## 3. Resultado sistêmico

A dívida não está isolada em uma tela. Ela nasce da sobreposição de quatro camadas:

1. tokens físicos antigos em `css/00-tokens.css`;
2. fundação Argila em `css/15-brand-argila.css`;
3. estilos funcionais mais antigos por módulo;
4. refinamentos recentes em arquivos `20-*`, `21-*` e `22-*`.

Isso produz um sistema visual que funciona, mas no qual a origem de uma decisão depende da ordem de carregamento. A Fase 4 deve consolidar por componente e tela, sem mover arquivos por estética e sem alterar comportamento.

### 3.1 Cor

Alvorada já concentra sua base em `css/15-brand-argila.css`, mas ainda coexistem vários acentos próximos:

- `#9c5f44` — barro principal;
- `#7a4a35` — barro profundo;
- `#c07830` e variações — dourado/ocre funcional;
- `#c97d32`, `#8c5a20` e variações — acentos de Vereda e do papel fixo.

A divergência não deve ser resolvida escolhendo um hex por proximidade. Cada uso deve ser classificado como `accent-primary`, aviso, estado destrutivo, categoria funcional ou exceção do Objeto Livro.

### 3.2 Tipografia

A fundação Argila define corretamente uma família de interface e uma editorial, mas um seletor global aplica fonte editorial a `h1`, `h2` e `h3` de todas as views. Assim, títulos de telas, painéis, formulários e ferramentas herdam a mesma lógica tipográfica do manuscrito.

Regra para a Fase 4:

- controles, títulos de telas, tabs, painéis, métricas, rótulos, hints e mensagens: `font-interface`;
- manuscrito, amostra de leitura e conteúdo central editorial: `font-editorial`;
- o fato de um texto ser grande ou ser um `h2` não o torna editorial.

### 3.3 Espaçamento

A escala Argila física já contém 4, 8, 12, 16, 24, 32, 48, 72 e 96 px. Porém, os módulos ainda usam muitos valores intermediários: 5, 6, 7, 10, 11, 14, 18, 20, 22, 26, 28, 34, 40 e 46 px.

Nem todo valor intermediário deve ser apagado. Devem ser preservadas medidas funcionais de papel, área de toque, largura editorial e geometria de componentes. Margens, gaps e paddings comuns devem migrar para o passo equivalente da escala aprovada.

### 3.4 Botões

Hoje coexistem:

- `.primary-button` e `.create-button`;
- `.secondary-button`;
- `.ghost-button`;
- `.icon-button`;
- `.fmt-btn` e `.editor-view-btn`;
- `.academy-banner-action`;
- labels de tab que se comportam como botões;
- botões destrutivos e quick actions locais.

A adoção de `ActionButton` deve unificar altura, padding, tipografia, foco, hover, ativo, desabilitado e semântica visual. Ela não exige trocar a marcação de tabs, resizers ou chips por botões quando esses componentes têm papéis diferentes.

### 3.5 Estatísticas

As três metáforas observadas continuam presentes:

- pill/badge;
- barra/progresso;
- bloco métrico.

`TextStatistic` deve receber contagens, percentuais, tempos e medidas curtas. Listas, tags, palavras, chips sintáticos e classificações qualitativas não devem ser convertidos em estatísticas só por conterem números.

### 3.6 Formulários

A fundação Argila normaliza parte de `input`, `textarea` e `select`, mas os módulos substituem fundo, borda, foco, padding, radius e placeholder. O resultado varia principalmente dentro do papel fixo de Autoria e Editor.

A Fase 4 deve aplicar `surface-input`, `surface-disabled`, `border-default`, estados de foco e tokens de placeholder de forma contextual. No Objeto Livro, o campo continua dentro de uma folha clara, mas seus controles não precisam repetir hex e RGBA locais.

### 3.7 Formatação numérica

Há uso correto de `toLocaleString("pt-BR")` em partes de `app.js`, `archive-controller.js`, `backup-controller.js`, `export-engine.js` e `version-engine.js`. Há também números interpolados sem formatação, especialmente em métricas de Autoria e contagens de ferramentas.

A implementação deve usar uma instância compartilhada de `Intl.NumberFormat('pt-BR')` ou helper equivalente, sem mudar o valor armazenado. Datas continuam com formatador de data adequado; não devem ser forçadas pelo formatador numérico.

### 3.8 Avisos globais

Existem banners de fluxo real:

- `.tab-conflict-banner`;
- `.backup-nudge-banner`;
- `.storage-recovery-banner`;
- `.update-banner`.

Existem toasts independentes:

- `#save-hint-toast`;
- `#academia-hint-toast`;
- `#delete-undo-toast`;
- `.reader-hint-toast`;
- `.pomodoro-done-toast`.

`css/18-editor-status-layout.css` impede parte da sobreposição ao fazer banners ocuparem altura real, mas não impõe fila, prioridade ou toast único. A Fase 4 deve aplicar a regra aprovada de um toast por vez e a escala comum de z-index. Callouts locais, como aviso de backup, dica ENEM ou nota crítica, permanecem dentro do fluxo e não entram na fila de toast.

### 3.9 Responsividade

Há breakpoints em 390, 480, 560, 580, 599, 600, 680, 768, 820, 821, 900 e 980 px, além de condições por altura e orientação. A fragmentação torna difícil prever quando sidebar, guia, painel direito e conteúdo central caberão juntos.

A prioridade da Fase 4 é aplicar o contrato de layout aprovado:

- impedir três colunas auxiliares simultâneas quando a largura útil não comportar;
- manter apenas uma superfície auxiliar aberta por vez no intervalo crítico;
- converter painéis secundários em overlay/drawer no breakpoint aprovado;
- preservar área de escrita, foco e funcionamento por teclado;
- não alterar rotas ou estado persistido para resolver layout.

### 3.10 Z-index

Exemplos atuais incluem:

- shell: `1`;
- topbar: `20`;
- busca global: `50`;
- popover de tema: `120`;
- popover de sinônimo: `1100`;
- tooltip sintático: `1200`.

Os valores devem ser substituídos pela escala aprovada, mantendo a ordem funcional. Não é necessário elevar tudo; o objetivo é reduzir ilhas numéricas sem contrato.

## 4. Mapa por tela

### 4.1 Editor

Raiz e componentes:

- `index.html`: `[data-view-panel="editor"]`, `.editor-split`, `.template-reference`, `.editor-paper`, `.editor-mode-bar`, `.format-bar`, `.writing-area`, `.paged-editor`;
- controllers: `editor-controller.js`, `editor-modes.js`, `app.js`, `js/controllers/editor-status-controller.js`, `js/controllers/reader-controller.js`;
- suporte visual: `pagination-engine.js` e `print-engine.js`, sem alteração funcional proposta.

Arquivos CSS principais:

- `css/03-editor-layout.css`;
- `css/03-editor-modes.css`;
- `css/editor-modes.css`;
- `css/03-editor-toolbar.css`;
- `css/03-writing-area.css`;
- `css/13-editor-quiet.css`;
- `css/17-editor-status-argila.css`;
- `css/18-editor-status-layout.css`;
- `css/20-product-clarity-desktop.css`;
- `css/20-product-clarity-desktop-controls.css`;
- compartilhados: `css/00-tokens.css`, `css/02-shell-navigation.css`, `css/08-responsive.css`, `css/15-brand-argila.css`.

Tokens já usados corretamente:

- superfícies e texto físicos `--paper`, `--surface-low`, `--card`, `--ink`, `--soft-ink`, `--muted`;
- `--line`, `--primary`, `--on-primary` e motion tokens;
- `--argila-font-reading` na escrita e amostras editoriais;
- `--argila-font-ui` em parte da interface.

Exceção aprovada, não corrigir:

- `.editor-paper` em Vereda: `#d4c5a9`;
- `.writing-area` e conteúdo de manuscrito: `#3a2c22`.

| Categoria | Divergência observada | Destino aprovado | Alvorada | Vereda |
| --- | --- | --- | --- | --- |
| Cor | UI sobre o papel usa `#1c1714`, `#8c7060`, `rgba(255,255,255,.18)`, `rgba(58,44,34,.25)`, `#8c3a2b` | papéis semânticos de texto, formulário, borda e destrutivo, preservando apenas folha/escrita fixas | Parte herda tokens; ainda há literais e sombras | Divergência maior porque os overrides tentam reconstruir uma UI clara dentro do papel fixo |
| Tipografia | títulos, labels e botões misturam sans, Noto Serif, pesos 500–800 e tamanhos locais | `font-interface` e escala aprovada; `font-editorial` apenas no manuscrito | seletor global torna títulos de UI editoriais | mesma herança, somada aos overrides do papel |
| Espaçamento | `min(760px,100%)`, split `min(1180px,100%)`, altura `calc(100vh - 176px)`, collapsed `min(860px,100%)`, gap `46px`, paddings `26/28/40/42/48/56/64` | escala e contrato de layout aprovados | valores distribuídos por várias camadas | igual na geometria; contraste e superfície mudam |
| Estatística | statusbar, contagens e estados usam texto simples, badge e blocos diferentes | `TextStatistic` apenas para contagens/medidas | presente | presente |
| Botão | `.secondary-button`, `.icon-button`, `.fmt-btn`, `.editor-view-btn` têm alturas, radius e estados diferentes | `ActionButton` por variante; toolbar pode manter componente próprio com os mesmos tokens | dois sistemas visíveis na mesma tela | overrides adicionais de hover/ativo no papel |
| Formulário | título, selects de formato e inputs de página têm fundos e bordas locais | tokens de formulário aprovados | base parcialmente normalizada | fundo claro e borda do papel são hardcoded |
| Número | `totalWords.toLocaleString("pt-BR")` já é correto, mas helpers são repetidos | formatter compartilhado `Intl.NumberFormat('pt-BR')` | parcial | igual |
| Aviso | banners e cinco famílias de toast podem coexistir | fila, toast único e z-index aprovado | problema sistêmico | problema sistêmico |
| Responsividade | sidebar esquerda + guia + painel linguístico podem disputar largura; breakpoints 600/680/768/820/900 | contrato aprovado de um painel auxiliar no intervalo crítico | quebra de largura | mesma geometria; superfícies escuras não resolvem colisão |

Ordem recomendada na Fase 4:

1. shell responsivo e política dos painéis auxiliares;
2. ActionButton da barra de modo;
3. toolbar de formatação;
4. formulários do papel;
5. status e estatísticas;
6. avisos.

### 4.2 Arquivo/Acervo

Raiz e componentes:

- `index.html`: `[data-view-panel="arquivo"]`, `.archive-view`, `.archive-controls`, `.resume-documents`, `.archive-layout`, `.project-grid`, `.archive-detail-panel`, `.metadata-form`, `.progress-readout`, áreas de exportação, backup e perigo;
- controllers: `archive-controller.js`, `backup-controller.js`, `app.js`;
- exportação e versões: `export-engine.js`, `version-engine.js`, sem mudança de formato proposta.

Arquivos CSS principais:

- `css/05-archive.css`;
- `css/14-archive-inspector.css`;
- `css/21-product-clarity-archive.css`;
- `css/21-product-clarity-archive-refine.css`;
- compartilhados: `css/02-shell-navigation.css`, `css/04-analysis-academy.css`, `css/08-responsive.css`, `css/15-brand-argila.css`.

Tokens já usados corretamente:

- `--line`, `--primary`, `--muted`, `--ink`, `--card`, `--soft-ink`, `--surface-low` e motion;
- cores de estado destrutivo já se apoiam parcialmente em `--sienna`;
- `totalWords.toLocaleString("pt-BR")` já aparece no controller.

| Categoria | Divergência observada | Destino aprovado | Alvorada | Vereda |
| --- | --- | --- | --- | --- |
| Cor | cards, danger zone, backup, status e quick actions combinam aliases e misturas locais | superfície, borda, aviso e destrutivo aprovados | maior parte usa aliases, com misturas locais | herda aliases escuros; poucos overrides explícitos, portanto divergências podem ficar ocultas |
| Tipografia | títulos de Acervo e painéis recebem fonte editorial pelo seletor global; metadados têm escala local | interface em títulos, controles e metadados | divergente | igual por herança |
| Espaçamento | largura `min(1160px,100%)`, gap `20px`, painel sticky `top:24px`, padding `20px`, empty state `230px/24px` | escala e layout aprovado | hardcodes numerosos | mesma geometria |
| Estatística | status bar, total de palavras, progresso, badges e metadados usam estruturas distintas | `TextStatistic` para total, percentual e contagens; badges semânticos permanecem badges | três metáforas | igual |
| Botão | create, primary, ghost, secondary, danger e quick action | variantes de `ActionButton`, incluindo destrutiva | alta fragmentação | herda estilos, mas contraste depende do tema |
| Formulário | busca, ordenação, metadados, range e escopo de exportação têm wrappers próprios | tokens de formulário | parcialmente consistente | precisa validar fundo/borda em cada wrapper, não apenas no input interno |
| Número | total de palavras já pt-BR; porcentagem é texto cru | formatter compartilhado para totais e percentual | parcial | igual |
| Aviso | backup-warning é callout persistente; banners globais aparecem acima da tela | `surface-callout` e paleta própria; não transformar callout em toast | divergente | mesma semântica, cores devem vir do tema |
| Responsividade | grid + inspector direito competem com sidebar; painel sticky amplia o problema | colapsar/drawer no breakpoint aprovado | risco alto | mesmo risco |

Ordem recomendada:

1. layout grid/inspector;
2. formulário de busca e metadados;
3. ActionButton e zona destrutiva;
4. TextStatistic/status;
5. callouts e backup.

### 4.3 Oficina/Ateliê

Raiz e componentes:

- `index.html`: `[data-view-panel="academia"]`, `.academy-view`, `.academy-banner`, `.academy-banner-actions`, `.academy-tools`, `.academy-tools-tabs`, `.academy-tool-panel`;
- controllers: `academia-controller.js`, `js/controllers/oficina-navigation-controller.js`, `workshop-authorship-clarity-controller.js`, `js/controllers/training-controller.js`.

Arquivos CSS principais:

- `css/04-analysis-academy.css`;
- `css/06-academy-tools.css`;
- `css/19-oficina-navigation.css`;
- `css/22-product-clarity-workshop-authorship.css`;
- `css/22-product-clarity-workshop-refine.css`;
- compartilhados: `css/02-shell-navigation.css`, `css/08-responsive.css`, `css/15-brand-argila.css`.

Tokens já usados corretamente:

- `--primary`, `--line`, `--muted`, `--ink`, `--card`, `--surface`, `--surface-low`, `--soft-ink`;
- `--tip-bg` e `--tip-ink` em alguns callouts;
- motion tokens em tabs e accordions.

| Categoria | Divergência observada | Destino aprovado | Alvorada | Vereda |
| --- | --- | --- | --- | --- |
| Cor | tab inativa usa literal `#6f6459` para corrigir contraste de temas claros; callouts usam misturas locais | `text-muted`, paleta de aviso e `surface-callout` | literal específico | Vereda não usa o literal; herda `--muted`, por isso a divergência não é idêntica |
| Tipografia | `.academy-section-intro h3` e cabeçalhos usam Noto Serif; tabs e metadados têm escalas locais | `font-interface` em navegação e títulos da ferramenta; editorial só no conteúdo de leitura | divergente | igual por herança |
| Espaçamento | overlays alternam padding `20px/12px`; painel usa `min(720px, calc(100vw - 32px))`, padding `22px`; tabs `12px 20px` | escala aprovada | fragmentado | mesma geometria |
| Estatística | Voz, Rimas, Vocabulário e Prática apresentam contagens em meta, bloco, pill e barra | `TextStatistic` por medida | heterogêneo | igual |
| Botão | banner action, labels-tab, primary, secondary e ghost | ActionButton para ações; tabs mantêm componente de tab com tokens comuns | heterogêneo | herda, mas estados ativos mudam de contraste |
| Formulário | textareas, busca e toggles de cada ferramenta divergem | tokens de formulário | divergente por painel | herdado; validar superfícies escuras |
| Número | contagens de palavras, versos, resultados e progresso são interpoladas por controllers diferentes | formatter compartilhado | parcial | igual |
| Aviso | dica ENEM é callout contextual, não toast | paleta de callout aprovada | mistura local de `--primary` | herda cor escura; precisa par próprio de texto/fundo |
| Responsividade | tabs dependem de `821px`, outras regras usam `820px`; painéis internos têm seus próprios limites | breakpoints aprovados | inconsistência de fronteira | igual |

### 4.4 Palavras

Raiz e componentes:

- `index.html`: `[data-view-panel="biblioteca"]`, `.split-paper`, `.lexical-hint`, `.lexical-search-row`, `.reading-sample`, `.lexical-card`;
- controller de apresentação: `lexical-view-controller.js`;
- nenhum trabalho em `lexical-engine.js` faz parte desta frente.

Arquivos CSS principais:

- `css/02-shell-navigation.css`;
- `css/03-editor-toolbar.css`;
- `styles.css`;
- compartilhados: `css/08-responsive.css`, `css/15-brand-argila.css`.

Tokens já usados corretamente:

- `--muted`, `--line`, `--primary`, `--ink`, `--soft-ink`, `--surface-low`, `--card` e motion.

| Categoria | Divergência observada | Destino aprovado | Alvorada | Vereda |
| --- | --- | --- | --- | --- |
| Cor | alertas locais e alguns estados usam misturas/aliases sem papel semântico | paleta de callout/aviso; texto e superfície aprovados | divergente | quase toda a tela herda tokens, sem bloco específico |
| Tipografia | amostra de leitura deve continuar editorial; labels, definições, busca e metadados não devem herdar serifada por serem `h*` | separar `font-editorial` e `font-interface` | mistura | igual por herança |
| Espaçamento | hint `480px`, busca `340px` e `8px 12px`, cloud `14px`, card `26px`, gaps `20px` | escala e largura aprovada | hardcodes | mesma geometria |
| Estatística | contagem de ocorrências pode ser TextStatistic; nuvem de palavras e chips não são estatística | aplicar somente às medidas | uso pontual | igual |
| Botão | chips de ação e controles locais não seguem ActionButton | ActionButton apenas onde há ação; termos permanecem chips | divergente | igual |
| Formulário | busca lexical tem wrapper e input próprios | tokens de formulário | divergente | validar fundo no escuro |
| Número | frequências/contagens devem usar formatter | sem helper único | igual |
| Aviso | `.lexical-frase-alerta` é callout local | `surface-callout` e par de texto | base | tema herdado |
| Responsividade | `.split-paper` e card lateral precisam do breakpoint aprovado | uma coluna no intervalo crítico | risco | mesmo risco |

Observação: `.reading-sample` pode usar `#3a2c22` somente quando estiver materialmente dentro do Objeto Livro. Fora dele, deve usar o papel semântico de texto editorial do tema.

### 4.5 Rimas

Raiz e componentes:

- `index.html`: `.at-panel-rimalab`, `.rimalab-tool`, `.rimalab-actions`, `.rimalab-workbench`, `.rimalab-dashboard`, `.rimalab-isometry`, `.rimalab-list`, `.rimalab-scheme`, `.rimalab-finder`;
- renderização coordenada por `academia-controller.js`;
- nenhuma auditoria de `rimalab-engine.js` é feita aqui.

Arquivos CSS exatos:

- `css/04-analysis-academy.css` — 54 regras do componente;
- `css/06-academy-tools.css` — 1 regra;
- `css/08-responsive.css` — 3 regras;
- `css/22-product-clarity-workshop-authorship.css` — 1 regra;
- `css/22-product-clarity-workshop-refine.css` — 13 regras.

Tokens já usados corretamente:

- `--primary`, `--line`, `--muted`, `--card`, `--ink`, `--surface-low`, `--soft-ink`, `--surface`, `--surface-mid` e `--on-primary`.

| Categoria | Divergência observada | Destino aprovado | Alvorada | Vereda |
| --- | --- | --- | --- | --- |
| Cor | `.rimalab-finder-chip.is-toante` usa fallback `var(--sienna, #8b4513)` | papel semântico de categoria/estado ou accent aprovado, sem fallback literal | fallback existe | herda o mesmo fallback caso token falhe |
| Tipografia | heading Noto Serif `30px`; meta `11px/800`; isometria `22px`; labels `10px/700`; input `13px` | interface para heading da ferramenta, meta, labels e controles; editorial apenas no verso | divergente | igual |
| Espaçamento | dashboard, cards, finder e ações usam valores locais | escala aprovada | disperso | igual |
| Estatística | isometria, métrica, esquema e contagens usam bloco, lista e destaque | TextStatistic para número/medida; listas e esquema permanecem componentes próprios | três metáforas | igual |
| Botão | fila de secondary buttons e ações de exportar/limpar | ActionButton por variante, incluindo destrutiva silenciosa para limpar | divergente | igual por herança |
| Formulário | textarea principal e busca de rimas têm estilos próprios | tokens de formulário | divergente | validar superfície escura |
| Número | `0 versos`, sílabas e medidas precisam de pt-BR | formatter compartilhado | não uniforme | igual |
| Aviso | nota de precisão automática é callout, não toast | `surface-callout` e `text-callout` | local | herdado |
| Responsividade | dashboard e finder dependem de regras próprias | breakpoints aprovados | regras isoladas | igual |

### 4.6 Vocabulário

Raiz e componentes:

- `index.html`: `.at-panel-vocab`, `.decolonial-tool`, `.decolonial-toggle-card`, `.decolonial-observer`, `.decolonial-search`, `.decolonial-filters`, `.decolonial-count`, `.decolonial-list`;
- controller de apresentação: `academia-controller.js`;
- nenhum trabalho em engine decolonial é realizado nesta frente.

Arquivos CSS principais:

- `css/04-analysis-academy.css`;
- `css/06-academy-tools.css`;
- `css/08-responsive.css`;
- `css/22-product-clarity-workshop-authorship.css`;
- `css/22-product-clarity-workshop-refine.css`.

Tokens já usados corretamente:

- `--primary`, `--surface`, `--ink`, `--line`, `--card`, `--muted` e `--surface-low`.

| Categoria | Divergência observada | Destino aprovado | Alvorada | Vereda |
| --- | --- | --- | --- | --- |
| Cor | observer, filtros e categorias combinam accent, card e misturas locais | papéis de superfície, texto, borda e aviso aprovados | herança + regras locais | quase sem overrides explícitos; verificar cada categoria no fundo escuro |
| Tipografia | heading da ferramenta, filtros, contagem e explicações misturam editorial e interface | interface em toda UI; editorial apenas em trecho citado, caso exista | divergente | igual |
| Espaçamento | toggle, observer, busca, filtros e cards usam paddings/gaps próprios | escala aprovada | disperso | igual |
| Estatística | `.decolonial-count` é candidato direto | `TextStatistic` | texto isolado | igual |
| Botão | filtros clicáveis, exportar e toggle têm componentes diferentes | ActionButton para ações; filtro permanece chip/tab com tokens próprios | divergente | igual |
| Formulário | busca e checkbox/toggle precisam estados comuns | tokens de formulário, foco e disabled | parcial | validar contraste no tema escuro |
| Número | total de termos e ocorrências precisa pt-BR | formatter compartilhado | não uniforme | igual |
| Aviso | observer-summary e explicação crítica são callouts persistentes | paleta de callout; não toast | local | tema herdado |
| Responsividade | filtros e lista podem estourar horizontalmente | wrap/scroll no breakpoint aprovado | risco | mesmo risco |

### 4.7 Leituras

Raiz e componentes:

- Ateliê: `.at-panel-biblioteca`, `.academia-biblioteca-frame`;
- cards editoriais: `.academy-leitura`, `.leitura-editorial-grid`, `.leitura-editorial-card`;
- modo leitor: `.reader-overlay`, `.reader-header`, `.reader-title`, `.reader-pill`, `.reader-article`, `.reader-hint-toast`;
- controller: `js/controllers/reader-controller.js`.

Arquivos CSS principais:

- `css/06-academy-tools.css`;
- `css/03-editor-modes.css`;
- `css/editor-modes.css`;
- `vereda-editorial.css`;
- compartilhados: `css/00-tokens.css`, `css/02-shell-navigation.css`, `css/08-responsive.css`, `css/15-brand-argila.css`.

Tokens já usados corretamente:

- `--primary`, `--muted`, `--ink`, `--line`, `--paper`, `--soft-ink`, `--surface-low`, `--reading-size`;
- fonte editorial no corpo de leitura.

| Categoria | Divergência observada | Destino aprovado | Alvorada | Vereda |
| --- | --- | --- | --- | --- |
| Cor | overlay usa gradiente e misturas locais; reading sample recebe cor fixa em alguns contextos | superfícies do tema; cor fixa apenas no Objeto Livro | aliases claros | Vereda tem override específico; separar overlay da folha fixa |
| Tipografia | reader title `13px` Noto Serif italic; pill `11px`; artigo `18px/1.75` | título/controles em interface; artigo em editorial | mistura | igual |
| Espaçamento | iframe fixa `600px`; reader tem dimensões e paddings próprios | layout e escala aprovados | altura rígida | mesmo problema |
| Estatística | `.reader-pill` mistura status e medida | TextStatistic se numérico; status textual permanece badge | pill própria | igual |
| Botão | header do leitor e ações externas usam icon buttons locais | ActionButton/icon variant | parcial | igual |
| Formulário | não é foco principal; controles de leitura devem herdar estados comuns | tokens de controle | parcial | validar tema escuro |
| Número | página, progresso ou contagem devem usar formatter | parcial | igual |
| Aviso | `.reader-hint-toast` é toast global concorrente | fila única e z-index aprovado | concorrente | concorrente |
| Responsividade | reader usa breakpoint `600px`; iframe e cards usam `560/900px` | breakpoints aprovados | fragmentado | igual |

### 4.8 Prática

Raiz e componentes:

- `index.html`: `.at-panel-treino`;
- componentes: `.training-*`, `.deriva-*`, `.fio-*`, exercícios editoriais `.ed-exercise`;
- controller: `js/controllers/training-controller.js`.

Arquivos CSS principais:

- `css/12-training-modes.css`;
- `css/06-academy-tools.css`;
- `vereda-editorial.css`;
- compartilhados: `css/15-brand-argila.css`, `css/22-product-clarity-workshop-authorship.css`.

Tokens já usados corretamente:

- `--primary`, `--line`, `--muted`, `--ink`, `--card`, `--surface`, `--surface-low` e motion.

| Categoria | Divergência observada | Destino aprovado | Alvorada | Vereda |
| --- | --- | --- | --- | --- |
| Cor | poucas cores literais; maior dívida está em estrutura e estados | tokens aprovados | relativamente próxima | herda sem bloco específico; validar contraste real |
| Tipografia | ícone `24px`, headings `15px` e rótulos locais; alguns exercícios recebem serifada | interface em UI; editorial somente no texto do exercício | divergente | igual |
| Espaçamento | cards `16/20px`, arena `12/16px`, textarea `260px/16px`, ações `8px`, exercício `24px` | escala aprovada, preservando altura funcional da área de escrita | disperso | igual |
| Estatística | fio/barra e indicadores de exercício formam metáfora própria | TextStatistic e padrão de progresso aprovados | barra ad hoc | igual |
| Botão | `.deriva-btn-salvar` e ações locais | ActionButton | local | igual |
| Formulário | textarea e campos de exercício têm estilos distintos | tokens de formulário | divergente | validar fundo no escuro |
| Número | tempo, palavras e progresso devem usar formatter | não centralizado | igual |
| Aviso | instruções e resultados são callouts locais | paleta de callout | local | herdado |
| Responsividade | altura fixa da textarea e cards precisam adaptação | breakpoints aprovados | risco em telas baixas | igual |

### 4.9 Autoria

Raiz e componentes:

- `index.html`: `[data-view-panel="autoria"]`, `.certificate-paper`, `.certificate-grid`, `.metric-block`, `.proof-session-bar`, `.proof-author-form`, `.proof-actions`, resultados de validação;
- controllers: `proof-controller.js`, `workshop-authorship-clarity-controller.js`.

Arquivos CSS principais:

- `css/00-tokens.css`;
- `css/02-shell-navigation.css`;
- `css/22-product-clarity-workshop-authorship.css`;
- compartilhados: `css/08-responsive.css`, `css/15-brand-argila.css`, `css/20-product-clarity-desktop.css`.

Tokens já usados corretamente:

- `--primary`, `--line`, `--muted`, `--ink`, `--soft-ink`, `--card`, `--surface-low`, motion;
- `font-interface` já aparece pontualmente no refinamento;
- o percentual de autoria é dinâmico, conforme decisão de produto.

Exceção aprovada, não corrigir:

- folha da prova: `#d4c5a9`;
- escrita do objeto impresso: `#3a2c22` quando aplicável.

| Categoria | Divergência observada | Destino aprovado | Alvorada | Vereda |
| --- | --- | --- | --- | --- |
| Cor | no papel fixo: `#1c1714`, `rgba(19,15,13,.08/.10)`, `rgba(140,110,80,.28/.35)`, `#8c5a20`, `#f5e4c0`, input branco `.55`, placeholder marrom `.55` | tokens semânticos scoped para controles, métricas, formulário e callout; preservar folha/escrita fixas | menos overrides | principal concentração de hardcodes, porque a folha não escurece |
| Tipografia | certificado pode ser editorial; labels, métricas, formulário e ações devem ser interface | aplicação contextual | mistura | mistura + overrides |
| Espaçamento | grid, sessão, formulário e ações usam dimensões locais | escala e breakpoint aprovados | disperso | igual |
| Estatística | quatro `.metric-block` são o caso mais claro de `TextStatistic` | componente compartilhado | bloco próprio | bloco próprio com cores específicas |
| Botão | primary/secondary/ghost dentro do papel têm overrides próprios | ActionButton scoped ao papel | parcial | hardcodes de fundo/texto |
| Formulário | nome da autora e campos de sessão usam RGBA próprios | `surface-input`, borda, placeholder e foco aprovados | parcial | divergente explicitamente |
| Número | datas usam `toLocaleString("pt-BR")`, mas `snapshot.wordCount` e outras métricas podem sair crus | formatter numérico compartilhado; datas mantêm formatter de data | parcial | igual |
| Aviso | distinction, validation result, share hint e status têm papéis misturados | separar callout, sucesso, alerta e erro pelas quatro paletas | disperso | cores locais no papel |
| Responsividade | grid de métricas e ações precisam colapsar no breakpoint aprovado | layout aprovado | risco | igual |

Ordem recomendada:

1. tokens scoped do papel fixo;
2. TextStatistic;
3. formulário;
4. ActionButton;
5. callouts e estados.

### 4.10 Painel linguístico

Escopo visual:

- `.template-reference`, `.precision-card`, `.precision-*`, `.syntax-*`, inspector e summary;
- controllers de apresentação: `grammar-controller.js`, `syntax-controller.js`;
- não inclui análise ou alteração de engines.

Arquivos CSS principais:

- `css/03-editor-layout.css`;
- `css/03-inspector-precision.css`;
- `css/14-archive-inspector.css`;
- `css/04-analysis-academy.css`;
- compartilhados: `css/00-tokens.css`, `css/02-shell-navigation.css`, `css/08-responsive.css`.

Tokens já usados corretamente:

- `--primary`, `--muted`, `--line`, `--ink`, `--card`, `--soft-ink`, `--surface-low`, `--surface-mid`, `--surface-high` e motion.

| Categoria | Divergência observada | Destino aprovado | Alvorada | Vereda |
| --- | --- | --- | --- | --- |
| Cor | funções sintáticas usam sete cores literais: `#2a7d52`, `#1a5fa8`, `#b06000`, `#7a2d8a`, `#c04030`, `#c07830`, `#5a7a3a` | tokens semânticos próprios de categoria, se aprovados; não reduzir silenciosamente tudo a `accent-primary` | paleta própria clara | usa outra série: `#5ecf96`, `#5b9fe0`, `#e09840`, `#c070d8`, `#e86a5a`, `#e0a050`, `#8ecf60` |
| Tipografia | labels de 8, 9.5, 10, 10.5, 11 e 12.5 px, pesos 700/800 | escala de interface aprovada | fragmentada | igual |
| Espaçamento | gaps/paddings 1, 2, 4, 5, 6, 8, 10 e 12 px | escala aprovada, preservando densidade funcional | fragmentado | igual |
| Estatística | summary numérico e contagens podem ser TextStatistic; tokens sintáticos não são estatísticas | aplicação seletiva | mistura | igual |
| Botão | checks manuais, controles, resizer e ações usam contratos diferentes | ActionButton onde houver ação; resizer continua controle estrutural acessível | divergente | igual |
| Formulário | checkboxes e controles do inspector precisam estados comuns | tokens de formulário | parcial | validar contraste |
| Número | contagens e percentuais do summary precisam pt-BR | formatter compartilhado | parcial | igual |
| Aviso | alertas do summary usam apenas `--sienna` | quatro paletas de aviso conforme gravidade | papel único | igual |
| Responsividade | painel é parte da colisão sidebar + guia + inspector | política de um painel auxiliar no intervalo crítico | risco máximo | mesmo risco |
| Z-index | tooltip sintático `1200`, sinônimo `1100` | escala aprovada | ilhas numéricas | igual |

Decisão pendente necessária antes da correção de cor sintática:

O Design System informado cobre acento, superfícies, texto e quatro avisos, mas o painel possui categorias simultâneas que não equivalem automaticamente a sucesso, informação, alerta e erro. A Fase 4 não deve substituir as sete cores por quatro avisos sem aprovação de produto. Há duas opções conservadoras:

1. aprovar tokens semânticos específicos para as funções sintáticas;
2. reduzir o uso cromático e apoiar distinção também em label, borda e padrão visual.

Essa é a única lacuna do mapa que exige uma decisão de token antes da implementação do arquivo correspondente.

## 5. Matriz resumida de prioridade

| Tela | Risco principal | Primeiro arquivo provável | Dependência |
| --- | --- | --- | --- |
| Editor | colisão de layout e dois sistemas de toolbar | `css/03-editor-layout.css` | contrato responsivo aprovado |
| Acervo | grid + inspector + sidebar | `css/21-product-clarity-archive.css` ou `css/14-archive-inspector.css` | shell responsivo |
| Ateliê | tabs, botões e subpainéis heterogêneos | `css/06-academy-tools.css` | ActionButton e tokens de tab |
| Palavras | split e mistura UI/editorial | `css/02-shell-navigation.css` em seletores lexicais | tipografia e breakpoint |
| Rimas | estatísticas e formulários próprios | `css/04-analysis-academy.css` em `.rimalab-*` | TextStatistic/ActionButton |
| Vocabulário | filtros, count e observer | `css/04-analysis-academy.css` em `.decolonial-*` | TextStatistic/form tokens |
| Leituras | iframe rígido e reader toast | `css/03-editor-modes.css` | breakpoints e fila de toast |
| Prática | barra/progresso e textarea | `css/12-training-modes.css` | TextStatistic/form tokens |
| Autoria | UI dentro do papel fixo | `css/00-tokens.css` em escopo de `.certificate-paper` | tokens scoped do Objeto Livro |
| Painel linguístico | paleta categórica e terceira coluna | `css/03-inspector-precision.css` | decisão sobre cores sintáticas |

## 6. Fronteiras para a Fase 4

A implementação só deve começar após aprovação deste mapa e deve respeitar:

- um arquivo ou tela por vez;
- diff mostrado antes de aplicar;
- confirmação explícita antes de cada arquivo seguinte;
- branch nova a partir da `main` atualizada;
- PR pequeno, isolado e inicialmente em rascunho;
- gates verdes a cada etapa;
- sem merge sem autorização explícita;
- squash merge;
- branch preservada salvo autorização de remoção;
- sem mudança em `.esc`, persistência, rotas, service worker, manuscritos ou engines sem plano explícito;
- qualquer CSS distribuído que for incorporado deverá atualizar a versão de asset/cache de forma monotônica e sem alterar a estratégia offline.

## 7. Proposta de sequência de implementação

A ordem abaixo reduz retrabalho; não autoriza execução automática:

1. componente e tokens de ActionButton em um arquivo próprio já aprovado ou na camada indicada pelo Design System;
2. componente TextStatistic;
3. tokens de formulário e avisos globais;
4. shell responsivo e política de painéis auxiliares;
5. Editor;
6. Acervo;
7. Ateliê base;
8. Palavras;
9. Rimas;
10. Vocabulário;
11. Leituras;
12. Prática;
13. Autoria;
14. painel linguístico, após decisão sobre cores sintáticas.

Separar por natureza continua obrigatório. A criação dos componentes compartilhados não deve ser misturada no mesmo PR com a migração de uma tela, salvo quando o componente não puder existir sem um primeiro consumidor mínimo e o diff continuar pequeno.

## 8. Conclusão

O produto não precisa de uma refatoração visual ampla. Precisa de migrações pequenas que removam decisões duplicadas sem apagar exceções deliberadas.

Os pontos de maior risco são:

1. layout simultâneo de sidebar, guia e inspector;
2. UI de Autoria e Editor dentro do Objeto Livro invariável;
3. coexistência de múltiplos sistemas de botão e estatística;
4. avisos sem fila única;
5. tipografia editorial aplicada a componentes de interface;
6. cores sintáticas sem tokens semânticos aprovados.

Nenhuma alteração de produto foi feita nesta fase. O próximo passo é aprovar ou ajustar este mapa inteiro. Somente depois disso a Fase 4 pode começar, arquivo por arquivo, com diff prévio e confirmação individual.
