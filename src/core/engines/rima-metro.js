(function (global) {
    "use strict";

    /* Escrevaral-Encore — Engine de Rima e Métrica (ES5, baixa RAM).
     * Portada de escrevaral (rimalab-engine.js). Reuso de comportamento, não cópia.
     * Núcleo analítico portado SEM dicionário (classe gramatical por heurística de
     * sufixo): silabificação PT-BR, tonicidade, sinalefa, escansão de verso, som de
     * rima, correspondência consoante/toante, esquema de rimas (A B B A), nome do
     * metro e de esquemas canônicos.
     *
     * Norma ES5/piso: var/functions, Sets→objetos, sem arrow/spread/??./template,
     * sem regex \p{L}/normalize (mapa de acentos manual + classes explícitas).
     */

    var ACADEMIC_NOTE = "Escansão automática é aproximação pedagógica: sinalefa, dicção regional e intenção musical podem mudar a contagem.";

    /* ── Acentos → ASCII (equiv. ES5 a normalize("NFD")) ─────────────────────── */
    var ACCENTS = {
        "á": "a", "à": "a", "â": "a", "ã": "a", "ä": "a", "Ã": "a",
        "é": "e", "è": "e", "ê": "e", "ẽ": "e", "ë": "e", "Ê": "e",
        "í": "i", "ì": "i", "î": "i", "ĩ": "i", "ï": "i",
        "ó": "o", "ò": "o", "ô": "o", "õ": "o", "ö": "o", "Õ": "o",
        "ú": "u", "ù": "u", "û": "u", "ũ": "u", "ü": "u",
        "ç": "c", "Ç": "c", "ñ": "n", "Ñ": "n", "ÿ": "y"
    };
    function stripAccents(v) {
        var s = String(v || "");
        var out = "";
        for (var i = 0; i < s.length; i++) {
            var ch = s.charAt(i);
            var rep = ACCENTS[ch];
            out += rep === undefined ? ch : rep;
        }
        return out;
    }

    var VOWELS = "aeiouáàâãéèêíìîóòôõúùû";
    function isVowel(c) {
        return VOWELS.indexOf(String(c || "").toLowerCase()) !== -1;
    }

    function normalizeWord(v) {
        return stripAccents(v).toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûçñ]/gi, "");
    }

    /* ── Conjuntos (flags) ────────────────────────────────────────────────────── */
    var DIGRAFOS = { "lh": 1, "nh": 1, "ch": 1, "rr": 1, "ss": 1, "sc": 1, "sç": 1, "xc": 1 };
    var CONS_INSEP = {
        "br": 1, "cr": 1, "dr": 1, "fr": 1, "gr": 1, "pr": 1, "tr": 1, "vr": 1,
        "bl": 1, "cl": 1, "fl": 1, "gl": 1, "pl": 1, "tl": 1
    };
    var DIT_DECR = {
        "ai": 1, "ei": 1, "oi": 1, "ui": 1, "au": 1, "eu": 1, "ou": 1,
        "ãe": 1, "õe": 1, "ão": 1, "em": 1, "im": 1, "om": 1, "um": 1
    };
    var DIT_CRESC = { "ia": 1, "ie": 1, "io": 1, "iu": 1, "ua": 1, "ue": 1, "uo": 1, "uã": 1, "ui": 1 };
    var VOGAIS_RE = /^[aeiouáàâãéèêíìîóòôõúùûãõ]/i;
    var FUNC_ELIDE = {
        "o": 1, "a": 1, "e": 1, "de": 1, "da": 1, "do": 1, "dos": 1, "das": 1,
        "que": 1, "me": 1, "te": 1, "se": 1, "lhe": 1, "nos": 1, "vos": 1,
        "ao": 1, "aos": 1, "no": 1, "na": 1, "nas": 1, "pelo": 1, "pela": 1,
        "pelos": 1, "pelas": 1, "um": 1, "uma": 1, "em": 1
    };
    var ACCENT_RE = /[áàâãéèêíìîóòôõúùû]/i;

    function has(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }

    function isV(c) {
        return VOGAIS_RE.test(c || "");
    }

    /* ── Silabificação PT-BR (preserva nasais/cedilha — forma acentuada) ─────── */
    function syllabify(word) {
        var w = String(word || "").toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûçñ]/gi, "");
        if (!w) return [];

        var toks = [];
        var i = 0;
        while (i < w.length) {
            var pair = w.slice(i, i + 2);
            var tri = w.slice(i, i + 3);
            if (tri === "ões" || tri === "ães") { toks.push(tri); i += 3; }
            else if (pair === "ão" || pair === "ãe" || pair === "õe" || pair === "ãos") { toks.push(pair); i += 2; }
            else if (has(DIGRAFOS, pair)) { toks.push(pair); i += 2; }
            else if ((pair === "qu" || pair === "gu") && "ei".indexOf(w.charAt(i + 2) || "") !== -1) { toks.push(pair); i += 2; }
            else { toks.push(w.charAt(i)); i++; }
        }

        var syls = [];
        var cur = "";
        for (var k = 0; k < toks.length; k++) {
            var t = toks[k];
            var t1 = toks[k + 1] || "";
            var t2 = toks[k + 2] || "";

            var tv = isV(t.charAt(0)) || t.indexOf("ã") === 0 || t.indexOf("õ") === 0 ||
                t.indexOf("ão") === 0 || t.indexOf("ãe") === 0 || t.indexOf("õe") === 0;
            var t1v = isV(t1.charAt(0)) || t1.indexOf("ã") === 0 || t1.indexOf("õ") === 0 || t1.indexOf("ão") === 0;

            var prevConsonLen = cur.length;
            cur += t;

            if (!tv) continue;

            if (!t1v) {
                var cpair = t1.charAt(0) ? t1.charAt(0) + t2.charAt(0) : "";
                if (has(CONS_INSEP, cpair) && isV(t2.charAt(0))) { syls.push(cur); cur = ""; }
                else { syls.push(cur); cur = ""; }
            } else {
                var sv = stripAccents(t.slice(-1)).toLowerCase();
                var sv1 = stripAccents(t1.charAt(0)).toLowerCase();

                if (t.length > 1 && isV(t.charAt(0))) { syls.push(cur); cur = ""; continue; }

                var pair2 = sv + sv1;
                var t1HasAccent = /[áàâãéèêíîóòôõúùû]/i.test(t1.charAt(0) || "");
                var isDit = !t1HasAccent && (has(DIT_CRESC, pair2) || has(DIT_DECR, pair2));

                var isWordFinal = (k + 1 >= toks.length - 1);
                var prevIsCluster = prevConsonLen > 1;
                var wordHasExplicitTonic = /[áàâãéèêíîóòôõúùû]/i.test(w);
                var curTokAccented = /[áàâãéèêíîóòôõúùû]/i.test(t);
                var allowDit = isDit && t1.length === 1 &&
                    (!isWordFinal || prevIsCluster || (prevConsonLen >= 1 && wordHasExplicitTonic && !curTokAccented));

                if (allowDit) {
                    cur += t1; k++;
                    var after = toks[k + 1] || "";
                    var afterV = isV(after.charAt(0)) || after.indexOf("ã") === 0;
                    if (!afterV) { syls.push(cur); cur = ""; }
                } else {
                    syls.push(cur); cur = "";
                }
            }
        }

        if (cur) {
            if (syls.length) syls[syls.length - 1] += cur;
            else syls.push(cur);
        }
        return syls.length ? syls : [w];
    }

    /* ── Tonicidade ──────────────────────────────────────────────────────────── */
    function classifyTonicity(word) {
        var wOrig = String(word || "").toLowerCase().replace(/[^a-záàâãéèêíìîóòôõúùûçñ]/gi, "");
        var syls = syllabify(wOrig);
        if (syls.length <= 1) return "monossílabo";

        var acIdx = -1;
        for (var i = 0; i < syls.length; i++) {
            if (/[âêôáéíóúàãõ]/i.test(syls[i])) { acIdx = i; break; }
        }
        if (acIdx >= 0) {
            var fromEnd = syls.length - 1 - acIdx;
            if (fromEnd === 0) return "oxítona";
            if (fromEnd === 1) return "paroxítona";
            return "proparoxítona";
        }

        var wn = normalizeWord(wOrig).replace(/s$/, "");
        if (/^.+(r|l|z|[iu])$/.test(wn)) return "oxítona";
        if (/^.+(im|um|om|em|ins|uns|ons|ens)$/.test(wn)) return "oxítona";
        if (/^.+(ão|ãe|õe|ãos|ões|ães)$/.test(wOrig)) return "oxítona";
        if (/^.+(ei|ai|oi|ui|eu|au|ou|iu)$/.test(wn)) return "oxítona";
        return "paroxítona";
    }

    /* ── Nome do verso ───────────────────────────────────────────────────────── */
    function versoNome(n) {
        var nomes = {
            1: "monossílabo", 2: "dissílabo", 3: "trissílabo", 4: "tetrassílabo",
            5: "redondilha menor", 6: "hexassílabo", 7: "redondilha maior",
            8: "octossílabo", 9: "eneassílabo", 10: "decassílabo",
            11: "hendecassílabo", 12: "dodecassílabo (alexandrino)"
        };
        return nomes[n] || (n + " sílabas");
    }

    /* ── Sinalefa ────────────────────────────────────────────────────────────── */
    function canElide(left, right) {
        var lw = normalizeWord(left.word);
        var rw = normalizeWord(right.word);
        var lorig = left.word.toLowerCase();
        if (!isVowel(lw.slice(-1)) || !isVowel(rw.charAt(0))) return false;
        if (left.syllables.length <= 1 && ACCENT_RE.test(lorig)) return false;
        return has(FUNC_ELIDE, lw);
    }

    /* ── Escansão de verso ───────────────────────────────────────────────────── */
    function scanVerse(verse) {
        var words = verse.trim().split(/\s+/);
        var filtered = [];
        for (var i = 0; i < words.length; i++) if (words[i]) filtered.push(words[i]);
        words = filtered;

        if (!words.length) {
            return { totalSyllables: 0, rawSyllables: 0, words: [], ellisions: [], finalWord: "", finalTonicity: "", name: "" };
        }

        var analyzed = [];
        for (var j = 0; j < words.length; j++) {
            analyzed.push({
                word: words[j],
                syllables: syllabify(normalizeWord(words[j])),
                tonicity: classifyTonicity(words[j])
            });
        }

        var ellisions = [];
        var raw = 0;
        for (var k = 0; k < analyzed.length; k++) raw += analyzed[k].syllables.length;

        for (var m = 0; m < analyzed.length - 1; m++) {
            if (canElide(analyzed[m], analyzed[m + 1])) {
                ellisions.push(analyzed[m].word + "⌃" + analyzed[m + 1].word);
                raw--;
            }
        }

        var fin = analyzed[analyzed.length - 1];
        var adj = fin.tonicity === "paroxítona" ? 1 : fin.tonicity === "proparoxítona" ? 2 : 0;
        var total = Math.max(1, raw - adj);

        return {
            totalSyllables: total, rawSyllables: raw, words: analyzed, ellisions: ellisions,
            finalWord: fin.word, finalTonicity: fin.tonicity, name: versoNome(total)
        };
    }

    /* ── Normalização fonética ───────────────────────────────────────────────── */
    function phoneticNormalize(v) {
        return stripAccents(v).toLowerCase()
            .replace(/ç/g, "s").replace(/x$/, "s").replace(/z$/, "s")
            .replace(/am$/g, "ao").replace(/ão$/g, "ao").replace(/ons$/g, "os")
            .replace(/ões$/g, "ois").replace(/ães$/g, "ais").replace(/ens$/g, "es")
            .replace(/em$/g, "em").replace(/lh/g, "li").replace(/nh/g, "ni")
            .replace(/ch/g, "x").replace(/qu/g, "k").replace(/gu([ei])/g, "g$1")
            .replace(/[^a-z]/g, "");
    }

    /* ── Som de rima desde a vogal tônica ───────────────────────────────────── */
    function getRhymeSound(word) {
        var w = normalizeWord(word);
        var syls = syllabify(w);
        var ton = classifyTonicity(w);
        var idx = ton === "proparoxítona" ? Math.max(0, syls.length - 3)
            : ton === "paroxítona" ? Math.max(0, syls.length - 2)
            : syls.length - 1;
        var raw = phoneticNormalize(syls.slice(idx).join(""));
        var vi = raw.search(/[aeiou]/);
        if (vi >= 0 && /^[iu]/.test(raw.slice(vi)) && /[aeiou]/.test(raw.charAt(vi + 1) || "")) vi++;
        return vi >= 0 ? raw.slice(vi) : raw;
    }

    /* ── Correspondência de rima ────────────────────────────────────────────── */
    function soundsMatch(a, b) {
        if (!a || !b || a.length < 1 || b.length < 1) return false;
        if (a === b) return true;
        var norm = makeNorm();
        return norm(a) === norm(b);
    }
    function makeNorm() {
        return function (s) { return s.replace(/ao|am/g, "ao").replace(/em|en/g, "em"); };
    }

    function soundsMatchToante(a, b) {
        var vowelsA = a.replace(/[^aeiou]/g, "");
        var vowelsB = b.replace(/[^aeiou]/g, "");
        return vowelsA.length > 0 && vowelsA === vowelsB;
    }

    /* ── Classificação de rima (por heurística de sufixo, sem dicionário) ───── */
    function getGrammaticalClass(word) {
        var w = normalizeWord(word);
        if (/mente$/.test(w)) return "advérbio";
        if (/(ar|er|ir)$/.test(w) && w.length > 3) return "verbo";
        if (/(ção|são|dade|eza|mento|agem)$/.test(w)) return "substantivo";
        if (/(ado|ada|oso|osa|ivo|iva|vel|ável|ível)$/.test(w)) return "adjetivo";
        return "substantivo";
    }

    function classifyRhyme(wA, wB, clA, clB) {
        var precious = classifyTonicity(wA) === "proparoxítona" ||
            classifyTonicity(wB) === "proparoxítona" ||
            /íssimo|ático|ética|ância|ência|ável|ível|ização/.test(stripAccents(wA + " " + wB).toLowerCase());
        if (precious) return "preciosa";
        return clA === clB ? "pobre" : "rica";
    }

    /* Última palavra da linha. `[\\wÀ-\\ơ'-]+` substitui \p{L} (letras acentuadas). */
    function getLastWord(line) {
        var m = line.trim().match(/[\wÀ-ơ'-]+$/);
        return m ? m[0] : "";
    }

    function analyzeRhyme(lineA, lineB) {
        var wA = getLastWord(lineA), wB = getLastWord(lineB);
        if (!wA || !wB) return null;
        var sA = getRhymeSound(wA), sB = getRhymeSound(wB);
        var rhymes = soundsMatch(sA, sB);
        if (!rhymes) {
            var toante = soundsMatchToante(sA, sB);
            return {
                rhymes: toante, classification: toante ? "toante" : "nenhuma",
                wordA: wA, wordB: wB, soundA: sA, soundB: sB,
                classA: toante ? getGrammaticalClass(wA) : undefined,
                classB: toante ? getGrammaticalClass(wB) : undefined
            };
        }
        var clA = getGrammaticalClass(wA), clB = getGrammaticalClass(wB);
        return {
            rhymes: rhymes, classification: classifyRhyme(wA, wB, clA, clB),
            wordA: wA, wordB: wB, soundA: sA, soundB: sB, classA: clA, classB: clB
        };
    }

    function computeRhymeScheme(verses) {
        var sounds = [];
        for (var v = 0; v < verses.length; v++) {
            var w = getLastWord(verses[v]);
            sounds.push(w ? getRhymeSound(w) : "");
        }
        var map = [];
        var code = 65;
        var out = [];
        for (var i = 0; i < sounds.length; i++) {
            var s = sounds[i];
            if (!s) { out.push("x"); continue; }
            var exactMatch = null;
            for (var a = 0; a < map.length; a++) if (soundsMatch(map[a].sound, s)) { exactMatch = map[a]; break; }
            if (exactMatch) { out.push(exactMatch.letter); continue; }
            var toanteMatch = null;
            for (var b = 0; b < map.length; b++) if (soundsMatchToante(map[b].sound, s)) { toanteMatch = map[b]; break; }
            if (toanteMatch) { out.push(toanteMatch.letter.toLowerCase()); continue; }
            var letter = String.fromCharCode(code++);
            map.push({ sound: s, letter: letter });
            out.push(letter);
        }
        return out.join(" ");
    }

    /* ── Nomeação de esquemas canônicos ─────────────────────────────────────── */
    var SCHEME_NAMES = {
        "A A": "dístico rimado", "A B": "dístico solto",
        "A A A": "terceto monorrimo", "A B A": "terceto", "A B B": "terceto",
        "A A B": "terceto", "A B C": "terceto solto",
        "A B A B": "quarteto alternado", "A A B B": "quarteto emparelhado",
        "A B B A": "quarteto abrazado (redondilha)", "A A A A": "quarteto monorrimo",
        "A B C B": "quarteto popular (balada)", "A B A C": "quarteto", "A B C A": "quarteto",
        "A B C D": "quarteto em verso branco",
        "A A B A B": "quintilha", "A B A A B": "quintilha", "A A B B A": "quintilha",
        "A B A B A": "quintilha alternada", "A B B A B": "quintilha",
        "A B A B A B": "sextilha alternada", "A A B C C B": "sextilha abrazada",
        "A A B A A B": "sextilha", "A B C A B C": "sextilha", "A A B B C C": "sextilha emparelhada",
        "A B A B C C B": "sétima", "A A B A A A B": "sétima",
        "A B A B A B C C": "oitava rima (Camões)", "A B A B C D C D": "oitava alternada",
        "A B C A B C D D": "oitava",
        "A B B A A C C D D C": "décima espinela", "A B A B C C D E D E": "décima",
        "A B B A A B B A C D C D C D": "soneto (CDC DCD)",
        "A B B A A B B A C D E C D E": "soneto (CDE CDE)"
    };

    function nameScheme(schemeStr) {
        if (!schemeStr) return "";
        var normalized = schemeStr.toUpperCase();
        if (has(SCHEME_NAMES, normalized)) return SCHEME_NAMES[normalized];
        var letters = normalized.split(" ");
        var filt = [];
        for (var i = 0; i < letters.length; i++) if (/^[A-Z]$/.test(letters[i])) filt.push(letters[i]);
        var remap = {};
        var code = 65;
        var reindexed = [];
        for (var j = 0; j < filt.length; j++) {
            var l = filt[j];
            if (!remap[l]) remap[l] = String.fromCharCode(code++);
            reindexed.push(remap[l]);
        }
        var key = reindexed.join(" ");
        return has(SCHEME_NAMES, key) ? SCHEME_NAMES[key] : "";
    }

    /* ── Detectar prosa ─────────────────────────────────────────────────────── */
    function detectarProsa(text) {
        if (!text || !text.trim()) return true;
        var lines = text.split("\n");
        var clean = [];
        for (var i = 0; i < lines.length; i++) { var t = lines[i].trim(); if (t) clean.push(t); }
        lines = clean;
        if (lines.length < 2) return true;
        var longas = 0;
        for (var k = 0; k < lines.length; k++) if (lines[k].length > 100) longas++;
        if (longas / lines.length > 0.5) return true;
        var ponto = 0;
        for (var m = 0; m < lines.length; m++) if (/[.!?]$/.test(lines[m])) ponto++;
        if (ponto / lines.length > 0.7 && lines.length > 3) return true;
        return false;
    }

    /* ── Palavras estruurais a ignorar na rima interna ──────────────────────── */
    var STOP_RIMA = {
        "o": 1, "a": 1, "os": 1, "as": 1, "um": 1, "uma": 1, "uns": 1, "umas": 1,
        "e": 1, "ou": 1, "mas": 1, "nem": 1, "que": 1, "se": 1, "pois": 1, "logo": 1, "porém": 1,
        "de": 1, "do": 1, "da": 1, "dos": 1, "das": 1, "em": 1, "no": 1, "na": 1, "nos": 1, "nas": 1,
        "para": 1, "por": 1, "pelo": 1, "pela": 1, "pelos": 1, "pelas": 1,
        "com": 1, "sem": 1, "sob": 1, "sobre": 1, "ao": 1, "à": 1, "aos": 1, "às": 1,
        "eu": 1, "tu": 1, "ele": 1, "ela": 1, "nós": 1, "vós": 1, "eles": 1, "elas": 1, "você": 1, "vocês": 1,
        "me": 1, "te": 1, "lhe": 1, "les": 1, "nos": 1, "vos": 1,
        "não": 1, "sim": 1, "já": 1, "mais": 1, "bem": 1, "mal": 1, "só": 1,
        "quem": 1, "qual": 1, "quais": 1, "como": 1, "quando": 1, "onde": 1,
        "este": 1, "esta": 1, "esse": 1, "essa": 1, "aquele": 1, "aquela": 1, "isto": 1, "isso": 1, "aquilo": 1
    };

    function analisarRimaInterna(text) {
        var rawWords = text.match(/[\wÀ-ơ'-]+/g) || [];
        var palavras = [];
        for (var i = 0; i < rawWords.length; i++) {
            var w = rawWords[i];
            var nw = normalizeWord(w);
            if (w.length > 2 && !has(STOP_RIMA, nw)) palavras.push(w);
        }
        var grupos = {};
        var ordem = [];
        for (var j = 0; j < palavras.length; j++) {
            var som = getRhymeSound(palavras[j]);
            if (!som || som.length < 1) continue;
            var encontrado = false;
            for (var k = 0; k < ordem.length; k++) {
                var chave = ordem[k];
                if (soundsMatch(som, chave)) { grupos[chave].push(palavras[j]); encontrado = true; break; }
                if (soundsMatchToante(som, chave)) { grupos[chave].push(palavras[j]); encontrado = true; break; }
                var curta = som.length === 1 && /[aeiou]/.test(som);
                var chaveCurta = chave.length === 1 && /[aeiou]/.test(chave);
                if (curta && chave.indexOf(som) === chave.length - som.length) { grupos[chave].push(palavras[j]); encontrado = true; break; }
                if (chaveCurta && som.indexOf(chave) === som.length - chave.length) { grupos[chave].push(palavras[j]); encontrado = true; break; }
            }
            if (!encontrado) { grupos[som] = [palavras[j]]; ordem.push(som); }
        }
        var result = [];
        for (var g = 0; g < ordem.length; g++) {
            var ch = ordem[g];
            var unicos = [];
            var seen = {};
            for (var u = 0; u < grupos[ch].length; u++) {
                var nu = normalizeWord(grupos[ch][u]);
                if (!seen[nu]) { seen[nu] = 1; unicos.push(grupos[ch][u]); }
            }
            if (unicos.length >= 2) result.push({ som: ch, palavras: unicos });
        }
        result.sort(function (a, b) { return b.palavras.length - a.palavras.length; });
        return result;
    }

    /* ── Análise completa ───────────────────────────────────────────────────── */
    function analyze(text) {
        var isProse = detectarProsa(text);
        var verses = text.split("\n");
        var clean = [];
        for (var i = 0; i < verses.length; i++) { var t = verses[i].trim(); if (t) clean.push(t); }
        verses = clean;

        if (isProse || verses.length < 2) {
            var rimasInternas = analisarRimaInterna(text);
            var temRima = rimasInternas.length > 0;
            var proseNote = verses.length < 2
                ? (temRima ? "Padrão sonoro detectado: " + joinGroups(rimasInternas) : "Escreva ao menos dois versos em linhas separadas para ver a análise.")
                : (temRima ? "Padrão sonoro no texto: " + joinGroups(rimasInternas) : "O texto parece ser prosa. Cole versos separados por linha para ver métricas e rimas.");
            return {
                note: ACADEMIC_NOTE, isProse: true, rimasInternas: rimasInternas,
                verses: [], scans: [], metrics: [], uniqueMetrics: [], isIsometric: false,
                rhymes: [], rhymePairs: [], rhymeScheme: "", stanzas: [],
                totalVerses: 0, dominantMetric: null, dominantName: "", proseNote: proseNote
            };
        }

        var scans = [];
        for (var v = 0; v < verses.length; v++) scans.push(scanVerse(verses[v]));
        var metrics = [];
        for (var m = 0; m < scans.length; m++) metrics.push(scans[m].totalSyllables);
        var uniqueMetrics = uniq(metrics.slice().sort(function (a, b) { return a - b; }));
        var isIsometric = metrics.length > 1 && metrics.every(function (m2) { return m2 === metrics[0]; });

        var rhymes = [];
        for (var p1 = 0; p1 < verses.length - 1; p1++) {
            for (var p2 = p1 + 1; p2 < verses.length; p2++) {
                var r = analyzeRhyme(verses[p1], verses[p2]);
                if (r && r.rhymes) {
                    rhymes.push({
                        wordA: r.wordA, wordB: r.wordB, classification: r.classification,
                        soundA: r.soundA, soundB: r.soundB, classA: r.classA, classB: r.classB,
                        from: p1, to: p2
                    });
                }
            }
        }

        /* Estrofes: blocos separados por linha em branco. */
        var stanzaBlocks = text.split(/\n{2,}/);
        var stanzas = [];
        if (stanzaBlocks.length > 1) {
            var offset = 0;
            for (var sb = 0; sb < stanzaBlocks.length; sb++) {
                var b = stanzaBlocks[sb].trim();
                if (!b) continue;
                var sv = b.split("\n");
                var svClean = [];
                for (var svc = 0; svc < sv.length; svc++) { var s2 = sv[svc].trim(); if (s2) svClean.push(s2); }
                var sr = analyzeStanza(svClean, offset);
                stanzas.push(sr);
                offset += svClean.length;
            }
        }

        var scheme = computeRhymeScheme(verses);
        var dominantMetric = dominantMode(metrics);
        var dominantName = dominantMetric ? versoNome(dominantMetric) : "";

        return {
            note: ACADEMIC_NOTE, isProse: false, verses: verses, scans: scans, metrics: metrics,
            uniqueMetrics: uniqueMetrics, isIsometric: isIsometric, rhymes: rhymes,
            rhymeScheme: scheme, stanzas: stanzas, totalVerses: verses.length,
            dominantMetric: dominantMetric, dominantName: dominantName
        };
    }

    /* Moda dos versos (metro dominante = mais frequente), sem mutar o array. */
    function dominantMode(metrics) {
        if (!metrics.length) return null;
        var best = metrics[0], bestCount = 0;
        for (var i = 0; i < metrics.length; i++) {
            var c = 0, v = metrics[i];
            for (var j = 0; j < metrics.length; j++) if (metrics[j] === v) c++;
            if (c > bestCount) { bestCount = c; best = v; }
        }
        return best;
    }

    function analyzeStanza(stanzaVerses, offset) {
        var rhymes = [];
        for (var i = 0; i < stanzaVerses.length - 1; i++) {
            for (var j = i + 1; j < stanzaVerses.length; j++) {
                var r = analyzeRhyme(stanzaVerses[i], stanzaVerses[j]);
                if (r && r.rhymes) rhymes.push({ from: offset + i, to: offset + j, wordA: r.wordA, wordB: r.wordB, classification: r.classification });
            }
        }
        return { verses: stanzaVerses, rhymes: rhymes, scheme: computeRhymeScheme(stanzaVerses) };
    }

    function joinGroups(groups) {
        var parts = [];
        for (var i = 0; i < groups.length; i++) parts.push(groups[i].palavras.join(" · "));
        return parts.join(" | ");
    }
    function uniq(arr) {
        var out = [], seen = {};
        for (var i = 0; i < arr.length; i++) { if (!seen[arr[i]]) { seen[arr[i]] = 1; out.push(arr[i]); } }
        return out;
    }

    /* ── Engine no contrato do Encore ───────────────────────────────────────── */
    function RimaLabEngine() {
        this.id = "RIMA-METRICA";
        this.domain = "rima-metrica";
        this.version = "1.0.0";
    }

    RimaLabEngine.prototype.check = function (snapshot, done) {
        var findings = [];
        var text = String(snapshot.text || "");
        var result = analyze(text);
        var Finding = global.Encore.contracts.Finding;

        if (result.isProse) {
            if (result.rimasInternas && result.rimasInternas.length) {
                for (var i = 0; i < result.rimasInternas.length; i++) {
                    var g = result.rimasInternas[i];
                    findings.push(new Finding(this.id, [0, text.length], "Padrão sonoro: " + g.palavras.join(" · ") + " [" + g.som + "].", 0, 0.7));
                }
            }
            findings.push(new Finding(this.id, [0, text.length], result.proseNote, 0, 0.5));
            done(findings);
            return;
        }

        for (var v = 0; v < result.scans.length; v++) {
            var sc = result.scans[v];
            var name = sc.name;
            findings.push(new Finding(
                this.id, [0, text.length], "Verso " + (v + 1) + ": " + result.verses[v] +
                    " — " + sc.totalSyllables + " sílabas (" + name + ", " + sc.finalTonicity + ").",
                0, 0.8
            ));
        }
        if (result.rhymeScheme) {
            var sn = nameScheme(result.rhymeScheme);
            findings.push(new Finding(this.id, [0, text.length], "Esquema de rimas: " + result.rhymeScheme +
                (sn ? " (" + sn + ")" : "") + ".", 0, 0.8));
        }
        if (result.dominantName) {
            findings.push(new Finding(this.id, [0, text.length], "Metro dominante: " + result.dominantName +
                (result.isIsometric ? " (isométrico)." : " (" + result.dominantMetric + " sílabas)."), 0, 0.8));
        }
        done(findings);
    };

    /* Mantém o núcleo analítico exposto para testes. */
    RimaLabEngine.prototype.analyze = analyze;
    RimaLabEngine.prototype.syllabify = syllabify;
    RimaLabEngine.prototype.classifyTonicity = classifyTonicity;
    RimaLabEngine.prototype.getRhymeSound = getRhymeSound;
    RimaLabEngine.prototype.nameScheme = nameScheme;
    RimaLabEngine.prototype.scanVerse = scanVerse;
    RimaLabEngine.prototype.analyzeRhyme = analyzeRhyme;
    RimaLabEngine.prototype.computeRhymeScheme = computeRhymeScheme;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = RimaLabEngine;
    } else {
        global.Encore = global.Encore || {};
        global.Encore.core = global.Encore.core || {};
        global.Encore.core.engines = global.Encore.core.engines || {};
        global.Encore.core.engines.RimaLabEngine = RimaLabEngine;
    }
})(typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this));
