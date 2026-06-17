# Handoff vivo — Escrevaral

**Atualizado em:** 2026-06-17  
**Versão atual:** v622 (`vereda-offline-v622`, `ASSET_VERSION=20260617-lex289`)

---

## Objetivo em curso

Refinamento de navegabilidade + higiene de engines. Ciclo autônomo ativo.

---

## Decisões recentes

| Commit | O que mudou |
|---|---|
| v585 (PIL-ARQ-01) | 3 strips do Acervo → 1 bloco "Retomar agora" (máx. 3 itens) |
| v586 (PIL-ARQ-02) | Título da nota no painel lateral 14→16px; separação Detalhes/Exportar |
| v587 (PIL-ATL-01) | 3 grupos visuais no tab bar do Ateliê: análise | referência | prática |
| fix homógrafos | seria, precisa, sabia, muda removidos de adjetivos_comuns (conflito verbo/adj) |
| v588 | 41 adjetivos seguros (adjetivos_comuns 478→519) |
| v589 | léxico 229→241 (+12); skills trio completo |
| v590 | sinônimos 214→226; conflito/pensamento 34→42 |
| v591 | corpo 38→45; casa 35→40; cidade 34→41 |
| v592 | adjetivos_comuns 519→620 (+108 -ivo/a e -ente) |
| v593 | substantivos_ia 167→188 (+27) |
| v594 | decolonial 260→265 (-5 dup, +10) |
| v595 | verbos_pres_reg 402→440 (+38, -para/param) |
| v596 | CLIQUES_PT 315→343; PLEONASMOS 131→141 |
| v597 | formas_verbais_irr 230→267 (+37) |
| v598 | RimaLab enciclopédia 25→35 (+10) |
| v599 | léxico 241→253 (+12 verbos/temporais) |
| v600 | sinônimos 226→240 (+14 adjetivos) |
| v601 | adjetivos_comuns 620→758 (+138) |
| v602 | verbos_pres_reg 440→571 (+131) |
| v603 | decolonial 265→273 (+8) |
| v604 | CLIQUES_PT 343→379 (+36) |
| v606 | decolonial 273→281 (+8 classe e território) |
| v607 | PLEONASMOS 163→183 (+20 redundâncias literárias) |
| v608 | léxico 253→265 (+12: avó, justiça, ler, escrever, praia, irmã, neve…) |
| v609 | sinônimos 240→254 (+14: branco, negro, ceder, confiar, vencer…) |
| v610 | adjetivos_comuns 758→821 (+63 seguros: -oso/a, -ável/-ível, -ente, -ivo/a) |
| v611 | verbos_pres_reg 571→616 (+45 formas literárias) |
| v612 | CLIQUES_PT 379→433 (+54: motivacional, crônica, linguagem corporal, paisagem) |
| v613 | voice-engine campos semânticos +48 (corpo→53, casa→48, natureza→53…) |
| v614 | formas_verbais_irr 267→343 (+76: sentir, dormir, mentir, subir, agir, surgir, exigir) |
| v615 | substantivos_ia 188→225 (+37: alergia, demência, histeria, neurociência…) |
| v616 | decolonial 281→295 (+14: mulher emotiva, retardado, cabelo crespo domado…) |
| v617 | léxico 265→277 (+12: violência, trabalho, dinheiro, escola, saúde, governo…) |
| v618 | sinônimos 254→282 (+28: aberto, cheio, longo, caro, fácil, comer, respirar…) |
| v619 | PLEONASMOS 183→198 (+15: ver com os olhos, viver a vida, medo e receio…) |
| v620 | adjetivos_comuns 821→930 (+109: ardoroso, audacioso, saudoso, habitável…) |
| v621 | verbos_pres_reg 616→697 (+81: analisa, captura, critica, defende, motiva…) |
| v622 | léxico 277→289 (+12: crime, cachorro, emprego, eleição, voto, médico…) |

---

## Pílulas da Agência — estado atual

Todas as pílulas encerradas. Ver detalhes em `docs/_decisoes/AGENCIA_CONTINUIDADE_2026-06-16.md`.

- PIL-ARQ-01: ✅ encerrada
- PIL-NAV-01: ✅ encerrada (não havia problema real na interface)
- PIL-ARQ-02: ✅ encerrada
- PIL-ATL-01: ✅ encerrada

---

## Riscos ativos

- **Homógrafos em adjetivos_comuns**: padrão diacritic-stripping pode criar conflitos verbo/adjetivo quando adjetivos com acento têm forma verbal homógrafa sem acento. Checar antes de adicionar novas formas em -ia.
- **Sintaxe 99%**: o 1% restante requer desambiguação contextual (janela de tokens) — não tentar resolver com mais dados.
- **templates-data.json**: não tocar — 63 templates calibrados.

---

## Próximos passos possíveis

1. `analise-engine.js` — PLEONASMOS 141 tem margem para crescer
2. `decolonial-data.json` — categorias `classe` e `território` em 28, espaço para equilibrar
3. `norma-data.json` — adjetivos_comuns 758; verbos_pres_reg 571 — ainda há formas comuns ausentes
4. Sintaxe 99%→100% — requer desambiguação contextual (custo alto, não prioritário)

---

## Arquivos-chave do estado

- `META_ENGINES_100.md` — maturidade de cada engine
- `norma-data.json` — dados morfológicos (adjetivos_comuns: 519, formas_verbais_irr: 230, verbos_pres_reg: 402)
- `docs/_decisoes/AGENCIA_CONTINUIDADE_2026-06-16.md` — backlog de navegabilidade
- `service-worker.js` — versão atual do cache

---

## Diretriz — registro de conversas Claude ↔ Codex

Toda deliberação relevante entre Claude e Codex deve ser salva em `.agents/conversas/` como arquivo `.md` com nome `AAAA-MM-DD-assunto.md`. A pasta é gitignored — fica local, não entra no repositório.

O que constitui deliberação relevante: plano proposto e aceito, decisão técnica com trade-off real, ajuste de abordagem acordado entre as duas vozes, validação de implementação com ressalvas.

Formato: três seções — `Claude → Codex (plano)`, `Codex → Claude (implementação ou resposta)`, `Claude → Codex (validação)`. Incluir número do commit ao final quando houver.

---

## Convenção de versionamento (crítico)

Toda edição em JS ou CSS → bumpar:
- `?v=YYYYMMDD-slug` em `index.html` (71 ocorrências, usar `sed`)
- `ASSET_VERSION` em `service-worker.js`
- `CACHE_NAME` (`vereda-offline-vN` → incrementar N)
