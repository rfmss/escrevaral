# Bancada de referencias para gramatica PT-BR

**Data:** 2026-06-27  
**Tipo:** auditoria de referencias externas + encaminhamento para Claude  
**Status:** nao implementar codigo; usar como comparacao e regressao

---

## Resposta curta

Sim, existem repositorios e corpora que fazem partes importantes disso.

Mas nenhum deve ser copiado diretamente para dentro do Escrevaral como solucao final. O uso correto e:

1. comparar saidas
2. montar corpus de regressao
3. validar ambiguidades
4. aprender arquitetura
5. nao importar dependencia pesada para o app offline

Regra:

> Usar repos externos como banca, nao como muleta de produto.

---

## Repos e fontes que valem como bancada

### 1. Universal Dependencies - Portuguese Porttinari

Link: https://github.com/UniversalDependencies/UD_Portuguese-Porttinari

Melhor uso:

- benchmark PT-BR contemporaneo
- UPOS, morfologia e dependencias sintaticas
- comparar casos ambiguos reais
- montar testes de regressao

Nao usar para:

- copiar classificacao diretamente para a interface escolar
- substituir criterio gramatical brasileiro por etiquetas UD

### 2. Universal Dependencies - Portuguese Bosque

Link: https://github.com/UniversalDependencies/UD_Portuguese-Bosque

Melhor uso:

- arvore sintatica e relacoes de dependencia
- comparacao de classes ambiguas
- estudo de `que`, `se`, `enquanto`, particípios, nomes proprios e subordinacao

Cuidado:

- contem material de variantes do portugues; nao tratar tudo como PT-BR de uso escolar sem curadoria

### 3. Universal Dependencies - documentacao UPOS

Links:

- https://universaldependencies.org/u/pos/
- https://universaldependencies.org/u/feat/

Melhor uso:

- camada tecnica interna
- etiquetas como `NOUN`, `PROPN`, `VERB`, `AUX`, `ADJ`, `ADV`, `ADP`, `DET`, `PRON`, `SCONJ`, `CCONJ`

Cuidado:

- UD nao e NGB
- `DET` nao vira sempre "artigo"
- `AUX` ainda deve aparecer como verbo auxiliar na camada escolar
- `SCONJ/CCONJ` precisam virar conjuncao subordinativa/coordenativa em portugues claro

### 4. spaCy - modelos portugueses

Link: https://spacy.io/models/pt

Melhor uso:

- rodar comparacao local fora do app
- obter POS, morfologia, dependencia e NER como segunda opiniao
- detectar onde regra caseira diverge de modelo treinado

Cuidado:

- modelo e pesado para o Escrevaral offline no navegador
- nao substitui curadoria escolar

### 5. Stanza - modelos portugueses

Link: https://stanfordnlp.github.io/stanza/available_models.html

Melhor uso:

- segunda opiniao neural com pipeline academico
- comparacao com UD
- auditoria em lote fora do app

Cuidado:

- dependencia Python/modelo pesado
- usar como bancada, nao como runtime do produto

### 6. LanguageTool - regras de portugues

Link: https://github.com/languagetool-org/languagetool

Melhor uso:

- inspiracao para regras de revisao e falsos positivos
- estudar como regras gramaticais sao testadas
- comparar alertas normativos

Cuidado:

- foco e corretor gramatical, nao classificacao das 10 classes
- licenca e formato de regras exigem cuidado; nao copiar regra sem avaliar

### 7. CoGrOO

Link: https://github.com/cogroo/cogroo4

Melhor uso:

- referencia historica de corretor gramatical para portugues
- arquitetura de regras e pipeline

Cuidado:

- projeto antigo/pesado
- nao e guia direto para interface moderna do Escrevaral

### 8. Mac-Morpho / NILC

Link de entrada NILC: https://sites.google.com/view/nilc-usp/resources-and-tools

Melhor uso:

- corpus POS-tagged para portugues brasileiro
- frequencia de classes
- comparacao de ambiguidade morfologica

Cuidado:

- POS nao resolve sintaxe profunda
- checar licenca e formato antes de baixar/distribuir

---

## Resultado da checagem local

Comando executado:

```bash
python3 scripts/auditor-dados.py
```

Resultado atual:

```text
P0=0
P1=4
P2=0
```

Relatorio gerado:

```text
reports/auditoria/dados-linguisticos-2026-06-27.md
```

P1 atuais:

- `pública/publica`, `público/publico`, `séria/seria`, `sérias/serias`
- `contido`, `oculto`, `preso`
- `estreita`, `estreito`
- `larga`

Observacao:

Uma varredura simples de chaves normalizadas nao encontrou colisao diacritica restante em `synonym-data.js`, `lexical-data.json`, `syntax-data.json` ou `norma-data.json`. Se o Claude registrou "5 colisoes diacriticas novas", elas parecem ter sido intermediarias ou de outra metrica. O estado auditavel local agora e P0=0, P1=4.

---

## Benchmark rapido contra UD-Porttinari e UD-Bosque

Foi feita consulta local em arquivos `.conllu` baixados temporariamente de:

- `UD_Portuguese-Porttinari`
- `UD_Portuguese-Bosque`

Achados importantes:

### `enquanto`

No Porttinari:

- aparece como `SCONJ` em usos temporais/contrastivos
- aparece como `ADV` em `Enquanto isso`
- aparece como `ADV` em `Por enquanto`

No Bosque:

- aparece como `SCONJ`
- aparece como `ADV`
- aparece ate como `NOUN` em certas leituras anotadas

Conclusao:

`enquanto` nao deve ser uma chave unica "conjuncao". Precisa de candidatos contextuais:

```text
enquanto + oracao verbal -> provavel conjuncao
enquanto isso -> locucao adverbial/conector discursivo
por enquanto -> locucao adverbial
```

### `publica` vs `pública`

Porttinari:

- `publica` sem acento aparece como `VERB` de `publicar`
- `pública` aparece como `ADJ`

Conclusao:

Nao tratar remocao de diacritico como equivalencia classificatoria. A normalizacao serve para busca, nao para decisao gramatical final.

### `seria` vs `séria`

Porttinari:

- `seria` aparece como `AUX` de `ser`
- `séria` aparece como `ADJ`

Conclusao:

Mesmo caso: diacritico muda classe. Normalizar para lookup pode ser util, mas a decisao precisa preservar forma original.

### `preso`

Porttinari:

- `preso` aparece como `VERB` particípio/passiva
- aparece como `ADJ`
- aparece como `NOUN` em `presos`

Conclusao:

Nao remover `preso` de adjetivos so porque colide com particípio. O correto e modelar ambiguidade:

```text
foi preso -> VERB/AUX+particípio, voz passiva
ficou preso -> ADJ/predicativo provavel
os presos -> NOUN/substantivacao
```

### `contido` e `oculto`

Porttinari:

- `contido` aparece como `ADJ` com `VerbForm=Part`
- `oculto` aparece como `ADJ` com `VerbForm=Part`

Conclusao:

Esses itens nao sao erro por estarem em adjetivos. Sao particípios adjetivados. A engine precisa representar dupla natureza.

### `larga`, `estreita`, `estreito`

Porttinari:

- `larga` aparece como `ADJ`
- `estreito` aparece como `ADJ`

Conclusao:

Manter como adjetivos, mas criar exemplos negativos com verbo:

```text
A estrada larga cortava o vale. -> adjetivo
Ela larga tudo quando se cansa. -> verbo
O corredor estreito assustava. -> adjetivo
Ele estreita os olhos. -> verbo
```

---

## Ajuste no relatorio v889/v890 do Claude

Claude apontou como proxima fronteira:

```text
DEFINICOES literarias para verbos de fala: murmurar, tagarelar, sussurrar, praguejar
```

Auditoria local inicial:

- `murmurar` ja existe em `lexical-data.json`
- `sussurrar` existe em `lexical-engine.js`
- `tagarelar` existe em `lexical-engine.js`
- `praguejar` existe em `lexical-engine.js`

Recomendacao:

Nao gastar ciclo recriando nenhum desses quatro como lacuna. Se houver melhoria, ela deve ser qualitativa:

```text
validar qualidade das definicoes
evitar duplicata entre lexical-data.json e lexical-engine.js
criar corpus de regressao para usos de fala
```

---

## O que copiar e o que nao copiar

Copiar:

- metodologia de avaliacao por corpus
- ideia de etiquetas tecnicas internas
- exemplos positivos/negativos/ambiguos
- padrao de regressao por frase
- separacao entre UPOS, morfologia e dependencia

Nao copiar:

- regras inteiras sem licenca e sem curadoria
- modelos pesados para dentro do app
- output UD diretamente para a interface
- certeza estatistica como se fosse regra escolar

---

## Achado tecnico no Escrevaral atual

Existe fallback visual para substantivo em `grammar-controller.js`:

```text
GRAMMAR_CLASSES_MAP[raw] || "gw-substantivo"
```

Risco:

Se a engine nao sabe classificar, a interface pode pintar como substantivo. Isso e aceitavel como fallback visual temporario, mas nao como decisao gramatical.

Tambem ha pontos em `syntax-engine.js` em que a ausencia de evidencia forte pode terminar como `Noun` em cascatas de fallback.

Recomendacao:

Antes de expor ambiguidade na interface, criar um estado real:

```text
indeterminado
```

Diferenca:

```text
ambiguo = ha duas ou mais leituras reais
indeterminado = o motor nao tem evidencia suficiente
```

Regra para Claude:

> Nunca trocar "nao sei" por "substantivo" em uma camada que orienta a escritora.

---

## Arquitetura recomendada para Claude

Criar uma bancada externa fora do runtime:

```text
scripts/bench-gramatica/
  frases-criticas.json
  importar-ud.py
  comparar-escrevaral-ud.py
  relatorio.md
```

Formato de caso:

```json
{
  "id": "publica-publica-01",
  "frase": "A revista publica textos novos.",
  "alvos": [
    {
      "texto": "publica",
      "classe_escolar": "verbo",
      "classe_tecnica": "VERB",
      "certeza": "alta",
      "comentario": "sem acento; forma verbal de publicar"
    }
  ]
}
```

E o par:

```json
{
  "id": "publica-publica-02",
  "frase": "A opiniao publica mudou.",
  "alvos": [
    {
      "texto": "publica",
      "classe_escolar": "adjetivo",
      "classe_tecnica": "ADJ",
      "certeza": "alta",
      "comentario": "sem acento no teste para simular digitacao sem diacritico; interface deve alertar que a forma esperada e publica com acento se for adjetivo"
    }
  ]
}
```

Ponto importante:

```text
Sem acento, "publica" pode ser verbo por forma; com intencao adjetiva, pode ser erro ortografico.
Isso nao e so POS-tagging, e revisao ortografica + contexto.
```

---

## Prioridades de auditoria para a proxima rodada

### P0 conceitual

Separar normalizacao para busca de normalizacao para decisao gramatical.

Nao decidir classe com palavra sem acento se a forma original muda classe:

```text
publica/publica
seria/seria
esta/está
do/ dô? nao inventar equivalencia
```

### P1 tecnico

Criar `candidatos` em vez de retorno unico:

```js
{
  texto: "preso",
  candidatos: [
    { classe: "verbo", tecnico: "VERB", evidencia: "particípio/passiva", confianca: 0.55 },
    { classe: "adjetivo", tecnico: "ADJ", evidencia: "predicativo possivel", confianca: 0.40 },
    { classe: "substantivo", tecnico: "NOUN", evidencia: "substantivacao com artigo/plural", confianca: 0.05 }
  ],
  decisao: "provavel"
}
```

### P1 corpus

Criar trio por regra:

```text
positivo
negativo
ambiguo
```

Exemplo para `preso`:

```text
Ele foi preso ontem. -> verbo particípio/passiva
Ele ficou preso no elevador. -> adjetivo/predicativo provável
Os presos chegaram. -> substantivo
```

### P2 produto

Somente depois de corpus e candidatos, mostrar marcador discreto na interface:

```text
Esta palavra tem mais de uma leitura.
```

---

## Bancada executavel criada no repo

Arquivos:

```text
scripts/bench-gramatica/frases-criticas.json
scripts/bench-gramatica/avaliar-frases-criticas.py
```

Como rodar:

```bash
python3 -m http.server 8799
python3 scripts/bench-gramatica/avaliar-frases-criticas.py
```

Observacao:

O script tambem aceita:

```bash
python3 scripts/bench-gramatica/avaliar-frases-criticas.py --base-url http://127.0.0.1:8877
```

Primeira execucao local, em servidor temporario na porta `8877`:

```text
17 casos
10 ok
7 divergentes
```

Apos ajuste contextual em `syntax-engine.js`:

```text
17 casos
17 ok
0 divergentes
```

Guarda maior:

```bash
python3 scripts/comparar-golden.py --base-url http://127.0.0.1:8877
```

Resultado:

```text
91 frases
0 regressoes
4 evolucoes
```

Relatorios:

```text
reports/auditoria/frases-criticas-gramatica-2026-06-27.md
reports/auditoria/frases-criticas-gramatica-2026-06-27.json
reports/agente/2026-06-27.md
reports/agente/2026-06-27.json
```

Leitura das divergencias:

- diacritico distintivo: `publica`/`pública`, `seria`/`séria`
- participio adjetivado: `preso`, `contido`, `oculto`
- locucoes temporais/conectores: `por enquanto`, `enquanto isso`

As divergencias foram zeradas por uma regra contextual pequena, mas isso nao encerra o tema.
Isso confirma que a proxima fronteira nao e criar mais verbetes soltos. E ampliar decisao contextual com evidencias e testes de funcao sintatica.

---

## Prompt para Claude

```text
Use docs/_decisoes/BANCADA_REFERENCIAS_GRAMATICA_PTBR_2026-06-27.md como direcao.

Nao copie codigo de repos externos.
Use UD_Portuguese-Porttinari, UD_Portuguese-Bosque, spaCy, Stanza, LanguageTool, CoGrOO e Mac-Morpho como bancada comparativa.

Prioridade:
1. separar normalizacao de busca da decisao gramatical
2. criar corpus de frases criticas para P1 atuais
3. modelar candidatos com confianca e evidencias
4. so depois expor ambiguidade na interface

Nao recriar verbetes `murmurar`, `sussurrar`, `tagarelar` ou `praguejar` sem checar o estado atual: todos ja aparecem cobertos no repo.

Entregar relatorio antes de mexer em runtime.
```
