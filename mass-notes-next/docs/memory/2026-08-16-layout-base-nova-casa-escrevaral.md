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

## Evidência do gate

Em 16/08/2026 a banca da nova casa fechou verde com 12/12 testes do gate, incluindo explicitamente `digitação entra no foco total e Escape devolve a casa`.

Também permaneceram verdes os contratos de geometria da referência, toolbar Tiptap, colagem estruturada, recuperação, conflito entre abas, drawers móveis, build TypeScript/Vite, publicação da preview e smoke público.

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

Continuar a nova casa a partir do estado validado, conectando ou refinando um comportamento por vez e somente quando houver destino real no produto.

Nenhum botão cenográfico deve ser promovido a funcionalidade sem um destino real.
