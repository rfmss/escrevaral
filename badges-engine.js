(function VeredaBadgesEngine(global) {

  const BADGES = {
    "folha-em-branco": {
      id: "folha-em-branco",
      label: "Folha em branco",
      icon: "draft",
      description: "Primeiro texto criado nesta oficina.",
    },
  };

  async function generateFingerprint(manuscriptId, createdAt, badgeId) {
    try {
      const raw = [manuscriptId, createdAt || "", badgeId].join("|");
      const encoded = new TextEncoder().encode(raw);
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
      const hex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const prefix = badgeId.replace(/[^a-z]/gi, "").substring(0, 3).toUpperCase();
      return `VRDA-${prefix}-${hex.substring(0, 4).toUpperCase()}-${hex.substring(4, 8).toUpperCase()}`;
    } catch {
      return null;
    }
  }

  async function earnBadge(manuscript, badgeId, mode) {
    if (!BADGES[badgeId]) return manuscript;
    if (manuscript.badges && manuscript.badges[badgeId]) return manuscript;

    const now = new Date().toISOString();
    const fingerprint = await generateFingerprint(
      manuscript.id,
      manuscript.createdAt || now,
      badgeId
    );

    return {
      ...manuscript,
      badges: {
        ...(manuscript.badges || {}),
        [badgeId]: {
          earnedAt: now,
          recognizedAt: now,
          mode: mode || "native",
          wordCountAtEarned: countWords(manuscript.text || ""),
          algorithmVersion: 1,
          fingerprint,
        },
      },
    };
  }

  function hasBadge(manuscript, badgeId) {
    return !!(manuscript.badges && manuscript.badges[badgeId]);
  }

  function renderBadgeChips(manuscript) {
    if (!manuscript.badges) return "";
    const earned = Object.keys(manuscript.badges).filter((id) => BADGES[id]);
    if (!earned.length) return "";

    return earned
      .map((id) => {
        const def = BADGES[id];
        const data = manuscript.badges[id];
        const modeNote =
          data.mode === "retroactive" ? " · reconhecida ao importar" : "";
        const dateStr = data.earnedAt
          ? new Date(data.earnedAt).toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })
          : "";
        return `<span class="badge-chip" title="${escapeHtml(def.description)}${escapeHtml(modeNote)}">
          <span class="material-symbols-outlined" aria-hidden="true">${def.icon}</span>${escapeHtml(def.label)}${dateStr ? ` <em>${escapeHtml(dateStr)}</em>` : ""}
        </span>`;
      })
      .join("");
  }

  global.VeredaBadges = { earnBadge, hasBadge, renderBadgeChips };
})(window);
