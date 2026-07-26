# Remoção dos temas escuros mortos — 2026-07-26

## Estado

Decisão executada na Tarefa 2 da frente de Design System.

Em 26 de julho de 2026, após os squash merges dos PRs #134 e #137, a branch do PR #135 foi reconstruída sobre a nova `main` (`b483c6d`). Os estados anteriores permanecem preservados em `backup/pr-135-pre-main-29b75b3` e `backup/pr-135-pre-foundation-b483c6d`.

Foram removidos exclusivamente os seletores e blocos pertencentes às variantes técnicas `cerrado-dark`, `mata-dark` e `amazonia-dark`.

O tema escuro ativo continua sendo Vereda, identificado internamente por `data-theme="scriptorium"`. O tema claro principal continua sendo Alvorada.

## Evidência de código morto

Antes da remoção, as três variantes somavam 284 ocorrências em seis arquivos CSS:

| Arquivo | `cerrado-dark` | `mata-dark` | `amazonia-dark` | Total |
| --- | ---: | ---: | ---: | ---: |
| `css/00-tokens.css` | 42 | 42 | 42 | 126 |
| `css/02-shell-navigation.css` | 19 | 19 | 18 | 56 |
| `css/03-editor-modes.css` | 5 | 5 | 5 | 15 |
| `css/03-editor-toolbar.css` | 14 | 14 | 14 | 42 |
| `css/03-inspector-precision.css` | 14 | 14 | 14 | 42 |
| `css/06-academy-tools.css` | 1 | 1 | 1 | 3 |
| Total | 95 | 95 | 94 | 284 |

A estimativa inicial de aproximadamente 287 ocorrências foi substituída pela contagem reproduzível acima.

A investigação anterior já havia confirmado que nenhuma dessas variantes era referenciada por `data-theme=`, controles de interface, testes ou auditorias. Manter seus seletores aumentava a superfície de manutenção e permitia que correções futuras fossem aplicadas a temas inexistentes.

## Método de remoção

A limpeza seguiu três regras:

1. blocos cujo seletor pertencia somente a `cerrado-dark`, `mata-dark` ou `amazonia-dark` foram removidos por inteiro;
2. em grupos compartilhados com `scriptorium`, apenas os seletores das três variantes mortas foram retirados, preservando a declaração e o seletor de Vereda;
3. negações como `:not([data-theme="cerrado-dark"])` foram reduzidas para excluir somente temas que continuam existindo.

A transformação foi feita por árvore CSS, não por substituição cega de linhas. O processo abortava se a contagem inicial divergisse do inventário ou se qualquer ocorrência permanecesse nos seis arquivos ao final.

## Resultado

Contagem final nos arquivos CSS de produção:

- `cerrado-dark`: 0;
- `mata-dark`: 0;
- `amazonia-dark`: 0;
- total eliminado: 284 ocorrências.

O documento `docs/_decisoes/SUGESTOES_AUTONOMAS_2026-06-16.md` permanece inalterado como registro histórico. As menções nele contidas não representam código ativo e não entram na contagem de produção.

## Distribuição offline

Como seis arquivos CSS distribuídos foram alterados, os identificadores de distribuição avançaram nesta branch:

- `ASSET_VERSION`: `20260726-design-system-foundation-v1` → `20260726-remove-dead-dark-themes-v2`;
- `CACHE_NAME`: `vereda-offline-v962` → `vereda-offline-v963`;
- referências versionadas alinhadas em `index.html`, `service-worker.js`, `ui-dialog.js`, `css/14-archive-inspector.css` e `css/wood-icons.css`.

Não houve mudança na lista de assets, estratégia, escopo, instalação, ativação, busca ou descarte de caches do service worker.

Após o squash merge do PR #137, esta branch foi reconstruída sobre a nova `main`. O contraste corrigido de `text-muted`, a fundação de `ActionButton` e `TextStatistic`, o harness e os auditores permanecem preservados; o cache avança de forma estritamente crescente para `v963`.

A reconstrução executou e aprovou `scripts/auditor-asset-version.py`, `scripts/auditor-design-tokens-contrast.py`, `scripts/auditor-repository-boundary.py` e `git diff --check` antes do force-push.

## Validação obrigatória

A limpeza só é considerada pronta quando:

- a busca nos seis CSS retorna zero ocorrências das três variantes;
- o parser CSS aceita os arquivos transformados;
- todos os gates do repositório terminam verdes;
- as auditorias visuais de Alvorada e Vereda permanecem verdes;
- a atualização e recarga offline da PWA permanecem verdes;
- o diff não contém alterações em `docs/_decisoes/SUGESTOES_AUTONOMAS_2026-06-16.md`.

## Fora do escopo

- alteração dos temas Alvorada ou Vereda;
- ajuste de cores, tipografia, espaçamento ou componentes;
- Tarefa 3 de mapeamento tela a tela;
- qualquer mudança em `.esc`, persistência, rotas, manuscritos ou engines de linguagem;
- remoção de branches, tags, backups ou registros históricos.

A pull request permanece em rascunho e não deve ser incorporada sem autorização explícita.
