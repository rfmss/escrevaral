# M0.9 — Auditoria operacional arquivada

Atualizado em: 2026-07-29

Estado: **encerrado como auditoria técnica e decisória**

Este arquivo não é mais a fonte operacional ativa. Para retomar o trabalho atual, leia:

1. `M1_0_ENGINES_SUPERIORES.md`;
2. `logs/2026-07-29-m1-e0-e1-lexico-contextual.md`;
3. `PLAN.md`;
4. `MEMORY.md`.

## Função histórica

O M0.9 mediu o Mass Notes Next como oficina integrada antes de novas features, promoção ou tentativa de substituir o Escrevaral antigo.

A auditoria separou três perguntas:

1. pronto para beta fechada?
2. pronto para lançamento público?
3. pronto para substituir integralmente o Escrevaral antigo?

## Veredito final do M0.9

- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`;
- P0/P1 abertos: 0/0;
- quatro P2 com decisão explícita;
- PR #155 permaneceu em rascunho;
- `main` e aplicação pública permaneceram intactos.

Encerrar a auditoria não autorizou merge, lançamento ou substituição.

## Matriz e evidência

A cabeça funcional inicial da tranche 3 executou 126 cenários por navegador, 252 no total.

Após consolidação de duas fixtures antigas, a matriz autoritativa do fechamento passou a:

- 124 cenários por navegador;
- 248 execuções totais;
- Chromium e Firefox.

Referência:

- `M0_9_ERRATA_MATRIZ.md`.

Cabeça consolidada corrigida:

- `9eaa437e94a72d6095772090fb9b28a0e1066404`.

Workflows:

- Mass Notes `30490578195`: 248/248 após repetição na mesma cabeça, publicação, cache e smoke público;
- Argila `30490579874`: verde;
- coerência `30490578251`: verde.

## Cobertura aprovada

### Escrita e preservação

- criação, título, texto e metadados;
- autosave e salvamento explícito;
- recarga e retomada;
- conflito explícito entre abas;
- preservação de documento remoto e cópia local;
- recuperação emergencial do mesmo ID;
- doze ciclos consecutivos sem exceção de página.

### Engines

- Revisão, Espelho de Voz, Contexto, RimaLab e Palavras em sequência;
- corpus separado por superfície;
- snapshot semântico ProseMirror preservado;
- nenhuma aplicação automática;
- texto sentinela ausente de URL e corpo de requisição.

### Portabilidade

- exportação do rascunho React/Tiptap atual;
- cópia nativa e restauração como novas cópias;
- importação `.esc` com prévia, cancelamento e transação única;
- UUIDs novos e `legacySourceId` preservado;
- nenhum overwrite, merge ou deduplicação silenciosa.

### UIX e acessibilidade automatizada

- larguras 320, 390, 768, 1024, 1280 e 1440 px;
- ausência de overflow horizontal bloqueador;
- drawers móveis e rails desktop alcançáveis;
- layout CSS equivalente a zoom de 200%;
- movimento reduzido reconhecido;
- retorno de foco e Escape.

Automação equivalente não foi declarada como zoom real, leitor de tela ou dispositivo físico.

### Privacidade e rede

- nenhuma transmissão autoral observada;
- origem externa conhecida restrita a:
  - `https://unpkg.com/page-flip@2.0.7/dist/js/page-flip.browser.js`;
- a requisição não contém texto autoral;
- a origem externa permaneceu como P2 e bloqueio de promessa offline integral.

### Escala e desempenho

- biblioteca com 100 páginas;
- documento acima de 100 mil caracteres;
- DOM estável na sessão prolongada;
- métricas de CI usadas somente como detector de regressão, não como SLA.

## Decisões dos P2

### M09-F001 — PWA/offline próprio

- ausente;
- aceito apenas para beta fechada online;
- bloqueia lançamento público.

### M09-F006 — `page-flip` externo

- aceito apenas para beta online;
- deve ser local antes de lançamento ou promessa offline.

### M09-F002 — Prova de Autoria

- ausente na nova fundação;
- não bloqueia beta;
- bloqueia substituição integral até restauração ou aposentadoria formal da promessa.

### M09-F003 — exportação avançada

- contrato atual: TXT, Markdown e HTML;
- DOCX é o primeiro candidato posterior condicionado a uso;
- paridade integral permanece bloqueada para fluxos dependentes.

## Dívidas que permanecem

- zoom real de 200%;
- leitores de tela e tecnologias assistivas;
- dispositivos físicos e uso prolongado;
- PWA/service worker próprio;
- `page-flip` local;
- Prova de Autoria ou aposentadoria formal;
- DOCX e outros formatos conforme evidência.

Essas dívidas são de release ou substituição e não foram apagadas pela abertura do M1.0.

## Artefatos históricos

- `audits/M0_9_AUDITORIA_GERAL.md`;
- `audits/M0_9_AUDITORIA_GERAL.json`;
- `logs/2026-07-29-m0-9-auditoria-integrada-tranche-1.md`;
- `logs/2026-07-29-m0-9-auditoria-integrada-tranche-2.md`;
- `logs/2026-07-29-m0-9-auditoria-nao-funcional-tranche-3.md`;
- `logs/2026-07-29-m0-9-decisoes-p2.md`;
- `logs/2026-07-29-m0-9-encerramento-m1-abertura.md`;
- `../../docs/product/MASS_NOTES_TIPTAP_M0_9.md`.

## Programa sucessor

O programa ativo é **M1.0 — Engines superiores ao Escrevaral legado**.

Ele pode melhorar as engines sobre a fundação auditada, mas não autoriza lançamento ou substituição por si só.
