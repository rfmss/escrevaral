# M0.9 — Auditoria geral da candidata integrada

Atualizado em: 2026-07-29

Estado: **em execução — primeira tranche automatizada concluída**

## Resumo executivo

O Mass Notes Next deixou de ser apenas uma coleção de gates isolados. A primeira matriz transversal comprovou que escrita, metadados, biblioteca, cinco superfícies linguísticas, persistência, responsividade e escala básica convivem na mesma sessão sem mutar silenciosamente o manuscrito.

A matriz aumentou de 222 para 232 execuções e passou integralmente em Chromium e Firefox. A sequência Revisão → Voz → Contexto → RimaLab → Palavras preservou texto e revisão, e o teste de rede não observou o trecho autoral sentinela em URL ou corpo de requisição. Uma biblioteca com 100 páginas e um documento acima de 100 mil caracteres permaneceu editável e pesquisável.

Não foram encontrados P0 ou P1 de produto nesta tranche.

O produto apresenta prontidão alta para beta fechada, mas ainda não deve receber veredito final de lançamento público ou substituição integral do Escrevaral antigo. As principais lacunas são PWA/offline próprio, Prova de Autoria, paridade de exportação e auditorias ainda pendentes com tecnologias assistivas/dispositivos reais.

## Veredito provisório

- **Beta fechada:** `SHIP COM CONDIÇÕES` — provável, condicionado ao fechamento das fases manuais e ao tratamento explícito dos P2.
- **Lançamento público:** `NO-SHIP` provisório — falta contrato offline/release da aplicação nova e fechamento integral da auditoria.
- **Substituir o Escrevaral antigo:** `NO-SHIP` — faltam capacidades públicas antigas importantes.

Este não é o veredito final do milestone.

## Linha de base

- branch: `experiment/mass-notes-tiptap`;
- PR `#155`: aberto, mesclável, não incorporado e em rascunho;
- cabeça funcional da primeira tranche: `a3989f8dfe24cd8a8d035a2c494f5263f1bd3510`;
- Mass Notes `30463426867`: 232/232, publicação, cache e smoke público verdes;
- Argila `30463426847`: verde;
- coerência `30463426811`: verde;
- `main`, aplicação pública e service worker público intactos.

## Escopo já executado

### Jornada integrada

Aprovado:

- criação de página;
- escrita;
- estado `Pronto`;
- favorito;
- tags;
- autosave;
- recarga;
- retomada do documento e metadados;
- cartão ativo consistente.

### Engines em sequência

Aprovado na mesma página:

- Revisão com trecho localizado;
- Espelho de Voz;
- Termos que pedem contexto;
- RimaLab;
- Palavras/Léxico.

Após a sequência:

- texto idêntico;
- `revision` idêntica;
- `plainText` idêntico;
- nenhuma substituição automática;
- nenhum vazamento da frase sentinela em URL ou corpo de requisição.

### Organização

Aprovado:

- busca sem resultado;
- filtro por estado;
- página ativa fora do recorte;
- título e texto permanecem abertos;
- filtros não incrementam revisão;
- limpar filtros restaura o cartão ativo.

### Responsividade integrada

Aprovado em 320 e 390 px:

- abertura do drawer;
- navegação pelas sete abas;
- ausência de overflow horizontal bloqueador;
- Escape fecha;
- foco retorna ao acionador.

### Escala funcional

Aprovado:

- 100 documentos no IndexedDB;
- documento ativo acima de 100 mil caracteres;
- editor permanece editável;
- biblioteca renderiza 100 cartões;
- busca reduz para um cartão;
- página ativa permanece aberta fora do recorte.

O teste comprova funcionamento, não estabelece ainda orçamento de latência ou memória.

## Incidente de estabilização

Primeira execução M0.9:

- 231/232 aprovados;
- os 10 casos transversais novos passaram;
- a única falha ocorreu em teste antigo do RimaLab no Firefox;
- o helper exigia observar `Alterado|Salvando` depois do paste;
- o autosave concluiu antes da asserção e o estado já era `Salvo`.

Decisão:

- classificado como instabilidade temporal de teste;
- produto não alterado;
- helper passou a aceitar `Alterado|Salvando|Salvo` antes de `Ctrl+S`;
- convergência final para `Salvo` continua obrigatória;
- matriz completa repetida e aprovada 232/232.

## Placar provisório

| Área | Nota | Confiança | Fundamentação |
|---|---:|---|---|
| Editor e preservação | 92 | alta | autosave, recarga, conflitos e escala cobertos; falta sessão prolongada manual |
| Biblioteca | 90 | alta | filtros, estabilidade, escala e preservação da ativa aprovados |
| Engines | 86 | média-alta | cinco superfícies em sequência sem mutação; falta cobertura manual de corpus ampliado |
| UIX | 82 | média | design por gates e responsividade aprovados; heurística manual integral pendente |
| Acessibilidade | 80 | média | teclado, foco, drawers e nomes automatizados; leitores de tela reais pendentes |
| Responsividade | 89 | alta | 320/390 e matrizes anteriores; tablet/dispositivo real pendente |
| Importação e exportação | 83 | alta no escopo atual | formatos atuais e importações seguras; paridade avançada ausente |
| Privacidade | 92 | média-alta | processamento local e sentinela de rede; auditoria completa de todas as requisições ainda pendente |
| Desempenho | 84 | média | 100 páginas/100 mil caracteres funcionais; sem orçamento de memória/latência |
| Release | 72 | alta | preview e CI fortes; aplicação nova sem service worker próprio e ainda não promovida |
| **Geral provisória** | **85** | **média-alta** | candidata forte para beta, incompleta para lançamento/substituição |

## Achados

### P0

Nenhum aberto nesta tranche.

### P1

Nenhum aberto nesta tranche.

### P2

#### M09-F001 — aplicação nova sem contrato PWA/offline próprio

Área: release.

A aplicação pública antiga possui service worker e atualização offline auditada. O Mass Notes Next ainda depende apenas da preview Vite e não possui contrato próprio de instalação, cache e retomada offline.

Decisão atual: bloqueia lançamento público; não bloqueia necessariamente beta fechada online.

#### M09-F002 — Prova de Autoria ausente

Área: paridade.

A capacidade pública antiga de assinatura e marca temporal local não possui superfície equivalente na nova aplicação.

Decisão atual: bloqueia substituição integral; decisão de produto futura deve definir se retorna ou é aposentada explicitamente.

#### M09-F003 — paridade de exportação incompleta

Área: portabilidade.

A nova aplicação exporta TXT, Markdown e HTML. O produto antigo também oferecia DOCX, RTF, ePub e Obsidian ZIP.

Decisão atual: não bloqueia beta fechada; bloqueia promessa de substituição integral para fluxos editoriais dependentes desses formatos.

### P3

#### M09-F004 — preferências da biblioteca não persistem

Busca, filtros e ordenação retornam ao padrão em nova sessão. O Gate 14 foi suspenso para não introduzir feature antes do veredito.

Decisão atual: oportunidade pós-auditoria, não bloqueador da primeira beta.

## Paridade provisória

| Área antiga | Classificação atual | Observação |
|---|---|---|
| Análise Geral | preservada parcialmente | engine integrada e observável; corpus ampliado ainda pendente |
| Sintaxe/Morfologia | presente como capacidade interna | usada por Revisão/Palavras; superfície autônoma não comprovada |
| Pontuação | preservada parcialmente | trechos UTF-16 e navegação aprovados |
| Espelho de Voz | preservada parcialmente | leitura completa exposta; auditoria ampla de corpus pendente |
| RimaLab | preservada parcialmente | prosa/verso e estrutura testados |
| Léxico | preservada parcialmente | definição e contexto expostos |
| Sinônimos | presente apenas como capacidade interna/parcial | paridade de catálogo e experiência ainda precisa medição |
| Decolonial | preservada parcialmente | superfície Contexto integrada e cuidadosa |
| Exportação | preservada parcialmente | TXT/MD/HTML; faltam quatro famílias antigas |
| Prova de Autoria | ausente | exige decisão explícita |
| PWA/offline | ausente na aplicação nova | exige gate de release próprio |

## Trabalho ainda pendente no milestone

- auditoria heurística manual completa de UIX;
- zoom 200%, movimento reduzido e leitores de tela/dispositivos reais;
- observação integral de rede para todas as jornadas, não apenas sentinela;
- conflito real com duas páginas simultâneas em jornada transversal;
- portabilidade nativa + legado na mesma sessão transversal;
- exportação em estado ainda não persistido;
- sessão prolongada e medição de latência/memória;
- corpora ampliados por engine;
- decisão explícita para cada P2;
- veredito final e cabeça documental exata.

## Próxima ação

Executar a segunda tranche M0.9, priorizando:

1. conflito real entre duas páginas;
2. exportação e cópias na mesma sessão;
3. acessibilidade ampliada;
4. relatório de corpus por engine;
5. fechamento das decisões P2.
