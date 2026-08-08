# M1 E2 — consolidação editorial de `algures` e `outrora`

Data: 2026-08-01  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Estado: **conteúdo lexical fechado; preparação determinística da banca aplicada; matriz final pendente**

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

## Repetição da cabeça documental e estabilização da banca

A cabeça documental `35776a5b4aca329ed32a382dc77269d499105312` foi submetida à matriz oficial `30727473648` e preservou dois resultados vermelhos distintos em execuções consecutivas:

1. primeira execução: **363/364**; o Firefox entrou uma vez em `Conflito` durante a jornada não funcional de rede, apesar de o cenário usar uma única página. A preview foi corretamente bloqueada;
2. reexecução da mesma cabeça: a jornada anterior passou, mas outro contrato terminou em **363/364** porque `locator.fill()` anexou o novo manuscrito ao conteúdo Tiptap já existente no Firefox, em vez de substituí-lo.

O segundo trace mostrou o documento resultante como:

```text
Melancolia atravessa a casa sem pedir licença.O elevador parou entre dois andares.
```

O contrato de posição agiu corretamente ao rejeitar esse texto como diferente do manuscrito esperado. Portanto, não havia falha na seleção lexical nem na projeção de posições: a preparação do teste era não determinística para `contenteditable` no Firefox.

Correção mínima aplicada somente à banca:

- foco explícito no editor;
- `Control+A` e `Backspace` para esvaziar o documento;
- inserção pelo teclado, passando pela transação real do Tiptap;
- igualdade exata do manuscrito antes de consultar o contrato de posição.

Não houve:

- mudança em engine, definição ou interface;
- aumento de timeout;
- retry no Playwright;
- ocultação de conflito real;
- alteração na política de persistência.

A primeira ocorrência de conflito não se repetiu na segunda execução e continua registrada como ocorrência não classificada. A cabeça que contém a preparação determinística e este registro deve passar pela matriz integral antes do fechamento definitivo e da atualização do corpo do PR.

## O — O que permanece aberto

- matriz integral da cabeça com a banca estabilizada;
- 66 conflitos editoriais de definições;
- oito autorreferências de sinônimos;
- quatro aliases técnicos;
- `leitor_modelo` vazio;
- cartões de polissemia ausentes;
- expansão lexical bloqueada;
- nota lexical mantida em 6,5 até ganho qualitativo mais amplo e banca humana.

## Parecer Eva — fechamento condicionado

- dimensão: Léxico e polissemia;
- escopo: dois advérbios, sem generalização;
- ganho: remoção de sobrescrita silenciosa, melhor delimitação semântica e distribuição coerente;
- nota: **6,5**, mantida;
- decisão: `PAUSAR` o próximo lote até a matriz da banca estabilizada;
- condição: uma família por tranche, fontes e redações registradas, regressões próprias e matriz integral.
