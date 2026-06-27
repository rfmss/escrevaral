# Handoff Codex - gramatica PT-BR - 2026-06-27

## Contexto

Rafa pediu para substituir Claude ate a janela das 19h, sem dificultar o retorno dele ao repo.

Escopo assumido:

- analisar o trabalho recente do Claude
- corrigir a leitura sobre lacunas de verbos de fala
- deixar breadcrumbs para a proxima rodada
- nao mexer em runtime alem do que ja estava em andamento

## Estado observado

HEAD local:

```text
feat: v890 - +11 DEFINICOES + 8 SINONIMOS (fala, corporalidade, trauma)
```

Worktree ja estava com alteracoes nao commitadas em:

- `index.html`
- `lexical-engine.js`
- `service-worker.js`
- `synonym-data.js`

Essas mudancas parecem ser ciclo `v891`, com bump de assets e novas definicoes/sinonimos de percepcao sensorial.

Nao reverti nada.

## Correcao importante

Minha orientacao anterior dizia:

```text
Nao recriar murmurar: ja existe.
Focar sussurrar, tagarelar e praguejar.
```

Depois de reabrir o estado atual, a frase correta e:

```text
Nao recriar murmurar, sussurrar, tagarelar nem praguejar como lacunas.
Todos ja existem como definicoes ou foram cobertos no ciclo recente.
```

Evidencias:

- `murmurar` existe em `lexical-data.json`
- `sussurrar` existe em `lexical-engine.js`
- `tagarelar` existe em `lexical-engine.js`
- `praguejar` existe em `lexical-engine.js`

O trabalho util agora nao e aumentar lista por aumentar. E validar qualidade e regressao.

## Validacoes executadas

```bash
python3 scripts/auditor-dados.py
bash scripts/check-version-bump.sh
node --check syntax-engine.js
python3 -m py_compile scripts/bench-gramatica/avaliar-frases-criticas.py scripts/comparar-golden.py scripts/gerar-golden.py
```

Resultado:

```text
P0=0
P1=4
P2=0
```

`check-version-bump.sh` saiu sem erro.

## Alteracao feita pelo Codex nesta rodada

Arquivos de runtime tocados:

```text
syntax-engine.js
```

O que mudou:

- adicionada desambiguacao contextual para `publica/publicas/publico/publicos` quando a forma sem acento aparece em contexto nominal e pede leitura adjetiva
- adicionada leitura adjetiva contextual para `seria/serias` quando a frase sugere `séria/sérias`
- adicionada leitura adjetiva para particípios em contexto predicativo ou pos-nominal, como `ficou preso`, `sorriso contido`, `socio oculto`
- corrigida leitura de `por enquanto` e `enquanto isso` como locucoes/conectores temporais, sem deixar `enquanto` cair como conjuncao isolada nesses casos

Arquivos de suporte tocados:

```text
scripts/comparar-golden.py
scripts/gerar-golden.py
```

O que mudou:

- ambos agora aceitam `--base-url`
- ambos tentam usar Chromium do sistema (`/usr/bin/chromium`) antes de exigir browser baixado pelo Playwright

## Breadcrumb criado

Criei:

```text
scripts/bench-gramatica/frases-criticas.json
scripts/bench-gramatica/avaliar-frases-criticas.py
```

O JSON e um corpus pequeno para testar casos que a engine nao pode classificar por lista cega:

- `publica` verbo vs `publica/pública` adjetivo
- `seria` verbo auxiliar vs `seria/séria` adjetivo
- `preso` particípio, adjetivo e substantivo
- `enquanto` conjuncao vs locucao adverbial
- `larga` adjetivo vs verbo
- `estreita` adjetivo vs verbo
- `contido` e `oculto` como particípios adjetivados
- `sussurrar` como verbete ja coberto

O script roda esse corpus contra a engine real no navegador e grava relatorio em `reports/auditoria/`.
Ele tenta usar Chromium do sistema automaticamente para nao exigir `playwright install`.

Comando executado:

```bash
python3 scripts/bench-gramatica/avaliar-frases-criticas.py --base-url http://127.0.0.1:8877
```

Resultado:

```text
antes do ajuste: 17 casos, 10 ok, 7 divergentes
depois do ajuste: 17 casos, 17 ok, 0 divergentes
```

Relatorios gerados:

```text
reports/auditoria/frases-criticas-gramatica-2026-06-27.md
reports/auditoria/frases-criticas-gramatica-2026-06-27.json
```

As 7 divergencias originais foram zeradas.

Tambem rodei a guarda maior:

```bash
python3 scripts/comparar-golden.py --base-url http://127.0.0.1:8877
```

Resultado:

```text
91 frases
0 regressoes
4 evolucoes
```

Relatorios:

```text
reports/agente/2026-06-27.md
reports/agente/2026-06-27.json
```

## Proxima acao recomendada para Claude

1. Nao criar mais definicoes de verbos de fala sem checar se ja existem.
2. Usar `scripts/bench-gramatica/frases-criticas.json` como corpus inicial.
3. Rodar `scripts/bench-gramatica/avaliar-frases-criticas.py` antes e depois de qualquer ajuste de gramatica.
4. Separar claramente:

```text
normalizacao para busca
normalizacao para sinonimos
decisao gramatical final
```

5. Modelar estados:

```text
classificado
provavel
ambiguo
indeterminado
```

## Risco conhecido

Existe fallback visual para substantivo em `grammar-controller.js`:

```text
GRAMMAR_CLASSES_MAP[raw] || "gw-substantivo"
```

Isso pode fazer "nao sei" aparecer como "substantivo".

Nao tratar como bug isolado sem planejar uma saida `indeterminado`.
