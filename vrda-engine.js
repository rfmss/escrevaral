(function vrdaEngine(global) {
  const FORMAT = "esc";
  const FORMAT_LEGACY = "vrda";
  const SCHEMA_VERSION = 1;
  const CREATED_WITH = ".esc - editor";

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
      throw new Error("Arquivo .esc com assinatura inválida.");
    }

    return envelope;
  }

  function validateEnvelope(envelope) {
    if (!envelope || typeof envelope !== "object") {
      throw new Error("Arquivo .esc ilegível.");
    }

    if (envelope.format !== FORMAT && envelope.format !== FORMAT_LEGACY) {
      throw new Error("Este arquivo não é um .esc válido.");
    }

    if (envelope.schemaVersion !== SCHEMA_VERSION) {
      const v = envelope.schemaVersion;
      if (v && v > SCHEMA_VERSION) {
        throw new Error(`Este arquivo foi exportado por uma versão mais nova do Escrevaral. Atualize o aplicativo para abri-lo.`);
      }
      throw new Error(`Formato antigo (versão ${v || "desconhecida"}). Tente exportar novamente pelo Escrevaral.`);
    }

    if (!envelope.payload || typeof envelope.payload !== "object") {
      throw new Error("Arquivo .esc sem conteúdo.");
    }

    if (!Array.isArray(envelope.payload.manuscripts) || envelope.payload.manuscripts.length === 0) {
      throw new Error("Arquivo .esc sem manuscritos válidos.");
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
