(function () {
    "use strict";

    /* Escrevaral-Encore — Test do runtime (um engine por vez) + morfologia com tokenizador. */

    var path = require("path");
    require("../core/contracts.js");
    require("../core/runtime.js");
    require("../core/services/tokenizer.js");
    var Encore = (typeof global !== "undefined" ? global.Encore : window.Encore);
    var MorphologyEngine = require("../core/engines/morphology.js");
    var runtime = Encore.runtime;

    var data = JSON.parse(require("fs").readFileSync(path.resolve(__dirname, "../data/verbos-seed.json"), "utf8"));
    var exceptions = JSON.parse(require("fs").readFileSync(path.resolve(__dirname, "../data/exceptions-seed.json"), "utf8"));

    var morph = new MorphologyEngine(data, exceptions, Encore.core.services.Tokenizer);
    runtime.register(morph);

    /* cada caso: [texto, array de lemas esperados na ordem] */
    var steps = [
        ["cantávamos", ["cantar"]],
        ["fazê-lo todo dia", ["fazer"]],
        ["um lugar", []],
        ["Ela cantava e venderiam.", ["vender"]],          /* 'venderiam' no seed; 'cantava' não -> só vender */
        ["comam e partistes", ["comer", "partir"]]
    ];

    var idx = 0, failed = 0;

    function lemasFrom(findings) {
        var out = [];
        for (var i = 0; i < findings.length; i++) {
            var m = findings[i].message.match(/lema '([^']+)'/);
            if (m) out.push(m[1]);
        }
        return out;
    }

    function next() {
        if (idx >= steps.length) {
            console.log("-----");
            console.log("RUNTIME: " + (steps.length - failed) + "/" + steps.length + " passando");
            if (failed) process.exit(1);
            return;
        }
        var s = steps[idx++];
        var text = s[0];
        var expected = s[1];
        runtime.runOne("VERB-MORPH", text, function (findings) {
            var got = lemasFrom(findings);
            var ok = got.length === expected.length &&
                expected.every(function (e, k) { return got[k] === e; });
            console.log((ok ? "PASS " : "FAIL ") + JSON.stringify(text) + " -> " + JSON.stringify(got) + " (esperado " + JSON.stringify(expected) + ")");
            if (!ok) failed++;
            next();
        });
    }

    next();
})();
