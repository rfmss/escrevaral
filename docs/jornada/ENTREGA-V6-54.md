<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-54.json -->
# Consolidação reproduzível da cobertura contextual

v6.54: cobertura de M02 consolidada por família e classe, com alvos, hashes, abstenções, observações e lacunas preservados. Escopo de locuções registrado; recorte adjetival permanece como próximo requisito de fechamento.

Base: `23cc5374f5c91fab7a2c443d2d512c84f0a42ebf`. Coordenação solo; data 06/10/2026.

## Consolidação e método

ferramentas/consolidar-m02.cjs coleta os gabaritos existentes, sem reescrever expectativas.35 arquivos: contexto-1,nominal-1 a7,negação,numerais,interjeições,quatro famílias de locuções e como/se/que.589 registros de alvo, não frases únicas:258 úteis,zero erradas nos controles respectivos,323 abstenções,duas lacunas e seis observações. Controles booleanos avaliam somente regra/família indicada; decisões alheias ao alvo não contam como acerto ou erro desse controle. Classes sem negativos atribuídos mantêm controles separados; determinante UD não vira11ª classe. JSON conserva hashes,textos,alvos,esperado/obtido,regra e resultado. Markdown é gerado do mesmo objeto. Sondas20 separadas,12 desejadas/8 abertas/zero diferentes; não somar taxas.

## Lacunas e escopo

nominal-7 AVA04/AVA06 revista/revistas permanecem metas não atendidas; alternativas nominais/adjetivais não dão base para desempatar. Seis possessivos sem nome são observações abertas, não decisões úteis. ESCOPO-LOCUCOES-M02.md registra inventário/construções/classes/exclusões das quatro famílias ativas; propõe estudo de de madeira/de papel como próximo recorte adjetival, sem alegar corpus ou referência nova. Demais grupos pronominais/interjetivos/nominais têm inventário ativo vazio e reavaliação emM03/M06; não recebem classificação genérica. M02 não fecha por apenas documentar lacunas.

## Verificação e custo

Teste dirigido verifica as categorias de resultado, reconciliação entre totais/famílias/classes, preservação das duas lacunas, observações, quatro famílias de locução e reprodução exata dos relatórios. O primeiro ensaio da ferramenta usou identificador modal em vez de verbal; corrigido antes da publicação e coberto por verificação explícita das quatro famílias. Código exclusivamente de desenvolvimento em Node, fora do bundle; nenhuma dependência nova. Motor/dados/app/CSS iguais; cofre689343 bytes inalterado, portátil1404331→1404340 (+9 por identificador da distribuição). A versão/cache da distribuição foi atualizada pelo fluxo habitual, sem migração de textos. Bytes não medem RAM/latência.

## Plano e publicação

M02-consolidacao-1 concluída; marco M02 continua TODO e plano11/25 DONE. Próximo recorte adjetival com fonte real e amostra anterior ao motor; só então rever critérios de encerramento. Avaliação reservada continuaQ02. Documentação e ferramenta verificadas; CI/Pages conferidos por SHA. Reversão por commit normal/build, sem alterar manuscritos.

## Verificações e publicação

Consolidado executado no runtime publicado:35 gabaritos/589 alvos; contagens por família/classe conciliadas;20 sondas12 desejadas/8 abertas/zero diferentes separadas. Teste do classificador de resultados, ausência de observação, tipos de locução, duas lacunas e reprodução JSON/Markdown passou. Build:check e diff limpo; regressão completa CI e Pages por commit.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

M02-locucoes-adjetivas-1: conferir referência e dados reais para de madeira/de papel após artigo + nome de objeto; fixar pares e exclusões antes do motor. Não converter automaticamente CTX-007 em locução adjetiva. Depois conferir COBERTURA-M02 e concluir M02 somente com evidências.

Plano v4: 11/25 DONE | entrega +0 marcos | próximo M02 | publicação: Actions por commit | limite: Corpus próprio com repetições, sem avaliação independente ou acurácia geral; casos técnicos inline não são contados. Locução adjetiva ainda não implementada; M02 continua TODO.
