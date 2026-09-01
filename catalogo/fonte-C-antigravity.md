# Catálogo — Fonte C: antigravity

Caminho: `/home/rafamass/Área de trabalho/2027/escrevaral-antigravity-starter/`. **ES5 canônico + modelo de maturidade M0–M7.** A base-alvo do Encore para estrutura.

## Máquinas por domínio (`machine/analyzers/`)

| Domínio | Engine | Dados | Maturidade |
|---|---|---|---|
| **Léxico** | lexico/LexicoAnalyzer + lexicon-analyzer.js | lexicon-shards: base 506 B + literary 160 KB | **M6** |
| **Morfologia** | morfologia/MorfologiaAnalyzer.js | knowledge/morfologia/corpus/ | **M6** |
| **Sintaxe** | sintaxe/SintaxeAnalyzer.js | knowledge/sintaxe/corpus/ | **M6** |
| Acentuação | acentuacao/AcentuacaoAnalyzer | knowledge/acentuacao/ | M0 |
| Concordância | concordancia/ConcordanciaAnalyzer | knowledge/concordancia/ | M0 |
| Crase | crase/CraseAnalyzer | knowledge/crase/ | M0 |
| Hífen | hifen/HifenAnalyzer | knowledge/hifen/ | M0 |
| Ortografia | ortografia/OrtografiaAnalyzer | knowledge/ortografia/ | M0 |
| Pontuação mecânica | pontuacao/PontuacaoMecanicaAnalyzer | knowledge/pontuacao/ | M0 |
| Pontuação sintática | pontuacao-sintatica/PontuacaoSintaticaAnalyzer | (usa Sintaxe) | M0 |
| Regência | regencia/RegenciaAnalyzer | knowledge/regencia/ | M0 |
| Análise Literária | analise-literaria/AnaliseLiterariaAnalyzer | knowledge/analise-literaria/ | não registrado |
| Coesão/Discurso/Estilo/Estilometria/Semântica | (sem engine) | caixa M0 + MATURITY | M0 |

## Camada `js/core/linguistic-core/` (nova ES5)
- **contracts.js** (1 KB) — API de contratos
- **orchestrator.js** (8.8 KB) — integra regras de todos os domínios
- **services/**: lexicon-service, **morphology-lite** (suffix trie), normalization, paragraph, sentence, syntax, **tokenizer** (720 B) — a infra que portamos para o Encore.
- **rules/**: lexical-style, morphology (gerundismo), punctuation, syntax — regras por domínio.

## Dados compilados
`js/core/storage/lexicon-shards/`: base.json 506 B + literary.json 160 KB. `runtime-data/` vazio.
Cada domínio M0/M6 segue padrão `corpus/` + `rules/` + `sources/` (proveniência), somando dezenas de KB.

## Modelo de maturidade (o coração do Encore)
M0 SEED → M1 SPECIFIED → M2 GROUNDED → M3 TESTED → M4 ADVERSARIAL → M5 RUNTIME → M6 LEGACY READY → M7 MATURE. Níveis não pulam; sem evidência → NO PROMOTION.

## Para o Encore (ES5)
**Base ideal**: contracts/orchestrator/tokenizer/morphology-lite são ES5 puro e pequenos — já portamos morphology. Léxico tem quebra de RAM (100k entradas O(1), shards) — padrão para levar ao produto final.
