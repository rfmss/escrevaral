# Sessão autônoma — 2026-05-25

Objetivo: avançar engines de linguagem em direção a 85%+, engine por engine, com commit a cada avanço.
Aberta em: 2026-05-25

---

## Estado ao abrir

| Engine | % antes | % depois | Commit |
|---|---:|---:|---|
| Precision / aderência ao guia | 82% | — | — |
| Léxico / Biblioteca | 82% | — | — |
| Pontuação | 82% | — | — |
| Espelho de Voz | 82% | — | — |
| Sintaxe | 80% | — | — |
| Análise geral | 80% | — | — |
| Validação da prova | 78% | — | — |
| Editor / documento | 77% | — | — |
| Paginação / modo página | 77% | — | — |
| Templates / guias | 77% | — | — |
| RimaLab | 73% | — | — |
| Decolonial / vocabulário | 72% | — | — |

---

## Log da sessão

### [EM ANDAMENTO] Precision → 82% → ?

**O que faz:** Analisa adesão do texto ao guia/forma selecionado. 11 gêneros cobertos + genérico.

**Lacunas identificadas:**
- `terror-horror`, `memoir`, `jornalismo` caem no `analyzeGeneric` sem análise específica
- `romance-sentimental`, `fanfiction` caem no genérico (poderiam usar `analyzeRomance`/`analyzeContoCurto`)
- Status labels muito confiantes: "Pronto para leitura editorial" em score 82 — devia ser mais honesto
- `analyzeGeneric` sem template ativo não orienta o que fazer
- Faltam: `analyzeJornalismo()`, `analyzeTerrorHorror()`, `analyzeMemoir()`

**Plano:**
1. Adicionar `analyzeTerrorHorror()` — 6 checks de horror/suspense
2. Adicionar `analyzeMemoir()` — 6 checks de memória/autobiografia
3. Adicionar `analyzeJornalismo()` — 5 checks para reportagem/newsletter/coluna
4. Rotear `romance-sentimental` → `analyzeRomance`
5. Rotear `fanfiction` → `analyzeContoCurto`
6. Rotear `memoir` → `analyzeMemoir`
7. Rotear templates de jornalismo → `analyzeJornalismo`
8. Corrigir status labels em `summarize()`: menos confiante, mais honesto

---

## Próxima tarefa ao abrir

**Se a tabela acima ainda tiver "—" para Precision:** implementar o plano descrito na seção Precision acima.
**Se Precision já tiver %:** olhar a linha seguinte com "—" e continuar de lá.

Tudo commitado antes de parar. Basta `git log --oneline -20` para ver onde ficou.
