(function (root) {
  'use strict';
  root.Escr = root.Escr || {};
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
  function validate(f, text, lens) {
    if (!f || !/^PTBR-[A-Z]+-[0-9]+$/.test(f.id) || f.lens !== lens || typeof f.feature !== 'string' || !f.feature || typeof f.message !== 'string' || !f.message ||
        ['erro', 'aviso', 'estilo', 'informação'].indexOf(f.severity) < 0 ||
        ['alta', 'moderada', 'baixa', 'insuficiente'].indexOf(f.confidence) < 0 ||
        typeof f.start !== 'number' || typeof f.end !== 'number' || !isFinite(f.start) || !isFinite(f.end) || f.start % 1 || f.end % 1 || f.start < 0 || f.end <= f.start || f.end > text.length || text.slice(f.start, f.end) !== f.snippet ||
        !f.evidence || !f.evidence.observation || !f.evidence.interpretation || !f.evidence.ambiguity || !f.evidence.limit || !f.evidence.source) {
      throw new Error('A lente devolveu um diagnóstico fora do contrato.');
    }
  }
  function createVault(knowledge) {
    var registry = {}, busy = false, maxLength = 200000, maxFindings = 100;
    function register(lens) {
      if (!lens || !/^[a-z][a-z0-9-]*$/.test(lens.id) || typeof lens.analyze !== 'function' || own.call(registry, lens.id)) { throw new Error('Lente inválida ou já registrada.'); }
      registry[lens.id] = lens;
    }
    function analyze(lensId, text) {
      if (busy) { throw new Error('Já existe uma lente em uso.'); }
      if (typeof text !== 'string') { throw new Error('A lente precisa receber texto.'); }
      if (text.length > maxLength) { throw new Error('Examine até 200 mil caracteres por vez. O manuscrito continua inteiro na folha.'); }
      if (!own.call(registry, lensId)) { throw new Error('Esta lente não está disponível.'); }
      busy = true;
      try {
        var result = registry[lensId].analyze(text, maxFindings + 1), i;
        if (Object.prototype.toString.call(result) !== '[object Array]') { throw new Error('Resposta inválida da lente.'); }
        for (i = 0; i < result.length; i += 1) { validate(result[i], text, lensId); }
        result.sort(function (a, b) { return a.start - b.start || a.end - b.end || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0); });
        return { lens: lensId, knowledgeVersion: knowledge.version, findings: result.slice(0, maxFindings), limited: result.length > maxFindings, coverage: 'Somente as regras locais desta lente foram examinadas. Silêncio não certifica correção.' };
      } finally { busy = false; }
    }
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
    return { register: register, analyze: analyze, maxLength: maxLength };
  }
  root.Escr.createVault = createVault;
}(typeof window !== 'undefined' ? window : this));
