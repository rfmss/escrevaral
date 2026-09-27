# Passagem de trabalho entre pessoas e IAs

Antes de continuar: ler `AGENTS.md` e [Plano mestre](../PLANO-MESTRE.md), consultar a main remota, verificar alterações locais e conferir `estado.json`. O mapa descreve compromissos e evidências, não autoriza dizer que uma capacidade planejada existe.

## Modelo de entrega

- **Etapa/objetivo:** ID, escopo e comportamento esperado.
- **Base:** repositório, branch, SHA e data da conferência.
- **Fontes realmente estudadas:** IDs, edições, páginas e lacunas de leitura.
- **Decisões:** terminologia, alternativas rejeitadas, incertezas preservadas e autorização aplicável.
- **Alterações:** arquivos, regras/dados e efeitos esperados na interface.
- **Evidência linguística:** casos, métricas por fenômeno, revisão feita, falsos alarmes, perdas e abstenções.
- **Evidência técnica:** posições, manuscrito intacto, cancelamento, desempenho, navegadores e dispositivos realmente usados.
- **Estados separados:** estudado / implementado / testado / integrado / publicado.
- **Lacunas:** problemas reproduzíveis, impacto, passos e responsável pela próxima ação.
- **Publicação:** SHA local e remoto, árvore de arquivos, resultado do deploy e URL verificada; ou motivo de não publicação.
- **Reversão:** commit/base anterior e consequências sobre formatos de dados. Não fazer force push nem apagar trabalho concorrente.
- **Próxima ação:** uma tarefa delimitada, dependências e critério de aceite.

## Atualização do mapa

Editar a etapa em `docs/jornada/estado.json` somente quando existir evidência correspondente. Ajustar data, pendências, evidências e próximos passos. Rodar `python3 ferramentas/gerar-jornada.py`; revisar os diffs de `docs/JORNADA-LINGUISTICA.md` e `jornada/index.html`.

Se decisões, escopo, marcos ou sequência mudarem, atualizar também `docs/PLANO-MESTRE.md`. Conferir campos auxiliares de `estado.json`, como `publicationDecision` e `focusDecision`, para não deixar um estado antigo contradizer o resumo atual.

O campo `baseline` registra a versão do produto auditada pelo mapa; não é o SHA do próprio arquivo. Não fabricar porcentagem de conclusão da língua. Se uma etapa muda de escopo, preservar a decisão e seu motivo no histórico Git.

## Encerramento da primeira jornada

Uma versão completa do escopo acordado pode ser encerrada quando todos os módulos prometidos têm fontes, critérios, implementação real, avaliação reservada e interface acessível; o manuscrito permanece intacto; qualidade e custo atendem às metas definidas; pendências aceitas estão públicas; e o deploy foi conferido. Não equivale a conhecer toda a língua nem elimina manutenção. Não declarar conclusão enquanto metas ou avaliações obrigatórias estiverem indefinidas.
