# OBS-01 — Paginação visual e rolagem isolada estabilizadas

Data: 2026-07-30

Método: **CLARO**

Status: **corrigida dentro do escopo v1, com limitações declaradas**

PR: `#155`, aberto e em rascunho  
Branch: `experiment/mass-notes-tiptap`  
Preview: `preview-mass-notes-tiptap`

## Resumo para apresentação

**Problema em uma frase:** o crescimento do manuscrito aumentava a altura da janela em tablet e celular, deslocava a composição inteira e mantinha o papel como uma superfície contínua.

**Comportamento esperado em uma frase:** a janela e as laterais permanecem estáveis, somente o manuscrito rola, o cursor é acompanhado e o documento apresenta folhas visuais separadas sem fragmentar o Tiptap.

**Resultado em uma frase:** a rolagem global foi eliminada, uma paginação visual em fronteiras de blocos foi integrada a uma única instância ProseMirror e oito novas provas passaram nos dois navegadores.

## C — Cenário observado

### Ação da pessoa

A pessoa escreveu um documento suficientemente longo para ultrapassar a altura inicialmente visível do papel na preview.

### Comportamento anterior

- a scrollbar principal era a da janela do navegador;
- o documento aumentava a altura de `body` e da shell;
- biblioteca, manuscrito e ferramentas eram deslocados pela mesma rolagem;
- a área central não assumia a rolagem do texto longo;
- o papel era uma superfície contínua;
- não existiam transições visuais entre folhas;
- o acompanhamento do cursor dependia da janela global.

### Evidência visual anterior

A captura fornecida pela pessoa mostrou:

- scrollbar na extrema direita da janela;
- conteúdo longo empurrando a composição vertical;
- ferramentas direitas participando da mesma altura global;
- ausência de páginas visuais delimitadas.

A captura foi usada como observação inicial. A causa foi confirmada depois por medição automatizada.

## Baseline reproduzida antes da implementação

Arquivo de prova:

- `tests/m1-pagination-scroll.spec.ts`.

Cabeça:

- `0d614d15f6477b481644ee6b0594ef1e4cd613df`.

Workflow:

- Mass Notes `30512664511`;
- job `90775835919`.

Resultado:

- oito execuções novas falharam;
- os 294 testes anteriores passaram;
- a publicação da preview foi bloqueada corretamente.

Medições principais:

- em `1024 × 768`, a shell chegou a aproximadamente `6.592 px` de altura;
- em `390 × 640`, a shell chegou a aproximadamente `15.850 px` de altura;
- o viewport central permaneceu com `scrollTop = 0`;
- não existia `data-page-count`;
- não existiam marcadores de transição entre folhas.

Artefato da baseline:

- ID `8747802414`;
- digest `sha256:9a7dbc31051a03c35722a751132a64f8e5cf01d0a642be055ca69c1366a7c320`.

## Causa raiz

A causa não estava no volume do texto nem no Tiptap isoladamente. Ela estava na cascata de layout.

Em desktop, a fundação já tentava manter a aplicação em `100vh` e usar `.editor-shell` como região rolável. Entretanto, as folhas de estabilização responsiva reabriam a página global em larguras menores:

- `body { overflow: auto }`;
- `.app-shell` perdia o limite de altura;
- a shell passava a aceitar `overflow: visible`;
- a workspace crescia conforme o documento;
- o navegador assumia o `scrollIntoView` da seleção.

Assim, o comportamento de tablet e celular contrariava o contrato desejado da aplicação.

No desktop amplo, a rolagem central existia, mas o papel continuava visualmente contínuo e sem modelo de página.

## L — Limite e impacto

- severidade: **P1 de usabilidade para escrita longa**;
- perda de dados: não observada;
- mutação autoral: não observada;
- bloqueio: parcial;
- acessibilidade: afetava previsibilidade de foco e rolagem;
- superfícies: shell, workspace, manuscrito, biblioteca, ferramentas e navegação por teclado;
- navegadores: reproduzido em Chromium e Firefox;
- classificação: defeito de fronteira de rolagem e ausência de representação paginada.

## A — Arquitetura escolhida

### Princípio preservado

O documento continua sendo uma única instância Tiptap/ProseMirror.

Não foi criado um editor por página.

### Fronteira de rolagem

A estrutura final segue este contrato:

```text
Janela — sem rolagem no uso normal
└── Aplicação — 100dvh
    ├── Biblioteca — rolagem própria quando aberta
    ├── Manuscrito — única rolagem do documento
    │   └── Um Tiptap com representação paginada
    └── Ferramentas — rolagem própria quando aberta
```

### Paginação v1

Foi criada uma extensão Tiptap/ProseMirror que:

- mede a posição visual de blocos de primeiro nível;
- calcula a altura útil de cada folha;
- cria espaçadores visuais antes do próximo bloco quando necessário;
- registra `data-page-count` no papel;
- preserva um único DOM autoral `.ProseMirror`;
- usa Decorations/widgets que não entram no JSON do manuscrito;
- mapeia as posições dos marcadores durante transações;
- exclui as transações de medição do histórico autoral;
- recalcula quando documento ou largura mudam;
- não altera engines linguísticas.

### Representação visual

A camada de composição:

- mantém o papel Blueprint;
- desenha folhas com proporção A4 como referência inicial;
- cria intervalos visuais entre folhas;
- preserva o token computado de fundo em modo papel e modo noite;
- mostra uma scrollbar própria do manuscrito;
- mantém a identidade visual e os contratos de contraste anteriores.

### Acompanhamento do cursor

Quando a seleção sai da zona confortável do viewport:

- a extensão mede as coordenadas da seleção ProseMirror;
- ajusta somente `scrollTop` de `.editor-shell`;
- não move `window.scrollY`;
- preserva foco e seleção;
- respeita `prefers-reduced-motion`;
- continua compatível com `scrollIntoView` usado pela navegação da Revisão.

## Alternativas rejeitadas

### Um Tiptap por página

Rejeitado porque fragmentaria ou complicaria:

- `Ctrl + A`;
- seleção atravessando páginas;
- desfazer e refazer;
- colagem longa;
- listas, citações e links atravessando folhas;
- marcações da Revisão;
- leitura integral pelas engines;
- persistência e exportação do documento inteiro.

### Papel com altura fixa e conteúdo cortado

Rejeitado porque `height` com `overflow: hidden` apenas esconderia o texto.

### Fundo que imita páginas sem medir conteúdo

Rejeitado como solução final porque não garantiria que blocos e cursor acompanhassem a representação visual.

## Arquivos principais

- `src/editor/paginationExtension.ts`;
- `src/editor/editorExtensions.ts`;
- `src/styles/pagination.css`;
- `src/main.tsx`;
- `tests/m1-pagination-scroll.spec.ts`;
- `tests/gate10-lexical.spec.ts`.

O último arquivo recebeu apenas uma estabilização de prova: o teste lexical passou a aguardar o contrato estrutural ProseMirror confirmar o texto antes de selecionar posições. O comportamento do produto e a assertion funcional foram preservados.

## R — Resultado reproduzível

### Banca nova

Foram adicionados quatro cenários em cada navegador, totalizando oito execuções:

1. tablet `1024 × 768` mantém a janela imóvel e rola somente o manuscrito;
2. celular `390 × 640` mantém a janela imóvel e usa viewport central próprio;
3. desktop `1440 × 900` apresenta folhas visuais mantendo apenas um ProseMirror;
4. cursor acompanha a escrita, enquanto desfazer e refazer atravessam páginas.

### Critérios comprovados

- `window.scrollY === 0` após documento longo;
- altura do documento global não ultrapassa a janela;
- `.editor-shell` possui overflow vertical real;
- roda do mouse movimenta o manuscrito;
- biblioteca e ferramentas não mudam de posição;
- existem múltiplas páginas medidas;
- a quantidade de transições corresponde a `pageCount - 1`;
- existe somente uma `.ProseMirror`;
- cursor final permanece dentro do viewport central;
- undo/redo preserva edição feita após várias páginas;
- os 294 testes herdados continuam presentes.

### Cabeça funcional aprovada

- `2aa70cf04e7c60be9d5f83af18c606914f3cb18b`.

### Evidência Mass Notes

- workflow `30514845780`;
- job `90782270134`;
- auditoria lexical e build aprovados;
- **302/302** execuções aprovadas;
- publicação da preview aprovada;
- renovação de cache aprovada;
- smoke público aprovado;
- artefato `mass-notes-tiptap-30514845780`;
- artifact ID `8748557348`;
- digest `sha256:6c4ae1577f79993720321c8cc060877510ea7fe630dba395fe9b7aaf76bc59fa`.

### Evidência de coerência

- workflow `30514845761` aprovado.

### Evidência Argila

A primeira tentativa do workflow `30514845770` falhou porque o site público respondeu `503` uma única vez para `norma-data.json` durante a auditoria externa. Os outros 134 recursos, a privacidade e os pilares passaram.

A mesma cabeça foi repetida sem alteração de código. Na segunda tentativa:

- `norma-data.json` respondeu normalmente;
- auditorias locais e públicas passaram;
- o job `90783734720` concluiu com sucesso.

Classificação: indisponibilidade transitória externa, sem relação com a branch experimental ou com a paginação.

### Evidência visual versionada

A banca guarda capturas do mesmo documento longo:

- `test-results/obs01-pagination-desktop.png`;
- `test-results/obs01-scroll-tablet.png`;
- `test-results/obs01-scroll-mobile.png`.

Elas mostram a composição após rolagem interna e a transição entre folhas usando o mesmo corpus automatizado.

## Iterações de estabilização

### Primeira implementação

A arquitetura funcional passou os oito testes novos, mas tornou o `background-color` computado de `.paper` transparente. Isso quebrou quatro gates Blueprint em modo papel e noite.

Correção:

- o token de fundo computado foi restaurado;
- os intervalos entre folhas passaram a ser recortados em uma camada visual separada;
- os gates de identidade e contraste voltaram ao verde.

### Timeouts migratórios no Firefox

Em duas execuções intermediárias, timeouts apareceram em superfícies antigas diferentes:

- persistência antes de exportar Markdown;
- persistência antes de exportar TXT;
- leitura de Voz numa jornada de rede;
- seleção lexical logo após `editor.fill()`.

As falhas migraram e desapareceram ao repetir a mesma cabeça, exceto a última, que revelou uma corrida no teste: a prova aguardava o DOM do contenteditable, não o contrato estrutural ProseMirror.

O teste foi corrigido para aguardar o estado real do editor antes de selecionar. Nenhuma tolerância temporal global foi aumentada e nenhuma assertion foi removida.

## O — O que permanece aberto

### Limitações reais da v1

- as quebras são feitas entre blocos de primeiro nível;
- um parágrafo individual maior que a área útil ainda pode atravessar a fronteira visual da folha;
- não há algoritmo tipográfico de viúvas e órfãs;
- tabelas, notas de rodapé, seções e cabeçalhos por página não existem;
- a paginação não determina ainda a impressão ou o PDF;
- exportações TXT, Markdown e HTML continuam representando o documento integral, não páginas;
- não existe promessa de fidelidade integral ao Microsoft Word;
- o tamanho A4 é referência visual responsiva, não medição física certificada;
- dispositivos físicos, leitores de tela e uso prolongado humano continuam pendentes.

### Veredito permitido

> O Mass Notes Next possui uma primeira paginação visual segura em fronteiras de blocos, mantém um único Tiptap, isola a rolagem do manuscrito e acompanha o cursor sem deslocar a janela global.

### Alegações proibidas

- “paginação idêntica ao Word”;
- “layout de impressão perfeito”;
- “qualquer bloco é dividido tipograficamente entre páginas”;
- “acessibilidade física totalmente aprovada”;
- “substituição integral do Escrevaral legado autorizada”.

## Roteiro curto para testar na preview

1. abrir a preview Mass Notes Next;
2. criar uma página e colar texto com muitos parágrafos;
3. escrever até atravessar mais de uma folha;
4. observar que somente o centro rola e as laterais permanecem estáveis;
5. pressionar `Ctrl + End`, escrever uma palavra, desfazer e refazer;
6. confirmar que o cursor permanece visível e a janela do navegador não se desloca.

## Fronteira de release

Esta observação melhora a candidata experimental, mas não altera os gates globais:

- PR continua em rascunho;
- `main` permanece intacta;
- produto público permanece intacto;
- Gate 14 permanece suspenso;
- lançamento público continua `NO-SHIP`;
- substituição integral continua `NO-SHIP`.
