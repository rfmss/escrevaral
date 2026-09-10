'use strict';
module.exports = function (h) {
  var a = h.assert, v = h.vault, E = h.E;
  function hits(lens, text) { return v.analyze(lens, text).findings; }
  var positives = [
    ['crase', 'À partir de amanhã, começo.', 'PTBR-CRA-001', 'À partir'],
    ['crase', 'A autora começou à escrever.', 'PTBR-CRA-001', 'à escrever'],
    ['crase', 'Entreguei o manuscrito à ela.', 'PTBR-CRA-002', 'à ela'],
    ['crase', 'Enviei as folhas às vocês.', 'PTBR-CRA-002', 'às vocês'],
    ['crase', '😀 Entreguei a\u0300 voce\u0302.', 'PTBR-CRA-002', 'a\u0300 voce\u0302'],
    ['concordancia', 'Houveram muitos problemas.', 'PTBR-CON-001', 'Houveram'],
    ['concordancia', 'Haviam cartas na mesa.', 'PTBR-CON-001', 'Haviam'],
    ['concordancia', 'Haverão novas palavras.', null, null],
    ['concordancia', 'Existe muitas pessoas aqui.', 'PTBR-CON-002', 'Existe'],
    ['concordancia', 'Existia três livros na mesa.', 'PTBR-CON-002', 'Existia'],
    ['concordancia', 'Devem haver vários problemas.', 'PTBR-CON-003', 'Devem haver'],
    ['concordancia', 'Podem haver cartas novas na mesa.', 'PTBR-CON-003', 'Podem haver'],
    ['concordancia', 'Deve existir muitos livros.', 'PTBR-CON-004', 'Deve existir'],
    ['concordancia', 'Poderia existir três opções.', 'PTBR-CON-004', 'Poderia existir'],
    ['concordancia', 'Fazem cinco anos que escrevo.', 'PTBR-CON-005', 'Fazem'],
    ['concordancia', 'Já faziam vinte dias que ela escrevia.', 'PTBR-CON-005', 'faziam'],
    ['concordancia', '😀. Fazem 10 anos que escrevo.', 'PTBR-CON-005', 'Fazem'],
    ['morfologia', 'para nós escrevermos', 'PTBR-MOR-003', 'escrevermos'],
    ['morfologia', 'sem eles revisarem', 'PTBR-MOR-003', 'revisarem'],
    ['morfologia', 'para tu cantares', 'PTBR-MOR-003', 'cantares'],
    ['morfologia', 'após vós lerdes', 'PTBR-MOR-003', 'lerdes'],
    ['morfologia', 'para cantar', 'PTBR-MOR-003', 'cantar'],
    ['morfologia', 'para eu escrever', 'PTBR-MOR-003', 'escrever']
  ];
  positives.forEach(function (c) {
    h.test('Maturação: recorte ' + c[1], function () {
      var fs = hits(c[0], c[1]), target = fs.filter(function (f) { return f.id === c[2]; });
      if (!c[2]) { a.strictEqual(fs.length, 0); return; }
      a.strictEqual(target.length, 1); a.strictEqual(target[0].snippet, c[3]);
      a.strictEqual(c[1].slice(target[0].start, target[0].end), c[3]);
      a.notStrictEqual(target[0].severity, 'erro');
      a.strictEqual(JSON.stringify(v.analyze(c[0], c[1])), JSON.stringify(v.analyze(c[0], c[1])));
    });
  });
  var negative = {
    crase: ['A partir de amanhã.', 'Vou a ela.', 'Escrevo à mão.', 'Voltei àquela casa.', 'Cheguei à uma hora.', 'Escrevo à Camões.', 'Entreguei à Maria.', 'Entreguei à sua mãe.', 'Entreguei a sua mãe.', 'Enviei à Ela, nome da revista.', '“à partir de amanhã”', '`à ela`', 'https://exemplo.test/à/ela', '— Entreguei à ela.', 'A expressão à partir de é discutida.', 'Não disse à ela.', 'cheguei à\nela', 'à elefante', 'à partir-de'],
    concordancia: ['Houve muitos problemas.', 'Havia cartas na mesa.', 'Existem muitos livros.', 'Podem existir três opções.', 'Deve haver muitos livros.', 'Faz cinco anos que escrevo.', 'Os autores haviam escrito os livros.', 'Haviam os autores chegado.', 'Houveram-se bem.', 'Eles fazem cinco anos de casamento.', 'Já fazem cinco anos de casamento.', 'Fazem cinco anos e saem da escola.', 'Tem muitos livros.', 'Têm livros na mesa.', '— Houveram muitos problemas.', '“Houveram muitos problemas.”', 'Houveram "muitos" problemas.', 'Existem? Existe possibilidades novas e antigas.', 'Houveram xyzs.', 'constructor muitos problemas.', 'constructor cinco anos que escrevo.', 'Houveram ônibus.', 'Disse que houveram muitos problemas.', 'Haviam cartas escritas pelos autores.', 'Existia um dos problemas.', 'Houveram muitos problemas que já foram resolvidos.'],
    morfologia: ['os cantares', 'para os cantares', 'quando nós cantarmos', 'se eles escreverem', 'para nós escrevermoss', 'para nós xyzarmos', 'para eles escrevermos', 'para\nrevisarmos', 'para “nós” revisarmos', 'para, revisarmos', 'sem os pareceres']
  };
  Object.keys(negative).forEach(function (lens) { negative[lens].forEach(function (text) {
    h.test('Maturação: abstenção ' + lens + ' / ' + text, function () {
      var fs = hits(lens, text); if (lens === 'morfologia') { fs = fs.filter(function (f) { return f.id === 'PTBR-MOR-003'; }); }
      a.strictEqual(fs.length, 0);
    });
  }); });
  h.test('Repetição: motivo com acentos, offsets e primeira ocorrência na evidência', function () {
    var text = '😀 Memória na mesa, memória na porta, memória no corpo.', f = hits('repeticao', text)[0];
    a.strictEqual(f.occurrences.length, 3); a.strictEqual(f.snippet, 'memória'); a.strictEqual(f.reference, null); a.strictEqual(f.severity, 'informação');
    f.occurrences.forEach(function (o) { a.strictEqual(text.slice(o.start, o.end).toLowerCase(), 'memória'); });
  });
  h.test('Repetição: nunca funde acentos, flexões, regiões protegidas ou parágrafos', function () {
    ['memoria memória memorias', 'porta portas portão', 'porque porque porque', 'memória memória\n\nmemória', 'memória memória “outra pessoa” memória', 'memória memória ' + new Array(42).join('a ') + 'memória'].forEach(function (t) { a.strictEqual(hits('repeticao', t).length, 0); });
    a.strictEqual(hits('repeticao', 'memória memo\u0301ria MEMÓRIA').length, 1);
  });
  h.test('Ritmo: contagem verificável sem julgamento de qualidade', function () {
    var text = 'Ela foi. A casa ficou aberta. Voltou.', f = hits('ritmo', text)[0];
    a.strictEqual(f.metrics.sentences, 3); a.strictEqual(f.metrics.words, 7); a.strictEqual(f.metrics.shortest, 1); a.strictEqual(f.metrics.longest, 4);
    a.strictEqual(f.reference, null); a.strictEqual(f.severity, 'informação');
    a.strictEqual(hits('ritmo', 'O Dr. Silva veio. Pagou 2.50 reais. Saiu.')[0].metrics.sentences, 3);
  });
  h.test('Triagem: amostras insuficientes não recebem sucesso vazio', function () {
    [['ritmo', 'Uma frase. Duas frases.'], ['ritmo', '“Uma.” Outra. Terceira.'], ['rima', 'amor e flor'], ['ortografia', ''], ['crase', '```à ela```']].forEach(function (c) {
      var r = v.analyze(c[0], c[1]); a.strictEqual(r.status, 'insuficiente'); a.strictEqual(r.findings.length, 0); a.ok(r.assessment.reason);
    });
    a.strictEqual(v.analyze('rima', 'amor\nflor').status, 'examinado');
    a.strictEqual(v.analyze('pontuacao', ',,').findings.length, 1);
  });
  h.test('Triagem: cada botão tem política, alcance e execução isolada', function () {
    var html = h.source('index.html'), ids = Array.from(html.matchAll(/data-lens="([^"]+)"/g), function (m) { return m[1]; });
    a.strictEqual(ids.length, 13);
    ids.forEach(function (id) { a.ok(E.lensPolicies[id]); a.ok(E.lensCatalog.some(function (p) { return p.id === id && p.scope && p.group; })); });
    a.ok(!/knowledge\.rules|builtin\(|protectedText|forms\[/.test(h.source('maquina/cofre.js')));
  });
  h.test('Novas lentes: teto, UTF-16 e preservação do conhecimento', function () {
    var before = JSON.stringify(E.maturationData);
    [['crase', 'à ela. '], ['concordancia', 'Houveram muitos problemas. '], ['repeticao', 'memória memória memória\n\n']].forEach(function (c) {
      var text = new Array(122).join(c[1]), r = v.analyze(c[0], text);
      a.strictEqual(r.findings.length, 100); a.strictEqual(r.limited, true);
      r.findings.forEach(function (f) { a.strictEqual(text.slice(f.start, f.end), f.snippet); });
    });
    a.strictEqual(JSON.stringify(E.maturationData), before);
  });
  h.test('Maturação funciona sem rede nem APIs modernas em todas as novas lentes', function () {
    var vm = require('vm'), ctx = {}; vm.createContext(ctx);
    vm.runInContext("this.fetch=function(){throw Error('Rede proibida');};this.XMLHttpRequest=fetch;this.WebSocket=fetch;this.Set=undefined;this.Map=undefined;this.Promise=undefined;String.prototype.normalize=undefined;String.prototype.includes=undefined;String.prototype.matchAll=undefined;Array.prototype.at=undefined;Object.assign=undefined;", ctx);
    Array.from(h.source('index.html').matchAll(/<script src="([^"]+)"><\/script>/g), function (m) { return m[1]; }).filter(function (f) { return f !== 'superficie/ponte.js'; }).forEach(function (f) { vm.runInContext(h.source(f), ctx); });
    var isolated = ctx.Escr.createVault(ctx.Escr.knowledge);
    [['crase', 'à ela'], ['concordancia', 'Houveram muitos problemas.'], ['morfologia', 'para nós escrevermos'], ['repeticao', 'memória memória memória'], ['ritmo', 'Ela veio. Ele voltou. A porta abriu.']].forEach(function (c) {
      a.ok(isolated.analyze(c[0], c[1]).findings.length > 0);
      a.strictEqual(JSON.stringify(isolated.analyze(c[0], c[1])), JSON.stringify(v.analyze(c[0], c[1])));
    });
  });
};
