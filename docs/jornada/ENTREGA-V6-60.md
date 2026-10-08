<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-60.json -->
# Da ocorrência reservada ao exame do seu contexto

v6.60 / A03-contexto: cada ocorrência reservada oferece exame explícito da sua linha, com possibilidades lexicais separadas da leitura contextual, apoios e seleção exata no original. Fronteiras cortadas, proteção desconhecida e teto de saída geram limites explícitos.

Base: `3207156e6dad6868e74ef8265c6f1012b978e642`. Coordenação solo; data 08/10/2026.

## Experiência completa no painel existente

Entender uma frase → Ver palavras reconhecidas → Examinar este contexto. Cabeçalho identifica a ocorrência escolhida e suas possibilidades lexicais. O contexto literal e as posições no original ficam visíveis; a leitura anotada abre diretamente nessa ocorrência, inclusive na segunda repetição. Locução que contém a palavra abre a hipótese do grupo, enquanto Ver ocorrência no texto continua selecionando somente a palavra. A evidência existente explica apoios, ambiguidades, fonte e limites. Não há botão de aplicação ou escrita no manuscrito. Voltar retorna às análises; o exame da folha continua acessível manualmente, sem confundir seu escopo com o exame da reserva.

## Fronteiras e proteção: decisão delimitada

Não se extrai uma oração pelo ponto mais próximo: ponto pode ser abreviação ou estar dentro de citação. O adaptador conserva a linha inteira entre CR/LF ou extremidades reais da folha, desde que caiba na mesma janela reservada. Uma linha visual quebrada por CSS não é um limite. Se a janela corta a linha, abstém antes da lente, inclusive quando a palavra está intacta. Aspas curvas e bloco de código podem atravessar linhas; por isso uma quebra de linha sozinha não comprova ausência de proteção herdada. Só no comando explícito confere-se protectedText do prefixo original até o fim da linha, limitado a8.000 unidades (teto já usado pela lente contextual), comparando a proteção desse recorte à da linha isolada e conferindo que a ocorrência não esteja mascarada. Se não for possível provar essas condições, explica a limitação sem consultar o começo da folha como substituto. A análise contextual recebe somente a linha pedida, de até2.000 unidades, não o prefixo usado para proteção. Não houve regra linguística nova nem mudança no cofre.

## Identidade e cancelamento

A reserva/cache incorpora registro+revisão persistida, além da folha e região existentes; o painel confere sua geração antes de qualquer ação. O pedido usa analysisContract.request/current/analyze, com documento, registro, revisão, snapshot e escopo originais. Achados e apoios são deslocados pelo adaptador existente. Edição, IME, retorno, cancelamento, desligamento, ocultação e troca de folha invalidam callbacks e seleções antigas; igualdade posterior do texto não ressuscita handlers. Resultados de qualquer lente agora conferem também a geração do painel antes de selecionar. O comando contextual é adiado em um timer cancelável, executa uma única lente síncrona e não inicia fila.

## Custo, apresentação e escolhas

Preparação não mudou de orçamento:700ms, janela2000 com um caractere sentinela,400 visitas totais,24 ocorrências e um cache. Abrir/filtrar a reserva não faz novo exame. A verificação explícita de proteção usa temporariamente até8.000 unidades; não cria índice do livro, histórico de snapshots ou cache adicional. A leitura contextual permanece nos tetos existentes e na janela reservada; o teto100 de resultados não é ampliado. Se a ocorrência ficar fora da saída, o painel declara não verificada, em vez de interpretar silêncio como ausência. Ao pedir esta ocorrência explicitamente, sua leitura pode ser vista mesmo que dispensada no exame geral; a escolha persistida não é removida. Esta consulta contextual não oferece Manter minha escolha nem grava dados. Sem novas dependências/APIs. Estes são tetos do algoritmo, não medição de memória ou latência.

## Documentação e procedência

Incorporados docs/MANUAL-LINGUISTICA-COMPUTACIONAL-ESCREVARAL.md v1.1 e docs/REVISAO-CLAUDE-ESCREVARAL-2026-10-08.md a partir dos anexos integrais do documento de retomada fornecido pelo autor, com SHA256 e aviso de transcrição. Links no plano existente. O protótipo e suas sondas não foram executados novamente; as alegações da revisão são histórico. O visual didático citado permanece no artefato original. Nenhum motor, tabela lexical ou interface do Claude foi importado. M02 permanece no recorte já declarado; Q01/Q02 continuam separados.

## Estados, limites e reversão

Especificado, implementado, testado e integrado neste lote. Publicação só se comprova pelos jobs do commit, não por esta ficha. A03 não foi encerrada. Próximo passo trata proteção em regiões distantes; não recomeça painel, reserva ou filtros. Reversão possível por revert do commit desta entrega, sem alteração de formatos de cadernos, persistência ou exportação. Distribuições geradas pela montagem oficial; sem edição manual.

## Verificações e publicação

Passaram node tests/preparacao-contexto.cjs, node tests/preparacao.cjs, node tests/preparacao-reserva.cjs, node ptbr/teste-painel.js e npm run build:check. O novo teste usa cofre/lente/contrato reais e DOM simulado: ocorrência após 5.000 unidades, duas leituras de canto, apoios rebased, UTF-16/NFD/emoji, proteções iniciadas antes da janela, cortes da linha, ambiguidade, teto100 e invalidação em edição, IME, voltar, cancelar, ocultar, desligar, trocar folha e mudar revisão. Acorn ES5 nos cinco módulos de produção alterados. Regressão integral fica para o CI; sucesso de CI/Pages deve ser conferido no SHA correspondente.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

A03-fronteiras: permitir contexto protegido em regiões além das primeiras 8.000 unidades por estado de proteção limitado e invalidável, sem varrer o livro por pausa nem elevar tetos; manter abstenção até haver fronteira comprovada. Reusar o percurso A03-contexto já entregue.

Plano v4: 12/25 DONE | entrega +0 marcos (nenhum) | próximo A03 | publicação: Actions por commit | limite: A03 permanece TODO, plano v4 12/25. Exame desta entrada exige linha completa na reserva e prefixo de proteção até8.000; regiões posteriores permanecem não verificadas. Teto100 da lente pode excluir a ocorrência e é informado. Sem medição de RAM/latência ou avaliação linguística independente.
