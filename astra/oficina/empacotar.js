/* Ferramenta opcional de manutenção. O produto pronto não precisa de Node. */
'use strict';
var fs = require('fs'), path = require('path'), root = path.resolve(__dirname, '..');
var html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, function (_, file) {
  return '<style>\n' + fs.readFileSync(path.join(root, file), 'utf8') + '\n</style>';
});
html = html.replace(/<script src="([^"]+)"><\/script>/g, function (_, file) {
  return '<script>\n' + fs.readFileSync(path.join(root, file), 'utf8').replace(/<\/script/gi, '<\\/script') + '\n</script>';
});
if (process.argv.indexOf('--check') !== -1) {
  if (fs.readFileSync(path.join(root, 'escrevaral.html'), 'utf8') !== html) { throw new Error('A mesa portátil está desatualizada. Rode node astra/oficina/empacotar.js.'); }
} else {
  fs.writeFileSync(path.join(root, 'escrevaral.html'), html);
  console.log('Mesa portátil: ' + Buffer.byteLength(html) + ' bytes.');
}
