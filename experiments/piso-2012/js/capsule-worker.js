(function (self) {
    "use strict";

    var rules = [
        { word: "era", message: "Forma curta encontrada. A prova para no primeiro resultado." },
        { word: "coisa", message: "Palavra ampla encontrada. A prova registra a posição e interrompe." },
        { word: "muito", message: "Intensificador encontrado. A próxima busca retomará depois dele." },
        { word: "que", message: "Conector encontrado. Nenhuma segunda ocorrência será examinada agora." }
    ];

    function lower(value) {
        return String(value || "").toLowerCase();
    }

    function isLetter(character) {
        return character && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(character);
    }

    function matchesAt(text, word, index) {
        var before = index > 0 ? text.charAt(index - 1) : "";
        var after = text.charAt(index + word.length);
        return text.substr(index, word.length) === word && !isLetter(before) && !isLetter(after);
    }

    function loadData(profile) {
        var path = "../data/shard-small.js";
        if (profile === "medium") path = "../data/shard-medium.js";
        if (profile === "large") path = "../data/shard-large.js";
        self.PROBE_SHARD = null;
        self.importScripts(path);
        if (!self.PROBE_SHARD || !self.PROBE_SHARD.entries) {
            throw new Error("Fragmento não produziu dados.");
        }
        return self.PROBE_SHARD;
    }

    function scan(text, from) {
        var normalized = lower(text);
        var start = from < 0 ? 0 : from;
        var i;
        var j;
        for (i = start; i < normalized.length; i += 1) {
            for (j = 0; j < rules.length; j += 1) {
                if (matchesAt(normalized, rules[j].word, i)) {
                    return {
                        ruleId: "PROBE-" + String(j + 1),
                        from: i,
                        to: i + rules[j].word.length,
                        nextCursor: i + rules[j].word.length,
                        value: text.substr(i, rules[j].word.length),
                        message: rules[j].message
                    };
                }
            }
        }
        return null;
    }

    self.onmessage = function (event) {
        var request = event.data || {};
        var shard;
        var finding;
        if (request.type !== "scan") return;
        try {
            shard = loadData(request.profile);
            finding = scan(String(request.text || ""), Number(request.from || 0));
            self.postMessage({
                type: "result",
                revision: request.revision,
                entries: shard.entries.length,
                checksum: shard.checksum,
                finding: finding,
                nextCursor: finding ? finding.nextCursor : String(request.text || "").length
            });
            self.PROBE_SHARD = null;
        } catch (error) {
            self.postMessage({ type: "error", message: error && error.message ? error.message : String(error) });
        }
    };
}(self));
