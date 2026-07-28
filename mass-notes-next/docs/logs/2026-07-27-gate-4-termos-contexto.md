# Log — Gate 4: Termos que pedem contexto

Data: 2026-07-27
Estado: em andamento
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
3. Narrador, personagem, época, citação e intenção crítica precisam permanecer visíveis na orientação.
4. Não haverá botão de aplicar alternativa.
5. O usuário examina o contexto e decide.
6. Resultados ficam fora do editor neste gate.

## Riscos

- a engine carrega a base por `fetch('decolonial-data.json')` relativo;
- duplicar manualmente a base criaria risco de divergência;
- uma quinta aba pode apertar o rail;
- resultados podem soar prescritivos se a linguagem da interface for inadequada;
- o autosave não pode invalidar uma leitura do mesmo conteúdo;
- falha da base não pode quebrar outras engines.

## Plano técnico

1. criar `src/engines/decolonialAdapter.ts`;
2. fornecer a base original ao carregamento da engine sem modificar o script;
3. normalizar retorno em contrato TypeScript;
4. criar `src/components/ContextPanel.tsx`;
5. adicionar aba `Contexto` ao rail;
6. invalidar por `document.id` e `plainText`;
7. testar vazio, nenhum termo, termo com múltiplas ocorrências, alternativas, invalidação e falha;
8. rodar Chromium e Firefox;
9. só publicar preview depois do gate verde;
10. fechar plano, memória, changelog e documentação global.

## Critério de aprovação

- engine e base intactas;
- nenhuma mudança automática no texto;
- resultados reproduzíveis e contados corretamente;
- linguagem contextual e não acusatória;
- ausência de regressão nas engines anteriores;
- Chromium e Firefox verdes;
- preview publicada somente após gate verde.

## Implementação inicial

- adaptador criado em `src/engines/decolonialAdapter.ts`;
- base original fornecida à engine durante o carregamento, sem cópia editada;
- painel criado em `src/components/ContextPanel.tsx`;
- aba `Contexto` adicionada ao rail;
- cinco abas organizadas em duas linhas equilibradas;
- seis cenários novos adicionados ao Playwright;
- workflow passou a observar engine e base.

## Tentativa 1

- commit testado: `d367f4838e913f973e921f1d15223bb98ce21fea`;
- workflow: `30316002586`;
- build TypeScript/Vite: aprovado;
- testes: falharam antes de exercer a engine;
- preview: corretamente bloqueada.

### Causa

O helper novo esperava `data-document-id` em `.note-card.active`, mas esse atributo não faz parte do contrato da biblioteca. Todos os cenários ficaram presos tentando observar um identificador inexistente.

### Decisão

Não adicionar atributo de teste ao produto. A criação passa a ser sincronizada pela contagem visível de páginas e pelo título vazio do documento recém-criado.

### Correção

- helper alterado no commit `75a1347d819234c21e3b3298a219fd4450085786`;
- nenhuma mudança de produto foi necessária.

## Próxima execução

Repetir build e matriz completa em Chromium e Firefox. Preview permanece bloqueada até gate verde.

## Decisão final

Pendente.