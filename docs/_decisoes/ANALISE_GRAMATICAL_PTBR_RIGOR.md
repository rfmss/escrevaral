# Analise gramatical do portugues brasileiro com rigor

**Data:** 2026-06-27  
**Tipo:** briefing para Claude  
**Status:** direcao tecnica e linguistica antes de implementar novas classificacoes

---

## Tese central

Nao existe formula perfeita para classificar todas as palavras e funcoes sintaticas do portugues brasileiro por regras fixas.

O que existe e uma abordagem mais honesta:

1. levantar todas as classificacoes possiveis
2. usar contexto para pontuar cada hipotese
3. classificar so quando houver evidência suficiente
4. marcar como ambiguo quando a lingua realmente permitir mais de uma leitura
5. orientar sem transformar incerteza em erro

Regra de produto:

> O Escrevaral nao deve fingir certeza gramatical. Quando houver ambiguidade real, deve dizer que ha ambiguidade real.

---

## Problema da "formula perfeita"

A lingua tem casos em que a classe de palavra depende da frase inteira:

- `a` pode ser artigo, preposicao ou pronome
- `o` pode ser artigo ou pronome demonstrativo/oblíquo
- `que` pode ser pronome relativo, conjuncao integrante, conjuncao causal, expletivo etc.
- `como` pode ser adverbio interrogativo, conjuncao comparativa, conjuncao causal ou conformativa
- `se` pode ser pronome reflexivo, partícula apassivadora, indice de indeterminacao, conjuncao condicional ou integrante
- `pobre` pode ser substantivo ou adjetivo
- `seca` pode ser substantivo, adjetivo ou forma verbal
- `canto` pode ser substantivo ou verbo
- `sao` pode ser verbo, adjetivo ou parte de nome proprio

Portanto, o objetivo nao deve ser "sempre cravar". O objetivo deve ser:

```text
cravar quando pode
explicar quando e provavel
assumir ambiguidade quando precisa
```

---

## Duas camadas necessarias

### 1. Camada escolar brasileira

Usada na interface para escritoras e estudantes:

1. substantivo
2. artigo
3. adjetivo
4. numeral
5. pronome
6. verbo
7. adverbio
8. preposicao
9. conjuncao
10. interjeicao

Essa e a camada que a pessoa reconhece.

### 2. Camada tecnica

Usada internamente para reduzir erro:

- NOUN / PROPN
- VERB / AUX
- ADJ
- ADV
- PRON
- DET
- ADP
- CCONJ / SCONJ
- NUM
- INTJ
- PART
- PUNCT
- X

Direcao recomendada: usar a camada tecnica para analisar; traduzir para a camada escolar na interface.

Exemplo:

```text
UD/tecnico: DET + PronType=Art
Interface: artigo

UD/tecnico: PROPN
Interface: substantivo proprio

UD/tecnico: AUX
Interface: verbo auxiliar

UD/tecnico: SCONJ
Interface: conjuncao subordinativa
```

---

## Modelo matematico recomendado

Para cada token, nao escolher uma classe de imediato. Gerar candidatos:

```js
{
  token: "seca",
  candidatos: [
    { classe: "substantivo", confianca: 0.42, evidencias: ["precedida por artigo"] },
    { classe: "adjetivo", confianca: 0.38, evidencias: ["pode qualificar substantivo"] },
    { classe: "verbo", confianca: 0.20, evidencias: ["forma verbal possivel"] }
  ],
  decisao: "ambiguo"
}
```

Formula conceitual:

```text
pontuacao =
  lexico
+ morfologia
+ contexto anterior
+ contexto posterior
+ concordancia
+ regencia
+ posicao na oracao
+ dependencias sintaticas provaveis
- penalidades de conflito
```

Regra de confianca:

```text
>= 0.90  classificar
0.70-0.89  "provavelmente"
< 0.70 ou margem pequena  "ambíguo"
```

Margem pequena:

```text
se melhor_candidato - segundo_candidato < 0.15,
nao cravar.
```

---

## Pipeline recomendado

### Etapa 1 - Segmentacao

Separar:

- paragrafos
- periodos
- oracoes
- tokens
- pontuacao
- locucoes

Cuidado:

- abreviaturas nao encerram frase automaticamente
- dialogo e travessao mudam fronteira
- poesia pode quebrar linha sem encerrar frase
- titulo pode ser frase sem verbo

### Etapa 2 - Candidatos morfologicos

Para cada palavra:

- consultar lexicos locais
- consultar sufixos e flexoes
- identificar nomes proprios provaveis
- identificar contracoes
- identificar locucoes antes de tokens isolados

Exemplos:

```text
por causa de -> locucao prepositiva
a fim de que -> locucao conjuntiva final
ao passo que -> locucao conjuntiva proporcional/adversativa
de repente -> locucao adverbial
```

### Etapa 3 - Contexto local

Usar janela de vizinhos:

- determinante + candidato nominal
- preposicao + grupo nominal
- pronome pessoal + verbo
- adverbio modificando verbo/adjetivo/adverbio
- conjuncao em fronteira de oracao

Mas nunca transformar regra frequente em certeza absoluta.

### Etapa 4 - Concordancia

Pontuar:

- genero
- numero
- pessoa
- tempo/modo verbal
- sujeito e verbo
- artigo/adjetivo/substantivo

Concordancia ajuda, mas nao resolve tudo:

```text
Os pobres chegaram.
```

`pobres` funciona como substantivo, embora venha de adjetivo.

### Etapa 5 - Regencia e valencia

Verbos pedem complementos diferentes:

- transitivo direto
- transitivo indireto
- transitivo direto e indireto
- intransitivo
- verbo de ligacao

Isso e essencial para `se`:

```text
Vendem-se casas.       -> partícula apassivadora
Precisa-se de ajuda.   -> indice de indeterminacao
Ele se feriu.          -> pronome reflexivo
```

### Etapa 6 - Arvore sintatica

Depois da morfologia, montar analise de dependencias:

- nucleo da oracao
- sujeito
- objeto direto
- objeto indireto
- predicativo
- adjuntos
- complementos nominais
- oracoes subordinadas
- coordenacoes

Nao fazer sintaxe profunda antes de ter candidatos morfologicos bons.

### Etapa 7 - Traducao para linguagem humana

O resultado tecnico precisa virar orientacao:

```text
"que" provavelmente introduz uma oracao subordinada substantiva.
```

Melhor do que:

```text
SCONJ ccomp
```

---

## Frase, oracao e periodo

O Escrevaral deve separar essas tres coisas:

```text
Frase: enunciado com sentido no contexto. Pode nao ter verbo.
Oracao: estrutura com verbo ou locucao verbal.
Periodo: conjunto de uma ou mais oracoes entre pausas maiores.
```

Exemplos:

```text
Silencio.
```

Frase sem oracao.

```text
Ela abriu a porta.
```

Frase, uma oracao, periodo simples.

```text
Ela abriu a porta e entrou sem olhar para tras.
```

Frase, duas oracoes, periodo composto por coordenacao.

```text
Quando ela abriu a porta, todos se calaram.
```

Frase, duas oracoes, periodo composto por subordinacao.

---

## Analises sintaticas possiveis

Camada escolar:

- sujeito
- predicado
- predicativo
- objeto direto
- objeto indireto
- complemento nominal
- agente da passiva
- adjunto adnominal
- adjunto adverbial
- aposto
- vocativo

Periodo composto:

- oracao coordenada assindetica
- oracao coordenada sindetica
- oracao subordinada substantiva
- oracao subordinada adjetiva
- oracao subordinada adverbial
- oracao reduzida

Camada tecnica:

- raiz
- dependente nominal
- modificador adjetival
- modificador adverbial
- complemento verbal
- marcador de caso/preposicao
- conjuncao coordenativa
- conjuncao subordinativa
- coordenacao
- aposicao

Direcao:

> Guardar analise tecnica internamente; mostrar analise escolar com explicacao e ressalva.

---

## Regras de ouro para nao errar

1. Nao classificar desconhecido como substantivo por padrao.
2. Nao marcar ambiguidade como erro.
3. Nao explicar como certeza uma analise baseada so em sufixo.
4. Nao analisar palavra isolada quando a frase inteira muda a classe.
5. Nao tratar norma escolar e linguistica computacional como a mesma camada.
6. Nao aplicar regra de prosa comum a poesia sem tolerancia.
7. Nao ignorar locucoes.
8. Nao separar contracao sem avisar a pessoa.
9. Nao punir variedade brasileira ou registro literario como erro.
10. Nao dizer "corrija" quando o correto e "pode haver outra leitura".

---

## Achado tecnico no estado atual

O Escrevaral ja tem bom caminho: usa fontes gramaticais, listas de ambiguidade e regras contextuais.

Mas ha risco em qualquer ponto que:

- use regra deterministica onde deveria haver pontuacao
- converta desconhecido para substantivo como fallback de interface
- classifique com base em uma janela pequena demais
- nao exponha incerteza para a pessoa

Recomendacao para Claude:

> Antes de ampliar classes ou sintaxe, criar uma estrutura de "candidatos + confianca + evidencias + decisao".

Isso deve vir antes de novas regras.

---

## Corpus de validacao

Criar um corpus pequeno, manual, de frases brasileiras com gabarito comentado.

Categorias obrigatorias:

- `a`, `o`, `os`, `as`
- `que`
- `se`
- `como`
- `porque`, `por que`, `porquê`, `por quê`
- substantivo/adjetivo ambíguo
- substantivacao por artigo
- nomes proprios
- locucoes prepositivas
- locucoes conjuntivas
- oracoes reduzidas
- periodo composto
- poesia e frase nominal
- fala com travessao
- registro coloquial brasileiro

Cada item deve guardar:

```js
{
  frase: "...",
  tokens: [
    {
      texto: "que",
      classe_escolar: "conjuncao",
      classe_tecnica: "SCONJ",
      funcao: "introduz oracao subordinada substantiva",
      certeza: "alta",
      comentario: "sem antecedente nominal; depende de verbo declarativo"
    }
  ]
}
```

---

## Criterio de aceite

Uma classificacao gramatical so deve ser considerada boa se:

1. acerta casos inequivocos
2. reconhece ambiguidade real
3. explica a decisao em portugues claro
4. nao transforma incerteza em erro
5. separa classe de palavra de funcao sintatica
6. separa analise escolar de camada tecnica
7. passa por corpus comentado antes de ir para interface

---

## Prompt curto para Claude

```text
Audite a engine gramatical do Escrevaral com foco em rigor para portugues brasileiro.

Nao implemente novas regras ainda.

Procure pontos onde a classificacao transforma incerteza em certeza, especialmente fallback para substantivo, regras por sufixo, palavras ambiguas como a/o/que/se/como/porque, locucoes e subordinacao.

Entregue um plano para criar uma camada de candidatos gramaticais com confianca, evidencias e decisao: classificado, provavel, ambiguo ou indeterminado.

Objetivo: orientar a escritora sem afirmar como erro aquilo que e ambiguidade real da lingua.
```

