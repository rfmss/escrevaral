(function (self) {
    "use strict";

    try {
        self.importScripts(
            "../../../src/vendor/js-sha256/sha256.min.js",
            "../../../src/core/services/authorship.js"
        );
    } catch (error) {
        self.postMessage({ type: "error", message: "Não foi possível carregar a prova de autoria." });
        return;
    }

    self.onmessage = function (event) {
        var request = event.data || {};
        var service = self.Encore.core.services.Authorship;
        var packageData;
        var capsule;
        var result;
        try {
            if (request.type === "seal") {
                packageData = request.packageData || service.createPackage(request.note, []);
                capsule = service.buildCapsule(request.capsule, self.sha256);
                packageData.note = request.note;
                packageData.capsules.push(capsule);
                result = service.verifyPackage(packageData, self.sha256);
                self.postMessage({ type: "sealed", packageData: packageData, result: result });
                packageData = null;
                capsule = null;
            } else if (request.type === "verify") {
                result = service.verifyPackage(request.packageData, self.sha256);
                self.postMessage({ type: "verified", result: result, purpose: request.purpose || "normal" });
            }
        } catch (error) {
            self.postMessage({ type: "error", message: error && error.message ? error.message : String(error) });
        }
    };
}(self));
