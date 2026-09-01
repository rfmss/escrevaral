# Mapa por Domínio — onde cada engine está mais madura

Cruzamento das 5 fontes (A=escrevaral main, B=mass-notes, C=antigravity, D=uai.rer, E=eskrev).
**LEITURA:** uma linha por domínio → melhor candidata para o Encore = a de maior maturidade e mais compatível com ES5/baixa RAM.

| Domínio | A (escrevaral) | B (mass-notes) | C (antigravity) | D (uai.rer) | E (eskrev) | **Melhor origem** |
|---|---|---|---|---|---|---|
| **Morfologia verbal** | syntax-engine (via pt-compromise) | **verbMorphology TS nativo** (34+24 casos, infinitivo pessoal verified) | morphology-lite ES5 (M6) | parte do syntax | wordclass | **C (ES5) p/ base + B (lemas/TD nativo) p/ regras finas** |
| **Sintaxe / função** | syntax-engine (85% função sintática) | reviewAdapter (bridge) | SintaxeAnalyzer (M6) + syntax service | syntax-engine (26 KB) | grammarLint | **C (M6 ES5)** |
| **Léxico / classes** | lexical-engine (L7-100%) | lexicalAdapter + contextualResolver | **LexiconAnalyzer (M6, lexicon 100k sem OOM)** | lexical-engine (campo semântico, craft) | lexCheck 360k + pos_lexicon | **C p/ RAM + A p/ riqueza léxica + E p/ dicionário** |
| **Pontuação** | punctuation-engine (40 regras) | reviewAdapter (bridge) | PontuacaoAnalyzer (M0) | punctuation-engine (30 regras) | (via grammarLint) | **A (40 regras, 100%)** |
| **Análise literária / redação** | analise-engine (39 critérios) | reviewAdapter (bridge) | AnaliseLiterariaAnalyzer | — | — | **A (100%)** |
| **Voz / estilística** | voice-engine (100%) | voiceAdapter | — | — | styleAnalysis | **A (100%)** |
| **Rima / métrica** | rimalab-engine (100%) | rimaLabAdapter | — | — | — | **A (100%)** |
| **Decolonial / termos** | decolonial-engine (100%) | decolonialAdapter | — | — | — | **A (100%)** |
| **Precisão p/ gênero** | precision-engine + template-engine | — | — | — | templates (30 md) | **A** |
| **Prova de autoria** | proof-engine + rights-engine | — | — | — | **Authoria (ECDSA P-256)** | **E (Authoria) p/ blockchain-ish + A p/ ritmo** |
| **Ortografia/acentuação** | (via sintaxe/norma) | — | OrtografiaAnalyzer (M0) | — | **grammarLint + accent_map (3,3 MB)** | **E (dicionário/accent)** |
| **Regência/crase/hífen/concordância** | (norma-data) | — | analyzers M0 (caixa apenas) | — | duvidas+regencias | **C p/ estrutura + A p/ norma-data** |
| **Export/import/backup** | export/import/backup-engine | — | — | — | PWA/offline | **A** |

## Decição geral (recomendada, você decide)

1. **Esmolécula das melhores por domínio** — não cópia bruta de tudo.
2. **Base ES5**: adotar o **antigravity (C)** como esqueleto ES5/baixa RAM; portar os domínios M0 dele usando **A (escrevaral)** como referência de comportamento maduro.
3. **Morfologia**: manter nosso motor (portado de C) e enriquecê-lo com os **lemas/regras de B (mass-notes)**.
4. **Dicionário grande (E eskrev 360k)** é o único caminho p/ cobertura total — mas é ~38 MB, conflito com baixa RAM/2012. **Decisão de trade-off** (provavelmente por shards/sob demanda).
5. **Authoria**: E (eskrev) tem a versão técnica (ECDSA); A tem a de "ritmo humano". Ver se vale unir.

## O que NÃO trazer
- Stubs/espelhos vazios (ex.: dirs vazios de uai.rer `src/features/`; js/machine "espelho" do antigravity).
- Duplicatas mortas (lexCheck/verbete na raiz do eskrev vs. `js/modules/`).
- Dados não-licenciados verificar (lexCheck 360k; OpenWordNet-PT) antes de empacotar.
- Código TypeScript não pode entrar direto (Encore é ES5) — só o comportamento/lemas.
