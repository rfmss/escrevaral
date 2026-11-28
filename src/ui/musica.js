/* Oficina de Canção / Música (Blocos, Espelho de Cadência, Rimas Consoantes/Toantes/Internas, Tap Tempo, Cifra & Transposição) — ES5 */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var SHARP_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var FLAT_SCALE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  var NOTE_INDEX = {
    C: 0, 'B#': 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, Fb: 4,
    F: 5, 'E#': 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11, Cb: 11
  };
  var CHORD_TOKEN_RE = /^[A-G](#|b)?(?:m|maj|min|dim|aug|sus|add|M|°)?(?:[0-9]+(?:M|\+|°)?)*(?:(?:m|maj|min|dim|aug|sus|add)[0-9]*)*(?:(?:\(|\/)?[0-9#b+M-]+(?:\))?)*(?:\/[A-G](#|b)?)?$/;
  var INLINE_CHORD_RE = /\[([A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add|M|°)?(?:[0-9]+(?:M|\+|°)?)*(?:(?:m|maj|min|dim|aug|sus|add)[0-9]*)*(?:(?:\(|\/)?[0-9#b+M-]+(?:\))?)*(?:\/[A-G](?:#|b)?)?)\]/g;
  var SECTION_RE = /^\s*\[([^\]]+)\]\s*$/;

  function verso() { return root.Escr.versoCore || null; }

  function normalizeSongSettings(raw) {
    var p = raw && typeof raw === 'object' ? raw : {};
    var bpm = Number(p.bpm);
    if (!isFinite(bpm) || bpm < 40 || bpm > 200) { bpm = 92; }
    var meter = p.meter === '3/4' || p.meter === '2/4' || p.meter === '6/8' ? p.meter : '4/4';
    return {
      bpm: Math.round(bpm),
      meter: meter,
      showChords: !!p.showChords,
      internalRhymes: !!p.internalRhymes
    };
  }

  function isChordLine(line) {
    var trimmed = String(line || '').replace(/^\s+|\s+$/g, '');
    if (!trimmed || trimmed.indexOf('[') !== -1) { return false; }
    var tokens = trimmed.split(/\s+/);
    if (!tokens.length || tokens.length > 14) { return false; }
    var i, chordHits = 0;
    for (i = 0; i < tokens.length; i += 1) {
      if (tokens[i] === '|' || tokens[i] === '/' || tokens[i] === '-') { continue; }
      if (!CHORD_TOKEN_RE.test(tokens[i])) { return false; }
      chordHits += 1;
    }
    return chordHits > 0;
  }

  function stripInlineChords(line) {
    return String(line || '').replace(INLINE_CHORD_RE, '').replace(/\s{2,}/g, ' ').replace(/^\s+|\s+$/g, '');
  }

  function transposeNote(note, semitones, preferFlat) {
    if (!Object.prototype.hasOwnProperty.call(NOTE_INDEX, note)) { return note; }
    var idx = (NOTE_INDEX[note] + semitones) % 12;
    if (idx < 0) { idx += 12; }
    return (preferFlat ? FLAT_SCALE : SHARP_SCALE)[idx];
  }

  function transposeChord(chord, semitones) {
    if (!chord || !semitones) { return chord; }
    var m = /^([A-G](?:#|b)?)(.*?)(?:\/([A-G](?:#|b)?))?$/.exec(chord);
    if (!m) { return chord; }
    var preferFlat = (m[1].indexOf('b') !== -1) || semitones < 0;
    var rootN = transposeNote(m[1], semitones, preferFlat);
    var bass = m[3] ? ('/' + transposeNote(m[3], semitones, preferFlat)) : '';
    return rootN + (m[2] || '') + bass;
  }

  function transposeSongText(text, semitones) {
    if (!text || !semitones) { return text; }
    var lines = String(text).split(/\r?\n/);
    var out = [], i, line;
    for (i = 0; i < lines.length; i += 1) {
      line = lines[i];
      if (isChordLine(line)) {
        out.push(line.replace(/\S+/g, function (tok) {
          return CHORD_TOKEN_RE.test(tok) ? transposeChord(tok, semitones) : tok;
        }));
      } else if (line.indexOf('[') !== -1) {
        out.push(line.replace(INLINE_CHORD_RE, function (_, ch) {
          return '[' + transposeChord(ch, semitones) + ']';
        }));
      } else {
        out.push(line);
      }
    }
    return out.join('\n');
  }

  function classifySection(label) {
    var low = String(label || '').toLowerCase();
    if (low.indexOf('refr') !== -1 || low.indexOf('chorus') !== -1) { return 'chorus'; }
    if (low.indexOf('pré') !== -1 || low.indexOf('pre') !== -1) { return 'pre'; }
    if (low.indexOf('ponte') !== -1 || low.indexOf('bridge') !== -1) { return 'bridge'; }
    if (low.indexOf('intro') !== -1) { return 'intro'; }
    if (low.indexOf('final') !== -1 || low.indexOf('outro') !== -1 || low.indexOf('coda') !== -1) { return 'outro'; }
    if (low.indexOf('solo') !== -1) { return 'solo'; }
    return 'verse';
  }

  function shortSectionTag(label, kind, idx) {
    if (kind === 'chorus') { return '★ Refrão'; }
    if (kind === 'pre') { return 'Pré'; }
    if (kind === 'bridge') { return 'Ponte'; }
    if (kind === 'intro') { return 'Intro'; }
    if (kind === 'outro') { return 'Final'; }
    if (kind === 'solo') { return 'Solo'; }
    var m = /\d+/.exec(label);
    return 'E' + (m ? m[0] : (idx + 1));
  }

  function findInternalRhymesInLines(lines) {
    var poetry = root.Escr.poetry;
    if (!poetry || !lines.length) { return []; }
    var groups = {}, order = [], i, wi, w, r, key;
    for (i = 0; i < lines.length; i += 1) {
      if (!lines[i].reading || !lines[i].reading.words) { continue; }
      for (wi = 0; wi < lines[i].reading.words.length - 1; wi += 1) {
        w = lines[i].reading.words[wi].word;
        if (!w || w.length < 3) { continue; }
        r = poetry.wordReading(w);
        if (!r || !r.rhyme || r.rhyme.length < 2) { continue; }
        key = '$' + r.rhyme;
        if (!groups[key]) { groups[key] = []; order.push(key); }
        if (groups[key].indexOf(w) === -1) { groups[key].push(w); }
      }
    }
    var hits = [];
    for (i = 0; i < order.length; i += 1) {
      if (groups[order[i]].length >= 2) {
        hits.push(groups[order[i]].slice(0, 4));
      }
    }
    return hits.slice(0, 6);
  }

  function parseSong(rawText, activeLineIdx, settings) {
    var vc = verso();
    var poetry = root.Escr.poetry;
    var cfg = normalizeSongSettings(settings);
    var linesRaw = String(rawText || '').replace(/\r\n?/g, '\n').split('\n');
    var sections = [];
    var currentSec = null;
    var totalSungLines = 0;
    var chordLinesCount = 0;
    var i, trimmed, secMatch;

    function ensureDefaultSection(lineIdx) {
      if (!currentSec) {
        currentSec = {
          index: sections.length,
          label: 'Estrofe 1',
          kind: 'verse',
          shortTag: 'E1',
          startLine: lineIdx,
          endLine: lineIdx,
          lines: []
        };
        sections.push(currentSec);
      }
    }

    for (i = 0; i < linesRaw.length; i += 1) {
      trimmed = linesRaw[i].replace(/^\s+|\s+$/g, '');
      if (!trimmed) { continue; }
      secMatch = SECTION_RE.exec(trimmed);
      if (secMatch && !CHORD_TOKEN_RE.test(secMatch[1])) {
        var lbl = secMatch[1].replace(/^\s+|\s+$/g, '');
        var kind = classifySection(lbl);
        currentSec = {
          index: sections.length,
          label: lbl,
          kind: kind,
          shortTag: shortSectionTag(lbl, kind, sections.length),
          startLine: i,
          endLine: i,
          lines: []
        };
        sections.push(currentSec);
        continue;
      }
      if (isChordLine(trimmed)) {
        chordLinesCount += 1;
        if (currentSec) { currentSec.endLine = i; }
        continue;
      }
      var isPlaceholder = root.Escr.templates && root.Escr.templates.isPlaceholder(trimmed);
      if (trimmed.indexOf('#') === 0 && !sections.length) { continue; }
      ensureDefaultSection(i);
      currentSec.endLine = i;

      var cleanLine = stripInlineChords(trimmed);
      var hasInlineChords = cleanLine !== trimmed;
      if (hasInlineChords) { chordLinesCount += 1; }
      var scan = (!isPlaceholder && cleanLine) ? (vc ? vc.scanLine(cleanLine) : (poetry ? poetry.scan(cleanLine) : null)) : null;
      var scansion = scan && vc ? vc.buildSyllableCells(scan, null) : null;
      var count = scansion ? scansion.poeticCount : (scan ? scan.max : 0);
      if (!isPlaceholder && cleanLine) { totalSungLines += 1; }
      currentSec.lines.push({
        lineIndex: i,
        number: currentSec.lines.length + 1,
        raw: trimmed,
        text: cleanLine,
        placeholder: isPlaceholder,
        reading: scan,
        scansion: scansion,
        syllables: count,
        lastWord: scan && scan.words.length ? scan.words[scan.words.length - 1].word : ''
      });
    }

    /* Descobre a seção ativa pelo cursor */
    var activeSection = sections[0] || null;
    var activeLine = null;
    for (i = 0; i < sections.length; i += 1) {
      if (activeLineIdx >= sections[i].startLine) {
        activeSection = sections[i];
      }
    }
    if (activeSection) {
      for (i = 0; i < activeSection.lines.length; i += 1) {
        if (activeSection.lines[i].lineIndex === activeLineIdx) {
          activeLine = activeSection.lines[i];
          break;
        }
      }
      if (!activeLine && activeSection.lines.length) {
        for (i = activeSection.lines.length - 1; i >= 0; i -= 1) {
          if (activeSection.lines[i].lineIndex <= activeLineIdx) {
            activeLine = activeSection.lines[i];
            break;
          }
        }
        if (!activeLine) { activeLine = activeSection.lines[0]; }
      }
    }

    /* Espelho de cadência: compara seção atual com a primeira seção irmã do mesmo tipo (ex.: Estrofe 2 vs Estrofe 1) */
    var mirrorSource = null;
    var mirrorRows = [];
    if (activeSection) {
      for (i = 0; i < sections.length; i += 1) {
        if (sections[i] !== activeSection && sections[i].kind === activeSection.kind && sections[i].lines.some(function (l) { return !l.placeholder; })) {
          mirrorSource = sections[i];
          break;
        }
      }
      if (mirrorSource) {
        var maxLen = Math.max(mirrorSource.lines.length, activeSection.lines.length);
        for (i = 0; i < maxLen; i += 1) {
          var refL = mirrorSource.lines[i] || null;
          var curL = activeSection.lines[i] || null;
          var refC = refL && !refL.placeholder ? refL.syllables : 0;
          var curC = curL && !curL.placeholder ? curL.syllables : 0;
          var diff = (refC && curC) ? (curC - refC) : 0;
          var tone = (!refC || !curC) ? 'empty' : (Math.abs(diff) <= 1 ? 'ok' : 'off');
          mirrorRows.push({
            index: i + 1,
            refSyllables: refC,
            curSyllables: curC,
            diff: diff,
            tone: tone,
            refLine: refL,
            curLine: curL
          });
        }
      }
    }

    /* Rimas dentro da seção ativa (consoante ● e toante ◎) */
    var rhymePairs = [];
    if (activeSection && activeSection.lines.length >= 2) {
      var aLines = activeSection.lines;
      for (i = 0; i < aLines.length; i += 1) {
        if (aLines[i].placeholder || !aLines[i].reading) { continue; }
        for (var j = i + 1; j < aLines.length; j += 1) {
          if (aLines[j].placeholder || !aLines[j].reading) { continue; }
          var mk = vc ? vc.rhymeMatchKind(aLines[i].reading, aLines[j].reading) : 'none';
          if (mk !== 'none') {
            rhymePairs.push({
              aNum: aLines[i].number,
              aWord: aLines[i].lastWord,
              bNum: aLines[j].number,
              bWord: aLines[j].lastWord,
              kind: mk
            });
            break;
          }
        }
      }
    }

    /* Estimativa de duração cantada (cada linha cantada ~ 2 compassos médios no BPM atual) */
    var beatsPerBar = cfg.meter === '3/4' ? 3 : cfg.meter === '2/4' ? 2 : cfg.meter === '6/8' ? 6 : 4;
    var secPerLine = (beatsPerBar * 1.8 / cfg.bpm) * 60;
    var estSeconds = Math.round(totalSungLines * secPerLine);
    var estMin = Math.floor(estSeconds / 60);
    var estRem = estSeconds % 60;
    var estDuration = totalSungLines ? ('~' + estMin + 'm' + (estRem < 10 ? '0' : '') + estRem) : '0m00';

    var internalRhymes = (cfg.internalRhymes && activeSection) ? findInternalRhymesInLines(activeSection.lines) : [];

    return {
      sections: sections,
      activeSection: activeSection,
      activeLine: activeLine,
      mirrorSource: mirrorSource,
      mirrorRows: mirrorRows,
      rhymePairs: rhymePairs,
      internalRhymes: internalRhymes,
      totalSungLines: totalSungLines,
      hasChords: chordLinesCount > 0,
      estDuration: estDuration
    };
  }

  function isSongDoc(doc) {
    if (!doc || doc.trashed) { return false; }
    return doc.role === 'song' || doc.folder === '02 · Letra';
  }

  function cursorLineOf(el) {
    if (!el || typeof el.value !== 'string') { return 0; }
    var pos = typeof el.selectionStart === 'number' ? el.selectionStart : 0;
    return el.value.slice(0, pos).split(/\r?\n/).length - 1;
  }

  function byId(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el) { el.addEventListener(ev, fn, false); } }
  function createEl(tag, className, textValue) {
    var el = document.createElement(tag);
    if (className) { el.className = className; }
    if (typeof textValue === 'string') { el.textContent = textValue; }
    return el;
  }

  root.Escr.songCore = {
    normalizeSettings: normalizeSongSettings,
    isChordLine: isChordLine,
    stripInlineChords: stripInlineChords,
    transposeChord: transposeChord,
    transposeSongText: transposeSongText,
    parseSong: parseSong,
    isSongDoc: isSongDoc
  };

  root.Escr.mountSongAssistant = function (opts) {
    var container = byId(opts.containerId || 'esc-song-panel');
    var manuscript = opts.manuscriptEl;
    var activeDoc = null;
    var collapsed = false;
    var mobileSheetOpen = false;
    var composing = false;
    var lastCursorLine = -1;
    var rhymeQuery = '';
    var rhymeTab = 'consonant';
    var renderTimer = null;

    /* Pulso / Metrônomo silencioso por padrão + clique Web Audio opcional */
    var pulseRunning = false;
    var pulseSound = false;
    var pulseBeat = 0;
    var pulseTimer = null;
    var audioCtx = null;
    var tapTimes = [];

    function syncBodyFlag(active) {
      if (!document || !document.body) { return; }
      if (active) {
        document.body.setAttribute('data-esc-song-open', collapsed ? 'collapsed' : 'open');
        document.body.setAttribute('data-esc-verse-sheet', mobileSheetOpen ? 'open' : 'closed');
      } else {
        document.body.removeAttribute('data-esc-song-open');
        if (!document.body.getAttribute('data-esc-sonnet-open')) {
          document.body.removeAttribute('data-esc-verse-sheet');
        }
      }
    }

    function playClick(accent) {
      if (!pulseSound) { return; }
      try {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) { return; }
        if (!audioCtx) { audioCtx = new Ctx(); }
        if (audioCtx.state === 'suspended' && audioCtx.resume) { audioCtx.resume(); }
        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(accent ? 980 : 640, now);
        gain.gain.setValueAtTime(accent ? 0.14 : 0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } catch (ignore) {}
    }

    function stopPulse() {
      pulseRunning = false;
      window.clearInterval(pulseTimer);
      pulseTimer = null;
    }

    function updateBeatDots(totalBeats) {
      if (!container || !container.querySelectorAll) { return; }
      var dots = container.querySelectorAll('.esc-pulse-dot');
      for (var i = 0; i < dots.length; i += 1) {
        dots[i].setAttribute('data-active', (pulseRunning && i === pulseBeat) ? 'true' : 'false');
      }
    }

    function startPulse(settings) {
      stopPulse();
      pulseRunning = true;
      pulseBeat = 0;
      var totalBeats = settings.meter === '3/4' ? 3 : settings.meter === '2/4' ? 2 : settings.meter === '6/8' ? 6 : 4;
      var ms = Math.max(200, Math.round(60000 / settings.bpm));
      playClick(true);
      updateBeatDots(totalBeats);
      pulseTimer = window.setInterval(function () {
        if (!isSongDoc(activeDoc)) { stopPulse(); return; }
        pulseBeat = (pulseBeat + 1) % totalBeats;
        playClick(pulseBeat === 0);
        updateBeatDots(totalBeats);
      }, ms);
    }

    function saveSettings(next) {
      if (!activeDoc) { return; }
      activeDoc.songSettings = next;
      if (opts.onSaveSettings) { opts.onSaveSettings(next); }
      if (pulseRunning) { startPulse(next); }
      render();
    }

    function insertBlock(kindLabel) {
      if (!manuscript || manuscript.readOnly || manuscript.disabled) { return; }
      var text = manuscript.value || '';
      var label = kindLabel;
      if (kindLabel === 'Estrofe') {
        var matches = text.match(/\[Estrofe\s+\d+\]/gi);
        var nextNum = (matches ? matches.length : 0) + 1;
        label = 'Estrofe ' + nextNum;
      }
      var snippet = (text && !/\n\n$/.test(text) ? (/\n$/.test(text) ? '\n' : '\n\n') : '') + '[' + label + ']\n';
      var pos = typeof manuscript.selectionStart === 'number' ? manuscript.selectionStart : text.length;
      manuscript.value = text.slice(0, pos) + snippet + text.slice(pos);
      var newPos = pos + snippet.length;
      if (manuscript.focus) { manuscript.focus(); }
      if (manuscript.setSelectionRange) { manuscript.setSelectionRange(newPos, newPos); }
      try {
        if (typeof Event === 'function') { manuscript.dispatchEvent(new Event('input', { bubbles: true })); }
      } catch (ignore) {}
      schedule(20);
    }

    function applyTranspose(semitones) {
      if (!manuscript || manuscript.readOnly || manuscript.disabled) { return; }
      var nextVal = transposeSongText(manuscript.value || '', semitones);
      if (nextVal !== manuscript.value) {
        manuscript.value = nextVal;
        try {
          if (typeof Event === 'function') { manuscript.dispatchEvent(new Event('input', { bubbles: true })); }
        } catch (ignore) {}
        render();
      }
    }

    function handleTapTempo(settings) {
      var now = Date.now();
      if (tapTimes.length && now - tapTimes[tapTimes.length - 1] > 2200) { tapTimes = []; }
      tapTimes.push(now);
      if (tapTimes.length > 5) { tapTimes.shift(); }
      if (tapTimes.length >= 2) {
        var sum = 0, i;
        for (i = 1; i < tapTimes.length; i += 1) { sum += tapTimes[i] - tapTimes[i - 1]; }
        var avg = sum / (tapTimes.length - 1);
        var bpm = Math.max(40, Math.min(200, Math.round(60000 / avg)));
        saveSettings({ bpm: bpm, meter: settings.meter, showChords: settings.showChords, internalRhymes: settings.internalRhymes });
      }
    }

    function render() {
      if (!container) { return; }
      if (!isSongDoc(activeDoc)) {
        stopPulse();
        container.hidden = true;
        container.textContent = '';
        syncBodyFlag(false);
        return;
      }
      container.hidden = false;
      syncBodyFlag(true);

      var vc = verso();
      var settings = normalizeSongSettings(activeDoc.songSettings);
      var lineIdx = cursorLineOf(manuscript);
      lastCursorLine = lineIdx;
      var parsed = parseSong(manuscript ? manuscript.value : activeDoc.text, lineIdx, settings);
      var curSec = parsed.activeSection;
      var curLine = parsed.activeLine;

      container.textContent = '';
      var aside = createEl('aside', 'esc-sonnet esc-song-live');
      aside.setAttribute('aria-label', 'Oficina de Canção');

      /* 1. Faixa-HUD compacta mobile/tablet */
      var hud = createEl('div', 'esc-verse-hud');
      var hudInfo = createEl('div', 'esc-verse-hud-info');
      hudInfo.appendChild(createEl('span', 'esc-verse-hud-tag', curSec ? curSec.shortTag : 'Canção'));
      hudInfo.appendChild(createEl('span', 'esc-verse-hud-count is-ok', curLine && curLine.syllables ? (curLine.syllables + ' síl.') : parsed.estDuration));
      hudInfo.appendChild(createEl('span', 'esc-verse-hud-rhyme', '♩ ' + settings.bpm + ' · ' + settings.meter));
      hud.appendChild(hudInfo);
      var hudBtn = createEl('button', 'esc-verse-hud-btn', mobileSheetOpen ? 'Fechar ▴' : 'Música ▾');
      hudBtn.type = 'button';
      hudBtn.setAttribute('aria-expanded', mobileSheetOpen ? 'true' : 'false');
      on(hudBtn, 'click', function () { mobileSheetOpen = !mobileSheetOpen; syncBodyFlag(true); render(); });
      hud.appendChild(hudBtn);
      aside.appendChild(hud);

      /* 2. Cabeçalho desktop */
      var top = createEl('header', 'esc-sonnet-top');
      var headLeft = createEl('div', 'esc-sonnet-head-left');
      headLeft.appendChild(createEl('strong', '', 'Oficina de canção'));
      headLeft.appendChild(createEl('span', 'esc-sonnet-progress', parsed.estDuration + ' est. · ' + parsed.sections.length + (parsed.sections.length === 1 ? ' bloco' : ' blocos') + ' · ' + settings.bpm + ' BPM'));
      top.appendChild(headLeft);

      var headActs = createEl('div', 'esc-sonnet-head-actions');
      var chordBtn = createEl('button', 'esc-sonnet-chip-btn', settings.showChords ? 'Cifra ✓' : 'Cifra');
      chordBtn.type = 'button';
      chordBtn.setAttribute('aria-pressed', settings.showChords ? 'true' : 'false');
      on(chordBtn, 'click', function () {
        saveSettings({ bpm: settings.bpm, meter: settings.meter, showChords: !settings.showChords, internalRhymes: settings.internalRhymes });
      });
      headActs.appendChild(chordBtn);

      var toggleBtn = createEl('button', 'esc-sonnet-quiet', collapsed ? 'Abrir' : 'Recolher');
      toggleBtn.type = 'button';
      on(toggleBtn, 'click', function () { collapsed = !collapsed; syncBodyFlag(true); render(); });
      headActs.appendChild(toggleBtn);
      top.appendChild(headActs);
      aside.appendChild(top);

      if (collapsed) {
        container.appendChild(aside);
        return;
      }

      var body = createEl('div', 'esc-sonnet-body');

      /* 3. Inserir blocos estruturais em 1 clique */
      var blockBar = createEl('div', 'esc-song-blocks');
      ['Intro', 'Estrofe', 'Pré-refrão', 'Refrão', 'Ponte', 'Final'].forEach(function (lbl) {
        var b = createEl('button', 'esc-song-block-btn', '+ ' + lbl);
        b.type = 'button';
        on(b, 'click', function () { insertBlock(lbl); });
        blockBar.appendChild(b);
      });
      body.appendChild(blockBar);

      /* 4. Mapa visual da canção */
      if (parsed.sections.length) {
        var mapWrap = createEl('section', 'esc-song-map');
        mapWrap.appendChild(createEl('h3', '', 'Mapa da canção'));
        var strip = createEl('div', 'esc-song-map-strip');
        parsed.sections.forEach(function (sec) {
          var isCur = curSec === sec;
          var pill = createEl('button', 'esc-song-sec-pill is-kind-' + sec.kind + (isCur ? ' is-current' : ''), sec.shortTag);
          pill.type = 'button';
          pill.title = sec.label + ' (' + sec.lines.length + ' versos)';
          on(pill, 'click', function () {
            if (vc && manuscript) { vc.jumpToLine(manuscript, sec.startLine); }
            schedule(30);
          });
          strip.appendChild(pill);
        });
        mapWrap.appendChild(strip);
        body.appendChild(mapWrap);
      }

      /* 5. Espelho de Cadência (Estrofe 2 vs Estrofe 1) OU Escansão do verso ativo */
      var cadSec = createEl('section', 'esc-sonnet-score-card');
      if (parsed.mirrorSource && parsed.mirrorRows.length) {
        cadSec.appendChild(createEl('h3', '', 'Espelho de cadência · ' + curSec.label + ' vs ' + parsed.mirrorSource.label));
        parsed.mirrorRows.forEach(function (mr) {
          var isAct = !!(curLine && mr.curLine && curLine.lineIndex === mr.curLine.lineIndex);
          var rowEl = createEl('div', 'esc-mirror-row' + (isAct ? ' is-current' : ''));
          rowEl.appendChild(createEl('span', 'esc-map-num', 'v' + mr.index));
          rowEl.appendChild(createEl('span', 'esc-mirror-counts', (mr.refSyllables || '—') + ' ↔ ' + (mr.curSyllables || '—') + ' síl.'));
          var statusTxt = mr.tone === 'empty' ? '—' : (mr.tone === 'ok' ? 'OK ✓' : (mr.diff > 0 ? ('+' + mr.diff + ' longa') : (mr.diff + ' curta')));
          rowEl.appendChild(createEl('span', 'esc-sonnet-status-pill is-' + mr.tone, statusTxt));
          cadSec.appendChild(rowEl);
        });
      } else {
        cadSec.appendChild(createEl('h3', '', curSec ? ('Cadência · ' + curSec.label) : 'Cadência do verso'));
        if (curLine && !curLine.placeholder && curLine.scansion && curLine.scansion.cells.length) {
          var cellsWrap = createEl('div', 'esc-syl-strip');
          curLine.scansion.cells.forEach(function (cell) {
            var cEl = createEl('div', 'esc-syl-cell' + (cell.tonic ? ' is-tonic' : ''));
            cEl.appendChild(createEl('span', 'esc-syl-txt', cell.fused ? (cell.text + '◡' + cell.fusedText) : cell.text));
            cEl.appendChild(createEl('span', 'esc-syl-num', String(cell.index)));
            cellsWrap.appendChild(cEl);
          });
          cadSec.appendChild(cellsWrap);
          cadSec.appendChild(createEl('p', 'esc-sonnet-caption', curLine.syllables + ' sílabas cantadas. Adicione outra estrofe para comparar a melodia verso a verso.'));
        } else {
          cadSec.appendChild(createEl('p', 'esc-sonnet-prompt', 'Escreva um verso para medir sílabas cantadas e comparar estrofes.'));
        }
      }
      body.appendChild(cadSec);

      /* 6. Modo Cifra & Transposição (opcional) */
      if (settings.showChords || parsed.hasChords) {
        var chBox = createEl('section', 'esc-song-chords-box');
        var chHead = createEl('div', 'esc-rhyme-tray-head');
        chHead.appendChild(createEl('h3', '', 'Cifras e tom'));
        var trBtns = createEl('div', 'esc-rhyme-tabs');
        var downB = createEl('button', 'esc-rhyme-tab', '−½ tom');
        downB.type = 'button';
        on(downB, 'click', function () { applyTranspose(-1); });
        var upB = createEl('button', 'esc-rhyme-tab', '+½ tom');
        upB.type = 'button';
        on(upB, 'click', function () { applyTranspose(1); });
        trBtns.appendChild(downB);
        trBtns.appendChild(upB);
        chHead.appendChild(trBtns);
        chBox.appendChild(chHead);
        chBox.appendChild(createEl('p', 'esc-sonnet-caption', 'Use [Am7] antes da sílaba ou escreva uma linha só de acordes acima do verso. A contagem silábica ignora cifras automaticamente.'));
        body.appendChild(chBox);
      }

      /* 7. Rimas da Seção (Consoantes ●, Toantes ◎ e Rimas Internas) */
      var rSec = createEl('section', 'esc-sonnet-rhyme-tray');
      var targetWord = rhymeQuery || (curLine && curLine.lastWord ? curLine.lastWord : '');
      var rHead = createEl('div', 'esc-rhyme-tray-head');
      rHead.appendChild(createEl('h3', '', targetWord ? ('Rimas p/ “' + targetWord + '”') : 'Rimas musicais'));
      var rTabs = createEl('div', 'esc-rhyme-tabs');
      [['consonant', 'Consoantes'], ['assonant', 'Toantes']].forEach(function (pair) {
        var tb = createEl('button', 'esc-rhyme-tab', pair[1]);
        tb.type = 'button';
        tb.setAttribute('aria-pressed', rhymeTab === pair[0] ? 'true' : 'false');
        on(tb, 'click', function () { rhymeTab = pair[0]; render(); });
        rTabs.appendChild(tb);
      });
      rHead.appendChild(rTabs);
      rSec.appendChild(rHead);

      if (parsed.rhymePairs.length) {
        var pairsBox = createEl('div', 'esc-song-pairs');
        parsed.rhymePairs.slice(0, 6).forEach(function (rp) {
          pairsBox.appendChild(createEl('span', 'esc-song-pair-chip',
            (rp.kind === 'consonant' ? '● ' : '◎ ') + rp.aWord + ' ↔ ' + rp.bWord));
        });
        rSec.appendChild(pairsBox);
      }

      if (targetWord && vc) {
        var rData = vc.findRhymes(targetWord, 24);
        var list = rhymeTab === 'assonant' ? rData.assonant : rData.consonant;
        if (list.length) {
          var chips = createEl('div', 'esc-rhyme-chips');
          list.slice(0, 12).forEach(function (w) {
            var ch = createEl('button', 'esc-rhyme-chip', w);
            ch.type = 'button';
            on(ch, 'click', function () {
              if (manuscript && curLine) { vc.insertWordAtLineEnd(manuscript, curLine.lineIndex, w); }
            });
            chips.appendChild(ch);
          });
          rSec.appendChild(chips);
        } else {
          rSec.appendChild(createEl('p', 'esc-sonnet-caption', 'Sem sugestões ' + (rhymeTab === 'assonant' ? 'toantes' : 'consoantes') + ' para “' + targetWord + '”.'));
        }
      }

      var intRow = createEl('div', 'esc-song-int-row');
      var intBtn = createEl('button', 'esc-sonnet-quiet', settings.internalRhymes ? 'Rimas internas ✓' : 'Mostrar rimas internas');
      intBtn.type = 'button';
      on(intBtn, 'click', function () {
        saveSettings({ bpm: settings.bpm, meter: settings.meter, showChords: settings.showChords, internalRhymes: !settings.internalRhymes });
      });
      intRow.appendChild(intBtn);
      rSec.appendChild(intRow);
      if (settings.internalRhymes) {
        rSec.appendChild(createEl('p', 'esc-sonnet-caption', parsed.internalRhymes.length
          ? ('Ecos internos: ' + parsed.internalRhymes.map(function (g) { return g.join(' · '); }).join(' | '))
          : 'Nenhum eco interno repetido nesta seção ainda.'));
      }

      var qWrap = createEl('div', 'esc-sonnet-search');
      var qInput = createEl('input');
      qInput.type = 'search'; qInput.maxLength = 60; qInput.placeholder = 'Buscar rimas (ex.: saudade)…'; qInput.value = rhymeQuery;
      on(qInput, 'change', function () { rhymeQuery = qInput.value.replace(/^\s+|\s+$/g, ''); render(); });
      qWrap.appendChild(qInput);
      rSec.appendChild(qWrap);
      body.appendChild(rSec);

      /* 8. Pulso Visual Silencioso + Tap Tempo + Metrônomo Web Audio opcional */
      var pSec = createEl('section', 'esc-song-pulse');
      pSec.appendChild(createEl('h3', '', 'Pulso e andamento'));
      var totalBeats = settings.meter === '3/4' ? 3 : settings.meter === '2/4' ? 2 : settings.meter === '6/8' ? 6 : 4;
      var pulseRow = createEl('div', 'esc-pulse-row');
      var dotsWrap = createEl('div', 'esc-pulse-dots');
      for (var bi = 0; bi < totalBeats; bi += 1) {
        var dot = createEl('span', 'esc-pulse-dot' + (bi === 0 ? ' is-downbeat' : ''));
        dot.setAttribute('data-active', (pulseRunning && bi === pulseBeat) ? 'true' : 'false');
        dotsWrap.appendChild(dot);
      }
      pulseRow.appendChild(dotsWrap);

      var bpmCtrl = createEl('div', 'esc-bpm-ctrl');
      var minusB = createEl('button', 'esc-rhyme-tab', '−');
      minusB.type = 'button';
      on(minusB, 'click', function () {
        saveSettings({ bpm: Math.max(40, settings.bpm - 4), meter: settings.meter, showChords: settings.showChords, internalRhymes: settings.internalRhymes });
      });
      var bpmLbl = createEl('strong', 'esc-bpm-val', settings.bpm + ' BPM');
      var plusB = createEl('button', 'esc-rhyme-tab', '+');
      plusB.type = 'button';
      on(plusB, 'click', function () {
        saveSettings({ bpm: Math.min(200, settings.bpm + 4), meter: settings.meter, showChords: settings.showChords, internalRhymes: settings.internalRhymes });
      });
      bpmCtrl.appendChild(minusB);
      bpmCtrl.appendChild(bpmLbl);
      bpmCtrl.appendChild(plusB);
      pulseRow.appendChild(bpmCtrl);
      pSec.appendChild(pulseRow);

      var pActs = createEl('div', 'esc-pulse-actions');
      var playBtn = createEl('button', 'esc-sonnet-chip-btn', pulseRunning ? 'Parar pulso' : 'Iniciar pulso');
      playBtn.type = 'button';
      playBtn.setAttribute('aria-pressed', pulseRunning ? 'true' : 'false');
      on(playBtn, 'click', function () {
        if (pulseRunning) { stopPulse(); } else { startPulse(settings); }
        render();
      });
      var tapBtn = createEl('button', 'esc-sonnet-chip-btn', 'Marcar (Tap)');
      tapBtn.type = 'button';
      on(tapBtn, 'click', function () { handleTapTempo(settings); });
      var sndBtn = createEl('button', 'esc-sonnet-chip-btn', pulseSound ? '🔊 Som' : '🔇 Visual');
      sndBtn.type = 'button';
      sndBtn.setAttribute('aria-pressed', pulseSound ? 'true' : 'false');
      on(sndBtn, 'click', function () { pulseSound = !pulseSound; render(); });

      var meterSel = createEl('select', 'esc-meter-sel');
      meterSel.setAttribute('aria-label', 'Compasso');
      ['4/4', '3/4', '2/4', '6/8'].forEach(function (mt) {
        var o = createEl('option', '', mt); o.value = mt;
        if (settings.meter === mt) { o.selected = true; }
        meterSel.appendChild(o);
      });
      on(meterSel, 'change', function () {
        saveSettings({ bpm: settings.bpm, meter: meterSel.value, showChords: settings.showChords, internalRhymes: settings.internalRhymes });
      });

      pActs.appendChild(playBtn);
      pActs.appendChild(tapBtn);
      pActs.appendChild(sndBtn);
      pActs.appendChild(meterSel);
      pSec.appendChild(pActs);
      body.appendChild(pSec);

      aside.appendChild(body);
      container.appendChild(aside);
    }

    function schedule(delay) {
      if (composing) { return; }
      window.clearTimeout(renderTimer);
      renderTimer = window.setTimeout(render, typeof delay === 'number' ? delay : 85);
    }

    if (manuscript) {
      on(manuscript, 'compositionstart', function () { composing = true; });
      on(manuscript, 'compositionend', function () { composing = false; schedule(40); });
      on(manuscript, 'input', function () { if (isSongDoc(activeDoc)) { schedule(85); } });
      on(manuscript, 'keyup', function () {
        if (!isSongDoc(activeDoc)) { return; }
        var cur = cursorLineOf(manuscript);
        if (cur !== lastCursorLine) { schedule(60); }
      });
      on(manuscript, 'mouseup', function () {
        if (!isSongDoc(activeDoc)) { return; }
        var cur = cursorLineOf(manuscript);
        if (cur !== lastCursorLine) { schedule(50); }
      });
    }

    return {
      sync: function (doc) {
        activeDoc = doc || null;
        if (!isSongDoc(activeDoc)) { stopPulse(); }
        lastCursorLine = -1;
        rhymeQuery = '';
        mobileSheetOpen = false;
        render();
      },
      refresh: render,
      schedule: function () { if (isSongDoc(activeDoc)) { schedule(85); } },
      isSongDoc: isSongDoc,
      stopPulse: stopPulse
    };
  };
}(typeof window !== 'undefined' ? window : this));
