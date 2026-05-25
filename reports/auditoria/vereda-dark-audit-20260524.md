# Auditoria Vereda — tema escuro

Data: 2026-05-24

Escopo: validar a integração do tema escuro Vereda (`data-theme="scriptorium"`) nas rotas principais do Escrevaral, sem renomear ainda o identificador técnico legado `scriptorium`.

## Alterações aplicadas

- `index.html`: bootstrap mínimo no `<head>` para aplicar `data-theme="scriptorium"` antes do carregamento dos CSS quando `localStorage["vereda:dark-mode"] === "on"`. Isso reduz flash/race de tema claro em reload.
- `css/00-tokens.css`: overrides de contraste para Vereda em abas, navegação lateral, controles do editor, Prova de autoria, Cronograma e toast de desfazer.
- `css/08-responsive.css`: colapso mobile do `voice-mirror` em uma coluna, com limites de largura para copy, workbench, textarea, título e ações.
- `index.html` e `service-worker.js`: versão de assets atualizada para `20260524-darkaudit`; cache do service worker atualizado para `vereda-offline-v244`.

## Pontos corrigidos

- Prova de autoria: `proof-session-bar` e `proof-actions` não usam mais vidro escuro dentro do pergaminho em Vereda.
- Editor: botões `Ler`, `Página`, lixeira e grupo editorial têm contraste legível no pergaminho.
- Cronograma: meses inativos não dependem mais de opacidade baixa no tema escuro.
- Toast de undo: fundo e ação `Desfazer` agora têm contraste suficiente em Vereda.
- Academia mobile: `Espelho de Voz` colapsa para uma coluna e evita vazamento horizontal interno.
- Navegação: tabs e linhas laterais recebem cores explícitas em Vereda.

## Verificação

Auditoria headless via Chromium em 12 combinações:

- Desktop: `editor`, `biblioteca`, `autoria`, `arquivo`, `academia`, `cronograma`
- Mobile/headless compacto: `editor`, `biblioteca`, `autoria`, `arquivo`, `academia`, `cronograma`

Resultado agregado:

- `themeFailures`: 0
- `viewFailures`: 0
- `overflowFailures`: 0
- `lowContrastSamples`: 0
- `clickFailures`: 0

Artefatos locais:

- JSON: `/tmp/escrevaral-dark-audit-20260524-afterfix/audit.json`
- Capturas: `/tmp/escrevaral-dark-audit-20260524-afterfix/direct-cronograma.png`, `/tmp/escrevaral-dark-audit-20260524-afterfix/direct-mobile-academia-v2.png`

## Observações para próxima sessão

- O nome técnico `scriptorium` permanece intencionalmente como legado interno. A migração para `vereda` deve ser feita em sessão própria, junto com `editor-controller.js` e qualquer persistência associada.
- A captura mobile do Chromium headless usa viewport efetivo mínimo em torno de 500px mesmo com `--window-size=390`; por isso o critério final usado aqui foi DOM/CSS computado + ausência de overflow, não apenas screenshot.
- Os arquivos temporários de runner não ficaram no repositório. A auditoria foi registrada apenas em `/tmp` e neste relatório.
