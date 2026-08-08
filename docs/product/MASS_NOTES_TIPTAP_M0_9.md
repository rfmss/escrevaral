# Contrato de produto — M0.9 Candidata Integrada do Escrevaral

Data: 2026-07-29

Estado: **encerrado como auditoria técnica e decisória**

Substituído como programa ativo por:

- `docs/product/MASS_NOTES_ENGINES_SUPERIORES.md`;
- `mass-notes-next/docs/M1_0_ENGINES_SUPERIORES.md`.

## Objetivo cumprido

Medir o Mass Notes Next como produto integrado antes de qualquer nova feature, promoção ou tentativa de substituir o Escrevaral antigo.

O M0.9 emitiu respostas independentes para:

1. beta fechada;
2. lançamento público;
3. substituição integral.

## Resultado final do milestone

- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`;
- nota técnica consolidada: 88/100;
- P0/P1 abertos: 0/0;
- quatro P2 com decisão explícita;
- PR #155 permaneceu em rascunho;
- `main`, aplicação pública e service worker público permaneceram intactos.

Encerrar o milestone não autoriza merge, lançamento, promoção ou substituição.

## Matriz autoritativa

A cabeça funcional inicial da tranche 3 executou:

- 126 cenários por navegador;
- 252 execuções.

Após consolidação de duas fixtures antigas, a matriz corrente do fechamento passou a:

- 124 cenários por navegador;
- 248 execuções.

A mudança não removeu as jornadas semânticas do M0.9. A referência detalhada é:

- `mass-notes-next/docs/M0_9_ERRATA_MATRIZ.md`.

Cabeça consolidada corrigida:

- `9eaa437e94a72d6095772090fb9b28a0e1066404`.

Evidência:

- Mass Notes `30490578195`: 248/248 após repetição na mesma cabeça, publicação, cache e smoke público;
- Argila `30490579874`: verde;
- coerência `30490578251`: verde.

## Cobertura aprovada

- escrita, metadados, autosave e recarga;
- conflito explícito preservando versões;
- recuperação emergencial do mesmo documento;
- exportação do estado React/Tiptap atual;
- cópia nativa, restauração e importação `.esc` na mesma sessão;
- cinco superfícies de engines sem mutação autoral;
- biblioteca com 100 páginas e documento acima de 100 mil caracteres;
- larguras 320, 390, 768, 1024, 1280 e 1440 px;
- layout CSS equivalente a zoom de 200%;
- movimento reduzido;
- auditoria integral de rede;
- sessão prolongada e métricas de regressão;
- corpus separado por engine.

## Decisões dos P2

### M09-F001 — PWA/offline próprio ausente

- aceito somente para beta fechada explicitamente online;
- bloqueia lançamento público;
- exige gate próprio de release/autonomia.

### M09-F006 — dependência externa da Anatomia

- `page-flip@2.0.7` do `unpkg` é aceito somente para beta online;
- a requisição não contém texto autoral;
- precisa ser vendorizado, empacotado localmente ou removido antes de promessa offline ou lançamento público.

### M09-F002 — Prova de Autoria ausente

- não bloqueia beta fechada da oficina de escrita;
- bloqueia substituição integral até restauração ou aposentadoria formal da promessa.

### M09-F003 — exportação avançada ausente

- TXT, Markdown e HTML são o contrato atual;
- não bloqueia beta fechada;
- DOCX é o primeiro candidato posterior, condicionado à evidência de uso;
- paridade integral continua bloqueada para fluxos dependentes.

## Limites honestos

Não foram aprovados como validação física:

- zoom real de 200%;
- leitores de tela;
- tecnologias assistivas;
- dispositivos físicos;
- uso prolongado em hardware real.

Esses itens permanecem como dívida de release e não podem ser inferidos da automação.

## Memória histórica

- `mass-notes-next/docs/M0_9_AUDITORIA_OPERACIONAL.md`;
- `mass-notes-next/docs/M0_9_ERRATA_MATRIZ.md`;
- `mass-notes-next/docs/audits/M0_9_AUDITORIA_GERAL.md`;
- `mass-notes-next/docs/audits/M0_9_AUDITORIA_GERAL.json`;
- `mass-notes-next/docs/logs/2026-07-29-m0-9-auditoria-integrada-tranche-1.md`;
- `mass-notes-next/docs/logs/2026-07-29-m0-9-auditoria-integrada-tranche-2.md`;
- `mass-notes-next/docs/logs/2026-07-29-m0-9-auditoria-nao-funcional-tranche-3.md`;
- `mass-notes-next/docs/logs/2026-07-29-m0-9-decisoes-p2.md`;
- `mass-notes-next/docs/logs/2026-07-29-m0-9-encerramento-m1-abertura.md`.

## Fronteira posterior

O M1.0 pode pesquisar e melhorar as engines porque a fundação técnica foi auditada. Ele não apaga as dívidas de release e não autoriza lançamento ou substituição por si só.
