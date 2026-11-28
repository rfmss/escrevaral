/* Executar: node tests/backup-local.cjs */
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const scripts = require('./helpers/sources.cjs').scripts();

function createStorage() {
  const data = new Map();
  return {
    get length() { return data.size; },
    key(i) { return Array.from(data.keys())[i] || null; },
    getItem(k) { return data.has(k) ? data.get(k) : null; },
    setItem(k, v) { data.set(k, String(v)); },
    removeItem(k) { data.delete(k); }
  };
}

const context = vm.createContext({
  Promise,
  Date,
  Math,
  JSON,
  Object,
  Array,
  Error,
  Number,
  String,
  Boolean,
  isNaN,
  isFinite
});
context.window = context;

const mod = scripts.find(s => s.includes('root.Escr.backupGuard ='));
assert.ok(mod, 'Módulo src/storage/backup-local.js presente no bundle');
vm.runInContext(mod, context);

const guard = context.Escr.backupGuard;
const store = createStorage();

// 1. Estado inicial com poucas palavras (<250): discreto, sem lembrete
const now = Date.parse('2026-11-27T20:00:00Z');
let h = guard.evaluateHealth(guard.readMeta(store), 80, 'disconnected', now);
assert.equal(h.level, 'fresh');
assert.equal(h.shouldRemind, false);
assert.equal(h.pillLabel, 'Só neste navegador');

// 2. Atingiu 250+ palavras sem nenhuma cópia: lembrete gentil
h = guard.evaluateHealth(guard.readMeta(store), 320, 'disconnected', now);
assert.equal(h.level, 'gentle');
assert.equal(h.shouldRemind, true);
assert.ok(h.reminderMessage.includes('320'));

// 3. Atingiu 2500+ palavras sem nenhuma cópia: alerta overdue
h = guard.evaluateHealth(guard.readMeta(store), 2800, 'disconnected', now);
assert.equal(h.level, 'overdue');
assert.equal(h.shouldRemind, true);

// 4. Após exportar cópia manual (.scrvrl): estado 'ok', grava chave legada + meta
const exportDate = new Date(now - 2 * 86400000);
guard.recordExport(store, 2800, exportDate);
assert.equal(store.getItem(guard.LEGACY_KEY), exportDate.toISOString(), 'Mantém compatibilidade com chave legada');

h = guard.evaluateHealth(guard.readMeta(store), 3100, 'disconnected', now);
assert.equal(h.level, 'ok');
assert.equal(h.shouldRemind, false);
assert.equal(h.wordsDelta, 300);
assert.equal(h.daysSinceBackup, 2);

// 5. Mesmo tendo feito backup há 2 dias, se escreveu +1.000 palavras novas: lembrete gentil por palavras!
h = guard.evaluateHealth(guard.readMeta(store), 3900, 'disconnected', now);
assert.equal(h.level, 'gentle');
assert.equal(h.shouldRemind, true);
assert.equal(h.wordsDelta, 1100);
assert.ok(h.reminderMessage.includes('palavras novas'));

// 6. Se passaram 8 dias desde o último backup: lembrete gentil por tempo
h = guard.evaluateHealth(guard.readMeta(store), 2850, 'disconnected', now + 6 * 86400000);
assert.equal(h.level, 'gentle');
assert.equal(h.shouldRemind, true);
assert.equal(h.daysSinceBackup, 8);

// 7. Se passaram 15 dias desde o último backup com >= 500 palavras: overdue
h = guard.evaluateHealth(guard.readMeta(store), 2850, 'disconnected', now + 13 * 86400000);
assert.equal(h.level, 'overdue');
assert.equal(h.shouldRemind, true);
assert.equal(h.pillLabel, 'Sem cópia há 15d');

// 8. Compatibilidade com instalação legada (só escrevaral.backup.last.v1 preenchido)
const legacyStore = createStorage();
legacyStore.setItem(guard.LEGACY_KEY, new Date(now - 86400000).toISOString());
const legacyMeta = guard.readMeta(legacyStore);
assert.ok(legacyMeta.lastBackupAt, 'Lê timestamp da chave legada');

// 9. Pasta local (File System Access API mock): conectar, gravar atual + cópia diária única, desconectar sem apagar disco
async function runAsyncChecks() {
  const writtenFiles = new Map();
  let permState = 'granted';
  const mockDirHandle = {
    name: 'Meus-Livros-Escrevaral',
    async queryPermission() { return permState; },
    async requestPermission() { permState = 'granted'; return permState; },
    async getFileHandle(name) {
      return {
        async createWritable() {
          let buf = '';
          return {
            async write(chunk) { buf += String(chunk); },
            async close() { writtenFiles.set(name, buf); }
          };
        }
      };
    }
  };

  // Navegador sem suporte (ex.: Firefox/Safari)
  const unsupportedBridge = guard.createFolderBridge({ storage: store, window: {} });
  assert.equal(unsupportedBridge.isSupported(), false);
  assert.equal(unsupportedBridge.getState(), 'unsupported');

  // Navegador com File System Access API
  const mockWin = {
    async showDirectoryPicker() { return mockDirHandle; },
    navigator: {
      storage: {
        async persisted() { return false; },
        async persist() { return true; }
      }
    }
  };
  const bridgeStore = createStorage();
  const bridge = guard.createFolderBridge({ storage: bridgeStore, window: mockWin });
  assert.equal(bridge.isSupported(), true);
  assert.equal(bridge.getState(), 'disconnected');

  await new Promise((resolve, reject) => {
    bridge.connect((err, info) => {
      if (err) { reject(err); return; }
      assert.equal(info.state, 'connected');
      assert.equal(info.folderName, 'Meus-Livros-Escrevaral');
      resolve();
    });
  });

  // Primeira gravação no dia cria atual + cópia diária
  const day1 = new Date('2026-11-27T19:30:00Z');
  const firstRes = await new Promise((resolve, reject) => {
    bridge.writeSnapshot('{"versao":1,"texto":"cap1"}', 500, day1, (err, info) => err ? reject(err) : resolve(info));
  });
  assert.equal(writtenFiles.get('escrevaral-backup-atual.scrvrl'), '{"versao":1,"texto":"cap1"}');
  assert.ok(firstRes.dailyFile && writtenFiles.has(firstRes.dailyFile), 'Cria cópia diária na primeira gravação do dia');

  // Segunda gravação no mesmo dia atualiza apenas o atual sem duplicar arquivo diário
  const secondRes = await new Promise((resolve, reject) => {
    bridge.writeSnapshot('{"versao":2,"texto":"cap1+cap2"}', 950, day1, (err, info) => err ? reject(err) : resolve(info));
  });
  assert.equal(writtenFiles.get('escrevaral-backup-atual.scrvrl'), '{"versao":2,"texto":"cap1+cap2"}');
  assert.equal(secondRes.dailyFile, '', 'Não reescreve cópia diária no mesmo dia');

  // Saúde com pasta conectada: 'synced' sem lembrete intrusivo
  const syncedHealth = guard.evaluateHealth(guard.readMeta(bridgeStore), 1200, bridge.getState(), day1.getTime());
  assert.equal(syncedHealth.level, 'synced');
  assert.equal(syncedHealth.shouldRemind, false);
  assert.equal(syncedHealth.pillLabel, 'Pasta · em dia');

  // Estado needs-permission após recarga
  const permHealth = guard.evaluateHealth(guard.readMeta(bridgeStore), 1200, 'needs-permission', day1.getTime());
  assert.equal(permHealth.pillLabel, 'Pasta · reconectar');
  assert.equal(permHealth.folderNeedsPermission, true);

  // Desconectar limpa metadados sem remover arquivos gravados no disco
  await new Promise((resolve) => { bridge.disconnect(resolve); });
  assert.equal(bridge.getState(), 'disconnected');
  assert.equal(guard.readMeta(bridgeStore).folderName, '');
  assert.ok(writtenFiles.has('escrevaral-backup-atual.scrvrl'), 'Arquivos já gravados permanecem intactos no disco');

  // Persistência do navegador
  const persisted = await new Promise((resolve) => { bridge.requestStoragePersistence(resolve); });
  assert.equal(persisted, true);

  // Verificação estática do HTML template
  const tpl = fs.readFileSync('src/index.template.html', 'utf8');
  for (const id of ['esc-backup-pill', 'esc-backup-pill-label', 'local-folder-box', 'backup-folder-connect', 'backup-folder-sync', 'backup-folder-disconnect']) {
    assert.ok(tpl.includes('id="' + id + '"'), 'Elemento presente no template: #' + id);
  }

  console.log('OK: Saúde do backup, lembrete por tempo/palavras, pílula do rodapé e espelho em pasta local (File System Access API) verificados.');
}

runAsyncChecks().catch((err) => { console.error(err); process.exit(1); });
