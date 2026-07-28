# Log — Gate 4: Termos que pedem contexto

Data: 2026-07-27
Estado: concluído
Branch: `experiment/mass-notes-tiptap`
PR: `#155` (rascunho)

## Escopo confirmado

Integrar `decolonial-engine.js` e `decolonial-data.json` por adaptador, preservando os arquivos originais e apresentando resultados como leitura contextual.

Não alterar:

- engine original;
- base original;
- manuscrito;
- Tiptap ou schema;
- `main`;
- aplicação pública;
- service worker.

## API verificada

A engine expõe `window.VeredaDecolonial` com:

- `ensureLoaded()`;
- `listCategories()`;
- `listEntries()`;
- `detectText(text, options?)`;
- `isLoaded()`;
- `hasLoadError()`.

`detectText()` devolve entradas enriquecidas com categoria e contagem. A base possui `avoid`, `alternatives`, `category`, `reason`, `context` e `contextual`.

## Decisões de produto

1. A interface se chama **Termos que pedem contexto**.
2. Um resultado não é uma acusação, proibição ou ordem de substituição.
3. Narrador, personagem, época, citação e intenção crítica permanecem visíveis na orientação.
4. Não há botão de aplicar alternativa.
5. O usuário examina o contexto e decide.
6. Resultados permanecem fora do editor neste gate.

## Implementação final

- adaptador: `src/engines/decolonialAdapter.ts`;
- painel: `src/components/ContextPanel.tsx`;
- aba `Contexto` no rail;
- cinco abas organizadas em duas linhas;
- base original importada como recurso raw e entregue à engine durante a inicialização;
- carregamento serializado por promessa compartilhada;
- ponte temporária de `fetch` restaurada em `finally`;
- invalidação por `document.id` e `plainText`;
- nenhuma alteração automática no manuscrito;
- seis cenários novos em Chromium e Firefox;
- captura visual específica nos dois navegadores;
- regressão geométrica para nomes de termos.

## Tentativa 1

- commit testado: `d367f4838e913f973e921f1d15223bb98ce21fea`;
- workflow: `30316002586`;
- build: aprovado;
- testes: falharam antes de exercer a engine;
- preview: bloqueada.

### Causa e decisão

O helper esperava `data-document-id`, atributo inexistente na biblioteca. O produto não recebeu atributo de teste; a sincronização passou a usar contagem visível de páginas e título vazio.

Correção: `75a1347d819234c21e3b3298a219fd4450085786`.

## Tentativa 2

- commit testado: `6ae7659f7b71fa8e20842aa92236b512ec2d7b0b`;
- workflow: `30316388382`;
- build: aprovado;
- vazio e mobile: aprovados;
- quatro fluxos com engine: falharam;
- preview: bloqueada.

### Falha real — concorrência na inicialização

A engine chama `ensureLoaded()` ao ser executada. O adaptador restaurava o `fetch` original e iniciava uma segunda carga. Uma chamada recebia a base empacotada; a outra tentava buscar o arquivo no servidor e marcava `_loadError`.

### Decisão e correção

- manter a ponte local até a inicialização terminar;
- representar o carregamento por uma promessa compartilhada;
- fazer chamadas concorrentes aguardarem o mesmo resultado;
- restaurar `fetch` em `finally`.

Correção: `109acf3108340a5484ccbb127fbc75166f437797`.

### Falha do auditor

O teste de exceção importava TypeScript de fonte no build compilado. O cenário passou a carregar a engine pelo produto e só depois substituir temporariamente a API global por uma exceção controlada.

Correção: `fa00d3b84b52a703037e978e3282c1b5c010fbc7`.

## Tentativa 3 — gate funcional

- commit registrado no fechamento documental: `e6c9886813ce5873a1e7702b40246d94cc8cb6ba`;
- workflow: `30316728298`;
- build: aprovado;
- Chromium: aprovado;
- Firefox: aprovado;
- 21 cenários por navegador, 42 execuções;
- preview: publicada.

Foram comprovados:

- vazio sem falso alerta;
- dois termos e três ocorrências contados corretamente;
- texto sem ocorrências com retorno neutro;
- manuscrito preservado byte a byte no fluxo exercitado;
- nenhum botão de substituição nos cartões;
- invalidação após edição;
- exceção isolada;
- editor funcional após falha;
- mobile sem overflow;
- gates anteriores sem regressão.

## Revisão visual

As capturas mostraram que o contador ao lado do nome fazia “DENEGRIR” quebrar no meio. A contagem foi movida para linha própria; `word-break`, `overflow-wrap` e `hyphens` foram restringidos para o nome do termo.

- commit visual: `741340070f5f37f420aaee0f2f76ad74b7f734f7`;
- workflow: `30316983906`;
- build, Chromium, Firefox e preview: aprovados;
- teste geométrico confirma `scrollWidth <= clientWidth` nos títulos dos cartões.

## Evidência final

- engine e base originais: intactas;
- aplicação pública, `main` e service worker: intactos;
- matriz: 21 cenários em Chromium e Firefox, 42 execuções;
- preview: `preview-mass-notes-tiptap`;
- capturas: `termos-contexto-chromium.png` e `termos-contexto-firefox.png`;
- artefatos preservados pelo workflow por 14 dias.

## Limitações honestas

Ainda dependem de avaliação humana:

- falsos positivos e omissões em corpus amplo;
- adequação da linguagem para gêneros, épocas e narradores diferentes;
- leitor de tela real;
- teclado virtual real;
- textos extensos com muitas ocorrências;
- eventual navegação do cartão até o trecho correspondente.

## Decisão final

**Gate 4 aprovado para avaliação manual e continuidade experimental.**

A aprovação não autoriza merge, publicação pública, alteração automática do texto ou decorations inline. O próximo gate proposto é o RimaLab, somente após revisão manual ou autorização explícita.