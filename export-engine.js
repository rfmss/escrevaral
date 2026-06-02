(function exportEngine(global) {

  // ── EXPORTAÇÃO TXT ────────────────────────────────────
  function createTextExport(manuscript) {
    const date = manuscript.createdAt
      ? new Date(manuscript.createdAt).toLocaleDateString("pt-BR")
      : "";
    const lines = [
      manuscript.title || "Manuscrito",
      "═".repeat(48),
      "",
    ];
    if (manuscript.kind)        lines.push(`Tipo:        ${manuscript.kind}`);
    if (manuscript.status)      lines.push(`Situação:    ${manuscript.status}`);
    if (manuscript.chapter)     lines.push(`Marco:       ${manuscript.chapter}`);
    if (manuscript.progress != null) lines.push(`Progresso:   ${manuscript.progress}%`);
    if (date)                   lines.push(`Criado em:   ${date}`);
    const tags = formatTags(manuscript.tags);
    if (tags && tags !== "Sem tags") lines.push(`Tags:        ${tags}`);
    if (manuscript.description && manuscript.description.trim()) {
      lines.push("", manuscript.description.trim());
    }
    lines.push("", "─".repeat(48), "", manuscript.text || "", "");
    return lines.join("\n");
  }

  // ── EXPORTAÇÃO MARKDOWN ───────────────────────────────
  function createMarkdownExport(manuscript) {
    const date = manuscript.createdAt
      ? new Date(manuscript.createdAt).toISOString().slice(0, 10)
      : "";
    const frontmatter = [
      "---",
      `title: "${(manuscript.title || "").replace(/"/g, '\\"')}"`,
    ];
    if (date)                         frontmatter.push(`date: ${date}`);
    if (manuscript.kind)              frontmatter.push(`tipo: "${manuscript.kind}"`);
    if (manuscript.status)            frontmatter.push(`situacao: "${manuscript.status}"`);
    if (manuscript.progress != null)  frontmatter.push(`progresso: ${manuscript.progress}`);
    const tags = formatTags(manuscript.tags);
    if (tags && tags !== "Sem tags")  frontmatter.push(`tags: [${tags}]`);
    frontmatter.push("---");

    const body = [];
    body.push(`# ${manuscript.title || "Manuscrito"}`, "");
    if (manuscript.description && manuscript.description.trim()) {
      body.push(`> ${manuscript.description.trim()}`, "");
    }
    body.push(normalizeMarkdownBody(manuscript.text), "");
    return frontmatter.join("\n") + "\n\n" + body.join("\n");
  }

  // ── EXPORTAÇÃO HTML ──────────────────────────────────
  function createHtmlExport(manuscript) {
    const title = xmlEscape(manuscript.title || "Sem título");
    const date = manuscript.createdAt
      ? new Date(manuscript.createdAt).toLocaleDateString("pt-BR")
      : "";
    const metaParts = [];
    if (manuscript.kind)    metaParts.push(xmlEscape(manuscript.kind));
    if (manuscript.status)  metaParts.push(xmlEscape(manuscript.status));
    if (date)               metaParts.push(date);
    const body = (manuscript.text || "")
      .split(/\n+/)
      .map(function(p) { return p.trim() ? "<p>" + xmlEscape(p) + "</p>" : ""; })
      .filter(Boolean)
      .join("\n");
    const descHtml = manuscript.description && manuscript.description.trim()
      ? '<p class="desc">' + xmlEscape(manuscript.description.trim()) + "</p>"
      : "";

    return [
      "<!doctype html>",
      '<html lang="pt-BR">',
      "<head>",
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      "<title>" + title + "</title>",
      "<style>",
      "  *, *::before, *::after { box-sizing: border-box; }",
      "  body { font-family: Georgia, 'Times New Roman', serif; font-size: 1.05rem; line-height: 1.85; max-width: 65ch; margin: 2.5rem auto; padding: 0 1rem; color: #1a1a1a; }",
      "  h1 { font-size: 1.45rem; margin-bottom: 0.15em; font-weight: bold; }",
      "  .meta { color: #555; font-size: 0.82rem; margin-bottom: 0.4rem; font-style: italic; }",
      "  .desc { color: #444; font-size: 0.92rem; margin: 0.5rem 0 1.8rem; border-left: 3px solid #ccc; padding-left: 0.8em; font-style: italic; }",
      "  hr { border: none; border-top: 1px solid #ddd; margin: 1.5rem 0; }",
      "  p { text-indent: 1.5em; margin: 0; }",
      "  p + p { margin-top: 0; }",
      "  p:first-of-type { text-indent: 0; }",
      "  @media print {",
      "    body { max-width: none; margin: 0; padding: 2cm 2.5cm; font-size: 12pt; line-height: 1.8; }",
      "    h1 { font-size: 16pt; page-break-after: avoid; }",
      "    .meta, .desc { page-break-after: avoid; }",
      "    p { orphans: 3; widows: 3; }",
      "  }",
      "</style>",
      "</head>",
      "<body>",
      "<h1>" + title + "</h1>",
      metaParts.length ? '<p class="meta">' + metaParts.join(" · ") + "</p>" : "",
      descHtml,
      "<hr>",
      body,
      "</body>",
      "</html>",
    ].filter(Boolean).join("\n");
  }

  // ── EXPORTAÇÃO EPUB 3 (KDP-ready, sem biblioteca externa) ────────────────
  // Estrutura: mimetype (first, stored) · META-INF/container.xml
  //            OEBPS/content.opf · nav.xhtml · styles/escrevaral.css
  //            OEBPS/content/chapter-NNN.xhtml
  // ─────────────────────────────────────────────────────────────────────────

  function epubStripHtml(str) {
    return (str || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&nbsp;/g, " ")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
  }

  function epubSplitChapters(rawText) {
    const text = epubStripHtml(rawText);
    const lines = text.split("\n");
    const chapters = [];
    let current = { title: "", paras: [] };

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;

      // Detecta cabeçalho de capítulo: ## Título ou # Título
      const headMatch = line.match(/^#{1,2}\s+(.+)/);
      // Ou linha curta em MAIÚSCULAS que não é uma pontuação isolada
      const capsHead = line.length <= 60 && /^[A-ZÁÉÍÓÚÀÂÃÊÔÕÜÇÑ\s\d\.\-—:]+$/.test(line) && line.length > 2;

      if (headMatch || capsHead) {
        if (current.paras.length > 0 || current.title) {
          chapters.push(current);
        }
        current = { title: headMatch ? headMatch[1] : line, paras: [] };
      } else {
        current.paras.push(line);
      }
    }
    if (current.paras.length > 0 || chapters.length === 0) chapters.push(current);
    return chapters.length ? chapters : [{ title: "", paras: lines.filter(Boolean) }];
  }

  function epubChapterXhtml(chIdx, chTitle, paras, bookTitle) {
    const heading = chTitle
      ? `<h2 class="chapter-title">${xmlEscape(chTitle)}</h2>\n`
      : (chIdx === 0 ? `<h1 class="book-title">${xmlEscape(bookTitle)}</h1>\n` : "");

    const body = paras.map((p, i) => {
      const cls = (i === 0 || !paras[i - 1]) ? "first" : "";
      // Linha de quebra de cena
      if (/^[✦\*\-]{1,5}$/.test(p.trim())) {
        return '<p class="scene-break">✦</p>';
      }
      return `<p${cls ? ' class="' + cls + '"' : ""}>${xmlEscape(p)}</p>`;
    }).join("\n");

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<!DOCTYPE html>',
      '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="pt-BR">',
      '<head>',
      '  <meta charset="UTF-8"/>',
      `  <title>${xmlEscape(chTitle || bookTitle)}</title>`,
      '  <link rel="stylesheet" type="text/css" href="../styles/escrevaral.css"/>',
      '</head>',
      '<body>',
      heading + body,
      '</body>',
      '</html>',
    ].join("\n");
  }

  function epubCss() {
    return `/* Escrevaral — ePub KDP-ready */
body { font-family: Georgia, "Times New Roman", serif; font-size: 1em; line-height: 1.65; margin: 0; padding: 0; color: #1a1a1a; }
h1.book-title { font-size: 1.8em; text-align: center; margin: 2em 0 0.4em; font-weight: bold; }
h2.chapter-title { font-size: 1.3em; text-align: center; margin: 2.5em 0 1.2em; page-break-before: always; font-weight: bold; }
p { margin: 0; padding: 0; text-indent: 1.5em; text-align: justify; }
p.first, p:first-of-type { text-indent: 0; }
p.scene-break { text-align: center; margin: 1.2em 0; text-indent: 0; letter-spacing: 0.3em; }
`;
  }

  function epubContainerXml() {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">',
      '  <rootfiles>',
      '    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>',
      '  </rootfiles>',
      '</container>',
    ].join("\n");
  }

  function epubContentOpf(title, author, uid, now, chapters) {
    const manifestChapters = chapters.map((_, i) => {
      const f = `chapter-${String(i + 1).padStart(3, "0")}`;
      return `    <item id="${f}" href="content/${f}.xhtml" media-type="application/xhtml+xml"/>`;
    }).join("\n");
    const spineChapters = chapters.map((_, i) => {
      const f = `chapter-${String(i + 1).padStart(3, "0")}`;
      return `    <itemref idref="${f}"/>`;
    }).join("\n");

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">',
      '  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">',
      `    <dc:identifier id="uid">${xmlEscape(uid)}</dc:identifier>`,
      `    <dc:title>${xmlEscape(title)}</dc:title>`,
      `    <dc:language>pt-BR</dc:language>`,
      author ? `    <dc:creator>${xmlEscape(author)}</dc:creator>` : "",
      `    <meta property="dcterms:modified">${now}</meta>`,
      '  </metadata>',
      '  <manifest>',
      '    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
      '    <item id="css" href="styles/escrevaral.css" media-type="text/css"/>',
      manifestChapters,
      '  </manifest>',
      '  <spine>',
      '    <itemref idref="nav" linear="no"/>',
      spineChapters,
      '  </spine>',
      '</package>',
    ].filter(Boolean).join("\n");
  }

  function epubNavXhtml(title, chapters) {
    const items = chapters.map((ch, i) => {
      const f = `content/chapter-${String(i + 1).padStart(3, "0")}.xhtml`;
      const label = ch.title || (i === 0 ? title : `Capítulo ${i + 1}`);
      return `      <li><a href="${f}">${xmlEscape(label)}</a></li>`;
    }).join("\n");

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<!DOCTYPE html>',
      '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="pt-BR">',
      '<head><meta charset="UTF-8"/><title>Índice</title></head>',
      '<body>',
      '  <nav epub:type="toc" id="toc">',
      '    <h1>Índice</h1>',
      '    <ol>',
      items,
      '    </ol>',
      '  </nav>',
      '</body>',
      '</html>',
    ].join("\n");
  }

  function createEpubExport(manuscript) {
    const title  = manuscript.title || "Sem título";
    const uid    = `escrevaral-${Date.now()}`;
    const now    = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    const chapters = epubSplitChapters(manuscript.text);

    const files = [
      { name: "mimetype",               data: "application/epub+zip" },
      { name: "META-INF/container.xml", data: epubContainerXml() },
      { name: "OEBPS/content.opf",      data: epubContentOpf(title, "", uid, now, chapters) },
      { name: "OEBPS/nav.xhtml",        data: epubNavXhtml(title, chapters) },
      { name: "OEBPS/styles/escrevaral.css", data: epubCss() },
    ];

    chapters.forEach((ch, i) => {
      files.push({
        name: `OEBPS/content/chapter-${String(i + 1).padStart(3, "0")}.xhtml`,
        data: epubChapterXhtml(i, ch.title, ch.paras, title),
      });
    });

    return buildZip(files);
  }

  // ── EXPORTAÇÃO DOCX (OOXML sem biblioteca externa) ────
  function createDocxExport(manuscript) {
    const title = xmlEscape(manuscript.title || "Sem título");
    const paragraphs = splitParagraphs(manuscript.text);

    // Parágrafo do título (negrito, 16pt)
    const titlePara = [
      "<w:p>",
      "  <w:pPr><w:jc w:val=\"left\"/><w:spacing w:after=\"240\"/></w:pPr>",
      "  <w:r>",
      "    <w:rPr>",
      "      <w:b/><w:sz w:val=\"32\"/><w:szCs w:val=\"32\"/>",
      "      <w:rFonts w:ascii=\"Times New Roman\" w:hAnsi=\"Times New Roman\"/>",
      "    </w:rPr>",
      "    <w:t xml:space=\"preserve\">" + title + "</w:t>",
      "  </w:r>",
      "</w:p>",
    ].join("\n");

    // Parágrafos do corpo (12pt, espaçamento duplo, recuo de parágrafo)
    const bodyParas = paragraphs.map(function(p) {
      return [
        "<w:p>",
        "  <w:pPr>",
        "    <w:jc w:val=\"both\"/>",
        "    <w:spacing w:line=\"480\" w:lineRule=\"auto\" w:after=\"0\"/>",
        "    <w:ind w:firstLine=\"720\"/>",
        "  </w:pPr>",
        "  <w:r>",
        "    <w:rPr>",
        "      <w:sz w:val=\"24\"/><w:szCs w:val=\"24\"/>",
        "      <w:rFonts w:ascii=\"Times New Roman\" w:hAnsi=\"Times New Roman\"/>",
        "    </w:rPr>",
        "    <w:t xml:space=\"preserve\">" + xmlEscape(p) + "</w:t>",
        "  </w:r>",
        "</w:p>",
      ].join("\n");
    }).join("\n");

    var documentXml = [
      "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>",
      "<w:document",
      "  xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"",
      "  xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\">",
      "  <w:body>",
      titlePara,
      bodyParas,
      "    <w:sectPr>",
      "      <w:pgSz w:w=\"12240\" w:h=\"15840\"/>",
      "      <w:pgMar w:top=\"1440\" w:right=\"1440\" w:bottom=\"1440\" w:left=\"1440\"/>",
      "    </w:sectPr>",
      "  </w:body>",
      "</w:document>",
    ].join("\n");

    var relsXml = [
      "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>",
      "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">",
      "  <Relationship Id=\"rId1\"",
      "    Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\"",
      "    Target=\"word/document.xml\"/>",
      "</Relationships>",
    ].join("\n");

    var wordRelsXml = [
      "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>",
      "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">",
      "</Relationships>",
    ].join("\n");

    var contentTypesXml = [
      "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>",
      "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">",
      "  <Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>",
      "  <Default Extension=\"xml\" ContentType=\"application/xml\"/>",
      "  <Override PartName=\"/word/document.xml\"",
      "    ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/>",
      "</Types>",
    ].join("\n");

    return buildZip([
      { name: "[Content_Types].xml",        data: contentTypesXml },
      { name: "_rels/.rels",                data: relsXml },
      { name: "word/document.xml",          data: documentXml },
      { name: "word/_rels/document.xml.rels", data: wordRelsXml },
    ]);
  }

  // ── ZIP BUILDER MÍNIMO (sem dependência externa) ──────
  function buildZip(files) {
    var parts = [];
    var centralDir = [];
    var offset = 0;

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var nameBytes = strToBytes(file.name);
      var dataBytes = strToBytes(file.data);
      var crc = crc32(dataBytes);
      var size = dataBytes.length;

      var localHeader = new Uint8Array(
        [0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00,
         0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
        .concat(u32le(crc))
        .concat(u32le(size))
        .concat(u32le(size))
        .concat(u16le(nameBytes.length))
        .concat([0x00, 0x00])
        .concat(Array.from(nameBytes))
      );

      parts.push(localHeader);
      parts.push(dataBytes);

      centralDir.push({ nameBytes: nameBytes, crc: crc, size: size, offset: offset });
      offset += localHeader.length + dataBytes.length;
    }

    var cdParts = [];
    for (var j = 0; j < centralDir.length; j++) {
      var e = centralDir[j];
      var cdEntry = new Uint8Array(
        [0x50, 0x4b, 0x01, 0x02, 0x14, 0x00, 0x14, 0x00,
         0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
        .concat(u32le(e.crc))
        .concat(u32le(e.size))
        .concat(u32le(e.size))
        .concat(u16le(e.nameBytes.length))
        .concat([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
        .concat(u32le(e.offset))
        .concat(Array.from(e.nameBytes))
      );
      cdParts.push(cdEntry);
    }

    var cdBytes = concat(cdParts);
    var cdSize = cdBytes.length;

    var eocd = new Uint8Array(
      [0x50, 0x4b, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00]
      .concat(u16le(centralDir.length))
      .concat(u16le(centralDir.length))
      .concat(u32le(cdSize))
      .concat(u32le(offset))
      .concat([0x00, 0x00])
    );

    return concat(parts.concat([cdBytes, eocd]));
  }

  function strToBytes(str) {
    return new TextEncoder().encode(str);
  }

  function u32le(n) {
    n = n >>> 0;
    return [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];
  }

  function u16le(n) {
    return [n & 0xff, (n >> 8) & 0xff];
  }

  function concat(arrays) {
    var total = 0;
    for (var i = 0; i < arrays.length; i++) total += arrays[i].length;
    var out = new Uint8Array(total);
    var pos = 0;
    for (var j = 0; j < arrays.length; j++) {
      out.set(arrays[j], pos);
      pos += arrays[j].length;
    }
    return out;
  }

  function crc32(bytes) {
    var crc = 0xffffffff;
    for (var i = 0; i < bytes.length; i++) {
      crc ^= bytes[i];
      for (var j = 0; j < 8; j++) {
        crc = (crc & 1) ? ((crc >>> 1) ^ 0xedb88320) : (crc >>> 1);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function xmlEscape(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function splitParagraphs(text) {
    if (!text) return [];
    return text.split(/\n+/).map(function(p) { return p.trim(); }).filter(Boolean);
  }

  // ── DISPATCHER PRINCIPAL ──────────────────────────────
  function exportManuscript(manuscript, format) {
    if (!manuscript) throw new Error("Nenhum manuscrito ativo para exportar.");
    if (!manuscript.text?.trim()) throw new Error("O manuscrito está vazio. Escreva algo antes de exportar.");
    var slug = slugify(manuscript.title);

    if (format === "html") {
      return {
        content: createHtmlExport(manuscript),
        filename: slug + ".html",
        mimeType: "text/html;charset=utf-8",
        binary: false,
      };
    }

    if (format === "docx") {
      var zipBytes = createDocxExport(manuscript);
      return {
        content: zipBytes,
        filename: slug + ".docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        binary: true,
      };
    }

    if (format === "epub") {
      var epubBytes = createEpubExport(manuscript);
      return {
        content: epubBytes,
        filename: slug + ".epub",
        mimeType: "application/epub+zip",
        binary: true,
      };
    }

    var exporters = {
      txt: { extension: "txt", mimeType: "text/plain;charset=utf-8", content: createTextExport },
      md:  { extension: "md",  mimeType: "text/markdown;charset=utf-8", content: createMarkdownExport },
    };

    var exporter = exporters[format];
    if (!exporter) throw new Error("Formato de exportação indisponível.");

    return {
      content: exporter.content(manuscript),
      filename: slug + "." + exporter.extension,
      mimeType: exporter.mimeType,
      binary: false,
    };
  }

  // ── UTILITÁRIOS ───────────────────────────────────────
  function normalizeMarkdownBody(text) {
    return (text || "")
      .split(/\n{2,}/)
      .map(function(p) { return p.trim(); })
      .filter(Boolean)
      .join("\n\n");
  }

  function formatTags(tags) {
    return Array.isArray(tags) && tags.length ? tags.join(", ") : "Sem tags";
  }

  function slugify(value) {
    return (value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "manuscrito";
  }

  global.VeredaExport = { exportManuscript: exportManuscript };

})(window);
