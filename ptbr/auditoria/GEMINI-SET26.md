# Pacote do autor e Gemini — avaliação de aproveitamento

26/09/2026. Recebido: `ESCREVARAL SET26-20260926T181903Z-1-001.zip`, 11 arquivos. Extração isolada, sem substituir a cópia de trabalho. Foco da avaliação: `index.html`, `worker-nlp.js`, `dicionario-compilado.js` e README atual. Backups não foram tratados como versão de produção.

## O que ajuda

| Ideia do pacote | Aproveitamento |
| --- | --- |
| Motor separado em Worker | Boa referência de transporte assíncrono. Uma futura integração precisa de identidade da folha, revisão, lente, cancelamento e fallback portátil. Não basta deslocar o cálculo para outra thread. |
| Vínculos por índices e desenho após medir os elementos | Compatível com a direção atual de nós por ocorrência e arcos medidos. Preservamos também posições UTF-16, grupos contidos e descrição escrita dos vínculos. |
| Auxiliar ligado ao principal | Aproveitado como caso de comparação para o incremento de locuções. A apresentação atual separa os componentes sem deduzir voz passiva. |
| Léxico compacto para distribuição | Vale comparar tamanho de arquivo, inicialização e memória com medição. O código lido reconstrói objetos por palavra; a alegada economia de memória ainda não foi demonstrada. |
| Experimento separado de produto | Permite testar ideias de modo barato, sem alterar cadernos, armazenamento ou autoria do Escrevaral. |

## Resultados reproduzidos

Executado o Worker com o dicionário externo em VM Node, sem rede e sem DOM. Resultados e hashes em `gemini-set26.json`. Reproduzir:

```sh
node ptbr/ferramentas/avaliar-gemini-set26.cjs /caminho/da/pasta-extraida
```

| Entrada/condição | Resultado observado no pacote | Consequência |
| --- | --- | --- |
| Eu estou lendo o livro. | “Voz Passiva”; sujeito `nsubj:pass`; predicado perde “estou”. | A presença de estar + outra forma verbal não distingue passiva de progressiva. Testado no novo corpus de locuções. |
| Eu canto. | “Frase sem verbo (Nominal)”. | Falta no inventário não comprova ausência de verbo. |
| qwertyer | Verbo por terminação; sujeito “Os alunos dedicados”. | Palavra inventada e informação não presente no original. Nosso motor mantém desconhecimento e não cria sujeito. |
| Texto vazio | Contagem de 12 sílabas poéticas. | Valor substituto fixo não pode aparecer como cálculo. |
| a / esta / nos | Uma classe final por palavra: preposição / verbo / preposição. | Colisões apagam alternativas; artigo/pronome/preposição precisam de contexto. |
| voo / água | Uma sílaba em cada caso. | Silabificação precisa de revisão antes de alimentar métrica ou legibilidade. |

São contraexemplos delimitados, não uma estimativa de precisão geral. O pacote também produz resultados plausíveis em outras entradas; isso não elimina as falhas reproduzidas.

## Diferenças de contrato

- A interface dispara todos os cálculos do Worker após `keyup` e analisa o primeiro trecho anterior à pontuação. O Escrevaral atual exige escolha explícita de uma lente e não analisa ao digitar.
- A resposta não traz identidade da folha/revisão ou spans do manuscrito. A interface aceita a última mensagem recebida sem conferir se ela pertence ao texto atual. Ao esvaziar o editor, não limpa a análise anterior nesse handler.
- O parser trata a sequência inteira recebida, sem uma estrutura geral de orações encaixadas; usar nomes de dependências não valida as relações linguísticas.
- A classificação de legibilidade usa o número de palavras recebido como termo de extensão e atribui rótulos como “Literária” e “Erudita”. Não incorporamos tais rótulos como medidas de qualidade, intenção ou valor literário.
- O Worker é instanciado diretamente. Não há fallback caso sua criação falhe. A sintaxe dos scripts passou em Acorn ES5, mas isso não certifica CSS, APIs, abertura por arquivo, offline real ou os aparelhos citados no README.
- O desenho atual usa SVG; o README menciona Canvas 2D. Documentação deve acompanhar a versão executada.

## Decisão

Não importar o motor integral ou trocar o HTML atual pelo protótipo. Aproveitar a referência arquitetural, a distinção auxiliar/principal e os contraexemplos. A mudança realizada no produto é a etapa de locuções baseada nas fontes já enviadas e em formas explícitas; nenhum inventário do ZIP foi incorporado.

Worker continua como opção técnica a avaliar quando houver custo que o justifique. Sua introdução precisa preservar cancelamento, resultados atuais, seleção exata e funcionamento portátil. Não se afirmou desempenho nem compatibilidade a partir do README.
