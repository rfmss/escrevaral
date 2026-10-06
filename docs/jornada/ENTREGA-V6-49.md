<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-49.json -->
# Locução prepositiva com complemento preservado

v6.49: perto de + candidato nominal em unidade completa recebe hipótese de locução prepositiva. Grupo, palavras e complemento separados; distância, sentido e vínculo sintático abertos.

Base: `3b553be0399af29a83bbad0fc0b8224da895cb92`. Coordenação solo; data 06/10/2026.

## Referências e regra

Priberam, verbete perto (https://dicionario.priberam.org/perto), e UD v2 case em português (https://universaldependencies.org/pt/dep/case.html), consultados em 06/10/2026. Verbete mostra múltiplos usos de perto de; referência case é anotação, não algoritmo ou prova de dependência. PTBR-CTX-019 exige perto/ADV, de/ADP e candidato NOUN reais, contiguidade e unidade completa de três tokens. Classifica o grupo perto de como hipótese de locução prepositiva; não atribui sentido espacial/figurado/aproximativo, distância ou vínculo sintático. Não converte cada palavra em preposição nem o nome em substantivo contextual por propagação.

## Contrato e exclusões

Dois componentes e um complemento separados. Perto conserva NOUN/ADJ/ADV; nomes como canto/livro/casas preservam homógrafos verbais. Complemento identificado por snippet/leituras e contextIndex 2, que remete ao terceiro apoio; não cria offset aninhado que escaparia ao remapeamento de seleção. Grupo ocupa só perto de, mantendo o nome fora de seu intervalo. NUM/ADV/ADP/CCONJ/SCONJ no complemento exigem abstenção neste recorte; demais alternativas não provam unicidade nominal. Contrações do/da, modificadores, complemento infinitivo, continuações, unidades incompletas, pontuação interna/linha e proteções/citações não recebem esta regra. Essas exclusões não são juízos de erro de escrita.

## Dados e evidência

ADV/NOUN/ADJ de perto, ADP de de e nomes já estavam no PortiLexicon recorte 10 da main. Nenhuma importação/dependência ou mudança de recursos nesta entrega. Locucoes-prepositivas-1 fixado antes da regra: dezesseis alvos por conjunto, seis metas/dez exclusões. Base zero úteis/seis lacunas/dez abstenções; depois seis úteis/zero erradas ou lacunas/dez abstenções por conjunto. Amostra própria, sem cegamento/independência; não é avaliação reservada. Perturbações retiram cada apoio e injetam cinco classes excludentes no complemento; todas exigiram abstenção. Ordem mista prepositiva/verbal/adverbial/prepositiva, seleção e painel passaram. As 32 metas e controles de cada grupo verbal/adverbial anterior passaram.

## Apresentação e custo

Cartão prepositivo reutiliza a apresentação de grupo da v6.47; complemento continua separado e ambíguo quando registrado. Reconstrução do original não repete componentes; painel executa só Classes por escolha. Uma consulta lexical por token e janela de três palavras no percurso de grupos existente, sem varredura de outras lentes. Cofre 677.631→680.096 (+2.465); portátil 1.392.621→1.395.092 (+2.471); app/CSS/dados sem alteração de conteúdo. Tetos 8.000 unidades UTF-16/1.600 tokens/100 achados mantidos. Bytes/operações não são medição de RAM/latência ou certificação de aparelhos.

## Estados, plano e reversão

Referências lidas, dados disponíveis conferidos, regra integrada, testes dirigidos e distribuição concluídos. CI/Pages do commit confirmam publicação, sem segundo commit documental. Plano mantém 11/25 DONE; locuções conjuntivas, que/se/como, consolidação por classe e avaliação reservada continuam abertas. Reversão por commit normal e build, sem migração de manuscritos. Próximo assim que apoiado por dois pares pronominais/verbais; não deduzir subordinação só por que nem executar outras lentes em fila.

## Verificações e publicação

Passaram 32 alvos de locução prepositiva, retirada de ADV/ADP/NOUN reais e cinco alternativas excludentes, candidatos/componentes/complemento, ordem mista dos três tipos, seleção/emoji/NFD, autoria, proteção/truncamento, uma consulta por token, tetos/100 achados/ES5 e painel sem repetição. Passaram 32 alvos verbais e 32 adverbiais e seus controles. Recursos lexicais inalterados; build:check sete saídas. Regressão completa no CI e Pages por SHA.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

M02-locucoes-conjuntivas-1: delimitar assim que entre dois pares pronome pessoal + forma finita compatível em unidade completa; referências, dados ADV/SCONJ reais e contrastes antes do código. Grupo separado dos componentes, sem executar Sintaxe/Relativas nem deduzir subordinação pela presença de que. Depois contrastes que/se/como e consolidação por classe.

Plano v4: 11/25 DONE | entrega +0 marcos | próximo M02 | publicação: Actions por commit | limite: perto de + NOUN real em unidade completa de três tokens; NUM/ADV/ADP/conjunção no complemento excluídos; sem distância, sentido ou vínculo sintático
