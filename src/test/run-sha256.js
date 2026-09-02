(function () {
    "use strict";

    var sha256 = require("../vendor/js-sha256/sha256.min.js");
    var vectors = [
        { input: "", expected: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
        { input: "abc", expected: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad" },
        { input: "Escrevaral — ação", expected: "ecc5ef514d65a7503dadbd14893ea2e3d741d8d84785dc3f18e6bce2fac2e00a" }
    ];
    var passed = 0;

    vectors.forEach(function (vector) {
        var actual = sha256(vector.input);
        if (actual !== vector.expected) {
            console.error("FAIL SHA-256: " + vector.input + " -> " + actual);
            process.exit(1);
        }
        passed += 1;
    });
    console.log("SHA-256: " + passed + "/" + vectors.length);
}());
