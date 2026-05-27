# Auditoria de estrutura do repo — 2026-05-26

## Estado atual

Raiz com 87 arquivos soltos. Tudo convive no mesmo nível: produção, engines,
controllers, dados, páginas editoriais, documentação, logos e experimentos.
Funciona, mas escala mal e dificulta triagem de risco.

---

## Arquivos de produção (ficam na raiz — não mover)

| Arquivo | Papel |
|---|---|
| `index.html` | Única página da aplicação |
| `app.js` | Orquestrador principal |
| `state-store.js` | Estado global |
| `styles.css` | Entry point de estilos |
| `service-worker.js` | Cache offline |
| `manifest.webmanifest` | PWA |
| `favicon.svg` | Favicon adaptativo |

---

## Engines (39 arquivos JS na raiz — candidatos a `src/engines/` e `src/controllers/` na Fase 2)

### Engines de linguagem

```
syntax-engine.js
punctuation-engine.js
analise-engine.js
lexical-engine.js
rimalab-engine.js
voice-engine.js
decolonial-engine.js
precision-engine.js
proof-engine.js
print-engine.js
vrda-engine.js
backup-engine.js
filesystem-backup-engine.js
archive-engine.js
version-engine.js
export-engine.js
template-engine.js
typewriter-engine.js
rights-engine.js
document-engine.js
pagination-engine.js
```

### Controllers

```
editor-controller.js
editor-modes.js
proof-controller.js
academia-controller.js
backup-controller.js
archive-controller.js
grammar-controller.js
reader-controller.js
pomodoro-controller.js
syntax-controller.js
tooltip-controller.js
cronograma-controller.js
```

### Utilitários e UI

```
ui-dialog.js
```

### Dados (candidatos a `src/data/`)

```
syntax-data.json
lexical-data.json
rimalab-data.json
analise-data.json
decolonial-data.json
norma-data.json
templates-data.json
criterios-data.js
synonym-data.js
```

---

## Páginas editoriais (candidatas a `pages/` na Fase 2)

Páginas HTML de apoio — conteúdo editorial, não aplicação. Referenciadas em links externos.
Mover só com redirecionamento ou alias para não quebrar SEO/links.

```
vereda-biblioteca-escrita.html
vereda-bloqueio-criativo.html
vereda-dialogos.html
vereda-estrutura-romance.html
vereda-personagens.html
vereda-primeiras-linhas.html
vereda-revisao-manuscrito.html
vereda-titulo-do-livro.html
```

---

## Documentação operacional (candidatos a `docs/` imediatamente)

Não afetam runtime — podem migrar agora sem risco.

```
META_ENGINES_100.md      → docs/META_ENGINES_100.md
CAMPANHA.md              → docs/CAMPANHA.md
DOMINIO_DNS_EMAIL.md     → docs/DOMINIO_DNS_EMAIL.md
MARCA_CANAIS.md          → docs/MARCA_CANAIS.md
MAPA_ICONES_METAFORAS.md → docs/MAPA_ICONES_METAFORAS.md
ANALITICAS_GOATCOUNTER.md → docs/ANALITICAS_GOATCOUNTER.md
AUDITORIA_ROUND1_JOBS_RESPONSIVIDADE.md → docs/
SESSAO.md                → docs/SESSAO.md
```

Ficam na raiz (referenciados explicitamente ou convenção):
```
CLAUDE.md   — instruções de projeto para Claude Code
README.md   — entrada pública do repo
```

---

## Arquivos ignorados pelo .gitignore (não entram no repo)

```
.claude/             — configuração local Claude Code
Livros/              — acervo pesado de PDFs
LivrosENG/
livrosPTBR/
dark-ensaio/         — experimentos visuais locais
experimentos/
snapshots/           — provas locais de autoria
reports/**/*.png     — screenshots de auditoria
LogoOK*.png/.svg     — fontes de marca antigas na raiz
lancamento-escrevaral.html — página não publicada
```

---

## Riscos para a Fase 2 (reorganização JS/HTML)

1. **Service worker com paths estáticos** — cada arquivo em `CORE_ASSETS` usa `./nome.js`.
   Mover engines exige atualizar todos os paths no mesmo commit.

2. **`index.html` com `<script defer src="nome.js">`** — idem.

3. **Páginas editoriais** — podem ter links externos indexados; mover requer redirect ou alias.

4. **Referências cruzadas** — engines carregam dados via `fetch("./lexical-data.json")`.
   Verificar todos antes de mover `src/data/`.

**Recomendação:** Fase 2 só após o site estar estável em produção por um ciclo.
Fazer em commits atômicos: um por grupo (controllers, engines, data).

---

## Estrutura proposta para Fase 2

```
escrevaral/
├── index.html
├── app.js
├── state-store.js
├── styles.css
├── service-worker.js
├── manifest.webmanifest
├── favicon.svg
│
├── src/
│   ├── engines/       ← todos os *-engine.js
│   ├── controllers/   ← todos os *-controller.js + editor-modes.js + ui-dialog.js
│   └── data/          ← todos os *-data.json + criterios-data.js + synonym-data.js
│
├── css/
├── fonts/
├── icons/
├── favicon_io/
├── sounds/
├── pages/             ← vereda-*.html
│
└── docs/              ← *.md operacionais (este arquivo vive aqui)
```
