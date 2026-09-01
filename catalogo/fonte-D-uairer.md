# Catálogo — Fonte D: uai.rer

Caminho: `/home/rafamass/projetos/uai.rer/`. Motor portátil `@uairer/ptbr-engine` (v0.1.0). 4 engines, contrato fixo, offline, sem DOM no core.

## Engines (pacote, `packages/uairer-ptbr-engine/src/`)

| Arquivo | Domínio | Dados | Tamanho |
|---|---|---|---|
| lexical-engine.js | Léxico (classe, campo semântico, craft, desambiguação) | lexical-data.json (fetch inline) | 37 KB |
| syntax-engine.js | Sintaxe (períodos, apostos, concordância, voz) | syntax-data.json (inline) | 26 KB |
| punctuation-engine.js | Pontuação (30 regras) | — | 27 KB |
| grammar-engine.js | Gramática/coloração (10 classes) | — | 26 KB |
| synonym-data.js | Sinônimos (Nascentes, 100+ entradas) | — | 21 KB |
| pt-compromise.min.js | Vendor NLP PT-BR | — | 271 KB |

## Dados (packages `data/`)
lexicon.pt-br.json 19.7 KB · semantic-fields.json 3.9 KB · syntax-rules.json 28.6 KB · interjections.pt-br.json 1 KB → **total ~53 KB** (curado, pequeno).

## Testes / maturidade
- `tests/audit-engines.js` — **71 testes / 0 falhas** (contrato fixo "linha de chegada").
- `scripts/audit-engines.js` na raiz delega.

## Orquestrador
`src/index.js` (7 KB) — monta `UairerEngine.{lexical,syntax,punctuation,grammar}` com camada de **confiança/motivo** (`{kind, value, confidence, reason}`) — contrato portabilidade total.

## Para o Encore (ES5)
- Portabilidade total (sem DOM) = ideal. O contrato `{kind,value,confidence,reason}` é candidato a padrão de saída das engines do Encore.
- Destaque positivo: léxico **curado e pequeno** (boa p/ baixa RAM), campo semântico e nota de "craft" (raro nas outras fontes).
- **Conflito**: pt-compromise.min.js (271 KB) depende de runtime NLP — avaliar se vale em ES5 puro.
- Dir vazios `src/features/` = ignorar (esqueleto de app).
