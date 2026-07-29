# M0.9 — Auditoria operacional viva

Atualizado em: 2026-07-29

## Função deste documento

Este arquivo é a memória operacional executável do milestone **M0.9 — Candidata Integrada do Escrevaral**.

Ele existe para que qualquer pessoa, IA ou plataforma consiga:

- retomar a auditoria sem depender de histórico de conversa;
- saber qual é a linha de base validada;
- executar as mesmas jornadas e critérios;
- registrar decisões importantes no momento em que forem tomadas;
- manter notas, severidades, evidências e veredito sincronizados;
- impedir que uma nova feature seja iniciada antes de uma visão integrada do produto.

Este documento deve ser atualizado sempre que houver mudança de escopo, decisão importante, novo P0/P1/P2, alteração de severidade, correção aceita, nova evidência, mudança de nota ou mudança de veredito.

## Estado executivo

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155`, aberto e em rascunho;
- preview: `preview-mass-notes-tiptap`;
- milestone: **M0.9 — Candidata Integrada do Escrevaral**;
- estado: **em execução — primeira tranche automatizada concluída**;
- Gates 1 a 13 e Gate 10.5: concluídos;
- matriz atual: 116 cenários por navegador, 232 execuções;
- cabeça funcional da primeira tranche: `a3989f8dfe24cd8a8d035a2c494f5263f1bd3510`;
- cabeça documental preparada para validação: `14df8547ddb99ee8ecbb822b765b98d67a06c769`;
- nota provisória: 85/100;
- beta fechada: `SHIP COM CONDIÇÕES` provisório;
- lançamento público: `NO-SHIP` provisório;
- substituição integral: `NO-SHIP` provisório;
- P0 abertos: 0;
- P1 abertos: 0;
- próxima ação: validar a cabeça documental e executar a segunda tranche.

## Pergunta central

> O Mass Notes Next já pode ser usado de forma recorrente, segura, compreensível e prazerosa por uma pessoa que escreve em português brasileiro?

A auditoria responde separadamente:

1. está pronto para beta fechada?
2. está pronto para lançamento público?
3. está pronto para substituir o Escrevaral antigo?

## Regras imutáveis

1. Auditar antes de corrigir.
2. Não adicionar feature nova durante o diagnóstico.
3. Não editar `preview-mass-notes-tiptap` diretamente.
4. Não promover para `main`.
5. Manter o PR `#155` em rascunho.
6. Não enfraquecer testes para obter verde.
7. Diferenciar defeito real, contrato antigo, instabilidade temporal, limitação conhecida e item fora de escopo.
8. Correção durante a auditoria só é permitida para remover P0 ou bloqueio da própria medição.
9. Toda correção deve ser mínima, documentada e seguida pela matriz completa.
10. Nenhum texto autoral pode sair em requisição de rede.
11. Engine integrada exige entrada real, saída observável e teste de borda.
12. O milestone só termina com evidência na cabeça exata, sem commit posterior.

## Linha de base

Concluído:

- branch, PR e workflows conferidos;
- PR confirmado aberto, mesclável, não incorporado e em rascunho;
- README, índice, PLAN, MEMORY e CHANGELOG atualizados;
- Gate 13 registrado em log e contrato global;
- relatório humano e JSON M0.9 criados;
- contrato global M0.9 criado;
- primeira matriz transversal executada e repetida.

Pendente:

- CI verde na cabeça documental preparada;
- segunda tranche;
- decisões finais para P2;
- veredito final;
- CI final sem commit posterior.

## Fases

### Fase 1 — jornadas integradas

Estado: **parcial**.

Aprovados criação, escrita, metadados, autosave, recarga e organização. Conflito real transversal ainda está pendente.

### Fase 2 — engines

Estado: **parcial forte**.

Revisão, Voz, Contexto, RimaLab e Palavras foram executadas em sequência sem mutação. Corpus ampliado consolidado ainda está pendente.

### Fase 3 — portabilidade e preservação

Estado: **forte por gates, transversal pendente**.

TXT, Markdown, HTML, cópia nativa e `.esc` possuem contratos próprios; falta jornada combinada na mesma sessão.

### Fase 4 — UIX e design

Estado: **parcial**.

320 e 390 px foram aprovados na jornada integrada; heurística manual integral e demais larguras permanecem pendentes.

### Fase 5 — acessibilidade

Estado: **parcial**.

Teclado, tabs, Escape e retorno de foco aprovados; zoom, movimento reduzido, leitores de tela e dispositivos reais pendentes.

### Fase 6 — privacidade e rede

Estado: **parcial forte**.

A frase sentinela não apareceu em URL ou corpo de requisição durante as engines. Observação completa de todas as jornadas permanece pendente.

### Fase 7 — desempenho e resistência

Estado: **parcial**.

100 páginas e documento acima de 100 mil caracteres permaneceram utilizáveis. Latência, memória e sessão prolongada ainda não foram medidas.

### Fase 8 — release

Estado: **parcial forte**.

Pipeline, preview, cache, smoke, Argila e coerência estão verdes; aplicação nova continua sem service worker próprio.

## Matriz transversal

Concluídos:

1. escrita → metadados → autosave → recarga;
2. Revisão → Voz → Contexto → RimaLab → Palavras → ausência de mutação;
3. busca e filtros → página ativa fora do recorte → revisão preservada;
4. mobile 320/390 → sete abas → foco e ausência de overflow;
5. 100 páginas e documento acima de 100 mil caracteres;
6. interceptação sentinela de rede durante engines.

Pendentes:

1. edição rica → Revisão → mudança editorial → preservação das marcas;
2. seleção lexical → troca de aba → retorno em jornada transversal;
3. conflito entre abas envolvendo manuscrito e metadados;
4. exportação depois de alteração ainda não persistida;
5. cópia nativa e restauração na mesma sessão;
6. importação `.esc` combinada com demais operações.

## Severidade

- **P0:** perda/corrupção, exposição autoral, inutilização ou sobrescrita silenciosa.
- **P1:** fluxo principal quebrado, engine enganosa ou acessibilidade bloqueadora.
- **P2:** defeito relevante, inconsistência importante ou lacuna de paridade.
- **P3:** acabamento, clareza ou melhoria não bloqueadora.

## Placar provisório

| Área | Nota | Estado | Evidência principal |
|---|---:|---|---|
| Editor e preservação | 92 | forte, incompleto | escrita/metadados/recarga/escala verdes |
| Biblioteca | 90 | forte | filtros não mutam revisão; 100 páginas verdes |
| Engines | 86 | forte, corpus pendente | cinco superfícies em sequência sem mutação |
| UIX | 82 | parcial | gates visuais + mobile integrado |
| Acessibilidade | 80 | parcial | teclado/foco/drawers verdes |
| Responsividade | 89 | forte | 320/390 integrados e regressões anteriores |
| Importação e exportação | 83 | forte no escopo atual | contratos seguros; paridade avançada ausente |
| Privacidade | 92 | parcial forte | local-first + sentinela de rede verde |
| Desempenho | 84 | funcional, sem orçamento | 100 páginas/100 mil caracteres verdes |
| Release | 72 | incompleto | CI/preview fortes; PWA própria ausente |
| **Geral** | **85** | **provisório** | candidata forte para beta, incompleta para público/substituição |

## Registro de decisões

| Data | ID | Decisão | Razão | Impacto |
|---|---|---|---|---|
| 2026-07-29 | M09-D001 | Executar M0.9 antes do Gate 14. | O produto atingiu massa crítica. | Gate 14 suspenso. |
| 2026-07-29 | M09-D002 | A auditoria é memória operacional viva. | Decisões não podem depender da conversa. | Este arquivo é leitura obrigatória. |
| 2026-07-29 | M09-D003 | Preservar PR em rascunho e `main` intacta. | Auditoria mede prontidão, não autoriza promoção. | Nenhum merge/release. |
| 2026-07-29 | M09-D004 | Avaliar beta, lançamento e substituição separadamente. | Objetivos têm exigências diferentes. | Três vereditos independentes. |
| 2026-07-29 | M09-D005 | Classificar a falha inicial do RimaLab como temporal de teste. | Autosave já estava em `Salvo`; casos M0.9 passaram. | Produto não mudou; convergência final preservada. |
| 2026-07-29 | M09-D006 | Notas e vereditos permanecem provisórios. | Fases obrigatórias ainda faltam. | M0.9 continua aberto. |

## Registro de achados

| ID | Severidade | Área | Estado | Resumo | Decisão |
|---|---|---|---|---|---|
| M09-F001 | P2 | release | aberto | aplicação nova sem service worker/PWA próprio | bloqueia lançamento público |
| M09-F002 | P2 | paridade | aberto | Prova de Autoria ausente | bloqueia substituição integral sem decisão explícita |
| M09-F003 | P2 | portabilidade | aberto | faltam DOCX, RTF, ePub e Obsidian ZIP | não bloqueia beta; bloqueia paridade integral |
| M09-F004 | P3 | biblioteca | aceito | filtros/ordenação não persistem | avaliar após veredito |

## Registro de evidências

| Data | Cabeça | Evidência | Resultado |
|---|---|---|---|
| 2026-07-29 | `323e8a1e131a3692932e960e9285570df49a1460` | Gate 13 | 222/222, preview, Argila e coerência verdes |
| 2026-07-29 | `f3ab89db816557984ed19bc8ab17d2d96137d946` | primeira execução M0.9 | 231/232; 10/10 casos novos verdes; falha temporal antiga |
| 2026-07-29 | `a3989f8dfe24cd8a8d035a2c494f5263f1bd3510` | primeira tranche funcional | Mass Notes `30463426867`, Argila `30463426847`, coerência `30463426811`; 232/232 e smoke verde |
| 2026-07-29 | `14df8547ddb99ee8ecbb822b765b98d67a06c769` | cabeça documental preparada | validação exata em andamento |

## Paridade com o Escrevaral antigo

| Área antiga | Estado no produto novo | Lacuna |
|---|---|---|
| Análise Geral | preservada parcialmente | ampliar corpus |
| Sintaxe/Morfologia | capacidade interna | superfície/autonomia não comprovada |
| Pontuação | preservada parcialmente | ampliar corpus transversal |
| Espelho de Voz | preservada parcialmente | ampliar textos/gestos |
| RimaLab | preservada parcialmente | ampliar corpus |
| Léxico | preservada parcialmente | medir catálogo e sinônimos |
| Sinônimos | capacidade interna/parcial | confirmar experiência exposta |
| Decolonial | preservada parcialmente | ampliar categorias e bordas |
| Exportação | preservada parcialmente | faltam DOCX/RTF/ePub/Obsidian |
| Prova de Autoria | ausente | exige decisão explícita |
| PWA/offline | ausente na aplicação nova | exige gate de release |

## Entregáveis

Criados:

- memória operacional;
- relatório humano;
- JSON estruturado;
- suíte transversal;
- log da tranche 1;
- contratos globais do Gate 13 e M0.9;
- README, índice, PLAN, MEMORY e CHANGELOG atualizados.

Pendentes:

- segunda tranche;
- veredito final;
- cabeça final validada sem commit posterior.

## Critério de encerramento

O milestone só encerra quando não houver P0 aberto, todo P1 tiver decisão explícita, a matriz integral estiver verde, workflows e preview estiverem verdes, veredito final estiver registrado, documentação apontar para a cabeça exata e o PR continuar em rascunho e não incorporado.

## Protocolo de atualização

Ao iniciar: ler este documento, conferir PR/cabeça/workflows, revisar achados e escolher a próxima evidência.

Ao decidir: registrar decisão, atualizar placar/paridade, sincronizar PLAN/MEMORY e registrar evidência.

Ao encerrar: registrar somente o executado, atualizar a próxima ação e manter limitações explícitas.
