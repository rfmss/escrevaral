(function (global) {
    "use strict";

    /* Escrevaral-Encore — Runtime de engines (ES5, baixa RAM).
     * Princípio "um engine por vez" (roletagem): nunca roda todas as engines
     * simultaneamente. Este runtime legado serializa chamadas, mas não promete
     * isolamento da thread principal. A interface usa uma cápsula Worker descartável.
     */

    var Encore = global.Encore = global.Encore || {};

    function EngineRuntime() {
        this.engines = [];
        this._queue = [];
        this._running = false;
    }

    EngineRuntime.prototype.register = function (engine) {
        if (!engine || !engine.id) return;
        this.engines.push(engine);
    };

    EngineRuntime.prototype.byId = function (id) {
        for (var i = 0; i < this.engines.length; i++) {
            if (this.engines[i].id === id) return this.engines[i];
        }
        return null;
    };

    /* Roda UM engine específico sobre o texto. */
    EngineRuntime.prototype.runOne = function (engineId, text, done) {
        var engine = this.byId(engineId);
        if (!engine) { done([]); return; }
        var snapshot = new Encore.contracts.LinguisticSnapshot(text);
        engine.check(snapshot, done);
    };

    /* Fila serializada: garante que nunca duas análises rodem ao mesmo tempo. */
    EngineRuntime.prototype.enqueue = function (engineId, text, done) {
        var self = this;
        self._queue.push({ engineId: engineId, text: text, done: done });
        self._pump();
    };

    EngineRuntime.prototype._pump = function () {
        var self = this;
        if (self._running) return;
        if (!self._queue.length) return;
        self._running = true;
        var job = self._queue.shift();
        self.runOne(job.engineId, job.text, function (findings) {
            job.done(findings);
            self._running = false;
            self._pump();
        });
    };

    Encore.runtime = new EngineRuntime();
})(typeof global !== "undefined" ? global : window);
