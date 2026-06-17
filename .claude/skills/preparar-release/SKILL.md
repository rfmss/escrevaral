---
name: preparar-release
description: Preparar release PWA do Escrevaral depois de alteracoes em JS ou CSS, com bump deterministico de versao em index.html e service-worker.js.
---

# Preparar Release

Use este skill quando uma sessao alterar qualquer arquivo `.js` ou `.css`, quando houver preparacao de deploy, ou antes de um `git commit` com mudancas de interface, engine, dados carregados por script, PWA ou service worker.

## Regra Central

Toda alteracao em JS ou CSS exige:

- Atualizar todas as ocorrencias de `?v=YYYYMMDD-slug` em `index.html`.
- Atualizar `ASSET_VERSION` em `service-worker.js` para a mesma string.
- Incrementar `CACHE_NAME` em `service-worker.js`.
- Confirmar que os assets alterados continuam listados em `CORE_ASSETS` quando forem carregados pela pagina.

## Procedimento

1. Identificar a versao atual:

```bash
rg -n "ASSET_VERSION|CACHE_NAME|\\?v=" index.html service-worker.js
```

2. Escolher uma nova versao no formato `YYYYMMDD-slug`, curta e legivel. Exemplo: `20260617-nav02`.

3. Substituir a versao antiga em todos os assets versionados do `index.html`. A contagem esperada hoje e de 71 ocorrencias de `?v=`.

4. Atualizar no `service-worker.js`:

```js
const CACHE_NAME = "vereda-offline-vN";
const ASSET_VERSION = "YYYYMMDD-slug";
```

5. Rodar a verificacao deterministica:

```bash
scripts/check-version-bump.sh
```

6. Rodar os checks proporcionais ao tipo de mudanca:

```bash
python3 scripts/auditor-overflow-mobile.py
python3 scripts/auditor-console-errors.py
```

7. Conferir o diff final antes de encerrar:

```bash
git diff -- index.html service-worker.js
git status --short
```

## Cuidados

- Nao alterar `templates-data.json` sem pedido explicito.
- Nao inventar novo padrao de versao; manter `YYYYMMDD-slug`.
- Nao fazer bump parcial: `index.html`, `ASSET_VERSION` e `CACHE_NAME` precisam andar juntos.
- Nao fazer push sem pedido explicito do usuario no turno atual.
