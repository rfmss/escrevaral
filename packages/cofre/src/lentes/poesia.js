(function (root) {
  'use strict';
  var E = root.Escr, S = E.instruments, D = E.poetryData;
  var vowels = 'aeiouáàâãéêíóôõúü', own = Object.prototype.hasOwnProperty;
  function isV(c) { return c && vowels.indexOf(c) >= 0; }
  function compose(word) {
    var bases = { 'a': { '\u0301': 'á', '\u0300': 'à', '\u0302': 'â', '\u0303': 'ã' }, 'e': { '\u0301': 'é', '\u0302': 'ê' }, 'i': { '\u0301': 'í' }, 'o': { '\u0301': 'ó', '\u0302': 'ô', '\u0303': 'õ' }, 'u': { '\u0301': 'ú', '\u0308': 'ü' }, 'c': { '\u0327': 'ç' } };
    return word.toLowerCase().replace(/([aeiouc])([\u0300-\u036f])/g, function (m, b, a) { return bases[b][a] || m; });
  }
  function syllables(input) {
    var w = compose(input), nuclei = [], cuts = [], i, last, start, gap;
    if (!/^[a-záàâãéêíóôõúüç]+$/.test(w) || w.length > 60) { return null; }
    if (own.call(D.readings, w)) { return D.readings[w].slice(); }
    for (i = 0; i < w.length; i += 1) {
      if (!isV(w.charAt(i))) { continue; }
      if (w.charAt(i) === 'u' && i > 0 && ((w.charAt(i - 1) === 'q' && isV(w.charAt(i + 1))) || (w.charAt(i - 1) === 'g' && 'eiéêí'.indexOf(w.charAt(i + 1)) >= 0 && w.charAt(i + 1)))) { continue; }
      last = nuclei[nuclei.length - 1];
      if (last && last.end === i && last.end - last.start === 1 && D.diphthongs.indexOf(w.slice(i - 1, i + 1)) >= 0) { last.end += 1; }
      else { nuclei.push({ start: i, end: i + 1 }); }
    }
    if (!nuclei.length) { return null; }
    for (i = 1; i < nuclei.length; i += 1) {
      gap = w.slice(nuclei[i - 1].end, nuclei[i].start);
      start = nuclei[i].start;
      if (gap.length) { start -= gap.length >= 2 && D.inseparable.indexOf(gap.slice(-2)) >= 0 ? 2 : 1; }
      cuts.push(start);
    }
    var result = []; start = 0;
    cuts.forEach(function (cut) { result.push(w.slice(start, cut)); start = cut; }); result.push(w.slice(start));
    return result;
  }
  function wordReading(input) {
    var w = compose(input), parts = syllables(w), tonic = -1, i;
    if (!parts) { return null; }
    for (i = 0; i < parts.length; i += 1) { if (/[áéíóúâêô]/.test(parts[i])) { tonic = i; break; } }
    if (tonic < 0) { tonic = parts.length > 1 && !/(?:ão|ãos|ãe|ães|õe|ões|ã|ãs)$/.test(w) && /(?:[aeo]s?|am|em|ens)$/.test(w) ? parts.length - 2 : parts.length - 1; }
    var suffix = parts.slice(tonic).join(''), vowel = suffix.search(/[aeiouáàâãéêíóôõúü]/);
    return { word: w, syllables: parts, tonic: tonic, rhyme: suffix.slice(vowel) };
  }
  function scan(line) {
    var ts = S.tokens(line), readings = [], raw = 0, fusions = 0, i, r, last;
    if (!ts.length || line.length > 2000) { return null; }
    for (i = 0; i < ts.length; i += 1) {
      r = wordReading(ts[i].value); if (!r) { return null; }
      readings.push(r); raw += r.syllables.length;
      if (i > 0 && /^[ \t]+$/.test(line.slice(ts[i - 1].end, ts[i].start)) && isV(readings[i - 1].word.slice(-1)) && (isV(r.word.charAt(0)) || (r.word.charAt(0) === 'h' && isV(r.word.charAt(1))))) { fusions += 1; }
    }
    last = readings[readings.length - 1];
    var max = raw - (last.syllables.length - last.tonic - 1);
    return { min: Math.max(1, max - fusions), max: max, raw: raw, possibleFusions: fusions, words: readings, lastStart: ts[ts.length - 1].start, lastEnd: ts[ts.length - 1].end, rhyme: last.rhyme };
  }
  function lines(text, visitor) {
    var clean = E.protectedText(text), regex = /[^\r\n]+/g, m, proceed;
    while ((m = regex.exec(clean))) {
      if (!/\S/.test(m[0])) { continue; }
      proceed = visitor(m[0], m.index); if (proceed === false) { break; }
    }
  }
  E.poetry = { syllables: syllables, wordReading: wordReading, scan: scan };
  (E.extensions = E.extensions || []).push(function (register) {
    register({ id: 'metrica', analyze: function (text, cap) {
      var out = [];
      lines(text, function (line, start) {
        var r = scan(line), f;
        if (!r) {
          f = S.finding('metrica', 'PTBR-MET-002', text, start, start + line.length, 'Esta linha precisa de uma leitura em voz alta.', 'A linha contém forma fora do recorte ou ultrapassa 2 mil caracteres.', 'A medida não foi estimada.', 'Nomes, grafias inventadas, abreviações e palavras com hífen podem exigir uma leitura específica.', D.limit, D.source, { confidence: 'insuficiente' });
        } else {
          var measure = r.min === r.max ? String(r.max) : r.min + ' a ' + r.max;
          f = S.finding('metrica', 'PTBR-MET-001', text, start, start + line.length, measure + ' sílabas poéticas nesta hipótese de leitura.',
            r.raw + ' sílabas gráficas estimadas; ' + r.possibleFusions + ' encontros vocálicos entre palavras. Divisão: ' + r.words.map(function (w) { return w.syllables.join('·'); }).join(' / '),
            'A contagem termina na tônica da última palavra. O intervalo contempla fusões vocálicas possíveis, sem impor nenhuma delas.',
            'Escansão muda com a voz, as pausas e a intenção. A medida não classifica a qualidade do verso.', D.limit, D.source,
            { confidence: 'baixa', measurements: r });
        }
        out.push(f); return out.length < cap;
      }); return out;
    } });
    register({ id: 'rima', analyze: function (text, cap) {
      var out = [], endings = {};
      lines(text, function (line, start) {
        var r = scan(line); if (!r) { return; }
        var key = '$' + r.rhyme, prior = endings[key], a = start + r.lastStart, b = start + r.lastEnd;
        if (prior) {
          out.push(S.finding('rima', 'PTBR-RIM-001', text, a, b, 'Um final aproxima este verso de “' + prior.word + '”.',
            'As terminações gráficas coincidem a partir da vogal tônica estimada: “' + r.rhyme + '”.',
            'É uma candidata a rima para experimentar em voz alta.',
            'Vogais abertas e fechadas sem acento, s/z, nasalização, dialeto e desempenho oral podem produzir sons diferentes. Repetição da mesma palavra pode ser intencional.',
            'Comparação gráfica aproximada, sem transcrição fonética. Ausência de pares não significa ausência de rima. A primeira ocorrência correspondente é a referência.', D.source,
            { confidence: 'baixa', related: { start: prior.start, end: prior.end, snippet: text.slice(prior.start, prior.end) } }));
        } else { endings[key] = { word: text.slice(a, b), start: a, end: b }; }
        return out.length < cap;
      }); return out;
    } });
  });
}(typeof window !== 'undefined' ? window : this));
