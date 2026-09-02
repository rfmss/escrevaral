(function () {
    "use strict";

    var root = typeof global !== "undefined" ? global :
        (typeof window !== "undefined" ? window : this);
    var fs = require("fs");
    var path = require("path");

    require("../core/contracts.js");
    var tokenizer = require("../core/services/tokenizer.js");
    require("../data/verbos-seed.js");
    require("../data/exceptions-seed.js");
    require("../data/verb-lemmas-core.js");
    var MorphologyEngine = require("../core/engines/morphology.js");

    var fixture = JSON.parse(fs.readFileSync(
        path.resolve(__dirname, "fixtures/morphology-legacy-false-positive.json"),
        "utf8"
    ));
    var engine = new MorphologyEngine(
        root.Encore.data.verbosSeed,
        root.Encore.data.exceptionsSeed,
        tokenizer,
        root.Encore.data.verbLemmasCore
    );
    var passed = 0;
    var failures = [];

    fixture.cases.forEach(function (item) {
        var selected = null;
        engine.check(
            new root.Encore.contracts.LinguisticSnapshot(item.manuscript),
            function (findings) {
                var i;
                var surface;
                for (i = 0; i < findings.length; i += 1) {
                    surface = item.manuscript.substring(
                        findings[i].span[0], findings[i].span[1]
                    );
                    if (surface === item.query) {
                        selected = findings[i];
                        break;
                    }
                }
            }
        );
        if (selected) {
            failures.push(item.id + ": " + selected.message);
            console.error("FAIL " + item.id + " -> " + selected.message);
        } else {
            passed += 1;
            console.log("PASS " + item.id + " -> nenhum falso positivo");
        }
    });

    console.log("-----");
    console.log("RESULTADO: " + passed + "/" + fixture.cases.length + " passando");
    if (failures.length) process.exit(1);
}());
