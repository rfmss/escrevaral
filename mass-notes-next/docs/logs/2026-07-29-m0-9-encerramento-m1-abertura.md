# Transição — encerramento do M0.9 e abertura do M1.0

Data: 2026-07-29

## Decisão

O milestone **M0.9 — Candidata Integrada do Escrevaral** está encerrado como auditoria técnica e decisória.

Esse encerramento não autoriza:

- lançamento público;
- promoção para `main`;
- substituição integral do Escrevaral antigo;
- promessa de PWA/offline;
- promessa de acessibilidade validada em tecnologias assistivas ou dispositivos físicos.

## Resultado herdado do M0.9

- Gates 1 a 13 e Gate 10.5 concluídos;
- matriz consolidada: 124 cenários por navegador, 248 execuções;
- Chromium e Firefox obrigatórios;
- P0/P1 abertos: 0/0;
- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`;
- quatro P2 com decisão explícita:
  - PWA/offline próprio ausente;
  - Prova de Autoria ausente;
  - exportação avançada ausente;
  - dependência externa da Anatomia.

A cabeça consolidada corrigida `9eaa437e94a72d6095772090fb9b28a0e1066404` passou 248/248 após repetição na mesma cabeça, além de Argila, coerência, publicação, cache e smoke público.

## Dívidas que continuam abertas

Permanecem como requisitos de release ou substituição, não como bloqueio para pesquisa e melhoria das engines:

- zoom real de 200%;
- leitor de tela e tecnologias assistivas;
- dispositivos físicos e uso prolongado;
- service worker/PWA próprio;
- `page-flip` local;
- Prova de Autoria ou aposentadoria formal da promessa;
- DOCX e demais formatos avançados conforme evidência de uso.

## Abertura do M1.0

O programa seguinte é **M1.0 — Engines superiores ao Escrevaral legado**.

Objetivo:

- preservar capacidades linguísticas úteis do legado;
- superar o legado em contexto, explicabilidade, indeterminação honesta, segurança autoral e evidência reproduzível;
- não usar volume de regras ou declarações de “100%” como prova isolada.

Fontes autoritativas:

- `../M1_0_ENGINES_SUPERIORES.md`;
- `2026-07-29-m1-e0-e1-lexico-contextual.md`;
- `../../../docs/product/MASS_NOTES_ENGINES_SUPERIORES.md`.

## Primeira evidência M1.0

O corpus morfossintático v1 mediu 14 ambiguidades/contextos por navegador.

Baseline:

- 8/14 casos únicos corretos;
- 6/14 incorretos nos dois navegadores;
- 264/276 execuções aprovadas.

Após a primeira camada contextual tipada:

- 14/14 casos únicos corretos;
- 276/276 execuções aprovadas;
- publicação, cache, smoke, Argila e coerência verdes;
- nenhuma alteração no manuscrito;
- nenhuma substituição automática;
- motores e bases legadas preservados.

## Governança

- PR #155 permanece em rascunho;
- `main` e aplicação pública permanecem intactos;
- Gate 14 continua suspenso;
- M1.0 não autoriza lançamento ou substituição por si só;
- cada melhoria exige baseline, caso reproduzível, correção mínima, matriz integral e documentação.
