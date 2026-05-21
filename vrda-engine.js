(function vrdaEngine(global) {
  const FORMAT = "vrda";
  const SCHEMA_VERSION = 1;
  const CREATED_WITH = ".vrda - editor";

  function createEnvelope(payload) {
    const exportedAt = new Date().toISOString();
    const checksum = createChecksum(payload);

    return {
      format: FORMAT,
      schemaVersion: SCHEMA_VERSION,
      createdWith: CREATED_WITH,
      exportedAt,
      checksum,
      payload,
    };
  }

  function parseEnvelope(rawValue) {
    const envelope = JSON.parse(rawValue);

    validateEnvelope(envelope);

    if (createChecksum(envelope.payload) !== envelope.checksum) {
      throw new Error("Arquivo .vrda com checksum inválido.");
    }

    return envelope;
  }

  function validateEnvelope(envelope) {
    if (!envelope || typeof envelope !== "object") {
      throw new Error("Arquivo .vrda ilegível.");
    }

    if (envelope.format !== FORMAT) {
      throw new Error("Este arquivo não é um .vrda válido.");
    }

    if (envelope.schemaVersion !== SCHEMA_VERSION) {
      throw new Error(`Versão .vrda incompatível: ${envelope.schemaVersion || "desconhecida"}.`);
    }

    if (!envelope.payload || typeof envelope.payload !== "object") {
      throw new Error("Arquivo .vrda sem payload.");
    }

    if (!Array.isArray(envelope.payload.manuscripts) || envelope.payload.manuscripts.length === 0) {
      throw new Error("Arquivo .vrda sem manuscritos válidos.");
    }
  }

  function createChecksum(value) {
    return fnv1a(JSON.stringify(stableSort(value)));
  }

  function stableSort(value) {
    if (Array.isArray(value)) {
      return value.map(stableSort);
    }

    if (value && typeof value === "object") {
      return Object.keys(value)
        .sort()
        .reduce((sorted, key) => {
          sorted[key] = stableSort(value[key]);
          return sorted;
        }, {});
    }

    return value;
  }

  function fnv1a(value) {
    let hash = 0x811c9dc5;

    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }

    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  global.VeredaVrda = {
    createEnvelope,
    parseEnvelope,
    schemaVersion: SCHEMA_VERSION,
  };
})(window);
