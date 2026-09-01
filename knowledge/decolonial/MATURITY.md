# Decolonial / Vocabulário — Maturidade

**LEVEL:** M3 — TESTED
**LAST REVIEWED:** 2026-09-01
**STEWARD:** ainda não nomeado (só nomear quando a engine ganhar corpo)

## Mission
Detectar, em português brasileiro, termos com carga colonial/racista/classista/etárea/sexista/xenófoba (e derivados de deficiência) e sugerir alternativas, com nota contextual. Apoia o autor a escrever com atenção a vieses (academia do novo escritor).

## Coverage
- 9 categorias: território, povos, conhecimento, estética, relações, linguagem, deficiência, gênero, classe — VERIFIED
- Detecção por termo (com fronteira de palavra) + contagem — VERIFIED
- Normalização de acento (casa formas acentuadas/não-acentuadas) — VERIFIED
- Marca "contextual" (pode ser mantido em citação/crítica) — VERIFIED (dado)

## Knowledge
- Approved rules: termo normalizado (sem acento/minúsculo) casado com fronteira de letra/dígito; entrada contextual sinalizada — VERIFIED
- Candidate rules: UNKNOWN
- Disputed rules: UNKNOWN

## Corpus
- Correct: 7 casos em `src/test/run-decolonial.js` (escravo, criado mudo, sem-termo, vazio, plural-não-separa, acento-normalizado) — VERIFIED
- Incorrect: UNKNOWN
- Ambiguous: termos `contextual: true` (ex.: "criado mudo") — VERIFIED (dado)
- Don't interfere: palavra com substring (ex.: "escravos" não casa com "escravo" — fronteira) — VERIFIED
- Adversarial: UNKNOWN

## Quality
- Tests: 7/7 — VERIFIED (node src/test/run-decolonial.js)
- Regression (demais engines): morfologia 14/14, runtime 5/5, orações adjetivas 11/11 — VERIFIED
- Browser QA: pendente (próximo passo: botão no index.html + Playwright)
- Known false positives: UNKNOWN
- Fonte legada: escrevaral decolonial-engine v786+ (606 entradas; auditorias noturnas acompanham) — comportamento portado, bateria não re-executada aqui

## Runtime
- Analyzer: Escrevaral.engines.DecolonialEngine (check assíncrono) — VERIFIED
- Data: `src/data/decolonial-data.js` (~215 KB embedded, 606 entradas; também `.json` para testes) — VERIFIED
- Peak RAM: O(termos) por texto; não cronometrado — PARCIAL
- Analysis time: UNKNOWN (não cronometrado; varre 606 termos por texto)
- Legacy status: ES5 puro, sem import/export no browser; carrega via script tag (off-line, sem fetch) — VERIFICADO funcionalmente em Node; QA browser pendente

## Highest-value gap
- QA de browser (Playwright) no piso legado + botão no index.html.
- Portar/mapear bateria adversarial da fonte para promoção M4.
- Revisão independente (regra 4 do antiprompt).
- Medir RAM/tempo com o dado de 606 termos num texto longo.

## Evidence for current level
M3 justificado por testes reproduzíveis 7/7 + regressão verde das engines vizinhas + dado real (606 entradas). Não é M4+ (falta adversarial) nem M6 (falta medição legado real).

## Promotion candidate
M4 — ADVERSARIAL: requer bateria adversarial + falso-positivos atacados + revisão independente + QA browser + medição de runtime.

## Changelog
- 2026-09-01 — portado de escrevaral (decolonial-engine.js + decolonial-data.json) para ES5/contrato Encore, dados embutidos off-line; 7/7 testes; MATURITY inicial M3.
