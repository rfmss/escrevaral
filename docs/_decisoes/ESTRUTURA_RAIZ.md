# Decisão: arquivos de produto ficam na raiz

**Data:** 2026-05-31  
**Avaliado por:** arquivista + arquiteto-vanilla

## Decisão

Os arquivos JS, JSON e HTML de produto **ficam na raiz** do repositório. Não serão movidos para subpastas.

## Por quê

O Escrevaral é um PWA de arquivo único (`index.html`). A raiz funciona como a "pasta de distribuição" do app. Mover os arquivos de produto para subpastas (`engines/`, `controllers/`, `data/`) exigiria:

1. Atualizar todos os `<script src="...">` no `index.html` (~30 tags)
2. Atualizar `CORE_ASSETS` no `service-worker.js`
3. Atualizar `fetch()` hardcoded em 7 engines que carregam JSON:
   - `syntax-engine.js`, `rimalab-engine.js`, `template-engine.js`
   - `lexical-engine.js`, `decolonial-engine.js`, `typewriter-engine.js`
   - `syntax-controller.js`
4. Bumpar `ASSET_VERSION` e `CACHE_NAME`

Resultado: três pontos de sincronização em vez de dois, sem ganho funcional para o escritor.

## O que já está organizado em subpastas

| Pasta | Conteúdo |
|---|---|
| `css/` | todos os estilos |
| `icons/` | ícones SVG/PNG |
| `fonts/` | woff2 |
| `sounds/` | áudios do modo máquina de escrever |
| `synonyms/` | dados de sinônimos |
| `favicon_io/` | favicons e webmanifest |
| `docs/` | documentação e decisões |
| `reports/` | relatórios de auditoria e agentes |
| `personas/` | personas de teste |
| `scripts/` | scripts de auditoria e golden files |
| `assets/` | marca histórica (gitignored) |

## O que fica na raiz por design

- `index.html` — entrada única do app
- `*-engine.js` — engines de linguagem
- `*-controller.js`, `app.js`, `state-store.js` — lógica do app
- `*-data.json`, `*-data.js` — dados carregados via fetch()
- `vereda-*.html` — guias de escrita (referenciados no service worker)
- `service-worker.js`, `styles.css`, `manifest.webmanifest` — infraestrutura PWA
- `CLAUDE.md`, `META_ENGINES_100.md`, `README.md` — documentação raiz

## Quando revisitar

Se o projeto crescer a ponto de ter mais de 50 arquivos JS na raiz, ou se houver um bundler/build step, aí faz sentido reorganizar. Hoje não.
