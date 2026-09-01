# Tokenização — Maturidade

**LEVEL:** M3 — TESTED
**LAST REVIEWED:** 2026-08-31
**STEWARD:** ainda não nomeado

## Mission
Dividir texto em palavras (com acentos e clíticos com hífen) preservando spans para o editor. Infra base de toda análise por palavra.

## Coverage
- Palavras PT-BR com acentos — VERIFIED
- Clíticos com hífen/apóstrofo (fazê-lo, dar-te-ei) — VERIFIED

## Quality
- Testes indiretos: 5/5 no run-runtime (frases inteiras com spans) — VERIFIED
- Browser QA sem erro — VERIFIED
- Regression: UNKNOWN

## Runtime
- Arquivo: src/core/services/tokenizer.js (~1 KB ES5)
- Legacy: ES5 puro, via script tag — VERIFIED (chromium)

## Changelog
- 2026-08-31 — portado do antigravity (js/core/linguistic-core/services/tokenizer.js); adicionada preservação de clíticos (hífen/apóstrofo interno).
