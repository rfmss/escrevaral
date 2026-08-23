# Mass Notes Tiptap — decisão de fundação

## Objetivo

Preservar o produto, as engines e a identidade visual do Escrevaral, substituindo apenas o motor artesanal de edição por Tiptap/ProseMirror.

## Referência visual

A referência principal é o protótipo “Rascunho em Combate”:

- papel quente e linhas-guia;
- azul técnico, vermelho de impacto e laranja de ação;
- marca editorial na lateral;
- documentos numerados;
- cabeçalho de registro;
- página central;
- rail contextual;
- modo concentração;
- linguagem de oficina brasileira.

O CSS é transplantado e adaptado. O `textarea` e o armazenamento em `localStorage` não são transplantados.

## Relação com a arquitetura vigente

A arquitetura pública continua sendo HTML, CSS e JavaScript vanilla. Esta branch é uma exceção experimental, isolada e motivada por falhas demonstradas de integridade estrutural no editor artesanal — não por preferência estética.

O experimento não substitui `index.html`, não entra no service worker e não altera a distribuição vigente. A eventual mudança da arquitetura oficial exige nova decisão, migração, funcionamento offline comprovado e autorização explícita do mantenedor.

## Fundação

- React + TypeScript + Vite;
- Tiptap 3 / ProseMirror;
- `idb` sobre IndexedDB;
- revisão condicional por documento;
- BroadcastChannel para sinalizar alterações entre abas;
- conflito preservado como cópia, nunca sobrescrito silenciosamente;
- engines legadas incorporadas por adaptadores usando importação raw do Vite;
- primeira engine integrada: Revisão.

## Não entra neste corte

- Tauri;
- SQLite;
- troca da entrada pública;
- service worker;
- todas as engines de uma vez;
- paginação física;
- DOCX;
- colaboração remota.

## Gates iniciais

1. Tiptap editável;
2. Enter após título cria parágrafo;
3. fronteira entre título e parágrafo permanece segura;
4. duas abas não perdem conteúdo silenciosamente;
5. revisão real carrega por adaptador;
6. build TypeScript/Vite;
7. Chromium em desktop e mobile;
8. nenhum arquivo da aplicação pública é substituído.
