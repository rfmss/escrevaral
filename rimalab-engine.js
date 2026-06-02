(function rimaLabEngine(global) {
  "use strict";

  // ── Dados ────────────────────────────────────────────────────────────────────
  let ENCYCLOPEDIA = [];
  let GRAMMAR_WORDS = {};
  let _dataLoaded = false;
  let _loadError  = false;

  async function ensureLoaded() {
    if (_dataLoaded || _loadError) return;
    try {
      const d = await fetch('rimalab-data.json').then(r => r.json());
      ENCYCLOPEDIA  = d.encyclopedia  || [];
      GRAMMAR_WORDS = d.grammarWords  || {};
      _dataLoaded   = true;
    } catch (_) {
      _loadError = true;
    }
  }

  ensureLoaded();

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

        // Ditongo crescente: 'i'/'u' é glide quando:
        //   a) precedido de cluster (tr, br, gr...) — sempre (pátria, glória)
        //   b) palavra tem acento gráfico explícito EM OUTRA sílaba e token atual é átono (glória, série, vitória)
        //   c) não é word-final após consoante simples sem acento explícito (rio, magia, teoria)
        const isWordFinal          = (i + 1 >= toks.length - 1);
        const prevIsCluster        = prevConsonLen > 1;
        const wordHasExplicitTonic = /[áàâãéèêíîóòôõúùû]/i.test(w);
        const curTokAccented       = /[áàâãéèêíîóòôõúùû]/i.test(t);
        const allowDit = isDit && t1.length === 1 &&
          (!isWordFinal || prevIsCluster || (prevConsonLen >= 1 && wordHasExplicitTonic && !curTokAccented));
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

  // Rima toante: apenas as vogais coincidem (ex: "pedra" / "cena")
  function soundsMatchToante(a, b) {
    const vowels = s => s.replace(/[^aeiou]/g, "");
    const va = vowels(a), vb = vowels(b);
    return va.length > 0 && va === vb;
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
    if (!rhymes) {
      const toante = soundsMatchToante(sA, sB);
      return { rhymes: toante, classification: toante ? "toante" : "nenhuma", wordA:wA, wordB:wB, soundA:sA, soundB:sB, classA: toante ? getGrammaticalClass(wA) : undefined, classB: toante ? getGrammaticalClass(wB) : undefined };
    }
    const clA = getGrammaticalClass(wA), clB = getGrammaticalClass(wB);
    return { rhymes, classification: classifyRhyme(wA,wB,clA,clB,sA,sB), wordA:wA, wordB:wB, soundA:sA, soundB:sB, classA:clA, classB:clB };
  }

  // ── Esquema de rimas — compara TODOS os versos da estrofe ────────────────────
  function computeRhymeScheme(verses) {
    const sounds = verses.map(v => { const w = getLastWord(v); return w ? getRhymeSound(w) : ""; });
    const map    = [];
    let code     = 65; // 'A'

    return sounds.map((s, i) => {
      if (!s) return "x";
      // Rima exata (consoante) → letra maiúscula
      const exactMatch = map.find(m => soundsMatch(m.sound, s));
      if (exactMatch) return exactMatch.letter;
      // Rima toante (assonância) → letra minúscula da mesma família
      const toanteMatch = map.find(m => soundsMatchToante(m.sound, s));
      if (toanteMatch) return toanteMatch.letter.toLowerCase();
      // Som novo → atribuir próxima letra
      const letter = String.fromCharCode(code++);
      map.push({ sound:s, letter });
      return letter;
    }).join(" ");
  }

  // ── Análise de estrofe ────────────────────────────────────────────────────────
  function analyzeStanza(stanzaVerses, offset) {
    const rhymes = [];
    for (let i = 0; i < stanzaVerses.length - 1; i++) {
      for (let j = i + 1; j < stanzaVerses.length; j++) {
        const r = analyzeRhyme(stanzaVerses[i], stanzaVerses[j]);
        if (r?.rhymes) rhymes.push({ ...r, from: offset + i, to: offset + j });
      }
    }
    return {
      verses: stanzaVerses,
      rhymes,
      scheme: computeRhymeScheme(stanzaVerses),
    };
  }

  // ── Detectar se o texto é prosa (sem versos) ─────────────────────────────────
  function detectarProsa(text) {
    if (!text?.trim()) return true;
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return true;
    // Linhas muito longas (> 100 chars) = prosa quase certamente
    const linhasLongas = lines.filter(l => l.length > 100).length;
    if (linhasLongas / lines.length > 0.5) return true;
    // Todas as linhas terminam com ponto final = prosa
    const terminamEmPonto = lines.filter(l => /[.!?]$/.test(l)).length;
    if (terminamEmPonto / lines.length > 0.7 && lines.length > 3) return true;
    return false;
  }

  // Palavras estruturais a ignorar na rima interna (artigos, preposições, conjunções curtas)
  const _STOP_RIMA = new Set([
    "o","a","os","as","um","uma","uns","umas",
    "e","ou","mas","nem","que","se","pois","logo","porém",
    "de","do","da","dos","das","em","no","na","nos","nas",
    "para","por","pelo","pela","pelos","pelas",
    "com","sem","sob","sobre","ao","à","aos","às",
    "eu","tu","ele","ela","nós","vós","eles","elas","você","vocês",
    "me","te","lhe","lhes","se","nos","vos",
    "não","sim","já","mais","bem","mal","só",
    "que","quem","qual","quais","como","quando","onde",
    "este","esta","esse","essa","aquele","aquela","isto","isso","aquilo",
  ]);

  // ── Rima interna — detecta padrões sonoros dentro da prosa ou verso único ───────
  function analisarRimaInterna(text) {
    const palavras = (text.match(/[\p{L}À-ɏ'-]+/gu) || [])
      .filter(w => w.length > 2 && !_STOP_RIMA.has(normalizeWord(w)));

    const grupos = {};
    for (const w of palavras) {
      const som = getRhymeSound(w);
      if (!som || som.length < 1) continue;
      let encontrado = false;
      for (const chave of Object.keys(grupos)) {
        if (soundsMatch(som, chave)) {
          grupos[chave].push(w); encontrado = true; break;
        }
        if (soundsMatchToante(som, chave)) {
          grupos[chave].push(w); encontrado = true; break;
        }
        // Ditongo vs. vogal nuclear: "ai"≡"i", "ou"≡"u" — vogal final do ditongo
        const curta = som.length === 1 && /[aeiou]/.test(som);
        const chaveCurta = chave.length === 1 && /[aeiou]/.test(chave);
        if (curta && chave.endsWith(som)) { grupos[chave].push(w); encontrado = true; break; }
        if (chaveCurta && som.endsWith(chave)) { grupos[chave].push(w); encontrado = true; break; }
      }
      if (!encontrado) grupos[som] = [w];
    }

    return Object.entries(grupos)
      .filter(([, ws]) => {
        const unicos = [...new Set(ws.map(normalizeWord))];
        return unicos.length >= 2;
      })
      .map(([som, ws]) => ({ som, palavras: [...new Set(ws)] }))
      .sort((a, b) => b.palavras.length - a.palavras.length);
  }

  // ── Análise completa ──────────────────────────────────────────────────────────
  function analyze(text) {
    const isProse = detectarProsa(text);
    const verses = text.split("\n").map(l => l.trim()).filter(Boolean);

    if (isProse || verses.length < 2) {
      const rimasInternas = analisarRimaInterna(text);
      const temRima = rimasInternas.length > 0;
      return {
        note: ACADEMIC_NOTE,
        isProse: true,
        rimasInternas,
        verses: [],
        scans: [],
        metrics: [],
        uniqueMetrics: [],
        isIsometric: false,
        rhymes: [],
        rhymePairs: [],
        rhymeScheme: "",
        stanzas: [],
        totalVerses: 0,
        dominantMetric: null,
        dominantName: "",
        proseNote: verses.length < 2
          ? (temRima
              ? `Padrão sonoro detectado: ${rimasInternas.map(g => g.palavras.join(" · ")).join(" | ")}`
              : "Escreva ao menos dois versos em linhas separadas para ver a análise.")
          : (temRima
              ? `Padrão sonoro no texto: ${rimasInternas.map(g => g.palavras.join(" · ")).join(" | ")}`
              : "O texto parece ser prosa. Cole versos separados por linha para ver métricas e rimas."),
      };
    }

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

    // Estrofes: blocos separados por linhas em branco
    const stanzaBlocks = text.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
    let stanzas = [];
    if (stanzaBlocks.length > 1) {
      let offset = 0;
      stanzas = stanzaBlocks.map(block => {
        const sv = block.split("\n").map(l => l.trim()).filter(Boolean);
        const st = analyzeStanza(sv, offset);
        offset += sv.length;
        return st;
      });
    }

    // Nome do metro dominante
    const dominantMetric = metrics.length ? metrics.sort((a,b) => metrics.filter(m=>m===b).length - metrics.filter(m=>m===a).length)[0] : null;
    const dominantName   = dominantMetric ? versoNome(dominantMetric) : "";

    return {
      note: ACADEMIC_NOTE,
      isProse: false,
      verses,
      scans,
      metrics,
      uniqueMetrics,
      isIsometric,
      rhymes,
      rhymeScheme: scheme,
      stanzas,
      totalVerses: verses.length,
      dominantMetric,
      dominantName,
    };
  }

  // ── Nomeação de esquemas canônicos ────────────────────────────────────────────
  const SCHEME_NAMES = {
    // Dísticos
    "A A":               "dístico rimado",
    "A B":               "dístico solto",
    // Tercetos
    "A A A":             "terceto monorrimo",
    "A B A":             "terceto",
    "A B B":             "terceto",
    "A A B":             "terceto",
    "A B C":             "terceto solto",
    // Quartetos
    "A B A B":           "quarteto alternado",
    "A A B B":           "quarteto emparelhado",
    "A B B A":           "quarteto abrazado (redondilha)",
    "A A A A":           "quarteto monorrimo",
    "A B C B":           "quarteto popular (balada)",
    "A B A C":           "quarteto",
    "A B C A":           "quarteto",
    "A B C D":           "quarteto em verso branco",
    // Quintilhas
    "A A B A B":         "quintilha",
    "A B A A B":         "quintilha",
    "A A B B A":         "quintilha",
    "A B A B A":         "quintilha alternada",
    "A B B A B":         "quintilha",
    // Sextilhas
    "A B A B A B":       "sextilha alternada",
    "A A B C C B":       "sextilha abrazada",
    "A A B A A B":       "sextilha",
    "A B C A B C":       "sextilha",
    "A A B B C C":       "sextilha emparelhada",
    // Sétimas
    "A B A B C C B":     "sétima",
    "A A B A A A B":     "sétima",
    // Oitavas
    "A B A B A B C C":   "oitava rima (Camões)",
    "A B A B C D C D":   "oitava alternada",
    "A B C A B C D D":   "oitava",
    // Décimas
    "A B B A A C C D D C": "décima espinela",
    "A B A B C C D E D E": "décima",
    // Soneto (14 versos: 2 quartetos + 2 tercetos)
    "A B B A A B B A C D C D C D": "soneto (CDC DCD)",
    "A B B A A B B A C D E C D E": "soneto (CDE CDE)",
  };

  function nameScheme(schemeStr) {
    if (!schemeStr) return "";
    // Normaliza para letras maiúsculas para busca canônica
    const normalized = schemeStr.toUpperCase();
    const direct = SCHEME_NAMES[normalized];
    if (direct) return direct;
    // Tenta reindexar (A B C → A B A quando padrão bate com renomeação)
    const letters = normalized.split(" ").filter(l => /[A-Z]/.test(l));
    const remap = {};
    let code = 65;
    const reindexed = letters.map(l => {
      if (!remap[l]) remap[l] = String.fromCharCode(code++);
      return remap[l];
    }).join(" ");
    return SCHEME_NAMES[reindexed] || "";
  }

  // ── Exportação da análise em texto ───────────────────────────────────────────
  function exportAnalysisText(analysis, title) {
    if (!analysis || analysis.isProse) {
      return `${title || "RimaLab"}\n${"─".repeat(40)}\n\n${analysis?.proseNote || "Nenhum verso para analisar."}\n`;
    }
    const lines = [
      title || "Análise RimaLab",
      "═".repeat(48),
      "",
      `Versos: ${analysis.totalVerses}`,
    ];
    if (analysis.dominantName)  lines.push(`Metro dominante: ${analysis.dominantName} (${analysis.dominantMetric} sílabas)`);
    if (analysis.isIsometric)   lines.push("Isomet‌ria: versos com a mesma medida");
    if (analysis.rhymeScheme) {
      const schemeName = nameScheme(analysis.rhymeScheme);
      lines.push(`Esquema de rimas: ${analysis.rhymeScheme}${schemeName ? ` (${schemeName})` : ""}`);
    }
    lines.push("", "─".repeat(48), "Versos e métricas:", "");
    analysis.scans.forEach((scan, i) => {
      const tonicity = scan.finalTonicity ? ` [${scan.finalTonicity}]` : "";
      lines.push(`  ${i + 1}. ${analysis.verses[i]}`);
      lines.push(`     ${scan.totalSyllables} sílabas · ${scan.finalWord || ""}${tonicity}${scan.name && scan.name !== `${scan.totalSyllables} sílabas` ? ` · ${scan.name}` : ""}`);
    });
    if (analysis.rhymes.length) {
      lines.push("", "─".repeat(48), "Pares de rima:", "");
      analysis.rhymes.forEach(r => {
        lines.push(`  v.${r.from + 1} × v.${r.to + 1}  ${r.wordA} / ${r.wordB}  [${r.classification}]`);
      });
    }
    if (analysis.stanzas) {
      lines.push("", "─".repeat(48), "Estrofes:", "");
      analysis.stanzas.forEach((st, i) => {
        const sn = nameScheme(st.scheme);
        lines.push(`  Estrofe ${i + 1}: ${st.scheme}${sn ? ` (${sn})` : ""} · ${st.verses.length} versos`);
      });
    }
    lines.push("", ACADEMIC_NOTE, "");
    return lines.join("\n");
  }

  function findRhymes(word, limit = 16) {
    if (!word || word.length < 2) return [];
    const target = getRhymeSound(normalizeWord(word));
    if (!target) return [];
    const gw = getGrammarWords();
    const results = [];
    for (const [w, cls] of Object.entries(gw)) {
      if (normalizeWord(w) === normalizeWord(word)) continue;
      const s = getRhymeSound(normalizeWord(w));
      if (soundsMatch(s, target)) {
        results.push({ word: w, cls, type: "exata" });
      } else if (soundsMatchToante(s, target)) {
        results.push({ word: w, cls, type: "toante" });
      }
    }
    // Exatas primeiro, depois toantes
    results.sort((a, b) => (a.type === "exata" ? 0 : 1) - (b.type === "exata" ? 0 : 1));
    return results.slice(0, limit);
  }

  // ── API pública ───────────────────────────────────────────────────────────────
  global.VeredaRimaLab = {
    analyze,
    analyzeRhyme,
    classifyTonicity,
    syllabify,
    scanVerse,
    nameScheme,
    exportAnalysisText,
    findRhymes,
    getRhymeSound,
    getEncyclopedia,
    ensureLoaded,
    isLoaded:     () => _dataLoaded,
    hasLoadError: () => _loadError,
    get encyclopedia() { return getEncyclopedia(); },
  };
})(typeof window !== "undefined" ? window : globalThis);
