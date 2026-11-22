/* Estúdio de Impressão e Paginação Editorial — ES5 estrito, 100% offline.
 * Nunca altera os documentos originais; gera projeção editorial para impressão/PDF e HTML paginado. */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var PREFS_KEY = 'escrevaral.print.prefs.v1';
  var DYNAMIC_STYLE_ID = 'esc-print-dynamic-style';

  var FORMATS = [
    { id: '14x21', name: 'Livro 14 \u00D7 21 cm', note: 'Padr\u00E3o liter\u00E1rio BR \u00B7 KDP \u00B7 UICLAP', wMm: 140, hMm: 210, top: 18, bottom: 20, inner: 22, outer: 15 },
    { id: '16x23', name: 'Livro 16 \u00D7 23 cm', note: 'N\u00E3o-fic\u00E7\u00E3o \u00B7 Comercial \u00B7 KDP \u00B7 UICLAP', wMm: 160, hMm: 230, top: 20, bottom: 22, inner: 24, outer: 18 },
    { id: 'a4', name: 'A4 (210 \u00D7 297 mm)', note: 'Manuscrito \u00B7 Editora \u00B7 Prova de leitura', wMm: 210, hMm: 297, top: 25, bottom: 25, inner: 28, outer: 25 },
    { id: 'a5', name: 'A5 (148 \u00D7 210 mm)', note: 'Poesia \u00B7 Livreto \u00B7 Zine', wMm: 148, hMm: 210, top: 18, bottom: 20, inner: 20, outer: 15 },
    { id: 'pocket', name: 'Bolso 12 \u00D7 18 cm', note: 'Edi\u00E7\u00E3o de bolso \u00B7 Novela', wMm: 120, hMm: 180, top: 15, bottom: 17, inner: 18, outer: 13 },
    { id: 'letter', name: 'Carta (216 \u00D7 279 mm)', note: 'Roteiro \u00B7 Padr\u00E3o internacional', wMm: 215.9, hMm: 279.4, top: 25, bottom: 25, inner: 32, outer: 25 }
  ];

  var PRESETS = {
    'livro-literario': {
      id: 'livro-literario',
      label: 'Livro liter\u00E1rio (14\u00D721)',
      format: '14x21',
      font: 'serif',
      sizePt: 11,
      leading: 1.48,
      align: 'justify',
      indent: true,
      hyphenate: true,
      dropCap: true,
      mirrorMargins: true,
      gutterMm: 2,
      pageNumPos: 'bottom-outer',
      runningHead: true,
      chapterBreak: true,
      chapterRecto: false,
      frontMatter: true,
      toc: true,
      colophon: true,
      stripPlaceholders: true,
      stripNumericPrefix: true,
      dedupeHeading: true
    },
    'nao-ficcao': {
      id: 'nao-ficcao',
      label: 'N\u00E3o-fic\u00E7\u00E3o / Ensaio (16\u00D723)',
      format: '16x23',
      font: 'serif',
      sizePt: 11,
      leading: 1.5,
      align: 'justify',
      indent: false,
      hyphenate: true,
      dropCap: false,
      mirrorMargins: true,
      gutterMm: 2,
      pageNumPos: 'bottom-outer',
      runningHead: true,
      chapterBreak: true,
      chapterRecto: false,
      frontMatter: true,
      toc: true,
      colophon: true,
      stripPlaceholders: true,
      stripNumericPrefix: true,
      dedupeHeading: true
    },
    'original-editora': {
      id: 'original-editora',
      label: 'Original para editora / Lauda (A4)',
      format: 'a4',
      font: 'mono',
      sizePt: 12,
      leading: 1.8,
      align: 'left',
      indent: true,
      hyphenate: false,
      dropCap: false,
      mirrorMargins: false,
      gutterMm: 0,
      pageNumPos: 'top-outer',
      runningHead: true,
      chapterBreak: true,
      chapterRecto: false,
      frontMatter: true,
      toc: false,
      colophon: false,
      stripPlaceholders: true,
      stripNumericPrefix: true,
      dedupeHeading: true
    },
    'poesia': {
      id: 'poesia',
      label: 'Poesia / Soneto (A5)',
      format: 'a5',
      font: 'serif',
      sizePt: 11.5,
      leading: 1.65,
      align: 'left',
      indent: false,
      hyphenate: false,
      dropCap: false,
      mirrorMargins: true,
      gutterMm: 0,
      pageNumPos: 'bottom-center',
      runningHead: false,
      chapterBreak: true,
      chapterRecto: false,
      frontMatter: true,
      toc: true,
      colophon: true,
      stripPlaceholders: true,
      stripNumericPrefix: true,
      dedupeHeading: true
    },
    'roteiro': {
      id: 'roteiro',
      label: 'Roteiro (Carta \u00B7 Courier 12pt)',
      format: 'letter',
      font: 'mono',
      sizePt: 12,
      leading: 1.35,
      align: 'left',
      indent: false,
      hyphenate: false,
      dropCap: false,
      mirrorMargins: false,
      gutterMm: 0,
      pageNumPos: 'top-outer',
      runningHead: false,
      chapterBreak: false,
      chapterRecto: false,
      frontMatter: true,
      toc: false,
      colophon: false,
      stripPlaceholders: true,
      stripNumericPrefix: true,
      dedupeHeading: true
    },
    'prova-a4': {
      id: 'prova-a4',
      label: 'Prova de leitura (A4)',
      format: 'a4',
      font: 'serif',
      sizePt: 11.5,
      leading: 1.62,
      align: 'left',
      indent: false,
      hyphenate: false,
      dropCap: false,
      mirrorMargins: false,
      gutterMm: 0,
      pageNumPos: 'bottom-center',
      runningHead: false,
      chapterBreak: true,
      chapterRecto: false,
      frontMatter: false,
      toc: false,
      colophon: false,
      stripPlaceholders: true,
      stripNumericPrefix: true,
      dedupeHeading: true
    }
  };

  var NON_MANUSCRIPT_RE = /(estrutura|personag|universo|revis[aã]o|planejamento|pesquisa|ideia|conceito|prepara[cç][aã]o|refer[eê]ncia|bastidor|notas?\b|rascunho|anota[cç])/i;
  var MANUSCRIPT_RE = /(manuscrito|cap[ií]tulo|poema|soneto|reda[cç][aã]o|cenas?|em escrita|textos?|obra|miolo|contos?|cr[oô]nicas?)/i;

  function clamp(val, min, max, fallback) {
    var n = Number(val);
    if (!isFinite(n)) { return fallback; }
    return Math.max(min, Math.min(max, n));
  }

  function findFormat(id) {
    var i;
    for (i = 0; i < FORMATS.length; i += 1) {
      if (FORMATS[i].id === id) { return FORMATS[i]; }
    }
    return FORMATS[2]; // a4
  }

  function presetById(id) {
    return Object.prototype.hasOwnProperty.call(PRESETS, id) ? PRESETS[id] : PRESETS['prova-a4'];
  }

  function presetForTemplate(templateId) {
    var pid = (root.Escr.templates && root.Escr.templates.printPresetFor && templateId)
      ? root.Escr.templates.printPresetFor(templateId)
      : 'prova-a4';
    return presetById(pid);
  }

  function normalizeConfig(raw, templateId) {
    var base = presetForTemplate(templateId);
    var p = raw && typeof raw === 'object' ? raw : {};
    var fmt = findFormat(typeof p.format === 'string' ? p.format : base.format);
    var pos = p.pageNumPos;
    var okPos = pos === 'bottom-center' || pos === 'bottom-outer' || pos === 'top-outer' || pos === 'none';
    return {
      presetId: typeof p.presetId === 'string' && Object.prototype.hasOwnProperty.call(PRESETS, p.presetId) ? p.presetId : base.id,
      scope: p.scope === 'book' ? 'book' : 'current',
      format: fmt.id,
      font: p.font === 'mono' ? 'mono' : (p.font === 'serif' ? 'serif' : base.font),
      sizePt: clamp(typeof p.sizePt !== 'undefined' ? p.sizePt : base.sizePt, 9.5, 14, base.sizePt),
      leading: clamp(typeof p.leading !== 'undefined' ? p.leading : base.leading, 1.3, 2.0, base.leading),
      align: p.align === 'justify' ? 'justify' : (p.align === 'left' ? 'left' : base.align),
      indent: typeof p.indent === 'boolean' ? p.indent : base.indent,
      hyphenate: typeof p.hyphenate === 'boolean' ? p.hyphenate : base.hyphenate,
      dropCap: typeof p.dropCap === 'boolean' ? p.dropCap : base.dropCap,
      mirrorMargins: typeof p.mirrorMargins === 'boolean' ? p.mirrorMargins : base.mirrorMargins,
      gutterMm: clamp(typeof p.gutterMm !== 'undefined' ? p.gutterMm : base.gutterMm, 0, 12, base.gutterMm),
      pageNumPos: okPos ? pos : base.pageNumPos,
      runningHead: typeof p.runningHead === 'boolean' ? p.runningHead : base.runningHead,
      chapterBreak: typeof p.chapterBreak === 'boolean' ? p.chapterBreak : base.chapterBreak,
      chapterRecto: typeof p.chapterRecto === 'boolean' ? p.chapterRecto : base.chapterRecto,
      frontMatter: typeof p.frontMatter === 'boolean' ? p.frontMatter : base.frontMatter,
      toc: typeof p.toc === 'boolean' ? p.toc : base.toc,
      colophon: typeof p.colophon === 'boolean' ? p.colophon : base.colophon,
      stripPlaceholders: typeof p.stripPlaceholders === 'boolean' ? p.stripPlaceholders : base.stripPlaceholders,
      stripNumericPrefix: typeof p.stripNumericPrefix === 'boolean' ? p.stripNumericPrefix : base.stripNumericPrefix,
      dedupeHeading: typeof p.dedupeHeading === 'boolean' ? p.dedupeHeading : base.dedupeHeading,
      bookTitle: typeof p.bookTitle === 'string' ? p.bookTitle.slice(0, 140) : '',
      bookSubtitle: typeof p.bookSubtitle === 'string' ? p.bookSubtitle.slice(0, 180) : '',
      authorName: typeof p.authorName === 'string' ? p.authorName.slice(0, 120) : '',
      editionNote: typeof p.editionNote === 'string' ? p.editionNote.slice(0, 140) : '',
      dedication: typeof p.dedication === 'string' ? p.dedication.slice(0, 400) : '',
      showGuides: !!p.showGuides
    };
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeCssString(str) {
    return String(str || '')
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\r?\n/g, ' ')
      .replace(/^\s+|\s+$/g, '')
      .slice(0, 90);
  }

  function naturalCompare(a, b) {
    var sa = String(a || '').toLowerCase();
    var sb = String(b || '').toLowerCase();
    var re = /(\d+|\D+)/g;
    var pa = sa.match(re) || [];
    var pb = sb.match(re) || [];
    var len = Math.min(pa.length, pb.length), i;
    for (i = 0; i < len; i += 1) {
      if (pa[i] === pb[i]) { continue; }
      var na = /^\d+$/.test(pa[i]) ? Number(pa[i]) : NaN;
      var nb = /^\d+$/.test(pb[i]) ? Number(pb[i]) : NaN;
      if (!isNaN(na) && !isNaN(nb)) {
        if (na !== nb) { return na < nb ? -1 : 1; }
      } else {
        return pa[i] < pb[i] ? -1 : 1;
      }
    }
    return pa.length - pb.length;
  }

  function stripNumericPrefix(rawTitle) {
    var t = String(rawTitle || '').replace(/^\s+|\s+$/g, '');
    var cleaned = t.replace(/^\d{1,3}\s*[.\-\u00B7)]\s+/, '');
    return cleaned || t;
  }

  function isKnownPlaceholder(match) {
    if (root.Escr.templates && root.Escr.templates.isPlaceholder) {
      return !!root.Escr.templates.isPlaceholder(match);
    }
    return false;
  }

  function stripGuidePlaceholders(text) {
    var src = String(text || '');
    return src.replace(/\u00AB[^\u00AB\u00BB]+\u00BB/g, function (match) {
      return isKnownPlaceholder(match) ? '' : match;
    }).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/^\s+|\s+$/g, '');
  }

  function normHeading(s) {
    return String(s || '')
      .replace(/^\s+|\s+$/g, '')
      .replace(/\s+/g, ' ')
      .replace(/[\u2014\u2013\-:]\s*$/, '')
      .toLowerCase();
  }

  function countWordsSimple(str) {
    if (root.Escr.countManuscript) { return root.Escr.countManuscript(str || '').words || 0; }
    var m = String(str || '').match(/[A-Za-z\u00C0-\u00FF0-9]+/g);
    return m ? m.length : 0;
  }

  function folderOrderMap(book) {
    var map = Object.create(null);
    if (book && book.data && Object.prototype.toString.call(book.data.folders) === '[object Array]') {
      var i;
      for (i = 0; i < book.data.folders.length; i += 1) {
        map[book.data.folders[i]] = i;
      }
    }
    return map;
  }

  function sortBookDocs(book, docs, customOrder) {
    var list = (docs || []).filter(function (d) { return d && !d.trashed && d.kind !== 'reminder'; });
    var orderIdx = Object.create(null);
    if (customOrder && Object.prototype.toString.call(customOrder) === '[object Array]') {
      var ci;
      for (ci = 0; ci < customOrder.length; ci += 1) {
        orderIdx[customOrder[ci]] = ci;
      }
    }
    var fMap = folderOrderMap(book);
    return list.slice().sort(function (a, b) {
      var ka = a.noteId || a.id, kb = b.noteId || b.id;
      var hasA = typeof orderIdx[ka] === 'number';
      var hasB = typeof orderIdx[kb] === 'number';
      if (hasA && hasB && orderIdx[ka] !== orderIdx[kb]) { return orderIdx[ka] - orderIdx[kb]; }
      if (hasA !== hasB) { return hasA ? -1 : 1; }
      var fa = typeof fMap[a.folder] === 'number' ? fMap[a.folder] : 9999;
      var fb = typeof fMap[b.folder] === 'number' ? fMap[b.folder] : 9999;
      if (fa !== fb) { return fa - fb; }
      var byTitle = naturalCompare(a.title || '', b.title || '');
      if (byTitle !== 0) { return byTitle; }
      return (a.created || '') < (b.created || '') ? -1 : (a.created || '') > (b.created || '') ? 1 : 0;
    });
  }

  function resolveManuscriptFolders(book) {
    if (!book || !book.data) { return []; }
    if (Object.prototype.toString.call(book.data.manuscriptFolders) === '[object Array]' && book.data.manuscriptFolders.length) {
      return book.data.manuscriptFolders.slice();
    }
    if (book.data.template && root.Escr.templates && root.Escr.templates.manuscriptFoldersFor) {
      return root.Escr.templates.manuscriptFoldersFor(book.data.template);
    }
    return [];
  }

  function isManuscriptDoc(book, doc) {
    if (!doc || doc.trashed || doc.kind === 'reminder' || doc.category === 'reference') { return false; }
    var msFolders = resolveManuscriptFolders(book);
    if (msFolders.length) {
      if (doc.folder && msFolders.indexOf(doc.folder) !== -1) { return true; }
      if (!doc.folder) { return true; }
      return false;
    }
    if (doc.folder) {
      if (NON_MANUSCRIPT_RE.test(doc.folder) && !MANUSCRIPT_RE.test(doc.folder)) { return false; }
    }
    return true;
  }

  function selectManuscriptDocs(book, docs) {
    var ordered = sortBookDocs(book, docs, null);
    var filtered = ordered.filter(function (d) { return isManuscriptDoc(book, d); });
    if (filtered.length) { return filtered; }
    return ordered.filter(function (d) { return d && d.category !== 'reference'; });
  }

  function formatMargins(config) {
    var fmt = findFormat(config.format);
    var extraGutter = config.mirrorMargins ? clamp(config.gutterMm, 0, 12, 0) : 0;
    return {
      widthMm: fmt.wMm,
      heightMm: fmt.hMm,
      topMm: fmt.top,
      bottomMm: fmt.bottom,
      innerMm: fmt.inner + extraGutter,
      outerMm: fmt.outer,
      contentWidthMm: Math.max(40, fmt.wMm - (fmt.inner + extraGutter + fmt.outer)),
      contentHeightMm: Math.max(60, fmt.hMm - (fmt.top + fmt.bottom))
    };
  }

  function estimatePages(chapters, config) {
    var m = formatMargins(config);
    var fontScale = config.font === 'mono' ? 1.18 : 1.0;
    var charWidthMm = (config.sizePt * 0.3528) * 0.50 * fontScale;
    var lineHeightMm = (config.sizePt * 0.3528) * config.leading;
    var charsPerLine = Math.max(24, Math.floor(m.contentWidthMm / charWidthMm));
    var linesPerPage = Math.max(12, Math.floor(m.contentHeightMm / lineHeightMm));
    var charsPerPage = Math.max(400, charsPerLine * linesPerPage * 0.88);

    var totalPages = 0;
    var totalWords = 0;
    var breakdown = [];
    var isBook = config.scope === 'book' || (chapters && chapters.length > 1);

    if (config.frontMatter) {
      totalPages += 1;
      if (config.dedication && config.dedication.replace(/^\s+|\s+$/g, '')) { totalPages += 1; }
    }
    if (config.toc && chapters && chapters.length > 1) {
      totalPages += Math.max(1, Math.ceil(chapters.length / 26));
    }

    var i, ch, rawTxt, words, chPages, startPage;
    for (i = 0; i < (chapters || []).length; i += 1) {
      ch = chapters[i];
      rawTxt = config.stripPlaceholders ? stripGuidePlaceholders(ch.text || '') : String(ch.text || '');
      words = countWordsSimple(rawTxt);
      totalWords += words;
      var effChars = rawTxt.length + (rawTxt.split(/\n/).length * (charsPerLine * 0.32)) + (isBook && config.chapterBreak ? charsPerLine * 6 : 0);
      chPages = Math.max(1, Math.ceil(effChars / charsPerPage));
      if (config.chapterBreak) {
        if (config.chapterRecto && totalPages % 2 === 1) { totalPages += 1; }
        startPage = totalPages + 1;
        totalPages += chPages;
      } else {
        startPage = Math.max(1, totalPages || 1);
        totalPages = Math.max(1, Math.ceil((totalPages * charsPerPage + effChars) / charsPerPage));
      }
      breakdown.push({
        id: ch.noteId || ch.id || ('ch-' + i),
        title: ch.displayTitle || ch.title || 'Sem t\u00EDtulo',
        words: words,
        startPage: startPage,
        pages: chPages
      });
    }
    if (config.colophon) { totalPages += 1; }
    if (totalPages < 1) { totalPages = 1; }
    return {
      totalPages: totalPages,
      totalWords: totalWords,
      charsPerPage: Math.round(charsPerPage),
      linesPerPage: linesPerPage,
      margins: m,
      chapters: breakdown
    };
  }

  function renderPlainBlockHtml(text, config, headingText) {
    var src = config.stripPlaceholders ? stripGuidePlaceholders(text) : String(text || '');
    var rawBlocks = src.replace(/\r\n?/g, '\n').split(/\n{2,}/);
    var out = [], i, block, trimmed, firstParaDone = false, skippedDupH1 = false;
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
        out.push('<h2 class="ep-h1">' + escapeHtml(h1Txt) + '</h2>');
        continue;
      }
      if (/^##\s+/.test(trimmed) && trimmed.indexOf('\n') === -1) {
        out.push('<h3 class="ep-h2">' + escapeHtml(trimmed.replace(/^##\s+/, '')) + '</h3>');
        continue;
      }
      if (/^###\s+/.test(trimmed) && trimmed.indexOf('\n') === -1) {
        out.push('<h4 class="ep-h3">' + escapeHtml(trimmed.replace(/^###\s+/, '')) + '</h4>');
        continue;
      }
      if (/^(---+|\*\s*\*\s*\*)$/.test(trimmed)) {
        out.push('<div class="ep-scene-break" aria-hidden="true">\u2766</div>');
        continue;
      }
      if (/^>\s+/.test(trimmed)) {
        out.push('<blockquote>' + escapeHtml(trimmed.replace(/^>\s+/gm, '')) + '</blockquote>');
        continue;
      }
      var cls = (!firstParaDone && config.dropCap && trimmed.length >= 60 && /^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/.test(trimmed))
        ? ' class="ep-first-para ep-dropcap"'
        : (!firstParaDone ? ' class="ep-first-para"' : '');
      firstParaDone = true;
      out.push('<p' + cls + '>' + escapeHtml(block) + '</p>');
    }
    if (!out.length) {
      out.push('<p class="ep-empty">Folha em branco.</p>');
    }
    return out.join('\n');
  }

  function cleanRichHtmlForPrint(richHtml, config, headingText) {
    var safe = (root.Escr.richEditor && root.Escr.richEditor.sanitizeHtml)
      ? root.Escr.richEditor.sanitizeHtml(richHtml || '')
      : String(richHtml || '');
    if (config.stripPlaceholders) {
      safe = safe.replace(/\u00AB[^\u00AB\u00BB<]+\u00BB/g, function (match) {
        return isKnownPlaceholder(match) ? '' : match;
      });
    }
    if (config.dedupeHeading && headingText) {
      var normTitle = normHeading(headingText);
      safe = safe.replace(/^\s*<h1[^>]*>([\s\S]*?)<\/h1>/i, function (full, inner) {
        var plainH = inner.replace(/<[^>]+>/g, '').replace(/[\u2014\u2013\-]\s*$/, '').replace(/^\s+|\s+$/g, '');
        var nH = normHeading(plainH);
        if (!nH || nH === normTitle || nH.indexOf(normTitle) === 0 || normTitle.indexOf(nH) === 0) {
          return '';
        }
        return full;
      });
    }
    safe = safe.replace(/<p>\s*(?:<br\s*\/?>|\u00A0|\s)*<\/p>/gi, '');
    safe = safe.replace(/<hr\s*\/?>/gi, '<div class="ep-scene-break" aria-hidden="true">\u2766</div>');
    if (config.dropCap) {
      var applied = false;
      safe = safe.replace(/<p>([\s\S]*?)<\/p>/i, function (full, inner) {
        if (applied) { return full; }
        var plain = inner.replace(/<[^>]+>/g, '').replace(/^\s+|\s+$/g, '');
        if (plain.length >= 60 && /^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/.test(plain)) {
          applied = true;
          return '<p class="ep-first-para ep-dropcap">' + inner + '</p>';
        }
        applied = true;
        return '<p class="ep-first-para">' + inner + '</p>';
      });
    }
    return safe || '<p class="ep-empty">Folha em branco.</p>';
  }

  function renderDocumentBodyHtml(docObj, config, headingText) {
    if (!docObj) { return '<p class="ep-empty">Folha em branco.</p>'; }
    if (docObj.format === 'rich' && docObj.richHtml) {
      return cleanRichHtmlForPrint(docObj.richHtml, config, headingText);
    }
    return renderPlainBlockHtml(docObj.text || '', config, headingText);
  }

  function formatDateLong() {
    try {
      var d = new Date();
      var months = ['janeiro', 'fevereiro', 'mar\u00E7o', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      return d.getDate() + ' de ' + months[d.getMonth()] + ' de ' + d.getFullYear();
    } catch (e) { return ''; }
  }

  function buildPageCss(config) {
    var m = formatMargins(config);
    var fontStack = config.font === 'mono'
      ? "'Courier Prime', 'Courier New', Courier, monospace"
      : "'Noto Serif', Georgia, 'Times New Roman', Times, serif";
    var runTitle = escapeCssString(config.bookTitle || '');
    var runAuthor = escapeCssString(config.authorName || runTitle);

    var leftHeader = config.runningHead && runAuthor ? '"' + runAuthor + '"' : 'none';
    var rightHeader = config.runningHead && runTitle ? '"' + runTitle + '"' : 'none';

    var pageNumRuleAll = '';
    var pageNumRuleLeft = '';
    var pageNumRuleRight = '';
    if (config.pageNumPos === 'bottom-center') {
      pageNumRuleAll = '@bottom-center { content: counter(page); font: 9pt/1 ' + fontStack + '; color: #444; }';
    } else if (config.pageNumPos === 'bottom-outer') {
      pageNumRuleAll = '@bottom-right { content: counter(page); font: 9pt/1 ' + fontStack + '; color: #444; }';
      pageNumRuleLeft = '@bottom-left { content: counter(page); font: 9pt/1 ' + fontStack + '; color: #444; } @bottom-right { content: none; }';
      pageNumRuleRight = '@bottom-right { content: counter(page); font: 9pt/1 ' + fontStack + '; color: #444; } @bottom-left { content: none; }';
    } else if (config.pageNumPos === 'top-outer') {
      pageNumRuleAll = '@top-right { content: counter(page); font: 9pt/1 ' + fontStack + '; color: #444; }';
      pageNumRuleLeft = '@top-left { content: counter(page); font: 9pt/1 ' + fontStack + '; color: #444; }';
      pageNumRuleRight = '@top-right { content: counter(page); font: 9pt/1 ' + fontStack + '; color: #444; }';
    }

    var topHeadLeft = (config.runningHead && config.pageNumPos !== 'top-outer')
      ? '@top-left { content: ' + leftHeader + '; font: italic 8.5pt/1 ' + fontStack + '; color: #555; letter-spacing: 0.04em; }'
      : '';
    var topHeadRight = (config.runningHead && config.pageNumPos !== 'top-outer')
      ? '@top-right { content: ' + rightHeader + '; font: italic 8.5pt/1 ' + fontStack + '; color: #555; letter-spacing: 0.04em; }'
      : '';

    var lines = [];
    lines.push('@page {');
    lines.push('  size: ' + m.widthMm + 'mm ' + m.heightMm + 'mm;');
    lines.push('  margin: ' + m.topMm + 'mm ' + m.outerMm + 'mm ' + m.bottomMm + 'mm ' + m.innerMm + 'mm;');
    if (pageNumRuleAll) { lines.push('  ' + pageNumRuleAll); }
    lines.push('}');
    if (config.mirrorMargins) {
      lines.push('@page :right { margin-left: ' + m.innerMm + 'mm; margin-right: ' + m.outerMm + 'mm; ' + topHeadRight + ' ' + pageNumRuleRight + ' }');
      lines.push('@page :left { margin-left: ' + m.outerMm + 'mm; margin-right: ' + m.innerMm + 'mm; ' + topHeadLeft + ' ' + pageNumRuleLeft + ' }');
    } else if (config.runningHead && config.pageNumPos !== 'top-outer') {
      lines.push('@page { @top-right { content: ' + rightHeader + '; font: italic 8.5pt/1 ' + fontStack + '; color: #555; } }');
    }
    lines.push('@page :first { @top-left { content: none; } @top-right { content: none; } @top-center { content: none; } }');
    lines.push('@page esc-front { @top-left { content: none; } @top-right { content: none; } @bottom-left { content: none; } @bottom-center { content: none; } @bottom-right { content: none; } }');
    lines.push('@page esc-chapter { @top-left { content: none; } @top-right { content: none; } }');

    lines.push('@media print {');
    lines.push('  body > #print-sheet {');
    lines.push('    font-family: ' + fontStack + ' !important;');
    lines.push('    font-size: ' + config.sizePt + 'pt !important;');
    lines.push('    line-height: ' + config.leading + ' !important;');
    lines.push('    text-align: ' + config.align + ' !important;');
    lines.push('    hyphens: ' + (config.hyphenate ? 'auto' : 'none') + ' !important;');
    lines.push('    -webkit-hyphens: ' + (config.hyphenate ? 'auto' : 'none') + ' !important;');
    lines.push('  }');
    if (config.indent) {
      lines.push('  #print-sheet .ep-chapter-body p { margin: 0 !important; text-indent: 1.5em !important; }');
      lines.push('  #print-sheet .ep-chapter-body p.ep-first-para, #print-sheet .ep-chapter-body h1 + p, #print-sheet .ep-chapter-body h2 + p, #print-sheet .ep-chapter-body h3 + p, #print-sheet .ep-chapter-body h4 + p, #print-sheet .ep-chapter-body .ep-scene-break + p, #print-sheet .ep-chapter-body blockquote + p { text-indent: 0 !important; }');
    } else {
      lines.push('  #print-sheet .ep-chapter-body p { margin: 0 0 8.5pt !important; text-indent: 0 !important; }');
    }
    if (config.chapterBreak) {
      lines.push('  #print-sheet .ep-chapter + .ep-chapter { page-break-before: ' + (config.chapterRecto ? 'right' : 'always') + '; break-before: ' + (config.chapterRecto ? 'right' : 'page') + '; }');
    } else {
      lines.push('  #print-sheet .ep-chapter + .ep-chapter { margin-top: 24pt; padding-top: 14pt; border-top: 0.5pt solid #ccc; page-break-before: auto; break-before: auto; }');
    }
    lines.push('}');
    return lines.join('\n');
  }

  function renderPrintSheetHtml(payload) {
    var config = payload.config;
    var chapters = payload.chapters || [];
    var est = estimatePages(chapters, config);
    var out = [];
    var isMulti = chapters.length > 1 || config.scope === 'book';
    var mainTitle = config.bookTitle || (chapters[0] && chapters[0].displayTitle) || 'Sem t\u00EDtulo';

    if (config.frontMatter) {
      out.push('<section class="ep-front ep-title-page">');
      if (config.authorName) {
        out.push('<p class="ep-fp-author">' + escapeHtml(config.authorName) + '</p>');
      }
      out.push('<h1 class="ep-fp-title">' + escapeHtml(mainTitle) + '</h1>');
      if (config.bookSubtitle) {
        out.push('<p class="ep-fp-subtitle">' + escapeHtml(config.bookSubtitle) + '</p>');
      }
      out.push('<div class="ep-fp-rule" aria-hidden="true"></div>');
      if (config.presetId === 'original-editora') {
        out.push('<p class="ep-fp-meta">Original para avalia\u00E7\u00E3o editorial \u00B7 ' + est.totalWords.toLocaleString('pt-BR') + ' palavras</p>');
      }
      if (config.editionNote) {
        out.push('<p class="ep-fp-imprint">' + escapeHtml(config.editionNote) + '</p>');
      } else {
        out.push('<p class="ep-fp-imprint">' + escapeHtml(String(new Date().getFullYear())) + '</p>');
      }
      out.push('</section>');

      if (config.dedication && config.dedication.replace(/^\s+|\s+$/g, '')) {
        out.push('<section class="ep-front ep-dedication"><p>' + escapeHtml(config.dedication) + '</p></section>');
      }
    }

    if (config.toc && chapters.length > 1) {
      out.push('<nav class="ep-front ep-toc" aria-label="Sum\u00E1rio">');
      out.push('<h2 class="ep-toc-heading">Sum\u00E1rio</h2>');
      out.push('<ol class="ep-toc-list">');
      var ti;
      for (ti = 0; ti < chapters.length; ti += 1) {
        var chMeta = est.chapters[ti] || { startPage: ti + 1 };
        out.push('<li class="ep-toc-item"><span class="ep-toc-name">' + escapeHtml(chapters[ti].displayTitle || 'Sem t\u00EDtulo') + '</span><span class="ep-toc-dots" aria-hidden="true"></span><span class="ep-toc-est">~' + chMeta.startPage + '</span></li>');
      }
      out.push('</ol>');
      out.push('<p class="ep-toc-note">Numera\u00E7\u00E3o de sum\u00E1rio estimada conforme a mancha gr\u00E1fica selecionada.</p>');
      out.push('</nav>');
    }

    var ci;
    for (ci = 0; ci < chapters.length; ci += 1) {
      var ch = chapters[ci];
      var displayTitle = ch.displayTitle || '';
      var bodyHtml = renderDocumentBodyHtml(ch, config, displayTitle);
      out.push('<section class="ep-chapter' + (isMulti ? ' ep-chapter-book' : ' ep-chapter-single') + '">');
      if (displayTitle) {
        out.push('<header class="ep-chapter-head">');
        if (isMulti && chapters.length > 1) {
          out.push('<span class="ep-chapter-num">' + (ci + 1) + '</span>');
        }
        out.push('<h1 class="ep-chapter-title">' + escapeHtml(displayTitle) + '</h1>');
        out.push('</header>');
      }
      out.push('<div class="ep-chapter-body ' + (ch.format === 'rich' && ch.richHtml ? 'is-rich' : 'is-plain') + '">');
      out.push(bodyHtml);
      out.push('</div>');
      out.push('</section>');
    }

    if (config.colophon) {
      var fmt = findFormat(config.format);
      out.push('<footer class="ep-colophon">');
      out.push('<div class="ep-colophon-mark" aria-hidden="true">\u2014 \u2766 \u2014</div>');
      out.push('<p><strong>' + escapeHtml(mainTitle) + '</strong>' + (config.authorName ? ' \u00B7 ' + escapeHtml(config.authorName) : '') + '</p>');
      out.push('<p>Composto em ' + (config.font === 'mono' ? 'Courier Prime' : 'Noto Serif') + ' ' + config.sizePt + ' pt, formato ' + escapeHtml(fmt.name) + ' (' + est.totalWords.toLocaleString('pt-BR') + ' palavras).</p>');
      out.push('<p>Preparado no Escrevaral em ' + escapeHtml(formatDateLong()) + '.</p>');
      out.push('</footer>');
    }

    return out.join('\n');
  }

  function buildStandaloneHtml(payload) {
    var config = payload.config;
    var mainTitle = config.bookTitle || (payload.chapters && payload.chapters[0] && payload.chapters[0].displayTitle) || 'Manuscrito';
    var pageCss = buildPageCss(config);
    var bodyInner = renderPrintSheetHtml(payload);
    var basePrintCss = [
      'html, body { margin: 0; padding: 0; background: #fff; color: #111; }',
      'body { padding: 24px; background: #e8e5dd; }',
      '#print-sheet { max-width: ' + findFormat(config.format).wMm + 'mm; margin: 0 auto; padding: 18mm; background: #fff; box-shadow: 0 6px 28px rgba(0,0,0,0.14); font-family: ' + (config.font === 'mono' ? "'Courier Prime', 'Courier New', monospace" : "'Noto Serif', Georgia, 'Times New Roman', serif") + '; font-size: ' + config.sizePt + 'pt; line-height: ' + config.leading + '; text-align: ' + config.align + '; hyphens: ' + (config.hyphenate ? 'auto' : 'none') + '; }',
      '@media print { body { padding: 0; background: #fff; } #print-sheet { max-width: none; padding: 0; margin: 0; box-shadow: none; } }',
      '.ep-front { page: esc-front; page-break-after: always; break-after: page; }',
      '.ep-title-page { text-align: center; padding-top: 26%; }',
      '.ep-fp-author { font-size: 1.05em; letter-spacing: 0.14em; text-transform: uppercase; color: #444; margin: 0 0 28pt; }',
      '.ep-fp-title { font-size: 2.1em; line-height: 1.18; margin: 0 0 10pt; font-weight: 700; }',
      '.ep-fp-subtitle { font-size: 1.1em; font-style: italic; color: #444; margin: 0 0 24pt; }',
      '.ep-fp-rule { width: 42mm; height: 0.75pt; background: #666; margin: 22pt auto; }',
      '.ep-fp-meta, .ep-fp-imprint { font-size: 0.85em; color: #555; margin-top: 32pt; }',
      '.ep-dedication { padding-top: 28%; text-align: right; font-style: italic; }',
      '.ep-dedication p { display: inline-block; max-width: 68%; text-align: right; white-space: pre-wrap; }',
      '.ep-toc-heading { font-size: 1.35em; letter-spacing: 0.08em; text-transform: uppercase; text-align: center; margin: 0 0 18pt; }',
      '.ep-toc-list { list-style: none; padding: 0; margin: 0; }',
      '.ep-toc-item { display: flex; align-items: baseline; gap: 6pt; margin: 0 0 7pt; }',
      '.ep-toc-dots { flex: 1 1 auto; border-bottom: 0.6pt dotted #888; }',
      '.ep-toc-est { font-variant-numeric: tabular-nums; color: #555; font-size: 0.9em; }',
      '.ep-toc-note { margin-top: 18pt; font-size: 0.78em; color: #666; text-align: center; font-style: italic; }',
      '.ep-chapter { page: esc-chapter; }',
      '.ep-chapter-head { margin: 0 0 18pt; page-break-after: avoid; break-after: avoid; }',
      '.ep-chapter-book .ep-chapter-head { padding-top: 14mm; text-align: center; margin-bottom: 24pt; }',
      '.ep-chapter-num { display: block; font-size: 0.85em; letter-spacing: 0.2em; color: #555; margin-bottom: 6pt; }',
      '.ep-chapter-title { font-size: 1.55em; line-height: 1.24; margin: 0; font-weight: 700; }',
      '.ep-chapter-single .ep-chapter-head { border-bottom: 0.75pt solid #888; padding-bottom: 8pt; }',
      '.ep-chapter-body p { orphans: 3; widows: 3; white-space: pre-wrap; }',
      '.ep-chapter-body.is-rich p { white-space: normal; }',
      '.ep-chapter-body p.ep-dropcap:first-letter { float: left; font-size: 3.1em; line-height: 0.82; font-weight: 700; padding: 0.06em 0.14em 0 0; }',
      '.ep-chapter-body h2, .ep-chapter-body h3, .ep-chapter-body h4 { page-break-after: avoid; break-after: avoid; margin: 14pt 0 6pt; }',
      '.ep-chapter-body blockquote { margin: 10pt 0 10pt 16pt; padding-left: 10pt; border-left: 1.5pt solid #888; font-style: italic; page-break-inside: avoid; break-inside: avoid; }',
      '.ep-chapter-body pre { margin: 10pt 0; padding: 6pt 8pt; border: 0.5pt solid #bbb; font-family: monospace; font-size: 0.85em; white-space: pre-wrap; page-break-inside: avoid; break-inside: avoid; }',
      '.ep-scene-break { text-align: center; margin: 14pt 0; letter-spacing: 0.3em; color: #555; page-break-before: avoid; break-before: avoid; }',
      '.ep-colophon { page: esc-front; page-break-before: always; break-before: page; padding-top: 46%; text-align: center; font-size: 0.85em; color: #555; }',
      '.ep-colophon-mark { margin-bottom: 12pt; letter-spacing: 0.2em; }'
    ].join('\n');

    return '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<title>' +
      escapeHtml(mainTitle) + ' \u2014 Edi\u00E7\u00E3o paginada</title>\n<style>\n' +
      basePrintCss + '\n' + pageCss + '\n</style>\n</head>\n<body>\n<article id="print-sheet" lang="pt-BR">\n' +
      bodyInner + '\n</article>\n</body>\n</html>\n';
  }

  root.Escr.printCore = {
    FORMATS: FORMATS,
    PRESETS: PRESETS,
    findFormat: findFormat,
    presetById: presetById,
    presetForTemplate: presetForTemplate,
    normalizeConfig: normalizeConfig,
    naturalCompare: naturalCompare,
    stripNumericPrefix: stripNumericPrefix,
    stripGuidePlaceholders: stripGuidePlaceholders,
    sortBookDocs: sortBookDocs,
    selectManuscriptDocs: selectManuscriptDocs,
    isManuscriptDoc: isManuscriptDoc,
    formatMargins: formatMargins,
    estimatePages: estimatePages,
    buildPageCss: buildPageCss,
    renderDocumentBodyHtml: renderDocumentBodyHtml,
    renderPrintSheetHtml: renderPrintSheetHtml,
    buildStandaloneHtml: buildStandaloneHtml
  };

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }
  function mk(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (typeof txt === 'string') { n.textContent = txt; }
    return n;
  }

  root.Escr.mountPrintStudio = function (opts) {
    opts = opts || {};
    var storage = opts.storage || null;
    var overlayEl = null;
    var activeTab = 'escopo';
    var previousFocus = null;
    var previewIndex = 0;

    var state = {
      config: normalizeConfig(null, ''),
      bookId: null,
      bookDocs: [],
      selectedIds: {},
      orderIds: []
    };

    function getLiveCurrentDoc() {
      var cur = opts.getCurrentDoc ? opts.getCurrentDoc() : null;
      return cur ? JSON.parse(JSON.stringify(cur)) : { id: 'current', noteId: 'current', title: '', text: '', format: 'plain' };
    }

    function getActiveBook() {
      return opts.getActiveBook ? opts.getActiveBook() : null;
    }

    function getBookDocs(book) {
      if (!book || !opts.getBookDocs) { return []; }
      var raw = opts.getBookDocs(book) || [];
      var cur = getLiveCurrentDoc();
      var replaced = false, out = [], i;
      for (i = 0; i < raw.length; i += 1) {
        if (raw[i] && (raw[i].id === cur.id || (raw[i].noteId && raw[i].noteId === (cur.noteId || cur.id)))) {
          out.push(cur);
          replaced = true;
        } else if (raw[i]) {
          out.push(raw[i]);
        }
      }
      if (!replaced && cur && cur.projectId === book.id && !cur.trashed && cur.kind !== 'reminder') {
        out.push(cur);
      }
      return out;
    }

    function loadSavedConfig(book) {
      var tplId = book && book.data && book.data.template ? book.data.template : '';
      if (book && book.data && book.data.printConfig && typeof book.data.printConfig === 'object') {
        var cfg = normalizeConfig(book.data.printConfig, tplId);
        if (!cfg.bookTitle && book.name) { cfg.bookTitle = book.name; }
        return cfg;
      }
      var stored = null;
      try {
        if (storage) { stored = JSON.parse(storage.getItem(PREFS_KEY) || 'null'); }
      } catch (ignore) {}
      var norm = normalizeConfig(book ? null : stored, tplId);
      if (book) {
        norm.bookTitle = book.name || '';
        norm.scope = 'book';
      } else {
        norm.scope = 'current';
      }
      return norm;
    }

    function persistConfig() {
      var book = getActiveBook();
      var toSave = JSON.parse(JSON.stringify(state.config));
      toSave.selectedIds = Object.keys(state.selectedIds).filter(function (k) { return !!state.selectedIds[k]; });
      toSave.orderIds = state.orderIds.slice();
      if (book && opts.saveBookPrintConfig) {
        try { opts.saveBookPrintConfig(book.id, toSave); } catch (ignore) {}
      }
      try {
        if (storage) { storage.setItem(PREFS_KEY, JSON.stringify(state.config)); }
      } catch (ignore) {}
    }

    function initForContext(initialScope) {
      var book = getActiveBook();
      var cur = getLiveCurrentDoc();
      state.bookId = book ? book.id : null;
      state.config = loadSavedConfig(book);
      if (initialScope === 'current' || initialScope === 'book') {
        state.config.scope = (initialScope === 'book' && book) ? 'book' : 'current';
      } else if (!book) {
        state.config.scope = 'current';
      }
      if (!state.config.bookTitle) {
        state.config.bookTitle = book ? book.name : (cur.title || 'Sem t\u00EDtulo');
      }

      var savedCfg = book && book.data && book.data.printConfig ? book.data.printConfig : null;
      var savedOrder = savedCfg && Object.prototype.toString.call(savedCfg.orderIds) === '[object Array]' ? savedCfg.orderIds : null;
      var docs = book ? sortBookDocs(book, getBookDocs(book), savedOrder) : [];
      state.bookDocs = docs;
      state.orderIds = docs.map(function (d) { return d.noteId || d.id; });
      state.selectedIds = {};

      if (savedCfg && Object.prototype.toString.call(savedCfg.selectedIds) === '[object Array]' && savedCfg.selectedIds.length) {
        var si;
        for (si = 0; si < savedCfg.selectedIds.length; si += 1) {
          state.selectedIds[savedCfg.selectedIds[si]] = true;
        }
      } else if (book) {
        var ms = selectManuscriptDocs(book, docs);
        var mi;
        for (mi = 0; mi < ms.length; mi += 1) {
          state.selectedIds[ms[mi].noteId || ms[mi].id] = true;
        }
      }
      previewIndex = 0;
    }

    function collectChapters() {
      var cfg = state.config;
      var list = [];
      if (cfg.scope === 'book' && state.bookDocs.length) {
        var byKey = Object.create(null), i, d, k;
        for (i = 0; i < state.bookDocs.length; i += 1) {
          d = state.bookDocs[i];
          byKey[d.noteId || d.id] = d;
        }
        for (i = 0; i < state.orderIds.length; i += 1) {
          k = state.orderIds[i];
          if (state.selectedIds[k] && byKey[k]) {
            list.push(byKey[k]);
          }
        }
      }
      if (!list.length) {
        list = [getLiveCurrentDoc()];
      }
      return list.map(function (item) {
        var copy = JSON.parse(JSON.stringify(item));
        var rawT = copy.title || '';
        copy.displayTitle = cfg.stripNumericPrefix ? stripNumericPrefix(rawT) : rawT;
        return copy;
      });
    }

    function setDynamicStyle(cssText) {
      var head = document.head || document.getElementsByTagName('head')[0];
      if (!head) { return; }
      var st = byId(DYNAMIC_STYLE_ID);
      if (!st) {
        st = document.createElement('style');
        st.id = DYNAMIC_STYLE_ID;
        head.appendChild(st);
      }
      st.textContent = cssText || '';
    }

    function applyToPrintSheet(customConfig, customChapters) {
      var sheet = byId('print-sheet');
      if (!sheet) { return false; }
      if (document.body && document.body.getAttribute('data-locked') === 'true') {
        clearPrintSheet();
        return false;
      }
      var cfg = customConfig || state.config;
      var chapters = customChapters || collectChapters();
      var html = renderPrintSheetHtml({ config: cfg, chapters: chapters });
      setDynamicStyle(buildPageCss(cfg));
      sheet.setAttribute('lang', 'pt-BR');
      sheet.setAttribute('data-print-studio', 'true');
      sheet.setAttribute('data-print-format', cfg.format);
      sheet.innerHTML = html;
      return true;
    }

    function clearPrintSheet() {
      var sheet = byId('print-sheet');
      if (sheet) {
        sheet.removeAttribute('data-print-studio');
        sheet.removeAttribute('data-print-format');
        sheet.innerHTML = '<h1 id="print-title"></h1><div id="print-text"></div>';
      }
      var st = byId(DYNAMIC_STYLE_ID);
      if (st) { st.textContent = ''; }
    }

    function prepareQuickPrint() {
      if (overlayEl && !overlayEl.hidden) {
        return applyToPrintSheet(state.config, collectChapters());
      }
      var book = getActiveBook();
      var cur = getLiveCurrentDoc();
      var cfg = loadSavedConfig(book);
      cfg.scope = 'current';
      cfg.bookTitle = cur.title || (book ? book.name : '');
      cfg.frontMatter = false;
      cfg.toc = false;
      cfg.colophon = false;
      var ch = JSON.parse(JSON.stringify(cur));
      ch.displayTitle = cfg.stripNumericPrefix ? stripNumericPrefix(ch.title || '') : (ch.title || '');
      return applyToPrintSheet(cfg, [ch]);
    }

    function buildPreviewSlides(chapters, est) {
      var cfg = state.config;
      var slides = [];
      var mainTitle = cfg.bookTitle || (chapters[0] && chapters[0].displayTitle) || 'Sem t\u00EDtulo';
      var isMulti = chapters.length > 1 || cfg.scope === 'book';
      if (cfg.frontMatter) {
        slides.push({
          label: 'Folha de rosto',
          isFront: true,
          pageNum: '',
          side: 'right',
          html: '<div class="ep-front ep-title-page">' +
            (cfg.authorName ? '<p class="ep-fp-author">' + escapeHtml(cfg.authorName) + '</p>' : '') +
            '<h1 class="ep-fp-title">' + escapeHtml(mainTitle) + '</h1>' +
            (cfg.bookSubtitle ? '<p class="ep-fp-subtitle">' + escapeHtml(cfg.bookSubtitle) + '</p>' : '') +
            '<div class="ep-fp-rule"></div>' +
            (cfg.presetId === 'original-editora' ? '<p class="ep-fp-meta">Original para avalia\u00E7\u00E3o editorial \u00B7 ' + est.totalWords.toLocaleString('pt-BR') + ' palavras</p>' : '') +
            '<p class="ep-fp-imprint">' + escapeHtml(cfg.editionNote || String(new Date().getFullYear())) + '</p></div>'
        });
        if (cfg.dedication && cfg.dedication.replace(/^\s+|\s+$/g, '')) {
          slides.push({
            label: 'Dedicat\u00F3ria / Ep\u00EDgrafe',
            isFront: true,
            pageNum: '',
            side: 'right',
            html: '<div class="ep-front ep-dedication"><p>' + escapeHtml(cfg.dedication) + '</p></div>'
          });
        }
      }
      if (cfg.toc && chapters.length > 1) {
        var tocItems = [], ti;
        for (ti = 0; ti < chapters.length; ti += 1) {
          var cm = est.chapters[ti] || { startPage: ti + 1 };
          tocItems.push('<li class="ep-toc-item"><span class="ep-toc-name">' + escapeHtml(chapters[ti].displayTitle || 'Sem t\u00EDtulo') + '</span><span class="ep-toc-dots"></span><span class="ep-toc-est">~' + cm.startPage + '</span></li>');
        }
        slides.push({
          label: 'Sum\u00E1rio',
          isFront: true,
          pageNum: '',
          side: 'right',
          html: '<div class="ep-front ep-toc"><h2 class="ep-toc-heading">Sum\u00E1rio</h2><ol class="ep-toc-list">' + tocItems.join('') + '</ol></div>'
        });
      }
      var ci;
      for (ci = 0; ci < chapters.length; ci += 1) {
        var ch = chapters[ci];
        var chEst = est.chapters[ci] || { startPage: ci + 1 };
        var bodyHtml = renderDocumentBodyHtml(ch, cfg, ch.displayTitle);
        slides.push({
          label: (chapters.length > 1 ? (ci + 1) + '. ' : '') + (ch.displayTitle || 'Folha'),
          isFront: false,
          isChapterOpen: true,
          pageNum: String(chEst.startPage),
          side: chEst.startPage % 2 === 0 ? 'left' : 'right',
          html: '<div class="ep-chapter ' + (isMulti ? 'ep-chapter-book' : 'ep-chapter-single') + '">' +
            (ch.displayTitle ? '<header class="ep-chapter-head">' + (isMulti && chapters.length > 1 ? '<span class="ep-chapter-num">' + (ci + 1) + '</span>' : '') + '<h1 class="ep-chapter-title">' + escapeHtml(ch.displayTitle) + '</h1></header>' : '') +
            '<div class="ep-chapter-body ' + (ch.format === 'rich' && ch.richHtml ? 'is-rich' : 'is-plain') + '">' + bodyHtml + '</div></div>'
        });
      }
      if (cfg.colophon) {
        var fmt = findFormat(cfg.format);
        slides.push({
          label: 'Colof\u00E3o',
          isFront: true,
          pageNum: '',
          side: 'left',
          html: '<div class="ep-colophon"><div class="ep-colophon-mark">\u2014 \u2766 \u2014</div><p><strong>' + escapeHtml(mainTitle) + '</strong>' + (cfg.authorName ? ' \u00B7 ' + escapeHtml(cfg.authorName) : '') + '</p><p>Composto em ' + (cfg.font === 'mono' ? 'Courier Prime' : 'Noto Serif') + ' ' + cfg.sizePt + ' pt \u00B7 ' + escapeHtml(fmt.name) + '.</p><p>Preparado no Escrevaral em ' + escapeHtml(formatDateLong()) + '.</p></div>'
        });
      }
      return slides;
    }

    function renderPreview() {
      var wrap = byId('esc-print-preview-wrap');
      var statsEl = byId('esc-print-stats');
      var navEl = byId('esc-print-preview-nav');
      if (!wrap || !statsEl || !navEl) { return; }

      var cfg = state.config;
      var chapters = collectChapters();
      var est = estimatePages(chapters, cfg);
      var fmt = findFormat(cfg.format);
      var m = est.margins;

      statsEl.textContent = fmt.name + ' (' + m.widthMm + '\u00D7' + m.heightMm + ' mm) \u00B7 Mancha ' +
        Math.round(m.contentWidthMm) + '\u00D7' + Math.round(m.contentHeightMm) + ' mm \u00B7 ~' +
        est.totalPages + (est.totalPages === 1 ? ' p\u00E1gina' : ' p\u00E1ginas') + ' \u00B7 ' +
        est.totalWords.toLocaleString('pt-BR') + ' palavras \u00B7 ' +
        chapters.length + (chapters.length === 1 ? ' texto' : ' textos');

      var slides = buildPreviewSlides(chapters, est);
      if (previewIndex >= slides.length) { previewIndex = Math.max(0, slides.length - 1); }
      var slide = slides[previewIndex] || { label: 'Folha', html: '', pageNum: '1', side: 'right', isFront: false };

      navEl.textContent = '';
      var prevB = mk('button', 'ep-prev-btn', '\u2190');
      prevB.type = 'button';
      prevB.disabled = previewIndex <= 0;
      prevB.setAttribute('aria-label', 'Folha anterior da pr\u00E9via');
      on(prevB, 'click', function () { if (previewIndex > 0) { previewIndex -= 1; renderPreview(); } });
      navEl.appendChild(prevB);

      var sel = mk('select', 'ep-slide-select');
      sel.setAttribute('aria-label', 'Ir para se\u00E7\u00E3o da pr\u00E9via');
      var si;
      for (si = 0; si < slides.length; si += 1) {
        var opt = mk('option', '', (si + 1) + '/' + slides.length + ' \u00B7 ' + slides[si].label);
        opt.value = String(si);
        if (si === previewIndex) { opt.selected = true; }
        sel.appendChild(opt);
      }
      on(sel, 'change', function () { previewIndex = Number(sel.value) || 0; renderPreview(); });
      navEl.appendChild(sel);

      var nextB = mk('button', 'ep-prev-btn', '\u2192');
      nextB.type = 'button';
      nextB.disabled = previewIndex >= slides.length - 1;
      nextB.setAttribute('aria-label', 'Pr\u00F3xima folha da pr\u00E9via');
      on(nextB, 'click', function () { if (previewIndex < slides.length - 1) { previewIndex += 1; renderPreview(); } });
      navEl.appendChild(nextB);

      var guideBtn = mk('button', 'ep-guide-toggle', cfg.showGuides ? 'Ocultar guias' : 'Ver margens e lombada');
      guideBtn.type = 'button';
      guideBtn.setAttribute('aria-pressed', cfg.showGuides ? 'true' : 'false');
      on(guideBtn, 'click', function () {
        cfg.showGuides = !cfg.showGuides;
        renderPreview();
      });
      navEl.appendChild(guideBtn);

      // Escala proporcional real da folha (mm -> px)
      var scale = Math.min(410 / m.widthMm, 540 / m.heightMm);
      var pageW = Math.round(m.widthMm * scale);
      var pageH = Math.round(m.heightMm * scale);
      var padTop = Math.round(m.topMm * scale);
      var padBot = Math.round(m.bottomMm * scale);
      var padLeft = Math.round((cfg.mirrorMargins && slide.side === 'left' ? m.outerMm : m.innerMm) * scale);
      var padRight = Math.round((cfg.mirrorMargins && slide.side === 'left' ? m.innerMm : m.outerMm) * scale);

      wrap.textContent = '';
      var stage = mk('div', 'ep-preview-page' + (cfg.showGuides ? ' has-guides' : '') + (cfg.indent ? ' is-indented' : '') + (cfg.mirrorMargins ? ' is-mirrored side-' + slide.side : ''));
      stage.setAttribute('lang', 'pt-BR');
      stage.style.width = pageW + 'px';
      stage.style.minHeight = pageH + 'px';
      stage.style.padding = padTop + 'px ' + padRight + 'px ' + padBot + 'px ' + padLeft + 'px';
      stage.style.fontFamily = cfg.font === 'mono' ? "'Courier Prime', 'Courier New', monospace" : "'Noto Serif', Georgia, serif";
      stage.style.fontSize = Math.max(8, Math.round(cfg.sizePt * 0.3528 * scale * 10) / 10) + 'px';
      stage.style.lineHeight = String(cfg.leading);
      stage.style.textAlign = cfg.align;
      stage.style.hyphens = cfg.hyphenate ? 'auto' : 'none';

      if (cfg.showGuides) {
        var guideBox = mk('div', 'ep-guide-box');
        guideBox.style.top = padTop + 'px';
        guideBox.style.right = padRight + 'px';
        guideBox.style.bottom = padBot + 'px';
        guideBox.style.left = padLeft + 'px';
        stage.appendChild(guideBox);

        var spineTag = mk('span', 'ep-spine-tag', (cfg.mirrorMargins ? (slide.side === 'left' ? 'Lombada \u2192' : '\u2190 Lombada') : 'Margem int. ') + ' ' + m.innerMm + 'mm');
        spineTag.className += slide.side === 'left' && cfg.mirrorMargins ? ' on-right' : ' on-left';
        stage.appendChild(spineTag);
      }

      // Cabeçalho corrente simulado (omitido em pré-textuais e abertura de capítulo)
      if (!slide.isFront && !slide.isChapterOpen && cfg.runningHead && cfg.pageNumPos !== 'top-outer') {
        var runH = mk('div', 'ep-preview-runhead', slide.side === 'left' ? (cfg.authorName || cfg.bookTitle) : cfg.bookTitle);
        stage.appendChild(runH);
      }

      var content = mk('div', 'ep-preview-content');
      content.innerHTML = slide.html;
      stage.appendChild(content);

      if (!slide.isFront && cfg.pageNumPos !== 'none' && slide.pageNum) {
        var folio = mk('span', 'ep-preview-folio pos-' + cfg.pageNumPos + ' side-' + slide.side, slide.pageNum);
        stage.appendChild(folio);
      }

      wrap.appendChild(stage);
    }

    function renderControls() {
      var body = byId('esc-print-controls');
      if (!body) { return; }
      body.textContent = '';

      var cfg = state.config;
      var book = getActiveBook();

      function addSelect(parent, labelTxt, val, options, onChange) {
        var lbl = mk('label', 'ep-field');
        lbl.appendChild(mk('span', 'ep-field-label', labelTxt));
        var s = mk('select');
        var i;
        for (i = 0; i < options.length; i += 1) {
          var o = mk('option', '', options[i].label);
          o.value = String(options[i].value);
          if (String(options[i].value) === String(val)) { o.selected = true; }
          s.appendChild(o);
        }
        on(s, 'change', function () { onChange(s.value); persistConfig(); renderPreview(); });
        lbl.appendChild(s);
        parent.appendChild(lbl);
      }

      function addCheck(parent, labelTxt, checked, hint, onChange) {
        var lbl = mk('label', 'ep-check');
        var cb = mk('input');
        cb.type = 'checkbox';
        cb.checked = !!checked;
        on(cb, 'change', function () { onChange(cb.checked); persistConfig(); renderPreview(); });
        lbl.appendChild(cb);
        var copy = mk('span', 'ep-check-copy');
        copy.appendChild(mk('strong', '', labelTxt));
        if (hint) { copy.appendChild(mk('small', '', hint)); }
        lbl.appendChild(copy);
        parent.appendChild(lbl);
      }

      function addInput(parent, labelTxt, val, ph, maxLen, onChange) {
        var lbl = mk('label', 'ep-field');
        lbl.appendChild(mk('span', 'ep-field-label', labelTxt));
        var inp = mk('input');
        inp.type = 'text';
        inp.value = val || '';
        inp.maxLength = maxLen || 140;
        if (ph) { inp.placeholder = ph; }
        on(inp, 'input', function () { onChange(inp.value); persistConfig(); renderPreview(); });
        lbl.appendChild(inp);
        parent.appendChild(lbl);
      }

      if (activeTab === 'escopo') {
        // 1. Perfil editorial rápido
        var presetOpts = Object.keys(PRESETS).map(function (k) { return { value: k, label: PRESETS[k].label }; });
        addSelect(body, 'Perfil editorial r\u00E1pido', cfg.presetId, presetOpts, function (pid) {
          var p = presetById(pid);
          var keepScope = cfg.scope;
          var keepMeta = { bookTitle: cfg.bookTitle, bookSubtitle: cfg.bookSubtitle, authorName: cfg.authorName, editionNote: cfg.editionNote, dedication: cfg.dedication, showGuides: cfg.showGuides };
          state.config = normalizeConfig(p, '');
          state.config.presetId = pid;
          state.config.scope = keepScope;
          state.config.bookTitle = keepMeta.bookTitle;
          state.config.bookSubtitle = keepMeta.bookSubtitle;
          state.config.authorName = keepMeta.authorName;
          state.config.editionNote = keepMeta.editionNote;
          state.config.dedication = keepMeta.dedication;
          state.config.showGuides = keepMeta.showGuides;
          renderControls();
        });

        // 2. Escopo: Folha aberta vs Caderno inteiro
        var scopeWrap = mk('div', 'ep-scope-row');
        scopeWrap.setAttribute('role', 'group');
        scopeWrap.setAttribute('aria-label', 'O que imprimir');
        var btnCur = mk('button', 'ep-seg-btn', 'Folha aberta');
        btnCur.type = 'button';
        btnCur.setAttribute('aria-pressed', cfg.scope === 'current' ? 'true' : 'false');
        on(btnCur, 'click', function () { cfg.scope = 'current'; previewIndex = 0; persistConfig(); renderControls(); renderPreview(); });
        scopeWrap.appendChild(btnCur);

        var btnBook = mk('button', 'ep-seg-btn', book ? 'Caderno inteiro (' + book.name + ')' : 'Caderno inteiro (sem projeto)');
        btnBook.type = 'button';
        btnBook.disabled = !book || !state.bookDocs.length;
        btnBook.setAttribute('aria-pressed', cfg.scope === 'book' ? 'true' : 'false');
        on(btnBook, 'click', function () { cfg.scope = 'book'; previewIndex = 0; persistConfig(); renderControls(); renderPreview(); });
        scopeWrap.appendChild(btnBook);
        body.appendChild(scopeWrap);

        if (cfg.scope === 'book' && book && state.bookDocs.length) {
          var chapBox = mk('div', 'ep-chapters-box');
          var chapHead = mk('div', 'ep-chapters-head');
          chapHead.appendChild(mk('span', 'ep-field-label', 'Ordem e sele\u00E7\u00E3o dos textos'));
          var chapBtns = mk('div', 'ep-chapters-quick');
          var bMs = mk('button', 'ep-mini-btn', 'S\u00F3 Manuscrito');
          bMs.type = 'button';
          on(bMs, 'click', function () {
            state.selectedIds = {};
            var ms = selectManuscriptDocs(book, state.bookDocs), i;
            for (i = 0; i < ms.length; i += 1) { state.selectedIds[ms[i].noteId || ms[i].id] = true; }
            persistConfig(); renderControls(); renderPreview();
          });
          var bAll = mk('button', 'ep-mini-btn', 'Todos');
          bAll.type = 'button';
          on(bAll, 'click', function () {
            var i;
            for (i = 0; i < state.bookDocs.length; i += 1) {
              if (state.bookDocs[i].category !== 'reference') {
                state.selectedIds[state.bookDocs[i].noteId || state.bookDocs[i].id] = true;
              }
            }
            persistConfig(); renderControls(); renderPreview();
          });
          chapBtns.appendChild(bMs);
          chapBtns.appendChild(bAll);
          chapHead.appendChild(chapBtns);
          chapBox.appendChild(chapHead);

          var byKey = Object.create(null), idx;
          for (idx = 0; idx < state.bookDocs.length; idx += 1) {
            byKey[state.bookDocs[idx].noteId || state.bookDocs[idx].id] = state.bookDocs[idx];
          }
          var ul = mk('ul', 'ep-chap-list');
          for (idx = 0; idx < state.orderIds.length; idx += 1) {
            (function (pos, key) {
              var docItem = byKey[key];
              if (!docItem) { return; }
              var li = mk('li', 'ep-chap-row');
              var cb = mk('input');
              cb.type = 'checkbox';
              cb.checked = !!state.selectedIds[key];
              on(cb, 'change', function () {
                state.selectedIds[key] = cb.checked;
                persistConfig(); renderPreview();
              });
              li.appendChild(cb);

              var info = mk('span', 'ep-chap-info');
              info.appendChild(mk('strong', '', docItem.title || 'Sem t\u00EDtulo'));
              var metaTxt = (docItem.folder ? docItem.folder + ' \u00B7 ' : '') + countWordsSimple(docItem.text || '') + ' pal.' + (docItem.category === 'reference' ? ' \u00B7 refer\u00EAncia' : '');
              info.appendChild(mk('small', '', metaTxt));
              li.appendChild(info);

              var mv = mk('span', 'ep-chap-move');
              var up = mk('button', 'ep-move-btn', '\u2191');
              up.type = 'button'; up.disabled = pos === 0; up.setAttribute('aria-label', 'Subir');
              on(up, 'click', function () {
                var tmp = state.orderIds[pos - 1]; state.orderIds[pos - 1] = state.orderIds[pos]; state.orderIds[pos] = tmp;
                persistConfig(); renderControls(); renderPreview();
              });
              var dn = mk('button', 'ep-move-btn', '\u2193');
              dn.type = 'button'; dn.disabled = pos === state.orderIds.length - 1; dn.setAttribute('aria-label', 'Descer');
              on(dn, 'click', function () {
                var tmp = state.orderIds[pos + 1]; state.orderIds[pos + 1] = state.orderIds[pos]; state.orderIds[pos] = tmp;
                persistConfig(); renderControls(); renderPreview();
              });
              mv.appendChild(up); mv.appendChild(dn);
              li.appendChild(mv);
              ul.appendChild(li);
            }(idx, state.orderIds[idx]));
          }
          chapBox.appendChild(ul);
          body.appendChild(chapBox);
        }

        addCheck(body, 'Omitir instru\u00E7\u00F5es de modelo (\u00AB \u2026 \u00BB)', cfg.stripPlaceholders, 'Oculta prompts n\u00E3o preenchidos apenas na impress\u00E3o (preserva aspas liter\u00E1rias).', function (v) { cfg.stripPlaceholders = v; });
        addCheck(body, 'Limpar prefixo num\u00E9rico dos t\u00EDtulos', cfg.stripNumericPrefix, 'Ex.: \u201C06. Cap\u00EDtulo 01\u201D sai como \u201CCap\u00EDtulo 01\u201D no livro.', function (v) { cfg.stripNumericPrefix = v; });
        addCheck(body, 'Evitar t\u00EDtulo duplicado na abertura', cfg.dedupeHeading, 'Se o texto j\u00E1 come\u00E7a com # T\u00EDtulo igual ao da folha, imprime uma \u00FAnica vez.', function (v) { cfg.dedupeHeading = v; });
      } else if (activeTab === 'formato') {
        var fmtOpts = FORMATS.map(function (f) { return { value: f.id, label: f.name + ' \u2014 ' + f.note }; });
        addSelect(body, 'Tamanho da p\u00E1gina (trim size)', cfg.format, fmtOpts, function (v) { cfg.format = v; });

        addCheck(body, 'Margens espelhadas (lombada / calha)', cfg.mirrorMargins, 'Alterna margem interna maior nas p\u00E1ginas pares e \u00EDmpares para encaderna\u00E7\u00E3o.', function (v) { cfg.mirrorMargins = v; renderControls(); });

        if (cfg.mirrorMargins) {
          addSelect(body, 'Acr\u00E9scimo de lombada (gutter)', cfg.gutterMm, [
            { value: 0, label: '0 mm (livreto / at\u00E9 100 p\u00E1g.)' },
            { value: 2, label: '+2 mm (livro 100\u2013250 p\u00E1g.)' },
            { value: 4, label: '+4 mm (livro 250\u2013400 p\u00E1g.)' },
            { value: 6, label: '+6 mm (volume grosso 400+ p\u00E1g.)' },
            { value: 8, label: '+8 mm (encaderna\u00E7\u00E3o capa dura)' }
          ], function (v) { cfg.gutterMm = clamp(v, 0, 12, 2); });
        }

        addCheck(body, 'Quebrar p\u00E1gina a cada cap\u00EDtulo', cfg.chapterBreak, 'Cada texto selecionado inicia em uma nova p\u00E1gina.', function (v) { cfg.chapterBreak = v; renderControls(); });
        if (cfg.chapterBreak) {
          addCheck(body, 'Abrir cap\u00EDtulos sempre em p\u00E1gina \u00EDmpar (frente)', cfg.chapterRecto, 'Padr\u00E3o de livro impresso (break-before: right).', function (v) { cfg.chapterRecto = v; });
        }
      } else if (activeTab === 'tipografia') {
        addSelect(body, 'Fam\u00EDlia tipogr\u00E1fica (embutida offline)', cfg.font, [
          { value: 'serif', label: 'Noto Serif \u2014 Liter\u00E1ria / Livro' },
          { value: 'mono', label: 'Courier Prime \u2014 Lauda / Roteiro / Editora' }
        ], function (v) { cfg.font = v; });

        addSelect(body, 'Tamanho da letra', cfg.sizePt, [
          { value: 9.5, label: '9,5 pt (Bolso / compacto)' },
          { value: 10, label: '10 pt (Livro denso)' },
          { value: 10.5, label: '10,5 pt (Livro padr\u00E3o)' },
          { value: 11, label: '11 pt (Editorial cl\u00E1ssico)' },
          { value: 11.5, label: '11,5 pt (Confort\u00E1vel)' },
          { value: 12, label: '12 pt (Lauda / ABNT / Roteiro)' },
          { value: 13, label: '13 pt (Letra ampliada)' },
          { value: 14, label: '14 pt (Leitura acess\u00EDvel)' }
        ], function (v) { cfg.sizePt = clamp(v, 9.5, 14, 11); });

        addSelect(body, 'Entrelinha', cfg.leading, [
          { value: 1.35, label: '1,35 (Roteiro / compacto)' },
          { value: 1.48, label: '1,48 (Miolo de livro)' },
          { value: 1.55, label: '1,55 (Editorial aberto)' },
          { value: 1.65, label: '1,65 (Poesia / confort\u00E1vel)' },
          { value: 1.8, label: '1,80 (Original para revis\u00E3o / editora)' },
          { value: 2, label: '2,00 (Espa\u00E7o duplo)' }
        ], function (v) { cfg.leading = clamp(v, 1.3, 2.0, 1.48); });

        addSelect(body, 'Alinhamento', cfg.align, [
          { value: 'justify', label: 'Justificado editorial (prosa / livro)' },
          { value: 'left', label: 'Alinhado \u00E0 esquerda (poesia / roteiro / lauda)' }
        ], function (v) { cfg.align = v; });

        addCheck(body, 'Hifeniza\u00E7\u00E3o autom\u00E1tica em portugu\u00EAs (pt-BR)', cfg.hyphenate, 'Evita buracos (\u201Crios\u201D) nas linhas justificadas.', function (v) { cfg.hyphenate = v; });
        addCheck(body, 'Recuo liter\u00E1rio de par\u00E1grafo (1,5 em)', cfg.indent, 'Recua a primeira linha sem espa\u00E7o extra entre par\u00E1grafos; mant\u00E9m o 1\u00BA par\u00E1grafo alinhado.', function (v) { cfg.indent = v; });
        addCheck(body, 'Capitular na abertura de cada cap\u00EDtulo', cfg.dropCap, 'Letra inicial ampliada no primeiro par\u00E1grafo longo.', function (v) { cfg.dropCap = v; });
      } else {
        addSelect(body, 'Numera\u00E7\u00E3o de p\u00E1ginas (f\u00F3lio)', cfg.pageNumPos, [
          { value: 'bottom-outer', label: 'Rodap\u00E9 externo (espelhado de livro)' },
          { value: 'bottom-center', label: 'Rodap\u00E9 centralizado' },
          { value: 'top-outer', label: 'Topo externo (lauda / roteiro)' },
          { value: 'none', label: 'Sem numera\u00E7\u00E3o' }
        ], function (v) { cfg.pageNumPos = v; });

        addCheck(body, 'Cabe\u00E7alho corrente', cfg.runningHead, 'Autor na p\u00E1gina par e t\u00EDtulo da obra na \u00EDmpar (suprimido nas aberturas).', function (v) { cfg.runningHead = v; renderControls(); });
        addCheck(body, 'Incluir folha de rosto', cfg.frontMatter, 'P\u00E1gina inicial limpa sem numera\u00E7\u00E3o.', function (v) { cfg.frontMatter = v; renderControls(); });

        if (cfg.frontMatter || cfg.runningHead || cfg.colophon) {
          addInput(body, 'T\u00EDtulo da obra (capa / cabe\u00E7alho)', cfg.bookTitle, 'T\u00EDtulo da obra', 140, function (v) { cfg.bookTitle = v; });
          addInput(body, 'Nome do autor (opcional)', cfg.authorName, 'Seu nome ou pseud\u00F4nimo', 120, function (v) { cfg.authorName = v; });
        }
        if (cfg.frontMatter) {
          addInput(body, 'Subt\u00EDtulo (opcional)', cfg.bookSubtitle, 'Ex.: Romance, Contos, 1\u00AA edi\u00E7\u00E3o\u2026', 180, function (v) { cfg.bookSubtitle = v; });
          addInput(body, 'Cidade / Selo / Ano (opcional)', cfg.editionNote, 'Ex.: S\u00E3o Paulo \u00B7 2026', 140, function (v) { cfg.editionNote = v; });

          var dLbl = mk('label', 'ep-field');
          dLbl.appendChild(mk('span', 'ep-field-label', 'Dedicat\u00F3ria ou ep\u00EDgrafe (opcional)'));
          var dTa = mk('textarea');
          dTa.rows = 3;
          dTa.maxLength = 400;
          dTa.placeholder = 'Se preenchida, ganha p\u00E1gina pr\u00F3pria ap\u00F3s a folha de rosto.';
          dTa.value = cfg.dedication || '';
          on(dTa, 'input', function () { cfg.dedication = dTa.value; persistConfig(); renderPreview(); });
          dLbl.appendChild(dTa);
          body.appendChild(dLbl);
        }

        addCheck(body, 'Incluir sum\u00E1rio autom\u00E1tico', cfg.toc, 'Dispon\u00EDvel quando h\u00E1 2 ou mais cap\u00EDtulos selecionados.', function (v) { cfg.toc = v; });
        addCheck(body, 'Incluir colof\u00E3o discreto ao final', cfg.colophon, 'Ficha t\u00E9cnica de encerramento com tipografia, formato e data.', function (v) { cfg.colophon = v; renderControls(); });
      }
    }

    function renderTabs() {
      var tabs = byId('esc-print-tabs');
      if (!tabs) { return; }
      var btns = tabs.querySelectorAll('[data-print-tab]');
      var i;
      for (i = 0; i < btns.length; i += 1) {
        var onTab = btns[i].getAttribute('data-print-tab') === activeTab;
        btns[i].setAttribute('aria-pressed', onTab ? 'true' : 'false');
      }
    }

    function buildOverlay() {
      if (overlayEl) { return overlayEl; }
      var sec = document.createElement('section');
      sec.id = 'esc-print-overlay';
      sec.className = 'esc-print-overlay';
      sec.setAttribute('role', 'dialog');
      sec.setAttribute('aria-modal', 'true');
      sec.setAttribute('aria-labelledby', 'esc-print-heading');
      sec.hidden = true;
      sec.innerHTML =
        '<div class="esc-print-card">' +
          '<header class="esc-print-head">' +
            '<div><span class="ep-eyebrow">ESCREVARAL \u00B7 DIAGRAMA\u00C7\u00C3O E IMPRESS\u00C3O</span><h2 id="esc-print-heading">Imprimir e paginar</h2></div>' +
            '<div class="ep-head-actions">' +
              '<button id="esc-print-html-btn" type="button" class="ep-btn-secondary" title="Baixar arquivo HTML paginado pronto para PDF, WeasyPrint ou LibreOffice">Baixar HTML paginado</button>' +
              '<button id="esc-print-go-btn" type="button" class="ep-btn-primary">Imprimir / Salvar PDF</button>' +
              '<button id="esc-print-close" type="button" class="ep-btn-close" aria-label="Fechar est\u00FAdio de impress\u00E3o">\u2190 Voltar</button>' +
            '</div>' +
          '</header>' +
          '<div class="esc-print-body">' +
            '<aside class="esc-print-sidebar">' +
              '<nav id="esc-print-tabs" class="ep-tabs" role="group" aria-label="Etapas de diagrama\u00E7\u00E3o">' +
                '<button type="button" data-print-tab="escopo" aria-pressed="true">1. Obra</button>' +
                '<button type="button" data-print-tab="formato" aria-pressed="false">2. Formato</button>' +
                '<button type="button" data-print-tab="tipografia" aria-pressed="false">3. Letra</button>' +
                '<button type="button" data-print-tab="paginacao" aria-pressed="false">4. Livro</button>' +
              '</nav>' +
              '<div id="esc-print-controls" class="ep-controls"></div>' +
            '</aside>' +
            '<section class="esc-print-preview-pane" aria-label="Pr\u00E9via paginada">' +
              '<div class="ep-preview-bar">' +
                '<p id="esc-print-stats" class="ep-stats" role="status"></p>' +
                '<div id="esc-print-preview-nav" class="ep-preview-nav"></div>' +
              '</div>' +
              '<div id="esc-print-preview-wrap" class="ep-preview-wrap"></div>' +
              '<p class="ep-pdf-tip">Dica profissional: na janela do navegador, escolha <strong>Salvar como PDF</strong>, margens <strong>Padr\u00E3o</strong> e desmarque <strong>Cabe\u00E7alhos e rodap\u00E9s</strong> do navegador para preservar exatamente as medidas acima.</p>' +
            '</section>' +
          '</div>' +
        '</div>';
      document.body.appendChild(sec);
      overlayEl = sec;

      on(byId('esc-print-close'), 'click', close);
      on(overlayEl, 'click', function (ev) { if (ev.target === overlayEl) { close(); } });
      on(overlayEl, 'keydown', function (ev) {
        if (ev.keyCode === 27) { ev.preventDefault(); ev.stopPropagation(); close(); }
      });

      var tabBtns = byId('esc-print-tabs').querySelectorAll('[data-print-tab]');
      var ti;
      for (ti = 0; ti < tabBtns.length; ti += 1) {
        (function (btn) {
          on(btn, 'click', function () {
            activeTab = btn.getAttribute('data-print-tab');
            renderTabs();
            renderControls();
          });
        }(tabBtns[ti]));
      }

      on(byId('esc-print-go-btn'), 'click', function () {
        if (opts.checkpoint) { opts.checkpoint(); }
        persistConfig();
        if (!applyToPrintSheet(state.config, collectChapters())) { return; }
        if (window.print) { window.print(); }
        else if (opts.message) { opts.message('Use a op\u00E7\u00E3o de impress\u00E3o do navegador.'); }
      });

      on(byId('esc-print-html-btn'), 'click', function () {
        if (opts.checkpoint) { opts.checkpoint(); }
        persistConfig();
        var chapters = collectChapters();
        var htmlDoc = buildStandaloneHtml({ config: state.config, chapters: chapters });
        var base = String(state.config.bookTitle || (chapters[0] && chapters[0].displayTitle) || 'edicao')
          .replace(/^\s+|\s+$/g, '')
          .replace(/[^A-Za-z0-9\u00C0-\u00FF_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 72) || 'edicao';
        if (opts.download) {
          opts.download(htmlDoc, 'text/html', base + '-' + state.config.format + '.html');
        }
      });

      return overlayEl;
    }

    function open(openOpts) {
      if (document.body && document.body.getAttribute('data-locked') === 'true') { return; }
      if (opts.checkpoint) { opts.checkpoint(); }
      buildOverlay();
      previousFocus = document.activeElement;
      activeTab = 'escopo';
      initForContext(openOpts && openOpts.scope ? openOpts.scope : null);
      renderTabs();
      renderControls();
      renderPreview();
      overlayEl.hidden = false;
      var goBtn = byId('esc-print-go-btn');
      if (goBtn && goBtn.focus) { goBtn.focus(); }
    }

    function close() {
      if (overlayEl) { overlayEl.hidden = true; }
      if (previousFocus && previousFocus.focus) { previousFocus.focus(); }
    }

    return {
      open: open,
      close: close,
      isOpen: function () { return !!(overlayEl && !overlayEl.hidden); },
      prepareQuickPrint: prepareQuickPrint,
      finishPrint: clearPrintSheet
    };
  };
}(typeof window !== 'undefined' ? window : this));
