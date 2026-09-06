(function massNotesEngines(global) {
  "use strict";

  function snapshot(documentRecord) {
    const plainText = String(documentRecord?.plainText || "");
    return Object.freeze({
      id: String(documentRecord?.id || ""),
      revision: Number(documentRecord?.revision) || 0,
      title: String(documentRecord?.title || "Documento sem título"),
      contentHtml: String(documentRecord?.contentHtml || ""),
      plainText,
      tags: Array.isArray(documentRecord?.tags) ? [...documentRecord.tags] : [],
      kind: String(documentRecord?.kind || "documento"),
      description: String(documentRecord?.description || ""),
      createdAt: Number(documentRecord?.createdAt) || Date.now(),
      updatedAt: Number(documentRecord?.updatedAt) || Date.now(),
      authorshipRecord: documentRecord?.authorshipRecord || null,
    });
  }

  function envelope(documentSnapshot, data, warnings = []) {
    return {
      ok: true,
      documentId: documentSnapshot.id,
      revision: documentSnapshot.revision,
      generatedAt: new Date().toISOString(),
      data,
      warnings,
    };
  }

  function failure(documentSnapshot, code, message, technicalError) {
    if (technicalError) console.error(`[Mass Notes] ${code}`, technicalError);
    return {
      ok: false,
      documentId: documentSnapshot.id,
      revision: documentSnapshot.revision,
      generatedAt: new Date().toISOString(),
      error: { code, message },
    };
  }

  function normalizeAlert(item, index) {
    if (typeof item === "string") {
      return { id: `alert-${index}`, title: item, detail: "", severity: "medium" };
    }
    const source = item && typeof item === "object" ? item : {};
    const title = source.title || source.label || source.nome || source.criterion || source.criterio || source.id || `Observação ${index + 1}`;
    const detail = source.message || source.detail || source.description || source.descricao || source.hint || source.dica || source.explanation || "";
    const rawSeverity = String(source.severity || source.level || source.prioridade || "medium").toLowerCase();
    const severity = /high|alta|grave|critical/.test(rawSeverity)
      ? "high"
      : /low|baixa|leve|info/.test(rawSeverity)
        ? "low"
        : "medium";
    return { id: String(source.id || `alert-${index}`), title: String(title), detail: String(detail), severity, raw: source };
  }

  async function runReview(documentRecord) {
    const doc = snapshot(documentRecord);
    if (!doc.plainText.trim()) return envelope(doc, { alerts: [], contextualTerms: [], criteria: null }, ["O documento está vazio."]);

    try {
      let criteria = null;
      let alerts = [];
      if (global.VeredaAnalise?.analisar) {
        criteria = global.VeredaAnalise.analisar(doc.plainText);
        if (global.VeredaAnalise.interpretarResultado) {
          const interpreted = global.VeredaAnalise.interpretarResultado(criteria);
          alerts = Array.isArray(interpreted) ? interpreted.map(normalizeAlert) : [];
        }
      }

      let contextualTerms = [];
      if (global.VeredaDecolonial?.ensureLoaded) {
        await global.VeredaDecolonial.ensureLoaded();
        if (!global.VeredaDecolonial.hasLoadError?.() && global.VeredaDecolonial.detectText) {
          contextualTerms = global.VeredaDecolonial.detectText(doc.plainText).map((entry, index) => ({
            id: `context-${index}-${entry.avoid || "term"}`,
            term: String(entry.avoid || entry.term || "Termo"),
            count: Number(entry.count) || 1,
            category: String(entry.categoryLabel || entry.category || "Contexto"),
            reason: String(entry.reason || entry.context || "Vale observar o uso no contexto do documento."),
            alternatives: Array.isArray(entry.alternatives) ? entry.alternatives.map(String) : [],
          }));
        }
      }

      const warnings = [];
      if (!global.VeredaAnalise?.analisar) warnings.push("A engine de análise geral não foi carregada.");
      if (global.VeredaDecolonial?.hasLoadError?.()) warnings.push("A base de termos contextuais não pôde ser carregada.");
      return envelope(doc, { alerts, contextualTerms, criteria }, warnings);
    } catch (error) {
      return failure(doc, "REVIEW_FAILED", "A revisão local não pôde ser concluída.", error);
    }
  }

  function rankedObjectEntries(value, max = 6) {
    if (!value) return [];
    if (Array.isArray(value)) return value.slice(0, max);
    if (typeof value === "object") {
      return Object.entries(value)
        .map(([label, raw]) => ({ label, value: typeof raw === "object" ? raw.score ?? raw.hits ?? raw.count ?? 0 : raw }))
        .sort((a, b) => Number(b.value) - Number(a.value))
        .slice(0, max);
    }
    return [];
  }

  async function runVoice(documentRecord) {
    const doc = snapshot(documentRecord);
    if (!doc.plainText.trim()) return envelope(doc, { gesture: null, fields: [], repetitions: [], exercises: [], raw: null }, ["O documento está vazio."]);
    if (!global.VeredaVoice?.analyzeComplete && !global.VeredaVoice?.analyze) {
      return failure(doc, "VOICE_UNAVAILABLE", "O Espelho de Voz não está disponível agora.");
    }

    try {
      const result = global.VeredaVoice.analyzeComplete
        ? global.VeredaVoice.analyzeComplete(doc.plainText)
        : { voice: global.VeredaVoice.analyze(doc.plainText), criterios: null, alertas: [] };
      const voice = result?.voice || result || {};
      const gesture = voice.gesture || voice.gesto || voice.dominantGesture || voice.profile || null;
      const fields = rankedObjectEntries(voice.semanticFields || voice.fields || voice.camposSemanticos || voice.emotions);
      const repetitions = Array.isArray(voice.repetitions || voice.repeticoes) ? (voice.repetitions || voice.repeticoes).slice(0, 8) : [];
      const exercises = Array.isArray(voice.exercises || voice.exercicios) ? (voice.exercises || voice.exercicios).slice(0, 4) : [];
      const reader = voice.reader || voice.readers || voice.leitor || voice.audience || null;
      return envelope(doc, { gesture, fields, repetitions, exercises, reader, raw: result });
    } catch (error) {
      return failure(doc, "VOICE_FAILED", "A leitura da voz não pôde ser concluída.", error);
    }
  }

  async function runRhyme(documentRecord) {
    const doc = snapshot(documentRecord);
    if (!doc.plainText.trim()) return envelope(doc, { isProse: true, proseNote: "O documento está vazio." });
    if (!global.VeredaRimaLab?.analyze) {
      return failure(doc, "RHYME_UNAVAILABLE", "A análise de rimas não está disponível agora.");
    }

    try {
      if (global.VeredaRimaLab.ensureLoaded) await global.VeredaRimaLab.ensureLoaded();
      if (global.VeredaRimaLab.hasLoadError?.()) {
        return failure(doc, "RHYME_DATA_FAILED", "A base de rimas não pôde ser carregada.");
      }
      return envelope(doc, global.VeredaRimaLab.analyze(doc.plainText));
    } catch (error) {
      return failure(doc, "RHYME_FAILED", "A sonoridade não pôde ser analisada.", error);
    }
  }

  function createProofRecord(existing) {
    if (!global.VeredaProof?.createRecord) return existing || null;
    try {
      return global.VeredaProof.createRecord(existing || null);
    } catch (error) {
      console.error("[Mass Notes] Não foi possível preparar o registro de autoria.", error);
      return existing || null;
    }
  }

  function recordKey(existing, keyboardEvent, timestamp = Date.now()) {
    if (!global.VeredaProof?.recordKeyEvent) return existing || null;
    try {
      return global.VeredaProof.recordKeyEvent(createProofRecord(existing), keyboardEvent, timestamp);
    } catch (error) {
      console.error("[Mass Notes] Evento de autoria ignorado.", error);
      return existing || null;
    }
  }

  function summarizeProof(existing) {
    if (!global.VeredaProof?.summarize || !global.VeredaProof?.getActiveSession) return null;
    try {
      const record = createProofRecord(existing);
      const session = global.VeredaProof.getActiveSession(record);
      return global.VeredaProof.summarize(session);
    } catch (error) {
      console.error("[Mass Notes] Resumo de autoria indisponível.", error);
      return null;
    }
  }

  async function createAuthorshipPackage(documentRecord) {
    const doc = snapshot(documentRecord);
    if (!global.VeredaProof?.createAuthorshipPackage) {
      return failure(doc, "PROOF_UNAVAILABLE", "O pacote de autoria não está disponível agora.");
    }
    try {
      const record = createProofRecord(doc.authorshipRecord);
      const manuscript = toLegacyManuscript(doc);
      return envelope(doc, await global.VeredaProof.createAuthorshipPackage(record, manuscript));
    } catch (error) {
      return failure(doc, "PROOF_FAILED", "O pacote de autoria não pôde ser criado.", error);
    }
  }

  function toLegacyManuscript(documentRecord) {
    const doc = snapshot(documentRecord);
    return {
      id: doc.id,
      title: doc.title,
      text: doc.plainText,
      contentHtml: doc.contentHtml,
      tags: doc.tags,
      kind: doc.kind,
      description: doc.description,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  function exportDocument(documentRecord, format = "txt") {
    const doc = snapshot(documentRecord);
    try {
      if (global.VeredaExport?.exportManuscript) {
        return envelope(doc, global.VeredaExport.exportManuscript(toLegacyManuscript(doc), format));
      }
      if (format !== "txt") return failure(doc, "EXPORT_UNAVAILABLE", "Este formato ainda não está disponível no experimento.");
      return envelope(doc, {
        content: `${doc.title}\n\n${doc.plainText}`,
        filename: `${slugify(doc.title)}.txt`,
        mimeType: "text/plain;charset=utf-8",
        binary: false,
      }, ["Foi usado o exportador básico do experimento."]);
    } catch (error) {
      return failure(doc, "EXPORT_FAILED", "O documento não pôde ser exportado.", error);
    }
  }

  function slugify(value) {
    return String(value || "documento")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "documento";
  }

  function availability() {
    return {
      review: Boolean(global.VeredaAnalise?.analisar),
      voice: Boolean(global.VeredaVoice?.analyzeComplete || global.VeredaVoice?.analyze),
      rhyme: Boolean(global.VeredaRimaLab?.analyze),
      decolonial: Boolean(global.VeredaDecolonial?.detectText),
      proof: Boolean(global.VeredaProof?.createRecord),
      export: Boolean(global.VeredaExport?.exportManuscript),
      pagination: Boolean(global.VeredaPagination?.render),
    };
  }

  global.MassNotesEngines = {
    snapshot,
    runReview,
    runVoice,
    runRhyme,
    createProofRecord,
    recordKey,
    summarizeProof,
    createAuthorshipPackage,
    exportDocument,
    toLegacyManuscript,
    availability,
  };
})(window);
