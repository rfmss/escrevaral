# M0.9 — Auditoria geral da candidata integrada

Atualizado em: 2026-07-29

Estado: **em execução — duas tranches automatizadas concluídas**

## Resumo executivo

O Mass Notes Next já foi submetido a duas matrizes transversais que usam capacidades de gates diferentes na mesma sessão. A cobertura atual comprova que escrita, metadados, biblioteca, cinco superfícies linguísticas, conflitos, exportação, cópia nativa, restauração, importação legada, responsividade e escala funcional convivem sem perda silenciosa de dados.

A matriz chegou a **119 cenários por navegador, 238 execuções**, integralmente aprovadas em Chromium e Firefox. O pipeline publicou a preview, renovou o cache e confirmou o endereço público. Argila e coerência global também ficaram verdes.

Não foram encontrados P0 ou P1 de produto.

O produto apresenta prontidão alta para beta fechada. Ainda não deve receber veredito final de lançamento público ou substituição integral do Escrevaral antigo: faltam contrato PWA/offline próprio, decisão sobre Prova de Autoria, paridade avançada de exportação e fases manuais com tecnologias assistivas, dispositivos reais, rede completa e desempenho medido.

## Veredito provisório

- **Beta fechada:** `SHIP COM CONDIÇÕES` — confiança alta para uma beta online e controlada, condicionada ao fechamento das fases manuais e à aceitação explícita dos P2.
- **Lançamento público:** `NO-SHIP` provisório — falta contrato offline/release da aplicação nova e fechamento integral da auditoria.
- **Substituir o Escrevaral antigo:** `NO-SHIP` — faltam capacidades públicas antigas importantes ou decisão explícita de aposentadoria.

Este não é o veredito final do milestone.

## Linha de base funcional atual

- branch: `experiment/mass-notes-tiptap`;
- PR `#155`: aberto, mesclável, não incorporado e em rascunho;
- cabeça funcional da tranche 2: `2a4333337a04b73a6c034b8fd35bc582994a114b`;
- Mass Notes `30467582850`: 238/238, publicação, cache e smoke público verdes;
- Argila `30467583011`: verde;
- coerência `30467584508`: verde;
- `main`, aplicação pública e service worker público intactos.

## Escopo executado

### Jornada de escrita e retomada

Aprovados:

- criação de página;
- título e texto;
- estado, favorito e tags;
- autosave e salvamento explícito;
- recarga e retomada;
- cartão ativo consistente;
- organização sem incrementar revisão ou descartar o rascunho.

### Engines em sequência

Executadas na mesma página:

- Revisão com trecho localizado;
- Espelho de Voz;
- Termos que pedem contexto;
- RimaLab;
- Palavras/Léxico.

Depois da sequência:

- texto idêntico;
- `revision` idêntica;
- `plainText` idêntico;
- nenhuma substituição automática;
- nenhum vazamento da frase sentinela em URL ou corpo de requisição.

### Conflito misto entre abas

Uma aba alterou o manuscrito e outra alterou metadados.

Aprovados:

- conflito explícito;
- mensagem de preservação;
- guardar versão local como cópia;
- documento remoto preservado;
- cópia local favorita preservada;
- identidades distintas no IndexedDB;
- nenhuma sobrescrita silenciosa.

Observação: a preferência de documento ativo é compartilhada entre abas. Criar a cópia pode mudar o documento que outra aba abrirá após recarga, sem apagar sua versão. Isso foi registrado como P3 de previsibilidade, não como perda de dados.

### Exportação do rascunho atual

Depois de salvar uma versão anterior, título e texto foram alterados e o Markdown foi exportado enquanto o estado ainda era `Alterado|Salvando`.

Aprovados:

- arquivo contém título e texto atuais;
- exportação usa o estado React/Tiptap, não uma cópia antiga do IndexedDB;
- autosave converge depois para `Salvo`.

### Portabilidade combinada

Na mesma sessão:

1. biblioteca exportada como cópia nativa;
2. envelope restaurado como novas cópias;
3. página ativa mantida;
4. `.esc` legado selecionado e pré-visualizado;
5. cancelamento sem escrita;
6. nova seleção e confirmação;
7. UUID novo, sufixo `— importado` e `legacySourceId` preservado;
8. nenhum documento substituído.

### Responsividade integrada

Aprovado em 320 e 390 px:

- drawer;
- sete abas;
- ausência de overflow horizontal bloqueador;
- Escape;
- retorno de foco.

### Escala funcional

Aprovado:

- 100 documentos no IndexedDB;
- documento ativo acima de 100 mil caracteres;
- editor editável;
- 100 cartões renderizados;
- busca funcional;
- página ativa preservada fora do recorte.

O teste comprova funcionamento, não estabelece orçamento de latência ou memória.

## Incidentes de estabilização

Todos foram classificados como contratos de teste, sem alteração funcional no produto.

### Autosave no RimaLab

O Firefox pode atravessar `Alterado|Salvando` e já estar em `Salvo` antes da asserção. Os helpers passaram a aceitar qualquer estado de persistência válido e continuam exigindo convergência final exata para `Salvo`.

### Exportação

Um salvamento preliminar redundante era exigido antes do paste do conteúdo real. Ele foi removido; a validação passou a ocorrer sobre o conteúdo efetivamente exportado.

### Conflito e seleção ativa

O teste exigia que uma aba recarregada reabrisse a versão remota, embora a chave compartilhada de documento ativo já apontasse para a cópia. O contrato passou a ser testado pela preservação dos dois registros, sem inventar seleção persistida independente por aba.

### Falha simulada do RimaLab

O cenário de exceção simulada passou a estabilizar o documento antes da primeira leitura. Seu objetivo é testar isolamento após falha da engine, não corrida com atualização ainda em trânsito.

## Placar provisório

| Área | Nota | Confiança | Fundamentação |
|---|---:|---|---|
| Editor e preservação | 94 | alta | autosave, recarga, conflito misto e duas versões preservadas |
| Biblioteca | 90 | alta | filtros, escala e página ativa preservada |
| Engines | 86 | média-alta | cinco superfícies em sequência; corpus ampliado pendente |
| UIX | 82 | média | gates visuais e mobile integrado; heurística manual pendente |
| Acessibilidade | 80 | média | teclado, foco e drawers; tecnologias assistivas reais pendentes |
| Responsividade | 89 | alta | 320/390 e regressões anteriores; dispositivos reais pendentes |
| Importação e exportação | 88 | alta no escopo atual | rascunho imediato e portabilidade combinada aprovados |
| Privacidade | 92 | média-alta | local-first e sentinela de rede; observação integral pendente |
| Desempenho | 84 | média | 100 páginas/100 mil caracteres; sem orçamento de memória/latência |
| Release | 72 | alta | preview e CI fortes; aplicação nova sem service worker próprio |
| **Geral provisória** | **87** | **alta para beta** | candidata forte para beta, incompleta para lançamento/substituição |

## Achados

### P0

Nenhum aberto.

### P1

Nenhum aberto.

### P2

#### M09-F001 — aplicação nova sem contrato PWA/offline próprio

A aplicação pública antiga possui service worker e atualização offline auditada. A nova fundação ainda depende da preview Vite e não possui contrato próprio de instalação, cache e retomada offline.

Decisão atual: bloqueia lançamento público; não bloqueia necessariamente beta fechada online.

#### M09-F002 — Prova de Autoria ausente

A assinatura e marca temporal locais do produto antigo não possuem superfície equivalente.

Decisão atual: bloqueia substituição integral enquanto não houver retorno ou aposentadoria explícita da promessa.

#### M09-F003 — paridade de exportação incompleta

A nova aplicação exporta TXT, Markdown e HTML. O produto antigo também oferecia DOCX, RTF, ePub e Obsidian ZIP.

Decisão atual: não bloqueia beta fechada; bloqueia paridade integral para fluxos dependentes.

### P3

#### M09-F004 — preferências da biblioteca não persistem

Busca, filtros e ordenação retornam ao padrão em nova sessão. Gate 14 permanece suspenso até o veredito.

#### M09-F005 — documento ativo compartilhado entre abas

A chave de documento ativo em `localStorage` é global para a origem. Guardar conflito como cópia pode mudar qual documento outra aba abre ao recarregar.

Não houve perda de dados. Reavaliar antes de prometer sessões independentes por aba.

## Paridade provisória

| Área antiga | Classificação atual | Observação |
|---|---|---|
| Análise Geral | preservada parcialmente | integrada e observável; corpus ampliado pendente |
| Sintaxe/Morfologia | presente como capacidade interna | usada por Revisão/Palavras; superfície autônoma não comprovada |
| Pontuação | preservada parcialmente | ranges UTF-16 e navegação aprovados |
| Espelho de Voz | preservada parcialmente | leitura completa exposta; corpus ampliado pendente |
| RimaLab | preservada parcialmente | prosa, verso, estrutura e falha controlada testados |
| Léxico | preservada parcialmente | definição e contexto expostos |
| Sinônimos | capacidade interna/parcial | experiência e catálogo ainda precisam medição |
| Decolonial | preservada parcialmente | Contexto integrado e cuidadoso |
| Exportação | preservada parcialmente | TXT/MD/HTML; faltam quatro famílias antigas |
| Prova de Autoria | ausente | exige decisão explícita |
| PWA/offline | ausente na aplicação nova | exige gate de release próprio |

## Trabalho pendente

- auditoria heurística manual completa de UIX;
- zoom 200%, movimento reduzido e leitores de tela/dispositivos reais;
- observação integral de rede para todas as jornadas;
- recuperação emergencial em jornada transversal;
- sessão prolongada e medição de latência/memória;
- corpus ampliado por engine;
- decisão explícita para cada P2;
- veredito final e cabeça documental exata.

## Próxima ação

Executar a tranche final de auditoria não funcional:

1. UIX heurística nas seis larguras;
2. acessibilidade ampliada;
3. rede integral;
4. desempenho medido e sessão prolongada;
5. corpus consolidado por engine;
6. decisões finais para P2;
7. veredito final.
