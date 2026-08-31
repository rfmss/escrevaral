# 03. Escrevaral Antigravity Starter

Fonte: `/home/rafamass/Área de trabalho/2027/escrevaral-antigravity-starter/` (workspace ativo, ES5 puro; arquivos modificados até 30/ago/2026). É o **esqueleto arquitetural** do Encore: ES5 puro, separação Knowledge/Machine, contrato de engine definido, e compõem comprovada em hardware legado (iPad 2012/iOS 9, Android 4.4).

> Regra do project: contexto isolado (não cruza com outros projects). No Encore, o ES5 puro é a base.

---

## Arquitetura (certora)

```
Camada: Conhecimento (knowledge/)
O que faz: base de conhecimento linguístico por domínio. Cada domínio tem rules/, corpus/, sources/, MATURITY.md (modelo M0–M7: SEED→LEGACY READY→MATURE).
Domínios: pontuacao, ortografia, acentuacao, crase, sintaxe, regencia, concordancia, hifen, lexico, morfologia, discurso, coesao, semantica, estilo, estilometria, analise-literaria.
Formato: MATURITY.md por domínio; rules/candidate-*.regras.json; corpus/candidate-*.exemplos.jsonl.
Fonte: knowledge/ (ex.: knowledge/lexico/SPEC.md, knowledge/morfologia/)
Reuso: REFERÊNCIA — Encore adota o modelo M0–M7 por domínio
```

```
Camada: Máquina / Analisadores (machine/analyzers/)
O que faz: L analyzers, cada um = uma lente linguística, formato de engine uniforme: check(snapshot, context, callback) → findings.
Lentes (12): PontuacaoMecanica, Ortografia, Acentuacao, Crase, Sintaxe, Regencia, Concordancia, Hifen, Lexico, Morfologia, PontuacaoSintatica, AnaliseLiteraria.
Fonte: machine/analyzers/<lente>/*Analyzer.js + test.js
Reuso: SIM — contrato de engine do Encore (um engine por vez)
```

```
Contrato de engine (o "coração" da represa)
O que faz: define como toda engine conversa. Contratos: Rule(id, domain, checkFn) e Finding(ruleId, span, message, severity, confidence). Resultado de análise tem {ruleId, feature, severity, confidence, range, message, evidence}.
Fonte: js/core/linguistic-core/contracts.js + machine/analyzers/*/...
Reuso: SIM — adotar como formato único do Encore
```

```
Camada: Runtime core (js/core/)
O que faz: bootstrap (event bus + config), storage (localStorage wrapper), linguistic-core (contratos, regras, serviços: tokenizer, lexicon-service, morphology-lite, syntax), editor (document-schema, editor-core contenteditable, autosave, recovery, collection, audio-feedback, ergonomics, auto-resize, print).
Fonte: js/core/runtime-bootstrap.js, js/core/linguistic-core/*, js/core/editor/*
Reuso: SIM — base ES5 pronta
```

```
Camada: Machine storage (machine/storage/lexicon-storage.js)
O que faz: storage de léxico com Object.create(null) p/ O(1); validado a 100k entradas, load ~775ms, 10k lookups ~14ms sem OOM no Android 4.4.
Fonte: machine/storage/lexicon-storage.js
Reuso: SIM — atende a exigência de baixa RAM
```

---

## Visual / Look-and-feel (seed do Encore)

```
O que faz: estética "escritório vintage / máquina de escrever" com ruído fractal (feTurbulence), papel marfim sobre fundo bege. 3 temas: claro (#E7DDC8), escuro (#2C2824), e-ink (monocromático verde). Tipografia do editor com 3 fontes embutidas/com toggle: Typewriter, Merriweather (serif), Atkinson (sans). Modo foco com esmaecimento dos parágrafos não focados.
Fonte: css/legacy.css, fonts/ (typewriter.woff, merriweather.woff, atkinson.woff)
Reuso: REFERÊNCIA de estética; Encore redireciona para "Standard Notes + IA writing"
```

## Som — Máquina de escrever e ambiente

```
Feature: Som de teclado (audio-feedback)
O que faz: Web Audio (AudioContext/webkitAudioContext com fallback createGainNode p/ WebKit antigo), pool de samples, volume master 25% (ASMR), contexto global compartilhado p/ não roubar AudioFocus no Android, unlockiOS por touch.
Fonte: js/core/editor/audio-feedback.js
Reuso: SIM
```

```
Feature: Trilhas/frequências ambiente (OS MAIS VALIOSO para o item "som ambiente")
O que faz: trilhas com frequências que estimulam e não dão sono — cafeteria, chuva, floresta, lareira, trem, ruído marrom (brown) + frequências beta, gamma, pink. Controle estilo "vitrola" (vinil girando) + volume.
Arquivos (audio/): cafe.ogg, rain.ogg, floresta.ogg, lareira.ogg, trem.ogg, brown.wav, pink.wav, beta.wav, gamma.wav.
Fonte: audio/ + inline no index.html
Reuso: ATIVO — copiar trilhas/frequências (mas re-comprimir/baixar p/ legado)
```

## Compatibilidade legado (prova)
- **ES5 puro** (sem import/export/framework/bundler): scripts carregados por `<script src>` sequenciais.
- Removido `class`, `let/const`, arrow, `Map`, spread para rodar no Chromium 30 / Android 4.4.
- Harnesses de QA em hardware: `machine/analyzers/*/test.js` (Node) + `tests/*/legacy-qa-harness.html` + relatórios (M1: iPad2/iOS9.3.5 `<200ms` startup; M6: Android 4.4 100k léxico).
- `serve-legacy.sh` serve com allowlist (anti-exfiltração) p/ o dispositivo.

> Encore: a pasta antigravity é onde melhor está o "como construir ES5 de baixa RAM", incluindo as frequências de som ambiente. A seção levada de features de produto é pouca (editor simples + lentes + som); o grosso das engines fica nas outras seções.
