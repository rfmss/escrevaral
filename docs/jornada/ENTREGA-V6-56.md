<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-56.json -->
# Análise organizada pela tarefa de quem escreve

v6.56: painel organizado por tarefas, consulta de palavras separada e uma tela de resultado com retorno explícito à escrita. Prioridade U01/U02 pelo retorno do autor; preparação automática A03 continua pendente.

Base: `4df6da68f9baf7cac98e5bcbccaeac8003a83f1c`. Coordenação solo; data 06/10/2026.

## Problema observado e inventário

As capturas do autor mostram uma parede de 16 lentes, consulta lexical misturada, fontes extensas antes das ações e duas interfaces de análise abertas juntas. Este lote trata esses quatro problemas. Retira os contadores técnicos da apresentação. Pendências de produto: controle Escrevaral final; preparação incremental limitada e reserva de ocorrências (A03); distinção entre ausência de sinal e falta de cobertura; revisão dos demais menus/oficina (U02). A prioridade muda pelo retorno do autor, preservando o histórico M02 e sem contar uma mudança de interface como motor novo.

## Fluxo entregue

Examinar abre cinco tarefas: Revisar a escrita, Entender uma frase, Observar o estilo, Ler como poesia e Consultar uma palavra. As quatro primeiras mostram apenas seu grupo de análises; escolher um aspecto executa somente esse motor. Resultado recolhe as opções e oferece Escolher outra análise, Examinar novamente e Voltar à escrita. Fontes/limites continuam acessíveis por botão expansível; trechos e explicações continuam ligados ao original. Voltar cancela trabalho pendente. O painel antigo só aparece se a inicialização do novo falhar; não existe botão para duplicá-lo. A consulta de uma palavra tem tela própria e preserva atribuições, alternativas e limitações.

## Critérios e estados

Abrir e navegar não analisam. Folha vazia/desmedida tem orientação e botões de análise desabilitados; consulta lexical permanece possível. Digitação, IME, troca de folha, fechamento e retorno invalidam trabalhos antigos. Uma análise explicita alcance e ausência de resultados sem certificar o texto. O autor continua dono do manuscrito; nenhum botão reescreve ou apaga. Sem dependência nova de produção, dados/cofre inalterados. Publicação e implementação continuam estados separados.

## Verificações e publicação

Testes dirigidos de painel, léxico, flexões e apresentação: navegação sem motor, cancelamento ao voltar/trocar/editar, IME, autoria e consulta independente. Build reproduzível e sintaxe ES5. CI e Pages a conferir por SHA. Chromium real: tarefas, análise, seleção exata e manuscrito intacto, consulta, fontes expansíveis, painel sem duplicação; largura 390 sem overflow, leitura com largura útil no desktop e zero erros de página. Capturas inspecionadas revelaram colunas estreitas; corrigidas para leitura e explicação empilhadas.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

Concluir o inventário da experiência U01/U02 e delimitar a primeira preparação A03: estados sem sinal/sem cobertura/não verificado, reserva de ocorrências por revisão e apresentação somente a pedido. Não retomar expansão de regras M03 antes desse fluxo de produto.

Plano v4: 12/25 DONE | entrega +0 marcos (nenhum) | próximo U01 | publicação: Actions por commit | limite: Reorganização do painel; não implementa preparação nas pausas, filtro por ocorrências presentes ou cobertura linguística geral.
