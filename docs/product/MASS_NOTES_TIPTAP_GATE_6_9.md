# Mass Notes Next — Gate 6.9

Status: aprovado para continuidade experimental.

Data: 2026-07-28.

## Objetivo

Validar manualmente, com corpora editoriais realistas em português brasileiro, o contrato que converte offsets textuais UTF-16 em posições ProseMirror e retorna posições ao texto derivado.

Este gate não cria marcações visuais e não autoriza decorations.

## Escopo validado

- prosa urbana;
- diálogo com travessões e aspas curvas;
- ensaio com blockquote e listas aninhadas;
- poesia e cordel com estrofes separadas por blocos vazios;
- canção com `hardBreak`;
- acentos precompostos e combinantes;
- emoji simples, emoji com tom de pele e ZWJ, bandeira brasileira;
- documento com 180 parágrafos;
- monotonicidade e afinidade nas fronteiras;
- pureza de HTML, seleção, assinatura e manuscrito;
- Chromium e Firefox.

## Resultado

- 9 cenários novos por navegador;
- 18 execuções específicas;
- 39 ranges editoriais auditados por navegador;
- 59 cenários totais por navegador;
- 118 execuções totais;
- zero falhas, zero flakiness e zero ignorados;
- zero decorations;
- evidência equivalente nos dois navegadores.

A matriz final foi repetida depois da adoção de `package-lock.json` e `npm ci`.

## Incidentes e decisões

### Placeholders de edição

O oráculo DOM inicialmente contou `br.ProseMirror-trailingBreak`, usado para manter um parágrafo vazio clicável, como quebra textual. O contrato estava correto.

Passaram a ser ignorados:

- `ProseMirror-trailingBreak`;
- `ProseMirror-separator`.

Um `<br>` autoral continua representando `hardBreak` e uma unidade `\n`.

### Navegação nativa

Chromium e Firefox podem aplicar `Home` a regiões diferentes conforme a posição inicial da seleção. A auditoria não exige igualdade da região escolhida pelo navegador; exige que, dentro de cada navegador, HTML, seleção e assinatura permaneçam inalterados antes e depois das consultas.

### Dependências reproduzíveis

Uma instalação limpa resolveu uma cópia transitiva incompatível de `@tiptap/core`. Foram adotados:

- versões diretas exatas;
- `overrides` Tiptap;
- `package-lock.json` versionado;
- `npm ci` no workflow;
- cache baseado no lockfile.

## Evidências

- workflow com relatórios por corpus: `30357397681`;
- workflow final com `npm ci`: `30358030907`;
- `mass-notes-next/docs/audits/GATE_6_9_POSITION_AUDIT.json`;
- `mass-notes-next/tests/fixtures/position-audit-corpora.ts`;
- `mass-notes-next/tests/gate6-9-position-audit.spec.ts`;
- `mass-notes-next/docs/logs/2026-07-28-gate-6-9-auditoria-posicoes-reais.md`.

## Limite do gate

Continuam proibidos sem nova autorização e gate próprio:

- decorations;
- sublinhados e highlights;
- tooltips ancorados no texto;
- navegação issue → trecho;
- aplicação automática;
- persistência de marcações no manuscrito.

## Próxima proposta

Um primeiro plugin ProseMirror somente de leitura, ligado a uma única engine e condicionado a `documentId` + `contentSignature` atuais. A marcação deverá ser descartável, ocultável, acessível e incapaz de editar o texto.
