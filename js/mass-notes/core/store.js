(function massNotesStore(global) {
  "use strict";

  const DB_NAME = "mass-notes-escrevaral-experiment";
  const DB_VERSION = 1;
  const LEGACY_KEY = "vereda.manuscripts.v1";
  const MIGRATION_ID = "legacy-vereda-manuscripts-v1";

  let db = null;
  let memoryMode = false;
  const memoryDocuments = new Map();
  const memoryMeta = new Map();

  function createId(prefix = "mn") {
    if (global.crypto?.randomUUID) return global.crypto.randomUUID();
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function now() {
    return Date.now();
  }

  function plainTextFromHtml(html) {
    const container = document.createElement("div");
    container.innerHTML = String(html || "");
    return (container.innerText || container.textContent || "").replace(/\u00a0/g, " ").trim();
  }

  function countWords(text) {
    return String(text || "").trim().split(/\s+/).filter(Boolean).length;
  }

  function normalizeDocument(input = {}) {
    const createdAt = Number(input.createdAt) || now();
    const updatedAt = Number(input.updatedAt) || createdAt;
    const contentHtml = String(input.contentHtml ?? input.html ?? textToHtml(input.text || ""));
    const plainText = String(input.plainText || plainTextFromHtml(contentHtml));
    const tags = Array.isArray(input.tags)
      ? input.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 30)
      : String(input.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 30);

    return {
      id: String(input.id || createId("document")),
      schemaVersion: 1,
      title: String(input.title || "Documento sem título").slice(0, 180),
      contentHtml,
      plainText,
      folderId: input.folderId ? String(input.folderId) : null,
      tags,
      favorite: Boolean(input.favorite),
      createdAt,
      updatedAt,
      deletedAt: input.deletedAt ? Number(input.deletedAt) : null,
      revision: Math.max(0, Number(input.revision) || 0),
      wordCount: countWords(plainText),
      characterCount: plainText.length,
      kind: String(input.kind || "documento"),
      description: String(input.description || ""),
      authorshipRecord: input.authorshipRecord || input.proof || null,
      analysisCache: input.analysisCache && typeof input.analysisCache === "object" ? input.analysisCache : {},
      engineSchemaVersion: Number(input.engineSchemaVersion) || 1,
      legacySourceId: input.legacySourceId ? String(input.legacySourceId) : null,
    };
  }

  function textToHtml(text) {
    const value = String(text || "").replace(/\r\n?/g, "\n");
    if (!value.trim()) return "<p><br></p>";
    return value.split(/\n{2,}/).map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`).join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function requestResult(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Falha no armazenamento local."));
    });
  }

  function transactionDone(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error || new Error("A gravação foi interrompida."));
      transaction.onerror = () => reject(transaction.error || new Error("A gravação falhou."));
    });
  }

  async function open() {
    if (!global.indexedDB) {
      memoryMode = true;
      await ensureStarterDocument();
      return { memoryMode: true, reason: "IndexedDB indisponível" };
    }

    try {
      db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains("documents")) {
            const documents = database.createObjectStore("documents", { keyPath: "id" });
            documents.createIndex("updatedAt", "updatedAt");
            documents.createIndex("favorite", "favorite");
            documents.createIndex("deletedAt", "deletedAt");
          }
          if (!database.objectStoreNames.contains("meta")) {
            database.createObjectStore("meta", { keyPath: "id" });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Não foi possível abrir o banco local."));
        request.onblocked = () => reject(new Error("O banco local está bloqueado por outra aba."));
      });

      db.onversionchange = () => db.close();
      await migrateLegacyOnce();
      await ensureStarterDocument();
      return { memoryMode: false };
    } catch (error) {
      console.error("[Mass Notes] IndexedDB indisponível; usando memória.", error);
      memoryMode = true;
      await ensureStarterDocument();
      return { memoryMode: true, reason: error.message };
    }
  }

  async function listDocuments() {
    if (memoryMode) return [...memoryDocuments.values()].map(normalizeDocument);
    const transaction = db.transaction("documents", "readonly");
    const rows = await requestResult(transaction.objectStore("documents").getAll());
    return rows.map(normalizeDocument);
  }

  async function getDocument(id) {
    if (!id) return null;
    if (memoryMode) return memoryDocuments.has(id) ? normalizeDocument(memoryDocuments.get(id)) : null;
    const transaction = db.transaction("documents", "readonly");
    const row = await requestResult(transaction.objectStore("documents").get(String(id)));
    return row ? normalizeDocument(row) : null;
  }

  async function saveDocument(input) {
    const documentRecord = normalizeDocument(input);
    documentRecord.updatedAt = now();
    documentRecord.revision = Math.max(0, Number(input.revision) || 0) + 1;
    documentRecord.wordCount = countWords(documentRecord.plainText);
    documentRecord.characterCount = documentRecord.plainText.length;

    if (memoryMode) {
      memoryDocuments.set(documentRecord.id, structuredCloneSafe(documentRecord));
      return normalizeDocument(documentRecord);
    }

    const transaction = db.transaction("documents", "readwrite");
    transaction.objectStore("documents").put(documentRecord);
    await transactionDone(transaction);
    return normalizeDocument(documentRecord);
  }

  async function removeDocument(id) {
    if (memoryMode) {
      memoryDocuments.delete(String(id));
      await ensureStarterDocument();
      return;
    }
    const transaction = db.transaction("documents", "readwrite");
    transaction.objectStore("documents").delete(String(id));
    await transactionDone(transaction);
    await ensureStarterDocument();
  }

  async function getMeta(id) {
    if (memoryMode) return memoryMeta.get(id) || null;
    const transaction = db.transaction("meta", "readonly");
    return requestResult(transaction.objectStore("meta").get(id));
  }

  async function setMeta(value) {
    if (!value?.id) throw new Error("Metadado sem identificador.");
    if (memoryMode) {
      memoryMeta.set(value.id, structuredCloneSafe(value));
      return;
    }
    const transaction = db.transaction("meta", "readwrite");
    transaction.objectStore("meta").put(value);
    await transactionDone(transaction);
  }

  async function ensureStarterDocument() {
    const documents = await listDocuments();
    if (documents.length) return documents[0];
    return saveDocument({
      title: "Meu primeiro documento",
      contentHtml: "<p><br></p>",
      plainText: "",
      createdAt: now(),
      updatedAt: now(),
    });
  }

  async function migrateLegacyOnce() {
    const migrated = await getMeta(MIGRATION_ID);
    if (migrated?.completedAt) return migrated;

    let raw = null;
    try {
      raw = localStorage.getItem(LEGACY_KEY);
    } catch (error) {
      await setMeta({ id: MIGRATION_ID, completedAt: now(), imported: 0, note: "localStorage indisponível" });
      return null;
    }

    if (!raw) {
      await setMeta({ id: MIGRATION_ID, completedAt: now(), imported: 0 });
      return null;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      await setMeta({ id: MIGRATION_ID, completedAt: now(), imported: 0, invalidSource: true });
      return null;
    }

    const candidates = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.manuscripts)
        ? parsed.manuscripts
        : Array.isArray(parsed?.documents)
          ? parsed.documents
          : [];

    const imported = candidates
      .filter((item) => item && typeof item === "object")
      .map((item) => normalizeDocument({
        id: createId("legacy"),
        legacySourceId: item.id || null,
        title: item.title || item.name || "Documento importado",
        contentHtml: item.contentHtml || item.html || textToHtml(item.text || item.content || ""),
        tags: item.tags,
        favorite: item.favorite,
        createdAt: item.createdAt || item.created || now(),
        updatedAt: item.updatedAt || item.updated || item.createdAt || now(),
        kind: item.kind || item.type || "documento",
        description: item.description || "",
        authorshipRecord: item.authorshipRecord || item.proof || null,
      }));

    if (!imported.length) {
      await setMeta({ id: MIGRATION_ID, completedAt: now(), imported: 0, unsupportedSource: true });
      return null;
    }

    const transaction = db.transaction(["documents", "meta"], "readwrite");
    const documentsStore = transaction.objectStore("documents");
    imported.forEach((documentRecord) => documentsStore.put(documentRecord));
    transaction.objectStore("meta").put({
      id: MIGRATION_ID,
      completedAt: now(),
      imported: imported.length,
      sourceKey: LEGACY_KEY,
      sourcePreserved: true,
    });
    await transactionDone(transaction);
    return { imported: imported.length };
  }

  function structuredCloneSafe(value) {
    if (global.structuredClone) return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  global.MassNotesStore = {
    open,
    listDocuments,
    getDocument,
    saveDocument,
    removeDocument,
    normalizeDocument,
    plainTextFromHtml,
    countWords,
    isMemoryMode: () => memoryMode,
  };
})(window);
