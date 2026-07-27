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

## Registro de execução

A preencher.

## Decisão final

Pendente.