(function (global) {
    "use strict";

    /* Escrevaral-Encore — Engine Decolonial / Vocabulário (ES5, baixa RAM).
     * Portada de escrevaral (decolonial-engine.js). Reuso de comportamento, não cópia.
     * Detecta termos com carga colonial/racista/classista/etária/sexista/xenófoba e
     * sugere alternativas, com nota contextual.
     *
     * Norma ES5/piso: sem Set, arrow, spread, optional chaining, fetch, async,
     * nem regex \p{L}/normalize. Normalização por mapa de acentos manual e fronteira
     * de palavra por classes de caractere explícitas (compatível iOS 9/KitKat).
     *
     * Dados injetados via Encore.data.decolonialData (off-line, sem fetch).
     */

    /* Mapa de desdobramento de acentos → ASCII (equivalente ES5 ao normalize("NFD")).
     * Fonte normaliza texto e termo e depois casa só letras/dígitos minúsculos. */
    var ACCENTS = {
        "á": "a", "à": "a", "â": "a", "ã": "a", "ä": "a",
        "é": "e", "è": "e", "ê": "e", "ẽ": "e", "ë": "e",
        "í": "i", "ì": "i", "î": "i", "ĩ": "i", "ï": "i",
        "ó": "o", "ò": "o", "ô": "o", "õ": "o", "ö": "o",
        "ú": "u", "ù": "u", "û": "u", "ũ": "u", "ü": "u",
        "ç": "c", "ñ": "n", "ÿ": "y", "Á": "a", "À": "a", "Â": "a", "Ã": "a",
        "É": "e", "Ê": "e", "Í": "i", "Ó": "o", "Ô": "o", "Õ": "o", "Ú": "u", "Ç": "c"
    };

    function deaccent(str) {
        var out = "";
        for (var i = 0; i < str.length; i++) {
            var ch = str.charAt(i);
            var rep = ACCENTS[ch];
            out += rep === undefined ? ch : rep;
        }
        return out;
    }

    /* Normaliza: sem acento, minúsculas, sem espaços nas pontas. */
    function normalize(value) {
        return deaccent(String(value || "")).toLowerCase().trim();
    }

    function escapeRegExp(value) {
        return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    /* Fronteira de palavra: letra minúscula (a-z) ou dígito — o texto já foi
     * normalizado (acentos removidos). Correponde ao \p{L}\p{N} do fonte. */
    function createTermPattern(term) {
        var normTerm = normalize(term);
        return new RegExp("(^|[^a-z0-9_])(" + escapeRegExp(normTerm) + ")(?=$|[^a-z0-9_])", "g");
    }

    function countTerm(text, term) {
        var pattern = createTermPattern(term);
        var count = 0;
        while (pattern.exec(text)) count++;
        return count;
    }

    /* Engine no contrato do Encore: check(snapshot, done) -> findings[]. */
    function DecolonialEngine(data) {
        this.id = "DECOLONIAL";
        this.domain = "decolonial";
        this.version = "1.0.0";
        this.categories = (data && data.categories) || {};
        this.entries = (data && data.entries) || [];
    }

    DecolonialEngine.prototype.categoryLabel = function (catId) {
        var cat = this.categories[catId];
        return (cat && cat.label) || catId;
    };

    DecolonialEngine.prototype.augment = function (entry) {
        var alt = entry.alternatives || [];
        var ctx = entry.context || "";
        return {
            avoid: entry.avoid,
            alternatives: alt,
            category: entry.category,
            categoryLabel: this.categoryLabel(entry.category),
            reason: entry.reason || "",
            context: ctx,
            contextual: !!entry.contextual
        };
    };

    DecolonialEngine.prototype.check = function (snapshot, done) {
        var self = this;
        var findings = [];
        var source = String(snapshot.text || "");
        if (!source.trim()) { done(findings); return; }

        var normText = normalize(source);
        var entries = this.entries;
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            var count = countTerm(normText, entry.avoid);
            if (count > 0) {
                var aug = this.augment(entry);
                var matched = entry.avoid.toLowerCase();
                var span = locateSpan(source, normText, matched);

                var contextualNote = aug.contextual ? " (contextual — pode ser mantido em certos usos)" : "";
                var message = "Termo com carga decolonial: '" + aug.avoid + "' [" + aug.categoryLabel +
                    contextualNote + ". Sugestões: " + (aug.alternatives.join(", ") || "—") + "]. " +
                    (aug.reason ? "Motivo: " + aug.reason + ". " : "") +
                    (aug.context ? "Uso: " + aug.context : "");

                findings.push(new (global.Encore.contracts.Finding)(this.id, span, message, 1, 0.9));
            }
        }
        done(findings);
    };

    /* Localiza o span [início,fim] da 1ª ocorrência do termo no texto original,
     * usando o texto normalizado como referência de posição (fonte não expõe span;
     * retorna [0,0] se não localizar). */
    function locateSpan(sourceText, normText, matchedNorm) {
        var idx = normText.indexOf(matchedNorm);
        if (idx < 0) return [0, 0];
        return [idx, idx + matchedNorm.length];
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = DecolonialEngine;
    } else {
        global.Encore = global.Encore || {};
        global.Encore.core = global.Encore.core || {};
        global.Encore.core.engines = global.Encore.core.engines || {};
        global.Encore.core.engines.DecolonialEngine = DecolonialEngine;
    }
})(typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this));
