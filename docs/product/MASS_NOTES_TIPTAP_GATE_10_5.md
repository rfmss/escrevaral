# Mass Notes Tiptap — Gate 10.5

## Decisão

O Mass Notes Next é uma aplicação distribuída separadamente da aplicação pública raiz. Mudanças exclusivas em `mass-notes-next/` não exigem avanço da versão global usada por `index.html` e `service-worker.js`.

## Motivo

A aplicação pública e o Mass Notes possuem contratos de distribuição diferentes:

### Aplicação pública raiz

- entrada em `index.html`;
- assets JavaScript e CSS referenciados por query string versionada;
- cache offline controlado por `service-worker.js`;
- `ASSET_VERSION` e `CACHE_NAME` globais;
- auditoria por comparação com a branch-base.

### Mass Notes Next

- fonte em `mass-notes-next/`;
- build Vite independente;
- bundles com hash;
- workflow `Mass Notes Tiptap`;
- preview publicada em branch própria;
- renovação de cache e verificação pública próprias.

Misturar essas superfícies obrigava uma versão pública nova mesmo quando nenhum asset público havia mudado.

## Contrato do auditor

`scripts/auditor-asset-version.py` deve:

- considerar público todo `.js` ou `.css` fora dos prefixos isolados explícitos;
- ignorar `reports/`;
- ignorar `mass-notes-next/`;
- bloquear mudanças públicas sem nova versão global;
- bloquear nova versão global sem avanço do cache;
- verificar alinhamento entre índice, service worker e controlador lexical.

A exclusão vale também em PRs mistos: somente arquivos do prefixo isolado são removidos da análise. Qualquer asset público real continua sujeito ao contrato global.

## Contrato do workflow

`.github/workflows/asset-version-pr.yml` deve:

- não disparar por mudança exclusiva em `mass-notes-next/**`;
- disparar quando o auditor, seu teste ou o próprio workflow mudar;
- executar regressões da fronteira antes da auditoria real;
- manter permissões somente de leitura;
- não criar versões, caches ou tags automaticamente.

## Testes obrigatórios

A fronteira precisa provar pelo menos:

1. JS/CSS público raiz exige versão;
2. JS/CSS público aninhado exige versão;
3. JS/CSS do Mass Notes não pertence à distribuição pública;
4. relatórios não pertencem à distribuição pública;
5. fontes não JavaScript/CSS não entram no cálculo.

## Regra para novas aplicações isoladas

Um novo prefixo só pode ser excluído quando a superfície possuir:

- entrada e diretório próprios;
- build próprio;
- estratégia de cache própria;
- publicação ou artefato próprio;
- CI própria;
- teste de fronteira;
- documentação do contrato.

Não são permitidas exclusões amplas apenas para fazer a CI passar.

## Evidência

Cabeça funcional `572af55fc19b59e2c9c9330ce35ccf95be622074`:

- workflow de coerência `30430515120`: verde;
- três regressões Python: verdes;
- versão pública `20260727-rimas-actionbutton-v1` preservada;
- cache público `v969` preservado;
- zero assets públicos alterados;
- candidata Argila `30430515008`: verde;
- Mass Notes `30430515420`: 182/182 e preview pública verde.

## Consequência

O repositório volta a ter todos os checks relevantes verdes sem falsificar uma release pública. O próximo gate de produto é o Gate 11 — organização da biblioteca.
