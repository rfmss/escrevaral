# Piloto estrutural — controladores JavaScript

"
    "Data: 2026-07-25

"
    "## Decisão

"
    "Mover um primeiro grupo pequeno de controladores de interface para `js/controllers/`, sem refatorar comportamento.

"
    "## Arquivos

"
    "- `tooltip-controller.js` → `js/controllers/tooltip-controller.js`;
"
    "- `pomodoro-controller.js` → `js/controllers/pomodoro-controller.js`;
"
    "- `reader-controller.js` → `js/controllers/reader-controller.js`.

"
    "## Consumidores atualizados

"
    "- `index.html`;
"
    "- `service-worker.js`;
"
    "- versionamento dinâmico em `ui-dialog.js`.

"
    "## Limites

"
    "Nenhuma função, variável global, ordem de carregamento, chave de armazenamento ou comportamento de interface foi alterado.

"
    "## Evidência mínima

"
    "- sintaxe JavaScript verificada nos três destinos;
"
    "- caminhos antigos ausentes dos consumidores executáveis;
"
    "- novos caminhos servidos por HTTP;
"
    "- coerência entre a versão dos assets e o cache do service worker.
"
    