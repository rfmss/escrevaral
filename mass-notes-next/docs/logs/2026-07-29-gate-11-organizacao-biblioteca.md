# Gate 11 — organização da biblioteca

Data: 2026-07-29

## Objetivo

Tornar a biblioteca útil para acervos maiores usando somente campos já persistidos, sem migrar o banco, sem trocar a página ativa por efeito de filtro e sem introduzir operações destrutivas ou em massa.

## Inventário inicial

O contrato `EscrevaralDocument` já possuía:

- `status`;
- `favorite`;
- `tags`;
- `createdAt`;
- `updatedAt`;
- `title` e `plainText` para busca.

O IndexedDB já armazenava esses campos e a cópia nativa já os preservava. Portanto, o gate não exigia nova versão de schema, índice adicional ou migrador.

A biblioteca anterior oferecia somente busca textual e lista ordenada por atualização. Favorito e tags podiam existir em documentos restaurados ou migrados, mas não eram apresentados nem utilizados na interface nova.

## Escopo entregue

- camada pura em `src/library/libraryQuery.ts`;
- busca por título, texto, tags e estado;
- filtro por estado;
- filtro somente de favoritas;
- filtro por tag;
- combinação simultânea de todos os filtros;
- ordenação por alteração recente;
- ordenação por criação recente;
- ordenação por título A–Z;
- contagem de páginas visíveis e total;
- estado vazio explicativo;
- ação de limpar todos os filtros;
- aviso quando a página ativa fica fora do recorte;
- favorito, estado, tempo relativo e tags nos cartões;
- layout responsivo em `src/styles/library-organization.css`;
- sete regressões por navegador em `tests/gate11-library.spec.ts`.

## Arquitetura

```text
src/library/libraryQuery.ts
        ↓
src/components/Library.tsx
        ↓
src/styles/library-organization.css
```

`libraryQuery.ts` não conhece React, DOM, IndexedDB ou Tiptap. Ele recebe documentos e consulta e retorna uma nova lista.

`Library.tsx` mantém somente o estado transitório dos filtros. A busca continua controlada pelo `App`, preservando o caminho existente.

Nenhum filtro chama repositório, autosave ou comando Tiptap.

## Contrato da consulta

Objeto de consulta:

```ts
{
  search,
  status,
  favoritesOnly,
  tag,
  sort,
}
```

Regras:

1. busca vazia não restringe;
2. busca normaliza caixa e acentos apenas para comparação;
3. estado `all` não restringe;
4. favorito é filtro booleano opcional;
5. tag selecionada é comparada pela forma normalizada;
6. todos os critérios são combinados por interseção;
7. a entrada nunca é ordenada ou modificada no lugar.

## Ordenação e desempates

- `updated-desc`: `updatedAt` decrescente; empate por título e `id`;
- `created-desc`: `createdAt` decrescente; empate por título e `id`;
- `title-asc`: colação `pt-BR`, sensibilidade base e modo numérico; empate por atualização e `id`.

Títulos repetidos permanecem previsíveis. A ordem não depende do retorno acidental do IndexedDB.

## Tags equivalentes

A equivalência remove diacríticos, converte para minúsculas e preserva o valor original no documento.

Para impedir que o rótulo do filtro mudasse quando outra página se tornasse mais recente, o representante canônico passou a ser escolhido de forma determinística:

1. maior informação diacrítica;
2. inicial maiúscula quando as formas são equivalentes;
3. colação `pt-BR` com variante e desempate numérico.

Assim, `Poesia` e `poesia` aparecem uma única vez no filtro, mas cada cartão continua exibindo sua grafia autoral.

## Segurança da página ativa

Aplicar filtros:

- não chama `onSelect`;
- não troca o documento ativo;
- não fecha o editor;
- não apaga rascunho;
- não altera seleção;
- não interfere no autosave;
- não muda revisão;
- não grava no IndexedDB.

Quando o documento ativo não pertence ao recorte, a biblioteca informa: “A página ativa continua aberta, mas está fora deste recorte.”

## Responsividade e acessibilidade

- desktop mantém a biblioteca como rail;
- mobile mantém o drawer existente;
- controles possuem nomes acessíveis específicos;
- grupos de estado usam `aria-pressed`;
- contagem e aviso usam regiões vivas apropriadas;
- Escape fecha o drawer;
- foco retorna ao botão que abriu o arquivo;
- documento e drawer permanecem sem overflow horizontal real.

## Testes adicionados

Sete cenários por navegador:

1. busca + estado + favorito + tag sem trocar a página ativa;
2. três ordenações com desempate previsível;
3. deduplicação de tags equivalentes e combinação com favoritas;
4. estado vazio e limpeza dos filtros;
5. preservação e persistência do rascunho durante filtros;
6. biblioteca com 24 páginas, Unicode e títulos repetidos;
7. drawer móvel, geometria e retorno de foco.

A matriz passou de 91 para 98 cenários por navegador e de 182 para 196 execuções.

## Estabilização

### Primeira execução

O build passou, mas a suíte revelou:

- `getByLabel('Tag')` também encontrava os grupos “Tags: …” dos cartões;
- `getByLabel('Ordenar')` também encontrava a região “Filtrar e ordenar biblioteca”;
- o ícone `★` fazia parte do texto do título favorito e quebrou buscas exatas antigas do Gate 9B;
- uma falha temporal antiga do RimaLab apareceu no Firefox.

Correções:

- comboboxes receberam nomes `Filtrar por tag` e `Ordenar páginas`;
- a região recebeu nome não conflitante;
- tags dos cartões passaram a usar “Marcadores” no nome acessível;
- estrela favorita foi separada de `.note-title-text` e marcada como decorativa;
- nenhum contrato do backup foi relaxado.

### Segunda execução

Resultado: 192/196.

Os quatro casos restantes esperavam a opção `Poesia`, mas o representante deduplicado era a primeira grafia encontrada. Como a lista chega ordenada por atualização, editar um documento podia trocar o rótulo para `poesia`.

Correção: canonicalização determinística na camada pura.

### Terceira execução

Resultado: 194/196.

A lógica e os dois cartões estavam corretos. O teste comparava o texto completo do contêiner de chips (`poesia + travessia`, `Poesia + mar`) com somente o primeiro chip.

Correção: cada cartão passou a ter seu primeiro chip localizado e validado individualmente.

### Execução funcional final

- cabeça: `1e4ca1784b145b510ba6d3749025230d22f7d632`;
- workflow Mass Notes: `30449369857`;
- 98 cenários por navegador;
- 196/196 execuções;
- build aprovado;
- Chromium aprovado;
- Firefox aprovado;
- publicação aprovada;
- renovação de cache aprovada;
- verificação pública aprovada;
- candidata Argila `30449371552` aprovada;
- coerência de versões `30449371768` aprovada.

## Limitações honestas

- favorito e tags ainda não são editáveis na interface nova;
- filtros não são persistidos entre sessões;
- não existe edição ou exclusão em massa;
- não existem pastas, coleções ou hierarquia persistente;
- não há sincronização ou colaboração;
- não há taxonomia automática;
- o filtro de tags representa equivalência linguística simples, não ontologia.

## Próximo passo lógico

Gate 12 — edição segura e unitária de metadados editoriais.

Antes do código, deve ser definido como favorito e tags participam de `revision`, autosave e conflitos entre abas. A solução não pode criar um segundo caminho de persistência nem sobrescrever conteúdo silenciosamente.
