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

## Evidência do piloto

A execução direcionada concluiu com sucesso:

- movimentação dos três arquivos;
- verificação sintática com Node;
- conferência dos novos caminhos no HTML e no service worker;
- alinhamento da versão do carregamento dinâmico em `ui-dialog.js`;
- auditoria de versão de assets;
- resposta HTTP dos três novos endereços.

A primeira execução da matriz completa revelou que `scripts/auditor-dados.py` ainda procurava `synonym-data.js` na raiz. O consumidor foi atualizado para `js/data/synonym-data.js` e executado novamente sem P0. Essa falha foi tratada como dependência estrutural, não como falso negativo a ser ignorado.

A matriz completa da candidata deve validar o commit final antes de qualquer incorporação.

## Critério para continuar

A migração das demais categorias só deve avançar após a candidata a lançamento confirmar carregamento, console limpo, integridade de dados e funcionamento sem internet.
