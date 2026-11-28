/* Cartório do Escrevaral: SHA-256 puro ES5, cadeia encadeada de criação e verificação de pacotes .scrvrl. */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};
  var E = root.Escr;

  var ZERO_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
  var MAX_TRAIL = 200;
  var HEX_64 = /^[0-9a-f]{64}$/;

  /* ── SHA-256 puro ES5 (FIPS 180-4) sobre bytes UTF-8 ── */
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function utf8Bytes(input) {
    var str = String(input === undefined || input === null ? '' : input);
    var out = [], i, len = str.length, c, c2, cp;
    for (i = 0; i < len; i += 1) {
      c = str.charCodeAt(i);
      if (c < 0x80) {
        out.push(c);
      } else if (c < 0x800) {
        out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      } else if ((c & 0xfc00) === 0xd800 && i + 1 < len && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
        c2 = str.charCodeAt(i + 1);
        i += 1;
        cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
        out.push(
          0xf0 | (cp >> 18),
          0x80 | ((cp >> 12) & 0x3f),
          0x80 | ((cp >> 6) & 0x3f),
          0x80 | (cp & 0x3f)
        );
      } else {
        out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      }
    }
    return out;
  }

  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  function sha256(str) {
    var bytes = utf8Bytes(str);
    var bitLen = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) { bytes.push(0); }
    var hi = Math.floor(bitLen / 0x100000000);
    var lo = bitLen >>> 0;
    bytes.push((hi >>> 24) & 0xff, (hi >>> 16) & 0xff, (hi >>> 8) & 0xff, hi & 0xff);
    bytes.push((lo >>> 24) & 0xff, (lo >>> 16) & 0xff, (lo >>> 8) & 0xff, lo & 0xff);

    var h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    var h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    var w = new Array(64);
    var i, j, a, b, c, d, e, f, g, h, s0, s1, ch, maj, t1, t2;

    for (i = 0; i < bytes.length; i += 64) {
      for (j = 0; j < 16; j += 1) {
        w[j] = ((bytes[i + j * 4] << 24) |
          (bytes[i + j * 4 + 1] << 16) |
          (bytes[i + j * 4 + 2] << 8) |
          (bytes[i + j * 4 + 3])) >>> 0;
      }
      for (j = 16; j < 64; j += 1) {
        s0 = (rotr(w[j - 15], 7) ^ rotr(w[j - 15], 18) ^ (w[j - 15] >>> 3)) >>> 0;
        s1 = (rotr(w[j - 2], 17) ^ rotr(w[j - 2], 19) ^ (w[j - 2] >>> 10)) >>> 0;
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
      }
      a = h0; b = h1; c = h2; d = h3; e = h4; f = h5; g = h6; h = h7;
      for (j = 0; j < 64; j += 1) {
        s1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
        ch = ((e & f) ^ ((~e) & g)) >>> 0;
        t1 = (h + s1 + ch + K[j] + w[j]) >>> 0;
        s0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
        maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
        t2 = (s0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
    }

    var words = [h0, h1, h2, h3, h4, h5, h6, h7], hex = '';
    for (i = 0; i < 8; i += 1) {
      var part = words[i].toString(16);
      while (part.length < 8) { part = '0' + part; }
      hex += part;
    }
    return hex;
  }

  function isArray(v) { return Object.prototype.toString.call(v) === '[object Array]'; }
  function isNonNegInt(v) { return typeof v === 'number' && isFinite(v) && v >= 0 && v % 1 === 0; }
  function isIsoDate(v) { return typeof v === 'string' && v.length > 0 && isFinite(Date.parse(v)); }

  function canonical(value) {
    if (value === null || typeof value !== 'object') {
      return JSON.stringify(value);
    }
    if (isArray(value)) {
      var arrParts = [], i;
      for (i = 0; i < value.length; i += 1) {
        arrParts.push(value[i] === undefined ? 'null' : canonical(value[i]));
      }
      return '[' + arrParts.join(',') + ']';
    }
    var keys = Object.keys(value).sort(), objParts = [], k, v;
    for (i = 0; i < keys.length; i += 1) {
      k = keys[i];
      v = value[k];
      if (v === undefined) { continue; }
      objParts.push(JSON.stringify(k) + ':' + canonical(v));
    }
    return '{' + objParts.join(',') + '}';
  }

  function countWords(text) {
    if (E.countManuscript) { return E.countManuscript(text || '').words || 0; }
    var m = String(text || '').match(/[A-Za-zÀ-ÿ0-9]+/g);
    return m ? m.length : 0;
  }

  function contentHash(doc) {
    return sha256(String((doc && doc.title) || '') + '\n' + String((doc && doc.text) || ''));
  }

  function computeLinkHash(prevHash, doc, ledger) {
    return sha256(canonical({
      v: 1,
      prev: prevHash,
      rev: doc.revision,
      title: doc.title || '',
      text: doc.text || '',
      origin: ledger.origin,
      keys: ledger.keystrokes,
      extPastes: ledger.externalPastes,
      extChars: ledger.externalPasteChars,
      intPastes: ledger.internalPastes,
      blockedPastes: ledger.blockedPastes
    }));
  }

  /* ── Buffer transitório de telemetria antes da gravação ── */
  var pendingSignals = Object.create(null);

  function docKey(doc) {
    if (!doc) { return ''; }
    return String(doc.noteId || doc.id || '');
  }

  function ensurePending(key) {
    if (!pendingSignals[key]) {
      pendingSignals[key] = { keys: 0, extPastes: 0, extChars: 0, intPastes: 0, blockedPastes: 0 };
    }
    return pendingSignals[key];
  }

  function recordSignal(doc, kind, amount) {
    var key = docKey(doc);
    if (!key) { return; }
    var p = ensurePending(key);
    var n = typeof amount === 'number' && isFinite(amount) && amount > 0 ? Math.floor(amount) : 1;
    if (kind === 'key') { p.keys += n; }
    else if (kind === 'extPaste') { p.extPastes += 1; p.extChars += n; }
    else if (kind === 'intPaste') { p.intPastes += 1; }
    else if (kind === 'blockedPaste') { p.blockedPastes += n; }
  }

  function peekPending(doc) {
    var key = docKey(doc);
    return key && pendingSignals[key] ? pendingSignals[key] : { keys: 0, extPastes: 0, extChars: 0, intPastes: 0, blockedPastes: 0 };
  }

  function consumePending(doc) {
    var key = docKey(doc);
    if (!key || !pendingSignals[key]) {
      return { keys: 0, extPastes: 0, extChars: 0, intPastes: 0, blockedPastes: 0 };
    }
    var out = pendingSignals[key];
    delete pendingSignals[key];
    return out;
  }

  function validTrailEntry(item) {
    return !!item && typeof item === 'object' && !isArray(item) &&
      isNonNegInt(item.rev) &&
      typeof item.prev === 'string' && HEX_64.test(item.prev) &&
      typeof item.hash === 'string' && HEX_64.test(item.hash) &&
      isNonNegInt(item.len) &&
      isNonNegInt(item.words) &&
      isNonNegInt(item.keys) &&
      isNonNegInt(item.extPastes) &&
      isNonNegInt(item.extChars) &&
      isIsoDate(item.at);
  }

  function validDocLedger(ledger) {
    if (!ledger || typeof ledger !== 'object' || isArray(ledger)) { return false; }
    if (ledger.version !== 1) { return false; }
    if (ledger.origin !== 'escrevaral' && ledger.origin !== 'imported') { return false; }
    if (typeof ledger.headHash !== 'string' || !HEX_64.test(ledger.headHash)) { return false; }
    if (!isNonNegInt(ledger.chainLength) || !isNonNegInt(ledger.keystrokes) ||
        !isNonNegInt(ledger.externalPastes) || !isNonNegInt(ledger.externalPasteChars) ||
        !isNonNegInt(ledger.internalPastes) || !isNonNegInt(ledger.blockedPastes) ||
        !isNonNegInt(ledger.sessions)) { return false; }
    if (!isIsoDate(ledger.createdAt) || !isIsoDate(ledger.lastSealedAt)) { return false; }
    if (!isArray(ledger.trail) || ledger.trail.length > MAX_TRAIL) { return false; }
    for (var i = 0; i < ledger.trail.length; i += 1) {
      if (!validTrailEntry(ledger.trail[i])) { return false; }
    }
    return true;
  }

  function validPackageSeal(seal) {
    return !!seal && typeof seal === 'object' && !isArray(seal) &&
      seal.version === 1 &&
      seal.algorithm === 'SHA-256' &&
      typeof seal.packageHash === 'string' && HEX_64.test(seal.packageHash) &&
      isNonNegInt(seal.sealedDocuments) &&
      isNonNegInt(seal.totalDocuments);
  }

  function sealDocument(previousDoc, nextDoc, originHint, previewOnly) {
    var base = (previousDoc && validDocLedger(previousDoc.cartorio)) ? JSON.parse(JSON.stringify(previousDoc.cartorio)) :
      (nextDoc && validDocLedger(nextDoc.cartorio)) ? JSON.parse(JSON.stringify(nextDoc.cartorio)) : null;
    var delta = previewOnly ? peekPending(nextDoc) : consumePending(nextDoc);
    var now = nextDoc.updated || new Date().toISOString();
    var origin = base ? base.origin : (originHint === 'imported' ? 'imported' : 'escrevaral');
    var prevHash = base ? base.headHash : ZERO_HASH;

    var ledger = base ? base : {
      version: 1,
      origin: origin,
      headHash: ZERO_HASH,
      chainLength: 0,
      keystrokes: 0,
      externalPastes: 0,
      externalPasteChars: 0,
      internalPastes: 0,
      blockedPastes: 0,
      sessions: 0,
      createdAt: nextDoc.created || now,
      lastSealedAt: now,
      trail: []
    };

    ledger.keystrokes += delta.keys;
    ledger.externalPastes += delta.extPastes;
    ledger.externalPasteChars += delta.extChars;
    ledger.internalPastes += delta.intPastes;
    ledger.blockedPastes += delta.blockedPastes;
    ledger.sessions += 1;
    ledger.lastSealedAt = now;

    var hash = computeLinkHash(prevHash, nextDoc, ledger);
    ledger.headHash = hash;
    ledger.chainLength += 1;
    ledger.trail.push({
      rev: nextDoc.revision,
      prev: prevHash,
      hash: hash,
      len: String(nextDoc.text || '').length,
      words: countWords(nextDoc.text || ''),
      keys: ledger.keystrokes,
      extPastes: ledger.externalPastes,
      extChars: ledger.externalPasteChars,
      at: now
    });
    while (ledger.trail.length > MAX_TRAIL) {
      ledger.trail.shift();
    }
    return ledger;
  }

  function packageBodyForHash(payload) {
    var body = {
      format: payload.format,
      version: payload.version,
      scope: payload.scope,
      notebooks: payload.notebooks,
      documents: payload.documents,
      globals: payload.globals,
      inventory: payload.inventory
    };
    if (typeof payload.originals !== 'undefined') {
      body.originals = payload.originals;
    }
    return body;
  }

  function sealPackage(payload) {
    var docs = isArray(payload && payload.documents) ? payload.documents : [];
    var sealed = 0, total = 0, i;
    for (i = 0; i < docs.length; i += 1) {
      if (docs[i] && docs[i].kind === 'reminder') { continue; }
      total += 1;
      if (validDocLedger(docs[i] && docs[i].cartorio)) { sealed += 1; }
    }
    return {
      version: 1,
      algorithm: 'SHA-256',
      packageHash: sha256(canonical(packageBodyForHash(payload))),
      sealedDocuments: sealed,
      totalDocuments: total
    };
  }

  function verifyDocument(doc) {
    var words = countWords(doc && doc.text);
    var chars = String((doc && doc.text) || '').length;
    var cHash = contentHash(doc);
    var base = {
      id: (doc && (doc.noteId || doc.id)) || '',
      title: (doc && doc.title) || 'Sem título',
      project: (doc && doc.project) || 'Textos avulsos',
      revision: (doc && typeof doc.revision === 'number') ? doc.revision : 0,
      words: words,
      chars: chars,
      contentHash: cHash,
      createdAt: (doc && (doc.created || doc.updated)) || '',
      updatedAt: (doc && doc.updated) || '',
      lineageEntries: (doc && doc.lineage && isArray(doc.lineage.entries)) ? doc.lineage.entries.length : 0
    };

    if (!doc || typeof doc.cartorio === 'undefined') {
      base.status = 'unsealed';
      base.label = 'Sem selo do Cartório';
      base.detail = 'Documento criado antes do selo do Cartório ou ainda não gravado.';
      base.origin = 'unknown';
      base.headHash = '';
      base.chainLength = 0;
      base.keystrokes = 0;
      base.externalPastes = 0;
      base.externalPasteChars = 0;
      base.internalPastes = 0;
      base.blockedPastes = 0;
      base.trail = [];
      return base;
    }

    if (!validDocLedger(doc.cartorio)) {
      base.status = 'tampered';
      base.label = 'Registro adulterado ou inválido';
      base.detail = 'A estrutura criptográfica do Cartório neste documento está corrompida.';
      base.origin = 'unknown';
      base.headHash = '';
      base.chainLength = 0;
      base.keystrokes = 0;
      base.externalPastes = 0;
      base.externalPasteChars = 0;
      base.internalPastes = 0;
      base.blockedPastes = 0;
      base.trail = [];
      return base;
    }

    var ledger = doc.cartorio;
    base.origin = ledger.origin;
    base.headHash = ledger.headHash;
    base.chainLength = ledger.chainLength;
    base.keystrokes = ledger.keystrokes;
    base.externalPastes = ledger.externalPastes;
    base.externalPasteChars = ledger.externalPasteChars;
    base.internalPastes = ledger.internalPastes;
    base.blockedPastes = ledger.blockedPastes;
    base.createdAt = ledger.createdAt;
    base.updatedAt = ledger.lastSealedAt;
    base.trail = ledger.trail.slice();

    var trail = ledger.trail;
    if (!trail.length) {
      base.status = 'tampered';
      base.label = 'Cadeia incompleta';
      base.detail = 'O registro declara selo, mas a trilha encadeada está vazia.';
      return base;
    }

    var i;
    for (i = 1; i < trail.length; i += 1) {
      if (trail[i].prev !== trail[i - 1].hash) {
        base.status = 'tampered';
        base.label = 'Quebra na cadeia de hashes';
        base.detail = 'A revisão ' + trail[i].rev + ' não encadeia com o hash da revisão anterior.';
        return base;
      }
    }

    var last = trail[trail.length - 1];
    if (last.hash !== ledger.headHash || last.rev !== doc.revision) {
      base.status = 'tampered';
      base.label = 'Revisão divergente do selo';
      base.detail = 'A última revisão da trilha não confere com a cabeça do selo ou com a revisão atual do documento.';
      return base;
    }

    var expectedHead = computeLinkHash(last.prev, doc, ledger);
    if (expectedHead !== ledger.headHash) {
      base.status = 'tampered';
      base.label = 'Conteúdo alterado fora do selo';
      base.detail = 'O texto, título ou contadores de processo foram modificados depois que o Escrevaral selou este documento.';
      return base;
    }

    if (ledger.origin === 'imported') {
      base.status = 'verified_imported';
      base.label = 'Cadeia íntegra · Origem importada';
      base.detail = 'O arquivo manteve integridade após a entrada, mas o texto original entrou por importação externa.';
      return base;
    }

    if (ledger.externalPastes > 0 || ledger.externalPasteChars > 0) {
      base.status = 'verified_with_paste';
      base.label = 'Cadeia íntegra · Com colagem externa';
      base.detail = 'A cadeia está íntegra, mas houve ' + ledger.externalPastes + ' colagem(ns) externa(s) (' + ledger.externalPasteChars + ' caracteres) durante a escrita.';
      return base;
    }

    base.status = 'verified_clean';
    base.label = 'Cadeia íntegra · Construído no Escrevaral';
    base.detail = 'Texto, título e histórico conferem com o selo criptográfico, com zero colagens externas registradas.';
    return base;
  }

  function verifyPackage(rawOrObject) {
    var payload;
    if (typeof rawOrObject === 'string') {
      try { payload = JSON.parse(rawOrObject); }
      catch (e) { throw new Error('O arquivo não contém JSON válido do Escrevaral (.scrvrl).'); }
    } else {
      payload = rawOrObject;
    }

    if (!payload || typeof payload !== 'object') {
      throw new Error('Pacote vazio ou ilegível.');
    }

    var isDeskPack = payload.format === 'escrevaral-cadernos' && isArray(payload.documents);
    var isLegacyPack = payload.format === 'escrevaral-astra' && isArray(payload.documents);
    if (!isDeskPack && !isLegacyPack) {
      throw new Error('Formato não reconhecido. Envie uma cópia exportada pelo Escrevaral (.scrvrl ou .json).');
    }

    var packageIntegrity = 'unsealed';
    var storedPackageHash = '';
    var computedPackageHash = isDeskPack ? sealPackage(payload).packageHash : sha256(canonical(payload));

    if (isDeskPack && typeof payload.cartorio !== 'undefined') {
      if (!validPackageSeal(payload.cartorio)) {
        packageIntegrity = 'tampered';
      } else {
        storedPackageHash = payload.cartorio.packageHash;
        packageIntegrity = (storedPackageHash === computedPackageHash) ? 'intact' : 'tampered';
      }
    }

    var reports = [];
    var totals = {
      documents: 0,
      clean: 0,
      withPaste: 0,
      imported: 0,
      tampered: 0,
      unsealed: 0,
      words: 0,
      revisions: 0,
      keystrokes: 0,
      externalPastes: 0,
      externalPasteChars: 0,
      internalPastes: 0,
      blockedPastes: 0,
      earliestAt: '',
      latestAt: ''
    };

    var i, doc, r;
    for (i = 0; i < payload.documents.length; i += 1) {
      doc = payload.documents[i];
      if (!doc || doc.kind === 'reminder') { continue; }
      r = verifyDocument(doc);
      reports.push(r);
      totals.documents += 1;
      totals.words += r.words;
      totals.revisions += r.chainLength || r.revision || 0;
      totals.keystrokes += r.keystrokes;
      totals.externalPastes += r.externalPastes;
      totals.externalPasteChars += r.externalPasteChars;
      totals.internalPastes += r.internalPastes;
      totals.blockedPastes += r.blockedPastes;

      if (r.status === 'verified_clean') { totals.clean += 1; }
      else if (r.status === 'verified_with_paste') { totals.withPaste += 1; }
      else if (r.status === 'verified_imported') { totals.imported += 1; }
      else if (r.status === 'tampered') { totals.tampered += 1; }
      else { totals.unsealed += 1; }

      if (r.createdAt && (!totals.earliestAt || r.createdAt < totals.earliestAt)) { totals.earliestAt = r.createdAt; }
      if (r.updatedAt && (!totals.latestAt || r.updatedAt > totals.latestAt)) { totals.latestAt = r.updatedAt; }
    }

    var verdict, verdictTitle, verdictSummary;
    if (packageIntegrity === 'tampered' || totals.tampered > 0) {
      verdict = 'adulterado';
      verdictTitle = 'Adulteração detectada na verificação';
      verdictSummary = packageIntegrity === 'tampered'
        ? 'O selo criptográfico do arquivo não confere com o conteúdo atual. O pacote foi alterado depois de exportado.'
        : (totals.tampered + ' documento(s) apresentam divergência entre o texto e o selo criptográfico.');
    } else if (totals.documents === 0) {
      verdict = 'vazio';
      verdictTitle = 'Pacote íntegro sem manuscritos';
      verdictSummary = 'O arquivo está estruturalmente íntegro, mas não contém folhas de texto.';
    } else if (totals.unsealed === totals.documents) {
      verdict = 'legado_sem_selo';
      verdictTitle = 'Arquivo anterior ao Cartório (sem selo encadeado)';
      verdictSummary = 'Os textos foram lidos normalmente, mas foram exportados antes da ativação do Cartório. A impressão digital SHA-256 atual foi calculada abaixo.';
    } else if (totals.withPaste > 0 || totals.imported > 0 || totals.unsealed > 0) {
      verdict = 'integro_com_ressalvas';
      verdictTitle = 'Pacote íntegro · Com ressalvas de origem registradas';
      verdictSummary = 'Nenhuma adulteração pós-exportação foi detectada. Confira no livro de folhas abaixo os registros de colagem externa, importação ou folhas sem selo.';
    } else {
      verdict = 'integro_sem_colagem';
      verdictTitle = 'Certificado íntegro · Construído no Escrevaral sem colagem externa';
      verdictSummary = 'Todos os manuscritos deste pacote apresentam cadeia criptográfica íntegra, origem nativa na oficina e zero colagens externas registradas.';
    }

    return {
      verifiedAt: new Date().toISOString(),
      scope: payload.scope || 'all',
      notebooksCount: isArray(payload.notebooks) ? payload.notebooks.length : 0,
      packageIntegrity: packageIntegrity,
      packageHash: computedPackageHash,
      storedPackageHash: storedPackageHash,
      verdict: verdict,
      verdictTitle: verdictTitle,
      verdictSummary: verdictSummary,
      totals: totals,
      documents: reports
    };
  }

  function formatDateBr(iso) {
    if (!iso) { return '—'; }
    try { return new Date(iso).toLocaleString('pt-BR'); }
    catch (e) { return iso; }
  }

  function formatCertificateText(report, fileName) {
    var lines = [];
    lines.push('====================================================================');
    lines.push('CARTÓRIO DO ESCREVARAL — CERTIFICADO DE ORIGEM E PROCESSO DE ESCRITA');
    lines.push('====================================================================');
    if (fileName) { lines.push('Arquivo analisado: ' + fileName); }
    lines.push('Verificado em (relógio local): ' + formatDateBr(report.verifiedAt));
    lines.push('Veredito: ' + report.verdictTitle);
    lines.push('Resumo: ' + report.verdictSummary);
    lines.push('--------------------------------------------------------------------');
    lines.push('Impressão digital do pacote (SHA-256): ' + report.packageHash);
    lines.push('Integridade do pacote: ' + (report.packageIntegrity === 'intact' ? 'ÍNTEGRO' : report.packageIntegrity === 'tampered' ? 'ADULTERADO' : 'SEM SELO DE PACOTE'));
    lines.push('Folhas analisadas: ' + report.totals.documents + ' | Palavras: ' + report.totals.words);
    lines.push('Revisões encadeadas: ' + report.totals.revisions + ' | Toques registrados: ' + report.totals.keystrokes);
    lines.push('Colagens externas: ' + report.totals.externalPastes + ' (' + report.totals.externalPasteChars + ' caracteres) | Bloqueadas: ' + report.totals.blockedPastes);
    lines.push('Período registrado no aparelho: ' + formatDateBr(report.totals.earliestAt) + ' até ' + formatDateBr(report.totals.latestAt));
    lines.push('--------------------------------------------------------------------');
    lines.push('LIVRO DE FOLHAS:');
    var i, d;
    for (i = 0; i < report.documents.length; i += 1) {
      d = report.documents[i];
      lines.push((i + 1) + '. ' + d.title + ' [' + d.project + ']');
      lines.push('   Estado: ' + d.label);
      lines.push('   Palavras: ' + d.words + ' | Revisões: ' + (d.chainLength || d.revision) + ' | Toques: ' + d.keystrokes + ' | Colagens externas: ' + d.externalPastes);
      lines.push('   SHA-256 do texto: ' + d.contentHash);
      if (d.headHash) { lines.push('   SHA-256 da cadeia: ' + d.headHash); }
    }
    lines.push('--------------------------------------------------------------------');
    lines.push('ESCOPO E TRANSPARÊNCIA:');
    lines.push('Camada 1 (offline): comprova integridade criptográfica do pacote e da');
    lines.push('cadeia de criação registrada dentro do Escrevaral, incluindo a ausência');
    lines.push('ou ocorrência de colagens externas.');
    lines.push('Camada 2 (limites jurídicos e anterioridade externa): datas locais');
    lines.push('dependem do relógio do aparelho. Este certificado técnico NÃO substitui');
    lines.push('registro na Biblioteca Nacional, ata notarial nem carimbo de tempo');
    lines.push('oficial (ICP-Brasil). Use o SHA-256 acima para ancoragem oficial.');
    return lines.join('\n');
  }

  E.cartorio = {
    ZERO_HASH: ZERO_HASH,
    sha256: sha256,
    canonical: canonical,
    contentHash: contentHash,
    recordSignal: recordSignal,
    peekPending: peekPending,
    validDocLedger: validDocLedger,
    validPackageSeal: validPackageSeal,
    sealDocument: sealDocument,
    sealPackage: sealPackage,
    verifyDocument: verifyDocument,
    verifyPackage: verifyPackage,
    formatCertificateText: formatCertificateText
  };
}(typeof window !== 'undefined' ? window : this));
