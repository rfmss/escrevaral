(function backupEngine(global) {
  function createBackup(state) {
    return VeredaVrda.createEnvelope({
        activeId: state.activeId,
        manuscripts: state.manuscripts,
        focus: state.focus,
        lexical: state.lexical,
        archive: state.archive,
        proofs: state.proofs,
        versions: state.versions,
    });
  }

  function readBackup(file) {
    return new Promise((resolve, reject) => {
      if (!file.name.endsWith(".vrda")) {
        reject(new Error("Importe apenas arquivos nativos .vrda."));
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

  function restoreBackup(currentState, backup) {
    const data = backup.payload;

    return {
      ...currentState,
      activeId: data.activeId || data.manuscripts[0].id,
      manuscripts: data.manuscripts,
      focus: data.focus || currentState.focus,
      lexical: data.lexical || currentState.lexical,
      archive: data.archive || currentState.archive,
      proofs: data.proofs || {},
      versions: data.versions || {},
    };
  }

  global.VeredaBackup = {
    createBackup,
    readBackup,
    restoreBackup,
  };
})(window);
