# Escrevaral-Encore — Documento-mestre

Índice geral do patrimônio e do blueprint de construção. Este documento reúne o **core de cada feature** dos projetos legados da linhagem, de forma pragmática, para recriação com baixo uso de RAM e retrocompatibilidade a hardware 2012.

## Pilares do Encore

- **Democrático / retrocompatível**: roda em iPad 2012 (iOS 9) e Android 4 (KitKat / Chromium 30).
- **Baixa RAM / simples**: mede **um engine por vez** (roletagem ao acionar a análise).
- **Offline total** a partir do primeiro acesso.
- **Future-proof**: spec pura + unidades módulo recriáveis, sem acoplamento a framework.
- **Visual**: organização estilo Standard Notes + look-and-feel "IA writing".

## Mapa da linhagem

```
Vereda (protótipo ancestral, Material design)
  └─► Uairer (uai.rer) — motor linguístico portátil modular
        └─► Escrevaral (main) — núcleo PT-BR todo-em-um + PWA/APK
              ├─► Escrevaral Mass Notes — rigor: morfologia TS, testes adversarial
              └─► Escrevaral Antigravity — arquitetura ES5 canônica + frequências ambiente
Linha paralela de imersão/estética:
  Typew (typewriter sound + modo foco + pomodoro lock)
  eskrev (Authoria/prova de autoria + QR sync + leitura)
Mini-PWAs: pomodoro, bloco (notas), nota (publicação)
```

## Índice

| Arq | Tema |
|---|---|
| [01-escrevaral-core.md](01-escrevaral-core.md) | Núcleo PT-BR: engines linguísticas, prova de autoria, leitura, pomodoro, typewriter, offline PWA/APK |
| [02-escrevaral-mass-notes.md](02-escrevaral-mass-notes.md) | Rigor técnico: morfologia verbal TS, proveniência de fontes, testes adversarial |
| [03-escrevaral-antigravity.md](03-escrevaral-antigravity.md) | Arquitetura ES5 canônica + separação Knowledge/Machine + frequências/trilhas ambiente |
| [04-typew.md](04-typew.md) | Typewriter sound (pool), estética máquina de escrever, modo foco, pomodoro 50/6 lock |
| [05-vereda.md](05-vereda.md) | Design system Material, régua de leitura neurociência, cartório/prova PoHW |
| [06-uairer.md](06-uairer.md) | Motor linguístico portátil (`uairer-ptbr-engine`), arquitetura module-view-controller |
| [07-eskrev.md](07-eskrev.md) | Authoria (prova .skv + hash), QR stream desktop↔mobile, ereader, grammar/lexCheck |
| [08-pomos-bloco-nota.md](08-pomos-bloco-nota.md) | Mini-PWAs: pomodoro dedicado, bloco (notas), nota (publicação) |
| [09-ativo-reuso.md](09-ativo-reuso.md) | Catálogo de ativos reutilizáveis (sons, fontes, trilhas, engines puras, dados) |
| [10-requisitos-encore.md](10-requisitos-encore.md) | Requisitos do produto Escrevaral-Encore |
| [11-sistema-supervisao-cognitiva.md](11-sistema-supervisao-cognitiva.md) | Sistema de Supervisão Cognitiva — Antiprompt (regras de trabalho do autor) |
| [12-licao-scaffold-agents.md](12-licao-scaffold-agents.md) | Lição aprendida — padrão de scaffold com agents do Antigravity (reuso documentado) |

## Catálogo de engines (inventário das 5 fontes)

[`../catalogo/index.md`](../catalogo/index.md) — inventário de todas as engines existentes em escrevaral, mass-notes, antigravity, uai.rer e eskrev, com mapa de decisão por domínio em [`../catalogo/por-dominio.md`](../catalogo/por-dominio.md). Sem copiar código; serve para decidir o que entra.

## Convenção de núcleos (formato de cada feature nos documentos)

Cada feature é documentada como **átomo recriável**:

```
Feature: <nome>
O que faz: <1-2 linhas — o core>
Formato/dados-chave: <números/estrutura essenciais>
Fonte: <caminho do arquivo no legado>
Reuso: SIM (engine pura) | REFERÊNCIA | ATIVO (asset)
```

> Objetivo: capturar a **informação essencial** para recriar com criatividade + regra de retrocompatibilidade, não copiar código bruto.
