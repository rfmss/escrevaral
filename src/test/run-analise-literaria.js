(function () {
    "use strict";

    /* Escrevaral-Encore — Test runner da engine de Análise Literária (Vereda v3, port ES5).
     * Compara o port ES5 com o OURO da fonte original (fixtures/analise-literaria-golden.json)
     * sobre a banca congelada (fixtures/analise-literaria-corpus.js). Também valida o
     * contrato check(snapshot, done) assíncrono.
     */

    var root = typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this);
    require("../core/contracts.js");
    var AnaliseLiterariaEngine = require("../core/engines/analise-literaria.js");
    var corpus = require("./fixtures/analise-literaria-corpus.js").cases;
    var golden = require("./fixtures/analise-literaria-golden.json").casos;

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

    function test(name, got, expected) {
        total++;
        var g = JSON.stringify(norm(got)), e = JSON.stringify(norm(expected));
        if (g === e) {
            passed++;
            console.log("PASS [" + name + "]");
        } else {
            failures.push(name + "\n  got      " + g.slice(0, 200) + "\n  esperado " + e.slice(0, 200));
            console.error("FAIL [" + name + "]");
        }
    }

    var gIndex = {};
    for (var g = 0; g < golden.length; g++) gIndex[golden[g].id] = golden[g];

    var pendingChecks = 0, checkDone = 0;

    for (var i = 0; i < corpus.length; i++) {
        var c = corpus[i];
        var gold = gIndex[c.id];
        var r = engine.analisar(c.text, c.options);

        test(c.id + "-analisar", r, gold.result);

        if (r) {
            var alertas = engine.interpretarResultado(r);
            test(c.id + "-alertas", alertas, gold.alertas);
            test(c.id + "-meta", r.meta, gold.result.meta);
            test(c.id + "-economia", r.economia, gold.result.economia);
            test(c.id + "-clareza", r.clareza, gold.result.clareza);
            test(c.id + "-ritmo", r.ritmo, gold.result.ritmo);
            test(c.id + "-voz", r.voz, gold.result.voz);
            test(c.id + "-estrutura", r.estrutura, gold.result.estrutura);
            test(c.id + "-pov", r.pov, gold.result.pov);
            test(c.id + "-lexico", r.lexico, gold.result.lexico);
            test(c.id + "-confusoes", r.confusoes, gold.result.confusoes);
            test(c.id + "-pleonasmos", r.pleonasmos, gold.result.pleonasmos);
        } else {
            test(c.id + "-null-curto", gold.result === null, true);
        }

        if (i < corpus.length - 1) {
            pendingChecks++;
            (function (cc, gg) {
                engine.check(new root.Encore.contracts.LinguisticSnapshot(cc.text, cc.options), function (findings) {
                    var expectedLen = gg.result === null ? 0 : gg.alertas.length;
                    test(cc.id + "-check-findings", findings.length, expectedLen);
                    var allRulesOk = true;
                    for (var f = 0; f < findings.length; f++) {
                        if (findings[f].ruleId !== engine.id || !findings[f].span || !findings[f].message) allRulesOk = false;
                    }
                    test(cc.id + "-check-contrato", allRulesOk, true);
                    checkDone++;
                });
            })(c, gold);
        }
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