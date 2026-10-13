<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-63.json -->
# Leitura da ocorrência além dos primeiros100 resultados

v6.63 / A03-alvo: Examinar este contexto preserva a ocorrência escolhida mesmo depois dos100 resultados iniciais. Apresenta o alvo, sua eventual locução e apoios diretos, com o mesmo contexto, candidatos e teto de saída.

Base: `ff63d24523e1996b4e03fd9e4af51e0fc79e0007`. Coordenação solo; data 13/10/2026.

## Capacidade entregue

Na reserva lexical, Examinar este contexto destaca a ocorrência escolhida mesmo quando a leitura comum da linha a deixaria além dos100 resultados iniciais. O cartão mantém possibilidades no léxico e localização literal; o mapa abre a ocorrência ou a locução que a contém. O comando só executa morfologia uma vez. Abrir/filtrar a reserva continua sem exame completo.

## Decisão de arquitetura e custo

Um argumento opcional de alvo atravessa painel, contrato do editor, registro do cofre e morfologia. inspect recebe a mesma string e preserva regras, candidatos e fronteiras. Uma seleção limitada de índices reserva a ocorrência primeiro, depois a locução e os apoios diretos, sem construir a lista integral de Findings para então descartá-la. A inspeção mantém8mil unidades/1600 tokens; no painel a linha já cabe na reserva2000. Saída máxima100, mapa temporário máximo100 entradas, sem novo cache, dependência ou rede. Sem argumento, o exame geral permanece inalterado. ES5 no caminho de produção.

## Integridade e abstenção

O cofre valida início/fim inteiros, limites e trecho literal; lente sem suporte explícito rejeita o alvo. Fragmento de palavra, proteção ou alvo além do escopo não abre outra palavra como substituto. found só atesta token exato inspecionado, não decisão de classe; ambiguidades e desconhecidos permanecem. Metadados e apoios voltam às posições originais pelo adaptador. Guardas existentes de folha, registro, revisão, snapshot, geração, edição, IME, página oculta, voltar e cancelamento permanecem. A preparação lexical e a prova de proteções anteriores não mudaram.

## Evidência e estados

Os casos novos comparam achados selecionados aos mesmos achados da linha integral, inclusive fonte, candidatos, leitura e apoios; essa comparação verifica transporte/seleção, não acurácia linguística. Cobertura existente de Unicode, manuscrito intacto e cancelamento permanece no CI. Implementação e montagem são distintas da publicação: confirmar Actions por SHA. Nenhuma nova obra ou fonte linguística consultada; não houve mudança de inventários nem regras. A03-alvo encerra este sublote; o marco A03 segue parcial pelo filtro de pertinência e demais limites publicados.

## Publicação e reversão

Publicação autorizada na main pela conexão GitHub, com árvore idêntica à local e atualização condicionada à HEAD esperada, sem force. Distribuições geradas pelas fontes; assets anteriores preservados. Reverter o commit remove o argumento opcional e restaura a apresentação anterior sem converter dados do autor. A auditoria ampla permanece no final, conforme orientação vigente.

## Verificações e publicação

Diff revisado; montagem e integridade verificadas com npm run build e npm run build:check. Sem bateria local repetida. Casos acrescentados ao CI: ocorrência após100 achados, homógrafos repetidos, locuções por ambos os componentes, ambiguidades/desconhecidos, igualdade dos achados com a inspeção contextual original, alvo protegido/parcial/fora do escopo, argumentos inválidos, rebasing e ES5. CI/Pages desta entrega devem ser conferidos pelo SHA. Base v6.62 confirmada: CI37996303854 e Pages37996303237 success no commitff63d24523e1996b4e03fd9e4af51e0fc79e0007.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

A03-pertinencia: oferecer filtro explícito das análises com indícios no recorte preparado, distinguindo nenhum indício de pertinência não verificada e preservando Todas as análises. Sem nova varredura, sem fila de lentes e sem esconder falta de cobertura.

Plano v4: 12/25 DONE | entrega +0 marcos (nenhum) | próximo A03 | publicação: Actions por commit | limite: A03 TODO, plano v4 12/25 DONE. Linha alvo ainda deve caber inteira na reserva2000; prova distante exige LF/CRLF e respeita200mil. Sem ampliação de regras linguísticas, medição de latência/RAM ou avaliação ampla; Q01/Q02 permanecem.
