(function (global) {
    "use strict";

    /* Escrevaral-Encore — Engine de Morfologia Verbal (ES5, baixa RAM).
     * Base ES5: Antigravity. Fatia contextual: infinitivo pessoal do Mass Notes.
     * Estratégia: trie curta para formas curadas + regras produtivas somente quando
     * o lema pertence ao léxico carregado pela cápsula.
     */

    var PERSONAL_ENDINGS = [
        { ending: "armos", conjugation: "ar", person: 1, number: "plural" },
        { ending: "ermos", conjugation: "er", person: 1, number: "plural" },
        { ending: "irmos", conjugation: "ir", person: 1, number: "plural" },
        { ending: "ardes", conjugation: "ar", person: 2, number: "plural" },
        { ending: "erdes", conjugation: "er", person: 2, number: "plural" },
        { ending: "irdes", conjugation: "ir", person: 2, number: "plural" },
        { ending: "ares", conjugation: "ar", person: 2, number: "singular" },
        { ending: "eres", conjugation: "er", person: 2, number: "singular" },
        { ending: "ires", conjugation: "ir", person: 2, number: "singular" },
        { ending: "arem", conjugation: "ar", person: 3, number: "plural" },
        { ending: "erem", conjugation: "er", person: 3, number: "plural" },
        { ending: "irem", conjugation: "ir", person: 3, number: "plural" }
    ];

    var SUBJECTS = {
        "eu": { person: 1, number: "singular" },
        "tu": { person: 2, number: "singular" },
        "ele": { person: 3, number: "singular" },
        "ela": { person: 3, number: "singular" },
        "você": { person: 3, number: "singular" },
        "nós": { person: 1, number: "plural" },
        "vós": { person: 2, number: "plural" },
        "eles": { person: 3, number: "plural" },
        "elas": { person: 3, number: "plural" },
        "vocês": { person: 3, number: "plural" }
    };

    var PREPOSITIONS = {
        "a": true, "de": true, "em": true, "para": true, "por": true,
        "sem": true, "até": true, "após": true, "antes": true
    };

    var SUBJUNCTIVE_TRIGGERS = {
        "quando": true, "se": true, "caso": true, "embora": true,
        "quem": true, "onde": true, "como": true
    };

    function MorphologyEngine(data, exceptionsData, tokenizer, lemmaData) {
        this.suffixTrie = {};
        this.exceptions = {};
        this.lemmas = {};
        this.tokenizer = tokenizer || null;
        this.id = "VERB-MORPH";
        this.domain = "morfologia-verbal";
        this.version = "1.2.0";

        var i;
        if (data) {
            for (i = 0; i < data.length; i += 1) {
                this.addVerbalForm(data[i]);
                if (data[i].lema) this.lemmas[String(data[i].lema).toLowerCase()] = true;
            }
        }
        if (exceptionsData) {
            for (i = 0; i < exceptionsData.length; i += 1) {
                this.exceptions[String(exceptionsData[i]).toLowerCase()] = true;
            }
        }
        if (lemmaData) {
            for (i = 0; i < lemmaData.length; i += 1) {
                this.lemmas[String(lemmaData[i]).toLowerCase()] = true;
            }
        }
    }

    MorphologyEngine.prototype.addVerbalForm = function (entry) {
        var reversed = entry.forma.split("").reverse().join("");
        var node = this.suffixTrie;
        var i;
        var ch;
        for (i = 0; i < reversed.length; i += 1) {
            ch = reversed[i];
            if (!node[ch]) node[ch] = {};
            node = node[ch];
        }
        node._meta = {
            lema: entry.lema,
            classe: entry.classe,
            tempo: entry.tempo,
            modo: entry.modo,
            pessoa: entry.pessoa,
            numero: entry.numero
        };
    };

    MorphologyEngine.prototype.stripClitics = function (word) {
        var direct = word.match(/^(.*?)-(me|te|se|lhe|lhes|nos|vos|o|a|os|as|lo|la|los|las|no|na|nas)$/i);
        var meso;
        if (direct) return direct[1];
        meso = word.match(/^(.*?)-(me|te|se|lhe|lhes|nos|vos)-(.*?)$/i);
        if (meso) return meso[1] + meso[3];
        return word;
    };

    MorphologyEngine.prototype._searchTrie = function (word) {
        var reversed = word.split("").reverse().join("");
        var node = this.suffixTrie;
        var i;
        var ch;
        for (i = 0; i < reversed.length; i += 1) {
            ch = reversed[i];
            if (!node[ch]) return null;
            node = node[ch];
        }
        return node._meta || null;
    };

    MorphologyEngine.prototype.isKnownLemma = function (lemma) {
        return this.lemmas[String(lemma || "").toLowerCase()] === true;
    };

    MorphologyEngine.prototype._tokenBefore = function (tokens, index, distance) {
        var token = tokens[index - distance];
        return token ? String(token.value || "").toLowerCase() : "";
    };

    MorphologyEngine.prototype._hasTriggerBefore = function (tokens, index) {
        var distance;
        var value;
        for (distance = 1; distance <= 3; distance += 1) {
            value = this._tokenBefore(tokens, index, distance);
            if (SUBJUNCTIVE_TRIGGERS[value]) return true;
        }
        return false;
    };

    MorphologyEngine.prototype._personalContext = function (tokens, index, flexed) {
        var previous = this._tokenBefore(tokens, index, 1);
        var twoBefore = this._tokenBefore(tokens, index, 2);
        var threeBefore = this._tokenBefore(tokens, index, 3);
        var subject = SUBJECTS[previous] || null;

        if (this._hasTriggerBefore(tokens, index)) {
            return { futureSubjunctive: true, subject: subject };
        }

        if (subject) {
            return { personal: true, subject: subject };
        }

        if (flexed && previous === "melhor" && (twoBefore === "é" || twoBefore === "e")) {
            return {
                personal: true,
                subject: { person: flexed.person, number: flexed.number }
            };
        }

        if (flexed && (PREPOSITIONS[previous] || PREPOSITIONS[twoBefore] || PREPOSITIONS[threeBefore])) {
            return {
                personal: true,
                subject: { person: flexed.person, number: flexed.number }
            };
        }

        return { personal: false, subject: null };
    };

    MorphologyEngine.prototype._personalEnding = function (word) {
        var i;
        var rule;
        var stem;
        var lemma;
        for (i = 0; i < PERSONAL_ENDINGS.length; i += 1) {
            rule = PERSONAL_ENDINGS[i];
            if (word.slice(-rule.ending.length) !== rule.ending) continue;
            stem = word.slice(0, word.length - rule.ending.length);
            if (!stem) continue;
            lemma = stem + rule.conjugation;
            if (!this.isKnownLemma(lemma)) continue;
            return {
                lemma: lemma,
                person: rule.person,
                number: rule.number
            };
        }
        return null;
    };

    MorphologyEngine.prototype._personText = function (person, number) {
        return String(person) + "ª pessoa do " + number;
    };

    MorphologyEngine.prototype.analyzeInContext = function (word, tokens, index) {
        var lower = String(word || "").toLowerCase();
        var flexed;
        var context;
        var ending;
        var subject;

        if (this.exceptions[lower]) return null;

        flexed = this._personalEnding(lower);
        if (flexed) {
            context = this._personalContext(tokens, index, flexed);
            if (context.futureSubjunctive) {
                return {
                    lema: flexed.lemma,
                    classe: "verbo",
                    tempo: "futuro do subjuntivo",
                    modo: "subjuntivo",
                    pessoa: flexed.person,
                    numero: flexed.number,
                    label: "Futuro do subjuntivo — " +
                        this._personText(flexed.person, flexed.number)
                };
            }
            if (context.personal) {
                return {
                    lema: flexed.lemma,
                    classe: "verbo",
                    tempo: "infinitivo pessoal",
                    modo: "infinitivo",
                    pessoa: flexed.person,
                    numero: flexed.number,
                    label: "Infinitivo pessoal — " +
                        this._personText(flexed.person, flexed.number)
                };
            }
        }

        ending = lower.slice(-2);
        if ((ending === "ar" || ending === "er" || ending === "ir") &&
                this.isKnownLemma(lower)) {
            context = this._personalContext(tokens, index, null);
            subject = context.subject;
            if (context.personal && subject) {
                return {
                    lema: lower,
                    classe: "verbo",
                    tempo: "infinitivo pessoal",
                    modo: "infinitivo",
                    pessoa: subject.person,
                    numero: subject.number,
                    label: "Infinitivo pessoal — " +
                        this._personText(subject.person, subject.number)
                };
            }
            return {
                lema: lower,
                classe: "verbo",
                tempo: "infinitivo impessoal",
                modo: "infinitivo",
                pessoa: null,
                numero: null,
                label: "Infinitivo impessoal"
            };
        }

        return this.analyze(lower);
    };

    MorphologyEngine.prototype.check = function (snapshot, done) {
        var findings = [];
        var text = String(snapshot.text || "").trim();
        var only;
        var meta0;
        var tokens;
        var i;
        var meta;

        if (!text) { done(findings); return; }

        if (!this.tokenizer) {
            only = text.split(/\s+/)[0];
            meta0 = this.analyze(only);
            if (meta0) findings.push(this._finding([0, only.length], meta0));
            done(findings);
            return;
        }

        tokens = this.tokenizer.tokenize(text);
        for (i = 0; i < tokens.length; i += 1) {
            meta = this.analyzeInContext(tokens[i].value, tokens, i);
            if (meta) findings.push(this._finding(tokens[i].span, meta));
        }
        done(findings);
    };

    MorphologyEngine.prototype._finding = function (span, meta) {
        var message;
        if (meta.label) {
            message = "Verbo: lema '" + meta.lema + "' — " + meta.label + ".";
        } else if (meta.pessoa && meta.numero) {
            message = "Verbo: lema '" + meta.lema + "' — " + meta.modo + " " +
                meta.tempo + ", " + meta.pessoa + "ª " + meta.numero + ".";
        } else {
            message = "Verbo: lema '" + meta.lema + "' — " + meta.modo + " " +
                meta.tempo + ".";
        }
        return new (global.Encore.contracts.Finding)(
            this.id, span, message, 0, 0.9
        );
    };

    MorphologyEngine.prototype.analyze = function (word) {
        var lower = String(word || "").toLowerCase();
        var result;
        var stripped;
        var last;
        var rest;

        if (this.exceptions[lower]) return null;

        result = this._searchTrie(lower);
        if (result) return result;

        stripped = this.stripClitics(lower);
        if (stripped !== lower) {
            if (this.exceptions[stripped]) return null;
            result = this._searchTrie(stripped);
            if (result) return result;

            last = stripped.slice(-1);
            rest = stripped.slice(0, -1);
            if (last === "á") result = this._searchTrie(rest + "ar");
            else if (last === "ê") result = this._searchTrie(rest + "er");
            else if (last === "í") result = this._searchTrie(rest + "ir");
            else if (last === "ô") result = this._searchTrie(rest + "or");
            if (result) return result;
        }
        return null;
    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = MorphologyEngine;
    } else {
        global.Encore = global.Encore || {};
        global.Encore.core = global.Encore.core || {};
        global.Encore.core.engines = global.Encore.core.engines || {};
        global.Encore.core.engines.MorphologyEngine = MorphologyEngine;
    }
})(typeof global !== "undefined" ? global :
    (typeof window !== "undefined" ? window :
        (typeof self !== "undefined" ? self : this)));
