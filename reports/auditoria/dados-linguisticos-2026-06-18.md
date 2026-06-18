# Auditoria de Dados Linguisticos - 2026-06-18

**Semaforo:** VERMELHO  |  **P0:** 4  **P1:** 6  **P2:** 3

Escopo: `synonym-data.js`, `norma-data.json`, `lexical-data.json`, `decolonial-data.json`, `rimalab-data.json`, `analise-data.json` e listas hardcoded de `syntax-engine.js`.

## P0

- **[lexical-data.json/functionWords.adjetivos_comuns] Adjetivos comuns tambem sao formas verbais exatas**
  - Evidencia: `estreita`, `estreito`, `larga`, `partido`
  - Recomendacao: No lexical-engine, functionWords.adjetivos_comuns e checado antes de verbos; exigir contexto ou remover da lista cega.

- **[norma-data.json/adjetivos_comuns] Adjetivos da norma colidem com presente verbal regular**
  - Evidencia: `estranha`, `estranho`, `inquieta`
  - Recomendacao: Classificar por contexto sintatico: sujeito + forma presente => verbo; nome/artigo + termo => adjetivo.

- **[synonym-data.js] Chaves duplicadas em objeto JS sobrescrevem sinonimos**
  - Evidencia: `descoberta` linhas 966, 1382; `escolha` linhas 954, 1381; `lealdade` linhas 513, 1379; `partida` linhas 1103, 1383
  - Recomendacao: Mesclar as listas duplicadas; no objeto JS a ultima chave vence.

- **[syntax-engine.js/ADJETIVOS_PRIM] Adjetivo primitivo hardcoded tambem e forma verbal exata**
  - Evidencia: `larga`
  - Recomendacao: Checar verbos presentes antes de ADJETIVOS_PRIM ou resolver por janela contextual.

## P1

- **[decolonial-data.json] Entradas sensiveis sem alternativas**
  - Evidencia: 207: `boiola`; 208: `viadagem`; 211: `sapatona como insulto`
  - Recomendacao: Preencher com alternativa contextual ou `nao use` para nao deixar UI vazia.

- **[decolonial-data.json] avoid tem duplicidades ou equivalentes normalizados**
  - Evidencia: doméstica / domestica; lingua pura / língua pura; mongolóide / mongoloide; portador de necessidades especiais / portador de necessidades especiais
  - Recomendacao: Mesclar duplicatas normalizadas; a busca nao precisa alertar duas vezes a mesma expressao.

- **[lexical-data.json/localLexicon] chaves normalizadas tem duplicidades ou equivalentes normalizados**
  - Evidencia: focalizacao / focalização
  - Recomendacao: Mesclar variantes que apontem para a mesma palavra normalizada, ou documentar excecoes.

- **[morfologia/listas] Colisoes verbo-adjetivo aparecem apos tirar acento**
  - Evidencia: syntax ADJETIVOS_PRIM: `pública` -> `publica`; syntax ADJETIVOS_PRIM: `público` -> `publico`; syntax ADJETIVOS_PRIM: `séria` -> `seria`; syntax ADJETIVOS_PRIM: `sérias` -> `serias`
  - Recomendacao: Testar pares como serio/seria, publico/publica e largo/larga com e sem acento.

- **[norma-data.json/adjetivos_comuns] Adjetivos da norma colidem com formas verbais/participios irregulares**
  - Evidencia: `contido`, `oculto`, `preso`
  - Recomendacao: Manter se forem adjetivos legitimos, mas cobrir com teste contextual de particípio/adjetivo.

- **[synonym-data.js] Entradas de sinonimos colidem apos normalizacao**
  - Evidencia: `angustia`:505, `angústia`:1089; `ciume`:563, `ciúme`:1215; `compaixao`:530, `compaixão`:1254; `crianca`:647, `criança`:1164; `forca`:776, `força`:1261; `gratidao`:529, `gratidão`:1216; `ilusao`:678, `ilusão`:1174; `indiferenca`:682, `indiferença`:1257; `oficio`:784, `ofício`:1370; `paixao`:681, `paixão`:1267; `perdao`:514, `perdão`:1157; `prisao`:557, `prisão`:1148
  - Recomendacao: Confirmar se sao variantes intencionais; se forem, mesclar ou documentar.

## P2

- **[rimalab-data.json/grammarWords] Classes gramaticais usam abreviaturas fora da taxonomia principal**
  - Evidencia: `adj`: 18, `s`: 18, `pron`: 2
  - Recomendacao: Normalizar `adj`, `s`, `pron` para nomes completos antes de ampliar grammarWords.

- **[synonym-data.js] Entrada `aberto` repete sinonimo**
  - Evidencia: linha 461: escancarado / escancarado
  - Recomendacao: Remover repeticoes internas para aumentar diversidade real.

- **[synonym-data.js] Entrada `criticar` repete sinonimo**
  - Evidencia: linha 418: questionar / questionar
  - Recomendacao: Remover repeticoes internas para aumentar diversidade real.

## Ordem de ataque sugerida

1. Corrigir P0 de sinonimos e colisoes verbo/adjetivo antes de novas expansoes.
2. Depois normalizar duplicatas de decolonial e lacunas de alternativas.
3. Por fim, harmonizar taxonomia do RimaLab/grammarWords para evitar classes paralelas.

Comando:

```bash
python3 scripts/auditor-dados.py
```
