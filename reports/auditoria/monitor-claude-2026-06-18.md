# Monitor de Auditoria Claude - 2026-06-18

Alvo: acompanhar a sessao ativa do Claude, revisar alteracoes assim que aparecerem e devolver achados acionaveis.

Inicio: `2026-06-18 19:37:30 -03`
Baseline git: `ea37fd0` / `origin/main` - `auditoria: malha v781 linguagem visual offline privacidade`

## Prompt operacional usado

Monitore o trabalho do Claude como auditor tecnico do Escrevaral. A cada nova alteracao, compare contra o baseline, classifique risco por P0/P1/P2, valide se a correcao realmente fecha o problema relatado, procure regressao em linguagem, navegacao, visual, offline e privacidade, e registre evidencia objetiva. Nao reverta trabalho alheio. Diferencie ruído de ambiente de mudanca de produto. Ao final, deixe um relatorio que o Claude consiga acolher sem precisar reconstruir o contexto.

## Ruido conhecido no baseline

Arquivos untracked ja existentes antes do monitoramento:

- `.agents/awake-ides/`
- `.agents/sentinel-auto/`
- `reports/auditoria/contraste-dom-2026-06-17.json`
- `reports/auditoria/contraste-dom-2026-06-17.md`
- `scripts/awake-while-ides-daemon.sh`
- `scripts/awake-while-ides.py`
- `scripts/awake-while-ides.sh`
- `scripts/sentinel-while-devin-daemon.sh`
- `scripts/sentinel-while-devin.py`
- `scripts/sentinel-while-devin.sh`
- `scripts/systemd/`

Esses itens nao devem ser tratados como alteracao nova da sessao sem evidencia adicional.

## Focos de revisao

- Sintaxe/morfologia: `a` artigo vs preposicao por posicao, adjetivo adnominal (`O caminho estreito acabou.`), verbos flexionados/acentuados/cliticos, substantivos no inicio de periodo.
- Visual/navegacao: overflows mobile, `Plano` no dock/bandeja mobile, abas do Atelie, rotas de sitemap, console/rede.
- Publicacao/offline: manifest, service worker, cache, OG/Twitter/social, assets 404.
- Privacidade/rede: vazamento de texto/canary, chamadas externas novas, CSP/permissoes.
- Dados linguisticos: duplicatas, colisoes verbo/adjetivo/substantivo, taxonomia de grammarWords, decolonial e sinonimos.

## Checkpoints

### 19:37 - Baseline

Estado:

- `main` e `origin/main` alinhados em `ea37fd0`.
- Nenhuma modificacao versionada pendente.
- Somente ruído untracked conhecido listado acima.

Achados:

- Sem P0/P1/P2 novos neste checkpoint.

### 19:42 - Revisao da primeira leva Claude

Arquivos observados:

- `synonym-data.js`
- `lexical-data.json`
- `norma-data.json`
- `decolonial-data.json`
- `rimalab-data.json`
- `anatomia-do-livro.html`
- relatorios regenerados: `dados-linguisticos-2026-06-18.*`, `publicacao-offline-2026-06-18.*`

Validacoes executadas:

- `node --check synonym-data.js`: OK.
- `python3 -m json.tool lexical-data.json`: OK.
- `python3 -m json.tool norma-data.json`: OK.
- `python3 -m json.tool decolonial-data.json`: OK.
- `python3 -m json.tool rimalab-data.json`: OK.
- `python3 scripts/auditor-dados.py`: `P0=1 P1=5 P2=0`.
- `python3 scripts/auditor-publicacao.py`: `P0=0 P1=1 P2=5` em producao.

Correcoes aceitas:

- `synonym-data.js`: removeu repeticoes internas em `criticar` e `aberto`.
- `synonym-data.js`: consolidou chaves duplicadas de `lealdade`, `escolha`, `descoberta` e `partida`, preservando os sinonimos relevantes na primeira entrada.
- `lexical-data.json`: removeu `estreito`, `estreita`, `partido` e `larga` de `functionWords.adjetivos_comuns`, eliminando o P0 de colisao exata verbo/adjetivo nessa base.
- `norma-data.json`: removeu `estranha`, `estranho` e `inquieta` de `adjetivos_comuns`, eliminando o P0 de colisao com presente verbal regular nessa base.
- `decolonial-data.json`: preencheu alternativas vazias de `boiola`, `viadagem` e `sapatona como insulto`; o P1 automatico de alternativa vazia saiu.
- `anatomia-do-livro.html`: trocou `og-anatomia-do-livro.png` ausente por `icons/og-banner.png`; o asset local existe e mede `1200 x 630`.

P0 remanescente:

- `syntax-engine.js/ADJETIVOS_PRIM`: `larga` segue dentro de `ADJETIVOS_PRIM` e tambem e forma verbal exata.
  - Evidencia: `grep` mostrou `ADJETIVOS_PRIM` com `"largo","larga","largos","largas"` e a regra de adjetivo ainda vem logo depois do bloco de verbo contextual.
  - Risco: falso positivo em frases do tipo `Ele larga o livro.` se o caminho contextual nao cobrir todos os pontos de entrada.
  - Aceite: `python3 scripts/auditor-dados.py` precisa chegar a `P0=0`.

P1/P2 de auditoria humana:

- `rimalab-data.json`: as abreviaturas `adj`, `s`, `pron` foram expandidas, mas com inicial maiuscula (`Adjetivo`, `Substantivo`, `Pronome`), enquanto `rimalab-engine.js` e a maior parte da base usam minusculas (`adjetivo`, `substantivo`, `verbo`). O auditor automatico zera P2 porque normaliza acentos/caixa, mas o engine compara classes por igualdade literal em `classifyRhyme`. Recomendo padronizar para minusculas.
  - Evidencia adicional: chamada local da API retornou `real / ideal => Adjetivo / Adjetivo / pobre` e `local / animal => Substantivo / Substantivo / pobre`; a classificacao desse par nao quebrou, mas a API passa a expor labels com caixa diferente da maior parte do dicionario.
- `decolonial-data.json`: em `viadagem`, `não use como julgamento` e uma orientacao, nao uma alternativa lexical; em `sapatona como insulto`, `gay` pode ser amplo/impreciso para contexto lesbico. Nao bloqueia sintaxe, mas merece ajuste editorial.
- `auditor-publicacao.py` ainda reporta o OG antigo porque audita producao (`https://escrevaral.com`), nao o HTML local. A correcao local parece correta, mas o aceite so ficara verde depois de deploy.

### 19:48 - Revisao visual local das trilhas

Arquivos observados:

- `vereda-biblioteca-escrita.html`
- `vereda-primeiras-linhas.html`
- `vereda-titulo-do-livro.html`

Validacao executada:

- Servidor local temporario: `http://127.0.0.1:4173`.
- `ESCREVARAL_AUDIT_URL=http://127.0.0.1:4173 python3 scripts/auditor-navegacao-visual.py`
- Resultado: `P0=0 P1=20 P2=78`.

Correcoes aceitas:

- `vereda-primeiras-linhas.html`: footer/CTA final saiu de grid inline fixo para `.trilha-footer-grid` com uma coluna em `max-width: 600px`. O overflow P0 da trilha nao reapareceu no auditor local.
- `vereda-titulo-do-livro.html`: mesmo ajuste no footer/CTA final; overflow P0 da trilha nao reapareceu no auditor local.
- `vereda-biblioteca-escrita.html`: `.topbar-tabs` ganhou rolagem horizontal e a pagina nao gera mais P0 de `scrollWidth`.

P1 remanescentes:

- `vereda-biblioteca-escrita.html`: o botao `Sobre` ainda aparece parcialmente fora do viewport mobile (`350..406` em viewport `390`). Como a barra agora rola horizontalmente e esconde scrollbar, o problema deixou de ser P0, mas segue P1 por affordance ruim.
- App mobile: `cronograma`/`Plano` segue sem controle visivel direto no dock mobile.
- App Academia mobile: aba `Vocabulário` ainda escapa (`271..410`).

Ressalva:

- As trilhas adicionaram `html { overflow-x: hidden; }`. O auditor mede `scrollWidth`, entao nao parece ser apenas mascara neste ponto, mas a regra pode esconder futuras quebras. Preferivel corrigir causas estruturais sempre que o elemento exato for identificavel.

### 19:50 - Novo baseline v782 em producao git

Estado:

- Claude fez push durante a sessao.
- `HEAD` e `origin/main`: `82872f6` - `v782 — P0/P1 dados e overflow: sinônimos, homógrafos, OG 404, trilhas mobile`.
- Commit anterior tambem entrou: `f6fca4f` - `relatório: guarda de regressão + auditores 2026-06-18`.

Resumo do `v782`:

- Inclui `anatomia-do-livro.html`, `decolonial-data.json`, `lexical-data.json`, `norma-data.json`, `rimalab-data.json`, `synonym-data.js`, `vereda-biblioteca-escrita.html`, `vereda-primeiras-linhas.html`, `vereda-titulo-do-livro.html`, `index.html` e `service-worker.js`.
- O patch visual que eu havia auditado localmente agora esta commitado.
- A correcao de OG/social tambem esta commitada.

Auditoria apos `v782`:

- `python3 scripts/auditor-dados.py`: `P0=1 P1=4 P2=0`.
- `python3 scripts/auditor-publicacao.py`: `P0=0 P1=0 P2=5` em producao; o P1 do OG ausente caiu apos deploy.
- P0 remanescente segue igual: `syntax-engine.js/ADJETIVOS_PRIM` contem `larga` como adjetivo primitivo e forma verbal exata.
- O P1 de sinonimos normalizados saiu do relatorio automatico depois da nova consolidacao/expansao em `synonym-data.js`.

Mudancas ainda uncommitted acima de `v782`:

- `synonym-data.js`: expande entradas sem acento e remove equivalentes acentuados duplicados (`angustia/angústia`, `perdao/perdão`, `crianca/criança`, `oficio/ofício` etc.).
- `norma-data.json`: parece reordenar/adensar `adjetivos_comuns`, movendo itens que estavam no final para posicao alfabetica; precisa manter vigilancia porque `contido`, `oculto` e `preso` continuam P1 de colisao com particípio/adjetivo.
- Relatorios foram regenerados por auditoria local: `dados-linguisticos`, `navegacao-visual`, `publicacao-offline`.

### 19:53 - Revisao da leva v783 em aberto

Arquivos observados:

- `decolonial-data.json`
- `index.html`
- `service-worker.js`
- `synonym-data.js`
- `norma-data.json`

Validacoes executadas:

- `python3 -m json.tool decolonial-data.json`: OK.
- `python3 scripts/auditor-dados.py`: `P0=1 P1=4 P2=0`.
- `node --check synonym-data.js`: OK.
- `git diff --check`: OK apos limpar whitespace em relatorios gerados.

Correcoes/alteracoes aceitas:

- `index.html` e `service-worker.js`: bump coerente de cache/querystring para `20260618-v783` e `vereda-offline-v783`.
- `decolonial-data.json`: expansão de cerca de 20 entradas em genero, classe, povos, territorio, estetica, linguagem, deficiencia, relacoes e conhecimento. JSON valido.
- `synonym-data.js`: continua a consolidacao de duplicatas normalizadas por acento; o P1 automatico de sinonimos normalizados nao voltou.

P1 novo de auditoria humana:

- `decolonial-data.json`: `avoid: "normal"` com `contextual: false` tem alto risco de falso positivo. O engine casa palavra inteira por regex e `detectText` nao usa `contextual` para reduzir alerta; portanto frases neutras como "dia normal", "ritmo normal" e "formato normal" podem ser marcadas como capacitismo.
  - Recomendacao: trocar para expressoes mais especificas (`pessoa normal`, `aluno normal`, `corpo normal`, `criança normal`) ou marcar como contextual e ajustar UI para explicar contexto antes de alertar.

### 19:55 - Pos-commit v783

Estado:

- `HEAD` e `origin/main`: `3b254f1` - `v783 — dados: sinônimos dups norm, decolonial 581→600, adjetivos 1993→2000`.
- Arquivos de produto do v783 foram commitados; no worktree ficaram relatorios regenerados e o monitor.

Validacoes executadas:

- `python3 scripts/auditor-dados.py`: `P0=1 P1=4 P2=0`.
- `node --check synonym-data.js`: OK.
- `python3 scripts/auditor-publicacao.py`: `P0=0 P1=1 P2=5` em producao.

Achados:

- P0 de linguagem segue aberto: `syntax-engine.js/ADJETIVOS_PRIM` ainda contem `larga`.
- P1 de falso positivo decolonial segue aberto: `avoid: "normal"` continua amplo e `contextual: false`.
- P1 de publicacao/versionamento apareceu em producao: `index.html` publico ja usa `20260618-v783`, mas `/service-worker.js` sem query ainda vem do Cloudflare com `CACHE_NAME="vereda-offline-v782"` e `ASSET_VERSION="20260618-v782fix"`.
  - Evidencia: `curl https://escrevaral.com/` lista `20260618-v783`; `curl https://escrevaral.com/service-worker.js` retorna v782fix; `curl https://escrevaral.com/service-worker.js?v=20260618-v783` retorna v783.
  - Risco: `backup-controller.js` registra `./service-worker.js` sem query; usuarios podem receber o SW antigo ate a borda expirar/purgar.
  - Recomendacao: purgar Cloudflare para `/service-worker.js` ou versionar o registro do SW com query controlada.

### 20:05 - Pos-commit v785

Estado:

- `HEAD` e `origin/main`: `58e7778` - `v785 — rimalab grammarWords 348→407 (+59 novas, fix 38 categorias titlecase→minúsculo); META_ENGINES_100 atualizado ciclo v780→v784`.
- Arquivos alterados no commit: `META_ENGINES_100.md`, `rimalab-data.json`, `index.html`, `service-worker.js`.

Validacoes executadas:

- `python3 -m json.tool rimalab-data.json`: OK.
- `python3 scripts/auditor-dados.py`: `P0=1 P1=4 P2=0`.
- Contagem direta em `rimalab-data.json`: `grammarWords=407`.
- Distribuicao direta: `substantivo=224`, `adjetivo=105`, `verbo=47`, `advérbio=29`, `pronome=2`.
- `titlecase_classes=0`; a falha anterior `Adjetivo/Substantivo/Pronome` foi corrigida.
- `python3 scripts/auditor-publicacao.py`: `P0=0 P1=0 P2=5` em producao.
- `curl https://escrevaral.com/` e `curl https://escrevaral.com/service-worker.js`: ambos em `20260618-v785`; o desalinhamento v783/v782fix caiu.

Correcoes aceitas:

- A correcao de caixa do RimaLab esta aceita: `real / ideal` agora retorna `adjetivo / adjetivo / pobre`, sem label titlecase.
- `index.html` e `service-worker.js` estao coerentes em `20260618-v785` e `vereda-offline-v785`.

P1 novo de auditoria RimaLab:

- `rimalab-data.json` tem 126 chaves acentuadas em `grammarWords` sem alias sem acento. O `rimalab-engine.js` chama `normalizeWord(word)` antes do lookup, removendo acentos, mas `getGrammarWords()` retorna o objeto cru. Assim, entradas como `rítmico`, `trágico`, `lírico`, `efêmero`, `fértil`, `frágil`, `fênix`, `gênero`, `redenção` e `tensão` nao sao alcançadas pela tabela.
  - Evidencia: chamada local da API retornou `rítmico => substantivo`, `trágico => substantivo`, `lírico => substantivo`, `efêmero => substantivo`, `fértil => substantivo`, `frágil => substantivo`.
  - Risco: parte relevante das +59 entradas novas aumenta o contador, mas nao melhora a classificacao real quando a palavra tem acento e nao possui alias normalizado.
  - Recomendacao: construir indice normalizado em `rimalab-engine.js` ao carregar `grammarWords`, ou duplicar/gerar aliases sem acento no JSON. Preferencia tecnica: indice normalizado no engine, para nao duplicar dado.

P0/P1 ainda abertos:

- P0 de linguagem: `syntax-engine.js/ADJETIVOS_PRIM` ainda contem `larga`.
- P1 de falso positivo decolonial: `avoid: "normal"` segue amplo e `contextual: false`.

### 23:07 - Pos-commit v792

Estado:

- `HEAD` e `origin/main`: `848cc1d` - `v792 — sinônimos 1032→1053 (+21: política/social, identidades regionais, carinho); fluxo-atual atualizado v780→v791`.
- Commits analisados desde `v785`: `v786` a `v792`.
- Arquivos tocados no ciclo: `decolonial-engine.js`, `decolonial-data.json`, `lexical-data.json`, `scripts/auditor-dados.py`, `index.html`, `service-worker.js`, `voice-engine.js`, `analise-engine.js`, `norma-data.json`, `synonym-data.js`, `.agents/fluxo-atual.md`.

Validacoes executadas:

- `python3 scripts/auditor-dados.py`: `P0=0 P1=3 P2=0`.
- `python3 scripts/auditor-publicacao.py`: oscilou por cache; ultima execucao `P0=0 P1=1 P2=5`.
- `python3 scripts/auditor-privacidade-rede.py`: `P0=0 P1=1 P2=5`.
- `python3 scripts/auditor-navegacao-visual.py`: `P0=0 P1=21 P2=80`.
- `python3 scripts/auditoria-pilares.py`: verde.
- `python3 -m py_compile` nos auditores principais: OK.
- Probes diretos em `decolonial-engine.js`, `rimalab-engine.js` e `syntax-engine.js`.

Correcoes aceitas:

- Auditor de dados voltou sem P0. O antigo P0 de `ADJETIVOS_PRIM/larga` agora aparece como P1 mitigado.
- `Ele larga o livro.` retorna `larga: Verb` no `syntax-engine`.
- `decolonial-engine.js` normaliza texto e termo: `lingua pura` e `língua pura` alertam a mesma entrada.
- `normal` amplo saiu: `um dia normal de trabalho` nao alerta.
- `pessoa normal` segue contextual e alerta.
- `viadagem` tem alternativas lexicais (`viadagem:3` no probe).
- RimaLab acentuado foi corrigido: `rítmico`, `trágico`, `lírico`, `efêmero`, `fértil`, `frágil` retornam `adjetivo`.
- `Plano`/`cronograma` ficou acessivel no mobile: sumiu o P1 "destinos do app sem controle visivel/clicavel", e o auditor agora navega ate `mobile app-cronograma`.
- Contadores conferidos: `sinonym entries=1053`, `decolonial entries=606`, `grammarWords=407`, `adjetivos_comuns=2040`, `verbos_pres_reg=2045`, `CLIQUES_PT=1000`, `PLEONASMOS=527`.
- `voice-engine.js`: campo semantico `trabalho` presente, natureza expandida com biomas.

Achados remanescentes / novos:

- Morfologia contextual ainda nao esta 100%:
  - `A mesa larga caiu.` retorna `larga: Verb`; esperado: adjetivo adnominal.
  - `O caminho estreito acabou.` retorna `estreito: Verb`; esperado: adjetivo adnominal.
  - `Entreguei a carta a Maria.` retorna o primeiro `a` como `Preposition`; esperado: artigo/determinante antes de `carta`. O segundo `a` antes de `Maria` esta correto como preposicao.
- Publicacao/cache: `index.html` publico usa `20260618-v793`, mas `/service-worker.js` sem query pode responder `20260618-v792` por Cloudflare HIT; com `service-worker.js?v=20260618-v793` o arquivo vem correto.
  - Risco: `backup-controller.js` registra `./service-worker.js` sem query, entao parte dos usuarios pode receber SW antigo ate expirar/purgar cache.
  - Recomendacao: purgar `/service-worker.js` no Cloudflare ou versionar o registro do service worker com query controlada.
- Visual mobile novo depois de liberar `Plano`: `mobile app-cronograma` tem escape lateral em `button.crono-month-btn` / `Out` (`369..400` no viewport 390).
- P1 visuais antigos continuam: aba `Vocabulário` no Atelie mobile, `Sobre` na biblioteca mobile, statusbar possivelmente cortada e toolbar editorial desktop.
- Privacidade/rede segue com P1 estrutural antigo: CSP ausente.

### 23:10 - Pos-commit v793

Estado:

- Enquanto a auditoria do v792 rodava, Claude publicou `v793`.
- `HEAD` e `origin/main`: `b6d6602` - `v793 — RimaLab P0: _GW_IDX normalizado resolve 126 chaves acentuadas em grammarWords`.
- Arquivos alterados: `rimalab-engine.js`, `index.html`, `service-worker.js`.

Validacoes executadas:

- `python3 scripts/auditor-dados.py`: `P0=0 P1=3 P2=0`.
- Probe local RimaLab: `rítmico`, `trágico`, `lírico`, `efêmero`, `fértil`, `frágil` retornam `adjetivo`.
- `python3 scripts/auditor-publicacao.py`: `P0=0 P1=1 P2=5`.

Correcoes aceitas:

- O achado novo do v785/v792 sobre `grammarWords` acentuado foi fechado em codigo. `_GW_IDX` normalizado resolve lookup sem duplicar dados.

Achado remanescente:

- Cache de producao ainda desalinhado: `index.html` publico usa `20260618-v793`, mas `/service-worker.js` sem query ainda respondeu `CACHE_NAME="vereda-offline-v792"` / `ASSET_VERSION="20260618-v792"`.
  - Com cache-bust, o arquivo novo existe.
  - Recomendacao continua: purgar `/service-worker.js` no Cloudflare/GitHub Pages ou versionar o registro do service worker.

### 23:39 - Pos-commit v794

Estado:

- `HEAD`, tag `v794` e `origin/main`: `2eb1614` - `v794 — morfologia: adjetivos adnominais, artigo 'a', heatmap mobile`.
- Arquivos alterados: `syntax-engine.js`, `norma-data.json`, `css/04-cronograma.css`, `index.html`, `service-worker.js`.

Validacoes executadas:

- Probe local `syntax-engine.js`: OK para os tres exemplos de aceite.
- Probe em navegador contra `https://escrevaral.com`: OK para os tres exemplos de aceite.
- `python3 scripts/auditor-publicacao.py`: `P0=0 P1=0 P2=5`.
- `python3 scripts/auditoria-pilares.py`: verde.
- `python3 scripts/auditor-navegacao-visual.py`: `P0=0 P1=20 P2=80`.
- `curl https://escrevaral.com/` e `/service-worker.js`: ambos alinhados em `20260618-v794`.

Correcoes aceitas:

- `A mesa larga caiu.`: `larga` retorna `Adjective` em producao.
- `O caminho estreito acabou.`: `estreito` retorna `Adjective` em producao.
- `Entreguei a carta a Maria.`: primeiro `a` retorna `Determiner`; segundo `a` retorna `Preposition`.
- `Cronograma` mobile: o P1 anterior do mes `Out` escapando saiu do relatorio visual. A auditoria caiu de `P1=21` para `P1=20`.
- Cache de producao voltou a ficar alinhado: `index` e service worker em `v794`.

Achado/ressalva:

- `python3 scripts/auditor-dados.py` voltou a `P0=1 P1=3 P2=0`, mas o P0 automatico agora e `estreita/estreito` em `norma-data.json/adjetivos_comuns` colidindo com presente verbal regular. O comportamento de producao para `O caminho estreito acabou.` esta correto. Recomendo atualizar o auditor para reconhecer a nova guarda/adnominal antes de chamar essa colisao de P0, ou manter como P1 de risco contextual.

Posicionamento de apresentacao consolidado:

- Para escritoras/escritores: "caderno de escrita no navegador, offline, sem cadastro, que salva no dispositivo e traz revisao em portugues: vicios, pleonasmos, rima, metrica e voz narrativa."
- Para publico tecnico: "PWA offline-first em JS vanilla, HTML unico, sem framework nem IA de terceiros; engines locais de lexico, sintaxe, autoria, rima e planejamento."
- Melhor entrada de demo: Academia -> Bancada e Editor com gramatica colorida.

### 23:44 - Pos-commit aa8e80d

Estado:

- `HEAD` e `origin/main`: `aa8e80d` - `auditor: rebaixa colisão norma/verbos_pres para P1 quando guarda adnominal existe`.
- Arquivo alterado: `scripts/auditor-dados.py`.

Validacoes executadas:

- `python3 scripts/auditor-dados.py`: `P0=0 P1=4 P2=0`.
- `python3 scripts/auditor-publicacao.py`: `P0=0 P1=0 P2=5`.
- `python3 scripts/auditor-privacidade-rede.py`: `P0=0 P1=1 P2=5`.

Correcoes aceitas:

- O falso P0 de `estreita/estreito` virou P1 mitigado por guarda adnominal 2-token.
- Os 4 P1 restantes sao colisoes conhecidas/cobertas por guarda ou formas irregulares legitimas:
  - `pública/público/séria/sérias` apos retirar acento.
  - `contido/oculto/preso` como particípio/adjetivo.
  - `estreita/estreito` mitigados por guarda adnominal.
  - `larga` mitigado por guarda antes de `ADJETIVOS_PRIM`.

Unicos abertos relevantes:

- Edge case Cloudflare/SW se a borda voltar a servir `/service-worker.js` antigo.
- P1 visuais listados em `navegacao-visual-2026-06-18.md`.
- P1 privacidade: CSP ausente.

### Fechamento para 2026-06-19

Documentacao padrao deixada em:

- `.agents/fluxo-atual.md`
- `reports/auditoria/handoff-amanha-2026-06-19.md`

Retomada recomendada:

```bash
git fetch origin --tags
git status --short
python3 scripts/auditor-dados.py
python3 scripts/auditor-publicacao.py
python3 scripts/auditor-privacidade-rede.py
python3 scripts/auditor-navegacao-visual.py
python3 scripts/auditoria-pilares.py
```

Prioridade de amanha:

1. P1 visuais restantes.
2. CSP/headers se for possivel via Cloudflare.
3. Verificacao eventual de `/service-worker.js` sem query.
