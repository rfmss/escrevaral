# OBS-01 — Errata da hipótese de serialização e correção do Espelho de Voz

Data: 2026-07-30

Método: **CLARO — errata de estabilização**

## Correção do registro anterior

O registro `2026-07-30-observacao-01-estabilizacao-matriz.md` documentou a hipótese de que a competição entre workers do Playwright explicava as falhas migratórias do Firefox.

A hipótese foi testada de forma explícita com `workers: 1` no CI.

Resultado: **a hipótese não se confirmou**.

Mesmo em ordem serial, a matriz terminou em `323/324`. A falha ocorreu no cenário dedicado da OBS-01 que verifica as cinco engines: `.voice-reading` não apareceu após vinte segundos.

Portanto:

- a serialização não foi aceita como solução;
- o paralelismo padrão foi restaurado;
- nenhuma retry foi adicionada;
- nenhum timeout foi ampliado;
- nenhum teste ou assertion foi removido.

O registro anterior permanece no histórico como hipótese investigada, mas não representa a decisão final.

## Causa confirmada

O Espelho de Voz ainda recebia `document.plainText` da projeção React.

Em documentos longos ou sob carga, o Tiptap já podia conter o manuscrito integral enquanto essa propriedade ainda representava um estado anterior. A Voz então recebia texto vazio ou defasado e não produzia leitura.

Essa fronteira era equivalente às já corrigidas em:

- RimaLab;
- Contexto;
- Palavras/Léxico;
- exportações TXT, Markdown e HTML.

## Correção final

`editorSnapshotBridge.ts` passa a registrar também o último snapshot vivo publicado pelo editor.

`voiceAdapter.ts` consulta esse snapshot no instante da análise:

- usa o texto vivo do Tiptap quando disponível;
- mantém o texto recebido como fallback;
- não altera o JSON autoral;
- não altera a engine legada;
- não transmite o manuscrito;
- não aplica substituições automáticas.

A regra permanente fica consolidada:

> Toda ferramenta iniciada pela interface deve analisar ou exportar o snapshot vivo do Tiptap, e não depender apenas de uma projeção React possivelmente atrasada.

## Critério de aceite

A errata só será encerrada quando a mesma cabeça passar:

- auditoria lexical;
- TypeScript e build;
- 324/324 em Chromium e Firefox;
- os quinze cenários da OBS-01;
- publicação, cache e smoke público;
- Argila;
- coerência.

## Fronteira

Esta correção não altera paginação, persistência, layout, dados linguísticos ou comportamento público. O PR permanece em rascunho, `main` permanece intacta e Gate 14 continua suspenso.
