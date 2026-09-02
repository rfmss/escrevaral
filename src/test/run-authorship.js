(function () {
    "use strict";

    var sha256 = require("../vendor/js-sha256/sha256.min.js");
    var authorship = require("../core/services/authorship.js");
    var note = { id: "note-test", title: "Uma casa", text: "A casa guardou o que recebeu." };
    var first;
    var second;
    var packageData;
    var result;
    var altered;
    var cases = 0;

    function assert(condition, message) {
        if (!condition) {
            console.error("FAIL: " + message);
            process.exit(1);
        }
        cases += 1;
    }

    first = authorship.buildCapsule({
        noteId: note.id,
        sessionId: "session-a",
        sequence: 1,
        previousHash: "GENESIS",
        title: note.title,
        text: note.text,
        events: [
            { kind: "title-insert", atMs: 120, beforeLength: 0, afterLength: 8, inserted: 8, deleted: 0, forbiddenContent: "Uma casa" },
            { kind: "body-insert", atMs: 940, beforeLength: 0, afterLength: 30, inserted: 30, deleted: 0, forbiddenContent: note.text }
        ],
        deviceTimeMs: 1788364800000,
        elapsedStartMs: 120,
        elapsedEndMs: 1400,
        clockStatus: "unwitnessed"
    }, sha256);

    note.text += " Depois, abriu a janela.";
    second = authorship.buildCapsule({
        noteId: note.id,
        sessionId: "session-a",
        sequence: 2,
        previousHash: first.capsuleHash,
        title: note.title,
        text: note.text,
        events: [
            { kind: "body-insert", atMs: 2200, beforeLength: 30, afterLength: note.text.length, inserted: note.text.length - 30, deleted: 0 }
        ],
        deviceTimeMs: 1788364802200,
        elapsedStartMs: 2200,
        elapsedEndMs: 3300,
        clockStatus: "unwitnessed"
    }, sha256);

    packageData = authorship.createPackage(note, [first, second]);
    result = authorship.verifyPackage(packageData, sha256);
    assert(result.valid === true, "pacote íntegro deve passar");
    assert(result.rootHash === second.capsuleHash, "raiz deve ser a última cápsula");
    assert(JSON.stringify(first).indexOf("Uma casa guardou") === -1, "eventos não devem guardar conteúdo");
    assert(first.process.events[0].forbiddenContent === undefined, "campos não permitidos devem ser removidos");

    altered = JSON.parse(JSON.stringify(packageData));
    altered.note.text += "x";
    assert(authorship.verifyPackage(altered, sha256).reason === "texto-alterado", "um caractere deve invalidar o texto");

    altered = JSON.parse(JSON.stringify(packageData));
    altered.capsules[0].process.events[0].atMs += 1;
    assert(authorship.verifyPackage(altered, sha256).reason === "capsula-alterada", "evento alterado deve invalidar a cápsula");

    altered = JSON.parse(JSON.stringify(packageData));
    altered.capsules[1].previousHash = "quebrado";
    assert(authorship.verifyPackage(altered, sha256).reason === "elo-quebrado", "cadeia quebrada deve falhar");

    assert(authorship.classifyChange(4, 7, false).kind === "insert", "inserção deve ser classificada");
    assert(authorship.classifyChange(7, 4, false).kind === "delete", "remoção deve ser classificada");
    assert(authorship.classifyChange(4, 9, true).kind === "paste", "colagem deve ser classificada");

    console.log("AUTORIA: " + cases + "/" + cases);
}());
