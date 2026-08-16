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

## Higiene de branches

Com a casa nova estabilizada, o repositório deve começar a reduzir branches históricas.

Regra de poda:

1. **não apagar** `main`, a branch ativa da nova casa, a branch ativa do Cofre ou qualquer branch que ainda seja base/head de trabalho deliberadamente aberto;
2. branches de preview podem ser removidas quando sua PR correspondente estiver integrada e a preview não for mais necessária;
3. branches `agent/*`, `codex/*`, `staging/*`, `restore*`, `backup*`, experimentos e features antigas devem ser eliminadas apenas depois de verificar se seus commits relevantes já estão absorvidos ou preservados por tag/commit alcançável;
4. nenhuma branch histórica deve ser mantida apenas como “memória”: decisões e estado canônico pertencem a `docs/memory`, ao mapa mestre e ao histórico Git;
5. a poda deve ocorrer em lotes pequenos, com lista explícita de manter/apagar/revisar antes de cada lote destrutivo.

## Próximo gate

1. terminar a inspeção humana da nova casa;
2. integrar a branch da casa quando aprovada;
3. auditar e podar o primeiro lote de branches antigas com segurança;
4. depois continuar os controles públicos do layout, um grupo por vez, conectando-os apenas a destinos reais.

Nenhum botão cenográfico deve ser promovido a funcionalidade sem um destino real.
