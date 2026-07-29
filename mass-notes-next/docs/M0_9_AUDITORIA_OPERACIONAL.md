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

Este documento deve ser atualizado sempre que houver:

- mudança de escopo;
- decisão de produto ou arquitetura;
- novo P0, P1 ou P2;
- alteração de severidade;
- correção aceita durante a auditoria;
- nova evidência de CI ou smoke público;
- mudança de nota ou veredito;
- decisão sobre beta, lançamento público ou substituição do produto antigo.

## Estado executivo

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155`, aberto e em rascunho;
- preview: `preview-mass-notes-tiptap`;
- milestone: **M0.9 — Candidata Integrada do Escrevaral**;
- estado do milestone: **em execução — primeira tranche automatizada concluída**;
- último gate funcional: Gate 13 — importação auditável do `.esc` legado;
- matriz atual: 116 cenários por navegador, 232 execuções;
- cabeça da primeira tranche verde: `a3989f8dfe24cd8a8d035a2c494f5263f1bd3510`;
- veredito provisório: beta fechada `SHIP COM CONDIÇÕES`; lançamento público `NO-SHIP`; substituição integral `NO-SHIP`;
- próxima ação obrigatória: segunda tranche com conflito real, portabilidade integrada, acessibilidade ampliada e corpus por engine.

## Pergunta central

> O Mass Notes Next já pode ser usado de forma recorrente, segura, compreensível e prazerosa por uma pessoa que escreve em português brasileiro?

A auditoria responde separadamente:

1. está pronto para beta fechada?
2. está pronto para lançamento público?
3. está pronto para substituir o Escrevaral antigo?

## Regras imutáveis durante o milestone

1. Auditar antes de corrigir.
2. Não adicionar feature nova durante o diagnóstico.
3. Não editar `preview-mass-notes-tiptap` diretamente.
4. Não promover para `main`.
5. Manter o PR `#155` em rascunho.
6. Não enfraquecer testes para obter verde.
7. Diferenciar defeito real, contrato antigo de teste, instabilidade temporal, limitação conhecida e item fora do escopo.
8. Correção durante a auditoria só é permitida quando um P0 impede continuidade ou quando o defeito bloqueia a própria medição.
9. Toda correção deve ser mínima, documentada e seguida pela matriz completa.
10. Nenhum texto autoral pode sair em requisição de rede.
11. Não declarar engine integrada apenas pela existência de arquivo; exigir entrada real, saída observável e teste de borda.
12. O milestone só termina com evidência na cabeça exata, sem commit posterior.

## Linha de base

Concluído:

- branch, PR e workflows conferidos;
- PR confirmado aberto, mesclável, não incorporado e em rascunho;
- README, índice, PLAN, MEMORY e CHANGELOG atualizados;
- Gate 13 registrado em log e contrato global;
- relatório e JSON M0.9 criados;
- primeira matriz transversal executada.

Pendente:

- corpo do PR atualizado com Gate 13 e M0.9;
- segunda tranche da auditoria;
- veredito final;
- CI na cabeça documental final sem commit posterior.

## Fases da auditoria

### Fase 1 — jornadas integradas

Cobrir primeira visita, criação, escrita, edição longa, troca entre páginas, organização, fechamento e retorno, autosave, recuperação e conflitos entre abas.

Estado: **parcial**. Criação, escrita, metadados, autosave, recarga e organização foram aprovados. Conflito real transversal ainda está pendente.

### Fase 2 — engines

Auditar Revisão, Sintaxe/Morfologia, Pontuação, Espelho de Voz, Termos que pedem contexto, RimaLab e Palavras/Léxico isoladamente e em combinação.

Corpora obrigatórios:

- prosa curta e longa;
- poema livre e regular;
- diálogo;
- listas, títulos e citações;
- regionalismos;
- acentos, emoji, travessões e aspas curvas;
- fragmentos repetidos;
- parágrafos vazios;
- texto ambíguo e insuficiente;
- documento com pelo menos 20 mil caracteres.

Estado: **parcial**. As cinco superfícies foram executadas em sequência sem mutação; corpus ampliado consolidado ainda está pendente.

### Fase 3 — portabilidade e preservação

Auditar TXT, Markdown, HTML, cópia nativa e `.esc` legado, incluindo arquivos inválidos, versões futuras, duplicidade, Unicode, cancelamento, atomicidade e ausência de sobrescrita.

Estado: **forte por gates, transversal pendente**.

### Fase 4 — UIX e design

Auditar compreensão, hierarquia, densidade, linguagem, feedback, estados vazios, erros, previsibilidade, modo claro/noite, Anatomia e retorno ao editor.

Larguras mínimas: 320, 390, 768, 1024, 1280 e 1440 px.

Estado: **parcial**. 320 e 390 px foram aprovados na jornada integrada; heurística manual integral permanece pendente.

### Fase 5 — acessibilidade

Auditar teclado, foco, Escape, retorno de foco, nomes acessíveis, tabs, regiões, status, alertas, contraste, zoom de 200%, movimento reduzido e independência de cor.

Estado: **parcial**. Teclado, tabs, Escape e retorno de foco aprovados; tecnologias assistivas reais pendentes.

### Fase 6 — privacidade e rede

Observar requisições durante escrita, autosave, todas as engines, exportação, cópia e importação. Conteúdo autoral não pode sair da aplicação.

Estado: **parcial**. A frase sentinela não apareceu em URL ou corpo de requisição durante a sequência de engines.

### Fase 7 — desempenho e resistência

Auditar documentos de 20 mil e 100 mil caracteres, biblioteca com 100 páginas, alternância rápida, engines repetidas, múltiplas abas, lote legado grande e uso prolongado.

Estado: **parcial**. 100 páginas e documento acima de 100 mil caracteres permaneceram utilizáveis. Latência, memória e sessão prolongada ainda não foram medidas.

### Fase 8 — release

Auditar branch, PR, isolamento da preview, hashes, cache, smoke público, coerência, Argila, `main`, service worker público e ausência de edição direta na branch publicada.

Estado: **parcial forte**. Pipeline e isolamento verdes; aplicação nova continua sem service worker próprio.

## Matriz transversal

Concluídos:

1. primeira visita → escrita → metadados → autosave → recarga;
2. documento longo → Revisão → Voz → Contexto → RimaLab → Palavras → ausência de mutação;
3. busca e filtros → página ativa fora do recorte → revisão preservada;
4. mobile 320/390 → sete abas → foco e ausência de overflow;
5. biblioteca com 100 páginas e documento acima de 100 mil caracteres;
6. interceptação sentinela de rede durante engines.

Pendentes:

1. edição rica → Revisão → mudança editorial → preservação das marcas;
2. seleção lexical → troca de aba → retorno → seleção preservada em jornada transversal;
3. conflito entre abas envolvendo manuscrito e metadados;
4. exportação depois de alteração ainda não persistida;
5. cópia nativa e restauração na mesma sessão;
6. importação `.esc` combinada com demais operações na mesma sessão.

## Regra de severidade

- **P0:** perda/corrupção de dados, exposição de manuscrito, aplicação inutilizável ou sobrescrita silenciosa.
- **P1:** fluxo principal quebrado, engine enganosa, acessibilidade bloqueadora ou falha recorrente sem alternativa segura.
- **P2:** defeito relevante com alternativa, inconsistência de UX ou paridade importante ausente.
- **P3:** acabamento, clareza ou melhoria não bloqueadora.

## Placar vivo provisório

| Área | Nota | Estado | Evidência principal |
|---|---:|---|---|
| Editor e preservação | 92 | forte, incompleto | escrita/metadados/recarga/escala verdes |
| Biblioteca | 90 | forte | filtros não mutam revisão; 100 páginas verdes |
| Engines | 86 | forte, corpus pendente | cinco superfícies em sequência sem mutação |
| UIX | 82 | parcial | gates visuais + mobile integrado; heurística manual pendente |
| Acessibilidade | 80 | parcial | teclado/foco/drawers verdes; leitores reais pendentes |
| Responsividade | 89 | forte | 320/390 integrados e regressões anteriores |
| Importação e exportação | 83 | forte no escopo atual | contratos seguros; paridade avançada ausente |
| Privacidade | 92 | parcial forte | local-first + sentinela de rede verde |
| Desempenho | 84 | funcional, sem orçamento | 100 páginas/100 mil caracteres verdes |
| Release | 72 | incompleto | CI/preview fortes; PWA própria ausente |
| **Geral** | **85** | **veredito provisório** | candidata forte para beta, incompleta para público/substituição |

## Registro de decisões

| Data | ID | Decisão | Razão | Impacto |
|---|---|---|---|---|
| 2026-07-29 | M09-D001 | Executar M0.9 antes do Gate 14. | O produto atingiu massa crítica e precisa de visão integrada antes de nova feature. | Gate 14 fica suspenso até o veredito. |
| 2026-07-29 | M09-D002 | A auditoria é memória operacional viva. | Decisões e achados não podem depender da conversa. | Este arquivo passa a ser leitura obrigatória. |
| 2026-07-29 | M09-D003 | Preservar o PR como rascunho e `main` intacta. | O milestone mede prontidão, não autoriza promoção. | Nenhum merge ou release durante a auditoria. |
| 2026-07-29 | M09-D004 | Avaliar beta, lançamento e substituição separadamente. | Esses objetivos possuem riscos e exigências diferentes. | O veredito final terá três respostas independentes. |
| 2026-07-29 | M09-D005 | Classificar a falha inicial do RimaLab como instabilidade temporal de teste. | Todos os casos M0.9 passaram; o autosave já estava em `Salvo` antes da observação intermediária. | Produto não mudou; helper observa qualquer estado válido e exige convergência final. |
| 2026-07-29 | M09-D006 | Emitir notas e veredito apenas como provisórios após a primeira tranche. | UIX manual, tecnologias assistivas, conflito real e portabilidade transversal ainda faltam. | M0.9 permanece aberto. |

## Registro de achados

| ID | Severidade | Área | Estado | Resumo | Evidência | Decisão |
|---|---|---|---|---|---|---|
| M09-F001 | P2 | release | aberto | aplicação nova sem service worker/PWA próprio | arquitetura e limitações atuais | bloqueia lançamento público |
| M09-F002 | P2 | paridade | aberto | Prova de Autoria ausente | comparação com produto antigo | bloqueia substituição integral |
| M09-F003 | P2 | portabilidade | aberto | faltam DOCX, RTF, ePub e Obsidian ZIP | formatos atuais TXT/MD/HTML | não bloqueia beta; bloqueia paridade integral |
| M09-F004 | P3 | biblioteca | aceito | filtros e ordenação não persistem entre sessões | Gate 14 ainda não iniciado | avaliar após veredito |

P0 abertos: **0**.

P1 abertos: **0**.

## Registro de evidências

| Data | Cabeça | Evidência | Resultado |
|---|---|---|---|
| 2026-07-29 | `323e8a1e131a3692932e960e9285570df49a1460` | Gate 13 funcional, 222/222, preview, Argila e coerência | verde funcional |
| 2026-07-29 | `f3ab89db816557984ed19bc8ab17d2d96137d946` | primeira execução M0.9 | 231/232; 10/10 casos novos verdes; falha temporal antiga do RimaLab |
| 2026-07-29 | `a3989f8dfe24cd8a8d035a2c494f5263f1bd3510` | Mass Notes `30463426867`, Argila `30463426847`, coerência `30463426811` | 232/232, publicação, cache e smoke público verdes |

## Paridade com o Escrevaral antigo

| Área antiga | Estado no produto novo | Evidência | Lacuna |
|---|---|---|---|
| Análise Geral | preservada parcialmente | Revisão real e sequência integrada | medir corpus ampliado |
| Sintaxe/Morfologia | presente como capacidade interna | carregada pela Revisão e Palavras | superfície/autonomia não comprovada |
| Pontuação | preservada parcialmente | Revisão inline UTF-16 | ampliar corpus transversal |
| Espelho de Voz | preservada parcialmente | leitura real integrada | ampliar textos/gestos |
| RimaLab | preservada parcialmente | prosa, verso e sequência integrada | ampliar corpus |
| Léxico | preservada parcialmente | Palavras/Léxico real | medir catálogo e sinônimos |
| Sinônimos | presente apenas como capacidade interna/parcial | bases legadas | confirmar experiência exposta |
| Decolonial | preservada parcialmente | Contexto real | ampliar categorias e bordas |
| Exportação | preservada parcialmente | TXT/MD/HTML | faltam DOCX/RTF/ePub/Obsidian |
| Prova de Autoria | ausente | nenhuma superfície atual | exige decisão explícita |
| PWA/offline | ausente na aplicação nova | sem service worker próprio | exige gate de release |

## Entregáveis

Criados:

- `docs/M0_9_AUDITORIA_OPERACIONAL.md`;
- `docs/audits/M0_9_AUDITORIA_GERAL.md`;
- `docs/audits/M0_9_AUDITORIA_GERAL.json`;
- `tests/m0-9-integrated.spec.ts`;
- log e contrato global do Gate 13.

Pendentes:

- log técnico específico do M0.9;
- contrato global M0.9;
- corpo do PR atualizado;
- segunda tranche;
- cabeça final validada sem commit posterior.

## Critério de encerramento

O milestone só encerra quando:

- Gate 13 estiver documentalmente fechado;
- não houver P0 aberto;
- todo P1 possuir decisão explícita;
- matriz completa estiver verde em Chromium e Firefox;
- workflows globais estiverem verdes;
- preview pública responder;
- notas e veredito final estiverem registrados;
- a documentação apontar para a cabeça exata validada;
- não houver commit posterior à evidência;
- PR continuar em rascunho e não incorporado.

## Protocolo de atualização

Ao iniciar uma sessão:

1. ler este documento;
2. conferir PR, cabeça e workflows;
3. localizar a próxima fase incompleta;
4. revisar P0/P1 abertos;
5. declarar qual evidência será produzida.

Ao tomar uma decisão:

1. acrescentar linha em `Registro de decisões`;
2. atualizar placar ou paridade quando aplicável;
3. atualizar PLAN/MEMORY se a decisão for permanente;
4. registrar commit e evidência.

Ao encerrar uma sessão:

1. registrar o que foi realmente executado;
2. não marcar como concluído o que ficou apenas planejado;
3. atualizar a próxima ação obrigatória;
4. manter limitações e incertezas explícitas.
