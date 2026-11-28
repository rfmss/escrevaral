/* Ornamentos das Belas Letras: cantoneiras, varão vitoriano e colofão em SVG puro ES5.
 * Sempre periféricos, sem bloquear cliques, leitura ou escrita; zero rede e custo mínimo. */
(function (root) {
  'use strict';
  root.Escr = root.Escr || {};
  var NS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs) {
    var el = document.createElementNS ? document.createElementNS(NS, tag) : document.createElement(tag);
    if (attrs) {
      var k;
      for (k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) {
          el.setAttribute(k, String(attrs[k]));
        }
      }
    }
    return el;
  }

  /* Cantoneira filigranada Alphonse Mucha × Eternos (56x56, espelhável via CSS) */
  function createCorner(position) {
    var wrap = document.createElement('span');
    wrap.className = 'esc-bl-corner esc-bl-corner-' + (position || 'tl');
    wrap.setAttribute('aria-hidden', 'true');
    var svg = svgEl('svg', { viewBox: '0 0 56 56', fill: 'none', 'aria-hidden': 'true', focusable: 'false' });
    /* Dupla haste sinuosa Art Nouveau em L */
    svg.appendChild(svgEl('path', { d: 'M4 52 C4 34, 4 16, 6 10 C8 6, 10 4, 16 4 L52 4', stroke: 'currentColor', 'stroke-width': '1.15', 'stroke-linecap': 'round' }));
    svg.appendChild(svgEl('path', { d: 'M8.5 44 C8.5 29, 8.5 16, 10.5 11.5 C12 8.8, 14 8.5, 20 8.5 L44 8.5', stroke: 'currentColor', 'stroke-width': '0.7', opacity: '0.68', 'stroke-linecap': 'round' }));
    /* Fios orbitais dos Eternos acompanhando a curva do vértice */
    svg.appendChild(svgEl('path', { d: 'M18 4 C14 14, 14 14, 4 18', stroke: 'currentColor', 'stroke-width': '0.6', opacity: '0.52' }));
    svg.appendChild(svgEl('path', { d: 'M26 4 C20 13, 13 20, 4 26', stroke: 'currentColor', 'stroke-width': '0.5', opacity: '0.38' }));
    /* Estrela-losango de 4 pontas no vértice (detalhe joia) */
    svg.appendChild(svgEl('path', { d: 'M15.5 11.5 L17.3 15.5 L21.3 17.3 L17.3 19.1 L15.5 23.1 L13.7 19.1 L9.7 17.3 L13.7 15.5 Z', fill: 'currentColor', opacity: '0.84' }));
    /* Volutas botânicas Mucha nos terminais */
    svg.appendChild(svgEl('path', { d: 'M26 4 C30 9, 34 8.5, 37 5.8 M4 26 C9 30, 8.5 34, 5.8 37', stroke: 'currentColor', 'stroke-width': '0.8', 'stroke-linecap': 'round', opacity: '0.78' }));
    /* Pontos de arremate nas pontas */
    svg.appendChild(svgEl('circle', { cx: '52', cy: '4', r: '1.35', fill: 'currentColor' }));
    svg.appendChild(svgEl('circle', { cx: '4', cy: '52', r: '1.35', fill: 'currentColor' }));
    wrap.appendChild(svg);
    return wrap;
  }

  /* Anexa as 4 cantoneiras silenciosas a um contêiner (position: relative) */
  function attachCorners(parent, variant) {
    if (!parent || !document.createElement) { return; }
    var frame = document.createElement('div');
    frame.className = 'esc-bl-frame' + (variant ? ' esc-bl-frame-' + variant : '');
    frame.setAttribute('aria-hidden', 'true');
    var positions = ['tl', 'tr', 'bl', 'br'], i;
    for (i = 0; i < positions.length; i += 1) {
      frame.appendChild(createCorner(positions[i]));
    }
    parent.appendChild(frame);
    return frame;
  }

  /* Varão Art Nouveau × Eternos (stair rod): hastes esguias com volutas sinuosas e ponta-de-pena central */
  function createStairRod(variant) {
    var wrap = document.createElement('div');
    wrap.className = 'esc-bl-rod' + (variant ? ' esc-bl-rod-' + variant : '');
    wrap.setAttribute('aria-hidden', 'true');
    var svg = svgEl('svg', { viewBox: '0 0 360 18', preserveAspectRatio: 'xMidYMid meet', fill: 'none', 'aria-hidden': 'true', focusable: 'false' });
    /* Pináculo esquerdo */
    svg.appendChild(svgEl('circle', { cx: '5', cy: '9', r: '2.2', fill: 'currentColor', opacity: '0.85' }));
    svg.appendChild(svgEl('path', { d: 'M10 5.5 L10 12.5 M13 6.5 L13 11.5', stroke: 'currentColor', 'stroke-width': '1', 'stroke-linecap': 'round' }));
    /* Haste esquerda + voluta Mucha */
    svg.appendChild(svgEl('line', { x1: '13', y1: '9', x2: '154', y2: '9', stroke: 'currentColor', 'stroke-width': '0.9', opacity: '0.76' }));
    svg.appendChild(svgEl('path', { d: 'M126 9 C136 3.5, 147 4.2, 157 9 C147 13.8, 136 14.5, 126 9', stroke: 'currentColor', 'stroke-width': '0.65', opacity: '0.54' }));
    /* Medalhão central (halo orbital + losango ponta-de-pena) */
    svg.appendChild(svgEl('circle', { cx: '164', cy: '9', r: '1.2', fill: 'currentColor', opacity: '0.72' }));
    svg.appendChild(svgEl('circle', { cx: '180', cy: '9', r: '7.5', stroke: 'currentColor', 'stroke-width': '0.6', opacity: '0.45' }));
    svg.appendChild(svgEl('path', { d: 'M180 2.5 L186.5 9 L180 15.5 L173.5 9 Z', stroke: 'currentColor', 'stroke-width': '1', fill: 'none' }));
    svg.appendChild(svgEl('path', { d: 'M180 5.8 L182.6 9 L180 12.2 L177.4 9 Z', fill: 'currentColor', opacity: '0.86' }));
    svg.appendChild(svgEl('circle', { cx: '196', cy: '9', r: '1.2', fill: 'currentColor', opacity: '0.72' }));
    /* Haste direita + voluta Mucha */
    svg.appendChild(svgEl('path', { d: 'M234 9 C224 3.5, 213 4.2, 203 9 C213 13.8, 224 14.5, 234 9', stroke: 'currentColor', 'stroke-width': '0.65', opacity: '0.54' }));
    svg.appendChild(svgEl('line', { x1: '206', y1: '9', x2: '347', y2: '9', stroke: 'currentColor', 'stroke-width': '0.9', opacity: '0.76' }));
    /* Pináculo direito */
    svg.appendChild(svgEl('path', { d: 'M347 6.5 L347 11.5 M350 5.5 L350 12.5', stroke: 'currentColor', 'stroke-width': '1', 'stroke-linecap': 'round' }));
    svg.appendChild(svgEl('circle', { cx: '355', cy: '9', r: '2.2', fill: 'currentColor', opacity: '0.85' }));
    wrap.appendChild(svg);
    return wrap;
  }

  /* Colofão literário de encerramento (livro aberto + pena + halo Art Nouveau × Eternos) */
  function createColophon() {
    var wrap = document.createElement('div');
    wrap.className = 'esc-bl-colophon';
    wrap.setAttribute('aria-hidden', 'true');
    var svg = svgEl('svg', { viewBox: '0 0 200 32', fill: 'none', 'aria-hidden': 'true', focusable: 'false' });
    /* Volutas laterais Alphonse Mucha + fios oscilantes Eternos */
    svg.appendChild(svgEl('path', { d: 'M14 16 C32 16, 44 7, 66 16 C48 20, 34 21, 14 16 Z', stroke: 'currentColor', 'stroke-width': '0.85', opacity: '0.66' }));
    svg.appendChild(svgEl('path', { d: 'M186 16 C168 16, 156 7, 134 16 C152 20, 166 21, 186 16 Z', stroke: 'currentColor', 'stroke-width': '0.85', opacity: '0.66' }));
    svg.appendChild(svgEl('path', { d: 'M24 16 C42 9, 56 10, 74 16 M176 16 C158 9, 144 10, 126 16', stroke: 'currentColor', 'stroke-width': '0.55', opacity: '0.45' }));
    /* Halo orbital central */
    svg.appendChild(svgEl('circle', { cx: '100', cy: '16', r: '12.5', stroke: 'currentColor', 'stroke-width': '0.7', opacity: '0.52' }));
    svg.appendChild(svgEl('circle', { cx: '100', cy: '16', r: '9.5', stroke: 'currentColor', 'stroke-width': '0.55', opacity: '0.38' }));
    /* Silhueta de livro aberto + bico de pena literária ao centro */
    svg.appendChild(svgEl('path', { d: 'M86 21 C91 18.5, 96 18.5, 100 21 C104 18.5, 109 18.5, 114 21 L114 13 C109 11, 104 11, 100 13.5 C96 11, 91 11, 86 13 Z', stroke: 'currentColor', 'stroke-width': '0.95', fill: 'currentColor', 'fill-opacity': '0.12' }));
    svg.appendChild(svgEl('path', { d: 'M100 4 L103 11.5 L100 14 L97 11.5 Z', fill: 'currentColor', opacity: '0.88' }));
    svg.appendChild(svgEl('line', { x1: '100', y1: '13.5', x2: '100', y2: '21', stroke: 'currentColor', 'stroke-width': '0.85' }));
    /* Estrelas de remate */
    svg.appendChild(svgEl('circle', { cx: '8', cy: '16', r: '1.3', fill: 'currentColor', opacity: '0.72' }));
    svg.appendChild(svgEl('circle', { cx: '192', cy: '16', r: '1.3', fill: 'currentColor', opacity: '0.72' }));
    wrap.appendChild(svg);
    return wrap;
  }

  root.Escr.ornaments = {
    attachCorners: attachCorners,
    createCorner: createCorner,
    createStairRod: createStairRod,
    createColophon: createColophon
  };
}(typeof window !== 'undefined' ? window : this));
