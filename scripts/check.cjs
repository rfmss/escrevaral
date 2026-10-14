'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const acorn = require('acorn');
const root = path.resolve(__dirname, '..');
const modules = require('../modules.json');
const { bundle } = require('./build.cjs');
const allowed = {
  documento: [], repositorio: ['documento'], sessao: ['documento'], plataforma: [],
  transferencia: [], mesa: [], coordenador: [],
  iniciar: ['repositorio', 'sessao', 'plataforma', 'transferencia', 'mesa', 'coordenador']
};
function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  if (node.type) visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(v => walk(v, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}
for (const mod of modules) {
  const source = fs.readFileSync(path.join(root, mod.source), 'utf8');
  const ast = acorn.parse(source, { ecmaVersion: 5 });
  assert.deepEqual(mod.deps, allowed[mod.id], 'Mudança de fronteira exige revisão do contrato: ' + mod.id);
  assert.equal(ast.body.length, 1);
  assert.equal(ast.body[0].expression.type, 'FunctionExpression');
  assert.equal(ast.body[0].expression.params.length, mod.deps.length);
  walk(ast, node => {
    if (node.type !== 'Identifier') return;
    assert(!['eval', 'Function', 'fetch', 'XMLHttpRequest', 'WebSocket'].includes(node.name), 'Rede/eval fora da fundação: ' + mod.id);
    if (['documento', 'repositorio', 'sessao', 'coordenador'].includes(mod.id)) {
      assert(!['window', 'document', 'localStorage', 'navigator'].includes(node.name), 'Dependência global em ' + mod.id);
    }
    if (mod.id !== 'plataforma') assert(node.name !== 'localStorage', 'localStorage fora da plataforma');
  });
}
const js = bundle();
acorn.parse(js, { ecmaVersion: 5 });
assert(Buffer.byteLength(js) < 150 * 1024, 'Orçamento JS');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(html), 'Script inline na fonte HTML');
assert(!/\son[a-z]+\s*=/i.test(html), 'Handler inline');
const css = fs.readFileSync(path.join(root, 'styles/mesa.css'), 'utf8');
assert(Buffer.byteLength(css) < 80 * 1024, 'Orçamento CSS');
assert(!/@import|https?:\/\/|display:\s*(grid|flex)|backdrop-filter|@container/.test(css), 'CSS fora do piso aprovado');
console.log('PASS: ES5, composição privada, fronteiras, ausência de rede e orçamentos.');
