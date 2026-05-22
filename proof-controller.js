// proof-controller.js — prova de autoria, versões e metas de escrita
// Depende de: state-store.js, proof-engine.js, version-engine.js

function getActiveProofRecord() {
  const manuscript = getActiveManuscript();

  if (!isManuscriptDocument(manuscript)) {
    return null;
  }

  const record = VeredaProof.createRecord(state.proofs[manuscript.id]);
  state.proofs[manuscript.id] = record;
  return record;
}

function getActiveProofSession() {
  const record = getActiveProofRecord();
  return record ? VeredaProof.getActiveSession(record) : null;
}

function ensureInitialVersion(manuscript) {
  if (!isManuscriptDocument(manuscript)) {
    return;
  }

  if (VeredaVersions.getVersionsForManuscript(state.versions, manuscript.id).length > 0) {
    return;
  }

  const result = VeredaVersions.addSnapshot(state.versions, manuscript, "Primeira versão local");
  state.versions = result.versions;
}

function maybeCreateAutoVersion(manuscript) {
  if (!isManuscriptDocument(manuscript)) {
    return;
  }

  if (!VeredaVersions.shouldCreateAutoSnapshot(state.versions, manuscript)) {
    return;
  }

  const result = VeredaVersions.addSnapshot(state.versions, manuscript, "Auto-save relevante");
  state.versions = result.versions;
  renderVersionList();
}

function createManualVersion() {
  const manuscript = getActiveManuscript();

  if (!isManuscriptDocument(manuscript)) {
    saveStatus.textContent = "Versões ficam disponíveis apenas para manuscritos";
    renderVersionList();
    return;
  }

  const result = VeredaVersions.addSnapshot(state.versions, manuscript, "Versão manual");
  state.versions = result.versions;
  renderVersionList();
  persistState("Versão criada");
}

function restoreVersion(versionId) {
  const manuscript = getActiveManuscript();

  if (!isManuscriptDocument(manuscript)) {
    return;
  }

  const snapshot = VeredaVersions.getVersionsForManuscript(state.versions, manuscript.id).find(
    (version) => version.id === versionId
  );

  if (!snapshot) {
    return;
  }

  const restoredManuscript = VeredaVersions.restoreSnapshot(manuscript, snapshot);
  updateActiveManuscript(restoredManuscript);
  renderActiveManuscript();
  renderManuscriptNavigation();
  renderProjectGrid();
  renderMetadataForm();
  renderLexicalView();
  renderProofView();
  renderTemplateReference();
  renderVersionList();
  persistState("Versão restaurada");
}

function recordWritingProof(event) {
  if (!isManuscriptDocument() || event.isComposing) return;
  const manuscript = getActiveManuscript();
  if (!manuscript) return;

  // Eventos estruturais — Ctrl/Meta + tecla
  if (event.ctrlKey || event.metaKey) {
    const key = event.key.toLowerCase();
    const typeMap = { v:"paste", z:"undo", y:"redo", x:"cut", c:null, a:null };
    const evType = typeMap[key];
    if (evType) {
      state.proofs[manuscript.id] = VeredaProof.recordStructuralEvent(getActiveProofRecord(), evType);
      renderProofView();
      queueSave();
    }
    return;
  }

  if (event.altKey) return;

  // Primeira digitação — comunica proteção local sem roubar atenção
  const _rec = getActiveProofRecord();
  const _isFirst = !_rec || !(_rec.sessions?.some(s => s.events?.length > 0));
  if (_isFirst) {
    saveStatus.textContent = "Sinais de autoria guardados aqui";
    setTimeout(() => {
      if (saveStatus.textContent === "Sinais de autoria guardados aqui") {
        saveStatus.textContent = "Pronto para escrever";
      }
    }, 3000);
  }

  state.proofs[manuscript.id] = VeredaProof.recordKeyEvent(getActiveProofRecord(), event);
  renderProofView();
  queueSave();
}

// Eventos estruturais via clipboard API (paste com botão direito, menu)
function recordClipboardProof(type) {
  if (!isManuscriptDocument()) return;
  const manuscript = getActiveManuscript();
  if (!manuscript) return;
  const wordsBefore = countWords(writingArea.innerText || "");
  // Delta calculado após o evento processar (próximo tick)
  setTimeout(() => {
    const wordsAfter = countWords(writingArea.innerText || "");
    state.proofs[manuscript.id] = VeredaProof.recordStructuralEvent(
      getActiveProofRecord(), type, wordsAfter - wordsBefore
    );
    renderProofView();
    queueSave();
  }, 50);
}

function renderProofView() {
  const session = getActiveProofSession();

  if (!session) {
    proofSessionName.textContent = "Nenhum manuscrito ativo";
    proofIntegrity.textContent = "—";
    proofStatus.textContent = "Abra um manuscrito no editor para iniciar o registro";
    proofOrganic.textContent = "—";
    proofRejected.textContent = "";
    proofCadence.textContent = "—";
    proofTimeline.innerHTML = "";
    const grid = document.querySelector(".certificate-grid");
    if (grid) grid.classList.add("is-empty");
    return;
  }

  const summary = VeredaProof.summarize(session);
  const recentEvents = session.events.slice(-4).reverse();

  proofSessionName.textContent = session.name;
  proofIntegrity.textContent = summary.integrity > 0 ? `${summary.integrity}%` : "Aguardando sua escrita";

  const grid = document.querySelector(".certificate-grid");
  if (grid) grid.classList.toggle("is-empty", summary.totalEvents === 0);

  // Atualiza chip da topbar
  const chip = document.querySelector("[data-proof-chip]");
  const chipValue = document.querySelector("[data-proof-chip-value]");
  if (chip && summary.totalEvents > 0 && summary.integrity > 0) {
    chip.hidden = false;
    if (chipValue) chipValue.textContent = `${summary.integrity}%`;
    chip.dataset.level = summary.integrity >= 80 ? "high" : summary.integrity >= 50 ? "medium" : "low";
  } else if (chip) {
    chip.hidden = true;
  }

  proofStatus.textContent = summary.status || "Escreva no editor para iniciar o registro";
  proofOrganic.textContent = summary.organicEvents;
  document.querySelector("[data-proof-rejected]") && (document.querySelector("[data-proof-rejected]").textContent = `${summary.rejectedEvents} ignorados`);

  // Ritmo médio — sem travessão vazio
  const cadenceEl = document.querySelector("[data-proof-cadence]");
  const cadenceHintEl = document.querySelector("[data-proof-cadence-hint]");
  if (cadenceEl) cadenceEl.textContent = summary.cadenceWpm > 0 ? `${summary.cadenceWpm} palavras/min` : "—";
  if (cadenceHintEl) cadenceHintEl.textContent = summary.cadenceWpm > 0 ? "Ritmo orgânico registrado" : "Comece a escrever para calcular";

  // Info de sessão
  const sessionInfo = document.querySelector("[data-proof-session-info]");
  if (sessionInfo && session.startedAt) {
    const started = new Date(session.startedAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
    sessionInfo.textContent = `Iniciada às ${started} · ${summary.organicEvents} movimentos`;
  }

  // Critérios mínimos
  const ms = getActiveManuscript();
  const hasText = (ms?.text?.trim().length || 0) > 0;
  const hasEvents = summary.organicEvents > 0;
  const criteriaEl = document.querySelector("[data-proof-criteria]");
  if (criteriaEl) {
    criteriaEl.hidden = hasText && hasEvents; // ocultar quando já atende
    criteriaEl.querySelectorAll("li[data-criteria]").forEach(li => {
      const met = li.dataset.criteria === "text" ? hasText
                : li.dataset.criteria === "events" ? hasEvents
                : hasText && hasEvents;
      li.classList.toggle("is-met", met);
      li.querySelector(".material-symbols-outlined").textContent = met ? "check_circle" : "radio_button_unchecked";
    });
  }

  // Botão exportar: guiado quando não há condições mínimas
  const exportBtn = document.querySelector("[data-proof-export-btn]");
  if (exportBtn) {
    const canExport = hasText && hasEvents;
    exportBtn.disabled = !canExport;
    exportBtn.title = canExport ? "Gerar arquivo de evidência" : "Escreva no editor para ativar";
    exportBtn.style.opacity = canExport ? "" : "0.5";
    exportBtn.style.cursor = canExport ? "" : "not-allowed";
  }

  if (!recentEvents.length) {
    proofTimeline.innerHTML = "<div><span></span><p>Aguardando movimentos de escrita no editor.</p></div>";
    return;
  }

  proofTimeline.innerHTML = recentEvents
    .map((event) => {
      const time = formatTimeWithSeconds(event.at);
      const isStructural = event.keyType?.startsWith("structural:");
      const structType = isStructural ? event.keyType.replace("structural:","") : null;
      const label = structType
        ? `ação: ${structType}${event.wordDelta ? ` (Δ${event.wordDelta > 0 ? "+" : ""}${event.wordDelta} pal)` : ""}`
        : event.organic ? "movimento orgânico" : "movimento descartado";
      const interval = event.interval === null ? "início" : `${event.interval}ms`;

      return `<div><span></span><p>${time} — ${label} · ${interval}</p></div>`;
    })
    .join("");
}

function startNewProofSession() {
  const manuscript = getActiveManuscript();

  if (!isManuscriptDocument(manuscript)) {
    saveStatus.textContent = "Prova de autoria só para manuscritos";
    renderProofView();
    return;
  }

  state.proofs[manuscript.id] = VeredaProof.startSession(getActiveProofRecord());
  renderProofView();
  persistState("Nova sessão de autoria");
}

function renderVersionList() {
  const manuscript = getActiveManuscript();

  if (!isManuscriptDocument(manuscript)) {
    versionList.innerHTML = '<p class="muted">Versões ficam disponíveis apenas para manuscritos. Notas de suporte acompanham o acervo e o backup.</p>';
    return;
  }

  const versions = VeredaVersions.getVersionsForManuscript(state.versions, manuscript.id);

  if (!versions.length) {
    versionList.innerHTML = '<p class="muted">Nenhuma versão salva ainda.</p>';
    return;
  }

  versionList.innerHTML = versions
    .map((version) => {
      const createdAt = new Date(version.createdAt).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      return `
        <article class="version-item">
          <div>
            <strong>${escapeHtml(version.reason)}</strong>
            <span>${createdAt} · ${version.wordCount} palavras</span>
          </div>
          <button class="secondary-button" data-version-restore="${version.id}">Restaurar</button>
        </article>
      `;
    })
    .join("");
}

async function exportProof() {
  const manuscript = getActiveManuscript();

  if (!isManuscriptDocument(manuscript)) {
    saveStatus.textContent = "Prova de autoria só para manuscritos";
    renderProofView();
    return;
  }

  const proofDocument = await VeredaProof.createProofDocument(getActiveProofRecord(), manuscript);
  const proofJson = JSON.stringify(proofDocument, null, 2);
  downloadFile(proofJson, `${slugify(manuscript.title)}-${slugify(proofDocument.session.name)}.prova.vrda`, "application/json");
  saveStatus.textContent = "Cópia de autoria guardada";
}

function updateGoalDisplay(wordCount) {
  const bar    = document.querySelector("[data-goal-bar]");
  const fill   = document.querySelector("[data-goal-bar-fill]");
  const label  = document.querySelector("[data-goal-label]");
  const setBtn = document.querySelector("[data-goal-set-btn]");
  if (!bar) return;

  if (wordGoal <= 0) {
    bar.hidden = true;
    if (setBtn) setBtn.style.opacity = "0.4";
    return;
  }

  bar.hidden = false;
  if (setBtn) setBtn.style.opacity = "1";
  const pct = Math.min(100, Math.round((wordCount / wordGoal) * 100));
  if (fill) fill.style.width = pct + "%";
  if (label) label.textContent = `${wordCount} / ${wordGoal} palavras`;

  const reached = wordCount >= wordGoal;
  if (fill) fill.style.background = reached ? "var(--primary)" : "color-mix(in srgb, var(--primary) 60%, transparent)";

  if (reached && !goalCelebrated) { goalCelebrated = true; shootConfetti(); }
  if (!reached) goalCelebrated = false;
}

function promptWordGoal() {
  const current = wordGoal > 0 ? String(wordGoal) : "";
  vrdaPrompt("Meta de palavras para hoje (0 para remover):", current, (val) => {
    if (val === null) return;
    wordGoal = Math.max(0, parseInt(val) || 0);
    localStorage.setItem(WORD_GOAL_KEY, wordGoal);
    goalCelebrated = false;
    const words = countWords(getActiveManuscript()?.text || writingArea.innerText || "");
    updateGoalDisplay(words);
  });
}

// ── SONS AMBIENTE ────────────────────────────────────
const AUDIO_TRACKS = [
  { id:"rain",  name:"Chuva suave",    icon:"cloudy_snowing", url:"https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3" },
  { id:"fire",  name:"Lareira",        icon:"local_fire_department", url:"https://cdn.pixabay.com/download/audio/2022/02/07/audio_67758ea7a5.mp3" },
  { id:"cafe",  name:"Cafeteria",      icon:"coffee",         url:"https://cdn.pixabay.com/download/audio/2021/08/09/audio_8e7f10b784.mp3" },
  { id:"waves", name:"Ondas do mar",   icon:"waves",          url:"https://cdn.pixabay.com/download/audio/2021/08/09/audio_24da1c4b7b.mp3" },
];

let audioEl = new Audio();
audioEl.loop = true;
let activeTrackId = null;

function showProofValidation(ok, lines) {
  if (!proofValidationResult) return;
  proofValidationResult.hidden = false;
  proofValidationResult.className = `proof-validation-result ${ok ? "is-ok" : "is-fail"}`;
  // Veredito na frente, detalhes depois
  const veredito = ok
    ? "Este arquivo combina com o texto atual."
    : "Este arquivo não confere com o texto atual ou apresenta divergências.";
  const details = lines.map(l => `<p class="proof-detail">${escapeHtml(l)}</p>`).join("");
  proofValidationResult.innerHTML = `<p class="proof-veredito">${escapeHtml(veredito)}</p>${details}`;
}

async function validateProofFile(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const lines = [];
    let ok = true;

    // Formato — vereda.proof.v2 é o formato atual
    const format = data.format || data.envelope;
    if (format && (format.includes("proof") || format.includes("vereda"))) {
      lines.push(`✓ Formato: ${format}`);
    } else {
      lines.push("⚠ Formato não reconhecido como arquivo de autoria Vereda");
    }

    // Título — data.manuscript.title no formato v2
    const title = data.manuscript?.title || data.manuscriptTitle || data.title;
    if (title) lines.push(`✓ Manuscrito: "${title}"`);

    // Data — generatedAt (v2) ou exportedAt/createdAt
    const generatedAt = data.generatedAt || data.exportedAt || data.createdAt;
    if (generatedAt) lines.push(`✓ Gerado em: ${new Date(generatedAt).toLocaleString("pt-BR")}`);

    // Sessão
    if (data.session?.name) lines.push(`✓ Sessão: ${data.session.name}`);

    // Hash — data.manuscript.textHash no formato v2
    const hash = data.manuscript?.textHash || data.textHash || data.hash;
    if (hash) {
      lines.push(`✓ Assinatura do texto guardada: ${String(hash).slice(0, 20)}…`);
      const ms = getActiveManuscript();
      if (ms?.text) {
        const encoder = new TextEncoder();
        const buf = await crypto.subtle.digest("SHA-256", encoder.encode(ms.text));
        const currentHash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
        if (currentHash === hash) {
          lines.push("✓ Hash confere com o manuscrito ativo");
        } else {
          lines.push("⚠ Hash diferente — texto foi alterado desde o registro");
          ok = false;
        }
      } else {
        lines.push("— Nenhum texto aberto para comparar a assinatura");
      }
    } else {
      lines.push("⚠ Hash não encontrado no arquivo");
      ok = false;
    }

    // Eventos orgânicos
    const organic = data.summary?.organicCount ?? data.events?.filter(e => e?.trusted)?.length;
    if (organic != null) lines.push(`✓ Eventos orgânicos: ${organic}`);

    // Palavras
    const wc = data.manuscript?.wordCount;
    if (wc) lines.push(`✓ Palavras no registro: ${wc}`);

    lines.push(ok ? "— Cópia pronta para guardar." : "— A cópia tem diferenças em relação ao texto atual.");
    showProofValidation(ok, lines);
    persistState("Autoria validada");
  } catch(e) {
    showProofValidation(false, ["✗ Não foi possível ler o arquivo.", "Verifique se é um arquivo .prova.vrda exportado pelo Vereda."]);
  }
}

if (proofValidateInput) {
  proofValidateInput.addEventListener("change", (e) => {
    validateProofFile(e.target.files[0]);
    e.target.value = "";
  });
}

window.VeredaProofController = { init: true }; // âncora de boot

