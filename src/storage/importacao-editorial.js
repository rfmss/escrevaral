/* Importador editorial offline 100% ES5 (.docx OOXML via ZIP+DEFLATE puro, .md e .txt). */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  function utf8Decode(bytes) {
    if (!bytes || !bytes.length) { return ''; }
    if (typeof TextDecoder === 'function') {
      try { return new TextDecoder('utf-8').decode(bytes); } catch (ignore) {}
    }
    var out = [], i = 0, len = bytes.length, c, c2, c3, c4, cp;
    while (i < len) {
      c = bytes[i++];
      if (c < 128) { out.push(String.fromCharCode(c)); }
      else if ((c & 0xe0) === 0xc0 && i < len) {
        c2 = bytes[i++];
        out.push(String.fromCharCode(((c & 0x1f) << 6) | (c2 & 0x3f)));
      } else if ((c & 0xf0) === 0xe0 && i + 1 < len) {
        c2 = bytes[i++]; c3 = bytes[i++];
        out.push(String.fromCharCode(((c & 0x0f) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f)));
      } else if ((c & 0xf8) === 0xf0 && i + 2 < len) {
        c2 = bytes[i++]; c3 = bytes[i++]; c4 = bytes[i++];
        cp = (((c & 0x07) << 18) | ((c2 & 0x3f) << 12) | ((c3 & 0x3f) << 6) | (c4 & 0x3f)) - 0x10000;
        out.push(String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff)));
      }
    }
    return out.join('');
  }

  /* ---- RFC 1951 DEFLATE raw decompressor (ES5 puro, sem dependências externas) ---- */
  var LEN_BASE = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
  var LEN_EXTRA = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  var DIST_BASE = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
  var DIST_EXTRA = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
  var CL_ORDER = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];

  function buildHuff(lengths, numSyms) {
    var counts = [], i, len, maxBits = 0;
    for (i = 0; i <= 15; i += 1) { counts[i] = 0; }
    for (i = 0; i < numSyms; i += 1) {
      len = lengths[i] || 0;
      if (len > 0) {
        counts[len] += 1;
        if (len > maxBits) { maxBits = len; }
      }
    }
    var nextCode = [], code = 0;
    counts[0] = 0;
    for (i = 1; i <= 15; i += 1) {
      code = (code + counts[i - 1]) << 1;
      nextCode[i] = code;
    }
    var table = {};
    for (i = 0; i < numSyms; i += 1) {
      len = lengths[i] || 0;
      if (len > 0) {
        table[(len << 16) | nextCode[len]] = i;
        nextCode[len] += 1;
      }
    }
    return { table: table, maxBits: maxBits };
  }

  var FIXED_LIT = null, FIXED_DIST = null;
  function ensureFixedTables() {
    if (FIXED_LIT) { return; }
    var ll = [], dl = [], i;
    for (i = 0; i <= 143; i += 1) { ll[i] = 8; }
    for (i = 144; i <= 255; i += 1) { ll[i] = 9; }
    for (i = 256; i <= 279; i += 1) { ll[i] = 7; }
    for (i = 280; i <= 287; i += 1) { ll[i] = 8; }
    for (i = 0; i < 32; i += 1) { dl[i] = 5; }
    FIXED_LIT = buildHuff(ll, 288);
    FIXED_DIST = buildHuff(dl, 32);
  }

  function inflateRaw(src) {
    var pos = 0, bitBuf = 0, bitCnt = 0;
    var out = [];
    var srcLen = src.length;

    function readBits(n) {
      while (bitCnt < n) {
        if (pos >= srcLen) { throw new Error('Fluxo DEFLATE truncado.'); }
        bitBuf |= (src[pos++] << bitCnt);
        bitCnt += 8;
      }
      var val = bitBuf & ((1 << n) - 1);
      bitBuf >>>= n;
      bitCnt -= n;
      return val;
    }

    function decodeSym(huff) {
      var code = 0, len, key;
      for (len = 1; len <= huff.maxBits; len += 1) {
        code = (code << 1) | readBits(1);
        key = (len << 16) | code;
        if (Object.prototype.hasOwnProperty.call(huff.table, key)) {
          return huff.table[key];
        }
      }
      throw new Error('Código Huffman inválido no arquivo .docx.');
    }

    var bfinal = 0, btype, i, sym, distSym, length, dist, start;
    while (!bfinal) {
      bfinal = readBits(1);
      btype = readBits(2);
      if (btype === 0) {
        bitBuf = 0; bitCnt = 0;
        if (pos + 4 > srcLen) { throw new Error('Bloco ZIP inválido.'); }
        var blen = src[pos] | (src[pos + 1] << 8);
        pos += 4;
        if (pos + blen > srcLen) { throw new Error('Bloco ZIP truncado.'); }
        for (i = 0; i < blen; i += 1) { out.push(src[pos++]); }
      } else if (btype === 1 || btype === 2) {
        var litHuff, distHuff;
        if (btype === 1) {
          ensureFixedTables();
          litHuff = FIXED_LIT;
          distHuff = FIXED_DIST;
        } else {
          var hlit = readBits(5) + 257;
          var hdist = readBits(5) + 1;
          var hclen = readBits(4) + 4;
          var clLens = [];
          for (i = 0; i < 19; i += 1) { clLens[i] = 0; }
          for (i = 0; i < hclen; i += 1) { clLens[CL_ORDER[i]] = readBits(3); }
          var clHuff = buildHuff(clLens, 19);
          var allLens = [], total = hlit + hdist, rep, prev;
          while (allLens.length < total) {
            sym = decodeSym(clHuff);
            if (sym < 16) {
              allLens.push(sym);
            } else if (sym === 16) {
              rep = readBits(2) + 3;
              prev = allLens.length ? allLens[allLens.length - 1] : 0;
              for (i = 0; i < rep; i += 1) { allLens.push(prev); }
            } else if (sym === 17) {
              rep = readBits(3) + 3;
              for (i = 0; i < rep; i += 1) { allLens.push(0); }
            } else if (sym === 18) {
              rep = readBits(7) + 11;
              for (i = 0; i < rep; i += 1) { allLens.push(0); }
            }
          }
          litHuff = buildHuff(allLens.slice(0, hlit), hlit);
          distHuff = buildHuff(allLens.slice(hlit, hlit + hdist), hdist);
        }
        while (true) {
          sym = decodeSym(litHuff);
          if (sym < 256) {
            out.push(sym);
          } else if (sym === 256) {
            break;
          } else {
            var li = sym - 257;
            if (li < 0 || li >= LEN_BASE.length) { throw new Error('Comprimento DEFLATE inválido.'); }
            length = LEN_BASE[li] + (LEN_EXTRA[li] ? readBits(LEN_EXTRA[li]) : 0);
            distSym = decodeSym(distHuff);
            if (distSym < 0 || distSym >= DIST_BASE.length) { throw new Error('Distância DEFLATE inválida.'); }
            dist = DIST_BASE[distSym] + (DIST_EXTRA[distSym] ? readBits(DIST_EXTRA[distSym]) : 0);
            start = out.length - dist;
            if (start < 0) { throw new Error('Referência DEFLATE fora dos limites.'); }
            for (i = 0; i < length; i += 1) {
              out.push(out[start + i]);
            }
          }
        }
      } else {
        throw new Error('Tipo de bloco DEFLATE não suportado.');
      }
    }
    return new Uint8Array(out);
  }

  function u16(b, o) { return b[o] | (b[o + 1] << 8); }
  function u32(b, o) { return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0; }

  function readZipEntry(bytes, targetName) {
    if (!bytes || bytes.length < 22) { throw new Error('Arquivo .docx inválido ou corrompido.'); }
    var eocd = -1, minPos = Math.max(0, bytes.length - 65557), i;
    for (i = bytes.length - 22; i >= minPos; i -= 1) {
      if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x05 && bytes[i + 3] === 0x06) {
        eocd = i; break;
      }
    }
    if (eocd < 0) { throw new Error('O arquivo não possui estrutura ZIP válida (.docx).'); }
    var cdSize = u32(bytes, eocd + 12);
    var cdOff = u32(bytes, eocd + 16);
    var end = Math.min(bytes.length, cdOff + cdSize);
    var p = cdOff;
    while (p + 46 <= end) {
      if (u32(bytes, p) !== 0x02014b50) { break; }
      var method = u16(bytes, p + 10);
      var compSize = u32(bytes, p + 20);
      var nameLen = u16(bytes, p + 28);
      var extraLen = u16(bytes, p + 30);
      var commentLen = u16(bytes, p + 32);
      var localOff = u32(bytes, p + 42);
      var name = utf8Decode(bytes.subarray(p + 46, p + 46 + nameLen));
      if (name === targetName) {
        if (u32(bytes, localOff) !== 0x04034b50) { throw new Error('Cabeçalho local ZIP inválido.'); }
        var lNameLen = u16(bytes, localOff + 26);
        var lExtraLen = u16(bytes, localOff + 28);
        var dataStart = localOff + 30 + lNameLen + lExtraLen;
        var raw = bytes.subarray(dataStart, dataStart + compSize);
        if (method === 0) { return raw; }
        if (method === 8) { return inflateRaw(raw); }
        throw new Error('Método de compressão ZIP não suportado (' + method + ').');
      }
      p += 46 + nameLen + extraLen + commentLen;
    }
    return null;
  }

  function decodeXmlEntities(str) {
    return String(str || '').replace(/&(#x[0-9a-fA-F]+|#[0-9]+|amp|lt|gt|quot|apos);/g, function (_, ent) {
      if (ent === 'amp') { return '&'; }
      if (ent === 'lt') { return '<'; }
      if (ent === 'gt') { return '>'; }
      if (ent === 'quot') { return '"'; }
      if (ent === 'apos') { return "'"; }
      if (ent.charAt(0) === '#') {
        var code = ent.charAt(1) === 'x' || ent.charAt(1) === 'X'
          ? parseInt(ent.slice(2), 16)
          : parseInt(ent.slice(1), 10);
        if (isFinite(code) && code > 0) {
          if (code <= 0xffff) { return String.fromCharCode(code); }
          code -= 0x10000;
          return String.fromCharCode(0xd800 + (code >> 10), 0xdc00 + (code & 0x3ff));
        }
      }
      return '';
    });
  }

  function cleanFilenameTitle(name) {
    return String(name || 'Manuscrito importado')
      .replace(/^.*[\\/]/, '')
      .replace(/\.(docx|md|markdown|txt)$/i, '')
      .replace(/[_-]+/g, ' ')
      .replace(/^\s+|\s+$/g, '') || 'Manuscrito importado';
  }

  function parseWordXml(xml, fallbackTitle) {
    var paragraphs = [];
    var pRe = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
    var m;
    while ((m = pRe.exec(xml)) !== null) {
      var body = m[1];
      var styleM = /<w:pStyle\b[^>]*w:val="([^"]+)"/i.exec(body);
      var styleVal = styleM ? styleM[1] : '';
      var isHeading = /^(Heading[12]|Title|T[ií]tulo\s*[12]?|Subtitle|Subt[ií]tulo)$/i.test(styleVal);

      var parts = [];
      var tokRe = /<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>|<w:cr\b[^>]*\/>/g;
      var tm;
      while ((tm = tokRe.exec(body)) !== null) {
        if (tm[1] !== undefined) {
          parts.push(decodeXmlEntities(tm[1]));
        } else if (tm[0].indexOf('w:tab') !== -1) {
          parts.push('    ');
        } else {
          parts.push('\n');
        }
      }
      var line = parts.join('').replace(/\r\n?/g, '\n');
      paragraphs.push({ text: line, heading: isHeading && !!line.replace(/^\s+|\s+$/g, '') });
    }

    var headingCount = 0, i;
    for (i = 0; i < paragraphs.length; i += 1) {
      if (paragraphs[i].heading) { headingCount += 1; }
    }

    var baseTitle = cleanFilenameTitle(fallbackTitle);
    var chapters = [];
    if (headingCount >= 2) {
      var cur = null;
      for (i = 0; i < paragraphs.length; i += 1) {
        if (paragraphs[i].heading) {
          if (cur && (cur.lines.length || cur.title)) {
            chapters.push({ title: cur.title, text: cur.lines.join('\n\n').replace(/^\n+|\n+$/g, '') });
          }
          cur = { title: paragraphs[i].text.replace(/^\s+|\s+$/g, ''), lines: [] };
        } else {
          var t = paragraphs[i].text.replace(/\s+$/g, '');
          if (!cur) {
            if (t) { cur = { title: baseTitle, lines: [t] }; }
          } else if (t) {
            cur.lines.push(t);
          }
        }
      }
      if (cur && (cur.lines.length || cur.title)) {
        chapters.push({ title: cur.title, text: cur.lines.join('\n\n').replace(/^\n+|\n+$/g, '') });
      }
    }

    var flatLines = [];
    var firstHeadingTitle = '';
    for (i = 0; i < paragraphs.length; i += 1) {
      var txt = paragraphs[i].text.replace(/\s+$/g, '');
      if (!firstHeadingTitle && paragraphs[i].heading && i === 0) {
        firstHeadingTitle = txt.replace(/^\s+|\s+$/g, '');
        continue;
      }
      if (txt) { flatLines.push(txt); }
    }

    var unifiedTitle = firstHeadingTitle || baseTitle;
    var unifiedText = flatLines.join('\n\n').replace(/^\n+|\n+$/g, '');
    if (!chapters.length) {
      chapters.push({ title: unifiedTitle, text: unifiedText });
    }

    return {
      title: unifiedTitle,
      text: unifiedText,
      chapters: chapters,
      sourceFormat: 'docx'
    };
  }

  function parseDocxBytes(bufferOrBytes, filename) {
    var bytes = bufferOrBytes instanceof Uint8Array
      ? bufferOrBytes
      : new Uint8Array(bufferOrBytes);
    var xmlBytes = readZipEntry(bytes, 'word/document.xml');
    if (!xmlBytes) {
      throw new Error('Não encontrei word/document.xml neste arquivo .docx.');
    }
    var xml = utf8Decode(xmlBytes);
    return parseWordXml(xml, filename);
  }

  function stripInlineMarkdown(line) {
    return String(line || '')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/`([^`]+)`/g, '$1');
  }

  function parseMarkdown(rawText, filename) {
    var text = String(rawText || '').replace(/\r\n?/g, '\n');
    /* Remove frontmatter YAML se houver */
    text = text.replace(/^---\n[\s\S]*?\n---\n*/, '');
    var lines = text.split('\n');
    var baseTitle = cleanFilenameTitle(filename);
    var headingCount = 0, i;
    for (i = 0; i < lines.length; i += 1) {
      if (/^#{1,2}\s+\S/.test(lines[i])) { headingCount += 1; }
    }

    var chapters = [];
    if (headingCount >= 2) {
      var cur = null;
      for (i = 0; i < lines.length; i += 1) {
        var hm = /^#{1,2}\s+(.+)$/.exec(lines[i]);
        if (hm) {
          if (cur) {
            chapters.push({ title: cur.title, text: cur.lines.join('\n').replace(/^\n+|\n+$/g, '') });
          }
          cur = { title: stripInlineMarkdown(hm[1]).replace(/^\s+|\s+$/g, ''), lines: [] };
        } else {
          var cleanL = stripInlineMarkdown(lines[i].replace(/^#{3,6}\s+/, ''));
          if (!cur) {
            if (cleanL.replace(/^\s+|\s+$/g, '')) { cur = { title: baseTitle, lines: [cleanL] }; }
          } else {
            cur.lines.push(cleanL);
          }
        }
      }
      if (cur) {
        chapters.push({ title: cur.title, text: cur.lines.join('\n').replace(/^\n+|\n+$/g, '') });
      }
    }

    var docTitle = baseTitle;
    var bodyLines = [];
    for (i = 0; i < lines.length; i += 1) {
      if (i === 0 && /^#\s+(.+)$/.test(lines[i])) {
        docTitle = stripInlineMarkdown(lines[i].replace(/^#\s+/, '')).replace(/^\s+|\s+$/g, '');
        continue;
      }
      bodyLines.push(stripInlineMarkdown(lines[i].replace(/^#{1,6}\s+/, '')));
    }
    var unified = bodyLines.join('\n').replace(/^\n+|\n+$/g, '');
    if (!chapters.length) {
      chapters.push({ title: docTitle, text: unified });
    }
    return {
      title: docTitle,
      text: unified,
      chapters: chapters,
      sourceFormat: 'markdown'
    };
  }

  root.Escr.editorialImport = {
    inflateRaw: inflateRaw,
    readZipEntry: readZipEntry,
    parseWordXml: parseWordXml,
    parseDocxBytes: parseDocxBytes,
    parseMarkdown: parseMarkdown,
    cleanFilenameTitle: cleanFilenameTitle
  };
}(typeof window !== 'undefined' ? window : this));
