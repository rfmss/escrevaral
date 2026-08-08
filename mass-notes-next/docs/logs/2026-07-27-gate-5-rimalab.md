# Log — Gate 5: RimaLab

Data: 2026-07-27
Estado: aprovado para avaliação manual
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

## Implementação

- adaptador criado com união discriminada de prosa e verso;
- engine e base originais carregadas por ponte temporária de `fetch`;
- carregamento serializado por promessa compartilhada;
- serializador próprio transforma JSON Tiptap em linhas sonoras;
- blocos vazios são preservados como fronteiras de estrofe;
- painel criado com ecos de prosa, resumo de verso, esquema, estrofes, escansão, pares e ressalva;
- sexta aba organizada em grade 3 × 2;
- nove cenários novos elevaram a matriz para 30 por navegador;
- workflow passou a observar engine e base do RimaLab.

## Tentativa 1

- commit testado: `62fa740f1350c4b67d2b7b3861a65c35ac24b9b7`;
- workflow: `30318459430`;
- TypeScript/Vite: aprovado;
- testes RimaLab: seis de nove cenários aprovados em cada navegador;
- gates anteriores: falharam em cascata por contrato acessível de abas;
- preview: corretamente bloqueada.

### Regressão de contrato acessível

Os rótulos das abas foram capitalizados e “revisao” recebeu acento. Os testes anteriores usam nomes acessíveis estáveis em minúsculas.

**Decisão:** restaurar `pulso`, `revisao`, `voz`, `contexto` e `ferramentas`, acrescentando `rimalab` no mesmo padrão. A aparência em caixa alta continua sendo responsabilidade do CSS.

### Premissa textual do auditor

O teste procurava a expressão singular “padrão sonoro”, mas o resultado correto dizia “padrões sonoros”.

**Decisão:** aceitar singular e plural, sem mudar o produto.

### Corpus supostamente neutro

A frase escolhida para “prosa sem padrão” produziu três grupos de assonância reais: `abriu/observou/voltou`, `janela/mesa` e `quintal/devagar`.

**Decisão:** usar corpus foneticamente controlado em vez de enfraquecer a engine.

### Verso livre com rima toante

O corpus terminava em “céu”, “mar”, “luz” e “fim”. A engine percebeu uma rima toante entre “céu” e “luz”.

**Decisão:** preservar a leitura da engine e substituir apenas o corpus do cenário de ausência de pares.

## Tentativa 2 — gate verde

- commit documentado: `63590c6eb9e4531ea42d0d154f7460431de34289`;
- workflow: `30319511220`;
- TypeScript/Vite: aprovado;
- Chromium: 30 de 30 cenários aprovados;
- Firefox: 30 de 30 cenários aprovados;
- total: 60 execuções de navegador;
- preview: publicada após gate verde;
- gates 1 a 4: aprovados novamente;
- manuscrito: preservado;
- falha controlada: isolada;
- mobile: sem overflow;
- seis abas: legíveis e acessíveis.

## Inspeção visual

As capturas confirmaram:

- resumo sonoro legível;
- hierarquia clara entre modo, esquema, escansão e pares;
- nota pedagógica visível;
- grade de abas estável;
- nenhum resultado cobrindo o papel;
- rolagem interna do rail preservada.

A primeira captura do Chromium ocorreu antes de o autosave refletir o título novo na biblioteca. O teste passou a aguardar o título ativo antes de gerar evidência; não houve perda de dados.

## Matriz aprovada

O Gate 5 cobre em Chromium e Firefox:

1. página vazia sem falsa leitura;
2. prosa com ecos internos;
3. prosa sem padrão com retorno neutro;
4. poema rimado com esquema, escansão e pares;
5. duas estrofes preservadas por bloco vazio;
6. verso livre sem pares com linguagem não punitiva;
7. invalidação após edição;
8. falha controlada sem quebrar editor ou Revisão;
9. mobile, seis abas e ausência de overflow.

Somados aos gates anteriores: 30 cenários por navegador, 60 execuções.

## Limites

Ainda não foram aprovados:

- calibração ampla com cordel, repente, canção e variedades regionais;
- busca interativa de palavras para rimar;
- enciclopédia completa na nova interface;
- reprodução de áudio;
- contrato de posições;
- decorations inline;
- alteração automática do manuscrito;
- service worker e promoção para a aplicação pública.

## Decisão final

**Gate 5 aprovado para avaliação manual e continuidade experimental.**

A aprovação não autoriza merge, publicação pública, decorations ou aplicação automática. O próximo lote permanece bloqueado até avaliação manual ou nova autorização explícita.