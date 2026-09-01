# Catálogo — Fonte B: escrevaral-mass-notes

Caminho: `/home/rafamass/projetos/escrevaral-mass-notes/`. Skeleton TypeScript (`mass-notes-next/`). Importante pela **morfologia verbal nativa TS**.

## Engine TS nativa: verbMorphology (morfologia verbal)
Pasta: `src/engines/verbMorphology/` (o motor mais fino de morfologia verbal da linhagem)

| Arquivo | Bytes | Função |
|---|---|---|
| verbMorphologyAdapter.ts | 8.7 KB | Orquestra compostos→clíticos→simples |
| irregularLexicon.ts | 15.3 KB | ~56 verbos irregulares |
| regularParadigms.ts | 9.9 KB | Paradigmas -ar/-er/-ir |
| contextResolver.ts | 9.7 KB | Concordância sujeito/verbo, pessoa/número |
| cliticParser.ts | 9.4 KB | Próclise/ênclise/mesóclise |
| compoundConstructions.ts | 6.6 KB | Locuções verbais |
| simpleAnalyzer.ts | 3.8 KB | Forma simples + infinitivo pessoal |
| verbLemmaLexicon.ts | 2.4 KB | ~62 lemas core |
| types.ts / normalization.ts | 2.9 KB | tipos + normalização |

**Maturidade**: M1.0 (SHIP COM CONDIÇÕES). Testes: m1-verb-morphology.spec.ts, m1-verb-selection.spec.ts, evaluation (24 casos adversariais). **Infinitivo pessoal = verified** (verb-provenance.json — 8 regras: 5 pending/2 partial/1 verified).

## Adapters (bridge para engines JS legadas)
lexicalAdapter + contextualLexicalResolver (resolução de ambiguidade), rimaLabAdapter, voiceAdapter, decolonialAdapter, reviewAdapter (sintaxe+pontuação via analise-engine), verbFormationSupplement.

**Dados usados**: norma-data.json (113 KB), lexical-data.json (168 KB), + os do escrevaral main (via fetch-bridge).

## Governança linguística
- `docs/governance/CAPSULA_DE_APRENDIZAGEM_E_BIBLIOTECA_DE_AUTORIDADE.md` + source-registry.yaml
- `docs/linguistics/verb-provenance.json` — proveniência de regras verbais
- `docs/M1_0_ENGINES_SUPERIORES.md` — estado (E1 estabilizada, E2-V 34+24)

## Para o Encore (ES5)
TypeScript **não entra direto** (Encore é ES5). **Trazível como comportamento**: os lemas irregulares (~56), paradigmas, e as 8 regras de proveniência (infinitivo pessoal). Natural complemento da nossa morfologia ES5 (que veio de C antigravity).
