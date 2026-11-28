/* Testes do Pino-Mola (Spring Jog-Shuttle) — física de gesto, velocidade elástica e CSS.
 * Executar: node tests/pino-mola.cjs */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const scripts = require('./helpers/sources.cjs').scripts();

const root = path.resolve(__dirname, '..');
const context = vm.createContext({ Escr: {} });
context.window = context;

const src = scripts.find(s => s.includes('root.Escr.pinoMolaCore ='));
assert.ok(src, 'Módulo src/ui/pino-mola.js não encontrado no build');
vm.runInContext(src, context);

const core = context.Escr.pinoMolaCore;

// 1. Detecção de overflow (não aparece quando tudo cabe na tela)
assert.equal(core.hasOverflow(400, 400), false);
assert.equal(core.hasOverflow(403, 400), false);
assert.equal(core.hasOverflow(520, 400), true);

// 2. Velocidade do Jog-Shuttle elástico (zona morta no centro + curva quadrática simétrica)
assert.equal(core.velocityFromOffset(0), 0);
assert.equal(core.velocityFromOffset(2), 0);
assert.equal(core.velocityFromOffset(-2), 0);
const slowDown = core.velocityFromOffset(8);
const fastDown = core.velocityFromOffset(26);
assert.ok(slowDown > 0 && fastDown > slowDown * 4, 'Puxar mais deve acelerar suavemente');
assert.equal(core.velocityFromOffset(-15), -core.velocityFromOffset(15), 'Simetria cima/baixo');

// 3. Deflexão de gesto passivo (acena na direção da rolagem e volta ao centro)
assert.equal(core.gestureDeflection(0), 0);
assert.ok(core.gestureDeflection(40) > 0 && core.gestureDeflection(40) <= core.MAX_GESTURE);
assert.ok(core.gestureDeflection(-40) < 0 && core.gestureDeflection(-40) >= -core.MAX_GESTURE);

// 4. Rótulos de progresso discretos (Topo, %, Fim)
assert.equal(core.progressLabel(0, 1000, 400), 'Topo');
assert.equal(core.progressLabel(300, 1000, 400), '50%');
assert.equal(core.progressLabel(600, 1000, 400), 'Fim');
assert.equal(core.progressLabel(0, 400, 400), '');

// 5. CSS oculta barras nativas feias nos containers do Pino-Mola
const temasCss = fs.readFileSync(path.join(root, 'src/ui/styles/temas-linux.css'), 'utf8');
assert.ok(temasCss.includes('.esc-pino-scroller::-webkit-scrollbar'), 'CSS oculta webkit-scrollbar');
assert.ok(temasCss.includes('cubic-bezier(0.22, 1.42, 0.36, 1)'), 'Mola elástica de retorno ao centro');

console.log('OK: Pino-Mola (física Jog-Shuttle, aceno por gesto, retorno elástico e ocultação de barra nativa) verificado.');
