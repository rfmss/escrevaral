# Estabilização — fila de salvamento e conflitos entre abas

Data: 2026-08-01  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Estado: **fechado e validado na matriz integral**

## C — Cenário observado

Duas matrizes consecutivas, executadas durante o lote lexical de `quica`, revelaram uma fronteira preexistente da persistência:

1. `30723668283`: Firefox não produziu o conflito misto esperado entre manuscrito e metadados;
2. `30724005784`: a falha se repetiu em Firefox e Chromium exibiu `Conflito` contra a própria aba durante a troca de documento.

O segundo artefato mostrou dois comportamentos distintos:

- autosave e `Ctrl+S` podiam iniciar gravações paralelas com a mesma revisão;
- o cenário misto do teste não criava concorrência de forma determinística.

## L — Limite

A correção ficou restrita à coordenação de salvamento e às regressões correspondentes. Não houve:

- aumento de timeout;
- retry no Playwright;
- mudança no esquema do IndexedDB;
- merge automático de conteúdo;
- alteração nas engines linguísticas;
- alteração em `main`;
- execução do Gate 14.

## A — Arquitetura aplicada

Cabeça funcional: `a90f7a11151b962d183f74e4ee32dbccacd1913f`.

Mudanças mínimas:

1. `persistDraft()` serializa gravações por aba;
2. pedidos durante uma gravação são coalescidos;
3. cada edição incrementa uma série local de mutação;
4. edição ocorrida durante a gravação é rebaseada sobre a revisão salva e persistida na sequência;
5. uma conclusão antiga não limpa o estado `dirty` de edição posterior;
6. `conflictRef` bloqueia nova gravação de forma síncrona quando existe conflito real;
7. BroadcastChannel, revisões e política de preservação das duas versões foram mantidos;
8. o teste misto prepara as duas superfícies antes das mutações concorrentes;
9. uma regressão dedicada dispara salvamentos sobrepostos e verifica a edição final após recarga.

## R — Resultado reproduzível

Banca específica `30724776606`:

- seis contratos em Chromium e Firefox;
- **6/6**;
- nenhum conflito contra a própria aba;
- edição posterior preservada após recarga;
- conflito misto real preserva as duas versões;
- troca de documento não transporta decorations.

Cabeça documental validada: `2302c90be43c116d600c0e6d18027c12a48988f9`.

Matriz oficial `30724861899`:

- **356/356** em Chromium e Firefox;
- nova regressão da fila: verde nos dois navegadores;
- conflito misto: verde nos dois navegadores;
- troca de documento: verde nos dois navegadores;
- auditoria lexical e E2-V: verdes;
- TypeScript e build: verdes;
- publicação da preview: verde;
- renovação de cache: verde;
- smoke público: verde;
- artefato `mass-notes-tiptap-30724861899`;
- artifact ID `8826061044`;
- digest `sha256:a44a6fd373dbb01dc1a3787b452b9228dfdab65a493bb93b2841fe01f5719846`.

Desempenho observado na matriz:

- Chromium: `p95SaveMs` 197 ms;
- Firefox: `p95SaveMs` 135 ms;
- sessão prolongada, DOM e quantidade de páginas: verdes.

## O — O que permanece aberto

- BroadcastChannel continua limitado a abas do mesmo navegador;
- não existe sincronização remota ou colaboração;
- conflitos reais continuam sem merge automático e exigem decisão autoral;
- uso prolongado em dispositivos físicos ainda pertence ao gate humano;
- a próxima frente continua sendo integridade lexical, não uma nova engine.

## Decisão

`PROSSEGUIR` para o próximo pequeno lote lexical, preservando:

- uma família editorial por tranche;
- redações descartada e retida registradas;
- teste por verbete;
- matriz integral;
- PR em rascunho;
- `main` e Gate 14 intactos.
