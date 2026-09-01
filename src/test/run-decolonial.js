(function () {
    "use strict";

    /* Escrevaral-Encore — Test runner da engine Decolonial (ES5).
     * Roda em Node. Carrega o dado do JSON e verifica o contrato check().
     */

    var root = typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this);
    var fs = require("fs");
    var path = require("path");

    require("../core/contracts.js");
    var DecolonialEngine = require("../core/engines/decolonial.js");

    var data = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../data/decolonial-data.json"), "utf8"));
    var engine = new DecolonialEngine(data);

    var total = 0, passed = 0, failures = [];

    function avoideOf(findings) {
        return findings.map(function (f) {
            var m = /'([^']+)'/.exec(f.message);
            return m ? m[0] : "?";
        });
    }

    function testContract(name, text, expectCount, expectTerm) {
        total++;
        var called = false;
        engine.check({ text: text }, function (findings) {
            called = true;
            var ok = Array.isArray(findings) && findings.length === expectCount;
            if (expectTerm) {
                ok = ok && avoideOf(findings).some(function (a) { return a === "'" + expectTerm + "'"; });
            }
            if (ok) {
                passed++;
                console.log("PASS [" + name + "] findings=" + findings.length);
            } else {
                failures.push(name + ": esperado count=" + expectCount + ", got " + JSON.stringify(avoideOf(findings)));
                console.error("FAIL [" + name + "] esperado=" + expectCount + " got=" + JSON.stringify(avoideOf(findings)));
            }
        });
        if (!called) {
            failures.push(name + ": callback não invocado");
            console.error("FAIL [" + name + "] callback não invocado");
        }
    }

    /* detecções reais */
    testContract("escravo", "A história do escravo naquele período.", 1, "escravo");
    testContract("criado-mudo", "Coloquei o copo no criado mudo.", 1, "criado mudo");
    testContract("sem-termo", "O texto não contém termos marcados.", 0);
    testContract("vazio", "", 0);
    testContract("só-espaco", "   ", 0);

    /* fronteira de palavra: "escravos" plural ainda casa com "escravo"? Não —
       fronteira exige que depois do termo não haja letra, então "escravos" NÃO casa
       exatamente com "escravo" (o 's' impede). Mas "escravo de" e "escravo" como
       termos separados podem dar 2 findings. Aqui testamos "escravo" sozinho. */
    testContract("escravo-plural-nao-separa", "Os escravos trabalhavam.", 0);

    /* acento: termo "criado mudo" sem acento; texto com acento é normalizado */
    testContract("acento-normalizado", "Coloquei na mesa o Criado Mudo.", 1, "criado mudo");

    console.log("-----");
    console.log("RESULTADO: " + passed + "/" + total + " passando");
    if (failures.length) {
        console.error("FALHAS:");
        failures.forEach(function (f) { console.error("  - " + f); });
        process.exit(1);
    }
})();
