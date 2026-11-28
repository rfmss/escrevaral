/* Núcleo compartilhado de escansão ao vivo, sinalefas, ritmos e rimas (consoantes + toantes) — ES5 */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var SCAN_CACHE = {};
  var SCAN_KEYS = [];
  var SCAN_CAP = 512;

  var rhymeIndex = null;
  var assonanceIndex = null;

  var VOWEL_START = /^[hH]?[aáàâãeéêiíoóôõuúüyY]/;
  var VOWEL_END = /[aáàâãeéêiíoóôõuúüyY]$/;

  function scanLineCached(line) {
    var poetry = root.Escr.poetry;
    if (!poetry || typeof line !== 'string') { return null; }
    var trimmed = line.replace(/^\s+|\s+$/g, '');
    if (!trimmed) { return null; }
    var key = '$' + trimmed;
    if (Object.prototype.hasOwnProperty.call(SCAN_CACHE, key)) {
      return SCAN_CACHE[key];
    }
    var res = poetry.scan(trimmed);
    SCAN_CACHE[key] = res;
    SCAN_KEYS.push(key);
    if (SCAN_KEYS.length > SCAN_CAP) {
      var old = SCAN_KEYS.shift();
      delete SCAN_CACHE[old];
    }
    return res;
  }

  function ensureRhymeIndexes() {
    if (rhymeIndex && assonanceIndex) { return; }
    rhymeIndex = {};
    assonanceIndex = {};
    var lex = root.Escr.portiLexicon;
    var poetry = root.Escr.poetry;
    if (!lex || !lex.entries || !poetry) { return; }
    var keys = Object.keys(lex.entries);
    var i, w, r, rk, ak;
    for (i = 0; i < keys.length; i += 1) {
      w = keys[i];
      if (w.length < 2 || w.length > 24) { continue; }
      r = poetry.wordReading(w);
      if (!r) { continue; }
      if (r.rhyme) {
        rk = '$' + r.rhyme;
        if (!rhymeIndex[rk]) { rhymeIndex[rk] = []; }
        rhymeIndex[rk].push(w);
      }
      if (r.assonance) {
        ak = '$' + r.assonance;
        if (!assonanceIndex[ak]) { assonanceIndex[ak] = []; }
        assonanceIndex[ak].push(w);
      }
    }
  }

  function cleanWord(word) {
    return String(word || '').replace(/^[^a-záàâãéêíóôõúüç]+|[^a-záàâãéêíóôõúüç]+$/gi, '').toLowerCase();
  }

  function findRhymes(word, limit) {
    var poetry = root.Escr.poetry;
    var cap = limit || 30;
    if (!poetry || !word) { return { consonant: [], assonant: [] }; }
    var clean = cleanWord(word);
    if (!clean) { return { consonant: [], assonant: [] }; }
    var r = poetry.wordReading(clean);
    if (!r) { return { consonant: [], assonant: [] }; }
    ensureRhymeIndexes();

    var cons = [], consSeen = {}, i, w;
    if (r.rhyme) {
      var cList = rhymeIndex['$' + r.rhyme] || [];
      for (i = 0; i < cList.length && cons.length < cap; i += 1) {
        w = cList[i];
        if (w !== clean && !consSeen['$' + w]) {
          consSeen['$' + w] = true;
          cons.push(w);
        }
      }
    }

    var asso = [];
    if (r.assonance) {
      var aList = assonanceIndex['$' + r.assonance] || [];
      for (i = 0; i < aList.length && asso.length < cap; i += 1) {
        w = aList[i];
        if (w !== clean && !consSeen['$' + w]) {
          asso.push(w);
        }
      }
    }
    return { consonant: cons, assonant: asso };
  }

  function rhymeMatchKind(readingA, readingB) {
    if (!readingA || !readingB) { return 'none'; }
    if (readingA.rhyme && readingB.rhyme && readingA.rhyme === readingB.rhyme) { return 'consonant'; }
    if (readingA.assonance && readingB.assonance && readingA.assonance === readingB.assonance) { return 'assonant'; }
    return 'none';
  }

  /* Constrói células silábicas numeradas (1..N) com tônicas, pós-tônicas e ligaduras de elisão clicáveis */
  function buildSyllableCells(scan, elisionOverrides) {
    if (!scan || !scan.words || !scan.words.length) {
      return { cells: [], postTonic: [], poeticCount: 0, tonicPositions: [], elisionCount: 0 };
    }
    var overrides = elisionOverrides && typeof elisionOverrides === 'object' ? elisionOverrides : {};
    var raw = [];
    var postTonic = [];
    var wi, si, wObj, isLastWord;

    for (wi = 0; wi < scan.words.length; wi += 1) {
      wObj = scan.words[wi];
      isLastWord = wi === scan.words.length - 1;
      for (si = 0; si < wObj.syllables.length; si += 1) {
        var syl = wObj.syllables[si];
        if (isLastWord && si > wObj.tonic) {
          postTonic.push(syl);
          continue;
        }
        var isWordLast = si === wObj.syllables.length - 1;
        var nextWord = wi + 1 < scan.words.length ? scan.words[wi + 1] : null;
        var canElide = isWordLast && !!nextWord &&
          VOWEL_END.test(syl) &&
          VOWEL_START.test(nextWord.syllables[0] || '') &&
          !(si === wObj.tonic && wObj.syllables.length === 1 && !/^(e|o|a|ou|ao|que|de|se|me|te|lhe|no|na)$/i.test(wObj.word));
        raw.push({
          text: syl,
          tonic: si === wObj.tonic,
          wordIndex: wi,
          wordEnd: isWordLast,
          canElide: canElide,
          elisionKey: canElide ? (wi + ':' + si) : ''
        });
      }
    }

    var cells = [];
    var tonicPositions = [];
    var elisionCount = 0;
    var i = 0;
    while (i < raw.length) {
      var cur = raw[i];
      var next = raw[i + 1];
      if (cur.canElide && next) {
        elisionCount += 1;
        /* Por padrão funde sinalefa (como a leitura métrica clássica), mas respeita escolha do poeta */
        var fused = overrides[cur.elisionKey] !== false;
        if (fused) {
          var posF = cells.length + 1;
          var isTonF = cur.tonic || next.tonic;
          if (isTonF) { tonicPositions.push(posF); }
          cells.push({
            index: posF,
            text: cur.text,
            fusedText: next.text,
            tonic: isTonF,
            elisionKey: cur.elisionKey,
            fused: true,
            canToggleElision: true
          });
          i += 2;
          continue;
        }
        var posS = cells.length + 1;
        if (cur.tonic) { tonicPositions.push(posS); }
        cells.push({
          index: posS,
          text: cur.text,
          fusedText: '',
          tonic: cur.tonic,
          elisionKey: cur.elisionKey,
          fused: false,
          canToggleElision: true
        });
        i += 1;
        continue;
      }
      var pos = cells.length + 1;
      if (cur.tonic) { tonicPositions.push(pos); }
      cells.push({
        index: pos,
        text: cur.text,
        fusedText: '',
        tonic: cur.tonic,
        elisionKey: '',
        fused: false,
        canToggleElision: false
      });
      i += 1;
    }

    return {
      cells: cells,
      postTonic: postTonic,
      poeticCount: cells.length,
      tonicPositions: tonicPositions,
      elisionCount: elisionCount
    };
  }

  function expectedSupports(rhythm, target) {
    if (rhythm === 'heroic') { return [6, 10]; }
    if (rhythm === 'sapphic') { return [4, 8, 10]; }
    if (rhythm === 'alexandrine') { return [6, 12]; }
    return target ? [target] : [];
  }

  function jumpToLine(textarea, lineIndex) {
    if (!textarea || typeof textarea.value !== 'string') { return; }
    var lines = textarea.value.split(/\r?\n/);
    var pos = 0, i;
    var idx = Math.max(0, Math.min(lines.length - 1, lineIndex || 0));
    for (i = 0; i < idx; i += 1) {
      pos += lines[i].length + 1;
    }
    var endPos = pos + (lines[idx] ? lines[idx].length : 0);
    if (textarea.focus) { textarea.focus(); }
    if (textarea.setSelectionRange) {
      textarea.setSelectionRange(endPos, endPos);
    }
  }

  function insertWordAtLineEnd(textarea, lineIndex, word) {
    if (!textarea || textarea.readOnly || textarea.disabled || typeof textarea.value !== 'string' || !word) { return false; }
    var lines = textarea.value.split(/\r?\n/);
    var idx = Math.max(0, Math.min(lines.length - 1, lineIndex || 0));
    var cur = lines[idx] || '';
    var needsSpace = cur.length > 0 && !/\s$/.test(cur);
    lines[idx] = cur + (needsSpace ? ' ' : '') + word;
    var nextVal = lines.join('\n');
    textarea.value = nextVal;
    jumpToLine(textarea, idx);
    try {
      if (typeof Event === 'function') {
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch (ignore) {}
    return true;
  }

  root.Escr.versoCore = {
    scanLine: scanLineCached,
    findRhymes: findRhymes,
    rhymeMatchKind: rhymeMatchKind,
    buildSyllableCells: buildSyllableCells,
    expectedSupports: expectedSupports,
    jumpToLine: jumpToLine,
    insertWordAtLineEnd: insertWordAtLineEnd,
    cleanWord: cleanWord
  };
}(typeof window !== 'undefined' ? window : this));
