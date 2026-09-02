# Orações Adjetivas — Maturidade

**LEVEL:** M3 — TESTED
**VERSION:** 1.1.0
**LAST REVIEWED:** 2026-09-02
**STEWARD:** ainda não nomeado (só nomear quando a engine ganhar corpo)

## Mission
Classificar orações adjetivas introduzidas por `que` em PT-BR como **explicativa / restritiva / ambígua**, com política de abstenção: só emite classificação de alta confiança quando há evidência textual forte; caso contrário preserva a intenção da escritora (leitura ambígua). Alimenta os corretores de pontuação (vírgula obrigatória/proibida).

## Coverage
- Restritiva (delimitador explícito: apenas/somente/só) — VERIFIED
- Explicativa (referente único: Brasil, Terra, Machado de Assis...) — VERIFIED
- Explicativa (propriedade geral documentada: baleias→sangue quente, triângulos→3 lados) — VERIFIED
- Ambígua / abstenção — VERIFIED
- Abstenção por conjunção integrante (verbo dicendi: acha/diz/acredita...) → não é adjetiva — VERIFIED
- Abstenção por `o que` demonstrativo — VERIFIED
- Determinantes contraídos, `outro` e relativa preposicionada simples — VERIFIED

## Knowledge
- Approved rules: orações com delimitador explícito = restritiva; referente único ou propriedade geral = explicativa; senão ambígua — VERIFIED
- Candidate rules: UNKNOWN
- Disputed rules: UNKNOWN

## Corpus
- Banca original Encore: 11 casos — VERIFIED.
- Banca externa UD Portuguese-GSD: 9 casos — 2/9 antes da correção, 9/9 depois.
- Falhas reproduzidas: contrações nominais, `outro`, relativas preposicionadas e complementos com `sabemos`/`entender`.
- Ambígua: abstenção semântica preservada — VERIFIED.
- Don't interfere: conjunção integrante + `o que` demonstrativo — VERIFIED no escopo deliberado.
- A anotação externa distingue relativo e complemento; não valida sozinha explicativa versus restritiva.
- A bateria legada alegada como 1915/1915 não foi localizada no snapshot GitHub — UNVERIFIED.

## Quality
- Banca original: 11/11.
- Banca externa: 2/9 baseline; 9/9 corrigida.
- Todas as suítes do branch após a correção: 157/157.
- Sintaxe ES5 dos novos scripts: VERIFIED estaticamente; execução física pendente.
- Gate físico 1.1.0 no iPad certificado: PENDING — 19 casos.
- Falsos positivos além das bancas atuais: UNKNOWN.

## Runtime
- Analyzer: `Encore.core.engines.RelativeClauseEngine` — VERIFIED.
- Engine 1.1.0: 14.097 bytes; sem dados externos no runtime.
- Uma engine por Worker; Worker terminado após cada caso no gate preparado.
- Peak RAM: não mensurável diretamente no Safari legado; descarte será observado.
- Analysis time: UNKNOWN até o gate físico.
- ES5 puro, sem import/export, normalize, `Set`, Promise ou regex Unicode.

## Highest-value gap
Executar o gate físico de 19 casos no iPad certificado. Depois, decidir M4 sem transformar o corpus UD em validação semântica humana.

## Evidence for current level
M3 permanece correto por enquanto. A versão 1.1.0 já atravessou uma banca externa que reproduziu sete casos falhos e fechou 9/9 após a correção, mas o código corrigido ainda não atravessou o dispositivo certificado.

## Promotion candidate
M4 — ADVERSARIAL somente após:
1. gate físico 19/19 no iPad;
2. descarte observável de um Worker por caso;
3. decisão explícita mantendo revisão humana semântica como lacuna.

## Changelog
- 2026-09-01 — portado de escrevaral (relative-clause-engine.js) para ES5/contrato Encore; 11/11 testes; MATURITY inicial M3.
- 2026-09-02 — a alegação legada 1915/1915 foi rebaixada para UNVERIFIED porque os artefatos não estão no snapshot GitHub.
- 2026-09-02 — UD Portuguese-GSD reproduziu sete falhas em nove casos; versão 1.1.0 corrigiu contrações, `outro`, relativa preposicionada e complementos curados; 9/9 externo + 11/11 original + 157/157 no branch; gate físico pendente.
