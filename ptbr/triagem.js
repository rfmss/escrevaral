/* Escrevaral / PTBR: pré-diagnóstico opcional, independente do editor e da interface.
 * ES5. A escrita agenda triage(texto) somente após pausa (~700ms), fora da
 * composição de teclado. run() exige ação explícita do autor.
 * Nenhuma destas funções corrige texto ou produz Findings durante a digitação.
 */
(function (root) {
  'use strict';
  var own = Object.prototype.hasOwnProperty;
  function create(engine) {
    if (!engine || !engine.core || typeof engine.core.tokenizeWithOffsets !== 'function') {
      throw new Error('Pacote PTBR ainda não inicializado.');
    }
    var lex = (engine.dados && engine.dados.lexico) || (engine.data && engine.data.lexico) || {}, known = {};
    var groups = lex.functionWords || {}, dict = lex.localLexicon || {};
    Object.keys(groups).forEach(function (group) {
      var words = groups[group] || [], i;
      if (Object.prototype.toString.call(words) !== '[object Array]') { return; }
      for (i = 0; i < words.length; i += 1) { known['
    });
    function triage(input) {
      var s = String(input || ''), cap = 40000, tokens, i, t, k, signals = {}, examples = {};
      if (s.length > cap) {
        return { status: 'limite', source: null, signals: {}, examples: {}, scope: cap,
          message: 'Pré-diagnóstico limitado a 40 mil caracteres; o manuscrito não foi alterado.' };
      }
      tokens = engine.core.tokenizeWithOffsets(s);
      for (i = 0; i < tokens.length; i += 1) {
        t = tokens[i]; k = t.token.toLowerCase();
        if (!signals.morfologia && (own.call(dict, k) || own.call(known, '
          signals.morfologia = true; examples.morfologia = t;
        }
        if (!signals.dificuldades && engine.dificuldades && typeof engine.dificuldades.resolve === 'function' && engine.dificuldades.resolve(t.token)) {
          signals.dificuldades = true; examples.dificuldades = t;
        }
        if (!signals['que-contextual'] && k === 'que') {
          signals['que-contextual'] = true; examples['que-contextual'] = t;
        }
      }
      /* Varredura de expressões apenas quando solicitada no exame: scan() percorre
       * todo o texto e duplicaria a tokenização a cada pausa de digitação. */
      if (engine.expressoes && typeof engine.expressoes.has === 'function' && tokens.length) {
        for (i = 0; i < tokens.length && !signals.expressoes; i += 1) {
          if (engine.expressoes.has(tokens[i].token)) {
            signals.expressoes = true; examples.expressoes = tokens[i];
          }
        }
      }
      return { status: 'pronto', source: s, signals: signals, examples: examples, scope: s.length,
        message: 'Sinais para escolher lentes; nenhuma classe, oração ou ocorrência foi confirmada.' };
    }
    function run(text, triageResult, lenses, analyze, progress, finish, later) {
      var snapshot = String(text || ''), list = [], i, cancelled = false, position = 0;
      if (!triageResult || triageResult.status !== 'pronto' || triageResult.source !== snapshot ||
          Object.prototype.toString.call(lenses) !== '[object Array]' || typeof analyze !== 'function') {
        throw new Error('Triagem e texto precisam corresponder antes da análise.');
      }
      for (i = 0; i < lenses.length; i += 1) {
        if (triageResult.signals[lenses[i]] && list.indexOf(lenses[i]) === -1) { list.push(lenses[i]); }
      }
      later = later || function (fn) { root.setTimeout(fn, 0); };
      function next() {
        var id, findings, f, j;
        if (cancelled) { return; }
        if (position === list.length) { if (finish) { finish(); } return; }
        id = list[position++];
        try {
          findings = analyze(id, snapshot);
          if (Object.prototype.toString.call(findings) !== '[object Array]') { throw new Error('A lente não devolveu uma lista.'); }
          for (j = 0; j < findings.length; j += 1) {
            f = findings[j];
            if (!engine.core.validateFinding(f) || f.start < 0 || f.end > snapshot.length ||
                snapshot.slice(f.start, f.end) !== f.snippet) {
              throw new Error('Finding inválido: ' + id);
            }
          }
          if (progress) { progress(id, findings); }
        } catch (e) { if (progress) { progress(id, [], e); } }
        if (!cancelled) { later(next); }
      }
      later(next);
      return function () { cancelled = true; };
    }
    return { triage: triage, run: run };
  }
  root.Escr = root.Escr || {};
  root.Escr.createPTBRTriage = create;
  if (typeof module !== 'undefined' && module.exports) { module.exports = create; }
}(typeof window !== 'undefined' ? window : this));
 + String(words[i]).toLowerCase()] = true; }
    });
    function triage(input) {
      var s = String(input || ''), cap = 40000, tokens, i, t, k, signals = {}, examples = {}, matches;
      if (s.length > cap) {
        return { status: 'limite', source: null, signals: {}, examples: {}, scope: cap,
          message: 'Pré-diagnóstico limitado a 40 mil caracteres; o manuscrito não foi alterado.' };
      }
      tokens = engine.core.tokenizeWithOffsets(s);
      for (i = 0; i < tokens.length; i += 1) {
        t = tokens[i]; k = t.token.toLowerCase();
        if (!signals.morfologia && (own.call(dict, k) || own.call(known, '$' + k))) {
          signals.morfologia = true; examples.morfologia = t;
        }
        if (!signals.dificuldades && engine.dificuldades && typeof engine.dificuldades.resolve === 'function' && engine.dificuldades.resolve(t.token)) {
          signals.dificuldades = true; examples.dificuldades = t;
        }
        if (!signals['que-contextual'] && k === 'que') {
          signals['que-contextual'] = true; examples['que-contextual'] = t;
        }
      }
      if (engine.expressoes && typeof engine.expressoes.scan === 'function' && tokens.length) {
        matches = engine.expressoes.scan(s);
        if (matches.length) { signals.expressoes = true; examples.expressoes = matches[0]; }
      }
      return { status: 'pronto', source: s, signals: signals, examples: examples, scope: s.length,
        message: 'Sinais para escolher lentes; nenhuma classe, oração ou ocorrência foi confirmada.' };
    }
    function run(text, triageResult, lenses, analyze, progress, finish, later) {
      var snapshot = String(text || ''), list = [], i, cancelled = false, position = 0;
      if (!triageResult || triageResult.status !== 'pronto' || triageResult.source !== snapshot ||
          Object.prototype.toString.call(lenses) !== '[object Array]' || typeof analyze !== 'function') {
        throw new Error('Triagem e texto precisam corresponder antes da análise.');
      }
      for (i = 0; i < lenses.length; i += 1) {
        if (triageResult.signals[lenses[i]] && list.indexOf(lenses[i]) === -1) { list.push(lenses[i]); }
      }
      later = later || function (fn) { root.setTimeout(fn, 0); };
      function next() {
        var id, findings, f, j;
        if (cancelled) { return; }
        if (position === list.length) { if (finish) { finish(); } return; }
        id = list[position++];
        try {
          findings = analyze(id, snapshot);
          if (Object.prototype.toString.call(findings) !== '[object Array]') { throw new Error('A lente não devolveu uma lista.'); }
          for (j = 0; j < findings.length; j += 1) {
            f = findings[j];
            if (!engine.core.validateFinding(f) || f.start < 0 || f.end > snapshot.length ||
                snapshot.slice(f.start, f.end) !== f.snippet) {
              throw new Error('Finding inválido: ' + id);
            }
          }
          if (progress) { progress(id, findings); }
        } catch (e) { if (progress) { progress(id, [], e); } }
        if (!cancelled) { later(next); }
      }
      later(next);
      return function () { cancelled = true; };
    }
    return { triage: triage, run: run };
  }
  root.Escr = root.Escr || {};
  root.Escr.createPTBRTriage = create;
  if (typeof module !== 'undefined' && module.exports) { module.exports = create; }
}(typeof window !== 'undefined' ? window : this));
 + k))) {
          signals.morfologia = true; examples.morfologia = t;
        }
        if (!signals.dificuldades && engine.dificuldades && typeof engine.dificuldades.resolve === 'function' && engine.dificuldades.resolve(t.token)) {
          signals.dificuldades = true; examples.dificuldades = t;
        }
        if (!signals['que-contextual'] && k === 'que') {
          signals['que-contextual'] = true; examples['que-contextual'] = t;
        }
      }
      /* Varredura de expressões apenas quando solicitada no exame: scan() percorre
       * todo o texto e duplicaria a tokenização a cada pausa de digitação. */
      if (engine.expressoes && typeof engine.expressoes.has === 'function' && tokens.length) {
        for (i = 0; i < tokens.length && !signals.expressoes; i += 1) {
          if (engine.expressoes.has(tokens[i].token)) {
            signals.expressoes = true; examples.expressoes = tokens[i];
          }
        }
      }
      return { status: 'pronto', source: s, signals: signals, examples: examples, scope: s.length,
        message: 'Sinais para escolher lentes; nenhuma classe, oração ou ocorrência foi confirmada.' };
    }
    function run(text, triageResult, lenses, analyze, progress, finish, later) {
      var snapshot = String(text || ''), list = [], i, cancelled = false, position = 0;
      if (!triageResult || triageResult.status !== 'pronto' || triageResult.source !== snapshot ||
          Object.prototype.toString.call(lenses) !== '[object Array]' || typeof analyze !== 'function') {
        throw new Error('Triagem e texto precisam corresponder antes da análise.');
      }
      for (i = 0; i < lenses.length; i += 1) {
        if (triageResult.signals[lenses[i]] && list.indexOf(lenses[i]) === -1) { list.push(lenses[i]); }
      }
      later = later || function (fn) { root.setTimeout(fn, 0); };
      function next() {
        var id, findings, f, j;
        if (cancelled) { return; }
        if (position === list.length) { if (finish) { finish(); } return; }
        id = list[position++];
        try {
          findings = analyze(id, snapshot);
          if (Object.prototype.toString.call(findings) !== '[object Array]') { throw new Error('A lente não devolveu uma lista.'); }
          for (j = 0; j < findings.length; j += 1) {
            f = findings[j];
            if (!engine.core.validateFinding(f) || f.start < 0 || f.end > snapshot.length ||
                snapshot.slice(f.start, f.end) !== f.snippet) {
              throw new Error('Finding inválido: ' + id);
            }
          }
          if (progress) { progress(id, findings); }
        } catch (e) { if (progress) { progress(id, [], e); } }
        if (!cancelled) { later(next); }
      }
      later(next);
      return function () { cancelled = true; };
    }
    return { triage: triage, run: run };
  }
  root.Escr = root.Escr || {};
  root.Escr.createPTBRTriage = create;
  if (typeof module !== 'undefined' && module.exports) { module.exports = create; }
}(typeof window !== 'undefined' ? window : this));
 + String(words[i]).toLowerCase()] = true; }
    });
    function triage(input) {
      var s = String(input || ''), cap = 40000, tokens, i, t, k, signals = {}, examples = {}, matches;
      if (s.length > cap) {
        return { status: 'limite', source: null, signals: {}, examples: {}, scope: cap,
          message: 'Pré-diagnóstico limitado a 40 mil caracteres; o manuscrito não foi alterado.' };
      }
      tokens = engine.core.tokenizeWithOffsets(s);
      for (i = 0; i < tokens.length; i += 1) {
        t = tokens[i]; k = t.token.toLowerCase();
        if (!signals.morfologia && (own.call(dict, k) || own.call(known, '$' + k))) {
          signals.morfologia = true; examples.morfologia = t;
        }
        if (!signals.dificuldades && engine.dificuldades && typeof engine.dificuldades.resolve === 'function' && engine.dificuldades.resolve(t.token)) {
          signals.dificuldades = true; examples.dificuldades = t;
        }
        if (!signals['que-contextual'] && k === 'que') {
          signals['que-contextual'] = true; examples['que-contextual'] = t;
        }
      }
      if (engine.expressoes && typeof engine.expressoes.scan === 'function' && tokens.length) {
        matches = engine.expressoes.scan(s);
        if (matches.length) { signals.expressoes = true; examples.expressoes = matches[0]; }
      }
      return { status: 'pronto', source: s, signals: signals, examples: examples, scope: s.length,
        message: 'Sinais para escolher lentes; nenhuma classe, oração ou ocorrência foi confirmada.' };
    }
    function run(text, triageResult, lenses, analyze, progress, finish, later) {
      var snapshot = String(text || ''), list = [], i, cancelled = false, position = 0;
      if (!triageResult || triageResult.status !== 'pronto' || triageResult.source !== snapshot ||
          Object.prototype.toString.call(lenses) !== '[object Array]' || typeof analyze !== 'function') {
        throw new Error('Triagem e texto precisam corresponder antes da análise.');
      }
      for (i = 0; i < lenses.length; i += 1) {
        if (triageResult.signals[lenses[i]] && list.indexOf(lenses[i]) === -1) { list.push(lenses[i]); }
      }
      later = later || function (fn) { root.setTimeout(fn, 0); };
      function next() {
        var id, findings, f, j;
        if (cancelled) { return; }
        if (position === list.length) { if (finish) { finish(); } return; }
        id = list[position++];
        try {
          findings = analyze(id, snapshot);
          if (Object.prototype.toString.call(findings) !== '[object Array]') { throw new Error('A lente não devolveu uma lista.'); }
          for (j = 0; j < findings.length; j += 1) {
            f = findings[j];
            if (!engine.core.validateFinding(f) || f.start < 0 || f.end > snapshot.length ||
                snapshot.slice(f.start, f.end) !== f.snippet) {
              throw new Error('Finding inválido: ' + id);
            }
          }
          if (progress) { progress(id, findings); }
        } catch (e) { if (progress) { progress(id, [], e); } }
        if (!cancelled) { later(next); }
      }
      later(next);
      return function () { cancelled = true; };
    }
    return { triage: triage, run: run };
  }
  root.Escr = root.Escr || {};
  root.Escr.createPTBRTriage = create;
  if (typeof module !== 'undefined' && module.exports) { module.exports = create; }
}(typeof window !== 'undefined' ? window : this));
