# M1 E2 — consolidação editorial de `algures` e `outrora`

Data: 2026-08-01  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Estado: **fechado e validado na matriz integral**

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
6. versão pública `20260801-lexical-algures-outrora-v1` e cache `v971`;
7. carregador `lexical-view-controller.js` alinhado ao mesmo identificador em `ui-dialog.js`.

## R — Resultado reproduzível

Banca específica `30726899840`:

- contratos de fonte e produto: **8/8**;
- TypeScript e build: verdes;
- auditoria E2 completa: verde.

A infraestrutura efêmera foi removida após a banca e o workflow oficial `Mass Notes Tiptap` foi restaurado integralmente.

A primeira abertura da matriz revelou uma divergência exclusivamente distributiva: `index.html` e o service worker já usavam a versão nova, mas `ui-dialog.js` ainda carregava o controlador lexical com o identificador anterior de `quica`. A cabeça vermelha foi preservada, a referência foi alinhada sem alterar redações ou comportamento lexical e a validação foi reaberta.

Cabeça funcional e distributiva validada: `8f391c56de481755650ad2beb598f91beda02c17`.

Matriz oficial `30727039290`:

- **364/364** em Chromium e Firefox;
- quatro novos contratos por navegador para `algures` e `outrora`;
- testes de fonte e produto dos dois verbetes: verdes;
- TypeScript e build: verdes;
- auditoria lexical e E2-V: verdes;
- publicação da preview: verde;
- renovação de cache: verde;
- smoke público: verde;
- artefato `mass-notes-tiptap-30727039290`;
- artifact ID `8826796653`;
- digest `sha256:55cdffd520da476682608f283ee417b67e1efc09f0999eae7cc67152bec78ff0`.

Contagem final reproduzida:

- 1.008 declarações brutas;
- 936 chaves efetivas;
- 66 grupos repetidos;
- 72 declarações sobrescritas;
- zero grupos idênticos;
- 66 grupos conflitantes.

Desempenho observado:

- Chromium: `p95SaveMs` 218 ms;
- Firefox: `p95SaveMs` 137 ms;
- DOM, memória disponível e quantidade de páginas permaneceram dentro dos contratos.

Também ficaram verdes na mesma cabeça:

- coerência de versões `30727039289`;
- candidata Argila `30727039249`;
- banca E2-V `30727039328`;
- Validação de Palavras `30727039267`;
- fronteira pública `30727039333`;
- todos os demais workflows oficiais disparados pelo PR.

Este commit é somente o fechamento documental da evidência acima. Ele não modifica engine, definição, distribuição, interface ou teste; sua própria cabeça deve repetir a matriz oficial antes de ser tratada como cabeça final da tranche.

## O — O que permanece aberto

- 66 conflitos editoriais de definições;
- oito autorreferências de sinônimos;
- quatro aliases técnicos;
- `leitor_modelo` vazio;
- cartões de polissemia ausentes;
- expansão lexical bloqueada;
- nota lexical mantida em 6,5 até ganho qualitativo mais amplo e banca humana.

## Parecer Eva — fechamento

- dimensão: Léxico e polissemia;
- escopo: dois advérbios, sem generalização;
- ganho: remoção de sobrescrita silenciosa, melhor delimitação semântica e distribuição coerente;
- nota: **6,5**, mantida;
- decisão: `PROSSEGUIR COM CONDIÇÕES` para o próximo pequeno lote editorial;
- condição: uma família por tranche, fontes e redações registradas, regressões próprias e matriz integral.
