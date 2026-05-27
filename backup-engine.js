(function backupEngine(global) {
  function createBackup(state) {
    const manuscripts = state.manuscripts || [];
    const docs  = manuscripts.filter(m => (m.type || "manuscrito") === "manuscrito");
    const notes = manuscripts.filter(m => (m.type || "manuscrito") !== "manuscrito");
    const totalWords = docs.reduce((sum, m) => {
      const txt = m.text || (m.html || "").replace(/<[^>]+>/g, " ");
      return sum + (txt.trim().split(/\s+/).filter(Boolean).length);
    }, 0);
    return VeredaVrda.createEnvelope(
      {
        activeId: state.activeId,
        manuscripts: state.manuscripts,
        focus: state.focus,
        lexical: state.lexical,
        archive: state.archive,
        proofs: state.proofs,
        versions: state.versions,
        proofValidations: state.proofValidations || {},
      },
      { stats: { manuscriptCount: docs.length, noteCount: notes.length, totalWords } }
    );
  }

  function readBackup(file) {
    return new Promise((resolve, reject) => {
      if (!file.name.endsWith(".esc")) {
        reject(new Error("Importe apenas arquivos nativos .esc."));
        return;
      }

      const reader = new FileReader();

      reader.addEventListener("load", () => {
        try {
          resolve(parseBackup(reader.result));
        } catch (error) {
          reject(error);
        }
      });

      reader.addEventListener("error", () => {
        reject(new Error("Não foi possível ler o arquivo de backup."));
      });

      reader.readAsText(file);
    });
  }

  function parseBackup(rawValue) {
    return VeredaVrda.parseEnvelope(rawValue);
  }

  function validateBackupStructure(data) {
    if (!data || typeof data !== "object") throw new Error("Arquivo inválido: estrutura não reconhecida.");
    if (!Array.isArray(data.manuscripts)) throw new Error("Arquivo inválido: lista de manuscritos ausente ou corrompida.");
    if (data.manuscripts.length === 0) throw new Error("Arquivo não contém manuscritos.");
    const broken = data.manuscripts.findIndex((m) => !m || typeof m.id !== "string" || m.id.trim() === "");
    if (broken !== -1) throw new Error(`Manuscrito na posição ${broken + 1} está corrompido (sem identificador).`);
    const ids = new Set(data.manuscripts.map((m) => m.id));
    if (data.activeId && !ids.has(data.activeId)) {
      data.activeId = data.manuscripts[0].id;
    }
  }

  function restoreBackup(currentState, backup) {
    const data = backup.payload;
    validateBackupStructure(data);

    return {
      ...currentState,
      activeId: data.activeId || data.manuscripts[0].id,
      manuscripts: data.manuscripts,
      focus: data.focus || currentState.focus,
      lexical: data.lexical || currentState.lexical,
      archive: data.archive || currentState.archive,
      proofs: data.proofs || {},
      versions: data.versions || {},
      proofValidations: data.proofValidations || {},
    };
  }

  global.VeredaBackup = {
    createBackup,
    readBackup,
    restoreBackup,
  };
})(window);
