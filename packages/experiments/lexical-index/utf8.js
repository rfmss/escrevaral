/* ES5. Decodificação estrita e limitada; sem TextDecoder nem normalização. */
'use strict';
function fail(code) { var e = new Error(code); e.code = code; throw e; }
exports.decode = function (buffer, maxEncodedBytes, maxDecodedBytes) {
  if (typeof maxEncodedBytes !== 'number' || maxEncodedBytes <= 0 || maxEncodedBytes % 1 || !isFinite(maxEncodedBytes) ||
      typeof maxDecodedBytes !== 'number' || maxDecodedBytes <= 0 || maxDecodedBytes % 1 || !isFinite(maxDecodedBytes)) { fail('INVALID_UTF8_LIMIT'); }
  if (Object.prototype.toString.call(buffer) !== '[object ArrayBuffer]' || buffer.byteLength > maxEncodedBytes) { fail('ENCODED_LIMIT'); }
  var bytes = new Uint8Array(buffer), i = 0, out = '', c, cp, n, minimum, j, b, units;
  while (i < bytes.length) {
    c = bytes[i++];
    if (c < 128) { cp = c; n = 0; minimum = 0; }
    else if (c >= 194 && c <= 223) { cp = c & 31; n = 1; minimum = 128; }
    else if (c >= 224 && c <= 239) { cp = c & 15; n = 2; minimum = 2048; }
    else if (c >= 240 && c <= 244) { cp = c & 7; n = 3; minimum = 65536; }
    else { fail('INVALID_UTF8'); }
    if (i + n > bytes.length) { fail('INVALID_UTF8'); }
    for (j = 0; j < n; j += 1) {
      b = bytes[i++]; if (b < 128 || b > 191) { fail('INVALID_UTF8'); }
      cp = cp * 64 + (b & 63);
    }
    if (cp < minimum || cp > 1114111 || (cp >= 55296 && cp <= 57343)) { fail('INVALID_UTF8'); }
    units = cp > 65535 ? 2 : 1;
    if ((out.length + units) * 2 > maxDecodedBytes) { fail('DECODED_LIMIT'); }
    if (units === 1) { out += String.fromCharCode(cp); }
    else { cp -= 65536; out += String.fromCharCode(55296 + Math.floor(cp / 1024), 56320 + cp % 1024); }
  }
  return out;
};
