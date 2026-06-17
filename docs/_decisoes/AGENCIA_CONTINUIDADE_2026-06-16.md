# Agência de Continuidade — manutenção de melhorias

**Data:** 2026-06-16  
**Objetivo:** deixar uma estrutura de trabalho clara para continuidade autônoma no repositório

---

## Recado operacional

Claude: este arquivo é um quadro de operação. As pílulas abaixo estão prontas para pickup. Pode executar em ordem, uma por vez, validando risco local antes de abrir a próxima.

Leitura obrigatória antes de qualquer pílula nova:

- [MANUAL_DE_CONTINUIDADE.md](/home/rafamass/escrevaral/docs/MANUAL_DE_CONTINUIDADE.md:1)
- [BANCA_CRITICA_CONTINUIDADE_2026-06-17.md](/home/rafamass/escrevaral/docs/_decisoes/BANCA_CRITICA_CONTINUIDADE_2026-06-17.md:1)

---

## Cargos necessários

### 1. Direção de produto

Responsável por:

- decidir qual superfície é canônica
- impedir que a navegação vire depósito de features
- arbitrar nomenclatura (`Ateliê`, `Arquivo`, `Acervo`, `Autoria`)

### 2. Arquitetura de informação

Responsável por:

- ordem das seções
- agrupamento por tarefa
- redução de superfícies duplicadas

### 3. UX writing / copy editorial

Responsável por:

- rótulos
- microcopy
- consistência entre desktop, mobile e docs

### 4. Frontend de superfície

Responsável por:

- HTML/CSS das áreas principais
- responsividade
- redução de ruído visual

### 5. Controle de estado

Responsável por:

- garantir que reorder visual não quebre scroll-target, filtros, seleção ativa e painel lateral

### 6. QA / auditoria

Responsável por:

- testar cenários de quebra
- vigiar duplicações de entrada
- registrar achado em `.md` curto e acionável

---

## Regras da agência

1. Trabalhar em pílulas pequenas.
2. Cada pílula mexe em uma área principal por vez.
3. Sempre deixar o próximo passo escrito no worktree.
4. Não abrir refactor estrutural e rename amplo na mesma rodada.
5. Se a melhoria for de leitura e hierarquia, preferir primeiro HTML/CSS antes de mexer em estado.
6. Toda pílula precisa dizer: dono temporário, risco, critério de aceite e condição de parada.

---

## Ritual mínimo da agência

Antes de começar:

- ler o `MANUAL_DE_CONTINUIDADE`
- verificar quais pílulas já estão abertas
- escolher apenas uma como foco

Durante:

- não abrir segunda frente para “aproveitar o embalo”
- validar o que puder localmente
- registrar o que mudou de estado no projeto

Ao terminar:

- atualizar status da pílula
- deixar a próxima em formato pegável
- marcar se a decisão virou regra, hipótese ou experimento

---

## Estados possíveis de uma pílula

- `pronta para execução`
- `em execução`
- `bloqueada por decisão`
- `aguardando validação`
- `encerrada`

Nenhuma pílula deve ficar no backlog sem um desses estados.

---

## Backlog vivo

### PIL-ARQ-01 — Unificar strips do Acervo

Fonte:

- [acervo-superficies-duplicadas-20260616.md](/home/rafamass/escrevaral/reports/auditoria/acervo-superficies-duplicadas-20260616.md:1)

Status:

- **encerrada** (v585, 2026-06-17)

Resultado:

- 3 strips (Fixados, Em andamento, Recentes) substituídas por 1 bloco "Retomar agora" com máx. 3 itens; prioridade: ativo > fixado > recente; auditoria visual confirmou renderização correta

Dono temporário:

- frontend de superfície + arquitetura de informação

### PIL-ATL-01 — Taxonomia interna do Ateliê

Objetivo:

- separar melhor `ferramentas que leem o texto` de `leituras` e `treino`

Status:

- **encerrada** (v587, 2026-06-17)

Resultado:

- 3 grupos claramente separados por `border-left` no tab bar: análise (Espelho de Voz, RimaLab, Vocabulário) | referência (Leituras) | prática (Treino)
- CSS-only, sem refactor estrutural; alinha com parágrafo descritivo já existente na seção

Dono temporário:

- arquitetura de informação + UX writing

### PIL-NAV-01 — Unificar `Arquivo` e `Acervo`

Objetivo:

- reduzir custo cognitivo entre nome da aba e nome da área

Status:

- **encerrada** (2026-06-17, verificado por auditoria visual)

Resultado:

- nav e tela já dizem "Acervo"; `data-view-target="arquivo"` é identificador técnico interno, não visível; divergência não existia na interface

Dono temporário:

- direção de produto

### PIL-ARQ-02 — Painel lateral do Acervo como inspector real

Objetivo:

- reforçar que o painel direito serve para editar metadados e exportar, não para competir com o card principal

Possível melhoria:

- cabeçalho mais forte para a nota ativa
- separação visual maior entre `Detalhes` e `Exportar`

Status:

- **pronto para execução**

Dono temporário:

- frontend de superfície

---

## Sequência recomendada

1. `PIL-ARQ-01`
2. auditoria visual rápida do `Arquivo`
3. `PIL-NAV-01` ou decisão explícita de manter a diferença
4. nova rodada do `Ateliê`

---

## Encerramento

Se uma pílula for executada, o agente da vez deve:

- atualizar este arquivo com status novo
- deixar o próximo passo escrito
- não assumir que o usuário viu a conversa anterior
