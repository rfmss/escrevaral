/* Executar: node tests/ferramentas-pomodoro-calculadora.cjs */
'use strict';
const vm = require('node:vm');
const assert = require('node:assert/strict');
const scripts = require('./helpers/sources.cjs').scripts();

const storeMap = {};
const storage = {
  getItem: k => (Object.prototype.hasOwnProperty.call(storeMap, k) ? storeMap[k] : null),
  setItem: (k, v) => { storeMap[k] = String(v); }
};
const ctx = vm.createContext({ window: null, document: {} });
ctx.window = ctx;
for (const marker of ['root.Escr.pomodoroCore =', 'root.Escr.calculatorMath =']) {
  vm.runInContext(scripts.find(s => s.includes(marker)), ctx);
}
const E = ctx.Escr;

// 1. Pomodoro Dock Engine (50/6 min, transição Escrita -> Pausa, configuração persistida)
const eng = E.pomodoroCore.createEngine({ storage });
assert.equal(eng.snapshot().formatted, '50:00');
assert.equal(eng.snapshot().label, 'Escrita');
eng.configure(1, 2);
assert.equal(eng.snapshot().formatted, '01:00');
let breakTriggered = false;
eng.subscribe((s, ev) => { if (ev === 'break-start') breakTriggered = true; });
eng.start();
for (let i = 0; i < 60; i += 1) eng.tick();
assert.equal(breakTriggered, true);
assert.equal(eng.snapshot().phase, 'break');
assert.equal(eng.snapshot().formatted, '02:00');
eng.reset();
assert.equal(eng.snapshot().phase, 'write');
assert.equal(eng.snapshot().running, false);

// 2. Calculadora Editorial — 4 modos (sem eval!)
assert.equal(E.calculatorMath.calculate('(120 + 30) × 2 ÷ 3').value, 100);
assert.equal(E.calculatorMath.calculate('0,1 + 0,2').value, 0.3);
assert.throws(() => E.calculatorMath.calculate('10 / 0'));
assert.throws(() => E.calculatorMath.calculate('process.exit(1)'));

const pg = E.calculatorMath.pages({ amount: '2500', perPage: '250', unit: 'words' });
assert.equal(pg.value, 10);
assert.ok(pg.text.includes('páginas'));

const ld = E.calculatorMath.pages({ amount: '4200', perPage: '2100', unit: 'characters' });
assert.equal(ld.value, 2);
assert.ok(ld.text.includes('laudas'));

const orc = E.calculatorMath.budget({ quantity: '10', rate: '45,50' });
assert.equal(orc.value, 455);

const tm = E.calculatorMath.time({ amount: '3000', pace: '500', daily: '2' });
assert.equal(tm.value, 6);
assert.ok(tm.text.includes('6 h 0 min'));
assert.ok(tm.detail.includes('3 dia(s)'));

console.log('OK: Pomodoro Dock (50/6 min + pausa) e Calculadora Editorial 4 modos (Conta, Páginas/Laudas, Orçamento, Tempo) verificados.');
