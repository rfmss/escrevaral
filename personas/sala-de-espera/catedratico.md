---
nome: Arnaldo Figueiredo
tipo: testador especialista
papel: corpus linguístico, auditoria de qualidade das engines, oráculo humano
status: ativo — corpus em construção
sessão: fase 1 do guarda de regressão
---

# Arnaldo Figueiredo — o Catedrático

Professor titular de Língua Portuguesa na UFMG. 61 anos. Especialista em morfossintaxe do português brasileiro contemporâneo, com pesquisa em variação regional e linguagem literária. Autor de três romances curtos publicados por editora independente. Usa máquina de escrever até hoje — "para ouvir o pensamento".

Não sabe o que é um engine. Não precisa saber.

Sabe que "bela" e "triste" são adjetivos por função sintática, não por sufixo. Sabe que um ponto-e-vírgula numa frase de Guimarães Rosa não é erro. Sabe que "meu" pode ser substantivo ("o meu ficou para trás"), possessivo ou resíduo de verbo. Sabe que "lá" e "cá" sem acento são outra coisa.

## Por que ele está aqui

As engines do Escrevaral são construídas com listas e heurísticas. Arnaldo existe para encontrar onde a lista acaba e a língua começa.

Ele não testa se o botão funciona. Ele testa se a análise está certa.

## O que ele sabe que as engines ainda não sabem

Com base nos achados documentados em `META_ENGINES_100.md`:

| Zona de risco | Por que é difícil | Engine afetada |
|---|---|---|
| Adjetivos sem sufixo canônico | "bela", "triste", "grande", "livre" — só o contexto decide | Sintaxe |
| Pronomes possessivos ambíguos | "meu", "teu", "seu" — sufixo -eu confunde com verbo | Sintaxe |
| Pronomes demonstrativos contraídos | "deste", "neste", "naquele" — PREP+DET, não pronome puro | Sintaxe |
| Ordinais | "primeiro", "segundo" — ambíguos com adjetivos | Sintaxe |
| Interjeições em contexto literário | "ora", "ei", "ah" — dependem do tom e do sinal gráfico | Sintaxe |
| Pontuação literária intencional | travessão sem espaço, reticências internas, ponto-e-vírgula como ritmo | Pontuação |
| Voz passiva analítica vs. sintética | "foi escrito" vs. "escreve-se" — diferentes sinais | Espelho de Voz |
| Regionalismo como erro | "acolá", "fuleiro", "encardido" — decolonial e léxico | Decolonial / Biblioteca |
| Rima em verso sem métrica regular | verso livre com rima interna, assonância, aliteração | RimaLab |

## Como ele usa o Escrevaral

1. Abre uma folha nova
2. Digita frases do corpus — uma de cada vez, por categoria
3. Observa o output de cada engine sem intervir
4. Anota: o que foi certo, o que foi errado, o que foi omitido

Ele não reporta bugs. Ele reporta discrepâncias entre o que a língua é e o que a engine diz que é.

## Princípio de avaliação

> Uma ferramenta de escrita que erra mais do que um leitor atento não merece a confiança do escritor.

## Corpus de teste

Ver `scripts/corpus-catedratico.txt` — frases organizadas por zona de risco, com gabarito anotado (o que a análise correta seria) e o que a engine retornou na última execução.
