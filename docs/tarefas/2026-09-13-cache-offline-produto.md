# Tarefa Astra — auditoria de cache/versão do produto (pré-cápsulas) · 2026-09-13

Emissor: dono (via Cofre). Destinatário: **Astra**. Data: 2026-09-13.
Ciclo M4 encerrado (PR #165 MERGED em `encore` `18ccd81c`). Esta é tarefa da **supervisão do
produto real**, antes de levar as cápsulas ao ar.

## Objetivo (uma frase)

Verificar que o mecanismo de versão + cache do site publicado **atualiza de forma limpa** e
**continua funcionando sem internet**, e estampar o **bump exato** que a entrega das cápsulas
usará — sem tocar no produto, sem push, sem merge.

## Objeto auditado — PIN correto (importante)

Repo **`escrevaral`** (produto real): `github.com/rfmss/escrevaral`, branch **`main`**,
commit pinado **`816ca7ea2140f49b93a5bfaeabd0b898871760e5`** ("Create CNAME") — é o estado
**publicado** (escrevaral.com).

**NÃO** use a árvore local do dono (`/home/rafamass/projetos/escrevaral`): ela está **1545
commits atrás** do `origin/main` e tem mudanças não commitadas (`academia-controller.js`,
`css/00-tokens.css`). Conciliação local↔remota é **decisão do dono**. Se essa diferença
atritar com alguma verificação, reporte como observação — não tente resolver.

## Fatos já verificados pelo dono (conferir, não presumir OK)

- `index.html`: **77** ocorrências `?v=20260801-lexical-algures-outrora-v1`, todas idênticas.
- `service-worker.js`: `CACHE_NAME = "vereda-offline-v971"`,
  `ASSET_VERSION = "20260801-lexical-algures-outrora-v1"`.
- `CORE_ASSETS`: todos os caminhos existem no commit; `sounds/` é diretório e os 3 `.wav`
  listados existem (`sounds/typewriter.wav`, `sounds/backspace.wav`, `sounds/Enter.wav`).
- SW: `install` → `cache.addAll(["./","index.html"])` obrigatório + CORE_ASSETS via
  `Promise.allSettled` (best-effort) + `skipWaiting()`; `activate` → prune de estantes
  `vereda-offline-*` antigas + `clients.claim()`; `fetch` → só GET; `navigate`
  network-first com fallback em `./index.html` e `cache.put` do clone fresco; demais GET
  cache-first com put de runtime. Código em `./service-worker.js`.
- Registro do SW: `backup-controller.js` (`register("./service-worker.js")`), banner de
  atualização via `controllerchange`, e `_checkCacheHealth()`.
- Há auditor de ciclo offline pronto: `scripts/auditor-mesa-portatil.py` (playwright sync;
  termos, service worker ready, `clients.claim`, ciclo sem rede).

## Tarefa

1. **Reconferir os fatos** acima no commit pinado (leitura; confira SHA antes).
2. **Reproduzir o ciclo de cache + offline em ambiente limpo** (servidor local
   `python3 -m http.server` + chromium/playwright), a partir do snapshot do commit pinado.
   Prefira `scripts/auditor-mesa-portatil.py`; só altera esse script se necessário
   (nunca o produto). Se uma etapa falhar, registre o **comando exato + saída** da falha.
3. **Cenários a validar:**
   a. Primeiro acesso **online**: estante v971 populada (documento + recursos opcionais).
   b. Recarga **online**: nenhum erro de console; SW novo não assume antes da troca de
      versão; banner de atualização aparece quando há worker instalado.
   c. **Nova versão simulada** (em **branch de teste**, nunca em `main`): troque
      `ASSET_VERSION` (formato `YYYYMMDD-slug`) e `CACHE_NAME` (incremente `vN`), atualize
      as tags `?v=` correspondentes no `index.html`; novo SW instala → `skipWaiting` →
      `activate` **prune** remove a estante velha; site segue funcionando.
   d. **Sem rede** (mock offline): site abre e as principais funções de escrita/leitura
      respondem sem erros de console; HTML servido do cache (a rede não pode ser alcançada).
   e. **Dados locais intactos** após a ativação da nova versão (localStorage/IndexedDB do
      escritor não podem sumir com o prune).
4. **Bump recomendado:** dizer o valor EXATO que a entrega das cápsulas deve usar,
   justificando. Ponto de partida (validar/ajustar): `ASSET_VERSION = "20260913-<slug>"`,
   `CACHE_NAME = "vereda-offline-v972"`. Conferir que o conjunto `?v=` fica 100% coerente.
5. **Convenção do produto a respeitar na análise** (CLAUDE.md do escrevaral): toda mudança
   JS/CSS exige bump `?v=YYYYMMDD-slug` + `ASSET_VERSION` + `CACHE_NAME`. Não use
   estrangeirismos na interface; não mexa em `state-store.js`; não altere
   `templates-data.json`.

## Regras da resposta (iguais ao handshake M4)

- Aplique `docs/11-sistema-supervisao-cognitiva.md` (regra-mãe); termine com
  **próxima ação concreta**.
- **Estado verdadeiro é o persistido**: parecer + evidência em **commit/doc no repo** (não
  só na conversa).
- **NÃO fazer push**, **NÃO mergear**, **NÃO tocar `main`**, **NÃO editar o produto** além
  do script de auditoria. O dono decide e ordena.
- Emita **parecer de bump: sim/não + argumento**, lista do que foi medido (SHA, versões,
  comandos, saídas) e **próxima ação concreta** (o que falta para levar as cápsulas).

## Ambiente

Snapshots do GitHub ficam em `/tmp/opencode/qa` (playwright-core já usado na revisão M4).
Node v24.19.0, python3 disponível. Suba o site local antes de qualquer teste de rede mock.
## RODADA 2 — fix aplicado (resposta ao seu parecer "bump: NÃO")

Seu parecer apontou o bloqueio: `install` copiava o documento antigo para a estante nova
(cache HTTP heurístico não invalidado por estante de Cache Storage) e 8 erros de console de
recursos externos. O dono decidiu e aplicou em
`github.com/rfmss/escrevaral`, branch **`fix/cache-install-fonte-local`** (base = PIN
`816ca7ea`, HEAD **`53cd66b7`**, sem tocarmos `main`):

1. **Revalidação do documento na instalação** (`service-worker.js`): `./` e `./index.html`
   buscados com `{ cache: "reload" }`; **guarda de versão** aborta a instalação se o HTML
   gravado não contiver `?v=` da `ASSET_VERSION` atual. Contraprova (chromium, upgrade
   v971→v972 com troca de docroot na mesma origem): v972 nasce com **HTML novo**, v971 é
   podado na ativação, e sem rede serve a versão nova.
2. **Fontes auto-hospedadas** (`fonts/`): Libre Franklin 300–700 e Literata 300–600
   variáveis (latin + latin-ext, OFL), `css/fonts-locais.css`; Google Fonts removido do
   `index.html`.
3. **GoatCounter removido do fluxo**: injeção de `gc.zgo.at/count.js` eliminada do
   `index.html`; chamadas guardadas em `app.js` ficam inertes.

Pré-checagem do dono: `pageerrors: 0`, zero pedidos a `fonts.googleapis.com`/`gc.zgo.at`,
`document.fonts.check` OK (Libre Franklin e Literata), offline recarrega sem erro, e
`scripts/auditor-asset-version.py` **aprovado** no estado sem-bump (78 refs, v971) e na
simulação do bump (78 refs, `20260913-capsulas-m4-v1`, v972).

## Re-auditoria pedida (repetir o ciclo na branch de fix)

- Rodar o `scripts/auditor-mesa-portatil.py` e o diagnóstico contra a branch de fix.
- Repetir o upgrade v971→v972 (bump simulado, como antes) e exigir: **HTML novo em v972 com
  77 tags novas; versão velha ausente após estabilização; escrita/leitura offline e dados
  locais intactos**.
- Console: exigir **zero erros** (fontes locais e contador fora do fluxo).
- Guarda de versão: confirme que a instalação **aborta** (worker antigo permanece) quando o
  HTML servido não contém o token da `ASSET_VERSION` — cenário de rede ambíguo.
- Persistir parecer + evidência em commit/doc; **não mergear** — dono ordena.
