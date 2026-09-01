# Pontuação — Maturidade

**LEVEL:** M3 — TESTED
**LAST REVIEWED:** 2026-09-01
**STEWARD:** ainda não nomeado (só nomear quando a engine ganhar corpo)

## Mission
Corrigir pontuação funcional em prosa PT-BR com base em gramáticas normativas (Bechara MGP §§ 597–640, Cunha & Cintra pp. 648–682, Moreno, Squarisi). Reporta violações de 38 regras, cada uma com regraId, categoria, critério, exemplo/contraexemplo e ação de correção, além de resumo por severidade (alta/média/baixa). 2 regras contextuais (oração adjetiva explicativa/restritiva) leem a engine de orações adjetivas (REL-CLAUSE) quando disponível; `analyzeDeep()` degrada graciosamente sem syntax-engine.

## Coverage
- 31 regras autônomas por padrão textual (regex): vírgula proibida (sujeito/predicado, verbo dicendi+que, 'e, sim,', verbo de opinião+que), vírgula obrigatória (vocativo, oração adverbial anteposta, aposto, advérbio adversativo, adjunto longo, elemento intercalado, travessão), ponto final ausente, dois-pontos (proibido/ausente/maiúscula), ponto e vírgula (3+ verbos, pospositiva, enumeração), reticências (excessivas, após etc.), exclamação/interrogação múltipla, interrogação indireta, convenção tipográfica (espaço antes de pontuação, vírgula antes de parêntese, ponto duplicado, travessão sem espaço, aspas retas vs curvas) — VERIFIED
- 7 regras via análise contextual/sintaxe: PONT-18/PONT-19 (oração adjetiva via REL-CLAUSE), PONT-44 (aposto), PONT-45 (concordância plural), PONT-48 (voz passiva 'de'→'por'), PONT-49 ('mas' sem vírgula), PONT-47 ('e' com sujeitos diferentes) — VERIFIED (PONT-18/19 condicionadas à presença de REL-CLAUSE)
- Resumo de severidade (alta/média/baixa) + contagem de regras — VERIFIED
- Limiar de 10 palavras (texto curto não é analisado) + texto vazio — VERIFIED
- `analyzeDeep()`: degrada graciosamente e devolve o base quando não há syntax-engine — VERIFIED
- `getRules()`: catálogo das 38 regras (metadados sem regex) — VERIFIED

## Knowledge
- Approved rules: as 38 regras conforme as fontes normativas citadas em cada `fonte`; leitura contextual de PONT-18/19 delegada à REL-CLAUSE — VERIFIED
- Candidate rules: UNKNOWN
- Disputed rules: PONT-18/19 dependem da cobertura da REL-CLAUSE (seed restrito → nem todo caso explica/restritiva é classificado); PONT-54 (aspas retas vs curvas) é preferência editorial, não norma absoluta — registrados

## Corpus
- Correct: 11 casos em `src/test/run-pontuacao.js` + comparação de fidelidade com a fonte (12 textos, 38 regras, ids/fragmento/pos/severidade idênticos) — VERIFIED
- Incorrect: UNKNOWN
- Ambiguous: textos <10 palavras não analisados; regras contextuais sujeitas à cobertura da REL-CLAUSE — VERIFIED
- Don't interfere: PONT-09 não acusa advérbio já isolado por vírgulas; PONT-27 ignora 'seguintes:'; PONT-41 ignora interrogativas diretas — VERIFIED
- Adversarial: UNKNOWN

## Quality
- Tests: 11/11 — VERIFIED (node src/test/run-pontuacao.js)
- Fidelidade com fonte (escrevaral/punctuation-engine.js): 12/12 textos com ids, fragmento, posição e severidade **idênticos** — VERIFIED
- Regression (demais engines): morfologia 14/14, runtime 5/5, orações 11/11, decolonial 7/7, rima 29/29, voz 11/11 — VERIFIED
- Browser QA: pendente (próximo passo: botão no index.html + Playwright)
- Known false positives: UNKNOWN

## Runtime
- Analyzer: Escrevaral.engines.PunctuationEngine (check assíncrono) — VERIFIED
- Artifact size: ~30 KB (lógica apenas; sem dados externos) — VERIFIED (aprox.)
- Peak RAM: O(n·regras); não cronometrado — PARCIAL
- Analysis time: UNKNOWN (não cronometrado)
- Legacy status: ES5 puro; Sets→objetos de flags; **lookbehind regex (PONT-09) reescrito em JS** por incompatibilidade com Chrome 30/KitKat; sem arrow/template/?. /??./Object.fromEntries/for...of; sem normalize() — VERIFICADO em Node; QA browser pendente

## Highest-value gap
- QA de browser (Playwright) + botão no index.html.
- `analyzeDeep()` ainda não usa syntax-engine (não portada); hoje degrada para `analyze` — reativar quando a #8 sintaxe for portada.
- Portar bateria adversarial/focal da fonte para promoção M4.
- Revisão independente (regra 4 do antiprompt).

## Evidence for current level
M3 justificado por testes reproduzíveis 11/11 + fidelidade de comportamento com a fonte (12 textos × 38 regras) + regressão verde das demais engines. Não é M4+ (falta adversarial) nem M6 (falta medição legado real).

## Promotion candidate
M4 — ADVERSARIAL: bateria adversarial/focal da fonte + falso-positivos atacados + revisão independente + QA browser + cronometragem. Reativar analyzeDeep=base+syntax quando #8 existir.

## Changelog
- 2026-09-01 — portado punctuation-engine.js (analyze + analyzeDeep + getRules) para ES5/contrato Encore; 38 regras; 2 regras contextuais ligadas à REL-CLAUSE via runtime; lookbehind de PONT-09 reescrito (Chrome 30); 11/11 testes; fidelidade 12/12 contra a fonte; MATURITY inicial M3.
