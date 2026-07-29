# Contrato de produto — M0.9 Candidata Integrada do Escrevaral

Data: 2026-07-29

Estado: em execução — três tranches automatizadas concluídas

## Objetivo

Medir o Mass Notes Next como produto integrado antes de qualquer nova feature ou promoção.

## Perguntas de saída

O milestone emite respostas independentes para:

1. beta fechada;
2. lançamento público;
3. substituição do Escrevaral antigo.

## Regras

- auditar antes de corrigir;
- suspender novas features;
- manter PR em rascunho;
- manter `main` e aplicação pública intactas;
- não editar branch de preview;
- não enfraquecer teste para obter verde;
- corrigir somente P0 ou impedimento da medição;
- documentar decisão, achado e evidência quando mudam;
- repetir matriz completa após correção;
- nenhum texto autoral pode sair em requisição de rede;
- automação equivalente não pode ser apresentada como zoom real, leitor de tela ou validação física;
- métricas de runner são sinais de regressão, não SLA;
- registrar SHA documental exato no PR após CI, sem commit autorreferente.

## Memória operacional

- executável: `mass-notes-next/docs/M0_9_AUDITORIA_OPERACIONAL.md`;
- relatório humano: `mass-notes-next/docs/audits/M0_9_AUDITORIA_GERAL.md`;
- relatório estruturado: `mass-notes-next/docs/audits/M0_9_AUDITORIA_GERAL.json`;
- log da tranche 3: `mass-notes-next/docs/logs/2026-07-29-m0-9-auditoria-nao-funcional-tranche-3.md`.

## Áreas obrigatórias

- editor e preservação;
- biblioteca;
- engines;
- UIX;
- acessibilidade;
- responsividade;
- importação e exportação;
- privacidade e dependências de rede;
- desempenho;
- release;
- paridade com produto antigo.

## Severidade

- P0: perda/corrupção, exposição autoral, inutilização ou sobrescrita silenciosa;
- P1: fluxo principal quebrado, engine enganosa ou acessibilidade bloqueadora;
- P2: defeito relevante, inconsistência importante ou lacuna de paridade/release;
- P3: acabamento e melhoria não bloqueadora.

## Cobertura automatizada aprovada

Cabeça funcional da tranche 3: `305d0727ddfaee11f3e7680d0f9168023e9a4284`.

Matriz:

- 126 cenários por navegador;
- 252 execuções;
- Chromium e Firefox.

Suítes:

- `mass-notes-next/tests/m0-9-integrated.spec.ts`;
- `mass-notes-next/tests/m0-9-nonfunctional.spec.ts`.

Jornadas:

- escrita, metadados, autosave e recarga;
- cinco superfícies de engines em sequência sem mutação;
- filtros sem mutar revisão ou descartar página ativa;
- 100 páginas e documento acima de 100 mil caracteres;
- conflito misto entre manuscrito e metadados preservando as duas versões;
- exportação do rascunho atual antes do autosave convergir;
- cópia nativa, restauração e `.esc` legado na mesma sessão;
- seis larguras de 320 a 1440 px sem overflow bloqueador;
- layout CSS equivalente a 200% com escrita e drawers alcançáveis;
- movimento reduzido reconhecido e transição em até 300 ms;
- observação integral de rede sem transmissão autoral;
- recuperação emergencial do mesmo documento;
- doze ciclos de edição/salvamento com métricas de regressão;
- corpus separado para cada engine sem mutar o snapshot semântico.

Evidências:

- Mass Notes `30478738806`: 252/252, publicação, cache e smoke público;
- Argila `30478738678`: verde;
- coerência `30478738607`: verde;
- artefato `mass-notes-tiptap-30478738806`.

## Contratos transversais aprovados

### Conflito

- revisão remota mais nova abre conflito explícito;
- nenhuma versão é apagada silenciosamente;
- versão local pode virar cópia com UUID novo;
- documento remoto e cópia local permanecem no IndexedDB;
- metadados locais são preservados na cópia.

A preferência de documento ativo é compartilhada entre abas. Isso não é perda de dados, mas deve permanecer documentado até eventual gate próprio.

### Recuperação emergencial

- envelope mais novo pode substituir o rascunho em memória no boot;
- o mesmo ID é preservado;
- revisão avança ao persistir;
- nenhuma página é duplicada;
- envelope temporário é limpo após convergência para `Salvo`.

### Exportação

- usa o estado React/Tiptap atual;
- não depende de releitura do IndexedDB;
- inclui título e conteúdo ainda em `Alterado|Salvando`;
- não impede convergência posterior do autosave.

### Portabilidade combinada

- cópia nativa e importação legada mantêm parsers próprios;
- restauração cria novas cópias;
- prévia legada pode ser cancelada sem escrita;
- confirmação legada usa transação única;
- página ativa permanece aberta;
- nenhum documento existente é substituído;
- `legacySourceId` permanece auditável.

### UIX e responsividade automatizadas

- larguras obrigatórias: 320, 390, 768, 1024, 1280 e 1440 px;
- papel, título e editor permanecem dentro do viewport;
- drawers móveis e rails desktop permanecem alcançáveis;
- screenshots são artefatos de revisão;
- viewport CSS equivalente a zoom de 200% não substitui zoom real.

### Movimento reduzido

- `prefers-reduced-motion: reduce` deve ser reconhecido;
- transição da Anatomia deve ficar em até 300 ms;
- navegação não pode ficar bloqueada por overlay transitório.

### Rede e privacidade

- texto sentinela autoral não pode aparecer em URL nem corpo de requisição;
- a origem externa atualmente conhecida é exatamente:
  - `https://unpkg.com/page-flip@2.0.7/dist/js/page-flip.browser.js`;
- a requisição é GET e não contém texto autoral;
- qualquer outra origem externa inesperada falha a auditoria;
- a allowlist exata não encerra o achado `M09-F006`.

### Engines e texto semântico

- não mutação autoral é verificada pelo snapshot semântico do contrato ProseMirror;
- `innerText` não é referência canônica entre navegadores;
- corpus multiparágrafo entra por paste estruturado;
- Revisão deve sincronizar o mapa UTF-16 antes da análise.

### Desempenho

- doze ciclos consecutivos não podem criar exceção, duplicar páginas ou produzir crescimento descontrolado;
- limites de CI: p95 abaixo de 8 s, até 120 nós DOM adicionais e até 64 MiB de heap quando disponível;
- valores observados não constituem SLA ou benchmark universal.

## Achados provisórios

P0: nenhum.

P1: nenhum.

P2:

- `M09-F001`: aplicação nova sem PWA/offline próprio;
- `M09-F002`: Prova de Autoria ausente;
- `M09-F003`: paridade de exportação incompleta;
- `M09-F006`: Anatomia carrega `page-flip@2.0.7` do `unpkg` em tempo de execução.

P3:

- `M09-F004`: preferências da biblioteca não persistem;
- `M09-F005`: documento ativo é preferência compartilhada entre abas.

## Veredito provisório

- beta fechada: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`.

Nota provisória: 88/100.

## Limite do veredito

As tranches automatizadas não encerram o milestone. Ainda são obrigatórios ou devem ser registrados como indisponíveis:

- revisão heurística humana das capturas e fluxos;
- zoom real de 200%;
- leitores de tela e tecnologias assistivas;
- dispositivos físicos;
- uso prolongado em máquina real;
- decisões explícitas para os quatro P2;
- veredito final;
- CI na cabeça documental final sem commit posterior.

## Critério final

O M0.9 só encerra sem P0 aberto, com todo P1 decidido, matriz integral verde, P2 com decisão explícita, validações manuais registradas honestamente, preview pública válida, documentação sincronizada, veredito registrado e PR ainda em rascunho e não incorporado.
