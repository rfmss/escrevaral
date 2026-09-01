# Catálogo — Fonte A: escrevaral (branch main)

Caminho: `/home/rafamass/projetos/escrevaral/`. Núcleo PT-BR, engines JS grandes com dados (parcialmente hardcoded, parcialmente JSON).

## Engines de linguagem (10)

| Engine | Caminho | Domínio | Dados | Maturidade |
|---|---|---|---|---|
| **syntax-engine.js** (62 KB) | raiz | Sintaxe/Morfologia/Função sintática | syntax-data.json (29 KB) + norma-data.json (130 KB) | 100% (função sintática 85%) |
| **lexical-engine.js** (505 KB) | raiz | Léxico/Biblioteca (sinônimos, definições, polissemia) | lexical-data.json (168 KB) + synonym-data.js (165 KB) + norma | 100% |
| **analise-engine.js** (122 KB) | raiz | Análise literária/editorial (39 critérios) | analise-data.json (1,4 KB) + criterios-data.js (28 KB) | 100% |
| **punctuation-engine.js** (37 KB) | raiz | Pontuação funcional (40 regras PONT-xx) | embutido (usa syntax-engine) | 100% |
| **precision-engine.js** (52 KB) | raiz | Precisão por formato/template | usa templates | 100% |
| **proof-engine.js** (10 KB) | raiz | Prova de autoria (ritmo humano) | embutido | 100% |
| **voice-engine.js** (29 KB) | raiz | Espelho de Voz / estilo / emoção | hardcoded | 100% |
| **rimalab-engine.js** (31 KB) | raiz | Rima / métrica / verso | rimalab-data.json (37 KB) | 100% |
| **decolonial-engine.js** (3 KB) | raiz | Vocabulário decolonizador | decolonial-data.json (275 KB) | 100% |
| **relative-clause-engine.js** (8 KB) | raiz | Orações adjetivas (expl/restritiva) | hardcoded | — (parte sintaxe 85%) |
| **template-engine.js** (2 KB) | raiz | Guias de escrita (63 templates) | templates-data.json (275 KB) | 100% |

## Engines não-linguísticas (funções de produto)
document-engine, pagination-engine, export-engine (26 KB), import-engine, backup-engine, filesystem-backup-engine, archive-engine, badges-engine, version-engine, rights-engine, typewriter-engine, vrda-engine (legado vereda).

## Dados (totais)
norma 130 KB · lexical 168 KB · synonym 165 KB · syntax 29 KB · rimalab 37 KB · decolonial 275 KB · analise 1,4 KB · templates 275 KB · criterios 28 KB · quotes 25 KB.

## Maturidade / testes
- Sem SPEC.md/MATURITY.md; controle em `META_ENGINES_100.md` (régua percentual 0–100%).
- Testes: `scripts/bench-gramatica/` (frases-criticas 507 KB + bench 1700/1700), `scripts/golden/` (91/0), scripts testar-*.

## Para o Encore (ES5)
- Engines JS puras = boas candidatas a portar. **Cuidado**: lexical-engine é 505 KB (peso); decolonial/templates 275 KB cada.
- **Requisição de dependência**: punctuation usa syntax-engine; analise usa criterios/voice.
