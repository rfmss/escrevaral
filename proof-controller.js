// proof-controller.js — prova de autoria, versões e metas de escrita
// Depende de: state-store.js, proof-engine.js, version-engine.js

// ── ASSINATURA DA AUTORA ──────────────────────────────
function renderProofAuthorSection() {
  const form  = document.querySelector("[data-proof-author-form]");
  const badge = document.querySelector("[data-proof-author-badge]");
  if (!form || !badge) return;

  const author = state.proofAuthor;
  const isSigned = !!(author?.name);

  form.hidden  = isSigned;
  badge.hidden = !isSigned;

  if (isSigned) {
    const display = document.querySelector("[data-proof-author-display]");
    const dateEl  = document.querySelector("[data-proof-author-date]");
    if (display) {
      display.textContent = author.artisticName
        ? `${author.name} · ${author.artisticName}`
        : author.name;
    }
    if (dateEl && author.signedAt) {
      dateEl.textContent = new Date(author.signedAt)
        .toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
    }
  }
}

function signProofAuthor() {
  const nameInput     = document.querySelector("[data-proof-author-name]");
  const artisticInput = document.querySelector("[data-proof-author-artistic]");
  const name     = nameInput?.value.trim() || "";
  const artistic = artisticInput?.value.trim() || "";

  if (!name) {
    nameInput?.focus();
    nameInput?.classList.add("proof-input-error");
    setTimeout(() => nameInput?.classList.remove("proof-input-error"), 1200);
    return;
  }

  state.proofAuthor = {
    name,
    artisticName: artistic,
    signedAt: new Date().toISOString(),
  };
  persistState("Assinatura registrada");

  // Animação de "tatuar"
  const form = document.querySelector("[data-proof-author-form]");
  if (form) {
    form.classList.add("proof-author-tattooing");
    setTimeout(() => {
      form.classList.remove("proof-author-tattooing");
      renderProofAuthorSection();
    }, 600);
  }
}

function resetProofAuthor() {
  state.proofAuthor = { name: "", artisticName: "", signedAt: "" };
  persistState("Assinatura removida");
  renderProofAuthorSection();
  setTimeout(() => document.querySelector("[data-proof-author-name]")?.focus(), 100);
}

function buildDeclaration() {
  const a = state.proofAuthor;
  if (!a?.name) return null;
  const datePT = new Date(a.signedAt || new Date())
    .toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  return {
    author:      a.name,
    artisticName: a.artisticName || "",
    statement:   `Este texto foi criado por ${a.name}${a.artisticName ? ` (${a.artisticName})` : ""} e registrado pelo Escrevaral em ${datePT}. A autoria pertence a quem assina este arquivo e é sustentada pelo padrão de digitação aqui registrado.`,
    signedAt:    a.signedAt,
  };
}

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
  if (!isManuscriptDocument(manuscript)) return;

  const milestoneReason = VeredaVersions.checkMilestone(state.versions, manuscript);
  if (milestoneReason) {
    const result = VeredaVersions.addSnapshot(state.versions, manuscript, milestoneReason);
    state.versions = result.versions;
    renderVersionList();
    saveStatus.textContent = `✓ ${milestoneReason} — versão salva`;
    return;
  }

  if (!VeredaVersions.shouldCreateAutoSnapshot(state.versions, manuscript)) return;

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

function exportVersion(versionId) {
  const manuscript = getActiveManuscript();
  if (!isManuscriptDocument(manuscript)) return;
  const snapshot = VeredaVersions.getVersionsForManuscript(state.versions, manuscript.id)
    .find(v => v.id === versionId);
  if (!snapshot) return;
  const date = new Date(snapshot.createdAt).toLocaleDateString("pt-BR").replace(/\//g, "-");
  const filename = `${slugify(snapshot.title || "versao")}-${date}.txt`;
  const header = `${snapshot.title || "Manuscrito"}\n${"─".repeat(40)}\nVersão: ${snapshot.reason}\nData: ${new Date(snapshot.createdAt).toLocaleString("pt-BR")}\nPalavras: ${snapshot.wordCount}\n${"─".repeat(40)}\n\n`;
  downloadFile(header + (snapshot.text || ""), filename, "text/plain;charset=utf-8");
  saveStatus.textContent = "Versão baixada em TXT";
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

  // Salva estado atual antes de restaurar para não perder trabalho não versionado
  const beforeRestore = VeredaVersions.addSnapshot(state.versions, manuscript, "Antes da restauração");
  state.versions = beforeRestore.versions;

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
  const ms = getActiveManuscript();

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

  // Desconto proporcional por paste externo
  // adjustedIntegrity = integrity × (1 − pastedChars / totalChars)
  function calcAdjustedIntegrity(baseIntegrity) {
    if (!ms) return baseIntegrity;
    const pastes = state.proofs?.[ms.id]?.pastes || [];
    const externalPastedChars = pastes
      .filter(p => p.source === "external")
      .reduce((sum, p) => sum + (p.chars || 0), 0);
    const totalChars = (ms.text || "").length;
    if (!totalChars || !externalPastedChars) return baseIntegrity;
    const pasteRatio = Math.min(externalPastedChars / totalChars, 1);
    return Math.max(0, Math.round(baseIntegrity * (1 - pasteRatio)));
  }

  const adjustedIntegrity = calcAdjustedIntegrity(summary.integrity);
  const hasPasteDiscount = adjustedIntegrity < summary.integrity;

  proofSessionName.textContent = session.name;
  proofIntegrity.textContent = adjustedIntegrity > 0
    ? `${adjustedIntegrity}%${hasPasteDiscount ? " ✱" : ""}`
    : "Aguardando sua escrita";

  // Nota de desconto por paste
  const discountNote = document.querySelector("[data-proof-paste-note]");
  if (discountNote) {
    discountNote.hidden = !hasPasteDiscount;
    if (hasPasteDiscount) {
      const diff = summary.integrity - adjustedIntegrity;
      discountNote.textContent = `✱ ${diff}% descontado por texto colado`;
    }
  }

  const grid = document.querySelector(".certificate-grid");
  if (grid) grid.classList.toggle("is-empty", summary.totalEvents === 0);

  // Atualiza chip da topbar
  const chip = document.querySelector("[data-proof-chip]");
  const chipValue = document.querySelector("[data-proof-chip-value]");
  const wordCount = (ms?.text || "").trim().split(/\s+/).filter(Boolean).length;
  if (chip && summary.totalEvents > 0 && adjustedIntegrity > 0 && wordCount >= 50) {
    chip.hidden = false;
    if (chipValue) chipValue.textContent = `${adjustedIntegrity}%`;
    chip.dataset.level = adjustedIntegrity >= 80 ? "high" : adjustedIntegrity >= 50 ? "medium" : "low";
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

  // Palavras registradas + delta desde último registro
  const wordcountEl = document.querySelector("[data-proof-wordcount]");
  const wordcountHintEl = document.querySelector("[data-proof-wordcount-hint]");
  if (wordcountEl && ms) {
    const wc = countWords(ms.text || "");
    wordcountEl.textContent = wc > 0 ? wc.toLocaleString("pt-BR") : "—";
    if (wordcountHintEl) {
      const lastExp = state.proofs?.[ms.id]?._lastExportedWords;
      if (lastExp != null && wc > 0) {
        const delta = wc - lastExp;
        const sign = delta > 0 ? "+" : "";
        const lastAt = state.proofs?.[ms.id]?._lastExportedAt;
        const dateStr = lastAt ? new Date(lastAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}) : "";
        const deltaTxt = delta !== 0
          ? `${sign}${delta.toLocaleString("pt-BR")} palavras desde o último registro${dateStr ? ` (${dateStr})` : ""}`
          : `Texto inalterado desde o último registro${dateStr ? ` (${dateStr})` : ""}`;
        wordcountHintEl.textContent = deltaTxt;
      } else {
        const MILESTONES = [100, 500, 1000, 2000, 5000, 10000];
        const nextMilestone = MILESTONES.find(m => m > wc);
        wordcountHintEl.textContent = nextMilestone ? `Próximo marco: ${nextMilestone.toLocaleString("pt-BR")} palavras` : "Marco de 10 mil alcançado";
      }
    }
  }

  // Info de sessão
  const sessionInfo = document.querySelector("[data-proof-session-info]");
  if (sessionInfo && session.startedAt) {
    const started = new Date(session.startedAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
    const durPart = summary.durationMin > 0 ? ` · ${summary.durationMin} min` : "";
    sessionInfo.textContent = `Iniciada às ${started}${durPart} · ${summary.organicEvents} movimentos`;
  }

  // Critérios mínimos
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
  const canExport = hasText && hasEvents;
  if (exportBtn) {
    exportBtn.disabled = !canExport;
    exportBtn.title = canExport ? "Gerar arquivo de evidência" : "Escreva no editor para ativar";
    exportBtn.style.opacity = canExport ? "" : "0.5";
    exportBtn.style.cursor = canExport ? "" : "not-allowed";
  }

  // Botão blockchain
  const stampBtn = document.querySelector("[data-proof-stamp-btn]");
  if (stampBtn) stampBtn.disabled = !canExport;

  // Último carimbo persistido
  const stampStatusEl = document.querySelector("[data-proof-stamp-status]");
  const lastStamp = state.proofStamps?.[ms?.id];
  if (stampStatusEl && lastStamp && !stampStatusEl.textContent.includes("Enviando") && !stampStatusEl.textContent.includes("Gerando")) {
    stampStatusEl.hidden = false;
    stampStatusEl.textContent = `Último carimbo: ${new Date(lastStamp.at).toLocaleDateString("pt-BR")}`;
  }

  // Restaura última validação persistida para este manuscrito
  const savedValidation = state.proofValidations?.[ms?.id];
  if (savedValidation && proofValidationResult) {
    const when = new Date(savedValidation.at).toLocaleString("pt-BR", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });
    const extraLines = [];
    if (savedValidation.wordCount !== undefined) {
      const currentWords = countWords(ms?.text || "");
      if (currentWords !== savedValidation.wordCount) {
        extraLines.push(`⚠ Texto editado após a verificação (${savedValidation.wordCount} → ${currentWords} palavras) — verifique novamente`);
      }
    }
    showProofValidation(savedValidation.ok, [...savedValidation.lines, ...extraLines, `— Verificado em ${when}`]);
  } else if (proofValidationResult) {
    proofValidationResult.hidden = true;
  }

  if (!recentEvents.length) {
    proofTimeline.innerHTML = "<div><span></span><p>Aguardando movimentos de escrita no editor.</p></div>";
  } else {
    proofTimeline.innerHTML = recentEvents
      .map((event) => {
        const time = formatTimeWithSeconds(event.at);
        const isStructural = event.keyType?.startsWith("structural:");
        const structType = isStructural ? event.keyType.replace("structural:","") : null;
        const label = structType
          ? `ação: ${structType}${event.wordDelta ? ` (Δ${event.wordDelta > 0 ? "+" : ""}${event.wordDelta} pal)` : ""}`
          : event.organic ? "toque orgânico" : "toque fora do intervalo";
        const interval = event.interval === null ? "início" : `${event.interval}ms`;
        return `<div><span></span><p>${time} — ${label} · ${interval}</p></div>`;
      })
      .join("");
  }

  // Histórico de sessões anteriores
  renderProofSessionHistory();
  // Assinatura da autora
  renderProofAuthorSection();
}

function renderProofSessionHistory() {
  const historyEl = document.querySelector("[data-proof-sessions-history]");
  if (!historyEl || historyEl.hidden) return;
  const record = getActiveProofRecord();
  if (!record) { historyEl.innerHTML = ""; return; }
  const sessions = record.sessions || [];
  const activeId = record.activeSessionId;
  const past = sessions.filter(s => s.id !== activeId);
  if (!past.length) {
    historyEl.innerHTML = `<p class="proof-sessions-empty">Apenas esta sessão registrada até agora.</p>`;
    return;
  }

  const filterActive = historyEl.dataset.filterActive === "true";
  const visible = filterActive
    ? past.filter(s => VeredaProof.summarize(s).organicEvents > 0)
    : past;

  const filterLabel = filterActive ? "Todas as sessões" : "Apenas com escrita";
  const countNote = visible.length < past.length
    ? `${visible.length} de ${past.length} sessões`
    : `${past.length} ${past.length !== 1 ? "sessões" : "sessão"}`;

  const rows = visible.map(s => {
    const sum = VeredaProof.summarize(s);
    const date = s.startedAt
      ? new Date(s.startedAt).toLocaleString("pt-BR", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })
      : "—";
    const dur = sum.durationMin > 0 ? ` · ${sum.durationMin} min` : "";
    return `<div class="proof-session-history-row">
      <span>${date}${dur}</span>
      <span>${sum.organicEvents} toques · ${sum.integrity > 0 ? sum.integrity + "%" : "—"}</span>
      <small>${sum.status}</small>
    </div>`;
  }).join("") || `<p class="proof-sessions-empty">Nenhuma sessão com escrita encontrada.</p>`;

  historyEl.innerHTML =
    `<div class="proof-sessions-header">` +
    `<span class="proof-sessions-count">${countNote}</span>` +
    `<button class="secondary-button proof-filter-btn${filterActive ? " is-active" : ""}" ` +
    `data-action="toggle-proof-filter" aria-pressed="${filterActive}">${filterLabel}</button>` +
    `</div>` + rows;
}

function toggleProofSessionFilter() {
  const historyEl = document.querySelector("[data-proof-sessions-history]");
  if (!historyEl) return;
  historyEl.dataset.filterActive = historyEl.dataset.filterActive === "true" ? "false" : "true";
  renderProofSessionHistory();
}

function toggleProofSessionHistory() {
  const historyEl = document.querySelector("[data-proof-sessions-history]");
  const btn = document.querySelector("[data-action='toggle-proof-sessions']");
  if (!historyEl) return;
  historyEl.hidden = !historyEl.hidden;
  if (btn) btn.setAttribute("aria-expanded", String(!historyEl.hidden));
  if (!historyEl.hidden) renderProofSessionHistory();
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

  const MAX_VERSIONS = 20;
  const atLimit = versions.length >= MAX_VERSIONS;
  const countNote = `<p class="muted version-count-note">${versions.length} / ${MAX_VERSIONS} versões guardadas${atLimit ? " — a mais antiga é removida a cada nova versão automática" : ""}.</p>`;

  versionList.innerHTML = countNote + versions
    .map((version, i) => {
      const createdAt = new Date(version.createdAt).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      const prev = versions[i + 1];
      const diff = prev ? VeredaVersions.summarizeDiff(prev.text, version.text) : null;
      const deltaLabel = diff
        ? (diff.wordsDelta > 0
            ? `+${diff.wordsDelta} pal`
            : diff.wordsDelta < 0
              ? `${diff.wordsDelta} pal`
              : "sem alteração de texto")
        : "";

      const preview = (version.text || "").trim().slice(0, 90).replace(/\n+/g, " ");
      const previewHtml = preview
        ? `<small class="version-preview">${escapeHtml(preview)}${version.text?.trim().length > 90 ? "…" : ""}</small>`
        : "";

      // Primeira mudança de parágrafo — mais informativo que o início do texto
      const firstChangeHtml = diff?.firstChange && diff.firstChange !== preview
        ? `<small class="version-first-change">↳ ${escapeHtml(diff.firstChange.slice(0, 80))}${diff.firstChange.length > 80 ? "…" : ""}</small>`
        : "";

      const parasDelta = diff ? Math.abs(
        (version.text || "").split(/\n+/).filter(Boolean).length -
        ((versions[i+1]?.text || "").split(/\n+/).filter(Boolean).length)
      ) : 0;
      const parasLabel = parasDelta > 0 ? ` · ${parasDelta} par.` : "";

      return `
        <article class="version-item">
          <div>
            <strong>${escapeHtml(version.reason)}</strong>
            <span>${createdAt} · ${version.wordCount} palavras${deltaLabel ? ` · <em>${escapeHtml(deltaLabel)}</em>` : ""}${parasLabel}</span>
            ${previewHtml}
            ${firstChangeHtml}
          </div>
          <div class="version-actions">
            <button class="secondary-button version-export-btn" data-version-export="${version.id}" title="Baixar esta versão em TXT">Baixar</button>
            <button class="secondary-button" data-version-restore="${version.id}">Restaurar</button>
          </div>
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
  // Injetar assinatura da autora se existir
  const decl = buildDeclaration();
  if (decl) proofDocument.declaration = decl;
  const proofJson = JSON.stringify(proofDocument, null, 2);
  downloadFile(proofJson, `${slugify(manuscript.title)}-${slugify(proofDocument.session.name)}.prova.esc`, "application/json");

  // Guardar marcador de última exportação para rastrear alterações
  state.proofs[manuscript.id] = state.proofs[manuscript.id] || {};
  state.proofs[manuscript.id]._lastExportedWords = countWords(manuscript.text || "");
  state.proofs[manuscript.id]._lastExportedAt = new Date().toISOString();
  persistState("Prova exportada");

  saveStatus.textContent = "Cópia de autoria guardada";
  renderProofView();
}

async function sendProofToEditor() {
  const manuscript = getActiveManuscript();
  if (!isManuscriptDocument(manuscript)) {
    saveStatus.textContent = "Selecione um manuscrito primeiro";
    return;
  }

  // 1. Baixa o arquivo primeiro
  await exportProof();

  // 2. Pequena pausa para o download iniciar antes de abrir o email
  await new Promise(r => setTimeout(r, 600));

  // 3. Monta o email com instruções prontas para o editor
  const title = manuscript.title || "meu manuscrito";
  const filename = `${slugify(title)}.prova.esc`;

  const subject = encodeURIComponent(`Prova de autoria — ${title}`);
  const body = encodeURIComponent(
`Olá,

Segue em anexo meu arquivo de prova de autoria referente ao manuscrito "${title}".

O arquivo foi gerado pelo Escrevaral e registra o ritmo da minha digitação ao longo das sessões de escrita — não o conteúdo do texto, só o tempo entre cada tecla. É uma prova positiva de autoria humana: nenhuma IA tem o mesmo padrão de cadência de uma pessoa escrevendo.

Como verificar (leva menos de 1 minuto, sem criar conta):

1. Acesse escrevaral.com
2. Clique em "Prova de autoria" no menu
3. Role até a seção "Um editor duvidou?" e clique em "Verificar arquivo .esc"
4. Faça o upload do arquivo ${filename} que enviei em anexo

Você verá: a correspondência com o manuscrito, o número de sessões registradas, o padrão de ritmo e se o texto foi alterado após o registro.

Qualquer dúvida, estou à disposição.`
  );

  window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  saveStatus.textContent = "Email preparado — lembre de anexar o arquivo .esc";
}

async function stampWithOpenTimestamps() {
  const manuscript = getActiveManuscript();
  if (!isManuscriptDocument(manuscript)) return;

  const stampBtn = document.querySelector("[data-proof-stamp-btn]");
  const stampStatusEl = document.querySelector("[data-proof-stamp-status]");
  const setStatus = (text) => {
    if (!stampStatusEl) return;
    stampStatusEl.hidden = !text;
    stampStatusEl.textContent = text || "";
  };

  try {
    if (stampBtn) stampBtn.disabled = true;
    setStatus("Gerando pacote de autoria…");

    const pkg = await VeredaProof.createAuthorshipPackage(getActiveProofRecord(), manuscript);
    const pkgJson = JSON.stringify(pkg, null, 2);

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(pkgJson));
    const hashBytes = new Uint8Array(hashBuffer);
    const hashHex = Array.from(hashBytes).map(b => b.toString(16).padStart(2, "0")).join("");

    const slug = slugify(manuscript.title);
    const date = new Date().toISOString().slice(0, 10);

    // Baixa o pacote de autoria antes de tentar a rede
    downloadFile(pkgJson, `${slug}-${date}.pacote.esc`, "application/json");

    setStatus("Enviando ao OpenTimestamps…");

    const response = await fetch("https://a.pool.opentimestamps.org/digest", {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: hashBytes,
    });

    if (!response.ok) throw new Error(`${response.status}`);

    const otsBuffer = await response.arrayBuffer();
    const otsBlob = new Blob([otsBuffer], { type: "application/octet-stream" });
    const otsUrl = URL.createObjectURL(otsBlob);
    const a = document.createElement("a");
    a.href = otsUrl;
    a.download = `${slug}-${date}.pacote.esc.ots`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(otsUrl);

    state.proofStamps = state.proofStamps || {};
    state.proofStamps[manuscript.id] = { at: new Date().toISOString(), hashHex };
    persistState("Carimbo blockchain registrado");

    setStatus(`Carimbado em ${new Date().toLocaleDateString("pt-BR")}`);
    saveStatus.textContent = "Carimbo de anterioridade gerado";
    renderProofView();

  } catch (_err) {
    setStatus("Sem internet ou serviço indisponível — tente novamente");
    saveStatus.textContent = "Carimbo não concluído";
  } finally {
    if (stampBtn) stampBtn.disabled = false;
  }
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
  const veredito = ok
    ? "Este arquivo combina com o texto atual."
    : "Este arquivo não confere com o texto atual ou apresenta divergências.";
  const icon = ok ? "verified" : "warning";
  const checks = lines.filter(l => l.startsWith("✓"));
  const warnings = lines.filter(l => l.startsWith("⚠") || l.startsWith("✗"));
  const notes = lines.filter(l => l.startsWith("—"));
  const detailLines = [...checks, ...warnings, ...notes];
  const details = detailLines.map(l => `<p class="proof-detail">${escapeHtml(l)}</p>`).join("");
  proofValidationResult.innerHTML =
    `<div class="proof-veredito-row">` +
    `<span class="material-symbols-outlined">${icon}</span>` +
    `<p class="proof-veredito">${escapeHtml(veredito)}</p>` +
    `</div>` +
    `<div class="proof-detail-list">${details}</div>`;
}

async function validateProofFile(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const lines = [];
    let ok = true;

    // Formato — vereda.proof.v2 é o atual; escrevaral.autoria.v1 é o pacote blockchain
    const format = data.format || data.envelope;
    const formatosConhecidos = ["vereda.proof.v2","vereda.proof.v1","escrevaral.autoria.v1"];
    if (format && formatosConhecidos.some(f => format.startsWith(f.split(".").slice(0,2).join(".")))) {
      const isLegacy = format.includes("v1") && !format.includes("autoria");
      lines.push(`✓ Formato: ${format}${isLegacy ? " (formato antigo)" : ""}`);
    } else if (format) {
      lines.push(`⚠ Formato desconhecido: ${format} — pode ser de outra versão do Escrevaral`);
    } else {
      lines.push("⚠ Formato não reconhecido — verifique se é um arquivo .prova.esc exportado pelo Escrevaral");
    }

    // Título e identidade do manuscrito
    const title = data.manuscript?.title || data.manuscriptTitle || data.title;
    if (title) lines.push(`✓ Manuscrito: "${title}"`);

    const proofManuscriptId = data.manuscript?.id;
    const activeMs = getActiveManuscript();
    if (proofManuscriptId && activeMs?.id) {
      if (proofManuscriptId !== activeMs.id) {
        lines.push("⚠ Esta cópia pertence a outro manuscrito, não ao texto aberto agora");
        ok = false;
      }
    }

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

    // Eventos orgânicos — v2 usa summary.organicEvents; v1 usa events[].organic
    const organic = data.summary?.organicEvents ?? data.summary?.organicCount ?? data.events?.filter(e => e?.organic)?.length;
    if (organic != null && organic >= 0) {
      lines.push(`✓ Eventos orgânicos: ${organic}${organic === 0 ? " — nenhum movimento de escrita registrado" : ""}`);
    }

    // Palavras — compara com manuscrito atual
    const wc = data.manuscript?.wordCount;
    if (wc != null) {
      const msNow = getActiveManuscript();
      const wcNow = msNow ? countWords(msNow.text || "") : null;
      if (wcNow != null && wcNow !== wc) {
        const delta = wcNow - wc;
        lines.push(`✓ Palavras no registro: ${wc} → agora: ${wcNow} (${delta > 0 ? "+" : ""}${delta} palavras)`);
      } else {
        lines.push(`✓ Palavras no registro: ${wc}`);
      }
    }

    lines.push(ok ? "— Cópia pronta para guardar." : "— A cópia tem diferenças em relação ao texto atual.");
    showProofValidation(ok, lines);

    const msForSave = getActiveManuscript();
    if (msForSave?.id) {
      state.proofValidations = state.proofValidations || {};
      state.proofValidations[msForSave.id] = {
        ok, lines, at: new Date().toISOString(),
        wordCount: countWords(msForSave.text || ""),
      };
    }
    persistState("Autoria validada");
  } catch(e) {
    showProofValidation(false, ["✗ Não foi possível ler o arquivo.", "Verifique se é um arquivo .prova.esc exportado pelo Escrevaral."]);
  }
}

if (proofValidateInput) {
  proofValidateInput.addEventListener("change", (e) => {
    validateProofFile(e.target.files[0]);
    e.target.value = "";
  });
}

window.VeredaProofController = { init: true }; // âncora de boot
