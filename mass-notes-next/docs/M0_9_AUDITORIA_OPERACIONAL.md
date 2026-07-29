# M0.9 — Auditoria operacional viva

Atualizado em: 2026-07-29

## Função

Este arquivo é a memória operacional executável do milestone **M0.9 — Candidata Integrada do Escrevaral**. Ele permite retomar a auditoria sem histórico de conversa e mantém decisões, achados, notas, severidades e evidências sincronizados.

Atualize este documento sempre que houver mudança de escopo, decisão importante, novo P0/P1/P2, alteração de severidade, correção aceita, nova evidência ou mudança de veredito.

## Estado executivo

- branch: `experiment/mass-notes-tiptap`;
- PR `#155`: aberto, mesclável, não incorporado e em rascunho;
- preview: `preview-mass-notes-tiptap`;
- milestone: **em execução — três tranches automatizadas concluídas**;
- Gates 1 a 13 e Gate 10.5: concluídos;
- matriz atual: **126 cenários por navegador, 252 execuções**;
- cabeça funcional da tranche 3: `305d0727ddfaee11f3e7680d0f9168023e9a4284`;
- Mass Notes `30478738806`, Argila `30478738678` e coerência `30478738607`: verdes;
- nota provisória: **88/100**;
- beta fechada: `SHIP COM CONDIÇÕES` provisório;
- lançamento público: `NO-SHIP` provisório;
- substituição integral: `NO-SHIP` provisório;
- P0 abertos: 0;
- P1 abertos: 0;
- próxima ação: validação manual real, decisões finais para P2 e veredito final.

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
12. Automação equivalente não pode ser apresentada como validação manual ou física.
13. O milestone só termina com evidência na cabeça exata, sem commit posterior.

## Linha de base

Concluído:

- branch, PR e workflows conferidos;
- Gate 13 fechado em log, contrato global, changelog e memória;
- relatório humano e JSON M0.9 criados;
- contrato global M0.9 criado;
- três tranches automatizadas executadas;
- conflitos, exportação imediata, portabilidade combinada e recuperação emergencial cobertos;
- seis larguras, zoom CSS equivalente, movimento reduzido, rede integral e sessão prolongada automatizados;
- corpus separado para as cinco superfícies de engines consolidado.

Pendente:

- auditoria heurística humana das capturas e da navegação;
- zoom real de 200% no navegador;
- leitores de tela, tecnologias assistivas e dispositivos físicos;
- decisão explícita sobre a dependência externa da Anatomia;
- decisões finais sobre todos os P2;
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
- página ativa preservada durante restauração/importação;
- recuperação emergencial retoma o mesmo documento, converge para `Salvo`, avança revisão, não duplica página e limpa o envelope temporário;
- doze ciclos consecutivos de edição e salvamento sem exceção de página.

Pendente:

- uso humano prolongado em dispositivo real.

### 2 — Engines

Estado: **forte automatizado, manual pendente**.

Aprovados:

- Revisão, Voz, Contexto, RimaLab e Palavras em sequência sem alterar texto, `plainText` ou `revision`;
- corpus próprio para cada superfície;
- Revisão com `PONT-49` localizado pelo contrato UTF-16 real;
- snapshot semântico do ProseMirror preservado antes e depois de cada engine.

Pendente:

- leitura qualitativa humana de corpora mais extensos e diversos.

### 3 — Portabilidade e preservação

Estado: **forte no escopo atual**.

Aprovados:

- exportação usa o rascunho React/Tiptap atual, mesmo antes da persistência convergir;
- cópia nativa, restauração e `.esc` legado coexistem na mesma sessão;
- cancelar prévia não grava;
- UUIDs novos, ausência de substituição e `legacySourceId` preservado.

Paridade avançada continua ausente: DOCX, RTF, ePub e Obsidian ZIP.

### 4 — UIX e design

Estado: **forte automatizado, heurística humana pendente**.

Aprovados em 320, 390, 768, 1024, 1280 e 1440 px:

- papel, título e editor dentro do viewport;
- ausência de overflow horizontal bloqueador;
- acionadores móveis separados e alcançáveis;
- drawers abríveis e fecháveis;
- rails desktop presentes;
- screenshots produzidos por navegador e largura.

Pendente:

- revisão humana das capturas, hierarquia visual, densidade, conforto e prazer de uso.

### 5 — Acessibilidade

Estado: **parcial forte**.

Aprovados:

- teclado, tabs, Escape e retorno de foco;
- layout CSS equivalente a uma janela 1280×900 em zoom de 200%;
- `prefers-reduced-motion: reduce` reconhecido em Chromium e Firefox;
- transição editorial reduzida para até 300 ms e navegação sem cortina presa.

Pendente:

- zoom real de 200% no navegador;
- leitores de tela;
- navegação por tecnologias assistivas;
- dispositivos físicos.

### 6 — Privacidade e rede

Estado: **forte quanto a dados autorais, incompleto quanto a autonomia de rede**.

Aprovados:

- frase sentinela autoral ausente de URL e corpo de toda requisição observada durante escrita, cinco engines e Anatomia;
- nenhuma origem externa inesperada além da dependência conhecida da Anatomia.

Achado:

- a Anatomia faz GET para `https://unpkg.com/page-flip@2.0.7/dist/js/page-flip.browser.js`;
- a requisição não leva texto autoral;
- a dependência impede uma promessa integral de autonomia/offline e foi registrada como `M09-F006` P2.

### 7 — Desempenho e resistência

Estado: **forte como regressão de CI, dispositivo real pendente**.

Aprovados:

- 100 páginas e documento acima de 100 mil caracteres utilizáveis;
- doze ciclos de edição e salvamento sem erro;
- quantidade de documentos estável;
- DOM estável em 179 nós;
- Chromium: p95 de salvamento observado em 192 ms, heap 16.100.000 bytes no início e no fim;
- Firefox: p95 observado em 90 ms; API de heap indisponível;
- limites defensivos: p95 abaixo de 8 s, crescimento de DOM até 120 nós e heap até 64 MiB quando mensurável.

Os números são sinais de regressão na CI, não benchmark universal nem SLA.

### 8 — Release

Estado: **pipeline forte, lançamento público bloqueado**.

Build, Chromium, Firefox, publicação, cache, smoke público, Argila e coerência estão verdes. A aplicação nova continua sem service worker/PWA próprio e a Anatomia ainda depende de script externo em tempo de execução.

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
9. cópia nativa → restauração → `.esc` cancelar → `.esc` confirmar na mesma sessão;
10. seis larguras → geometria, drawers, rails e screenshots;
11. zoom CSS equivalente a 200% → escrita e drawers alcançáveis;
12. movimento reduzido → transição curta e reversível;
13. rede integral → nenhuma transmissão autoral, dependência externa conhecida registrada;
14. recuperação emergencial → mesmo documento, revisão avançada, envelope limpo;
15. sessão prolongada → latência, DOM, heap e erros observados;
16. corpus separado → cinco engines sem mutar snapshot semântico.

Pendentes:

1. edição rica → Revisão → mudança editorial → marcas preservadas em jornada transversal dedicada;
2. seleção lexical → troca de superfície → retorno em jornada dedicada;
3. tecnologias assistivas e dispositivos reais;
4. revisão heurística humana das capturas;
5. decisões finais sobre P2.

## Severidade

- **P0:** perda/corrupção, exposição autoral, inutilização ou sobrescrita silenciosa.
- **P1:** fluxo principal quebrado, engine enganosa ou acessibilidade bloqueadora.
- **P2:** defeito relevante, inconsistência importante ou lacuna de paridade/release.
- **P3:** acabamento, clareza ou melhoria não bloqueadora.

## Placar provisório

| Área | Nota | Estado | Evidência principal |
|---|---:|---|---|
| Editor e preservação | 96 | forte, manual pendente | conflito, recuperação e sessão prolongada |
| Biblioteca | 91 | forte | filtros sem mutação, escala e estabilidade |
| Engines | 90 | forte automatizado | sequência + corpus separado sem mutação |
| UIX | 87 | forte automatizado | seis larguras e screenshots; heurística humana pendente |
| Acessibilidade | 84 | parcial forte | teclado, zoom equivalente e movimento reduzido; tecnologias reais pendentes |
| Responsividade | 94 | forte | seis larguras sem overflow bloqueador |
| Importação e exportação | 88 | forte no escopo atual | rascunho imediato + portabilidade combinada |
| Privacidade | 90 | dados autorais fortes, autonomia incompleta | nenhuma fuga autoral; dependência externa conhecida |
| Desempenho | 88 | forte como regressão de CI | escala, 12 ciclos, DOM/heap/p95 observados |
| Release | 68 | bloqueado | sem PWA própria e com dependência externa da Anatomia |
| **Geral** | **88** | **provisório** | forte para beta online, incompleto para público/substituição |

## Registro de decisões

| Data | ID | Decisão | Razão | Impacto |
|---|---|---|---|---|
| 2026-07-29 | M09-D001 | Executar M0.9 antes do Gate 14. | Produto atingiu massa crítica. | Gate 14 suspenso. |
| 2026-07-29 | M09-D002 | Auditoria é memória operacional viva. | Decisões não podem depender da conversa. | Este arquivo é leitura obrigatória. |
| 2026-07-29 | M09-D003 | Preservar PR em rascunho e `main` intacta. | Auditoria não autoriza promoção. | Nenhum merge/release. |
| 2026-07-29 | M09-D004 | Avaliar beta, lançamento e substituição separadamente. | Objetivos têm exigências distintas. | Três vereditos. |
| 2026-07-29 | M09-D005 | Estados intermediários do autosave não precisam ser observáveis. | Firefox pode convergir diretamente para `Salvo`. | Estado final `Salvo` continua obrigatório. |
| 2026-07-29 | M09-D006 | Notas e vereditos permanecem provisórios. | Validação humana real ainda falta. | M0.9 continua aberto. |
| 2026-07-29 | M09-D007 | Registrar SHA exato no PR após CI. | Evita ciclo de commit autorreferente. | Evidência verificável. |
| 2026-07-29 | M09-D008 | Conflito é avaliado pela preservação das versões, não pela seleção ativa após recarga. | Preferência ativa é compartilhada e o contrato não promete independência persistida. | Novo P3 de previsibilidade. |
| 2026-07-29 | M09-D009 | Cenário de falha simulada do RimaLab estabiliza a fonte antes da primeira leitura. | Testa isolamento após exceção, não corrida. | Produto permaneceu intacto. |
| 2026-07-29 | M09-D010 | Zoom CSS equivalente não vale como zoom real nem tecnologia assistiva. | Automação não reproduz integralmente browser, sistema e dispositivo. | Validação manual continua pendente. |
| 2026-07-29 | M09-D011 | A origem externa da Anatomia deve permanecer observável e exatamente restrita. | A auditoria encontrou dependência real, sem vazamento autoral. | Novo P2; qualquer outra origem continua falhando. |
| 2026-07-29 | M09-D012 | Métricas de CI são detector de regressão, não SLA. | Runner não representa todos os dispositivos. | Números não viram promessa pública. |
| 2026-07-29 | M09-D013 | Não mutação de engines usa o snapshot semântico do ProseMirror. | `innerText` varia na serialização visual entre navegadores. | Contrato autoral permanece estrutural e verificável. |

## Registro de achados

| ID | Severidade | Área | Estado | Resumo | Decisão |
|---|---|---|---|---|---|
| M09-F001 | P2 | release | aberto | aplicação nova sem service worker/PWA próprio | bloqueia lançamento público |
| M09-F002 | P2 | paridade | aberto | Prova de Autoria ausente | bloqueia substituição integral sem decisão explícita |
| M09-F003 | P2 | portabilidade | aberto | faltam DOCX, RTF, ePub e Obsidian ZIP | não bloqueia beta; bloqueia paridade integral |
| M09-F004 | P3 | biblioteca | aceito | filtros/ordenação não persistem | avaliar após veredito |
| M09-F005 | P3 | múltiplas abas | aceito provisoriamente | documento ativo é preferência compartilhada | reavaliar antes de prometer sessões independentes |
| M09-F006 | P2 | release/rede | aberto | Anatomia carrega `page-flip@2.0.7` do `unpkg` em tempo de execução | vendorizar/remover antes de promessa offline ou lançamento público |

## Registro de evidências

| Data | Cabeça | Evidência | Resultado |
|---|---|---|---|
| 2026-07-29 | `323e8a1e131a3692932e960e9285570df49a1460` | Gate 13 | 222/222, preview, Argila e coerência verdes |
| 2026-07-29 | `a3989f8dfe24cd8a8d035a2c494f5263f1bd3510` | tranche 1 | 232/232, Mass Notes `30463426867`, Argila `30463426847`, coerência `30463426811` |
| 2026-07-29 | `2a4333337a04b73a6c034b8fd35bc582994a114b` | tranche 2 funcional | 238/238, Mass Notes `30467582850`, Argila `30467583011`, coerência `30467584508` |
| 2026-07-29 | `623893b731103e5e292dc245503dfd9e27a88fb5` | documentação tranche 2 | 238/238, Mass Notes `30468995728`, Argila `30469003626`, coerência `30468994715` |
| 2026-07-29 | `305d0727ddfaee11f3e7680d0f9168023e9a4284` | tranche 3 funcional | 252/252, Mass Notes `30478738806`, Argila `30478738678`, coerência `30478738607`; smoke e artefato verdes |

A evidência da cabeça documental final desta tranche será anexada ao PR depois da conclusão dos workflows, sem novo commit no branch.

## Paridade com o Escrevaral antigo

| Área antiga | Estado no produto novo | Lacuna |
|---|---|---|
| Análise Geral | preservada parcialmente | ampliar avaliação humana de corpus |
| Sintaxe/Morfologia | capacidade interna | superfície autônoma não comprovada |
| Pontuação | preservada parcialmente | automatizada com posições reais |
| Espelho de Voz | preservada parcialmente | avaliação qualitativa humana pendente |
| RimaLab | preservada parcialmente | corpus automatizado aprovado |
| Léxico | preservada parcialmente | catálogo e sinônimos ainda limitados |
| Sinônimos | capacidade interna/parcial | experiência pública não comprovada |
| Decolonial | preservada parcialmente | categorias e bordas humanas pendentes |
| Exportação | preservada parcialmente | faltam DOCX/RTF/ePub/Obsidian |
| Prova de Autoria | ausente | exige decisão explícita |
| PWA/offline | ausente na aplicação nova | service worker ausente e Anatomy externa |

## Entregáveis

Criados:

- memória operacional viva;
- relatório humano;
- JSON estruturado;
- suítes transversais integrada e não funcional;
- logs das tranches 1, 2 e 3;
- contratos globais do Gate 13 e M0.9;
- README, índice, PLAN, MEMORY e CHANGELOG sincronizados.

Pendentes:

- validação manual real;
- decisões finais dos P2;
- veredito final;
- cabeça documental final validada sem commit posterior.

## Critério de encerramento

O milestone só encerra quando não houver P0 aberto, todo P1 tiver decisão explícita, a matriz integral estiver verde, os P2 tiverem decisão de produto, as validações manuais necessárias estiverem registradas honestamente, workflows e preview estiverem verdes, o veredito final estiver documentado e o PR continuar em rascunho e não incorporado.

## Próxima ação autorizada

1. revisar humanamente as capturas das seis larguras;
2. executar zoom real de 200%, leitor de tela e dispositivos físicos quando disponíveis;
3. tomar decisão explícita para `M09-F001`, `M09-F002`, `M09-F003` e `M09-F006`;
4. emitir veredito final separado para beta, lançamento e substituição;
5. sincronizar documentação;
6. validar a cabeça documental exata;
7. atualizar somente o corpo do PR, sem commit posterior;
8. manter Gate 14 suspenso até o encerramento explícito.
