# Morfologia Verbal — Maturidade

**LEVEL:** M3 — TESTED (escala local; ainda não submetido a revisão independente formal)
**LAST REVIEWED:** 2026-09-01 (gate físico no iPad alvo)
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
- Browser QA: análise de frase inteira demonstrada ("fazê-lo"→fazer, "comam"→comer) — VERIFIED
- Legacy device QA: engine real executada e descartada no iPad MD531GP/A, iOS 9.3.5 (13G36) — VERIFIED fisicamente
- Regression tests: UNKNOWN
- Known false positives: UNKNOWN
- Tokenização de frase inteira IMPLEMENTADA (tokenizer + spans) — VERIFIED

## Runtime
- Analyzer: Escrevaral.engines.MorphologyEngine (check assíncrono) — VERIFIED
- Artifact size: ~4.5 KB engine + ~1.9 KB seed (medido) — VERIFIED
- Peak RAM: não exposto de forma confiável pelo Safari legado; estabilidade e descarte observados, sem medida direta — PARCIAL
- iPad alvo, partida fria: 2.310 ms, incluindo Worker + cinco importScripts + parse + trie + análise + descarte — VERIFIED fisicamente
- iPad alvo, repetições com recursos armazenados: 36–48 ms (36, 47, 48 ms) — VERIFIED fisicamente
- Offline: fechamento e reabertura em modo avião confirmados — VERIFIED fisicamente
- Legacy status: ES5 puro; cápsula Worker funcional no iOS 9.3.5 — VERIFIED fisicamente

## Highest-value gap
Ampliar o corpus com regras e lemas provenientes das fontes escolhidas no catálogo, preservando shards e carga unitária, e criar corpus adversarial independente.

## Evidence for current level
M3 continua correto: testes reproduzíveis, tokenização, QA de browser e gate físico no aparelho-alvo. O teste físico remove a incerteza de compatibilidade básica, mas não promove a engine: cobertura, ambiguidades, falso-positivos e adversarial continuam desconhecidos.

## Promotion candidate
M4 — ADVERSARIAL: requer corpus adversarial separado, falso-positivos atacados e revisão independente.

## Changelog
- 2026-08-31 — scaffold inicial em ES5, seed 11 formas, testes 14/14, runtime 5/5 e QA de browser.
- 2026-08-31 — tokenização de frase inteira implementada via `src/core/services/tokenizer.js`.
- 2026-09-01 — gate físico aprovado no iPad MD531GP/A com iOS 9.3.5: offline confirmado; morfologia real em 36–48 ms após partida fria; Worker descartado após cada resposta. Maturidade mantida em M3.
