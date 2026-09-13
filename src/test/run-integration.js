(function () {
    "use strict";

    /* Escrevaral-Encore — Test de integração (R6): cápsulas M4 passando pela fila
     * serializada do runtime (enqueue / runOne), descarte de resposta stale (padrão do
     * demo no index.html), e cobertura de repetição/palavra ausente com spans canônicos.
     */

    var globalObj = typeof global !== "undefined" ? global : window;
    require("../core/contracts.js");
    require("../core/runtime.js");
    require("../core/services/tokenizer.js");
    require("../data/lexical-data.js");
    require("../data/lexical-norma-data.js");
    require("../data/analise-data.json");

    var VeredaLexicalEngine = require("../core/engines/lexico-classes.js");
    var AnaliseLiterariaEngine = require("../core/engines/analise-literaria.js");

    var Encore = globalObj.Encore;
    var runtime = Encore.runtime;
    var Finding = Encore.contracts.Finding;

    var lex = new VeredaLexicalEngine();
    var analyze = new AnaliseLiterariaEngine();
    runtime.register(lex);
    runtime.register(analyze);

    var total = 0, passed = 0, failures = [];

    function test(name, cond, msg) {
        total++;
        if (cond) { passed++; console.log("PASS [" + name + "]"); }
        else { failures.push(name + " :: " + (msg || "")); console.log("FAIL [" + name + " :: " + (msg || "") + "]"); }
    }

    function spanOk(span) {
        return Array.isArray(span) && span.length === 2 &&
            typeof span[0] === "number" && typeof span[1] === "number" &&
            span[0] >= 0 && span[1] > span[0];
    }

    /* 1) Fila serializada: ordem de chegada == ordem de enqueue, nenhuma sobreposição. */
    var ordem = [];
    var expected = ["LEXICO-CLASSES", "ANALISE-LITERARIA", "LEXICO-CLASSES", "ANALISE-LITERARIA", "LEXICO-CLASSES"];
    var enqueued = 0;
    expected.forEach(function (id, i) {
        runtime.enqueue(id, "A casa caiu. A casa ficou.", function () { ordem.push(id); });
        enqueued++;
    });

    setTimeout(function () {
        test("integração-fila-serializada", ordem.length === enqueued &&
            ordem.every(function (id, i) { return id === expected[i]; }),
            "ordem " + JSON.stringify(ordem) + " esperado " + JSON.stringify(expected));

        /* 2) Descarte de resposta stale (padrão do demo): só a requisição mais nova renderiza. */
        var session = 0;
        var rendered = [];
        function enqueueDemo(id, texto) {
            var sess = ++session;
            runtime.enqueue(id, texto, function () { if (sess === session) rendered.push(id); });
        }
        enqueueDemo("LEXICO-CLASSES", "uma bomba velha");
        enqueueDemo("ANALISE-LITERARIA", "poema, poema, poema, poema");
        enqueueDemo("LEXICO-CLASSES", "casa porto mar");

        setTimeout(function () {
            test("integração-stale-discard", rendered.length === 1 && rendered[0] === "LEXICO-CLASSES",
                "renderizados " + JSON.stringify(rendered));

            /* 3) Cápsula léxico via enqueue (sem probes injetados): repetição coberta. */
            var texto = "A casa caiu. A casa ficou.";
            runtime.enqueue("LEXICO-CLASSES", texto, function (findings) {
                var spans = [];
                var ok = findings.length >= 4;
                findings.forEach(function (f) {
                    if (f.ruleId === "LEXICO-CLASSES" && spanOk(f.span) &&
                        typeof f.severity === "number" && f.severity >= 1 && f.severity <= 3 &&
                        typeof f.confidence === "number" && f.confidence >= 0 && f.confidence <= 1 &&
                        f.message) ok = ok && true;
                    else ok = false;
                    if (f.span) spans.push([f.span[0], f.span[1], texto.slice(f.span[0], f.span[1])]);
                });
                var casas = spans.filter(function (s) { return s[2].toLowerCase() === "casa"; });
                test("cápsula-léxico-enqueue-contrato", ok, JSON.stringify(findings).slice(0, 200));
                test("cápsula-léxico-repetição", casas.length === 2 && casas[0][0] !== casas[1][0],
                    JSON.stringify(casas));

                /* 4) Cápsula análise literária via enqueue (texto só, contexto padrão). */
                runtime.enqueue("ANALISE-LITERARIA",
                    "A tarde desce devagar sobre o cais e o vento escreve linhas na água escura. " +
                    "Os barcos dormem moles, amarrados, e a luz se despede sem pressa da muralha. " +
                    "Eu caminho pela areia fria contando os passos que perdi contigo. " +
                    "Longe, um sino repete a mesma pergunta, e o mar, o mar responde que talvez. " +
                    "As gaivotas riscam o céu com tinta cinza, desenhando rotas que ninguém segue. " +
                    "Fico aqui até que a noite apague os contornos e a saudade vire apenas mais uma onda.",
                    function (fs2) {
                        var ok2 = Array.isArray(fs2) && fs2.length > 0 && fs2.every(function (f) {
                            return f.ruleId === "ANALISE-LITERARIA" && f.message && spanOk(f.span) &&
                                f.severity >= 1 && f.severity <= 3 && f.confidence >= 0 && f.confidence <= 1;
                        });
                        test("cápsula-análise-enqueue-contrato", ok2, JSON.stringify(fs2).slice(0, 240));

                        /* 5) Finding canônico serializado (o que o demo consome). */
                        var fd = new Finding("TESTE-INT", [1, 5], "msg", 2, 0.5);
                        test("finding-canônico", fd.ruleId === "TESTE-INT" && Array.isArray(fd.span) &&
                            fd.span[0] === 1 && fd.span[1] === 5 && fd.severity === 2 && fd.confidence === 0.5,
                            JSON.stringify(fd));

                        /* 6) Toggle-off (desligar a lente) com resposta pendente: o resultado
                         *    da fila que chega DEPOIS de desligar NÃO pode reaparecer.
                         *    Espelha o demo: deactivate() invalida a sessão. */
                        var sessT = 0, led = 0, rendT = [];
                        function toggleDemo(id, texto, on) {
                            if (on) {
                                sessT++;
                                led = sessT;
                                runtime.enqueue(id, texto, function () {
                                    if (sessT === led) rendT.push(id);
                                });
                            } else {
                                sessT++; /* desliga → invalida a sessão pendente */
                                led = 0;
                            }
                        }
                        toggleDemo("LEXICO-CLASSES", "casa mar porto", true); /* ativa, job na fila */
                        toggleDemo("LEXICO-CLASSES", "", false);              /* desliga logo em seguida */
                        setTimeout(function () {
                            test("integração-toggle-off-pendente", rendT.length === 0 && led === 0,
                                "renderizados " + JSON.stringify(rendT) + " (deveria ser [])");

                            console.log("-----");
                            console.log("RESULTADO: " + passed + "/" + total + " passando (integração)");
                            if (failures.length) {
                                failures.forEach(function (f) { console.error("FALHA: " + f); });
                                process.exit(1);
                            }
                        }, 200);
                    });
            });
        }, 150);
    }, 200);
})();