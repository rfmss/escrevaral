// document-engine.js — Motor de documento estruturado (Fases 1–5)
// Responsável por: migração texto→HTML, sanitização, serialização,
// undo/redo, geração de RTF exportável (abre no Word, LibreOffice, Pages).
"use strict";

const VeredaDocument = (() => {

  // ── Converte texto plano legado em HTML com parágrafos ──────────────────
  function textToHtml(text) {
    if (!text) return "";
    return text
      .split(/\n{2,}/)
      .map(block => block.trim())
      .filter(Boolean)
      .map(block => {
        const safe = block
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br>");
        return `<p>${safe}</p>`;
      })
      .join("");
  }

  // ── Sanitiza HTML de backup importado ───────────────────────────────────
  function sanitizeHtml(html) {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    tmp.querySelectorAll(
      "script,style,iframe,object,embed,link,meta,noscript"
    ).forEach(el => el.remove());
    tmp.querySelectorAll("*").forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        const name = attr.name.toLowerCase();
        if (
          name.startsWith("on") ||
          name === "src"        ||
          name === "href"       ||
          name === "action"     ||
          name === "formaction"
        ) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return tmp.innerHTML;
  }

  // ── Extrai texto plano de HTML ──────────────────────────────────────────
  function htmlToText(html) {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    tmp.querySelectorAll("hr.page-break").forEach(hr => {
      hr.replaceWith(document.createTextNode("\n\n"));
    });
    return tmp.innerText;
  }

  // ── Undo / Redo ring buffer ─────────────────────────────────────────────
  const UNDO_LIMIT = 50;
  const _undo = [];
  const _redo = [];

  function pushUndo(html) {
    if (_undo.length && _undo[_undo.length - 1] === html) return;
    _undo.push(html);
    if (_undo.length > UNDO_LIMIT) _undo.shift();
    _redo.length = 0;
  }

  function undo(current) {
    if (!_undo.length) return null;
    _redo.push(current);
    return _undo.pop();
  }

  function redo(current) {
    if (!_redo.length) return null;
    _undo.push(current);
    return _redo.pop();
  }

  function clearHistory() {
    _undo.length = 0;
    _redo.length = 0;
  }

  // ── GERADOR RTF ──────────────────────────────────────────────────────────
  // Converte o HTML do manuscrito em RTF compatível com Word, LibreOffice e
  // Apple Pages. Aplica margens, fonte e espaçamento do preset ativo.
  //
  // Unidade RTF: twip (1 polegada = 1440 twips; 1 cm ≈ 567 twips)

  const MM_TO_TWIPS = 56.693; // 1 mm em twips

  function mm(n) { return Math.round(n * MM_TO_TWIPS); }

  // Configuração por preset (margens em mm, fonte em half-points)
  const RTF_PRESET = {
    draft:      { ml:25, mr:20, mt:25, mb:20, fs:24, sl:0,   fi:0,    qj:false, a5:false },
    submission: { ml:25, mr:25, mt:30, mb:22, fs:24, sl:480, fi:0,    qj:true,  a5:false },
    reading:    { ml:18, mr:15, mt:22, mb:18, fs:26, sl:0,   fi:0,    qj:false, a5:false },
    word:       { ml:30, mr:20, mt:30, mb:20, fs:24, sl:360, fi:mm(12.5), qj:true, a5:false },
    book:       { ml:20, mr:15, mt:20, mb:18, fs:22, sl:0,   fi:0,    qj:false, a5:true  },
  };

  // Escapa texto para RTF: controla chars especiais e encode Unicode
  function escRtf(text) {
    let out = "";
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const code = text.charCodeAt(i);
      if (c === "\\") { out += "\\\\"; }
      else if (c === "{")  { out += "\\{"; }
      else if (c === "}")  { out += "\\}"; }
      else if (c === "\n") { out += "\\line "; }
      else if (code < 128) { out += c; }
      else {
        // Unicode: \uN? onde N é signed 16-bit e ? é fallback ASCII
        const signed = code > 32767 ? code - 65536 : code;
        out += `\\u${signed}?`;
      }
    }
    return out;
  }

  // Visita recursiva do DOM para gerar RTF
  function visitNode(node, ctx) {
    if (node.nodeType === 3) {
      return escRtf(node.textContent);
    }
    if (node.nodeType !== 1) return "";

    const tag  = node.tagName.toLowerCase();
    const kids = () => Array.from(node.childNodes).map(n => visitNode(n, ctx)).join("");

    // Parâmetros de parágrafo a partir do contexto
    const al = node.style && node.style.textAlign;
    const qcode = al === "center" ? "\\qc"
                : al === "right"  ? "\\qr"
                : (al === "justify" || ctx.qj) ? "\\qj"
                : "\\ql";
    const indent  = ctx.fi ? `\\fi${ctx.fi}` : "";
    const spacing = ctx.sl ? `\\sl${ctx.sl}\\slmult1` : "";
    const pard    = `\\pard${qcode}${indent}${spacing}`;

    switch (tag) {
      case "p":
        return `${pard} ${kids()}\\par\n`;

      case "h1":
        return `\\pard\\qc{\\b\\fs${ctx.fs + 16} ${kids()}}\\par\n`;

      case "h2":
        return `\\pard\\qc{\\b\\fs${ctx.fs + 10} ${kids()}}\\par\n`;

      case "h3":
        return `\\pard\\ql{\\b\\i\\fs${ctx.fs + 4} ${kids()}}\\par\n`;

      case "strong":
      case "b":
        return `{\\b ${kids()}}`;

      case "em":
      case "i":
        return `{\\i ${kids()}}`;

      case "br":
        return "\\line ";

      case "hr":
        return node.classList.contains("page-break") ? "\\page\n" : "";

      case "div":
      case "span":
        return kids();

      default:
        return kids();
    }
  }

  // Gera o documento RTF completo
  function generateRtf(html, preset, title, author) {
    preset = preset || "draft";
    const c = RTF_PRESET[preset] || RTF_PRESET.draft;

    // Tamanho do papel (twips)
    const pw = c.a5 ? mm(148) : mm(210);  // largura
    const ph = c.a5 ? mm(210) : mm(297);  // altura

    // Contexto de formatação para o visitor
    const ctx = { fs: c.fs, sl: c.sl, fi: c.fi, qj: c.qj };

    // Gera o corpo do documento
    const tmp = document.createElement("div");
    tmp.innerHTML = html || "";
    let body = Array.from(tmp.childNodes)
      .map(n => visitNode(n, ctx))
      .join("");

    // Adiciona cabeçalho de título/autor se fornecidos
    let header = "";
    if (title && title.trim()) {
      header += `\\pard\\qc{\\b\\fs${c.fs + 16} ${escRtf(title.trim())}}\\par\n`;
    }
    if (author && author.trim()) {
      header += `\\pard\\qc{\\i ${escRtf(author.trim())}}\\par\n`;
    }
    if (header) header += "\\pard\\ql \\par\n"; // linha em branco após cabeçalho

    // Documento RTF final
    return (
      "{\\rtf1\\ansi\\ansicpg1252\\deff0\n" +
      "{\\fonttbl" +
        "{\\f0\\froman\\fprq2\\fcharset0 Times New Roman;}" +
        "{\\f1\\fswiss\\fcharset0 Arial;}" +
        "{\\f2\\fmodern\\fcharset0 Courier New;}" +
      "}\n" +
      "{\\colortbl ;\\red47\\green38\\blue30;}\n" +
      `\\paperw${pw}\\paperh${ph}\n` +
      `\\margl${mm(c.ml)}\\margr${mm(c.mr)}` +
      `\\margt${mm(c.mt)}\\margb${mm(c.mb)}\n` +
      "\\widowctrl\\hyphauto\\ftnbj\n" +
      `\\f0\\fs${c.fs}\\cf1\n` +
      header +
      body +
      "}"
    );
  }

  // Baixa o RTF como arquivo
  function downloadRtf(html, preset, title, author) {
    const rtf  = generateRtf(html, preset, title, author);
    const blob = new Blob([rtf], { type: "application/rtf;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    const safe = (title || "manuscrito")
      .replace(/[^a-zA-Z0-9À-ÿ\s_-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60);
    a.href     = url;
    a.download = `${safe}.rtf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  return {
    textToHtml, sanitizeHtml, htmlToText,
    pushUndo, undo, redo, clearHistory,
    generateRtf, downloadRtf,
  };
})();
