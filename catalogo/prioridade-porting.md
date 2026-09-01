# Ordem de Porting — Decisão do Dono (confirmada)

## Critérios confirmados (2026-08-31, decisão do dono)
1. **Ordem por nível de complexidade — os mais FÁCEIS de portar primeiro.**
2. **Dicionário grande**: quebrar em shards por ordem alfabética, carregar **sob demanda** (pela 1ª sílaba/prefixo da palavra digitada). Offline, leve, "roletando" mais uma função.

> Visão do produto (do dono): **o Escrevaral é a academia do novo escritor, de 15 a 90 anos** — cobrindo todos os níveis, da definição do dicionário até o tom de voz do autor. Tudo offline, KitKat, uma tarefa por vez.

## Fato que reforça a estratégia do dicionário (verificado)
O **eskrev já implementa exatamente isso**: o dicionário rich de 360k é dividido em **28 shards por letra** (`src/assets/lingua/pt_dict_rich_chunk_{a..z,_}.json`, com letras até ~8 MB) e carregado via **lookup lazy** por `js/modules/verbete.js` + `pt_dictionary.js`. Ou seja, o padrão "shard alfabético + sob demanda" **já existe e funciona** — portamos para ES5, melhorando para carregar por prefixo/sílaba inicial conforme necessidade (não só letra).

## O que é "fácil de portar" (usado para a ordem)
- Tamanho do engine (pequeno = fácil);
- Independência (não depender de outra engine/serviço pesado);
- Dados portáveis em ES5;
- Origem madura com evidência.

## Ordem de porting por complexidade crescente

| # | Engine | Origem | Porting | Por quê nesta posição |
|---|---|---|---|---|
| 1 | **Morfologia verbal** | C (M6 ES5) + B (lemas) | **já feito** (M3) | Base; zero custo |
| 2 | **Relative-clause (orações adjetivas)** | A escrevaral (8 KB, hardcoded) | **já feito** (M3, 2026-09-01) | Pequeno, sem dependência externa |
| 3 | **Ponte/serviço de tokenização** | C antigravity (tokenizer 720 B) | **já feito** (M3) | Infra que desbloqueia análise de frase inteira (gap da morfologia) |
| 4 | **Decolonial / termos** | A (3 KB logic + 275 KB dados) | **já feito** (M3, 2026-09-01) | Lógica minúscula; dados 215 KB embutidos (606 entradas) |
| 5 | **Rima / métrica** | A (31 KB + 37 KB) | **já feito** (M3, 2026-09-01, núcleo sem dicionário) | Autônoma (fonética local); dicionário adiado |
| 6 | **Voz / estilística** | A (29 KB) | **já feito** (M3, 2026-09-01) | Autônoma |
| 7 | **Pontuação** | A (37 KB, usa sintaxe) | **já feito** (M3, 2026-09-01; analyze síncrona + analyzeDeep degrada) | Parte depende da sintaxe; Encore: analyze autônoma + 2 regras via REL-CLAUSE |
| 8 | **Sintaxe / função** | C (M6) + A (85-100%) | **já feito** (M3, 2026-09-01; fallback heurístico puro, sem pt-compromise) | Núcleo heurístico próprio + funções sintáticas; dados off-line embutidos (~95 KB) |
| 9 | **Análise literal literária** | A (122 KB) | difícil | Regras grandes hardcoded |
| 10 | **Léxico / classes** | C (lexicon shards O(1)) | difícil | 505 KB no A; portar padrão de shards |
| 11 | **Dicionário grande** | E eskrev (360k → shards por letra) | grande/sob demanda | Estratégia confirmada (ver acima) |
| 12 | **Prova de autoria** | E (ECDSA) + A (ritmo) | médio | Exige decisão de pré-cadastro |
| 13 | **Export / import** | A escrevaral | médio | Fecha fluxo do produto |

## Ponto de partida
Começamos pelo **#3 (tokenização)** e depois **#2 (relative-clause)** — os mais fáceis, que **destravam a morfologia para analisar frases inteiras** e adicionam leitura de orações adjetivas (gap que registramos). Ambos **já feitos**. Em seguida **#4 (decolonial) e #5 (rima/métrica) JÁ FEITOS**. Depois **#6 (voz/estilística)** — JÁ FEITO (M3). Em seguida **#7 (pontuação)** — JÁ FEITO (M3, 2026-09-01). Depois **#8 (sintaxe/função)** — JÁ FEITO (M3, 2026-09-01).
Próximo: **#9 análise literal literária** (origem A, 122 KB, regras grandes hardcoded).

## Decisões ainda em aberto (do dono)
- **Prova de autoria**: formato do "cartório" (ECDSA técnica vs. ritmo humano vs. ambos) — só na onda 4.
- **Léxico grande** já decidido: shards sob demanda; mas confirmar se a base inicial usa o léxico curado pequeno (uairer) enquanto os shards do 360k não são portados.
