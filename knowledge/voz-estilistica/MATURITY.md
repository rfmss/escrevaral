# Voz e Estilística — Maturidade

**LEVEL:** M3 — TESTED
**LAST REVIEWED:** 2026-09-01
**STEWARD:** ainda não nomeado (só nomear quando a engine ganhar corpo)

## Mission
"Espelho de Voz": ler a superfície estilística de um texto em prosa PT-BR e devolver um diagnóstico heurístico de gesto de voz (11 gestos), pontos fortes, pontos cegos, público provável e exercícios de oficina. Alimenta a academia de escrita com feedback de estilo imediato. Núcleo analítico autossuficiente (dados embutidos, off-line).

## Coverage
- Métricas: TTR (riqueza vocabular), densidade lexical, extensão média de frase, variação rítmica (desvio-padrão), média de frases por parágrafo — VERIFIED
- Perfil de pontuação: vírgulas, ponto e vírgula, dois-pontos, interrogações, exclamações, diálogo (travessão/aspas) — VERIFIED
- Repetições recorrentes (palavras >3 letras com ≥3 ocorrências) — VERIFIED
- Score de 6 léxicos emocionais (melancolia, tensão, luminosidade, ironia, contemplação, ternura) — VERIFIED
- Classificação de 9 campos semânticos (corpo, casa, natureza, memória, conflito, pensamento, cidade, sobrenatural, trabalho) — VERIFIED
- Gesto de voz (11 tipos: introspectivo, oral, imagético, ensaístico, seco, barroco, contemplativo, narrativo, sobrenatural, irônico, resistência) por heurística — VERIFIED
- Ecos literários (3 referências por gesto), forças, pontos cegos, público e exercícios — VERIFIED
- Detecção de contexto poesia/roteiro via `ctx.formato` para calibrar alertas — VERIFIED

## Knowledge
- Approved rules: métricas e léxicos calculados localmente; gesto derivado de heurística determinística priorizada; stopwords e léxicos com acentos normalizados por mapa manual — VERIFIED
- Candidate rules: UNKNOWN
- Disputed rules: fronteira entre gestos vizinhos (ex.: seco × imagético); rótulos de público como leitura heurística, não diagnóstico — registrados na nota acadêmica

## Corpus
- Correct: 11 casos em `src/test/run-voz-estilistica.js` + comparação de fidelidade com a fonte (54 pontos sobre 6 textos diversos) — VERIFIED
- Incorrect: UNKNOWN
- Ambiguous: textos curtos (<200 palavras) têm confiança baixa e gesto instável — VERIFIED (campo `confianca`)
- Don't interfere: texto em que nenhum campo/emoção bate → atribui perfil mínimo sem quebrar — VERIFIED
- Adversarial: UNKNOWN

## Quality
- Tests: 11/11 — VERIFIED (node src/test/run-voz-estilistica.js)
- Fidelidade com fonte (escrevaral/voice-engine.js): counts, metrics, gesture, top fields/emotion, strengths e blindSpots **idênticos** em 54 pontos / 6 textos — VERIFIED
- Regression (demais engines): morfologia 14/14, runtime 5/5, orações 11/11, decolonial 7/7, rima 29/29 — VERIFIED
- Browser QA: pendente (próximo passo: botão no index.html + Playwright)
- Known false positives: UNKNOWN

## Runtime
- Analyzer: Escrevaral.engines.VoiceEngine (check assíncrono) — VERIFIED
- Artifact size: ~33 KB (engine ~12 KB + ~21 KB de léxicos/dados embutidos off-line) — VERIFIED (aprox.)
- Peak RAM: O(n·léxico); não cronometrado — PARCIAL
- Analysis time: UNKNOWN (não cronometrado)
- Legacy status: ES5 puro; sem Set/arrow/spread/??./template; sem `\p{L}`; sem normalize() (mapa manual `ACCENTS`); dados embutidos, sem fetch — VERIFICADO em Node; QA browser pendente

## Highest-value gap
- QA de browser (Playwright) + botão no index.html.
- `analyzeComplete` (fusão com VeredaAnalise — critérios de qualidade) ainda não portada; decisão de escopo — debater com o dono.
- Portar bateria adversarial/focal da fonte para promoção M4.
- Revisão independente (regra 4 do antiprompt).

## Evidence for current level
M3 justificado por testes reproduzíveis 11/11 + fidelidade de comportamento com a fonte (54 pontos / 6 textos) + regressão verde das demais engines. Não é M4+ (falta adversarial) nem M6 (falta medição legado real).

## Promotion candidate
M4 — ADVERSARIAL: bateria adversarial/focal da fonte + falso-positivos atacados + revisão independente + QA browser + cronometragem. Decidir escopo do `analyzeComplete`.

## Changelog
- 2026-09-01 — portado voice-engine.js (base `analyze`, sem fusão VeredaAnalise) para ES5/contrato Encore; léxicos e stopwords embutidos off-line gerados a partir da fonte; 11/11 testes; fidelidade 54/54 contra a fonte; MATURITY inicial M3.
