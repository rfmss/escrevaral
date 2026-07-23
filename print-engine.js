(function printEngine(global) {
  const PRESETS = {
    draft:      { size: "A4", margin: "2.5cm 2cm 2cm 3cm",     fontSize: "12pt", lineHeight: "1.8", indent: "1.25cm", justify: false },
    word:       { size: "A4", margin: "2.5cm 2cm 2cm 3cm",     fontSize: "12pt", lineHeight: "1.5", indent: "1.25cm", justify: true  },
    submission: { size: "A4", margin: "3cm 2.5cm 2.5cm 3.5cm", fontSize: "12pt", lineHeight: "2.0", indent: "1.25cm", justify: false },
    reading:    { size: "A4", margin: "2.5cm 2cm 2cm 3cm",     fontSize: "11pt", lineHeight: "1.7", indent: "0",      justify: false },
    book:       { size: "A5", margin: "1.8cm 1.5cm 1.5cm 2cm", fontSize: "11pt", lineHeight: "1.6", indent: "1.25cm", justify: false },
  };

  function esc(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function cleanHtml(rawHtml) {
    const doc = new DOMParser().parseFromString(rawHtml || "", "text/html");
    doc.querySelectorAll(".syntax-token, [data-grammar-mark], .grammar-mark, .proof-chip, script, style").forEach(el => {
      if (el.tagName === "SCRIPT" || el.tagName === "STYLE") { el.remove(); return; }
      el.replaceWith(doc.createTextNode(el.textContent));
    });
    return doc.body.innerHTML;
  }

  async function sha256Hex(text) {
    try {
      const buf = await global.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    } catch {
      return null;
    }
  }

  function formatDateTimePtBr(date) {
    const datePart = date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
    const timePart = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const tzAbbr   = date.toLocaleTimeString("en-US", { timeZoneName: "short" }).split(" ").pop() || "";
    return tzAbbr ? `${datePart}, ${timePart} ${tzAbbr}` : `${datePart}, ${timePart}`;
  }

  function buildDocumentHtml(ms, cfg, hash) {
    const title     = esc(ms.title  || "Manuscrito");
    const author    = esc(ms.author || "");
    const body      = cleanHtml(ms.html || "");
    const stamp     = formatDateTimePtBr(new Date());
    const shortHash = hash ? hash.slice(0, 16) : null;
    const footerLine = `${stamp} · Escrevaral${shortHash ? ` · Assinatura do texto: <code>${shortHash}</code>` : ""}`;
    const fullHash   = hash ? `<span class="ms-hash-full">Código de integridade (SHA-256): <code>${hash}</code></span>` : "";

    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
@page {
  size: ${cfg.size};
  margin: ${cfg.margin};
}
*, *::before, *::after { box-sizing: border-box; }
body {
  font-family: "Times New Roman", Georgia, serif;
  font-size: ${cfg.fontSize};
  line-height: ${cfg.lineHeight};
  color: #000;
  background: #fff;
  margin: 0;
  padding: 0;
}
h1.ms-title {
  font-size: calc(${cfg.fontSize} + 4pt);
  font-weight: bold;
  margin: 0 0 0.2em;
  border-bottom: 0.5pt solid #999;
  padding-bottom: 0.3em;
}
p.ms-author {
  font-size: ${cfg.fontSize};
  font-style: italic;
  margin: 0 0 1.6em;
  color: #333;
}
.ms-body p {
  margin: 0;
  text-indent: ${cfg.indent};
  ${cfg.justify ? "text-align: justify;" : ""}
}
.ms-body p:first-child { text-indent: 0; }
.ms-body h1 { font-size: calc(${cfg.fontSize} + 2pt); text-align: center; margin: 0.8em 0 0.4em; }
.ms-body h2 { font-size: calc(${cfg.fontSize} + 1pt); margin: 0.6em 0 0.3em; }
.ms-body h3 { font-size: ${cfg.fontSize}; margin: 0.4em 0 0.2em; }
.ms-body blockquote { margin: 0.5em 4cm; font-size: calc(${cfg.fontSize} - 1pt); }
.ms-body pre { font-family: "Courier New", monospace; font-size: 10pt; white-space: pre-wrap; }
hr.page-break {
  display: block;
  visibility: hidden;
  height: 0;
  margin: 0;
  border: none;
  break-after: page;
  page-break-after: always;
}
.page-break:not(hr) { break-after: page; }
.ms-footer {
  font-size: 8pt;
  color: #555;
  border-top: 0.5pt solid #ccc;
  margin-top: 3em;
  padding-top: 0.6em;
}
.ms-footer code { font-family: monospace; letter-spacing: 0.03em; }
.ms-hash-full { display: block; font-size: 7pt; color: #777; word-break: break-all; margin-top: 0.3em; }
.ms-hash-full code { font-size: 7pt; }
</style>
</head>
<body>
<h1 class="ms-title">${title}</h1>
${author ? `<p class="ms-author">${author}</p>` : ""}
<div class="ms-body">${body}</div>
<footer class="ms-footer">${footerLine}${fullHash ? `<br>${fullHash}` : ""}</footer>
</body>
</html>`;
  }

  async function printManuscript(ms, options) {
    const preset  = (options && options.preset) || ms.pagePreset || "draft";
    const cfg     = PRESETS[preset] || PRESETS.draft;
    const plain   = new DOMParser().parseFromString(ms.html || "", "text/html").body.textContent || "";
    const hash    = await sha256Hex(plain);
    const docHtml = buildDocumentHtml(ms, cfg, hash);

    return new Promise((resolve) => {
      const iframe = global.document.createElement("iframe");
      iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;opacity:0;pointer-events:none;";
      iframe.setAttribute("aria-hidden", "true");
      global.document.body.appendChild(iframe);

      iframe.addEventListener("load", () => {
        const cw = iframe.contentWindow;
        let settled = false;
        function finish() {
          if (settled) return;
          settled = true;
          iframe.remove();
          resolve();
        }
        cw.addEventListener("afterprint", finish, { once: true });
        setTimeout(finish, 30000);
        try { cw.focus(); cw.print(); } catch { finish(); }
      }, { once: true });

      iframe.srcdoc = docHtml;
    });
  }

  global.VeredaPrint = { printManuscript };
})(window);
