# Decisão — layout-base como nova casa do Escrevaral

- Registrada em: 2026-08-16
- Branch: `feat/escrevaral-paper-home`
- Base: `experiment/mass-notes-tiptap`
- Estado: **casa implementada e validada**

## Decisão

O layout de papel técnico aprovado é a casa visual canônica do Escrevaral. Ele envolve a fundação React/Tiptap existente e preserva documento estruturado, IndexedDB, autosave, recuperação, conflitos entre abas, snapshots/engines/adapters e português brasileiro como locale de produto. O Cofre continua separado e portátil.

## Foco automático

Operações reais de escrita (`insert*`, `delete*`, `history*`) entram automaticamente em foco; topbar, rails, toolbar e statusbar saem da superfície; o parágrafo do cursor fica em primeiro plano por Decoration do ProseMirror; `Escape` devolve a casa. Nenhum estado visual é persistido no manuscrito.

## Circuitos funcionais ligados

### 1 — Documento, busca e Metas
Título, documentos, troca de documento e busca usam o estado real. `Ctrl/Cmd + K` foca a busca canônica. A toolbar opera sobre o Tiptap real. **Metas** usa preferência local compartilhada, padrão `1.200` palavras, atualiza o rodapé e não contamina o documento.

### 2 — Exportar
**Exportar** abre escolha explícita e reutiliza `src/export/documentExport.ts` para TXT, Markdown e HTML. Usa o snapshot vivo do Tiptap e o título atual; geração local, sem segundo pipeline.

### 3 — Configurações
**Config.** abre painel real sem trocar tema por acidente. Expõe Papel/Noite, Concentração, Tela cheia, Anatomia do Livro e `Português (BR)`, reaproveitando estados/controles existentes.

### 4 — Pesquisa
**Pesquisa** reutiliza o destino real já presente no `App`: `setRailOpen(true)` + `runReview()`. A revisão usa o contrato estrutural vivo do Tiptap, `reviewTextDetailed`, mapeamento para posições ProseMirror, marcas e navegação.

`WritingResearchBridge` resolve apenas a casca desktop: expõe o `RightRail` real, entra diretamente em `revisao`, preserva observações/trechos/`Ir ao trecho` e restaura o fechamento. Não cria engine nem fonte de dados nova.

**Notas continua deferido** porque ainda não há domínio dedicado de notas comprovado no código atual.

## Evidência do gate

- foco automático: **12/12**;
- Documento/busca/Metas — run `31977140397`: **14/14**;
- Exportar — run `31977786808`: **15/15**;
- Configurações — run `31978656658`: **16/16**;
- Pesquisa — run `31979455640`, head `a7ce7c08b1ac6391400c7331c9f53491c7758013`: **17/17**, build, publicação e smoke público verdes.

A primeira tentativa de Pesquisa (`31979310542`) falhou somente porque o botão legado de fechamento estava oculto no desktop; abertura, aba Revisão e execução real da engine já estavam corretas. O fechamento foi corrigido antes do gate final.

Também permanecem verdes geometria canônica, Tiptap, colagem estruturada, recuperação, conflitos, drawers móveis e foco automático.

## Dívidas registradas, não concorrentes

- poda de branches: deferida;
- Cofre: frente separada;
- tipografia remota da referência: precisa ser localizada/empacotada para fechar definitivamente a promessa offline.

## Foco atual e próximo gate

A única frente ativa é **o Escrevaral atual na nova casa aprovada**. Continuar conectando um comportamento visível por vez, somente quando houver destino real.

Próximo candidato limpo identificado: o `+` de **Tags** no painel de análise, porque `draft.tags`, parsing, autosave e conflito já existem.
