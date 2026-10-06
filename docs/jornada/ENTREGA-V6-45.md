<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-45.json -->
# Numerais cardinais com nome plural delimitado

v6.45: dois/duas/três + nome plural em unidade curta completa recebem hipótese de numeral e substantivo, usando NUM cardinal e NOUN plural reais. Traços ausentes e homógrafos preservados; medidas, datas e um/uma fora do recorte.

Base: `b9f3e80c6d970c7fec00eefc29993e9116e8e3a8`. Coordenação solo; data 06/10/2026.

## Fonte e regra

UD v2 nummod em português (https://universaldependencies.org/pt/dep/nummod.html) e NumType (https://universaldependencies.org/u/feat/NumType.html), consultados em 06/10/2026. São referências de anotação, não algoritmo geral. PTBR-CTX-015 exige NUM NumType=Card externo e NOUN Number=Plur de sete lemas declarados. Dois/duas têm Gender explícito, conferido com o nome; três não tem gênero marcado, sem imputação. NUM não tem Number na fonte: a pluralidade explícita é do nome e a restrição a esses cardinais é decisão local. Dois apoios exatos, confiança moderada, quantityResolved e syntaxResolved false; alternativas preservadas, incluindo casas/casar e flores/florar/florir.

## Delimitação e abstenção

Unidade completa de duas palavras, no início da seleção/texto ou após .!?;:, terminada por fronteira explícita ou fim integral; ligação apenas por espaços/tab/NBSP. Livro/casa/jardim/flor/mesa/mulher/homem constituem lista nominal local, não classificação semântica geral. Outros nomes, medidas/datas, algarismos, um/uma, ordinal, grupos com modificador, nome singular, gênero marcado incompatível, pontuação interna, linhas/proteções e unidade incompleta ficam sem esta regra. Ausência de apoio não é erro nem sugestão de correção. Não conta objetos, determina valor quantitativo ou atribui função sintática. Manuscrito e demais lentes intactos.

## Importação e conservação

Importador existente executado sobre snapshot PortiLexicon-UD 315e063da1f89c89e2097c6e72428ebefb9ab1d1, com os 12 hashes conferidos; dois e três acrescentados às sementes, incluindo duas por flexão do lema dois. Recorte 8: 221 sementes, 3.210 formas, 5.660 leituras, 507 lemas incluindo homógrafos; máximo 11 leituras/forma e 128 bytes/registro. Comparação decodificada conserva todas as 3.207 formas/5.655 leituras antigas. Classes NOMINAIS alternativas dos numerais permanecem. Licença/atribuição mantidas; nenhuma nova leitura de livro alegada.

## Corpus e diagnóstico

Numerais-1 fixado antes da importação/regra: desenvolvimento e avaliação com dezesseis alvos cada, seis metas positivas e dez exclusões. Base: zero úteis, seis lacunas, dez abstenções por conjunto. Depois: seis úteis, zero erradas/lacunas, dez abstenções por conjunto; metas não retiradas. Corpus próprio, sem independência ou cegamento. Vinte sondas M02: oito→dez seleções desejadas, doze→dez abertas; só as duas de numeral mudaram. Não mede acurácia geral nem completude das classes. Interjeição continua sem decisão contextual; revista/revistas e demais lacunas anteriores permanecem.

## Custo, integração e publicação

Dados 122.554→123.093 bytes (+539); cofre 666.145→669.726 (+3.581); portátil 1.380.720→1.384.302 (+3.582). App/CSS sem mudança de conteúdo. Janela de dois tokens e sete lemas, no máximo as leituras já limitadas da fonte; uma consulta lexical por token. Limites 8.000 unidades UTF-16/1.600 tokens/100 achados preservados; sem nova rede, dependência, fila ou análise automática. Bytes/operações não certificam RAM/latência ou aparelhos. Referências lidas, importação/regra implementadas, verificações locais e distribuição gerada; CI/Pages por commit confirmam publicação, sem segundo commit documental. Reversão por commit normal e build, sem migração de manuscritos.

## Verificações e publicação

Passaram 32 alvos de numerais com dados reais, retirada de NUM/NumType/Number/Gender, alternativas verbais, proteção, posições UTF-16/NFD, seleção e autoria, teto de caracteres/tokens, uma consulta por token, ES5 e painel explícito. Passaram 32 contrastes de negação e 63 expectativas contextuais antigas. Todas as 3.207 formas/5.655 leituras anteriores preservadas. Vinte sondas passam de oito para dez seleções desejadas, sem classe diferente. Build:check confirma sete saídas. Regressão completa uma vez no CI; publicação por SHA de CI/Pages.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

M02-interjeicoes-1: fixar exemplos e contrastes de ah/oh isolados com fronteira explícita, importar INTJ real do snapshot e decidir somente a classe, sem inferir emoção ou intenção; citações, substantivações e usos continuados abertos. Depois, locuções e contrastes que/se/como da matriz.

Plano v4: 11/25 DONE | entrega +0 marcos | próximo M02 | publicação: Actions por commit | limite: dois/duas/três + plural de livro/casa/jardim/flor/mesa/mulher/homem; unidade completa de duas palavras; não resolve quantidade, sintaxe, medidas, datas ou um/uma
