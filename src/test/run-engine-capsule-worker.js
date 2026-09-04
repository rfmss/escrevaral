(function () {
    "use strict";

    var fs = require("fs");
    var path = require("path");
    var vm = require("vm");
    var workerPath = path.resolve(__dirname, "../core/engine-capsule-worker.js");
    var workerDir = path.dirname(workerPath);
    var cases = [
        { id: "VERB-MORPH", text: "Nós cantávamos.", script: "engines/morphology.js", message: /cantar/ },
        { id: "REL-CLAUSE", text: "O Brasil, que é gigante, é rico.", script: "engines/relative-clause.js", message: /explicativa/i },
        { id: "DECOLONIAL", text: "A história do escravo naquele período.", script: "engines/decolonial.js", message: /escravo/i },
        { id: "RIMA-METRICA", text: "O amor é fogo que arde sem se ver\né ferida que dói e não se sente", script: "engines/rima-metro.js", message: /verso|rima|métrica/i },
        { id: "VOICE", text: "O tempo não é uma linha. Talvez toda pergunta abra outra pergunta sobre o mesmo mistério.", script: "engines/voz-estilistica.js", message: /voz/i },
        { id: "PONTUACAO", text: "O resultado contudo foi satisfatório. Ela tentou mas não conseguiu.", script: "engines/pontuacao.js", message: /PONT-/ },
        { id: "SINTAXE", text: "A menina que sorria estava feliz.", script: "engines/sintaxe.js", message: /período/i, navigate: true }
    ];
    var total = 0;
    var passed = 0;

    function runCase(item, index) {
        var messages = [];
        var loaded = [];
        var closed = false;
        var context = {
            console: console,
            Date: Date,
            String: String,
            Error: Error,
            Object: Object,
            Array: Array,
            RegExp: RegExp,
            Math: Math,
            JSON: JSON
        };

        context.self = context;
        context.postMessage = function (message) { messages.push(message); };
        context.close = function () { closed = true; };
        context.importScripts = function () {
            for (var i = 0; i < arguments.length; i++) {
                var relative = String(arguments[i]);
                var filename = path.resolve(workerDir, relative);
                loaded.push(relative);
                vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename: filename });
            }
        };

        vm.createContext(context);
        vm.runInContext(fs.readFileSync(workerPath, "utf8"), context, { filename: workerPath });
        context.onmessage({ data: { type: "analyze", requestId: index + 1, engineId: item.id, text: item.text } });

        total++;
        var result = messages[0] || {};
        var findings = result.findings || [];
        var ownEngineLoaded = loaded.indexOf(item.script) !== -1;
        var otherEngines = loaded.filter(function (name) {
            var punctuationHelper = item.id === "PONTUACAO" && name === "engines/relative-clause.js";
            return name.indexOf("engines/") === 0 && name !== item.script && !punctuationHelper;
        });
        var ok = messages.length === 1 && result.type === "result" &&
            result.engineId === item.id && findings.length === 1 &&
            item.message.test(findings[0].message) &&
            closed === (result.total < 2) && ownEngineLoaded &&
            otherEngines.length === 0;

        if (item.navigate) {
            context.onmessage({ data: { type: "next" } });
            ok = ok && messages.length === 2 && messages[1].index === 2 && messages[1].findings.length === 1;
            context.onmessage({ data: { type: "previous" } });
            ok = ok && messages.length === 3 && messages[2].index === 1 && messages[2].findings.length === 1;
        }

        if (!closed) context.onmessage({ data: { type: "close" } });
        ok = ok && closed;

        if (ok) {
            passed++;
            console.log("PASS [" + item.id + "] 1 achado por vez, cápsula descartada");
        } else {
            console.error("FAIL [" + item.id + "] " + JSON.stringify({ result: result, loaded: loaded, closed: closed }));
        }
    }

    for (var i = 0; i < cases.length; i++) runCase(cases[i], i);

    console.log("-----");
    console.log("CÁPSULAS: " + passed + "/" + total + " passando");
    if (passed !== total) process.exit(1);
})();
