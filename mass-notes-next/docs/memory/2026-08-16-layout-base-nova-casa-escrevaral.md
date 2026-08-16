# Decisão — layout-base como nova casa do Escrevaral

- Registrada em: 2026-08-16
- Branch: `feat/escrevaral-paper-home`
- Base: `experiment/mass-notes-tiptap`
- Estado: **decisão da pessoa mantenedora + primeira tranche implementada**

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

## Próximo gate

Depois de validar visualmente esta tranche em desktop, a próxima mudança deve conectar os controles públicos do layout, um grupo por vez, aos módulos existentes. Nenhum botão cenográfico deve ser promovido a funcionalidade sem um destino real.
