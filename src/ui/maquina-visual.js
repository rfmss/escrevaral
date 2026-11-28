(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var RATIO = 296 / 1222;
  var PLATEN = 0.60;
  var ROLLER_TOP = 70 / 296;
  var MIN_VISIBLE = 0.62;
  var MAX_SHARE = 0.38;
  var STRIKE = { lift: 1.7, ms: 92 };
  var CARRIAGE = { lift: 2.4, sweep: -12, ms: 215 };
  var IDLE_TIMEOUT_MS = 135;
  var PREF_KEY = 'escrevaral.typewriter.machine.v1';
  var FRAME_FILES = [
    'typewriter-machine-idle',
    'typewriter-machine-strike-1',
    'typewriter-machine-strike-2',
    'typewriter-machine-strike-3',
    'typewriter-machine-strike-4',
    'typewriter-machine-strike-5',
    'typewriter-machine-strike-6',
    'typewriter-machine-strike-7',
    'typewriter-machine-strike-8',
    'typewriter-machine-strike-9'
  ];
  var WEBP_PROBE = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=' ;
  var webpSupport = null;

  /* Máquina Celestial Eternos / Atena — filigrana dourada vazada com múltiplas larguras de linha (0.35px a 2.5px) */
  function makeFallbackSvg(idx) {
    var k = Number(idx) || 0;
    var spoolRot = (k * 14) % 360;
    var ticks = [];
    var x, h, sw, op;
    for (x = 148; x <= 1074; x += 8) {
      if ((x >= 364 && x <= 442) || (x >= 780 && x <= 858)) { continue; }
      var step = (x - 148) / 8;
      if (step % 10 === 0) {
        ticks.push('<line x1="' + x + '" y1="56" x2="' + x + '" y2="69" stroke="url(#eg)" stroke-width="1.25" stroke-opacity="0.92"/>');
        ticks.push('<path d="M' + x + ' 51.8 L' + (x + 2.2) + ' 54 L' + x + ' 56.2 L' + (x - 2.2) + ' 54 Z" fill="#c89b44" fill-opacity="0.82"/>');
      } else if (step % 5 === 0) {
        ticks.push('<line x1="' + x + '" y1="58" x2="' + x + '" y2="68" stroke="#b08434" stroke-width="0.85" stroke-opacity="0.78"/>');
      } else {
        ticks.push('<line x1="' + x + '" y1="61" x2="' + x + '" y2="68" stroke="#9e742b" stroke-width="0.45" stroke-opacity="0.58"/>');
      }
    }

    var fan = [];
    var fi, ang, rad, x1, y1, x2, y2;
    for (fi = -11; fi <= 11; fi += 1) {
      ang = -90 + fi * 4.4;
      rad = (ang * Math.PI) / 180;
      x1 = (611 + Math.cos(rad) * 102).toFixed(1);
      y1 = (318 + Math.sin(rad) * 102).toFixed(1);
      x2 = (611 + Math.cos(rad) * 176).toFixed(1);
      y2 = (318 + Math.sin(rad) * 176).toFixed(1);
      sw = (fi % 2 === 0) ? '1.15' : '0.55';
      op = (fi % 2 === 0) ? '0.78' : '0.52';
      fan.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="url(#eg)" stroke-width="' + sw + '" stroke-opacity="' + op + '"/>');
      if (fi % 2 === 0) {
        fan.push('<circle cx="' + x2 + '" cy="' + y2 + '" r="1.4" fill="#d4aa54" fill-opacity="0.72"/>');
      }
    }

    var strikeArt = '';
    if (k > 0) {
      var sx = 456 + k * 31;
      var sy = 294;
      var mx = Math.round((sx + 611) / 2);
      var my = 192;
      strikeArt =
        '<g class="et-strike">' +
          '<path d="M' + sx + ' ' + sy + ' Q' + mx + ' ' + my + ' 611 94" fill="none" stroke="#f0d38a" stroke-width="3.6" stroke-opacity="0.32" stroke-linecap="round"/>' +
          '<path d="M' + sx + ' ' + sy + ' Q' + mx + ' ' + my + ' 611 94" fill="none" stroke="url(#egb)" stroke-width="1.75" stroke-linecap="round"/>' +
          '<path d="M' + (sx + 4) + ' ' + sy + ' Q' + (mx + 3) + ' ' + my + ' 611 96" fill="none" stroke="#fff2cc" stroke-width="0.55" stroke-opacity="0.88"/>' +
          '<polygon points="611,83 616,94 611,105 606,94" fill="#f7e3a8" stroke="#8a6220" stroke-width="0.85"/>' +
          '<circle cx="611" cy="92" r="14" fill="none" stroke="#e4be6c" stroke-width="0.9" stroke-dasharray="10 5 3 5" stroke-opacity="0.85"/>' +
          '<circle cx="611" cy="92" r="22" fill="none" stroke="#c89a42" stroke-width="0.45" stroke-dasharray="16 8" stroke-opacity="0.55"/>' +
          '<path d="M611 74 L613.2 89.8 L629 92 L613.2 94.2 L611 110 L608.8 94.2 L593 92 L608.8 89.8 Z" fill="#f5de9e" fill-opacity="0.78"/>' +
        '</g>';
    }

    function spool(cx, cy, rot) {
      var spokes = '';
      var si, a, rx, ry;
      for (si = 0; si < 6; si += 1) {
        a = ((si * 60 + rot) * Math.PI) / 180;
        rx = (Math.cos(a) * 66).toFixed(1);
        ry = (Math.sin(a) * 29).toFixed(1);
        spokes += '<line x1="0" y1="0" x2="' + rx + '" y2="' + ry + '" stroke="url(#eg)" stroke-width="0.85" stroke-opacity="0.78"/>';
        spokes += '<circle cx="' + (Math.cos(a) * 44).toFixed(1) + '" cy="' + (Math.sin(a) * 19.5).toFixed(1) + '" r="8.5" fill="none" stroke="#b98d3c" stroke-width="0.7" stroke-opacity="0.62"/>';
        spokes += '<circle cx="' + (Math.cos(a) * 44).toFixed(1) + '" cy="' + (Math.sin(a) * 19.5).toFixed(1) + '" r="1.4" fill="#e6c474" fill-opacity="0.85"/>';
      }
      return (
        '<g transform="translate(' + cx + ',' + cy + ')">' +
          '<ellipse cx="0" cy="6" rx="84" ry="38" fill="#6b4b1c" fill-opacity="0.09" stroke="#855e20" stroke-width="0.65" stroke-opacity="0.48"/>' +
          '<ellipse cx="0" cy="0" rx="84" ry="38" fill="#d9b25e" fill-opacity="0.08" stroke="url(#eg)" stroke-width="2.2"/>' +
          '<ellipse cx="0" cy="0" rx="77" ry="34.5" fill="none" stroke="#b98a36" stroke-width="0.55" stroke-opacity="0.76"/>' +
          '<ellipse cx="0" cy="0" rx="68" ry="30" fill="none" stroke="url(#egb)" stroke-width="1.2" stroke-dasharray="22 8 6 8"/>' +
          '<ellipse cx="0" cy="0" rx="52" ry="23" fill="none" stroke="#9b7028" stroke-width="0.45" stroke-opacity="0.68"/>' +
          spokes +
          '<ellipse cx="0" cy="0" rx="18" ry="8.5" fill="#704d19" fill-opacity="0.2" stroke="url(#egb)" stroke-width="1.45"/>' +
          '<ellipse cx="0" cy="0" rx="10" ry="4.8" fill="none" stroke="#d8ae56" stroke-width="0.75"/>' +
          '<circle cx="0" cy="0" r="2.6" fill="#c99a3e"/>' +
        '</g>'
      );
    }

    function knob(side) {
      var flip = side > 0 ? 'translate(1222,0) scale(-1,1)' : '';
      return (
        '<g transform="' + flip + '">' +
          /* Haste de ligação do carro com duplo filete */
          '<path d="M122 52 L144 38 L148 56 L132 146 L112 152 Z" fill="#cfa34b" fill-opacity="0.1" stroke="url(#eg)" stroke-width="1.65"/>' +
          '<path d="M126 56 L141 46 L144 58 L129 141" fill="none" stroke="#b98a36" stroke-width="0.55" stroke-opacity="0.78"/>' +
          '<rect x="64" y="102" width="52" height="24" rx="4" fill="#9a6f28" fill-opacity="0.14" stroke="url(#eg)" stroke-width="1.35"/>' +
          '<line x1="68" y1="108" x2="112" y2="108" stroke="#d4aa52" stroke-width="0.55" stroke-opacity="0.8"/>' +
          '<line x1="68" y1="120" x2="112" y2="120" stroke="#966c24" stroke-width="0.55" stroke-opacity="0.68"/>' +
          /* Botão astrolábio facetado da extremidade */
          '<path d="M24 72 L58 66 L72 80 L72 148 L58 162 L24 156 L14 138 L14 90 Z" fill="#cfa34b" fill-opacity="0.1" stroke="url(#eg)" stroke-width="2.1"/>' +
          '<path d="M28 77 L56 72 L66 84 L66 144 L56 156 L28 151 L20 136 L20 92 Z" fill="none" stroke="#b88934" stroke-width="0.6" stroke-opacity="0.78"/>' +
          '<line x1="28" y1="96" x2="62" y2="96" stroke="#a6792a" stroke-width="0.55" stroke-opacity="0.68"/>' +
          '<line x1="28" y1="114" x2="62" y2="114" stroke="url(#egb)" stroke-width="1.05" stroke-opacity="0.86"/>' +
          '<line x1="28" y1="132" x2="62" y2="132" stroke="#a6792a" stroke-width="0.55" stroke-opacity="0.68"/>' +
          '<path d="M44 106 L50 114 L44 122 L38 114 Z" fill="none" stroke="#c89a42" stroke-width="0.85"/>' +
          '<circle cx="44" cy="114" r="1.6" fill="#c89a42"/>' +
        '</g>'
      );
    }

    function wing(side) {
      var flip = side > 0 ? 'translate(1222,0) scale(-1,1)' : '';
      return (
        '<g transform="' + flip + '">' +
          /* Asa lateral estilo escudo/lâmina de Atena (vazada, linhas de várias espessuras) */
          '<path d="M74 296 L112 162 Q122 142 152 144 L344 152 Q402 154 432 194 L452 246 L388 296 Z" fill="#c89b44" fill-opacity="0.08" stroke="url(#eg)" stroke-width="2.2"/>' +
          '<path d="M84 296 L119 169 Q128 152 154 153 L340 160 Q392 162 419 198 L437 242 L378 296" fill="none" stroke="#bf903a" stroke-width="0.85" stroke-opacity="0.84"/>' +
          '<path d="M96 296 L128 180 Q135 166 158 167 L332 172 Q378 175 402 206 L418 240 L364 296" fill="none" stroke="#966c24" stroke-width="0.45" stroke-opacity="0.66"/>' +
          /* Ornamento geométrico celestial interno da asa */
          '<path d="M126 256 L220 248 L352 266" fill="none" stroke="url(#eg)" stroke-width="1.25" stroke-opacity="0.8"/>' +
          '<path d="M132 264 L222 256 L346 274" fill="none" stroke="#b68734" stroke-width="0.48" stroke-opacity="0.64"/>' +
          '<path d="M220 241 L228 248 L220 255 L212 248 Z" fill="none" stroke="#c89a42" stroke-width="0.9"/>' +
          '<circle cx="220" cy="248" r="1.6" fill="#c89a42"/>' +
          '<circle cx="152" cy="144" r="2.2" fill="#c89a42"/>' +
          '<circle cx="344" cy="152" r="2.0" fill="#bf903a"/>' +
          /* Linha-constelação fina ligando asa ao carro superior */
          '<path d="M144 134 Q248 112 362 128" fill="none" stroke="#a97d2e" stroke-width="0.48" stroke-dasharray="10 5 2 5" stroke-opacity="0.68"/>' +
          '<circle cx="248" cy="121" r="1.5" fill="#bf903a" fill-opacity="0.88"/>' +
        '</g>'
      );
    }

    function roller(xPos) {
      return (
        '<g transform="translate(' + xPos + ',45)">' +
          '<rect x="0" y="0" width="64" height="36" rx="9" fill="#46331b" fill-opacity="0.34" stroke="url(#eg)" stroke-width="1.85"/>' +
          '<rect x="4" y="4" width="56" height="28" rx="6" fill="none" stroke="#c89a42" stroke-width="0.6" stroke-opacity="0.74"/>' +
          '<line x1="16" y1="1" x2="16" y2="35" stroke="url(#egb)" stroke-width="1.2"/>' +
          '<line x1="48" y1="1" x2="48" y2="35" stroke="url(#egb)" stroke-width="1.2"/>' +
          '<line x1="20" y1="3" x2="20" y2="33" stroke="#b68936" stroke-width="0.48" stroke-opacity="0.7"/>' +
          '<line x1="44" y1="3" x2="44" y2="33" stroke="#b68936" stroke-width="0.48" stroke-opacity="0.7"/>' +
          '<path d="M32 12 L37 18 L32 24 L27 18 Z" fill="none" stroke="#dfb862" stroke-width="0.9"/>' +
          '<circle cx="32" cy="18" r="1.4" fill="#dfb862"/>' +
        '</g>'
      );
    }

    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1222 296" width="1222" height="296">' +
        '<defs>' +
          '<linearGradient id="eg" x1="0%" y1="0%" x2="100%" y2="0%">' +
            '<stop offset="0%" stop-color="#684412"/>' +
            '<stop offset="22%" stop-color="#b5832e"/>' +
            '<stop offset="50%" stop-color="#e3bc66"/>' +
            '<stop offset="78%" stop-color="#ad7c29"/>' +
            '<stop offset="100%" stop-color="#5d3c10"/>' +
          '</linearGradient>' +
          '<linearGradient id="egb" x1="0%" y1="0%" x2="0%" y2="100%">' +
            '<stop offset="0%" stop-color="#edd082"/>' +
            '<stop offset="52%" stop-color="#b98934"/>' +
            '<stop offset="100%" stop-color="#704c16"/>' +
          '</linearGradient>' +
          '<linearGradient id="egv" x1="0%" y1="0%" x2="100%" y2="0%">' +
            '<stop offset="0%" stop-color="#9e7124" stop-opacity="0.1"/>' +
            '<stop offset="50%" stop-color="#cfa34b" stop-opacity="0.28"/>' +
            '<stop offset="100%" stop-color="#9e7124" stop-opacity="0.1"/>' +
          '</linearGradient>' +
        '</defs>' +

        /* Arco traseiro do carro + fita dourada translúcida atravessando os carretéis */
        '<path d="M318 148 L354 128 L868 128 L904 148" fill="none" stroke="url(#eg)" stroke-width="1.5"/>' +
        '<path d="M326 153 L358 134 L864 134 L896 153" fill="none" stroke="#a97c2c" stroke-width="0.5" stroke-opacity="0.68"/>' +
        '<path d="M248 166 C390 156 500 154 611 154 C722 154 832 156 974 166" fill="none" stroke="url(#egv)" stroke-width="12"/>' +
        '<path d="M248 160 C390 150 500 148 611 148 C722 148 832 150 974 160" fill="none" stroke="#b98a36" stroke-width="0.65" stroke-opacity="0.76"/>' +
        '<path d="M248 172 C390 162 500 160 611 160 C722 160 832 162 974 172" fill="none" stroke="#966c24" stroke-width="0.45" stroke-opacity="0.62"/>' +

        /* Leque celestial de hastes de tipos (cesto semicircular vazado) */
        '<path d="M402 296 A222 170 0 0 1 820 296" fill="#c89b44" fill-opacity="0.06" stroke="url(#eg)" stroke-width="1.85"/>' +
        '<path d="M416 296 A206 156 0 0 1 806 296" fill="none" stroke="#b98a36" stroke-width="0.6" stroke-dasharray="14 6 3 6" stroke-opacity="0.78"/>' +
        '<path d="M446 296 A174 128 0 0 1 776 296" fill="none" stroke="#966c24" stroke-width="0.45" stroke-opacity="0.64"/>' +
        fan.join('') +

        /* Carretéis astrolábios esquerdo e direito (giram a cada toque) */
        spool(248, 204, spoolRot) +
        spool(974, 204, -spoolRot) +

        /* Asas laterais vazadas estilo escudo/arma de Atena */
        wing(-1) +
        wing(1) +

        /* Manoplas facetadas esquerda e direita */
        knob(-1) +
        knob(1) +

        /* Régua-guia translúcida do rolo com múltiplas espessuras de graduação */
        '<rect x="134" y="55" width="954" height="17" rx="3" fill="#d9b25e" fill-opacity="0.1"/>' +
        '<line x1="132" y1="55" x2="1090" y2="55" stroke="url(#eg)" stroke-width="1.9"/>' +
        '<line x1="132" y1="58.2" x2="1090" y2="58.2" stroke="#c89a42" stroke-width="0.48" stroke-opacity="0.74"/>' +
        '<line x1="132" y1="71.5" x2="1090" y2="71.5" stroke="url(#eg)" stroke-width="0.95"/>' +
        ticks.join('') +

        /* Dois roletes de pressão em bronze translúcido + anéis dourados */
        roller(370) +
        roller(788) +

        /* Crista central de Atena (guia dos tipos em lança/escudo dourado vazado) */
        '<g class="et-athena-crest">' +
          /* Braços em lança dupla enquadrando a janela de impacto (611, 92) */
          '<path d="M532 142 L578 90 L594 84 L598 92 L585 98 L552 146" fill="#d4aa52" fill-opacity="0.1" stroke="url(#eg)" stroke-width="2.1"/>' +
          '<path d="M690 142 L644 90 L628 84 L624 92 L637 98 L670 146" fill="#d4aa52" fill-opacity="0.1" stroke="url(#eg)" stroke-width="2.1"/>' +
          '<path d="M540 140 L581 94 L593 89 M682 140 L641 94 L629 89" fill="none" stroke="#e2bc68" stroke-width="0.58" stroke-opacity="0.86"/>' +
          /* Escudo central vazado em camadas de filigrana */
          '<path d="M578 132 L598 118 L602 154 L611 164 L620 154 L624 118 L644 132 L658 176 L638 202 L611 232 L584 202 L564 176 Z" fill="#8b6220" fill-opacity="0.13" stroke="url(#egb)" stroke-width="2.2"/>' +
          '<path d="M584 138 L596 129 L599 158 L611 171 L623 158 L626 129 L638 138 L649 174 L632 196 L611 220 L590 196 L573 174 Z" fill="none" stroke="#c89a42" stroke-width="0.78" stroke-opacity="0.88"/>' +
          '<path d="M562 204 L611 246 L660 204" fill="none" stroke="url(#eg)" stroke-width="1.35"/>' +
          '<path d="M548 208 L611 258 L674 208" fill="none" stroke="#b68734" stroke-width="0.52" stroke-dasharray="8 4" stroke-opacity="0.74"/>' +
          /* Medalhão astrolábio no coração da crista */
          '<circle cx="611" cy="186" r="14" fill="none" stroke="url(#egb)" stroke-width="1.15"/>' +
          '<circle cx="611" cy="186" r="9.5" fill="none" stroke="#c89a42" stroke-width="0.52" stroke-dasharray="6 4"/>' +
          '<path d="M611 174 L615.5 186 L611 198 L606.5 186 Z" fill="none" stroke="#d8ae56" stroke-width="1"/>' +
          '<circle cx="611" cy="186" r="2.2" fill="#d8ae56"/>' +
          /* Mira micro-losango sob o ponto de escrita */
          '<path d="M611 98 L614.2 103 L611 108 L607.8 103 Z" fill="none" stroke="#b98a36" stroke-width="0.85"/>' +
          '<circle cx="611" cy="103" r="1.15" fill="#d8ae56"/>' +
          /* Micro-estrelas cardeais nos ombros da crista */
          '<circle cx="578" cy="132" r="1.7" fill="#c89a42"/>' +
          '<circle cx="644" cy="132" r="1.7" fill="#c89a42"/>' +
          '<circle cx="611" cy="232" r="2.0" fill="#c89a42"/>' +
        '</g>' +

        strikeArt +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function isPortableDoc() {
    try {
      if (typeof document !== 'undefined' && document.querySelector) {
        var meta = document.querySelector('meta[name="distribution-mode"]');
        if (meta && meta.getAttribute('content') === 'portable') { return true; }
      }
      if (typeof location !== 'undefined' && location.protocol === 'file:') { return true; }
    } catch (ignore) {}
    return false;
  }

  function frameUrl(idx, ext, baseUrl) {
    var base = baseUrl || 'assets/typewriter/';
    var file = FRAME_FILES[idx] || FRAME_FILES[0];
    return base + file + '.' + (ext || 'webp');
  }

  function detectWebp(done) {
    if (webpSupport !== null) { done(webpSupport); return; }
    if (typeof Image === 'undefined') { webpSupport = true; done(true); return; }
    var probe = new Image();
    probe.onload = function () {
      webpSupport = !!(probe.width > 0 && probe.height > 0);
      done(webpSupport);
    };
    probe.onerror = function () {
      webpSupport = false;
      done(false);
    };
    probe.src = WEBP_PROBE;
  }

  function pickNextStrike(lastIdx) {
    var count = FRAME_FILES.length - 1;
    var pool = [];
    var i;
    for (i = 1; i <= count; i += 1) {
      if (i !== lastIdx) { pool.push(i); }
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function createStrikeBag(count) {
    var total = count || (FRAME_FILES.length - 1);
    var bag = [];
    var last = 0;

    function refill() {
      var i, j, tmp;
      bag = [];
      for (i = 1; i <= total; i += 1) { bag.push(i); }
      for (i = bag.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        tmp = bag[i];
        bag[i] = bag[j];
        bag[j] = tmp;
      }
      if (bag.length > 1 && bag[bag.length - 1] === last) {
        tmp = bag[0];
        bag[0] = bag[bag.length - 1];
        bag[bag.length - 1] = tmp;
      }
    }

    return function next() {
      if (!bag.length) { refill(); }
      last = bag.pop();
      return last;
    };
  }

  function computeGeometry(columnWidth, columnLeft, vw, vh, line) {
    if (!columnWidth || !vh) { return null; }
    var compact = vw && vw < 900;
    var width, height, baseSink, shown, left, bottom, rollerTop, anchorY;
    if (compact) {
      /* Em celulares e tablets, amplia o carro central para o rolo e as hastes
       * permanecerem bem visíveis mesmo com tela estreita ou teclado virtual aberto. */
      var zoomFactor = vw < 560 ? 1.52 : 1.18;
      width = Math.max(vw * zoomFactor, Math.min(columnWidth / PLATEN, vw * 1.65));
      height = width * RATIO;
      baseSink = height * (4 / 242);
      var minH = vw < 560 ? 108 : 132;
      var maxShareCompact = vh < 520 ? 0.36 : 0.34;
      shown = Math.min(height, Math.max(minH, Math.min(vh * maxShareCompact, height * 0.84)));
      left = (vw - width) / 2;
      bottom = shown - height - baseSink;
      rollerTop = vh - shown + baseSink + height * ROLLER_TOP;
      var lineGap = vh < 520 ? 1.6 : 2.2;
      anchorY = Math.max(76, rollerTop - line * lineGap);
    } else {
      width = Math.min(columnWidth / PLATEN, vw);
      height = width * RATIO;
      baseSink = height * (6 / 242);
      shown = Math.min(height, Math.max(vh * MAX_SHARE, height * MIN_VISIBLE));
      var center = columnLeft + columnWidth / 2;
      left = center - width / 2;
      bottom = shown - height - baseSink;
      rollerTop = vh - shown + baseSink + height * ROLLER_TOP;
      anchorY = rollerTop - line * 2.9;
    }
    return {
      width: width,
      height: height,
      left: left,
      bottom: bottom,
      shown: shown,
      rollerTop: rollerTop,
      anchorY: anchorY,
      topInset: Math.max(0, anchorY - line / 2)
    };
  }

  root.Escr.machineCore = {
    RATIO: RATIO,
    PLATEN: PLATEN,
    ROLLER_TOP: ROLLER_TOP,
    IDLE_TIMEOUT_MS: IDLE_TIMEOUT_MS,
    STRIKE: STRIKE,
    CARRIAGE: CARRIAGE,
    FRAME_FILES: FRAME_FILES,
    frameUrl: frameUrl,
    makeFallbackSvg: makeFallbackSvg,
    pickNextStrike: pickNextStrike,
    createStrikeBag: createStrikeBag,
    computeGeometry: computeGeometry
  };

  root.Escr.mountVisualMachine = function (opts) {
    var storage = opts.storage;
    var columnEl = opts.columnEl;
    var baseUrl = opts.baseUrl || 'assets/typewriter/';
    var wrap = null;
    var frames = [];
    var framesLoaded = false;
    var isEnabled = true;
    var activeFocus = false;
    var visible = false;
    var anchorY = null;
    var activeIndex = 0;
    var nextStrike = createStrikeBag(FRAME_FILES.length - 1);
    var idleTimer = null;
    var bounceTimer = null;
    var reflowTimer = null;
    var animObj = null;

    try {
      if (storage) {
        var raw = storage.getItem(PREF_KEY);
        if (raw !== null) { isEnabled = raw === 'true'; }
      }
    } catch (ignore) {}

    function assignFrameSources() {
      var i;
      for (i = 0; i < frames.length; i += 1) {
        frames[i].src = makeFallbackSvg(i);
      }
    }

    function buildWrap() {
      if (wrap) { return wrap; }
      wrap = document.createElement('div');
      wrap.id = 'esc-typewriter-visual';
      wrap.className = 'esc-machine';
      wrap.setAttribute('aria-hidden', 'true');
      var i;
      for (i = 0; i < FRAME_FILES.length; i += 1) {
        var img = document.createElement('img');
        img.className = 'esc-machine-frame' + (i === 0 ? ' esc-machine-active' : '');
        img.alt = '';
        img.draggable = false;
        wrap.appendChild(img);
        frames.push(img);
      }
      document.body.appendChild(wrap);
      if (!framesLoaded) {
        framesLoaded = true;
        detectWebp(function (ok) {
          assignFrameSources(ok ? 'webp' : 'png');
        });
      }
      return wrap;
    }

    function setActiveFrame(idx) {
      if (!frames.length || idx === activeIndex) { return; }
      if (frames[activeIndex]) { frames[activeIndex].classList.remove('esc-machine-active'); }
      if (frames[idx]) { frames[idx].classList.add('esc-machine-active'); }
      activeIndex = idx;
    }

    function reducedMotion() {
      try {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      } catch (e) {
        return false;
      }
    }

    function stopEffects() {
      window.clearTimeout(idleTimer);
      idleTimer = null;
      window.clearTimeout(bounceTimer);
      bounceTimer = null;
      if (reflowTimer) { clearTimeout(reflowTimer); reflowTimer = null; }
      try { if (animObj) { animObj.cancel(); } } catch (ignore) {}
      animObj = null;
      if (wrap) {
        wrap.style.webkitTransform = '';
        wrap.style.transform = '';
      }
      setActiveFrame(0);
    }

    function layout() {
      var show = isEnabled && activeFocus && columnEl && document.body;
      if (!show) {
        stopEffects();
        visible = false;
        anchorY = null;
        if (document.body) {
          document.body.removeAttribute('data-esc-machine');
          if (document.body.style && document.body.style.removeProperty) {
            document.body.style.removeProperty('--esc-machine-top');
          }
        }
        return null;
      }
      buildWrap();
      var rect = columnEl.getBoundingClientRect ? columnEl.getBoundingClientRect() : { width: 700, left: 100 };
      var vv = (typeof window !== 'undefined' && window.visualViewport) ? window.visualViewport : null;
      var layoutVh = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight : 720;
      var vh = (vv && vv.height) ? vv.height : layoutVh;
      var vw = (vv && vv.width) ? vv.width : ((typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 1280);
      var vvOffsetTop = (vv && typeof vv.offsetTop === 'number') ? vv.offsetTop : 0;
      var keyboardLift = Math.max(0, layoutVh - (vh + vvOffsetTop));
      var style = window.getComputedStyle ? window.getComputedStyle(columnEl) : null;
      var fontSize = style ? (parseFloat(style.fontSize) || 21) : 21;
      var line = style ? (parseFloat(style.lineHeight) || fontSize * 1.7) : fontSize * 1.7;
      var geom = computeGeometry(rect.width || vw || 700, rect.left || 0, vw, vh, line);
      if (!geom) { return null; }

      wrap.style.width = geom.width.toFixed(2) + 'px';
      wrap.style.height = geom.height.toFixed(2) + 'px';
      wrap.style.left = geom.left.toFixed(2) + 'px';
      wrap.style.bottom = (geom.bottom + keyboardLift).toFixed(2) + 'px';

      anchorY = geom.anchorY + vvOffsetTop;
      visible = true;
      document.body.setAttribute('data-esc-machine', 'on');
      if (document.body.style && document.body.style.setProperty) {
        var colTop = typeof rect.top === 'number' && isFinite(rect.top) ? rect.top : 0;
        var topInset = Math.max(0, anchorY - colTop - line / 2);
        document.body.style.setProperty('--esc-machine-top', topInset.toFixed(1) + 'px');
      }
      return anchorY;
    }

    function strike(kind) {
      if (!visible || !wrap) { return; }
      if (reducedMotion()) {
        setActiveFrame(0);
        return;
      }
      if (kind === 'return') {
        window.clearTimeout(idleTimer);
        idleTimer = null;
        setActiveFrame(0);
      } else {
        setActiveFrame(nextStrike());
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(function () {
          setActiveFrame(0);
        }, IDLE_TIMEOUT_MS);
      }

      var spec = kind === 'return' ? CARRIAGE : STRIKE;
      if (typeof wrap.animate === 'function') {
        try { if (animObj) { animObj.cancel(); } } catch (ignore) {}
        try {
          var framesAnim = kind === 'return'
            ? [
                { transform: 'translate3d(0,0,0)', easing: 'cubic-bezier(0.22, 0.85, 0.3, 1)' },
                { transform: 'translate3d(' + spec.sweep + 'px,' + spec.lift + 'px,0)', offset: 0.34, easing: 'cubic-bezier(0.32, 0, 0.22, 1)' },
                { transform: 'translate3d(1.4px,0,0)', offset: 0.78, easing: 'ease-out' },
                { transform: 'translate3d(0,0,0)' }
              ]
            : kind === 'backspace'
              ? [
                  { transform: 'translate3d(0,0,0)', easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' },
                  { transform: 'translate3d(2.5px,0.8px,0)', offset: 0.4, easing: 'ease-out' },
                  { transform: 'translate3d(0,0,0)' }
                ]
              : [
                  { transform: 'translate3d(0,0,0)', easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)' },
                  { transform: 'translate3d(0,' + spec.lift + 'px,0)', offset: 0.32, easing: 'cubic-bezier(0.35, 0, 0.25, 1)' },
                  { transform: 'translate3d(0,0,0)' }
                ];
          animObj = wrap.animate(framesAnim, { duration: spec.ms });
          return;
        } catch (ignore) {}
      }
      window.clearTimeout(bounceTimer);
      wrap.style.webkitTransform = 'translate3d(0,' + spec.lift + 'px,0)';
      wrap.style.transform = 'translate3d(0,' + spec.lift + 'px,0)';
      bounceTimer = window.setTimeout(function () {
        if (wrap) {
          wrap.style.webkitTransform = 'translate3d(0,0,0)';
          wrap.style.transform = 'translate3d(0,0,0)';
        }
      }, Math.round(spec.ms * 0.6));
    }

    if (root.Escr.machineSound && root.Escr.machineSound.onStrike) {
      root.Escr.machineSound.onStrike(strike);
    }
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('resize', layout, false);
      window.addEventListener('orientationchange', layout, false);
    }
    if (typeof window !== 'undefined' && window.visualViewport && window.visualViewport.addEventListener) {
      window.visualViewport.addEventListener('resize', layout, false);
      window.visualViewport.addEventListener('scroll', layout, false);
    }

    return {
      setFocusActive: function (on) {
        activeFocus = !!on;
        if (reflowTimer) { clearTimeout(reflowTimer); reflowTimer = null; }
        var res = layout();
        if (activeFocus && typeof setTimeout === "function") { reflowTimer = setTimeout(function () { reflowTimer = null; layout(); }, 40); }
        return res;
      },
      setEnabled: function (on) {
        isEnabled = !!on;
        try {
          if (storage) { storage.setItem(PREF_KEY, isEnabled ? 'true' : 'false'); }
        } catch (ignore) {}
        return layout();
      },
      isEnabled: function () { return isEnabled; },
      anchorY: function () { return anchorY; },
      layout: layout,
      strike: strike,
      activeFrame: function () { return activeIndex; }
    };
  };
}(typeof window !== 'undefined' ? window : this));
