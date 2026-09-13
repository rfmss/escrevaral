# FICHA-FUSAO — lexico-classes

**Engine:** `base/core/engines/lexico-classes.js` (id LEXICO-CLASSES, **VeredaLexical**)
**Estado:** M3 — TESTED · **24/24** (fidelidade total contra ouro da fonte, banca congelada 6 textos × 10 probes com e sem contexto)
**Método:** port mecânico auditável (mesmo conversor do Vereda v3) + **validação por fidelidade comportamental** contra a fonte ES6 executada com *fetch stub* em Node (`base/tools/generate-lexical-golden.js` → `fixtures/lexical-golden.json`).

## Entra
- **A (escrevaral/lexical-engine.js, VeredaLexical)** — classificador léxico off-line: classes de palavras (substantivo, verbo flexionado/subjuntivo/imperativo/infinitivo, adjetivo, advérbio, preposição, conjunção, pronome, artigo, numeral...), polissemia (706 verbetes em `localLexicon`), acentos distintivos (`dá/dão/pê/vê/vêm/pôs/fê-lo`... via Map), cliticizados hifenizados, gentílicos, locuções multi-palavra, definições, campos semânticos, função sintática e análise contextual (precedência/fronteira sintática, gatilhos de subjuntivo).
- **Dados de proveniência embutidos** (novos slots `Encore.data.lexicalData` e `Encore.data.lexicalNormaData`): `lexical-data.json` (167 KB; `localLexicon` 706 verbetes + `functionWords`) e `norma-data.json` (130 KB; usados só `verbos_pres_reg` 2168 e `formas_verbais_irr` 2002). Gerados por `base/tools/gen-lexical-data-js.js` (grava em `base/data/`); pureza contínua via deep-equal em `run-es5-purity.js`. **Taxonomia de campos normalizada (2026-09-12)** via `base/tools/normalize-lexical-fields.js`: ~190 → 98 campos consistentes, subtítulos após "—" preservados. **Expansão do `localLexicon` (2026-09-12)** via `base/tools/add-lexicon-entries.js`: 527 → 706 verbetes (+179 líquidos em 3 levas data-driven; chaves SEM acento por invariante, engine consulta por `normalizeWord`; notas em voz literária). **Auditoria de cobertura (2026-09-12)** via `base/tools/lexico-coverage.js` + corpora `auditoria-corpora/`: Clarice 8→11% curado, Bagno 4→9%, SALLES 4→13%; fallback caiu em todos (14→12 / 22→17 / 28→20).
- **Remoção do assincronismo** (a única diferença estrutural): `ensureLoaded()` deixou de ser `async` + `fetch` + `Promise.all` e virou **loader síncrono** dos dados embutidos (mesma semântica de degradação: sem dados → `_loadError`). Foi o único `async/await`/`fetch`/`Promise` do arquivo (mapeado 1/1/2/1).
- **Conversor estendido** (reutilizável): novos passos genéricos `stepForOf` (4 loops, incl. destructuring `{loc,classe}`), `stepMap` (1 → LMap), polainéis `Array.prototype.includes` + `LMap`; `?.` tratado por pares targeted (14/14 — todos leituras de propriedade, sem chamada opcional com efeito colateral, então sem duplicação de efeito).
- **Banca:** 6 textos (narrativa 3p, epistolar 1p com cliticizado, ensaio com locuções, sujeira-geral com gentílicos/siglas/ordinal, poema com acento distintivo, vocabulário diverso) × **10 probes fixos** por texto; cada probe gerado em `analyze(token, texto)` e `analyze(token)` (sem contexto).

## Descartado
- `fetch`/`Promise`/`async` no runtime (off-line puro, dados embutidos).
- `VeredaPunctuation`/norma completa: do `norma-data.json` o runtime só usa os dois arrays de formas verbais; o restante moe 11 chaves não consumidas pela engine — registrado como proveniência na íntegra, sem custo de contrato.
- O comportamento `ensureLoaded()` que retorna `Promise` de fato é substituído por carga síncrona; contratos que faziam `await VeredaLexical.ensureLoaded()` devem chamar `ensureLoaded()` (no-op) antes de usar — diferença documentada.
- `\p{L}`/`normalize("NFD")` mantidos da fonte (idênticos ao Vereda v3 já aprovado no cofre); rodam nativamente no harness moderno.
- Saída de `analyze` com campos `undefined` em ramos não aplicáveis (JSON descarta; comparação é por JSON normalizado).

## Evidência
- `node cofre/run-all.js` → run-lexico **36/36**; adversarial **35/35**; rodada curada **19/19 suítes, 419/419 casos**; varredura ampla **392/392**; piloto morfologia 4/4.
- Revisão independente (auditoria externa, regra 4 do antiprompt): **907 probes lado a lado idênticos**, 0 divergências de valor; dados embutidos ≡ JSONs originais (0 diffs, conferido por `run-es5-purity.js`); endurecimento `Object.create(null)` em LSet/LMap (achado teórico A4).
- **QA de browser (Playwright/Chromium) 54/54**: `tools/qa-browser/qa-browser.js` roda as MESMAS bancas do ouro no piso legado (script tags ES5) — port ≡ OURO da fonte em Chromium (payloads inteiros de probes).
- Cronometragem `tools/bench-ports.js`: port ≡ fonte (**0.92–1.13x**, ~4,2 k chars/s na passada palavra-a-palavra com contexto); auditoria estática da conversão limpa; pureza ES5 contínua.
- RAM+tempo em texto longo (`tools/bench-ports-long.js`): 11,2 KB/2.008 pal. → ~12,4–14,1 s fonte vs ~13,2–13,8 s port (0.94–1.06x, paridade); RSS pico 72,9 vs 72,9 MB, heap retido ~6–7 MB. Modelo O(palavras×chars) documentado como limitação da fonte.
- Ouro regenerável: `generate-lexical-golden.js` roda a fonte ES6 com `fetch` stub lendo os JSONs de escrevaral; port é derivado do MESMO corpus/probes.
- Fonte: `MATURITY.md` (cobertura, corpus, limitações, gaps).