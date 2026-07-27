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

## Lote atual — Gate 4: Termos que pedem contexto

Autorizado pelo mantenedor em 2026-07-27.

Objetivo: integrar `decolonial-engine.js` como leitura contextual do manuscrito, sem acusação, proibição ou substituição automática.

### Escopo autorizado

1. criar adaptador tipado para a engine e a base originais;
2. adicionar uma superfície `Contexto` no rail;
3. mostrar termo, categoria, motivo, contexto, alternativas e ocorrências;
4. executar somente por ação explícita;
5. não modificar nem marcar o texto dentro do Tiptap;
6. invalidar resultados quando documento ou conteúdo mudar;
7. tratar vazio, nenhum resultado, múltiplas ocorrências e falha da engine;
8. executar Chromium e Firefox;
9. atualizar preview somente após gate verde;
10. manter plano, memória, changelog e log do lote sincronizados.

### Linguagem obrigatória

- usar “Termos que pedem contexto”;
- usar “Por que observar” e “Alternativas possíveis”;
- não usar “erro”, “proibido” ou “correção automática”;
- lembrar que narrador, personagem, época, citação e intenção crítica mudam a leitura;
- nenhuma alternativa é aplicada sem decisão humana.

### Critérios de parada

Interromper o lote em caso de:

- alteração involuntária do manuscrito;
- falso positivo estrutural grave;
- perda de resultado ou estado entre documentos;
- falha que quebre Revisão, Voz ou editor;
- regressão P0/P1 em Chromium ou Firefox.

## Fora do Gate 4

- decorations inline;
- substituição automática;
- RimaLab;
- paginação física;
- service worker;
- Tauri/SQLite;
- promoção para `main`.

## Sequência posterior planejada

1. revisão manual do Gate 4;
2. RimaLab sem marcações inline;
3. contrato de posições para issues linguísticas;
4. decorations ProseMirror;
5. PWA/offline em nova sessão;
6. avaliação de promoção arquitetural.

O próximo gate só começa após o Gate 4 ficar verde e sua memória ser atualizada.