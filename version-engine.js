(function versionEngine(global) {
  const MAX_VERSIONS_PER_MANUSCRIPT = 20;
  const MIN_TEXT_DELTA = 80;

  function createSnapshot(manuscript, reason = "Versão manual") {
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

  // Resumo da diferença entre dois textos (palavra e caractere)
  function summarizeDiff(textBefore, textAfter) {
    const wBefore = countWords(textBefore || "");
    const wAfter  = countWords(textAfter  || "");
    const cBefore = (textBefore || "").length;
    const cAfter  = (textAfter  || "").length;
    const wDelta  = wAfter - wBefore;
    const cDelta  = cAfter - cBefore;

    // Primeira frase que mudou (parágrafo-level diff)
    const parasB = (textBefore || "").split(/\n+/).map(s => s.trim()).filter(Boolean);
    const parasA = (textAfter  || "").split(/\n+/).map(s => s.trim()).filter(Boolean);
    let firstChange = null;
    for (let i = 0; i < Math.max(parasB.length, parasA.length); i++) {
      if (parasB[i] !== parasA[i]) {
        firstChange = (parasA[i] || parasB[i] || "").slice(0, 80);
        break;
      }
    }

    return { wordsBefore: wBefore, wordsAfter: wAfter, wordsDelta: wDelta, charDelta: cDelta, firstChange };
  }

  const MILESTONES = [100, 500, 1000, 2000, 5000, 10000];

  function checkMilestone(versions, manuscript) {
    const words = countWords(manuscript.text || "");
    const latest = getVersionsForManuscript(versions, manuscript.id)[0];
    const prevWords = latest ? (latest.wordCount || 0) : 0;
    for (const m of MILESTONES) {
      if (prevWords < m && words >= m) {
        return `Marco: ${m.toLocaleString("pt-BR")} palavra${m === 1 ? "" : "s"}`;
      }
    }
    return null;
  }

  global.VeredaVersions = {
    addSnapshot,
    getVersionsForManuscript,
    restoreSnapshot,
    shouldCreateAutoSnapshot,
    checkMilestone,
    summarizeDiff,
  };
})(window);
