(function (self) {
    "use strict";

    function fail(message) {
        self.postMessage({ type: "error", message: message });
    }

    try {
        self.importScripts(
            "../../../src/core/contracts.js",
            "../../../src/core/services/tokenizer.js",
            "../../../src/data/verbos-seed.js",
            "../../../src/data/exceptions-seed.js",
            "../../../src/core/engines/morphology.js"
        );
    } catch (error) {
        fail("Não foi possível carregar a engine.");
        return;
    }

    self.onmessage = function (event) {
        var request = event.data || {};
        var engine;
        var snapshot;

        if (request.type !== "analyze") return;

        try {
            engine = new self.Encore.core.engines.MorphologyEngine(
                self.Encore.data.verbosSeed,
                self.Encore.data.exceptionsSeed,
                self.Encore.core.services.Tokenizer
            );
            snapshot = new self.Encore.contracts.LinguisticSnapshot(String(request.text || ""));

            engine.check(snapshot, function (findings) {
                self.postMessage({
                    type: "result",
                    engineId: engine.id,
                    version: engine.version,
                    findings: findings || []
                });
                engine = null;
                snapshot = null;
            });
        } catch (error) {
            fail(error && error.message ? error.message : String(error));
        }
    };
}(self));
