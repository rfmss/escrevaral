/* Testes da ponte com DOM e relógio simulados. Não substituem navegador/dispositivo real. */
'use strict';
module.exports = function (h) {
  var test = h.test, assert = h.assert;
  function setup(storage, clockStart) {
    var clock = clockStart ? new Date(clockStart).getTime() : Date.now();
    function ClockDate(value) { return new Date(arguments.length ? value : clock); }
    ClockDate.parse = Date.parse; ClockDate.UTC = Date.UTC; ClockDate.now = function () { return clock; };
    var nodes = {}, timers = {}, nextTimer = 0, downloads = [], readers = [], events = {}, root, fakeDocument;
    function Node(tag) { this.tagName = tag; this.childNodes = []; this.attributes = {}; this.handlers = {}; this.value = ''; this.hidden = false; this.disabled = false; this.checked = false; this._text = ''; this.files = []; this.scrollTop = 0; this.clientHeight = 180; this.offsetHeight = 44; if (tag === 'a') { this.download = ''; } }
    Object.defineProperty(Node.prototype, 'textContent', { get: function () { return this._text + this.childNodes.map(function (n) { return n.textContent; }).join(''); }, set: function (s) { this._text = String(s); this.childNodes = []; } });
    Node.prototype.appendChild = function (n) { n.parentNode = this; this.childNodes.push(n); return n; };
    Object.defineProperty(Node.prototype, 'offsetTop', { get: function () { return this.parentNode ? this.parentNode.childNodes.indexOf(this) * 44 : 0; } });
    Object.defineProperty(Node.prototype, 'scrollHeight', { get: function () { return this.childNodes.length * 44; } });
    Node.prototype.removeChild = function (n) { this.childNodes.splice(this.childNodes.indexOf(n), 1); };
    Node.prototype.addEventListener = function (name, fn) { this.handlers[name] = this.handlers[name] || []; this.handlers[name].push(fn); };
    Node.prototype.setAttribute = function (name, val) { this.attributes[name] = String(val); };
    Node.prototype.removeAttribute = function (name) { delete this.attributes[name]; };
    Node.prototype.getAttribute = function (name) { return this.attributes[name]; };
    Node.prototype.focus = function () { fakeDocument.activeElement = this; };
    Node.prototype.scrollIntoView = function () {};
    Node.prototype.setSelectionRange = function (start, end) { this.selectionStart = start; this.selectionEnd = end; };
    Node.prototype.click = function () { this.emit('click'); };
    Node.prototype.emit = function (name, props) { var node = this; var event = props || {}; event.preventDefault = event.preventDefault || function () {}; (this.handlers[name] || []).slice().forEach(function (fn) { fn.call(node, event); }); };
    var html = h.source('index.html'), matches = html.match(/id="[^"]+"/g);
    matches.forEach(function (attr) { nodes[attr.slice(4, -1)] = new Node('div'); });
    ['mesa', 'acervo', 'oficina', 'reset-dismissed'].forEach(function (id) { nodes[id].hidden = true; });
    nodes['timeline-list'].parentNode = new Node('aside');
    var lenses = Array.from(html.matchAll(/data-lens="([^"]+)"/g), function (m) { var b = new Node('button'); b.setAttribute('data-lens', m[1]); return b; });
    fakeDocument = new Node('document'); fakeDocument.body = new Node('body'); fakeDocument.hidden = false;
    fakeDocument.getElementById = function (id) { assert.ok(nodes[id], id); return nodes[id]; };
    fakeDocument.querySelectorAll = function () { return lenses; };
    fakeDocument.createElement = function (tag) { return new Node(tag); };
    root = { Date: ClockDate, document: fakeDocument, navigator: {}, console: console, localStorage: storage || new h.Storage(),
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
    Array.from(html.matchAll(/<script src="([^"]+)"><\/script>/g), function (m) { return m[1]; }).forEach(function (file) { h.vm.runInContext(h.source(file), root); });
    return {
      setTime: function (value) { clock = new Date(value).getTime(); },
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
  test('Interface: painel exclusivo, fechamento e retorno ao controle de origem', function () {
    var a = setup(); a.nodes['mesa-toggle'].focus(); a.nodes['mesa-toggle'].click();
    assert.strictEqual(a.nodes.mesa.hidden, false); assert.strictEqual(a.nodes['panel-backdrop'].hidden, false);
    assert.strictEqual(a.nodes['writing-space'].getAttribute('aria-hidden'), 'true');
    a.nodes['acervo-toggle'].click();
    assert.strictEqual(a.nodes.mesa.hidden, true); assert.strictEqual(a.nodes.acervo.hidden, false);
    assert.strictEqual(a.nodes['mesa-toggle'].getAttribute('aria-expanded'), 'false');
    a.nodes['acervo-close'].click();
    assert.strictEqual(a.nodes.acervo.hidden, true); assert.strictEqual(a.nodes['panel-backdrop'].hidden, true);
    assert.strictEqual(a.nodes['writing-space'].getAttribute('aria-hidden'), undefined);
    assert.strictEqual(a.document.activeElement, a.nodes['acervo-toggle']);
    a.nodes['mesa-toggle'].click(); a.nodes['panel-backdrop'].click(); assert.strictEqual(a.nodes.mesa.hidden, true);
  });
  test('Interface: título e horário aparecem nesta ordem na folha, roleta e acervo', function () {
    var a = setup(null, '2026-09-09T22:30:05'); a.type('titulo', 'O sal do mar'); a.type('manuscrito', 'escrita'); a.flush();
    var b = a.nodes['timeline-list'].childNodes.filter(function (n) { return n.className === 'timeline-entry'; })[0];
    assert.strictEqual(b.childNodes[0].textContent, 'O sal do mar'); assert.strictEqual(b.childNodes[1].textContent, '22:30:05');
    assert.ok(a.nodes['manuscript-date'].textContent.indexOf('22:30:05') === 0);
    a.nodes['acervo-toggle'].click(); b = a.nodes['document-list'].childNodes[0].childNodes[0];
    assert.strictEqual(b.childNodes[0].textContent, 'O sal do mar'); assert.ok(b.childNodes[1].textContent.indexOf('22:30:05') === 0);
    assert.strictEqual(b.getAttribute('aria-current'), 'true');
  });
  test('Interface: expansão da roleta não troca folha; nova folha recolhe a roleta', function () {
    var a = setup(); a.type('manuscrito', 'preservar'); a.flush();
    a.nodes['timeline-toggle'].click(); assert.strictEqual(a.nodes['timeline-toggle'].getAttribute('aria-expanded'), 'true');
    assert.strictEqual(a.nodes.manuscrito.value, 'preservar');
    a.nodes['timeline-new'].click(); assert.strictEqual(a.nodes['timeline-toggle'].getAttribute('aria-expanded'), 'false');
    assert.ok(a.archive().some(function (d) { return d.text === 'preservar'; }));
  });
  test('Interface: ponte distingue ponteiro e navegação por teclado', function () {
    var a = setup(); a.document.emit('mousedown'); assert.strictEqual(a.document.body.getAttribute('data-input'), 'pointer');
    a.document.emit('keydown', { keyCode: 9 }); assert.strictEqual(a.document.body.getAttribute('data-input'), 'keyboard');
    a.document.emit('touchstart'); assert.strictEqual(a.document.body.getAttribute('data-input'), 'pointer');
  });
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
    assert.deepStrictEqual(Array.from(b.archive().filter(function (x) { return x.text !== 'existente'; }).map(function (x) { return x.created; }).sort()), Array.from(a.archive().map(function (x) { return x.created; }).sort()));
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
  test('Ponte: cronologia abre a folha escolhida e preserva escrita antes de trocar', function () {
    var a = setup();
    function entries() { return a.nodes['timeline-list'].childNodes.filter(function (n) { return n.className === 'timeline-entry'; }); }
    assert.strictEqual(a.document.body.getAttribute('data-theme'), 'roteiro');
    assert.ok(a.nodes['manuscript-date'].textContent.indexOf(' de ') !== -1);
    a.type('titulo', 'Primeira'); a.type('manuscrito', 'um'); a.flush();
    a.nodes['timeline-new'].click(); a.type('titulo', 'Segunda'); a.type('manuscrito', 'dois'); a.flush();
    a.type('manuscrito', 'dois, com uma alteração ainda não guardada');
    entries().filter(function (b) { return b.getAttribute('title') === 'Primeira'; })[0].click();
    assert.strictEqual(a.nodes.manuscrito.value, 'um');
    assert.ok(a.archive().some(function (d) { return d.text === 'dois, com uma alteração ainda não guardada'; }));
    assert.strictEqual(entries().filter(function (b) { return b.getAttribute('aria-current') === 'true'; })[0].getAttribute('title'), 'Primeira');
    assert.strictEqual(entries().length, 2);
  });
  test('Ponte: as seis lentes novas são acionadas explicitamente e preservam a folha', function () {
    var a = setup(), samples = { decolonial: 'um cabelo ruim', expressoes: 'subir para cima', rima: 'amor\nflor', metrica: 'o amor', morfologia: 'Eu leio', sintaxe: 'A escritora leu o livro ontem.' };
    Object.keys(samples).forEach(function (lens) {
      a.type('manuscrito', samples[lens]); a.flush(); assert.strictEqual(a.nodes.findings.childNodes.length, 0);
      a.lenses.filter(function (b) { return b.getAttribute('data-lens') === lens; })[0].click(); a.flush(20);
      assert.ok(a.nodes.findings.childNodes.length > 0); assert.strictEqual(a.nodes.manuscrito.value, samples[lens]);
      a.type('manuscrito', samples[lens] + ' '); assert.strictEqual(a.nodes.findings.childNodes.length, 0);
    });
  });
  test('Roleta: duas folhas no mesmo minuto mostram segundos e mantêm a criação ao editar', function () {
    var a = setup(null, '2026-09-09T22:30:05');
    a.type('titulo', 'Primeira'); a.type('manuscrito', 'um'); a.flush();
    a.setTime('2026-09-09T22:30:50'); a.nodes['timeline-new'].click(); a.type('titulo', 'Segunda'); a.flush();
    var rail = a.nodes['timeline-list'];
    function entries() { return rail.childNodes.filter(function (n) { return n.className === 'timeline-entry'; }); }
    assert.deepStrictEqual(entries().map(function (n) { return n.childNodes[1].textContent; }), ['22:30:05', '22:30:50']);
    entries()[0].click(); var before = a.nodes['manuscript-date'].getAttribute('datetime');
    rail.scrollTop = 31; a.setTime('2026-09-10T01:01:12'); a.type('manuscrito', 'um revisado'); a.flush();
    assert.strictEqual(a.nodes['manuscript-date'].getAttribute('datetime'), before);
    assert.strictEqual(rail.scrollTop, 31);
    assert.deepStrictEqual(entries().map(function (n) { return n.childNodes[1].textContent; }), ['22:30:05', '22:30:50']);
    assert.strictEqual(a.archive().filter(function (d) { return d.title === 'Primeira'; })[0].updated, new Date('2026-09-10T01:01:12').toISOString());
  });
  test('Roleta: novas folhas vazias no mesmo segundo permanecem distintas e sem foco no teclado', function () {
    var a = setup(null, '2026-09-09T22:30:05');
    for (var i = 0; i < 3; i += 1) { a.nodes['timeline-new'].click(); }
    assert.strictEqual(a.archive().length, 3);
    assert.strictEqual(new Set(a.archive().map(function (d) { return d.id; })).size, 3);
    assert.notStrictEqual(a.document.activeElement, a.nodes.titulo);
    assert.strictEqual(setup(a.storage).archive().length, 3);
  });
  test('Roleta: novas folhas revelam o horário ativo e mantêm acessíveis mais de doze datas', function () {
    var a = setup(null, '2026-09-09T22:30:05');
    for (var i = 0; i < 20; i += 1) { a.setTime(new Date(2026, 8, 9, 22, 30, i)); a.nodes['timeline-new'].click(); }
    var rail = a.nodes['timeline-list'];
    assert.strictEqual(rail.childNodes.filter(function (n) { return n.className === 'timeline-entry'; }).length, 20);
    assert.ok(rail.scrollTop > 0);
    assert.strictEqual(rail.childNodes[rail.childNodes.length - 1].getAttribute('aria-current'), 'true');
  });
  test('Roleta: rolar para o início acrescenta datas anteriores e preserva a posição visual', function () {
    var a = setup(null, '2026-09-09T22:30:05');
    for (var i = 0; i < 85; i += 1) { a.setTime(new Date(2026, 8, 9, 20, i, 5)); a.nodes['timeline-new'].click(); }
    var rail = a.nodes['timeline-list'];
    function count() { return rail.childNodes.filter(function (n) { return n.className === 'timeline-entry'; }).length; }
    assert.strictEqual(count(), 40);
    var height = rail.scrollHeight; rail.scrollTop = 0; rail.emit('scroll');
    assert.strictEqual(count(), 80); assert.strictEqual(rail.scrollTop, rail.scrollHeight - height);
    rail.scrollTop = 0; rail.emit('scroll'); assert.strictEqual(count(), 85);
  });
  test('Roleta: folha antiga conserva a data conhecida e não inventa criação', function () {
    var storage = new h.Storage();
    storage.setItem('escrevaral.astra.v1.doc.antiga', JSON.stringify({ id: 'antiga', title: 'Antiga', text: 'preservar', updated: '2020-01-02T22:30:05.000Z', revision: 1, dismissed: [] }));
    var a = setup(storage); assert.ok(/criação desconhecida/.test(a.nodes['manuscript-date'].getAttribute('aria-label')));
    a.type('manuscrito', 'preservar e continuar'); a.flush();
    assert.strictEqual(a.archive()[0].created, '2020-01-02T22:30:05.000Z'); assert.strictEqual(a.archive()[0].createdApproximate, true);
    assert.strictEqual(a.nodes['manuscript-date'].getAttribute('datetime'), '2020-01-02T22:30:05.000Z');
  });

};
