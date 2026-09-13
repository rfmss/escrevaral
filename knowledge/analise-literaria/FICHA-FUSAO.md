# FICHA-FUSAO — analise-literaria

**Engine:** `base/core/engines/analise-literaria.js` (id ANALISE-LITERARIA, **Vereda v3**)
**Estado:** M3 — TESTED · **72/72** (fidelidade total contra ouro da fonte, banca congelada 6 textos)
**Método:** port mecânico auditável (`base/tools/port-vereda-es5.js`) + **validação por fidelidade comportamental** contra a fonte ES6 executada num ouro congelado (`base/tools/generate-analise-golden.js` → `fixtures/analise-literaria-golden.json`).

## Entra
- **A (escrevaral/analise-engine.js, Vereda v3)** — métricas computáveis (21/39 do framework editorial) em 8 dimensões: economia (advérbios -mente, voz passiva, redundância/pleonasmos, negação dupla), clareza (comprimento de frase, pronome ambíguo, tempo verbal, subordinação, Flesch-BR), ritmo (variação, distribuição, repetição próxima, abertura fraca), voz (clichês), estrutura (proporção de partes, transições), POV (consistência de pessoa), léxico (verbos de estado, substantivos vagos), norma (pontuação — via `VeredaPunctuation` **não carregado** → `null`). + `interpretarResultado` (alertas com dim/id/nível/msg/ação).
- **Conversor ES5:** const/let→var, default params, `?.`, `new Set→LSet`, `[...→toArray`, templates, arrows→function, shorthand; polainéis ES5 (`includes`, `startsWith`, `endsWith`, `matchAll`).
- **Banca:** 6 textos (narrativa 3p, epistolar 1p, ensaio com subordinação, **texto-sujeira com 12 alertas**, poema com `formato:"poema"`, curto <30 pal.) — origem declarada no corpus.

## Descartado
- Dependência de rede/`fetch` (off-line puro).
- `VeredaPunctuation` (fusão norma.pontuação fica `null` — a engine de pontuação já vive em cápsula própria `cofre/base/core/engines/pontuacao.js`).
- O contrato de saída **legado** de 42 campos (19 divergências conhecidas vs contrato canônico) — o port usa o contrato **Encore** (`check(snapshot, done)` → `Finding`s), o que torna a comparação de contrato legado N/A nesta camada.
- Dados externos: `analise-data.json` da fonte (1,4 KB; stopwords/clichês) copiado p/ `base/data/analise-data.json` como proveniência, mas o runtime usa os listões **embutidos** da engine (idênticos aos da fonte).

## Evidência
- `node cofre/run-all.js` → run-analise-literaria **114/114** (72 + 42 regressões de `options`) + adversarial **43/43** (análise + meta + dimensões + alertas + contrato `check` assíncrono por caso).
- Revisão independente (auditoria externa, regra 4 do antiprompt): achado **A1** (interpolação de template sem coerção `String()` → crash com `options` booleano/número) corrigido no conversor e agora coberto por banca (`editorMode:true`, `oficio:true`, `formato:5`).
- **QA de browser (Playwright/Chromium) 51/51**: `tools/qa-browser/qa-browser.js` roda as MESMAS bancas do ouro no piso legado (script tags ES5) — port ≡ OURO da fonte em Chromium.
- Cronometragem `tools/bench-ports.js`: port ~21 ms/3,7 KB ≈ **0.84–1.05x** da fonte (sem regressão); auditoria estática da conversão limpa; pureza ES5 contínua (`run-es5-purity.js`).
- RAM+tempo em texto longo (`tools/bench-ports-long.js`): 11,2 KB/2.008 pal. → ~135–204 ms fonte vs ~147–156 ms port (0.77–1.10x); RSS pico ~52 vs ~54 MB, heap retido ~5 MB.
- Regeneração do ouro documentada (fonte original preservada em `escrevaral/`; caminho como arg do gerador).
- Fonte: `MATURITY.md` (cobertura, corpus, limitações, gaps).