/* Sondas sintéticas, sem DOM, rede ou manuscritos. Não é benchmark da língua inteira. */
'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
var repo = path.resolve(__dirname, '../..'), root = path.join(repo, 'astra');
var inventory = JSON.parse(fs.readFileSync(path.join(__dirname, 'comparacao-branches.json'), 'utf8'));
var encore = inventory.branches.filter(function (r) { return r.branch === 'encore'; })[0];
var file = 'src/core/engines/morphology.js';
var code = cp.execFileSync('git', ['show', encore.commit + ':' + file], { cwd: repo, encoding: 'utf8' });
var old = { module: { exports: {} } }; vm.createContext(old); vm.runInContext(code, old, { timeout: 1000 });
vm.runInContext("var engine = new module.exports([{forma:'fui',lema:'ser'},{forma:'fui',lema:'ir'},{forma:'amar',lema:'amar'}], []); var collision = engine.analyze('fui'); var clitic = engine.analyze('amá-me');", old, { timeout: 1000 });
var current = {}; vm.createContext(current);
var html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
Array.from(html.matchAll(/<script src="([^"]+)"><\/script>/g), function (m) { return m[1]; }).filter(function (f) { return f !== 'superficie/ponte.js'; }).forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), current, { timeout: 1000 }); });
console.log(JSON.stringify({ source: { branch: 'encore', commit: encore.commit, path: file }, probes: [
  { input: 'fui', setup: 'Registrar ser e ir na mesma forma, nessa ordem.', legacy: old.collision, current: current.Escr.grammar.readings('fui'), decision: 'Preservar a tabela multileitura atual; o nó _meta do Encore substitui a entrada anterior.' },
  { input: 'amá-me', setup: 'Forma truncada com clítico que não exige queda de r.', legacy: old.clitic, current: current.Escr.grammar.readings('amá-me'), decision: 'Não transplantar a restauração irrestrita de clíticos; a forma malformada é aceita como amar no legado.' }
], limits: 'Duas sondas sintéticas de contrato. Não mede a taxa de acerto geral das engines.' }, null, 2));
