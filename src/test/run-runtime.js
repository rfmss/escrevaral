(function () {
    "use strict";

    /* Escrevaral-Encore — Test do runtime (um engine por vez) + integração da morfologia. */

    var path = require("path");
    require("../core/runtime.js");
    var Encore = require("../core/contracts.js") && (typeof global !== "undefined" ? global.Encore : window.Encore);
    var MorphologyEngine = require("../core/engines/morphology.js");
    var runtime = Encore.runtime;

    var data = JSON.parse(require("fs").readFileSync(path.resolve(__dirname, "../data/verbos-seed.json"), "utf8"));
    var exceptions = JSON.parse(require("fs").readFileSync(path.resolve(__dirname, "../data/exceptions-seed.json"), "utf8"));

    var morph = new MorphologyEngine(data, exceptions);
    runtime.register(morph);

    var steps = [
        ["VERB-MORPH", "cantávamos", "cantar"],
        ["VERB-MORPH", "fazê-lo", "fazer"],
        ["VERB-MORPH", "um lugar", null]
    ];

    var idx = 0, failed = 0;

    function next() {
        if (idx >= steps.length) {
            console.log("-----");
            console.log("RUNTIME: " + (steps.length - failed) + "/" + steps.length + " passando");
            if (failed) process.exit(1);
            return;
        }
        var s = steps[idx++];
        var text = s[1];
        var expectedLema = s[2];
        runtime.runOne(s[0], text, function (findings) {
            var lema = null;
            if (findings && findings.length) {
                var m = findings[0].message.match(/lema '([^']+)'/);
                lema = m ? m[1] : null;
            }
            var ok = lema === expectedLema;
            console.log((ok ? "PASS " : "FAIL ") + JSON.stringify(text) + " -> " + (lema || "null") + " (esperado " + (expectedLema || "null") + ")");
            if (!ok) failed++;
            next();
        });
    }

    next();
})();
