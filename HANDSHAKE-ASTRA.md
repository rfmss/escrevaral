# HANDSHAKE-ASTRA.md — Cápsulas M4 entregues + tarefa de revisão

Emissor: dono (via Cofre). Destinatário: **Astra**. Data: 2026-09-12.

## O que foi entregue (leia isto primeiro)

Branch **`feat/cofre-capsulas-m4`** (base: `encore` `2a380c0`). Commit **`b4b3130`**:
"feat: cápsulas M4 do Cofre (lexico-classes + analise-literaria) portadas à represa".

Duas engines novas no runtime do Encore, contrato `Encore.contracts` (ES5, um engine por vez):

| id | domínio | origem | arquivos |
|---|---|---|---|
| **LEXICO-CLASSES** (VeredaLexical) | classes de palavras | Cofre (`cofre/base/core/engines/lexico-classes.js`, port ES5 fiel ao `escrevaral/lexical-engine.js`) | `src/core/engines/lexico-classes.js` + `src/data/lexical-data.js` + `src/data/lexical-norma-data.js` |
| **ANALISE-LITERARIA** (Vereda v3) | análise literária / redação | Cofre (`cofre/base/core/engines/analise-literaria.js`) | `src/core/engines/analise-literaria.js` + `src/data/analise-data.json` (proveniência) |

Você roda direto no worktree: `/tmp/opencode/encore-work` (worktree do git apontado para esta branch).

## Tarefa do Astra (escopo desta rodada)

1. **Rodagem reproduzível** e o parecer — rode e conferir (não edite engines):
   ```sh
   cd src/test
   node run-lexico.js                              # esperado 36/36
   node run-lexico-adversarial.js                  # esperado 35/35
   node run-analise-literaria.js                   # esperado 114/114
   node run-analise-literaria-adversarial.js       # esperado 43/43
   node run-es5-purity.js                          # esperado 4/4 (pureza + dados == escrevaral)
   node run-decolonial.js run-morphology.js run-pontuacao.js \
        run-relative-clause.js run-rima-metro.js run-runtime.js \
        run-sintaxe.js run-voz-estilistica.js      # esperado: 7/7 14/14 11/11 11/11 29/29 5/5 31/31 11/11
   ```
2. **Revisão de convenção vs represa**: confirme que as duas cápsulas respeitam
   `src/core/contracts.js` (check assíncrono → `findings`), o runtime `Encore.runtime`
   (um engine por vez) e o piso ES5 (sem `const/let/=>/?./spread/new Set`). Leia
   `docs/index.md`, `AGENTS.md` e `catalogo/index.md` antes de opinar.
3. **Parecer de merge**: MERGE `feat/cofre-capsulas-m4` em `encore`: **sim/não + argumento**.
   Se não, diga exatamente o que falta. Não mergear — o dono decide e ordena o merge.

## Regras da resposta

- Aplique `docs/11-sistema-supervisao-cognitiva.md` (regra-mãe: determinar se algo precisa
  ser melhorado ou colocado no mundo; termine com **próxima ação concreta**).
- Estado verdadeiro é o persistido: reporte por **commit/doc no repo** (não só na conversa).
- Proveja, se puder, o caminho p/ emissor: onde deixou sua verificação (ex. um
  `docs/ASTRA-REVIEW-capsulas-m4.md`).

## Contexto do produto (para não trabalhar no escuro)

- Escrevaral-Encore: academia offline do novo escritor (15–90 anos), iPad 2012/KitKat,
  baixa RAM, future-proof. O manual do projeto: `docs/index.md` (documento-mestre),
  `catalogo/index.md` (5 fontes / decisões por domínio).
- Depois desta onda, a fila aberta de porting (ver `catalogo/prioridade-porting.md`):
  **#11 dicionário grande em shards sob demanda (eskrev 360k, padrão já validado)** e a
  decisão em aberto de **base léxica inicial: léxico curado pequeno (uairer) enquanto os
  shards não são portados**.
- O dono também está atualizando o **Cofre** (`APAGARvouusar/cofre/`) — este handshake tem
  espelho lá em `cofre/docs/HANDSHAKE-ENCORE.md`.

---

## RODADA 2 — Correções R1–R6 aplicadas (em resposta ao parecer `ASTRA-REVIEW-capsulas-m4.md`)

Resposta completa com evidência por item: **`docs/ASTRA-REVIEW-resposta.md`**. Resumo:

- **R1** — ES5 de verdade: acorn 8.18 vendored (`src/test/vendor/acorn.js`, MIT) como GATE
  (`acorn.parse` ecmaVersion 5 nas 2 engines + contracts + runtime + tokenizer); removidos
  `\p{`, lookbehind, `/u`, `normalize("NFD")`, shorthand de objeto, matchAll dependente de
  `re.flags`. Marcadores modernos → 0 em código.
- **R2** — probes-objeto `{value, span:[start,end]}` aceitos; span canônico; tokenização
  interna sem probes (rota do demo).
- **R3** — Findings canônicos: `[start,end]`, severidade numérica 1..3, confidence 0..1.
- **R4** — `check()` lê `snapshot.context || snapshot.options` (contexto de poesia flui;
  goldens 0 diffs).
- **R5** — `run-es5-purity` v2: SKIP nunca vira PASS; parser ES5 de verdade; proveniência
  pinada por sha256 do store (fonte divergente = FAIL).
- **R6** — `index.html`: tudo via `runtime.enqueue` (fila serializada) + descarte de resposta
  stale (contador de sessão); fim da injeção manual de probes.

Comandos de re-revisão (rodar no worktree `/tmp/opencode/encore-work/src/test`):

```sh
node run-lexico.js                            # 36/36
node run-lexico-adversarial.js                # 35/35
node run-analise-literaria.js                 # 114/114
node run-analise-literaria-adversarial.js     # 43/43
node run-es5-purity.js                        # 9/9  (gate ES5 + proveniência)
node run-integration.js                       # 6/6  (fila + stale + cápsulas)
# regressão das 9 engines antigas:
node run-decolonial.js run-morphology.js run-pontuacao.js \
     run-relative-clause.js run-rima-metro.js run-runtime.js \
     run-sintaxe.js run-voz-estilistica.js    # 7/7 14/14 11/11 11/11 29/29 5/5 31/31 11/11
```

**Total: 14 runners, 362/362.** Re-revisar o novo SHA (bruto): `git fetch` +
`git log -1 origin/feat/cofre-capsulas-m4`. Novo parecer: **MERGE sim/não + argumento**.
Não mergear — o dono decide.