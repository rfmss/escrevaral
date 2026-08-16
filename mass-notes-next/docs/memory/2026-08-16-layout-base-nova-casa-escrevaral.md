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

### 5 — Tags

O `+` de **Tags** no painel de análise deixou de ser cenográfico. `WritingTagsBridge` abre o editor de metadados que já existia em `DocumentMetadataEditor`, sem criar outro armazenamento ou parser.

O circuito reutiliza:

- `draft.tags` como estado documental real;
- `parseLibraryTags` para trim, deduplicação e limites;
- máximo de 8 tags e 32 caracteres por tag;
- `onTags`/`mutateDraft(..., 'metadata')` existentes;
- o mesmo autosave e o mesmo controle de conflito do documento.

No desktop, a casca mostra somente o recorte necessário do `RightRail`/`panel-pulso`, foca `Marcadores da página` e mantém o fechamento real. Ao salvar, as tags canônicas do painel de análise atualizam imediatamente e persistem após reload.

**Notas continua deferido** porque ainda não há domínio dedicado de notas comprovado no código atual.

## Evidência do gate

- foco automático: **12/12**;
- Documento/busca/Metas — run `31977140397`: **14/14**;
- Exportar — run `31977786808`: **15/15**;
- Configurações — run `31978656658`: **16/16**;
- Pesquisa — run `31979455640`, head `a7ce7c08b1ac6391400c7331c9f53491c7758013`: **17/17**;
- Tags — run `31979828644`, head `b768f3e2f4158a7073b2bd153618d19283650cac`: **18/18**, build, publicação e smoke público verdes.

A banca de Tags prova abertura do editor real, foco do campo, salvamento, atualização do painel canônico e persistência após recarregar. Também permanecem verdes geometria canônica, Tiptap, colagem estruturada, recuperação, conflitos, drawers móveis, Pesquisa e foco automático.

## Dívidas registradas, não concorrentes

- poda de branches: deferida;
- Cofre: frente separada;
- tipografia remota da referência: precisa ser localizada/empacotada para fechar definitivamente a promessa offline.

## Foco atual e próximo gate

A única frente ativa é **o Escrevaral atual na nova casa aprovada**. Continuar conectando um comportamento visível por vez, somente quando houver destino real. Nenhum controle deve ganhar funcionalidade inventada apenas para preencher a interface.
