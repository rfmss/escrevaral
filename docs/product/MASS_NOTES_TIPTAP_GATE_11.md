# Mass Notes Tiptap — Gate 11

## Decisão

O Mass Notes Next passa a oferecer organização local da biblioteca por busca, estado, favorito, tag e ordenação, usando exclusivamente campos já presentes no documento.

O gate é de consulta e apresentação. Ele não altera schema, conteúdo, revisão ou persistência.

## Fontes de dados

A organização usa:

- `title`;
- `plainText`;
- `status`;
- `favorite`;
- `tags`;
- `createdAt`;
- `updatedAt`;
- `id` para desempate final.

Nenhum campo novo foi adicionado ao documento ou IndexedDB.

## Arquitetura

A lógica vive em `mass-notes-next/src/library/libraryQuery.ts`.

Essa camada:

- não conhece React;
- não conhece DOM;
- não conhece Tiptap;
- não acessa IndexedDB;
- não modifica a lista recebida;
- retorna somente uma projeção ordenada e filtrada.

A apresentação permanece em `src/components/Library.tsx`, e o visual em `src/styles/library-organization.css`.

## Contrato de filtros

São combináveis:

- busca textual;
- estado editorial;
- somente favoritas;
- tag.

A busca considera título, texto derivado, tags e estado. Comparações ignoram caixa e acentos, mas nenhum valor armazenado é reescrito.

Aplicar filtros nunca seleciona outro documento automaticamente.

## Contrato de ordenação

Opções:

- alteração mais recente;
- criação mais recente;
- título A–Z.

Empates possuem regras explícitas por título, data e identidade. Bibliotecas com títulos repetidos não dependem da ordem acidental do banco.

## Contrato de tags equivalentes

Tags como `Poesia` e `poesia` são equivalentes para filtragem e aparecem uma única vez no combobox.

O representante do filtro é determinístico e privilegia:

1. preservação de diacríticos;
2. inicial maiúscula entre grafias equivalentes;
3. colação estável em português brasileiro.

Os cartões continuam exibindo a grafia original de cada documento.

## Segurança autoral

Filtrar ou ordenar não altera:

- JSON Tiptap;
- texto ou título;
- seleção;
- histórico;
- revisão;
- autosave;
- IndexedDB;
- backup;
- documento ativo.

Quando a página ativa fica fora do recorte, ela permanece aberta e a interface informa explicitamente essa condição.

## Experiência

A biblioteca apresenta:

- favorito;
- estado;
- tempo desde a última alteração;
- até duas tags e contagem das demais;
- número de páginas visíveis e total;
- estado vazio explicativo;
- ação única para limpar filtros.

No mobile, a superfície continua sendo um drawer com Escape, retorno de foco e ausência de overflow horizontal.

## Evidência

Cabeça funcional: `1e4ca1784b145b510ba6d3749025230d22f7d632`.

Workflow `30449369857`:

- build aprovado;
- Chromium aprovado;
- Firefox aprovado;
- 98 cenários por navegador;
- 196 execuções aprovadas;
- publicação da preview aprovada;
- renovação de cache aprovada;
- verificação pública aprovada.

Também aprovados:

- candidata Argila `30449371552`;
- coerência de versões `30449371768`.

## Fora do gate

- edição de favorito;
- edição de tags;
- filtros persistidos entre sessões;
- edição ou exclusão em massa;
- pastas, coleções ou hierarquia persistente;
- sincronização em nuvem;
- colaboração;
- taxonomia automática;
- promoção para `main`.

## Próximo gate proposto

Gate 12 — edição segura e unitária de metadados editoriais.

Antes de implementar, o produto deve decidir se alterações exclusivamente em `favorite` ou `tags` incrementam a mesma `revision` do documento e como conflitos entre abas serão apresentados sem perder conteúdo. Não é permitido criar persistência paralela ou silenciosamente mais fraca que a do manuscrito.
