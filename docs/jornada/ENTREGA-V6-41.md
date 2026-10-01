<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-41.json -->
# Coordenação nominal curta: dois nomes ligados por e/ou

v6.41: Casa e jardim / Casa ou apartamento recebem hipótese de coordenação nominal, com conectivo e constituintes distintos. M02-coordenacao-1 cumprida; consulta lexical ganha apartamento/apartamentos.

Base: `e96d06350c6584bc1eaee8594e5d058148a89a33`. Coordenação solo; data 01/10/2026.

## Entrega e experiência

M02-coordenacao-1 cumprida. Em Examinar → Classes de palavras, Casa e jardim e Casa ou apartamento recebem hipótese local. Cada nome é distinguido do conectivo, com os três apoios localizáveis no manuscrito. Mantém candidatos lexicais, confiança moderada, uma lente explícita por escolha e texto intacto. Não existe correção automática ou análise durante a digitação.

## Regra e fronteiras

PTBR-CTX-011 exige exatamente dois núcleos com leitura externa NOUN, ligados por e/ou e espaços contíguos; ao menos um núcleo precisa ter apenas substantivo entre as classes do inventário. Início do recorte ou após .!?;: e fim do recorte completo ou antes de .!?;: delimitam a unidade. Não sobrescreve decisões contextuais anteriores. Recorte truncado não conta como fim de unidade. Pontuação interna, linha, protegido, modificadores, artigos, palavras desconhecidas, duas formas com classes alternativas, listas maiores ou continuação verbal ficam fora. Canto e trabalho / Rio ou canto preservam ambiguidade. A seleção constitui seu próprio recorte; isso não prova independência no documento. O limite proposital perde pares inseridos em frases maiores, a ampliar por critérios separados.

## O que o resultado não infere

nominalCoordination distingue role constituinte/conectivo, connector e/ou, resolution hypothesis e syntaxResolved false. Usa os context spans já mapeados pelo contrato; nenhum novo sistema de posições. Não atribui sujeito/objeto, concordância do conjunto, vínculo de dependência, subordinação ou sentido exclusivo/inclusivo a ou. Diferenças de gênero/número entre nomes não impedem o par. Uma só classe no inventário não prova unicidade na língua.

## Fontes e dados reutilizados

UD v2 conj (https://universaldependencies.org/u/dep/conj.html) e cc (https://universaldependencies.org/u/dep/cc.html), consultados em 01/10/2026, distinguem constituintes coordenados e conectivo. São referências de anotação; o algoritmo local não é um parser UD nem deriva delas uma garantia de desambiguação. Nenhuma nova leitura de livros é alegada. PortiLexicon-UD permanece no commit 315e063da1f89c89e2097c6e72428ebefb9ab1d1, 12 hashes de entrada conferidos pelo conversor e licença MIT/atribuição preservadas. Semente apartamento gera duas formas e duas leituras novas; recorte 4 tem 216 sementes, 3.199 formas, 5.631 leituras e 498 lemas incluindo homógrafos. Dados 122.038→122.117 bytes; máximo 11 leituras por forma e 128 bytes por registro. Todas as triplas antigas foram comparadas após decodificar os índices e permaneceram iguais. OWN-PT não recebeu sentidos novos; a consulta distingue morfologia de definição.

## Amostra e verificação

Nominal-5 fixado antes da regra: 14 alvos de desenvolvimento e 14 de avaliação. Em cada conjunto, 0→6 decisões úteis, seis lacunas resolvidas, oito abstenções esperadas e zero decisões erradas observadas. Gabaritos não mudaram após a implementação. Amostra própria, não cega nem independente, sem estimativa de precisão geral. Teste dirigido inclui os três papéis no painel, homógrafo casar preservado, orações/listas rejeitadas, prioridade de regras anteriores, proteção, emoji/NFD, seleção, limites de caracteres/tokens, truncamento, uma consulta por token e ES5. Inventário, usos sem nome, determinantes e corpus contextual também passaram. Regressão completa fica no CI; sem repetição local de todas as suites.

## Custo, publicação e reversão

Cofre 655.831→658.363 bytes (+2.532); portátil 1.372.942 bytes. App/CSS sem alteração de conteúdo. Mesmos tetos de 8.000 unidades UTF-16, 1.600 tokens e 100 achados; janela de três tokens, sem rede ou dependência de runtime nova. Tamanhos não são medição de memória/latência nem certificação de aparelhos. Implementado/integrado com verificações locais; resultados CI/Pages por commit confirmam publicação em Actions. Reversão por commit normal e remontagem, sem mudar formatos de documentos ou usar force push. Próximo lote acrescenta artigos com traços explícitos, sem tornar este recorte um parser geral.

## Verificações e publicação

Passaram 28 alvos novos, papéis do par, fronteiras/proteção, homógrafos, truncamento, seleção UTF-16/NFD, limite de consultas, ES5 e painel. Também passaram 20 usos sem nome, 30 determinantes, 63 contextuais e os oito grupos PortiLexicon. Comparação das triplas decodificadas preservou todas as 3.197 formas/5.629 leituras anteriores. Build:check confere sete saídas; CI executa regressão completa e Pages publica por commit, resultados em Actions.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

M02: ampliar a coordenação nominal curta para artigo + nome em cada constituinte (a casa e o jardim; um livro ou uma revista), fixando contrastes com clíticos, homógrafos verbais e traços incompatíveis antes da regra. Preservar os pares sem artigo e não expandir para coordenação de orações.

Plano v4: 11/25 DONE | entrega +0 marcos | próximo M02 | publicação: Actions por commit | limite: pares sem modificadores entre limites explícitos; não decide função sintática, sentido de ou nem coordenação de orações
