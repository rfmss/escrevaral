# Reavaliação da estrutura JavaScript da raiz — 2026-07-25

**Situação:** decisão arquitetural reaberta; migração ainda não executada.

## Motivo

A decisão registrada em `docs/_decisoes/ESTRUTURA_RAIZ.md` determinou nova avaliação quando o projeto ultrapassasse 50 arquivos JavaScript ou adotasse uma etapa de build.

A raiz contém atualmente **53 arquivos `.js`**:

- **52 candidatos** à organização em subpastas;
- **1 arquivo de infraestrutura fixa**, `service-worker.js`, que deve permanecer na raiz.

Mover o service worker para `js/core/` alteraria seu caminho de registro e, sem configuração explícita adicional, reduziria o escopo padrão ao novo diretório. A migração deve atualizar sua lista de assets, mas não sua localização.

## Inventário proposto

### `js/engines/` — 22

- `analise-engine.js`
- `archive-engine.js`
- `backup-engine.js`
- `badges-engine.js`
- `decolonial-engine.js`
- `document-engine.js`
- `export-engine.js`
- `filesystem-backup-engine.js`
- `lexical-engine.js`
- `pagination-engine.js`
- `precision-engine.js`
- `print-engine.js`
- `proof-engine.js`
- `punctuation-engine.js`
- `rights-engine.js`
- `rimalab-engine.js`
- `syntax-engine.js`
- `template-engine.js`
- `typewriter-engine.js`
- `version-engine.js`
- `voice-engine.js`
- `vrda-engine.js`

### `js/controllers/` — 18

- `academia-controller.js`
- `archive-clarity-controller.js`
- `archive-controller.js`
- `backup-controller.js`
- `cronograma-controller.js`
- `editor-controller.js`
- `editor-status-controller.js`
- `grammar-controller.js`
- `lexical-view-controller.js`
- `oficina-navigation-controller.js`
- `pomodoro-controller.js`
- `product-clarity-controller.js`
- `proof-controller.js`
- `reader-controller.js`
- `syntax-controller.js`
- `tooltip-controller.js`
- `training-controller.js`
- `workshop-authorship-clarity-controller.js`

### `js/data/` — 3

- `criterios-data.js`
- `quotes-data.js`
- `synonym-data.js`

### `js/core/` — 9

- `app.js`
- `combo-detector.js`
- `deriva-mode.js`
- `editor-modes.js`
- `perseguicao-mode.js`
- `screenplay-codec.js`
- `state-integrity.js`
- `state-store.js`
- `ui-dialog.js`

### Raiz — infraestrutura fixa

- `service-worker.js`

## Pontos de carregamento

- `index.html` carrega **49 scripts locais** por `<script src>`.
- Os demais HTML da raiz são páginas autônomas e não carregam os JavaScripts principais.
- `ui-dialog.js` cria dinamicamente um script para `lexical-view-controller.js`; esse caminho precisa mudar.
- `service-worker.js` contém a lista de assets do PWA e precisa refletir todos os novos caminhos.

## Caminhos literais encontrados

Os seguintes arquivos fazem `fetch()` com caminhos literais e precisam ser testados após a mudança:

- `decolonial-engine.js` → `decolonial-data.json`
- `lexical-engine.js` → `lexical-data.json`, `norma-data.json`
- `rimalab-engine.js` → `rimalab-data.json`
- `syntax-engine.js` → `norma-data.json`, `syntax-data.json`
- `template-engine.js` → `templates-data.json`
- `typewriter-engine.js` → arquivos em `sounds/`
- `proof-controller.js` → serviço externo do OpenTimestamps

Em scripts clássicos carregados pelo documento, URLs relativas de `fetch()` são normalmente resolvidas a partir da página, não da localização física do arquivo JavaScript. Portanto, esses caminhos não devem ser alterados automaticamente: devem ser verificados no navegador e só corrigidos se um teste reproduzir falha.

## Outros consumidores de caminhos

Além do HTML e do service worker, a migração deve revisar:

- workflows em `.github/workflows/`;
- auditores em `scripts/`;
- carregamentos dinâmicos por `script.src`;
- documentação operacional vigente;
- filtros de paths usados pelo CI.

Relatórios históricos podem manter os caminhos antigos como registro do estado da época e não devem ser reescritos em massa.

## Ordem de implementação proposta

1. `js/data/` como piloto de três arquivos, com atualização de `index.html`, cache e testes.
2. `js/controllers/`, incluindo o carregamento dinâmico de `lexical-view-controller.js`.
3. `js/engines/`, com auditoria específica dos `fetch()` e dos sons.
4. `js/core/`, deixando `app.js` e `state-store.js` para o último commit da migração.
5. Promoção única e coerente de `ASSET_VERSION`, `CACHE_NAME` e todos os `?v=`.

## Barreiras obrigatórias

Antes de marcar o PR como pronto:

1. atualizar todos os `<script src>` do `index.html`;
2. atualizar `CORE_ASSETS` e demais listas do `service-worker.js`;
3. manter `service-worker.js` na raiz;
4. atualizar caminhos dinâmicos e consumidores operacionais;
5. rodar servidor local e Playwright headless;
6. rodar Teste Master, dados, console, overflow móvel, foco, PWA e candidata a lançamento;
7. revisar capturas em Alvorada e Scriptorium;
8. fazer push somente na branch estrutural;
9. não incorporar automaticamente.

## Deliberação desta etapa

A reorganização é justificável pelo crescimento da raiz, mas ainda não foi executada. Esta branch registra o mapa e as barreiras antes de qualquer mudança de distribuição.

**Próxima etapa autorizada:** migrar os 52 arquivos candidatos em commits pequenos, começando pelo piloto `js/data/`, mantendo o service worker na raiz e comprovando a compatibilidade offline a cada bloco.
