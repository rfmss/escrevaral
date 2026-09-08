/* Testes da ponte com DOM e relógio simulados. Não substituem navegador/dispositivo real. */
'use strict';
module.exports = function (h) {
  var test = h.test, assert = h.assert;
  function setup(storage) {
    var nodes = {}, timers = {}, nextTimer = 0, downloads = [], readers = [], events = {}, root, fakeDocument;
    function Node(tag) { this.tagName = tag; this.childNodes = []; this.attributes = {}; this.handlers = {}; this.value = ''; this.hidden = false; this.disabled = false; this.checked = false; this._text = ''; this.files = []; if (tag === 'a') { this.download = ''; } }
    Object.defineProperty(Node.prototype, 'textContent', { get: function () { return this._text + this.childNodes.map(function (n) { return n.textContent; }).join(''); }, set: function (s) { this._text = String(s); this.childNodes = []; } });
    Node.prototype.appendChild = function (n) { this.childNodes.push(n); return n; };
    Node.prototype.removeChild = function (n) { this.childNodes.splice(this.childNodes.indexOf(n), 1); };
    Node.prototype.addEventListener = function (name, fn) { this.handlers[name] = this.handlers[name] || []; this.handlers[name].push(fn); };
    Node.prototype.setAttribute = function (name, val) { this.attributes[name] = String(val); };
    Node.prototype.getAttribute = function (name) { return this.attributes[name]; };
    Node.prototype.focus = function () { fakeDocument.activeElement = this; };
    Node.prototype.scrollIntoView = function () {};
    Node.prototype.setSelectionRange = function (start, end) { this.selectionStart = start; this.selectionEnd = end; };
    Node.prototype.click = function () { this.emit('click'); };
    Node.prototype.emit = function (name, props) { var node = this; var event = props || {}; event.preventDefault = event.preventDefault || function () {}; (this.handlers[name] || []).slice().forEach(function (fn) { fn.call(node, event); }); };
    var html = h.source('index.html'), matches = html.match(/id="[^"]+"/g);
    matches.forEach(function (attr) { nodes[attr.slice(4, -1)] = new Node('div'); });
    ['mesa', 'acervo', 'oficina', 'reset-dismissed'].forEach(function (id) { nodes[id].hidden = true; });
    var lenses = ['ortografia', 'acentuacao', 'pontuacao'].map(function (id) { var b = new Node('button'); b.setAttribute('data-lens', id); return b; });
    fakeDocument = new Node('document'); fakeDocument.body = new Node('body'); fakeDocument.hidden = false;
    fakeDocument.getElementById = function (id) { assert.ok(nodes[id], id); return nodes[id]; };
    fakeDocument.querySelectorAll = function () { return lenses; };
    fakeDocument.createElement = function (tag) { return new Node(tag); };
    root = { document: fakeDocument, navigator: {}, console: console, localStorage: storage || new h.Storage(),
      setTimeout: function (fn, delay) { nextTimer += 1; timers[nextTimer] = { fn: fn, delay: delay }; return nextTimer; },
      clearTimeout: function (id) { delete timers[id]; },
      addEventListener: function (name, fn) { events[name] = fn; },
      URL: { createObjectURL: function (blob) { downloads.push(blob.parts.join('')); return 'blob:local'; }, revokeObjectURL: function () {} },
      Blob: function (parts) { this.parts = parts; },
      FileReader: function () { readers.push(this); this.readAsText = function (file) { this.result = file.contents; }; },
      fetch: function () { throw new Error('Rede proibida'); }, XMLHttpRequest: function () { throw new Error('Rede proibida'); }
    };
    root.window = root;
    h.vm.createContext(root);
    ['conhecimento/base.js', 'maquina/cofre.js', 'maquina/acervo.js', 'superficie/ponte.js'].forEach(function (file) { h.vm.runInContext(h.source(file), root); });
    return {
      nodes: nodes, root: root, lenses: lenses, document: fakeDocument, storage: root.localStorage, downloads: downloads,
      type: function (id, val) { nodes[id].value = val; nodes[id].emit('input'); },
      flush: function (limit) { Object.keys(timers).forEach(function (id) { if (timers[id] && timers[id].delay <= (limit || 1000)) { var fn = timers[id].fn; delete timers[id]; fn(); } }); },
      archive: function () { return root.Escr.createArchive(root.localStorage).list().documents; },
      import: function (name, contents) { nodes['import-file'].files = [{ name: name, size: contents.length, contents: contents }]; nodes['import-file'].emit('change'); },
      finishImport: function () { readers[readers.length - 1].onload(); },
      button: function (node, label) { return node.childNodes.filter(function (x) { return x.tagName === 'button' && x.textContent === label; })[0]; },
      shortTimers: function () { return Object.keys(timers).filter(function (id) { return timers[id].delay < 1000; }).length; }
    };
  }
  test('Ponte: escrita não dispara análise; gravação tardia e reabertura', function () {
    var a = setup(); a.type('titulo', 'O sal'); a.type('manuscrito', 'uma excessão');
    assert.strictEqual(a.archive().length, 0); assert.strictEqual(a.shortTimers(), 0); assert.strictEqual(a.nodes.findings.childNodes.length, 0);
    a.flush(); assert.strictEqual(a.archive()[0].text, 'uma excessão');
    var reopened = setup(a.storage); assert.strictEqual(reopened.nodes.manuscrito.value, 'uma excessão'); assert.strictEqual(reopened.nodes.titulo.value, 'O sal');
  });
  test('Ponte: uma lente, evidência, trecho e escolha soberana', function () {
    var a = setup(); a.type('manuscrito', 'uma excessão,, voce'); a.flush(); a.nodes['examinar-toggle'].click(); a.lenses[0].click(); a.flush(20);
    assert.strictEqual(a.nodes.findings.childNodes.length, 1);
    var finding = a.nodes.findings.childNodes[0], b = a.button(finding, 'Ver evidência'); b.click(); assert.strictEqual(b.getAttribute('aria-expanded'), 'true');
    a.button(finding, 'Ver na folha').click(); assert.strictEqual(a.nodes.manuscrito.selectionStart, 4); assert.strictEqual(a.nodes.manuscrito.selectionEnd, 12);
    a.button(finding, 'Manter minha escolha').click(); assert.strictEqual(a.nodes.findings.childNodes.length, 0); assert.strictEqual(a.nodes.manuscrito.value, 'uma excessão,, voce');
    var reopened = setup(a.storage); reopened.lenses[0].click(); reopened.flush(20); assert.strictEqual(reopened.nodes.findings.childNodes.length, 0);
    reopened.nodes['reset-dismissed'].click(); reopened.lenses[0].click(); reopened.flush(20); assert.strictEqual(reopened.nodes.findings.childNodes.length, 1);
  });
  test('Ponte: edição invalida resultado e cancela análise pendente', function () {
    var a = setup(); a.type('manuscrito', 'uma excessão'); a.lenses[0].click(); a.type('manuscrito', 'uma exceção'); a.flush(); assert.strictEqual(a.nodes.findings.childNodes.length, 0);
    a.type('manuscrito', 'uma excessão'); a.lenses[0].click(); a.flush(20); assert.strictEqual(a.nodes.findings.childNodes.length, 1);
    a.type('manuscrito', 'uma exceção'); assert.strictEqual(a.nodes.findings.childNodes.length, 0);
  });
  test('Ponte: composição de teclado não é interrompida', function () {
    var a = setup(); a.nodes.manuscrito.emit('compositionstart'); a.type('manuscrito', 'aç'); a.flush(); assert.strictEqual(a.archive().length, 0);
    a.lenses[0].click(); assert.strictEqual(a.shortTimers(), 0);
    a.nodes.manuscrito.emit('compositionend'); a.flush(); assert.strictEqual(a.archive()[0].text, 'aç');
  });
  test('Ponte: falha de gravação impede troca de folha e conserva exportação', function () {
    var a = setup(); a.type('manuscrito', 'guardado'); a.flush(); a.storage.fail = true; a.type('manuscrito', 'ainda na folha'); a.flush();
    assert.ok(/Não foi possível guardar/.test(a.nodes['save-status'].textContent));
    a.nodes['new-document'].click(); assert.strictEqual(a.nodes.manuscrito.value, 'ainda na folha');
    a.nodes['export-backup'].click(); var payload = JSON.parse(a.downloads[0]); assert.strictEqual(payload.documents[0].text, 'ainda na folha');
  });
  test('Ponte: cópia completa restaura em outro acervo sem substituir o anterior', function () {
    var a = setup(); a.type('manuscrito', 'primeira'); a.flush(); a.nodes['new-document'].click(); a.type('manuscrito', 'segunda'); a.flush(); a.nodes['export-backup'].click();
    var b = setup(); b.type('manuscrito', 'existente'); b.flush(); b.import('copia.json', a.downloads[0]); b.finishImport();
    assert.strictEqual(b.archive().length, 3); assert.deepStrictEqual(Array.from(b.archive().map(function (x) { return x.text; }).sort()), ['existente', 'primeira', 'segunda']);
  });
  test('Ponte: importação malformada não altera o acervo', function () {
    var a = setup(); a.type('manuscrito', 'original'); a.flush(); var before = JSON.stringify(a.storage.data);
    a.import('copia.json', '{'); a.finishImport(); assert.strictEqual(JSON.stringify(a.storage.data), before); assert.strictEqual(a.nodes.manuscrito.value, 'original');
    a.import('copia.json', JSON.stringify({ format: 'escrevaral-astra', version: 1, documents: [{ text: 'sem contrato' }] })); a.finishImport(); assert.strictEqual(JSON.stringify(a.storage.data), before);
  });
  test('Ponte: texto digitado durante leitura de arquivo fica guardado', function () {
    var a = setup(); a.type('manuscrito', 'antes'); a.flush(); a.import('trazido.txt', 'do arquivo');
    a.type('manuscrito', 'enquanto o arquivo era lido'); a.finishImport();
    assert.strictEqual(a.archive().length, 2); assert.ok(a.archive().some(function (d) { return d.text === 'enquanto o arquivo era lido'; }));
  });
  test('Ponte: texto HTML é dado, não marcação executada', function () {
    var a = setup(); a.type('titulo', '<img src=x onerror=alert(1)>'); a.type('manuscrito', '<script>roubar()</script> uma excessão'); a.flush(); a.nodes['acervo-toggle'].click();
    assert.ok(a.nodes['document-list'].textContent.indexOf('<img') !== -1);
    a.lenses[0].click(); a.flush(20); assert.ok(a.nodes.findings.textContent.indexOf('<script>') !== -1);
  });
  test('Ponte: atalhos, tema e som desligado por padrão', function () {
    var a = setup(); assert.strictEqual(a.nodes.som.checked, false);
    a.document.emit('keydown', { ctrlKey: true, keyCode: 13 }); assert.strictEqual(a.nodes.oficina.hidden, false);
    a.document.emit('keydown', { keyCode: 27 }); assert.strictEqual(a.nodes.oficina.hidden, true); assert.strictEqual(a.document.activeElement, a.nodes.manuscrito);
    a.nodes.tema.value = 'roteiro'; a.nodes.tema.emit('change'); assert.strictEqual(a.document.body.getAttribute('data-theme'), 'roteiro');
    var b = setup(a.storage); assert.strictEqual(b.document.body.getAttribute('data-theme'), 'roteiro');
  });
};
