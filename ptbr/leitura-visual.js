/* Leitura anotada. Apenas apresentação de findings; não executa motores nem edita texto. ES5. */
(function (root) {
  'use strict';
  var E = root.Escr, D = root.document, serial = 0;
  if (!E || !D) { return; }
  function el(tag, parent, cls, text) {
    var n = D.createElement(tag); n.className = cls || '';
    if (typeof text === 'string') { n.textContent = text; }
    if (parent) { parent.appendChild(n); } return n;
  }
  function svgEl(tag, parent, attrs, text) {
    var n = D.createElementNS ? D.createElementNS('http://www.w3.org/2000/svg', tag) : D.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, String(attrs[k])); });
    }
    if (typeof text === 'string') { n.textContent = text; }
    if (parent) { parent.appendChild(n); }
    return n;
  }
  function valid(s, f) { return f && typeof f.start === 'number' && typeof f.end === 'number' && f.start >= 0 && f.end > f.start && f.end <= s.length && s.slice(f.start, f.end) === f.snippet; }
  function cleanClassName(raw) {
    if (!raw) { return ''; }
    return String(raw).replace(/\s*\(UD\)/gi, '').replace(/^\s+|\s+$/g, '');
  }
  function label(f) {
    var c = f.candidates && f.candidates.classes || [];
    if (f.analysisStatus === 'contextual') { return cleanClassName(f.feature); }
    if (f.analysisStatus === 'desconhecido') { return 'fora do acervo'; }
    if (f.analysisStatus === 'ambiguo') { return 'ver contexto'; }
    if (f.analysisStatus === 'lexical') { return cleanClassName(c[0] || 'classe'); }
    return f.feature || 'observação';
  }
  function normalizeClassKey(cls) {
    if (!cls) { return 'incerta'; }
    return String(cls).replace(/\s*\(UD\)/gi, '').toLowerCase().replace(/^\s+|\s+$/g, '').replace(/[áàâã]/g, 'a').replace(/[éê]/g, 'e').replace(/[í]/g, 'i').replace(/[óôõ]/g, 'o').replace(/[ú]/g, 'u').replace(/ç/g, 'c');
  }
  function classDisplayName(key) {
    var names = {
      substantivo: 'Substantivo', verbo: 'Verbo', adjetivo: 'Adjetivo', adverbio: 'Advérbio',
      artigo: 'Artigo', pronome: 'Pronome', preposicao: 'Preposição', conjuncao: 'Conjunção',
      numeral: 'Numeral', interjeicao: 'Interjeição', determinante: 'Determinante', 'locucao verbal': 'Locução verbal',
      incerta: 'Depende do contexto'
    };
    return names[key] || (key.charAt(0).toUpperCase() + key.slice(1));
  }
  function syntaxRoleKey(feature) {
    var s = String(feature || '').toLowerCase();
    if (s.indexOf('sujeito') !== -1) { return 'sujeito'; }
    if (s.indexOf('verbo') !== -1 || s.indexOf('verbal') !== -1 || s.indexOf('locução') !== -1) { return 'verbo'; }
    if (s.indexOf('indireto') !== -1) { return 'indireto'; }
    if (s.indexOf('agente') !== -1) { return 'agente'; }
    if (s.indexOf('aposto') !== -1) { return 'aposto'; }
    if (s.indexOf('vocativo') !== -1) { return 'vocativo'; }
    if (s.indexOf('objeto') !== -1 || s.indexOf('complemento') !== -1 || s.indexOf('predicativo') !== -1) { return 'objeto'; }
    if (s.indexOf('conjunç') !== -1) { return 'conjuncao'; }
    if (s.indexOf('adjunto') !== -1 || s.indexOf('advérb') !== -1 || s.indexOf('negaç') !== -1) { return 'adjunto'; }
    if (s.indexOf('predicado') !== -1) { return 'predicado'; }
    return 'outro';
  }

  /* 1. Análise sintática frase a frase, em ordem natural, com setas SVG rotuladas (estilo displaCy editorial) */
  function syntaxMap(parent, options) {
    var snapshot = options.snapshot;
    var arr = options.findings.filter(function (f) { return valid(snapshot, f) && valid(snapshot, f.clause); });
    var uid = 'ptbr-reading-' + (++serial), dead = false, timer = null, active = null, buttons = {}, groups = {}, order = [];
    var stepMode = false, stepIndex = 0;

    var box = el('div', parent, 'ptbr-reading'), main = el('div', box, 'ptbr-reading-paper');
    el('p', main, 'ptbr-overline', 'RELAÇÕES DA ORAÇÃO · FRASE POR FRASE');
    el('p', main, 'ptbr-reading-help', 'Os termos aparecem na ordem exata da sua frase. Clique em qualquer bloco colorido para ver as setas de relação e a explicação.');

    arr.forEach(function (f) {
      var key = '$' + f.clause.start;
      if (!groups[key]) { groups[key] = { items: [], clause: f.clause }; order.push(key); }
      groups[key].items.push(f);
    });
    order.sort(function (a, b) { return groups[a].clause.start - groups[b].clause.start; });

    /* Navegação frase-a-frase quando houver 2+ construções */
    var navCounter = null, btnPrev = null, btnNext = null, btnAll = null, btnOne = null;
    if (order.length > 1) {
      var nav = el('div', main, 'ptbr-syntax-nav');
      btnAll = el('button', nav, 'ptbr-nav-pill', 'Todas (' + order.length + ')');
      btnAll.type = 'button'; btnAll.setAttribute('aria-pressed', 'true');
      btnOne = el('button', nav, 'ptbr-nav-pill', 'Uma frase por vez');
      btnOne.type = 'button'; btnOne.setAttribute('aria-pressed', 'false');
      btnPrev = el('button', nav, 'ptbr-nav-pill', '← Anterior');
      btnPrev.type = 'button'; btnPrev.hidden = true;
      navCounter = el('span', nav, 'ptbr-nav-counter', '');
      navCounter.hidden = true;
      btnNext = el('button', nav, 'ptbr-nav-pill', 'Próxima →');
      btnNext.type = 'button'; btnNext.hidden = true;

      btnAll.addEventListener('click', function () { setStepMode(false, stepIndex); }, false);
      btnOne.addEventListener('click', function () { setStepMode(true, stepIndex); }, false);
      btnPrev.addEventListener('click', function () { if (stepIndex > 0) { setStepMode(true, stepIndex - 1); } }, false);
      btnNext.addEventListener('click', function () { if (stepIndex < order.length - 1) { setStepMode(true, stepIndex + 1); } }, false);
    }

    var canvas = el('div', main, 'ptbr-reading-canvas'), aside = el('aside', box, 'ptbr-reading-aside');
    aside.id = uid; aside.setAttribute('aria-label', 'Explicação da relação selecionada');
    el('p', aside, 'ptbr-overline', 'POR DENTRO DO TEXTO');
    var navList = [];
    order.forEach(function (key) {
      var terms = groups[key].items.filter(function (f) { return f.feature !== 'Predicado'; });
      terms.sort(function (a, b) { return a.start - b.start || a.end - b.end; });
      terms.forEach(function (f) { navList.push(f); });
    });
    var asidePrev = null, asideNext = null, asideCounter = null;
    if (navList.length > 1) {
      var asideNav = el('div', aside, 'ptbr-aside-nav');
      asidePrev = el('button', asideNav, 'ptbr-aside-step', '← Anterior');
      asidePrev.type = 'button'; asidePrev.setAttribute('data-aside-step', 'prev');
      asideCounter = el('span', asideNav, 'ptbr-aside-counter', '1 / ' + navList.length);
      asideNext = el('button', asideNav, 'ptbr-aside-step', 'Próxima →');
      asideNext.type = 'button'; asideNext.setAttribute('data-aside-step', 'next');
      asidePrev.addEventListener('click', function () { stepSyntax(-1); }, false);
      asideNext.addEventListener('click', function () { stepSyntax(1); }, false);
    }
    var selected = el('p', aside, 'ptbr-reading-selection'), links = el('p', aside, 'ptbr-syntax-links'), details = el('div', aside, 'ptbr-reading-details');
    selected.setAttribute('aria-live', 'polite');

    function stepSyntax(dir) {
      if (!navList.length) { return; }
      var cur = navList.indexOf(active);
      if (cur < 0) { cur = 0; }
      var nextIdx = Math.max(0, Math.min(navList.length - 1, cur + dir));
      if (navList[nextIdx]) { select(navList[nextIdx]); }
    }

    function button(f, target, cls) {
      var b = el('button', target, cls); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-controls', uid);
      b.setAttribute('data-syntax-node', f.nodeId);
      b.setAttribute('data-syntax-role', syntaxRoleKey(f.feature));
      var subrole = '';
      if (f.reducedKind) { subrole = 'reduzida'; }
      else if (f.nodeId && f.nodeId.indexOf('-adjunto-ini') !== -1) { subrole = 'deslocado'; }
      else if (f.evidence && f.evidence.observation && f.evidence.observation.indexOf('próclise') !== -1) { subrole = 'clitico'; }
      if (subrole) { b.setAttribute('data-syntax-subrole', subrole); }
      b.setAttribute('aria-label', f.feature + ': ' + f.snippet + '. Ver explicação.');
      el('span', b, 'ptbr-word-tag', f.feature);
      el('span', b, 'ptbr-word-text', f.snippet);
      if (f.components && f.components.length) {
        f.components.forEach(function (c) { if (valid(snapshot, c)) { el('span', b, 'ptbr-syntax-head', c.role + ': ' + c.snippet); } });
      } else if (f.head && f.head.snippet !== f.snippet) {
        el('span', b, 'ptbr-syntax-head', 'Núcleo: ' + f.head.snippet);
      }
      if (f.groupKind) {
        el('span', b, 'ptbr-syntax-subtag', f.groupKind);
      } else if (subrole === 'deslocado') {
        el('span', b, 'ptbr-syntax-subtag', 'deslocado');
      } else if (subrole === 'clitico') {
        el('span', b, 'ptbr-syntax-subtag', 'próclise');
      } else if (subrole === 'reduzida') {
        el('span', b, 'ptbr-syntax-subtag', 'reduzida · ' + f.reducedKind);
      }
      if (f.implicitSubject && f.implicitSubject.label) {
        el('span', b, 'ptbr-syntax-head', f.implicitSubject.label);
      }
      b.addEventListener('click', function () { select(f); }, false);
      b.addEventListener('keydown', function (ev) {
        if (ev.keyCode === 39) { if (ev.preventDefault) { ev.preventDefault(); } stepSyntax(1); }
        else if (ev.keyCode === 37) { if (ev.preventDefault) { ev.preventDefault(); } stepSyntax(-1); }
      }, false);
      buttons['$' + f.nodeId] = { button: b, finding: f };
    }

    order.forEach(function (key, index) {
      var g = groups[key], s = el('section', canvas, 'ptbr-reading-fragment');
      g.section = s;
      var fragHead = el('div', s, 'ptbr-fragment-head');
      el('p', fragHead, 'ptbr-fragment-number', 'FRASE ' + ('0' + (index + 1)).slice(-2) + ' DE ' + ('0' + order.length).slice(-2));
      var clauseKind = '';
      g.items.forEach(function (item) {
        if (clauseKind) { return; }
        if (item.reducedKind) { clauseKind = 'Oração reduzida · ' + item.reducedKind; }
        else if (item.groupKind === 'passiva analítica') { clauseKind = 'Voz passiva analítica'; }
        else if (item.implicitSubject && item.implicitSubject.pronoun) { clauseKind = 'Sujeito oculto (' + item.implicitSubject.pronoun + ')'; }
      });
      if (clauseKind) { el('span', fragHead, 'ptbr-clause-badge', clauseKind); }
      var scroll = el('div', s, 'ptbr-word-scroll'); scroll.setAttribute('tabindex', '0'); scroll.setAttribute('aria-label', 'Grupos da oração; role para ver todas as relações');
      g.row = el('div', scroll, 'ptbr-syntax-row');
      if (D.createElementNS) {
        g.svg = svgEl('svg', g.row, { 'class': 'ptbr-relation-arcs', 'aria-hidden': 'true' });
      }

      /* Termos na ordem exata em que aparecem na frase (f.start crescente) */
      var orderedTerms = g.items.filter(function (f) { return f.feature !== 'Predicado'; });
      orderedTerms.sort(function (a, b) { return a.start - b.start || a.end - b.end; });
      var predicates = g.items.filter(function (f) { return f.feature === 'Predicado'; });

      var strip = el('div', g.row, 'ptbr-syntax-order');
      orderedTerms.forEach(function (f) { button(f, strip, 'ptbr-syntax-term'); });

      if (predicates.length) {
        var predWrap = el('div', g.row, 'ptbr-syntax-scope-bar');
        predicates.forEach(function (f) { button(f, predWrap, 'ptbr-syntax-whole'); });
      }

      el('p', s, 'ptbr-fragment-original', g.clause.snippet);
    });

    if (!arr.length) {
      el('p', main, 'ptbr-reading-empty', 'Nenhuma construção recebeu uma leitura neste recorte. Isso indica o limite desta lente, não um erro no texto.');
    }

    function setStepMode(oneByOne, idx) {
      stepMode = !!oneByOne;
      stepIndex = Math.max(0, Math.min(order.length - 1, idx || 0));
      if (btnAll) { btnAll.setAttribute('aria-pressed', stepMode ? 'false' : 'true'); }
      if (btnOne) { btnOne.setAttribute('aria-pressed', stepMode ? 'true' : 'false'); }
      if (btnPrev) { btnPrev.hidden = !stepMode; btnPrev.disabled = stepIndex <= 0; }
      if (btnNext) { btnNext.hidden = !stepMode; btnNext.disabled = stepIndex >= order.length - 1; }
      if (navCounter) { navCounter.hidden = !stepMode; navCounter.textContent = 'Frase ' + (stepIndex + 1) + ' de ' + order.length; }
      order.forEach(function (key, i) {
        if (groups[key].section) { groups[key].section.hidden = stepMode && i !== stepIndex; }
      });
      if (stepMode && order[stepIndex]) {
        var firstItem = groups[order[stepIndex]].items[0];
        if (firstItem) { select(firstItem); }
      } else {
        resize();
      }
    }

    function draw() {
      if (dead || !active || (options.isCurrent && !options.isCurrent())) { return; }
      order.forEach(function (key) { if (groups[key].svg) { groups[key].svg.textContent = ''; } });
      var g = groups['$' + active.clause.start];
      if (!g || !g.svg || !g.row.getBoundingClientRect) { return; }
      var row = g.row.getBoundingClientRect();
      if (!row.width) { return; }

      /* Coleta e ordena vínculos do menor ao maior vão (empilhamento displaCy limpo, até 6 arcos) */
      var activeEdges = [];
      (active.relations || []).forEach(function (edge) {
        if (edge.from !== active.nodeId && edge.to !== active.nodeId) { return; }
        var a = buttons['$' + edge.from], b = buttons['$' + edge.to];
        if (!a || !b) { return; }
        var ar = a.button.getBoundingClientRect(), br = b.button.getBoundingClientRect();
        var x1 = ar.left - row.left + ar.width / 2;
        var x2 = br.left - row.left + br.width / 2;
        activeEdges.push({ edge: edge, x1: x1, x2: x2, span: Math.abs(x2 - x1) });
      });
      activeEdges.sort(function (u, v) { return u.span - v.span; });
      if (activeEdges.length > 6) { activeEdges = activeEdges.slice(0, 6); }

      var svgH = Math.min(176, Math.max(88, 66 + activeEdges.length * 22));
      if (g.row.style) { g.row.style.paddingTop = (svgH + 6) + 'px'; }
      g.svg.setAttribute('width', row.width);
      g.svg.setAttribute('height', svgH);
      g.svg.setAttribute('viewBox', '0 0 ' + row.width + ' ' + svgH);

      var yBase = svgH - 8, placedPills = [];
      activeEdges.forEach(function (item, lane) {
        var edge = item.edge, x1 = item.x1, x2 = item.x2;
        var arch = Math.min(svgH - 22, Math.max(30, item.span * 0.22) + lane * 18);
        var cy = Math.max(14, yBase - arch);
        var mx = (x1 + x2) / 2;

        /* 1 <path> por vínculo (preserva contrato de testes) + ponta de seta <polygon> + rótulo sem sobreposição */
        svgEl('path', g.svg, {
          d: 'M ' + x1.toFixed(1) + ' ' + yBase + ' Q ' + mx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + (yBase - 4),
          fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round'
        });
        svgEl('polygon', g.svg, {
          points: x2.toFixed(1) + ',' + yBase + ' ' + (x2 - 4.5).toFixed(1) + ',' + (yBase - 8) + ' ' + (x2 + 4.5).toFixed(1) + ',' + (yBase - 8),
          fill: 'currentColor'
        });
        svgEl('circle', g.svg, { cx: x1.toFixed(1), cy: (yBase - 2).toFixed(1), r: '2.8', fill: 'currentColor' });

        if (edge.label) {
          var lblText = String(edge.label).slice(0, 26);
          var apexY = 0.25 * yBase + 0.5 * cy + 0.25 * (yBase - 4);
          var pillW = Math.max(46, lblText.length * 6.4 + 14);
          var pillX = Math.max(2, Math.min(row.width - pillW - 2, mx - pillW / 2));
          var pillY = Math.max(2, apexY - 12);
          var tries = 0;
          while (tries < 6) {
            var collides = false, pi;
            for (pi = 0; pi < placedPills.length; pi++) {
              var p = placedPills[pi];
              if (pillX < p.x2 + 4 && pillX + pillW > p.x1 - 4 && Math.abs(pillY - p.y) < 20) {
                collides = true; break;
              }
            }
            if (!collides) { break; }
            pillY = Math.max(2, pillY - 20);
            tries++;
          }
          placedPills.push({ x1: pillX, x2: pillX + pillW, y: pillY });
          svgEl('rect', g.svg, {
            x: pillX.toFixed(1), y: pillY.toFixed(1), width: pillW.toFixed(1), height: '18', rx: '9',
            'class': 'ptbr-arc-pill'
          });
          svgEl('text', g.svg, {
            x: (pillX + pillW / 2).toFixed(1), y: (pillY + 12.5).toFixed(1), 'text-anchor': 'middle',
            'class': 'ptbr-arc-label'
          }, lblText);
        }
      });
    }

    function select(f) {
      if (dead || (options.isCurrent && !options.isCurrent())) { return; }
      active = f;
      Object.keys(buttons).forEach(function (k) {
        buttons[k].button.setAttribute('aria-pressed', buttons[k].finding === f ? 'true' : 'false');
        buttons[k].button.setAttribute('data-syntax-linked', 'false');
      });
      selected.textContent = f.feature + ' · “' + f.snippet + '”';
      var descriptions = [];
      (f.relations || []).forEach(function (edge) {
        var a = buttons['$' + edge.from], b = buttons['$' + edge.to];
        if (a && b && (edge.from === f.nodeId || edge.to === f.nodeId)) {
          if (a.finding !== f) { a.button.setAttribute('data-syntax-linked', 'true'); }
          if (b.finding !== f) { b.button.setAttribute('data-syntax-linked', 'true'); }
          descriptions.push(edge.label + ': “' + a.finding.snippet + '” ↔ “' + b.finding.snippet + '”');
        }
      });
      links.textContent = descriptions.join('. ');
      if (asideCounter) {
        var pos = navList.indexOf(f);
        asideCounter.textContent = (pos >= 0 ? (pos + 1) : 1) + ' / ' + navList.length;
        if (asidePrev) { asidePrev.disabled = pos <= 0; }
        if (asideNext) { asideNext.disabled = pos < 0 || pos >= navList.length - 1; }
      }
      options.onSelect(f, details, true);
      resize();
    }

    function resize() { if (!dead) { root.clearTimeout(timer); timer = root.setTimeout(draw, 0); } }
    if (root.addEventListener) { root.addEventListener('resize', resize, false); }
    if (D.fonts && D.fonts.ready) { D.fonts.ready.then(resize); }
    if (arr.length) { select(arr[0]); }
    return {
      select: function (i) { if (arr[i]) { select(arr[i]); } },
      destroy: function () { dead = true; root.clearTimeout(timer); if (root.removeEventListener) { root.removeEventListener('resize', resize, false); } }
    };
  }

  function meterName(min, max) {
    if (min !== max) { return min + '–' + max + ' sílabas'; }
    var names = {
      1: '1 · monossílabo', 2: '2 · dissílabo', 3: '3 · trissílabo', 4: '4 · tetrassílabo',
      5: '5 · redondilha menor', 6: '6 · hexassílabo', 7: '7 · redondilha maior',
      8: '8 · octossílabo', 9: '9 · eneassílabo', 10: '10 · decassílabo',
      11: '11 · hendecassílabo', 12: '12 · alexandrino'
    };
    return names[max] || (max + ' sílabas');
  }
  function lineBounds(snapshot, pos) {
    var s = pos, e = pos;
    while (s > 0 && !/[\r\n]/.test(snapshot.charAt(s - 1))) { s--; }
    while (e < snapshot.length && !/[\r\n]/.test(snapshot.charAt(e))) { e++; }
    return { start: s, end: e };
  }
  function sentenceWindow(snapshot, start, end) {
    var lb = lineBounds(snapshot, start);
    var s = Math.max(lb.start, start - 55), e = Math.min(lb.end, end + 55);
    if (s > lb.start) { while (s > lb.start && !/\s/.test(snapshot.charAt(s - 1))) { s--; } }
    if (e < lb.end) { while (e < lb.end && !/\s/.test(snapshot.charAt(e))) { e++; } }
    return { start: s, end: e, prefixEllipsis: s > lb.start, suffixEllipsis: e < lb.end };
  }
  function appendMarkedText(container, snapshot, winStart, winEnd, spans, markCls, prefixEllipsis, suffixEllipsis) {
    var sorted = spans.slice().sort(function (a, b) { return a.start - b.start; });
    var cursor = winStart;
    if (prefixEllipsis) { el('span', container, 'ptbr-ctx-ellipsis', '…'); }
    sorted.forEach(function (sp) {
      if (sp.end <= cursor || sp.start >= winEnd) { return; }
      var a = Math.max(cursor, sp.start), b = Math.min(winEnd, sp.end);
      if (a > cursor) { el('span', container, 'ptbr-ctx-plain', snapshot.slice(cursor, a)); }
      if (b > a) { el('mark', container, markCls, snapshot.slice(a, b)); }
      cursor = b;
    });
    if (cursor < winEnd) { el('span', container, 'ptbr-ctx-plain', snapshot.slice(cursor, winEnd)); }
    if (suffixEllipsis) { el('span', container, 'ptbr-ctx-ellipsis', '…'); }
  }

  /* 1b. Orações relativas com arco SVG ligando "que ..." ao antecedente (estilo displaCy editorial) */
  function relativeMap(parent, options) {
    var snapshot = options.snapshot;
    var arr = options.findings.filter(function (f) { return valid(snapshot, f); }).slice(0, 100);
    var uid = 'ptbr-reading-' + (++serial), dead = false, timer = null, active = -1;
    var box = el('div', parent, 'ptbr-reading'), main = el('div', box, 'ptbr-reading-paper');
    box.setAttribute('data-reading-lens', 'relativas');
    el('p', main, 'ptbr-overline', 'ORAÇÕES RELATIVAS · VÍNCULO COM O ANTECEDENTE');
    el('p', main, 'ptbr-reading-help', 'Cada frase mostra o antecedente, a oração relativa encaixada e o verbo principal na ordem de leitura, com seta indicando o que “que” retoma.');
    var canvas = el('div', main, 'ptbr-reading-canvas'), aside = el('aside', box, 'ptbr-reading-aside');
    aside.id = uid; aside.setAttribute('aria-label', 'Explicação da relativa selecionada');
    el('p', aside, 'ptbr-overline', 'POR DENTRO DO TEXTO');
    var selected = el('p', aside, 'ptbr-reading-selection'), details = el('div', aside, 'ptbr-reading-details');
    selected.setAttribute('aria-live', 'polite');
    if (!arr.length) { el('p', main, 'ptbr-reading-empty', 'Nenhuma relativa restritiva no recorte inicial. Ausência de leitura indica o limite desta lente, não erro no texto.'); }

    var rows = [], rowButtons = [];
    arr.forEach(function (f, index) {
      var s = el('section', canvas, 'ptbr-reading-fragment');
      el('p', s, 'ptbr-fragment-number', 'PERÍODO ' + ('0' + (index + 1)).slice(-2) + ' DE ' + ('0' + arr.length).slice(-2));
      var scroll = el('div', s, 'ptbr-word-scroll'); scroll.setAttribute('tabindex', '0');
      var row = el('div', scroll, 'ptbr-syntax-row');
      var svg = D.createElementNS ? svgEl('svg', row, { 'class': 'ptbr-relation-arcs', 'aria-hidden': 'true' }) : null;
      var strip = el('div', row, 'ptbr-syntax-order');
      var ante = f.context && f.context[0] && valid(snapshot, f.context[0]) ? f.context[0] : null;
      var mainVerb = f.context && f.context[3] && valid(snapshot, f.context[3]) ? f.context[3] : null;

      var anteBtn = null;
      if (ante) {
        anteBtn = el('button', strip, 'ptbr-syntax-term'); anteBtn.type = 'button';
        anteBtn.setAttribute('data-syntax-role', 'sujeito'); anteBtn.setAttribute('aria-pressed', 'false');
        el('span', anteBtn, 'ptbr-word-tag', 'Antecedente');
        el('span', anteBtn, 'ptbr-word-text', ante.snippet);
        anteBtn.addEventListener('click', function () { select(index); }, false);
      }

      var relHead = f.head && f.head.snippet ? f.head.snippet : 'que';
      var relFn = f.relativeFunction === 'objeto direto' ? 'objeto' : (f.relativeFunction === 'adjunto adverbial de lugar' ? 'lugar' : 'sujeito');
      var relBtn = el('button', strip, 'ptbr-syntax-term'); relBtn.type = 'button';
      relBtn.setAttribute('data-syntax-role', 'objeto'); relBtn.setAttribute('aria-pressed', 'false');
      relBtn.setAttribute('aria-controls', uid);
      el('span', relBtn, 'ptbr-word-tag', 'Oração relativa · ' + relHead + '-' + relFn);
      el('span', relBtn, 'ptbr-word-text', f.snippet);
      if (f.components && f.components.length) {
        f.components.forEach(function (c) { if (valid(snapshot, c)) { el('span', relBtn, 'ptbr-syntax-head', c.role + ': ' + c.snippet); } });
      }
      relBtn.addEventListener('click', function () { select(index); }, false);

      var mvBtn = null;
      if (mainVerb) {
        mvBtn = el('button', strip, 'ptbr-syntax-term'); mvBtn.type = 'button';
        mvBtn.setAttribute('data-syntax-role', 'verbo'); mvBtn.setAttribute('aria-pressed', 'false');
        el('span', mvBtn, 'ptbr-word-tag', 'Verbo da principal');
        el('span', mvBtn, 'ptbr-word-text', mainVerb.snippet);
        mvBtn.addEventListener('click', function () { select(index); }, false);
      }

      if (f.clause && valid(snapshot, f.clause)) { el('p', s, 'ptbr-fragment-original', f.clause.snippet); }
      rows.push({ row: row, svg: svg, anteBtn: anteBtn, relBtn: relBtn, mvBtn: mvBtn, relHead: relHead });
      rowButtons.push(relBtn);
    });

    function draw() {
      if (dead || active < 0 || (options.isCurrent && !options.isCurrent())) { return; }
      rows.forEach(function (r) { if (r.svg) { r.svg.textContent = ''; } });
      var r = rows[active];
      if (!r || !r.svg || !r.anteBtn || !r.relBtn || !r.row.getBoundingClientRect) { return; }
      var rb = r.row.getBoundingClientRect(); if (!rb.width) { return; }
      var svgH = 88;
      r.svg.setAttribute('width', rb.width); r.svg.setAttribute('height', svgH); r.svg.setAttribute('viewBox', '0 0 ' + rb.width + ' ' + svgH);
      var ar = r.anteBtn.getBoundingClientRect(), rr = r.relBtn.getBoundingClientRect();
      var xFrom = rr.left - rb.left + rr.width / 2, xTo = ar.left - rb.left + ar.width / 2, yBase = svgH - 8;
      var mx = (xFrom + xTo) / 2, cy = 22;
      svgEl('path', r.svg, { d: 'M ' + xFrom.toFixed(1) + ' ' + yBase + ' Q ' + mx.toFixed(1) + ' ' + cy + ' ' + xTo.toFixed(1) + ' ' + (yBase - 4), fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round' });
      svgEl('polygon', r.svg, { points: xTo.toFixed(1) + ',' + yBase + ' ' + (xTo - 4.5).toFixed(1) + ',' + (yBase - 8) + ' ' + (xTo + 4.5).toFixed(1) + ',' + (yBase - 8), fill: 'currentColor' });
      svgEl('circle', r.svg, { cx: xFrom.toFixed(1), cy: (yBase - 2).toFixed(1), r: '2.8', fill: 'currentColor' });
      var lbl = (r.relHead || 'que') + ' retoma antecedente';
      var pillW = lbl.length * 6.4 + 14, pillX = Math.max(2, Math.min(rb.width - pillW - 2, mx - pillW / 2));
      svgEl('rect', r.svg, { x: pillX.toFixed(1), y: '18', width: pillW.toFixed(1), height: '18', rx: '9', 'class': 'ptbr-arc-pill' });
      svgEl('text', r.svg, { x: (pillX + pillW / 2).toFixed(1), y: '30.5', 'text-anchor': 'middle', 'class': 'ptbr-arc-label' }, lbl);
    }

    function select(index) {
      if (dead || !arr[index] || (options.isCurrent && !options.isCurrent())) { return; }
      active = index;
      rowButtons.forEach(function (b, j) { b.setAttribute('aria-pressed', j === index ? 'true' : 'false'); });
      selected.textContent = 'Relativa · “' + arr[index].snippet + '”';
      options.onSelect(arr[index], details, true);
      resize();
    }
    function resize() { if (!dead) { root.clearTimeout(timer); timer = root.setTimeout(draw, 0); } }
    if (root.addEventListener) { root.addEventListener('resize', resize, false); }
    if (D.fonts && D.fonts.ready) { D.fonts.ready.then(resize); }
    if (arr.length) { select(0); }
    return { select: select, destroy: function () { dead = true; root.clearTimeout(timer); if (root.removeEventListener) { root.removeEventListener('resize', resize, false); } } };
  }

  /* 2. Classes de palavras em pílulas coloridas + visuais próprios para Ritmo, Repetição, Poesia (Rimas/Métrica) e Convenções */
  E.renderReadingMap = function (parent, options) {
    if (options.lens === 'sintaxe') { return syntaxMap(parent, options); }
    if (options.lens === 'relativas') { return relativeMap(parent, options); }
    var snapshot = options.snapshot, arr = options.findings.filter(function (f) { return valid(snapshot, f); }).slice(0, 100);
    /* Uma locução ocupa um cartão; leituras dos componentes seguem no achado.
     * Evita repetir as palavras no original reconstruído da anotação. */
    if (options.lens === 'morfologia') {
      var compoundGroups = arr.filter(function (f) { return !!f.locution; });
      arr = arr.filter(function (f) { return f.locution || !compoundGroups.some(function (g) { return f.start >= g.start && f.end <= g.end; }); });
    }
    var morph = options.lens === 'morfologia';
    var isRitmo = options.lens === 'ritmo';
    var isDialogo = options.lens === 'dialogo';
    var isAdverbios = options.lens === 'adverbios';
    var isRepeat = options.lens === 'repeticao';
    var isRima = options.lens === 'rima';
    var isMetrica = options.lens === 'metrica';
    var active = -1, dead = false, timer = null, activeClassFilter = '';
    var uid = 'ptbr-reading-' + (++serial), buttons = [], rows = [], rowFor = [], diagrams = [], wordClasses = [];
    var box = el('div', parent, 'ptbr-reading'), main = el('div', box, 'ptbr-reading-paper');
    box.setAttribute('data-reading-lens', options.lens || 'geral');

    el('p', main, 'ptbr-overline',
      morph ? 'CLASSES DE PALAVRAS'
        : isRitmo ? 'RITMO DAS FRASES'
        : isDialogo ? 'LINHAS DE DIÁLOGO'
        : isRepeat ? 'REPETIÇÕES PRÓXIMAS'
        : isRima ? 'RIMAS ENTRE VERSOS'
        : isMetrica ? 'MÉTRICA DOS VERSOS'
        : 'LEITURA DO TEXTO');
    el('p', main, 'ptbr-reading-help', morph
      ? 'Filtre por classe acima ou clique em qualquer palavra para ver o contexto.'
      : isRitmo
        ? 'Extensão das frases, fôlego e sequências de cadência parecida.'
        : isDialogo
          ? 'Proporção de palavras e linhas com travessão (—), meia-risca (–) ou hífen (- ).'
          : isRepeat
            ? 'Palavras repetidas perto umas das outras. Clique para localizar ou abrir sinônimos.'
            : isRima
              ? 'Versos com final sonoro próximo compartilham a mesma letra (A, B, C…).'
              : isMetrica
                ? 'Sílabas poéticas estimadas, tônica destacada e medida do verso à direita.'
                : 'Clique em qualquer trecho para ler a observação ou localizar no texto.');

    /* Barra de filtros por classe + alternador "Só cores" para Classes de palavras */
    var filterButtons = [];
    if (morph && arr.length) {
      var classCounts = {}, classOrder = [];
      arr.forEach(function (f) {
        var rawCls = f.analysisStatus === 'contextual' ? f.feature : (f.candidates && f.candidates.classes.length === 1 ? f.candidates.classes[0] : 'incerta');
        var k = normalizeClassKey(rawCls);
        if (!classCounts['$' + k]) { classCounts['$' + k] = 0; classOrder.push(k); }
        classCounts['$' + k]++;
      });
      var bar = el('div', main, 'ptbr-class-bar');
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', 'Filtrar palavras por classe');

      var allBtn = el('button', bar, 'ptbr-class-chip', 'Todas (' + arr.length + ')');
      allBtn.type = 'button'; allBtn.setAttribute('aria-pressed', 'true'); allBtn.setAttribute('data-filter-class', '');
      filterButtons.push(allBtn);
      allBtn.addEventListener('click', function () { applyClassFilter(''); }, false);

      classOrder.forEach(function (k) {
        var cb = el('button', bar, 'ptbr-class-chip', classDisplayName(k) + ' (' + classCounts['$' + k] + ')');
        cb.type = 'button'; cb.setAttribute('aria-pressed', 'false'); cb.setAttribute('data-filter-class', k);
        cb.setAttribute('data-word-class', k);
        filterButtons.push(cb);
        cb.addEventListener('click', function () { applyClassFilter(activeClassFilter === k ? '' : k); }, false);
      });

      var compactBtn = el('button', bar, 'ptbr-pill-mode-btn', 'Só cores');
      compactBtn.type = 'button'; compactBtn.setAttribute('aria-pressed', 'false');
      compactBtn.title = 'Esconder os rótulos e deixar apenas as pílulas coloridas nas palavras';
      compactBtn.addEventListener('click', function () {
        var next = box.getAttribute('data-pills-compact') !== 'true';
        box.setAttribute('data-pills-compact', next ? 'true' : 'false');
        compactBtn.setAttribute('aria-pressed', next ? 'true' : 'false');
        compactBtn.textContent = next ? 'Mostrar rótulos' : 'Só cores';
        resize();
      }, false);
    }

    var canvas = el('div', main, 'ptbr-reading-canvas');
    var aside = el('aside', box, 'ptbr-reading-aside'); aside.id = uid; aside.setAttribute('aria-label', 'Explicação da leitura selecionada');
    el('p', aside, 'ptbr-overline', 'POR DENTRO DO TEXTO');
    var asidePrev = null, asideNext = null, asideCounter = null;
    if (arr.length > 1) {
      var asideNav = el('div', aside, 'ptbr-aside-nav');
      asidePrev = el('button', asideNav, 'ptbr-aside-step', '← Anterior');
      asidePrev.type = 'button'; asidePrev.setAttribute('data-aside-step', 'prev');
      asideCounter = el('span', asideNav, 'ptbr-aside-counter', '1 / ' + arr.length);
      asideNext = el('button', asideNav, 'ptbr-aside-step', 'Próxima →');
      asideNext.type = 'button'; asideNext.setAttribute('data-aside-step', 'next');
      asidePrev.addEventListener('click', function () { stepOccurrence(-1); }, false);
      asideNext.addEventListener('click', function () { stepOccurrence(1); }, false);
    }
    var selected = el('p', aside, 'ptbr-reading-selection'); selected.setAttribute('aria-live', 'polite');
    var details = el('div', aside, 'ptbr-reading-details');
    if (!arr.length) { el('p', main, 'ptbr-reading-empty', 'Nenhuma observação nova neste recorte. Isso não certifica ausência de problemas.'); }

    function visibleIndices() {
      var list = [], idx;
      for (idx = 0; idx < arr.length; idx++) {
        if (!activeClassFilter || wordClasses[idx] === activeClassFilter) { list.push(idx); }
      }
      return list;
    }

    function updateAsideStepper() {
      if (!asideCounter) { return; }
      var vis = visibleIndices();
      var pos = vis.indexOf(active);
      asideCounter.textContent = vis.length ? ((pos >= 0 ? pos + 1 : 1) + ' / ' + vis.length) : '0 / 0';
      if (asidePrev) { asidePrev.disabled = pos <= 0; }
      if (asideNext) { asideNext.disabled = pos < 0 || pos >= vis.length - 1; }
    }

    function stepOccurrence(dir) {
      var vis = visibleIndices();
      if (!vis.length) { return; }
      var pos = vis.indexOf(active);
      if (pos < 0) { select(vis[0], true); return; }
      var targetPos = Math.max(0, Math.min(vis.length - 1, pos + dir));
      select(vis[targetPos], true);
    }

    /* Dados auxiliares para Ritmo (maior comprimento), Repetição (grupos de cor) e Rima (letras A/B/C...) */
    var maxWords = 1, repeatGroups = {}, nextRepeatColor = 0, rhymeGroups = {}, nextRhymeIdx = 0;
    var rhymeLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (isRitmo) {
      arr.forEach(function (f) {
        var wc = f.snippet.replace(/^\s+|\s+$/g, '').split(/\s+/).length;
        if (wc > maxWords) { maxWords = wc; }
      });
    }

    var row, sentence, previous = null;
    arr.forEach(function (f, index) {
      var gap = previous ? snapshot.slice(previous.end, f.start) : '';
      if (!morph || !row || /[\r\n]/.test(gap) || /[.!?]\s/.test(gap) || gap.length > 100) {
        var section = el('section', canvas, 'ptbr-reading-fragment');
        el('p', section, 'ptbr-fragment-number', morph ? ('FRASE ' + ('0' + (rows.length + 1)).slice(-2)) : ('TRECHO ' + ('0' + (rows.length + 1)).slice(-2)));
        var scroll = el('div', section, 'ptbr-word-scroll'); scroll.setAttribute('tabindex', '0'); scroll.setAttribute('aria-label', 'Trecho anotado');
        row = el('div', scroll, morph ? 'ptbr-word-row' : 'ptbr-excerpt-row'); rows.push(row);
        if (morph && D.createElementNS) {
          var svg = svgEl('svg', row, { 'class': 'ptbr-relation-arcs', 'aria-hidden': 'true' });
          diagrams.push(svg);
        } else { diagrams.push(null); }
        sentence = el('p', section, 'ptbr-fragment-original');
        sentence.textContent = f.snippet;
      } else {
        /* Preserva pontuação/espaços entre pílulas no fluxo natural do texto */
        var cleanGap = gap.replace(/^\s+|\s+$/g, '');
        if (morph && cleanGap) {
          el('span', row, 'ptbr-punct', cleanGap);
        }
        sentence.textContent += gap + f.snippet;
      }

      var b = el('button', row, morph ? 'ptbr-word' : 'ptbr-excerpt'); b.type = 'button';
      b.setAttribute('data-reading-index', index); b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-controls', uid);
      b.setAttribute('aria-label', f.snippet + ': ' + label(f) + '. Ver explicação.');
      b.setAttribute('data-reading-state', f.analysisStatus || 'observacao');
      var rawCls = f.analysisStatus === 'contextual' ? f.feature : (f.candidates && f.candidates.classes.length === 1 ? f.candidates.classes[0] : 'incerta');
      var normCls = normalizeClassKey(rawCls);
      b.setAttribute('data-word-class', rawCls || 'incerta');
      b.setAttribute('data-word-class-norm', normCls);

      if (isRepeat) {
        var rKey = '$' + String(f.snippet || '').toLowerCase();
        if (typeof repeatGroups[rKey] !== 'number') { repeatGroups[rKey] = (nextRepeatColor++) % 5; }
        b.setAttribute('data-repeat-group', String(repeatGroups[rKey]));
      }

      if (morph) {
        el('span', b, 'ptbr-word-text', f.snippet);
        el('span', b, 'ptbr-word-tag', label(f));
      } else if (isMetrica && f.measurements && f.measurements.words && f.measurements.words.length) {
        var scanRow = el('span', b, 'ptbr-scansion-row');
        var scanVerse = el('span', scanRow, 'ptbr-scansion-verse');
        var wList = f.measurements.words;
        wList.forEach(function (wObj, wi) {
          if (wi > 0) { el('span', scanVerse, 'ptbr-syl-sep', ' / '); }
          var isLastWord = wi === wList.length - 1;
          wObj.syllables.forEach(function (syl, si) {
            if (si > 0) { el('span', scanVerse, 'ptbr-syl-dot', '·'); }
            var sCls = si === wObj.tonic ? 'ptbr-syl-tonic' : (isLastWord && si > wObj.tonic ? 'ptbr-syl-tail' : 'ptbr-syl');
            el('span', scanVerse, sCls, syl);
          });
        });
        var meterWrap = el('span', scanRow, 'ptbr-meter-badges');
        el('span', meterWrap, 'ptbr-meter-badge', meterName(f.measurements.min, f.measurements.max));
        if (f.measurements.possibleFusions > 0) {
          el('span', meterWrap, 'ptbr-metric-chip', f.measurements.possibleFusions + (f.measurements.possibleFusions === 1 ? ' elisão possível' : ' elisões possíveis'));
        }
      } else if (isRima && f.related && valid(snapshot, f.related)) {
        var rk = '$' + f.related.start;
        if (typeof rhymeGroups[rk] !== 'number') { rhymeGroups[rk] = nextRhymeIdx++; }
        var rIdx = rhymeGroups[rk];
        var rLetter = rhymeLetters.charAt(rIdx % rhymeLetters.length);
        b.setAttribute('data-repeat-group', String(rIdx % 5));
        var rHead = el('span', b, 'ptbr-rhyme-head');
        el('span', rHead, 'ptbr-rhyme-badge', 'RIMA ' + rLetter);
        if (f.rhymeKind) {
          el('span', rHead, 'ptbr-metric-chip' + (f.rhymeKind === 'toante' ? ' ptbr-chip-dashed' : ''), f.rhymeKind);
        }
        el('span', rHead, 'ptbr-rhyme-pair', '“' + f.related.snippet + '” ↔ “' + f.snippet + '”');
        var l1 = lineBounds(snapshot, f.related.start), l2 = lineBounds(snapshot, f.start);
        var v1 = el('span', b, 'ptbr-rhyme-line');
        appendMarkedText(v1, snapshot, l1.start, l1.end, [f.related], 'ptbr-inline-hit', false, false);
        var v2 = el('span', b, 'ptbr-rhyme-line');
        appendMarkedText(v2, snapshot, l2.start, l2.end, [f], 'ptbr-inline-hit', false, false);
      } else if (isRepeat && f.occurrences && f.occurrences.length > 1) {
        var repStart = typeof f.contextStart === 'number' ? Math.max(0, f.contextStart - 28) : Math.max(0, f.start - 40);
        var repEnd = Math.min(snapshot.length, f.end + 36);
        var lbRep = lineBounds(snapshot, f.start);
        repStart = Math.max(lbRep.start, repStart); repEnd = Math.min(lbRep.end, repEnd);
        var repCtx = el('span', b, 'ptbr-ctx-line');
        appendMarkedText(repCtx, snapshot, repStart, repEnd, f.occurrences, 'ptbr-inline-hit', repStart > lbRep.start, repEnd < lbRep.end);
        el('span', b, 'ptbr-word-tag', f.occurrences.length + '× “' + f.snippet + '” no trecho');
      } else if (isDialogo && f.metrics) {
        var dm = f.metrics;
        var dPct = Math.max(0, Math.min(100, Math.round(dm.markedPercent || 0)));
        el('span', b, 'ptbr-word-text', f.message);
        var prop = el('span', b, 'ptbr-proportion-bar');
        var pFill = el('span', prop, 'ptbr-proportion-fill');
        if (pFill.style) { pFill.style.width = dPct + '%'; }
        var dChips = el('span', b, 'ptbr-metric-chips');
        el('span', dChips, 'ptbr-metric-chip', dm.markedLines + ' de ' + dm.lines + ' linhas');
        el('span', dChips, 'ptbr-metric-chip', dm.markedLineWords + ' de ' + dm.totalWords + ' palavras');
        if (dm.markers) {
          if (dm.markers.emDash) { el('span', dChips, 'ptbr-metric-chip', '— travessão: ' + dm.markers.emDash); }
          if (dm.markers.enDash) { el('span', dChips, 'ptbr-metric-chip', '– meia-risca: ' + dm.markers.enDash); }
          if (dm.markers.hyphen) { el('span', dChips, 'ptbr-metric-chip', '- hífen: ' + dm.markers.hyphen); }
        }
      } else if (isRitmo && f.id === 'PTBR-RIT-001' && f.metrics) {
        var rm = f.metrics;
        el('span', b, 'ptbr-rhyme-badge', 'PANORAMA');
        el('span', b, 'ptbr-word-text', f.message);
        var rChips = el('span', b, 'ptbr-metric-chips');
        el('span', rChips, 'ptbr-metric-chip', rm.sentences + ' frases');
        el('span', rChips, 'ptbr-metric-chip', 'média ' + rm.mean.toFixed(1) + ' pal.');
        el('span', rChips, 'ptbr-metric-chip', 'faixa ' + rm.shortest + '–' + rm.longest);
        el('span', rChips, 'ptbr-metric-chip', 'desvio ' + rm.deviation.toFixed(1));
      } else if (isRitmo && f.id === 'PTBR-RIT-003' && f.metrics && f.metrics.lengths) {
        var rHead3 = el('span', b, 'ptbr-rhyme-head');
        el('span', rHead3, 'ptbr-rhyme-badge', 'CADÊNCIA REGULAR');
        el('span', rHead3, 'ptbr-rhyme-pair', f.metrics.runLength + ' frases (' + f.metrics.minWords + '–' + f.metrics.maxWords + ' palavras)');
        el('span', b, 'ptbr-word-text', f.snippet);
        var pulse = el('span', b, 'ptbr-pulse-strip');
        f.metrics.lengths.forEach(function (len) {
          var chip = el('span', pulse, 'ptbr-pulse-bar', len + ' pal.');
          if (chip.style) { chip.style.minWidth = Math.max(44, Math.min(120, len * 6)) + 'px'; }
        });
      } else if (isRitmo) {
        if (f.id === 'PTBR-RIT-002') {
          var rHead2 = el('span', b, 'ptbr-rhyme-head');
          el('span', rHead2, 'ptbr-rhyme-badge', 'FRASE EXTENSA');
          if (f.metrics && typeof f.metrics.mean === 'number') {
            el('span', rHead2, 'ptbr-metric-chip', 'média do trecho: ' + f.metrics.mean.toFixed(1) + ' pal.');
          }
        }
        el('span', b, 'ptbr-word-text', f.snippet);
        var wc = (f.metrics && typeof f.metrics.words === 'number') ? f.metrics.words : f.snippet.replace(/^\s+|\s+$/g, '').split(/\s+/).length;
        var pct = Math.max(10, Math.round((wc / maxWords) * 100));
        var meter = el('span', b, 'ptbr-rhythm-meter');
        var fill = el('span', meter, 'ptbr-rhythm-bar');
        if (fill.style) { fill.style.width = pct + '%'; }
        el('span', meter, 'ptbr-rhythm-count', wc + (wc === 1 ? ' palavra' : ' palavras'));
      } else {
        /* Convenções e escolhas de escrita: exibe o trecho destacado dentro da frase real */
        var win = sentenceWindow(snapshot, f.start, f.end);
        var ctxLine = el('span', b, 'ptbr-ctx-line');
        appendMarkedText(ctxLine, snapshot, win.start, win.end, [f], 'ptbr-inline-hit', win.prefixEllipsis, win.suffixEllipsis);
        var metaRow = el('span', b, 'ptbr-metric-chips');
        el('span', metaRow, 'ptbr-word-tag', f.message || label(f));
        if (isAdverbios && f.metrics && f.metrics.paragraphCount >= 2) {
          el('span', metaRow, 'ptbr-metric-chip', f.metrics.paragraphCount + '× neste parágrafo');
        }
        if (f.reference) {
          el('span', metaRow, 'ptbr-metric-chip ptbr-ref-chip', 'Ref.: “' + f.reference + '”');
        }
      }

      b.addEventListener('click', function () { select(index, true); }, false);
      buttons.push(b); wordClasses.push(normCls); rowFor.push(rows.length - 1); previous = f;
    });

    function applyClassFilter(cls) {
      activeClassFilter = cls || '';
      filterButtons.forEach(function (fb) {
        fb.setAttribute('aria-pressed', fb.getAttribute('data-filter-class') === activeClassFilter ? 'true' : 'false');
      });
      buttons.forEach(function (b, idx) {
        var dim = !!activeClassFilter && wordClasses[idx] !== activeClassFilter;
        b.setAttribute('data-dimmed', dim ? 'true' : 'false');
      });
      var vis = visibleIndices();
      if (vis.length && vis.indexOf(active) === -1) { select(vis[0], false); }
      else { updateAsideStepper(); }
    }

    function draw() {
      if (dead || active < 0) { return; }
      diagrams.forEach(function (svg) { if (svg) { svg.textContent = ''; } });
      var f = arr[active], ri = rowFor[active], svg = diagrams[ri], b = buttons[active], curRow = rows[ri];
      if (!svg || !b.getBoundingClientRect || f.analysisStatus !== 'contextual') { return; }
      var rb = curRow.getBoundingClientRect(), bb = b.getBoundingClientRect();
      if (!rb.width) { return; }
      var rowH = typeof rb.height === 'number' && rb.height > 0 ? rb.height : 66;
      var x = bb.left - rb.left + bb.width / 2;
      var y1 = typeof bb.top === 'number' && typeof rb.top === 'number' ? Math.max(18, bb.top - rb.top) : 60;
      svg.setAttribute('width', rb.width);
      svg.setAttribute('height', Math.max(66, rowH));
      svg.setAttribute('viewBox', '0 0 ' + rb.width + ' ' + Math.max(66, rowH));
      var lane = 0;
      (f.context || []).forEach(function (support) {
        if (!valid(snapshot, support) || lane >= 3) { return; }
        for (var j = 0; j < arr.length; j++) {
          if (j === active || rowFor[j] !== ri || arr[j].start !== support.start || arr[j].end !== support.end) { continue; }
          var r = buttons[j].getBoundingClientRect();
          var x2 = r.left - rb.left + r.width / 2;
          var y2 = typeof r.top === 'number' && typeof rb.top === 'number' ? Math.max(18, r.top - rb.top) : 60;
          var topY = Math.min(y1, y2) - (20 + lane * 10);
          svgEl('path', svg, {
            d: 'M ' + x.toFixed(1) + ' ' + y1.toFixed(1) + ' Q ' + ((x + x2) / 2).toFixed(1) + ' ' + Math.max(4, topY).toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1),
            fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-dasharray': '3 3'
          });
          buttons[j].setAttribute('data-reading-support', 'true');
          lane++;
          break;
        }
      });
    }

    function select(index, user) {
      if (dead || !arr[index] || (options.isCurrent && !options.isCurrent())) { return; }
      active = index;
      buttons.forEach(function (b, j) { b.setAttribute('aria-pressed', j === index ? 'true' : 'false'); b.setAttribute('data-reading-support', 'false'); });
      var itemStatus = arr[index].analysisStatus;
      selected.textContent = (morph && (itemStatus === 'ambiguo' || itemStatus === 'desconhecido'))
        ? ('“' + arr[index].snippet + '”')
        : ('“' + arr[index].snippet + '” · ' + label(arr[index]));
      updateAsideStepper();
      options.onSelect(arr[index], details, user);
      root.clearTimeout(timer); timer = root.setTimeout(draw, 0);
    }

    function resize() { if (!dead) { root.clearTimeout(timer); timer = root.setTimeout(draw, 0); } }
    if (root.addEventListener) { root.addEventListener('resize', resize, false); }
    if (D.fonts && D.fonts.ready) { D.fonts.ready.then(resize); }

    var first = 0;
    for (var i = 0; i < arr.length; i++) { if (arr[i].analysisStatus === 'contextual') { first = i; break; } }
    if (options.initialTarget) {
      first = -1;
      for (var targetAt = 0; targetAt < arr.length; targetAt++) {
        if (arr[targetAt].start <= options.initialTarget.start && arr[targetAt].end >= options.initialTarget.end) { first = targetAt; break; }
      }
    }
    if (first >= 0 && arr.length) { select(first, false); }
    return {
      select: select,
      destroy: function () { dead = true; root.clearTimeout(timer); if (root.removeEventListener) { root.removeEventListener('resize', resize, false); } }
    };
  };
}(typeof window !== 'undefined' ? window : this));
