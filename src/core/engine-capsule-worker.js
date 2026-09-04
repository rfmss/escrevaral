(function (worker) {
    "use strict";

    /* Alguns dados legados esperam `window`. Dentro desta cápsula isolada, o
     * alias aponta para o próprio Worker e não cria acesso ao DOM. */
    worker.window = worker;

    /* Uma oficina por vez.
     * Os arquivos ficam no cache offline, mas somente a oficina pedida e seus dados
     * entram na RAM. Um achado é mostrado por vez; a cápsula fica viva somente para
     * anterior/próximo e é descartada pela interface ao trocar ou fechar a lente.
     */

    var currentEngine = null;
    var currentFindings = [];
    var currentIndex = 0;
    var currentRequestId = null;
    var currentElapsedMs = 0;

    function load(paths) {
        for (var i = 0; i < paths.length; i++) importScripts(paths[i]);
    }

    function createEngine(engineId) {
        var Encore;

        load(["contracts.js"]);

        if (engineId === "VERB-MORPH") {
            load([
                "services/tokenizer.js",
                "../data/verbos-seed.js",
                "../data/exceptions-seed.js",
                "../data/verb-lemmas-core.js",
                "engines/morphology.js"
            ]);
            Encore = worker.Encore;
            return new Encore.core.engines.MorphologyEngine(
                Encore.data.verbosSeed,
                Encore.data.exceptionsSeed,
                Encore.core.services.Tokenizer,
                Encore.data.verbLemmasCore
            );
        }

        if (engineId === "REL-CLAUSE") {
            load(["engines/relative-clause.js"]);
            return new worker.Encore.core.engines.RelativeClauseEngine();
        }

        if (engineId === "DECOLONIAL") {
            load(["../data/decolonial-data.js", "engines/decolonial.js"]);
            Encore = worker.Encore;
            return new Encore.core.engines.DecolonialEngine(Encore.data.decolonialData);
        }

        if (engineId === "RIMA-METRICA") {
            load(["engines/rima-metro.js"]);
            return new worker.Encore.core.engines.RimaLabEngine();
        }

        if (engineId === "VOICE") {
            load(["engines/voz-estilistica.js"]);
            return new worker.Encore.core.engines.VoiceEngine();
        }

        if (engineId === "PONTUACAO") {
            /* PONT-18/19 usam a leitura relativa como apoio contextual. Ela faz
             * parte desta cápsula e não fica registrada fora dela. */
            load(["engines/relative-clause.js", "engines/pontuacao.js"]);
            Encore = worker.Encore;
            var relative = new Encore.core.engines.RelativeClauseEngine();
            Encore.runtime = {
                byId: function (id) { return id === "REL-CLAUSE" ? relative : null; }
            };
            return new Encore.core.engines.PunctuationEngine();
        }

        if (engineId === "SINTAXE") {
            load([
                "../data/syntax-data.js",
                "../data/norma-data.js",
                "engines/sintaxe.js"
            ]);
            return new worker.Encore.core.engines.SintaxeEngine();
        }

        throw new Error("Engine desconhecida: " + engineId);
    }

    function finish(payload) {
        worker.postMessage(payload);
        worker.close();
    }

    function sendCurrent() {
        var one = currentFindings.length ? [currentFindings[currentIndex]] : [];
        worker.postMessage({
            type: "result",
            requestId: currentRequestId,
            engineId: currentEngine ? currentEngine.id : "",
            findings: one,
            index: currentFindings.length ? currentIndex + 1 : 0,
            total: currentFindings.length,
            elapsedMs: currentElapsedMs
        });
    }

    worker.onmessage = function (event) {
        var request = event.data || {};
        var started = new Date().getTime();
        var snapshot;

        if (request.type === "close") {
            worker.close();
            return;
        }

        if (request.type === "previous" || request.type === "next") {
            if (!currentEngine) return;
            if (request.type === "previous" && currentIndex > 0) currentIndex--;
            if (request.type === "next" && currentIndex + 1 < currentFindings.length) currentIndex++;
            sendCurrent();
            return;
        }

        if (request.type !== "analyze") return;

        try {
            currentEngine = createEngine(String(request.engineId || ""));
            currentRequestId = request.requestId;
            snapshot = new worker.Encore.contracts.LinguisticSnapshot(String(request.text || ""));
            currentEngine.check(snapshot, function (findings) {
                currentFindings = findings || [];
                currentIndex = 0;
                currentElapsedMs = new Date().getTime() - started;
                sendCurrent();
                if (currentFindings.length < 2) worker.close();
            });
        } catch (error) {
            finish({
                type: "error",
                requestId: request.requestId,
                engineId: request.engineId,
                message: error && error.message ? error.message : String(error)
            });
        }
    };
})(typeof self !== "undefined" ? self : this);
