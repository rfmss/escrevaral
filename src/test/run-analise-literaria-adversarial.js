(function () {
    "use strict";

    /* run-analise-literaria-adversarial.js — fidelidade do port ES5 (Vereda v3)
     * sob ATAQUE: banca adversarial congelada (fixtures/analise-literaria-adversarial-corpus.js)
     * contra o OURO gerado da fonte ES6 original. Guarda contra exceções: qualquer
     * crash no port é falha (fracture do mecanismo de conversão).
     */

    var root = typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this);
    require("../core/contracts.js");
    var AnaliseLiterariaEngine = require("../core/engines/analise-literaria.js");
    var corpus = require("./fixtures/analise-literaria-adversarial-corpus.js").cases;
    var golden = require("./fixtures/analise-literaria-golden-adversarial.json").casos;

    var engine = new AnaliseLiterariaEngine();
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

    function test(name, ok, extra) {
        total++;
        if (ok) {
            passed++;
            console.log("PASS [" + name + "]");
        } else {
            failures.push(name + (extra ? "\n  " + extra : ""));
            console.error("FAIL [" + name + "]");
        }
    }

    var gIndex = {};
    for (var g = 0; g < golden.length; g++) gIndex[golden[g].id] = golden[g];

    var pendingChecks = 0, checkDone = 0;

    for (var i = 0; i < corpus.length; i++) {
        (function (c) {
            var gold = gIndex[c.id];
            var r = null, crashed = false;
            try {
                r = engine.analisar(c.text, c.options);
            } catch (e) {
                crashed = true;
                failures.push(c.id + "-crash-guard: " + e.message);
            }
            test(c.id + "-crash-guard", !crashed);
            var a = [];
            if (!crashed && r) {
                try { a = engine.interpretarResultado(r); }
                catch (e) { failures.push(c.id + "-alertas-crash: " + e.message); }
            }
            test(c.id + "-payload", !crashed, "analisar exceção");
            if (!crashed) {
                var gotNorm = r === null ? null : norm(r);
                test(c.id + "-analisar", JSON.stringify(gotNorm) === JSON.stringify(norm(gold.result)), "got " + JSON.stringify(gotNorm).slice(0, 200));
                test(c.id + "-alertas", JSON.stringify(norm(a)) === JSON.stringify(norm(gold.alertas)), "got " + JSON.stringify(norm(a)).slice(0, 200));
            }
            if (!crashed && r === null) test(c.id + "-null", gold.result === null, "");

            pendingChecks++;
            engine.check(new root.Encore.contracts.LinguisticSnapshot(c.text, c.options), function (findings) {
                var expectedLen = gold.result === null ? 0 : gold.alertas.length;
                test(c.id + "-check-findings", !crashed && findings.length === expectedLen, "got " + findings.length + " esperado " + expectedLen);
                var allOk = true;
                for (var f = 0; f < findings.length; f++) {
                    var fd = findings[f];
                    if (!fd.ruleId || !fd.span || !fd.message) allOk = false;
                }
                test(c.id + "-check-contrato", allOk, "");
                checkDone++;
            });
        })(corpus[i]);
    }

    function wait() {
        if (checkDone < pendingChecks) { setTimeout(wait, 10); return; }
        console.log("-----");
        console.log("RESULTADO: " + passed + "/" + total + " passando (adversarial)");
        if (failures.length) {
            console.log("FALHAS:");
            for (var k = 0; k < failures.length; k++) console.log("  " + failures[k]);
            process.exit(1);
        }
    }
    wait();
})();