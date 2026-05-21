(function versionEngine(global) {
  const MAX_VERSIONS_PER_MANUSCRIPT = 12;
  const MIN_TEXT_DELTA = 80;

  function createSnapshot(manuscript, reason = "Snapshot manual") {
    return {
      id: `version-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      manuscriptId: manuscript.id,
      title: manuscript.title,
      type: manuscript.type || "manuscrito",
      kind: manuscript.kind,
      status: manuscript.status,
      chapter: manuscript.chapter,
      progress: manuscript.progress,
      description: manuscript.description,
      text: manuscript.text,
      reason,
      createdAt: new Date().toISOString(),
      wordCount: countWords(manuscript.text || ""),
      charCount: (manuscript.text || "").length,
    };
  }

  function shouldCreateAutoSnapshot(versions, manuscript) {
    const latest = getVersionsForManuscript(versions, manuscript.id)[0];

    if (!latest) {
      return true;
    }

    const textDelta = Math.abs((manuscript.text || "").length - latest.charCount);
    return textDelta >= MIN_TEXT_DELTA;
  }

  function addSnapshot(versions, manuscript, reason) {
    const snapshot = createSnapshot(manuscript, reason);
    const nextVersions = {
      ...versions,
      [manuscript.id]: [snapshot, ...getVersionsForManuscript(versions, manuscript.id)].slice(0, MAX_VERSIONS_PER_MANUSCRIPT),
    };

    return {
      versions: nextVersions,
      snapshot,
    };
  }

  function getVersionsForManuscript(versions, manuscriptId) {
    return Array.isArray(versions?.[manuscriptId]) ? versions[manuscriptId] : [];
  }

  function restoreSnapshot(manuscript, snapshot) {
    return {
      ...manuscript,
      title: snapshot.title,
      type: snapshot.type || manuscript.type || "manuscrito",
      kind: snapshot.kind,
      status: snapshot.status,
      chapter: snapshot.chapter,
      progress: snapshot.progress,
      description: snapshot.description,
      text: snapshot.text,
      updatedAt: new Date().toISOString(),
    };
  }

  function countWords(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }

  global.VeredaVersions = {
    addSnapshot,
    getVersionsForManuscript,
    restoreSnapshot,
    shouldCreateAutoSnapshot,
  };
})(window);
