(function (self) {
    "use strict";

    var transfer = null;

    try {
        self.importScripts(
            "../../../src/vendor/js-sha256/sha256.min.js",
            "../../../src/core/services/authorship.js",
            "../../../src/core/services/scrvrl-transport.js"
        );
    } catch (error) {
        self.postMessage({ type: "error", message: "Não foi possível abrir o transporte." });
        return;
    }

    function sendFrame(index) {
        var service = self.Encore.core.services.ScrvrlTransport;
        if (!transfer) throw new Error("transporte-ainda-não-preparado");
        self.postMessage({
            type: "frame",
            index: index,
            number: index + 1,
            total: transfer.total,
            id: transfer.id,
            packageHash: transfer.packageHash,
            frame: service.frameAt(transfer, index)
        });
    }

    self.onmessage = function (event) {
        var request = event.data || {};
        var authorship = self.Encore.core.services.Authorship;
        var transport = self.Encore.core.services.ScrvrlTransport;
        var verification;
        var serialized;
        try {
            if (request.type === "prepare") {
                verification = authorship.verifyPackage(request.packageData, self.sha256);
                if (!verification.valid) throw new Error("Pacote inválido: " + verification.reason);
                serialized = authorship.exportPackage(request.packageData, self.sha256);
                transfer = transport.createTransfer(serialized, self.sha256, request.chunkSize || 96);
                serialized = null;
                self.postMessage({
                    type: "ready",
                    total: transfer.total,
                    id: transfer.id,
                    packageHash: transfer.packageHash
                });
                sendFrame(0);
            } else if (request.type === "frame") {
                sendFrame(Math.max(0, Math.min(transfer.total - 1, Number(request.index) || 0)));
            } else if (request.type === "discard") {
                transfer = null;
                self.close();
            }
        } catch (error) {
            self.postMessage({ type: "error", message: error && error.message ? error.message : String(error) });
        }
    };
}(self));
