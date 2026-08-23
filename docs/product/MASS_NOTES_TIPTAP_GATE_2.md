# Gate 2 — confiabilidade do editor Tiptap

## Situação

**Aprovado para avaliação manual e continuidade experimental em 2026-07-27.**

- branch de desenvolvimento: `experiment/mass-notes-tiptap`;
- pull request: `#155` (rascunho);
- commit funcional validado: `fa6f94a31b79608636c2bc221993d6c821e7019b`;
- workflow: `Mass Notes Tiptap`, execução `30313339327`;
- preview estática: branch `preview-mass-notes-tiptap`;
- aplicação pública, `main` e service worker: não alterados.

Esta aprovação não autoriza merge, lançamento, substituição do `index.html` público ou inclusão no cache offline.

## Matriz aprovada

Foram executados 10 cenários em Chromium e Firefox, totalizando 20 execuções de navegador:

1. shell editorial e Tiptap carregados;
2. Enter depois de Título 1 e Undo estrutural;
3. conflito entre duas abas sem sobrescrita silenciosa;
4. engine real de Revisão por adaptador;
5. layout móvel sem overflow;
6. paste representativo de Word e Google Docs;
7. seleção, negrito e listas estruturadas;
8. recuperação antes do autosave;
9. preservação da versão local como página de conflito;
10. drawers móveis com foco contido, Escape e devolução do foco.

## Evidências técnicas

- dependências instaladas em ambiente limpo;
- TypeScript e Vite compilados sem erro;
- Chromium aprovado;
- Firefox aprovado;
- conteúdo colado convertido para o schema do Tiptap;
- scripts, imagens não suportadas, atributos perigosos, estilos e URLs `javascript:` descartados no cenário de paste;
- título e corpo recuperados após fechamento antes do autosave;
- duas versões preservadas no fluxo completo de conflito;
- overlay móvel corrigido para permanecer acima do texto e abaixo dos drawers;
- foco inicial, contenção de Tab, Escape e retorno ao acionador aprovados.

## Preview isolada

O build aprovado é publicado somente depois do gate verde em uma branch estática dedicada. O workflow força a atualização de `preview-mass-notes-tiptap`; ele não escreve na `main` e não usa o GitHub Pages do produto atual.

## Limites da aprovação

O teste de paste usa HTML representativo dos padrões gerados por Word e Google Docs. A próxima rodada manual ainda deve incluir colagem feita diretamente pelos aplicativos reais no sistema do mantenedor.

Ainda não estão aprovados:

- service worker e abertura offline em nova sessão;
- Tauri e SQLite;
- paginação física;
- DOCX;
- leitor de tela real;
- teclado virtual real em Android/iOS;
- integração das demais engines.

## Próxima decisão

1. mantenedor usa a preview em Chromium e Firefox;
2. registra atritos de escrita, navegação e linguagem da interface;
3. P0/P1 interrompem o avanço;
4. sem bloqueadores, integrar o Espelho de Voz por adaptador e painel, sem decorations inline neste primeiro corte.
