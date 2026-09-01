(function (global) {
    "use strict";

    /* Escrevaral-Encore — Engine de Orações Adjetivas (ES5, baixa RAM).
     * Portado de escrevaral (relative-clause-engine.js), aprovado por auditoria
     * (focal 22/22, bateria 1915/1915, P0=0/P1=0). Reuso de comportamento, não cópia.
     * Política: abstém-se por padrão — só classifica como explicativa/restritiva
     * quando há evidência textual forte; senão retorna leitura ambígua (preserva a
     * intenção da escritora).
     *
     * Norma ES5/piso: sem Set, sem arrow, sem spread, sem regex \p{L} nem normalize.
     * Normalização de acentos feita por mapa explícito (compatível com iOS 9/KitKat).
     */

    /* Conjuntos representados como objetos de flags (baixa RAM, padrão do repo). */
    var UNIQUE_REFERENTS = {
        "brasil": 1, "portugal": 1, "brasilia": 1, "lisboa": 1,
        "america do sul": 1, "america do norte": 1, "america central": 1,
        "terra": 1, "lua": 1, "sol": 1, "via lactea": 1,
        "lingua portuguesa": 1, "portugues brasileiro": 1,
        "machado de assis": 1, "clarice lispector": 1, "conceicao evaristo": 1,
        "guimaraes rosa": 1, "carlos drummond de andrade": 1
    };

    /* Relações taxonômicas estáveis e não controversas. Lista deliberadamente
     * pequena: conhecimento ausente produz abstenção, nunca palpite categórico. */
    var GENERAL_PROPERTIES = [
        { antecedent: /^(?:as )?baleias$/, predicate: /^(?:tem sangue quente|sao mamiferos|respiram por pulmoes)$/ },
        { antecedent: /^(?:os )?mamiferos$/, predicate: /^amamentam (?:os )?filhotes$/ },
        { antecedent: /^(?:as )?aves$/, predicate: /^(?:tem|possuem) penas$/ },
        { antecedent: /^(?:os )?triangulos$/, predicate: /^(?:tem|possuem) tres lados$/ }
    ];

    var DETERMINERS = {
        "o": 1, "a": 1, "os": 1, "as": 1, "um": 1, "uma": 1, "uns": 1, "umas": 1,
        "este": 1, "esta": 1, "estes": 1, "estas": 1, "esse": 1, "essa": 1, "esses": 1, "essas": 1,
        "aquele": 1, "aquela": 1, "aqueles": 1, "aquelas": 1, "meu": 1, "minha": 1, "meus": 1, "minhas": 1,
        "seu": 1, "sua": 1, "seus": 1, "suas": 1, "nosso": 1, "nossa": 1, "nossos": 1, "nossas": 1
    };
    var LIMITERS = { "apenas": 1, "somente": 1, "so": 1, "só": 1, "exclusivamente": 1 };
    var QUANTIFIERS = { "todos": 1, "todas": 1, "ambos": 1, "ambas": 1 };
    var NAME_CONNECTORS = { "da": 1, "das": 1, "de": 1, "do": 1, "dos": 1, "e": 1 };
    var COMPLEMENT_TRIGGERS = {
        "acha": 1, "acham": 1, "achava": 1, "acredita": 1, "acreditam": 1, "afirma": 1, "afirmam": 1, "afirmou": 1,
        "anuncia": 1, "anunciam": 1, "anunciou": 1, "conta": 1, "contam": 1, "contou": 1, "declara": 1, "declaram": 1,
        "declarou": 1, "demonstra": 1, "demonstram": 1, "demonstrou": 1, "diz": 1, "dizem": 1, "disse": 1, "disseram": 1,
        "espera": 1, "esperam": 1, "esperava": 1, "explica": 1, "explicam": 1, "explicou": 1, "garante": 1, "garantem": 1,
        "garantiu": 1, "imagina": 1, "imaginam": 1, "informa": 1, "informam": 1, "informou": 1, "lembra": 1, "lembram": 1,
        "nota": 1, "notam": 1, "percebe": 1, "percebem": 1, "percebeu": 1, "pensa": 1, "pensam": 1, "pensou": 1,
        "promete": 1, "prometem": 1, "prometeu": 1, "reconhece": 1, "reconhecem": 1, "responde": 1, "respondem": 1,
        "respondeu": 1, "revela": 1, "revelam": 1, "revelou": 1, "sabe": 1, "sabem": 1, "sabia": 1
    };

    /* Mapa de desdobramento de acentos → ASCII (equivalente ES5 ao normalize("NFD")). */
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

    /* Normaliza palavra/frase: sem acento, minúscula, só letras/espaço/hífen. */
    function normalize(value) {
        if (!value) return "";
        var s = deaccent(String(value).toLowerCase());
        var out = "";
        for (var i = 0; i < s.length; i++) {
            var c = s.charAt(i);
            if ((c >= "a" && c <= "z") || c === " " || c === "-") out += c;
        }
        return out.replace(/\s+/g, " ").trim();
    }

    var WORD_RE = /[a-zA-ZáàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ][a-zA-ZáàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ'’-]*/g;
    function words(value) {
        return String(value).match(WORD_RE) || [];
    }

    function has(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    }

    /* Antecedente: sintagma nominal antes de "que". Retorna null se "que" for
     * conjunção integrante (verbo dicendi) ou não houver antecedente. */
    function extractAntecedent(prefix) {
        var tokens = words(prefix);
        if (!tokens.length) return null;
        if (has(COMPLEMENT_TRIGGERS, normalize(tokens[tokens.length - 1]))) return null;

        var windowStart = Math.max(0, tokens.length - 8);
        var start = -1;
        var i;
        for (i = tokens.length - 1; i >= windowStart; i -= 1) {
            var token = normalize(tokens[i]);
            if (has(DETERMINERS, token)) {
                start = i;
                if (i > windowStart) {
                    var prev = normalize(tokens[i - 1]);
                    if (has(LIMITERS, prev) || has(QUANTIFIERS, prev)) start = i - 1;
                }
                break;
            }
        }

        if (start < 0) {
            i = tokens.length - 1;
            while (i >= windowStart) {
                var tokenRaw = tokens[i];
                var normalized = normalize(tokenRaw);
                if (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(tokenRaw) || has(NAME_CONNECTORS, normalized)) i -= 1;
                else break;
            }
            start = i + 1;
            var nameTokens = tokens.slice(start);
            if (!nameTokens.some(function (t) { return /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(t); })) return null;
        }

        var antecedentTokens = tokens.slice(start);
        if (antecedentTokens.length < 2 && has(DETERMINERS, normalize(antecedentTokens[0] || ""))) return null;
        return antecedentTokens.join(" ");
    }

    function predicateAfter(text, queEnd) {
        return text.slice(queEnd)
            .replace(/^\s+/, "")
            .split(/[,;.!?…]/, 1)[0]
            .trim();
    }

    function hasUniqueReferent(antecedent) {
        var withoutDeterminer = normalize(antecedent).replace(/^(?:o|a|os|as)\s+/, "");
        return has(UNIQUE_REFERENTS, withoutDeterminer);
    }

    function hasGeneralProperty(antecedent, predicate) {
        var normAntecedent = normalize(antecedent);
        var normPredicate = normalize(predicate);
        for (var i = 0; i < GENERAL_PROPERTIES.length; i++) {
            var item = GENERAL_PROPERTIES[i];
            if (item.antecedent.test(normAntecedent) && item.predicate.test(normPredicate)) return true;
        }
        return false;
    }

    function explicitLimiter(antecedent) {
        var first = normalize(words(antecedent)[0] || "");
        return has(LIMITERS, first);
    }

    function classify(antecedent, predicate) {
        if (explicitLimiter(antecedent)) {
            return {
                type: "restritiva", confidence: "alta", score: 0.96,
                evidence: ["delimitador explícito restringe o conjunto referido"],
                guidance: "Sem vírgulas, a oração seleciona exatamente o grupo indicado pelo delimitador."
            };
        }
        if (hasUniqueReferent(antecedent)) {
            return {
                type: "explicativa", confidence: "alta", score: 0.94,
                evidence: ["antecedente aponta para referente único no contexto"],
                guidance: "Com vírgulas, a oração acrescenta uma explicação sobre um referente já identificado."
            };
        }
        if (hasGeneralProperty(antecedent, predicate)) {
            return {
                type: "explicativa", confidence: "alta", score: 0.92,
                evidence: ["oração expressa propriedade geral documentada do antecedente"],
                guidance: "Com vírgulas, a propriedade aparece como explicação aplicável ao conjunto inteiro."
            };
        }
        return {
            type: "ambigua", confidence: "baixa", score: 0.35,
            evidence: ["a pontuação depende do conjunto que a escritora pretende identificar"],
            guidance: "Com vírgulas, a oração comenta todo o referente; sem vírgulas, seleciona uma parte dele. A intenção autoral decide."
        };
    }

    function analyze(text) {
        if (!text || !text.trim()) return [];
        var analyses = [];
        var relative = /\bque\b/gi;
        var match;
        while ((match = relative.exec(text)) !== null) {
            var sentenceStart = Math.max(
                text.lastIndexOf(".", match.index - 1),
                text.lastIndexOf("!", match.index - 1),
                text.lastIndexOf("?", match.index - 1),
                text.lastIndexOf("\n", match.index - 1)
            ) + 1;
            var rawPrefix = text.slice(sentenceStart, match.index);
            var hasComma = /,\s*$/.test(rawPrefix);
            var cleanPrefix = rawPrefix.replace(/,\s*$/, "").trim();
            var antecedent = extractAntecedent(cleanPrefix);
            if (!antecedent) continue;

            var predicate = predicateAfter(text, match.index + match[0].length);
            if (!predicate) continue;
            var cls = classify(antecedent, predicate);
            var antecedentPos = cleanPrefix.lastIndexOf(antecedent);
            var pos = sentenceStart + Math.max(0, antecedentPos);

            analyses.push({
                antecedent: antecedent,
                predicate: predicate,
                fragment: (antecedent + (hasComma ? "," : "") + " que " + predicate).slice(0, 120),
                pos: pos,
                hasComma: hasComma,
                type: cls.type,
                confidence: cls.confidence,
                score: cls.score,
                evidence: cls.evidence,
                guidance: cls.guidance
            });
        }
        return analyses;
    }

    /* Engine no contrato do Encore: check(snapshot, done) -> findings[]. */
    function RelativeClauseEngine() {
        this.id = "REL-CLAUSE";
        this.domain = "oracoes-adjetivas";
        this.version = "1.0.0";
    }

    RelativeClauseEngine.prototype.check = function (snapshot, done) {
        var findings = [];
        var text = String(snapshot.text || "");
        var results = analyze(text);
        for (var i = 0; i < results.length; i++) {
            var r = results[i];
            var end = r.pos + r.antecedent.length;
            var message = "Oração adjetiva (" + r.type + ", confiança " + r.confidence +
                "): '" + r.fragment + "' — " + r.guidance;
            findings.push(new (global.Encore.contracts.Finding)(this.id, [r.pos, end], message, 0, r.score));
        }
        done(findings);
    };

    /* Mantém analyze() exposto para os testes unitários (comportamento puro). */
    RelativeClauseEngine.prototype.analyze = analyze;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = RelativeClauseEngine;
    } else {
        global.Encore = global.Encore || {};
        global.Encore.core = global.Encore.core || {};
        global.Encore.core.engines = global.Encore.core.engines || {};
        global.Encore.core.engines.RelativeClauseEngine = RelativeClauseEngine;
    }
})(typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this));
