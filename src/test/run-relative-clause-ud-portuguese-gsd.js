(function () {
    "use strict";

    var RelativeClauseEngine = require("../core/engines/relative-clause.js");
    var fixture = require("./fixtures/relative-clause-ud-portuguese-gsd.json");
    var engine = new RelativeClauseEngine();
    var total = fixture.cases.length;
    var passed = 0;
    var failures = [];

    function same(actual, expected) {
        var i;
        if (actual.length !== expected.length) return false;
        for (i = 0; i < expected.length; i += 1) {
            if (actual[i].antecedent !== expected[i].antecedent) return false;
            if (actual[i].type !== expected[i].type) return false;
        }
        return true;
    }

    fixture.cases.forEach(function (item) {
        var actual = engine.analyze(item.text).map(function (result) {
            return { antecedent: result.antecedent, type: result.type };
        });
        if (same(actual, item.expected)) {
            passed += 1;
            console.log("PASS [" + item.id + "]");
        } else {
            failures.push(item.id + ": esperado " + JSON.stringify(item.expected) +
                ", recebido " + JSON.stringify(actual));
            console.error("FAIL [" + item.id + "]");
        }
    });

    console.log("-----");
    console.log("RESULTADO EXTERNO: " + String(passed) + "/" + String(total));
    if (failures.length) {
        failures.forEach(function (failure) { console.error(failure); });
        process.exit(1);
    }
}());
