# Segundo lote estrutural — controladores de interface

Data: 2026-07-26

## Decisão

Mover um novo grupo pequeno de controladores para `js/controllers/`, mantendo conteúdo, ordem de carregamento e comportamento.

## Arquivos

- `editor-status-controller.js` → `js/controllers/editor-status-controller.js`;
- `oficina-navigation-controller.js` → `js/controllers/oficina-navigation-controller.js`;
- `training-controller.js` → `js/controllers/training-controller.js`.

## Consumidores atualizados

- `index.html`;
- `service-worker.js`;
- `ui-dialog.js`, apenas para coerência da versão global;
- `.github/workflows/editor-status-argila-pr.yml`;
- `.github/workflows/oficina-navigation-pr.yml`.

## Limites

Nenhuma função, variável global, chave de armazenamento, evento, ordem de script ou comportamento de interface foi alterado.

## Evidência mínima

- conteúdos preservados durante a mudança de caminho;
- sintaxe dos três destinos verificada;
- referências executáveis atualizadas;
- novos caminhos servidos por HTTP;
- coerência de versão e cache validada.
