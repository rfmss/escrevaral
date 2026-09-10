(function (root) {
  'use strict';
  var own = Object.prototype.hasOwnProperty;
  function protectedText(text) {
    /* Substituição de igual comprimento: índices continuam sendo UTF-16 do original. */
    return text.replace(/```[\s\S]*?(?:```|$)|`[^`\n]*`|https?:\/\/[^\s]+|www\.[^\s]+|[\w.+-]+@[\w.-]+|"[^"\n]*"|“[^”]*”|‘[^’]*’|«[^»]*»/g, function (s) { return s.replace(/[^\n]/g, ' '); });
  }
  function makeFinding(rule, text, start, end, reference, sources) {
    var snippet = text.slice(start, end);
    return {
      id: rule.id, lens: rule.lens, feature: rule.lens,
      severity: rule.severity, confidence: rule.confidence,
      message: rule.title + (reference ? ': “' + snippet + '” → “' + reference + '”.' : '.'),
      start: start, end: end, snippet: snippet,
      evidence: { observation: rule.observation, interpretation: rule.interpretation + (reference ? ' “' + reference + '”.' : ''), ambiguity: rule.ambiguity, limit: rule.limit, source: sources[rule.source] },
      reference: reference || null
    };
  }
  root.Escr.protectedText = protectedText;
  (root.Escr.extensions = root.Escr.extensions || []).push(function (register, knowledge) {
    function builtin(id) {
      register({ id: id, analyze: function (text, cap) {
        var clean = protectedText(text), out = [], i, rule, match, regex, token, reference;
        for (i = 0; i < knowledge.rules.length; i += 1) {
          rule = knowledge.rules[i];
          if (rule.lens !== id) { continue; }
          regex = rule.forms ? /[A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f]+(?:[-'][A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f]+)*/g : new RegExp(rule.pattern, 'g');
          while ((match = regex.exec(clean))) {
            reference = null;
            if (rule.forms) {
              token = match[0];
              /* Maiúscula pode ser nome próprio; silêncio deliberado, inclusive no começo da frase. */
              if (token !== token.toLowerCase() || !own.call(rule.forms, token)) { continue; }
              reference = rule.forms[token];
            }
            out.push(makeFinding(rule, text, match.index, match.index + match[0].length, reference, knowledge.sources));
            if (out.length >= cap) { return out; }
          }
        }
        return out;
      } });
    }
    builtin('ortografia'); builtin('acentuacao'); builtin('pontuacao');
  });
}(typeof window !== 'undefined' ? window : this));
