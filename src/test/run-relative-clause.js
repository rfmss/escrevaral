(function () {
    "use strict";

    /* Escrevaral-Encore — Test runner da engine de Orações Adjetivas (ES5).
     * Roda em Node (module.exports). Verifica analyze() (comportamento puro) e
     * check() (contrato do Encore -> findings[]).
     */

    var root = typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this);
    require("../core/contracts.js");
    var RelativeClauseEngine = require("../core/engines/relative-clause.js");

    var engine = new RelativeClauseEngine();

    var total = 0, passed = 0, failures = [];

    function analyze(text) { return engine.analyze(text); }

    /* Analisa a primeira ocorrência de "que" e devolve a classificação. */
    function firstType(text) {
        var res = analyze(text);
        return res.length ? res[0].type : null;
    }

    function test(name, got, expected) {
        total++;
        if (got === expected) {
            passed++;
            console.log("PASS [" + name + "] got=" + (got === null ? "null" : got));
        } else {
            failures.push(name + ": esperado " + expected + ", got " + (got === null ? "null" : got));
            console.error("FAIL [" + name + "] esperado=" + expected + ", got=" + (got === null ? "null" : got));
        }
    }

    /* restritiva — delimitador explícito resta o conjunto */
    test("restritiva-delimitador", firstType("Apenas os alunos que estudaram passaram."), "restritiva");
    test("restritiva-apenas", firstType("Somente as cartas que ele escreveu sobreviveram."), "restritiva");

    /* explicativa — referente único */
    test("explicativa-referente-unico", firstType("O Brasil, que é gigante, tem muitas culturas."), "explicativa");
    test("explicativa-machado", firstType("Machado de Assis, que escreveu Memórias Póstumas, é genial."), "explicativa");

    /* explicativa — propriedade geral documentada */
    test("explicativa-propriedade", firstType("As baleias, que têm sangue quente, são mamíferos."), "explicativa");

    /* ambígua — abstenção por padrão */
    test("ambigua-fallback", firstType("Os alunos que estudaram passaram."), "ambigua");

    /* abstenções: conjunção integrante e "o que" demonstrativo */
    test("conjuncao-integrante", firstType("Eu acho que chove hoje."), null);
    test("o-que-demonstrativo", firstType("O que você quer?"), null);

    /* texto vazio */
    test("vazio", firstType("   "), null);
    test("vazio-string", firstType(""), null);

    /* contrato check() -> findings[] */
    (function checkContract() {
        total++;
        var called = false;
        engine.check({ text: "O Brasil, que é gigante, é rico." }, function (findings) {
            called = true;
            var ok = Array.isArray(findings) &&
                findings.length === 1 &&
                findings[0].ruleId === "REL-CLAUSE" &&
                Array.isArray(findings[0].span) &&
                typeof findings[0].confidence === "number";
            if (ok) {
                passed++;
                console.log("PASS [check-contrato] findings=" + findings.length);
            } else {
                failures.push("check-contrato: findings malformados " + JSON.stringify(findings));
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
