(function exportEngine(global) {

  // ── EXPORTAÇÃO TXT ────────────────────────────────────
  function createTextExport(manuscript) {
    return [
      manuscript.title,
      "",
      `Tipo: ${manuscript.kind}`,
      `Status: ${manuscript.status}`,
      `Marco atual: ${manuscript.chapter}`,
      `Progresso: ${manuscript.progress}%`,
      `Tags: ${formatTags(manuscript.tags)}`,
      "",
      manuscript.description,
      "",
      "---",
      "",
      manuscript.text,
      "",
    ].join("\n");
  }

  // ── EXPORTAÇÃO MARKDOWN ───────────────────────────────
  function createMarkdownExport(manuscript) {
    return [
      `# ${manuscript.title}`,
      "",
      `> ${manuscript.description}`,
      "",
      "- Tipo: " + manuscript.kind,
      "- Status: " + manuscript.status,
      "- Marco atual: " + manuscript.chapter,
      "- Progresso: " + manuscript.progress + "%",
      "- Tags: " + formatTags(manuscript.tags),
      "",
      "---",
      "",
      normalizeMarkdownBody(manuscript.text),
      "",
    ].join("\n");
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
    var slug = slugify(manuscript.title);

    if (format === "docx") {
      var zipBytes = createDocxExport(manuscript);
      return {
        content: zipBytes,
        filename: slug + ".docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
