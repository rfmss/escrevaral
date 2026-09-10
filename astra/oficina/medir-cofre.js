/* Medição reproduzível de runtime puro. Não é medição de navegador ou iPad. */
'use strict';
var fs = require('fs'), path = require('path'), vm = require('vm'), performance = require('perf_hooks').performance;
var root = path.resolve(__dirname, '..'), html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
var files = Array.from(html.matchAll(/<script src="([^"]+)"><\/script>/g), function (m) { return m[1]; }).filter(function (f) { return f !== 'superficie/ponte.js'; });
var context = {}; vm.createContext(context);
vm.runInContext("this.fetch=function(){throw Error('Rede proibida');};this.XMLHttpRequest=fetch;this.WebSocket=fetch;this.Set=undefined;this.Map=undefined;this.Promise=undefined;String.prototype.normalize=undefined;String.prototype.includes=undefined;Array.prototype.at=undefined;Object.assign=undefined;", context);
var start = performance.now(); files.forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), context); });
var startup = performance.now() - start, vault = context.Escr.createVault(context.Escr.knowledge);
var sample = new Array(10001).join('uma folha sem juízo. ').slice(0, 200000), measurements = [];
context.Escr.lensCatalog.map(function (p) { return p.id; }).forEach(function (lens) {
  var text = lens === 'rima' || lens === 'metrica' ? new Array(5001).join('o amor que mora na flor\n').slice(0, 200000) : sample;
  var times = [], result;
  for (var i = 0; i < 5; i += 1) { start = performance.now(); result = vault.analyze(lens, text); times.push(performance.now() - start); }
  times.sort(function (a, b) { return a - b; });
  measurements.push({ lens: lens, utf16Units: text.length, medianMs: Math.round(times[2] * 1000) / 1000, maxMs: Math.round(times[4] * 1000) / 1000, returned: result.findings.length, limited: result.limited });
});
console.log(JSON.stringify({ measuredAt: new Date().toISOString(), runtime: process.version, platform: process.platform, architecture: process.arch, portableBytes: fs.statSync(path.join(root, 'escrevaral.html')).size, coreStartupMs: Math.round(startup * 1000) / 1000, measurements: measurements, constraints: 'Contexto sem DOM; rede bloqueada; Set, Map, Promise, normalize, includes, at e assign ausentes. Medição de V8 nesta máquina, não WebKit nem iPad. Inclui limites do cofre: não extrapolar throughput.', physicalDevice: 'não medido' }, null, 2));
