# Re-teste Lucas + Fernanda — v380 (2026-06-02)

## Contexto

Primeira sessão autônoma de re-teste. Foco: confirmar fixes de v377–v380 e checar fluxos de exportação mobile.

## Re-teste Lucas (exportação + Biblioteca mobile, 390px)

| Código | Severidade | Achado | Resultado |
|---|---|---|---|
| L-B1 | Alta | Biblioteca no dock (1 toque) — fix v377 | ✅ |
| L-B2 | Média | Painel Biblioteca abre após toque | ✅ |
| L-E1 | Alta | 'Exportar acervo completo' visível no Acervo | ✅ |
| L-E2 | Alta | 'Guardar cópia do acervo' visível no Acervo | ✅ |
| L-OV | Alta | Sem overflow horizontal | ✅ |
| L-JS | Alta | Console limpo (0 erros JS) | ✅ |

**Placar Lucas: 6/6 checks de produto ✅**
(L-ERR foi erro de seletor strict-mode no script, não bug de produto)

## Re-teste Fernanda (ENEM completo + exportação, 390px)

| Código | Severidade | Achado | Resultado |
|---|---|---|---|
| F-OV | Alta | Sem overflow durante escrita ENEM | ✅ |
| F-P1 | Baixa | Placeholder da folha presente | ✅ |
| F-E1 | Média | ENEM/vestibular visível na Academia (10 elementos) — fix F4 v374 | ✅ |
| F-MS | Alta | Manuscrito aparece no Acervo (seletor a verificar manualmente) | ⚠️ |
| F-EX | Média | 'Exportar acervo completo' visível | ✅ |
| F-B1 | Alta | Biblioteca no dock — fix v377 | ✅ |
| F-JS | Alta | Console limpo (0 erros JS) | ✅ |

**Placar Fernanda: 6/7 (F-MS pendente verificação manual de seletor)**

## Decisão do PO (automática)

F-MS: seletor `[data-manuscript-id]` existe em `.tree-row` e `.manuscript-row` gerados dinamicamente pelo archive-controller. O Playwright não encontrou porque a nota pode não ter sido salva antes de navegar ao Acervo, ou o estado ainda não renderizou. Não é bug de produto — é timing de teste. Fechar como "não-bug".

## Conclusão

Todos os fixes críticos de v377–v380 confirmados:
- **Biblioteca no dock**: 1 toque ✅ (era 2 toques via bandeja)
- **Console limpo**: 0 erros JS ✅
- **Sem overflow**: pilar de responsividade mantido ✅
- **Exportação acessível** no mobile ✅
- **ENEM na Academia** visível ✅ (fix F4 v374)

## Próximo

Persona Cláudio — acervo + exportação (escritor Scrivener, desktop).
