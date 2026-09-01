# Porting — Engine #2: Orações Adjetivas (Relative Clauses)

**Fonte:** `escrevaral/relative-clause-engine.js` (196 linhas, ~8 KB, sem dependências, sem dados).
**Fila:** `catalogo/prioridade-porting.md` → #2 ("fácil": pequeno, autônomo).
**Escopo confirmado pelo dono:** portar apenas #2 (não decolonial agora).

## O que a engine faz
Lê orações adjetivas (`que`) e classifica como **explicativa / restritiva / ambígua**,
com política de abstenção (só alta confiança com evidência textual forte).
Desdobra: antecedente, predicado, fragmento (≤120), `pos`, `hasComma`, `type`,
`confidence`, `score`, `evidence[]`, `guidance`.

Classificação (prioridade):
1. `restritiva` (0.96) — delimitador explícito (apenas/somente/só).
2. `explicativa` (0.94) — referente único (Brasil, Terra, Machado de Assis...).
3. `explicativa` (0.92) — propriedade geral documentada (baleias→sangue quente...).
4. `ambigua` (0.35, baixa) — abstenção, intenção autoral decide.

Abstenção também: `que` após verbo dicendi (conjunção integrante) e `o que` demonstrativo → nada.

## Arquivos
1. **`src/core/engines/relative-clause.js`** (novo)
   - Portar ES5: `var`, closures `self`, sem `Set`/arrow/spread.
   - Sets → objetos de flags (`{}`).
   - Substituir `normalize("NFD")` + `\p{L}` por **mapa de acentos manual** + classes
     de caractere explícitas (compatível com iOS 9 / Chromium 30 / KitKat).
   - Manter `analyze(text)` interno; construtor `RelativeClauseEngine` com `check(snapshot, done)`
     → `Finding[]`, `id: "REL-CLAUSE"`, `domain: "oracoes-adjetivas"`, `version: "1.0.0"`.
   - Export dual (CommonJS + globals), igual morfologia.

2. **`src/test/run-relative-clause.js`** (novo) — testes hand-rolled (estilo run-morphology):
   - restritiva (delimitador), explicativa (referente único), explicativa (propriedade geral),
     ambigua, conjunção integrante → nada, `o que` demonstrativo → nada, texto vazio → `[]`.
   - Rodar `node src/test/run-relative-clause.js` (exit 0).

3. **`knowledge/oracoes-adjetivas/MATURITY.md`** (novo) — modelo da morfologia, M3 (testado),
   gaps, candidato M4 adversarial.

4. **`index.html`** — carregar script + botão "Orações adjetivas" via runtime (roletagem).
   Screenshot no browser (Playwright) após a mudança.

5. **`catalogo/prioridade-porting.md`** — marcar #2 como feito.

## Passos de verificação
- `node src/test/run-relative-clause.js` → passando.
- `node src/test/run-morphology.js` e `run-runtime.js` continuam verdes (nada quebrado).
- Screenshot do index.html com a nova análise.

## Fora de escopo (próximas ondas)
- #3 tokenização (já feito), #4 decolonial, #5 rima/métrica, #6 voz — não agora.
- Dicionário grande / shards — permanece em aberto.
