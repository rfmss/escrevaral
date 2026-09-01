# Morfologia Verbal — SPEC (M1 baseline)

**Engine:** VERB-MORPH · **Domínio:** morfologia-verbal · **Versão:** 1.0.0

## Missão
Identificar morfologia de formas verbais do português — lema, flexão (tempo/modo/pessoa/número) — com baixa RAM, funcionando offline em ES5.

## Entrada / Saída
- Entrada: uma palavra (contrato por enquanto; tokenização é gap separado).
- Saída: Finding com lema + flexão, OU ausência de achado se não for verbo conhecido.

## Método
Trie de sufixos (sufixo → metadados). Fallback: remoção de clíticos (enclise/mesoclise) e terminações átonas (á/ê/í/ô → ar/er/ir/or). Exceções marcadas via lista "não se meta".

## Escopo atual (limitado)
- 11 formas de seed no trie (verbos regulares e alguns irregulares: vir, dar).
- 4 exceções "não se meta".
- Clíticos: fazê-lo, dar-te-ei, vendê-la.

## Fora de escopo (por ora)
- Tokenização de texto contínuo.
- Todas as formas de verbos (povrier vir de norma-data.json do escrevaral).
- Adversarial completo.

## Fontes
- Comportamento canônico: antigravity `js/core/linguistic-core/services/morphology-lite.js` (M6).
- Corpus-alvo futuro: escrevaral `norma-data.json` (verbos_pres_reg, formas_verbais_irr).
