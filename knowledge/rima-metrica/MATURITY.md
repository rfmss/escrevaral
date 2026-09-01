# Rima e Métrica — Maturidade

**LEVEL:** M3 — TESTED
**LAST REVIEWED:** 2026-09-01
**STEWARD:** ainda não nomeado (só nomear quando a engine ganhar corpo)

## Mission
Analisar ritmo de poesia em PT-BR: silabificação, tonicidade, escansão de verso (com sinalefa), som de rima, correspondência consoante/toante, esquema de rimas (A B B A), nome do metro e de esquemas canônicos. Também detecta padrão sonoro interno em prosa. Alimenta a oficina de escrita (academia) e corretores de métrica.

## Coverage
- Silabificação PT-BR real (ditongos, hiatos, nasais, dígrafos lh/nh/ch, qu/gu mudo) — VERIFIED
- Tonicidade (oxítona/paroxítona/proparoxítona/monossílabo; acento gráfico + regras) — VERIFIED
- Escansão de verso com sinalefa conservadora (palavras funcionais átonas) — VERIFIED
- Som de rima desde a vogal tônica; rima consoante e toante (assonância) — VERIFIED
- Classificação rica/pobre/preciosa por heurística de sufixo (sem dicionário) — VERIFIED
- Esquema de rimas (letras) + nomeação de esquemas canônicos (soneto, quarteto, décima...) — VERIFIED
- Prosa → detecção de padrão sonoro interno — VERIFIED

## Knowledge
- Approved rules: contagem até a última tônica (regra de ouro); sinalefa só em átona; ditongos crescentes condicionados a cluster/acento — VERIFIED
- Candidate rules: UNKNOWN
- Disputed rules: tonicidade de "dói" (tratado como paroxítona pela notação de acento), casos regionais de dicção — registrados na nota acadêmica

## Corpus
- Correct: 29 casos em `src/test/run-rima-metro.js` + comparação de fidelidade com a fonte (110 pontos: syl/ton/sound/scan/rhyme iguais) — VERIFIED
- Incorrect: UNKNOWN
- Ambiguous: rimas toante vs consoante; esquemas com letras minúsculas — VERIFIED
- Don't interfere: palavras sem rima ("amor"×"mar" → nenhuma) — VERIFIED
- Adversarial: UNKNOWN

## Quality
- Tests: 29/29 — VERIFIED (node src/test/run-rima-metro.js)
- Fidelidade com fonte (rimalab-engine.js): silabificação/tonicidade/som/escansão/rima **idênticos**; difere só onde o fonte tem bug de mutação de array (metrics em ordem correta no Encore) — VERIFIED
- Regression (demais engines): morfologia 14/14, runtime 5/5, orações 11/11, decolonial 7/7 — VERIFIED
- Browser QA: pendente (próximo passo: botão no index.html + Playwright)
- Known false positives: UNKNOWN

## Runtime
- Analyzer: Escrevaral.engines.RimaLabEngine (check assíncrono) — VERIFIED
- Artifact size: ~16 KB engine (sem dados; núcleo analítico sem dicionário) — VERIFIED (aprox.)
- Peak RAM: O(n·palavras); não cronometrado — PARCIAL
- Analysis time: UNKNOWN (não cronometrado)
- Legacy status: ES5 puro; sem Set/arrow/spread/??./template; `\p{L}`→classes explícitas; sem fetch (dados opcionais não usados) — VERIFICADO em Node; QA browser pendente

## Highest-value gap
- QA de browser (Playwright) + botão no index.html.
- Reintegrar dicionário (grammarWords) como opcional, para rica/pobre mais precisa + findRhymes (decisão do dono: adiado).
- Portar bateria adversarial/focal da fonte para promoção M4.
- Revisão independente (regra 4 do antiprompt).

## Evidence for current level
M3 justificado por testes reproduzíveis 29/29 + fidelidade de comportamento com a fonte (110 pontos) + regressão verde. Não é M4+ (falta adversarial) nem M6 (falta medição legado real).

## Promotion candidate
M4 — ADVERSARIAL: bateria adversarial/focal da fonte + falso-positivos atacados + revisão independente + QA browser + cronometragem.

## Changelog
- 2026-09-01 — portado núcleo analítico de rimalab-engine.js para ES5/contrato Encore, sem dicionário (decisão do dono); 29/29 testes; fidelidade verificada contra a fonte; MATURITY inicial M3.
