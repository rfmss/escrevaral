'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const modules = require('../modules.json');
function bundle() {
  const seen = new Set();
  const parts = ["/* Gerado por scripts/build.cjs. Fontes ES5 em src/. */\n(function () {\n'use strict';"];
  for (const mod of modules) {
    if (!/^[a-z][a-zA-Z0-9]*$/.test(mod.id) || seen.has(mod.id)) throw Error('Módulo inválido/duplicado: ' + mod.id);
    if (!/^src\/[a-z/]+\.js$/.test(mod.source)) throw Error('Fonte inválida: ' + mod.source);
    for (const dep of mod.deps) if (!seen.has(dep)) throw Error('Dependência ausente, circular ou fora de ordem: ' + dep);
    parts.push('/* ' + mod.source + ' */\nvar ' + mod.id + ' = ' + fs.readFileSync(path.join(root, mod.source), 'utf8').trim() + '(' + mod.deps.join(', ') + ');');
    seen.add(mod.id);
  }
  parts.push('iniciar.start(window, document);\n}());\n');
  return parts.join('\n');
}
function build() {
  const js = bundle();
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'styles/mesa.css'), 'utf8');
  const files = { 'index.html': html, 'styles/mesa.css': css, 'assets/mesa.js': js };
  fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(root, 'assets/mesa.js'), js);
  fs.rmSync(path.join(root, 'dist'), { recursive: true, force: true });
  for (const [name, text] of Object.entries(files)) {
    const out = path.join(root, 'dist/site', name);
    fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, text);
  }
  const portable = html.replace('<link rel="stylesheet" href="styles/mesa.css">', () => '<style>\n' + css + '\n</style>')
    .replace('<script src="assets/mesa.js"></script>', () => '<script>\n' + js + '\n</script>');
  fs.writeFileSync(path.join(root, 'dist/escrevaral-portatil.html'), portable);
  console.log(JSON.stringify({ javascript: Buffer.byteLength(js), css: Buffer.byteLength(css), html: Buffer.byteLength(html), portable: Buffer.byteLength(portable) }));
}
if (require.main === module) build();
module.exports = { bundle, build };
