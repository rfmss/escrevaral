/* Consulta lexical explícita. Dados pequenos incorporados; nenhum acesso a DOM/rede. */
(function (root) {
  'use strict';
  var E = root.Escr, own = Object.prototype.hasOwnProperty, data = E.ownPtLexicon;
  E.lookupLexeme = function (value) {
    var key, rows, total;
    if (typeof value !== 'string' || value.length > 64) {
      return { state: 'invalid', message: 'Consulte uma palavra de até 64 caracteres.' };
    }
    key = E.reading.canonical(value.replace(/^\s+|\s+$/g, ''));
    if (!/^[a-zà-öø-ÿ]+(?:[-'’][a-zà-öø-ÿ]+)*$/.test(key)) {
      return { state: 'invalid', message: 'Selecione ou digite uma única palavra.' };
    }
    if (!own.call(data.entries, key)) {
      return { state: 'uncovered', query: key, message: 'Esta forma não está no recorte local de ' + data.headwords + ' palavras. Isso não indica erro de escrita. Flexões ainda não são reunidas ao lema.' };
    }
    /* Só esta chave é desserializada; sem índice adicional, cache ou varredura do texto. */
    rows = JSON.parse(data.entries[key]); total = rows.length;
    return { state: 'found', query: key, senses: rows.slice(0, 24), total: total,
      limited: total > 24, source: data.source, version: data.version, license: data.license };
  };
}(typeof window !== 'undefined' ? window : this));
