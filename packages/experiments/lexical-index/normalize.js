/* Consulta experimental; ES5, sem polyfill global. */
'use strict';
var composed = 'áàâãäéèêëíìîïóòôõöúùûüç';
var expanded = ['a\u0301','a\u0300','a\u0302','a\u0303','a\u0308',
  'e\u0301','e\u0300','e\u0302','e\u0308','i\u0301','i\u0300','i\u0302','i\u0308',
  'o\u0301','o\u0300','o\u0302','o\u0303','o\u0308','u\u0301','u\u0300','u\u0302','u\u0308','c\u0327'];
exports.id = 'pt-latin-decomposed-lower-v1';
exports.key = function (text) {
  var lower = text.toLowerCase(), out = '', i, n;
  for (i = 0; i < lower.length; i += 1) {
    n = composed.indexOf(lower.charAt(i));
    out += n < 0 ? lower.charAt(i) : expanded[n];
  }
  return out;
};
exports.utf8Bytes = function (text) {
  var bytes = 0, i, c, d;
  for (i = 0; i < text.length; i += 1) {
    c = text.charCodeAt(i);
    if (c < 128) bytes += 1;
    else if (c < 2048) bytes += 2;
    else if (c >= 0xD800 && c <= 0xDBFF && i + 1 < text.length &&
      (d = text.charCodeAt(i + 1)) >= 0xDC00 && d <= 0xDFFF) { bytes += 4; i += 1; }
    else bytes += 3;
  }
  return bytes;
};
