(function bootstrapMassNotes(global) {
  "use strict";

  async function start() {
    if (!global.MassNotesStore || !global.MassNotesEngines || !global.MassNotesApp) {
      throw new Error("Camadas obrigatórias do Mass Notes não foram carregadas.");
    }

    // O controlador conserva o objeto ativo durante ações como “salvar e analisar”.
    // Sincronizar o mesmo objeto com o registro confirmado evita descartar um
    // resultado válido como se pertencesse a uma revisão antiga.
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
