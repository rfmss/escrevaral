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

Aprovado:

- documento estruturado;
- Enter após título;
- histórico isolado por documento;
- conflito entre abas;
- primeira engine real: Revisão;
- Chromium e mobile básico.

### Gate 2 — confiabilidade

Aprovado:

- Chromium e Firefox;
- paste representativo de Word e Google Docs;
- seleção, toolbar e listas;
- recuperação antes do autosave;
- preservação de conflito como cópia;
- drawers acessíveis;
- preview somente após gate verde.

## Lote atual — Gate 3: Espelho de Voz

Objetivo: integrar `voice-engine.js` por adaptador, sem alterar a engine e sem criar decorations inline.

Escopo autorizado:

1. criar adaptador tipado e normalização defensiva;
2. adicionar aba `Voz` ao rail;
3. mostrar confiança, gesto, descrição, forças, pontos cegos, ecos, público e exercícios;
4. descartar resultado quando documento ou revisão mudarem;
5. executar localmente, por ação explícita;
6. cobrir Chromium e Firefox;
7. atualizar documentação e preview após gate verde.

Fora do Gate 3:

- destaques dentro do editor;
- aplicação automática de sugestões;
- RimaLab;
- vocabulário decolonizador;
- paginação física;
- service worker;
- Tauri/SQLite;
- promoção para `main`.

## Critério de aprovação do Gate 3

- engine original intacta;
- carregamento por adaptador isolado;
- documento vazio tratado sem falso diagnóstico;
- texto curto identificado como baixa confiança;
- texto suficiente produz leitura normalizada;
- edição ou troca de documento invalida resultado antigo;
- falha da engine não quebra editor nem outras abas;
- Chromium e Firefox verdes;
- documentação e log atualizados;
- preview publicada somente após gate verde.

## Sequência posterior planejada

1. Vocabulário decolonizador em painel contextual;
2. RimaLab sem marcações inline;
3. contrato de posições para issues linguísticas;
4. decorations ProseMirror;
5. PWA/offline em nova sessão;
6. avaliação de promoção arquitetural.

O próximo passo só é autorizado após o gate atual ficar verde ou ser explicitamente interrompido por P0/P1.