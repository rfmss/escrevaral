# Decisão — layout-base como nova casa do Escrevaral

- Registrada em: 2026-08-16
- Branch: `feat/escrevaral-paper-home`
- Base: `experiment/mass-notes-tiptap`
- Estado: **decisão da pessoa mantenedora + casa implementada e validada**

## Decisão

O layout de papel técnico enviado em 16/08/2026 é a casa visual de referência do Escrevaral. Não cria uma segunda aplicação: envolve a fundação React/Tiptap existente e preserva documento estruturado, IndexedDB, autosave, recuperação, conflitos entre abas, snapshots/engines/adapters e português brasileiro como locale de produto.

O Cofre continua separado e portátil. Nenhuma regra linguística migra para CSS, HTML ou componentes de interface.

## Casa e foco automático

A casa canônica usa o layout aprovado como shell real. Operações de escrita (`insert*`, `delete*`, `history*`) entram automaticamente em foco; topbar, rails, toolbar e statusbar saem da superfície; o parágrafo do cursor fica em primeiro plano; `Escape` devolve a casa. A linha ativa é uma Decoration nativa do ProseMirror, sem estado visual persistido no manuscrito.

A fidelidade inicial ainda carrega a importação tipográfica remota da referência. O fechamento definitivo da promessa offline exige empacotar/localizar essas fontes ou aprovar equivalentes locais; essa dívida é separada da conexão funcional dos controles.

## Circuito funcional 1 — Documento, busca e Metas

- título visível edita o `draft` real;
- rail esquerdo usa documentos reais;
- troca de documento preserva o draft;
- busca filtra documentos reais;
- `Ctrl/Cmd + K` foca a busca canônica;
- toolbar opera sobre Tiptap real;
- **Metas** usa preferência local compartilhada, padrão `1.200` palavras, atualiza o rodapé e não contamina o documento.

## Circuito funcional 2 — Exportar

**Exportar** abre escolha explícita e reutiliza `src/export/documentExport.ts` para TXT, Markdown e HTML. O bridge lê snapshot vivo do Tiptap + título atual e mantém geração local, sem segundo pipeline.

## Circuito funcional 3 — Configurações

**Config.** abre painel real sem trocar tema por acidente. Expõe Papel/Noite, Concentração, Tela cheia, Anatomia do Livro e o locale fixo `Português (BR)`, reaproveitando estados/controles existentes.

## Circuito funcional 4 — Pesquisa

**Pesquisa** já possuía destino real no `App`: abrir o rail e executar `runReview()`. A revisão usa o contrato estrutural vivo do Tiptap, `reviewTextDetailed`, mapeamento para posições ProseMirror, marcas e navegação sem alterar o manuscrito.

O problema era apenas de casca: no desktop, o `RightRail` real ficava dentro de `.reference-mobile-legacy` e permanecia oculto. `WritingResearchBridge` corrige somente essa integração:

- preserva o handler React existente e a engine real;
- não cria nova engine, issue ou fonte de dados;
- expõe o `RightRail` real como painel da casa canônica;
- entra diretamente na aba existente `revisao`;
- mantém observações gerais, trechos localizados, marcas e `Ir ao trecho`;
- expõe novamente o controle real de fechamento no desktop;
- remove o estado visual transitório ao fechar.

A superfície fica em `theme-escrevaral-paper-home-research.css`. **Notas continua deferido**: a inspeção atual não encontrou um domínio dedicado de notas que justifique inventar comportamento.

## Evidência do gate

Progressão validada:

- foco automático: **12/12**;
- Documento/busca/Metas — run `31977140397`, head `42a8e2916b8e98381067a49c70ef502e815e1c4d`: **14/14**;
- Exportar — run `31977786808`, head `2722caf4aa48796d79e242bdf9e8cbd4f9d0db22`: **15/15**;
- Configurações — run `31978656658`, head `15603540df32ea4ffe48c4c6e301f1cdd39fee1e`: **16/16**;
- Pesquisa — run `31979455640`, head `a7ce7c08b1ac6391400c7331c9f53491c7758013`: **17/17**, com build, publicação e smoke público verdes.

A primeira tentativa de Pesquisa (`31979310542`) já provava abertura, seleção da revisão e execução da engine, mas falhou apenas porque o botão legado de fechamento estava escondido no desktop. Isso foi corrigido antes do gate final.

Também permanecem verdes geometria da referência, Tiptap, colagem estruturada, recuperação, conflitos, drawers móveis e foco automático.

## Higiene de branches — registrada e deferida

A poda de branches existe como dívida de higiene, mas foi explicitamente deferida. Não iniciar auditoria ou exclusão de branches durante esta frente.

## Foco atual

A única frente ativa é **o Escrevaral atual na nova casa aprovada**. Não abrir Cofre, poda de branches ou redesign paralelo sem nova decisão explícita.

## Próximo gate

Continuar conectando **um comportamento visível por vez**, somente quando houver destino real. O próximo candidato limpo identificado é o `+` de **Tags** no painel de análise, porque `draft.tags`, parsing, autosave e conflito já existem. Nenhum botão cenográfico deve ganhar funcionalidade inventada.
