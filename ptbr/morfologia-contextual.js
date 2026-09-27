/* Classes em contexto, incremento 1. ES5; sem DOM, rede ou escrita no manuscrito. */
(function (root) {
  'use strict';
  var E = root.Escr, own = Object.prototype.hasOwnProperty;
  var version = 'contexto-1', maxChars = 8000, maxTokens = 1600;
  var source = { title: 'Cunha e Cintra, Nova gramática do português contemporâneo, 7ª ed., 2ª impressão, 2017: pp. 191, 219, 289, 314 e 394. Regras computacionais locais de alcance restrito; não são algoritmos da obra.', url: null };
  var extraNouns = ['cobra', 'cobras', 'jogo', 'jogos', 'sonho', 'sonhos', 'trabalho', 'trabalhos', 'olho', 'olhos', 'filho', 'filhos', 'vizinha', 'vizinhas', 'pagamento', 'caminho'];
  var extraForms = {
    '$cobra': [['cobrar', 'indicativo:presente', 3, 'singular']],
    '$cobro': [['cobrar', 'indicativo:presente', 1, 'singular']],
    '$jogo': [['jogar', 'indicativo:presente', 1, 'singular']],
    '$sonho': [['sonhar', 'indicativo:presente', 1, 'singular']],
    '$chegou': [['chegar', 'indicativo:pretérito perfeito', 3, 'singular']],
    '$chegaram': [['chegar', 'indicativo:pretérito perfeito', 3, 'plural'], ['chegar', 'indicativo:pretérito mais-que-perfeito', 3, 'plural']],
    '$terminou': [['terminar', 'indicativo:pretérito perfeito', 3, 'singular']],
    '$atravessou': [['atravessar', 'indicativo:pretérito perfeito', 3, 'singular']]
  };
  var subjects = { '$eu': [1, 'singular'], '$tu': [2, 'singular'], '$ele': [3, 'singular'], '$ela': [3, 'singular'], '$você': [3, 'singular'], '$nós': [1, 'plural'], '$vós': [2, 'plural'], '$eles': [3, 'plural'], '$elas': [3, 'plural'], '$vocês': [3, 'plural'] };
  var articles = ['o', 'a', 'os', 'as'];
  function has(list, word) { return list.indexOf(word) >= 0; }
  function readings(word) {
    var w = E.reading.canonical(word), r = E.grammar.readings(w), more = extraForms['$' + w] || [];
    if (has(extraNouns, w) && !has(r.classes, 'substantivo')) { r.classes.push('substantivo'); }
    if (more.length) { r.verbs = r.verbs.concat(more); if (!has(r.classes, 'verbo')) { r.classes.push('verbo'); } }
    return r;
  }
  function finite(r, agreement) {
    return r.verbs.filter(function (v) {
      return /^(indicativo|subjuntivo):/.test(v[1]) && (!agreement || v[2] === agreement[0] && v[3] === agreement[1]);
    });
  }
  function inspect(text) {
    if (typeof text !== 'string') { throw new Error('A análise precisa receber texto.'); }
    var cut = text.slice(0, maxChars), clean = E.protectedText(cut), ts = E.reading.tokens(clean), i, j, k, r, forms, clitic, agreement;
    /* Um token ou contexto truncado não pode produzir leitura contextual. */
    if (cut.length < text.length && ts.length && ts[ts.length - 1].end === cut.length && /[A-Za-zÀ-ÖØ-öø-ÿ\u0300-\u036f0-9'’\-]/.test(text.charAt(cut.length))) {
      cut = cut.slice(0, ts.pop().start); clean = clean.slice(0, cut.length);
    }
    if (ts.length > maxTokens) { ts = ts.slice(0, maxTokens); cut = cut.slice(0, ts[ts.length - 1].end); clean = clean.slice(0, cut.length); }
    function linked(a, b) { return a >= 0 && b < ts.length && b === a + 1 && /^[ \t\u00a0]+$/.test(text.slice(ts[a].end, ts[b].start)); }
    var items = ts.map(function (t) {
      var possible = readings(t.value);
      return { start: t.start, end: t.end, snippet: text.slice(t.start, t.end), candidates: possible,
        status: possible.classes.length > 1 ? 'ambiguo' : possible.classes.length ? 'lexical' : 'desconhecido',
        selected: null, rule: null, evidence: [] };
    });
    function choose(at, cls, id, evidence, candidates) {
      items[at].status = 'contextual'; items[at].selected = cls; items[at].rule = id;
      items[at].evidence = evidence.map(function (n) { return { start: ts[n].start, end: ts[n].end, snippet: text.slice(ts[n].start, ts[n].end) }; });
      if (candidates) { items[at].compatibleVerbs = candidates; }
    }
    /* Pronome sujeito + [não] + [o/a/os/as] + forma finita compatível. */
    for (i = 0; i < ts.length; i += 1) {
      agreement = subjects['$' + ts[i].value]; if (!agreement) { continue; }
      j = i + 1; clitic = -1;
      if (!linked(i, j)) { continue; }
      if (ts[j].value === 'não') { j += 1; if (!linked(j - 1, j)) { continue; } }
      if (has(articles, ts[j].value)) { clitic = j; j += 1; if (!linked(j - 1, j)) { continue; } }
      forms = finite(items[j].candidates, agreement);
      if (!forms.length) { continue; }
      choose(j, 'verbo', 'PTBR-CTX-001', [i, j], forms);
      if (clitic >= 0) { choose(clitic, 'pronome', 'PTBR-CTX-003', [i, clitic, j]); }
    }
    /* Artigo definido + nome conhecido. Homógrafo verbal requer contexto à direita. */
    for (i = 0; i + 1 < ts.length; i += 1) {
      if (!has(articles, ts[i].value) || items[i].status === 'contextual' || !linked(i, i + 1)) { continue; }
      j = i + 1; r = items[j].candidates;
      if (!has(r.classes, 'substantivo') || has(E.grammarData.nonFinite, ts[j].value) || items[j].status === 'contextual') { continue; }
      if (r.classes.length > 1) {
        k = j + 1;
        if (!linked(j, k) || !finite(items[k].candidates).length || has(items[k].candidates.classes, 'substantivo')) { continue; }
        /* Não transformar a sequência eu o canto em um grupo nominal. */
        if (i > 0 && linked(i - 1, i) && own.call(subjects, '$' + ts[i - 1].value)) { continue; }
      }
      choose(i, 'artigo', 'PTBR-CTX-002', [i, j]);
      choose(j, 'substantivo', 'PTBR-CTX-002', r.classes.length > 1 ? [i, j, j + 1] : [i, j]);
    }
    /* Preserva a regra de infinitivos já existente, com sua fonte histórica. */
    for (i = 0; i < ts.length; i += 1) {
      if (items[i].status === 'contextual' || !E.infinitiveCandidates) { continue; }
      forms = E.infinitiveCandidates(ts, i, text);
      if (forms.length) { choose(i, 'verbo', 'PTBR-CTX-005', [i - 1, i], forms); }
    }
    return { version: version, items: items, scope: { start: 0, end: cut.length, total: text.length, partial: cut.length < text.length },
      work: { characters: cut.length, tokens: ts.length, maxCharacters: maxChars, maxTokens: maxTokens } };
  }
  function analyze(text, cap) {
    var report = inspect(text), out = [], i, item, r, contextual, message, reason;
    var limit = 'Recorte de até 8.000 unidades UTF-16 e 1.600 tokens. Contexto restrito a artigo definido + nome e pronome sujeito + forma finita, com não e clítico opcionais. Pontuação, quebras de linha e trechos protegidos interrompem relações. Não resolve sintaxe geral, regência, sentido ou concordância; formas fora do inventário permanecem desconhecidas.';
    for (i = 0; i < report.items.length && out.length < cap; i += 1) {
      item = report.items[i]; r = item.candidates; contextual = item.status === 'contextual';
      message = contextual ? 'Leitura contextual: ' + item.selected + '.' : item.status === 'desconhecido' ? 'Sem classificação neste inventário.' : 'Possibilidades lexicais: ' + r.classes.join(', ') + '.';
      reason = item.rule === 'PTBR-CTX-001' ? 'Pronome sujeito próximo e forma verbal finita compatível em pessoa e número.' :
        item.rule === 'PTBR-CTX-002' ? 'Artigo definido antes de nome registrado; homógrafos verbais exigem também uma forma finita à direita.' :
        item.rule === 'PTBR-CTX-003' ? 'A forma aparece entre pronome sujeito (com não opcional) e verbo finito compatível.' :
        item.rule === 'PTBR-CTX-005' ? 'Lema conhecido e preposição contígua, com pronome sujeito opcional: leitura de infinitivo preservada do motor anterior.' :
        r.classes.length ? 'Consulta ao léxico local; nenhuma regra contextual deste incremento decidiu a ocorrência.' : 'A forma não consta do recorte lexical. Nenhuma classe foi deduzida por sufixo.';
      out.push(E.instruments.finding('morfologia', item.rule || 'PTBR-CTX-004', text, item.start, item.end, message,
        reason + (item.evidence.length ? ' Apoios no original: ' + item.evidence.map(function (s) { return '“' + s.snippet + '”'; }).join(', ') + '.' : ''),
        contextual ? 'A construção favorece a leitura de ' + item.selected + '; as possibilidades lexicais são preservadas na análise.' : 'Esta ocorrência permanece ' + item.status + '. Isso não é erro de escrita.',
        'Possibilidades lexicais registradas: ' + (r.classes.join(', ') || 'nenhuma') + '. A regra é uma hipótese local. Elipse, nomes próprios, usos literários e outras construções podem exigir leitura diferente. Um inventário com uma só classe não prova unicidade na língua.',
        limit, contextual && item.rule !== 'PTBR-CTX-005' ? source : E.grammarData.source,
        { confidence: contextual ? 'moderada' : 'insuficiente', feature: item.selected || item.status, candidates: r,
          analysisStatus: item.status, context: item.evidence, compatibleVerbs: item.compatibleVerbs || [] }));
    }
    out.coverageInfo = { scope: report.scope, work: report.work, version: version,
      summary: 'Classes em contexto: recorte ' + report.scope.start + '–' + report.scope.end + ' de ' + text.length + ' unidades UTF-16; ' + report.work.tokens + ' tokens.' + (report.scope.partial ? ' Análise parcial: selecione o restante para continuar.' : '') };
    return out;
  }
  E.contextualMorphology = { version: version, readings: readings, inspect: inspect, analyze: analyze };
}(typeof window !== 'undefined' ? window : this));
