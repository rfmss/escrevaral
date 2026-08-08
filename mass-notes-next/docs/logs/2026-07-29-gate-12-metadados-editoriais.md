# Gate 12 — metadados editoriais seguros

Data: 2026-07-29  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` (rascunho)  
Cabeça funcional aprovada: `70226195cd742b714ad53bb2a9c4cd815210d821`

## Objetivo de produto

Permitir que a pessoa organize a página ativa com estado, favorito e tags sem criar uma persistência paralela, uma revisão mais fraca ou um caminho que pudesse sobrescrever silenciosamente o manuscrito.

O Gate 11 tornou esses campos consultáveis. O Gate 12 fecha o ciclo permitindo sua manutenção unitária no produto novo.

## Decisão de P.O.

Estado, favorito e tags são metadados editoriais, mas pertencem ao mesmo documento e à mesma linha de revisão do manuscrito.

Consequências:

- usam o mesmo `EscrevaralDocument`;
- usam o mesmo autosave de 650 ms;
- incrementam a mesma `revision`;
- participam da recuperação emergencial;
- são gravados pelo mesmo `saveDocument`;
- usam o mesmo BroadcastChannel;
- entram no mesmo contrato de conflito entre abas;
- entram naturalmente na cópia nativa versão 1;
- não recebem merge campo a campo ou gravação direta no banco.

Ao mesmo tempo, uma mudança editorial não torna o texto linguisticamente obsoleto. Portanto, estado, favorito e tags não apagam seleção, mapa ProseMirror, leitura da Revisão ou decorations baseadas no mesmo manuscrito.

## Inventário anterior ao código

O schema já continha:

- `status`;
- `favorite`;
- `tags`;
- `updatedAt`;
- `revision`.

O repositório já oferecia:

- `saveDocument(document, expectedRevision)`;
- `DocumentConflictError`;
- recuperação em localStorage;
- conflito preservado como cópia;
- BroadcastChannel para atualização entre abas;
- backup que serializa todos os metadados.

Não foi necessária migração de IndexedDB nem nova versão do envelope nativo.

## Implementação

### Interface

Criado `src/components/DocumentMetadataEditor.tsx`, renderizado na aba Pulso.

Favorito:

- botão explícito com `aria-pressed`;
- alternância unitária;
- atualização imediata do estado React;
- persistência pelo autosave normal.

Tags:

- campo separado por vírgulas;
- aplicação atômica pelo botão `Salvar marcadores`;
- deduplicação por `normalizeLibraryText`;
- preservação da primeira grafia informada no conjunto;
- limite de 8 tags;
- limite de 32 caracteres por tag;
- remoção individual por chip;
- lista vazia aceita para remover todos os marcadores.

Criado `src/styles/document-metadata.css` com:

- box sizing explícito;
- controles de largura segura;
- alvos móveis de pelo menos 44 px;
- chips truncáveis sem overflow;
- estados ativo, hover, disabled e foco.

### Coordenação de mutações

Criado em `App.tsx`:

```ts
type DraftMutationKind = 'manuscript' | 'metadata'
```

A função `mutateDraft` recebe a categoria da mudança. `dirtyKindRef` preserva `manuscript` como categoria dominante quando um lote contém os dois tipos.

Mutações de manuscrito:

- título;
- JSON Tiptap;
- `plainText` derivado.

Mutações editoriais:

- estado;
- favorito;
- tags.

Ambas:

- atualizam `updatedAt`;
- marcam o documento como alterado;
- entram na recuperação emergencial;
- passam por `saveDocument` com revisão esperada;
- incrementam `revision`;
- atualizam a biblioteca;
- publicam mudança entre abas.

Somente mutações de manuscrito:

- invalidam análise em andamento;
- limpam issues e decorations;
- exigem nova leitura linguística.

### BroadcastChannel

A mensagem passou a transportar:

```ts
{ id, revision, kind }
```

O canal continua sendo apenas um aviso. A outra aba relê o documento do IndexedDB e nunca aceita o payload como fonte autoral.

Compatibilidade defensiva:

- mensagens sem `kind` continuam aceitas;
- o cliente compara título, `plainText` e JSON Tiptap;
- se o manuscrito não mudou, a atualização é tratada como editorial.

Atualização remota limpa de metadados:

- substitui o draft pelo documento persistido;
- não redefine `editorResetKey`;
- não limpa o contrato de posições;
- não apaga a Revisão;
- não desmonta o Tiptap.

Atualização remota com rascunho local sujo:

- abre conflito independentemente do campo;
- não faz merge silencioso;
- permite carregar a outra aba;
- permite guardar a versão local como nova cópia.

Ao carregar a outra aba, o editor só é reiniciado quando título, texto ou estrutura realmente diferem.

## Testes adicionados

Criado `tests/gate12-metadata.spec.ts` com sete cenários por navegador:

1. favorito usa a mesma revisão, autosave e filtro da biblioteca;
2. tags são aplicadas atomicamente, deduplicadas e persistidas;
3. limites e remoção unitária permanecem previsíveis;
4. estado, favorito e tags não apagam leitura linguística válida;
5. metadado remoto limpo não desmonta editor ou decorations;
6. conflito de metadados não faz merge silencioso e pode virar cópia;
7. editor de metadados cabe no drawer móvel e devolve foco.

Matriz total:

- 105 cenários no Chromium;
- 105 cenários no Firefox;
- 210 execuções.

## Primeira validação

Cabeça: `36c109d773b9662e35a971b03f7df84c18c156b4`  
Mass Notes: workflow `30451977462`.

Resultado:

- build verde;
- todos os 210 casos foram executados;
- 12 falhas;
- publicação, cache e smoke corretamente bloqueados;
- coerência global e Argila verdes.

As falhas não revelaram defeito no contrato de produto:

1. dois testes antigos, em dois navegadores, fixavam a frase `Outra aba também escreveu`; a mensagem passou a dizer `Outra aba também alterou esta página` para abranger organização editorial;
2. três testes novos, em dois navegadores, presumiam que o documento inicial já estivesse registrado em `localStorage`; o produto selecionava corretamente o documento, mas só persiste a preferência quando há seleção explícita;
3. um teste novo, em dois navegadores, localizava `Pronto` sem distinguir o filtro da biblioteca do estado na aba Pulso.

Correções:

- os testes antigos passaram a verificar o contrato mais amplo `Outra aba também alterou`;
- o helper passou a descobrir o documento ativo por chave lembrada, título atual ou registro mais recente;
- o estado editorial passou a ser localizado dentro de `#panel-pulso`;
- a persistência de favorito passou a ser sincronizada pela revisão real no IndexedDB, não por espera arbitrária.

Nenhuma regra de produto foi enfraquecida para fazer a suíte passar.

## Validação funcional aprovada

Cabeça: `70226195cd742b714ad53bb2a9c4cd815210d821`.

Workflows:

- `Mass Notes Tiptap` — `30452750643`;
- `Candidata a lançamento Argila` — `30452747030`;
- `Coerência de versões dos arquivos` — `30452747019`.

Resultado:

- build verde;
- Chromium verde;
- Firefox verde;
- 210/210 execuções aprovadas;
- publicação da preview verde;
- renovação de cache verde;
- verificação pública verde;
- candidata Argila integralmente verde;
- coerência global verde.

## Contratos preservados

- JSON Tiptap continua sendo a fonte estrutural;
- IndexedDB continua sendo a fonte principal;
- `saveDocument` continua sendo a única gravação normal;
- conflitos nunca sobrescrevem silenciosamente;
- nenhuma engine ou base foi alterada;
- nenhuma análise aplica texto;
- nenhum metadado é enviado para serviço externo;
- nenhuma mudança foi feita em `main`, entrada pública ou service worker;
- a branch de preview não foi editada diretamente.

## Limitações honestas

Ficam fora do Gate 12:

- edição ou exclusão em massa;
- filtros salvos entre sessões;
- pastas, coleções ou hierarquia;
- taxonomia e sugestão automática de tags;
- merge campo a campo entre abas;
- sincronização em nuvem e colaboração;
- importação do `.esc` legado;
- promoção para `main`.

## Próximo norte proposto

Gate 13 — importação auditável do `.esc` legado.

A importação deverá pré-visualizar e validar o arquivo, converter por adaptador isolado e criar novas cópias com `legacySourceId`. Não poderá substituir documentos existentes, aceitar lote parcialmente inválido ou confundir o formato legado com a cópia nativa versão 1.
