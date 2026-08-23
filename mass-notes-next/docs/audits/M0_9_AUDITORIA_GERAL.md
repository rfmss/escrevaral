# M0.9 — Auditoria geral da candidata integrada

Atualizado em: 2026-07-29

Estado: **em execução — três tranches automatizadas concluídas**

## Resumo executivo

O Mass Notes Next já foi submetido a três matrizes transversais que combinam capacidades de gates diferentes na mesma sessão. A cobertura comprova que escrita, metadados, biblioteca, cinco superfícies linguísticas, conflitos, recuperação emergencial, exportação, cópia nativa, restauração, importação legada, responsividade e escala convivem sem perda silenciosa de dados.

A matriz chegou a **126 cenários por navegador, 252 execuções**, integralmente aprovadas em Chromium e Firefox. O pipeline publicou a preview, renovou o cache e confirmou o endereço público. Argila e coerência global também ficaram verdes.

A tranche 3 acrescentou seis larguras, layout CSS equivalente a zoom de 200%, movimento reduzido, observação integral de rede, recuperação emergencial, doze ciclos de edição/salvamento e corpus separado para cada engine.

Não foram encontrados P0 ou P1 de produto. A auditoria de rede encontrou um P2 real: a Anatomia carrega `page-flip@2.0.7` do `unpkg` em tempo de execução. A requisição não leva conteúdo autoral, mas reforça o bloqueio de autonomia offline e lançamento público.

O produto apresenta prontidão alta para beta fechada online e controlada. Ainda não deve receber veredito final de lançamento público ou substituição integral do Escrevaral antigo: faltam contrato PWA/offline próprio, remoção ou vendorização da dependência externa da Anatomia, decisão sobre Prova de Autoria, paridade avançada de exportação e validação manual real com zoom, leitores de tela e dispositivos físicos.

## Veredito provisório

- **Beta fechada:** `SHIP COM CONDIÇÕES` — confiança alta para uma beta online e controlada, condicionada à aceitação explícita dos P2 e ao registro honesto das validações manuais pendentes.
- **Lançamento público:** `NO-SHIP` provisório — falta contrato offline/release da aplicação nova e a Anatomia ainda depende de origem externa.
- **Substituir o Escrevaral antigo:** `NO-SHIP` — faltam capacidades públicas antigas importantes ou decisão explícita de aposentadoria.

Este não é o veredito final do milestone.

## Linha de base funcional atual

- branch: `experiment/mass-notes-tiptap`;
- PR `#155`: aberto, mesclável, não incorporado e em rascunho;
- cabeça funcional da tranche 3: `305d0727ddfaee11f3e7680d0f9168023e9a4284`;
- Mass Notes `30478738806`: 252/252, publicação, cache e smoke público verdes;
- Argila `30478738678`: verde;
- coerência `30478738607`: verde;
- artefato: `mass-notes-tiptap-30478738806`;
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

### Engines em sequência e corpus separado

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

Na tranche 3, cada superfície também recebeu corpus próprio. A Revisão localizou `PONT-49` pelo contrato UTF-16 real, e o snapshot semântico do ProseMirror permaneceu idêntico antes e depois de cada engine.

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

### Recuperação emergencial

Um envelope emergencial mais novo que o registro persistido foi preparado para o documento ativo.

Aprovados:

- o mesmo documento foi retomado;
- título e texto emergenciais reapareceram;
- a persistência convergiu para `Salvo`;
- a revisão avançou;
- nenhuma página foi duplicada;
- o envelope temporário foi removido depois do salvamento.

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

### Responsividade e UIX automatizada

Aprovado em 320, 390, 768, 1024, 1280 e 1440 px:

- papel, título e editor dentro do viewport;
- ausência de overflow horizontal bloqueador;
- acionadores móveis separados e alcançáveis;
- drawers abríveis e fecháveis;
- rails presentes no desktop;
- screenshots gerados em cada largura e navegador.

A automação comprova invariantes geométricas. A avaliação humana de hierarquia visual, conforto, densidade e prazer continua pendente.

### Zoom equivalente e movimento reduzido

Aprovados:

- viewport CSS 640×450, equivalente a uma janela física 1280×900 em zoom de 200%, com escrita e drawers alcançáveis;
- `prefers-reduced-motion: reduce` reconhecido em Chromium e Firefox;
- transição editorial observada em até 300 ms;
- ida e volta da Anatomia sem cortina presa.

Limite: equivalência de viewport não substitui zoom real do navegador, leitor de tela ou aparelho físico.

### Rede e privacidade

Durante escrita, cinco engines e Anatomia:

- frase sentinela autoral ausente de URL e corpo de toda requisição;
- nenhuma origem externa inesperada;
- uma origem externa conhecida foi observada:
  - `https://unpkg.com/page-flip@2.0.7/dist/js/page-flip.browser.js`;
- a requisição é GET e não contém texto autoral.

O achado foi registrado como P2, não ocultado pelo teste. Qualquer outra origem externa continua fazendo a auditoria falhar.

### Escala e sessão prolongada

Aprovados:

- 100 documentos no IndexedDB;
- documento ativo acima de 100 mil caracteres;
- editor editável;
- 100 cartões renderizados;
- busca funcional;
- página ativa preservada fora do recorte;
- doze ciclos adicionais de edição e salvamento;
- nenhuma exceção de página;
- quantidade de documentos estável;
- DOM em 179 nós no início e no fim.

Métricas observadas no runner:

- Chromium: p95 de salvamento de 192 ms; heap 16.100.000 bytes no início e no fim;
- Firefox: p95 de 90 ms; API de heap indisponível.

Esses dados servem como detector de regressão na CI. Não são benchmark universal, SLA ou promessa para dispositivo real.

## Incidentes de estabilização

Todos os ajustes abaixo foram classificados como contratos de teste ou medição, sem alteração funcional no produto.

### Autosave no RimaLab

O Firefox pode atravessar `Alterado|Salvando` e já estar em `Salvo` antes da asserção. Os helpers passaram a aceitar qualquer estado de persistência válido e continuam exigindo convergência final exata para `Salvo`.

### Exportação

Um salvamento preliminar redundante era exigido antes do conteúdo real. Ele foi removido; a validação passou a ocorrer sobre o arquivo efetivamente exportado.

### Conflito e seleção ativa

O teste exigia que uma aba recarregada reabrisse a versão remota, embora a chave compartilhada de documento ativo já apontasse para a cópia. O contrato passou a ser testado pela preservação dos dois registros.

### Falha simulada do RimaLab

O cenário de exceção simulada passou a estabilizar o documento antes da primeira leitura. Seu objetivo é testar isolamento após falha da engine, não corrida com atualização ainda em trânsito.

### Drawers e nomes acessíveis

A primeira versão da tranche 3 buscava `Arquivo de páginas`; a superfície real se chama `Arquivo de documentos`. O teste foi alinhado ao nome acessível verdadeiro.

### Rede externa da Anatomia

A auditoria inicialmente exigia zero origem externa e revelou a dependência real do `unpkg`. A URL exata passou a ser observada e restrita, enquanto qualquer outra origem ou vazamento autoral continua falhando. O achado virou P2.

### Movimento reduzido transitório

No Firefox, o overlay reduzido desaparece antes de uma leitura posterior de estilo. Um observador instalado antes do clique passou a capturar a duração no instante da criação.

### Texto visual e texto semântico

O `innerText` do Chromium acrescenta linhas visuais entre parágrafos. O corpus multiparágrafo passou a entrar por paste estruturado e a não mutação passou a usar o snapshot semântico real do ProseMirror.

## Placar provisório

| Área | Nota | Confiança | Fundamentação |
|---|---:|---|---|
| Editor e preservação | 96 | alta | autosave, conflito, recuperação e sessão prolongada |
| Biblioteca | 91 | alta | filtros, escala e estabilidade da ativa |
| Engines | 90 | alta automatizada | sequência e corpus separado sem mutação |
| UIX | 87 | média-alta | seis larguras e screenshots; heurística humana pendente |
| Acessibilidade | 84 | média | teclado, zoom equivalente e movimento reduzido; tecnologias reais pendentes |
| Responsividade | 94 | alta | seis larguras sem overflow bloqueador |
| Importação e exportação | 88 | alta no escopo atual | rascunho imediato e portabilidade combinada aprovados |
| Privacidade | 90 | alta quanto ao texto autoral | nenhuma fuga; dependência externa conhecida |
| Desempenho | 88 | média-alta | escala e sessão medida na CI; dispositivo real pendente |
| Release | 68 | alta | pipeline forte; sem PWA própria e Anatomy externa |
| **Geral provisória** | **88** | **alta para beta online** | candidata forte para beta, incompleta para lançamento/substituição |

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

#### M09-F006 — dependência externa da Anatomia

A superfície Anatomia carrega `page-flip@2.0.7` a partir do `unpkg` em tempo de execução.

Não houve transmissão de texto autoral. Porém, a superfície depende de disponibilidade, integridade e política de uma origem externa e não pode compor uma promessa offline integral.

Decisão atual: vendorizar ou remover a dependência antes de lançamento público/offline. Não bloqueia isoladamente uma beta fechada explicitamente online.

### P3

#### M09-F004 — preferências da biblioteca não persistem

Busca, filtros e ordenação retornam ao padrão em nova sessão. Gate 14 permanece suspenso até o veredito.

#### M09-F005 — documento ativo compartilhado entre abas

A chave de documento ativo em `localStorage` é global para a origem. Guardar conflito como cópia pode mudar qual documento outra aba abre ao recarregar.

Não houve perda de dados. Reavaliar antes de prometer sessões independentes por aba.

## Paridade provisória

| Área antiga | Classificação atual | Observação |
|---|---|---|
| Análise Geral | preservada parcialmente | integrada, observável e com corpus automatizado; avaliação humana pendente |
| Sintaxe/Morfologia | presente como capacidade interna | usada por Revisão/Palavras; superfície autônoma não comprovada |
| Pontuação | preservada parcialmente | ranges UTF-16, navegação e corpus aprovados |
| Espelho de Voz | preservada parcialmente | leitura completa e corpus próprio expostos |
| RimaLab | preservada parcialmente | prosa, verso, estrutura, falha e corpus testados |
| Léxico | preservada parcialmente | definição e contexto expostos |
| Sinônimos | capacidade interna/parcial | experiência e catálogo ainda precisam medição |
| Decolonial | preservada parcialmente | Contexto integrado e cuidadoso |
| Exportação | preservada parcialmente | TXT/MD/HTML; faltam quatro famílias antigas |
| Prova de Autoria | ausente | exige decisão explícita |
| PWA/offline | ausente na aplicação nova | service worker ausente e dependência externa da Anatomia |

## Trabalho pendente

- auditoria heurística humana das capturas nas seis larguras;
- zoom real de 200% no navegador;
- leitores de tela, tecnologias assistivas e dispositivos físicos;
- uso prolongado em máquina real;
- decisão explícita para cada P2;
- veredito final e cabeça documental exata.

## Próxima ação

1. revisar humanamente as capturas e fluxos críticos;
2. registrar separadamente o que não pôde ser validado sem hardware/tecnologia assistiva;
3. decidir `M09-F001`, `M09-F002`, `M09-F003` e `M09-F006`;
4. emitir veredito final para beta, lançamento e substituição;
5. validar a cabeça documental final sem commit posterior;
6. manter Gate 14 suspenso até encerramento explícito.
