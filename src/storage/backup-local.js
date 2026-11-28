/* Saúde da cópia de segurança e espelho opcional em pasta local (File System Access API).
 * ES5 estrito, 100% offline, progressivo e sem alterar o manuscrito. */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var LEGACY_KEY = 'escrevaral.backup.last.v1';
  var META_KEY = 'escrevaral.backup.meta.v1';
  var IDB_NAME = 'escrevaral-local-folder';
  var IDB_STORE = 'handles';
  var IDB_KEY = 'primary';

  var DAY_MS = 86400000;
  var WARN_DAYS = 7;
  var OVERDUE_DAYS = 14;
  var FIRST_REMINDER_WORDS = 250;
  var DELTA_REMINDER_WORDS = 1000;
  var OVERDUE_DELTA_WORDS = 2500;

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function localDateKey(dateObj) {
    var d = dateObj instanceof Date && !isNaN(dateObj.getTime()) ? dateObj : new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function dailyFilename(dateObj) {
    return 'escrevaral-' + localDateKey(dateObj) + '.scrvrl';
  }

  function formatTimestamp(isoStr) {
    if (!isoStr) { return ''; }
    var dt = new Date(isoStr);
    if (isNaN(dt.getTime())) { return String(isoStr); }
    try {
      return dt.toLocaleDateString('pt-BR') + ' \u00E0s ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (ignore) {
      return dt.getDate() + '/' + pad2(dt.getMonth() + 1) + '/' + dt.getFullYear() + ' ' + pad2(dt.getHours()) + ':' + pad2(dt.getMinutes());
    }
  }

  function emptyMeta() {
    return {
      lastBackupAt: '',
      lastBackupWords: 0,
      folderName: '',
      folderSyncedAt: '',
      folderSyncedWords: 0,
      folderDailyDate: ''
    };
  }

  function readMeta(storage) {
    var m = emptyMeta();
    if (!storage) { return m; }
    try {
      var raw = storage.getItem(META_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (typeof parsed.lastBackupAt === 'string') { m.lastBackupAt = parsed.lastBackupAt; }
          if (typeof parsed.lastBackupWords === 'number' && isFinite(parsed.lastBackupWords)) { m.lastBackupWords = Math.max(0, parsed.lastBackupWords); }
          if (typeof parsed.folderName === 'string') { m.folderName = parsed.folderName; }
          if (typeof parsed.folderSyncedAt === 'string') { m.folderSyncedAt = parsed.folderSyncedAt; }
          if (typeof parsed.folderSyncedWords === 'number' && isFinite(parsed.folderSyncedWords)) { m.folderSyncedWords = Math.max(0, parsed.folderSyncedWords); }
          if (typeof parsed.folderDailyDate === 'string') { m.folderDailyDate = parsed.folderDailyDate; }
        }
      }
      if (!m.lastBackupAt) {
        var legacy = storage.getItem(LEGACY_KEY);
        if (legacy) { m.lastBackupAt = String(legacy); }
      }
    } catch (ignore) {}
    return m;
  }

  function writeMeta(storage, patch) {
    var cur = readMeta(storage);
    var k;
    if (patch && typeof patch === 'object') {
      for (k in patch) {
        if (Object.prototype.hasOwnProperty.call(patch, k)) {
          cur[k] = patch[k];
        }
      }
    }
    if (storage) {
      try {
        storage.setItem(META_KEY, JSON.stringify(cur));
        if (cur.lastBackupAt) {
          storage.setItem(LEGACY_KEY, cur.lastBackupAt);
        }
      } catch (ignore) {}
    }
    return cur;
  }

  function recordExport(storage, totalWords, nowDate) {
    var d = nowDate instanceof Date && !isNaN(nowDate.getTime()) ? nowDate : new Date();
    var w = Math.max(0, Number(totalWords) || 0);
    return writeMeta(storage, {
      lastBackupAt: d.toISOString(),
      lastBackupWords: w
    });
  }

  function evaluateHealth(meta, totalWords, folderState, nowMs) {
    var m = meta || emptyMeta();
    var words = Math.max(0, Number(totalWords) || 0);
    var now = typeof nowMs === 'number' && isFinite(nowMs) ? nowMs : Date.now();
    var fState = folderState || 'disconnected';

    var manualTs = m.lastBackupAt ? Date.parse(m.lastBackupAt) : NaN;
    var folderTs = m.folderSyncedAt ? Date.parse(m.folderSyncedAt) : NaN;
    var hasManual = !isNaN(manualTs);
    var hasFolderSync = !isNaN(folderTs);

    /* Considera a salvaguarda mais recente entre cópia manual e pasta local */
    var bestTs = NaN;
    var bestWords = 0;
    if (hasManual && hasFolderSync) {
      if (folderTs >= manualTs) {
        bestTs = folderTs;
        bestWords = m.folderSyncedWords || 0;
      } else {
        bestTs = manualTs;
        bestWords = m.lastBackupWords || 0;
      }
    } else if (hasFolderSync) {
      bestTs = folderTs;
      bestWords = m.folderSyncedWords || 0;
    } else if (hasManual) {
      bestTs = manualTs;
      bestWords = m.lastBackupWords || 0;
    }

    var daysSince = isNaN(bestTs) ? null : Math.max(0, Math.floor((now - bestTs) / DAY_MS));
    var wordsDelta = isNaN(bestTs) ? words : Math.max(0, words - bestWords);
    var hasFolder = !!(m.folderName && (fState === 'connected' || fState === 'needs-permission'));

    if (fState === 'connected' && m.folderName) {
      return {
        level: 'synced',
        pillLabel: 'Pasta \u00B7 em dia',
        title: 'Espelho autom\u00E1tico ativo na pasta \u201C' + m.folderName + '\u201D' + (m.folderSyncedAt ? ' (\u00FAltimo espelho: ' + formatTimestamp(m.folderSyncedAt) + ').' : '.'),
        shouldRemind: false,
        reminderMessage: '',
        daysSinceBackup: daysSince,
        wordsDelta: wordsDelta,
        hasFolder: true,
        folderNeedsPermission: false
      };
    }

    if (fState === 'needs-permission' && m.folderName) {
      var needWarn = (daysSince !== null && daysSince >= WARN_DAYS) || wordsDelta >= DELTA_REMINDER_WORDS;
      return {
        level: needWarn ? 'gentle' : 'ok',
        pillLabel: 'Pasta \u00B7 reconectar',
        title: 'A pasta \u201C' + m.folderName + '\u201D aguarda autoriza\u00E7\u00E3o do navegador para voltar a espelhar automaticamente. Clique para abrir em Ajustes.',
        shouldRemind: needWarn,
        reminderMessage: needWarn ? 'A pasta local \u201C' + m.folderName + '\u201D precisa ser reativada em Ajustes, ou baixe uma c\u00F3pia (.scrvrl) agora.' : '',
        daysSinceBackup: daysSince,
        wordsDelta: wordsDelta,
        hasFolder: true,
        folderNeedsPermission: true
      };
    }

    if (isNaN(bestTs)) {
      if (words >= OVERDUE_DELTA_WORDS) {
        return {
          level: 'overdue',
          pillLabel: 'Guardar c\u00F3pia',
          title: 'Voc\u00EA j\u00E1 tem ' + words.toLocaleString('pt-BR') + ' palavras apenas neste navegador. Clique para baixar uma c\u00F3pia (.scrvrl) ou conectar uma pasta.',
          shouldRemind: true,
          reminderMessage: 'Voc\u00EA j\u00E1 escreveu ' + words.toLocaleString('pt-BR') + ' palavras apenas neste navegador. Guarde uma c\u00F3pia (.scrvrl) para proteger seus textos.',
          daysSinceBackup: null,
          wordsDelta: words,
          hasFolder: false,
          folderNeedsPermission: false
        };
      }
      if (words >= FIRST_REMINDER_WORDS) {
        return {
          level: 'gentle',
          pillLabel: 'C\u00F3pia recomendada',
          title: 'Voc\u00EA j\u00E1 tem ' + words.toLocaleString('pt-BR') + ' palavras neste aparelho sem c\u00F3pia externa. Clique para proteger seu acervo.',
          shouldRemind: true,
          reminderMessage: 'Voc\u00EA j\u00E1 escreveu ' + words.toLocaleString('pt-BR') + ' palavras neste aparelho. Guarde uma c\u00F3pia (.scrvrl) para proteger seus textos.',
          daysSinceBackup: null,
          wordsDelta: words,
          hasFolder: false,
          folderNeedsPermission: false
        };
      }
      return {
        level: 'fresh',
        pillLabel: 'S\u00F3 neste navegador',
        title: 'Seus textos ficam salvos neste aparelho. Clique para baixar uma c\u00F3pia (.scrvrl) ou conectar uma pasta local.',
        shouldRemind: false,
        reminderMessage: '',
        daysSinceBackup: null,
        wordsDelta: words,
        hasFolder: false,
        folderNeedsPermission: false
      };
    }

    if ((daysSince >= OVERDUE_DAYS && words >= 500) || wordsDelta >= OVERDUE_DELTA_WORDS) {
      var overMsg = wordsDelta >= OVERDUE_DELTA_WORDS
        ? 'Voc\u00EA escreveu mais de ' + wordsDelta.toLocaleString('pt-BR') + ' palavras novas desde a \u00FAltima c\u00F3pia. Vale guardar um novo .scrvrl.'
        : 'Sua \u00FAltima c\u00F3pia geral foi h\u00E1 ' + daysSince + ' dias. Guarde um novo .scrvrl para manter tudo protegido.';
      return {
        level: 'overdue',
        pillLabel: daysSince >= OVERDUE_DAYS ? ('Sem c\u00F3pia h\u00E1 ' + daysSince + 'd') : 'Guardar c\u00F3pia',
        title: overMsg,
        shouldRemind: true,
        reminderMessage: overMsg,
        daysSinceBackup: daysSince,
        wordsDelta: wordsDelta,
        hasFolder: hasFolder,
        folderNeedsPermission: false
      };
    }

    if ((daysSince >= WARN_DAYS && words >= FIRST_REMINDER_WORDS) || wordsDelta >= DELTA_REMINDER_WORDS) {
      var gentleMsg = wordsDelta >= DELTA_REMINDER_WORDS
        ? 'Voc\u00EA escreveu ' + wordsDelta.toLocaleString('pt-BR') + ' palavras novas desde a \u00FAltima c\u00F3pia. Que tal guardar um novo .scrvrl?'
        : 'J\u00E1 faz ' + daysSince + ' dias desde a \u00FAltima c\u00F3pia geral. Guarde um .scrvrl para ficar tranquilo.';
      return {
        level: 'gentle',
        pillLabel: 'C\u00F3pia recomendada',
        title: gentleMsg,
        shouldRemind: true,
        reminderMessage: gentleMsg,
        daysSinceBackup: daysSince,
        wordsDelta: wordsDelta,
        hasFolder: hasFolder,
        folderNeedsPermission: false
      };
    }

    return {
      level: 'ok',
      pillLabel: 'C\u00F3pia em dia',
      title: '\u00DAltima c\u00F3pia registrada em ' + formatTimestamp(new Date(bestTs).toISOString()) + '. Clique para ver op\u00E7\u00F5es de c\u00F3pia e pasta local.',
      shouldRemind: false,
      reminderMessage: '',
      daysSinceBackup: daysSince,
      wordsDelta: wordsDelta,
      hasFolder: hasFolder,
      folderNeedsPermission: false
    };
  }

  /* --- Persistência leve de FileSystemDirectoryHandle em IndexedDB --- */
  function openHandleDb(cb) {
    if (!root.indexedDB || !root.indexedDB.open) { cb(null); return; }
    try {
      var req = root.indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = function () { cb(req.result); };
      req.onerror = function () { cb(null); };
    } catch (ignore) {
      cb(null);
    }
  }

  function idbGetHandle(cb) {
    openHandleDb(function (db) {
      if (!db) { cb(null); return; }
      try {
        var tx = db.transaction(IDB_STORE, 'readonly');
        var req = tx.objectStore(IDB_STORE).get(IDB_KEY);
        req.onsuccess = function () { db.close(); cb(req.result || null); };
        req.onerror = function () { db.close(); cb(null); };
      } catch (ignore) {
        try { db.close(); } catch (e2) {}
        cb(null);
      }
    });
  }

  function idbPutHandle(handle, cb) {
    openHandleDb(function (db) {
      if (!db) { if (cb) { cb(false); } return; }
      try {
        var tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put(handle, IDB_KEY);
        tx.oncomplete = function () { db.close(); if (cb) { cb(true); } };
        tx.onerror = function () { db.close(); if (cb) { cb(false); } };
      } catch (ignore) {
        try { db.close(); } catch (e2) {}
        if (cb) { cb(false); }
      }
    });
  }

  function idbDeleteHandle(cb) {
    openHandleDb(function (db) {
      if (!db) { if (cb) { cb(false); } return; }
      try {
        var tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).delete(IDB_KEY);
        tx.oncomplete = function () { db.close(); if (cb) { cb(true); } };
        tx.onerror = function () { db.close(); if (cb) { cb(false); } };
      } catch (ignore) {
        try { db.close(); } catch (e2) {}
        if (cb) { cb(false); }
      }
    });
  }

  function writeFileInDir(dirHandle, filename, content, cb) {
    try {
      dirHandle.getFileHandle(filename, { create: true }).then(function (fileHandle) {
        return fileHandle.createWritable().then(function (writable) {
          return writable.write(content).then(function () {
            return writable.close();
          });
        });
      }).then(function () {
        cb(null);
      }, function (err) {
        cb(err || new Error('Falha ao gravar arquivo na pasta.'));
      });
    } catch (err) {
      cb(err);
    }
  }

  function createFolderBridge(options) {
    var opts = options || {};
    var storage = opts.storage || null;
    var win = opts.window || root;
    var dirHandle = null;
    var state = 'disconnected'; /* 'unsupported' | 'disconnected' | 'needs-permission' | 'connected' */
    var syncing = false;

    function isSupported() {
      return !!(win && typeof win.showDirectoryPicker === 'function');
    }

    if (!isSupported()) {
      state = 'unsupported';
    }

    function getFolderName() {
      if (dirHandle && dirHandle.name) { return dirHandle.name; }
      return readMeta(storage).folderName || '';
    }

    function restore(cb) {
      if (!isSupported()) {
        state = 'unsupported';
        if (cb) { cb({ state: state, folderName: '' }); }
        return;
      }
      idbGetHandle(function (saved) {
        if (!saved) {
          dirHandle = null;
          state = 'disconnected';
          if (readMeta(storage).folderName) {
            writeMeta(storage, { folderName: '' });
          }
          if (cb) { cb({ state: state, folderName: '' }); }
          return;
        }
        dirHandle = saved;
        if (saved.name) { writeMeta(storage, { folderName: saved.name }); }
        if (typeof saved.queryPermission === 'function') {
          try {
            saved.queryPermission({ mode: 'readwrite' }).then(function (perm) {
              state = perm === 'granted' ? 'connected' : 'needs-permission';
              if (cb) { cb({ state: state, folderName: getFolderName() }); }
            }, function () {
              state = 'needs-permission';
              if (cb) { cb({ state: state, folderName: getFolderName() }); }
            });
            return;
          } catch (ignore) {}
        }
        state = 'needs-permission';
        if (cb) { cb({ state: state, folderName: getFolderName() }); }
      });
    }

    function connect(cb) {
      if (!isSupported()) {
        state = 'unsupported';
        if (cb) { cb(new Error('Este navegador n\u00E3o oferece conex\u00E3o direta com pasta local.'), { state: state }); }
        return;
      }
      try {
        win.showDirectoryPicker({ id: 'escrevaral-backup', mode: 'readwrite' }).then(function (picked) {
          if (!picked) {
            if (cb) { cb(null, { cancelled: true, state: state, folderName: getFolderName() }); }
            return;
          }
          function finishGranted() {
            dirHandle = picked;
            state = 'connected';
            writeMeta(storage, { folderName: picked.name || 'Pasta local' });
            idbPutHandle(picked, function () {
              if (cb) { cb(null, { state: state, folderName: getFolderName() }); }
            });
          }
          if (typeof picked.queryPermission === 'function') {
            picked.queryPermission({ mode: 'readwrite' }).then(function (perm) {
              if (perm === 'granted') { finishGranted(); return; }
              if (typeof picked.requestPermission === 'function') {
                picked.requestPermission({ mode: 'readwrite' }).then(function (reqPerm) {
                  if (reqPerm === 'granted') { finishGranted(); }
                  else {
                    dirHandle = picked;
                    state = 'needs-permission';
                    if (cb) { cb(new Error('Permiss\u00E3o de escrita n\u00E3o concedida para a pasta.'), { state: state, folderName: getFolderName() }); }
                  }
                }, function (err) {
                  if (cb) { cb(err || new Error('N\u00E3o foi poss\u00EDvel autorizar a pasta.'), { state: state }); }
                });
              } else {
                finishGranted();
              }
            }, finishGranted);
          } else {
            finishGranted();
          }
        }, function (err) {
          if (err && (err.name === 'AbortError' || err.name === 'NotAllowedError')) {
            if (cb) { cb(null, { cancelled: true, state: state, folderName: getFolderName() }); }
            return;
          }
          if (cb) { cb(err || new Error('N\u00E3o foi poss\u00EDvel abrir o seletor de pastas.'), { state: state }); }
        });
      } catch (err) {
        if (cb) { cb(err, { state: state }); }
      }
    }

    function reconnect(cb) {
      if (!dirHandle) { connect(cb); return; }
      if (typeof dirHandle.requestPermission !== 'function') {
        state = 'connected';
        if (cb) { cb(null, { state: state, folderName: getFolderName() }); }
        return;
      }
      try {
        dirHandle.requestPermission({ mode: 'readwrite' }).then(function (perm) {
          if (perm === 'granted') {
            state = 'connected';
            if (cb) { cb(null, { state: state, folderName: getFolderName() }); }
          } else {
            state = 'needs-permission';
            if (cb) { cb(new Error('Autoriza\u00E7\u00E3o n\u00E3o concedida.'), { state: state, folderName: getFolderName() }); }
          }
        }, function (err) {
          if (err && err.name === 'AbortError') {
            if (cb) { cb(null, { cancelled: true, state: state, folderName: getFolderName() }); }
            return;
          }
          connect(cb);
        });
      } catch (ignore) {
        connect(cb);
      }
    }

    function disconnect(cb) {
      dirHandle = null;
      state = isSupported() ? 'disconnected' : 'unsupported';
      writeMeta(storage, { folderName: '', folderSyncedAt: '', folderSyncedWords: 0, folderDailyDate: '' });
      idbDeleteHandle(function () {
        if (cb) { cb({ state: state, folderName: '' }); }
      });
    }

    function writeSnapshot(jsonString, totalWords, nowDate, cb) {
      if (state !== 'connected' || !dirHandle) {
        if (cb) { cb(new Error('Nenhuma pasta local conectada.')); }
        return;
      }
      if (syncing) {
        if (cb) { cb(null, { skipped: true }); }
        return;
      }
      syncing = true;
      var d = nowDate instanceof Date && !isNaN(nowDate.getTime()) ? nowDate : new Date();
      var todayKey = localDateKey(d);
      var meta = readMeta(storage);
      var needsDaily = meta.folderDailyDate !== todayKey;

      writeFileInDir(dirHandle, 'escrevaral-backup-atual.scrvrl', jsonString, function (err) {
        if (err) {
          syncing = false;
          if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
            state = 'needs-permission';
          }
          if (cb) { cb(err); }
          return;
        }
        function doneAll(dailyWritten) {
          syncing = false;
          var w = Math.max(0, Number(totalWords) || 0);
          var patch = {
            folderName: getFolderName(),
            folderSyncedAt: d.toISOString(),
            folderSyncedWords: w
          };
          if (dailyWritten) { patch.folderDailyDate = todayKey; }
          writeMeta(storage, patch);
          if (cb) {
            cb(null, {
              folderName: patch.folderName,
              syncedAt: patch.folderSyncedAt,
              dailyFile: dailyWritten ? dailyFilename(d) : ''
            });
          }
        }
        if (needsDaily) {
          writeFileInDir(dirHandle, dailyFilename(d), jsonString, function (dailyErr) {
            doneAll(!dailyErr);
          });
        } else {
          doneAll(false);
        }
      });
    }

    function checkStoragePersistence(cb) {
      try {
        if (win && win.navigator && win.navigator.storage && typeof win.navigator.storage.persisted === 'function') {
          win.navigator.storage.persisted().then(function (ok) { if (cb) { cb(!!ok); } }, function () { if (cb) { cb(null); } });
          return;
        }
      } catch (ignore) {}
      if (cb) { cb(null); }
    }

    function requestStoragePersistence(cb) {
      try {
        if (win && win.navigator && win.navigator.storage && typeof win.navigator.storage.persist === 'function') {
          win.navigator.storage.persist().then(function (ok) { if (cb) { cb(!!ok); } }, function () { if (cb) { cb(false); } });
          return;
        }
      } catch (ignore) {}
      if (cb) { cb(false); }
    }

    return {
      isSupported: isSupported,
      getState: function () { return state; },
      getFolderName: getFolderName,
      restore: restore,
      connect: connect,
      reconnect: reconnect,
      disconnect: disconnect,
      writeSnapshot: writeSnapshot,
      checkStoragePersistence: checkStoragePersistence,
      requestStoragePersistence: requestStoragePersistence
    };
  }

  root.Escr.backupGuard = {
    LEGACY_KEY: LEGACY_KEY,
    META_KEY: META_KEY,
    WARN_DAYS: WARN_DAYS,
    OVERDUE_DAYS: OVERDUE_DAYS,
    FIRST_REMINDER_WORDS: FIRST_REMINDER_WORDS,
    DELTA_REMINDER_WORDS: DELTA_REMINDER_WORDS,
    OVERDUE_DELTA_WORDS: OVERDUE_DELTA_WORDS,
    localDateKey: localDateKey,
    dailyFilename: dailyFilename,
    formatTimestamp: formatTimestamp,
    readMeta: readMeta,
    writeMeta: writeMeta,
    recordExport: recordExport,
    evaluateHealth: evaluateHealth,
    createFolderBridge: createFolderBridge
  };
}(typeof window !== 'undefined' ? window : this));
