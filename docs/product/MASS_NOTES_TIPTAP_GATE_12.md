# Mass Notes Tiptap — Gate 12: metadados editoriais

Status: aprovado  
Data: 2026-07-29  
PR: `#155`  
Branch: `experiment/mass-notes-tiptap`  
Cabeça funcional: `70226195cd742b714ad53bb2a9c4cd815210d821`

## Resultado de produto

A página ativa pode manter estado, favorito e tags no produto novo sem criar uma persistência paralela ao manuscrito.

O gate entrega:

- alternância unitária de favorito;
- edição atômica de tags;
- remoção individual de tags;
- estado editorial no mesmo contrato;
- persistência, revisão e conflito compartilhados;
- preservação de leituras linguísticas quando o texto não mudou;
- atualização segura entre abas;
- integração imediata com biblioteca e backup.

## Decisão central

`status`, `favorite` e `tags` são metadados editoriais, mas são parte do mesmo documento versionado.

Uma mudança exclusivamente editorial:

- atualiza `updatedAt`;
- incrementa `revision`;
- usa o mesmo autosave;
- usa a mesma recuperação emergencial;
- é gravada pelo mesmo repositório IndexedDB;
- participa do mesmo conflito entre abas;
- entra na mesma cópia nativa.

Não existe:

- tabela separada;
- autosave separado;
- gravação direta do componente;
- revisão específica de metadados;
- merge campo a campo silencioso;
- last-write-wins fora do contrato existente.

## Tipos de mutação

A coordenação distingue dois efeitos:

```ts
type DraftMutationKind = 'manuscript' | 'metadata'
```

### Manuscrito

Inclui:

- título;
- JSON Tiptap;
- texto derivado.

Efeitos:

- invalida leituras linguísticas em andamento ou concluídas;
- remove decorations obsoletas;
- exige novo mapa quando chega remotamente;
- pode reiniciar a instância visual do editor para refletir outro documento persistido.

### Metadados

Inclui:

- estado;
- favorito;
- tags.

Efeitos:

- preserva o Tiptap montado;
- preserva seleção e histórico do manuscrito;
- preserva o contrato de posições;
- preserva leituras e decorations baseadas no mesmo conteúdo;
- atualiza cartões, filtros e backup pela versão normal do documento.

A distinção existe para controlar projeções derivadas, não para criar duas fontes de verdade.

## Interface aprovada

Superfície: aba `Pulso` do rail de ferramentas.

### Favorito

- botão explícito;
- estado acessível por `aria-pressed`;
- alteração unitária;
- persistência automática;
- reflexo no cartão e filtro de favoritas.

### Tags

- entrada separada por vírgulas;
- botão explícito para aplicar;
- conjunto aplicado atomicamente;
- até 8 tags;
- até 32 caracteres por tag;
- espaços internos normalizados;
- duplicatas removidas por equivalência sem caixa e acentos;
- primeira grafia informada preservada no documento;
- remoção individual por chip;
- conjunto vazio permitido.

### Estado

- chips existentes continuam sendo o controle unitário;
- mudança de estado é classificada como metadado;
- não invalida análise textual;
- participa da mesma revisão.

## Concorrência entre abas

A publicação local anuncia:

```ts
{ id, revision, kind }
```

O BroadcastChannel não transporta o documento como fonte. A aba receptora relê o registro do IndexedDB.

Sem rascunho local:

- revisão mais nova é carregada;
- se `kind` é `metadata`, o editor não é desmontado;
- se `kind` é `manuscript`, leituras e editor são atualizados defensivamente.

Com rascunho local:

- abre conflito para qualquer revisão remota mais nova;
- nenhuma combinação automática é feita;
- a pessoa pode carregar a outra aba;
- a pessoa pode guardar a versão local como nova cópia.

Mensagens antigas sem `kind` são classificadas comparando título, texto e JSON Tiptap.

## Persistência e backup

O Gate 12 não altera schema de IndexedDB nem envelope de backup.

Os campos já faziam parte de `EscrevaralDocument` e do envelope `escrevaral.mass-notes-next.backup`, versão `1`.

Consequências:

- metadados editados entram na próxima cópia nativa;
- restauração preserva estado, favorito e tags;
- filtros da biblioteca refletem esses campos;
- nenhuma migração ou versão nova foi necessária.

## Invariantes

Editar metadados não pode:

- alterar JSON Tiptap;
- alterar `plainText`;
- mover a seleção;
- criar entrada no histórico ProseMirror;
- apagar uma leitura linguística válida;
- remover decorations baseadas no mesmo manuscrito;
- trocar a página ativa;
- escrever fora do repositório versionado;
- sobrescrever uma revisão concorrente;
- enviar dados para rede externa.

Editar o manuscrito continua invalidando projeções linguísticas obsoletas.

## Qualidade e evidência

Cobertura adicionada:

- favorito, revisão, autosave e filtro;
- tags atômicas e deduplicadas;
- limites e remoção individual;
- preservação de análise linguística;
- atualização remota sem desmontagem;
- conflito sem merge silencioso;
- drawer móvel e retorno de foco.

Matriz:

- 105 cenários no Chromium;
- 105 cenários no Firefox;
- 210 execuções aprovadas.

Workflows funcionais:

- Mass Notes `30452750643`;
- candidata Argila `30452747030`;
- coerência de versões `30452747019`.

Build, navegadores, publicação, cache e verificação pública ficaram verdes.

## Incidentes de estabilização

A primeira execução teve 12 falhas, todas de contrato de teste:

- wording antigo de conflito dizia apenas “escreveu”;
- helper exigia chave de documento ativo em localStorage no primeiro boot;
- seletor “Pronto” confundia filtro da biblioteca com estado da página.

A mensagem de produto mais ampla foi preservada. Os fixtures foram corrigidos para observar o estado real do produto e os controles foram escopados à superfície correta.

## Fora deste gate

- edição ou exclusão em massa;
- filtros persistidos entre sessões;
- pastas e coleções;
- taxonomia automática;
- merge campo a campo;
- sincronização e colaboração;
- importação do `.esc` legado;
- promoção para `main`.

## Próximo gate proposto

Gate 13 — importação auditável do `.esc` legado.

A proposta exige validação integral, pré-visualização, conversão por adaptador e importação somente como novas cópias com rastreabilidade por `legacySourceId`.
