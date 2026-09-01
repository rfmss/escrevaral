# Sintaxe e Funções Sintáticas — Maturidade

**LEVEL:** M3 — TESTED
**LAST REVIEWED:** 2026-09-01
**STEWARD:** ainda não nomeado (só nomear quando a engine ganhar corpo)

## Mission
Analisar sintaticamente um período PT-BR no modo offline/heurístico: classificação morfológica por fallback puro (sem pt-compromise), reconhecimento de conjunções, tempos verbais e advérbios, e a máquina de estados das **funções sintáticas** (sujeito, objeto direto/indireto com subtipo, predicativo do sujeito/objeto, vocativo, voz passiva, oração adjetiva, concordância verbal/nominal). Base normativa: Bechara (Lições) + Cunha & Cintra + NGB/NGP.

## Coverage
- Morfologia heurística (fallback sem pt-compromise): artigos, preposições, contrações PREP+DEM, pronomes (subj/obl/indef/dem/poss), numerais, ordinais, interjeições, verbos auxiliares/ligacão/irregulares/presentes, adjetivos (primitivos + lista estendida), advérbios por tipo, nomes próprios/prenomes/topônimos/siglas no início, sufixos adjetivais/verbais, clíticos hifenizados — VERIFIED
- Desambiguação contextual (resolverAmbiguidade, R1–R14 + R7b/7c/R10/R11/11b/R_SALVO/R12/R13): sufixos nominais, pós-determinante/preposição, nominalização "o falar", bigram Mac-Morpho (Det/Num→Noun), locuções temporais "por enquanto"/"enquanto isso", diacrítico "público"/"séria", particípios adjetivados (copular/nominal), "cedo" possessivo, adj planos como advérbio, pronome indefinido predicativo, intensificador→adjetivo, "certo/certa" (advérbio vs adnominal), "salvo/exceto/menos/senão" preposição, pronome pessoal→verbo, classe aberta padrão→substantivo, "que" relativo após demonstrativo — VERIFIED
- Conjunções (subordinativas 10 tipos + coordenativas 5) com valor_especial e locuções multi-palavra; desambiguação "desde que"/"como" por contexto — VERIFIED
- Tempo verbal (identificarTempoVerbal): particípios, gerúndio, futuro do presente/pretérito, subjuntivo imperfeito, futuro do subjuntivo vs infinitivo pessoal, imperfeito/perfeito — VERIFIED
- Funções sintáticas (analisarFuncoes): vocativo (pré-detecção), "se" (condicional vs partícula), conjunção, preposição/artigo, advérbio, verbo (ligação / núcleo / voz passiva auxiliar), pronome relativo, sujeito/predicativo/objeto direto/indireto com subtipo dativo/posse/interesse/predicativo do objeto — VERIFIED
- Resumo do período: períodos simples, composto por coordenação/subordinação/misto/assindético; voz passiva; oração adjetiva; concordância verbal + nominal (gênero) — VERIFIED

## Knowledge
- Approved rules: classificação morfológica e funções conforme Bechara/Cunha&Cintra/NGB/NGP; dados normativos embutidos (conjunções + listões de verbos/adjetivos/prenomes) — VERIFIED
- Candidate rules: UNKNOWN
- Disputed rules: na morfologia heurística pura (sem pt-compromise) o "que" é classificado como Conjunção — o ramo "oração adjetiva" (Pronome relativo) exige tags do pt-compromise; fidelidade à fonte A no fallback. Registrado como limitação do caminho heurístico — VERIFIED

## Corpus
- Correct: 31 casos em `src/test/run-sintaxe.js` + comparação de fidelidade com a fonte (18/18 períodos idênticos no resumo; 18/18 + 6 casos idênticos termo a termo, tags+função) — VERIFIED
- Incorrect: UNKNOWN
- Ambiguous: palavras desconhecidas viram "substantivo" (classe aberta padrão, R12); "que" relativo só via pt-compromise (ausente) — VERIFIED
- Don't interfere: preposições/artigos não são sujeito; sujeito da subordinada é marcado como tal; voz passiva destacada — VERIFIED
- Adversarial: UNKNOWN

## Quality
- Tests: 31/31 — VERIFIED (node src/test/run-sintaxe.js)
- Fidelidade com fonte (escrevaral/syntax-engine.js, fallback puro): 18/18 períodos (tipo, nOracoes, voz passiva, relativa, verbos/tempo, vocativos, conjunções, alertas) e 24/24 séries de termos (tags+função) **idênticos** — VERIFIED
- Regression (demais engines): morfologia 14/14, runtime 5/5, orações 11/11, decolonial 7/7, rima 29/29, pontuação 11/11, voz 11/11 — VERIFIED
- Browser QA: pendente (próximo passo: botão no index.html + Playwright)
- Known false positives: UNKNOWN

## Runtime
- Analyzer: Encore.core.engines.SintaxeEngine (check assíncrono; id SINTAXE, domain sintaxe-funcao) — VERIFIED
- Artifact size: ~28 KB lógica + ~107 KB dados off-line (conjunções ~6 KB + listões normativos ~101 KB) — VERIFIED (aprox.)
- Data: embutidos em `src/data/syntax-data.js` e `src/data/norma-data.js` (objetos de flags ES5; adjetivos_comuns pré-normalizados sem acento) — VERIFIED
- Peak RAM: O(n·regras + dicionários estaticamente embutidos); não cronometrado — PARCIAL
- Analysis time: UNKNOWN (não cronometrado)
- Legacy status: ES5 puro; Sets→objetos de flags; regex `\p{L}`/`\p{Lu}`/`u` reescritos em classes explícitas + `stripAccent` manual (sem `normalize()`); sem arrow/template/?. /??./Object.entries/Object.values/...spread/find/includes/fetch — VERIFICADO em Node; QA browser pendente

## Highest-value gap
- QA de browser (Playwright) + botão no index.html (já adicionado; falta validar).
- Reativar o ramo "oração adjetiva" (e outras leituras pt-compromise) quando houver um tagger POS — hoje o fallback puro é o caminho ativo.
- Portar bateria adversarial/focal da fonte para promoção M4.
- Revisão independente (regra 4 do antiprompt).

## Evidence for current level
M3 justificado por testes reproduzíveis 31/31 + fidelidade de comportamento com a fonte A no caminho heurístico (períodos e termos idênticos) + regressão verde das demais engines. Não é M4+ (falta adversarial) nem M6 (falta medição legado real).

## Promotion candidate
M4 — ADVERSARIAL: bateria adversarial/focal da fonte + falso-positivos atacados + revisão independente + QA browser + cronometragem. Reativar leituras do pt-compromise quando houver tagger POS embarcado.

## Changelog
- 2026-09-01 — portado syntax-engine.js (fonte A) para ES5/contrato Encore no caminho heurístico puro (sem pt-compromise, sem fetch); morfologia fallback + resolverAmbiguidade (R1–R14) + identificarConjuncao + identificarTempoVerbal + analisarFuncoes + concordância + apostos/locuções + classificação de período; dados off-line embutidos (~107 KB); 31/31 testes; fidelidade 18/18 períodos + termos idênticos contra a fonte; MATURITY inicial M3.
