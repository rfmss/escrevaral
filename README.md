# Cofre de engines — Escrevaral

Backup preparado para permitir um recomeço do produto sem perder o trabalho linguístico e documental.

## Snapshots

1. `01-main-legada-pre-merge` — a `main` anterior à promoção da nova aplicação.
   SHA: `a09a743082984de997800647ab6dfe3c448f81f6`
2. `02-nosso-experimento-pr155` — a cabeça do nosso Escrevaral imediatamente antes do merge do PR #155.
   SHA: `a029cc4fea0dd7dd4524f553031667f7ff9a0c06`
3. `03-main-atual-pos-merge` — cópia de segurança da `main` já consolidada após o merge.
   SHA: `6cd6fa8b230b60c14beaa9db581e06f85117bd16`

## O que entrou

- todas as engines JavaScript da raiz (`*-engine.js`);
- todo `mass-notes-next/src/engines/**` nos snapshots que possuem a aplicação nova, incluindo adapters, supplements e morfologia verbal;
- arquivos `*-data.json` da raiz;
- `js/data/**` e `synonyms/**`, porque várias engines antigas dependem desses dados;
- `META_ENGINES_100.md`, quando presente;
- um `MANIFEST.txt` por snapshot com a lista exata dos arquivos e o SHA de origem.

Não foram incluídos layout, CSS, componentes React, deploy, CI ou páginas do produto. Este ZIP é deliberadamente um cofre de lógica de engines e seus dados de apoio mais diretos.
