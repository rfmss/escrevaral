# Estrutura do Repositório — Escrevaral
Atualizado em: 2026-05-31

## Raiz — produto ativo

```
index.html               ← entrada única do app
styles.css               ← importa css/*.css
service-worker.js        ← cache offline, CORE_ASSETS
manifest.webmanifest     ← PWA
favicon.svg              ← ícone principal
CLAUDE.md                ← instruções para Claude
META_ENGINES_100.md      ← estado de maturidade das engines
README.md                ← apresentação pública do repo
robots.txt / sitemap.xml / CNAME / .nojekyll ← infraestrutura GitHub Pages
```

## Engines de linguagem (raiz)

```
syntax-engine.js         punctuation-engine.js    analise-engine.js
lexical-engine.js        rimalab-engine.js        voice-engine.js
decolonial-engine.js     precision-engine.js      proof-engine.js
print-engine.js          export-engine.js         template-engine.js
version-engine.js        backup-engine.js         filesystem-backup-engine.js
archive-engine.js        badges-engine.js         typewriter-engine.js
rights-engine.js         document-engine.js       pagination-engine.js
vrda-engine.js
```

## Controllers e app (raiz)

```
app.js                   state-store.js
editor-controller.js     editor-modes.js          grammar-controller.js
syntax-controller.js     proof-controller.js      backup-controller.js
archive-controller.js    academia-controller.js   cronograma-controller.js
reader-controller.js     pomodoro-controller.js   tooltip-controller.js
ui-dialog.js
```

## Dados JSON (raiz)

```
syntax-data.json         norma-data.json          lexical-data.json
rimalab-data.json        analise-data.json        decolonial-data.json
templates-data.json      criterios-data.js        synonym-data.js
```

## HTMLs de guias de escrita (raiz)
Referenciados em index.html e service-worker.js — NÃO mover.

```
vereda-biblioteca-escrita.html
vereda-titulo-do-livro.html
vereda-primeiras-linhas.html
vereda-revisao-manuscrito.html
vereda-bloqueio-criativo.html
```

## Pastas de produto

```
css/                     ← todos os estilos (@import em styles.css)
favicon_io/              ← favicons e webmanifest
icons/                   ← ícones SVG/PNG do produto (alguns no SW)
fonts/                   ← material-symbols-outlined.woff2
sounds/                  ← áudios do modo máquina de escrever
synonyms/                ← dados de sinônimos
```

## Pastas de processo (não fazem deploy)

```
.claude/agents/          ← agentes especializados (arquivista, analista-fluxo etc.)
personas/
  sala-de-espera/        ← testadoras (Beatriz, Lucas, Catedrático...)
  qg-escrevaral/         ← PO, Técnico, Arquivista
scripts/
  corpus-catedratico.txt ← 81 frases · 18 zonas de risco linguístico
  gerar-golden.py        ← gera golden files (rodar 1x para baseline)
  comparar-golden.py     ← roda corpus e gera relatório de regressão
  golden/                ← saída das engines como linha de base
reports/
  agente/                ← relatórios diários do guarda de regressão
  auditoria/             ← auditorias de UX, dark mode, tooltip etc.
  planos/                ← planos de features (badges etc.)
.github/workflows/
  guarda-regressao.yml   ← Actions diário: corpus → relatório → issue se regressão
```

## Pastas de documentação

```
docs/
  _decisoes/             ← DOMINIO_DNS_EMAIL, ANALITICAS_GOATCOUNTER, MAPA_ICONES,
                            AUDITORIA_ROUND1, SESSAO
  _campanhas/            ← CAMPANHA.md, MARCA_CANAIS.md
  _legado/               ← HTMLs antigos (vereda-personagens, dialogos, estrutura-romance)
  repo-structure-*.md    ← snapshots da estrutura do repo
```

## Pastas ignoradas pelo git (locais)

```
assets/marca-historico/  ← logos e SVGs históricos de marca (não deploy)
Livros/                  ← referências editoriais PT (EPUBs)
livrosPTBR/              ← referências PT-BR
LivrosENG/               ← referências em inglês
dark-ensaio/             ← protótipo do tema escuro
experimentos/            ← experimentos (livro-3d etc.)
```
