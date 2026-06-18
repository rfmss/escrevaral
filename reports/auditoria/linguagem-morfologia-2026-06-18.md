# Auditoria de Linguagem e Morfologia - 2026-06-18

Destino: Claude / frente de expansao de dicionario, vocabulario e cobertura gramatical.

Escopo auditado: `lexical-engine.js`, `grammar-controller.js`, `syntax-engine.js`, `rimalab-engine.js`, `lexical-data.json`, `norma-data.json`.

Fontes locais consideradas como regua tecnica: `Livros/Nova gramática do português contemporâneo (Celso Cunha  Lindley Cintra).pdf`, `Livros/Lições de Português pela Análise Sintática (Evanildo Bechara).pdf`, `Livros/Compreender e interpretar os textos Para todo tipo de prova de Língua Portuguesa (Evanildo Bechara).pdf`, `Livros/Novo Dicionário de Dúvidas da Língua Portuguesa (Evanildo Bechara).pdf`, `.claude/skills/auditar-homografos/SKILL.md`, `CLAUDE.md`.

## Pedido melhorado para o Claude

Trabalhe hoje na robustez da linguagem do Escrevaral, mas nao como expansao cega de listas. O objetivo e reduzir falso positivo e falso negativo nas classes de palavras, principalmente substantivo vs verbo, adjetivo vs verbo, artigo/preposicao/pronome, adverbio/conjuncao e verbos flexionados com acento ou clitico.

Antes de adicionar qualquer entrada em `norma-data.json` ou `lexical-data.json`, rode uma auditoria de colisao contra formas verbais, formas acentuadas sem diacritico e palavras funcionais. Quando uma forma for homografa ou homonima, nao resolva por lista global; crie regra contextual ou tabela de ambiguidades. A classificacao deve considerar funcao na frase, nao apenas sufixo.

Definicao de pronto para hoje:

- A bateria de fronteira deste relatorio precisa passar.
- O corpus de guarda existente de 81 frases precisa continuar sem regressao.
- `adjetivos_comuns` nao pode sequestrar forma verbal.
- O inspetor lexical e a coloracao gramatical devem concordar nos mesmos contextos.
- Verbos com acento, flexoes plurais acentuadas, participios regulares e cliticos hifenizados precisam ser tratados explicitamente.
- RimaLab nao deve ser usado como fonte normativa de classe gramatical enquanto mantiver fallback simplificado.

## Resultado executivo

A auditoria de fronteira teve 43 casos. Resultado: 18 passaram, 25 falharam, 42% de acerto. O relatorio noturno de 2026-06-18 esta verde no corpus de 81 frases, mas esse corpus nao cobre as regioes perigosas: homografos, flexoes acentuadas, cliticos e polissemia funcional.

| Grupo | Passou | Total | Taxa |
|---|---:|---:|---:|
| `lexical-contexto` | 1 | 7 | 14% |
| `lexical-basico` | 1 | 3 | 33% |
| `lexical-verbo-acentuado` | 0 | 3 | 0% |
| `lexical-polissemia` | 1 | 2 | 50% |
| `syntax-homografo-adj-verbo` | 3 | 8 | 38% |
| `syntax-flexao-verbal` | 3 | 8 | 38% |
| `syntax-cliticos` | 1 | 3 | 33% |
| `syntax-verbo-acentuado` | 4 | 4 | 100% |
| `syntax-substantivo` | 2 | 3 | 67% |
| `syntax-participio-contexto` | 2 | 2 | 100% |

## Achados P0

### P0.1 - `VeredaLexical.analyze()` perde desambiguacao contextual

Evidencia de codigo:

- `lexical-engine.js:263` define `inferWordClassContextual(word, text)` com varredura de tokens.
- `lexical-engine.js:482` redefine `inferWordClassContextual(word, text, prevNorm, nextNorm)` e sobrescreve a primeira funcao.
- `lexical-engine.js:303` chama `inferWordClassContextual(selectedWord, text)`, mas a funcao publica ativa espera `prevNorm` e `nextNorm`. Resultado: `prevNorm` fica indefinido em `POLISSEMIA`.

Falhas medidas no inspetor lexical:

| Caso | Esperado | Atual |
|---|---|---|
| `Ela disse que viria.` / `que` | Conjuncao integrante | Pronome interrogativo |
| `O livro que li ficou na mesa.` / `que` | Pronome relativo | Pronome interrogativo |
| `Ele se feriu ao cair.` / `se` | Pronome pessoal reflexivo | Conjuncao |
| `Ele voltou logo para casa.` / `logo` | Adverbio | Conjuncao |
| `Como fez isso?` / `Como` | Adverbio interrogativo | Conjuncao |
| `Quando ele chegou?` / `Quando` | Adverbio interrogativo | Conjuncao |

Impacto: o tooltip/inspetor lexical entrega classe errada justamente nas palavras mais polissemas da lingua.

### P0.2 - A ordem de palavras funcionais transforma `a` em pronome pessoal

Evidencia de codigo: `lexical-engine.js:327-352` consulta pronomes antes de artigos, preposicoes e contracoes. Como `a` esta em `PRON_OBLIQUOS_ATONOS`, os casos abaixo falham:

| Caso | Esperado | Atual |
|---|---|---|
| `A menina chegou.` / `A` | Artigo | Pronome pessoal |
| `Entreguei a carta a Maria.` / `a` | Preposicao | Pronome pessoal |

Recomendacao: tratar `a/o/as/os` por contexto. Antes de substantivo ou adjetivo nominal, artigo; antes de nome proprio/infinitivo/complemento indireto, preposicao; apos verbo transitivo com valor de objeto, pronome obliquo. Nao resolver por ordem fixa.

### P0.3 - A normalizacao sem acento derruba verbos acentuados no lexical

Evidencia de codigo: `lexical-engine.js:641-642` remove diacriticos antes da classificacao. Isso faz `dá` virar `da`, `pôr` virar `por`, e `vê` virar `ve`.

Falhas medidas:

| Caso | Esperado | Atual |
|---|---|---|
| `Ela dá o livro ao menino.` / `dá` | Verbo flexionado | Preposicao/Artigo |
| `Ela vê o mar.` / `vê` | Verbo flexionado | Substantivo |
| `Vou pôr o livro na mesa.` / `pôr` | Verbo no infinitivo | Preposicao |

Recomendacao: manter duas chaves: `surfaceNorm` com acento preservado para formas verbais/acento distintivo, e `stripNorm` apenas para buscas seguras. Acento distintivo deve vencer preposicao/contracao quando a superficie original tem acento.

### P0.4 - `adjetivos_comuns` ainda sequestra verbos em `syntax-engine`

Evidencia de codigo: `syntax-engine.js:252` checa `_ADJ_EXT` antes dos verbos. As listas atuais ainda contem colisao com formas verbais.

Colisoes em `norma-data.json`:

| Forma | Tambem esta em | Falha medida |
|---|---|---|
| `intima` | `verbos_pres_reg` | `Ela intima o réu.` -> `Adjective` |
| `larga` | `verbos_pres_reg` | `Ele larga o livro.` -> `Adjective` |
| `sabias` | `formas_verbais_irr` | `Tu sabias a resposta.` -> `Adjective` |
| `seguro` | `formas_verbais_irr` | `Eu seguro a porta.` -> `Adjective` |

Colisoes em `lexical-data.json` contra listas verbais:

- `adjetivos_comuns`: `estreito`, `estreita`, `partido`, `larga`
- `pronomes`: `estas`
- `conjuncoes`: `posto`, `seja`, `quer`
- `preposicoes`: `para`, `por`
- `contracoes`: `da`, `das`

Recomendacao: nenhuma dessas formas deve ser resolvida por lista simples. Criar `ambiguousForms` com regras por vizinho sintatico. Exemplo: `seguro` depois de sujeito explicito tende a verbo; depois de artigo/substantivo tende a adjetivo/substantivo.

### P0.5 - Flexoes verbais acentuadas e participios regulares nao entram na morfologia sintatica

Evidencia de codigo: `syntax-engine.js:303-305` aplica regex sobre `norm`, preservando acento; `identificarTempoVerbal()` em `syntax-engine.js:378-386` sabe reconhecer participio e futuro, mas so roda depois que o token ja recebeu tag `Verb`.

Falhas medidas:

| Caso | Esperado | Atual |
|---|---|---|
| `Nós cantávamos no fim.` / `cantávamos` | Verb | sem tag |
| `Eles cantarão amanhã.` / `cantarão` | Verb | sem tag |
| `Nós cantaríamos amanhã.` / `cantaríamos` | Verb | sem tag |
| `Se cantássemos baixo, ouviriam.` / `cantássemos` | Verb | sem tag |
| `O hino foi cantado cedo.` / `cantado` | Verb/participo | sem tag |

Recomendacao: criar um normalizador morfologico para verbo que use forma sem acento apenas para regex de desinencia, mas preserve a superficie para diferenciar `pôr/por`, `dá/da`, `pôde/pode`. Incluir padroes acentuados e 1a pessoa plural: `-ávamos`, `-íamos`, `-áramos`, `-éramos`, `-íramos`, `-aremos`, `-eremos`, `-iremos`, `-arão`, `-erão`, `-irão`, `-aríamos`, `-eríamos`, `-iríamos`, `-ássemos`, `-êssemos`, `-íssemos`.

### P0.6 - Verbos com clitico hifenizado ficam invisiveis

Falhas medidas:

| Caso | Esperado | Atual |
|---|---|---|
| `Preciso amá-lo melhor.` / `amá-lo` | Verb | sem tag |
| `Ela dá-me o livro.` / `dá-me` | Verb | sem tag |
| `Eu fá-lo-ei amanhã.` / `fá-lo-ei` | Verb | Verb |

O terceiro caso passa por acidente: termina em `ei`, nao porque a mesoclise foi entendida. Recomendacao: antes da classificacao, decompor tokens hifenizados em base verbal + cliticos (`me`, `te`, `se`, `o`, `a`, `lo`, `la`, `nos`, `vos`, `lhe`) + possivel terminacao mesoclitica.

## Achados P1

### P1.1 - Substantivo comum no inicio de periodo pode ficar sem classe

Falha medida: `Amor move a cena.` / `Amor` deveria receber `Noun`, mas fica sem tag. O bloco de inicio maiusculo em `syntax-engine.js:269-292` protege nomes proprios, toponimos e alguns sufixos, mas nao tem fallback seguro para substantivo comum capitalizado por inicio de frase.

Recomendacao: se for primeira palavra, maiuscula apenas por posicao, e nao houver indicio de nome proprio, permitir `Noun` quando o proximo token for verbo ou quando a palavra existir em lexico nominal.

### P1.2 - Adjetivos homografos tambem sofrem no sentido inverso

Falha medida: `O caminho estreito acabou.` / `estreito` deveria ser `Adjective`, mas virou `Verb`. Isso e o inverso do sequestro por adjetivo: quando a forma esta so no conjunto verbal, o contexto nominal nao corrige.

Recomendacao: aplicar uma segunda passagem mais forte para `Noun + candidato` ou `Determiner + Noun + candidato`, permitindo adjetivo quando a posicao for adnominal/predicativa.

### P1.3 - `mais` nao distingue adverbio de pronome indefinido no lexical

Falha medida: `Mais pessoas chegaram.` / `Mais` deveria ser pronome indefinido/determinante indefinido, mas retorna adverbio. `POLISSEMIA.mais` em `lexical-engine.js:258` retorna sempre `Advérbio`.

Recomendacao: se `mais` antecede substantivo/adjetivo nominal, classificar como pronome indefinido/determinante; se modifica verbo/adjetivo/adverbio, classificar como adverbio.

## Achado P2

### P2.1 - RimaLab tem classificador proprio simplificado

`rimalab-engine.js:309-317` usa regras locais e cai em `substantivo` por padrao. Isso e aceitavel para rima pobre/rica como heuristica poetica, mas nao deve ser usado como verdade gramatical do produto. Tambem classifica `cantado` como adjetivo por sufixo, ainda que em `foi cantado` seja participio verbal.

Recomendacao: manter RimaLab isolado ou passar a consumir uma funcao compartilhada de classificacao ja corrigida.

## Casos obrigatorios para a bateria de aceite

Adicionar estes casos ao guarda de regressao de linguagem. Eles sao mais importantes que novas palavras soltas.

```text
Ela disse que viria.              que -> Conjuncao
O livro que li ficou na mesa.     que -> Pronome relativo
Ele se feriu ao cair.             se -> Pronome pessoal
Se chover, fico.                  se -> Conjuncao
Ele voltou logo para casa.        logo -> Adverbio
Como fez isso?                    Como -> Adverbio interrogativo
Quando ele chegou?                Quando -> Adverbio interrogativo
A menina chegou.                  A -> Artigo
Entreguei a carta a Maria.        a -> Preposicao
Ela dá o livro.                   dá -> Verbo
Ela vê o mar.                     vê -> Verbo
Vou pôr o livro na mesa.          pôr -> Verbo no infinitivo
Mais pessoas chegaram.            Mais -> Pronome indefinido/determinante

Ela intima o réu.                 intima -> Verb
Ele larga o livro.                larga -> Verb
Eu seguro a porta.                seguro -> Verb
Tu sabias a resposta.             sabias -> Verb
A estrada estreita a passagem.    estreita -> Verb
O caminho estreito acabou.        estreito -> Adjective
A pergunta surge cedo.            pergunta -> Noun
Ela pergunta cedo.                pergunta -> Verb

Nós cantamos no fim.              cantamos -> Verb
Nós cantávamos no fim.            cantávamos -> Verb
Eles cantarão amanhã.             cantarão -> Verb
Nós cantaríamos amanhã.           cantaríamos -> Verb
Se cantássemos baixo, ouviriam.   cantássemos -> Verb
O hino foi cantado cedo.          cantado -> Verb/Participle
Ela daria tudo.                   daria -> Verb
Se cantassem baixo, ouviriam.     ouviriam -> Verb

Preciso amá-lo melhor.            amá-lo -> Verb
Ela dá-me o livro.                dá-me -> Verb
Eu fá-lo-ei amanhã.               fá-lo-ei -> Verb

Amor move a cena.                 Amor -> Noun
O amor move a cena.               amor -> Noun
Maria move a cena.                Maria -> ProperNoun/Noun
O partido venceu.                 partido -> Noun
Ele havia partido cedo.           partido -> Verb/Participle
```

## Ordem sugerida de correcao

1. Corrigir `lexical-engine.js`: remover a duplicidade de `inferWordClassContextual` e fazer `analyze()` calcular `prevNorm`/`nextNorm` corretamente.
2. Separar normalizacao com acento preservado e sem acento. Usar a forma sem acento como auxiliar, nao como identidade unica.
3. Mover formas homografas de listas simples para uma tabela `ambiguousForms` com regras contextuais.
4. Criar gate automatico de colisao para `norma-data.json` e `lexical-data.json`.
5. Expandir o reconhecedor verbal do `syntax-engine.js` para flexoes acentuadas, participios regulares e cliticos hifenizados.
6. Reforcar a segunda passagem contextual de `syntax-engine.js` para adjetivo em posicao nominal e substantivo comum em inicio de periodo.
7. Fazer o corpus existente de 81 frases e a nova bateria de fronteira rodarem juntos antes de declarar 100%.

## Nota para evitar regressao de produto

Se a correcao tocar JS ou CSS, seguir `CLAUDE.md`: atualizar a string `?v=` em `index.html` e o `ASSET_VERSION`/cache do `service-worker.js`. Se tocar apenas JSON de dados, ainda assim rodar os guardas, porque `norma-data.json` e `lexical-data.json` alteram comportamento gramatical sem mexer em engine.
