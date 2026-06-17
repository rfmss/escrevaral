# Handoff vivo — Escrevaral

**Atualizado em:** 2026-06-17  
**Versão atual:** v588 (`vereda-offline-v587`, `ASSET_VERSION=20260617-atl01`)

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
| v588 | 41 adjetivos seguros adicionados (adjetivos_comuns 478→519) |

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

1. Continuar ciclo de dados: `lexical-data.json` pode crescer para 240+ (escritor, leitor, lugar, espaço, texto)
2. `synonym-data.js` pode crescer mais (214 entradas, margem ampla)
3. Hook de aviso pré-commit para versionamento (design pendente)
4. Skills formais em `.claude/skills/`

---

## Arquivos-chave do estado

- `META_ENGINES_100.md` — maturidade de cada engine
- `norma-data.json` — dados morfológicos (adjetivos_comuns: 519, formas_verbais_irr: 230, verbos_pres_reg: 402)
- `docs/_decisoes/AGENCIA_CONTINUIDADE_2026-06-16.md` — backlog de navegabilidade
- `service-worker.js` — versão atual do cache

---

## Convenção de versionamento (crítico)

Toda edição em JS ou CSS → bumpar:
- `?v=YYYYMMDD-slug` em `index.html` (71 ocorrências, usar `sed`)
- `ASSET_VERSION` em `service-worker.js`
- `CACHE_NAME` (`vereda-offline-vN` → incrementar N)
