/* Calculadora Editorial Flutuante (4 modos: Conta, Páginas/Laudas, Orçamento, Tempo) — ES5 estrito */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  function on(el, ev, fn) { if (el && el.addEventListener) { el.addEventListener(ev, fn, false); } }

  // Parser aritmético recursivo puro (zero eval / Function)
  function evalExpr(raw) {
    var src = String(raw || '').replace(/\s+/g, '').replace(/,/g, '.').replace(/\u00D7/g, '*').replace(/\u00F7/g, '/').replace(/\u2212/g, '-');
    if (!src) { throw new Error('Digite uma conta para calcular.'); }
    if (src.length > 160) { throw new Error('Use uma conta de at\u00E9 160 caracteres.'); }
    if (/[^0-9.+\-*/()]/.test(src)) { throw new Error('Use apenas n\u00FAmeros, par\u00EAnteses e os sinais + - \u00D7 \u00F7.'); }

    var pos = 0;
    function parseExpr() {
      var left = parseTerm();
      while (pos < src.length && (src.charAt(pos) === '+' || src.charAt(pos) === '-')) {
        var op = src.charAt(pos); pos += 1;
        var right = parseTerm();
        left = op === '+' ? left + right : left - right;
      }
      return left;
    }
    function parseTerm() {
      var left = parseFactor();
      while (pos < src.length && (src.charAt(pos) === '*' || src.charAt(pos) === '/')) {
        var op = src.charAt(pos); pos += 1;
        var right = parseFactor();
        if (op === '/') {
          if (right === 0) { throw new Error('N\u00E3o \u00E9 poss\u00EDvel dividir por zero.'); }
          left = left / right;
        } else {
          left = left * right;
        }
      }
      return left;
    }
    function parseFactor() {
      if (pos < src.length && src.charAt(pos) === '+') { pos += 1; return parseFactor(); }
      if (pos < src.length && src.charAt(pos) === '-') { pos += 1; return -parseFactor(); }
      if (pos < src.length && src.charAt(pos) === '(') {
        pos += 1;
        var val = parseExpr();
        if (src.charAt(pos) !== ')') { throw new Error('Feche os par\u00EAnteses da conta.'); }
        pos += 1;
        return val;
      }
      var start = pos;
      var dots = 0;
      while (pos < src.length && ((src.charAt(pos) >= '0' && src.charAt(pos) <= '9') || src.charAt(pos) === '.')) {
        if (src.charAt(pos) === '.') { dots += 1; }
        pos += 1;
      }
      if (pos === start || dots > 1 || src.slice(start, pos) === '.') {
        throw new Error('Confira os n\u00FAmeros da conta.');
      }
      var num = Number(src.slice(start, pos));
      if (!isFinite(num)) { throw new Error('N\u00FAmero inv\u00E1lido.'); }
      return num;
    }
    var res = parseExpr();
    if (pos !== src.length || !isFinite(res) || Math.abs(res) > 9007199254740991) {
      throw new Error('Express\u00E3o inv\u00E1lida ou grande demais.');
    }
    // Elimina ruído clássico de ponto flutuante (ex: 0.1 + 0.2)
    return Math.round(res * 1e10) / 1e10;
  }

  function parseNumber(val, label, positive) {
    var txt = String(val || '').replace(/^\s+|\s+$/g, '');
    if (!txt || txt.length > 24 || !/^\d+(?:[.,]\d+)?$/.test(txt)) {
      throw new Error('Preencha \u201C' + label + '\u201D com um n\u00FAmero, sem separador de milhares.');
    }
    var n = Number(txt.replace(',', '.'));
    if (!isFinite(n) || n > 1e12 || (positive && n <= 0)) {
      throw new Error('Confira \u201C' + label + '\u201D: use um valor ' + (positive ? 'maior que zero' : 'v\u00E1lido') + '.');
    }
    return n;
  }

  function fmtNum(v) {
    try {
      if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
        return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 }).format(v);
      }
    } catch (ignore) {}
    return String(Math.round(v * 10000) / 10000).replace('.', ',');
  }

  function fmtMoney(v) {
    try {
      if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
      }
    } catch (ignore) {}
    return 'R$ ' + v.toFixed(2).replace('.', ',');
  }

  function roundUp(v) {
    var nearest = Math.round(v);
    if (nearest > 0 && Math.abs(v - nearest) <= 1e-11 * Math.max(1, v)) { return nearest; }
    return Math.ceil(v);
  }

  var mathApi = {
    calculate: function (expr) {
      var val = evalExpr(expr);
      return { value: val, text: String(val).replace('.', ','), detail: '' };
    },
    pages: function (opts) {
      var unit = opts && opts.unit === 'characters' ? 'characters' : 'words';
      var total = parseNumber(opts && opts.amount, unit === 'characters' ? 'Caracteres com espa\u00E7os' : 'Palavras', false);
      var per = parseNumber(opts && opts.perPage, unit === 'characters' ? 'Caracteres por lauda' : 'Palavras por p\u00E1gina', true);
      var value = total / per;
      var noun = unit === 'characters' ? 'laudas' : 'p\u00E1ginas';
      return {
        value: value,
        text: fmtNum(value) + ' ' + noun,
        detail: 'Arredondando para cima: ' + fmtNum(roundUp(value)) + '. Estimativa; a diagrama\u00E7\u00E3o altera a pagina\u00E7\u00E3o.'
      };
    },
    budget: function (opts) {
      var qty = parseNumber(opts && opts.quantity, 'Quantidade', false);
      var rate = parseNumber(opts && opts.rate, 'Valor por unidade', false);
      var value = qty * rate;
      return {
        value: value,
        text: fmtMoney(value),
        detail: 'Quantidade \u00D7 valor por unidade. Sem impostos ou despesas adicionais.'
      };
    },
    time: function (opts) {
      var amount = parseNumber(opts && opts.amount, 'Palavras a trabalhar', false);
      var pace = parseNumber(opts && opts.pace, 'Palavras por hora', true);
      var daily = parseNumber(opts && opts.daily, 'Horas por dia', true);
      if (daily > 24) { throw new Error('Horas por dia deve ser no m\u00E1ximo 24.'); }
      var hours = amount / pace;
      var mins = roundUp(hours * 60);
      var days = roundUp(hours / daily);
      return {
        value: hours,
        text: fmtNum(Math.floor(mins / 60)) + ' h ' + (mins % 60) + ' min',
        detail: fmtNum(days) + ' dia(s) de trabalho a ' + fmtNum(daily) + ' h/dia.'
      };
    }
  };

  root.Escr.calculatorMath = mathApi;

  root.Escr.mountCalculator = function (opts) {
    opts = opts || {};
    var getCounts = opts.getCounts || function () { return { words: 0, characters: 0 }; };
    var el = null;
    var activeTab = 'conta';
    var state = {
      expr: '',
      unit: 'words',
      amount: '1000',
      perPage: '250',
      quantity: '10',
      rate: '45,00',
      tAmount: '5000',
      tPace: '500',
      tDaily: '2',
      resultText: '',
      resultDetail: '',
      errorText: ''
    };

    function createEl(tag, cls, txt) {
      var n = document.createElement(tag);
      if (cls) { n.className = cls; }
      if (typeof txt === 'string') { n.textContent = txt; }
      return n;
    }

    function ensureEl() {
      if (el || typeof document === 'undefined' || !document.body) { return el; }
      el = createEl('section', 'esc-calculator');
      el.id = 'esc-calculator';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-label', 'Calculadora editorial');
      el.hidden = true;
      document.body.appendChild(el);
      on(document, 'keydown', function (ev) {
        if (ev.keyCode === 27 && el && !el.hidden) { close(); }
      });
      return el;
    }

    function makeDraggable(handle) {
      var dragging = false, ox = 0, oy = 0;
      on(handle, 'mousedown', function (ev) {
        if (ev.target && ev.target.tagName === 'BUTTON') { return; }
        dragging = true;
        var rect = el.getBoundingClientRect ? el.getBoundingClientRect() : { left: 80, top: 80 };
        ox = ev.clientX - rect.left;
        oy = ev.clientY - rect.top;
      });
      on(document, 'mousemove', function (ev) {
        if (!dragging || !el) { return; }
        el.style.right = 'auto';
        el.style.left = Math.max(8, Math.min((window.innerWidth || 1000) - 340, ev.clientX - ox)) + 'px';
        el.style.top = Math.max(44, Math.min((window.innerHeight || 700) - 120, ev.clientY - oy)) + 'px';
      });
      on(document, 'mouseup', function () { dragging = false; });
    }

    function compute() {
      state.errorText = '';
      try {
        var r;
        if (activeTab === 'conta') { r = mathApi.calculate(state.expr); }
        else if (activeTab === 'paginas') { r = mathApi.pages({ amount: state.amount, perPage: state.perPage, unit: state.unit }); }
        else if (activeTab === 'orcamento') { r = mathApi.budget({ quantity: state.quantity, rate: state.rate }); }
        else { r = mathApi.time({ amount: state.tAmount, pace: state.tPace, daily: state.tDaily }); }
        state.resultText = r.text;
        state.resultDetail = r.detail || '';
      } catch (e) {
        state.resultText = '';
        state.resultDetail = '';
        state.errorText = e && e.message ? e.message : 'Erro no c\u00E1lculo.';
      }
      render();
    }

    function render() {
      if (!el || el.hidden) { return; }
      el.textContent = '';

      var head = createEl('header', 'esc-calc-head');
      head.appendChild(createEl('strong', '', 'Calculadora editorial'));
      var closeBtn = createEl('button', 'esc-calc-close', '\u00D7');
      closeBtn.type = 'button';
      closeBtn.setAttribute('aria-label', 'Fechar calculadora');
      on(closeBtn, 'click', close);
      head.appendChild(closeBtn);
      el.appendChild(head);
      makeDraggable(head);

      var tabs = createEl('div', 'esc-calc-tabs');
      tabs.setAttribute('role', 'tablist');
      [['conta', 'Conta'], ['paginas', 'P\u00E1ginas'], ['orcamento', 'Or\u00E7amento'], ['tempo', 'Tempo']].forEach(function (pair) {
        var b = createEl('button', 'esc-calc-tab', pair[1]);
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', activeTab === pair[0] ? 'true' : 'false');
        on(b, 'click', function () {
          activeTab = pair[0];
          state.errorText = '';
          state.resultText = '';
          state.resultDetail = '';
          render();
        });
        tabs.appendChild(b);
      });
      el.appendChild(tabs);

      var form = createEl('form', 'esc-calc-body');
      on(form, 'submit', function (ev) { ev.preventDefault(); compute(); });

      function field(labelTxt, val, onChange, ph) {
        var l = createEl('label', 'esc-calc-field');
        l.appendChild(createEl('span', '', labelTxt));
        var inp = createEl('input');
        inp.type = 'text';
        inp.value = val;
        if (ph) { inp.placeholder = ph; }
        on(inp, 'input', function () { onChange(inp.value); });
        l.appendChild(inp);
        return l;
      }

      if (activeTab === 'conta') {
        form.appendChild(field('Express\u00E3o', state.expr, function (v) { state.expr = v; }, 'Ex.: (120 + 45) * 2'));
        var pad = createEl('div', 'esc-calc-pad');
        ['7','8','9','\u00F7','4','5','6','\u00D7','1','2','3','-','0',',','C','+'].forEach(function (k) {
          var kb = createEl('button', 'esc-calc-key', k);
          kb.type = 'button';
          on(kb, 'click', function () {
            if (k === 'C') { state.expr = ''; state.resultText = ''; state.errorText = ''; }
            else { state.expr += k; }
            render();
          });
          pad.appendChild(kb);
        });
        form.appendChild(pad);
      } else if (activeTab === 'paginas') {
        var uRow = createEl('div', 'esc-calc-unit-row');
        [['words', 'Palavras \u2192 p\u00E1ginas'], ['characters', 'Caracteres \u2192 laudas']].forEach(function (p) {
          var ub = createEl('button', 'esc-filter-chip', p[1]);
          ub.type = 'button';
          ub.setAttribute('aria-pressed', state.unit === p[0] ? 'true' : 'false');
          on(ub, 'click', function () {
            state.unit = p[0];
            state.perPage = p[0] === 'characters' ? '2100' : '250';
            render();
          });
          uRow.appendChild(ub);
        });
        form.appendChild(uRow);
        var useDocBtn = createEl('button', 'esc-item-act', 'Usar contagem do texto aberto');
        useDocBtn.type = 'button';
        on(useDocBtn, 'click', function () {
          var c = getCounts();
          state.amount = String(state.unit === 'characters' ? (c.characters || 0) : (c.words || 0));
          compute();
        });
        form.appendChild(useDocBtn);
        form.appendChild(field(state.unit === 'characters' ? 'Caracteres com espa\u00E7os' : 'Palavras', state.amount, function (v) { state.amount = v; }));
        form.appendChild(field(state.unit === 'characters' ? 'Caracteres por lauda' : 'Palavras por p\u00E1gina', state.perPage, function (v) { state.perPage = v; }));
      } else if (activeTab === 'orcamento') {
        form.appendChild(field('Quantidade (palavras / laudas / p\u00E1ginas)', state.quantity, function (v) { state.quantity = v; }));
        form.appendChild(field('Valor por unidade (R$)', state.rate, function (v) { state.rate = v; }));
      } else {
        form.appendChild(field('Palavras a trabalhar', state.tAmount, function (v) { state.tAmount = v; }));
        form.appendChild(field('Ritmo (palavras por hora)', state.tPace, function (v) { state.tPace = v; }));
        form.appendChild(field('Horas por dia', state.tDaily, function (v) { state.tDaily = v; }));
      }

      var submitBtn = createEl('button', 'esc-btn-primary esc-calc-submit', 'Calcular');
      submitBtn.type = 'submit';
      form.appendChild(submitBtn);

      if (state.errorText) {
        form.appendChild(createEl('p', 'esc-inline-err', state.errorText));
      } else if (state.resultText) {
        var out = createEl('div', 'esc-calc-result');
        out.appendChild(createEl('strong', '', state.resultText));
        if (state.resultDetail) { out.appendChild(createEl('p', '', state.resultDetail)); }
        form.appendChild(out);
      }

      el.appendChild(form);
    }

    function open() {
      ensureEl();
      if (!el) { return; }
      el.hidden = false;
      render();
    }
    function close() {
      if (el) { el.hidden = true; }
    }

    return {
      open: open,
      close: close,
      toggle: function () { if (el && !el.hidden) { close(); } else { open(); } },
      isOpen: function () { return !!(el && !el.hidden); }
    };
  };
}(typeof window !== 'undefined' ? window : this));
