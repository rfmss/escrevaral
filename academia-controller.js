// academia-controller.js — Espelho de Voz, RimaLab, Vocabulário Decolonizador, Direitos
// Depende de: state-store.js, voice-engine.js, rimalab-engine.js, decolonial-engine.js, rights-engine.js

function useActiveManuscriptForVoice() {
  if (!isManuscriptDocument()) {
    voiceInput.value = "";
    updateVoiceCount();
    voiceResult.innerHTML = `<p>O Espelho de Voz analisa manuscritos. Notas de pesquisa, mundo, personagem, cena, cronologia e glossário ficam fora dessa leitura.</p>`;
    setView("academia");
    voiceInput.focus();
    return;
  }

  voiceInput.value = getActiveManuscript().text.trim();
  updateVoiceCount();
  renderVoiceMirror();
  setView("academia");
  voiceInput.focus();
}

function updateVoiceCount() {
  const words = countWords(voiceInput.value);
  voiceCount.textContent = `${words} ${words === 1 ? "palavra" : "palavras"}`;
}

function renderVoiceMirror() {
  const text = voiceInput.value.trim();
  const words = countWords(text);

  if (words < 80) {
    voiceResult.innerHTML = `<p>Cole um texto com pelo menos 80 palavras para ver a análise. Acima de 500, os resultados ficam mais estáveis.</p>`;
    return;
  }

  const analysis = VeredaVoice.analyze(text);
  const criterios = window.VeredaAnalise ? VeredaAnalise.analisar(text) : null;
  const alertas   = criterios ? VeredaAnalise.interpretarResultado(criterios) : [];
  voiceResult.innerHTML = createVoiceMirrorMarkup(analysis, criterios, alertas);
  saveStatus.textContent = "Espelho de Voz atualizado";
}

function createVoiceMetric(label, value) {
  return `
    <div class="voice-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function createVoicePanel(title, items) {
  return `
    <div class="voice-panel">
      <h4>${escapeHtml(title)}</h4>
      <ul>
        ${(items.length ? items : ["Sem marcas suficientes neste corpus."])
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("")}
      </ul>
    </div>
  `;
}

function createVoiceBars(title, items) {
  return `
    <div class="voice-panel">
      <h4>${escapeHtml(title)}</h4>
      <div class="voice-bars">
        ${(items.length ? items : [{ label: "baixo sinal", score: 8, hits: 0 }])
          .map(
            (item) => `
              <div class="voice-bar">
                <span>${escapeHtml(item.label)}</span>
                <i style="--w:${Math.max(8, item.score)}%"></i>
                <b>${item.hits}</b>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function loadRimaLabText() {
  if (!rimalabInput) {
    return;
  }

  const savedText = localStorage.getItem(RIMALAB_STORAGE_KEY);
  const savedAt = localStorage.getItem(RIMALAB_SAVED_AT_KEY);
  rimalabInput.value = savedText || "";

  if (savedAt && rimalabSave) {
    rimalabSave.textContent = `salvo ${formatTimeWithSeconds(savedAt)}`;
  }
}

function persistRimaLabText() {
  if (!rimalabInput || !rimalabSave) {
    return;
  }

  const now = new Date().toISOString();
  localStorage.setItem(RIMALAB_STORAGE_KEY, rimalabInput.value);
  localStorage.setItem(RIMALAB_SAVED_AT_KEY, now);
  rimalabSave.textContent = `salvo ${formatTimeWithSeconds(now)}`;
}

function useActiveManuscriptForRimaLab() {
  if (!rimalabInput) {
    return;
  }

  rimalabInput.value = getActiveManuscript().text.trim();
  renderRimaLab();
  persistRimaLabText();
  setView("academia");
  rimalabInput.focus();
}

function exportRimaLabText() {
  if (!rimalabInput) {
    return;
  }

  const text = rimalabInput.value.trim();

  if (!text) {
    saveStatus.textContent = "RimaLab ainda está vazio";
    return;
  }

  const title = getActiveManuscript().title || "rimalab";
  downloadFile(text, `${slugify(title)}-rimalab.txt`, "text/plain;charset=utf-8");
  saveStatus.textContent = "RimaLab exportado em TXT";
}

function clearRimaLabText() {
  if (!rimalabInput) return;
  const doRimaLabClear = () => {
    rimalabInput.value = "";
    localStorage.removeItem(RIMALAB_STORAGE_KEY);
    localStorage.removeItem(RIMALAB_SAVED_AT_KEY);
    rimalabSave.textContent = "salvo localmente";
    renderRimaLab();
    rimalabInput.focus();
  };
  if (!rimalabInput.value.trim()) { doRimaLabClear(); return; }
  vrdaConfirm("Limpar o texto do RimaLab? O manuscrito principal não será alterado.", (ok) => {
    if (ok) doRimaLabClear();
  });
}

async function renderRimaLab() {
  if (!window.VeredaRimaLab || !rimalabInput || !rimalabMetrics || !rimalabRhymes) {
    return;
  }

  await VeredaRimaLab.ensureLoaded();
  const text = rimalabInput.value;
  const analysis = window.VeredaRimaLab.analyze(text);

  if (rimalabCount) {
    rimalabCount.textContent = `${analysis.totalVerses} ${analysis.totalVerses === 1 ? "verso" : "versos"}`;
  }

  if (rimalabNote) {
    rimalabNote.textContent = analysis.note;
  }

  renderRimaLabIsometry(analysis);
  renderRimaLabMetrics(analysis.scans);
  renderRimaLabRhymes(analysis.rhymes);

  if (rimalabScheme) {
    if (analysis.stanzas) {
      rimalabScheme.innerHTML = analysis.stanzas
        .map((st, i) => `<span class="rimalab-stanza-scheme"><em>Est. ${i + 1}</em> ${escapeHtml(st.scheme)}</span>`)
        .join(" · ");
    } else {
      rimalabScheme.textContent = analysis.rhymeScheme || "Esquema: escreva ao menos um verso";
    }
  }
}

function renderRimaLabIsometry(analysis) {
  if (!rimalabIsometry || !rimalabIsometryTitle || !rimalabIsometryCopy) {
    return;
  }

  rimalabIsometry.classList.toggle("is-isometric", analysis.isIsometric);

  if (!analysis.totalVerses) {
    rimalabIsometryTitle.textContent = "Sem versos ainda";
    rimalabIsometryCopy.textContent = "O painel reage quando você escreve versos separados por linha.";
    return;
  }

  if (analysis.isIsometric) {
    rimalabIsometryTitle.textContent = `${analysis.metrics[0]} sílabas em cada verso`;
    rimalabIsometryCopy.textContent = "Versos com a mesma medida: o pulso fica mais estável.";
    return;
  }

  rimalabIsometryTitle.textContent =
    analysis.uniqueMetrics.length === 1
      ? `${analysis.uniqueMetrics[0]} sílabas`
      : `${analysis.uniqueMetrics.join(", ")} sílabas`;
  rimalabIsometryCopy.textContent = "A métrica ainda varia. Isso pode ser escolha musical, respiração ou verso livre.";
}

function renderRimaLabMetrics(scans) {
  if (!rimalabMetrics) {
    return;
  }

  if (!scans.length) {
    rimalabMetrics.innerHTML = `<p class="rimalab-empty">Escreva versos em linhas separadas para ver sílabas, rimas e tonicidade.</p>`;
    return;
  }

  rimalabMetrics.innerHTML = scans
    .map(
      (scan, index) => `
        <article class="rimalab-metric-row">
          <strong>${index + 1}</strong>
          <div>
            <b>${scan.totalSyllables} sílabas poéticas</b>
            <span>${escapeHtml(scan.finalWord)} · ${escapeHtml(scan.finalTonicity)}${
        scan.ellisions.length ? ` · elisão: ${scan.ellisions.map(escapeHtml).join(", ")}` : ""
      }</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderRimaLabRhymes(rhymes) {
  if (!rimalabRhymes) {
    return;
  }

  if (!rhymes.length) {
    rimalabRhymes.innerHTML = `<p class="rimalab-empty">As rimas entre os versos aparecem aqui.</p>`;
    return;
  }

  const RHYME_TITLES = {
    pobre:    "Rima pobre: terminações iguais, mesma classe gramatical",
    rica:     "Rima rica: terminações iguais, classes gramaticais distintas",
    preciosa: "Rima preciosa: terminação rara ou proparoxítona",
    toante:   "Rima toante: apenas as vogais coincidem (assonância)",
    nenhuma:  "Sem rima",
  };

  rimalabRhymes.innerHTML = rhymes
    .map(
      (rhyme) => `
        <article class="rimalab-rhyme-row ${rhyme.rhymes ? "has-rhyme" : ""}">
          <span class="rimalab-verse-pair">v.${rhyme.from + 1} × v.${rhyme.to + 1}</span>
          <span class="rimalab-rhyme-badge is-${escapeHtml(rhyme.classification)}" title="${escapeHtml(RHYME_TITLES[rhyme.classification] || rhyme.classification)}">${escapeHtml(rhyme.classification)}</span>
          <div>
            <b>${escapeHtml(rhyme.wordA)} / ${escapeHtml(rhyme.wordB)}</b>
            <small>/${escapeHtml(rhyme.soundA)}/ · /${escapeHtml(rhyme.soundB)}/${
        rhyme.classA && rhyme.classB ? ` · ${escapeHtml(rhyme.classA)} + ${escapeHtml(rhyme.classB)}` : ""
      }</small>
          </div>
        </article>
      `
    )
    .join("");
}

function renderRimaLabEncyclopedia() {
  if (!window.VeredaRimaLab || !rimalabEncyclopedia) {
    return;
  }

  rimalabEncyclopedia.innerHTML = window.VeredaRimaLab.encyclopedia
    .map(
      (entry) => `
        <article>
          <h3>${escapeHtml(entry.title)}</h3>
          <div>${entry.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
          <p>${escapeHtml(entry.body)}</p>
          <blockquote>${escapeHtml(entry.sample)}</blockquote>
        </article>
      `
    )
    .join("");
}

function toggleRimaLabEncyclopedia() {
  if (!rimalabEncyclopedia) {
    return;
  }

  rimalabEncyclopedia.hidden = !rimalabEncyclopedia.hidden;
}

function renderDecolonialTool() {
  if (!window.VeredaDecolonial || !decolonialFilters || !decolonialList) return;
  if (VeredaDecolonial.hasLoadError()) {
    decolonialList.innerHTML = `<div class="decolonial-empty">Vocabulário não carregado. Verifique a conexão e recarregue a página.</div>`;
    return;
  }
  if (!VeredaDecolonial.isLoaded()) {
    decolonialList.innerHTML = `<div class="decolonial-empty">Carregando vocabulário…</div>`;
    VeredaDecolonial.ensureLoaded().then(renderDecolonialTool);
    return;
  }

  const categories = window.VeredaDecolonial.listCategories();
  const entries = window.VeredaDecolonial.listEntries(decolonialState);
  const total = window.VeredaDecolonial.listEntries().length;

  decolonialFilters.innerHTML = [
    `<button class="decolonial-filter ${decolonialState.category === "all" ? "is-active" : ""}" type="button" data-decolonial-category="all">Todos <b>${total}</b></button>`,
    ...categories.map(
      (category) => `
        <button class="decolonial-filter ${decolonialState.category === category.id ? "is-active" : ""}" type="button" data-decolonial-category="${category.id}">
          ${escapeHtml(category.label)}
          <b>${category.count}</b>
        </button>
      `
    ),
  ].join("");

  decolonialCount.textContent = `${entries.length} ${entries.length === 1 ? "entrada" : "entradas"}`;
  renderDecolonialObserver();

  if (!entries.length) {
    decolonialList.innerHTML = `<div class="decolonial-empty">Nenhuma entrada encontrada.</div>`;
    return;
  }

  decolonialList.innerHTML = entries
    .map((entry) => {
      const alternatives = entry.alternatives.map((alternative) => `<span>${escapeHtml(alternative)}</span>`).join("");
      return `
        <article class="decolonial-entry">
          <div class="decolonial-entry-header">
            <strong>${escapeHtml(entry.avoid)}</strong>
            <span>${escapeHtml(entry.categoryLabel || entry.category)}</span>
          </div>
          <div class="decolonial-alternatives">
            <i class="material-symbols-outlined" aria-hidden="true">arrow_forward</i>
            ${alternatives}
          </div>
          <p>${escapeHtml(entry.reason)}</p>
          <small>${escapeHtml(entry.context)}</small>
        </article>
      `;
    })
    .join("");
}

function renderDecolonialObserver() {
  if (!window.VeredaDecolonial || !decolonialObserver || !decolonialObserverSummary || !decolonialObserverList) {
    return;
  }

  decolonialObserver.hidden = !decolonialState.observerEnabled;

  if (!decolonialState.observerEnabled) {
    decolonialObserverList.innerHTML = "";
    return;
  }

  const manuscript = getActiveManuscript();
  if (!manuscript?.text?.trim()) {
    decolonialObserverSummary.textContent = "Sem texto para verificar.";
    decolonialObserverList.innerHTML = `<div class="decolonial-observer-empty">Ative um manuscrito com texto para usar o observador.</div>`;
    return;
  }
  const findings = window.VeredaDecolonial.detectText(manuscript.text);
  const occurrences = findings.reduce((total, item) => total + item.count, 0);

  if (!findings.length) {
    decolonialObserverSummary.textContent = "Nenhum alerta encontrado neste manuscrito.";
    decolonialObserverList.innerHTML = `<div class="decolonial-observer-empty">O texto passou limpo por esta lente. Ainda vale revisar contexto, representação e ponto de vista.</div>`;
    return;
  }

  decolonialObserverSummary.textContent = `${occurrences} ${occurrences === 1 ? "ocorrência" : "ocorrências"} em ${findings.length} ${findings.length === 1 ? "termo" : "termos"}.`;
  decolonialObserverList.innerHTML = findings
    .map((entry) => {
      const alternatives = entry.alternatives.map((alternative) => `<span>${escapeHtml(alternative)}</span>`).join("");
      return `
        <article class="decolonial-alert">
          <div class="decolonial-alert-header">
            <strong>${escapeHtml(entry.avoid)}</strong>
            <span>${entry.count}x · ${escapeHtml(entry.categoryLabel)}</span>
          </div>
          <div class="decolonial-alternatives">
            <i class="material-symbols-outlined" aria-hidden="true">arrow_forward</i>
            ${alternatives}
          </div>
          <p>${escapeHtml(entry.reason)}</p>
          <small>${entry.contextual ? "Atenção ao contexto. " : ""}${escapeHtml(entry.context)}</small>
        </article>
      `;
    })
    .join("");
}

function renderRightsLab() {
  if (!window.VeredaRights || !rightsCards || !rightsSources) {
    return;
  }

  const query = normalizeSearch(rightsState.query);
  const manuscript = getActiveManuscript();
  const relevantCard = !query ? VeredaRights.getRelevantCard(manuscript?.kind || "") : null;
  const relevantId   = relevantCard?.id || null;
  const relevantKind = (relevantId && manuscript?.kind) ? manuscript.kind : null;

  const cards = window.VeredaRights.getCards().filter((card) => {
    if (!query) {
      return true;
    }

    return normalizeSearch(
      [
        card.eyebrow,
        card.title,
        card.body,
        card.watch,
        card.source,
        ...(card.do || []),
      ].join(" ")
    ).includes(query);
  });

  rightsCards.innerHTML = cards.length
    ? cards.map(card => createRightsCardMarkup(card, card.id === relevantId, relevantKind)).join("")
    : `<div class="rights-empty">Nenhum cuidado encontrado. Tente buscar por contrato, registro, ISBN, IA, plágio ou submissão.</div>`;

  const updatedAt = window.VeredaRights.updatedAt;
  rightsSources.innerHTML =
    (updatedAt ? `<p class="rights-updated">Referências verificadas em ${escapeHtml(updatedAt.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$2/$1"))}. Fontes oficiais mudam — confirme antes de agir.</p>` : "") +
    window.VeredaRights
      .getSources()
      .map(
        (source) => `
        <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">
          <span>${escapeHtml(source.label)}</span>
          <small>${escapeHtml(source.note)}</small>
        </a>
      `
      )
      .join("");
}

function createRightsCardMarkup(card, relevant = false, kind = null) {
  const relevantTag = relevant
    ? ` <span class="rights-card-tag">${kind ? escapeHtml(kind) : "para seu manuscrito"}</span>`
    : "";
  return `
    <article class="rights-card${relevant ? " rights-card--relevant" : ""}">
      <div class="rights-card-header">
        <span class="material-symbols-outlined">${escapeHtml(card.icon)}</span>
        <div>
          <p class="eyebrow">${escapeHtml(card.eyebrow)}${relevantTag}</p>
          <h3>${escapeHtml(card.title)}</h3>
        </div>
      </div>
      <p>${escapeHtml(card.body)}</p>
      <ul>
        ${card.do.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <div class="rights-watch">
        <strong>Atenção</strong>
        <span>${escapeHtml(card.watch)}</span>
      </div>
      <small>${escapeHtml(card.source)}</small>
    </article>
  `;
}

function showAcademiaHint() {
  // Só mostra se estiver na aba editor e nunca foi dispensado nesta sessão
  if (!academiaHintToast || hintDismissed || shell.dataset.view !== "editor") return;
  academiaHintToast.style.opacity = "1";
  academiaHintToast.style.transform = "translateY(0)";
  academiaHintToast.style.pointerEvents = "auto";
  clearTimeout(hintAutoHideTimer);
  hintAutoHideTimer = setTimeout(hideAcademiaHint, HINT_AUTO_HIDE_MS);
}

function hideAcademiaHint() {
  if (!academiaHintToast) return;
  academiaHintToast.style.opacity = "0";
  academiaHintToast.style.transform = "translateY(8px)";
  academiaHintToast.style.pointerEvents = "none";
}


window.VeredaAcademiaController = { init: true }; // âncora de boot

// ── Input listeners da Academia ──────────────────────────────────────────────
if (voiceInput)  voiceInput.addEventListener("input", updateVoiceCount);
if (rimalabInput) rimalabInput.addEventListener("input", () => {
  renderRimaLab();
  if (rimalabSave) rimalabSave.textContent = "salvando...";
  window.clearTimeout(rimalabTimer);
  rimalabTimer = window.setTimeout(persistRimaLabText, 350);
});
if (decolonialSearch) decolonialSearch.addEventListener("input", () => {
  decolonialState.query = decolonialSearch.value;
  renderDecolonialTool();
});
if (rightsSearch) rightsSearch.addEventListener("input", () => {
  rightsState.query = rightsSearch.value;
  renderRightsLab();
});
if (decolonialObserverToggle) decolonialObserverToggle.addEventListener("change", () => {
  decolonialState.observerEnabled = decolonialObserverToggle.checked;
  renderDecolonialObserver();
});
if (precisionCard) precisionCard.addEventListener("change", (event) => {
  const t = event.target.closest("[data-checklist-criterion]");
  if (!t) return;
  const manuscript = getActiveManuscript();
  const template = VeredaTemplates.getTemplate(state.template.selectedId);
  if (!template) return;
  setChecklistCriterion(manuscript.id, template.id, t.dataset.checklistCriterion, t.checked);
});
