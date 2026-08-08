# OBS-01 — Fechamento da primeira tranche de paginação e rolagem

Data: 2026-07-30

Método: **CLARO**

Status: **corrigida dentro do escopo v1, com limitações declaradas**

PR: `#155`, aberto e em rascunho  
Branch: `experiment/mass-notes-tiptap`  
Preview: `preview-mass-notes-tiptap`

Este documento complementa:

- `2026-07-30-observacao-01-paginacao-rolagem.md` — deliberação e prompts;
- `2026-07-30-observacao-01-paginacao-estabilizada.md` — diagnóstico, baseline e primeiras iterações.

## Resumo para apresentação

**Problema em uma frase:** o manuscrito longo aumentava a altura global da aplicação em tablet e celular, deslocava as laterais e não possuía uma representação paginada.

**Melhoria em uma frase:** a janela permanece fixa, somente `.editor-viewport` rola o manuscrito e uma única instância Tiptap/ProseMirror apresenta folhas A4 visuais.

**Resultado em uma frase:** a candidata passou 162 cenários por navegador, 324 execuções no total, incluindo quinze cenários dedicados à paginação, às exportações e ao uso integral das engines.

## C — Cenário observado

A observação nasceu durante escrita longa na preview:

- a scrollbar percebida era a da janela;
- o crescimento do texto aumentava a composição inteira;
- biblioteca e ferramentas eram arrastadas junto com o manuscrito;
- o papel central era uma superfície contínua;
- o cursor dependia da rolagem global para permanecer visível.

A baseline automatizada confirmou a causa:

- em `1024 × 768`, a shell chegou a aproximadamente `6.592 px`;
- em `390 × 640`, chegou a aproximadamente `15.850 px`;
- o viewport central permanecia com `scrollTop = 0`;
- não existiam contagem nem transições de página;
- a publicação foi bloqueada enquanto as provas estavam vermelhas.

## L — Limite e impacto

- severidade: **P1 de usabilidade para escrita longa**;
- perda de dados: não observada;
- mutação autoral: não observada;
- bloqueio: parcial, com degradação de orientação espacial e acesso aos controles;
- acessibilidade: impacto em foco, teclado e previsibilidade de rolagem;
- navegadores reproduzidos: Chromium e Firefox;
- superfícies: shell, biblioteca, manuscrito, toolbar, ferramentas e navegação das engines.

O escopo não autoriza alegar paridade integral com Microsoft Word.

## A — Arquitetura escolhida

### Janela e regiões de rolagem

O contrato final é:

```text
Janela — sem rolagem no uso normal
└── Aplicação — 100dvh
    ├── Biblioteca — rolagem própria
    ├── Manuscrito — .editor-viewport
    │   └── um único Tiptap/ProseMirror paginado visualmente
    └── Ferramentas — rolagem própria
```

Foram estabilizados:

- `html`, `body` e `#root` sem rolagem global no uso normal;
- shell limitada à altura útil da janela;
- `.editor-viewport` como proprietária explícita da rolagem do manuscrito;
- `overflow-y: auto`, `overflow-x: hidden`, `overscroll-behavior` e `scrollbar-gutter` no viewport;
- papel centralizado;
- toolbar `sticky` preservada dentro da área central;
- laterais independentes da roda aplicada ao manuscrito;
- ausência de overflow horizontal nos viewports aprovados.

### Modelo de página

Foi criado um modelo tipado de página com:

- formato inicial `A4`;
- largura e altura;
- margens;
- área útil;
- intervalo entre folhas;
- atributos observáveis de formato, dimensões e contagem.

### Um único documento autoral

A paginação usa uma única instância Tiptap/ProseMirror.

As transições de folha são Decorations/widgets de apresentação e medição:

- não entram no JSON autoral;
- não criam um editor por página;
- não alteram seleção, histórico ou conteúdo exportado;
- são excluídas do histórico autoral;
- são recalculadas quando documento ou largura mudam.

### Acompanhamento do cursor

O autoacompanhamento atua somente em `.editor-viewport` para:

- digitação;
- `Enter`;
- colagem longa;
- setas;
- `Page Up` e `Page Down`;
- navegação iniciada pela Revisão.

A janela permanece em `scrollY = 0`, foco e seleção são preservados e `prefers-reduced-motion` é respeitado.

### Exportação pelo estado vivo

A banca final encontrou uma corrida real no Firefox: o contrato Tiptap já continha o manuscrito integral, mas a projeção React usada pelo exportador ainda podia conter somente título e metadados.

Correção:

- `ExportPanel` consulta `readLiveEditorSnapshot(document.id)` no instante do clique;
- TXT, Markdown e HTML recebem o JSON e o texto vivos do Tiptap;
- o objeto de documento mantém título, status, tags e demais metadados;
- o callback anterior permanece como fallback quando ainda não existe snapshot;
- a persistência e o JSON autoral não foram modificados.

A exportação agora segue a mesma regra permanente das engines: ações iniciadas pela interface leem o snapshot vivo, não uma projeção possivelmente atrasada.

## Alternativas rejeitadas

### Um editor por página

Rejeitado porque fragmentaria ou complicaria:

- `Ctrl + A`;
- seleção entre páginas;
- desfazer e refazer;
- colagem longa;
- listas e citações atravessando folhas;
- marcações da Revisão;
- leitura integral pelas engines;
- persistência e exportação.

### Altura fixa com conteúdo oculto

Rejeitada porque apenas cortaria o texto.

### Fundo repetido sem medição

Rejeitado como paginação funcional porque não garantiria coerência entre blocos, cursor e folhas percebidas.

## R — Resultado reproduzível

### Banca dedicada

`tests/m1-pagination-scroll.spec.ts` contém quinze cenários por navegador:

1. documento com pelo menos cinco folhas A4 e um único ProseMirror;
2. janela travada e sem overflow nos quatro viewports;
3. overflow vertical real em `.editor-viewport`;
4. roda move somente o manuscrito;
5. biblioteca, manuscrito e ferramentas possuem proprietários independentes;
6. cursor permanece visível na quinta página;
7. colagem longa acompanha o cursor;
8. `Ctrl + A` seleciona o manuscrito integral;
9. desfazer e refazer atravessam páginas;
10. listas e citações permanecem estruturadas;
11. drawers móveis continuam acessíveis e sem overflow horizontal;
12. as cinco engines continuam lendo o documento integral;
13. TXT, Markdown e HTML exportam o documento integral;
14. navegação da Revisão move somente o viewport central;
15. `Enter`, setas, `Page Up`, `Page Down` e reduced motion preservam cursor e toolbar.

Viewports obrigatórios cobertos:

- `1440 × 560`;
- `1366 × 768`;
- `1024 × 768`;
- `390 × 640`.

### Cabeça funcional aprovada

`e281b6cbee6d458b1f01bf6adcf35998ee016950`

### Evidência Mass Notes

- workflow `30540820269`;
- job `90864912442`;
- auditoria lexical aprovada;
- TypeScript e build aprovados;
- **324/324** execuções aprovadas;
- publicação da preview aprovada;
- renovação de cache aprovada;
- smoke público aprovado;
- artefato `mass-notes-tiptap-30540820269`;
- artifact ID `8758802725`;
- digest `sha256:bfcee5b5acce95dee3fda5dac3c61800263cd3fbedc6515d3adf73af376be486`.

### Evidência paralela

- Argila `30540820231`: aprovada;
- coerência `30540820211`: aprovada.

### Arquivos centrais

- `src/editor/pageModel.ts`;
- `src/editor/paginationExtension.ts`;
- `src/editor/MassNotesEditor.tsx`;
- `src/editor/editorSnapshotBridge.ts`;
- `src/styles/pagination.css`;
- `src/components/ExportPanel.tsx`;
- `tests/m1-pagination-scroll.spec.ts`.

## Antes × depois

| Antes | Depois |
| --- | --- |
| janela participava da rolagem | `window.scrollY` permanece em zero |
| shell crescia com o manuscrito | aplicação ocupa a altura útil da janela |
| papel contínuo | folhas A4 visuais separadas |
| rolagem sem proprietário claro | `.editor-viewport` é o scroller explícito |
| cursor dependia da janela | viewport acompanha a seleção |
| exportação podia usar projeção atrasada | exportação lê o snapshot vivo do Tiptap |
| cobertura inicial de quatro cenários | quinze cenários por navegador |

## O — O que permanece aberto

Limitações reais da v1:

- quebras somente entre blocos de primeiro nível;
- um parágrafo individual maior que a área útil pode atravessar visualmente uma folha;
- não há algoritmo de viúvas e órfãs;
- tabelas, notas de rodapé, seções e cabeçalhos por página não existem;
- a paginação ainda não determina impressão ou PDF;
- TXT, Markdown e HTML representam o documento integral, não páginas físicas;
- A4 é referência visual responsiva, não medição física certificada;
- dispositivos físicos, leitor de tela e outras tecnologias assistivas não foram aprovados nesta tranche;
- não existe promessa de fidelidade integral ao Word.

Próxima evolução recomendada:

1. teste humano guiado da preview com o roteiro CLARO;
2. avaliação de parágrafos maiores que uma folha;
3. decisão sobre impressão/PDF e regras tipográficas;
4. somente depois, uma segunda tranche de paginação.

## Roteiro curto para testar na preview

1. abrir a preview em `1366 × 768` ou viewport próximo;
2. criar ou colar um documento longo, com pelo menos cinco páginas;
3. escrever no final e usar `Page Up`, `Page Down`, desfazer e refazer;
4. confirmar que somente o manuscrito rola e que as laterais permanecem estáveis;
5. exportar TXT, Markdown e HTML e verificar início, meio e fim do texto.

## Fronteira de release

Este fechamento não altera os vereditos gerais:

- PR permanece aberto e em rascunho;
- `main` permanece intacta;
- aplicação pública e service worker público permanecem intactos;
- Gate 14 permanece suspenso;
- nenhum merge, lançamento público ou substituição integral foi autorizado.
