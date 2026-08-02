# M1 E2 — consolidação editorial de `algures` e `outrora`

Data: 2026-08-01  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Estado: **banca específica verde; matriz integral oficial pendente**

> **Eva Chara, entre em banca.**

## C — Cenário observado

A auditoria registrava 68 grupos conflitantes. O primeiro par editorial coerente era formado por dois advérbios de localização:

- `algures`: duas redações concorrentes sobre lugar indefinido;
- `outrora`: duas redações concorrentes sobre tempo passado.

A semântica do objeto JavaScript fazia a última declaração sobrescrever a primeira. A redação descartada ficava invisível no produto e as duas versões misturavam definição lexical com afirmações editoriais não demonstradas.

Baseline:

- 1.010 declarações brutas;
- 936 chaves efetivas;
- 68 grupos repetidos;
- 74 declarações sobrescritas;
- zero grupos idênticos;
- 68 grupos conflitantes.

## L — Limite

O lote consolida somente `algures` e `outrora`. Não altera os outros 66 conflitos, sinônimos, aliases, polissemia, regras contextuais, interface, `main` ou Gate 14.

## A — Fundamentação e ação mínima

### `algures`

As fontes lexicográficas convergem em dois pontos: é advérbio de lugar e designa algum lugar, especialmente um lugar não sabido ou não nomeado diretamente. A orientação espacial foi preservada porque consultas linguísticas registram como não estrito o emprego temporal em construções como “algures no ano”.

> Advérbio de lugar: 'em algum lugar', 'em alguma parte'. Indica um lugar que não se sabe ou não se quer nomear diretamente; em sentido estrito, refere-se ao espaço, não ao tempo.

### `outrora`

As fontes convergem em `noutro tempo`, `antigamente` e `em tempos passados`. Foram retiradas as restrições artificiais a ficção histórica e narrativas de memória. A nota sobre efeito retrospectivo ou historicizante é orientação editorial do Escrevaral, não ampliação do significado lexical.

> Advérbio de tempo: 'noutro tempo', 'antigamente', 'em tempos passados'. Situa algo em período anterior, sem exigir data precisa; pode produzir tom retrospectivo ou historicizante.

Fontes consultadas e parafraseadas:

- Caldas Aulete, verbetes `algures` e `outrora`;
- Michaelis, verbete `outrora`;
- Priberam, verbetes `algures` e `outrora`;
- Infopédia, verbetes `algures` e `outrora`;
- Ciberdúvidas, consulta “O uso do advérbio algures”.

Ação técnica:

1. uma única declaração ativa por verbete;
2. sínteses novas e explícitas;
3. linhas desativadas convertidas em comentários de rastreabilidade, preservando as linhas do restante do inventário;
4. auditoria lexical regenerada;
5. contratos estáticos e regressões de produto nos dois navegadores;
6. versão pública `20260801-lexical-algures-outrora-v1` e cache `v971`.

## R — Resultado específico

Executor efêmero: `30726899840`.

- contratos de fonte e produto: **8/8**;
- TypeScript e build: verdes;
- auditoria E2 completa: verde;
- contagem final:
  - 1.008 declarações brutas;
  - 936 chaves efetivas;
  - 66 grupos repetidos;
  - 72 declarações sobrescritas;
  - zero grupos idênticos;
  - 66 grupos conflitantes.

A infraestrutura efêmera foi removida após a banca e o workflow oficial `Mass Notes Tiptap` foi restaurado integralmente. A cabeça limpa anterior a este registro é `8931c14589141b43fd2461abc669b4867f3194e0`.

Esta atualização estritamente documental abre a matriz integral oficial. A publicação da preview, a renovação de cache e o smoke público permanecem bloqueados até o verde completo.

## O — O que permanece aberto

- matriz integral oficial da cabeça documental limpa;
- 66 conflitos editoriais de definições;
- oito autorreferências de sinônimos;
- quatro aliases técnicos;
- `leitor_modelo` vazio;
- cartões de polissemia ausentes;
- expansão lexical bloqueada;
- nota lexical mantida em 6,5 até ganho qualitativo mais amplo e banca humana.

## Parecer Eva

- dimensão: Léxico e polissemia;
- escopo: dois advérbios, sem generalização;
- ganho: remoção de sobrescrita silenciosa e orientação editorial mais precisa;
- nota: **6,5**, mantida;
- decisão: `PROSSEGUIR COM CONDIÇÕES` para a matriz integral;
- condição: preview somente com todos os contratos oficiais verdes.
