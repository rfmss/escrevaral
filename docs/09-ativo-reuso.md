# 09. Catálogo de Ativos Reutilizáveis

Tudo que pode ser **copiado/reutilizado** direto (assets) ou servir de **base de dados** (engines puras/dados) para o Escrevaral-Encore. Baixa RAM = preferir dados compactos e engines enxutas.

---

## Sons — Teclado / máquina de escrever

| Asset | Fonte | Uso |
|---|---|---|
| typewriter.wav | escrevaral: `sounds/`; Typew raiz (idênticos) | Som de digitação |
| backspace.wav | escrevaral `sounds/`; Typew raiz | Som de apagar |
| Enter.wav | escrevaral `sounds/`; Typew raiz | Som de Enter |
| mech-keyboard-*.wav (3) | Typew `sounds/` | Alternativo de teclado mecânico |
| tvOn/off1/off2.mp3 | Typew raiz | Transições de tela/modo foco |
| pausartrabalho/voltartrabalho.mp3 | Typew raiz | Som de pomodoro (pausa/volta) |
| Fimdopomodoro.wav | Typew `sounds/` | Fim de pomodoro |

## Sons — Ambiente / Frequências (item "som ambiente que estimula e não dá sono")

| Asset | Fonte | Uso |
|---|---|---|
| cafe.ogg (cafeteria) | antigravity `audio/` | Ambiente cafeteria |
| rain.ogg | antigravity `audio/` | Ambiente chuva |
| floresta.ogg | antigravity `audio/` | Ambiente floresta |
| lareira.ogg | antigravity `audio/` | Ambiente lareira |
| trem.ogg | antigravity `audio/` | Ambiente trem |
| brown.wav (ruído marrom) | antigravity `audio/` | Ruído de fundo |
| pink.wav | antigravity `audio/` | **Pink noise** (requisito) |
| beta.wav | antigravity `audio/` | **Frequência beta** (foco) |
| gamma.wav | antigravity `audio/` | **Frequência gama** (foco) |
| music.mp3 | Typew raiz | Trilha ambiente |
| CryingThereminLoop*.mp3, TimeSurveillance*.mp3 | Typew `sounds/` | Ambientes alternativos |

## Fontes (offline-friendly)

| Font | Fonte |
|---|---|
| typewriter.woff (Typewriter) | antigravity `fonts/` |
| merriweather.woff (serif) | antigravity `fonts/` |
| atkinson.woff (sans legível) | antigravity `fonts/` |
| (Referência) Newsreader + Manrope | vereda (CDN → vendorizar) |
| (Referência) Literata/Merriweather/Lato, Courier New | Typew/eskrev |

## Dados linguísticos PT-BR (engines puras → o coração do Encore)

| Dado | Fonte | Tamanho/formato-chave |
|---|---|---|
| lexical-data.json + synonym-data.js | escrevaral | ~1350 sinônimos, ~1020 definições, polissemia 110+, léxico literário 527 |
| norma-data.json | escrevaral | verbos_pres 2168, irregulares 2002, adjetivos 2914, particípios, topônimos/siglas PT-BR |
| syntax-data.json | escrevaral | blocos de sintaxe (conjunções, tempos, funções, orações, figuras, preposições) |
| decolonial-data.json | escrevaral | 606 entradas, 9 categorias |
| rimalab-data.json | escrevaral | enciclopédia 50, grammarWords 348 |
| analise-data.json | escrevaral | regras A-01 (157), cliques 1000, pleonasmos 500, stopwords 116 |
| criterios-data.js | escrevaral | critérios de análise nomeados |
| templates-data.json | escrevaral | templates/ofícios por gênero |
| lexCheck (dicionário ~360k) | eskrev | léxico grande (revisar licença) |
| verbMorphology (lemas/paradigmas/clíticos) | masse-notes | morfologia verbal verificada |
| verb-provenance.json | masse-notes | proveniência de regras verbais |

## Engines puras (sem DOM) — portar/reescrever em ES5

| Engine | Fonte | Reuso |
|---|---|---|
| analise-engine, syntax-engine, punctuation-engine, precision-engine, voice-engine, rimalab-engine, lexical-engine, decolonial-engine, relative-clause-engine | escrevaral | Núcleo PT-BR |
| proof-engine + version-engine + vrda-engine | escrevaral | Autoria/integridade |
| export-engine + import-engine | escrevaral | EPUB/DOCX/ZIP sem libs |
| pagination-engine, document-engine, editor-modes | escrevaral | Editor/paginação |
| backup-engine, state-store | escrevaral | Offline/estado |
| uairer-ptbr-engine (lexical/syntax/punctuation/grammar) | uai.rer | Motor standalone, contrato {kind,value,confidence,reason} |
| keyclick (audio pool) | Typew | Som de teclado |
| pomo-lock | Typew | Pomodoro com trava |
| Authoria (.skv + verify) + qrStream + idb | eskrev | Autoria + QR/offline |
| analyzers ES5 + lexicon-storage | antigravity | Contrato de engine + storage O(1) |

## Programas de compatibilidade legado (referência)
- `machine/storage/lexicon-storage.js` — léxico O(1) 100k entradas sem OOM (Android 4.4).
- Harnesses QA: `machine/analyzers/*/test.js` e `tests/*/legacy-qa-harness.html` (antigravity).
- `js/core/runtime-bootstrap.js`, `js/core/linguistic-core/contracts.js`, `js/core/editor/*` (antigravity) — runtime ES5 pronto.

> Regra do Encore: **não copiar código bruto** — usar estes como especificação de comportamento (dados + contrato) e recriar em ES5 de baixa RAM.
