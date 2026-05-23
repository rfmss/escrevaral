// ── ANÁLISE GRAMATICAL — coloração por classes (toggle no editor) ─────────────
const grammarTooltipEl = document.getElementById("grammar-tooltip");
let _grammarActive = false;
let _grammarSavedHtml = "";

// ── LABELS E HINTS — subclasses de pronome incluídas (Bechara MGP + Cunha&Cintra) ──
const GRAMMAR_CLASS_LABELS = {
  "gw-verbo":            "Verbo",
  "gw-substantivo":      "Substantivo",
  "gw-adjetivo":         "Adjetivo",
  "gw-pronome":          "Pronome",
  "gw-pronome-pessoal":  "Pronome pessoal",
  "gw-pronome-possessivo":"Pronome possessivo",
  "gw-pronome-demonstrativo":"Pronome demonstrativo",
  "gw-pronome-indefinido":"Pronome indefinido",
  "gw-pronome-relativo": "Pronome relativo",
  "gw-pronome-interrogativo":"Pronome interrogativo",
  "gw-artigo":           "Artigo",
  "gw-preposicao":       "Preposição",
  "gw-contração":        "Contração",
  "gw-conjuncao":        "Conjunção",
  "gw-adverbio":         "Advérbio",
  "gw-numeral":          "Numeral",
  "gw-interjeicao":      "Interjeição",
  "gw-proprio":          "Substantivo próprio",
};

const GRAMMAR_CLASS_HINTS = {
  "gw-substantivo":      "Substantivo: nomeia seres, lugares, coisas, ideias e sentimentos.",
  "gw-proprio":          "Substantivo próprio: batiza um ser único — pessoa, lugar, obra, marca.",
  "gw-verbo":            "Verbo: indica ação, estado, acontecimento ou fenômeno.",
  "gw-adjetivo":         "Adjetivo: qualifica e caracteriza o substantivo.",
  "gw-pronome":          "Pronome: substitui ou acompanha o substantivo.",
  "gw-pronome-pessoal":  "Pronome pessoal: representa as pessoas do discurso — eu, tu, ele, nós, vós, eles; ou seus oblíquos — me, te, se, o, a, lhe…",
  "gw-pronome-possessivo":"Pronome possessivo: indica posse em relação à pessoa — meu, teu, seu, nosso, vosso, dele, dela…",
  "gw-pronome-demonstrativo":"Pronome demonstrativo: localiza o ser no espaço ou no discurso — este (perto de mim), esse (perto de você), aquele (longe de ambos).",
  "gw-pronome-indefinido":"Pronome indefinido: referência vaga ou imprecisa — alguém, ninguém, tudo, algum, nenhum, outro, qualquer, todo, certo, vário…",
  "gw-pronome-relativo":  "Pronome relativo: retoma antecedente e introduz oração adjetiva — que, o qual, cujo, quem, onde, quanto…",
  "gw-pronome-interrogativo":"Pronome interrogativo: pergunta sobre o substantivo — quem, que, qual, quanto, onde, quando, como.",
  "gw-artigo":           "Artigo: apresenta o substantivo — o/a/os/as (definidos), um/uma/uns/umas (indefinidos).",
  "gw-preposicao":       "Preposição: liga termos indicando relação de lugar, tempo, causa, modo ou destino.",
  "gw-contração":        "Contração: fusão de preposição + artigo — no (em+o), da (de+a), pelo (por+o), ao (a+o).",
  "gw-conjuncao":        "Conjunção: une palavras ou orações — coordenativas (e, mas, ou, pois) ou subordinativas (que, se, porque, embora…).",
  "gw-adverbio":         "Advérbio: modifica verbo, adjetivo ou outro advérbio — como, quando, onde, quanto, se algo acontece.",
  "gw-numeral":          "Numeral: indica quantidade, ordem, fração ou múltiplo.",
  "gw-interjeicao":      "Interjeição: expressão do impulso emotivo — surpresa, dor, alegria, chamamento.",
};

const GRAMMAR_CLASSES_MAP = {
  "Artigo":                    "gw-artigo",
  "Preposição":                "gw-preposicao",
  "Preposição/Artigo":         "gw-contração",
  "Conjunção":                 "gw-conjuncao",
  "Pronome":                   "gw-pronome",
  "Pronome pessoal":           "gw-pronome-pessoal",
  "Pronome possessivo":        "gw-pronome-possessivo",
  "Pronome demonstrativo":     "gw-pronome-demonstrativo",
  "Pronome indefinido":        "gw-pronome-indefinido",
  "Pronome relativo":          "gw-pronome-relativo",
  "Pronome interrogativo":     "gw-pronome-interrogativo",
  "Advérbio":                  "gw-adverbio",
  "Verbo no infinitivo":       "gw-verbo",
  "Verbo flexionado":          "gw-verbo",
  "Verbo (gerúndio)":          "gw-verbo",
  "Verbo (particípio)":        "gw-verbo",
  "Verbo (subjuntivo)":        "gw-verbo",
  "Verbo (imperfeito)":        "gw-verbo",
  "Verbo (mais-que-perfeito)": "gw-verbo",
  "Adjetivo":                  "gw-adjetivo",
  "Substantivo próprio":       "gw-proprio",
  "Substantivo provável":      "gw-substantivo",
  "Substantivo":               "gw-substantivo",
};

// ── INTERJEIÇÕES — Bechara MGP §interjeição + Cunha&Cintra + regionalismos ──
const INTERJEICOES = new Set([
  // dor/surpresa/espanto
  "ah","oh","ui","ai","ei","oi","ih","uh","chi",
  // chamamento/invocação
  "alo","ola","psi","psiu","psit",
  // regionalismos brasileiros (Squarisi 1001 Dicas + Cunha&Cintra)
  "opa","epa","eba","ufa","oxe","eita","eita","vixe","bah","tche","egua",
  // impaciência/irritação
  "arre","irra","puxa","caramba","diabo","bolas","droga","raios",
  // surpresa/admiração
  "ue","ne","uau","nossa","credo","ceus","ceus","misericordia",
  // dúvida/hesitação
  "hem","hein","hm","hum","ahn",
  // animação
  "viva","avante","coragem","eia",
  // invocação religiosa/nacional
  "valei","socorro","acuda",
  // outros frequentes
  "bravo","bis"
]);

// ── NUMERAIS — Bechara MGP + Cunha&Cintra cap.12 ──
const NUMERAIS_RE = /^\d+([.,]\d+)?[ºª°]?$|^(um|dois|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quatorze|catorze|quinze|dezesseis|dezessete|dezoito|dezenove|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem|cento|duzentos|trezentos|quatrocentos|quinhentos|seiscentos|setecentos|oitocentos|novecentos|mil|milhao|bilhao|primeiro|segundo|terceiro|quarto|quinto|sexto|setimo|oitavo|nono|decimo|centesimo|milesimo|duplo|dobro|triplo|quadruplo|quintuplo|metade|ambos|ambas)$/;

// ── CLASSIFICAÇÃO COM CONTEXTO (tokens vizinhos passados por buildColoredHtml) ──
function classifyToken(word, prevWord, nextWord) {
  const norm = VeredaLexical.normalizeWord(word);
  const prevNorm = prevWord ? VeredaLexical.normalizeWord(prevWord) : null;
  const nextNorm = nextWord ? VeredaLexical.normalizeWord(nextWord) : null;

  if (INTERJEICOES.has(norm)) return "gw-interjeicao";
  if (NUMERAIS_RE.test(norm)) return "gw-numeral";

  const raw = VeredaLexical.inferWordClassContextual
    ? VeredaLexical.inferWordClassContextual(word, null, prevNorm, nextNorm)
    : VeredaLexical.inferWordClass(norm, word);

  return GRAMMAR_CLASSES_MAP[raw] || "gw-substantivo";
}

function grammarHintForClass(cls) {
  return GRAMMAR_CLASS_HINTS[cls] || GRAMMAR_CLASS_LABELS[cls] || "";
}

function buildColoredHtml(text) {
  const paragraphs = text.split(/\n+/).filter(Boolean);
  return paragraphs.map(para => {
    const tokens = para.match(/[\p{L}\p{N}''-]+|[^\p{L}\p{N}''\s-]+|\s+/gu) || [];
    // extrair só as palavras para ter vizinhos corretos
    const words = tokens.filter(t => /[\p{L}]/u.test(t) && !/^\s+$/.test(t));
    let wordIdx = 0;
    const spans = tokens.map(tok => {
      if (/^\s+$/.test(tok)) return tok;
      if (!/[\p{L}\p{N}]/u.test(tok)) return escapeHtml(tok);
      const prev = wordIdx > 0 ? words[wordIdx - 1] : null;
      const next = wordIdx < words.length - 1 ? words[wordIdx + 1] : null;
      const cls = classifyToken(tok, prev, next);
      wordIdx++;
      const label = GRAMMAR_CLASS_LABELS[cls] || "";
      const hint = grammarHintForClass(cls);
      return `<span class="gw ${cls}" data-gc="${escapeHtml(label)}" data-gh="${escapeHtml(hint)}">${escapeHtml(tok)}</span>`;
    });
    return `<p>${spans.join("")}</p>`;
  }).join("");
}

// Coloriza nós de texto dentro de um elemento sem quebrar a estrutura HTML
function colorizeTextNodes(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach(node => {
    if (!node.textContent.trim()) return;
    const tokens = node.textContent.match(/[\p{L}\p{N}''-]+|[^\p{L}\p{N}''\s-]+|\s+/gu) || [];
    const html = tokens.map(tok => {
      if (/^\s+$/.test(tok)) return tok;
      if (!/[\p{L}]/u.test(tok)) return tok.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
      const cls = classifyToken(tok);
      const label = GRAMMAR_CLASS_LABELS[cls] || "";
      const hint = grammarHintForClass(cls);
      const safeAttr = (value) => value.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
      return `<span class="gw ${cls}" data-gc="${safeAttr(label)}" data-gh="${safeAttr(hint)}">${safeAttr(tok)}</span>`;
    }).join('');
    const wrap = document.createElement('span');
    wrap.className = 'gw-text-node';
    wrap.innerHTML = html;
    node.parentNode.replaceChild(wrap, node);
  });
}

// Restaura nós de texto coloridos para texto plano
function decolorizeTextNodes(el) {
  el.querySelectorAll('.gw-text-node').forEach(span => {
    span.replaceWith(span.textContent);
  });
  el.normalize();
}

// ── EDITOR RICO — FORMATAÇÃO E MODOS ────────────────────────────────────

// ── PRIMEIRA ESCRITA SILENCIOSA ──────────────────────────────────────────
// Ativado por handleWelcomeBlank(). Oculta comandos avançados até o autor
// ter pelo menos 10 palavras — depois a interface aparece suavemente.

const FIRST_WRITING_WORDS = 5;

function enterFirstWriting() {
  shell.dataset.firstWriting = "1";
  writingArea.addEventListener("input", _onFirstWritingInput);
}

function exitFirstWriting() {
  delete shell.dataset.firstWriting;
  writingArea.removeEventListener("input", _onFirstWritingInput);
}

function _onFirstWritingInput() {
  const words = (writingArea.innerText || "").trim().split(/\s+/).filter(Boolean).length;
  if (words >= FIRST_WRITING_WORDS) exitFirstWriting();
}

// Fix 5: foca o alvo correto para execCommand dependendo do modo ativo
// Em modo Fluxo: writingArea
// Em modo Páginas: page-body já em foco, ou o primeiro page-body disponível
function focusEditorTarget() {
  if (_currentEditorView === "pages") {
    const active = document.activeElement?.closest(".page-body");
    if (active) return; // já está focado no lugar certo
    const first = pagedEditor?.querySelector(".page-body");
    if (first) first.focus();
  } else {
    writingArea.focus();
  }
}

function handleFormatCommand(cmd) {
  if (!cmd) return;
  // Snapshot imediato antes de qualquer formatação
  VeredaDocument.pushUndo(writingArea.innerHTML);

  if (cmd === "pageBreak") {
    document.execCommand("insertHTML", false,
      '<hr class="page-break"><p><br></p>');
    updateCurrentManuscript();
    if (_currentEditorView === "pages") schedulePagination();
    return;
  }

  // Comandos nativos via execCommand (bold, italic, justify*)
  const nativeCommands = new Set([
    "bold", "italic", "justifyLeft", "justifyCenter", "justifyRight", "justifyFull"
  ]);
  if (nativeCommands.has(cmd)) {
    document.execCommand(cmd, false, null);
    updateFormatBarState();
    updateCurrentManuscript();
    return;
  }
}

const _EDITOR_VIEW_KEY = "vrda-editor-view";

function setEditorViewMode(mode) {
  if (mode === _currentEditorView) return;
  localStorage.setItem(_EDITOR_VIEW_KEY, mode);

  if (mode === "pages") {
    // Fluxo → Páginas: sincronizar HTML e renderizar paged-editor
    _currentEditorView = "pages";
    writingArea.dataset.viewMode = "pages";
    pagedEditor.classList.add("is-active");
    document.querySelector(".app-shell")?.classList.add("is-page-mode");
    const manuscript = getActiveManuscript();
    const preset = manuscript?.pagePreset || "draft";
    const _pc = VeredaPagination.render(pagedEditor, writingArea.innerHTML, preset, "auto"); updatePageCount(_pc);
  } else {
    // Páginas → Fluxo: recolher páginas de volta para o writing-area
    if (pagedEditor.classList.contains("is-active")) {
      const rejoined = VeredaPagination.joinPages(pagedEditor);
      writingArea.innerHTML = rejoined;
      updateCurrentManuscript();
    }
    _currentEditorView = "flow";
    writingArea.dataset.viewMode = "flow";
    pagedEditor.classList.remove("is-active");
    document.querySelector(".app-shell")?.classList.remove("is-page-mode");
    updatePageCount(0);
  }

  document.querySelectorAll("[data-editor-view]").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.editorView === mode);
  });

  // Sincroniza o toggle único de página
  const toggleBtn = document.querySelector("[data-action='toggle-page-view']");
  if (toggleBtn) toggleBtn.setAttribute("aria-pressed", String(mode === "pages"));
}

let _pageObserver = null;
let _currentVisiblePage = 1;

function updatePageCount(total) {
  if (!pageCountEl) return;
  if (_currentEditorView === "pages" && total > 0) {
    pageCountEl.textContent = `p. ${_currentVisiblePage} / ${total}`;
    pageCountEl.hidden = false;
    _attachPageObserver(total);
  } else {
    pageCountEl.hidden = true;
    _detachPageObserver();
  }
}

function _attachPageObserver(total) {
  _detachPageObserver();
  if (!("IntersectionObserver" in window) || !pagedEditor) return;
  _pageObserver = new IntersectionObserver((entries) => {
    let best = null;
    let bestRatio = 0;
    entries.forEach(entry => {
      if (entry.intersectionRatio > bestRatio) {
        bestRatio = entry.intersectionRatio;
        best = entry.target;
      }
    });
    if (best) {
      _currentVisiblePage = parseInt(best.dataset.page, 10) || 1;
      pageCountEl.textContent = `p. ${_currentVisiblePage} / ${total}`;
    }
  }, { threshold: [0.3, 0.6, 1.0] });
  pagedEditor.querySelectorAll(".manuscript-page").forEach(p => _pageObserver.observe(p));
}

function _detachPageObserver() {
  if (_pageObserver) { _pageObserver.disconnect(); _pageObserver = null; }
  _currentVisiblePage = 1;
}

function updateFormatBarState() {
  if (!formatBar) return;
  // Atualiza estado ativo dos botões de formatação
  formatBar.querySelectorAll("[data-fmt]").forEach(btn => {
    const cmd = btn.dataset.fmt;
    try {
      const active = document.queryCommandState(cmd);
      btn.classList.toggle("is-active", active);
    } catch (_) {}
  });
  // Atualiza o select de tipo de bloco
  if (fmtBlockSel) {
    const block = document.queryCommandValue("formatBlock").toLowerCase().replace(/[<>]/g, "");
    const map = { h1: "h1", h2: "h2", h3: "h3" };
    fmtBlockSel.value = map[block] || "p";
  }
}

let _guideSavedHtml = "";

async function toggleGrammarColor() {
  // Garantir que lexical-data.json carregou antes de classificar
  if (window.VeredaLexical?.ensureLoaded) await VeredaLexical.ensureLoaded();

  const btn = document.querySelector("[data-grammar-btn]");
  const manuscript = getActiveManuscript();
  const guideBody = document.querySelector("[data-reference-body]");

  if (_grammarActive) {
    // DESLIGAR — restaura editor e guia
    _grammarActive = false;
    writingArea.contentEditable = "true";
    writingArea.innerHTML = _grammarSavedHtml;
    writingArea.classList.remove("is-grammar-colored");
    if (btn) btn.setAttribute("aria-pressed", "false");
    if (grammarTooltipEl) grammarTooltipEl.hidden = true;
    _grammarSavedHtml = "";
    // Restaura guia
    if (guideBody && _guideSavedHtml) {
      guideBody.innerHTML = _guideSavedHtml;
      _guideSavedHtml = "";
    }
    updateWritingPlaceholder();
  } else {
    // LIGAR — coloriza editor e painel do guia
    const text = manuscript?.text || writingArea.innerText || "";
    if (!text.trim()) return;
    _grammarActive = true;
    _grammarSavedHtml = writingArea.innerHTML;
    writingArea.innerHTML = buildColoredHtml(text);
    writingArea.contentEditable = "false";
    writingArea.classList.add("is-grammar-colored");
    if (btn) btn.setAttribute("aria-pressed", "true");
    // Coloriza textos do painel guia (seções e lembretes)
    if (guideBody) {
      _guideSavedHtml = guideBody.innerHTML;
      colorizeTextNodes(guideBody);
    }
  }
}

// Dados visuais por classe — ícone + tagline + definição + exemplo
// Sistema de classes gramaticais — cores e ícones canônicos
// Referência: classes_de_palavras_final.html (Codex, 2026-05-14)
// iconBgL/iconColorL = light theme | iconBgD/iconColorD = dark theme
const GRAMMAR_VISUAL = {
  "gw-substantivo": {
    icon: "label",
    iconBgL: "#EEEDFE", iconColorL: "#3C3489",
    iconBgD: "#2a1f6a", iconColorD: "#b8b0f8",
    tag: "Substantivo", sub: "Nomeia seres, coisas e lugares",
    reason: "🏷️ Etiqueta — dar nome é a essência do substantivo",
  },
  "gw-proprio": {
    icon: "label",
    iconBgL: "#E8E6FD", iconColorL: "#3C3489",
    iconBgD: "#221a60", iconColorD: "#a8a0f5",
    tag: "Nome próprio", sub: "Nomeia um ser único e específico",
    reason: "🏷️ Etiqueta especial — só existe um com esse nome",
  },
  "gw-artigo": {
    icon: "fingerprint",
    iconBgL: "#E1F5EE", iconColorL: "#085041",
    iconBgD: "#08352a", iconColorD: "#6dd5b8",
    tag: "Artigo", sub: "Identifica e individualiza o substantivo",
    reason: "🫆 Impressão digital — 'livro' vira 'o livro': único",
  },
  "gw-adjetivo": {
    icon: "palette",
    iconBgL: "#FAEEDA", iconColorL: "#633806",
    iconBgD: "#3d2200", iconColorD: "#f5c077",
    tag: "Adjetivo", sub: "Qualifica e caracteriza o substantivo",
    reason: "🎨 Paleta — acrescenta cor e qualidade ao substantivo",
  },
  "gw-numeral": {
    icon: "pin",
    iconBgL: "#E6F1FB", iconColorL: "#0C447C",
    iconBgD: "#082040", iconColorD: "#7ab8f5",
    tag: "Numeral", sub: "Indica quantidade ou ordem",
    reason: "🔢 123 — representação direta de números",
  },
  "gw-pronome": {
    icon: "account_circle",
    iconBgL: "#FCEBEB", iconColorL: "#791F1F",
    iconBgD: "#3d1010", iconColorD: "#f59090",
    tag: "Pronome", sub: "Substitui ou acompanha o substantivo",
    reason: "🤍 Pessoa genérica — eu, tu, ele, nós…",
  },
  "gw-verbo": {
    icon: "bolt",
    iconBgL: "#FAECE7", iconColorL: "#712B13",
    iconBgD: "#3d1800", iconColorD: "#f5a070",
    tag: "Verbo", sub: "Expressa ação, estado ou fenômeno",
    reason: "⚡ Raio — energia, movimento e ação",
  },
  "gw-adverbio": {
    icon: "auto_fix_high",
    iconBgL: "#EAF3DE", iconColorL: "#27500A",
    iconBgD: "#162b08", iconColorD: "#8fd460",
    tag: "Advérbio", sub: "Modifica verbo, adjetivo ou outro advérbio",
    reason: "🪄 Varinha — transforma o que toca, seja lá o que for",
  },
  "gw-preposicao": {
    icon: "power",
    iconBgL: "#FBEAF0", iconColorL: "#72243E",
    iconBgD: "#3a0f20", iconColorD: "#f08ab0",
    tag: "Preposição", sub: "Liga termos criando relação",
    reason: "🔌 Plug encaixado — cria dependência entre dois elementos",
  },
  "gw-contração": {
    icon: "compress",
    iconBgL: "#FEF0DC", iconColorL: "#7A3F00",
    iconBgD: "#3a2000", iconColorD: "#f5c070",
    tag: "Contração", sub: "Preposição + artigo fundidos",
    reason: "🔗 Compressão — no = em+o · da = de+a · pelo = por+o",
  },
  "gw-conjuncao": {
    icon: "merge",
    iconBgL: "#E1F5EE", iconColorL: "#0F6E56",
    iconBgD: "#083528", iconColorD: "#50c8a0",
    tag: "Conjunção", sub: "Une orações ou palavras",
    reason: "🔀 Merge — une dois caminhos em um (ou os separa)",
  },
  "gw-interjeicao": {
    icon: "sentiment_excited",
    iconBgL: "#FAEEDA", iconColorL: "#854F0B",
    iconBgD: "#3d2200", iconColorD: "#f5b040",
    tag: "Interjeição", sub: "Exprime emoção ou reação",
    reason: "😲 Rosto surpreso — emoção pura e imediata",
  },
};

function buildGrammarTooltip(cls, word) {
  const v = GRAMMAR_VISUAL[cls];
  if (!v) return null;
  const dark = (document.documentElement.getAttribute("data-theme") || "").includes("dark");
  const bg    = dark ? v.iconBgD    : v.iconBgL;
  const color = dark ? v.iconColorD : v.iconColorL;
  return `<div class="gt-inner">
    <div class="gt-top">
      <div class="gt-icon-wrap" style="background:${bg}">
        <span class="material-symbols-outlined" style="color:${color};font-size:20px;font-variation-settings:'FILL' 1">${v.icon}</span>
      </div>
      <div class="gt-meta">
        <div class="gt-tag">${escapeHtml(v.tag)}</div>
        <div class="gt-sub">${escapeHtml(v.sub)}</div>
      </div>
    </div>
    <div class="gt-word">${escapeHtml(word)}</div>
    <div class="gt-reason">${v.reason}</div>
  </div>`;
}

// Tooltip segue o mouse sobre palavras coloridas
writingArea.addEventListener("mouseover", (e) => {
  if (!_grammarActive || !grammarTooltipEl) return;
  const span = e.target.closest("[data-gc]");
  if (!span?.dataset.gc) { grammarTooltipEl.hidden = true; return; }
  const cls = [...span.classList].find(c => c.startsWith("gw-") && c !== "gw");
  const html = cls ? buildGrammarTooltip(cls, span.textContent.trim()) : null;
  if (html) {
    grammarTooltipEl.innerHTML = html;
  } else {
    grammarTooltipEl.textContent = span.dataset.gh || span.dataset.gc;
  }
  grammarTooltipEl.hidden = false;
});

writingArea.addEventListener("mousemove", (e) => {
  if (!grammarTooltipEl || grammarTooltipEl.hidden) return;
  grammarTooltipEl.style.left = `${e.clientX + 14}px`;
  grammarTooltipEl.style.top  = `${e.clientY - 32}px`;
});

writingArea.addEventListener("mouseleave", () => {
  if (grammarTooltipEl) grammarTooltipEl.hidden = true;
});

// Clique em palavra colorida → popover lexical
writingArea.addEventListener("click", (e) => {
  if (!_grammarActive) return;
  const span = e.target.closest("[data-gc]");
  if (!span) return;
  const word = span.textContent;
  if (!manuscript || !word) return;
  const analysis = VeredaLexical.analyze(word, manuscript?.text || "");
  if (!analysis) return;
  const count = analysis.count || 0;
  const countText = count > 0 ? `${count} vez${count > 1 ? "es" : ""} no texto` : "";
  state.lexical.selectedWord = VeredaLexical.normalizeWord(word);
  openWordPopover(word, analysis.className, countText, e.clientX, e.clientY);
});

// Desliga ao trocar de nota
function deactivateGrammarColor() {
  if (_grammarActive) toggleGrammarColor();
}

// ── POPOVER DE PALAVRA ──────────────────────────────────────────────────────
const wordPopover = document.getElementById("word-popover");
let _popoverWord = "";

async function openWordPopover(word, classLabel, countText, x, y) {
  if (!wordPopover) return;
  _popoverWord = word;
  wordPopover.querySelector("[data-popover-word]").textContent = word;
  wordPopover.querySelector("[data-popover-class]").textContent = classLabel || "";
  wordPopover.querySelector("[data-popover-count]").textContent = countText || "";

  // Sinônimos integrados no popover
  const synSection = wordPopover.querySelector("[data-popover-syns]");
  const synList    = wordPopover.querySelector("[data-popover-syns-list]");
  if (synSection && synList && window.loadSynonyms && window.getSynonyms) {
    await loadSynonyms(word);
    const sins = getSynonyms(word);
    if (sins.length) {
      synList.innerHTML = sins.map(s =>
        `<button class="popover-syn-btn" data-replace-word="${escapeHtml(s)}" data-original-word="${escapeHtml(word)}">${escapeHtml(s)}</button>`
      ).join("");
      synSection.hidden = false;
    } else {
      synSection.hidden = true;
    }
  }

  wordPopover.hidden = false;

  const pw = 300;
  const left = Math.min(x, window.innerWidth - pw - 12);
  const top  = y + 16;
  wordPopover.style.left = `${left}px`;
  wordPopover.style.top  = `${top}px`;
}

function closeWordPopover() {
  if (wordPopover) wordPopover.hidden = true;
  _popoverWord = "";
}

// Clique no editor → abre popover da palavra
writingArea.addEventListener("click", async (e) => {
  const selection = window.getSelection();
  if (selection && !selection.isCollapsed) return; // seleção de texto → não abre

  const word = findWordNearSelection(selection);
  const clean = cleanSelectedWord(word);
  if (!clean || clean.length < 2) { closeWordPopover(); return; }

  const manuscript = getActiveManuscript();
  if (!manuscript) return;

  await VeredaLexical.ensureLoaded();
  const analysis = VeredaLexical.analyze(clean, manuscript.text);
  if (!analysis) { closeWordPopover(); return; }
  const classLabel = analysis.className || "";
  const count = analysis.count || 0;
  const countText = count === 1 ? "1 vez no texto" : count > 1 ? `${count} vezes no texto` : "";

  state.lexical.selectedWord = clean;
  openWordPopover(clean, classLabel, countText, e.clientX, e.clientY);
});

// Fecha ao clicar fora
document.addEventListener("click", (e) => {
  if (!wordPopover?.hidden && !wordPopover.contains(e.target) && e.target !== writingArea) {
    closeWordPopover();
  }
});

// Escape fecha
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !wordPopover?.hidden) closeWordPopover();
});

// Actions do popover
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  if (btn.dataset.action === "popover-close") { closeWordPopover(); return; }
  if (btn.dataset.action === "popover-open-lexical") {
    closeWordPopover();
    setView("biblioteca", { updateRoute: true });
    return;
  }
  if (btn.dataset.action === "switch-view-autoria") {
    setView("autoria", { updateRoute: true });
    return;
  }
});

// Substituição de sinônimo via popover
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".popover-syn-btn");
  if (!btn) return;
  const replacement = btn.dataset.replaceWord;
  const original    = btn.dataset.originalWord;
  if (!replacement || !original) return;

  closeWordPopover();

  // Reutilizar lógica de substituição do syntax-controller
  if (window.replaceWordInEditor) {
    // Adaptar capitalização
    const adapt = (orig, repl) =>
      /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(orig) ? repl.charAt(0).toUpperCase() + repl.slice(1) : repl;

    writingArea.focus();
    if (window.VeredaDocument) VeredaDocument.pushUndo(writingArea.innerHTML);
    const sel = window.getSelection();
    const walker = document.createTreeWalker(writingArea, NodeFilter.SHOW_TEXT);
    const normOrig = original.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
    let replaced = false;
    while (walker.nextNode() && !replaced) {
      const node = walker.currentNode;
      const normNode = node.textContent.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
      const idx = normNode.indexOf(normOrig);
      if (idx !== -1) {
        const origText = node.textContent.slice(idx, idx + normOrig.length);
        const range    = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + normOrig.length);
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand("insertText", false, adapt(origText, replacement));
        replaced = true;
      }
    }
    if (replaced && window.updateCurrentManuscript) {
      updateCurrentManuscript();
      if (window.persistState) persistState(`${original} → ${replacement} (Ctrl+Z desfaz)`);
    }
  }
});
