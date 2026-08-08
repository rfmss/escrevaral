# OBS-01 — Paginação e rolagem isolada do manuscrito

Data: 2026-07-30

Estado: **diagnóstico planejado; implementação não iniciada**

Método de apresentação: **CLARO**

Fontes permanentes:

- `../../../docs/product/METODO_APRESENTACAO_MELHORIAS.md`;
- `../../../docs/product/TEMPLATE_APRESENTACAO_MELHORIA.md`.

## Resumo para apresentação

**Problema em uma frase:** o documento cresce como uma página contínua e faz a janela do navegador participar da rolagem, deslocando a composição em vez de manter o manuscrito numa área própria.

**Comportamento esperado em uma frase:** o editor deve apresentar páginas visuais separadas, como uma oficina de documento paginado, mantendo laterais estáveis e rolando somente a área central enquanto acompanha o cursor.

**Resultado atual em uma frase:** a necessidade está documentada, mas a arquitetura ainda precisa ser diagnosticada antes de qualquer implementação.

## C — Cenário observado

### O que a pessoa estava tentando fazer

Escrever um texto longo na preview do Mass Notes Next, ultrapassando a altura inicialmente visível do papel.

### Comportamento atual

- a barra de rolagem percebida é a da janela do navegador;
- o crescimento do documento aumenta a altura global da composição;
- biblioteca, manuscrito e ferramentas parecem participar do mesmo deslocamento vertical;
- o papel central funciona como uma superfície contínua;
- não existem folhas delimitadas, intervalo entre páginas, número de página ou página atual;
- a escrita longa não comunica claramente qual região deve rolar.

### Comportamento esperado

- `html`, `body` e a raiz da aplicação não devem rolar no uso normal;
- a aplicação deve ocupar a altura útil da janela;
- biblioteca esquerda, manuscrito central e ferramentas direitas devem ter fronteiras de rolagem próprias;
- somente o viewport central deve rolar o documento;
- o cursor deve permanecer visível ao digitar, colar ou navegar;
- laterais e toolbar devem permanecer estáveis;
- o documento deve apresentar folhas visuais separadas;
- a edição deve continuar sendo um único documento Tiptap/ProseMirror.

### Evidência anterior

A captura fornecida em 2026-07-30 mostra:

- documento longo ultrapassando a área inicialmente visível;
- scrollbar global na extrema direita da janela;
- lateral de ferramentas participando do enquadramento vertical;
- papel central contínuo, sem paginação visual.

A captura é evidência de observação, não prova suficiente da causa raiz. A causa deve ser medida por teste e inspeção de estilos computados.

## L — Limite e impacto

- severidade inicial: **P1 de usabilidade para escrita longa**;
- perda de dados: não observada;
- mutação autoral: não observada;
- bloqueio: parcial, porque a escrita continua possível, mas a composição e a orientação espacial se degradam;
- impacto de acessibilidade: potencial, especialmente em foco, teclado e previsibilidade de rolagem;
- superfícies afetadas: shell da aplicação, editor central, laterais, toolbar e navegação;
- navegadores: precisam ser avaliados em Chromium e Firefox;
- classificação: defeito de fronteira de rolagem e dívida de experiência paginada.

A proposta não autoriza afirmar “igual ao Word”. O objetivo é aproximar comportamentos específicos: páginas visuais, rolagem isolada e acompanhamento do cursor.

## A — Arquitetura recomendada

### Estrutura desejada

```text
Janela — sem rolagem
└── Aplicação — altura de 100dvh
    ├── Biblioteca esquerda — rolagem própria
    ├── Área central — rolagem própria
    │   └── Documento único com representação paginada
    └── Ferramentas direitas — rolagem própria
```

### Primeira tranche — isolamento da rolagem

Objetivo: corrigir a fronteira de altura e overflow antes de criar paginação visual.

Direção técnica esperada, a confirmar pelo diagnóstico:

```css
html,
body,
#root {
  height: 100%;
  overflow: hidden;
}

.app-shell {
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
}

.editor-column {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.editor-viewport {
  height: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}
```

Este trecho é direção de investigação, não patch aprovado.

Critério central:

```js
window.scrollY === 0
```

mesmo depois de criar um documento longo.

### Segunda tranche — representação paginada

O editor deve continuar sendo uma única instância Tiptap/ProseMirror.

O modelo de página deve permitir:

- A4 inicialmente;
- largura e altura configuráveis;
- margens editoriais;
- altura útil;
- intervalo entre folhas;
- número total de páginas;
- página atual;
- zoom ou ajuste à largura futuramente.

A paginação deve ser representação visual e de medição, não fragmentação do documento em vários editores.

Uma primeira versão pode aceitar quebras entre fronteiras de blocos, desde que essa limitação seja declarada. A divisão natural de um parágrafo longo entre páginas pode exigir uma tranche posterior.

### Terceira tranche — autoacompanhamento do cursor

Ao digitar, colar, pressionar `Enter`, usar setas, `Page Up`, `Page Down` ou navegar a partir de uma engine:

- a seleção deve continuar visível;
- a rolagem deve ocorrer no viewport central;
- a janela não deve se mover;
- o comportamento não deve saltar a cada caractere;
- `prefers-reduced-motion` deve ser respeitado;
- foco e seleção devem ser preservados.

A implementação deve investigar a seleção do ProseMirror e o comportamento atual de `scrollIntoView` antes de adicionar uma ponte própria.

## Alternativas rejeitadas antecipadamente

### Um editor Tiptap por página

Rejeitado porque tende a quebrar ou complicar:

- seleção entre páginas;
- `Ctrl + A`;
- desfazer e refazer;
- colagem longa;
- listas atravessando páginas;
- comentários e marcações;
- navegação por teclado;
- engines que leem o documento integral.

### Página com altura fixa e `overflow: hidden`

Rejeitada como solução isolada porque apenas corta conteúdo e não cria um modelo de paginação seguro.

### Fundo que imita folhas sem medição

Pode servir como protótipo visual, mas não deve ser apresentado como paginação funcional se cursor, seleção, impressão e exportação não respeitarem a estrutura percebida.

## Prompt aprovado para diagnóstico

```text
Estamos trabalhando no Escrevaral/Mass Notes Next, branch
experiment/mass-notes-tiptap, PR #155 em rascunho.

Objetivo desta etapa: investigar a arquitetura necessária para criar uma
experiência de documento paginado semelhante ao Word, sem alterar código
antes de apresentar o diagnóstico.

Problema observado:

1. O crescimento do documento está aumentando a altura da página do
   navegador.
2. A rolagem global movimenta ou desloca a composição inteira.
3. Biblioteca, manuscrito e ferramentas devem possuir fronteiras de
   rolagem independentes.
4. O papel central ainda é uma superfície contínua, sem páginas visuais
   delimitadas.
5. Enquanto a pessoa escreve, o editor central deve acompanhar o cursor
   automaticamente, sem mover a janela global.

Investigue:

- quais elementos controlam hoje altura, overflow e grid;
- por que body/window continuam rolando;
- quais ancestrais do editor precisam de min-height: 0;
- onde deve existir o único scroll vertical do manuscrito;
- como o Tiptap/ProseMirror executa scrollIntoView atualmente;
- como preservar seleção, histórico, colagem, listas e engines com um
  único editor;
- quais estratégias de paginação são possíveis:
  a) fundo visual repetido;
  b) múltiplos editores;
  c) um editor com plugin/decorations de paginação;
  d) outra estratégia encontrada no código;
- riscos de cada estratégia;
- comportamento recomendado para desktop, tablet e celular;
- impacto sobre exportação TXT, Markdown, HTML e impressão.

Restrições:

- não criar um editor por página;
- não alterar engines linguísticas;
- não alterar IndexedDB ou formato persistido;
- não alterar main nem a aplicação pública;
- não implementar antes de apresentar o diagnóstico;
- não fazer afirmação de paridade integral com Word;
- preservar Chromium e Firefox;
- preservar a preview isolada e o PR em rascunho.

Entregue:

1. mapa atual dos contêineres e seus overflows;
2. causa raiz da rolagem global;
3. arquitetura proposta;
4. alternativas rejeitadas e justificativa;
5. divisão em fases pequenas;
6. critérios de aceite automatizáveis;
7. arquivos que precisariam ser alterados;
8. riscos e plano de reversão;
9. registro Markdown versionado no diretório docs/logs;
10. ficha preenchida pelo método CLARO.

Não escreva código nesta etapa.
```

## Prompt previsto para implementação

Este prompt só pode ser usado depois da aprovação do diagnóstico.

```text
Implemente a primeira tranche da paginação e rolagem isolada do
Mass Notes Next conforme o diagnóstico aprovado.

Escopo desta tranche:

A. Isolamento da janela

- html, body e #root não podem possuir rolagem durante o uso normal.
- A aplicação deve ocupar exatamente a altura útil da janela.
- A biblioteca esquerda, o manuscrito central e as ferramentas direitas
  devem ter regiões de rolagem independentes.
- O crescimento do texto não pode aumentar a altura do body.
- window.scrollY deve permanecer em zero.
- Não pode surgir overflow horizontal.

B. Área central

- Criar um contêiner explícito .editor-viewport.
- Somente esse contêiner deve rolar o manuscrito.
- Manter o papel centralizado.
- Preservar toolbar e controles alcançáveis.
- Usar overscroll-behavior e scrollbar-gutter adequadamente.
- Não permitir que a roda sobre o manuscrito mova as laterais.

C. Autoacompanhamento

- Digitação, Enter, colagem, setas, Page Up, Page Down e navegação
  gerada pelas engines devem manter o cursor visível.
- A rolagem deve ocorrer no .editor-viewport, nunca na janela.
- Evitar saltos em cada tecla.
- Respeitar prefers-reduced-motion.
- Preservar foco e seleção.

D. Fundação da paginação

- Manter uma única instância Tiptap/ProseMirror.
- Criar um modelo configurável de página com:
  formato, largura, altura, margens, área útil e intervalo.
- Iniciar com A4.
- Apresentar folhas visuais separadas.
- Não criar múltiplos editores.
- Não modificar o JSON autoral para armazenar elementos puramente visuais.
- Caso a quebra de parágrafos entre páginas ainda não seja segura,
  documentar essa limitação e não ocultá-la.

E. Testes Playwright em Chromium e Firefox

Adicionar cenários para:

1. documento com pelo menos cinco páginas;
2. window.scrollY permanece zero;
3. editor possui scrollHeight maior que clientHeight;
4. roda do mouse move somente o editor;
5. laterais não mudam de posição;
6. cursor permanece visível ao chegar à quinta página;
7. colagem longa mantém o cursor visível;
8. Ctrl+A continua selecionando o documento inteiro;
9. desfazer e refazer atravessam páginas;
10. listas e citações não desaparecem;
11. 1440×560, 1366×768, 1024×768, 390×640;
12. drawers móveis continuam acessíveis;
13. nenhum overflow horizontal;
14. engines continuam lendo o documento integral;
15. exportações continuam contendo o documento integral.

Documentação:

- criar registro de diagnóstico, implementação e evidências;
- preencher e apresentar a ficha CLARO;
- incluir capturas antes/depois;
- registrar limitações reais;
- informar cabeça, workflow, número de testes e artefato;
- manter PR aberto e em rascunho;
- não promover para main;
- não executar Gate 14.

A publicação somente pode acontecer se toda a matriz estiver verde.
```

## Critérios de aceite previstos

1. `window.scrollY` permanece zero com documento longo;
2. o viewport do editor possui `scrollHeight > clientHeight`;
3. roda e teclado movem somente o manuscrito;
4. laterais mantêm posição na janela;
5. cursor permanece visível até pelo menos a quinta página;
6. colagem longa não desloca a janela;
7. `Ctrl + A`, desfazer e refazer continuam atuando no documento integral;
8. listas, citações e títulos permanecem editáveis;
9. engines recebem o documento integral;
10. TXT, Markdown e HTML exportam o conteúdo integral;
11. não aparece overflow horizontal;
12. comportamento equivalente em Chromium e Firefox;
13. drawers móveis continuam acessíveis;
14. a paginação não entra no JSON autoral como conteúdo;
15. as limitações da primeira versão ficam explícitas.

## R — Resultado reproduzível

Ainda não existe resultado de implementação.

Status correto desta observação:

- **em investigação**, até que a causa raiz seja medida;
- depois, **reproduzida**, caso o teste confirme a rolagem global;
- somente **corrigida** quando a matriz prevista estiver verde.

Não há autorização para apresentar esta observação como concluída.

## O — O que permanece aberto

- mapa real de alturas e overflows;
- decisão entre paginação por decorations, medição de blocos ou outra estratégia;
- comportamento de parágrafos que atravessam páginas;
- impressão paginada;
- numeração e página atual;
- zoom;
- teste em dispositivo físico;
- leitores de tela e tecnologias assistivas;
- custo de medição em documentos muito longos.

## Como apresentar esta melhoria quando existir

### Camada rápida

1. título: `OBS-01 — Paginação e rolagem isolada`;
2. problema: “a janela inteira rolava e o papel crescia continuamente”;
3. esperado: “somente o manuscrito rola, com folhas separadas e cursor acompanhado”;
4. status honesto;
5. vídeo antes/depois com o mesmo documento;
6. quadro com cinco critérios principais;
7. limites da primeira versão;
8. link da preview;
9. roteiro de teste.

### Demonstração visual mínima

- vídeo de 15 a 30 segundos;
- mesmo documento e mesmo viewport antes/depois;
- digitar ou colar até atravessar três a cinco páginas;
- mostrar que o cursor acompanha a escrita;
- mostrar que `window.scrollY` não muda;
- mostrar que laterais permanecem imóveis;
- mostrar a passagem visual entre folhas;
- repetir em desktop baixo e celular.

### Capturas recomendadas

- `1440 × 900`;
- `1440 × 560`;
- `1024 × 768`;
- `390 × 844` ou `390 × 640`.

### Roteiro previsto para a preview

1. abrir a candidata validada;
2. colar o documento de teste fornecido;
3. escrever até ultrapassar a terceira folha;
4. observar a rolagem central e o cursor;
5. confirmar que biblioteca e ferramentas não se deslocam;
6. testar `Ctrl + A`, desfazer, refazer e exportar;
7. repetir no viewport móvel.

## Fronteira de release

Esta observação não altera os vereditos vigentes:

- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`;
- PR permanece em rascunho;
- `main`, produto público e Gate 14 permanecem intactos.
