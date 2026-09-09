/* Ferramenta opcional de manutenção. O produto pronto não precisa de Node. */
'use strict';
var fs = require('fs'), path = require('path'), root = path.resolve(__dirname, '..');
var html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
/* Marca e ícones também viajam no arquivo portátil, inclusive em navegadores sem favicon SVG. */
html = html.replace(/(\b(?:src|href)=")((?:superficie\/marca\/)[^"<>]+)(")/g, function (_, before, file, after) {
  var ext = path.extname(file), mime = ext === '.svg' ? 'image/svg+xml' : ext === '.png' ? 'image/png' : null;
  if (!mime) { throw new Error('Formato de marca não previsto: ' + file); }
  return before + 'data:' + mime + ';base64,' + fs.readFileSync(path.join(root, file)).toString('base64') + after;
});
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
