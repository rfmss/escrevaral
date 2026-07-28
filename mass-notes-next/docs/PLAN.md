# Plano vivo — Mass Notes Next

Atualizado em: 2026-07-27

## Norte do produto

Construir uma oficina de escrita feita para português brasileiro, preservando as engines e a identidade do Escrevaral sobre infraestrutura consolidada de edição.

O diferencial do produto não é fabricar cursor, seleção ou histórico. É oferecer leitura linguística local, fluxo de escrita e repertório brasileiro.

## Fundação atual

- React + TypeScript + Vite;
- Tiptap / ProseMirror;
- IndexedDB por `idb`;
- revisão condicional e conflito entre abas;
- engines legadas por adaptadores;
- preview isolada em `preview-mass-notes-tiptap`;
- PR rascunho `#155`.

## Gates concluídos

### Gate 1 — fundação

- documento estruturado;
- Enter após título;
- histórico isolado por documento;
- conflito entre abas;
- primeira engine real: Revisão;
- Chromium e mobile básico.

### Gate 2 — confiabilidade

- Chromium e Firefox;
- paste representativo de Word e Google Docs;
- seleção, toolbar e listas;
- recuperação antes do autosave;
- preservação de conflito como cópia;
- drawers acessíveis;
- preview somente após gate verde.

### Gate 3 — Espelho de Voz

- `voice-engine.js` intacta e carregada por adaptador;
- aba `Voz` sem decorations inline;
- vazio, corpus curto, corpus médio, falha e obsolescência cobertos;
- resultado preservado quando apenas o autosave avança a revisão;
- Chromium e Firefox verdes;
- preview atualizada somente após gate verde.

Evidência: workflow `30315176567`, 15 cenários em cada navegador, 30 execuções.

### Gate 4 — Termos que pedem contexto

- `decolonial-engine.js` e `decolonial-data.json` intactos;
- base original fornecida ao carregamento assíncrono por adaptador;
- aba `Contexto` sem alterar ou marcar o manuscrito;
- termo, categoria, motivo, contexto, alternativas e contagem apresentados;
- linguagem não acusatória e decisão humana explícita;
- vazio, ausência de termos, múltiplas ocorrências, invalidação e falha cobertos;
- nomes de termos preservados integralmente no rail;
- Chromium e Firefox verdes.

Evidência: workflow `30316983906`, 21 cenários em cada navegador, 42 execuções.

## Lote atual — Gate 5: RimaLab

Autorizado explicitamente pelo mantenedor em 2026-07-27.

Objetivo: integrar `rimalab-engine.js` e `rimalab-data.json` como oficina sonora opcional, distinguindo prosa e verso sem marcar ou alterar o texto.

### Escopo autorizado

1. criar adaptador tipado para engine e base originais;
2. executar somente por ação explícita;
3. em prosa, apresentar padrões sonoros internos sem fingir métrica de verso;
4. em verso, apresentar quantidade de versos, metro dominante, variação métrica, esquema de rimas, estrofes, escansão e pares rimados;
5. preservar a nota pedagógica sobre sinalefa, dicção regional e intenção musical;
6. invalidar resultado quando documento ou conteúdo mudar, nunca por autosave do mesmo conteúdo;
7. não modificar Tiptap, schema ou manuscrito;
8. cobrir vazio, prosa, verso livre, versos rimados, estrofes, falha e mobile;
9. executar Chromium e Firefox;
10. atualizar preview somente após gate verde;
11. manter plano, memória, changelog e log sincronizados.

### Linguagem obrigatória

- chamar a superfície de **RimaLab** ou **Oficina sonora**;
- usar “leitura aproximada”, “padrão percebido” e “experimente escutar”;
- não afirmar que a escansão automática é definitiva;
- não tratar ausência de rima como defeito;
- não sugerir que prosa precisa virar verso;
- nenhuma ação altera o texto.

### Critérios de parada

Interromper o lote em caso de:

- alteração involuntária do manuscrito;
- classificação de prosa como verso de forma estruturalmente enganosa;
- perda de resultados entre documentos;
- falha que quebre Revisão, Voz, Contexto ou editor;
- regressão P0/P1 em Chromium ou Firefox;
- layout ilegível no rail ou mobile.

## Fora do Gate 5

- busca interativa de palavras para rimar;
- encyclopedia completa na interface;
- reprodução de áudio ou leitura em voz alta;
- decorations inline;
- aplicação automática de sugestões;
- paginação física;
- service worker;
- Tauri/SQLite;
- promoção para `main`.

## Sequência posterior planejada

1. Gate 5 — RimaLab sem marcações inline;
2. revisão manual com prosa, poesia, cordel, letra e verso livre;
3. contrato de posições para issues linguísticas;
4. decorations ProseMirror;
5. PWA/offline em nova sessão;
6. avaliação de promoção arquitetural.

O próximo gate só começa depois do Gate 5 verde e da atualização completa da memória.