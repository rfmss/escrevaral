# Auditoria Erros de Console — 2026-07-20

**Estado geral:** ERROS DETECTADOS  
**Erros JS:** 2 | **Erros de rede:** 0 | **Avisos:** 0

## Tabela de resultados

| Cenário | Erros JS | Erros rede | Avisos | Estado |
|---|---|---|---|---|
| Tela inicial — lista de manuscritos | 0 | 0 | 0 | ok |
| Criar e abrir manuscrito novo | 0 | 0 | 0 | ok |
| Digitar texto no editor | 0 | 0 | 0 | ok |
| Abrir guia de escrita | 0 | 0 | 0 | ok |
| Aba Academia | 1 | 0 | 0 | PROBLEMA |
| Aba Prova de Autoria | 1 | 0 | 0 | PROBLEMA |
| Acionar cópia de segurança | 0 | 0 | 0 | ok |

## Detalhamento

### academia
- **eval-error**: `Page.evaluate: Error: aba Academia não encontrada
    at eval (eval at evaluate (:313:29), <anonymous>:1:114)
    at eval (<anonymous>)
    at UtilityScript.evaluate (<anonymous>:313:29)
    at Utilit`

### prova-autoria
- **eval-error**: `Page.evaluate: Error: aba Prova não encontrada
    at eval (eval at evaluate (:313:29), <anonymous>:1:128)
    at eval (<anonymous>)
    at UtilityScript.evaluate (<anonymous>:313:29)
    at UtilitySc`
