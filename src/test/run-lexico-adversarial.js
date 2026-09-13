(function () {
    "use strict";

    /* run-lexico-adversarial.js — fidelidade do port ES5 (VeredaLexical) sob
     * ATAQUE (fronteiras, neologismos, Unicode degradado, vazios, mega-palavras).
     * Ouro gerado da fonte ES6. Guarda contra exceções no port.
     */

    var root = typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this);
    require("../data/lexical-data.js");
    require("../data/lexical-norma-data.js");
    require("../core/contracts.js");
    require("../core/engines/lexico-classes.js");
    var LEXICO = require("../core/engines/lexico-classes.js");
    var corpus = require("./fixtures/lexico-adversarial-corpus.js").cases;
    var golden = require("./fixtures/lexical-golden-adversarial.json").casos;

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

    function test(name, ok, extra) {
        total++;
        if (ok) { passed++; console.log("PASS [" + name + "]"); }
        else { failures.push(name + (extra ? "\n  " + extra : "")); console.error("FAIL [" + name + "]"); }
    }

    var gIndex = {};
    for (var g = 0; g < golden.length; g++) gIndex[golden[g].id] = golden[g];

    var pendingChecks = 0, checkDone = 0;

    for (var i = 0; i < corpus.length; i++) {
        (function (c) {
            var gold = gIndex[c.id];
            var probes = null, crashedProbe = [];
            try {
                probes = c.probes.map(function (tk) {
                    var entry = { token: tk, ctx: root.VeredaLexical.analyze(tk, c.text), solo: root.VeredaLexical.analyze(tk) };
                    return JSON.parse(JSON.stringify(entry));
                });
            } catch (e) {
                crashedProbe = [e.message];
            }
            test(c.id + "-crash-guard", !crashedProbe.length, crashedProbe[0] || "");
            if (!crashedProbe.length) {
                test(c.id + "-payload", JSON.stringify(norm({ isLoaded: root.VeredaLexical.isLoaded(), probes: probes })) === JSON.stringify(norm(gold.payload)),
                    "got " + JSON.stringify(norm({ isLoaded: root.VeredaLexical.isLoaded(), probes: probes })).slice(0, 240));
                test(c.id + "-isLoaded", engine.isLoaded(), "");
            }
            var expectedFindings = gold.payload.probes.filter(function (p) { return p.ctx !== null; }).length;

            pendingChecks++;
            engine.check(new root.Encore.contracts.LinguisticSnapshot(c.text, { probes: c.probes }), function (findings) {
                test(c.id + "-check-findings", !crashedProbe.length && findings.length === expectedFindings,
                    "got " + findings.length + " esperado " + expectedFindings);
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