# ASTRA-REVIEW-resposta.md — Correções aplicadas (Rodada 2)

Emissor: dono (via Cofre). Destinatário: **Astra**. Data: 2026-09-12.
Resposta ao parecer `ASTRA-REVIEW-capsulas-m4.md` (PR #165, commit `4cf26c4`).

Veredito do parecer: **MERGE: NÃO nesta revisão**; 351/351 anunciados, 2 verificações de
dados não executadas; achados R1–R6. Nenhuma engine foi alterada pelo Astra.

As seis correções abaixo foram aplicadas na branch `feat/cofre-capsulas-m4`
(`lexico-classes.js` + `analise-literaria.js` + runners + `index.html` + novo gate de
pureza). Cada item fecha com a evidência de verificação.

## R1 — engines não passam em parser ES5 (regEx `\p`, lookbehind, `/u`, `normalize("NFD")`)

**Aplicado.** Removidos todos os marcadores modernos de código (não só de strings):

- `lexico-classes.js`: `^\p{Lu}` → classe explícita `/^[A-ZÁÉÍÓÚÂÊÔÃÕÜÇÀÈÌÒÙ]/`; `[\p{L}-]+`,
  `[\p{L}'-]+` + flag `/u` → `splitLetterRuns`/`splitWordRuns` com intervalos de
  code points explícitos; `normalize("NFD")` → mapa `DIACRITICS_PT` + drop de marcas
  combinantes (U+0300–U+036F). Polyfill `String.prototype.matchAll` sem depender de
  `re.flags` (flags manuais `i`/`m`).
- `analise-literaria.js`: lookbehind `(?<=[.!?…])` → split por `§` (lookahead ES5);
  classes `\p{L}` → classe explícita; `normalize("NFD")` → mapa `DIACRITICS_PT_AN` +
  drop de combinantes; `String.matchAll` → polyfill ES5.
- Shorthand de objeto (`decisao,` / `aberturasFracas`) também convertido.

**GATE REAL:** `run-es5-purity.js` agora usa **acorn 8.18.0 vendored** (MIT) em
`src/test/vendor/acorn.js` e faz `acorn.parse(code, { ecmaVersion: 5 })` obrigatório nas
duas engines + `contracts.js` + `runtime.js` + `tokenizer.js`. O scanner de marcadores virou
só diagnóstico (roda sobre código sem strings/comentários). Evidência: `acorn.parse` com
`ecmaVersion: 5` falhava exatamente nas linhas dos marcadores R1 (465 e 1024 do estado
anterior); hoje as 5 arquivos passam `PASS [ES5 parse ...]`.

## R2 — tokenizer objects eram achatados (String(probe) → "[object Object]")

**Aplicado.** `check()` do léxico aceita probes como **objetos `{value, span:[start,end]}`**
e processa `span` como array canônico; probe string (ou sem `span`) cai no fallback de
localização no texto (primeira ocorrência) ou é pulado se ausente. Sem probes → tokenização
interna via `Encore.core.services.Tokenizer` (a rota `runtime.runOne`/`enqueue` do demo
funciona sem injeção manual). Evidência: `run-integration.js` cobre repetição (dois spans
distintos para "casa" em "A casa caiu. A casa ficou.") e ausência (probe fora do texto → sem
finding); demo browser renderiza sem injeção de probes (0 pageerrors).

## R3 — Findings divergiam de `contracts.js` (span object vs array; severidade string/fora da faixa)

**Aplicado.** Ambos os engines emitem `new contracts.Finding(id, spanArray[2], message,
severity 1..3, confidence 0..1)`:

- Léxico: `severity: 1` (numérica, não "info"), `confidence: 0.8`, span `[start,end]`.
- Análise: severidade mapeada `alto→3, moderado→2, baixo→1`; `confidence: 0.6`; span
  `[0, length]`.

Evidência: todos os runners (`-check-contrato`) validam `Array.isArray(span)`, `span[1] >
span[0]`, severidade numérica em 1..3 e confidence em 0..1 — lexico 36/36, adversarial 35/35,
analise 114/114, adversarial 43/43, integração 7/7.

## R4 — analise ignorava o contexto de poesia (lia `options`, contrato usa `context`)

**Aplicado.** `check()` lê `snapshot.context || snapshot.options` (o contrato
`LinguisticSnapshot(text, options)` popula `context`). A cascata de alertas de
"redundância/sujeira-vícios" que só disparava sob contexto (`inferirContextoAnalise`) volta a
fluir. Evidência: `run-analise-literaria.js` (114/114, inclui casos `opcoes-*` e `poema`) e o
check de integração com a banca de 85 palavras mantêm contagens idênticas (nenhum golden
precisou ser regenerado — 0 diffs).

## R5 — `run-es5-purity` contava SKIP como PASS + checker ingênuo

**Aplicado.** Reescrito (v2):

- **SKIP nunca vira PASS**: fonte ausente → `FAIL [proveniência ... fonte ausente ...]`.
- **Parser real**: gate ES5 via acorn vendored (acima).
- **Proveniência pinada**: sha256 dos JSONs-oráculo do store escrevaral
  (`lexical-data.json` d0e1e3f3…, `norma-data.json` d8aca87b…). Divergência → FAIL, exigindo
  propagação deliberada. Igualdade embutido==original em 0 diffs continua.

Resultado: `run-es5-purity.js` **9/9** (5 parse gates + 2 proveniência + 2 igualdade).

## R6 — integração não passava pela fila serializada (runtime)

**Aplicado.** `index.html`:

- Toda engine (incl. LEXICO-CLASSES) roda `Encore.runtime.enqueue(engineId, text, cb)`
  — fila serializada "um engine por vez"; removida a injeção manual de `probes` (a engine
  tokeniza internamente).
- **Descarte de resposta stale**: contador de sessão; renderização só se a resposta
  pertence à requisição mais nova (cliques rápidos não misturam telas).

Evidência: `run-integration.js` 7/7 — ordem da fila == ordem de enqueue; entre 3 enqueues a
só a última sessão renderiza; contornos quantitativos repetição/ausência; demo chromium
9 engines registradas, 0 pageerrors.

## RODADA 2.1 — fechamento do re-parecer do Astra (achados no primeiro giro da 2ª revisão)

- **R6 residual (toggle-off)**: ao clicar de novo no mesmo botão (desligar a lente), a
  resposta pendente da fila REAPARECIA depois — o `deactivate()` não invalidava a sessão.
  **Corrigido em `index.html`**: `deactivate()` agora faz `session++` (invalida respostas
  pendentes) além de limpar a tela. **Coberto por teste novo** `integração-toggle-off-pendente`
  no `run-integration.js` (ativa → desliga imediatamente → 200 ms depois nada é renderizado).
- **R5 (proveniência fora do ambiente do Astra)**: o gate exigia o store escrevaral
  (`/home/…/escrevaral`), ausente no ambiente do revisor → falhava corretamente, mas o
  revisor não conseguia validar. **Corrigido**: os dois JSONs-oráculo agora vão **vendados
  byte-a-byte** em `src/test/provenance/` (mesmo sha256 do pin), e `run-es5-purity.js`
  resolve: store real (argv[2]) → snapshot vendado → **FAIL se nenhum** (SKIP nunca vira
  PASS). Agora verde em qualquer máquina: store real 9/9, só snapshot 9/9, nada → FAIL 5/7.
- Re-aprovado nesta rodada: pureza 9/9, integração 7/7, R1–R4 em reproduções do revisor.

## Estado final da suíte (Rodada 2.1)

| runner | resultado |
|---|---|
| run-lexico | 36/36 |
| run-lexico-adversarial | 35/35 |
| run-analise-literaria | 114/114 |
| run-analise-literaria-adversarial | 43/43 |
| run-es5-purity (gate ES5 + proveniência, store ou snapshot) | 9/9 |
| run-integration (fila + stale + cápsulas + toggle-off) | 7/7 |
| run-decolonial / morphology / pontuacao / relative-clause / rima-metro | 7/7 14/14 11/11 11/11 29/29 |
| run-runtime / sintaxe / voz-estilistica | 5/5 31/31 11/11 |

**Total: 14 runners, 363/363.** Nenhuma da outra 9 engines regrediu (runners antigos intactos).

## RODADA 3 — Resposta à observação não bloqueante P2 (antes do merge)

O re-parecer registrou P2: `createHighlightedContext('A casa caiu.', 'casa', esc)` devolvia o
texto sem destaque — `splitLetterRuns` comparava `isL` (booleano) com `mode` (numérico)
via `===`. **Corrigido no HEAD `3412be61`** mantendo estado e comparação no mesmo tipo
numérico (`m = isL ? 1 : 0`), sem sair do piso ES5.

Resultado da revalidação (evidência em `docs/revisoes/pr165-r3-*.json`):
- **14 runners, 363/363, exit 0** — purity 9/9, integration 7/7, sem regressão das 9 antigas.
- **`docs/revisoes/pr165-r2-fluxo.js` → 6/6, exit 0** (o item "R1: destaque preserva palavra
  inteira" agora passa; antes 5/6).
- **`docs/revisoes/pr165-verificar.js` → 8/8, exit 0**.
- Parse ES5 (acorn vendored) OK nas 2 engines novas.

## Próxima ação

Re-revalidar o HEAD atual `origin/feat/cofre-capsulas-m4` (Rodada 3, `git fetch` +
`git log -1`): rodar `docs/revisoes/pr165-r2-fluxo.js` esperando **6/6** e os 14 runners
esperando 363/363. Se verde, emitir parecer de merge final —
**MERGE `feat/cofre-capsulas-m4` em `encore`: sim/não + argumento**.
Não mergear — o dono decide e ordena.