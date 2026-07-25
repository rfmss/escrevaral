# Piloto de organização JavaScript — índices de dados

Data: 2026-07-25

## Decisão

Os três arquivos JavaScript que indexam dados foram movidos da raiz para `js/data/`:

- `criterios-data.js`;
- `quotes-data.js`;
- `synonym-data.js`.

Os arquivos JSON consumidos por `fetch()` permanecem na raiz nesta etapa. Scripts clássicos resolvem essas requisições a partir da página, e não da pasta física do arquivo JavaScript.

## Escopo preservado

- `service-worker.js` permanece na raiz para preservar seu escopo;
- nenhuma lógica dos três arquivos foi alterada;
- a ordem de carregamento no `index.html` foi preservada;
- os novos caminhos foram incluídos no cache offline;
- versões de assets, carregamento dinâmico e cache foram promovidas.

## Critério para continuar

A migração das demais categorias só deve avançar após a candidata a lançamento confirmar carregamento, console limpo, integridade de dados e funcionamento sem internet.
