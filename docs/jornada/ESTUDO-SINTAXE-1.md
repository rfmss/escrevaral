# Unidade estudada: relações em construções simples

26/09/2026 · P01/P05 · estudo delimitado, não leitura integral.

## Fontes e conferência

- B09, Cunha e Cintra, *Nova gramática do português contemporâneo*, 7ª ed., 2ª impressão, 2017. Texto das páginas PDF 168–174, 177–185, 187–188: páginas impressas 135–141, 144–152 e 154–155. Conferência visual dos diagramas e textos nas páginas PDF 169, 170, 185 e 187. Hash do reenvio `(3)` igual ao já catalogado.
- B16, Bechara, *Lições de português pela análise sintática*. Texto das páginas PDF 22–24, 48, 75–76, 94–96, 99 e 103. Conferência visual de 22, 48, 75, 94 e 103. São páginas digitais; não foram convertidas em paginação impressa. Conservada a divergência entre rosto (19ª ed., 2014) e ficha digital (20ª ed., 2018).
- A extração apresenta ruídos no PDF de Cunha/Cintra. Os esquemas de sujeito/predicado e sintagma nominal foram conferidos na imagem. Os textos integrais e as imagens de páginas não entram no repositório.

## Síntese em palavras próprias

O sujeito e o predicado são grupos da oração, não necessariamente palavras isoladas. Dentro do sujeito nominal, um substantivo pode ser o núcleo e vir acompanhado de determinantes e modificadores. Um pronome pode constituir sozinho o sujeito. O predicado reúne o que a oração declara; não deve ser reduzido ao verbo quando contém complementos ou outras expansões.

Sujeito não equivale a agente. A voz e o tipo de predicação importam. Neste incremento, a apresentação não responde mecanicamente “quem faz a ação?” para todo sujeito.

No emprego verbal significativo, o verbo organiza o predicado; no emprego de ligação, a terminologia tradicional distingue o verbo de ligação e o predicativo. A interface não chama o verbo de ligação de núcleo de um predicado verbal.

Objeto direto é uma relação de complementação, não um rótulo para qualquer substantivo posterior ao verbo. A presença de preposição também não resolve sozinha a função. As duas fontes enfatizam que o emprego na frase determina a transitividade. O código exige uma construção completa compatível e apresenta uma hipótese, conservando o limite semântico.

## Confronto das abordagens

Bechara explicita, na abertura de *Lições* (PDF 22), diferenças entre a tradição adotada no livro e o tratamento de sujeito, predicado e complementos em suas outras gramáticas. O incremento usa a nomenclatura tradicional de Cunha/Cintra e destas *Lições*. Não reúne silenciosamente as duas taxonomias.

Para objetos indiretos, a própria NGB agrupa comportamentos diferentes. Mantém-se somente o caso estreito já existente de **dar + grupo nominal + a + grupo nominal**, com leitura de destinatário. Não se generaliza toda preposição como objeto indireto.

## Decisão operacional

Os critérios estão em `regras-sintaxe-1.json`. O motor recebe uma cópia do texto, percorre no máximo 8.000 unidades UTF-16/1.600 tokens e só propõe relações quando todo o segmento cabe em um padrão. Um segmento com mais de 24 tokens, desconhecidos ou pontuação interna incompatível fica fora deste recorte. Esses limites são decisões de engenharia, não regras gramaticais dos livros.

São possíveis sujeito nominal ou pronominal explícito, um verbo no indicativo compatível em pessoa/número, negação anterior opcional e circunstância final registrada. O padrão admite objeto direto nominal, ligação com adjetivo ou o caso estreito de dar. Flexões nominais são registradas explicitamente. Não se infere número pelo sufixo nem função por mera posição.

As relações têm identificadores de ocorrência, pai e trechos exatos. O sujeito possui núcleo destacado; predicado contém verbo, complemento e circunstância. A interface mostra esses grupos e, por seleção, ligações também descritas em texto.

## Exemplos próprios e abstenções

| Entrada | Resultado esperado no recorte |
| --- | --- |
| A menina não leu a carta ontem. | Sujeito “A menina”, núcleo “menina”; predicado “não leu a carta ontem”; verbo, objeto, negação e circunstância contidos nele. |
| Eu canto. O canto terminou. | Ocorrências e funções distintas; nenhum vínculo entre as duas construções. |
| A menina é feliz. | Verbo de ligação e predicativo, sem chamar “é” de núcleo verbal significativo. |
| Eu vi a menina feliz. | Abster: o adjetivo pode integrar o objeto ou ser predicativo dele. |
| A porta é aberta. | Abster: particípio/predicação de estado e passiva exigem outra análise. |
| O livro que eu li chegou. | Abster: não classificar subordinação apenas por “que”. |
| Tu canta. | Fora do padrão de compatibilidade formal deste incremento; nenhum juízo sobre o falante ou sua variedade. |

O corpus contém 78 casos próprios de desenvolvimento/regressão, além de verificações técnicas de corte, posições e integridade. A anotação REL-N39 foi corrigida: “Eu canto... ela corre.” admite dois segmentos analisáveis; a expectativa inicial de silêncio era inadequada. O ID foi preservado para rastreabilidade.

## Estado e próxima unidade

Estudado, sintetizado e formalizado neste recorte. Revisão técnica pelo mesmo assistente que implementou; não houve revisão independente ou humana. O conjunto não é uma avaliação cega; métricas de generalização ficam pendentes.

Próxima unidade linguística: locuções verbais e fronteiras de oração, antes de ampliar subordinação. Diferenciar auxiliar + forma nominal de duas orações será um requisito; contar formas verbais não basta. Referência inicial localizável: Cunha/Cintra, p. 135 (PDF 168). Validar o incremento atual em navegador continua sendo o próximo requisito de publicação.
