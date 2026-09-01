# 06. Uairer (uai.rer)

Fonte: `/home/rafamass/projetos/uai.rer/` (linhagem: Vereda → Uairer → Escrevaral). Vanilla JS modular, local-first/offline. O ativo-chave é o **motor linguístico portátil** `uairer-ptbr-engine`.

> Estado: andaime/early-stage (muitos features de UI são stubs). O valor real para o Encore está no **motor linguístico separado do app** e no **contrato de resultado**.

---

## Core de valor

```
Feature: Motor linguístico portátil (uairer-ptbr-engine) — o MAIS VALIOSO
O que faz: engine puramente linguística, isolada do DOM, para reuso em qualquer app. Cobre lexical (classe de palavra + confiança por origem — gerúndio, subjuntivo, particípio irregular, sufixos), sintaxe (apostos), pontuação, gramática (particípios com ter/ser), sinônimos, vocabulário decolonizador, rima/métrica/oralidade.
Formato de resultado: {kind, value, confidence, reason} — uniforme.
Fonte: packages/uairer-ptbr-engine/ (lexical-engine.js, syntax-engine.js, punctuation-engine.js, grammar-engine.js, synonym-data.js, pt-compromise.min.js, data/*.json) + scripts/audit-engines.js
Reuso: SIM — modelo de package de engine standalone do Encore
```

```
Feature: Arquitetura module-view-controller
O que faz: separa engine pura (sem DOM) → view → controller, com estado global e persistência em localStorage; core linguístico portátil isolado do app.
Fonte: src/state/store.js, src/shared/{dom,events,storage,constants}.js, src/features/{editor,archive,proof,academia}/
Reuso: REFERÊNCIA de arquitetura modular
```

## Referência estética (Stitch / Folio Notes)

```
Feature: Tema "Ateliê de Escrita" e "Folio Notes"
O que faz: estética tátil de escrivaninha de madeira + papel; tipografia Playfair Display / Literata / Hanken Grotesk; protótipo de note editor estilo "Folio Notes" (coleções + editor contenteditable) via Tailwind.
Fonte: stitch_aesthetic_note_editor/ateli_de_escrita/DESIGN.md e ateli_editor_de_texto/code.html
Reuso: REFERÊNCIA de estética (combina com Standard Notes + IA writing)
```

## Nota sobre estado
- Features `editor-engine.js`, `archive-engine.js`, `proof-engine.js`, `academia-controller.js` → stubs TODO.
- Pastas `features/{grammar,lexical,punctuation,syntax}` existem vazias (pontos de extensão).
- Para o Encore: não reconstruir via Uairer (incompleto); usar seu **pacote linguístico** como referência de contrato, mas os dados/engines maduros vêm do escrevaral.

> Compat: JS modular ES modules (`import/export`) — o Encore transpila/adapta para ES5.
