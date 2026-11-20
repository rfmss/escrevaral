# Plano de Voo v2 — Fusão Definitiva Escrevaral App Linux → Web (GitHub `main`)

> **Decisões soberanas do autor (20/11/2026):**
> 1. **O App Linux é a regra oficial:** em qualquer conflito de layout, fluxo ou UX, `/workspaces/escrevaral-linux` sempre vence. O layout oficial na web é o de **3 colunas + Papel digital Sage E-Paper (`#c4cfc2`) + Superfoco automático com Máquina Viva**.
> 2. **Nada se perde da versão online (`main`):** tudo o que existe no online e não no App Linux (**16 lentes do Cofre / Examinar texto**, **Universo da obra**, **Linhagem**, **Pacotes linguísticos**, **Exportação/Importação**, **PWA offline** e **arquivo único portátil `escrevaral.html`**) permanece 100% funcional, encaixado de forma limpa na interface do App Linux (sem barras antigas duplicadas).
> 3. **Teto tecnológico democrático (para continuidade com Hydrogen):**
>    - **Núcleo do aplicativo (`src/`, `ptbr/`, `packages/cofre/`):** **ES5 estrito (`ecmaVersion: 5`)** — 0 erros no `acorn`, garantindo compatibilidade máxima e os contratos de `tests/controles-static.cjs`.
>    - **Teto máximo autorizado no repositório inteiro (incluindo `academia/` e `vendor/`):** **ES6 / ES7 (`ecmaVersion: 2016`)** — proibido ES2018+ (`?.`, `??`, `{...spread}`, `async/await` em fluxo crítico da Academia, `:has()` estrutural no CSS).
> 4. **Publicação segura:** não fazer `git push` para `origin/main` até fechar todas as fases (0 → 6), todos os gates verdes e aprovação final do autor.

---

## Quadro de Fases e Progresso (Guia de Retomada / Handoff Hydrogen)

### [x] Fase 0 — Fundação, Limpeza, Casca Única, Lazy-Load da Máquina e Service Worker Offline
- **Objetivo:** Enxugar `app.js` (tirar 464 KB de WebP Base64 do bundle crítico), adicionar fallback `.png` em `assets/typewriter/` para Safari antigo/iPad 2012 + fallback SVG leve no portátil, copiar `assets/study/enem-logo.png`, limpar órfãos em `assets/20261014-scrvrl-exame-v6-65/`, adicionar cache runtime offline no `service-worker.template.js` para P01 + Academia + Typewriter + Study, e ocultar a barra inferior duplicada `#system-bar` no workspace.
- **Arquivos:** `scripts/build.cjs`, `build/modules.json`, `src/app/service-worker.template.js`, `src/ui/maquina-visual.js`, `src/ui/styles/tres-colunas.css`, `assets/typewriter/*.png`, `assets/study/enem-logo.png`, `tests/superfoco-maquina.cjs`.

### [x] Fase 1 — Superfoco Automático (2 palavras + 30s) + Máquina Viva + Barra Dedicada + Temas/Chrome
- **Fontes Linux:** `checks/writing.{js,css}`, `checks/typewriter-machine.js`, `checks/focus-controls.{js,css}`, `checks/chrome.{js,css}`, `checks/theme-controls.{js,css}`, `checks/theme-eink.css`, `checks/escrevaral-paper.css`.
- **Entregas:**
  - `createAutomatic`: abrir Superfoco + Máquina ao digitar **2 palavras** (respeitando IME; ignorando colar/undo/setas), timer de retorno **30 s** sem atividade (pausado com P01 aberto ou IME), switch `Superfoco automático ON/OFF` (`escrevaral.writing.automatic.v1`).
  - Barra superior exclusiva do Superfoco (`.esc-writing-bar`): `Voltar ao aplicativo · Esc`, `Letra: máquina / livro`, toggles SVG **Som** + **Esconder/Mostrar máquina**, aviso `Volta após 30 s sem atividade`, `Tela cheia (F11)`.
  - `createFlow`: esmaecimento dos parágrafos fora do cursor (`opacity: 0.42`) + linha ativa ancorada acima do rolo (`rollerTop - line * 2.9`).
  - Acoplamento do painel **Soneto** à direita dentro do Superfoco quando o texto for um soneto.
  - `#esc-breadcrumb` clicável (`Projeto › Subpasta › Texto`).
  - Seletor completo de **4 temas** (**Papel digital E-Ink Sálvia `#c4cfc2`**, **Papel**, **Claro**, **Escuro Carbon**) + **Leitura confortável** + **Tela cheia** + **Piscar E-Ink** restrito à troca/criação de nota (isento em menus).

### [x] Fase 2 — Colunas 1 e 2 Fiéis ao Linux + Lixeira Recuperável de Pastas (`LIX-01`) + Atalhos Salvos
- **Fontes Linux:** `checks/sidebar.{js,css}`, `checks/project-colors.{js,css}`, `checks/project-delete.js`, `checks/trash.{js,css}`, `app/dist/escrevaral-shortcuts.js`.
- **Entregas:**
  - Biblioteca com rótulos fiéis (`Todos os textos`, `Com estrela`, `Sem pasta`, `Arquivados`, `Lixeira`) e contadores sincronizados desde o carregamento inicial.
  - **Notas expansíveis dentro das pastas** na árvore da Coluna 1 (`.esc-tree-notes` / `.esc-tree-note`).
  - Busca de pastas/etiquetas + botão `+ Nova pasta` avulsa + seção recolhível `Pastas com estrela`.
  - Menu `...` (e clique direito) da pasta: Renomear, Cor Pantone (6 + Sem cor), Estrela na pasta, Quadro de giz, Mover textos p/ lixeira, **Excluir pasta/projeto com Lixeira recuperável de pastas inteiras (`LIX-01`)** (restaura pasta + subpastas + textos; exclusão definitiva com confirmação de alcance).
  - **Atalhos salvos (`Criar atalho`)**: modal guiado com critérios (`Título`, `Pasta`, `Com estrela`, `Contém/Começa com/Igual`) e contador ao vivo.
  - Coluna 2: pílula de busca pré-tingida (`#b8c5b6`), acordeão de filtros sem vazamento (fechando fora/`Esc`), ações rápidas por nota (Estrela, Arquivar, Lixeira) e barra de Lixeira (`Restaurar`, `Excluir definitivamente`, `Esvaziar lixeira`).

### [x] Fase 3 — Modal `Novo projeto` (7 Modelos + Logo ENEM) + Soneto 2.1 + Editor Duplo + P01 Completo
- **Fontes Linux:** `app/dist/escrevaral-templates.js`, `checks/template-tail.js`, `checks/study.{js,css}`, `checks/sonnet-core.js`, `app/dist/linguagem/p01/ui/painel.js`.
- **Entregas:**
  - Modal `Novo projeto` fiel (`<fieldset>`, radios, nome autopreenchido, **Logo oficial do ENEM** `assets/study/enem-logo.png`, seletor `Formato dos textos`: `Texto formatado` padrão vs `Texto simples`, títulos e notas pós-patch dos 7 modelos).
  - Visualização protegida e formatada `.esc-reference` para a **Redação Nota 1000** (com cabeçalho de referência e botão `"Excluir referência"`).
  - **Soneto 2.1 completo**: botão `Recolher / Mostrar`, dica vazia `.esc-sonnet-editor-hint`, sílabas/tônicas com `<strong>` e `(síl)`, **Mapa do poema `1..14` clicável** (`Em consulta` vs `Acompanhar o cursor`), `Explorar rimas` com busca livre, **Forma do soneto** (Italiana/Inglesa, rimas personalizadas `A-N`, medida `10/12/5/7`, ritmo `Heroico/Sáfico/Alexandrino`).
  - **Editor Duplo (`formatado-leve.js`)**: preservação de estrutura Markdown ao alternar modos, checklist interativo, traço literal `- ` preservado sem auto-bullet, offsets UTF-16 fiéis ao Cofre.
  - **Cartão P01 completo (`cartao-sinonimos.js`)**: botão `Sinônimos` (ícone pena SVG) na barra do editor, campo de busca manual, preservação de maiúsculas/minúsculas (`matchCase`), botão `Desfazer troca` na instância aberta, aba `i` (*Fontes da consulta*), suporte a seleção por toque/tablet (`selectionchange`/`touchend`) e fallback automático ao léxico do Cofre no portátil offline.

### [x] Fase 4 — Ferramentas de Escrita + Unificação das Exclusividades Online (`main`)
- **Fontes Linux:** `checks/pomodoro.{js,css}`, `checks/pomodoro-state.js`, `checks/calculator.{js,css}`, `checks/calculator-math.js`, `checks/tools.{js,css}`, `checks/tools-core.js`.
- **Entregas:**
  - **Pomodoro Dock** fixo na base da Coluna 1 (`50:00` / `6:00` configuráveis, Iniciar/Pausar/Encerrar ciclo, integrado à Pausa Contemplativa da `main`).
  - **Calculadora Editorial flutuante** arrastável com **4 modos** (*Conta*, *Páginas/Laudas*, *Orçamento*, *Tempo*).
  - **Calendário** com notas do dia e lembretes.
  - **Quadro de Giz unificado** (cartões móveis por projeto do Linux + desenho livre existente na `main`).
  - **Histórico de Marcos / Linhagem unificado** (marcos nomeados + restauração + linhagem da `main`).
  - Menu principal unificado integrando **16 Lentes do Cofre (`Examinar`)**, **Universo da obra**, **Pacotes linguísticos**, **Exportação/Importação** e **Academia / Literatura Mundial**.

### [x] Fase 5 — Academia & Literatura Mundial 0.8.1 (Teto ES6/ES7 + Iframe Storage Corrigido)
- **Entregas:**
  - Corrigir `src/ui/academia.js`: corrigir sandbox do iframe (`allow-scripts allow-same-origin` ou ponte `postMessage` de storage) para **zerar `SecurityError`** em `checklist-lancamento.html` e `literatura-mundial.html`, e sincronizar tema atual (`data-theme`) no iframe.
  - Auditar e garantir que **100% dos arquivos JS e scripts inline em `academia/`** (incluindo `anatomia.js`, `embedded.js`, `vendor/page-flip.browser.js`, `literatura-mundial.html` e os 15 guias) passem em **`acorn (ecmaVersion: 2016)` com 0 erros** (teto ES6/ES7) e remover CSS bloqueante (`color-mix` sem fallback) em `academia/embedded.css`.

### [x] Fase 6 — QA Integral, Regressão Web e Prontidão para Publicação
- **Gates obrigatórios (todos verdes):**
  1. `acorn (ecmaVersion: 5)` = **0 erros** em `src/`, `ptbr/`, `packages/cofre/` e bundles `cofre.*.js` / `app.*.js`.
  2. `acorn (ecmaVersion: 2016)` = **0 erros** em `academia/` (JS e scripts inline HTML).
  3. `npm run build && npm run build:check && npm test` = **100% OK**.
  4. Testes reais em **Chromium** (`QA_BROWSER_EXECUTABLE=/usr/bin/google-chrome`): `tests/ptbr-browser.cjs` corrigido + nova suíte E2E cobrindo **todas** as features do App Linux e da Web, 0 erros de console, 0 `SecurityError`, 0 requests falhos.
  5. Conferência do modo portátil `escrevaral.html` e do cache offline no Service Worker.
