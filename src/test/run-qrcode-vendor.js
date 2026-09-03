(function () {
    "use strict";

    var fs = require("fs");
    var vm = require("vm");
    var sha256 = require("../vendor/js-sha256/sha256.min.js");
    var transport = require("../core/services/scrvrl-transport.js");
    var source = fs.readFileSync(__dirname + "/../vendor/qrcodejs/qrcode.min.js", "utf8");
    var target = { childNodes: [], style: {}, title: "" };
    var context;
    var transfer;
    var frame;
    var qr;
    var cases = 0;

    function assert(condition, message) {
        if (!condition) {
            console.error("FAIL: " + message);
            process.exit(1);
        }
        cases += 1;
    }

    Object.defineProperty(target, "innerHTML", {
        get: function () { return this.markup || ""; },
        set: function (value) {
            this.markup = value;
            this.childNodes = value ? [{ offsetWidth: 260, offsetHeight: 260, style: {} }] : [];
        }
    });

    context = {
        navigator: { userAgent: "iPad; CPU OS 9_3_5 like Mac OS X" },
        document: {
            documentElement: { tagName: "html" },
            getElementById: function () { return target; }
        },
        encodeURI: encodeURI,
        Math: Math,
        Array: Array,
        String: String,
        Error: Error
    };
    vm.runInNewContext(source, context);
    assert(typeof context.QRCode === "function", "biblioteca deve expor QRCode");

    transfer = transport.createTransfer('{"format":"scrvrl","texto":"ação"}', sha256, 96);
    frame = transport.frameAt(transfer, 0);
    qr = new context.QRCode(target, {
        width: 260,
        height: 260,
        correctLevel: context.QRCode.CorrectLevel.Q
    });
    qr.makeCode(frame);
    assert(target.markup.indexOf("<table") !== -1, "fallback sem canvas deve desenhar tabela");
    assert(target.title === frame, "quadro S2 deve chegar inteiro ao gerador");

    console.log("QRCODE VENDOR: " + cases + "/" + cases);
}());
