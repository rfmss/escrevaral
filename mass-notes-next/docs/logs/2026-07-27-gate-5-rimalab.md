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

## Implementação inicial

- adaptador criado com união discriminada de prosa e verso;
- engine e base originais carregadas por ponte temporária de `fetch`;
- carregamento serializado por promessa compartilhada;
- serializador próprio transforma JSON Tiptap em linhas sonoras e preserva blocos vazios como fronteiras de estrofe;
- painel criado com ecos de prosa, resumo de verso, esquema, estrofes, escansão, pares e ressalva;
- sexta aba organizada em grade 3 × 2;
- nove cenários novos adicionados, elevando a matriz para 30 por navegador;
- workflow passou a observar engine e base do RimaLab.

## Tentativa 1

- commit testado: `62fa740f1350c4b67d2b7b3861a65c35ac24b9b7`;
- workflow: `30318459430`;
- TypeScript/Vite: aprovado;
- testes RimaLab: seis de nove cenários aprovados em cada navegador;
- gates anteriores: várias falhas por contrato acessível de abas;
- preview: corretamente bloqueada.

### Regressão de contrato acessível

Os rótulos das abas foram capitalizados e “revisao” recebeu acento. Os testes anteriores usam os nomes acessíveis estáveis em minúsculas. A mudança não agregava funcionalidade e quebrou Revisão, Voz, Contexto e drawers.

**Decisão:** restaurar os nomes acessíveis originais (`pulso`, `revisao`, `voz`, `contexto`, `ferramentas`) e acrescentar `rimalab` no mesmo padrão. A aparência continua em caixa alta pelo CSS.

### Premissa textual do auditor

O teste procurava a expressão singular “padrão sonoro”, mas o resultado correto dizia “padrões sonoros”.

**Decisão:** aceitar singular e plural, sem mudar o produto.

### Corpus supostamente neutro

A frase escolhida para “prosa sem padrão” produziu três grupos de assonância reais para a heurística: `abriu/observou/voltou`, `janela/mesa` e `quintal/devagar`.

**Decisão:** substituir o corpus artificial por palavras com finais fonéticos deliberadamente distintos, em vez de enfraquecer a engine.

### Verso livre com rima toante

O corpus terminava em “céu”, “mar”, “luz” e “fim”. A engine percebeu uma rima toante entre “céu” e “luz”.

**Decisão:** o teste de ausência de pares passa a usar finais foneticamente distintos. A leitura original não será tratada como bug.

## Próxima execução

Repetir build e a matriz completa de 60 execuções. A preview permanece bloqueada até gate verde.

## Decisão final

Pendente.
