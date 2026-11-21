/* Relações em construções simples, literárias, passivas, coordenadas, subordinadas, elipse, aposto e vocativo. ES5; recebe texto, nunca o editor. */
(function (root) {
  'use strict';
  var E = root.Escr, D = E.grammarData, version = 'sintaxe-7-elipse-aposto-vocativo';
  var source = { title: 'Cunha e Cintra, 7ª ed., 2ª impressão, 2017, pp. 136–140, 145–154, 168–173, 394–397, 510–513 e 593–625; Bechara, Lições de Português pela Análise Sintática, arquivo recebido, páginas PDF 22, 48, 75–76, 94–96 e 103. Terminologia tradicional; critérios computacionais locais, não algoritmos dos autores.', url: null };
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
  function implicitPronoun(person, number) {
    if (person === 1 && number === 'singular') { return 'eu'; }
    if (person === 2 && number === 'singular') { return 'tu'; }
    if (person === 1 && number === 'plural') { return 'nós'; }
    return null;
  }
  function adjReading(word) {
    if (L.adjectiveReading) {
      var r = L.adjectiveReading(word);
      if (r) { return r; }
    }
    return has(D.classes.adjetivo, word) ? { gender: 'u', number: null } : null;
  }

  /* Núcleo de sintagma nominal reutilizável para sujeito, complementos e aposto explicativo */
  function matchNominalCore(text, ts, a, b, isSubject, forcedDet) {
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

    /* Epíteto literário anteposto ao substantivo, sempre com determinante */
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
    if (!det && !forcedDet) {
      if (E.contextualMorphology.readings(ts[p].value).classes.length > 1) { return null; }
      if (L.verbReadings && L.verbReadings(ts[p].value).length > 0) { return null; }
    }
    p++;
    if (!isSubject && p < b) { return null; }
    if (b - p > 2) { return null; }
    for (; p < b; p++) {
      adj = adjReading(ts[p].value);
      if (!adj || !agreesGender(adj.gender, noun.gender) || (adj.number && adj.number !== noun.number)) { return null; }
    }
    return { head: head, person: 3, number: noun.number, gender: noun.gender };
  }

  function matchNominal(text, ts, a, b, isSubject, forcedDet) {
    var simple = matchNominalCore(text, ts, a, b, isSubject, forcedDet);
    if (simple) { return simple; }
    if (!L.prepReading || b - a < 3) { return null; }
    var split, prep, left, right, found = null;
    for (split = a + 1; split < b - 1; split++) {
      prep = L.prepReading(ts[split].value);
      if (!prep || prep.base !== 'de') { continue; }
      left = matchNominalCore(text, ts, a, split, isSubject, forcedDet);
      if (!left || left.person !== 3) { continue; }
      right = matchNominalCore(text, ts, split + 1, b, false, prep.det);
      if (!right) { continue; }
      if (found) { return null; }
      found = left;
    }
    return found;
  }

  /* Vocativo: nome próprio ou interlocutor vocativo (com possessivo/adjetivo opcionais em concordância) */
  function parseVocative(text, vTs) {
    var n = vTs.length, p = 0, poss = null, preAdj = null, head, noun, cands;
    if (n < 1 || n > 3) { return null; }
    if (E.maturationData.subjects[vTs[0].value]) { return null; }
    if (p < n - 1 && L.determinerReading) {
      var d = L.determinerReading(vTs[p].value);
      if (d && d.kind === 'possessivo') { poss = d; p++; }
    }
    if (p < n - 1) {
      var a = adjReading(vTs[p].value);
      if (a && (!poss || (agreesGender(a.gender, poss.gender) && (!a.number || a.number === poss.number)))) {
        preAdj = a; p++;
      }
    }
    if (p !== n - 1) { return null; }
    head = p;
    var w = vTs[head].value;
    if (L.isProperName(w) && /^[A-ZÀ-ÖØ-Þ]/.test(text.charAt(vTs[head].start))) {
      var pg = L.properNameGender ? (L.properNameGender(w) || 'u') : 'u';
      if (poss && (!agreesGender(poss.gender, pg) || poss.number !== 'singular')) { return null; }
      if (preAdj && (!agreesGender(preAdj.gender, pg) || (preAdj.number && preAdj.number !== 'singular'))) { return null; }
      return { head: head, gender: pg, number: 'singular' };
    }
    if (!L.isVocativeNoun || !L.isVocativeNoun(w)) { return null; }
    cands = L.nounReadings(w);
    if (poss) { cands = cands.filter(function (r) { return r.gender === poss.gender && r.number === poss.number; }); }
    if (preAdj) { cands = cands.filter(function (r) { return agreesGender(preAdj.gender, r.gender) && (!preAdj.number || preAdj.number === r.number); }); }
    if (cands.length !== 1) { return null; }
    noun = cands[0];
    return { head: head, gender: noun.gender, number: noun.number };
  }

  function parseSingle(text, ts, opts) {
    var expectIntegrante = !!(opts && opts.expectIntegrante);
    var n = ts.length, v, firstVerb, forms, lemma, subject, neg = -1, group, verbEnd;
    if (n < 1 || n > 28) { return null; }

    function nominal(a, b, isSubject, forcedDet) {
      return matchNominal(text, ts, a, b, isSubject, forcedDet);
    }

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
    for (v = 0; v < n; v++) {
      neg = (v > 0 && ts[v - 1].value === 'não') ? v - 1 : -1;
      firstVerb = neg < 0 ? v : neg;
      var rawVerbs = L.verbReadings ? L.verbReadings(ts[v].value) : E.contextualMorphology.readings(ts[v].value).verbs;

      if (firstVerb === 0) {
        /* Sujeito oculto (desinencial): apenas 1ª/2ª pessoa inequívoca pela desinência (sem sincretismo 1ª/3ª) */
        var indForms = rawVerbs.filter(function (f) { return f[1].indexOf('indicativo:') === 0; });
        if (!indForms.length) { continue; }
        var pnKeys = [], pni, pnk;
        for (pni = 0; pni < indForms.length; pni++) {
          pnk = indForms[pni][2] + ':' + indForms[pni][3];
          if (!has(pnKeys, pnk)) { pnKeys.push(pnk); }
        }
        if (pnKeys.length !== 1) { continue; }
        var impPerson = indForms[0][2], impNumber = indForms[0][3];
        var impPron = implicitPronoun(impPerson, impNumber);
        if (!impPron) { continue; }
        /* Palavra isolada homógrafa de nome/adjetivo (ex.: "Canto.") permanece em abstenção (REL-N10). */
        if (n === 1) {
          var w0 = ts[v].value;
          var nonVerbCls = E.contextualMorphology.readings(w0).classes.filter(function (c) { return c !== 'verbo'; });
          if (L.nounReadings(w0).length > 0 || adjReading(w0) || nonVerbCls.length > 0) { continue; }
        }
        subject = { implicit: true, pronoun: impPron, person: impPerson, number: impNumber, gender: 'u' };
        forms = indForms;
      } else {
        subject = parseSubject(0, firstVerb);
        if (!subject) { continue; }
        forms = rawVerbs.filter(function (f) { return f[1].indexOf('indicativo:') === 0 && f[2] === subject.person && f[3] === subject.number; });
        if (!forms.length) { continue; }
      }

      /* Desambiguação pontual de ser/ir (foi, foram, fui) exclusivamente para passiva analítica com particípio + agente */
      var uniqueLemmas = [], uli;
      for (uli = 0; uli < forms.length; uli++) {
        if (!has(uniqueLemmas, forms[uli][0])) { uniqueLemmas.push(forms[uli][0]); }
      }
      var passiveOnlySer = false;
      if (uniqueLemmas.length === 1) {
        lemma = uniqueLemmas[0];
      } else if (!expectIntegrante && !subject.implicit && uniqueLemmas.length === 2 && has(uniqueLemmas, 'ser') && has(uniqueLemmas, 'ir') &&
          v + 1 < n && L.passiveParticipleReading && L.passiveParticipleReading(ts[v + 1].value)) {
        lemma = 'ser';
        forms = forms.filter(function (f) { return f[0] === 'ser'; });
        passiveOnlySer = true;
      } else {
        continue;
      }

      /* 0. Voz passiva analítica com agente da passiva explícito (sujeito explícito) */
      if (!expectIntegrante && !subject.implicit && lemma === 'ser' && v + 3 < n && L.passiveParticipleReading && L.prepReading) {
        var part = L.passiveParticipleReading(ts[v + 1].value);
        if (part && L.frame(part.lemma, 'objeto-direto') &&
            agreesGender(part.gender, subject.gender) && part.number === subject.number) {
          var passEnd = v + 2;
          var passAdjOpts = [{ end: n, adv: null }];
          if (n > passEnd + 2 && (L.isFinalAdverb ? L.isFinalAdverb(ts[n - 1].value) : has(D.finalAdverbs, ts[n - 1].value))) {
            passAdjOpts.push({ end: n - 1, adv: { a: n - 1, b: n, head: n - 1, prep: null } });
          }
          var ppi, pap, paNom;
          for (ppi = passEnd + 2; ppi < n - 1; ppi++) {
            if (ts[ppi].value === 'por') { continue; }
            pap = L.prepReading(ts[ppi].value);
            if (!pap || !has(ADJUNCT_PREPS, pap.base)) { continue; }
            paNom = nominal(ppi + 1, n, false, pap.det);
            if (paNom) {
              passAdjOpts.push({ end: ppi, adv: { a: ppi, b: n, head: paNom.head, prep: ts[ppi].value } });
            }
          }
          var pai;
          for (pai = 0; pai < passAdjOpts.length; pai++) {
            var pEnd = passAdjOpts[pai].end;
            var pAdv = passAdjOpts[pai].adv;
            if (pEnd <= passEnd + 1) { continue; }
            var agPrep = L.prepReading(ts[passEnd].value);
            if (!agPrep || agPrep.base !== 'por') { continue; }
            var agNom = nominal(passEnd + 1, pEnd, false, agPrep.det);
            if (!agNom) { continue; }
            var pSubjRole = subject.compound
              ? { key: 'sujeito', role: 'Sujeito paciente composto', a: 0, b: firstVerb, head: null, heads: subject.heads, passiveSubject: true }
              : { key: 'sujeito', role: 'Sujeito paciente', a: 0, b: firstVerb, head: subject.head, passiveSubject: true };
            var pRoles = [
              pSubjRole,
              { key: 'predicado', role: 'Predicado', a: firstVerb, b: n },
              { key: 'verbo', role: 'Locução passiva', a: v, b: passEnd, head: v + 1 },
              { key: 'agente', role: 'Agente da passiva', a: passEnd, b: pEnd, head: agNom.head, prep: ts[passEnd].value }
            ];
            if (neg >= 0) { pRoles.push({ key: 'negacao', role: 'Negação', a: neg, b: neg + 1, head: neg }); }
            if (pAdv) { pRoles.push({ key: 'adjunto', role: 'Adjunto adverbial', a: pAdv.a, b: pAdv.b, head: pAdv.head, prep: pAdv.prep || null }); }
            matches.push({
              roles: pRoles, verb: v, verbEnd: passEnd, lemma: part.lemma, forms: forms,
              group: null, passive: { first: v, main: v + 1, lemma: part.lemma },
              implicitSubject: null, subjectNumber: subject.number,
              frame: { id: 'PASS-' + part.lemma + '-analitica', lemma: part.lemma, pattern: 'voz-passiva-analitica' }
            });
          }
        }
      }
      if (passiveOnlySer) { continue; }

      group = E.verbGroups && E.verbGroups.match(ts, v, lemma);
      verbEnd = group ? group.last + 1 : v + 1;
      if (group) { lemma = group.lemma; }

      var impObj = subject.implicit ? {
        pronoun: subject.pronoun, person: subject.person, number: subject.number,
        label: 'Sujeito oculto: (' + subject.pronoun + ')'
      } : null;

      /* Modo específico para oração principal imediatamente antes de "que" integrante */
      if (expectIntegrante) {
        if (verbEnd === n) {
          var intFrame = L.frame(lemma, 'oracao-objetiva-direta');
          if (intFrame) {
            var intRoles = [];
            if (!subject.implicit) {
              intRoles.push(subject.compound
                ? { key: 'sujeito', role: 'Sujeito composto', a: 0, b: firstVerb, head: null, heads: subject.heads }
                : { key: 'sujeito', role: 'Sujeito', a: 0, b: firstVerb, head: subject.head });
            }
            intRoles.push({ key: 'predicado', role: 'Predicado', a: firstVerb, b: n });
            intRoles.push({ key: 'verbo', role: group ? 'Locução verbal' : 'Núcleo verbal', a: v, b: verbEnd, head: group ? group.main : v });
            if (neg >= 0) { intRoles.push({ key: 'negacao', role: 'Negação', a: neg, b: neg + 1, head: neg }); }
            matches.push({ roles: intRoles, verb: v, verbEnd: verbEnd, lemma: lemma, forms: forms, group: group || null, passive: null, implicitSubject: impObj, subjectNumber: subject.number, frame: intFrame });
          }
        }
        continue;
      }

      var adjOptions = [{ end: n, adv: null }];
      if (n > verbEnd && (L.isFinalAdverb ? L.isFinalAdverb(ts[n - 1].value) : has(D.finalAdverbs, ts[n - 1].value))) {
        adjOptions.push({ end: n - 1, adv: { a: n - 1, b: n, head: n - 1, prep: null } });
      }
      if (L.prepReading) {
        var pi, ap, aNom;
        for (pi = verbEnd; pi < n - 1; pi++) {
          if (ts[pi].value === 'por') { continue; }
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
          var baseRoles = [];
          if (!subject.implicit) {
            baseRoles.push(subject.compound
              ? { key: 'sujeito', role: 'Sujeito composto', a: 0, b: firstVerb, head: null, heads: subject.heads }
              : { key: 'sujeito', role: 'Sujeito', a: 0, b: firstVerb, head: subject.head });
          }
          baseRoles.push({ key: 'predicado', role: 'Predicado', a: firstVerb, b: n });
          baseRoles.push({ key: 'verbo', role: group ? 'Locução verbal' : (usedFrame.pattern === 'predicativo' ? 'Verbo de ligação' : 'Núcleo verbal'), a: v, b: verbEnd, head: group ? group.main : v });
          var ri;
          for (ri = 0; ri < extraRoles.length; ri++) { baseRoles.push(extraRoles[ri]); }
          if (neg >= 0) { baseRoles.push({ key: 'negacao', role: 'Negação', a: neg, b: neg + 1, head: neg }); }
          if (advInfo) { baseRoles.push({ key: 'adjunto', role: 'Adjunto adverbial', a: advInfo.a, b: advInfo.b, head: advInfo.head, prep: advInfo.prep || null }); }
          matches.push({ roles: baseRoles, verb: v, verbEnd: verbEnd, lemma: lemma, forms: forms, group: group || null, passive: null, implicitSubject: impObj, subjectNumber: subject.number, frame: usedFrame });
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

  function gapsValid(cut, ts, commaBeforeIdx, mode) {
    var j, gap;
    for (j = 1; j < ts.length; j++) {
      gap = cut.slice(ts[j - 1].end, ts[j].start);
      if (j === commaBeforeIdx) {
        if (mode === 'required') {
          if (!/^,[ \t\u00a0]+$/.test(gap)) { return false; }
        } else {
          if (!/^,?[ \t\u00a0]+$/.test(gap)) { return false; }
        }
      } else {
        if (!/^[ \t\u00a0]+$/.test(gap)) { return false; }
      }
    }
    return true;
  }

  /* Coleta índices exatos de vírgulas entre tokens; retorna null se houver qualquer outra pontuação */
  function commaPositions(cut, ts) {
    var pos = [], j, gap;
    for (j = 1; j < ts.length; j++) {
      gap = cut.slice(ts[j - 1].end, ts[j].start);
      if (/^[ \t\u00a0]+$/.test(gap)) { continue; }
      if (/^,[ \t\u00a0]+$/.test(gap)) { pos.push(j); continue; }
      return null;
    }
    return pos;
  }

  /* Resolve oração simples (sujeito explícito/composto/oculto, passiva, vocativo, aposto) ou período de 2 orações */
  function parseSegment(cut, ts) {
    var candidates = [], ci, kind, ts1, ts2, r1, r2;
    var commas = commaPositions(cut, ts);
    if (!commas) { return null; }

    /* A. Oração simples sem vírgulas (sujeito simples, composto, oculto ou voz passiva com agente) */
    if (commas.length === 0) {
      var single = parseSingle(cut, ts, null);
      if (single) { candidates.push([{ ts: ts, result: single, link: null, vocative: null, appositive: null }]); }
    }

    /* B. Oração simples com Vocativo inicial ou final isolado por 1 vírgula */
    if (commas.length === 1 && ts.length >= 2) {
      var split = commas[0];
      if (split >= 1 && split <= 3 && ts.length - split >= 1) {
        var vocInit = parseVocative(cut, ts.slice(0, split));
        if (vocInit) {
          var rAfter = parseSingle(cut, ts.slice(split), null);
          if (rAfter) {
            candidates.push([{ ts: ts.slice(split), result: rAfter, link: null, vocative: { ts: ts.slice(0, split), head: vocInit.head, pos: 'initial' }, appositive: null }]);
          }
        }
      }
      if (ts.length - split >= 1 && ts.length - split <= 3 && split >= 1) {
        var vocEnd = parseVocative(cut, ts.slice(split));
        if (vocEnd) {
          var rBefore = parseSingle(cut, ts.slice(0, split), null);
          if (rBefore) {
            candidates.push([{ ts: ts.slice(0, split), result: rBefore, link: null, vocative: { ts: ts.slice(split), head: vocEnd.head, pos: 'final' }, appositive: null }]);
          }
        }
      }
    }

    /* C. Oração simples com Aposto explicativo pós-sujeito entre 2 vírgulas: [Sujeito], [Aposto], [Predicado] */
    if (commas.length === 2 && ts.length >= 4) {
      var c1 = commas[0], c2 = commas[1];
      if (c1 >= 1 && c2 > c1 && ts.length > c2) {
        var subjTs = ts.slice(0, c1), appTs = ts.slice(c1, c2), predTs = ts.slice(c2);
        var appNom = matchNominal(cut, appTs, 0, appTs.length, true, null);
        if (appNom && appNom.person === 3) {
          var combined = subjTs.concat(predTs);
          var rApp = parseSingle(cut, combined, null);
          if (rApp && !rApp.implicitSubject && rApp.roles[0].key === 'sujeito' &&
              rApp.roles[0].b === subjTs.length && appNom.number === rApp.subjectNumber) {
            candidates.push([{ ts: combined, result: rApp, link: null, vocative: null, appositive: { ts: appTs, head: appNom.head } }]);
          }
        }
      }
    }

    /* D. Períodos de duas orações (coordenadas, subordinadas adverbiais e integrantes com "que") */
    if (ts.length >= 3 && ts.length <= 44 && commas.length <= 1) {
      /* D1. Orações coordenadas */
      if (L.coordReading) {
        for (ci = 1; ci <= ts.length - 2; ci++) {
          kind = L.coordReading(ts[ci].value);
          if (!kind || !gapsValid(cut, ts, ci, 'optional')) { continue; }
          ts1 = ts.slice(0, ci); ts2 = ts.slice(ci + 1);
          r1 = parseSingle(cut, ts1, null);
          if (!r1) { continue; }
          r2 = parseSingle(cut, ts2, null);
          if (!r2) { continue; }
          candidates.push([
            { ts: ts1, result: r1, link: null, vocative: null, appositive: null },
            { ts: ts2, result: r2, link: { mode: 'coord', role: 'Conjunção coordenativa', ruleId: 'PTBR-REL-009', token: ts[ci], subKind: kind }, vocative: null, appositive: null }
          ]);
        }
      }

      /* D2. Oração subordinada adverbial posposta */
      if (L.subordReading) {
        for (ci = 1; ci <= ts.length - 2; ci++) {
          kind = L.subordReading(ts[ci].value);
          if (!kind || !gapsValid(cut, ts, ci, 'optional')) { continue; }
          ts1 = ts.slice(0, ci); ts2 = ts.slice(ci + 1);
          r1 = parseSingle(cut, ts1, null);
          if (!r1) { continue; }
          r2 = parseSingle(cut, ts2, null);
          if (!r2) { continue; }
          candidates.push([
            { ts: ts1, result: r1, link: null, vocative: null, appositive: null },
            { ts: ts2, result: r2, link: { mode: 'subord', role: 'Conjunção subordinativa', ruleId: 'PTBR-REL-011', token: ts[ci], subKind: kind }, vocative: null, appositive: null }
          ]);
        }

        /* D3. Oração subordinada adverbial anteposta com vírgula obrigatória */
        var leadSub = L.subordReading(ts[0].value);
        if (leadSub && commas.length === 1) {
          ci = commas[0];
          if (ci >= 2 && ci <= ts.length - 1 && gapsValid(cut, ts, ci, 'required')) {
            ts1 = ts.slice(1, ci); ts2 = ts.slice(ci);
            r1 = parseSingle(cut, ts1, null);
            if (r1) {
              r2 = parseSingle(cut, ts2, null);
              if (r2) {
                candidates.push([
                  { ts: ts1, result: r1, link: { mode: 'subord', role: 'Conjunção subordinativa', ruleId: 'PTBR-REL-011', token: ts[0], subKind: leadSub }, vocative: null, appositive: null },
                  { ts: ts2, result: r2, link: null, vocative: null, appositive: null }
                ]);
              }
            }
          }
        }
      }

      /* D4. Oração subordinada substantiva objetiva direta (integrante com "que") */
      if (commas.length === 0) {
        for (ci = 1; ci <= ts.length - 2; ci++) {
          if (ts[ci].value !== 'que') { continue; }
          ts1 = ts.slice(0, ci); ts2 = ts.slice(ci + 1);
          r1 = parseSingle(cut, ts1, { expectIntegrante: true });
          if (!r1) { continue; }
          r2 = parseSingle(cut, ts2, null);
          if (!r2) { continue; }
          candidates.push([
            { ts: ts1, result: r1, link: null, vocative: null, appositive: null },
            { ts: ts2, result: r2, link: { mode: 'integrante', role: 'Conjunção integrante', ruleId: 'PTBR-REL-012', token: ts[ci], subKind: 'integrante' }, vocative: null, appositive: null }
          ]);
        }
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
    var limit = 'Hipótese tradicional para oração simples (sujeito explícito, composto ou oculto desinencial de 1ª/2ª pessoa), vocativo, aposto explicativo pós-sujeito, voz passiva analítica com agente explícito, coordenação (e, mas, porém, contudo, todavia, entretanto, ou, pois, logo, portanto) e subordinação adverbial (quando, enquanto, porque, se) ou integrante com que, em ordem direta e indicativo compatível. Não resolve passiva sem agente, sujeito indeterminado/impessoal, cadeias de auxiliares, modais, inversão, clíticos ou subjuntivo. Ausência de leitura não indica erro. Até 8.000 unidades UTF-16 e 1.600 tokens; segmentos cortados não são analisados.';
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
        totalRoles += clauses[ci].result.roles.length + (clauses[ci].link ? 1 : 0) + (clauses[ci].vocative ? 1 : 0) + (clauses[ci].appositive ? 1 : 0);
      }
      if (out.length + totalRoles > cap) { capped = true; return; }

      for (ci = 0; ci < clauses.length; ci++) {
        var cTs = clauses[ci].ts;
        var result = clauses[ci].result;
        var link = clauses[ci].link;
        var voc = clauses[ci].vocative;
        var app = clauses[ci].appositive;
        analyzed++;
        if (result.group) { groups++; }

        var clauseStart = link ? link.token.start : cTs[0].start;
        var clauseEnd = cTs[cTs.length - 1].end;
        if (voc && voc.pos === 'initial') { clauseStart = voc.ts[0].start; }
        if (voc && voc.pos === 'final') { clauseEnd = voc.ts[voc.ts.length - 1].end; }
        var id = 'sin-' + clauseStart;
        var verb = cTs[result.verb];
        var clause = span(text, clauseStart, clauseEnd);
        var verbText = text.slice(verb.start, cTs[result.verbEnd - 1].end);
        var edges = [];
        if (!result.implicitSubject) {
          edges.push({ from: id + '-sujeito', to: id + '-verbo', type: 'sujeito-verbo', label: result.passive ? 'sujeito paciente ↔ verbo' : 'sujeito ↔ verbo' });
        }
        if (app) {
          edges.push({ from: id + '-sujeito', to: id + '-aposto', type: 'aposto', label: 'sujeito ↔ aposto' });
        }
        if (link) {
          var linkLabel = link.mode === 'integrante' ? 'conjunção integrante ↔ verbo' : ('conjunção (' + link.subKind + ') ↔ verbo');
          edges.push({ from: id + '-conjuncao', to: id + '-verbo', type: 'conjuncao', label: linkLabel });
        }
        result.roles.forEach(function (p) {
          if (has(['objeto', 'indireto', 'predicativo', 'agente', 'adjunto', 'negacao'], p.key)) {
            edges.push({ from: id + '-verbo', to: id + '-' + p.key, type: p.key, label: 'verbo ↔ ' + p.role.toLowerCase() });
          }
        });

        if (voc) {
          var va = voc.ts[0].start, vb = voc.ts[voc.ts.length - 1].end;
          var vHead = span(text, voc.ts[voc.head].start, voc.ts[voc.head].end);
          out.push(E.instruments.finding('sintaxe', 'PTBR-REL-013', text, va, vb,
            'Vocativo: uma leitura possível.',
            '“' + text.slice(va, vb) + '” funciona como vocativo, isolado por vírgula para chamar ou interpelar o interlocutor (núcleo “' + vHead.snippet + '”). Não integra o sujeito nem o predicado.',
            'O sintagma vocativo aparece separado por vírgula na periferia da oração.',
            'O vocativo é termo independente da estrutura sujeito-predicado; entonação e contexto discursivo confirmam o chamamento.',
            limit, source,
            {
              feature: 'Vocativo', analysisStatus: 'contextual', nodeId: id + '-vocativo', parentId: id,
              clause: span(text, clause.start, clause.end), head: vHead,
              relations: edges.map(function (e) { return { from: e.from, to: e.to, type: e.type, label: e.label }; }),
              components: [], valencyFrame: { id: result.frame.id, lemma: result.frame.lemma, pattern: result.frame.pattern },
              groupKind: null, context: [span(text, verb.start, cTs[result.verbEnd - 1].end)],
              compatibleVerbs: result.forms.map(function (f) { return f.slice(); })
            }));
        }

        if (app) {
          var aa = app.ts[0].start, ab = app.ts[app.ts.length - 1].end;
          var aHead = span(text, app.ts[app.head].start, app.ts[app.head].end);
          var sText = text.slice(cTs[0].start, cTs[result.roles[0].b - 1].end);
          out.push(E.instruments.finding('sintaxe', 'PTBR-REL-014', text, aa, ab,
            'Aposto explicativo: uma leitura possível.',
            '“' + text.slice(aa, ab) + '” explica ou especifica o sujeito “' + sText + '” entre vírgulas (núcleo “' + aHead.snippet + '”).',
            'O sintagma nominal aparece intercalado entre duas vírgulas logo após o sujeito, em concordância de número.',
            'Na tradição gramatical, o aposto explicativo retoma e esclarece o termo antecedente sem exercer função de predicativo verbal.',
            limit, source,
            {
              feature: 'Aposto explicativo', analysisStatus: 'contextual', nodeId: id + '-aposto', parentId: id,
              clause: span(text, clause.start, clause.end), head: aHead,
              relations: edges.map(function (e) { return { from: e.from, to: e.to, type: e.type, label: e.label }; }),
              components: [], valencyFrame: { id: result.frame.id, lemma: result.frame.lemma, pattern: result.frame.pattern },
              groupKind: null, context: [span(text, verb.start, cTs[result.verbEnd - 1].end)],
              compatibleVerbs: result.forms.map(function (f) { return f.slice(); })
            }));
        }

        if (link) {
          var conjText = text.slice(link.token.start, link.token.end);
          var linkObs = link.mode === 'coord'
            ? '“' + conjText + '” introduz esta oração coordenada (' + link.subKind + '), ligando-a à oração anterior dentro do período.'
            : link.mode === 'integrante'
              ? '“' + conjText + '” atua como conjunção integrante, introduzindo esta oração subordinada substantiva objetiva direta que completa o verbo da oração principal.'
              : '“' + conjText + '” introduz esta oração subordinada adverbial (' + link.subKind + '), estabelecendo relação de circunstância com a oração principal.';
          var linkExtra = {
            feature: link.role, analysisStatus: 'contextual',
            nodeId: id + '-conjuncao', parentId: id,
            clause: span(text, clause.start, clause.end), head: null,
            relations: edges.map(function (e) { return { from: e.from, to: e.to, type: e.type, label: e.label }; }),
            components: [], valencyFrame: { id: result.frame.id, lemma: result.frame.lemma, pattern: result.frame.pattern },
            groupKind: null, context: [span(text, verb.start, cTs[result.verbEnd - 1].end)],
            compatibleVerbs: result.forms.map(function (f) { return f.slice(); })
          };
          if (link.mode === 'coord') { linkExtra.coordKind = link.subKind; }
          else { linkExtra.subordKind = link.subKind; }
          out.push(E.instruments.finding('sintaxe', link.ruleId, text, link.token.start, link.token.end,
            link.role + ': uma leitura possível.', linkObs,
            'Duas orações completas foram identificadas no período em torno desta conjunção.',
            'A classificação (' + link.subKind + ') segue o uso tradicional mais frequente; o contexto estilístico pode acrescentar matizes.',
            limit, source, linkExtra));
        }

        result.roles.forEach(function (p) {
          var a = cTs[p.a].start, b = cTs[p.b - 1].end, head = typeof p.head === 'number' ? span(text, cTs[p.head].start, cTs[p.head].end) : null;
          var hasSubjRole = !result.implicitSubject;
          var subjectText = hasSubjRole ? text.slice(cTs[0].start, cTs[result.roles[0].b - 1].end) : ('(' + result.implicitSubject.pronoun + ')');
          var predRole = hasSubjRole ? result.roles[1] : result.roles[0];
          var predText = text.slice(cTs[predRole.a].start, cTs[predRole.b - 1].end);
          var prepLabel = p.prep ? '“' + p.prep + '”' : 'a';
          var headWord = typeof p.head === 'number' ? text.slice(cTs[p.head].start, cTs[p.head].end) : '';
          var subjExplain = '';
          if (hasSubjRole && p.key === 'sujeito') {
            if (p.heads && p.heads.length === 2) {
              var h1 = text.slice(cTs[p.heads[0]].start, cTs[p.heads[0]].end);
              var h2 = text.slice(cTs[p.heads[1]].start, cTs[p.heads[1]].end);
              subjExplain = p.passiveSubject
                ? '“' + subjectText + '” forma um sujeito paciente composto (“' + h1 + '” e “' + h2 + '”) na voz passiva analítica, concordando com o auxiliar e o particípio.'
                : '“' + subjectText + '” forma um sujeito composto com dois núcleos (“' + h1 + '” e “' + h2 + '”), concordando no plural com “' + predText + '”.';
            } else {
              var sHeadTxt = typeof result.roles[0].head === 'number' ? text.slice(cTs[result.roles[0].head].start, cTs[result.roles[0].head].end) : subjectText;
              subjExplain = p.passiveSubject
                ? '“' + subjectText + '” recebe a ação expressa pela locução passiva “' + verbText + '” (sujeito paciente, núcleo “' + sHeadTxt + '”), concordando em gênero e número com o particípio.'
                : '“' + subjectText + '” é o grupo sobre o qual esta construção declara “' + predText + '”. Seu núcleo é “' + sHeadTxt + '”; há uma forma verbal compatível em pessoa e número.';
            }
          }
          var verbExplain;
          if (result.passive) {
            verbExplain = '“' + verbText + '” forma uma locução verbal na voz passiva analítica: auxiliar “' + text.slice(verb.start, verb.end) + '” (ser) + particípio “' + text.slice(cTs[result.passive.main].start, cTs[result.passive.main].end) + '” (' + result.passive.lemma + '), acompanhada de agente da passiva explícito.';
          } else if (result.group) {
            verbExplain = '“' + verbText + '” funciona como um grupo verbal nesta hipótese. “' + text.slice(verb.start, verb.end) + '” é o auxiliar flexionado; “' + text.slice(cTs[result.group.main].start, cTs[result.group.main].end) + '” é o principal no ' + result.group.form + '. As duas formas não são contadas como duas orações.';
          } else if (p.role === 'Verbo de ligação') {
            verbExplain = '“' + verb.value + '” liga o sujeito ao predicativo nesta construção; não é apresentado como núcleo de um predicado verbal.';
          } else {
            verbExplain = '“' + verb.value + '” organiza o predicado nesta leitura. O sujeito e os complementos são identificados em relação a esse uso.';
          }
          if (result.implicitSubject && p.key === 'verbo') {
            verbExplain += ' Sujeito oculto (desinencial): a desinência verbal indica “' + result.implicitSubject.pronoun + '” (' + result.implicitSubject.person + 'ª pessoa do ' + result.implicitSubject.number + ') sem pronome explícito.';
          }
          var explanations = {
            sujeito: subjExplain,
            predicado: result.implicitSubject
              ? 'O predicado reúne toda a declaração desta oração com sujeito oculto (desinencial “' + result.implicitSubject.pronoun + '”).'
              : 'O predicado reúne o que esta oração declara a respeito de “' + subjectText + '”, incluindo o verbo e os termos que o acompanham.',
            verbo: verbExplain,
            objeto: '“' + text.slice(a, b) + '” completa o emprego de “' + verbText + '” sem preposição necessária nesta construção. A leitura não se baseia apenas em vir depois do verbo.',
            indireto: '“' + text.slice(a, b) + '” completa, regido por ' + prepLabel + ', o verbo “' + result.lemma + '” nesta construção.',
            predicativo: '“' + text.slice(a, b) + '” atribui uma característica ao sujeito por meio do verbo de ligação.',
            agente: '“' + text.slice(a, b) + '” indica quem pratica a ação na voz passiva analítica, introduzido por ' + prepLabel + ' (núcleo “' + headWord + '”).',
            negacao: '“' + text.slice(a, b) + '” nega o predicado; pertence ao grupo do predicado.',
            adjunto: p.prep ? '“' + text.slice(a, b) + '” acrescenta uma circunstância preposicionada ao predicado (com núcleo “' + headWord + '”); não recebe o rótulo de objeto.' : '“' + text.slice(a, b) + '” acrescenta uma circunstância ao predicado; não recebe o rótulo de objeto direto.'
          };
          var ruleIds = { sujeito: '001', predicado: '002', verbo: '003', objeto: '004', indireto: '005', predicativo: '006', negacao: '007', adjunto: '008', agente: '010' };
          var components = [];
          if (result.passive && p.key === 'verbo') {
            components = [
              span(text, verb.start, verb.end),
              span(text, cTs[result.passive.main].start, cTs[result.passive.main].end)
            ];
            components[0].role = 'Auxiliar';
            components[1].role = 'Particípio';
          } else if (result.group && p.key === 'verbo') {
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
          var findingRuleId = (result.group && p.key === 'verbo') ? 'PTBR-LOC-001'
            : (result.passive && p.key === 'verbo') ? 'PTBR-LOC-002'
              : 'PTBR-REL-' + ruleIds[p.key];
          var extra = {
            feature: p.role, analysisStatus: 'contextual', nodeId: id + '-' + p.key, parentId: p.key === 'sujeito' || p.key === 'predicado' ? id : id + '-predicado',
            clause: span(text, clause.start, clause.end), head: head, relations: edges.map(function (e) { return { from: e.from, to: e.to, type: e.type, label: e.label }; }),
            components: components, valencyFrame: { id: result.frame.id, lemma: result.frame.lemma, pattern: result.frame.pattern },
            groupKind: result.group && p.key === 'verbo' ? result.group.kind : (result.passive && p.key === 'verbo' ? 'passiva analítica' : null),
            context: [span(text, verb.start, cTs[result.verbEnd - 1].end)], compatibleVerbs: result.forms.map(function (f) { return f.slice(); })
          };
          if (result.implicitSubject && p.key === 'verbo') {
            extra.implicitSubject = {
              pronoun: result.implicitSubject.pronoun,
              person: result.implicitSubject.person,
              number: result.implicitSubject.number,
              label: result.implicitSubject.label
            };
          }
          out.push(E.instruments.finding('sintaxe', findingRuleId, text, a, b, p.role + ': uma leitura possível.', explanations[p.key],
            'A construção inteira foi compatível com o recorte. Os vínculos representam esta hipótese, não uma árvore sintática geral.',
            'O contexto discursivo e outros sentidos podem mudar a leitura. Sujeito não é necessariamente quem pratica uma ação. A compatibilidade formal não certifica correção nem intenção.', limit, (result.group || result.passive) ? groupSource : source, extra));
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
