# Varredura Click Depth — Analista de Fluxo
Data: 2026-05-31

## Resumo executivo

Click depth geral é bom. Três exceções críticas em phone (≤599px):

1. **Biblioteca afundada** — recurso core a 2 toques no phone (dock Mais → bandeja)
2. **Cronograma inacessível** — também a 2 toques; pouco usado mas importante
3. **Formatação editorial oculta** — Copiar e Baixar atrás de accordion

## Tabela de varredura

| Recurso | Desktop | Mobile | Classificação |
|---|---|---|---|
| Editor | 1 | 1 | CONTEXTUAL |
| Biblioteca | 1 (tab) | 2 (dock→bandeja) | DISTANTE em phone |
| Prova de Autoria | 1 (tab) | 1 (dock) | CONTEXTUAL |
| Arquivo | 1 (tab) | 1 (dock) | CONTEXTUAL |
| Academia | 1 (tab) | 1 (dock) | CONTEXTUAL |
| Cronograma | 1 (tab) | 2 (dock→bandeja) | DISTANTE em phone |
| Guia de Escrita | 1 (toggle) | 1 (toggle) | CONTEXTUAL |
| Espelho de Voz | 1 | 2 (Academia→tab) | PRÓXIMO |
| RimaLab | 1 | 2 (Academia→tab) | PRÓXIMO |
| Tema escuro | 1 (topbar) | 2 (dock→bandeja) | DUPLICADO |
| Nova nota | 2 | 3 (modal) | DISTANTE |

## Achados críticos

### F1 — Biblioteca afundada em phone
- **Arquivo:** `index.html` linha ~1614–1637 + `css/10-mobile-nav.css` linha 217
- **Problema:** Dock phone tem 5 posições. Biblioteca está na bandeja (2 toques).
- **Fix:** Trocar Cronograma (menos frequente) por Biblioteca no dock phone.
- **Padrão:** Frequência de uso determina posição no dock — Fitts' Law.

### F2 — Cronograma inacessível em phone
- **Arquivo:** `index.html` linha ~1618–1621 + `css/10-mobile-nav.css` linha 124
- **Problema:** Só aparece em tablet (rail) e desktop (tab). Phone só via bandeja.
- **Fix:** Aceitável na bandeja se Biblioteca subir para dock. Documentar a decisão.

### F3 — Formatação editorial oculta em phone
- **Arquivo:** `index.html` linha ~309–357
- **Problema:** "Copiar" e "Baixar" ficam atrás de botão "mais" em mobile.
- **Fix:** Elevar "Copiar" como botão sempre visível; manter "Quebra" e "Classes" no accordion.

### F4 — Tema escuro duplicado
- **Arquivo:** `index.html` linha ~184 (topbar) e ~1647–1650 (bandeja)
- **Problema:** Botão existe em 2 lugares. Mobile esconde o da topbar, expõe na bandeja.
- **Fix:** Manter apenas um ponto de entrada. Ou topbar sempre visível, ou só na bandeja.

### F5 — Nova nota exige modal pesado em phone
- **Arquivo:** `index.html` linha ~1262–1276
- **Problema:** 3 toques para criar nota em phone (botão → modal step 1 → step 2).
- **Fix:** Drawer (bottom sheet) em phone em vez de overlay fullscreen.

## Decisão do PO necessária

**L3 (Biblioteca no dock):** trocar Cronograma por Biblioteca no dock phone?
- Cronograma vai para bandeja junto com Backup e Tema
- Biblioteca sobe para dock na posição 5

Impacto: pequeno (só CSS + reordem de itens). Risco: nenhum para produto offline.
