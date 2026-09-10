# Instruções de trabalho — Escrevaral

## Retomada

Antes de alterar o projeto, leia `PROJECT.md`, `astra/CONSTITUICAO.md` e `astra/FILOSOFIA-DE-TRABALHO.md`. Consulte `astra/HANDOFF.md` para a continuidade e os documentos específicos do subsistema em trabalho. Confira branch, estado local e versão remota; preserve alterações existentes. Não reconstrua o projeto nem reabra decisões encerradas sem motivo concreto.

As instruções atuais de Rafa prevalecem sobre estes registros. A Constituição permanece a referência de produto; os documentos novos a complementam. Divergência material deve ser explicitada, sem inventar autorização ou ignorar restrições.

## Colaboração

- Rafa dirige produto, criação, público e experiência. O agente assume a investigação e a responsabilidade técnica pelas recomendações e pela execução autorizada.
- Trate pedidos como problemas de engenharia: objetivo, ambiente, restrições, prioridades e evidência de sucesso.
- Se uma decisão de arquitetura estiver aberta, investigue antes de implementar. Compare alternativas apenas quando houver um trade-off importante; resolva escolhas rotineiras sem criar uma aprovação por etapa.
- Diga quando uma proposta comprometer compatibilidade, preservação ou atenção e apresente uma alternativa concreta.
- Explique decisões em português brasileiro, com concisão e termos práticos. Mostre código apenas quando ajudar Rafa a avançar.

## Implementação

- Trabalhe em `astra/escrevaral-master`, com o produto ativo em `astra/`. Outras branches podem ser consultadas no escopo linguístico autorizado; não altere suas referências nem mescle implementações inteiras por conveniência.
- Priorize preservação do manuscrito, privacidade, compatibilidade, desempenho, memória, inicialização e manutenção simples. Não presuma hardware moderno.
- Mantenha HTML/CSS/JS clássico no runtime, sem dependências novas por conveniência, rede de análise, LLM ou build exigido para usar o arquivo pronto.
- Separe conhecimento, máquinas puras, superfície e oficina. Nenhuma regra linguística no DOM; nenhum DOM no cofre.
- Um instrumento de análise por ação explícita. Não execute análise linguística ao digitar. Preserve ambiguidade, variação brasileira e a escolha do autor.
- Para efeitos caros, compare primeiro uma simulação barata: textura, sprite, gradiente, máscara, composição ou pré-cálculo. Meça o custo quando relevante; um recurso antigo também pode ser caro.
- A ilusão pertence à apresentação. Nunca simule salvamento concluído, precisão linguística, compatibilidade, privacidade, segurança ou testes que não ocorreram.

## Verificação e memória

- Implemente por etapas pequenas e tente quebrar o comportamento alterado. Testes devem cobrir riscos reais, não repetir a implementação nem servir de ritual.
- Mudou runtime ou conhecimento? Use os gates do subsistema. No núcleo atual: `node astra/testes/run.js` e `node astra/oficina/empacotar.js --check`. Regerar a edição portátil é tarefa de manutenção.
- Diferencie inspeção, teste de lógica, navegador, execução sem rede e aparelho físico. ES5 aprovado não prova iOS 9.3.5.
- Teste documental não exige repetir a bateria do produto: confira links, coerência e sincronização.
- Atualize `PROJECT.md` somente quando o estado atual mudar; decisões duradouras vão à filosofia ou ao documento específico; registre pendências no handoff. Não multiplique documentos equivalentes.
- Preserve a identidade do Site e o público autorizado. Publicação segue o pedido em vigor; uma alteração documental não implica novo deploy do produto.
- Encerre com resultado, evidência suficiente e limitações materiais. Não prometa memória automática entre sessões; estes arquivos são o ponto verificável de retomada.
