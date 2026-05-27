// pagination-engine.js — Modo páginas A4/A5 (Fases 2–4, pós-auditoria Codex)
//
// Fix 1: autoPaginate retorna {content, manual}[]; joinPages só serializa
//        <hr> antes de páginas com data-break="manual" — quebras automáticas
//        nunca voltam para o HTML-fonte.
// Fix 2: splitDomAtPoint usa setStart(blockEl, 0) para não duplicar wrapper.
// Fix 3: createMeasurer envolto em .paged-editor[data-preset] para que os
//        estilos de fonte/espaçamento reais dos presets sejam aplicados.
"use strict";

const VeredaPagination = (() => {

  // ── Configuração de presets ─────────────────────────────────────────────
  const PRESET_CONFIG = {
    draft:      { top: "25mm", bottom: "20mm", w: "170mm", ph: "297mm" },
    submission: { top: "30mm", bottom: "22mm", w: "170mm", ph: "297mm" },
    reading:    { top: "22mm", bottom: "18mm", w: "170mm", ph: "297mm" },
    word:       { top: "30mm", bottom: "20mm", w: "150mm", ph: "297mm" },
    book:       { top: "20mm", bottom: "18mm", w: "108mm", ph: "210mm" },
  };

  function cfg(preset) {
    return PRESET_CONFIG[preset] || PRESET_CONFIG.draft;
  }

  // ── Mede a altura utilizável da área de texto por preset ────────────────
  function measureUsableHeight(preset) {
    const c = cfg(preset);
    const ref = document.createElement("div");
    ref.style.cssText = `
      position:fixed; top:-9999px; left:-9999px;
      visibility:hidden; pointer-events:none;
      width:${c.w}; height:${c.ph}; box-sizing:border-box;
      padding-top:${c.top}; padding-bottom:calc(${c.bottom} + 14mm);
    `;
    document.body.appendChild(ref);
    const h = ref.clientHeight
      - parseFloat(getComputedStyle(ref).paddingTop)
      - parseFloat(getComputedStyle(ref).paddingBottom);
    document.body.removeChild(ref);
    return h;
  }

  // ── Fix 3: container de medição com contexto CSS real do preset ─────────
  // O .page-body sozinho não herda os estilos de .paged-editor[data-preset].
  // Envolvemos em um container .paged-editor[data-preset="…"] para que
  // font-size, line-height e recuo do preset sejam aplicados corretamente.
  function createMeasurer(preset) {
    const c = cfg(preset);

    const outer = document.createElement("div");
    outer.className = "paged-editor";
    outer.dataset.preset = preset;
    outer.style.cssText = `
      position:fixed; top:0; left:-9999px;
      visibility:hidden; pointer-events:none;
      display:block; width:${c.w};
    `;

    const body = document.createElement("div");
    body.className = "page-body";
    // padding:0 para não inflar a medição (usable já descontou os paddings)
    body.style.cssText = `width:100%; padding:0; overflow:hidden;`;
    outer.appendChild(body);
    document.body.appendChild(outer);

    return {
      el:      body,
      dispose: () => document.body.removeChild(outer),
    };
  }

  // ── Encontra o ponto de corte de texto por altura ────────────────────────
  function findTextSplitPoint(blockEl, cutY) {
    const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const len = node.textContent.length;
      if (!len) continue;

      const nr = document.createRange();
      nr.selectNode(node);
      const nRect = nr.getBoundingClientRect();
      if (nRect.bottom <= cutY) continue;
      if (nRect.top >= cutY) return { node, offset: 0 };

      const cr = document.createRange();
      for (let i = 0; i < len; i++) {
        cr.setStart(node, i);
        cr.setEnd(node, i + 1);
        const r = cr.getBoundingClientRect();
        if (r.top >= cutY) {
          let wb = i;
          while (wb > 0 && !/\s/.test(node.textContent[wb - 1])) wb--;
          return { node, offset: wb > 0 ? wb : i };
        }
      }
    }
    return null;
  }

  // ── Fix 2: divide o DOM de um bloco em dois sem duplicar wrapper ─────────
  // Antes: setStartBefore(blockEl) incluía o próprio <p> no fragmento,
  //        gerando <p><p>...</p></p> após o wrap.
  // Agora: setStart(blockEl, 0) começa DENTRO do elemento, capturando
  //        apenas seus filhos; atributos copiados explicitamente.
  function splitDomAtPoint(blockEl, splitNode, splitOffset) {
    const tag = blockEl.tagName ? blockEl.tagName.toLowerCase() : "p";

    // Primeira metade: do início do conteúdo do bloco até o split point
    const r1 = document.createRange();
    r1.setStart(blockEl, 0);
    r1.setEnd(splitNode, splitOffset);

    // Segunda metade: do split point até o fim do conteúdo do bloco
    const r2 = document.createRange();
    r2.setStart(splitNode, splitOffset);
    r2.setEnd(blockEl, blockEl.childNodes.length);

    function makeWrap(frag) {
      const el = document.createElement(tag);
      // Preserva atributos do original (style, class, etc.)
      Array.from(blockEl.attributes || [])
        .forEach(a => el.setAttribute(a.name, a.value));
      el.appendChild(frag);
      return el;
    }

    return {
      first:  makeWrap(r1.cloneContents()).outerHTML,
      second: makeWrap(r2.cloneContents()).outerHTML,
    };
  }

  function measuredBlockHeight(el) {
    if (!el || el.nodeType !== 1) return 0;
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return rect.height
      + (parseFloat(style.marginTop) || 0)
      + (parseFloat(style.marginBottom) || 0);
  }

  // ── Divide um bloco longo em fatias de tamanho de página ────────────────
  function splitLongBlock(node, preset, usableHeight) {
    const results = [];
    const m = createMeasurer(preset);
    let remaining = node.cloneNode(true);

    for (let guard = 0; guard < 200; guard++) {
      m.el.innerHTML = "";
      m.el.appendChild(remaining.cloneNode(true));
      const child = m.el.firstElementChild;
      const h = measuredBlockHeight(child);

      if (h <= usableHeight || !child) {
        results.push(remaining.outerHTML || "");
        break;
      }

      const topY = m.el.getBoundingClientRect().top;
      const cutY = topY + usableHeight;
      const sp   = findTextSplitPoint(child, cutY);

      if (!sp) {
        results.push(remaining.outerHTML);
        break;
      }

      const parts    = splitDomAtPoint(child, sp.node, sp.offset);
      const firstTxt = parts.first.replace(/<[^>]+>/g, "").trim();
      if (!firstTxt) {
        results.push(remaining.outerHTML);
        break;
      }

      results.push(parts.first);

      const tmp = document.createElement("div");
      tmp.innerHTML = parts.second;
      remaining = tmp.firstElementChild || tmp;
      if (!remaining.textContent.trim()) break;
    }

    m.dispose();
    return results.filter(Boolean);
  }

  // ── Fix 1: paginação retorna {content, manual}[] ─────────────────────────
  // manual:true  → página precedida por <hr class="page-break"> explícito
  // manual:false → página criada por overflow automático
  // joinPages só serializa <hr> antes de páginas manual:true.
  function autoPaginate(html, preset) {
    preset = preset || "draft";
    const usable = measureUsableHeight(preset);
    const m      = createMeasurer(preset);

    const tmp = document.createElement("div");
    tmp.innerHTML = html || "";

    // result: array of { content: string, manual: boolean }
    const pages  = [];
    let chunks   = [];
    let currentH = 0;
    let nextManual = false; // próxima page começa por break manual?

    function flushPage() {
      pages.push({ content: chunks.join(""), manual: nextManual });
      chunks     = [];
      currentH   = 0;
      nextManual = false;
      m.el.innerHTML = "";
    }

    function addBlock(outerHtml, blockH) {
      chunks.push(outerHtml);
      currentH += blockH;
    }

    Array.from(tmp.childNodes).forEach(node => {
      // Quebra manual explícita
      if (node.nodeType === 1 && node.tagName === "HR" &&
          node.classList.contains("page-break")) {
        flushPage();
        nextManual = true; // A próxima página começa por break manual
        return;
      }
      if (node.nodeType === 3 && !node.textContent.trim()) return;

      m.el.innerHTML = "";
      const clone = node.cloneNode(true);
      m.el.appendChild(clone);
      const blockH = measuredBlockHeight(m.el.firstElementChild || clone);

      if (blockH <= usable) {
        if (currentH + blockH > usable && chunks.length > 0) {
          // Overflow automático — manual: false já está no nextManual
          flushPage();
          m.el.appendChild(node.cloneNode(true));
        }
        const outerHtml = node.nodeType === 1 ? node.outerHTML : `<p>${node.textContent}</p>`;
        addBlock(outerHtml, blockH);
      } else {
        if (chunks.length > 0) flushPage();
        const slices = splitLongBlock(node, preset, usable);
        slices.forEach((slice, i) => {
          if (i < slices.length - 1) {
            chunks.push(slice);
            flushPage(); // manual: false (split automático)
          } else {
            m.el.innerHTML = slice;
            const sliceH = measuredBlockHeight(m.el.firstElementChild);
            addBlock(slice, sliceH);
          }
        });
      }
    });

    if (chunks.length) pages.push({ content: chunks.join(""), manual: nextManual });
    m.dispose();

    return pages.length ? pages : [{ content: "", manual: false }];
  }

  // ── Split manual (mode:"manual") — também retorna {content, manual}[] ────
  function splitIntoPages(html) {
    if (!html || !html.trim()) return [{ content: "", manual: false }];
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const pages  = [];
    let current  = document.createElement("div");
    let isManual = false;

    Array.from(tmp.childNodes).forEach(node => {
      if (node.nodeType === 1 && node.tagName === "HR" &&
          node.classList.contains("page-break")) {
        pages.push({ content: current.innerHTML || "", manual: isManual });
        current  = document.createElement("div");
        isManual = true; // próxima página começa por break manual
      } else {
        current.appendChild(node.cloneNode(true));
      }
    });
    pages.push({ content: current.innerHTML || "", manual: isManual });
    return pages;
  }

  // ── Fix 1: joinPages só insere <hr> antes de páginas com break manual ─────
  // Garante que quebras automáticas de overflow nunca sejam gravadas no HTML.
  function joinPages(pagedEditor) {
    const sections = pagedEditor.querySelectorAll(".manuscript-page");
    let result = "";
    sections.forEach((sec, i) => {
      if (i > 0 && sec.dataset.break === "manual") {
        result += '<hr class="page-break">';
      }
      result += sec.querySelector(".page-body")?.innerHTML || "";
    });
    return result;
  }

  // ── Renderiza as seções A4/A5 editáveis ─────────────────────────────────
  // opts: { startPage: number, headerText: string }
  function render(pagedEditor, html, preset, mode, opts) {
    preset = preset || "draft";
    const startPage  = Math.max(1, parseInt((opts || {}).startPage, 10) || 1);
    const headerText = ((opts || {}).headerText || "").trim();
    const safeHeader = headerText
      ? headerText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : "";

    const pages = mode === "auto"
      ? autoPaginate(html, preset)
      : splitIntoPages(html);

    pagedEditor.dataset.preset = preset;
    const isA5 = preset === "book";

    pagedEditor.innerHTML = pages.map((page, i) => {
      const pageNum = startPage + i;
      const wc = (page.content.replace(/<[^>]+>/g, " ").match(/[\p{L}''-]+/gu) || []).length;
      const headerHtml = safeHeader
        ? `<header class="page-header" aria-hidden="true">${safeHeader}</header>`
        : "";
      return `
      <section class="manuscript-page${isA5 ? " is-a5" : ""}"
               data-page="${pageNum}"
               data-break="${page.manual ? "manual" : "auto"}">
        ${headerHtml}
        <div class="page-body" contenteditable="true"
             spellcheck="true"
             aria-label="Página ${pageNum}">${page.content}</div>
        <footer class="page-footer">
          <span class="page-footer-num">${pageNum}</span>
          <span class="page-footer-wc" aria-label="${wc} palavras nesta página">${wc} pal.</span>
        </footer>
      </section>
    `}).join("");

    return pages.length;
  }

  return {
    autoPaginate, splitIntoPages, joinPages, render,
    measureUsableHeight, splitLongBlock,
  };
})();
