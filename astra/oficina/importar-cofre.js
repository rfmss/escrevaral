/* Extrai somente literais; nunca executa as engines recebidas. Node é ferramenta de oficina. */
'use strict';
var fs = require('fs'), path = require('path'), crypto = require('crypto');
var sourceRoot = process.argv[2], output = path.resolve(__dirname, '..');
if (!sourceRoot) { throw new Error('Informe a pasta 02-nosso-experimento-pr155 extraída do ZIP fornecido.'); }
var expected = {
  'decolonial-data.json': '21634b76e79bb643fcd58524c322d56bc260ff9fada36f6fce6c7dcf69ba54b7',
  'analise-engine.js': 'dea2c567a68986d32e15be9447879a9b359b42ec636260860e3d39398f790638'
};
function read(name) {
  var data = fs.readFileSync(path.join(sourceRoot, name));
  if (crypto.createHash('sha256').update(data).digest('hex') !== expected[name]) { throw new Error('A fonte mudou: ' + name); }
  return data.toString('utf8');
}
var acorn;
try { acorn = require('acorn'); } catch (e) { var m = { exports: {} }; new Function('exports', 'module', process.binding('natives')['internal/deps/acorn/acorn/dist/acorn'])(m.exports, m); acorn = m.exports; }
function literal(node) {
  if (node.type === 'Literal' && typeof node.value === 'string') { return node.value; }
  if (node.type === 'ArrayExpression') { return node.elements.map(literal); }
  throw new Error('A extração exige literais de texto ou listas, sem execução.');
}
var found = {};
function walk(node) {
  if (!node || typeof node !== 'object') { return; }
  if (node.type === 'VariableDeclarator' && node.id && ['CLIQUES_PT', 'PLEONASMOS'].indexOf(node.id.name) >= 0) { found[node.id.name] = literal(node.init); }
  Object.keys(node).forEach(function (key) { if (Array.isArray(node[key])) { node[key].forEach(walk); } else if (node[key] && typeof node[key] === 'object') { walk(node[key]); } });
}
walk(acorn.parse(read('analise-engine.js'), { ecmaVersion: 'latest' }));
var raw = JSON.parse(read('decolonial-data.json'));
var categories = Object.keys(raw.categories);
var selected = ['terra de ninguém', 'missão civilizatória', 'índio preguiçoso', 'povo sem história', 'medicina primitiva', 'evolução das raças', 'cabelo ruim', 'arte primitiva', 'trabalho de preto', 'negro de alma branca', 'raça inferior', 'brasileiro não sabe português', 'portador de deficiência', 'confinado à cadeira de rodas', 'sexo frágil', 'homem não chora', 'povo sem cultura', 'bandido nato'];
var prompts = {
  territorio: 'Quem habita o lugar e de quem é a perspectiva sobre ele?',
  povos: 'A descrição permite reconhecer pessoas e povos além do estereótipo?',
  conhecimento: 'Quem define o valor deste saber no manuscrito?',
  estetica: 'Qual padrão de beleza ou de arte está falando aqui?',
  relacoes: 'A associação racial pertence ao narrador, à personagem ou à situação que o texto examina?',
  linguagem: 'O texto apresenta uma hierarquia como fato ou a coloca em discussão?',
  deficiencia: 'Como a pessoa se nomeia e qual experiência a expressão pretende descrever?',
  genero: 'A formulação atribui uma expectativa a todas as pessoas de um gênero?',
  classe: 'A condição social aparece como destino ou essência da pessoa?'
};
function phraseTokens(s) { return s.toLowerCase().match(/[a-zà-öø-ÿ\u0300-\u036f]+(?:[-'’][a-zà-öø-ÿ\u0300-\u036f]+)*/g) || []; }
function trie(entries) {
  var root = {};
  entries.forEach(function (entry, index) {
    var n = root; phraseTokens(entry.term).forEach(function (word) { var key = '$' + word; n[key] = n[key] || {}; n = n[key]; });
    n.entry = index;
  }); return root;
}
var active = raw.entries.filter(function (e) { return selected.indexOf(e.avoid) !== -1; }).map(function (e) {
  var ci = categories.indexOf(e.category) + 1;
  return { term: e.avoid, id: 'PTBR-DEC-00' + ci, category: raw.categories[e.category].label, question: prompts[e.category] };
});
if (active.length !== selected.length) { throw new Error('Recorte de ativação não corresponde à fonte.'); }
var catalog = raw.entries.map(function (e) { return { term: e.avoid, category: e.category, status: selected.indexOf(e.avoid) >= 0 ? 'observação contextual ativa; etimologia não adotada' : 'revisão individual pendente' }; });
var seen = {}, style = [], deferred = [];
function addStyle(term, kind) {
  var words = phraseTokens(term), key = words.join(' ');
  if (words.length < 2 || words.length > 16 || /[^a-zà-öø-ÿ\s'’-]/i.test(term)) { deferred.push({ term: term, kind: kind, reason: 'Fora do casamento de locuções contíguas desta versão.' }); return; }
  if (seen[key]) { return; } seen[key] = true;
  style.push({ term: term, kind: kind, id: kind === 'expressão recorrente' ? 'PTBR-EST-001' : 'PTBR-EST-002' });
}
found.CLIQUES_PT.forEach(function (s) { addStyle(s, 'expressão recorrente'); });
found.PLEONASMOS.forEach(function (p) { addStyle(p[0], 'sobreposição de sentido possível'); });
function writeJS(name, key, data) { fs.writeFileSync(path.join(output, 'conhecimento', name), '(function (root) {\n  "use strict";\n  root.Escr.' + key + ' = ' + JSON.stringify(data) + ';\n}(typeof window !== "undefined" ? window : this));\n'); }
writeJS('decolonial.js', 'decolonialData', { version: '2.0.0', entries: active, index: trie(active) });
writeJS('estilo.js', 'styleData', { version: '2.0.0', entries: style, index: trie(style) });
var provenance = {
  archiveSha256: '03c78ce4dc2a4740aec68aa81d59a8903408c9c7c64a1c7a6d2358fea15d0594',
  snapshot: '02-nosso-experimento-pr155', snapshotCommit: 'a029cc4fea0dd7dd4524f553031667f7ff9a0c06',
  files: expected, manifest: '227 arquivos conferem; apenas a referência do manifesto a si mesmo diverge.',
  decolonial: { received: raw.entries.length, active: active.length, catalog: catalog },
  style: { receivedCliches: found.CLIQUES_PT.length, receivedOverlaps: found.PLEONASMOS.length, activeUnique: style.length, deferred: deferred },
  ruleSourcePolicy: 'Origem dos dados é documentada; maturidade e alegações etimológicas do pacote não foram herdadas como fatos. Não há calibração bibliográfica presumida.'
};
fs.writeFileSync(path.join(output, 'oficina', 'proveniencia-cofre.json'), JSON.stringify(provenance, null, 2) + '\n');
console.log(JSON.stringify({ decolonialReceived: raw.entries.length, decolonialActive: active.length, clichesReceived: found.CLIQUES_PT.length, overlapsReceived: found.PLEONASMOS.length, styleUniqueActive: style.length, styleDeferred: deferred.length }));
