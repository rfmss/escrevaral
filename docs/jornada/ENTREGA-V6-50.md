<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-50.json -->
# Locução conjuntiva com dois apoios verbais reais

v6.50: assim que entre dois pares pronome/indicativo recebe hipótese de locução conjuntiva em unidade completa. Leituras reais dos componentes preservadas; que isolado e relações sintáticas/temporais permanecem abertos.

Base: `a50b8a7379180933409b21e6341661c503513039`. Coordenação solo; data 06/10/2026.

## Fontes e regra

Priberam, verbete assim, seção assim que (https://dicionario.priberam.org/assim), e UD v2 mark em português (https://universaldependencies.org/pt/dep/mark.html), consultados em 06/10/2026. Verbete registra uso entre situações/ações; referência mark distingue marcador e pronome, sem constituir parser. PTBR-CTX-020 exige assim/ADV e que/SCONJ externos, dois pronomes pessoais e dois indicativos reais com pessoa/número explícitos compatíveis, contiguidade e limites de unidade de seis tokens. Exemplo Eu saio assim que ela chega. Classe do grupo locução conjuntiva, confiança moderada; temporalRelationResolved e syntaxResolved false. Não certifica ordem temporal, ocorrência de eventos, verdade ou dependência.

## Candidatos e exclusões

Grupo ocupa assim que, com seis apoios e dois componentes, sem decidir classe de que/assim isoladamente. Que conserva oito análises da fonte, com PRON interrogativo/relativo, DET, ADV, ADP, CCONJ, SCONJ e INTJ. Que sozinho, assim como, sujeito omitido/não pronominal, subjuntivo/condicional, finito incompatível, negação/clítico, modificador/complemento/continuação, pontuação interna/linha e citação/proteção ficam fora desta regra. Não chama Sintaxe/Relativas nem deriva subordinação só por que. Registros legacy dessas lentes intactos.

## Importação e conservação

Importador existente no snapshot PortiLexicon-UD 315e063da1f89c89e2097c6e72428ebefb9ab1d1, com os 12 hashes conferidos. Assim/que adicionam duas formas/nove análises sem eliminar alternativas. Recorte 11: 229 sementes, 3.219 formas, 5.679 leituras, 516 lemas incluindo homógrafos; máximo 11 leituras/forma e 128 bytes/registro. Comparação decodificada conservou todas as 3.217 formas/5.670 leituras anteriores. Licença/atribuição mantidas e OWN-PT inalterado. Nenhuma nova leitura de livro alegada.

## Corpus e estabilização

Locucoes-conjuntivas-1 pré-fixado antes da importação/motor, dois conjuntos de dezesseis alvos (seis metas/dez exclusões). Base zero úteis/seis lacunas/dez abstenções por conjunto; depois seis úteis/zero erradas ou lacunas/dez abstenções por conjunto. Gabaritos preservados, corpus próprio sem cegamento/independência. Oito perturbações retiram ADV/SCONJ e VERB dos apoios ou invalidam Mood/Number/Person/VerbForm. Testes de grupos em ordem com quatro famílias, seleção exata e painel passaram. Três famílias antigas mantiveram 32 alvos cada; negação/63 expectativas antigas também passaram após importar que. Vinte sondas não mudaram: grupo não é classificado como duas palavras conjunção.

## Manutenção, custo e apresentação

Descrições das quatro famílias foram reunidas em objetos fixos, alocados uma vez por runtime, substituindo ternárias repetidas na emissão. Apenas textos/fontes são compartilhados; regras continuam explícitas, sem DSL/parser geral. Painel reusa cartão de locução com original intacto, candidatos e limites; não executa lentes em fila. Dados 123.335→123.526 bytes (+191); cofre 680.096→683.128 (+3.032); portátil 1.395.092→1.398.123 (+3.031); app/CSS inalterados. Uma consulta por token e janela de seis; tetos 8.000 UTF-16/1.600 tokens/100 achados mantidos. Bytes/operações não são medição de RAM/latência ou certificação de aparelhos.

## Plano, estados e reversão

Referências lidas, fonte importada, regra integrada, verificações locais/distribuição concluídas; CI/Pages por commit confirmam publicação. Plano segue 11/25 DONE; quatro recortes de locução não fecham M02. Que/se/como ainda precisam matriz própria e decisão apoiada; relatório por classe/família e escopo de locuções adjetivas/demais grupos permanecem antes da consolidação. Avaliação reservada separada em Q02. Reversão por commit normal e build, sem migração de manuscritos.

## Verificações e publicação

32 alvos conjuntivos e oito perturbações de fonte/traços passaram; fonte real obrigatória, que sozinho sem decisão, quatro grupos em ordem, proteção/truncamento, seleção/emoji/NFD, autoria, uma consulta por token, cap/ES5 e painel sem duplicação. 32 alvos de cada família verbal/prepositiva/adverbial passaram; negação 32 contrastes e 63 expectativas antigas passaram. Todas as 3.217 formas/5.670 leituras antigas preservadas. Vinte sondas permanecem doze desejadas/oito abertas/zero classes diferentes. Build:check sete saídas; regressão completa no CI e Pages por SHA.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

M02-contrastes-1: fixar matriz própria de que/se/como antes do código. Separar que integrante/relativo/interrogativo/exclamativo, se clítico/conjuntivo e como verbal/interrogativo/comparativo; conferir candidatos reais, escolher uma primeira decisão apoiada e abstenções explícitas. Não reutilizar Sintaxe/Relativas automaticamente. Consolidar depois relatório por classe/família e escopo de locuções adjetivas/demais grupos antes de fechar M02.

Plano v4: 11/25 DONE | entrega +0 marcos | próximo M02 | publicação: Actions por commit | limite: assim que entre dois pares pronome + indicativo real compatível, unidade completa de seis tokens; não decide que isolado, evento/tempo ou sintaxe geral
