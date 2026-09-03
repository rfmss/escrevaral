(function (self) {
    "use strict";

    var transfer = null;
    var matrixCache = {};

    /* qrcode.js escolhe o desenhador ao carregar. No Worker não há DOM;
     * este documento mínimo permite usar apenas o cálculo da matriz. */
    self.document = {
        documentElement: { tagName: "html" },
        getElementById: function () { return null; }
    };

    try {
        self.importScripts(
            "../../../src/vendor/js-sha256/sha256.min.js",
            "../../../src/core/services/authorship.js",
            "../../../src/core/services/scrvrl-transport.js",
            "../../../src/vendor/qrcodejs/qrcode.min.js"
        );
    } catch (error) {
        self.postMessage({ type: "error", message: "Não foi possível abrir o transporte." });
        return;
    }

    function buildMatrix(index) {
        var service = self.Encore.core.services.ScrvrlTransport;
        var frame;
        var target = { childNodes: [], style: {}, title: "" };
        var qr;
        var model;
        var rows = [];
        var row;
        var y;
        var x;
        if (!transfer) throw new Error("transporte-ainda-não-preparado");
        frame = service.frameAt(transfer, index);
        qr = new self.QRCode(target, {
            width: 1,
            height: 1,
            correctLevel: self.QRCode.CorrectLevel.Q
        });
        qr._oDrawing = { draw: function () {}, clear: function () {} };
        qr.makeCode(frame);
        model = qr._oQRCode;
        for (y = 0; y < model.getModuleCount(); y += 1) {
            row = [];
            for (x = 0; x < model.getModuleCount(); x += 1) {
                row.push(model.isDark(y, x) ? "1" : "0");
            }
            rows.push(row.join(""));
        }
        qr._oQRCode = null;
        return {
            index: index,
            number: index + 1,
            total: transfer.total,
            size: rows.length,
            rows: rows
        };
    }

    function matrixAt(index) {
        var key = String(index);
        if (!matrixCache[key]) matrixCache[key] = buildMatrix(index);
        return matrixCache[key];
    }

    function trimCache(index) {
        var allowed = {};
        var key;
        if (!transfer) return;
        allowed[String(index)] = true;
        allowed[String((index + 1) % transfer.total)] = true;
        allowed[String((index + transfer.total - 1) % transfer.total)] = true;
        for (key in matrixCache) {
            if (Object.prototype.hasOwnProperty.call(matrixCache, key) && !allowed[key]) {
                delete matrixCache[key];
            }
        }
    }

    function sendMatrix(index) {
        var matrix;
        var next;
        if (!transfer) throw new Error("transporte-ainda-não-preparado");
        matrix = matrixAt(index);
        self.postMessage({
            type: "matrix",
            index: matrix.index,
            number: matrix.number,
            total: matrix.total,
            size: matrix.size,
            rows: matrix.rows
        });
        next = (index + 1) % transfer.total;
        matrixAt(next);
        trimCache(index);
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
                transfer = transport.createTransfer(serialized, self.sha256, request.chunkSize || 72);
                serialized = null;
                matrixCache = {};
                self.postMessage({
                    type: "ready",
                    total: transfer.total,
                    id: transfer.id,
                    packageHash: transfer.packageHash
                });
                matrixAt(0);
                self.postMessage({ type: "warmed", total: transfer.total, id: transfer.id });
            } else if (request.type === "frame") {
                sendMatrix(Math.max(0, Math.min(transfer.total - 1, Number(request.index) || 0)));
            } else if (request.type === "export") {
                serialized = transport.base64Decode(transfer.encoded.slice(65));
                self.postMessage({ type: "exported", serialized: serialized });
                serialized = null;
            } else if (request.type === "discard") {
                transfer = null;
                matrixCache = {};
                self.close();
            }
        } catch (error) {
            self.postMessage({ type: "error", message: error && error.message ? error.message : String(error) });
        }
    };
}(self));
