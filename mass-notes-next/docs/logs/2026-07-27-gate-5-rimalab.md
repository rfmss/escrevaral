# Log — Gate 5: RimaLab

Data: 2026-07-27
Estado: em andamento
Branch: `experiment/mass-notes-tiptap`
PR: `#155` (rascunho)

## Escopo confirmado

Integrar `rimalab-engine.js` e `rimalab-data.json` por adaptador, preservando os arquivos originais e apresentando uma oficina sonora opcional.

Não alterar:

- engine original;
- base original;
- manuscrito;
- Tiptap ou schema;
- `main`;
- aplicação pública;
- service worker.

## API verificada

A engine expõe `window.VeredaRimaLab` com:

- `analyze(text)`;
- `analyzeRhyme(a, b)`;
- `classifyTonicity(word)`;
- `syllabify(word)`;
- `scanVerse(verse)`;
- `nameScheme(scheme)`;
- `exportAnalysisText(analysis, title)`;
- `findRhymes(word, limit)`;
- `ensureLoaded()`;
- estado de carga e enciclopédia.

`analyze()` distingue prosa e verso. Para prosa devolve padrões sonoros internos e uma orientação neutra. Para verso devolve escansão, métricas, esquema, estrofes, pares rimados, metro dominante e nota pedagógica.

## Decisões de produto

1. A superfície se chama **RimaLab — oficina sonora**.
2. Ausência de rima não é erro.
3. Prosa não recebe falsa escansão de verso.
4. Escansão é aproximação pedagógica, nunca veredito.
5. Dicção regional, oralidade, sinalefa e intenção musical permanecem visíveis na ressalva.
6. Resultados ficam fora do editor neste gate.
7. Não há ação automática sobre o manuscrito.
8. Busca de palavras que rimam e enciclopédia completa ficam fora do primeiro corte.

## Riscos

- a engine carrega `rimalab-data.json` por caminho relativo;
- a inicialização imediata pode concorrer com chamadas do adaptador;
- quebras de linha do Tiptap precisam chegar intactas à engine;
- prosa poética pode ser classificada como verso ou prosa dependendo da diagramação;
- escansão automática pode soar definitiva se a interface ocultar a ressalva;
- uma sexta aba pode apertar o rail;
- listas longas de versos e pares podem degradar a leitura no mobile.

## Plano técnico

1. criar `src/engines/rimaLabAdapter.ts`;
2. fornecer a base original durante toda a inicialização assíncrona;
3. normalizar prosa e verso em união discriminada TypeScript;
4. criar `src/components/RimaLabPanel.tsx`;
5. adicionar aba `RimaLab` ao rail;
6. invalidar por `document.id` e `plainText`;
7. testar vazio, prosa sem padrão, prosa com padrão, verso livre, verso rimado, estrofes, invalidação e falha;
8. verificar integridade do manuscrito e ausência de botões de aplicação;
9. rodar Chromium e Firefox;
10. só publicar preview depois do gate verde;
11. fechar plano, memória, changelog e documentação global.

## Critério de aprovação

- engine e base intactas;
- nenhuma mudança automática no texto;
- prosa e verso apresentados com linguagem distinta;
- nota acadêmica sempre visível em análises métricas;
- resultados obsoletos descartados;
- falha isolada do editor e das engines anteriores;
- rail e mobile legíveis;
- Chromium e Firefox verdes;
- preview publicada somente após gate verde.

## Registro de execução

A preencher.

## Decisão final

Pendente.
