<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-65.json -->
# Exame da folha com revisão válida e falha recuperável

v6.65 / U01-estabilidade: exame da folha confere registro/revisão, cancela o timer pendente e distingue falha do motor de conclusão. Resultado antigo não localiza trechos nem guarda escolhas em outra revisão.

Base: `90aa8cc4111ae9c5ab5eb91d453ddfec9fb5ca67`. Coordenação solo; data 14/10/2026.

## Prioridade de estabilização

Rafa autorizou seguir autonomamente para estabilizar e entregar o site. A inspeção do próximo fluxo revelou duas falhas concretas no exame geral, que foram corrigidas antes de ampliar A03-regioes. A fila principal permanece a mesma após este lote; não houve novo plano de reconstrução, alteração do armazenamento ou redesenho.

## Falhas e correções

A validade do exame geral usava texto e noteId, mas não o par registro/revisão já exposto por ptbrPanelRevision. Uma revisão diferente com o mesmo texto podia executar a lente e aceitar ações do resultado anterior. O pedido agora confere essa identidade antes e depois do motor; os botões de localizar/manter também a conferem. A dispensa salva pelo próprio botão reapresenta o resultado com a revisão nova, preservando o fluxo válido. Em falha do motor, a antiga fila chegava à mensagem de sucesso; agora erro e sucesso têm saídas distintas, com nova tentativa disponível e texto intacto.

## Simplificação do código

ptbr/painel.js perde a lista candidates, o cursor e o passo final de uma fila que sempre continha uma única lente. Um único callback registrado em debounce executa o pedido; reset, edição, IME e navegação podem removê-lo pelo cancelamento existente. Não há módulo artificial, dependência, nova API de navegador ou alteração do controlador. Antes havia dois callbacks sequenciais no caminho de execução/conclusão; agora há um. Isso é contagem do fluxo, não medição de latência ou RAM.

## Verificação dirigida e limites

tests/exame-validade.cjs reproduz a regressão e verifica pedido pendente, ações antigas, retentativa e escolha válida. O harness existente do painel mantém integração e distribuições. Não foram reexecutadas localmente suites linguísticas sem relação com o patch. O teste usa DOM simulado, não comprova experiência visual ou compatibilidade em aparelhos. A análise síncrona ainda ocupa a thread até devolver o resultado; a correção não promete interrupção durante esse cálculo. Ações de uma revisão antiga são recusadas; não foi criado observador global de armazenamento ou migração entre abas.

## Publicação, reversão e próxima passagem

Distribuições geradas pelas fontes e publicadas na main mediante HEAD esperada, sem force; gerações anteriores de assets preservadas. Sem mudanças em texto, chaves ou formatos persistidos. Reverter este commit restaura o fluxo anterior sem conversão de dados, mas reintroduz as duas falhas documentadas. Implementação, verificações locais, CI e deploy são estados separados. A próxima frente continua A03-regioes, dentro dos limites existentes e com proteção comprovada antes de emitir sinais.

## Verificações e publicação

Falhas reproduzidas na base: após mudar só a revisão, a lente ainda executava; exceção simulada do motor terminava com Análise concluída. Após o patch, node tests/exame-validade.cjs passou: nove invalidações de pedido, três mudanças de identidade em ações de resultado, falha/retentativa, dispensa que salva nova revisão, remoção efetiva do timer e manuscrito intacto. ES5 do painel conferido. node ptbr/teste-painel.js, npm run build e npm run build:check aprovados. Sem bateria ampla local; regressão completa mantida no CI. Base v6.64: CI38654247534 e Pages38654247231 success no SHA90aa8cc4111ae9c5ab5eb91d453ddfec9fb5ca67. Consultar CI/Pages desta entrega pelo SHA.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

A03-regioes: delimitar o primeiro recorte de preparação de sinais fora do início da folha, reutilizando a prova cancelável de proteções anteriores. Fixar casos de citação/código abertos, revisão e troca de folha antes de ativar sinais; manter não verificado quando a prova não couber nos limites existentes.

Plano v4: 12/25 DONE | entrega +0 marcos (nenhum) | próximo A03 | publicação: Actions por commit | limite: Plano v4 12/25 DONE. U01/A03 parciais; nenhuma ampliação de cobertura linguística ou homologação visual. Cofre continua síncrono; o cancelamento não interrompe o motor no meio da execução.
