# Escrevaral-Encore

Nova encarnação da linhagem de escrita (Vereda → Uairer → Escrevaral → Mass Notes → Antigravity). **Documento-mestre** do patrimônio e blueprint de construção: offline, democrática (rodando em iPad 2012 / Android 4), baixa RAM, future-proof.

## Conteúdo

- `docs/` — documento-mestre em uma seção por arquivo (PT-BR). Comece pelo [docs/index.md](docs/index.md).
- `src/` — código ES5 do produto (represa de engines + runtime + editor).
- `knowledge/` — maturidade/SPEC por engine (modelo M0–M7).

## Estado

- Repositório novo (a partir de hoje) para proteger o patrimônio documentado contra perda.
- **Primeiro engine**: morfologia verbal (VERB-MORPH), ES5, M3 (testado), seed 11 formas. Rode `node src/test/run-morphology.js` e `node src/test/run-runtime.js`.
- Prova no browser: abra `index.html` (file://), digite "cantávamos..." e clique em Analisar.

## Engines (9)

| id | domínio | maturidade | teste |
|---|---|---|---|
| VERB-MORPH | morfologia verbal | M3 | `src/test/run-morphology.js` |
| REL-CLAUSE | orações adjetivas | M3 | `src/test/run-relative-clause.js` |
| DECOLONIAL | vocabulário decolonial | M3 | `src/test/run-decolonial.js` |
| RIMA-METRICA | rima e métrica | M3 | `src/test/run-rima-metro.js` |
| VOICE | voz e estilística | M3 | `src/test/run-voz-estilistica.js` |
| PONTUACAO | pontuação | M3 | `src/test/run-pontuacao.js` |
| SINTAXE | sintaxe e funções | M3 | `src/test/run-sintaxe.js` |
| LEXICO-CLASSES | classes de palavras (VeredaLexical) | M4 | `src/test/run-lexico.js` + adversarial + `run-es5-purity.js` |
| ANALISE-LITERARIA | análise literária / redação (Vereda) | M4 | `src/test/run-analise-literaria.js` + adversarial |

## Pilares

Democrático · Offline total · Baixa RAM (um engine por vez) · Retrocompatível (2012) · Future-proof · Visual Standard Notes + "IA writing".
