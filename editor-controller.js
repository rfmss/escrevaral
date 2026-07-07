// editor-controller.js — renderização do editor, inspetor e markup de precisão
// Depende de: state-store.js (globals DOM + state)

function renderActiveManuscript() {
  const manuscript = getActiveManuscript();
  if (!manuscript) {
    titleInput.value = "";
    writingArea.innerHTML = "";
    writingArea.dataset.placeholder = "Digite ou cole seu texto aqui.";
    writingArea.dataset.placeholderIsExample = "";
    specializedEditor.hidden = true;
    writingArea.hidden = false;
    countStat.textContent = "0 palavras · 0 parágrafos";
    focusCount.textContent = "0 palavras · 0 parágrafos";
    wpmStat.textContent = "—";
    hideWritingCoach();
    return;
  }
  titleInput.value = manuscript.title;
  // Carrega HTML rico se disponível, senão migra texto plano
  if (manuscript.html) {
    writingArea.innerHTML = VeredaDocument.sanitizeHtml(manuscript.html);
  } else {
    writingArea.innerHTML = VeredaDocument.textToHtml(manuscript.text || "");
  }
  // Limpa histórico de undo ao trocar manuscrito
  VeredaDocument.clearHistory();
  // Restaura preset editorial do manuscrito
  if (pagePresetSel) pagePresetSel.value = manuscript.pagePreset || "draft";
  if (pageStartNumberInput) pageStartNumberInput.value = manuscript.pageStartNumber || 1;
  if (pageHeaderTextInput)  pageHeaderTextInput.value  = manuscript.pageHeaderText  || "";
  // Se estiver em modo páginas, re-renderizar com o novo manuscrito
  if (_currentEditorView === "pages" && pagedEditor) {
    const _pc = VeredaPagination.render(pagedEditor, writingArea.innerHTML, manuscript.pagePreset || "draft", "auto", getPageRenderOpts()); updatePageCount(_pc);
  }
  updateWritingPlaceholder();
  renderInspector();
  renderLexicalView();
  renderTemplateReference();
  renderDecolonialObserver();
  renderMetadataForm();
  renderProofView();
  ensureInitialVersion(manuscript);
  renderVersionList();
  renderSpecializedEditor(manuscript);
}

function renderSpecializedEditor(manuscript) {
  if (!specializedEditor) return;
  // Se templates ainda não carregaram, aguarda e re-renderiza
  if (window.VeredaTemplates && !VeredaTemplates.isLoaded()) {
    VeredaTemplates.ready().then(() => renderSpecializedEditor(manuscript));
    return;
  }
  const template = VeredaTemplates.getTemplate(state.template.selectedId);
  const mode = template?.editorMode;

  // Fichas: qualquer kind com schema definido usa o editor de ficha
  if (!mode && manuscript?.kind && window.FICHA_KINDS?.has(manuscript.kind)) {
    writingArea.hidden = true;
    specializedEditor.hidden = false;
    specializedEditor.innerHTML = buildFichaEditor(manuscript.kind, manuscript.text || "");
    const kindLabels = { "Personagem":"Nome do personagem", "Lugar":"Nome do lugar", "Objeto":"Nome do objeto" };
    titleInput.placeholder = kindLabels[manuscript.kind] || `Título · ${manuscript.kind}`;
    return;
  }
  // Personagem legado (type="personagem" de versões anteriores)
  if (!mode && manuscript?.type === "personagem") {
    writingArea.hidden = true;
    specializedEditor.hidden = false;
    specializedEditor.innerHTML = buildPersonagemEditor(manuscript.text || "");
    titleInput.placeholder = "Nome do personagem";
    return;
  }

  const TITLE_PLACEHOLDERS = {
    soneto:     "Título do soneto",
    screenplay: "Título do episódio",
    teatro:     "Título da peça",
    slam:       "Título do poema",
    enem:       "Título da redação",
  };
  titleInput.placeholder = TITLE_PLACEHOLDERS[mode] || "Título do texto";

  if (mode === "soneto") {
    writingArea.hidden = true;
    specializedEditor.hidden = false;
    specializedEditor.innerHTML = buildSonetoEditor(manuscript.text);
  } else if (mode === "screenplay") {
    writingArea.hidden = true;
    specializedEditor.hidden = false;
    specializedEditor.innerHTML = buildScreenplayEditor(manuscript.text);
    // Foca o primeiro campo de ação para deixar claro que é editável
    requestAnimationFrame(() => {
      const firstAction = specializedEditor.querySelector(".sp-slug-input, .sp-action-area");
      if (firstAction && !firstAction.value && document.activeElement === document.body) firstAction.focus();
    });
  } else if (mode === "teatro") {
    writingArea.hidden = true;
    specializedEditor.hidden = false;
    specializedEditor.innerHTML = buildTeatroEditor(manuscript.text);
  } else if (mode === "slam") {
    writingArea.hidden = true;
    specializedEditor.hidden = false;
    specializedEditor.innerHTML = buildSlamEditor(manuscript.text);
  } else if (mode === "enem") {
    writingArea.hidden = true;
    specializedEditor.hidden = false;
    specializedEditor.innerHTML = buildENEMEditor(manuscript.text, template);
    requestAnimationFrame(() => {
      updateENEMCounter();
      // Bloqueia Enter quando no limite de 30 linhas
      const enemArea = specializedEditor.querySelector("[data-enem-area]");
      if (enemArea) {
        enemArea.addEventListener("keydown", (e) => {
          if (e.key !== "Enter") return;
          const sheet = specializedEditor.querySelector("[data-enem-sheet]");
          if (sheet?.dataset.enemFull === "true") {
            e.preventDefault();
            // Feedback visual: pulsa a borda inferior
            sheet.classList.remove("enem-at-limit");
            void sheet.offsetWidth; // força reflow para reiniciar animação
            sheet.classList.add("enem-at-limit");
            setTimeout(() => sheet.classList.remove("enem-at-limit"), 700);
          }
        });
      }
    });
  } else {
    writingArea.hidden = false;
    specializedEditor.hidden = true;
  }
}

function renderMetadataForm() {
  const manuscript = getActiveManuscript();
  const emptyEl  = document.querySelector("[data-archive-panel-empty]");
  const contentEl = document.querySelector("[data-archive-panel-content]");

  if (!manuscript) {
    if (emptyEl)   emptyEl.hidden  = false;
    if (contentEl) contentEl.hidden = true;
    return;
  }

  if (emptyEl)   emptyEl.hidden  = true;
  if (contentEl) contentEl.hidden = false;

  // Mostra identidade da nota no topo do painel
  const identityEl  = document.querySelector("[data-archive-note-identity]");
  const titleEl     = document.querySelector("[data-archive-note-title]");
  const kindEl      = document.querySelector("[data-archive-note-kind]");
  if (identityEl && titleEl && kindEl) {
    identityEl.hidden = false;
    titleEl.textContent = manuscript.title || "Sem título";
    const kindLabel = manuscript.kind || manuscript.type || "";
    const isOpenInEditor = manuscript.id === state.activeId;
    kindEl.textContent = [kindLabel, isOpenInEditor ? "· aberta no editor" : ""].filter(Boolean).join(" ");
  }

  metadataFields.forEach((field) => {
    const value = manuscript[field.dataset.metadataField] ?? "";
    field.value = Array.isArray(value) ? value.join(", ") : value;
  });

  progressReadout.textContent = `${manuscript.progress || 0}%`;
}

let _undoTimer = null;
function updateCurrentManuscript() {
  scheduleUndoPush();
  const manuscript = getActiveManuscript();
  const nextManuscript = {
    ...manuscript,
    title: titleInput.value.trim() || "Texto sem título",
    text: writingArea.innerText.trim(),
    html:  writingArea.innerHTML,
    updatedAt: new Date().toISOString(),
  };

  updateActiveManuscript(nextManuscript);

  updateWritingStats();
  renderLexicalView();
  renderTemplateReference();
  renderDecolonialObserver();
  renderMetadataForm();
  renderManuscriptNavigation();
  renderProjectGrid();
  maybeCreateAutoVersion(nextManuscript);
  queueSave();
}

function _calcHealthScore(alertas) {
  const score = 100 - (alertas.filter(a => a.nivel === "alto").length * 15) - (alertas.filter(a => a.nivel === "moderado").length * 8);
  return Math.max(0, score);
}

function _healthScoreBadge(score) {
  const cls = score >= 85 ? "health-ok" : score >= 60 ? "health-mid" : "health-low";
  return `<span class="voice-health-score ${cls}" aria-label="Saúde textual: ${score} de 100">${score}<small>/100</small></span>`;
}

function createVoiceMirrorMarkup(analysis, criterios, alertas) {
  const healthScore = criterios && alertas ? _calcHealthScore(alertas) : null;
  const alertasHtml = criterios && alertas && alertas.length ? `
    <div class="voice-criterios">
      <h4>Análise editorial — ${alertas.length} ponto(s) de atenção ${healthScore !== null ? _healthScoreBadge(healthScore) : ""}</h4>
      <div class="voice-alertas">
        ${alertas.map(a => {
          const criterio = window.VeredaCriterios ? VeredaCriterios.criterios.find(c => c.id === a.id) : null;
          const fontes = criterio ? criterio.fontes.slice(0, 3).map(f => {
            const livro = VeredaCriterios.getLivroPorId(f);
            return livro ? livro.autor.split(" ").slice(-1)[0] : f;
          }).join(", ") : "";
          return `
          <div class="voice-alerta voice-alerta-${a.nivel}">
            <span class="voice-alerta-dim">${getDimLabel(a.dim)}</span>
            <span class="voice-alerta-body">
              ${escapeHtml(a.msg)}
              ${a.acao ? `<span class="voice-alerta-acao">${escapeHtml(a.acao)}</span>` : ""}
              ${fontes ? `<span class="voice-alerta-fonte">${escapeHtml(fontes)}</span>` : ""}
            </span>
          </div>`;
        }).join("")}
      </div>
      <p class="voice-criterios-note">16 critérios computados localmente, baseados em King, Strunk, Zinsser e outros. <a href="./vereda-biblioteca-escrita.html" target="_blank" rel="noopener">Ver os 39 critérios →</a></p>
    </div>
  ` : criterios ? `
    <div class="voice-criterios voice-criterios--ok">
      <h4>Análise editorial — nenhum alerta ${_healthScoreBadge(100)}</h4>
      <p class="voice-criterios-note">Os 16 critérios computados não detectaram padrões de atenção neste trecho. Isso não substitui a revisão humana.</p>
    </div>
  ` : "";

  const metaHtml = criterios ? `
    <div class="voice-metrics">
      ${createVoiceMetric("Palavras", analysis.counts.words)}
      ${createVoiceMetric("TTR", `${analysis.metrics.ttr}%`)}
      ${createVoiceMetric("Pal/frase", analysis.metrics.avgSentence)}
      ${createVoiceMetric("Legib.", criterios.meta.fleschLabel)}
      ${createVoiceMetric("Passiva", `${criterios.economia.vozPassiva.proporcao}%`)}
      ${createVoiceMetric("-mente", `${criterios.economia.adverbiosMente.densidade}%`)}
    </div>
  ` : `
    <div class="voice-metrics">
      ${createVoiceMetric("Palavras", analysis.counts.words)}
      ${createVoiceMetric("TTR", `${analysis.metrics.ttr}%`)}
      ${createVoiceMetric("Densidade", `${analysis.metrics.lexicalDensity}%`)}
      ${createVoiceMetric("Pal/frase", analysis.metrics.avgSentence)}
    </div>
  `;

  return `
    <div class="voice-result-header">
      <div>
        <h3>${escapeHtml(analysis.voice.title)}</h3>
        <p>${escapeHtml(analysis.voice.description)}</p>
      </div>
      <span class="voice-pill">${escapeHtml(analysis.voice.gesture)}</span>
    </div>
    ${metaHtml}
    ${alertasHtml}
    <div class="voice-columns">
      ${createVoicePanel("Ecos possíveis", analysis.voice.echoes)}
      ${createVoicePanel("Forças", analysis.strengths)}
      ${createVoicePanel("Pontos cegos", analysis.blindSpots)}
      ${createVoicePanel("Exercícios", analysis.exercises)}
      ${createVoiceBars("Temperatura", analysis.emotional)}
      ${createVoiceBars("Campos", analysis.fields)}
    </div>
    ${analysis.audience ? `<div class="voice-audience">
      <h4>Público provável</h4>
      <p>${escapeHtml(analysis.audience.core)}</p>
      <p class="voice-audience-secondary">${escapeHtml(analysis.audience.secondary)}</p>
      <p class="voice-audience-risk"><strong>Risco de perda:</strong> ${escapeHtml(analysis.audience.risk)}</p>
    </div>` : ""}
    ${analysis.confiancaNote ? `<p class="voice-confianca-note voice-confianca-${escapeHtml(analysis.confianca)}">${escapeHtml(analysis.confiancaNote)}</p>` : ""}
    <p class="voice-disclaimer">${escapeHtml(analysis.disclaimer)}</p>
  `;
}

function renderInspector() {
  const manuscript = getActiveManuscript();
  const text = manuscript?.text || writingArea.innerText || "";
  // Em modo Página writingArea fica oculto; usar manuscript.text como fonte primária
  const wordCount = countWords(text || writingArea.innerText);
  const paragraphs = (text.trim() ? text.trim().split(/\n+/).filter(Boolean).length : 0) || writingArea.querySelectorAll("p, h1, h2, h3, h4, h5, h6, blockquote, li").length;

  const charCount = text.replace(/\s/g, "").length;
  const charPart = wordCount > 0 ? ` · ${charCount} car.` : "";
  countStat.textContent = `${wordCount} palavras · ${paragraphs} parágrafos${charPart}`;
  focusCount.textContent = `${wordCount} palavras · ${paragraphs} parágrafos`;
  const wpmLabel = document.querySelector("[data-wpm-label]");
  if (wordCount > 0) {
    const mins = wordCount / 200;
    let wpmVal;
    if (mins < 1) {
      wpmVal = `${Math.round(mins * 60)}s`;
    } else if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = Math.round(mins % 60);
      wpmVal = m > 0 ? `${h}h ${m}min` : `${h}h`;
    } else {
      wpmVal = `~${Math.round(mins)} min`;
    }
    wpmStat.textContent = wpmVal;
    if (wpmLabel) wpmLabel.textContent = "de leitura estimada";
  } else {
    wpmStat.textContent = "—";
    if (wpmLabel) wpmLabel.textContent = "escreva para ver";
  }
  updateGoalDisplay(wordCount);
  checkProgress();

  // Inspector: colapsado por padrão, escritor abre quando quiser
  // Não abre automaticamente — mesa organizada por contexto, não por desbloqueio

  const data = analyzeInspector(text);
  const densityEl = document.querySelector("[data-lexical-density]");
  renderWritingCoach(manuscript, text, wordCount, data);

  if (!data) {
    const kind = manuscript?.kind;
    const kindNote = kind ? ` do seu ${escapeHtml(kind.toLowerCase())}` : "";
    if (wordCloudEl) wordCloudEl.innerHTML = `<span class="inspector-empty">As palavras${kindNote} aparecem aqui conforme o texto cresce</span>`;
    if (grammarBarEl) grammarBarEl.innerHTML = "";
    if (grammarLegendEl) grammarLegendEl.innerHTML = "";
    if (fleschScoreEl) fleschScoreEl.textContent = "—";
    if (fleschLabelEl) fleschLabelEl.innerHTML = "Escreva para ver";
    if (densityEl) densityEl.hidden = true;
    clearTimeout(_viciosTimer);
    renderViciosObserver(manuscript, text, wordCount);
    return;
  }

  if (wordCloudEl) wordCloudEl.innerHTML = data.topWords.length
    ? data.topWords.map(([w, n]) => `<button data-lexical-select="${escapeHtml(w)}">${escapeHtml(w)} (${n})</button>`).join("")
    : `<span class="inspector-empty">Poucas palavras para análise de frequência</span>`;

  if (grammarBarEl) grammarBarEl.innerHTML = data.dist
    .map(d => `<span style="--w:${d.pct}%;--c:${d.color}"></span>`)
    .join("");

  if (grammarLegendEl) grammarLegendEl.innerHTML = data.dist
    .map(d => `<li><i style="--c:${d.color}"></i>${escapeHtml(d.label)} <b>${d.pct}%</b></li>`)
    .join("");

  if (fleschScoreEl) fleschScoreEl.textContent = data.flesch;
  if (fleschLabelEl) fleschLabelEl.innerHTML = `${escapeHtml(data.fleschMeta.label)}<br><span class="flesch-sub">${escapeHtml(data.fleschMeta.sub)}</span>`;
  if (densityEl) {
    densityEl.hidden = false;
    densityEl.textContent = `Densidade lexical: ${data.lexicalDensity}%`;
  }

  // Perfil de voz salvo (quando escritora roda o Espelho de Voz)
  const vpSection  = document.querySelector("[data-voice-profile-section]");
  const vpGesture  = document.querySelector("[data-voice-profile-gesture]");
  const vpTitle    = document.querySelector("[data-voice-profile-title]");
  const vpHint     = document.querySelector("[data-voice-profile-hint]");
  const vp = manuscript?.voiceProfile;
  if (vp && vpSection) {
    vpSection.hidden = false;
    if (vpGesture) vpGesture.textContent = vp.gesture || "";
    if (vpTitle)   vpTitle.textContent   = vp.title   || "";
    const confiancaMap = { alta: "leitura estável", média: "corpus médio", baixa: "corpus curto — leitura instável" };
    const updatedStr = vp.updatedAt ? new Date(vp.updatedAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}) : "";
    if (vpHint) vpHint.textContent = `${confiancaMap[vp.confianca] || vp.confianca}${updatedStr ? ` · ${updatedStr}` : ""}`;
  } else if (vpSection) {
    vpSection.hidden = true;
  }

  scheduleViciosObserver(manuscript, text, wordCount);
}

function resetWritingCoachCta() {
  if (!writingCoachCta) return;
  writingCoachCta.hidden = true;
  writingCoachCta.textContent = "";
  writingCoachCta.removeAttribute("data-action");
  writingCoachCta.removeAttribute("aria-label");
}

function hideWritingCoach() {
  if (!writingCoach) return;
  writingCoach.hidden = true;
  if (writingCoachEyebrow) writingCoachEyebrow.textContent = "Pista do texto";
  if (writingCoachTitle) writingCoachTitle.textContent = "";
  if (writingCoachBody) writingCoachBody.textContent = "";
  resetWritingCoachCta();
}

function getWritingCoachMessage(manuscript, text, wordCount, data) {
  if (!manuscript) return null;

  const template = window.VeredaTemplates?.getTemplate?.(state.template.selectedId) || null;
  const trimmedText = text.trim();
  const topWord = data?.topWords?.[0] || null;
  const topWordCount = topWord?.[1] || 0;
  const topWordRatio = wordCount > 0 ? topWordCount / wordCount : 0;
  const backupNeedsAttention = Boolean(backupWarning && !backupWarning.hidden);

  if (!trimmedText) {
    if (template) {
      return {
        eyebrow: "Folha destravada",
        title: "O guia já está pronto. Agora entre pela primeira frase.",
        body: "Escreva algumas linhas sem se preocupar em revisar. O Escrevaral puxa motores e oficinas depois que o texto ganha corpo.",
      };
    }

    return {
      eyebrow: "Primeiro passo",
      title: "Comece pela folha ou traga um texto seu.",
      body: "Se já escreveu no Word, no celular ou em outro app, pode puxar o arquivo direto para cá. Se preferir, siga livre por algumas linhas e o resto aparece no tempo certo.",
      action: "import-manuscript-files",
      cta: "Trazer texto",
    };
  }

  if (!isManuscriptDocument(manuscript)) {
    return {
      eyebrow: "Organização do projeto",
      title: "Preencha primeiro o que destrava o resto.",
      body: "Nesta ficha, foque no essencial: nome, conflito, objetivo ou contexto. O detalhamento pode vir depois, sem pressa.",
      action: "go-aprender",
      cta: "Abrir guias",
    };
  }

  if (wordCount < 40) {
    return {
      eyebrow: "Fluxo primeiro",
      title: "Ainda é cedo para revisar.",
      body: "Com poucas linhas, qualquer diagnóstico pode mais atrapalhar do que ajudar. Continue até formar um bloco e deixe os motores lerem depois.",
    };
  }

  if (topWord && topWordCount >= 4 && topWordRatio >= 0.05) {
    return {
      eyebrow: "Pista do texto",
      title: `"${topWord[0]}" já comanda boa parte deste trecho.`,
      body: "Talvez seja repetição útil, talvez eco sem querer. O modo Revisar mostra isso com leitura local e ajuda a decidir com calma.",
      action: "go-revisar",
      cta: "Revisar trecho",
    };
  }

  if (data && data.flesch <= 45 && wordCount >= 120) {
    return {
      eyebrow: "Leitura brasileira",
      title: "O trecho ficou mais denso do que o comum.",
      body: "Pode ser escolha de estilo ou atrito real. A revisão local do Escrevaral ajuda a enxergar frase longa, ritmo e clareza sem depender de internet.",
      action: "go-revisar",
      cta: "Ler no revisar",
    };
  }

  if (backupNeedsAttention && wordCount >= 120) {
    return {
      eyebrow: "Proteção do acervo",
      title: "Vale guardar este texto antes de seguir.",
      body: "Um clique já leva você para a cópia de segurança local. O objetivo aqui é não fazer ninguém perder trabalho por falta de nuvem ou assinatura.",
      action: "open-backup-from-proof",
      cta: "Guardar acervo",
    };
  }

  if (!manuscript.voiceProfile && wordCount >= 180) {
    return {
      eyebrow: "Motor de voz",
      title: "Seu texto já tem material para um espelho de voz.",
      body: "Abra a leitura completa para ver gesto, pontos cegos, campos de linguagem e exercícios puxados do próprio trecho.",
      action: "go-revisar",
      cta: "Abrir revisão",
    };
  }

  if (wordCount >= 500) {
    return {
      eyebrow: "Oficina sob demanda",
      title: "O texto ganhou corpo e os motores já acompanham seu ritmo.",
      body: "Siga escrevendo se estiver no embalo. Quando quiser, revisão, prova de autoria e organização já estão a um clique sem tirar você da folha.",
      action: "go-proteger",
      cta: "Ver proteção",
    };
  }

  return {
    eyebrow: "Texto em andamento",
    title: "Continue mais um pouco antes de trocar de modo.",
    body: "O Escrevaral está lendo junto, mas sem atropelar sua mão. Quando você sentir que fechou um bloco, a revisão entra mais forte.",
  };
}

function renderWritingCoach(manuscript, text, wordCount, data) {
  if (!writingCoach || !writingCoachTitle || !writingCoachBody) return;

  const coach = getWritingCoachMessage(manuscript, text, wordCount, data);
  if (!coach) {
    hideWritingCoach();
    return;
  }

  writingCoach.hidden = false;
  if (writingCoachEyebrow) writingCoachEyebrow.textContent = coach.eyebrow || "Pista do texto";
  writingCoachTitle.textContent = coach.title || "";
  writingCoachBody.textContent = coach.body || "";

  if (!writingCoachCta || !coach.action || !coach.cta) {
    resetWritingCoachCta();
    return;
  }

  writingCoachCta.hidden = false;
  writingCoachCta.dataset.action = coach.action;
  writingCoachCta.textContent = coach.cta;
  writingCoachCta.setAttribute("aria-label", coach.cta);
}

let _viciosTimer = null;
function scheduleViciosObserver(manuscript, text, wordCount) {
  clearTimeout(_viciosTimer);
  _viciosTimer = setTimeout(() => renderViciosObserver(manuscript, text, wordCount), 700);
}

function renderViciosObserver(manuscript, text, wordCount) {
  const section   = document.querySelector("[data-vicios-section]");
  const summaryEl = document.querySelector("[data-vicios-summary]");
  const listEl    = document.querySelector("[data-vicios-list]");
  const moreBtn   = document.querySelector("[data-vicios-more]");
  if (!section || !summaryEl || !listEl) return;

  if (!manuscript || !isManuscriptDocument(manuscript)) {
    section.hidden = true;
    return;
  }
  section.hidden = false;

  if (wordCount < 50 || !window.VeredaAnalise) {
    summaryEl.innerHTML = `<span class="inspector-empty">Os pontos de atenção aparecem aqui a partir de 50 palavras</span>`;
    listEl.innerHTML = "";
    if (moreBtn) moreBtn.hidden = true;
    return;
  }

  // Teto de leitura: em manuscritos muito longos, analisa só o trecho mais recente
  // para manter a leitura ao vivo leve. A leitura completa continua no Espelho de Voz.
  const VICIOS_CHAR_CAP = 20000;
  const textoLido = text.length > VICIOS_CHAR_CAP ? text.slice(-VICIOS_CHAR_CAP) : text;

  const criterios = VeredaAnalise.analisar(textoLido, buildAnaliseContext(manuscript));
  const alertas = VeredaAnalise.interpretarResultado(criterios);
  const score = _calcHealthScore(alertas);

  if (!alertas.length) {
    summaryEl.innerHTML = `${_healthScoreBadge(score)}<span>Nenhum ponto sinalizado nesta leitura.</span>`;
    listEl.innerHTML = "";
    if (moreBtn) moreBtn.hidden = true;
    return;
  }

  const top = alertas.slice(0, 3);
  summaryEl.innerHTML = `${_healthScoreBadge(score)}<span>${alertas.length} ${alertas.length === 1 ? "ponto" : "pontos"} de atenção</span>`;
  listEl.innerHTML = top.map(a => `
    <li class="voice-alerta voice-alerta-${escapeHtml(a.nivel)}">
      <span class="voice-alerta-dim">${escapeHtml(getDimLabel(a.dim))}</span>
      <span class="voice-alerta-body">${escapeHtml(a.msg)}</span>
    </li>
  `).join("");
  if (moreBtn) moreBtn.hidden = false;
}

function renderTemplateReference() {
  const template = VeredaTemplates.getTemplate(state.template.selectedId);
  const manuscript = getActiveManuscript();

  referenceTitle.textContent = template?.label || "Escolha um guia";
  updateWritingPlaceholder(template);
  referenceTabs.innerHTML = "";

  if (!manuscript) {
    precisionCard.innerHTML = "";
    referenceBody.innerHTML = "";
    return;
  }

  const wordCount = countWords(manuscript.text || "");
  const readyForPrecision = wordCount >= 50;

  if (isManuscriptDocument(manuscript)) {
    precisionCard.innerHTML = readyForPrecision
      ? createPrecisionMarkup(VeredaPrecision.analyze(template || {}, manuscript.text), manuscript, template)
      : "";  // guia aparece como companhia, não avaliação, antes de 50 palavras
  } else {
    precisionCard.innerHTML = createProjectNotePrecisionMarkup(manuscript);
  }
  referenceBody.innerHTML = template ? createReferenceMarkup(template) : `<div class="reference-empty-state"><p>Um guia acompanha a escrita com a estrutura do ofício escolhido — conto, crônica, soneto, roteiro e mais.</p><button class="reference-pick-guide" data-view-target="academia" data-academia-scroll="template-studio">Escolher guia</button></div>`;
}

function createProjectNotePrecisionMarkup(manuscript) {
  const type = getArchiveType(manuscript);
  return `
    <div class="precision-top">
      <span>Nota de projeto</span>
      <strong>--</strong>
    </div>
    <div class="precision-meter" aria-label="Acompanhamento indisponível para nota de projeto">
      <i style="--score: 0%"></i>
    </div>
    <p>${escapeHtml(type.label)} não usa acompanhamento de forma.</p>
    <div class="precision-checks">
      <div class="precision-check is-passed">
        <span class="material-symbols-outlined">info</span>
        <div>
          <strong>Use como material de apoio</strong>
          <small>Pesquisa, mundo, personagens e cronologia ajudam o manuscrito, mas não são avaliados como texto final.</small>
        </div>
      </div>
    </div>
  `;
}

function createPrecisionMarkup(analysis, manuscript, template) {
  if (!manuscript.text?.trim()) {
    const firstSections = (template?.guidance?.sections || []).slice(0, 3);
    const hintsHtml = firstSections.length
      ? `<div class="precision-hints">${firstSections.map(([title, desc]) =>
          `<div class="precision-hint"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(desc)}</span></div>`
        ).join("")}</div>`
      : "";
    return `
      <div class="precision-empty">
        ${hintsHtml || `<span class="material-symbols-outlined">edit_note</span><p>Escreva mais para ver como o texto conversa com o guia.</p>`}
      </div>`;
  }
  const checklist = getChecklistFor(manuscript.id, template?.id);

  const automaticChecks = analysis.checks.filter((c) => c.passed !== undefined);
  const manualChecks = analysis.checks.filter((c) => c.passed === undefined);

  const automaticHtml = automaticChecks.length
    ? `
    <div class="precision-subsection">
      <div class="precision-subsection-label">
        <span class="material-symbols-outlined">analytics</span>
        Pistas do texto
      </div>
      ${automaticChecks.map((check) => `
        <div class="precision-check${check.passed ? " is-passed" : ""}">
          <span class="precision-check-icon">
            ${check.passed
              ? `<span class="material-symbols-outlined">check_circle</span>`
              : `<span class="material-symbols-outlined is-pending-icon">radio_button_unchecked</span>`}
          </span>
          <div>
            <strong>${escapeHtml(check.label)}</strong>
            <small>${escapeHtml(check.hint)}</small>
          </div>
        </div>
      `).join("")}
    </div>`
    : "";

  const manualHtml = manualChecks.length
    ? `
    <div class="precision-subsection precision-subsection-manual">
      <div class="precision-subsection-label">
        <span class="material-symbols-outlined">checklist</span>
        Minha revisão
      </div>
      ${manualChecks.map((check) => {
        const checked = Boolean(checklist[check.label]);
        return `
          <label class="precision-check is-manual${checked ? " is-checked" : ""}">
            <input type="checkbox" data-checklist-criterion="${escapeHtml(check.label)}" ${checked ? "checked" : ""}>
            <div>
              <strong>${escapeHtml(check.label)}</strong>
              <small>${escapeHtml(check.hint)}</small>
            </div>
          </label>
        `;
      }).join("")}
    </div>`
    : "";

  return `
    <div class="precision-top">
      <span class="precision-top-label">
        Como o texto conversa com o guia
        <span class="precision-hint-anchor" tabindex="0" aria-label="O que é isso?">
          <span class="material-symbols-outlined">info</span>
          <span class="precision-hint-tooltip" role="tooltip">
            O guia sugere elementos para o formato escolhido. Isso mostra o quanto seu texto já cobre esses elementos — é apoio, não nota de prova.
          </span>
        </span>
      </span>
      <strong>${(analysis.words ?? 0) < 50 ? "Ainda cedo" : `${analysis.score ?? 0}%`}</strong>
    </div>
    <div class="precision-meter" aria-label="Como o texto conversa com o guia">
      <i style="--score: ${analysis.score}%"></i>
    </div>
    <p>${(analysis.words ?? 0) < 50 ? "Continue escrevendo" : `${escapeHtml(analysis.status ?? "—")} · ${analysis.words ?? 0}${analysis.limit ? `/${analysis.limit}` : ""} palavras`}</p>
    <div class="precision-checks">
      ${automaticHtml}
      ${manualHtml}
    </div>
    ${(analysis.words ?? 0) >= 50 ? `<button class="ghost-button precision-export-btn" data-action="export-precision" title="Baixar análise de aderência em TXT" aria-label="Baixar análise de aderência">
      <span class="material-symbols-outlined">download</span>
      Baixar análise
    </button>` : ""}
  `;
}

function createReferenceMarkup(template) {
  const guidance = template.guidance || { meta: [], sections: [], reminders: [] };
  const formatBlock = guidance.format ? createFormatRulesMarkup(guidance.format) : "";
  const model = template.model ? createModelMarkup(template.model, template.oficio) : "";

  // Blueprint: DNA + construção + conectivos da forma
  const blueprintBlock = guidance.blueprint ? `
    <section class="reference-blueprint">
      <h3>Como esta forma funciona</h3>
      <div class="blueprint-body">
        ${escapeHtml(guidance.blueprint).replace(/\n/g, "<br>")}
      </div>
    </section>
  ` : "";

  // Sketch: esqueleto com marcadores — para copiar se quiser começar com estrutura
  const sketchBlock = guidance.sketch ? `
    <section class="reference-sketch">
      <details>
        <summary>Começar com estrutura</summary>
        <pre class="sketch-body">${escapeHtml(guidance.sketch)}</pre>
      </details>
    </section>
  ` : "";

  return `
    ${blueprintBlock}
    ${formatBlock}
    <section>
      <h3>Estrutura</h3>
      <div class="reference-sections">
        ${(guidance.sections || [])
          .map(
            ([title, description]) => `
              <article>
                <strong>${escapeHtml(title)}</strong>
                <p>${escapeHtml(description)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
    <section>
      <h3>Lembretes</h3>
      <ul>
        ${(guidance.reminders || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
    ${sketchBlock}
    ${model}
  `;
}

function createFormatRulesMarkup(format) {
  return `
    <section class="format-rules">
      <div class="format-rules-header">
        <span class="material-symbols-outlined">format_shapes</span>
        <strong>${escapeHtml(format.label)}</strong>
      </div>
      <ul class="format-rules-list">
        ${format.rules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function createModelMarkup(model, oficio) {
  const scaffoldLabel = /roteiro|script|screenplay/i.test(oficio || "")
    ? "Estrutura — substitua cada bloco pela sua cena"
    : /poema|poesia|soneto|slam|haiku|cordel|verso/i.test(oficio || "")
    ? "Estrutura — substitua cada linha pelo seu verso"
    : "Estrutura — substitua cada trecho pelo seu texto";
  const placeholderHtml = model.placeholder
    ? `<div class="reference-scaffold">
        <p class="reference-scaffold-caption">${scaffoldLabel}</p>
        <pre>${escapeHtml(model.placeholder)}</pre>
       </div>`
    : "";
  return `
    <section class="reference-model">
      <h3>Como soa este formato</h3>
      <article>
        ${placeholderHtml}
        <strong>${escapeHtml(model.exemplar)}</strong>
        <p>${escapeHtml(model.why)}</p>
        <small>Referências: ${model.references.map(escapeHtml).join(", ")}.</small>
      </article>
    </section>
  `;
}

const KIND_PLACEHOLDERS = [
  [/poema|poesia|soneto|slam|haiku|cordel|verso/,      "A primeira imagem. O silêncio antes do verso."],
  [/conto|ficção|ficao|narrative|narrativ/,             "A primeira cena, o primeiro gesto, o primeiro fio."],
  [/romance|novel|capítulo|capitulo/,                   "Onde estamos? Quem está aqui? O que eles querem?"],
  [/cr[oô]nica/,                                        "Comece no detalhe que te surpreendeu."],
  [/ensaio|essay|argum/,                                "Qual é a tese que você quer defender?"],
  [/roteiro|script|screenplay|cena|audiovisual/,        "INT./EXT. LOCAL — DIA. O que a câmera vê?"],
  [/reportagem|jornalismo|jornali/,                     "Quem, o quê, onde, quando — nessa ordem."],
  [/biografi|autobiografi|memoir|memória|memoria/,      "Escolha um momento. Coloque-nos nele."],
  [/carta|letter/,                                      "Escreva como se a pessoa fosse ler agora."],
  [/drag[aã]o|fant[aá]stico|fantasia|sf|sci.fi/,       "Qual é a regra do mundo? Quebre-a uma vez."],
  [/terror|horror|suspense|thriller/,                   "O que a personagem ainda não sabe que deveria ter feito?"],
];

function placeholderByKind(kind) {
  if (!kind) return null;
  const k = kind.toLowerCase();
  for (const [re, text] of KIND_PLACEHOLDERS) {
    if (re.test(k)) return text;
  }
  return null;
}

function updateWritingPlaceholder(template = VeredaTemplates.getTemplate(state.template.selectedId)) {
  const literary = template?.model?.placeholder;
  if (literary) {
    writingArea.dataset.placeholder = literary;
    writingArea.dataset.placeholderIsExample = "true";
  } else {
    const kind = getActiveManuscript()?.kind;
    const byKind = placeholderByKind(kind);
    writingArea.dataset.placeholder = byKind || "Digite ou cole seu texto aqui.";
    writingArea.dataset.placeholderIsExample = byKind ? "true" : "";
  }
  updateEditorQuote();
}

function updateEditorQuote() {
  const quoteEl    = document.querySelector("[data-editor-quote]");
  const textEl     = document.querySelector("[data-editor-quote-text]");
  const authorEl   = document.querySelector("[data-editor-quote-author]");
  if (!quoteEl || !textEl || !authorEl) return;

  const isEmpty = !writingArea.innerText?.trim();
  const isSpecialized = specializedEditor && !specializedEditor.hidden;
  quoteEl.hidden = !isEmpty || isSpecialized;

  if (!isEmpty || isSpecialized) return;

  // Escolhe frase pelo índice do dia para variar mas ser estável no dia
  const quotes = window.EscrevaralQuotes;
  if (!quotes?.length) return;
  const idx = Math.floor(Date.now() / 86400000) % quotes.length;
  const q   = quotes[idx];
  textEl.textContent   = `"${q.q}"`;
  authorEl.textContent = `— ${q.a}`;
}

function insertPlainTextAtSelection(text) {
  if (!text) return;
  // execCommand mantém undo nativo do browser no contenteditable
  if (!document.execCommand("insertText", false, text)) {
    // fallback para browsers que bloqueiam execCommand em contextos restritos
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    sel.deleteFromDocument();
    sel.getRangeAt(0).insertNode(document.createTextNode(text));
    sel.collapseToEnd();
  }
}

function showEditorNotice(message) {
  const toast = document.getElementById("save-hint-toast");
  const textEl = toast?.querySelector("span:not(.material-symbols-outlined)");
  if (!toast || !textEl) return;
  textEl.textContent = message;
  toast.style.opacity = "1";
  toast.style.transform = "translateX(-50%) translateY(0)";
  toast.style.pointerEvents = "auto";
  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(8px)";
    toast.style.pointerEvents = "none";
  }, 5000);
}

writingArea.addEventListener("paste", (e) => {
  e.preventDefault();
  const cbd = e.clipboardData || window.clipboardData;
  const text = cbd ? cbd.getData("text/plain") : "";
  const html = cbd ? cbd.getData("text/html") : "";
  const hadExternalMarkup = /<\/?[a-z][\s\S]*>/i.test(html);
  insertPlainTextAtSelection(text);
  recordClipboardProof("paste");
  if (hadExternalMarkup && saveStatus) {
    window.setTimeout(() => {
      saveStatus.textContent = "Texto colado sem formatação externa";
      saveStatus.title = "O Escrevaral manteve só as palavras para preservar a folha limpa.";
    }, 520);
    showEditorNotice("Formatação externa removida. Só o texto foi colado.");
  }
});
writingArea.addEventListener("cut",   () => recordClipboardProof("cut"));
writingArea.addEventListener("mouseup", () => captureSelectedWord(true));
writingArea.addEventListener("keyup", () => captureSelectedWord(false));

// ── UNDO / REDO GLOBAL (intercepta só no modo páginas) ────────────────────
// No modo fluxo o browser cuida do undo/redo nativo no contenteditable.
document.addEventListener("keydown", (e) => {
  const mod = e.ctrlKey || e.metaKey;
  if (!mod) return;
  if (_currentEditorView !== "pages") return;

  // Verifica se o foco está dentro de um page-body
  const inPage = document.activeElement?.closest(".page-body");
  if (!inPage) return;

  const isUndo = !e.shiftKey && e.key === "z";
  const isRedo = e.key === "y" || (e.shiftKey && e.key === "z");

  if (!isUndo && !isRedo) return;
  e.preventDefault();

  const cursor = saveCursorPosition();
  const current = writingArea.innerHTML;
  const restored = isUndo
    ? VeredaDocument.undo(current)
    : VeredaDocument.redo(current);

  if (restored === null) return;

  writingArea.innerHTML = restored;
  updateCurrentManuscript();

  const ms = getActiveManuscript();
  const _pc = VeredaPagination.render(pagedEditor, restored, ms?.pagePreset || "draft", "auto", getPageRenderOpts()); updatePageCount(_pc);
  restoreCursorPosition(cursor);
});

// ── DICA CONTEXTUAL DA ACADEMIA APÓS PAUSA (P11) ──────
const academiaHintToast = document.getElementById("academia-hint-toast");
const HINT_IDLE_MS = 90_000; // 90s de pausa dispara o toast
const HINT_AUTO_HIDE_MS = 12_000; // some sozinho após 12s

function buildFichaEditor(kind, text) {
  const schema = window.FICHA_SCHEMAS?.[kind] || [];
  const data   = parseFichaData(text, kind);
  return `<div class="ficha-editor" data-ficha-kind="${escapeHtml(kind)}">` +
    schema.map(f => {
      const val = escapeHtml(data[f.key] || "");
      const input = f.area
        ? `<textarea class="ficha-input ficha-textarea" data-ficha-key="${f.key}" placeholder="${escapeHtml(f.ph)}" rows="3">${val}</textarea>`
        : `<input  class="ficha-input" type="text"  data-ficha-key="${f.key}" placeholder="${escapeHtml(f.ph)}" value="${val}">`;
      return `<div class="ficha-field"><label class="ficha-label">${escapeHtml(f.label)}</label>${input}</div>`;
    }).join("") +
  `</div>`;
}

function buildPersonagemEditor(text) {
  const data = parsePersonagemData(text);
  return `<div class="personagem-editor">` +
    PERSONAGEM_FIELDS.map(section => `
      <div class="persona-section">
        <h3 class="persona-section-title">${section.section}</h3>
        <div class="persona-fields">
          ${section.fields.map(f => `
            <div class="persona-field${f.wide ? " wide" : ""}${f.narrow ? " narrow" : ""}">
              <label class="persona-label">${f.label}</label>
              ${f.area
                ? `<textarea class="persona-input persona-textarea" data-persona-field="${f.key}" placeholder="${escapeHtml(f.ph)}" rows="3">${escapeHtml(data[f.key] || "")}</textarea>`
                : `<input class="persona-input" type="text" data-persona-field="${f.key}" placeholder="${escapeHtml(f.ph)}" value="${escapeHtml(data[f.key] || "")}">`
              }
            </div>`).join("")}
        </div>
      </div>`).join("") +
  `</div>`;
}

window.VeredaEditorController = { init: true }; // âncora de boot

// ── Input listeners do Editor ─────────────────────────────────────────────────
if (metadataForm) {
  metadataForm.addEventListener("input", () => updateCurrentMetadata());
  metadataForm.addEventListener("focusout", () => renderMetadataForm());
  const progressSaved = document.querySelector("[data-progress-saved]");
  metadataForm.querySelector?.("[data-metadata-field='progress']")?.addEventListener("change", () => {
    if (progressSaved) {
      progressSaved.hidden = false;
      clearTimeout(progressSaved._t);
      progressSaved._t = setTimeout(() => { progressSaved.hidden = true; }, 2000);
    }
  });
}
if (templateSearch) templateSearch.addEventListener("input", () => setTemplateSearch(templateSearch.value));

// ── ORA-PRO-NÓBIS PARALLAX ────────────────────────────────────────────────────
// Folhas nas margens da folha se movem suavemente com o mouse.
// Apenas desktop (min-width: 821px), apenas tema Scriptorium.
// Movimento máximo: 4px horizontal, 2px vertical.
// Respeitia prefers-reduced-motion via CSS — aqui só atualiza vars.
;(function initLeafParallax() {
  const DESKTOP_MIN = 821;
  const MAX_X = 4;
  const MAX_Y = 2;
  let rafId = null;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  function isActive() {
    return (
      document.documentElement.dataset.theme === "scriptorium" &&
      window.innerWidth >= DESKTOP_MIN &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    currentX = lerp(currentX, targetX, 0.06);
    currentY = lerp(currentY, targetY, 0.06);
    const r = document.documentElement;
    r.style.setProperty("--leaf-x", `${currentX.toFixed(2)}px`);
    r.style.setProperty("--leaf-y", `${currentY.toFixed(2)}px`);
    rafId = requestAnimationFrame(tick);
  }

  document.addEventListener("mousemove", (e) => {
    if (!isActive()) return;
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    targetX = ((e.clientX - cx) / cx) * MAX_X;
    targetY = ((e.clientY - cy) / cy) * MAX_Y;
    if (!rafId) rafId = requestAnimationFrame(tick);
  });

  document.addEventListener("mouseleave", () => {
    targetX = 0; targetY = 0;
  });

  // Pausar quando janela não está em foco
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && rafId) { cancelAnimationFrame(rafId); rafId = null; }
  });
}());
