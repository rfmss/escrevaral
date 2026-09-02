(function () {
    "use strict";

    var sha256 = require("../vendor/js-sha256/sha256.min.js");
    var transport = require("../core/services/scrvrl-transport.js");
    var source = '{"format":"scrvrl","texto":"Ação, café e céu. 🌱","versão":1}';
    var frames = transport.buildFrames(source, sha256, 32);
    var receiver = transport.createReceiver(sha256);
    var result;
    var state;
    var resumed;
    var other;
    var altered;
    var parsed;
    var conflicting;
    var lightTransfer;
    var recomputed;
    var cases = 0;
    var i;

    function assert(condition, message) {
        if (!condition) {
            console.error("FAIL: " + message);
            process.exit(1);
        }
        cases += 1;
    }

    assert(transport.base64Decode(transport.base64Encode(source)) === source, "UTF-8 deve atravessar base64 sem alteração");
    assert(transport.protocol === "S2", "emissor deve usar o protocolo aliviado S2");
    assert(frames.length > 1, "pacote deve ser dividido");
    assert(transport.parseFrame(frames[0]).valid === true, "bloco gerado deve ser válido");
    assert(transport.parseFrame("X1|quebrado").reason === "protocolo-invalido", "protocolo desconhecido deve falhar");

    for (i = frames.length - 1; i >= 0; i -= 1) result = receiver.add(frames[i]);
    assert(result.complete === true, "blocos fora de ordem devem completar");
    assert(result.serialized === source, "remontagem deve ser exata");
    assert(result.packageHash === sha256(source), "hash final deve corresponder ao pacote");

    result = receiver.add(frames[0]);
    assert(result.valid === true && result.duplicate === true, "bloco repetido deve ser ignorado");

    receiver = transport.createReceiver(sha256);
    result = receiver.add(frames[0]);
    assert(result.accepted === true && result.received === 1, "primeiro bloco deve ser aceito");
    assert(result.missing.length === frames.length - 1, "receptor deve informar lacunas");
    state = receiver.exportState();
    resumed = transport.createReceiver(sha256, state);
    for (i = 1; i < frames.length; i += 1) result = resumed.add(frames[i]);
    assert(result.complete === true && result.serialized === source, "sessão pausada deve retomar");

    other = transport.buildFrames(source + " outro", sha256, 32);
    receiver = transport.createReceiver(sha256);
    receiver.add(frames[0]);
    assert(receiver.add(other[1]).reason === "transferencia-misturada", "pacotes diferentes não podem se misturar");

    altered = frames[0].slice(0, -1) + (frames[0].slice(-1) === "A" ? "B" : "A");
    assert(transport.parseFrame(altered).reason === "bloco-alterado", "checksum deve pegar alteração local");

    parsed = transport.parseFrame(frames[0]);
    conflicting = [
        parsed.protocol,
        parsed.id,
        String(parsed.index),
        String(parsed.total),
        transport.crc32("A" + parsed.data.slice(1)),
        "A" + parsed.data.slice(1)
    ].join("|");
    receiver = transport.createReceiver(sha256);
    receiver.add(frames[0]);
    assert(receiver.add(conflicting).reason === "bloco-conflitante", "duplicata divergente deve ser recusada");

    recomputed = frames.slice(0);
    parsed = transport.parseFrame(recomputed[recomputed.length - 1]);
    recomputed[recomputed.length - 1] = [
        parsed.protocol,
        parsed.id,
        String(parsed.index),
        String(parsed.total),
        transport.crc32(parsed.data.slice(0, -1) + "A"),
        parsed.data.slice(0, -1) + "A"
    ].join("|");
    receiver = transport.createReceiver(sha256);
    for (i = 0; i < recomputed.length; i += 1) result = receiver.add(recomputed[i]);
    assert(result.reason === "pacote-alterado", "SHA-256 final deve pegar bloco adulterado com CRC recalculado");

    lightTransfer = transport.createTransfer(new Array(4001).join("x"), sha256, 72);
    assert(transport.frameAt(lightTransfer, 0).length <= 102, "quadro S2 deve respeitar o orçamento físico");

    assert(function () {
        try { transport.createTransfer(source, sha256, 12); } catch (error) { return error.message === "tamanho-de-bloco-invalido"; }
        return false;
    }(), "bloco pequeno demais deve ser recusado");

    console.log("TRANSPORTE SCRVRL: " + cases + "/" + cases);
}());
