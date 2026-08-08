# Gate 6.9 — auditoria editorial do contrato de posições

Status: aprovado para continuidade experimental.

## Objetivo

Auditar o contrato aprovado no Gate 6 com corpora originais e realistas em português brasileiro antes de autorizar qualquer decoration ProseMirror.

## Escopo executado

- prosa urbana e diálogo com travessões, aspas curvas e hífens;
- ensaio com duas citações, lista numerada e lista aninhada;
- poesia e cordel com blocos vazios entre estrofes;
- canção com `hardBreak` autoral;
- Unicode brasileiro: acentos precompostos, acento combinante, emoji simples, bandeira e sequência com tom de pele + ZWJ;
- documento com 180 parágrafos e 23.940 unidades UTF-16;
- round-trip offset UTF-16 ↔ posição ProseMirror;
- afinidade anterior e posterior em fronteiras virtuais;
- monotonicidade através de wrappers;
- pureza de HTML, seleção, assinatura e manuscrito;
- Chromium e Firefox.

## Resultado

- 9 cenários novos por navegador;
- 18 execuções específicas do Gate 6.9;
- 39 ranges editoriais auditados por navegador;
- 59 cenários totais por navegador;
- 118 execuções totais;
- zero falhas, zero flakiness e zero testes ignorados;
- nenhuma decoration criada;
- evidências equivalentes entre Chromium e Firefox, descontadas identidade de sessão e a região escolhida pelo atalho nativo `Home`.

## Incidente 1 — quebra técnica confundida com texto

O primeiro oráculo DOM tratava todo `<br>` como `hardBreak`. Parágrafos vazios do ProseMirror contêm `br.ProseMirror-trailingBreak` para permanecerem clicáveis, mas esse elemento não representa texto autoral.

Correção:

- `ProseMirror-trailingBreak` e `ProseMirror-separator` são ignorados pelo oráculo independente;
- `<br>` autoral continua convertido para `\n`;
- o contrato de posições não precisou ser alterado.

## Incidente 2 — árvore Tiptap não determinística

Uma instalação limpa resolveu uma versão transitiva diferente de `@tiptap/core` dentro do StarterKit e gerou tipos incompatíveis.

Correção:

- adicionados `overrides` para a família Tiptap;
- `package-lock.json` foi versionado;
- o workflow passou de `npm install` para `npm ci` com cache baseado no lockfile;
- a árvore reproduzível compilou e repetiu os 118 fluxos com sucesso.

## Decisões

1. Offsets continuam declarados em unidades UTF-16.
2. O texto derivado deve coincidir com os blocos autorais, não com placeholders técnicos do DOM.
3. `documentId` identifica a sessão/documento; equivalência de conteúdo usa assinatura e registros de posição.
4. Diferenças nativas de navegação por `Home` não são diferenças do contrato quando seleção, HTML e assinatura permanecem intactos antes e depois da consulta.
5. Dependências do editor exigem lockfile versionado e `npm ci`.
6. Decorations, sublinhados, highlights, tooltips e substituição automática continuam fora do escopo.

## Evidências

- workflow funcional com evidência detalhada: `30357397681`;
- workflow final reproduzível com `npm ci`: `30358030907`;
- resumo versionado: `docs/audits/GATE_6_9_POSITION_AUDIT.json`;
- corpora: `tests/fixtures/position-audit-corpora.ts`;
- auditor: `tests/gate6-9-position-audit.spec.ts`.

## Próximo gate proposto

Decorations ProseMirror somente de leitura, para uma única engine, ainda dependem de nova autorização explícita. O primeiro corte deverá validar identidade, assinatura, descarte de ranges obsoletos, navegação acessível e ausência de alteração automática.
