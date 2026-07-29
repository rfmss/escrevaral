# M1.0 — E0/E1: baseline e primeira superioridade lexical contextual

Data: 2026-07-29

## Objetivo

Iniciar o programa de engines superiores ao legado com uma comparação reproduzível, sem alterar regras antes de medir a baseline.

## Corpus v1

Foram adicionados 14 casos por navegador:

- `enquanto` introduzindo oração;
- `por enquanto`;
- `enquanto isso`;
- `publica/pública`;
- `seria/séria`;
- `preso` como particípio, adjetivo e substantivo;
- `larga` como adjetivo e verbo;
- `canto` como verbo e substantivo.

Cada caso exige:

- classe contextual esperada;
- decisão não indeterminada quando há evidência;
- consulta totalmente local;
- nenhuma substituição automática;
- manuscrito idêntico antes e depois da leitura.

Arquivos:

- `tests/fixtures/engine-superiority-corpus.ts`;
- `tests/m1-engine-superiority.spec.ts`.

## Baseline antes da correção

Cabeça: `39e3c64e0280a121ffc5490dbdf6a2ed923119d8`.

Workflow Mass Notes `30492831259`:

- 276 execuções previstas;
- 264 passaram;
- 12 falharam;
- as 12 falhas representam seis lacunas únicas repetidas em Chromium e Firefox.

Lacunas confirmadas:

1. `por enquanto` retornava `Substantivo`, em vez de locução adverbial;
2. `enquanto isso` retornava `Substantivo`, em vez de conector/locução adverbial;
3. `publica`, sem acento, retornava `Adjetivo`, em vez de forma verbal de `publicar`;
4. `foi preso` retornava `Adjetivo`, sem reconhecer o particípio na voz passiva;
5. `estrada larga` retornava `Verbo flexionado`, sem reconhecer o adjetivo pós-nominal;
6. `eu canto` retornava `Substantivo masculino`, sem usar o pronome sujeito como evidência verbal.

Passaram desde a baseline:

- `enquanto` em oração;
- `pública` adjetivo;
- `seria` verbo;
- `séria` adjetivo;
- `ficou preso` adjetivo;
- `os presos` substantivo;
- `ela larga` verbo;
- `o canto` substantivo.

## Correção E1

A correção foi implementada em `src/engines/lexicalAdapter.ts`, sem alterar `lexical-engine.js` ou os dados legados.

A camada contextual nova acrescenta:

- locuções fixas `por enquanto` e `enquanto isso`;
- decisão sensível a diacrítico para `publica/pública`;
- reconhecimento de particípio após auxiliares de voz passiva;
- leitura verbal provável após pronome sujeito em formas ambíguas registradas;
- leitura adjetival pós-nominal quando há determinante + nome + forma ambígua;
- notas em português claro explicando a evidência usada;
- decisão `provável` quando a regra depende do contexto, sem fingir certeza absoluta.

A camada é restrita a evidências explícitas e continua usando a engine legada como base. Nenhuma alternativa é aplicada ao manuscrito.

## Resultado funcional

Cabeça: `d44791ff1a317610c9dd152360cfbb9b168c503a`.

- Mass Notes `30493491424`: build, Chromium, Firefox, **276/276**, publicação, renovação de cache e smoke público verdes;
- Candidata a lançamento Argila `30493491638`: verde;
- Coerência de versões `30493491411`: verde;
- artefato: `mass-notes-tiptap-30493491424`.

Delta do corpus:

- antes: 8/14 casos únicos aprovados;
- depois: 14/14 casos únicos aprovados;
- ganho: +6 casos contextuais, sem regressão nos 8 anteriores;
- matriz total: 138 cenários por navegador, 276 execuções.

## Por que isto supera o legado integrado

O produto novo não apenas reutiliza o motor antigo. Ele acrescenta uma camada contextual tipada, conservadora, explicável e coberta por pares mínimos que a baseline integrada classificava incorretamente.

A superioridade demonstrada nesta tranche é limitada e específica:

- superior em seis fronteiras morfossintáticas do corpus v1;
- ainda não prova superioridade global de Léxico/Sintaxe;
- não altera o veredito de substituição integral;
- a próxima tranche deve ampliar negativos, regionalismos, oralidade e inventário quantitativo/qualitativo dos dados.

## Estado

- E0 baseline: concluída;
- E1 primeira tranche contextual: concluída;
- M1.0: em execução;
- P0/P1 novos: 0/0;
- PR #155: continua em rascunho;
- `main`: intacta;
- nenhuma promoção ou substituição autorizada.
