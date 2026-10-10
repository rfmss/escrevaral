'use strict';
// Phase 0 only: no downloads and no existing Escrevaral lexicon imports.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const literal = value => JSON.stringify(value).replace(/</g, '\\u003c')
  .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const payload = 'cafe|café||\ncafes|cafés||\n';
const source = 'D.f("f/ca", ' + literal(payload) + ');\n';
const descriptor = {
  id: 'f/ca', prefix: 'ca', path: 'f/ca.js', records: 2,
  bytes: Buffer.byteLength(source), sha256: hash(source),
  payloadBytes: Buffer.byteLength(payload), payloadSha256: hash(payload),
  sources: ['fixture-ia-20261009'], rev: 'a', batch: 'phase0-fixture-1'
};
const layers = {};
for (const name of ['f', 'x', 'l', 'd', 'e', 's']) {
  layers[name] = {records: name === 'f' ? 2 : 0,
    fragments: name === 'f' ? [descriptor] : [], metadata: []};
}
const manifest = {project: 'dict-ptbr', formatVersion: 1,
  dataVersion: 'phase0-fixture-1', kind: 'fixture', normalization: 'ptbr-key-1',
  encoding: 'UTF-8/NFC/LF', maxFileBytes: 300000, layers};
fs.mkdirSync(path.join(root, 'dist/f'), {recursive: true});
fs.writeFileSync(path.join(root, 'dist/f/ca.js'), source);
fs.writeFileSync(path.join(root, 'dist/manifest.js'), 'D.m(' + literal(manifest) + ');\n');
// Cache generation changes whenever any resource bytes change.
const files = ['demo/offline.html', 'demo/demo.js', 'runtime/dict.js',
  'dist/manifest.js', 'dist/f/ca.js'];
const digest = hash(files.map(file => file + ':' + hash(fs.readFileSync(path.join(root, file)))).join('\n'));
fs.writeFileSync(path.join(root, 'demo/offline.manifest'),
  'CACHE MANIFEST\n# dict-ptbr phase0 ' + digest + '\nCACHE:\n' +
  files.map(file => '../' + file).join('\n') + '\n');
console.log(JSON.stringify({records: 2, fragments: 1, sourceBytes: descriptor.bytes,
  payloadBytes: descriptor.payloadBytes, manifestBytes: fs.statSync(path.join(root, 'dist/manifest.js')).size}));
