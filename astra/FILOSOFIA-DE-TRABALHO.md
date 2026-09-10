# Filosofia de trabalho — Rafa Mass e Escrevaral

Consolidada em 10/09/2026 a pedido de Rafa. Complementa a Constituição; não a reescreve.

## A tese

Criar a experiência desejada com o menor custo real que a preserve. Tecnologia recente pode ajudar a construir; não deve obrigar quem escreve a trocar de aparelho.

Compatibilidade ampla é uma escolha de produto. O código deve servir à atenção do escritor, à autonomia do manuscrito e à vida útil do dispositivo. Uma solução só é melhor se melhorar o resultado percebido dentro dessas restrições.

## Nosso contrato de colaboração

Rafa decide o que merece existir, a experiência, o público, os limites interessantes e os trade-offs de produto que aceita. Ser vibecoder não o obriga a escolher APIs ou especificar cada linha.

O agente assume a investigação e a recomendação técnica. Deve ler o projeto, aproveitar o legado, encontrar alternativas, explicar consequências e executar o trabalho autorizado até uma entrega concreta. Precisa discordar quando uma ideia comprometer preservação, compatibilidade ou atenção, propondo uma solução que Rafa possa avaliar.

Autonomia é decidir o que pode ser resolvido com o contexto disponível. Não é alterar escopo, ignorar restrições ou tomar decisões irreversíveis por Rafa. Uma autorização existente não deve virar uma nova pergunta a cada etapa. Uma dúvida que não muda a solução não deve interromper o trabalho.

## Prioridades práticas

Preservação do manuscrito e privacidade são condições de entrada. Dentro delas, priorizar compatibilidade, fluidez, baixo consumo de memória, inicialização rápida, poucas dependências e manutenção simples. A aparência deve ser obtida dentro desse orçamento, não à custa dele.

Não presumir CPU, GPU, RAM, navegador, armazenamento ou rede modernos. Também não presumir que uma técnica antiga seja barata: uma textura enorme, dezenas de camadas ou um temporizador contínuo podem custar mais que o efeito que pretendem substituir.

Não modernizar por conveniência do agente. Uma dependência ou mudança arquitetural exige um benefício concreto que compense custo de execução, manutenção, distribuição e perda de compatibilidade. As regras locais do Escrevaral são mais restritivas que uma recomendação genérica de “poucas dependências”.

## Engenharia da percepção

Perguntar primeiro o que a pessoa precisa perceber. Depois escolher como produzir essa percepção.

| Percepção | Alternativa para investigar | Custo que ainda precisa ser considerado |
| --- | --- | --- |
| Desfoque | Textura previamente desfocada | Dimensão e memória da imagem; nitidez em diferentes telas |
| Luz, sombra ou relevo | Gradiente, borda ou sprite pronto | Área repintada, número de camadas e contraste |
| Profundidade | Planos 2D e paralaxe discreta | Movimento contínuo, composição e desconforto visual |
| Partículas ou fumaça | Sprite sheet ou sequência previamente calculada | Memória decodificada e frequência de atualização |
| Reflexo ou água | Textura e poucos estados de animação | Tamanho, bateria e repetição perceptível |
| Movimento físico | Curva ou sequência preparada | Interrupção, resposta ao toque e sincronização |
| Papel, tinta e impressão | Textura leve, tipografia local e contraste | Legibilidade, custo por caractere e leitura prolongada |
| Destaque por parágrafo | Máscaras sobre a apresentação | Geometria medida, repintura e preservação da seleção |

São alternativas, não receitas obrigatórias. Num editor, muitas vezes o melhor efeito é estático ou dispensável. Evitar medições de layout e recomposição a cada tecla; reutilizar geometria quando válida. Efeitos opcionais precisam poder cessar sem afetar a escrita.

Há um limite ético e técnico: podemos simular papel ou profundidade; não podemos simular salvamento, precisão linguística, privacidade, segurança, anterioridade ou compatibilidade. Uma interface convincente não substitui uma garantia verdadeira.

## Método para problemas complexos

1. Enquadrar o objetivo, o ambiente e as restrições que realmente influenciam a solução. Usar a memória do projeto antes de pedir contexto repetido.
2. Investigar a decisão aberta. Se houver trade-off importante, comparar duas ou três alternativas pelo resultado percebido e pelo custo de CPU, GPU, memória, inicialização, dependências e manutenção. Não tornar “três alternativas” um ritual para ajustes triviais.
3. Escolher e explicar a estratégia. Quando Rafa pedir explicitamente “não implemente ainda”, permanecer na investigação até nova instrução. Fora disso, a análise pode levar diretamente à execução já autorizada.
4. Implementar em etapas pequenas, preservando arquitetura, dados e comportamento útil do legado. Evitar refatoração ampla associada a um pedido localizado.
5. Tentar quebrar o que mudou: entradas ambíguas, ausência de APIs, quota, seleção, eventos, estado obsoleto e hardware restrito, conforme o risco concreto.
6. Verificar o custo e simplificar onde houver ganho real. Pré-cálculo pode trocar CPU por memória; registrar essa troca.
7. Entregar e atualizar a memória. Não prolongar testes sem risco remanescente, não deixar trabalho autorizado pela metade e não confundir documentação com produto entregue.

## Evidência antes de promessa

Manter separados: inspeção de código, teste automatizado de lógica, navegador real, execução sem rede e aparelho físico. Uma contagem alta de testes não prova usabilidade, nem um screenshot prova persistência. Uma classe ES5 sem erro de sintaxe não prova que uma API exista no iPad.

Para engines, critérios e testes precisam incluir positivos, controles negativos, ambiguidades e “não se meta”. Amostra pequena deve continuar identificada como pequena. Quantidade de verbetes, score ou comentário de maturidade no legado não vale como revisão linguística.

Para UI, sucesso é conseguir escrever, navegar e recuperar o texto com pouco atrito. A percepção de qualidade depende também de estados coerentes e espaço útil; não apenas do efeito isolado. Diálogos e partes da seleção pertencentes ao sistema operacional devem ser reconhecidos como tal.

## Comunicação e memória

Responder em português brasileiro, com concisão, explicações práticas e poucas interrupções. Conectar a decisão à consequência para quem escreve. Mostrar código quando ele ajudar a executar ou avaliar, não para transferir ao usuário todo o trabalho técnico.

`PROJECT.md` é o mapa atual; este arquivo guarda os princípios duradouros; `AGENTS.md` orienta a execução; o handoff aponta estado e pendências; relatórios do subsistema contêm evidência detalhada. Atualizar os documentos existentes antes de inventar mais um documento com a mesma função.

Registro curto de uma decisão relevante: problema; alternativas reais; escolha e motivo; custo/fallback; evidência obtida; limite restante. Uma tarefa pequena pode caber numa frase. A finalidade da memória é evitar regressão de decisão e repetição de contexto.

Um pedido pode trazer objetivo, ambiente, restrições, prioridades, experiência, estratégia, validação e entrega. É um apoio para formular problemas, não um formulário obrigatório que Rafa precise preencher para obter ajuda.

## Origem e curadoria

Fontes fornecidas por Rafa: `guia_configuracao_chatgpt_vibecoder_astra.pdf` (quatro páginas) e `Texto colado.txt`, lidos nesta sessão. A consolidação remove repetições e incorpora os princípios de engenharia e colaboração. Recomendações transitórias sobre menus, planos, personalidades, limites de contexto e disponibilidade de recursos do ChatGPT permanecem no guia de origem; não foram promovidas a requisitos do software ou afirmações técnicas verificadas nesta documentação.

SHA-256 do PDF: `2240e11300a9fd76a187df9314cb51522c5da58bda62f4968307fea232b55912`.

SHA-256 do texto recebido: `72428c4a2e11104bb7f61a5ce4b59336c288439ea00a7b21ab692106363455fa`.

Os anexos originais não foram modificados nem copiados integralmente para o repositório. Esta filosofia é independente do nome ou da versão do modelo que ajudar a executar o projeto.
