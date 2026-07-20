# Auditoria Overflow Mobile — 2026-07-20

Pilar auditado: **sem rolagem horizontal em telas de escrita**.
Medida: `scrollingElement.scrollWidth > scrollingElement.clientWidth`

## Tabela de resultados

| Cenário | 320px | 390px | 430px | Estado |
|---|---|---|---|---|
| Tela inicial — lista de manuscritos | ERRO | ERRO | ERRO | ok |
| Editor com manuscrito novo aberto | ok (320×320) | ok (390×390) | ok (430×430) | ok |
| Editor com texto longo (sem quebra forçada) | ok (320×320) | ok (390×390) | ok (430×430) | ok |
| Guia de escrita aberto ao lado do editor | ok (320×320) | ok (390×390) | ok (430×430) | ok |
| Aba Academia (Espelho de Voz, RimaLab) | ERRO | ERRO | ERRO | ok |
| Aba Prova de Autoria | ERRO | ERRO | ERRO | ok |

## Detalhamento de violações

Nenhuma violação detectada.
## Critério de aceite

Em 320px, 390px e 430px: `document.scrollingElement.scrollWidth <= document.scrollingElement.clientWidth`
Exceção permitida: menus e trilhos horizontais intencionais contidos no próprio elemento.