# Log — Gate 6: contrato de posições

Data: 2026-07-28
Estado: em andamento
Branch: `experiment/mass-notes-tiptap`
PR: `#155` (rascunho)

## Escopo confirmado

Criar infraestrutura de mapeamento entre texto derivado e posições ProseMirror sem exibir decorations, aplicar sugestões ou alterar o manuscrito.

Não alterar:

- engines originais;
- bases linguísticas;
- schema Tiptap;
- aplicação pública;
- `main`;
- service worker;
- comportamento visual do editor.

## Decisões iniciais

1. O snapshot nasce do `editor.state.doc`, não de HTML reparseado.
2. Offsets textuais são unidades UTF-16, como `String#indexOf`, regex JavaScript e posições em nós textuais do ProseMirror.
3. Texto derivado usa dois `\n` entre blocos textuais e um `\n` para `hardBreak`.
4. Separadores derivados são segmentos virtuais: afinidade `backward` aponta para o fim do bloco anterior; `forward`, para o início do próximo.
5. Blocos vazios mantêm uma âncora de posição e continuam distinguíveis.
6. A assinatura de conteúdo é calculada sobre JSON estrutural estável, não sobre `revision` nem apenas sobre texto.
7. O contrato oferece conversão de pontos e ranges nos dois sentidos.
8. Ranges exclusivamente virtuais devem colapsar com segurança.
9. Consultas são puras e não disparam transações no editor.
10. Nenhuma marcação visual será criada neste gate.

## Riscos

- posições em estruturas aninhadas de listas incluem wrappers sem equivalente textual;
- offsets dentro dos dois caracteres do separador de bloco não possuem posição textual literal;
- emoji ocupa duas unidades UTF-16 apesar de um único grafema visual;
- blocos vazios podem criar separadores consecutivos;
- posições antes do primeiro bloco ou depois do último precisam de clamp;
- uma assinatura baseada apenas em texto não detectaria parágrafo transformado em título;
- um mapeamento aparentemente correto em Chromium pode divergir em seleção/DOM no Firefox.

## Plano técnico

1. criar `src/editor/textPositionContract.ts`;
2. modelar snapshot, blocos, segmentos, afinidade e ranges;
3. construir snapshot a partir do Node ProseMirror real;
4. anexar uma API somente-leitura à instância DOM do editor para QA e futura integração;
5. publicar callback opcional para a shell;
6. adicionar testes de vazio, UTF-16, emoji, separadores, `hardBreak`, listas, blocos vazios, assinatura estrutural, troca de documento, clamp e pureza;
7. executar matriz completa em Chromium e Firefox;
8. bloquear preview enquanto houver falha;
9. fechar documentação e memória após gate verde.

## Critério de aprovação

- mapeamento monotônico e reversível nos casos representativos;
- assinatura estrutural muda com estrutura e permanece independente de autosave;
- documento e conteúdo identificados explicitamente;
- separadores e blocos vazios tratados sem inventar texto editável;
- acentos e emoji preservados;
- nenhuma alteração de HTML, seleção, histórico ou manuscrito;
- nenhum elemento de decoration;
- gates anteriores verdes;
- Chromium e Firefox verdes;
- preview publicada somente após gate verde.

## Registro de execução

A preencher.

## Decisão final

Pendente.
