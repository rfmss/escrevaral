# Manual de Continuidade

**Data:** 2026-06-16  
**Função:** dar autonomia coerente a agentes que mantêm e evoluem o Escrevaral

---

## O que este projeto quer ser

O Escrevaral não é um amontoado de ferramentas de escrita.

Ele é uma oficina literária brasileira, local, íntima e séria, feita para quem escreve de verdade e quer sentir que o texto está em boas mãos.

O estado ideal do projeto é este:

- a escritora entende o produto sem precisar traduzir jargão
- cada área da interface tem uma tarefa nítida
- o texto continua sendo o centro de gravidade
- análise ajuda, mas não humilha
- organização ajuda, mas não burocratiza
- publicação e autoria aparecem como amparo, não como susto

Se uma melhoria aumenta poder técnico mas enfraquece uma dessas qualidades, ela não é melhoria completa.

---

## Quem é a pessoa para quem construímos

Leia junto com [ROTA_PRODUTO_ANA.md](/home/rafamass/escrevaral/docs/_decisoes/ROTA_PRODUTO_ANA.md:1).

Resumo operacional:

- ela já escreve
- ela não quer parecer amadora
- ela não quer uma ferramenta fria, corporativa ou em inglês
- ela quer ser levada a sério sem ser tratada como máquina de produtividade
- ela precisa sentir que o manuscrito continua sendo dela

Toda decisão deve passar por esta pergunta:

**O que a Ana sente quando encontra isso?**

---

## O que nunca sacrificar

### 1. O texto no centro

Nada deve competir permanentemente com a escrita.

### 2. Português brasileiro integral

A interface não pode recair para inglês técnico, jargão de software ou cópia neutra demais.

### 3. Offline-first e privacidade

O valor do Escrevaral depende da confiança de que o texto não está indo para fora por padrão.

### 4. Clareza de superfície

Uma área deve ter função reconhecível. Quando uma tela começa a fazer coisas demais, ela precisa ser repartida ou reordenada.

### 5. Ajuda sem sentença

Motores como análise, voz, rima e vocabulário devolvem pistas, não notas morais.

---

## Hierarquia de decisão

Quando houver dúvida entre dois caminhos, decidir nesta ordem:

1. preserva a confiança da escritora?
2. deixa a tarefa mais clara?
3. reduz atrito sem esconder poder?
4. mantém coerência com a linguagem do projeto?
5. tem baixo risco de quebrar fluxos já estáveis?

Se a resposta para os três primeiros pontos não for claramente “sim”, pare e reavalie.

---

## O que faltava dizer

Este manual, sozinho, corria um risco:

- virar carta de princípios sem disciplina operacional
- permitir que dois agentes puxem direções conflitantes ao mesmo tempo
- estimular continuidade sem dizer com clareza quando parar
- celebrar criatividade sem exigir prova de melhora

Por isso, a partir daqui, continuidade no Escrevaral exige também governança.

---

## Quem decide o quê

### Decisão local

O agente pode decidir sozinho quando:

- a mudança é pequena
- afeta uma única superfície principal
- não muda nomenclatura estrutural
- não altera armazenamento, exportação, autoria ou promessa de privacidade

### Decisão de coordenação

O agente deve registrar e tratar como decisão de coordenação quando:

- muda nome de área principal
- mexe em mais de uma superfície no mesmo ciclo
- altera comportamento de engine com risco de falso positivo em gêneros
- cria nova navegação, novo fluxo ou nova superfície persistente

### Decisão que não pode ser tomada no escuro

Nenhum agente deve executar sozinho, sem deixar justificativa forte no worktree:

- envio de dados para fora por padrão
- mudança de promessa offline-first
- unificação ou separação de áreas principais sem auditoria
- refactor estrutural que toque estado + interface + exportação juntos

---

## Como escolher a próxima melhoria sem depender do usuário

Escolher trabalho nesta ordem:

1. **quebras reais**
   erro, regressão, fluxo bloqueado, perda de confiança

2. **clareza estrutural**
   áreas confusas, superfícies duplicadas, nomes ruins, excesso de profundidade

3. **continuidade de pílulas já abertas**
   quando uma auditoria já deixou próximo passo explícito no worktree

4. **enriquecimento de cobertura**
   corpus, dados, pequenas ampliações de engine

5. **novidade criativa**
   só quando as quatro camadas acima estiverem calmas

Regra:

Não abrir uma novidade grande enquanto existir uma pílula estrutural pequena e clara esperando execução.

---

## Como provar que uma melhoria melhorou

Melhoria aqui não é opinião. Cada rodada deve tentar fechar pelo menos um destes critérios:

- menos passos para chegar à tarefa principal
- menos superfícies duplicadas
- menos ambiguidade de nome ou função
- menos risco de regressão
- mais aderência ao tom do projeto
- mais cobertura real sem punir gêneros ou estilos indevidamente

Se o agente não consegue dizer em uma frase qual desses critérios melhorou, provavelmente ainda não terminou de pensar.

---

## Como trabalhar

### Ritmo

- preferir pílulas pequenas
- mexer em uma superfície principal por vez
- validar antes de abrir a próxima frente

### Forma

- primeiro entender a área viva do produto
- depois mexer no HTML/CSS se o problema for de leitura e hierarquia
- só mexer em estado quando a mudança visual exigir

### Encadeamento

Toda rodada deve deixar:

- o que foi feito
- o que não foi feito
- o próximo passo recomendado
- o risco conhecido

Tudo isso no worktree, em `.md`.

### Regra de parada

Toda rodada também deve parar quando:

- a próxima melhoria exigir pesquisa que ainda não foi feita
- a próxima etapa passar de uma superfície para duas ou três sem necessidade
- a mudança já ficou “boa o bastante” e o resto virou capricho
- o agente está prestes a mexer em arquitetura para resolver um problema de copy ou ordem

Parar na hora certa faz parte da manutenção coerente.

---

## Como criar sem virar improviso

Criar aqui não é “inventar feature”.

Criar aqui é:

- nomear melhor uma área
- achar uma ordem mais humana para a interface
- desenhar um ritual de uso mais bonito
- transformar uma ferramenta fria em experiência de ofício
- revelar uma possibilidade do texto que já estava implícita

Antes de propor algo novo, verificar:

- isso nasce do projeto ou só caberia em qualquer app?
- isso melhora a vida da escritora ou só parece inteligente?
- isso aumenta profundidade ou apenas densidade?

Se a proposta não tiver uma resposta boa para essas três perguntas, ela ainda não está pronta.

---

## O que não automatizar por impulso

Há áreas em que autonomia demais vira dano:

- classificação moral da escrita
- inferência agressiva de intenção autoral
- fusão de superfícies só porque parecem redundantes
- reescrita ampla de copy sem olhar de produto
- mudanças em autoria e direitos tratadas como detalhe visual

Nestes casos, o agente deve preferir:

- pílula menor
- auditoria primeiro
- registro explícito de trade-off

---

## Sinais de desvio

Se qualquer um destes sinais aparecer, o agente deve desacelerar:

- a navegação está virando depósito de recursos
- a mesma informação aparece em três superfícies
- o nome da área promete uma coisa e entrega outra
- a copy começa a soar técnica demais
- a ferramenta exige explicação demais para ser compreendida
- a camada analítica começa a punir poesia, ficção ou voz autoral como se fossem erro
- o backlog começa a crescer sem status, dono temporário ou ordem
- há pílulas demais abertas ao mesmo tempo
- o agente mexe em produção sem deixar trilha clara no repositório

---

## Superfícies do projeto hoje

### Editor

Centro gravitacional. Tudo deve proteger o tempo de escrita.

### Ateliê

Lugar de leitura do texto, oficinas, guias e preparação editorial. Não deixar virar página-ônibus outra vez.

### Arquivo / Acervo

Lugar de morada, retomada, detalhe e exportação. O acervo completo precisa continuar sendo a verdade principal.

### Autoria

Lugar de prova, confiança e envio. Tratar com solenidade calma.

### Cronograma

Lugar de ritmo, não de cobrança agressiva.

---

## Estado ideal observável

O “ideal” não é abstrato. Um agente deve conseguir olhar o produto e reconhecer estes sinais:

- nave principal curta e semanticamente estável
- cada tela principal responde a uma pergunta simples
- a primeira dobra de cada área orienta o uso sem aula
- o editor continua sendo o centro gravitacional
- motores de leitura respeitam diferença entre prosa, poesia, roteiro e uso técnico
- backup, autoria e exportação transmitem segurança calma

Se o projeto crescer sem preservar esses sinais, ele está inchando, não amadurecendo.

---

## Contrato entre agentes

Se um agente pegar o projeto, ele assume quatro obrigações:

1. não reabrir discussão já estabilizada sem motivo real
2. não esconder decisões só na conversa; registrar no repositório
3. não fazer refactor largo quando uma pílula pequena resolve
4. deixar o próximo agente melhor situado do que encontrou
5. marcar claramente o que virou decisão, o que ainda é hipótese e o que pede validação
6. não confundir “deu para implementar” com “merecia ser implementado”

---

## Arquivos de apoio para começar

- [ROTA_PRODUTO_ANA.md](/home/rafamass/escrevaral/docs/_decisoes/ROTA_PRODUTO_ANA.md:1)
- [AGENCIA_CONTINUIDADE_2026-06-16.md](/home/rafamass/escrevaral/docs/_decisoes/AGENCIA_CONTINUIDADE_2026-06-16.md:1)
- [BANCA_CRITICA_CONTINUIDADE_2026-06-17.md](/home/rafamass/escrevaral/docs/_decisoes/BANCA_CRITICA_CONTINUIDADE_2026-06-17.md:1)
- [BANCADA_REESTRUTURACAO_2026-06-16.md](/home/rafamass/escrevaral/docs/_decisoes/BANCADA_REESTRUTURACAO_2026-06-16.md:1)
- [acervo-superficies-duplicadas-20260616.md](/home/rafamass/escrevaral/reports/auditoria/acervo-superficies-duplicadas-20260616.md:1)

---

## Regra final

Se o agente estiver em dúvida entre parecer brilhante e ser útil, escolha ser útil.

Se estiver em dúvida entre ser útil e ser fiel ao espírito do projeto, escolha ser fiel.

Porque o que faz o Escrevaral respirar não é só a soma das funções. É o modo como elas tratam quem escreve.
