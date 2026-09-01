# Orações Adjetivas — Maturidade

**LEVEL:** M3 — TESTED
**LAST REVIEWED:** 2026-09-01
**STEWARD:** ainda não nomeado (só nomear quando a engine ganhar corpo)

## Mission
Classificar orações adjetivas introduzidas por `que` em PT-BR como **explicativa / restritiva / ambígua**, com política de abstenção: só emite classificação de alta confiança quando há evidência textual forte; caso contrário preserva a intenção da escritora (leitura ambígua). Alimenta os corretores de pontuação (vírgula obrigatória/proibida).

## Coverage
- Restritiva (delimitador explícito: apenas/somente/só) — VERIFIED
- Explicativa (referente único: Brasil, Terra, Machado de Assis...) — VERIFIED
- Explicativa (propriedade geral documentada: baleias→sangue quente, triângulos→3 lados) — VERIFIED
- Ambígua / abstenção — VERIFIED
- Abstenção por conjunção integrante (verbo dicendi: acha/diz/acredita...) → não é adjetiva — VERIFIED
- Abstenção por `o que` demonstrativo — VERIFIED

## Knowledge
- Approved rules: orações com delimitador explícito = restritiva; referente único ou propriedade geral = explicativa; senão ambígua — VERIFIED
- Candidate rules: UNKNOWN
- Disputed rules: UNKNOWN

## Corpus
- Correct: 11 casos em `src/test/run-relative-clause.js` (restritiva ×2, explicativa ×3, ambígua, integrante, demonstrativo, vazio ×2, contrato) — VERIFIED
- Incorrect: UNKNOWN
- Ambiguous: ambígua (abstenção) — VERIFIED
- Don't interfere: conjunção integrante + `o que` demonstrativo — VERIFIED
- Adversarial: UNKNOWN (não portado ainda; fonte tinha bateria oficial 1915/1915 e focal 22/22)

## Quality
- Tests: 11/11 — VERIFIED (node src/test/run-relative-clause.js)
- Regression (morfologia/runtime inalteradas): 14/14 + 5/5 — VERIFIED
- Browser QA: pendente (próximo passo: botão no index.html + Playwright)
- Known false positives: UNKNOWN
- Fonte legada: auditoria escrevaral — focal 22/22, bateria 1915/1915, P0=0/P1=0 (não re-executado aqui; só comportamento portado)

## Runtime
- Analyzer: Escrevaral.engines.RelativeClauseEngine (check assíncrono) — VERIFIED
- Artifact size: ~9 KB engine (sem dados) — VERIFIED (medição aprox.)
- Peak RAM: O(n); não cronometrado — PARCIAL
- Analysis time: UNKNOWN
- Legacy status: ES5 puro, sem import/export no browser; normalização por mapa manual (sem normalize/\p{L}) — VERIFICADO funcionalmente em Node; QA de browser pendente

## Highest-value gap
- QA de browser (Playwright) para validar piso legado e o botão no index.html.
- Portar bateria adversarial da fonte (1915 casos) para promoção M4.
- Revisão independente (regra 4 do antiprompt).

## Evidence for current level
M3 justificado por testes reproduzíveis 11/11 + regressão verde das engines vizinhas. Não é M4+ (falta adversarial) nem M6 (falta medição legado real).

## Promotion candidate
M4 — ADVERSARIAL: requer corpus adversarial portado da fonte + falso-positivos atacados + revisão independente + QA browser.

## Changelog
- 2026-09-01 — portado de escrevaral (relative-clause-engine.js) para ES5/contrato Encore; 11/11 testes; MATURITY inicial M3.
