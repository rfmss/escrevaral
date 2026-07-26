# Contraste dos tokens de texto — 2026-07-26

## Estado

Decisão aprovada para a Tarefa 1 da frente de Design System.

Este registro trata somente do ajuste de contraste de texto secundário no tema Vereda e da criação de uma barreira automática contra regressões. Não inicia a migração ampla de telas para os novos componentes ou tokens semânticos.

## Problema confirmado

No tema escuro, cujo identificador técnico permanece `scriptorium`, o token legado `--muted: #a69580` atingia apenas `4,52:1` sobre `--surface-high: #3a2e28`.

O valor cumpria por margem mínima o requisito WCAG AA de `4,5:1`, mas não oferecia folga suficiente para variações futuras de superfície, renderização ou reorganização dos componentes.

## Decisão cromática

O token passa de:

```css
--muted: #a69580;
```

para:

```css
--muted: #b7a996;
```

A alteração preserva a família de bege quente já usada por Vereda. Somente a luminância foi elevada; não houve mudança de papel cromático, saturação de destaque ou hierarquia funcional.

## Contraste recalculado em Vereda

| Superfície prevista | Hex da superfície | Contraste anterior | Contraste novo |
| --- | --- | ---: | ---: |
| `--paper` | `#130f0d` | `6,56:1` | `8,29:1` |
| `--surface` | `#1a1411` | `6,28:1` | `7,92:1` |
| `--surface-low` | `#1e1814` | `6,05:1` | `7,63:1` |
| `--surface-mid` | `#261e1a` | `5,64:1` | `7,12:1` |
| `--surface-high` | `#3a2e28` | `4,52:1` | `5,70:1` |
| `--card` | `#1c1814` | `6,08:1` | `7,67:1` |

O pior caso previsto passa de `4,52:1` para `5,70:1`, acima da margem mínima interna de `5,5:1` definida para `text-muted` em Vereda.

Como referência adicional, o novo valor alcança `6,61:1` sobre `--tip-bg: #2e2418`. Essa combinação não integra a matriz obrigatória de `text-muted`, pois caixas de aviso usam o par próprio `--tip-ink`/`--tip-bg`.

## Auditor permanente

Foi criado `scripts/auditor-design-tokens-contrast.py`.

Enquanto a Fase 4 não migra os nomes físicos do CSS, o auditor usa o seguinte mapa de compatibilidade entre os papéis aprovados e os tokens legados atuais:

| Papel semântico | Token físico atual |
| --- | --- |
| `text-primary` | `--ink` |
| `text-secondary` | `--soft-ink` |
| `text-muted` | `--muted` |
| `text-callout` | `--tip-ink` |
| `text-on-accent` | `--on-primary` |

O auditor lê diretamente `css/00-tokens.css`, calcula luminância relativa e contraste pela fórmula WCAG e encerra com código diferente de zero quando qualquer combinação prevista fica abaixo do limite.

Limites atuais:

- texto comum: mínimo `4,5:1`;
- `text-muted` de Vereda: mínimo interno `5,5:1` em todas as seis superfícies-base;
- `text-muted` de Alvorada: mínimo `4,5:1` nas superfícies em que seu uso está previsto hoje (`--paper`, `--surface`, `--surface-low` e `--card`).

`--surface-mid` e `--surface-high` de Alvorada não foram adicionadas artificialmente à matriz de `text-muted`. A Fase 3 deve confirmar uso real tela a tela antes de ampliar essa combinação ou alterar outro token aprovado.

O auditor foi integrado ao workflow `.github/workflows/a11y-focus-pr.yml`, que já é acionado por alterações em CSS. Assim, uma regressão futura passa a quebrar o gate da pull request.

## Distribuição offline

Como `css/00-tokens.css` é um asset distribuído e armazenado pelo PWA, a versão global precisa avançar para evitar que pessoas continuem recebendo a cor antiga do cache.

Alteração técnica autorizada neste lote:

- `ASSET_VERSION`: `20260726-lexical-hint-v1` → `20260726-text-muted-contrast-v1`;
- `CACHE_NAME`: `vereda-offline-v959` → `vereda-offline-v960`;
- alinhamento das referências versionadas em `index.html`, `service-worker.js` e `ui-dialog.js`.

Não houve mudança na lista de assets, estratégia de instalação, ativação, busca, rotas, escopo ou política de descarte do service worker.

## Fora do escopo

- remoção de `cerrado-dark`, `mata-dark` e `amazonia-dark`, reservada à Tarefa 2;
- mapeamento de divergências por tela, reservado à Tarefa 3;
- migração para `TextStatistic`, `ActionButton` ou demais tokens, reservada à Tarefa 4;
- alteração das cores fixas do Objeto Livro;
- qualquer mudança em `.esc`, persistência, rotas, manuscritos ou comportamento funcional.

## Verificação

Comandos mínimos:

```bash
python3 -m py_compile scripts/auditor-design-tokens-contrast.py
python3 scripts/auditor-design-tokens-contrast.py
python3 scripts/auditor-asset-version.py
git diff --check
```

A pull request permanece em rascunho e não deve ser incorporada sem autorização explícita.
