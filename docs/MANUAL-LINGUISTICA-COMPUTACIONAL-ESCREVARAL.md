<!-- Transcrição do anexo de retomada fornecido por Rafa em 08/10/2026. SHA-256 do anexo: aacbaf146ad45906f18fa4938310a912d679587f7b2901bdeed0303c3565295e. Relato histórico da conversa anterior; sondas do protótipo não foram repetidas neste lote. -->

# Manual de Linguística Computacional do Escrevaral

Versão documental: 1.1 · 8 de outubro de 2026

Registro solicitado por Rafa Mass a partir do manual visual apresentado nesta conversa.

**Princípio central: o texto continua sendo seu.** A linguística orienta o produto; compatibilidade, memória e processamento determinam como entregá-lo.

Este documento preserva a direção conceitual do manual. Não certifica que todas as capacidades descritas estejam implementadas, testadas ou publicadas. Os exemplos são didáticos; não são resultados de uma execução do motor. A versão visual correspondente é `manual-linguistica-escrevaral-visual.html`.

## 1. Para que serve

Ligar cada fenômeno linguístico à regra, ao limite, ao teste e à experiência no painel. O escritor precisa reconhecer o que o sistema encontrou, compreender a interpretação proposta e voltar à ocorrência original sem perder o manuscrito nem se perder na interface.

O manual orienta o inventário do plano mestre. Não cria uma fila de implementação concorrente nem substitui a verificação do código. Cada item deve apontar para o requisito, o código, a evidência de teste e a experiência que o entrega ao escritor.

## 2. Percurso de leitura

| Camada | Pergunta | Saída esperada | Limite obrigatório |
| --- | --- | --- | --- |
| 1. Endereço e tokenização | Onde está cada ocorrência? | Unidades gráficas, seus intervalos e componentes gramaticais vinculados. | Não alterar o texto para fazê-lo caber na análise. |
| 2. Léxico | Quais análises essa forma pode ter? | Candidatos de classe, lema e flexão, com origem. | Reconhecer uma forma não resolve sua função na frase. |
| 3. Tradução linguística | Como apresentar as etiquetas ao escritor? | Vocabulário consistente no painel, preservando etiquetas e traços da fonte. | Não forçar equivalências entre sistemas diferentes. |
| 4. Contexto | Há apoio para reduzir a ambiguidade? | Leitura apoiada por regra ou hipóteses preservadas. | Preferência estatística não equivale a certeza. |
| 5. Grupos | Quais unidades funcionam juntas? | Sintagmas com limites e relações entre grupos. | Sintagma não é sinônimo de locução. |
| 6. Funções | Que papel o grupo desempenha na oração? | Relações como sujeito, complementos e adjuntos, no recorte coberto. | Classes reconhecidas não comprovam análise sintática geral. |

A explicação acompanha todas as camadas. Lema e flexão entram com os candidatos do léxico: não devem ser descartados nem adiados até depois da desambiguação.

### Exemplo: “Eu canto no quintal.”

| Ocorrência | Intervalo no original | Leitura didática |
| --- | --- | --- |
| Eu | [0, 2) | Pronome; sujeito nesta oração. |
| canto | [3, 8) | Candidato nominal ou verbal no léxico; leitura verbal apoiada por “Eu”. |
| no | [9, 11) | Palavra gráfica vinculada aos componentes “em” + “o”. |
| quintal | [12, 19) | Substantivo. |
| . | [19, 20) | Pontuação. |

Os intervalos começam em zero e excluem o limite final. “canto”, na leitura verbal do exemplo, tem lema “cantar”, presente do indicativo e primeira pessoa do singular. A explicação contextual deve indicar o apoio encontrado, não apenas exibir uma classe.

Agrupamento didático: **[Eu] [canto] [no quintal]**. “Eu” é um sintagma nominal; “canto” é núcleo verbal; “no quintal” é um sintagma preposicional com função de adjunto adverbial de lugar nessa leitura. O agrupamento simplificado não pretende representar toda a árvore sintática.

**Classe e função são perguntas diferentes:** “pronome” é a classe de “Eu”; “sujeito” é sua função na oração.

### Contraste: “Canto.”

“Canto” ocupa [0, 5) e o ponto ocupa [5, 6). Sem contexto suficiente, a leitura nominal ou verbal permanece aberta. A inicial maiúscula não decide a classe. Não se deve escolher uma estrutura ou função única apenas para preencher o painel.

## 3. Política de tradução linguística

A consulta lexical, a reserva de ocorrências, o exame contextual e a explicação devem usar uma política comum. A apresentação ao escritor pode traduzir os rótulos, mas deve preservar etiqueta original, traços morfológicos e origem.

Exemplos registrados no manual: `NOUN → substantivo`; `VERB → verbo`; em “no”, “em” corresponde a preposição e “o” a artigo.

`DET` não deve virar “artigo” automaticamente. Possessivos e demonstrativos exigem traços e uma política explícita. Traduzir o rótulo não elimina ambiguidades. A política completa, inclusive categorias sem equivalência direta nas dez classes tradicionais, precisa constar do inventário e de seus testes; este manual não a declara concluída.

## 4. Áreas da linguística no produto

| Área | Pergunta do escritor | Fenômenos | Exemplo e limite |
| --- | --- | --- | --- |
| Ortografia | Como se escreve? | Grafia, acentuação, hífen. | “voce” pode gerar candidato a “você”; sugestão não altera o manuscrito automaticamente. |
| Morfologia | Que palavra é e como se flexiona? | Classe, lema, gênero, número, pessoa, tempo, modo. | “cantávamos”: verbo, lema cantar, primeira pessoa do plural, pretérito imperfeito do indicativo. |
| Sintaxe | Como as palavras se relacionam? | Sintagmas, sujeito, complementos, orações. | Em “As casas brancas caíram.”, “As casas brancas” é sujeito. |
| Fonologia e prosódia | Como o texto pode soar? | Tonicidade, rima, métrica poética. | “casa” e “asa”: rima possível; leitura e variedade linguística influem. |
| Semântica e pragmática | Que sentido surge nesta situação? | Sentido, referência, ironia, intenção. | “Que beleza...” não autoriza inferir intenção sem contexto. |
| Estilística e discurso | Como a escrita se organiza? | Repetição, extensão de frases, coesão, voz. | Repetição contada não é, por si, defeito literário. |

Este é um mapa de escopo. Cada recurso deve declarar sua cobertura. Nomear uma área não significa dispor de um motor geral para ela.

## 5. Estados do conhecimento

| Estado | O que permite afirmar | Exemplo |
| --- | --- | --- |
| Reconhecido | Existem candidatos no acervo. | “canto”: substantivo ou verbo. |
| Resolvido no recorte | Uma regra tem apoio suficiente no contexto delimitado. | “Eu canto”: leitura verbal apoiada. |
| Em aberto | A conclusão não foi obtida; o motivo deve aparecer. | Ambiguidade, falta de dados ou trecho ainda não examinado. |

“Em aberto” deve distinguir pelo menos três motivos: **ambíguo**, **não reconhecido no acervo** e **não verificado**. Eles não são equivalentes.

Não encontrado não significa inexistente, incorreto ou inadequado. Isso vale especialmente para nomes próprios, regionalismos, neologismos e escolhas literárias. O sistema pode ocultar resultados incompatíveis com o filtro escolhido; não pode transformar ausência de cobertura em prova de ausência do fenômeno.

## 6. Contrato da experiência de escrita

**Escrever → pausa de 700 ms → preparar trecho limitado → reservar ocorrências.**

**Comando do escritor → examinar contexto → explicar → selecionar no original.**

A pausa de 700 ms é a referência preservada no manual. A preparação não equivale à classificação completa e não deve disparar trabalho pesado a cada tecla. O painel deve oferecer resultados pertinentes ao trecho examinado e tornar visível quando algo ainda não foi verificado.

Preparar, consultar e filtrar uma reserva não são a mesma operação que analisar relações gramaticais. A interface precisa permitir reconhecer essa diferença sem exigir que o escritor entenda a implementação.

Uma edição invalida resultados desatualizados. Ocorrências e explicações devem estar vinculadas à revisão correta antes de selecionar trechos. Um resultado publicado só conta como experiência entregue quando o escritor consegue encontrá-lo, entendê-lo e voltar ao texto.

## 7. Texto e anotações separados

O manuscrito permanece intacto. As anotações são estruturas separadas, vinculadas ao documento, à revisão e aos intervalos do original.

Uma palavra gráfica e seus componentes gramaticais não precisam ter correspondência literal individual. Em “no”, o componente “em” não ocupa uma substring literal: ambos os componentes estão vinculados à ocorrência gráfica. A mesma distinção deve orientar o tratamento de clíticos.

Os endereços só são válidos para a revisão analisada. Reanálise incremental exige tratamento explícito de mudanças nos limites de sentença, sobretudo após edição de pontuação; não basta deslocar números de posição sem verificar esses limites.

## 8. Orçamento técnico

Compatibilidade e economia de recursos sustentam a entrega linguística. As diretrizes preservadas são: piso ES5, funcionamento offline, preparação limitada e ausência de análise pesada por tecla. KitKat e iPads de 2012 são referências de época para decisões conservadoras; por decisão vigente de Rafa em 27/09/2026, testes nesses aparelhos e testes visuais não são exigidos para publicar.

Cada recurso deve declarar limites de entrada, memória máxima, tempo, cancelamento e condições de suspensão. Memória de carregamento e custo de consulta importam tanto quanto tamanho do arquivo. Limites são tetos, não metas de consumo.

Um teste de sintaxe ES5, uma simulação em navegador moderno ou um arquivo pequeno, isoladamente, não comprovam boa experiência em aparelho antigo. O registro distingue o que foi medido do que não foi verificado, sem transformar a ausência de homologação em pendência ou bloqueio de publicação.

## 9. Ficha obrigatória de regra ou recurso

| Campo | Registro necessário |
| --- | --- |
| Identidade | Identificador estável, área linguística e fenômeno. |
| Fonte | Referência, versão, origem dos dados e licença. |
| Entradas | Unidade analisada, contexto necessário e traços usados. |
| Decisão | O que a regra está autorizada a concluir. |
| Abstenção | Condições em que deve manter hipóteses ou não decidir. |
| Evidência | Casos positivos, contraexemplos e avaliação em textos independentes. |
| Implementação | Arquivos e pontos do código ligados ao item do plano mestre. |
| Interface | Entrada no painel, rótulo, explicação, apoio e retorno ao trecho original. |
| Autoria | Garantias de preservação do texto e validade dos endereços. |
| Custo | Limites, tempo, memória máxima e cancelamento. |
| Estado | Inventariada, implementada, medida, usável no painel ou publicada; registrar pendências. |

Caso uma alternativa estatística seja experimentada, sua evidência deve ser distinguida da aplicação de uma regra. A adoção de Viterbi ou de outro método não é consequência automática deste manual: depende de comparação com a base existente, ganhos medidos, erros e custo.

## 10. Critério de conclusão

**Inventariada → implementada → medida → usável no painel → publicada.**

O inventário liga cada requisito às dependências, à implementação, à lacuna e ao critério de aceite. Um exemplo que funciona ou um teste dirigido aprovado não comprova cobertura geral.

Na avaliação linguística, registrar separadamente decisões corretas, decisões incorretas, abstenções e cobertura, com denominadores e corpus identificados. Usar contraexemplos para detectar generalizações indevidas e textos independentes para avaliar comportamentos além dos casos usados para construir a regra.

Na entrega ao escritor, conferir o percurso completo: preparar sem interromper a escrita; apresentar opções pertinentes; distinguir estados; examinar sob comando; explicar apoios e limites; selecionar a ocorrência correta; invalidar o resultado após edição.

Na entrega técnica, registrar ambiente, dispositivo ou simulação, limites e medições. Não declarar aprovação em hardware antigo sem execução nesse hardware.

## 11. Uso no plano mestre

Este documento é referência transversal para o plano existente. Na próxima intervenção no repositório, vinculá-lo ao plano mestre e ao inventário, preservando os identificadores e o histórico já existentes. Não reiniciar o projeto nem criar um plano paralelo.

O registro documental desta conversa não implica atualização do repositório, commit, publicação do site ou conclusão de módulos. Esses atos precisam de evidência própria.

## 12. Registro desta edição

Preservados: seis camadas de leitura; exemplos “Eu canto no quintal.” e “Canto.”; separação entre classe e função; mapa das áreas linguísticas; estados de conhecimento; fluxo de preparação e exame; autoria e endereçamento; orçamento técnico; ficha de regra; critério de conclusão.

O visual original teve verificadas 12 combinações de exemplo/camada, os identificadores de elementos e a atualização da interação principal. Esse teste usa uma simulação mínima de DOM: não é validação visual em navegador nem medição em aparelho antigo. Nenhum motor linguístico foi executado para gerar os exemplos do manual.

Histórico: v1.0 — documentação do manual visual a pedido de Rafa Mass, em 07/10/2026.


## 13. Adendo de precisão e avaliação

Revisão de 08/10/2026, após leitura dos materiais do Claude e conferência das diretrizes vigentes na main.

**Endereços no original.** Calcular intervalos UTF-16 sobre o manuscrito original. Normalização usada para consulta não pode deslocar endereços. Se uma transformação mudar o comprimento, usar uma chave separada ou um mapeamento explícito e testado. A sequência decomponível `e + U+0301` não deve virar pontuação por ausência de normalização nativa.

**Componentes como hipótese.** Uma entrada na tabela de contrações gera uma alternativa de análise; não confirma a contração antes de considerar léxico e contexto. “O pelo caiu.” e “Passou pelo portão.” precisam de leituras distintas. Componentes se vinculam ao token gráfico, sem criar trechos literais inexistentes.

**Ambiguidade no contrato.** Uma hipótese preferida não ocupa o campo de decisão confirmada. Alternativas com a mesma classe, mas lemas ou flexões diferentes, devem permanecer representáveis. Frequências ilustrativas não entram em resultados do produto.

**Avaliação independente.** Separar desenvolvimento e teste por texto de origem; guardar revisão, origem e hash. Classes e segmentação do gabarito precisam de revisão independente da saída do motor. Quando um erro de TESTE orientar uma mudança, registrar a exposição e distinguir aquele conjunto de uma avaliação ainda reservada. O conjunto amplo pertence a Q02; não passa a bloquear todo incremento pequeno.

**Métricas explícitas.** Além de acertos e cobertura, contar erros afirmados como resolvidos e separar abstenções em casos decidíveis, ambíguos e fora de cobertura. Registrar denominadores; não criar uma nota única de “qualidade da abstenção” sem defini-la.

**Continuidade do produto.** Aplicar melhorias dentro de A03, M01/M02, U01 e Q01/Q02 do plano existente. O próximo percurso útil permanece ocorrência reservada → exame explícito do contexto → explicação → seleção no original.

Histórico: v1.1 — corrigida a exigência indevida de homologação em aparelhos; acrescentados controles de normalização, componentes candidatos, ambiguidades e avaliação independente. Revisão documental, sem alteração do site.
