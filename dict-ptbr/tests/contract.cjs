'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const acorn = require('acorn');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const runtime = read('runtime/dict.js');
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
let count = 0;
function test(name, fn) { fn(); count++; console.log('PASS ' + name); }
function manifest() {
  let result;
  vm.runInNewContext(read('dist/manifest.js'), {D: {m(m) { result = JSON.parse(JSON.stringify(m)); }}});
  return result;
}
function env(m = manifest()) {
  const nodes = [], timers = new Map(); let id = 0;
  const head = {appendChild(node) { nodes.push(node); node.parentNode = head; },
    removeChild(node) { nodes.splice(nodes.indexOf(node), 1); node.parentNode = null; }};
  const context = vm.createContext({document: {createElement() { return {}; },
    getElementsByTagName() { return [head]; }, documentElement: head},
    setTimeout(fn) { timers.set(++id, fn); return id; }, clearTimeout(n) { timers.delete(n); }});
  // No modern API/polyfill is available to the runtime under test.
  vm.runInContext('Promise=undefined;fetch=undefined;Map=undefined;Set=undefined;' +
    'String.prototype.normalize=undefined;Array.from=undefined;', context);
  vm.runInContext(runtime, context);
  context.D.m(m); context.D.configure({base: '../dist/', timeout: 25});
  return {context, D: context.D, nodes, timers, complete(source = read('dist/f/ca.js')) {
    const node = nodes[0]; vm.runInContext(source, context); node.onload();
  }};
}
function capture(e, word) {
  const out = {calls: 0}; e.D.lookup(word, (error, result) => { out.calls++; out.error = error; out.result = result; });
  return out;
}
function altered(payload, setup) {
  const m = manifest(), d = m.layers.f.fragments[0];
  d.payloadBytes = Buffer.byteLength(payload);
  if (setup) setup(m);
  const e = env(m), out = capture(e, 'café');
  e.complete('D.f("f/ca",' + JSON.stringify(payload) + ');');
  return {e, out};
}
test('all shipped JS parses as ES5 and has no forbidden APIs', () => {
  for (const file of ['runtime/dict.js', 'demo/demo.js', 'dist/manifest.js', 'dist/f/ca.js']) {
    const source = read(file); acorn.parse(source, {ecmaVersion: 5});
    assert.doesNotMatch(source, /\b(?:Promise|fetch|Map|Set|indexedDB|serviceWorker)\b|\.normalize\s*\(|Array\.from\s*\(|localeCompare/);
    assert.equal(source.normalize('NFC'), source);
  }
});
test('manifest counts, hashes, limits, envelopes and NFC', () => {
  const m = manifest(); assert.equal(m.kind, 'fixture');
  for (const [layerName, layer] of Object.entries(m.layers)) {
    let total = 0;
    for (const d of layer.fragments) {
      const source = read('dist/' + d.path); let payload;
      vm.runInNewContext(source, {D: {f(id, text) { assert.equal(id, d.id); payload = text; }}});
      const tree = acorn.parse(source, {ecmaVersion: 5});
      assert.equal(tree.body.length, 1);
      assert.equal(tree.body[0].expression.arguments[1].type, 'Literal');
      assert.equal(Buffer.byteLength(source), d.bytes); assert.equal(hash(source), d.sha256);
      assert.equal(Buffer.byteLength(payload), d.payloadBytes); assert.equal(hash(payload), d.payloadSha256);
      assert.equal(payload.normalize('NFC'), payload); assert.equal(payload.split('\n').length - 1, d.records);
      assert.ok(d.bytes <= m.maxFileBytes); total += d.records;
      assert.equal(layerName, d.id.split('/')[0]);
    }
    assert.equal(total, layer.records);
  }
  assert.ok(Buffer.byteLength(read('dist/manifest.js')) <= m.maxFileBytes);
});
test('deterministic rebuild including AppCache resources', () => {
  const files = ['dist/f/ca.js', 'dist/manifest.js', 'demo/offline.manifest'];
  const before = files.map(read);
  cp.execFileSync(process.execPath, [path.join(root, 'build/fixture.cjs')]);
  assert.deepEqual(files.map(read), before);
  for (const item of read('demo/offline.manifest').split('\n').filter(s => s.startsWith('../'))) {
    assert.ok(fs.existsSync(path.resolve(root, 'demo', item)));
  }
});
test('table handles uppercase, all declared accents, decomposition and hyphen', () => {
  const e = env();
  assert.equal(e.D.key('ÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇÑÝŸ'), 'aaaaaaeeeeiiiiooooouuuucnyy');
  assert.equal(e.D.key('CAFE\u0301'), 'cafe');
  assert.equal(e.D.key('guarda-chuva'), 'guarda-chuva');
  assert.equal(e.D.key('x\u0307'), 'x\u0307');
});
test('cold exact lookup and DOM cleanup', () => {
  const e = env(), out = capture(e, 'café'); assert.equal(out.calls, 0);
  assert.equal(e.nodes[0].src, '../dist/f/ca.js'); e.complete();
  assert.equal(out.calls, 1); assert.equal(out.error, null);
  assert.equal(out.result.entries[0].form, 'café');
  assert.equal(e.nodes.length, 0); assert.equal(e.timers.size, 0);
});
test('cache, uppercase and equivalent accent without loading again', () => {
  const e = env(); capture(e, 'café'); e.complete();
  for (const word of ['CAFÉ', 'cafe\u0301', 'cafés']) {
    assert.equal(capture(e, word).result.status, 'found');
  }
  assert.equal(e.D.stats().loads, 1); assert.equal(e.D.stats().cachedFragments, 1);
  e.D.clear(); assert.equal(e.D.stats().payloadChars, 0);
});
test('no unaccented search or suggestions smuggled into phase 0', () => {
  const e = env(), out = capture(e, 'cafe'); e.complete();
  assert.equal(out.result.status, 'absent-in-fixture'); assert.equal(out.result.entries.length, 0);
});
test('unknown prefix makes no request', () => {
  const e = env(), out = capture(e, 'zzzzz');
  assert.equal(out.result.status, 'absent-in-fixture'); assert.equal(e.D.stats().loads, 0);
});
test('invalid input and surrogates fail before I/O', () => {
  const e = env();
  for (const word of ['', null, 'a'.repeat(129), 'a\n', '\ud800']) assert.equal(capture(e, word).error.code, 'E_INPUT');
  assert.equal(e.D.stats().loads, 0);
});
test('parallel request returns busy without an unbounded queue', () => {
  const e = env(), first = capture(e, 'café');
  assert.equal(capture(e, 'cafés').error.code, 'E_BUSY'); e.complete(); assert.equal(first.calls, 1);
});
test('transport error is not a negative dictionary result', () => {
  const e = env(), out = capture(e, 'café'); e.nodes[0].onerror();
  assert.equal(out.error.code, 'E_LOAD'); assert.equal(out.result, undefined); assert.equal(e.nodes.length, 0);
});
test('missing registration and wrong ID fail', () => {
  for (const source of ['', 'D.f("d/ca", "x");']) {
    const e = env(), out = capture(e, 'café'); e.complete(source); assert.equal(out.error.code, 'E_REGISTER');
  }
});
test('duplicate registration fails', () => {
  const e = env(), out = capture(e, 'café'); e.complete(read('dist/f/ca.js').repeat(2));
  assert.equal(out.error.code, 'E_REGISTER');
});
test('timeout closes transport and ignores stale script callback', () => {
  const e = env(), out = capture(e, 'café'), lateLoad = e.nodes[0].onload;
  [...e.timers.values()][0](); assert.equal(out.error.code, 'E_TIMEOUT');
  vm.runInContext(read('dist/f/ca.js'), e.context); lateLoad();
  assert.equal(out.calls, 1); assert.equal(e.D.stats().cachedFragments, 0);
  assert.equal(capture(e, 'café').error.code, 'E_TRANSPORT_BLOCKED');
});
test('malformed payloads, escapes, duplicates, order and routing rejected', () => {
  for (const text of ['cafe|café||', 'cafe|café||\n\n', 'cafe|café|\n',
    'cafe|café||\\z\n', 'cafe|café||\n'.repeat(2), 'cafes|cafés||\ncafe|café||\n',
    'zebra|zebra||\n', 'cafe|cafés||\n', 'cafe|café|cafe.s1|v\n', 'cafe|café||\r\n']) {
    const {out} = altered(text); assert.equal(out.error.code, 'E_FORMAT', JSON.stringify(text));
  }
});
test('counts and payload byte length are checked', () => {
  const a = altered('cafe|café||\n'); assert.equal(a.out.error.code, 'E_FORMAT');
  const e = env(), b = capture(e, 'café'); e.complete('D.f("f/ca", "");');
  assert.equal(b.error.code, 'E_FORMAT');
});
test('homographs survive with distinct lemma IDs', () => {
  const {out} = altered('cafe|café|cafe.s1|s\ncafe|café|cafe.s2|s\n');
  assert.equal(out.error, null); assert.equal(out.result.entries.length, 2);
});
test('overflowing result does not silently truncate', () => {
  const rows = Array.from({length: 65}, (_, i) => 'cafe|café|cafe.s' + (i + 1) + '|s')
    .sort((a, b) => a.split('|')[2] < b.split('|')[2] ? -1 : 1);
  const {out} = altered(rows.join('\n') + '\n', m => {
    m.layers.f.fragments[0].records = 65; m.layers.f.records = 65;
  });
  assert.equal(out.error.code, 'E_LIMIT');
});
test('reserved field escapes decode without changing separators', () => {
  const {e, out} = altered('ca\\pb\\cc\\\\d|ca\\pb\\cc\\\\d||\n', m => {
    m.layers.f.fragments[0].records = 1; m.layers.f.records = 1;
  });
  assert.equal(out.error, null);
  assert.equal(capture(e, 'ca|b,c\\d').result.entries[0].form, 'ca|b,c\\d');
});
test('manifest version/path/overlap/limit errors are explicit', () => {
  const mutations = [m => m.formatVersion = 2, m => m.layers.f.fragments[0].path = '../bad.js',
    m => m.layers.f.fragments[0].bytes = 300001,
    m => m.layers.f.fragments.push({...m.layers.f.fragments[0], prefix: 'caf', id: 'f/caf'}),
    m => m.layers.f.records = 99];
  for (const mutate of mutations) {
    const m = manifest(); mutate(m); assert.throws(() => env(m), e => e.code === 'E_MANIFEST');
  }
});
test('subdivided prefix and single-character shard routing', () => {
  for (const prefix of ['caf', 'c']) {
    const m = manifest(); Object.assign(m.layers.f.fragments[0], {prefix, id: 'f/' + prefix});
    const e = env(m), out = capture(e, 'café');
    e.complete(read('dist/f/ca.js').replace('f/ca', 'f/' + prefix));
    assert.equal(out.result.status, 'found');
  }
});
test('manifest is copied and namespace is protected', () => {
  const m = manifest(), e = env(m); m.layers.f.fragments[0].path = 'malicious.js';
  capture(e, 'café'); assert.equal(e.nodes[0].src, '../dist/f/ca.js');
  assert.throws(() => vm.runInContext(runtime, e.context), /occupied/);
});
test('callback exception does not cause a second callback', () => {
  const e = env(); let calls = 0;
  e.D.lookup('café', () => { calls++; throw Error('consumer failure'); });
  assert.throws(() => e.complete(), /consumer failure/); assert.equal(calls, 1);
  assert.equal(e.D.stats().pending, false);
});
console.log(JSON.stringify({suite: 'dict-ptbr phase0', passed: count, failed: 0,
  node: process.version, platform: process.platform, deviceAcceptance: 'pending'}));
