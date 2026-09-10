(function (root) {
  'use strict';
  root.Escr = root.Escr || {};
  var own = Object.prototype.hasOwnProperty;
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
        var policy = root.Escr.lensPolicies && root.Escr.lensPolicies[lensId];
        var assessment = policy ? policy(text) : { eligible: true, scope: 'Lente registrada sem política de recorte.' };
        if (!assessment.eligible) { return { lens: lensId, knowledgeVersion: knowledge.version, findings: [], limited: false, status: 'insuficiente', assessment: assessment, coverage: assessment.scope }; }
        var result = registry[lensId].analyze(text, maxFindings + 1), i;
        if (Object.prototype.toString.call(result) !== '[object Array]') { throw new Error('Resposta inválida da lente.'); }
        for (i = 0; i < result.length; i += 1) { validate(result[i], text, lensId); }
        result.sort(function (a, b) { return a.start - b.start || a.end - b.end || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0); });
        return { lens: lensId, knowledgeVersion: knowledge.version, findings: result.slice(0, maxFindings), limited: result.length > maxFindings, status: 'examinado', assessment: assessment, coverage: assessment.scope + ' Silêncio não certifica correção.' };
      } finally { busy = false; }
    }
    (root.Escr.extensions || []).forEach(function (install) { install(register, knowledge); });
    return { register: register, analyze: analyze, maxLength: maxLength };
  }
  root.Escr.createVault = createVault;
}(typeof window !== 'undefined' ? window : this));
