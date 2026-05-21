(function rimaLabEngine(global) {
  "use strict";

  // ── Dados ────────────────────────────────────────────────────────────────────
  let ENCYCLOPEDIA = [];
  let GRAMMAR_WORDS = {};
  let _dataLoaded = false;

  fetch(`rimalab-data.json?v=20260514-f3`).then(r => r.json()).then(d => {
    ENCYCLOPEDIA  = d.encyclopedia  || [];
    GRAMMAR_WORDS = d.grammarWords  || {};
    _dataLoaded   = true;
  }).catch(() => {});

  const ENCYCLOPEDIA_FALLBACK = [
    { title:"Regra de ouro da métrica", tags:["escansão","última tônica","oficina"],
      body:"O verso é contado até a última sílaba tônica da última palavra. Sons depois dela não entram na medida clássica.",
      sample:"O amor é fogo que arde sem se ver" },
    { title:"Soneto", tags:["14 versos","decassílabo","ABBA ABBA CDC DCD"],
      body:"Dois quartetos e dois tercetos. O decassílabo clássico conta até a última sílaba tônica.",
      sample:"Sete anos de pastor Jacó servia\nLabão, pai de Raquel, serrana bela" },
    { title:"Redondilha maior", tags:["7 sílabas","heptassílabo","música"],
      body:"Uma das medidas mais naturais do português. Cantiga, cordel, letra.",
      sample:"Minha rua não cabe no mapa\nmas me chama pelo nome" },
  ];
  const GRAMMAR_WORDS_FALLBACK = {
    amor:"substantivo", dor:"substantivo", flor:"substantivo", mar:"substantivo",
    paz:"substantivo", voz:"substantivo", vez:"substantivo", vida:"substantivo",
    morte:"substantivo", saudade:"substantivo", ser:"verbo", ver:"verbo",
    ter:"verbo", amar:"verbo", belo:"adjetivo", triste:"adjetivo", forte:"adjetivo",
    sempre:"advérbio", nunca:"advérbio",
  };

  function getEncyclopedia()  { return _dataLoaded ? ENCYCLOPEDIA  : ENCYCLOPEDIA_FALLBACK; }
  function getGrammarWords()  { return _dataLoaded ? GRAMMAR_WORDS : GRAMMAR_WORDS_FALLBACK; }

  // ── Utilitários ───────────────────────────────────────────────────────────────
  const VOWELS    = "aeiouáàâãéèêíìîóòôõúùû";
  const ACCENTED  = /[áàâãéèêíìîóòôõúùû]/i;
  const ACADEMIC_NOTE = "Escansão automática é aproximação pedagógica: sinalefa, dicção regional e intenção musical podem mudar a contagem.";

  function isVowel(c) { return VOWELS.includes((c||"").toLowerCase()); }

  function stripAccents(v) {
    return String(v||"").normalize("NFD").replace(/[̀-ͯ]/g,"");
  }

  function normalizeWord(v) { return stripAccents(v).toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûçñ]/gi,""); }

  // ── Silabificação PT-BR real ──────────────────────────────────────────────────
  // Opera na forma ACENTUADA (não strippada) para preservar nasais e cedilha
  // Regras: ditongos, nasais, hiatos, dígrafos, encontros consonantais

  const DIGRAFOS    = new Set(["lh","nh","ch","rr","ss","sc","sç","xc"]);
  const CONS_INSEP  = new Set(["br","cr","dr","fr","gr","pr","tr","vr","bl","cl","fl","gl","pl","tl"]);
  // Vogais incluindo nasais e acentuadas
  const VOGAIS_RE   = /^[aeiouáàâãéèêíìîóòôõúùûãõ]/i;
  // Ditongos decrescentes (fonema vogal+semivogal)
  const DIT_DECR    = new Set(["ai","ei","oi","ui","au","eu","ou","ãe","õe","ão","em","im","om","um"]);
  // Ditongos crescentes (semivogal+vogal em que ambas ficam na mesma sílaba)
  const DIT_CRESC   = new Set(["ia","ie","io","iu","ua","ue","uo","uã","ui"]);

  function isV(c) {
    return VOGAIS_RE.test(c||"");
  }

  function stripV(c) {
    // Normaliza vogal para comparação de ditongo (remove acento, mantém nasal como 'a','e','o')
    return stripAccents(c||"").toLowerCase();
  }

  function syllabify(word) {
    // Trabalha em forma lowercased mas COM acentos (para preservar ã, ç, ê etc)
    const w = String(word||"").toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûçñ]/gi,"");
    if (!w) return [];

    // Tokenizar preservando dígrafos, ç e unidades nasais
    const toks = [];
    for (let i = 0; i < w.length; ) {
      const pair = w.slice(i, i+2);
      const tri  = w.slice(i, i+3);
      // Ditongos nasais como unidades: ão, ãe, õe
      if (tri === "ões" || tri === "ães") { toks.push(tri); i += 3; }
      else if (pair === "ão" || pair === "ãe" || pair === "õe" || pair === "ãos") {
        toks.push(pair); i += 2;
      }
      // Dígrafos consonantais
      else if (DIGRAFOS.has(pair)) { toks.push(pair); i += 2; }
      // qu/gu antes de e/i: u é mudo — tratar como dígrafo
      else if ((pair === "qu" || pair === "gu") && "ei".includes(w[i+2]||"")) {
        toks.push(pair); i += 2;
      }
      else { toks.push(w[i]); i++; }
    }

    const syls = [];
    let cur = "";

    for (let i = 0; i < toks.length; i++) {
      const t  = toks[i];
      const t1 = toks[i+1] || "";
      const t2 = toks[i+2] || "";

      // É a unidade uma vogal ou começa com vogal?
      const tv  = isV(t[0]) || t.startsWith("ã") || t.startsWith("õ") || t.startsWith("ão") || t.startsWith("ãe") || t.startsWith("õe");
      const t1v = isV(t1[0]) || t1.startsWith("ã") || t1.startsWith("õ") || t1.startsWith("ão");

      const prevConsonLen = cur.length; // comprimento ANTES de adicionar a vogal atual
      cur += t;

      if (!tv) continue;  // consoante pura — acumula

      // Vogal: decidir onde fecha a sílaba
      if (!t1v) {
        // Próxima unidade é consoante
        const cpair = t1 + (t2[0]||"");
        // Encontro inseparável (br, cr...) antes de vogal → fecha aqui
        if (CONS_INSEP.has(cpair) && isV(t2[0])) {
          syls.push(cur); cur = "";
        } else {
          syls.push(cur); cur = "";
        }
      } else {
        // Próxima também é vogal: ditongo ou hiato?
        const sv  = stripV(t.slice(-1));   // última vogal do token atual
        const sv1 = stripV(t1[0]);         // primeira vogal do próximo

        // Se t já é unidade nasal (ão, ãe...) → não absorve mais
        if (t.length > 1 && isV(t[0])) {
          syls.push(cur); cur = "";
          continue;
        }

        const pair2 = sv + sv1;
        // Vogal com acento gráfico (í, ú, à...) é núcleo silábico próprio → sempre hiato
        const t1HasAccent = /[áàâãéèêíîóòôõúùû]/i.test(t1[0] || "");
        const isDit = !t1HasAccent && (DIT_CRESC.has(pair2) || DIT_DECR.has(pair2));

        // Ditongo crescente: 'i'/'u' é glide apenas quando precedido de cluster consonantal (tr, br, gr...)
        // Rio/fio: 'r'(1) + 'io' → consoante simples → hiato
        // Pátria/glória: 'tr'(2) + 'ia' → cluster → glide → ditongo crescente
        const isWordFinal    = (i + 1 >= toks.length - 1);
        const prevIsCluster  = prevConsonLen > 1; // consonantes ANTES da vogal atual
        const allowDit = isDit && t1.length === 1 && (!isWordFinal || prevIsCluster);
        if (allowDit) {
          // Ditongo crescente: absorver próxima vogal
          cur += t1; i++;
          const after = toks[i+1] || "";
          const afterV = isV(after[0]) || after.startsWith("ã");
          if (!afterV) { syls.push(cur); cur = ""; }
        } else {
          // Hiato: fecha sílaba atual
          syls.push(cur); cur = "";
        }
      }
    }

    if (cur) {
      if (syls.length) syls[syls.length-1] += cur;
      else syls.push(cur);
    }

    return syls.length ? syls : [w];
  }

  // ── Tonicidade ────────────────────────────────────────────────────────────────
  // Ordem de prioridade: acento gráfico → regras ortográficas PT
  function classifyTonicity(word) {
    // Silabificar na forma ACENTUADA (não normalizada) para preservar ão, ã, etc.
    const wOrig = String(word||"").toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûçñ]/gi,"");
    const syls  = syllabify(wOrig);
    if (syls.length <= 1) return "monossílabo";

    // 1. Acento gráfico explícito (âêôáéíóúà)
    const acIdx = syls.findIndex(s => /[âêôáéíóúàãõ]/i.test(s));
    if (acIdx >= 0) {
      const fromEnd = syls.length - 1 - acIdx;
      if (fromEnd === 0) return "oxítona";
      if (fromEnd === 1) return "paroxítona";
      return "proparoxítona";
    }

    // 2. Regras ortográficas sem acento gráfico
    // Oxítonas: terminam em r, l, z, i, u, ditongo nasal, ditongo oral tônico
    const wn = normalizeWord(wOrig).replace(/s$/, "");  // sem plural para checar terminação
    if (/^.+(r|l|z|[iu])$/.test(wn)) return "oxítona";
    if (/^.+(im|um|om|em|ins|uns|ons|ens)$/.test(wn)) return "oxítona";
    // Terminações nasais acentuadas (mesmo sem acento gráfico explícito no wOrig)
    if (/^.+(ão|ãe|õe|ãos|ões|ães)$/.test(wOrig)) return "oxítona";
    // Ditongos orais tônicos no final
    if (/^.+(ei|ai|oi|ui|eu|au|ou|iu)$/.test(wn)) return "oxítona";

    // 3. Paroxítona por padrão
    return "paroxítona";
  }

  // ── Nome do verso ─────────────────────────────────────────────────────────────
  function versoNome(n) {
    const nomes = {
      1:"monossílabo", 2:"dissílabo", 3:"trissílabo", 4:"tetrassílabo",
      5:"redondilha menor", 6:"hexassílabo", 7:"redondilha maior",
      8:"octossílabo", 9:"eneassílabo", 10:"decassílabo",
      11:"hendecassílabo", 12:"dodecassílabo (alexandrino)",
    };
    return nomes[n] || `${n} sílabas`;
  }

  // ── Sinalefa ─────────────────────────────────────────────────────────────────
  // Sinalefa: elide vogal final de palavra com vogal inicial da próxima
  // Confiança: alta quando palavra átona, baixa quando oxítona
  // Sinalefa conservadora: só palavras funcionais átonas (sem acento gráfico tônico)
  const FUNC_ELIDE = new Set(["o","a","e","de","da","do","dos","das","que","me","te","se","lhe","nos","vos","ao","aos","no","na","nas","pelo","pela","pelos","pelas","um","uma","em"]);

  function canElide(left, right) {
    const lw    = normalizeWord(left.word);
    const rw    = normalizeWord(right.word);
    const lorig = left.word.toLowerCase();
    if (!isVowel(lw.slice(-1)) || !isVowel(rw.charAt(0))) return false;
    // Monosílabos com acento gráfico são tônicos → nunca elidem (é, ó, á...)
    if (left.syllables.length <= 1 && /[áàâãéèêíìîóòôõúùû]/.test(lorig)) return false;
    // Só palavras funcionais átonas elidem com segurança
    return FUNC_ELIDE.has(lw);
  }

  // ── Escansão de verso ─────────────────────────────────────────────────────────
  function scanVerse(verse) {
    const words = verse.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return { totalSyllables:0, rawSyllables:0, words:[], ellisions:[], finalWord:"", finalTonicity:"", name:"" };

    const analyzed = words.map(w => ({
      word: w, syllables: syllabify(normalizeWord(w)), tonicity: classifyTonicity(w)
    }));

    const ellisions = [];
    let raw = analyzed.reduce((s, a) => s + a.syllables.length, 0);

    for (let i = 0; i < analyzed.length - 1; i++) {
      if (canElide(analyzed[i], analyzed[i+1])) {
        ellisions.push(`${analyzed[i].word}⌃${analyzed[i+1].word}`);
        raw--;
      }
    }

    const fin = analyzed[analyzed.length-1];
    const adj = fin.tonicity === "paroxítona" ? 1 : fin.tonicity === "proparoxítona" ? 2 : 0;
    const total = Math.max(1, raw - adj);

    return { totalSyllables:total, rawSyllables:raw, words:analyzed, ellisions, finalWord:fin.word, finalTonicity:fin.tonicity, name:versoNome(total) };
  }

  // ── Normalização fonética ─────────────────────────────────────────────────────
  function phoneticNormalize(v) {
    return stripAccents(v).toLowerCase()
      .replace(/ç/g,"s").replace(/x$/,"s").replace(/z$/,"s")
      .replace(/am$/,"ao").replace(/ão$/,"ao").replace(/ons$/,"os")
      .replace(/ões$/,"ois").replace(/ães$/,"ais").replace(/ens$/,"es")
      .replace(/em$/,"em").replace(/lh/g,"li").replace(/nh/g,"ni")
      .replace(/ch/g,"x").replace(/qu/g,"k").replace(/gu([ei])/g,"g$1")
      .replace(/[^a-z]/g,"");
  }

  // ── Som de rima: desde a vogal tônica ────────────────────────────────────────
  function getRhymeSound(word) {
    const w    = normalizeWord(word);
    const syls = syllabify(w);
    const ton  = classifyTonicity(w);
    const idx  = ton === "proparoxítona" ? Math.max(0, syls.length-3)
               : ton === "paroxítona"   ? Math.max(0, syls.length-2)
               : syls.length - 1;
    const raw  = phoneticNormalize(syls.slice(idx).join(""));
    // Encontrar a vogal tônica: pular semi-vogal de ditongo crescente (i/u antes de vogal)
    let vi = raw.search(/[aeiou]/);
    if (vi >= 0 && /^[iu]/.test(raw.slice(vi)) && /[aeiou]/.test(raw[vi+1]||"")) {
      vi++; // pular o i/u glide — tônica é a vogal seguinte
    }
    return vi >= 0 ? raw.slice(vi) : raw;
  }

  // ── Correspondência de rima ───────────────────────────────────────────────────
  function soundsMatch(a, b) {
    if (!a || !b || a.length < 1 || b.length < 1) return false;
    if (a === b) return true;
    // Tolerância: vogais nasais equivalentes
    const norm = s => s.replace(/ao|am/g,"ao").replace(/em|en/g,"em");
    return norm(a) === norm(b);
  }

  // ── Classificação de rima ─────────────────────────────────────────────────────
  function getGrammaticalClass(word) {
    const w = normalizeWord(word);
    const gw = getGrammarWords();
    if (gw[w]) return gw[w];
    if (/mente$/.test(w)) return "advérbio";
    if (/(ar|er|ir)$/.test(w) && w.length > 3) return "verbo";
    if (/(ção|são|dade|eza|mento|agem)$/.test(w)) return "substantivo";
    if (/(ado|ada|oso|osa|ivo|iva|vel|ável|ível)$/.test(w)) return "adjetivo";
    return "substantivo";
  }

  function classifyRhyme(wA, wB, clA, clB, sA, sB) {
    const precious = [
      classifyTonicity(wA) === "proparoxítona",
      classifyTonicity(wB) === "proparoxítona",
      /íssimo|ático|ética|ância|ência|ável|ível|ização/.test(stripAccents(`${wA} ${wB}`).toLowerCase()),
    ];
    if (precious.some(Boolean)) return "preciosa";
    return clA === clB ? "pobre" : "rica";
  }

  function getLastWord(line) {
    const m = line.trim().match(/[\p{L}'-]+$/u);
    return m ? m[0] : "";
  }

  // ── Análise de rima (par de versos) ──────────────────────────────────────────
  function analyzeRhyme(lineA, lineB) {
    const wA = getLastWord(lineA), wB = getLastWord(lineB);
    if (!wA || !wB) return null;
    const sA = getRhymeSound(wA), sB = getRhymeSound(wB);
    const rhymes = soundsMatch(sA, sB);
    if (!rhymes) return { rhymes:false, classification:"nenhuma", wordA:wA, wordB:wB, soundA:sA, soundB:sB };
    const clA = getGrammaticalClass(wA), clB = getGrammaticalClass(wB);
    return { rhymes, classification: classifyRhyme(wA,wB,clA,clB,sA,sB), wordA:wA, wordB:wB, soundA:sA, soundB:sB, classA:clA, classB:clB };
  }

  // ── Esquema de rimas — compara TODOS os versos da estrofe ────────────────────
  function computeRhymeScheme(verses) {
    const sounds = verses.map(v => { const w = getLastWord(v); return w ? getRhymeSound(w) : ""; });
    const map    = [];
    let code     = 65; // 'A'

    return sounds.map((s, i) => {
      if (!s) return "-";
      const found = map.find(m => soundsMatch(m.sound, s));
      if (found) return found.letter;
      const letter = String.fromCharCode(code++);
      map.push({ sound:s, letter });
      return letter;
    }).join(" ");
  }

  // ── Análise completa ──────────────────────────────────────────────────────────
  function analyze(text) {
    const verses = text.split("\n").map(l => l.trim()).filter(Boolean);
    const scans  = verses.map(scanVerse);
    const metrics = scans.map(s => s.totalSyllables);
    const uniqueMetrics = [...new Set(metrics)].sort((a,b) => a-b);
    const isIsometric = metrics.length > 1 && metrics.every(m => m === metrics[0]);

    // Rimas: comparar todos os pares (não só adjacentes)
    const rhymes = [];
    for (let i = 0; i < verses.length-1; i++) {
      for (let j = i+1; j < verses.length; j++) {
        const r = analyzeRhyme(verses[i], verses[j]);
        if (r?.rhymes) rhymes.push({ ...r, from:i, to:j });
      }
    }

    const scheme = computeRhymeScheme(verses);

    // Nome do metro dominante
    const dominantMetric = metrics.length ? metrics.sort((a,b) => metrics.filter(m=>m===b).length - metrics.filter(m=>m===a).length)[0] : null;
    const dominantName   = dominantMetric ? versoNome(dominantMetric) : "";

    return {
      note: ACADEMIC_NOTE,
      verses,
      scans,
      metrics,
      uniqueMetrics,
      isIsometric,
      rhymes,
      rhymeScheme: scheme,
      totalVerses: verses.length,
      dominantMetric,
      dominantName,
    };
  }

  // ── API pública ───────────────────────────────────────────────────────────────
  global.VeredaRimaLab = {
    analyze,
    analyzeRhyme,
    classifyTonicity,
    syllabify,
    scanVerse,
    getEncyclopedia,
    get encyclopedia() { return getEncyclopedia(); },
  };
})(typeof window !== "undefined" ? window : globalThis);
