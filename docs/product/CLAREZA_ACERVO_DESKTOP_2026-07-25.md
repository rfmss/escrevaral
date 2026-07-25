# Clareza do Produto — Acervo desktop

Data: 2026-07-25  
Branch: `clarity/desktop-archive`

## Problema

O Acervo reúne funções importantes, mas hoje apresenta quase todas simultaneamente:

- título e criação;
- busca e ordenação;
- filtro por formato;
- filtro por situação;
- total de palavras;
- retomada rápida;
- grade de manuscritos;
- seleção ativa;
- inspector;
- ações rápidas;
- exportação e cópias de segurança.

O resultado é uma superfície tecnicamente completa, mas que exige leitura prévia da interface.

## Hierarquia aprovada

A leitura do Acervo desktop deve acontecer nesta ordem:

1. **Identidade e criação** — “Seus textos” e “Novo manuscrito”.
2. **Encontrar** — busca e ordenação sempre visíveis.
3. **Refinar** — formato e situação sob o gesto “Filtrar”.
4. **Retomar** — até três textos ativos, fixados ou recentes.
5. **Percorrer** — lista editorial principal.
6. **Compreender e agir** — inspector da seleção ativa.
7. **Proteger** — backup e operações de segurança sob demanda.

## Decisões

- busca e ordenação permanecem imediatas;
- filtros não são removidos: passam a uma revelação progressiva desktop;
- no mobile, a estrutura existente é preservada neste bloco;
- “Retomar agora” deixa de parecer uma segunda grade concorrente;
- cartões da lista deixam de simular dashboards;
- a seleção ativa deve ser inequívoca por fundo, margem e tipografia;
- ações rápidas aparecem quando o item recebe atenção por ponteiro, teclado ou seleção;
- detalhes, progresso, tags e exportações continuam disponíveis;
- o inspector continua sendo a margem de trabalho do texto selecionado;
- o Acervo não ganha funcionalidade nova.

## Proteções

Não alterar:

- estrutura dos manuscritos;
- filtros e ordenação existentes;
- IDs e atributos `data-*` usados pelos controladores;
- persistência no `localStorage`;
- seleção ativa;
- fixação, duplicação ou abertura;
- exportadores;
- backup, recuperação e Mesa no celular;
- engines.

## Critérios de aprovação

Em 1280, 1366 e 1440 px:

- busca e ordenação formam uma linha principal;
- filtros ficam acessíveis por teclado e ponteiro em até um gesto;
- nenhum texto importante é truncado sem necessidade;
- “Retomar agora” mostra no máximo três itens e não compete com a lista;
- a lista usa uma única coluna editorial;
- a seleção ativa é reconhecível sem depender apenas de cor;
- o inspector permanece visível e não cobre a lista;
- ações da lista não desaparecem para teclado;
- não há overflow horizontal ou erros de console;
- manuscritos, Palavras, Oficina, entrada, editor, PWA e mobile permanecem íntegros.
