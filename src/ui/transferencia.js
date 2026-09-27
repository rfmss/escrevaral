/* Transporte explícito de texto/pacotes. ES5; sem rede e sem acesso ao manuscrito. */
(function (root) {
  'use strict';
  var E = root.Escr;
  function selectRange(field, start, end) {
    if (!field || typeof field.value !== 'string' || typeof start !== 'number' || typeof end !== 'number' ||
        !isFinite(start) || !isFinite(end) || start % 1 || end % 1 || start < 0 || end < start || end > field.value.length) { return false; }
    try { if (field.setSelectionRange) { field.setSelectionRange(start, end); return typeof field.selectionStart !== 'number' || (field.selectionStart === start && field.selectionEnd === end); } } catch (ignore) {}
    try {
      if (typeof field.selectionStart === 'number') {
        field.selectionStart = start; field.selectionEnd = end;
        return field.selectionStart === start && field.selectionEnd === end;
      }
    } catch (ignore2) {}
    return false;
  }
  function download(contents, mime, name, fallback, host) {
    var D = root.document, urlAPI = root.URL || root.webkitURL, url, a;
    try {
      if (!root.Blob) { throw new Error('blob'); }
      var blob = new root.Blob([contents], { type: mime + ';charset=utf-8' });
      if (root.navigator.msSaveBlob && root.navigator.msSaveBlob(blob, name) !== false) { return true; }
      a = D.createElement('a');
      if (!('download' in a) || !a.click || !urlAPI || !urlAPI.createObjectURL) { throw new Error('download'); }
      url = urlAPI.createObjectURL(blob); a.href = url; a.download = name;
      (host || D.body).appendChild(a); a.click();
      return true;
    } catch (error) { fallback(contents, name); return false; }
    finally {
      if (a && a.parentNode) { a.parentNode.removeChild(a); }
      if (url && urlAPI.revokeObjectURL) { root.setTimeout(function () { urlAPI.revokeObjectURL(url); }, 120000); }
    }
  }
  function read(file, done) {
    var reader, ended = false;
    function finish(error, value) { if (!ended) { ended = true; done(error, value); } }
    try {
      if (!root.FileReader) { throw new Error('Este navegador não lê arquivos. Use “Trazer conteúdo copiado”.'); }
      reader = new root.FileReader();
      reader.onerror = function () { finish(new Error('O arquivo não pôde ser lido. O acervo permanece.')); };
      reader.onabort = function () { finish(new Error('Leitura cancelada. O acervo permanece.')); };
      reader.onload = function () { finish(null, String(reader.result)); };
      reader.readAsText(file, 'UTF-8');
    } catch (error) { finish(error); }
  }
  E.transfer = { selectRange: selectRange, download: download, read: read };
}(window));
