// ── ANÁLISE SINTÁTICA — seleção de frase ─────────────────────────────────────

const syntaxPanel      = document.querySelector("[data-syntax-panel]");
const syntaxTokensEl   = document.querySelector("[data-syntax-tokens]");
const syntaxSummaryEl  = document.querySelector("[data-syntax-summary]");
const linguisticPanel  = document.querySelector("[data-linguistic-panel]");

const FUNCAO_LABEL = {
  sujeito:     "Sujeito",
  verbo:       "Verbo",
  objeto:      "Objeto",
  adjunto:     "Adjunto",
  conjuncao:   "Conjunção",
  preposicao:  "Prep.",
  predicativo: "Predicativo",
  vocativo:    "Vocativo",
  aposto:      "Aposto",
};

const FUNCAO_COLOR = {
  sujeito:     "#2a7d52",
  verbo:       "#1a5fa8",
  objeto:      "#b06000",
  adjunto:     "#7a2d8a",
  conjuncao:   "#888",
  preposicao:  "#aaa",
  predicativo: "#c04030",
};

function normalizarFuncao(funcao) {
  if (!funcao) return null;
  const f = funcao.toLowerCase();
  if (f.includes("vocativo"))   return "vocativo";
  if (f.includes("aposto"))     return "aposto";
  if (f.includes("sujeito"))    return "sujeito";
  if (f.includes("verbo") || f.includes("predicado")) return "verbo";
  if (f.includes("objeto dir")) return "objeto";
  if (f.includes("objeto ind")) return "objeto";
  if (f.includes("adjunto adv")) return "adjunto";
  if (f.includes("adjunto adn")) return "adjunto";
  if (f.includes("conjunção") || f.includes("conjuncao")) return "conjuncao";
  if (f.includes("prep") || f.includes("artigo")) return "preposicao";
  if (f.includes("predicativo")) return "predicativo";
  return null;
}

function buildTooltip(termo) {
  const linhas = [];
  if (termo.tagsLegíveis?.length) linhas.push(termo.tagsLegíveis.slice(0,3).join(" · "));
  if (termo.tempo)    linhas.push(termo.tempo);
  if (termo.conjuncao) {
    linhas.push(`${termo.conjuncao.classe} ${termo.conjuncao.tipo}`);
    linhas.push(termo.conjuncao.descricao);
  }
  if (termo.funcao)   linhas.push(termo.funcao);
  return linhas.join("<br>");
}

function renderSyntaxPanel(texto) {
  if (!window.syntaxEngine?._isReady()) return;
  if (!syntaxTokensEl || !syntaxSummaryEl || !syntaxPanel) return;

  const resultado = syntaxEngine.analisarPeriodo(texto);
  const termos    = resultado.termos.filter(t => t.text?.trim() && !/^[.,;:!?]$/.test(t.text));

  if (!termos.length) {
    syntaxTokensEl.innerHTML = `<span class="syntax-empty">Selecione uma frase com ao menos um verbo para ver a análise.</span>`;
    syntaxSummaryEl.innerHTML = "";
    syntaxPanel.hidden = false;
    if (state.layout.rightCollapsed) togglePanel("right");
    return;
  }

  // Tokens no painel
  syntaxTokensEl.innerHTML = termos.map(t => {
    const fn     = normalizarFuncao(t.funcao);
    const label  = FUNCAO_LABEL[fn] || "";
    const tip    = buildTooltip(t);
    return `<span class="syntax-token" data-funcao="${fn || ''}" tabindex="0">
      <span class="syntax-token-word">${escapeHtml(t.text)}</span>
      ${label ? `<span class="syntax-token-label">${label}</span>` : ""}
      ${tip ? `<span class="syntax-token-tooltip">${tip}</span>` : ""}
    </span>`;
  }).join("");

  // Resumo
  const r = resultado.resumo;
  let sumHTML = `<div class="syntax-summary-item">
    <span class="syntax-summary-label">Período</span>
    <span class="syntax-summary-value">${escapeHtml(r.tipo)}</span>
  </div>`;

  if (r.verbos.length) {
    const vStr = r.verbos.map(v => `${v.forma}${v.tempo ? " · " + v.tempo : ""}`).join("; ");
    sumHTML += `<div class="syntax-summary-item">
      <span class="syntax-summary-label">Verbos</span>
      <span class="syntax-summary-value">${escapeHtml(vStr)}</span>
    </div>`;
  }

  if (r.conjuncoes.length) {
    const cStr = r.conjuncoes.map(c => `${c.palavra} (${c.relacao || c.tipo})`).join("; ");
    sumHTML += `<div class="syntax-summary-item">
      <span class="syntax-summary-label">Relação</span>
      <span class="syntax-summary-value">${escapeHtml(cStr)}</span>
    </div>`;
  }

  if (r.locucoes.length) {
    const lStr = [...new Set(r.locucoes.map(l => l.locucao))].join(", ");
    sumHTML += `<div class="syntax-summary-item">
      <span class="syntax-summary-label">Locução</span>
      <span class="syntax-summary-value">${escapeHtml(lStr)}</span>
    </div>`;
  }

  if (r.vozePassiva) {
    sumHTML += `<div class="syntax-summary-item">
      <span class="syntax-summary-label">Voz</span>
      <span class="syntax-summary-value">Passiva analítica</span>
    </div>`;
  }

  if (r.vocativos?.length) {
    sumHTML += `<div class="syntax-summary-item">
      <span class="syntax-summary-label">Vocativo</span>
      <span class="syntax-summary-value">${escapeHtml(r.vocativos.join(", "))}</span>
    </div>`;
  }

  if (r.apostos?.length) {
    const aStr = r.apostos.map(a => `${a.antecedente} → ${a.aposto}`).join("; ");
    sumHTML += `<div class="syntax-summary-item">
      <span class="syntax-summary-label">Aposto</span>
      <span class="syntax-summary-value">${escapeHtml(aStr)}</span>
    </div>`;
  }

  if (r.alertas?.length) {
    const alertaStr = r.alertas.map(a => a.descricao).join(" · ");
    sumHTML += `<div class="syntax-summary-item syntax-summary-alerta">
      <span class="syntax-summary-label">Atenção</span>
      <span class="syntax-summary-value">${escapeHtml(alertaStr)}</span>
    </div>`;
  }

  syntaxSummaryEl.innerHTML = sumHTML;

  // Abrir inspector se estiver fechado
  if (state.layout.rightCollapsed) togglePanel("right");

  // Mostrar painel sintático, ocultar cabeçalho linguístico
  syntaxPanel.hidden = false;
  if (linguisticPanel) linguisticPanel.style.display = "none";
}

function hideSyntaxPanel() {
  if (syntaxPanel) syntaxPanel.hidden = true;
  if (linguisticPanel) linguisticPanel.style.display = "";
}

// Detectar seleção de frase (mínimo 3 palavras)
let _syntaxDebounce = null;
document.addEventListener("selectionchange", () => {
  clearTimeout(_syntaxDebounce);
  _syntaxDebounce = setTimeout(() => {
    const sel  = window.getSelection();
    const texto = sel?.toString().trim() || "";
    const palavras = texto.split(/\s+/).filter(Boolean).length;

    if (palavras >= 3 && writingArea?.contains(sel?.anchorNode) && !(texto.startsWith("(") && texto.endsWith(")"))) {
      if (!syntaxTokensEl || !syntaxSummaryEl || !syntaxPanel) return;
      if (window.syntaxEngine?._hasLoadError?.()) {
        syntaxTokensEl.innerHTML = `<span class="syntax-empty">Dados sintáticos não carregados. Recarregue a página.</span>`;
        syntaxSummaryEl.innerHTML = "";
        syntaxPanel.hidden = false;
        if (state.layout.rightCollapsed) togglePanel("right");
      } else if (!window.syntaxEngine?._isReady()) {
        syntaxTokensEl.innerHTML = `<span class="syntax-empty">Carregando análise…</span>`;
        syntaxSummaryEl.innerHTML = "";
        syntaxPanel.hidden = false;
        syntaxEngine?.init().then(() => renderSyntaxPanel(texto));
      } else {
        renderSyntaxPanel(texto);
      }
    } else if (!texto) {
      hideSyntaxPanel();
    }
  }, 350);
});

// Inicializar o motor assim que possível
if (window.syntaxEngine) {
  syntaxEngine.init();
}

// Posicionar tooltips com position:fixed para escapar overflow do inspector
document.addEventListener("mouseover", (e) => {
  const token = e.target.closest(".syntax-token");
  if (!token) return;
  const tip = token.querySelector(".syntax-token-tooltip");
  if (!tip) return;
  const rect = token.getBoundingClientRect();
  tip.style.top  = (rect.bottom + 6) + "px";
  tip.style.left = (rect.left + rect.width / 2) + "px";
  tip.style.transform = "translateX(-50%)";
});

// ── SINÔNIMOS — hover sobre palavra no editor ─────────────────────────────────

// Cache por letra — lazy loading fragmentado
const _synCache = {};
let _synLoading = false;
let _synPopover = null;
let _synHoverTimer = null;
let _synHideTimer = null;

async function loadSynonyms(word) {
  const norm = word.toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûç-]/g, "");
  const letter = norm[0] || '_';
  if (_synCache[letter] !== undefined) return;
  try {
    const data = await fetch(`synonyms/${letter}.json?v=20260514-f3`).then(r => r.json());
    _synCache[letter] = data;
  } catch(e) {
    _synCache[letter] = {};
  }
}

function getSynonyms(word) {
  const norm = word.toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûç-]/g, "");
  const letter = norm[0] || '_';
  const bucket = _synCache[letter];
  if (!bucket) return [];
  return bucket[norm]?.s?.slice(0, 3) || [];
}

function createSynPopover() {
  if (_synPopover) return _synPopover;
  const el = document.createElement("div");
  el.className = "syn-popover";
  el.setAttribute("aria-label", "Sinônimos");
  document.body.appendChild(el);
  el.addEventListener("mouseenter", () => clearTimeout(_synHideTimer));
  el.addEventListener("mouseleave", hideSynPopover);
  _synPopover = el;
  return el;
}

function showSynPopover(word, targetEl) {
  const sins = getSynonyms(word);
  if (!sins.length) return;

  const pop = createSynPopover();
  const rect = targetEl.getBoundingClientRect();

  pop.innerHTML = sins.map(s =>
    `<button class="syn-option" data-replace="${escapeHtml(s)}" data-original="${escapeHtml(word)}">${escapeHtml(s)}</button>`
  ).join("");

  pop.style.top  = (rect.bottom + window.scrollY + 6) + "px";
  pop.style.left = (rect.left + window.scrollX + rect.width / 2) + "px";
  pop.classList.add("is-visible");
}

function hideSynPopover() {
  _synHideTimer = setTimeout(() => {
    if (_synPopover) _synPopover.classList.remove("is-visible");
  }, 180);
}

// Range da palavra sob o mouse — salvo para substituição precisa
let _synWordRange = null;

function getWordRangeAtPoint(x, y) {
  let range;
  // API moderna
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(x, y);
  } else if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y);
    if (!pos) return null;
    range = document.createRange();
    range.setStart(pos.offsetNode, pos.offset);
    range.collapse(true);
  }
  if (!range) return null;

  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE) return null;

  const text = node.textContent;
  let start = range.startOffset;
  let end = range.startOffset;

  // Expandir para a palavra completa
  while (start > 0 && /[\p{L}\p{N}'-]/u.test(text[start - 1])) start--;
  while (end < text.length && /[\p{L}\p{N}'-]/u.test(text[end])) end++;

  if (start === end) return null;

  const wordRange = document.createRange();
  wordRange.setStart(node, start);
  wordRange.setEnd(node, end);
  return wordRange;
}

function replaceWordInEditor(replacement) {
  if (!_synWordRange) return;
  writingArea.focus();
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(_synWordRange);
  const original = _synWordRange.toString();
  document.execCommand("insertText", false, replacement);
  _synWordRange = null;
  updateCurrentManuscript();
  persistState(`${original} → ${replacement}`);
  hideSynPopover();
}

// Hover sobre qualquer texto do editor (sem precisar do modo Classes)
writingArea.addEventListener("mousemove", async (e) => {
  clearTimeout(_synHoverTimer);
  _synHoverTimer = setTimeout(async () => {
    const wordRange = getWordRangeAtPoint(e.clientX, e.clientY);
    if (!wordRange) { hideSynPopover(); return; }

    const word = wordRange.toString().trim();
    if (word.length < 3 || /\d/.test(word)) { hideSynPopover(); return; }

    await loadSynonyms(word);
    const sins = getSynonyms(word);
    if (!sins.length) { hideSynPopover(); return; }

    _synWordRange = wordRange;

    // Posição baseada no ponto do mouse
    const pop = createSynPopover();
    pop.innerHTML = sins.map(s =>
      `<button class="syn-option" data-replace="${escapeHtml(s)}">${escapeHtml(s)}</button>`
    ).join("");
    pop.style.top  = (e.clientY + window.scrollY + 22) + "px";
    pop.style.left = (e.clientX + window.scrollX) + "px";
    pop.classList.add("is-visible");
  }, 700);
});

writingArea.addEventListener("mouseleave", (e) => {
  clearTimeout(_synHoverTimer);
  if (!e.relatedTarget?.closest(".syn-popover")) hideSynPopover();
});

// Clique nas opções de sinônimo
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".syn-option");
  if (btn) { replaceWordInEditor(btn.dataset.replace); return; }
  // Fechar popover ao clicar fora — sem bloquear outros handlers
  if (!e.target.closest(".syn-popover")) hideSynPopover();
  // NÃO usar e.stopPropagation() nem return — deixar o evento chegar aos outros handlers
});

// ── EXPLORADOR 3D DO LIVRO ────────────────────────────────────────────────────
(function bookExplorer() {
  const viewport  = document.getElementById("bk-viewport");
  const progress  = document.getElementById("bk-progress");
  const scroll    = document.getElementById("bk-scroll");
  const sections  = document.querySelectorAll(".bk-section");

  if (!viewport || !sections.length) return;

  let current = 0;

  function activate(idx) {
    current = idx;
    sections.forEach((s, i) => s.classList.toggle("is-active", i === idx));

    const state = sections[idx]?.dataset.bkState || "view-front";
    viewport.classList.remove("view-front","view-spine","view-back","view-open");
    viewport.classList.add(state);

    // Progresso dourado
    if (progress) progress.style.height = ((idx + 1) / sections.length * 100) + "%";
  }

  // Clique numa parte
  sections.forEach((s, i) => {
    s.addEventListener("click", () => {
      activate(i);
      s.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  // IntersectionObserver no scroll da lista
  if (scroll) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = [...sections].indexOf(e.target);
          if (idx !== -1) activate(idx);
        }
      });
    }, { root: scroll, threshold: 0.6 });

    sections.forEach(s => obs.observe(s));
  }

  // Estado inicial
  activate(0);
})();
