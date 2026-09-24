/* Testes simulados do painel progressivo: node ptbr/teste-painel.js.
 * Não substituem QA em dispositivo real ou validação visual. */
'use strict';
var assert = require('assert'), fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.resolve(__dirname, '..'), source = fs.readFileSync(path.join(__dirname, 'painel.js'), 'utf8');
function Node(tag) {
  this.tagName = tag; this.childNodes = []; this.listeners = {}; this.attrs = {};
  this._text = ''; this.hidden = false; this.value = ''; this.firstChild = null; this.disabled = false;
}
Object.defineProperty(Node.prototype, 'textContent', {
  get: function () { return this._text + this.childNodes.map(function (n) { return n.textContent; }).join(''); },
  set: function (v) { this._text = String(v); this.childNodes = []; this.firstChild = null; }
});
Node.prototype.appendChild = function (n) { this.childNodes.push(n); this.firstChild = this.childNodes[0]; return n; };
Node.prototype.insertBefore = function (n) { return this.appendChild(n); };
Node.prototype.setAttribute = function (k, v) { this.attrs[k] = String(v); };
Node.prototype.getAttribute = function (k) { return this.attrs[k] || null; };
Node.prototype.addEventListener = function (k, f) { (this.listeners[k] || (this.listeners[k] = [])).push(f); };
Node.prototype.emit = function (k) { (this.listeners[k] || []).forEach(function (f) { f({ keyCode: 0 }); }); };
Node.prototype.click = function () { this.emit('click'); };
Node.prototype.focus = function () { this.emit('focus'); };
Node.prototype.querySelector = function (s) { return s === '.sheet-heading' ? this.heading : null; };
Node.prototype.querySelectorAll = function (s) { return s === 'button' ? this.childNodes.filter(function (n) { return n.tagName === 'button'; }) : []; };
Node.prototype.setSelectionRange = function (a, b) { this.selectionStart = a; this.selectionEnd = b; };
function setup(initial, dismissed) {
  var document = new Node('document'), panel = new Node('section'), manuscript = new Node('textarea'),
    opener = new Node('button'), back = new Node('button'), timers = [], calls = [], next = 0;
  document.head = new Node('head'); document.createElement = function (tag) { return new Node(tag); };
  panel.hidden = true; panel.heading = new Node('header'); manuscript.value = initial;
  document.getElementById = function (id) {
    return ({ oficina: panel, manuscrito: manuscript, 'examinar-toggle': opener, 'back-writing': back })[id] || null;
  };
  function tokenize(s) {
    var out = [], regex = /[A-Za-zÀ-ÖØ-öø-ÿ]+/g, match;
    while ((match = regex.exec(s))) { out.push({ value: match[0].toLowerCase(), start: match.index, end: match.index + match[0].length }); }
    return out;
  }
  var E = {
    knowledge: { rules: [{ lens: 'ortografia', forms: { 'excessão': 'exceção' } }] },
    styleData: { entries: [{ term: 'ao longo do tempo' }] },
    studioData: { adverbs: [] }, maturationData: { stopwords: [] },
    protectedText: function (s) { return s; },
    reading: { tokens: tokenize, sentences: function () { return []; } },
    grammar: { readings: function (word) { return { classes: word === 'rua' ? ['substantivo'] : [] }; } },
    ptbrPanelChoices: function () { return dismissed || []; },
    createVault: function () { return { analyze: function (lens, value) {
      calls.push(lens);
      return { findings: lens === 'ortografia' ? [{
        id: 'PTBR-ORT-001', snippet: 'excessão', start: 6, end: 14,
        message: 'Grafia para conferir', confidence: 'moderada',
        evidence: { observation: 'forma encontrada', interpretation: 'conferir',
          ambiguity: 'uso intencional possível', limit: 'lista local' }
      }] : [], limited: false };
    } }; }
  };
  var window = { document: document, Escr: E,
    setTimeout: function (fn, delay) { var timer = { id: ++next, fn: fn, delay: delay, cancelled: false }; timers.push(timer); return timer.id; },
    clearTimeout: function (id) { timers.forEach(function (timer) { if (timer.id === id) { timer.cancelled = true; } }); }
  };
  vm.runInNewContext(source, { window: window, document: document });
  var board = panel.childNodes[0];
  function child(className) { return board.childNodes.filter(function (n) { return n.className === className; })[0]; }
  return {
    board: board, panel: panel, manuscript: manuscript, calls: calls, action: child('ptbr-action'),
    legacy: child('ptbr-action ptbr-secondary'), wheel: child('ptbr-wheel'),
    flush: function (cap) {
      var n = 0, timer;
      while (timers.length && n++ < (cap || 100)) { timer = timers.shift(); if (!timer.cancelled) { timer.fn(); } }
      assert.ok(n < (cap || 100), 'loop de temporizadores');
    },
    timers: timers
  };
}
var sample = 'A rua excessão,, que é ao longo do tempo', a = setup(sample);
assert.strictEqual(a.calls.length, 0, 'triagem não executa lentes');
assert.strictEqual(a.manuscript.value, sample);
a.panel.hidden = false; a.panel.focus();
assert.deepStrictEqual(a.wheel.childNodes.map(function (n) { return n.textContent; }),
  ['Ortografia', 'Pontuação', 'Classes de palavras', 'Expressões']);
assert.ok(a.board.textContent.indexOf('função sintática ainda não confirmada') !== -1);
a.action.click(); a.flush();
assert.deepStrictEqual(a.calls, ['ortografia', 'pontuacao', 'morfologia', 'expressoes']);
assert.ok(a.board.textContent.indexOf('Grafia para conferir') !== -1);
assert.ok(a.board.textContent.indexOf('Análise concluída') !== -1);
assert.strictEqual(a.manuscript.value, sample, 'análise não modifica o original');
a.legacy.click();
assert.strictEqual(a.panel.getAttribute('data-ptbr-legacy'), 'true', 'revisão individual preservada');
a.legacy.click();
assert.strictEqual(a.panel.getAttribute('data-ptbr-legacy'), 'false');
var b = setup(sample, ['PTBR-ORT-001|excessão']);
b.panel.hidden = false; b.panel.focus(); b.wheel.childNodes[0].click(); b.flush();
assert.deepStrictEqual(b.calls, ['ortografia']);
assert.ok(b.board.textContent.indexOf('Nenhuma observação nova neste recorte.') !== -1,
  'respeita escolha mantida');
assert.ok(b.board.textContent.indexOf('Grafia para conferir') === -1);
var c = setup(sample);
c.panel.hidden = false; c.panel.focus(); c.action.click();
c.manuscript.value = 'Texto alterado'; c.manuscript.emit('input'); c.flush();
assert.strictEqual(c.calls.length, 0, 'análise antiga cancelada pela edição');
assert.ok(c.board.textContent.indexOf('Grafia para conferir') === -1);
var d = setup(sample);
d.manuscript.emit('compositionstart'); d.manuscript.value = 'aç'; d.manuscript.emit('input');
assert.strictEqual(d.timers.filter(function (x) { return !x.cancelled; }).length, 0,
  'não agendar triagem durante composição');
d.manuscript.emit('compositionend');
assert.strictEqual(d.timers.filter(function (x) { return !x.cancelled; }).length, 1,
  'triagem agendada após composição');
d.flush();
assert.strictEqual(d.calls.length, 0);
var html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
var portable = fs.readFileSync(path.join(root, 'escrevaral.html'), 'utf8');
var worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
assert.strictEqual(html, portable, 'HTML portátil difere do publicado');
assert.ok(html.indexOf(source) !== -1, 'a cópia inline do painel diverge da fonte');
assert.ok(html.indexOf('E.ptbrPanelChoices=function()') !== -1, 'a ponte não respeita escolhas');
var version = /name="asset-version" content="([^"]+)"/.exec(html);
assert.ok(version && worker.indexOf('ASSET_VERSION = "' + version[1] + '"') !== -1,
  'cache e HTML em versões diferentes');
console.log('PAINEL OK: sinais, análise serial, escolhas, lente individual, cancelamento, IME, HTML portátil e cache');
