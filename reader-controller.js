// ── MODO LEITURA ─────────────────────────────────────
let readerPlaying = false;
let readerFrame   = null;
let readerSpeed   = 1;
let readerFontSizes  = [16, 18, 20, 24];
let readerFontLabels = ["Letra pequena", "Letra média", "Letra grande", "Letra maior"];
let readerFontIdx    = 1;  // padrão: Letra média (18px)
let readerRuler      = false;
let _readerTriggerEl = null;

const readerSpeedValues = [1, 2, 3, 5];
const readerSpeedLabels = ["Ritmo 1 — lento", "Ritmo 2 — médio", "Ritmo 3 — rápido", "Ritmo 4 — acelerado"];

function openReaderMode() {
  const manuscript = getActiveManuscript();
  const overlay = document.getElementById("reader-overlay");
  const article = document.getElementById("reader-article");
  const titleEl = document.getElementById("reader-title");
  if (!overlay || !article) return;

  _readerTriggerEl = document.activeElement;

  const hasText = !!(manuscript?.html?.trim() || manuscript?.text?.trim());

  if (!manuscript || !hasText) {
    // Nota vazia: aviso discreto no editor, não abre o leitor
    const hint = document.createElement("div");
    hint.className = "reader-hint-toast";
    hint.textContent = "Escreva algumas linhas para ler como leitor.";
    document.body.appendChild(hint);
    requestAnimationFrame(() => hint.classList.add("is-visible"));
    setTimeout(() => {
      hint.classList.remove("is-visible");
      setTimeout(() => hint.remove(), 400);
    }, 2500);
    _readerTriggerEl?.focus();
    return;
  }

  // Reseta estado para não herdar sessão anterior
  readerPlaying = false;
  cancelAnimationFrame(readerFrame);
  readerSpeed   = readerSpeedValues[0];
  readerFontIdx = 1;  // Letra média por padrão
  readerRuler   = false;

  titleEl.textContent = manuscript.title || "Sem título";

  // Usa HTML saneado para preservar negrito, itálico, títulos, listas e citações
  if (manuscript.html?.trim()) {
    article.innerHTML = VeredaDocument.sanitizeHtml(manuscript.html);
  } else {
    // Fallback: texto plano com parágrafos
    article.innerHTML = escapeHtml(manuscript.text)
      .split(/\n{2,}/)
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  article.style.fontSize = readerFontSizes[readerFontIdx] + "px";

  // Sincroniza labels com estado resetado
  const speedLabel = document.getElementById("reader-speed-label");
  const fontLabel  = document.getElementById("reader-font-label");
  const playLabel  = document.getElementById("reader-play-label");
  const playIcon   = document.getElementById("reader-play")?.querySelector(".material-symbols-outlined");
  if (speedLabel) speedLabel.textContent = readerSpeedLabels[0];
  if (fontLabel)  fontLabel.textContent  = readerFontLabels[readerFontIdx];
  if (playLabel)  playLabel.textContent  = "Rolar";
  if (playIcon)   playIcon.textContent   = "play_circle";

  const canvas = document.getElementById("reader-canvas");
  if (canvas) canvas.scrollTop = 0;

  overlay.hidden = false;
  overlay.removeAttribute("aria-hidden");
  updateReaderRuler();

  // Foca o botão de fechar ao abrir
  requestAnimationFrame(() => {
    document.querySelector("[data-action='close-reader-mode']")?.focus();
  });
}

function closeReaderMode() {
  readerPlaying = false;
  cancelAnimationFrame(readerFrame);
  const overlay = document.getElementById("reader-overlay");
  if (overlay) {
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
  }
  const icon = document.getElementById("reader-play")?.querySelector(".material-symbols-outlined");
  const playLabel = document.getElementById("reader-play-label");
  if (icon) icon.textContent = "play_circle";
  if (playLabel) playLabel.textContent = "Rolar";
  // Retorna foco ao elemento que abriu o leitor
  _readerTriggerEl?.focus();
}

function readerPlayPause() {
  readerPlaying = !readerPlaying;
  const icon = document.getElementById("reader-play")?.querySelector(".material-symbols-outlined");
  const playLabel = document.getElementById("reader-play-label");
  if (icon) icon.textContent = readerPlaying ? "pause_circle" : "play_circle";
  if (playLabel) playLabel.textContent = readerPlaying ? "Pausar" : "Rolar";
  if (readerPlaying) readerScroll();
  else cancelAnimationFrame(readerFrame);
}

function readerScroll() {
  const canvas = document.getElementById("reader-canvas");
  if (!canvas || !readerPlaying) return;
  const atBottom = canvas.scrollTop + canvas.clientHeight >= canvas.scrollHeight - 2;
  if (atBottom) {
    // Chegou ao fim — para automaticamente
    readerPlaying = false;
    cancelAnimationFrame(readerFrame);
    const icon = document.getElementById("reader-play")?.querySelector(".material-symbols-outlined");
    const playLabel = document.getElementById("reader-play-label");
    if (icon) icon.textContent = "play_circle";
    if (playLabel) playLabel.textContent = "Rolar";
    return;
  }
  canvas.scrollTop += readerSpeed * 0.5;
  readerFrame = requestAnimationFrame(readerScroll);
}

function readerCycleSpeed() {
  const idx = (readerSpeedValues.indexOf(readerSpeed) + 1) % readerSpeedValues.length;
  readerSpeed = readerSpeedValues[idx];
  const label = document.getElementById("reader-speed-label");
  if (label) label.textContent = readerSpeedLabels[idx];
}

function readerCycleFont() {
  readerFontIdx = (readerFontIdx + 1) % readerFontSizes.length;
  const article = document.getElementById("reader-article");
  const label   = document.getElementById("reader-font-label");
  if (article) article.style.fontSize = readerFontSizes[readerFontIdx] + "px";
  if (label)   label.textContent = readerFontLabels[readerFontIdx];
}

function updateReaderRuler() {
  const ruler = document.getElementById("reader-ruler");
  const btn   = document.getElementById("reader-ruler-btn");
  if (!ruler) return;
  ruler.hidden = !readerRuler;
  if (btn) btn.classList.toggle("is-active", readerRuler);
}

// Fecha o leitor com Escape
document.getElementById("reader-overlay")?.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeReaderMode();
});

