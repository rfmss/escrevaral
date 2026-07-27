(function bootstrapMassNotes(global) {
  "use strict";

  async function start() {
    if (!global.MassNotesStore || !global.MassNotesEngines || !global.MassNotesApp) {
      throw new Error("Camadas obrigatórias do Mass Notes não foram carregadas.");
    }
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
