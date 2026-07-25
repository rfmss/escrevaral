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

- reforçar que o painel direito serve para editar metadados e exportar, não para competir com a lista de manuscritos

Status:

- **encerrada** (2026-07-25, PR #97)

Resultado:

- identidade da nota ativa passou a abrir o painel com título e formato em hierarquia editorial;
- o painel deixou de parecer um segundo cartão e virou uma margem de trabalho separada por um divisor discreto;
- `Abrir no editor` permanece como ação principal;
- `Detalhes` e `Exportar` foram separados por ritmo, tipografia e revelação progressiva;
- exportações foram organizadas em grade responsiva;
- comportamento móvel, dados, exportadores e persistência permaneceram intactos;
- validações de versões, integridade, Palavras, Mesa no celular, foco, overflow, console, engines e smoke foram aprovadas.

Dono temporário:

- frontend de superfície

### PIL-MOB-01 — Faixa de situação no celular

Objetivo:

- reduzir a massa persistente abaixo da escrita sem esconder contagem, salvamento, meta e temporizador

Status:

- **em execução** (PR #96 — etapa de medição antes da decisão visual)

Condição de parada:

- não abrir outra pílula de superfície enquanto a auditoria da faixa móvel não produzir uma correção pequena, verificável e sem sobreposição com o dock

Dono temporário:

- frontend de superfície + arquitetura de informação + QA

---

## Sequência atual

1. concluir e validar `PIL-MOB-01` no PR #96;
2. revisar a rota atual do produto antes de escolher nova superfície;
3. não reabrir Mesa no celular, Palavras ou o hub do Ateliê sem nova evidência, pois essas entregas já foram concluídas e protegidas por workflows próprios.

---

## Encerramento

Se uma pílula for executada, o agente da vez deve:

- atualizar status da pílula
- deixar o próximo passo escrito
- não assumir que o usuário viu a conversa anterior
