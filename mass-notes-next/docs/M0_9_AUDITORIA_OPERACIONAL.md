# M0.9 — Auditoria operacional viva

Atualizado em: 2026-07-29

## Função

Este arquivo é a memória operacional executável do milestone **M0.9 — Candidata Integrada do Escrevaral**. Ele permite retomar a auditoria sem histórico de conversa e mantém decisões, achados, notas, severidades e evidências sincronizados.

Atualize este documento sempre que houver mudança de escopo, decisão importante, novo P0/P1/P2, alteração de severidade, correção aceita, nova evidência ou mudança de veredito.

## Estado executivo

- branch: `experiment/mass-notes-tiptap`;
- PR `#155`: aberto, mesclável, não incorporado e em rascunho;
- preview: `preview-mass-notes-tiptap`;
- milestone: **em execução — duas tranches automatizadas concluídas**;
- Gates 1 a 13 e Gate 10.5: concluídos;
- matriz atual: **119 cenários por navegador, 238 execuções**;
- cabeça funcional da tranche 2: `2a4333337a04b73a6c034b8fd35bc582994a114b`;
- Mass Notes `30467582850`, Argila `30467583011` e coerência `30467584508`: verdes;
- nota provisória: **87/100**;
- beta fechada: `SHIP COM CONDIÇÕES` provisório;
- lançamento público: `NO-SHIP` provisório;
- substituição integral: `NO-SHIP` provisório;
- P0 abertos: 0;
- P1 abertos: 0;
- próxima ação: fases manuais, corpus ampliado, desempenho medido e decisões finais para P2.

A cabeça documental exata e seus workflows devem ser registrados no corpo do PR depois da CI. Inserir o próprio SHA em um arquivo cria outro commit e invalida a evidência.

## Pergunta central

> O Mass Notes Next já pode ser usado de forma recorrente, segura, compreensível e prazerosa por uma pessoa que escreve em português brasileiro?

Responder separadamente:

1. pronto para beta fechada?
2. pronto para lançamento público?
3. pronto para substituir o Escrevaral antigo?

## Regras imutáveis

1. Auditar antes de corrigir.
2. Não adicionar feature durante o diagnóstico.
3. Não editar `preview-mass-notes-tiptap` diretamente.
4. Não promover para `main`.
5. Manter o PR em rascunho.
6. Não enfraquecer testes para obter verde.
7. Diferenciar defeito real, contrato antigo, instabilidade temporal, limitação conhecida e item fora de escopo.
8. Correção durante a auditoria só remove P0 ou bloqueio da medição.
9. Toda correção deve ser mínima, documentada e seguida pela matriz completa.
10. Nenhum texto autoral pode sair em requisição de rede.
11. Engine integrada exige entrada real, saída observável e teste de borda.
12. O milestone só termina com evidência na cabeça exata, sem commit posterior.

## Linha de base

Concluído:

- branch, PR e workflows conferidos;
- Gate 13 fechado em log, contrato global, changelog e memória;
- relatório humano e JSON M0.9 criados;
- contrato global M0.9 criado;
- duas tranches automatizadas executadas;
- conflitos, exportação imediata e portabilidade combinada cobertos.

Pendente:

- auditoria heurística manual integral;
- acessibilidade com zoom, movimento reduzido, tecnologias assistivas e dispositivos reais;
- observação completa de rede;
- sessão prolongada e medição de latência/memória;
- corpus ampliado por engine;
- decisões finais sobre P2;
- veredito final;
- CI na cabeça documental final e atualização do PR sem commit posterior.

## Fases

### 1 — Jornadas integradas

Estado: **forte, ainda não final**.

Aprovados:

- criação, escrita, metadados, autosave e recarga;
- organização sem descartar a página ativa;
- conflito real misto entre manuscrito e metadados;
- preservação das duas versões no IndexedDB;
- página ativa preservada durante restauração/importação.

Pendente:

- sessão prolongada manual;
- recuperação emergencial integrada em cenário transversal completo.

### 2 — Engines

Estado: **parcial forte**.

Revisão, Voz, Contexto, RimaLab e Palavras foram executadas em sequência sem alterar texto, `plainText` ou `revision`. Corpus ampliado consolidado ainda está pendente.

### 3 — Portabilidade e preservação

Estado: **forte no escopo atual**.

Aprovados:

- exportação usa o rascunho React/Tiptap atual, mesmo antes da persistência convergir;
- cópia nativa, restauração e `.esc` legado coexistem na mesma sessão;
- cancelar prévia não grava;
- UUIDs novos, ausência de substituição e `legacySourceId` preservado.

Paridade avançada continua ausente: DOCX, RTF, ePub e Obsidian ZIP.

### 4 — UIX e design

Estado: **parcial**.

320 e 390 px aprovados na jornada integrada. Heurística manual e larguras 768, 1024, 1280 e 1440 ainda precisam de consolidação transversal.

### 5 — Acessibilidade

Estado: **parcial**.

Teclado, tabs, Escape e retorno de foco aprovados. Zoom 200%, movimento reduzido, leitores de tela e dispositivos reais pendentes.

### 6 — Privacidade e rede

Estado: **parcial forte**.

Frase sentinela autoral ausente de URL e corpo de requisição durante as engines. Observação completa de todas as jornadas pendente.

### 7 — Desempenho e resistência

Estado: **parcial**.

100 páginas e documento acima de 100 mil caracteres permaneceram utilizáveis. Ainda não há orçamento medido de latência, memória ou sessão prolongada.

### 8 — Release

Estado: **parcial forte**.

Build, Chromium, Firefox, publicação, cache, smoke público, Argila e coerência verdes. A aplicação nova continua sem service worker/PWA próprio.

## Matriz transversal

Concluídos:

1. escrita → metadados → autosave → recarga;
2. Revisão → Voz → Contexto → RimaLab → Palavras sem mutação;
3. busca/filtros → página ativa fora do recorte → revisão preservada;
4. mobile 320/390 → sete abas → foco e ausência de overflow;
5. 100 páginas + documento acima de 100 mil caracteres;
6. sentinela de rede durante engines;
7. conflito misto real → guardar versão local como cópia → ambas preservadas;
8. exportação Markdown do rascunho ainda alterado;
9. cópia nativa → restauração → `.esc` cancelar → `.esc` confirmar na mesma sessão.

Pendentes:

1. edição rica → Revisão → mudança editorial → marcas preservadas em jornada transversal dedicada;
2. seleção lexical → troca de superfície → retorno em jornada dedicada;
3. recuperação emergencial após falha integrada;
4. tecnologias assistivas/dispositivos reais;
5. rede integral;
6. desempenho medido e sessão prolongada;
7. corpus ampliado por engine.

## Severidade

- **P0:** perda/corrupção, exposição autoral, inutilização ou sobrescrita silenciosa.
- **P1:** fluxo principal quebrado, engine enganosa ou acessibilidade bloqueadora.
- **P2:** defeito relevante, inconsistência importante ou lacuna de paridade.
- **P3:** acabamento, clareza ou melhoria não bloqueadora.

## Placar provisório

| Área | Nota | Estado | Evidência principal |
|---|---:|---|---|
| Editor e preservação | 94 | forte, incompleto | conflito misto e duas versões preservadas |
| Biblioteca | 90 | forte | filtros sem mutação; 100 páginas |
| Engines | 86 | forte, corpus pendente | cinco superfícies em sequência |
| UIX | 82 | parcial | mobile integrado; heurística pendente |
| Acessibilidade | 80 | parcial | teclado/foco; tecnologias reais pendentes |
| Responsividade | 89 | forte | 320/390 e regressões anteriores |
| Importação e exportação | 88 | forte no escopo atual | rascunho imediato + portabilidade combinada |
| Privacidade | 92 | parcial forte | local-first + sentinela verde |
| Desempenho | 84 | funcional, sem orçamento | 100 páginas/100 mil caracteres |
| Release | 72 | incompleto | pipeline forte; PWA própria ausente |
| **Geral** | **87** | **provisório** | forte para beta, incompleto para público/substituição |

## Registro de decisões

| Data | ID | Decisão | Razão | Impacto |
|---|---|---|---|---|
| 2026-07-29 | M09-D001 | Executar M0.9 antes do Gate 14. | Produto atingiu massa crítica. | Gate 14 suspenso. |
| 2026-07-29 | M09-D002 | Auditoria é memória operacional viva. | Decisões não podem depender da conversa. | Este arquivo é leitura obrigatória. |
| 2026-07-29 | M09-D003 | Preservar PR em rascunho e `main` intacta. | Auditoria não autoriza promoção. | Nenhum merge/release. |
| 2026-07-29 | M09-D004 | Avaliar beta, lançamento e substituição separadamente. | Objetivos têm exigências distintas. | Três vereditos. |
| 2026-07-29 | M09-D005 | Estados intermediários do autosave não precisam ser observáveis. | Firefox pode convergir diretamente para `Salvo`. | Estado final `Salvo` continua obrigatório. |
| 2026-07-29 | M09-D006 | Notas e vereditos permanecem provisórios. | Fases manuais ainda faltam. | M0.9 continua aberto. |
| 2026-07-29 | M09-D007 | Registrar SHA exato no PR após CI. | Evita ciclo de commit autorreferente. | Evidência verificável. |
| 2026-07-29 | M09-D008 | Conflito é avaliado pela preservação das versões, não pela seleção ativa após recarga. | A preferência ativa é compartilhada entre abas e o contrato não promete independência persistida. | Novo P3 de previsibilidade. |
| 2026-07-29 | M09-D009 | Cenário de falha simulada do RimaLab estabiliza a fonte antes da primeira leitura. | O objetivo é testar isolamento após exceção, não corrida com atualização em trânsito. | Produto permaneceu intacto. |

## Registro de achados

| ID | Severidade | Área | Estado | Resumo | Decisão |
|---|---|---|---|---|---|
| M09-F001 | P2 | release | aberto | aplicação nova sem service worker/PWA próprio | bloqueia lançamento público |
| M09-F002 | P2 | paridade | aberto | Prova de Autoria ausente | bloqueia substituição integral sem decisão explícita |
| M09-F003 | P2 | portabilidade | aberto | faltam DOCX, RTF, ePub e Obsidian ZIP | não bloqueia beta; bloqueia paridade integral |
| M09-F004 | P3 | biblioteca | aceito | filtros/ordenação não persistem | avaliar após veredito |
| M09-F005 | P3 | múltiplas abas | aceito provisoriamente | documento ativo é preferência compartilhada; criar cópia pode mudar o que outra aba abre ao recarregar | documentar e reavaliar antes de prometer sessões independentes |

## Registro de evidências

| Data | Cabeça | Evidência | Resultado |
|---|---|---|---|
| 2026-07-29 | `323e8a1e131a3692932e960e9285570df49a1460` | Gate 13 | 222/222, preview, Argila e coerência verdes |
| 2026-07-29 | `a3989f8dfe24cd8a8d035a2c494f5263f1bd3510` | tranche 1 | 232/232, Mass Notes `30463426867`, Argila `30463426847`, coerência `30463426811` |
| 2026-07-29 | `c360c19c66756fedb0183a05697cfb982e87f0ae` | primeira execução tranche 2 | 236/238; asserção indevida sobre seleção ativa compartilhada |
| 2026-07-29 | `be6b0003bcac621e9479306984a7307a3598c27e` | segunda execução tranche 2 | 237/238; corrida alheia ao cenário de falha simulada do RimaLab |
| 2026-07-29 | `2a4333337a04b73a6c034b8fd35bc582994a114b` | tranche 2 funcional | 238/238; Mass Notes `30467582850`, Argila `30467583011`, coerência `30467584508`; smoke verde |

A evidência da próxima cabeça documental será anexada ao PR depois dos workflows, sem novo commit no branch.

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
- relatório humano e JSON estruturado;
- suíte transversal com oito cenários por navegador;
- logs das tranches 1 e 2;
- contratos globais do Gate 13 e M0.9;
- documentação de entrada sincronizada.

Pendentes:

- fases manuais e medições;
- decisões finais para P2;
- veredito final;
- cabeça final validada sem commit posterior.

## Critério de encerramento

O milestone só encerra quando não houver P0 aberto, todo P1 tiver decisão explícita, a matriz integral estiver verde, workflows e preview estiverem verdes, veredito final estiver registrado, documentação estiver sincronizada e o PR continuar em rascunho e não incorporado.

## Protocolo de atualização

Ao iniciar: ler este documento, conferir PR/cabeça/workflows, revisar achados e escolher a próxima evidência.

Ao decidir: registrar decisão, atualizar placar/paridade, sincronizar PLAN/MEMORY e registrar evidência.

Ao encerrar: registrar apenas o executado, atualizar a próxima ação e manter limitações explícitas.
