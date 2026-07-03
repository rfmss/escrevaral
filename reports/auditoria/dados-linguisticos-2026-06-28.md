# Auditoria de Dados Linguisticos - 2026-06-28

**Semaforo:** AMARELO  |  **P0:** 0  **P1:** 4  **P2:** 0

Escopo: `synonym-data.js`, `norma-data.json`, `lexical-data.json`, `decolonial-data.json`, `rimalab-data.json`, `analise-data.json` e listas hardcoded de `syntax-engine.js`.

## P1

- **[morfologia/listas] Colisoes verbo-adjetivo aparecem apos tirar acento**
  - Evidencia: syntax ADJETIVOS_PRIM: `pública` -> `publica`; syntax ADJETIVOS_PRIM: `público` -> `publico`; syntax ADJETIVOS_PRIM: `séria` -> `seria`; syntax ADJETIVOS_PRIM: `sérias` -> `serias`
  - Recomendacao: Testar pares como serio/seria, publico/publica e largo/larga com e sem acento.

- **[norma-data.json/adjetivos_comuns] Adjetivos da norma colidem com formas verbais/participios irregulares**
  - Evidencia: `contido`, `oculto`, `preso`
  - Recomendacao: Manter se forem adjetivos legitimos, mas cobrir com teste contextual de particípio/adjetivo.

- **[norma-data.json/adjetivos_comuns] Adjetivos da norma colidem com presente verbal regular (mitigado por guarda adnominal 2-token no VERBOS_PRES)**
  - Evidencia: `completa`, `critica`, `estreita`, `estreito`
  - Recomendacao: Guarda adnominal presente: Art+N+Adj bloqueado antes de VERBOS_PRES; colisao coberta.

- **[syntax-engine.js/ADJETIVOS_PRIM] Adjetivo primitivo hardcoded tambem e forma verbal exata (mitigado por guarda pre-ADJETIVOS_PRIM no cascade)**
  - Evidencia: `larga`
  - Recomendacao: Guarda contextual ja presente antes de ADJETIVOS_PRIM; colisao coberta para formas verbais de presente.

## Ordem de ataque sugerida

1. Corrigir P0 de sinonimos e colisoes verbo/adjetivo antes de novas expansoes.
2. Depois normalizar duplicatas de decolonial e lacunas de alternativas.
3. Por fim, harmonizar taxonomia do RimaLab/grammarWords para evitar classes paralelas.

Comando:

```bash
python3 scripts/auditor-dados.py
```

