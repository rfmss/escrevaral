(function () {
    "use strict";

    /* Escrevaral-Encore — Test runner da engine de Rima e Métrica (ES5).
     * Roda em Node. Verifica o núcleo analítico (silabificação, tonicidade,
     * escansão, rima, esquema, nome do metro) e o contrato check().
     */

    var root = typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this);
    require("../core/contracts.js");
    var RimaLabEngine = require("../core/engines/rima-metro.js");
    var engine = new RimaLabEngine();

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

    /* silabificação */
    test("syl-amor", engine.syllabify("amor"), ["a", "mor"]);
    test("syl-nh", engine.syllabify("minha"), ["mi", "nha"]);
    test("syl-hiato", engine.syllabify("rua"), ["ru", "a"]);
    test("syl-ditongo", engine.syllabify("baleias"), ["ba", "leias"]);
    test("syl-vazio", engine.syllabify(""), []);

    /* tonicidade */
    test("ton-oxitona", engine.classifyTonicity("amor"), "oxítona");
    test("ton-paroxitona", engine.classifyTonicity("mapa"), "paroxítona");
    test("ton-mono", engine.classifyTonicity("mar"), "monossílabo");
    test("ton-accento", engine.classifyTonicity("rápido"), "proparoxítona");

    /* som de rima */
    test("sound-amor", engine.getRhymeSound("amor"), "or");
    test("sound-flor", engine.getRhymeSound("flor"), "or");

    /* escansão de verso conhecida (fonte validada) */
    var scan1 = engine.scanVerse("Minha rua não cabe no mapa");
    test("scan-syl", scan1.totalSyllables, 10);
    test("scan-name", scan1.name, "decassílabo");
    test("scan-fin", scan1.finalTonicity, "paroxítona");

    var scan2 = engine.scanVerse("O amor é fogo que arde sem se ver");
    test("scan2-syl", scan2.totalSyllables, 10);
    test("scan2-elision", scan2.ellisions, ["O⌃amor", "que⌃arde"]);

    /* rima consoante e toante */
    test("rhyme-consoante", engine.analyzeRhyme("o amor", "a flor").classification, "pobre");
    test("rhyme-mar-nao", engine.analyzeRhyme("o amor", "o mar").rhymes, false);
    test("rhyme-toante", engine.analyzeRhyme("a pedra", "a cena").rhymes, true);

    /* esquema e nome */
    test("scheme-abba", engine.computeRhymeScheme(["a", "b", "b", "a"]), "A B B A");
    test("name-abba", engine.nameScheme("A B B A"), "quarteto abrazado (redondilha)");

    /* análise completa de um poeminha — metro dominante = moda */
    var poem = "O amor é fogo que arde sem se ver\né ferida que dói e não se sente\né um contentamento descontente";
    var full = engine.analyze(poem);
    test("full-isprose", full.isProse, false);
    test("full-verses", full.totalVerses, 3);
    test("full-dominant", full.dominantMetric, 10);
    test("full-dominantName", full.dominantName, "decassílabo");
    test("full-rhymes", full.rhymes.length, 1);
    test("full-scheme", full.rhymeScheme, "A B B");

    /* prosa → não é verso */
    var prosa = engine.analyze("Este é um texto que segue por várias linhas sem quebrar em versos. Tudo aqui é prosa continua normalmente.");
    test("prosa-isprose", prosa.isProse, true);

    /* contrato check() */
    (function checkContract() {
        total++;
        var called = false;
        engine.check({ text: "O amor é fogo que arde sem se ver\né ferida que dói e não se sente" }, function (findings) {
            called = true;
            var styled = Array.isArray(findings);
            var schemeMsg = styled && findings.some(function (f) { return f.ruleId === "RIMA-METRICA" && /Esquema/.test(f.message); });
            if (styled && schemeMsg && findings.length >= 3) {
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
