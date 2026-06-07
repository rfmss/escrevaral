# Auditoria de contraste — Alvorada e Vereda

Data: 2026-06-06

Escopo: varrer as 6 telas principais (Editor, Acervo, Academia, Cronograma, Prova de Autoria, Configurações) nos dois temas reais — Alvorada (claro, padrão) e Vereda/`scriptorium` (escuro) — medindo contraste com axe-core (regra `color-contrast`, mínimo WCAG AA 4,5:1).

## Problemas encontrados e corrigidos (v448)

1. **`.editor-mode-bar .editor-view-controls .secondary-button` no Vereda escuro — contraste 1,3**
   Botões "Mostrar guia / Ler / Mesa" praticamente invisíveis. A regra `[data-theme="scriptorium"] .editor-paper .editor-mode-bar .secondary-button { color: #3a2c22 }` foi escrita para texto sobre o papel claro do pergaminho, mas esse grupo específico tem fundo próprio escuro (`--surface-low`). Corrigido com override mais específico restaurando `var(--muted)` (~7:1) em `css/00-tokens.css`.

2. **`.academy-tool-tab` e `.editor-mode-bar .secondary-button` em Alvorada/cerrado/mata/amazonia — contraste 4,08-4,41**
   `var(--muted)` rende bem no Vereda escuro mas fica clara demais contra `--surface-low` nos temas de fundo claro. Adicionado tom mais escuro `#6f6459` escopado com `html:not([data-theme="scriptorium"])` em `css/06-academy-tools.css` e `css/02-shell-navigation.css` — sobe para 4,5-4,9 nos quatro temas claros sem alterar o Vereda (que manteve `var(--muted)` na base).

3. **`.archive-filter.is-active` no Vereda escuro — contraste 4,49** (1 centésimo abaixo do limite)
   Reduzido `color-mix(in srgb, var(--primary) 14%, var(--card))` para `10%` em `css/05-archive.css`, subindo para ~4,8 sem perder o destaque do filtro ativo.

## Falso-positivo identificado (não é bug)

`.ob-anim-escreva/prove/publique` (spans do card animado rotativo Escreva→Prove→Publique) foram sinalizados com contraste muito baixo. Confirmado pausando a animação em opacidade plena: contraste real >10:1. O axe estava amostrando estados intermediários da transição de opacidade (a cada ciclo de troca de frase).

## Fora de escopo — documentado para referência futura

`cerrado`, `mata` e `amazonia` têm problemas reais de contraste (2,55 a 4,41 em vários elementos), mas são paletas legado sem seletor na interface — confirmado via `// theme-picker removido` em `app.js:2001`. Não corrigir até (e se) forem reativadas.

## Versão

`index.html` / `service-worker.js`: `ASSET_VERSION = "20260606-contraste-temas"`, `CACHE_NAME = "vereda-offline-v448"`.

Commit: `b354508` — "fix: v448 — corrige 3 problemas de contraste em Alvorada e Vereda".
