<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-51.json -->
# Como interrogativo com contraste e abstenção

v6.51: como em pergunta direta de três palavras recebe hipótese de advérbio com fonte real e indicativo compatível. Matriz que/se/como pré-fixada; alternativas lexicais preservadas.

Base: `cb50d7ab11156ddcacf5b8e9289bc1e53edc52bb`. Coordenação solo; data 06/10/2026.

## Matriz e referências

CONTRASTES-M02.md fixado antes do código: como verbal/interrogativo/comparativo/indireto/exclamativo, se pronominal/conjuntivo, que integrante/relativo/interrogativo/exclamativo e na locução. Priberam como, UD v2 PronType, Reflex, advmod/mark em português consultados em 06/10/2026; referências de uso/anotação, não parser. PortiLexicon recorte 11 mantido integralmente, sem importação nova.

## Regra e limites

PTBR-CTX-021 exige ADV real de como, pronome pessoal explícito, forma real VERB/AUX indicativa com Person/Number/VerbForm e compatibilidade, contiguidade e ? explícito após terceiro token. Seleciona advérbio, confiança moderada; somente como recebe nova decisão. ADV não contém PronType=Int; sourcePronTypeMarked false, intentionResolved/syntaxResolved false. Não resolve exclamações, comparação, pergunta indireta, sujeito omitido, condicionais/subjuntivos, continuação ou pontuação interna. Homógrafos comer e ADP/CCONJ/SCONJ conservados; não chama Sintaxe/Relativas.

## Evidências e conservação

Corpus próprio anterior ao código: dois conjuntos de dezesseis, seis metas/dez exclusões cada; baseline zero úteis/seis lacunas/dez abstenções por conjunto; depois seis úteis/zero erradas ou lacunas/dez abstenções por conjunto. Gabaritos intactos, sem cegamento/independência. Remover ADV/VERB ou Mood/Person/Number/VerbForm impede decisão. Como verbal e assim que preservados; demais exemplos de se/que ficam sem nova regra. Seleção com emoji/NFD mantém todos offsets UTF-16 exatos e manuscrito imutável. Testes de limite 8000/1600 e 100 achados; uma consulta por token; ES5 e painel apenas Classes passaram. Conjuntivas e negação/regressão antigas dirigidas passaram. Sondas mantêm doze desejadas/oito abertas; revista/revistas nominal-7 continuam metas abertas.

## Custo, plano e continuidade

Sem mudança de dados, app ou CSS. Cofre 683128→685005 bytes (+1877); portátil 1398123→1400000 (+1877); janela de três tokens sem consulta adicional. Não mede RAM/latência ou certificação de aparelhos. M02 geral TODO, plano 11/25 DONE: se/que ainda necessitam regras apoiadas; relatório por classe/família e decisão de locuções adjetivas/demais grupos antes do fechamento. Q02 mantém avaliação reservada. Referências/regra/testes/distribuição registrados; CI/Pages do commit conferidos ao publicar. Reversão por commit normal/build, sem migração de textos.

## Verificações e publicação

32 alvos pré-fixados passaram; seis perturbações de fonte/traços, candidatos preservados, como verbal e assim que antigos, seleção/emoji/NFD, autoria, truncamentos de caracteres/tokens, uma consulta por token, cap/ES5 e painel explícito. Conjuntiva 32 alvos e negação 32/63 regressões passaram. Vinte sondas mantêm doze desejadas/oito abertas/zero diferentes. Build:check; regressão completa CI e Pages por SHA.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

M02-contrastes-2: importar se preservando PRON/SCONJ e traços reais; delimitar pronome junto a sujeito de terceira pessoa e indicativo compatível, sem resolver reflexividade/passiva/reciprocidade. Depois que integrante com apoio de saber/dizer, relatório por classe/família e escopo de locuções adjetivas/demais grupos antes de fechar M02.

Plano v4: 11/25 DONE | entrega +0 marcos | próximo M02 | publicação: Actions por commit | limite: Somente como + pronome + indicativo real compatível e ? em unidade direta de três tokens. Sem traço interrogativo lexical inventado, intenção ou sintaxe geral.
