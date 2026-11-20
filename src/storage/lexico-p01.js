(function (root) {
  'use strict';
  root.Escr = root.Escr || {};

  var MAX_CACHE = 4;
  var CLASSES = {
    NOUN: 'substantivo',
    VERB: 'verbo',
    ADJ: 'adjetivo',
    ADV: 'advérbio',
    ADP: 'preposição',
    CCONJ: 'conjunção',
    SCONJ: 'conjunção',
    PRON: 'pronome',
    DET: 'determinante',
    NUM: 'numeral',
    INTJ: 'interjeição'
  };

  var LINKS = [
    ['wikt:casa:NOUN:0:0', 'construção que serve de moradia', 'own:03259505-n', ['lar', 'moradia', 'residência']],
    ['wikt:carro:NOUN:0:0', 'veículo com a capacidade de se movimentar guiado por um motorista, geralmente com a finalidade de transportar pessoas', 'own:02958343-n', ['automóvel', 'veículo', 'viatura']],
    ['wikt:ônibus:NOUN:0:0', 'veículo automóvel para transporte coletivo', 'escrevaral:onibus', ['coletivo']],
    ['wikt:bonito:ADJ:0:0', 'possuidor de beleza, agradável aos olhos', 'own:00217728-a', ['belo', 'formoso', 'lindo']],
    ['wikt:feliz:ADJ:0:0', 'que sente ou transmite felicidade', 'own:01048406-s', ['contente']],
    ['wikt:escrever:VERB:0:0', 'redigir', 'own:00993014-v', ['redigir']],
    ['wikt:começar:VERB:0:0', 'dar início a alguma coisa', 'own:00345761-v', ['iniciar', 'principiar']],
    ['wikt:terminar:VERB:0:0', 'acabar, encerrar, chegar ao fim', 'own:00352826-v', ['concluir', 'encerrar', 'finalizar']]
  ];

  function canonical(word) {
    var w = String(word || '');
    if (w.normalize) { w = w.normalize('NFC'); }
    return w.toLowerCase().replace(/^\s+|\s+$/g, '');
  }

  function bucketFor(word) {
    var hash = 0, i;
    for (i = 0; i < word.length; i += 1) {
      hash = (((hash << 5) - hash) + word.charCodeAt(i)) >>> 0;
    }
    var hex = (hash % 64).toString(16);
    return hex.length < 2 ? '0' + hex : hex;
  }

  function isValidWord(word) {
    var q = canonical(word);
    return q.length > 0 && q.length <= 64 && /^[a-zà-öø-ÿ]+(?:[-'’][a-zà-öø-ÿ]+)*$/.test(q);
  }

  function createService(opts) {
    opts = opts || {};
    var cache = {};
    var order = [];
    var inflight = {};
    var baseUrl = opts.baseUrl || 'resources/pt-BR/lexico-ptbr/partes/';

    function putCache(id, part) {
      var idx = order.indexOf(id);
      if (idx >= 0) { order.splice(idx, 1); }
      cache[id] = part;
      order.push(id);
      while (order.length > MAX_CACHE) {
        var old = order.shift();
        delete cache[old];
      }
    }

    function defaultBrowserLoad(id, done) {
      if (typeof document === 'undefined' || !document.createElement) {
        done(new Error('Carregamento indisponível.'));
        return;
      }
      var g = typeof globalThis !== 'undefined' ? globalThis : root;
      g.EscrevaralLexicoDados = g.EscrevaralLexicoDados || {};
      if (g.EscrevaralLexicoDados[id]) {
        var existing = g.EscrevaralLexicoDados[id];
        delete g.EscrevaralLexicoDados[id];
        done(null, existing);
        return;
      }
      var script = document.createElement('script');
      var finished = false;
      var timer = null;
      function finish(err, data) {
        if (finished) { return; }
        finished = true;
        if (timer) { clearTimeout(timer); }
        script.onload = null;
        script.onerror = null;
        if (script.parentNode) { script.parentNode.removeChild(script); }
        done(err, data);
      }
      timer = setTimeout(function () { finish(new Error('Tempo esgotado.')); }, 6000);
      script.async = true;
      script.src = baseUrl + id + '.js';
      script.onload = function () {
        var data = g.EscrevaralLexicoDados && g.EscrevaralLexicoDados[id];
        if (g.EscrevaralLexicoDados) { delete g.EscrevaralLexicoDados[id]; }
        if (!data) { finish(new Error('Bloco incompleto.')); }
        else { finish(null, data); }
      };
      script.onerror = function () { finish(new Error('Bloco offline indisponível.')); };
      (document.head || document.body || document.documentElement).appendChild(script);
    }

    var loadPartFn = opts.loadPart || defaultBrowserLoad;

    function fetchPart(id, cb) {
      if (Object.prototype.hasOwnProperty.call(cache, id)) {
        putCache(id, cache[id]);
        cb(null, cache[id]);
        return;
      }
      if (inflight[id]) {
        inflight[id].push(cb);
        return;
      }
      inflight[id] = [cb];
      loadPartFn(id, function (err, part) {
        var waiters = inflight[id] || [];
        delete inflight[id];
        if (!err && part) { putCache(id, part); }
        var i;
        for (i = 0; i < waiters.length; i += 1) {
          waiters[i](err, part);
        }
      });
    }

    function recordFor(word, cb) {
      var id = bucketFor(word);
      fetchPart(id, function (err, part) {
        if (err || !part) { cb(err || new Error('Erro de leitura.'), null); return; }
        var rec = Object.prototype.hasOwnProperty.call(part, word) ? part[word] : null;
        cb(null, rec);
      });
    }

    function present(query, gathered) {
      var seenIds = {};
      var uniq = [], i;
      for (i = 0; i < gathered.length; i += 1) {
        var s = gathered[i];
        var uid = (s.id || '') + '\0' + (s.lemma || '');
        if (!seenIds[uid]) { seenIds[uid] = true; uniq.push(s); }
      }

      var synGroups = [], dictSenses = [];
      for (i = 0; i < uniq.length; i += 1) {
        if (uniq[i].kind === 'synonyms') { synGroups.push(uniq[i]); }
        else if (uniq[i].kind === 'dictionary') { dictSenses.push(uniq[i]); }
      }

      function collectAlts(primary, pos, lemma) {
        var seenW = {};
        seenW[query] = true;
        if (lemma) { seenW[canonical(lemma)] = true; }
        var out = [], j, k, terms;
        function push(w) {
          var key = canonical(w);
          if (!key || seenW[key]) { return; }
          seenW[key] = true;
          out.push(w);
        }
        for (j = 0; j < primary.length; j += 1) { push(primary[j]); }
        for (j = 0; j < synGroups.length; j += 1) {
          if (synGroups[j].pos === pos && synGroups[j].lemma === lemma) {
            terms = synGroups[j].terms || [];
            for (k = 0; k < terms.length; k += 1) { push(terms[k]); }
          }
        }
        for (j = 0; j < synGroups.length; j += 1) {
          if (synGroups[j].pos === pos && synGroups[j].lemma !== lemma) {
            terms = synGroups[j].terms || [];
            for (k = 0; k < terms.length; k += 1) { push(terms[k]); }
          }
        }
        for (j = 0; j < synGroups.length; j += 1) {
          if (synGroups[j].pos !== pos) {
            terms = synGroups[j].terms || [];
            for (k = 0; k < terms.length; k += 1) { push(terms[k]); }
          }
        }
        return out.slice(0, 3);
      }

      var entries = [];
      for (i = 0; i < dictSenses.length; i += 1) {
        var d = dictSenses[i];
        var def = d.definitions && d.definitions[0] ? d.definitions[0] : '';
        var link = null, li;
        for (li = 0; li < LINKS.length; li += 1) {
          if (LINKS[li][0] === d.id && LINKS[li][1] === def) { link = LINKS[li]; break; }
        }
        var primary = link ? link[3] : [];
        entries.push({
          lemma: d.lemma,
          pos: d.pos,
          posLabel: CLASSES[d.pos] || d.pos || '',
          definition: def,
          synonyms: collectAlts(primary, d.pos, d.lemma),
          source: d.source || 'Wikcionário / OpenWordNet-PT'
        });
      }
      if (!entries.length && synGroups.length) {
        var g0 = synGroups[0];
        entries.push({
          lemma: g0.lemma,
          pos: g0.pos,
          posLabel: CLASSES[g0.pos] || g0.pos || '',
          definition: '',
          synonyms: collectAlts([], g0.pos, g0.lemma),
          source: g0.source || 'OpenWordNet-PT'
        });
      }
      entries.sort(function (a, b) {
        return (b.synonyms.length ? 1 : 0) - (a.synonyms.length ? 1 : 0);
      });
      return entries;
    }

    function fallbackCofreLookup(query) {
      if (!root.Escr.lookupLexeme) { return null; }
      var lex = root.Escr.lookupLexeme(query);
      if (!lex || lex.state !== 'found') { return null; }
      var entries = [], i;
      for (i = 0; i < (lex.senses || []).length; i += 1) {
        var s = lex.senses[i];
        var alts = (s.terms || []).filter(function (t) { return canonical(t) !== query; }).slice(0, 3);
        entries.push({
          lemma: s.lemma,
          pos: s.pos,
          posLabel: CLASSES[s.pos] || s.pos || '',
          definition: s.definitions && s.definitions[0] ? s.definitions[0] : '',
          synonyms: alts,
          source: 'OpenWordNet-PT (léxico base)'
        });
      }
      return entries.length ? { state: 'found', query: query, entries: entries, fallback: true } : null;
    }

    function lookup(rawWord, cb) {
      var q = canonical(rawWord);
      if (!isValidWord(q)) {
        cb({ state: 'invalid', query: q, entries: [] });
        return;
      }
      recordFor(q, function (err, direct) {
        if (err) {
          var fb = fallbackCofreLookup(q);
          if (fb) { cb(fb); }
          else { cb({ state: 'unavailable', query: q, entries: [] }); }
          return;
        }
        if (!direct) {
          cb({ state: 'uncovered', query: q, entries: [] });
          return;
        }
        var gathered = (direct.s || []).slice();
        var fList = direct.f || [];
        var lemmas = [], seenL = {}, i;
        seenL[q] = true;
        for (i = 0; i < fList.length && lemmas.length < 6; i += 1) {
          var l = fList[i].lemma;
          if (l && !seenL[l]) { seenL[l] = true; lemmas.push(l); }
        }
        if (!lemmas.length) {
          var ents = present(q, gathered);
          cb({ state: ents.length ? 'found' : 'uncovered', query: q, entries: ents, lemmas: [q] });
          return;
        }
        var remaining = lemmas.length;
        for (i = 0; i < lemmas.length; i += 1) {
          recordFor(lemmas[i], function (_e, entry) {
            if (entry && entry.s && entry.s.length) {
              var j;
              for (j = 0; j < entry.s.length; j += 1) { gathered.push(entry.s[j]); }
            }
            remaining -= 1;
            if (remaining === 0) {
              var ents2 = present(q, gathered);
              cb({ state: ents2.length ? 'found' : 'uncovered', query: q, entries: ents2, lemmas: [q].concat(lemmas) });
            }
          });
        }
      });
    }

    return {
      canonical: canonical,
      bucketFor: bucketFor,
      isValidWord: isValidWord,
      lookup: lookup
    };
  }

  root.Escr.createLexicoP01 = createService;
}(typeof window !== 'undefined' ? window : this));
