(function proofEngine(global) {
  const MIN_ORGANIC_INTERVAL = 30;
  const MAX_ORGANIC_INTERVAL = 2000;
  const MAX_EVENTS = 1200;
  const MAX_SESSIONS = 24;

  function createRecord(existingRecord) {
    if (Array.isArray(existingRecord?.sessions)) {
      const sessions = existingRecord.sessions.map(createSession).slice(0, MAX_SESSIONS);
      const fallbackSession = sessions[0] || createSession();
      const activeSessionId = sessions.some((session) => session.id === existingRecord.activeSessionId)
        ? existingRecord.activeSessionId
        : fallbackSession.id;

      return {
        activeSessionId,
        sessions: sessions.length ? sessions : [fallbackSession],
      };
    }

    if (Array.isArray(existingRecord?.events) || existingRecord?.startedAt) {
      const legacySession = createSession(existingRecord);
      return {
        activeSessionId: legacySession.id,
        sessions: [legacySession],
      };
    }

    const firstSession = createSession();
    return {
      activeSessionId: firstSession.id,
      sessions: [firstSession],
    };
  }

  function createSession(existingSession) {
    const startedAt = existingSession?.startedAt || new Date().toISOString();

    return {
      id: existingSession?.id || createSessionId(startedAt),
      name: existingSession?.name || createSessionName(startedAt),
      startedAt,
      updatedAt: existingSession?.updatedAt || startedAt,
      lastEventAt: existingSession?.lastEventAt || null,
      events: Array.isArray(existingSession?.events) ? existingSession.events : [],
    };
  }

  function getActiveSession(record) {
    const safeRecord = createRecord(record);
    return safeRecord.sessions.find((session) => session.id === safeRecord.activeSessionId) || safeRecord.sessions[0];
  }

  function startSession(record, name, timestamp = Date.now()) {
    const safeRecord = createRecord(record);
    const startedAt = new Date(timestamp).toISOString();
    const nextSession = createSession({
      id: createSessionId(startedAt),
      name: name || createSessionName(startedAt),
      startedAt,
      updatedAt: startedAt,
    });

    return {
      activeSessionId: nextSession.id,
      sessions: [nextSession, ...safeRecord.sessions].slice(0, MAX_SESSIONS),
    };
  }

  function recordStructuralEvent(record, type, wordDelta, timestamp = Date.now()) {
    const safeRecord = createRecord(record);
    const activeSession = getActiveSession(safeRecord);
    const nextSession = createSession(activeSession);

    nextSession.lastEventAt = timestamp;
    nextSession.updatedAt = new Date(timestamp).toISOString();
    nextSession.events.push({
      at: nextSession.updatedAt,
      interval: null,
      trusted: true,
      organic: false,
      keyType: `structural:${type}`,
      wordDelta: wordDelta || 0,
    });

    if (nextSession.events.length > MAX_EVENTS) {
      nextSession.events = nextSession.events.slice(nextSession.events.length - MAX_EVENTS);
    }

    return {
      activeSessionId: nextSession.id,
      sessions: safeRecord.sessions.map((session) => (session.id === nextSession.id ? nextSession : session)),
    };
  }

  function recordKeyEvent(record, keyboardEvent, timestamp = Date.now()) {
    const safeRecord = createRecord(record);
    const activeSession = getActiveSession(safeRecord);
    const nextSession = recordKeyEventInSession(activeSession, keyboardEvent, timestamp);

    return {
      activeSessionId: nextSession.id,
      sessions: safeRecord.sessions.map((session) => (session.id === nextSession.id ? nextSession : session)),
    };
  }

  function recordKeyEventInSession(session, keyboardEvent, timestamp = Date.now()) {
    const nextSession = createSession(session);
    const interval = nextSession.lastEventAt ? timestamp - nextSession.lastEventAt : null;
    const isTrusted = keyboardEvent.isTrusted === true;
    const isOrganic = Boolean(
      isTrusted &&
        interval !== null &&
        interval >= MIN_ORGANIC_INTERVAL &&
        interval <= MAX_ORGANIC_INTERVAL
    );

    nextSession.lastEventAt = timestamp;
    nextSession.updatedAt = new Date(timestamp).toISOString();
    nextSession.events.push({
      at: nextSession.updatedAt,
      interval,
      trusted: isTrusted,
      organic: isOrganic,
      keyType: classifyKey(keyboardEvent),
    });

    if (nextSession.events.length > MAX_EVENTS) {
      nextSession.events = nextSession.events.slice(nextSession.events.length - MAX_EVENTS);
    }

    return nextSession;
  }

  function summarize(session) {
    const safeSession = createSession(session);
    const measuredEvents = safeSession.events.filter((event) => event.interval !== null);
    const organicEvents = measuredEvents.filter((event) => event.organic);
    const rejectedEvents = measuredEvents.length - organicEvents.length;
    const organicIntervals = organicEvents.map((event) => event.interval);
    const averageInterval = average(organicIntervals);
    const cadenceWpm = averageInterval ? Math.round(60000 / averageInterval / 5) : 0;
    const integrity = measuredEvents.length ? Math.round((organicEvents.length / measuredEvents.length) * 100) : 0;

    const startMs = safeSession.startedAt ? new Date(safeSession.startedAt).getTime() : 0;
    const endMs = safeSession.updatedAt ? new Date(safeSession.updatedAt).getTime() : startMs;
    const durationMin = startMs && endMs > startMs ? Math.round((endMs - startMs) / 60000) : 0;

    return {
      startedAt: safeSession.startedAt,
      updatedAt: safeSession.updatedAt,
      totalEvents: safeSession.events.length,
      measuredEvents: measuredEvents.length,
      organicEvents: organicEvents.length,
      rejectedEvents,
      averageInterval,
      cadenceWpm,
      integrity,
      durationMin,
      status: integrity >= 80 ? "Sólida" : integrity >= 50 ? "Em formação" : "Aguardando escrita",
    };
  }

  async function createAuthorshipPackage(record, manuscript) {
    const proof = await createProofDocument(record, manuscript);
    return {
      format: "escrevaral.autoria.v1",
      generatedAt: proof.generatedAt,
      author: {
        domain: "escrevaral.com",
        produto: "Escrevaral",
      },
      manuscript: proof.manuscript,
      session: proof.session,
      summary: proof.summary,
    };
  }

  async function createProofDocument(record, manuscript) {
    const session = getActiveSession(record);
    const summary = summarize(session);
    const textHash = await sha256(manuscript.text || "");
    const totalSessions = (record?.sessions || []).length;

    return {
      format: "vereda.proof.v2",
      generator: {
        app: "Escrevaral",
        url: "https://escrevaral.com",
      },
      generatedAt: new Date().toISOString(),
      rule: {
        trustedEventsOnly: true,
        organicIntervalMs: [MIN_ORGANIC_INTERVAL, MAX_ORGANIC_INTERVAL],
        storesLiteralKeys: false,
      },
      session: {
        id: session.id,
        name: session.name,
        startedAt: session.startedAt,
        updatedAt: session.updatedAt,
        durationMin: summary.durationMin,
        totalSessions,
      },
      manuscript: {
        id: manuscript.id,
        title: manuscript.title,
        kind: manuscript.kind || "manuscrito",
        textHash,
        wordCount: countWords(manuscript.text || ""),
      },
      summary,
      events: createSession(session).events,
    };
  }

  function createSessionId(startedAt) {
    const slug = startedAt.replace(/\D/g, "") || String(Date.now());
    return `proof-session-${slug}`;
  }

  function createSessionName(startedAt) {
    const date = new Date(startedAt);
    if (Number.isNaN(date.getTime())) return "Sessão sem data";

    const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return `Sessão de hoje — ${time}`;
    if (isYesterday) return `Sessão de ontem — ${time}`;
    if (date.getFullYear() === now.getFullYear()) {
      const d = date.toLocaleDateString("pt-BR", { day: "numeric", month: "numeric" });
      return `Sessão de ${d} — ${time}`;
    }
    return `Sessão de ${date.toLocaleDateString("pt-BR")} — ${time}`;
  }

  function classifyKey(keyboardEvent) {
    if (keyboardEvent.key === "Backspace" || keyboardEvent.key === "Delete") {
      return "erase";
    }

    if (keyboardEvent.key === "Enter") {
      return "line-break";
    }

    if (keyboardEvent.key === " ") {
      return "space";
    }

    if (keyboardEvent.key?.length === 1) {
      return "character";
    }

    return "control";
  }

  function average(values) {
    if (!values.length) {
      return 0;
    }

    return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
  }

  async function sha256(value) {
    if (global.crypto?.subtle) {
      const encoded = new TextEncoder().encode(value);
      const hashBuffer = await global.crypto.subtle.digest("SHA-256", encoded);
      return Array.from(new Uint8Array(hashBuffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    }

    return fallbackHash(value);
  }

  function fallbackHash(value) {
    let hash = 0x811c9dc5;

    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }

    return `fallback-${(hash >>> 0).toString(16).padStart(8, "0")}`;
  }

  function countWords(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }

  global.VeredaProof = {
    createRecord,
    createSession,
    createProofDocument,
    createAuthorshipPackage,
    getActiveSession,
    recordKeyEvent,
    recordStructuralEvent,
    summarize,
    startSession,
  };
})(window);
