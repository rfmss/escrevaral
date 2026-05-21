(function filesystemBackupEngine(global) {
  const DB_NAME = "vereda.filesystem-backup.v1";
  const STORE_NAME = "handles";
  const HANDLE_KEY = "backup";

  function isSupported() {
    return "showSaveFilePicker" in global && "indexedDB" in global;
  }

  async function pickBackupFile(suggestedName) {
    if (!isSupported()) {
      throw new Error("Autosave externo requer Chrome, Edge ou Opera.");
    }

    const handle = await global.showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: "Backup Vereda",
          accept: {
            "application/vnd.vereda+json": [".vrda"],
            "application/json": [".json"],
          },
        },
      ],
    });

    await saveHandle(handle);
    return handle;
  }

  async function getStoredHandle() {
    if (!isSupported()) {
      return null;
    }

    return readStore("readonly", (store) => requestToPromise(store.get(HANDLE_KEY))).catch(() => null);
  }

  async function ensurePermission(handle) {
    if (!handle) {
      return false;
    }

    if (typeof handle.queryPermission !== "function" || typeof handle.requestPermission !== "function") {
      return true;
    }

    const options = { mode: "readwrite" };

    if ((await handle.queryPermission(options)) === "granted") {
      return true;
    }

    return (await handle.requestPermission(options)) === "granted";
  }

  async function writeBackup(handle, backup) {
    if (!(await ensurePermission(handle))) {
      throw new Error("Permissão para salvar o arquivo foi negada.");
    }

    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(backup, null, 2));
    await writable.close();
  }

  async function saveHandle(handle) {
    return readStore("readwrite", (store) => requestToPromise(store.put(handle, HANDLE_KEY)));
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = global.indexedDB.open(DB_NAME, 1);

      request.addEventListener("upgradeneeded", () => {
        request.result.createObjectStore(STORE_NAME);
      });

      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () => reject(request.error));
    });
  }

  async function readStore(mode, callback) {
    const database = await openDatabase();

    try {
      return await new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        let result;

        Promise.resolve(callback(store))
          .then((value) => {
            result = value;
          })
          .catch(reject);

        transaction.addEventListener("complete", () => resolve(result));
        transaction.addEventListener("error", () => reject(transaction.error));
        transaction.addEventListener("abort", () => reject(transaction.error));
      });
    } finally {
      database.close();
    }
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.addEventListener("success", () => resolve(request.result));
      request.addEventListener("error", () => reject(request.error));
    });
  }

  global.VeredaFileSystemBackup = {
    getStoredHandle,
    isSupported,
    pickBackupFile,
    writeBackup,
  };
})(window);
