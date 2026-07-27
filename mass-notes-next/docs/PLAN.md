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

Aprovado em Chromium e Firefox:

- `voice-engine.js` intacta e carregada por adaptador;
- resposta normalizada em contrato TypeScript;
- aba `Voz` no rail, sem decorations inline;
- documento vazio sem falso diagnóstico;
- corpus curto apresentado com baixa confiança;
- corpus médio com leitura, métricas e hipótese editorial;
- resultado invalidado quando documento ou conteúdo muda;
- resultado preservado quando apenas o autosave avança a revisão;
- falha da engine isolada sem quebrar o editor;
- preview atualizada somente após gate verde.

Evidência principal: workflow `30314881409`, 15 cenários em Chromium e Firefox, total de 30 execuções.

## Lote atual — revisão manual do Gate 3

Antes de iniciar uma nova engine:

1. usar a preview com textos reais curtos e longos;
2. avaliar linguagem, hierarquia e utilidade das hipóteses;
3. registrar qualquer P0/P1;
4. confirmar que o rail continua legível no desktop e mobile;
5. não iniciar decorations inline.

## Próximo lote proposto — Gate 4: termos que pedem contexto

Somente após a revisão manual do Gate 3.

Objetivo previsto: integrar o vocabulário decolonizador como leitura contextual, sem acusação e sem substituição automática.

Escopo preliminar:

- adaptador tipado;
- seção ou aba contextual;
- termo, categoria, motivo, contexto e alternativas;
- contagem de ocorrências;
- nenhuma alteração automática do texto;
- Chromium e Firefox;
- documentação e log próprios.

## Sequência posterior planejada

1. Gate 4 — vocabulário decolonizador;
2. RimaLab sem marcações inline;
3. contrato de posições para issues linguísticas;
4. decorations ProseMirror;
5. PWA/offline em nova sessão;
6. avaliação de promoção arquitetural.

O próximo gate só começa depois da avaliação manual ou de autorização explícita do mantenedor.