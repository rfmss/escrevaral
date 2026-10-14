<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-64.json -->
# Continuidade na main e filtro de pertinência

v6.64 / A03-pertinencia: filtro explícito das análises com indícios já preparados, com acesso a Todas as análises e distinção entre ausência de indício e pertinência não verificada. Retomada da main; reconstrução convertida em adendo de engenharia.

Base: `53c4afe5090f3bcdc3a5fac9bd920c4783a2acae`. Coordenação solo; data 14/10/2026.

## Decisão do autor e diário de bordo

Rafa rejeitou a prévia da reconstrução e determinou continuar a main e o plano do Escrevaral publicado. docs/ADENDO-EVOLUCAO-2026-10-14.md transforma a proposta em critérios de evolução incremental: composição declarativa, fronteiras claras, manuscrito protegido, compatibilidade e diário rastreável. A proposta integral foi preservada em docs/referencias/PROPOSTA-RECONSTRUCAO-2026-10-13.md como histórica; marcos R00–R08 deixam de ser a fila ativa. AGENTS e Plano Mestre registram a direção. vaultOUT26 e reconstrucao permanecem referências. Não houve merge da reconstrução nem migração de dados.

## Capacidade entregue

Em Examinar, escolher uma tarefa e usar Mostrar análises desta tarefa. Todas as análises é o padrão; Com indícios neste recorte restringe a lista aos sinais preparados. Contagens de indícios, ausência no recorte e pertinência não verificada permanecem visíveis, inclusive quando a lista fica vazia. Retornar a Todas as análises restaura acesso manual. A opção é transitória e reinicia ao reabrir o painel. Alterar filtro não inicia preparação ou lente; escolher uma lente mantém o exame explícito existente.

## Responsabilidades e custo

ptbr/pertinencia.js recebe catálogo/estados e devolve IDs visíveis e contagens, sem DOM, texto, rede, armazenamento ou motor. ptbr/painel.js apresenta o seletor nativo e reaproveita os estados de ptbr/preparacao.js. build/modules.json inclui o módulo antes do painel nas montagens de site e portátil. O trabalho do filtro percorre apenas os IDs da tarefa (até5) e os16 botões, sem percorrer o manuscrito. Nenhuma dependência adicionada; controlador, cofre, CSS e armazenamento não foram alterados.

## Integridade, limites e experiência

Edição, IME, página oculta e reset invalidam os sinais pelo mesmo paintPreparation(null) já usado pelo painel. Fora do início, falta de contexto continua não verificada; palavras reconhecidas no léxico podem oferecer indício morfológico, nunca prova sintática. O filtro não acrescenta cobertura nem transforma ausência em diagnóstico. Rótulo associado ao select, aria-controls e resumo de estado permitem operação por teclado sem controle customizado. Visual e fluxos existentes foram preservados com a adição desse seletor. Sem alegação de homologação visual ou em aparelhos.

## Publicação e reversão

Incremento autorizado na main; distribuições geradas pelas fontes, assets antigos preservados e atualização remota condicionada à HEAD esperada, sem force. O diário segue nas fichas existentes, sem criar uma segunda fila. Reverter o commit restaura a interface anterior sem converter textos ou preferências. CI e Pages são conferidos por SHA após a atualização; implementação não é prova de publicação.

## Verificações e publicação

Diff revisado; node tests/pertinencia.cjs e node ptbr/teste-painel.js aprovados. npm run build e npm run build:check aprovados. Casos dirigidos: três estados, restauração manual, janela distante, invalidação em edição/IME/página oculta, manuscrito intacto e nenhum motor ou timer acionado pelo filtro; sintaxe ES5 do módulo verificada. Regressão completa preservada no CI, sem bateria ampla local. Base v6.63: CI38413159130 e Pages38413158668 success no SHA53c4afe5090f3bcdc3a5fac9bd920c4783a2acae. CI/Pages desta entrega devem ser conferidos pelo SHA.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

A03-regioes: delimitar o primeiro recorte de preparação de sinais fora do início da folha, reutilizando a prova cancelável de proteções anteriores. Fixar casos de citação/código abertos, revisão e troca de folha antes de ativar sinais; manter não verificado quando a prova não couber nos limites existentes.

Plano v4: 12/25 DONE | entrega +0 marcos (nenhum) | próximo A03 | publicação: Actions por commit | limite: Plano v4 12/25 DONE, A03 parcial. Sem ampliação de regras, orçamento ou avaliação linguística; Q01/Q02 permanecem. Sinais de frase fora do início não verificados. Decomposição do controlador e da cascata continua gradual.
