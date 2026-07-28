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

Aprovado em Chromium e Firefox:

- `decolonial-engine.js` e `decolonial-data.json` permaneceram intactos;
- base original empacotada e fornecida ao carregamento assíncrono por adaptador;
- aba `Contexto` adicionada sem alterar ou marcar o manuscrito;
- termo, categoria, motivo, contexto, alternativas e contagem apresentados;
- linguagem não acusatória e decisão humana explícita;
- documento vazio, ausência de termos, múltiplas ocorrências, invalidação e falha cobertos;
- nenhuma alternativa possui ação automática;
- nomes de termos preservados integralmente no rail;
- preview atualizada somente após gate verde.

Evidência final: commit `741340070f5f37f420aaee0f2f76ad74b7f734f7`, workflow `30316983906`, 21 cenários em cada navegador, 42 execuções.

## Lote atual — revisão manual do Gate 4

Antes de iniciar uma nova engine:

1. usar a preview com textos reais de gêneros e épocas diferentes;
2. avaliar falsos positivos, omissões e linguagem dos cartões;
3. confirmar que o painel informa sem constranger ou prescrever;
4. testar rail e rolagem em desktop e mobile;
5. registrar qualquer P0/P1;
6. não iniciar substituição automática nem decorations inline.

## Próximo lote proposto — Gate 5: RimaLab

Somente após revisão manual ou autorização explícita do mantenedor.

Objetivo previsto: integrar o RimaLab como leitura sonora opcional, distinguindo prosa e verso, sem marcações dentro do editor no primeiro corte.

Escopo preliminar:

- adaptador tipado;
- identificação de prosa ou verso;
- padrões sonoros para prosa;
- métrica, escansão e rimas quando houver versos;
- execução por ação explícita;
- nenhum ajuste automático no manuscrito;
- Chromium e Firefox;
- documentação e log próprios.

## Fora do próximo gate

- decorations inline;
- aplicação automática de sugestões;
- paginação física;
- service worker;
- Tauri/SQLite;
- promoção para `main`.

## Sequência posterior planejada

1. revisão manual do Gate 4;
2. Gate 5 — RimaLab sem marcações inline;
3. contrato de posições para issues linguísticas;
4. decorations ProseMirror;
5. PWA/offline em nova sessão;
6. avaliação de promoção arquitetural.

O Gate 5 só começa depois da avaliação manual ou de autorização explícita do mantenedor.