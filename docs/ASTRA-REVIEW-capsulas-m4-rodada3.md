# PR #165 — parecer final Astra, Rodada 3

**MERGE `feat/cofre-capsulas-m4` em `encore`: SIM.**

HEAD de código revisado: `e4916d08568b71ab23ddcc806141a459f41b4a70`.
Correção P2: `3412be61dd742b1c53e15e6af34f9b8b14c598b8`.
Base do PR: `2a380c0b4f981dfabc8722271323cfb31236d755`.
Data: 2026-09-13. Nenhum merge realizado; o dono decide e ordena.

## Conclusão

A observação P2 da Rodada 2 está fechada. `splitLetterRuns` agora converte a classificação para `m = isL ? 1 : 0` antes de comparar com `mode`, mantendo estado e comparação numéricos. A mudança é localizada, preserva ES5 e corrige a causa do agrupamento indevido em caracteres.

O diagnóstico original, sem alteração, confirma:

```text
createHighlightedContext('A casa caiu.', 'casa', esc)
→ A <mark>casa</mark> caiu.
```

R1–R6 permanecem fechados. Foram executados novamente os dois diagnósticos e os 14 runners; todos terminaram com exit 0. Não resta pendência da revisão anterior que impeça este merge. A recomendação vale para o HEAD identificado e sua base, sem pressupor alterações futuras.

## Evidência independente desta rodada

[Saída integral da execução Astra](revisoes/pr165-r3-astra-execucao.json), com SHA, versão do Node, comandos, diretórios, stdout, stderr e códigos de saída. Os registros do dono em `pr165-r3-{runners,fluxo,verificar}.json` foram preservados.

| Verificação | Resultado |
| --- | --- |
| pr165-r2-fluxo.js, sem editar o diagnóstico | **6/6**, exit 0 (antes 5/6) |
| pr165-verificar.js, sem editar o diagnóstico | **8/8**, exit 0 |
| run-es5-purity.js | 9/9 |
| run-lexico.js | 36/36 |
| run-lexico-adversarial.js | 35/35 |
| run-analise-literaria.js | 114/114 |
| run-analise-literaria-adversarial.js | 43/43 |
| run-integration.js | 7/7 |
| run-decolonial.js | 7/7 |
| run-morphology.js | 14/14 |
| run-pontuacao.js | 11/11 |
| run-relative-clause.js | 11/11 |
| run-rima-metro.js | 29/29 |
| run-runtime.js | 5/5 |
| run-sintaxe.js | 31/31 |
| run-voz-estilistica.js | 11/11 |
| **Suíte dos 14 runners** | **363/363**, todos exit 0 |

O gate de pureza confirmou cinco parses ES5 com Acorn, os dois hashes de proveniência e as duas igualdades de dados. O fluxo confirmou o destaque corrigido, descarte de resposta pendente ao desligar e ao trocar lente, e análise com APIs opcionais modernas removidas. Os contratos, spans e contexto de poesia continuam passando nas reproduções.

## Método e limites

Relidos o handshake, a resposta da Rodada 3, AGENTS e as diretrizes em docs/11, docs/index e catalogo/index. O diff desde o parecer anterior contém apenas a pequena correção em `lexico-classes.js`, documentação e evidências; os runners e diagnósticos não mudaram.

O worktree `/tmp/opencode/encore-work` não existe no ambiente desta revisão. Foi usado um snapshot local obtido pelo GitHub conectado, conferido contra os blobs do HEAD: 70 arquivos locais versionados, zero divergências. Execução em Node v24.19.0, cada runner em processo separado, nos diretórios pedidos. Nenhuma engine foi editada pelo revisor.

Esta rodada confirma os critérios automatizados de integração e o fechamento do P2. Não mede desempenho, memória ou renderização em aparelho físico; não amplia a certificação de iPad/iOS 9 ou KitKat estabelecida pelo projeto.

## Regra-mãe e próxima ação concreta

Há evidência suficiente para decidir: esta entrega pode ser integrada. Encerrar a revisão das cápsulas M4; outra rodada sem mudança de código ou achado novo não acrescentaria informação.

**Próxima ação: o dono decidir e ordenar o merge do PR #165 em `encore`.** Critério técnico satisfeito: P2 fechado, fluxo 6/6, verificações 8/8, suíte 363/363 e piso ES5 aprovado. O commit deste parecer registra somente documentação e evidência; não executa o merge.
