<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-48.json -->
# Poder + infinitivo na lente Classes

v6.48: pronome pessoal + poder finito compatível + infinitivo impessoal real recebem hipótese de locução verbal em unidade completa. Grupo e candidatos dos componentes separados, sem decidir modalidade ou função auxiliar geral.

Base: `7b3c850af39998ff0d079588c0d65430732ab9f7`. Coordenação solo; data 06/10/2026.

## Fonte e revisão

Motor existente ptbr/grupos-verbais.js revisto: reconhece estar/ter/haver/ir em Sintaxe, sem poder modal. Não foi ampliado nem executado em fila; utiliza leituras legadas que não devem receber a ampliação de Classes automaticamente. Reusado o contrato de grupo separado da v6.47 e o mesmo caminho de apresentação. Universal Dependencies v2 aux em português (https://universaldependencies.org/pt/dep/aux_.html), AUX (https://universaldependencies.org/u/pos/AUX_.html) e Mood (https://universaldependencies.org/u/feat/Mood.html), consultados em 06/10/2026. Modal lexical VERB não define sozinho função auxiliar; referências de anotação não são parser. Nenhuma nova leitura de livro ou importação de dados alegada.

## Regra e descoberta no corpus

PTBR-CTX-018 exige início/fim de unidade completa, pronome pessoal, dois componentes contíguos, poder com leitura VERB/AUX real VerbForm=Fin, pessoa/número explícitos compatíveis e Mood=Ind/Cnd; principal VERB impessoal com registro VerbForm=Inf sem Person/Number. Eu poderia ler era meta positiva pré-fixada: PortiLexicon registra Mood=Cnd, não Ind. A primeira execução revelou a lacuna; a regra passou a aceitar Cnd explicitamente, sem reescrever a fonte, remover a meta ou ampliar externalFinite/CTX-001 para todas as lentes. Tense ausente no Cnd não foi inventado. Eu puder cantar continua excluído (Sub). A classificação do grupo é hipótese local, não identificação de permissão/capacidade/probabilidade/verdade.

## Candidatos, exclusões e apresentação

Inspect mantém os items por token e reúne grupos no mesmo percurso pela ordem original. Locução verbal ocupa pode abrir/posso ler, com três apoios exatos e dois componentes preservando todas as leituras, incluindo pode/podar, posso/possar e abrir/NOUN. A classificação de forma finita de CTX-001 fica no componente; o principal não vira contextual por propagação do grupo. Não converte registros VERB em AUX. Grupo declara modalityResolved/auxiliaryFunctionResolved/syntaxResolved false. Sem sujeito, negação/clítico, complementos/continuações, infinitivo pessoal, gerúndio/particípio, conjunção/proteção, quebra de linha ou principal poder/dever/ter/haver/ser/estar/ir fica sem esta regra. Essa lista evita cadeias neste recorte, sem julgar incorretas construções com esses lemas. Anotação reusa o cartão de locução sem duplicação do original; não dispara Sintaxe.

## Evidência e avaliação

Locucoes-verbais-classes-1 fixado antes da regra: dezesseis alvos por conjunto, seis metas/dez exclusões. Base zero úteis/seis lacunas/dez abstenções por conjunto; depois seis úteis/zero erradas ou lacunas/dez abstenções. Gabaritos conservados, amostra própria sem cegamento/independência. Sete perturbações de fonte verificam lema, pessoa, número, modo, forma finita, infinitivo impessoal e classe; controles de posição/proteção/tetos/custo/manuscrito e ordem mista passaram. Locução adverbial e negação regressões dirigidas passaram. M02 geral permanece TODO, sem transformar amostra de desenvolvimento em avaliação reservada.

## Custo e estados

Sem novos dados, dependências ou rede. Cofre 675.180→677.631 (+2.451); portátil 1.390.173→1.392.621 (+2.448); app/CSS sem alteração de conteúdo. Uma consulta por token e janela de três palavras, incorporada no percurso de grupos existente; limites 8.000 unidades UTF-16/1.600 tokens/100 achados preservados. Medidas de bytes/operações não equivalem a RAM/latência ou certificação de aparelhos. Referências lidas, regra/testes integrados e distribuição gerada; CI/Pages por commit confirmam publicação. Reversão por commit normal e remontagem, sem migração de manuscritos. Próximo perto de + nome, mantendo demais famílias e contrastes na matriz.

## Verificações e publicação

32 alvos próprios passaram, com retirada/incompatibilidade de dados reais, homógrafos, grupo/componentes, ordem mista de locuções, seleção/emoji/NFD, posições exatas, proteção, tetos/custo/cap, ES5 e painel de uma lente sem repetição do original. Locução adverbial: 32 alvos e controles passaram; negação: 32 contrastes e 63 expectativas antigas passaram. Dados lexicais inalterados; build:check sete saídas. Regressão completa uma vez no CI e Pages por SHA.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

M02-locucoes-prepositivas-1: fixar referências/gabaritos para perto de + nome em unidade nominal curta completa; candidato ADV de perto, ADP de de e NOUN real, classe do grupo separada dos componentes e do complemento. Excluir usos citados, verbo perto inexistente, fronteiras partidas e unidade incompleta; regência/sintaxe geral abertas. Depois locuções conjuntivas e que/se/como.

Plano v4: 11/25 DONE | entrega +0 marcos | próximo M02 | publicação: Actions por commit | limite: pronome pessoal + poder Mood=Ind/Cnd com pessoa/número explícitos + infinitivo impessoal VERB real, unidade completa de três palavras; não decide modalidade, função auxiliar geral ou cadeias
