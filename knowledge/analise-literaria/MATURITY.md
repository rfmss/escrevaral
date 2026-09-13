# Análise Literária (Vereda v3) — Maturidade

**LEVEL:** M4 — ADVERSARIAL (revisão independente + QA de browser)
**VERSION:** 3.0.0 (port ES5)
**LAST REVIEWED:** 2026-09-12 (cápsula do cofre)
**STEWARD:** ainda não nomeado

## Mission
Análise textual offline (framework editorial, 39 critérios; 21 computáveis sem LLM): métricas de economia, clareza, ritmo, voz, estrutura, POV e léxico, com alerta e ação corretiva. Port ES5 do `escrevaral/analise-engine.js` (Vereda v3), validado por **fidelidade comportamental** contra ouro gerado pela fonte ES6.

## Coverage
- Economia: advérbios -mente (densidade), voz passiva aproximada (proporção), pleonasmos/redundâncias, negação dupla — VERIFIED
- Clareza: comprimento médio/desvio, frases longas/muito longas, pronome ambíguo, subordinação excessiva, mistura de tempos, Flesch-BR + rótulo — VERIFIED
- Ritmo: variação (DP), distribuição curta/média/longa, repetição lexical próxima (janela 3 frases), abertura fraca de parágrafo — VERIFIED
- Voz: clichês (skip em poesia) — VERIFIED
- Estrutura: proporção de partes (≥3 parágrafos), transições por conectivos — VERIFIED
- POV: consistência de pessoa (1ª/3ª/autor-ref) com `consistente` — VERIFIED
- Léxico: verbos de estado (proporção/nível), substantivos vagos (densidade/lista ≤8) — VERIFIED
- Norma: pontuação `null` quando `VeredaPunctuation` ausente (degradação declarada) — VERIFIED
- `interpretarResultado`: alertas ordenados por severidade (alto→moderado) com dim/id/nível/msg/ação — VERIFIED
- `analisar()` guarda de ≥30 palavras e rejeita vazio — VERIFIED
- `formato:"poema"` (skipPleonasmos/skipCliches) — VERIFIED (caso poema)

## Knowledge
- Approved rules: métricas determinísticas locais; dados embutidos idênticos à fonte — VERIFIED
- Candidate rules: UNKNOWN
- Disputed rules: heurísticas de proporção de partes (intro/miolo/conclusão por posição) e repetição por janela de 3 frases são aproximações — VERIFIED (limitação da fonte, preservada)

## Corpus
- Correct: **9 casos** congelados (narrativa 3p, epistolar 1p, ensaio subordinativo, **texto-sujeira**, poema, curto + **3 regressões de opções**: `editorMode:true`, `oficio:true`, `formato:5`). — VERIFIED
- **Adversarial: 7 casos hostis** (mínimo pontuado, caps-misto com abreviações/moeda, repetição para janela 3-frases, voz-passiva saturada, HTML/injection de marcas e aspas curvas, pleonasmo provocado, mistura de tempos) — fidelidade do port ≡ fonte **43/43** sob ataque, 0 crashes (fracture do conversor) — VERIFIED
- Fidelidade: análise + meta + 8 dimensões + alertas **idênticos** à fonte original em `analise-literaria-golden.json` (o gerado a partir da fonte ES6) — VERIFIED
- Texto-sujeira: 12 alertas (voz passiva, pleonasmos, aberturas fracas, mistura de tempos, pronomes ambíguos...) — VERIFIED
- Incorrect: UNKNOWN
- Ambiguous: textos <30 palavras → `null` (não analisado); norma.pontuação vazio sem engine de pontuação — VERIFIED
- Don't interfere: poema não gera alerta de pleonasmo/clichê — VERIFIED
- Adversarial: UNKNOWN (parcial — texto-sujeira obedece) — VERIFIED

## Quality
- Tests: **114/114** — VERIFIED (`node src/test/run-analise-literaria.js`), incluindo contrato `check` assíncrono com `Finding`s por caso (72 originais + 42 dos 3 casos de regressão de opções)
- Adversarial: **43/43** (`run-analise-literaria-adversarial.js`) — port ≡ fonte sob ataque
- Pureza ES5 + integridade de dados: **4/4** (`run-es5-purity.js`, integrada ao `run-all.js`) — 0 marcadores ES6 fora de strings/comentários
- Regressão das demais engines do cofre: rodada `run-all.js` toda verde (19 suítes, 407 casos)
- **Browser QA: 51/51 no Chromium (Playwright)** — `tools/qa-browser/qa-browser.js`: as MESMAS bancas fidelidade + adversarial do ouro rodadas DENTRO do browser (script tags clássicos, sem bundler), comparação com o OURO da fonte (analise 18/18 inclusive `options` A1; lexico 13/13; contratos Encore `check→Findings` 2/2; UI legada interativa 2/2 + screenshot `qa-browser.png`) — VERIFIED
- Known false positives: UNKNOWN

## Runtime
- Analyzer: `Encore.core.engines.AnaliseLiterariaEngine` (check assíncrono via `setTimeout`; id ANALISE-LITERARIA) — VERIFIED
- Artifact size: ~121 KB ES5 (engine + listões embutidos; sem dados externos consumidos) — VERIFIED (aprox.)
- Peak RAM (texto longo 11,2 KB / 2.008 pal., processos separados, `--expose-gc`): heap retido pós-análise ~5 MB; **RSS pico fonte 52,1 MB vs port 53,8 MB (≈1,03x)** — VERIFIED (`tools/bench-ports-long.js`)
- Analysis time: **3,7 KB (733 pal.) → port ~21 ms = ~177 k chars/s vs fonte ~25 ms (0.84–1.05x, sem regressão)** — VERIFIED (Node 22, best-of-5, `tools/bench-ports.js`, 2 amostras); **texto longo 11,2 KB/2.008 pal.: fonte ~134–204 ms vs port ~147–156 ms (0.77–1.10x, port na média ligeiramente mais rápido)** — VERIFIED (`tools/bench-ports-long.js`)
- Revisão mecânica: conversão auditada — **zero** `this.`/`arguments` em arrows (sem risco de captura `this`), zero shorthand inline residual, zero `??`/`||=`; `for..of` só em arrays; `?.` (7/7) sem chamadas opcionais com efeito colateral — VERIFIED (auditoria estática)
- Legacy status: ES5 puro (var/functions; LSet; polainéis `includes/startsWith/endsWith/matchAll`; sem arrow/template/`?.`/spread/destructuring/`new Set`); template-literal e arrows convertidos mecanicamente; **regressão de pureza contínua `run-es5-purity.js` (0 marcadores ES6)** — VERIFICADO em Node + **Chromium (Playwright)**
- Reprodução: `tools/port-vereda-es5.js` regenera o engine (fonte original como arg) + `tools/generate-analise-golden.js` regenera o ouro — VERIFIED

## Highest-value gap
- Fusão `analyzeComplete` (Vereda × critérios de qualidade da voz) quando `analyzeDeep` da pontuação existir.

## Evidence for current level
M4 justificado por 114/114 com ouro da fonte (fidelidade comportamento-for-comportamento, incluindo regressões de `options` booleano/número) + **revisão independente** (auditoria externa, achado A1 corrigido e coberto por banca) + **QA de browser 51/51** (mesmas bancas rodando em Chromium via Playwright) + pureza ES5 4/4 + 43/43 adversarial sem crashes + cronometragem sem regressão. Não é M6 (falta medição do legado real em produção).

## Promotion candidate
M4 — ADVERSA RI: bateria adversarial ✓; revisão independente ✓; cronometragem ✓; **QA browser ✓ (Playwright, 51/51 — ver Quality)**. Decidir fusão `analyzeComplete` no próximo ciclo. M6 requer telemetria do app real.

## Changelog
- 2026-09-12 — port ES5 mecânico (Vereda v3) + ouro congelado da fonte ES6; 72/72 fidelidade; contrato Encore (check assíncrono → Findings); MATURITY inicial M3.
- 2026-09-12 — banca adversarial (7 casos) + ouro adversarial da fonte; 43/43 sob ataque; MATURITY atualizado (M3 robusto, promoção M4 pendente de revisão independente).
- 2026-09-12 — **revisão independente** (auditoria externa, ~1.100 chamadas criativas lado a lado fonte×port): achado **A1 (alto)** — interpolação única de template sem coerção `String()` fazia o port lançar onde a fonte respondia com `options` booleano/número (`editorMode`/`oficio`/`formato`); **A2 (médio)** — `/` de divisão após `)` era confundido com regex e engolia a linha seguinte (`const dp` + arrow residuais); **A3 (baixo)** — `const { … } = resultado` (destructuring) não convertido; **A4 (baixo teórico)** — `LSet`/`LMap` com chave `__proto__`. Corrigidos no conversor (`"" + ` na interpolação; `isRegexStart` exclui `)`; novo passo `stepObjectDestructure`; `Object.create(null)` no banner), engines regenerados e re-aprovados. Nova banca de regressão `options` (3 casos) no ouro da fonte. 19 suítes / 407 casos verdes; pureza ES5 0 marcadores. (Revisão: `run-es5-purity.js` integrado ao `run-all.js`.)
- 2026-09-12 — **QA de browser (Playwright/Chromium)**: piso legado em `tools/qa-browser/index.html` (script tags ES5 clássicos, sem bundler) + runner `tools/qa-browser/qa-browser.js` executando as MESMAS bancas do ouro NO browser — **51/51** (analise fid 9 + adv 7; lexico fid 6 + adv 7; contratos 2; UI legada 2) ≡ OURO da fonte, screenshot `qa-browser.png`. Contrato `check→Findings` validado em browser (span ARRAY `[start,end]` na analise; OBJETO `{start,length}` no lexico). Sem divergência fonte×port em Chromium. **LEVEL promovido a M4.**
- 2026-09-12 — **cronometragem RAM+tempo em texto longo** (`tools/bench-ports-long.js`, fonte×port em PROCESSO SEPARADO, `VmHWM` do kernel + heap pós-GC): texto 11,2 KB/2.008 pal. → analise **fonte ~134–204 ms vs port ~147–156 ms (0.77–1.10x)**; **RSS pico 52,1 vs 53,8 MB (≈1,0x)**, heap retido ~5 MB. Sem regressão de tempo nem de memória. Gap de Runtime PARCIAL⇒VERIFIED.