<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-38.json -->
# Família nominal: artigos indefinidos e apoios verbais reais

v6.38: família nominal ampliada para um/uma/uns/umas e flexões reais de cair, chegar e terminar. As duas lacunas medidas na v6.37 foram resolvidas; M02-indefinidos-1 e M01-apoios-1 cumpridas, marcos gerais parciais.

Base: `92a143ea9c673508705562e46888af4488074c1d`. Coordenação solo; data 30/09/2026.

## Escopo concluído e uso

M02-indefinidos-1 cumprida: um/uma/uns/umas passam a apoiar as construções nominais já existentes, tanto artigo/nome/adjetivo nas duas ordens quanto sequência com de + artigo opcional + nome e apoio finito. Exemplos: Uma mulher feliz chegou.; Um grande homem chegou.; O filho de uma mulher chegou.; Umas casas da mulher caíram. M01-apoios-1 cumprida: flexões de cair, chegar e terminar entram pelo conversor do snapshot existente. Continua uma lente explícita, sem edição do manuscrito ou análise ao digitar.

## Reutilização e ambiguidades

Não foi criado outro motor ou regra numerada: PTBR-CTX-006/007 usam o mesmo inventário nominal de artigos ampliado e os mesmos traços/fronteiras. O inventário o/a/os/as usado para clíticos permanece separado; um/uma/uns/umas não entram na regra pronominal. Artigo + nome simples da regra legada PTBR-CTX-002 continua limitado aos definidos; este incremento não promete classificação geral de indefinidos em qualquer posição. Um/uma conservam candidato numeral e ganham explicação explícita de que a hipótese de artigo não resolve intenção quantitativa. A bela/uma bela menina mantém abstenção quando as duas distribuições NOUN/ADJ são possíveis. Sintaxe/relativas conservam leituras legadas.

## Dados e fontes

O mesmo snapshot PortiLexicon-UD 315e063da1f89c89e2097c6e72428ebefb9ab1d1 foi reconvertido após verificar SHA-256 das 12 tabelas. Acrescentados somente os lemas cair, chegar e terminar: 207 sementes, 3.165 formas, 5.534 leituras e 486 lemas incluindo homógrafos. A regra de importação continua trazendo todas as análises das formas selecionadas. As 3.009 formas anteriores e todas as suas leituras foram comparadas e preservadas exatamente. Entrada agora registra subsetVersion=2; runtime identifica 315e063da1f8-recorte-2. Hash/tamanho e licença constam de ORIGEM.json; atribuição/MIT do snapshot e ressalva institucional continuam conforme v6.34. Nenhuma nova fonte ou licença foi presumida.

## Base conceitual e limites

Os candidatos artigo/numeral de um/uma já existiam na gramática local; a ampliação usa traços explícitos do artigo e dos nomes, sem remover alternativas. Consultadas em 30/09/2026 https://universaldependencies.org/pt/pos/DET.html e https://universaldependencies.org/pt/pos/NUM.html: ambas estão marcadas como UD v1 e servem apenas de contraste entre categorias, não como especificação atual de implementação ou regra normativa. Os apoios técnicos UD amod/nmod/case e traços registrados nas entregas anteriores permanecem. Nenhum estudo adicional de livros é alegado. Janelas, pontuação/proteção, abstenção por ordem ambígua e apoio finito restrito foram preservados.

## Avaliação antes/depois

Amostra nominal-2: 20 alvos próprios fixados antes de alterar motor/dados, dez de desenvolvimento e dez de avaliação. Desenvolvimento: 0→7 decisões úteis, sete lacunas resolvidas, três abstenções esperadas; avaliação: 0→6 úteis, seis lacunas resolvidas, quatro abstenções esperadas. Zero decisões erradas observadas nesses alvos. Na amostra nominal-1 anterior, 24→26 decisões úteis: A casa da mulher caiu. e O filho de uma mulher chegou. deixam de ser lacunas; as 14 abstenções esperadas permanecem. Gabaritos das frases não mudaram; apenas as duas exceções temporárias do teste anterior foram removidas. Avaliação própria e não cega/independente, um alvo por frase: não mede precisão geral nem todos os tokens. Relatórios antes/depois versionados em docs/jornada/avaliacoes.

## Custo, publicação e reversão

Recurso lexical 109.924→115.077 bytes (+5.153); cofre 636.317→641.871 bytes (+5.554); portátil 1.356.446 bytes. App/CSS sem mudança de conteúdo. Até 11 leituras por forma e 122 bytes por registro; teto de 256 KiB para o recorte preservado. Uma consulta por token, 8.000 unidades UTF-16/1.600 tokens/100 achados; sem nova dependência ou rede no runtime. Tamanho não é medição de memória/latência em aparelhos antigos. Estado: implementado/integrado/verificado; CI/Pages por commit confirmam publicação. Reversão por commit normal das fontes/recurso e remontagem, sem mudar textos ou formatos. Sem force push.

## Verificações e publicação

Passaram 20 novos alvos, 40 do lote anterior, 17 contrastes nominais, 26 PortiLexicon e 63 contextuais; clíticos separados, candidatos numerais, posições, ES5 e painel. O recurso completo passou nos oito grupos de testes (3.165 formas/5.534 leituras); 3.009 formas anteriores preservadas exatamente. Build:check reproduziu sete saídas. Regressão completa: execução única no CI do commit; resultado em Actions.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

M02: preparar o próximo conjunto de determinantes possessivos/demonstrativos (minha casa, esta casa), distinguindo categoria da fonte, função na frase e usos sem nome; fixar exemplos/abstenções antes de implementar. A família nominal básica fica delimitada, sem ampliar indefinidamente seus encaixes.

Plano v4: 11/25 DONE | entrega +0 marcos | próximo M02 | publicação: Actions por commit | limite: escopo nominal delimitado, artigo/numeral não resolvido semanticamente e avaliação própria não independente
