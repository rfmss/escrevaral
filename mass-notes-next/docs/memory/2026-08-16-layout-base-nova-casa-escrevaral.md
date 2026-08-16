# Decisão — layout-base como nova casa do Escrevaral

- Registrada em: 2026-08-16
- Branch: `feat/escrevaral-paper-home`
- Base: `experiment/mass-notes-tiptap`
- Estado: **decisão da pessoa mantenedora + casa implementada e validada**

## Decisão

O layout de papel técnico enviado em 16/08/2026 passa a ser a casa visual de referência do Escrevaral.

A decisão não cria uma segunda aplicação. A nova casa envolve a fundação já existente em React/Tiptap e preserva:

- documento estruturado;
- IndexedDB como fonte persistente;
- autosave e recuperação emergencial;
- detecção de conflito entre abas;
- snapshot vivo para engines;
- adapters e engines atuais;
- português brasileiro como locale de produto.

O Cofre continua uma camada separada e portátil. Nenhuma regra linguística deve migrar para CSS, HTML ou componentes de interface.

## Tranche 1

A primeira implementação é deliberadamente pequena e reversível:

1. transplantar a linguagem visual do layout aprovado para a aplicação Tiptap real;
2. manter o editor e o documento existentes como fonte de comportamento;
3. manter os breakpoints móveis atuais até haver uma rodada visual própria para tablet/celular;
4. não carregar fontes remotas: a aparência usa fallbacks locais para preservar funcionamento offline;
5. não implementar ainda Metas, Notas, Pesquisa ou Configurações novas só porque aparecem no mockup.

A composição é dividida entre `theme-escrevaral-paper-home.css`, `theme-escrevaral-paper-home-editor.css` e `theme-escrevaral-paper-home-tools.css`, todas carregadas por último. A divisão mantém cada módulo abaixo dos guardrails de tamanho da doutrina e não altera contratos de domínio nem persistência.

## Contrato de escrita — foco automático

A inspeção humana do arquivo de referência revelou que o modo foco total não era apenas um estado visual/manual: ele era parte do comportamento canônico da escrita.

O contrato restaurado é:

- operações reais de escrita no editor (`insert*`, `delete*` e `history*`) entram automaticamente em modo foco;
- ao entrar, `topbar`, rails laterais, toolbar e statusbar deixam a superfície de escrita dominar a tela;
- o parágrafo que contém a seleção/cursor permanece em primeiro plano e os demais são rebaixados visualmente;
- `Escape` sai do modo foco e restaura a casa;
- o controle manual de Foco permanece válido;
- apenas abrir/clicar no documento não deve acionar o modo foco.

No protótipo HTML original a linha ativa era marcada adicionando diretamente `.focus-line` ao `<p>`. No editor real isso não é estável porque ProseMirror é dono dos nós do documento e pode reconstruí-los. Por isso, o mesmo resultado visual é implementado por uma Decoration nativa do ProseMirror, sem gravar classe ou metadado no conteúdo do manuscrito.

A responsabilidade fica separada:

- a **casca** detecta que a pessoa começou a escrever e controla a entrada/saída do modo foco;
- o **Tiptap/ProseMirror** conhece a seleção real e projeta a decoração transitória do parágrafo ativo;
- o **documento** permanece limpo, sem estado visual persistido no texto.

## Circuito funcional 1 — Documento, busca e Metas

A inspeção do código real mostrou que o primeiro circuito já estava parcialmente conectado antes desta rodada:

- o título visível edita o `draft` real;
- os documentos do rail esquerdo vêm do repositório real;
- selecionar outro documento preserva o draft atual antes da troca;
- a busca canônica filtra os documentos reais por título e texto;
- `Ctrl/Cmd + K` leva o foco à busca da casa;
- a toolbar da referência já opera sobre o Tiptap real.

Em 16/08/2026 o botão **Metas**, que ainda era cenográfico, recebeu destino real sem criar novo subsistema:

- a meta diária usa uma única preferência local compartilhada pela sessão de escrita;
- o valor padrão da nova casa é `1.200` palavras;
- clicar em **Metas** abre um painel de papel acessível para alterar a meta;
- a alteração atualiza imediatamente número, barra e porcentagem de `META DIÁRIA` no rodapé;
- a preferência persiste somente no navegador e reaparece após recarregar;
- o painel pode ser fechado por controle explícito, overlay ou `Escape`;
- nenhuma informação de meta entra no manuscrito ou no IndexedDB documental.

O contrato compartilhado fica em `src/writing/writingGoal.ts`; a superfície da casa é conectada por `WritingGoalsBridge`, preservando a separação entre preferência de interface e documento autoral.

## Circuito funcional 2 — Exportar

O botão **Exportar** do topo deixou de disparar HTML diretamente e passou a abrir uma escolha explícita da casa.

A implementação reutiliza o exportador já existente em `src/export/documentExport.ts`, sem criar segundo pipeline. O painel oferece:

- **TXT** (`.txt`) para leitura simples e portátil;
- **Markdown** (`.md`) preservando estrutura textual compatível com outros editores;
- **HTML** (`.html`) como documento autônomo para abrir ou imprimir.

O bridge de exportação:

- intercepta o controle canônico `Exportar` antes do comportamento legado de HTML direto;
- lê o snapshot vivo do Tiptap para não perder alterações ainda não persistidas no corpo do texto;
- combina esse snapshot com o documento real e com o título visível atual;
- chama `downloadDocumentExport` do pipeline já existente;
- mantém a geração inteiramente local;
- não altera o manuscrito, não cria cópia de documento e não exige rede.

A superfície fica em `WritingExportBridge` e `theme-escrevaral-paper-home-export.css`. O exportador de domínio continua sendo a única fonte de geração de arquivos.

## Evidência do gate

Em 16/08/2026 a banca da nova casa fechou verde primeiro com 12/12 testes no gate do foco automático.

Após o primeiro circuito funcional, o workflow `Escrevaral Paper Home Preview`, run `31977140397`, no head `42a8e2916b8e98381067a49c70ef502e815e1c4d`, fechou **14/14 testes verdes**.

Após o circuito de Exportar, o workflow `Escrevaral Paper Home Preview`, run `31977786808`, no head `2722caf4aa48796d79e242bdf9e8cbd4f9d0db22`, fechou **15/15 testes verdes**.

A banca passou a provar explicitamente:

- `Metas abre a preferência real e sincroniza o rodapé`;
- `Ctrl+K leva à busca real e a busca continua filtrando documentos reais`;
- `Exportar abre escolhas reais e gera TXT, Markdown e HTML a partir do texto vivo`;
- o clique inicial em Exportar não gera download acidental;
- os três formatos usam filename correto e contêm o texto vivo recém-editado.

Também permaneceram verdes os contratos de geometria da referência, toolbar Tiptap, colagem estruturada, recuperação, conflito entre abas, drawers móveis, foco automático, build TypeScript/Vite, publicação da preview e smoke público.

## Higiene de branches — registrada e deferida

Há branches históricas a eliminar, e a regra de segurança já foi estabelecida: nenhuma branch deve ser apagada sem verificar se seus commits relevantes estão preservados.

Em 16/08/2026 a pessoa mantenedora decidiu **não abrir essa frente agora**. A poda fica registrada como dívida de higiene de repositório e será retomada em uma rodada própria.

Até lá:

- não iniciar auditoria adicional de branches durante o trabalho da nova casa;
- não apagar branches como efeito colateral de outra tarefa;
- manter `main`, a branch ativa da nova casa e demais frentes deliberadamente abertas intactas;
- usar `docs/memory` e o histórico Git como memória, sem transformar a limpeza do repositório em prioridade concorrente.

## Foco atual

A única frente ativa desta sessão é **o Escrevaral atual na nova casa aprovada**.

O objetivo imediato é continuar consolidando essa experiência real, preservando a fidelidade visual e os contratos já provados. Não abrir Cofre, poda de branches, redesign paralelo ou outra frente enquanto não houver nova decisão explícita.

## Próximo gate

Continuar a nova casa a partir do estado validado, conectando ou refinando **um comportamento visível por vez** e somente quando houver destino real no produto.

Antes de implementar o próximo controle, verificar primeiro se seu destino já existe no código e reutilizá-lo. Nenhum botão cenográfico deve ser promovido a funcionalidade inventada apenas para preencher a interface.
