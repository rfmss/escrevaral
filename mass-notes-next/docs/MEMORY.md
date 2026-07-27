# Memória consolidada — Mass Notes Next

Atualizado em: 2026-07-27

## Estado atual

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155`, rascunho;
- preview: branch `preview-mass-notes-tiptap`;
- aplicação pública e `main`: intactas;
- editor artesanal anterior: referência de UX, não fundação técnica;
- Gate 1: verde;
- Gate 2: verde em Chromium e Firefox;
- Gate 3: verde em Chromium e Firefox;
- engines integradas: Revisão e Espelho de Voz;
- próximo passo: avaliação manual do Espelho de Voz antes do Gate 4.

## Decisões que não devem ser reabertas sem evidência

1. Tiptap/ProseMirror é o motor de edição.
2. JSON do Tiptap é a fonte estrutural; HTML e texto são derivados.
3. Engines não conhecem React, Tiptap ou DOM; entram por adaptadores.
4. IndexedDB é a fonte principal; localStorage serve apenas para preferências e recuperação emergencial.
5. Nenhuma aba pode sobrescrever outra silenciosamente.
6. Cada documento possui histórico de edição isolado.
7. Preview não é publicação e só é atualizada após gate verde.
8. A identidade visual é editorial brasileira, sem ornamentos cobrindo o papel.
9. Não criar regras próprias de cursor quando o comportamento válido do ProseMirror é suficiente.
10. Documentação, testes e logs fazem parte da definição de pronto.
11. Uma análise linguística é invalidada por mudança do documento ou do conteúdo, não por autosave do mesmo conteúdo.
12. Voz, público e ecos literários devem ser apresentados como hipóteses heurísticas, nunca diagnóstico definitivo.

## Incidentes que orientam a arquitetura

- O protótipo com `contenteditable` exigiu correções repetidas de Enter, Backspace, paste, seleção e histórico.
- O QA encontrou perda silenciosa entre duas abas.
- O primeiro drawer móvel ficou abaixo do overlay por stacking context.
- O histórico Tiptap inicialmente atravessava documentos; foi isolado remontando a instância por documento.
- O workflow passou a bloquear a publicação da preview quando o gate falha.
- O Espelho de Voz inicialmente desaparecia após autosave porque a revisão persistida era confundida com mudança semântica; Firefox revelou a condição temporal.

## Contratos técnicos ativos

### Documento

Mantém pelo menos:

- `id`;
- `title`;
- `content` em JSON Tiptap;
- `plainText`;
- `revision`;
- `status`;
- datas e metadados.

### Engines

Cada adaptador deve:

- carregar a engine original sem modificá-la;
- declarar tipos próprios;
- normalizar resposta defensivamente;
- tratar ausência ou exceção;
- não manipular DOM;
- receber snapshot explícito;
- permitir descarte de resultado obsoleto;
- preservar disclaimers e níveis de confiança importantes para a interpretação.

### Qualidade

Toda regressão relevante deve virar teste quando automatizável. Chromium e Firefox são obrigatórios para o editor e para cada nova engine integrada.

## Limitações conhecidas

Ainda não estão aprovados:

- service worker e abertura offline em nova sessão;
- Tauri e SQLite;
- DOCX;
- paginação física;
- leitores de tela reais;
- teclado virtual real;
- RimaLab e vocabulário decolonizador na nova shell;
- decorations inline;
- promoção para a entrada pública.

## Como retomar

1. ler `README.md`, `PLAN.md`, `MEMORY.md` e o log mais recente;
2. conferir o estado do PR `#155` e o último workflow;
3. não pressupor que capturas representam o produto atual;
4. reproduzir qualquer falha antes de corrigir;
5. atualizar esta memória ao encerrar o lote.