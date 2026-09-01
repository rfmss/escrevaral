# Catálogo — Fonte E: eskrev

Caminho: `/home/rafamass/projetos/eskrev/`. Editor offline-first PT-BR, JS vanilla (ESM). Forte em **verificação normativa + dicionário grande + Authoria + PWA**.

## Engines linguísticas (`js/modules/`)

| Arquivo | Domínio | Dados | Tamanho |
|---|---|---|---|
| grammarLint.js | Desvios da norma + acentuação | pt_accent_map.json (**3,3 MB**) | 130 KB |
| grammarLintExtended.js | Regras de corpus (parônimos, gírias) | corpus via grammarLint | 51 KB |
| lexCheck.js | Verificador de vocabulário (distância de edição) | dicionário rich 360k via verbete | 9.6 KB |
| wordclass.js | 10 classes gramaticais (coloração) | pt_pos_lexicon.js | 11 KB |
| verbete.js | Lookup de verbete (dicionário rich lazy) | rich chunks por letra | 7.3 KB |
| styleAnalysis.js | Densidade/estilo por parágrafo | — | 6 KB |
| coordenador.js | Orquestrador | vários | 69 KB |
| flowMarkers.js | Marcadores de fluxo | — | 8.5 KB |

## Authoria (prova técnica de autoria)
Não-linguística: **ECDSA P-256, hash e assinatura `.skv`**, relatório p/ editoras, verify.html, crypto_manager.

## Dados linguísticos (`src/assets/lingua/`) — ~82 MB total
- **Dicionário 360k**: pt_dict_chunk 1/2/3 = ~38 MB, **359.856 entradas**.
- **Dicionário rich**: 27 arquivos por letra + índice = ~43 MB (sin/ant OpenWordNet-PT), 376.410 entradas.
- **Léxico POS**: pt_pos_core (6.076) + chunks (2.540). Acentos: pt_accent_map 3.3 MB. Dúvidas/regencias: KB.
- **Corpus** (`src/assets/corpus/`): 23 JSON, ~492 KB (morphology, syntax, semantics, orthography, punctuation, stylistics, text_production, variation, literature).

## Testes / maturidade
- CI e testes Python (`tests/check_*.py`, `test_*.py`), PWA offline, i18n. **Sem suite JS unitária para os módulos linguísticos**.
- Duplicatas/legado: lexCheck.js/verbete.js na raiz vs. `js/modules/`.

## Para o Encore (ES5)
- **Dicionário 360k é o único acesso a cobertura total**, mas ~38 MB → **conflito direto com baixa RAM/piso 2012**. Decisão de trade-off: este é o domínio onde baixa RAM e cobertura colidem.
- pt_accent_map (3,3 MB) — útil p/ acentuação, mas pesado.
- Authoria (ECDSA) é a versão técnica mais forte de prova de autoria — candidata ao "cartório".
- ESM no código (`import`) → precisa converter para ES5 no Encore.
