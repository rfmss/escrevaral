# Morfologia Verbal — Maturidade

**LEVEL:** M3 — TESTED (escala local; ainda não submetido a revisão independente formal)
**LAST REVIEWED:** 2026-08-31 (scaffold inicial)
**STEWARD:** ainda não nomeado (decisão: só nomear quando a engine ganhar corpo)

## Mission
Identificar morfologia verbal de palavras do português (lema, tempo, modo, pessoa, número) em ES5 de baixa RAM, via trie de sufixos, para alimentar análise gramatical e realce.

## Coverage
- UNKNOWN (apenas seed com 11 formas / 4 exceções)

## Knowledge
- Approved rules: UNKNOWN
- Candidate rules: UNKNOWN
- Disputed rules: UNKNOWN

## Corpus
- Correct: 11 formas (verbos-seed) — VERIFIED
- Incorrect: UNKNOWN
- Ambiguous: UNKNOWN
- Don't interfere: 4 exceções (açúcar, coisa, etc.) — VERIFIED
- Adversarial: UNKNOWN (modelo antigravity tinha; não portado ainda)

## Quality
- Tests: 14/14 (normative + clíticos + não-se-meta) — VERIFIED (node src/test/run-morphology.js)
- Runtime tests: 5/5 (trecho inteiro via tokenizador; filas "um por vez") — VERIFIED (node src/test/run-runtime.js)
- Browser QA: 1 página ES5 sem erro de console; análise de frase inteira demonstrada ("fazê-lo"→fazer, "comam"→comer) — VERIFIED (Playwright, chromium)
- Regression tests: UNKNOWN
- Known false positives: UNKNOWN
- Tokenização de frase inteira IMPLEMENTADA (tokenizer + spans) — VERIFIED

## Runtime
- Analyzer: Escrevaral.engines.MorphologyEngine (check assíncrono) — VERIFIED
- Artifact size: ~4.5 KB engine + ~1.9 KB seed (medido) — VERIFIED
- Peak RAM: medida apenas em Node (~42 MB RSS, inclui runtime do Node; trie em si é O(n)) — PARCIAL
- Analysis time: UNKNOWN (não cronometrado)
- Legacy status: ES5 puro, sem import/export no browser (script tags), file:// OK — VERIFIED funcionalmente no chromium

## Highest-value gap
~RESOLVIDO~ → agora: ampliar corpus (das desinências do escrevaral norma-data.json) + revisão independente (regra 4 do antiprompt).
Histórico: gap de tokenização de texto contínuo RESOLVIDO (2026-08-31) via `src/core/services/tokenizer.js` + check percorre todas as palavras com spans corretos.

## Evidence for current level
M3 justificado por: testes reproduzíveis 14/14 + 3/3 + QA de browser sem erro. Não é M4+ (falta adversarial) nem M6 (falta medição legado real).

## Promotion candidate
M4 — ADVERSARIAL: requer corpus adversarial (portar do antigravity) + falso-positivos atacados + revisão independente.

## Changelog
- 2026-08-31 — scaffold inicial em ES5, seed 11 formas, testes 14/14, runtime 5/5 (após tokenizador), QA browser OK.
- 2026-08-31 — gap de tokenização resolvido: engine v1.1.0 percorre frases via tokenizer (spans corretos).
