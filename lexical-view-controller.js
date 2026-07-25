// lexical-view-controller.js — estado e navegação da superfície Palavras
// Carregado após app.js para manter o motor lexical isolado da apresentação.

(function lexicalViewController(global) {
  const title = document.querySelector('[data-lexical-title]');
  const hint = document.querySelector('[data-lexical-hint]');
  const search = document.querySelector('[data-lexical-search]');
  const context = document.querySelector('[data-lexical-context]');
  const card = document.querySelector('[data-lexical-card]');
  const originalRender = global.renderLexicalView;

  if (!title || !search || !context || !card || typeof originalRender !== 'function') {
    return;
  }

  const escape = typeof global.escapeHtml === 'function'
    ? global.escapeHtml
    : (value) => String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  function getLexicalState() {
    return typeof state !== 'undefined' ? state.lexical : null;
  }

  function keepModuleTitle() {
    title.textContent = 'Palavras';
  }

  function getManuscript() {
    return typeof global.getActiveManuscript === 'function'
      ? global.getActiveManuscript()
      : null;
  }

  function renderEmptyState(manuscript = getManuscript()) {
    keepModuleTitle();
    card.innerHTML = '';

    if (!manuscript) {
      context.innerHTML = `
        <div class="lexical-empty-state" data-lexical-empty>
          <span class="material-symbols-outlined" aria-hidden="true">text_fields</span>
          <strong>Comece um texto para trabalhar as palavras.</strong>
          <p>O vocabulário fica no próprio navegador e acompanha a escrita sem enviar conteúdo para fora.</p>
          <button class="secondary-button" data-action="open-create-note" type="button">
            <span class="material-symbols-outlined" aria-hidden="true">add</span>
            Começar um texto
          </button>
        </div>`;
      return;
    }

    const manuscriptTitle = (manuscript.title || '').trim();
    const currentText = manuscriptTitle
      ? `<span class="lexical-current-text">Texto atual: “${escape(manuscriptTitle)}”</span>`
      : '';

    context.innerHTML = `
      <div class="lexical-empty-state" data-lexical-empty>
        <span class="material-symbols-outlined" aria-hidden="true">text_fields</span>
        <strong>Escolha uma palavra do seu texto.</strong>
        <p>Busque acima ou selecione uma palavra ou frase no editor. O Escrevaral mostra leituras e trocas possíveis sem enviar seu manuscrito.</p>
        ${currentText}
        <button class="secondary-button" data-action="switch-view-editor" type="button">
          <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          Voltar ao texto
        </button>
      </div>`;
  }

  function renderLocalMiss(word) {
    keepModuleTitle();
    context.innerHTML = '';
    card.innerHTML = `
      <span class="material-symbols-outlined" aria-hidden="true">dictionary</span>
      <h2>${escape(word)}</h2>
      <p class="lexical-note">Não encontrei uma leitura local para esta palavra.</p>
      <p class="lexical-disclaimer">O vocabulário do Escrevaral não cobre todos os termos. Nada do seu manuscrito foi enviado para fora.</p>`;
  }

  async function enhancedRenderLexicalView() {
    const manuscript = getManuscript();
    const lexical = getLexicalState();

    if (!lexical?.selectedWord && !lexical?.selectedPhrase) {
      renderEmptyState(manuscript);
      return;
    }

    await originalRender();
    keepModuleTitle();

    const disclaimer = card.querySelector('.lexical-disclaimer');
    if (disclaimer && /Vocabulário não carregado/i.test(disclaimer.textContent || '')) {
      disclaimer.textContent = 'O vocabulário local não abriu nesta sessão. Recarregue a página; seu manuscrito continua neste navegador.';
    }

    if (lexical.selectedWord && !card.textContent.trim()) {
      renderLocalMiss(lexical.selectedWord);
    }
  }

  // A função original é global; a troca preserva todos os chamadores já existentes.
  global.renderLexicalView = enhancedRenderLexicalView;

  if (hint) {
    hint.textContent = 'Busque uma palavra ou selecione uma palavra ou frase no texto — sem sair da sua mesa.';
  }

  // A busca precisa vencer uma frase analisada anteriormente. O listener em captura
  // limpa o estado obsoleto antes do listener original do aplicativo executar.
  search.addEventListener('input', () => {
    const lexical = getLexicalState();
    if (!lexical) return;

    const query = search.value.trim().toLowerCase().replace(/[^a-záéíóúâêôãõçàü\-]/g, '');
    lexical.selectedPhrase = null;
    lexical.selectedContext = null;
    lexical.selectedRange = null;

    if (query.length < 2) {
      lexical.selectedWord = null;
      if (query.length === 1) {
        queueMicrotask(() => global.renderLexicalView());
      }
    }
  }, true);

  search.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const lexical = getLexicalState();
    if (!lexical) return;
    lexical.selectedWord = null;
    lexical.selectedPhrase = null;
    lexical.selectedContext = null;
    lexical.selectedRange = null;
  }, true);

  // Corrige imediatamente o estado que app.js já pode ter desenhado.
  void enhancedRenderLexicalView();

  global.VeredaLexicalViewController = {
    render: enhancedRenderLexicalView,
    renderEmpty: renderEmptyState,
  };
})(window);
