# 01. Escrevaral (main) — Núcleo PT-BR

Fonte: `/home/rafamass/projetos/escrevaral/` (branch main, produto publicado). Stack: HTML+CSS+JS vanilla, um `index.html` + `app.js`; PWA offline (`service-worker.js`); empacotado em APK Android via TWA (`escrevaral-app/`).

É o núcleo "todo-em-um": engines linguísticas PT-BR + prova de autoria + leitura + pomodoro + typewriter + exportação + offline.

---

## Engines de língua portuguesa brasileira

```
Feature: Análise gramatical geral (analise-engine)
O que faz: crítica em 7 eixos (economia, clareza, ritmo, voz, estrutura, POV, léxico); tokeniza frases/palavras, conta sílabas, detecta confusões/pleonasmos e alertas por nível.
Formato/dados: analise-data.json — stopwords 116; regras A-01 = 157; cliques de língua 1000; pleonasmos 500.
Fonte: analise-engine.js + analise-data.json
Reuso: SIM (engine pura, sem DOM)
```

```
Feature: Sinônimos / léxico / biblioteca (lexical-engine)
O que faz: dicionário de sinônimos PT-BR (base Antenor Nascentes), definições e polissemia; classes funcionais e locuções multi-palavra.
Formato/dados: lexical-engine.js (505 KB); ~1350 grupos de sinônimos; ~1020 definições; polissemia 110+; léxico literário 527.
Fonte: lexical-engine.js + lexical-data.json + synonym-data.js + synonyms/
Reuso: SIM
```

```
Feature: Sintaxe e morfologia (syntax-engine)
O que faz: análise sintática profunda — morfologia (pt-compromise + fallback próprio), desambiguação contextual, tempo verbal, funções sintáticas (sujeito, OI, vocativo), concordância, voz passiva. Estado declarado: função sintática 85%.
Formato/dados: syntax-data.json; bench validado 1700/1700 frases críticas; golden 91/0.
Fonte: syntax-engine.js + syntax-data.json
Reuso: SIM
```

```
Feature: Pontuação PT-BR (punctuation-engine)
O que faz: regras de vírgula (proibida/obrigatória), dois-pontos, travessão, ponto-e-vírgula, reticências, interrogação/exclamação; analyze e analyzeDeep com severidade inline.
Fonte: punctuation-engine.js
Reuso: SIM
```

```
Feature: Checagem por gênero/template (precision-engine)
O que faz: análise sob medida por gênero (romance, conto, crônica, ensaio, ENEM, roteiro, poesia, soneto, fantasia, terror, memoir, romantasy...): abertura, compressão, eco, repetição, checklist.
Fonte: precision-engine.js + criterios-data.js
Reuso: SIM
```

```
Feature: Espelho da Voz (voice-engine)
O que faz: infere o gesto de escrita — média de frase, densidade lexical, TTR, pontuação, carga emocional, repetições; aponta forças, pontos cegos e público. Lexicons por emoção (melancolia, tensão, luminosidade, ironia...) e campos semânticos (corpo, casa, natureza, memória, trabalho...).
Formato/dados: 10 gestos; 9 campos semânticos.
Fonte: voice-engine.js
Reuso: SIM
```

```
Feature: RimaLab (rima/métrica)
O que faz: silabificação real PT-BR, tonicidade, sinalefa, escansão de verso, nome do verso, rima estilo/tética por som desde a vogal tônica.
Formato/dados: rimalab-data.json — enciclopédia 50; grammarWords 348.
Fonte: rimalab-engine.js + rimalab-data.json
Reuso: SIM
```

```
Feature: Vocabulário decolonial (decolonial-engine)
O que faz: detecta termos/expressões de herança colonial no texto, com categoria e contagem, e sugere alternativas.
Formato/dados: decolonial-data.json — 606 entradas em 9 categorias.
Fonte: decolonial-engine.js + decolonial-data.json
Reuso: SIM
```

```
Feature: Oração relativa (relative-clause-engine)
O que faz: classifica orações relativas restritivas/explicativas (antecedente, propriedades) para revisão do "que".
Fonte: relative-clause-engine.js
Reuso: SIM
```

```
Feature: Prova de autoria (proof-engine)
O que faz: registra sessão, eventos de digitação/campo/estratégia, ritmo orgânico de escrita (intervalos 30–2000ms), fingerprint/carimbo de anterioridade, hashes sha256, histórico de versões.
Fonte: proof-engine.js + proof-controller.js + direito/compat: rights-engine.js (Lei 9.610, EDA/FBN, ISBN)
Reuso: SIM (núcleo do "Cartório/Authoria" do Encore)
```

```
Feature: Versionamento de documento (version-engine) + envelope chamariz VRDA (vrda-engine)
O que faz: snapshots de versão com milestone/restore/diff; envelope VRDA com checksum (FNV-1a) e ordenação estável para assinatura/integridade.
Fonte: version-engine.js + vrda-engine.js
Reuso: SIM
```

---

## Features de uso (do produto)

```
Feature: Editor e documento (document-engine + editor-controller)
O que faz: manuscrito estruturado, texto→HTML sanitizado, undo/redo, RTF exportável, saúde do texto (health score), ficha de personagem, inspector, barra de formatação.
Fonte: document-engine.js, editor-controller.js
Reuso: REFERÊNCIA (arquitetura)
```

```
Feature: Modos de escrita por gênero (editor-modes)
O que faz: Soneto (14 versos, rima ABBA/CDCD, contador de sílabas), Roteiro (sluglines), Teatro, Slam, ENEM (limite + contra-contagem).
Fonte: editor-modes.js
Reuso: SIM (núcleo de modos de escrita)
```

```
Feature: Modos de escrita "fluxo" (Deriva e Perseguição)
O que faz: Deriva = escrita livre com linha que se esvai e quebra após pausa (4s); Perseguição = urgência com detecção de combos de coesão/ritmo.
Fonte: deriva-mode.js, perseguicao-mode.js, combo-detector.js, training-controller.js
Reuso: SIM
```

```
Feature: Paginação editorial (pagination-engine)
O que faz: mede altura, quebra DOM em páginas, modo paginado, re-paginação preservando cursor.
Fonte: pagination-engine.js
Reuso: SIM
```

```
Feature: Arquivo do usuário (archive)
O que faz: navegação de manuscritos, projetos em grade, filtros/tags, busca, pinar/favoritar, duplicar, exportar, excluir com undo.
Fonte: archive-engine.js + archive-controller.js
Reuso: SIM
```

```
Feature: Cronograma/planner (cronograma-controller)
O que faz: calendário com feriados nacionais (algoritmo da Páscoa) e fases da lua, marcadores por dia.
Fonte: cronograma-controller.js
Reuso: SIM
```

```
Feature: Backup e restauração (backup)
O que faz: backup completo do estado em envelope; backup automático; import/export; backup em pasta via File System Access; conflito de abas.
Fonte: backup-engine.js, backup-controller.js, filesystem-backup-engine.js, state-store.js
Reuso: SIM (núcleo do encaixe offline)
```

```
Feature: Exportação sem dependências (export-engine)
O que faz: TXT, MD, Obsidian, HTML, EPUB 3 (KDP), DOCX (OOXML) com builder de ZIP próprio (zip/crc32).
Fonte: export-engine.js
Reuso: SIM
```

```
Feature: Importação (import-engine)
O que faz: importa TXT, MD e DOCX (parse do XML dentro do zip).
Fonte: import-engine.js
Reuso: SIM
```

```
Feature: Impressão/PDF (print-engine)
O que faz: gera documento HTML de impressão/PDF com hash de integridade e formatação.
Fonte: print-engine.js
Reuso: SIM
```

```
Feature: Offline PWA (service-worker)
O que faz: pré-cache de ~80 assets (CSS/JS/engines/data/fontes/ícones/sons), cache-first + runtime-cache, cache versionado.
Formato/dados: cache "vereda-offline-v1091".
Fonte: service-worker.js + manifest.webmanifest
Reuso: REFERÊNCIA (arquitetura de offline; Encore fará próprio mais leve)
```

```
Feature: Typewriter sound (typewriter-engine)
O que faz: toca typewriter/backspace/Enter via Web Audio com pool de vozes (4 type, 2 back), volume, toggle on/off persistido.
Fonte: typewriter-engine.js + sounds/ (typewriter.wav, backspace.wav, Enter.wav)
Reuso: ATIVO + REFERÊNCIA
```

```
Feature: Modo leitura (reader-controller)
O que faz: overlay leitor com fonte regulável, ritmo de passada, régua de leitura, play/pause.
Fonte: reader-controller.js
Reuso: REFERÊNCIA (o Encore refaz com neurociência — ver vereda)
```

```
Feature: Pomodoro (pomodoro-controller)
O que faz: timer 25min, rodadas salvas (até 200), toast de conclusão.
Fonte: pomodoro-controller.js
Reuso: REFERÊNCIA (o Encore usa 25 e 50 + trava de 6min — ver requisitos)
```

```
Feature: Coloração gramatical (grammar-controller)
O que faz: colore classes gramaticais no texto (substantivo, verbo, adjetivo) com hints por classe e subclasse (Bechara + Cunha&Cintra).
Fonte: grammar-controller.js
Reuso: SIM
```

```
Feature: Templates/ofícios (template-engine)
O que faz: catálogo de guias passo-a-passo por gênero que geram manuscritos estruturados.
Fonte: template-engine.js + templates-data.json
Reuso: SIM
```

```
Feature: Conquistas/badges (badges-engine)
O que faz: badges com fingerprint sha256 por manuscrito/modo.
Fonte: badges-engine.js
Reuso: SIM (leve)
```

```
Feature: Áudio ambiente / player de trilhas (app.js)
O que faz: player de áudio ambiente no app para escrever.
Fonte: app.js
Reuso: REFERÊNCIA (o Encore amplia com frequências — ver antigravity)
```

```
Feature: UI/dialogs/tooltips (ui-dialog, tooltip-controller)
O que faz: dialogos via VRDA (prompt/confirm) e tooltips acessíveis (hover/focus/touch, Escape).
Fonte: ui-dialog.js, tooltip-controller.js
Reuso: SIM
```

> Observação de compat: main usa Web Audio e engines modernas — precisa validação/adapto em iPad 2012/KitKat. Ativos de dados (JSON) são portáveis; engines de sim é que serão recriadas em ES5 no Encore.
