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

  /* Cantoneira filigranada inspirada em livros ilustrados / AFK Journey (48x48, espelhável via CSS) */
  function createCorner(position) {
    var wrap = document.createElement('span');
    wrap.className = 'esc-bl-corner esc-bl-corner-' + (position || 'tl');
    wrap.setAttribute('aria-hidden', 'true');
    var svg = svgEl('svg', { viewBox: '0 0 56 56', fill: 'none', 'aria-hidden': 'true', focusable: 'false' });
    /* Moldura dupla em L com recuo delicado */
    svg.appendChild(svgEl('path', { d: 'M4 52 L4 12 Q4 4 12 4 L52 4', stroke: 'currentColor', 'stroke-width': '1.2', 'stroke-linecap': 'round' }));
    svg.appendChild(svgEl('path', { d: 'M9 44 L9 15 Q9 9 15 9 L44 9', stroke: 'currentColor', 'stroke-width': '0.75', opacity: '0.72', 'stroke-linecap': 'round' }));
    /* Estrela-losango de 4 pontas no vértice (detalhe joia) */
    svg.appendChild(svgEl('path', { d: 'M15.5 11.5 L17.3 15.5 L21.3 17.3 L17.3 19.1 L15.5 23.1 L13.7 19.1 L9.7 17.3 L13.7 15.5 Z', fill: 'currentColor', opacity: '0.82' }));
    /* Pequenas volutas botânicas nos terminais */
    svg.appendChild(svgEl('path', { d: 'M24 4 Q27 9 32 7.5', stroke: 'currentColor', 'stroke-width': '0.9', 'stroke-linecap': 'round' }));
    svg.appendChild(svgEl('path', { d: 'M4 24 Q9 27 7.5 32', stroke: 'currentColor', 'stroke-width': '0.9', 'stroke-linecap': 'round' }));
    /* Pontos de arremate nas pontas (estilo varão torneado) */
    svg.appendChild(svgEl('circle', { cx: '52', cy: '4', r: '1.4', fill: 'currentColor' }));
    svg.appendChild(svgEl('circle', { cx: '4', cy: '52', r: '1.4', fill: 'currentColor' }));
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

  /* Varão Vitoriano (stair rod): barra finíssima com pináculos torneados nas pontas e losango central */
  function createStairRod(variant) {
    var wrap = document.createElement('div');
    wrap.className = 'esc-bl-rod' + (variant ? ' esc-bl-rod-' + variant : '');
    wrap.setAttribute('aria-hidden', 'true');
    var svg = svgEl('svg', { viewBox: '0 0 360 16', preserveAspectRatio: 'xMidYMid meet', fill: 'none', 'aria-hidden': 'true', focusable: 'false' });
    /* Pináculo esquerdo (bola + anéis torneados) */
    svg.appendChild(svgEl('circle', { cx: '5', cy: '8', r: '2.5', fill: 'currentColor', opacity: '0.85' }));
    svg.appendChild(svgEl('path', { d: 'M10 4.8 L10 11.2 M13 5.8 L13 10.2', stroke: 'currentColor', 'stroke-width': '1.1', 'stroke-linecap': 'round' }));
    /* Haste esquerda */
    svg.appendChild(svgEl('line', { x1: '13', y1: '8', x2: '158', y2: '8', stroke: 'currentColor', 'stroke-width': '0.95', opacity: '0.78' }));
    /* Medalhão central (losango + 2 pontos laterais) */
    svg.appendChild(svgEl('circle', { cx: '165', cy: '8', r: '1.3', fill: 'currentColor', opacity: '0.7' }));
    svg.appendChild(svgEl('path', { d: 'M180 2.5 L186.5 8 L180 13.5 L173.5 8 Z', stroke: 'currentColor', 'stroke-width': '1.05', fill: 'none' }));
    svg.appendChild(svgEl('path', { d: 'M180 5.4 L182.6 8 L180 10.6 L177.4 8 Z', fill: 'currentColor', opacity: '0.85' }));
    svg.appendChild(svgEl('circle', { cx: '195', cy: '8', r: '1.3', fill: 'currentColor', opacity: '0.7' }));
    /* Haste direita */
    svg.appendChild(svgEl('line', { x1: '202', y1: '8', x2: '347', y2: '8', stroke: 'currentColor', 'stroke-width': '0.95', opacity: '0.78' }));
    /* Pináculo direito */
    svg.appendChild(svgEl('path', { d: 'M347 5.8 L347 10.2 M350 4.8 L350 11.2', stroke: 'currentColor', 'stroke-width': '1.1', 'stroke-linecap': 'round' }));
    svg.appendChild(svgEl('circle', { cx: '355', cy: '8', r: '2.5', fill: 'currentColor', opacity: '0.85' }));
    wrap.appendChild(svg);
    return wrap;
  }

  /* Colofão de encerramento de capítulo / leitura (ramo tipográfico simétrico) */
  function createColophon() {
    var wrap = document.createElement('div');
    wrap.className = 'esc-bl-colophon';
    wrap.setAttribute('aria-hidden', 'true');
    var svg = svgEl('svg', { viewBox: '0 0 180 26', fill: 'none', 'aria-hidden': 'true', focusable: 'false' });
    /* Ramos laterais */
    svg.appendChild(svgEl('path', { d: 'M18 13 C34 13, 44 6, 62 13 C48 16, 36 17, 18 13 Z', stroke: 'currentColor', 'stroke-width': '0.85', opacity: '0.68' }));
    svg.appendChild(svgEl('path', { d: 'M162 13 C146 13, 136 6, 118 13 C132 16, 144 17, 162 13 Z', stroke: 'currentColor', 'stroke-width': '0.85', opacity: '0.68' }));
    svg.appendChild(svgEl('line', { x1: '62', y1: '13', x2: '78', y2: '13', stroke: 'currentColor', 'stroke-width': '0.9' }));
    svg.appendChild(svgEl('line', { x1: '102', y1: '13', x2: '118', y2: '13', stroke: 'currentColor', 'stroke-width': '0.9' }));
    /* Estrela central de belas letras */
    svg.appendChild(svgEl('path', { d: 'M90 3.5 L93 10.2 L99.5 13 L93 15.8 L90 22.5 L87 15.8 L80.5 13 L87 10.2 Z', stroke: 'currentColor', 'stroke-width': '1', fill: 'currentColor', 'fill-opacity': '0.2' }));
    svg.appendChild(svgEl('circle', { cx: '90', cy: '13', r: '1.6', fill: 'currentColor' }));
    svg.appendChild(svgEl('circle', { cx: '12', cy: '13', r: '1.4', fill: 'currentColor', opacity: '0.7' }));
    svg.appendChild(svgEl('circle', { cx: '168', cy: '13', r: '1.4', fill: 'currentColor', opacity: '0.7' }));
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
