/* Relações em construções simples, literárias e coordenadas delimitadas. ES5; recebe texto, nunca o editor. */
(function (root) {
  'use strict';
  var E = root.Escr, D = E.grammarData, version = 'sintaxe-5-coordenacao';
  var source = { title: 'Cunha e Cintra, 7ª ed., 2ª impressão, 2017, pp. 136–140, 145–152, 154, 510–513 e 593–598; Bechara, Lições de Português pela Análise Sintática, arquivo recebido, páginas PDF 22, 48, 75–76, 94–96 e 103. Terminologia tradicional; critérios computacionais locais, não algoritmos dos autores.', url: null };
  var groupSource = { title: source.title + ' Locuções: Cunha/Cintra, pp. 408–411; Bechara, páginas PDF 318, 322 e 340–343. Limites de auxiliaridade preservados.', url: null };
  var L = E.syntaxLexicon;
  var ADJUNCT_PREPS = ['em', 'por', 'com', 'sem', 'sobre', 'sob', 'entre', 'até'];
  var INDIRECT_FRAMES = [
    ['objeto-indireto-de', 'de'],
    ['objeto-indireto-em', 'em'],
    ['objeto-indireto-com', 'com'],
    ['objeto-indireto-a', 'a']
  ];
  function has(a, s) { return a.indexOf(s) >= 0; }
  function span(text, a, b) { return { start: a, end: b, snippet: text.slice(a, b) }; }
  function agreesGender(a, b) { return !a || !b || a === 'u' || b === 'u' || a === b; }
  function pronounGender(word) {
    if (word === 'ele' || word === 'eles') { return 'm'; }
    if (word === 'ela' || word === 'elas') { return 'f'; }
    return 'u';
  }
  function adjReading(word) {
    if (L.adjectiveReading) {
      var r = L.adjectiveReading(word);
      if (r) { return r; }
    }
    return has(D.classes.adjetivo, word) ? { gender: 'u', number: null } : null;
  }

  function parseSingle(text, ts) {
    var n = ts.length, v, firstVerb, forms, lemma, subject, neg = -1, group, verbEnd;
    if (n < 2 || n > 28) { return null; }

    function nominalCore(a, b, isSubject, forcedDet) {
      var p = a, det = null, det2 = null, noun, candidates, head, pronoun, reqG, reqN, adj;
      if (b <= a) { return null; }
      pronoun = E.maturationData.subjects[ts[a].value];
      if (isSubject && !forcedDet && b === a + 1 && pronoun) {
        return { head: a, person: pronoun[0], number: pronoun[1], gender: pronounGender(ts[a].value) };
      }
      if (forcedDet) {
        reqG = forcedDet[0]; reqN = forcedDet[1];
      } else {
        det = L.determinerReading ? L.determinerReading(ts[p].value) : null;
        if (!det) {
          var art = L.articleReading(ts[p].value);
          if (art) { det = { gender: art[0], number: art[1], kind: 'artigo' }; }
        }
        if (det) {
          reqG = det.gender; reqN = det.number; p++;
          /* Combinação brasileira natural: artigo + possessivo (a minha casa, o seu livro) */
          if (det.kind === 'artigo' && p < b && L.determinerReading) {
            det2 = L.determinerReading(ts[p].value);
            if (det2 && det2.kind === 'possessivo' && det2.gender === reqG && det2.number === reqN) {
              p++;
            } else {
              det2 = null;
            }
          }
        }
      }
      if (p >= b) { return null; }

      /* Epíteto literário anteposto ao substantivo (a velha casa, o novo romance), sempre com determinante */
      if ((det || forcedDet) && p + 1 < b) {
        var candAdj = adjReading(ts[p].value);
        var nextNouns = L.nounReadings(ts[p + 1].value);
        if (candAdj && !has(['aberto', 'aberta', 'abertos', 'abertas'], ts[p].value) && nextNouns.length > 0 &&
            agreesGender(candAdj.gender, reqG) && (!candAdj.number || candAdj.number === reqN)) {
          p++;
        }
      }

      head = p;
      candidates = L.nounReadings(ts[p].value);
      if (det || forcedDet) {
        candidates = candidates.filter(function (r) { return r.gender === reqG && r.number === reqN; });
      }
      if (candidates.length > 1) { return null; }
      noun = candidates[0];
      if (!noun) {
        if (p === a && !forcedDet && b === a + 1 && L.isProperName(ts[p].value) && /^[A-ZÀ-ÖØ-Þ]/.test(text.charAt(ts[p].start))) {
          var pg = L.properNameGender ? (L.properNameGender(ts[p].value) || 'u') : 'u';
          return { head: p, person: 3, number: 'singular', gender: pg };
        }
        return null;
      }
      /* Um homógrafo sem determinante fica sem decisão neste recorte. */
      if (!det && !forcedDet) {
        if (E.contextualMorphology.readings(ts[p].value).classes.length > 1) { return null; }
        if (L.verbReadings && L.verbReadings(ts[p].value).length > 0) { return null; }
      }
      p++;
      /* Adjetivo posposto no objeto pode ser predicativo do objeto: manter abstenção. */
      if (!isSubject && p < b) { return null; }
      if (b - p > 2) { return null; }
      for (; p < b; p++) {
        adj = adjReading(ts[p].value);
        if (!adj || !agreesGender(adj.gender, noun.gender) || (adj.number && adj.number !== noun.number)) { return null; }
      }
      return { head: head, person: 3, number: noun.number, gender: noun.gender };
    }

    /* Grupo nominal simples OU com especificador preposicionado de/do/da/dos/das */
    function nominal(a, b, isSubject, forcedDet) {
      var simple = nominalCore(a, b, isSubject, forcedDet);
      if (simple) { return simple; }
      if (!L.prepReading || b - a < 3) { return null; }
      var split, prep, left, right, found = null;
      for (split = a + 1; split < b - 1; split++) {
        prep = L.prepReading(ts[split].value);
        if (!prep || prep.base !== 'de') { continue; }
        left = nominalCore(a, split, isSubject, forcedDet);
        if (!left || left.person !== 3) { continue; }
        right = nominalCore(split + 1, b, false, prep.det);
        if (!right) { continue; }
        if (found) { return null; }
        found = left;
      }
      return found;
    }

    /* Sujeito simples OU sujeito composto binário (SN1 e SN2) com concordância canônica */
    function parseSubject(a, b) {
      var simple = nominal(a, b, true, null);
      if (simple) { return simple; }
      if (b - a < 3) { return null; }
      var split, s1, s2, person, gender, found = null;
      for (split = a + 1; split < b - 1; split++) {
        if (ts[split].value !== 'e') { continue; }
        s1 = nominal(a, split, true, null);
        if (!s1) { continue; }
        s2 = nominal(split + 1, b, true, null);
        if (!s2) { continue; }
        if (s1.person === 1 || s2.person === 1) {
          person = 1;
        } else if (s1.person === 2 || s2.person === 2) {
          /* Tu/vós + 3ª pessoa varia entre norma lusitana e brasileira: abstenção honesta. */
          continue;
        } else {
          person = 3;
        }
        if (s1.gender === 'f' && s2.gender === 'f') { gender = 'f'; }
        else if (s1.gender === 'm' || s2.gender === 'm') { gender = 'm'; }
        else { gender = 'u'; }
        if (found) { return null; }
        found = { compound: true, head: null, heads: [s1.head, s2.head], person: person, number: 'plural', gender: gender };
      }
      return found;
    }

    var matches = [];
    for (v = 1; v < n; v++) {
      neg = ts[v - 1].value === 'não' ? v - 1 : -1;
      firstVerb = neg < 0 ? v : neg;
      subject = parseSubject(0, firstVerb);
      if (!subject) { continue; }
      var rawVerbs = L.verbReadings ? L.verbReadings(ts[v].value) : E.contextualMorphology.readings(ts[v].value).verbs;
      forms = rawVerbs.filter(function (f) { return f[1].indexOf('indicativo:') === 0 && f[2] === subject.person && f[3] === subject.number; });
      if (!forms.length) { continue; }
      lemma = forms[0][0];
      if (forms.some(function (f) { return f[0] !== lemma; })) { continue; }
      group = E.verbGroups && E.verbGroups.match(ts, v, lemma);
      verbEnd = group ? group.last + 1 : v + 1;
      if (group) { lemma = group.lemma; }

      var adjOptions = [{ end: n, adv: null }];
      if (n > verbEnd && (L.isFinalAdverb ? L.isFinalAdverb(ts[n - 1].value) : has(D.finalAdverbs, ts[n - 1].value))) {
        adjOptions.push({ end: n - 1, adv: { a: n - 1, b: n, head: n - 1, prep: null } });
      }
      if (L.prepReading) {
        var pi, ap, aNom;
        for (pi = verbEnd; pi < n - 1; pi++) {
          ap = L.prepReading(ts[pi].value);
          if (!ap || !has(ADJUNCT_PREPS, ap.base)) { continue; }
          if (pi === verbEnd && L.frame(lemma, 'objeto-indireto-' + ap.base)) { continue; }
          aNom = nominal(pi + 1, n, false, ap.det);
          if (aNom) {
            adjOptions.push({ end: pi, adv: { a: pi, b: n, head: aNom.head, prep: ts[pi].value, prepBase: ap.base } });
          }
        }
      }

      var ai;
      for (ai = 0; ai < adjOptions.length; ai++) {
        var end = adjOptions[ai].end;
        var advInfo = adjOptions[ai].adv;
        var frame, object, prepStart, indNom, pushed = false;

        function pushMatch(extraRoles, usedFrame) {
          var subjRole = subject.compound
            ? { key: 'sujeito', role: 'Sujeito composto', a: 0, b: firstVerb, head: null, heads: subject.heads }
            : { key: 'sujeito', role: 'Sujeito', a: 0, b: firstVerb, head: subject.head };
          var baseRoles = [
            subjRole,
            { key: 'predicado', role: 'Predicado', a: firstVerb, b: n },
            { key: 'verbo', role: group ? 'Locução verbal' : (usedFrame.pattern === 'predicativo' ? 'Verbo de ligação' : 'Núcleo verbal'), a: v, b: verbEnd, head: group ? group.main : v }
          ];
          var ri;
          for (ri = 0; ri < extraRoles.length; ri++) { baseRoles.push(extraRoles[ri]); }
          if (neg >= 0) { baseRoles.push({ key: 'negacao', role: 'Negação', a: neg, b: neg + 1, head: neg }); }
          if (advInfo) { baseRoles.push({ key: 'adjunto', role: 'Adjunto adverbial', a: advInfo.a, b: advInfo.b, head: advInfo.head, prep: advInfo.prep || null }); }
          matches.push({ roles: baseRoles, verb: v, verbEnd: verbEnd, lemma: lemma, forms: forms, group: group || null, frame: usedFrame });
          pushed = true;
        }

        /* 1. Objeto direto */
        object = nominal(verbEnd, end, false, null);
        if ((frame = L.frame(lemma, 'objeto-direto')) && object) {
          pushMatch([{ key: 'objeto', role: 'Objeto direto', a: verbEnd, b: end, head: object.head }], frame);
        }

        /* 2. Predicativo do sujeito (com verificação de concordância) */
        if (!pushed && !group && (frame = L.frame(lemma, 'predicativo')) && end === v + 2) {
          var predAdj = adjReading(ts[v + 1].value);
          if (predAdj && !has(['aberto', 'aberta', 'abertos', 'abertas'], ts[v + 1].value) &&
              agreesGender(predAdj.gender, subject.gender) && (!predAdj.number || predAdj.number === subject.number)) {
            pushMatch([{ key: 'predicativo', role: 'Predicativo do sujeito', a: v + 1, b: end, head: v + 1 }], frame);
          }
        }

        /* 3. Bitransitivo: objeto direto + objeto indireto com a/ao/à/aos/às/para */
        if (!pushed && (frame = L.frame(lemma, 'direto-e-indireto-a')) && end > verbEnd + 2) {
          var j, sp, objBit, indBit, bitMatches = [];
          for (j = verbEnd + 1; j < end - 1; j++) {
            sp = L.prepReading ? L.prepReading(ts[j].value) : (ts[j].value === 'a' ? { base: 'a', det: null } : null);
            if (!sp || (sp.base !== 'a' && sp.base !== 'para')) { continue; }
            objBit = nominal(verbEnd, j, false, null);
            if (!objBit) { continue; }
            indBit = nominal(j + 1, end, false, sp.det);
            if (!indBit) { continue; }
            bitMatches.push({ split: j, obj: objBit, ind: indBit, prep: ts[j].value });
          }
          if (bitMatches.length === 1) {
            var bm = bitMatches[0];
            pushMatch([
              { key: 'objeto', role: 'Objeto direto', a: verbEnd, b: bm.split, head: bm.obj.head },
              { key: 'indireto', role: 'Objeto indireto', a: bm.split, b: end, head: bm.ind.head, prep: bm.prep }
            ], frame);
          }
        }

        /* 4. Transitivo indireto (regência explícita de/em/com/a) */
        if (!pushed && L.prepReading && end > verbEnd + 1) {
          prepStart = L.prepReading(ts[verbEnd].value);
          if (prepStart) {
            var fi;
            for (fi = 0; fi < INDIRECT_FRAMES.length; fi++) {
              if (prepStart.base === INDIRECT_FRAMES[fi][1] && (frame = L.frame(lemma, INDIRECT_FRAMES[fi][0]))) {
                indNom = nominal(verbEnd + 1, end, false, prepStart.det);
                if (indNom) {
                  pushMatch([{ key: 'indireto', role: 'Objeto indireto', a: verbEnd, b: end, head: indNom.head, prep: ts[verbEnd].value }], frame);
                }
              }
            }
          }
        }

        /* 5. Intransitivo (sem complemento) */
        if (!pushed && (frame = L.frame(lemma, 'sem-complemento')) && end === verbEnd) {
          pushMatch([], frame);
        }
      }
    }
    return matches.length === 1 ? matches[0] : null;
  }

  /* Verifica espaços puros, admitindo vírgula opcional somente antes de conjunção coordenativa específica */
  function gapsValid(cut, ts, commaBeforeIdx) {
    var j, gap;
    for (j = 1; j < ts.length; j++) {
      gap = cut.slice(ts[j - 1].end, ts[j].start);
      if (j === commaBeforeIdx) {
        if (!/^,?[ \t\u00a0]+$/.test(gap)) { return false; }
      } else {
        if (!/^[ \t\u00a0]+$/.test(gap)) { return false; }
      }
    }
    return true;
  }

  /* Resolve oração simples (inclusive com sujeito composto) OU período composto por duas orações coordenadas */
  function parseSegment(cut, ts) {
    var candidates = [];
    if (gapsValid(cut, ts, -1)) {
      var single = parseSingle(cut, ts);
      if (single) { candidates.push([{ ts: ts, result: single, coord: null }]); }
    }
    if (L.coordReading && ts.length >= 5 && ts.length <= 44) {
      var ci, kind, ts1, ts2, r1, r2;
      for (ci = 2; ci <= ts.length - 3; ci++) {
        kind = L.coordReading(ts[ci].value);
        if (!kind) { continue; }
        if (!gapsValid(cut, ts, ci)) { continue; }
        ts1 = ts.slice(0, ci);
        ts2 = ts.slice(ci + 1);
        r1 = parseSingle(cut, ts1);
        if (!r1) { continue; }
        r2 = parseSingle(cut, ts2);
        if (!r2) { continue; }
        candidates.push([
          { ts: ts1, result: r1, coord: null },
          { ts: ts2, result: r2, coord: { token: ts[ci], kind: kind } }
        ]);
      }
    }
    return candidates.length === 1 ? candidates[0] : null;
  }

  function analyze(text, cap) {
    if (typeof text !== 'string') { throw new Error('A análise precisa receber texto.'); }
    cap = typeof cap === 'number' && cap > 0 ? Math.min(100, Math.floor(cap)) : 100;
    var cut = text.slice(0, 8000), tokens = E.reading.tokens(cut), partial = cut.length < text.length;
    if (tokens.length > 1600) { cut = cut.slice(0, tokens[1600].start); partial = true; }
    var clean = E.protectedText(cut), segments = E.reading.sentences(cut), out = [], analyzed = 0, skipped = 0, truncated = 0, capped = false, groups = 0;
    var limit = 'Hipótese tradicional para oração simples (sujeito simples ou composto) ou período de duas orações coordenadas (e, mas, porém, contudo, todavia, entretanto, ou, pois, logo, portanto) em ordem direta, sujeito explícito e indicativo compatível, com locuções auxiliares, determinantes, epíteto anteposto, especificador com de/do/da, regências delimitadas e adjunto adverbial circunstancial. Não resolve passiva, cadeias de auxiliares, modais, elipse, inversão, clíticos ou subordinação. Ausência de leitura não indica erro. Até 8.000 unidades UTF-16 e 1.600 tokens; segmentos cortados não são analisados.';
    segments.forEach(function (segment) {
      var raw = cut.slice(segment.start, segment.end), stop = segment.end;
      var tail = cut.slice(segment.end), completeBoundary = /[\r\n]/.test(tail) || /[.!?…;]$/.test(raw) && (segment.end < cut.length || /^[\s.!?…;]/.test(text.charAt(cut.length)));
      if (partial && /^\s*$/.test(tail) && !completeBoundary) { truncated++; return; }
      if (raw.length > 1000 || clean.slice(segment.start, segment.end) !== raw) { skipped++; return; }
      var terminal = raw.match(/[.!?…;]+\s*$/);
      if (terminal) { stop = segment.start + terminal.index; }
      var ts = E.reading.tokens(cut.slice(segment.start, stop));
      if (!ts.length) { return; }
      ts.forEach(function (t) { t.start += segment.start; t.end += segment.start; });
      var outerClean = /^\s*$/.test(cut.slice(segment.start, ts[0].start)) && /^\s*$/.test(cut.slice(ts[ts.length - 1].end, stop));
      var clauses = outerClean && parseSegment(cut, ts);
      if (!clauses) { skipped++; return; }

      var totalRoles = 0, ci;
      for (ci = 0; ci < clauses.length; ci++) {
        totalRoles += clauses[ci].result.roles.length + (clauses[ci].coord ? 1 : 0);
      }
      /* Nunca entregar metade das relações de uma construção ou período coordenado. */
      if (out.length + totalRoles > cap) { capped = true; return; }

      for (ci = 0; ci < clauses.length; ci++) {
        var cTs = clauses[ci].ts;
        var result = clauses[ci].result;
        var coord = clauses[ci].coord;
        analyzed++;
        if (result.group) { groups++; }

        var clauseStart = coord ? coord.token.start : cTs[0].start;
        var clauseEnd = cTs[cTs.length - 1].end;
        var id = 'sin-' + clauseStart;
        var verb = cTs[result.verb];
        var clause = span(text, clauseStart, clauseEnd);
        var verbText = text.slice(verb.start, cTs[result.verbEnd - 1].end);
        var edges = [{ from: id + '-sujeito', to: id + '-verbo', type: 'sujeito-verbo', label: 'sujeito ↔ verbo' }];
        if (coord) {
          edges.push({ from: id + '-conjuncao', to: id + '-verbo', type: 'conjuncao', label: 'conjunção (' + coord.kind + ') ↔ verbo' });
        }
        result.roles.forEach(function (p) {
          if (has(['objeto', 'indireto', 'predicativo', 'adjunto', 'negacao'], p.key)) {
            edges.push({ from: id + '-verbo', to: id + '-' + p.key, type: p.key, label: 'verbo ↔ ' + p.role.toLowerCase() });
          }
        });

        if (coord) {
          var conjText = text.slice(coord.token.start, coord.token.end);
          out.push(E.instruments.finding('sintaxe', 'PTBR-REL-009', text, coord.token.start, coord.token.end,
            'Conjunção coordenativa: uma leitura possível.',
            '“' + conjText + '” introduz esta oração coordenada (' + coord.kind + '), ligando-a à oração anterior dentro do período.',
            'Duas orações completas foram identificadas no período em torno desta conjunção coordenativa.',
            'A classificação semântica (' + coord.kind + ') reflete o uso tradicional mais frequente da conjunção; o contexto estilístico pode acrescentar matizes.', limit, source,
            {
              feature: 'Conjunção coordenativa', coordKind: coord.kind, analysisStatus: 'contextual',
              nodeId: id + '-conjuncao', parentId: id,
              clause: span(text, clause.start, clause.end), head: null,
              relations: edges.map(function (e) { return { from: e.from, to: e.to, type: e.type, label: e.label }; }),
              components: [], valencyFrame: { id: result.frame.id, lemma: result.frame.lemma, pattern: result.frame.pattern },
              groupKind: null, context: [span(text, verb.start, cTs[result.verbEnd - 1].end)],
              compatibleVerbs: result.forms.map(function (f) { return f.slice(); })
            }));
        }

        result.roles.forEach(function (p) {
          var a = cTs[p.a].start, b = cTs[p.b - 1].end, head = typeof p.head === 'number' ? span(text, cTs[p.head].start, cTs[p.head].end) : null;
          var subjectText = text.slice(cTs[0].start, cTs[result.roles[0].b - 1].end), predText = text.slice(cTs[result.roles[1].a].start, clauseEnd);
          var prepLabel = p.prep ? '“' + p.prep + '”' : 'a';
          var subjExplain;
          if (p.key === 'sujeito' && p.heads && p.heads.length === 2) {
            var h1 = text.slice(cTs[p.heads[0]].start, cTs[p.heads[0]].end);
            var h2 = text.slice(cTs[p.heads[1]].start, cTs[p.heads[1]].end);
            subjExplain = '“' + subjectText + '” forma um sujeito composto com dois núcleos (“' + h1 + '” e “' + h2 + '”), concordando no plural com “' + predText + '”.';
          } else {
            var sHeadTxt = typeof result.roles[0].head === 'number' ? text.slice(cTs[result.roles[0].head].start, cTs[result.roles[0].head].end) : subjectText;
            subjExplain = '“' + subjectText + '” é o grupo sobre o qual esta construção declara “' + predText + '”. Seu núcleo é “' + sHeadTxt + '”; há uma forma verbal compatível em pessoa e número.';
          }
          var explanations = {
            sujeito: subjExplain,
            predicado: 'O predicado reúne o que esta oração declara a respeito de “' + subjectText + '”, incluindo o verbo e os termos que o acompanham.',
            verbo: result.group ? '“' + verbText + '” funciona como um grupo verbal nesta hipótese. “' + text.slice(verb.start, verb.end) + '” é o auxiliar flexionado; “' + text.slice(cTs[result.group.main].start, cTs[result.group.main].end) + '” é o principal no ' + result.group.form + '. As duas formas não são contadas como duas orações.' : p.role === 'Verbo de ligação' ? '“' + verb.value + '” liga o sujeito ao predicativo nesta construção; não é apresentado como núcleo de um predicado verbal.' : '“' + verb.value + '” organiza o predicado nesta leitura. O sujeito e os complementos são identificados em relação a esse uso.',
            objeto: '“' + text.slice(a, b) + '” completa o emprego de “' + verbText + '” sem preposição necessária nesta construção. A leitura não se baseia apenas em vir depois do verbo.',
            indireto: '“' + text.slice(a, b) + '” completa, regido por ' + prepLabel + ', o verbo “' + result.lemma + '” nesta construção.',
            predicativo: '“' + text.slice(a, b) + '” atribui uma característica ao sujeito por meio do verbo de ligação.',
            negacao: '“' + text.slice(a, b) + '” nega o predicado; pertence ao grupo do predicado.',
            adjunto: p.prep ? '“' + text.slice(a, b) + '” acrescenta uma circunstância preposicionada ao predicado (com núcleo “' + text.slice(cTs[p.head].start, cTs[p.head].end) + '”); não recebe o rótulo de objeto.' : '“' + text.slice(a, b) + '” acrescenta uma circunstância ao predicado; não recebe o rótulo de objeto direto.'
          };
          var ruleIds = { sujeito: '001', predicado: '002', verbo: '003', objeto: '004', indireto: '005', predicativo: '006', negacao: '007', adjunto: '008' };
          var components = [];
          if (result.group && p.key === 'verbo') {
            components = [span(text, verb.start, verb.end), span(text, cTs[result.group.main].start, cTs[result.group.main].end)];
            components[0].role = 'Auxiliar'; components[1].role = 'Principal';
            if (result.group.connector !== null) { var ct = cTs[result.group.connector], cs = span(text, ct.start, ct.end); cs.role = 'Preposição'; components.splice(1, 0, cs); }
          } else if (p.key === 'sujeito' && p.heads && p.heads.length === 2) {
            components = [
              span(text, cTs[p.heads[0]].start, cTs[p.heads[0]].end),
              span(text, cTs[p.heads[1]].start, cTs[p.heads[1]].end)
            ];
            components[0].role = '1º núcleo';
            components[1].role = '2º núcleo';
          }
          out.push(E.instruments.finding('sintaxe', result.group && p.key === 'verbo' ? 'PTBR-LOC-001' : 'PTBR-REL-' + ruleIds[p.key], text, a, b, p.role + ': uma leitura possível.', explanations[p.key],
            'A construção inteira foi compatível com o recorte. Os vínculos representam esta hipótese, não uma árvore sintática geral.',
            'O contexto discursivo e outros sentidos podem mudar a leitura. Sujeito não é necessariamente quem pratica uma ação. Auxiliaridade depende da abordagem e do contexto; não se deduz voz passiva da presença de duas formas. A compatibilidade formal não certifica correção nem intenção.', limit, result.group ? groupSource : source,
            {
              feature: p.role, analysisStatus: 'contextual', nodeId: id + '-' + p.key, parentId: p.key === 'sujeito' || p.key === 'predicado' ? id : id + '-predicado',
              clause: span(text, clause.start, clause.end), head: head, relations: edges.map(function (e) { return { from: e.from, to: e.to, type: e.type, label: e.label }; }),
              components: components, valencyFrame: { id: result.frame.id, lemma: result.frame.lemma, pattern: result.frame.pattern }, groupKind: result.group && p.key === 'verbo' ? result.group.kind : null,
              context: [span(text, verb.start, cTs[result.verbEnd - 1].end)], compatibleVerbs: result.forms.map(function (f) { return f.slice(); })
            }));
        });
      }
    });
    out.coverageInfo = {
      version: version, scope: { start: 0, end: cut.length, total: text.length, partial: partial }, work: { characters: cut.length, tokens: Math.min(tokens.length, 1600), maxCharacters: 8000, maxTokens: 1600 },
      constructions: analyzed, verbGroups: groups, unsupported: skipped, truncated: truncated, outputLimited: capped,
      summary: 'Relações sintáticas: ' + analyzed + ' construção(ões) com leitura; ' + groups + ' locução(ões) verbal(is); ' + skipped + ' segmento(s) fora da cobertura; ' + truncated + ' segmento(s) cortado(s) sem leitura. Recorte 0–' + cut.length + ' de ' + text.length + ' unidades UTF-16.' + (partial ? ' Análise parcial: selecione outro trecho para continuar.' : '') + (capped ? ' Limite de apresentação atingido; nenhuma construção foi dividida.' : '')
    };
    return out;
  }
  E.syntaxRelations = { version: version, analyze: analyze };
}(typeof window !== 'undefined' ? window : this));
