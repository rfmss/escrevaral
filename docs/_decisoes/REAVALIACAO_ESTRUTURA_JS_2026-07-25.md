# Reavaliação da estrutura JavaScript da raiz — 2026-07-25

**Situação:** decisão arquitetural reaberta; migração ainda não executada.

## Motivo

A decisão anterior em `docs/_decisoes/ESTRUTURA_RAIZ.md` manteve os arquivos de distribuição na raiz e determinou que a estrutura fosse reavaliada quando o projeto ultrapassasse 50 arquivos JavaScript ou adotasse uma etapa de build.

A raiz contém atualmente **53 arquivos `.js`**. A condição de reavaliação foi atingida.

## Inventário por função

### Engines — 22

Destino proposto: `js/engines/`

- `analise-engine.js` → `js/engines/analise-engine.js`
- `archive-engine.js` → `js/engines/archive-engine.js`
- `backup-engine.js` → `js/engines/backup-engine.js`
- `badges-engine.js` → `js/engines/badges-engine.js`
- `decolonial-engine.js` → `js/engines/decolonial-engine.js`
- `document-engine.js` → `js/engines/document-engine.js`
- `export-engine.js` → `js/engines/export-engine.js`
- `filesystem-backup-engine.js` → `js/engines/filesystem-backup-engine.js`
- `lexical-engine.js` → `js/engines/lexical-engine.js`
- `pagination-engine.js` → `js/engines/pagination-engine.js`
- `precision-engine.js` → `js/engines/precision-engine.js`
- `print-engine.js` → `js/engines/print-engine.js`
- `proof-engine.js` → `js/engines/proof-engine.js`
- `punctuation-engine.js` → `js/engines/punctuation-engine.js`
- `rights-engine.js` → `js/engines/rights-engine.js`
- `rimalab-engine.js` → `js/engines/rimalab-engine.js`
- `syntax-engine.js` → `js/engines/syntax-engine.js`
- `template-engine.js` → `js/engines/template-engine.js`
- `typewriter-engine.js` → `js/engines/typewriter-engine.js`
- `version-engine.js` → `js/engines/version-engine.js`
- `voice-engine.js` → `js/engines/voice-engine.js`
- `vrda-engine.js` → `js/engines/vrda-engine.js`

### Controladores — 18

Destino proposto: `js/controllers/`

- `academia-controller.js` → `js/controllers/academia-controller.js`
- `archive-clarity-controller.js` → `js/controllers/archive-clarity-controller.js`
- `archive-controller.js` → `js/controllers/archive-controller.js`
- `backup-controller.js` → `js/controllers/backup-controller.js`
- `cronograma-controller.js` → `js/controllers/cronograma-controller.js`
- `editor-controller.js` → `js/controllers/editor-controller.js`
- `editor-status-controller.js` → `js/controllers/editor-status-controller.js`
- `grammar-controller.js` → `js/controllers/grammar-controller.js`
- `lexical-view-controller.js` → `js/controllers/lexical-view-controller.js`
- `oficina-navigation-controller.js` → `js/controllers/oficina-navigation-controller.js`
- `pomodoro-controller.js` → `js/controllers/pomodoro-controller.js`
- `product-clarity-controller.js` → `js/controllers/product-clarity-controller.js`
- `proof-controller.js` → `js/controllers/proof-controller.js`
- `reader-controller.js` → `js/controllers/reader-controller.js`
- `syntax-controller.js` → `js/controllers/syntax-controller.js`
- `tooltip-controller.js` → `js/controllers/tooltip-controller.js`
- `training-controller.js` → `js/controllers/training-controller.js`
- `workshop-authorship-clarity-controller.js` → `js/controllers/workshop-authorship-clarity-controller.js`

### Dados JavaScript — 3

Destino proposto: `js/data/`

- `criterios-data.js` → `js/data/criterios-data.js`
- `quotes-data.js` → `js/data/quotes-data.js`
- `synonym-data.js` → `js/data/synonym-data.js`

### Núcleo e utilitários — 10

Destino proposto: `js/core/`

- `app.js` → `js/core/app.js`
- `combo-detector.js` → `js/core/combo-detector.js`
- `deriva-mode.js` → `js/core/deriva-mode.js`
- `editor-modes.js` → `js/core/editor-modes.js`
- `perseguicao-mode.js` → `js/core/perseguicao-mode.js`
- `screenplay-codec.js` → `js/core/screenplay-codec.js`
- `service-worker.js` → `js/core/service-worker.js`
- `state-integrity.js` → `js/core/state-integrity.js`
- `state-store.js` → `js/core/state-store.js`
- `ui-dialog.js` → `js/core/ui-dialog.js`

## HTML da raiz e scripts carregados

### `anatomia-do-livro.html`

- scripts totais: 0
- scripts locais: 0
  - nenhum

### `index.html`

- scripts totais: 49
- scripts locais: 49
  - `document-engine.js?v=20260725-clarity-final-v2`
  - `pagination-engine.js?v=20260725-clarity-final-v2`
  - `lexical-engine.js?v=20260725-clarity-final-v2`
  - `proof-engine.js?v=20260725-clarity-final-v2`
  - `vrda-engine.js?v=20260725-clarity-final-v2`
  - `backup-engine.js?v=20260725-clarity-final-v2`
  - `filesystem-backup-engine.js?v=20260725-clarity-final-v2`
  - `archive-engine.js?v=20260725-clarity-final-v2`
  - `badges-engine.js?v=20260725-clarity-final-v2`
  - `version-engine.js?v=20260725-clarity-final-v2`
  - `export-engine.js?v=20260725-clarity-final-v2`
  - `template-engine.js?v=20260725-clarity-final-v2`
  - `precision-engine.js?v=20260725-clarity-final-v2`
  - `criterios-data.js?v=20260725-clarity-final-v2`
  - `syntax-engine.js?v=20260725-clarity-final-v2`
  - `punctuation-engine.js?v=20260725-clarity-final-v2`
  - `analise-engine.js?v=20260725-clarity-final-v2`
  - `voice-engine.js?v=20260725-clarity-final-v2`
  - `rimalab-engine.js?v=20260725-clarity-final-v2`
  - `decolonial-engine.js?v=20260725-clarity-final-v2`
  - `rights-engine.js?v=20260725-clarity-final-v2`
  - `typewriter-engine.js?v=20260725-clarity-final-v2`
  - `synonym-data.js?v=20260725-clarity-final-v2`
  - `state-integrity.js?v=20260725-clarity-final-v2`
  - `screenplay-codec.js?v=20260725-clarity-final-v2`
  - `state-store.js?v=20260725-clarity-final-v2`
  - `cronograma-controller.js?v=20260725-clarity-final-v2`
  - `editor-modes.js?v=20260725-clarity-final-v2`
  - `editor-controller.js?v=20260725-clarity-final-v2`
  - `proof-controller.js?v=20260725-clarity-final-v2`
  - `ui-dialog.js?v=20260725-clarity-final-v2`
  - `academia-controller.js?v=20260725-clarity-final-v2`
  - `backup-controller.js?v=20260725-clarity-final-v2`
  - `archive-controller.js?v=20260725-clarity-final-v2`
  - `grammar-controller.js?v=20260725-clarity-final-v2`
  - `reader-controller.js?v=20260725-clarity-final-v2`
  - `pomodoro-controller.js?v=20260725-clarity-final-v2`
  - `editor-status-controller.js?v=20260725-clarity-final-v2`
  - `oficina-navigation-controller.js?v=20260725-clarity-final-v2`
  - `syntax-controller.js?v=20260725-clarity-final-v2`
  - `combo-detector.js?v=20260725-clarity-final-v2`
  - `deriva-mode.js?v=20260725-clarity-final-v2`
  - `perseguicao-mode.js?v=20260725-clarity-final-v2`
  - `training-controller.js?v=20260725-clarity-final-v2`
  - `tooltip-controller.js?v=20260725-clarity-final-v2`
  - `print-engine.js?v=20260725-clarity-final-v2`
  - `quotes-data.js?v=20260725-clarity-final-v2`
  - `app.js?v=20260725-clarity-final-v2`
  - `workshop-authorship-clarity-controller.js?v=20260725-clarity-final-v2`

### `privacidade.html`

- scripts totais: 0
- scripts locais: 0
  - nenhum

### `vereda-biblioteca-escrita.html`

- scripts totais: 0
- scripts locais: 0
  - nenhum

### `vereda-bloqueio-criativo.html`

- scripts totais: 0
- scripts locais: 0
  - nenhum

### `vereda-primeiras-linhas.html`

- scripts totais: 0
- scripts locais: 0
  - nenhum

### `vereda-revisao-manuscrito.html`

- scripts totais: 0
- scripts locais: 0
  - nenhum

### `vereda-titulo-do-livro.html`

- scripts totais: 0
- scripts locais: 0
  - nenhum

## Carregamentos internos que exigem atualização

### `fetch()` com caminho literal

- `decolonial-engine.js` → `decolonial-data.json`
- `lexical-engine.js` → `lexical-data.json`
- `lexical-engine.js` → `norma-data.json`
- `proof-controller.js` → `https://a.pool.opentimestamps.org/digest`
- `rimalab-engine.js` → `rimalab-data.json`
- `syntax-engine.js` → `norma-data.json`
- `syntax-engine.js` → `syntax-data.json`
- `template-engine.js` → `templates-data.json`
- `typewriter-engine.js` → `./sounds/Enter.wav`
- `typewriter-engine.js` → `./sounds/backspace.wav`
- `typewriter-engine.js` → `./sounds/typewriter.wav`

### Carregamentos dinâmicos

- `ui-dialog.js` — script.src: `./lexical-view-controller.js?v=20260725-clarity-final-v2`

## Cobertura do service worker

Arquivos JavaScript da raiz cujo nome não aparece literalmente em `service-worker.js`:

- `service-worker.js`

## Arquivos que referenciam cada JavaScript

### `academia-controller.js`

- `META_ENGINES_100.md`
- `docs/_decisoes/MAPA_ICONES_METAFORAS.md`
- `docs/_decisoes/SUGESTOES_AUTONOMAS_2026-06-16.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `personas/qg-escrevaral/tecnico.md`
- `reports/auditoria/gramatica-visual-botoes-20260525.md`
- `reports/auditoria/hints-nativos-tooltip-clone-20260526.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `analise-engine.js`

- `.agents/fluxo-atual.md`
- `CLAUDE.md`
- `META_ENGINES_100.md`
- `criterios-data.js`
- `docs/_decisoes/SUGESTOES_AUTONOMAS_2026-06-16.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/monitor-claude-2026-06-18.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `app.js`

- `.github/workflows/integridade-dados.yml`
- `CLAUDE.md`
- `META_ENGINES_100.md`
- `docs/_decisoes/ANALITICAS_GOATCOUNTER.md`
- `docs/_decisoes/AUDITORIA_ROUND1_JOBS_RESPONSIVIDADE.md`
- `docs/_decisoes/ESTRUTURA_RAIZ.md`
- `docs/_decisoes/SESSAO.md`
- `docs/_decisoes/SUGESTOES_AUTONOMAS_2026-06-16.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `lexical-view-controller.js`
- `personas/qg-escrevaral/tecnico.md`
- `reports/auditoria/auditoria-manual-ux-2026-06-25.md`
- `reports/auditoria/contraste-temas-20260606.md`
- `reports/auditoria/editor-familiaridade-word-2026-06-17.md`
- `reports/auditoria/fase-a-evidencias-20260527/fase-a-results.json`
- `reports/auditoria/fase-c-evidencias-20260527/fase-c-results.json`
- `reports/auditoria/gramatica-visual-botoes-20260525.md`
- `reports/auditoria/hints-nativos-tooltip-clone-20260526.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `reports/auditoria/reta-final-visual-funcional-20260527.md`
- `reports/plano-badges-oficina-20260527.md`
- `service-worker.js`
- `state-store.js`
- `training-controller.js`
- `ui-dialog.js`

### `archive-clarity-controller.js`

- `.github/workflows/product-clarity-archive-pr.yml`
- `product-clarity-controller.js`
- `service-worker.js`

### `archive-controller.js`

- `.github/workflows/clarity-finish-pr.yml`
- `docs/_decisoes/MAPA_ICONES_METAFORAS.md`
- `docs/_decisoes/SUGESTOES_AUTONOMAS_2026-06-16.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `personas/qg-escrevaral/tecnico.md`
- `reports/auditoria/acervo-superficies-duplicadas-20260616.md`
- `reports/auditoria/gramatica-visual-botoes-20260525.md`
- `reports/auditoria/hints-nativos-tooltip-clone-20260526.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `archive-engine.js`

- `docs/_decisoes/SUGESTOES_AUTONOMAS_2026-06-16.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `backup-controller.js`

- `.github/workflows/integridade-dados.yml`
- `META_ENGINES_100.md`
- `docs/_decisoes/BACKUP_NUDGE.md`
- `docs/_decisoes/SUGESTOES_AUTONOMAS_2026-06-16.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/hints-nativos-tooltip-clone-20260526.md`
- `reports/auditoria/monitor-claude-2026-06-18.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `reports/plano-badges-oficina-20260527.md`
- `scripts/testar-integridade-dados.js`
- `service-worker.js`

### `backup-engine.js`

- `META_ENGINES_100.md`
- `backup-controller.js`
- `docs/_decisoes/BACKUP_NUDGE.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `reports/plano-badges-oficina-20260527.md`
- `service-worker.js`

### `badges-engine.js`

- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `reports/plano-badges-oficina-20260527.md`
- `service-worker.js`

### `combo-detector.js`

- `docs/repo-structure-20260625.md`
- `index.html`
- `perseguicao-mode.js`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`
- `training-controller.js`

### `criterios-data.js`

- `CLAUDE.md`
- `docs/_decisoes/SUGESTOES_AUTONOMAS_2026-06-16.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/navegacao-visual-2026-06-26.json`
- `reports/auditoria/navegacao-visual-2026-06-26.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`
- `vereda-biblioteca-escrita.html`

### `cronograma-controller.js`

- `docs/_decisoes/MAPA_ICONES_METAFORAS.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `personas/qg-escrevaral/tecnico.md`
- `reports/auditoria/gramatica-visual-botoes-20260525.md`
- `reports/auditoria/hints-nativos-tooltip-clone-20260526.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `decolonial-engine.js`

- `CLAUDE.md`
- `META_ENGINES_100.md`
- `academia-controller.js`
- `docs/_decisoes/ESTRUTURA_RAIZ.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/monitor-claude-2026-06-18.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `deriva-mode.js`

- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`
- `training-controller.js`

### `document-engine.js`

- `META_ENGINES_100.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `editor-controller.js`

- `.github/workflows/integridade-dados.yml`
- `META_ENGINES_100.md`
- `app.js`
- `docs/_decisoes/AUDITORIA_ROUND1_JOBS_RESPONSIVIDADE.md`
- `docs/_decisoes/MAPA_ICONES_METAFORAS.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `personas/qg-escrevaral/tecnico.md`
- `reports/auditoria/hints-nativos-tooltip-clone-20260526.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `reports/auditoria/vereda-dark-audit-20260524.md`
- `service-worker.js`

### `editor-modes.js`

- `.github/workflows/integridade-dados.yml`
- `META_ENGINES_100.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/hints-nativos-tooltip-clone-20260526.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `editor-status-controller.js`

- `.github/workflows/editor-status-argila-pr.yml`
- `index.html`
- `service-worker.js`

### `export-engine.js`

- `META_ENGINES_100.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `filesystem-backup-engine.js`

- `META_ENGINES_100.md`
- `backup-controller.js`
- `docs/_decisoes/BACKUP_NUDGE.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `grammar-controller.js`

- `META_ENGINES_100.md`
- `docs/_decisoes/BANCADA_REFERENCIAS_GRAMATICA_PTBR_2026-06-27.md`
- `docs/_decisoes/MAPA_ICONES_METAFORAS.md`
- `docs/_decisoes/SUGESTOES_AUTONOMAS_2026-06-16.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/handoff-codex-gramatica-2026-06-27.md`
- `reports/auditoria/hints-nativos-tooltip-clone-20260526.md`
- `reports/auditoria/linguagem-morfologia-2026-06-18.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `reports/auditoria/reta-final-visual-funcional-20260527.md`
- `service-worker.js`

### `lexical-engine.js`

- `CLAUDE.md`
- `META_ENGINES_100.md`
- `docs/_decisoes/BANCADA_REFERENCIAS_GRAMATICA_PTBR_2026-06-27.md`
- `docs/_decisoes/ESTRUTURA_RAIZ.md`
- `docs/_decisoes/HIERARQUIA_GRAMATICAL.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/handoff-codex-gramatica-2026-06-27.md`
- `reports/auditoria/linguagem-morfologia-2026-06-18.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `lexical-view-controller.js`

- `.github/workflows/palavras-pr.yml`
- `scripts/auditor-asset-version.py`
- `service-worker.js`
- `ui-dialog.js`

### `oficina-navigation-controller.js`

- `.github/workflows/oficina-navigation-pr.yml`
- `index.html`
- `service-worker.js`

### `pagination-engine.js`

- `META_ENGINES_100.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `perseguicao-mode.js`

- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`
- `training-controller.js`

### `pomodoro-controller.js`

- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/hints-nativos-tooltip-clone-20260526.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `precision-engine.js`

- `CLAUDE.md`
- `META_ENGINES_100.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `print-engine.js`

- `META_ENGINES_100.md`
- `docs/_decisoes/SUGESTOES_AUTONOMAS_2026-06-16.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `product-clarity-controller.js`

- `.github/workflows/product-clarity-archive-pr.yml`
- `.github/workflows/product-clarity-desktop-pr.yml`
- `oficina-navigation-controller.js`
- `service-worker.js`

### `proof-controller.js`

- `META_ENGINES_100.md`
- `docs/_decisoes/MAPA_ICONES_METAFORAS.md`
- `docs/_decisoes/SESSAO.md`
- `docs/_decisoes/SUGESTOES_AUTONOMAS_2026-06-16.md`
- `docs/product/CLAREZA_OFICINA_AUTORIA_DESKTOP_2026-07-25.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `reports/auditoria/reta-final-visual-funcional-20260527.md`
- `service-worker.js`

### `proof-engine.js`

- `CLAUDE.md`
- `META_ENGINES_100.md`
- `docs/product/CLAREZA_OFICINA_AUTORIA_DESKTOP_2026-07-25.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `proof-controller.js`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `punctuation-engine.js`

- `CLAUDE.md`
- `META_ENGINES_100.md`
- `analise-engine.js`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `quotes-data.js`

- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `reader-controller.js`

- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `personas/qg-escrevaral/tecnico.md`
- `reports/auditoria/hints-nativos-tooltip-clone-20260526.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `rights-engine.js`

- `META_ENGINES_100.md`
- `academia-controller.js`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `rimalab-engine.js`

- `CLAUDE.md`
- `META_ENGINES_100.md`
- `academia-controller.js`
- `docs/_decisoes/ESTRUTURA_RAIZ.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/linguagem-morfologia-2026-06-18.md`
- `reports/auditoria/monitor-claude-2026-06-18.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `reports/auditoria/reta-final-visual-funcional-20260527.md`
- `service-worker.js`

### `screenplay-codec.js`

- `.github/workflows/integridade-dados.yml`
- `index.html`
- `scripts/testar-integridade-dados.js`
- `service-worker.js`

### `service-worker.js`

- `.agents/fluxo-atual.md`
- `.claude/skills/preparar-release/SKILL.md`
- `.github/workflows/asset-version-pr.yml`
- `.github/workflows/clarity-finish-pr.yml`
- `.github/workflows/editor-status-argila-pr.yml`
- `.github/workflows/entry-argila-pr.yml`
- `.github/workflows/integridade-dados.yml`
- `.github/workflows/mesa-portatil-pr.yml`
- `.github/workflows/oficina-navigation-pr.yml`
- `.github/workflows/palavras-pr.yml`
- `.github/workflows/product-clarity-archive-pr.yml`
- `.github/workflows/product-clarity-desktop-pr.yml`
- `.github/workflows/product-clarity-workshop-pr.yml`
- `CLAUDE.md`
- `backup-controller.js`
- `docs/_decisoes/ESTRUTURA_RAIZ.md`
- `docs/_decisoes/MAPA_ICONES_METAFORAS.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `personas/qg-escrevaral/arquivista.md`
- `reports/auditoria/contraste-temas-20260606.md`
- `reports/auditoria/handoff-amanha-2026-06-19.md`
- `reports/auditoria/handoff-codex-gramatica-2026-06-27.md`
- `reports/auditoria/linguagem-morfologia-2026-06-18.md`
- `reports/auditoria/monitor-claude-2026-06-18.md`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `reports/auditoria/reta-final-visual-funcional-20260527.md`
- `reports/auditoria/vereda-dark-audit-20260524.md`
- `reports/plano-badges-oficina-20260527.md`
- `scripts/auditor-asset-version.py`
- `scripts/auditor-mesa-portatil.py`
- `scripts/auditor-publicacao.py`
- `scripts/testar-integridade-dados.js`

### `state-integrity.js`

- `.github/workflows/integridade-dados.yml`
- `index.html`
- `scripts/testar-integridade-dados.js`
- `service-worker.js`

### `state-store.js`

- `.github/codex-agente-prompt.md`
- `.github/workflows/integridade-dados.yml`
- `CLAUDE.md`
- `META_ENGINES_100.md`
- `academia-controller.js`
- `backup-controller.js`
- `docs/_decisoes/ESTRUTURA_RAIZ.md`
- `docs/_decisoes/SUGESTOES_AUTONOMAS_2026-06-16.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `editor-controller.js`
- `index.html`
- `personas/qg-escrevaral/tecnico.md`
- `proof-controller.js`
- `reports/auditoria/hints-nativos-tooltip-clone-20260526.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `reports/plano-badges-oficina-20260527.md`
- `scripts/testar-integridade-dados.js`
- `service-worker.js`

### `synonym-data.js`

- `.agents/fluxo-atual.md`
- `META_ENGINES_100.md`
- `app.js`
- `docs/_decisoes/BANCADA_REFERENCIAS_GRAMATICA_PTBR_2026-06-27.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `grammar-controller.js`
- `index.html`
- `reports/auditoria/dados-linguisticos-2026-06-18.md`
- `reports/auditoria/dados-linguisticos-2026-06-20.md`
- `reports/auditoria/dados-linguisticos-2026-06-21.md`
- `reports/auditoria/dados-linguisticos-2026-06-22.md`
- `reports/auditoria/dados-linguisticos-2026-06-23.md`
- `reports/auditoria/dados-linguisticos-2026-06-24.md`
- `reports/auditoria/dados-linguisticos-2026-06-25.md`
- `reports/auditoria/dados-linguisticos-2026-06-26.md`
- `reports/auditoria/dados-linguisticos-2026-06-27.md`
- `reports/auditoria/handoff-codex-gramatica-2026-06-27.md`
- `reports/auditoria/monitor-claude-2026-06-18.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `scripts/auditor-dados.py`
- `service-worker.js`

### `syntax-controller.js`

- `META_ENGINES_100.md`
- `app.js`
- `docs/_decisoes/ESTRUTURA_RAIZ.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/hints-nativos-tooltip-clone-20260526.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `syntax-engine.js`

- `.agents/fluxo-atual.md`
- `.claude/skills/auditar-homografos/SKILL.md`
- `CLAUDE.md`
- `META_ENGINES_100.md`
- `docs/_decisoes/BANCADA_REFERENCIAS_GRAMATICA_PTBR_2026-06-27.md`
- `docs/_decisoes/ESTRUTURA_RAIZ.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `personas/qg-escrevaral/tecnico.md`
- `reports/auditoria/auditoria-arnaldo-catedratico-20260602.md`
- `reports/auditoria/dados-linguisticos-2026-06-18.json`
- `reports/auditoria/dados-linguisticos-2026-06-18.md`
- `reports/auditoria/dados-linguisticos-2026-06-20.json`
- `reports/auditoria/dados-linguisticos-2026-06-20.md`
- `reports/auditoria/dados-linguisticos-2026-06-21.json`
- `reports/auditoria/dados-linguisticos-2026-06-21.md`
- `reports/auditoria/dados-linguisticos-2026-06-22.json`
- `reports/auditoria/dados-linguisticos-2026-06-22.md`
- `reports/auditoria/dados-linguisticos-2026-06-23.json`
- `reports/auditoria/dados-linguisticos-2026-06-23.md`
- `reports/auditoria/dados-linguisticos-2026-06-24.json`
- `reports/auditoria/dados-linguisticos-2026-06-24.md`
- `reports/auditoria/dados-linguisticos-2026-06-25.json`
- `reports/auditoria/dados-linguisticos-2026-06-25.md`
- `reports/auditoria/dados-linguisticos-2026-06-26.json`
- `reports/auditoria/dados-linguisticos-2026-06-26.md`
- `reports/auditoria/dados-linguisticos-2026-06-27.json`
- `reports/auditoria/dados-linguisticos-2026-06-27.md`
- `reports/auditoria/handoff-codex-gramatica-2026-06-27.md`
- `reports/auditoria/linguagem-morfologia-2026-06-18.md`
- `reports/auditoria/monitor-claude-2026-06-18.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `scripts/auditor-dados.py`
- `service-worker.js`

### `template-engine.js`

- `META_ENGINES_100.md`
- `docs/_decisoes/ESTRUTURA_RAIZ.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `tooltip-controller.js`

- `META_ENGINES_100.md`
- `docs/_decisoes/SUGESTOES_AUTONOMAS_2026-06-16.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/hints-nativos-tooltip-clone-20260526.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `training-controller.js`

- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `typewriter-engine.js`

- `docs/_decisoes/ESTRUTURA_RAIZ.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `ui-dialog.js`

- `.github/workflows/asset-version-pr.yml`
- `.github/workflows/clarity-finish-pr.yml`
- `.github/workflows/entry-argila-pr.yml`
- `.github/workflows/mesa-portatil-pr.yml`
- `.github/workflows/palavras-pr.yml`
- `.github/workflows/product-clarity-archive-pr.yml`
- `.github/workflows/product-clarity-desktop-pr.yml`
- `.github/workflows/product-clarity-workshop-pr.yml`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/hints-nativos-tooltip-clone-20260526.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `scripts/auditor-asset-version.py`
- `service-worker.js`

### `version-engine.js`

- `META_ENGINES_100.md`
- `docs/_decisoes/SUGESTOES_AUTONOMAS_2026-06-16.md`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `proof-controller.js`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `voice-engine.js`

- `.agents/fluxo-atual.md`
- `CLAUDE.md`
- `META_ENGINES_100.md`
- `academia-controller.js`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/monitor-claude-2026-06-18.md`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `vrda-engine.js`

- `META_ENGINES_100.md`
- `backup-controller.js`
- `docs/repo-structure-20260526.md`
- `docs/repo-structure-20260531.md`
- `docs/repo-structure-20260625.md`
- `index.html`
- `reports/auditoria/privacidade-rede-2026-06-18.json`
- `reports/auditoria/privacidade-rede-2026-06-25.json`
- `reports/auditoria/privacidade-rede-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-18.json`
- `reports/auditoria/publicacao-offline-2026-06-20.json`
- `reports/auditoria/publicacao-offline-2026-06-21.json`
- `reports/auditoria/publicacao-offline-2026-06-22.json`
- `reports/auditoria/publicacao-offline-2026-06-23.json`
- `reports/auditoria/publicacao-offline-2026-06-24.json`
- `reports/auditoria/publicacao-offline-2026-06-25.json`
- `reports/auditoria/publicacao-offline-2026-06-26.json`
- `reports/auditoria/publicacao-offline-2026-06-27.json`
- `service-worker.js`

### `workshop-authorship-clarity-controller.js`

- `.github/workflows/product-clarity-workshop-pr.yml`
- `index.html`
- `service-worker.js`

## Barreiras obrigatórias antes de mover

1. Atualizar todos os `<script src>` dos HTML da raiz.
2. Atualizar caminhos literais em `fetch()`, `import()`, workers e scripts criados dinamicamente.
3. Atualizar `CORE_ASSETS` e qualquer outra lista do `service-worker.js`.
4. Atualizar auditores, workflows e documentação operacional que usam caminhos antigos.
5. Promover `ASSET_VERSION`, `CACHE_NAME` e todos os `?v=` de distribuição.
6. Rodar servidor local, Teste Master, Playwright headless, overflow móvel, console, foco, dados e candidata a lançamento.
7. Revisar capturas em Alvorada e Scriptorium.
8. Fazer push apenas nesta branch; não incorporar automaticamente.

## Deliberação desta etapa

A migração é tecnicamente justificável pelo crescimento da raiz, mas ainda não foi realizada. Esta branch existe para tornar o custo e os pontos de sincronização observáveis antes de qualquer movimentação de arquivos.

Próxima etapa autorizada: implementar a migração nesta mesma branch em commits pequenos, começando por uma categoria e mantendo compatibilidade offline comprovada.
