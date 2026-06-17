# Handoff vivo — Escrevaral

**Atualizado em:** 2026-06-17  
**Versão atual:** v593 (`vereda-offline-v592`, `ASSET_VERSION=20260617-subst188`)

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

1. `decolonial-data.json` — fetichização racial tem gaps ainda (260 entradas)
2. `synonym-data.js` — 226 entradas, mais verbos de estado e movimento possíveis
3. `norma-data.json` — verbos_pres_reg 402 pode crescer com mais verbos literários
4. Sintaxe 99%→100% — requer desambiguação contextual em syntax-engine.js (custo alto, avaliar)

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
