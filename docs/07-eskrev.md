# 07. Eskrev

Fonte: `/home/rafamass/projetos/eskrev/` (editor de escrita **offline-first** vanilla, multi-idioma PT/EN/ES/FR, PWA/Service Worker). Forte em **prova de autoria (Authoria)** e **QR sync desktop↔mobile** — diretamente relevantes ao Encore.

---

## Core de valor

```
Feature: Authoria — prova de autoria (.skv) — O MAIS VALIOSO
O que faz: exporta documento em .skv com hash SHA-256, registro temporal de keystrokes/inserções/deleções/pausas e cadeia criptográfica de sessões; verify.html recalcula o hash e gera relatório pericial de autoria verificável por qualquer pessoa.
Fonte: verify.html + js/modules/ (idb.js, textops.js, etc.)
Reuso: SIM — núcleo do "Cartório/Authoria" do Encore (juntar com proof-engine do escrevaral)
```

```
Feature: QR stream desktop↔mobile — O MAIS VALIOSO para o requisito "carteira/celular"
O que faz: sincronização via QR entre desktop e celular (mobile.html). Celular escaneia e "suga"/espelha o projeto.
Formato/dados: QR com payload de transferência do estado.
Fonte: js/modules/qrStream.js + mobile.html + index.html
Reuso: SIM — núcleo do "transferência mecânica via QR + celular é a carteira que carrega a instância"
```

```
Feature: Modo leitura (ereader)
O que faz: leitor tipográfico com fontes (Lato/Literata/Merriweather), ajuste de fonte, modos paginado/scroll, zones de clique p/ virar página.
Fonte: ereader.html
Reuso: REFERÊNCIA (juntar com régua neurociência do vereda)
```

```
Feature: Verificador de vocabulário (lexCheck) + grammar lint
O que faz: dicionário grande (~360k entradas) com sugestões por distância de edição (Vocabulary X-ray); grammarLint marca erros gramaticais; styleAnalysis analisa estilo.
Fonte: js/modules/lexCheck.js, grammarLint.js, grammarLintExtended.js, styleAnalysis.js, wordclass.js, verbete.js
Reuso: REFERÊNCIA (dados de ~360k entradas podem alimentar o léxico do Encore se licença permitir)
```

```
Feature: Editor keyboard-first sem distrações + slices + post-its
O que faz: escrita contínua; cortes (slices); notas vinculadas (post-its); flow markers; scroll sync.
Fonte: js/modules/{slices,postits,flowMarkers,scrollSync,pageFlow,selectionToolbar,mesa,dock,notes}.js
Reuso: REFERÊNCIA de UX de escrita
```

```
Feature: Pomodoro integrado
O que faz: pomodoro 25/50 min.
Fonte: (integrado no app)
Reuso: REFERÊNCIA (o Encore usa 25/50 + trava 6min — ver requisitos)
```

```
Feature: Offline PWA + QR + IDB
O que faz: service worker com cache "skrv-cache-v175"; IndexedDB (idb.js) p/ dados; QR sync.
Fonte: sw.js, manifest.json, js/modules/idb.js, js/modules/qrStream.js
Reuso: SIM — núcleo do offline + QR do Encore
```

```
Feature: Temas e templates
O que faz: temas "paper" (claro) e "chumbo" (escuro); templates (romance, roteiro, ENEM, ensaio, acadêmico).
Fonte: js/modules/themes.js + app
Reuso: SIM (tema + templates)
```

> Compat: eskrev usa ES2020/import/export e é "moderno" — para o Encore, a **lógica de Authoria + QR + offline** migra para ES5; os dados de léxico (~360k) podem alimentar o léxico com revisão de licença.
