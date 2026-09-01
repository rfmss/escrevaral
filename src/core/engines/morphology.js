(function (global) {
    "use strict";

    /* Escrevaral-Encore — Engine de Morfologia Verbal (ES5, baixa RAM).
     * Portado do padrão canônico do antigravity (js/core/linguistic-core/services/morphology-lite.js),
     * aprovado até M6 (legacy ready). Reuso de comportamento, não cópia bruta.
     * Estratégia de baixa RAM: TRIE DE SUFIXOS em vez de tabela de todas as formas.
     */

    function MorphologyEngine(data, exceptionsData, tokenizer) {
        this.suffixTrie = {};
        this.exceptions = {};
        this.tokenizer = tokenizer || null;
        this.id = "VERB-MORPH";
        this.domain = "morfologia-verbal";
        this.version = "1.1.0";

        if (data) {
            for (var i = 0; i < data.length; i++) {
                this.addVerbalForm(data[i]);
            }
        }
        if (exceptionsData) {
            for (var j = 0; j < exceptionsData.length; j++) {
                this.exceptions[exceptionsData[j].toLowerCase()] = true;
            }
        }
    }

    MorphologyEngine.prototype.addVerbalForm = function (entry) {
        var reversed = entry.forma.split("").reverse().join("");
        var node = this.suffixTrie;
        for (var i = 0; i < reversed.length; i++) {
            var ch = reversed[i];
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

    /* Remove pronomes oblíquos enclíticos e mesoclíticos: amá-lo, dar-te-ei. */
    MorphologyEngine.prototype.stripClitics = function (word) {
        var direct = word.match(/^(.*?)-(me|te|se|lhe|lhes|nos|vos|o|a|os|as|lo|la|los|las|no|na|nas)$/i);
        if (direct) return direct[1];
        var meso = word.match(/^(.*?)-(me|te|se|lhe|lhes|nos|vos)-(.*?)$/i);
        if (meso) return meso[1] + meso[3];
        return word;
    };

    MorphologyEngine.prototype._searchTrie = function (word) {
        var reversed = word.split("").reverse().join("");
        var node = this.suffixTrie;
        for (var i = 0; i < reversed.length; i++) {
            var ch = reversed[i];
            if (!node[ch]) return null;
            node = node[ch];
        }
        return node._meta || null;
    };

    /* Contrato: check(snapshot, done). Com tokenizer, percorre o texto inteiro;
     * sem tokenizer, analisa só a primeira palavra (retrocompatível). */
    MorphologyEngine.prototype.check = function (snapshot, done) {
        var self = this;
        var findings = [];
        var text = String(snapshot.text || "").trim();
        if (!text) { done(findings); return; }

        if (!this.tokenizer) {
            var only = text.split(/\s+/)[0];
            var meta0 = this.analyze(only);
            if (meta0) {
                findings.push(this._finding([0, only.length], meta0));
            }
            done(findings);
            return;
        }

        var tokens = this.tokenizer.tokenize(text);
        for (var i = 0; i < tokens.length; i++) {
            var meta = this.analyze(tokens[i].value);
            if (meta) {
                findings.push(this._finding(tokens[i].span, meta));
            }
        }
        done(findings);
    };

    MorphologyEngine.prototype._finding = function (span, meta) {
        return new (global.Encore.contracts.Finding)(
            this.id,
            span,
            "Verbo: lema '" + meta.lema + "' — " + meta.modo + " " + meta.tempo +
                ", " + meta.pessoa + "ª " + meta.numero + ".",
            0,
            0.9
        );
    };

    MorphologyEngine.prototype.analyze = function (word) {
        var lower = word.toLowerCase();
        if (this.exceptions[lower]) return null;

        var result = this._searchTrie(lower);
        if (result) return result;

        var stripped = this.stripClitics(lower);
        if (stripped !== lower) {
            if (this.exceptions[stripped]) return null;
            result = this._searchTrie(stripped);
            if (result) return result;

            /* Terminação átona: amá -> amar; vendê -> vender; sumí -> sumir. */
            var last = stripped.slice(-1);
            var rest = stripped.slice(0, -1);
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
})(typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this));
