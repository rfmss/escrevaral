(function (global) {
    "use strict";

    /* Escrevaral-Encore — Tokenizador de texto (ES5).
     * Portado do comportamento canônico do antigravity
     * (js/core/linguistic-core/services/tokenizer.js).
     * Divide texto em palavras (com acentos) preservando spiean para o editor.
     */

    /* Preserva hífen/apóstrofo quando unem letras (clíticos: fazê-lo, dar-te-ei). */
    var Regex = /[a-zA-ZáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ]+(?:[-'][a-zA-ZáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ]+)*/g;

    function tokenize(text) {
        if (!text) return [];
        var tokens = [];
        var match;
        while ((match = Regex.exec(text)) !== null) {
            tokens.push({
                value: match[0],
                span: [match.index, match.index + match[0].length]
            });
        }
        return tokens;
    }

    var Encore = global.Encore = global.Encore || {};
    Encore.core = Encore.core || {};
    Encore.core.services = Encore.core.services || {};
    Encore.core.services.Tokenizer = { tokenize: tokenize };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = { tokenize: tokenize };
    }
})(typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this));
