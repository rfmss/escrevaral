(function bootstrapMassNotes(global) {
  "use strict";

  function exposeLexicalGlobals() {
    try {
      if (!global.VeredaPagination && typeof VeredaPagination !== "undefined") {
        global.VeredaPagination = VeredaPagination;
      }
    } catch (_) {
      // A paginação continua opcional se o binding lexical não estiver disponível.
    }
  }

  async function start() {
    exposeLexicalGlobals();

    if (!global.MassNotesStore || !global.MassNotesEngines || !global.MassNotesApp) {
      throw new Error("Camadas obrigatórias do Mass Notes não foram carregadas.");
    }

    // Sincroniza o mesmo objeto enviado pelo controlador com a revisão confirmada.
    const saveDocument = global.MassNotesStore.saveDocument;
    global.MassNotesStore.saveDocument = async function saveAndSynchronize(input) {
      const saved = await saveDocument(input);
      if (input && typeof input === "object") Object.assign(input, saved);
      return saved;
    };

    await global.MassNotesApp.init();
  }

  start().catch((error) => {
    console.error("[Mass Notes] Falha de inicialização.", error);
    const banner = document.getElementById("mn-storage-banner");
    const message = document.getElementById("mn-storage-message");
    if (banner && message) {
      banner.hidden = false;
      message.textContent = "O experimento não conseguiu iniciar. Nenhum dado antigo foi alterado.";
    }
  });
})(window);