# Gate 7 — primeira decoration ProseMirror de Revisão

## Situação

**Aprovado para continuidade experimental em 2026-07-28.**

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155`, rascunho;
- workflow funcional final: `30367072054`;
- commit funcional validado: `5e7017ddefc634018daf6071ff8b04a3afe5f9cc`;
- Chromium: 67 cenários;
- Firefox: 67 cenários;
- total: 134 execuções, zero falhas e zero flakiness;
- preview publicada, cache renovado e endereço público verificado;
- `main`, entrada pública, service worker e engines originais: não alterados.

Esta aprovação não autoriza merge, lançamento ou aplicação automática de sugestões.

## Decisão de produto

A primeira marcação inline usa somente ocorrências da camada de pontuação da engine de Revisão que possuem fragmento e posição verificáveis.

A integração separa:

- observações gerais, apresentadas apenas no painel;
- trechos localizados, apresentados no painel e projetados no editor.

Nenhuma leitura agregada recebe posição inferida por busca global.

## Contrato de segurança

Uma marca só é criada quando:

1. a engine fornece fragmento e posição válidos;
2. o texto naquele intervalo corresponde exatamente ao fragmento;
3. o contrato converte o range para posições ProseMirror sem colapso;
4. documento e assinatura estrutural permanecem atuais;
5. a análise ainda pertence à execução ativa.

Qualquer edição remove imediatamente todas as projeções. O sistema não remapeia automaticamente ranges de uma leitura antiga.

## Arquitetura

- plugin isolado: `mass-notes-next/src/editor/reviewDecorations.ts`;
- adaptador posicionado: `mass-notes-next/src/engines/reviewAdapter.ts`;
- ligação com estado: `mass-notes-next/src/App.tsx`;
- navegação e apresentação: `mass-notes-next/src/components/RightRail.tsx`;
- skin: `mass-notes-next/src/styles/review-decorations.css`.

As decorations:

- não integram o JSON Tiptap;
- não entram no histórico;
- não manipulam o manuscrito;
- usam `pointer-events: none`;
- podem ser ocultadas e restauradas sem apagar os cartões;
- usam o token semântico de análise, distinto de seleção, ação, erro e conflito.

## Cobertura

A matriz inclui:

- emoji antes da ocorrência;
- `hardBreak`;
- fragmentos repetidos;
- decorations sobrepostas;
- posição e fragmento inválidos;
- obsolescência por edição;
- troca de documento;
- navegação para o trecho;
- mobile sem overflow;
- ocultação e restauração das marcas;
- preservação de assinatura e conteúdo;
- todos os gates anteriores.

## Incidentes relevantes

### Halo da folha

Uma sombra difusa criava gradiente cinza ao lado da folha Blueprint. O blur foi removido e a sombra gráfica seca foi preservada.

### Decorations sobrepostas

Uma ocorrência `PONT-49` estava contida em um range maior `PONT-08`. O ProseMirror pode compor attributes de decorations sobrepostas no mesmo span DOM.

A identidade da ocorrência fica nos resultados tipados, cartões e ranges — não na contagem de spans renderizados.

### Oráculo DOM

`ProseMirror-trailingBreak` e `ProseMirror-separator` continuam classificados como placeholders técnicos, não texto autoral.

## Limites

Permanecem fora do escopo:

- tooltips;
- correção automática;
- substituição;
- correção em massa;
- marks persistidas no documento;
- decorations para Voz, Contexto e RimaLab;
- decorations para alertas sem posição exata;
- promoção para a entrada pública.

## Próxima decisão

Antes de ampliar a marcação, deve haver avaliação manual com documentos reais e alta densidade de ocorrências. Uma segunda engine exige autorização e gate próprios.
