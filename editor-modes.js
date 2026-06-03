// ── EDITOR SONETO ────────────────────────────────────
const SONETO_STRUCTURE = [
  { label: "1º Quarteto", verses: [0,1,2,3],   rhymes: ["A","B","B","A"] },
  { label: "2º Quarteto", verses: [4,5,6,7],   rhymes: ["A","B","B","A"] },
  { label: "1º Terceto · volta", verses: [8,9,10],  rhymes: ["C","D","C"] },
  { label: "2º Terceto · remate", verses: [11,12,13], rhymes: ["D","C","D"] },
];

const RHYME_COLORS = { A: "soneto-a", B: "soneto-b", C: "soneto-c", D: "soneto-d" };

function parseSonetoText(text) {
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  const verses = Array.from({ length: 14 }, (_, i) => lines[i] || "");
  return verses;
}

function serializeSoneto() {
  const inputs = specializedEditor.querySelectorAll("[data-verso]");
  const groups = [];
  SONETO_STRUCTURE.forEach((section) => {
    const sectionVerses = section.verses.map((i) => inputs[i]?.value || "");
    groups.push(sectionVerses.join("\n"));
  });
  return groups.join("\n\n");
}

function estimarSilabas(texto) {
  const palavra = texto.toLowerCase().replace(/[^a-záàâãéêíóôõúçy\s]/g, "");
  const palavras = palavra.split(/\s+/).filter(Boolean);
  let total = 0;
  for (const p of palavras) {
    const vogais = p.match(/[aeiouáàâãéêíóôõúy]/gi) || [];
    let count = vogais.length;
    count -= (p.match(/[aeiou]{2}/gi) || []).length * 0.5;
    total += Math.max(1, Math.round(count));
  }
  return Math.max(1, total);
}

function buildSonetoEditor(text) {
  const verses = parseSonetoText(text);
  return SONETO_STRUCTURE.map((section) => `
    <div class="soneto-section">
      <div class="soneto-section-label">${section.label}</div>
      ${section.verses.map((vi, si) => {
        const rhyme = section.rhymes[si];
        const val = verses[vi] || "";
        const syl = val ? estimarSilabas(val) : null;
        const sylClass = syl === null ? "" : syl === 10 ? " syl-ok" : syl > 10 ? " syl-over" : "";
        return `
          <div class="soneto-row">
            <span class="soneto-rhyme-tag ${RHYME_COLORS[rhyme]}">${rhyme}</span>
            <input class="soneto-verso" data-verso="${vi}"
              value="${val.replace(/"/g, "&quot;")}"
              placeholder="verso ${vi + 1}…" />
            <span class="soneto-syl${sylClass}">${syl !== null ? syl : "·"}</span>
          </div>
        `;
      }).join("")}
    </div>
  `).join("");
}

// ── EDITOR ROTEIRO (screenplay) ──────────────────────
function parseScreenplayText(text) {
  const blocks = [];
  const lines = text.split("\n");
  let current = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current) { blocks.push(current); current = null; }
      continue;
    }
    const isSlug = /^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(trimmed);
    const isChar = /^[A-ZÁÀÂÃÉÊÍÓÔÕÚ\s]{2,}$/.test(trimmed) && trimmed.length < 40;

    if (isSlug) {
      if (current) blocks.push(current);
      current = { type: "scene", slug: trimmed, action: "" };
    } else if (current?.type === "scene" && !isChar) {
      current.action = (current.action ? current.action + "\n" : "") + trimmed;
    } else if (isChar) {
      if (current) blocks.push(current);
      current = { type: "dialogue", character: trimmed, lines: [] };
    } else if (current?.type === "dialogue") {
      current.lines.push(trimmed);
    } else {
      if (current) blocks.push(current);
      current = { type: "action", text: trimmed };
    }
  }
  if (current) blocks.push(current);

  if (blocks.length === 0) {
    blocks.push({ type: "scene", slug: "", action: "" });
  }
  return blocks;
}

function serializeScreenplay() {
  const sections = specializedEditor.querySelectorAll("[data-sp-block]");
  const parts = [];
  sections.forEach((block) => {
    const type = block.dataset.spBlock;
    if (type === "scene") {
      const slug = block.querySelector("[data-sp-slug]")?.value?.trim() || "";
      const action = block.querySelector("[data-sp-action]")?.value?.trim() || "";
      parts.push(slug.toUpperCase());
      if (action) parts.push(action);
    } else if (type === "dialogue") {
      const char = block.querySelector("[data-sp-char]")?.value?.trim() || "";
      const lines = block.querySelector("[data-sp-lines]")?.value?.trim() || "";
      if (char) parts.push(char.toUpperCase());
      if (lines) parts.push(lines);
    } else if (type === "action") {
      const text = block.querySelector("[data-sp-text]")?.value?.trim() || "";
      if (text) parts.push(text);
    }
    parts.push("");
  });
  return parts.join("\n");
}

function buildScreenplayEditor(text) {
  const blocks = parseScreenplayText(text);
  const blocksHtml = blocks.map((block, idx) => {
    if (block.type === "scene") {
      return `
        <div class="sp-block" data-sp-block="scene">
          <div class="sp-slug-row">
            <span class="sp-slug-tag">Cena</span>
            <input class="sp-slug-input" data-sp-slug
              value="${(block.slug || "").replace(/"/g, "&quot;")}"
              placeholder="INT./EXT. LOCAL — DIA/NOITE" />
          </div>
          <textarea class="sp-action-area" data-sp-action
            placeholder="Ação — o que a câmera vê, em presente e 3ª pessoa.">${block.action || ""}</textarea>
          <button class="sp-add-dialogue" data-action="sp-add-dialogue" data-sp-after="${idx}" type="button">
            <span class="material-symbols-outlined">add</span> Diálogo
          </button>
        </div>
      `;
    } else if (block.type === "dialogue") {
      return `
        <div class="sp-block sp-dialogue-block" data-sp-block="dialogue">
          <input class="sp-char-input" data-sp-char
            value="${(block.character || "").replace(/"/g, "&quot;")}"
            placeholder="PERSONAGEM" />
          <textarea class="sp-lines-area" data-sp-lines
            placeholder="Fala do personagem.">${(block.lines || []).join("\n")}</textarea>
        </div>
      `;
    }
    return "";
  }).join("");

  return `
    <div class="screenplay-editor">
      ${blocksHtml}
      <button class="sp-add-scene" data-action="sp-add-scene" type="button">
        <span class="material-symbols-outlined">add</span> Nova cena
      </button>
    </div>
  `;
}

// ── EDITOR TEATRO ────────────────────────────────────
function parseTeatroText(text) {
  const blocks = [];
  const lines = text.split("\n");
  let current = null;

  for (const line of lines) {
    const t = line.trim();
    if (!t) { if (current) { blocks.push(current); current = null; } continue; }
    const isChar = /^[A-ZÁÀÂÃÉÊÍÓÔÕÚ\s]{2,}$/.test(t) && t.length < 40 && !/^\(/.test(t);
    const isRubrica = /^\(.*\)$/.test(t) || /^\[.*\]$/.test(t);
    const isLocal = t.startsWith("[") && !isRubrica;

    if (isLocal) {
      if (current) blocks.push(current);
      current = { type: "local", text: t };
    } else if (isChar) {
      if (current) blocks.push(current);
      current = { type: "fala", character: t, rubrica: "", lines: [] };
    } else if (isRubrica && current?.type === "fala" && !current.lines.length) {
      current.rubrica = t;
    } else if (current?.type === "fala") {
      current.lines.push(t);
    } else {
      if (current) blocks.push(current);
      current = { type: "rubrica", text: t };
    }
  }
  if (current) blocks.push(current);
  if (!blocks.length) blocks.push({ type: "local", text: "" });
  return blocks;
}

function serializeTeatro() {
  const parts = [];
  specializedEditor.querySelectorAll("[data-teatro-block]").forEach(block => {
    const type = block.dataset.teatroBlock;
    if (type === "local") {
      const v = block.querySelector("[data-teatro-local]")?.value?.trim() || "";
      if (v) parts.push(v);
    } else if (type === "fala") {
      const char = block.querySelector("[data-teatro-char]")?.value?.trim() || "";
      const rub  = block.querySelector("[data-teatro-rub]")?.value?.trim() || "";
      const dial = block.querySelector("[data-teatro-dial]")?.value?.trim() || "";
      if (char) parts.push(char.toUpperCase());
      if (rub)  parts.push(rub);
      if (dial) parts.push(dial);
    } else if (type === "rubrica") {
      const v = block.querySelector("[data-teatro-rubrica]")?.value?.trim() || "";
      if (v) parts.push(v);
    }
    parts.push("");
  });
  return parts.join("\n");
}

function buildTeatroEditor(text) {
  const blocks = parseTeatroText(text);
  const html = blocks.map((block) => {
    if (block.type === "local") return `
      <div class="teatro-block teatro-local-block" data-teatro-block="local">
        <input class="teatro-local-input" data-teatro-local value="${(block.text||"").replace(/"/g,"&quot;")}" placeholder="[Local. O espaço e o que ele carrega.]" />
      </div>`;
    if (block.type === "fala") return `
      <div class="teatro-block teatro-fala-block" data-teatro-block="fala">
        <input class="teatro-char-input" data-teatro-char value="${(block.character||"").replace(/"/g,"&quot;")}" placeholder="PERSONAGEM" />
        <input class="teatro-rub-input" data-teatro-rub value="${(block.rubrica||"").replace(/"/g,"&quot;")}" placeholder="(rubrica opcional)" />
        <textarea class="teatro-dial-area" data-teatro-dial placeholder="Fala — o personagem quer algo com ela.">${block.lines?.join("\n")||""}</textarea>
        <button class="teatro-remove-btn" data-action="teatro-remove-block" title="Remover fala">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>`;
    if (block.type === "rubrica") return `
      <div class="teatro-block teatro-rubrica-block" data-teatro-block="rubrica">
        <input class="teatro-rubrica-input" data-teatro-rubrica value="${(block.text||"").replace(/"/g,"&quot;")}" placeholder="(rubrica de cena — corpo, silêncio, espaço)" />
      </div>`;
    return "";
  }).join("");

  return `
    <div class="teatro-editor">
      ${html}
      <div class="teatro-add-row">
        <button class="teatro-add-btn" data-action="teatro-add-fala" type="button">
          <span class="material-symbols-outlined">add</span> Fala
        </button>
        <button class="teatro-add-btn" data-action="teatro-add-rubrica" type="button">
          <span class="material-symbols-outlined">add</span> Rubrica
        </button>
        <button class="teatro-add-btn" data-action="teatro-add-local" type="button">
          <span class="material-symbols-outlined">add</span> Local
        </button>
      </div>
    </div>`;
}

// ── EDITOR SLAM ───────────────────────────────────────
const SLAM_WPM = 120;
const SLAM_LIMIT_MIN = 3;
const SLAM_LIMIT_WORDS = SLAM_WPM * SLAM_LIMIT_MIN;

function buildSlamEditor(text) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const min = words > 0 ? (words / SLAM_WPM).toFixed(1) : "0";
  const pct = Math.min(100, Math.round((words / SLAM_LIMIT_WORDS) * 100));
  const over = words > SLAM_LIMIT_WORDS;

  return `
    <div class="slam-editor">
      <div class="slam-header" data-slam-header>
        <span class="slam-est${over ? " slam-over" : ""}">${words > 0 ? `~${min} min` : `0 min`}</span>
        <span class="slam-sep">·</span>
        <span class="slam-words">${words} palavras</span>
        <span class="slam-limit">de ${SLAM_LIMIT_WORDS} (3 min)</span>
        <div class="slam-bar" aria-label="Tempo estimado">
          <i style="--p:${pct}%"${over ? ' class="over"' : ""}></i>
        </div>
      </div>
      <div class="slam-writing-area" data-slam-area contenteditable="true" spellcheck="true"
           aria-label="Área de escrita do slam" data-placeholder="comece pelo concreto — a imagem, o gesto, o lugar">${escapeHtml(text)}</div>
    </div>`;
}


// ── EDITOR ENEM ────────────────────────────────────────────────────────────
const ENEM_TOTAL_LINES = 30;
const ENEM_MIN_LINES   = 7;

function buildENEMEditor(text, template) {
  const placeholder   = template?.model?.placeholder || "";
  const placeholderTitle = template?.model?.placeholderTitle || "";
  const placeholderNote  = template?.model?.placeholderNote  || "";
  const hasContent    = text && text.trim().length > 0;

  const lines = Array.from({ length: ENEM_TOTAL_LINES }, (_, i) => i + 1);
  const lineNumbers = lines.map(n =>
    `<span class="enem-line-num">${n}</span>`
  ).join("");

  return `
    <div class="enem-sheet" data-enem-sheet>
      <div class="enem-header">
        <div class="enem-header-logo">ENEM</div>
        <div class="enem-header-fields">
          <label class="enem-field"><span>Nome do participante</span><input type="text" class="enem-field-input" data-enem-field="nome" placeholder="——" /></label>
          <div class="enem-header-row">
            <label class="enem-field enem-field-sm"><span>Nº de inscrição</span><input type="text" class="enem-field-input" data-enem-field="inscricao" placeholder="——" /></label>
            <label class="enem-field enem-field-sm"><span>Dia</span><input type="text" class="enem-field-input" data-enem-field="dia" placeholder="——" /></label>
          </div>
        </div>
        <div class="enem-header-badge">Redação</div>
      </div>

      <div class="enem-body">
        <div class="enem-line-gutter" aria-hidden="true">${lineNumbers}</div>
        <div class="enem-writing-wrap">
          <div class="enem-placeholder${hasContent ? " enem-placeholder-hidden" : ""}" aria-hidden="true" data-enem-placeholder>
            <div class="enem-placeholder-hint">Clique aqui e comece a escrever sua redação.</div>
            <div class="enem-placeholder-title">${escapeHtml(placeholderTitle)}</div>
            <div class="enem-placeholder-body">${escapeHtml(placeholder)}</div>
          </div>
          <div class="enem-writing-area" data-enem-area contenteditable="true" spellcheck="true"
               aria-label="Área de redação — até 30 linhas" role="textbox" aria-multiline="true">${hasContent ? escapeHtml(text) : ""}</div>
        </div>
      </div>

      <div class="enem-footer">
        <div class="enem-line-counter" data-enem-counter>
          <span data-enem-count>0</span>/<span>${ENEM_TOTAL_LINES}</span> linhas
          <span class="enem-min-hint" data-enem-min-hint>mín. ${ENEM_MIN_LINES}</span>
        </div>
        <div class="enem-footer-actions">
          <span class="enem-placeholder-note" aria-live="polite" data-enem-placeholder-note>${escapeHtml(placeholderNote)}</span>
          <button class="enem-print-btn" data-action="enem-print" type="button" aria-label="Imprimir folha de redação">
            <span class="material-symbols-outlined">print</span>
            Imprimir
          </button>
        </div>
      </div>
    </div>
  `;
}

function serializeENEM() {
  const area = document.querySelector("[data-enem-area]");
  return area ? area.innerText : "";
}

function updateENEMCounter() {
  const area    = document.querySelector("[data-enem-area]");
  const counter = document.querySelector("[data-enem-count]");
  const minHint = document.querySelector("[data-enem-min-hint]");
  const placeholder = document.querySelector("[data-enem-placeholder]");
  if (!area || !counter) return;

  const text = area.innerText.trim();
  const isEmpty = text.length === 0;

  // Conta parágrafos reais (linhas do editor) — mais confiável que scrollHeight
  const lineHeight = parseFloat(getComputedStyle(area).lineHeight) || 32;
  // scrollHeight inclui padding-top/bottom — descontamos o padding
  const paddingTop = parseFloat(getComputedStyle(area).paddingTop) || 0;
  const paddingBot = parseFloat(getComputedStyle(area).paddingBottom) || 0;
  const contentHeight = area.scrollHeight - paddingTop - paddingBot;
  const lines = isEmpty ? 0 : Math.round(contentHeight / lineHeight);
  const count = Math.max(0, Math.min(ENEM_TOTAL_LINES, lines));
  counter.textContent = count;

  if (minHint) {
    minHint.classList.toggle("enem-min-ok",  count >= ENEM_MIN_LINES);
    minHint.classList.toggle("enem-min-warn", count > 0 && count < ENEM_MIN_LINES);
  }

  // Placeholder: mostra quando vazio, esconde ao digitar
  if (placeholder) {
    placeholder.classList.toggle("enem-placeholder-hidden", !isEmpty);
  }

  // Indica fim de folha no sheet
  const sheet = document.querySelector("[data-enem-sheet]");
  if (sheet) sheet.dataset.enemFull = (count >= ENEM_TOTAL_LINES) ? "true" : "";
}
