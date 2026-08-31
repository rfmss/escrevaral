(function (global) {
    "use strict";

    /* Escrevaral-Encore — Engine de Morfologia Verbal (ES5, baixa RAM).
     * Portado do padrão canônico do antigravity (js/core/linguistic-core/services/morphology-lite.js),
     * aprovado até M6 (legacy ready). Reuso de comportamento, não cópia bruta.
     * Estratégia de baixa RAM: TRIE DE SUFIXOS em vez de tabela de todas as formas.
     */

    function MorphologyEngine(data, exceptionsData) {
        this.suffixTrie = {};
        this.exceptions = {};
        this.id = "VERB-MORPH";
        this.domain = "morfologia-verbal";
        this.version = "1.0.0";

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

    /* Contrato: check(snapshot, done). Texto = uma palavra (ou primeira palavra se houver espaço). */
    MorphologyEngine.prototype.check = function (snapshot, done) {
        var findings = [];
        var word = String(snapshot.text || "").trim().split(/\s+/)[0];
        if (!word) { done(findings); return; }

        var meta = this.analyze(word);
        if (meta) {
            findings.push(new (global.Encore.contracts.Finding)(
                this.id,
                [0, word.length],
                "Verbo: lema '" + meta.lema + "' — " + meta.modo + " " + meta.tempo +
                    ", " + meta.pessoa + "ª " + meta.numero + ".",
                0,
                0.9
            ));
        }
        done(findings);
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
