(function () {
    "use strict";

    /* Escrevaral — Test runner da engine lexico-classes (VeredaLexical, port ES5).
     * Fidelidade: compara o payload dos probes do PORT com o OURO da fonte original
     * (generate-lexical-golden.js) sobre a banca congelada (lexico-corpus.js).
     * Contrato: check(snapshot, done) assíncrono → Findings (Encore.contracts).
     */

    var root = typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this);
    require("../data/lexical-data.js");
    require("../data/lexical-norma-data.js");
    require("../core/contracts.js");
    require("../core/engines/lexico-classes.js"); // roda a IIFE e 'global.VeredaLexical'
    var LEXICO = require("../core/engines/lexico-classes.js"); // mesma instância (AUTORITATIVA)
    var corpus = require("./fixtures/lexico-corpus.js").cases;
    var golden = require("./fixtures/lexical-golden.json").casos;

    var engine = new LEXICO();

    var total = 0, passed = 0, failures = [];

    function norm(o) {
        if (Array.isArray(o)) return o.map(norm);
        if (o && typeof o === "object") {
            var keys = Object.keys(o).sort(), out = {};
            for (var i = 0; i < keys.length; i++) out[keys[i]] = norm(o[keys[i]]);
            return out;
        }
        return o;
    }

    function test(name, got, expected) {
        total++;
        var g = JSON.stringify(norm(got)), e = JSON.stringify(norm(expected));
        if (g === e) {
            passed++;
            console.log("PASS [" + name + "]");
        } else {
            failures.push(name + "\n  got      " + g.slice(0, 240) + "\n  esperado " + e.slice(0, 240));
            console.error("FAIL [" + name + "]");
        }
    }

    var gIndex = {};
    for (var g = 0; g < golden.length; g++) gIndex[golden[g].id] = golden[g];

    var pendingChecks = 0, checkDone = 0;

    for (var i = 0; i < corpus.length; i++) {
        var c = corpus[i];
        var gold = gIndex[c.id];

        var probes = c.probes.map(function (tk) {
            var entry = { token: tk, ctx: root.VeredaLexical.analyze(tk, c.text), solo: root.VeredaLexical.analyze(tk) };
            return JSON.parse(JSON.stringify(entry));
        });
        test(c.id + "-payload", { isLoaded: root.VeredaLexical.isLoaded(), probes: probes }, gold.payload);

        test(c.id + "-isLoaded", engine.isLoaded(), true);

        pendingChecks++;
        (function (cc, gg) {
            engine.check(new root.Encore.contracts.LinguisticSnapshot(cc.text, { probes: cc.probes }), function (findings) {
                var expectedLen = gold.payload.info ? gold.payload.info.findingCount : 0;
                test(cc.id + "-check-findings", findings.length, gold.payload.probes.length);
                var allOk = true;
                for (var f = 0; f < findings.length; f++) {
                    var fd = findings[f];
                    if (fd.ruleId !== engine.id || !fd.span || fd.span.start < 0 || !fd.span.length ||
                        !fd.message || !fd.severity || !fd.confidence) allOk = false;
                }
                test(cc.id + "-check-contrato", allOk, true);
                checkDone++;
            });
        })(c, gold);
    }

    function wait() {
        if (checkDone < pendingChecks) {
            setTimeout(wait, 10);
            return;
        }
        console.log("-----");
        console.log("RESULTADO: " + passed + "/" + total + " passando");
        if (failures.length) {
            console.log("FALHAS:");
            for (var k = 0; k < failures.length; k++) console.log("  " + failures[k]);
            process.exit(1);
        }
    }

    wait();
})();