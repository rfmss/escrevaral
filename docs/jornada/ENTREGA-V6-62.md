<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-62.json -->
# Proteções através de linhas anteriores longas

v6.62 / A03-linhas-longas: a conferência explícita atravessa parágrafos anteriores extensos e marcadores partidos entre passos, sem armazenar a linha inteira. Mantém progresso, cancelamento, contexto original e todos os limites da preparação.

Base: `620d0134be55eb18f64fbfb927dbc9f992edcb65`. Coordenação solo; data 09/10/2026.

## O que fica disponível

Uma ocorrência reservada depois de um parágrafo anterior extenso deixa de ser bloqueada apenas porque essa linha anterior ultrapassa2.000 unidades. O mesmo comando Examinar este contexto verifica o prefixo em passos, pode ser cancelado e então chama somente a lente escolhida no contexto original. Citações/código abertos continuam bloqueando a leitura contextual; não se classificam palavras citadas como prosa fora de proteção.

## Implementação e custo

createBoundaryScan em src/editor/contrato-analise.js mantém índices, modo e marcador de fechamento. Não concatena fatias nem retém um parágrafo, buffer crescente, árvore ou cache de prefixos. Cada passo limita-se a2.000 visitas, incluindo transições e marcadores consumidos, e reconhece inícios com leitura antecipada de até8 unidades. Apenas candidatos iniciados por h/w fazem a leitura de prefixo de URL; fechamento só consulta sequência quando encontra o primeiro caractere esperado. A posição anunciada é monotônica, mesmo quando uma tentativa precisa voltar. Permanecem o teto200mil do exame e a análise da linha alvo dentro da janela2000. A preparação automática mantém700ms/2000/400/24; nenhuma varredura anterior é feita durante as pausas.

## Precedência e marcadores partidos

O cursor reproduz a precedência do padrão de proteção existente: cercas e inline, URLs, email e aspas. URL vence email no mesmo início; email iniciado antes vence URL embutida em sua parte local/domínio. Um candidato a email conserva apenas a posição da primeira URL possível caso a leitura de email falhe. Aspas retas ou código inline sem fechamento antes de LF não podem esconder uma aspa curva interna: o cursor retoma após o abridor inválido e reexamina aquele interior sob o mesmo orçamento. Marcadores e esquemas podem atravessar passos. O padrão integral do cofre não mudou; a matriz técnica compara o novo cursor à proteção integral, incluindo esses contrastes. Não há parser sintático novo nem decisão linguística por aspas.

## Integridade e continuidade

O painel já confere pedido, folha, registro, revisão, snapshot e geração a cada passo; este lote reutiliza essas guardas. Edição, IME, voltar, cancelar, ocultar e trocar folha descartam o estado. A seleção permanece no original. A linha alvo continua precisando de fronteiras completas na reserva; permitir atravessar linhas anteriores extensas não autoriza cortar a linha examinada. Fronteiras somente CR continuam explicitamente não cobertas na prova distante. Teto100 de saída ainda pode deixar o alvo sem leitura, com aviso; será a próxima entrega.

## Estados e publicação

Implementação e montagem feitas; os casos foram incorporados ao CI, sem antecipar seu resultado nesta ficha. A base v6.61 está publicada e confirmada. Publicação desta entrega pela conexão GitHub, pois o Git local não possui credencial de push; árvore de objetos deve coincidir com a local e main só avança com a HEAD esperada, sem force. Nenhum novo pacote, dependência, migração ou alteração de cadernos, exportação, navegação ou layout. Reverter o commit restaura o limite anterior sem converter dados. Auditoria ampla fica para Q01/Q02 e o final conforme a direção do autor.

## Verificações e publicação

Diff revisado e montagem reproduzível com npm run build:check. Sem nova bateria local, conforme decisão do autor de08/10; cobertura acrescentada ao teste existente para execução no CI automático. São48 prefixos comparados à proteção integral existente (contrato técnico, não avaliação linguística), incluindo marcadores ao redor das posições1992–2002, URLs/email, inline sem fechamento e proteção de9mil unidades; inclui percurso real após linha longa, limites de visitas/progresso e cancelamento no meio da linha. CI/Pages desta entrega devem ser conferidos por SHA. Base v6.61 confirmada: CI37861003430 e Pages37861003475, ambos success no commit620d0134be55eb18f64fbfb927dbc9f992edcb65.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

A03-alvo: preservar o exame da ocorrência escolhida quando ela fica além dos100 resultados iniciais da lente, sem aumentar o teto de apresentação, cortar contexto silenciosamente ou substituir por outra ocorrência. Manter limites, candidatos, apoios e offsets originais.

Plano v4: 12/25 DONE | entrega +0 marcos (nenhum) | próximo A03 | publicação: Actions por commit | limite: A03 permanece TODO, plano v4 12/25. Linha alvo ainda deve caber na reserva; prova distante exige início após LF/CRLF. Mantidos limite200mil e teto100 da lente. Não houve medição de RAM/latência nem avaliação ampla de linguística ou experiência.
