# Decisão — cache de instalação + fontes locais (2026-09-13)

## Contexto

Auditoria do Astra (`supervisao/cache-offline-produto`, PIN `816ca7ea`) demonstrou um
bloqueio: ao subir a versão do cache (v971 → v972), a instalação do `service-worker.js`
via `cache.addAll(["./", "./index.html"])` podia gravar **HTML antigo na estante nova**
(o cache HTTP heurístico não é invalidado por outra estante de Cache Storage), entregando
versão velha no modo sem internet. Havia também erros de console de dois recursos externos
(Google Fonts e GoatCounter) no modo sem internet.

Parecer do Astra: **bump: NÃO** enquanto o bloqueio estiver aberto. Valores candidatos
confirmados: `ASSET_VERSION="20260913-capsulas-m4-v1"`, `CACHE_NAME="vereda-offline-v972"`.

## Decisões do dono

1. **Corrigir a instalação do cache** com `cache: "reload"` no documento obrigatório
   (`./` e `./index.html`) + **guarda de versão**: se o HTML gravado não contiver
   `?v=` da `ASSET_VERSION` atual, a instalação é **abortada** (nenhum usuário recebe
   versão velha em estante nova).
2. **Auto-hospedar as fontes** (Libre Franklin 300–700 e Literata 300–600, variáveis,
   latin + latin-ext, licença OFL) em `fonts/`, removendo a dependência de
   `fonts.googleapis.com` do `index.html`.
3. **Remover o GoatCounter do fluxo**: a injeção de `gc.zgo.at/count.js` foi retirada do
   `index.html`; as chamadas guardadas em `app.js` ficam inertes (nenhum erro).

## Implementação

- `service-worker.js`: `install` revalida `./` + `./index.html` com `{ cache: "reload" }`
  e aborta sem `?v=${ASSET_VERSION}` no HTML; novos ativos adicionados ao `CORE_ASSETS`
  (`css/fonts-locais.css`, `fonts/lf-*.woff2`, `fonts/literata-*.woff2`).
- `index.html`: troca dos dois links do Google Fonts pelo `css/fonts-locais.css`; remoção
  do bloco de injeção do contador de visitas.
- `css/fonts-locais.css` + 4 woff2 + 2 licenças OFL novos.
- **Nada de bump neste commit**: `ASSET_VERSION`/`CACHE_NAME` permanecem
  `20260801-lexical-algures-outrora-v1`/`vereda-offline-v971` (bump só na entrega das
  cápsulas, após re-auditoria). `state-store.js` e `templates-data.json` intocados.

## Verificação (chromium local, 13/09/2026)

- **Sem bump**: cache `vereda-offline-v971` populado; HTML no cache contém o token atual;
  zero pedidos a `fonts.googleapis.com`/`gc.zgo.at`; fontes locais pré-cacheadas e
  aplicadas (`document.fonts.check` OK); zero `pageerror`; recarga sem rede funciona.
- **Upgrade simulado v971→v972** (troca do docroot mantendo a mesma origem): v972 criado
  com **HTML novo** (`?v=20260913-capsulas-m4-v1`), v971 podado na ativação, recarga sem
  rede serve a versão nova. Bloqueio do Astra encerrado na contraprova.
- `scripts/auditor-asset-version.py`: **aprovado** no estado sem-bump (78 refs, v971) e na
  simulação do bump (78 refs, `20260913-capsulas-m4-v1`, v972).

## Próxima ação

Devolver ao Astra para re-auditoria do ciclo com a exigência: HTML novo em v972, versão
velha ausente após estabilização, escrita/leitura offline e dados locais intactos. Com o
parecer **bump: SIM**, liberar o bump + integração das cápsulas (sem novas features).