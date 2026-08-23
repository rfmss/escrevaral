# Método permanente de apresentação de melhorias

Data de adoção: 2026-07-30

Estado: **obrigatório para o Mass Notes Next e reutilizável no legado**

## Por que este método existe

Melhorias de produto não devem ser apresentadas como uma lista de commits, nomes de arquivos ou afirmações como “corrigido”. A apresentação precisa permitir que outra pessoa:

1. compreenda o problema observado;
2. reproduza o comportamento anterior;
3. entenda a solução sem precisar ler o código;
4. veja provas equivalentes antes e depois;
5. saiba o que foi realmente aprovado;
6. conheça os limites e pendências restantes;
7. teste a melhoria na preview por um roteiro curto.

Documentação, teste e apresentação integram a definição de pronto.

## Regra permanente

Toda melhoria funcional, visual, editorial, linguística, de acessibilidade ou infraestrutura deve ser acompanhada do template versionado em:

- `docs/product/TEMPLATE_APRESENTACAO_MELHORIA.md`.

Ao iniciar uma nova observação, tarefa ou tranche, o template deve ser sugerido como estrutura padrão. Ele pode ser reduzido em mudanças pequenas, mas os campos **comportamento atual**, **comportamento esperado**, **evidência**, **critério de aceite**, **resultado** e **limitações** não podem desaparecer.

## Método CLARO

O método recebe o nome **CLARO** porque a melhoria precisa ser compreensível sem depender da implementação.

### C — Cenário observado

Registrar o que a pessoa estava tentando fazer, em qual viewport ou dispositivo, com qual documento e qual comportamento apareceu.

Perguntas obrigatórias:

- O que a pessoa fez?
- O que apareceu na tela?
- O problema é reproduzível?
- Qual superfície foi afetada?
- Existe captura, vídeo, trace ou roteiro?

### L — Limite e impacto

Classificar o efeito real, sem exagero.

Registrar:

- severidade: P0, P1, P2 ou observação;
- bloqueio de tarefa;
- risco de perda de dados;
- risco de mutação autoral;
- impacto de acessibilidade;
- impacto em desktop, tablet e celular;
- impacto em Chromium e Firefox;
- diferença entre defeito, dívida de usabilidade e preferência estética.

### A — Arquitetura ou ação escolhida

Explicar a solução em linguagem de produto e registrar as alternativas rejeitadas.

A apresentação deve responder:

- Qual fronteira será alterada?
- O que permanecerá intacto?
- Por que esta solução foi escolhida?
- Quais soluções aparentemente simples foram rejeitadas e por quê?
- Existe plano de reversão?

Para mudanças complexas, diagnóstico e implementação devem ser tranches separadas.

### R — Resultado reproduzível

Uma melhoria só recebe status **corrigida** quando existe evidência reproduzível.

Registrar:

- cenários automatizados adicionados;
- navegadores e viewports testados;
- corpus ou documento utilizado;
- matriz anterior e matriz nova;
- workflow, SHA, artefato e digest quando aplicável;
- smoke da preview;
- roteiro manual curto;
- prova de que superfícies não relacionadas permaneceram intactas.

Status permitidos:

- **corrigida** — critérios completos e matriz verde;
- **parcialmente corrigida** — ganho comprovado com limitações abertas;
- **reproduzida** — defeito comprovado, solução ainda não aprovada;
- **em investigação** — hipótese ainda sem prova suficiente;
- **pendente** — trabalho reconhecido e ainda não iniciado;
- **não reproduzida** — tentativa documentada sem confirmação do defeito.

### O — O que permanece aberto

Toda apresentação deve terminar com limites reais e próximo passo.

Exemplos:

- dispositivos físicos ainda não testados;
- leitor de tela não executado;
- conteúdo extremo ainda fora da matriz;
- primeira versão aceita quebra somente entre blocos;
- comportamento de impressão ou exportação ainda pendente;
- preferência estética ainda precisa de validação humana.

Nunca transformar uma melhoria localizada em afirmação global de maturidade.

## Estrutura de apresentação para pessoas

A apresentação recomendada possui duas camadas.

### Camada 1 — leitura rápida

Mostrar, nesta ordem:

1. título da observação;
2. uma frase sobre o problema;
3. uma frase sobre o comportamento esperado;
4. status atual;
5. antes/depois no mesmo viewport e com o mesmo documento;
6. três a cinco critérios aprovados;
7. limitações restantes;
8. link da preview;
9. roteiro de teste de até cinco passos.

Essa camada não deve ser uma lista de commits.

### Camada 2 — apêndice técnico

Separar em documento ou seção própria:

- causa raiz;
- arquitetura;
- alternativas rejeitadas;
- arquivos modificados;
- testes completos;
- SHA, workflows e artefatos;
- riscos e reversão.

Assim, a experiência de uso não fica escondida por detalhes de implementação, e a implementação continua auditável.

## Evidência visual recomendada

Para mudanças visuais ou de interação, produzir preferencialmente:

1. vídeo ou GIF de 15 a 30 segundos com antes/depois;
2. capturas usando o mesmo conteúdo e enquadramento;
3. desktop amplo, desktop baixo ou tablet e celular;
4. cursor, foco e scrollbar visíveis quando relevantes;
5. rótulo explícito de versão, viewport e status;
6. demonstração do caminho completo, não apenas uma tela estática.

Viewports de referência do Mass Notes Next:

- `1440 × 900` — desktop amplo;
- `1440 × 560` — desktop baixo e risco de corte vertical;
- `1024 × 768` — tablet/drawer;
- `390 × 844` ou `390 × 640` — celular.

Esses viewports não substituem teste físico.

## Roteiro de demonstração

O roteiro deve usar verbos observáveis. Exemplo:

1. abrir a preview;
2. carregar ou colar o documento de teste;
3. executar a ação que antes falhava;
4. mostrar o resultado esperado;
5. demonstrar que uma superfície relacionada permaneceu estável.

Evitar roteiros vagos como “navegar pelo sistema e conferir”.

## Critérios de linguagem

Usar:

- “o teste reproduziu”;
- “a candidata passou”;
- “a melhoria está limitada a”;
- “não houve alteração em”;
- “continua pendente”.

Evitar:

- “está perfeito”;
- “100% resolvido” sem fronteira mensurável;
- “igual ao Word” sem delimitar o comportamento;
- “responsivo” sem viewports e provas;
- “acessível” sem teste de teclado, tecnologia assistiva e dispositivo correspondente;
- “melhor que o legado” sem corpus ou dimensão explícita.

## Fluxo operacional

1. criar a ficha pelo template;
2. registrar a evidência anterior;
3. classificar severidade e fronteira;
4. escrever critérios antes da solução;
5. separar diagnóstico de implementação quando houver risco arquitetural;
6. criar teste que falha pelo motivo correto;
7. implementar a menor correção coerente;
8. repetir a matriz completa;
9. produzir evidência posterior equivalente;
10. registrar limitações e veredito;
11. atualizar PR e memória operacional;
12. manter a preview isolada e o PR em rascunho até autorização de promoção.

## Regra para prompts de trabalho

Todo prompt de diagnóstico ou implementação deve incluir:

- contexto do repositório, branch e PR;
- comportamento atual e esperado;
- restrições permanentes;
- itens que não podem ser alterados;
- critérios de aceite automatizáveis;
- documentação obrigatória;
- limite de release;
- exigência de apresentar a melhoria pelo template CLARO.

## Definição de pronto de apresentação

Uma melhoria está pronta para ser apresentada quando:

- a ficha CLARO está preenchida;
- há evidência anterior ou justificativa de ausência;
- os critérios foram executados;
- o status é honesto;
- existe roteiro de teste;
- a preview correspondente foi verificada;
- os limites estão visíveis;
- a apresentação e o apêndice técnico não se contradizem.
