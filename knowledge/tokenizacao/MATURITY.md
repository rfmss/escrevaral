# Tokenização — Maturidade

**LEVEL:** M3 — TESTED
**LAST REVIEWED:** 2026-09-04
**STEWARD:** ainda não nomeado

## Mission
Dividir texto em palavras (com acentos e clíticos com hífen) preservando spans para o editor. Infra base de toda análise por palavra.

## Coverage
- Palavras PT-BR com acentos, cedilha e `ü/Ü` — VERIFIED localmente
- Clíticos com hífen, apóstrofo reto ou tipográfico (`fazê-lo`, `d'água`, `d’água`) — VERIFIED localmente
- Spans UTF-16 exatos no texto original — VERIFIED localmente

## Quality
- Banca direta: 10/10 em `src/test/run-tokenizer.js` — VERIFIED localmente
- Testes indiretos: 5/5 no `run-runtime.js` — VERIFIED localmente
- Regressão completa do branch: PENDING nesta revisão
- Gate físico da morfologia 29/29 após a mudança: PENDING

## Runtime
- Arquivo: `src/core/services/tokenizer.js` (~1 KB ES5)
- Versão: 1.0.1
- Carregamento: somente dentro das cápsulas que dependem dele

## Changelog
- 2026-08-31 — portado do antigravity (js/core/linguistic-core/services/tokenizer.js); adicionada preservação de clíticos (hífen/apóstrofo interno).
- 2026-09-04 — banca direta criada; corrigidos apóstrofo tipográfico e `ü/Ü`. Falhas anteriores reproduzidas: `d’água` virava dois tokens e `Müller` perdia o `ü`. Maturidade mantida em M3 até regressão física da morfologia.

## Limites abertos

- A classe explícita cobre o alfabeto necessário ao escopo PT-BR atual, não todos os nomes em todos os alfabetos.
- Tokenização não faz segmentação de sentenças nem classificação gramatical.
- A alteração 1.0.1 toca uma dependência da morfologia M4; exige repetir o gate 29/29 no iPad certificado antes de encerrar a regressão.
