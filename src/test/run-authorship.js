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
    var serialized;
    var imported;
    var normalizedA;
    var normalizedB;
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
    assert(first.document.normalizedTextHash === sha256(authorship.normalizeText("A casa guardou o que recebeu.")), "hash normalizado deve ser registrado");

    altered = JSON.parse(JSON.stringify(packageData));
    altered.note.text += "x";
    assert(authorship.verifyPackage(altered, sha256).reason === "texto-alterado", "um caractere deve invalidar o texto");

    altered = JSON.parse(JSON.stringify(packageData));
    altered.capsules[0].process.events[0].atMs += 1;
    assert(authorship.verifyPackage(altered, sha256).reason === "capsula-alterada", "evento alterado deve invalidar a cápsula");

    altered = JSON.parse(JSON.stringify(packageData));
    altered.capsules[1].previousHash = "quebrado";
    assert(authorship.verifyPackage(altered, sha256).reason === "elo-quebrado", "cadeia quebrada deve falhar");

    altered = JSON.parse(JSON.stringify(packageData));
    altered.note.id = "outra-nota";
    assert(authorship.verifyPackage(altered, sha256).reason === "nota-incompativel", "identificador trocado deve falhar");

    assert(authorship.classifyChange(4, 7, false).kind === "insert", "inserção deve ser classificada");
    assert(authorship.classifyChange(7, 4, false).kind === "delete", "remoção deve ser classificada");
    assert(authorship.classifyChange(4, 9, true).kind === "paste", "colagem deve ser classificada");

    normalizedA = authorship.normalizeText("linha um\r\nlinha dois\r");
    normalizedB = authorship.normalizeText("linha um\nlinha dois\n");
    assert(normalizedA === normalizedB, "normalização deve unificar finais de linha");
    assert(sha256("linha um\r\nlinha dois\r") !== sha256("linha um\nlinha dois\n"), "hash exato deve preservar diferença de bytes");
    assert(sha256(normalizedA) === sha256(normalizedB), "hash normalizado deve atravessar sistemas de linha");

    serialized = authorship.exportPackage(packageData, sha256);
    assert(serialized === authorship.exportPackage(packageData, sha256), "exportação deve ser determinística");
    imported = authorship.importPackage(serialized, sha256);
    assert(imported.valid === true && imported.rootHash === second.capsuleHash, "pacote exportado deve importar íntegro");
    assert(imported.packageData.note.text === note.text, "importação deve recuperar o texto exato");
    assert(authorship.importPackage("{quebrado", sha256).reason === "json-invalido", "JSON inválido deve ser recusado");
    assert(authorship.importPackage(serialized.replace("abriu", "abriuX"), sha256).valid === false, "pacote alterado no transporte deve ser recusado");

    console.log("AUTORIA: " + cases + "/" + cases);
}());
