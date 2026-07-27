# Gate da fundação Tiptap — Mass Notes Next

## Situação

**Aprovado para continuidade experimental em 2026-07-27.**

- branch: `experiment/mass-notes-tiptap`;
- entrada isolada: `mass-notes-next/`;
- workflow: `Mass Notes Tiptap`, execução 27;
- commit funcional validado: `24c7a6fa7fc675d5bcda8eb09a472405ec995b1f`;
- instalação de dependências: aprovada;
- TypeScript + Vite: aprovados;
- Chromium + Playwright: aprovados;
- aplicação pública, service worker e engines originais: não alterados.

A aprovação permite desenvolver a nova fundação na branch. Não autoriza merge, publicação, substituição do `index.html` ou incorporação ao cache offline.

## O que foi comprovado

1. O editor usa Tiptap/ProseMirror e mantém documento estruturado.
2. Enter depois de Título 1 cria um parágrafo válido.
3. A junção estrutural padrão por Backspace continua reversível por Undo.
4. O histórico é isolado por documento e não atravessa páginas.
5. Duas abas não sobrescrevem silenciosamente o mesmo documento.
6. Um conflito oferece carregar a versão persistida ou preservar a versão local como cópia.
7. A engine real de Revisão é carregada por adaptador, sem reescrita da engine.
8. O layout editorial funciona em desktop e 390 px sem overflow horizontal.
9. O título de exemplo cabe integralmente em desktop e mobile.
10. Biblioteca e ferramentas móveis abrem e fecham por teclado.

## Decisões resultantes do gate

### Não fabricar comportamento de cursor sem evidência

O ProseMirror junta blocos quando Backspace é usado no início de um parágrafo. Esse comportamento é estruturalmente válido, possui Undo e é comum em editores maduros. A fundação não o substitui por uma regra artesanal apenas para reproduzir uma expectativa do protótipo anterior.

### Histórico por documento

Cada documento monta sua própria instância Tiptap. Trocar documento ou restaurar conflito desmonta a instância anterior, impedindo que Undo/Redo atravesse páginas.

### Integridade entre abas

Cada gravação compara, dentro da transação IndexedDB, a revisão esperada com a revisão persistida. Em divergência, nenhuma escrita é aplicada automaticamente.

## Identidade transplantada

Foram preservados e adaptados do protótipo preferido:

- papel quente e linhas-guia;
- azul técnico, vermelho de impacto e laranja de ação;
- ruído, retícula e grade editorial;
- marca lateral “Oficina de escrita brasileira”;
- documentos numerados;
- cabeçalho de registro;
- página central;
- rail de Pulso, Revisão e Ferramentas;
- modo concentração;
- linguagem brasileira de oficina.

Não foram transplantados o `textarea`, o editor artesanal ou o `localStorage` como banco principal.

## Próximo gate

Antes de ampliar o conjunto de engines:

1. teste Firefox;
2. paste real de HTML e conteúdo vindo de Word/Google Docs;
3. listas, links e seleção em regressão ampliada;
4. recuperação de aba interrompida;
5. conflito completo com preservação da cópia;
6. acessibilidade de drawers e tabs;
7. decisão de preview online isolado;
8. somente depois, integração gradual das próximas engines.
