# Gate 10.5 — Fronteiras de distribuição

Data: 2026-07-29

## Objetivo

Eliminar a falha global de coerência de versões sem criar uma versão pública falsa e sem enfraquecer a proteção dos assets realmente servidos pela aplicação raiz.

## Diagnóstico

O workflow `Coerência de versões dos arquivos` executava `scripts/auditor-asset-version.py`. O auditor classificava todo arquivo `.js` ou `.css` do monorepo como parte da distribuição pública.

O PR do Mass Notes adicionou JS e CSS exclusivamente em `mass-notes-next/`, uma aplicação Vite com build, bundles hashados, branch de preview e smoke público próprios. Esses arquivos não são referenciados por `index.html` nem armazenados pelo service worker da aplicação pública.

A falha original foi:

```text
JavaScript ou CSS mudou sem nova versão global: mass-notes-next/src/styles/...
```

A comparação `main...experiment/mass-notes-tiptap` confirmou que todos os JS/CSS alterados pelo PR pertenciam ao subprojeto isolado.

## Decisão

Não avançar `ASSET_VERSION`, `CACHE_NAME` ou tags da aplicação pública por alterações exclusivas do Mass Notes.

Em vez disso, explicitar a fronteira:

- distribuição pública raiz;
- aplicação Vite isolada `mass-notes-next/`.

## Implementação

### Auditor

`scripts/auditor-asset-version.py` recebeu:

- `DISTRIBUTION_EXCLUDED_PREFIXES`;
- exclusão explícita de `reports/` e `mass-notes-next/`;
- função testável `is_public_distributed_asset(path)`;
- mensagem de falha que nomeia JS/CSS público;
- saída `arquivos_publicos_alterados`.

O filtro continua exigindo versão global para qualquer `.js` ou `.css` fora dos prefixos isolados.

### Workflow

`.github/workflows/asset-version-pr.yml` recebeu:

- exclusão `!mass-notes-next/**` depois dos padrões positivos de JS/CSS;
- gatilho explícito para o novo teste;
- etapa `Testar fronteira da distribuição pública` antes da auditoria real.

### Regressões

`scripts/test-auditor-asset-version.py` cobre:

1. assets públicos raiz e aninhados que exigem versão global;
2. assets de `mass-notes-next/` que pertencem ao pipeline isolado;
3. relatórios e fontes não distribuídas que não entram no contrato público.

## Garantias preservadas

- `index.html` continua exigindo uma única versão em todas as referências;
- `ASSET_VERSION` continua alinhado ao índice;
- `CACHE_NAME` continua obrigado a avançar quando a versão pública muda;
- `ui-dialog.js` continua alinhado ao controlador lexical;
- PR misto continua falhando se qualquer asset público real mudar sem versão;
- nenhuma tag ou versão é criada automaticamente para satisfazer CI;
- `main`, aplicação pública e service worker não foram modificados neste gate.

## Evidência funcional

Cabeça funcional: `572af55fc19b59e2c9c9330ce35ccf95be622074`.

- coerência de versões `30430515120`: verde;
- três regressões Python: verdes;
- versão pública preservada: `20260727-rimas-actionbutton-v1`;
- cache preservado: `v969`;
- assets públicos alterados: `0`;
- candidata Argila `30430515008`: verde;
- Mass Notes `30430515420`: build, 182/182, publicação, cache e smoke público verdes.

## Organização e retomada

Esta decisão integra a documentação permanente porque o repositório possui mais de uma superfície distribuída. Uma nova aplicação isolada só pode entrar na lista de exclusões quando possuir:

- diretório próprio;
- pipeline de build próprio;
- estratégia de cache própria;
- publicação ou artefato próprio;
- teste que preserve a fronteira.

Não adicionar exclusões genéricas como `src/`, `public/` ou `apps/` sem contrato explícito.

## Próximo passo

Com os três checks verdes, o próximo lote lógico é o Gate 11 — organização da biblioteca. Antes do código, inventariar estado, favorito, tags, busca, datas e comportamento atual de seleção do documento.
