# Evoluir o Escrevaral publicado

Decisão de Rafa em 14/10/2026: continuar a `main` de `rfmss/escrevaral` e o plano do produto em https://escrevaral.com. A proposta de reconstrução passa a contribuir com critérios de engenharia; deixa de ser uma fila de substituição do aplicativo.

## Base e referências

- Base retomada: v6.63, commit `53c4afe5090f3bcdc3a5fac9bd920c4783a2acae`. CI `38413159130` e Pages `38413158668` concluídos com sucesso.
- `vaultOUT26` conserva essa versão. É referência histórica; não é a branch de desenvolvimento.
- A experiência `reconstrucao`, último registro remoto `98eff8f6e0aca57fd96e0e258fbad075d3e2ad43`, permanece consultável. Seu site de prévia não é o produto vigente. Não fazer merge integral nem copiar seu armazenamento ou layout para a main.
- [Proposta original, agora histórica](referencias/PROPOSTA-RECONSTRUCAO-2026-10-13.md): texto preservado para rastrear o raciocínio. As decisões deste adendo prevalecem sobre sua direção de recomeço, árvore sugerida e marcos R00–R08.
- [Plano mestre](PLANO-MESTRE.md), [arquitetura atual](ARQUITETURA.md) e [filosofia de compatibilidade](FILOSOFIA-E-COMPATIBILIDADE.md) continuam sendo os contratos de trabalho.

## O que incorporamos

| Ideia da proposta | Aplicação na main |
| --- | --- |
| Index como composição, fontes pequenas | Manter `src/index.template.html` declarativo e `build/modules.json` como ordem explícita. `index.html` e portátil são gerados. Lógica nova vai para o módulo dono do fluxo, não para HTML ou controlador por conveniência. |
| Fronteiras de responsabilidade | Motores recebem texto e retornam achados. Adaptador cuida de identidade e posições. Interface apresenta. Persistência grava. Extrair um fluxo concreto ao tocá-lo, mantendo sua API e comportamento. |
| Segurança do manuscrito | Preservar texto, chaves e formatos; invalidar leituras antigas por revisão/folha. Tratar conteúdo do autor como texto, nunca HTML executável. Falha de análise não deve impedir escrita ou exportação. |
| Estado explícito | Diferenciar indisponível, não verificado, sem indício e resultado. A preparação continua limitada e cancelável; nenhuma fila de exames completos. |
| Compatibilidade deliberada | ES5 no aplicativo, recursos disponíveis por detecção e alternativas existentes. Sintaxe ES5 sozinha não comprova compatibilidade; referência de época não impede ferramentas modernas de build fora do navegador. |
| Distribuição confiável | Mesmas fontes para site e portátil, assets por versão, integridade do cache. Retenção de versões e migração de dados exigem um lote próprio; não remover gerações indiscriminadamente. |
| Reaproveitamento maduro | Aproveitar primeiro cofre, contratos e recursos licenciados já integrados. Motor externo só entra com origem, licença, cobertura, custo e adaptação avaliados. Sem framework ou engine nova apenas por reputação. |
| Continuidade entre IAs | Usar a ficha existente de entrega como diário de bordo: decisão, arquivos, limites, verificações, reversão e próxima ação. Evitar diários concorrentes ou promessas de trabalho concluído sem evidência. |

## O que esta decisão encerra

A substituição do site por uma mesa nova, a execução dos marcos R00–R08 e a migração automática para outro modelo de armazenamento estão encerradas como direção atual. O desenho, a navegação, os cadernos, a exportação, os motores e os dados do produto publicado continuam como ponto de partida.

Não há garantia de código eterno ou ausência de falhas. Manutenção melhora com responsabilidades claras, formatos documentados, mudanças reversíveis e evidência proporcional ao risco. Uma linha arbitrária de tamanho de arquivo, uma árvore bonita ou mais camadas não demonstram essas qualidades.

## Aplicação imediata e continuidade

O próximo lote já previsto na main era **A03-pertinência**. A v6.64 coloca sua política em `ptbr/pertinencia.js`: recebe IDs/estados preparados e devolve seleção/contagens; não recebe manuscrito, DOM, armazenamento ou motor. `ptbr/painel.js` liga essa política ao seletor e aos eventos de invalidação existentes. O controlador legado não cresce neste lote.

O seletor começa em Todas as análises. A alternativa Com indícios neste recorte é explícita, conserva contagens de ausência e desconhecimento e permite voltar às demais lentes. Não inicia preparação nem exame por causa do filtro. A03 continua parcial: sinais fora do início ainda exigem contexto de proteção comprovado; preparação incremental geral e custo medido continuam pendentes.

Ao mexer nos próximos fluxos, priorizar a separação da reserva lexical e de sua apresentação do painel e, depois, extrair do controlador apenas a coordenação correspondente à tarefa em andamento. Cada extração deve ter uma fronteira útil e preservar comportamento; não abrir uma reforma paralela que interrompa o plano linguístico.

Verificação local: diff, montagem e casos dirigidos de integridade. O CI existente mantém a regressão automática; testes visuais ou em aparelhos não viram um gate novo. Reversão por commit, nunca force push. Estado e próxima ação ficam na [ficha v6.64](jornada/entregas/v6-64.json) e nas futuras fichas, com publicação conferida em Actions por SHA.
