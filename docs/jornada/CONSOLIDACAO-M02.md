# M02 — relatório consolidado

Consolidação de corpus próprio; sem cegamento, independência ou estimativa de acurácia geral.

Um registro por alvo original. Repetições entre corpora preservadas; totais não contam frases únicas. Controles booleanos avaliam somente a regra/família indicada. Abstenções sem classe desejada não são atribuídas artificialmente a uma classe. Observações esperadas não contam como decisões.

Motor: `contexto-20-que-integrante`; léxico: `315e063da1f8-recorte-12`.

## Famílias dos gabaritos

| Família | Úteis | Erradas | Abstenções | Lacunas | Observações |
|---|---:|---:|---:|---:|---:|
| legado | 38 | 0 | 25 | 0 | 0 |
| nominal-1 | 26 | 0 | 14 | 0 | 0 |
| nominal-2 | 13 | 0 | 7 | 0 | 0 |
| nominal-3 | 17 | 0 | 13 | 0 | 0 |
| nominal-4 | 8 | 0 | 6 | 0 | 6 |
| nominal-5 | 12 | 0 | 16 | 0 | 0 |
| coordenação com artigos | 14 | 0 | 18 | 0 | 0 |
| coordenação com adjetivos | 10 | 0 | 24 | 2 | 0 |
| negação | 12 | 0 | 20 | 0 | 0 |
| cardinais | 12 | 0 | 20 | 0 | 0 |
| interjeições | 12 | 0 | 20 | 0 | 0 |
| locuções adverbiais | 12 | 0 | 20 | 0 | 0 |
| locuções verbais | 12 | 0 | 20 | 0 | 0 |
| locuções prepositivas | 12 | 0 | 20 | 0 | 0 |
| locuções conjuntivas | 12 | 0 | 20 | 0 | 0 |
| como interrogativo | 12 | 0 | 20 | 0 | 0 |
| se pronominal | 12 | 0 | 20 | 0 | 0 |
| que integrante | 12 | 0 | 20 | 0 | 0 |

## Classes dos alvos

Abstenções sem classe-alvo ficam em linha própria. Grupos não são contados como palavras. Determinante UD permanece separado das dez classes.

| Classe/alvo | Úteis | Erradas | Abstenções | Lacunas | Observações |
|---|---:|---:|---:|---:|---:|
| verbo | 23 | 0 | 0 | 0 | 0 |
| substantivo | 47 | 0 | 0 | 0 | 0 |
| artigo | 5 | 0 | 0 | 0 | 0 |
| pronome | 26 | 0 | 20 | 0 | 0 |
| controle sem classe-alvo | 0 | 0 | 81 | 0 | 0 |
| adjetivo | 8 | 0 | 0 | 0 | 0 |
| determinante (UD) | 12 | 0 | 0 | 0 | 0 |
| observação possessiva | 0 | 0 | 0 | 0 | 6 |
| conjunção | 41 | 0 | 62 | 2 | 0 |
| advérbio | 24 | 0 | 40 | 0 | 0 |
| numeral | 12 | 0 | 20 | 0 | 0 |
| interjeição | 12 | 0 | 20 | 0 | 0 |
| locução adverbial | 12 | 0 | 20 | 0 | 0 |
| locução verbal | 12 | 0 | 20 | 0 | 0 |
| locução prepositiva | 12 | 0 | 20 | 0 | 0 |
| locução conjuntiva | 12 | 0 | 20 | 0 | 0 |

## Sondas diagnósticas por classe

| Classe | Desejadas | Diferentes | Abertas |
|---|---:|---:|---:|
| substantivo | 1 | 0 | 1 |
| artigo | 1 | 0 | 1 |
| adjetivo | 1 | 0 | 1 |
| pronome | 1 | 0 | 1 |
| verbo | 1 | 0 | 1 |
| advérbio | 1 | 0 | 1 |
| numeral | 2 | 0 | 0 |
| preposição | 1 | 0 | 1 |
| conjunção | 1 | 0 | 1 |
| interjeição | 2 | 0 | 0 |

## Metas não atendidas ou decisões diferentes

- nominal-7/avaliacao.json / AVA04: “As revistas bonitas ou os livros pequenos.”; alvo ou; esperado conjunção; obtido null (missing).
- nominal-7/avaliacao.json / AVA06: “Um livro pequeno e uma revista branca.”; alvo e; esperado conjunção; obtido null (missing).

## Reprodução e limites

`node ferramentas/consolidar-m02.cjs --write` gera JSON e este documento. `--check` compara com o runtime atual. O JSON conserva os alvos e hashes dos gabaritos; nenhum gabarito foi reescrito. Testes técnicos e casos inline das suítes continuam próprios; não foram convertidos em corpus linguístico independente. As sondas e os gabaritos não se somam em uma taxa.

Escopo e critérios pendentes: [COBERTURA-M02](COBERTURA-M02.md) e [escopo de locuções](ESCOPO-LOCUCOES-M02.md).
