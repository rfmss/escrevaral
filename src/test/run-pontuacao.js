(function () {
    "use strict";

    /* Escrevaral-Encore — Test runner da engine de Pontuação (ES5).
     * Roda em Node. Verifica regras autônomas, resumo de severidade, regras
     * contextuais (via REL-CLAUSE), getRules() e o contrato check().
     */

    var root = typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this);
    require("../core/contracts.js");
    require("../core/runtime.js");
    var RelClauseEngine = require("../core/engines/relative-clause.js");
    var PunctuationEngine = require("../core/engines/pontuacao.js");
    var engine = new PunctuationEngine();

    global.Encore.runtime.register(new RelClauseEngine());

    var total = 0, passed = 0, failures = [];

    function test(name, got, expected) {
        total++;
        var g = JSON.stringify(got), e = JSON.stringify(expected);
        if (g === e) {
            passed++;
            console.log("PASS [" + name + "] got=" + g);
        } else {
            failures.push(name + ": esperado " + e + ", got " + g);
            console.error("FAIL [" + name + "] esperado=" + e + ", got=" + g);
        }
    }

    function ids(r) { return r.issues.map(function (i) { return i.ruleId; }).sort().join(","); }

    /* getRules: 38 regras */
    test("getrules-count", engine.getRules().length, 38);

    /* vírgula/regras autônomas num texto combinado */
    var r1 = engine.analyze("O escritor publicou o romance. O resultado contudo foi satisfatório. Maria venha aqui.");
    test("r1-ids", ids(r1), "PONT-02,PONT-09");
    test("r1-posicao", r1.issues[0].pos >= 0, true);

    /* ponto e vírgula + 'mas' + espaço */
    var r2 = engine.analyze("Trouxe papel organizou a mesa acendeu a luz. Ela tentou mas não conseguiu. Ele chegou tarde .");
    test("r2-ids", ids(r2), "PONT-08,PONT-49,PONT-50");
    test("r2-resumo", JSON.stringify(r2.resumo), JSON.stringify({ alta: 1, media: 2, baixa: 0 }));

    /* exclamação/interrogação múltipla + maiúscula após dois-pontos */
    var r3 = engine.analyze("Que beleza!!! Você não viu o arquivo??? Comprou três itens: Livro, caneta e papel.");
    test("r3-ids", ids(r3), "PONT-07,PONT-27,PONT-43");

    /* reticências + etc + espaço antes de vírgula */
    var r4 = engine.analyze("Era lindo... o sol... e o mar... atlas, dicionários, etc... Ela sorriu , saiu.");
    test("r4-ids", ids(r4), "PONT-06,PONT-35,PONT-50,PONT-55");

    /* regra contextual PONT-19 (restritiva com vírgula) via REL-CLAUSE */
    var r5 = engine.analyze("Na votação final, apenas os políticos, que foram condenados, perderam o mandato após o julgamento completo do tribunal.");
    test("r5-contextual", r5.issues.filter(function (i) { return i.ruleId === "PONT-19"; }).length > 0, true);

    /* texto curto → sem issues (limiar de 10 palavras) */
    var r6 = engine.analyze("Curto mesmo.");
    test("r6-curto", r6.issues.length, 0);
    test("r6-rulecount", r6.ruleCount, 38);

    /* contrato check() */
    (function checkContract() {
        total++;
        var called = false;
        engine.check({ text: "O resultado contudo foi satisfatório. Ela tentou mas não conseguiu." }, function (findings) {
            called = true;
            var styled = Array.isArray(findings);
            var hasPONT = styled && findings.some(function (f) { return f.ruleId === "PONTUACAO" && /\[PONT-/.test(f.message); });
            if (styled && hasPONT && findings.length >= 2) {
                passed++;
                console.log("PASS [check-contrato] findings=" + findings.length);
            } else {
                failures.push("check-contrato: findings=" + JSON.stringify(findings));
                console.error("FAIL [check-contrato]");
            }
        });
        if (!called) {
            failures.push("check-contrato: callback não invocado");
            console.error("FAIL [check-contrato] callback não invocado");
        }
    })();

    console.log("-----");
    console.log("RESULTADO: " + passed + "/" + total + " passando");
    if (failures.length) {
        console.error("FALHAS:");
        failures.forEach(function (f) { console.error("  - " + f); });
        process.exit(1);
    }
})();
