(function () {
    "use strict";

    var tokenizer = require("../core/services/tokenizer.js");
    var total = 0;
    var passed = 0;
    var failures = [];

    function test(name, text, expected) {
        var actual;
        var ok;
        total++;
        actual = tokenizer.tokenize(text);
        ok = JSON.stringify(actual) === JSON.stringify(expected);
        if (ok) {
            passed++;
            console.log("PASS [" + name + "]");
        } else {
            failures.push(name + ": " + JSON.stringify(actual));
            console.error("FAIL [" + name + "] esperado=" + JSON.stringify(expected) + " obtido=" + JSON.stringify(actual));
        }
    }

    function token(value, start, end) {
        return { value: value, span: [start, end] };
    }

    test("vazio", "", []);
    test("simples", "casa azul", [token("casa", 0, 4), token("azul", 5, 9)]);
    test("acentos", "ação, avó", [token("ação", 0, 4), token("avó", 6, 9)]);
    test("clitico-hifen", "fazê-lo", [token("fazê-lo", 0, 7)]);
    test("hifens-multiplos", "dar-te-ei", [token("dar-te-ei", 0, 9)]);
    test("apostrofo-reto", "d'água", [token("d'água", 0, 6)]);
    test("apostrofo-tipografico", "d’água", [token("d’água", 0, 6)]);
    test("trema-em-nome", "Müller", [token("Müller", 0, 6)]);
    test("quebra-e-posicao", "Oi\nMüller!", [token("Oi", 0, 2), token("Müller", 3, 9)]);
    test("chamada-repetida", "fim", [token("fim", 0, 3)]);

    console.log("-----");
    console.log("TOKENIZADOR: " + passed + "/" + total + " passando");
    if (failures.length) process.exit(1);
})();
