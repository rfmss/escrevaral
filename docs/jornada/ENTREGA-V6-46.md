<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-46.json -->
# Interjeições lexicais isoladas com fronteira explícita

v6.46: ah/oh isolados recebem hipótese contextual de interjeição, com candidato INTJ real e fronteira !/?. Trecho e pontuação preservados como apoios; emoção e intenção permanecem abertas.

Base: `4beb300eed4faa3ac658f096ba237d48139ae777`. Coordenação solo; data 06/10/2026.

## Fonte, leitura e decisão

Universal Dependencies v2 INTJ (https://universaldependencies.org/u/pos/INTJ.html), consultado em 06/10/2026. A referência distingue classe lexical de mero uso exclamativo; não oferece algoritmo para este motor. Nenhuma leitura nova de livro alegada. PTBR-CTX-016 exige forma ah/oh, leitura INTJ externa, início de unidade e ! ou ? contíguo após espaços/tab/NBSP opcionais. A fronteira apoia a hipótese de interjeição isolada; não atribui emoção, intensidade, intenção, ironia ou função discursiva. Confiança moderada, emotionResolved/intentionResolved false, candidatos preservados.

## Recorte e exclusões

Início da seleção/texto ou após .!?;:, com uma única palavra antes de !/?. Maiúsculas são normalizadas só para consulta; original preservado. Ah sem pontuação, Ah., Ah, entendi, Oh querida, O ah!, Meu ah!, citações/código/links e linha antes da fronteira ficam sem a nova regra. Casa! ou Três! não viram interjeição por pontuação nem por leitura injetada em teste. Não cobre outras interjeições, locuções interjetivas ou expressões continuadas. Trecho literal da palavra e primeiro sinal !/? são dois apoios exatos no original; nenhuma alteração de manuscrito ou outra lente.

## Fonte de dados e conservação

Importador Python existente executado no snapshot PortiLexicon-UD 315e063da1f89c89e2097c6e72428ebefb9ab1d1, com os 12 hashes conferidos. Duas sementes ah/oh adicionam duas formas e duas leituras INTJ/_, sem traços emocionais inventados. Recorte 9: 223 sementes, 3.212 formas, 5.662 leituras, 509 lemas incluindo homógrafos; máximo 11 leituras/forma e 128 bytes/registro. Comparação decodificada conserva as 3.210 formas/5.660 leituras anteriores. Licença/atribuição mantidas; OWN-PT inalterado.

## Amostras e cobertura

Interjeicoes-1: dois conjuntos de dezesseis alvos fixados antes da importação/regra; seis metas positivas e dez abstenções por conjunto. Base: zero úteis, seis lacunas e dez abstenções por conjunto. Depois: seis úteis, zero erradas/lacunas e dez abstenções por conjunto. Corpus próprio sem cegamento/avaliação independente. O controle de truncamento foi corrigido para de fato exceder 1.600 tokens; exatamente 1.600 com pontuação disponível não é corte. Nenhum gabarito dos 32 alvos alterado. Vinte sondas: dez→doze seleções desejadas, dez→oito abertas; somente as duas de interjeição mudaram. Ter algum padrão nas dez classes não prova completude ou acurácia geral. Locuções, que/se/como, avaliação por classe e lacunas anteriores continuam na matriz; M02 TODO.

## Guarda de traço do numeral

A revisão de dados ausentes ampliou o teste dirigido de CTX-015: remover Gender do NUM de duas agora também exige abstenção. Dois/duas dependem desse traço explícito; só três admite ausência, conforme fonte real. Guarda acrescentada sem alterar os 32 gabaritos ou a leitura de três. Os dados publicados já traziam os traços completos, portanto não foi observada decisão errada nos casos reais; o ajuste conserva o contrato diante de recurso incompleto.

## Custo e estados

Dados 123.093→123.153 bytes (+60). Cofre 669.726→671.802 (+2.076); portátil 1.384.302→1.386.382 (+2.080). App/CSS inalterados em conteúdo. Uma consulta lexical por token e verificação de fronteira de um token; limites 8.000 unidades UTF-16/1.600 tokens/100 achados mantidos. Sem dependência/rede/fila nova; análise explícita. Valores de bytes/operações não equivalem a RAM/latência ou certificação de aparelhos. Fonte lida, dados/regra implementados e integrados, testes dirigidos e distribuição concluídos. CI/Pages vinculados ao commit são confirmação de publicação, sem segundo commit documental. Reversão por commit normal e build, sem migração de documentos.

## Próxima capacidade

Delimitar de vez em quando como primeira locução adverbial da lente Classes, com fontes e corpus antes do código. Catálogo literal na lente Expressões não decide função contextual; não reutilizar resultado de outra lente nem atribuir classe a cada componente apenas por estar na locução. Apoios, classe resultante e exclusões precisam de contrato próprio. Locuções verbais/prepositivas/conjuntivas e contrastes que/se/como permanecem na fila finita de M02; consolidação por classe e avaliação reservada são tarefas separadas.

## Verificações e publicação

Passaram 32 alvos próprios com INTJ real e ausente, exclusões de citação/uso nominal, pontuação interna, fronteiras e apoios exatos, seleção com emoji/NFD, autoria, truncamento de caracteres/tokens, uma consulta por token, teto de 100 achados, ES5 e painel de uma lente por escolha. Numerais: 32 alvos e controles passaram, incluindo remoção do Gender do NUM de duas. Todas as 3.210 formas/5.660 leituras anteriores preservadas. Vinte sondas M02 passam de dez para doze seleções desejadas, sem classe diferente. Build:check confirma sete saídas; regressão completa no CI e Pages por SHA.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

M02-locucoes-1: antes do código, delimitar uma primeira locução adverbial (de vez em quando), referência e componentes lexicais reais, exemplos positivos/contrastes, fronteiras e classe resultante na própria lente Classes. Não confundir catálogo literal de Expressões com hipótese contextual nem executar outra lente em fila. Manter locuções verbais/prepositivas/conjuntivas e que/se/como na matriz.

Plano v4: 11/25 DONE | entrega +0 marcos | próximo M02 | publicação: Actions por commit | limite: ah/oh com INTJ real, isolados no início de unidade e com !/? explícito; sem emoção, intenção, função discursiva ou generalização a qualquer exclamação
