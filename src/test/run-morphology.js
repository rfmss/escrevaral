(function () {
    "use strict";

    /* Escrevaral-Encore — Test runner para engines (ES5).
     * Roda em Node (module.exports) e pode ser adaptado ao browser para o piso legado.
     * Classes de teste seguem o modelo de maturidade (30-testing.md):
     * normative, exceptions, ambiguity, nao-se-meta, regression, adversarial.
     */

    var root = typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this);
    var fs = require("fs");
    var path = require("path");

    require("../core/contracts.js");
    var MorphologyEngine = require("../core/engines/morphology.js");
    var contracts = root.Encore.contracts;

    function loadJson(relative) {
        var full = path.resolve(__dirname, relative);
        if (fs.existsSync(full)) return JSON.parse(fs.readFileSync(full, "utf8"));
        throw new Error("JSON não encontrado: " + full);
    }

    var data = loadJson("../data/verbos-seed.json");
    var exceptions = loadJson("../data/exceptions-seed.json");

    var engine = new MorphologyEngine(data, exceptions);

    var total = 0, passed = 0, failures = [];

    function norm(word) {
        return String(word).toLowerCase().replace(/[.!?,;:"]+$/, "");
    }

    function test(category, word, expectedLema) {
        total++;
        var meta = engine.analyze(norm(word));
        var got = meta ? meta.lema : null;
        if (got === expectedLema) {
            passed++;
            console.log("PASS [" + category + "] " + word + " -> " + (got || "null"));
        } else {
            failures.push(category + ": " + word + " -> esperado " + expectedLema + ", got " + (got || "null"));
            console.error("FAIL [" + category + "] " + word + " -> esperado " + expectedLema + ", got " + (got || "null"));
        }
    }

    /* normative */
    test("normative", "cantávamos", "cantar");
    test("normative", "venderiam", "vender");
    test("normative", "partistes", "partir");
    test("normative", "falarei", "falar");
    test("normative", "comam", "comer");
    test("normative", "escreveste", "escrever");
    test("normative", "veio", "vir");

    /* cliticos (enclise + mesoclise) */
    test("cliticos", "fazê-lo", "fazer");
    test("cliticos", "dar-te-ei", "dar");
    test("cliticos", "vendê-la", "vender");

    /* nao-se-meta / exceptions */
    test("nao-se-meta", "desconhecido", null);
    test("nao-se-meta", "açúcar", null);
    test("nao-se-meta", "coisa", null);
    test("nao-se-meta", "usuario", null);

    console.log("-----");
    console.log("RESULTADO: " + passed + "/" + total + " passando");
    if (failures.length) {
        console.error("FALHAS:");
        failures.forEach(function (f) { console.error("  - " + f); });
        process.exit(1);
    }
})();
