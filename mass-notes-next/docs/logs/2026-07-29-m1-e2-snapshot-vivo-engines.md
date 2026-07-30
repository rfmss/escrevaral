# M1 E2 — Snapshot vivo para as engines locais

Data: 2026-07-29

## Contexto

A introdução da auditoria E2 não alterou persistência, exportação, editor ou engines de runtime. Mesmo assim, três execuções integrais sucessivas terminaram 287/288 no Firefox, cada uma em um caso antigo diferente:

1. exportação HTML aguardando `plainText` no IndexedDB;
2. exportação TXT aguardando o mesmo estado;
3. RimaLab de verso livre, com quatro versos visíveis e estado `Salvo`, mas mensagem de página vazia.

As auditorias E2 e o build passaram em todas as execuções. Os 16 casos contextuais também passaram.

## Hipóteses investigadas

### Hipótese 1 — regressão dos dados auditados

Rejeitada.

- os scripts E2 são de leitura;
- nenhuma base linguística foi alterada;
- build e casos das engines passaram;
- a falha migrou entre superfícies antigas sem relação com os arquivos medidos.

### Hipótese 2 — apenas lentidão do IndexedDB

Parcialmente plausível nos dois primeiros sintomas, mas rejeitada como explicação completa.

A janela de `waitPersistedText` do Gate 9 foi ampliada de oito para vinte segundos, preservando a leitura direta do banco e a mesma condição de sucesso. A execução seguinte não falhou em exportação, mas revelou o caso do RimaLab.

### Hipótese 3 — ferramenta lendo projeção atrasada do documento

Confirmada.

No artefato da falha do RimaLab:

- o ProseMirror continha `pedra`, `azul`, `chão` e `fim` em quatro parágrafos;
- o documento aparecia como `Salvo`;
- a aba RimaLab estava aberta;
- a ferramenta respondeu “A página está vazia”.

`RimaLabPanel` montava a fonte a partir de `document.content` e `document.plainText` recebidos por props. O Tiptap já tinha o conteúdo atual, mas a projeção React usada pelo painel ainda podia estar um ciclo atrás no momento do clique.

## Correção

Foi criado:

- `src/editor/editorSnapshotBridge.ts`.

O `MassNotesEditor` publica sincronamente, em `onCreate` e `onUpdate`:

- `documentId`;
- JSON Tiptap atual;
- texto plano atual;
- assinatura estrutural do conteúdo.

RimaLab, Contexto e Palavras/Léxico agora:

1. consultam o snapshot vivo no momento da ação;
2. usam o documento por props apenas como fallback seguro;
3. capturam a assinatura estrutural da entrada analisada;
4. descartam a resposta se houver uma edição real durante a análise;
5. invalidam resultados pela publicação do editor, e não pela chegada tardia de uma renderização React.

A Revisão já usava o contrato estrutural vivo do ProseMirror e não precisou mudar.

## O que não mudou

- nenhuma base linguística;
- nenhuma regra de classificação;
- nenhum texto autoral;
- nenhuma ação automática;
- nenhuma asserção removida;
- nenhuma redução de matriz;
- nenhum acesso de rede adicional;
- nenhuma edição na branch de preview;
- nenhuma alteração em `main`.

## Evidência funcional

Cabeça:

`3c9c6d74e7638392a5bacfe4a2e82565e8af2583`

Workflows:

- Mass Notes `30505264198`: auditor E2, build, **288/288**, publicação, cache e smoke público verdes;
- Argila `30505264208`: verde;
- coerência `30505264199`: verde.

Artefato:

- `mass-notes-tiptap-30505264198`;
- digest `sha256:cd0627c79d7e2337d7077241246dcdf52a531de954bbcceebc5d00fae071523f`.

## Decisão permanente

Uma engine acionada pela interface deve analisar o snapshot autoral vivo do Tiptap no instante da ação. Estado persistido e projeções React continuam essenciais para armazenamento e interface, mas não podem ser a única fonte de uma leitura iniciada imediatamente após edição.

O resultado de uma engine continua condicionado à assinatura da entrada: se o texto mudar durante a análise, a resposta antiga é descartada.

## Próxima ação

- sincronizar memória operacional, plano, memória consolidada, changelog e contrato global;
- repetir a CI na cabeça documental exata;
- atualizar o corpo do PR sem criar commit autorreferente;
- só então iniciar o primeiro lote de integridade lexical (`quica`).

## Governança

- PR `#155` permanece aberto e em rascunho;
- Gate 14 permanece suspenso;
- nenhuma promoção, merge ou substituição integral foi autorizada.
