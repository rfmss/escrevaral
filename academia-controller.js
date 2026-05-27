// academia-controller.js — Espelho de Voz, RimaLab, Vocabulário Decolonizador, Direitos
// Depende de: state-store.js, voice-engine.js, rimalab-engine.js, decolonial-engine.js, rights-engine.js

function useActiveManuscriptForVoice() {
  if (!isManuscriptDocument()) {
    voiceInput.value = "";
    updateVoiceCount();
    voiceResult.innerHTML = `<p>O Espelho de Voz analisa manuscritos. Notas de pesquisa, mundo, personagem, cena, cronologia e glossário ficam fora dessa leitura.</p>`;
    setView("academia");
    return;
  }

  voiceInput.value = getActiveManuscript().text.trim();
  updateVoiceCount();
  renderVoiceMirror();
  setView("academia");
}

function updateVoiceCount() {
  const words = countWords(voiceInput.value);
  voiceCount.textContent = `${words} ${words === 1 ? "palavra" : "palavras"}`;
}

async function renderVoiceMirror() {
  const text = voiceInput.value.trim();
  const words = countWords(text);

  if (words < 80) {
    voiceResult.innerHTML = `<p>Cole um texto com pelo menos 80 palavras para ver a análise. Acima de 500, os resultados ficam mais estáveis.</p>`;
    return;
  }

  const analysis = VeredaVoice.analyze(text);
  let criterios = window.VeredaAnalise ? VeredaAnalise.analisar(text) : null;

  // Pontuação profunda quando o motor sintático estiver pronto (concordância verbal)
  if (criterios && window.VeredaPunctuation && window.syntaxEngine?._isReady()) {
    try {
      const deep = await VeredaPunctuation.analyzeDeep(text);
      criterios = { ...criterios, norma: { pontuacao: deep } };
    } catch (_) { /* silencioso — usa resultado base */ }
  }

  const alertas = criterios ? VeredaAnalise.interpretarResultado(criterios) : [];
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
}

function exportVoiceMirrorText() {
  const text = voiceInput?.value.trim();
  if (!text || !window.VeredaVoice) { saveStatus.textContent = "Espelho vazio — analise um texto primeiro."; return; }
  const a = VeredaVoice.analyze(text);
  const ms = getActiveManuscript();
  const title = ms?.title || "texto";
  const date = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const sep = "═".repeat(52);
  const lines = [
    "ESPELHO DE VOZ — Escrevaral",
    sep,
    `Texto: ${title}  ·  ${a.counts.words} palavras  ·  ${date}`,
    "",
    `Leitura de voz: ${a.voice?.label || "—"}`,
  ];
  if (a.voice?.description) lines.push(`${a.voice.description}`);
  if (a.confiancaNote) lines.push(`\nNota: ${a.confiancaNote}`);
  lines.push("", "MÉTRICAS", "─".repeat(36));
  lines.push(`TTR (riqueza de vocabulário): ${a.metrics.ttr}%`);
  lines.push(`Densidade lexical: ${a.metrics.lexicalDensity}%`);
  lines.push(`Frase média: ${a.metrics.avgSentence} palavras`);
  lines.push(`Variação de frase: ${a.metrics.sentenceVariation}`);
  lines.push(`Frases por parágrafo: ${a.metrics.paragraphAverage}`);
  if (a.strengths?.length) {
    lines.push("", "PONTOS FORTES", "─".repeat(36));
    a.strengths.forEach(s => lines.push(`· ${s}`));
  }
  if (a.blindSpots?.length) {
    lines.push("", "PONTOS CEGOS", "─".repeat(36));
    a.blindSpots.forEach(b => lines.push(`· ${b}`));
  }
  if (a.audience) lines.push("", `Público potencial: ${a.audience}`);
  lines.push("", sep, a.disclaimer || "");
  downloadFile(lines.join("\n"), `${slugify(title)}-espelho-voz.txt`, "text/plain;charset=utf-8");
  saveStatus.textContent = "Espelho de Voz exportado em TXT";
}

function exportDecolonialDetected() {
  const ms = getActiveManuscript();
  if (!ms || !window.VeredaDecolonial) { saveStatus.textContent = "Nenhum manuscrito ativo."; return; }
  const found = VeredaDecolonial.detectText(ms.text || (ms.html || "").replace(/<[^>]+>/g, " "));
  const date = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const sep = "═".repeat(52);
  const lines = [
    "VOCABULÁRIO DECOLONIZADOR — Escrevaral",
    sep,
    `Manuscrito: ${ms.title || "sem título"}  ·  ${date}`,
    `Termos detectados: ${found.length}`,
    "",
  ];
  if (!found.length) {
    lines.push("Nenhum termo da lista foi encontrado neste manuscrito.");
  } else {
    found.forEach((entry, i) => {
      lines.push(`${i + 1}. ${entry.avoid}`);
      if (entry.alternatives?.length) lines.push(`   Alternativas: ${entry.alternatives.join(", ")}`);
      if (entry.reason) lines.push(`   Motivo: ${entry.reason}`);
      if (entry.categoryLabel) lines.push(`   Categoria: ${entry.categoryLabel}`);
      lines.push("");
    });
  }
  lines.push(sep, "Análise local — nada enviado para fora do navegador.");
  downloadFile(lines.join("\n"), `${slugify(ms.title || "texto")}-decolonial.txt`, "text/plain;charset=utf-8");
  saveStatus.textContent = `${found.length} ${found.length === 1 ? "termo exportado" : "termos exportados"} em TXT`;
}

function exportAnaliseGeral() {
  const ms = getActiveManuscript();
  if (!ms || !window.VeredaAnalise) { saveStatus.textContent = "Nenhum manuscrito ativo."; return; }
  const text = ms.text || (ms.html || "").replace(/<[^>]+>/g, " ");
  if (!text.trim()) { saveStatus.textContent = "Manuscrito vazio — nada para exportar."; return; }
  const criterios = VeredaAnalise.analisar(text);
  const alertas = VeredaAnalise.interpretarResultado(criterios);
  const date = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const sep = "═".repeat(52);
  const DIM = { economia: "Economia", clareza: "Clareza", ritmo: "Ritmo", voz: "Voz", lexico: "Léxico", pov: "Ponto de vista", norma: "Norma" };
  const lines = [
    "ANÁLISE GERAL — Escrevaral",
    sep,
    `Manuscrito: ${ms.title || "sem título"}  ·  ${criterios.meta.totalPalavras} palavras  ·  ${date}`,
    `Legibilidade: ${criterios.meta.fleschBR}/100 — ${criterios.meta.fleschLabel}`,
    `Frases: ${criterios.meta.totalFrases}  ·  Parágrafos: ${criterios.meta.totalParagrafos}`,
    "",
  ];
  if (!alertas.length) {
    lines.push("Nenhum alerta neste texto. Ótimo sinal — continue escrevendo.");
  } else {
    lines.push(`${alertas.length} alerta${alertas.length === 1 ? "" : "s"} encontrado${alertas.length === 1 ? "" : "s"}:`);
    lines.push("");
    alertas.forEach((a, i) => {
      lines.push(`${i + 1}. [${(DIM[a.dim] || a.dim).toUpperCase()}] ${a.msg}`);
      if (a.acao) lines.push(`   → ${a.acao}`);
      lines.push("");
    });
  }
  lines.push(sep, "Análise local — nada enviado para fora do navegador.");
  downloadFile(lines.join("\n"), `${slugify(ms.title || "texto")}-analise.txt`, "text/plain;charset=utf-8");
  saveStatus.textContent = `${alertas.length} alerta${alertas.length === 1 ? "" : "s"} exportado${alertas.length === 1 ? "" : "s"} em TXT`;
}

function copyVoiceResult() {
  const text = voiceInput?.value.trim();
  if (!text || !window.VeredaVoice) { saveStatus.textContent = "Espelho vazio — analise um texto primeiro."; return; }
  const a = VeredaVoice.analyze(text);
  const ms = getActiveManuscript();
  const title = ms?.title || "texto";
  const date = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const sep = "═".repeat(52);
  const lines = [
    "ESPELHO DE VOZ — Escrevaral",
    sep,
    `Texto: ${title}  ·  ${a.counts.words} palavras  ·  ${date}`,
    `Leitura de voz: ${a.voice?.label || "—"}`,
    a.voice?.description || "",
    "",
    "Forças: " + (a.strengths?.join("; ") || "—"),
    "Pontos cegos: " + (a.blindSpots?.join("; ") || "—"),
    "",
    sep,
    a.disclaimer || "",
  ];
  navigator.clipboard?.writeText(lines.join("\n")).then(() => {
    saveStatus.textContent = "Resultado copiado";
  }).catch(() => {
    saveStatus.textContent = "Cópia não disponível — use Baixar TXT";
  });
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

  const title = getActiveManuscript()?.title || "rimalab";
  const analysis = window.VeredaRimaLab ? window.VeredaRimaLab.analyze(text) : null;
  const report = analysis && window.VeredaRimaLab
    ? window.VeredaRimaLab.exportAnalysisText(analysis, title)
    : text;
  downloadFile(report, `${slugify(title)}-rimalab.txt`, "text/plain;charset=utf-8");
  saveStatus.textContent = analysis && !analysis.isProse
    ? "Análise RimaLab exportada em TXT"
    : "RimaLab exportado em TXT";
}

function copyRimaLabAnalysis() {
  if (!rimalabInput) return;
  const text = rimalabInput.value.trim();
  if (!text) { saveStatus.textContent = "RimaLab ainda está vazio."; return; }
  const title = getActiveManuscript()?.title || "rimalab";
  const analysis = window.VeredaRimaLab ? VeredaRimaLab.analyze(text) : null;
  const report = analysis && window.VeredaRimaLab
    ? VeredaRimaLab.exportAnalysisText(analysis, title)
    : text;
  navigator.clipboard?.writeText(report).then(() => {
    saveStatus.textContent = "Análise RimaLab copiada";
  }).catch(() => {
    saveStatus.textContent = "Cópia não disponível — use Baixar TXT";
  });
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
    rimalabCount.textContent = analysis.isProse
      ? "prosa detectada"
      : `${analysis.totalVerses} ${analysis.totalVerses === 1 ? "verso" : "versos"}`;
  }

  if (rimalabNote) {
    rimalabNote.textContent = analysis.proseNote || analysis.note;
  }

  if (analysis.isProse) {
    if (rimalabIsometry) {
      rimalabIsometryTitle && (rimalabIsometryTitle.textContent = "Sem versos detectados");
      rimalabIsometryCopy && (rimalabIsometryCopy.textContent = analysis.proseNote || "Cole versos em linhas separadas para a análise.");
    }
    if (rimalabMetrics) rimalabMetrics.innerHTML = `<p class="rimalab-empty">${escapeHtml(analysis.proseNote || "Escreva versos em linhas separadas.")}</p>`;
    if (rimalabRhymes) rimalabRhymes.innerHTML = `<p class="rimalab-empty">As rimas aparecem aqui quando há versos.</p>`;
    if (rimalabScheme) rimalabScheme.innerHTML = "";
    return;
  }

  renderRimaLabIsometry(analysis);
  renderRimaLabMetrics(analysis.scans);
  renderRimaLabRhymes(analysis.rhymes);

  if (rimalabScheme) {
    if (analysis.stanzas) {
      rimalabScheme.innerHTML = analysis.stanzas.map((st, i) => {
        const name = VeredaRimaLab.nameScheme(st.scheme);
        return `<span class="rimalab-stanza-scheme"><em>Est. ${i + 1}</em> ${escapeHtml(st.scheme)}${name ? ` <small>(${escapeHtml(name)})</small>` : ""}</span>`;
      }).join(" · ");
    } else {
      const scheme = analysis.rhymeScheme || "";
      const name = scheme ? VeredaRimaLab.nameScheme(scheme) : "";
      rimalabScheme.innerHTML = scheme
        ? `${escapeHtml(scheme)}${name ? ` <small>(${escapeHtml(name)})</small>` : ""}`
        : "Esquema: escreva ao menos um verso";
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
      (scan, index) => {
        const verseName = scan.name && scan.name !== `${scan.totalSyllables} sílabas`
          ? ` · ${scan.name}`
          : "";
        const elisionText = scan.ellisions.length
          ? ` · elisão: ${scan.ellisions.map(e => e.replace("⌃", " + ")).map(escapeHtml).join(", ")}`
          : "";
        return `
        <article class="rimalab-metric-row">
          <strong>${index + 1}</strong>
          <div>
            <b>${scan.totalSyllables} sílabas poéticas${escapeHtml(verseName)}</b>
            <span>${escapeHtml(scan.finalWord)} · ${escapeHtml(scan.finalTonicity)}${elisionText}</span>
          </div>
        </article>
        `;
      }
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
    const emptyMsg = decolonialState.query
      ? `Nenhuma entrada encontrada para "${escapeHtml(decolonialState.query)}".`
      : "Nenhuma entrada nesta categoria.";
    decolonialList.innerHTML = `<div class="decolonial-empty">${emptyMsg}</div>`;
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

  if (VeredaDecolonial.hasLoadError()) {
    decolonialObserverSummary.textContent = "Vocabulário não carregado.";
    decolonialObserverList.innerHTML = `<div class="decolonial-observer-empty">Vocabulário não carregado. Recarregue a página para tentar novamente.</div>`;
    return;
  }

  if (!VeredaDecolonial.isLoaded()) {
    decolonialObserverSummary.textContent = "Carregando vocabulário…";
    decolonialObserverList.innerHTML = `<div class="decolonial-observer-empty">Aguarde — carregando o vocabulário decolonial.</div>`;
    VeredaDecolonial.ensureLoaded().then(renderDecolonialObserver);
    return;
  }

  const manuscript = getActiveManuscript();
  if (!manuscript?.text?.trim()) {
    decolonialObserverSummary.textContent = "Sem texto para verificar.";
    decolonialObserverList.innerHTML = `<div class="decolonial-observer-empty">Ative um manuscrito com texto para usar o observador.</div>`;
    return;
  }
  const findings = window.VeredaDecolonial.detectText(manuscript.text)
    .sort((a, b) => b.count - a.count);
  const occurrences = findings.reduce((total, item) => total + item.count, 0);

  if (!findings.length) {
    decolonialObserverSummary.textContent = "Nenhum alerta encontrado neste manuscrito.";
    decolonialObserverList.innerHTML = `<div class="decolonial-observer-empty">O texto passou limpo por esta lente. Ainda vale revisar contexto, representação e ponto de vista.</div>`;
    return;
  }

  decolonialObserverSummary.textContent = `${occurrences} ${occurrences === 1 ? "ocorrência" : "ocorrências"} em ${findings.length} ${findings.length === 1 ? "termo" : "termos"}.`;
  // Agrupa por categoria
  const byCategory = [];
  const seen = new Set();
  findings.forEach(entry => {
    if (!seen.has(entry.categoryLabel)) {
      seen.add(entry.categoryLabel);
      byCategory.push({ label: entry.categoryLabel, entries: [] });
    }
    byCategory[byCategory.length - 1].entries.push(entry);
  });

  decolonialObserverList.innerHTML = byCategory.map(({ label, entries: catEntries }) => {
    const catCount = catEntries.reduce((s, e) => s + e.count, 0);
    const rows = catEntries.map((entry) => {
      const alternatives = entry.alternatives.map(
        (alt) => `<button class="decolonial-alt-copy" data-copy="${escapeHtml(alt)}" title="Copiar alternativa">${escapeHtml(alt)}</button>`
      ).join("");
      return `
        <article class="decolonial-alert${entry.contextual ? " is-contextual" : ""}">
          <div class="decolonial-alert-header">
            <strong>${escapeHtml(entry.avoid)}</strong>
            <span>${entry.count}x</span>
          </div>
          <div class="decolonial-alternatives">
            <i class="material-symbols-outlined" aria-hidden="true">arrow_forward</i>
            ${alternatives}
          </div>
          <p>${escapeHtml(entry.reason)}</p>
          <small>${entry.contextual ? "Depende do contexto — " : ""}${escapeHtml(entry.context)}</small>
        </article>`;
    }).join("");
    return `<div class="decolonial-category-group">
      <h4 class="decolonial-category-heading">${escapeHtml(label)} <b>${catCount}x</b></h4>
      ${rows}
    </div>`;
  }).join("");
}

function renderRightsLab() {
  if (!window.VeredaRights || !rightsCards || !rightsSources) {
    return;
  }

  const query = normalizeSearch(rightsState.query);
  const manuscript = getActiveManuscript();
  const relevantCards = !query ? VeredaRights.getAllRelevantCards(manuscript?.kind || "") : [];
  const relevantIds   = new Set(relevantCards.map(c => c.id));
  const relevantKind  = (relevantIds.size && manuscript?.kind) ? manuscript.kind : null;

  const allCards = window.VeredaRights.getCards();
  const cards = allCards.filter((card) => {
    if (!query) return true;
    return normalizeSearch(
      [card.eyebrow, card.title, card.body, card.watch, card.source, ...(card.do || [])].join(" ")
    ).includes(query);
  });

  // Cards relevantes sobem para o topo quando não há busca ativa
  const sorted = !query && relevantIds.size
    ? [...cards].sort((a, b) => (relevantIds.has(b.id) ? 1 : 0) - (relevantIds.has(a.id) ? 1 : 0))
    : cards;

  const countLine = sorted.length && sorted.length < allCards.length
    ? `<p class="rights-count">${sorted.length} de ${allCards.length} cuidados</p>`
    : "";

  rightsCards.innerHTML = sorted.length
    ? countLine + sorted.map(card => createRightsCardMarkup(card, relevantIds.has(card.id), relevantKind)).join("")
    : `<div class="rights-empty">Nenhum cuidado encontrado para "<strong>${escapeHtml(rightsState.query)}</strong>". Tente: contrato, registro, ISBN, IA, plágio, submissão.</div>`;

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
  const proofLink = card.id === "registro"
    ? `<button class="rights-proof-link" data-action="go-autoria"><span class="material-symbols-outlined">fingerprint</span>Abrir Prova de autoria</button>`
    : "";
  return `
    <article class="rights-card${relevant ? " rights-card--relevant" : ""}">
      <details${relevant ? " open" : ""}>
        <summary class="rights-card-header">
          <span class="material-symbols-outlined">${escapeHtml(card.icon)}</span>
          <div>
            <p class="eyebrow">${escapeHtml(card.eyebrow)}${relevantTag}</p>
            <h3>${escapeHtml(card.title)}</h3>
          </div>
        </summary>
        <p>${escapeHtml(card.body)}</p>
        <ul>
          ${card.do.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
        <div class="rights-watch">
          <strong>Atenção</strong>
          <span>${escapeHtml(card.watch)}</span>
        </div>
        <small>${escapeHtml(card.source)}</small>
        ${proofLink}
      </details>
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
  if (rightsSearchClear) rightsSearchClear.hidden = !rightsSearch.value;
  renderRightsLab();
});
if (rightsSearchClear) rightsSearchClear.addEventListener("click", () => {
  rightsSearch.value = "";
  rightsState.query = "";
  rightsSearchClear.hidden = true;
  renderRightsLab();
  rightsSearch.focus();
});
if (rightsDeathYear) rightsDeathYear.addEventListener("input", () => {
  if (!rightsCalcResult) return;
  const year = parseInt(rightsDeathYear.value, 10);
  if (!year || year < 1400 || year > new Date().getFullYear()) {
    rightsCalcResult.textContent = "";
    return;
  }
  const publicDomainYear = year + 70 + 1;
  const currentYear = new Date().getFullYear();
  if (publicDomainYear <= currentYear) {
    rightsCalcResult.textContent = `Domínio público desde ${publicDomainYear} — pode usar livremente.`;
    rightsCalcResult.className = "rights-calc-result rights-calc-result--ok";
  } else {
    const yearsLeft = publicDomainYear - currentYear;
    rightsCalcResult.textContent = `Domínio público em ${publicDomainYear} — ainda ${yearsLeft} ano${yearsLeft !== 1 ? "s" : ""} protegido${yearsLeft !== 1 ? "s" : ""}.`;
    rightsCalcResult.className = "rights-calc-result rights-calc-result--pending";
  }
});

if (decolonialObserverToggle) decolonialObserverToggle.addEventListener("change", () => {
  decolonialState.observerEnabled = decolonialObserverToggle.checked;
  renderDecolonialObserver();
});

// Clicar em alternativa no observer copia para clipboard
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".decolonial-alt-copy");
  if (!btn) return;
  const text = btn.dataset.copy;
  if (!text) return;
  navigator.clipboard?.writeText(text).then(() => {
    const prev = btn.textContent;
    btn.textContent = "copiado";
    btn.classList.add("is-copied");
    setTimeout(() => { btn.textContent = prev; btn.classList.remove("is-copied"); }, 1500);
  }).catch(() => {});
});
if (precisionCard) precisionCard.addEventListener("change", (event) => {
  const t = event.target.closest("[data-checklist-criterion]");
  if (!t) return;
  const manuscript = getActiveManuscript();
  const template = VeredaTemplates.getTemplate(state.template.selectedId);
  if (!template) return;
  setChecklistCriterion(manuscript.id, template.id, t.dataset.checklistCriterion, t.checked);
});
