(function () {
    "use strict";

    var fs = require("fs");
    var path = require("path");
    var vm = require("vm");
    var sha256 = require("../vendor/js-sha256/sha256.min.js");
    var authorship = require("../core/services/authorship.js");
    var workerPath = path.resolve(__dirname, "../../experiments/piso-2012/js/scrvrl-transport-worker.js");
    var workerDirectory = path.dirname(workerPath);
    var messages = [];
    var closed = false;
    var cases = 0;
    var note = { id: "note-worker", title: "Teste", text: "Texto sintético para o QR." };
    var capsule;
    var packageData;
    var context;
    var ready;
    var warmed;
    var matrix;
    var exported;

    function assert(condition, message) {
        if (!condition) {
            console.error("FAIL: " + message);
            process.exit(1);
        }
        cases += 1;
    }

    capsule = authorship.buildCapsule({
        noteId: note.id,
        sessionId: "session-worker",
        sequence: 1,
        previousHash: "GENESIS",
        title: note.title,
        text: note.text,
        events: [{ kind: "body-insert", atMs: 30, beforeLength: 0, afterLength: 27, inserted: 27, deleted: 0 }],
        deviceTimeMs: 1,
        elapsedStartMs: 0,
        elapsedEndMs: 30,
        clockStatus: "unwitnessed"
    }, sha256);
    packageData = authorship.createPackage(note, [capsule]);

    context = {
        console: console,
        navigator: { userAgent: "iPad; CPU OS 9_3_5 like Mac OS X" },
        encodeURI: encodeURI,
        Math: Math,
        Date: Date,
        JSON: JSON,
        Array: Array,
        String: String,
        Number: Number,
        Object: Object,
        RegExp: RegExp,
        Error: Error,
        isFinite: isFinite
    };
    context.self = context;
    context.postMessage = function (message) { messages.push(message); };
    context.close = function () { closed = true; };
    vm.createContext(context);
    context.importScripts = function () {
        var i;
        var filename;
        for (i = 0; i < arguments.length; i += 1) {
            filename = path.resolve(workerDirectory, arguments[i]);
            vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename: filename });
        }
    };
    vm.runInContext(fs.readFileSync(workerPath, "utf8"), context, { filename: workerPath });

    context.onmessage({ data: { type: "prepare", packageData: packageData, chunkSize: 72 } });
    ready = messages.filter(function (message) { return message.type === "ready"; })[0];
    warmed = messages.filter(function (message) { return message.type === "warmed"; })[0];
    assert(!!ready && ready.total > 1, "Worker deve preparar transporte fragmentado");
    assert(!!warmed && warmed.id === ready.id, "primeira matriz deve aquecer fora da interface");
    assert(messages[0].type === "ready" && messages[1].type === "warmed", "aquecimento não deve despejar todos os quadros");

    context.onmessage({ data: { type: "frame", index: 0 } });
    matrix = messages.filter(function (message) { return message.type === "matrix"; })[0];
    assert(!!matrix && matrix.index === 0, "Worker deve devolver a matriz solicitada");
    assert(matrix.rows.length === matrix.size && matrix.size > 20, "matriz deve ser quadrada");
    assert(matrix.rows.join("").replace(/[01]/g, "") === "", "matriz deve conter somente módulos claros e escuros");
    assert(!Object.prototype.hasOwnProperty.call(matrix, "frame"), "texto do quadro não deve voltar à thread visual");

    context.onmessage({ data: { type: "export" } });
    exported = messages.filter(function (message) { return message.type === "exported"; })[0];
    assert(exported.serialized === authorship.exportPackage(packageData, sha256), "exportação aquecida deve permanecer exata");

    context.onmessage({ data: { type: "discard" } });
    assert(closed === true, "Worker deve encerrar quando descartado");

    console.log("WORKER QR SCRVRL: " + cases + "/" + cases);
}());
