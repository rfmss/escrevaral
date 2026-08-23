# Gate 7 — primeira decoration ProseMirror somente de leitura

Data: 2026-07-28

## Situação

**Aprovado para continuidade experimental.**

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155`, rascunho;
- workflow funcional final: `30367072054`;
- commit funcional validado: `5e7017ddefc634018daf6071ff8b04a3afe5f9cc`;
- Chromium: 67 cenários aprovados;
- Firefox: 67 cenários aprovados;
- total: 134 execuções, zero falhas, zero flakiness;
- preview publicada e verificada publicamente após o gate verde;
- `main`, aplicação pública, service worker e engines originais: intactos.

A aprovação não autoriza merge, promoção para a entrada pública, aplicação automática de sugestões nem ampliação imediata das decorations para todas as engines.

## Objetivo

Provar uma única marcação linguística inline, somente de leitura, sobre a infraestrutura de posições aprovada nos Gates 6 e 6.9.

O experimento foi limitado à camada de pontuação da engine de Revisão porque ela já devolve:

- `fragment` textual;
- `pos` em UTF-16;
- identificador de regra;
- critério;
- orientação editorial;
- severidade.

Alertas agregados sem posição verificável continuam exclusivamente no painel.

## Implementação

### Plugin isolado

Foi criado `src/editor/reviewDecorations.ts` como extensão Tiptap e plugin ProseMirror independente.

O plugin:

- recebe apenas ranges já convertidos para posições ProseMirror;
- usa `DecorationSet`;
- não grava no JSON;
- não entra no histórico;
- não altera o texto;
- não recebe clique ou ponteiro;
- limpa todas as projeções em qualquer transação com `docChanged`;
- não tenta mapear automaticamente uma leitura antiga para texto editado.

### Validação defensiva do adaptador

`reviewAdapter.ts` passou a expor `reviewTextDetailed()`.

Uma ocorrência só pode se tornar marca quando:

1. possui `fragment` não vazio;
2. possui posição inteira e não negativa;
3. `text.slice(from, to)` reproduz exatamente o fragmento;
4. um eventual realinhamento local não ultrapassa três unidades UTF-16;
5. o range convertido não colapsa;
6. `documentId` e `contentSignature` continuam atuais ao fim da análise.

O adaptador nunca procura globalmente a primeira ocorrência do fragmento. Isso preserva textos com trechos repetidos.

### Painel e navegação

A aba Revisão separa:

- **Trechos localizados** — cartões navegáveis com regra, critério, fragmento e orientação;
- **Observações gerais** — leituras agregadas que não prometem uma posição exata.

`Ir ao trecho` seleciona o range correto no editor e o leva à área visível. Não existe botão de corrigir, substituir ou aplicar.

### Visibilidade

A pessoa pode escolher `Ocultar marcas` e `Mostrar marcas`.

Esse controle:

- mantém os cartões e a leitura no painel;
- não altera assinatura ou texto;
- não remove resultados;
- apenas neutraliza a projeção visual;
- volta ao estado visível quando uma nova leitura ou outro documento é carregado.

## Linguagem visual

As marcas usam `--ui-analysis`, reservado para análise linguística.

Elas não reutilizam:

- o laranja da seleção;
- o vermelho da ação principal;
- cores de erro ou conflito.

A camada visual está isolada em `src/styles/review-decorations.css` e é carregada por último.

## Cobertura nova

Foram adicionados oito cenários por navegador:

1. posição exata cria marca sem alterar documento;
2. navegação permanece correta depois de emoji e `hardBreak`;
3. qualquer edição remove projeções e exige nova leitura;
4. troca de documento não transporta marca ou navegação;
5. fragmentos repetidos mantêm posições independentes;
6. posição ou fragmento não verificável nunca produz marca;
7. cor semântica, `pointer-events: none` e mobile sem overflow;
8. ocultar e restaurar marcas preserva leitura, assinatura e conteúdo.

Todos os gates anteriores continuaram obrigatórios.

## Incidentes e decisões

### Halo cinza na folha

O print manual revelou um gradiente cinza no canto esquerdo da folha. A causa era `--bp-shadow-soft`, com blur de 64–68 px.

A sombra difusa foi zerada; a sombra gráfica seca da prancha foi preservada.

### Oráculo do Gate 6.9

O primeiro corpus editorial havia contado `br.ProseMirror-trailingBreak` como quebra autoral em parágrafos vazios. Esse elemento é apenas placeholder de edição. O oráculo foi corrigido; o contrato de posições estava correto.

### Regra contida em outra regra

Em um corpus repetido, `PONT-49` estava contida em um fragmento maior de `PONT-08`. O ProseMirror compôs decorations sobrepostas em spans compartilhados.

A identidade funcional não depende da quantidade de spans DOM. O gate passou a exigir:

- dois cartões `PONT-49`;
- duas posições navegáveis;
- seleção correta em dois parágrafos diferentes.

### Concorrência de commits

Commits paralelos sobre preview e testes cancelaram algumas execuções pelo grupo de concorrência. Apenas a cabeça atual foi considerada evidência.

Um cenário de visibilidade chegou a existir duas vezes e, durante a remoção concorrente, ambas as cópias foram apagadas. A árvore final mantém exatamente uma versão isolada.

## Limites ativos

Ainda não foram aprovados:

- tooltips sobre o texto;
- aplicação ou substituição automática;
- correção em massa;
- decorations de Voz, Contexto ou RimaLab;
- decorations de alertas agregados sem posição exata;
- persistência de marcas no documento;
- leitores de tela reais;
- promoção para `main`.

## Próximo passo recomendado

Realizar uma avaliação manual das marcas com textos brasileiros reais, observando:

- ruído visual em documentos com muitas ocorrências;
- conflito entre seleção e análise;
- navegação por teclado em listas longas;
- utilidade da separação entre observação geral e trecho localizado;
- decisão de limite ou agrupamento de ocorrências sobrepostas.

Uma segunda engine só deve ganhar decoration após essa avaliação e nova autorização explícita.
