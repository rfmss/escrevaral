/* Exportação editorial 100% offline em ES5 estrito: .DOCX (OOXML) e .EPUB (EPUB 3.0 + NCX).
 * Construtor ZIP puro (Store / CRC-32 IEEE 802.3), sem servidor e sem alterar o manuscrito. */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  /* --- Codificação UTF-8 pura (compatível com pares substitutos UTF-16 e navegadores antigos) --- */
  function utf8Bytes(str) {
    var s = String(str || '');
    var out = [];
    var i, code, next, cp;
    for (i = 0; i < s.length; i += 1) {
      code = s.charCodeAt(i);
      if (code >= 0xD800 && code <= 0xDBFF && i + 1 < s.length) {
        next = s.charCodeAt(i + 1);
        if (next >= 0xDC00 && next <= 0xDFFF) {
          cp = ((code - 0xD800) << 10) + (next - 0xDC00) + 0x10000;
          out.push(0xF0 | (cp >> 18));
          out.push(0x80 | ((cp >> 12) & 0x3F));
          out.push(0x80 | ((cp >> 6) & 0x3F));
          out.push(0x80 | (cp & 0x3F));
          i += 1;
          continue;
        }
      }
      if (code < 0x80) {
        out.push(code);
      } else if (code < 0x800) {
        out.push(0xC0 | (code >> 6));
        out.push(0x80 | (code & 0x3F));
      } else {
        out.push(0xE0 | (code >> 12));
        out.push(0x80 | ((code >> 6) & 0x3F));
        out.push(0x80 | (code & 0x3F));
      }
    }
    return new Uint8Array(out);
  }

  /* --- CRC-32 (IEEE 802.3) --- */
  var CRC_TABLE = (function () {
    var tbl = new Uint32Array(256);
    var i, j, c;
    for (i = 0; i < 256; i += 1) {
      c = i;
      for (j = 0; j < 8; j += 1) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      tbl[i] = c >>> 0;
    }
    return tbl;
  }());

  function crc32(bytes) {
    var crc = 0xFFFFFFFF;
    var i;
    for (i = 0; i < bytes.length; i += 1) {
      crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function writeU16(buf, off, val) {
    buf[off] = val & 0xFF;
    buf[off + 1] = (val >>> 8) & 0xFF;
  }

  function writeU32(buf, off, val) {
    buf[off] = val & 0xFF;
    buf[off + 1] = (val >>> 8) & 0xFF;
    buf[off + 2] = (val >>> 16) & 0xFF;
    buf[off + 3] = (val >>> 24) & 0xFF;
  }

  function dosTimeDate(dateObj) {
    var d = dateObj instanceof Date && !isNaN(dateObj.getTime()) ? dateObj : new Date();
    var year = Math.max(1980, Math.min(2107, d.getFullYear()));
    var dosTime = ((d.getHours() & 0x1F) << 11) | ((d.getMinutes() & 0x3F) << 5) | ((d.getSeconds() >>> 1) & 0x1F);
    var dosDate = (((year - 1980) & 0x7F) << 9) | (((d.getMonth() + 1) & 0x0F) << 5) | (d.getDate() & 0x1F);
    return { time: dosTime, date: dosDate };
  }

  /* Construtor ZIP (método 0 / Store — exigido para EPUB mimetype e 100% compatível com Word/LibreOffice/KDP) */
  function buildZip(entries, nowDate) {
    var td = dosTimeDate(nowDate);
    var prepared = [];
    var totalLocal = 0;
    var totalCentral = 0;
    var i, item, nameBytes, dataBytes, sum;

    for (i = 0; i < entries.length; i += 1) {
      item = entries[i];
      nameBytes = utf8Bytes(item.name);
      dataBytes = item.data instanceof Uint8Array ? item.data : utf8Bytes(item.data);
      sum = crc32(dataBytes);
      prepared.push({
        name: nameBytes,
        data: dataBytes,
        crc: sum,
        offset: totalLocal
      });
      totalLocal += 30 + nameBytes.length + dataBytes.length;
      totalCentral += 46 + nameBytes.length;
    }

    var totalSize = totalLocal + totalCentral + 22;
    var out = new Uint8Array(totalSize);
    var pos = 0;

    for (i = 0; i < prepared.length; i += 1) {
      item = prepared[i];
      var utf8Flag = /[^\x00-\x7F]/.test(entries[i].name) ? 0x0800 : 0;
      item.utf8Flag = utf8Flag;
      writeU32(out, pos, 0x04034B50);          /* Local file header signature */
      writeU16(out, pos + 4, 20);              /* Version needed to extract (2.0) */
      writeU16(out, pos + 6, utf8Flag);        /* UTF-8 filename flag (0 para ASCII/mimetype) */
      writeU16(out, pos + 8, 0);               /* Method 0: Store */
      writeU16(out, pos + 10, td.time);
      writeU16(out, pos + 12, td.date);
      writeU32(out, pos + 14, item.crc);
      writeU32(out, pos + 18, item.data.length);
      writeU32(out, pos + 22, item.data.length);
      writeU16(out, pos + 26, item.name.length);
      writeU16(out, pos + 28, 0);              /* Extra field length = 0 */
      pos += 30;
      out.set(item.name, pos);
      pos += item.name.length;
      out.set(item.data, pos);
      pos += item.data.length;
    }

    var centralOffset = pos;
    for (i = 0; i < prepared.length; i += 1) {
      item = prepared[i];
      writeU32(out, pos, 0x02014B50);          /* Central directory header */
      writeU16(out, pos + 4, 20);              /* Version made by */
      writeU16(out, pos + 6, 20);              /* Version needed */
      writeU16(out, pos + 8, item.utf8Flag);   /* UTF-8 flag */
      writeU16(out, pos + 10, 0);              /* Store */
      writeU16(out, pos + 12, td.time);
      writeU16(out, pos + 14, td.date);
      writeU32(out, pos + 16, item.crc);
      writeU32(out, pos + 20, item.data.length);
      writeU32(out, pos + 24, item.data.length);
      writeU16(out, pos + 28, item.name.length);
      writeU16(out, pos + 30, 0);              /* Extra */
      writeU16(out, pos + 32, 0);              /* Comment */
      writeU16(out, pos + 34, 0);              /* Disk start */
      writeU16(out, pos + 36, 0);              /* Internal attrs */
      writeU32(out, pos + 38, 0);              /* External attrs */
      writeU32(out, pos + 42, item.offset);
      pos += 46;
      out.set(item.name, pos);
      pos += item.name.length;
    }

    writeU32(out, pos, 0x06054B50);            /* End of central directory */
    writeU16(out, pos + 4, 0);
    writeU16(out, pos + 6, 0);
    writeU16(out, pos + 8, prepared.length);
    writeU16(out, pos + 10, prepared.length);
    writeU32(out, pos + 12, totalCentral);
    writeU32(out, pos + 16, centralOffset);
    writeU16(out, pos + 20, 0);

    return out;
  }

  /* --- Utilitários XML e texto editorial --- */
  function stripXmlControl(str) {
    return String(str || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '');
  }

  function escapeXml(str) {
    return stripXmlControl(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function decodeHtmlEntities(str) {
    return String(str || '').replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, function (full, ent) {
      if (ent === 'amp') { return '&'; }
      if (ent === 'lt') { return '<'; }
      if (ent === 'gt') { return '>'; }
      if (ent === 'quot') { return '"'; }
      if (ent === 'apos' || ent === '#39') { return "'"; }
      if (ent === 'nbsp') { return '\u00A0'; }
      if (ent === 'mdash') { return '\u2014'; }
      if (ent === 'ndash') { return '\u2013'; }
      if (ent === 'laquo') { return '\u00AB'; }
      if (ent === 'raquo') { return '\u00BB'; }
      if (ent === 'middot') { return '\u00B7'; }
      if (ent === 'hellip') { return '\u2026'; }
      if (ent === 'ldquo') { return '\u201C'; }
      if (ent === 'rdquo') { return '\u201D'; }
      if (ent === 'lsquo') { return '\u2018'; }
      if (ent === 'rsquo') { return '\u2019'; }
      if (ent.charAt(0) === '#') {
        var num = ent.charAt(1) === 'x' || ent.charAt(1) === 'X'
          ? parseInt(ent.slice(2), 16)
          : parseInt(ent.slice(1), 10);
        if (!isNaN(num) && num >= 0 && num <= 0xFFFF) {
          return String.fromCharCode(num);
        }
      }
      return full;
    });
  }

  function safeSlug(str, fallback) {
    var cleaned = String(str || '')
      .replace(/^\s+|\s+$/g, '')
      .replace(/[^A-Za-z0-9\u00C0-\u00FF_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 72);
    return cleaned || fallback || 'manuscrito';
  }

  function normHeading(s) {
    return String(s || '')
      .replace(/^\s+|\s+$/g, '')
      .replace(/\s+/g, ' ')
      .replace(/[\u2014\u2013\-:]\s*$/, '')
      .toLowerCase();
  }

  function stripPlaceholdersText(text, config) {
    if (!config || !config.stripPlaceholders) { return String(text || ''); }
    if (root.Escr.printCore && root.Escr.printCore.stripGuidePlaceholders) {
      return root.Escr.printCore.stripGuidePlaceholders(text || '');
    }
    return String(text || '');
  }

  function pad3(n) {
    var s = String(n);
    while (s.length < 3) { s = '0' + s; }
    return s;
  }

  function isoTimestamp(dateObj) {
    var d = dateObj instanceof Date && !isNaN(dateObj.getTime()) ? dateObj : new Date();
    function p2(n) { return n < 10 ? '0' + n : String(n); }
    return d.getUTCFullYear() + '-' + p2(d.getUTCMonth() + 1) + '-' + p2(d.getUTCDate()) + 'T' +
      p2(d.getUTCHours()) + ':' + p2(d.getUTCMinutes()) + ':' + p2(d.getUTCSeconds()) + 'Z';
  }

  function formatDateLong(dateObj) {
    var d = dateObj instanceof Date && !isNaN(dateObj.getTime()) ? dateObj : new Date();
    var months = ['janeiro', 'fevereiro', 'mar\u00E7o', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return d.getDate() + ' de ' + months[d.getMonth()] + ' de ' + d.getFullYear();
  }

  function simpleStableUuid(seed) {
    var h = 2166136261, i, s = String(seed || 'escrevaral');
    var hex = '';
    for (i = 0; i < 32; i += 1) {
      h ^= s.charCodeAt(i % s.length) + i * 31;
      h = ((h >>> 0) * 16777619) >>> 0;
      hex += ((h >>> 24) & 0x0F).toString(16);
    }
    return 'urn:uuid:' + hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-4' + hex.slice(13, 16) + '-a' + hex.slice(17, 20) + '-' + hex.slice(20, 32);
  }

  /* --- Parser de Blocos e Runs (Texto simples & Rich HTML leve, sem dependência de DOM) --- */
  function runsFromPlainText(text) {
    var lines = String(text || '').split('\n');
    var runs = [], i;
    for (i = 0; i < lines.length; i += 1) {
      if (i > 0) { runs.push({ br: true }); }
      if (lines[i].length > 0) { runs.push({ text: lines[i] }); }
    }
    return runs;
  }

  function plainTextOfRuns(runs) {
    var out = '', i;
    for (i = 0; i < runs.length; i += 1) {
      if (runs[i].br) { out += '\n'; }
      else if (runs[i].text) { out += runs[i].text; }
    }
    return out;
  }

  function parsePlainToBlocks(text, config, headingText) {
    var src = stripPlaceholdersText(text, config);
    var rawBlocks = src.replace(/\r\n?/g, '\n').split(/\n{2,}/);
    var blocks = [];
    var i, block, trimmed, skippedDupH1 = false;
    var normTitle = normHeading(headingText);

    for (i = 0; i < rawBlocks.length; i += 1) {
      block = rawBlocks[i].replace(/^\n+|\n+$/g, '');
      trimmed = block.replace(/^\s+|\s+$/g, '');
      if (!trimmed) { continue; }
      if (/^#\s+/.test(trimmed) && trimmed.indexOf('\n') === -1) {
        var h1Txt = trimmed.replace(/^#\s+/, '').replace(/[\u2014\u2013\-]\s*$/, '').replace(/^\s+|\s+$/g, '');
        if (!skippedDupH1 && config.dedupeHeading && normTitle && (normHeading(h1Txt) === normTitle || normHeading(h1Txt).indexOf(normTitle) === 0 || normTitle.indexOf(normHeading(h1Txt)) === 0)) {
          skippedDupH1 = true;
          continue;
        }
        blocks.push({ type: 'h1', runs: [{ text: h1Txt }] });
        continue;
      }
      if (/^##\s+/.test(trimmed) && trimmed.indexOf('\n') === -1) {
        blocks.push({ type: 'h2', runs: [{ text: trimmed.replace(/^##\s+/, '') }] });
        continue;
      }
      if (/^###\s+/.test(trimmed) && trimmed.indexOf('\n') === -1) {
        blocks.push({ type: 'h3', runs: [{ text: trimmed.replace(/^###\s+/, '') }] });
        continue;
      }
      if (/^(---+|\*\s*\*\s*\*)$/.test(trimmed)) {
        blocks.push({ type: 'scene-break', runs: [] });
        continue;
      }
      if (/^>\s+/.test(trimmed)) {
        blocks.push({ type: 'blockquote', runs: runsFromPlainText(trimmed.replace(/^>\s+/gm, '')) });
        continue;
      }
      blocks.push({ type: 'p', runs: runsFromPlainText(block) });
    }
    return blocks;
  }

  function cloneFmt(fmt) {
    return {
      bold: !!fmt.bold,
      italic: !!fmt.italic,
      underline: !!fmt.underline,
      strike: !!fmt.strike,
      code: !!fmt.code
    };
  }

  function parseRichHtmlToBlocks(richHtml, config, headingText) {
    var html = String(richHtml || '');
    if (config && config.stripPlaceholders && root.Escr.templates && root.Escr.templates.isPlaceholder) {
      html = html.replace(/\u00AB[^\u00AB\u00BB<]+\u00BB/g, function (match) {
        return root.Escr.templates.isPlaceholder(match) ? '' : match;
      });
    }

    var blocks = [];
    var currentBlock = null;
    var fmtStack = [{ bold: false, italic: false, underline: false, strike: false, code: false }];
    var listStack = [];
    var olCounters = [];
    var bqDepth = 0;

    function curFmt() { return fmtStack[fmtStack.length - 1]; }

    function flushBlock() {
      if (!currentBlock) { return; }
      var raw = plainTextOfRuns(currentBlock.runs).replace(/\u00A0/g, ' ').replace(/^\s+|\s+$/g, '');
      if (raw.length > 0 || currentBlock.type === 'scene-break') {
        blocks.push(currentBlock);
      }
      currentBlock = null;
    }

    function ensureBlock(type, extra) {
      if (!currentBlock) {
        currentBlock = { type: type || 'p', runs: [] };
        if (extra) {
          var k;
          for (k in extra) {
            if (Object.prototype.hasOwnProperty.call(extra, k)) { currentBlock[k] = extra[k]; }
          }
        }
      }
    }

    var tokenRe = /(<\/?[a-zA-Z][a-zA-Z0-9]*\b[^>]*>)|([^<]+)/g;
    var match;
    while ((match = tokenRe.exec(html)) !== null) {
      if (match[1]) {
        var tagRaw = match[1];
        var isClose = /^<\//.test(tagRaw);
        var nameMatch = /^<\/?([a-zA-Z][a-zA-Z0-9]*)/.exec(tagRaw);
        if (!nameMatch) { continue; }
        var tag = nameMatch[1].toLowerCase();

        if (tag === 'br') {
          if (currentBlock) { currentBlock.runs.push({ br: true }); }
          continue;
        }
        if (tag === 'hr') {
          flushBlock();
          blocks.push({ type: 'scene-break', runs: [] });
          continue;
        }
        if (tag === 'ul' || tag === 'ol') {
          flushBlock();
          if (!isClose) {
            listStack.push(tag);
            olCounters.push(0);
          } else {
            listStack.pop();
            olCounters.pop();
          }
          continue;
        }
        if (tag === 'blockquote') {
          flushBlock();
          if (!isClose) {
            bqDepth += 1;
            ensureBlock('blockquote');
          } else if (bqDepth > 0) {
            bqDepth -= 1;
          }
          continue;
        }
        if (tag === 'p' || tag === 'div' || tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'pre' || tag === 'li') {
          flushBlock();
          if (!isClose) {
            if (tag === 'li') {
              var kind = listStack.length ? listStack[listStack.length - 1] : 'ul';
              var num = 1;
              if (kind === 'ol' && olCounters.length) {
                olCounters[olCounters.length - 1] += 1;
                num = olCounters[olCounters.length - 1];
              }
              ensureBlock('li', { listKind: kind, listIndex: num });
            } else if ((tag === 'p' || tag === 'div') && bqDepth > 0) {
              ensureBlock('blockquote');
            } else {
              ensureBlock(tag === 'div' ? 'p' : tag);
            }
          }
          continue;
        }
        if (tag === 'b' || tag === 'strong' || tag === 'i' || tag === 'em' || tag === 'u' || tag === 's' || tag === 'strike' || tag === 'del' || tag === 'code') {
          if (!isClose) {
            var nextF = cloneFmt(curFmt());
            if (tag === 'b' || tag === 'strong') { nextF.bold = true; }
            else if (tag === 'i' || tag === 'em') { nextF.italic = true; }
            else if (tag === 'u') { nextF.underline = true; }
            else if (tag === 's' || tag === 'strike' || tag === 'del') { nextF.strike = true; }
            else if (tag === 'code') { nextF.code = true; }
            fmtStack.push(nextF);
          } else if (fmtStack.length > 1) {
            fmtStack.pop();
          }
        }
      } else if (match[2]) {
        var txt = decodeHtmlEntities(match[2]);
        if (!currentBlock && !/\S/.test(txt)) { continue; }
        ensureBlock('p');
        var f = curFmt();
        currentBlock.runs.push({
          text: txt,
          bold: f.bold,
          italic: f.italic,
          underline: f.underline,
          strike: f.strike,
          code: f.code
        });
      }
    }
    flushBlock();

    /* Deduplica H1 inicial se igual ao título do capítulo */
    if (config && config.dedupeHeading && headingText && blocks.length && blocks[0].type === 'h1') {
      var normT = normHeading(headingText);
      var firstH = normHeading(plainTextOfRuns(blocks[0].runs));
      if (!firstH || firstH === normT || firstH.indexOf(normT) === 0 || normT.indexOf(firstH) === 0) {
        blocks.shift();
      }
    }

    return blocks;
  }

  function parseDocumentBlocks(docObj, config, headingText) {
    if (!docObj) { return []; }
    if (docObj.format === 'rich' && docObj.richHtml) {
      return parseRichHtmlToBlocks(docObj.richHtml, config, headingText);
    }
    return parsePlainToBlocks(docObj.text || '', config, headingText);
  }

  function resolveConfig(rawConfig) {
    if (root.Escr.printCore && root.Escr.printCore.normalizeConfig) {
      return root.Escr.printCore.normalizeConfig(rawConfig || null, '');
    }
    var p = rawConfig || {};
    return {
      scope: p.scope === 'book' ? 'book' : 'current',
      format: p.format || '14x21',
      font: p.font === 'mono' ? 'mono' : 'serif',
      sizePt: Number(p.sizePt) || 11,
      leading: Number(p.leading) || 1.48,
      align: p.align === 'left' ? 'left' : 'justify',
      indent: p.indent !== false,
      hyphenate: p.hyphenate !== false,
      dropCap: !!p.dropCap,
      mirrorMargins: p.mirrorMargins !== false,
      gutterMm: Number(p.gutterMm) || 0,
      pageNumPos: p.pageNumPos || 'bottom-outer',
      runningHead: !!p.runningHead,
      chapterBreak: p.chapterBreak !== false,
      frontMatter: !!p.frontMatter,
      toc: !!p.toc,
      colophon: !!p.colophon,
      stripPlaceholders: p.stripPlaceholders !== false,
      stripNumericPrefix: p.stripNumericPrefix !== false,
      dedupeHeading: p.dedupeHeading !== false,
      bookTitle: p.bookTitle || '',
      bookSubtitle: p.bookSubtitle || '',
      authorName: p.authorName || '',
      editionNote: p.editionNote || '',
      dedication: p.dedication || ''
    };
  }

  function resolveMargins(config) {
    if (root.Escr.printCore && root.Escr.printCore.formatMargins) {
      return root.Escr.printCore.formatMargins(config);
    }
    return { widthMm: 210, heightMm: 297, topMm: 25, bottomMm: 25, innerMm: 28, outerMm: 25 };
  }

  function mmToTwips(mm) {
    return Math.round(Number(mm || 0) * 56.6929133858);
  }

  function countWordsSimple(str) {
    if (root.Escr.countManuscript) { return root.Escr.countManuscript(str || '').words || 0; }
    var m = String(str || '').match(/[A-Za-z\u00C0-\u00FF0-9]+/g);
    return m ? m.length : 0;
  }

  /* ============================================================================
   * 1. GERADOR .DOCX (OOXML — Microsoft Word / LibreOffice Writer / Google Docs)
   * ============================================================================ */
  function docxRunXml(run, monoFont) {
    if (run.br) { return '<w:r><w:br/></w:r>'; }
    var txt = stripXmlControl(run.text || '');
    if (!txt) { return ''; }
    var rPr = [];
    if (run.bold) { rPr.push('<w:b/>'); }
    if (run.italic) { rPr.push('<w:i/>'); }
    if (run.underline) { rPr.push('<w:u w:val="single"/>'); }
    if (run.strike) { rPr.push('<w:strike/>'); }
    if (run.code) {
      rPr.push('<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:cs="Courier New"/>');
    } else if (monoFont) {
      rPr.push('<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:cs="Courier New"/>');
    }
    var rPrXml = rPr.length ? '<w:rPr>' + rPr.join('') + '</w:rPr>' : '';
    return '<w:r>' + rPrXml + '<w:t xml:space="preserve">' + escapeXml(txt) + '</w:t></w:r>';
  }

  function docxRunsXml(runs, monoFont) {
    var out = [], i, x;
    for (i = 0; i < runs.length; i += 1) {
      x = docxRunXml(runs[i], monoFont);
      if (x) { out.push(x); }
    }
    return out.join('');
  }

  function docxPageBreakXml() {
    return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
  }

  function buildDocx(payload) {
    payload = payload || {};
    var config = resolveConfig(payload.config);
    var chapters = payload.chapters && payload.chapters.length ? payload.chapters : [{ title: 'Manuscrito', displayTitle: 'Manuscrito', text: '' }];
    var now = payload.now instanceof Date ? payload.now : new Date();
    var m = resolveMargins(config);
    var isMulti = chapters.length > 1 || config.scope === 'book';
    var mainTitle = config.bookTitle || (chapters[0] && (chapters[0].displayTitle || chapters[0].title)) || 'Manuscrito';
    var author = config.authorName || '';
    var fontFace = config.font === 'mono' ? 'Courier New' : 'Georgia';
    var halfPts = Math.round((config.sizePt || 11) * 2);
    var lineTwips = Math.round((config.leading || 1.48) * 240);
    var alignVal = config.align === 'justify' ? 'both' : 'left';
    var hasHeader = !!config.runningHead && !!(mainTitle || author);
    var hasFooter = config.pageNumPos !== 'none';

    var totalWords = 0;
    var bodyParts = [];

    /* Folha de rosto */
    if (config.frontMatter) {
      if (author) {
        bodyParts.push('<w:p><w:pPr><w:pStyle w:val="BookAuthor"/><w:spacing w:before="1800" w:after="480"/></w:pPr><w:r><w:t>' + escapeXml(author.toUpperCase()) + '</w:t></w:r></w:p>');
      }
      bodyParts.push('<w:p><w:pPr><w:pStyle w:val="Title"/><w:spacing w:before="' + (author ? '240' : '2200') + '" w:after="240"/></w:pPr><w:r><w:t>' + escapeXml(mainTitle) + '</w:t></w:r></w:p>');
      if (config.bookSubtitle) {
        bodyParts.push('<w:p><w:pPr><w:pStyle w:val="Subtitle"/><w:spacing w:after="480"/></w:pPr><w:r><w:t>' + escapeXml(config.bookSubtitle) + '</w:t></w:r></w:p>');
      }
      bodyParts.push('<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="1400"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/><w:color w:val="555555"/></w:rPr><w:t>' + escapeXml(config.editionNote || String(now.getFullYear())) + '</w:t></w:r></w:p>');
      bodyParts.push(docxPageBreakXml());

      if (config.dedication && config.dedication.replace(/^\s+|\s+$/g, '')) {
        bodyParts.push('<w:p><w:pPr><w:jc w:val="right"/><w:spacing w:before="2400"/></w:pPr>' + docxRunsXml(runsFromPlainText(config.dedication).map(function (r) {
          if (r.br) { return r; }
          return { text: r.text, italic: true };
        }), false) + '</w:p>');
        bodyParts.push(docxPageBreakXml());
      }
    }

    /* Sumário editorial (quando multi-capítulo) */
    if (config.toc && chapters.length > 1) {
      bodyParts.push('<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:jc w:val="center"/></w:pPr><w:r><w:t>Sum\u00E1rio</w:t></w:r></w:p>');
      var ti;
      for (ti = 0; ti < chapters.length; ti += 1) {
        var tName = chapters[ti].displayTitle || chapters[ti].title || ('Cap\u00EDtulo ' + (ti + 1));
        bodyParts.push('<w:p><w:pPr><w:spacing w:after="100"/><w:ind w:firstLine="0"/></w:pPr><w:r><w:t>' + escapeXml((ti + 1) + '. ' + tName) + '</w:t></w:r></w:p>');
      }
      bodyParts.push(docxPageBreakXml());
    }

    /* Capítulos e conteúdo */
    var ci, bi, ch, dispTitle, blocks, blk, prevWasBreakOrHead;
    for (ci = 0; ci < chapters.length; ci += 1) {
      ch = chapters[ci];
      if (ci > 0 && config.chapterBreak) {
        bodyParts.push(docxPageBreakXml());
      }
      dispTitle = ch.displayTitle || ch.title || '';
      totalWords += countWordsSimple(stripPlaceholdersText(ch.text || '', config));

      if (dispTitle) {
        if (isMulti && chapters.length > 1) {
          bodyParts.push('<w:p><w:pPr><w:jc w:val="center"/><w:keepNext/><w:spacing w:before="480" w:after="80"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/><w:color w:val="555555"/></w:rPr><w:t>' + escapeXml(String(ci + 1)) + '</w:t></w:r></w:p>');
        }
        bodyParts.push('<w:p><w:pPr><w:pStyle w:val="Heading1"/>' + (isMulti ? '<w:jc w:val="center"/>' : '') + '</w:pPr><w:r><w:t>' + escapeXml(dispTitle) + '</w:t></w:r></w:p>');
      }

      blocks = parseDocumentBlocks(ch, config, dispTitle);
      if (!blocks.length) {
        blocks = [{ type: 'p', runs: [{ text: ' ', italic: true }] }];
      }

      prevWasBreakOrHead = true;
      for (bi = 0; bi < blocks.length; bi += 1) {
        blk = blocks[bi];
        if (blk.type === 'h1') {
          bodyParts.push('<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr>' + docxRunsXml(blk.runs, false) + '</w:p>');
          prevWasBreakOrHead = true;
        } else if (blk.type === 'h2') {
          bodyParts.push('<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr>' + docxRunsXml(blk.runs, false) + '</w:p>');
          prevWasBreakOrHead = true;
        } else if (blk.type === 'h3') {
          bodyParts.push('<w:p><w:pPr><w:pStyle w:val="Heading3"/></w:pPr>' + docxRunsXml(blk.runs, false) + '</w:p>');
          prevWasBreakOrHead = true;
        } else if (blk.type === 'scene-break') {
          bodyParts.push('<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="240"/><w:ind w:firstLine="0"/></w:pPr><w:r><w:t>\u2766</w:t></w:r></w:p>');
          prevWasBreakOrHead = true;
        } else if (blk.type === 'blockquote') {
          bodyParts.push('<w:p><w:pPr><w:pStyle w:val="Quote"/></w:pPr>' + docxRunsXml(blk.runs, false) + '</w:p>');
          prevWasBreakOrHead = true;
        } else if (blk.type === 'pre') {
          bodyParts.push('<w:p><w:pPr><w:pStyle w:val="CodeBlock"/></w:pPr>' + docxRunsXml(blk.runs, true) + '</w:p>');
          prevWasBreakOrHead = true;
        } else if (blk.type === 'li') {
          var prefix = blk.listKind === 'ol' ? (String(blk.listIndex || 1) + '. ') : '\u2022 ';
          bodyParts.push('<w:p><w:pPr><w:ind w:left="480" w:hanging="240"/><w:spacing w:after="80"/></w:pPr><w:r><w:t xml:space="preserve">' + escapeXml(prefix) + '</w:t></w:r>' + docxRunsXml(blk.runs, false) + '</w:p>');
          prevWasBreakOrHead = false;
        } else {
          var pPr = [];
          if (config.indent) {
            if (prevWasBreakOrHead) {
              pPr.push('<w:ind w:firstLine="0"/>');
            }
          }
          bodyParts.push('<w:p>' + (pPr.length ? '<w:pPr>' + pPr.join('') + '</w:pPr>' : '') + docxRunsXml(blk.runs, false) + '</w:p>');
          prevWasBreakOrHead = false;
        }
      }
    }

    /* Colofão */
    if (config.colophon) {
      bodyParts.push(docxPageBreakXml());
      bodyParts.push('<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="2600" w:after="160"/><w:ind w:firstLine="0"/></w:pPr><w:r><w:t>\u2014 \u2766 \u2014</w:t></w:r></w:p>');
      bodyParts.push('<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="100"/><w:ind w:firstLine="0"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>' + escapeXml(mainTitle) + '</w:t></w:r>' + (author ? '<w:r><w:t xml:space="preserve"> \u00B7 ' + escapeXml(author) + '</w:t></w:r>' : '') + '</w:p>');
      bodyParts.push('<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="80"/><w:ind w:firstLine="0"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="555555"/></w:rPr><w:t>' + escapeXml('Preparado no Escrevaral em ' + formatDateLong(now) + ' (' + totalWords.toLocaleString('pt-BR') + ' palavras).') + '</w:t></w:r></w:p>');
    }

    /* Propriedades de página e seção */
    var gutterTwips = config.mirrorMargins ? mmToTwips(config.gutterMm || 0) : 0;
    var leftTwips = mmToTwips((m.innerMm || 25) - (config.mirrorMargins ? (config.gutterMm || 0) : 0));
    var rightTwips = mmToTwips(m.outerMm || 20);
    var sectPr = [
      '<w:sectPr>',
      hasHeader ? '<w:headerReference w:type="default" r:id="rId2"/>' : '',
      hasFooter ? '<w:footerReference w:type="default" r:id="rId3"/>' : '',
      '<w:pgSz w:w="' + mmToTwips(m.widthMm || 210) + '" w:h="' + mmToTwips(m.heightMm || 297) + '"/>',
      '<w:pgMar w:top="' + mmToTwips(m.topMm || 20) + '" w:right="' + rightTwips + '" w:bottom="' + mmToTwips(m.bottomMm || 20) + '" w:left="' + leftTwips + '" w:header="708" w:footer="708" w:gutter="' + gutterTwips + '"/>',
      config.frontMatter ? '<w:titlePg/>' : '',
      '</w:sectPr>'
    ].join('');

    var documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<w:body>' + bodyParts.join('') + sectPr + '</w:body></w:document>';

    var stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:docDefaults>' +
        '<w:rPrDefault><w:rPr>' +
          '<w:rFonts w:ascii="' + fontFace + '" w:hAnsi="' + fontFace + '" w:cs="' + fontFace + '"/>' +
          '<w:sz w:val="' + halfPts + '"/><w:szCs w:val="' + halfPts + '"/>' +
          '<w:lang w:val="pt-BR"/>' +
        '</w:rPr></w:rPrDefault>' +
        '<w:pPrDefault><w:pPr>' +
          '<w:spacing w:after="' + (config.indent ? '0' : '160') + '" w:line="' + lineTwips + '" w:lineRule="auto"/>' +
          (config.indent ? '<w:ind w:firstLine="425"/>' : '') +
          '<w:jc w:val="' + alignVal + '"/>' +
        '</w:pPr></w:pPrDefault>' +
      '</w:docDefaults>' +
      '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:jc w:val="center"/><w:ind w:firstLine="0"/><w:keepNext/></w:pPr><w:rPr><w:b/><w:sz w:val="44"/><w:szCs w:val="44"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:jc w:val="center"/><w:ind w:firstLine="0"/></w:pPr><w:rPr><w:i/><w:color w:val="444444"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="BookAuthor"><w:name w:val="Book Author"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:ind w:firstLine="0"/></w:pPr><w:rPr><w:color w:val="444444"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="240"/><w:ind w:firstLine="0"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="260" w:after="140"/><w:ind w:firstLine="0"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="100"/><w:ind w:firstLine="0"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:i/><w:sz w:val="23"/><w:szCs w:val="23"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="567" w:right="284" w:firstLine="0"/><w:spacing w:before="160" w:after="160"/></w:pPr><w:rPr><w:i/><w:color w:val="333333"/></w:rPr></w:style>' +
      '<w:style w:type="paragraph" w:styleId="CodeBlock"><w:name w:val="Code Block"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="left"/><w:ind w:left="284" w:firstLine="0"/><w:spacing w:before="140" w:after="140" w:line="260" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:cs="Courier New"/><w:sz w:val="19"/><w:szCs w:val="19"/></w:rPr></w:style>' +
      '</w:styles>';

    var settingsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      (config.mirrorMargins ? '<w:mirrorMargins/>' : '') +
      '<w:defaultTabStop w:val="708"/>' +
      '<w:autoHyphenation w:val="' + (config.hyphenate ? '1' : '0') + '"/>' +
      '</w:settings>';

    var headerXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:p><w:pPr><w:jc w:val="right"/><w:ind w:firstLine="0"/></w:pPr><w:r><w:rPr><w:i/><w:sz w:val="17"/><w:color w:val="555555"/></w:rPr><w:t>' +
      escapeXml(author ? (author + ' \u2014 ' + mainTitle) : mainTitle) +
      '</w:t></w:r></w:p></w:hdr>';

    var footerAlign = config.pageNumPos === 'bottom-center' ? 'center' : 'right';
    var footerXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:p><w:pPr><w:jc w:val="' + footerAlign + '"/><w:ind w:firstLine="0"/></w:pPr>' +
      '<w:fldSimple w:instr="PAGE"><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="444444"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple>' +
      '</w:p></w:ftr>';

    var relsList = [
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
      '<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>'
    ];
    if (hasHeader) {
      relsList.push('<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>');
    }
    if (hasFooter) {
      relsList.push('<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>');
    }

    var docRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      relsList.join('') + '</Relationships>';

    var rootRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
      '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>' +
      '</Relationships>';

    var contentTypes = [
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
      '<Default Extension="xml" ContentType="application/xml"/>',
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>',
      '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>',
      '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>',
      hasHeader ? '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>' : '',
      hasFooter ? '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>' : '',
      '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
      '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>',
      '</Types>'
    ].join('');

    var iso = isoTimestamp(now);
    var coreXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
      '<dc:title>' + escapeXml(mainTitle) + '</dc:title>' +
      (author ? '<dc:creator>' + escapeXml(author) + '</dc:creator>' : '') +
      '<dc:language>pt-BR</dc:language>' +
      '<dcterms:created xsi:type="dcterms:W3CDTF">' + iso + '</dcterms:created>' +
      '<dcterms:modified xsi:type="dcterms:W3CDTF">' + iso + '</dcterms:modified>' +
      '</cp:coreProperties>';

    var appXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">' +
      '<Application>Escrevaral</Application>' +
      '<Words>' + totalWords + '</Words>' +
      '</Properties>';

    var entries = [
      { name: '[Content_Types].xml', data: contentTypes },
      { name: '_rels/.rels', data: rootRelsXml },
      { name: 'docProps/core.xml', data: coreXml },
      { name: 'docProps/app.xml', data: appXml },
      { name: 'word/document.xml', data: documentXml },
      { name: 'word/styles.xml', data: stylesXml },
      { name: 'word/settings.xml', data: settingsXml },
      { name: 'word/_rels/document.xml.rels', data: docRelsXml }
    ];
    if (hasHeader) { entries.push({ name: 'word/header1.xml', data: headerXml }); }
    if (hasFooter) { entries.push({ name: 'word/footer1.xml', data: footerXml }); }

    var bytes = buildZip(entries, now);
    return {
      bytes: bytes,
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      filename: safeSlug(mainTitle, 'manuscrito') + '.docx',
      stats: { chapters: chapters.length, words: totalWords, bytes: bytes.length }
    };
  }

  /* ============================================================================
   * 2. GERADOR .EPUB (EPUB 3.0 + EPUB 2 NCX — KDP / UICLAP / Apple Books / Kobo)
   * ============================================================================ */
  function xhtmlRuns(runs) {
    var out = [], i, r, s;
    for (i = 0; i < runs.length; i += 1) {
      r = runs[i];
      if (r.br) { out.push('<br/>'); continue; }
      if (!r.text) { continue; }
      s = escapeXml(r.text);
      if (r.code) { s = '<code>' + s + '</code>'; }
      if (r.strike) { s = '<s>' + s + '</s>'; }
      if (r.underline) { s = '<u>' + s + '</u>'; }
      if (r.italic) { s = '<em>' + s + '</em>'; }
      if (r.bold) { s = '<strong>' + s + '</strong>'; }
      out.push(s);
    }
    return out.join('');
  }

  function epubStyleLink(href) {
    return '  <' + 'link rel="stylesheet" type="text/css" href="' + href + '"/>\n';
  }

  function xhtmlDocument(title, bodyHtml) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<!DOCTYPE html>\n' +
      '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="pt-BR" lang="pt-BR">\n' +
      '<head>\n' +
      '  <meta charset="utf-8"/>\n' +
      '  <title>' + escapeXml(title) + '</title>\n' +
      epubStyleLink('../styles/book.css') +
      '</head>\n' +
      '<body>\n' + bodyHtml + '\n</body>\n</html>\n';
  }

  function epubBlocksToXhtml(blocks, config) {
    var out = [];
    var i, blk, inList = '', firstParaDone = false, prevNoIndent = true;

    function closeList() {
      if (inList) {
        out.push('</' + inList + '>');
        inList = '';
      }
    }

    for (i = 0; i < blocks.length; i += 1) {
      blk = blocks[i];
      if (blk.type === 'li') {
        var lk = blk.listKind === 'ol' ? 'ol' : 'ul';
        if (inList && inList !== lk) { closeList(); }
        if (!inList) { out.push('<' + lk + '>'); inList = lk; }
        out.push('<li>' + xhtmlRuns(blk.runs) + '</li>');
        prevNoIndent = true;
        continue;
      }
      closeList();
      if (blk.type === 'h1') {
        out.push('<h2>' + xhtmlRuns(blk.runs) + '</h2>');
        prevNoIndent = true;
      } else if (blk.type === 'h2') {
        out.push('<h3>' + xhtmlRuns(blk.runs) + '</h3>');
        prevNoIndent = true;
      } else if (blk.type === 'h3') {
        out.push('<h4>' + xhtmlRuns(blk.runs) + '</h4>');
        prevNoIndent = true;
      } else if (blk.type === 'scene-break') {
        out.push('<p class="scene-break" aria-hidden="true">\u2766</p>');
        prevNoIndent = true;
      } else if (blk.type === 'blockquote') {
        out.push('<blockquote><p>' + xhtmlRuns(blk.runs) + '</p></blockquote>');
        prevNoIndent = true;
      } else if (blk.type === 'pre') {
        out.push('<pre>' + xhtmlRuns(blk.runs) + '</pre>');
        prevNoIndent = true;
      } else {
        var plainTxt = plainTextOfRuns(blk.runs).replace(/^\s+|\s+$/g, '');
        var cls = '';
        if (!firstParaDone && config.dropCap && plainTxt.length >= 60 && /^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/.test(plainTxt)) {
          cls = ' class="first-para dropcap"';
        } else if (prevNoIndent) {
          cls = ' class="first-para"';
        }
        firstParaDone = true;
        prevNoIndent = false;
        out.push('<p' + cls + '>' + xhtmlRuns(blk.runs) + '</p>');
      }
    }
    closeList();
    if (!out.length) {
      out.push('<p class="first-para"> </p>');
    }
    return out.join('\n');
  }

  function buildEpubCss(config) {
    var fontStack = config.font === 'mono'
      ? "'Courier Prime', 'Courier New', Courier, monospace"
      : "Georgia, 'Noto Serif', 'Times New Roman', serif";
    return [
      '@charset "UTF-8";',
      'body { font-family: ' + fontStack + '; line-height: ' + (config.leading || 1.48) + '; text-align: ' + (config.align === 'justify' ? 'justify' : 'left') + '; hyphens: ' + (config.hyphenate ? 'auto' : 'none') + '; -webkit-hyphens: ' + (config.hyphenate ? 'auto' : 'none') + '; margin: 0; padding: 0 2%; }',
      'h1, h2, h3, h4 { text-align: left; page-break-after: avoid; break-after: avoid; hyphens: none; -webkit-hyphens: none; }',
      '.chapter-head { text-align: center; margin: 2.2em 0 1.8em; page-break-after: avoid; break-after: avoid; }',
      '.chapter-num { display: block; font-size: 0.85em; letter-spacing: 0.18em; margin-bottom: 0.4em; opacity: 0.72; }',
      '.chapter-title { text-align: center; font-size: 1.55em; line-height: 1.24; margin: 0; }',
      config.indent
        ? 'p { margin: 0; text-indent: 1.5em; orphans: 2; widows: 2; }\np.first-para { text-indent: 0; }'
        : 'p { margin: 0 0 0.78em; text-indent: 0; orphans: 2; widows: 2; }',
      'p.dropcap:first-letter { float: left; font-size: 3em; line-height: 0.85; font-weight: bold; padding-right: 0.12em; }',
      'p.scene-break { text-align: center; text-indent: 0; margin: 1.2em 0; letter-spacing: 0.25em; }',
      'blockquote { margin: 1em 1.2em; padding-left: 0.8em; border-left: 2px solid currentColor; font-style: italic; }',
      'blockquote p { text-indent: 0; }',
      'pre { font-family: monospace; font-size: 0.86em; white-space: pre-wrap; margin: 1em 0; }',
      'ul, ol { margin: 0.8em 0 0.8em 1.4em; }',
      '.title-page { text-align: center; margin-top: 22%; }',
      '.title-page .fp-author { font-size: 1.05em; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 2em; text-indent: 0; }',
      '.title-page .fp-title { text-align: center; font-size: 2em; line-height: 1.18; margin: 0 0 0.5em; }',
      '.title-page .fp-subtitle { font-size: 1.1em; font-style: italic; margin: 0 0 2em; text-indent: 0; }',
      '.title-page .fp-rule { width: 32%; margin: 1.5em auto; border: 0; border-top: 1px solid currentColor; opacity: 0.45; }',
      '.title-page .fp-imprint { font-size: 0.88em; margin-top: 3em; text-indent: 0; opacity: 0.78; }',
      '.dedication { margin-top: 28%; text-align: right; font-style: italic; }',
      '.dedication p { text-indent: 0; }',
      '.colophon { margin-top: 32%; text-align: center; font-size: 0.88em; opacity: 0.82; }',
      '.colophon p { text-indent: 0; margin: 0 0 0.5em; }'
    ].join('\n');
  }

  function buildEpub(payload) {
    payload = payload || {};
    var config = resolveConfig(payload.config);
    var chapters = payload.chapters && payload.chapters.length ? payload.chapters : [{ title: 'Manuscrito', displayTitle: 'Manuscrito', text: '' }];
    var now = payload.now instanceof Date ? payload.now : new Date();
    var mainTitle = config.bookTitle || (chapters[0] && (chapters[0].displayTitle || chapters[0].title)) || 'Manuscrito';
    var author = config.authorName || 'Autor(a)';
    var bookUid = simpleStableUuid(mainTitle + '|' + author + '|' + chapters.length);
    var iso = isoTimestamp(now);
    var isMulti = chapters.length > 1 || config.scope === 'book';

    var entries = [
      /* EPUB OCF 3.0: mimetype DEVE ser a primeira entrada, sem compressão e sem campo extra */
      { name: 'mimetype', data: 'application/epub+zip' },
      {
        name: 'META-INF/container.xml',
        data: '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n' +
          '  <rootfiles>\n' +
          '    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n' +
          '  </rootfiles>\n' +
          '</container>\n'
      },
      { name: 'OEBPS/styles/book.css', data: buildEpubCss(config) }
    ];

    var manifestItems = [
      '    <item id="css" href="styles/book.css" media-type="text/css"/>',
      '    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
      '    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>'
    ];
    var spineItems = [];
    var tocLinks = [];
    var totalWords = 0;

    if (config.frontMatter) {
      var tpHtml = '<section class="title-page" epub:type="titlepage">' +
        (config.authorName ? '<p class="fp-author">' + escapeXml(config.authorName) + '</p>' : '') +
        '<h1 class="fp-title">' + escapeXml(mainTitle) + '</h1>' +
        (config.bookSubtitle ? '<p class="fp-subtitle">' + escapeXml(config.bookSubtitle) + '</p>' : '') +
        '<hr class="fp-rule"/>' +
        '<p class="fp-imprint">' + escapeXml(config.editionNote || String(now.getFullYear())) + '</p>' +
        '</section>';
      entries.push({ name: 'OEBPS/text/titlepage.xhtml', data: xhtmlDocument(mainTitle, tpHtml) });
      manifestItems.push('    <item id="titlepage" href="text/titlepage.xhtml" media-type="application/xhtml+xml"/>');
      spineItems.push('    <itemref idref="titlepage"/>');
      tocLinks.push({ href: 'text/titlepage.xhtml', label: 'Folha de rosto' });

      if (config.dedication && config.dedication.replace(/^\s+|\s+$/g, '')) {
        var dedHtml = '<section class="dedication" epub:type="dedication"><p>' + xhtmlRuns(runsFromPlainText(config.dedication)) + '</p></section>';
        entries.push({ name: 'OEBPS/text/dedication.xhtml', data: xhtmlDocument('Dedicat\u00F3ria', dedHtml) });
        manifestItems.push('    <item id="dedication" href="text/dedication.xhtml" media-type="application/xhtml+xml"/>');
        spineItems.push('    <itemref idref="dedication"/>');
      }
    }

    var ci, ch, dispTitle, blocks, fileId, href, bodyXhtml;
    for (ci = 0; ci < chapters.length; ci += 1) {
      ch = chapters[ci];
      dispTitle = ch.displayTitle || ch.title || ('Cap\u00EDtulo ' + (ci + 1));
      totalWords += countWordsSimple(stripPlaceholdersText(ch.text || '', config));
      blocks = parseDocumentBlocks(ch, config, dispTitle);
      fileId = 'ch-' + pad3(ci + 1);
      href = 'text/' + fileId + '.xhtml';
      bodyXhtml = '<section epub:type="chapter">\n' +
        '<header class="chapter-head">' +
        (isMulti && chapters.length > 1 ? '<span class="chapter-num">' + (ci + 1) + '</span>' : '') +
        '<h1 class="chapter-title">' + escapeXml(dispTitle) + '</h1></header>\n' +
        epubBlocksToXhtml(blocks, config) +
        '\n</section>';
      entries.push({ name: 'OEBPS/' + href, data: xhtmlDocument(dispTitle, bodyXhtml) });
      manifestItems.push('    <item id="' + fileId + '" href="' + href + '" media-type="application/xhtml+xml"/>');
      spineItems.push('    <itemref idref="' + fileId + '"/>');
      tocLinks.push({ href: href, label: dispTitle });
    }

    if (config.colophon) {
      var colHtml = '<section class="colophon" epub:type="colophon">' +
        '<p>\u2014 \u2766 \u2014</p>' +
        '<p><strong>' + escapeXml(mainTitle) + '</strong>' + (config.authorName ? ' \u00B7 ' + escapeXml(config.authorName) : '') + '</p>' +
        '<p>Edi\u00E7\u00E3o digital gerada offline no Escrevaral em ' + escapeXml(formatDateLong(now)) + ' (' + totalWords.toLocaleString('pt-BR') + ' palavras).</p>' +
        '</section>';
      entries.push({ name: 'OEBPS/text/colophon.xhtml', data: xhtmlDocument('Colof\u00E3o', colHtml) });
      manifestItems.push('    <item id="colophon" href="text/colophon.xhtml" media-type="application/xhtml+xml"/>');
      spineItems.push('    <itemref idref="colophon"/>');
    }

    /* EPUB 3 Navigation Document (nav.xhtml) */
    var navItems = [], ncxPoints = [], ni;
    for (ni = 0; ni < tocLinks.length; ni += 1) {
      navItems.push('      <li><a href="' + tocLinks[ni].href + '">' + escapeXml(tocLinks[ni].label) + '</a></li>');
      ncxPoints.push(
        '    <navPoint id="navPoint-' + (ni + 1) + '" playOrder="' + (ni + 1) + '">\n' +
        '      <navLabel><text>' + escapeXml(tocLinks[ni].label) + '</text></navLabel>\n' +
        '      <content src="' + tocLinks[ni].href + '"/>\n' +
        '    </navPoint>'
      );
    }

    var navXhtml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<!DOCTYPE html>\n' +
      '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="pt-BR" lang="pt-BR">\n' +
      '<head>\n  <meta charset="utf-8"/>\n  <title>Sum\u00E1rio</title>\n' + epubStyleLink('styles/book.css') + '</head>\n' +
      '<body>\n  <nav epub:type="toc" id="toc">\n    <h1>Sum\u00E1rio</h1>\n    <ol>\n' +
      navItems.join('\n') +
      '\n    </ol>\n  </nav>\n</body>\n</html>\n';
    entries.push({ name: 'OEBPS/nav.xhtml', data: navXhtml });

    /* EPUB 2 NCX (compatibilidade total com Kindle KDP e leitores clássicos) */
    var tocNcx = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n' +
      '  <head>\n' +
      '    <meta name="dtb:uid" content="' + escapeXml(bookUid) + '"/>\n' +
      '    <meta name="dtb:depth" content="1"/>\n' +
      '    <meta name="dtb:totalPageCount" content="0"/>\n' +
      '    <meta name="dtb:maxPageNumber" content="0"/>\n' +
      '  </head>\n' +
      '  <docTitle><text>' + escapeXml(mainTitle) + '</text></docTitle>\n' +
      '  <navMap>\n' + ncxPoints.join('\n') + '\n  </navMap>\n' +
      '</ncx>\n';
    entries.push({ name: 'OEBPS/toc.ncx', data: tocNcx });

    /* Package Document (content.opf) */
    var contentOpf = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="pt-BR">\n' +
      '  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n' +
      '    <dc:identifier id="bookid">' + escapeXml(bookUid) + '</dc:identifier>\n' +
      '    <dc:title>' + escapeXml(mainTitle) + '</dc:title>\n' +
      '    <dc:creator>' + escapeXml(author) + '</dc:creator>\n' +
      '    <dc:language>pt-BR</dc:language>\n' +
      '    <dc:publisher>Escrevaral</dc:publisher>\n' +
      '    <meta property="dcterms:modified">' + iso + '</meta>\n' +
      '  </metadata>\n' +
      '  <manifest>\n' + manifestItems.join('\n') + '\n  </manifest>\n' +
      '  <spine toc="ncx">\n' + spineItems.join('\n') + '\n  </spine>\n' +
      '</package>\n';
    entries.push({ name: 'OEBPS/content.opf', data: contentOpf });

    var bytes = buildZip(entries, now);
    return {
      bytes: bytes,
      mime: 'application/epub+zip',
      filename: safeSlug(mainTitle, 'livro') + '.epub',
      stats: { chapters: chapters.length, words: totalWords, bytes: bytes.length }
    };
  }

  root.Escr.editorialExport = {
    utf8Bytes: utf8Bytes,
    crc32: crc32,
    buildZip: buildZip,
    parseDocumentBlocks: parseDocumentBlocks,
    buildDocx: buildDocx,
    buildEpub: buildEpub
  };
}(typeof window !== 'undefined' ? window : this));
