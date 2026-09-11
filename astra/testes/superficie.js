/* Testes da ponte com DOM e relógio simulados. Não substituem navegador/dispositivo real. */
'use strict';
module.exports = function (h) {
  var test = h.test, assert = h.assert;
  function setup(storage, clockStart) {
    var clock = clockStart ? new Date(clockStart).getTime() : Date.now();
    function ClockDate(value) { return new Date(arguments.length ? value : clock); }
    ClockDate.parse = Date.parse; ClockDate.UTC = Date.UTC; ClockDate.now = function () { return clock; };
    var nodes = {}, timers = {}, nextTimer = 0, downloads = [], readers = [], events = {}, root, fakeDocument;
    function Node(tag) { this.tagName = tag; this.style = {}; this.childNodes = []; this.attributes = {}; this.handlers = {}; this.value = ''; this.hidden = false; this.disabled = false; this.checked = false; this._text = ''; this.files = []; this.scrollTop = 0; this.clientHeight = 180; this.offsetHeight = 44; if (tag === 'a') { this.download = ''; } }
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
    ['mesa', 'acervo', 'oficina', 'reset-dismissed', 'machine-shell', 'leave-focus'].forEach(function (id) { nodes[id].hidden = true; });
    nodes['timeline-list'].parentNode = new Node('div');
    nodes['timeline-toggle'].parentNode = new Node('div');
    nodes['timeline-toggle'].parentNode.parentNode = new Node('aside');
    var lenses = Array.from(html.matchAll(/data-lens="([^"]+)"/g), function (m) { var b = new Node('button'); b.setAttribute('data-lens', m[1]); return b; });
    fakeDocument = new Node('document'); fakeDocument.body = new Node('body'); fakeDocument.hidden = false;
    fakeDocument.getElementById = function (id) { assert.ok(nodes[id], id); return nodes[id]; };
    fakeDocument.querySelectorAll = function () { return lenses; };
    fakeDocument.createElement = function (tag) { return new Node(tag); };
    root = { Date: ClockDate, document: fakeDocument, navigator: {}, console: console, localStorage: storage || new h.Storage(),
      setTimeout: function (fn, delay) { nextTimer += 1; timers[nextTimer] = { fn: fn, delay: delay }; return nextTimer; },
      clearTimeout: function (id) { delete timers[id]; },
      addEventListener: function (name, fn) { events[name] = fn; },
      matchMedia: function () { return { addListener: function (fn) { events['print-media'] = fn; } }; },
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
      event: function (name, props) { if (events[name]) { events[name](props); } },
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
  test('Leitura: temas claro/escuro persistem e preferências antigas migram para claro', function () {
    var a = setup(); a.nodes['theme-dark'].click();
    assert.strictEqual(a.document.body.getAttribute('data-theme'), 'escuro');
    assert.strictEqual(a.nodes['theme-dark'].getAttribute('aria-pressed'), 'true');
    assert.strictEqual(a.nodes['theme-light'].getAttribute('aria-pressed'), 'false');
    var b = setup(a.storage); assert.strictEqual(b.document.body.getAttribute('data-theme'), 'escuro');
    b.nodes['theme-light'].click(); assert.strictEqual(setup(b.storage).document.body.getAttribute('data-theme'), 'claro');
    b.storage.setItem('escrevaral.astra.theme', 'roteiro'); assert.strictEqual(setup(b.storage).document.body.getAttribute('data-theme'), 'claro');
  });
  test('Leitura: foco é opcional, persiste e não altera o manuscrito', function () {
    var a = setup(); a.type('manuscrito', 'primeiro\n\nsegundo'); a.flush();
    a.nodes['focus-toggle'].click(); assert.strictEqual(a.nodes['focus-toggle'].getAttribute('aria-pressed'), 'false');
    var b = setup(a.storage); assert.strictEqual(b.nodes['focus-toggle'].getAttribute('aria-pressed'), 'false');
    assert.strictEqual(b.nodes.manuscrito.value, 'primeiro\n\nsegundo');
    b.nodes['focus-toggle'].click(); assert.strictEqual(b.nodes['focus-toggle'].getAttribute('aria-pressed'), 'true');
  });
  test('Leitura: limites do foco acompanham caret, parágrafo vazio e seleção entre parágrafos', function () {
    var source = h.source('superficie/ponte.js'), start = source.indexOf('  function paragraphBounds('), end = source.indexOf('  function textPosition(', start), context = {};
    h.vm.createContext(context); h.vm.runInContext(source.slice(start, end), context);
    var value = 'um\n\ndois\ntrês';
    function bounds(a, b) { return JSON.parse(JSON.stringify(context.paragraphBounds(value, a, b))); }
    assert.deepStrictEqual(bounds(0, 0), { start: 0, end: 2 });
    assert.deepStrictEqual(bounds(3, 3), { start: 3, end: 3 });
    assert.deepStrictEqual(bounds(5, 5), { start: 4, end: 8 });
    assert.deepStrictEqual(bounds(5, 11), { start: 4, end: 13 });
    assert.deepStrictEqual(bounds(99, 99), { start: 9, end: 13 });
  });
  test('Máquina de escrever: centraliza a linha e respeita seleção, composição e rolagem manual', function () {
    var source = h.source('superficie/ponte.js'), start = source.indexOf('  function cancelTypewriter('), end = source.indexOf('  function sizeWorkspace(', start), pending = null;
    var editor = { style: {}, clientHeight: 400, selectionStart: 40, selectionEnd: 40, scrollTop: 17 };
    var context = { aimMachineStrike: function () {}, machineEnabled: false, manuscript: editor, document: { activeElement: editor }, composing: false, typewriterTimer: null, focusMeasure: null,
      window: { getComputedStyle: function () { return { lineHeight: '40px', fontSize: '22px' }; }, clearTimeout: function () { pending = null; }, setTimeout: function (fn) { pending = fn; return 1; } },
      textPosition: function () { return { top: 980, line: 40 }; }, updateFocus: function () {} };
    h.vm.createContext(context); h.vm.runInContext(source.slice(start, end), context);
    context.typewriterInsets(); assert.strictEqual(editor.style.paddingTop, '148px'); assert.strictEqual(editor.style.paddingBottom, '212px');
    context.followTyping(); pending(); assert.strictEqual(editor.scrollTop, 832);
    editor.selectionEnd = 45; editor.scrollTop = 23; context.followTyping(); pending(); assert.strictEqual(editor.scrollTop, 23);
    editor.selectionEnd = 40; context.composing = true; context.followTyping(); assert.strictEqual(pending, null);
    context.composing = false; context.followTyping(); context.cancelTypewriter(); assert.strictEqual(pending, null);
    editor.scrollTop = 29; assert.strictEqual(editor.scrollTop, 29);
    context.document.activeElement = null; context.followTyping(); assert.strictEqual(pending, null);
    editor.clientHeight = 200; context.typewriterInsets(); assert.strictEqual(editor.style.paddingTop, '64px');
    context.document.activeElement = editor; context.textPosition = function () { return { top: 64, line: 40 }; }; context.centerTypingLine(); assert.strictEqual(editor.scrollTop, 0);
    context.machineEnabled = true; editor.clientHeight = 400; context.typewriterInsets();
    assert.strictEqual(editor.style.paddingTop, '148px'); assert.strictEqual(editor.style.paddingBottom, '212px');
    context.textPosition = function () { return { top: 148, line: 40 }; }; context.centerTypingLine(); assert.strictEqual(editor.scrollTop, 0);
  });
  test('Foco completo: entrar e sair preserva seleção, texto e destaque independente', function () {
    var a = setup(); a.type('titulo', 'A folha'); a.type('manuscrito', 'primeiro\n\nsegundo');
    a.nodes.manuscrito.setSelectionRange(2, 12); a.nodes.manuscrito.scrollTop = 70;
    a.nodes['immersion-toggle'].click();
    assert.strictEqual(a.document.body.getAttribute('data-immersion'), 'true');
    assert.strictEqual(a.nodes['leave-focus'].hidden, false);
    assert.strictEqual(a.document.activeElement, a.nodes.manuscrito);
    assert.strictEqual(a.nodes.manuscrito.selectionStart, 2); assert.strictEqual(a.nodes.manuscrito.selectionEnd, 12);
    assert.strictEqual(a.nodes.manuscrito.scrollTop, 70);
    a.flush(); assert.strictEqual(a.archive()[0].text, 'primeiro\n\nsegundo');
    a.document.emit('keydown', { keyCode: 27 });
    assert.strictEqual(a.document.body.getAttribute('data-immersion'), 'false');
    assert.strictEqual(a.nodes['leave-focus'].hidden, true);
    assert.strictEqual(a.nodes['focus-toggle'].getAttribute('aria-pressed'), 'true');
    assert.strictEqual(a.nodes.titulo.value, 'A folha');
    a.nodes['immersion-toggle'].click(); a.nodes['leave-focus'].click();
    assert.strictEqual(a.document.body.getAttribute('data-immersion'), 'false');
  });
  test('Foco completo: redimensionamento conserva trecho selecionado e cancela composição', function () {
    var a = setup(), editor = a.nodes.manuscrito;
    a.root.getComputedStyle = function () { return { lineHeight: '40px', fontSize: '22px', paddingTop: editor.style.paddingTop, paddingBottom: editor.style.paddingBottom }; };
    Object.defineProperty(editor, 'clientHeight', { get: function () { return a.document.body.getAttribute('data-immersion') === 'true' ? 600 : 400; } });
    editor.style.paddingTop = '148px'; editor.scrollTop = 70; editor.setSelectionRange(2, 12);
    a.nodes['immersion-toggle'].click(); a.flush(40);
    assert.strictEqual(editor.style.paddingTop, '232px'); assert.strictEqual(editor.style.paddingBottom, '328px');
    assert.strictEqual(editor.scrollTop, 154); assert.strictEqual(editor.selectionEnd, 12);
    a.nodes['leave-focus'].click(); a.flush(40); assert.strictEqual(editor.scrollTop, 70);
    editor.emit('compositionstart'); editor.setSelectionRange(2, 2); a.nodes['immersion-toggle'].click();
    assert.strictEqual(a.shortTimers(), 1); /* Só máscara, sem recentralização durante composição. */
  });
  test('Impressão: texto inteiro ainda não salvo, HTML literal e tema/foco preservados', function () {
    var a = setup(), value = '<script>literal</script>\n\n' + new Array(2001).join('Uma linha com acentuação.\n'), printed = 0;
    a.type('titulo', '<b>Título</b>'); a.type('manuscrito', value); a.nodes.manuscrito.setSelectionRange(4, 15);
    a.nodes['immersion-toggle'].click(); a.nodes['theme-dark'].click();
    a.root.print = function () { printed += 1; assert.strictEqual(a.nodes['print-text'].textContent, value); };
    a.nodes['print-document'].click(); assert.strictEqual(printed, 1);
    assert.strictEqual(a.nodes['print-title'].textContent, '<b>Título</b>');
    assert.strictEqual(a.nodes['print-text'].childNodes.length, 0);
    assert.strictEqual(a.document.body.getAttribute('data-theme'), 'escuro');
    assert.strictEqual(a.document.body.getAttribute('data-immersion'), 'true');
    assert.strictEqual(a.nodes.manuscrito.value, value); assert.strictEqual(a.nodes.manuscrito.selectionEnd, 15);
    a.event('afterprint'); assert.strictEqual(a.nodes['print-text'].textContent, '');
    a.type('manuscrito', 'última edição'); a.event('beforeprint'); assert.strictEqual(a.nodes['print-text'].textContent, 'última edição');
    a.event('print-media', { matches: false }); assert.strictEqual(a.nodes['print-text'].textContent, '');
    a.type('titulo', ''); a.type('manuscrito', 'impressão pelo menu antigo'); a.event('print-media', { matches: true });
    assert.strictEqual(a.nodes['print-text'].textContent, 'impressão pelo menu antigo'); assert.strictEqual(a.nodes['print-title'].hidden, true);
  });
  test('Acentos: composição conserva o parágrafo, inclusive com seleção transitória e rolagem', function () {
    ['claro', 'escuro'].forEach(function (theme) {
      [false, true].forEach(function (immersive) {
        var a = setup(), editor = a.nodes.manuscrito, create = a.document.createElement, measurements = 0;
        a.root.getComputedStyle = function () { return { lineHeight: '40px', fontSize: '22px', paddingTop: '0px', paddingBottom: '0px' }; };
        a.document.createElement = function (tag) {
          var node = create(tag);
          if (tag === 'span') { Object.defineProperty(node, 'offsetTop', { get: function () {
            measurements += 1;
            return (this.parentNode.textContent.match(/\n/g) || []).length * 40;
          } }); }
          return node;
        };
        a.nodes['theme-' + (theme === 'claro' ? 'light' : 'dark')].click();
        if (immersive) { a.nodes['immersion-toggle'].click(); }
        a.type('manuscrito', 'cima\n\nmeio\n\nbaixo'); editor.setSelectionRange(8, 8);
        a.flush(40); editor.scrollTop = 0; editor.emit('scroll');
        var before = a.nodes['focus-before'], after = a.nodes['focus-after'];
        assert.strictEqual(before.hidden, false); assert.strictEqual(before.style.height, '80px');
        assert.strictEqual(after.hidden, false); assert.strictEqual(after.style.top, '120px');
        ['~', '^', '´'].forEach(function (accent) {
          editor.emit('compositionstart', { data: '' }); var count = measurements;
          assert.strictEqual(before.hidden, false); assert.strictEqual(after.hidden, false);
          a.type('manuscrito', 'cima\n\nme' + accent + 'io\n\nbaixo');
          editor.setSelectionRange(0, 0); a.document.emit('selectionchange'); a.flush(40);
          assert.strictEqual(before.style.height, '80px'); assert.strictEqual(after.style.top, '120px');
          assert.strictEqual(measurements, count); /* Nenhuma medição do texto provisório. */
          editor.scrollTop = 20; editor.emit('scroll');
          assert.strictEqual(before.style.height, '60px'); assert.strictEqual(after.style.top, '100px');
          assert.strictEqual(measurements, count);
          editor.value = 'cima\n\nmão\n\nbaixo'; editor.setSelectionRange(9, 9);
          editor.emit('compositionend', { data: 'ã' });
          assert.strictEqual(before.hidden, false); assert.strictEqual(after.hidden, false);
          assert.strictEqual(editor.value, 'cima\n\nmão\n\nbaixo');
          a.flush(); assert.strictEqual(a.archive()[0].text, editor.value);
          editor.scrollTop = 0; editor.emit('scroll');
        });
        editor.emit('compositionstart'); a.nodes['focus-toggle'].click();
        assert.strictEqual(before.hidden, true); assert.strictEqual(after.hidden, true);
        editor.emit('compositionend', { data: '' }); a.flush(40);
        assert.strictEqual(before.hidden, true); assert.strictEqual(after.hidden, true);
      });
    });
  });
  test('Máquina antiga: capa opcional conserva folha, tema, seleção e foco anterior', function () {
    var a = setup(); a.type('titulo', 'O papel'); a.type('manuscrito', 'texto meu'); a.nodes.manuscrito.setSelectionRange(2, 5);
    a.nodes['theme-dark'].click(); assert.strictEqual(a.nodes['machine-shell'].hidden, true);
    a.nodes['mesa-toggle'].click(); a.nodes['machine-toggle'].click();
    assert.strictEqual(a.nodes.mesa.hidden, true); assert.strictEqual(a.nodes['machine-shell'].hidden, false);
    assert.strictEqual(a.document.body.getAttribute('data-machine'), 'true');
    assert.strictEqual(a.document.body.getAttribute('data-immersion'), 'true');
    assert.strictEqual(a.nodes.manuscrito.selectionStart, 2); assert.strictEqual(a.nodes.manuscrito.selectionEnd, 5);
    assert.strictEqual(a.nodes.som.checked, false);
    a.type('manuscrito', 'texto meu, na máquina'); a.flush();
    a.document.emit('keydown', { keyCode: 27 });
    assert.strictEqual(a.nodes['machine-shell'].hidden, true);
    assert.strictEqual(a.document.body.getAttribute('data-immersion'), 'false');
    assert.strictEqual(a.document.body.getAttribute('data-theme'), 'escuro');
    assert.strictEqual(a.nodes.manuscrito.value, 'texto meu, na máquina'); assert.strictEqual(a.nodes.titulo.value, 'O papel');
    assert.strictEqual(a.archive()[0].text, 'texto meu, na máquina');
    a.nodes['immersion-toggle'].click(); a.nodes['machine-toggle'].click(); a.nodes['leave-focus'].click();
    assert.strictEqual(a.document.body.getAttribute('data-machine'), 'false');
    assert.strictEqual(a.document.body.getAttribute('data-immersion'), 'true');
    a.nodes['leave-focus'].click(); assert.strictEqual(a.document.body.getAttribute('data-immersion'), 'false');
  });
  test('Máquina antiga: golpe limitado, composição sem movimento e Escape respeita acento', function () {
    var a = setup(); a.nodes['machine-toggle'].click();
    a.type('manuscrito', 'ma'); assert.strictEqual(a.nodes['machine-hammer'].getAttribute('data-strike'), 'true');
    for (var i = 0; i < 10; i += 1) { a.type('manuscrito', 'ma' + i); }
    assert.strictEqual(a.shortTimers(), 1); a.flush(90);
    assert.strictEqual(a.nodes['machine-hammer'].getAttribute('data-strike'), 'false');
    a.nodes.manuscrito.emit('compositionstart'); a.type('manuscrito', 'ma~');
    assert.strictEqual(a.nodes['machine-hammer'].getAttribute('data-strike'), 'false');
    a.document.emit('keydown', { keyCode: 27 });
    assert.strictEqual(a.document.body.getAttribute('data-machine'), 'true');
    a.nodes.manuscrito.value = 'mão'; a.nodes.manuscrito.emit('compositionend');
    assert.strictEqual(a.nodes['machine-hammer'].getAttribute('data-strike'), 'true');
    a.nodes.manuscrito.emit('blur'); assert.strictEqual(a.nodes['machine-hammer'].getAttribute('data-strike'), 'false');
    a.type('manuscrito', 'mão nova'); a.document.hidden = true; a.document.emit('visibilitychange');
    assert.strictEqual(a.nodes['machine-hammer'].getAttribute('data-strike'), 'false');
    a.document.hidden = false; a.nodes['leave-focus'].click();
    assert.strictEqual(a.shortTimers(), 0); assert.strictEqual(a.nodes.manuscrito.value, 'mão nova');
  });
  test('Máquina antiga: carro limitado, retorno por Enter e colagem intacta', function () {
    var a = setup(), editor = a.nodes.manuscrito, paper = a.nodes['writing-paper'];
    a.nodes['machine-toggle'].click();
    for (var i = 0; i < 60; i += 1) { a.type('manuscrito', editor.value + 'a'); }
    assert.strictEqual(paper.style.transform, 'translate(-6px,0px)');
    editor.setSelectionRange(61, 61); a.type('manuscrito', editor.value + '\n');
    assert.strictEqual(paper.style.transform, 'translate(0px,-3px)');
    assert.strictEqual(a.nodes['machine-platen'].getAttribute('data-feed'), 'true');
    a.flush(120); assert.strictEqual(paper.style.transform, 'translate(0px,0px)');
    var pasted = editor.value + '<b>mão</b>\ntexto colado'; a.type('manuscrito', pasted);
    assert.strictEqual(editor.value, pasted); assert.strictEqual(paper.style.transform, 'translate(-0.75px,0px)');
    a.type('manuscrito', pasted.slice(0, -1)); assert.strictEqual(paper.style.transform, 'translate(0px,0px)');
    a.nodes['leave-focus'].click(); assert.strictEqual(paper.style.transform, '');
    a.flush(); assert.strictEqual(a.archive()[0].text, pasted.slice(0, -1));
  });
  test('Carimbo: haste encontra a linha visível sem medir novamente o texto', function () {
    var source = h.source('superficie/ponte.js'), start = source.indexOf('  function aimMachineStrike('), end = source.indexOf('  function machineStrike(', start);
    var hammer = { style: {} }, strikes = 0, stopped = 0, shell = { getBoundingClientRect: function () { return { left: 0, top: 0, right: 1000, bottom: 700 }; } };
    var ctx = { manuscript: { scrollTop: 500, scrollLeft: 0, getBoundingClientRect: function () { return { left: 50, top: 12 }; } }, byId: function (id) { return id === 'machine-shell' ? shell : hammer; }, machinePendingStrike: true, machineStrike: function () { strikes += 1; }, stopMachineStrike: function () { stopped += 1; } };
    h.vm.createContext(ctx); h.vm.runInContext(source.slice(start, end), ctx);
    ctx.aimMachineStrike({ top: 800, left: 230, line: 40 });
    assert.strictEqual(hammer.style.left, '280px'); assert.strictEqual(hammer.style.top, '332px'); assert.strictEqual(hammer.style.height, '356px'); assert.strictEqual(strikes, 1);
    ctx.aimMachineStrike({ top: 800, left: 240, line: 40 }); assert.strictEqual(strikes, 1);
    ctx.aimMachineStrike({ top: 1500, left: 240, line: 40 }); assert.strictEqual(stopped, 1);
  });
  test('Máquina antiga: impressão usa só o texto atual e não desmonta o modo', function () {
    var a = setup(); a.type('titulo', 'Acentos'); a.nodes['machine-toggle'].click(); a.type('manuscrito', 'órgão\n\nmão');
    a.event('beforeprint'); assert.strictEqual(a.nodes['print-text'].textContent, 'órgão\n\nmão');
    assert.strictEqual(a.nodes['print-title'].textContent, 'Acentos');
    a.event('afterprint'); assert.strictEqual(a.nodes['print-text'].textContent, '');
    assert.strictEqual(a.document.body.getAttribute('data-machine'), 'true');
    assert.strictEqual(a.nodes.manuscrito.value, 'órgão\n\nmão');
  });
  test('Pastas: meses e dias organizam notas sem trocar a folha aberta', function () {
    var a = setup(null, '2026-08-31T22:30:05'); a.type('titulo', 'Agosto'); a.type('manuscrito', 'mar'); a.flush();
    a.setTime('2026-09-10T09:15:20'); a.nodes['timeline-new'].click(); a.type('titulo', 'Setembro'); a.type('manuscrito', 'vento'); a.flush();
    a.button(a.nodes['date-path'], 'Meses').click();
    var folders = a.nodes['timeline-list'].childNodes; assert.strictEqual(folders.length, 2);
    folders.filter(function (n) { return n.textContent.indexOf('agosto') === 0; })[0].click();
    assert.strictEqual(a.nodes.manuscrito.value, 'vento');
    a.nodes['timeline-list'].childNodes[0].click();
    var notes = a.nodes['timeline-list'].childNodes.filter(function (n) { return n.className === 'timeline-entry'; });
    assert.strictEqual(notes.length, 1); assert.strictEqual(notes[0].getAttribute('title'), 'Agosto');
    assert.strictEqual(a.nodes.manuscrito.value, 'vento'); notes[0].click(); assert.strictEqual(a.nodes.manuscrito.value, 'mar');
  });
  test('Busca: título e texto de todas as datas, acentos e retorno à pasta anterior', function () {
    var a = setup(null, '2026-08-31T22:30:05'); a.type('titulo', 'Memória'); a.type('manuscrito', 'coração no mar'); a.flush();
    a.setTime('2026-09-10T09:15:20'); a.nodes['timeline-new'].click(); a.type('titulo', 'Setembro'); a.type('manuscrito', 'vento'); a.flush();
    a.type('note-search', 'CORACAO'); a.flush(150);
    var list = a.nodes['timeline-list']; assert.strictEqual(list.childNodes.length, 1); assert.strictEqual(list.childNodes[0].getAttribute('title'), 'Memória');
    assert.strictEqual(a.nodes.manuscrito.value, 'vento');
    a.type('note-search', 'memoria'); a.flush(150); assert.strictEqual(list.childNodes.length, 1);
    a.nodes['clear-search'].click(); assert.strictEqual(list.childNodes.length, 1); assert.strictEqual(list.childNodes[0].getAttribute('title'), 'Setembro');
    a.type('note-search', 'inexistente'); a.flush(150); assert.strictEqual(list.childNodes.length, 0); assert.strictEqual(a.nodes['navigator-status'].textContent, 'Nenhuma nota encontrada.');
  });
  test('Seleção: A → B → salvar B → A conserva um único marcador e os textos corretos', function () {
    var a = setup(null, '2026-09-10T09:15:20'); a.type('titulo', 'A'); a.type('manuscrito', 'primeiro'); a.flush();
    a.setTime('2026-09-10T09:15:50'); a.nodes['timeline-new'].click(); a.type('titulo', 'B'); a.type('manuscrito', 'segundo'); a.flush();
    function entries() { return a.nodes['timeline-list'].childNodes.filter(function (n) { return n.className === 'timeline-entry'; }); }
    function open(name) { entries().filter(function (n) { return n.getAttribute('title') === name; })[0].click(); }
    function selected(name) { var current = entries().filter(function (n) { return n.getAttribute('aria-current') === 'true'; }); assert.strictEqual(current.length, 1); assert.strictEqual(current[0].getAttribute('title'), name); }
    open('A'); selected('A'); open('B'); a.type('manuscrito', 'segundo revisto'); a.flush(); selected('B');
    open('A'); selected('A'); assert.strictEqual(a.nodes.manuscrito.value, 'primeiro'); open('B'); selected('B'); assert.strictEqual(a.nodes.manuscrito.value, 'segundo revisto');
    assert.strictEqual(a.nodes['manuscript-date'].getAttribute('datetime'), new Date('2026-09-10T09:15:50').toISOString());
  });
  test('Busca: inclui a edição ainda não gravada e não troca notas ao rolar', function () {
    var a = setup(); a.type('titulo', 'Rascunho'); a.type('manuscrito', 'palavra nova');
    a.type('note-search', 'palavra nova'); a.flush(150);
    assert.strictEqual(a.archive().length, 0); assert.strictEqual(a.nodes['timeline-list'].childNodes.length, 1);
    a.nodes['timeline-list'].scrollTop = 30; a.nodes['timeline-list'].emit('scroll'); assert.strictEqual(a.nodes.manuscrito.value, 'palavra nova');
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
    a.nodes.tema.value = 'roteiro'; a.nodes.tema.emit('change'); assert.strictEqual(a.document.body.getAttribute('data-theme'), 'claro');
    var b = setup(a.storage); assert.strictEqual(b.document.body.getAttribute('data-theme'), 'claro');
  });
  test('Ponte: cronologia abre a folha escolhida e preserva escrita antes de trocar', function () {
    var a = setup();
    function entries() { return a.nodes['timeline-list'].childNodes.filter(function (n) { return n.className === 'timeline-entry'; }); }
    assert.strictEqual(a.document.body.getAttribute('data-theme'), 'claro');
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
  test('Ponte: análise insuficiente explica o motivo, e digitar não reanalisa', function () {
    var a = setup(); a.type('manuscrito', 'Uma única frase.');
    a.lenses.filter(function (b) { return b.getAttribute('data-lens') === 'ritmo'; })[0].click(); a.flush(20);
    assert.ok(/três frases/.test(a.nodes['analysis-status'].textContent));
    assert.ok(/não mede qualidade/.test(a.nodes['analysis-coverage'].textContent));
    a.type('manuscrito', 'Uma frase. Outra frase. Mais uma.'); a.flush();
    assert.strictEqual(a.nodes.findings.childNodes.length, 0);
  });
  test('Ponte: as lentes adicionais são acionadas explicitamente e preservam a folha', function () {
    var a = setup(), samples = { decolonial: 'um cabelo ruim', expressoes: 'subir para cima', rima: 'amor\nflor', metrica: 'o amor', morfologia: 'Eu leio', sintaxe: 'A escritora leu o livro ontem.', crase: 'à ela', concordancia: 'Houveram muitos problemas.', repeticao: 'memória memória memória', ritmo: 'Ela veio. Ele voltou. A porta abriu.' };
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
